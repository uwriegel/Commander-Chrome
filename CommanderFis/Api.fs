namespace Commander
open System
open System.Runtime.InteropServices 
    
#nowarn "9"
module Api = 

    let FILE_ATTRIBUTE_NORMAL = 0x80
    let SW_SHOW = 5
    let SEE_MASK_INVOKEIDLIST = 12u

    [<Flags>]
    type SHGetFileInfoConstants =
        | SHGFI_ICON = 0x100                // get icon
        | SHGFI_DISPLAYNAME = 0x200         // get display name
        | SHGFI_TYPENAME = 0x400            // get type name
        | SHGFI_ATTRIBUTES = 0x800          // get attributes
        | SHGFI_ICONLOCATION = 0x1000       // get icon location
        | SHGFI_EXETYPE = 0x2000            // return exe type
        | SHGFI_SYSICONINDEX = 0x4000       // get system icon index
        | SHGFI_LINKOVERLAY = 0x8000        // put a link overlay on icon
        | SHGFI_SELECTED = 0x10000          // show icon in selected state
        | SHGFI_ATTR_SPECIFIED = 0x20000    // get only specified attributes
        | SHGFI_LARGEICON = 0x0             // get large icon
        | SHGFI_SMALLICON = 0x1             // get small icon
        | SHGFI_OPENICON = 0x2              // get open icon
        | SHGFI_SHELLICONSIZE = 0x4         // get shell size icon
        | SHGFI_PIDL = 0x8                  // pszPath is a pidl
        | SHGFI_USEFILEATTRIBUTES = 0x10    // use passed dwFileAttribute
        | SHGFI_ADDOVERLAYS = 0x000000020   // apply the appropriate overlays
        | SHGFI_OVERLAYINDEX = 0x000000040   // Get the index of the overlay

    [<Struct; StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)>]
    type ShFileInfo = 
        val mutable hIcon: IntPtr
        val mutable iIcon: int 
        val mutable dwAttributes: uint32 
        [<MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)>]
        val mutable szDisplayName: string 
        [<MarshalAs(UnmanagedType.ByValTStr, SizeConst = 80)>]
        val mutable szTypeName: string 

        new(hIcon, iIcon, dwAttributes, szDisplayName, szTypeName) = {hIcon = hIcon; iIcon = iIcon; dwAttributes = dwAttributes; szDisplayName = szDisplayName; szTypeName = szTypeName }

    [<Struct; StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)>]
    type ShellExecuteInfo = 
        val mutable Size: int
        val mutable Mask: uint32
        val mutable Hwnd: IntPtr
        [<MarshalAs(UnmanagedType.LPTStr)>]
        val mutable Verb: string
        [<MarshalAs(UnmanagedType.LPTStr)>]
        val mutable File: string
        [<MarshalAs(UnmanagedType.LPTStr)>]
        val mutable Parameters: string
        [<MarshalAs(UnmanagedType.LPTStr)>]
        val mutable Directory: string
        val mutable Show: int
        val mutable ApplicationInstance: IntPtr
        val mutable IdList: IntPtr
        [<MarshalAs(UnmanagedType.LPTStr)>]
        val mutable Class: string
        val mutable ClassKey: IntPtr
        val mutable HotKey: uint32
        val mutable Icon: IntPtr
        val mutable Process: IntPtr

    [<DllImport("shell32")>]
    extern IntPtr SHGetFileInfo(
        string pszPath,
        int dwFileAttributes,
        ShFileInfo& psfi,
        int cbFileInfo,
        SHGetFileInfoConstants uFlags)

    [<DllImport("user32.dll", SetLastError = true)>]
    extern bool DestroyIcon(IntPtr hIcon)

    [<DllImport("user32.dll")>]
    extern int SetActiveWindow(IntPtr hwnd)

    [<DllImport("shell32.dll", CharSet = CharSet.Auto, SetLastError = true)>]
    extern bool ShellExecuteEx(ShellExecuteInfo& lpExecInfo)
