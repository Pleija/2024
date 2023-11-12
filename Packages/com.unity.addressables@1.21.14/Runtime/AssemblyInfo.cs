using System.Reflection;
using System.Runtime.CompilerServices;
using UnityEngine.Scripting;

[assembly: Preserve]
[assembly: AssemblyCompany("Unity Technologies")]

#if UNITY_EDITOR
[assembly: InternalsVisibleTo("Unity.Addressables.Editor")]
[assembly: InternalsVisibleTo("Unity.Addressables.Editor.Tests")]
#endif
[assembly: InternalsVisibleTo("Unity.Addressables.Tests")]
[assembly: InternalsVisibleTo("Unity.Addressables.Samples.Tests")]
