# skepickleCharacterSuite

skepickleCharacterSuite implements a set of commands that operate on Diana P's D&D 3.5 character sheets.

### Syntax

```!scs <params>```

### Parameters:

* **config** [_variable_ [_value_]]  
    Without any arguments, this just prints out the current values of the configuration variables.  
    With just the variable name argument, this prints out the current value of that variable.  
    With both arguments specified, this sets the value of the variable to the value specified.
* **source-text**
  * list
  * enable <_sourceID_> **_UNDER CONSTRUCTION_**
  * disable <_sourceID_> **_UNDER CONSTRUCTION_**
* **audit**
  * audit-weapon-macros **_UNDER CONSTRUCTION_**
  * audit-spell-macros **_UNDER CONSTRUCTION_**
* **fill**
  * spell-macros  
    _Note: Operates on any number of selected tokens on the map._  
    This function fills in a character sheet's spell macros if the macro attribute is empty, or contains only '-','fill', or 'empty'.
* **moderate-pc-movement**
  * accept  
    _Note: Operates on any number of selected tokens on the map._  
    For each selected token controllable by a single player, this function accepts and implements the desired movement they indicated.
  * reject  
    _Note: Operates on any number of selected tokens on the map._  
    For each selected token controllable by a single player, this function rejects the desired movement they indicated.
* **mook**
  * audit-npc-sheet  
    _Note: Operates on any number of selected tokens on the map._  
    This function audits the NPC section contents of a [mook's](https://www.dandwiki.com/wiki/Help:Glossary_of_Jargon#Mook) character sheet.
  * infer-pc-sheet  
    _Note: Operates on any number of selected tokens on the map._  
    This function infers content for the PC section of a [mook's](https://www.dandwiki.com/wiki/Help:Glossary_of_Jargon#Mook) character sheet.
  * promote-to-skookum [<_NameOfCharacter_>] **_UNDER CONSTRUCTION_**  
    _Note: Operates on a single selected token on the map._  
    This function _will_ create a new [skookum](https://en.wikipedia.org/wiki/Skookum) character sheet based on the currently selected [mook](https://www.dandwiki.com/wiki/Help:Glossary_of_Jargon#Mook), which will be named based upon the specified name.
* **skookum** **_UNDER CONSTRUCTION_**
* **encounter**
  * calculate-level **_UNDER CONSTRUCTION_**  
    _Note: Operates on any number of selected tokens on the map._  
    This function calculates an encounter level (EL) based on all the creatures selected, using the challenge ratings (CR) from the NPC section of the character sheet and the levels from the PC section.
  * calculate-rewards <_encounterLevel_> **_UNDER CONSTRUCTION_**  
    _Note: Operates on any number of selected tokens on the map._  
    This function uses the EL level passed in, and calculates XP rewards for each creature selected, based on their levels. It also calculates an overall treasure value.
  * generate-treasure <_treasureValue_> **_UNDER CONSTRUCTION_**
* **toggle-reach-auras**  
    _Note: Operates on any number of selected tokens on the map._  
    This function toggles the display of auras that represent the natural reach range, and appropriately sized reach-weapon ranges for the selected characters. Here is an example macro that utilizes this command:  
    ```
    !scs toggle-reach-auras
    ```
* **group-initiative-check** [**Clear**]  
    _Note: Operates on any number of selected tokens on the map._  
    This function will roll initiative for all the selected characters. If a token does not represent a character, then it is skipped. Here is an example macro that utilizes this command:  
    ```
    !scs group-initiative-check ?{Clear Turn Order List First?|No,|Yes,clear}
    ```
* **group-skill-check** (**Individual**|**Aid Another**) <_skillName_>  
    _Note: Operates on any number of selected tokens on the map._  
    This function will roll a skill check for all the selected characters. If a token does not represent a character, then it is skipped. Here is an example macro that utilizes this command:  
    ```
    !scs group-skill-check ?{Check Type:|Aid Another|Individual} ?{Skill:|Ability:Strength|Ability:Dexterity|Ability:Constitution|Ability:Intelligence|Ability:Wisdom|Ability:Charisma|Appraise|Autohypnosis|Balance|Bluff|Climb|Craft(Weaponsmithing)|Craft(Alchemy)|Craft(Generic)|Craft(Dice)|Concentration|Control Shape|Decipher Script|Diplomacy|Disable Device|Disguise|Escape Artist|Forgery|Gather Information|Handle Animal|Heal|Hide|Intimidate|Jump|Knowledge(Arcana)|Knowledge(Engineering)|Knowledge(Dungeoneering)|Knowledge(Geography)|Knowledge(History)|Knowledge(Local)|Knowledge(Nature)|Knowledge(Nobility)|Knowledge(Religion)|Knowledge(The Planes)|Knowledge(Psionics)|Knowledge(Trivia)|Listen|Move Silently|Open Lock|Psicraft|Ride|Search|Sense Motive|Sleight of Hand|Spellcraft|Spot|Survival|Swim|Tumble|Use Magic Device|Use Psionic Device|Use Rope}
    ```
* **set-light-source** <_lightType_>  
    _Note: Operates on any number of selected tokens on the map._  
    This function does two things. Firstly it cleans up a character token's "Emits Light" section to be representative of the character's passive vision specifications, based on Darkvision, Low-light vision, etc. The second thing it does is create an attached graphic that followes the character around, which has an "Emits Light" section that represents the light output from the lightType specified. Here is an example macro that utilizes this command:  
    ```
    !scs set-light-source ?{Select Light Source|None|Bullseye Lantern|Candle|Common Lamp|Daylight (Spell)|Everburning Torch|Hooded Lantern|Sunrod|Torch}
    ```