using System.Collections.Generic;
using UnityEngine;

namespace Dungeon
{
    /**
 * Manage all items that are on the game grid.
 * The Game grid is a X and Z int Vector.
 * Each object is in a position in the XZ IntVector
 * Objects can be walls, enemies, the hero, items, anything that exist in the grid
 */

    public static class ObjectManager  {

        //List Of Objects in the game grid
        private static List<BaseObj>[,] objList;

        //You want that all the itens finish theis actions before being able to do the next turn? (Ex: Wait all the arrows hit something before being able to move)
        public static bool WaitForActionsToFinish = false;
        //Number of objects that still have an action to finish
        private static int objectsInAction = 0;

        //Size X of the grid
        public static int sizeX
        {
            get
            {
                return objList.GetLength(0);
            }
        }

        //Size Z of the grid
        public static int sizeZ
        {
            get
            {
                return objList.GetLength(1);
            }
        }

        //An object started and action. (Ex: Arrow is flying)
        public static void StartAction()
        {
            objectsInAction++;
        }

        //An object ended the action (Ex:Arrow hit something and was destroyed)
        public static void EndAction()
        {
            objectsInAction--;
        }

        //Is any action happining right now?
        public static bool IsActionsHapping()
        {
            //return false if the game is not waiting for actions to finish
            if (!WaitForActionsToFinish)
                return false;
            return objectsInAction != 0;
        }

        //Start the object list
        public static void Start(int sizeX, int sizeZ)
        {
            objList = new List<BaseObj>[sizeX, sizeZ];
            Debug.Log("Creating Objects of size " + sizeX +" "+sizeZ);
        }

    
        //If a position is inside the Manager bounds
        public static bool InsideBounds(IntVector2 pos)
        {
            if (pos.x < 0 || pos.z < 0)
                return false;
            if (pos.x >= objList.GetLength(0) || pos.z >= objList.GetLength(1))
                return false;
            return true;
        }

        //Get an object of a type in a position
        public static BaseObj GetObjectOfTypeAt(IntVector2 pos, BaseObj.Type type)
        {
            return GetObjectOfTypeAt(pos.x, pos.z, type);

        }

        //Get an object of a type in a position
        public static BaseObj GetObjectOfTypeAt(int x, int z, BaseObj.Type type)
        {
            //Get all objects at this position
            List<BaseObj> objs = GetObjectsAt(x, z);

            //Filter only a object of the type of choice
            for(int i = 0; i < objs.Count; i++)
            {
                if (objs[i].ObjType == type)
                    return objs[i];
            }
            return null;

        }

        //Get all object of type T in a position
        public static List<T> GetObjectsAt<T>(IntVector2 pos) where T:class
        {
            if (pos.x >= objList.GetLength(0) || pos.x < 0)
                return new List<T>();
            if (pos.z >= objList.GetLength(1) || pos.z < 0)
                return new List<T>();
            if (objList[pos.x, pos.z] == null)
                objList[pos.x, pos.z] = new List<BaseObj>();

            List<T> list = new List<T>();

            for(int i = 0; i < objList[pos.x, pos.z].Count; i++)
            {
                if (objList[pos.x, pos.z][i] is T)
                    list.Add(objList[pos.x, pos.z][i] as T);
            }

            return list;
        }

        //Get all the objects in a position
        public static List<BaseObj> GetObjectsAt(IntVector2 pos)
        {
            return GetObjectsAt(pos.x, pos.z);
        }
        //Get all the objects in a position
        public static List<BaseObj> GetObjectsAt(int x, int z)
        {
            if (objList[x, z] == null)
                objList[x, z] = new List<BaseObj>();

            return objList[x, z];
        }
        //Get an object of type interactive in a position
        public static InteractiveObj GetInteractive(IntVector2 pos)
        {
            return GetInteractive(pos.x, pos.z);
        }
        //Get an object of type interactive in a position
        public static InteractiveObj GetInteractive(int x, int z)
        {
            return (InteractiveObj)GetObjectOfTypeAt(x, z, BaseObj.Type.interactive);
        }

        //Set an object to be at position XZ
        public static void SetObjectsAt(int x, int z, BaseObj obj)
        {
            //If there is not ObjList, create a stardard one of 2000 by 2000
            if (objList == null)
                Start(2000, 2000);

            if (objList[x, z] == null)
                objList[x, z] = new List<BaseObj>();

            //If there is a obstacle at this position, destroy the object. (Make sure that the player and ladder can't never be destroyed, like havving a wall at the spawn point;)
            if (!CheckObstacle(x, z))
                objList[x, z].Add(obj);
            else
            {
                GameObject.Destroy(obj.gameObject);
            }

        }

        //Change the position of a object in the grid
        public static void UpdateObjectsAt(int fromX, int fromZ, int toX, int toZ, BaseObj obj)
        {
            if (objList[fromX, fromZ] == null)
                objList[fromX, fromZ] = new List<BaseObj>();
            if (objList[toX, toZ] == null)
                objList[toX, toZ] = new List<BaseObj>();


            objList[fromX, fromZ].Remove(obj);
            objList[toX, toZ].Add(obj);
        }

        //Remove a object from the grid
        public static void RemoveObjectsAt(int x, int z, BaseObj obj)
        {
            if (objList[x, z] == null)
                objList[x, z] = new List<BaseObj>();


            objList[x, z].Remove(obj);
        }

        //Check if there is a obstacle at this position (Anything that is not interactive)
        public static bool CheckObstacle(int x, int z)
        {
            List<BaseObj> objs = GetObjectsAt(x, z);

            for(int i = 0; i < objs.Count; i++)
            {
                //Debug.Log(objs[i].ObjType);
                if (objs[i].ObjType != BaseObj.Type.interactive)
                    return true;
            }
            return false;
        }

        //Check if there is a obstacle at this position (Anything that is not interactive)
        public static bool CheckObstacle(IntVector2 pos)
        {
            return CheckObstacle(pos.x, pos.z);
        }

        //Destroy two objects that share the same position, should not be needed unless some bug appear.
        public static void RemoveOverlayObjects()
        {
        
            for(int x= 0; x < objList.GetLength(0); x++)
            {
                for (int z = 0; z < objList.GetLength(1); z++)
                {
                    List<BaseObj> objs = GetObjectsAt(x, z);
                    bool hasObstacle = false;
                    for (int i = objs.Count - 1; i >= 0 ; i--)
                    {
                        if (hasObstacle)
                        {
                            Debug.Log("Destroying overlays");
                            GameObject.Destroy(objs[i]);
                        }
                        //Debug.Log(objs[i].ObjType);
                        if (objs[i].ObjType != BaseObj.Type.interactive)
                            hasObstacle = true;
                    }
                }
            }
        }
    }
}
