using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.ServiceProcess;
using System.Threading.Tasks;
using System.Windows;
using CommanderShared;
using HttpServer.Client;

namespace Elevation
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        public App()
        {
            var arg = Environment.GetCommandLineArgs().Length > 1 ? Environment.GetCommandLineArgs()[1] : null;
            if (arg == "exit")
                Shutdown();
            Client.UseWebSockets = true;
            client = ClientFactory.Create("localhost:9865/Commander", this);
            client.ClosedEvent += Client_ClosedEvent;
            var result = client.Invoke<AdminInit, AdminInitResult>(new AdminInit());
        }

        void Client_ClosedEvent(object sender, EventArgs e)
        {
            Dispatcher.Invoke(() => Shutdown());
        }

        public void StartServices(IClientRequest request)
        {
            Items input = request.GetInput<Items>();
            ServiceStateProcessor.StartServices(input);
            // service.SendResult(new object());
        }

        public void StopServices(IClientRequest request)
        {
            Items input = request.GetInput<Items>();
            ServiceStateProcessor.StopServices(input);
            //            service.SendResult(new object());
        }

        public void CreateFolder(IClientRequest request)
        {
            NewName input = request.GetInput<NewName>();
            try
            {
                FolderCreator.Create(input);
            }
            catch { }
        }

        Client client;
    }
}
