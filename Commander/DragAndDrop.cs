using System;
using System.Runtime.InteropServices;

namespace Commander
{
    class DragAndDrop
    {
        public static DragAndDrop Current { get; } = new DragAndDrop();

        public void Initialize(IntPtr hwnd)
        {
            InitializeDragAndDrop(hwnd);
            var module = LoadLibrary("Api.dll");
        }

        DragAndDrop()
        {
        }

        [DllImport("Api.dll", EntryPoint = "initialize_drag_and_drop")]
        static extern void InitializeDragAndDrop(IntPtr hwnd);
        [DllImport("kernel32.dll")]
        static extern IntPtr LoadLibrary([MarshalAs(UnmanagedType.LPStr)] string fileName);
    }
}
