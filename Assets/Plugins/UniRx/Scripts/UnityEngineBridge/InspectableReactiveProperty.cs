using System;
using System.Collections.Generic;
using UniRx.InternalUtil;
using UnityEngine;

namespace UniRx
{
    /// <summary>
    /// Inspectable ReactiveProperty.
    /// </summary>
    [Serializable]
    public class IntReactiveProperty : ReactiveProperty<int>
    {
        public IntReactiveProperty() : base() { }
        public IntReactiveProperty(int initialValue) : base(initialValue) { }
        public static implicit operator int(IntReactiveProperty target) => target?.Value ?? default;
        public static implicit operator IntReactiveProperty(int target) => new IntReactiveProperty(target);
    }

    /// <summary>
    /// Inspectable ReactiveProperty.
    /// </summary>
    [Serializable]
    public class LongReactiveProperty : ReactiveProperty<long>
    {
        public LongReactiveProperty() : base() { }
        public LongReactiveProperty(long initialValue) : base(initialValue) { }

        public static implicit operator long(LongReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator LongReactiveProperty(long target) => new LongReactiveProperty(target);
    }

    /// <summary>
    /// Inspectable ReactiveProperty.
    /// </summary>
    [Serializable]
    public class ByteReactiveProperty : ReactiveProperty<byte>
    {
        public ByteReactiveProperty() : base() { }
        public ByteReactiveProperty(byte initialValue) : base(initialValue) { }

        public static implicit operator byte(ByteReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator ByteReactiveProperty(byte target) => new ByteReactiveProperty(target);
    }

    /// <summary>
    /// Inspectable ReactiveProperty.
    /// </summary>
    [Serializable]
    public class FloatReactiveProperty : ReactiveProperty<float>
    {
        public FloatReactiveProperty() : base() { }
        public FloatReactiveProperty(float initialValue) : base(initialValue) { }
        public static implicit operator float(FloatReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator FloatReactiveProperty(float target) => new FloatReactiveProperty(target);
    }

    /// <summary>
    /// Inspectable ReactiveProperty.
    /// </summary>
    [Serializable]
    public class DoubleReactiveProperty : ReactiveProperty<double>
    {
        public DoubleReactiveProperty() : base() { }
        public DoubleReactiveProperty(double initialValue) : base(initialValue) { }
        public static implicit operator double(DoubleReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator DoubleReactiveProperty(double target) => new DoubleReactiveProperty(target);
    }

    /// <summary>
    /// Inspectable ReactiveProperty.
    /// </summary>
    [Serializable]
    public class StringReactiveProperty : ReactiveProperty<string>
    {
        public StringReactiveProperty() : base() { }
        public StringReactiveProperty(string initialValue) : base(initialValue) { }
        public static implicit operator string(StringReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator StringReactiveProperty(string target) => new StringReactiveProperty(target);
    }

    /// <summary>
    /// Inspectable ReactiveProperty.
    /// </summary>
    [Serializable]
    public class BoolReactiveProperty : ReactiveProperty<bool>
    {
        public BoolReactiveProperty() : base() { }
        public BoolReactiveProperty(bool initialValue) : base(initialValue) { }
        public static implicit operator bool(BoolReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator BoolReactiveProperty(bool target) => new BoolReactiveProperty(target);
    }

    /// <summary>Inspectable ReactiveProperty.</summary>
    [Serializable]
    public class Vector2ReactiveProperty : ReactiveProperty<Vector2>
    {
        public Vector2ReactiveProperty() { }
        public Vector2ReactiveProperty(Vector2 initialValue) : base(initialValue) { }

        protected override IEqualityComparer<Vector2> EqualityComparer {
            get { return UnityEqualityComparer.Vector2; }
        }
        public static implicit operator Vector2(Vector2ReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator Vector2ReactiveProperty(Vector2 target) => new Vector2ReactiveProperty(target);
    }

