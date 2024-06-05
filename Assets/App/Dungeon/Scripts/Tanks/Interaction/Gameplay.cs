using System.Collections;
using UnityEngine;
using UnityEngine.UI;

//main game component (listens the game state)
namespace TankShooter
{
    public class Gameplay : MonoBehaviour {

        //ui panels to show screens
        public CanvasGroup ingamePanel;
        public CanvasGroup winPanel;
        public CanvasGroup losePanel;
        public CanvasGroup pausePanel;
        public CanvasGroup loadingPanel;
        public Text startText;        //text shown before game started
        public Text enemyCounterText; //counter of enemies left

        //states of the game
        public enum GameState {
            Playing, Paused, GameOver, None
        }

        GameState currentGameState = GameState.None; //which state the game is have
        int enemiesLeft = 0;                         //how much enemies left on scene to complete level
	
        void Awake () {
            Time.timeScale = 0;                                           //freeze the game before start
            enemiesLeft = GameObject.FindObjectsOfType<EnemyAI>().Length; //calculate enemies count
            enemyCounterText.text = enemiesLeft.ToString();               //display enemies count
        }
	
        // Update is called once per frame
        void Update () {
            //start the game on mouse click/touch
            if (currentGameState == GameState.None && Input.GetMouseButtonDown(0)) {
                currentGameState = GameState.Playing;                                                   //change state
                startText.enabled = false;                                                              //hide start text
                Time.timeScale = 1;                                                                     //run the game
                if (GetComponent<AudioSource>() != null && PlayerPrefs.GetInt("music_enabled", 1) == 1) //play music if enabled
                    GetComponent<AudioSource>().Play();
                //if game is plaing and esc/back pressed - pause the game
            } else if (currentGameState == GameState.Playing && Input.GetKeyDown(KeyCode.Escape)) {
                SetPaused(true);
                //if game is paused and esc/back pressed - continue the game
            } else if (currentGameState == GameState.Paused && Input.GetKeyDown(KeyCode.Escape)) {
                SetPaused(false);
            }
        }

        public void SetPaused(bool paused) {
            if (paused) {
                pausePanel.gameObject.SetActive(true);
                pausePanel.alpha = 1;                                                                   //show paused screen
                pausePanel.blocksRaycasts = true;                                                       //enable buttons for paused screen
                Time.timeScale = 0;                                                                     //stop all scripts
                if (GetComponent<AudioSource>() != null && PlayerPrefs.GetInt("music_enabled", 1) == 1) //pause music if enabled
                    GetComponent<AudioSource>().Pause();
                currentGameState = GameState.Paused;
            } else {
                pausePanel.alpha = 0;              //hide paused screen
                pausePanel.blocksRaycasts = false; //disable buttons for paused screen
                pausePanel.gameObject.SetActive(false);
                Time.timeScale = 1;                                                                     //continue game
                if (GetComponent<AudioSource>() != null && PlayerPrefs.GetInt("music_enabled", 1) == 1) //continue music if enabled
                    GetComponent<AudioSource>().Play();
                currentGameState = GameState.Playing;
            }
        }

        //sets state to game over and show one of end screens (win or lose) after some time
        public void SetGameOver(bool isWin, float afterSeconds) {
            if (currentGameState == GameState.GameOver) {
                if (isWin)
                    return;
                StopCoroutine("ShowGameOver");
                winPanel.gameObject.SetActive(true);
                winPanel.alpha = 0;
                winPanel.blocksRaycasts = false;
                winPanel.gameObject.SetActive(false);
                StartCoroutine(ShowGameOver(isWin));
            } else {
                currentGameState = GameState.GameOver;
                StartCoroutine(ShowGameOver(isWin));
            }
        }

        IEnumerator ShowGameOver(bool isWin) {
            yield return new WaitForSeconds(2f);                                                    //wait 2 seconds
            if (GetComponent<AudioSource>() != null && PlayerPrefs.GetInt("music_enabled", 1) == 1) //stop music if enabled
                GetComponent<AudioSource>().Stop();
            if (isWin) { //if player wins
                winPanel.gameObject.SetActive(true);
                winPanel.GetComponent<Animation>().Play("show_panel"); //show win screen
                winPanel.blocksRaycasts = true;                        //enable buttons for win screen
            } else {
                losePanel.gameObject.SetActive(true);
                losePanel.GetComponent<Animation>().Play("show_panel"); //show lose screen
                losePanel.blocksRaycasts = true;                        //enable buttons for lose screen
            }
            yield return new WaitForSeconds(winPanel.GetComponent<Animation>()["show_panel"].length); //wait the end of animation
            Time.timeScale = 0;                                                                       //stop all scripts
        }

        public void SetGameState(GameState newGameState) {
            this.currentGameState = newGameState;
        }

        public GameState getGameState() {
            return this.currentGameState;
        }

        public bool isPlaying() { //check if the game is playing
            return currentGameState == GameState.Playing;
        }

        public bool isEnded() { //check if the game is ended
            return currentGameState == GameState.GameOver;
        }

        //called when the enemy is dead
        public void DecreaseEnemiesCount() {
            enemiesLeft--;                                  //decrease count of enemies left
            enemyCounterText.text = enemiesLeft.ToString(); //show enemies left 
            if (enemiesLeft == 0) {                         //if no more enemies - player wins
                SetGameOver(true, 1.5f);
            }
        }

    }
}