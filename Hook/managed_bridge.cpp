#include "stdafx.h"
#import "C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\mscorlib.tlb" raw_interfaces_only rename("ReportEvent", "ReportEvent2")
#include <metahost.h>
#include "Drop_target.h"
using namespace mscorlib;
using namespace std;
#pragma comment(lib, "mscoree.lib")

void start(HWND hwnd)
{
	auto module = LoadLibrary(L"hook");
	array<wchar_t, 1000> buffer;
	GetModuleFileName(module, buffer.data(), static_cast<int>(buffer.size()));

	
	
	
	
	// TODO:!!!
	//FreeLibrary(module);
	
	wstring path(buffer.data(), buffer.size());

	auto pos = path.find_last_of(L"\\");
	path = path.substr(0, pos + 1) + L"Commander.exe";

	ICLRMetaHost *meta_host{ nullptr };
	auto hr = CLRCreateInstance(CLSID_CLRMetaHost, IID_ICLRMetaHost, reinterpret_cast<void**>(&meta_host));

	// Get the ICLRRuntimeInfo corresponding to a particular CLR version. It 
	// supersedes CorBindToRuntimeEx with STARTUP_LOADER_SAFEMODE.
	ICLRRuntimeInfo *runtime_info{ nullptr };
	wstring version(L"v4.0.30319");
	hr = meta_host->GetRuntime(version.c_str(), IID_ICLRRuntimeInfo, reinterpret_cast<void**>(&runtime_info));
	meta_host->Release();

	// Load the CLR into the current process and return a runtime interface 
	// pointer. ICorRuntimeHost and ICLRRuntimeHost are the two CLR hosting  
	// interfaces supported by CLR 4.0. Here we demo the ICorRuntimeHost 
	// interface that was provided in .NET v1.x, and is compatible with all 
	// .NET Frameworks. 
	ICorRuntimeHost *cor_runtime_host{ nullptr };
	hr = runtime_info->GetInterface(CLSID_CorRuntimeHost, IID_ICorRuntimeHost, reinterpret_cast<void**>(&cor_runtime_host));
	runtime_info->Release();

	hr = cor_runtime_host->Start();

	IUnknown* app_domain_thunk{ nullptr };
	hr = cor_runtime_host->GetDefaultDomain(&app_domain_thunk);
	cor_runtime_host->Release();

	_AppDomain* default_app_domain{ nullptr };
	hr = app_domain_thunk->QueryInterface(__uuidof(default_app_domain), reinterpret_cast<void**>(&default_app_domain));
	app_domain_thunk->Release();

	BSTR assembly_name = SysAllocString(L"mscorlib");
	_Assembly* assembly{ nullptr };
	hr = default_app_domain->Load_2(assembly_name, &assembly);
	SysFreeString(assembly_name);
	default_app_domain->Release();

	BSTR class_name = SysAllocString(L"System.Reflection.Assembly");
	mscorlib::_Type* type;
	hr = assembly->GetType_2(class_name, &type);
	assembly->Release();
	SysFreeString(class_name);

	SAFEARRAY* static_method_args = SafeArrayCreateVector(VT_VARIANT, 0, 1);
	LONG index{ 0 };
	VARIANT args;
	args.vt = VT_BSTR;
	args.bstrVal = SysAllocString(path.c_str());
	hr = SafeArrayPutElement(static_method_args, &index, &args);

	BSTR static_method_name = SysAllocString(L"LoadFrom");
	VARIANT vtEmpty;
	vtEmpty.vt = VT_EMPTY;
	VARIANT return_value;
	hr = type->InvokeMember_3(static_method_name, static_cast<BindingFlags>(BindingFlags_InvokeMethod | BindingFlags_Static | BindingFlags_Public),
		nullptr, vtEmpty, static_method_args, &return_value);
	VariantClear(&args);
	SysFreeString(static_method_name);
	type->Release();
	
	_Assembly* commander_Assembly = static_cast<_Assembly*>(return_value.pdispVal);
	VariantClear(&return_value);
	class_name = SysAllocString(L"Commander.Starter");
	hr = commander_Assembly->GetType_2(class_name, &type);
	commander_Assembly->Release();
	SysFreeString(class_name);
	static_method_name = SysAllocString(L"Start");
	hr = type->InvokeMember_3(static_method_name, static_cast<BindingFlags>(BindingFlags_InvokeMethod | BindingFlags_Static | BindingFlags_Public),
		nullptr, vtEmpty, static_method_args, nullptr);
	VariantClear(&args);
	SysFreeString(static_method_name);
	SafeArrayDestroy(static_method_args);

	hr = RevokeDragDrop(hwnd);

	auto drop_target = new Drop_target();
	hr = RegisterDragDrop(hwnd, drop_target);
	drop_target->Release();

}
