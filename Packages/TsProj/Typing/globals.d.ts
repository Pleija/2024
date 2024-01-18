declare global {

    import {BaseTag, $} from "Common/BaseTag.mjs";
    import protobuf from "protobufjs";

    import {StartButton} from "Start/StartButton.mjs";
    import {Login} from "Start/Login.mjs";
    import {Updating} from "Start/Updating.mjs";
    import {MenuArea} from "Main/MenuArea.mjs";
    import {Navbar} from "Main/Navbar.mjs";
    import {Game} from "Main/Game.mjs";
    import {MainHP} from "Main/MainHP.mjs";
    import {LevelStart} from "Main/LevelStart.mjs";
    import {MissionPage} from "Main/MissionPage.mjs";
    import {ShopPage} from "Main/ShopPage.mjs";
    import {HeroesPage} from "Main/HeroesPage.mjs";
    import {CardsPage} from "Main/CardsPage.mjs";
    import {ClanPage} from "Main/ClanPage.mjs";
    import {CardAgent} from "Main/CardAgent.mjs";
    import {Settings} from "MissionPage/Settings.mjs";
    import {HpSlider} from "Game/HpSlider.mjs";
    import {LoadingCharPos} from "Main/LoadingCharPos.mjs";
    import {ChangeCharacterBtn} from "HeroesPage/ChangeCharacterBtn.mjs";
    import {ChangeCharcter} from "Game/ChangeCharcter.mjs";
    import {ChangeCharacter} from "Game/ChangeCharacter.mjs";
    import {BackupCard} from "Game/BackupCard.mjs";
    import {StartUp} from "Loading/StartUp.mjs";
    declare var $StartUp: StartUp;
    declare var $BackupCard: BackupCard;
    declare var $ChangeCharacter: ChangeCharacter;
    declare var $ChangeCharacterBtn: ChangeCharacterBtn;
    declare var $LoadingCharPos: LoadingCharPos;
    declare var $HpSlider: HpSlider;
    declare var $Settings: Settings;
    declare var $CardAgent: CardAgent;
    declare var $ClanPage: ClanPage;
    declare var $CardsPage: CardsPage;
    declare var $HeroesPage: HeroesPage;
    declare var $ShopPage: ShopPage;
    declare var $MissionPage: MissionPage;
    declare var $LevelStart: LevelStart;

    declare var $MainHP: MainHP;
    declare var $Game: Game;
    declare var $Navbar: Navbar;
    declare var $MenuArea: MenuArea;
    declare var $Updating: Updating;
    declare var $StartButton: StartButton;
    declare var $Login: Login;

    declare var protobuf: protobuf;
    declare var $: $;

    declare interface Class<T> {
        new(...args: any[]): T
    }

    declare function getAllMethod(toCheck: any): string[];

    declare function bindClass<T>(csObj: T, ...targetClass: any[]): T;
}


export {}
declare module 'csharp' {
    export = CS;
}