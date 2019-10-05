// skepickleCharacterSuite

// Purpose: Provide a suite of functionality to improve player and GM experience when using Diana P's D&D 3.5 character sheet.
// ANSI Text Generator: http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow

var skepickleCharacterSuite = skepickleCharacterSuite || (function skepickleCharacterSuiteImp() {
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
    campaignLoaded: false,
    //GMPlayer: Campaign
  };

  // ███████╗████████╗██████╗ ██╗███╗   ██╗ ██████╗     ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗███████╗███████╗
  // ██╔════╝╚══██╔══╝██╔══██╗██║████╗  ██║██╔════╝     ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝██║██╔════╝██╔════╝
  // ███████╗   ██║   ██████╔╝██║██╔██╗ ██║██║  ███╗    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║█████╗  ███████╗
  // ╚════██║   ██║   ██╔══██╗██║██║╚██╗██║██║   ██║    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║██╔══╝  ╚════██║
  // ███████║   ██║   ██║  ██║██║██║ ╚████║╚██████╔╝    ╚██████╔╝   ██║   ██║███████╗██║   ██║   ██║███████╗███████║
  // ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝      ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝

  var nonvalue_characters = [""," ","-","֊","־","᠆","‐","‑","‒","–","—","―","⁻","₋","−","⸺","⸻","﹘","﹣","－"];

  var stringToTitleCase = function(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    };
    return str.join(' ');
  }; // stringToTitleCase

  var stringTrimWhitespace = function(str) {
    return str.replace(/ +/g, " ").replace(/^ /, "").replace(/ $/, "").replace(/ *, */g, ",");
  }; // stringTrimWhitespace

  var getStringRegister = function(str,register) {
    // {register}2|efftype:e|damtype:k|end3|norange|pe|str13|wo1{/register}
    var startPos = str.indexOf("{"  + register + "}");
    var endPos   = str.indexOf("{/" + register + "}");
    if ((startPos == -1) || (endPos == -1)) { return null; };
    return str.substr(startPos+register.length+2, (endPos-startPos)-(register.length+2)).split('|');
  }; // getStringRegister

  var setStringRegister = function(str,register,values=null) {
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

  var generateUUID = (function() {
    "use strict";
    var a = 0, b = [];
    return function() {
      var c = (new Date()).getTime() + 0, d = c === a;
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

  var generateRowID = function() {
    "use strict";
    return generateUUID().replace(/_/g, "Z");
  };

  // ██████╗    ██╗   ██████╗     ██████╗    ███████╗    ████████╗ █████╗ ██████╗ ██╗     ███████╗███████╗
  // ██╔══██╗   ██║   ██╔══██╗    ╚════██╗   ██╔════╝    ╚══██╔══╝██╔══██╗██╔══██╗██║     ██╔════╝██╔════╝
  // ██║  ██║████████╗██║  ██║     █████╔╝   ███████╗       ██║   ███████║██████╔╝██║     █████╗  ███████╗
  // ██║  ██║██╔═██╔═╝██║  ██║     ╚═══██╗   ╚════██║       ██║   ██╔══██║██╔══██╗██║     ██╔══╝  ╚════██║
  // ██████╔╝██████║  ██████╔╝    ██████╔╝██╗███████║       ██║   ██║  ██║██████╔╝███████╗███████╗███████║
  // ╚═════╝ ╚═════╝  ╚═════╝     ╚═════╝ ╚═╝╚══════╝       ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚══════╝

  var dnd35 = {
    all_source_texts: {
      SRD:     "System Reference Document",
      UA:      "Unearthed Arcana",
      PHB:     "Player's Handbook",
      MM:      "Monster Manual",
      XPH:     "Expanded Psionics Handbook",
      OA:      "Oriental Adventures",
      ToB:     "Tome of Battle",
      BoED:    "Book of Exalted Deeds",
      unknown: "Unknown Text"
    },
    enabled_source_texts: ['SRD','UA','MM','XPH'],
    source_text_SRD: {
      movement_modes:      ['burrow','climb','fly','swim'],
      fly_maneuverability: ['perfect','good','average','poor','clumsy'],
      size_categories:     ['fine','diminutive','tiny','small','medium','large','huge','gargantuan','colossal'],
      types:               ['aberration','animal','celestial','construct','dragon','elemental','fey','fiend','giant','humanoid','magical beast','monstrous humanoid','ooze','outsider','plant','undead','vermin'],
      subtypes: {
        creature: ['air','angel','aquatic','archon','augmented','chaotic','cold','demon','devil','earth','evil','extraplanar','fire','good','incorporeal','lawful','native','psionic','shapeshifter','swarm','water'],
        humanoid: ['aquatic','dwarf','elf','gnoll','gnome','goblinoid','halfling','human','orc','reptilian']
      },
      skills: {
        'ability:strength':         {base: 'strength',                 attrib: 'str-mod',                                           trained_only:false },
        'ability:dexterity':        {base: 'dexterity',                attrib: 'dex-mod',                                           trained_only:false },
        'ability:constitution':     {base: 'constitution',             attrib: 'con-mod',                                           trained_only:false },
        'ability:intelligence':     {base: 'intelligence',             attrib: 'int-mod',                                           trained_only:false },
        'ability:wisdom':           {base: 'wisdom',                   attrib: 'wis-mod',                                           trained_only:false },
        'ability:charisma':         {base: 'charisma',                 attrib: 'cha-mod',                                           trained_only:false },
        'appraise':                 {base: 'appraise',                 attrib: 'appraise',                                          trained_only:false },
        'autohypnosis':             {base: 'autohypnosis',             attrib: '',                  default_ability_mod: 'wis-mod', trained_only:true  },
        'balance':                  {base: 'balance',                  attrib: 'balance',                                           trained_only:false },
        'bluff':                    {base: 'bluff',                    attrib: 'bluff',                                             trained_only:false },
        'climb':                    {base: 'climb',                    attrib: 'climb',                                             trained_only:false },
        'concentration':            {base: 'concentration',            attrib: 'concentration',                                     trained_only:false },
        'craft()':                  {base: 'craft',                    attrib: 'craft#',            default_ability_mod: 'int-mod', trained_only:false },
        'decipher script':          {base: 'decipher script',          attrib: 'decipherscript',                                    trained_only:true  },
        'diplomacy':                {base: 'diplomacy',                attrib: 'diplomacy',                                         trained_only:false },
        'disable device':           {base: 'disable device',           attrib: 'disabledevice',                                     trained_only:true  },
        'disguise':                 {base: 'disguise',                 attrib: 'disguise',                                          trained_only:false },
        'escape artist':            {base: 'escape artist',            attrib: 'escapeartist',                                      trained_only:false },
        'forgery':                  {base: 'forgery',                  attrib: 'forgery',                                           trained_only:false },
        'gather information':       {base: 'gather information',       attrib: 'gatherinformation',                                 trained_only:false },
        'handle animal':            {base: 'handle animal',            attrib: 'handleanimal',                                      trained_only:true  },
        'heal':                     {base: 'heal',                     attrib: 'heal',                                              trained_only:false },
        'hide':                     {base: 'hide',                     attrib: 'hide',                                              trained_only:false },
        'intimidate':               {base: 'intimidate',               attrib: 'intimidate',                                        trained_only:false },
        'jump':                     {base: 'jump',                     attrib: 'jump',                                              trained_only:false },
        'knowledge(arcana)':        {base: 'knowledge(arcana)',        attrib: 'knowarcana',                                        trained_only:true  },
        'knowledge(engineering)':   {base: 'knowledge(engineering)',   attrib: 'knowengineer',                                      trained_only:true  },
        'knowledge(dungeoneering)': {base: 'knowledge(dungeoneering)', attrib: 'knowdungeon',                                       trained_only:true  },
        'knowledge(geography)':     {base: 'knowledge(geography)',     attrib: 'knowgeography',                                     trained_only:true  },
        'knowledge(history)':       {base: 'knowledge(history)',       attrib: 'knowhistory',                                       trained_only:true  },
        'knowledge(local)':         {base: 'knowledge(local)',         attrib: 'knowlocal',                                         trained_only:true  },
        'knowledge(nature)':        {base: 'knowledge(nature)',        attrib: 'knownature',                                        trained_only:true  },
        'knowledge(nobility)':      {base: 'knowledge(nobility)',      attrib: 'knownobility',                                      trained_only:true  },
        'knowledge(religion)':      {base: 'knowledge(religion)',      attrib: 'knowreligion',                                      trained_only:true  },
        'knowledge(the planes)':    {base: 'knowledge(the planes)',    attrib: 'knowplanes',                                        trained_only:true  },
        'knowledge()':              {base: 'knowledge',                attrib: '',                  default_ability_mod: 'int-mod', trained_only:true  },
        'speak language()':         {base: 'speak language',           attrib: '',                  default_ability_mod: '',        trained_only:true  },
        'listen':                   {base: 'listen',                   attrib: 'listen',                                            trained_only:false },
        'move silently':            {base: 'move silently',            attrib: 'movesilent',                                        trained_only:false },
        'open lock':                {base: 'open lock',                attrib: 'openlock',                                          trained_only:true  },
        'perform()':                {base: 'perform',                  attrib: 'perform#',          default_ability_mod: 'cha-mod', trained_only:false },
        'profession()':             {base: 'profession',               attrib: 'profession#',       default_ability_mod: 'wis-mod', trained_only:true  },
        'psicraft':                 {base: 'psicraft',                 attrib: '',                  default_ability_mod: 'int-mod', trained_only:true  },
        'ride':                     {base: 'ride',                     attrib: 'ride',                                              trained_only:false },
        'search':                   {base: 'search',                   attrib: 'search',                                            trained_only:false },
        'sense motive':             {base: 'sense motive',             attrib: 'sensemotive',                                       trained_only:false },
        'sleight of hand':          {base: 'sleight of hand',          attrib: 'sleightofhand',                                     trained_only:true  },
        'spellcraft':               {base: 'spellcraft',               attrib: 'spellcraft',                                        trained_only:true  },
        'spot':                     {base: 'spot',                     attrib: 'spot',                                              trained_only:false },
        'survival':                 {base: 'survival',                 attrib: 'survival',                                          trained_only:false },
        'swim':                     {base: 'swim',                     attrib: 'swim',                                              trained_only:false },
        'tumble':                   {base: 'tumble',                   attrib: 'tumble',                                            trained_only:true  },
        'use magic device':         {base: 'use magic device',         attrib: 'usemagicdevice',                                    trained_only:true  },
        'use psionic device':       {base: 'use psionic device',       attrib: '',                  default_ability_mod: 'cha-mod', trained_only:true  },
        'use rope':                 {base: 'use rope',                 attrib: 'userope',                                           trained_only:false } },
      light_sources: {
        'none':              { radius: '',   dim: '',   angle: '' },
        'candle':            { radius: 5,    dim: 0,    angle: '' },
        'everburning torch': { radius: 40,   dim: 20,   angle: '' },
        'common lamp':       { radius: 30,   dim: 15,   angle: '' },
        'bullseye lantern':  { radius: 120,  dim: 60,   angle: 90 },
        'hooded lantern':    { radius: 60,   dim: 30,   angle: '' },
        'sunrod':            { radius: 60,   dim: 30,   angle: '' },
        'torch':             { radius: 40,   dim: 20,   angle: '' },
        'daylight (spell)':  { radius: 120,  dim: 60,   angle: '' } },
      spells: {
        // NOTE: Use '↲' character to indicate a carriage return
        // NOTE: Use '’' character for appostrophes...
        // NOTE: Use ‹ and › characters to delimiter ... a chat button
        // NOTE: Use « and » characters to delimiter ... a chat button with escaped attributes/abilities
        //'acid arrow':   { ref: 'https://www.dandwiki.com/wiki/SRD:Acid_Arrow',   school: 'Conjuration↲(Creation) [Acid]',             level: 'Sor/Wiz 2',                  components: 'V, S, M, F', casting_time: '1 standard action', range: 'long',   target_type: 'Effect', target: 'One arrow of acid',                                                                                                                                                    duration: '[[1+floor([[?{Casting Level}/3]])]] round(s)',   saving_throw: 'None',                            spell_resistance: 'No',                     text: 'A magical arrow of acid springs from your hand and speeds to its target. You must succeed on a ranged touch attack to hit your target. The arrow deals [[2d4]] points of acid damage with no splash damage. The acid, unless somehow neutralized, lasts for another [[floor({?{Casting Level},18}kl1/3)]] round(s), dealing another ‹2d4|Delayed *Acid Arrow* Damage: [[2d4]] acid› points of damage each round.',                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          material: '**Material Component:** Powdered rhubarb leaf and an adder’s stomach.↲**Focus:** A dart.' },
        'acid arrow': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Acid_Arrow',
          school:           'Conjuration↲(Creation) [Acid]',
          level:            'Sor/Wiz 2',
          components:       'V, S, M, F',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Effect',
          target:           'One arrow of acid',
          duration:         '[[1+floor([[?{Casting Level}/3]])]] round(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             'A magical arrow of acid springs from your hand and speeds to its target. You must succeed on a ranged touch attack to hit your target. The arrow deals [[2d4]] points of acid damage with no splash damage. The acid, unless somehow neutralized, lasts for another [[floor({?{Casting Level},18}kl1/3)]] round(s), dealing another ‹2d4|***Acid Arrow***: [[2d4]] delayed acid damage› points of damage each round.',
          material:         '**Material Component:** Powdered rhubarb leaf and an adder’s stomach.↲**Focus:** A dart.'
        },
        'acid fog': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Acid_Fog',
          school:           'Conjuration↲(Creation) [Acid]',
          level:            'Sor/Wiz 6, Water 7',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Fog spreads in 20-ft. radius, 20 ft. high',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             '*Acid fog* creates a billowing mass of misty vapors similar to that produced by a [*solid fog*](https://www.dandwiki.com/wiki/SRD:Solid_Fog) spell. In addition to slowing creatures down and obscuring sight, this spell’s vapors are highly acidic. Each round on your turn, starting when you cast the spell, the fog deals ‹2d6› points of acid damage to each creature and object within it.',
          material:         '**Arcane Material Component:** A pinch of dried, powdered peas combined with powdered animal hoof.' },
        'acid splash': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Acid_Splash',
          school:           'Conjuration↲(Creation) [Acid]',
          level:            'Sor/Wiz 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'One missile of acid',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             'You fire a small orb of acid at the target. You must succeed on a ranged touch attack to hit your target. The orb deals [[1d3]] points of acid damage.',
          material: null
        },
        'aid': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Aid',
          school:           'Enchantment↲(Compulsion) [Mind-Affecting]',
          level:            'Clr 2, Good 2, Luck 2',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          targer_type:      'Target',
          target:           'Living creature touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes (harmless)',
          text:             '*Aid* grants the target a \`\`+1\`\` morale bonus on attack rolls and saves against fear effects, plus ‹temporary hit points|[[1d8+[[{?{Casting Level},10}kl1]]]]› equal to 1d8 + caster level (to a maximum of 1d8+10 temporary hit points at caster level 10th).',
          material:         null
        },
        'air walk': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Air_Walk',
          school:           'Transmutation↲[Air]',
          level:            'Air 4, Clr 4, Drd 4',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature (Gargantuan or smaller) touched',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes (harmless)',
          text:             `The subject can tread on air as if walking on solid ground. Moving upward is similar to walking up a hill. The maximum upward or downward angle possible is 45 degrees, at a rate equal to one-half the air walker’s normal speed.
                             A strong wind (21+ mph) can push the subject along or hold it back. At the end of its turn each round, the wind blows the air walker 5 feet for each 5 miles per hour of wind speed. The creature may be subject to additional penalties in exceptionally strong or turbulent winds, such as loss of control over movement or physical damage from being buffeted about.
                             Should the spell duration expire while the subject is still aloft, the magic fails slowly. The subject floats downward 60 feet per round for ‹1d6› rounds. If it reaches the ground in that amount of time, it lands safely. If not, it falls the rest of the distance, taking ‹1d6› points of damage per 10 feet of fall. Since dispelling a spell effectively ends it, the subject also descends in this way if the *air walk* spell is dispelled, but not if it is negated by an *antimagic* field.
                             You can cast *air walk* on a specially trained mount so it can be ridden through the air. You can train a mount to move with the aid of *air walk* (counts as a trick; see Handle Animal skill) with one week of work and a DC 25 Handle Animal check.`,
          material:         null
        },
        'alarm': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Alarm',
          school:           'Abjuration',
          level:            'Brd 1, Rgr 1, Sor/Wiz 1',
          components:       'V, S, F/DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Area',
          target:           '20-ft.-radius emanation centered on a point in space',
          duration:         '[[2*?{Casting Level}]] hour(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `*Alarm* sounds a mental or audible alarm each time a creature of Tiny or larger size enters the warded area or touches it. A creature that speaks the password (determined by you at the time of casting) does not set off the *alarm*. You decide at the time of casting whether the *alarm* will be mental or audible.
                             *Mental Alarm:* A mental *alarm* alerts you (and only you) so long as you remain within 1 mile of the warded area. You note a single mental “ping” that awakens you from normal sleep but does not otherwise disturb concentration. A *silence* spell has no effect on a mental *alarm*.
                             *Audible Alarm:* An audible *alarm* produces the sound of a hand bell, and anyone within 60 feet of the warded area can hear it clearly. Reduce the distance by 10 feet for each interposing closed door and by 20 feet for each substantial interposing wall.
                             In quiet conditions, the ringing can be heard faintly as far as 180 feet away. The sound lasts for 1 round. Creatures within a *silence* spell cannot hear the ringing.
                             Ethereal or astral creatures do not trigger the *alarm*.
                             *Alarm* can be made permanent with a *permanency* spell.`,
          material:         '**Arcane Focus:** A tiny bell and a piece of very fine silver wire.'
        },
        'align weapon': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Align_Weapon',
          school:           'Transmutation↲[see text]',
          level:            'Clr 2',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Weapon touched or fifty projectiles (all of which must be in contact with each other at the time of casting)',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless, object)',
          spell_resistance: 'Yes (harmless, object)',
          text:             `*Align weapon* makes a weapon good, evil, lawful, or chaotic, as you choose. A weapon that is aligned can bypass the damage reduction of certain creatures. This spell has no effect on a weapon that already has an alignment.
                             You can’t cast this spell on a natural weapon, such as an unarmed strike.
                             When you make a weapon good, evil, lawful, or chaotic, *align weapon* is a good, evil, lawful, or chaotic spell, respectively.`,
          material:         null
        },
        'alter self': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Alter_Self',
          school:           'Transmutation',
          level:            'Asn 2, Brd 2, Sor/Wiz 2',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     null,
          spell_resistance: null,
          text:             `You assume the form of a creature of the same type as your normal form. The new form must be within one size category of your normal size. The maximum HD of an assumed form is equal to your caster level, to a maximum of 5 HD at 5th level. You can change into a member of your own kind or even into yourself.
                             You retain your own ability scores. Your class and level, hit points, alignment, base attack bonus, and base save bonuses all remain the same. You retain all supernatural and spell-like special attacks and qualities of your normal form, except for those requiring a body part that the new form does not have (such as a mouth for a breath weapon or eyes for a gaze attack).
                             You keep all extraordinary special attacks and qualities derived from class levels, but you lose any from your normal form that are not derived from class levels.
                             If the new form is capable of speech, you can communicate normally. You retain any spellcasting ability you had in your original form, but the new form must be able to speak intelligibly (that is, speak a language) to use verbal components and must have limbs capable of fine manipulation to use somatic or material components.
                             You acquire the physical qualities of the new form while retaining your own mind. Physical qualities include natural size, mundane movement capabilities (such as burrowing, climbing, walking, swimming, and flight with wings, to a maximum speed of 120 feet for flying or 60 feet for nonflying movement), natural armor bonus, natural weapons (such as claws, bite, and so on), racial skill bonuses, racial bonus feats, and any gross physical qualities (presence or absence of wings, number of extremities, and so forth). A body with extra limbs does not allow you to make more attacks (or more advantageous two-weapon attacks) than normal.
                             You do not gain any extraordinary special attacks or special qualities not noted above under physical qualities, such as darkvision, low-light vision, blindsense, blindsight, fast healing, regeneration, scent, and so forth.
                             You do not gain any supernatural special attacks, special qualities, or spell-like abilities of the new form. Your creature type and subtype (if any) remain the same regardless of your new form. You cannot take the form of any creature with a template, even if that template doesn’t change the creature type or subtype.
                             You can freely designate the new form’s minor physical qualities (such as hair color, hair texture, and skin color) within the normal ranges for a creature of that kind. The new form’s significant physical qualities (such as height, weight, and gender) are also under your control, but they must fall within the norms for the new form’s kind. You are effectively disguised as an average member of the new form’s race. If you use this spell to create a disguise, you get a \`\`+10\`\` bonus on your Disguise check.
                             When the change occurs, your equipment, if any, either remains worn or held by the new form (if it is capable of wearing or holding the item), or melds into the new form and becomes nonfunctional. When you revert to your true form, any objects previously melded into the new form reappear in the same location on your body they previously occupied and are once again functional. Any new items you wore in the assumed form and can’t wear in your normal form fall off and land at your feet; any that you could wear in either form or carry in a body part common to both forms at the time of reversion are still held in the same way. Any part of the body or piece of equipment that is separated from the whole reverts to its true form.`,
          material:         null
        },
        'analyze dweomer': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Analyze_Dweomer',
          school:           'Divination',
          level:            'Brd 6, Sor/Wiz 6',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] object(s) or creature(s)',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'None or Will negates; see text',
          spell_resistance: 'No',
          text:             `You discern all spells and magical properties present in a number of creatures or objects. Each round, you may examine a single creature or object that you can see as a free action. In the case of a magic item, you learn its functions, how to activate its functions (if appropriate), and how many charges are left (if it uses charges). In the case of an object or creature with active spells cast upon it, you learn each spell, its effect, and its caster level.
                             An attended object may attempt a Will save to resist this effect if its holder so desires. If the save succeeds, you learn nothing about the object except what you can discern by looking at it. An object that makes its save cannot be affected by any other *analyze dweomer* spells for 24 hours.
                             *Analyze dweomer* does not function when used on an artifact.`,
          material:         '**Focus:** A tiny lens of ruby or sapphire set in a small golden loop. The gemstone must be worth at least 1,500 gp.'
        },
        'animal growth': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animal_Growth',
          school:           'Transmutation',
          level:            'Drd 5, Rgr 4, Scalykind 5, Sor/Wiz 5',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Targets',
          target:           'Up to [[floor(?{Casting Level}/2)]] animal(s) (Gargantuan or smaller), no two of which can be more than 30 ft. apart',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `A number of animals grow to twice their normal size and eight times their normal weight. This alteration changes each animal’s size category to the next largest, grants it a \`\`+8\`\` size bonus to Strength and a \`\`+4\`\` size bonus to Constitution (and thus an extra 2 hit points per HD), and imposes a \`\`-2\`\` size penalty to Dexterity. The creature’s existing natural armor bonus increases by 2. The size change also affects the animal’s modifier to AC and attack rolls and its base damage. The animal’s space and reach change as appropriate to the new size, but its speed does not change.
                             The spell also grants each subject damage reduction 10/magic and a \`\`+4\`\` resistance bonus on saving throws. If insufficient room is available for the desired growth, the creature attains the maximum possible size and may make a Strength check (using its increased Strength) to burst any enclosures in the process. If it fails, it is constrained without harm by the materials enclosing it— the spell cannot be used to crush a creature by increasing its size.
                             All equipment worn or carried by an animal is similarly enlarged by the spell, though this change has no effect on the magical properties of any such equipment.
                             Any enlarged item that leaves the enlarged creature’s possession instantly returns to its normal size.
                             The spell gives no means of command or influence over the enlarged animals.
                             Multiple magical effects that increase size do not stack.`,
          material:         null
        },
        'animal messenger': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animal_Messenger',
          school:           'Enchantment↲(Compulsion) [Mind-Affecting]',
          level:            'Brd 2, Drd 2, Rgr 1',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One Tiny animal',
          duration:         '[[?{Casting Level}]] day(s)',
          saving_throw:     'None; see text',
          spell_resistance: 'Yes',
          text:             `You compel a Tiny animal to go to a spot you designate. The most common use for this spell is to get an animal to carry a message to your allies. The animal cannot be one tamed or trained by someone else, including such creatures as familiars and animal companions.
                             Using some type of food desirable to the animal as a lure, you call the animal to you. It advances and awaits your bidding. You can mentally impress on the animal a certain place well known to you or an obvious landmark. The directions must be simple, because the animal depends on your knowledge and can’t find a destination on its own. You can attach some small item or note to the messenger. The animal then goes to the designated location and waits there until the duration of the spell expires, whereupon it resumes its normal activities.
                             During this period of waiting, the messenger allows others to approach it and remove any scroll or token it carries. The intended recipient gains no special ability to communicate with the animal or read any attached message (if it’s written in a language he or she doesn’t know, for example).`,
          material:         '**Material Component:** A morsel of food the animal likes.'
        },
        'animal shapes': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animal_Shapes',
          school:           'Transmutation',
          level:            'Animal 7, Drd 8, Scalykind 8',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           'Up to [[?{Casting Level}]] willing creature(s), all within 30 ft. of each other',
          duration:         '[[?{Casting Level}]] hour(s) (D)',
          saving_throw:     'None; see text',
          spell_resistance: 'Yes (harmless)',
          text:             'You transform up to one willing creature per caster level into an animal of your choice; the spell has no effect on unwilling creatures. Use the alternate form special ability to determine each target’s new abilities. All creatures must take the same kind of animal form. Recipients remain in the animal form until the spell expires or until you dismiss it for all recipients. In addition, an individual subject may choose to resume its normal form as a full-round action; doing so ends the spell for that subject alone. The maximum HD of an assumed form is equal to the subject’s HD or your caster level, whichever is lower, to a maximum of 20 HD at 20th level.',
          material:         null
        },
        'animal trance': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animal_Trance',
          school:           'Enchantment↲(Compulsion) [Mind-Affecting, Sonic]',
          level:            'Brd 2, Drd 2, Scalykind 2',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           'Animals or magical beasts with Intelligence 1 or 2',
          duration:         'Concentration',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `Your swaying motions and music (or singing, or chanting) compel animals and magical beasts to do nothing but watch you. Only a creature with an Intelligence score of 1 or 2 can be fascinated by this spell. Roll ‹2d6› to determine the total number of HD worth of creatures that you fascinate. The closest targets are selected first until no more targets within range can be affected.
                             A magical beast, a dire animal, or an animal trained to attack or guard is allowed a saving throw; an animal not trained to attack or guard is not.`,
          material:         null
        },
        'animate dead': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animate_Dead',
          school:           'Necromancy↲[Evil]',
          level:            'Clr 3, Death 3, Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           'One or more corpses touched',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell turns the bones or bodies of dead creatures into undead skeletons or zombies that follow your spoken commands.
                             The undead can follow you, or they can remain in an area and attack any creature (or just a specific kind of creature) entering the place. They remain animated until they are destroyed. (A destroyed skeleton or zombie can’t be animated again.)
                             Regardless of the type of undead you create with this spell, you can’t create more HD of undead than twice your caster level with a single casting of *animate dead*. (The *desecrate* spell doubles this limit)
                             The undead you create remain under your control indefinitely. No matter how many times you use this spell, however, you can control only 4 HD worth of undead creatures per caster level. If you exceed this number, all the newly created creatures fall under your control, and any excess undead from previous castings become uncontrolled. (You choose which creatures are released.) If you are a cleric, any undead you might command by virtue of your power to command or rebuke undead do not count toward the limit.
                             *Skeletons:* A skeleton can be created only from a mostly intact corpse or skeleton. The corpse must have bones. If a skeleton is made from a corpse, the flesh falls off the bones.
                             *Zombies:* A zombie can be created only from a mostly intact corpse. The corpse must be that of a creature with a true anatomy.`,
          material:         '**Material Component:** You must place a black onyx gem worth at least 25 gp per Hit Die of the undead into the mouth or eye socket of each corpse you intend to animate. The magic of the spell turns these gems into worthless, burned-out shells.'
        },
        'animate objects': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animate_Objects',
          school:           'Transmutation',
          level:            'Brd 6, Chaos 6, Clr 6',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] Small object(s); see text',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You imbue inanimate objects with mobility and a semblance of life. Each such animated object then immediately attacks whomever or whatever you initially designate.
                             An animated object can be of any nonmagical material. You may animate one Small or smaller object or an equivalent number of larger objects per caster level. A Medium object counts as two Small or smaller objects, a Large object as four, a Huge object as eight, a Gargantuan object as sixteen, and a Colossal object as thirty-two. You can change the designated target or targets as a move action, as if directing an active spell.
                             This spell cannot animate objects carried or worn by a creature.
                             *Animate objects* can be made permanent with a *permanency* spell.`,
          material:         null
        },
        'animate plants': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animate_Plants',
          school:           'Transmutation',
          level:            'Drd 7, Plant 7',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           '[[floor(?{Casting Level}/3)]] Large plant(s) or all plants within range; see text',
          duration:         '[[?{Casting Level}]] round(s) or [[?{Casting Level}]] hour(s); see text',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You imbue inanimate plants with mobility and a semblance of life. Each animated plant then immediately attacks whomever or whatever you initially designate as though it were an animated object of the appropriate size category. You may animate one Large or smaller plant, or an equivalent number of larger plants, per three caster levels. A Huge plant counts as two Large or smaller plants, a Gargantuan plant as four, and a Colossal plant as eight. You can change the designated target or targets as a move action, as if directing an active spell.
                             Use the statistics for animated objects, except that plants smaller than Large usually don’t have hardness.
                             *Animate plants* cannot affect plant creatures, nor does it affect nonliving vegetable material.
                             *Entangle:* Alternatively, you may imbue all plants within range with a degree of mobility, which allows them to entwine around creatures in the area. This usage of the spell duplicates the effect of an *entangle* spell. Spell resistance does not keep creatures from being entangled. This effect lasts 1 hour per caster level.`,
          material:         null
        },
        'animate rope': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animate_Rope',
          school:           'Transmutation',
          level:            'Artifice 1, Brd 1, Sor/Wiz 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One ropelike object, length up to [[50+(5*?{Casting Level})]] ft.; see text',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can animate a nonliving ropelike object. The maximum length assumes a rope with a 1-inch diameter.
                             Reduce the maximum length by 50% for every additional inch of thickness, and increase it by 50% for each reduction of the rope’s diameter by half.
                             The possible commands are “coil” (form a neat, coiled stack), “coil and knot,” “loop,” “loop and knot,” “tie and knot,” and the opposites of all of the above (“uncoil,” and so forth). You can give one command each round as a move action, as if directing an active spell.
                             The rope can enwrap only a creature or an object within 1 foot of it—it does not snake outward—so it must be thrown near the intended target. Doing so requires a successful ranged touch attack roll (range increment 10 feet). A typical 1-inch-diameter hempen rope has 2 hit points, AC 10, and requires a DC 23 Strength check to burst it. The rope does not deal damage, but it can be used as a trip line or to cause a single opponent that fails a Reflex saving throw to become entangled. A creature capable of spellcasting that is bound by this spell must make a DC 15 Concentration check to cast a spell. An entangled creature can slip free with a DC 20 Escape Artist check.
                             The rope itself and any knots tied in it are not magical.
                             This spell grants a \`\`+2\`\` bonus on any Use Rope checks you make when using the transmuted rope.
                             The spell cannot animate objects carried or worn by a creature.`,
          material:         null
        },
        'antilife shell': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Antilife_Shell',
          school:           'Abjuration',
          level:            'Animal 6, Clr 6, Drd 6',
          components:       'V, S, DF',
          casting_time:     '1 round',
          range:            '10 ft.',
          target_type:      'Area',
          target:           '10-ft.-radius emanation, centered on you',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `You bring into being a mobile, hemispherical energy field that prevents the entrance of most types of living creatures.
                             The effect hedges out animals, aberrations, dragons, fey, giants, humanoids, magical beasts, monstrous humanoids, oozes, plants, and vermin, but not constructs, elementals, outsiders, or undead.
                             This spell may be used only defensively, not aggressively. Forcing an abjuration barrier against creatures that the spell keeps at bay collapses the barrier.`,
          material:         null
        },
        'antimagic field': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Antimagic_Field',
          school:           'Abjuration',
          level:            'Clr 8, Magic 6, Protection 6, Sor/Wiz 6',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            '10 ft.',
          target_type:      'Area',
          target:           '10-ft.-radius emanation, centered on you',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'See text',
          text:             `An invisible barrier surrounds you and moves with you. The space within this barrier is impervious to most magical effects, including spells, spell-like abilities, and supernatural abilities. Likewise, it prevents the functioning of any magic items or spells within its confines.
                             An *antimagic field* suppresses any spell or magical effect used within, brought into, or cast into the area, but does not dispel it. Time spent within an *antimagic field* counts against the suppressed spell’s duration.
                             Summoned creatures of any type and incorporeal undead wink out if they enter an *antimagic field*. They reappear in the same spot once the field goes away. Time spent winked out counts normally against the duration of the conjuration that is maintaining the creature. If you cast *antimagic field* in an area occupied by a summoned creature that has spell resistance, you must make a caster level check (1d20 + caster level) against the creature’s spell resistance to make it wink out. (The effects of instantaneous conjurations are not affected by an *antimagic field* because the conjuration itself is no longer in effect, only its result.)
                             A normal creature can enter the area, as can normal missiles. Furthermore, while a magic sword does not function magically within the area, it is still a sword (and a masterwork sword at that). The spell has no effect on golems and other constructs that are imbued with magic during their creation process and are thereafter self-supporting (unless they have been summoned, in which case they are treated like any other summoned creatures). Elementals, corporeal undead, and outsiders are likewise unaffected unless summoned. These creatures’ spell-like or supernatural abilities, however, may be temporarily nullified by the field. *Dispel magic* does not remove the field.
                             Two or more *antimagic fields* sharing any of the same space have no effect on each other. Certain spells, such as *wall of force*, *prismatic sphere*, and *prismatic wall*, remain unaffected by antimagic field (see the individual spell descriptions). Artifacts and deities are unaffected by mortal magic such as this.
                             Should a creature be larger than the area enclosed by the barrier, any part of it that lies outside the barrier is unaffected by the field.`,
          material:         '**Arcane Material Component:** A pinch of powdered iron or iron filings.'
        },
        'antipathy': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Antipathy',
          school:           'Enchantment↲(Compulsion) [Mind-Affecting]',
          level:            'Drd 9, Sor/Wiz 8',
          components:       'V, S, M/DF',
          casting_time:     '1 hour',
          range:            'close',
          target_type:      'Target',
          target:           'One location (up to [[?{Casting Level}]] 10-ft. cubes) or one object',
          duration:         '[[2*?{Casting Level}]] hour(s) (D)',
          saving_throw:     'Will partial',
          spell_resistance: 'Yes',
          text:             `You cause an object or location to emanate magical vibrations that repel either a specific kind of intelligent creature or creatures of a particular alignment, as defined by you. The kind of creature to be affected must be named specifically. A creature subtype is not specific enough. Likewise, the specific alignment to be repelled must be named.
                             Creatures of the designated kind or alignment feel an overpowering urge to leave the area or to avoid the affected item.
                             A compulsion forces them to abandon the area or item, shunning it and never willingly returning to it while the spell is in effect. A creature that makes a successful saving throw can stay in the area or touch the item but feels uncomfortable doing so. This distracting discomfort reduces the creature’s Dexterity score by 4 points.
                             *Antipathy* counters and dispels *sympathy*.`,
          material:         '**Arcane Material Component:** A lump of alum soaked in vinegar.'
        },
        'antiplant shell': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Antiplant_Shell',
          school:           'Abjuration',
          level:            'Drd 4',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '10 ft.',
          target_type:      'Area',
          target:           '10-ft.-radius emanation, centered on you',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `The *antiplant shell* spell creates an invisible, mobile barrier that keeps all creatures within the shell protected from attacks by plant creatures or animated plants. As with many abjuration spells, forcing the barrier against creatures that the spell keeps at bay strains and collapses the field.`,
          material:         null
        },
        'arcane eye': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Arcane_Eye',
          school:           'Divination↲(Scrying)',
          level:            'Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '10 minutes',
          range:            'Unlimited',
          target_type:      'Effect',
          target:           'Magical sensor',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You create an invisible magical sensor that sends you visual information. You can create the *arcane eye* at any point you can see, but it can then travel outside your line of sight without hindrance. An *arcane eye* travels at 30 feet per round (300 feet per minute) if viewing an area ahead as a human would (primarily looking at the floor) or 10 feet per round (100 feet per minute) if examining the ceiling and walls as well as the floor ahead. It sees exactly as you would see if you were there.
                             The eye can travel in any direction as long as the spell lasts. Solid barriers block its passage, but it can pass through a hole or space as small as 1 inch in diameter. The eye can’t enter another plane of existence, even through a *gate* or similar magical portal.
                             You must concentrate to use an *arcane eye*. If you do not concentrate, the eye is inert until you again concentrate.`,
          material:         '**Material Component:** A bit of bat fur.'
        },
        'arcane lock': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Arcane_Lock',
          school:           'Abjuration',
          level:            'Sor/Wiz 2',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'The door, chest, or portal touched, up to [[30*?{Casting Level}]] sq. ft. in size',
          duration:         'Permanent',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `An *arcane lock* spell cast upon a door, chest, or portal magically locks it. You can freely pass your own *arcane lock* without affecting it; otherwise, a door or object secured with this spell can be opened only by breaking in or with a successful *dispel magic* or *knock* spell. Add 10 to the normal DC to break open a door or portal affected by this spell. (A *knock* spell does not remove an *arcane lock*; it only suppresses the effect for 10 minutes.)`,
          material:         '**Material Component:** Gold dust worth 25 gp.'
        },
        'arcane mark': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Arcane_Mark',
          school:           'Universal',
          level:            'Sor/Wiz 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            '0 ft.',
          target_type:      'Effect',
          target:           'One personal rune or mark, all of which must fit within 1 sq. ft.',
          duration:         'Permanent',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell allows you to inscribe your personal rune or mark, which can consist of no more than six characters. The writing can be visible or invisible. An *arcane mark* spell enables you to etch the rune upon any substance without harm to the material upon which it is placed. If an invisible mark is made, a *detect magic* spell causes it to glow and be visible, though not necessarily understandable.
                             *See invisibility*, *true seeing*, a *gem of seeing*, or a *robe of eyes* likewise allows the user to see an invisible *arcane mark*. A *read magic* spell reveals the words, if any. The mark cannot be dispelled, but it can be removed by the caster or by an *erase* spell.
                             If an *arcane mark* is placed on a living being, normal wear gradually causes the effect to fade in about a month.
                             *Arcane mark* must be cast on an object prior to casting *instant summons* on the same object (see that spell description for details).`,
          material:         null
        },
        'arcane sight': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Arcane_Sight',
          school:           'Divination',
          level:            'Sor/Wiz 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          text:             `This spell makes your eyes glow blue and allows you to see magical auras within 120 feet of you. The effect is similar to that of a *detect magic* spell, but *arcane sight* does not require concentration and discerns aura location and power more quickly.
                             You know the location and power of all magical auras within your sight. An aura’s power depends on a spell’s functioning level or an item’s caster level, as noted in the description of the *detect magic* spell. If the items or creatures bearing the auras are in line of sight, you can make Spellcraft skill checks to determine the school of magic involved in each. (Make one check per aura; DC 15 + spell level, or 15 + one-half caster level for a nonspell effect.)
                             If you concentrate on a specific creature within 120 feet of you as a standard action, you can determine whether it has any spellcasting or spell-like abilities, whether these are arcane or divine (spell-like abilities register as arcane), and the strength of the most powerful spell or spell-like ability the creature currently has available for use.
                             *Arcane sight* can be made permanent with a *permanency* spell.`,
          material:         null
        },
        'armor of darkness': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Armor_of_Darkness',
          school:           'Abjuration↲[Darkness]',
          level:            'Darkness 4',
          components:       'V, S, D F',
          casting_time:     '1 action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The spell envelops the warded creature in a shroud of shadows. The shroud can, if the caster desires, conceal the wearer’s features. In any case, it grants the recipient a \`\`+3\`\` deflection bonus to Armor Class plus an additional \`\`+1\`\` for every four caster levels (maximum bonus +8). The subject can see through the armor as if it did not exist and is also afforded darkvision with a range of 60 feet. Finally, the subject gains a \`\`+2\`\` bonus on saving throws against any holy, good, or light spells or effects. Undead creatures that are subjects of *armor of darkness* also gain \`\`+4\`\` turn resistance.`,
          material:         null
        },
        'astral projection': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Astral_Projection',
          school:           'Necromancy',
          level:            'Clr 9, Sor/Wiz 9, Travel 9',
          components:       'V, S, M',
          casting_time:     '30 minutes',
          range:            'Touch',
          target_type:      'Targets',
          target:           'You plus [[floor(?{Casting Level}/2)]] additional willing creature(s) touched',
          duration:         'See text',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `By freeing your spirit from your physical body, this spell allows you to project an astral body onto another plane altogether.
                             You can bring the astral forms of other willing creatures with you, provided that these subjects are linked in a circle with you at the time of the casting. These fellow travelers are dependent upon you and must accompany you at all times. If something happens to you during the journey, your companions are stranded wherever you left them.
                             You project your astral self onto the Astral Plane, leaving your physical body behind on the Material Plane in a state of suspended animation. The spell projects an astral copy of you and all you wear or carry onto the Astral Plane. Since the Astral Plane touches upon other planes, you can travel astrally to any of these other planes as you will. To enter one, you leave the Astral Plane, forming a new physical body (and equipment) on the plane of existence you have chosen to enter.
                             While you are on the Astral Plane, your astral body is connected at all times to your physical body by a silvery cord. If the cord is broken, you are killed, astrally and physically. Luckily, very few things can destroy a silver cord. When a second body is formed on a different plane, the incorporeal silvery cord remains invisibly attached to the new body. If the second body or the astral form is slain, the cord simply returns to your body where it rests on the Material Plane, thereby reviving it from its state of suspended animation. Although astral projections are able to function on the Astral Plane, their actions affect only creatures existing on the Astral Plane; a physical body must be materialized on other planes.
                             You and your companions may travel through the Astral Plane indefinitely. Your bodies simply wait behind in a state of suspended animation until you choose to return your spirits to them. The spell lasts until you desire to end it, or until it is terminated by some outside means, such as *dispel magic* cast upon either the physical body or the astral form, the breaking of the silver cord, or the destruction of your body back on the Material Plane (which kills you).`,
          material:         '**Material Component:** A jacinth worth at least 1,000 gp, plus a silver bar worth 5 gp for each person to be affected.'
        },
        'atonement': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Atonement',
          school:           'Abjuration',
          level:            'Clr 5, Drd 5',
          components:       'V, S, M, F, DF, XP',
          casting_time:     '1 hour',
          range:            'Touch',
          target_type:      'Target',
          target:           'Living creature touched',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `This spell removes the burden of evil acts or misdeeds from the subject. The creature seeking *atonement* must be truly repentant and desirous of setting right its misdeeds. If the atoning creature committed the evil act unwittingly or under some form of compulsion, *atonement* operates normally at no cost to you. However, in the case of a creature atoning for deliberate misdeeds and acts of a knowing and willful nature, you must intercede with your deity (requiring you to expend 500 XP) in order to expunge the subject’s burden. Many casters first assign a subject of this sort a quest (see *geas/quest*) or similar penance to determine whether the creature is truly contrite before casting the *atonement* spell on its behalf.
                             *Atonement* may be cast for one of several purposes, depending on the version selected.
                             *Reverse Magical Alignment Change:* If a creature has had its alignment magically changed, *atonement* returns its alignment to its original status at no cost in experience points.
                             *Restore Class:* A paladin who has lost her class features due to committing an evil act may have her paladinhood restored to her by this spell.
                             *Restore Cleric or Druid Spell Powers:* A cleric or druid who has lost the ability to cast spells by incurring the anger of his or her deity may regain that ability by seeking *atonement* from another cleric of the same deity or another druid. If the transgression was intentional, the casting cleric loses 500 XP for his intercession. If the transgression was unintentional, he does not lose XP.
                             *Redemption or Temptation:* You may cast this spell upon a creature of an opposing alignment in order to offer it a chance to change its alignment to match yours. The prospective subject must be present for the entire casting process. Upon completion of the spell, the subject freely chooses whether it retains its original alignment or acquiesces to your offer and changes to your alignment. No duress, compulsion, or magical influence can force the subject to take advantage of the opportunity offered if it is unwilling to abandon its old alignment. This use of the spell does not work on outsiders or any creature incapable of changing its alignment naturally.
                             Though the spell description refers to evil acts, *atonement* can also be used on any creature that has performed acts against its alignment, whether those acts are evil, good, chaotic, or lawful.`,
          material:         `**Note:** Normally, changing alignment is up to the player. This use of *atonement* simply offers a believable way for a character to change his or her alignment drastically, suddenly, and definitively.
                             **Material Component:** Burning incense.
                             **Focus:** In addition to your holy symbol or normal divine focus, you need a set of prayer beads (or other prayer device, such as a prayer wheel or prayer book) worth at least 500 gp.
                             **XP Cost:** When cast for the benefit of a creature whose guilt was the result of deliberate acts, the cost to you is 500 XP per casting (see above).`
        },
        'augury': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Augury',
          school:           'Divination',
          level:            'Clr 2',
          components:       'V, S, M, F',
          casting_time:     '1 minute',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         'Instantaneous',
          text:             `An *augury* can tell you whether a particular action will bring good or bad results for you in the immediate future.
                             The base chance for receiving a meaningful reply is 70% + 1% per caster level, to a maximum of 90%; this roll is made secretly. A question may be so straightforward that a successful result is automatic, or so vague as to have no chance of success. If the *augury* succeeds, you get one of four results:
                             • Weal (if the action will probably bring good results).
                             • Woe (for bad results).
                             • Weal and woe (for both).
                             • Nothing (for actions that don’t have especially good or bad results).
                             If the spell fails, you get the “nothing” result. A cleric who gets the “nothing” result has no way to tell whether it was the consequence of a failed or successful *augury*.
                             The *augury* can see into the future only about half an hour, so anything that might happen after that does not affect the result. Thus, the result might not take into account the long-term consequences of a contemplated action. All *auguries* cast by the same person about the same topic use the same dice result as the first casting.`,
          material:         `**Material Component:** Incense worth at least 25 gp.
                             **Focus:** A set of marked sticks, bones, or similar tokens of at least 25 gp value.`
        },
        'awaken': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Awaken',
          school:           'Transmutation',
          level:            'Drd 5',
          components:       'V, S, DF, XP',
          casting_time:     '24 hours',
          range:            'Touch',
          target_type:      'Target',
          target:           'Animal or tree touched',
          duration:         'Instantaneous',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `You awaken a tree or animal to humanlike sentience. To succeed, you must make a Will save (DC 10 + the animal’s current HD, or the HD the tree will have once awakened).
                             The *awakened* animal or tree is friendly toward you. You have no special empathy or connection with a creature you awaken, although it serves you in specific tasks or endeavors if you communicate your desires to it.
                             An *awakened* tree has characteristics as if it were an animated object, except that it gains the plant type and gets [[3d6]] Intelligence, [[3d6]] Wisdom, and [[3d6]] Charisma scores. An *awakened* plant gains the ability to move its limbs, roots, vines, creepers, and so forth, and it has senses similar to a human’s.
                             An *awakened* animal gets [[3d6]] Intelligence, +[[1d3]] Charisma, and +[[2]] HD. Its type becomes magical beast (augmented animal). An awakened animal can’t serve as an animal companion, familiar, or special mount.
                             An *awakened* tree or animal can speak one language that you know, plus one additional language that you know per point of Intelligence bonus (if any).`,
          material:         `**XP Cost:** 250 XP.`
        },
        'baleful polymorph': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Baleful_Polymorph',
          school:           'Transmutation',
          level:            'Drd 5, Sor/Wiz 5',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One creature',
          duration:         'Permanent',
          saving_throw:     'Fortitude negates, Will partial; see text',
          spell_resistance: 'Yes',
          text:             `You change the subject into a Small or smaller animal of no more than 1 HD (such as a dog, lizard, monkey, or toad). The subject takes on all the statistics and special abilities of an average member of the new form in place of its own except as follows:
                             • The target retains its own alignment (and personality, within the limits of the new form’s ability scores).
                             • If the target has the shapechanger subtype, it retains that subtype.
                             • The target retains its own hit points.
                             • The target is treated has having its normal Hit Dice for purpose of adjudicating effects based on HD, such as the sleep spell, though it uses the new form’s base attack bonus, base save bonuses, and all other statistics derived from Hit Dice.
                             • The target also retains the ability to understand (but not to speak) the languages it understood in its original form. It can write in the languages it understands, but only the form is capable of writing in some manner (such as drawing in the dirt with a paw).
                             With those exceptions, the target’s normal game statistics are replaced by those of the new form. The target loses all the special abilities it has in its normal form, including its class features.
                             All items worn or carried by the subject fall to the ground at its feet, even if they could be worn or carried by the new form.
                             If the new form would prove fatal to the creature (for example, if you polymorphed a landbound target into a fish, or an airborne target into a toad), the subject gets a \`\`+4\`\` bonus on the save.
                             If the subject remains in the new form for 24 consecutive hours, it must attempt a Will save.
                             If this save fails, it loses its ability to understand language, as well as all other memories of its previous form, and its Hit Dice and hit points change to match an average creature of its new form. These abilities and statistics return to normal if the effect is later ended.
                             Incorporeal or gaseous creatures are immune to *baleful polymorph*, and a creature with the shapechanger subtype (such as a lycanthrope or a doppelganger) can revert to its natural form as a standard action (which ends the spell’s effect).`,
          material:         null
        },
        'baleful transposition': {
          //TODO
        },
        'bane': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bane',
          school:           'Enchantment↲(Compulsion) [Fear, Mind-Affecting]',
          level:            'Clr 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '50 ft.',
          target_type:      'Area',
          target:           'All enemies within 50 ft.',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `*Bane* fills your enemies with fear and doubt. Each affected creature takes a \`\`-1\`\` penalty on attack rolls and a \`\`-1\`\` penalty on saving throws against fear effects.
                             *Bane* counters and dispels *bless*.`,
          material:         null
        },
        'banishment': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Banishment',
          school:           'Abjuration',
          level:            'Clr 6, Sor/Wiz 7',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           'One or more extraplanar creatures, no two of which can be more than 30 ft. apart',
          duration:         'Instantaneous',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `A *banishment* spell is a more powerful version of the *dismissal* spell. It enables you to force extraplanar creatures out of your home plane. As many as 2 Hit Dice of creatures per caster level can be banished.
                             You can improve the spell’s chance of success by presenting at least one object or substance that the target hates, fears, or otherwise opposes. For each such object or substance, you gain a \`\`+1\`\` bonus on your caster level check to overcome the target’s spell resistance (if any), the saving throw DC increases by \`\`2\`\`.
                             Certain rare items might work twice as well as a normal item for the purpose of the bonuses (each providing a \`\`+2\`\` bonus on the caster level check against spell resistance and increasing the save DC by \`\`4\`\`).`,
          material:         '**Arcane Focus:** Any item that is distasteful to the subject (optional, see above).'
        },
        'barkskin': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Barkskin',
          school:           'Transmutation',
          level:            'Drd 2, Rgr 2, Plant 2',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Living creature touched',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes (harmless)',
          text:             `*Barkskin* toughens a creature’s skin. The effect grants a \`\`+2\`\` enhancement bonus to the creature’s existing natural armor bonus. This enhancement bonus increases by \`\`1\`\` for every three caster levels above 3rd, to a maximum of \`\`+5\`\` at caster level 12th.
                             The enhancement bonus provided by *barkskin* stacks with the target’s natural armor bonus, but not with other enhancement bonuses to natural armor. A creature without natural armor has an effective natural armor bonus of \`\`+0\`\`.`,
          material:         null
        },
        'bear\'s endurance': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bear%27s_Endurance',
          school:           'Transmutation',
          level:            'Clr 2, Drd 2, Rgr 2, Sor/Wiz 2',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes',
          text:             `The affected creature gains greater vitality and stamina. The spell grants the subject a \`\`+4\`\` enhancement bonus to Constitution, which adds the usual benefits to hit points, Fortitude saves, Constitution checks, and so forth.
                             Hit points gained by a temporary increase in Constitution score are not temporary hit points. They go away when the subject’s Constitution drops back to normal. They are not lost first as temporary hit points are.`,
          material:         null
        },
        'bestow curse': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bestow_Curse',
          school:           'Necromancy',
          level:            'Clr 3, Sor/Wiz 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Permanent',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `You place a curse on the subject. Choose one of the following three effects.
                             • \`\`-6\`\` decrease to an ability score (minimum 1).
                             • \`\`-4\`\` penalty on attack rolls, saves, ability checks, and skill checks.
                             • Each turn, the target has a 50% chance to act normally; otherwise, it takes no action.
                             You may also invent your own curse, but it should be no more powerful than those described above.
                             The *curse* bestowed by this spell cannot be dispelled, but it can be removed with a *break enchantment*, *limited wish*, *miracle*, *remove curse*, or *wish* spell.
                             *Bestow curse* counters *remove curse*.`,
          material:         null
        },
        'binding': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Binding',
          school:           'Enchantment↲(Compulsion) [Mind-Affecting]',
          level:            'Sor/Wiz 8',
          components:       'V, S, M',
          casting_time:     'One minute',
          range:            'close',
          target_type:      'Target',
          target:           'One living creature',
          duration:         'See text (D)',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `A *binding* spell creates a magical restraint to hold a creature. The target gets an initial saving throw only if its Hit Dice equal at least one-half your caster level.
                             You may have as many as six assistants help you with the spell. For each assistant who casts *suggestion*, your caster level for this casting of *binding* increases by 1. For each assistant who casts *dominate animal*, *dominate person*, or *dominate monster*, your caster level for this casting of *binding* increases by a number equal to one-third of that assistant’s level, provided that the spell’s target is appropriate for a *binding* spell. Since the assistants’ spells are cast simply to improve your caster level for the purpose of the *binding* spell, saving throws and spell resistance against the assistants’ spells are irrelevant. Your caster level determines whether the target gets an initial Will saving throw and how long the *binding* lasts. All *binding* spells are dismissible.
                             Regardless of the version of *binding* you cast, you can specify triggering conditions that end the spell and release the creature whenever they occur. These triggers can be as simple or elaborate as you desire, but the condition must be reasonable and have a likelihood of coming to pass. The conditions can be based on a creature’s name, identity, or alignment but otherwise must be based on observable actions or qualities. Intangibles such as level, class, Hit Dice, or hit points don’t qualify. Once the spell is cast, its triggering conditions cannot be changed. Setting a release condition increases the save DC (assuming a saving throw is allowed) by 2.
                             If you are casting any of the first three versions of *binding* (those with limited durations), you may cast additional *binding* spells to prolong the effect, since the durations overlap. If you do so, the target gets a saving throw at the end of the first spell’s duration, even if your caster level was high enough to disallow an initial saving throw. If the creature succeeds on this save, all the *binding* spells it has received are broken.
                             The *binding* spell has six versions. Choose one of the following versions when you cast the spell.
                             *Chaining:* The subject is confined by restraints that generate an *antipathy* spell affecting all creatures who approach the subject, except you. The duration is one year per caster level. The subject of this form of *binding* is confined to the spot it occupied when it received the spell.
                             *Slumber:* This version causes the subject to become comatose for as long as one year per caster level. The subject does not need to eat or drink while *slumbering*, nor does it age. This form of *binding* is more difficult to cast than *chaining*, making it slightly easier to resist. Reduce the spell’s save DC by 1.
                             *Bound Slumber:* This combination of *chaining* and *slumber* lasts for as long as one month per caster level. Reduce the save DC by 2.
                             *Hedged Prison:* The subject is transported to or otherwise brought within a confined area from which it cannot wander by any means. The effect is permanent. Reduce the save DC by 3.
                             *Metamorphosis:* The subject assumes gaseous form, except for its head or face. It is held harmless in a jar or other container, which may be transparent if you so choose. The creature remains aware of its surroundings and can speak, but it cannot leave the container, attack, or use any of its powers or abilities. The *binding* is permanent. The subject does not need to breathe, eat, or drink while *metamorphosed*, nor does it age. Reduce the save DC by 4.
                             *Minimus Containment:* The subject is shrunk to a height of 1 inch or even less and held within some gem, jar, or similar object. The *binding* is permanent. The subject does not need to breathe, eat, or drink while *contained*, nor does it age. Reduce the save DC by 4.
                             You can’t dispel a *binding* spell with *dispel magic* or a similar effect, though an *antimagic field* or *Mage’s disjunction* affects it normally. A bound extraplanar creature cannot be sent back to its home plane due to *dismissal*, *banishment*, *or a similar effect*.`,
          material:         `**Components:** The components for a binding spell vary according to the version of the spell, but they always include a continuous chanting utterance read from the scroll or spellbook page containing the spell, somatic gestures, and materials appropriate to the form of binding used. These components can include such items as miniature chains of special metals, soporific herbs of the rarest sort (for slumber bindings), a bell jar of the finest crystal, and the like.
                             In addition to the specially made props suited to the specific type of binding (cost 500 gp), the spell requires opals worth at least 500 gp for each HD of the target and a vellum depiction or carved statuette of the subject to be captured.`
        },
        'black tentacles': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Black_Tentacles',
          school:           'Conjuration↲(Creation)',
          level:            'Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Area',
          target:           '20-ft.-radius spread',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell conjures a field of rubbery black tentacles, each 10 feet long. These waving members seem to spring forth from the earth, floor, or whatever surface is underfoot—including water. They grasp and entwine around creatures that enter the area, holding them fast and crushing them with great strength.
                             Every creature within the area of the spell must make a grapple check, opposed by the grapple check of the tentacles. Treat the tentacles attacking a particular target as a Large creature with a base attack bonus equal to your caster level and a Strength score of 19. Thus, its grapple check modifier is equal to your caster level +8. The tentacles are immune to all types of damage.
                             Once the tentacles grapple an opponent, they may make a grapple check each round on your turn to deal 1d6+4 points of bludgeoning damage. The tentacles continue to crush the opponent until the spell ends or the opponent escapes.
                             Any creature that enters the area of the spell is immediately attacked by the tentacles. Even creatures who aren’t grappling with the tentacles may move through the area at only half normal speed.`,
          material:         '**Material Component:** A piece of tentacle from a giant octopus or a giant squid.'
        },
        'blade barrier': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Blade_Barrier',
          school:           'Evocation↲[Force]',
          level:            'Clr 6, Good 6, War 6',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Wall of whirling blades up to [[20*?{Casting Level}]] ft. long, or a ringed wall of whirling blades with a radius of up to [[5*floor(?{Casting Level}/2)]] ft.; either form 20 ft. high',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Reflex half or Reflex negates; see text',
          spell_resistance: 'Yes',
          text:             `An immobile, vertical curtain of whirling blades shaped of pure force springs into existence. Any creature passing through the wall takes 1d6 points of ‹damage|[[[[{?{Casting Level},15}kl1]]d6]]› per caster level (maximum 15d6), with a Reflex save for half damage.
                             If you evoke the barrier so that it appears where creatures are, each creature takes damage as if passing through the wall. Each such creature can avoid the wall (ending up on the side of its choice) and thus take no damage by making a successful Reflex save.
                             A *blade barrier* provides cover (\`\`+4\`\` bonus to AC, \`\`+2\`\` bonus on Reflex saves) against attacks made through it.`,
          material:         null
        },
        'blasphemy': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Blasphemy',
          school:           'Evocation↲[Evil, Sonic]',
          level:            'Clr 7, Evil 7',
          components:       'V',
          casting_time:     '1 standard action',
          range:            '40 ft.',
          target_type:      'Area',
          target:           'Nonevil creatures in a 40-ft.-radius spread centered on you',
          duration:         'Instantaneous',
          saving_throw:     'None or Will negates; see text',
          spell_resistance: 'Yes',
          text:             `Any nonevil creature within the area of a *blasphemy* spell suffers the following ill effects.

                             **[[?{Casting Level}]] HD**
                             • Dazed
                             **Up to [[?{Casting Level}-1]] HD**
                             • Weakened, dazed
                             **Up to <= [[?{Casting Level}-5]] HD**
                             • Paralyzed, weakened, dazed
                             **Up to <= [[?{Casting Level}-10]] HD**
                             • Killed, paralyzed, weakened, dazed

                             The effects are cumulative and concurrent.
                             No saving throw is allowed against these effects.
                             *Dazed:* The creature can take no actions for 1 round, though it defends itself normally.
                             *Weakened:* The creature’s Strength score decreases by [[2d6]] points for [[2d4]] rounds.
                             *Paralyzed:* The creature is paralyzed and helpless for [[1d10]] minutes.
                             *Killed*: Living creatures die. Undead creatures are destroyed.
                             Furthermore, if you are on your home plane when you cast this spell, nonevil extraplanar creatures within the area are instantly banished back to their home planes. Creatures so banished cannot return for at least 24 hours. This effect takes place regardless of whether the creatures hear the *blasphemy*. The banishment effect allows a Will save (at a \`\`-4\`\` penalty) to negate.
                             Creatures whose Hit Dice exceed your caster level are unaffected by *blasphemy*.`,
          material:         null
        },
        'bless': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bless',
          school:           'Enchantment↲(Compulsion) [Mind-Affecting]',
          level:            'Clr 1, Community 1, Pal 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '50 ft.',
          target_type:      'Area',
          target:           'The caster and all allies within a 50-ft. burst, centered on the caster',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes (harmless)',
          text:             `*Bless* fills your allies with courage. Each ally gains a \`\`+1\`\` morale bonus on attack rolls and on saving throws against fear effects.
                             *Bless* counters and dispels *bane*.`,
          material:         null
        },
        'bless water': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bless_Water',
          school:           'Transmutation↲[Good]',
          level:            'Clr 1, Pal 1',
          components:       'V, S, M',
          casting_time:     '1 minute',
          range:            'Touch',
          target_type:      'Target',
          target:           'Flask of water touched',
          duration:         'Instantaneous',
          saving_throw:     'Will negates (object)',
          spell_resistance: 'Yes (Object)',
          text:             `This transmutation imbues a flask (1 pint) of water with positive energy, turning it into holy water.`,
          material:         '**Material Component:** 5 pounds of powdered silver (worth 25 gp).'
        },
        'bless weapon': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bless_Weapon',
          school:           'Transmutation',
          level:            'Glory 2, Pal 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Weapon touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This transmutation makes a weapon strike true against evil foes. The weapon is treated as having a \`\`+1\`\` enhancement bonus for the purpose of bypassing the damage reduction of evil creatures or striking evil incorporeal creatures (though the spell doesn’t grant an actual enhancement bonus). The weapon also becomes good, which means it can bypass the damage reduction of certain creatures. (This effect overrides and suppresses any other alignment the weapon might have.) Individual arrows or bolts can be transmuted, but affected projectile weapons (such as bows) don’t confer the benefit to the projectiles they shoot.
                             In addition, all critical hit rolls against evil foes are automatically successful, so every threat is a critical hit. This last effect does not apply to any weapon that already has a magical effect related to critical hits, such as a keen weapon or a vorpal sword.`,
          material:         null
        },
        'blight': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Blight',
          school:           'Necromancy',
          level:            'Drd 4, Sor/Wiz 5',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Plant touched',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude half; see text',
          spell_resistance: 'Yes',
          text:             `This spell withers a single plant of any size. An affected plant creature takes 1d6 points of ‹damage|[[[[{?{Casting Level},15}kl1]]d6]]› per level (maximum 15d6) and may attempt a Fortitude saving throw for half damage. A plant that isn’t a creature doesn’t receive a save and immediately withers and dies.
                             This spell has no effect on the soil or surrounding plant life.`,
          material:         null
        },
        'blindness/deafness': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Blindness/Deafness',
          school:           'Necromancy',
          level:            'Brd 2, Clr 3, Darkness 2, Sor/Wiz 2',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One living creature',
          duration:         'Permanent (D)',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `You call upon the powers of unlife to render the subject blinded or deafened, as you choose.`,
          material:         null
        },
        'blink': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Blink',
          school:           'Transmutation',
          level:            'Brd 3, Sor/Wiz 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     null,
          spell_resistance: null,
          text:             `You “blink” back and forth between the Material Plane and the Ethereal Plane. You look as though you’re winking in and out of reality very quickly and at random.
                             *Blinking* has several effects, as follows.
                             Physical attacks against you have a 50% miss chance, and the Blind-Fight feat doesn’t help opponents, since you’re ethereal and not merely invisible. If the attack is capable of striking ethereal creatures, the miss chance is only 20% (for concealment).
                             If the attacker can see invisible creatures, the miss chance is also only 20%. (For an attacker who can both see and strike ethereal creatures, there is no miss chance.) Likewise, your own attacks have a 20% miss chance, since you sometimes go ethereal just as you are about to strike.
                             Any individually targeted spell has a 50% chance to fail against you while you’re *blinking* unless your attacker can target invisible, ethereal creatures. Your own spells have a 20% chance to activate just as you go ethereal, in which case they typically do not affect the Material Plane.
                             While *blinking*, you take only half damage from area attacks (but full damage from those that extend onto the Ethereal Plane). You strike as an invisible creature (with a \`\`+2\`\` bonus on attack rolls), denying your target any Dexterity bonus to AC.
                             You take only half damage from falling, since you fall only while you are material.
                             While *blinking*, you can step through (but not see through) solid objects. For each 5 feet of solid material you walk through, there is a 50% chance that you become material. If this occurs, you are shunted off to the nearest open space and take 1d6 points of damage per 5 feet so traveled. You can move at only three-quarters speed (because movement on the Ethereal Plane is at half speed, and you spend about half your time there and half your time material.)
                             Since you spend about half your time on the Ethereal Plane, you can see and even attack ethereal creatures. You interact with ethereal creatures roughly the same way you interact with material ones.
                             An ethereal creature is invisible, incorporeal, and capable of moving in any direction, even up or down. As an incorporeal creature, you can move through solid objects, including living creatures.
                             An ethereal creature can see and hear the Material Plane, but everything looks gray and insubstantial. Sight and hearing on the Material Plane are limited to 60 feet.
                             Force effects and abjurations affect you normally. Their effects extend onto the Ethereal Plane from the Material Plane, but not vice versa. An ethereal creature can’t attack material creatures, and spells you cast while ethereal affect only other ethereal things. Certain material creatures or objects have attacks or effects that work on the Ethereal Plane. Treat other ethereal creatures and objects as material.`,
          material:         null
        },
        'blur': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Blur',
          school:           'Illusion↲(Glamer)',
          level:            'Brd 2, Sor/Wiz 2',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The subject’s outline appears blurred, shifting and wavering. This distortion grants the subject concealment (20% miss chance).
                             A *see invisibility* spell does not counteract the *blur* effect, but a *true seeing* spell does.
                             Opponents that cannot see the subject ignore the spell’s effect (though fighting an unseen opponent carries penalties of its own).`,
          material:         null
        },
        'bolt of glory': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bolt_of_Glory',
          school:           'Evocation↲[Good]',
          level:            'Glory 6',
          components:       'V, S, D F',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'Ray',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `This spell projects a bolt of energy from the Positive Energy Plane against one creature. The caster must succeed at a ranged touch attack to strike the target. A creature struck suffers varying damage, depending on its nature and home plane of existence:
                             ‹Material Plane↲Elemental Plane↲neutral outsider|[[[[{floor(?{Casting Level}/2),7}kl1]]d6]]›
                             ‹Negative Energy Plane↲evil outsider↲undead creature|[[[[{?{Casting Level},15}kl1]]d6]]›
                             ‹Positive Energy Plane↲good outsider|—›`,
          material:         null
        },
        'bolts of bedevilment': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bolts_of_Bedevilment',
          school:           'Enchantment↲[Mind-Affecting]',
          level:            'Madness 5',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Ray',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell grants the caster the ability to make one ray attack per round. The ray dazes one living creature, clouding its mind so that it takes no action for [[1d3]] rounds. The creature is not stunned (so attackers get no special advantage against it), but it can’t move, cast spells, use mental abilities, and so on.`,
          material:         null
        },
        'brain spider': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Brain_Spider',
          school:           'Divination↲[Mind-Affecting]',
          level:            'Clr 8, Mind 7',
          components:       'V, S, M, DF',
          casting_time:     '1 round',
          range:            'long',
          target_type:      'Targets',
          target:           'Up to eight living creatures',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell allows you to eavesdrop as a standard action on the thoughts of up to eight other creatures at once, hearing as desired:

                             • Individual trains of thought in whatever order you desire.
                             • Information from all minds about one particular topic, thing, or being, one nugget of information per caster level.
                             • A study of the thoughts and memories of one creature of the group in detail.

                             Once per round, if you do not perform a detailed study of one creature’s mind, you can attempt (as a standard action) to implant a *suggestion* in the mind of any one of the affected creatures. The creature can make another Will saving throw to resist the *suggestion*, using the save DC of the *brain spider* spell. (Creatures with special resistance to enchantment spells can use this resistance to keep from being affected by the *suggestion*.) Success on this saving throw does not negate the other effects of the *brain spider* spell for that creature.
                             You can affect all intelligent beings of your choice within range (up to the limit of eight), beginning with known or named beings. Language is not a barrier, and you need not personally know the beings. The spell cannot reach those who make a successful Will save.`,
          material:         '**Material Component:** A spider of any size or kind. It can be dead, but must still have all eight legs.'
        },
        'break enchantment': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Break_Enchantment',
          school:           'Abjuration',
          level:            'Brd 4, Clr 5, Liberation 5, Luck 5, Pal 4, Sor/Wiz 5',
          components:       'V, S',
          casting_time:     '1 minute',
          range:            'close',
          target_type:      'Targets',
          target:           'Up to [[?{Casting Level}]] creature(s), all within 30 ft. of each other',
          duration:         'Instantaneous',
          saving_throw:     'See text',
          spell_resistance: 'No',
          text:             `This spell frees victims from enchantments, transmutations, and curses. *Break enchantment* can reverse even an instantaneous effect. For each such effect, you make a ‹caster level check|[[1d20+[[{?{Casting Level},15}kl1]]]]› (1d20 + caster level, maximum +15) against a «DC|[[11+?{Casting Level of the Effect}]]» of 11 + caster level of the effect. Success means that the creature is free of the spell, curse, or effect. For a cursed magic item, the DC is 25.
                             If the spell is one that cannot be dispelled by *dispel magic*, *break enchantment* works only if that spell is 5th level or lower.
                             If the effect comes from some permanent magic item *break enchantment* does not remove the curse from the item, but it does frees the victim from the item’s effects.`,
          material:         null
        },
        'bull\'s strength': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bull%27s_Strength',
          school:           'Transmutation',
          level:            'Blg 2, Clr 2, Drd 2, Pal 2, Sor/Wiz 2, Strength 2',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The subject becomes stronger. The spell grants a \`\`+4\`\` enhancement bonus to Strength, adding the usual benefits to melee attack rolls, melee damage rolls, and other uses of the Strength modifier.`,
          material:         '**Arcane Material Component:** A few hairs, or a pinch of dung, from a bull.'
        },
        'burning hands': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Burning_Hands',
          school:           'Evocation↲[Fire]',
          level:            'Fire 1, Sor/Wiz 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            '15 ft.',
          target_type:      'Area',
          target:           'Cone-shaped burst',
          duration:         'Instantaneous',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `A cone of searing flame shoots from your fingertips. Any creature in the area of the flames takes 1d4 points of ‹fire damage|[[[[{?{Casting Level},5}kl1]]d4]]› per caster level (maximum 5d4). Flammable materials burn if the flames touch them. A character can extinguish burning items as a full-round action.`,
          material:         null
        },
        'call lightning': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Call_Lightning',
          school:           'Evocation↲[Electricity]',
          level:            'Drd 3, Weather 3',
          components:       'V, S',
          casting_time:     '1 round',
          range:            'medium',
          target_type:      'Effect',
          target:           'One or more 30-ft.-long vertical lines of lightning',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `Immediately upon completion of the spell, and once per round thereafter, you may call down a 5-foot-wide, 30-foot-long, vertical bolt of lightning that deals ‹3d6› points of electricity damage. The bolt of lightning flashes down in a vertical stroke at whatever target point you choose within the spell’s range (measured from your position at the time). Any creature in the target square or in the path of the bolt is affected.
                             You need not call a bolt of lightning immediately; other actions, even spellcasting, can be performed. However, each round after the first you may use a standard action (concentrating on the spell) to call a bolt. You may call a total number of bolts equal to your caster level (maximum 10 bolts): [[{?{Casting Level},10}kl1]] bolts total.
                             If you are outdoors and in a stormy area—a rain shower, clouds and wind, hot and cloudy conditions, or even a tornado (including a whirlwind formed by a djinni or an air elemental of at least Large size)—each bolt deals ‹3d10› points of electricity damage instead of 3d6.
                             This spell functions indoors or underground but not underwater.`,
          material:         null
        },
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        //'': {
        //// ↲’‹›«»
        //  ref:              '',
        //  school:           '↲',
        //  level:            '',
        //  components:       '',
        //  casting_time:     '',
        //  range:            '',
        //  target_type:      '',
        //  target:           '',
        //  duration:         '',
        //  saving_throw:     '',
        //  spell_resistance: '',
        //  text:             ``,
        //  material:         null
        //},
        /////////////////////////////////////
        'wall of fire': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Wall_of_Fire',
          school:           'Evocation↲[Fire]',
          level:            'Druid 5, Fire 4, Sor/Wiz 4',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Opaque sheet of flame up to [[20*?{Casting Level}]] ft. long or a ring of fire with radius of up to [[5*floor([[?{Casting Level}/2]])]] ft.; either form 20 ft. high',
          duration:         'Concentration + [[?{Casting Level}]] round(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `An immobile, blazing curtain of shimmering violet fire springs into existence. One side of the wall, selected by you, sends forth waves of heat, dealing ‹2d4› points of fire damage to creatures within 10 feet and ‹1d4› points of fire damage to those past 10 feet but within 20 feet. The wall deals this damage when it appears and on your turn each round to all creatures in the area. In addition, the wall deals 2d6 points of fire damage +1 point of fire damage per caster level (maximum +20) to any creature ‹passing through|[[2d6+[[{?{Casting Level},20}kl1]]]]› it. The wall deals double damage to undead creatures.
                             If you evoke the wall so that it appears where creatures are, each creature takes damage as if passing through the wall. If any 5-foot length of wall takes 20 points of cold damage or more in 1 round, that length goes out. (Do not divide cold damage by 4, as normal for objects.)
                             *Wall of fire* can be made permanent with a *permanency* spell. A permanent *wall of fire* that is extinguished by cold damage becomes inactive for 10 minutes, then reforms at normal strength.`,
          material:         '**Arcane Material Component:** A small piece of phosphorus.'
        }
      },
      spell_ranges: {
        'close':    'Close ([[25+(5*floor([[?{Casting Level}/2]]))]] ft.)',
        'medium':   'Medium ([[100+(10*[[?{Casting Level}]])]] ft.)',
        'long':     'Long ([[400+(40*[[?{Casting Level}]])]] ft.)',
      }
    },
    source_text_UA: {
      spells: {
        'acid arrow':           { recharge: 'General' },
        'acid fog':             { recharge: 'General' },
        'acid splash':          { recharge: 'General' },
        'aid':                  { recharge: '5 minutes' },
        'air walk':             { recharge: '1 hour' },
        'alarm':                { recharge: '4 hours' },
        'align weapon':         { recharge: '5 minutes' },
        'alter self':           { recharge: '4 hours' },
        'analyze dweomer':      { recharge: 'General' },
        'animal growth':        { recharge: 'General' },
        'animal messenger':     { recharge: '6 hours' },
        'animal shapes':        { recharge: '24 hours' },
        'animal trance':        { recharge: 'General' },
        'animate dead':         { recharge: 'General' },
        'animate objects':      { recharge: 'General' },
        'animate plants':       { recharge: 'General' },
        'animate rope':         { recharge: 'General' },
        'antilife shell':       { recharge: 'General' },
        'antimagic field':      { recharge: 'General' },
        'antipathy':            { recharge: 'General' },
        'antiplant shell':      { recharge: 'General' },
        'arcane eye':           { recharge: 'General' },
        'arcane lock':          { recharge: '1 hour' },
        'arcane mark':          { recharge: 'General' },
        'arcane sight':         { recharge: '30 minutes' },
        'armor of darkness':    { recharge: 'General' },
        'astral projection':    { recharge: 'General' },
        'atonement':            { recharge: 'General' },
        'augury':               { recharge: '6 hours' },
        'awaken':               { recharge: 'General' },
        'baleful polymorph':    { recharge: 'General' },
        'bane':                 { recharge: 'General' },
        'banishment':           { recharge: 'General' },
        'barkskin':             { recharge: '1 hour' },
        'bear\'s endurance':    { recharge: '5 minutes' },
        'bestow curse':         { recharge: 'General' },
        'binding':              { recharge: 'General' },
        'black tentacles':      { recharge: 'General' },
        'blade barrier':        { recharge: 'General' },
        'blasphemy':            { recharge: 'General' },
        'bless':                { recharge: '30 minutes' },
        'bless water':          { recharge: 'General' },
        'bless weapon':         { recharge: '5 minutes' },
        'blight':               { recharge: 'General' },
        'blindness/deafness':   { recharge: 'General' },
        'blink':                { recharge: 'General' },
        'blur':                 { recharge: '5 minutes' },
        'bolt of glory':        { recharge: 'General' },
        'bolts of bedevilment': { recharge: 'General' },
        'brain spider':         { recharge: '1 hour' },
        'break enchantment':    { recharge: '1 hour' },
        'bull\'s strength':     { recharge: '5 minutes' },
        'burning hands':        { recharge: 'General' },
        'call lightning':       { recharge: 'General' }
        //'': { recharge: 'General' },
      }
    },
    source_text_PHB: {
    },
    source_text_MM: {
      skills: { 'control shape':            {base: 'control shape',            attrib: '',                  default_ability_mod: 'wis-mod', trained_only:false } }
    },
    source_text_XPH: {
    },
    source_text_OA: {
      skills: { 'iaijutsu focus':           {base: 'iaijutsu focus',           attrib: '',                  default_ability_mod: 'cha-mod', trained_only:false } }
    },
    source_text_ToB: {
      skills: { 'martial lore':             {base: 'martial lore',             attrib: '',                  default_ability_mod: 'int-mod', trained_only:true  } }
    },
    source_text_BoED: {
      types: ['deathless']
    },
    source_text_unknown: {
      movement_modes: ['glide']
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
    skills:              function() { return this.merge_maps("skills"); },
    light_sources:       function() { return this.merge_maps("light_sources"); },
    spells:              function() { return this.merge_maps("spells"); },
    spell_ranges:        function() { return this.merge_maps("spell_ranges"); },
    spell:               function(name) { return this.merge_maps("spells.".concat(name)); }
  };

  // ██████╗    ██╗   ██████╗     ██████╗    ███████╗    ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗███████╗███████╗
  // ██╔══██╗   ██║   ██╔══██╗    ╚════██╗   ██╔════╝    ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝██║██╔════╝██╔════╝
  // ██║  ██║████████╗██║  ██║     █████╔╝   ███████╗    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║█████╗  ███████╗
  // ██║  ██║██╔═██╔═╝██║  ██║     ╚═══██╗   ╚════██║    ██║   ██║   ██║   ██║██║     ██║   ██║   ██║██╔══╝  ╚════██║
  // ██████╔╝██████║  ██████╔╝    ██████╔╝██╗███████║    ╚██████╔╝   ██║   ██║███████╗██║   ██║   ██║███████╗███████║
  // ╚═════╝ ╚═════╝  ╚═════╝     ╚═════╝ ╚═╝╚══════╝     ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝   ╚═╝╚══════╝╚══════╝

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
    if (!dnd35.size_categories().includes(size.toLowerCase())) { log("error"); throw "{{error}}"; };
    switch (size.toLowerCase()) {
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
    if (!dnd35.size_categories().includes(size.toLowerCase())) { log("error"); throw "{{error}}"; };
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
  }; // sizeToArmorClassMod

  var sizeModToTallReach = function(size) {
    //log("sizeModToTallReach('"+size+"')");
    if (isNaN(size)) {
      log("   isNaN");
      if (!dnd35.size_categories().includes(size.toLowerCase())) { log("error"); throw "{{error}}"; };
      size = sizeToMod(size.toLowerCase());
    };
    size = parseFloat(size);
    //log(size);
    //log('=====');
    switch (size) {
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
    switch (size) {
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

  var getSkillSpecification = function(skillString) {
    skillString = skillString.replace(/ +\(/g, "(");
    var skills = dnd35.skills();
    if (skills[skillString.toLowerCase()] !== undefined) {
      return skills[skillString.toLowerCase()];
    };
    var match_result = skillString.match(/^([^(]+)(\(.+\)){0,1}$/i);
    if (match_result[1] === undefined) { return null; };
    var skill_name = stringTrimWhitespace(match_result[1]);
    if (skill_name == '') { return null; }
    if (match_result[2] === undefined) {
      if (skills[skill_name.toLowerCase()] === undefined) { return null; };
      return skills[skill_name.toLowerCase()];
    } else {
      skill_name = skill_name+'()';
      if (skills[skill_name.toLowerCase()] === undefined) { return null; };
      return Object.assign({}, skills[skill_name.toLowerCase()], { sub: stringTrimWhitespace(match_result[2].replace(/^\(/, '').replace(/\)$/, '').toLowerCase()) });
    };
  }; // getSkillSpecification

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

  var createChatButton = function(label, content) {
    var escaped_content = content.replace(/\:/g,  '&#58;')
                                 .replace(/\&/g,  '&amp;')
                                 .replace(/\)/g,  '&#41;')
                                 .replace(/\*/g,  '&#42;')
                                 .replace(/\[\[/g,"&#91;&#91;")
                                 .replace(/\{\{/g,"&#123;&#123;")
                                 .replace(/\]\]/g,"&#93;&#93;")
                                 .replace(/\}\}/g,"&#125;&#125;");
    return ''.concat('[',label,'](!&#13;',escaped_content,')');
  }; // createChatButton

  var createEscapedChatButton = function(label, content) {
    var escaped_content = content.replace(/\:/g,  '&#58;')
                                 .replace(/\&/g,  '&amp;')
                                 .replace(/\)/g,  '&#41;')
                                 .replace(/\*/g,  '&#42;')
                                 .replace(/\#/g,  "&#35;")
                                 .replace(/\@{/g, "&#64;{")
                                 .replace(/\%{/g, "&#37;{")
                                 .replace(/\?{/g, "&#63;{")
                                 .replace(/\[\[/g,"&#91;&#91;")
                                 .replace(/\{\{/g,"&#123;&#123;")
                                 .replace(/\]\]/g,"&#93;&#93;")
                                 .replace(/\}\}/g,"&#125;&#125;");
    return ''.concat('[',label,'](!&#13;',escaped_content,')');
  }; // createEscapedChatButton

  var decodeRoll20String = function(str) {
    str = decodeURI(str);
    str = str.replace(/%3A/g, ':');
    str = str.replace(/%23/g, '#');
    str = str.replace(/%3F/g, '?');
    return str;
  }; // decodeRoll20String

  var renderDefaultTemplate = function(scope, id, fields) {
    var character = getObj("character", id);
    var str = ''.concat("&{template:default} {{name=",scope,"}} {{Token= [image](",character.get("avatar").replace(new RegExp("\\?.*$"), ""),")}} {{Name= ",getAttrByName(id, "character_name"),"}}");
    for (var k in fields) {
      str = str.concat(" {{"+k+"= "+escapeRoll20Macro(fields[k])+"}}");
    };
    return str;
  }; // renderDefaultTemplate

  var throwDefaultTemplate = function(scope, id, fields) {
    throw renderDefaultTemplate(scope, id, fields);
  }; // throwDefaultTemplate

  var respondToChat = function(msg,str,noArchive=true) {
    var playerName = msg.who;
    if (playerIsGM(msg.playerid)) { playerName = playerName.replace(new RegExp(" \\(GM\\)$"), "") };
    sendChat("skepickleCharacterSuite", '/w "'+playerName+'" '+str, null, {noarchive:noArchive});
  }; // respondToChat

  var getSelectedTokenIDs = function(msg) {
    var ids=[];
    if (msg.selected) {
      for (var selected of msg.selected) {
        try {
          if (selected["_type"] != "graphic") { continue; }; // Silently skip over selected non-graphics
          var obj = getObj("graphic", selected["_id"]);
          if (obj.get("_subtype") != "token") {
            respondToChat(msg,"&{template:default} {{name=ERROR}} {{Not a token= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")}}");
            continue;
          };
          if (obj.get("represents") != "") {
            var character = getObj("character", obj.get("represents"));
            if (!getAttrByName(character.id, "character_sheet").match(/D&D3.5 v[\.0-9]*/)) {
              respondToChat(msg,"&{template:default} {{name=ERROR}} {{Not a D&D3.5 character= [image]("+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+")}}");
              continue;
            };
          };
          ids.push(selected["_id"]);
        } catch(e) {
          respondToChat(msg,e);
        };
      };
    };
    return ids;
  }; // getSelectedTokenIDs

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
    var attribute = findObjs({
        type: 'attribute',
        characterid: id,
        name: attrib
    }, {caseInsensitive: true})[0];
    return !!attribute;
  }; // isAttrByNameDefined

  var isAttrByNameNaN = function(charID, attrib, valueType) {
    valueType = valueType || 'current';
    var val = getAttrByName(charID, attrib, valueType);
    if (val === undefined) {
      throw "isAttrByNameNaN() called with undefined attribute"
    };
    return isNaN(val);
  }; // isAttrByNameNaN

  // Implemented internally in Roll20
  //var getAttrByName = function(id, attrib, value_type) { return <a string>; }

  var generateUniqueRowID = function(charid) {
    var rowID;
    var char_attribs = findObjs({
      _type: 'attributes',
      _characterid: charid
    });
    var loop_count = 0;
    while (true) {
      rowID = generateRowID();
      var re = new RegExp(`^repeating_.*_${rowID}_.*$`);
      if (char_attribs.filter(attribute => attribute.get('name').match(re).length == 0)) { break; };
      loop_count++;
      log(loop_count);
      if (loop_count > 10) { break; };
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
    var skill_attrib = skill_spec.attrib;
    //log("getSkillAttrName()  {");
    //log(skill_spec);
    if (skill_spec.attrib.match(/\#/)) {
      var found_skill = false;
      for (var skillindex=1; skillindex<4; skillindex++) {
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
            var otherskillname = stringTrimWhitespace(getAttrByName(id, ''.concat('repeating_skills_',rowID,'_otherskillname')).
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
        skill_attrib=dnd35.skills()[skill_spec.base+'()'].default_ability_mod;
      };
    } else if (skill_spec.attrib == '') {
      const otherskill_rowids = getRepeatingSectionRowIDs(id, 'repeating_skills');
      var found_skill = false;
      otherskill_rowids.forEach( rowID => {
        if (!found_skill) {
          var otherskillname = stringTrimWhitespace(getAttrByName(id, ''.concat('repeating_skills_',rowID,'_otherskillname')).
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
            skill_attrib=dnd35.skills()[skill_spec.base+'()'].default_ability_mod;
            break;
          case 'speak language':
            skill_attrib=null;
            break;
          default:
            skill_attrib=dnd35.skills()[skill_spec.base].default_ability_mod;
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
    if (!dnd35.size_categories().includes(getAttrByName(id, "npcsize").toLowerCase())) {
      throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcsize', 'Invalid Value': getAttrByName(id, "npcsize")});
    };

    // npctype
    {
      var npctype = getAttrByName(id, "npctype");
      let result = npctype.match(/^([a-z ]+)(\([a-z ,]+\)){0,1}$/i)
      if (result[1] === undefined) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npctype', 'Invalid Type Value': npctype});
      };
      var type = stringTrimWhitespace(result[1]);
      if (!dnd35.types().includes(type.toLowerCase())) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npctype', 'Invalid Type Value': type});
      };
      if (result[2] !== undefined) {
        stringTrimWhitespace(result[2]).replace(/^\(/, "").replace(/\)$/, "").split(",").forEach(function(subtype) {
          if (!dnd35.subtypes().includes(subtype.toLowerCase())) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npctype', 'Invalid Subtype Value': subtype});
          };
        });
      };
    };

    // npchitdie
    {
      var npchitdie = getAttrByName(id, "npchitdie");
      if (!stringTrimWhitespace(npchitdie).replace(/ plus /gi, "+").replace(/ +/g, "").match(/^([+-]{0,1}([0-9]+[-+*/])*[0-9]*d[0-9]+([+-][0-9]+)*)+$/i)) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npchitdie', 'Invalid Value': npchitdie});
      };
    };

    // npcinitmacro
    {
      var npcinitmacro = getAttrByName(id, "npcinitmacro");
      if (npcinitmacro !== '&{template:DnD35Initiative} {{name=@{selected|token_name}}} {{check=checks for initiative:\n}} {{checkroll=[[(1d20cs>21cf<0 + (@{npcinit})) + ((1d20cs>21cf<0 + (@{npcinit}))/100) + ((1d20cs>21cf<0 + (@{npcinit}))/10000) &{tracker}]]}}') {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcinitmacro', 'Invalid Value': npcinitmacro, 'Correct Value': '&{template:DnD35Initiative} {{name=@{selected|token_name}}} {{check=checks for initiative:\n}} {{checkroll=[[(1d20cs>21cf<0 + (@{npcinit})) + ((1d20cs>21cf<0 + (@{npcinit}))/100) + ((1d20cs>21cf<0 + (@{npcinit}))/10000) &{tracker}]]}}'});
      };
    };

    // npcspeed
    {
      var npcspeed = getAttrByName(id, "npcspeed");
      var npcspeeds = stringTrimWhitespace(npcspeed.toLowerCase()
                                           .replace(/([0-9]+) *(feet|foot|ft\.*|')/g, "$1"))
                        .split(",");
      var mode_type_map = {};
      npcspeeds.forEach(function(e) {
        let result = e.match(/^(([a-z]+) *){0,1}([0-9]+)( *\(([a-z]+)\)){0,1}$/);
        if (result == null) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspeed', 'Invalid Entry': e});
        };
        var mode = "";
        if (result[2] == null) {
          mode = "land";
        } else {
          mode = result[2];
          if (!dnd35.movement_modes().includes(mode)) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspeed', 'Invalid Movement Mode': mode});
          };
        };
        if (mode_type_map[mode] !== undefined) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspeed', 'Invalid Movement Mode': mode, '': 'This mode was defined multiple times.'});
        } else {
          mode_type_map[mode] = result[3];
        };
        if (mode=="fly") {
          if (result[5] == null) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspeed', 'Invalid fly maneuverability': '**Undefined**'});
          } else {
            if (!dnd35.fly_maneuverability().includes(result[5])) {
              throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspeed', 'Invalid fly maneuverability': result[5]});
            };
          };
        };
      });
    };

    //npcarmorclassinfo
    {
      var npcarmorclassinfo = getAttrByName(id, "npcarmorclassinfo");
      var npcarmorclassinfos = stringTrimWhitespace(npcarmorclassinfo.toLowerCase())
                                                    .split(",");
      var bonus_type_map = {};
      npcarmorclassinfos.forEach(function(e) {
        let result = e.match(/^[+]{0,1}([-]{0,1}[0-9]+) +(.*)+$/);
        if (result == null) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcarmorclassinfo', 'Invalid Entry': e});
        };
        if (isNaN(result[1])) {
          throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcarmorclassinfo', 'In Entry': e, 'Invalid modifier value': result[1]});
        };
        if (['str','dex','con','int','wis','cha'].includes(result[2])) {
          var ability_mod = getAttrByName(id, ''.concat('npc',result[2],'-mod'));
          if (isNaN(ability_mod) && (result[1] != ability_mod.replace(/^\+/, ""))) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcarmorclassinfo', 'In Entry': e, 'Invalid modifier value': result[1]});
          };
        };
        if (result[2] == "size") {
          var size_mod = sizeToArmorClassMod(getAttrByName(id, "npcsize").toLowerCase());
          if (result[1] != size_mod) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcarmorclassinfo', 'In Entry': e, 'Invalid modifier value': result[1]});
          };
        };
      });
    };

    // npcspace
    {
      var npcspace = stringTrimWhitespace(getAttrByName(id, "npcspace").toLowerCase()
                                          .replace(/^([0-9]+) *(feet|foot|ft\.*|')$/g, "$1"));
      if (isNaN(npcspace)) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcspace', 'Invalid value': getAttrByName(id, "npcspace")});
      };
    };

    // npcreach
    {
      var npcreach = stringTrimWhitespace(getAttrByName(id, "npcreach").toLowerCase()
                                          .replace(/^([0-9]+) *(feet|foot|ft\.*|')$/g, "$1"));
      if (isNaN(npcreach)) {
        throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcreach', 'Invalid value': getAttrByName(id, "npcreach")});
      };
    };

    // npcskills
    {
      var npcskills = getAttrByName(id, "npcskills");
      npcskills = stringTrimWhitespace(npcskills).split(",");
      npcskills.forEach(function(npcSkillsEntry) {
        if (npcSkillsEntry == "") { return; }; // Not an error, just an empty skills field!
        let match_result = npcSkillsEntry.match(/([a-z() ]+)([+]{0,1}([-]{0,1}[0-9]+)){0,1}/i);
        if (match_result == null) { throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Invalid Entry': npcSkillsEntry}); };
        if (match_result[1] === undefined) { throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Invalid Entry': npcSkillsEntry}); };
        var skill_name = stringTrimWhitespace(match_result[1]);
        if (skill_name == "") { throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Empty Skill Entry': npcSkillsEntry}); };
        if (match_result[3] !== undefined) {
          if (isNaN(match_result[3])) { throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Skill Bonus Not a Number': npcSkillsEntry}); };
        } else {
          if (!skill_name.toLowerCase().match(/Speak Language\([a-z ]+\)/i)) {
            throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Skill Bonus Missing': npcSkillsEntry});
          };
        };
        var skill_spec = getSkillSpecification(skill_name);
        if (skill_spec == null) { throwDefaultTemplate("mookAuditNPCSheet()",id,{'Attribute Name': 'npcskills', 'Unknown Skill': npcSkillsEntry}); };
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
      var score    = parseFloat(getAttrByName(id, "npc"+ability));
      var modifier = Math.floor(score/2-5);
      // Fix PC page Ability Scores
      setAttrByName(id, ability+"-base", score);
    });
    {
      // Fix PC page character name
      setAttrByName(id, "character_name", getAttrByName(id, "npcname"));
    };
    {
      // Fix PC page size
      var npcsize_num = sizeToMod(getAttrByName(id, "npcsize"));
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
      var npcspeeds = getAttrByName(id, "npcspeed").toLowerCase()
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
        var tokens = e.split(" ");
        switch (tokens[0]) {
          case 'fly':
            setAttrByName(id, "fly-speed", tokens[1]);
            var maneuver = tokens[2].toLowerCase().replace(/[^a-z]/g, "");
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
      var npcaclist = getAttrByName(id, "npcarmorclassinfo").toLowerCase()
         .replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, " ")             // cleanup whitespace
         .replace(/ *, */g, ",")
         .split(",");
      npcaclist.forEach(function(e) {
        var tokens = e.split(" ");
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
        var k = e.split(/ (.+)/)[1];
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
          parseFloat(getAttrByName(id, "size")*(-4))
        ));
      };
    };
    {
      // Fix PC page Skills
      // Clear out all the skill settings on PC tab.
      for (var k in dnd35.skills()) {
        //log(dnd35.skills()[k]);
        if (dnd35.skills()[k].attrib != "") {
          if (dnd35.skills()[k].attrib.match(/\#/)) {
            for (var skillindex=1; skillindex<4; skillindex++) {
              setAttrByName(id, dnd35.skills()[k].attrib.replace(/\#/, ''.concat(skillindex,"ranks")), 0);
              setAttrByName(id, dnd35.skills()[k].attrib.replace(/\#/, ''.concat(skillindex,"classskill")), 0);
              setAttrByName(id, dnd35.skills()[k].attrib.replace(/\#/, ''.concat(skillindex,"miscmod")), 0);
            };
          } else {
            setAttrByName(id, dnd35.skills()[k].attrib.concat("ranks"), 0);
            setAttrByName(id, dnd35.skills()[k].attrib.concat("classskill"), 0);
            setAttrByName(id, dnd35.skills()[k].attrib.concat("miscmod"), 0);
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
        var npcskills = getAttrByName(id, 'npcskills');
        var speakLanguage = [];
        npcskills = stringTrimWhitespace(npcskills).split(',');
        npcskills.forEach(function(npcSkillsEntry) {
          if (npcSkillsEntry == '') { return; }; // Not an error, just an empty skills field!
          let match_result = npcSkillsEntry.match(/([a-z() ]+)([+]{0,1}([-]{0,1}[0-9]+)){0,1}/i);
          var skill_name = stringTrimWhitespace(match_result[1]);
          var npc_skill_bonus;
          if (match_result[3] !== undefined) {
            npc_skill_bonus = parseFloat(stringTrimWhitespace(match_result[3]));
          };
          var skill_spec = getSkillSpecification(skill_name);
          if ((skill_spec == null) || (skill_spec.base === undefined)) {
            throwDefaultTemplate('mookInferPCSheet()',id,{'Error': 'Unknown skill', 'Skill Name': skill_name});
            return;
          };
          //log(skill_spec);
          var skill_attrib = getSkillAttrName(id, skill_spec);
          //log("---> "+skill_attrib);
          if (['str-mod','dex-mod','con-mod','int-mod','wis-mod','cha-mod'].includes(skill_attrib)) {
            // A skill that's not defined YET on this character... so create it!
            var newRowID = generateUniqueRowID(id);
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
              var skill_bonus = attrib_msg[0].inlinerolls[0]['results']['total'];
              var c_id = attrib_msg[0].who;
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
    //TODO npcspecialqualities -> racialabilities
    //TODO npcfeats -> feats
    //SKIP npcspecialattacks
  }; // mookInferPCSheet

  //var checkSheetMacros = function(id) {
  //  for (var i=1; i<=10; i++) {
  //    var weaponNname = getAttrByName(id, "weapon"+i+"name");
  //    log(weaponNname);
  //  };
  //}; // checkSheetMacros

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

  var handleAddGraphic = function(obj) {
    var objLayer = obj.get("layer");
    var pageId   = obj.get("_pageid");
    var pageName = getObj("page", pageId).get("name");
    if (!obj.get("represents")) { return; }
    var character = getObj("character", obj.get("represents"));
    if (!character) { return; }
    character.get("_defaulttoken", function(defaultToken) {
      {
        var npcspecialqualities = getAttrByName(character.id, "npcspecialqualities").toLowerCase();
        var npcfeats            = getAttrByName(character.id, "npcfeats").toLowerCase();
        var racialabilities     = getAttrByName(character.id, "racialabilities").toLowerCase();
        var classabilities      = getAttrByName(character.id, "classabilities").toLowerCase();
        var feats               = getAttrByName(character.id, "feats").toLowerCase();
        if (npcspecialqualities.match(/low-light vision/) ||
            racialabilities.match(/low-light vision/) ||
            classabilities.match(/low-light vision/)) {
          var multiplier = 2;
          if (npcfeats.match(/improved low-light vision/) ||
              feats.match(/improved low-light vision/)) {
            multiplier = 4;
          };
          obj.set("light_multiplier", multiplier);
        };
        var match_result = npcspecialqualities.match(/darkvision *([0-9]+) *(feet|foot|ft\.*|')/);
        if (match_result == null) { match_result = racialabilities.match(/darkvision *([0-9]+) *(feet|foot|ft\.*|')/); };
        if (match_result == null) { match_result = classabilities.match(/darkvision *([0-9]+) *(feet|foot|ft\.*|')/);  };
        if ((match_result != null) && (match_result[1] != null)) {
          // match_result[1] is the darkvision distance in feet...
          var distance = parseFloat(match_result[1]);
          if (npcfeats.match(/improved darkvision/) ||
              feats.match(/improved darkvision/)) {
            distance = distance * 2;
          };
          obj.set("light_radius",       distance);
          //obj.set("light_dimradius",    (distance*5)/6); // For THAC0* Thursdays
          obj.set("light_dimradius",    distance+1);
        };
        obj.set("light_hassight", true); //TODO set to false if some sort of blind effect on the character...
      };
      if (defaultToken !== "null") { return; };
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
        npcspace = npcspace.toLowerCase();
        if (npcspace.match(/ by /)) {
          npcspace = npcspace
             .replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, " ");             // cleanup whitespace
          var dimensions = npcspace.split(" by ");
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
  }; // handleAddGraphic

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
    if (msg.type !== "api" || msg.content.indexOf("!scs ") === -1) { return; };

    var playerID           = msg.playerid;
    var playerName         = msg.who.replace(new RegExp(" \\(GM\\)$"), "");

    var tokenIDs             = getSelectedTokenIDs(msg);
    var unprocessedFragments = msg.content.split(/ +/);
    var processedFragments   = [];

    processedFragments.push(unprocessedFragments.shift()); // Drop the "!scs" entry, since we already checked that

    if (unprocessedFragments.length < 1) {
      respondToChat(msg,processedFragments.join(" ")+" a command");
      //TODO send usage info?
      return;
    };
    var userCommand = unprocessedFragments.shift();
    processedFragments.push(userCommand);

    var firstFragment = null;
    if (unprocessedFragments.length > 0) {
      firstFragment = unprocessedFragments.shift();
      processedFragments.push(firstFragment);
    };

    try {
      switch (userCommand) {
        //             ███████╗ ██████╗ ██╗   ██╗██████╗  ██████╗███████╗ ████████╗███████╗██╗  ██╗████████╗
        //             ██╔════╝██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔════╝ ╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝
        // █████╗█████╗███████╗██║   ██║██║   ██║██████╔╝██║     █████╗█████╗██║   █████╗   ╚███╔╝    ██║
        // ╚════╝╚════╝╚════██║██║   ██║██║   ██║██╔══██╗██║     ██╔══╝╚════╝██║   ██╔══╝   ██╔██╗    ██║
        //             ███████║╚██████╔╝╚██████╔╝██║  ██║╚██████╗███████╗    ██║   ███████╗██╔╝ ██╗   ██║
        //             ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚══════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝
        case '--source-text':
          if (firstFragment == null) {
            //TODO Error / Usage message here
            break;
          };
          switch (firstFragment) {
            case 'list':
              var message_to_send = '';
              Object.keys(dnd35.all_source_texts).forEach(function(k,i) {
                //log(k+' '+dnd35.all_source_texts[k]);
                if (dnd35.enabled_source_texts.includes(k)) {
                  message_to_send = message_to_send.concat(' {{',dnd35.all_source_texts[k],'= enabled}}');
                } else {
                  message_to_send = message_to_send.concat(' {{',dnd35.all_source_texts[k],'= disabled}}');
                };
              });
              respondToChat(msg,'&{template:default} {{name=Source Texts}} '+message_to_send, null, {noarchive:true});
              break;
            case 'enable':
              break;
            case 'disable':
              break;
          };
          break;
        //             ███╗   ███╗ ██████╗  ██████╗ ██╗  ██╗
        //             ████╗ ████║██╔═══██╗██╔═══██╗██║ ██╔╝
        // █████╗█████╗██╔████╔██║██║   ██║██║   ██║█████╔╝
        // ╚════╝╚════╝██║╚██╔╝██║██║   ██║██║   ██║██╔═██╗
        //             ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝██║  ██╗
        //             ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
        case '--mook':
          if (!playerIsGM(playerID)) { /*TODO error message! */ return; };
          if (firstFragment == null) {
            //TODO Error / Usage message here
            break;
          };
          tokenIDs.forEach(function(idOfToken) {
            var obj = getObj("graphic", idOfToken);
            var character = getObj("character", obj.get("represents"));
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
                    //TODO Implement this?
                    break;
                };
              } catch(e) {
                respondToChat(msg,e);
              };
            });
          });
          break;
        //             ███████╗██╗  ██╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗███╗   ███╗
        //             ██╔════╝██║ ██╔╝██╔═══██╗██╔═══██╗██║ ██╔╝██║   ██║████╗ ████║
        // █████╗█████╗███████╗█████╔╝ ██║   ██║██║   ██║█████╔╝ ██║   ██║██╔████╔██║
        // ╚════╝╚════╝╚════██║██╔═██╗ ██║   ██║██║   ██║██╔═██╗ ██║   ██║██║╚██╔╝██║
        //             ███████║██║  ██╗╚██████╔╝╚██████╔╝██║  ██╗╚██████╔╝██║ ╚═╝ ██║
        //             ╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝
        case '--skookum':
          if (firstFragment == null) {
            //TODO Error / Usage message here
            break;
          };
          tokenIDs.forEach(function(idOfToken) {
            var obj = getObj("graphic", idOfToken);
            var character = getObj("character", obj.get("represents"));
            if (!character) {
              respondToChat(msg,'&{template:default} {{name=handleChatMessage()}} {{Token= [image]('+obj.get("imgsrc").replace(new RegExp("\\?.*$"), "")+')}} {{Message= Token does not represent a character.}}');
              return;
            };
            //TODO Check that msg.who can edit character!!
            character.get("_defaulttoken", function(defaultToken) {
              if (defaultToken === "null") {
                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Not a skookum'}));
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
                  case 'fill-spell-macros':
                    //TODO
                    findObjs({
                      _type: "attribute",
                      _characterid: character.id
                    }).filter(attribute => attribute.get('name').match(/^repeating_spells[0-9]+[1-2]_.*_spellname[0-9]+[1-2]$/)).forEach(function(spellname_attr) {
                      var match_result = spellname_attr.get('name').match(/^repeating_spells([0-9]+)([1-2])_(.*)_spellname[0-9]+[1-2]$/);
                      var spell_section = match_result[1];
                      var spell_column  = match_result[2];
                      var rowID         = match_result[3];
                      //log("I deleting attribute: " + attr_obj.get('name'));
                      var spellmacro = getAttrByName(character.id, ''.concat('repeating_spells',spell_section,spell_column,'_',rowID,'_spellmacro',spell_section,spell_column));
                      if (spellmacro == "FILL") {
                        var spell_name = stringTrimWhitespace(spellname_attr.get('current').toLowerCase()).replace(/[^a-z ]/g, '');
                        if (Object.keys(dnd35.spells()).includes(spell_name)) {
                          var spell_spec = dnd35.spell(spell_name);
                          //log(spell_spec);
                          //log("^^^^^^^^^^^^^^");
                          var new_spell_name = spellname_attr.get('current').replace(/[^A-Za-z ]/g, '');
                          if (spell_spec.material) {
                            if (spell_spec.material.toLowerCase().match(/material component\:.*[0-9,]+ *(cp|sp|gp|pp)/)) {
                              new_spell_name = new_spell_name.concat('ᴹ');
                            };
                            if (spell_spec.material.toLowerCase().match(/focus\:.*[0-9,]+ *(cp|sp|gp|pp)/)) {
                              new_spell_name = new_spell_name.concat('ᶠ');
                            };
                            if (spell_spec.material.toLowerCase().match(/xp cost\:/)) {
                              new_spell_name = new_spell_name.concat('ˣ');
                            };
                          };
                          setAttrByName(character.id,spellname_attr.get('name'),new_spell_name);
                          spellmacro = '&{template:DnD35StdRoll} {{spellflag=true}} {{name=@{character_name}}}';
                          if (spell_spec.ref.match(/^https{0,1}:\/\//)) {
                            spellmacro = spellmacro.concat(' {{subtags=casts [',spellname_attr.get('current'), '](', spell_spec.ref, ')}}');
                          } else {
                            spellmacro = spellmacro.concat(' {{subtags=casts ',spellname_attr.get('current'),'↲',spell_spec.ref,'}}');
                          };
                          spellmacro = spellmacro.concat(' {{School:=',spell_spec.school,'}}');
                          spellmacro = spellmacro.concat(' {{Level:=',spell_spec.level,'}}');
                          {
                            var spellcastingstat = 'spellcastingstat';
                            if (spell_column == '2') {
                              if (isAttrByNameDefined(character.id, 'spellcastingstat2')) {
                                spellcastingstat = spellcastingstat.concat('2');
                              } else {
                                respondToChat(msg,renderDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Character does not have spellcastingstat2 attribute defined.'}));
                              };
                            };
                            spellmacro = spellmacro.concat(' {{Spell DC:=[[10+', spell_section, '[Spell Level]+@{', spellcastingstat, '}[Ability Mod]]]}}');
                          }
                          {
                            var default_casterlevel = 'casterlevel';
                            if (spell_column == '2') { default_casterlevel = default_casterlevel.concat('2'); };
                            spellmacro = spellmacro.concat(' {{Casting level:=?{Casting Level|@{',default_casterlevel,'}}}}');
                          }
                          spellmacro = spellmacro.concat(' {{Components:=',spell_spec.components,'}}');
                          spellmacro = spellmacro.concat(' {{Casting Time:=',spell_spec.casting_time,'}}');
                          if (spell_spec.recharge) {
                            spellmacro = spellmacro.concat(' {{Recharge:=',spell_spec.recharge,'}}');
                          };
                          if (dnd35.spell_ranges()[spell_spec.range] === undefined) {
                            spellmacro = spellmacro.concat(' {{Range:=',spell_spec.range,'}}');
                          } else {
                            spellmacro = spellmacro.concat(' {{Range:=',dnd35.spell_ranges()[spell_spec.range],'}}');
                          };
                          spellmacro = spellmacro.concat(' {{',spell_spec.target_type,':=',spell_spec.target,'}}');
                          spellmacro = spellmacro.concat(' {{Duration:=',spell_spec.duration,'}}');
                          if (spell_spec.saving_throw) {
                            spellmacro = spellmacro.concat(' {{Saving Throw:=',spell_spec.saving_throw,'}}');
                          };
                          if (spell_spec.spell_resistance) {
                            spellmacro = spellmacro.concat(' {{Spell Resist.:=',spell_spec.spell_resistance,'}}');
                            if (spell_spec.spell_resistance != 'No') {
                              spellmacro = spellmacro.concat(' {{Caster level check:=[[1d20+?{Casting Level}[Casting Level]+@{spellpen}[Spell Penalty]]] vs spell resist.}}');
                            };
                          };
                          spellmacro = spellmacro.concat(' {{compcheck=Concentration check: [[{1d20+[[@{concentration}]]}>?{Concentration DC (Ask GM)|0}]]↲Result: }}');
                          spellmacro = spellmacro.concat(' {{succeedcheck=**Concentration succeeds.**↲↲',spell_spec.text,'}}');
                          spellmacro = spellmacro.concat(' {{failcheck=**Concentration fails.**↲↲',spell_spec.text,'}}');
                          if (spell_spec.material) {
                            spellmacro = spellmacro.concat(' {{notes=',spell_spec.material,'}}');
                          };
                          spellmacro = spellmacro.replace(/(\r\n|\n|\r)/gm, "↲");
                          //log(spellmacro);
                          // Create a chat button in output ‹ and ›, or « and » for indirect buttons
                          while (spellmacro.match(/^.*‹[^›«»|]+›.*$/) ||
                                 spellmacro.match(/^.*‹[^›«»|]+\|[^›«»]+›.*$/) ||
                                 spellmacro.match(/^.*«[^‹›»|]+».*$/) ||
                                 spellmacro.match(/^.*«[^‹›»|]+\|[^‹›»]+».*$/)) {
                            var match_results;
                            match_results = spellmacro.match(/^(.*)‹([^›«»|]+)›(.*)$/);
                            if (match_results) {
                              spellmacro = ''.concat(match_results[1],createChatButton(match_results[2],''.concat('[[',match_results[2],']]')),match_results[3]);
                            };
                            match_results = spellmacro.match(/^(.*)‹([^›«»|]+)\|([^›«»]+)›(.*)$/);
                            if (match_results) {
                              spellmacro = ''.concat(match_results[1],createChatButton(match_results[2],match_results[3]),match_results[4]);
                            };
                            match_results = spellmacro.match(/^(.*)«([^‹›»|]+)»(.*)$/);
                            if (match_results) {
                              spellmacro = ''.concat(match_results[1],createEscapedChatButton(match_results[2],''.concat('[[',match_results[2],']]')),match_results[3]);
                            };
                            match_results = spellmacro.match(/^(.*)«([^‹›»|]+)\|([^‹›»]+)»(.*)$/);
                            if (match_results) {
                              spellmacro = ''.concat(match_results[1],createEscapedChatButton(match_results[2],match_results[3]),match_results[4]);
                            };
                            //log(spellmacro);
                          };
                          spellmacro = spellmacro.replace(/↲ +/g, "\n&nbsp;&nbsp;&nbsp;"); // INDENT!
                          spellmacro = spellmacro.replace(/↲/g, "\n");
                          //log("FOUND!");
                          //log(spell_spec);
                          setAttrByName(character.id, ''.concat('repeating_spells',spell_section,spell_column,'_',rowID,'_spellmacro',spell_section,spell_column), spellmacro);
                        };
                      };
                    });
                    break;
                };
              } catch(e) {
                respondToChat(msg,e);
              };
            });
          });
          break;
        //          ████████╗ ██████╗  ██████╗  ██████╗ ██╗     ███████╗    ██████╗ ███████╗ █████╗  ██████╗██╗  ██╗       █████╗ ██╗   ██╗██████╗  █████╗ ███████╗
        //          ╚══██╔══╝██╔═══██╗██╔════╝ ██╔════╝ ██║     ██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔════╝██║  ██║      ██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔════╝
        // █████╗█████╗██║   ██║   ██║██║  ███╗██║  ███╗██║     █████╗█████╗██████╔╝█████╗  ███████║██║     ███████║█████╗███████║██║   ██║██████╔╝███████║███████╗
        // ╚════╝╚════╝██║   ██║   ██║██║   ██║██║   ██║██║     ██╔══╝╚════╝██╔══██╗██╔══╝  ██╔══██║██║     ██╔══██║╚════╝██╔══██║██║   ██║██╔══██╗██╔══██║╚════██║
        //             ██║   ╚██████╔╝╚██████╔╝╚██████╔╝███████╗███████╗    ██║  ██║███████╗██║  ██║╚██████╗██║  ██║      ██║  ██║╚██████╔╝██║  ██║██║  ██║███████║
        //             ╚═╝    ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
        case '--toggle-reach-auras':
          if (!playerIsGM(playerID)) { return; /* TODO */ };
          tokenIDs.forEach(function(idOfToken) {
            var obj = getObj("graphic", idOfToken);
            var character = getObj("character", obj.get("represents"));
            if (!character) { return; };
            var reach = getAttrByName(character.id, "npcreach").replace(new RegExp("[^\.0-9].*$"), "");
            if ((!isAttrByNameDefined(character.id, "npcname")) || (getAttrByName(character.id, "npcname") == "")) {
              //log(getAttrByName(character.id, "size"));
              reach = sizeModToTallReach(getAttrByName(character.id, "size"));
            };
            if (isNaN(reach)) { throwDefaultTemplate("handleChatMessage()",character.id,{'Error': 'Reach distance is not a number'}); };
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
              obj.set("aura1_square", (reach*2<=10));
              obj.set("aura2_radius", reach);
              obj.set("aura2_color", "#0000FF");
              obj.set("aura2_square", (reach<=10));
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
          break;
        //             ███████╗███████╗████████╗   ██╗     ██╗ ██████╗ ██╗  ██╗████████╗   ███████╗ ██████╗ ██╗   ██╗██████╗  ██████╗███████╗
        //             ██╔════╝██╔════╝╚══██╔══╝   ██║     ██║██╔════╝ ██║  ██║╚══██╔══╝   ██╔════╝██╔═══██╗██║   ██║██╔══██╗██╔════╝██╔════╝
        // █████╗█████╗███████╗█████╗     ██║█████╗██║     ██║██║  ███╗███████║   ██║█████╗███████╗██║   ██║██║   ██║██████╔╝██║     █████╗
        // ╚════╝╚════╝╚════██║██╔══╝     ██║╚════╝██║     ██║██║   ██║██╔══██║   ██║╚════╝╚════██║██║   ██║██║   ██║██╔══██╗██║     ██╔══╝
        //             ███████║███████╗   ██║      ███████╗██║╚██████╔╝██║  ██║   ██║      ███████║╚██████╔╝╚██████╔╝██║  ██║╚██████╗███████╗
        //             ╚══════╝╚══════╝   ╚═╝      ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚══════╝
        case '--set-light-source':
          if (!playerIsGM(playerID)) { return; /* TODO */ };
          if (firstFragment == null) {
            respondToChat(msg,'&{template:default} {{name=ERROR}} {{Command= '+processedFragments.join(" ")+'}} {{Message= Required arguments missing}}');
            return;
          };
          firstFragment = stringTrimWhitespace(firstFragment.concat(" ", unprocessedFragments.join(" ")));
          //log(firstFragment);
          processedFragments.concat(unprocessedFragments);
          unprocessedFragments = [];
          var light_source_spec = dnd35.light_sources()[firstFragment.toLowerCase()];
          if (!light_source_spec) {
            respondToChat(msg,'&{template:default} {{name=ERROR}} {{Command= '+processedFragments.join(" ")+'}} {{Message= Unknown light source}}');
            return;
          };
          tokenIDs.forEach(function(idOfToken) {
            var obj = getObj("graphic", idOfToken);
            var light_radius       = light_source_spec.radius;
            var light_dimradius    = light_source_spec.dim;
            var light_angle        = light_source_spec.angle;
            var light_otherplayers = (light_source_spec.radius != '');
            var light_multiplier   = 1;
            var character = getObj("character", obj.get("represents"));
            if (character) {
              //TODO Clean up detection of the following properties by parsing the fields into lists and checking for matching entries.
              var npcspecialqualities = getAttrByName(character.id, "npcspecialqualities").toLowerCase();
              var npcfeats            = getAttrByName(character.id, "npcfeats").toLowerCase();
              var racialabilities     = getAttrByName(character.id, "racialabilities").toLowerCase();
              var classabilities      = getAttrByName(character.id, "classabilities").toLowerCase();
              var feats               = getAttrByName(character.id, "feats").toLowerCase();
              if (npcspecialqualities.match(/low-light vision/) ||
                  racialabilities.match(/low-light vision/) ||
                  classabilities.match(/low-light vision/)) {
                light_multiplier = 2;
                if (npcfeats.match(/improved low-light vision/) ||
                    feats.match(/improved low-light vision/)) {
                  light_multiplier = 4;
                };
              };
              var match_result = npcspecialqualities.match(/darkvision *([0-9]+) *(feet|foot|ft\.*|')/);
              if (match_result == null) { match_result = racialabilities.match(/darkvision *([0-9]+) *(feet|foot|ft\.*|')/); };
              if (match_result == null) { match_result = classabilities.match(/darkvision *([0-9]+) *(feet|foot|ft\.*|')/);  };
              if ((match_result != null) && (match_result[1] != null)) {
                // match_result[1] is the darkvision distance in feet...
                var distance = parseFloat(match_result[1]);
                if (npcfeats.match(/improved darkvision/) ||
                    feats.match(/improved darkvision/)) {
                  distance = distance * 2;
                };
                if ((!light_otherplayers) || (light_radius == '') || (light_radius < distance)) {
                  light_radius    = distance;
                  //light_dimradius = (distance*5)/6; // For THAC0* Thursdays
                  light_dimradius = distance+1;
                };
              };
            };
            obj.set("light_radius",       light_radius);
            obj.set("light_dimradius",    light_dimradius);
            obj.set("light_angle",        light_angle);
            obj.set("light_otherplayers", light_otherplayers);
            obj.set("light_multiplier",   light_multiplier);
          });
          break
        //              ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗       ██╗███╗   ██╗██╗████████╗██╗ █████╗ ████████╗██╗██╗   ██╗███████╗     ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗
        //             ██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗      ██║████╗  ██║██║╚══██╔══╝██║██╔══██╗╚══██╔══╝██║██║   ██║██╔════╝    ██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝
        // █████╗█████╗██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝█████╗██║██╔██╗ ██║██║   ██║   ██║███████║   ██║   ██║██║   ██║█████╗█████╗██║     ███████║█████╗  ██║     █████╔╝
        // ╚════╝╚════╝██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝ ╚════╝██║██║╚██╗██║██║   ██║   ██║██╔══██║   ██║   ██║╚██╗ ██╔╝██╔══╝╚════╝██║     ██╔══██║██╔══╝  ██║     ██╔═██╗
        //             ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║           ██║██║ ╚████║██║   ██║   ██║██║  ██║   ██║   ██║ ╚████╔╝ ███████╗    ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗
        //              ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝           ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝  ╚══════╝     ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝
        case '--group-initiative-check':
          // --group-initiative-check [clear]
          //   The optional "clear" argument indicates that the turn order should be cleared before adding new entries
          if (!playerIsGM(playerID)) { return; /* TODO */ };
          var roll_initiative_map = {};
          {
            var filteredTokenIDs = [];
            for (var i=0; i<tokenIDs.length; i++) {
              var obj = getObj("graphic", tokenIDs[i]);
              var character = getObj("character", obj.get("represents"));
              if (character) {
                filteredTokenIDs.push(tokenIDs[i]);
              };
            };
            tokenIDs = filteredTokenIDs;
          };
          var remainingTokenIDs = tokenIDs.length;
          if ((firstFragment != null) && (firstFragment.toLowerCase() == "clear")) {
            Campaign().set("turnorder", JSON.stringify([]));
          };
          tokenIDs.forEach( idOfToken => {
            var obj = getObj("graphic", idOfToken);
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
                    if (turnorder[i]["id"] === idOfToken) {
                      token_in_turnorder = true;
                      turnorder[i]["pr"] = init_macro_rsp[0].inlinerolls[0]["results"]["total"].toFixed(4);
                      break;
                    };
                  };
                  if (!token_in_turnorder) {
                    turnorder.push({
                      id: idOfToken,
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
                remainingTokenIDs--;
                if (remainingTokenIDs==0) {
                  var chat_msg = "&{template:default} {{name=Group Initiative}} ";
                  Object.keys(roll_initiative_map).forEach(function(k){
                    if (roll_initiative_map[k] == "EXCLUDE") {
                      return;
                    };
                    chat_msg += "{{" + k + "= "+ roll_initiative_map[k] +"}} ";
                  });
                  respondToChat(msg,chat_msg);
                };
              });
            } catch (e) {
              log("Encountered a problem while rolling group initiative: "+e);
              log("  Macro = "+init_macro);
            };
          });
          break;
        //              ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗       ███████╗██╗  ██╗██╗██╗     ██╗       ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗
        //             ██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗      ██╔════╝██║ ██╔╝██║██║     ██║      ██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝
        // █████╗█████╗██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝█████╗███████╗█████╔╝ ██║██║     ██║█████╗██║     ███████║█████╗  ██║     █████╔╝
        // ╚════╝╚════╝██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝ ╚════╝╚════██║██╔═██╗ ██║██║     ██║╚════╝██║     ██╔══██║██╔══╝  ██║     ██╔═██╗
        //             ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║           ███████║██║  ██╗██║███████╗███████╗ ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗
        //              ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝           ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝  ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝
        case '--group-skill-check':
          // --group-skill-check (Aid Another|Individual) (<Skill Name>)
          //   Both arguments are required
          if (!playerIsGM(playerID)) { return; /* TODO */ };
          if (firstFragment == null) {
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
          var secondFragment = unprocessedFragments.join(" ");
          processedFragments.concat(unprocessedFragments);
          unprocessedFragments = [];
          //secondFragment = secondFragment.toLowerCase();
          var skill_spec = getSkillSpecification(secondFragment);
          if ((skill_spec == null) || (skill_spec.base === undefined)) {
            respondToChat(msg,'&{template:default} {{name=ERROR}} {{Command= '+processedFragments.join(" ")+'}} {{Message= Unknown skill '+secondFragment+'}}');
            return;
          };
          var skill_trained_only = skill_spec.trained_only || '';
          var help_type          = firstFragment;
          var roll_skill_map     = {}; // key=uniquified char_name, val=skill check
          {
            var filteredTokenIDs = [];
            for (var i=0; i<tokenIDs.length; i++) {
              var obj = getObj("graphic", tokenIDs[i]);
              var character = getObj("character", obj.get("represents"));
              if (character) {
                filteredTokenIDs.push(tokenIDs[i]);
              };
            };
            tokenIDs = filteredTokenIDs;
          };
          var remainingTokenIDs  = tokenIDs.length;
          //log(skill_spec);
          // Loop through each selected character...
          tokenIDs.forEach(function(idOfToken) {
            var obj          = getObj("graphic", idOfToken);
            var character    = getObj("character", obj.get("represents"));
            var char_name    = character.get("name");
            var skill_attrib = getSkillAttrName(character.id, skill_spec);
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
            remainingTokenIDs--;
            if (remainingTokenIDs==0) {
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
                          var aid_total = 0/0;
                          var checks_total = 0;
                          var checks_num   = 0;
                          var chat_msg = "&{template:default} {{name=Group Skill Check}} {{Skill= "+secondFragment.replace(/\(/,"\n(")+"}} {{Check Type= "+help_type+"}} ";
                          var prints_remaining = Object.keys(roll_skill_map).length;
                          //Object.keys(roll_skill_map).forEach(function(char_name_unique) {
                          Object.keys(roll_skill_map).forEach(char_name_unique => {
                            if (roll_skill_map[char_name_unique].state != "EXCLUDE") {
                              if (roll_skill_map[char_name_unique].state != "UNTRAINED") {
                                checks_total += roll_skill_map[char_name_unique].check;
                                checks_num++;
                                if ((help_type.toLowerCase() == "aid another") && (char_name_unique !== highest_char_name)) {
                                  var aid_inc = 0;
                                  if (roll_skill_map[char_name_unique].check >= 10) { aid_inc = 2; };
                                  if (isNaN(aid_total)) { aid_total = aid_inc; } else { aid_total += aid_inc; };
                                  chat_msg += "{{" + char_name_unique + "= +" + aid_inc + "(" + roll_skill_map[char_name_unique].check + ")}} ";
                                } else {
                                  if (isNaN(aid_total)) { aid_total = roll_skill_map[char_name_unique].check; } else { aid_total += roll_skill_map[char_name_unique].check; };
                                  chat_msg += "{{" + char_name_unique + "= " + roll_skill_map[char_name_unique].check + "}} ";
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
                                var avg_check = checks_total / checks_num;
                                chat_msg += "{{*Average*= ***"+avg_check.toFixed(2)+"***}}";
                              };
                              respondToChat(msg,chat_msg);
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
          if (!playerIsGM(playerID)) { return; /* TODO */ };
          tokenIDs.forEach(function(idOfToken) {
              var obj = getObj("graphic", idOfToken);
              var character = getObj("character", obj.get("represents"));
              if (!character) { return; };
              var attrib_val = getAttrByName(character.id, firstFragment);
              log(firstFragment+' attribute for '+character.get("name")+' is = '+attrib_val);
          });
          break;
        case '--debug-attribute-regex':
          if (!playerIsGM(playerID)) { return; /* TODO */ };
          log("--debug-attribute-regex "+firstFragment);
          tokenIDs.forEach(function(idOfToken) {
              var token_obj = getObj("graphic", idOfToken);
              var character = getObj("character", token_obj.get("represents"));
              if (!character) { return; };
              findObjs({
                _type: "attribute",
                _characterid: character.id
              }).filter(attribute => attribute.get('name').match(new RegExp(firstFragment))).forEach(function(attr_obj) {
                log(attr_obj);
              });
              //var attrib_val = getAttrByName(character.id, firstFragment);
              //log(firstFragment+' attribute for '+character.get("name")+' is = '+attrib_val);
          });
          break;
        case '--help':
        case undefined:
        default:
        //getHelp();
          sendChat("GM", '/w "'+playerName+'" Test 1 2 3 '+playerName);
          break;
      };
    } catch (e) {
      log("Encountered a problem on "+userCommand+" operation:\n"+e);
    };
  }; // handleChatMessage

  // ███████╗ ██████╗██████╗ ██╗██████╗ ████████╗    ██╗███╗   ██╗██╗████████╗
  // ██╔════╝██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝    ██║████╗  ██║██║╚══██╔══╝
  // ███████╗██║     ██████╔╝██║██████╔╝   ██║       ██║██╔██╗ ██║██║   ██║
  // ╚════██║██║     ██╔══██╗██║██╔═══╝    ██║       ██║██║╚██╗██║██║   ██║
  // ███████║╚██████╗██║  ██║██║██║        ██║       ██║██║ ╚████║██║   ██║
  // ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝       ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝

  var registerEventHandlers = function() {
    on('add:graphic',  handleAddGraphic);
    on('chat:message', handleChatMessage);
  }; // registerEventHandlers

  var checkInstall = function() {
    if ( Boolean(state.skepickleCharacterSuiteImp) === false ) {
      state.skepickleCharacterSuiteImp = {
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
  skepickleCharacterSuite.CheckInstall();
  skepickleCharacterSuite.Initialize();
  skepickleCharacterSuite.RegisterEventHandlers();
});
