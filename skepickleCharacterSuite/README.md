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
  * infer-pc-sheet
  * promote-to-skookum [<_NameOfCharacter_>]
* **--group-initiative-check** [**Clear**]
* **--group-skill-check** (**Individual**|**Aid Another**) <_skillName_>
* **--toggle-reach-auras**
* **--set-light-source** <_lightType_>