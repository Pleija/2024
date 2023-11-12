﻿using UnityEngine;

namespace Runner
{
    [ExecuteInEditMode]
    public class WorldCurver : MonoBehaviour
    {
        [Range(-0.1f, 0.1f)]
        public float curveStrength = 0.01f;

        private int m_CurveStrengthID;

        private void OnEnable()
        {
            m_CurveStrengthID = Shader.PropertyToID("_CurveStrength");
        }

        private void Update()
        {
            Shader.SetGlobalFloat(m_CurveStrengthID, curveStrength);
        }
    }
}
