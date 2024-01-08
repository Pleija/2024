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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvYm9vdHN0cmFwLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8saUJBQWlCLENBQUM7QUFDekIsT0FBTyxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sa0JBQWtCLENBQUM7QUFFMUIsT0FBTyxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxzQkFBc0IsQ0FBQztBQUk5QixNQUFNLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUV4QyxpREFBaUQ7QUFFakQsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDekMsSUFBSSxHQUFHO1FBQUUsTUFBTSxHQUFHLENBQUM7SUFDbkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyJ9