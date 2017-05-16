// WndShadow.h : header file
//
// Version 0.5
//
// Copyright (c) 2006-2007 Mingliang Zhu, All Rights Reserved.
//
// mailto:perry@live.com
//
//
// This source file may be redistributed unmodified by any means PROVIDING 
// it is NOT sold for profit without the authors expressed written 
// consent, and providing that this notice and the author's name and all 
// copyright notices remain intact. This software is by no means to be 
// included as part of any third party components library, or as part any
// development solution that offers MFC extensions that are sold for profit. 
// 
// If the source code is used in any commercial applications then a statement 
// along the lines of:
// "Portions Copyright (c) 2006-2007 Mingliang Zhu"
// must be included in the "Startup Banner", "About Box" or "Printed
// Documentation". This software is provided "as is" without express or
// implied warranty. Use it at your own risk! The author accepts no 
// liability for any damage/loss of business that this product may cause.
//
/////////////////////////////////////////////////////////////////////////////
//****************************************************************************

//****************************************************************************
// Update history--
//
// Version 0.5, 2014-03-20 (CASERIS, Uwe Riegel <uwe.riegel@caseris.de>)
//    -Eliminated CWnd (CWnd::GetStyleEx replaced with GetWindowLong(hwnd, GWL_EXSTYLE))
//	  -OnlyRectangularRegions Mode: WPF-Windows don't send enough WM_PAINT msgs, so shadow is updated on WM_SIZE 
//	  -ParentWindowProcedure prepared for use in WPF-Windows
//	  -Getter for m_HWND
//
// Version 0.4, 2013-02-14 (CASERIS, Ingo Heeskens <ingo.heeskens@caseris.de>)
//    -Fixed a bug, when parent window was switched from minimized to maxmized
//    -Show shadow for borderless windows even with aero
//    -Make 64bit compatible
//    -Fixed z-order bug
//    -Fixed codeproject comment (Start point not found)
//
// Version 0.3, 2007-06-14
//    -The shadow is made Windows Vista Aero awareness.
//    -Fixed a bug that causes the shadow to appear abnormally on Windows Vista.
//    -Fixed a bug that causes the shadow to appear abnormally if parent window
//     is initially minimized or maximized
//
// Version 0.2, 2006-11-23
//    -Fix a critical issue that may make the shadow fail to work under certain
//     conditions, e.g., on Win2000, on WinXP or Win2003 without the visual
//     theme enabled, or when the frame window does not have a caption bar.
//
// Version 0.1, 2006-11-10
//    -First release
//****************************************************************************

#include "StdAfx.h"
#include "WndShadow.h"
#include "math.h"
#include "crtdbg.h"

// Some extra work to make this work in VC++ 6.0

// walk around the for iterator scope bug of VC++6.0
#ifdef _MSC_VER
#if _MSC_VER == 1200
#define for if(false);else for
#endif
#endif

// Some definitions for VC++ 6.0 without newest SDK
#ifndef WS_EX_LAYERED
#define WS_EX_LAYERED 0x00080000
#endif

#ifndef AC_SRC_ALPHA
#define AC_SRC_ALPHA 0x01
#endif

#ifndef ULW_ALPHA
#define ULW_ALPHA 0x00000002
#endif

// Vista aero related message
#ifndef WM_DWMCOMPOSITIONCHANGED
#define WM_DWMCOMPOSITIONCHANGED 0x031E
#endif

CWndShadow::pfnUpdateLayeredWindow CWndShadow::s_UpdateLayeredWindow = NULL;

bool CWndShadow::s_bVista = false;
CWndShadow::pfnDwmIsCompositionEnabled CWndShadow::s_DwmIsCompositionEnabled = NULL;

const WCHAR *strWndClassName = L"CASERIS::ShadowWindow";

HINSTANCE CWndShadow::s_hInstance = (HINSTANCE)INVALID_HANDLE_VALUE;

#pragma warning(push)
#pragma warning(disable:4786)
std::map<HWND, CWndShadow *> CWndShadow::s_Shadowmap;
#pragma warning(pop) 

