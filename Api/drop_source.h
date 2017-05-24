#pragma once

class Drop_source : public IDropSource
{
public:
	static HRESULT create_drop_source(IDropSource** drop_source);

	HRESULT __stdcall QueryContinueDrag(BOOL escape_pressed, DWORD key_state);
	HRESULT __stdcall GiveFeedback(DWORD effect);

	HRESULT __stdcall QueryInterface(REFIID iid, void **object);
	ULONG   __stdcall AddRef(void);
	ULONG   __stdcall Release(void);

	~Drop_source();

private:
	Drop_source();

	DWORD ref_count;
};