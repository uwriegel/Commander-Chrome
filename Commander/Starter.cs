using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using WebServer;

namespace Commander
{
    public static class Starter
    {
        public static IntPtr Hwnd { get; private set; }

        public static void Start(string path, long hwnd)
        {
            Hwnd = new IntPtr(hwnd);
            //var port = PortScanner.PortFound();
            var port = 20000;

            var pos = path.LastIndexOf("\\");
            path = path.Substring(0, pos);
            var webRoot = Path.Combine(path, @"..\..\..\WebApp");

            var configuration = new Configuration
            {
                Webroot = webRoot,
                Port = port
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
        }
    }
}
