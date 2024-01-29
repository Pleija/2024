import { AutoInc, Column, PrimaryKey } from "./Sqlite3/Utils/Attributes.mjs";

export class TestData {
    
    @Column("number") @PrimaryKey() @AutoInc()
    public id: number;
    
    @Column("string")
    public name: string;
    
    @Column("number")
    public age: number;
    
    @Column("number")
    public sex: number;
    
}

// export const self:TestData = global.TestData ??= new TestData();