CWndShadow::CWndShadow(void)
	: m_hWnd((HWND)INVALID_HANDLE_VALUE)
	, m_OriParentProc(NULL)
	, m_nDarkness(150)
	, m_nSharpness(5)
	, m_nSize(3)
	, m_nxOffset(1)
	, m_nyOffset(1)
	, m_Color(RGB(0, 0, 0))
	, m_WndSize(0)
	, m_bUpdate(false)
	, m_OnlyRectangularRegions(false)
{
}

CWndShadow::~CWndShadow(void)
{
}

bool CWndShadow::Initialize(HINSTANCE hInstance)
{
	// Should not initiate more than once
	if (NULL != s_UpdateLayeredWindow)
		return false;

	HMODULE hSysDll = LoadLibrary(L"USER32.DLL");
	s_UpdateLayeredWindow =
		(pfnUpdateLayeredWindow)GetProcAddress(hSysDll,
		"UpdateLayeredWindow");

	// If the import did not succeed, probably layered window is not supported by current OS
	if (NULL == s_UpdateLayeredWindow)
		return false;

	hSysDll = LoadLibrary(L"dwmapi.dll");
	if (hSysDll)	// Loaded dwmapi.dll succefull, must on Vista or above
	{
		s_bVista = true;
		s_DwmIsCompositionEnabled =
			(pfnDwmIsCompositionEnabled)GetProcAddress(hSysDll,
			"DwmIsCompositionEnabled");
	}

	// Store the instance handle
	s_hInstance = hInstance;

	// Register window class for shadow window
	WNDCLASSEX wcex;

	memset(&wcex, 0, sizeof(wcex));

	wcex.cbSize = sizeof(WNDCLASSEX);
	wcex.style = CS_HREDRAW | CS_VREDRAW;
	wcex.lpfnWndProc = CWndShadow::WndProc;
	wcex.cbClsExtra = 0;
	wcex.cbWndExtra = 0;
	wcex.hInstance = hInstance;
	wcex.hIcon = NULL;
	wcex.hCursor = LoadCursor(NULL, IDC_ARROW);
	wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
	wcex.lpszMenuName = NULL;
	wcex.lpszClassName = strWndClassName;
	wcex.hIconSm = NULL;

	RegisterClassEx(&wcex);

	return true;
}

void CWndShadow::Create(HWND hParentWnd)
{
	// Do nothing if the system does not support layered windows
	if (NULL == s_UpdateLayeredWindow)
		return;

	// Already initialized
	_ASSERT(s_hInstance != INVALID_HANDLE_VALUE);

	// Add parent window - shadow pair to the map
	_ASSERT(s_Shadowmap.find(hParentWnd) == s_Shadowmap.end());	// Only one shadow for each window
	s_Shadowmap[hParentWnd] = this;

	// Create the shadow window
	m_hWnd = CreateWindowEx(WS_EX_LAYERED | WS_EX_TRANSPARENT, strWndClassName, NULL,
		/*WS_VISIBLE | WS_CAPTION | */WS_POPUPWINDOW,
		CW_USEDEFAULT, 0, 0, 0, hParentWnd, NULL, s_hInstance, NULL);

	// Determine the initial show state of shadow according to Aero
	m_Status = SS_ENABLED;	// Enabled by default
	BOOL bAero = FALSE;
	if (s_DwmIsCompositionEnabled)
		s_DwmIsCompositionEnabled(&bAero);
	if (bAero)
		m_Status |= SS_DISABLEDBYAERO;

	Show(hParentWnd);	// Show the shadow if conditions are met
	ConnectOriginalParentProcedure(hParentWnd);
}

void CWndShadow::Destroy()
{
	if (m_hWnd == nullptr)
		return;
	HWND parent = GetParent(m_hWnd);
	DestroyWindow(m_hWnd);
	s_Shadowmap.erase(parent);	// Remove this window and shadow from the map
}

void CWndShadow::SetOnlyRectangularRegions(bool set)
{
	m_OnlyRectangularRegions = set;
}

HWND CWndShadow::GetHWND()
{
	return m_hWnd;
}

