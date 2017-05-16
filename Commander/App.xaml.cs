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
using System.Threading;
using System.Windows;
using WebServer;

namespace Commander
{
    // TODO: WebServer in Git local auf Google
    public partial class App : Application
    {
        public App()
        {
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
            Shutdown(0);
        }

        [DllImport("kernel32.dll", EntryPoint = "GetProcessId", CharSet = CharSet.Auto)]
        static extern int GetProcessId(IntPtr handle);
        [DllImport("hook.dll", EntryPoint = "start", CharSet = CharSet.Auto)]
        static extern IntPtr Start(int pid);
    }
}
