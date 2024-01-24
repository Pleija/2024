#region
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
#endregion

namespace SqlCipher4Unity3D.Example.async
{
    public class ExistingDBScriptAsync : MonoBehaviour
    {
        public Text DebugText;

        // Use this for initialization
        private async void Start()
        {
            var ds = new DataServiceAsync("existing.db");
            await ds.CreateDB();
            IEnumerable<Person> people = await ds.GetPersons().ToListAsync();
            ToConsole(people);
            people = await ds.GetPersonsNamedRoberto().ToListAsync();
            ToConsole("Searching for Roberto ...");
            ToConsole(people);
            await ds.CreatePerson();
            ToConsole("New person has been created");
            var p = await ds.GetJohnny();
            ToConsole(p.ToString());
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
