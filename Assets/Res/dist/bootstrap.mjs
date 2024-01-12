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
var $typeof = puer.$typeof;
var JsEnv = CS.Puerts.JsEnv;
global.protobuf = require("protobufjs");
//console.log(getAllMethod(protobuf).join(", "));
// JsEnv.self.UsingAction($typeof(CS.UnityEngine.Vector2));
// JsEnv.self.UsingAction($typeof(CS.System.Int32));
// JsEnv.self.UsingAction($typeof(CS.System.String));
// JsEnv.self.UsingAction($typeof(CS.System.Single));
protobuf.load("awesome.proto", (err, root) => {
    if (err)
        throw err;
    const type = root.lookupType("awesome.AwesomeMessage");
    console.log(type, "test proto");
});
$Login.sayHello("puerts ready");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvYm9vdHN0cmFwLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLHFCQUFxQixDQUFDO0FBQzdCLE9BQU8sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLHFCQUFxQixDQUFDO0FBQzdCLE9BQU8saUJBQWlCLENBQUM7QUFDekIsT0FBTyxlQUFlLENBQUM7QUFDdkIsT0FBTyxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLHdCQUF3QixDQUFDO0FBQ2hDLE9BQU8sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxlQUFlLENBQUM7QUFDdkIsT0FBTyx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLHNCQUFzQixDQUFDO0FBQzlCLElBQU8sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFFOUIsSUFBTyxLQUFLLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFFL0IsTUFBTSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFeEMsaURBQWlEO0FBQ2pELEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDeEQsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNqRCxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2xELEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFFbEQsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDekMsSUFBSSxHQUFHO1FBQUUsTUFBTSxHQUFHLENBQUM7SUFDbkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyJ9