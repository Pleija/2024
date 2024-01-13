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
import "Common/Helpers.mjs";
import "Start/StartButton.mjs";
global.protobuf = require("protobufjs");
//console.log(getAllMethod(protobuf).join(", "));
protobuf.load("awesome.proto", (err, root) => {
    if (err)
        throw err;
    const type = root.lookupType("awesome.AwesomeMessage");
    console.log(type, "test proto");
});
// $Login.sayHello("puerts ready");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvYm9vdHN0cmFwLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLG1DQUFtQyxDQUFDO0FBQzNDLE9BQU8seUJBQXlCLENBQUM7QUFDakMsT0FBTyxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLDBCQUEwQixDQUFDO0FBQ2xDLE9BQU8sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLGVBQWUsQ0FBQztBQUN2QixPQUFPLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyx1QkFBdUIsQ0FBQztBQUcvQixNQUFNLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUV4QyxpREFBaUQ7QUFHakQsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDekMsSUFBSSxHQUFHO1FBQUUsTUFBTSxHQUFHLENBQUM7SUFDbkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQyxDQUFDO0FBRUgsbUNBQW1DIn0=