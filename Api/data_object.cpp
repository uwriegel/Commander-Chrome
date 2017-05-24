#include "stdafx.h"
#include "data_object.h"
using namespace std;

HRESULT Data_object::create_data_object(FORMATETC *format_etc, STGMEDIUM *medium, UINT num_formats, IDataObject **data_object)
{
	if (data_object == nullptr)
		return E_INVALIDARG;

	*data_object = new Data_object(format_etc, medium, num_formats);

	return (*data_object) ? S_OK : E_OUTOFMEMORY;
}

HRESULT __stdcall Data_object::GetData(FORMATETC *format_etc, STGMEDIUM *medium)
{
	int idx;

	// try to match the specified FORMATETC with one of our supported formats
	if ((idx = LookupFormatEtc(format_etc)) == -1)
		return DV_E_FORMATETC;

	// found a match - transfer data into supplied storage medium
	medium->tymed = format_etc[idx].tymed;
	medium->pUnkForRelease = 0;

	// copy the data into the caller's storage medium
	switch (format_etc[idx].tymed)
	{
		case TYMED_HGLOBAL:
		{
			DROPFILES df{ 0 };
			df.fWide = 1;
			df.pFiles = sizeof(df);

			vector<char> v(sizeof(df));
			memcpy(v.data(), &df, v.size());
			int offset = v.size();

			auto feile1 = LR"(b:\VoiceKids.ts)"s;
			auto length = feile1.length() * 2;
			v.resize(offset + length + 2);
			memcpy(v.data() + offset, feile1.c_str(), length);
			offset += length + 2;
			v.resize(offset + length + 4);
			memcpy(v.data() + offset, feile1.c_str(), length);

			medium->hGlobal = GlobalAlloc(GHND, v.size());
			char* p = reinterpret_cast<char*>(GlobalLock(medium->hGlobal));
			memcpy(p, v.data(), v.size());
			GlobalUnlock(medium->hGlobal);
		}
			break;

		default:
			return DV_E_FORMATETC;
	}
	return S_OK;
}

HRESULT __stdcall Data_object::GetDataHere(FORMATETC *format_etc, STGMEDIUM *medium)
{
	return DATA_E_FORMATETC;
}

HRESULT __stdcall Data_object::QueryGetData(FORMATETC *format_etc)
{
	return (LookupFormatEtc(format_etc) == -1) ? DV_E_FORMATETC : S_OK;
}

HRESULT __stdcall Data_object::GetCanonicalFormatEtc(FORMATETC *format_etc, FORMATETC *format_etc_out)
{
	format_etc_out->ptd = nullptr;
	return E_NOTIMPL;
}

HRESULT __stdcall Data_object::SetData(FORMATETC *format_etc, STGMEDIUM *medium, BOOL release)
{
	return E_NOTIMPL;
}

HRESULT __stdcall Data_object::EnumFormatEtc(DWORD direction, IEnumFORMATETC **enum_format_etc)
{
	// only the get direction is supported for OLE
	if (direction == DATADIR_GET)
		return SHCreateStdEnumFmtEtc(num_formats, format_etc, enum_format_etc);
	else
		// the direction specified is not supported for drag+drop
		return E_NOTIMPL;
	return S_OK;
}

HRESULT __stdcall Data_object::DAdvise(FORMATETC *format_etc, DWORD advf, IAdviseSink *, DWORD *)
{
	return OLE_E_ADVISENOTSUPPORTED;
}

HRESULT __stdcall Data_object::DUnadvise(DWORD connection)
{
	return OLE_E_ADVISENOTSUPPORTED;
}

HRESULT __stdcall Data_object::EnumDAdvise(IEnumSTATDATA **enum_advise)
{
	return OLE_E_ADVISENOTSUPPORTED;
}

Data_object::Data_object(FORMATETC *format_etc, STGMEDIUM *medium, int num_formats)
	: ref_count(1)
	, num_formats(num_formats)
	, format_etc(nullptr)
	, medium(nullptr)
{
	this->format_etc = new FORMATETC[num_formats];
	this->medium = new STGMEDIUM[num_formats];

	for (int i = 0; i < num_formats; i++)
	{
		this->format_etc[i] = format_etc[i];
		this->medium[i] = medium[i];
	}
}

Data_object::~Data_object()
{
	GlobalFree(medium->hGlobal);
}

HRESULT __stdcall Data_object::QueryInterface(REFIID iid, void ** object)
{
	if (!object)
		return E_POINTER;

	if (IID_IDataObject == iid)
		*object = static_cast<IDataObject*>(this);
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

ULONG   __stdcall Data_object::AddRef()
{
	return InterlockedIncrement(&ref_count);
}

ULONG   __stdcall Data_object::Release()
{
	auto result = InterlockedDecrement(&ref_count);
	if (result == 0)
		delete this;
	return result;
}

int Data_object::LookupFormatEtc(FORMATETC *format_etc)
{
	// check each of our formats in turn to see if one matches
	for (int i = 0; i < num_formats; i++)
	{
		if ((format_etc[i].tymed    &  format_etc->tymed) &&
			format_etc[i].cfFormat == format_etc->cfFormat &&
			format_etc[i].dwAspect == format_etc->dwAspect)
		{
			// return index of stored format
			return i;
		}
	}

	// error, format not found
	return -1;
}

