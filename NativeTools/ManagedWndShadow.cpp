#include "stdafx.h"
#include "ManagedWndShadow.h"

bool ManagedWndShadow::OnParentMsg(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	bool isHandled = false;
	ParentProcedure(hwnd, uMsg, wParam, lParam, isHandled);
	return isHandled;
}

LRESULT ManagedWndShadow::CallOriginalParentProcedure(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
	return SendMessage(hwnd, uMsg, wParam, lParam);
}

void ManagedWndShadow::ConnectOriginalParentProcedure(HWND hwndParent)
{
}
