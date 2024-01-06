declare global {
    import { GameManager } from "Main/GameManager.mjs";
    import { Test } from "Tags/Test.mjs";
    import { BaseTag, $ } from "Common/BaseTag.mjs";
    import { MainMenu } from "Tags/MainMenu.mjs";
    import { StartButton } from "Start/StartButton.mjs";
    import { TutorialState } from "Main/TutorialState.mjs";
    import { SeededRun } from "Main/SeededRun.mjs";
    import { LoadoutState } from "Main/LoadoutState.mjs";
    import { GameOverState } from "Main/GameOverState.mjs";
    import { GameState } from "Main/GameState.mjs";
    import { Modifier } from "Main/Modifier.mjs";
    import protobuf from "protobufjs";
    
    import { Login } from "Start/Login.mjs";
    import { Updating } from "Start/Updating.mjs";
    import { MenuArea } from "Main/MenuArea.mjs";
    declare var MenuArea: MenuArea;
    declare var Updating: Updating;
    declare var StartButton: StartButton;
    declare var Login: Login;

    declare var protobuf: protobuf;
    declare var Modifier: Modifier;
    declare var GameState: GameState;
    declare var GameOverState: GameOverState;
    declare var LoadoutState: LoadoutState;
    declare var SeededRun: SeededRun;

    declare var $: $;
    declare var $MainMenu: MainMenu;
    declare var $Test: Test;
    declare var GameManager: GameManager
    declare var TutorialState: TutorialState;

    declare function getAllMethod(toCheck: any): string[];
}

export {}
declare module 'csharp' {
    export = CS;
}