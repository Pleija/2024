import "Start/Updating.mjs";
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
Login.sayHello("puerts ready");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvYm9vdHN0cmFwLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLG9CQUFvQixDQUFDO0FBRTVCLE9BQU8saUJBQWlCLENBQUM7QUFDekIsT0FBTyxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sd0JBQXdCLENBQUM7QUFDaEMsT0FBTyx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sb0JBQW9CLENBQUM7QUFDNUIsT0FBTyxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLGVBQWUsQ0FBQztBQUN2QixPQUFPLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sc0JBQXNCLENBQUM7QUFJOUIsTUFBTSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFeEMsaURBQWlEO0FBRWpELFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO0lBQ3pDLElBQUksR0FBRztRQUFFLE1BQU0sR0FBRyxDQUFDO0lBQ25CLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNwQyxDQUFDLENBQUMsQ0FBQztBQUVILEtBQUssQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMifQ==