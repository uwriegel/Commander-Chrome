#include "stdafx.h"
#include "drop_source.h"

HRESULT Drop_source::create_drop_source(IDropSource** drop_source)
{
	if (drop_source == nullptr)
		return E_INVALIDARG;

	*drop_source = new Drop_source();

	return (*drop_source) ? S_OK : E_OUTOFMEMORY;
}

HRESULT __stdcall Drop_source::QueryContinueDrag(BOOL escape_pressed, DWORD key_state)
{
	// if the Escape key has been pressed since the last call, cancel the drop
	if (escape_pressed == TRUE)
		return DRAGDROP_S_CANCEL;

	// if the LeftMouse button has been released, then do the drop!
	if ((key_state & MK_LBUTTON) == 0)
		return DRAGDROP_S_DROP;

	// continue with the drag-drop
	return S_OK;
}

HRESULT __stdcall Drop_source::GiveFeedback(DWORD effect)
{
	return DRAGDROP_S_USEDEFAULTCURSORS;
}

Drop_source::Drop_source()
	: ref_count(1)
{
}

Drop_source::~Drop_source()
{
}

HRESULT __stdcall Drop_source::QueryInterface(REFIID iid, void **object)
{
	if (!object)
		return E_POINTER;

	if (IID_IDropSource == iid)
		*object = static_cast<IDropSource*>(this);
	else if (IID_IUnknown == iid)
		*object = static_cast<IUnknown*>(this);
	else
	{
		*object = 0;
		return E_NOINTERFACE;
	}

	if (*object)
		reinterpret_cast<IUnknown*>(*object)->AddRef();

	return S_OK;
}

ULONG __stdcall Drop_source::AddRef()
{
	return InterlockedIncrement(&ref_count);
}

ULONG __stdcall Drop_source::Release()
{
	auto result = InterlockedDecrement(&ref_count);
	if (result == 0)
		delete this;
	return result;
}
