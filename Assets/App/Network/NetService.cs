#region
using Api;
using UnityEngine;
#endregion

namespace Network
{
    public interface INetService { }

    public class NetService : INetService
    {
        public void AddText(string log)
        {
            Debug.Log(log);
        }

        public void Send(string arg)
        {
            AddText($"On '<color=green>Send</color>': '<color=yellow>{arg}</color>'");
        }

        public void Person(Person person)
        {
            AddText($"On '<color=green>Person</color>': '<color=yellow>{person}</color>'");
        }

        public void TwoPersons(Person person1, Person person2)
        {
            AddText(
                $"On '<color=green>TwoPersons</color>': '<color=yellow>{person1}</color>', '<color=yellow>{person2}</color>'");
        }
    }
}
