#region
using System.Collections.Generic;
using System.IO;
using NUnit.Framework;
using IgnoreAttribute = SqlCipher4Unity3D.SQLite.Attribute.IgnoreAttribute;
#endregion

namespace SqlCipher4Unity3D.Example.test.Editor
{
    public class Company
    {
        public string ID { get; set; }
    }

    public class Account
    {
        public string ID { get; set; }
        public string CompanyID { get; set; }

        [Ignore]
        public Company Company {
            get => new Company();
            set => CompanyID = value.ID;
        }

        public override bool Equals(object obj)
        {
            var o = obj as Account;
            if (o is null) return false;
            if (ID != o.ID) return false;
            if (CompanyID != o.CompanyID) return false;
            return true;
        }

        public override int GetHashCode()
        {
            var hashCode = 480581749;
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(ID);
            hashCode = hashCode * -1521134295
                    + EqualityComparer<string>.Default.GetHashCode(CompanyID);
            hashCode = hashCode * -1521134295
                    + EqualityComparer<Company>.Default.GetHashCode(Company);
            return hashCode;
        }
    }

    [TestFixture]
    public class IgnoreTest
    {
        [SetUp]
        public void Up()
        {
            Cleanup();
            Conn = new SQLiteConnection(DbPath, "");
        }

        [TearDown]
        public void Down()
        {
            if (Conn != null) Conn.Close();
            Cleanup();
        }

        private string DbPath = $"Assets/StreamingAssets/{nameof(IgnoreTest)}.db";
        private SQLiteConnection Conn;

        private void Cleanup()
        {
            if (File.Exists(DbPath)) File.Delete(DbPath);
        }

        [Test]
        public void IgnoreTestSimplePasses()
        {
            Conn.CreateTable<Account>();
            var a = new Account { ID = "A", CompanyID = "X" };
            Conn.Insert(a);
            var b = Conn.Table<Account>().Where(x => x.ID == "A").First();
            Assert.AreEqual(a, b);
        }
    }
}
