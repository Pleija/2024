#region
using UnityEngine;
#endregion

namespace Slate
{
    [Description(
        "The DirectorGroup is the master group of the Cutscene. There is always one and can't be removed. The target actor of this group is always the 'Director Camera', thus it's possible to add a PropertiesTrack to animate any of the components attached on the DirectorCamera game object. Usualy Image Effects.")]
    public class DirectorGroup : CutsceneGroup
    {
        public override string name {
            get => "★ DIRECTOR";
            set {
                /*Non Setable*/
            }
        }

        public override GameObject actor {
            get => DirectorCamera.current?.gameObject;
            set {
                /*Non Setable*/
            }
        }

        public override ActorReferenceMode referenceMode {
            get => ActorReferenceMode.UseOriginal;
            set {
                /*Non Setable*/
            }
        }

        public override ActorInitialTransformation initialTransformation {
            get => ActorInitialTransformation.UseOriginal;
            set {
                /*Non Setable*/
            }
        }

        public override Vector3 initialLocalPosition {
            get => Vector3.zero;
            set {
                /*Non Setable*/
            }
        }

        public override Vector3 initialLocalRotation {
            get => Vector3.zero;
            set {
                /*Non Setable*/
            }
        }

        public override bool displayVirtualMeshGizmo {
            get => false;
            set {
                /*Non Setable*/
            }
        }
    }
}