void CWndShadow::ConnectOriginalParentProcedure(HWND hwndParent)
{
	// Replace the original WndProc of parent window to steal messages
	m_OriParentProc = GetWindowLongPtr(hwndParent, GWLP_WNDPROC);

#pragma warning(disable: 4311)	// temporrarily disable the type_cast warning in Win32
	SetWindowLongPtr(hwndParent, GWLP_WNDPROC, (LONG_PTR)ParentProc);
#pragma warning(default: 4311)
}

LRESULT CALLBACK CWndShadow::WndProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	HWND hWndParent = GetParent(hwnd);
	_ASSERT(s_Shadowmap.find(hWndParent) != s_Shadowmap.end());	// Shadow must have been attached

	CWndShadow *pThis = s_Shadowmap[hWndParent];

	switch (uMsg)
	{
	case WM_SHOWWINDOW:
		// only react on ShowWindow if we called it
		switch (lParam)
		{
		case 0:
			// If lParam is zero, the message was sent because of a call to the ShowWindow function
			break;

		case SW_PARENTCLOSING:
		case SW_OTHERZOOM:
		case SW_PARENTOPENING:
		case SW_OTHERUNZOOM:
		default:
			return 0;
		}
		break;
	}

	// Call the default(original) window procedure for other messages or messages processed but not returned
	return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

LRESULT CALLBACK CWndShadow::ParentProc(HWND hwndParent, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	_ASSERT(s_Shadowmap.find(hwndParent) != s_Shadowmap.end());	// Shadow must have been attached

	CWndShadow *pThis = s_Shadowmap[hwndParent];
	bool isHandled;
	LRESULT result = pThis->ParentProcedure(hwndParent, uMsg, wParam, lParam, isHandled);
	if (!isHandled)
		// Call the default(original) window procedure for other messages or messages processed but not returned
		return pThis->CallOriginalParentProcedure(hwndParent, uMsg, wParam, lParam);
	else
		return result;
}

