import { StateNode } from "Common/StateNode.mjs";
import { Login } from "Start/Login.mjs";
import SceneManager = CS.UnityEngine.SceneManagement.SceneManager;
import Slider = CS.UnityEngine.UI.Slider;
import $promise = puer.$promise;
import Addressables = CS.UnityEngine.AddressableAssets.Addressables;
import AsyncOperationHandle$1 = CS.UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle$1;
import SceneInstance = CS.UnityEngine.ResourceManagement.ResourceProviders.SceneInstance;

export class LoadStart extends StateNode<Login> {

    private task: AsyncOperationHandle$1<SceneInstance>;
    private preValue: number;
    slider: Slider;
    caption: CS.UnityEngine.UI.Text;

    async enter() {
        console.log("enter loadStart");
        this.task = Addressables.LoadSceneAsync("Main");
        //SceneManager.LoadSceneAsync("Main");
        const scene = await $promise(this.task.Task);
        console.log("Start Ready");
    }

    update() {
        const value = this.task.PercentComplete;
        if (value != this.preValue) {
            this.preValue = value;
            console.log(value);
            this.slider.value = value;
            this.caption.text = `LOADING... ${Math.floor(value * 100)}%`;
        }
    }
}