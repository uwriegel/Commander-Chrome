#pragma once

using namespace System;
#include "ManagedWndShadow.h"

namespace Native
{
	/// <summary>
	/// Hiermit kann der Caseris-Schatten, der in der C++-Klasse CWndShadow definiert ist, für C#-Anwendungen genutzt werden
	/// verwendet werden
	/// </summary>
	public ref class WindowShadowBase
	{
	public:
		WindowShadowBase();
		~WindowShadowBase() { this->!WindowShadowBase(); } // destructor, Dispose
		!WindowShadowBase(); // finalizer

		/// <summary>
		/// Fensterhandle des Schattens
		/// </summary>
		property IntPtr Handle { IntPtr get(); }

		/// <summary>
		/// Einmalige Initialisierung des Schattens, muss aufgerufen werden, <em>bevor</em> ein Schatten erstmalig angelegt wird. Hiermit wird die
		/// HInstance bestimmt und die Schattenfesnterklasse registriert
		/// </summary>
		static bool Initialize();
		/// <summary>
		/// Erzeugen eines Schattens für ein bestimmtes Fenster
		/// </summary>
		/// <param name="parentWnd">Das Fenster, welches mit einem Schatten versehen werden soll</param>
		void Create(IntPtr parentWnd);
		/// <summary>
		/// Zerstören des Schattens 
		/// </summary>
		void Destroy();

		/// <summary>
		/// Die Breite des Schattens in Pixeln
		/// </summary>
		property int Size { int get(); void set(int); }
		/// <summary>
		/// Position des Schattens relativ zur Mitte in Pixel
		/// </summary>
		property Tuple<int, int>^ Position { Tuple<int, int>^ get(); void set(Tuple<int, int>^); }
		/// <summary>
		/// Schärfe bzw. Verschwommenheit des Schattens
		/// </summary>
		property unsigned int Sharpness { unsigned int get(); void set(unsigned int); }
		/// <summary>
		/// Dunkelheit des Schattens
		/// </summary>
		property unsigned int Darkness { unsigned int get(); void set(unsigned int); }
		/// <summary>
		/// Farbe des Schattens
		/// </summary>
		/// <remarks>
		/// Der Wert ist von Typ COLORREF, also nicht RGB sondern BGR, und der Alphakanal ist 0
		/// </remarks>
		property COLORREF Color { COLORREF get(); void set(COLORREF); }

	protected:
		virtual IntPtr ParentWndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, bool% handled);

	private:
		ManagedWndShadow *shadow;
		bool inParentProcedure;
	};
}