LRESULT CWndShadow::ParentProcedure(HWND hwndParent, UINT uMsg, WPARAM wParam, LPARAM lParam, bool& isHandled)
{
	isHandled = false;
	switch (uMsg)
	{
	case WM_MOVE:
		if (m_Status & SS_VISABLE)
		{
			RECT WndRect;
			GetWindowRect(hwndParent, &WndRect);
			SetWindowPos(m_hWnd, 0,
				WndRect.left + m_nxOffset - m_nSize, WndRect.top + m_nyOffset - m_nSize,
				0, 0, SWP_NOSIZE | SWP_NOACTIVATE | SWP_NOZORDER);
		}
		break;

	case WM_SIZE:
		if (m_Status & SS_ENABLED)
		{
			if (SIZE_MAXIMIZED == wParam || SIZE_MINIMIZED == wParam || IsDisabledByAero(hwndParent))
			{
				ShowWindow(m_hWnd, SW_HIDE);
				m_Status &= ~SS_VISABLE;
			}
			else
			{
				LONG lParentStyle = GetWindowLong(hwndParent, GWL_STYLE);
				if (WS_VISIBLE & lParentStyle)	// Parent may be resized even if invisible
				{
					m_Status |= SS_PARENTVISIBLE;
					if (!(m_Status & SS_VISABLE))
					{
						m_Status |= SS_VISABLE;
						// Update before show, because if not, restore from maximized will
						// see a glance misplaced shadow
						Update(hwndParent);
						ShowWindow(m_hWnd, SW_SHOWNA);
						// If restore from minimized, the window region will not be updated until WM_PAINT:(
						m_bUpdate = true;
					}
					// Awful! It seems that if the window size was not decreased
					// the window region would never be updated until WM_PAINT was sent.
					// So do not Update() until next WM_PAINT is received in this case
					else if (LOWORD(lParam) > LOWORD(m_WndSize) || HIWORD(lParam) > HIWORD(m_WndSize))
					{
						m_bUpdate = true;
						if (m_OnlyRectangularRegions)
							Update(hwndParent);
					}
					else
					{
						Update(hwndParent);
					}
				}

			}
			m_WndSize = lParam;
		}
		break;

	case WM_PAINT:
	{
		if (m_bUpdate)
		{
			Update(hwndParent);
			m_bUpdate = false;
		}
		//return hr;
		break;
	}

		// In some cases of sizing, the up-right corner of the parent window region would not be properly updated
		// Update() again when sizing is finished
	case WM_EXITSIZEMOVE:
		if (m_Status & SS_VISABLE)
		{
			Update(hwndParent);
		}
		break;

	case WM_SHOWWINDOW:
		if (m_Status & SS_ENABLED)
		{
			LRESULT lResult = CallOriginalParentProcedure(hwndParent, uMsg, wParam, lParam);
			isHandled = true;
			if (!wParam || IsDisabledByAero(hwndParent))	// the window is being hidden
			{
				ShowWindow(m_hWnd, SW_HIDE);
				m_Status &= ~(SS_VISABLE | SS_PARENTVISIBLE);
			}
			else
			{
				m_bUpdate = true;
				Show(hwndParent);
			}
			return lResult;
		}
		break;

	case WM_WINDOWPOSCHANGED:
	case WM_WINDOWPOSCHANGING:
		if (m_Status & SS_ENABLED)
		{
			LRESULT lResult = CallOriginalParentProcedure(hwndParent, uMsg, wParam, lParam);
			isHandled = true;
			WINDOWPOS* pWinPos = reinterpret_cast<WINDOWPOS*>(lParam);
			if (nullptr != pWinPos)
			{
				if ((pWinPos->flags & SWP_HIDEWINDOW) || IsDisabledByAero(hwndParent))	// the window is being hidden
				{
					ShowWindow(m_hWnd, SW_HIDE);
					m_Status &= ~(SS_VISABLE | SS_PARENTVISIBLE);
				}
				else
				{
					if (pWinPos->flags & SWP_SHOWWINDOW)
					{
						m_bUpdate = true;
						Show(hwndParent);
					}

					if (!(pWinPos->flags & SWP_NOZORDER) && (GetWindowLong(hwndParent, GWL_EXSTYLE) & WS_EX_TOPMOST))
					{
						HWND hWndPrev = GetWindow(hwndParent, GW_HWNDPREV);
						if (hwndParent != hWndPrev)
							SetWindowPos(m_hWnd, hwndParent, 0, 0, 0, 0, SWP_NOACTIVATE | SWP_NOSIZE | SWP_NOMOVE | SWP_NOSENDCHANGING);
					}
				}
			}
			return lResult;
		}
		break;

	case WM_DESTROY:
		DestroyWindow(m_hWnd);	// Destroy the shadow
		break;

	case WM_NCDESTROY:
		s_Shadowmap.erase(hwndParent);	// Remove this window and shadow from the map
		break;

	case WM_DWMCOMPOSITIONCHANGED:
	{
		BOOL bAero = FALSE;
		if (s_DwmIsCompositionEnabled)	// "if" is actually not necessary here :P
			s_DwmIsCompositionEnabled(&bAero);
		if (bAero)
			m_Status |= SS_DISABLEDBYAERO;
		else
			m_Status &= ~SS_DISABLEDBYAERO;

		Show(hwndParent);

		// IH: Ansonsten wird das Chatfenster im CTI Client schwarz...
		RedrawWindow(hwndParent, nullptr, NULL, RDW_INVALIDATE | RDW_ERASE | RDW_UPDATENOW);
	}
		break;
	}
	return 0;
}

LRESULT CWndShadow::CallOriginalParentProcedure(HWND hwndParent, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
#pragma warning(disable: 4312)	// temporarily disable the type_cast warning in Win32
	// Call the default(original) window procedure for other messages or messages processed but not returned
	WNDPROC pDefProc = (WNDPROC)m_OriParentProc;
#pragma warning(default: 4312)

	return pDefProc(hwndParent, uMsg, wParam, lParam);
}

