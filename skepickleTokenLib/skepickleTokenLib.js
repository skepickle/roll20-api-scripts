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

  var toTitleCase = function(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    };
    return str.join(' ');
  };

  var trimWhitespace = function(str) {
    return str.replace(/ +/g, " ").replace(/^ /, "").replace(/ $/, "").replace(/ *, */g, ",");
  };

  // D&D 3.5e Tables

  var dnd35 = {
    sources: ["srd","faerun"],
    srd: {
      size_categories: ["fine","diminutive","tiny","small","medium","large","huge","gargantuan","colossal"],
      types: ["aberration","animal","celestial","construct","dragon","elemental","fey","fiend","giant","humanoid","magical beast","monstrous humanoid","ooze","outsider","plant","undead","vermin"],
      creature_subtypes: ["air","angel","aquatic","archon","augmented","chaotic","cold","demon","devil","earth","evil","extraplanar","fire","good","incorporeal","lawful","native","psionic","shapeshifter","swarm","water"],
      humanoid_subtypes: ["aquatic","dwarf","elf","gnoll","gnome","goblinoid","halfling","human","orc","reptilian"],
      ///////////
      movement_modes: ["burrow","climb","fly","swim"],
      fly_maneuverability: ["perfect","good","average","poor","clumsy"]
    },
    faerun: {
      types: ["deathless"]
      //?more stuff?
    },
    size_categories: function() {
      var result = [];
      this.sources.forEach(function(source) {
        if (dnd35[source].size_categories !== undefined) {
          result = [...new Set([...result ,...dnd35[source].size_categories])];
        };
      });
      return result;
    },
    types: function() {
      var result = [];
      this.sources.forEach(function(source) {
        if (dnd35[source].types !== undefined) {
          result = [...new Set([...result ,...dnd35[source].types])];
        };
      });
      return result;
    },
    creature_subtypes: function() {
      var result = [];
      this.sources.forEach(function(source) {
        if (dnd35[source].creature_subtypes !== undefined) {
          result = [...new Set([...result ,...dnd35[source].creature_subtypes])];
        };
      });
      return result;
    },
    humanoid_subtypes: function() {
      var result = [];
      this.sources.forEach(function(source) {
        if (dnd35[source].humanoid_subtypes !== undefined) {
          result = [...new Set([...result ,...dnd35[source].humanoid_subtypes])];
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
  };

  var abilityScoreToBonusSpells = function(score, spelllevel) {
    if (spelllevel==0) { return 0; };
    mod = abilityScoreToMod(score);
    return Math.max(0,Math.ceil((1.0+mod-spelllevel/4.0)));
  };

  var abilityScoreToBonusPowers = function(score, classlevel) {
    mod = abilityScoreToMod(score);
    return Math.floor((mod*classlevel)/2.0);
  };

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
  };

  var isAttrByNameNaN = function(id, attrib, value_type) {
    value_type = value_type || 'current';
    var val = getAttrByName(id, attrib, value_type);
    if (val !== undefined) {
      //TODO throw ERROR: Attribute does not exist
      return false;
    };
    return isNaN(val);
  };

  // Roll20 Character Sheet Utility Functions

  var characterIsMook = function(id) {
    //TODO implement!
    return true;
  };

  var auditMookNPCSheet = function(id) {
    // npcname
    if (getAttrByName(id, "npcname") == "") {
      throw "Undefined name";
    };
    // npcsize
    if (!dnd35.size_categories().includes(getAttrByName(id, "npcsize").toLowerCase())) {
      throw "Invalid size= '"+getAttrByName(id, "npcsize")+"'";
    };
    // npctype
    {
      var npctype = getAttrByName(id, "npctype");
      let result = npctype.match(/^([a-z ]+)(\([a-z ,]+\)){0,1}$/i)
      //throw "Invalid type= '"+result[1]+','+result[2]+'.'+"'"
      if (result[1] === undefined) {
        throw "Invalid type= '"+npctype+"'";
      };
      var type = trimWhitespace(result[1]);
      if (!dnd35.types().includes(type.toLowerCase())) {
        throw "Invalid type= '"+type+"'";
      };
      if (result[2] !== undefined) {
        trimWhitespace(result[2]).replace(/^\(/, "").replace(/\)$/, "").split(",").forEach(function(subtype) {
          if (!dnd35.subtypes().includes(subtype.toLowerCase())) {
            throw "Invalid subtype= '"+subtype+"'";
          };
        });
      };
    };
    // npchitdie
    {
      var npchitdie = getAttrByName(id, "npchitdie");
      if (!trimWhitespace(npchitdie).replace(/ plus /gi, "+").replace(/ +/g, "").match(/^([+-]{0,1}([0-9]+[-+*/])*[0-9]*d[0-9]+([+-][0-9]+)*)+$/i)) {
        throw "Invalid hitdie= '"+npchitdie+"'";
      };
    };
    //TODO npcinit
    //TODO npcinitmacro
    //TODO npcspeed
    //TODO npcarmorclass
    //TODO npcarmorclassinfo
    //TODO npctoucharmorclass
    //TODO npcflatfootarmorclass
    //TODO npcbaseatt
    //TODO npcgrapple
    //SKIP npcattack
    //SKIP npcattackmacro
    //SKIP npcfullattack
    //SKIP npcfullattackmacro
    //TODO npcspace
    //TODO npcreach
    //SKIP npcspecialattacks
    //SKIP npcspecialqualities
    //TODO npcfortsave
    //TODO npcrefsave
    //TODO npcwillsave
    //TODO npcstr
    //TODO npcstr-mod
    //TODO npcdex
    //TODO npcdex-mod
    //TODO npccon
    //TODO npccon-mod
    //TODO npcint
    //TODO npcint-mod
    //TODO npcwis
    //TODO npcwis-mod
    //TODO npccha
    //TODO npccha-mod
    //TODO npcskills
    //TODO npcfeats
    //TODO npcenv
    //TODO npcorg
    //TODO npccr
    //SKIP npctreasure
    //SKIP npcalignment
    //SKIP npcadv
    //TODO npclvladj
    //SKIP npcdescr
    //SKIP npccombatdescr
  };

  var checkSheetMacros = function(id) {
    for (var i=1; i<=10; i++) {
      var weaponNname = getAttrByName(id, "weapon"+i+"name");
      log(weaponNname);
    };
  };

  var fixMookSheet = function(id) {
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
          case 'NATURAL':
            setAttrByName(id, "naturalarmor1bonus", parseFloat(tokens[0]));
            return;
          case 'DODGE':
            setAttrByName(id, "dodgebonus1bonus", parseFloat(tokens[0]));
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
  };

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
  };

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

    var sendErrorChat = function(str) {
      sendChat("skepickleTokenLib", '/w "'+playerName+'" &{template:default} {{name=ERROR}} {{'+str+'}}', null, {noarchive:true});
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
          if (obj.get("_subtype") != "token") { sendErrorChat("Not a token= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")"); continue; };
          if (obj.get("represents") == "") { sendErrorChat("Not a character= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")"); continue; };
          selected_creatures.push(selected["_id"]);
        } catch(e) {
            sendErrorChat(e);
        };
      };
    };

    switch(userCommand) {
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
                sendErrorChat(e);
              };
            });
          } catch(e) {
            sendErrorChat(e);
          };
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
      case '--fix-mook-sheet':
        selected_creatures.forEach(function(selected) {
            var obj = getObj("graphic", selected);
            var character = getObj("character", obj.get("represents"));
            if (!character) { return; };
            character.get("_defaulttoken", function(token) {
              if (token !== "null") { return; };
              fixMookSheet(character.id);
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
      case '--debug-attribute':
        selected_creatures.forEach(function(selected) {
            var obj = getObj("graphic", selected);
            var character = getObj("character", obj.get("represents"));
            if (!character) { return; };
            var attrib_val = getAttrByName(character.id, first_arg);
            log(first_arg+' attribute for '+character.get("name")+' is = '+attrib_val);
        });
        break;
      case '--roll-initiative':
        //sendChat(playerName, '/w "'+playerName+'" Group Initiative:');
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
              //sendChat(playerName, '/w "'+playerName+'"'+char_name+"->"+(msg[0].inlinerolls[0]["results"]["total"].toFixed(4)));
            });
        });
        break;
      case '--help':
      //  getHelp();
          sendChat(playerName, '/w "'+playerName+'" Test 1 2 3 '+playerName);
          break;
      break;
      case undefined:
      //  getHelp();
      break;
    };
    //getHelp();
  };

  var registerEventHandlers = function() {
    on('add:graphic',  mookTokenFixer);
    on('chat:message', handleInput);
  };

  var checkInstall = function() {
    if ( Boolean(state.skepickleTokenLibImp) === false ) {
      state.skepickleTokenLibImp = {
        info: info,
        config: config
      };
    };
  };

  var initialize = function() {
    temp.campaignLoaded = true;
  };

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
