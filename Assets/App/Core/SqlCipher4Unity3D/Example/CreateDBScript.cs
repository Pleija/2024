#region
using System;
using System.Collections.Generic;
using Sirenix.OdinInspector;
using UnityEngine;
using UnityEngine.UI;
#endregion

namespace SqlCipher4Unity3D.Example
{
    public class CreateDBScript : MonoBehaviour
    {
        [SerializeField]
        public Text DebugText;

        // Use this for initialization
        private void Start()
        {
            StartSync();
        }

        [Button]
        private void StartSync()
        {
            var ds = new DataService("tempDatabase.db");
            ds.CreateDB();
            var people = ds.GetPersons();
            ToConsole(people);
            people = ds.GetPersonsNamedRoberto();
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
