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
import JsMain = CS.App.JsMain;
import SceneManager = CS.UnityEngine.SceneManagement.SceneManager;
import LoadSceneMode = CS.UnityEngine.SceneManagement.LoadSceneMode;
import Res = CS.Res;
import $typeof = puer.$typeof;
import GameObject = CS.UnityEngine.GameObject;
import Setting = CS.Models.Setting;

export const Setup = async function () {


    global.protobuf = require("protobufjs");

    //console.log(getAllMethod(protobuf).join(", "));


    protobuf.load("awesome.proto", (err, root) => {
        if (err) throw err;
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
        } else {
            SceneManager.LoadSceneAsync(1, LoadSceneMode.Additive);
        }
    }
}

//Setup().catch(console.error);


