namespace MoreTags
{
    public static class Tag
    {
        public static AllTags all = new AllTags();
        public static FSMGroup FSM = new FSMGroup("FSM");
        public static ColorGroup Color = new ColorGroup("Color");
        public static ObjectGroup Object = new ObjectGroup("Object");

        public static IdGroup Id = new IdGroup("Id");
        public static ItGroup It = new ItGroup("It");
        public static OnGroup On = new OnGroup("On");
        public static UiGroup Ui = new UiGroup("Ui");
        public static TagName MenuButton = new TagName("MenuButton");
        public static TagName MainMenu = new TagName("MainMenu");
        public static TagName AutoUpdate = new TagName("AutoUpdate");
        public static TagName Hello = new TagName("Hello");
        public static TagName Test = new TagName("Test");
    }

    public class ObjectGroup : TagGroup
    {
        public ObjectGroup(string name) : base(name) { }
        public TagName Cube = new TagName("Object.Cube");
        public TagName Sphere = new TagName("Object.Sphere");
        public TagName Capsule = new TagName("Object.Capsule");
        public TagName Cylinder = new TagName("Object.Cylinder");
    }

    public class ColorGroup : TagGroup
    {
        public ColorGroup(string name) : base(name) { }
        public TagName Red = new TagName("Color.Red");
        public TagName Green = new TagName("Color.Green");
        public TagName Blue = new TagName("Color.Blue");
        public TagName Yellow = new TagName("Color.Yellow");
        public TagName Cyan = new TagName("Color.Cyan");
        public TagName Magenta = new TagName("Color.Magenta");
    }

    public class FSMGroup : TagGroup
    {
        public FSMGroup(string name) : base(name) { }
        public TagName BackupCard = new TagName("FSM.BackupCard");
        public TagName CardAgent = new TagName("FSM.CardAgent");
        public TagName CardManager = new TagName("FSM.CardManager");
        public TagName CardsPage = new TagName("FSM.CardsPage");
        public TagName ChangeCharacter = new TagName("FSM.ChangeCharacter");
        public TagName ChangeCharacterBtn = new TagName("FSM.ChangeCharacterBtn");
        public TagName ChangeCharcter = new TagName("FSM.ChangeCharcter");
        public TagName ClanPage = new TagName("FSM.ClanPage");
        public TagName Game = new TagName("FSM.Game");
        public TagName GameManager = new TagName("FSM.GameManager");
        public TagName GameOverState = new TagName("FSM.GameOverState");
        public TagName GameState = new TagName("FSM.GameState");
        public TagName HeroesPage = new TagName("FSM.HeroesPage");
        public TagName HpSlider = new TagName("FSM.HpSlider");
        public TagName LevelStart = new TagName("FSM.LevelStart");
        public TagName Loading = new TagName("FSM.Loading");
        public TagName LoadingCharPos = new TagName("FSM.LoadingCharPos");
        public TagName LoadoutState = new TagName("FSM.LoadoutState");
        public TagName Login = new TagName("FSM.Login");
        public TagName Main = new TagName("FSM.Main");
        public TagName MainHP = new TagName("FSM.MainHP");
        public TagName MenuArea = new TagName("FSM.MenuArea");
        public TagName Mission = new TagName("FSM.Mission");
        public TagName MissionPage = new TagName("FSM.MissionPage");
        public TagName Misson = new TagName("FSM.Misson");
        public TagName MissonBtn = new TagName("FSM.MissonBtn");
        public TagName Modifier = new TagName("FSM.Modifier");
        public TagName Navbar = new TagName("FSM.Navbar");
        public TagName SeededRun = new TagName("FSM.SeededRun");
        public TagName Settings = new TagName("FSM.Settings");
        public TagName ShopPage = new TagName("FSM.ShopPage");
        public TagName Start = new TagName("FSM.Start");
        public TagName StartButton = new TagName("FSM.StartButton");
        public TagName StartUp = new TagName("FSM.StartUp");
        public TagName Test = new TagName("FSM.Test");
        public TagName UICamera = new TagName("FSM.UICamera");
        public TagName Updating = new TagName("FSM.Updating");
    }

