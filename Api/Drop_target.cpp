#include "stdafx.h"
#include "drop_target.h"
using namespace std;

extern "C"
{
	void initialize_drag_and_drop(HWND hwnd, on_drag_over_method* on_drag_over, on_drag_leave_method* on_drag_leave)
	{
		auto hr = RevokeDragDrop(hwnd);
		auto drop_target = new Drop_target(hwnd, on_drag_over, on_drag_leave);
		hr = RegisterDragDrop(hwnd, drop_target);
		drop_target->Release();
	}
}

Drop_target::Drop_target(HWND hwnd, on_drag_over_method* on_drag_over, on_drag_leave_method* on_drag_leave)
	: refcount(1)
	, active(false)
	, hwnd(hwnd)
	, on_drag_over(on_drag_over)
	, on_drag_leave(on_drag_leave)
{
}

HRESULT __stdcall Drop_target::DragEnter(IDataObject *data_object, DWORD key_state, POINTL pt, DWORD *pdwEffect)
{
	FORMATETC formatetc
	{ 
		CF_HDROP, 
		0, 
		DVASPECT_CONTENT, 
		-1, 
		TYMED_HGLOBAL 
	};

	if (data_object->QueryGetData(&formatetc) == 0)
	{
		STGMEDIUM stg_medium{ 0 };
		stg_medium.tymed = { TYMED_HGLOBAL };
		auto hr = data_object->GetData(&formatetc, &stg_medium);
		if (hr == 0)
		{
			auto mem = stg_medium.hGlobal;
			auto drop = reinterpret_cast<HDROP>(GlobalLock(mem));
			auto num_of_files = DragQueryFile(drop, -1, nullptr, 0);
			active = true;
			array<wchar_t, MAX_PATH> buffer;
			for (unsigned int i = 0; i < num_of_files; i++)
			{
				auto length = DragQueryFile(drop, i, buffer.data(), static_cast<unsigned int>(buffer.size()));
				wstring str(buffer.data(), length);
				auto w = str;
			}
			GlobalUnlock(mem);
			ReleaseStgMedium(&stg_medium);

			POINT p{ pt.x, pt.y };
			ScreenToClient(hwnd, &p);
			if (on_drag_over(p.x, p.y))
				*pdwEffect = key_state & MK_CONTROL && key_state & MK_SHIFT ? DROPEFFECT_LINK :
					key_state & MK_CONTROL ? DROPEFFECT_COPY : DROPEFFECT_MOVE;
			else
				*pdwEffect = DROPEFFECT_NONE;
		}
	}

	return S_OK;
}

HRESULT __stdcall Drop_target::DragOver(DWORD key_state, POINTL pt, DWORD *pdwEffect)
{
	POINT p{ pt.x, pt.y };
	ScreenToClient(hwnd, &p);
	if (active && on_drag_over(p.x, p.y))
		*pdwEffect = key_state & MK_CONTROL && key_state & MK_SHIFT ? DROPEFFECT_LINK :
		key_state & MK_CONTROL ? DROPEFFECT_COPY : DROPEFFECT_MOVE;
	else
		*pdwEffect = DROPEFFECT_NONE;

	return S_OK;
}

HRESULT __stdcall Drop_target::DragLeave()
{
	active = false;
	on_drag_leave();
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



