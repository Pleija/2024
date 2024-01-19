import "Game/ChangeCharacter.mjs";
import "HeroesPage/ChangeCharacterBtn.mjs";
import "Main/LoadingCharPos.mjs";
import "Game/HpSlider.mjs";
import "MissionPage/Settings.mjs";
import "Main/CardAgent.mjs";
import "Main/ClanPage.mjs";
import "Main/CardsPage.mjs";
import "Main/HeroesPage.mjs";
import "Main/ShopPage.mjs";
import "Main/MissionPage.mjs";
import "Main/LevelStart.mjs";
import "Main/MainHP.mjs";
import "Main/Game.mjs";
import "Main/Navbar.mjs";
import "Main/MenuArea.mjs";
import "Start/Updating.mjs";
import "Main/Mission.mjs";
import "Start/StartButton.mjs";
import "Common/Helpers.mjs";
import "Common/TypeUtils.mjs";
import "Game/BackupCard.mjs";
import "Loading/StartUp.mjs";
var JsMain = CS.App.JsMain;
var SceneManager = CS.UnityEngine.SceneManagement.SceneManager;
var LoadSceneMode = CS.UnityEngine.SceneManagement.LoadSceneMode;
var Res = CS.Res;
var $typeof = puer.$typeof;
var GameObject = CS.UnityEngine.GameObject;
var Setting = CS.Models.Setting;
export const Setup = async function () {
    global.protobuf = require("protobufjs");
    //console.log(getAllMethod(protobuf).join(", "));
    protobuf.load("awesome.proto", (err, root) => {
        if (err)
            throw err;
        const type = root.lookupType("awesome.AwesomeMessage");
        console.log(type, "test proto");
    });
    //todo 启动场景
    if (JsMain.needBoot) {
        JsMain.needBoot = false;
        const loc = Res.Exists("StartUp", $typeof(GameObject));
        if (loc != null && Setting.self.ResVersion.Value > JsMain.self.baseVersion) {
            loc.Inst(t => {
                if (t == null) {
                    SceneManager.LoadSceneAsync(1, LoadSceneMode.Additive);
                }
            });
        }
        else {
            SceneManager.LoadSceneAsync(1, LoadSceneMode.Additive);
        }
    }
};
//Setup().catch(console.error);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvYm9vdHN0cmFwLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLDBCQUEwQixDQUFDO0FBQ2xDLE9BQU8sbUNBQW1DLENBQUM7QUFDM0MsT0FBTyx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sMEJBQTBCLENBQUM7QUFDbEMsT0FBTyxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8saUJBQWlCLENBQUM7QUFDekIsT0FBTyxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyx1QkFBdUIsQ0FBQztBQUUvQixPQUFPLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLHFCQUFxQixDQUFDO0FBQzdCLElBQU8sTUFBTSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQzlCLElBQU8sWUFBWSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQztBQUNsRSxJQUFPLGFBQWEsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUM7QUFDcEUsSUFBTyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNwQixJQUFPLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzlCLElBQU8sVUFBVSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDO0FBQzlDLElBQU8sT0FBTyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBRW5DLE1BQU0sQ0FBQyxNQUFNLEtBQUssR0FBRyxLQUFLO0lBR3RCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRXhDLGlEQUFpRDtJQUdqRCxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUN6QyxJQUFJLEdBQUc7WUFBRSxNQUFNLEdBQUcsQ0FBQztRQUNuQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxXQUFXO0lBQ1gsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDeEIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDdkQsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ1osWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMzRCxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO2FBQU0sQ0FBQztZQUNKLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRCxDQUFDO0lBQ0wsQ0FBQztBQUNMLENBQUMsQ0FBQTtBQUVELCtCQUErQiJ9