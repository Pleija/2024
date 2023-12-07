using System;
using System.Linq;
using System.Reflection;
using MessagePack;

namespace Api
{
    public class NetConfig
    {
        public static string Base64 =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        public static string salt => "047A35CB-4037-47A4-B352-77E263D80809";
        public static T Deserialize<T>(byte[] value) => MessagePackSerializer.Deserialize<T>(value);

        public static object MakeTuple(Type[] typeArguments, object[] values)
        {
            return typeof(Tuple).GetMethods()
                .FirstOrDefault(method =>
                    method.Name == "Create" &&
                    method.GetParameters().Length == typeArguments.Length)
                ?.MakeGenericMethod(typeArguments)?.Invoke(null, values);
        }

        public static object Des(Type[] types, object data)
        {
            var type = types.Length switch {
                0 => null,
                1 => types[0],
                2 => typeof(Tuple<,>).MakeGenericType(types),
                3 => typeof(Tuple<,,>).MakeGenericType(types),
                4 => typeof(Tuple<,,,>).MakeGenericType(types),
                5 => typeof(Tuple<,,,,>).MakeGenericType(types),
                6 => typeof(Tuple<,,,,,>).MakeGenericType(types),
                _ => null,
            };
            if(type == null) return null;
            var method =
                typeof(NetConfig).GetMethod("Deserialize",
                    BindingFlags.Public | BindingFlags.Static)!.MakeGenericMethod(type);
            return method.Invoke(null, new[] { data });
        }
    }
}
