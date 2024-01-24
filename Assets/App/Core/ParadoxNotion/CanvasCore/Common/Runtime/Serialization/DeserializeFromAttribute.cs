﻿#region
using System;
#endregion

namespace ParadoxNotion.Serialization
{
    public class DeserializeFromAttribute : Attribute
    {
        public readonly string previousTypeFullName;

        public DeserializeFromAttribute(string previousTypeFullName) =>
                this.previousTypeFullName = previousTypeFullName;
    }
}
