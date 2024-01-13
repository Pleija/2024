namespace Runner.Game
{
    public class SeededRun : Modifier
    {
        private int m_Seed;
        public const int k_DaysInAWeek = 7;
        public SeededRun() => m_Seed = System.DateTime.Now.DayOfYear / k_DaysInAWeek;

        public override void OnRunStart(GameState state)
        {
            state.trackManager.trackSeed = m_Seed;
        }

        public override bool OnRunEnd(GameState state)
        {
            state.QuitToLoadout();
            return false;
        }
    }
}