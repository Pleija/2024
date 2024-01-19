import {StateFsm} from "Common/StateFsm.mjs";
import {下载更新} from "Loading/StartUp/下载更新.mjs";
import Time = CS.UnityEngine.Time;
import Addressables = CS.UnityEngine.AddressableAssets.Addressables;
import $promise = puer.$promise;
import Res = CS.Res;
import AssetReference = CS.UnityEngine.AddressableAssets.AssetReference;
import GameObject = CS.UnityEngine.GameObject;
import $typeof = puer.$typeof;
import Resources = CS.UnityEngine.Resources;
import Setting = CS.Models.Setting;
import JsMain = CS.App.JsMain;
import Version = CS.System.Version;
import UnityApi = CS.UnityApi;

export class StartUp extends StateFsm {
    useRemote: boolean = true;
    prefab: AssetReference;
    下载更新: 下载更新;

    loadDefault() {
        console.log("Load Backup");
        CS.UnityEngine.Object.Instantiate(Resources.Load("Backup", $typeof(GameObject)));
    }


    async init() {
        this.下载更新 = this.bind(下载更新);

        console.log("init StartUp", `Initial Time: ${Time.realtimeSinceStartup.toFixed(2)}`);
        await $promise(Addressables.InitializeAsync().Task);

        const loc = Res.Exists(this.prefab);
        const resVer = Setting.self.ResVersion.Value;
        const baseVer = JsMain.self.baseVersion;
        const isNew = UnityApi.CompareVersion(resVer,baseVer) > 0; //resVer.localeCompare(baseVer, undefined, {numeric: true, sensitivity: 'base'})
        console.log(`ResVersion: ${resVer} baseVersion: ${baseVer} new: ${isNew}`)
        if (this.useRemote && loc && isNew) {
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
