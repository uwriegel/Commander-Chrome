namespace Commander
open System
open System.Threading
open Service
open SessionState
open WebServer

module Extension = 
    let wait = new ManualResetEvent(false)

type RequestInstance() = 
    interface IExtension with
        member this.Initialize(server: IServer) =
            ()

        member this.InitializeWebSocket(session: ISession) =
            session.State <- create ()

        member this.OnError(e: Exception, service: IService) =
            true

        member this.ServiceRequest(service: IService) =
            match service.Method with
            | "GetItems" -> GetItems service
            | "ProcessItem" -> ProcessItem service
            | "CreateFolder" -> CreateFolder service
            | _ -> 
            ()

        member this.Request(session: ISession, httpMethod: Method, path: string, urlQuery: UrlQueryComponents) =
            match urlQuery.Method with
            | "Icon" -> GetIcon session urlQuery.Parameters.["file"]
            | "File" -> GetFile ()
            | "Elevated" -> Elevate ()
            | _ -> ()

        member this.Closed (session: ISession) =
            Extension.wait.Set() |> ignore
            
        member this.Shutdown() =
            ()
