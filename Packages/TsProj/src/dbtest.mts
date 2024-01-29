import { Column, Db, Primary, SQLite3Driver } from 'Sqlite-ts/index.mjs'
import { Database } from "./Sqlite-ts/drivers/Database.mjs";
import Array$1 = CS.System.Array$1;
import { DBConnection } from "./Sqlite3/DBConnection.mjs";
import { TestData } from "./TestData.mjs";

class Person {
    @Primary()
    id: number = 0
    
    @Column('NVARCHAR')
    name: string = ''
    
    @Column('DATETIME')
    dob: Date = new Date()
    
    @Column('INTEGER')
    age: number = 0
    
    @Column('BOOLEAN')
    married: boolean = false
    
    @Column('MONEY')
    salary: number = 0
}

class Address {
    @Primary()
    id: number = 0
    
    @Column('INTEGER')
    person: number = 0
    
    @Column('NVARCHAR')
    address: string = ''
}

export const orm = async function (...args: any[]) {
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
}


export const db = async function (...args: any[]) {
    
    //let t: Array$1<string>;
    
    console.log("test");
    // define entities object
    const entities = {
        Person,
        Address
    }

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
    await db.transaction(({exec, tables}) => {
        exec(
            tables.Address.insert({
                person: 1,
                address: `Joy's Home`
            })
        )
        exec(
            tables.Address.insert({
                person: 2,
                address: `Hanna's Home`
            })
        )
        exec(
            tables.Address.insert({
                person: 3,
                address: `Marry's Home`
            })
        )
    });
    let address1: any
    let address2: any
    let address3: any
    await db.transaction(({exec, tables}) => {
        exec(
            tables.Address.insert({
                person: 1,
                address: `Joy's Home`
            })
        ).then(r => {
            address1 = r
        })
        
        exec(
            tables.Address.insert({
                person: 2,
                address: `Hanna's Home`
            })
        ).then(r => {
            address2 = r
        })
        
        exec(
            tables.Address.insert({
                person: 3,
                address: `Marry's Home`
            })
        ).then(r => {
            address3 = r
        })
    });
    // select all
    const people = await db.tables.Person.select();
    console.log(JSON.stringify(people));
    // select columns
    const people2 = await db.tables.Person.select(c => [c.id, c.name, c.salary])
    console.log(JSON.stringify(people2));
    // select with limit
    const people3 = await db.tables.Person.select(c => [
        c.id,
        c.name,
        c.salary
    ]).limit(1);
    console.log(JSON.stringify(people3));
    // select with condition
    const people4 = await db.tables.Person.select(c => [c.id, c.name]).where(c =>
        c.greaterThanOrEqual({salary: 100})
    );
    console.log(JSON.stringify(people4));
    // select with order
    const people5 = await db.tables.Person.select(c => [c.id, c.name])
    .where(c => c.notEquals({married: true}))
    .orderBy({name: 'DESC'});
    console.log(JSON.stringify(people5));
    // select single data
    const person = await db.tables.Person.single(c => [c.id, c.name])
    console.log(JSON.stringify(person));
    // let's prove that she's not married yet
    let hanna = await db.tables.Person.single(c => [c.id, c.name, c.married]).where(
        c => c.equals({id: 2})
    )
// returns:
// hanna is not married yet = { id: 2, name: 'Hanna', married: false }

// let's marry her
    await db.tables.Person.update({married: true}).where(c => c.equals({id: 2}))
    
    hanna = await db.tables.Person.single(c => [c.id, c.name, c.married]).where(c =>
        c.equals({id: 2})
    )
// returns:
// hanna is now married = { id: 2, name: 'Hanna', married: true }
    console.log(hanna);
    const people6 = await db.tables.Person.join(
        t => ({
            // FROM Person AS self JOIN Address AS address
            address: t.Address
        }),
        (p, {address}) => {
            // ON self.id = address.person
            p.equal({id: address.person})
        }
    ).map(f => ({
        // SELECT self.id AS id, self.name AS name, address.address AS address
        id: f.self.id,
        name: f.self.name,
        address: f.address.address
    }));
    console.log(JSON.stringify(people6));
    // join where order and limit
    const people7 = await db.tables.Person.join(
        t => ({
            // FROM Person AS self JOIN Address AS address
            address: t.Address
        }),
        (p, {address}) => {
            // ON self.id = address.person
            p.equal({id: address.person})
        }
    )
    .map(f => ({
        // SELECT self.id AS id, self.name AS name, address.address AS address
        id: f.self.id,
        name: f.self.name,
        address: f.address.address
    }))
    // WHERE self.married = 1
    .where(p => p.self.equals({married: true}))
    // ORDER BY address.address ASC
    .orderBy({address: {address: 'ASC'}})
    // LIMIT 1
    .limit(1);
    console.log(JSON.stringify(people7));
    // delete
    const delResult = await db.tables.Person.delete().where(c =>
        c.equals({id: 3})
    );
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
}
