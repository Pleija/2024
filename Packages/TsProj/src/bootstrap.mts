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
import SceneManager = CS.UnityEngine.SceneManagement.SceneManager;
import LoadSceneMode = CS.UnityEngine.SceneManagement.LoadSceneMode;
import Res = CS.Res;
import $typeof = puer.$typeof;
import GameObject = CS.UnityEngine.GameObject;
import Setting = CS.Models.Setting;
import UnityApi = CS.UnityApi;
import JsMain = CS.JsMain;
import Application = CS.UnityEngine.Application;
import Debug = CS.UnityEngine.Debug;
import { DevDebug } from "./debug.mjs";
import "Game/CardAgent.mjs";
import "Main/Main.mjs";


export const setup = function () {

    console.log("Js Start");


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
        const loc = Res.Exists("StartUp");
        if (loc != null && UnityApi.CompareVersion(Setting.self.ResVersion.Value, JsMain.self.baseVersion) > 0) {
            Res.Inst(loc, t => {
                if (t == null) {
                    SceneManager.LoadSceneAsync(1, LoadSceneMode.Additive);
                }
            });
        } else {
            SceneManager.LoadSceneAsync(1, LoadSceneMode.Additive);
        }
    }

    if (Application.isEditor || Debug.isDebugBuild) {
        DevDebug().catch(console.error);
    }
}

//Setup().catch(console.error);


