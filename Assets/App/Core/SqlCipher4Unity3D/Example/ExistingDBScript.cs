#region
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
#endregion

namespace SqlCipher4Unity3D.Example
{
    public class ExistingDBScript : MonoBehaviour
    {
        public Text DebugText;

        // Use this for initialization
        private void Start()
        {
            var ds = new DataService("existing.db");
            ds.CreateDB();
            var people = ds.GetPersons();
            ToConsole(people);
            people = ds.GetPersonsNamedRoberto();
            ToConsole("Searching for Roberto ...");
            ToConsole(people);
            ds.CreatePerson();
            ToConsole("New person has been created");
            var p = ds.GetJohnny();
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
