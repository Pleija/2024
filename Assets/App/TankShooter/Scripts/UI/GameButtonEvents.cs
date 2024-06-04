using UnityEngine;

//component with methods for click events of ingame buttons 
namespace TankShooter
{
    public class GameButtonEvents : MonoBehaviour {

        Gameplay gameplay; //main game component

        void Start() {
            gameplay = GetComponent<Gameplay>();
        }
	
        public void ResumeButtonEvent() {
            //continue the game when resume button clicked
            gameplay.SetPaused(false);
        }

        //load new scene (menu or level)
        void LoadScene(int scene) {
            if (gameplay.pausePanel.alpha == 1) { //if game is paused
                gameplay.pausePanel.alpha = 0;    //hide paused screen
                gameplay.pausePanel.blocksRaycasts = false;
            } else if (gameplay.winPanel.alpha == 1) { //if player wins
                gameplay.winPanel.alpha = 0;           //hide win screen
                gameplay.winPanel.blocksRaycasts = false;
            } else if (gameplay.losePanel.alpha == 1) { //if player lose
                gameplay.losePanel.alpha = 0;           //hide lose screen
                gameplay.losePanel.blocksRaycasts = false;
            }
            gameplay.loadingPanel.gameObject.SetActive(true);
            gameplay.loadingPanel.alpha = 1; //show loading screen
            Application.LoadLevel(scene);    //load scene by id
        }
	
        public void RestartButtonEvent() {
            //reload current scene on restart button clicked
            LoadScene(Application.loadedLevel);
        }

        public void ExitButtonEvent() {
            Time.timeScale = 1; 
            //load menu scene on exit button clicked
            LoadScene(0);
        }
    }
}
