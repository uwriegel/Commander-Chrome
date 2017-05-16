using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Windows;
using WebServer;

namespace Commander
{
    public partial class App : Application
    {
        public App()
        {
            var arg = Environment.GetCommandLineArgs().Length > 1 ? Environment.GetCommandLineArgs()[1] : null;
            var port = 0;

            if (arg?.StartsWith("-adminMode") ?? false)
            {
                var exitCode =  AdminRights.Process(Environment.GetCommandLineArgs().Skip(2).ToArray()) ? 0 : -1;
                Shutdown(exitCode);
                return;
            }
            port = PortScanner.PortFound();
            var configuration = new Configuration
            {
                Webroot = Environment.CommandLine.Contains("-webroot") ? @"..\..\..\WebApp" : @".",
                //Webroot = @"..\..\..\..\webroot\Studie",
                Port = port,
            };
            configuration.Extensions.Add(ExtensionFactory.Current.Create("Commander", new[] { "/Commander" }, true));
            try
            {
                var server = new Server(configuration);
                server.Start();
            }
            catch (SocketException se) when (se.SocketErrorCode == SocketError.AddressAlreadyInUse)
            {
                if (se.SocketErrorCode == SocketError.AddressAlreadyInUse)
                    configuration.Port++;
                else
                    throw;
            }

            var info = new ProcessStartInfo(@"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", $"--app=http://localhost:{configuration.Port}")
            {
                UseShellExecute = true,
            };

            var process = new Process
            {
                EnableRaisingEvents = true,
                StartInfo = info
            };
            process.Start();


            var eid = GetProcessId(process.Handle);

            MessageBox.Show($"{eid}");

            int u = 0;
        }

        [DllImport("kernel32.dll", EntryPoint = "GetProcessId", CharSet = CharSet.Auto)]
        static extern int GetProcessId(IntPtr handle);
    }
}
