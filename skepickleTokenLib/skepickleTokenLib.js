var skepickleTokenLib = skepickleTokenLib || (function skepickleTokenLibImp() {
  "use strict";

  var info = {
    version: 0.1,
    authorName: "skepickle"
  };

  var config = {
    debugDEFCON: 5,
    pixels_per_foot: 14
  };

  var temp = {
    //campaignLoaded: false,
    GMPlayer: Campaign
  };

  // String Utility Functions

  var nonvalue_characters = [""," ","-","֊","־","᠆","‐","‑","‒","–","—","―","⁻","₋","−","⸺","⸻","﹘","﹣","－"];

  var toTitleCase = function(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    };
    return str.join(' ');
  }; // toTitleCase

  var trimWhitespace = function(str) {
    return str.replace(/ +/g, " ").replace(/^ /, "").replace(/ $/, "").replace(/ *, */g, ",");
  }; // trimWhitespace

  var escapeRoll20Macro = function(str) {
    return str.replace(/\&/g,  "&amp;")
              .replace(/\#/g,  "&#35;")
              .replace(/\@{/g, "&#64;{")
              .replace(/\%{/g, "&#37;{")
              .replace(/\?{/g, "&#63;{")
              .replace(/\[\[/g,"&#91;&#91;")
              .replace(/\{\{/g,"&#123;&#123;")
              .replace(/\]\]/g,"&#93;&#93;")
              .replace(/\}\}/g,"&#125;&#125;");
  }; // escapeRoll20Macro

  // D&D 3.5e Tables

  var dnd35 = {
    all_source_texts: {
      SRD: "System Reference Document",
      BoED: "Book of Exalted Deeds",
      unknown: "Unknown Text"
    },
    enabled_source_texts: ["SRD","BoED"],
    source_text_SRD: {
      movement_modes: ["burrow","climb","fly","swim"],
      fly_maneuverability: ["perfect","good","average","poor","clumsy"],
      size_categories: ["fine","diminutive","tiny","small","medium","large","huge","gargantuan","colossal"],
      types: ["aberration","animal","celestial","construct","dragon","elemental","fey","fiend","giant","humanoid","magical beast","monstrous humanoid","ooze","outsider","plant","undead","vermin"],
      creature_subtypes: ["air","angel","aquatic","archon","augmented","chaotic","cold","demon","devil","earth","evil","extraplanar","fire","good","incorporeal","lawful","native","psionic","shapeshifter","swarm","water"],
      humanoid_subtypes: ["aquatic","dwarf","elf","gnoll","gnome","goblinoid","halfling","human","orc","reptilian"]
    },
    source_text_BoED: {
      types: ["deathless"]
    },
    source_text_unknown: {
      movement_modes: ["glide"]
    },
    movement_modes: function() {
      var result = [];
      this.enabled_source_texts.forEach(function(source) {
        if (dnd35['source_text_'.concat(source)].movement_modes !== undefined) {
          result = [...new Set([...result ,...dnd35['source_text_'.concat(source)].movement_modes])];
        };
      });
      return result;
    },
    fly_maneuverability: function() {
      var result = [];
      this.enabled_source_texts.forEach(function(source) {
        if (dnd35['source_text_'.concat(source)].fly_maneuverability !== undefined) {
          result = [...new Set([...result ,...dnd35['source_text_'.concat(source)].fly_maneuverability])];
        };
      });
      return result;
    },
    size_categories: function() {
      var result = [];
      this.enabled_source_texts.forEach(function(source) {
        if (dnd35['source_text_'.concat(source)].size_categories !== undefined) {
          result = [...new Set([...result ,...dnd35['source_text_'.concat(source)].size_categories])];
        };
      });
      return result;
    },
    types: function() {
      var result = [];
      this.enabled_source_texts.forEach(function(source) {
        if (dnd35['source_text_'.concat(source)].types !== undefined) {
          result = [...new Set([...result ,...dnd35['source_text_'.concat(source)].types])];
        };
      });
      return result;
    },
    creature_subtypes: function() {
      var result = [];
      this.enabled_source_texts.forEach(function(source) {
        if (dnd35['source_text_'.concat(source)].creature_subtypes !== undefined) {
          result = [...new Set([...result ,...dnd35['source_text_'.concat(source)].creature_subtypes])];
        };
      });
      return result;
    },
    humanoid_subtypes: function() {
      var result = [];
      this.enabled_source_texts.forEach(function(source) {
        if (dnd35['source_text_'.concat(source)].humanoid_subtypes !== undefined) {
          result = [...new Set([...result ,...dnd35['source_text_'.concat(source)].humanoid_subtypes])];
        };
      });
      return result;
    },
    subtypes: function() {
      return [...new Set([...dnd35.creature_subtypes() ,...dnd35.humanoid_subtypes()])];
    }
  };

  // D&D 3.5e Utility Functions

  var abilityScoreToMod = function(score) {
    if (isNaN(score)) {
      //TODO check to see if it's empty / - / etc and not just NaN.
      return 0;
    };
    return Math.floor((score-10.0)/2.0);
  }; // abilityScoreToMod

  var abilityScoreToBonusSpells = function(score, spelllevel) {
    if (isNaN(score)) { return 0; };
    if (spelllevel==0) { return 0; };
    mod = abilityScoreToMod(score);
    return Math.max(0,Math.ceil((1.0+mod-spelllevel/4.0)));
  }; // abilityScoreToBonusSpells

  var abilityScoreToBonusPowers = function(score, classlevel) {
    if (isNaN(score)) { return 0; };
    mod = abilityScoreToMod(score);
    return Math.floor((mod*classlevel)/2.0);
  }; // abilityScoreToBonusPowers

  var sizeToMod = function(size) {
    if (!dnd35.size_categories().includes(size)) { log("error"); throw "{{error}}"; };
    switch(size) {
      case "fine":       return 4;
      case "diminutive": return 3;
      case "tiny":       return 2;
      case "small":      return 1;
      case "medium":     return 0;
      case "large":      return -1;
      case "huge":       return -2;
      case "gargantuan": return -3;
      case "colossal":   return -4;
    };
  }; // sizeToMod

  var sizeToArmorClassMod = function(size) {
    if (!dnd35.size_categories().includes(size)) { log("error"); throw "{{error}}"; };
    switch(size) {
      case "fine":       return 8;
      case "diminutive": return 4;
      case "tiny":       return 2;
      case "small":      return 1;
      case "medium":     return 0;
      case "large":      return -1;
      case "huge":       return -2;
      case "gargantuan": return -4;
      case "colossal":   return -8;
    };
  }; // sizeToArmorClassMod

  // Roll20 Attribute Utility Functions

  // Implemented internally in Roll20
  //var getAttrByName = function(id, attrib, value_type) { return <a string>; }

  var setAttrByName = function(id, attrib, value, max=null) {
    //log("setAttrByName("+id+","+attrib+","+value+","+max+")");
    if (value==null) { log("ERROR: setAttrByName called with undefined value = '"+value+"'"); return; };
    var obj = findObjs({
        _type: "attribute",
        _characterid: id,
        name: attrib
    });
    if (obj.length == 0) {
      obj = createObj("attribute", {
        name: attrib,
        current: 1,
        characterid: id
      });
    } else {
      obj = obj[0];
    };
    obj.setWithWorker("current", value);
    if (max) { obj.setWithWorker("max", max); };
  }; // setAttrByName

  var isAttrByNameNaN = function(id, attrib, value_type) {
    value_type = value_type || 'current';
    var val = getAttrByName(id, attrib, value_type);
    if (val === undefined) {
      //TODO throw ERROR: Attribute does not exist
      throw "isAttrByNameNaN() called with undefined attribute"
      return true;
    };
    return isNaN(val);
  }; // isAttrByNameNaN

  // Roll20 Character Sheet Utility Functions

  var characterIsMook = function(id) {
    //TODO implement!
    return true;
  };

  var throwDefaultTemplate = function(scope, id, str) {
    var character = getObj("character", id);
    throw ''.concat("&{template:default} {{name="+scope+"}} {{Token= [image](",character.get("avatar").replace(new RegExp("\\?.*$"), ""),")}} {{Name= ",getAttrByName(id, "npcname"),"}} {{",escapeRoll20Macro(str),"}}");
  }; // throwDefaultTemplate

  var auditMookNPCSheet = function(id) {
    // Check all purely numeric fields
    ["npcinit","npcarmorclass","npctoucharmorclass","npcflatfootarmorclass","npcbaseatt","npcfortsave","npcrefsave","npcwillsave","npcstr-mod","npcdex-mod","npccon-mod","npcint-mod","npcwis-mod","npccha-mod"].forEach(function(a) {
      if (isAttrByNameNaN(id, a)) {
        throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid "+a+"= '"+getAttrByName(id, a)+"'");
      };
    });

    // Check ability & modifiers, which can be a nonabilities
    ["npcstr","npcdex","npccon","npcint","npcwis","npccha"].forEach(function(a) {
      if (isAttrByNameNaN(id, a)) {
        if (!nonvalue_characters.includes(getAttrByName(id, a))) {
          throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid "+a+"= '"+getAttrByName(id, a)+"'");
        } else {
          if (getAttrByName(id, ''.concat(a,'-mod')) != 0) {
            throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid mod value '"+getAttrByName(id, ''.concat(a,'-mod'))+"' for '"+a+"' ability score '"+getAttrByName(id, a)+"'");
          };
        };
      } else {
        if (getAttrByName(id, ''.concat(a,'-mod')) != abilityScoreToMod(getAttrByName(id, a))) {
          throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid mod value '"+getAttrByName(id, ''.concat(a,'-mod'))+"' for '"+a+"' nonability score");
        };
      };
    });

    // Check grapple bonus, which can be a nonability
    ["npcgrapple"].forEach(function(a) {
      if (isAttrByNameNaN(id, a)) {
        if (!nonvalue_characters.includes(getAttrByName(id, a))) {
          throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid "+a+"= '"+getAttrByName(id, a)+"'");
        };
      };
    });

    // npcname
    if (getAttrByName(id, "npcname") == "") {
      throwDefaultTemplate("auditMookNPCSheet()",id,"Undefined name");
    };

    // npcsize
    if (!dnd35.size_categories().includes(getAttrByName(id, "npcsize").toLowerCase())) {
      throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid size= '"+getAttrByName(id, "npcsize")+"'");
    };

    // npctype
    {
      var npctype = getAttrByName(id, "npctype");
      let result = npctype.match(/^([a-z ]+)(\([a-z ,]+\)){0,1}$/i)
      if (result[1] === undefined) {
        throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid type= '"+npctype+"'");
      };
      var type = trimWhitespace(result[1]);
      if (!dnd35.types().includes(type.toLowerCase())) {
        throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid type= '"+type+"'");
      };
      if (result[2] !== undefined) {
        trimWhitespace(result[2]).replace(/^\(/, "").replace(/\)$/, "").split(",").forEach(function(subtype) {
          if (!dnd35.subtypes().includes(subtype.toLowerCase())) {
            throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid subtype= '"+subtype+"'");
          };
        });
      };
    };

    // npchitdie
    {
      var npchitdie = getAttrByName(id, "npchitdie");
      if (!trimWhitespace(npchitdie).replace(/ plus /gi, "+").replace(/ +/g, "").match(/^([+-]{0,1}([0-9]+[-+*/])*[0-9]*d[0-9]+([+-][0-9]+)*)+$/i)) {
        throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid hitdie= '"+npchitdie+"'");
      };
    };

    // npcinitmacro
    {
      var npcinitmacro = getAttrByName(id, "npcinitmacro");
      if (npcinitmacro !== '&{template:DnD35Initiative} {{name=@{selected|token_name}}} {{check=checks for initiative:\n}} {{checkroll=[[(1d20cs>21cf<0 + (@{npcinit})) + ((1d20cs>21cf<0 + (@{npcinit}))/100) + ((1d20cs>21cf<0 + (@{npcinit}))/10000) &{tracker}]]}}') {
        throwDefaultTemplate("auditMookNPCSheet()",id,''.concat("Invalid npcinitmacro= '",npcinitmacro,"'"));
      };
    };

    // npcspeed
    {
      var npcspeed = getAttrByName(id, "npcspeed");
      var npcspeeds = trimWhitespace(npcspeed.toLowerCase()
                                       .replace(/([0-9]+) *(feet|foot|ft\.*|')/g, "$1"))
                        .split(",");
      var mode_type_map = {};
      npcspeeds.forEach(function(e) {
        let result = e.match(/^(([a-z]+) *){0,1}([0-9]+)( *\(([a-z]+)\)){0,1}$/);
        if (result == null) {
          throwDefaultTemplate("auditMookNPCSheet()",id,"Unknown problem with npcspeed= '"+npcspeed+"'");
        };
        var mode = "";
        if (result[2] == null) {
          mode = "land";
        } else {
          mode = result[2];
          if (!dnd35.movement_modes().includes(mode)) {
            throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid mode '"+mode+"' in npcspeed= '"+npcspeed+"'");
          };
        };
        if (mode_type_map[mode] !== undefined) {
          throwDefaultTemplate("auditMookNPCSheet()",id,"Multiple definitions for same mode in npcspeed= '"+npcspeed+"'");
        } else {
          mode_type_map[mode] = result[3];
        };
        if (mode=="fly") {
          if (result[5] == null) {
            throwDefaultTemplate("auditMookNPCSheet()",id,"Fly maneuverability not defined for npcspeed= '"+npcspeed+"'");
          } else {
            if (!dnd35.fly_maneuverability().includes(result[5])) {
              throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid fly maneuverability for npcspeed= '"+npcspeed+"'");
            };
          };
        };
      });
    };

    //npcarmorclassinfo
    {
      var npcarmorclassinfo = getAttrByName(id, "npcarmorclassinfo");
      var npcarmorclassinfos = trimWhitespace(npcarmorclassinfo.toLowerCase())
                                 .split(",");
      var bonus_type_map = {};
      npcarmorclassinfos.forEach(function(e) {
        let result = e.match(/^([-+]{0,1}[0-9]+) +(.*)+$/);
        if (result == null) {
          throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid npcarmorclassinfo= '"+npcarmorclassinfo+"'");
        };
        if (isNaN(result[1])) { //TODO This is impossible...?
          throwDefaultTemplate("auditMookNPCSheet()",id, "Invalid npcarmorclassinfo modifier value= '"+result[1]+"'");
        };
        if (['str','dex','con','int','wis','cha'].includes(result[2])) {
          var ability_mod = getAttrByName(id, ''.concat('npc',result[2],'-mod'));
          if (result[1] != ability_mod) {
            throwDefaultTemplate("auditMookNPCSheet()",id, "Invalid npcarmorclassinfo "+result[2]+" modifier value= '"+result[1]+"'");
          };
        };
        if (result[2] == "size") {
          var size_mod = sizeToArmorClassMod(getAttrByName(id, "npcsize").toLowerCase());
          if (result[1] != size_mod) {
            throwDefaultTemplate("auditMookNPCSheet()",id, "Invalid npcarmorclassinfo size modifier value= '"+result[1]+"'");
          };
        };
      });
    };

    // npcspace
    {
      var npcspace = trimWhitespace(getAttrByName(id, "npcspace").toLowerCase()
                                       .replace(/^([0-9]+) *(feet|foot|ft\.*|')$/g, "$1"));
      if (isNaN(npcspace)) {
        throwDefaultTemplate("auditMookNPCSheet()",id, "Invalid npcspace value= '"+getAttrByName(id, "npcspace")+"'");
      };
    };

    // npcreach
    {
      var npcreach = trimWhitespace(getAttrByName(id, "npcreach").toLowerCase()
                                       .replace(/^([0-9]+) *(feet|foot|ft\.*|')$/g, "$1"));
      if (isNaN(npcreach)) {
        throwDefaultTemplate("auditMookNPCSheet()",id, "Invalid npcreach value= '"+getAttrByName(id, "npcreach")+"'");
      };
    };

    //SKIP npcattack
    //SKIP npcattackmacro
    //SKIP npcfullattack
    //SKIP npcfullattackmacro
    //SKIP npcspecialattacks
    //SKIP npcspecialqualities
    //SKIP npcskills
    //SKIP npcfeats
    //SKIP npcenv
    //SKIP npcorg
    //SKIP npccr
    //SKIP npctreasure
    //SKIP npcalignment
    //SKIP npcadv
    //SKIP npclvladj
    //SKIP npcdescr
    //SKIP npccombatdescr
  }; // auditMookNPCSheet

  var fixMookPCSheet = function(id) {
    setAttrByName(id, "npc-show", 2);
    ["str", "dex", "con", "int", "wis", "cha"].forEach(function(ability) {
      var score    = parseFloat(getAttrByName(id, "npc"+ability));
      var modifier = Math.floor(score/2-5);
      // Fix NPC page Ability Modifiers
      setAttrByName(id, "npc"+ability+"-mod", modifier);
      // Fix PC page Ability Scores
      setAttrByName(id, ability+"-base", score);
    });
    {
      // Fix PC page character name
      setAttrByName(id, "character_name", getAttrByName(id, "npcname"));
    };
    {
      // Fix PC page size
      var npcsize = getAttrByName(id, "npcsize");
      var npcsize_num = null;
      switch(npcsize) {
        case "Fine":
            npcsize_num = 4;
            break;
        case "Diminutive":
            npcsize_num = 3;
            break;
        case "Tiny":
            npcsize_num = 2;
            break;
        case "Small":
            npcsize_num = 1;
            break;
        case "Medium":
            npcsize_num = 0;
            break;
        case "Large":
            npcsize_num = -1;
            break;
        case "Huge":
            npcsize_num = -2;
            break;
        case "Gargantuan":
            npcsize_num = -3;
            break;
        case "Colossal":
            npcsize_num = -4;
            break;
      };
      if (npcsize_num !== null) {
        setAttrByName(id, "size", npcsize_num);
      };
    };
    {
      // Fix PC page Initiative
      var npcinit     = parseFloat(getAttrByName(id, "npcinit"));
      var npcdex_mod  = parseFloat(getAttrByName(id, "npcdex-mod"));
      setAttrByName(id, "initmiscmod", Math.floor(parseFloat(npcinit-npcdex_mod)));
    };
    {
      // Fix PC page speeds
      var npcspeeds = getAttrByName(id, "npcspeed").toUpperCase()
         .replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, " ")             // cleanup whitespace
         .replace(/ *, */g, ",")
         .replace(/([0-9])FT/g, "$1")
         .replace(/ FT /g, " ").replace(/ FT,/g, ",").replace(/ FT$/, "")       // remove units
         .split(",");
      npcspeeds.forEach(function(e) {
        if (!isNaN(e)) {
          // Main speed value
          setAttrByName(id, "speed", e);
          return;
        };
        var tokens = e.split(" ");
        switch(tokens[0]) {
          case 'FLY':
            setAttrByName(id, "fly-speed", tokens[1]);
            var maneuver = tokens[2].toLowerCase().replace(/[^a-z]/g, "").replace(/^\w/, c => c.toUpperCase());
            if (maneuver == "Perfect" ||
                maneuver == "Good"    ||
                maneuver == "Average" ||
                maneuver == "Poor"    ||
                maneuver == "Clumsy"  ||
                maneuver == "None") {
              setAttrByName(id, "fly-maneuver", maneuver);
            };
            break;
          case 'GLIDE':
            setAttrByName(id, "glide-speed", tokens[1]);
            break;
          case 'CLIMB':
            setAttrByName(id, "climb-speed", tokens[1]);
            break;
          case 'BURROW':
            setAttrByName(id, "burrow-speed", tokens[1]);
            break;
          case 'SWIM':
            setAttrByName(id, "swim-speed", tokens[1]);
            break;
        };
      });
    };
    {
      // Fix PC page AC
      setAttrByName(id, "armorworn", 0);
      setAttrByName(id, "acitem", "");
      setAttrByName(id, "acitembonus", "");
      setAttrByName(id, "shieldworn", 0);
      setAttrByName(id, "shield", "");
      setAttrByName(id, "shieldbonus", "");
      var npcaclist = getAttrByName(id, "npcarmorclassinfo").toUpperCase()
         .replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, " ")             // cleanup whitespace
         .replace(/ *, */g, ",")
         .split(",");
      npcaclist.forEach(function(e) {
        var tokens = e.split(" ");
        switch(tokens[1]) {
          case 'SIZE':
          case 'DEX':
            return;
          case 'DODGE':
            setAttrByName(id, "dodgebonus1bonus", parseFloat(tokens[0]));
            return;
          case 'NATURAL':
            setAttrByName(id, "naturalarmor1bonus", parseFloat(tokens[0]));
            return;
          case 'DEFLECTION':
            setAttrByName(id, "deflection1bonus", parseFloat(tokens[0]));
            return;
          case 'MISC':
            setAttrByName(id, "miscac1bonus", parseFloat(tokens[0]));
            return;
        };
        var k = e.split(/ (.+)/)[1];
        if (k.match(/(SHIELD|BUCKLER)/)) {
          setAttrByName(id, "shieldworn", 1);
          setAttrByName(id, "shield", toTitleCase(k));
          setAttrByName(id, "shieldbonus", parseFloat(tokens[0]));
          return;
        } else {
          setAttrByName(id, "armorworn", 1);
          setAttrByName(id, "acitem", toTitleCase(k));
          setAttrByName(id, "acitembonus", parseFloat(tokens[0]));
          return;
        };
      });
    };
    {
      // Fix PC page Saving Throws
      setAttrByName(id, "fortitudebase", Math.floor(parseFloat(getAttrByName(id, "npcfortsave"))-parseFloat(getAttrByName(id, "npccon-mod"))));
      setAttrByName(id, "reflexbase",    Math.floor(parseFloat(getAttrByName(id, "npcrefsave")) -parseFloat(getAttrByName(id, "npcdex-mod"))));
      setAttrByName(id, "willbase",      Math.floor(parseFloat(getAttrByName(id, "npcwillsave"))-parseFloat(getAttrByName(id, "npcwis-mod"))));
    };
    {
      // Fix PC page BAB & Grapple
      setAttrByName(id, "bab", Math.floor(parseFloat(getAttrByName(id, "npcbaseatt"))));
      if (isNaN(parseFloat(getAttrByName(id, "npcgrapple")))) {
        setAttrByName(id, "grapplemiscmod", 0);
      } else {
        setAttrByName(id, "grapplemiscmod", Math.floor(
          parseFloat(getAttrByName(id, "npcgrapple")) -
          parseFloat(getAttrByName(id, "bab")) -
          parseFloat(getAttrByName(id, "epicattackbonus")) -
          parseFloat(getAttrByName(id, "npcstr-mod")) -
          parseFloat(getAttrByName(id, "size")*(-4))
        ));
      };
    };
  }; // fixMookPCSheet

  var checkSheetMacros = function(id) {
    for (var i=1; i<=10; i++) {
      var weaponNname = getAttrByName(id, "weapon"+i+"name");
      log(weaponNname);
    };
  }; // checkSheetMacros

  var mookTokenFixer = function(obj) {
    var objLayer = obj.get("layer");
    var pageId   = obj.get("_pageid");
    var pageName = getObj("page", pageId).get("name");
    if (!obj.get("represents")) { return; }
    var character = getObj("character", obj.get("represents"));
    if (!character) { return; }
    character.get("_defaulttoken", function(token) {
      if (token !== "null") { return; };
      var npcspeed       = parseFloat(getAttrByName(character.id, "npcspeed").replace(new RegExp("[^\.0-9].*$"), ""));
      var armorworn      = parseFloat(getAttrByName(character.id, "armorworn"));
      var acitemspeed    = parseFloat(getAttrByName(character.id, "acitemspeed").replace(new RegExp("[^\.0-9].*$"), ""));
      var encumbrload    = parseFloat(getAttrByName(character.id, "encumbrload"));
      var npcarmorclass  = parseFloat(getAttrByName(character.id, "npcarmorclass"));
      var npchitdie      = getAttrByName(character.id, "npchitdie");
      var speed;
      if (isNaN(npcspeed))                 { log("INVALID npcspeed = "+npcspeed); speed = 0; } else { speed = npcspeed; };
      if (armorworn && isNaN(acitemspeed)) { log("INVALID acitemspeed = "+acitemspeed); acitemspeed = 1000; };
      if (encumbrload < 0) {
        switch(npcspeed) {
          case  20: speed = 15; break;
          case  30: speed = 20; break;
          case  40: speed = 30; break;
          case  50: speed = 35; break;
          case  60: speed = 40; break;
          case  70: speed = 50; break;
          case  80: speed = 55; break;
          case  90: speed = 60; break;
          case 100: speed = 70; break;
        };
      };
      if (armorworn && (acitemspeed < speed)) { speed = acitemspeed; };
      //log("armorworn      = " + armorworn);
      //log("acitemspeed    = " + acitemspeed);
      //log("encumbrload    = " + encumbrload);
      //log("npcspeed       = " + npcspeed);
      //log("speed          = " + speed);
      if (isNaN(npcarmorclass)) { log("INVALID npcarmorclass = "+npcarmorclass); } else { obj.set("bar2_value", npcarmorclass); };
      if (isNaN(speed))         { log("INVALID speed"+speed); } else { obj.set("bar3_value", speed); };
      if (npchitdie) {
        sendChat('GM', '/roll ceil(' + npchitdie +')', function(msg) {
            obj.set("bar1_value", JSON.parse(msg[0].content)['total']);
            obj.set("bar1_max",   JSON.parse(msg[0].content)['total']);
        });
      };
      obj.set("showplayers_bar1", true);
      var npcspace = getAttrByName(character.id, "npcspace");
      if (npcspace) {
        npcspace = npcspace.toUpperCase();
        if (npcspace.match(/ BY /)) {
          npcspace = npcspace
             .replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, " ");             // cleanup whitespace
          var dimensions = npcspace.split(" BY ");
          dimensions[0] = dimensions[0].replace(new RegExp("[^\.0-9].*$"), "");
          dimensions[1] = dimensions[1].replace(new RegExp("[^\.0-9].*$"), "");
          if (!isNaN(dimensions[0]) && !isNaN(dimensions[1])) {
            dimensions[0] = parseFloat(dimensions[0]);
            dimensions[1] = parseFloat(dimensions[1]);
            if (dimensions[0] <= 1.0) { dimensions[0] = 1.0; };
            if (dimensions[1] <= 1.0) { dimensions[1] = 1.0; };
            obj.set("width", config.pixels_per_foot*parseFloat(dimensions[0]));
            obj.set("height", config.pixels_per_foot*parseFloat(dimensions[1]));
          };
        } else {
          npcspace = npcspace.replace(new RegExp("[^\.0-9].*$"), "");
          if (!isNaN(npcspace)) {
            npcspace = parseFloat(npcspace);
            //log("npcspace     = " + npcspace);
            if (npcspace <= 1.0) { npcspace = 1.0; };
            obj.set("width", config.pixels_per_foot*parseFloat(npcspace));
            obj.set("height", config.pixels_per_foot*parseFloat(npcspace));
          };
        };
      };
    });
  }; // mookTokenFixer

  var handleInput = function inputHandler(msg) {
    if (msg.type !== "api" || msg.content.indexOf("!stl") === -1 ) { return; };

    var argsFromUser,
        who,
        errors=[],
        playerID,
        playerName,
        pageID,
        first_arg,
        second_arg,
        userCommand,
        selected_creatures=[];

    playerName = msg.who.replace(new RegExp(" \\(GM\\)$"), "");
    playerID = msg.playerid;

    var sendWhisperChat = function(str) {
      sendChat("skepickleTokenLib", '/w "'+playerName+'" '+str, null, {noarchive:true});
    };

    argsFromUser = msg.content.split(/ +/);
    userCommand = argsFromUser[1];
    first_arg = argsFromUser[2];
    second_arg = argsFromUser[3];

    if (msg.selected) {
      for (var selected of msg.selected) {
        try {
          if (selected["_type"] != "graphic") { continue; }; // Silently skip over selected non-graphics
          var obj = getObj("graphic", selected["_id"]);
          if (obj.get("_subtype") != "token") { sendWhisperChat("&{template:default} {{name=ERROR}} {{Not a token= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")}}"); continue; };
          if (obj.get("represents") == "") { sendWhisperChat("&{template:default} {{name=ERROR}} {{Not a character= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")}}"); continue; };
          selected_creatures.push(selected["_id"]);
        } catch(e) {
          sendWhisperChat(e);
        };
      };
    };

    switch(userCommand) {
      case '--list-source-texts':
        var message_to_send = '';
        Object.keys(dnd35.all_source_texts).forEach(function(k,i) {
          log(k+' '+dnd35.all_source_texts[k]);
          if (dnd35.enabled_source_texts.includes(k)) {
            message_to_send = message_to_send.concat(' {{',dnd35.all_source_texts[k],'= enabled}}');
          } else {
            message_to_send = message_to_send.concat(' {{',dnd35.all_source_texts[k],'= disabled}}');
          };
        });
        sendWhisperChat('&{template:default} {{name=Source Texts}} '+message_to_send, null, {noarchive:true});
        break;
      case '--enable-source-text':
        break;
      case '--disable-source-text':
        break;
      case '--audit-mook-sheet':
        selected_creatures.forEach(function(selected) {
          try {
            var obj = getObj("graphic", selected);
            var character = getObj("character", obj.get("represents"));
            if (!character) { throw "Token does not represent a character." };
            character.get("_defaulttoken", function(token) {
              // Make sure this is a Mook token
              if (token !== "null") { return; };
              try {
                auditMookNPCSheet(character.id);
              } catch(e) {
                sendWhisperChat(e);
              };
            });
          } catch(e) {
            sendWhisperChat(e);
          };
        });
        break;
      case '--fix-mook-sheet':
        selected_creatures.forEach(function(selected) {
            var obj = getObj("graphic", selected);
            var character = getObj("character", obj.get("represents"));
            if (!character) { return; };
            character.get("_defaulttoken", function(token) {
              if (token !== "null") { return; };
              try {
                auditMookNPCSheet(character.id);
                fixMookPCSheet(character.id);
              } catch(e) {
                sendWhisperChat(e);
              };
            });
        });
        break;
      case '--check-sheet-macros':
        selected_creatures.forEach(function(selected) {
            var obj = getObj("graphic", selected);
            var character = getObj("character", obj.get("represents"));
            if (!character) { return; };
            checkSheetMacros(character.id);
        });
        break;
      case '--toggle-reach-auras':
        selected_creatures.forEach(function(selected) {
            var obj = getObj("graphic", selected);
            var character = getObj("character", obj.get("represents"));
            var npcreach = getAttrByName(character.id, "npcreach").replace(new RegExp("[^\.0-9].*$"), "");
            if (isNaN(npcreach)) { return; };
            var aura1_rad = obj.get("aura1_radius");
            var aura2_rad = obj.get("aura2_radius");
            if ((aura1_rad === "") || aura2_rad === "") {
              obj.set("aura1_radius", npcreach*2);
              obj.set("aura1_color", "#FFFFFF"); //FFFF99
              obj.set("aura1_square", false);
              obj.set("aura2_radius", npcreach);
              obj.set("aura2_color", "#777777"); //59E594
              obj.set("aura2_square", false);
            } else {
              obj.set("aura1_radius", "");
              obj.set("aura2_radius", "");
              obj.set("aura1_color", "#FFFF99");
              obj.set("aura2_color", "#59E594");
            };
        });
        break;
      case '--roll-initiative':
        //sendWhisperChat('Group Initiative:');
        selected_creatures.forEach(function(selected) {
            var obj = getObj("graphic", selected);
            var character = getObj("character", obj.get("represents"));
            var npcinitmacro = getAttrByName(character.id, "npcinitmacro");
            var character = getObj("character", obj.get("represents"));
            var char_name = character.get("name");
            var attrib_value_initmacro = character.get("initmacro");
            var init_attrib_name = (attrib_value_initmacro === "@{npcinitmacro}")?("npcinit"):("init");
            sendChat(playerName, "[[(1d20 + (@{"+char_name+"|"+init_attrib_name+"})) + ((1d20 + (@{"+char_name+"|"+init_attrib_name+"}))/100) + ((1d20 + (@{"+char_name+"|"+init_attrib_name+"}))/10000) ]]",function(msg) {
              var turnorder;
              if (Campaign().get("turnorder") == "") turnorder = []; //NOTE: We check to make sure that the turnorder isn't just an empty string first. If it is treat it like an empty array.
              else turnorder = JSON.parse(Campaign().get("turnorder"));
              //log(msg[0].inlinerolls[0]["results"]["total"]);
              var token_in_turnorder = false;
              for (var i=0; i<turnorder.length; i++) {
                if (turnorder[i]["id"] === selected) {
                  token_in_turnorder = true;
                  turnorder[i]["pr"] = msg[0].inlinerolls[0]["results"]["total"].toFixed(4);
                  break;
                };
              };
              if (!token_in_turnorder) {
                turnorder.push({
                  id: selected,
                  pr: msg[0].inlinerolls[0]["results"]["total"].toFixed(4)
                });
              };
              Campaign().set("turnorder", JSON.stringify(turnorder));
              //sendWhisperChat(char_name+"->"+(msg[0].inlinerolls[0]["results"]["total"].toFixed(4)));
            });
        });
        break;
      case '--debug-attribute':
        selected_creatures.forEach(function(selected) {
            var obj = getObj("graphic", selected);
            var character = getObj("character", obj.get("represents"));
            if (!character) { return; };
            var attrib_val = getAttrByName(character.id, first_arg);
            log(first_arg+' attribute for '+character.get("name")+' is = '+attrib_val);
        });
        break;
      case '--help':
      case undefined:
      //getHelp();
        sendChat(playerName, '/w "'+playerName+'" Test 1 2 3 '+playerName);
        break;
    };
  }; // handleInput

  var registerEventHandlers = function() {
    on('add:graphic',  mookTokenFixer);
    on('chat:message', handleInput);
  }; // registerEventHandlers

  var checkInstall = function() {
    if ( Boolean(state.skepickleTokenLibImp) === false ) {
      state.skepickleTokenLibImp = {
        info: info,
        config: config
      };
    };
  }; // checkInstall

  var initialize = function() {
    temp.campaignLoaded = true;
  }; // initialize

  return {
    // Make the following functions available outside the local namespace
    CheckInstall: checkInstall,
    RegisterEventHandlers: registerEventHandlers,
    Initialize: initialize
  };

}());

on("ready", function() {
  skepickleTokenLib.CheckInstall();
  skepickleTokenLib.Initialize();
  skepickleTokenLib.RegisterEventHandlers();
});
