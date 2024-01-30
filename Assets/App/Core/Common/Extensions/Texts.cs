using UnityEngine;
using UnityEngine.UI;

namespace Extensions
{
    public static class Texts
    {
        public static void LogText(this Text ui, string format, params object[] values) {
            Debug.Log(textAs(ui, format, values));
        }

        public static void textAsLog(this Text ui, string format, params object[] values) {
            Debug.Log(textAs(ui, format, values));
        }

        public static void textAsLog(this Text ui, (string zh, string en) format, params object[] values) {
            Debug.Log(textAs(ui, format, values));
        }

        public static string textAs(this Text ui, string format, params object[] values) {
            if (ui == null) return null;

            return ui.text = string.Format(format, values);
        }

        public static string textAs(this Text ui, (string zh, string en) format, params object[] values) {
            if (ui == null) return null;

            return ui.text = string.Format(format.zh, values);
        }
    }
}
