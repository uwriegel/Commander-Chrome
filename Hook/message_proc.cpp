#include "stdafx.h"
#include "managed_bridge.h"
using namespace std;

bool first{ true };

LRESULT __stdcall GetMsgProc(int code, WPARAM wParam, LPARAM lParam)
{
	if (code == HC_ACTION)
	{
		auto msg = reinterpret_cast<MSG*>(lParam);
		if (first && msg->message == WM_APP + 200)
		{
			auto pid = GetCurrentProcessId();
			if (pid == msg->lParam)
			{
				if (first)
				{ 
					first = false;
					start();
				}
			}
		}
	}
	return CallNextHookEx(0, code, wParam, lParam);
}