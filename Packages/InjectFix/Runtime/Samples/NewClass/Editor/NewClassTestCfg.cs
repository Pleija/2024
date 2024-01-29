using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using Hotfix;

[Configure]
public class NewClassTestCfg {

	[Hotfix]
    static IEnumerable<Type> hotfix
    {
        get
        {
            return new List<Type>()
            {
                typeof(NewClassTest)
            };
        }
    }
}
