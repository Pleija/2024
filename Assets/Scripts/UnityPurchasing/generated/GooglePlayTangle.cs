// WARNING: Do not modify! Generated file.

namespace UnityEngine.Purchasing.Security
{
    public class GooglePlayTangle
    {
        private static byte[] data = System.Convert.FromBase64String(
            "rmczrv+qZSKN+JkyTKN1b/hnIraKyc4ZS7zOOdW6Cqv3Yif/4ArqtOgqyDy0nz078YQP2pK4jeDIXMYbKvubazqbcKEbFXiiRLZbreizgBuCVYEMXzHXcFbS+ha+EDTCTERtTpQmpYaUqaKtjiLsIlOppaWloaSnJqWrpJQmpa6mJqWlpGjY0T9Nim2rA/BlAGb+4aYTtHTrZcGt7Ug60s/tGBGGqpd59TOaDCbfXjFTO/5lxrOrhEm4edc/ZcTD0sJ4cF7s8x6v0Ixlof3u8KBsyTlE4qqHocLE+PiY0lvpXv2ZTrm7v7YFA5YMZDztmEr9ZQhngbi8LtFAYfsSy9nhvvVfhnEXYgu/wZyAe9opXDdYHSI/q8lLnKHhqkOLHaanpaSl");

        private static int[] order = new int[] { 3, 5, 2, 10, 8, 10, 10, 9, 10, 9, 10, 12, 12, 13, 14 };
        private static int key = 164;
        public static readonly bool IsPopulated = true;

        public static byte[] Data()
        {
            if (IsPopulated == false)
                return null;
            return Obfuscator.DeObfuscate(data, order, key);
        }
    }
}
