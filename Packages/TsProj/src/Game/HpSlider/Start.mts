import { HpSlider } from "Game/HpSlider.mjs";
import { StateNode } from "Common/StateNode.mjs";
import $typeof = puer.$typeof;
import RadialSlider = CS.UnityEngine.UI.Extensions.RadialSlider;
import TMP_Text = CS.TMPro.TMP_Text;

export class Start extends StateNode<HpSlider> {

    init() {
        
    }  
    
    enter(){
       const rs = this.agent.GetComponentInChildren($typeof(RadialSlider))  as RadialSlider;
       rs.Value= 1;
       const text = this.agent.GetComponentInChildren($typeof(TMP_Text))  as TMP_Text;
       text.text = `${100}`;
    }
}
