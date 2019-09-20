# skepickleCharacterSuite

skepickleCharacterSuite implements a set of commands that operate on Diana P's D&D 3.5 character sheets.

### Syntax

```!scs <params>```

### Parameters:

* **--source-text** 
  * list
  * enable <_sourceID_>
  * disable <_sourceID_>
* **--mook**
  * audit-npc-sheet  
    _Note: Operates on any number of selected tokens on the map._  
    This function audits the NPC section contents of a [mook's](https://www.dandwiki.com/wiki/Help:Glossary_of_Jargon#Mook) character sheet.
  * infer-pc-sheet  
    _Note: Operates on any number of selected tokens on the map._  
    This function infers content for the PC section of a [mook's](https://www.dandwiki.com/wiki/Help:Glossary_of_Jargon#Mook) character sheet.
  * promote-to-skookum [<_NameOfCharacter_>] **_UNDER CONSTRUCTION_**  
    _Note: Operates on a single selected token on the map._  
    This function _will_ create a new [skookum](https://en.wikipedia.org/wiki/Skookum) character sheet based on the currently selected mook, which will be named based upon the specified name.
* **--group-initiative-check** [**Clear**]  
    _Note: Operates on any number of selected tokens on the map._  
    This function will roll initiative for all the selected characters. If a token does not represent a character, then it is skipped.
* **--group-skill-check** (**Individual**|**Aid Another**) <_skillName_>  
    _Note: Operates on any number of selected tokens on the map._  
    This function will roll a skill check for all the selected characters. If a token does not represent a character, then it is skipped.
* **--toggle-reach-auras**  
    _Note: Operates on any number of selected tokens on the map._  
    This function toggles the display of auras that represent the natural reach range, and appropriately sized reach-weapon ranges for the selected characters.
* **--set-light-source** <_lightType_>  
    _Note: Operates on any number of selected tokens on the map._