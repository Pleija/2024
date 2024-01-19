// import { Updating } from "Start/Updating.mjs";
// import { StateNode } from "Common/StateNode.mjs";
// import Slider = CS.UnityEngine.UI.Slider;
// import Button = CS.UnityEngine.UI.Button;
// import Text = CS.UnityEngine.UI.Text;
// import Addressables = CS.UnityEngine.AddressableAssets.Addressables;
// import AsyncOperationHandle$1 = CS.UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle$1;
// import List$1 = CS.System.Collections.Generic.List$1;
// import $promise = puer.$promise;
// import IResourceLocator = CS.UnityEngine.AddressableAssets.ResourceLocators.IResourceLocator;
// import MergeMode = CS.UnityEngine.AddressableAssets.Addressables.MergeMode;
// import AsyncOperationHandle = CS.UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle;
// import { iterator } from "Common/Iterator.mjs";
// import Res = CS.Res;
//
// export class StartUpdating extends StateNode<Updating> {
//     slider: Slider;
//     startButton: Button;
//     text: Text;
//     private checkCatalog: AsyncOperationHandle$1<List$1<string>>;
//     private updateCatalog: AsyncOperationHandle$1<List$1<IResourceLocator>>;
//     private getSize: AsyncOperationHandle$1<bigint>;
//     private getDownload: AsyncOperationHandle;
//     private needSize: bigint;
//
//     testStart() {
//     }
//
//     async enter() {
//         console.log("Updating...", getAllMethod(this).join(', '));
//
//         this.slider.value = 0;
//         this.text.text = "";
//         this.checkCatalog = Addressables.CheckForCatalogUpdates(false);
//         await $promise(this.checkCatalog.Task);
//         if (this.checkCatalog.Result?.Count > 0) {
//             this.updateCatalog = Addressables.UpdateCatalogs(this.checkCatalog.Result, false);
//             await $promise(this.updateCatalog.Task);
//             console.log("update catalog", this.updateCatalog.Result.Count);
//             if (this.updateCatalog.IsValid()) {
//                 Addressables.Release(this.updateCatalog as any);
//             }
//         } else {
//             console.log("catalog don't need update");
//         }
//         if (this.checkCatalog.IsValid()) {
//             //Addressables.Release(this.checkCatalog as any);
//         }
//         //const keys = CS.App.Helpers.Res.Keys;
//         this.getSize = Res.GetDownloadSizeAll();
//         await $promise(this.getSize.Task);
//         if (this.getSize.Result > 0) {
//             this.getDownload = Res.DownloadAll();
//             this.needSize = this.getDownload.GetDownloadStatus().TotalBytes - this.getDownload.GetDownloadStatus().DownloadedBytes;
//             console.log("need size", Number(this.needSize) / 1024 / 1024)
//             await $promise(this.getDownload.Task);
//             console.log("download ready");
//             if (this.getDownload.IsValid()) {
//                 //Addressables.Release(this.getDownload);
//             }
//         } else {
//             console.log("addressable is updated")
//         }
//        
//         this.slider.gameObject.SetActive(false);
//         this.startButton.gameObject.SetActive(true);
//
//     }
//
//     update() {
//         let sizeText = "";
//         if (this.getDownload?.IsValid() && !this.getDownload.IsDone) {
//             const current = this.getDownload.GetDownloadStatus().TotalBytes - this.getDownload.GetDownloadStatus().DownloadedBytes;
//             console.log("current", current);
//             this.slider.value = 1 - Number(current / this.needSize);
//             sizeText = " [ " + (Number(current) / 1024 / 1024).toFixed(1).toString() + "M ]";
//         }
//         this.text.text = this.slider.value > 0 && this.slider.value < 1 ? Math.floor(this.slider.value * 100).toString() + "%" : "";
//         this.text.text += sizeText;
//
//     }
// }
