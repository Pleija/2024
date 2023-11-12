using System.Net.Http;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR.Client;

namespace App.Network
{
    using System.Threading.Tasks;
    using UnityEngine;
    using UnityEngine.Events;

    public class MySignalRService : MonoBehaviour
    {
        // public Text ReceivedText;
        // public InputField MessageInput;
        // public Button SendButton;
        private SignalRConnector connector;
        public async Task Start()
        {
            connector = new SignalRConnector();
            connector.OnMessageReceived += UpdateReceivedMessages;

            await connector.InitAsync();
           // SendButton.onClick.AddListener(SendMessage);
        }
        private void UpdateReceivedMessages(Message newMessage)
        {
            // var lastMessages = this.ReceivedText.text;
            // if(string.IsNullOrEmpty(lastMessages) == false)
            // {
            //     lastMessages += "\n";
            // }
            Debug.Log($"User:{newMessage.UserName} Message:{newMessage.Text}") ;
            //this.ReceivedText.text = lastMessages;
        }
        private async void SendMessage()
        {
            await connector.SendMessageAsync(new Message
            {
                UserName = "Example",
                Text = "test", //MessageInput.text,
            });
        }

    }
}