    public class IdGroup : TagGroup
    {
        public IdGroup(string name) : base(name) { }
        public TagName Action = new TagName("Id.Action");
        public TagName Actor = new TagName("Id.Actor");
        public TagName All = new TagName("Id.All");
        public TagName Any = new TagName("Id.Any");
        public TagName Bot = new TagName("Id.Bot");
        public TagName Bundle = new TagName("Id.Bundle");
        public TagName CreateRoom = new TagName("Id.CreateRoom");
        public TagName EditorOnly = new TagName("Id.EditorOnly");
        public TagName EndPoint = new TagName("Id.EndPoint");
        public TagName FieldOfView = new TagName("Id.FieldOfView");
        public TagName ForbiddenArea = new TagName("Id.ForbiddenArea");
        public TagName Friend = new TagName("Id.Friend");
        public TagName GameManagerStart = new TagName("Id.GameManagerStart");
        public TagName Goal = new TagName("Id.Goal");
        public TagName HideOnReady = new TagName("Id.HideOnReady");
        public TagName HideOnStart = new TagName("Id.HideOnStart");
        public TagName MainMenu = new TagName("Id.MainMenu");
        public TagName Managers = new TagName("Id.Managers");
        public TagName None = new TagName("Id.None");
        public TagName OnGameBegin = new TagName("Id.OnGameBegin");
        public TagName OnStart = new TagName("Id.OnStart");
        public TagName Opponent = new TagName("Id.Opponent");
        public TagName Parent = new TagName("Id.Parent");
        public TagName Parents = new TagName("Id.Parents");
        public TagName Pause = new TagName("Id.Pause");
        public TagName Plan = new TagName("Id.Plan");
        public TagName Player = new TagName("Id.Player");
        public TagName PowerBar = new TagName("Id.PowerBar");
        public TagName PowerText = new TagName("Id.PowerText");
        public TagName PreviewRoot = new TagName("Id.PreviewRoot");
        public TagName Red = new TagName("Id.Red");
        public TagName Run = new TagName("Id.Run");
        public TagName ScoreBar = new TagName("Id.ScoreBar");
        public TagName ScoreText = new TagName("Id.ScoreText");
        public TagName Self = new TagName("Id.Self");
        public TagName Settings = new TagName("Id.Settings");
        public TagName ShowOnReady = new TagName("Id.ShowOnReady");
        public TagName ShowOnStart = new TagName("Id.ShowOnStart");
        public TagName Skier = new TagName("Id.Skier");
        public TagName StartGame = new TagName("Id.StartGame");
        public TagName StartPoint = new TagName("Id.StartPoint");
        public TagName State = new TagName("Id.State");
        public TagName Test = new TagName("Id.Test");
        public TagName Worlds = new TagName("Id.Worlds");
        public TagName Yellow = new TagName("Id.Yellow");
    }

    public class ItGroup : TagGroup
    {
        public ItGroup(string name) : base(name) { }
        public TagName Faction = new TagName("It.Faction");
        public TagName None = new TagName("It.None");
        public TagName Parent = new TagName("It.Parent");
        public TagName Parents = new TagName("It.Parents");
        public TagName Test = new TagName("It.Test");
    }

    public class OnGroup : TagGroup
    {
        public OnGroup(string name) : base(name) { }
        public TagName AppInit = new TagName("On.AppInit");
        public TagName AppStart = new TagName("On.AppStart");
        public TagName GameOver = new TagName("On.GameOver");
        public TagName Idle = new TagName("On.Idle");
        public TagName MissionReady = new TagName("On.MissionReady");
        public TagName MissionStart = new TagName("On.MissionStart");
        public TagName None = new TagName("On.None");
        public TagName OpenArena = new TagName("On.OpenArena");
        public TagName OpenMainMenu = new TagName("On.OpenMainMenu");
        public TagName OpenWorlds = new TagName("On.OpenWorlds");
        public TagName Pause = new TagName("On.Pause");
        public TagName PlayerReady = new TagName("On.PlayerReady");
        public TagName Playing = new TagName("On.Playing");
        public TagName RoomReady = new TagName("On.RoomReady");
        public TagName RoomStart = new TagName("On.RoomStart");
    }

    public class UiGroup : TagGroup
    {
        public UiGroup(string name) : base(name) { }
        public TagName BtnBack = new TagName("Ui.BtnBack");
        public TagName BtnCreateRoom = new TagName("Ui.BtnCreateRoom");
        public TagName BtnStart = new TagName("Ui.BtnStart");
        public TagName None = new TagName("Ui.None");
    }

