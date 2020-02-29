// skepickleCharacterSuite

// Purpose: Provide a suite of functionality to improve player and GM experience when using Diana P's D&D 3.5 character sheet.
// ANSI Text Generator: http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow

var skepickleCharacterSuite = skepickleCharacterSuite || (function skepickleCharacterSuiteImp() {
  "use strict";

  const constants = {
    base_command: "!scs",
    pixelsPerFoot: 14,
    rotationStepRate: 500,
    secondsPerRotation: 180,
    millisecondsPerSecond: 1000
  };
  Object.freeze(constants);

  const info_state_template = {
    version: 0.1,
    authorName: "skepickle"
  };
  Object.freeze(info_state_template);

  const config_state_template = {
    // Make these all use Camel-case with first character capitalized.
    DebugLevel: 5,
    InvisibleGraphicURL: '',
    StrictAidAnother: true,
    SourceTexts: ''
  };
  Object.freeze(config_state_template);

  var temp = {
    campaignLoaded: false,
    encounter: {},
    cache: {
      source_text: null
    },
    spinInterval: false
  };

  // SECTION_ANCHOR
  // BIGTEXT "Javascript language utilities"

  function deepFreeze(obj) {
    // Retrieve the property names defined on object
    let propNames = Object.getOwnPropertyNames(obj);
    // Freeze properties before freezing self
    for (let name of propNames) {
      let value = obj[name];
      obj[name] = value && typeof value === "object" ? deepFreeze(value) : value;
    }
    return Object.freeze(obj);
  }; // deepFreeze()

  // SECTION_ANCHOR
  // BIGTEXT "Javascript math utilities"

  // SECTION_ANCHOR
  // ███████╗████████╗██████╗ ██╗███╗   ██╗ ██████╗     ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗███████╗███████╗
  // ██╔════╝╚══██╔══╝██╔══██╗██║████╗  ██║██╔════╝     ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝██║██╔════╝██╔════╝
  // ███████╗   ██║   ██████╔╝██║██╔██╗ ██║██║  ███╗    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║█████╗  ███████╗
  // ╚════██║   ██║   ██╔══██╗██║██║╚██╗██║██║   ██║    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║██╔══╝  ╚════██║
  // ███████║   ██║   ██║  ██║██║██║ ╚████║╚██████╔╝    ╚██████╔╝   ██║   ██║███████╗██║   ██║   ██║███████╗███████║
  // ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝      ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝

  var nonvalue_characters = [""," ","-","֊","־","᠆","‐","‑","‒","–","—","―","⁻","₋","−","⸺","⸻","﹘","﹣","－"];
  Object.freeze(nonvalue_characters);

  function prettyPrint(obj) {
    const stringify = {
      "undefined": x => "undefined",
      "boolean":   x => x.toString(),
      "number":    x => x,
      "string":    x => enquote(x),
      "object":    x => traverse(x),
      "function":  x => x.toString(),
      "symbol":    x => x.toString()
    },
    indent = s => s.replace(/^/mg, "  "),
    keywords = `do if in for let new try var case else enum eval null this true
            void with await break catch class const false super throw while
            yield delete export import public return static switch typeof
            default extends finally package private continue debugger
            function arguments interface protected implements instanceof`
       .split(/\s+/)
       .reduce( (all, kw) => (all[kw]=true) && all, {} ),
    keyify = s => ( !(s in keywords) && /^[$A-Z_a-z][$\w]*$/.test(s) ? s : enquote(s) ) + ": ",
    enquote = s => s.replace(/([\\"])/g, '\\$1').replace(/\n/g,"\\n").replace(/\t/g,"\\t").replace(/^|$/g,'"'),
    traverse = obj =>  [
           `{`,
            indent( Object.keys(obj)
                    .map( k => indent( keyify(k) + stringify[ typeof obj[k] ](obj[k]) ) )
                    .join(",\n")
                    ),
            `}`
        ]
        .filter( s => /\S/.test(s) )
        .join("\n")
        .replace(/^{\s*\}$/,"{}");
    return traverse(obj);
  }

  function stringToTitleCase(str) {
    str = str.toLowerCase().split(' ');
    for (let i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    };
    return str.join(' ');
  }; // stringToTitleCase()

  function stringTrimWhitespace(str) {
    return str.replace(/ +/g, " ").replace(/^ /, "").replace(/ $/, "").replace(/ *, */g, ",");
  }; // stringTrimWhitespace()

  function getStringRegister(str,register) {
    // {register}2|efftype:e|damtype:k|end3|norange|pe|str13|wo1{/register}
    let startPos = str.indexOf("{"  + register + "}");
    let endPos   = str.indexOf("{/" + register + "}");
    if ((startPos == -1) || (endPos == -1)) { return null; };
    return str.substr(startPos+register.length+2, (endPos-startPos)-(register.length+2)).split('|');
  }; // getStringRegister()

  function setStringRegister(str,register,values=null) {
    // {register}2|efftype:e|damtype:k|end3|norange|pe|str13|wo1{/register}
    let startPos = str.indexOf("{"  + register + "}");
    let endPos   = str.indexOf("{/" + register + "}");
    let reg_exp;
    let replacement  = '';
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
  }; // setStringRegister()

  //TODO Can this function rewritten as "function generateUUID()" safely? Experiments needed!
  var generateUUID = (function() {
    "use strict";
    let a = 0, b = [];
    return function() {
      let c = (new Date()).getTime() + 0, d = c === a;
      a = c;
      for (var e = new Array(8), f = 7; 0 <= f; f--) {
        e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
        c = Math.floor(c / 64);
      }
      c = e.join("");
      if (d) {
        for (f = 11; 0 <= f && 63 === b[f]; f--) {
          b[f] = 0;
        }
        b[f]++;
      } else {
        for (f = 0; 12 > f; f++) {
          b[f] = Math.floor(64 * Math.random());
        }
      }
      for (f = 0; 12 > f; f++){
        c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
      }
      return c;
    };
  }());

  function generateRowID() {
    "use strict";
    return generateUUID().replace(/_/g, "Z");
  }; // generateRowID()

  // SECTION_ANCHOR
  // ██████╗    ██╗   ██████╗     ██████╗    ███████╗    ████████╗ █████╗ ██████╗ ██╗     ███████╗███████╗
  // ██╔══██╗   ██║   ██╔══██╗    ╚════██╗   ██╔════╝    ╚══██╔══╝██╔══██╗██╔══██╗██║     ██╔════╝██╔════╝
  // ██║  ██║████████╗██║  ██║     █████╔╝   ███████╗       ██║   ███████║██████╔╝██║     █████╗  ███████╗
  // ██║  ██║██╔═██╔═╝██║  ██║     ╚═══██╗   ╚════██║       ██║   ██╔══██║██╔══██╗██║     ██╔══╝  ╚════██║
  // ██████╔╝██████║  ██████╔╝    ██████╔╝██╗███████║       ██║   ██║  ██║██████╔╝███████╗███████╗███████║
  // ╚═════╝ ╚═════╝  ╚═════╝     ╚═════╝ ╚═╝╚══════╝       ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚══════╝

  var dnd_35_sources = {
    cache_source_texts: function() {
      let enabled_source_texts = state.skepickleCharacterSuiteImp.config.SourceTexts.split(',');
      if (enabled_source_texts.length == 0) {
        throwDefaultTemplate("merge_arrays()",null,{'ERROR': 'No D&D source texts loaded. Please include at least skepickleCharacterSuite_SRD.js in the game.'});
      };
      if (temp.cache.source_text === null) {
        temp.cache.source_text = {};
        for (let k=0; k<enabled_source_texts.length; k++) {
          temp.cache.source_text[enabled_source_texts[k]] = eval('skepickleCharacterSuite_'+enabled_source_texts[k]+'.source_text');
        };
      };
    },
    merge_arrays: function(property_name) {
      this.cache_source_texts();
      let result = [];
      let property_heirarchy = property_name.split('.');
      let enabled_source_texts = state.skepickleCharacterSuiteImp.config.SourceTexts.split(',');
      for (let k=0; k<enabled_source_texts.length; k++) {
        let source_text = temp.cache.source_text[enabled_source_texts[k]];
        if ((typeof source_text !== 'undefined') && (source_text !== null)) {
          let i = 0;
          let property_p = source_text;
          do {
            property_p = property_p[property_heirarchy[i]];
            i++;
          } while ((i < property_heirarchy.length) && (typeof property_p !== 'undefined') && (property_p !== null));
          if ((typeof property_p !== 'undefined') && (property_p !== null)) {
            result = [...new Set([...result ,...property_p])];
          };
        };
      };
      return result;
    },
    merge_maps: function(property_name) {
      this.cache_source_texts();
      let result = {};
      let property_heirarchy = property_name.split('.');
      let enabled_source_texts = state.skepickleCharacterSuiteImp.config.SourceTexts.split(',');
      for (let k=0; k<enabled_source_texts.length; k++) {
        let source_text = temp.cache.source_text[enabled_source_texts[k]];
        if ((typeof source_text !== 'undefined') && (source_text !== null)) {
          let i = 0;
          let property_p = source_text;
          do {
            property_p = property_p[property_heirarchy[i]];
            i++;
          } while ((i < property_heirarchy.length) && (typeof property_p !== 'undefined') && (property_p !== null));
          if ((typeof property_p !== 'undefined') && (property_p !== null)) {
            result = Object.assign({}, result, property_p);
          };
        };
      };
      return result;
    },
    movement_modes:      function() { return this.merge_arrays("movement_modes"); },
    fly_maneuverability: function() { return this.merge_arrays("fly_maneuverability"); },
    size_categories:     function() { return this.merge_arrays("size_categories"); },
    types:               function() { return this.merge_arrays("types"); },
    creature_subtypes:   function() { return this.merge_arrays("subtypes.creature"); },
    humanoid_subtypes:   function() { return this.merge_arrays("subtypes.humanoid"); },
    subtypes:            function() { return [...new Set([...this.creature_subtypes() ,...this.humanoid_subtypes()])]; },
    skills:              function() { return this.merge_maps("skills"); },
    light_sources:       function() { return this.merge_maps("light_sources"); },
    spells:              function() { return this.merge_maps("spells"); },
    spell_ranges:        function() { return this.merge_maps("spell_ranges"); },
    spell:               function(name) { return this.merge_maps("spells.".concat(name)); }
  };

  // SECTION_ANCHOR
  // ██████╗    ██╗   ██████╗     ██████╗    ███████╗    ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗███████╗███████╗
  // ██╔══██╗   ██║   ██╔══██╗    ╚════██╗   ██╔════╝    ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝██║██╔════╝██╔════╝
  // ██║  ██║████████╗██║  ██║     █████╔╝   ███████╗    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║█████╗  ███████╗
  // ██║  ██║██╔═██╔═╝██║  ██║     ╚═══██╗   ╚════██║    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║██╔══╝  ╚════██║
  // ██████╔╝██████║  ██████╔╝    ██████╔╝██╗███████║    ╚██████╔╝   ██║   ██║███████╗██║   ██║   ██║███████╗███████║
  // ╚═════╝ ╚═════╝  ╚═════╝     ╚═════╝ ╚═╝╚══════╝     ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝

  function abilityScoreToMod(score) {
    if (isNaN(score)) { return 0; };
    return Math.floor((score-10.0)/2.0);
  }; // abilityScoreToMod()

  function abilityScoreToBonusSpells(score, spelllevel) {
    if (isNaN(score))  { return 0; };
    if (spelllevel==0) { return 0; };
    return Math.max(0,Math.ceil((1.0+abilityScoreToMod(score)-spelllevel/4.0)));
  }; // abilityScoreToBonusSpells()

  function abilityScoreToBonusPowers(score, classlevel) {
    if (isNaN(score)) { return 0; };
    return Math.floor((abilityScoreToMod(score)*classlevel)/2.0);
  }; // abilityScoreToBonusPowers()

  function sizeToMod(size) {
    if (size == null) { log("null size"); throw "{{error}}"; };
    if (!dnd_35_sources.size_categories().includes(size.toLowerCase())) { log("error"); throw "{{error}}"; };
    switch (size.toLowerCase()) {
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
  }; // sizeToMod()

  function sizeToGrappleMod(size) {
    if (isNaN(size)) {
      size = sizeToMod(size);
    };
    switch (size) {
      case  8: return -16;
      case  4: return -12;
      case  2: return -8;
      case  1: return -4;
      case  0: return 0;
      case -1: return 4;
      case -2: return 8;
      case -4: return 12;
      case -8: return 16;
    };
  }; // sizeToGrappleMod()

  // DEPRECATED:
  //function sizeToArmorClassMod(size) {
  //  if (!dnd_35_sources.size_categories().includes(size.toLowerCase())) { log("error"); throw "{{error}}"; };
  //  switch (size.toLowerCase()) {
  //    case "fine":       return 8;
  //    case "diminutive": return 4;
  //    case "tiny":       return 2;
  //    case "small":      return 1;
  //    case "medium":     return 0;
  //    case "large":      return -1;
  //    case "huge":       return -2;
  //    case "gargantuan": return -4;
  //    case "colossal":   return -8;
  //  };
  //}; // sizeToArmorClassMod()

  function sizeModToTallReach(size) {
    //log("sizeModToTallReach('"+size+"')");
    if (isNaN(size)) {
      size = sizeToMod(size);
    };
    switch (size) {
      case  8: return 0;
      case  4: return 0;
      case  2: return 0;
      case  1: return 5;
      case  0: return 5;
      case -1: return 10;
      case -2: return 15;
      case -4: return 20;
      case -8: return 30;
    };
  }; // sizeModToTallReach()

  function sizeModToLongReach(size) {
    if (isNaN(size)) {
      size = sizeToMod(size);
    };
    switch (size) {
      case  8: return 0;
      case  4: return 0;
      case  2: return 0;
      case  1: return 5;
      case  0: return 5;
      case -1: return 5;
      case -2: return 10;
      case -4: return 15;
      case -8: return 20;
    };
  }; // sizeModToLongReach()

  function getSkillSpecification(skillString) {
    if ((typeof skillString === 'undefined') || (skillString === null)) { return null; };
    skillString = stringTrimWhitespace(skillString);
    let skills = dnd_35_sources.skills();
    let skillString__lc = skillString.toLowerCase();
    if ((skillString__lc in skills) && (skills[skillString__lc] !== null)) {
      return skills[skillString__lc];
    };
    let match_result = skillString.match(/^([^(]+)(\(.+\)){0,1}$/i);
    if (typeof match_result[1] === 'undefined') { return null; };
    let skill_name = stringTrimWhitespace(match_result[1]);
    let skill_name__lc = skill_name.toLowerCase();
    if (skill_name == '') { return null; }
    if (typeof match_result[2] === 'undefined') {
      if (skill_name__lc in skills) {
        return skills[skill_name__lc];
      } else {
        return null;
      };
    } else {
      skill_name = skill_name+'()';
      skill_name__lc = skill_name.toLowerCase();
      if (skill_name__lc in skills) {
        return Object.assign({}, skills[skill_name__lc], { sub: stringTrimWhitespace(match_result[2].replace(/^\(/, '').replace(/\)$/, '').toLowerCase()) });
      } else {
        return null;
      };
    };
  }; // getSkillSpecification()

//  MAYBE DEPRECATED:
//  function calculateEncounterLevel(encounter_crs) {
//    let crs = Object.assign({}, encounter_crs);
//    let roundLastCR = function(lastCR) {
//      if (lastCR === "1/2") { return 1; }
//      if (lastCR.match(/^1\//)) { return 0; }
//      return parseInt(lastCR);
//    };
//    // Use http://archive.wizards.com/default.asp?x=dnd/dnd/20010320b
//    if ((Array.from(Object.keys(crs)).length == 1) && (crs[Array.from(Object.keys(crs))[0]] == 1)) { return roundLastCR(Array.from(Object.keys(crs))[0]);};
//    for (let cr in crs) {
//      if (crs[cr] === null) { delete crs[cr]; };
//    };
//    // CR 1/10
//    //log(crs);
//    //log("CR 1/10");
//    if ("1/10" in crs) {
//      while (crs["1/10"] > 10) {
//        crs["1/10"] -= 10;
//        crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//      };
//      switch (crs["1/10"]) {
//        case 2: crs["1/8"] = ("1/8" in crs)?(crs["1/8"]+1):(1);
//                delete crs["1/10"];
//                break;
//        case 3: crs["1/6"] = ("1/6" in crs)?(crs["1/6"]+1):(1);
//                delete crs["1/10"];
//                break;
//        case 4: crs["1/4"] = ("1/4" in crs)?(crs["1/4"]+1):(1);
//                delete crs["1/10"];
//                break;
//        case 5:
//        case 6: crs["1/3"] = ("1/3" in crs)?(crs["1/3"]+1):(1);
//                delete crs["1/10"];
//                break;
//        case 7:
//        case 8: crs["1/2"] = ("1/2" in crs)?(crs["1/2"]+1):(1);
//                delete crs["1/10"];
//                break;
//        case 9:
//        case 10:
//                crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//                delete crs["1/10"];
//                break;
//      };
//    };
//    if ((Array.from(Object.keys(crs)).length == 1) && (crs[Array.from(Object.keys(crs))[0]] == 1)) { return roundLastCR(Array.from(Object.keys(crs))[0]);};
//    // CR 1/8
//    //log(crs);
//    //log("CR 1/8");
//    if ("1/8" in crs) {
//      while (crs["1/8"] > 8) {
//        crs["1/8"] -= 8;
//        crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//      };
//      switch (crs["1/8"]) {
//        case 2: crs["1/6"] = ("1/6" in crs)?(crs["1/6"]+1):(1);
//                delete crs["1/8"];
//                break;
//        case 3: crs["1/4"] = ("1/4" in crs)?(crs["1/4"]+1):(1);
//                delete crs["1/8"];
//                break;
//        case 4: crs["1/3"] = ("1/3" in crs)?(crs["1/3"]+1):(1);
//                delete crs["1/8"];
//                break;
//        case 5:
//        case 6: crs["1/2"] = ("1/2" in crs)?(crs["1/2"]+1):(1);
//                delete crs["1/8"];
//                break;
//        case 7:
//        case 8: crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//                delete crs["1/8"];
//                break;
//      };
//    };
//    if ((Array.from(Object.keys(crs)).length == 1) && (crs[Array.from(Object.keys(crs))[0]] == 1)) { return roundLastCR(Array.from(Object.keys(crs))[0]);};
//    // CR 1/6
//    //log(crs);
//    //log("CR 1/6");
//    if ("1/6" in crs) {
//      while (crs["1/6"] > 6) {
//        crs["1/6"] -= 6;
//        crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//      };
//      switch (crs["1/6"]) {
//        case 2: crs["1/4"] = ("1/4" in crs)?(crs["1/4"]+1):(1);
//                delete crs["1/6"];
//                break;
//        case 3: crs["1/3"] = ("1/3" in crs)?(crs["1/3"]+1):(1);
//                delete crs["1/6"];
//                break;
//        case 4: crs["1/2"] = ("1/2" in crs)?(crs["1/2"]+1):(1);
//                delete crs["1/6"];
//                break;
//        case 5:
//        case 6: crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//                delete crs["1/6"];
//                break;
//      };
//    };
//    if ((Array.from(Object.keys(crs)).length == 1) && (crs[Array.from(Object.keys(crs))[0]] == 1)) { return roundLastCR(Array.from(Object.keys(crs))[0]);};
//    // CR 1/4
//    //log(crs);
//    //log("CR 1/4");
//    if (("1/8" in crs) && ("1/10" in crs)) {
//      crs["1/4"] = ("1/4" in crs)?(crs["1/4"]+1):(1);
//      crs["1/8"] -= 1;
//      crs["1/10"] -= 1;
//      if (crs["1/8"] == 0) { delete crs["1/8"]; };
//      if (crs["1/10"] == 0) { delete crs["1/10"]; };
//    };
//    if ("1/10" in crs) {
//      // At this point, CR of 1/10 won't contribute to anything higher.
//      delete crs["1/10"];
//    };
//    if ("1/4" in crs) {
//      while (crs["1/4"] > 4) {
//        crs["1/4"] -= 4;
//        crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//      };
//      switch (crs["1/4"]) {
//        case 2: crs["1/2"] = ("1/2" in crs)?(crs["1/2"]+1):(1);
//               delete crs["1/4"];
//               break;
//        case 3:
//        case 4: crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//               delete crs["1/4"];
//               break;
//      };
//    };
//    if ((Array.from(Object.keys(crs)).length == 1) && (crs[Array.from(Object.keys(crs))[0]] == 1)) { return roundLastCR(Array.from(Object.keys(crs))[0]);};
//    // CR 1/3
//    //log(crs);
//    //log("CR 1/3");
//    if (("1/6" in crs) && ("1/8" in crs)) {
//      crs["1/3"] = ("1/3" in crs)?(crs["1/3"]+1):(1);
//      crs["1/6"] -= 1;
//      crs["1/8"] -= 1;
//      if (crs["1/6"] == 0) { delete crs["1/6"]; };
//      if (crs["1/8"] == 0) { delete crs["1/8"]; };
//    };
//    if ("1/8" in crs) {
//      // At this point, CR of 1/8 won't contribute to anything higher.
//      delete crs["1/8"];
//    };
//    if (("1/4" in crs) && ("1/6" in crs)) {
//      crs["1/3"] = ("1/3" in crs)?(crs["1/3"]+1):(1);
//      crs["1/4"] -= 1;
//      crs["1/6"] -= 1;
//      if (crs["1/4"] == 0) { delete crs["1/4"]; };
//      if (crs["1/6"] == 0) { delete crs["1/6"]; };
//    };
//    if ("1/6" in crs) {
//      // At this point, CR of 1/6 won't contribute to anything higher.
//      delete crs["1/6"];
//    };
//    if ("1/3" in crs) {
//      while (crs["1/3"] > 3) {
//        crs["1/3"] -= 3;
//        crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//      };
//      switch (crs["1/3"]) {
//        case 2:
//        case 3: crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//                delete crs["1/3"];
//                break;
//      };
//    };
//    if ((Array.from(Object.keys(crs)).length == 1) && (crs[Array.from(Object.keys(crs))[0]] == 1)) { return roundLastCR(Array.from(Object.keys(crs))[0]);};
//    // CR 1/2
//    //log(crs);
//    //log("CR 1/2");
//    if (("1/3" in crs) && ("1/4" in crs)) {
//      crs["1/2"] = ("1/2" in crs)?(crs["1/2"]+1):(1);
//      crs["1/3"] -= 1;
//      crs["1/4"] -= 1;
//      if (crs["1/3"] == 0) { delete crs["1/3"]; };
//      if (crs["1/4"] == 0) { delete crs["1/4"]; };
//    };
//    if ("1/4" in crs) {
//      // At this point, CR of 1/4 won't contribute to anything higher.
//      delete crs["1/4"];
//    };
//    if ("1/2" in crs) {
//      while (crs["1/2"] > 2) {
//        crs["1/2"] -= 2;
//        crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//      };
//      switch (crs["1/2"]) {
//        case 2: crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//                delete crs["1/2"];
//                break;
//      };
//    };
//    if ((Array.from(Object.keys(crs)).length == 1) && (crs[Array.from(Object.keys(crs))[0]] == 1)) { return roundLastCR(Array.from(Object.keys(crs))[0]);};
//    // CR 1
//    //log(crs);
//    //log("CR 1");
//    if (("1/2" in crs) && ("1/3" in crs)) {
//      crs["1"] = ("1" in crs)?(crs["1"]+1):(1);
//      crs["1/2"] -= 1;
//      crs["1/3"] -= 1;
//      if (crs["1/2"] == 0) { delete crs["1/2"]; };
//      if (crs["1/3"] == 0) { delete crs["1/3"]; };
//    };
//    if ("1/3" in crs) {
//      // At this point, CR of 1/3 won't contribute to anything higher.
//      delete crs["1/3"];
//    };
//    if ("1" in crs) {
//      while (crs["1"] > 2) {
//        crs["1"] -= 2;
//        crs["2"] = ("2" in crs)?(crs["2"]+1):(1);
//      };
//      switch (crs["1"]) {
//        case 2: crs["2"] = ("2" in crs)?(crs["2"]+1):(1);
//                delete crs["1"];
//                break;
//      };
//    };
//    if ((Array.from(Object.keys(crs)).length == 1) && (crs[Array.from(Object.keys(crs))[0]] == 1)) { return roundLastCR(Array.from(Object.keys(crs))[0]);};
//    // CR 2
//    //log(crs);
//    //log("CR 2");
//    if (("1" in crs) && ("1/2" in crs)) {
//      crs["2"] = ("2" in crs)?(crs["2"]+1):(1);
//      crs["1"] -= 1;
//      crs["1/2"] -= 1;
//      if (crs["1"] == 0) { delete crs["1"]; };
//      if (crs["1/2"] == 0) { delete crs["1/2"]; };
//    };
//    if ("1/2" in crs) {
//      // At this point, CR of 1/2 won't contribute to anything higher.
//      delete crs["1/2"];
//    };
//    if ((Array.from(Object.keys(crs)).length == 1) && (crs[Array.from(Object.keys(crs))[0]] == 1)) { return roundLastCR(Array.from(Object.keys(crs))[0]);};
//    // WOOHOO!! ALL FRACTIONAL CRs ARE DELETED NOW!!
//    let cMaxCR = 1;
//    let cMinCR = 0;
//    do {
//      if (cMaxCR > Math.max(Array.from(Object.keys(crs)))) {
//        log("Looking for CR that's higher than highest CR in list!");
//        break;
//      };
//      cMaxCR += 1;
//      //log(crs);
//      //log("CR "+cMaxCR);
//      // Find starting point for current CR being calculated
//      switch (cMaxCR) {
//        case 2:
//        case 3: cMinCR = 1;
//                break;
//        case 6: cMinCR = 2;
//                break;
//        default:
//                cMinCR = cMaxCR - 3;
//                break;
//      };
//      // Delete any CRs that are lower than the starting point, since they will not ever combine up to higher forms that could bump overall encounter level
//      let crs_keys = Array.from(Object.keys(crs));
//      for (let i = 0; i < crs_keys.length; i++) {
//        if (parseInt(crs_keys[i]) < cMinCR) {
//          delete crs[crs_keys[i]];
//        };
//      };
//      // Find Mixed Pairs and bump up CR by one
//      if (cMaxCR.toString() in crs) {
//        for (let curCR = cMinCR; curCR < cMaxCR; curCR++) {
//          while ((crs[cMaxCR.toString()] > 0) && (curCR.toString() in crs) && (crs[curCR.toString()] > 0)) {
//            crs[(cMaxCR+1).toString()] = ((cMaxCR+1).toString() in crs)?(crs[(cMaxCR+1).toString()]+1):(1);
//            crs[curCR.toString()]  -= 1;
//            crs[cMaxCR.toString()] -= 1;
//            if (crs[curCR.toString()] == 0) {
//              delete crs[curCR.toString()];
//            };
//          };
//          if (crs[cMaxCR.toString()] == 0) {
//            delete crs[cMaxCR.toString()];
//            break;
//          };
//        };
//      };
//      // If cMaxCR > 6, then delete and CRs that are equal to the starting point, since they will not ever combine up to higher forms that could bump overall encounter level
//      if ((cMaxCR > 6) && (cMinCR.toString() in crs)) {
//        delete crs[cMinCR.toString()];
//      };
//      // Find CR sets-of-ten and bump up CR by seven
//      while ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] >= 10)) {
//        crs[cMaxCR.toString()] -= 10;
//        crs[(cMaxCR+7).toString()] = ((cMaxCR+7).toString() in crs)?(crs[(cMaxCR+7).toString()]+1):(1);
//      };
//      if ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] == 0)) {
//        delete crs[cMaxCR.toString()];
//      };
//      // Find CR sets-of-seven and bump up CR by six
//      while ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] >= 7)) {
//        crs[cMaxCR.toString()] -= 7;
//        crs[(cMaxCR+6).toString()] = ((cMaxCR+6).toString() in crs)?(crs[(cMaxCR+6).toString()]+1):(1);
//      };
//      if ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] == 0)) {
//        delete crs[cMaxCR.toString()];
//      };
//      // Find CR sets-of-five and bump up CR by five
//      while ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] >= 5)) {
//        crs[cMaxCR.toString()] -= 5;
//        crs[(cMaxCR+5).toString()] = ((cMaxCR+5).toString() in crs)?(crs[(cMaxCR+5).toString()]+1):(1);
//      };
//      if ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] == 0)) {
//        delete crs[cMaxCR.toString()];
//      };
//      // Find CR sets-of-four and bump up CR by four
//      while ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] >= 4)) {
//        crs[cMaxCR.toString()] -= 4;
//        crs[(cMaxCR+4).toString()] = ((cMaxCR+4).toString() in crs)?(crs[(cMaxCR+4).toString()]+1):(1);
//      };
//      if ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] == 0)) {
//        delete crs[cMaxCR.toString()];
//      };
//      // Find CR sets-of-three and bump up CR by three
//      while ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] >= 3)) {
//        crs[cMaxCR.toString()] -= 3;
//        crs[(cMaxCR+3).toString()] = ((cMaxCR+3).toString() in crs)?(crs[(cMaxCR+3).toString()]+1):(1);
//      };
//      if ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] == 0)) {
//        delete crs[cMaxCR.toString()];
//      };
//      // Find CR doubles and bump up CR by two
//      while ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] > 1)) {
//        crs[cMaxCR.toString()] -= 2;
//        crs[(cMaxCR+2).toString()] = ((cMaxCR+2).toString() in crs)?(crs[(cMaxCR+2).toString()]+1):(1);
//      };
//      if ((cMaxCR.toString() in crs) && (crs[cMaxCR.toString()] == 0)) {
//        delete crs[cMaxCR.toString()];
//      };
//    } while ((Array.from(Object.keys(crs)).length > 1) || (crs[Array.from(Object.keys(crs))[0]] > 1));
//    //log(crs);
//    return Array.from(Object.keys(crs))[0];
//  }; // calculateEncounterLevel()

  const encounterCalculator = function(party,challengers=null) {
    //http://www.d20srd.org/extras/d20encountercalculator/encounterCalculator.js

    var aTreasure = [300, 600, 900, 1200, 1600, 2000, 2600, 3400, 4500, 5800, 7500, 9800, 13000, 17000, 22000, 28000, 36000, 47000, 61000, 80000, 87000, 96000, 106000, 116000, 128000, 141000, 155000, 170000, 187000, 206000, 227000, 249000, 274000, 302000, 332000, 365000, 401000, 442000, 486000, 534000];

    function mFilterInputLevels(strX) {
      if (strX == "1/2") return 1/2;
      if (strX == "1/3") return 1/3;
      if (strX == "1/4") return 1/4;
      if (strX == "1/6") return 1/6;
      if (strX == "1/8") return 1/8;
      if (strX == "1/10") return 1/10;
      return parseFloat(strX);
    };

    function RoundOnePlace(x) {
      return Math.round(x * 10) / 10;
    };

    function Log2(x) {
      return Math.LOG2E * Math.log(x);
    };

    function mCRtoPL(x) {
      var iReturn = 0;
      if (x < 2) iReturn = x;
      else iReturn = Math.pow(2, (x/ 2));
      return iReturn;
    };

    function mPLtoCR(x) {
      var iReturn = 0;
      if (x < 2) iReturn = x;
      else iReturn = 2 * Log2(x);
      return iReturn;
    };

    function mDifference(x, y) {
      return 2 * (Log2(x) - Log2(y));
    };

    function mDifficulty(x) {
      var strReturn = "Unknown";
      if (x < -9) strReturn = "Trivial";
      else if (x < -4) strReturn = "Very Easy";
      else if (x <  0) strReturn = "Easy";
      else if (x <= 0) strReturn = "Challenging";
      else if (x <= 4) strReturn = "Very Difficult";
      else if (x <= 7) strReturn = "Overpowering";
      else strReturn = "Unbeatable";
      return strReturn;
    };

    function mPercentEnc(x) {
      var strReturn = "Unknown";
      if (x < -4) strReturn = "0%";
      else if (x <  0) strReturn = "10%";
      else if (x <= 0) strReturn = "50%";
      else if (x <= 4) strReturn = "15%";
      else if (x <= 7) strReturn = "5%";
      else strReturn = "0%";
      return strReturn;
    };

    function mPercentEncs(x) {
    // What percentage of an adventures encounters should be at this EL.
      var p=0;
      if (x < 0) p = 50 + (x * 20);
      else if (x > 5) p = 15 - ((x-5) * 5);
      else p = 50 - (x * 7);

      if (x <=8 && x > 5 && p <=2) p = 2; // special case guess.
      if (p < 0) p = 0;

      p = Math.round(p); // smooth it out a bit.
      return p +"%";
    };

    function mEven(x) {
      var iReturn = 2 * parseInt(x/2);
      if (x < iReturn) iReturn += -2;
      else if (x > iReturn) iReturn += 2;
      return iReturn;
    };

    function mExperience(x, y) {
      // x = PClevel y = monsterlevel
      var iReturn = 0;
      if (x < 3) x = 3;
      if ((x <= 6) && (y <= 1)) iReturn = 300 * y;
      else if (y < 1) iReturn = 0;

      // This formula looks nice, but 3.5 doesn't follow a smooth formula like 3.0 did.
      else iReturn = 6.25 * x * ( Math.pow(2,mEven(7- (x-y) ) /2) ) * ( 11-(x-y) - mEven(7-(x-y)) );

      // Below catches places where the formula fails for 3.5.
      if ((y == 4) || (y == 6) || (y == 8) || (y == 10) || (y == 12) ||
        (y == 14) ||(y == 16) ||(y == 18) ||(y == 20))
      {
        if (x <= 3) iReturn = 1350 * Math.pow(2,(y-4)/2);
        else if (x == 5 && y >= 6) iReturn = 2250 * Math.pow(2,(y-6)/2);
        else if (x == 7 && y >= 8) iReturn = 3150 * Math.pow(2,(y-8)/2);
        else if (x == 9 && y >= 10) iReturn = 4050 * Math.pow(2,(y-10)/2);
        else if (x == 11 && y >= 12) iReturn = 4950 * Math.pow(2,(y-12)/2);
        else if (x == 13 && y >= 14) iReturn = 5850 * Math.pow(2,(y-14)/2);
        else if (x == 15 && y >= 16) iReturn = 6750 * Math.pow(2,(y-16)/2);
        else if (x == 17 && y >= 18) iReturn = 7650 * Math.pow(2,(y-18)/2);
        else if (x == 19 && y >= 20) iReturn = 8550 * Math.pow(2,(y-20)/2);
      }
      if ((y == 7) || (y == 9) || (y == 11) || (y == 13) || (y == 15) ||
        (y == 17) ||(y == 19))
      {
        if (x == 6) iReturn = 2700 * Math.pow(2,(y-7)/2);
        if (x == 8 && y >= 9) iReturn = 3600 * Math.pow(2,(y-9)/2);
        if (x == 10 && y >= 11) iReturn = 4500 * Math.pow(2,(y-11)/2);
        if (x == 12 && y >= 13) iReturn = 5400 * Math.pow(2,(y-13)/2);
        if (x == 14 && y >= 15) iReturn = 6300 * Math.pow(2,(y-15)/2);
        if (x == 16 && y >= 17) iReturn = 7200 * Math.pow(2,(y-17)/2);
        if (x == 18 && y >= 19) iReturn = 8100 * Math.pow(2,(y-19)/2);
      }

      if (y > 20) iReturn = 2 * mExperience(x, y-2);
      // recursion should end this in short order.
      // This method is clean, and ensures any errors in the above
      // formulas for 3.5 are accounted for.

      // Finally we correct for out of bounds entries, doing this last to cut space on the
      // above formulas.
      if (x - y > 7) iReturn = 0;
      else if (y - x > 7) iReturn = 0;

      return iReturn;
    };

    function mTreasure(x) {
      if (x > 40) x = 40; // Not a clean solution. But no idea what ELs above 20 should give.
      let x2 = parseInt(x);
      let iReturn;
      if (x < 1) iReturn = x * aTreasure[0];
      else if (x > x2) iReturn = aTreasure[x2-1] + (x-x2) * (aTreasure[x2] - aTreasure[x2-1]);
      else iReturn = aTreasure[x2-1];

      return iReturn;
    };

    function xDy(x,y) {
      return xDyPz(x,y,0);
    };

    function xDyPz(x,y,z) {
      //alert (x+"d"+y+"+"+z);
      for (x; x > 0; x--)
      {
        z += Math.round(Math.random() * y);
        //alert("X: "+x+" Z: "+z);
      }
      //alert ("Z: "+z);
      return z;
    };

    if ((challengers === null) && (typeof party === 'string')) {
      return Math.round(mPLtoCR(mCRtoPL(mFilterInputLevels(party))*4)).toString();
    } else {
      let iPartyTotalPower = 0;
      for (let level in party.counts) {
        iPartyTotalPower += party.counts[level] * mCRtoPL(mFilterInputLevels(level));
      };
      iPartyTotalPower = iPartyTotalPower / 4;
      let iPartyEffectiveLevel = mPLtoCR(iPartyTotalPower);

      let iCount = 0;
      let iPartyTotal = 0;
      for (let level in party.counts) {
        iPartyTotal += party.counts[level];
        iCount      += party.counts[level] * mFilterInputLevels(level);
      };
      let iPartyAverageLevel = iCount / iPartyTotal;

      let iMonsterTotalPower = 0;
      for (let level in challengers.counts) {
        iMonsterTotalPower += challengers.counts[level] * mCRtoPL(mFilterInputLevels(level));
      };
      let iMonsterTotalLevel = mPLtoCR(iMonsterTotalPower);
      var iDifference = mDifference(iMonsterTotalPower, iPartyTotalPower);

      let iCRExperience = {};
      for (let p_level in party.counts) {
        let iMonsterExperience = {};
        let iMonsterTotalExperience = 0;
        for (let c_level in challengers.counts) {
          iMonsterExperience[c_level] = challengers.counts[c_level] * mExperience(mFilterInputLevels(p_level), mFilterInputLevels(c_level));
          iMonsterTotalExperience  += iMonsterExperience[c_level];
        };
        iCRExperience[p_level] = Math.round(iMonsterTotalExperience / iPartyTotal);
      };

      let party_id_xp = {};
      for (let c_level in party.ids) {
        for (let i=0; i<party.ids[c_level].length; i++) {
          party_id_xp[party.ids[c_level][i]] = c_level;
        };
      };
      for (let id in party_id_xp) {
        party_id_xp[id] = iCRExperience[party_id_xp[id]];
      };

      return {
        xp: party_id_xp,
        pl: RoundOnePlace(iPartyEffectiveLevel),
        el: Math.round(iMonsterTotalLevel),
        difficulty: mDifficulty(iDifference),
        percentenc: mPercentEnc(iDifference),
        treasure: RoundOnePlace(mTreasure(iMonsterTotalLevel))
      };
    };
  }; // encounterCalculator()

  function durationToRounds(str) {
    let match_result = str.match(/([0-9]+) *(round|minute|hour|day|week|month|year){0,1}s{0,1}/);
    if ((match_result) && (typeof match_result[1] !== 'undefined')) {
      let numb = parseInt(match_result[1]);
      let unit = (typeof match_result[2] !== 'undefined')?(match_result[2]):('round');
      switch (unit) {
        case 'year':
          numb = numb * 12;
        case 'month':
          numb = numb * 4;
        case 'week':
          numb = numb * 7;
        case 'day':
          numb = numb * 24;
        case 'hour':
          numb = numb * 60;
        case 'minute':
          numb = numb * 10;
      };
      return numb;
    };
    return -1;
  }; // durationToRounds()

  // SECTION_ANCHOR
  // ██████╗  ██████╗ ██╗     ██╗     ██████╗  ██████╗     ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗███████╗███████╗
  // ██╔══██╗██╔═══██╗██║     ██║     ╚════██╗██╔═████╗    ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝██║██╔════╝██╔════╝
  // ██████╔╝██║   ██║██║     ██║      █████╔╝██║██╔██║    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║█████╗  ███████╗
  // ██╔══██╗██║   ██║██║     ██║     ██╔═══╝ ████╔╝██║    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║██╔══╝  ╚════██║
  // ██║  ██║╚██████╔╝███████╗███████╗███████╗╚██████╔╝    ╚██████╔╝   ██║   ██║███████╗██║   ██║   ██║███████╗███████║
  // ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝      ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝
  //  ██████╗ ███████╗███╗   ██╗███████╗██████╗  █████╗ ██╗
  // ██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔══██╗██╔══██╗██║
  // ██║  ███╗█████╗  ██╔██╗ ██║█████╗  ██████╔╝███████║██║
  // ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██╗██╔══██║██║
  // ╚██████╔╝███████╗██║ ╚████║███████╗██║  ██║██║  ██║███████╗
  //  ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝

  function escapeRoll20Macro(str) {
    return str.toString()
              .replace(/\&/g,  "&amp;")
              .replace(/\#/g,  "&#35;")
              .replace(/\@{/g, "&#64;{")
              .replace(/\%{/g, "&#37;{")
              .replace(/\?{/g, "&#63;{")
              .replace(/\[\[/g,"&#91;&#91;")
              .replace(/\{\{/g,"&#123;&#123;")
              .replace(/\]\]/g,"&#93;&#93;")
              .replace(/\}\}/g,"&#125;&#125;");
  }; // escapeRoll20Macro()

  function createChatButton(label, content) {
    let escaped_content = content.replace(/\:/g,  '&#58;')
                                 .replace(/\&/g,  '&amp;')
                                 .replace(/\)/g,  '&#41;')
                                 .replace(/\*/g,  '&#42;')
                                 .replace(/\`\`/g,"&#96;&#96;")
                                 .replace(/\[\[/g,"&#91;&#91;")
                                 .replace(/\{\{/g,"&#123;&#123;")
                                 .replace(/\]\]/g,"&#93;&#93;")
                                 .replace(/\}\}/g,"&#125;&#125;");
    return ''.concat('[',label,'](!&#13;',escaped_content,')');
  }; // createChatButton()

  function createEscapedChatButton(label, content) {
    let escaped_content = content.replace(/\:/g,  '&#58;')
                                 .replace(/\&/g,  '&amp;')
                                 .replace(/\#/g,  "&#35;")
                                 .replace(/\)/g,  '&#41;')
                                 .replace(/\*/g,  '&#42;')
                                 .replace(/\@{/g, "&#64;{")
                                 .replace(/\%{/g, "&#37;{")
                                 .replace(/\?{/g, "&#63;{")
                                 .replace(/\`\`/g,"&#96;&#96;")
                                 .replace(/\[\[/g,"&#91;&#91;")
                                 .replace(/\{\{/g,"&#123;&#123;")
                                 .replace(/\]\]/g,"&#93;&#93;")
                                 .replace(/\}\}/g,"&#125;&#125;");
    return ''.concat('[',label,'](!&#13;',escaped_content,')');
  }; // createEscapedChatButton()

  function decodeRoll20String(str) {
    str = str.toString();
    str = decodeURI(str);
    str = str.replace(/%3A/g, ':');
    str = str.replace(/%23/g, '#');
    str = str.replace(/%3F/g, '?');
    return str;
  }; // decodeRoll20String()

  function renderDefaultTemplate(scope, id, fields) {
    let str = ''.concat("&{template:default} {{name=",scope,"}}");
    if (id !== null) {
      let character = getObj("character", id);
      str = str.concat(" {{Token= [image](",character.get("avatar").replace(new RegExp("\\?.*$"), ""),")}} {{Name= ",getAttrByName(id, "character_name"),"}}");
    };
    for (let k in fields) {
      str = str.concat(" {{"+k+"= "+escapeRoll20Macro(fields[k])+"}}");
    };
    return str;
  }; // renderDefaultTemplate()

  function throwDefaultTemplate(scope, id, fields) {
    throw renderDefaultTemplate(scope, id, fields);
  }; // throwDefaultTemplate()

  function respondToChat(msg,str,noArchive=true) {
    let playerName = msg.who;
    if (playerIsGM(msg.playerid)) { playerName = playerName.replace(new RegExp(" \\(GM\\)$"), "") };
    sendChat("skepickleCharacterSuite", '/w "'+playerName+'" '+str, null, {noarchive:noArchive});
  }; // respondToChat()

  function getSelectedTokenIDs(msg) {
    let ids=[];
    if (msg.selected) {
      for (let selected of msg.selected) {
        try {
          if (selected["_type"] != "graphic") { continue; }; // Silently skip over selected non-graphics
          let obj = getObj("graphic", selected["_id"]);
          if ((typeof obj !== 'undefined') && (obj !== null)) {
            if (obj.get("_subtype") != "token") {
              respondToChat(msg,"&{template:default} {{name=ERROR}} {{Not a token= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")}}");
              continue;
            };
            if (obj.get("represents") != "") {
              let character = getObj("character", obj.get("represents"));
              if (!getAttrByName(character.id, "character_sheet").match(/D&D3.5 v[\.0-9]*/)) {
                respondToChat(msg,"&{template:default} {{name=ERROR}} {{Not a D&D3.5 character= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")}}");
                continue;
              };
            };
            ids.push(selected["_id"]);
          };
        } catch(e) {
          respondToChat(msg,e);
        };
      };
    };
    return ids;
  }; // getSelectedTokenIDs()

  // SECTION_ANCHOR
  // ██████╗  ██████╗ ██╗     ██╗     ██████╗  ██████╗     ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗███████╗███████╗
  // ██╔══██╗██╔═══██╗██║     ██║     ╚════██╗██╔═████╗    ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝██║██╔════╝██╔════╝
  // ██████╔╝██║   ██║██║     ██║      █████╔╝██║██╔██║    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║█████╗  ███████╗
  // ██╔══██╗██║   ██║██║     ██║     ██╔═══╝ ████╔╝██║    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║██╔══╝  ╚════██║
  // ██║  ██║╚██████╔╝███████╗███████╗███████╗╚██████╔╝    ╚██████╔╝   ██║   ██║███████╗██║   ██║   ██║███████╗███████║
  // ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝      ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝
  //  █████╗ ████████╗████████╗██████╗ ██╗██████╗ ██╗   ██╗████████╗███████╗
  // ██╔══██╗╚══██╔══╝╚══██╔══╝██╔══██╗██║██╔══██╗██║   ██║╚══██╔══╝██╔════╝
  // ███████║   ██║      ██║   ██████╔╝██║██████╔╝██║   ██║   ██║   █████╗
  // ██╔══██║   ██║      ██║   ██╔══██╗██║██╔══██╗██║   ██║   ██║   ██╔══╝
  // ██║  ██║   ██║      ██║   ██║  ██║██║██████╔╝╚██████╔╝   ██║   ███████╗
  // ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝    ╚═╝   ╚══════╝

  var isAttrByNameDefined = function(id, attrib) {
    let attribute = findObjs({
        type: 'attribute',
        characterid: id,
        name: attrib
    }, {caseInsensitive: true})[0];
    return !!attribute;
  }; // isAttrByNameDefined

  var isAttrByNameNaN = function(charID, attrib, valueType) {
    valueType = valueType || 'current';
    let val = getAttrByName(charID, attrib, valueType);
    if (typeof val === 'undefined') {
      throw "isAttrByNameNaN() called with undefined attribute"
    };
    return isNaN(val);
  }; // isAttrByNameNaN

  // Implemented internally in Roll20
  //var getAttrByName = function(id, attrib, value_type) { return <a string>; }

  var generateUniqueRowID = function(charid) {
    let rowID;
    let char_attribs = findObjs({
      _type: 'attributes',
      _characterid: charid
    });
    let loop_count = 0;
    while (loop_count <= 10) {
      rowID = generateRowID();
      let re = new RegExp(`^repeating_.*_${rowID}_.*$`);
      if (char_attribs.filter(attribute => attribute.get('name').match(re).length == 0)) { break; };
      loop_count++;
      log(loop_count);
    };
    return rowID;
  }; // generateUniqueRowID

  const getRepeatingSectionRowIDs = function(charid, prefix) {
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
    const unorderedIds = [...new Set(Object.keys(repeatingAttrs).map(n => n.match(regExp))
                                                                .filter(x => !!x)
                                                                .map(a => a[1]))];
    const repRowIds = [...new Set(repOrder.filter(x => unorderedIds.includes(x)).concat(unorderedIds))];
    //log(repeatingAttrs);
    return repRowIds;
  }; // getRepeatingSectionRowIDs

  var setAttrByName = function(id, attrib, value, max=null) {
    //log("setAttrByName("+id+","+attrib+","+value+","+max+")");
    if ((typeof value === 'undefined') || (value === null)) { log("ERROR: setAttrByName called with undefined value = '"+value+"'"); return; };
    let obj = findObjs({
        _type: "attribute",
        _characterid: id,
        name: attrib
    });
    if (obj.length == 0) {
      obj = createObj("attribute", {
        name: attrib,
        current: 10,
        characterid: id
      });
    } else {
      obj = obj[0];
    };
    obj.setWithWorker("current", value);
    if (max) { obj.setWithWorker("max", max); };
  }; // setAttrByName

  // SECTION_ANCHOR
  // ██████╗  ██████╗ ██╗     ██╗     ██████╗  ██████╗     ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗███████╗███████╗
  // ██╔══██╗██╔═══██╗██║     ██║     ╚════██╗██╔═████╗    ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝██║██╔════╝██╔════╝
  // ██████╔╝██║   ██║██║     ██║      █████╔╝██║██╔██║    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║█████╗  ███████╗
  // ██╔══██╗██║   ██║██║     ██║     ██╔═══╝ ████╔╝██║    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║██╔══╝  ╚════██║
  // ██║  ██║╚██████╔╝███████╗███████╗███████╗╚██████╔╝    ╚██████╔╝   ██║   ██║███████╗██║   ██║   ██║███████╗███████║
  // ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝      ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝
  //  ██████╗██╗  ██╗ █████╗ ██████╗  █████╗  ██████╗████████╗███████╗██████╗     ███████╗██╗  ██╗███████╗███████╗████████╗
  // ██╔════╝██║  ██║██╔══██╗██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗    ██╔════╝██║  ██║██╔════╝██╔════╝╚══██╔══╝
  // ██║     ███████║███████║██████╔╝███████║██║        ██║   █████╗  ██████╔╝    ███████╗███████║█████╗  █████╗     ██║
  // ██║     ██╔══██║██╔══██║██╔══██╗██╔══██║██║        ██║   ██╔══╝  ██╔══██╗    ╚════██║██╔══██║██╔══╝  ██╔══╝     ██║
  // ╚██████╗██║  ██║██║  ██║██║  ██║██║  ██║╚██████╗   ██║   ███████╗██║  ██║    ███████║██║  ██║███████╗███████╗   ██║
  //  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝

  var getSkillAttrName = function(id, skill_spec) {
    let skill_attrib = skill_spec.attrib;
    //log("getSkillAttrName()  {");
    //log(skill_spec);
    if (skill_spec.attrib.match(/\#/)) {
      let found_skill = false;
      for (let skillindex=1; skillindex<4; skillindex++) {
        //log("match #: "+skillindex);
        if (getAttrByName(id, skill_spec.attrib.replace(/\#/, ''.concat(skillindex,'name'))).toLowerCase() == skill_spec.sub.toLowerCase()) {
          skill_attrib = skill_spec.attrib.replace(/\#/, ''.concat(skillindex));
          found_skill = true;
          break;
        };
      };
      if (!found_skill) {
        const otherskill_rowids = getRepeatingSectionRowIDs(id, 'repeating_skills');
        found_skill = false;
        otherskill_rowids.forEach( rowID => {
          if (!found_skill) {
            //log("repeating row "+rowID+"...");
            let otherskillname = stringTrimWhitespace(getAttrByName(id, ''.concat('repeating_skills_',rowID,'_otherskillname')).
                                                      replace(/\* *$/,'').
                                                      replace(/ +\(/g,'('));
            //log(otherskillname.toLowerCase() + " vs " + ''.concat(skill_spec.base,"(",skill_spec.sub,")").toLowerCase());
            if (otherskillname.toLowerCase() == ''.concat(skill_spec.base,"(",skill_spec.sub,")")) {
              skill_attrib = ''.concat('repeating_skills_',rowID,'_otherskill');
              found_skill = true;
            };
          };
        });
      };
      if (!found_skill) {
        skill_attrib=dnd_35_sources.skills()[skill_spec.base+'()'].default_ability_mod;
      };
    } else if (skill_spec.attrib == '') {
      const otherskill_rowids = getRepeatingSectionRowIDs(id, 'repeating_skills');
      let found_skill = false;
      otherskill_rowids.forEach( rowID => {
        if (!found_skill) {
          let otherskillname = stringTrimWhitespace(getAttrByName(id, ''.concat('repeating_skills_',rowID,'_otherskillname')).
                                                    replace(/\* *$/,'').
                                                    replace(/ +\(/g,'('));
          //log(otherskillname.toLowerCase() + " vs " + ''.concat(skill_spec.base,"(",skill_spec.sub,")").toLowerCase());
          if (otherskillname.toLowerCase() == ''.concat(skill_spec.base,'(',skill_spec.sub,')').toLowerCase()) {
            skill_attrib = ''.concat('repeating_skills_',rowID,'_otherskill');
            found_skill = true;
          } else if (otherskillname.toLowerCase() == ''.concat(skill_spec.base).toLowerCase()) {
            skill_attrib = ''.concat('repeating_skills_',rowID,'_otherskill');
            found_skill = true;
          };
        };
      });
      if (!found_skill) {
        switch (skill_spec.base) {
          case 'knowledge':
          case 'craft':
          case 'perform':
          case 'profession':
            skill_attrib=dnd_35_sources.skills()[skill_spec.base+'()'].default_ability_mod;
            break;
          case 'speak language':
            skill_attrib=null;
            break;
          default:
            skill_attrib=dnd_35_sources.skills()[skill_spec.base].default_ability_mod;
            break;
        };
      };
    };
    //log("}");
    return skill_attrib;
  }; // getSkillAttrName

  var mookAuditNPCSheet = function(id) {
    // Check all purely numeric fields
    ["npcinit","npcarmorclass","npctoucharmorclass","npcflatfootarmorclass","npcbaseatt","npcfortsave","npcrefsave","npcwillsave","npcstr-mod","npcdex-mod","npccon-mod","npcint-mod","npcwis-mod","npccha-mod"].forEach(function(a) {
      if (isAttrByNameNaN(id, a)) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': a, 'Invalid Value': getAttrByName(id, a)});
      };
    });

    // Check ability & modifiers, which can be a nonabilities
    ["npcstr","npcdex","npccon","npcint","npcwis","npccha"].forEach(function(a) {
      if (isAttrByNameNaN(id, a)) {
        if (!nonvalue_characters.includes(getAttrByName(id, a))) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': a, 'Invalid Value': getAttrByName(id, a)});
        } else {
          if (getAttrByName(id, ''.concat(a,'-mod')) != 0) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': ''.concat(a,'-mod'), 'Invalid Value': getAttrByName(id, ''.concat(a,'-mod')), 'Correct Value': 0});
          };
        };
      } else {
        if (getAttrByName(id, ''.concat(a,'-mod')) != abilityScoreToMod(getAttrByName(id, a))) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': ''.concat(a,'-mod'), 'Invalid Value': getAttrByName(id, ''.concat(a,'-mod')), 'Correct Value': abilityScoreToMod(getAttrByName(id, a))});
        };
      };
    });

    // Check grapple bonus, which can be a nonability
    ["npcgrapple"].forEach(function(a) {
      if (isAttrByNameNaN(id, a)) {
        if (!nonvalue_characters.includes(getAttrByName(id, a))) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': a, 'Invalid Value': getAttrByName(id, a)});
        };
      };
    });

    // npcname
    if (getAttrByName(id, "npcname") == "") {
      throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcname', 'Current Value': '**empty**', 'Correct Value': 'Should not be empty'});
    };
    if (getAttrByName(id, "npcname") != getAttrByName(id, "character_name")) {
      throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcname', 'Error': '**npcname** does not match **character_name**', 'Current Value': getAttrByName(id, "npcname"), 'Should Match': getAttrByName(id, "character_name")});
    };

    // npcsize
    if (!dnd_35_sources.size_categories().includes(getAttrByName(id, "npcsize").toLowerCase())) {
      throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcsize', 'Invalid Value': getAttrByName(id, "npcsize")});
    };

    // npctype
    {
      let npctype = getAttrByName(id, "npctype");
      let result = npctype.match(/^([a-z ]+)(\([a-z ,]+\)){0,1}$/i)
      if ((result === null) || (typeof result[1] === 'undefined')) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npctype', 'Invalid Type Value': npctype});
      };
      let type = stringTrimWhitespace(result[1]);
      if (!dnd_35_sources.types().includes(type.toLowerCase())) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npctype', 'Invalid Type Value': type});
      };
      if (typeof result[2] !== 'undefined') {
        stringTrimWhitespace(result[2]).replace(/^\(/, "").replace(/\)$/, "").split(",").forEach(function(subtype) {
          if (!dnd_35_sources.subtypes().includes(subtype.toLowerCase())) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npctype', 'Invalid Subtype Value': subtype});
          };
        });
      };
    };

    // npchitdie
    {
      let npchitdie = getAttrByName(id, "npchitdie");
      if (!stringTrimWhitespace(npchitdie).replace(/ plus /gi, "+").replace(/ +/g, "").match(/^([+-]{0,1}([0-9]+[-+*/])*[0-9]*d[0-9]+([+-][0-9]+)*)+$/i)) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npchitdie', 'Invalid Value': npchitdie});
      };
    };

    // npcinitmacro
    {
      let npcinitmacro = getAttrByName(id, "npcinitmacro");
      if (npcinitmacro !== '/w GM &{template:DnD35Initiative} {{name=@{selected|token_name}}} {{check=Initiative:}} {{checkroll=[[(1d20 + (@{npcinit})) &{tracker}]]}}') {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcinitmacro', 'Invalid Value': npcinitmacro, 'Correct Value': '/w GM &{template:DnD35Initiative} {{name=@{selected|token_name}}} {{check=Initiative:}} {{checkroll=[[(1d20 + (@{npcinit})) &{tracker}]]}}'});
      };
    };

    // npcspeed
    {
      let npcspeed = getAttrByName(id, "npcspeed");
      let npcspeeds = stringTrimWhitespace(npcspeed.toLowerCase().replace(/([0-9]+) *(feet|foot|ft\.*|')/g, "$1")).split(",");
      let mode_type_map = {};
      npcspeeds.forEach(function(e) {
        let result = e.match(/^(([a-z]+) *){0,1}([0-9]+)( *\(([a-z]+)\)){0,1}$/);
        if (result === null) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspeed', 'Invalid Entry': e});
        };
        let mode = "";
        if ((typeof result[2] === 'undefined') || (result[2] === null)) {
          mode = "land";
        } else {
          mode = result[2];
          if (!dnd_35_sources.movement_modes().includes(mode)) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspeed', 'Invalid Movement Mode': mode});
          };
        };
        if (mode in mode_type_map) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspeed', 'Invalid Movement Mode': mode, '': 'This mode was defined multiple times.'});
        } else {
          mode_type_map[mode] = result[3];
        };
        if (mode === "fly") {
          if ((typeof result[5] === 'undefined') || (result[5] === null)) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspeed', 'Invalid fly maneuverability': '**Undefined**'});
          } else {
            if (!dnd_35_sources.fly_maneuverability().includes(result[5])) {
              throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspeed', 'Invalid fly maneuverability': result[5]});
            };
          };
        };
      });
    };

    //npcarmorclassinfo
    {
      let npcarmorclassinfo = getAttrByName(id, "npcarmorclassinfo");
      let npcarmorclassinfos = stringTrimWhitespace(npcarmorclassinfo.toLowerCase())
                                                    .split(",");
      let bonus_type_map = {};
      npcarmorclassinfos.forEach(function(e) {
        let result = e.match(/^[+]{0,1}([-]{0,1}[0-9]+) +(.*)+$/);
        if (result === null) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcarmorclassinfo', 'Invalid Entry': e});
        };
        if (isNaN(result[1])) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcarmorclassinfo', 'In Entry': e, 'Invalid modifier value': result[1]});
        };
        if (['str','dex','con','int','wis','cha'].includes(result[2])) {
          let ability_mod = getAttrByName(id, ''.concat('npc',result[2],'-mod'));
          if (isNaN(ability_mod) && (result[1] != ability_mod.replace(/^\+/, ""))) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcarmorclassinfo', 'In Entry': e, 'Invalid modifier value': result[1]});
          };
        };
        if (result[2] == "size") {
          let size_mod = sizeToMod(getAttrByName(id, "npcsize").toLowerCase());
          if (result[1] != size_mod) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcarmorclassinfo', 'In Entry': e, 'Invalid modifier value': result[1]});
          };
        };
      });
    };

    // npcspace
    {
      let npcspace = stringTrimWhitespace(getAttrByName(id, "npcspace").toLowerCase()
                                          .replace(/^([0-9]+(\.[0-9]+){0,1}) *(feet|foot|ft\.*|')$/g, "$1"));
      if (isNaN(npcspace)) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspace', 'Invalid value': getAttrByName(id, "npcspace")});
      };
    };

    // npcreach
    {
      let npcreach = stringTrimWhitespace(getAttrByName(id, "npcreach").toLowerCase()
                                          .replace(/^([0-9]+) *(feet|foot|ft\.*|')$/g, "$1"));
      if (isNaN(npcreach)) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcreach', 'Invalid value': getAttrByName(id, "npcreach")});
      };
    };

    // npcskills
    {
      let npcskills = getAttrByName(id, "npcskills");
      npcskills = stringTrimWhitespace(npcskills).split(",");
      npcskills.forEach(function(npcSkillsEntry) {
        if (npcSkillsEntry == "") { return; }; // Not an error, just an empty skills field!
        let match_result = npcSkillsEntry.match(/([a-z() ]+)([+]{0,1}([-]{0,1}[0-9]+)){0,1}/i);
        if (match_result === null) { throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Invalid Entry': npcSkillsEntry}); };
        if (typeof match_result[1] === 'undefined') { throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Invalid Entry': npcSkillsEntry}); };
        let skill_name = stringTrimWhitespace(match_result[1]);
        if (skill_name == "") { throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Empty Skill Entry': npcSkillsEntry}); };
        if ((typeof match_result[3] !== 'undefined') && (match_result[3] !== null)) {
          if (isNaN(match_result[3])) { throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Skill Bonus Not a Number': npcSkillsEntry}); };
        } else {
          if (!skill_name.toLowerCase().match(/Speak Language\([a-z ]+\)/i)) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Skill Bonus Missing': npcSkillsEntry});
          };
        };
        let skill_spec = getSkillSpecification(skill_name);
        if (skill_spec === null) { throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Unknown Skill': npcSkillsEntry}); };
      });
    };

    //SKIP npcspecialqualities
    //SKIP npcfeats
    //SKIP npcattack
    //SKIP npcattackmacro
    //SKIP npcfullattack
    //SKIP npcfullattackmacro
    //SKIP npcspecialattacks
    //SKIP npcenv
    //SKIP npcorg
    //SKIP npccr
    //SKIP npctreasure
    //SKIP npcalignment
    //SKIP npcadv
    //SKIP npclvladj
    //SKIP npcdescr
    //SKIP npccombatdescr
  }; // mookAuditNPCSheet

  var mookInferPCSheet = function(id) {
    mookAuditNPCSheet(id);
    setAttrByName(id, "npc-show", 2);
    ["str", "dex", "con", "int", "wis", "cha"].forEach(function(ability) {
      let score = parseFloat(getAttrByName(id, "npc"+ability));
      if (isNaN(score)) {
        score = -9999;
      } else {
        score = parseFloat(score);
      };
      // Fix PC page Ability Scores
      setAttrByName(id, ability+"-base", score);
    });
    {
      // Fix PC page character name
      setAttrByName(id, "character_name", getAttrByName(id, "npcname"));
    };
    {
      // Fix PC page size
      let npcsize_num = sizeToMod(getAttrByName(id, "npcsize"));
      if (npcsize_num !== null) {
        setAttrByName(id, "size", npcsize_num);
      };
    };
    {
      // Fix PC page Initiative
      let npcinit     = parseFloat(getAttrByName(id, "npcinit"));
      let npcdex_mod  = parseFloat(getAttrByName(id, "npcdex-mod"));
      setAttrByName(id, "initmiscmod", Math.floor(parseFloat(npcinit-npcdex_mod)));
      setAttrByName(id, "initmacro", "@{npcinitmacro}");
    };
    {
      // Fix PC page speeds
      let npcspeeds = getAttrByName(id, "npcspeed").toLowerCase()
         .replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, " ") // cleanup whitespace
         .replace(/ *, */g, ",")
         .replace(/([0-9])(feet|foot|ft\.*|')/g, "$1")              // remove units
         .replace(/ (feet|foot|ft\.*|') /g, " ").replace(/ (feet|foot|ft\.*|'),/g, ",").replace(/ (feet|foot|ft\.*|')$/, "")
         .split(",");
      npcspeeds.forEach(function(e) {
        if (!isNaN(e)) {
          // Main speed value
          setAttrByName(id, "speed", e);
          return;
        };
        let tokens = e.split(" ");
        switch (tokens[0]) {
          case 'fly':
            setAttrByName(id, "fly-speed", tokens[1]);
            let maneuver = tokens[2].toLowerCase().replace(/[^a-z]/g, "");
            if (maneuver == "perfect" ||
                maneuver == "good"    ||
                maneuver == "average" ||
                maneuver == "poor"    ||
                maneuver == "clumsy"  ||
                maneuver == "none") {
              setAttrByName(id, "fly-maneuver", stringToTitleCase(maneuver));
            };
            break;
          case 'glide':
            setAttrByName(id, "glide-speed", tokens[1]);
            break;
          case 'climb':
            setAttrByName(id, "climb-speed", tokens[1]);
            break;
          case 'burrow':
            setAttrByName(id, "burrow-speed", tokens[1]);
            break;
          case 'swim':
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
      setAttrByName(id, "dodgebonus1bonus", "");
      setAttrByName(id, "naturalarmor1bonus", "");
      setAttrByName(id, "deflection1bonus", "");
      setAttrByName(id, "miscac1bonus", "");
      let npcaclist = getAttrByName(id, "npcarmorclassinfo").toLowerCase()
         .replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, " ")             // cleanup whitespace
         .replace(/ *, */g, ",")
         .split(",");
      npcaclist.forEach(function(e) {
        let tokens = e.split(" ");
        switch (tokens[1]) {
          case 'size':
          case 'dex':
            return;
          case 'dodge':
            setAttrByName(id, "dodgebonus1bonus", parseFloat(tokens[0]));
            return;
          case 'natural':
            setAttrByName(id, "naturalarmor1bonus", parseFloat(tokens[0]));
            return;
          case 'deflection':
            setAttrByName(id, "deflection1bonus", parseFloat(tokens[0]));
            return;
          case 'misc':
            setAttrByName(id, "miscac1bonus", parseFloat(tokens[0]));
            return;
        };
        let k = e.split(/ (.+)/)[1];
        if (k.match(/(shield|buckler)/)) {
          setAttrByName(id, "shieldworn", 1);
          setAttrByName(id, "shield", stringToTitleCase(k));
          setAttrByName(id, "shieldbonus", parseFloat(tokens[0]));
          return;
        } else {
          setAttrByName(id, "armorworn", 1);
          setAttrByName(id, "acitem", stringToTitleCase(k));
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
          parseFloat(sizeToGrappleMod(getAttrByName(id, "size")))
        ));
      };
    };
    {
      // Fix PC page Skills
      // Clear out all the skill settings on PC tab.
      for (let k in dnd_35_sources.skills()) {
        //log(dnd_35_sources.skills()[k]);
        if (dnd_35_sources.skills()[k].attrib != "") {
          if (dnd_35_sources.skills()[k].attrib.match(/\#/)) {
            for (let skillindex=1; skillindex<4; skillindex++) {
              setAttrByName(id, dnd_35_sources.skills()[k].attrib.replace(/\#/, ''.concat(skillindex,"ranks")), 0);
              setAttrByName(id, dnd_35_sources.skills()[k].attrib.replace(/\#/, ''.concat(skillindex,"classskill")), 0);
              setAttrByName(id, dnd_35_sources.skills()[k].attrib.replace(/\#/, ''.concat(skillindex,"miscmod")), 0);
            };
          } else {
            setAttrByName(id, dnd_35_sources.skills()[k].attrib.concat("ranks"), 0);
            setAttrByName(id, dnd_35_sources.skills()[k].attrib.concat("classskill"), 0);
            setAttrByName(id, dnd_35_sources.skills()[k].attrib.concat("miscmod"), 0);
          };
        };
      };
      //log('START');
      findObjs({
        _type: "attribute",
        _characterid: id
      }).filter(attribute => attribute.get('name').match(/^repeating_skills_.*_.*$/)).forEach(function(attr_obj) {
        //log("I deleting attribute: " + attr_obj.get('name'));
        attr_obj.remove();
      });
      findObjs({
        _type: 'attribute',
        _name: '_reporder_repeating_skills',
        _characterid: id
      }).forEach(function(attr_obj) {
        //log("I deleting attribute: " + attr_obj.get('name'));
        attr_obj.remove();
      });
      {
        // Iterate through entries in npcskills field to adjust the map
        let npcskills = getAttrByName(id, 'npcskills');
        let speakLanguage = [];
        npcskills = stringTrimWhitespace(npcskills).split(',');
        npcskills.forEach(function(npcSkillsEntry) {
          if (npcSkillsEntry == '') { return; }; // Not an error, just an empty skills field!
          let match_result = npcSkillsEntry.match(/([a-z() ]+)([+]{0,1}([-]{0,1}[0-9]+)){0,1}/i);
          let skill_name = stringTrimWhitespace(match_result[1]);
          let npc_skill_bonus;
          if (typeof match_result[3] !== 'undefined') {
            npc_skill_bonus = parseFloat(stringTrimWhitespace(match_result[3]));
          };
          let skill_spec = getSkillSpecification(skill_name);
          if ((skill_spec === null) || (typeof skill_spec.base === 'undefined')) {
            throwDefaultTemplate('mookInferPCSheet()',id,{'Error': 'Unknown skill', 'Skill Name': skill_name});
            return;
          };
          //log(skill_spec);
          let skill_attrib = getSkillAttrName(id, skill_spec);
          //log("---> "+skill_attrib);
          if (['str-mod','dex-mod','con-mod','int-mod','wis-mod','cha-mod'].includes(skill_attrib)) {
            // A skill that's not defined YET on this character... so create it!
            let newRowID = generateUniqueRowID(id);
            log('generateUniqueRowID('+id+') => '+newRowID);
            setAttrByName(id, 'repeating_skills_'+newRowID+'_otherskillname', skill_name);
            setAttrByName(id, 'repeating_skills_'+newRowID+'_otherskillstat', '@{'+skill_spec.default_ability_mod+'} ');
            skill_attrib = getSkillAttrName(id, skill_spec);
            //log(skill_attrib);
          };
          if (['str-mod','dex-mod','con-mod','int-mod','wis-mod','cha-mod'].includes(skill_attrib)) {
            // A skill that's STILL not defined on this character!
            throwDefaultTemplate('mookInferPCSheet()',id,{'Error': 'Custom skill missing', 'Skill Name': skill_name});
          };
          if (skill_spec.base == 'speak language') {
            speakLanguage.push(stringToTitleCase(skill_spec.sub));
          } else {
            sendChat('GM',''.concat('[[@{',getAttrByName(id, "character_name"),'|',skill_attrib,'}]]'),function(attrib_msg) {
              // Apply the map to PC-page
              let skill_bonus = attrib_msg[0].inlinerolls[0]['results']['total'];
              let c_id = attrib_msg[0].who;
              //log("test2");
              setAttrByName(id, ''.concat(skill_attrib,'ranks'), npc_skill_bonus - skill_bonus);
              if (skill_attrib.match(/^repeating_skills_/)) {
                setAttrByName(id, ''.concat(skill_attrib,'skill'), 1);
              } else {
                setAttrByName(id, ''.concat(skill_attrib,'classskill'), 1);
              };
            });
          };
        });
        setAttrByName(id, 'languages', speakLanguage.join(','));
      };
    };
    //SKIP npcspecialqualities -> racialabilities
    //SKIP npcfeats -> feats
    //SKIP npcspecialattacks
    //TODO fix up NPC ability macros
  }; // mookInferPCSheet

  //var checkSheetMacros = function(id) {
  //  for (let i=1; i<=10; i++) {
  //    let weaponNname = getAttrByName(id, "weapon"+i+"name");
  //    log(weaponNname);
  //  };
  //}; // checkSheetMacros

  // SECTION_ANCHOR
  // ROLL20 UTILITIES
  // TOKENS

  var updateTokenBubbles = function(t_obj, roll_hitdie=false) {
    //log('#############################################');
    //log('updateTokenBubbles()');
    //log(t_obj.id);
    //log(t_obj);
    if (!t_obj.get("represents")) { return; }
    let character = getObj("character", t_obj.get("represents"));
    if (!character) { return; }
    character.get("_defaulttoken", function(defaultToken) {
      if (defaultToken !== "null") {
        let speed       = parseFloat(getAttrByName(character.id, "speed").replace(new RegExp("[^\.0-9].*$"), ""));
        let armorworn   = parseFloat(getAttrByName(character.id, "armorworn"));
        let acitemspeed = parseFloat(getAttrByName(character.id, "acitemspeed").replace(new RegExp("[^\.0-9].*$"), ""));
        let encumbrload = parseFloat(getAttrByName(character.id, "encumbrload"));
        let real_speed;
        if (isNaN(speed))                    { log("INVALID speed = "+speed); real_speed = 0; } else { real_speed = speed; };
        if (armorworn && isNaN(acitemspeed)) { acitemspeed = 99999; };
        {
          let pc_racialabilities = getAttrByName(character.id, "racialabilities").toLowerCase();
          let pc_classabilities  = getAttrByName(character.id, "classabilities").toLowerCase();
          let pc_other           = getAttrByName(character.id, "other").toLowerCase();
          let pc_feats           = getAttrByName(character.id, "feats").toLowerCase();
          let match_result;
          // CHECK FOR FAST MOVEMENT
          let fast_movement_bonus = 0;
          match_result = pc_racialabilities.match(/fast movement *\+([0-9]+) *(feet|foot|ft\.*|')/);
          fast_movement_bonus = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(fast_movement_bonus):(Math.max(fast_movement_bonus,parseFloat(match_result[1])));
          match_result = pc_classabilities.match(/fast movement *\+([0-9]+) *(feet|foot|ft\.*|')/);
          fast_movement_bonus = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(fast_movement_bonus):(Math.max(fast_movement_bonus,parseFloat(match_result[1])));
          match_result = pc_other.match(/fast movement *\+([0-9]+) *(feet|foot|ft\.*|')/);
          fast_movement_bonus = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(fast_movement_bonus):(Math.max(fast_movement_bonus,parseFloat(match_result[1])));
          let longstrider = 0;
          match_result = pc_other.match(/longstrider/);
          longstrider = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(longstrider):(Math.max(longstrider,10));
          let speed_of_thought = 0;
          match_result = pc_feats.match(/speed of thought/);
          speed_of_thought = (match_result === null)?(speed_of_thought):(Math.max(speed_of_thought,10));
          let epic_speed = 0;
          match_result = pc_feats.match(/epic speed/);
          epic_speed = (match_result === null)?(epic_speed):(Math.max(epic_speed,30));
          real_speed = real_speed + fast_movement_bonus + longstrider + speed_of_thought + epic_speed;
        };
        if (encumbrload < 0) {
          switch (real_speed) {
            case  20: real_speed = 15; break;
            case  30: real_speed = 20; break;
            case  40: real_speed = 30; break;
            case  50: real_speed = 35; break;
            case  60: real_speed = 40; break;
            case  70: real_speed = 50; break;
            case  80: real_speed = 55; break;
            case  90: real_speed = 60; break;
            case 100: real_speed = 70; break;
          };
        };
        if (armorworn && (acitemspeed < real_speed)) { real_speed = acitemspeed; };
        if (isNaN(real_speed)) { log("INVALID speed"+real_speed); } else { /*log(real_speed);*/ t_obj.set("bar3_link", null); t_obj.set("bar3_value", real_speed); };
        return;
      } else {
        let npcspeed       = parseFloat(getAttrByName(character.id, "npcspeed").replace(new RegExp("[^\.0-9].*$"), ""));
        let armorworn      = parseFloat(getAttrByName(character.id, "armorworn"));
        let acitemspeed    = parseFloat(getAttrByName(character.id, "acitemspeed").replace(new RegExp("[^\.0-9].*$"), ""));
        let encumbrload    = parseFloat(getAttrByName(character.id, "encumbrload"));
        let npcarmorclass  = parseFloat(getAttrByName(character.id, "npcarmorclass"));
        let speed;
        if (isNaN(npcspeed))                 { log("INVALID npcspeed = "+npcspeed); speed = 0; } else { speed = npcspeed; };
        if (armorworn && isNaN(acitemspeed)) { acitemspeed = 99999; };
        if (encumbrload < 0) {
          switch (npcspeed) {
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
        if (isNaN(speed))         { log("INVALID speed"+speed); } else { t_obj.set("bar3_value", speed); };
        if (isNaN(npcarmorclass)) { log("INVALID npcarmorclass = "+npcarmorclass); } else { t_obj.set("bar2_value", npcarmorclass); };
        if (roll_hitdie) {
          let npchitdie      = getAttrByName(character.id, "npchitdie");
          if (npchitdie) {
            sendChat('GM', '/roll ceil(' + npchitdie +')', function(msg) {
                t_obj.set("bar1_value", JSON.parse(msg[0].content)['total']);
                t_obj.set("bar1_max",   JSON.parse(msg[0].content)['total']);
            });
          };
        };
        t_obj.set("showplayers_bar1", true);
      };
    });
  }; // updateTokenBubbles()

  var updateTokenSize = function(t_obj) {
    //log('#############################################');
    //log('updateTokenSize()');
    //log(t_obj.id);
    //log(t_obj);
    if (!t_obj.get("represents")) { return; }
    let character = getObj("character", t_obj.get("represents"));
    if (!character) { return; }
    character.get("_defaulttoken", function(defaultToken) {
      if (defaultToken !== "null") {
        return;
      } else {
        let npcspace = getAttrByName(character.id, "npcspace");
        if (npcspace) {
          npcspace = npcspace.toLowerCase();
          if (npcspace.match(/ by /)) {
            npcspace = npcspace.replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, " "); // cleanup whitespace
            let dimensions = npcspace.split(" by ");
            dimensions[0] = dimensions[0].replace(new RegExp("[^\.0-9].*$"), "");
            dimensions[1] = dimensions[1].replace(new RegExp("[^\.0-9].*$"), "");
            if (!isNaN(dimensions[0]) && !isNaN(dimensions[1])) {
              dimensions[0] = parseFloat(dimensions[0]);
              dimensions[1] = parseFloat(dimensions[1]);
              if (dimensions[0] <= 1.0) { dimensions[0] = 1.0; };
              if (dimensions[1] <= 1.0) { dimensions[1] = 1.0; };
              t_obj.set("width", constants.pixelsPerFoot*parseFloat(dimensions[0]));
              t_obj.set("height", constants.pixelsPerFoot*parseFloat(dimensions[1]));
            };
          } else {
            npcspace = npcspace.replace(new RegExp("[^\.0-9].*$"), "");
            if (!isNaN(npcspace)) {
              npcspace = parseFloat(npcspace);
              //log("npcspace     = " + npcspace);
              if (npcspace <= 1.0) { npcspace = 1.0; };
              t_obj.set("width", constants.pixelsPerFoot*parseFloat(npcspace));
              t_obj.set("height", constants.pixelsPerFoot*parseFloat(npcspace));
            };
          };
        };
      };
    });
  }; // updateTokenSize()

  var updateTokenAttachedGraphics = function(t_obj) {
    //log('#############################################');
    //log('updateTokenAttachedGraphics()');
    let t_id = t_obj.id;
    let t_gmnotes = decodeRoll20String(t_obj.get('gmnotes'));
    let t_light_source = getStringRegister(t_gmnotes, "light-source") || ["None"];
    let t_text_marker  = getStringRegister(t_gmnotes, "text-marker") || [];
    let tm_darkvision_distance = 0;
    let tm_blindsight_distance = 0;
    let has_tm_low_light_vision = false;
    let has_tm_sight = true;
    for (let i=0; i<t_text_marker.length; i++) {
      let match_result;
      match_result = t_text_marker[i].toLowerCase().match(/^darkvision *([0-9]+) *(feet|foot|ft\.*|')/);
      tm_darkvision_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(tm_darkvision_distance):(Math.max(tm_darkvision_distance,parseFloat(match_result[1])));
      match_result = t_text_marker[i].toLowerCase().match(/blindsight *([0-9]+) *(feet|foot|ft\.*|')/);
      tm_blindsight_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(tm_blindsight_distance):(Math.max(tm_blindsight_distance,parseFloat(match_result[1])));
      if (t_text_marker[i].toLowerCase().match(/low-light vision/)) {
        has_tm_low_light_vision = true;
      };
      if ((t_text_marker[i].toLowerCase().match(/blinded/)) || (t_text_marker[i].toLowerCase().match(/unconscious/))) {
        has_tm_sight = false;
      };
    };
    switch (t_light_source) {
      default: { // Just doing a switch statement here to allow the use of "break" to get out and continue to next stage of this function
        // Capture relevant specs of the token, things that would effect its vision.
        let npc_npcspecialqualities = '';
        let npc_npcfeats            = '';
        let pc_racialabilities      = '';
        let pc_classabilities       = '';
        let pc_feats                = '';
        let pc_other                = '';
        let darkvision_distance     = 0;
        let blindsight_distance     = 0;
        let light_multiplier        = 1;
        let character = getObj("character", t_obj.get("represents"));
        if (character) {
          npc_npcspecialqualities = getAttrByName(character.id, "npcspecialqualities").toLowerCase();
          pc_racialabilities      = getAttrByName(character.id, "racialabilities").toLowerCase();
          pc_classabilities       = getAttrByName(character.id, "classabilities").toLowerCase();
          pc_other                = getAttrByName(character.id, "other").toLowerCase();
          npc_npcfeats            = getAttrByName(character.id, "npcfeats").toLowerCase();
          pc_feats                = getAttrByName(character.id, "feats").toLowerCase();
          let match_result;
          // CHECK FOR DARKVISION
          match_result = npc_npcspecialqualities.match(/darkvision *([0-9]+) *(feet|foot|ft\.*|')/);
          darkvision_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(darkvision_distance):(Math.max(darkvision_distance,parseFloat(match_result[1])));
          match_result = pc_racialabilities.match(/darkvision *([0-9]+) *(feet|foot|ft\.*|')/);
          darkvision_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(darkvision_distance):(Math.max(darkvision_distance,parseFloat(match_result[1])));
          match_result = pc_classabilities.match(/darkvision *([0-9]+) *(feet|foot|ft\.*|')/);
          darkvision_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(darkvision_distance):(Math.max(darkvision_distance,parseFloat(match_result[1])));
          match_result = pc_other.match(/darkvision *([0-9]+) *(feet|foot|ft\.*|')/);
          darkvision_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(darkvision_distance):(Math.max(darkvision_distance,parseFloat(match_result[1])));
          darkvision_distance = (tm_darkvision_distance > 0)?(darkvision_distance):(Math.max(darkvision_distance,tm_darkvision_distance));
          if (npc_npcfeats.match(/improved darkvision/) ||
              pc_feats.match(/improved darkvision/)) {
            darkvision_distance = darkvision_distance * 2;
          };
          // CHECK FOR BLINDSIGHT
          match_result = npc_npcspecialqualities.match(/blindsight *([0-9]+) *(feet|foot|ft\.*|')/);
          blindsight_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(blindsight_distance):(Math.max(blindsight_distance,parseFloat(match_result[1])));
          match_result = npc_npcfeats.match(/blindsight *([0-9]+) *(feet|foot|ft\.*|')/);
          blindsight_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(blindsight_distance):(Math.max(blindsight_distance,parseFloat(match_result[1])));
          match_result = pc_racialabilities.match(/blindsight *([0-9]+) *(feet|foot|ft\.*|')/);
          blindsight_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(blindsight_distance):(Math.max(blindsight_distance,parseFloat(match_result[1])));
          match_result = pc_classabilities.match(/blindsight *([0-9]+) *(feet|foot|ft\.*|')/);
          blindsight_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(blindsight_distance):(Math.max(blindsight_distance,parseFloat(match_result[1])));
          match_result = pc_feats.match(/blindsight *([0-9]+) *(feet|foot|ft\.*|')/);
          blindsight_distance = ((match_result === null) || (typeof match_result[1] === 'undefined'))?(blindsight_distance):(Math.max(blindsight_distance,parseFloat(match_result[1])));
          blindsight_distance = (tm_blindsight_distance > 0)?(blindsight_distance):(Math.max(blindsight_distance,tm_blindsight_distance));
          // CHECK FOR LOW-LIGHT VISION
          if (npc_npcspecialqualities.match(/low-light vision/) ||
              pc_racialabilities.match(/low-light vision/) ||
              pc_classabilities.match(/low-light vision/) ||
              pc_other.match(/low-light vision/) ||
              has_tm_low_light_vision) {
            light_multiplier = 2;
            if (npc_npcfeats.match(/improved low-light vision/) ||
                pc_feats.match(/improved low-light vision/)) {
              light_multiplier = 4;
            };
          };
        };
        // Retrieve specs for light source indicated
        let light_source_spec = dnd_35_sources.light_sources()[t_light_source[0].toLowerCase()];
        if ((typeof light_source_spec === 'undefined') || (light_source_spec === null)) {
          throwDefaultTemplate("updateTokenAttachedGraphics()",(character)?(character.id):(null),{'Error': 'Undefined light source "'+t_light_source[0]+'"'});
          break;
        };
        let light_radius       = light_source_spec.full_radius;
        let light_dimradius    = light_source_spec.bright_radius;
        let light_angle        = light_source_spec.angle;
        let use_attached_lightsource = ((light_radius != '') || (light_dimradius != '') || (light_angle != '')) &&
                                       (((darkvision_distance > 0) && ((light_angle != '') || ((!isNaN(light_dimradius)) && (parseInt(light_dimradius)<darkvision_distance)))) ||
                                        ((blindsight_distance > 0) && ((light_angle != '') || ((!isNaN(light_dimradius)) && (parseInt(light_dimradius)<blindsight_distance)))));
        // Set subject's 'Emits Light' token settings
        //log(darkvision_distance);
        //log(blindsight_distance);
        //log(use_attached_lightsource);
        let passive_light_radius = Math.max(darkvision_distance,blindsight_distance);
        let passive_light_dimradius = passive_light_radius+1; // (passive_light_radius*5)/6; // Moody lighting for darkvision & blindsight
        if (passive_light_radius == 0) {
          passive_light_radius = '';
          passive_light_dimradius = '';
        };
        //log(passive_light_radius);
        if (use_attached_lightsource || ((light_radius == '') && (light_dimradius == '') && (light_angle == ''))) {
          // If we already determined that an attached graphic is needed, or if the light source is effectively "None", set the token light values to passive specs
          t_obj.set("light_radius",       passive_light_radius);
          t_obj.set("light_dimradius",    passive_light_dimradius);
          t_obj.set("light_angle",        '');
          t_obj.set("light_otherplayers", false);
        } else {
          // Otherwise set the token light values to actual light source specs
          t_obj.set("light_radius",       light_radius);
          t_obj.set("light_dimradius",    light_dimradius);
          t_obj.set("light_angle",        light_angle);
          t_obj.set("light_otherplayers", true);
        };
        t_obj.set("light_multiplier",   light_multiplier);
        t_obj.set("light_hassight",     has_tm_sight);
        // Grab IDs of all attached light sources
        let cur_attached_lightsource_ids = [];
        if ((t_id in state.skepickleCharacterSuiteImp.graphic_attachment) &&
            (state.skepickleCharacterSuiteImp.graphic_attachment[t_id].role == 'subject')) {
          // BE A GOOD BOY SCOUT, clean up any invalid entries related to this token
          let objects_to_remove = [];
          for (let i=0; i<state.skepickleCharacterSuiteImp.graphic_attachment[t_id].objects.length; i++) {
            let o_id = state.skepickleCharacterSuiteImp.graphic_attachment[t_id].objects[i];
            let o_obj = getObj("graphic", o_id);
            if ((typeof state.skepickleCharacterSuiteImp.graphic_attachment[o_id] === 'undefined') || (o_obj === null)) {
              objects_to_remove.push(o_id);
            } else if (state.skepickleCharacterSuiteImp.graphic_attachment[o_id].type == 'light') {
              cur_attached_lightsource_ids.push(state.skepickleCharacterSuiteImp.graphic_attachment[t_id].objects[i]);
            };
          };
          state.skepickleCharacterSuiteImp.graphic_attachment[t_id].objects = state.skepickleCharacterSuiteImp.graphic_attachment[t_id].objects.filter(function(value, index, arr){ return !objects_to_remove.includes(value); });
        };
        // Whittle down the group of light source attached-graphics to how many we actually need, either zero or one!
        while (cur_attached_lightsource_ids.length > ((use_attached_lightsource)?(1):(0))) {
          let o_id = cur_attached_lightsource_ids[0];
          state.skepickleCharacterSuiteImp.graphic_attachment[t_id].objects = state.skepickleCharacterSuiteImp.graphic_attachment[t_id].objects.filter(function(value, index, arr){ return value != o_id; });
          delete state.skepickleCharacterSuiteImp.graphic_attachment[o_id];
          cur_attached_lightsource_ids.shift();
          let o_obj = getObj("graphic", o_id);
          if (o_obj !== null) { o_obj.remove(); };
        };
        // If we are using an attached-graphic for light, configure it based on the light source spec
        if (use_attached_lightsource) {
          if (state.skepickleCharacterSuiteImp.config.InvisibleGraphicURL == '') {
            throwDefaultTemplate("updateTokenAttachedGraphics()",(character)?(character.id):(null),{'Error': 'Cannot create an attached light source because the InvisibleGraphicURL configuration variable is unset.'});
            break;
          };
          let create_new_graphic = true;
          if (cur_attached_lightsource_ids.length > 0) {
            // set light on existing token!
            let ls_obj = getObj("graphic", cur_attached_lightsource_ids[0]);
            if (ls_obj != null) {
              ls_obj.set("_pageid",            t_obj.get("_pageid"));
              ls_obj.set("layer",              "map");
              ls_obj.set("imgsrc",             state.skepickleCharacterSuiteImp.config.InvisibleGraphicURL);
              ls_obj.set("left",               t_obj.get("left"));
              ls_obj.set("top",                t_obj.get("top"));
              ls_obj.set("width",              t_obj.get("width"));
              ls_obj.set("height",             t_obj.get("height"));
              ls_obj.set("isdrawing",          true);
              ls_obj.set("light_radius",       light_radius);
              ls_obj.set("light_dimradius",    light_dimradius);
              ls_obj.set("light_angle",        light_angle);
              ls_obj.set("light_otherplayers", true);
              create_new_graphic = false;
            }
          };
          if (create_new_graphic) {
            // create a new token!
            let ls_obj = createObj("graphic", {
              pageid:             t_obj.get("_pageid"),
              layer:              "map",
              imgsrc:             state.skepickleCharacterSuiteImp.config.InvisibleGraphicURL,
              left:               t_obj.get("left"),
              top:                t_obj.get("top"),
              width:              t_obj.get("width"),
              height:             t_obj.get("height"),
              isdrawing:          true,
              light_radius:       light_radius,
              light_dimradius:    light_dimradius,
              light_angle:        light_angle,
              light_otherplayers: true
            });
            let o_id = ls_obj.id;
            state.skepickleCharacterSuiteImp.graphic_attachment[o_id] = { role: 'object',  subject: t_id, type: 'light' };
            if (typeof state.skepickleCharacterSuiteImp.graphic_attachment[t_id] === 'undefined') {
              state.skepickleCharacterSuiteImp.graphic_attachment[t_id] = { role: 'subject', objects: []}
            };
            state.skepickleCharacterSuiteImp.graphic_attachment[t_id].objects.push(o_id);
          };
        };
      }; break;
    };
  }; // updateTokenAttachedGraphics()

  // SECTION_ANCHOR
  var animateTextMarkers = function() {
    var pages = _.union([Campaign().get('playerpageid')],
                        _.values(Campaign().get('playerspecificpages')),
                        _.chain(findObjs({_type:"player",_online:true}))
                          .filter(function(obj){ return playerIsGM(obj.id); })
                          .map(function(obj){ return obj.get("_lastpage"); })
                          .value()
                       );
    _.chain(state.skepickleCharacterSuiteImp.text_marker)
      .filter(function(o){
        //log(o);
        return _.contains(pages,o.page);
      })
      .each(function(sdata){
        //log("read:");
        //log(sdata);
        let s = getObj('graphic',sdata.id);
        if (!s || (sdata.text == '')) {
          // If the subject token is gone, or has removed all the conditions, delete the text objects!
          delete state.skepickleCharacterSuiteImp.text_marker[sdata.id];
          for (let i=0; i<sdata.text_ids.length; i++) {
            let o  =getObj("text", sdata.text_ids[i]);
            if (o) { o.remove(); };
          };
        } else {
          let t_ids = [];
          let t = [];
          sdata.text_ids.forEach(function(id) {
            let o = getObj("text", id);
            if (o) { t.push(o); t_ids.push(id); };
          });
          while (t_ids.length < 3) {
            //log("creating text!");
            let o = createObj("text", {
              pageid:      s.get("_pageid"),
              layer:       (s.get("layer")=='gmlayer')?("gmlayer"):("map"),
              top:         70,
              left:        70,
              rotation:    0,
              color:       sdata.color,
              text:        "EMPTY",
              font_family: 'Candal',
              font_size:   8
            });
            t.push(o);
            t_ids.push(o.id);
          };
          state.skepickleCharacterSuiteImp.text_marker[sdata.id].text_ids = t_ids;
          let angle_percent = (parseFloat(Date.now()%sdata.rate)/parseFloat(sdata.rate)+parseFloat(sdata.rotsalt))%1.0;
          let text_lines = sdata.text.split("|");
          {
            let max_width = 0;
            for (let i=0; i<text_lines.length; i++) {
              let orig = text_lines[i];
              text_lines[i] = orig.replace(/\:.*$/, '');
              max_width = Math.max(max_width, text_lines[i].length);
            };
            for (let i=0; i<text_lines.length; i++) {
              text_lines[i] = ' '.repeat(Math.ceil((max_width-text_lines[i].length)/1.0)).concat(text_lines[i]);
            };
          };
          let text_radius = (Math.max(s.get("width"),s.get("height"))/2.0) + (parseFloat(text_lines.length)*12/2.0);
          t.forEach(function(o) {
            o.set({
              layer:    (s.get("layer")=='gmlayer')?("gmlayer"):("map"),
              top:      (s.get("top")) +text_radius*(Math.sin(angle_percent*2.0*Math.PI)),
              left:     (s.get("left"))+text_radius*(Math.cos(angle_percent*2.0*Math.PI)),
              text:     text_lines.join("\n"),
              rotation: (((angle_percent+0.75)%1.0)*360.0)
            });
            toFront(o);
            angle_percent = (angle_percent+(1.0/3.0))%1.0;
          });
        };
      });
  }; // animateTextMarkers()

  // SECTION_ANCHOR
  // ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗
  // ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗
  // ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝
  // ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗
  // ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║
  // ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
  //  █████╗ ██████╗ ██████╗      ██████╗ ██████╗  █████╗ ██████╗ ██╗  ██╗██╗ ██████╗
  // ██╔══██╗██╔══██╗██╔══██╗    ██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██║  ██║██║██╔════╝
  // ███████║██║  ██║██║  ██║    ██║  ███╗██████╔╝███████║██████╔╝███████║██║██║
  // ██╔══██║██║  ██║██║  ██║    ██║   ██║██╔══██╗██╔══██║██╔═══╝ ██╔══██║██║██║
  // ██║  ██║██████╔╝██████╔╝    ╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║██║╚██████╗
  // ╚═╝  ╚═╝╚═════╝ ╚═════╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝

  var handleAddGraphic = function(s_obj) {
    //log('#############################################');
    //log('handleAddGraphic()');
    let objLayer = s_obj.get("layer");
    let pageId   = s_obj.get("_pageid");
    let pageName = getObj("page", pageId).get("name");
    //log(pageName);
    //log(s_obj.id);
    //log(s_obj);
    updateTokenAttachedGraphics(s_obj);
    updateTokenBubbles(s_obj, true); // second parameter indicates that the HP should be rolled from the mook hitdie.
    updateTokenSize(s_obj);
  }; // handleAddGraphic()

  // SECTION_ANCHOR
  // ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗
  // ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗
  // ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝
  // ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗
  // ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║
  // ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
  //  ██████╗██╗  ██╗ █████╗ ███╗   ██╗ ██████╗ ███████╗     ██████╗ ██████╗  █████╗ ██████╗ ██╗  ██╗██╗ ██████╗
  // ██╔════╝██║  ██║██╔══██╗████╗  ██║██╔════╝ ██╔════╝    ██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██║  ██║██║██╔════╝
  // ██║     ███████║███████║██╔██╗ ██║██║  ███╗█████╗      ██║  ███╗██████╔╝███████║██████╔╝███████║██║██║
  // ██║     ██╔══██║██╔══██║██║╚██╗██║██║   ██║██╔══╝      ██║   ██║██╔══██╗██╔══██║██╔═══╝ ██╔══██║██║██║
  // ╚██████╗██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗    ╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║██║╚██████╗
  //  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝

  var handleChangeGraphic = function(s_obj, s_obj_prev) {
    //log('#############################################');
    //log('handleChangeGraphic()');
    let objLayer = s_obj.get("layer");
    let pageId   = s_obj.get("_pageid");
    let pageName = getObj("page", pageId).get("name");
    //log(pageName);
    //log(s_obj.id);
    //log(s_obj);
    updateTokenBubbles(s_obj);
    let player_color = "#FFFFFF";
    if (s_obj.get("represents")) {
      let character = getObj("character", s_obj.get("represents"));
      if ((typeof character !== 'undefined') && (character !== null)) {
        let controlledby = character.get("controlledby");
        if (controlledby != "") {
          if (!controlledby.match(/^all$/)) {
            let controlledby_a = controlledby.split(',');
            for (let i=0; i<controlledby_a.length; i++) {
              let player = getObj("player", controlledby_a[i]);
              if ((typeof player === 'undefined') || (player === null) || (playerIsGM(player))) { continue; };
              player_color = player.get("color");
              break;
            };
          };
        };
      };
    };
    let moveAttachedGraphics = true;
    switch (true) { // This block is for moderate-movement processing
      case true:
        if ((s_obj.get("left") == s_obj_prev["left"]) &&
            (s_obj.get("top") == s_obj_prev["top"])) { break; };
        if (!s_obj.get("represents")) { break; }
        let gmnotes = decodeRoll20String(s_obj.get('gmnotes'));
        {
          let mm_data = getStringRegister(gmnotes, "moderate-movement");
          if (mm_data === null) { break; };
        };
        let path_obj = null;
        {
          let the_path = ''.concat(s_obj.get("lastmove"),',',s_obj.get("left"),',',s_obj.get("top"));
          the_path = the_path.split(',')
                             .map(parseFloat)
                             .reduce((acc, val, i, arr) =>
                                         (i % 2) ? acc
                                         : [...acc, arr.slice(i, i + 2)]
                                     , []) ;
          let min_left = 10000000;
          let min_top  = 10000000;
          let max_left = 0;
          let max_top  = 0;
          for (let i=0; i<the_path.length; i++) {
            if (the_path[i][0] < min_left) { min_left = the_path[i][0]; };
            if (the_path[i][0] > max_left) { max_left = the_path[i][0]; };
            if (the_path[i][1] < min_top ) { min_top  = the_path[i][1]; };
            if (the_path[i][1] > max_top ) { max_top  = the_path[i][1]; };
            the_path[i].unshift('L');
          };
          let height = max_top-min_top;
          let width  = max_left-min_left;
          the_path[0][0] = 'M';
          //log(the_path);
          path_obj = createObj("path", {
            pageid:       pageId,
            layer:        "map",
            path:         JSON.stringify(the_path),
            height:       height,
            width:        width,
            left:         min_left+(width/2),
            top:          min_top+(height/2),
            fill:         "transparent",
            stroke:       player_color,
            stroke_width: 5,
            controlledby: ""
          });
        };
        if (path_obj !== null) {
          toFront(path_obj);
          let shadow_obj = createObj("graphic", {
            pageid:     pageId,
            layer:      "map",
            imgsrc:     s_obj.get("imgsrc"),
            left:       s_obj.get("left"),
            top:        s_obj.get("top"),
            width:      s_obj.get("width")*0.75,
            height:     s_obj.get("height")*0.75,
            rotation:   s_obj.get("rotation"),
            isdrawing:  true,
            tint_color: player_color
          });
          if (shadow_obj !== null) {
            toFront(shadow_obj);
            if (s_obj.id in state.skepickleCharacterSuiteImp.moderate_movement.subject) {
              let path_id     = state.skepickleCharacterSuiteImp.moderate_movement.subject[s_obj.id].path;
              let shadow_id   = state.skepickleCharacterSuiteImp.moderate_movement.subject[s_obj.id].shadow;
              let prev_path   = getObj("path", path_id);
              let prev_shadow = getObj("graphic", shadow_id);
              if (path_id in state.skepickleCharacterSuiteImp.moderate_movement.path) {
                delete state.skepickleCharacterSuiteImp.moderate_movement.path[path_id];
              };
              if ((typeof prev_path !== 'undefined') && (prev_path !== null)) { prev_path.remove(); };
              if (shadow_id in state.skepickleCharacterSuiteImp.moderate_movement.shadow) {
                delete state.skepickleCharacterSuiteImp.moderate_movement.shadow[shadow_id];
              };
              if ((typeof prev_shadow !== 'undefined') && (prev_shadow !== null)) { prev_shadow.remove(); };
            };
            state.skepickleCharacterSuiteImp.moderate_movement.path[path_obj.id]     = { subject: s_obj.id };
            state.skepickleCharacterSuiteImp.moderate_movement.shadow[shadow_obj.id] = { subject: s_obj.id };
            state.skepickleCharacterSuiteImp.moderate_movement.subject[s_obj.id]     = { path: path_obj.id, shadow: shadow_obj.id };
          } else {
            path_obj.remove();
          };
        };
        s_obj.set("lastmove", ''.concat(s_obj_prev["left"],",",s_obj_prev["top"]));
        s_obj.set("left", s_obj_prev["left"]);
        s_obj.set("top", s_obj_prev["top"]);
        moveAttachedGraphics = false;
        break;
    }; // process moderate-movement
    if (moveAttachedGraphics) {
        updateTokenAttachedGraphics(s_obj);
    };
    { // Sync up text-marker if needed
      let gmnotes = decodeRoll20String(s_obj.get('gmnotes'));
      let text_marker_data = getStringRegister(gmnotes, "text-marker");
      if (text_marker_data !== null) {
        if (typeof state.skepickleCharacterSuiteImp.text_marker[s_obj.id] === 'undefined') {
          state.skepickleCharacterSuiteImp.text_marker[s_obj.id] = {
            id: s_obj.id,
            page: s_obj.get('pageid'),
            rate: (constants.secondsPerRotation*constants.millisecondsPerSecond),
            text_ids: [],
            text: text_marker_data.join("|"),
            color: player_color,
            rotsalt: Math.random()
          };
        } else {
          state.skepickleCharacterSuiteImp.text_marker[s_obj.id].text  = text_marker_data.join("|");
          state.skepickleCharacterSuiteImp.text_marker[s_obj.id].color = player_color;
        };
      } else {
        if (typeof state.skepickleCharacterSuiteImp.text_marker[s_obj.id] !== 'undefined') {
          state.skepickleCharacterSuiteImp.text_marker[s_obj.id].text  = "";
        };
      };
    };
    return;
  }; // handleChangeGraphic()

  // SECTION_ANCHOR
  // Handle Destroy Graphic

  var handleDestroyGraphic = function(s_obj) {
    //log('#############################################');
    //log('handleDestroyGraphic()');
    //let objLayer = s_obj.get("layer");
    let s_id = s_obj.id;
    //let pageId   = s_obj.get("_pageid");
    //let pageName = getObj("page", pageId).get("name");
    //log(pageName);
    //log(s_id);
    //log(s_obj);
    if (s_id in state.skepickleCharacterSuiteImp.graphic_attachment) {
      if (state.skepickleCharacterSuiteImp.graphic_attachment[s_id].role == 'subject') {
        for (let i=0; i<state.skepickleCharacterSuiteImp.graphic_attachment[s_id].objects.length; i++) {
          let o_id = state.skepickleCharacterSuiteImp.graphic_attachment[s_id].objects[i];
          delete state.skepickleCharacterSuiteImp.graphic_attachment[o_id];
          let o_obj = getObj("graphic", o_id);
          if (o_obj !== null) { o_obj.remove(); };
        };
      };
      delete state.skepickleCharacterSuiteImp.graphic_attachment[s_id];
    };
    if (s_id in state.skepickleCharacterSuiteImp.moderate_movement.subject) {
      let path_id = state.skepickleCharacterSuiteImp.moderate_movement.subject[s_id].path;
      delete state.skepickleCharacterSuiteImp.moderate_movement.path[path_id];
      let path_obj = getObj("path", path_id);
      if (path_obj) { path_obj.remove(); };
      let shadow_id = state.skepickleCharacterSuiteImp.moderate_movement.subject[s_id].shadow;
      delete state.skepickleCharacterSuiteImp.moderate_movement.shadow[shadow_id];
      let shadow_obj = getObj("graphic", shadow_id);
      if (shadow_obj) { shadow_obj.remove(); };
      delete state.skepickleCharacterSuiteImp.moderate_movement.subject[s_id];
    };
  }; // handleDestroyGraphic()

  // SECTION_ANCHOR
  // ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗
  // ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗
  // ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝
  // ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗
  // ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║
  // ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
  //  ██████╗██╗  ██╗ █████╗ ████████╗    ███╗   ███╗███████╗███████╗███████╗ █████╗  ██████╗ ███████╗
  // ██╔════╝██║  ██║██╔══██╗╚══██╔══╝    ████╗ ████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝ ██╔════╝
  // ██║     ███████║███████║   ██║       ██╔████╔██║█████╗  ███████╗███████╗███████║██║  ███╗█████╗
  // ██║     ██╔══██║██╔══██║   ██║       ██║╚██╔╝██║██╔══╝  ╚════██║╚════██║██╔══██║██║   ██║██╔══╝
  // ╚██████╗██║  ██║██║  ██║   ██║       ██║ ╚═╝ ██║███████╗███████║███████║██║  ██║╚██████╔╝███████╗
  //  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝       ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝

  var handleChatMessage = function(msg) {
    if (msg.type !== "api" || msg.content.indexOf(constants.base_command.concat(" ")) === -1) { return; };

    let playerID           = msg.playerid;
    let playerName         = msg.who.replace(new RegExp(" \\(GM\\)$"), "");

    let tokenIDs             = getSelectedTokenIDs(msg);
    let unprocessedFragments = msg.content.split(/ +/);
    let processedFragments   = [];

    processedFragments.push(unprocessedFragments.shift()); // Drop the base command entry, since we already checked that

    if (unprocessedFragments.length < 1) {
      respondToChat(msg,processedFragments.join(" ")+" requires a command");
      return;
    };
    let userCommand = unprocessedFragments.shift();
    processedFragments.push(userCommand);

    let firstFragment = null;
    if (unprocessedFragments.length > 0) {
      firstFragment = unprocessedFragments.shift();
      processedFragments.push(firstFragment);
    };

    try {
      switch (userCommand) {
        // COMMAND_ANCHOR
        //  █████╗ ██╗   ██╗██████╗ ██╗████████╗
        // ██╔══██╗██║   ██║██╔══██╗██║╚══██╔══╝
        // ███████║██║   ██║██║  ██║██║   ██║
        // ██╔══██║██║   ██║██║  ██║██║   ██║
        // ██║  ██║╚██████╔╝██████╔╝██║   ██║
        // ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝   ╚═╝
        case 'audit':
        case '--audit': {
          if (!playerIsGM(playerID)) { return; };
          if (firstFragment === null) {
            respondToChat(msg,processedFragments.join(" ")+" requires an argument");
            break;
          };
          tokenIDs.forEach(function(idOfToken) {
            let obj = getObj("graphic", idOfToken);
            let character = getObj("character", obj.get("represents"));
            if (!character) {
              respondToChat(msg,'&{template:default} {{name=handleChatMessage()}} {{Token= [image]('+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+')}} {{Message= Token does not represent a character.}}');
              return;
            };
            try {
              // At this point, we are sure that the selected token is a mook.
              switch (firstFragment) {
                case 'audit-weapon-macros':
                  //TODO
                  break;
                case 'audit-spell-macros':
                  //TODO
                  break;
              };
            } catch(e) {
              respondToChat(msg,e);
            };
          });
        }; break;
        // COMMAND_ANCHOR
        //  ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗
        // ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝
        // ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
        // ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
        // ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
        //  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝
        case 'config':
        case '--config': {
          if (!playerIsGM(playerID)) { return; };
          if (firstFragment === null) {
            let message_to_send = '';
            for (let p in state.skepickleCharacterSuiteImp.config) {
              switch (typeof state.skepickleCharacterSuiteImp.config[p]) {
                case 'undefined':
                  message_to_send = message_to_send.concat(' {{',p,'= *undefined*}}');
                  break;
                case 'boolean':
                case 'number':
                case 'bigint':
                case 'string':
                  message_to_send = message_to_send.concat(' {{',p,'= ',state.skepickleCharacterSuiteImp.config[p].toString(),'}}');
                  break;
                case 'symbol':
                case 'function':
                case 'object':
                  message_to_send = message_to_send.concat(' {{',p,'= *unhandled: ',typeof state.skepickleCharacterSuiteImp.config[p],'*}}');
                  break;
                default:
                  log("blah!");
                  break;
              };
            };
            respondToChat(msg,'&{template:default} {{name=Configuration}} '+message_to_send,true);
          } else {
            let secondFragment = null;
            if (unprocessedFragments.length > 0) {
              secondFragment = unprocessedFragments.shift();
              processedFragments.push(secondFragment);
            };
            if (secondFragment === null) {
              if (firstFragment in state.skepickleCharacterSuiteImp.config) {
                switch (typeof state.skepickleCharacterSuiteImp.config[firstFragment]) {
                  case 'undefined':
                    respondToChat(msg,'&{template:default} {{name=Configuration}} {{'+firstFragment+'= *undefined*}}',true);
                    break;
                  case 'boolean':
                  case 'number':
                  case 'bigint':
                  case 'string':
                    respondToChat(msg,'&{template:default} {{name=Configuration}} {{'+firstFragment+'= '+state.skepickleCharacterSuiteImp.config[firstFragment].toString()+'}}',true);
                    break;
                  case 'symbol':
                  case 'function':
                  case 'object':
                    respondToChat(msg,'&{template:default} {{name=Configuration}} {{'+firstFragment+'= *unhandled: '+typeof state.skepickleCharacterSuiteImp.config[firstFragment]+'*}}',true);
                    break;
                  default:
                    log("blah!");
                    break;
                };
              } else {
                respondToChat(msg,'&{template:default} {{name=Configuration}} {{'+firstFragment+'= *undefined*}}',true);
              };
            } else if (!(['SourceTexts'].includes(firstFragment))) { // Do not set READ-ONLY config registers.
              if (firstFragment in state.skepickleCharacterSuiteImp.config) {
                switch (typeof state.skepickleCharacterSuiteImp.config[firstFragment]) {
                  case 'boolean':
                    state.skepickleCharacterSuiteImp.config[firstFragment] = (secondFragment.toLowerCase() === 'true') || (secondFragment.toLowerCase() === 'yes');
                    break;
                  case 'number':
                    state.skepickleCharacterSuiteImp.config[firstFragment] = parseFloat(secondFragment);
                    break;
                  case 'bigint':
                    state.skepickleCharacterSuiteImp.config[firstFragment] = BigInt(secondFragment);
                    break;
                  case 'string':
                    state.skepickleCharacterSuiteImp.config[firstFragment] = secondFragment;
                    break;
                  default:
                    log("blah!");
                    break;
                };
              } else {
                respondToChat(msg,'&{template:default} {{name=Configuration}} {{'+firstFragment+'= *Unknown configuration field*}}',true);
              };
            };
          };
        }; break;
        // COMMAND_ANCHOR
        // ███████╗███╗   ██╗ ██████╗ ██████╗ ██╗   ██╗███╗   ██╗████████╗███████╗██████╗
        // ██╔════╝████╗  ██║██╔════╝██╔═══██╗██║   ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗
        // █████╗  ██╔██╗ ██║██║     ██║   ██║██║   ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝
        // ██╔══╝  ██║╚██╗██║██║     ██║   ██║██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗
        // ███████╗██║ ╚████║╚██████╗╚██████╔╝╚██████╔╝██║ ╚████║   ██║   ███████╗██║  ██║
        // ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
        case 'encounter': {
          if (!playerIsGM(playerID)) { return; };
          if (firstFragment === null) {
            respondToChat(msg,processedFragments.join(" ")+" requires an argument");
            break;
          };
          switch (firstFragment) {
            case 'set-challengers': {
              let challengers_cr_counts = {};
              let challengers_cr_ids    = {};
              for (let i=0; i<tokenIDs.length; i++) {
                let t_obj = getObj("graphic", tokenIDs[i]);
                let t_character = getObj("character", t_obj.get("represents"));
                if (!t_character) {
                  respondToChat(msg,'&{template:default} {{name=handleChatMessage()}} {{Token= [image]('+t_obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+')}} {{Message= Token does not represent a character.}}');
                  continue;
                };
                let cr = getAttrByName(t_character.id, "npccr");
                if ((typeof cr === 'undefined') || (cr === null) || (cr === '') || (isNaN(cr) && !cr.match(/([0-9]+)\/([0-9]+)/))) {
                  cr = 0;
                  let racialabilities = getAttrByName(t_character.id, "racialabilities");
                  let match_result = racialabilities.match(/level adjustment ([-+][0-9]+)/im);
                  if ((match_result !== null) && (typeof match_result[1] !== 'undefined')) {
                    // Level Adjustment value found! needs to be added to the CR
                    cr = parseFloat(match_result[1]);
                  };
                  let level = getAttrByName(t_character.id, "level");
                  let                          level_delim = ','; match_result = level.match(/^(\d+)(,\s*\d+)*$/);
                  if (match_result === null) { level_delim = '/'; match_result = level.match(/^(\d+)(\/\s*\d+)*$/); };
                  if (match_result === null) { level_delim = ' '; match_result = level.match(/^(\d+)( \s*\d+)*$/); };
                  if (match_result === null) { level_delim = '-'; match_result = level.match(/^(\d+)(\-\s*\d+)*$/); };
                  if (match_result === null) { level_delim = '+'; match_result = level.match(/^(\d+)(\+\s*\d+)*$/); };
                  if ((match_result !== null) && (typeof match_result[1] !== 'undefined')) {
                    let arr = level.split(level_delim).map(function(item) {
                      return parseInt(item, 10);
                    });
                    cr = cr + arr.reduce((a,b) => a + b, 0);
                  };
                  cr = cr.toString();
                };
                challengers_cr_counts[cr] = (cr in challengers_cr_counts)?(challengers_cr_counts[cr]+1):(1);
                if (!(cr in challengers_cr_ids)) {
                  challengers_cr_ids[cr] = [];
                };
                if (!challengers_cr_ids[cr].includes(t_character.id)) {
                  challengers_cr_ids[cr].push(t_character.id);
                };
              };
              log(challengers_cr_counts);
              if ((typeof temp.encounter[playerID] === 'undefined') || (temp.encounter[playerID] === null)) {
                temp.encounter[playerID] = {};
              };
              temp.encounter[playerID].challengers = {
                counts: challengers_cr_counts,
                ids:    challengers_cr_ids
              };
            }; break;
            case 'set-party': {
              let party_ecl_counts = {};
              let party_ecl_ids    = {};
              for (let i=0; i<tokenIDs.length; i++) {
                let t_obj = getObj("graphic", tokenIDs[i]);
                let t_character = getObj("character", t_obj.get("represents"));
                if (!t_character) {
                  respondToChat(msg,'&{template:default} {{name=handleChatMessage()}} {{Token= [image]('+t_obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+')}} {{Message= Token does not represent a character.}}');
                  continue;
                };
                let ecl = getAttrByName(t_character.id, "npccr");
                if ((typeof ecl === 'undefined') || (ecl === null) || (ecl === '') || (isNaN(ecl) && !ecl.match(/([0-9]+)\/([0-9]+)/))) {
                  ecl = 0;
                  let racialabilities = getAttrByName(t_character.id, "racialabilities");
                  let match_result = racialabilities.match(/level adjustment ([-+][0-9]+)/im);
                  if ((match_result !== null) && (typeof match_result[1] !== 'undefined')) {
                    // Level Adjustment value found! needs to be added to the CR
                    ecl = parseFloat(match_result[1]);
                  };
                  let level = getAttrByName(t_character.id, "level");
                  let                          level_delim = ','; match_result = level.match(/^(\d+)(,\s*\d+)*$/);
                  if (match_result === null) { level_delim = '/'; match_result = level.match(/^(\d+)(\/\s*\d+)*$/); };
                  if (match_result === null) { level_delim = ' '; match_result = level.match(/^(\d+)( \s*\d+)*$/); };
                  if (match_result === null) { level_delim = '-'; match_result = level.match(/^(\d+)(\-\s*\d+)*$/); };
                  if (match_result === null) { level_delim = '+'; match_result = level.match(/^(\d+)(\+\s*\d+)*$/); };
                  if ((match_result !== null) && (typeof match_result[1] !== 'undefined')) {
                    let arr = level.split(level_delim).map(function(item) {
                      return parseInt(item, 10);
                    });
                    ecl = ecl + arr.reduce((a,b) => a + b, 0);
                  };
                  ecl = ecl.toString();
                } else {
                  ecl = encounterCalculator(ecl);
                };
                party_ecl_counts[ecl] = (ecl in party_ecl_counts)?(party_ecl_counts[ecl]+1):(1);
                if (!(ecl in party_ecl_ids)) {
                  party_ecl_ids[ecl] = [];
                };
                if (!party_ecl_ids[ecl].includes(t_character.id)) {
                  party_ecl_ids[ecl].push(t_character.id);
                };
              };
              log(party_ecl_counts);
              if ((typeof temp.encounter[playerID] === 'undefined') || (temp.encounter[playerID] === null)) {
                temp.encounter[playerID] = {};
              };
              temp.encounter[playerID].party = {
                counts: party_ecl_counts,
                ids:    party_ecl_ids
              };
            }; break;
            case 'calculate-rewards': {
              let enc_calc = encounterCalculator(temp.encounter[playerID].party,temp.encounter[playerID].challengers);
              let xp_msg_fields = {};
              for (let id in enc_calc.xp) {
                let character = getObj("character", id);
                if (!character) { continue; };
                xp_msg_fields[character.get("name")] = ''.concat(enc_calc.xp[id],' XP');
              };
              let str = ''.concat("&{template:default} {{name=Individual XP Rewards}}");
              for (let k in xp_msg_fields) {
                str = str.concat(" {{"+k+"= "+xp_msg_fields[k]+"}}");
              };
              respondToChat(msg,str);
              str = ''.concat("&{template:default} {{name=Encounter Level, Difficulty & Treasure}} {{Party Level= ",enc_calc.pl,"}} {{Encounter Level= [",enc_calc.el,"](![[&#13;",constants.base_command," encounter generate-average-treasure ",enc_calc.el,")}} {{Difficulty= ",enc_calc.difficulty,"}} {{% of total= ",enc_calc.percentenc,"}} {{Average Treasure Value= ",enc_calc.treasure," GP}}");
              respondToChat(msg,str);
            }; break;
            case 'generate-average-treasure': {
              log(unprocessedFragments);
              //TODO IMPLEMENT THIS!
            }; break;
          };
        }; break;
        // COMMAND_ANCHOR
        //  ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗       ██╗███╗   ██╗██╗████████╗██╗ █████╗ ████████╗██╗██╗   ██╗███████╗     ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗
        // ██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗      ██║████╗  ██║██║╚══██╔══╝██║██╔══██╗╚══██╔══╝██║██║   ██║██╔════╝    ██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝
        // ██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝█████╗██║██╔██╗ ██║██║   ██║   ██║███████║   ██║   ██║██║   ██║█████╗█████╗██║     ███████║█████╗  ██║     █████╔╝
        // ██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝ ╚════╝██║██║╚██╗██║██║   ██║   ██║██╔══██║   ██║   ██║╚██╗ ██╔╝██╔══╝╚════╝██║     ██╔══██║██╔══╝  ██║     ██╔═██╗
        // ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║           ██║██║ ╚████║██║   ██║   ██║██║  ██║   ██║   ██║ ╚████╔╝ ███████╗    ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗
        //  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝           ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝  ╚══════╝     ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝
        case 'group-initiative-check':
        case '--group-initiative-check': {
          // group-initiative-check [clear]
          //   The optional "clear" argument indicates that the turn order should be cleared before adding new entries
          if (!playerIsGM(playerID)) { return; };
          let roll_initiative_map = {};
          {
            let filteredTokenIDs = [];
            for (let i=0; i<tokenIDs.length; i++) {
              let obj = getObj("graphic", tokenIDs[i]);
              let character = getObj("character", obj.get("represents"));
              if (character) {
                filteredTokenIDs.push(tokenIDs[i]);
              };
            };
            tokenIDs = filteredTokenIDs;
          };
          let remainingTokenIDs = tokenIDs.length;
          if ((firstFragment !== null) && (firstFragment.toLowerCase() == "clear")) {
            Campaign().set("turnorder", JSON.stringify([]));
          };
          tokenIDs.forEach( idOfToken => {
            let obj = getObj("graphic", idOfToken);
            let character = getObj("character", obj.get("represents"));
            let char_name = character.get("name");
            let init_macro;
            {
              let init_attrib_name;
              if (getAttrByName(character.id, "npcname") == "") {
                init_attrib_name = "init";
              } else {
                init_attrib_name = "npcinit";
              };
              init_macro = "[[1d20 + (@{"+char_name+"|"+init_attrib_name+"})]]";
            //init_macro = "[[(1d20cs>21cf<0 + (@{"+char_name+"|"+init_attrib_name+"})) + ((1d20cs>21cf<0 + (@{"+char_name+"|"+init_attrib_name+"}))/100) + ((1d20cs>21cf<0 + (@{"+char_name+"|"+init_attrib_name+"}))/10000)]]";
            };
            try {
              sendChat(playerName,init_macro, init_macro_rsp => {
                let turnorder = Campaign().get("turnorder");
                if (turnorder == "") {
                  turnorder = [];
                } else {
                  turnorder = JSON.parse(turnorder);
                };
                //log(init_macro_rsp[0].inlinerolls[0]["results"]["total"]);
                {
                  let token_in_turnorder = false;
                  for (let i=0; i<turnorder.length; i++) {
                    if (turnorder[i]["id"] === idOfToken) {
                      token_in_turnorder = true;
                      turnorder[i]["pr"] = init_macro_rsp[0].inlinerolls[0]["results"]["total"];
                      break;
                    };
                  };
                  if (!token_in_turnorder) {
                    turnorder.push({
                      id: idOfToken,
                      pr: init_macro_rsp[0].inlinerolls[0]["results"]["total"]
                    });
                  };
                };
                Campaign().set("turnorder", JSON.stringify(turnorder));
                {
                  let char_name_unique = char_name;
                  if (char_name in roll_initiative_map) {
                    if (roll_initiative_map[char_name] != "EXCLUDE") {
                      char_name_unique = char_name.concat(" (1)");
                      roll_initiative_map[char_name_unique] = roll_initiative_map[char_name];
                      roll_initiative_map[char_name]        = "EXCLUDE";
                      char_name_unique = char_name.concat(" (2)");
                    } else {
                      let n = 3;
                      while (char_name.concat(" ("+n+")") in roll_initiative_map) {
                        //TODO Add infinite loop detection here
                        n++;
                      };
                      char_name_unique = char_name.concat(" ("+n+")");
                    };
                  };
                  roll_initiative_map[char_name_unique] = init_macro_rsp[0].inlinerolls[0]["results"]["total"];
                };
                remainingTokenIDs--;
                if (remainingTokenIDs==0) {
                  let chat_msg = '/w "'+playerName+'" &{template:default} {{name=Group Initiative}} ';
                  Object.keys(roll_initiative_map).forEach(function(k){
                    if (roll_initiative_map[k] == "EXCLUDE") {
                      return;
                    };
                    chat_msg += "{{" + k + "= "+ roll_initiative_map[k] +"}} ";
                  });
                  sendChat("GM", chat_msg);
                };
              });
            } catch (e) {
              log("Encountered a problem while rolling group initiative: "+e);
              log("  Macro = "+init_macro);
            };
          });
        }; break;
        // COMMAND_ANCHOR
        //  ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗       ███████╗██╗  ██╗██╗██╗     ██╗         ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗
        // ██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗      ██╔════╝██║ ██╔╝██║██║     ██║        ██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝
        // ██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝█████╗███████╗█████╔╝ ██║██║     ██║  █████╗██║     ███████║█████╗  ██║     █████╔╝
        // ██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝ ╚════╝╚════██║██╔═██╗ ██║██║     ██║  ╚════╝██║     ██╔══██║██╔══╝  ██║     ██╔═██╗
        // ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║           ███████║██║  ██╗██║███████╗███████╗   ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗
        //  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝           ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝    ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝
        case 'group-skill-check':
        case '--group-skill-check': {
          // --group-skill-check (Aid Another|Individual) (<Skill Name>)
          //   Both arguments are required
          if (!playerIsGM(playerID)) { return; };
          if (firstFragment === null) {
            respondToChat(msg,'&{template:default} {{name=ERROR}} {{Command= '+processedFragments.join(" ")+'}} {{Message= Required arguments missing}}');
            return;
          };
          if ((firstFragment.toLowerCase() != "individual") &&
              ((firstFragment.toLowerCase() != "aid") || (unprocessedFragments.length < 1) || (unprocessedFragments[0].toLowerCase() != "another"))) {
            respondToChat(msg,'&{template:default} {{name=ERROR}} {{Command= '+processedFragments.join(" ")+'}} {{Message= First argument must be the a skill help type: "Individual" or "Aid Another"}}');
            return;
          };
          if (firstFragment.toLowerCase() != "individual") {
            firstFragment = firstFragment.concat(" ", unprocessedFragments[0]);
            processedFragments.push(unprocessedFragments.shift());
          };

          if (unprocessedFragments.length < 1) {
            respondToChat(msg,'&{template:default} {{name=ERROR}} {{Command= '+processedFragments.join(" ")+'}} {{Message= Second argument (skill name) missing}}');
            return;
          };
          let secondFragment = unprocessedFragments.join(" ");
          processedFragments.concat(unprocessedFragments);
          unprocessedFragments = [];
          //secondFragment = secondFragment.toLowerCase();
          let skill_spec = getSkillSpecification(secondFragment);
          if ((skill_spec === null) || (typeof skill_spec.base === 'undefined')) {
            respondToChat(msg,'&{template:default} {{name=ERROR}} {{Command= '+processedFragments.join(" ")+'}} {{Message= Unknown skill '+secondFragment+'}}');
            return;
          };
          let skill_trained_only = skill_spec.trained_only || '';
          let help_type          = firstFragment;
          let roll_skill_map     = {}; // key=uniquified char_name, val=skill check
          {
            let filteredTokenIDs = [];
            for (let i=0; i<tokenIDs.length; i++) {
              let obj = getObj("graphic", tokenIDs[i]);
              let character = getObj("character", obj.get("represents"));
              if (character) {
                filteredTokenIDs.push(tokenIDs[i]);
              };
            };
            tokenIDs = filteredTokenIDs;
          };
          let remainingTokenIDs  = tokenIDs.length;
          //log(skill_spec);
          // Loop through each selected character...
          tokenIDs.forEach(function(idOfToken) {
            let obj          = getObj("graphic", idOfToken);
            let character    = getObj("character", obj.get("represents"));
            let char_name    = character.get("name");
            let skill_attrib = getSkillAttrName(character.id, skill_spec);
            // at this point! "skill_attrib" __should__ be correct for this character
            //log(skill_attrib);
            // ...generate a unique char_name, in case of multiple instances...
            let char_name_unique = char_name;
            if (char_name in roll_skill_map) {
              if (roll_skill_map[char_name].state == "EXCLUDE") {
                let n = 3;
                while (char_name.concat(" ("+n+")") in roll_skill_map) {
                  //TODO Add infinite loop detection here
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
                let ranks = getAttrByName(character.id, skill_attrib.concat("ranks"));
                if (isNaN(ranks) || (ranks < 1)) {
                  roll_skill_map[char_name_unique].state = "UNTRAINED";
                };
              };
            };
            remainingTokenIDs--;
            if (remainingTokenIDs==0) {
              //log(roll_skill_map);
              let get_bonuses_remaining = Object.keys(roll_skill_map).length;
              let highest_bonus     = -10000;
              let highest_char_name = "";
              // ...retrieve each selected token's skill bonus...
              Object.keys(roll_skill_map).forEach(function(char_name_unique) {
                if (roll_skill_map[char_name_unique].state == "EXCLUDE") {
                  char_name = char_name_unique;
                } else {
                  char_name = roll_skill_map[char_name_unique].name;
                };
                sendChat(char_name_unique,''.concat('[[@{',char_name,'|',skill_attrib,'}]]'),function(attrib_msg) {
                  let bonus = 0;
                  char_name_unique = attrib_msg[0].who;
                  if (!(["EXCLUDE","UNTRAINED"].includes(roll_skill_map[char_name_unique].state))) {
                    bonus = attrib_msg[0].inlinerolls[0]["results"]["total"];
                    //log("    gotBonus("+char_name_unique+") => "+bonus);
                    roll_skill_map[char_name_unique]["bonus"] = bonus;
                    roll_skill_map[char_name_unique]["state"] = "GET_CHECK";
                    if ((state.skepickleCharacterSuiteImp.config.StrictAidAnother) && (bonus > highest_bonus)) {
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
                    let get_checks_remaining = Object.keys(roll_skill_map).length;
                    Object.keys(roll_skill_map).forEach(function(char_name_unique) {
                      if (roll_skill_map[char_name_unique].state == "EXCLUDE") {
                        char_name = char_name_unique;
                      } else {
                        char_name = roll_skill_map[char_name_unique].name;
                      };
                      sendChat(char_name_unique,''.concat('[[1d20 + ', roll_skill_map[char_name_unique].bonus, ']]'),function(check_msg) {
                        let check = 0;
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
                          if (!state.skepickleCharacterSuiteImp.config.StrictAidAnother) {
                            let highest_check = -10000;
                            for (let cnu in roll_skill_map) {
                              if ((roll_skill_map[cnu]["check"] > highest_check)) {
                                highest_check     = roll_skill_map[cnu]["check"];
                                highest_char_name = cnu;
                              };
                            };
                          };
                          //log(roll_skill_map);
                          let aid_total = 0/0;
                          let checks_total = 0;
                          let checks_num   = 0;
                          let chat_msg = "&{template:default} {{name=Group Skill Check}} {{Skill= "+secondFragment.replace(/\(/,"\n(")+"}} {{Check Type= "+help_type+"}} ";
                          let prints_remaining = Object.keys(roll_skill_map).length;
                          //Object.keys(roll_skill_map).forEach(function(char_name_unique) {
                          Object.keys(roll_skill_map).forEach(char_name_unique => {
                            if (roll_skill_map[char_name_unique].state != "EXCLUDE") {
                              if (roll_skill_map[char_name_unique].state != "UNTRAINED") {
                                checks_total += roll_skill_map[char_name_unique].check;
                                checks_num++;
                                if ((help_type.toLowerCase() == "aid another") && (char_name_unique !== highest_char_name)) {
                                  let aid_inc = 0;
                                  if (roll_skill_map[char_name_unique].check >= 10) { aid_inc = 2; };
                                  if (isNaN(aid_total)) { aid_total = aid_inc; } else { aid_total += aid_inc; };
                                  chat_msg += "{{" + char_name_unique + "= +" + aid_inc + "(" + roll_skill_map[char_name_unique].check + ")}} ";
                                } else {
                                  if (isNaN(aid_total)) { aid_total = roll_skill_map[char_name_unique].check; } else { aid_total += roll_skill_map[char_name_unique].check; };
                                  chat_msg += "{{" + char_name_unique + "= " + roll_skill_map[char_name_unique].check + "}} ";
                                  //EXPERIMENT chat_msg += "{{" + char_name_unique + "= [[" + roll_skill_map[char_name_unique].check + " : 1 d 20 + " + roll_skill_map[char_name_unique].bonus + " ]]}} ";
                                };
                              } else {
                                chat_msg += "{{" + char_name_unique + "= *Untrained* }} ";
                              };
                            };
                            prints_remaining--;
                            if (prints_remaining==0) {
                              if (help_type.toLowerCase() == "aid another") {
                                chat_msg += "{{*Total*= ***"+ aid_total +"***}} ";
                              } else {
                                let avg_check = checks_total / checks_num;
                                chat_msg += "{{*Average*= ***"+avg_check.toFixed(2)+"***}}";
                              };
                              sendChat("GM", chat_msg);
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
        }; break;
        // COMMAND_ANCHOR
        // ███╗   ███╗ ██████╗ ██████╗ ███████╗██████╗  █████╗ ████████╗███████╗    ███╗   ███╗ ██████╗ ██╗   ██╗███████╗███╗   ███╗███████╗███╗   ██╗████████╗
        // ████╗ ████║██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██╔════╝    ████╗ ████║██╔═══██╗██║   ██║██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝
        // ██╔████╔██║██║   ██║██║  ██║█████╗  ██████╔╝███████║   ██║   █████╗█████╗██╔████╔██║██║   ██║██║   ██║█████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║
        // ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ██╔══██╗██╔══██║   ██║   ██╔══╝╚════╝██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║
        // ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗██║  ██║██║  ██║   ██║   ███████╗    ██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║
        // ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝    ╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝
        case 'moderate-movement':
        case '--moderate-movement': {
          if (!playerIsGM(playerID)) { return; };
          if (firstFragment === null) {
            respondToChat(msg,processedFragments.join(" ")+" requires an argument");
            break;
          };
          tokenIDs.forEach(function(idOfToken) {
            let obj = getObj("graphic", idOfToken);
            let character = getObj("character", obj.get("represents"));
            if (!character) {
              respondToChat(msg,'&{template:default} {{name=handleChatMessage()}} {{Token= [image]('+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+')}} {{Message= Token does not represent a character.}}');
              return;
            };
            if (character.get("controlledby") == "") { return; };
            try {
              let gmnotes = decodeRoll20String(obj.get('gmnotes'));
              switch (firstFragment.toLowerCase()) {
                case 'enable':
                  obj.set("gmnotes",setStringRegister(gmnotes, "moderate-movement", ['enabled']));
                  return;
                case 'disable':
                  obj.set("gmnotes",setStringRegister(gmnotes, "moderate-movement"));
                  firstFragment = 'reject'; // Allow fall-through to let 'reject' logic below do the state clean up
                  break;
                default: {
                    let mm_data = getStringRegister(gmnotes, "moderate-movement");
                    if (mm_data === null) { return; };
                }; break;
              };
              switch (firstFragment.toLowerCase()) {
                case 'accept': {
                  if (typeof state.skepickleCharacterSuiteImp.moderate_movement.subject[idOfToken] === 'undefined') {
                    respondToChat(msg,'&{template:default} {{name=handleChatMessage()}} {{Token= [image]('+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+')}} {{Message= Token does not currently have a desired movement specified.}}');
                    return;
                  };
                  let mm_path = getObj("path", state.skepickleCharacterSuiteImp.moderate_movement.subject[idOfToken].path);
                  if ((typeof mm_path !== 'undefined') && (mm_path !== null)) {
                    let the_path = JSON.parse(mm_path.get("path"));
                    //log(the_path);
                    let left = the_path[the_path.length-1][1];
                    let top  = the_path[the_path.length-1][2];
                    the_path.pop();
                    for (let i=0; i<the_path.length; i++) {
                      the_path[i].shift();
                      if (the_path[i] instanceof Array) {
                        the_path[i] = the_path[i].join(',');
                      };
                    };
                    obj.set("left", left);
                    obj.set("top",  top);
                    obj.set("lastmove", the_path.join(','));
                    updateTokenAttachedGraphics(obj);
                  };
                }; //Note: No 'break' here as it is meant to fall through to the reject logic below to delete the path and shadow token
                case 'reject': {
                  if (typeof state.skepickleCharacterSuiteImp.moderate_movement.subject[idOfToken] === 'undefined') { return; };
                  let path_id = state.skepickleCharacterSuiteImp.moderate_movement.subject[idOfToken].path;
                  let shadow_id = state.skepickleCharacterSuiteImp.moderate_movement.subject[idOfToken].shadow;
                  let mm_path = getObj("path", path_id);
                  if ((typeof mm_path !== 'undefined') && (mm_path !== null)) { mm_path.remove(); };
                  let mm_shadow = getObj("graphic", shadow_id);
                  if ((typeof mm_shadow !== 'undefined') && (mm_shadow !== null)) { mm_shadow.remove(); };
                  delete state.skepickleCharacterSuiteImp.moderate_movement.path[path_id];
                  delete state.skepickleCharacterSuiteImp.moderate_movement.shadow[shadow_id];
                  delete state.skepickleCharacterSuiteImp.moderate_movement.subject[idOfToken];
                }; break;
              };
            } catch(e) {
              respondToChat(msg,e);
            };
          });
        }; break;
        // COMMAND_ANCHOR
        // ███╗   ███╗ ██████╗  ██████╗ ██╗  ██╗
        // ████╗ ████║██╔═══██╗██╔═══██╗██║ ██╔╝
        // ██╔████╔██║██║   ██║██║   ██║█████╔╝
        // ██║╚██╔╝██║██║   ██║██║   ██║██╔═██╗
        // ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝██║  ██╗
        // ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
        case 'mook':
        case '--mook': {
          if (!playerIsGM(playerID)) { return; };
          if (firstFragment === null) {
            respondToChat(msg,processedFragments.join(" ")+" requires an argument");
            break;
          };
          tokenIDs.forEach(function(idOfToken) {
            let obj = getObj("graphic", idOfToken);
            let character = getObj("character", obj.get("represents"));
            if (!character) {
              respondToChat(msg,'&{template:default} {{name=handleChatMessage()}} {{Token= [image]('+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+')}} {{Message= Token does not represent a character.}}');
              return;
            };
            character.get("_defaulttoken", function(defaultToken) {
              if (defaultToken !== "null") {
                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Not a mook'}));
                return;
              };
              try {
                // At this point, we are sure that the selected token is a mook.
                switch (firstFragment) {
                  case 'audit-npc-sheet':
                    mookAuditNPCSheet(character.id);
                    break;
                  case 'infer-pc-sheet':
                    mookInferPCSheet(character.id);
                    break;
                  case 'promote-to-skookum':
                    //remaining arguments = new NPC's name
                    //Implement this?
                    break;
                };
              } catch(e) {
                respondToChat(msg,e);
              };
            });
          });
        }; break;
        // COMMAND_ANCHOR
        // ███████╗███████╗████████╗   ██╗     ██╗ ██████╗ ██╗  ██╗████████╗   ███████╗ ██████╗ ██╗   ██╗██████╗  ██████╗███████╗
        // ██╔════╝██╔════╝╚══██╔══╝   ██║     ██║██╔════╝ ██║  ██║╚══██╔══╝   ██╔════╝██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔════╝
        // ███████╗█████╗     ██║█████╗██║     ██║██║  ███╗███████║   ██║█████╗███████╗██║   ██║██║   ██║██████╔╝██║     █████╗
        // ╚════██║██╔══╝     ██║╚════╝██║     ██║██║   ██║██╔══██║   ██║╚════╝╚════██║██║   ██║██║   ██║██╔══██╗██║     ██╔══╝
        // ███████║███████╗   ██║      ███████╗██║╚██████╔╝██║  ██║   ██║      ███████║╚██████╔╝╚██████╔╝██║  ██║╚██████╗███████╗
        // ╚══════╝╚══════╝   ╚═╝      ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚══════╝
        case 'set-light-source':
        case '--set-light-source': {
          if (!playerIsGM(playerID)) { return; };
          if (firstFragment === null) {
            respondToChat(msg,'&{template:default} {{name=ERROR}} {{Command= '+processedFragments.join(" ")+'}} {{Message= Required arguments missing}}');
            return;
          };
          firstFragment = stringTrimWhitespace(firstFragment.concat(" ", unprocessedFragments.join(" ")));
          //log(firstFragment);
          processedFragments.concat(unprocessedFragments);
          unprocessedFragments = [];
          if ((firstFragment.toLowerCase() != 'None') && (state.skepickleCharacterSuiteImp.config.InvisibleGraphicURL == '')) {
            respondToChat(msg,'&{template:default} {{name=ERROR}} {{Command= '+processedFragments.join(" ")+'}} {{Message= Please specify a URL for the "InvisibleGraphicURL" config variable}}');
            return;
          };
          let light_source_spec = dnd_35_sources.light_sources()[firstFragment.toLowerCase()];
          if ((typeof light_source_spec === 'undefined') || (light_source_spec === null)) {
            respondToChat(msg,'&{template:default} {{name=ERROR}} {{Command= '+processedFragments.join(" ")+'}} {{Message= Unknown light source}}');
            return;
          };
          tokenIDs.forEach(function(idOfToken) {
            let t_obj = getObj("graphic", idOfToken);
            let t_gmnotes = decodeRoll20String(t_obj.get('gmnotes'));
            if ((light_source_spec.full_radius === '') &&
                (light_source_spec.bright_radius === '') &&
                (light_source_spec.angle === '')) {
              t_obj.set("gmnotes",setStringRegister(t_gmnotes, "light-source"));
            } else {
              t_obj.set("gmnotes",setStringRegister(t_gmnotes, "light-source", [firstFragment]));
            };
            updateTokenAttachedGraphics(t_obj);
          });
        }; break;
        // COMMAND_ANCHOR
        // ███████╗██╗  ██╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗███╗   ███╗
        // ██╔════╝██║ ██╔╝██╔═══██╗██╔═══██╗██║ ██╔╝██║   ██║████╗ ████║
        // ███████╗█████╔╝ ██║   ██║██║   ██║█████╔╝ ██║   ██║██╔████╔██║
        // ╚════██║██╔═██╗ ██║   ██║██║   ██║██╔═██╗ ██║   ██║██║╚██╔╝██║
        // ███████║██║  ██╗╚██████╔╝╚██████╔╝██║  ██╗╚██████╔╝██║ ╚═╝ ██║
        // ╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝
        case 'skookum':
        case '--skookum':{
          if (!playerIsGM(playerID)) { return; };
          if (firstFragment === null) {
            respondToChat(msg,processedFragments.join(" ")+" requires an argument");
            break;
          };
          tokenIDs.forEach(function(idOfToken) {
            let obj = getObj("graphic", idOfToken);
            let character = getObj("character", obj.get("represents"));
            if (!character) {
              respondToChat(msg,'&{template:default} {{name=handleChatMessage()}} {{Token= [image]('+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+')}} {{Message= Token does not represent a character.}}');
              return;
            };
            character.get("_defaulttoken", function(defaultToken) {
              if (defaultToken === "null") {
                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Not a skookum'}));
                return;
              };
              try {
                // At this point, we are sure that the selected token is a mook.
                switch (firstFragment) {
                  case 'some-command':
                    //Some command here eventually!
                    break;
                };
              } catch(e) {
                respondToChat(msg,e);
              };
            });
          });
        }; break;
        // COMMAND_ANCHOR
        // ███████╗ ██████╗ ██╗   ██╗██████╗  ██████╗███████╗ ████████╗███████╗██╗  ██╗████████╗
        // ██╔════╝██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔════╝ ╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝
        // ███████╗██║   ██║██║   ██║██████╔╝██║     █████╗█████╗██║   █████╗   ╚███╔╝    ██║
        // ╚════██║██║   ██║██║   ██║██╔══██╗██║     ██╔══╝╚════╝██║   ██╔══╝   ██╔██╗    ██║
        // ███████║╚██████╔╝╚██████╔╝██║  ██║╚██████╗███████╗    ██║   ███████╗██╔╝ ██╗   ██║
        // ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚══════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝
        case 'source-text':
        case '--source-text': {
          //TODO Fix this command
          if (!playerIsGM(playerID)) { return; };
            let message_to_send = '';
            Object.keys(dnd_35_sources.all_source_texts).forEach(function(k,i) {
              //log(k+' '+dnd_35_sources.all_source_texts[k]);
              if (dnd_35_sources.enabled_source_texts.includes(k)) {
                message_to_send = message_to_send.concat(' {{',dnd_35_sources.all_source_texts[k],'= enabled}}');
              } else {
                message_to_send = message_to_send.concat(' {{',dnd_35_sources.all_source_texts[k],'= disabled}}');
              };
            });
            respondToChat(msg,'&{template:default} {{name=Source Texts}} '+message_to_send, true);
        }; break;
        // COMMAND_ANCHOR
        // ███████╗██████╗ ███████╗██╗     ██╗
        // ██╔════╝██╔══██╗██╔════╝██║     ██║
        // ███████╗██████╔╝█████╗  ██║     ██║
        // ╚════██║██╔═══╝ ██╔══╝  ██║     ██║
        // ███████║██║     ███████╗███████╗███████╗
        // ╚══════╝╚═╝     ╚══════╝╚══════╝╚══════╝
        case 'spell': {
          //TODONEXT
          if (firstFragment === null) {
            respondToChat(msg,processedFragments.join(" ")+" requires an argument");
            break;
          };
          tokenIDs.forEach(function(idOfToken) {
            let obj = getObj("graphic", idOfToken);
            let character = getObj("character", obj.get("represents"));
            if (!character) {
              respondToChat(msg,'&{template:default} {{name=handleChatMessage()}} {{Token= [image]('+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+')}} {{Message= Token does not represent a character.}}');
              return;
            };
            try {
              switch (firstFragment) {
                case 'show': {
                  let remaining_spells_per_day = [0,1,2,3,4,5,6,7,8,9].map(function(level) {
                    let raw_val = getAttrByName(character.id, "spells".concat(level)) || '0,0';
                    if (!raw_val.match(/,/)) {
                      raw_val = ''.concat(raw_val, ',');
                    };
                    raw_val = raw_val.replace(/,$/, ",0").replace(/^,/, "0,");
                    return raw_val.split(",")
                                  .map(s => s.split('+').map(s => isNaN(s)?0:parseInt(s)).reduce(function(memo, num){ return memo + num; }, 0));
                  }).map(function(level) {
                    return { 1: level[0], 2: level[1] };
                  });
                  let remaining_power_points = parseInt(getAttrByName(character.id, "powerpoints") || 0);
                  let spellprep_attr_names = findObjs({
                    _type: "attribute",
                    _characterid: character.id})
                  .filter(a => a.get('name').match(/^repeating_spells[0-9]*_.*_spellprep[0-9]+[1-2]$/) && (a.get('current') != '')).map(a => a.get('name'));
                  sendChat("skepickleCharacterSuite", '/w "'+playerName+'" &{template:DnD35StdRoll} {{spellflag=true}} {{name=Usable Spells}} '
                    +'{{subtags=*'+getAttrByName(character.id, "character_name")+'*}}'
                    +(_.map(_.groupBy(_.sortBy(findObjs({
                                                 _type: "attribute",
                                                 _characterid: character.id})
                                               .filter(a => a.get('name').match(/^repeating_spells[0-9]*_.*_spellprep[0-9]+[1-2]$/) && (a.get('current') != ''))
                                        ,function(a) {
                                          return getAttrByName(character.id, a.get('name').replace(/_spellprep/, "_spellname"));
                                        })
                              ,function(a) {
                                let match_result = a.get('name').match(/^repeating_spells[0-9]*_(.*)_spellprep([0-9]+)([1-2])$/);
                                return parseInt(match_result[2]);
                              })
                        ,function(attrs,level) {
                          remaining_spells_per_day[level][1] = remaining_spells_per_day[level][1] - findObjs({
                              _type: "attribute",
                              _characterid: character.id})
                            .filter(a => a.get('name').match(new RegExp("^repeating_spells[0-9]*_.*_spellprep"+level+"1$")))
                            .filter(a => a.get('current') == 'K')
                            .map(a => parseInt(getAttrByName(character.id, a.get('name').replace(/_spellprep/, "_spellused")) || 0))
                            .reduce(function(memo, num){ return memo + num; }, 0);
                          remaining_spells_per_day[level][2] = remaining_spells_per_day[level][2] - findObjs({
                              _type: "attribute",
                              _characterid: character.id})
                            .filter(a => a.get('name').match(new RegExp("^repeating_spells[0-9]*_.*_spellprep"+level+"2$")))
                            .filter(a => a.get('current') == 'K')
                            .map(a => parseInt(getAttrByName(character.id, a.get('name').replace(/_spellprep/, "_spellused")) || 0))
                            .reduce(function(memo, num){ return memo + num; }, 0);
                          let buttons = _.map(attrs, function(a) {
                            let match_result  = a.get('name').match(/^repeating_spells[0-9]*_.*_spellprep[0-9]+([1-2])$/);
                            let spell_column  = match_result[1];
                            let spell_name    = getAttrByName(character.id, a.get('name').replace(/_spellprep/, "_spellname"));
                            let spell_prep    = getAttrByName(character.id, a.get('name'));
                            let spell_used    = getAttrByName(character.id, a.get('name').replace(/_spellprep/, "_spellused"));
                            let spell_macro   = "".concat("@{selected|",a.get('name').replace(/_spellprep/, "_spellmacro"),"}");
                            switch (spell_prep) {
                              case 'K':  if (remaining_spells_per_day[level][spell_column] <= 0) { return null; }; break;
                              case 'PP': if (remaining_power_points <= 0) { return null; }; break;
                              default: {
                                if (isNaN(spell_prep)) { return null; };
                                if (isNaN(spell_used)) { return null; };
                                if ((parseInt(spell_prep)-parseInt(spell_used)) <= 0) { return null; };
                              }; break;
                            };
                            return createEscapedChatButton(spell_name, spell_macro);
                          }).filter(b => b !== null);
                          if (buttons.length == 0) { return ""; };
                          return "".concat("{{Level ",level,":=",buttons.join("\n"),"}}");
                        }).join(" ")));
                  break;
                }; break;
                case 'use-spell': {
                  // secondFragment required
                  //TODO
                }; break;
                case 'use-power': {
                  // secondFragment required
                  //TODO
                }; break;
                case 'fill-macros':
                  let spell_names = Object.keys(dnd_35_sources.spells());
                  findObjs({
                    _type: "attribute",
                    _characterid: character.id
                  }).filter(attribute => attribute.get('name').match(/^repeating_spells[0-9]*_.*_spellname[0-9]+[1-2]$/)).forEach(function(spellname_attr) {
                    let match_result = spellname_attr.get('name').match(/^repeating_spells[0-9]*_(.*)_spellname([0-9]+)([1-2])$/);
                    let rowID         = match_result[1];
                    let spell_section = match_result[2];
                    let spell_column  = match_result[3];
                    //log("I deleting attribute: " + attr_obj.get('name'));
                    //let spellmacro = getAttrByName(character.id, ''.concat('repeating_spells',spell_section,spell_column,'_',rowID,'_spellmacro',spell_section,spell_column));
                    let spellmacro = getAttrByName(character.id, spellname_attr.get('name').replace(/_spellname/, "_spellmacro"));
                    if (['','-','fill','empty'].includes(stringTrimWhitespace(spellmacro))) {
                      let spell_name = stringTrimWhitespace(spellname_attr.get('current').toLowerCase()).replace(/’/g, "'").replace(/[^-a-z'/ ]/g, '');
                      if (spell_names.includes(spell_name)) {
                        let spell_spec = dnd_35_sources.spell(spell_name);
                        //log(spell_spec);
                        //log("^^^^^^^^^^^^^^");
                        let new_spell_name = spellname_attr.get('current').replace(/[^-A-Za-z'/ ]/g, '');
                        switch (spell_spec.type) {
                          case 'spell':
                            if (spell_spec.component_details) {
                              if (spell_spec.component_details.toLowerCase().match(/component(s)?\:.*[0-9,]+ *(cp|sp|gp|pp)/)) {
                                new_spell_name = new_spell_name.concat('ᴹ');
                              };
                              if (spell_spec.component_details.toLowerCase().match(/focus\:.*[0-9,]+ *(cp|sp|gp|pp)/)) {
                                new_spell_name = new_spell_name.concat('ᶠ');
                              };
                              if (spell_spec.component_details.toLowerCase().match(/xp cost\:/)) {
                                new_spell_name = new_spell_name.concat('ˣ');
                              };
                            };
                            break;
                          case 'epicspell': // NOTE: Not sure how to determine...
                            break;
                          case 'power':
                            if (spell_spec.augment) {
                              new_spell_name = new_spell_name.concat('ᴬ');
                            };
                            if (spell_spec.component_details) {
                              if (spell_spec.component_details.toLowerCase().match(/xp cost\:/)) {
                                new_spell_name = new_spell_name.concat('ˣ');
                              };
                            };
                            break;
                          case 'epicpower': // NOTE: Don't really have any examples from SRD, excepts for seeds!
                            break;
                        };
                        setAttrByName(character.id,spellname_attr.get('name'),new_spell_name);
                        spellmacro = '&{template:DnD35StdRoll} {{spellflag=true}} {{name=@{character_name}}}';
                        switch (spell_spec.type) {
                          case 'spell':
                            if (spell_spec.ref.match(/^https{0,1}:\/\//)) {
                              spellmacro = spellmacro.concat(' {{subtags=casts [',spellname_attr.get('current'), '](', spell_spec.ref, ')}}');
                            } else {
                              spellmacro = spellmacro.concat(' {{subtags=casts ',spellname_attr.get('current'),'↲',spell_spec.ref,'}}');
                            };
                            spellmacro = spellmacro.concat(' {{School:=',spell_spec.school,'}}');
                            spellmacro = spellmacro.concat(' {{Spell Level:=',spell_spec.level,'}}');
                            {
                              let spellcastingstat = 'spellcastingstat';
                              if (spell_column == '2') {
                                if (isAttrByNameDefined(character.id, 'spellcastingstat2')) {
                                  spellcastingstat = spellcastingstat.concat('2');
                                } else {
                                  respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Character does not have spellcastingstat2 attribute defined.'}));
                                  return;
                                };
                              };
                              spellmacro = spellmacro.concat(' {{Spell DC:=[[10+', spell_section, '[Spell Level]+@{', spellcastingstat, '}[Ability Mod]]]}}');
                            }
                            {
                              let default_casterlevel = 'casterlevel';
                              if (spell_column == '2') { default_casterlevel = default_casterlevel.concat('2'); };
                              spellmacro = spellmacro.concat(' {{Caster level:=?{Caster Level|@{',default_casterlevel,'}}}}');
                            }
                            spellmacro = spellmacro.concat(' {{Components:=',spell_spec.components,'}}');
                            spellmacro = spellmacro.concat(' {{Casting Time:=',spell_spec.casting_time,'}}');
                            if ('recharge' in spell_spec) {
                              spellmacro = spellmacro.concat(' {{Recharge:=',spell_spec.recharge,'}}');
                            };
                            if (typeof spell_spec.range !== 'undefined') {
                              let spell_range_a = [];
                              if (Array.isArray(spell_spec.range)) {
                                spell_range_a = spell_spec.range.slice();
                              } else if (typeof spell_spec.range === 'string') {
                                spell_range_a = [ spell_spec.range ];
                              } else {
                                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Invalid Spell Range', 'Value': spell_spec.range}))
                                return;
                              };
                              for (let i=0; i<spell_range_a.length; i++) {
                                if (spell_range_a[i] in dnd_35_sources.spell_ranges()) {
                                  spell_range_a[i] = dnd_35_sources.spell_ranges()[spell_range_a[i]];
                                  if (i > 0) {
                                    spell_range_a[i] = spell_range_a[i].replace(/^\w/, c => c.toLowerCase());
                                  };
                                };
                              };
                              spellmacro = spellmacro.concat(' {{Range:=',spell_range_a.join(),'}}');
                            };
                            if (('target_type' in spell_spec) || ('target' in spell_spec)) {
                              let spell_target_type_a = [];
                              let spell_target_a = [];
                              if (('target_type' in spell_spec) && (Array.isArray(spell_spec.target_type))) {
                                spell_target_type_a = spell_spec.target_type.slice();
                              } else if (('target_type' in spell_spec) && (typeof spell_spec.target_type === 'string')) {
                                spell_target_type_a = [ spell_spec.target_type ];
                              } else {
                                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Unknown data structure type for "target_type" specification for *'+new_spell_name+'* spell'}));
                                return;
                              };
                              if (('target' in spell_spec) && (Array.isArray(spell_spec.target))) {
                                spell_target_a = spell_spec.target.slice();
                              } else if (('target' in spell_spec) && (typeof spell_spec.target === 'string')) {
                                spell_target_a = [ spell_spec.target ];
                              } else {
                                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Unknown data structure type for "target" specification for *'+new_spell_name+'* spell'}));
                                return;
                              };
                              if (spell_target_type_a.length != spell_target_a.length) {
                                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Mismatching lengths for "target" and "target_type" specifications for *'+new_spell_name+'* spell'}));
                                return;
                              };
                              for (let i=0; i<spell_target_type_a.length; i++) {
                                spellmacro = spellmacro.concat(' {{',spell_target_type_a[i],':=',spell_target_a[i].replace(/\(S\)/, "(Shapeable)"),'}}');
                              };
                            };
                            spellmacro = spellmacro.concat(' {{Duration:=',spell_spec.duration.replace(/\(D\)/, "(Dismissible)"),'}}');
                            if ('saving_throw' in spell_spec) {
                              spellmacro = spellmacro.concat(' {{Saving Throw:=',spell_spec.saving_throw,'}}');
                            };
                            if ('resistance' in spell_spec) {
                              if (spell_spec.resistance != 'No') {
                                spellmacro = spellmacro.concat(' {{Spell Resist.:=‹',spell_spec.resistance,'|Caster Level Check vs spell resistance: [[1d20+?{Caster Level}[Caster Level]+@{spellpen}[Spell Penalty]]]›}}');
                              } else {
                                spellmacro = spellmacro.concat(' {{Spell Resist.:=',spell_spec.resistance,'}}');
                              };
                            };
                            spellmacro = spellmacro.concat(' {{compcheck=Concentration check: [[{1d20+[[@{concentration}]]}>?{Concentration DC (Ask GM)|0}]]↲Result: }}');
                            spellmacro = spellmacro.concat(' {{succeedcheck=**Concentration succeeds.**↲↲',('text' in spell_spec)?(spell_spec.text):(''),('component_details' in spell_spec)?('↲↲'.concat(spell_spec.component_details.replace(/^( *)([A-Za-z ]+)\:/gm, "*$2*:"))):(''),'}}');
                            spellmacro = spellmacro.concat(' {{failcheck=**Concentration fails.**↲↲',('text' in spell_spec)?(spell_spec.text):(''),('component_details' in spell_spec)?('↲↲'.concat(spell_spec.component_details.replace(/^( *)([A-Za-z ]+)\:/gm, "*$2*:"))):(''),'}}');
                            break;
                          case 'epicspell':
                            break;
                          case 'power':
                            let manifester_level_query = null;
                            let power_augment_query    = null;
                            if (spell_spec.ref.match(/^https{0,1}:\/\//)) {
                              spellmacro = spellmacro.concat(' {{subtags=manifests [',spellname_attr.get('current'), '](', spell_spec.ref, ')}}');
                            } else {
                              spellmacro = spellmacro.concat(' {{subtags=manifests ',spellname_attr.get('current'),'↲',spell_spec.ref,'}}');
                            };
                            spellmacro = spellmacro.concat(' {{Discipline:=',spell_spec.discipline,'}}');
                            spellmacro = spellmacro.concat(' {{Power Level:=',spell_spec.level,'}}');
                            {
                              let spellcastingstat = 'spellcastingstat';
                              if (spell_column == '2') {
                                if (isAttrByNameDefined(character.id, 'spellcastingstat2')) {
                                  spellcastingstat = spellcastingstat.concat('2');
                                } else {
                                  respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Character does not have spellcastingstat2 attribute defined.'}));
                                  return;
                                };
                              };
                              spellmacro = spellmacro.concat(' {{Power DC:=[[10+', spell_section, '[Power Level]+@{', spellcastingstat, '}[Ability Mod]',(('save_dc_bonus' in spell_spec)?('+'.concat(spell_spec.save_dc_bonus)):('')),']]}}');
                            }
                            {
                              let default_casterlevel = 'casterlevel';
                              if (spell_column == '2') { default_casterlevel = default_casterlevel.concat('2'); };
                              manifester_level_query = ' '.concat('?{Manifester Level|@{',default_casterlevel,'}}');
                              spellmacro = spellmacro.concat(' {{Manifester level:=?{Manifester Level}}}');
                            }
                            if ('display' in spell_spec) {
                              spellmacro = spellmacro.concat(' {{Display:=',spell_spec.display,'}}');
                            }
                            spellmacro = spellmacro.concat(' {{Manifesting Time:=',spell_spec.manifesting_time,'}}');
                            if ('range' in spell_spec) {
                              let spell_range_a = [];
                              if (Array.isArray(spell_spec.range)) {
                                spell_range_a = spell_spec.range.slice();
                              } else if (typeof spell_spec.range === 'string') {
                                spell_range_a = [ spell_spec.range ];
                              } else {
                                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Invalid Power Range', 'Power': spell_name, 'Range': spell_spec.range}))
                                return;
                              };
                              for (let i=0; i<spell_range_a.length; i++) {
                                if (spell_range_a[i] in dnd_35_sources.spell_ranges()) {
                                  spell_range_a[i] = dnd_35_sources.spell_ranges()[spell_range_a[i]].replace(/Caster/g, 'Manifester');
                                  if (i > 0) {
                                    spell_range_a[i] = spell_range_a[i].replace(/^\w/, c => c.toLowerCase());
                                  };
                                };
                              };
                              spellmacro = spellmacro.concat(' {{Range:=',spell_range_a.join(),'}}');
                            };
                            if (('target_type' in spell_spec) || ('target' in spell_spec)) {
                              let spell_target_type_a = [];
                              let spell_target_a = [];
                              if (('target_type' in spell_spec) && (Array.isArray(spell_spec.target_type))) {
                                spell_target_type_a = spell_spec.target_type.slice();
                              } else if (('target_type' in spell_spec) && (typeof spell_spec.target_type === 'string')) {
                                spell_target_type_a = [ spell_spec.target_type ];
                              } else {
                                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Unknown data structure type for "target_type" specification for *'+new_spell_name+'* power'}));
                                return;
                              };
                              if (('target' in spell_spec) && (Array.isArray(spell_spec.target))) {
                                spell_target_a = spell_spec.target.slice();
                              } else if (('target' in spell_spec) && (typeof spell_spec.target === 'string')) {
                                spell_target_a = [ spell_spec.target ];
                              } else {
                                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Unknown data structure type for "target" specification for *'+new_spell_name+'* power'}));
                                return;
                              };
                              if (spell_target_type_a.length != spell_target_a.length) {
                                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Mismatching lengths for "target" and "target_type" specifications for *'+new_spell_name+'* power'}));
                                return;
                              };
                              for (let i=0; i<spell_target_type_a.length; i++) {
                                spellmacro = spellmacro.concat(' {{',spell_target_type_a[i],':=',spell_target_a[i].replace(/\(S\)/, "(Shapeable)"),'}}');
                              }
                            };
                            if ('duration' in spell_spec) {
                              spellmacro = spellmacro.concat(' {{Duration:=',spell_spec.duration.replace(/\(D\)$/, "(Dismissible)"),'}}');
                            };
                            if ('saving_throw' in spell_spec) {
                              spellmacro = spellmacro.concat(' {{Saving Throw:=',spell_spec.saving_throw,'}}');
                            };
                            if ('resistance' in spell_spec) {
                              if (spell_spec.resistance != 'No') {
                                spellmacro = spellmacro.concat(' {{Power Resist.:=‹',spell_spec.resistance,'|Manifester Level Check vs power resistance: [[1d20+?{Manifester Level}[Manifester Level]', (('resistance_bonus' in spell_spec)?('+'.concat(spell_spec.resistance_bonus)):('')), ']]›}}');
                              } else {
                                spellmacro = spellmacro.concat(' {{Power Resist.:=',spell_spec.resistance,'}}');
                              };
                            };
                            let text_augment = "";
                            if ('augment' in spell_spec) {
                              power_augment_query = " ?{Power Augmentation|0}";
                              spellmacro = spellmacro.concat(' {{Power Points:=',spell_spec.power_points,' + [[?{Power Augmentation}]][Augment]}}');
                              text_augment = "↲".concat("**Augment:**", "↲", spell_spec.augment);
                            } else {
                              spellmacro = spellmacro.concat(' {{Power Points:=',spell_spec.power_points,'}}');
                            };
                            spellmacro = spellmacro.concat(' {{compcheck=Concentration check: [[{1d20+[[@{concentration}]]}>?{Concentration DC (Ask GM)|0}]]↲Result: }}');
                            spellmacro = spellmacro.concat(' {{succeedcheck=**Concentration succeeds.**↲↲',('text' in spell_spec)?(spell_spec.text):(''),text_augment,'}}');
                            spellmacro = spellmacro.concat(' {{failcheck=**Concentration fails.**↲↲',('text' in spell_spec)?(spell_spec.text):(''),text_augment,'}}');
                            if ((manifester_level_query !== null) || (power_augment_query !== null)) {
                              spellmacro = "".concat("!", (manifester_level_query !== null)?(manifester_level_query):(''), (power_augment_query !== null)?(power_augment_query):(''), "\n", spellmacro);
                            };
                            break;
                          case 'epicpower':
                            break;
                        };
                        spellmacro = spellmacro.replace(/(\r\n|\n|\r)/gm, "↲");
                        //log(spellmacro);
                        // Create a chat button in output ‹ and ›, or « and » for indirect buttons
                        while (spellmacro.match(/^.*‹[^›«»|]+›.*$/) ||
                               spellmacro.match(/^.*‹[^›«»|]+\|[^›«»]+›.*$/) ||
                               spellmacro.match(/^.*«[^‹›»|]+».*$/) ||
                               spellmacro.match(/^.*«[^‹›»|]+\|[^‹›»]+».*$/)) {
                          //TODO Add infinite loop detection here
                          let match_results;
                          match_results = spellmacro.match(/^(.*)‹([^›«»|]+)›(.*)$/);
                          if (match_results !== null) {
                            spellmacro = ''.concat(match_results[1],createChatButton(match_results[2],''.concat('[[',match_results[2],']]')),match_results[3]);
                          };
                          match_results = spellmacro.match(/^(.*)‹([^›«»|]+)\|([^›«»]+)›(.*)$/);
                          if (match_results !== null) {
                            spellmacro = ''.concat(match_results[1],createChatButton(match_results[2],match_results[3]),match_results[4]);
                          };
                          match_results = spellmacro.match(/^(.*)«([^‹›»|]+)»(.*)$/);
                          if (match_results !== null) {
                            spellmacro = ''.concat(match_results[1],createEscapedChatButton(match_results[2],''.concat('[[',match_results[2],']]')),match_results[3]);
                          };
                          match_results = spellmacro.match(/^(.*)«([^‹›»|]+)\|([^‹›»]+)»(.*)$/);
                          if (match_results !== null) {
                            spellmacro = ''.concat(match_results[1],createEscapedChatButton(match_results[2],match_results[3]),match_results[4]);
                          };
                          //log(spellmacro);
                        };
                        spellmacro = spellmacro.replace(/^ +/gm,  "&nbsp;&nbsp;&nbsp;"); // INDENT!
                        spellmacro = spellmacro.replace(/↲ +/g, "\n&nbsp;&nbsp;&nbsp;"); // INDENT!
                        spellmacro = spellmacro.replace(/↲/g, "\n");
                        // Embolden links, and also italicize links to spells and powers
                        spellmacro = spellmacro.replace(/(\[[^\]]+\]\([^\)]+\/(spells|psionic)\/[^\)]+\))/gm, "***$1***");
                        spellmacro = spellmacro.replace(/([^*])(\[[^\]]+\]\([^\)]+\))([^*])/gm, "$1*$2*$3");
                        // Escape bonuses and penalties to give red-text look...
                        spellmacro = spellmacro.replace(/([+-][0-9]+ ([a-z]+ ){0,1}(bonus|bonuses|penalty|penalties))/gm, "``$1``");
                        //log("FOUND!");
                        //log(spell_spec);
                        //setAttrByName(character.id, ''.concat('repeating_spells',spell_section,spell_column,'_',rowID,'_spellmacro',spell_section,spell_column), spellmacro);
                        setAttrByName(character.id, spellname_attr.get('name').replace(/_spellname/, "_spellmacro"), spellmacro);
                      } else {
                        //TODO Maybe fill macro field with content indicating that the spell is unknown
                        log("Spell not found: _".concat(spell_name,"_"));
                      };
                    };
                  });
                  break;
              };
            } catch(e) {
              respondToChat(msg,e);
            };
          });
        }; break;
        // COMMAND_ANCHOR
        // ████████╗███████╗██╗  ██╗████████╗   ███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗██████╗
        // ╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝   ████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗
        //    ██║   █████╗   ╚███╔╝    ██║█████╗██╔████╔██║███████║██████╔╝█████╔╝ █████╗  ██████╔╝
        //    ██║   ██╔══╝   ██╔██╗    ██║╚════╝██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝  ██╔══██╗
        //    ██║   ███████╗██╔╝ ██╗   ██║      ██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗██║  ██║
        //    ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝      ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
        case 'text-marker': {
          if (!playerIsGM(playerID)) { return; };
          if (firstFragment === null) {
            respondToChat(msg,processedFragments.join(" ")+" requires an argument");
            break;
          };
          let secondFragment = unprocessedFragments.join(" ");
          processedFragments.concat(unprocessedFragments);
          unprocessedFragments = [];
          switch (firstFragment) {
            case 'advance': {
              if (secondFragment === null) {
                respondToChat(msg,processedFragments.join(" ")+" requires arguments");
                break;
              };
              let advance_rounds = 0;
              {
                let advance_duration = stringTrimWhitespace(secondFragment);
                if ((advance_duration != '') && (!advance_duration.match(/^[0-9]+( *(round|minute|hour|day|week|month|year){0,1}s{0,1})$/))) {
                  respondToChat(msg,"'"+advance_duration+"' is not a valid duration");
                  break;
                };
                advance_rounds = durationToRounds(advance_duration);
              };
              if (advance_rounds == 0) { break; };
              _.chain(state.skepickleCharacterSuiteImp.text_marker)
                .each(function(sdata){
                  //{ id: '%id%', page: '%id%', rate: #, text_ids: ['%id%', '%id%', '%id%'], text: 'condition/effect/blah/blop', color: '#000000', rotsalt: # },
                  //log("read:");
                  //log(sdata);
                  let s = getObj('graphic',sdata.id);
                  if (!s || (sdata.text == '')) {
                    // If the subject token is gone, or has removed all the conditions, skip
                    return;
                  } else {
                    let text_lines = sdata.text.split("|");
                    for (let i=0; i<text_lines.length; i++) {
                      let text = text_lines[i].replace(/\:.*$/, '');
                      let rounds = null;
                      if (text_lines[i].match(/:/)) {
                        rounds = durationToRounds(text_lines[i].replace(/^.*\:/, '')) - advance_rounds;
                        if (rounds <= 0) {
                          text_lines[i] = '';
                        } else {
                          text_lines[i] = ''.concat(text,':',rounds,' rounds');
                        };
                      };
                    };
                    text_lines = text_lines.filter(function(str){ return str != ''; });
                    state.skepickleCharacterSuiteImp.text_marker[sdata.id].text = text_lines.join('|');
                    let obj = getObj("graphic", sdata.id);
                    if (obj) {
                      let gmnotes = decodeRoll20String(obj.get('gmnotes'));
                      if (text_lines.length == 0) {
                        obj.set("gmnotes",setStringRegister(gmnotes, "text-marker"));
                      } else {
                        obj.set("gmnotes",setStringRegister(gmnotes, "text-marker", text_lines));
                      };
                    };
                  };
                });
            }; return;
          };
          tokenIDs.forEach(function(idOfToken) {
            let obj = getObj("graphic", idOfToken);
            let character = getObj("character", obj.get("represents"));
            try {
              // At this point, we are sure that the selected token is a mook.
              switch (firstFragment) {
                case 'clear': {
                  {
                    let gmnotes = decodeRoll20String(obj.get('gmnotes'));
                    obj.set("gmnotes",setStringRegister(gmnotes, "text-marker"));
                  };
                  if (idOfToken in state.skepickleCharacterSuiteImp.text_marker) {
                    state.skepickleCharacterSuiteImp.text_marker[idOfToken].text = '';
                  };
                }; break;
                case 'add': {
                  if (secondFragment === null) {
                    respondToChat(msg,processedFragments.join(" ")+" requires arguments");
                    break;
                  };
                  let marker_text = '';
                  let marker_duration = '';
                  {
                    let match_result = secondFragment.match(/^([^,]+)(,(.*)){0,1}$/i);
                    if (typeof match_result[1] !== 'undefined') { marker_text     = stringTrimWhitespace(match_result[1]); };
                    if (typeof match_result[3] !== 'undefined') { marker_duration = stringTrimWhitespace(match_result[3]); };
                  };
                  if (marker_text == '') {
                    respondToChat(msg,processedFragments.join(" ")+" requires arguments (impossible?)");
                    break;
                  };
                  if ((marker_duration != '') && (!marker_duration.match(/[0-9]+( *(round|minute|hour|day|week|month|year){0,1}s{0,1})/))) {
                    respondToChat(msg,"'"+marker_duration+"' is not a valid duration");
                    break;
                  };
                  if (marker_duration != '') {
                    let rounds = durationToRounds(marker_duration);
                    marker_duration = ''.concat(rounds, ' rounds');
                  };
                  let gmnotes = decodeRoll20String(obj.get('gmnotes'));
                  let text_marker_data = getStringRegister(gmnotes, "text-marker");
                  if (text_marker_data === null) { text_marker_data = []; };
                  let its_moot = false;
                  let replaced = false;
                  for (let i=0; i< text_marker_data.length; i++) {
                    if (text_marker_data[i].match(new RegExp('^'+marker_text+':'))) {
                      {
                        let prev_duration = ''
                        let match_result = text_marker_data[i].match(/^([^:]+)(:(.*)){0,1}/i);
                        if (typeof match_result[3] !== 'undefined') { prev_duration = stringTrimWhitespace(match_result[3]); };
                        if (prev_duration == '') {
                          its_moot = true; break;
                        } else if (prev_duration.match(/[0-9]+( *(round|minute|hour|day|week|month|year){0,1}s{0,1})/)) {
                          if ((marker_duration != '') && (durationToRounds(prev_duration) >= durationToRounds(marker_duration))) { its_moot = true; break; };
                        };
                      };
                      text_marker_data[i] = marker_text+':'+marker_duration;
                      replaced = true;
                    };
                  };
                  if (its_moot) { break; }; // Don't set duration because it's less than existing text-marker duration.
                  if (!replaced) {
                    text_marker_data.push(marker_text+':'+marker_duration);
                  };
                  obj.set("gmnotes",setStringRegister(gmnotes, "text-marker", text_marker_data));
                  let player_color = "#FFFFFF";
                  switch (true) {
                    case true: {
                      if ((typeof character === 'undefined') || (character === null)) { break; }
                      let controlledby = character.get("controlledby");
                      if (controlledby == "") { break; };
                      if (!controlledby.match(/^all$/)) {
                        let controlledby_a = controlledby.split(',');
                        for (let i=0; i<controlledby_a.length; i++) {
                          let player = getObj("player", controlledby_a[i]);
                          if ((typeof player === 'undefined') || (player === null) || (playerIsGM(player))) { continue; };
                          player_color = player.get("color");
                          break;
                        };
                      };
                    }; break;
                  };
                  if (typeof state.skepickleCharacterSuiteImp.text_marker[idOfToken] === 'undefined') {
                    state.skepickleCharacterSuiteImp.text_marker[idOfToken] = {
                      id: idOfToken,
                      page: obj.get('pageid'),
                      rate: (constants.secondsPerRotation*constants.millisecondsPerSecond),
                      text_ids: [],
                      text: text_marker_data.join("|"),
                      color: player_color,
                      rotsalt: Math.random()
                    };
                  } else {
                    state.skepickleCharacterSuiteImp.text_marker[idOfToken].text  = text_marker_data.join("|");
                    state.skepickleCharacterSuiteImp.text_marker[idOfToken].color = player_color;
                  };
                  //log("write: ")
                  //log(state.skepickleCharacterSuiteImp.text_marker[idOfToken]);
                }; break;
                case 'remove': {
                  if (secondFragment === null) {
                    respondToChat(msg,processedFragments.join(" ")+" requires arguments");
                    break;
                  };
                  let gmnotes = decodeRoll20String(obj.get('gmnotes'));
                  let text_marker_data = getStringRegister(gmnotes, "text-marker");
                  if (text_marker_data === null) { break; };
                  let deleted = false;
                  for (let i=0; i< text_marker_data.length; i++) {
                    if (text_marker_data[i].match(new RegExp('^'+secondFragment+':'))) {
                      text_marker_data.splice(i, 1);
                      deleted = true;
                      break;
                    };
                  };
                  if (deleted) {
                    if (text_marker_data.length == 0) {
                      obj.set("gmnotes",setStringRegister(gmnotes, "text-marker"));
                      state.skepickleCharacterSuiteImp.text_marker[idOfToken].text = '';
                    } else {
                      obj.set("gmnotes",setStringRegister(gmnotes, "text-marker", text_marker_data));
                      state.skepickleCharacterSuiteImp.text_marker[idOfToken].text = text_marker_data.join("|");
                    };
                  };
                }; break;
                case 'list': {
                  //TODO
                }; break;
              };
            } catch(e) {
              respondToChat(msg,e);
            };
          });
        }; break;
        // COMMAND_ANCHOR
        // ████████╗ ██████╗  ██████╗  ██████╗ ██╗     ███████╗    ██████╗ ███████╗ █████╗  ██████╗██╗  ██╗       █████╗ ██╗   ██╗██████╗  █████╗ ███████╗
        // ╚══██╔══╝██╔═══██╗██╔════╝ ██╔════╝ ██║     ██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔════╝██║  ██║      ██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔════╝
        //    ██║   ██║   ██║██║  ███╗██║  ███╗██║     █████╗█████╗██████╔╝█████╗  ███████║██║     ███████║█████╗███████║██║   ██║██████╔╝███████║███████╗
        //    ██║   ██║   ██║██║   ██║██║   ██║██║     ██╔══╝╚════╝██╔══██╗██╔══╝  ██╔══██║██║     ██╔══██║╚════╝██╔══██║██║   ██║██╔══██╗██╔══██║╚════██║
        //    ██║   ╚██████╔╝╚██████╔╝╚██████╔╝███████╗███████╗    ██║  ██║███████╗██║  ██║╚██████╗██║  ██║      ██║  ██║╚██████╔╝██║  ██║██║  ██║███████║
        //    ╚═╝    ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
        case 'toggle-reach-auras':
        case '--toggle-reach-auras': {
          if (!playerIsGM(playerID)) { return; };
          tokenIDs.forEach(function(idOfToken) {
            let obj = getObj("graphic", idOfToken);
            let character = getObj("character", obj.get("represents"));
            if (!character) { return; };
            let reach = getAttrByName(character.id, "npcreach").replace(new RegExp("[^\.0-9].*$"), "");
            if ((!isAttrByNameDefined(character.id, "npcname")) || (getAttrByName(character.id, "npcname") == "")) {
              //log(getAttrByName(character.id, "size"));
              reach = sizeModToTallReach(getAttrByName(character.id, "size"));
            };
            if (isNaN(reach)) { throwDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Reach distance is not a number'}); };
            let gmnotes = decodeRoll20String(obj.get('gmnotes'));
            let aura_info = getStringRegister(gmnotes, "aura-data-backup");
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
              obj.set("aura1_square", (reach*2<=10));
              obj.set("aura2_radius", reach);
              obj.set("aura2_color", "#0000FF");
              obj.set("aura2_square", (reach<=10));
              obj.set("showplayers_aura1", false);
              obj.set("showplayers_aura2", false);
              obj.set("playersedit_aura1", true);
              obj.set("playersedit_aura2", true);
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
        }; break;
        // COMMAND_ANCHOR
        case '--debug-attribute': {
          if (!playerIsGM(playerID)) { return; };
          tokenIDs.forEach(function(idOfToken) {
              let obj = getObj("graphic", idOfToken);
              let character = getObj("character", obj.get("represents"));
              if (!character) { return; };
              let attrib_val = getAttrByName(character.id, firstFragment);
              log(firstFragment+' attribute for '+character.get("name")+' is = '+attrib_val);
          });
        }; break;
        // COMMAND_ANCHOR
        case '--debug-token-property': {
          if (!playerIsGM(playerID)) { return; };
          tokenIDs.forEach(function(idOfToken) {
              let obj = getObj("graphic", idOfToken);
              log(firstFragment+' is = '+obj.get(firstFragment));
          });
        }; break;
        // COMMAND_ANCHOR
        case '--debug-attribute-regex': {
          if (!playerIsGM(playerID)) { return; };
          log("--debug-attribute-regex "+firstFragment);
          tokenIDs.forEach(function(idOfToken) {
              let token_obj = getObj("graphic", idOfToken);
              let character = getObj("character", token_obj.get("represents"));
              if (!character) { return; };
              findObjs({
                _type: "attribute",
                _characterid: character.id
              }).filter(attribute => attribute.get('name').match(new RegExp(firstFragment))).forEach(function(attr_obj) {
                log(attr_obj);
              });
              //let attrib_val = getAttrByName(character.id, firstFragment);
              //log(firstFragment+' attribute for '+character.get("name")+' is = '+attrib_val);
          });
        }; break;
        // COMMAND_ANCHOR
        case '--debug-namespaces': {
          if (!playerIsGM(playerID)) { return; };
          log("skepickleCharacterSuite_SRD:");
          let srd_source_text_data = eval('skepickleCharacterSuite_SRD.source_text');
          log(srd_source_text_data);
        }; break;
        // COMMAND_ANCHOR
        case '--debug-selected': {
          if (!playerIsGM(playerID)) { return; };
          log("debug-selected");
          for (let selected of msg.selected) {
            log("######");
            log(selected)
            let o = getObj(selected["_type"],selected["_id"]);
            log(o);
          };
        }; break;
        // COMMAND_ANCHOR
        case '--debug-delete-object': {
          if (!playerIsGM(playerID)) { return; };
          log("debug-delete-object");
          for (let selected of msg.selected) {
            selected.remove();
          };
        }; break;
        // COMMAND_ANCHOR
        case '--help':
        default: {
        //getHelp();
          sendChat("GM", '/w "'+playerName+'" Test 1 2 3 '+playerName);
        }; break;
      };
    } catch (e) {
      log("Encountered a problem on "+userCommand+" operation:\n"+e);
    };
  }; // handleChatMessage()

  // SECTION_ANCHOR
  // ███████╗ ██████╗██████╗ ██╗██████╗ ████████╗    ██╗███╗   ██╗██╗████████╗
  // ██╔════╝██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝    ██║████╗  ██║██║╚══██╔══╝
  // ███████╗██║     ██████╔╝██║██████╔╝   ██║       ██║██╔██╗ ██║██║   ██║
  // ╚════██║██║     ██╔══██╗██║██╔═══╝    ██║       ██║██║╚██╗██║██║   ██║
  // ███████║╚██████╗██║  ██║██║██║        ██║       ██║██║ ╚████║██║   ██║
  // ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝       ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝

  var registerEventHandlers = function() {
    on('add:graphic',     handleAddGraphic);
    on('change:graphic',  handleChangeGraphic);
    on('destroy:graphic', handleDestroyGraphic);
    on('chat:message',    handleChatMessage);
  }; // registerEventHandlers

  var checkInstall = function() {
    // temp: {
    //   campaignLoaded: false,
    //   encounter: {},
    //   cache: {
    //     source_text: null  // will get set to associative array on first access
    //   }
    // }
    // state: {
    //   skepickleCharacterSuiteImp: {
    //     info:   {},
    //     config: {},
    //     graphic_attachment: {
    //       '%id%': { role: 'subject', objects: ['%id%'...] },
    //       '%id%': { role: 'object',  subject: '%id%', type: 'light/blah/bloop' }
    //     },
    //     moderate_movement: {
    //       subject: {
    //         '%id%': { path: '%id%', shadow: '%id%' },
    //       },
    //       path: {
    //         '%id%': { subject: '%id%' },
    //       },
    //       shadow: {
    //         '%id%': { subject: '%id%' },
    //       },
    //     },
    //     text_marker: {
    //       '%id%': { id: '%id%', page: '%id%', rate: #, text_ids: ['%id%', '%id%', '%id%'], text: 'condition/effect/blah/blop', color: '#000000', rotsalt: # },
    //     },
    //   }
    // }
    if ((typeof state.skepickleCharacterSuiteImp === 'undefined') || (state.skepickleCharacterSuiteImp === null)) {
      state.skepickleCharacterSuiteImp = {
        info:   Object.assign({}, info_state_template),
        config: Object.assign({}, config_state_template),
        graphic_attachment: {},
        moderate_movement: { subject: {}, path: {}, shadow: {} },
        text_marker: { subject: {} }
      };
    } else {
      // CHECK STATE INFO
      if ((typeof state.skepickleCharacterSuiteImp.info === 'undefined') || (state.skepickleCharacterSuiteImp.info === null)) {
        state.skepickleCharacterSuiteImp.info = Object.assign({}, info_state_template);
      } else {
        for (let p in state.skepickleCharacterSuiteImp.info) {
          if (!(p in info_state_template)) {
            delete state.skepickleCharacterSuiteImp.info[p];
          };
        };
        for (let p in info_state_template) {
          if (!(p in state.skepickleCharacterSuiteImp.info)) {
            state.skepickleCharacterSuiteImp.info[p] = info_state_template[p];
          };
        };
      };
      // CHECK STATE CONFIG
      if ((typeof state.skepickleCharacterSuiteImp.config === 'undefined') || (state.skepickleCharacterSuiteImp.config === null)) {
        state.skepickleCharacterSuiteImp.config = Object.assign({}, config_state_template);
      } else {
        for (let p in state.skepickleCharacterSuiteImp.config) {
          if (!(p in config_state_template)) {
            delete state.skepickleCharacterSuiteImp.config[p];
          };
        };
        for (let p in config_state_template) {
          if (!(p in state.skepickleCharacterSuiteImp.config)) {
            state.skepickleCharacterSuiteImp.config[p] = config_state_template[p];
          };
        };
      };
      if ((typeof state.skepickleCharacterSuiteImp.config.SourceTexts === 'undefined') || (state.skepickleCharacterSuiteImp.config.SourceTexts === null)) {
        state.skepickleCharacterSuiteImp.config.SourceTexts = '';
      } else {
        let a = state.skepickleCharacterSuiteImp.config.SourceTexts.split(',');
        let b = [];
        for (let i=0; i<a.length; i++) {
          let p; try { p = eval('skepickleCharacterSuite_'+a[i]); } catch (e) { p = null; };
          if ((typeof p !== 'undefined') && (p !== null) &&
              (typeof p.source_text !== 'undefined') && (p.source_text !== null)) {
            b.push(a[i]);
          };
        };
        state.skepickleCharacterSuiteImp.config.SourceTexts = b.join(',');
      };
      // CHECK STATE MODERATE MOVEMENT
      if ((typeof state.skepickleCharacterSuiteImp.moderate_movement === 'undefined') || (state.skepickleCharacterSuiteImp.moderate_movement === null)) {
        state.skepickleCharacterSuiteImp.moderate_movement = { subject: {}, path: {}, shadow: {} };
      } else {
        if ((typeof state.skepickleCharacterSuiteImp.moderate_movement.subject === 'undefined') || (state.skepickleCharacterSuiteImp.moderate_movement.subject === null)) {
          state.skepickleCharacterSuiteImp.moderate_movement.subject = {};
        };
        if ((typeof state.skepickleCharacterSuiteImp.moderate_movement.path === 'undefined') || (state.skepickleCharacterSuiteImp.moderate_movement.path === null)) {
          state.skepickleCharacterSuiteImp.moderate_movement.path = {};
        };
        if ((typeof state.skepickleCharacterSuiteImp.moderate_movement.shadow === 'undefined') || (state.skepickleCharacterSuiteImp.moderate_movement.shadow === null)) {
          state.skepickleCharacterSuiteImp.moderate_movement.shadow = {};
        };
        let paths_in_use = [];
        let shadows_in_use = [];
        for (let id in state.skepickleCharacterSuiteImp.moderate_movement.subject) {
          let o = getObj("graphic", id);
          if ((typeof o === 'undefined') || (o === null)) {
            let path_obj = getObj("path", state.skepickleCharacterSuiteImp.moderate_movement.subject[id].path);
            if ((typeof path_obj !== 'undefined') && (path_obj !== null)) {
              path_obj.remove();
            };
            delete state.skepickleCharacterSuiteImp.moderate_movement.path[state.skepickleCharacterSuiteImp.moderate_movement.subject[id].path];
            let shadow_obj = getObj("graphic", state.skepickleCharacterSuiteImp.moderate_movement.subject[id].path);
            if ((typeof shadow_obj !== 'undefined') && (shadow_obj !== null)) {
              shadow_obj.remove();
            };
            delete state.skepickleCharacterSuiteImp.moderate_movement.shadow[state.skepickleCharacterSuiteImp.moderate_movement.subject[id].shadow];
            delete state.skepickleCharacterSuiteImp.moderate_movement.subject[id];
          } else {
            paths_in_use.push(state.skepickleCharacterSuiteImp.moderate_movement.subject[id].path);
            shadows_in_use.push(state.skepickleCharacterSuiteImp.moderate_movement.subject[id].shadow);
          };
        };
        for (let id in state.skepickleCharacterSuiteImp.moderate_movement.path) {
          if (!paths_in_use.includes(id)) {
            let o = getObj("path", id);
            if ((typeof o !== 'undefined') && (o !== null)) {
              o.remove();
            };
            delete state.skepickleCharacterSuiteImp.moderate_movement.path[id];
          };
        };
        for (let id in state.skepickleCharacterSuiteImp.moderate_movement.shadow) {
          if (!shadows_in_use.includes(id)) {
            let o = getObj("graphic", id);
            if ((typeof o !== 'undefined') && (o !== null)) {
              o.remove();
            };
            delete state.skepickleCharacterSuiteImp.moderate_movement.shadow[id];
          };
        };
      };
      // CHECK STATE GRAPHIC-ATTACHMENT
      if ((typeof state.skepickleCharacterSuiteImp.graphic_attachment === 'undefined') || (state.skepickleCharacterSuiteImp.graphic_attachment === null)) {
        state.skepickleCharacterSuiteImp.graphic_attachment = {};
      } else {
        for (let id in state.skepickleCharacterSuiteImp.graphic_attachment) {
          let o = getObj("graphic", id);
          if ((typeof o === 'undefined') || (o === null)) {
            if (state.skepickleCharacterSuiteImp.graphic_attachment[id].role === "subject") {
              for (let o_id in state.skepickleCharacterSuiteImp.graphic_attachment[id].objects) {
                let o_obj = getObj("graphic", o_id);
                if ((typeof o_obj !== 'undefined') && (o_obj !== null)) {
                  o_obj.remove();
                };
                delete state.skepickleCharacterSuiteImp.graphic_attachment[o_id];
              };
            };
            delete state.skepickleCharacterSuiteImp.graphic_attachment[id];
          } else {
            if ((state.skepickleCharacterSuiteImp.graphic_attachment[id].role === "subject") &&
                (typeof state.skepickleCharacterSuiteImp.graphic_attachment[id].objects !== 'undefined') &&
                (state.skepickleCharacterSuiteImp.graphic_attachment[id].objects.length == 0)) {
              delete state.skepickleCharacterSuiteImp.graphic_attachment[id];
            };
          };
        };
      };
      // CHECK STATE TEXT-MARKER
      if ((typeof state.skepickleCharacterSuiteImp.text_marker === 'undefined') || (state.skepickleCharacterSuiteImp.text_marker === null)) {
        state.skepickleCharacterSuiteImp.text_marker = { };
      };
    };

    temp.spinInterval = setInterval(animateTextMarkers,constants.rotationStepRate);

    delete state.skepickleCharacterSuiteImp.text_attachment;
    //delete state["siliceousMMFixer"];
    //delete state["siliceousTokenLibImp"];
    //delete state["skepickleTokenLibImp"];
    //delete state["skepickleCharacterLibImp"];
    //log(state);
    log("########## skepickleCharacterSuite");
    log("########## State data for skepickleCharacterSuite");
    prettyPrint(state.skepickleCharacterSuiteImp).split(/\n/).forEach(o => { log(o); });
    //log(prettyPrint(state.skepickleCharacterSuiteImp));
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
  skepickleCharacterSuite.CheckInstall();
  skepickleCharacterSuite.Initialize();
  skepickleCharacterSuite.RegisterEventHandlers();
});
