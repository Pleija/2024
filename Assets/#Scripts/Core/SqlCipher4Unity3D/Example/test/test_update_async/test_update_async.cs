using System.Collections.Generic;
using System.Threading.Tasks;
using SqlCipher4Unity3D.SQLite.Attribute;
using UnityEngine;

// ref : https://github.com/netpyoung/SqlCipher4Unity3D/issues/4

namespace SqlCipher4Unity3D.Example.test.test_update_async
{
    [Preserve]
    public class player_profile
    {
        [PrimaryKey]
        public string save_name { get; set; }

        public int active_player { get; set; }

        public override string ToString() =>
            string.Format("[level_story: save_name={0}, active_player={1}]", save_name, active_player);
    }

    public class test_update_async : MonoBehaviour
    {
        private SQLiteAsyncConnection _dbconn1; //this was initialized elsewhere

        private async void Start()
        {
            var dbPath = @"Assets/test/test_update/test_update.db";
            _dbconn1 = new SQLiteAsyncConnection(dbPath, "");
            await _dbconn1.DropTableAsync<player_profile>();
            await _dbconn1.CreateTableAsync<player_profile>();
            await _dbconn1.InsertAllAsync(new[] {
                new player_profile { save_name = "p1", active_player = 1 }
                , new player_profile { save_name = "p2", active_player = 1 }
                , new player_profile { save_name = "p3", active_player = 1 },
            });
            foreach (var x in await _dbconn1.Table<player_profile>().ToListAsync()) Debug.Log($"before : {x}");
            await wannabe_set_active_player("p2");
            foreach (var x in await _dbconn1.Table<player_profile>().ToListAsync()) Debug.Log($"after : {x}");
        }

        public async Task wannabe_set_active_player(string player_name)
        {
            //IEnumerable<player_profile> active_players = this.dbconn1.Table<player_profile>()
            //        .Where<player_profile>(x => x.active_player > 0 || x.save_name == player_name);
            // because, SqlCipher4Unity's Linq's where result's will be delayed until tolist.
            var active_players = await _dbconn1.Table<player_profile>()
                .Where(x => x.active_player > 0 || x.save_name == player_name).ToListAsync();

            // UpdateAll runs Update within RunInTransaction, so it is okay to skip begintransaction/commit.
            //this.dbconn1.BeginTransaction();

            if (active_players != null)
                foreach (var player in active_players)

                    //if (player_name.Equals(player))
                    if (player_name.Equals(player.save_name)) {
                        Debug.LogWarning($"Attempting to set the active_player field to: {player_name} -> {player}");
                        player.active_player = 1;
                    }
                    else {
                        Debug.LogWarning($"Attempting to clear the active_player field for: {player_name} -> {player}");
                        player.active_player = 0;
                    }
            await _dbconn1.UpdateAllAsync(active_players);
            //this.dbconn1.Commit();
        }
    }
}
