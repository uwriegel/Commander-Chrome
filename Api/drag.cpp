#include "stdafx.h"
#include "data_object.h"
#include "drop_source.h"
using namespace std;

extern HWND hwndMain;

extern "C"
{
	void start_drag()
	{
		PostMessage(hwndMain, WM_APP + 201, 0, 0);
	}

	void affe()
	{
		FORMATETC format_etc{ CF_HDROP, 0, DVASPECT_CONTENT, -1, TYMED_HGLOBAL };
		STGMEDIUM medium{ TYMED_HGLOBAL,{ 0 }, 0 };

		IDataObject *data_object{ nullptr };
		IDropSource* drop_source{ nullptr };
		Drop_source::create_drop_source(&drop_source);
		Data_object::create_data_object(&format_etc, &medium, 1, &data_object);
		DWORD effects;
		HRESULT hr = DoDragDrop(data_object, drop_source, DROPEFFECT_COPY, &effects);
		drop_source->Release();
		data_object->Release();
	}
}