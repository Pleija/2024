import { performance } from "perf_hooks";
export class Timer {
    lap() {
        const res = this.time();
        this._time += res;
        return res;
    }
    start() {
        this._time = performance.now();
    }
    time() {
        return performance.now() - this._time;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9Mb2dnZXIvVGltZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUV6QyxNQUFNLE9BQU8sS0FBSztJQUVQLEdBQUc7UUFDTixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUM7UUFDbEIsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBQ00sS0FBSztRQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFDTSxJQUFJO1FBQ1AsT0FBTyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUMxQyxDQUFDO0NBQ0oifQ==