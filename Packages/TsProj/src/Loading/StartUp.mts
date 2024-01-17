import {StateFsm} from "Common/StateFsm.mjs";
import Time = CS.UnityEngine.Time;
import Addressables = CS.UnityEngine.AddressableAssets.Addressables;
import $promise = puer.$promise;
import Res = CS.Res;
import AssetReference = CS.UnityEngine.AddressableAssets.AssetReference;
import GameObject = CS.UnityEngine.GameObject;
import $typeof = puer.$typeof;
import Resources = CS.UnityEngine.Resources;

export class StartUp extends StateFsm {
    useRemote: boolean = true;
    prefab: AssetReference;

    loadDefault() {
        console.log("Load DefaultLoading");
        CS.UnityEngine.Object.Instantiate(Resources.Load("DefaultLoading", $typeof(GameObject)));
    }

    async init() {
        console.log("init StartUp", `Initial Time: ${Time.realtimeSinceStartup.toFixed(2)}`);
        await $promise(Addressables.InitializeAsync().Task);

        const loc = Res.Exists(this.prefab);
        if (this.useRemote && loc) {
            console.log("StartContent Found");
            this.prefab.Check(x => {
                console.log("check ok");
            });
            await $promise(this.prefab.Inst(t => {
                if (t == null) {
                    this.loadDefault();
                }
            }));
            return;
        }
        this.loadDefault();
    }
}

export const self: StartUp = global.$StartUp ??= new StartUp();
