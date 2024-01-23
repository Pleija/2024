// // This was constructed mostly from public-domain code snippets.
// // The primary implementation used is `HenriFormatter` by Henri Wiechers, as presented by Phil Haack
// // at https://haacked.com/archive/2009/01/14/named-formats-redux.aspx/.
// // It's a Finite State Machine, so it's easy to understand and modify, and it's fast.
// // This implementation eliminates the dependency on System.Web.UI.DataBinder by borrowing some code 
// // from the DataBinder itself.
//
// // Usage:
// // "Hello {entity}! Your lucky number is {luckyNumber:N2}."
// //     .FormatWith(new{entity ="world", luckyNumber = 42.3});
// // produces
// // `Hello world! Your lucky number is 42.30.`
//
// using System;
// using System.IO;
// using System.Text;
//
// public static class TemplateFormatStringExtension
// {
//
//     private static object GetPropValue(object propContainer, string propName, Func<object, string, object> getValueFunc)
//     {
//         if (propContainer == null)
//             throw new ArgumentNullException(nameof(propContainer));
//         if (String.IsNullOrEmpty(propName))
//             throw new ArgumentNullException(nameof(propName));
//         return getValueFunc(propContainer, propName);
//     }
//
//
//
//     private static string GetPropValue(object propContainer, string propName, string format, Func<object, string, object> getValueFunc)
//     {
//         object value = GetPropValue(propContainer, propName, getValueFunc);
//         if ((value == null) || (value == DBNull.Value))
//             return string.Empty;
//         if (String.IsNullOrEmpty(format))
//             return value.ToString();
//         return string.Format(format, value);
//     }
//
//
//
//     private static string FormatExpression(string expression, object source, Func<object, string, object> getValueFunc)
//     {
//         string format = "";
//
//         int colonIndex = expression.IndexOf(':');
//         if (colonIndex > 0)
//         {
//             format = expression.Substring(colonIndex + 1);
//             expression = expression.Substring(0, colonIndex);
//         }
//
//         try
//         {
//             if (String.IsNullOrEmpty(format))
//             {
//                 return GetPropValue(source, expression, getValueFunc).ToString();
//             }
//             return GetPropValue(source, expression, "{0:" + format + "}", getValueFunc);
//         }
//         catch (Exception)
//         {
//             throw new FormatException(expression);
//         }
//     }
//
//
//
//     public static string FormatWith(this string format, object source, Func<object, string, object> getValueFunc = null)
//     {
//         if (format == null)
//             throw new ArgumentNullException(nameof(format));
//         if (getValueFunc == null)
//             getValueFunc = (obj, name) => obj.GetType().GetProperty(name).GetValue(obj, null);
//
//
//         StringBuilder result = new StringBuilder(format.Length * 2);
//
//         using (var reader = new StringReader(format))
//         {
//             StringBuilder expression = new StringBuilder();
//             int ch = -1;
//
//             State state = State.OutsideExpression;
//             do
//             {
//                 switch (state)
//                 {
//                     case State.OutsideExpression:
//                         ch = reader.Read();
//                         switch (ch)
//                         {
//                             case -1:
//                                 state = State.End;
//                                 break;
//                             case '{':
//                                 state = State.OnOpenBracket;
//                                 break;
//                             case '}':
//                                 state = State.OnCloseBracket;
//                                 break;
//                             default:
//                                 result.Append((char)ch);
//                                 break;
//                         }
//                         break;
//                     case State.OnOpenBracket:
//                         ch = reader.Read();
//                         switch (ch)
//                         {
//                             case -1:
//                                 throw new FormatException();
//                             case '{':
//                                 result.Append('{');
//                                 state = State.OutsideExpression;
//                                 break;
//                             default:
//                                 expression.Append((char)ch);
//                                 state = State.InsideExpression;
//                                 break;
//                         }
//                         break;
//                     case State.InsideExpression:
//                         ch = reader.Read();
//                         switch (ch)
//                         {
//                             case -1:
//                                 throw new FormatException();
//                             case '}':
//                                 result.Append(FormatExpression(expression.ToString(), source, getValueFunc));
//                                 expression.Length = 0;
//                                 state = State.OutsideExpression;
//                                 break;
//                             default:
//                                 expression.Append((char)ch);
//                                 break;
//                         }
//                         break;
//                     case State.OnCloseBracket:
//                         ch = reader.Read();
//                         switch (ch)
//                         {
//                             case '}':
//                                 result.Append('}');
//                                 state = State.OutsideExpression;
//                                 break;
//                             default:
//                                 throw new FormatException();
//                         }
//                         break;
//                     default:
//                         throw new InvalidOperationException("Invalid state.");
//                 }
//             } while (state != State.End);
//         }
//
//         return result.ToString();
//     }
//
//
//
//     private enum State
//     {
//         OutsideExpression,
//         OnOpenBracket,
//         InsideExpression,
//         OnCloseBracket,
//         End
//     }
//
// }