    /// <summary>Inspectable ReactiveProperty.</summary>
    [Serializable]
    public class Vector3ReactiveProperty : ReactiveProperty<Vector3>
    {
        public Vector3ReactiveProperty() { }
        public Vector3ReactiveProperty(Vector3 initialValue) : base(initialValue) { }

        protected override IEqualityComparer<Vector3> EqualityComparer {
            get { return UnityEqualityComparer.Vector3; }
        }
        public static implicit operator Vector3(Vector3ReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator Vector3ReactiveProperty(Vector3 target) => new Vector3ReactiveProperty(target);
    }

    /// <summary>Inspectable ReactiveProperty.</summary>
    [Serializable]
    public class Vector4ReactiveProperty : ReactiveProperty<Vector4>
    {
        public Vector4ReactiveProperty() { }
        public Vector4ReactiveProperty(Vector4 initialValue) : base(initialValue) { }

        protected override IEqualityComparer<Vector4> EqualityComparer {
            get { return UnityEqualityComparer.Vector4; }
        }
        public static implicit operator Vector4(Vector4ReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator Vector4ReactiveProperty(Vector4 target) => new Vector4ReactiveProperty(target);
    }

    /// <summary>Inspectable ReactiveProperty.</summary>
    [Serializable]
    public class ColorReactiveProperty : ReactiveProperty<Color>
    {
        public ColorReactiveProperty() { }
        public ColorReactiveProperty(Color initialValue) : base(initialValue) { }

        protected override IEqualityComparer<Color> EqualityComparer {
            get { return UnityEqualityComparer.Color; }
        }
        public static implicit operator Color(ColorReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator ColorReactiveProperty(Color target) => new ColorReactiveProperty(target);
    }

    /// <summary>Inspectable ReactiveProperty.</summary>
    [Serializable]
    public class RectReactiveProperty : ReactiveProperty<Rect>
    {
        public RectReactiveProperty() { }
        public RectReactiveProperty(Rect initialValue) : base(initialValue) { }

        protected override IEqualityComparer<Rect> EqualityComparer {
            get { return UnityEqualityComparer.Rect; }
        }
        public static implicit operator Rect(RectReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator RectReactiveProperty(Rect target) => new RectReactiveProperty(target);
    }

    /// <summary>Inspectable ReactiveProperty.</summary>
    [Serializable]
    public class AnimationCurveReactiveProperty : ReactiveProperty<AnimationCurve>
    {
        public AnimationCurveReactiveProperty() { }
        public AnimationCurveReactiveProperty(AnimationCurve initialValue) : base(initialValue) { }
        public static implicit operator AnimationCurve(AnimationCurveReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator AnimationCurveReactiveProperty(AnimationCurve target) => new AnimationCurveReactiveProperty(target);
    }

    /// <summary>Inspectable ReactiveProperty.</summary>
    [Serializable]
    public class BoundsReactiveProperty : ReactiveProperty<Bounds>
    {
        public BoundsReactiveProperty() { }
        public BoundsReactiveProperty(Bounds initialValue) : base(initialValue) { }

        protected override IEqualityComparer<Bounds> EqualityComparer {
            get { return UnityEqualityComparer.Bounds; }
        }
        public static implicit operator Bounds(BoundsReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator BoundsReactiveProperty(Bounds target) => new BoundsReactiveProperty(target);

    }

    /// <summary>Inspectable ReactiveProperty.</summary>
    [Serializable]
    public class QuaternionReactiveProperty : ReactiveProperty<Quaternion>
    {
        public QuaternionReactiveProperty() { }
        public QuaternionReactiveProperty(Quaternion initialValue) : base(initialValue) { }

        protected override IEqualityComparer<Quaternion> EqualityComparer {
            get { return UnityEqualityComparer.Quaternion; }
        }
        public static implicit operator Quaternion(QuaternionReactiveProperty target) =>
            target?.Value ?? default;

        public static implicit operator QuaternionReactiveProperty(Quaternion target) => new QuaternionReactiveProperty(target);
    }
}
