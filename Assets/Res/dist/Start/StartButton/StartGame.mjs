import { StateNode } from "Common/StateNode.mjs";
var GameObject = CS.UnityEngine.GameObject;
var PlayerData = CS.Runner.PlayerData;
export class StartGame extends StateNode {
    main;
    button;
    enter() {
        //const button = this.agent.GetComponent($typeof(Button)) as Button;
        this.button.onClick.AddListener(() => {
            console.log("start clicked");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRHYW1lLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3RhcnQvU3RhcnRCdXR0b24vU3RhcnRHYW1lLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFJakQsSUFBTyxVQUFVLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUM7QUFDOUMsSUFBTyxVQUFVLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFFekMsTUFBTSxPQUFPLFNBQVUsU0FBUSxTQUFzQjtJQUNqRCxJQUFJLENBQWE7SUFDakIsTUFBTSxDQUFTO0lBRWYsS0FBSztRQUNELG9FQUFvRTtRQUNwRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUE7WUFDNUIsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3BDLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztnQkFDbEMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUM5QjtZQUNELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNsRCxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RCxpQ0FBaUM7UUFDckMsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDO0NBQ0oifQ==