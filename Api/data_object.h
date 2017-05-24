#pragma once

class Data_object : public IDataObject
{
public:
	static HRESULT create_data_object(FORMATETC *format_etc, STGMEDIUM *medium, UINT num_formats, IDataObject **data_object);

	HRESULT __stdcall GetData(FORMATETC *format_etc, STGMEDIUM *medium);
	HRESULT __stdcall GetDataHere(FORMATETC *format_etc, STGMEDIUM *medium);
	HRESULT __stdcall QueryGetData(FORMATETC *format_etc);
	HRESULT __stdcall GetCanonicalFormatEtc(FORMATETC *format_etc, FORMATETC *format_etc_out);
	HRESULT __stdcall SetData(FORMATETC *format_etc, STGMEDIUM *medium, BOOL release);
	HRESULT __stdcall EnumFormatEtc(DWORD direction, IEnumFORMATETC **enum_format_etc);
	HRESULT __stdcall DAdvise(FORMATETC *format_etc, DWORD advf, IAdviseSink *, DWORD *);
	HRESULT __stdcall DUnadvise(DWORD connection);
	HRESULT __stdcall EnumDAdvise(IEnumSTATDATA **enum_advise);

	HRESULT __stdcall QueryInterface(REFIID iid, void ** object);
	ULONG   __stdcall AddRef();
	ULONG   __stdcall Release();

	// Constructor / Destructor
	~Data_object();

private:
	Data_object(FORMATETC *format_etc, STGMEDIUM *medium, int num_formats);

	DWORD ref_count;
	int num_formats;
	FORMATETC *format_etc;
	STGMEDIUM *medium;

	int LookupFormatEtc(FORMATETC *format_etc);
};