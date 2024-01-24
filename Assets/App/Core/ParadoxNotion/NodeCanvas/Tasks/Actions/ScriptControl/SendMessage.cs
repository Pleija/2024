﻿#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Reflected"), Description("SendMessage to the agent, optionaly with an argument")]
    public class SendMessage : ActionTask<Transform>
    {
        [RequiredField]
        public BBParameter<string> methodName;

        protected override string info => string.Format("Message {0}()", methodName);

        protected override void OnExecute()
        {
            agent.SendMessage(methodName.value);
            EndAction();
        }
    }

    [Category("✫ Reflected"), Description("SendMessage to the agent, optionaly with an argument")]
    public class SendMessage<T> : ActionTask<Transform>
    {
        public BBParameter<T> argument;

        [RequiredField]
        public BBParameter<string> methodName;

        protected override string info => string.Format("Message {0}({1})", methodName, argument);

        protected override void OnExecute()
        {
            if (argument.isNull)
                agent.SendMessage(methodName.value);
            else
                agent.SendMessage(methodName.value, argument.value);
            EndAction();
        }
    }
}