void CWndShadow::Update(HWND hParent)
{
	//int ShadSize = 5;
	//int Multi = 100 / ShadSize;

	RECT WndRect;
	GetWindowRect(hParent, &WndRect);
	int nShadWndWid = WndRect.right - WndRect.left + m_nSize * 2;
	int nShadWndHei = WndRect.bottom - WndRect.top + m_nSize * 2;

	// Create the alpha blending bitmap
	BITMAPINFO bmi;        // bitmap header

	ZeroMemory(&bmi, sizeof(BITMAPINFO));
	bmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
	bmi.bmiHeader.biWidth = nShadWndWid;
	bmi.bmiHeader.biHeight = nShadWndHei;
	bmi.bmiHeader.biPlanes = 1;
	bmi.bmiHeader.biBitCount = 32;         // four 8-bit components
	bmi.bmiHeader.biCompression = BI_RGB;
	bmi.bmiHeader.biSizeImage = nShadWndWid * nShadWndHei * 4;

	BYTE *pvBits;          // pointer to DIB section
	HBITMAP hbitmap = CreateDIBSection(NULL, &bmi, DIB_RGB_COLORS, (void **)&pvBits, NULL, 0);

	ZeroMemory(pvBits, bmi.bmiHeader.biSizeImage);
	MakeShadow((UINT32 *)pvBits, hParent, &WndRect);

	HDC hMemDC = CreateCompatibleDC(NULL);
	HBITMAP hOriBmp = (HBITMAP)SelectObject(hMemDC, hbitmap);

	POINT ptDst = { WndRect.left + m_nxOffset - m_nSize, WndRect.top + m_nyOffset - m_nSize };
	POINT ptSrc = { 0, 0 };
	SIZE WndSize = { nShadWndWid, nShadWndHei };
	BLENDFUNCTION blendPixelFunction = { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA };

	MoveWindow(m_hWnd, ptDst.x, ptDst.y, nShadWndWid, nShadWndHei, FALSE);

	BOOL bRet = s_UpdateLayeredWindow(m_hWnd, NULL, &ptDst, &WndSize, hMemDC,
		&ptSrc, 0, &blendPixelFunction, ULW_ALPHA);

	_ASSERT(bRet); // something was wrong....

	// Delete used resources
	SelectObject(hMemDC, hOriBmp);
	DeleteObject(hbitmap);
	DeleteDC(hMemDC);

}

