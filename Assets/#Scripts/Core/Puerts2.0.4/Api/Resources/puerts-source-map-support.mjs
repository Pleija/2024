import sms from './source-map-support.gen.mjs';

try {
    sms.install({
        retrieveFile: (path) => {
            //@ts-ignore
            try {
                // @ts-ignore
                return CS.Puerts.TSLoader.TSDirectoryCollector.EmitTSFile(path);
            } catch (e) {
                return '';
            }
        }
    });
    CS.UnityEngine.Debug.Log("source-map-support: <color=green>enable</color>");
} catch (e) {
    CS.UnityEngine.Debug.LogError("source-map-support module exception:" + e.message + "\n" + e.stack);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVlcnRzLXNvdXJjZS1tYXAtc3VwcG9ydC5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHVlcnRzLXNvdXJjZS1tYXAtc3VwcG9ydC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxHQUFHLE1BQU0sOEJBQThCLENBQUE7QUFDOUMsSUFBSTtJQUNBLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDUixZQUFZLEVBQUUsQ0FBQyxJQUFZLEVBQUUsRUFBRTtZQUMzQixZQUFZO1lBQ1osSUFBSTtnQkFDQSxhQUFhO2dCQUNiLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25FO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxFQUFFLENBQUM7YUFBRTtRQUM5QixDQUFDO0tBQ0osQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7Q0FDL0U7QUFBQyxPQUFPLENBQUMsRUFBRTtJQUNSLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDdEcifQ==