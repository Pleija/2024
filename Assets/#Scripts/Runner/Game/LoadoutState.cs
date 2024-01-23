﻿using System.Collections;
using System.Collections.Generic;
using Runner.Characters;
using Runner.Consumable;
using Runner.Sounds;
using Runner.Themes;
using Runner.UI;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.Events;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using UnityEngine.UI.Extensions;
#if UNITY_ANALYTICS
using UnityEngine.Analytics;
#endif

namespace Runner.Game
{
    /// <summary>
    ///     State pushed on the GameManager during the Loadout, when player select player, theme and
    ///     accessories
    ///     Take care of init the UI, load all the data used for it etc.
    /// </summary>
    public class LoadoutState : AState
    {
        public static LoadoutState self => m_Instance ? m_Instance
            : m_Instance = FindObjectOfType<LoadoutState>(true);

        private static LoadoutState m_Instance;

        private void Awake()
        {
            m_Instance = this;
            Debug.Log("Init Pages");

            // foreach (Transform t in PageContainer.transform) {
            //     Destroy(t.gameObject);
            // }
            var pages = new List<GameObject>();
            PagePrefabs.ForEach(prefab => {
                prefab.SetActive(false);
                var go = Instantiate(prefab, PageContainer);
                go.name = prefab.name;
                pages.Add(go);
                go.SetActive(true);
                prefab.SetActive(true);
            });
            Mainmenu.StartingScreen = 2;
            Mainmenu.gameObject.SetActive(true);
            Mainmenu.GoToScreen(2);
        }

        public Transform PageContainer;
        public List<GameObject> PagePrefabs = new List<GameObject>();
        public HorizontalScrollSnap Mainmenu;
        public Canvas inventoryCanvas;

        [Header("Char UI")]
        public Text charNameDisplay;

        public RectTransform charSelect;
        public Transform charPosition => GameManager.instance.LoadingCharPos.transform;

        [Header("Theme UI")]
        public Text themeNameDisplay;

        public GameObject mainHp;
        public RectTransform themeSelect;
        public Image themeIcon;

        [Header("PowerUp UI")]
        public RectTransform powerupSelect;

        public Image powerupIcon;
        public Text powerupCount;
        public Sprite noItemIcon;

        [Header("Accessory UI")]
        public RectTransform accessoriesSelector;

        public Text accesoryNameDisplay;
        public Image accessoryIconDisplay;

        [Header("Other Data")]
        public Leaderboard leaderboard;

        public MissionUI missionPopup => MissionUI.self;
        public Button runButton;
        public GameObject tutorialBlocker;
        public GameObject tutorialPrompt;
        public MeshFilter skyMeshFilter;
        public MeshFilter UIGroundFilter;
        public AudioClip menuTheme;

        [Header("Prefabs")]
        public ConsumableIcon consumableIcon;

        private Consumable.Consumable.ConsumableType m_PowerupToUse =
            Consumable.Consumable.ConsumableType.NONE;

        public GameObject m_Character;
        public List<int> m_OwnedAccesories = new List<int>();
        public int m_UsedAccessory = -1;
        public int m_UsedPowerupIndex;
        public bool m_IsLoadingCharacter;
        public Modifier m_CurrentModifier = new Modifier();
        public const float k_CharacterRotationSpeed = 45f;
        public const string k_ShopSceneName = "Shop";
        public const float k_OwnedAccessoriesCharacterOffset = -0.1f;
        public int k_UILayer;
        public readonly Quaternion k_FlippedYAxisRotation = Quaternion.Euler(0f, 180f, 0f);

        public override void Enter(AState from)
        {
            tutorialBlocker.SetActive(!PlayerData.instance.tutorialDone);
            mainHp.SetActive(PlayerData.instance.tutorialDone);
            tutorialPrompt.SetActive(false);
            inventoryCanvas.gameObject.SetActive(true);
            if (missionPopup) missionPopup.gameObject.SetActive(false);
            charNameDisplay.text = "";
            themeNameDisplay.text = "";
            k_UILayer = LayerMask.NameToLayer("UI");
            skyMeshFilter.gameObject.SetActive(true);
            UIGroundFilter.gameObject.SetActive(true);

            // Reseting the global blinking value. Can happen if the game unexpectedly exited while still blinking
            Shader.SetGlobalFloat("_BlinkingValue", 0.0f);

            if (MusicPlayer.instance.GetStem(0) != menuTheme) {
                MusicPlayer.instance.SetStem(0, menuTheme);
                StartCoroutine(MusicPlayer.instance.RestartAllStems());
            }
            runButton.interactable = false;
            //runButton.GetComponentInChildren<Text>().text = "Loading...";
            if (m_PowerupToUse != Consumable.Consumable.ConsumableType.NONE)
                //if we come back from a run and we don't have any more of the powerup we wanted to use, we reset the powerup to use to NONE
                if (!PlayerData.instance.consumables.ContainsKey(m_PowerupToUse) ||
                    PlayerData.instance.consumables[m_PowerupToUse] == 0)
                    m_PowerupToUse = Consumable.Consumable.ConsumableType.NONE;
            Refresh();
        }

