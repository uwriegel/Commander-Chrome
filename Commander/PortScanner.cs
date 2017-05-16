using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using WebServer;

namespace Commander
{
    static class PortScanner
    {
        public static int PortFound()
        {
            int port = 20000;
            Configuration configuration = new Configuration
            {
                Port = port,
            };
            while (true)
            {
                try
                {
                    Server server = new Server(configuration);
                    server.Start();
                    server.Stop();
                    break;
                }
                catch (SocketException se) when (se.SocketErrorCode == SocketError.AddressAlreadyInUse)
                {
                    if (se.SocketErrorCode == SocketError.AddressAlreadyInUse)
                        configuration.Port++;
                    else
                        throw;
                }
            }
            return configuration.Port;
        }
    }
}