    public class AllTags : TagNames
    {
        public AllTags() : base(TagSystem.AllTags()) { }
        public TagChildren BackupCard = new TagChildren("BackupCard");
        public TagChildren CardAgent = new TagChildren("CardAgent");
        public TagChildren CardManager = new TagChildren("CardManager");
        public TagChildren CardsPage = new TagChildren("CardsPage");
        public TagChildren ChangeCharacter = new TagChildren("ChangeCharacter");
        public TagChildren ChangeCharacterBtn = new TagChildren("ChangeCharacterBtn");
        public TagChildren ChangeCharcter = new TagChildren("ChangeCharcter");
        public TagChildren ClanPage = new TagChildren("ClanPage");
        public TagChildren Game = new TagChildren("Game");
        public TagChildren GameManager = new TagChildren("GameManager");
        public TagChildren GameOverState = new TagChildren("GameOverState");
        public TagChildren GameState = new TagChildren("GameState");
        public TagChildren HeroesPage = new TagChildren("HeroesPage");
        public TagChildren HpSlider = new TagChildren("HpSlider");
        public TagChildren LevelStart = new TagChildren("LevelStart");
        public TagChildren Loading = new TagChildren("Loading");
        public TagChildren LoadingCharPos = new TagChildren("LoadingCharPos");
        public TagChildren LoadoutState = new TagChildren("LoadoutState");
        public TagChildren Login = new TagChildren("Login");
        public TagChildren Main = new TagChildren("Main");
        public TagChildren MainHP = new TagChildren("MainHP");
        public TagChildren MenuArea = new TagChildren("MenuArea");
        public TagChildren Mission = new TagChildren("Mission");
        public TagChildren MissionPage = new TagChildren("MissionPage");
        public TagChildren Misson = new TagChildren("Misson");
        public TagChildren MissonBtn = new TagChildren("MissonBtn");
        public TagChildren Modifier = new TagChildren("Modifier");
        public TagChildren Navbar = new TagChildren("Navbar");
        public TagChildren SeededRun = new TagChildren("SeededRun");
        public TagChildren Settings = new TagChildren("Settings");
        public TagChildren ShopPage = new TagChildren("ShopPage");
        public TagChildren Start = new TagChildren("Start");
        public TagChildren StartButton = new TagChildren("StartButton");
        public TagChildren StartUp = new TagChildren("StartUp");
        public TagChildren Test = new TagChildren("Test");
        public TagChildren UICamera = new TagChildren("UICamera");
        public TagChildren Updating = new TagChildren("Updating");
        public TagChildren Action = new TagChildren("Action");
        public TagChildren Actor = new TagChildren("Actor");
        public TagChildren All = new TagChildren("All");
        public TagChildren Any = new TagChildren("Any");
        public TagChildren Bot = new TagChildren("Bot");
        public TagChildren Bundle = new TagChildren("Bundle");
        public TagChildren CreateRoom = new TagChildren("CreateRoom");
        public TagChildren EditorOnly = new TagChildren("EditorOnly");
        public TagChildren EndPoint = new TagChildren("EndPoint");
        public TagChildren FieldOfView = new TagChildren("FieldOfView");
        public TagChildren ForbiddenArea = new TagChildren("ForbiddenArea");
        public TagChildren Friend = new TagChildren("Friend");
        public TagChildren GameManagerStart = new TagChildren("GameManagerStart");
        public TagChildren Goal = new TagChildren("Goal");
        public TagChildren HideOnReady = new TagChildren("HideOnReady");
        public TagChildren HideOnStart = new TagChildren("HideOnStart");
        public TagChildren MainMenu = new TagChildren("MainMenu");
        public TagChildren Managers = new TagChildren("Managers");
        public TagChildren None = new TagChildren("None");
        public TagChildren OnGameBegin = new TagChildren("OnGameBegin");
        public TagChildren OnStart = new TagChildren("OnStart");
        public TagChildren Opponent = new TagChildren("Opponent");
        public TagChildren Parent = new TagChildren("Parent");
        public TagChildren Parents = new TagChildren("Parents");
        public TagChildren Pause = new TagChildren("Pause");
        public TagChildren Plan = new TagChildren("Plan");
        public TagChildren Player = new TagChildren("Player");
        public TagChildren PowerBar = new TagChildren("PowerBar");
        public TagChildren PowerText = new TagChildren("PowerText");
        public TagChildren PreviewRoot = new TagChildren("PreviewRoot");
        public TagChildren Red = new TagChildren("Red");
        public TagChildren Run = new TagChildren("Run");
        public TagChildren ScoreBar = new TagChildren("ScoreBar");
        public TagChildren ScoreText = new TagChildren("ScoreText");
        public TagChildren Self = new TagChildren("Self");
        public TagChildren ShowOnReady = new TagChildren("ShowOnReady");
        public TagChildren ShowOnStart = new TagChildren("ShowOnStart");
        public TagChildren Skier = new TagChildren("Skier");
        public TagChildren StartGame = new TagChildren("StartGame");
        public TagChildren StartPoint = new TagChildren("StartPoint");
        public TagChildren State = new TagChildren("State");
        public TagChildren Worlds = new TagChildren("Worlds");
        public TagChildren Yellow = new TagChildren("Yellow");
        public TagChildren Faction = new TagChildren("Faction");
        public TagChildren AppInit = new TagChildren("AppInit");
        public TagChildren AppStart = new TagChildren("AppStart");
        public TagChildren GameOver = new TagChildren("GameOver");
        public TagChildren Idle = new TagChildren("Idle");
        public TagChildren MissionReady = new TagChildren("MissionReady");
        public TagChildren MissionStart = new TagChildren("MissionStart");
        public TagChildren OpenArena = new TagChildren("OpenArena");
        public TagChildren OpenMainMenu = new TagChildren("OpenMainMenu");
        public TagChildren OpenWorlds = new TagChildren("OpenWorlds");
        public TagChildren PlayerReady = new TagChildren("PlayerReady");
        public TagChildren Playing = new TagChildren("Playing");
        public TagChildren RoomReady = new TagChildren("RoomReady");
        public TagChildren RoomStart = new TagChildren("RoomStart");
        public TagChildren BtnBack = new TagChildren("BtnBack");
        public TagChildren BtnCreateRoom = new TagChildren("BtnCreateRoom");
        public TagChildren BtnStart = new TagChildren("BtnStart");
    }
}
