import { StartButton } from "Start/StartButton.mjs";
import { StateNode } from "Common/StateNode.mjs";
import SceneManager = CS.UnityEngine.SceneManagement.SceneManager;
import $typeof = puer.$typeof;
import Button = CS.UnityEngine.UI.Button;
import GameObject = CS.UnityEngine.GameObject;
import PlayerData = CS.Runner.PlayerData;

export class StartGame extends StateNode<StartButton> {
    main: GameObject;
    button: Button;

    enter() {
        //const button = this.agent.GetComponent($typeof(Button)) as Button;
        this.button.onClick.AddListener(() => {
            console.log("start clicked")
            if (PlayerData.instance.ftueLevel == 0) {
                PlayerData.instance.ftueLevel = 1;
                PlayerData.instance.Save();
            }
            const start = GameObject.Find("/LoadStart/Start");
            start.SetActive(false);
            GameObject.Find("/Root").SetActive(false);
            this.main = GameObject.Find("/LoadMain");
            this.main.transform.Find("Main").gameObject.SetActive(true);
            //SceneManager.LoadScene("Main");
        });

    }
}
