using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Forms;
using WebServer;

namespace Commander
{
    public static class Starter
    {
        public static IntPtr Hwnd { get; private set; }

        [STAThread]
        static void Main()
        {
            // TODO: WebServer in Git local auf Google
            // TODO: https://stackoverflow.com/questions/5990019/drag-and-drop-files-from-a-zip-folder-into-my-window
            var info = new ProcessStartInfo(@"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", $"--app=http://localhost:20000")
            {
                UseShellExecute = true,
            };

            var process = new Process
            {
                EnableRaisingEvents = true,
                StartInfo = info
            };
            process.Start();

            var pid = GetProcessId(process.Handle);
            Start(pid);
        }

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

            DragAndDrop.Current.Initialize(Hwnd);
        }

        [DllImport("kernel32.dll", EntryPoint = "GetProcessId", CharSet = CharSet.Auto)]
        static extern int GetProcessId(IntPtr handle);
        [DllImport("hook.dll", EntryPoint = "start", CharSet = CharSet.Auto)]
        static extern IntPtr Start(int pid);
    }
}