void CWndShadow::MakeShadow(UINT32 *pShadBits, HWND hParent, RECT *rcParent)
{
	// The shadow algorithm:
	// Get the region of parent window,
	// Apply morphologic erosion to shrink it into the size (ShadowWndSize - Sharpness)
	// Apply modified (with blur effect) morphologic dilation to make the blurred border
	// The algorithm is optimized by assuming parent window is just "one piece" and without "wholes" on it

	// Get the region of parent window,
	// Create a full rectangle region in case of the window region is not defined
	HRGN hParentRgn = CreateRectRgn(0, 0, rcParent->right - rcParent->left, rcParent->bottom - rcParent->top);
	if (!m_OnlyRectangularRegions)
		GetWindowRgn(hParent, hParentRgn);

	// Determine the Start and end point of each horizontal scan line
	SIZE szParent = { rcParent->right - rcParent->left, rcParent->bottom - rcParent->top };
	SIZE szShadow = { szParent.cx + 2 * m_nSize, szParent.cy + 2 * m_nSize };
	// Extra 2 lines (set to be empty) in ptAnchors are used in dilation
	int nAnchors = max(szParent.cy, szShadow.cy);	// # of anchor points pares
	int(*ptAnchors)[2] = new int[nAnchors + 2][2];
	int(*ptAnchorsOri)[2] = new int[szParent.cy][2];	// anchor points, will not modify during erosion
	ptAnchors[0][0] = szParent.cx;
	ptAnchors[0][1] = 0;
	ptAnchors[nAnchors + 1][0] = szParent.cx;
	ptAnchors[nAnchors + 1][1] = 0;
	if (m_nSize > 0)
	{
		// Put the parent window anchors at the center
		for (int i = 0; i < m_nSize; i++)
		{
			ptAnchors[i + 1][0] = szParent.cx;
			ptAnchors[i + 1][1] = 0;
			ptAnchors[szShadow.cy - i][0] = szParent.cx;
			ptAnchors[szShadow.cy - i][1] = 0;
		}
		ptAnchors += m_nSize;
	}
	for (int i = 0; i < szParent.cy; i++)
	{
		// find start point
		int j;
		for (j = 0; j < szParent.cx; j++)
		{
			if (PtInRegion(hParentRgn, j, i))
			{
				ptAnchors[i + 1][0] = j + m_nSize;
				ptAnchorsOri[i][0] = j;
				break;
			}
		}

		if (j >= szParent.cx)	// Start point not found
		{
			ptAnchors[i + 1][0] = szParent.cx;
			ptAnchors[i + 1][1] = 0;
			ptAnchorsOri[i][0] = szParent.cx;
			ptAnchorsOri[i][1] = 0;
			//ptAnchors[i + 1][0] = szParent.cx;
			//ptAnchorsOri[i][1] = 0;
			//ptAnchors[i + 1][0] = szParent.cx;
			//ptAnchorsOri[i][1] = 0;
		}
		else
		{
			// find end point
			for (j = szParent.cx - 1; j >= ptAnchors[i + 1][0]; j--)
			{
				if (PtInRegion(hParentRgn, j, i))
				{
					ptAnchors[i + 1][1] = j + 1 + m_nSize;
					ptAnchorsOri[i][1] = j + 1;
					break;
				}
			}
		}
		// 		if(0 != ptAnchorsOri[i][1])
		// 			_RPTF2(_CRT_WARN, "%d %d\n", ptAnchorsOri[i][0], ptAnchorsOri[i][1]);
	}

	if (m_nSize > 0)
		ptAnchors -= m_nSize;	// Restore pos of ptAnchors for erosion
	int(*ptAnchorsTmp)[2] = new int[nAnchors + 2][2];	// Store the result of erosion
	// First and last line should be empty
	ptAnchorsTmp[0][0] = szParent.cx;
	ptAnchorsTmp[0][1] = 0;
	ptAnchorsTmp[nAnchors + 1][0] = szParent.cx;
	ptAnchorsTmp[nAnchors + 1][1] = 0;
	int nEroTimes = 0;
	// morphologic erosion
	for (int i = 0; i < m_nSharpness - m_nSize; i++)
	{
		nEroTimes++;
		//ptAnchorsTmp[1][0] = szParent.cx;
		//ptAnchorsTmp[1][1] = 0;
		//ptAnchorsTmp[szParent.cy + 1][0] = szParent.cx;
		//ptAnchorsTmp[szParent.cy + 1][1] = 0;
		for (int j = 1; j < nAnchors + 1; j++)
		{
			ptAnchorsTmp[j][0] = max(ptAnchors[j - 1][0], max(ptAnchors[j][0], ptAnchors[j + 1][0])) + 1;
			ptAnchorsTmp[j][1] = min(ptAnchors[j - 1][1], min(ptAnchors[j][1], ptAnchors[j + 1][1])) - 1;
		}
		// Exchange ptAnchors and ptAnchorsTmp;
		int(*ptAnchorsXange)[2] = ptAnchorsTmp;
		ptAnchorsTmp = ptAnchors;
		ptAnchors = ptAnchorsXange;
	}

	// morphologic dilation
	ptAnchors += (m_nSize < 0 ? -m_nSize : 0) + 1;	// now coordinates in ptAnchors are same as in shadow window
	// Generate the kernel
	int nKernelSize = m_nSize > m_nSharpness ? m_nSize : m_nSharpness;
	int nCenterSize = m_nSize > m_nSharpness ? (m_nSize - m_nSharpness) : 0;
	UINT32 *pKernel = new UINT32[(2 * nKernelSize + 1) * (2 * nKernelSize + 1)];
	UINT32 *pKernelIter = pKernel;
	for (int i = 0; i <= 2 * nKernelSize; i++)
	{
		for (int j = 0; j <= 2 * nKernelSize; j++)
		{
			double dLength = sqrt((i - nKernelSize) * (i - nKernelSize) + (j - nKernelSize) * (double)(j - nKernelSize));
			if (dLength < nCenterSize)
				*pKernelIter = m_nDarkness << 24 | PreMultiply(m_Color, m_nDarkness);
			else if (dLength <= nKernelSize)
			{
				UINT32 nFactor = ((UINT32)((1 - (dLength - nCenterSize) / (m_nSharpness + 1)) * m_nDarkness));
				*pKernelIter = nFactor << 24 | PreMultiply(m_Color, nFactor);
			}
			else
				*pKernelIter = 0;
			//TRACE("%d ", *pKernelIter >> 24);
			pKernelIter++;
		}
		//TRACE("\n");
	}
	// Generate blurred border
	for (int i = nKernelSize; i < szShadow.cy - nKernelSize; i++)
	{
		int j;
		if (ptAnchors[i][0] < ptAnchors[i][1])
		{

			// Start of line
			for (j = ptAnchors[i][0];
				j < min(max(ptAnchors[i - 1][0], ptAnchors[i + 1][0]) + 1, ptAnchors[i][1]);
				j++)
			{
				for (int k = 0; k <= 2 * nKernelSize; k++)
				{
					UINT32 *pPixel = pShadBits +
						(szShadow.cy - i - 1 + nKernelSize - k) * szShadow.cx + j - nKernelSize;
					UINT32 *pKernelPixel = pKernel + k * (2 * nKernelSize + 1);
					for (int l = 0; l <= 2 * nKernelSize; l++)
					{
						if (*pPixel < *pKernelPixel)
							*pPixel = *pKernelPixel;
						pPixel++;
						pKernelPixel++;
					}
				}
			}	// for() start of line

			// End of line
			for (j = max(j, min(ptAnchors[i - 1][1], ptAnchors[i + 1][1]) - 1);
				j < ptAnchors[i][1];
				j++)
			{
				for (int k = 0; k <= 2 * nKernelSize; k++)
				{
					UINT32 *pPixel = pShadBits +
						(szShadow.cy - i - 1 + nKernelSize - k) * szShadow.cx + j - nKernelSize;
					UINT32 *pKernelPixel = pKernel + k * (2 * nKernelSize + 1);
					for (int l = 0; l <= 2 * nKernelSize; l++)
					{
						if (*pPixel < *pKernelPixel)
							*pPixel = *pKernelPixel;
						pPixel++;
						pKernelPixel++;
					}
				}
			}	// for() end of line

		}
	}	// for() Generate blurred border

	// Erase unwanted parts and complement missing
	UINT32 clCenter = m_nDarkness << 24 | PreMultiply(m_Color, m_nDarkness);
	for (int i = min(nKernelSize, max(m_nSize - m_nyOffset, 0));
		i < max(szShadow.cy - nKernelSize, min(szParent.cy + m_nSize - m_nyOffset, szParent.cy + 2 * m_nSize));
		i++)
	{
		UINT32 *pLine = pShadBits + (szShadow.cy - i - 1) * szShadow.cx;
		if (i - m_nSize + m_nyOffset < 0 || i - m_nSize + m_nyOffset >= szParent.cy)	// Line is not covered by parent window
		{
			for (int j = ptAnchors[i][0]; j < ptAnchors[i][1]; j++)
			{
				*(pLine + j) = clCenter;
			}
		}
		else
		{
			for (int j = ptAnchors[i][0];
				j < min(ptAnchorsOri[i - m_nSize + m_nyOffset][0] + m_nSize - m_nxOffset, ptAnchors[i][1]);
				j++)
				*(pLine + j) = clCenter;
			for (int j = max(ptAnchorsOri[i - m_nSize + m_nyOffset][0] + m_nSize - m_nxOffset, 0);
				j < min(ptAnchorsOri[i - m_nSize + m_nyOffset][1] + m_nSize - m_nxOffset, szShadow.cx);
				j++)
				*(pLine + j) = 0;
			for (int j = max(ptAnchorsOri[i - m_nSize + m_nyOffset][1] + m_nSize - m_nxOffset, ptAnchors[i][0]);
				j < ptAnchors[i][1];
				j++)
				*(pLine + j) = clCenter;
		}
	}

	// Delete used resources
	delete[](ptAnchors - (m_nSize < 0 ? -m_nSize : 0) - 1);
	delete[] ptAnchorsTmp;
	delete[] ptAnchorsOri;
	delete[] pKernel;
	DeleteObject(hParentRgn);
}

