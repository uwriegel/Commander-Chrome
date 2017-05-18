using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace Commander
{
    class DragAndDrop
    {
        public static DragAndDrop Current { get; } = new DragAndDrop();

        public void Initialize(IntPtr hwnd)
        {
            var cp = Marshal.GetFunctionPointerForDelegate<DragAndDropCallbackDelegate>(dragAndDropCallback);
            InitializeDragAndDrop(hwnd, cp);
            var module = LoadLibrary("Api.dll");
        }

        bool DragAndDropCallback(int x, int y)
        {
            EventSession.DragOver(x, y);
            return true;
        }

        DragAndDrop()
        {
            dragAndDropCallback = new DragAndDropCallbackDelegate(DragAndDropCallback);
        }

        DragAndDropCallbackDelegate dragAndDropCallback;

        delegate bool DragAndDropCallbackDelegate(int x, int y);
        [DllImport("Api.dll", EntryPoint = "initialize_drag_and_drop")]
        static extern void InitializeDragAndDrop(IntPtr hwnd, IntPtr callback);
        [DllImport("kernel32.dll")]
        static extern IntPtr LoadLibrary([MarshalAs(UnmanagedType.LPStr)] string fileName);
    }
}
