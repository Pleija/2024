using System;
using WebSocketSharp;
using WebSocketSharp.Server;

public class Echo : WebSocketBehavior
{
    protected override void OnMessage (MessageEventArgs e)
    {
        var name = Context.QueryString ["name"];
        var msg = name != null
            ? String.Format ("Returns '{0}' to {1}", e.Data, name)
            : e.Data;

        Send (msg);
    }
}