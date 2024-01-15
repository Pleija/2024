using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

#pragma warning disable CS0105
#if !UNITY_EDITOR
using System.Collections;
using System.IO;
#endif

namespace SqlCipher4Unity3D.Example
{
    public class DataService
    {
        private readonly SQLiteConnection _connection;

#if UNITY_EDITOR
        [MenuItem("Debug/Tests/Database/Create Database")]
        static void TestCreateDatabase()
        {
            var databaseName = "test_password.sqlite";
            if (!Directory.Exists(@"ProjectSettings/data/samples")) {
                Directory.CreateDirectory(@"ProjectSettings/data/samples");
            }
            var dbPath = string.Format(@"ProjectSettings/data/samples/{0}", databaseName);
            File.Delete(dbPath);
            var ds = new DataService(databaseName, "hello");
            //ds._connection.DropTable<Person>();
            ds.CreateDB(true);
            IEnumerable<Person> people = ds.GetPersons();
            ToConsole(people);
            people = ds.GetPersonsNamedRoberto();
            ToConsole("Searching for Roberto ...");
            ToConsole(people);
            ds._connection.Backup("ProjectSettings/data/samples/db_bak.txt");
        }

        private static void ToConsole(IEnumerable<Person> people)
        {
            foreach (Person person in people) ToConsole(person.ToString());
        }

        private static void ToConsole(string msg)
        {
            // this.DebugText.text += Environment.NewLine + msg;
            Debug.Log(msg);
        }
#endif

        public DataService(string databaseName, string password = "password")
        {
            string dbPath = (Application.persistentDataPath + $"/data/{databaseName}");
            if (!Directory.Exists(Path.GetDirectoryName(dbPath))) {
                Directory.CreateDirectory(Path.GetDirectoryName(dbPath)+"");
            }
#if UNITY_EDITOR
            dbPath = string.Format(@"ProjectSettings/data/samples/{0}", databaseName);
            if (!Directory.Exists(Path.GetDirectoryName(dbPath))) {
                Directory.CreateDirectory(Path.GetDirectoryName(dbPath)+"");
            }
#else
#if false
      

            // check if file exists in Application.persistentDataPath
            string filepath = string.Format("{0}/{1}", Application.persistentDataPath, DatabaseName);

            if (!File.Exists(filepath))
            {
                Debug.Log("Database not in Persistent path");
                // if it doesn't ->
                // open StreamingAssets directory and load the db ->

#if UNITY_ANDROID
                WWW loadDb =
     new WWW ("jar:file://" + Application.dataPath + "!/assets/" + DatabaseName); // this is the path to your StreamingAssets in android
                while (!loadDb.isDone) { } // CAREFUL here, for safety reasons you shouldn't let this while loop unattended, place a timer and error check
                // then save to Application.persistentDataPath
                File.WriteAllBytes (filepath, loadDb.bytes);
#elif UNITY_IOS
                string loadDb =
     Application.dataPath + "/Raw/" + DatabaseName; // this is the path to your StreamingAssets in iOS
                // then save to Application.persistentDataPath
                File.Copy (loadDb, filepath);
#elif UNITY_WP8
                string loadDb =
     Application.dataPath + "/StreamingAssets/" + DatabaseName; // this is the path to your StreamingAssets in iOS
                // then save to Application.persistentDataPath
                File.Copy (loadDb, filepath);
    
#elif UNITY_WINRT
                string loadDb =
     Application.dataPath + "/StreamingAssets/" + DatabaseName; // this is the path to your StreamingAssets in iOS
                // then save to Application.persistentDataPath
                File.Copy (loadDb, filepath);
#elif UNITY_STANDALONE_OSX
                string loadDb =
     Application.dataPath + "/Resources/Data/StreamingAssets/" + DatabaseName; // this is the path to your StreamingAssets in iOS
                // then save to Application.persistentDataPath
                File.Copy(loadDb, filepath);
#else
                string loadDb =
     Application.dataPath + "/StreamingAssets/" + DatabaseName; // this is the path to your StreamingAssets in iOS
                // then save to Application.persistentDataPath
                File.Copy(loadDb, filepath);
#endif

                Debug.Log("Database written");
            }

            var dbPath = filepath;
#endif
#endif
            _connection = new SQLiteConnection(dbPath, password);
            Debug.Log("Final PATH: " + dbPath);
        }

        public void CreateDB(bool drop = true)
        {
            if (drop) _connection.DropTable<Person>();
            _connection.CreateTable<Person>();

            _connection.InsertAll(new[] {
                new Person {
                    Id = 1,
                    Name = "Tom",
                    Surname = "Perez",
                    Age = 56
                },
                new Person {
                    Id = 2,
                    Name = "Fred",
                    Surname = "Arthurson",
                    Age = 16
                },
                new Person {
                    Id = 3,
                    Name = "John",
                    Surname = "Doe",
                    Age = 25
                },
                new Person {
                    Id = 4,
                    Name = "Roberto",
                    Surname = "Huertas",
                    Age = 37
                }
            });
        }

        public IEnumerable<Person> GetPersons()
        {
            return _connection.Table<Person>();
        }

        public IEnumerable<Person> GetPersonsNamedRoberto()
        {
            return _connection.Table<Person>().Where(x => x.Name == "Roberto");
        }

        public Person GetJohnny()
        {
            return _connection.Table<Person>().Where(x => x.Name == "Johnny").FirstOrDefault();
        }

        public Person CreatePerson()
        {
            Person p = new Person {
                Name = "Johnny",
                Surname = "Mnemonic",
                Age = 21
            };
            _connection.Insert(p);
            return p;
        }
    }
}