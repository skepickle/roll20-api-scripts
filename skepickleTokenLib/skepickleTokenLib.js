// skepickleCharacterLib

// Purpose: Provide a library of functionality to improve player and GM experience when using Diana P's D&D 3.5 character sheet.

var skepickleCharacterLib = skepickleCharacterLib || (function skepickleCharacterLibImp() {
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

  function decodeRoll20String(str) {
    str = decodeURI(str);
    str = str.replace(/%3A/g, ':');
    str = str.replace(/%23/g, '#');
    str = str.replace(/%3F/g, '?');
    return str;
  }; // decodeRoll20String

  function getStringRegister(str,register) {
    // {register}2|efftype:e|damtype:k|end3|norange|pe|str13|wo1{/register}
    var startPos = str.indexOf("{"  + register + "}");
    var endPos   = str.indexOf("{/" + register + "}");
    if ((startPos == -1) || (endPos == -1)) { return null; };
    return str.substr(startPos+register.length+2, (endPos-startPos)-(register.length+2)).split('|');
  }; // getStringRegister

  function setStringRegister(str,register,values=null) {
    // {register}2|efftype:e|damtype:k|end3|norange|pe|str13|wo1{/register}
    var startPos = str.indexOf("{"  + register + "}");
    var endPos   = str.indexOf("{/" + register + "}");
    var reg_exp;
    var replacement  = '';
    if (values !== null) {
      replacement = ''.concat("{",register,"}",values.join("|"),"{/",register,"}");
    };
    if (startPos == -1) {
      if (endPos == -1) {
        // register not present
        return str.concat(replacement);
      } else {
        // only register closing tag present: CLEAN UP!
        reg_exp = new RegExp("{/" + register + "}");
      };
    } else {
      if (endPos == -1) {
        // only register opening tag present: CLEAN UP!
        reg_exp = new RegExp("{" + register + "}");
      } else {
        // register present
        reg_exp = new RegExp("{" + register + "}[^{]*{/" + register + "}");
      };
    };
    return str.replace(reg_exp, replacement);
  }; // setStringRegister

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
      SRD:     "System Reference Document",
      UA:      "Unearthed Arcana",
      BoED:    "Book of Exalted Deeds",
      unknown: "Unknown Text"
    },
    enabled_source_texts: ["SRD","BoED"],
    source_text_SRD: {
      movement_modes:      ["burrow","climb","fly","swim"],
      fly_maneuverability: ["perfect","good","average","poor","clumsy"],
      size_categories:     ["fine","diminutive","tiny","small","medium","large","huge","gargantuan","colossal"],
      types:               ["aberration","animal","celestial","construct","dragon","elemental","fey","fiend","giant","humanoid","magical beast","monstrous humanoid","ooze","outsider","plant","undead","vermin"],
      subtypes: {
        creature: ["air","angel","aquatic","archon","augmented","chaotic","cold","demon","devil","earth","evil","extraplanar","fire","good","incorporeal","lawful","native","psionic","shapeshifter","swarm","water"],
        humanoid: ["aquatic","dwarf","elf","gnoll","gnome","goblinoid","halfling","human","orc","reptilian"]
      },
      skills: { "Ability:Strength":         {base: "Strength",                 attrib: "str-mod"                               },
                "Ability:Dexterity":        {base: "Dexterity",                attrib: "dex-mod"                               },
                "Ability:Constitution":     {base: "Constitution",             attrib: "con-mod"                               },
                "Ability:Intelligence":     {base: "Intelligence",             attrib: "int-mod"                               },
                "Ability:Wisdom":           {base: "Wisdom",                   attrib: "wis-mod"                               },
                "Ability:Charisma":         {base: "Charisma",                 attrib: "cha-mod"                               },
                "Appraise":                 {base: "Appraise",                 attrib: "appraise",          trained_only:false },
                "Balance":                  {base: "Balance",                  attrib: "balance",           trained_only:false },
                "Bluff":                    {base: "Bluff",                    attrib: "bluff",             trained_only:false },
                "Climb":                    {base: "Climb",                    attrib: "climb",             trained_only:false },
                "Concentration":            {base: "Concentration",            attrib: "concentration",     trained_only:false },
                "Craft()":                  {base: "Craft",                    attrib: "craft#",            trained_only:false },
                "Decipher Script":          {base: "Decipher Script",          attrib: "decipherscript",    trained_only:true  },
                "Diplomacy":                {base: "Diplomacy",                attrib: "diplomacy",         trained_only:false },
                "Disable Device":           {base: "Disable Device",           attrib: "disabledevice",     trained_only:true  },
                "Disguise":                 {base: "Disguise",                 attrib: "disguise",          trained_only:false },
                "Escape Artist":            {base: "Escape Artist",            attrib: "escapeartist",      trained_only:false },
                "Forgery":                  {base: "Forgery",                  attrib: "forgery",           trained_only:false },
                "Gather Information":       {base: "Gather Information",       attrib: "gatherinformation", trained_only:false },
                "Handle Animal":            {base: "Handle Animal",            attrib: "handleanimal",      trained_only:true  },
                "Heal":                     {base: "Heal",                     attrib: "heal",              trained_only:false },
                "Hide":                     {base: "Hide",                     attrib: "hide",              trained_only:false },
                "Intimidate":               {base: "Intimidate",               attrib: "intimidate",        trained_only:false },
                "Jump":                     {base: "Jump",                     attrib: "jump",              trained_only:false },
                "Knowledge(Arcana)":        {base: "Knowledge(Arcana)",        attrib: "knowarcana",        trained_only:true  },
                "Knowledge(Engineering)":   {base: "Knowledge(Engineering)",   attrib: "knowengineer",      trained_only:true  },
                "Knowledge(Dungeoneering)": {base: "Knowledge(Dungeoneering)", attrib: "knowdungeon",       trained_only:true  },
                "Knowledge(Geography)":     {base: "Knowledge(Geography)",     attrib: "knowgeography",     trained_only:true  },
                "Knowledge(History)":       {base: "Knowledge(History)",       attrib: "knowhistory",       trained_only:true  },
                "Knowledge(Local)":         {base: "Knowledge(Local)",         attrib: "knowlocal",         trained_only:true  },
                "Knowledge(Nature)":        {base: "Knowledge(Nature)",        attrib: "knownature",        trained_only:true  },
                "Knowledge(Nobility)":      {base: "Knowledge(Nobility)",      attrib: "knownobility",      trained_only:true  },
                "Knowledge(Religion)":      {base: "Knowledge(Religion)",      attrib: "knowreligion",      trained_only:true  },
                "Knowledge(The Planes)":    {base: "Knowledge(The Planes)",    attrib: "knowplanes",        trained_only:true  },
                "Listen":                   {base: "Listen",                   attrib: "listen",            trained_only:false },
                "Move Silently":            {base: "Move Silently",            attrib: "movesilent",        trained_only:false },
                "Open Lock":                {base: "Open Lock",                attrib: "openlock",          trained_only:true  },
                "Perform()":                {base: "Perform",                  attrib: "perform#",          trained_only:false },
                "Profession()":             {base: "Profession",               attrib: "profession#",       trained_only:true  },
                "Ride":                     {base: "Ride",                     attrib: "ride",              trained_only:false },
                "Search":                   {base: "Search",                   attrib: "search",            trained_only:false },
                "Sense Motive":             {base: "Sense Motive",             attrib: "sensemotive",       trained_only:false },
                "Sleight of Hand":          {base: "Sleight of Hand",          attrib: "sleightofhand",     trained_only:true  },
                "Spellcraft":               {base: "Spellcraft",               attrib: "spellcraft",        trained_only:true  },
                "Spot":                     {base: "Spot",                     attrib: "spot",              trained_only:false },
                "Survival":                 {base: "Survival",                 attrib: "survival",          trained_only:false },
                "Swim":                     {base: "Swim",                     attrib: "swim",              trained_only:false },
                "Tumble":                   {base: "Tumble",                   attrib: "tumble",            trained_only:true  },
                "Use Magic Device":         {base: "Use Magic Device",         attrib: "usemagicdevice",    trained_only:true  },
                "Use Rope":                 {base: "Use Rope",                 attrib: "userope",           trained_only:false },
                "Autohypnosis":             {base: "Autohypnosis",             attrib: "",                  trained_only:true  },
                "Knowledge()":              {base: "Knowledge",                attrib: "",                  trained_only:true  },
                "Psicraft":                 {base: "Psicraft",                 attrib: "",                  trained_only:true  },
                "Use Psionic Device":       {base: "Use Psionic Device",       attrib: "",                  trained_only:true  } }
    },
    source_text_BoED: {
      types: ["deathless"]
    },
    source_text_unknown: {
      movement_modes: ["glide"]
    },
    merge_arrays: function(property_name) {
      var result = [];
      var myself = this;
      var property_heirarchy = property_name.split('.');
      this.enabled_source_texts.forEach(function(source) {
        if (myself['source_text_'.concat(source)] !== undefined) {
          var i = 0;
          var property_p = myself['source_text_'.concat(source)];
          do {
            property_p = property_p[property_heirarchy[i]];
            i++;
          } while ((i < property_heirarchy.length) && (property_p !== undefined));
          if (property_p !== undefined) {
            result = [...new Set([...result ,...property_p])];
          };
        };
      });
      return result;
    },
    merge_maps: function(property_name) {
      var result = {};
      var myself = this;
      var property_heirarchy = property_name.split('.');
      this.enabled_source_texts.forEach(function(source) {
        if (myself['source_text_'.concat(source)] !== undefined) {
          var i = 0;
          var property_p = myself['source_text_'.concat(source)];
          do {
            property_p = property_p[property_heirarchy[i]];
            i++;
          } while ((i < property_heirarchy.length) && (property_p !== undefined));
          if (property_p !== undefined) {
            result = Object.assign({}, result, property_p);
          };
        };
      });
      return result;
    },
    movement_modes:      function() { return this.merge_arrays("movement_modes"); },
    fly_maneuverability: function() { return this.merge_arrays("fly_maneuverability"); },
    size_categories:     function() { return this.merge_arrays("size_categories"); },
    types:               function() { return this.merge_arrays("types"); },
    creature_subtypes:   function() { return this.merge_arrays("subtypes.creature"); },
    humanoid_subtypes:   function() { return this.merge_arrays("subtypes.humanoid"); },
    subtypes:            function() { return [...new Set([...this.creature_subtypes() ,...this.humanoid_subtypes()])]; },
    skills:              function() { return this.merge_maps("skills"); }
  };

  // D&D 3.5e Utility Functions

  var abilityScoreToMod = function(score) {
    if (isNaN(score)) {
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

  var sizeModToTallReach = function(size) {
    //log("sizeModToTallReach('"+size+"')");
    if (isNaN(size)) {
      log("   isNaN");
      if (!dnd35.size_categories().includes(size)) { log("error"); throw "{{error}}"; };
      size = sizeToMod(size);
    };
    size = parseFloat(size);
    //log(size);
    //log('=====');
    switch(size) {
      case  4: return 0;
      case  3: return 0;
      case  2: return 0;
      case  1: return 5;
      case  0: return 5;
      case -1: return 10;
      case -2: return 15;
      case -3: return 20;
      case -4: return 30;
    };
  }; // sizeModToTallReach

  var sizeModToLongReach = function(size) {
    if (isNaN(size)) {
      if (!dnd35.size_categories().includes(size)) { log("error"); throw "{{error}}"; };
      size = sizeToMod(size);
    };
    switch(size) {
      case  4: return 0;
      case  3: return 0;
      case  2: return 0;
      case  1: return 5;
      case  0: return 5;
      case -1: return 5;
      case -2: return 10;
      case -3: return 15;
      case -4: return 20;
    };
  }; // sizeModToLongReach

  var getSkillSpecification = function(attrib) {
    attrib = attrib.replace(/ +\(/g, "(");
    var skills = dnd35.skills();
    if (skills[attrib] !== undefined) {
      return skills[attrib];
    };
    var match_result = attrib.match(/^([^(]+)(\(.+\)){0,1}$/i);
    if (match_result[1] === undefined) { return null; };
    var skill_name = trimWhitespace(match_result[1]);
    if (skill_name == "") { return null; }
    if (match_result[2] === undefined) {
      return skills[skill_name];
    } else {
      skill_name = skill_name+'()';
      return Object.assign({}, skills[skill_name], { sub: trimWhitespace(match_result[2].replace(/^\(/, "").replace(/\)$/, "")) });
    };
  }; // getSkillSpecification

  // Roll20 Attribute Utility Functions

  var isAttrByNameDefined = function(id, attrib) {
    var attribute = findObjs({
        type: 'attribute',
        characterid: id,
        name: attrib
    }, {caseInsensitive: true})[0];
    return !!attribute;
  }; // isAttrByNameDefined

  var isAttrByNameNaN = function(id, attrib, value_type) {
    value_type = value_type || 'current';
    var val = getAttrByName(id, attrib, value_type);
    if (val === undefined) {
      throw "isAttrByNameNaN() called with undefined attribute"
    };
    return isNaN(val);
  }; // isAttrByNameNaN

  // Implemented internally in Roll20
  //var getAttrByName = function(id, attrib, value_type) { return <a string>; }

  const getRepeatingSectionRowIDs = function (charid, prefix) {
    // Input
    //  charid: character id
    //  prefix: repeating section name, e.g. 'repeating_weapons'
    // Output
    //  repRowIds: array containing all repeating section IDs for the given prefix, ordered in the same way that the rows appear on the sheet
    //  repeatingAttrs: object containing all repeating attributes that exist for this section, indexed by their name
    const repeatingAttrs = {},
      regExp = new RegExp(`^${prefix}_(-[-A-Za-z0-9]+?|\\d+)_`);
    let repOrder;
    // Get attributes
    findObjs({
      _type: 'attribute',
      _characterid: charid
    }).forEach(o => {
      const attrName = o.get('name');
      if (attrName.search(regExp) === 0) repeatingAttrs[attrName] = o;
      else if (attrName === `_reporder_${prefix}`) repOrder = o.get('current').split(',');
    });
    if (!repOrder) repOrder = [];
    // Get list of repeating row ids by prefix from repeatingAttrs
    const unorderedIds = [...new Set(Object.keys(repeatingAttrs)
      .map(n => n.match(regExp))
      .filter(x => !!x)
      .map(a => a[1]))];
    const repRowIds = [...new Set(repOrder.filter(x => unorderedIds.includes(x)).concat(unorderedIds))];
    //log(repeatingAttrs);
    return repRowIds;
  }; // getRepeatingSectionRowIDs

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

  // Roll20 Character Sheet Utility Functions

  var characterIsMook = function(id) {
    //TODO implement!
    return true;
  }; // characterIsMook

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
            throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid mod value '"+getAttrByName(id, ''.concat(a,'-mod'))+"' for '"+a+"' nonability score. Should be set to:= 0");
          };
        };
      } else {
        if (getAttrByName(id, ''.concat(a,'-mod')) != abilityScoreToMod(getAttrByName(id, a))) {
          throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid mod value '"+getAttrByName(id, ''.concat(a,'-mod'))+"' for '"+a+"' ability score '"+getAttrByName(id, a)+"'. Should be set to:= "+abilityScoreToMod(getAttrByName(id, a)));
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
        let result = e.match(/^[+]{0,1}([-]{0,1}[0-9]+) +(.*)+$/);
        if (result == null) {
          throwDefaultTemplate("auditMookNPCSheet()",id,"Invalid npcarmorclassinfo= '"+npcarmorclassinfo+"'");
        };
        if (isNaN(result[1])) {
          throwDefaultTemplate("auditMookNPCSheet()",id, "Impossible Condition: Invalid npcarmorclassinfo modifier value= '"+result[1]+"'");
        };
        if (['str','dex','con','int','wis','cha'].includes(result[2])) {
          var ability_mod = getAttrByName(id, ''.concat('npc',result[2],'-mod'));
          if (isNaN(ability_mod) && (result[1] != ability_mod.replace(/^\+/, ""))) {
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

  var sendWhisperChat = function(msg,str) {
    var playerName = msg.who;
    if (playerIsGM(msg.playerid)) { playerName = playerName.replace(new RegExp(" \\(GM\\)$"), "") };
    sendChat("skepickleCharacterLib", '/w "'+playerName+'" '+str, null, {noarchive:true});
  }; // sendWhisperChat

  var getSelectedCharacterIDs = function(msg) {
    var ids=[];
    if (msg.selected) {
      for (var selected of msg.selected) {
        try {
          if (selected["_type"] != "graphic") { continue; }; // Silently skip over selected non-graphics
          var obj = getObj("graphic", selected["_id"]);
          if (obj.get("_subtype") != "token") {
            sendWhisperChat(msg,"&{template:default} {{name=ERROR}} {{Not a token= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")}}");
            continue;
          };
          if (obj.get("represents") == "") {
            sendWhisperChat(msg,"&{template:default} {{name=ERROR}} {{Not a character= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")}}");
            continue;
          };
          var character = getObj("character", obj.get("represents"));
          if (!getAttrByName(character.id, "character_sheet").match(/D&D3.5 v[\.0-9]*/)) {
            sendWhisperChat(msg,"&{template:default} {{name=ERROR}} {{Not a D&D3.5 character= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")}}");
            continue;
          };
          ids.push(selected["_id"]);
        } catch(e) {
          sendWhisperChat(msg,e);
        };
      };
    };
    return ids;
  }; // getSelectedCharacterIDs

  var handleInput = function inputHandler(msg) {
    //TODO remove !stl
    if (msg.type !== "api" || (msg.content.indexOf("!stl") === -1 && msg.content.indexOf("!scl") === -1) ) { return; };

    var playerID           = msg.playerid;
    var playerName         = msg.who.replace(new RegExp(" \\(GM\\)$"), "");

    var selected_token_ids = getSelectedCharacterIDs(msg);
    var argsFromUser       = msg.content.split(/ +/);
    var userCommand        = argsFromUser[1];
    var first_arg          = argsFromUser[2];
    var second_arg         = argsFromUser[3];

    if (userCommand == null) {
      sendWhisperChat(msg,artsFromUser[0]+" requires arguments");
      //TODO send usage info?
      return;
    };
    if (first_arg  != null) { first_arg  = first_arg.replace(/_/g, " ");  };
    if (second_arg != null) { second_arg = second_arg.replace(/_/g, " "); };

    switch(userCommand) {
      case '--list-source-texts':
        var message_to_send = '';
        Object.keys(dnd35.all_source_texts).forEach(function(k,i) {
          //log(k+' '+dnd35.all_source_texts[k]);
          if (dnd35.enabled_source_texts.includes(k)) {
            message_to_send = message_to_send.concat(' {{',dnd35.all_source_texts[k],'= enabled}}');
          } else {
            message_to_send = message_to_send.concat(' {{',dnd35.all_source_texts[k],'= disabled}}');
          };
        });
        sendWhisperChat(msg,'&{template:default} {{name=Source Texts}} '+message_to_send, null, {noarchive:true});
        break;
      case '--enable-source-text':
        break;
      case '--disable-source-text':
        break;
      case '--audit-mook-sheet':
        selected_token_ids.forEach(function(selected) {
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
                sendWhisperChat(msg,e);
              };
            });
          } catch(e) {
            sendWhisperChat(msg,e);
          };
        });
        break;
      case '--fix-mook-sheet':
        selected_token_ids.forEach(function(selected) {
            var obj = getObj("graphic", selected);
            var character = getObj("character", obj.get("represents"));
            if (!character) { return; };
            character.get("_defaulttoken", function(token) {
              if (token !== "null") { return; };
              try {
                auditMookNPCSheet(character.id);
                fixMookPCSheet(character.id);
              } catch(e) {
                sendWhisperChat(msg,e);
              };
            });
        });
        break;
      case '--check-sheet-macros':
        //TODO Implement this?
        //selected_token_ids.forEach(function(selected) {
        //    var obj = getObj("graphic", selected);
        //    var character = getObj("character", obj.get("represents"));
        //    if (!character) { return; };
        //    checkSheetMacros(character.id);
        //});
        break;
      case '--toggle-reach-auras':
        try {
          selected_token_ids.forEach(function(selected) {
            var obj = getObj("graphic", selected);
            var character = getObj("character", obj.get("represents"));
            var reach = getAttrByName(character.id, "npcreach").replace(new RegExp("[^\.0-9].*$"), "");
            if ((!isAttrByNameDefined(character.id, "npcname")) || (getAttrByName(character.id, "npcname") == "")) {
              //log(getAttrByName(character.id, "size"));
              reach = sizeModToTallReach(getAttrByName(character.id, "size"));
            };
            if (isNaN(reach)) { return; }; //TODO maybe log error for weird reach specifier?
            var gmnotes = decodeRoll20String(obj.get('gmnotes'));
            var aura_info = getStringRegister(gmnotes, "aura-data-backup");
            if (aura_info === null) {
              // no backup present, so take backup and overwrite attributes
              obj.set("gmnotes",setStringRegister(gmnotes,
                                                  "aura-data-backup",
                                                  [obj.get("aura1_radius"),
                                                   obj.get("aura1_color"),
                                                   obj.get("aura1_square"),
                                                   obj.get("aura2_radius"),
                                                   obj.get("aura2_color"),
                                                   obj.get("aura2_square"),
                                                   obj.get("showplayers_aura1"),
                                                   obj.get("showplayers_aura2"),
                                                   obj.get("playersedit_aura1"),
                                                   obj.get("playersedit_aura2")]));
              obj.set("aura1_radius", reach*2);
              obj.set("aura1_color", "#00FF00");
              obj.set("aura1_square", false);
              obj.set("aura2_radius", reach);
              obj.set("aura2_color", "#0000FF");
              obj.set("aura2_square", false);
              obj.set("showplayers_aura1", false);
              obj.set("showplayers_aura2", false);
              obj.set("playersedit_aura1", false);
              obj.set("playersedit_aura2", false);
            } else {
              // backup present, remove register and restore attributes
              obj.set("aura1_radius", aura_info[0]);
              obj.set("aura1_color",  aura_info[1]);
              obj.set("aura1_square", (aura_info[2]=="true"));
              obj.set("aura2_radius", aura_info[3]);
              obj.set("aura2_color",  aura_info[4]);
              obj.set("aura2_square", (aura_info[5]=="true"));
              obj.set("showplayers_aura1", (aura_info[6]=="true"));
              obj.set("showplayers_aura2", (aura_info[7]=="true"));
              obj.set("playersedit_aura1", (aura_info[8]=="true"));
              obj.set("playersedit_aura2", (aura_info[9]=="true"));
              obj.set("gmnotes",setStringRegister(gmnotes, "aura-data-backup"));
            };
          });
        } catch (e) {
          log("Encountered a problem while rolling group initiative: \n"+e);
        };
        break;
      case '--roll-initiative':
      case '--group-initiative-check':
        // --group-initiative-check [clear]
        //   The optional "clear" argument indicates that the turn order should be cleared before adding new entries
        try {
          var roll_initiative_map = {};
          var selected_tokens_remainin_ids = selected_token_ids.length;
          if ((first_arg != null) && (first_arg.toLowerCase() == "clear")) {
            Campaign().set("turnorder", JSON.stringify([]));
          };
          selected_token_ids.forEach( selected_token => {
            var obj = getObj("graphic", selected_token);
            var character = getObj("character", obj.get("represents"));
            var char_name = character.get("name");
            var init_macro;
            {
              var init_attrib_name;
              if (getAttrByName(character.id, "npcname")==="") {
                init_attrib_name = "init";
              } else {
                init_attrib_name = "npcinit";
              };
              init_macro = "[[(1d20cs>21cf<0 + (@{"+char_name+"|"+init_attrib_name+"})) + ((1d20cs>21cf<0 + (@{"+char_name+"|"+init_attrib_name+"}))/100) + ((1d20cs>21cf<0 + (@{"+char_name+"|"+init_attrib_name+"}))/10000)]]";
            };
            try {
              sendChat(playerName,init_macro, init_macro_rsp => {
                var turnorder = Campaign().get("turnorder");
                if (turnorder == "") {
                  turnorder = [];
                } else {
                  turnorder = JSON.parse(turnorder);
                };
                //log(init_macro_rsp[0].inlinerolls[0]["results"]["total"]);
                {
                  var token_in_turnorder = false;
                  for (var i=0; i<turnorder.length; i++) {
                    if (turnorder[i]["id"] === selected_token) {
                      token_in_turnorder = true;
                      turnorder[i]["pr"] = init_macro_rsp[0].inlinerolls[0]["results"]["total"].toFixed(4);
                      break;
                    };
                  };
                  if (!token_in_turnorder) {
                    turnorder.push({
                      id: selected_token,
                      pr: init_macro_rsp[0].inlinerolls[0]["results"]["total"].toFixed(4)
                    });
                  };
                };
                Campaign().set("turnorder", JSON.stringify(turnorder));
                {
                  var char_name_unique = char_name;
                  if (roll_initiative_map[char_name] !== undefined) {
                    if (roll_initiative_map[char_name] != "EXCLUDE") {
                      char_name_unique = char_name.concat(" (1)");
                      roll_initiative_map[char_name_unique] = roll_initiative_map[char_name];
                      roll_initiative_map[char_name]        = "EXCLUDE";
                      char_name_unique = char_name.concat(" (2)");
                    } else {
                      var n = 3;
                      while (roll_initiative_map[char_name.concat(" ("+n+")")] !== undefined) {
                        n++;
                      };
                      char_name_unique = char_name.concat(" ("+n+")");
                    };
                  };
                  roll_initiative_map[char_name_unique] = init_macro_rsp[0].inlinerolls[0]["results"]["total"].toFixed(4);
                };
                selected_tokens_remainin_ids--;
                if (selected_tokens_remainin_ids==0) {
                  var chat_msg = "&{template:default} {{name=Group Initiative}} ";
                  Object.keys(roll_initiative_map).forEach(function(k){
                    if (roll_initiative_map[k] == "EXCLUDE") {
                      return;
                    };
                    chat_msg += "{{" + k + "= "+ roll_initiative_map[k] +"}} ";
                  });
                  sendWhisperChat(msg,chat_msg);
                };
              });
            } catch (e) {
              log("Encountered a problem while rolling group initiative: "+e);
              log("  Macro = "+init_macro);
            };
          });
        } catch (e) {
          log("Encountered a problem while rolling group initiative: \n"+e);
        };
        break;
      case '--group-skill-check':
        // --group-skill-check <SKILLNAME> <Aid Another|Individual>
        //   Both arguments are required
        if ((first_arg == null) || (second_arg == null)) {
          sendWhisperChat(msg,'&{template:default} {{name=ERROR}} {{Command= Group Skill Check}} {{Message= Required arguments missing}}');
        };
        if ((second_arg != "Aid Another") && (second_arg != "Individual")) {
          sendWhisperChat(msg,'&{template:default} {{name=ERROR}} {{Command= Group Skill Check}} {{Message= Invalid value for skill help type}}');
        };
        var skill_spec         = getSkillSpecification(first_arg);
        if (skill_spec == null) { log("ERROR skill spec"); return; };
        var skill_trained_only = skill_spec.trained_only || '';
        var help_type          = second_arg;

        //log(skill_spec);

        var roll_skill_map            = {}; // key=uniquified char_name, val=skill check
        var selected_tokens_remainin_ids = selected_token_ids.length;
        // Loop through each selected character...
        selected_token_ids.forEach(function(selected) {
          var obj          = getObj("graphic", selected);
          var character    = getObj("character", obj.get("represents"));
          var char_name    = character.get("name");
          var skill_attrib = skill_spec.attrib;

          if (skill_spec.attrib.match(/\#/)) {
            var found_skill = false;
            for (var skillindex=1; skillindex<4; skillindex++) {
              if (getAttrByName(character.id,
                                skill_spec.attrib.replace(/\#/, ''.concat(skillindex,"name"))).toLowerCase() == skill_spec.sub.toLowerCase()) {
                skill_attrib = skill_spec.attrib.replace(/\#/, ''.concat(skillindex));
                found_skill = true;
                break;
              };
            };
            if (!found_skill) {
              const otherskill_rowids = getRepeatingSectionRowIDs(character.id, 'repeating_skills');
              found_skill = false;
              otherskill_rowids.forEach( id => {
                if (!found_skill) {
                  var otherskillname = trimWhitespace(getAttrByName(character.id, ''.concat("repeating_skills_",id,"_otherskillname")).
                                                        replace(/\* *$/,"").
                                                        replace(/ +\(/g,"("));
                  //log(otherskillname.toLowerCase() + " vs " + ''.concat(skill_spec.base,"(",skill_spec.sub,")").toLowerCase());
                  if (otherskillname.toLowerCase() == ''.concat(skill_spec.base,"(",skill_spec.sub,")").toLowerCase()) {
                    skill_attrib = ''.concat('repeating_skills_',id,"_otherskill");
                    found_skill = true;
                  };
                };
              });
            };
            if (!found_skill) {
              switch(skill_spec.base) {
                case "Craft":      skill_attrib="int-mod"; break;
                case "Perform":    skill_attrib="cha-mod"; break;
                case "Profession": skill_attrib="wis-mod"; break;
                default:           log("NOT FOUND"); return;
              }
            };
          } else if (skill_spec.attrib == "") {
            const otherskill_rowids = getRepeatingSectionRowIDs(character.id, 'repeating_skills');
            var found_skill = false;
            otherskill_rowids.forEach( id => {
              if (!found_skill) {
                var otherskillname = trimWhitespace(getAttrByName(character.id, ''.concat("repeating_skills_",id,"_otherskillname")).
                                                      replace(/\* *$/,"").
                                                      replace(/ +\(/g,"("));
                //log(otherskillname.toLowerCase() + " vs " + ''.concat(skill_spec.base,"(",skill_spec.sub,")").toLowerCase());
                if (otherskillname.toLowerCase() == ''.concat(skill_spec.base,"(",skill_spec.sub,")").toLowerCase()) {
                  skill_attrib = ''.concat('repeating_skills_',id,"_otherskill");
                  found_skill = true;
                };
              };
            });
            if (!found_skill) {
              switch(skill_spec.base) {
                case "Knowledge":
                case "Craft":      skill_attrib="int-mod"; break;
                case "Perform":    skill_attrib="cha-mod"; break;
                case "Profession": skill_attrib="wis-mod"; break;
                default:           log("NOT FOUND"); return;
              }
            };
          };
          // at this point! "skill_attrib" __should__ be correct for this character
          //log(skill_attrib);

          // ...generate a unique char_name, in case of multiple instances...
          var char_name_unique = char_name;
          if (roll_skill_map[char_name] !== undefined) {
            if (roll_skill_map[char_name].state == "EXCLUDE") {
              var n = 3;
              while (roll_skill_map[char_name.concat(" ("+n+")")] !== undefined) {
                n++;
              };
              char_name_unique = char_name.concat(" ("+n+")");
            } else {
              char_name_unique                 = char_name.concat(" (1)");
              roll_skill_map[char_name_unique] = roll_skill_map[char_name];
              roll_skill_map[char_name]        = { id: character.id, name: char_name, state: "EXCLUDE" };
              char_name_unique                 = char_name.concat(" (2)");
            };
          };
          // ...adding each token to the roll_skill_map for further processing to get bonus value...
          roll_skill_map[char_name_unique] = { id: character.id, name: char_name, state: "GET_BONUS" };
          if (skill_spec.trained_only) {
            if (["str-mod","dex-mod","con-mod","int-mod","wis-mod","cha-mod"].includes(skill_attrib)) {
              roll_skill_map[char_name_unique].state = "UNTRAINED";
            } else {
              var ranks = getAttrByName(character.id, skill_attrib.concat("ranks"));
              if (isNaN(ranks) || (ranks < 1)) {
                roll_skill_map[char_name_unique].state = "UNTRAINED";
              };
            };
          };
          selected_tokens_remainin_ids--;
          if (selected_tokens_remainin_ids==0) {
            //log(roll_skill_map);
            var get_bonuses_remaining = Object.keys(roll_skill_map).length;
            var highest_bonus     = -10000;
            var highest_char_name = "";
            // ...retrieve each selected token's skill bonus...
            Object.keys(roll_skill_map).forEach(function(char_name_unique) {
              if (roll_skill_map[char_name_unique].state == "EXCLUDE") {
                char_name = char_name_unique;
              } else {
                char_name = roll_skill_map[char_name_unique].name;
              };
              sendChat(char_name_unique,''.concat('[[@{',char_name,'|',skill_attrib,'}]]'),function(attrib_msg) {
                var bonus = 0;
                char_name_unique = attrib_msg[0].who;
                if (!(["EXCLUDE","UNTRAINED"].includes(roll_skill_map[char_name_unique].state))) {
                  bonus = attrib_msg[0].inlinerolls[0]["results"]["total"];
                  //log("    gotBonus("+char_name_unique+") => "+bonus);
                  roll_skill_map[char_name_unique]["bonus"] = bonus;
                  roll_skill_map[char_name_unique]["state"] = "GET_CHECK";
                  if (bonus > highest_bonus) {
                    //log("== Highest bonus is "+highest_char_name+" with "+highest_bonus);
                    highest_bonus     = bonus;
                    highest_char_name = char_name_unique;
                    //log("=> Highest bonus is "+highest_char_name+" with "+highest_bonus);
                  };
                } else {
                  roll_skill_map[char_name_unique]["bonus"] = 0;
                };
                get_bonuses_remaining--;
                if (get_bonuses_remaining==0) {
                  //log(roll_skill_map);
                  var get_checks_remaining = Object.keys(roll_skill_map).length;
                  Object.keys(roll_skill_map).forEach(function(char_name_unique) {
                    if (roll_skill_map[char_name_unique].state == "EXCLUDE") {
                      char_name = char_name_unique;
                    } else {
                      char_name = roll_skill_map[char_name_unique].name;
                    };
                    sendChat(char_name_unique,''.concat('[[1d20 + ', roll_skill_map[char_name_unique].bonus, ']]'),function(check_msg) {
                      var check = 0;
                      char_name_unique = check_msg[0].who;
                      if (!(["EXCLUDE","UNTRAINED"].includes(roll_skill_map[char_name_unique].state))) {
                        check = check_msg[0].inlinerolls[0]["results"]["total"];
                        //log("    gotCheck("+char_name_unique+") => "+check);
                        roll_skill_map[char_name_unique]["check"] = check;
                        roll_skill_map[char_name_unique]["state"] = "PRINT";
                      } else {
                        roll_skill_map[char_name_unique]["check"] = 0;
                      };
                      get_checks_remaining--;
                      if (get_checks_remaining==0) {
                        //log(roll_skill_map);
                        var aid_total = 0;
                        var checks_total = 0;
                        var checks_num   = 0;
                        var chat_msg = "&{template:default} {{name=Group Skill Check}} {{Skill= "+first_arg.replace(/\(/,"\n(")+"}} {{Check Type= "+help_type+"}} ";
                        var prints_remaining = Object.keys(roll_skill_map).length;
                        //Object.keys(roll_skill_map).forEach(function(char_name_unique) {
                        Object.keys(roll_skill_map).forEach(char_name_unique => {
                          if (roll_skill_map[char_name_unique].state != "EXCLUDE") {
                            if (roll_skill_map[char_name_unique].state != "UNTRAINED") {
                              checks_total += roll_skill_map[char_name_unique].check;
                              checks_num++;
                              if ((help_type == "Aid Another") && (char_name_unique !== highest_char_name)) {
                                var aid_inc = 0;
                                if (roll_skill_map[char_name_unique].check >= 10) { aid_inc = 2; };
                                aid_total += aid_inc;
                                chat_msg += "{{" + char_name_unique + "= +" + aid_inc + "(" + roll_skill_map[char_name_unique].check + ")}} ";
                              } else {
                                aid_total += roll_skill_map[char_name_unique].check;
                                chat_msg += "{{" + char_name_unique + "= " + roll_skill_map[char_name_unique].check + "}} ";
                              };
                            } else {
                              chat_msg += "{{" + char_name_unique + "= *Untrained* }} ";
                            };
                          };
                          prints_remaining--;
                          if (prints_remaining==0) {
                            if (help_type == "Aid Another") {
                              chat_msg += "{{*Total*= ***"+ aid_total +"***}} ";
                            } else {
                              var avg_check = checks_total / checks_num;
                              chat_msg += "{{*Average*= ***"+avg_check+"***}}";
                            };
                            sendWhisperChat(msg,chat_msg);
                          };
                        });
                      };
                    });
                  });
                };
              });
            });
          };
        });
        break;
      case '--debug-attribute':
        selected_token_ids.forEach(function(selected) {
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
    if ( Boolean(state.skepickleCharacterLibImp) === false ) {
      state.skepickleCharacterLibImp = {
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
  skepickleCharacterLib.CheckInstall();
  skepickleCharacterLib.Initialize();
  skepickleCharacterLib.RegisterEventHandlers();
});
