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
            var cp2 = Marshal.GetFunctionPointerForDelegate<OnDragLeaveDelegate>(OnDragLeave);
            InitializeDragAndDrop(hwnd, cp, cp2);
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

        DragAndDrop()
        {
            onDragOver = new OnDragOverDelegate(OnDragOver);
            onLeave = new OnDragLeaveDelegate(OnDragLeave);
        }

        OnDragOverDelegate onDragOver;
        OnDragLeaveDelegate onLeave;

        delegate bool OnDragOverDelegate(int x, int y);
        delegate void OnDragLeaveDelegate();
        [DllImport("Api.dll", EntryPoint = "initialize_drag_and_drop")]
        static extern void InitializeDragAndDrop(IntPtr hwnd, IntPtr onDragOverCallback, IntPtr onDragLeaveCallback);
        [DllImport("kernel32.dll")]
        static extern IntPtr LoadLibrary([MarshalAs(UnmanagedType.LPStr)] string fileName);
    }
}
