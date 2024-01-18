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

global.protobuf = require("protobufjs");

//console.log(getAllMethod(protobuf).join(", "));


protobuf.load("awesome.proto", (err, root) => {
    if (err) throw err;
    const type = root.lookupType("awesome.AwesomeMessage");
    console.log(type, "test proto");
});


// $Login.sayHello("puerts ready");


