
// @ts-nocheck 

declare namespace System {
    interface Object {
        [__keep_incompatibility]: never;

        Equals($obj: any): boolean

        Equals($objA: any, $objB: any): boolean

        GetHashCode(): number

        GetType(): System.Type

        ToString(): string

        ReferenceEquals($objA: any, $objB: any): boolean

        constructor()
    }
}

declare namespace UnityEngine {
    interface Object {

        [__keep_incompatibility]: never;

        get name(): string;

        set name(value: string);

        get hideFlags(): UnityEngine.HideFlags;

        set hideFlags(value: UnityEngine.HideFlags);

        GetInstanceID(): number

        op_Implicit($exists: UnityEngine.Object): boolean

        Instantiate($original: UnityEngine.Object, $position: UnityEngine.Vector3, $rotation: UnityEngine.Quaternion): UnityEngine.Object

        Instantiate($original: UnityEngine.Object, $position: UnityEngine.Vector3, $rotation: UnityEngine.Quaternion, $parent: UnityEngine.Transform): UnityEngine.Object

        Instantiate($original: UnityEngine.Object): UnityEngine.Object

        Instantiate($original: UnityEngine.Object, $parent: UnityEngine.Transform): UnityEngine.Object

        Instantiate($original: UnityEngine.Object, $parent: UnityEngine.Transform, $instantiateInWorldSpace: boolean): UnityEngine.Object

        Instantiate($original: UnityEngine.Object, $parent: UnityEngine.Transform, $worldPositionStays: boolean): UnityEngine.Object

        Destroy($obj: UnityEngine.Object, $t: number): void

        Destroy($obj: UnityEngine.Object): void

        DestroyImmediate($obj: UnityEngine.Object, $allowDestroyingAssets: boolean): void

        DestroyImmediate($obj: UnityEngine.Object): void

        FindObjectsOfType($type: System.Type): System.Array$1<UnityEngine.Object>

        FindObjectsOfType($type: System.Type, $includeInactive: boolean): System.Array$1<UnityEngine.Object>

        FindObjectsByType($type: System.Type, $sortMode: UnityEngine.FindObjectsSortMode): System.Array$1<UnityEngine.Object>

        FindObjectsByType($type: System.Type, $findObjectsInactive: UnityEngine.FindObjectsInactive, $sortMode: UnityEngine.FindObjectsSortMode): System.Array$1<UnityEngine.Object>

        DontDestroyOnLoad($target: UnityEngine.Object): void

        FindObjectOfType($type: System.Type): UnityEngine.Object

        FindFirstObjectByType($type: System.Type): UnityEngine.Object

        FindAnyObjectByType($type: System.Type): UnityEngine.Object

        FindObjectOfType($type: System.Type, $includeInactive: boolean): UnityEngine.Object

        FindFirstObjectByType($type: System.Type, $findObjectsInactive: UnityEngine.FindObjectsInactive): UnityEngine.Object

        FindAnyObjectByType($type: System.Type, $findObjectsInactive: UnityEngine.FindObjectsInactive): UnityEngine.Object

        op_Equality($x: UnityEngine.Object, $y: UnityEngine.Object): boolean

        op_Inequality($x: UnityEngine.Object, $y: UnityEngine.Object): boolean

        constructor()

    }
}

declare namespace System.Collections.Generic {
    interface IEnumerable$1<T> {
        AsWhere($cb: (v: T) => boolean): System.Collections.Generic.IEnumerable$1<T>

        AsFirstOrDefault($cb?: (v: T) => boolean): T

        AsFirst($cb?: (v: T) => boolean): T

        AsForEach($cb: (v: T) => void): System.Collections.Generic.IEnumerable$1<T>

        AsForEach($action: (v: T, i: number) => void): System.Collections.Generic.IEnumerable$1<T>
    }
}

declare namespace UnityEngine {
    interface Component {
        Get<T>(c: new(...args: any[]) => T): T;

        GetInChildren<T>(c: new(...args: any[]) => T, invisible?: boolean): T;

        GetsInChildren<T>(c: new(...args: any[]) => T, invisible?: boolean): T[];

        GetInParent<T>(c: new(...args: any[]) => T, invisible?: boolean): T;

        GetsInParent<T>(c: new(...args: any[]) => T, invisible?: boolean): T[];
    }

    interface GameObject {
        Get<T>(c: new(...args: any[]) => T): T;

        GetInChildren<T>(c: new(...args: any[]) => T, invisible?: boolean): T;

        GetsInChildren<T>(c: new(...args: any[]) => T, invisible?: boolean): T[];

        GetInParent<T>(c: new(...args: any[]) => T, invisible?: boolean): T;

        GetsInParent<T>(c: new(...args: any[]) => T, invisible?: boolean): T[];
    }
}
