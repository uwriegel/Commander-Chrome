using System;
using System.Collections.Generic;
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
        public static void Start(string text)
        {
            //var port = PortScanner.PortFound();
            var port = 20000;

            var configuration = new Configuration
            {
                //Webroot = Environment.CommandLine.Contains("-webroot") ? @"..\..\..\WebApp" : @".",
                //Webroot = @"..\..\..\..\webroot\Studie",
                Webroot = @"C:\Users\urieg\Documents\Projects\Git\Commander\WebApp",
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
