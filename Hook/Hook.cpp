#include "stdafx.h"
using namespace std;

BOOL __stdcall EnumWindowsProc(HWND hwnd, LPARAM lParam)
{
	array<wchar_t, 40> buffer;
	GetWindowText(hwnd, buffer.data(), static_cast<int>(buffer.size()));
	wstring text(buffer.data());
	if (text.length() > 0 && text.compare(L"Unbenannt") == 0)
	{
		HWND* hwndResult = (HWND*)lParam;
		*hwndResult = hwnd;
		return FALSE;
	}
	return TRUE;
}

extern "C" 
{
	void __stdcall start(int pid)
	{
		HWND commander_window{ 0 };
		Sleep(500);
		auto result = EnumWindows(EnumWindowsProc, reinterpret_cast<LPARAM>(&commander_window));

		auto module = LoadLibrary(L"Hook.dll");
		auto proc = reinterpret_cast<HOOKPROC>(GetProcAddress(module, "GetMsgProc"));

		auto hook = SetWindowsHookEx(WH_GETMESSAGE, proc, module, 0);
		PostMessage(commander_window, WM_APP + 200, 0, 0);

		MessageBoxA(0, "", "", MB_OK);

		UnhookWindowsHookEx(hook);
	}
}
