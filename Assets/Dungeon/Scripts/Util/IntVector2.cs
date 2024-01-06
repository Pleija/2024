using UnityEngine;

/*
 * Struct that use a Vector of two int's (x and z)
 */
namespace Dungeon
{
    public struct IntVector2
    {

        public int x, z;

        public IntVector2(int x, int z)
        {
            this.x = x;
            this.z = z;
        }
        public static IntVector2 operator +(IntVector2 a, IntVector2 b)
        {
            return new IntVector2(a.x + b.x, a.z + b.z);
        }

        public static Vector3 operator +(IntVector2 a, Vector3 b)
        {
            return new Vector3(a.x + b.x, 0, a.z + b.z);
        }

        public static IntVector2 operator -(IntVector2 a, IntVector2 b)
        {
            return new IntVector2(a.x - b.x, a.z - b.z);
        }

        public static IntVector2 operator *(int b, IntVector2 a)
        {
            return new IntVector2(a.x * b, a.z * b);
        }


        public override string ToString()
        {
            return "("+x+","+z+")";
        }
    }
}