using UnityEditor;
using UnityEditor.Localization;

public class Locale
{
    public const string k_Menu = "Debug/Show Locale Menu";

    [MenuItem(k_Menu)]
    static void ShowMenu()
    {
        // Check/Uncheck menu.
        var isChecked = !UnityEditor.Menu.GetChecked(k_Menu);
        UnityEditor.Menu.SetChecked(k_Menu, isChecked);

        // Save to EditorPrefs.
        //EditorPrefs.SetBool(k_Menu, isChecked);
        LocalizationEditorSettings.ShowLocaleMenuInGameView = isChecked;
    }

    [MenuItem(k_Menu, true,-100)]
    static bool Valid()
    {
        UnityEditor.Menu.SetChecked(k_Menu, LocalizationEditorSettings.ShowLocaleMenuInGameView);
        return true;
    }
}