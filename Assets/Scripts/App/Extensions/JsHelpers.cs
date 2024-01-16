using Puerts;

namespace App
{
    public static partial class JsHelpers
    {
        /// <summary>
        ///     to js: let result = new Uint8Array(arrayBuffer);
        /// </summary>
        /// <param name="array"></param>
        /// <returns></returns>
        public static ArrayBuffer ToArrayBuffer(this byte[] array) => new ArrayBuffer(array);
    }
}