        public override void Exit(AState to)
        {
            if (missionPopup) missionPopup.gameObject.SetActive(false);
            inventoryCanvas.gameObject.SetActive(false);
            if (m_Character != null) /*Addressables.ReleaseInstance*/ Destroy(m_Character);
            var gs = to as GameState;
            skyMeshFilter.gameObject.SetActive(false);
            UIGroundFilter.gameObject.SetActive(false);

            if (gs != null) {
                gs.currentModifier = m_CurrentModifier;

                // We reset the modifier to a default one, for next run (if a new modifier is applied, it will replace this default one before the run starts)
                m_CurrentModifier = new Modifier();

                if (m_PowerupToUse != Consumable.Consumable.ConsumableType.NONE) {
                    PlayerData.instance.Consume(m_PowerupToUse);
                    var inv = Instantiate(ConsumableDatabase.GetConsumbale(m_PowerupToUse),
                        (GameObject.Find("/InGame") ?? new GameObject("InGame")).transform);
                    inv.gameObject.SetActive(false);
                    gs.trackManager.characterController.inventory = inv;
                }
            }
        }

        public void Refresh()
        {
            PopulatePowerup();
            StartCoroutine(PopulateCharacters());
            StartCoroutine(PopulateTheme());
        }

        public override string GetName() => "Loadout";

        public override void Tick()
        {
            if (!runButton.interactable) {
                var interactable = ThemeDatabase.loaded && CharacterDatabase.loaded;

                if (interactable) {
                    runButton.interactable = true;
                    //runButton.GetComponentInChildren<Text>().text = "Run!";

                    //we can always enabled, as the parent will be disabled if tutorial is already done
                    tutorialPrompt.SetActive(true);
                }
            }
            if (m_Character != null)
                m_Character.transform.Rotate(0, k_CharacterRotationSpeed * Time.deltaTime, 0,
                    Space.Self);
            charSelect.gameObject.SetActive(PlayerData.instance.characters.Count > 1);
            themeSelect.gameObject.SetActive(PlayerData.instance.themes.Count > 1);
        }

        public void GoToStore()
        {
            Res.LoadScene(k_ShopSceneName, LoadSceneMode.Additive);
            // UnityEngine.SceneManagement.SceneManager.LoadScene(k_ShopSceneName, UnityEngine.SceneManagement.LoadSceneMode.Additive);
        }

        public void ChangeCharacter(int dir)
        {
            PlayerData.instance.usedCharacter += dir;
            if (PlayerData.instance.usedCharacter >= PlayerData.instance.characters.Count)
                PlayerData.instance.usedCharacter = 0;
            else if (PlayerData.instance.usedCharacter < 0)
                PlayerData.instance.usedCharacter = PlayerData.instance.characters.Count - 1;
            StartCoroutine(PopulateCharacters());
        }

        public void ChangeAccessory(int dir)
        {
            m_UsedAccessory += dir;
            if (m_UsedAccessory >= m_OwnedAccesories.Count)
                m_UsedAccessory = -1;
            else if (m_UsedAccessory < -1) m_UsedAccessory = m_OwnedAccesories.Count - 1;
            if (m_UsedAccessory != -1)
                PlayerData.instance.usedAccessory = m_OwnedAccesories[m_UsedAccessory];
            else
                PlayerData.instance.usedAccessory = -1;
            SetupAccessory();
        }

        public void ChangeTheme(int dir)
        {
            PlayerData.instance.usedTheme += dir;
            if (PlayerData.instance.usedTheme >= PlayerData.instance.themes.Count)
                PlayerData.instance.usedTheme = 0;
            else if (PlayerData.instance.usedTheme < 0)
                PlayerData.instance.usedTheme = PlayerData.instance.themes.Count - 1;
            StartCoroutine(PopulateTheme());
        }

        public IEnumerator PopulateTheme()
        {
            ThemeData t = null;

            while (t == null) {
                t = ThemeDatabase.GetThemeData(
                    PlayerData.instance.themes[PlayerData.instance.usedTheme]);
                yield return null;
            }
            themeNameDisplay.text = t.themeName;
            themeIcon.sprite = t.themeIcon;
            skyMeshFilter.sharedMesh = t.skyMesh;
            UIGroundFilter.sharedMesh = t.UIGroundMesh;
        }

        public UnityEvent<GameObject> OnCharacterCreate;

