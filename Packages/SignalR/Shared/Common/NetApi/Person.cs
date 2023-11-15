using System;
using System.Collections.Generic;
using UnityEngine;

// namespace Hubs;

public class Person
{
    public Vector3[] Positions { get; set; }
    public string Name { get; set; }
    public long Age { get; set; }
    public DateTime Joined { get; set; }
    public PersonStates State { get; set; }
    public List<Person> Friends { get; set; }

    public override string ToString()
    {
        return string.Format("[Person Name: '{0}', Age: {1}]", this.Name, this.Age.ToString());
    }
}