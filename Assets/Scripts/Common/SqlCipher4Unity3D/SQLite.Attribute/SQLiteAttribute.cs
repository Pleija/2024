using System;

namespace SqlCipher4Unity3D.SQLite.Attribute
{
    [AttributeUsage(AttributeTargets.Class)]
    public class ExportAttribute : System.Attribute
    {
    }

    [AttributeUsage(AttributeTargets.Class)]
	public class TableAttribute : System.Attribute
	{
		public string Name { get; set; }

		/// <summary>
		/// Flag whether to create the table without rowid (see https://sqlite.org/withoutrowid.html)
		///
		/// The default is <c>false</c> so that sqlite adds an implicit <c>rowid</c> to every table created.
		/// </summary>
		public bool WithoutRowId { get; set; }

		public TableAttribute(string name)
		{
			Name = name;
		}
	}

	[AttributeUsage(AttributeTargets.Property|AttributeTargets.Field)]
	public class ColumnAttribute : System.Attribute
	{
		public string Name { get; set; }

		public ColumnAttribute(string name)
		{
			Name = name;
		}
	}

	[AttributeUsage(AttributeTargets.Property|AttributeTargets.Field)]
	public class PrimaryKeyAttribute : System.Attribute
	{
	}

	[AttributeUsage(AttributeTargets.Property|AttributeTargets.Field)]
	public class AutoIncrementAttribute : System.Attribute
	{
	}

	[AttributeUsage(AttributeTargets.Property|AttributeTargets.Field)]
	public class IndexedAttribute : System.Attribute
	{
		public string Name { get; set; }
		public int Order { get; set; }
		public virtual bool Unique { get; set; }

		public IndexedAttribute()
		{
		}

		public IndexedAttribute(string name, int order)
		{
			Name = name;
			Order = order;
		}
	}

	[AttributeUsage(AttributeTargets.Property|AttributeTargets.Field)]
	public class IgnoreAttribute : System.Attribute
	{
	}

	[AttributeUsage(AttributeTargets.Property|AttributeTargets.Field)]
	public class UniqueAttribute : IndexedAttribute
	{
		public override bool Unique
		{
			get { return true; }
			set { /* throw?  */ }
		}
	}

	[AttributeUsage(AttributeTargets.Property|AttributeTargets.Field)]
	public class MaxLengthAttribute : System.Attribute
	{
		public int Value { get; private set; }

		public MaxLengthAttribute(int length)
		{
			Value = length;
		}
	}

	public sealed class PreserveAttribute : System.Attribute
	{
		public bool AllMembers;
		public bool Conditional;
	}

	/// <summary>
	/// Select the collating sequence to use on a column.
	/// "BINARY", "NOCASE", and "RTRIM" are supported.
	/// "BINARY" is the default.
	/// </summary>
	[AttributeUsage(AttributeTargets.Property|AttributeTargets.Field)]
	public class CollationAttribute : System.Attribute
	{
		public string Value { get; private set; }

		public CollationAttribute(string collation)
		{
			Value = collation;
		}
	}

	[AttributeUsage(AttributeTargets.Property|AttributeTargets.Field)]
	public class NotNullAttribute : System.Attribute
	{
	}

	[AttributeUsage(AttributeTargets.Enum)]
	public class StoreAsTextAttribute : System.Attribute
	{
	}

}