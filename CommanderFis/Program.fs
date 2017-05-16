open System.Diagnostics
open System.Net.Sockets
open System.Threading
open Commander.Extension
open WebServer

[<EntryPoint>]
let main argv = 
    let portScan port = 
        let configuration = new Configuration()
        configuration.Port <- port

        let rec scan () =
            try
                let server = new Server(configuration)
                server.Start()
                server.Stop()
                configuration.Port
            with
                | :? SocketException as se when se.SocketErrorCode = SocketError.AddressAlreadyInUse
                    ->  configuration.Port <- configuration.Port + 1
                        scan ()
        scan()

    let server, adminMode = (fun () ->
        let mutable commanderPort = 0;
        let mutable adminMode = false

        let argument = 
            match argv.Length with 
                | 1 | 2 -> argv.[0] 
                | _ -> ""

        let configuration = new Configuration()

        match argument with
        | _ when argument.StartsWith("-admin") -> adminMode <- true
                                                  commanderPort <- int argv.[1]
                                                  configuration.Webroot <- @"."
        | _ when argument.StartsWith("-webroot") -> configuration.Webroot <- @"..\..\..\WebApp" 
        | _ -> configuration.Webroot <- @"."

        configuration.Port <- portScan 20000
        (new Server(configuration), adminMode))()

    ThreadPool.SetMinThreads(60, 60) |> ignore
    server.Configuration.Extensions.Add(ExtensionFactory.Current.Create("Commander", [|"/Commander"|], true))
    server.Start()

    if (not adminMode) then 
        // Favorites.Current.Load();
        let info = new ProcessStartInfo(@"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", "--app=http://localhost:" + string server.Configuration.Port)
        info.UseShellExecute <- true
        let p = new Process()
        p.EnableRaisingEvents <- true
        p.StartInfo <- info
        p.Start() |> ignore

    wait.WaitOne() |> ignore
    0 
