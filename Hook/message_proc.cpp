#include "stdafx.h"
#include "managed_bridge.h"
using namespace std;

bool first{ true };




using affeproc = void();


LRESULT __stdcall GetMsgProc(int code, WPARAM wParam, LPARAM lParam)
{
	if (code == HC_ACTION)
	{
		auto msg = reinterpret_cast<MSG*>(lParam);
		if (first && msg->message == WM_APP + 200)
		{
			auto pid = GetCurrentProcessId();
			if (first)
			{ 
				first = false;
				start(msg->hwnd);
			}
		}
		else if (msg->message == WM_APP + 201)
		{
			auto affe = LoadLibrary(L"api");
			auto proc = reinterpret_cast<affeproc*>(GetProcAddress(affe, "affe"));
			affeproc* aff = (affeproc*)proc;
			aff();
		}
	}
	return CallNextHookEx(0, code, wParam, lParam);
}