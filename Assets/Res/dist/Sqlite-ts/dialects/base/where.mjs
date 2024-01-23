import { DialectBase } from './index.mjs';
export class WhereDialect extends DialectBase {
    constructor(info, sql, kind) {
        super(info);
        this.kind = kind;
        this.sql = sql;
    }
    where(condition) {
        if (condition) {
            this.sql += ` WHERE ${this._condSql(condition)}`;
        }
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hlcmUubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9TcWxpdGUtdHMvZGlhbGVjdHMvYmFzZS93aGVyZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBNkIsTUFBTSxhQUFhLENBQUE7QUFJcEUsTUFBTSxPQUFPLFlBQW1CLFNBQVEsV0FBaUI7SUFDckQsWUFBWSxJQUFrQixFQUFFLEdBQVcsRUFBRSxJQUFpQjtRQUMxRCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDWCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtRQUNoQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUNsQixDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQWdDO1FBQ2xDLElBQUksU0FBUyxFQUFFLENBQUM7WUFDWixJQUFJLENBQUMsR0FBRyxJQUFJLFVBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFBO1FBQ3BELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7Q0FDSiJ9