bool CWndShadow::SetSize(int NewSize)
{
	if (NewSize > 20 || NewSize < -20)
		return false;

	m_nSize = (signed char)NewSize;
	if (SS_VISABLE & m_Status)
		Update(GetParent(m_hWnd));
	return true;
}

bool CWndShadow::SetSharpness(unsigned int NewSharpness)
{
	if (NewSharpness > 20)
		return false;

	m_nSharpness = (unsigned char)NewSharpness;
	if (SS_VISABLE & m_Status)
		Update(GetParent(m_hWnd));
	return true;
}

bool CWndShadow::SetDarkness(unsigned int NewDarkness)
{
	if (NewDarkness > 255)
		return false;

	m_nDarkness = (unsigned char)NewDarkness;
	if (SS_VISABLE & m_Status)
		Update(GetParent(m_hWnd));
	return true;
}

bool CWndShadow::SetPosition(int NewXOffset, int NewYOffset)
{
	if (NewXOffset > 20 || NewXOffset < -20 ||
		NewYOffset > 20 || NewYOffset < -20)
		return false;

	m_nxOffset = (signed char)NewXOffset;
	m_nyOffset = (signed char)NewYOffset;
	if (SS_VISABLE & m_Status)
		Update(GetParent(m_hWnd));
	return true;
}

