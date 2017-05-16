#pragma once
#include "WndShadow.h"

class ManagedWndShadow : public CWndShadow
{
public:
	bool OnParentMsg(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);
protected:
	LRESULT CallOriginalParentProcedure(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);
	void ConnectOriginalParentProcedure(HWND hwndParent);
};