        public IEnumerator PopulateCharacters()
        {
            accessoriesSelector.gameObject.SetActive(false);
            PlayerData.instance.usedAccessory = -1;
            m_UsedAccessory = -1;

            if (!m_IsLoadingCharacter) {
                m_IsLoadingCharacter = true;
                GameObject newChar = null;

                while (newChar == null) {
                    var c = CharacterDatabase.GetCharacter(
                        PlayerData.instance.characters[PlayerData.instance.usedCharacter]);

                    if (c != null) {
                        m_OwnedAccesories.Clear();

                        for (var i = 0; i < c.accessories.Length; ++i) {
                            // Check which accessories we own.
                            var compoundName =
                                c.characterName + ":" + c.accessories[i].accessoryName;
                            if (PlayerData.instance.characterAccessories.Contains(compoundName))
                                m_OwnedAccesories.Add(i);
                        }
                        var pos = charPosition.transform.position;
                        if (m_OwnedAccesories.Count > 0)
                            pos.x = k_OwnedAccessoriesCharacterOffset;
                        else
                            pos.x = 0.0f;
                        charPosition.transform.position = pos;
                        accessoriesSelector.gameObject.SetActive(m_OwnedAccesories.Count > 0);
                        var op = Addressables.LoadAssetAsync<GameObject>(c.characterName);
                        yield return op;

                        if (!(op.Result is { })) {
                            Debug.LogWarning(string.Format("Unable to load character {0}.",
                                c.characterName));
                            yield break;
                        }
                        newChar = Instantiate(op.Result)
                            .OnDestroyRelease(op);                 //op.Result as GameObject;
                        Helpers.SetRendererLayerRecursive(newChar, /*k_UILayer*/
                            LayerMask.NameToLayer("Character"));
                        newChar.transform.SetParent(charPosition, false);
                        newChar.transform.rotation = k_FlippedYAxisRotation;
                        if (m_Character != null) Destroy(m_Character);
                        /*Addressables.ReleaseInstance*/
                        Destroy(m_Character);
                        m_Character = newChar;
                        OnCharacterCreate.Invoke(newChar);
                        charNameDisplay.text = c.characterName;
                        m_Character.transform.localPosition = Vector3.right * 1000;
                        //animator will take a frame to initialize, during which the character will be in a T-pose.
                        //So we move the character off screen, wait that initialised frame, then move the character back in place.
                        //That avoid an ugly "T-pose" flash time
                        yield return new WaitForEndOfFrame();
                        m_Character.transform.localPosition = Vector3.zero;
                        SetupAccessory();
                    }
                    else {
                        yield return new WaitForSeconds(1.0f);
                    }
                }
                m_IsLoadingCharacter = false;
            }
        }

        private void SetupAccessory()
        {
            var c = m_Character.GetComponent<Character>();
            c.SetupAccesory(PlayerData.instance.usedAccessory);

            if (PlayerData.instance.usedAccessory == -1) {
                accesoryNameDisplay.text = "None";
                accessoryIconDisplay.enabled = false;
            }
            else {
                accessoryIconDisplay.enabled = true;
                accesoryNameDisplay.text =
                    c.accessories[PlayerData.instance.usedAccessory].accessoryName;
                accessoryIconDisplay.sprite =
                    c.accessories[PlayerData.instance.usedAccessory].accessoryIcon;
            }
        }

        private void PopulatePowerup()
        {
            powerupIcon.gameObject.SetActive(true);

            if (PlayerData.instance.consumables.Count > 0) {
                var c = ConsumableDatabase.GetConsumbale(m_PowerupToUse);
                powerupSelect.gameObject.SetActive(true);

                if (c != null) {
                    powerupIcon.sprite = c.icon;
                    powerupCount.text = PlayerData.instance.consumables[m_PowerupToUse].ToString();
                }
                else {
                    powerupIcon.sprite = noItemIcon;
                    powerupCount.text = "";
                }
            }
            else {
                powerupSelect.gameObject.SetActive(false);
            }
        }

        public void ChangeConsumable(int dir)
        {
            var found = false;

            do {
                m_UsedPowerupIndex += dir;
                if (m_UsedPowerupIndex >= (int)Consumable.Consumable.ConsumableType.MAX_COUNT)
                    m_UsedPowerupIndex = 0;
                else if (m_UsedPowerupIndex < 0)
                    m_UsedPowerupIndex = (int)Consumable.Consumable.ConsumableType.MAX_COUNT - 1;
                var count = 0;
                if (PlayerData.instance.consumables.TryGetValue(
                        (Consumable.Consumable.ConsumableType)m_UsedPowerupIndex, out count) &&
                    count > 0)
                    found = true;
            } while (m_UsedPowerupIndex != 0 && !found);
            m_PowerupToUse = (Consumable.Consumable.ConsumableType)m_UsedPowerupIndex;
            PopulatePowerup();
        }

        public void UnequipPowerup()
        {
            m_PowerupToUse = Consumable.Consumable.ConsumableType.NONE;
        }

        public void SetModifier(Modifier modifier)
        {
            m_CurrentModifier = modifier;
        }

        public void StartGame()
        {
            if (PlayerData.instance.tutorialDone)
                if (PlayerData.instance.ftueLevel == 1) {
                    PlayerData.instance.ftueLevel = 2;
                    PlayerData.instance.Save();
                }
            manager.SwitchState("Game");
        }

        public void Openleaderboard()
        {
            leaderboard.displayPlayer = false;
            leaderboard.forcePlayerDisplay = false;
            leaderboard.Open();
        }
    }
}
