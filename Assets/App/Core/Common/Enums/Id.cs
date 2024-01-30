using System;
#if UNITY_EDITOR
#endif

namespace Enums
{
    // 唯一
    [Flags]
    public enum Id
    {
        None = 0, All = 1000, Goal, Action, State, Plan, Red, Yellow, Skier, Actor, Any, Run, PreviewRoot, HideOnStart,
        ShowOnReady, EditorOnly, OnStart, PowerText, PowerBar, ScoreBar, ScoreText, ShowOnStart, HideOnReady, MainMenu,
        Managers, Test, Settings, Bundle, Worlds, StartGame, GameManagerStart, OnGameBegin, ForbiddenArea, FieldOfView,
        Pause, Parents, Parent, Player, Self, Friend, Opponent, Bot, EndPoint, StartPoint, CreateRoom,
    }
}