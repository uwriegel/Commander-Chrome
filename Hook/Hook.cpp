#include "stdafx.h"
using namespace std;

struct Data
{
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
		*data->found_window = hwnd;
		return FALSE;
	}
	return TRUE;
}

extern "C" 
{
	void __stdcall start()
	{
		HWND commander_window{ 0 };
		
		Data data
		{
			&commander_window
		};
		for (auto i = 0; i < 10; i++)
		{
			auto result = EnumWindows(EnumWindowsProc, reinterpret_cast<LPARAM>(&data));
			if (!result)
				break;
			Sleep(100);

			if (i == 9 && result)
				return;
		}

		auto module = LoadLibrary(L"Hook.dll");
		auto proc = reinterpret_cast<HOOKPROC>(GetProcAddress(module, "GetMsgProc"));

		auto hook = SetWindowsHookEx(WH_GETMESSAGE, proc, module, 0);
		PostMessage(commander_window, WM_APP + 200, 0, 0);

		Sleep(500);	
		UnhookWindowsHookEx(hook);
	}
}
