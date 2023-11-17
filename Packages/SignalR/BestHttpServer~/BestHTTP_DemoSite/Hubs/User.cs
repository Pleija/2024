using System;
using SQLite;

namespace Hubs
{
    [Serializable]
    public class User
    {
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        public string connectId { get; set; }
        public int uid { get; set; }
        public int username { get; set; }
        public long timestamp { get; set; }
        public string clientGuid { get; set; }
    }
}
