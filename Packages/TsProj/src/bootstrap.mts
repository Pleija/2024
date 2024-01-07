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

global.protobuf = require("protobufjs");

//console.log(getAllMethod(protobuf).join(", "));

protobuf.load("awesome.proto", (err, root) => {
    if (err) throw err;
    const type = root.lookupType("awesome.AwesomeMessage");
    console.log(type, "test proto");
});

Login.sayHello("puerts ready");


