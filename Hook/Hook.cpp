#include "stdafx.h"
using namespace std;

struct Data
{
	DWORD pid;
	HWND* found_window;
};

BOOL __stdcall EnumWindowsProc(HWND hwnd, LPARAM lParam)
{
	Data* data = reinterpret_cast<Data*>(lParam);
	array<wchar_t, 40> buffer;
	GetWindowText(hwnd, buffer.data(), static_cast<int>(buffer.size()));
	wstring text(buffer.data());
	if (text.length() > 0 && text.compare(L"Unbenannt") == 0)
	{
		DWORD wpid{ 0 };
		GetWindowThreadProcessId(hwnd, &wpid);
		if (wpid == data->pid)
		{
			*data->found_window = hwnd;
			return FALSE;
		}
	}
	return TRUE;
}

extern "C" 
{
	void __stdcall start(DWORD pid)
	{
		HWND commander_window{ 0 };
		Sleep(500);
		Data data
		{
			pid, &commander_window
		};
		auto result = EnumWindows(EnumWindowsProc, reinterpret_cast<LPARAM>(&data));

		auto module = LoadLibrary(L"Hook.dll");
		auto proc = reinterpret_cast<HOOKPROC>(GetProcAddress(module, "GetMsgProc"));

		auto hook = SetWindowsHookEx(WH_GETMESSAGE, proc, module, 0);
		PostMessage(commander_window, WM_APP + 200, 0, pid);

		Sleep(2000);	

		UnhookWindowsHookEx(hook);
	}
}
