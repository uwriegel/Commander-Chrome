#include "stdafx.h"
using namespace System; 
using namespace System::Runtime::InteropServices;
using namespace System::Reflection;


#include "WindowShadowBase.h"

using namespace Native;


WindowShadowBase::WindowShadowBase()
{
	shadow = new ManagedWndShadow();
}

WindowShadowBase::!WindowShadowBase()
{
	delete shadow;
	shadow = __nullptr;
}

IntPtr WindowShadowBase::Handle::get()
{
	return IntPtr(shadow->GetHWND());
}

bool WindowShadowBase::Initialize()
{
	Assembly^ assi = Assembly::GetExecutingAssembly();
	IntPtr hInstance = Marshal::GetHINSTANCE(assi->GetModules()[0]);
	return CWndShadow::Initialize((HINSTANCE)(void*)hInstance);
}

void WindowShadowBase::Create(IntPtr parentWnd)
{
	shadow->SetOnlyRectangularRegions();
	shadow->Create((HWND)(void*)parentWnd);
}

void WindowShadowBase::Destroy()
{
	shadow->Destroy();
	delete shadow;
	shadow = __nullptr;
}

int WindowShadowBase::Size::get()
{
	return shadow->GetSize();
}
void WindowShadowBase::Size::set(int value)
{
	shadow->SetSize(value);
}

Tuple<int,int>^ WindowShadowBase::Position::get()
{
	POINT point = shadow->GetPosition();
	return Tuple::Create<int,int>(point.x, point.y);
}
void WindowShadowBase::Position::set(Tuple<int,int>^ value)
{
	shadow->SetPosition(value->Item1, value->Item2);
}

unsigned int WindowShadowBase::Sharpness::get()
{
	return shadow->GetSharpness();
}
void WindowShadowBase::Sharpness::set(unsigned int value)
{
	shadow->SetSharpness(value);
}

unsigned int WindowShadowBase::Darkness::get()
{
	return shadow->GetDarkness();
}
void WindowShadowBase::Darkness::set(unsigned int value)
{
	shadow->SetDarkness(value);
}

COLORREF WindowShadowBase::Color::get()
{
	return shadow->GetColor();
}
void WindowShadowBase::Color::set(COLORREF value)
{
	shadow->SetColor(value);
}

IntPtr WindowShadowBase::ParentWndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, bool% handled)
{
	try
	{
		if (!inParentProcedure)
		{
			inParentProcedure = true;
			if (msg != 70 && msg != 71)
				handled = shadow->OnParentMsg((HWND)(void*)hwnd, msg, (WPARAM)(void*)wParam, (LPARAM)(void*)lParam);
		}
		return IntPtr::Zero;
	}
	finally
	{
		inParentProcedure = false;
	}
}

