#include "stdafx.h"
#include "drop_target.h"

extern "C"
{
	void initialize_drag_and_drop(HWND hwnd)
	{
		auto hr = RevokeDragDrop(hwnd);
		auto drop_target = new Drop_target();
		hr = RegisterDragDrop(hwnd, drop_target);
		drop_target->Release();
	}
}

Drop_target::Drop_target()
	: refcount(1)
{
}

HRESULT __stdcall Drop_target::DragEnter(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect)
{
	*pdwEffect = DROPEFFECT_LINK;
	return S_OK;
}

HRESULT __stdcall Drop_target::DragOver(DWORD grfKeyState, POINTL pt, DWORD *pdwEffect)
{
	*pdwEffect = DROPEFFECT_LINK;
	return S_OK;
}

HRESULT __stdcall Drop_target::DragLeave()
{
	return S_OK;
}

HRESULT __stdcall Drop_target::Drop(IDataObject *pDataObj, DWORD grfKeyState, POINTL pt, DWORD *pdwEffect)
{
	*pdwEffect = DROPEFFECT_NONE;
	return S_OK;
}

HRESULT __stdcall Drop_target::QueryInterface(REFIID riid, void **comObject)
{
	if (!comObject)
		return E_POINTER;

	if (IID_IDropTarget == riid)
		*comObject = static_cast<IDropTarget*>(this);
	else if (IID_IUnknown == riid)
		*comObject = static_cast<IUnknown*>(this);
	else
	{
		*comObject = 0;
		return E_NOINTERFACE;
	}

	if (*comObject)
		reinterpret_cast<IUnknown*>(*comObject)->AddRef();

	return S_OK;
}

ULONG __stdcall Drop_target::AddRef()
{
	return InterlockedIncrement(&refcount);
}

ULONG __stdcall Drop_target::Release()
{
	auto result = InterlockedDecrement(&refcount);
	if (result == 0)
		delete this;
	return result;
}



