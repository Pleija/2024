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
global.protobuf = require("protobufjs");
//console.log(getAllMethod(protobuf).join(", "));
protobuf.load("awesome.proto", (err, root) => {
    if (err)
        throw err;
    const type = root.lookupType("awesome.AwesomeMessage");
    console.log(type, "test proto");
});
// $Login.sayHello("puerts ready");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvYm9vdHN0cmFwLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLG1DQUFtQyxDQUFDO0FBQzNDLE9BQU8seUJBQXlCLENBQUM7QUFDakMsT0FBTyxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLDBCQUEwQixDQUFDO0FBQ2xDLE9BQU8sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLGVBQWUsQ0FBQztBQUN2QixPQUFPLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sdUJBQXVCLENBQUM7QUFFL0IsT0FBTyxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLHNCQUFzQixDQUFDO0FBRzlCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRXhDLGlEQUFpRDtBQUdqRCxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUN6QyxJQUFJLEdBQUc7UUFBRSxNQUFNLEdBQUcsQ0FBQztJQUNuQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDcEMsQ0FBQyxDQUFDLENBQUM7QUFHSCxtQ0FBbUMifQ==