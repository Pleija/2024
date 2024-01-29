var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Db, Primary, SQLite3Driver } from 'Sqlite-ts/index.mjs';
import { Database } from "./Sqlite-ts/drivers/Database.mjs";
import { DBConnection } from "./Sqlite3/DBConnection.mjs";
import { TestData } from "./TestData.mjs";
class Person {
    id = 0;
    name = '';
    dob = new Date();
    age = 0;
    married = false;
    salary = 0;
}
__decorate([
    Primary(),
    __metadata("design:type", Number)
], Person.prototype, "id", void 0);
__decorate([
    Column('NVARCHAR'),
    __metadata("design:type", String)
], Person.prototype, "name", void 0);
__decorate([
    Column('DATETIME'),
    __metadata("design:type", Date)
], Person.prototype, "dob", void 0);
__decorate([
    Column('INTEGER'),
    __metadata("design:type", Number)
], Person.prototype, "age", void 0);
__decorate([
    Column('BOOLEAN'),
    __metadata("design:type", Boolean)
], Person.prototype, "married", void 0);
__decorate([
    Column('MONEY'),
    __metadata("design:type", Number)
], Person.prototype, "salary", void 0);
class Address {
    id = 0;
    person = 0;
    address = '';
}
__decorate([
    Primary(),
    __metadata("design:type", Number)
], Address.prototype, "id", void 0);
__decorate([
    Column('INTEGER'),
    __metadata("design:type", Number)
], Address.prototype, "person", void 0);
__decorate([
    Column('NVARCHAR'),
    __metadata("design:type", String)
], Address.prototype, "address", void 0);
export const orm = async function (...args) {
    console.log("test");
    let conn = new DBConnection("Assets/Editor/test.db");
    conn.open();
    //创建表
    conn.createTable(TestData);
    //清空表
    conn.clearTable(TestData);
    //删除表
    // conn.dropTable(TestData);
    let data = new TestData();
    //直接插入
    conn.insert(data);
    //条件更新或插入数据
    //注:基于字符串解析, 无法直接获取data.id的值, 需要通过对象传入
    let id = data.id;
    let ret = conn.table(TestData)
        .where(o => o.id == id && id != 0, { id })
        .updateOrInsert(data);
    console.log(ret);
};
export const db = async function (...args) {
    //let t: Array$1<string>;
    console.log("test");
    // define entities object
    const entities = {
        Person,
        Address
    };
    // make a connection using SQLite3.
    // you can use other available drivers
    // or create your own
    const sqlite3Db = new Database("Assets/Editor/test.db");
    const db = await Db.init({
        // set the driver
        driver: new SQLite3Driver(sqlite3Db),
        // set your entities here
        entities,
        // set `true` so all tables in entities will automatically created for you
        // if it does not exists yet in database
        createTables: true
    });
    await db.dropAllTables();
    // insert single data
    const result = await db.tables.Person.insert({
        name: 'Joey',
        married: true,
        dob: new Date(2000, 1, 1, 0, 0, 0),
        age: 18,
        salary: 100
    });
    // insert multiple data at once
    const results = await db.tables.Person.insert([
        {
            name: 'Hanna',
            married: false,
            dob: new Date(2001, 2, 2, 0, 0, 0),
            age: 17,
            salary: 100
        },
        {
            name: 'Mary',
            married: false,
            dob: new Date(2002, 3, 3, 0, 0, 0),
            age: 26,
            salary: 50
        }
    ]);
    await db.transaction(({ exec, tables }) => {
        exec(tables.Address.insert({
            person: 1,
            address: `Joy's Home`
        }));
        exec(tables.Address.insert({
            person: 2,
            address: `Hanna's Home`
        }));
        exec(tables.Address.insert({
            person: 3,
            address: `Marry's Home`
        }));
    });
    let address1;
    let address2;
    let address3;
    await db.transaction(({ exec, tables }) => {
        exec(tables.Address.insert({
            person: 1,
            address: `Joy's Home`
        })).then(r => {
            address1 = r;
        });
        exec(tables.Address.insert({
            person: 2,
            address: `Hanna's Home`
        })).then(r => {
            address2 = r;
        });
        exec(tables.Address.insert({
            person: 3,
            address: `Marry's Home`
        })).then(r => {
            address3 = r;
        });
    });
    // select all
    const people = await db.tables.Person.select();
    console.log(JSON.stringify(people));
    // select columns
    const people2 = await db.tables.Person.select(c => [c.id, c.name, c.salary]);
    console.log(JSON.stringify(people2));
    // select with limit
    const people3 = await db.tables.Person.select(c => [
        c.id,
        c.name,
        c.salary
    ]).limit(1);
    console.log(JSON.stringify(people3));
    // select with condition
    const people4 = await db.tables.Person.select(c => [c.id, c.name]).where(c => c.greaterThanOrEqual({ salary: 100 }));
    console.log(JSON.stringify(people4));
    // select with order
    const people5 = await db.tables.Person.select(c => [c.id, c.name])
        .where(c => c.notEquals({ married: true }))
        .orderBy({ name: 'DESC' });
    console.log(JSON.stringify(people5));
    // select single data
    const person = await db.tables.Person.single(c => [c.id, c.name]);
    console.log(JSON.stringify(person));
    // let's prove that she's not married yet
    let hanna = await db.tables.Person.single(c => [c.id, c.name, c.married]).where(c => c.equals({ id: 2 }));
    // returns:
    // hanna is not married yet = { id: 2, name: 'Hanna', married: false }
    // let's marry her
    await db.tables.Person.update({ married: true }).where(c => c.equals({ id: 2 }));
    hanna = await db.tables.Person.single(c => [c.id, c.name, c.married]).where(c => c.equals({ id: 2 }));
    // returns:
    // hanna is now married = { id: 2, name: 'Hanna', married: true }
    console.log(hanna);
    const people6 = await db.tables.Person.join(t => ({
        // FROM Person AS self JOIN Address AS address
        address: t.Address
    }), (p, { address }) => {
        // ON self.id = address.person
        p.equal({ id: address.person });
    }).map(f => ({
        // SELECT self.id AS id, self.name AS name, address.address AS address
        id: f.self.id,
        name: f.self.name,
        address: f.address.address
    }));
    console.log(JSON.stringify(people6));
    // join where order and limit
    const people7 = await db.tables.Person.join(t => ({
        // FROM Person AS self JOIN Address AS address
        address: t.Address
    }), (p, { address }) => {
        // ON self.id = address.person
        p.equal({ id: address.person });
    })
        .map(f => ({
        // SELECT self.id AS id, self.name AS name, address.address AS address
        id: f.self.id,
        name: f.self.name,
        address: f.address.address
    }))
        // WHERE self.married = 1
        .where(p => p.self.equals({ married: true }))
        // ORDER BY address.address ASC
        .orderBy({ address: { address: 'ASC' } })
        // LIMIT 1
        .limit(1);
    console.log(JSON.stringify(people7));
    // delete
    const delResult = await db.tables.Person.delete().where(c => c.equals({ id: 3 }));
    console.log(JSON.stringify(delResult));
    //     // drop
    //     await db.tables.Address.drop()
    //
    // // or drop inside transaction
    //     await db.transaction(({ exec, tables }) => {
    //         exec(tables.Address.drop())
    //         exec(tables.Person.drop())
    //     })
    //
    // // or drop all tables
    //     await db.dropAllTables()
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGJ0ZXN0Lm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZGJ0ZXN0Lm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUE7QUFDeEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRTVELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFMUMsTUFBTSxNQUFNO0lBRVIsRUFBRSxHQUFXLENBQUMsQ0FBQTtJQUdkLElBQUksR0FBVyxFQUFFLENBQUE7SUFHakIsR0FBRyxHQUFTLElBQUksSUFBSSxFQUFFLENBQUE7SUFHdEIsR0FBRyxHQUFXLENBQUMsQ0FBQTtJQUdmLE9BQU8sR0FBWSxLQUFLLENBQUE7SUFHeEIsTUFBTSxHQUFXLENBQUMsQ0FBQTtDQUNyQjtBQWhCRztJQURDLE9BQU8sRUFBRTs7a0NBQ0k7QUFHZDtJQURDLE1BQU0sQ0FBQyxVQUFVLENBQUM7O29DQUNGO0FBR2pCO0lBREMsTUFBTSxDQUFDLFVBQVUsQ0FBQzs4QkFDZCxJQUFJO21DQUFhO0FBR3RCO0lBREMsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7bUNBQ0g7QUFHZjtJQURDLE1BQU0sQ0FBQyxTQUFTLENBQUM7O3VDQUNNO0FBR3hCO0lBREMsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7c0NBQ0U7QUFHdEIsTUFBTSxPQUFPO0lBRVQsRUFBRSxHQUFXLENBQUMsQ0FBQTtJQUdkLE1BQU0sR0FBVyxDQUFDLENBQUE7SUFHbEIsT0FBTyxHQUFXLEVBQUUsQ0FBQTtDQUN2QjtBQVBHO0lBREMsT0FBTyxFQUFFOzttQ0FDSTtBQUdkO0lBREMsTUFBTSxDQUFDLFNBQVMsQ0FB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