using System.Collections;
using UnityEngine;
using UnityEngine.UI;

//component with methods for click events of menu buttons 
namespace TankShooter
{
    public class MenuButtonEvents : MonoBehaviour {

        //ui panels to show screens
        public CanvasGroup mainPanel;
        public CanvasGroup levelsPanel;
        public CanvasGroup loadingPanel;
        public CanvasGroup optionsPanel;
        public Toggle soundButton;          //enable/disable sound button
        public Toggle musicButton;          //enable/disable music button
        public GameObject controlTypeLabel; //label wich have control type change button
	
        void Start () {
            //check current settings and show them
            if (PlayerPrefs.GetInt("sound_enabled", 1) != 1)
                soundButton.isOn = false;
            if (PlayerPrefs.GetInt("music_enabled", 1) != 1)
                musicButton.isOn = false;
#if !(UNITY_ANDROID || UNITY_IPHONE || UNITY_WP8)  
			controlTypeLabel.SetActive(false);
#else
            if (PlayerPrefs.GetInt("control_type", 1) == 2) {
                controlTypeLabel.GetComponentInChildren<Button>().
                    GetComponentInChildren<Text>().text = "Two Joysticks";
            }
#endif
        }
	
        // Update is called once per frame
        void Update () {
	
        }

        //hide one screen and show another
        void ChangePanel(CanvasGroup oldPanel, CanvasGroup newPanel) {
            StartCoroutine(ChangingPanels(oldPanel, newPanel));
        }

        IEnumerator ChangingPanels(CanvasGroup oldPanel, CanvasGroup newPanel) {
            oldPanel.blocksRaycasts = false;
            oldPanel.GetComponent<Animation>().Play("hide_panel");
            yield return new WaitForSeconds(oldPanel.GetComponent<Animation>()["hide_panel"].length);
            oldPanel.gameObject.SetActive(false);
            newPanel.gameObject.SetActive(true);
            newPanel.blocksRaycasts = true;
            newPanel.GetComponent<Animation>().Play("show_panel");
        }

        public void PlayButtonEvent() {
            //show "choose level" screen on play button clicked
            ChangePanel(mainPanel, levelsPanel);
        }

        public void OptionsButtonEvent() {
            //show "options" screen on options button clicked
            ChangePanel(mainPanel, optionsPanel);
        }

        public void ExitButtonEvent() {
            //close the game on exit button clicked
            Application.Quit();
        }

        //action on level button clicked
        public void LevelButtonEvent(int level) {
            levelsPanel.blocksRaycasts = false; //disable buttons
            levelsPanel.alpha = 0;              //hide levels screen
            loadingPanel.alpha = 1;             //show loading screen
            Application.LoadLevel(level);       //load selected level
        }
	
        public void BackButtonEvent() {
            //when back button clicked - hide current screen and show previous
            if (levelsPanel.alpha == 1)
                ChangePanel(levelsPanel, mainPanel);
            else if (optionsPanel.alpha == 1)
                ChangePanel(optionsPanel, mainPanel);
        }

        //action to change sound button clicked
        public void SoundToggleButtonEvent() {
            if (soundButton.isOn)  {
                PlayerPrefs.SetInt("sound_enabled", 1);
            } else {
                PlayerPrefs.SetInt("sound_enabled", 0);
            }
            PlayerPrefs.Save();
        }

        //action to change music button clicked
        public void MusicToggleButtonEvent() {
            if (musicButton.isOn) {
                PlayerPrefs.SetInt("music_enabled", 1);
            } else {
                PlayerPrefs.SetInt("music_enabled", 0);
            }
            PlayerPrefs.Save();
        }

        //action on change control type button clicked
        public void ControlTypeButtonEvent(Text label) {
            if (PlayerPrefs.GetInt("control_type", 1) == 1) {
                PlayerPrefs.SetInt("control_type", 2); //save control type
                label.text = "Two Joysticks";          //change button text
            } else if (PlayerPrefs.GetInt("control_type", 1) == 2) {
                PlayerPrefs.SetInt("control_type", 1); //save control type
                label.text = "Joystick + Touch";       //change button text
            }
        }

    }
}
