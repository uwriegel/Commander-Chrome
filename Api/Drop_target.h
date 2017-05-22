#pragma once

using on_drag_over_method = bool(int x, int y);
using on_drag_leave_method = void();
using on_drop_method = void(int x, int y, const wchar_t* files);

class Drop_target : public IDropTarget
{
public:
	Drop_target(HWND hwnd, on_drag_over_method* on_drag_over, on_drag_leave_method* on_drag_leave, on_drop_method* on_drop);
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
	on_drop_method* on_drop;
	HWND hwnd;
	DWORD refcount;
};
