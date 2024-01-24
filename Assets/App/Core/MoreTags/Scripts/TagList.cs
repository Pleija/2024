namespace MoreTags
{
    public static class Tag
    {
        public static AllTags all = new AllTags();
        public static ObjectGroup Object = new ObjectGroup("Object");
        public static ColorGroup Color = new ColorGroup("Color");
    }

    public class ObjectGroup : TagGroup
    {
        public TagName Capsule = new TagName("Object.Capsule");
        public TagName Cube = new TagName("Object.Cube");
        public TagName Cylinder = new TagName("Object.Cylinder");
        public TagName Sphere = new TagName("Object.Sphere");
        public ObjectGroup(string name) : base(name) { }
    }

    public class ColorGroup : TagGroup
    {
        public TagName Blue = new TagName("Color.Blue");
        public TagName Cyan = new TagName("Color.Cyan");
        public TagName Green = new TagName("Color.Green");
        public TagName Magenta = new TagName("Color.Magenta");
        public TagName Red = new TagName("Color.Red");
        public TagName Yellow = new TagName("Color.Yellow");
        public ColorGroup(string name) : base(name) { }
    }

    public class AllTags : TagNames
    {
        public TagChildren Blue = new TagChildren("Blue");
        public TagChildren Capsule = new TagChildren("Capsule");
        public TagChildren Cube = new TagChildren("Cube");
        public TagChildren Cyan = new TagChildren("Cyan");
        public TagChildren Cylinder = new TagChildren("Cylinder");
        public TagChildren Green = new TagChildren("Green");
        public TagChildren Magenta = new TagChildren("Magenta");
        public TagChildren Red = new TagChildren("Red");
        public TagChildren Sphere = new TagChildren("Sphere");
        public TagChildren Yellow = new TagChildren("Yellow");
        public AllTags() : base(TagSystem.AllTags()) { }
    }
}
