using System;
using System.Linq;
using App.Models;
using Common;
using TMPro;
using UniRx;
using UnityEngine.UI;
using UnityEngine.UI.Extensions;

namespace App
{
    public class LevelAgent : Agent<LevelAgent>
    {
        public TMP_Text text;
        public Slider slider;
        public RadialSlider radialSlider;
        public TMP_Text levelText;

        private void Start()
        {
            User.self.exp ??= new IntReactiveProperty();
            User.self.level ??= new IntReactiveProperty();
            User.self.exp.Subscribe(x => SetValue(x));
            //SetValue();
        }

        public void SetValue(int? value = null)
        {
            var data = value ?? User.self.exp.Value;
            if (value == null) User.self.exp.Value = data;
            var level = User.self.Levels.LastOrDefault(x => x.exp <= User.self.exp.Value) ?? User.self.Levels.Last();
            var index = User.self.Levels.IndexOf(level);

            if (index != User.self.level.Value - 1) {
                User.self.level.Value = index + 1;
                if (levelText) levelText.text = $"{index + 1}";
            }

            if (level == User.self.Levels.Last()) {
                if (text) text.text = $"{data}";
                if (radialSlider) radialSlider.Value = 0;
                if (slider) slider.value = 1;
            }
            else {
                var nextLevel = User.self.Levels[index + 1];
                if (text) text.text = $"{data}/{nextLevel.exp}";
                if (radialSlider) radialSlider.Value = (float)data / nextLevel.exp;
                // if(radialSlider.TryGetComponent<RadialValue>(out var radialValue) && radialValue.enabled) {
                //     radialValue.value = (float)data / nextLevel.exp;
                // }
                if (slider) slider.value = (float)data / nextLevel.exp;
            }
            if (value != null) User.self.Save();
        }
    }
}