bool CWndShadow::SetPosition(POINT NewOffset)
{
	return SetPosition(NewOffset.x, NewOffset.y);
}

bool CWndShadow::SetColor(COLORREF NewColor)
{
	m_Color = NewColor;
	if (SS_VISABLE & m_Status)
		Update(GetParent(m_hWnd));
	return true;
}

int CWndShadow::GetSize()
{
	return m_nSize;
}

unsigned int CWndShadow::GetSharpness()
{
	return m_nSharpness;
}

unsigned int CWndShadow::GetDarkness()
{
	return m_nDarkness;
}

POINT CWndShadow::GetPosition()
{
	POINT point;
	point.x = m_nxOffset;
	point.y = m_nyOffset;
	return point;
}

COLORREF CWndShadow::GetColor()
{
	return m_Color;
}

void CWndShadow::Show(HWND hParentWnd)
{
	// Clear all except the enabled status
	m_Status &= SS_ENABLED | SS_DISABLEDBYAERO;

	if (m_Status & SS_ENABLED)	// Enabled
	{
		// Determine the show state of shadow according to parent window's state
		LONG lParentStyle = GetWindowLong(hParentWnd, GWL_STYLE);

		if (WS_VISIBLE & lParentStyle)	// Parent visible
		{
			m_Status |= SS_PARENTVISIBLE;

			// Parent is normal, show the shadow
			if (!((WS_MAXIMIZE | WS_MINIMIZE) & lParentStyle) && !IsDisabledByAero(hParentWnd))	// Parent visible but does not need shadow
				m_Status |= SS_VISABLE;
		}
	}

	if (m_Status & SS_VISABLE)
	{
		if (!IsWindowVisible(m_hWnd))
			ShowWindow(m_hWnd, SW_SHOWNA);

		Update(hParentWnd);
	}
	else
		ShowWindow(m_hWnd, SW_HIDE);
}

bool CWndShadow::IsDisabledByAero(HWND hParentWnd)
{
	// Determine the show state of shadow according to parent window's state
	LONG lParentStyle = GetWindowLong(hParentWnd, GWL_STYLE);

	if (WS_THICKFRAME & lParentStyle)
		return (m_Status & SS_DISABLEDBYAERO) > 0;

	return false;
}
