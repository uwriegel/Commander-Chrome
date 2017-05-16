namespace Commander
open System
open System.Drawing
open System.Drawing.Imaging
open System.IO
open System.Runtime.InteropServices
open System.Runtime.Serialization
open System.Runtime.Serialization.Json  
open System.Threading
open ServiceImplementation
open SessionState
open WebServer
open Operation

module Service =
    [<DataContract>]
    type JsonInfo = {
        [<DataMember(EmitDefaultValue = false)>]
        mutable dir: string
        [<DataMember(EmitDefaultValue = false)>]
        mutable id: string }

    [<DataContract>]
    type Result = {
        [<DataMember(EmitDefaultValue = false)>]
        mutable result: string }
    
    let GetImage (file: string) = 
        let mutable fileInfo = new Api.ShFileInfo()

        let mutable recursiveDepth = 0
        let rec TryGetIcon () = 
            recursiveDepth <- recursiveDepth + 1
            let ico = file.ToLower()
            let fip = Api.SHGetFileInfo(ico, Api.FILE_ATTRIBUTE_NORMAL, &fileInfo, Marshal.SizeOf(fileInfo), Api.SHGetFileInfoConstants.SHGFI_ICON ||| Api.SHGetFileInfoConstants.SHGFI_SMALLICON ||| Api.SHGetFileInfoConstants.SHGFI_USEFILEATTRIBUTES ||| Api.SHGetFileInfoConstants.SHGFI_TYPENAME)
            match fileInfo.hIcon with
            | _ when fileInfo.hIcon = IntPtr.Zero ->
                let error = Marshal.GetLastWin32Error();
                match error with
                    | 997 when recursiveDepth < 3 -> 
                        Thread.Sleep(20)
                        TryGetIcon ()
                    | _ -> IntPtr.Zero
            | _ -> fileInfo.hIcon
        TryGetIcon ()
        
    let GetItems (service: IService) = 
        let info: JsonInfo = service.GetInput ()
        let cid = SetScopeId (service.State :?> State) (info.id)

        let ErrorResult _ = 
            if CheckScopeId (service.State :?> State) (info.id) cid then 
                service.SendResult(new obj())

        try 
            let checkScope () = 
                CheckScopeId (service.State :?> State) info.id cid 

            match info.dir with
            | "drives" -> GetDrives service checkScope
            | "Dienste" -> GetServices service
            | "Registry" -> GetRegistry service 
            | _ when info.dir.StartsWith "HKEY_" -> ()
            | _ -> GetFileItems service info.dir checkScope info.id
        with 
        | :? UnauthorizedAccessException as uae -> ErrorResult ()
        | _ -> ErrorResult ()

    let CreateFolder (service: IService) =
        let newName: NewName = service.GetInput ()

        let SendResult (service: IService) text = 
            let result = { result = text }   
            service.SendResult(result);

        match newName.directory with
        | "Dienste" | "drives" -> SendResult service "IncompatibleFolder"    
        | _ -> 
            try 
                CreateFolder newName
                SendResult service "OK"
            with
            | :? AlreadyExistError -> SendResult service "AlreadyExistsException"
            | :? UnauthorizedAccessException -> SendResult service "UnauthorizedAccessException"
            | _ -> SendResult service "Error"

    let ProcessItem (service: IService) =
        let pit: ProcessItemType = service.GetInput ()
        match pit with 
            | _ when pit.openWith -> OpenWith pit.file
            | _ when pit.showProperties -> ShowProperties pit.file
            | _ -> Show pit.file

    let GetIcon (session: ISession) file =
        let hicon = GetImage file 
        match hicon with
        | _ when hicon = IntPtr.Zero -> session.SendError("Nicht gefunden", "Nicht gefunden", 404, "Not Found")
        | _ ->
            use bitmap = Bitmap.FromHicon(hicon)
            Api.DestroyIcon(hicon) |> ignore
                
//                use b = new Bitmap(bitmap.Width, bitmap.Height)
//                b.MakeTransparent(Color.Black)
//                b.SetResolution(bitmap.HorizontalResolution, bitmap.VerticalResolution)
//                use g = Graphics.FromImage(b)
//                g.Clear(Color.White)
//                g.DrawImageUnscaled(bitmap, 0, 0);
//                b.MakeTransparent(Color.Black)
            use ms = new MemoryStream()
            //b.Save(ms, ImageFormat.Png)
            bitmap.MakeTransparent(Color.Black)
            bitmap.Save(ms, ImageFormat.Png)
            ms.Position <- int64 0
            session.SendStream(ms, "image/png", Constants.NotModified, false)

    let GetFile _ =
        ()

    let Elevate _ =
        ()
            


