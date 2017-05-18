#pragma once

class Drop_target : public IDropTarget
{
public:
	Drop_target();
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
	DWORD refcount;
};
