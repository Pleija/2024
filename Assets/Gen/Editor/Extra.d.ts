declare interface Singleton$1<T> {
    get $self(): T;
    set $self(value: T);
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
