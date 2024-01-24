#region
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
#endregion

public static class StringExtensions
{
    public static bool IsNullOrEmpty(this string s) => string.IsNullOrEmpty(s);
    public static bool IsNullOrWhiteSpace(this string s) => string.IsNullOrWhiteSpace(s);

    public static bool IsMatch(this string s, string pattern)
    {
        if (s == null) return false;
        return Regex.IsMatch(s, pattern);
    }

    public static string Match(this string s, string pattern)
    {
        if (s == null) return "";
        return Regex.Match(s, pattern).Value;
    }

    public static bool IsInt(this string s)
    {
        int i;
        return int.TryParse(s, out i);
    }

    public static int ToInt(this string s) => int.Parse(s);

    public static string ToCamel(this string s)
    {
        if (s.IsNullOrEmpty()) return s;
        return s[0].ToString().ToLower() + s.Substring(1);
    }

    public static string ToPascal(this string s)
    {
        if (s.IsNullOrEmpty()) return s;
        return s[0].ToString().ToUpper() + s.Substring(1);
    }

    public static string FormatWith(this string format, params object[] args)
    {
        args = args ?? new object[0];
        string result;
        var numberedTemplateCount =
                (from object match in new Regex(@"\{\d{1,2}\}").Matches(format)
                    select match.ToString()).Distinct()
                .Count();

        if (numberedTemplateCount != args.Length) {
            var argsDictionary = args[0].ToDictionary();
            if (!argsDictionary.Any())
                throw new InvalidOperationException(
                    "Please supply enough args for the numbered templates or use an anonymous object to identify the templates by name.");
            result = argsDictionary.Aggregate(format,
                (current, o) => current.Replace(
                    "{" + o.Key + "}", (o.Value ?? string.Empty).ToString()));
        }
        else {
            result = string.Format(format, args);
        }
        if (result == format)
            throw new InvalidOperationException(
                "You cannot mix template types. Use numbered templates or named ones with an anonymous object.");
        return result;
    }
}

public static class ObjectExtensions
{
    public static IDictionary<string, object> ToDictionary(this object o)
    {
        if (o == null) return new Dictionary<string, object>();
        return o.GetType().GetProperties().ToDictionary(x => x.Name, x => x.GetValue(o));
    }
}
