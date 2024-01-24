#region
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
#endregion

namespace SqlCipher4Unity3D.Example.async
{
    public class CreateDBScriptAsync : MonoBehaviour
    {
        [SerializeField]
        public Text DebugText;

        // Use this for initialization
        private async void Start()
        {
            var ds = new DataServiceAsync("tempDatabase.db");
            await ds.CreateDB();
            IEnumerable<Person> people = await ds.GetPersons().ToListAsync();
            ToConsole(people);
            people = await ds.GetPersonsNamedRoberto().ToListAsync();
            ToConsole("Searching for Roberto ...");
            ToConsole(people);
        }

        private void ToConsole(IEnumerable<Person> people)
        {
            foreach (var person in people) ToConsole(person.ToString());
        }

        private void ToConsole(string msg)
        {
            DebugText.text += Environment.NewLine + msg;
            Debug.Log(msg);
        }
    }
}
