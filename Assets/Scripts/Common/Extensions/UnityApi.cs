public static class UnityApi
{
    public static T IsNull<T>(this T o) where T : UnityEngine.Object => o == null ? null : o;
}