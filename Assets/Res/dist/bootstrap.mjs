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
global.protobuf = require("protobufjs");
//console.log(getAllMethod(protobuf).join(", "));
protobuf.load("awesome.proto", (err, root) => {
    if (err)
        throw err;
    const type = root.lookupType("awesome.AwesomeMessage");
    console.log(type, "test proto");
});
$Login.sayHello("puerts ready");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvYm9vdHN0cmFwLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLHFCQUFxQixDQUFDO0FBQzdCLE9BQU8saUJBQWlCLENBQUM7QUFDekIsT0FBTyxlQUFlLENBQUM7QUFDdkIsT0FBTyxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLHdCQUF3QixDQUFDO0FBQ2hDLE9BQU8sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxlQUFlLENBQUM7QUFDdkIsT0FBTyx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLHNCQUFzQixDQUFDO0FBSTlCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRXhDLGlEQUFpRDtBQUVqRCxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUN6QyxJQUFJLEdBQUc7UUFBRSxNQUFNLEdBQUcsQ0FBQztJQUNuQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDcEMsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDIn0=