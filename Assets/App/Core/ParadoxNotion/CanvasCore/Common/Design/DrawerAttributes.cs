#region
using System;
#endregion

namespace ParadoxNotion.Design
{
    ///<summary>Derive this to create custom attributes to be drawn with an AttributeDrawer<T>.</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public abstract class DrawerAttribute : Attribute
    {
        public virtual int priority => int.MaxValue;
        public virtual bool isDecorator => false;
    }

    ///----------------------------------------------------------------------------------------------
    ///<summary>Will dim control for bool, int, float, string if its default value (or empty for string)</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class HeaderAttribute : DrawerAttribute
    {
        public readonly string title;
        public HeaderAttribute(string title) => this.title = title;
        public override bool isDecorator => true;
    }

    ///<summary>Will dim control for bool, int, float, string if its default value (or empty for string)</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class DimIfDefaultAttribute : DrawerAttribute
    {
        public override bool isDecorator => true;
        public override int priority => 0;
    }

    /// <summary>
    ///     Use on top of any field to show it only if the provided field is equal to the provided
    ///     check value
    /// </summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class ShowIfAttribute : DrawerAttribute
    {
        public readonly int checkValue;
        public readonly string fieldName;

        public ShowIfAttribute(string fieldName, int checkValue)
        {
            this.fieldName = fieldName;
            this.checkValue = checkValue;
        }

        public override bool isDecorator => true;
        public override int priority => 1;
    }

    ///<summary>Helper attribute. Denotes that the field is required not to be null or string.empty</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class RequiredFieldAttribute : DrawerAttribute
    {
        public override bool isDecorator => false;
        public override int priority => 2;
    }

    ///<summary>Show a button above field</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class ShowButtonAttribute : DrawerAttribute
    {
        public readonly string buttonTitle;
        public readonly string methodName;

        public ShowButtonAttribute(string buttonTitle, string methodnameCallback)
        {
            this.buttonTitle = buttonTitle;
            methodName = methodnameCallback;
        }

        public override bool isDecorator => true;
        public override int priority => 3;
    }

    ///<summary>Will invoke a callback method when the field is changed</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class CallbackAttribute : DrawerAttribute
    {
        public readonly string methodName;
        public CallbackAttribute(string methodName) => this.methodName = methodName;
        public override bool isDecorator => true;
        public override int priority => 4;
    }

    ///----------------------------------------------------------------------------------------------
    ///<summary>Will clamp float or int value to min</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class MinValueAttribute : DrawerAttribute
    {
        public readonly float min;
        public MinValueAttribute(float min) => this.min = min;
        public MinValueAttribute(int min) => this.min = min;
        public override int priority => 5;
    }

    ///----------------------------------------------------------------------------------------------
    ///<summary>Makes float, int or string field show in a delayed control</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class DelayedFieldAttribute : DrawerAttribute { }

    ///<summary>Makes the int field show as layerfield</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class LayerFieldAttribute : DrawerAttribute { }

    ///<summary>Makes the string field show as tagfield</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class TagFieldAttribute : DrawerAttribute { }

    ///<summary>Makes the string field show as text field with specified number of lines</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class TextAreaFieldAttribute : DrawerAttribute
    {
        public readonly int numberOfLines;
        public TextAreaFieldAttribute(int numberOfLines) => this.numberOfLines = numberOfLines;
    }

    /// <summary>
    ///     Use on top of any type of field to restict values to the provided ones through a popup by
    ///     providing a params
    ///     array of options.
    /// </summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class PopupFieldAttribute : DrawerAttribute
    {
        public readonly object[] options;
        public PopupFieldAttribute(params object[] options) => this.options = options;
    }

    ///<summary>Makes the float or integer field show as slider</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class SliderFieldAttribute : DrawerAttribute
    {
        public readonly float max;
        public readonly float min;

        public SliderFieldAttribute(float min, float max)
        {
            this.min = min;
            this.max = max;
        }

        public SliderFieldAttribute(int min, int max)
        {
            this.min = min;
            this.max = max;
        }
    }

    ///<summary>Forces the field to show as a Unity Object field. Usefull for interface fields</summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class ForceObjectFieldAttribute : DrawerAttribute { }

    /// <summary>
    ///     Can be used on an interface type field to popup select a concrete implementation.
    ///     <summary>
    [AttributeUsage(AttributeTargets.Field)]
    public class ReferenceFieldAttribute : DrawerAttribute { }
}
