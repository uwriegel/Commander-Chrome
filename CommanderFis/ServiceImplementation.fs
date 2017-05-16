namespace Commander
open System
open System.Diagnostics
open System.Globalization
open System.IO
open System.Runtime.Serialization
open System.Runtime.Serialization.Json  
open System.Text
open System.Threading
open Microsoft.FSharp.Control
open Microsoft.FSharp.Collections
open WebServer
open ExifReader

module ServiceImplementation =
    [<DataContract>]
    type FileItem = {
        [<DataMember(EmitDefaultValue = false)>]
        mutable kind: string
        [<DataMember(EmitDefaultValue = false)>]
        mutable parent: string
        [<DataMember(EmitDefaultValue = false)>]
        mutable name: string
        fullname: string
        ext: string
        [<DataMember(EmitDefaultValue = false)>]
        mutable imageUrl: string
        [<DataMember(EmitDefaultValue = false)>]
        mutable isHidden: bool
        [<DataMember(EmitDefaultValue = false)>]
        mutable dateTime: string 
        [<DataMember(EmitDefaultValue = false)>]
        mutable fileSize: int64 }

    [<DataContract>]
    type ItemResult = {
        [<DataMember(EmitDefaultValue = false)>]
        mutable currentDirectory: string 
        [<DataMember(EmitDefaultValue = false)>]
        mutable items: FileItem[] }

    [<DataContract>]
    type UpdateItem = {
        [<DataMember(EmitDefaultValue = false)>]
        mutable index: int 
        [<DataMember(EmitDefaultValue = false)>]
        mutable version: string 
        [<DataMember(EmitDefaultValue = false)>]
        mutable dateTime: string }

    [<DataContract>]
    type UpdateItems = {
        [<DataMember(EmitDefaultValue = false, Name = "method")>]
        mutable methodName: string 
        [<DataMember(EmitDefaultValue = false)>]
        mutable items: UpdateItem [] }

    let mutable showHidden = false;

    let dateTimeIso = "yyyy-MM-ddTHH:mmK"
    
    let GetSafeItems getItems getFailItems =
        try 
            getItems ()
        with | :? UnauthorizedAccessException as uae -> getFailItems ()

    let IsHidden (attributes: FileAttributes) = 
        attributes.HasFlag FileAttributes.Hidden

    let GetImageUrl extension fullname = 
        let url = 
            match extension with
            | _ when String.Compare(extension, ".exe", true) = 0 -> fullname
            | _ -> extension
        String.Format("Commander/Icon?file={0}", url)

    let GetDrives (service: IService) checkScope = 
        let drives = (DriveInfo.GetDrives () 
        |> Seq.filter (fun drive -> drive.IsReady)
        |> Seq.sortBy(fun n -> n.Name)
        |> 
            Seq.map (fun drive -> { kind = "Drive"; parent = null;  name = drive.Name; fullname = null; ext = null;
                                    imageUrl = "images/drive.png"; isHidden=false; dateTime = null;  fileSize = 0L })
        |> 
            fun d -> Seq.append d [| 
                                    { kind = "Drive"; parent = null; name = "Registry"; fullname = null; imageUrl = "images/registry.png";
                                        ext = null; isHidden=false; dateTime = null; fileSize = 0L; }
                                    { kind = "Drive"; parent = null; name = "Dienste"; fullname = null; imageUrl = "images/service.png";
                                        ext = null; isHidden=false; dateTime = null; fileSize = 0L }
                                    { kind = "Drive"; parent = null; name = "Favoriten"; fullname = null; imageUrl = "images/favorite.png";
                                        ext = null; isHidden=false; dateTime = null; fileSize = 0L } |])

        let driveResult = { currentDirectory = "drives"; items = Seq.toArray drives }
        if checkScope () then
            service.SendResult(driveResult)

    let GetServices (service: IService) = 
        ()

    let GetFavorites (service: IService) = 
        ()

    let GetRegistry (service: IService) = 
        ()

    let GetFileItems (service: IService) (directory: string) checkScope inputId = 
            
        let directoryInfo = new DirectoryInfo(directory)

        let parent = 
            match directoryInfo.Parent with
            | null -> "drives"
            | _ -> directoryInfo.Parent.FullName

        let directoryItem = (GetSafeItems (fun () -> directoryInfo.GetDirectories()) (fun () ->  Array.empty<DirectoryInfo>) 
        |> 
            Seq.filter (fun directoryInfo ->
                match showHidden with
                    | true -> true 
                    | false when IsHidden directoryInfo.Attributes -> false
                    | _ -> true)
        |> 
            Seq.map (fun di -> { kind = "Directory"
                                 name = di.Name    
                                 parent = null
                                 ext = null;
                                 fullname = di.FullName
                                 imageUrl = "images/Folder.png"
                                 isHidden = IsHidden di.Attributes
                                 dateTime = di.LastWriteTime.ToUniversalTime().ToString dateTimeIso
                                 fileSize = 0L })
        |> 
            Seq.append [| { kind = "Parent"; name = ".."; parent = parent; fullname = null; imageUrl = "images/parentfolder.png";
                                                    ext = null; isHidden = false; dateTime = null; fileSize = 0L } |] )

        let fileItem = (GetSafeItems (fun () -> directoryInfo.GetFiles()) (fun () ->  Array.empty<FileInfo>) 
        |> 
            Seq.filter (fun fileInfo ->
                match showHidden with
                    | true -> true 
                    | false when IsHidden fileInfo.Attributes -> false
                    | _ -> true)
        |> 
            Seq.map (fun fi -> { kind = "File"
                                 name = fi.Name
                                 parent = null
                                 ext = fi.Extension;
                                 fullname = fi.FullName
                                 imageUrl = GetImageUrl fi.Extension fi.FullName
                                 isHidden = IsHidden fi.Attributes
                                 dateTime = fi.LastWriteTime.ToUniversalTime().ToString dateTimeIso
                                 fileSize = fi.Length }))
        let items = Seq.append directoryItem fileItem 
        let itemResult = { currentDirectory = directory; items = Seq.toArray items }

        let toDate (datestr: string) = 
            if datestr <> null then
                DateTime.ParseExact(datestr.TrimEnd( [| char 0 |]), "yyyy:MM:dd HH:mm:ss", CultureInfo.InvariantCulture).ToUniversalTime().ToString dateTimeIso
            else
                null

        let updateItemCreator () = 
            let mutable index = -1            
            let updateItem (item: FileItem) = 
                try 
                    index <- index + 1
                    let ext = if item.ext  <> null then item.ext.ToLower() else null
                    match ext with
                    | ".exe" | ".dll" -> 
                        if not (String.IsNullOrEmpty item.fullname) then 
                            let fvi = FileVersionInfo.GetVersionInfo item.fullname
                            let version = sprintf "%u.%u.%u.%u" fvi.FileMajorPart fvi.FileMinorPart fvi.FileBuildPart fvi.FilePrivatePart
                            Some { UpdateItem.index = index; version = version; dateTime = null }
                        else 
                            None
                    | ".jpg" -> 
                        use reader = GetExif item.fullname
                        if reader <> null then 
                            let dateTime = reader.GetTagValue 0x9003us :?> string |> toDate 
                            Some { UpdateItem.index = index; version = null; dateTime = dateTime }
                        else 
                            None
                    | _ -> None
                with
                | _ -> None
            updateItem
        
        if checkScope () then
            service.SendResult(itemResult)
        let updateItems = 
            let updateItem = updateItemCreator()
            items
            |> Seq.map(fun item -> updateItem item)
            |> Seq.filter(fun item -> item <> None)
            |> Seq.map(fun item -> item.Value)
            |> Seq.toArray
        let updateItems = { methodName = "update"; items = updateItems }
        if checkScope () then 
            service.SendEventResult(inputId, updateItems)

