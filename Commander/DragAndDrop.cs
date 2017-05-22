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
            var cp = Marshal.GetFunctionPointerForDelegate<OnDragOverDelegate>(onDragOver);
            var cp2 = Marshal.GetFunctionPointerForDelegate<OnDragLeaveDelegate>(onDragLeave);
            var cp3 = Marshal.GetFunctionPointerForDelegate<OnDropDelegate>(onDrop);
            InitializeDragAndDrop(hwnd, cp, cp2, cp3);
            var module = LoadLibrary("Api.dll");
        }

        bool OnDragOver(int x, int y)
        {
            EventSession.DragOver(x, y);
            return true;
        }

        void OnDragLeave()
        {
            EventSession.DragLeave();
        }

        void OnDrop(int x, int y, [MarshalAs(UnmanagedType.LPWStr)] string files)
        {
            EventSession.Drop(x, y, files);
        }

        DragAndDrop()
        {
            onDragOver = new OnDragOverDelegate(OnDragOver);
            onDragLeave = new OnDragLeaveDelegate(OnDragLeave);
            onDrop = new OnDropDelegate(OnDrop);
        }

        OnDragOverDelegate onDragOver;
        OnDragLeaveDelegate onDragLeave;
        OnDropDelegate onDrop;

        delegate bool OnDragOverDelegate(int x, int y);
        delegate void OnDragLeaveDelegate();
        delegate void OnDropDelegate(int x, int y, [MarshalAs(UnmanagedType.LPWStr)] string files);
        [DllImport("Api.dll", EntryPoint = "initialize_drag_and_drop")]
        static extern void InitializeDragAndDrop(IntPtr hwnd, IntPtr onDragOverCallback, IntPtr onDragLeaveCallback, IntPtr onDropCallback);
        [DllImport("kernel32.dll")]
        static extern IntPtr LoadLibrary([MarshalAs(UnmanagedType.LPStr)] string fileName);
    }
}
