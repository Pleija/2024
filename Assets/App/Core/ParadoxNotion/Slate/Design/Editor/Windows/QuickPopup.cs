#if UNITY_EDITOR

#region
using System;
using UnityEditor;
using UnityEngine;
#endregion

namespace Slate
{
    //Shows a GUI within a popup. The delegate includes the gui calls
    public class QuickPopup : PopupWindowContent
    {
        private Action Call;
        private Rect myRect = new Rect(0, 0, 320, 10);
        public QuickPopup(Action Call) => this.Call = Call;

        public static void Show(Action Call, Vector2 pos = default)
        {
            var e = Event.current;
            pos = pos == default ? new Vector2(e.mousePosition.x, e.mousePosition.y) : pos;
            var rect = new Rect(pos.x, pos.y, 0, 0);
            PopupWindow.Show(rect, new QuickPopup(Call));
        }

        public override Vector2 GetWindowSize() =>
                new Vector2(myRect.xMin + myRect.xMax, myRect.yMin + myRect.yMax);

        public override void OnGUI(Rect rect)
        {
            GUILayout.BeginVertical("box");
            Call();
            GUILayout.EndVertical();
            if (Event.current.type == EventType.Repaint)
                myRect.yMax = GUILayoutUtility.GetLastRect().yMax;
        }
    }
}

#endif
