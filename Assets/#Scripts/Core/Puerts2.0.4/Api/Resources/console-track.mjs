const ENABLE_HYPERLINK = true;

function getTrack() {
    //捕获当前输出的堆栈信息(前三行为此处代码调用的堆栈, 去除后输出)
    let trackInfos = new Error().stack?.replace(/\r\n/g, "\n").split("\n").slice(3);
    if (trackInfos && trackInfos.length > 0) {
        if (ENABLE_HYPERLINK) {
            //1.匹配函数名(可选)    /**([a-zA-z0-9#$._ ]+ \()? */
            //2.匹配文件路径        /**([^\n\r\*\"\|\<\>]+(.js|.cjs|.mjs|.ts|.mts))\:([0-9]+)\:([0-9]+) */
            let regex = /at ([a-zA-z0-9#$._ ]+ \()?([^\n\r\*\"\|\<\>]+(.js|.cjs|.mjs|.ts|.mts))\:([0-9]+)\:([0-9]+)\)?/g;
            for (let i = 0; i < trackInfos.length; i++) {
                regex.lastIndex = 0;
                let match = regex.exec(trackInfos[i]);
                if (!match)
                    continue;
                let path = match[2], line = match[4] ?? "0", column = match[5] ?? "0";
                let search = `${path}:${line}:${column}`;
                trackInfos[i] = trackInfos[i].replace(search, `<a href="${path.replace(/\\/g, "/")}" line="${line}" column="${column}">${search}</a>`);
            }
        }
        return trackInfos.join("\n");
    }
    return "";
}
;
const log = console.log, info = console.info, warn = console.warn, error = console.error;
console.log = function (...args) {
    log(...args, "\n" + getTrack());
};
console.info = function (...args) {
    info(...args, "\n" + getTrack());
};
console.warn = function (...args) {
    warn(...args, "\n" + getTrack());
};
console.error = function (...args) {
    error(...args, "\n" + getTrack());
};
// 捕获普通异常
puer.on('uncaughtException', function (err) {
    let output = "";
    output += "==== EXCEPTION START ===========================================================";
    output += "\nType: uncaughtException Caught exception";
    output += "\nERROR: " + err;
    output += "\n==== EXCEPTION END   ===========================================================";
    CS.UnityEngine.Debug.LogError(output);
});
// 捕获async异常
puer.on('unhandledRejection', (reason) => {
    let output = "";
    output += "==== REJECT START ==============================================================";
    output += "\nType: Caught Unhandled Rejection";
    output += "\nMessage: " + reason?.message;
    output += "\n" + reason?.stack;
    output += "\n==== REJECT END   ==============================================================";
    CS.UnityEngine.Debug.LogError(output);
});
export {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS10cmFjay5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uc29sZS10cmFjay5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFFOUIsU0FBUyxRQUFRO0lBQ2IsbUNBQW1DO0lBQ25DLElBQUksVUFBVSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRixJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNyQyxJQUFJLGdCQUFnQixFQUFFO1lBQ2xCLDhDQUE4QztZQUM5Qyx3RkFBd0Y7WUFDeEYsSUFBSSxLQUFLLEdBQUcsZ0dBQWdHLENBQUM7WUFFN0csS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO2dCQUVwQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLENBQUMsS0FBSztvQkFDTixTQUFTO2dCQUViLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztnQkFDdEUsSUFBSSxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUV6QyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsWUFBWSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsV0FBVyxJQUFJLGFBQWEsTUFBTSxLQUFLLE1BQU0sTUFBTSxDQUFDLENBQUM7YUFDMUk7U0FDSjtRQUNELE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoQztJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ2QsQ0FBQztBQUFBLENBQUM7QUFDRixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0FBQ3pGLE9BQU8sQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLElBQUk7SUFDM0IsR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUFFLElBQUksR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQztBQUNGLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxHQUFHLElBQUk7SUFDNUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLElBQUksR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLENBQUMsQ0FBQztBQUNGLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxHQUFHLElBQUk7SUFDNUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLElBQUksR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLENBQUMsQ0FBQztBQUNGLE9BQU8sQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLElBQUk7SUFDN0IsS0FBSyxDQUFDLEdBQUcsSUFBSSxFQUFFLElBQUksR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQztBQUVGLFNBQVM7QUFDVCxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsR0FBVTtJQUM3QyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsTUFBTSxJQUFJLGtGQUFrRixDQUFDO0lBQzdGLE1BQU0sSUFBSSw0Q0FBNEMsQ0FBQztJQUN2RCxNQUFNLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQztJQUM1QixNQUFNLElBQUksb0ZBQW9GLENBQUM7SUFFL0YsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFDLENBQUMsQ0FBQyxDQUFDO0FBQ0gsWUFBWTtBQUNaLElBQUksQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxNQUFhLEVBQUUsRUFBRTtJQUM1QyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsTUFBTSxJQUFJLGtGQUFrRixDQUFDO0lBQzdGLE1BQU0sSUFBSSxvQ0FBb0MsQ0FBQztJQUMvQyxNQUFNLElBQUksYUFBYSxHQUFHLE1BQU0sRUFBRSxPQUFPLENBQUM7SUFDMUMsTUFBTSxJQUFJLElBQUksR0FBRyxNQUFNLEVBQUUsS0FBSyxDQUFDO0lBQy9CLE1BQU0sSUFBSSxvRkFBb0YsQ0FBQztJQUUvRixFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUMsQ0FBQyxDQUFDLENBQUMifQ==