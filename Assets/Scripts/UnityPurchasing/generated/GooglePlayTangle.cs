// WARNING: Do not modify! Generated file.

namespace UnityEngine.Purchasing.Security {
    public class GooglePlayTangle
    {
        private static byte[] data = System.Convert.FromBase64String("2RBE2YjdElX6j+5FO9QCGI8QVcH1IvZ7KEagByGljWHJZ0O1OzMaOeNR0vHj3tXa+VWbVSTe0tLS1tPQXYzsHE3sB9ZsYg/VM8Es2p/E92zvPYoSfxD2z8tZpjcWjGW8rpbJgo/vpSyeKYruOc7MyMFydOF7E0uaUdLc0+NR0tnRUdLS0x+vpkg6/RqfXb9Lw+hKTIbzeK3lz/qXvyuxbNin+xLWipmH1xu+TjOV3fDWtbOP/b65bjzLuU6izX3cgBVQiJd9ncOxxNzzPs8OoEgSs7SltQ8HKZuEadx0hxJ3EYmW0WTDA5wSttqaP02luJpvZvHd4A6CRO17UagpRiRMiRIo8QZgFXzItuv3DK1eK0AvalVI3L4869aW3TT8atHQ0tPS");
        private static int[] order = new int[] { 3,8,3,10,11,12,8,10,11,12,10,12,12,13,14 };
        private static int key = 211;

        public static readonly bool IsPopulated = true;

        public static byte[] Data() {
        	if (IsPopulated == false)
        		return null;
            return Obfuscator.DeObfuscate(data, order, key);
        }
    }
}
