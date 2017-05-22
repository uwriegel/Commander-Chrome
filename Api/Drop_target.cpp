#include "stdafx.h"
#include "drop_target.h"
#include "resource.h"
using namespace std;

vector<wstring> get_files(IDataObject* data_object);

HWND hwndMain;

extern "C"
{
	void initialize_drag_and_drop(HWND hwnd, on_drag_over_method* on_drag_over, on_drag_leave_method* on_drag_leave, on_drop_method* on_drop)
	{
		hwndMain = hwnd;
		auto hr = RevokeDragDrop(hwnd);
		auto drop_target = new Drop_target(hwnd, on_drag_over, on_drag_leave, on_drop);
		hr = RegisterDragDrop(hwnd, drop_target);
		drop_target->Release();
	}
}

Drop_target::Drop_target(HWND hwnd, on_drag_over_method* on_drag_over, on_drag_leave_method* on_drag_leave, on_drop_method* on_drop)
	: refcount(1)
	, active(false)
	, hwnd(hwnd)
	, on_drag_over(on_drag_over)
	, on_drag_leave(on_drag_leave)
	, on_drop(on_drop)
{
}

HRESULT __stdcall Drop_target::DragEnter(IDataObject *data_object, DWORD key_state, POINTL pt, DWORD *effect)
{
	*effect = DROPEFFECT_NONE;

	auto files = get_files(data_object);
	if (files.size() > 0)
	{
		active = true;
		POINT p{ pt.x, pt.y };
		ScreenToClient(hwnd, &p);
		if (on_drag_over(p.x, p.y))
			*effect = key_state & MK_CONTROL && key_state & MK_SHIFT ? DROPEFFECT_LINK :
				key_state & MK_CONTROL ? DROPEFFECT_COPY : DROPEFFECT_MOVE;
	}

	return S_OK;
}

HRESULT __stdcall Drop_target::DragOver(DWORD key_state, POINTL pt, DWORD *effect)
{
	POINT p{ pt.x, pt.y };
	ScreenToClient(hwnd, &p);
	if (active && on_drag_over(p.x, p.y))
		*effect = key_state & MK_CONTROL && key_state & MK_SHIFT ? DROPEFFECT_LINK :
		key_state & MK_CONTROL ? DROPEFFECT_COPY : DROPEFFECT_MOVE;
	else
		*effect = DROPEFFECT_NONE;

	return S_OK;
}

HRESULT __stdcall Drop_target::DragLeave()
{
	active = false;

	auto instance = LoadLibrary(L"Api.dll");
	auto menu = LoadMenu(instance, MAKEINTRESOURCE(IDC_FENSTER));
	SetMenu(hwndMain, menu);
	FreeLibrary(instance);
	on_drag_leave();
	return S_OK;
}

HRESULT __stdcall Drop_target::Drop(IDataObject *data_object, DWORD key_state, POINTL pt, DWORD *effect)
{
	POINT p{ pt.x, pt.y };
	ScreenToClient(hwnd, &p);
	auto files = get_files(data_object);
	if (files.size() > 0)
	{
		auto combined = accumulate(files.begin(), files.end(), L""s, [&](wstring s1, wstring s2)
		{
			if (s1 == L"")
				return s2;
			return s1 + L"|"s + s2;
		});
		on_drop(p.x, p.y, combined.c_str());
	}

	*effect = DROPEFFECT_NONE;
	return S_OK;
}

vector<wstring> get_files(IDataObject* data_object)
{
	vector<wstring> result;
	FORMATETC formatetc
	{
		CF_HDROP,
		0,
		DVASPECT_CONTENT,
		-1,
		TYMED_HGLOBAL
	};

	STGMEDIUM stg_medium{ 0 };
	stg_medium.tymed = { TYMED_HGLOBAL };
	auto hr = data_object->GetData(&formatetc, &stg_medium);
	if (hr == 0)
	{
		auto mem = stg_medium.hGlobal;
		auto drop = reinterpret_cast<HDROP>(GlobalLock(mem));
		auto num_of_files = DragQueryFile(drop, -1, nullptr, 0);
		array<wchar_t, MAX_PATH> buffer;
		for (unsigned int i = 0; i < num_of_files; i++)
		{
			auto length = DragQueryFile(drop, i, buffer.data(), static_cast<unsigned int>(buffer.size()));
			wstring str(buffer.data(), length);
			result.push_back(str);
		}
		GlobalUnlock(mem);
		ReleaseStgMedium(&stg_medium);
	}
	return result;
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



