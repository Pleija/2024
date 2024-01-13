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

import "Start/Login.mjs";
import "Main/Modifier.mjs";
import "Main/GameState.mjs";
import "Main/GameOverState.mjs";
import "Main/LoadoutState.mjs";
import "Main/SeededRun.mjs";
import "Common/Helpers.mjs";
import "Tags/MainMenu.mjs";
import "Tags/Test.mjs";
import "Start/StartButton.mjs";
import "Main/GameManager.mjs";
import $typeof = puer.$typeof;
import Boolean = CS.System.Boolean;
import JsEnv = CS.Puerts.JsEnv;

global.protobuf = require("protobufjs");

//console.log(getAllMethod(protobuf).join(", "));
JsEnv.self.UsingAction($typeof(CS.UnityEngine.Vector2));
JsEnv.self.UsingAction($typeof(CS.System.Int32));
JsEnv.self.UsingAction($typeof(CS.System.String));
JsEnv.self.UsingAction($typeof(CS.System.Single));

protobuf.load("awesome.proto", (err, root) => {
    if (err) throw err;
    const type = root.lookupType("awesome.AwesomeMessage");
    console.log(type, "test proto");
});

$Login.sayHello("puerts ready");


