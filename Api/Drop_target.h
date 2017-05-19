#pragma once

using on_drag_over_method = bool(int x, int y);
using on_drag_leave_method = void();

class Drop_target : public IDropTarget
{
public:
	Drop_target(HWND hwnd, on_drag_over_method* on_drag_over, on_drag_leave_method* on_drag_leave);
private:
	HRESULT __stdcall DragEnter(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	HRESULT __stdcall DragOver(DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);
	HRESULT __stdcall DragLeave();
	HRESULT __stdcall Drop(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect);

	HRESULT __stdcall QueryInterface(REFIID riid, void **ppvObject);
	ULONG __stdcall AddRef();
public:
	ULONG __stdcall Release();
private:

	bool active;
	on_drag_over_method* on_drag_over;
	on_drag_leave_method* on_drag_leave;
	HWND hwnd;
	DWORD refcount;
};
