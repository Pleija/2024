using System;

namespace Enums
{
    //事件和消息
    [Flags]
    public enum On
    {
        None = 3000,
        Idle,
        AppInit,
        AppStart,
        MissionStart,
        RoomStart,
        RoomReady,
        PlayerReady,
        MissionReady,
        Pause,
        Playing,
        GameOver,     //
        OpenMainMenu, //
        OpenArena,    //
        OpenWorlds    //
    }
}
