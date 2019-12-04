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
* **calculate-encounter-level** **_UNDER CONSTRUCTION_**
* **calculate-encounter-rewards** **_UNDER CONSTRUCTION_**
* **calculate-encounter-treasure** **_UNDER CONSTRUCTION_**
* **toggle-reach-auras**  
    _Note: Operates on any number of selected tokens on the map._  
    This function toggles the display of auras that represent the natural reach range, and appropriately sized reach-weapon ranges for the selected characters.
* **group-initiative-check** [**Clear**]  
    _Note: Operates on any number of selected tokens on the map._  
    This function will roll initiative for all the selected characters. If a token does not represent a character, then it is skipped.
* **group-skill-check** (**Individual**|**Aid Another**) <_skillName_>  
    _Note: Operates on any number of selected tokens on the map._  
    This function will roll a skill check for all the selected characters. If a token does not represent a character, then it is skipped.
* **set-light-source** <_lightType_>  
    _Note: Operates on any number of selected tokens on the map._