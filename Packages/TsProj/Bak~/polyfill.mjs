import * as fs from "Buildin/fs.mjs";
import * as path from "Buildin/path.mjs";
global.fs = global.fs ?? fs;
global.path = global.path ?? path;
global.Buffer = global.Buffer ?? {};
global.__dirname = global.__dirname ?? "";
//使用inline-source-map模式, 需要额外安装buffer模块
//global["Buffer"] = global["Buffer"] ?? require("buffer").Buffer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWZpbGwubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9wb2x5ZmlsbC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyQyxPQUFPLEtBQUssSUFBSSxNQUFNLGtCQUFrQixDQUFDO0FBQ3pDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDNUIsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztBQUNsQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBUyxDQUFDO0FBQzNDLHVDQUF1QztBQUN2QyxrRUFBa0UifQ==