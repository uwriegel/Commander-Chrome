using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Commander
{
    public static class Dispatcher
    {
        public static Control WindowElement { get; private set; }

        public static void Initialize(IntPtr hwnd)
        {
            WindowElement = new Control()
            {
                Visible = false
            };
            WindowElement.CreateControl();
            Api.SetParent(WindowElement.Handle, hwnd);
        }

        public static void BeginInvoke(Delegate method)
        {
            WindowElement.BeginInvoke(method);
        }
    }
}
