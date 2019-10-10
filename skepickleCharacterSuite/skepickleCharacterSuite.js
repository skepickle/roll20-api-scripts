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
        // Spells that start with A
        'acid arrow': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Acid_Arrow',
          school:           'Conjuration (Creation) [Acid]',
          level:            'Sor/Wiz 2',
          components:       'V, S, M, F',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Effect',
          target:           'One arrow of acid',
          duration:         '[[1+floor([[?{Casting Level}/3]])]] round(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             'A magical arrow of acid springs from your hand and speeds to its target. You must succeed on a ranged [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack) to hit your target. The arrow deals [[2d4]] points of acid damage with no splash damage. The acid, unless somehow neutralized, lasts for another [[floor({?{Casting Level},18}kl1/3)]] round(s), dealing another ‹2d4|***Acid Arrow***: [[2d4]] delayed acid damage› points of damage each round.',
          component_details:`Material Component: Powdered rhubarb leaf and an adder’s stomach.
                             Focus: A dart.`
        },
        'acid fog': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Acid_Fog',
          school:           'Conjuration (Creation) [Acid]',
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
          component_details:'Arcane Material Component: A pinch of dried, powdered peas combined with powdered [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) hoof.' },
        'acid splash': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Acid_Splash',
          school:           'Conjuration (Creation) [Acid]',
          level:            'Sor/Wiz 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'One missile of acid',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             'You fire a small orb of acid at the target. You must succeed on a ranged [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack) to hit your target. The orb deals [[1d3]] points of acid damage.',
          material: null
        },
        'aid': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Aid',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Clr 2, Good 2, Luck 2',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          targer_type:      'Target',
          target:           'Living creature touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes (harmless)',
          text:             '*Aid* grants the target a +1 \`\`morale bonus\`\` on attack rolls and saves against fear effects, plus [[1d8+[[{?{Casting Level},10}kl1]]]] temporary hit points.',
          component_details:null
        },
        'air walk': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Air_Walk',
          school:           'Transmutation [Air]',
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
                             Should the spell duration expire while the subject is still aloft, the magic fails slowly. The subject floats downward 60 feet per round for ‹1d6› rounds. If it reaches the ground in that amount of time, it lands safely. If not, it falls the rest of the distance, taking ‹1d6› points of damage per 10 feet of fall. Since dispelling a spell effectively ends it, the subject also descends in this way if the *air walk* spell is dispelled, but not if it is negated by an [*antimagic field*](https://www.dandwiki.com/wiki/SRD:Antimagic_Field).
                             You can cast *air walk* on a specially trained mount so it can be ridden through the air. You can train a mount to move with the aid of *air walk* (counts as a trick; see Handle Animal skill) with one week of work and a DC 25 Handle Animal check.`,
          component_details:null
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
                             *Mental Alarm:* A mental *alarm* alerts you (and only you) so long as you remain within 1 mile of the warded area. You note a single mental “ping” that awakens you from normal sleep but does not otherwise disturb concentration. A [*silence*](https://www.dandwiki.com/wiki/SRD:Silence) spell has no effect on a mental *alarm*.
                             *Audible Alarm:* An audible *alarm* produces the sound of a hand bell, and anyone within 60 feet of the warded area can hear it clearly. Reduce the distance by 10 feet for each interposing closed door and by 20 feet for each substantial interposing wall.
                             In quiet conditions, the ringing can be heard faintly as far as 180 feet away. The sound lasts for 1 round. Creatures within a [*silence*](https://www.dandwiki.com/wiki/SRD:Silence) spell cannot hear the ringing.
                             Ethereal or astral creatures do not trigger the *alarm*.
                             *Alarm* can be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:'Arcane Focus: A tiny bell and a piece of very fine silver wire.'
        },
        'align weapon': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Align_Weapon',
          school:           'Transmutation [see text]',
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
                             You can’t cast this spell on a [natural weapon](https://www.dandwiki.com/wiki/SRD:Natural_Weapon), such as an [unarmed strike](https://www.dandwiki.com/wiki/SRD:Unarmed_Strike).
                             When you make a weapon good, evil, lawful, or chaotic, *align weapon* is a good, evil, lawful, or chaotic spell, respectively.`,
          component_details:null
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
          text:             `You assume the form of a creature of the same type as your normal form. The new form must be within one [size category](https://www.dandwiki.com/wiki/SRD:Size_Category) of your normal size. The maximum HD of an assumed form is equal to your caster level, to a maximum of 5 HD at 5th level. You can change into a member of your own kind or even into yourself.
                             You retain your own ability scores. Your class and level, hit points, alignment, base attack bonus, and base save bonuses all remain the same. You retain all supernatural and spell-like special attacks and qualities of your normal form, except for those requiring a body part that the new form does not have (such as a mouth for a breath weapon or eyes for a gaze attack).
                             You keep all extraordinary special attacks and qualities derived from class levels, but you lose any from your normal form that are not derived from class levels.
                             If the new form is capable of speech, you can communicate normally. You retain any spellcasting ability you had in your original form, but the new form must be able to speak intelligibly (that is, speak a language) to use verbal components and must have limbs capable of fine manipulation to use somatic or material components.
                             You acquire the physical qualities of the new form while retaining your own mind. Physical qualities include natural size, mundane movement capabilities (such as burrowing, climbing, walking, swimming, and flight with wings, to a maximum speed of 120 feet for flying or 60 feet for nonflying movement), natural armor bonus, [natural weapons](https://www.dandwiki.com/wiki/SRD:Natural_Weapon) (such as claws, bite, and so on), racial skill bonuses, racial bonus feats, and any gross physical qualities (presence or absence of wings, number of extremities, and so forth). A body with extra limbs does not allow you to make more attacks (or more advantageous two-weapon attacks) than normal.
                             You do not gain any extraordinary special attacks or special qualities not noted above under physical qualities, such as darkvision, low-light vision, blindsense, blindsight, fast healing, regeneration, scent, and so forth.
                             You do not gain any supernatural special attacks, special qualities, or [spell-like abilities](https://www.dandwiki.com/wiki/SRD:Spell-Like_Ability) of the new form. Your creature type and subtype (if any) remain the same regardless of your new form. You cannot take the form of any creature with a template, even if that template doesn’t change the creature type or subtype.
                             You can freely designate the new form’s minor physical qualities (such as hair color, hair texture, and skin color) within the normal ranges for a creature of that kind. The new form’s significant physical qualities (such as height, weight, and gender) are also under your control, but they must fall within the norms for the new form’s kind. You are effectively disguised as an average member of the new form’s race. If you use this spell to create a disguise, you get a +10 \`\`bonus\`\` on your Disguise check.
                             When the change occurs, your equipment, if any, either remains worn or held by the new form (if it is capable of wearing or holding the item), or melds into the new form and becomes nonfunctional. When you revert to your true form, any objects previously melded into the new form reappear in the same location on your body they previously occupied and are once again functional. Any new items you wore in the assumed form and can’t wear in your normal form fall off and land at your feet; any that you could wear in either form or carry in a body part common to both forms at the time of reversion are still held in the same way. Any part of the body or piece of equipment that is separated from the whole reverts to its true form.`,
          component_details:null
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
                             *Analyze dweomer* does not function when used on an [artifact](https://www.dandwiki.com/wiki/SRD:Artifacts).`,
          component_details:'Focus: A tiny lens of ruby or sapphire set in a small golden loop. The gemstone must be worth at least 1,500 gp.'
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
          text:             `A number of [animals](https://www.dandwiki.com/wiki/SRD:Animal_Type) grow to twice their normal size and eight times their normal weight. This alteration changes each [animal’s](https://www.dandwiki.com/wiki/SRD:Animal_Type) [size category](https://www.dandwiki.com/wiki/SRD:Size_Category) to the next largest, grants it a +8 \`\`size bonus\`\` to Strength and a +4 \`\`size bonus\`\` to Constitution (and thus an extra 2 hit points per HD), and imposes a -2 \`\`size penalty\`\` to Dexterity. The creature’s existing natural armor bonus increases by 2. The size change also affects the [animal’s](https://www.dandwiki.com/wiki/SRD:Animal_Type) modifier to AC and attack rolls and its base damage. The [animal’s](https://www.dandwiki.com/wiki/SRD:Animal_Type) space and reach change as appropriate to the new size, but its speed does not change.
                             The spell also grants each subject damage reduction 10/magic and a +4 \`\`resistance bonus\`\` on saving throws. If insufficient room is available for the desired growth, the creature attains the maximum possible size and may make a Strength check (using its increased Strength) to burst any enclosures in the process. If it fails, it is constrained without harm by the materials enclosing it— the spell cannot be used to crush a creature by increasing its size.
                             All equipment worn or carried by an [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) is similarly enlarged by the spell, though this change has no effect on the magical properties of any such equipment.
                             Any enlarged item that leaves the enlarged creature’s possession instantly returns to its normal size.
                             The spell gives no means of command or influence over the enlarged [animals](https://www.dandwiki.com/wiki/SRD:Animal_Type).
                             Multiple magical effects that increase size do not stack.`,
          component_details:null
        },
        'animal messenger': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animal_Messenger',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 2, Drd 2, Rgr 1',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One Tiny animal',
          duration:         '[[?{Casting Level}]] day(s)',
          saving_throw:     'None; see text',
          spell_resistance: 'Yes',
          text:             `You compel a Tiny [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) to go to a spot you designate. The most common use for this spell is to get an [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) to carry a message to your allies. The [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) cannot be one tamed or trained by someone else, including such creatures as [familiars](https://www.dandwiki.com/wiki/SRD:Familiars) and [animal companions](https://www.dandwiki.com/wiki/SRD:Druid%27s_Animal_Companion).
                             Using some type of food desirable to the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) as a lure, you call the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) to you. It advances and awaits your bidding. You can mentally impress on the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) a certain place well known to you or an obvious landmark. The directions must be simple, because the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) depends on your knowledge and can’t find a destination on its own. You can attach some small item or note to the messenger. The [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) then goes to the designated location and waits there until the duration of the spell expires, whereupon it resumes its normal activities.
                             During this period of waiting, the messenger allows others to approach it and remove any scroll or token it carries. The intended recipient gains no special ability to communicate with the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) or read any attached message (if it’s written in a language he or she doesn’t know, for example).`,
          component_details:'Material Component: A morsel of food the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) likes.'
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
          text:             'You transform up to one willing creature per caster level into an [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) of your choice; the spell has no effect on unwilling creatures. Use the [alternate form](https://www.dandwiki.com/wiki/SRD:Alternate_Form) special ability to determine each target’s new abilities. All creatures must take the same kind of [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) form. Recipients remain in the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) form until the spell expires or until you dismiss it for all recipients. In addition, an individual subject may choose to resume its normal form as a full-round action; doing so ends the spell for that subject alone. The maximum HD of an assumed form is equal to the subject’s HD or your caster level, whichever is lower, to a maximum of 20 HD at 20th level.',
          component_details:null
        },
        'animal trance': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animal_Trance',
          school:           'Enchantment (Compulsion) [Mind-Affecting, Sonic]',
          level:            'Brd 2, Drd 2, Scalykind 2',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           '[[2d6]] HD worth of Animals or magical beasts with Intelligence 1 or 2',
          duration:         'Concentration',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `Your swaying motions and music (or singing, or chanting) compel [animals](https://www.dandwiki.com/wiki/SRD:Animal_Type) and [magical beasts](https://www.dandwiki.com/wiki/SRD:Magical_Beast_Type) to do nothing but watch you. Only a creature with an Intelligence score of 1 or 2 can be [fascinated](https://www.dandwiki.com/wiki/SRD:Fascinated) by this spell. The closest targets are selected first until no more targets within range can be affected.
                             A [magical beast](https://www.dandwiki.com/wiki/SRD:Magical_Beast_Type), a [dire animal](https://www.dandwiki.com/wiki/SRD:Dire_Animal), or an [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) trained to attack or guard is allowed a saving throw; an [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) not trained to attack or guard is not.`,
          component_details:null
        },
        'animate dead': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Animate_Dead',
          school:           'Necromancy [Evil]',
          level:            'Clr 3, Death 3, Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           'One or more corpses touched',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell turns the bones or bodies of [dead](https://www.dandwiki.com/wiki/SRD:Dead) creatures into [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) [skeletons](https://www.dandwiki.com/wiki/SRD:Skeleton) or [zombies](https://www.dandwiki.com/wiki/SRD:Zombie) that follow your spoken commands.
                             The [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) can follow you, or they can remain in an area and attack any creature (or just a specific kind of creature) entering the place. They remain animated until they are destroyed. (A destroyed skeleton or zombie can’t be animated again.)
                             Regardless of the type of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) you create with this spell, you can’t create more HD of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) than twice your caster level with a single casting of *animate dead*. (The [*desecrate*](https://www.dandwiki.com/wiki/SRD:Desecrate) spell doubles this limit)
                             The [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) you create remain under your control indefinitely. No matter how many times you use this spell, however, you can control only 4 HD worth of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creatures per caster level. If you exceed this number, all the newly created creatures fall under your control, and any excess [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) from previous castings become uncontrolled. (You choose which creatures are released.) If you are a [cleric](https://www.dandwiki.com/wiki/SRD:Cleric), any [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) you might command by virtue of your power to command or rebuke [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) do not count toward the limit.
                             *[Skeletons](https://www.dandwiki.com/wiki/SRD:Skeleton):* A skeleton can be created only from a mostly intact corpse or skeleton. The corpse must have bones. If a skeleton is made from a corpse, the flesh falls off the bones.
                             *[Zombies](https://www.dandwiki.com/wiki/SRD:Zombie):* A zombie can be created only from a mostly intact corpse. The corpse must be that of a creature with a true anatomy.`,
          component_details:'Material Component: You must place a black onyx gem worth at least 25 gp per Hit Die of the [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) into the mouth or eye socket of each corpse you intend to animate. The magic of the spell turns these gems into worthless, burned-out shells.'
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
          text:             `You imbue inanimate objects with mobility and a semblance of life. Each such [animated object](https://www.dandwiki.com/wiki/SRD:Animated_Object) then immediately attacks whomever or whatever you initially designate.
                             An animated object can be of any nonmagical material. You may animate one Small or smaller object or an equivalent number of larger objects per caster level. A Medium object counts as two Small or smaller objects, a Large object as four, a Huge object as eight, a Gargantuan object as sixteen, and a Colossal object as thirty-two. You can change the designated target or targets as a [move action](https://www.dandwiki.com/wiki/SRD:Move_Actions), as if directing an active spell.
                             This spell cannot animate objects carried or worn by a creature.
                             *Animate objects* can be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:null
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
          text:             `You imbue inanimate [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type) with mobility and a semblance of life. Each animated [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) then immediately attacks whomever or whatever you initially designate as though it were an [animated object](https://www.dandwiki.com/wiki/SRD:Animated_Object) of the appropriate [size category](https://www.dandwiki.com/wiki/SRD:Size_Category). You may animate one Large or smaller [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type), or an equivalent number of larger [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type), per three caster levels. A Huge [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) counts as two Large or smaller [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type), a Gargantuan [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) as four, and a Colossal [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) as eight. You can change the designated target or targets as a [move action](https://www.dandwiki.com/wiki/SRD:Move_Actions), as if directing an active spell.
                             Use the statistics for [animated objects](https://www.dandwiki.com/wiki/SRD:Animated_Object), except that [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type) smaller than Large usually don’t have hardness.
                             *Animate [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type)* cannot affect [plant creatures](https://www.dandwiki.com/wiki/SRD:Plant_Type), nor does it affect nonliving vegetable material.
                             *[Entangle](https://www.dandwiki.com/wiki/SRD:Entangled):* Alternatively, you may imbue all [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type) within range with a degree of mobility, which allows them to entwine around creatures in the area. This usage of the spell duplicates the effect of an [*entangle*](https://www.dandwiki.com/wiki/SRD:Entangle) spell. [Spell resistance](https://www.dandwiki.com/wiki/SRD:Spell_Resistance) does not keep creatures from being [entangled](https://www.dandwiki.com/wiki/SRD:Entangled). This effect lasts 1 hour per caster level.`,
          component_details:null
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
                             The possible commands are “coil” (form a neat, coiled stack), “coil and knot,” “loop,” “loop and knot,” “tie and knot,” and the opposites of all of the above (“uncoil,” and so forth). You can give one command each round as a [move action](https://www.dandwiki.com/wiki/SRD:Move_Actions), as if directing an active spell.
                             The rope can enwrap only a creature or an object within 1 foot of it—it does not snake outward—so it must be thrown near the intended target. Doing so requires a successful ranged [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack) roll (range increment 10 feet). A typical 1-inch-diameter hempen rope has 2 hit points, AC 10, and requires a DC 23 Strength check to burst it. The rope does not deal damage, but it can be used as a trip line or to cause a single opponent that fails a Reflex saving throw to become [entangled](https://www.dandwiki.com/wiki/SRD:Entangled). A creature capable of spellcasting that is bound by this spell must make a DC 15 Concentration check to cast a spell. An [entangled](https://www.dandwiki.com/wiki/SRD:Entangled) creature can slip free with a DC 20 Escape Artist check.
                             The rope itself and any knots tied in it are not magical.
                             This spell grants a +2 \`\`bonus\`\` on any Use Rope checks you make when using the transmuted rope.
                             The spell cannot animate objects carried or worn by a creature.`,
          component_details:null
        },
        //Epic Spell: animus blast
        //Epic Spell: animus blizzard
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
                             The effect hedges out [animals](https://www.dandwiki.com/wiki/SRD:Animal_Type), [aberrations](https://www.dandwiki.com/wiki/SRD:Aberration_Type), [dragons](https://www.dandwiki.com/wiki/SRD:Dragon_Type), [fey](https://www.dandwiki.com/wiki/SRD:Fey_Type), [giants](https://www.dandwiki.com/wiki/SRD:Giant_Type), [humanoids](https://www.dandwiki.com/wiki/SRD:Humanoid_Type), [magical beasts](https://www.dandwiki.com/wiki/SRD:Magical_Beast_Type), [monstrous humanoids](https://www.dandwiki.com/wiki/SRD:Monstrous_Humanoid_Type), [oozes](https://www.dandwiki.com/wiki/SRD:Ooze_Type), [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type), and [vermin](https://www.dandwiki.com/wiki/SRD:Vermin_Type), but not [constructs](https://www.dandwiki.com/wiki/SRD:Construct_Type), [elementals](https://www.dandwiki.com/wiki/SRD:Elemental_Type), [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type), or [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type).
                             This spell may be used only defensively, not aggressively. Forcing an [abjuration](https://www.dandwiki.com/wiki/SRD:Abjuration_School) barrier against creatures that the spell keeps at bay collapses the barrier.`,
          component_details:null
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
          text:             `An [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) barrier surrounds you and moves with you. The space within this barrier is impervious to most magical effects, including spells, [spell-like abilities](https://www.dandwiki.com/wiki/SRD:Spell-Like_Ability), and [supernatural abilities](https://www.dandwiki.com/wiki/SRD:Supernatural_Ability). Likewise, it prevents the functioning of any magic items or spells within its confines.
                             An *antimagic field* suppresses any spell or magical effect used within, brought into, or cast into the area, but does not dispel it. Time spent within an *antimagic field* counts against the suppressed spell’s duration.
                             Summoned creatures of any type and [incorporeal](https://www.dandwiki.com/wiki/SRD:Incorporeal_Subtype) [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) wink out if they enter an *antimagic field*. They reappear in the same spot once the field goes away. Time spent winked out counts normally against the duration of the conjuration that is maintaining the creature. If you cast *antimagic field* in an area occupied by a summoned creature that has [spell resistance](https://www.dandwiki.com/wiki/SRD:Spell_Resistance), you must make a caster level check (1d20 + caster level) against the creature’s [spell resistance](https://www.dandwiki.com/wiki/SRD:Spell_Resistance) to make it wink out. (The effects of instantaneous conjurations are not affected by an *antimagic field* because the conjuration itself is no longer in effect, only its result.)
                             A normal creature can enter the area, as can normal missiles. Furthermore, while a magic sword does not function magically within the area, it is still a sword (and a masterwork sword at that). The spell has no effect on golems and other [constructs](https://www.dandwiki.com/wiki/SRD:Construct_Type) that are imbued with magic during their creation process and are thereafter self-supporting (unless they have been summoned, in which case they are treated like any other summoned creatures). [Elementals](https://www.dandwiki.com/wiki/SRD:Elemental_Type), corporeal [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type), and [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type) are likewise unaffected unless summoned. These creatures’ spell-like or [supernatural abilities](https://www.dandwiki.com/wiki/SRD:Supernatural_Ability), however, may be temporarily nullified by the field. *Dispel magic* does not remove the field.
                             Two or more *antimagic fields* sharing any of the same space have no effect on each other. Certain spells, such as [*wall of force*](https://www.dandwiki.com/wiki/SRD:Wall_of_Force), [*prismatic sphere*](https://www.dandwiki.com/wiki/SRD:Prismatic_Sphere), and [*prismatic wall*](https://www.dandwiki.com/wiki/SRD:Prismatic_Wall), remain unaffected by antimagic field (see the individual spell descriptions). [Artifacts](https://www.dandwiki.com/wiki/SRD:Artifacts) and deities are unaffected by mortal magic such as this.
                             Should a creature be larger than the area enclosed by the barrier, any part of it that lies outside the barrier is unaffected by the field.`,
          component_details:'Arcane Material Component: A pinch of powdered iron or iron filings.'
        },
        'antipathy': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Antipathy',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
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
                             *Antipathy* counters and dispels [*sympathy*](https://www.dandwiki.com/wiki/SRD:Sympathy).`,
          component_details:'Arcane Material Component: A lump of alum soaked in vinegar.'
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
          text:             `The *antiplant shell* spell creates an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible), mobile barrier that keeps all creatures within the shell protected from attacks by [plant creatures](https://www.dandwiki.com/wiki/SRD:Plant_Type) or animated [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type). As with many abjuration spells, forcing the barrier against creatures that the spell keeps at bay strains and collapses the field.`,
          component_details:null
        },
        'arcane eye': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Arcane_Eye',
          school:           'Divination (Scrying)',
          level:            'Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '10 minutes',
          range:            'Unlimited',
          target_type:      'Effect',
          target:           'Magical sensor',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You create an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) magical sensor that sends you visual information. You can create the *arcane eye* at any point you can see, but it can then travel outside your line of sight without hindrance. An *arcane eye* travels at 30 feet per round (300 feet per minute) if viewing an area ahead as a human would (primarily looking at the floor) or 10 feet per round (100 feet per minute) if examining the ceiling and walls as well as the floor ahead. It sees exactly as you would see if you were there.
                             The eye can travel in any direction as long as the spell lasts. Solid barriers block its passage, but it can pass through a hole or space as small as 1 inch in diameter. The eye can’t enter another plane of existence, even through a [*gate*](https://www.dandwiki.com/wiki/SRD:Gate) or similar magical portal.
                             You must concentrate to use an *arcane eye*. If you do not concentrate, the eye is inert until you again concentrate.`,
          component_details:'Material Component: A bit of bat fur.'
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
          text:             `An *arcane lock* spell cast upon a door, chest, or portal magically locks it. You can freely pass your own *arcane lock* without affecting it; otherwise, a door or object secured with this spell can be opened only by breaking in or with a successful [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) or [*knock*](https://www.dandwiki.com/wiki/SRD:Knock) spell. Add 10 to the normal DC to break open a door or portal affected by this spell. (A *knock* spell does not remove an *arcane lock*; it only suppresses the effect for 10 minutes.)`,
          component_details:'Material Component: Gold dust worth 25 gp.'
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
          text:             `This spell allows you to inscribe your personal rune or mark, which can consist of no more than six characters. The writing can be visible or [invisible](https://www.dandwiki.com/wiki/SRD:Invisible). An *arcane mark* spell enables you to etch the rune upon any substance without harm to the material upon which it is placed. If an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) mark is made, a [*detect magic*](https://www.dandwiki.com/wiki/SRD:Detect_Magic) spell causes it to glow and be visible, though not necessarily understandable.
                             [*See invisibility*](https://www.dandwiki.com/wiki/SRD:See_Invisibility), [*true seeing*](https://www.dandwiki.com/wiki/SRD:True_Seeing), a *gem of seeing*, or a *robe of eyes* likewise allows the user to see an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) *arcane mark*. A [*read magic*](https://www.dandwiki.com/wiki/SRD:Read_Magic) spell reveals the words, if any. The mark cannot be dispelled, but it can be removed by the caster or by an [*erase*](https://www.dandwiki.com/wiki/SRD:Erase) spell.
                             If an *arcane mark* is placed on a living being, normal wear gradually causes the effect to fade in about a month.
                             *Arcane mark* must be cast on an object prior to casting [*instant summons*](https://www.dandwiki.com/wiki/SRD:Instant_Summons) on the same object (see that spell description for details).`,
          component_details:null
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
          text:             `This spell makes your eyes glow blue and allows you to see magical auras within 120 feet of you. The effect is similar to that of a [*detect magic*](https://www.dandwiki.com/wiki/SRD:Detect_Magic) spell, but *arcane sight* does not require concentration and discerns aura location and power more quickly.
                             You know the location and power of all magical auras within your sight. An aura’s power depends on a spell’s functioning level or an item’s caster level, as noted in the description of the *detect magic* spell. If the items or creatures bearing the auras are in line of sight, you can make [Spellcraft skill](https://www.dandwiki.com/wiki/SRD:Spellcraft_Skill) checks to determine the school of magic involved in each. (Make one check per aura; DC 15 + [spell level](https://www.dandwiki.com/wiki/SRD:Spell_Level), or 15 + one-half caster level for a nonspell effect.)
                             If you concentrate on a specific creature within 120 feet of you as a [standard action](https://www.dandwiki.com/wiki/SRD:Standard_Actions), you can determine whether it has any spellcasting or [spell-like abilities](https://www.dandwiki.com/wiki/SRD:Spell-Like_Ability), whether these are arcane or divine ([spell-like abilities](https://www.dandwiki.com/wiki/SRD:Spell-Like_Ability) register as arcane), and the strength of the most powerful spell or [spell-like ability](https://www.dandwiki.com/wiki/SRD:Spell-Like_Ability) the creature currently has available for use.
                             *Arcane sight* can be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:null
        },
        'armor of darkness': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Armor_of_Darkness',
          school:           'Abjuration [Darkness]',
          level:            'Darkness 4',
          components:       'V, S, DF',
          casting_time:     '1 action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The spell envelops the warded creature in a shroud of shadows. The shroud can, if the caster desires, conceal the wearer’s features. In any case, it grants the recipient a [[{3+[[floor(?{Casting Level}/4)]],8}kl1]] deflection bonus to Armor Class. The subject can see through the armor as if it did not exist and is also afforded darkvision with a range of 60 feet. Finally, the subject gains a +2 \`\`bonus\`\` on saving throws against any holy, [good](https://www.dandwiki.com/wiki/SRD:Good_Effect), or [light](https://www.dandwiki.com/wiki/SRD:Light_Effect) spells or effects. [Undead creatures](https://www.dandwiki.com/wiki/SRD:Undead_Type) that are subjects of *armor of darkness* also gain +4 turn resistance.`,
          component_details:null
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
                             You project your astral self onto the [Astral Plane](https://www.dandwiki.com/wiki/SRD:Astral_Plane), leaving your physical body behind on the [Material Plane](https://www.dandwiki.com/wiki/SRD:Material_Plane) in a state of suspended animation. The spell projects an astral copy of you and all you wear or carry onto the [Astral Plane](https://www.dandwiki.com/wiki/SRD:Astral_Plane). Since the [Astral Plane](https://www.dandwiki.com/wiki/SRD:Astral_Plane) touches upon other planes, you can travel astrally to any of these other planes as you will. To enter one, you leave the [Astral Plane](https://www.dandwiki.com/wiki/SRD:Astral_Plane), forming a new physical body (and equipment) on the plane of existence you have chosen to enter.
                             While you are on the [Astral Plane](https://www.dandwiki.com/wiki/SRD:Astral_Plane), your astral body is connected at all times to your physical body by a silvery cord. If the cord is broken, you are killed, astrally and physically. Luckily, very few things can destroy a silver cord. When a second body is formed on a different plane, the [incorporeal](https://www.dandwiki.com/wiki/SRD:Incorporeal) silvery cord remains invisibly attached to the new body. If the second body or the astral form is slain, the cord simply returns to your body where it rests on the [Material Plane](https://www.dandwiki.com/wiki/SRD:Material_Plane), thereby reviving it from its state of suspended animation. Although astral projections are able to function on the [Astral Plane](https://www.dandwiki.com/wiki/SRD:Astral_Plane), their actions affect only creatures existing on the Astral Plane; a physical body must be materialized on other planes.
                             You and your companions may travel through the [Astral Plane](https://www.dandwiki.com/wiki/SRD:Astral_Plane) indefinitely. Your bodies simply wait behind in a state of suspended animation until you choose to return your spirits to them. The spell lasts until you desire to end it, or until it is terminated by some outside means, such as *dispel magic* cast upon either the physical body or the astral form, the breaking of the silver cord, or the destruction of your body back on the [Material Plane](https://www.dandwiki.com/wiki/SRD:Material_Plane) (which kills you).`,
          component_details:'Material Component: A jacinth worth at least 1,000 gp, plus a silver bar worth 5 gp for each person to be affected.'
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
                             *Restore [Class](https://www.dandwiki.com/wiki/SRD:Class):* A [paladin](https://www.dandwiki.com/wiki/SRD:Paladin) who has lost her [class](https://www.dandwiki.com/wiki/SRD:Class) features due to committing an evil act may have her [paladinhood](https://www.dandwiki.com/wiki/SRD:Paladin) restored to her by this spell.
                             *Restore [Cleric](https://www.dandwiki.com/wiki/SRD:Cleric) or [Druid](https://www.dandwiki.com/wiki/SRD:Druid) Spell Powers:* A [cleric](https://www.dandwiki.com/wiki/SRD:Cleric) or [druid](https://www.dandwiki.com/wiki/SRD:Druid) who has lost the ability to cast spells by incurring the anger of his or her deity may regain that ability by seeking *atonement* from another [cleric](https://www.dandwiki.com/wiki/SRD:Cleric) of the same deity or another [druid](https://www.dandwiki.com/wiki/SRD:Druid). If the transgression was intentional, the casting [cleric](https://www.dandwiki.com/wiki/SRD:Cleric) loses 500 XP for his intercession. If the transgression was unintentional, he does not lose XP.
                             *Redemption or Temptation:* You may cast this spell upon a creature of an opposing alignment in order to offer it a chance to change its alignment to match yours. The prospective subject must be present for the entire casting process. Upon completion of the spell, the subject freely chooses whether it retains its original alignment or acquiesces to your offer and changes to your alignment. No duress, compulsion, or magical influence can force the subject to take advantage of the opportunity offered if it is unwilling to abandon its old alignment. This use of the spell does not work on [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type) or any creature incapable of changing its alignment naturally.
                             Though the spell description refers to evil acts, *atonement* can also be used on any creature that has performed acts against its alignment, whether those acts are evil, good, chaotic, or lawful.
                             *Note:* Normally, changing alignment is up to the player. This use of *atonement* simply offers a believable way for a character to change his or her alignment drastically, suddenly, and definitively.`,
          component_details:`Material Component: Burning incense.
                             Focus: In addition to your holy symbol or normal divine focus, you need a set of prayer beads (or other prayer device, such as a prayer wheel or prayer book) worth at least 500 gp.
                             XP Cost: When cast for the benefit of a creature whose guilt was the result of deliberate acts, the cost to you is 500 XP per casting (see above).`
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
                             If the spell fails, you get the “nothing” result. A [cleric](https://www.dandwiki.com/wiki/SRD:Cleric) who gets the “nothing” result has no way to tell whether it was the consequence of a failed or successful *augury*.
                             The *augury* can see into the future only about half an hour, so anything that might happen after that does not affect the result. Thus, the result might not take into account the long-term consequences of a contemplated action. All *auguries* cast by the same person about the same topic use the same dice result as the first casting.`,
          component_details:`Material Component: Incense worth at least 25 gp.
                             Focus: A set of marked sticks, bones, or similar tokens of at least 25 gp value.`
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
          text:             `You awaken a tree or [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) to humanlike sentience. To succeed, you must make a Will save (DC 10 + the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type)’s current HD, or the HD the tree will have once awakened).
                             The *awakened* [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) or tree is friendly toward you. You have no special empathy or connection with a creature you awaken, although it serves you in specific tasks or endeavors if you communicate your desires to it.
                             An *awakened* tree has characteristics as if it were an [animated object](https://www.dandwiki.com/wiki/SRD:Animated_Object), except that it gains the [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) type and gets [[3d6]] Intelligence, [[3d6]] Wisdom, and [[3d6]] Charisma scores. An *awakened* [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) gains the ability to move its limbs, roots, vines, creepers, and so forth, and it has senses similar to a human’s.
                             An *awakened* [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) gets [[3d6]] Intelligence, +[[1d3]] Charisma, and +[[2]] HD. Its type becomes [magical beast](https://www.dandwiki.com/wiki/SRD:Magical_Beast_Type) ([augmented](https://www.dandwiki.com/wiki/SRD:Augmented_Subtype) [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type)). An awakened [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) can’t serve as an [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) companion, familiar, or special mount.
                             An *awakened* tree or [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) can speak one language that you know, plus one additional language that you know per point of Intelligence bonus (if any).`,
          component_details:`XP Cost: 250 XP.`
        },
        // Spells that start with B
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
          text:             `You change the subject into a Small or smaller [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) of no more than 1 HD (such as a [dog](https://www.dandwiki.com/wiki/SRD:Dog), [lizard](https://www.dandwiki.com/wiki/SRD:Lizard), [monkey](https://www.dandwiki.com/wiki/SRD:Monkey), or [toad](https://www.dandwiki.com/wiki/SRD:Toad)). The subject takes on all the statistics and special abilities of an average member of the new form in place of its own except as follows:
                             • The target retains its own alignment (and personality, within the limits of the new form’s ability scores).
                             • If the target has the [shapechanger subtype](https://www.dandwiki.com/wiki/SRD:Shapechanger_Subtype), it retains that subtype.
                             • The target retains its own hit points.
                             • The target is treated has having its normal Hit Dice for purpose of adjudicating effects based on HD, such as the sleep spell, though it uses the new form’s base attack bonus, base save bonuses, and all other statistics derived from Hit Dice.
                             • The target also retains the ability to understand (but not to speak) the languages it understood in its original form. It can write in the languages it understands, but only the form is capable of writing in some manner (such as drawing in the dirt with a paw).
                             With those exceptions, the target’s normal game statistics are replaced by those of the new form. The target loses all the special abilities it has in its normal form, including its [class](https://www.dandwiki.com/wiki/SRD:Class) features.
                             All items worn or carried by the subject fall to the ground at its feet, even if they could be worn or carried by the new form.
                             If the new form would prove fatal to the creature (for example, if you polymorphed a landbound target into a fish, or an airborne target into a toad), the subject gets a +4 \`\`bonus\`\` on the save.
                             If the subject remains in the new form for 24 consecutive hours, it must attempt a Will save.
                             If this save fails, it loses its ability to understand language, as well as all other memories of its previous form, and its Hit Dice and hit points change to match an average creature of its new form. These abilities and statistics return to normal if the effect is later ended.
                             [Incorporeal](https://www.dandwiki.com/wiki/SRD:Incorporeal_Subtype) or [gaseous](https://www.dandwiki.com/wiki/SRD:Gaseous_Form) creatures are immune to *baleful polymorph*, and a creature with the [shapechanger](https://www.dandwiki.com/wiki/SRD:Shapechanger_Subtype) subtype (such as a [lycanthrope](https://www.dandwiki.com/wiki/SRD:Lycanthrope) or a [doppelganger](https://www.dandwiki.com/wiki/SRD:Doppelganger)) can revert to its natural form as a [standard action](https://www.dandwiki.com/wiki/SRD:Standard_Actions) (which ends the spell’s effect).`,
          component_details:null
        },
        //TODO? baleful transposition -- might not be SRD!
        'bane': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bane',
          school:           'Enchantment (Compulsion) [Fear, Mind-Affecting]',
          level:            'Clr 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '50 ft.',
          target_type:      'Area',
          target:           'All enemies within 50 ft.',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `*Bane* fills your enemies with fear and doubt. Each affected creature takes a -1 \`\`penalty\`\` on attack rolls and a -1 \`\`penalty\`\` on saving throws against fear effects.
                             *Bane* counters and dispels [*bless*](https://www.dandwiki.com/wiki/SRD:Bless).`,
          component_details:null
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
          text:             `A *banishment* spell is a more powerful version of the [*dismissal*](https://www.dandwiki.com/wiki/SRD:Dismissal) spell. It enables you to force [extraplanar creatures](https://www.dandwiki.com/wiki/SRD:Outsider_Type) out of your home plane. As many as 2 Hit Dice of creatures per caster level can be banished.
                             You can improve the spell’s chance of success by presenting at least one object or substance that the target hates, fears, or otherwise opposes. For each such object or substance, you gain a +1 \`\`bonus\`\` on your caster level check to overcome the target’s [spell resistance](https://www.dandwiki.com/wiki/SRD:Spell_Resistance) (if any), the saving throw DC increases by 2.
                             Certain rare items might work twice as well as a normal item for the purpose of the bonuses (each providing a +2 \`\`bonus\`\` on the caster level check against [spell resistance](https://www.dandwiki.com/wiki/SRD:Spell_Resistance) and increasing the save DC by 4).`,
          component_details:'Arcane Focus: Any item that is distasteful to the subject (optional, see above).'
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
          text:             `*Barkskin* toughens a creature’s skin. The effect grants a +[[2+{floor(?{Casting Level}/3),5}kl1]] enhancement bonus to the creature’s existing natural [armor bonus](https://www.dandwiki.com/wiki/SRD:Armor_Bonus).
                             The enhancement bonus provided by *barkskin* stacks with the target’s natural [armor bonus](https://www.dandwiki.com/wiki/SRD:Armor_Bonus), but not with other enhancement bonuses to [natural armor](https://www.dandwiki.com/wiki/SRD:Natural_Armor). A creature without [natural armor](https://www.dandwiki.com/wiki/SRD:Natural_Armor) has an effective [natural armor bonus](https://www.dandwiki.com/wiki/SRD:Natural_Armor_Bonus) of +0.`,
          component_details:null
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
          text:             `The affected creature gains greater vitality and stamina. The spell grants the subject a +4 \`\`enhancement bonus\`\` to Constitution, which adds the usual benefits to hit points, Fortitude saves, [Constitution checks](https://www.dandwiki.com/wiki/SRD:Constitution), and so forth.
                             hit points gained by a temporary increase in Constitution score are not temporary hit points. They go away when the subject’s Constitution drops back to normal. They are not lost first as temporary hit points are.`,
          component_details:null
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
                             • -6 decrease to an [ability score](https://www.dandwiki.com/wiki/SRD:Ability_Scores) (minimum 1).
                             • -4 \`\`penalty\`\` on [attack rolls](https://www.dandwiki.com/wiki/SRD:Attack_Roll), saves, [ability checks](https://www.dandwiki.com/wiki/SRD:Ability_Check), and [skill checks](https://www.dandwiki.com/wiki/SRD:Skill_Check).
                             • Each turn, the target has a 50% chance to act normally; otherwise, it takes no action.
                             You may also invent your own curse, but it should be no more powerful than those described above.
                             The *curse* bestowed by this spell cannot be dispelled, but it can be removed with a [*break enchantment*](https://www.dandwiki.com/wiki/SRD:Break_Enchantment), [*limited wish*](https://www.dandwiki.com/wiki/SRD:Limited_Wish), [*miracle*](https://www.dandwiki.com/wiki/SRD:Miracle), [*remove curse*](https://www.dandwiki.com/wiki/SRD:Remove_Curse), or [*wish*](https://www.dandwiki.com/wiki/SRD:Wish) spell.
                             *Bestow curse* counters [*remove curse*](https://www.dandwiki.com/wiki/SRD:Remove_Curse).`,
          component_details:null
        },
        'binding': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Binding',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
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
                             You may have as many as six assistants help you with the spell. For each assistant who casts [*suggestion*](https://www.dandwiki.com/wiki/SRD:Suggestion), your caster level for this casting of *binding* increases by 1. For each assistant who casts [*dominate animal*](https://www.dandwiki.com/wiki/SRD:Dominate_Animal), [*dominate person*](https://www.dandwiki.com/wiki/SRD:Dominate_Person), or *[dominate monster*](https://www.dandwiki.com/wiki/SRD:Dominate_Monster), your caster level for this casting of *binding* increases by a number equal to one-third of that assistant’s level, provided that the spell’s target is appropriate for a *binding* spell. Since the assistants’ spells are cast simply to improve your caster level for the purpose of the *binding* spell, saving throws and [spell resistance](https://www.dandwiki.com/wiki/SRD:Spell_Resistance) against the assistants’ spells are irrelevant. Your caster level determines whether the target gets an initial Willsaving throw and how long the *binding* lasts. All *binding* spells are dismissible.
                             Regardless of the version of *binding* you cast, you can specify triggering conditions that end the spell and release the creature whenever they occur. These triggers can be as simple or elaborate as you desire, but the condition must be reasonable and have a likelihood of coming to pass. The conditions can be based on a creature’s name, identity, or alignment but otherwise must be based on observable actions or qualities. Intangibles such as level, [class](https://www.dandwiki.com/wiki/SRD:Class), Hit Dice, or hit points don’t qualify. Once the spell is cast, its triggering conditions cannot be changed. Setting a release condition increases the save DC (assuming a saving throw is allowed) by 2.
                             If you are casting any of the first three versions of *binding* (those with limited durations), you may cast additional *binding* spells to prolong the effect, since the durations overlap. If you do so, the target gets a saving throw at the end of the first spell’s duration, even if your caster level was high enough to disallow an initial saving throw. If the creature succeeds on this save, all the *binding* spells it has received are broken.
                             The *binding* spell has six versions. Choose one of the following versions when you cast the spell.
                             *Chaining:* The subject is confined by restraints that generate an [*antipathy*](https://www.dandwiki.com/wiki/SRD:Antipathy) spell affecting all creatures who approach the subject, except you. The duration is one year per caster level. The subject of this form of *binding* is confined to the spot it occupied when it received the spell.
                             *Slumber:* This version causes the subject to become comatose for as long as one year per caster level. The subject does not need to eat or drink while *slumbering*, nor does it age. This form of *binding* is more difficult to cast than *chaining*, making it slightly easier to resist. Reduce the spell’s save DC by 1.
                             *Bound Slumber:* This combination of *chaining* and *slumber* lasts for as long as one month per caster level. Reduce the save DC by 2.
                             *Hedged Prison:* The subject is transported to or otherwise brought within a confined area from which it cannot wander by any means. The effect is permanent. Reduce the save DC by 3.
                             *Metamorphosis:* The subject assumes gaseous form, except for its head or face. It is held harmless in a jar or other container, which may be transparent if you so choose. The creature remains aware of its surroundings and can speak, but it cannot leave the container, attack, or use any of its powers or abilities. The *binding* is permanent. The subject does not need to breathe, eat, or drink while *metamorphosed*, nor does it age. Reduce the save DC by 4.
                             *Minimus Containment:* The subject is shrunk to a height of 1 inch or even less and held within some gem, jar, or similar object. The *binding* is permanent. The subject does not need to breathe, eat, or drink while *contained*, nor does it age. Reduce the save DC by 4.
                             You can’t dispel a *binding* spell with [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) or a similar effect, though an [*antimagic field*](https://www.dandwiki.com/wiki/SRD:Antimagic_Field) or [*Mage’s disjunction*](https://www.dandwiki.com/wiki/SRD:Mage%27s_Disjunction) affects it normally. A bound extraplanar creature cannot be sent back to its home plane due to [*dismissal*](https://www.dandwiki.com/wiki/SRD:Dismissal), [*banishment*](https://www.dandwiki.com/wiki/SRD:Banishment), *or a similar effect*.`,
          component_details:`Components: The components for a binding spell vary according to the version of the spell, but they always include a continuous chanting utterance read from the scroll or spellbook page containing the spell, somatic gestures, and materials appropriate to the form of binding used. These components can include such items as miniature chains of special metals, soporific herbs of the rarest sort (for slumber bindings), a bell jar of the finest crystal, and the like.
                             In addition to the specially made props suited to the specific type of binding (cost 500 gp), the spell requires opals worth at least 500 gp for each HD of the target and a vellum depiction or carved statuette of the subject to be captured.`
        },
        'black tentacles': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Black_Tentacles',
          school:           'Conjuration (Creation)',
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
                             Every creature within the area of the spell must make a [grapple check](https://www.dandwiki.com/wiki/SRD:Grapple), opposed by the [grapple](https://www.dandwiki.com/wiki/SRD:Grapple) check of the tentacles. Treat the tentacles attacking a particular target as a Large creature with a base attack bonus equal to your caster level and a [Strength](https://www.dandwiki.com/wiki/SRD:Strength) score of 19. Thus, its [grapple](https://www.dandwiki.com/wiki/SRD:Grapple) check modifier is equal to your caster level +8. The tentacles are immune to all types of damage.
                             Once the tentacles [grapple](https://www.dandwiki.com/wiki/SRD:Grapple) an opponent, they may make a [grapple](https://www.dandwiki.com/wiki/SRD:Grapple) check each round on your turn to deal 1d6+4 points of bludgeoning damage. The tentacles continue to crush the opponent until the spell ends or the opponent escapes.
                             Any creature that enters the area of the spell is immediately attacked by the tentacles. Even creatures who aren’t [grappling](https://www.dandwiki.com/wiki/SRD:Grappling) with the tentacles may move through the area at only half normal speed.`,
          component_details:'Material Component: A piece of tentacle from a [giant](https://www.dandwiki.com/wiki/SRD:Giant_Type) octopus or a [giant](https://www.dandwiki.com/wiki/SRD:Giant_Type) squid.'
        },
        'blade barrier': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Blade_Barrier',
          school:           'Evocation [Force]',
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
                             A *blade barrier* provides [cover](https://www.dandwiki.com/wiki/SRD:Cover) (+4 \`\`bonus\`\` to AC, +2 \`\`bonus\`\` on Reflex saves) against attacks made through it.`,
          component_details:null
        },
        'blasphemy': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Blasphemy',
          school:           'Evocation [Evil, Sonic]',
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
                             • [Dazed](https://www.dandwiki.com/wiki/SRD:Dazed)
                             **Up to [[?{Casting Level}-1]] HD**
                             • Weakened, [dazed](https://www.dandwiki.com/wiki/SRD:Dazed)
                             **Up to <= [[?{Casting Level}-5]] HD**
                             • [Paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed), weakened, [dazed](https://www.dandwiki.com/wiki/SRD:Dazed)
                             **Up to <= [[?{Casting Level}-10]] HD**
                             • Killed, [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed), weakened, [dazed](https://www.dandwiki.com/wiki/SRD:Dazed)

                             The effects are cumulative and concurrent.
                             No saving throw is allowed against these effects.
                             *[Dazed](https://www.dandwiki.com/wiki/SRD:Dazed):* The creature can take no actions for 1 round, though it defends itself normally.
                             *Weakened:* The creature’s [Strength](https://www.dandwiki.com/wiki/SRD:Strength) score decreases by [[2d6]] points for [[2d4]] rounds.
                             *[Paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed):* The creature is [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed) and [helpless](https://www.dandwiki.com/wiki/SRD:Helpless) for [[1d10]] minutes.
                             *[Killed](https://www.dandwiki.com/wiki/SRD:Dead)*: Living creatures die. [Undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creatures are destroyed.
                             Furthermore, if you are on your home plane when you cast this spell, nonevil extraplanar creatures within the area are instantly banished back to their home planes. Creatures so banished cannot return for at least 24 hours. This effect takes place regardless of whether the creatures hear the *blasphemy*. The banishment effect allows a Will save (at a -4 \`\`penalty\`\`) to negate.
                             Creatures whose Hit Dice exceed your caster level are unaffected by *blasphemy*.`,
          component_details:null
        },
        'bless': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bless',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Clr 1, Community 1, Pal 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '50 ft.',
          target_type:      'Area',
          target:           'The caster and all allies within a 50-ft. burst, centered on the caster',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes (harmless)',
          text:             `*Bless* fills your allies with courage. Each ally gains a +1 \`\`morale bonus\`\` on [attack rolls](https://www.dandwiki.com/wiki/SRD:Attack_Roll) and on saving throws against fear effects.
                             *Bless* counters and dispels [*bane*](https://www.dandwiki.com/wiki/SRD:Bane).`,
          component_details:null
        },
        'bless water': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bless_Water',
          school:           'Transmutation [Good]',
          level:            'Clr 1, Pal 1',
          components:       'V, S, M',
          casting_time:     '1 minute',
          range:            'Touch',
          target_type:      'Target',
          target:           'Flask of water touched',
          duration:         'Instantaneous',
          saving_throw:     'Will negates (object)',
          spell_resistance: 'Yes (Object)',
          text:             `This transmutation imbues a flask (1 pint) of water with positive energy, turning it into [holy water](https://www.dandwiki.com/wiki/SRD:Holy_Water).`,
          component_details:'Material Component: 5 pounds of powdered silver (worth 25 gp).'
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
          text:             `This transmutation makes a weapon strike true against evil foes. The weapon is treated as having a +1 \`\`enhancement bonus\`\` for the purpose of bypassing the damage reduction of evil creatures or striking evil [incorporeal](https://www.dandwiki.com/wiki/SRD:Incorporeal) creatures (though the spell doesn’t grant an actual enhancement bonus). The weapon also becomes good, which means it can bypass the damage reduction of certain creatures. (This effect overrides and suppresses any other alignment the weapon might have.) Individual arrows or bolts can be transmuted, but affected projectile weapons (such as bows) don’t confer the benefit to the projectiles they shoot.
                             In addition, all [critical hit](https://www.dandwiki.com/wiki/SRD:Critical_Hit) rolls against evil foes are automatically successful, so every threat is a [critical hit](https://www.dandwiki.com/wiki/SRD:Critical_Hit). This last effect does not apply to any weapon that already has a magical effect related to [critical hits](https://www.dandwiki.com/wiki/SRD:Critical_Hit), such as a keen weapon or a vorpal sword.`,
          component_details:null
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
          text:             `This spell withers a single [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) of any size. An affected [plant creature](https://www.dandwiki.com/wiki/SRD:Plant_Type) takes [[[[{?{Casting Level},15}kl1]]d6]] points of damage and may attempt a Fortitude saving throw for half damage. A [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) that isn’t a creature doesn’t receive a save and immediately withers and dies.
                             This spell has no effect on the soil or surrounding [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) life.`,
          component_details:null
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
          text:             `You call upon the powers of unlife to render the subject [blinded](https://www.dandwiki.com/wiki/SRD:Blinded) or [deafened](https://www.dandwiki.com/wiki/SRD:Deafened), as you choose.`,
          component_details:null
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
          text:             `You “blink” back and forth between the [Material Plane](https://www.dandwiki.com/wiki/SRD:Material_Plane) and the [Ethereal Plane](https://www.dandwiki.com/wiki/SRD:Ethereal_Plane). You look as though you’re winking in and out of reality very quickly and at random.
                             *Blinking* has several effects, as follows.
                             Physical attacks against you have a 50% miss chance, and the [Blind-Fight](https://www.dandwiki.com/wiki/SRD:Blind-Fight) [feat](https://www.dandwiki.com/wiki/SRD:Feats) doesn’t help opponents, since you’re ethereal and not merely [invisible](https://www.dandwiki.com/wiki/SRD:Invisible). If the attack is capable of striking ethereal creatures, the miss chance is only 20% (for [concealment](https://www.dandwiki.com/wiki/SRD:Concealment)).
                             If the attacker can see [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) creatures, the miss chance is also only 20%. (For an attacker who can both see and strike ethereal creatures, there is no miss chance.) Likewise, your own attacks have a 20% miss chance, since you sometimes go ethereal just as you are about to strike.
                             Any individually targeted spell has a 50% chance to fail against you while you’re *blinking* unless your attacker can target [invisible](https://www.dandwiki.com/wiki/SRD:Invisible), ethereal creatures. Your own spells have a 20% chance to activate just as you go ethereal, in which case they typically do not affect the [Material Plane](https://www.dandwiki.com/wiki/SRD:Material_Plane).
                             While *blinking*, you take only half damage from area attacks (but full damage from those that extend onto the Ethereal Plane). You strike as an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) creature (with a +2 \`\`bonus\`\` on [attack rolls](https://www.dandwiki.com/wiki/SRD:Attack_Roll)), denying your target any Dexterity bonus to AC.
                             You take only half damage from falling, since you fall only while you are material.
                             While *blinking*, you can step through (but not see through) solid objects. For each 5 feet of solid material you walk through, there is a 50% chance that you become material. If this occurs, you are shunted off to the nearest open space and take 1d6 points of damage per 5 feet so traveled. You can move at only three-quarters speed (because movement on the Ethereal Plane is at half speed, and you spend about half your time there and half your time material.)
                             Since you spend about half your time on the Ethereal Plane, you can see and even attack ethereal creatures. You interact with ethereal creatures roughly the same way you interact with material ones.
                             An ethereal creature is [invisible](https://www.dandwiki.com/wiki/SRD:Invisible), [incorporeal](https://www.dandwiki.com/wiki/SRD:Incorporeal), and capable of moving in any direction, even up or down. As an [incorporeal](https://www.dandwiki.com/wiki/SRD:Incorporeal) creature, you can move through solid objects, including living creatures.
                             An ethereal creature can see and hear the [Material Plane](https://www.dandwiki.com/wiki/SRD:Material_Plane), but everything looks gray and insubstantial. Sight and hearing on the [Material Plane](https://www.dandwiki.com/wiki/SRD:Material_Plane) are limited to 60 feet.
                             Force effects and abjurations affect you normally. Their effects extend onto the Ethereal Plane from the [Material Plane](https://www.dandwiki.com/wiki/SRD:Material_Plane), but not vice versa. An ethereal creature can’t attack material creatures, and spells you cast while ethereal affect only other ethereal things. Certain material creatures or objects have attacks or effects that work on the Ethereal Plane. Treat other ethereal creatures and objects as material.`,
          component_details:null
        },
        'blur': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Blur',
          school:           'Illusion (Glamer)',
          level:            'Brd 2, Sor/Wiz 2',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The subject’s outline appears blurred, shifting and wavering. This distortion grants the subject [concealment](https://www.dandwiki.com/wiki/SRD:Concealment) (20% miss chance).
                             A [*see invisibility*](https://www.dandwiki.com/wiki/SRD:See_Invisibility) spell does not counteract the *blur* effect, but a [*true seeing*](https://www.dandwiki.com/wiki/SRD:True_Seeing) spell does.
                             Opponents that cannot see the subject ignore the spell’s effect (though fighting an unseen opponent carries penalties of its own).`,
          component_details:null
        },
        'bolt of glory': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bolt_of_Glory',
          school:           'Evocation [Good]',
          level:            'Glory 6',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'Ray',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `This spell projects a bolt of energy from the [Positive Energy Plane](https://www.dandwiki.com/wiki/SRD:Positive_Energy_Plane) against one creature. The caster must succeed at a ranged [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack) to strike the target. A creature struck suffers varying damage, depending on its nature and home plane of existence:
                             ‹Material Plane↲Elemental Plane↲neutral outsider|[[[[{floor(?{Casting Level}/2),7}kl1]]d6]]›
                             ‹Negative Energy Plane↲evil outsider↲undead creature|[[[[{?{Casting Level},15}kl1]]d6]]›
                             ‹Positive Energy Plane↲good outsider|—›`,
          component_details:null
        },
        'bolts of bedevilment': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Bolts_of_Bedevilment',
          school:           'Enchantment [Mind-Affecting]',
          level:            'Madness 5',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Ray',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell grants the caster the ability to make one ray attack per round. The ray [dazes](https://www.dandwiki.com/wiki/SRD:Dazed) one living creature, clouding its mind so that it takes no action for [[1d3]] rounds. The creature is not [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) (so attackers get no special advantage against it), but it can’t move, cast spells, use mental abilities, and so on.`,
          component_details:null
        },
        'brain spider': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Brain_Spider',
          school:           'Divination [Mind-Affecting]',
          level:            'Clr 8, Mind 7',
          components:       'V, S, M, DF',
          casting_time:     '1 round',
          range:            'long',
          target_type:      'Targets',
          target:           'Up to eight living creatures',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell allows you to eavesdrop as a [standard action](https://www.dandwiki.com/wiki/SRD:Standard_Actions) on the thoughts of up to eight other creatures at once, hearing as desired:

                             • Individual trains of thought in whatever order you desire.
                             • Information from all minds about one particular topic, thing, or being, one nugget of information per caster level.
                             • A study of the thoughts and memories of one creature of the group in detail.

                             Once per round, if you do not perform a detailed study of one creature’s mind, you can attempt (as a [standard action](https://www.dandwiki.com/wiki/SRD:Standard_Actions)) to implant a [*suggestion*](https://www.dandwiki.com/wiki/SRD:Suggestion) in the mind of any one of the affected creatures. The creature can make another Will saving throw to resist the *suggestion*, using the save DC of the *brain spider* spell. (Creatures with special resistance to enchantment spells can use this resistance to keep from being affected by the *suggestion*.) Success on this saving throw does not negate the other effects of the *brain spider* spell for that creature.
                             You can affect all intelligent beings of your choice within range (up to the limit of eight), beginning with known or named beings. Language is not a barrier, and you need not personally know the beings. The spell cannot reach those who make a successful Will save.`,
          component_details:'Material Component: A spider of any size or kind. It can be [dead](https://www.dandwiki.com/wiki/SRD:Dead), but must still have all eight legs.'
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
          text:             `This spell frees victims from enchantments, transmutations, and curses. *Break enchantment* can reverse even an instantaneous effect. For each such effect, you make a caster level ‹check|[[1d20+[[{?{Casting Level},15}kl1]]]]› (1d20 + caster level, maximum +15) against a DC of 11 + caster level of the effect: «DC|[[11+?{Casting Level of the Effect}]]». Success means that the creature is free of the spell, curse, or effect. For a cursed magic item, the DC is 25.
                             If the spell is one that cannot be dispelled by [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic), *break enchantment* works only if that spell is 5th level or lower.
                             If the effect comes from some permanent magic item *break enchantment* does not remove the curse from the item, but it does frees the victim from the item’s effects.`,
          component_details:null
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
          text:             `The subject becomes stronger. The spell grants a +4 \`\`enhancement bonus\`\` to [Strength](https://www.dandwiki.com/wiki/SRD:Strength), adding the usual benefits to [melee attack](https://www.dandwiki.com/wiki/SRD:Melee_Attack) rolls, melee [damage rolls](https://www.dandwiki.com/wiki/SRD:Attack_Damage), and other uses of the [Strength](https://www.dandwiki.com/wiki/SRD:Strength) modifier.`,
          component_details:'Arcane Material Component: A few hairs, or a pinch of dung, from a bull.'
        },
        'burning hands': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Burning_Hands',
          school:           'Evocation [Fire]',
          level:            'Fire 1, Sor/Wiz 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            '15 ft.',
          target_type:      'Area',
          target:           'Cone-shaped burst',
          duration:         'Instantaneous',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `A cone of searing flame shoots from your fingertips. Any creature in the area of the flames takes [[[[{?{Casting Level},5}kl1]]d4]] points of fire damage. Flammable materials burn if the flames touch them. A character can extinguish burning items as a [full-round action](https://www.dandwiki.com/wiki/SRD:Full-Round_Actions).`,
          component_details:null
        },
        // C Spell
        'call lightning': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Call_Lightning',
          school:           'Evocation [Electricity]',
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
                             You need not call a bolt of lightning immediately; other actions, even spellcasting, can be performed. However, each round after the first you may use a [standard action](https://www.dandwiki.com/wiki/SRD:Standard_Actions) (concentrating on the spell) to call a bolt. You may call a total of [[{?{Casting Level},10}kl1]] bolts.
                             If you are outdoors and in a stormy area—a rain shower, clouds and wind, hot and cloudy conditions, or even a tornado (including a whirlwind formed by a [djinni](https://www.dandwiki.com/wiki/SRD:Djinni) or an [air elemental](https://www.dandwiki.com/wiki/SRD:Air_Elemental) of at least Large size)—each bolt deals ‹3d10› points of electricity damage instead of 3d6.
                             This spell functions indoors or underground but not underwater.`,
          component_details:null
        },
        'call lightning storm': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Call_Lightning_Storm',
          school:           'Evocation [Electricity]',
          level:            'Drd 5, Weather 5',
          components:       'V, S',
          casting_time:     '1 round',
          range:            'long',
          target_type:      'Effect',
          target:           'One or more 30-ft.-long vertical lines of lightning',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `Immediately upon completion of the spell, and once per round thereafter, you may call down a 5-foot-wide, 30-foot-long, vertical bolt of lightning that deals ‹5d6› points of electricity damage. The bolt of lightning flashes down in a vertical stroke at whatever target point you choose within the spell’s range (measured from your position at the time). Any creature in the target square or in the path of the bolt is affected.
                             You need not call a bolt of lightning immediately; other actions, even spellcasting, can be performed. However, each round after the first you may use a [standard action](https://www.dandwiki.com/wiki/SRD:Standard_Actions) (concentrating on the spell) to call a bolt. You may call a total of [[{?{Casting Level},15}kl1]] bolts.
                             If you are outdoors and in a stormy area—a rain shower, clouds and wind, hot and cloudy conditions, or even a tornado (including a whirlwind formed by a [djinni](https://www.dandwiki.com/wiki/SRD:Djinni) or an [air elemental](https://www.dandwiki.com/wiki/SRD:Air_Elemental) of at least Large size)—each bolt deals ‹5d10› points of electricity damage instead of 3d6.
                             This spell functions indoors or underground but not underwater.`,
          component_details:null
        },
        'calm animals': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Calm_Animals',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Animal 1, Drd 1, Rgr 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           'Animals within 30 ft. of each other',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates, see text',
          spell_resistance: 'Yes',
          text:             `This spell soothes and quiets [animals](https://www.dandwiki.com/wiki/SRD:Animal_Type), rendering them docile and harmless. Only ordinary [animals](https://www.dandwiki.com/wiki/SRD:Animal_Type) (those with Intelligence scores of 1 or 2) can be affected by this spell. All the subjects must be of the same kind, and no two may be more than 30 feet apart. The maximum number of Hit Dice of [animals](https://www.dandwiki.com/wiki/SRD:Animal_Type) you can affect is equal to 2d4 + caster level: [[2d6+?{Casting Level}]]. A [dire animal](https://www.dandwiki.com/wiki/SRD:Dire_Animal) or an [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) trained to attack or guard is allowed a saving throw; other [animals](https://www.dandwiki.com/wiki/SRD:Animal_Type) are not.
                             The affected creatures remain where they are and do not attack or flee. They are not [helpless](https://www.dandwiki.com/wiki/SRD:Helpless) and defend themselves normally if attacked. Any threat breaks the spell on the threatened creatures.`,
          component_details:null
        },
        'calm emotions': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Calm_Emotions',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 2, Charm 2, Clr 2, Law 2',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Area',
          target:           'Creatures in a 20-ft.-radius spread',
          duration:         'Concentration, up to [[?{Casting Level}]] round(s) (D)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell calms agitated creatures. You have no control over the affected creatures, but *calm emotions* can stop raging creatures from fighting or joyous ones from reveling. Creatures so affected cannot take violent actions (although they can defend themselves) or do anything destructive. Any aggressive action against or damage dealt to a calmed creature immediately breaks the spell on all calmed creatures.
                             This spell automatically suppresses (but does not dispel) any morale bonuses granted by spells such as [*bless*](https://www.dandwiki.com/wiki/SRD:Bless), [*good hope*](https://www.dandwiki.com/wiki/SRD:Good_Hope), and [*rage*](https://www.dandwiki.com/wiki/SRD:Rage), as well as negating a [bard’s ability](https://www.dandwiki.com/wiki/SRD:Bard) to inspire courage or a [barbarian’s rage](https://www.dandwiki.com/wiki/SRD:Barbarian) ability. It also suppresses any fear effects and removes the [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) condition from all targets. While the spell lasts, a suppressed spell or effect has no effect. When the *calm emotions* spell ends, the original spell or effect takes hold of the creature again, provided that its duration has not expired in the meantime.`,
          component_details:null
        },
        'cat\'s grace': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Cat%27s_Grace',
          school:           'Transmutation',
          level:            'Asn 2, Brd 2, Drd 2, Rgr 2, Sor/Wiz 2',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `The transmuted creature becomes more graceful, agile, and coordinated. The spell grants a +4 \`\`enhancement bonus\`\` to Dexterity, adding the usual benefits to AC, Reflex saves, and other uses of the Dexterity modifier.`,
          component_details:'Material Component: A pinch of cat fur'
        },
        'cause fear': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Cause_Fear',
          school:           'Necromancy [Fear, Mind-Affecting]',
          level:            'Blg 1, Brd 1, Clr 1, Death 1, Sor/Wiz 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One living creature with 5 or fewer HD',
          duration:         '[[1d4]] rounds or 1 round; see text',
          saving_throw:     'Will partial',
          spell_resistance: 'Yes',
          text:             `The affected creature becomes [frightened](https://www.dandwiki.com/wiki/SRD:Frightened). If the subject succeeds on a Will save, it is [shaken](https://www.dandwiki.com/wiki/SRD:Shaken) for 1 round. Creatures with 6 or more Hit Dice are immune to this effect.
                             *Cause fear* counters and dispels [*remove fear*](https://www.dandwiki.com/wiki/SRD:Remove_Fear).`,
          component_details:null
        },
        'chain lightning': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Chain_Lightning',
          school:           'Evocation [Electricity]',
          level:            'Air 6, Sor/Wiz 6',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Targets',
          target:           'One primary target, plus [[?{Casting Level}]] secondary target(s) (each of which must be within 30 ft. of the primary target)',
          duration:         'Instantaneous',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `This spell creates an electrical discharge that begins as a single stroke commencing from your fingertips. Unlike [*lightning bolt*](https://www.dandwiki.com/wiki/SRD:Lightning_Bolt), *chain lightning* strikes one object or creature initially, then arcs to other targets.
                             The bolt deals 1d6 points of electricity damage per caster level (maximum 20d6) to the primary target: [[[[{?{Casting Level},20}kl1]]d6]]. After it strikes, lightning can arc to a number of secondary targets equal to your caster level (maximum 20): [[{?{Casting Level},20}kl1]]. The secondary bolts each strike one target and deal half as much damage as the primary one did (rounded down).
                             Each target can attempt a Reflex saving throw for half damage. You choose secondary targets as you like, but they must all be within 30 feet of the primary target, and no target can be struck more than once. You can choose to affect fewer secondary targets than the maximum.`,
          component_details:'Focus: A bit of fur; a piece of amber, glass, or a crystal rod; plus one silver pin for each of your caster levels.'
        },
        'changestaff': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Changestaff',
          school:           'Transmutation',
          level:            'Drd 7',
          components:       'V, S, F',
          casting_time:     '1 round',
          range:            'Touch',
          target_type:      'Target',
          target:           'Your touched staff',
          duration:         '[[?{Casting Level}]] hour(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You change a specially prepared quarterstaff into a Huge [treantlike](https://www.dandwiki.com/wiki/SRD:Treant) creature, about 24 feet tall. When you [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) the end of the staff in the ground and speak a special command to conclude the casting of the spell, your staff turns into a creature that looks and fights just like a treant. The staff-treant defends you and obeys any spoken commands. However, it is by no means a true treant; it cannot converse with actual treants or control trees. If the staff-treant is reduced to 0 or fewer hit points, it crumbles to powder and the staff is destroyed. Otherwise, the staff returns to its normal form when the spell duration expires (or when the spell is dismissed), and it can be used as the focus for another casting of the spell. The staff-treant is always at full strength when created, despite any wounds it may have incurred the last time it appeared.`,
          component_details:`Focus: The quarterstaff, which must be specially prepared. The staff must be a sound limb cut from an ash, oak, or yew, then cured, shaped, carved, and polished (a process requiring twenty-eight days).
                             You cannot adventure or engage in other strenuous activity during the shaping and carving of the staff.`
        },
        'chaos hammer': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Chaos_Hammer',
          school:           'Evocation [Chaotic]',
          level:            'Chaos 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Area',
          target:           '20-ft.-radius burst',
          duration:         'Instantaneous (``1d6`` rounds); see text',
          saving_throw:     'Will partial; see text',
          spell_resistance: 'Yes',
          text:             `You unleash chaotic power to smite your enemies. The power takes the form of a multicolored explosion of leaping, ricocheting energy. Only lawful and neutral (not chaotic) creatures are harmed by the spell.
                             The spell deals [[[[{floor(?{Casting Level}/2),5}kl1]]d8]] points of damage to lawful creatures (or [[[[{?{Casting Level},10}kl1]]d6]] points of damage to lawful [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type)) and slows them for [[1d6]] rounds (see the [*slow*](https://www.dandwiki.com/wiki/SRD:Slow) spell). A successful Will save reduces the damage by half and negates the slow effect.
                             The spell deals only half damage against creatures who are neither lawful nor chaotic, and they are not slowed. Such a creature can reduce the damage by half again (down to one-quarter) with a successful Will save.`,
          component_details:null
        },
        'charm animal': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Charm_Animal',
          school:           'Enchantment (Charm) [Mind-Affecting]',
          level:            'Drd 1, Rgr 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One animal',
          duration:         '[[?{Casting Level}]] hour(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This charm makes an [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) regard you as its trusted friend and ally (treat the target’s attitude as friendly). If the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) is currently being threatened or attacked by you or your allies, however, it receives a +5 \`\`bonus\`\` on its saving throw.
                             The spell does not enable you to control the *charmed* [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) as if it were an automaton, but it perceives your words and actions in the most favorable way. You can try to give the subject orders, but you must win an opposed Charisma check to convince it to do anything it wouldn’t ordinarily do. (Retries are not allowed.) An affected [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) never obeys suicidal or obviously harmful orders, but it might be convinced that something very dangerous is worth doing. Any act by you or your apparent allies that threatens the *charmed* [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) breaks the spell. You must speak the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type)'s language to communicate your commands, or else be good at pantomiming.`,
          component_details:null
        },
        'charm monster': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Charm_Monster',
          school:           'Enchantment (Charm) [Mind-Affecting]',
          level:            'Brd 3, Charm 5, Sor/Wiz 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One living creature',
          duration:         '[[?{Casting Level}]] day(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This charm makes a creature regard you as its trusted friend and ally (treat the target’s attitude as friendly). If the creature is currently being threatened or attacked by you or your allies, however, it receives a +5 \`\`bonus\`\` on its saving throw.
                             The spell does not enable you to control the *charmed* creature as if it were an automaton, but it perceives your words and actions in the most favorable way. You can try to give the subject orders, but you must win an opposed Charisma check to convince it to do anything it wouldn’t ordinarily do. (Retries are not allowed.) An affected creature never obeys suicidal or obviously harmful orders, but it might be convinced that something very dangerous is worth doing. Any act by you or your apparent allies that threatens the *charmed* creature breaks the spell. You must speak the creature language to communicate your commands, or else be good at pantomiming.`,
          component_details:null
        },
        'charm person': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Charm_Person',
          school:           'Enchantment (Charm) [Mind-Affecting]',
          level:            'Brd 1, Charm 1, Sor/Wiz 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One humanoid creature',
          duration:         '[[?{Casting Level}]] hour(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This charm makes a [humanoid creature](https://www.dandwiki.com/wiki/SRD:Humanoid_Type) regard you as its trusted friend and ally (treat the target’s attitude as friendly). If the creature is currently being threatened or attacked by you or your allies, however, it receives a +5 \`\`bonus\`\` on its saving throw.
                             The spell does not enable you to control the *charmed* person as if it were an automaton, but it perceives your words and actions in the most favorable way. You can try to give the subject orders, but you must win an opposed Charisma check to convince it to do anything it wouldn’t ordinarily do. (Retries are not allowed.) An affected creature never obeys suicidal or obviously harmful orders, but it might be convinced that something very dangerous is worth doing. Any act by you or your apparent allies that threatens the *charmed* person breaks the spell. You must speak the person’s language to communicate your commands, or else be good at pantomiming.`,
          component_details:null
        },
        'chill metal': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Chill_Metal',
          school:           'Transmutation [Cold]',
          level:            'Drd 2',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'Metal equipment of [[floor(?{Casting Level}/2)]] creature(s), no two of which can be more than 30 ft. apart; or [[25*?{Casting Level}]] lb. of metal, none of which can be more than 30 ft. away from any of the rest',
          duration:         '7 rounds',
          saving_throw:     'Will negates (object)',
          spell_resistance: 'Yes (object)',
          text:             `*Chill metal* makes metal extremely cold. Unattended, nonmagical metal gets no saving throw. Magical metal is allowed a saving throw against the spell. An item in a creature’s possession uses the creature’s saving throw bonus unless its own is higher.
                             A creature takes cold damage if its equipment is chilled. It takes full damage if its armor is affected or if it is holding, touching, wearing, or carrying metal weighing one-fifth of its weight. The creature takes minimum damage (1 point or 2 points; see the table) if it’s not wearing metal armor and the metal that it’s carrying weighs less than one-fifth of its weight.
                             On the first round of the spell, the metal becomes chilly and uncomfortable to touch but deals no damage. The same effect also occurs on the last round of the spell’s duration. During the second (and also the next-to-last) round, icy coldness causes pain and damage. In the third, fourth, and fifth rounds, the metal is freezing cold, causing more damage, as shown on the table below.

                             • Round 1: ‹Cold|No damage›
                             • Round 2: ‹Icy|[[1d4]] cold damage›
                             • Round 3-5: ‹Freezing|[[2d4]] cold damage›
                             • Round 6: ‹Icy|[[1d4]] cold damage›
                             • Round 7: ‹Cold|No damage›

                             Any heat intense enough to damage the creature negates cold damage from the spell (and vice versa) on a point-for-point basis. Underwater, *chill metal* deals no damage, but ice immediately forms around the affected metal, making it more buoyant.
                             *Chill metal* counters and dispels [*heat metal*](https://www.dandwiki.com/wiki/SRD:Heat_Metal).`,
          component_details:null
        },
        'chill touch': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Chill_Touch',
          school:           'Necromancy',
          level:            'Sor/Wiz 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           'Creature or creatures touched (up to [[?{Casting Level}]])',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude partial or Will negates; see text',
          spell_resistance: 'Yes',
          text:             `A touch from your hand, which glows with blue energy, disrupts the life force of living creatures. Each touch channels negative energy that deals [[1d6]] points of damage. The touched creature also takes 1 point of [Strength damage](https://www.dandwiki.com/wiki/SRD:Ability_Score_Loss#Ability_Damage) unless it makes a successful Fortitude saving throw. You can use this melee [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack) up to [[?{Casting Level}]] time(s).
                             An [undead creature](https://www.dandwiki.com/wiki/SRD:Undead_Type) you touch takes no damage of either sort, but it must make a successful Will saving throw or flee as if [panicked](https://www.dandwiki.com/wiki/SRD:Panicked) for 1d4 rounds +1 round per caster level: [[1d4+?{Casting Level}]] round(s).`,
          component_details:null
        },
        'circle of death': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Circle_of_Death',
          school:           'Necromancy [Death]',
          level:            'Sor/Wiz 6',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Area',
          target:           'Several living creatures within a 40-ft.-radius burst',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `A *circle of death* snuffs out the life force of living creatures, killing them instantly.
                             The spell slays 1d4 HD worth of living creatures per caster level (maximum 20d4): [[[[{?{Casting Level},20}kl1]]d4]] HD worth. Creatures with the fewest HD are affected first; among creatures with equal HD, those who are closest to the burst’s point of origin are affected first. No creature of 9 or more HD can be affected, and Hit Dice that are not sufficient to affect a creature are wasted.`,
          component_details:'Material Component: The powder of a crushed black pearl with a minimum value of 500 gp.'
        },
        'clairaudience/clairvoyance': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Clairaudience/Clairvoyance',
          school:           'Divination (Scrying)',
          level:            'Asn 4, Brd 3, Knowledge 3, Sor/Wiz 3',
          components:       'V, S, F/DF',
          casting_time:     '10 minutes',
          range:            'long',
          target_type:      'Effect',
          target:           'Magical sensor',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `*Clairaudience/clairvoyance* creates an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) magical sensor at a specific location that enables you to hear or see (your choice) almost as if you were there. You don’t need line of sight or line of effect, but the locale must be known—a place familiar to you or an obvious one. Once you have selected the locale, the sensor doesn’t move, but you can rotate it in all directions to view the area as desired. Unlike other scrying spells, this spell does not allow magically or supernaturally enhanced senses to work through it. If the chosen locale is magically dark, you see nothing. If it is naturally pitch black, you can see in a 10- foot radius around the center of the spell’s effect. *Clairaudience/clairvoyance* functions only on the plane of existence you are currently occupying.`,
          component_details:'Arcane Focus: A small horn (for hearing) or a glass eye (for seeing).'
        },
        'clenched fist': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Clenched_Fist',
          school:           'Evocation [Force]',
          level:            'Sor/Wiz 8, Strength 8',
          components:       'V, S, F/DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           '10-ft. hand',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `This spell functions like [*interposing hand*](https://www.dandwiki.com/wiki/SRD:Interposing_Hand), except that the hand can interpose itself, push, or strike one opponent that you select. The floating hand can move as far as 60 feet and can attack in the same round. Since this hand is directed by you, its ability to notice or attack [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) or concealed creatures is no better than yours.
                             The hand attacks once per round, and its attack bonus equals your caster level + your Intelligence, Wisdom, or Charisma modifier (for a [wizard](https://www.dandwiki.com/wiki/SRD:Wizard), [cleric](https://www.dandwiki.com/wiki/SRD:Cleric), or [sorcerer](https://www.dandwiki.com/wiki/SRD:Sorcerer), respectively), +11 for the hand’s Strength score (33), -1 for being Large. The hand deals ‹1d8+11› points of damage on each attack, and any creature struck must make a Fortitude save (against this spell’s save DC) or be [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round. Directing the spell to a new target is a [move action](https://www.dandwiki.com/wiki/SRD:Move_Actions).
                             The *clenched fist* can also interpose itself as [*interposing hand*](https://www.dandwiki.com/wiki/SRD:Interposing_Hand) does, or it can [bull rush](https://www.dandwiki.com/wiki/SRD:Bull_Rush) an opponent as [*forceful hand*](https://www.dandwiki.com/wiki/SRD:Forceful_Hand) does, but at a +15 \`\`bonus\`\` on the Strength check.
                             [Clerics](https://www.dandwiki.com/wiki/SRD:Cleric) who cast this spell name it for their deities.`,
          component_details:'Arcane Focus: A leather glove.'
        },
        'cloak of chaos': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Cloak_of_Chaos',
          school:           'Abjuration [Chaotic]',
          level:            'Chaos 8, Clr 8',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            '20 ft.',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] creature(s) in a 20-ft.-radius burst centered on you',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'See text',
          spell_resistance: 'Yes (harmless)',
          text:             `A random pattern of color surrounds the subjects, protecting them from attacks, granting them resistance to spells cast by lawful creatures, and causing lawful creatures that strike the subjects to become [*confused*](https://www.dandwiki.com/wiki/SRD:Confused). This abjuration has four effects.
                             First, each warded creature gains a +4 \`\`deflection bonus\`\` to AC and a +4 \`\`resistance bonus\`\` on saves. Unlike [*protection from law*](https://www.dandwiki.com/wiki/SRD:Protection_from_Law), the benefit of this spell applies against all attacks, not just against attacks by lawful creatures.
                             Second, each warded creature gains [spell resistance](https://www.dandwiki.com/wiki/SRD:Spell_Resistance) 25 against lawful spells and spells cast by lawful creatures.
                             Third, the abjuration blocks possession and mental influence, just as *protection from law* does.
                             Finally, if a lawful creature succeeds on a [melee attack](https://www.dandwiki.com/wiki/SRD:Melee_Attack) against a warded creature, the offending attacker is [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) for 1 round (Will save negates, as with the [*confusion*](https://www.dandwiki.com/wiki/SRD:Confusion) spell, but against the save DC of *cloak of chaos*).`,
          component_details:'Focus: A tiny reliquary containing some sacred relic, such as a scrap of parchment from a chaotic text. The reliquary costs at least 500 gp.'
        },
        'clone': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Clone',
          school:           'Necromancy',
          level:            'Sor/Wiz 8',
          components:       'V, S, M, F',
          casting_time:     '10 minutes',
          range:            '0 ft.',
          target_type:      'Effect',
          target:           'One clone',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell makes an inert duplicate of a creature. If the original individual has been slain, its soul immediately transfers to the clone, creating a replacement (provided that the soul is free and willing to return). The original’s physical remains, should they still exist, become inert and cannot thereafter be restored to life. If the original creature has reached the end of its natural life span (that is, it has died of natural causes), any cloning attempt fails.
                             To create the duplicate, you must have a piece of flesh (not hair, nails, scales, or the like) with a volume of at least 1 cubic inch that was taken from the original creature’s living body. The piece of flesh need not be fresh, but it must be kept from rotting. Once the spell is cast, the duplicate must be grown in a laboratory for [[2d4]] months.
                             When the clone is completed, the original’s soul enters it immediately, if that creature is already [dead](https://www.dandwiki.com/wiki/SRD:Dead). The clone is physically identical with the original and possesses the same personality and memories as the original. In other respects, treat the clone as if it were the original character raised from the [dead](https://www.dandwiki.com/wiki/SRD:Dead), including the loss of one level or 2 points of Constitution (if the original was a 1st-level character). If this Constitution adjustment would give the clone a Constitution score of 0, the spell fails. If the original creature has lost levels since the flesh sample was taken and died at a lower level than the clone would otherwise be, the clone is one level below the level at which the original died.
                             The spell duplicates only the original’s body and mind, not its equipment.
                             A duplicate can be grown while the original still lives, or when the original soul is unavailable, but the resulting body is merely a soulless bit of inert flesh, which rots if not preserved.`,
          component_details:`Material Component: The piece of flesh and various laboratory supplies (cost 1,000 gp).
                             Focus: Special laboratory equipment (cost 500 gp).`
        },
        'cloudkill': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Cloudkill',
          school:           'Conjuration (Creation)',
          level:            'Sor/Wiz 5',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Cloud spreads in 20-ft. radius, 20 ft. high',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Fortitude partial; see text',
          spell_resistance: 'No',
          text:             `This spell generates a bank of fog, similar to a [*fog cloud*](https://www.dandwiki.com/wiki/SRD:Fog_Cloud), except that its vapors are yellowish green and poisonous. These vapors automatically kill any living creature with 3 or fewer HD (no save). A living creature with 4 to 6 HD is slain unless it succeeds on a Fortitude save (in which case it takes ‹1d4› points of Constitution damage on your turn each round while in the cloud).
                             A living creature with 6 or more HD takes ‹1d4› points of Constitution damage on your turn each round while in the cloud (a successful Fortitude save halves this damage). Holding one’s breath doesn’t help, but creatures immune to poison are unaffected by the spell.
                             Unlike a *fog cloud*, the *cloudkill* moves away from you at 10 feet per round, rolling along the surface of the ground.
                             Figure out the cloud’s new spread each round based on its new point of origin, which is 10 feet farther away from the point of origin where you cast the spell.
                             Because the vapors are heavier than air, they sink to the lowest level of the land, even pouring down den or sinkhole openings. It cannot penetrate liquids, nor can it be cast underwater.`,
          component_details:null
        },
        'color spray': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Color_Spray',
          school:           'Illusion (Pattern) [Mind-Affecting]',
          level:            'Sor/Wiz 1',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            '15 ft.',
          target_type:      'Area',
          target:           'Cone-shaped burst',
          duration:         'Instantaneous; see text',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `A vivid cone of clashing colors springs forth from your hand, causing creatures to become [stunned](https://www.dandwiki.com/wiki/SRD:Stunned), perhaps also [blinded](https://www.dandwiki.com/wiki/SRD:Blinded), and possibly knocking them unconscious.
                             Each creature within the cone is affected according to its Hit Dice.
                             *2 HD or less*: The creature is [unconscious](https://www.dandwiki.com/wiki/SRD:Unconscious), [blinded](https://www.dandwiki.com/wiki/SRD:Blinded), and [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for [[2d4]] rounds, then [blinded](https://www.dandwiki.com/wiki/SRD:Blinded) and [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for [[1d4]] rounds, and then [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round. (Only living creatures are knocked unconscious.)
                             *3 or 4 HD*: The creature is [blinded](https://www.dandwiki.com/wiki/SRD:Blinded) and [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for [[1d4]] rounds, then [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round.
                             *5 or more HD*: The creature is [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round.
                             Sightless creatures are not affected by color spray.`,
          component_details:'Material Component: A pinch each of powder or sand that is colored red, yellow, and blue.'
        },
        'command': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Command',
          school:           'Enchantment (Compulsion) [Language-Dependent, Mind-Affecting]',
          level:            'Clr 1',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One living creature',
          duration:         '1 round',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `You give the subject a single command, which it obeys to the best of its ability at its earliest opportunity. You may select from the following options.
                             *Approach*: On its turn, the subject moves toward you as quickly and directly as possible for 1 round. The creature may do nothing but move during its turn, and it provokes [attacks of opportunity](https://www.dandwiki.com/wiki/SRD:Attack_of_Opportunity) for this movement as normal.
                             *Drop*: On its turn, the subject drops whatever it is holding. It can’t pick up any dropped item until its next turn.
                             *Fall*: On its turn, the subject falls to the ground and remains [prone](https://www.dandwiki.com/wiki/SRD:Prone) for 1 round. It may act normally while [prone](https://www.dandwiki.com/wiki/SRD:Prone) but takes any appropriate penalties.
                             *Flee*: On its turn, the subject moves away from you as quickly as possible for 1 round. It may do nothing but move during its turn, and it provokes [attacks of opportunity](https://www.dandwiki.com/wiki/SRD:Attack_of_Opportunity) for this movement as normal.
                             *Halt*: The subject stands in place for 1 round. It may not take any actions but is not considered [helpless](https://www.dandwiki.com/wiki/SRD:Helpless).
                             If the subject can’t carry out your command on its next turn, the spell automatically fails.`,
          component_details:null
        },
        'command plants': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Command_Plants',
          school:           'Transmutation',
          level:            'Drd 4, Plant 4, Rgr 3',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           'Up to [[2*?{Casting Level}]] HD of [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) creatures, no two of which can be more than 30 ft. apart',
          duration:         '[[?{Casting Level}]] day(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell allows you some degree of control over one or more [plant creatures](https://www.dandwiki.com/wiki/SRD:Plant_Type). Affected [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) creatures can understand you, and they perceive your words and actions in the most favorable way (treat their attitude as friendly). They will not attack you while the spell lasts. You can try to give a subject orders, but you must win an opposed Charisma check to convince it to do anything it wouldn’t ordinarily do. (Retries are not allowed.) A commanded [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) never obeys suicidal or obviously harmful orders, but it might be convinced that something very dangerous is worth doing.
                             You can affect a number of [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) creatures whose combined level or HD do not exceed twice your level.`,
          component_details:null
        },
        'command undead': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Command_Undead',
          school:           'Necromancy',
          level:            'Sor/Wiz 2',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           'One undead creature',
          duration:         '[[?{Casting Level}]] day(s)',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `This spell allows you some degree of control over an [undead creature](https://www.dandwiki.com/wiki/SRD:Undead_Type). Assuming the subject is intelligent, it perceives your words and actions in the most favorable way (treat its attitude as friendly). It will not attack you while the spell lasts. You can try to give the subject orders, but you must win an opposed Charisma check to convince it to do anything it wouldn’t ordinarily do. (Retries are not allowed.) An intelligent commanded [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) never obeys suicidal or obviously harmful orders, but it might be convinced that something very dangerous is worth doing.
                             A nonintelligent [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature gets no saving throw against this spell. When you control a mindless being, you can communicate only basic commands, such as “come here,” “go there,” “fight,” “stand still,” and so on. Nonintelligent [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) won’t resist suicidal or obviously harmful orders.
                             Any act by you or your apparent allies that threatens the commanded [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) (regardless of its Intelligence) breaks the spell.
                             Your commands are not telepathic. The [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature must be able to hear you.`,
          component_details:'Material Component: A shred of raw meat and a splinter of bone.'
        },
        'commune': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Commune',
          school:           'Divination',
          level:            'Clr 5',
          components:       'V, S, M, DF, XP',
          casting_time:     '10 minutes',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] round(s)',
          text:             `You contact your deity—or agents thereof —and ask questions that can be answered by a simple yes or no. (A [cleric](https://www.dandwiki.com/wiki/SRD:Cleric) of no particular deity contacts a philosophically allied deity.) You are allowed one such question per caster level. The answers given are correct within the limits of the entity’s knowledge. “Unclear” is a legitimate answer, because powerful beings of the Outer Planes are not necessarily omniscient. In cases where a one-word answer would be misleading or contrary to the deity’s interests, a short phrase (five words or less) may be given as an answer instead.
                             The spell, at best, provides information to aid character decisions. The entities contacted structure their answers to further their own purposes. If you lag, discuss the answers, or go off to do anything else, the spell ends.`,
          component_details:`Material Component: Holy (or unholy) water and incense.
                             XP Cost: 100 XP.`
        },
        'commune with nature': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Commune_with_Nature',
          school:           'Divination',
          level:            'Animal 5, Drd 5, Rgr 4',
          components:       'V, S',
          casting_time:     '10 minutes',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         'Instantaneous',
          text:             `You become one with nature, attaining knowledge of the surrounding territory. You instantly gain knowledge of as many as three facts from among the following subjects: the ground or terrain, [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type), minerals, bodies of water, people, general [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) population, presence of woodland creatures, presence of powerful unnatural creatures, or even the general state of the natural setting.
                             In outdoor settings, the spell operates in a radius of 1 mile per caster level. In natural underground settings—caves, caverns, and the like—the radius is limited to 100 feet per caster level. The spell does not function where nature has been replaced by construction or settlement, such as in dungeons and towns.`,
          component_details:null
        },
        'comprehend languages': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Comprehend_Languages',
          school:           'Divination',
          level:            'Brd 1, Clr 1, Mind 1, Sor/Wiz 1',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] minute(s)',
          text:             `You can understand the spoken words of creatures or read otherwise incomprehensible written messages. In either case, you must touch the creature or the writing. The ability to read does not necessarily impart insight into the material, merely its literal meaning. The spell enables you to understand or read an unknown language, not speak or write it.
                             Written material can be read at the rate of one page (250 words) per minute. Magical writing cannot be read, though the spell reveals that it is magical. This spell can be foiled by certain warding magic (such as the [*secret page*](https://www.dandwiki.com/wiki/SRD:Secret_Page) and [*illusory script*](https://www.dandwiki.com/wiki/SRD:Illusory_Script) spells). It does not decipher codes or reveal messages concealed in otherwise normal text.
                             *Comprehend languages* can be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:'Arcane Material Component: A pinch of soot and a few grains of salt.'
        },
        'cone of cold': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Cone_of_Cold',
          school:           'Evocation [Cold]',
          level:            'Sor/Wiz 5, Water 6',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped burst',
          duration:         'Instantaneous',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `Cone of cold creates an area of extreme cold, originating at your hand and extending outward in a cone. It drains heat, dealing 1d6 points of cold damage per caster level (maximum 15d6): [[[[{?{Casting Level},15}kl1]]d6]].`,
          component_details:'Arcane Material Component: A very small crystal or glass cone.'
        },
        'confusion': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Confusion',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 3, Madness 4, Sor/Wiz 4, Trickery 4',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'All creatures in a 15-ft. radius burst',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell causes the targets to become [*confused*](https://www.dandwiki.com/wiki/SRD:Confused), making them unable to independently determine what they will do.
                             Roll ‹1d100› on the [*confused condition table*](https://www.dandwiki.com/wiki/SRD:Confused) at the beginning of each subject’s turn each round to see what the subject does in that round.
                             A [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) character who can’t carry out the indicated action does nothing but babble incoherently. Attackers are not at any special advantage when attacking a [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) character. Any [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) character who is attacked automatically attacks its attackers on its next turn, as long as it is still [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) when its turn comes. Note that a [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) character will not make [attacks of opportunity](https://www.dandwiki.com/wiki/SRD:Attack_of_Opportunity) against any creature that it is not already devoted to attacking (either because of its most recent action or because it has just been attacked).`,
          component_details:'Arcane Material Component: A set of three nut shells.'
        },
        'consecrate': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Consecrate',
          school:           'Evocation [Good]',
          level:            'Clr 2',
          components:       'V, S, M, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Area',
          target:           '20-ft.-radius emanation',
          duration:         '[[2*?{Casting Level}]] hour(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell blesses an area with positive energy. Each Charisma check made to [turn undead](https://www.dandwiki.com/wiki/SRD:Turn_or_Rebuke_Undead) within this area gains a +3 \`\`sacred bonus\`\`. Every [undead creature](https://www.dandwiki.com/wiki/SRD:Undead_Type) entering a *consecrated* area suffers minor disruption, giving it a -1 \`\`penalty\`\` on attack rolls, damage rolls, and saves. [Undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) cannot be created within or summoned into a *consecrated* area.
                             If the *consecrated* area contains an altar, shrine, or other permanent fixture dedicated to your deity, pantheon, or aligned higher power, the modifiers given above are doubled (+6 \`\`sacred bonus\`\` on turning checks, -2 \`\`penalties\`\` for [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) in the area). You cannot consecrate an area with a similar fixture of a deity other than your own patron.
                             If the area does contain an altar, shrine, or other permanent fixture of a deity, pantheon, or higher power other than your patron, the consecrate spell instead curses the area, cutting off its connection with the associated deity or power. This secondary function, if used, does not also grant the bonuses and penalties relating to [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type), as given above.
                             *Consecrate* counters and dispels [*desecrate*](https://www.dandwiki.com/wiki/SRD:Desecrate).`,
          component_details:'Material Component: A vial of holy water and 25 gp worth (5 pounds) of silver dust, all of which must be sprinkled around the area.'
        },
        'contact other plane': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Contact_Other_Plane',
          school:           'Divination',
          level:            'Sor/Wiz 5',
          components:       'V',
          casting_time:     '10 minutes',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         'Concentration',
          text:             `You send your mind to another plane of existence (an Elemental Plane or some plane farther removed) in order to receive advice and information from powers there. (See the accompanying table for possible consequences and results of the attempt.) The powers reply in a language you understand, but they resent such contact and give only brief answers to your questions. (All questions are answered with “yes,” “no,” “maybe,” “never,” “irrelevant,” or some other one-word answer.)
                             You must concentrate on maintaining the spell (a standard action) in order to ask questions at the rate of one per round. A question is answered by the power during the same round. For every two caster levels, you may ask one question.
                             Contact with minds far removed from your home plane increases the probability that you will incur a decrease to Intelligence and Charisma, but the chance of the power knowing the answer, as well as the probability of the entity answering correctly, are likewise increased by moving to distant planes.
                             Once the Outer Planes are reached, the power of the deity contacted determines the effects. (Random results obtained from the table are subject to the personalities of individual deities.)
                             On rare occasions, this divination may be blocked by an act of certain deities or forces.

                             • **Plane Contacted**
                             -- *Avoid Int/Cha Decrease*
                             -- True Answer
                             -- Don’t Know
                             -- Lie
                             -- Random Answer
                             • **Elemental Plane:**
                             -- *DC 7/1 week*
                             -- 01–34
                             -- 35–62
                             -- 63–83
                             -- 84–100
                             • **(appropriate):**
                             -- *(DC 7/1 week)*
                             -- (01–68)
                             -- (69–75)
                             -- (76–98)
                             -- (99–100)
                             • **Positive/Negative Energy Plane:**
                             -- *DC 8/1 week*
                             -- 01–39
                             -- 40–65
                             -- 66–86
                             -- 87–100
                             • **Astral Plane:**
                             -- *DC 9/1 week*
                             -- 01–44
                             -- 45–67
                             -- 68–88
                             -- 89–100
                             • **Outer Plane, demideity:**
                             -- *DC 10/2 weeks*
                             -- 01–49
                             -- 50–70
                             -- 71–91
                             -- 92–100
                             • **Outer Plane, lesser deity:**
                             -- *DC 12/3 weeks*
                             -- 01–60
                             -- 61–75
                             -- 76–95
                             -- 96–100
                             • **Outer Plane, intermediate deity:**
                             -- *DC 14/4 weeks*
                             -- 01–73
                             -- 74–81
                             -- 82–98
                             -- 99–100
                             • **Outer Plane, greater deity:**
                             -- *DC 16/5 weeks*
                             -- 01–88
                             -- 89–90
                             -- 91–99
                             -- 100

                             *Avoid Int/Cha Decrease:* You must succeed on an Intelligence check against this DC to avoid a decrease in Intelligence and Charisma. If the check fails, your Intelligence and Charisma scores each fall to 8 for the stated duration, and you become unable to cast arcane spells. If you lose Intelligence and Charisma, the effect strikes as soon as the first question is asked, and no answer is received. (The entries in parentheses are for questions that pertain to the appropriate Elemental Plane.)
                             **Results of a Successful Contact:** d% is rolled for the result shown on the table:
                             *True Answer:* You get a true, one-word answer. Questions that cannot be answered in this way are answered randomly.
                             *Don’t Know:* The entity tells you that it doesn’t know.
                             *Lie:* The entity intentionally lies to you.
                             *Random Answer:* The entity tries to lie but doesn’t know the answer, so it makes one up.`,
          component_details:null
        },
        'contagion': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Contagion',
          school:           'Necromancy [Evil]',
          level:            'Blg 3, Clr 3, Destruction 3, Drd 3, Sor/Wiz 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Living creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `The subject contracts a [disease](https://www.dandwiki.com/wiki/SRD:Disease) selected from the table below, which strikes immediately (no incubation period). The DC noted is for the subsequent saves (use *contagion’s* normal save DC for the initial saving throw).
                             • **[Disease](https://www.dandwiki.com/wiki/SRD:Disease)** [DC] Damage
                             • **[Blinding sickness](https://www.dandwiki.com/wiki/SRD:Disease#Blinding_Sickness)** [16] ‹1d4 STR|[[1d4]] STR damage›†
                             • **[Cackle fever](https://www.dandwiki.com/wiki/SRD:Disease#Cackle_Fever)** [16] ‹1d6 WIS|[[1d6]] WIS damage›
                             • **[Filth fever](https://www.dandwiki.com/wiki/SRD:Disease#Filth_Fever)** [12] ‹1d3 DEX + 1d3 CON|[[1d3]] DEX + [[1d3]] CON damage›
                             • **[Mindfire](https://www.dandwiki.com/wiki/SRD:Disease#Mindfire)** [12] ‹1d4 INT|[[1d4]] INT damage›
                             • **[Red ache](https://www.dandwiki.com/wiki/SRD:Disease#Red_Ache)** [15] ‹1d6 STR|[[1d6]] STR damage›
                             • **[Shakes](https://www.dandwiki.com/wiki/SRD:Disease#Shakes)** [13] ‹1d8 DEX|[[1d8]] DEX damage›
                             • **[Slimy doom](https://www.dandwiki.com/wiki/SRD:Disease#Slimy_Doom)** [14] ‹1d4 CON|[[1d4]] CON damage›
                             † Each time a victim takes 2 or more points of Strength damage from blinding sickness, he or she must make another Fortitude save (using the disease’s save DC) or be permanently [blinded](https://www.dandwiki.com/wiki/SRD:Blinded).`,
          component_details:null
        },
        'contingency': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Contingency',
          school:           'Evocation',
          level:            'Sor/Wiz 6, Time 6',
          components:       'V, S, M, F',
          casting_time:     'At least 10 minutes; see text',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] day(s) (D) or until discharged',
          text:             `You can place another spell upon your person so that it comes into effect under some condition you dictate when casting *contingency*. The *contingency* spell and the companion spell are cast at the same time. The 10-minute casting time is the minimum total for both castings; if the companion spell has a casting time longer than 10 minutes, use that instead.
                             The spell to be brought into effect by the *contingency* must be one that affects your person and be of a spell level no higher than one-third your caster level (rounded down, maximum 6th level).
                             The conditions needed to bring the spell into effect must be clear, although they can be general. In all cases, the *contingency* immediately brings into effect the companion spell, the latter being “cast” instantaneously when the prescribed circumstances occur. If complicated or convoluted conditions are prescribed, the whole spell combination (*contingency* and the companion magic) may fail when called on. The companion spell occurs based solely on the stated conditions, regardless of whether you want it to.
                             You can use only one *contingency* spell at a time; if a second is cast, the first one (if still active) is dispelled.`,
          component_details:`Material Component: That of the companion spell, plus quicksilver and an eyelash of an [ogre mage](https://www.dandwiki.com/wiki/SRD:Ogre_Mage), [rakshasa](https://www.dandwiki.com/wiki/SRD:Rakshasa), or similar spell-using creature.
                             Focus: A statuette of you carved from elephant ivory and decorated with gems (worth at least 1,500 gp). You must carry the focus for the *contingency* to work.`
        },
        //Epic Spell: contingent resurrection
        'continual flame': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Continual_Flame',
          school:           'Evocation [Light]',
          level:            'Clr 3, Sor/Wiz 2',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Effect',
          target:           'Magical, heatless flame',
          duration:         'Permanent',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `A flame, equivalent in brightness to a torch, springs forth from an object that you touch. The effect looks like a regular flame, but it creates no heat and doesn’t use oxygen. A *continual flame* can be covered and hidden but not smothered or quenched.
                             Light spells counter and dispel darkness spells of an equal or lower level.`,
          component_details:'Material Component: You sprinkle ruby dust (worth 50 gp) on the item that is to carry the flame.'
        },
        'control plants': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Control_Plants',
          school:           'Transmutation',
          level:            'Drd 8, Plant 8',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           'Up to [[2*?{Casting Level}]] HD of [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) creatures, no two of which can be more than 30 ft. apart',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'No',
          text:             `This spell enables you to control the actions of one or more [plant creatures](https://www.dandwiki.com/wiki/SRD:Plant_Type) for a short period of time. You command the creatures by voice and they understand you, no matter what language you speak. Even if vocal communication is impossible the controlled [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type) do not attack you. At the end of the spell, the subjects revert to their normal behavior.
                             Suicidal or self-destructive commands are simply ignored.`,
          component_details:null
        },
        'control undead': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Control_Undead',
          school:           'Necromancy',
          level:            'Sor/Wiz 7',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           'Up to [[2*?{Casting Level}]] HD of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creatures, no two of which can be more than 30 ft. apart',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell enables you to command [undead creatures](https://www.dandwiki.com/wiki/SRD:Undead_Type) for a short period of time. You command them by voice and they understand you, no matter what language you speak. Even if vocal communication is impossible the controlled [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) do not attack you. At the end of the spell, the subjects revert to their normal behavior.
                             Intelligent [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creatures remember that you controlled them.`,
          component_details:'Material Component: A small piece of bone and a small piece of raw meat.'
        },
        'control water': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Control_Water',
          school:           'Transmutation [Water]',
          level:            'Clr 4, Drd 4, Sor/Wiz 6, Water 4',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Area',
          target:           'Water in a volume of [[10*?{Casting Level}]] ft. by [[10*?{Casting Level}]] ft. by [[2*?{Casting Level}]] ft. (D)',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None; see text',
          spell_resistance: 'No',
          text:             `Depending on the version you choose, the *control water* spell raises or lowers water.
                             *Lower Water:* This causes water or similar liquid to reduce its depth by as much as 2 feet per caster level (to a minimum depth of 1 inch). The water is lowered within a squarish depression whose sides are up to caster level x 10 feet long. In extremely large and deep bodies of water, such as a deep ocean, the spell creates a whirlpool that sweeps ships and similar craft downward, putting them at risk and rendering them unable to leave by normal movement for the duration of the spell. When cast on water [elementals](https://www.dandwiki.com/wiki/SRD:Elemental_Type) and other water-based creatures, this spell acts as a *slow* spell (Will negates). The spell has no effect on other creatures.
                             *Raise Water:* This causes water or similar liquid to rise in height, just as the *lower water* version causes it to lower. Boats raised in this way slide down the sides of the hump that the spell creates. If the area affected by the spell includes riverbanks, a beach, or other land nearby, the water can spill over onto dry land.
                             With either version, you may reduce one horizontal dimension by half and double the other horizontal dimension.`,
          component_details:'Arcane Material Component: A drop of water (for *raise water*) or a pinch of dust (for *lower water*).'
        },
        'control weather': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Control_Weather',
          school:           'Transmutation',
          level:            'Air 7, Clr 7, Drd 7, Sor/Wiz 7, Weather 7',
          components:       'V, S',
          casting_time:     '10 minutes; see text',
          range:            '2 miles',
          target_type:      'Area',
          target:           '2-mile-radius circle, centered on you; see text',
          duration:         '[[4d12]] hours; see text',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You change the weather in the local area. It takes 10 minutes to cast the spell and an additional 10 minutes for the effects to manifest. You can call forth weather appropriate to the climate and season of the area you are in.

                             • **Spring**
                             -- Tornado
                             -- Thunderstorm
                             -- Sleet storm
                             -- Hot weather
                             • **Summer**
                             -- Torrential rain
                             -- Heat wave
                             -- Hailstorm
                             • **Autumn**
                             -- Hot or cold weather
                             -- Fog
                             -- Sleet
                             • **Winter**
                             -- Frigid cold
                             -- Blizzard
                             -- Thaw
                             • **Late winter**
                             -- Hurricane-force winds
                             -- Early spring (coastal area)

                             You control the general tendencies of the weather, such as the direction and intensity of the wind. You cannot control specific applications of the weather—where lightning strikes, for example, or the exact path of a tornado. When you select a certain weather condition to occur, the weather assumes that condition 10 minutes later (changing gradually, not abruptly). The weather continues as you left it for the duration, or until you use a standard action to designate a new kind of weather (which fully manifests itself 10 minutes later). Contradictory conditions are not possible simultaneously.
                             *Control weather* can do away with atmospheric phenomena (naturally occurring or otherwise) as well as create them.
                             A [druid](https://www.dandwiki.com/wiki/SRD:Druid) casting this spell doubles the duration and affects a circle with a 3-mile radius.`,
          component_details:null
        },
        'control winds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Control_Winds',
          school:           'Transmutation [Air]',
          level:            'Air 5, Drd 5, Weather 6',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            '[[40*?{Casting Level}]] ft.',
          target_type:      'Area',
          target:           '[[40*?{Casting Level}]] ft. radius cylinder 40 ft. high',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'No',
          text:             `You alter wind force in the area surrounding you. You can make the wind blow in a certain direction or manner, increase its strength, or decrease its strength. The new wind direction and strength persist until the spell ends or until you choose to alter your handiwork, which requires concentration. You may create an “eye” of calm air up to 80 feet in diameter at the center of the area if you so desire, and you may choose to limit the area to any cylindrical area less than your full limit.
                             *Wind Direction:* You may choose one of four basic wind patterns to function over the spell’s area.
                             • A downdraft blows from the center outward in equal strength in all directions.
                             • An updraft blows from the outer edges in toward the center in equal strength from all directions, veering upward before impinging on the eye in the center.
                             • A rotation causes the winds to circle the center in clockwise or counterclockwise fashion.
                             • A blast simply causes the winds to blow in one direction across the entire area from one side to the other.
                             *Wind Strength:* For every three caster levels, you can increase or decrease wind strength by one level. Each round on your turn, a creature in the wind must make a Fortitude save or suffer the effect of being in the windy area.
                             Strong winds (21+ mph) make sailing difficult.
                             A severe wind (31+ mph) causes minor ship and building damage.
                             A windstorm (51+ mph) drives most flying creatures from the skies, uproots small trees, knocks down light wooden structures, tears off roofs, and endangers ships.
                             Hurricane force winds (75+ mph) destroy wooden buildings, sometimes uproot even large trees, and cause most ships to founder.
                             A tornado (175+ mph) destroys all nonfortified buildings and often uproots large trees.`,
          component_details:null
        },
        'corrupt weapon': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Corrupt_Weapon',
          school:           'Transmutation',
          level:            'Blg 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Weapon touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This transmutation makes a weapon strike true against good foes. The weapon is treated as having a +1 enhancement bonus for the purpose of bypassing the damage reduction of good creatures or striking good [incorporeal creatures](https://www.dandwiki.com/wiki/SRD:Incorporeal_Subtype) (though the spell doesn’t grant an actual enhancement bonus). The weapon also becomes evil, which means it can bypass the damage reduction of certain creatures. (This effect overrides and suppresses any other alignment the weapon might have.) Individual arrows or bolts can be transmuted, but affected projectile weapons (such as bows) don’t confer the benefit to the projectiles they shoot.
                             In addition, all critical hit rolls against good foes are automatically successful, so every threat is a critical hit. This last effect does not apply to any weapon that already has a magical effect related to critical hits, such as a [keen](https://www.dandwiki.com/wiki/SRD:Keen) weapon or a [vorpal](https://www.dandwiki.com/wiki/SRD:Vorpal) sword.`,
          component_details:null
        },
        'create food and water': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Create_Food_and_Water',
          school:           'Conjuration (Creation)',
          level:            'Clr 3, Creation 3',
          components:       'V, S',
          casting_time:     '10 minutes',
          range:            'close',
          target_type:      'Effect',
          target:           'Food and water to sustain [[3*?{Casting Level}]] humans or [[?{Casting Level}]] horse for 24 hours',
          duration:         '24 hours; see text',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `The food that this spell creates is simple fare of your choice—highly nourishing, if rather bland. Food so created decays and becomes inedible within 24 hours, although it can be kept fresh for another 24 hours by casting a [purify food and drink](https://www.dandwiki.com/wiki/SRD:Purify_Food_and_Drink) spell on it. The water created by this spell is just like clean rain water, and it doesn’t go bad as the food does.`,
          component_details:null
        },
        'create greater undead': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Create_Greater_Undead',
          school:           'Necromancy [Evil]',
          level:            'Clr 8, Death 8, Sor/Wiz 8',
          components:       'V, S, M',
          casting_time:     '1 hour',
          range:            'close',
          target_type:      'Target',
          target:           'One corpse',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `A much more potent spell than [*animate dead*](https://www.dandwiki.com/wiki/SRD:Animate_Dead), this evil spell allows you to create more powerful sorts of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type): [shadows](https://www.dandwiki.com/wiki/SRD:Shadow), [wraiths](https://www.dandwiki.com/wiki/SRD:Wraith), [spectres](https://www.dandwiki.com/wiki/SRD:Spectre), and [devourers](https://www.dandwiki.com/wiki/SRD:Devourer). The type or types of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) you can create is based on your caster level, as shown on the table below.

                             • Caster Level 15th or lower
                             -- [Shadow](https://www.dandwiki.com/wiki/SRD:Shadow)
                             • Caster Level 16th–17th
                             -- [Wraith](https://www.dandwiki.com/wiki/SRD:Wraith)
                             • Caster Level 18th–19th
                             -- [Spectre](https://www.dandwiki.com/wiki/SRD:Spectre)
                             • Caster Level 20th or higher
                             -- [Devourer](https://www.dandwiki.com/wiki/SRD:Devourer)

                             You may create less powerful [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) than your level would allow if you choose. Created [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) are not automatically under the control of their animator. If you are capable of commanding [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type), you may attempt to command the [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature as it forms.
                             This spell must be cast at night.`,
          component_details:'Material Component: A clay pot filled with grave dirt and another filled with brackish water. The spell must be cast on a [dead](https://www.dandwiki.com/wiki/SRD:Dead) body. You must place a black onyx gem worth at least 50 gp per HD of the [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) to be created into the mouth or eye socket of each corpse. The magic of the spell turns these gems into worthless shells.'
        },
        //Epic Spell: create living vault (ritual)
        'create undead': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Create_Undead',
          school:           'Necromancy [Evil]',
          level:            'Clr 6, Death 6, Evil 6, Sor/Wiz 6',
          components:       'V, S, M',
          casting_time:     '1 hour',
          range:            'close',
          target_type:      'Target',
          target:           'One corpse',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `A much more potent spell than [animate dead](https://www.dandwiki.com/wiki/SRD:Animate_Dead), this evil spell allows you to create more powerful sorts of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type): [ghouls](https://www.dandwiki.com/wiki/SRD:Ghoul), [ghasts](https://www.dandwiki.com/wiki/SRD:Ghast), [mummies](https://www.dandwiki.com/wiki/SRD:Mummy), and [mohrgs](https://www.dandwiki.com/wiki/SRD:Mohrg). The type or types of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) you can create is based on your caster level, as shown on the table below.

                             • Caster Level 11th or lower
                             -- [Ghoul](https://www.dandwiki.com/wiki/SRD:Ghoul)
                             • Caster Level 12th–14th
                             -- [Ghast](https://www.dandwiki.com/wiki/SRD:Ghast)
                             • Caster Level 15th–17th
                             -- [Mummy](https://www.dandwiki.com/wiki/SRD:Mummy)
                             • Caster Level 18th or higher
                             -- [Mohrg](https://www.dandwiki.com/wiki/SRD:Mohrg)

                             You may create less powerful [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) than your level would allow if you choose. Created [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) are not automatically under the control of their animator. If you are capable of commanding [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type), you may attempt to command the [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature as it forms.
                             This spell must be cast at night.`,
          component_details:'Material Component: A clay pot filled with grave dirt and another filled with brackish water. The spell must be cast on a [dead](https://www.dandwiki.com/wiki/SRD:Dead) body. You must place a black onyx gem worth at least 50 gp per HD of the [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) to be created into the mouth or eye socket of each corpse. The magic of the spell turns these gems into worthless shells.'
        },
        'create water': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Create_Water',
          school:           'Conjuration (Creation) [Water]',
          level:            'Clr 0, Creation 1, Drd 0, Pal 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'Up to [[2*?{Casting Level}]] gallons of water',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell generates wholesome, drinkable water, just like clean rain water. Water can be created in an area as small as will actually contain the liquid, or in an area three times as large—possibly creating a downpour or filling many small receptacles.
                             *Note:* Conjuration spells can’t create substances or objects within a creature. Water weighs about 8 pounds per gallon. One cubic foot of water contains roughly 8 gallons and weighs about 60 pounds.`,
          component_details:null
        },
        'creeping doom': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Creeping_Doom',
          school:           'Conjuration (Summoning)',
          level:            'Drd 7, Scalykind 7',
          components:       'V, S',
          casting_time:     '1 round',
          range:            'Close ([[25+(5*floor([[?{Casting Level}/2]]))]]) / 100 ft.; see text',
          target_type:      'Effect',
          target:           '[[floor(?{Casting Level}/2)]] swarm of centipedes',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `When you utter the spell of *creeping doom*, you call forth a [mass of centipede swarms](https://www.dandwiki.com/wiki/SRD:Centipede_Swarm) (one per two caster levels, to a maximum of ten swarms at 20th level), which need not appear adjacent to one another.
                             You may summon the centipede swarms so that they share the area of other creatures. The swarms remain stationary, attacking any creatures in their area, unless you command the creeping doom to move (a standard action). As a standard action, you can command any number of the swarms to move toward any prey within 100 feet of you. You cannot command any swarm to move more than 100 feet away from you, and if you move more than 100 feet from any swarm, that swarm remains stationary, attacking any creatures in its area (but it can be commanded again if you move within 100 feet).`,
          component_details:null
        },
        'crown of glory': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Crown_of_Glory',
          school:           'Evocation',
          level:            'Glory 8',
          components:       'V, S, M, DF',
          casting_time:     '1 full round',
          range:            'Personal',
          target_type:      'Area',
          target:           '120-ft.-radius emanation centered on you',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `The caster is imbued with an aura of [celestial](https://www.dandwiki.com/wiki/SRD:Celestial) authority, inspiring awe in all lesser creatures.
                             The caster gains a +4 \`\`enhancement bonus\`\` to his or her Charisma score for the duration of the spell. All creatures with fewer than 8 HD or levels cease whatever they are doing and are compelled to pay attention to the caster. Any such creature that wants to take hostile action against the caster must make a successful Will save to do so. Any creature that does not make this saving throw the first time it attempts a hostile action is *enthralled* for the duration of the spell (as the [*enthrall*](https://www.dandwiki.com/wiki/SRD:Enthrall) spell), as long as it is in the spell’s area, nor will it try to leave the area on its own. Creatures with 8 HD or more may pay attention to the caster, but are not affected by this spell.
                             When the caster speaks, all listeners telepathically understand him or her, even if they do not understand the language. While the spell lasts, the caster can make up to three suggestions to creatures of fewer than 8 HD in range, as if using the [*mass suggestion*](https://www.dandwiki.com/wiki/SRD:Mass_Suggestion) spell (Will save negates); creatures with 8 HD or more aren’t affected by this power. Only creatures within range at the time a [*suggestion*](https://www.dandwiki.com/wiki/SRD:Suggestion) is given are subject to it.`,
          component_details:'Material Component: worth at least 200 gp.'
        },
        //Epic Spell: crown of vermin
        'crushing despair': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Crushing_Despair',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 3, Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            '30 ft.',
          target_type:      'Area',
          target:           'Cone-shaped burst',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `An [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) cone of despair causes great sadness in the subjects. Each affected creature takes a -2 \`\`penalty\`\` on attack rolls, saving throws, ability checks, skill checks, and weapon damage rolls.
                             *Crushing despair* counters and dispels [*good hope*](https://www.dandwiki.com/wiki/SRD:Good_Hope).`,
          component_details:'Material Component: A vial of tears.'
        },
        'crushing hand': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Crushing_Hand',
          school:           'Evocation [Force]',
          level:            'Sor/Wiz 9, Strength 9',
          components:       'V, S, M, F/DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           '10-ft. hand',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `This spell functions like [*interposing hand*](https://www.dandwiki.com/wiki/SRD:Interposing_Hand), except that the hand can interpose itself, push, or crush one opponent that you select.
                             The *crushing hand* can [grapple](https://www.dandwiki.com/wiki/SRD:Grapple) an opponent like [*grasping hand*](https://www.dandwiki.com/wiki/SRD:Grasping_Hand) does. Its [grapple](https://www.dandwiki.com/wiki/SRD:Grapple) bonus equals your caster level + your Intelligence, Wisdom, or Charisma modifier (for a [wizard](https://www.dandwiki.com/wiki/SRD:Wizard), [cleric](https://www.dandwiki.com/wiki/SRD:Cleric), or [sorcerer](https://www.dandwiki.com/wiki/SRD:Sorcerer), respectively), +12 for the hand's Strength score (35), +4 for being Large. The hand deals ‹2d6+12› points of damage (lethal, not nonlethal) on each successful [grapple](https://www.dandwiki.com/wiki/SRD:Grapple) check against an opponent.
                             The *crushing hand* can also interpose itself as [*interposing hand*](https://www.dandwiki.com/wiki/SRD:Interposing_Hand) does, or it can [bull rush](https://www.dandwiki.com/wiki/SRD:Bull_Rush) an opponent as [*forceful hand*](https://www.dandwiki.com/wiki/SRD:Forceful_Hand) does, but at a +18 \`\`bonus\`\`.
                             Directing the spell to a new target is a move action.
                             [Clerics](https://www.dandwiki.com/wiki/SRD:Cleric) who cast this spell name it for their deities.`,
          component_details:`Arcane Material Component: The shell of an egg.
                             Arcane Focus: A glove of snakeskin.`
        },
        'cure critical wounds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Cure_Critical_Wounds',
          school:           'Conjuration (Healing)',
          level:            'Blg 4, Brd 4, Clr 4, Drd 5, Healing 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half (harmless); see text',
          spell_resistance: 'Yes (harmless); see text',
          text:             `When laying your hand upon a living creature, you channel positive energy that cures 4d8 points of damage +1 point per caster level (maximum +20): [[4d8+[[{?{Casting Level},20}kl1]]]].
                             Since undead are powered by negative energy, this spell deals damage to them instead of curing their wounds. An [undead creature](https://www.dandwiki.com/wiki/SRD:Undead_Type) can apply spell resistance, and can attempt a Will save to take half damage.`,
          component_details:null
        },
        'cure light wounds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Cure_Light_Wounds',
          school:           'Conjuration (Healing)',
          level:            'Blg 1, Brd 1, Clr 1, Drd 1, Healing 1, Pal 1, Rgr 2',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half (harmless); see text',
          spell_resistance: 'Yes (harmless); see text',
          text:             `When laying your hand upon a living creature, you channel positive energy that cures 1d8 points of damage +1 point per caster level (maximum +5): [[1d8+[[{?{Casting Level},5}kl1]]]].
                             Since [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) are powered by negative energy, this spell deals damage to them instead of curing their wounds. An [undead creature](https://www.dandwiki.com/wiki/SRD:Undead_Type) can apply spell resistance, and can attempt a Will save to take half damage.`,
          component_details:null
        },
        'cure minor wounds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Cure_Minor_Wounds',
          school:           'Conjuration (Healing)',
          level:            'Clr 0, Drd 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half (harmless); see text',
          spell_resistance: 'Yes (harmless); see text',
          text:             `When laying your hand upon a living creature, you channel positive energy that cures 1 point of damage.
                             Since [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) are powered by negative energy, this spell deals damage to them instead of curing their wounds. An [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature can apply spell resistance, and can attempt a Will save to take half damage.`,
          component_details:null
        },
        'cure moderate wounds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Cure_Moderate_Wounds',
          school:           'Conjuration (Healing)',
          level:            'Blg 2, Brd 2, Clr 2, Drd 3, Healing 2, Pal 3, Rgr 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half (harmless); see text',
          spell_resistance: 'Yes (harmless); see text',
          text:             `When laying your hand upon a living creature, you channel positive energy that cures 2d8 points of damage +1 point per caster level (maximum +10): [[2d8+[[{?{Casting Level},10}kl1]]]].
                             Since [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) are powered by negative energy, this spell deals damage to them instead of curing their wounds. An [undead creature](https://www.dandwiki.com/wiki/SRD:Undead_Type) can apply spell resistance, and can attempt a Will save to take half damage.`,
          component_details:null
        },
        'cure serious wounds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Cure_Serious_Wounds',
          school:           'Conjuration (Healing)',
          level:            'Blg 3, Brd 3, Clr 3, Drd 4, Pal 4, Rgr 4, Healing 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half (harmless); see text',
          spell_resistance: 'Yes (harmless); see text',
          text:             `When laying your hand upon a living creature, you channel positive energy that cures 3d8 points of damage +1 point per caster level (maximum +15): [[3d8+[[{?{Casting Level},15}kl1]]]].
                             Since [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) are powered by negative energy, this spell deals damage to them instead of curing their wounds. An [undead creature](https://www.dandwiki.com/wiki/SRD:Undead_Type) can apply spell resistance, and can attempt a Will save to take half damage.`,
          component_details:null
        },
        'curse water': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Curse_Water',
          school:           'Necromancy [Evil]',
          level:            'Clr 1',
          components:       'V, S, M',
          casting_time:     '1 minute',
          range:            'Touch',
          target_type:      'Target',
          target:           'Flask of water touched',
          duration:         'Instantaneous',
          saving_throw:     'Will negates (object)',
          spell_resistance: 'Yes (object)',
          text:             `This spell imbues a flask (1 pint) of water with negative energy, turning it into unholy water. Unholy water damages good [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type) the way holy water damages [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) and evil [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type).`,
          component_details:'Material Component: 5 pounds of powdered silver (worth 25 gp).'
        },
        // Spells that start with D
        //Epic Spell: damnation
        'dancing lights': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dancing_Lights',
          school:           'Evocation [Light]',
          level:            'Brd 0, Sor/Wiz 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Up to four lights, all within a 10- ft.-radius area',
          duration:         '1 minute (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `Depending on the version selected, you create up to four lights that resemble lanterns or torches (and cast that amount of light), or up to four glowing spheres of light (which look like [will-o’-wisps](https://www.dandwiki.com/wiki/SRD:Will-O%27-Wisp)), or one faintly glowing, vaguely [humanoid](https://www.dandwiki.com/wiki/SRD:Humanoid_Type) shape. The *dancing lights* must stay within a 10-foot-radius area in relation to each other but otherwise move as you desire (no concentration required): forward or back, up or down, straight or turning corners, or the like. The lights can move up to 100 feet per round. A light winks out if the distance between you and it exceeds the spell’s range.
                             *Dancing lights* can be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:null
        },
        'darkness': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Darkness',
          school:           'Evocation [Darkness]',
          level:            'Asn 2, Blg 2, Brd 2, Clr 2, Sor/Wiz 2',
          components:       'V, M/DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Object touched',
          duration:         '[[10*?{Casting Level}]] level(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell causes an object to radiate shadowy illumination out to a 20-foot radius. All creatures in the area gain [concealment](https://www.dandwiki.com/wiki/SRD:Concealment) (20% miss chance). Even creatures that can normally see in such conditions (such as with darkvision or low-light vision) have the miss chance in an area shrouded in magical *darkness*.
                             Normal lights (torches, candles, lanterns, and so forth) are incapable of brightening the area, as are light spells of lower level. Higher level light spells are not affected by *darkness*.
                             If *darkness* is cast on a small object that is then placed inside or under a lightproof covering, the spell’s effect is blocked until the covering is removed.
                             *Darkness* counters or dispels any light spell of equal or lower spell level.`,
          component_details:'Arcane Material Component: A bit of bat fur and either a drop of pitch or a piece of coal.'
        },
        'darkvision': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Darkvision_%28Spell%29',
          school:           'Transmutation',
          level:            'Rgr 3, Sor/Wiz 2',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] hour(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The subject gains the ability to see 60 feet even in total darkness. Darkvision is black and white only but otherwise like normal sight. *Darkvision* does not grant one the ability to see in magical darkness.
                             *Darkvision* can be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:'Material Component: Either a pinch of dried carrot or an agate.'
        },
        'daylight': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Daylight',
          school:           'Evocation [Light]',
          level:            'Brd 3, Clr 3, Drd 3, Pal 3, Sor/Wiz 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Object touched',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `The object touched sheds light as bright as full daylight in a 60-foot radius, and dim light for an additional 60 feet beyond that. Creatures that take penalties in bright light also take them while within the radius of this magical light. Despite its name, this spell is not the equivalent of daylight for the purposes of creatures that are damaged or destroyed by bright light.
                             If *daylight* is cast on a small object that is then placed inside or under a light- proof covering, the spell’s effects are blocked until the covering is removed.
                             *Daylight* brought into an area of magical darkness (or vice versa) is temporarily negated, so that the otherwise prevailing light conditions exist in the overlapping areas of effect.
                             *Daylight* counters or dispels any darkness spell of equal or lower level, such as [*darkness*](https://www.dandwiki.com/wiki/SRD:Darkness).`,
          component_details:null
        },
        'daze': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Daze',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 0, Sor/Wiz 0',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One [humanoid](https://www.dandwiki.com/wiki/SRD:Humanoid_Type) creature of 4 HD or less',
          duration:         '1 round',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This enchantment clouds the mind of a [humanoid creature](https://www.dandwiki.com/wiki/SRD:Humanoid_Type) with 4 or fewer Hit Dice so that it takes no actions. [Humanoids](https://www.dandwiki.com/wiki/SRD:Humanoid_Type) of 5 or more HD are not affected. A [dazed](https://www.dandwiki.com/wiki/SRD:Dazed) subject is not [stunned](https://www.dandwiki.com/wiki/SRD:Stunned), so attackers get no special advantage against it.`,
          component_details:'Material Component: A pinch of wool or similar substance.'
        },
        'daze monster': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Daze_Monster',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 2, Sor/Wiz 2',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One living creature of 6 HD or less',
          duration:         '1 round',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This enchantment clouds the mind of a living creature with 6 or fewer Hit Dice so that it takes no actions. Creatures of 7 or more HD are not affected. A [dazed](https://www.dandwiki.com/wiki/SRD:Dazed) subject is not [stunned](https://www.dandwiki.com/wiki/Stunned), so attackers get no special advantage against it.`,
          component_details:'Material Component: A pinch of wool or similar substance.'
        },
        'death knell': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Death_Knell',
          school:           'Necromancy [Death, Evil]',
          level:            'Blg 2, Clr 2, Death 2',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Living creature touched',
          duration:         'Instantaneous/10 minutes per HD of subject; see text',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `You draw forth the ebbing life force of a creature and use it to fuel your own power. Upon casting this spell, you touch a living creature that has -1 or fewer hit points. If the subject fails its saving throw, it dies, and you gain 1d8 temporary hit points and a +2 \`\`bonus\`\` to Strength. Additionally, your effective caster level goes up by +1, improving spell effects dependent on caster level. (This increase in effective caster level does not grant you access to more spells.) These effects last for 10 minutes per HD of the subject creature.`,
          component_details:null
        },
        'death ward': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Death_Ward',
          school:           'Necromancy',
          level:            'Clr 4, Death 4, Drd 5, Pal 4, Repose 4',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Living creature touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The subject is immune to all death spells, magical death effects, energy drain, and any negative energy effects.
                             This spell doesn’t remove [negative levels](https://www.dandwiki.com/wiki/Energy_Drain,_Negative_Levels,_and_Level_Loss_(SRD_Special_Ability)#Negative_Levels) that the subject has already gained, nor does it affect the saving throw necessary 24 hours after gaining a negative level.
                             *Death ward* does not protect against other sorts of attacks even if those attacks might be lethal.`,
          component_details:null
        },
        'deathwatch': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Deathwatch',
          school:           'Necromancy [Evil]',
          level:            'Clr 1, Repose 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            '30 ft.',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `Using the foul sight granted by the powers of unlife, you can determine the condition of creatures near death within the spell’s range. You instantly know whether each creature within the area is [dead](https://www.dandwiki.com/wiki/SRD:Dead), fragile (alive and wounded, with 3 or fewer hit points left), fighting off death (alive with 4 or more hit points), [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type), or neither alive nor [dead](https://www.dandwiki.com/wiki/SRD:Dead) (such as a [construct](https://www.dandwiki.com/wiki/SRD:Construct_Type)).
                             *Deathwatch* sees through any spell or ability that allows creatures to feign death.`,
          component_details:null
        },
        'deep slumber': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Deep_Slumber',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Asn 3, Brd 3, Sor/Wiz 3',
          components:       'V, S, M',
          casting_time:     '1 round',
          range:            'close',
          target_type:      'Area',
          target:           'One or more living creatures within a 10-ft.-radius burst',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `A *deep slumber* spell causes a magical slumber to come upon 10 Hit Dice of creatures. Creatures with the fewest HD are affected first.
                             Among creatures with equal HD, those who are closest to the spell’s point of origin are affected first. Hit Dice that are not sufficient to affect a creature are wasted.
                             Sleeping creatures are [helpless](https://www.dandwiki.com/wiki/SRD:Helpless). Slapping or wounding awakens an affected creature, but normal noise does not. Awakening a creature is a standard action (an application of the aid another action).
                             *Deep slumber* does not target unconscious creatures, [constructs](https://www.dandwiki.com/wiki/SRD:Construct_Type), or [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creatures.`,
          component_details:'Material Component: A pinch of fine sand, rose petals, or a live cricket.'
        },
        'deeper darkness': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Deeper_Darkness',
          school:           'Evocation [Darkness]',
          level:            'Asn 3, Blg 3, Clr 3',
          components:       'V, M/DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Object touched',
          duration:         '[[?{Casting Level}]] day(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell causes an object to radiate shadowy illumination out to a 60-foot radius. All creatures in the area gain concealment (20% miss chance). Even creatures that can normally see in such conditions (such as with darkvision or low-light vision) have the miss chance in an area shrouded in magical *deeper darkness*.
                             Normal lights (torches, candles, lanterns, and so forth) are incapable of brightening the area, as are light spells of lower level. *Deeper darkness* counters and dispels any light spell of equal or lower level, including [*daylight*](https://www.dandwiki.com/wiki/SRD:Daylight) and [*light*](https://www.dandwiki.com/wiki/SRD:Light).
                             If *deeper darkness* is cast on a small object that is then placed inside or under a lightproof covering, the spell’s effect is blocked until the covering is removed.
                             [*Daylight*](https://www.dandwiki.com/wiki/SRD:Daylight) brought into an area of *deeper darkness* (or vice versa) is temporarily negated, so that the otherwise prevailing light conditions exist in the overlapping areas of effect.`,
          component_details:'Arcane Material Component: A bit of bat fur and either a drop of pitch or a piece of coal.'
        },
        'delay poison': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Delay_Poison',
          school:           'Conjuration (Healing)',
          level:            'Brd 2, Clr 2, Drd 2, Pal 2, Rgr 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] hour(s)',
          saving_throw:     'Fortitude negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The subject becomes temporarily immune to [poison](https://www.dandwiki.com/wiki/SRD:Poison). Any poison in its system or any poison to which it is exposed during the spell’s duration does not affect the subject until the spell’s duration has expired. *Delay poison* does not cure any damage that poison may have already done.`,
          component_details:null
        },
        'delayed blast fireball': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Delayed_Blast_Fireball',
          school:           'Evocation [Fire]',
          level:            'Sor/Wiz 7',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Area',
          target:           '20-ft.-radius spread',
          duration:         '5 rounds or less; see text',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `A *delayed blast fireball* spell is an explosion of flame that can detonate with a low roar up to 5 rounds after the spell is cast and deals 1d6 points of fire damage per caster level (maximum 20d6) to every creature within the area: [[[[{?{Casting Level},20}kl1]]d6]]. Unattended objects also take this damage. The explosion creates almost no pressure.
                             You point your finger and determine the range (distance and height) at which the *delayed blast fireball* is to burst. A glowing, pea-sized bead streaks from the pointing digit and, unless it impacts upon a material body or solid barrier prior to attaining the prescribed range, blossoms into the *fireball* at that point. (An early impact results in an early detonation.) If you attempt to send the bead through a narrow passage, such as through an arrow slit, you must “hit” the opening with a ranged touch attack, or else the bead strikes the barrier and detonates prematurely.
                             The glowing bead created by *delayed blast fireball* can detonate immediately if you desire, or you can choose to delay the burst for as many as 5 rounds. You select the amount of delay upon completing the spell, and that time cannot change once it has been set unless someone touches the bead (see below). If you choose a delay, the glowing bead sits at its destination until it detonates. A creature can pick up and hurl the bead as a thrown weapon (range increment 10 feet). If a creature handles and moves the bead within 1 round of its detonation, there is a 25% chance that the bead detonates while being handled.
                             The *fireball* sets fire to combustibles and damages objects in the area. It can melt metals with low melting points, such as lead, gold, copper, silver, and bronze. If the damage caused to an interposing barrier shatters or breaks through it, the *fireball* may continue beyond the barrier if the area permits; otherwise it stops at the barrier just as any other spell effect does.`,
          component_details:null
        },
        'demand': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Demand',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Charm 8, Nobility 8, Sor/Wiz 8',
          components:       'V, S, M/DF',
          casting_time:     '10 minutes',
          range:            'See text',
          target_type:      'Target',
          target:           'One creature',
          duration:         '1 round; see text',
          saving_throw:     'Will partial',
          spell_resistance: 'Yes',
          text:             `You contact a particular creature with which you are familiar and send a short message of twenty-five words or less to the subject. The subject recognizes you if it knows you. It can answer in like manner immediately. A creature with an Intelligence score as low as 1 can understand the *demand*, though the subject’s ability to react is limited as normal by its Intelligence score. Even if the *demand* is received, the subject is not obligated to act upon it in any manner.
                             If the creature in question is not on the same plane of existence as you are, there is a 5% chance that the *demand* does not arrive. (Local conditions on other planes may worsen this chance considerably.)
                             The message can also contain a [*suggestion*](https://www.dandwiki.com/wiki/SRD:Suggestion), which the subject does its best to carry out. A successful Will save negates the *suggestion* effect but not the contact itself. The *demand*, if received, is understood even if the subject’s Intelligence score is as low as 1. If the message is impossible or meaningless according to the circumstances that exist for the subject at the time the *demand* is issued, the message is understood but the *suggestion* is ineffective.
                             The *demand*’s message to the creature must be twenty-five words or less, including the *suggestion*. The creature can also give a short reply immediately.`,
          component_details:'Material Component: A short piece of copper wire and some small part of the subject—a hair, a bit of nail, or the like.'
        },
        //Epic Spell: demise unseen
        'desecrate': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Desecrate',
          school:           'Evocation [Evil]',
          level:            'Clr 2, Evil 2',
          components:       'V, S, M, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Area',
          target:           '20-ft.-radius emanation',
          duration:         '[[2*?{Casting Level}]] hour(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `This spell imbues an area with negative energy. Each Charisma check made to turn [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) within this area takes a -3 \`\`profane penalty\`\`, and every [undead creature](https://www.dandwiki.com/wiki/SRD:Undead_Type) entering a *desecrated* area gains a +1 \`\`profane bonus\`\` on attack rolls, damage rolls, and saving throws. An [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature created within or summoned into such an area gains +1 hit points per HD.
                             If the *desecrated* area contains an altar, shrine, or other permanent fixture dedicated to your deity or aligned higher power, the modifiers given above are doubled (-6 \`\`profane penalty\`\` on turning checks, +2 \`\`profane bonus\`\` and +2 hit points per HD for [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) in the area).
                             Furthermore, anyone who casts [*animate dead*](https://www.dandwiki.com/wiki/SRD:Animate_Dead) within this area may create as many as double the normal amount of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) (that is, 4 HD per caster level rather than 2 HD per caster level).
                             If the area contains an altar, shrine, or other permanent fixture of a deity, pantheon, or higher power other than your patron, the *desecrate* spell instead curses the area, cutting off its connection with the associated deity or power. This secondary function, if used, does not also grant the bonuses and penalties relating to [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type), as given above.
                             *Desecrate* counters and dispels [*consecrate*](https://www.dandwiki.com/wiki/SRD:Consecrate).`,
          component_details:'Material Component: A vial of unholy water and 25 gp worth (5 pounds) of silver dust, all of which must be sprinkled around the area.'
        },
        'destruction': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Destruction',
          school:           'Necromancy [Death]',
          level:            'Clr 7, Death 7, Repose 7',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One creature',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude partial',
          spell_resistance: 'Yes',
          text:             `This spell instantly slays the subject and consumes its remains (but not its equipment and possessions) utterly. If the target’s Fortitude saving throw succeeds, it instead takes [[10d6]] points of damage. The only way to restore life to a character who has failed to save against this spell is to use [*true resurrection*](https://www.dandwiki.com/wiki/SRD:True_Resurrection), a carefully worded [*wish*](https://www.dandwiki.com/wiki/SRD:Wish) spell followed by [*resurrection*](https://www.dandwiki.com/wiki/SRD:Resurrection), or [*miracle*](https://www.dandwiki.com/wiki/SRD:Miracle).`,
          component_details:'Focus: A special holy (or unholy) symbol of silver marked with verses of anathema (cost 500 gp).'
        },
        'detect animals or plants': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Animals_or_Plants',
          school:           'Divination',
          level:            'Drd 1, Rgr 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         'Concentration, up to [[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can detect a particular kind of [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) or [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) in a cone emanating out from you in whatever direction you face. You must think of a kind of [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) or [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) when using the spell, but you can change the [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) or [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) kind each round. The amount of information revealed depends on how long you search a particular area or focus on a specific kind of [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) or [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type).
                             *1st Round:* Presence or absence of that kind of [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) or [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) in the area.
                             *2nd Round:* Number of individuals of the specified kind in the area, and the condition of the healthiest specimen.
                             *3rd Round:* The condition (see below) and location of each individual present. If an [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) or [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) is outside your line of sight, then you discern its direction but not its exact location.
                             *Conditions:* For purposes of this spell, the categories of condition are as follows:
                             Normal: Has at least 90% of full normal hit points, free of disease.
                             Fair: 30% to 90% of full normal hit points remaining.
                             Poor: Less than 30% of full normal hit points remaining, afflicted with a disease, or suffering from a debilitating injury.
                             Weak: 0 or fewer hit points remaining, afflicted with a disease in the terminal stage, or crippled.
                             If a creature falls into more than one category, the spell indicates the weaker of the two.
                             Each round you can turn to detect a kind of [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) or [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) in a new area. The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.`,
          component_details:null
        },
        'detect chaos': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Chaos',
          school:           'Divination',
          level:            'Clr 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         'Concentration, up to [[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can sense the presence of chaos. The amount of information revealed depends on how long you study a particular area or subject.
                             *1st Round:* Presence or absence of chaos.
                             *2nd Round:* Number of chaotic auras (creatures, objects, or spells) in the area and the power of the most potent chaos aura present.
                             If you are of lawful alignment, and the strongest chaos aura’s power is overwhelming (see below), and the HD or level of the aura’s source is at least twice your character level, you are [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round and the spell ends.
                             *3rd Round:* The power and location of each aura. If an aura is outside your line of sight, then you discern its direction but not its exact location.
                             *Aura Power:* An chaos aura’s power depends on the type of chaos creature or object that you’re detecting and its HD, caster level, or (in the case of a [cleric](https://www.dandwiki.com/wiki/SRD:Cleric)) class level; see the accompanying table. If an aura falls into more than one strength category, the spell indicates the stronger of the two.

                             • Chaotic creature†(HD)
                             -- **Faint:** 10 or lower
                             -- **Moderate:** 11-25
                             -- **Strong:** 26-50
                             -- **Overwhelming:** 51 or higher
                             • [Undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) (HD)
                             -- **Faint:** 2 or lower
                             -- **Moderate:** 3-8
                             -- **Strong:** 9-20
                             -- **Overwhelming:** 21 or higher
                             • Chaotic [outsider](https://www.dandwiki.com/wiki/SRD:Outsider_Type) (HD)
                             -- **Faint:** 1 or lower
                             -- **Moderate:** 2-4
                             -- **Strong:** 5-10
                             -- **Overwhelming:** 11 or higher
                             • [Cleric](https://www.dandwiki.com/wiki/SRD:Cleric) of a chaos deity‡(class levels)
                             -- **Faint:** 1
                             -- **Moderate:** 2-4
                             -- **Strong:** 5-10
                             -- **Overwhelming:** 11 or higher
                             • Chaotic magic item or spell (caster level)
                             -- **Faint:** 2nd or lower
                             -- **Moderate:** 3rd-8th
                             -- **Strong:** 9th-20th
                             -- **Overwhelming:** 21st or higher
                             † Except for [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) and [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type), which have their own entries on the table.
                             ‡ Some characters who are not [clerics](https://www.dandwiki.com/wiki/SRD:Cleric) may radiate an aura of equivalent power. The class description will indicate whether this applies.

                             *Lingering Aura:* A chaos aura lingers after its original source dissipates (in the case of a spell) or is destroyed (in the case of a creature or magic item). If *detect chaos* is cast and directed at such a location, the spell indicates an aura strength of dim (even weaker than a faint aura). How long the aura lingers at this dim level depends on its original power:

                             • Original Strength 'Faint'
                             -- Duration of Lingering Aura: [[1d6]] round(s)
                             • Original Strength 'Moderate':
                             -- Duration of Lingering Aura: [[1d6]] minute(s)
                             • Original Strength 'Strong':
                             -- Duration of Lingering Aura: [[10*1d6]] minute(s)
                             • Original Strength 'Overwhelming':
                             -- Duration of Lingering Aura: [[1d6]] day(s)

                             [Animals](https://www.dandwiki.com/wiki/SRD:Animal_Type), [traps](https://www.dandwiki.com/wiki/SRD:Traps), [poisons](https://www.dandwiki.com/wiki/SRD:Poisons), and other potential perils are not chaos, and as such this spell does not detect them.
                             Each round, you can turn to *detect chaos* in a new area. The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.`,
          component_details:null
        },
        'detect evil': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Evil',
          school:           'Divination',
          level:            'Clr 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         'Concentration, up to [[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can sense the presence of evil. The amount of information revealed depends on how long you study a particular area or subject.
                             *1st Round:* Presence or absence of evil.
                             *2nd Round:* Number of evil auras (creatures, objects, or spells) in the area and the power of the most potent evil aura present.
                             If you are of good alignment, and the strongest evil aura’s power is overwhelming (see below), and the HD or level of the aura’s source is at least twice your character level, you are [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round and the spell ends.
                             *3rd Round:* The power and location of each aura. If an aura is outside your line of sight, then you discern its direction but not its exact location.
                             *Aura Power:* An evil aura’s power depends on the type of evil creature or object that you’re detecting and its HD, caster level, or (in the case of a [cleric](https://www.dandwiki.com/wiki/SRD:Cleric)) class level; see the accompanying table. If an aura falls into more than one strength category, the spell indicates the stronger of the two.

                             • Evil creature†(HD)
                             -- **Faint:** 10 or lower
                             -- **Moderate:** 11-25
                             -- **Strong:** 26-50
                             -- **Overwhelming:** 51 or higher
                             • [Undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) (HD)
                             -- **Faint:** 2 or lower
                             -- **Moderate:** 3-8
                             -- **Strong:** 9-20
                             -- **Overwhelming:** 21 or higher
                             • Evil [outsider](https://www.dandwiki.com/wiki/SRD:Outsider_Type) (HD)
                             -- **Faint:** 1 or lower
                             -- **Moderate:** 2-4
                             -- **Strong:** 5-10
                             -- **Overwhelming:** 11 or higher
                             • [Cleric](https://www.dandwiki.com/wiki/SRD:Cleric) of a evil deity‡(class levels)
                             -- **Faint:** 1
                             -- **Moderate:** 2-4
                             -- **Strong:** 5-10
                             -- **Overwhelming:** 11 or higher
                             • Evil magic item or spell (caster level)
                             -- **Faint:** 2nd or lower
                             -- **Moderate:** 3rd-8th
                             -- **Strong:** 9th-20th
                             -- **Overwhelming:** 21st or higher
                             † Except for [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) and [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type), which have their own entries on the table.
                             ‡ Some characters who are not [clerics](https://www.dandwiki.com/wiki/SRD:Cleric) may radiate an aura of equivalent power. The class description will indicate whether this applies.

                             *Lingering Aura:* A evil aura lingers after its original source dissipates (in the case of a spell) or is destroyed (in the case of a creature or magic item). If *detect evil* is cast and directed at such a location, the spell indicates an aura strength of dim (even weaker than a faint aura). How long the aura lingers at this dim level depends on its original power:

                             • Original Strength 'Faint'
                             -- Duration of Lingering Aura: [[1d6]] round(s)
                             • Original Strength 'Moderate':
                             -- Duration of Lingering Aura: [[1d6]] minute(s)
                             • Original Strength 'Strong':
                             -- Duration of Lingering Aura: [[10*1d6]] minute(s)
                             • Original Strength 'Overwhelming':
                             -- Duration of Lingering Aura: [[1d6]] day(s)

                             [Animals](https://www.dandwiki.com/wiki/SRD:Animal_Type), [traps](https://www.dandwiki.com/wiki/SRD:Traps), [poisons](https://www.dandwiki.com/wiki/SRD:Poisons), and other potential perils are not evil, and as such this spell does not detect them.
                             Each round, you can turn to *detect evil* in a new area. The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.`,
          component_details:null
        },
        'detect good': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Good',
          school:           'Divination',
          level:            'Clr 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         'Concentration, up to [[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can sense the presence of good. The amount of information revealed depends on how long you study a particular area or subject.
                             *1st Round:* Presence or absence of good.
                             *2nd Round:* Number of good auras (creatures, objects, or spells) in the area and the power of the most potent good aura present.
                             If you are of evil alignment, and the strongest good aura’s power is overwhelming (see below), and the HD or level of the aura’s source is at least twice your character level, you are [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round and the spell ends.
                             *3rd Round:* The power and location of each aura. If an aura is outside your line of sight, then you discern its direction but not its exact location.
                             *Aura Power:* An good aura’s power depends on the type of good creature or object that you’re detecting and its HD, caster level, or (in the case of a [cleric](https://www.dandwiki.com/wiki/SRD:Cleric)) class level; see the accompanying table. If an aura falls into more than one strength category, the spell indicates the stronger of the two.

                             • Good creature†(HD)
                             -- **Faint:** 10 or lower
                             -- **Moderate:** 11-25
                             -- **Strong:** 26-50
                             -- **Overwhelming:** 51 or higher
                             • [Undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) (HD)
                             -- **Faint:** 2 or lower
                             -- **Moderate:** 3-8
                             -- **Strong:** 9-20
                             -- **Overwhelming:** 21 or higher
                             • Good [outsider](https://www.dandwiki.com/wiki/SRD:Outsider_Type) (HD)
                             -- **Faint:** 1 or lower
                             -- **Moderate:** 2-4
                             -- **Strong:** 5-10
                             -- **Overwhelming:** 11 or higher
                             • [Cleric](https://www.dandwiki.com/wiki/SRD:Cleric) of a good deity‡(class levels)
                             -- **Faint:** 1
                             -- **Moderate:** 2-4
                             -- **Strong:** 5-10
                             -- **Overwhelming:** 11 or higher
                             • Good magic item or spell (caster level)
                             -- **Faint:** 2nd or lower
                             -- **Moderate:** 3rd-8th
                             -- **Strong:** 9th-20th
                             -- **Overwhelming:** 21st or higher
                             † Except for [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) and [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type), which have their own entries on the table.
                             ‡ Some characters who are not [clerics](https://www.dandwiki.com/wiki/SRD:Cleric) may radiate an aura of equivalent power. The class description will indicate whether this applies.

                             *Lingering Aura:* A good aura lingers after its original source dissipates (in the case of a spell) or is destroyed (in the case of a creature or magic item). If *detect good* is cast and directed at such a location, the spell indicates an aura strength of dim (even weaker than a faint aura). How long the aura lingers at this dim level depends on its original power:

                             • Original Strength 'Faint'
                             -- Duration of Lingering Aura: [[1d6]] round(s)
                             • Original Strength 'Moderate':
                             -- Duration of Lingering Aura: [[1d6]] minute(s)
                             • Original Strength 'Strong':
                             -- Duration of Lingering Aura: [[10*1d6]] minute(s)
                             • Original Strength 'Overwhelming':
                             -- Duration of Lingering Aura: [[1d6]] day(s)

                             [Animals](https://www.dandwiki.com/wiki/SRD:Animal_Type), [traps](https://www.dandwiki.com/wiki/SRD:Traps), [poisons](https://www.dandwiki.com/wiki/SRD:Poisons), and other potential perils are not good, and as such this spell does not detect them.
                             Each round, you can turn to *detect good* in a new area. The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.`,
          component_details:null
        },
        'detect law': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Law',
          school:           'Divination',
          level:            'Clr 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         'Concentration, up to [[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can sense the presence of lawful. The amount of information revealed depends on how long you study a particular area or subject.
                             *1st Round:* Presence or absence of lawful.
                             *2nd Round:* Number of lawful auras (creatures, objects, or spells) in the area and the power of the most potent lawful aura present.
                             If you are of chaotic alignment, and the strongest lawful aura’s power is overwhelming (see below), and the HD or level of the aura’s source is at least twice your character level, you are [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round and the spell ends.
                             *3rd Round:* The power and location of each aura. If an aura is outside your line of sight, then you discern its direction but not its exact location.
                             *Aura Power:* An lawful aura’s power depends on the type of lawful creature or object that you’re detecting and its HD, caster level, or (in the case of a [cleric](https://www.dandwiki.com/wiki/SRD:Cleric)) class level; see the accompanying table. If an aura falls into more than one strength category, the spell indicates the stronger of the two.

                             • Lawful creature†(HD)
                             -- **Faint:** 10 or lower
                             -- **Moderate:** 11-25
                             -- **Strong:** 26-50
                             -- **Overwhelming:** 51 or higher
                             • [Undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) (HD)
                             -- **Faint:** 2 or lower
                             -- **Moderate:** 3-8
                             -- **Strong:** 9-20
                             -- **Overwhelming:** 21 or higher
                             • Lawful [outsider](https://www.dandwiki.com/wiki/SRD:Outsider_Type) (HD)
                             -- **Faint:** 1 or lower
                             -- **Moderate:** 2-4
                             -- **Strong:** 5-10
                             -- **Overwhelming:** 11 or higher
                             • [Cleric](https://www.dandwiki.com/wiki/SRD:Cleric) of a lawful deity‡(class levels)
                             -- **Faint:** 1
                             -- **Moderate:** 2-4
                             -- **Strong:** 5-10
                             -- **Overwhelming:** 11 or higher
                             • Lawful magic item or spell (caster level)
                             -- **Faint:** 2nd or lower
                             -- **Moderate:** 3rd-8th
                             -- **Strong:** 9th-20th
                             -- **Overwhelming:** 21st or higher
                             † Except for [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) and [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type), which have their own entries on the table.
                             ‡ Some characters who are not [clerics](https://www.dandwiki.com/wiki/SRD:Cleric) may radiate an aura of equivalent power. The class description will indicate whether this applies.

                             *Lingering Aura:* A lawful aura lingers after its original source dissipates (in the case of a spell) or is destroyed (in the case of a creature or magic item). If *detect law* is cast and directed at such a location, the spell indicates an aura strength of dim (even weaker than a faint aura). How long the aura lingers at this dim level depends on its original power:

                             • Original Strength 'Faint'
                             -- Duration of Lingering Aura: [[1d6]] round(s)
                             • Original Strength 'Moderate':
                             -- Duration of Lingering Aura: [[1d6]] minute(s)
                             • Original Strength 'Strong':
                             -- Duration of Lingering Aura: [[10*1d6]] minute(s)
                             • Original Strength 'Overwhelming':
                             -- Duration of Lingering Aura: [[1d6]] day(s)

                             [Animals](https://www.dandwiki.com/wiki/SRD:Animal_Type), [traps](https://www.dandwiki.com/wiki/SRD:Traps), [poisons](https://www.dandwiki.com/wiki/SRD:Poisons), and other potential perils are not lawful, and as such this spell does not detect them.
                             Each round, you can turn to *detect law* in a new area. The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.`,
          component_details:null
        },
        'detect magic': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Magic',
          school:           'Divination',
          level:            'Brd 0, Clr 0, Drd 0, Sor/Wiz 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         'Concentration, up to [[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You detect magical auras. The amount of information revealed depends on how long you study a particular area or subject.
                             *1st Round:* Presence or absence of magical auras.
                             *2nd Round:* Number of different magical auras and the power of the most potent aura.
                             *3rd Round:* The strength and location of each aura. If the items or creatures bearing the auras are in line of sight, you can make Spellcraft skill checks to determine the school of magic involved in each. (Make one check per aura; DC 15 + spell level, or 15 + half caster level for a nonspell effect.)
                             Magical areas, multiple types of magic, or strong local magical emanations may distort or conceal weaker auras.
                             *Aura Strength:* An aura’s power depends on a spell’s functioning spell level or an item’s caster level. If an aura falls into more than one category, *detect magic* indicates the stronger of the two.

                             • Functioning spell (spell level)
                             -- **Faint:** 3rd or lower
                             -- **Moderate:** 4th-6th
                             -- **Strong:** 7th-9th
                             -- **Overwhelming:** 10th+ (deity-level)
                             • Magic item (caster level)
                             -- **Faint:** 5th or lower
                             -- **Moderate:** 6th-11th
                             -- **Strong:** 12th-20th
                             -- **Overwhelming:** 21st+ (artifact)

                             *Lingering Aura:* A magical aura lingers after its original source dissipates (in the case of a spell) or is destroyed (in the case of a magic item). If *detect magic* is cast and directed at such a location, the spell indicates an aura strength of dim (even weaker than a faint aura). How long the aura lingers at this dim level depends on its original power:

                             • Original Strength 'Faint'
                             -- Duration of Lingering Aura: [[1d6]] round(s)
                             • Original Strength 'Moderate':
                             -- Duration of Lingering Aura: [[1d6]] minute(s)
                             • Original Strength 'Strong':
                             -- Duration of Lingering Aura: [[10*1d6]] minute(s)
                             • Original Strength 'Overwhelming':
                             -- Duration of Lingering Aura: [[1d6]] day(s)

                             [Outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type) and [elementals](https://www.dandwiki.com/wiki/SRD:Elemental_Type) are not magical in themselves, but if they are summoned, the conjuration spell registers.
                             Each round, you can turn to *detect magic* in a new area. The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.
                             *Detect magic* can be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:null
        },
        'detect poison': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Poison',
          school:           'Divination',
          level:            'Asn 1, Clr 0, Drd 0, Pal 1, Rgr 1, Sor/Wiz 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target, or Area',
          target:           'One creature, one object, or a 5-ft. cube',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You determine whether a creature, object, or area has been poisoned or is poisonous. You can determine the exact type of poison with a DC 20 Wisdom check. A character with the Craft (alchemy) skill may try a DC 20 Craft (alchemy) check if the Wisdom check fails, or may try the Craft (alchemy) check prior to the Wisdom check.
                             The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.`,
          component_details:null
        },
        'detect scrying': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Scrying',
          school:           'Divination',
          level:            'Brd 4, Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            '40 ft.',
          target_type:      'Area',
          target:           '40-ft.-radius emanation centered on you',
          duration:         '24 hours',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You immediately become aware of any attempt to observe you by means of a [divination (scrying)](https://www.dandwiki.com/wiki/SRD:Scrying_Subschool) spell or effect. The spell’s area radiates from you and moves as you move. You know the location of every magical sensor within the spell’s area.
                             If the scrying attempt originates within the area, you also know its location; otherwise, you and the scrier immediately make opposed caster level checks (1d20 + caster level). If you at least match the scrier’s result, you get a visual image of the scrier and an accurate sense of his or her direction and distance from you.`,
          component_details:'Material Component: A small piece of mirror and a miniature brass hearing trumpet.'
        },
        'detect secret doors': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Secret_Doors',
          school:           'Divination',
          level:            'Brd 1, Knowledge 1, Sor/Wiz 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         'Concentration, up to [[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can detect secret doors, compartments, caches, and so forth. Only passages, doors, or openings that have been specifically constructed to escape detection are detected by this spell. The amount of information revealed depends on how long you study a particular area or subject.
                             *1st Round:* Presence or absence of secret doors.
                             *2nd Round:* Number of secret doors and the location of each. If an aura is outside your line of sight, then you discern its direction but not its exact location.
                             *Each Additional Round:* The mechanism or trigger for one particular secret portal closely examined by you. Each round, you can turn to *detect secret doors* in a new area. The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.`,
          component_details:null
        },
        'detect snares and pits': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Snares_and_Pits',
          school:           'Divination',
          level:            'Drd 1, Rgr 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         'Concentration, up to [[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can detect simple pits, deadfalls, and snares as well as mechanical [traps](https://www.dandwiki.com/wiki/SRD:Traps) constructed of natural materials. The spell does not detect complex traps, including trapdoor traps.
                             *Detect snares and pits* does detect certain natural hazards—quicksand (a snare), a sinkhole (a pit), or unsafe walls of natural rock (a deadfall). However, it does not reveal other potentially dangerous conditions. The spell does not detect magic traps (except those that operate by pit, deadfall, or snaring; see the spell [*snare*](https://www.dandwiki.com/wiki/SRD:Snare)), nor mechanically complex ones, nor those that have been rendered safe or inactive.
                             The amount of information revealed depends on how long you study a particular area.
                             *1st Round:* Presence or absence of hazards.
                             *2nd Round:* Number of hazards and the location of each. If a hazard is outside your line of sight, then you discern its direction but not its exact location.
                             *Each Additional Round:* The general type and trigger for one particular hazard closely examined by you.
                             Each round, you can turn to *detect snares* and pits in a new area. The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.`,
          component_details:null
        },
        'detect thoughts': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Thoughts',
          school:           'Divination [Mind-Affecting]',
          level:            'Brd 2, Knowledge 2, Mind 2, Sor/Wiz 2',
          components:       'V, S, F/DF',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         'Concentration, up to [[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'No',
          text:             `You detect surface thoughts. The amount of information revealed depends on how long you study a particular area or subject.
                             *1st Round:* Presence or absence of thoughts (from conscious creatures with Intelligence scores of 1 or higher).
                             *2nd Round:* Number of thinking minds and the Intelligence score of each. If the highest Intelligence is 26 or higher (and at least 10 points higher than your own Intelligence score), you are [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round and the spell ends. This spell does not let you determine the location of the thinking minds if you can’t see the creatures whose thoughts you are detecting.
                             *3rd Round:* Surface thoughts of any mind in the area. A target’s Will save prevents you from reading its thoughts, and you must cast detect thoughts again to have another chance. Creatures of [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type) intelligence (Int 1 or 2) have simple, instinctual thoughts that you can pick up.
                             Each round, you can turn to *detect thoughts* in a new area. The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.`,
          component_details:'Arcane Focus: A copper piece.'
        },
        'detect undead': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Detect_Undead',
          school:           'Divination',
          level:            'Clr 1, Pal 1, Sor/Wiz 1',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped emanation',
          duration:         'Concentration, up to [[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can detect the aura that surrounds [undead creatures](https://www.dandwiki.com/wiki/SRD:Undead_Type). The amount of information revealed depends on how long you study a particular area.
                             *1st Round:* Presence or absence of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) auras.
                             *2nd Round:* Number of [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) auras in the area and the strength of the strongest [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) aura present. If you are of good alignment, and the strongest [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) aura’s strength is overwhelming (see below), and the creature has HD of at least twice your character level, you are [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round and the spell ends.
                             *3rd Round:* The strength and location of each [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) aura. If an aura is outside your line of sight, then you discern its direction but not its exact location.
                             *Aura Strength:* The strength of an [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) aura is determined by the HD of the [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature, as given on the following table:

                             • 1 or lower HD
                             -- Faint
                             • 2-4 HD
                             -- Moderate
                             • 5-10 HD
                             -- Strong
                             • 11 or higher HD
                             -- OVerwhelming

                             *Lingering Aura:* An [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) aura lingers after its original source is destroyed. If *detect undead* is cast and directed at such a location, the spell indicates an aura strength of dim (even weaker than a faint aura). How long the aura lingers at this dim level depends on its original power:

                             • Original Strength 'Faint'
                             -- Duration of Lingering Aura: [[1d6]] round(s)
                             • Original Strength 'Moderate'
                             -- Duration of Lingering Aura: [[1d6]] minute(s)
                             • Original Strength 'Strong'
                             -- Duration of Lingering Aura: [[10*1d6]] minutes(s)
                             • Original Strength 'Overwhelming'
                             -- Duration of Lingering Aura: [[1d6]] day(s)

                             Each round, you can turn to *detect undead* in a new area. The spell can penetrate barriers, but 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt blocks it.`,
          component_details:'Arcane Material Component: A bit of earth from a grave.'
        },
        'dictum': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dictum',
          school:           'Evocation [Lawful, Sonic]',
          level:            'Clr 7, Law 7',
          components:       'V',
          casting_time:     '1 standard action',
          range:            '40 ft.',
          target_type:      'Area',
          target:           'Nonlawful creatures in a 40-ft.-radius spread centered on you',
          duration:         'Instantaneous',
          saving_throw:     'None or Will negates; see text',
          spell_resistance: 'Yes',
          text:             `Any nonlawful creature within the area of a *dictum* spell suffers the following ill effects.

                             • HD Equal to caster level
                             -- [Deafened](https://www.dandwiki.com/wiki/SRD:Deafened)
                             • HD Up to caster level - 1
                             -- [*Slowed*](https://www.dandwiki.com/wiki/SRD:Slow),[deafened](https://www.dandwiki.com/wiki/SRD:Deafened)
                             • HD Up to caster level - 5
                             -- [Paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed),[*slowed*](https://www.dandwiki.com/wiki/SRD:Slow),[deafened](https://www.dandwiki.com/wiki/SRD:Deafened)
                             • HD Up to caster level - 10
                             -- [Killed](https://www.dandwiki.com/wiki/SRD:Dead),[paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed),[*slowed*](https://www.dandwiki.com/wiki/SRD:Slow),[deafened](https://www.dandwiki.com/wiki/SRD:Deafened)

                             The effects are cumulative and concurrent. No saving throw is allowed against these effects.
                             *[Deafened](https://www.dandwiki.com/wiki/SRD:Deafened):* The creature is [deafened](https://www.dandwiki.com/wiki/SRD:Deafened) for [[1d4]] rounds.
                             *[Slowed](https://www.dandwiki.com/wiki/SRD:Slow):* The creature is *slowed*, as by the [*slow*](https://www.dandwiki.com/wiki/SRD:Slow) spell, for [[2d4]] rounds.
                             *[Paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed):* The creature is [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed) and [helpless](https://www.dandwiki.com/wiki/SRD:Helpless) for [[1d10]] minutes.
                             *[Killed](https://www.dandwiki.com/wiki/SRD:Dead):* Living creatures die. [Undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creatures are destroyed.
                             Furthermore, if you are on your home plane when you cast this spell, nonlawful extraplanar creatures within the area are instantly banished back to their home planes. Creatures so banished cannot return for at least 24 hours. This effect takes place regardless of whether the creatures hear the *dictum*. The banishment effect allows a Will save (at a -4 \`\`penalty\`\`) to negate.
                             Creatures whose HD exceed your caster level are unaffected by *dictum*.`,
          component_details:null
        },
        'dimension door': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dimension_Door',
          school:           'Conjuration (Teleportation)',
          level:            'Asn 4, Brd 4, Sor/Wiz 4, Travel 4',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Target',
          target:           'You and touched objects or other touched willing creatures',
          duration:         'Instantaneous',
          saving_throw:     'None and Will negates (object)',
          spell_resistance: 'No and Yes (object)',
          text:             `You instantly transfer yourself from your current location to any other spot within range. You always arrive at exactly the spot desired—whether by simply visualizing the area or by stating direction. After using this spell, you can’t take any other actions until your next turn. You can bring along objects as long as their weight doesn’t exceed your maximum load. You may also bring one additional willing Medium or smaller creature (carrying gear or objects up to its maximum load) or its equivalent per three caster levels. A Large creature counts as two Medium creatures, a Huge creature counts as two Large creatures, and so forth. All creatures to be transported must be in contact with one another, and at least one of those creatures must be in contact with you.
                             If you arrive in a place that is already occupied by a solid body, you and each creature traveling with you take [[1d6]] points of damage and are shunted to a random open space on a suitable surface within 100 feet of the intended location.
                             If there is no free space within 100 feet, you and each creature traveling with you take an additional [[2d6]] points of damage and are shunted to a free space within 1,000 feet. If there is no free space within 1,000 feet, you and each creature travelling with you take an additional [[4d6]] points of damage and the spell simply fails.`,
          component_details:null
        },
        'dimensional anchor': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dimensional_Anchor',
          school:           'Abjuration',
          level:            'Clr 4, Sor/Wiz 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Ray',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes (object)',
          text:             `A green ray springs from your outstretched hand. You must make a ranged touch attack to hit the target. Any creature or object struck by the ray is covered with a shimmering emerald field that completely blocks extradimensional travel. Forms of movement barred by a *dimensional anchor* include [*astral projection*](https://www.dandwiki.com/wiki/SRD:Astral_Projection), [*blink*](https://www.dandwiki.com/wiki/SRD:Blink), [*dimension door*](https://www.dandwiki.com/wiki/SRD:Dimension_Door), [*ethereal jaunt*](https://www.dandwiki.com/wiki/SRD:Ethereal_Jaunt), [*etherealness*](https://www.dandwiki.com/wiki/SRD:Etherealness_%28Spell%29), [*gate*](https://www.dandwiki.com/wiki/SRD:Gate), [*maze*](https://www.dandwiki.com/wiki/SRD:Maze), [*plane shift*](https://www.dandwiki.com/wiki/SRD:Plane_Shift), [*shadow walk*](https://www.dandwiki.com/wiki/SRD:Shadow_Walk), [*teleport*](https://www.dandwiki.com/wiki/SRD:Teleport), and similar spell-like or psionic abilities. The spell also prevents the use of a [*gate*](https://www.dandwiki.com/wiki/SRD:Gate) or [*teleportation circle*](https://www.dandwiki.com/wiki/SRD:Teleportation_Circle) for the duration of the spell.
                             A *dimensional anchor* does not interfere with the movement of creatures already in ethereal or astral form when the spell is cast, nor does it block extradimensional perception or attack forms. Also, *dimensional anchor* does not prevent summoned creatures from disappearing at the end of a summoning spell.`,
          component_details:null
        },
        'dimensional lock': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dimensional_Lock',
          school:           'Abjuration',
          level:            'Clr 8, Sor/Wiz 8',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Area',
          target:           '20-ft.-radius emanation centered on a point in space',
          duration:         '[[?{Casting Level}]] day(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `You create a shimmering emerald barrier that completely blocks extradimensional travel. Forms of movement barred include [*astral projection*](https://www.dandwiki.com/wiki/SRD:Astral_Projection), [*blink*](https://www.dandwiki.com/wiki/SRD:Blink), [*dimension door*](https://www.dandwiki.com/wiki/SRD:Dimension_Door), [*ethereal jaunt*](https://www.dandwiki.com/wiki/SRD:Ethereal_Jaunt), [*etherealness*](https://www.dandwiki.com/wiki/SRD:Etherealness_%28Spell%29), [*gate*](https://www.dandwiki.com/wiki/SRD:Gate), [*maze*](https://www.dandwiki.com/wiki/SRD:Maze), [*plane shift*](https://www.dandwiki.com/wiki/SRD:Plane_Shift), [*shadow walk*](https://www.dandwiki.com/wiki/SRD:Shadow_Walk), [*teleport*](https://www.dandwiki.com/wiki/SRD:Teleport), and similar spell-like or psionic abilities. Once *dimensional lock* is in place, extradimensional travel into or out of the area is not possible.
                             A *dimensional lock* does not interfere with the movement of creatures already in ethereal or astral form when the spell is cast, nor does it block extradimensional perception or attack forms. Also, the spell does not prevent summoned creatures from disappearing at the end of a summoning spell.`,
          component_details:null
        },
        'diminish plants': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Diminish_Plants',
          school:           'Transmutation',
          level:            'Drd 3, Rgr 3',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'See text',
          target_type:      'Target, or Area',
          target:           'See text',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell has two versions.
                             *Prune Growth:* This version causes normal vegetation within [[400+(40*[[?{Casting Level}]])]] ft. to shrink to about one-third of their normal size, becoming untangled and less bushy. The affected vegetation appears to have been carefully pruned and trimmed.
                             At your option, the area can be a 100-foot-radius circle, a 150-foot-radius semicircle, or a 200-foot-radius quarter-circle.
                             You may also designate portions of the area that are not affected.
                             *Stunt Growth:* This version targets normal plants within a range of 1/2 mile, reducing their potential productivity over the course of the following year to one third below normal.
                             *Diminish plants* counters *plant growth*.
                             This spell has no effect on [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) creatures.`,
          component_details:null
        },
        //Epic Spell: dire winter
        'discern lies': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Discern_Lies',
          school:           'Divination',
          level:            'Clr 4, Mind 4, Nobility 4, Pal 3',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] creature(s), no two of which can be more than 30 ft. apart',
          duration:         'Concentration, up to [[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'No',
          text:             `Each round, you concentrate on one subject, who must be within range. You know if the subject deliberately and knowingly speaks a lie by discerning disturbances in its aura caused by lying. The spell does not reveal the truth, uncover unintentional inaccuracies, or necessarily reveal evasions.
                             Each round, you may concentrate on a different subject.`,
          component_details:null
        },
        'discern location': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Discern_Location',
          school:           'Divination',
          level:            'Clr 8, Knowledge 8, Sor/Wiz 8',
          components:       'V, S, DF',
          casting_time:     '10 minutes',
          range:            'Unlimited',
          target_type:      'Target',
          target:           'One creature or object',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `A *discern location* spell is among the most powerful means of locating creatures or objects. Nothing short of a [*mind blank*](https://www.dandwiki.com/wiki/SRD:Mind_Blank) spell or the direct intervention of a deity keeps you from learning the exact location of a single individual or object. *Discern location* circumvents normal means of protection from scrying or location. The spell reveals the name of the creature or object’s location (place, name, business name, building name, or the like), community, county (or similar political division), country, continent, and the plane of existence where the target lies.
                             To find a creature with the spell, you must have seen the creature or have some item that once belonged to it. To find an object, you must have touched it at least once.`,
          component_details:null
        },
        'disguise self': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Disguise_Self',
          school:           'Illusion (Glamer)',
          level:            'Asn 1, Brd 1, Sor/Wiz 1, Trickery 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          text:             `You make yourself—including clothing, armor, weapons, and equipment—look different. You can seem 1 foot shorter or taller, thin, fat, or in between. You cannot change your body type. Otherwise, the extent of the apparent change is up to you. You could add or obscure a minor feature or look like an entirely different person.
                             The spell does not provide the abilities or mannerisms of the chosen form, nor does it alter the perceived tactile (touch) or audible (sound) properties of you or your equipment.
                             If you use this spell to create a disguise, you get a +10 \`\`bonus\`\` on the Disguise check.
                             A creature that interacts with the glamer gets a Will save to recognize it as an illusion.`,
          component_details:null
        },
        'disintegrate': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Disintegrate',
          school:           'Transmutation',
          level:            'Destruction 7, Sor/Wiz 6',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Ray',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude partial (object)',
          spell_resistance: 'Yes',
          text:             `A thin, green ray springs from your pointing finger. You must make a successful ranged touch attack to hit. Any creature struck by the ray takes 2d6 points of damage per caster level (to a maximum of 40d6): [[[[{2*?{Casting Level},40}kl1]]d6]]. Any creature reduced to 0 or fewer hit points by this spell is entirely disintegrated, leaving behind only a trace of fine dust. A disintegrated creature’s equipment is unaffected.
                             When used against an object, the ray simply disintegrates as much as one 10-foot cube of nonliving matter. Thus, the spell disintegrates only part of any very large object or structure targeted. The ray affects even objects constructed entirely of force, such as [*forceful hand*](https://www.dandwiki.com/wiki/SRD:Forceful_Hand) or a [*wall of force*](https://www.dandwiki.com/wiki/SRD:Wall_of_Force), but not magical effects such as a [*globe of invulnerability*](https://www.dandwiki.com/wiki/SRD:Globe_of_Invulnerability) or an [*antimagic field*](https://www.dandwiki.com/wiki/SRD:Antimagic_Field).
                             A creature or object that makes a successful Fortitude save is partially affected, taking only [[5d6]] points of damage. If this damage reduces the creature or object to 0 or fewer hit points, it is entirely disintegrated.
                             Only the first creature or object struck can be affected; that is, the ray affects only one target per casting.`,
          component_details:'Arcane Material Component: A lodestone and a pinch of dust.'
        },
        'dismissal': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dismissal',
          school:           'Abjuration',
          level:            'Clr 4, Sor/Wiz 5',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One extraplanar creature',
          duration:         'Instantaneous',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `This spell forces an [extraplanar](https://www.dandwiki.com/wiki/SRD:Outsider_Type) creature back to its proper plane if it fails a special Will save (DC=spell’s save DC - creature’s HD + your caster level). If the spell is successful, the creature is instantly whisked away, but there is a 20% chance of actually sending the subject to a plane other than its own.`,
          component_details:null
        },
        'dispel chaos': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dispel_Chaos',
          school:           'Abjuration [Lawful]',
          level:            'Clr 5, Law 5, Pal 4',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           'You and a touched chaotic creature from another plane; or you and an enchantment or chaotic spell on a touched creature or object',
          duration:         '[[?{Casting Level}]] round(s) or until discharged, whichever comes first',
          saving_throw:     'See text',
          spell_resistance: 'See text',
          text:             `You are surrounded by constant, blue, lawful energy.
                             First, you gain a +4 \`\`deflection bonus\`\` to AC against attacks by [chaotic creatures](https://www.dandwiki.com/wiki/SRD:Chaotic_Creatures).
                             Second, on making a successful melee touch attack against an [chaotic creature](https://www.dandwiki.com/wiki/SRD:Chaotic_Creatures) from another plane, you can choose to drive that creature back to its home plane. The creature can negate the effects with a successful Will save (spell resistance applies). This use discharges and ends the spell.
                             Third, with a touch you can automatically dispel any one enchantment spell cast by an chaotic creature or any one chaotic spell. *Exception:* Spells that can’t be dispelled by [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) also can’t be dispelled by *dispel chaos*. Saving throws and spell resistance do not apply to this effect. This use discharges and ends the spell.`,
          component_details:null
        },
        'dispel evil': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dispel_Evil',
          school:           'Abjuration [Good]',
          level:            'Clr 5, Good 5, Pal 4',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           'You and a touched evil creature from another plane; or you and an enchantment or evil spell on a touched creature or object',
          duration:         '[[?{Casting Level}]] round(s) or until discharged, whichever comes first',
          saving_throw:     'See text',
          spell_resistance: 'See text',
          text:             `Shimmering, white, holy energy surrounds you. This power has three effects.
                             First, you gain a +4 \`\`deflection bonus\`\` to AC against attacks by [evil creatures](https://www.dandwiki.com/wiki/SRD:Evil_Creatures).
                             Second, on making a successful melee touch attack against an [evil creature](https://www.dandwiki.com/wiki/SRD:Evil_Creatures) from another plane, you can choose to drive that creature back to its home plane. The creature can negate the effects with a successful Will save (spell resistance applies). This use discharges and ends the spell.
                             Third, with a touch you can automatically dispel any one enchantment spell cast by an evil creature or any one evil spell. *Exception:* Spells that can’t be dispelled by [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) also can’t be dispelled by *dispel evil*. Saving throws and spell resistance do not apply to this effect. This use discharges and ends the spell.`,
          component_details:null
        },
        'dispel good': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dispel_Good',
          school:           'Abjuration [Evil]',
          level:            'Clr 5, Evil 5',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           'You and a touched good creature from another plane; or you and an enchantment or good spell on a touched creature or object',
          duration:         '[[?{Casting Level}]] round(s) or until discharged, whichever comes first',
          saving_throw:     'See text',
          spell_resistance: 'See text',
          text:             `You are surrounded by dark, wavering, unholy energy.
                             First, you gain a +4 \`\`deflection bonus\`\` to AC against attacks by [good creatures](https://www.dandwiki.com/wiki/SRD:Good_Creatures).
                             Second, on making a successful melee touch attack against an [good creature](https://www.dandwiki.com/wiki/SRD:Good_Creatures) from another plane, you can choose to drive that creature back to its home plane. The creature can negate the effects with a successful Will save (spell resistance applies). This use discharges and ends the spell.
                             Third, with a touch you can automatically dispel any one enchantment spell cast by an good creature or any one good spell. *Exception:* Spells that can’t be dispelled by [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) also can’t be dispelled by *dispel good*. Saving throws and spell resistance do not apply to this effect. This use discharges and ends the spell.`,
          component_details:null
        },
        'dispel law': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dispel_Law',
          school:           'Abjuration [Chaotic]',
          level:            'Chaos 5, Clr 5',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           'You and a touched lawful creature from another plane; or you and an enchantment or lawful spell on a touched creature or object',
          duration:         '[[?{Casting Level}]] round(s) or until discharged, whichever comes first',
          saving_throw:     'See text',
          spell_resistance: 'See text',
          text:             `You are surrounded by flickering, yellow, chaotic energy.
                             First, you gain a +4 \`\`deflection bonus\`\` to AC against attacks by [lawful creatures](https://www.dandwiki.com/wiki/SRD:Lawful_Creatures).
                             Second, on making a successful melee touch attack against an [lawful creature](https://www.dandwiki.com/wiki/SRD:Lawful_Creatures) from another plane, you can choose to drive that creature back to its home plane. The creature can negate the effects with a successful Will save (spell resistance applies). This use discharges and ends the spell.
                             Third, with a touch you can automatically dispel any one enchantment spell cast by an lawful creature or any one lawful spell. *Exception:* Spells that can’t be dispelled by [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) also can’t be dispelled by *dispel law*. Saving throws and spell resistance do not apply to this effect. This use discharges and ends the spell.`,
          component_details:null
        },
        'dispel magic': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dispel_Magic',
          school:           'Abjuration',
          level:            'Brd 3, Clr 3, Drd 4, Magic 3, Pal 3, Sor/Wiz 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target, or Area',
          target:           'One spellcaster, creature, or object; or 20-ft.-radius burst',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can use *dispel magic* to end ongoing spells that have been cast on a creature or object, to temporarily suppress the magical abilities of a magic item, to end ongoing spells (or at least their effects) within an area, or to counter another spellcaster’s spell. A dispelled spell ends as if its duration had expired. Some spells, as detailed in their descriptions, can’t be defeated by *dispel magic*. *Dispel magic* can dispel (but not counter) spell-like effects just as it does spells.
                             *Note:* The effect of a spell with an instantaneous duration can’t be dispelled, because the magical effect is already over before the *dispel magic* can take effect.
                             You choose to use *dispel magic* in one of three ways: a targeted dispel, an area dispel, or a counterspell:
                             *Targeted Dispel:* One object, creature, or spell is the target of the *dispel magic* spell. You make a dispel check (1d20 + your caster level, maximum +10) against the spell or against each ongoing spell currently in effect on the object or creature. The DC for this dispel check is 11 + the spell’s caster level. If you succeed on a particular check, that spell is dispelled; if you fail, that spell remains in effect.
                             If you target an object or creature that is the effect of an ongoing spell (such as a monster summoned by [monster summoning](https://www.dandwiki.com/wiki/SRD:Summon_Monster_I)), you make a dispel check to end the spell that conjured the object or creature.
                             If the object that you target is a magic item, you make a dispel check against the item’s caster level. If you succeed, all the item’s magical properties are suppressed for 1d4 rounds, after which the item recovers on its own. A suppressed item becomes nonmagical for the duration of the effect. An interdimensional interface (such as a *bag of holding*) is temporarily closed. A magic item’s physical properties are unchanged: A suppressed magic sword is still a sword (a masterwork sword, in fact). Artifacts and deities are unaffected by mortal magic such as this.
                             You automatically succeed on your dispel check against any spell that you cast yourself.
                             *Area Dispel:* When *dispel magic* is used in this way, the spell affects everything within a 20-foot radius.
                             For each creature within the area that is the subject of one or more spells, you make a dispel check against the spell with the highest caster level. If that check fails, you make dispel checks against progressively weaker spells until you dispel one spell (which discharges the *dispel magic* spell so far as that target is concerned) or until you fail all your checks. The creature’s magic items are not affected.
                             For each object within the area that is the target of one or more spells, you make dispel checks as with creatures. Magic items are not affected by an area dispel.
                             For each ongoing area or effect spell whose point of origin is within the area of the *dispel magic* spell, you can make a dispel check to dispel the spell.
                             For each ongoing spell whose area overlaps that of the *dispel magic* spell, you can make a dispel check to end the effect, but only within the overlapping area.
                             If an object or creature that is the effect of an ongoing spell (such as a monster summoned by [monster summoning](https://www.dandwiki.com/wiki/SRD:Summon_Monster_I)) is in the area, you can make a dispel check to end the spell that conjured that object or creature (returning it whence it came) in addition to attempting to dispel spells targeting the creature or object.
                             You may choose to automatically succeed on dispel checks against any spell that you have cast.
                             *Counterspell:* When dispel magic* is used in this way, the spell targets a spellcaster and is cast as a counterspell. Unlike a true counterspell, however, *dispel magic* may not work; you must make a dispel check to counter the other spellcaster’s spell.`,
          component_details:null
        },
        'displacement': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Displacement',
          school:           'Illusion (Glamer)',
          level:            'Brd 3, Sor/Wiz 3',
          components:       'V, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The subject of this spell appears to be about 2 feet away from its true location. The creature benefits from a 50% miss chance as if it had [total concealment](https://www.dandwiki.com/wiki/SRD:Concealment). However, unlike actual total concealment, *displacement* does not prevent enemies from targeting the creature normally. [*True seeing*](https://www.dandwiki.com/wiki/SRD:True_Seeing) reveals its true location.`,
          component_details:'Material Component: A small strip of leather twisted into a loop.'
        },
        'disrupt undead': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Disrupt_Undead',
          school:           'Necromancy',
          level:            'Glory 1, Sor/Wiz 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'Ray',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `You direct a ray of positive energy. You must make a ranged [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack) to hit, and if the ray hits an [undead creature](https://www.dandwiki.com/wiki/SRD:Undead_Type), it deals [[1d6]] points of damage to it.`,
          component_details:null
        },
        'disrupting weapon': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Disrupting_Weapon',
          school:           'Transmutation',
          level:            'Clr 5',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           'One melee weapon',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates (harmless, object); see text',
          spell_resistance: 'Yes (harmless, object)',
          text:             `This spell makes a melee weapon deadly to [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type). Any [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature with HD equal to or less than your caster level must succeed on a Will save or be destroyed utterly if struck in combat with this weapon. Spell resistance does not apply against the destruction effect.`,
          component_details:null
        },
        'divination': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Divination',
          school:           'Divination',
          level:            'Clr 4, Knowledge 4',
          components:       'V, S, M',
          casting_time:     '10 minutes',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         'Instantaneous',
          text:             `Similar to [*augury*](https://www.dandwiki.com/wiki/SRD:Augury) but more powerful, a *divination* spell can provide you with a useful piece of advice in reply to a question concerning a specific goal, event, or activity that is to occur within one week. The advice can be as simple as a short phrase, or it might take the form of a cryptic rhyme or omen. If your party doesn’t act on the information, the conditions may change so that the information is no longer useful. The base chance for a correct *divination* is 70% + 1% per caster level, to a maximum of 90%. If the dice roll fails, you know the spell failed, unless specific magic yielding false information is at work.
                             As with *augury*, multiple *divinations* about the same topic by the same caster use the same dice result as the first *divination* spell and yield the same answer each time.`,
          component_details:'Material Component: Incense and a sacrificial offering appropriate to your religion, together worth at least 25 gp.'
        },
        'divine favor': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Divine_Favor',
          school:           'Evocation',
          level:            'Clr 1, Nobility 1, Pal 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '1 minute',
          text:             `Calling upon the strength and wisdom of a deity, you gain a +[[{[[{[[floor(?{Casting Level}/3)]],1}kh1]],3}kl1]] luck bonus on attack and weapon damage rolls. The bonus doesn’t apply to spell damage.`,
          component_details:null
        },
        'divine power': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Divine_Power',
          school:           'Evocation',
          level:            'Clr 4, War 4',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] round(s)',
          text:             `Calling upon the divine power of your patron, you imbue yourself with strength and skill in combat. Your base attack bonus becomes equal to your character level (which may give you additional attacks), you gain a +6 \`\`enhancement bonus\`\` to Strength, and you gain [[?{Casting Level}]] temporary hit point(s).`,
          component_details:null
        },
        'dominate animal': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dominate_Animal',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Animal 3, Drd 3',
          components:       'V, S',
          casting_time:     '1 round',
          range:            'close',
          target_type:      'Target',
          target:           'One [animal](https://www.dandwiki.com/wiki/SRD:Animal_Type)',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `You can enchant an animal and direct it with simple commands such as “Attack,” “Run,” and “Fetch.” Suicidal or self-destructive commands (including an order to attack a creature two or more size categories larger than the *dominated* animal) are simply ignored.
                             *Dominate animal* establishes a mental link between you and the subject creature. The animal can be directed by silent mental command as long as it remains in range. You need not see the creature to control it. You do not receive direct sensory input from the creature, but you know what it is experiencing. Because you are directing the animal with your own intelligence, it may be able to undertake actions normally beyond its own comprehension. You need not concentrate exclusively on controlling the creature unless you are trying to direct it to do something it normally couldn’t do. Changing your instructions or giving a *dominated* creature a new command is the equivalent of redirecting a spell, so it is a move action.`,
          component_details:null
        },
        'dominate monster': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dominate_Monster',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Charm 9, Sor/Wiz 9',
          components:       'V, S',
          casting_time:     '1 round',
          range:            'close',
          target_type:      'Target',
          target:           'One creature',
          duration:         '[[?{Casting Level}]] day(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `You can control the actions of any creature through a telepathic link that you establish with the subject’s mind.
                             If you and the subject have a common language, you can generally force the subject to perform as you desire, within the limits of its abilities. If no common language exists, you can communicate only basic commands, such as “Come here,” “Go there,” “Fight,” and “Stand still.” You know what the subject is experiencing, but you do not receive direct sensory input from it, nor can it communicate with you telepathically.
                             Once you have given a *dominated* creature a command, it continues to attempt to carry out that command to the exclusion of all other activities except those necessary for day-to-day survival (such as sleeping, eating, and so forth). Because of this limited range of activity, a Sense Motive check against DC 15 (rather than DC 25) can determine that the subject’s behavior is being influenced by an enchantment effect (see the Sense Motive skill description).
                             Changing your instructions or giving a *dominated* creature a new command is the equivalent of redirecting a spell, so it is a move action.
                             By concentrating fully on the spell (a standard action), you can receive full sensory input as interpreted by the mind of the subject, though it still can’t communicate with you. You can’t actually see through the subject’s eyes, so it’s not as good as being there yourself, but you still get a good idea of what’s going on.
                             Subjects resist this control, and any subject forced to take actions against its nature receives a new saving throw with a +2 \`\`bonus\`\`. Obviously self-destructive orders are not carried out. Once control is established, the range at which it can be exercised is unlimited, as long as you and the subject are on the same plane. You need not see the subject to control it.
                             If you don’t spend at least 1 round concentrating on the spell each day, the subject receives a new saving throw to throw off the domination.
                             [*Protection from evil*](https://www.dandwiki.com/wiki/SRD:Protection_from_Evil) or a similar spell can prevent you from exercising control or using the telepathic link while the subject is so warded, but such an effect neither prevents the establishment of domination nor dispels it.`,
          component_details:null
        },
        'dominate person': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dominate_Person',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 4, Sor/Wiz 5',
          components:       'V, S',
          casting_time:     '1 round',
          range:            'close',
          target_type:      'Target',
          target:           'One [humanoid](https://www.dandwiki.com/wiki/SRD:Humanoid_Type)',
          duration:         '[[?{Casting Level}]] day(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `You can control the actions of any humanoid creature through a telepathic link that you establish with the subject’s mind.
                             If you and the subject have a common language, you can generally force the subject to perform as you desire, within the limits of its abilities. If no common language exists, you can communicate only basic commands, such as “Come here,” “Go there,” “Fight,” and “Stand still.” You know what the subject is experiencing, but you do not receive direct sensory input from it, nor can it communicate with you telepathically.
                             Once you have given a *dominated* creature a command, it continues to attempt to carry out that command to the exclusion of all other activities except those necessary for day-to-day survival (such as sleeping, eating, and so forth). Because of this limited range of activity, a Sense Motive check against DC 15 (rather than DC 25) can determine that the subject’s behavior is being influenced by an enchantment effect (see the Sense Motive skill description).
                             Changing your instructions or giving a *dominated* creature a new command is the equivalent of redirecting a spell, so it is a move action.
                             By concentrating fully on the spell (a standard action), you can receive full sensory input as interpreted by the mind of the subject, though it still can’t communicate with you. You can’t actually see through the subject’s eyes, so it’s not as good as being there yourself, but you still get a good idea of what’s going on.
                             Subjects resist this control, and any subject forced to take actions against its nature receives a new saving throw with a +2 \`\`bonus\`\`. Obviously self-destructive orders are not carried out. Once control is established, the range at which it can be exercised is unlimited, as long as you and the subject are on the same plane. You need not see the subject to control it.
                             If you don’t spend at least 1 round concentrating on the spell each day, the subject receives a new saving throw to throw off the domination.
                             [*Protection from evil*](https://www.dandwiki.com/wiki/SRD:Protection_from_Evil) or a similar spell can prevent you from exercising control or using the telepathic link while the subject is so warded, but such an effect neither prevents the establishment of domination nor dispels it.`,
          component_details:null
        },
        'doom': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Doom',
          school:           'Necromancy [Fear, Mind-Affecting]',
          level:            'Blg 1, Clr 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One living creature',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell fills a single subject with a feeling of horrible dread that causes it to become [shaken](https://www.dandwiki.com/wiki/SRD:Shaken).`,
          component_details:null
        },
        //Epic Spell: dragon knight (ritual)
        //Epic Spell: dragon strike (ritual)
        'dream': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dream',
          school:           'Illusion (Phantasm) [Mind-Affecting]',
          level:            'Brd 5, Sor/Wiz 5',
          components:       'V, S',
          casting_time:     '1 minute',
          range:            'Unlimited',
          target_type:      'Target',
          target:           'One living creature touched',
          duration:         'See text',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `You, or a messenger touched by you, sends a phantasmal message to others in the form of a dream. At the beginning of the spell, you must name the recipient or identify him or her by some title that leaves no doubt as to identity. The messenger then enters a trance, appears in the intended recipient’s dream, and delivers the message. The message can be of any length, and the recipient remembers it perfectly upon waking. The communication is one-way. The recipient cannot ask questions or offer information, nor can the messenger gain any information by observing the dreams of the recipient.
                             Once the message is delivered, the messenger’s mind returns instantly to its body. The duration of the spell is the time required for the messenger to enter the recipient’s dream and deliver the message.
                             If the recipient is awake when the spell begins, the messenger can choose to wake up (ending the spell) or remain in the trance. The messenger can remain in the trance until the recipient goes to sleep, then enter the recipient’s dream and deliver the message as normal. A messenger that is disturbed during the trance comes awake, ending the spell.
                             Creatures who don’t sleep (such as elves, but not half-elves) or don’t dream cannot be contacted by this spell.
                             The messenger is unaware of its own surroundings or of the activities around it while in the trance. It is defenseless both physically and mentally (always fails any saving throw) while in the trance.`,
          component_details:null
        },
        //Epic Spell: dreamscape
        'dweomer of transference': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Dweomer_of_Transference',
          school:           'Evocation',
          level:            'Clr 4, Sor/Wiz 4',
          components:       'V, S',
          casting_time:     '1 minute',
          range:            'close',
          target_type:      'Target',
          target:           'One willing psionic creature',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `With this spell, you form a radiating corona around the head of a psionic ally, then convert some of your spells into psionic [power points](https://www.dandwiki.com/wiki/SRD:Power_Points). When you finish casting *dweomer of transference*, a red-orange glow surrounds the psionic creature’s head. For the duration of the spell, any spells cast at the subject don’t have their usual effect, instead converting themselves harmlessly into psionic energy that the subject can use as energy for psionic powers. You can cast any spell you like at the subject, even area spells, effect spells, and spells for whom the subject would ordinarily not be a legitimate target. The spells don’t do anything other than provide the subject with power points, but you must still cast them normally, obeying the component and range requirements listed in the description of each spell.
                             For each spell you cast into the *dweomer of transference*, the psionic creature gets temporary power points, according to the following table. The transference isn’t perfectly efficient. The temporary power points acquired through a *dweomer of transference* dissipate after 1 hour if they haven’t already been spent.
                             • Spell Level 0
                             -- 0 Power Points Acquired
                             • Spell Level 1st
                             -- 1 Power Points Acquired
                             • Spell Level 2nd
                             -- 2 Power Points Acquired
                             • Spell Level 3rd
                             -- 4 Power Points Acquired
                             • Spell Level 4th
                             -- 6 Power Points Acquired
                             • Spell Level 5th
                             -- 8 Power Points Acquired
                             • Spell Level 6th
                             -- 10 Power Points Acquired
                             • Spell Level 7th
                             -- 12 Power Points Acquired
                             • Spell Level 8th
                             -- 14 Power Points Acquired
                             • Spell Level 9th
                             -- 16 Power Points Acquired`,
          component_details:null
        },
        // Spells that start with E
        'eagle\'s splendor': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Eagle%27s_Splendor',
          school:           'Transmutation',
          level:            'Blg 2, Brd 2, Clr 2, Pal 2, Sor/Wiz 2',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes',
          text:             `The transmuted creature becomes more poised, articulate, and personally forceful. The spell grants a +4 \`\`enhancement bonus\`\` to Charisma, adding the usual benefits to Charisma-based skill checks and other uses of the Charisma modifier. Sorcerers and bards (and other spellcasters who rely on Charisma) affected by this spell do not gain any additional bonus spells for the increased Charisma, but the save DCs for spells they cast while under this spell’s effect do increase.`,
          component_details:'Arcane Material Component: A few feathers or a pinch of droppings from an eagle.'
        },
        'earthquake': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Earthquake',
          school:           'Evocation [Earth]',
          level:            'Clr 8, Destruction 8, Drd 8, Earth 7',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Area',
          target:           '80-ft.-radius spread (S)',
          duration:         '1 round',
          saving_throw:     'See text',
          spell_resistance: 'No',
          text:             `When you cast *earthquake*, an intense but highly localized tremor rips the ground. The shock knocks creatures down, collapses structures, opens cracks in the ground, and more. The effect lasts for 1 round, during which time creatures on the ground can’t move or attack. A spellcaster on the ground must make a Concentration check (DC 20 + spell level) or lose any spell he or she tries to cast. The earthquake affects all terrain, vegetation, structures, and creatures in the area. The specific effect of an *earthquake* spell depends on the nature of the terrain where it is cast.
                             *Cave, Cavern, or Tunnel:* The spell collapses the roof, dealing ‹8d6› points of bludgeoning damage to any creature caught under the cave-in (Reflex DC 15 half) and pinning that creature beneath the rubble (see below). An *earthquake* cast on the roof of a very large cavern could also endanger those outside the actual area but below the falling debris.
                             *Cliffs:* *Earthquake* causes a cliff to crumble, creating a landslide that travels horizontally as far as it fell vertically. Any creature in the path takes ‹8d6› points of bludgeoning damage (Reflex DC 15 half) and is pinned beneath the rubble (see below).
                             *Open Ground:* Each creature standing in the area must make a DC 15 Reflex save or fall down. Fissures open in the earth, and every creature on the ground has a ‹25%|[[{1d100}<25]]› chance to fall into one (Reflex DC 20 to avoid a fissure). At the end of the spell, all fissures grind shut, killing any creatures still trapped within.
                             *Structure:* Any structure standing on open ground takes 100 points of damage, enough to collapse a typical wooden or masonry building, but not a structure built of stone or reinforced masonry. Hardness does not reduce this damage, nor is it halved as damage dealt to objects normally is. Any creature caught inside a collapsing structure takes ‹8d6› points of bludgeoning damage (Reflex DC 15 half) and is pinned beneath the rubble (see below).
                             *River, Lake, or Marsh:* Fissures open underneath the water, draining away the water from that area and forming muddy ground. Soggy marsh or swampland becomes quicksand for the duration of the spell, sucking down creatures and structures. Each creature in the area must make a DC 15 Reflex save or sink down in the mud and quicksand. At the end of the spell, the rest of the body of water rushes in to replace the drained water, possibly drowning those caught in the mud.
                             *Pinned beneath Rubble:* Any creature pinned beneath rubble takes ‹1d6› points of nonlethal damage per minute while pinned. If a pinned character falls unconscious, he or she must make a DC 15 Constitution check or take ‹1d6› points of lethal damage each minute thereafter until freed or dead.`,
          component_details:null
        },
        //Epic Spell: eclipse
        //Epic Spell: eidolon
        'elemental swarm': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Elemental_Swarm',
          school:           'Conjuration (Summoning) [see text]',
          level:            'Air 9, Drd 9, Earth 9, Fire 9, Water 9',
          components:       'V, S',
          casting_time:     '10 minutes',
          range:            'medium',
          target_type:      'Effect',
          target:           'Two or more summoned creatures, no two of which can be more than 30 ft. apart',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell opens a portal to an Elemental Plane and summons [elementals](https://www.dandwiki.com/wiki/SRD:Elemental) from it. A druid can choose the plane (Air, Earth, Fire, or Water); a cleric opens a portal to the plane matching his domain.
                             When the spell is complete, [[2d4]] Large elementals appear. Ten minutes later, [[1d4]] Huge elementals appear. Ten minutes after that, one greater elemental appears. Each elemental has maximum hit points per HD. Once these creatures appear, they serve you for the duration of the spell.
                             The elementals obey you explicitly and never attack you, even if someone else manages to gain control over them. You do not need to concentrate to maintain control over the elementals. You can dismiss them singly or in groups at any time.
                             When you use a summoning spell to summon an air, earth, fire, or water creature, it is a spell of that type.`,
          component_details:null
        },
        'endure elements': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Endure_Elements',
          school:           'Abjuration',
          level:            'Clr 1, Drd 1, Pal 1, Rgr 1, Sor/Wiz 1, Sun 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '24 hours',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `A creature protected by *endure elements* suffers no harm from being in a hot or cold environment. It can exist comfortably in conditions between -50 and 140 degrees Fahrenheit without having to make Fortitude saves). The creature’s equipment is likewise protected.
                             *Endure elements* doesn’t provide any protection from fire or cold damage, nor does it protect against other environmental hazards such as smoke, lack of air, and so forth.`,
          component_details:null
        },
        'energy drain': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Energy_Drain_%28Spell%29',
          school:           'Necromancy',
          level:            'Clr 9, Sor/Wiz 9',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'Ray of negative energy',
          duration:         'Instantaneous',
          saving_throw:     'None; see text',
          spell_resistance: 'Yes',
          text:             `You point your finger and utter the incantation, releasing a black ray of crackling negative energy that suppresses the life force of any living creature it strikes. You must make a ranged [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack) to hit. If the attack succeeds, the subject gains [[2d4]] negative levels.
                             If the subject has at least as many negative levels as HD, it dies. Each negative level gives a creature a -1 \`\`penalty\`\` on attack rolls, saving throws, skill checks, ability checks, and effective level (for determining the power, duration, DC, and other details of spells or special abilities).
                             Additionally, a spellcaster loses one spell or spell slot from his or her highest available level. Negative levels stack.
                             There is no saving throw to avoid gaining the negative levels, but 24 hours after gaining them, the subject must make a Fortitude saving throw (DC=energy drain spell’s save DC) for each negative level. If the save succeeds, that negative level is removed. If it fails, the negative level also goes away, but one of the subject’s character levels is permanently drained.
                             An [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature struck by the ray gains [[2d4*5]] temporary hit points for 1 hour.`,
          component_details:null
        },
        'enervation': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Enervation',
          school:           'Necromancy',
          level:            'Sor/Wiz 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'Ray of negative energy',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `You point your finger and utter the incantation, releasing a black ray of crackling negative energy that suppresses the life force of any living creature it strikes. You must make a ranged [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack) to hit. If the attack succeeds, the subject gains [[1d4]] negative levels.
                             If the subject has at least as many negative levels as HD, it dies. Each negative level gives a creature a -1 \`\`penalty\`\` on attack rolls, saving throws, skill checks, ability checks, and effective level (for determining the power, duration, DC, and other details of spells or special abilities).
                             Additionally, a spellcaster loses one spell or spell slot from his or her highest available level. Negative levels stack.
                             Assuming the subject survives, it regains lost levels after a number of hours equal to your caster level (maximum 15 hours). Usually, negative levels have a chance of permanently draining the victim’s levels, but the negative levels from *enervation* don’t last long enough to do so.
                             An [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature struck by the ray gains [[1d4*5]] temporary hit points for 1 hour.`,
          component_details:null
        },
        'enlarge person': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Enlarge_Person',
          school:           'Transmutation',
          level:            'Sor/Wiz 1, Strength 1',
          components:       'V, S, M',
          casting_time:     '1 round',
          range:            'close',
          target_type:      'Target',
          target:           'One [humanoid](https://www.dandwiki.com/wiki/SRD:Humanoid_Type) creature',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `This spell causes instant growth of a humanoid creature, doubling its height and multiplying its weight by 8. This increase changes the creature’s [size category](https://www.dandwiki.com/wiki/SRD:Size_Category) to the next larger one. The target gains a +2 \`\`size bonus\`\` to Strength, a -2 \`\`size penalty\`\` to Dexterity (to a minimum of 1), and a -1 \`\`penalty\`\` on attack rolls and AC due to its increased size.
                             A humanoid creature whose size increases to Large has a space of 10 feet and a natural reach of 10 feet. This spell does not change the target’s speed.
                             If insufficient room is available for the desired growth, the creature attains the maximum possible size and may make a Strength check (using its increased Strength) to burst any enclosures in the process. If it fails, it is constrained without harm by the materials enclosing it— the spell cannot be used to crush a creature by increasing its size.
                             All equipment worn or carried by a creature is similarly enlarged by the spell. Melee and projectile weapons affected by this spell deal more damage. Other magical properties are not affected by this spell. Any *enlarged* item that leaves an *enlarged* creature’s possession (including a projectile or thrown weapon) instantly returns to its normal size. This means that thrown weapons deal their normal damage, and projectiles deal damage based on the size of the weapon that fired them. Magical properties of *enlarged* items are not increased by this spell.
                             Multiple magical effects that increase size do not stack.
                             *Enlarge person* counters and dispels *reduce person*.
                             *Enlarge person* can be made permanent with a *permanency* spell.`,
          component_details:'Material Component: A pinch of powdered iron.'
        },
        //Epic Spell: enslave (ritual)
        'entangle': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Entangle',
          school:           'Transmutation',
          level:            'Drd 1, Plant 1, Rgr 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Area',
          target:           '[Plants](https://www.dandwiki.com/wiki/SRD:Plant_Type) in a 40-ft.-radius spread',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Reflex partial; see text',
          spell_resistance: 'No',
          text:             `Grasses, weeds, bushes, and even trees wrap, twist, and entwine about creatures in the area or those that enter the area, holding them fast and causing them to become [entangled](https://www.dandwiki.com/wiki/SRD:Entangled). The creature can break free and move half its normal speed by using a full-round action to make a DC 20 Strength check or a DC 20 Escape Artist check. A creature that succeeds on a Reflex save is not [entangled](https://www.dandwiki.com/wiki/SRD:Entangled) but can still move at only half speed through the area. Each round on your turn, the [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type) once again attempt to [entangle](https://www.dandwiki.com/wiki/SRD:Entangled) all creatures that have avoided or escaped entanglement.
                             *Note:* The effects of the spell may be altered somewhat, based on the nature of the entangling [plants](https://www.dandwiki.com/wiki/SRD:Plant_Type).`,
          component_details:null
        },
        'enthrall': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Enthrall',
          school:           'Enchantment (Charm) [Language-Dependent, Mind-Affecting, Sonic]',
          level:            'Brd 2, Clr 2, Nobility 2',
          components:       'V, S',
          casting_time:     '1 round',
          range:            'medium',
          target_type:      'Targets',
          target:           'Any number of creatures',
          duration:         '1 hour or less',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `If you have the attention of a group of creatures, you can use this spell to hold them spellbound. To cast the spell, you must speak or sing without interruption for 1 full round. Thereafter, those affected give you their undivided attention, ignoring their surroundings. They are considered to have an attitude of friendly while under the effect of the spell. Any potentially affected creature of a race or religion unfriendly to yours gets a +4 \`\`bonus\`\` on the saving throw.
                             A creature with 4 or more HD or with a Wisdom score of 16 or higher remains aware of its surroundings and has an attitude of indifferent. It gains a new saving throw if it witnesses actions that it opposes.
                             The effect lasts as long as you speak or sing, to a maximum of 1 hour. Those *enthralled* by your words take no action while you speak or sing and for [[1d3]] rounds thereafter while they discuss the topic or performance. Those entering the area during the performance must also successfully save or become *enthralled*. The speech ends (but the 1d3-round delay still applies) if you lose concentration or do anything other than speak or sing.
                             If those not *enthralled* have unfriendly or hostile attitudes toward you, they can collectively make a Charisma check to try to end the spell by jeering and heckling. For this check, use the Charisma bonus of the creature with the highest Charisma in the group; others may make Charisma checks to assist. The heckling ends the spell if this check result beats your Charisma check result. Only one such challenge is allowed per use of the spell.
                             If any member of the audience is attacked or subjected to some other overtly hostile act, the spell ends and the previously *enthralled* members become immediately unfriendly toward you. Each creature with 4 or more HD or with a Wisdom score of 16 or higher becomes hostile.`,
          component_details:null
        },
        'entropic shield': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Entropic_Shield',
          school:           'Abjuration',
          level:            'Clr 1, Luck 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          text:             `A magical field appears around you, glowing with a chaotic blast of multicolored hues. This field deflects incoming arrows, rays, and other ranged attacks. Each ranged attack directed at you for which the attacker must make an attack roll has a 20% miss chance (similar to the effects of concealment). Other attacks that simply work at a distance are not affected.`,
          component_details:null
        },
        //Epic Spell: epic counterspell
        //Epic Spell: epic mage armor
        //Epic Spell: epic repulsion
        //Epic Spell: epic spell reflection
        'erase': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Erase',
          school:           'Transmutation',
          level:            'Brd 1, Rune 1, Sor/Wiz 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One scroll or two pages',
          duration:         'Instantaneous',
          saving_throw:     'See text',
          spell_resistance: 'No',
          text:             `*Erase* removes writings of either magical or mundane nature from a scroll or from one or two pages of paper, parchment, or similar surfaces. With this spell, you can remove [*explosive runes*](https://www.dandwiki.com/wiki/SRD:Explosive_Runes), a [*glyph of warding*](https://www.dandwiki.com/wiki/SRD:Glyph_of_Warding), a [*sepia snake sigil*](https://www.dandwiki.com/wiki/SRD:Sepia_Snake_Sigil), or an [*arcane mark*](https://www.dandwiki.com/wiki/SRD:Arcane_Mark), but not [*illusory script*](https://www.dandwiki.com/wiki/SRD:Illusory_Script) or a [*symbol*](https://www.dandwiki.com/wiki/SRD:Symbol_of_Death) spell. Nonmagical writing is automatically erased if you touch it and no one else is holding it. Otherwise, the chance of erasing nonmagical writing is 90%.
                             Magic writing must be touched to be erased, and you also must succeed on a caster level check (1d20 + caster level) against DC 15. (A natural 1 or 2 is always a failure on this check.) If you fail to erase *explosive runes*, a *glyph of warding*, or a *sepia snake sigil*, you accidentally activate that writing instead.`,
          component_details:null
        },
        //Epic Spell: eternal freedom
        'ethereal jaunt': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Ethereal_Jaunt',
          school:           'Transmutation',
          level:            'Clr 7, Sor/Wiz 7',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          text:             `You become ethereal, along with your equipment. For the duration of the spell, you are in a place called the [Ethereal Plane](https://www.dandwiki.com/wiki/SRD:Ethereal_Plane), which overlaps the normal, physical, [Material Plane](https://www.dandwiki.com/wiki/SRD:Material_Plane). When the spell expires, you return to material existence.
                             An ethereal creature is [invisible](https://www.dandwiki.com/wiki/SRD:Invisible), insubstantial, and capable of moving in any direction, even up or down, albeit at half normal speed. As an insubstantial creature, you can move through solid objects, including living creatures. An ethereal creature can see and hear on the Material Plane, but everything looks gray and ephemeral. Sight and hearing onto the Material Plane are limited to 60 feet.
                             Force effects and abjurations affect an ethereal creature normally. Their effects extend onto the Ethereal Plane from the Material Plane, but not vice versa. An ethereal creature can’t attack material creatures, and spells you cast while ethereal affect only other ethereal things. Certain material creatures or objects have attacks or effects that work on the Ethereal Plane.
                             Treat other ethereal creatures and ethereal objects as if they were material.
                             If you end the spell and become material while inside a material object (such as a solid wall), you are shunted off to the nearest open space and take ‹1d6› points of damage per 5 feet that you so travel.`,
          component_details:null
        },
        'etherealness': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Etherealness_%28Spell%29',
          school:           'Transmutation',
          level:            'Clr 9, Sor/Wiz 9',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch; see text',
          target_type:      'Targets',
          target:           'You and [[floor(?{Casting Level}/3)]] other touched creature(s)',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          spell_resistance: 'Yes',
          text:             `This spell functions like [*ethereal jaunt*](https://www.dandwiki.com/wiki/SRD:Ethereal_Jaunt), except that you and other willing creatures joined by linked hands (along with their equipment) become ethereal. Besides yourself, you can bring one creature per three caster levels to the Ethereal Plane. Once ethereal, the subjects need not stay together.
                             When the spell expires, all affected creatures on the [Ethereal Plane](https://www.dandwiki.com/wiki/SRD:Ethereal_Plane) return to material existence.`,
          component_details:null
        },
        'expeditious retreat': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Expeditious_Retreat',
          school:           'Transmutation',
          level:            'Brd 1, Sor/Wiz 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          text:             `This spell increases your base land speed by 30 feet. (This adjustment is treated as an enhancement bonus.) There is no effect on other modes of movement, such as burrow, climb, fly, or swim. As with any effect that increases your speed, this spell affects your jumping distance (see the Jump skill).`,
          component_details:null
        },
        'explosive runes': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Explosive_Runes',
          school:           'Abjuration [Force]',
          level:            'Rune 4, Sor/Wiz 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'One touched object weighing no more than 10 lb.',
          duration:         'Permanent until discharged (D)',
          saving_throw:     'See text',
          spell_resistance: 'Yes',
          text:             `You trace these mystic runes upon a book, map, scroll, or similar object bearing written information. The *runes* detonate when read, dealing ‹6d6› points of force damage. Anyone next to the *runes* (close enough to read them) takes the full damage with no saving throw; any other creature within 10 feet of the *runes* is entitled to a Reflex save for half damage. The object on which the *runes* were written also takes full damage (no saving throw).
                             You and any characters you specifically instruct can read the protected writing without triggering the *runes*. Likewise, you can remove the *runes* whenever desired. Another creature can remove them with a successful *dispel magic* or *erase* spell, but attempting to dispel or erase the *runes* and failing to do so triggers the explosion.
                             *Note:* Magic traps such as *explosive runes* are hard to detect and disable. A rogue (only) can use the Search skill to find the *runes* and Disable Device to thwart them. The DC in each case is 25 + spell level, or 28 for *explosive runes*.`,
          component_details:null
        },
        'eyebite': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Eyebite',
          school:           'Necromancy [Evil]',
          level:            'Brd 6, Scalykind 6, Sor/Wiz 6',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One living creature',
          duration:         '[[floor(?{Casting Level}/3)]] round(s); see text',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `Each round, you may target a single living creature, striking it with waves of evil power. Depending on the target’s HD, this attack has as many as three effects.

                             HD  Effect
                             10 or more  Sickened
                             5–9 Panicked, sickened
                             4 or less Comatose, panicked, sickened

                             The effects are cumulative and concurrent.
                             *[Sickened](https://www.dandwiki.com/wiki/SRD:Sickened):* Sudden pain and fever sweeps over the subject’s body. A [sickened](https://www.dandwiki.com/wiki/SRD:Sickened) creature takes a -2 \`\`penalty\`\` on attack rolls, weapon damage rolls, saving throws, skill checks, and ability checks. A creature affected by this spell remains [sickened](https://www.dandwiki.com/wiki/SRD:Sickened) for [[10*?{Casting Level}]] minutes. The effects cannot be negated by a [*remove disease*](https://www.dandwiki.com/wiki/SRD:Remove_Disease) or [*heal*](https://www.dandwiki.com/wiki/SRD:Heal) spell, but a [*remove curse*](https://www.dandwiki.com/wiki/SRD:Remove_Curse) is effective.
                             *[Panicked](https://www.dandwiki.com/wiki/SRD:Panicked):* The subject becomes [panicked](https://www.dandwiki.com/wiki/SRD:Panicked) for [[1d4]] rounds. Even after the panic ends, the creature remains [shaken](https://www.dandwiki.com/wiki/SRD:Shaken) for [[10*?{Casting Level}]] minutes, and it automatically becomes [panicked](https://www.dandwiki.com/wiki/SRD:Panicked) again if it comes within sight of you during that time. This is a fear effect.
                             *Comatose:* The subject falls into a catatonic coma for [[10*?{Casting Level}]] minutes. During this time, it cannot be awakened by any means short of dispelling the effect. This is not a [*sleep*](https://www.dandwiki.com/wiki/SRD:Sleep) effect, and thus elves are not immune to it.
                             You must spend a move action each round after the first to target a foe.`,
          component_details:null
        },
        // Spells that start with F
        'fabricate': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Fabricate',
          school:           'Transmutation',
          level:            'Artifice 5, Sor/Wiz 5',
          components:       'V, S, M',
          casting_time:     'See text',
          range:            'close',
          target_type:      'Target',
          target:           'Up to [[10*?{Casting Level}]] cu. ft.; see text',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You convert material of one sort into a product that is of the same material. Creatures or magic items cannot be created or transmuted by the *fabricate* spell. The quality of items made by this spell is commensurate with the quality of material used as the basis for the new fabrication. If you work with a mineral, the target is reduced to [[?{Casting Level}]] cu. ft.
                             You must make an appropriate Craft check to fabricate articles requiring a high degree of craftsmanship.
                             Casting requires 1 round per 10 cubic feet (or 1 cubic foot if mineral) of material to be affected by the spell.`,
          component_details:'Material Component: The original material, which costs the same amount as the raw materials required to craft the item to be created.'
        },
        'faerie fire': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Faerie_Fire',
          school:           'Evocation [Light]',
          level:            'Drd 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Area',
          target:           'Creatures and objects within a 5-ft.-radius burst',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `A pale glow surrounds and outlines the subjects. Outlined subjects shed light as candles. Outlined creatures do not benefit from the [concealment](https://www.dandwiki.com/wiki/SRD:Concealment) normally provided by darkness (though a 2nd-level or higher magical [*darkness*](https://www.dandwiki.com/wiki/SRD:Darkness) effect functions normally), [*blur*](https://www.dandwiki.com/wiki/SRD:Blur), [*displacement*](https://www.dandwiki.com/wiki/SRD:Displacement), [*invisibility*](https://www.dandwiki.com/wiki/SRD:Invisibility_%28Spell%29, or similar effects. The light is too dim to have any special effect on [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) or dark-dwelling creatures vulnerable to light. The *faerie fire* can be blue, green, or violet, according to your choice at the time of casting. The *faerie fire* does not cause any harm to the objects or creatures thus outlined.`,
          component_details:null
        },
        'false life': {
          ref:              'https://www.dandwiki.com/wiki/SRD:False_Life',
          school:           'Necromancy',
          level:            'Asn 3, Sor/Wiz 2',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] hour(s) or until discharged; see text',
          text:             `You harness the power of unlife to grant yourself a limited ability to avoid death. While this spell is in effect, you gain temporary hit points equal to [[1d10+{?{Casting Level},10}kl1]].`,
          component_details:'Material Component: A small amount of alcohol or distilled spirits, which you use to trace certain sigils on your body during casting. These sigils cannot be seen once the alcohol or spirits evaporate.'
        },
        'false vision': {
          ref:              'https://www.dandwiki.com/wiki/SRD:False_Vision',
          school:           'Illusion (Glamer)',
          level:            'Brd 5, Sor/Wiz 5, Trickery 5',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Area',
          target:           '40-ft.-radius emanation',
          duration:         '[[?{Casting Level}]] hour(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `Any divination (scrying) spell used to view anything within the area of this spell instead receives a false image (as the [*major image*](https://www.dandwiki.com/wiki/Major_Image) spell), as defined by you at the time of casting. As long as the duration lasts, you can concentrate to change the image as desired. While you aren’t concentrating, the image remains static.`,
          component_details:'Arcane Material Component: The ground dust of a piece of jade worth at least 250 gp, which is sprinkled into the air when the spell is cast.'
        },
        'fear': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Fear_%28Spell%29',
          school:           'Necromancy [Fear, Mind-Affecting]',
          level:            'Brd 3, Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            '30 ft.',
          target_type:      'Area',
          target:           'Cone-shaped burst',
          duration:         '[[?{Casting Level}]] round or 1 round; see text',
          saving_throw:     'Will partial',
          spell_resistance: 'Yes',
          text:             `An [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) cone of terror causes each living creature in the area to become [panicked](https://www.dandwiki.com/wiki/SRD:Panicked) unless it succeeds on a Will save. If cornered, a [panicked](https://www.dandwiki.com/wiki/SRD:Panicked) creature begins [cowering](https://www.dandwiki.com/wiki/SRD:Cowering). If the Will save succeeds, the creature is [shaken](https://www.dandwiki.com/wiki/SRD:Shaken) for 1 round.`,
          component_details:'Material Component: Either the heart of a hen or a white feather.'
        },
        'feather fall': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Feather_Fall',
          school:           'Transmutation',
          level:            'Asn 1, Brd 1, Sor/Wiz 1',
          components:       'V',
          casting_time:     '1 free action',
          range:            'close',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] Medium or smaller freefalling object(s) or creature(s), no two of which may be more than 20 ft. apart',
          duration:         'Until landing or [[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates (harmless) or Will negates (object)',
          spell_resistance: 'Yes (object)',
          text:             `The affected creatures or objects fall slowly. *Feather fall* instantly changes the rate at which the targets fall to a mere 60 feet per round (equivalent to the end of a fall from a few feet), and the subjects take no damage upon landing while the spell is in effect. However, when the spell duration expires, a normal rate of falling resumes.
                             The spell affects one or more Medium or smaller creatures (including gear and carried objects up to each creature’s maximum load) or objects, or the equivalent in larger creatures: A Large creature or object counts as two Medium creatures or objects, a Huge creature or object counts as two Large creatures or objects, and so forth.
                             You can cast this spell with an instant utterance, quickly enough to save yourself if you unexpectedly fall. Casting the spell is a [free action](https://www.dandwiki.com/wiki/SRD:Free_Actions), like casting a quickened spell, and it counts toward the normal limit of one quickened spell per round. You may even cast this spell when it isn’t your turn.
                             This spell has no special effect on ranged weapons unless they are falling quite a distance. If the spell is cast on a falling item the object does half normal damage based on its weight, with no bonus for the height of the drop.
                             *Feather fall* works only upon free-falling objects. It does not affect a sword blow or a charging or flying creature.`,
          component_details:null
        },
        'feeblemind': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Feeblemind',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Sor/Wiz 5',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One creature',
          duration:         'Instantaneous',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `If the target creature fails a Will saving throw, its Intelligence and Charisma scores each drop to 1. The affected creature is unable to use Intelligence- or Charisma-based skills, cast spells, understand language, or communicate coherently. Still, it knows who its friends are and can follow them and even protect them. The subject remains in this state until a [*heal*](https://www.dandwiki.com/wiki/SRD:Heal), [*limited wish*](https://www.dandwiki.com/wiki/SRD:Limited_Wish), [*miracle*](https://www.dandwiki.com/wiki/SRD:Miracle), or [*wish*](https://www.dandwiki.com/wiki/SRD:Wish) spell is used to cancel the effect of the *feeblemind*. A creature that can cast arcane spells, such as a sorcerer or a wizard, takes a -4 \`\`penalty\`\` on its saving throw.`,
          component_details:'Material Component: A handful of clay, crystal, glass, or mineral spheres.'
        },
        'find traps': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Find_Traps',
          school:           'Divination',
          level:            'Clr 2',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] minute(s)',
          text:             `You gain intuitive insight into the workings of traps. You can use the Search skill to detect traps just as a rogue can. In addition, you gain +[[{floor(?{Casting Level}/2),10}kl1]] [insight bonus](https://www.dandwiki.com/wiki/Insight_bonus) on Search checks made to find traps while the spell is in effect.
                             Note that *find traps* grants no ability to disable the traps that you may find.`,
          component_details:null
        },
        'find the path': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Find_the_Path',
          school:           'Divination',
          level:            'Brd 6, Clr 6, Drd 6, Knowledge 6, Travel 6',
          components:       'V, S, F',
          casting_time:     '3 rounds',
          range:            'Personal or touch',
          target_type:      'Target',
          target:           'You or creature touched',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'None or Will negates (harmless)',
          spell_resistance: 'No or Yes (harmless)',
          text:             `The recipient of this spell can find the shortest, most direct physical route to a specified destination, be it the way into or out of a locale. The locale can be outdoors, underground, or even inside a [*maze*](https://www.dandwiki.com/wiki/SRD:Maze) spell. *Find the path* works with respect to locations, not objects or creatures at a locale. The location must be on the same plane as you are at the time of casting.
                             The spell enables the subject to sense the correct direction that will eventually lead it to its destination, indicating at appropriate times the exact path to follow or physical actions to take. For example, the spell enables the subject to sense trip wires or the proper word to bypass a [*glyph of warding*](https://www.dandwiki.com/wiki/SRD:Glyph_of_Warding). The spell ends when the destination is reached or the duration expires, whichever comes first. *Find the path* can be used to remove the subject and its companions from the effect of a [*maze*](https://www.dandwiki.com/wiki/SRD:Maze) spell in a single round.
                             This divination is keyed to the recipient, not its companions, and its effect does not predict or allow for the actions of creatures (including guardians).`,
          component_details:'Focus: A set of divination counters of the sort you favor.'
        },
        'finger of death': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Finger_of_Death',
          school:           'Necromancy [Death]',
          level:            'Drd 8, Sor/Wiz 7',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One living creature',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude partial',
          spell_resistance: 'Yes',
          text:             `You can slay any one living creature within range. The target is entitled to a Fortitude saving throw to survive the attack. If the save is successful, the creature instead takes [[3d6+{?{Casting Level},25}kl1]] points of damage.
                             The subject might die from damage even if it succeeds on its saving throw.`,
          component_details:null
        },
        'fire seeds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Fire_Seeds',
          school:           'Conjuration (Creation) [Fire]',
          level:            'Drd 6, Fire 6, Sun 6',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           'Up to four touched acorns or up to eight touched holly berries',
          duration:         '[[10*?{Casting Level}]] minute(s) or until used',
          saving_throw:     'None or Reflex half; see text',
          spell_resistance: 'No',
          text:             `Depending on the version of *fire seeds* you choose, you turn acorns into splash weapons that you or another character can throw, or you turn holly berries into bombs that you can detonate on command.
                             *Acorn Grenades:* As many as four acorns turn into special splash weapons that can be hurled as far as 100 feet. A ranged [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack) roll is required to strike the intended target. Together, the acorns are capable of dealing [[[[{?{Casting Level},20}kl1]]d6]] points of fire damage, divided up among the acorns as you wish.
                             Each acorn explodes upon striking any hard surface. In addition to its regular fire damage, it deals [[{?{Casting Level},20}kl1]] point of splash damage per die, and it ignites any combustible materials within 10 feet. A creature within this area that makes a successful Reflex saving throw takes only half damage; a creature struck directly is not allowed a saving throw.
                             *Holly Berry Bombs:* You turn as many as eight holly berries into special bombs. The holly berries are usually placed by hand, since they are too light to make effective thrown weapons (they can be tossed only 5 feet). If you are within 200 feet and speak a word of command, each berry instantly bursts into flame, causing [[1d8+?{Casting Level}]] points of fire damage to every creature in a 5-foot radius burst and igniting any combustible materials within 5 feet. A creature in the area that makes a successful Reflex saving throw takes only half damage.`,
          component_details:'Material Component: The acorns or holly berries.'
        },
        'fire shield': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Fire_Shield',
          school:           'Evocation [Fire or Cold]',
          level:            'Fire 5, Sor/Wiz 4, Sun 4',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          text:             `This spell wreathes you in flame and causes damage to each creature that attacks you in melee. The flames also protect you from either cold-based or fire-based attacks (your choice).
                             Any creature striking you with its body or a handheld weapon deals normal damage, but at the same time the attacker takes [[1d6+{?{Casting Level},15}kl1]] points of damage. This damage is either cold damage (if the *shield* protects against fire-based attacks) or fire damage (if the *shield* protects against cold-based attacks). If the attacker has spell resistance, it applies to this effect. Creatures wielding weapons with exceptional reach are not subject to this damage if they attack you.
                             When casting this spell, you appear to immolate yourself, but the flames are thin and wispy, giving off light equal to only half the illumination of a normal torch (10 feet). The color of the flames is determined randomly (50% chance of either color)—blue or green if the *chill shield* is cast, violet or blue if the *warm shield* is employed. The special powers of each version are as follows.
                             *Warm Shield:* The flames are warm to the touch. You take only half damage from cold-based attacks. If such an attack allows a Reflex save for half damage, you take no damage on a successful save.
                             *Chill Shield:* The flames are cool to the touch. You take only half damage from fire-based attacks. If such an attack allows a Reflex save for half damage, you take no damage on a successful save.`,
          component_details:'Arcane Material Component: A bit of phosphorus for the *warm shield*; a live firefly or glowworm or the tail portions of four dead ones for the *chill shield*.'
        },
        'fire storm': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Fire_Storm',
          school:           'Evocation [Fire]',
          level:            'Clr 8, Drd 7, Fire 7',
          components:       'V, S',
          casting_time:     '1 round',
          range:            'medium',
          target_type:      'Area',
          target:           '[[2*?{Casting Level}]] × 10-ft. cubes (S)',
          duration:         'Instantaneous',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `When a *fire storm* spell is cast, the whole area is shot through with sheets of roaring flame. The raging flames do not harm natural vegetation, ground [cover](https://www.dandwiki.com/wiki/SRD:Cover), and any [plant](https://www.dandwiki.com/wiki/SRD:Plant_Type) creatures in the area that you wish to exclude from damage. Any other creature within the area takes [[[[{?{Casting Level},20}kl1]]d6]] points of fire damage.`,
          component_details:null
        },
        'fire trap': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Fire_Trap',
          school:           'Abjuration [Fire]',
          level:            'Drd 2, Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '10 minutes',
          range:            'Touch',
          target_type:      'Target',
          target:           'Object touched',
          duration:         'Permanent until discharged (D)',
          saving_throw:     'Reflex half; see text',
          spell_resistance: 'Yes',
          text:             `*Fire trap* creates a fiery explosion when an intruder opens the item that the trap protects. A *fire trap* can ward any object that can be opened and closed.
                             When casting *fire trap*, you select a point on the object as the spell’s center. When someone other than you opens the object, a fiery explosion fills the area within a 5-foot radius around the spell’s center. The flames deal [[1d4+[[{?{Casting Level},20}kl1]]]] points of fire damage. The item protected by the trap is not harmed by this explosion.
                             A *fire trapped* item cannot have a second closure or warding spell placed on it.
                             A [*knock*](https://www.dandwiki.com/wiki/SRD:Knock) spell does not bypass a *fire trap*. An unsuccessful [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) spell does not detonate the spell.
                             Underwater, this ward deals half damage and creates a large cloud of steam.
                             You can use the *fire trapped* object without discharging it, as can any individual to whom the object was specifically attuned when cast. Attuning a *fire trapped* object to an individual usually involves setting a password that you can share with friends.
                             *Note:* Magic traps such as *fire trap* are hard to detect and disable. A rogue (only) can use the Search skill to find a *fire trap* and Disable Device to thwart it. The DC in each case is 25 + spell level (DC 27 for a druid’s *fire trap* or DC 29 for the arcane version).`,
          component_details:'Material Component: A half-pound of gold dust (cost 25 gp) sprinkled on the warded object.'
        },
        'fireball': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Fireball',
          school:           'Evocation [Fire]',
          level:            'Sor/Wiz 3',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Area',
          target:           '20-ft.-radius spread',
          duration:         'Instantaneous',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `A *fireball* spell is an explosion of flame that detonates with a low roar and deals [[[[{?{Casting Level},10}kl1]]d6]] points of fire damage to every creature within the area. Unattended objects also take this damage. The explosion creates almost no pressure.
                             You point your finger and determine the range (distance and height) at which the *fireball* is to burst. A glowing, pea-sized bead streaks from the pointing digit and, unless it impacts upon a material body or solid barrier prior to attaining the prescribed range, blossoms into the *fireball* at that point. (An early impact results in an early detonation.) If you attempt to send the bead through a narrow passage, such as through an arrow slit, you must “hit” the opening with a ranged [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack), or else the bead strikes the barrier and detonates prematurely.
                             The *fireball* sets fire to combustibles and damages objects in the area. It can melt metals with low melting points, such as lead, gold, copper, silver, and bronze. If the damage caused to an interposing barrier shatters or breaks through it, the *fireball* may continue beyond the barrier if the area permits; otherwise it stops at the barrier just as any other spell effect does.`,
          component_details:'Material Component: A tiny ball of bat guano and sulfur.'
        },
        'flame arrow': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Flame_Arrow',
          school:           'Transmutation [Fire]',
          level:            'Sor/Wiz 3',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'Fifty projectiles, all of which must be in contact with each other at the time of casting',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You turn ammunition (such as arrows, bolts, shuriken, and stones) into fiery projectiles. Each piece of ammunition deals an extra ‹1d6› points of fire damage to any target it hits. A flaming projectile can easily ignite a flammable object or structure, but it won’t ignite a creature it strikes.`,
          component_details:'Material Component: A drop of oil and a small piece of flint.'
        },
        'flame blade': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Flame_Blade',
          school:           'Evocation [Fire]',
          level:            'Drd 2',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '0 ft.',
          target_type:      'Effect',
          target:           'Sword-like beam',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `A 3-foot-long, blazing beam of red-hot fire springs forth from your hand. You wield this bladelike beam as if it were a scimitar. Attacks with the *flame blade* are melee [touch attacks](https://www.dandwiki.com/wiki/SRD:Touch_Attack). The blade deals [[1d8+[[{?{Casting Level},10}kl1]]]] points of fire damage. Since the blade is immaterial, your Strength modifier does not apply to the damage. A *flame blade* can ignite combustible materials such as parchment, straw, dry sticks, and cloth.
                             The spell does not function underwater.`,
          component_details:null
        },
        'flame strike': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Flame_Strike',
          school:           'Evocation [Fire]',
          level:            'Clr 5, Drd 4, Sun 5, War 5',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Area',
          target:           'Cylinder (10-ft. radius, 40 ft. high)',
          duration:         'Instantaneous',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `A *flame strike* produces a vertical column of divine fire roaring downward. The spell deals [[[[{?{Caster Level},15}kl1]]d6]] points of damage. Half the damage is fire damage, but the other half results directly from divine power and is therefore not subject to being reduced by resistance to fire-based attacks.`,
          component_details:null
        },
        'flaming sphere': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Flaming_Sphere',
          school:           'Evocation [Fire]',
          level:            'Drd 2, Sor/Wiz 2',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           '5-ft.-diameter sphere',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Reflex negates',
          spell_resistance: 'Yes',
          text:             `A burning globe of fire rolls in whichever direction you point and burns those it strikes. It moves 30 feet per round. As part of this movement, it can ascend or jump up to 30 feet to strike a target. If it enters a space with a creature, it stops moving for the round and deals ‹2d6› points of fire damage to that creature, though a successful Reflex save negates that damage. A *flaming sphere* rolls over barriers less than 4 feet tall. It ignites flammable substances it touches and illuminates the same area as a torch would.
                             The sphere moves as long as you actively direct it (a move action for you); otherwise, it merely stays at rest and burns. It can be extinguished by any means that would put out a normal fire of its size. The surface of the sphere has a spongy, yielding consistency and so does not cause damage except by its flame. It cannot push aside unwilling creatures or batter down large obstacles. A *flaming sphere* winks out if it exceeds the spell’s range.`,
          component_details:'Arcane Material Component: A bit of tallow, a pinch of brimstone, and a dusting of powdered iron.'
        },
        'flare': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Flare',
          school:           'Evocation [Light]',
          level:            'Brd 0, Drd 0, Sor/Wiz 0',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'Burst of light',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `This cantrip creates a burst of light. If you cause the light to burst directly in front of a single creature, that creature is [dazzled](https://www.dandwiki.com/wiki/SRD:Dazzled) for 1 minute unless it makes a successful Fortitude save. Sightless creatures, as well as creatures already [dazzled](https://www.dandwiki.com/wiki/SRD:Dazzled), are not affected by *flare*.`,
          component_details:null
        },
        'flesh to stone': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Flesh_to_Stone',
          school:           'Transmutation',
          level:            'Sor/Wiz 6',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One creature',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `The subject, along with all its carried gear, turns into a mindless, inert statue. If the statue resulting from this spell is broken or damaged, the subject (if ever returned to its original state) has similar damage or deformities. The creature is not [dead](https://www.dandwiki.com/wiki/SRD:Dead), but it does not seem to be alive either when viewed with spells such as [*deathwatch*](https://www.dandwiki.com/wiki/SRD:Deathwatch).
                             Only creatures made of flesh are affected by this spell.`,
          component_details:'*Material Component:* Lime, water, and earth.'
        },
        'floating disk': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Floating_Disk',
          school:           'Evocation [Force]',
          level:            'Sor/Wiz 1',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           '3-ft.-diameter disk of force',
          duration:         '[[?{Casting Level}]] hour(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You create a slightly concave, circular plane of force that follows you about and carries loads for you. The disk is 3 feet in diameter and 1 inch deep at its center. It can hold [[100*?{Casting Level}]] pounds of weight. (If used to transport a liquid, its capacity is 2 gallons.) The disk floats approximately 3 feet above the ground at all times and remains level. It floats along horizontally within spell range and will accompany you at a rate of no more than your normal speed each round. If not otherwise directed, it maintains a constant interval of 5 feet between itself and you. The disk winks out of existence when the spell duration expires. The disk also winks out if you move beyond range or try to take the disk more than 3 feet away from the surface beneath it. When the disk winks out, whatever it was supporting falls to the surface beneath it.`,
          component_details:'Material Component: A drop of mercury.'
        },
        'fly': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Fly_%28Spell%29',
          school:           'Transmutation',
          level:            'Sor/Wiz 3, Travel 3',
          components:       'V, S, F/DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The subject can fly at a speed of 60 feet (or 40 feet if it wears medium or heavy armor, or if it carries a medium or heavy load). It can ascend at half speed and descend at double speed, and its maneuverability is good. Using a *fly* spell requires only as much concentration as walking, so the subject can attack or cast spells normally. The subject of a *fly* spell can charge but not run, and it cannot carry aloft more weight than its maximum load, plus any armor it wears.
                             Should the spell duration expire while the subject is still aloft, the magic fails slowly. The subject floats downward 60 feet per round for 1d6 rounds. If it reaches the ground in that amount of time, it lands safely. If not, it falls the rest of the distance, taking 1d6 points of damage per 10 feet of fall. Since dispelling a spell effectively ends it, the subject also descends in this way if the *fly* spell is dispelled, but not if it is negated by an [*antimagic field*](https://www.dandwiki.com/wiki/SRD:Antimagic_Field).`,
          component_details:'Arcane Focus: A wing feather from any bird.'
        },
        'fog cloud': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Fog_Cloud',
          school:           'Conjuration (Creation)',
          level:            'Drd 2, Sor/Wiz 2, Water 2, Weather 2',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Fog spreads in 20-ft. radius, 20 ft. high',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `A bank of fog billows out from the point you designate. The fog obscures all sight, including darkvision, beyond 5 feet. A creature within 5 feet has [concealment](https://www.dandwiki.com/wiki/SRD:Concealment) (attacks have a 20% miss chance). Creatures farther away have total concealment (50% miss chance, and the attacker can’t use sight to locate the target).
                             A moderate wind (11+ mph) disperses the fog in 4 rounds; a strong wind (21+ mph) disperses the fog in 1 round.
                             The spell does not function underwater.`,
          component_details:null
        },
        'forbiddance': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Forbiddance',
          school:           'Abjuration',
          level:            'Clr 6',
          components:       'V, S, M, DF',
          casting_time:     '6 rounds',
          range:            'medium',
          target_type:      'Area',
          target:           '[[?{Casting Level}]] × 60-ft. cube (S)',
          duration:         'Permanent',
          saving_throw:     'See text',
          spell_resistance: 'Yes',
          text:             `*Forbiddance* seals an area against all planar travel into or within it. This includes all teleportation spells (such as [*dimension door*](https://www.dandwiki.com/wiki/SRD:Dimension_Door) and [*teleport*](https://www.dandwiki.com/wiki/SRD:Teleport)), plane shifting, astral travel, ethereal travel, and all summoning spells. Such effects simply fail automatically.
                             In addition, it damages entering creatures whose alignments are different from yours. The effect on those attempting to enter the warded area is based on their alignment relative to yours (see below). A creature inside the area when the spell is cast takes no damage unless it exits the area and attempts to reenter, at which time it is affected as normal.
                             *Alignments identical:* No effect. The creature may enter the area freely (although not by planar travel).
                             *Alignments different with respect to either law/chaos or good/evil:* The creature takes ‹6d6› points of damage. A successful Will save halves the damage, and spell resistance applies.
                             *Alignments different with respect to both law/chaos and good/evil:* The creature takes ‹12d6› points of damage. A successful Will save halves the damage, and spell resistance applies.
                             At your option, the abjuration can include a password, in which case creatures of alignments different from yours can avoid the damage by speaking the password as they enter the area. You must select this option (and the password) at the time of casting.
                             [*Dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) does not dispel a *forbiddance* effect unless the dispeller’s level is at least as high as your caster level.
                             You can’t have multiple overlapping *forbiddance* effects. In such a case, the more recent effect stops at the boundary of the older effect.`,
          component_details:'Material Component: A sprinkling of holy water and rare incenses worth at least 1,500 gp, plus 1,500 gp per 60-foot cube. If a password is desired, this requires the burning of additional rare incenses worth at least 1,000 gp, plus 1,000 gp per 60-foot cube.'
        },
        'forcecage': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Forcecage',
          school:           'Evocation [Force]',
          level:            'Sor/Wiz 7',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Area',
          target:           'Barred cage (20-ft. cube) or windowless cell (10-ft. cube)',
          duration:         '[[2*?{Casting Level}]] hour(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This powerful spell brings into being an immobile, [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) cubical prison composed of either bars of force or solid walls of force (your choice).
                             Creatures within the area are caught and contained unless they are too big to fit inside, in which case the spell automatically fails. Teleportation and other forms of astral travel provide a means of escape, but the force walls or bars extend into the Ethereal Plane, blocking ethereal travel.
                             Like a [*wall of force*](https://www.dandwiki.com/wiki/SRD:Wall_of_Force) spell, a *forcecage* resists [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic), but it is vulnerable to a *disintegrate* spell, and it can be destroyed by a *sphere of annihilation* or a *rod of cancellation*.
                             *Barred Cage:* This version of the spell produces a 20-foot cube made of bands of force (similar to a *wall of force* spell) for bars. The bands are a half-inch wide, with half-inch gaps between them. Any creature capable of passing through such a small space can escape; others are confined. You can’t attack a creature in a barred cage with a weapon unless the weapon can fit between the gaps. Even against such weapons (including arrows and similar ranged attacks), a creature in the barred cage has cover. All spells and breath weapons can pass through the gaps in the bars.
                             *Windowless Cell:* This version of the spell produces a 10-foot cube with no way in and no way out. Solid walls of force form its six sides.`,
          component_details:'Material Component: Ruby dust worth 1,500 gp, which is tossed into the air and disappears when you cast the spell.'
        },
        'forceful hand': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Forceful_Hand',
          school:           'Evocation [Force]',
          level:            'Sor/Wiz 6',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           '10-ft. hand',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `This spell functions like [*interposing hand*](https://www.dandwiki.com/wiki/SRD:Interposing_Hand), except that the *forceful hand* pursues and pushes away the opponent that you designate. Treat this attack as a [bull rush](https://www.dandwiki.com/wiki/SRD:Bull_Rush) with a +14 \`\`bonus\`\` on the Strength check (+8 for Strength 27, +4 for being Large, and a +2 bonus for charging, which it always gets). The hand always moves with the opponent to push that target back the full distance allowed, and it has no speed limit. Directing the spell to a new target is a move action.
                             A very strong creature could not push the hand out of its way because the latter would instantly reposition itself between the creature and you, but an opponent could push the hand up against you by successfully bull rushing it.`,
          component_details:'Focus: A sturdy glove made of leather or heavy cloth.'
        },
        'foresight': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Foresight',
          school:           'Divination',
          level:            'Drd 9, Knowledge 9, Sor/Wiz 9',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'Personal or touch',
          target_type:      'Target',
          target:           'See text',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'None or Will negates (harmless)',
          spell_resistance: 'No or Yes (harmless)',
          text:             `This spell grants you a powerful sixth sense in relation to yourself or another. Once *foresight* is cast, you receive instantaneous warnings of impending danger or harm to the subject of the spell. You are never surprised or flat-footed. In addition, the spell gives you a general idea of what action you might take to best protect yourself and gives you a +2 \`\`insight bonus\`\` to AC and Reflex saves. This insight bonus is lost whenever you would lose a Dexterity bonus to AC.
                             When another creature is the subject of the spell, you receive warnings about that creature. You must communicate what you learn to the other creature for the warning to be useful, and the creature can be caught unprepared in the absence of such a warning. Shouting a warning, yanking a person back, and even telepathically communicating (via an appropriate spell) can all be accomplished before some danger befalls the subject, provided you act on the warning without delay. The subject, however, does not gain the insight bonus to AC and Reflex saves.`,
          component_details:'Arcane Material Component: A hummingbird’s feather.'
        },
        'fox\'s cunning': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Fox%27s_Cunning',
          school:           'Transmutation',
          level:            'Asn 2, Brd 2, Sor/Wiz 2',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes',
          text:             `The transmuted creature becomes smarter. The spell grants a +4 \`\`enhancement bonus\`\` to Intelligence, adding the usual benefits to Intelligence-based skill checks and other uses of the Intelligence modifier. Wizards (and other spellcasters who rely on Intelligence) affected by this spell do not gain any additional bonus spells for the increased Intelligence, but the save DCs for spells they cast while under this spell’s effect do increase. This spell doesn’t grant extra skill points.`,
          component_details:'Arcane Material Component: A few hairs, or a pinch of dung, from a fox.'
        },
        'freedom': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Freedom',
          school:           'Abjuration',
          level:            'Liberation 9, Sor/Wiz 9',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Close ([[25+(5*floor([[?{Casting Level}/2]]))]] ft.) or see text',
          target_type:      'Target',
          target:           'One creature',
          duration:         'Instantaneous',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes',
          text:             `The subject is freed from spells and effects that restrict its movement, including [*binding*](https://www.dandwiki.com/wiki/SRD:Binding), [*entangle*](https://www.dandwiki.com/wiki/SRD:Entangle), [grappling](https://www.dandwiki.com/wiki/SRD:Grapple), [*imprisonment*](https://www.dandwiki.com/wiki/SRD:Imprisonment), [*maze*](https://www.dandwiki.com/wiki/SRD:Maze), [paralysis](https://www.dandwiki.com/wiki/SRD:Paralysis), [*petrification*](https://www.dandwiki.com/wiki/SRD:Flesh_to_Stone), [pinning](https://www.dandwiki.com/wiki/SRD:Grapple), [*sleep*](https://www.dandwiki.com/wiki/SRD:Sleep), [*slow*](https://www.dandwiki.com/wiki/SRD:Slow), [stunning](https://www.dandwiki.com/wiki/SRD:Stunned), [*temporal stasis*](https://www.dandwiki.com/wiki/SRD:Temporal_Stasis), and [*web*](https://www.dandwiki.com/wiki/SRD:Web). To free a creature from *imprisonment* or *maze*, you must know its name and background, and you must cast this spell at the spot where it was entombed or banished into the *maze*.`,
          component_details:null
        },
        'freedom of movement': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Freedom_of_Movement',
          school:           'Abjuration',
          level:            'Asn 4, Blg 4, Brd 4, Clr 4, Drd 4, Liberation 4, Luck 4, Rgr 4',
          components:       'V, S, M, DF',
          casting_time:     '1 standard action',
          range:            'Personal or touch',
          target_type:      'Target',
          target:           'You or creature touched',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `This spell enables you or a creature you touch to move and attack normally for the duration of the spell, even under the influence of magic that usually impedes movement, such as [paralysis](https://www.dandwiki.com/wiki/SRD:Paralysis), [*solid fog*](https://www.dandwiki.com/wiki/SRD:Solid_Fog), [*slow*](https://www.dandwiki.com/wiki/SRD:Slow), and [*web*](https://www.dandwiki.com/wiki/SRD:Web). The subject automatically succeeds on any [grapple](https://www.dandwiki.com/wiki/SRD:Grapple) check made to resist a grapple attempt, as well as on grapple checks or Escape Artist checks made to escape a grapple or a pin.
                             The spell also allows the subject to move and attack normally while underwater, even with slashing weapons such as axes and swords or with bludgeoning weapons such as flails, hammers, and maces, provided that the weapon is wielded in the hand rather than hurled. The *freedom of movement* spell does not, however, allow water breathing.`,
          component_details:'Material Component: A leather thong, bound around the arm or a similar appendage.'
        },
        'freezing sphere': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Freezing_Sphere',
          school:           'Evocation [Cold]',
          level:            'Sor/Wiz 6',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Target, Effect, or Area',
          target:           'See text',
          duration:         'Instantaneous or [[?{Casting Level}]] round(s); see text',
          saving_throw:     'Reflex half; see text',
          spell_resistance: 'Yes',
          text:             `*Freezing sphere* creates a frigid globe of cold energy that streaks from your fingertips to the location you select, where it explodes in a 10-foot-radius burst, dealing [[[[{?{Casting Level},15}kl1]]d6]] points of cold damage to each creature in the area. An elemental (water) creature instead takes [[[[{?{Casting Level},15}kl1]]d8]] points of cold damage.
                             If the *freezing sphere* strikes a body of water or a liquid that is principally water (not including water-based creatures), it freezes the liquid to a depth of 6 inches over an area equal to [[100*[[{?{Casting Level},15}kl1]]]] square feet. This ice lasts for [[?{Casting Level}]] round(s). Creatures that were swimming on the surface of frozen water become trapped in the ice. Attempting to break free is a full-round action. A trapped creature must make a DC 25 Strength check or a DC 25 Escape Artist check to do so.
                             You can refrain from firing the globe after completing the spell, if you wish. Treat this as a touch spell for which you are holding the charge. You can hold the charge for as long as [[?{Casting Level}]] round(s), at the end of which time the *freezing sphere* bursts centered on you (and you receive no saving throw to resist its effect). Firing the globe in a later round is a standard action.`,
          component_details:'Focus: A small crystal sphere.'
        },
        // Spells that start with G
        'gaseous form': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Gaseous_Form_%28Spell%29',
          school:           'Transmutation',
          level:            'Air 3, Brd 3, Sor/Wiz 3',
          components:       'S, M/DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Willing corporeal creature touched',
          duration:         '[[2*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `The subject and all its gear become insubstantial, misty, and translucent. Its material armor (including natural armor) becomes worthless, though its size, Dexterity, deflection bonuses, and armor bonuses from force effects still apply. The subject gains damage reduction 10/magic and becomes immune to poison and critical hits. It can’t attack or cast spells with verbal, somatic, material, or focus components while in gaseous form. (This does not rule out the use of certain spells that the subject may have prepared using the feats [Silent Spell](https://www.dandwiki.com/wiki/SRD:Silent_Spell), [Still Spell](https://www.dandwiki.com/wiki/SRD:Still_Spell), and [Eschew Materials](https://www.dandwiki.com/wiki/SRD:Eschew_Materials).) The subject also loses supernatural abilities while in gaseous form. If it has a touch spell ready to use, that spell is discharged harmlessly when the *gaseous form* spell takes effect.
                             A gaseous creature can’t run, but it can fly at a speed of 10 feet (maneuverability perfect). It can pass through small holes or narrow openings, even mere cracks, with all it was wearing or holding in its hands, as long as the spell persists. The creature is subject to the effects of wind, and it can’t enter water or other liquid. It also can’t manipulate objects or activate items, even those carried along with its gaseous form. Continuously active items remain active, though in some cases their effects may be moot.`,
          component_details:'Arcane Material Component: A bit of gauze and a wisp of smoke.'
        },
        'gate': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Gate',
          school:           'Conjuration (Creation or Calling)',
          level:            'Clr 9, Glory 9, Sor/Wiz 9',
          components:       'V, S, XP; see text',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'See text',
          duration:         'Instantaneous or concentration (up to [[?{Casting Level}]] round(s)); see text',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `Casting a *gate* spell has two effects. First, it creates an interdimensional connection between your plane of existence and a plane you specify, allowing travel between those two planes in either direction.
                             Second, you may then call a particular individual or kind of being through the *gate*.
                             The *gate* itself is a circular hoop or disk from 5 to 20 feet in diameter (caster’s choice), oriented in the direction you desire when it comes into existence (typically vertical and facing you). It is a two-dimensional window looking into the plane you specified when casting the spell, and anyone or anything that moves through is shunted instantly to the other side.
                             A *gate* has a front and a back. Creatures moving through the *gate* from the front are transported to the other plane; creatures moving through it from the back are not.
                             *Planar Travel:* As a mode of planar travel, a *gate* spell functions much like a [*plane shift*](https://www.dandwiki.com/wiki/SRD:Plane_Shift) spell, except that the gate opens precisely at the point you desire (a creation effect). Deities and other beings who rule a planar realm can prevent a *gate* from opening in their presence or personal demesnes if they so desire. Travelers need not join hands with you—anyone who chooses to step through the portal is transported. A *gate* cannot be opened to another point on the same plane; the spell works only for interplanar travel.
                             You may hold the *gate* open only for a brief time (no more than 1 round per caster level), and you must concentrate on doing so, or else the interplanar connection is severed.
                             *Calling Creatures:* The second effect of the *gate* spell is to call an extraplanar creature to your aid (a calling effect). By naming a particular being or kind of being as you cast the spell, you cause the *gate* to open in the immediate vicinity of the desired creature and pull the subject through, willing or unwilling. Deities and unique beings are under no compulsion to come through the *gate*, although they may choose to do so of their own accord. This use of the spell creates a *gate* that remains open just long enough to transport the called creatures. This use of the spell has an XP cost (see below).
                             If you choose to call a kind of creature instead of a known individual you may call either a single creature (of any HD) or several creatures. You can call and control several creatures as long as their HD total does not exceed your caster level. In the case of a single creature, you can control it if its HD do not exceed twice your caster level. A single creature with more HD than twice your caster level can’t be controlled. Deities and unique beings cannot be controlled in any event. An uncontrolled being acts as it pleases, making the calling of such creatures rather dangerous. An uncontrolled being may return to its home plane at any time.
                             A controlled creature can be commanded to perform a service for you. Such services fall into two categories: immediate tasks and contractual service. Fighting for you in a single battle or taking any other actions that can be accomplished within 1 round per caster level counts as an immediate task; you need not make any agreement or pay any reward for the creature’s help. The creature departs at the end of the spell.
                             If you choose to exact a longer or more involved form of service from a called creature, you must offer some fair trade in return for that service. The service exacted must be reasonable with respect to the promised favor or reward; see the [*lesser planar ally*](https://www.dandwiki.com/wiki/SRD:Lesser_Planar_Ally) spell for appropriate rewards. (Some creatures may want their payment in “livestock” rather than in coin, which could involve complications.) Immediately upon completion of the service, the being is transported to your vicinity, and you must then and there turn over the promised reward. After this is done, the creature is instantly freed to return to its own plane.
                             Failure to fulfill the promise to the letter results in your being subjected to service by the creature or by its liege and master, at the very least. At worst, the creature or its kin may attack you.
                             *Note:* When you use a calling spell such as *gate* to call an air, chaotic, earth, evil, fire, good, lawful, or water creature, it is a spell of that type.`,
          component_details:'XP Cost: 1,000 XP (only for the *calling creatures* function).'
        },
        //Epic Spell: gathering of maggots
        'geas/quest': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Geas/Quest',
          school:           'Enchantment (Compulsion) [Language-Dependent, Mind-Affecting]',
          level:            'Brd 6, Charm 6, Clr 6, Nobility 6, Sor/Wiz 6',
          components:       'V',
          casting_time:     '10 minutes',
          range:            'close',
          target_type:      'Target',
          target:           'One living creature',
          duration:         '[[?{Casting Level}]] day(s) or until discharged (D)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `A *geas* places a magical command on a creature to carry out some service or to refrain from some action or course of activity, as desired by you. The creature must be able to understand you. While a *geas* cannot compel a creature to kill itself or perform acts that would result in certain death, it can cause almost any other course of activity.
                             The *geased* creature must follow the given instructions until the *geas* is completed, no matter how long it takes.
                             If the instructions involve some open-ended task that the recipient cannot complete through his own actions the spell remains in effect for a maximum of one day per caster level. A clever recipient can subvert some instructions:
                             If the subject is prevented from obeying the *geas* for 24 hours, the subject takes 3d6 points of damage each day it does not attempt to follow the *geas/quest*. Additionally, each day it must make a Fortitude saving throw or become [sickened](https://www.dandwiki.com/wiki/SRD:Sickened). These effects end 24 hours after the creature attempts to resume the *geas/quest*.
                             A [*remove curse*](https://www.dandwiki.com/wiki/SRD:Remove_Curse) spell ends a *geas/quest* spell only if its caster level is at least two higher than your caster level. [*Break enchantment*](https://www.dandwiki.com/wiki/SRD:Break_Enchantment) does not end a *geas/quest*, but [*limited wish*](https://www.dandwiki.com/wiki/SRD:Limited_Wish), [*miracle*](https://www.dandwiki.com/wiki/SRD:Miracle), and [*wish*](https://www.dandwiki.com/wiki/SRD:Wish) do.
                             Bards, sorcerers, and wizards usually refer to this spell as *geas*, while clerics call the same spell *quest*.`,
          component_details:null
        },
        'genesis': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Genesis',
          school:           'Conjuration (Creation)',
          level:            'Creation 9',
          components:       'V, S, M, XP',
          casting_time:     '1 week (8 hours/day)',
          range:            '180 ft.',
          target_type:      'Effect',
          target:           'A demiplane on the Ethereal Plane centered on your location',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell creates an immobile, finite plane with limited access—a demi-plane.
                             Demiplanes created by this power are very small, minor planes. A character can cast this spell only on the Ethereal Plane. When he or she casts it, a local density fluctuation precipitates the creation of a demiplane. At first, the demiplane grows at a rate of a 1-foot-radius per day to an initial maximum radius of 180 feet as the fledgling plane draws substance from surrounding ethereal vapors and protomatter or astral ectoplasm.
                             The character determines the environment in the demiplane when he or she first casts *genesis*, reflecting most any desire he or she can visualize. The caster determines factors such as atmosphere, water, temperature, and the shape of the general terrain. However, the spell cannot create life, nor can it create construction. If desired, these must be brought in by some other fashion.
                             Once the basic demiplane reaches its maximum size, the character can continue to cast this spell to enlarge the demiplane if he or she is inside the boundaries of the demiplane. In such a case, the radius of the demiplane increases by 60 feet for each subsequent casting.
                             If the spell is cast again while outside an existing demi-plane, the casting creates a separate bubble that does not touch or overlap any previously created demiplane.`,
          component_details:'XP Cost: 5,000 XP.'
        },
        'gentle repose': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Gentle_Repose',
          school:           'Necromancy',
          level:            'Clr 2, Repose 2, Sor/Wiz 3',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Corpse touched',
          duration:         '[[?{Casting Level}]] day(s)',
          saving_throw:     'Will negates (object)',
          spell_resistance: 'Yes (object)',
          text:             `You preserve the remains of a [dead](https://www.dandwiki.com/wiki/SRD:Dead) creature so that they do not decay. Doing so effectively extends the time limit on raising that creature from the [dead](https://www.dandwiki.com/wiki/SRD:Dead) (see [*raise dead*](https://www.dandwiki.com/wiki/SRD:Raise_Dead)). Days spent under the influence of this spell don’t count against the time limit. Additionally, this spell makes transporting a fallen comrade more pleasant.
                             The spell also works on severed body parts and the like.`,
          component_details:'Arcane Material Component: A pinch of salt, and a copper piece for each eye the corpse has (or had).'
        },
        'ghost sound': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Ghost_Sound',
          school:           'Illusion (Figment)',
          level:            'Asn 1, Brd 0, Sor/Wiz 0',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'Illusory sounds',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'Will disbelief (if interacted with)',
          spell_resistance: 'No',
          text:             `*Ghost sound* allows you to create a volume of sound that rises, recedes, approaches, or remains at a fixed place. You choose what type of sound *ghost sound* creates when casting it and cannot thereafter change the sound’s basic character.
                             The volume of sound created depends on your level. You can produce as much noise as [[{[[4*?{Casting Level}]],20}kl1]] normal humans. Thus, talking, singing, shouting, walking, marching, or running sounds can be created. The noise a *ghost sound* spell produces can be virtually any type of sound within the volume limit. A horde of rats running and squeaking is about the same volume as eight humans running and shouting. A roaring lion is equal to the noise from sixteen humans, while a roaring dire tiger is equal to the noise from twenty humans.
                             *Ghost sound* can enhance the effectiveness of a [*silent image*](https://www.dandwiki.com/wiki/SRD:Silent_Image) spell.
                             *Ghost sound* can be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:'Material Component: A bit of wool or a small lump of wax.'
        },
        'ghoul touch': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Ghoul_Touch',
          school:           'Necromancy',
          level:            'Sor/Wiz 2',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Living [humanoid](https://www.dandwiki.com/wiki/SRD:Humanoid_Type) touched',
          duration:         '[[1d6+2]] rounds',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `Imbuing you with negative energy, this spell allows you to paralyze a single living [humanoid](https://www.dandwiki.com/wiki/SRD:Humanoid_Type) for the duration of the spell with a successful melee [touch attack](https://www.dandwiki.com/wiki/SRD:Touch_Attack).
                             Additionally, the [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed) subject exudes a carrion stench that causes all living creatures (except you) in a 10-foot-radius spread to become [sickened](https://www.dandwiki.com/wiki/SRD:Sickened) (Fortitude negates). A [*neutralize poison*](https://www.dandwiki.com/wiki/SRD:Neutralize_Poison) spell removes the effect from a [sickened](https://www.dandwiki.com/wiki/SRD:Sickened) creature, and creatures immune to poison are unaffected by the stench.`,
          component_details:'Material Component: A small scrap of cloth taken from clothing worn by a ghoul, or a pinch of earth from a ghoul’s lair.'
        },
        'giant vermin': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Giant_Vermin',
          school:           'Transmutation',
          level:            'Clr 4, Drd 4',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           'Up to three vermin, no two of which can be more than 30 ft. apart',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `You turn three normal-sized [centipedes](https://www.dandwiki.com/wiki/SRD:Monstrous_Centipede), two normal-sized [spiders](https://www.dandwiki.com/wiki/SRD:Monstrous_Spider), or a single normal-sized [scorpion](https://www.dandwiki.com/wiki/SRD:Monstrous_Scorpion) into larger forms. Only one type of vermin can be transmuted (so a single casting cannot affect both a centipede and a spider), and all must be grown to the same size. The size to which the vermin can be grown depends on your level; see the table below.
                             Any giant vermin created by this spell do not attempt to harm you, but your control of such creatures is limited to simple commands (“Attack,” “Defend,” “Stop,” and so forth). Orders to attack a certain creature when it appears or guard against a particular occurrence are too complex for the vermin to understand. Unless commanded to do otherwise, the giant vermin attack whoever or whatever is near them.

                             • Caster Level 9th or lower
                             -- Vermin Size: Medium
                             • Caster Level 10th–13th
                             -- Vermin Size: Large
                             • Caster Level 14th–17th
                             -- Vermin Size: Huge
                             • Caster Level 18th–19th
                             -- Vermin Size: Gargantuan
                             • Caster Level 20th or higher
                             -- Vermin Size: Colossal`,
          component_details:null
        },
        'glibness': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Glibness',
          school:           'Transmutation',
          level:            'Asn 4, Brd 3',
          components:       'S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          text:             `Your speech becomes fluent and more believable. You gain a +30 \`\`bonus\`\` on Bluff checks made to convince another of the truth of your words. (This bonus doesn’t apply to other uses of the Bluff skill, such as feinting in combat, creating a diversion to hide, or communicating a hidden message via innuendo.)
                             If a magical effect is used against you that would detect your lies or force you to speak the truth the user of the effect must succeed on a caster level check (1d20 + caster level) against a DC of [[15+?{Casting Level}]] to succeed. Failure means the effect does not detect your lies or force you to speak only the truth.`,
          component_details:null
        },
        'glitterdust': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Glitterdust',
          school:           'Conjuration (Creation)',
          level:            'Brd 2, Sor/Wiz 2',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Area',
          target:           'Creatures and objects within 10-ft.-radius spread',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates (blinding only)',
          spell_resistance: 'No',
          text:             `A cloud of golden particles covers everyone and everything in the area, causing creatures to become [blinded](https://www.dandwiki.com/wiki/SRD:Blinded) and visibly outlining [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) things for the duration of the spell. All within the area are covered by the dust, which cannot be removed and continues to sparkle until it fades.
                             Any creature covered by the dust takes a -40 \`\`penalty\`\` on Hide checks.`,
          component_details:'Material Component: Ground mica.'
        },
        'globe of invulnerability': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Globe_of_Invulnerability',
          school:           'Abjuration',
          level:            'Sor/Wiz 6',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            '10 ft.',
          target_type:      'Area',
          target:           '10-ft.-radius spherical emanation, centered on you',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `An immobile, faintly shimmering magical sphere surrounds you and excludes all spell effects of 4th level or lower. The area or effect of any such spells does not include the area of the *globe of invulnerability*. Such spells fail to affect any target located within the globe. Excluded effects include spell-like abilities and spells or spell-like effects from items. However, any type of spell can be cast through or out of the magical globe. Spells of 5th level and higher are not affected by the globe, nor are spells already in effect when the globe is cast. The globe can be brought down by a targeted [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) spell, but not by an area *dispel magic*. You can leave and return to the globe without penalty.
                             Note that spell effects are not disrupted unless their effects enter the globe, and even then they are merely suppressed, not dispelled.
                             If a given spell has more than one level depending on which character class is casting it, use the level appropriate to the caster to determine whether *globe of invulnerability* stops it.`,
          component_details:'Material Component: A glass or crystal bead that shatters at the expiration of the spell.'
        },
        'glossolalia': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Glossolalia',
          school:           'Evocation [Sonic, Mind-Affecting]',
          level:            'Bard 2',
          components:       'V',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped burst',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude partial; see text',
          spell_resistance: 'Yes',
          text:             `You utter shrieks of nonsense and gibberish that thinking creatures find distracting and confusing. The spell affects only creatures with Intelligence scores of 3 or higher. Any such creatures within the spell’s area must succeed on Fortitude saves or be [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round (if they have Intelligence scores of 20 or higher), [dazed](https://www.dandwiki.com/wiki/SRD:Dazed) for 1 round (if they have Intelligence scores between 10 and 19), or [shaken](https://www.dandwiki.com/wiki/SRD:Shaken) for 1 round (if they have Intelligence scores between 3 and 9). In addition, a creature within the spell’s area loses any psionic focus it might have had and takes a -4 \`\`penalty\`\` on Concentration checks for 1 round. These effects happen whether or not the creature succeeded on its save.`,
          component_details:null
        },
        'glyph of warding': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Glyph_of_Warding',
          school:           'Abjuration',
          level:            'Clr 3, Rune 3',
          components:       'V, S, M',
          casting_time:     '10 minutes',
          range:            'Touch',
          target_type:      'Target, or Area',
          target:           'Object touched or up to [[5*?{Casting Level}]] sq. ft.',
          duration:         'Permanent until discharged (D)',
          saving_throw:     'See text',
          spell_resistance: 'No (object) and Yes; see text',
          text:             `This powerful inscription harms those who enter, pass, or open the warded area or object. A *glyph of warding* can guard a bridge or passage, ward a portal, trap a chest or box, and so on.
                             You set the conditions of the ward. Typically, any creature entering the warded area or opening the warded object without speaking a password (which you set when casting the spell) is subject to the magic it stores. Alternatively or in addition to a password trigger, *glyphs* can be set according to physical characteristics (such as height or weight) or creature type, subtype, or kind. *Glyphs* can also be set with respect to good, evil, law, or chaos, or to pass those of your religion. They cannot be set according to class, Hit Dice, or level. *Glyphs* respond to [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) creatures normally but are not triggered by those who travel past them [Ethereal](https://www.dandwiki.com/wiki/SRD:Etherealness). Multiple *glyphs* cannot be cast on the same area. However, if a cabinet has three drawers, each can be separately warded.
                             When casting the spell, you weave a tracery of faintly glowing lines around the warding sigil. A *glyph* can be placed to conform to any shape up to the limitations of your total square footage. When the spell is completed, the *glyph* and tracery become nearly [invisible](https://www.dandwiki.com/wiki/SRD:Invisible).
                             *Glyphs* cannot be affected or bypassed by such means as physical or magical probing, though they can be dispelled. [*Mislead*](https://www.dandwiki.com/wiki/SRD:Mislead), [*polymorph*](https://www.dandwiki.com/wiki/SRD:Polymorph_%28Spell%29), and [*nondetection*](https://www.dandwiki.com/wiki/SRD:Nondetection) (and similar magical effects) can fool a *glyph*, though nonmagical disguises and the like can’t. [*Read magic*](https://www.dandwiki.com/wiki/SRD:Read_Magic) allows you to identify a *glyph of warding* with a DC 13 Spellcraft check. Identifying the *glyph* does not discharge it and allows you to know the basic nature of the *glyph* (version, type of damage caused, what spell is stored).
                             *Note:* Magic traps such as *glyph of warding* are hard to detect and disable. A rogue (only) can use the Search skill to find the *glyph* and Disable Device to thwart it. The DC in each case is 25 + spell level, or 28 for *glyph of warding*.
                             Depending on the version selected, a *glyph* either blasts the intruder or activates a spell.
                             *Blast Glyph:* A *blast glyph* deals 1d8 points of ‹damage|[[[[{?{Casting Level}/2,5}kl1]]d8]]› per two caster levels (maximum 5d8) to the intruder and to all within 5 feet of him or her. This damage is acid, cold, fire, electricity, or sonic (caster’s choice, made at time of casting). Each creature affected can attempt a Reflex save to take half damage. Spell resistance applies against this effect.
                             *Spell Glyph:* You can store any harmful spell of 3rd level or lower that you know. All level-dependent features of the spell are based on your caster level at the time of casting the *glyph*. If the spell has a target, it targets the intruder. If the spell has an area or an amorphous effect the area or effect is centered on the intruder. If the spell summons creatures, they appear as close as possible to the intruder and attack. Saving throws and spell resistance operate as normal, except that the DC is based on the level of the spell stored in the *glyph*.`,
          component_details:'Material Component: You trace the glyph with incense, which must first be sprinkled with powdered diamond worth at least 200 gp.'
        },
        'good hope': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Good_Hope',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] living creature(s), no two of which may be more than 30 ft. apart',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `This spell instills powerful hope in the subjects. Each affected creature gains a +2 \`\`morale bonus\`\` on saving throws, attack rolls, ability checks, skill checks, and weapon damage rolls.
                             *Good hope* counters and dispels *crushing despair*.`,
          component_details:null
        },
        'goodberry': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Goodberry',
          school:           'Transmutation',
          level:            'Drd 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           '[[2d4]] fresh berries touched',
          duration:         '[[?{Casting Level}]] day(s)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `Casting *goodberry* upon a handful of freshly picked berries makes 2d4 of them magical. You (as well as any other druid of 3rd or higher level) can immediately discern which berries are affected. Each transmuted berry provides nourishment as if it were a normal meal for a Medium creature. The berry also cures 1 point of damage when eaten, subject to a maximum of 8 points of such curing in any 24-hour period.`,
          component_details:null
        },
        'grasping hand': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Grasping_Hand',
          school:           'Evocation [Force]',
          level:            'Sor/Wiz 7, Strength 7',
          components:       'V, S, F/DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           '10-ft. hand',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `This spell functions like [*interposing hand*](https://www.dandwiki.com/wiki/SRD:Interposing_Hand), except the hand can also [grapple](https://www.dandwiki.com/wiki/SRD:Grapple) one opponent that you select. The *grasping hand* gets one [grapple](https://www.dandwiki.com/wiki/SRD:Grapple) attack per round.
                             Its attack bonus to make contact equals your caster level + your Intelligence, Wisdom, or Charisma modifier (for a wizard, cleric, or sorcerer, respectively), +10 for the hand’s Strength score (31), -1 for being Large. Its grapple bonus is this same figure, except with a +4 modifier for being Large instead of -1. The hand holds but does not harm creatures it grapples.
                             Directing the spell to a new target is a move action.
                             The *grasping hand* can also bull rush an opponent as [*forceful hand*](https://www.dandwiki.com/wiki/SRD:Forceful_Hand) does, but at a +16 \`\`bonus\`\` on the Strength check (+10 for Strength 31, +4 for being Large, and a +2 \`\`bonus\`\` for charging, which it always gets), or interpose itself as [*interposing hand*](https://www.dandwiki.com/wiki/SRD:Interposing_Hand) does.
                             Clerics who cast this spell name it for their deities.`,
          component_details:'Arcane Focus: A leather glove.'
        },
        'grease': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Grease',
          school:           'Conjuration (Creation)',
          level:            'Brd 1, Sor/Wiz 1',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target, or Area',
          target:           'One object or a 10-ft. square',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'See text',
          spell_resistance: 'No',
          text:             `A *grease* spell covers a solid surface with a layer of slippery grease. Any creature in the area when the spell is cast must make a successful Reflex save or fall. This save is repeated on your turn each round that the creature remains within the area. A creature can walk within or through the area of grease at half normal speed with a DC 10 Balance check. Failure means it can’t move that round (and must then make a Reflex save or fall), while failure by 5 or more means it falls (see the Balance skill for details).
                             The spell can also be used to create a greasy coating on an item. Material objects not in use are always affected by this spell, while an object wielded or employed by a creature receives a Reflex saving throw to avoid the effect. If the initial saving throw fails, the creature immediately drops the item. A saving throw must be made in each round that the creature attempts to pick up or use the *greased* item. A creature wearing *greased* armor or clothing gains a +10 \`\`circumstance bonus\`\` on Escape Artist checks and on grapple checks made to resist or escape a grapple or to escape a pin.`,
          component_details:'Material Component: A bit of pork rind or butter.'
        },
        'greater arcane sight': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Arcane_Sight',
          school:           'Divination',
          level:            'Sor/Wiz 7',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          text:             `This spell makes your eyes glow blue and allows you to see magical auras within 120 feet of you. The effect is similar to that of a [*detect magic*](https://www.dandwiki.com/wiki/SRD:Detect_Magic) spell, but *greater arcane sight* does not require concentration and discerns aura location immediately.
                             You know the location and power of all magical auras within your sight. An aura’s power depends on a spell’s functioning level or an item’s caster level, as noted in the description of the detect magic spell. If the items or creatures bearing the auras are in line of sight, you automatically know which spells or magical effects are active upon any individual or object you see.
                             If you concentrate on a specific creature within 120 feet of you as a standard action, you can determine whether it has any spellcasting or spell-like abilities, whether these are arcane or divine (spell-like abilities register as arcane), and the strength of the most powerful spell or spell-like ability the creature currently has available for use.
                             *Greater arcane sight* doesn’t let you identify magic items.
                             Unlike *arcane sight*, this spell cannot be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:null
        },
        'greater command': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Command',
          school:           'Enchantment (Compulsion) [Language-Dependent, Mind-Affecting]',
          level:            'Clr 5, Nobility 5',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] creature(s), no two of which can be more than 30 ft. apart',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `You give creatures a single command, which they obey to the best of their ability at their earliest opportunity. You may select from the following options. At the start of each commanded creature’s action after the first, it gets another Will save to attempt to break free from the spell. Each creature must receive the same command.
                             Approach: On its turn, the subject moves toward you as quickly and directly as possible for 1 round. The creature may do nothing but move during its turn, and it provokes attacks of opportunity for this movement as normal.
                             *Drop:* On its turn, the subject drops whatever it is holding. It can’t pick up any dropped item until its next turn.
                             *Fall:* On its turn, the subject falls to the ground and remains [prone](https://www.dandwiki.com/wiki/SRD:Prone) for 1 round. It may act normally while [prone](https://www.dandwiki.com/wiki/SRD:Prone) but takes any appropriate penalties.
                             *Flee:* On its turn, the subject moves away from you as quickly as possible for 1 round. It may do nothing but move during its turn, and it provokes attacks of opportunity for this movement as normal.
                             *Halt:* The subject stands in place for 1 round. It may not take any actions but is not considered [helpless](https://www.dandwiki.com/wiki/SRD:Helpless).
                             If the subject can’t carry out your command on its next turn, the spell automatically fails.`,
          component_details:null
        },
        'greater dispel magic': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Dispel_Magic',
          school:           'Abjuration',
          level:            'Brd 5, Clr 6, Drd 6, Liberation, 6, Sor/Wiz 6',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target, or Area',
          target:           'One spellcaster, creature, or object; or 20-ft.-radius burst',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You can use *greater dispel magic* to end ongoing spells that have been cast on a creature or object, to temporarily suppress the magical abilities of a magic item, to end ongoing spells (or at least their effects) within an area, or to counter another spellcaster’s spell. A dispelled spell ends as if its duration had expired. Some spells, as detailed in their descriptions, can’t be defeated by *greater dispel magic*. *Greater dispel magic* can dispel (but not counter) spell-like effects just as it does spells.
                             Note: The effect of a spell with an instantaneous duration can’t be dispelled, because the magical effect is already over before the *greater dispel magic* can take effect.
                             You choose to use *greater dispel magic* in one of three ways: a targeted dispel, an area dispel, or a counterspell:
                             *Targeted Dispel:* One object, creature, or spell is the target of the *greater dispel magic* spell. You make a dispel check (1d20 + your caster level, maximum +20) against the spell or against each ongoing spell currently in effect on the object or creature. The DC for this dispel check is 11 + the spell’s caster level. If you succeed on a particular check, that spell is dispelled; if you fail, that spell remains in effect.
                             If you target an object or creature that is the effect of an ongoing spell (such as a monster summoned by [*monster summoning*](https://www.dandwiki.com/wiki/SRD:Summon_Monster_I)), you make a dispel check to end the spell that conjured the object or creature.
                             If the object that you target is a magic item, you make a dispel check against the item’s caster level. If you succeed, all the item’s magical properties are suppressed for 1d4 rounds, after which the item recovers on its own. A suppressed item becomes nonmagical for the duration of the effect. An interdimensional interface (such as a bag of holding) is temporarily closed. A magic item’s physical properties are unchanged: A suppressed magic sword is still a sword (a masterwork sword, in fact). Artifacts and deities are unaffected by mortal magic such as this.
                             You automatically succeed on your dispel check against any spell that you cast yourself.
                             *Area Dispel:* When *greater dispel magic* is used in this way, the spell affects everything within a 20-foot radius.
                             For each creature within the area that is the subject of one or more spells, you make a dispel check against the spell with the highest caster level. If that check fails, you make dispel checks against progressively weaker spells until you dispel one spell (which discharges the *greater dispel magic* spell so far as that target is concerned) or until you fail all your checks. The creature’s magic items are not affected.
                             For each object within the area that is the target of one or more spells, you make dispel checks as with creatures. Magic items are not affected by an area dispel.
                             For each ongoing area or effect spell whose point of origin is within the area of the *greater dispel magic* spell, you can make a dispel check to dispel the spell.
                             For each ongoing spell whose area overlaps that of the *greater dispel magic* spell, you can make a dispel check to end the effect, but only within the overlapping area.
                             If an object or creature that is the effect of an ongoing spell (such as a monster summoned by [*monster summoning*](https://www.dandwiki.com/wiki/SRD:Summon_Monster_I)) is in the area, you can make a dispel check to end the spell that conjured that object or creature (returning it whence it came) in addition to attempting to dispel spells targeting the creature or object.
                             You may choose to automatically succeed on dispel checks against any spell that you have cast.
                             *Counterspell:* When *greater dispel magic* is used in this way, the spell targets a spellcaster and is cast as a counterspell. Unlike a true counterspell, however, *greater dispel magic* may not work; you must make a dispel check to counter the other spellcaster’s spell.
                             Additionally, greater *greater dispel magic* has a chance to dispel any effect that [*remove curse*](https://www.dandwiki.com/wiki/SRD:Remove_Curse) can remove, even if *dispel magic* can’t dispel that effect.`,
          component_details:null
        },
        'greater glyph of warding': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Glyph_of_Warding',
          school:           'Abjuration',
          level:            'Clr 6, Rune 6',
          components:       'V, S, M',
          casting_time:     '10 minutes',
          range:            'Touch',
          target_type:      'Target, or Area',
          target:           'Object touched or up to [[5*?{Casting Level}]] sq. ft.',
          duration:         'Permanent until discharged (D)',
          saving_throw:     'See text',
          spell_resistance: 'No (object) and Yes; see text',
          text:             `This powerful inscription harms those who enter, pass, or open the warded area or object. A *greater glyph of warding* can guard a bridge or passage, ward a portal, trap a chest or box, and so on.
                             You set the conditions of the ward. Typically, any creature entering the warded area or opening the warded object without speaking a password (which you set when casting the spell) is subject to the magic it stores. Alternatively or in addition to a password trigger, *glyphs* can be set according to physical characteristics (such as height or weight) or creature type, subtype, or kind. *Glyphs* can also be set with respect to good, evil, law, or chaos, or to pass those of your religion. They cannot be set according to class, Hit Dice, or level. *Glyphs* respond to [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) creatures normally but are not triggered by those who travel past them [Ethereal](https://www.dandwiki.com/wiki/SRD:Etherealness). Multiple *glyphs* cannot be cast on the same area. However, if a cabinet has three drawers, each can be separately warded.
                             When casting the spell, you weave a tracery of faintly glowing lines around the warding sigil. A *glyph* can be placed to conform to any shape up to the limitations of your total square footage. When the spell is completed, the *glyph* and tracery become nearly [invisible](https://www.dandwiki.com/wiki/SRD:Invisible).
                             *Glyphs* cannot be affected or bypassed by such means as physical or magical probing, though they can be dispelled. [*Mislead*](https://www.dandwiki.com/wiki/SRD:Mislead), [*polymorph*](https://www.dandwiki.com/wiki/SRD:Polymorph_%28Spell%29), and [*nondetection*](https://www.dandwiki.com/wiki/SRD:Nondetection) (and similar magical effects) can fool a *glyph*, though nonmagical disguises and the like can’t. [*Read magic*](https://www.dandwiki.com/wiki/SRD:Read_Magic) allows you to identify a *greater glyph of warding* with a DC 13 Spellcraft check. Identifying the *glyph* does not discharge it and allows you to know the basic nature of the *glyph* (version, type of damage caused, what spell is stored).
                             *Note:* Magic traps such as *greater glyph of warding* are hard to detect and disable. A rogue (only) can use the Search skill to find the *glyph* and Disable Device to thwart it. The DC in each case is 25 + spell level, or 28 for *greater glyph of warding*.
                             Depending on the version selected, a *glyph* either blasts the intruder or activates a spell.
                             *Greater Blast Glyph:* A *greater blast glyph* deals 1d8 points of ‹damage|[[[[{?{Casting Level}/2,10}kl1]]d8]]› per two caster levels (maximum 10d8) to the intruder and to all within 5 feet of him or her. This damage is acid, cold, fire, electricity, or sonic (caster’s choice, made at time of casting). Each creature affected can attempt a Reflex save to take half damage. Spell resistance applies against this effect.
                             *Greater Spell Glyph:* You can store any harmful spell of 6th level or lower that you know. All level-dependent features of the spell are based on your caster level at the time of casting the *glyph*. If the spell has a target, it targets the intruder. If the spell has an area or an amorphous effect the area or effect is centered on the intruder. If the spell summons creatures, they appear as close as possible to the intruder and attack. Saving throws and spell resistance operate as normal, except that the DC is based on the level of the spell stored in the *glyph*.`,
          component_details:'Material Component: You trace the *glyph* with incense, which must first be sprinkled with powdered diamond worth at least 400 gp.'
        },
        'greater heroism': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Heroism',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 5, Sor/Wiz 6',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `This spell functions like [*heroism*](https://www.dandwiki.com/wiki/SRD:Heroism), except the creature gains a +4 \`\`morale bonus\`\` on attack rolls, saves, and skill checks, immunity to fear effects, and [[{?{Casting Level},20}kl1]] temporary hit points.`,
          component_details:null
        },
        'greater invisibility': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Invisibility',
          school:           'Illusion (Glamer)',
          level:            'Asn 4, Brd 4, Sor/Wiz 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal or touch',
          target_type:      'Target',
          target:           'You or creature touched',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless) or Yes (harmless, object)',
          text:             `The creature or object touched becomes invisible, vanishing from sight, even from darkvision. If the recipient is a creature carrying gear, that vanishes, too. If you cast the spell on someone else, neither you nor your allies can see the subject, unless you can normally see [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) things or you employ magic to do so.
                             Items dropped or put down by an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) creature become visible; items picked up disappear if tucked into the clothing or pouches worn by the creature. Light, however, never becomes [invisible](https://www.dandwiki.com/wiki/SRD:Invisible), although a source of light can become so (thus, the effect is that of a light with no visible source). Any part of an item that the subject carries but that extends more than 10 feet from it becomes visible.
                             Of course, the subject is not magically [*silenced*](https://www.dandwiki.com/wiki/SRD:Silence), and certain other conditions can render the recipient detectable (such as stepping in a puddle).`,
          component_details:null
        },
        'greater magic fang': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Magic_Fang',
          school:           'Transmutation',
          level:            'Drd 3, Rgr 3, Scalykind 3',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One living creature',
          duration:         '[[?{Casting Level}]] hour(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `*Greater magic fang* gives one natural weapon of the subject a +[[{floor(?{Casting Level}/4),5}kl1]] \`\`enhancement bonus\`\` on attack and damage rolls. The spell can affect a slam attack, fist, bite, or other natural weapon. (The spell does not change an unarmed strike’s damage from nonlethal damage to lethal damage.)
                             Alternatively, you may imbue all of the creature’s natural weapons with a +1 \`\`enhancement bonus\`\` (regardless of your caster level).
                             *Greater magic fang* can be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:null
        },
        'greater magic weapon': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Magic_Weapon',
          school:           'Transmutation',
          level:            'Clr 4, Pal 3, Sor/Wiz 3',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One weapon or fifty projectiles (all of which must be in contact with each other at the time of casting)',
          duration:         '[[?{Casting Level}]] hour(s)',
          saving_throw:     'Will negates (harmless, object)',
          spell_resistance: 'Yes (harmless, object)',
          text:             `*Greater magic weapon* gives a weapon a +[[{floor(?{Casting Level}/4),5}kl1]] \`\`enhancement bonus\`\` on attack and damage rolls. (An enhancement bonus does not stack with a masterwork weapon’s +1 bonus on attack rolls.)
                             You can’t cast this spell on a natural weapon, such as an unarmed strike (instead, see [*greater magic fang*](https://www.dandwiki.com/wiki/SRD:Greater_Magic_Fang)). A monk’s unarmed strike is considered a weapon, and thus it can be enhanced by this spell.
                             Alternatively, you can affect as many as fifty arrows, bolts, or bullets. The projectiles must be of the same kind, and they have to be together (in the same quiver or other container). Projectiles, but not thrown weapons, lose their transmutation when used. (Treat shuriken as projectiles, rather than as thrown weapons, for the purpose of this spell.)`,
          component_details:'Arcane Material Component: Powdered lime and carbon.'
        },
        'greater planar ally': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Planar_Ally',
          school:           'Conjuration (Calling) [see text]',
          level:            'Clr 8',
          components:       'V, S, DF, XP',
          casting_time:     '10 minutes',
          range:            'close',
          target_type:      'Effect',
          target:           'Up to three called [elementals](https://www.dandwiki.com/wiki/SRD:Elemental_Type) or [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type), totaling no more than 18 HD, no two of which can be more than 30 ft. apart when they appear.',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `By casting this spell, you request your deity to send you an elemental or outsider (of 18 HD or less) of the deity’s choice. If you serve no particular deity, the spell is a general plea answered by a creature sharing your philosophical alignment. If you know an individual creature’s name, you may request that individual by speaking the name during the spell (though you might get a different creature anyway).
                             You may ask the creature to perform one task in exchange for a payment from you. Tasks might range from the simple to the complex. You must be able to communicate with the creature called in order to bargain for its services.
                             The creature called requires a payment for its services. This payment can take a variety of forms, from donating gold or magic items to an allied temple, to a gift given directly to the creature, to some other action on your part that matches the creature’s alignment and goals. Regardless, this payment must be made before the creature agrees to perform any services. The bargaining takes at least 1 round, so any actions by the creature begin in the round after it arrives. The creatures agree to help you and request your return payment together.
                             A task taking up to 1 minute per caster level requires a payment of 100 gp per HD of the creature called. For a task taking up to 1 hour per caster level, the creature requires a payment of 500 gp per HD. A long-term task, one requiring up to one day per caster level, requires a payment of 1,000 gp per HD.
                             A nonhazardous task requires only half the indicated payment, while an especially hazardous task might require a greater gift. Few if any creatures will accept a task that seems suicidal (remember, a called creature actually dies when it is killed, unlike a summoned creature). However, if the task is strongly aligned with the creature’s ethos, it may halve or even waive the payment.
                             At the end of its task, or when the duration bargained for expires, the creature returns to its home plane (after reporting back to you, if appropriate and possible).
                             *Note:* When you use a calling spell that calls an air, chaotic, earth, evil, fire, good, lawful, or water creature, it is a spell of that type.`,
          component_details:'XP Cost: 500 XP.'
        },
        'greater planar binding': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Planar_Binding',
          school:           'Conjuration (Calling) [see text]',
          level:            'Sor/Wiz 8',
          components:       'V, S',
          casting_time:     '10 minutes',
          range:            'Close ([[25+(5*floor([[?{Casting Level}/2]]))]] ft.); see text',
          target_type:      'Targets',
          target:           'Up to three [elementals](https://www.dandwiki.com/wiki/SRD:Elemental_Type) or [outsiders](https://www.dandwiki.com/wiki/SRD:Outsider_Type), totaling no more than 18 HD, no two of which can be more than 30 ft. apart when they appear.',
          duration:         'Instantaneous',
          saving_throw:     'Will negates',
          spell_resistance: 'No and Yes; see text',
          text:             `Casting this spell attempts a dangerous act: to lure a creature from another plane to a specifically prepared trap, which must lie within the spell’s range. The called creature is held in the trap until it agrees to perform one service in return for its freedom.
                             To create the trap, you must use a Magic Circle spell, focused inward. The kind of creature to be bound must be known and stated. If you wish to call a specific individual, you must use that individual’s proper name in casting the spell.
                             The target creature is allowed a Will saving throw. If the saving throw succeeds, the creature resists the spell. If the saving throw fails, the creature is immediately drawn to the trap (spell resistance does not keep it from being called). The creature can escape from the trap with by successfully pitting its spell resistance against your caster level check, by dimensional travel, or with a successful Charisma check (DC 15 + 1/2 your caster level + your Cha modifier). It can try each method once per day. If it breaks loose, it can flee or attack you. A [*dimensional anchor*](https://www.dandwiki.com/wiki/SRD:Dimensional_Anchor) cast on the creature prevents its escape via dimensional travel. You can also employ a calling diagram (see [*magic circle against evil*](https://www.dandwiki.com/wiki/SRD:Magic_Circle_against_Evil)) to make the trap more secure.
                             If the creature does not break free of the trap, you can keep it bound for as long as you dare. You can attempt to compel the creature to perform a service by describing the service and perhaps offering some sort of reward. You make a Charisma check opposed by the creature’s Charisma check. The check is assigned a bonus of +0 to +6 based on the nature of the service and the reward. If the creature wins the opposed check, it refuses service. New offers, bribes, and the like can be made or the old ones reoffered every 24 hours. This process can be repeated until the creature promises to serve, until it breaks free, or until you decide to get rid of it by means of some other spell. Impossible demands or unreasonable commands are never agreed to. If you roll a 1 on the Charisma check, the creature breaks free of the binding and can escape or attack you.
                             Each creature gets a saving throw, makes independent attempts to escape, and must be persuaded to aid you individually.
                             Once the requested service is completed, the creature need only so inform you to be instantly sent back whence it came. The creature might later seek revenge. If you assign some open-ended task that the creature cannot complete though its own actions the spell remains in effect for a maximum of one day per caster level, and the creature gains an immediate chance to break free. Note that a clever recipient can subvert some instructions.
                             *Note:* When you use a calling spell such as gate to call an air, chaotic, earth, evil, fire, good, lawful, or water creature, it is a spell of that type.`,
          component_details:null
        },
        'greater prying eyes': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Prying_Eyes',
          school:           'Divination',
          level:            'Sor/Wiz 8',
          components:       'V, S, M',
          casting_time:     '1 minute',
          range:            'One mile',
          target_type:      'Effect',
          target:           'Ten or more levitating eyes',
          duration:         '[[?{Casting Level}]] hour(s); see text (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You create [[1d4+?{Casting Level}]] semitangible, visible magical orbs (called “eyes”). These eyes move out, scout around, and return as you direct them when casting the spell. Each eye can see all things as they actually are, just as if they had [*true seeing*](https://www.dandwiki.com/wiki/SRD:True_Seeing) with a range of 120 feet in all directions. Thus, they can navigate darkened areas at full normal speed.
                             While the individual eyes are quite fragile, they’re small and difficult to spot. Each eye is a Fine [construct](https://www.dandwiki.com/wiki/SRD:Construct_Type), about the size of a small apple, that has 1 hit point, AC 18 (+8 bonus for its size), flies at a speed of 30 feet with perfect maneuverability, and has a +16 Hide modifier. It has a Spot modifier equal to [[{?{Casting Level},25}kl1]] and is subject to illusions, darkness, fog, and any other factors that would affect your ability to receive visual information about your surroundings. An eye traveling through darkness must find its way by touch.
                             When you create the eyes, you specify instructions you want them to follow in a command of no more than twenty-five words. Any knowledge you possess is known by the eyes as well.
                             In order to report their findings, the eyes must return to your hand. Each replays in your mind all it has seen during its existence. It takes an eye 1 round to replay 1 hour of recorded images. After relaying its findings, an eye disappears.
                             If an eye ever gets more than 1 mile away from you, it instantly ceases to exist. However, your link with the eye is such that you won’t know if the eye was destroyed because it wandered out of range or because of some other event.
                             The eyes exist for up to 1 hour per caster level or until they return to you. [*Dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) can destroy eyes. Roll separately for each eye caught in an area dispel. Of course, if an eye is sent into darkness, it could hit a wall or similar obstacle and destroy itself.`,
          component_details:'Material Component: A handful of crystal marbles.'
        },
        'greater psychic turmoil': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Psychic_Turmoil',
          school:           'Abjuration',
          level:            'Cleric 7, Sorcerer/Wizard 7',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Area',
          target:           '40-ft.-radius emanation centered on a point in space',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will partial; see text',
          spell_resistance: 'Yes',
          text:             `With this spell, you create an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) field that leeches away the [power points](https://www.dandwiki.com/wiki/SRD:Power_Points) of psionic characters standing within the emanation. Nonpsionic characters are unaffected.
                             When the spell is cast and at the beginning of each of your subsequent turns, psionic creatures within the area of the *greater psychic turmoil* lose 1 [power point](https://www.dandwiki.com/wiki/SRD:Power_Points) per manifester level they have. Characters who succeed on a Will save when they first come into contact with the emanation lose only half as many power points (round down) each round. Characters get only one save attempt against any particular *greater psychic turmoil* effect, even if they leave the spell’s area and later return.
                             You gain 1 temporary hit point for each power point the spell takes from a psionic creature. The temporary hit points last for 1 hour.`,
          component_details:'Material Component: Five playing cards, which are torn in half when the spell is cast.'
        },
        'greater restoration': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Restoration',
          school:           'Conjuration (Healing)',
          level:            'Clr 7',
          components:       'V, S, XP',
          casting_time:     '10 minutes',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `*Greater restoration* dispels all negative levels afflicting the healed creature. This effect also reverses [level drains](https://www.dandwiki.com/wiki/Energy_Drain,_Negative_Levels,_and_Level_Loss_(SRD_Special_Ability)#Level_Loss) by a force or creature, restoring the creature to the highest level it had previously attained. The drained levels are restored only if the time since the creature lost the level is no more than one week per caster level.
                             *Greater restoration* also dispels all magical effects penalizing the creature’s abilities, cures all temporary [ability damage](https://www.dandwiki.com/wiki/SRD:Ability_Score_Loss#Ability_Damage), and restores all points permanently drained from all ability scores. It also eliminates [fatigue](https://www.dandwiki.com/wiki/SRD:Fatigued) and [exhaustion](https://www.dandwiki.com/wiki/SRD:Exhausted), and removes all forms of [insanity](https://www.dandwiki.com/wiki/SRD:Insanity), [*confusion*](https://www.dandwiki.com/wiki/SRD:Confusion), and similar mental effects. *Greater restoration* does not restore levels or Constitution points lost due to [death](https://www.dandwiki.com/wiki/SRD:Dead).`,
          component_details:'XP Cost: 500 XP.'
        },
        //Epic Spell: greater ruin
        'greater scrying': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Scrying',
          school:           'Divination (Scrying)',
          level:            'Brd 6, Clr 7, Drd 7, Sor/Wiz 7',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'See text',
          target_type:      'Effect',
          target:           'Magical sensor',
          duration:         '[[?{Casting Level}]] hour(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `You can see and hear some creature, which may be at any distance. If the subject succeeds on a Will save, the scrying attempt simply fails. The difficulty of the save depends on how well you know the subject and what sort of physical connection (if any) you have to that creature. Furthermore, if the subject is on another plane, it gets a +5 \`\`bonus\`\` on its Will save.

                             **Will Save Modifier based on Knowledge**
                             • +10, None†
                             • +5, Secondhand (you have heard of the subject)
                             • +0, Firsthand (you have met the subject)
                             • -5, Familiar (you know the subject well)
                             † You must have some sort of connection to a creature you have no knowledge of.

                             **Will Save Modifier based on Connection**
                             • -2, Likeness or picture
                             • -4 Possession or garment
                             • -10 Body part, lock of hair, bit of nail, etc.

                             If the save fails, you can see and hear the subject and the subject’s immediate surroundings (approximately 10 feet in all directions of the subject). If the subject moves, the sensor follows at a speed of up to 150 feet.
                             As with all divination (scrying) spells, the sensor has your full visual acuity, including any magical effects. In addition, all of the following spells function reliably through the sensor: [*detect chaos*](https://www.dandwiki.com/wiki/SRD:Detect_Chaos), [*detect evil*](https://www.dandwiki.com/wiki/SRD:Detect_Evil), [*detect good*](https://www.dandwiki.com/wiki/SRD:Detect_Good), [*detect law*](https://www.dandwiki.com/wiki/SRD:Detect_Law), [*detect magic*](https://www.dandwiki.com/wiki/SRD:Detect_Magic), [*message*](https://www.dandwiki.com/wiki/SRD:Message), [*read magic*](https://www.dandwiki.com/wiki/SRD:Read_Magic), and [*tongues*](https://www.dandwiki.com/wiki/SRD:Tongues).
                             If the save succeeds, you can’t attempt to scry on that subject again for at least 24 hours.`,
          component_details:null
        },
        'greater shadow conjuration': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Shadow_Conjuration',
          school:           'Illusion (Shadow)',
          level:            'Sor/Wiz 7',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'See text',
          target_type:      'Effect',
          target:           'See text',
          duration:         'See text',
          saving_throw:     'Will disbelief (if interacted with); varies; see text',
          spell_resistance: 'Yes; see text',
          text:             `You use material from the [Plane of Shadow](https://www.dandwiki.com/wiki/SRD:Plane_of_Shadow) to shape quasi-real illusions of one or more creatures, objects, or forces. *Greater shadow conjuration* can mimic any sorcerer or wizard conjuration (summoning) or conjuration (creation) spell of 6th level or lower.
                             *Greater shadow conjurations* are actually one-fifth (20%) as strong as the real things, though creatures who believe the *greater shadow conjurations* to be real are affected by them at full strength.
                             Any creature that interacts with the conjured object, force, or creature can make a Will save to recognize its true nature.
                             Spells that deal damage have normal effects unless the affected creature succeeds on a Will save. Each disbelieving creature takes only one-fifth (20%) damage from the attack. If the disbelieved attack has a special effect other than damage, that effect is only 60% likely to occur. Regardless of the result of the save to disbelieve, an affected creature is also allowed any save that the spell being simulated allows, but the save DC is set according to *greater shadow conjuration*’s level (7th) rather than the spell’s normal level. In addition, any effect created by *greater shadow conjuration* allows spell resistance, even if the spell it is simulating does not. Shadow objects or substances have normal effects except against those who disbelieve them.
                             Against disbelievers, they are 20% likely to work.
                             A shadow creature has one-fifth the hit points of a normal creature of its kind (regardless of whether it’s recognized as shadowy). It deals normal damage and has all normal abilities and weaknesses. Against a creature that recognizes it as a shadow creature, however, the shadow creature’s damage is three-fifths (60%) normal, and all special abilities that do not deal lethal damage are only 20% likely to work. (Roll for each use and each affected character separately.) Furthermore, the shadow creature’s AC bonuses are one-fifth as large.
                             A creature that succeeds on its save sees the *greater shadow conjurations* as transparent images superimposed on vague, shadowy forms.
                             Objects automatically succeed on their Will saves against this spell.`,
          component_details:null
        },
        'greater shadow evocation': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Shadow_Evocation',
          school:           'Illusion (Shadow)',
          level:            'Sor/Wiz 8',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'See text',
          target_type:      'Effect',
          target:           'See text',
          duration:         'See text',
          saving_throw:     'Will disbelief (if interacted with)',
          spell_resistance: 'Yes',
          text:             `You tap energy from the [Plane of Shadow](https://www.dandwiki.com/wiki/SRD:Plane_of_Shadow) to cast a quasi-real, illusory version of a sorcerer or wizard evocation spell of 7th level or lower. (For a spell with more than one level, use the best one applicable to you.)
                             Spells that deal damage have normal effects unless an affected creature succeeds on a Will save. Each disbelieving creature takes only three-fifths damage from the attack. If the disbelieved attack has a special effect other than damage, that effect is one-fifth as strong (if applicable) or only 20% likely to occur. If recognized as a *greater shadow evocation*, a damaging spell deals only three-fifths (60%) damage. Regardless of the result of the save to disbelieve, an affected creature is also allowed any save (or spell resistance) that the spell being simulated allows, but the save DC is set according to *graeter shadow evocation*’s level (8th) rather than the spell’s normal level.
                             Nondamaging effects have normal effects except against those who disbelieve them. Against disbelievers, they have no effect.
                             Objects automatically succeed on their Will saves against this spell.`,
          component_details:null
        },
        'greater shout': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Shout',
          school:           'Evocation [Sonic]',
          level:            'Brd 6, Sor/Wiz 8',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Area',
          target:           'Cone-shaped burst',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude partial or Reflex negates (object); see text',
          spell_resistance: 'Yes (object)',
          text:             `You emit an ear-splitting yell that deafens and damages creatures in its path. Any creature within the area is [stunned](https://www.dandwiki.com/wiki/SRD:Stunned) for 1 round and [deafened](https://www.dandwiki.com/wiki/SRD:Deafened) for [[4d6]] rounds, and takes [[10d6]] points of sonic damage (or [[[[{?{Casting Level},20}kl1]]d6]] points of sonic damage against exposed brittle or crystalline objects or crystalline creatures). A creature in the area of the cone can negate the stunning and halve both the damage and the duration of the deafness with a successful Fortitude save. A creature holding vulnerable objects can attempt a Reflex save to negate the damage to those objects.
                             A *shout* spell cannot penetrate a [*silence*](https://www.dandwiki.com/wiki/SRD:Silence) spell.`,
          component_details:'Arcane Focus: A small metal or ivory horn.'
        },
        'greater spell immunity': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Spell_Immunity',
          school:           'Abjuration',
          level:            'Clr 8',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The warded creature is immune to the effects of one specified spell for every four levels you have. The spells must be of 8th level or lower. The warded creature effectively has unbeatable spell resistance regarding the specified spell or spells. Naturally, that immunity doesn’t protect a creature from spells for which spell resistance doesn’t apply. *Greater spell immunity* protects against spells, spell-like effects of magic items, and innate spell-like abilities of creatures. It does not protect against supernatural or extraordinary abilities, such as breath weapons or gaze attacks.
                             Only a particular spell can be protected against, not a certain domain or school of spells or a group of spells that are similar in effect.
                             A creature can have only one [*spell immunity*](https://www.dandwiki.com/wiki/SRD:Spell_Immunity) or *greater spell immunity* spell in effect on it at a time.`,
          component_details:null
        },
        //Epic Spell: greater spell resistance
        'greater status': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Status',
          school:           'Divination',
          level:            'Community 4',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           '[[floor(?{Casting Level}/3)]] creature(s) touched',
          duration:         '[[?{Casting Level}]] hour(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `When you need to keep track of comrades who may get separated, *greater status* allows you to mentally monitor their relative positions and general condition. You are aware of direction and distance to the creatures and any conditions affecting them: unharmed, wounded, [disabled](https://www.dandwiki.com/wiki/SRD:Disabled), [staggered](https://www.dandwiki.com/wiki/SRD:Staggered), [unconscious](https://www.dandwiki.com/wiki/SRD:Unconscious), [dying](https://www.dandwiki.com/wiki/SRD:Dying), [nauseated](https://www.dandwiki.com/wiki/SRD:Nauseated), [panicked](https://www.dandwiki.com/wiki/SRD:Panicked), [stunned](https://www.dandwiki.com/wiki/SRD:Stunned), [poisoned](https://www.dandwiki.com/wiki/SRD:Poison), [diseased](https://www.dandwiki.com/wiki/SRD:Disease), [*confused*](https://www.dandwiki.com/wiki/SRD:Confused), or the like. Once the spell has been cast upon the subjects, the distance between them and the caster does not affect the spell as long as they are on the same plane of existence. If a subject leaves the plane, or if it dies, the spell ceases to function for it.
                             You can also cast a limited selection of spells through the link, as if you were touching the target. You can cast any spell that meets the following conditions:
                             • **Level:** 0, 1st, or 2nd
                             • **Range:** Touch
                             • **Target:** Creature touched
                             • **Saving Throw:** harmless
                             For example, if you become aware (through the *greater status* spell) that one of your linked companions is [dying](https://www.dandwiki.com/wiki/SRD:Dying), you can cast [*cure moderate wounds*](https://www.dandwiki.com/wiki/SRD:Cure_Moderate_Wounds) to try to revive her.`,
          component_details:null
        },
        'greater teleport': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Greater_Teleport',
          school:           'Conjuration (Teleportation)',
          level:            'Sor/Wiz 7, Travel 7',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'Personal and touch',
          target_type:      'Target',
          target:           'You and touched objects or other touched willing creatures',
          duration:         'Instantaneous',
          saving_throw:     'None and Will negates (object)',
          spell_resistance: 'No and Yes (object)',
          text:             `This spell instantly transports you to a designated destination. Interplanar travel is not possible. You can bring along objects as long as their weight doesn’t exceed your maximum load. You may also bring one additional willing Medium or smaller creature (carrying gear or objects up to its maximum load) or its equivalent (see below) per three caster levels. A Large creature counts as two Medium creatures, a Huge creature counts as two Large creatures, and so forth. All creatures to be transported must be in contact with one another, and at least one of those creatures must be in contact with you. As with all spells where the range is personal and the target is you, you need not make a saving throw, nor is spell resistance applicable to you. Only objects held or in use (attended) by another person receive saving throws and spell resistance.
                             You must have some clear idea of the location and layout of the destination or a reliable description of the place to which you are teleporting. If you attempt to teleport with insufficient information (or with misleading information), you disappear and simply reappear in your original location.`,
          component_details:null
        },
        'guards and wards': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Guards_and_Wards',
          school:           'Abjuration',
          level:            'Sor/Wiz 6',
          components:       'V, S, M, F',
          casting_time:     '30 minutes',
          range:            'Anywhere within the area to be warded',
          target_type:      'Area',
          target:           'Up to [[200*?{Casting Level}]] sq. ft. (S)',
          duration:         '[[2*?{Casting Level}]] hours (D)',
          saving_throw:     'See text',
          spell_resistance: 'See text',
          text:             `This powerful spell is primarily used to defend your stronghold. The ward protects 200 square feet per caster level. The warded area can be as much as 20 feet high, and shaped as you desire. You can ward several stories of a stronghold by dividing the area among them; you must be somewhere within the area to be warded to cast the spell. The spell creates the following magical effects within the warded area.
                             *Fog:* Fog fills all corridors, obscuring all sight, including darkvision, beyond 5 feet. A creature within 5 feet has concealment (attacks have a 20% miss chance). Creatures farther away have total concealment (50% miss chance, and the attacker cannot use sight to locate the target). Saving Throw: None. Spell Resistance: No.
                             *Arcane Locks:* All doors in the warded area are [*arcane locked*](https://www.dandwiki.com/wiki/SRD:Arcane_Lock). Saving Throw: None. Spell Resistance: No.
                             *Webs:* Webs fill all stairs from top to bottom. These strands are identical with those created by the [*web*](https://www.dandwiki.com/wiki/SRD:Web) spell, except that they regrow in 10 minutes if they are burned or torn away while the *guards and wards* spell lasts. Saving Throw: Reflex negates; see text for web. Spell Resistance: No.
                             *Confusion:* Where there are choices in direction—such as a corridor intersection or side passage—a minor *confusion*-type effect functions so as to make it 50% probable that intruders believe they are going in the opposite direction from the one they actually chose. This is an enchantment, mind-affecting effect. Saving Throw: None. Spell Resistance: Yes.
                             *Lost Doors:* One door per caster level is covered by a [*silent image*](https://www.dandwiki.com/wiki/SRD:Silent_Image) to appear as if it were a plain wall. Saving Throw: Will disbelief (if interacted with). Spell Resistance: No.
                             In addition, you can place your choice of one of the following five magical effects.
                             1. [*Dancing lights*](https://www.dandwiki.com/wiki/SRD:Dancing_Lights) in four corridors. You can designate a simple program that causes the lights to repeat as long as the *guards and wards* spell lasts. Saving Throw: None. Spell Resistance: No.
                             2. A [*magic mouth*](https://www.dandwiki.com/wiki/SRD:Magic_Mouth) in two places. Saving Throw: None. Spell Resistance: No.
                             3. A [*stinking cloud*](https://www.dandwiki.com/wiki/SRD:Stinking_Cloud) in two places. The vapors appear in the places you designate; they return within 10 minutes if dispersed by wind while the *guards and wards* spell lasts. Saving Throw: Fortitude negates; see text for [*stinking cloud*](https://www.dandwiki.com/wiki/SRD:Stinking_Cloud). Spell Resistance: No.
                             4. A [*gust of wind*](https://www.dandwiki.com/wiki/SRD:Gust_of_Wind) in one corridor or room. Saving Throw: Fortitude negates. Spell Resistance: Yes.
                             5. A [*suggestion*](https://www.dandwiki.com/wiki/SRD:Suggestion) in one place. You select an area of up to 5 feet square, and any creature who enters or passes through the area receives the *suggestion* mentally. Saving Throw: Will negates. Spell Resistance: Yes.
                             The whole warded area radiates strong magic of the abjuration school. A [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) cast on a specific effect, if successful, removes only that effect. A successful [*Mage’s disjunction*](https://www.dandwiki.com/wiki/SRD:Mage%27s_Disjunction) destroys the entire *guards and wards* effect.`,
          component_details:`Material Component: Burning incense, a small measure of brimstone and oil, a knotted string, and a small amount of blood.
                             Focus: A small silver rod.`
        },
        'guidance': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Guidance',
          school:           'Divination',
          level:            'Clr 0, Drd 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '1 minute or until discharged',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes',
          text:             `This spell imbues the subject with a touch of divine guidance. The creature gets a +1 \`\`competence bonus\`\` on a single attack roll, saving throw, or skill check. It must choose to use the bonus before making the roll to which it applies.`,
          component_details:null
        },
        'gust of wind': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Gust_of_Wind',
          school:           'Evocation [Air]',
          level:            'Drd 2, Sor/Wiz 2',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            '60 ft.',
          target_type:      'Effect',
          target:           'Line-shaped gust of severe wind emanating out from you to the extreme of the range',
          duration:         '1 round',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `This spell creates a severe blast of air (approximately 50 mph) that originates from you, affecting all creatures in its path.
                             A Tiny or smaller creature on the ground is [knocked down](https://www.dandwiki.com/wiki/SRD:Knocked_Down) and rolled ‹1d4×10|[[10*1d4]]› feet, taking ‹1d4› points of nonlethal damage per 10 feet. If flying, a Tiny or smaller creature is blown back ‹2d6×10|[[10*2d6]]› feet and takes ‹2d6› points of nonlethal damage due to battering and buffeting.
                             Small creatures are knocked prone by the force of the wind, or if flying are blown back ‹1d6×10|[[10*1d6]]› feet.
                             Medium creatures are unable to move forward against the force of the wind, or if flying are blown back ‹1d6×5|[[5*1d6]]› feet.
                             Large or larger creatures may move normally within a *gust of wind* effect.
                             A *gust of wind* can’t move a creature beyond the limit of its range.
                             Any creature, regardless of size, takes a -4 \`\`penalty\`\` on ranged attacks and Listen checks in the area of a *gust of wind*.
                             The force of the gust automatically extinguishes candles, torches, and similar unprotected flames. It causes protected flames, such as those of lanterns, to dance wildly and has a 50% chance to extinguish those lights.
                             In addition to the effects noted, a *gust of wind* can do anything that a sudden blast of wind would be expected to do. It can create a stinging spray of sand or dust, fan a large fire, overturn delicate awnings or hangings, heel over a small boat, and blow gases or vapors to the edge of its range.
                             *Gust of wind* can be made permanent with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:null
        },
        // Spells that start with H
        'hallow': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hallow',
          school:           'Evocation [Good]',
          level:            'Clr 5, Drd 5',
          components:       'V, S, M, DF',
          casting_time:     '24 hours',
          range:            'Touch',
          target_type:      'Area',
          target:           '40-ft. radius emanating from the touched point',
          duration:         'Instantaneous',
          saving_throw:     'See text',
          spell_resistance: 'See text',
          text:             `*Hallow* makes a particular site, building, or structure a holy site. This has four major effects.
                             First, the site or structure is guarded by a [*magic circle against evil*](https://www.dandwiki.com/wiki/SRD:Magic_Circle_against_Evil) effect.
                             Second, all Charisma checks made to turn [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) gain a +4 \`\`sacred bonus\`\`, and Charisma checks to command [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) take a -4 \`\`penalty\`\`. Spell resistance does not apply to this effect. (This provision does not apply to the druid version of the spell.)
                             Third, any [dead](https://www.dandwiki.com/wiki/SRD:Dead) body interred in a *hallowed* site cannot be [turned](https://www.dandwiki.com/wiki/SRD:Turned) into an undead creature.
                             Finally, you may choose to fix a single spell effect to the *hallowed* site. The spell effect lasts for one year and functions throughout the entire site, regardless of the normal duration and area or effect. You may designate whether the effect applies to all creatures, creatures who share your faith or alignment, or creatures who adhere to another faith or alignment. At the end of the year, the chosen effect lapses, but it can be renewed or replaced simply by casting *hallow* again.
                             Spell effects that may be tied to a *hallowed* site include [*aid*](https://www.dandwiki.com/wiki/SRD:Aid), [*bane*](https://www.dandwiki.com/wiki/SRD:Bane), [*bless*](https://www.dandwiki.com/wiki/SRD:Bless), [*cause fear*](https://www.dandwiki.com/wiki/SRD:Cause_Fear), [*darkness*](https://www.dandwiki.com/wiki/SRD:Darkness), [*daylight*](https://www.dandwiki.com/wiki/SRD:Daylight), [*death ward*](https://www.dandwiki.com/wiki/SRD:Death_Ward), [*deeper darkness*](https://www.dandwiki.com/wiki/SRD:Deeper_Darkness), [*detect evil*](https://www.dandwiki.com/wiki/SRD:Detect_Evil), [*detect magic*](https://www.dandwiki.com/wiki/SRD:Detect_Magic), [*dimensional anchor*](https://www.dandwiki.com/wiki/SRD:Dimensional_Anchor), [*discern lies*](https://www.dandwiki.com/wiki/SRD:Discern_Lies), [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic), [*endure elements*](https://www.dandwiki.com/wiki/SRD:Endure_Elements), [*freedom of movement*](https://www.dandwiki.com/wiki/SRD:Freedom_of_Movement), [*invisibility purge*](https://www.dandwiki.com/wiki/SRD:Invisibility_Purge), [*protection from energy*](https://www.dandwiki.com/wiki/SRD:Protection_from_Energy), [*remove fear*](https://www.dandwiki.com/wiki/SRD:Remove_Fear), [*resist energy*](https://www.dandwiki.com/wiki/SRD:Resist_Energy), [*silence*](https://www.dandwiki.com/wiki/SRD:Silence), [*tongues*](https://www.dandwiki.com/wiki/SRD:Tongues), and [*zone of truth*](https://www.dandwiki.com/wiki/SRD:Zone_of_Truth). Saving throws and spell resistance might apply to these spells’ effects. (See the individual spell descriptions for details.)
                             An area can receive only one *hallow* spell (and its associated spell effect) at a time. Hallow counters but does not dispel [*unhallow*](https://www.dandwiki.com/wiki/SRD:Unhallow).`,
          component_details:'Material Component: Herbs, oils, and incense worth at least 1,000 gp, plus 1,000 gp per level of the spell to be included in the *hallowed* area.'
        },
        'hallucinatory terrain': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hallucinatory_Terrain',
          school:           'Illusion (Glamer)',
          level:            'Brd 4, Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '10 minutes',
          range:            'long',
          target_type:      'Area',
          target:           '[[?{Casting Level}]] 30-ft. cube(s) (S)',
          duration:         '[[2*?{Casting Level}]] hour(s) (D)',
          saving_throw:     'Will disbelief (if interacted with)',
          spell_resistance: 'No',
          text:             `You make natural terrain look, sound, and smell like some other sort of natural terrain. Structures, equipment, and creatures within the area are not hidden or changed in appearance.`,
          component_details:'Material Component: A stone, a twig, and a bit of green plant.'
        },
        'halt undead': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Halt_Undead',
          school:           'Necromancy',
          level:            'Sor/Wiz 3',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Targets',
          target:           'Up to three [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creatures, no two of which can be more than 30 ft. apart',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates (see text)',
          spell_resistance: 'Yes',
          text:             `This spell renders as many as three [undead creatures](https://www.dandwiki.com/wiki/SRD:Undead_Type) immobile. A nonintelligent undead creature gets no saving throw; an intelligent undead creature does. If the spell is successful, it renders the undead creature immobile for the duration of the spell (similar to the effect of [*hold person*](https://www.dandwiki.com/wiki/SRD:Hold_Person) on a living creature). The effect is broken if the *halted* creatures are attacked or take damage.`,
          component_details:'Material Component: A pinch of sulfur and powdered garlic.'
        },
        'hardening': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hardening',
          school:           'Transmutation',
          level:            'Sor/Wiz 6, Artifice 7',
          components:       'V, S',
          casting_time:     '1 action',
          range:            'Touch',
          target_type:      'Target',
          target:           'One item of a volume no greater than [[10*?{Casting Level}]] cu. ft. (see text)',
          duration:         'Permanent',
          saving_throw:     'None',
          spell_resistance: 'Yes (object)',
          text:             `This spell increases the hardness of materials. The hardness of the material targeted by the spell is increased by [[floor(?{Casting Level}/2)]]. This hardness increase improves only the material’s resistance to damage. Nothing else is modified by the improvement.
                             The *hardening* spell does not in any way affect resistance to other forms of transformation.
                             This spell affects up to [[10*?{Casting Level}]] cubic feet.
                             If cast upon a metal or mineral, the volume is reduced to [[1*?{Casting Level}]] cubic feet.`,
          component_details:null
        },
        'harm': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Harm',
          school:           'Necromancy',
          level:            'Clr 6, Destruction 6',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half; see text',
          spell_resistance: 'Yes',
          text:             `*Harm* charges a subject with negative energy that deals [[10*{[[?{Casting Level}]],15}kl1]] points of damage per caster level. If the creature successfully saves, *harm* deals half this amount, but it cannot reduce the target’s hit points to less than 1.
                             If used on an undead creature, *harm* acts like [*heal*](https://www.dandwiki.com/wiki/SRD:Heal).`,
          component_details:null
        },
        'haste': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Haste',
          school:           'Transmutation',
          level:            'Brd 3, Sor/Wiz 3',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] creature(s), no two of which can be more than 30 ft. apart',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Fortitude negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `The transmuted creatures move and act more quickly than normal. This extra speed has several effects.
                             When making a full attack action, a hasted creature may make one extra attack with any weapon he is holding. The attack is made using the creature’s full base attack bonus, plus any modifiers appropriate to the situation. (This effect is not cumulative with similar effects, such as that provided by a weapon of speed, nor does it actually grant an extra action, so you can’t use it to cast a second spell or otherwise take an extra action in the round.)
                             A *hasted* creature gains a +1 \`\`bonus\`\` on attack rolls and a +1 \`\`dodge bonus\`\` to AC and Reflex saves. Any condition that makes you lose your Dexterity bonus to Armor Class (if any) also makes you lose dodge bonuses.
                             All of the *hasted* creature’s modes of movement (including land movement, burrow, climb, fly, and swim) increase by 30 feet, to a maximum of twice the subject’s normal speed using that form of movement. This increase counts as an enhancement bonus, and it affects the creature’s jumping distance as normal for increased speed.
                             Multiple *haste* effects don’t stack. *Haste* dispels and counters [*slow*](https://www.dandwiki.com/wiki/SRD:Slow).`,
          component_details:'Material Component: A shaving of licorice root.'
        },
        'heal': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Heal',
          school:           'Conjuration (Healing)',
          level:            'Clr 6, Drd 7, Healing 6',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `*Heal* enables you to channel positive energy into a creature to wipe away injury and afflictions. It immediately ends any and all of the following adverse conditions affecting the Target: [ability damage](https://www.dandwiki.com/wiki/SRD:Ability_Score_Loss#Ability_Damage), [blinded](https://www.dandwiki.com/wiki/SRD:Blinded), [*confused*](https://www.dandwiki.com/wiki/SRD:Confused), [dazed](https://www.dandwiki.com/wiki/SRD:Dazed), [dazzled](https://www.dandwiki.com/wiki/SRD:Dazzled), [deafened](https://www.dandwiki.com/wiki/SRD:Deafened), [diseased](https://www.dandwiki.com/wiki/SRD:Disease), [exhausted](https://www.dandwiki.com/wiki/SRD:Exhausted), [fatigued](https://www.dandwiki.com/wiki/SRD:Fatigued), [*feebleminded*](https://www.dandwiki.com/wiki/SRD:Feeblemind), [insanity](https://www.dandwiki.com/wiki/SRD:Insanity), [nauseated](https://www.dandwiki.com/wiki/SRD:Nauseated), [sickened](https://www.dandwiki.com/wiki/SRD:Sickened), [stunned](https://www.dandwiki.com/wiki/SRD:Stunned), and [poisoned](https://www.dandwiki.com/wiki/SRD:Poison). It also cures [[10*{?{Caster Level},15}kl1]] hit points of damage.
                             *Heal* does not remove negative levels, restore permanently drained levels, or restore permanently drained ability score points.
                             If used against an [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature, *heal* instead acts like [*harm*](https://www.dandwiki.com/wiki/SRD:Harm).`,
          component_details:null
        },
        'heal mount': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Heal_Mount',
          school:           'Conjuration (Healing)',
          level:            'Pal 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Your mount touched',
          duration:         'Instantaneous',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `*Heal mount* enables you to channel positive energy into your special mount (typically a warhorse) to wipe away injury and afflictions. It immediately ends any and all of the following adverse conditions affecting the Target: [ability damage](https://www.dandwiki.com/wiki/SRD:Ability_Score_Loss#Ability_Damage), [blinded](https://www.dandwiki.com/wiki/SRD:Blinded), [*confused*](https://www.dandwiki.com/wiki/SRD:Confused), [dazed](https://www.dandwiki.com/wiki/SRD:Dazed), [dazzled](https://www.dandwiki.com/wiki/SRD:Dazzled), [deafened](https://www.dandwiki.com/wiki/SRD:Deafened), [diseased](https://www.dandwiki.com/wiki/SRD:Disease), [exhausted](https://www.dandwiki.com/wiki/SRD:Exhausted), [fatigued](https://www.dandwiki.com/wiki/SRD:Fatigued), [*feebleminded*](https://www.dandwiki.com/wiki/SRD:Feeblemind), [insanity](https://www.dandwiki.com/wiki/SRD:Insanity), [nauseated](https://www.dandwiki.com/wiki/SRD:Nauseated), [sickened](https://www.dandwiki.com/wiki/SRD:Sickened), [stunned](https://www.dandwiki.com/wiki/SRD:Stunned), and [poisoned](https://www.dandwiki.com/wiki/SRD:Poison). It also cures [[10*{?{Caster Level},15}kl1]] hit points of damage.
                             *Heal mount* does not remove negative levels, restore permanently drained levels, or restore permanently drained ability score points.
                             If used against an [undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creature, *heal mount* instead acts like [*harm*](https://www.dandwiki.com/wiki/SRD:Harm).`,
          component_details:null
        },
        'heat metal': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Heat_Metal',
          school:           'Transmutation [Fire]',
          level:            'Drd 2, Sun 2',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'Metal equipment of [[floor(?{Casting Level}/2)]] creature(s), no two of which can be more than 30 ft. apart; or [[25*?{Casting Level}]] lb. of metal, all of which must be within a 30-ft. circle',
          duration:         '7 rounds',
          saving_throw:     'Will negates (object)',
          spell_resistance: 'Yes (object)',
          text:             `*Heat metal* makes metal extremely warm. Unattended, nonmagical metal gets no saving throw. Magical metal is allowed a saving throw against the spell. An item in a creature’s possession uses the creature’s saving throw bonus unless its own is higher.
                             A creature takes fire damage if its equipment is heated. It takes full damage if its armor is affected or if it is holding, touching, wearing, or carrying metal weighing one-fifth of its weight. The creature takes minimum damage (1 point or 2 points; see the table) if it’s not wearing metal armor and the metal that it’s carrying weighs less than one-fifth of its weight.
                             On the first round of the spell, the metal becomes warm and uncomfortable to touch but deals no damage. The same effect also occurs on the last round of the spell’s duration. During the second (and also the next-to-last) round, intense heat causes pain and damage. In the third, fourth, and fifth rounds, the metal is searing hot, causing more damage, as shown on the table below.

                             • Round 1: ‹Warm|No fire damage›
                             • Round 2: ‹Hot|[[1d4]] fire damage›; minimum 1
                             • Round 3–5: ‹Searing|[[2d4]] fire damage›; minimum 2
                             • Round 6: ‹Hot|[[1d4]] fire damage›; minimum 1
                             • Round 7: ‹Warm|No fire damage›

                             Any cold intense enough to damage the creature negates fire damage from the spell (and vice versa) on a point-for-point basis. If cast underwater, *heat metal* deals half damage and boils the surrounding water.
                             *Heat metal* counters and dispels [*chill metal*](https://www.dandwiki.com/wiki/SRD:Chill_Metal).`,
          component_details:null
        },
        //Epic Spell: hellball
        'helping hand': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Helping_Hand',
          school:           'Evocation',
          level:            'Clr 3',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            '5 miles',
          target_type:      'Effect',
          target:           'Ghostly hand',
          duration:         '[[?{Casting Level}]] hour(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You create the ghostly image of a hand, which you can send to find a creature within 5 miles. The hand then beckons to that creature and leads it to you if the creature is willing to follow.
                             When the spell is cast, the hand appears in front of you. You then specify a person (or any creature) by physical description, which can include race, gender, and appearance but not ambiguous factors such as level, alignment, or class. When the description is complete, the hand streaks off in search of a subject that fits the description. The amount of time it takes to find the subject depends on how far away she is.

                             • **100 ft. or less:** 1 round to locate
                             • **1,000 ft.:** 1 minute to locate
                             • **1 mile:** 10 minutes to locate
                             • **2 miles:** 1 hour to locate
                             • **3 miles:** 2 hours to locate
                             • **4 miles:** 3 hours to locate
                             • **5 miles:** 4 hours to locate

                             Once the hand locates the subject, it beckons the creature to follow it. If the subject does so, the hand points in your direction, indicating the most direct feasible route. The hand hovers 10 feet in front of the subject, moving before it at a speed of as much as 240 feet per round. Once the hand leads the subject back to you, it disappears.
                             The subject is not compelled to follow the hand or act in any particular way toward you. If the subject chooses not to follow, the hand continues to beckon for the duration of the spell, then disappears. If the spell expires while the subject is en route to you, the hand disappears; the subject must then rely on her own devices to locate you.
                             If more than one subject in a 5-mile radius meets the description, the hand locates the closest creature. If that creature refuses to follow the hand, the hand does not seek out a second subject.
                             If, at the end of 4 hours of searching, the hand has found no subject that matches the description within 5 miles, it returns to you, displays an outstretched palm (indicating that no such creature was found), and disappears.
                             The ghostly hand has no physical form. It is [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) to anyone except you and a potential subject. It cannot engage in combat or execute any other task aside from locating a subject and leading it back to you. The hand can’t pass through solid objects but can [ooze](https://www.dandwiki.com/wiki/SRD:Ooze_Type) through small cracks and slits. The hand cannot travel more than 5 miles from the spot it appeared when you cast the spell.`,
          component_details:null
        },
        'heroes\' feast': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Heroes%27_Feast',
          school:           'Conjuration (Creation)',
          level:            'Brd 6, Clr 6, Community 6, Creation 6',
          components:       'V, S, DF',
          casting_time:     '10 minutes',
          range:            'close',
          target_type:      'Effect',
          target:           'Feast for [[?{Casting Level}]] creature(s)',
          duration:         '1 hour plus 12 hours; see text',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You bring forth a great feast, including a magnificent table, chairs, service, and food and drink. The feast takes 1 hour to consume, and the beneficial effects do not set in until this hour is over. Every creature partaking of the feast is cured of all diseases, sickness, and nausea; becomes immune to poison for 12 hours; and gains [[1d8+{floor(?{Casting Level}/2),10}kl1]] temporary hit points after imbibing the nectar-like beverage that is part of the feast. The ambrosial food that is consumed grants each creature that partakes a +1 morale bonus on attack rolls and Will saves and immunity to fear effects for 12 hours.
                             If the feast is interrupted for any reason, the spell is ruined and all effects of the spell are negated.`,
          component_details:null
        },
        'heroism': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Heroism',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 2, Charm 4, Sor/Wiz 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `This spell imbues a single creature with great bravery and morale in battle. The target gains a +2 \`\`morale bonus\`\` on attack rolls, saves, and skill checks.`,
          component_details:null
        },
        'hide from animals': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hide_from_Animals',
          school:           'Abjuration',
          level:            'Drd 1, Rgr 1',
          components:       'S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] creature(s) touched',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes',
          text:             `[Animals](https://www.dandwiki.com/wiki/SRD:Animal_Type) cannot see, hear, or smell the warded creatures. Even extraordinary or supernatural sensory capabilities, such as blindsense, blindsight, scent, and tremorsense, cannot detect or locate warded creatures. Animals simply act as though the warded creatures are not there. If a warded character touches an animal or attacks any creature, even with a spell, the spell ends for all recipients.`,
          component_details:null
        },
        'hide from undead': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hide_from_Undead',
          school:           'Abjuration',
          level:            'Clr 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] creature(s) touched',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Will negates (harmless); see text',
          spell_resistance: 'Yes',
          text:             `[Undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) cannot see, hear, or smell the warded creatures. Even extraordinary or supernatural sensory capabilities, such as blindsense, blindsight, scent, and tremorsense, cannot detect or locate warded creatures. Nonintelligent undead creatures are automatically affected and act as though the warded creatures are not there. An intelligent undead creature gets a single Will saving throw. If it fails, the subject can’t see any of the warded creatures. However, if it has reason to believe unseen opponents are present, it can attempt to find or strike them. If a warded creature attempts to turn or command undead, touches an undead creature, or attacks any creature (even with a spell), the spell ends for all recipients.`,
          component_details:null
        },
        'hideous laughter': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hideous_Laughter',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 1, Sor/Wiz 2',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One creature; see text',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell afflicts the subject with uncontrollable laughter. It collapses into gales of manic laughter, falling [prone](https://www.dandwiki.com/wiki/SRD:Prone). The subject can take no actions while laughing, but is not considered [helpless](https://www.dandwiki.com/wiki/SRD:Helpless). After the spell ends, it can act normally.
                             A creature with an Intelligence score of 2 or lower is not affected. A creature whose type is different from the caster’s receives a +4 \`\`bonus\`\` on its saving throw, because humor doesn’t “translate” well.`,
          component_details:'Material Component: Tiny tarts that are thrown at the target and a feather that is waved in the air.'
        },
        'hold animal': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hold_Animal',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Animal 2, Drd 2, Rgr 2',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One animal',
          duration:         '[[?{Casting Level}]] round(s) (D); see text',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `The subject becomes [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed) and freezes in place. It is aware and breathes normally but cannot take any actions, even speech. Each round on its turn, the subject may attempt a new saving throw to end the effect. (This is a full-round action that does not provoke attacks of opportunity.)
                             A winged creature who is [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed) cannot flap its wings and falls. A swimmer can’t swim and may drown.`,
          component_details:null
        },
        'hold monster': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hold_Monster',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 4, Law 6, Sor/Wiz 5',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One living creature',
          duration:         '[[?{Casting Level}]] round(s) (D); see text',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `The subject becomes [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed) and freezes in place. It is aware and breathes normally but cannot take any actions, even speech. Each round on its turn, the subject may attempt a new saving throw to end the effect. (This is a full-round action that does not provoke attacks of opportunity.)
                             A winged creature who is [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed) cannot flap its wings and falls. A swimmer can’t swim and may drown.`,
          component_details:'Arcane Material Component: One hard metal bar or rod, which can be as small as a three-penny nail.'
        },
        'hold person': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hold_Person',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 2, Clr 2, Sor/Wiz 3',
          components:       'V, S, F/DF',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One [humanoid](https://www.dandwiki.com/wiki/SRD:Humanoid_Type) creature',
          duration:         '[[?{Casting Level}]] round(s) (D); see text',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `The subject becomes [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed) and freezes in place. It is aware and breathes normally but cannot take any actions, even speech. Each round on its turn, the subject may attempt a new saving throw to end the effect. (This is a full-round action that does not provoke attacks of opportunity.)
                             A winged creature who is [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed) cannot flap its wings and falls. A swimmer can’t swim and may drown.`,
          component_details:'Arcane Focus: A small, straight piece of iron.'
        },
        'hold portal': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hold_Portal',
          school:           'Abjuration',
          level:            'Sor/Wiz 1',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One portal, up to [[20*?{Casting Level}]] sq. ft.',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'no',
          text:             `This spell magically holds shut a door, gate, window, or shutter of wood, metal, or stone. The magic affects the portal just as if it were securely closed and normally locked. A [*knock*](https://www.dandwiki.com/wiki/SRD:Knock) spell or a successful [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) spell can negate a *hold portal* spell.
                             For a portal affected by this spell, add 5 to the normal DC for forcing open the portal.`,
          component_details:null
        },
        'holy aura': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Holy_Aura',
          school:           'Abjuration [Good]',
          level:            'Clr 8, Good 8',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            '20 ft.',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] creature(s) in a 20-ft.-radius burst centered on you',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'See text',
          spell_resistance: 'Yes (harmless)',
          text:             `A brilliant divine radiance surrounds the subjects, protecting them from attacks, granting them resistance to spells cast by [evil creatures](https://www.dandwiki.com/wiki/SRD:Evil_Subtype), and causing evil creatures to become [blinded](https://www.dandwiki.com/wiki/SRD:Blinded) when they strike the subjects. This abjuration has four effects.
                             First, each warded creature gains a +4 \`\`deflection bonus\`\` to AC and a +4 \`\`resistance bonus\`\` on saves. Unlike [*protection from evil*](https://www.dandwiki.com/wiki/SRD:Protection_from_Evil), this benefit applies against all attacks, not just against attacks by evil creatures.
                             Second, each warded creature gains spell resistance 25 against evil spells and spells cast by evil creatures.
                             Third, the abjuration blocks possession and mental influence, just as *protection from evil* does.
                             Finally, if an evil creature succeeds on a melee attack against a warded creature, the offending attacker is [blinded](https://www.dandwiki.com/wiki/SRD:Blinded) (Fortitude save negates, as [*blindness/deafness*](https://www.dandwiki.com/wiki/SRD:Blindness/Deafness), but against *holy aura*’s save DC).`,
          component_details:'Focus: A tiny reliquary containing some sacred relic. The reliquary costs at least 500 gp.'
        },
        'holy smite': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Holy_Smite',
          school:           'Evocation [Good]',
          level:            'Glory 4, Good 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Area',
          target:           '20-ft.-radius burst',
          duration:         'Instantaneous (1 round); see text',
          saving_throw:     'Will partial; see text',
          spell_resistance: 'Yes',
          text:             `You draw down holy power to smite your enemies. Only evil and neutral creatures are harmed by the spell; good creatures are unaffected.
                             The spell deals [[[[{floor(?{Casting Level}/2),5}kl1]]d8]] points of damage  to each [evil creature](https://www.dandwiki.com/wiki/SRD:Outsider_(evil)) in the area (or [[[[{?{Casting Level},10}kl1]]d6]] points of damage to an [evil outsider](https://www.dandwiki.com/wiki/SRD:Outsider_Type)) and causes it to become [blinded](https://www.dandwiki.com/wiki/SRD:Blinded) for 1 round. A successful Will saving throw reduces damage to half and negates the [blinded](https://www.dandwiki.com/wiki/SRD:Blinded) effect.
                             The spell deals only half damage to creatures who are neither good nor evil, and they are not [blinded](https://www.dandwiki.com/wiki/SRD:Blinded). Such a creature can reduce that damage by half (down to one-quarter of the roll) with a successful Will save.`,
          component_details:null
        },
        'holy sword': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Holy_Sword',
          school:           'Evocation [Good]',
          level:            'Glory 5, Pal 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Melee weapon touched',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell allows you to channel holy power into your sword, or any other melee weapon you choose. The weapon acts as a +5 *holy weapon* (+5 \`\`enhancement bonus\`\` on attack and damage rolls, extra ‹2d6› damage against evil opponents). It also emits a [*magic circle against evil*](https://www.dandwiki.com/wiki/SRD:Magic_Circle_against_Evil) effect (as the spell). If the *magic circle* ends, the sword creates a new one on your turn as a free action. The spell is automatically canceled 1 round after the weapon leaves your hand. You cannot have more than one *holy sword* at a time.
                             If this spell is cast on a magic weapon, the powers of the spell supersede any that the weapon normally has, rendering the normal enhancement bonus and powers of the weapon inoperative for the duration of the spell. This spell is not cumulative with [*bless weapon*](https://www.dandwiki.com/wiki/SRD:Bless_Weapon) or any other spell that might modify the weapon in any way.
                             This spell does not work on artifacts.
                             *Note:* A masterwork weapon’s bonus to attack does not stack with an enhancement bonus to attack.`,
          component_details:null
        },
        'holy word': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Holy_Word',
          school:           'Evocation [Good, Sonic]',
          level:            'Clr 7, Good 7',
          components:       'V',
          casting_time:     '1 standard action',
          range:            '40 ft.',
          target_type:      'Area',
          target:           'Nongood creatures in a 40-ft.-radius spread centered on you',
          duration:         'Instantaneous',
          saving_throw:     'None or Will negates; see text',
          spell_resistance: 'Yes',
          text:             `Any nongood creature within the area that hears the *holy word* suffers the following ill effects.

                             • **HD Equal to caster level:** Deafened
                             • **HD Up to caster level -1:** Blinded, deafened
                             • **HD Up to caster level -5:** Paralyzed, blinded, deafened
                             • **HD Up to caster level -10:**  Killed, paralyzed, blinded, deafened

                             The effects are cumulative and concurrent. No saving throw is allowed against these effects.
                             *[Deafened](https://www.dandwiki.com/wiki/SRD:Deafened):* The creature is [deafened](https://www.dandwiki.com/wiki/SRD:Deafened) for ‹1d4› rounds.
                             *[Blinded](https://www.dandwiki.com/wiki/SRD:Blinded):* The creature is [blinded](https://www.dandwiki.com/wiki/SRD:Blinded) for ‹2d4› rounds.
                             *[Paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed):* The creature is [paralyzed](https://www.dandwiki.com/wiki/SRD:Paralyzed) and [helpless](https://www.dandwiki.com/wiki/SRD:Helpless) for ‹1d10› minutes.
                             *[Killed](https://www.dandwiki.com/wiki/SRD:Dead):* Living creatures die. [Undead](https://www.dandwiki.com/wiki/SRD:Undead_Type) creatures are destroyed.
                             Furthermore, if you are on your home plane when you cast this spell, nongood extraplanar creatures within the area are instantly banished back to their home planes. Creatures so banished cannot return for at least 24 hours. This effect takes place regardless of whether the creatures hear the *holy word*. The banishment effect allows a Will save (at a -4 \`\`penalty\`\`) to negate.
                             Creatures whose HD exceed your caster level are unaffected by *holy word*.`,
          component_details:null
        },
        'horrid wilting': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Horrid_Wilting',
          school:           'Necromancy',
          level:            'Sor/Wiz 8, Water 8',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Targets',
          target:           'Living creatures, no two of which can be more than 60 ft. apart',
          duration:         'Instantaneous',
          saving_throw:     'Fortitude half',
          spell_resistance: 'Yes',
          text:             `This spell evaporates moisture from the body of each subject living creature, dealing [[[[{?{Casting Level},20}kl1]]d6]] points of damage. This spell is especially devastating to [water elementals](https://www.dandwiki.com/wiki/SRD:Water_Elemental) and [plant creatures](https://www.dandwiki.com/wiki/SRD:Plant_Type), which instead take [[[[{?{Casting Level},20}kl1]]d8]] points of damage.`,
          component_details:'Arcane Material Component: A bit of sponge.'
        },
        'hypnotic pattern': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hypnotic_Pattern',
          school:           'Illusion (Pattern) [Mind-Affecting]',
          level:            'Brd 2, Sor/Wiz 2',
          components:       'V (Brd only), S, M; see text',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Colorful lights in a 10-ft.-radius spread',
          duration:         'Concentration + 2 rounds',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `A twisting pattern of subtle, shifting colors weaves through the air, fascinating creatures within it. [[2d4+{?{Casting Level},10}kl1]] Hit Dice of creatures are affected. Creatures with the fewest HD are affected first; and, among creatures with equal HD, those who are closest to the spell’s point of origin are affected first. Hit Dice that are not sufficient to affect a creature are wasted. Affected creatures become [fascinated](https://www.dandwiki.com/wiki/SRD:Fascinated) by the pattern of colors. Sightless creatures are not affected.
                             A wizard or sorcerer need not utter a sound to cast this spell, but a bard must sing, play music, or recite a rhyme as a verbal component.`,
          component_details:'Material Component: A glowing stick of incense or a crystal rod filled with phosphorescent material.'
        },
        'hypnotism': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Hypnotism',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 1, Sor/Wiz 1',
          components:       'V, S',
          casting_time:     '1 round',
          range:            'close',
          target_type:      'Area',
          target:           'Several living creatures, no two of which may be more than 30 ft. apart',
          duration:         '[[2d4]] rounds (D)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `Your gestures and droning incantation [fascinate](https://www.dandwiki.com/wiki/SRD:Fascinated) nearby creatures, causing them to stop and stare blankly at you. In addition, you can use their rapt attention to make your suggestions and requests seem more plausible. [[2d4]] Hit Dice of creatures are affected. Creatures with fewer HD are affected before creatures with more HD. Only creatures that can see or hear you are affected, but they do not need to understand you to be [fascinated](https://www.dandwiki.com/wiki/SRD:Fascinated).
                             If you use this spell in combat, each target gains a +2 \`\`bonus\`\` on its saving throw. If the spell affects only a single creature not in combat at the time, the saving throw has a \`\`penalty\`\` of -2.
                             While the subject is [fascinated](https://www.dandwiki.com/wiki/SRD:Fascinated) by this spell, it reacts as though it were two steps more friendly in attitude. This allows you to make a single request of the affected creature (provided you can communicate with it). The request must be brief and reasonable. Even after the spell ends, the creature retains its new attitude toward you, but only with respect to that particular request.
                             A creature that fails its saving throw does not remember that you enspelled it.`,
          component_details:null
        },
        // Spells that start with I
        'ice storm': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Ice_Storm',
          school:           'Evocation [Cold]',
          level:            'Drd 4, Sor/Wiz 4, Water 5',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Area',
          target:           'Cylinder (20-ft. radius, 40 ft. high)',
          duration:         '1 full round',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `Great magical hailstones pound down for 1 full round, dealing [[3d6]] points of bludgeoning damage and [[2d6]] points of cold damage to every creature in the area. A -4 \`\`penalty\`\` applies to each Listen check made within the *ice storm*’s effect, and all land movement within its area is at half speed. At the end of the duration, the hail disappears, leaving no aftereffects (other than the damage dealt).`,
          component_details:'Arcane Material Component: A pinch of dust and a few drops of water.'
        },
        'identify': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Identify',
          school:           'Divination',
          level:            'Brd 1, Magic 2, Sor/Wiz 1',
          components:       'V, S, M/DF',
          casting_time:     '1 hour',
          range:            'Touch',
          target_type:      'Targets',
          target:           'One touched object',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `The spell determines all magic properties of a single magic item, including how to activate those functions (if appropriate), and how many charges are left (if any).
                             *Identify* does not function when used on an [artifact](https://www.dandwiki.com/wiki/SRD:Artifacts).`,
          component_details:'Arcane Material Component: A pearl of at least 100 gp value, crushed and stirred into wine with an owl feather; the infusion must be drunk prior to spellcasting.'
        },
        'illusory script': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Illusory_Script',
          school:           'Illusion (Phantasm) [Mind-Affecting]',
          level:            'Asn 2, Brd 3, Sor/Wiz 3',
          components:       'V, S, M',
          casting_time:     '1 minute or longer; see text',
          range:            'Touch',
          target_type:      'Target',
          target:           'One touched object weighing no more than 10 lb.',
          duration:         '[[?{Casting Level}]] day(s) (D)',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `You write instructions or other information on parchment, paper, or any suitable writing material. The *illusory script* appears to be some form of foreign or magical writing. Only the person (or people) designated by you at the time of the casting are able to read the writing; it’s unintelligible to any other character, although an illusionist recognizes it as *illusory script*.
                             Any unauthorized creature attempting to read the script triggers a potent illusory effect and must make a saving throw. A successful saving throw means the creature can look away with only a mild sense of disorientation. Failure means the creature is subject to a suggestion implanted in the script by you at the time the *illusory script* spell was cast. The suggestion lasts only 30 minutes. Typical suggestions include “Close the book and leave,” “Forget the existence of the book,” and so forth. If successfully dispelled by [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic), the *illusory script* and its secret message disappear. The hidden message can be read by a combination of the [*true seeing*](https://www.dandwiki.com/wiki/SRD:True_Seeing) spell with the [*read magic*](https://www.dandwiki.com/wiki/SRD:Read_Magic) or [*comprehend languages*](https://www.dandwiki.com/wiki/SRD:Comprehend_Languages) spell.
                             The casting time depends on how long a message you wish to write, but it is always at least 1 minute.`,
          component_details:'Material Component: A lead-based ink (cost of not less than 50 gp).'
        },
        'illusory wall': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Illusory_Wall',
          school:           'Illusion (Figment)',
          level:            'Sor/Wiz 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Effect',
          target:           'Image 1 ft. by 10 ft. by 10 ft.',
          duration:         'Permanent',
          saving_throw:     'Will disbelief (if interacted with)',
          spell_resistance: 'No',
          text:             `This spell creates the illusion of a wall, floor, ceiling, or similar surface. It appears absolutely real when viewed, but physical objects can pass through it without difficulty. When the spell is used to hide pits, traps, or normal doors, any detection abilities that do not require sight work normally. Touch or a probing search reveals the true nature of the surface, though such measures do not cause the illusion to disappear.`,
          component_details:null
        },
        'imbue with spell ability': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Imbue_with_Spell_Ability',
          school:           'Evocation',
          level:            'Clr 4, Magic 4',
          components:       'V, S, DF',
          casting_time:     '10 minutes',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched; see text',
          duration:         'Permanent until discharged (D)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `You transfer some of your currently prepared spells, and the ability to cast them, to another creature. Only a creature with an Intelligence score of at least 5 and a Wisdom score of at least 9 can receive this bestowal. Only cleric spells from the schools of abjuration, divination, and conjuration (healing) can be transferred. The number and level of spells that the subject can be granted depends on its Hit Dice; even multiple castings of *imbue with spell ability* can’t exceed this limit.

                             • **2 or lower HD:** One 1st-level spell
                             • **3–4 HD:** One or two 1st-level spells
                             • **5 or higher HD:** One or two 1st-level spells and one 2nd-level spell

                             The transferred spell’s variable characteristics (range, duration, area, and the like) function according to your level, not the level of the recipient.
                             Once you cast *imbue with spell ability*, you cannot prepare a new 4th-level spell to replace it until the recipient uses the imbued spells or is slain, or until you dismiss the *imbue with spell ability* spell. In the meantime, you remain responsible to your deity or your principles for the use to which the spell is put. If the number of 4th-level spells you can cast decreases, and that number drops below your current number of active *imbue with spell ability* spells, the more recently cast imbued spells are dispelled.
                             To cast a spell with a verbal component, the subject must be able to speak. To cast a spell with a somatic component, it must have humanlike hands. To cast a spell with a material component or focus, it must have the materials or focus.`,
          component_details:null
        },
        'implosion': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Implosion',
          school:           'Evocation',
          level:            'Clr 9, Destruction 9',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           '[[?{Casting Level}]] corporeal creature(s)',
          duration:         'Concentration (up to 4 rounds)',
          saving_throw:     'Fortitude negates',
          spell_resistance: 'Yes',
          text:             `You create a destructive resonance in a corporeal creature’s body. For each round you concentrate, you cause one creature to collapse in on itself, killing it. (This effect, being instantaneous, cannot be dispelled.)
                             You can target a particular creature only once with each casting of the spell.
                             *Implosion* has no effect on creatures in [gaseous form](https://www.dandwiki.com/wiki/SRD:Gaseous_Form_%28Spell%29) or on [incorporeal](https://www.dandwiki.com/wiki/SRD:Incorporeal_Subtype) creatures.`,
          component_details:null
        },
        'imprisonment': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Imprisonment',
          school:           'Abjuration',
          level:            'Sor/Wiz 9',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will negates; see text',
          spell_resistance: 'Yes',
          text:             `When you cast *imprisonment* and touch a creature, it is entombed in a state of suspended animation (see the [*temporal stasis*](https://www.dandwiki.com/wiki/SRD:Temporal_Stasis) spell) in a small sphere far beneath the surface of the earth. The subject remains there unless a *freedom* spell is cast at the locale where the imprisonment took place. Magical search by a *crystal ball*, a [*locate object*](https://www.dandwiki.com/wiki/SRD:Locate_Object) spell, or some other similar divination does not reveal the fact that a creature is imprisoned, but [*discern location*](https://www.dandwiki.com/wiki/SRD:Discern_Location) does. A [*wish*](https://www.dandwiki.com/wiki/SRD:Wish) or [*miracle*](https://www.dandwiki.com/wiki/SRD:Miracle) spell will not free the recipient, but will reveal where it is entombed. If you know the target’s name and some facts about its life, the target takes a -4 \`\`penalty\`\` on its save.`,
          component_details:null
        },
        'incendiary cloud': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Incendiary_Cloud',
          school:           'Conjuration (Creation) [Fire]',
          level:            'Fire 8, Sor/Wiz 8',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           'Cloud spreads in 20-ft. radius, 20 ft. high',
          duration:         '[[?{Casting Level}]] round(s)',
          saving_throw:     'Reflex half; see text',
          spell_resistance: 'No',
          text:             `An *incendiary cloud* spell creates a cloud of roiling smoke shot through with white-hot embers. The smoke obscures all sight as a [*fog cloud*](https://www.dandwiki.com/wiki/SRD:Fog_Cloud) does. In addition, the white-hot embers within the cloud deal ‹4d6› points of fire damage to everything within the cloud on your turn each round. All targets can make Reflex saves each round to take half damage.
                             As with a [*cloudkill*](https://www.dandwiki.com/wiki/SRD:Cloudkill) spell, the smoke moves away from you at 10 feet per round. Figure out the smoke’s new spread each round based on its new point of origin, which is 10 feet farther away from where you were when you cast the spell. By concentrating, you can make the cloud (actually its point of origin) move as much as 60 feet each round. Any portion of the cloud that would extend beyond your maximum range dissipates harmlessly, reducing the remainder’s spread thereafter.
                             As with [*fog cloud*](https://www.dandwiki.com/wiki/SRD:Fog_Cloud), wind disperses the smoke, and the spell can’t be cast underwater.`,
          component_details:null
        },
        'inflict critical wounds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Inflict_Critical_Wounds',
          school:           'Necromancy',
          level:            'Blg 4, Clr 4, Destruction 4',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half',
          spell_resistance: 'Yes',
          text:             `When laying your hand upon a creature, you channel negative energy that deals [[4d8+{?{Casting Level},20}kl1]] points of damage.
                             Since undead are powered by negative energy, this spell cures such a creature of a like amount of damage, rather than harming it.`,
          component_details:null
        },
        'inflict light wounds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Inflict_Light_Wounds',
          school:           'Necromancy',
          level:            'Blg 1, Clr 1, Destruction 1',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half',
          spell_resistance: 'Yes',
          text:             `When laying your hand upon a creature, you channel negative energy that deals [[1d8+{?{Casting Level},5}kl1]] points of damage.
                             Since undead are powered by negative energy, this spell cures such a creature of a like amount of damage, rather than harming it.`,
          component_details:null
        },
        'inflict minor wounds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Inflict_Minor_Wounds',
          school:           'Necromancy',
          level:            'Clr 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half',
          spell_resistance: 'Yes',
          text:             `When laying your hand upon a creature, you channel negative energy that deals 1 point of damage. A Will save negates the damage.
                             Since undead are powered by negative energy, this spell cures such a creature of a like amount of damage, rather than harming it.`,
          component_details:null
        },
        'inflict moderate wounds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Inflict_Moderate_Wounds',
          school:           'Necromancy',
          level:            'Blg 2, Clr 2',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half',
          spell_resistance: 'Yes',
          text:             `When laying your hand upon a creature, you channel negative energy that deals [[2d8+{?{Casting Level},10}kl1]] points of damage.
                             Since undead are powered by negative energy, this spell cures such a creature of a like amount of damage, rather than harming it.`,
          component_details:null
        },
        'inflict serious wounds': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Inflict_Serious_Wounds',
          school:           'Necromancy',
          level:            'Blg 3, Clr 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will half',
          spell_resistance: 'Yes',
          text:             `When laying your hand upon a creature, you channel negative energy that deals [[3d8+{?{Casting Level},15}kl1]] points of damage.
                             Since undead are powered by negative energy, this spell cures such a creature of a like amount of damage, rather than harming it.`,
          component_details:null
        },
        'insanity': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Insanity',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Charm 7, Madness 7, Sor/Wiz 7',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One living creature',
          duration:         'Instantaneous',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `The affected creature suffers from a continuous [*confusion*](https://www.dandwiki.com/wiki/SRD:Confusion) effect, as the spell.
                             [*Remove curse*](https://www.dandwiki.com/wiki/SRD:Remove_Curse) does not remove *insanity*. [*Greater restoration*](https://www.dandwiki.com/wiki/SRD:Greater_Restoration), [*heal*](https://www.dandwiki.com/wiki/SRD:Heal), [*limited wish*](https://www.dandwiki.com/wiki/SRD:Limited_Wish), [*miracle*](https://www.dandwiki.com/wiki/SRD:Miracle), or [*wish*](https://www.dandwiki.com/wiki/SRD:Wish) can restore the creature.`,
          component_details:null
        },
        'insect plague': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Insect_Plague',
          school:           'Conjuration (Summoning)',
          level:            'Clr 5, Drd 5',
          components:       'V, S, DF',
          casting_time:     '1 round',
          range:            'long',
          target_type:      'Effect',
          target:           '[[{floor(?{Casting Level}/3),6}kl1]] swarm(s) of locusts, each of which must be adjacent to at least one other swarm',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You summon a number of [swarms of locusts](https://www.dandwiki.com/wiki/SRD:Locust_Swarm). The swarms must be summoned so that each one is adjacent to at least one other swarm (that is, the swarms must fill one contiguous area). You may summon the locust swarms so that they share the area of other creatures. Each swarm attacks any creatures occupying its area. The swarms are stationary after being summoned, and won’t pursue creatures that flee.`,
          component_details:null
        },
        'instant summons': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Instant_Summons',
          school:           'Conjuration (Summoning)',
          level:            'Rune 7, Sor/Wiz 7',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'See text',
          target_type:      'Target',
          target:           'One object weighing 10 lb. or less whose longest dimension is 6 ft. or less',
          duration:         'Permanent until discharged',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You call some nonliving item from virtually any location directly to your hand.
                             First, you must place your *arcane mark* on the item. Then you cast this spell, which magically and invisibly inscribes the name of the item on a sapphire worth at least 1,000 gp. Thereafter, you can summon the item by speaking a special word (set by you when the spell is cast) and crushing the gem. The item appears instantly in your hand. Only you can use the gem in this way.
                             If the item is in the possession of another creature, the spell does not work, but you know who the possessor is and roughly where that creature is located when the summons occurs.
                             The inscription on the gem is [invisible](https://www.dandwiki.com/wiki/SRD:Invisible). It is also unreadable, except by means of a [*read magic*](https://www.dandwiki.com/wiki/SRD:Read_Magic) spell, to anyone but you.
                             The item can be summoned from another plane, but only if no other creature has claimed ownership of it.`,
          component_details:'Material Component: A sapphire worth at least 1,000 gp.'
        },
        'interposing hand': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Interposing_Hand',
          school:           'Evocation [Force]',
          level:            'Sor/Wiz 5',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Effect',
          target:           '10-ft. hand',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `*Interposing hand* creates a Large magic hand that appears between you and one opponent. This floating, disembodied hand then moves to remain between the two of you, regardless of where you move or how the opponent tries to get around it, providing [cover](https://www.dandwiki.com/wiki/SRD:Cover) (+4 AC) for you against that opponent. Nothing can fool the hand—it sticks with the selected opponent in spite of darkness, invisibility, polymorphing, or any other attempt at hiding or disguise. The hand does not pursue an opponent, however.
                             An *interposing hand* is 10 feet long and about that wide with its fingers outstretched. It has as many hit points as you do when you’re undamaged, and its AC is 20 (-1 size, +11 natural). It takes damage as a normal creature, but most magical effects that don’t cause damage do not affect it.
                             The hand never provokes attacks of opportunity from opponents. It cannot push through a [*wall of force*](https://www.dandwiki.com/wiki/SRD:Wall_of_Force) or enter an [*antimagic field*](https://www.dandwiki.com/wiki/SRD:Antimagic_Field), but it suffers the full effect of a [*prismatic wall*](https://www.dandwiki.com/wiki/SRD:Prismatic_Wall) or [*prismatic sphere*](https://www.dandwiki.com/wiki/SRD:Prismatic_Sphere). The hand makes saving throws as its caster.
                             [*Disintegrate*](https://www.dandwiki.com/wiki/SRD:Disintegrate) or a successful [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) destroys it.
                             Any creature weighing 2,000 pounds or less that tries to push past the hand is slowed to half its normal speed. The hand cannot reduce the speed of a creature weighing more than 2,000 pounds, but it still affects the creature’s attacks.
                             Directing the spell to a new target is a move action.`,
          component_details:'Focus: A soft glove.'
        },
        'invisibility': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Invisibility_%28Spell%29',
          school:           'Illusion (Glamer)',
          level:            'Asn 2, Brd 2, Sor/Wiz 2, Trickery 2',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'Personal or touch',
          target_type:      'Target',
          target:           'You or a creature or object weighing no more than [[100*?{Casting Level}]] lb.',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Will negates (harmless) or Will negates (harmless, object)',
          spell_resistance: 'Yes (harmless) or Yes (harmless, object)',
          text:             `The creature or object touched becomes [invisible](https://www.dandwiki.com/wiki/SRD:Invisible), vanishing from sight, even from darkvision. If the recipient is a creature carrying gear, that vanishes, too. If you cast the spell on someone else, neither you nor your allies can see the subject, unless you can normally see [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) things or you employ magic to do so.
                             Items dropped or put down by an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) creature become visible; items picked up disappear if tucked into the clothing or pouches worn by the creature. Light, however, never becomes [invisible](https://www.dandwiki.com/wiki/SRD:Invisible), although a source of light can become so (thus, the effect is that of a light with no visible source). Any part of an item that the subject carries but that extends more than 10 feet from it becomes visible.
                             Of course, the subject is not magically [*silenced*](https://www.dandwiki.com/wiki/SRD:Silence), and certain other conditions can render the recipient detectable (such as stepping in a puddle). The spell ends if the subject attacks any creature. For purposes of this spell, an attack includes any spell targeting a foe or whose area or effect includes a foe. (Exactly who is a foe depends on the [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) character’s perceptions.) Actions directed at unattended objects do not break the spell. Causing harm indirectly is not an attack. Thus, an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) being can open doors, talk, eat, climb stairs, summon monsters and have them attack, cut the ropes holding a rope bridge while enemies are on the bridge, remotely trigger traps, open a portcullis to release attack dogs, and so forth. If the subject attacks directly, however, it immediately becomes visible along with all its gear. Spells such as *bless* that specifically affect allies but not foes are not attacks for this purpose, even when they include foes in their area.
                             *Invisibility* can be made permanent (on objects only) with a [*permanency*](https://www.dandwiki.com/wiki/SRD:Permanency) spell.`,
          component_details:'Arcane Material Component: An eyelash encased in a bit of gum arabic.'
        },
        'invisibility purge': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Invisibility_Purge',
          school:           'Evocation',
          level:            'Clr 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          text:             `You surround yourself with a sphere of power with a radius of [[5*?{Casting Level}]] feet that negates all forms of invisibility.
                             Anything invisible becomes visible while in the area.`,
          component_details:null
        },
        'invisibility sphere': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Invisibility_Sphere',
          school:           'Illusion (Glamer)',
          level:            'Brd 3, Sor/Wiz 3',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Personal or touch',
          target_type:      'Area',
          target:           '10-ft.-radius emanation around the creature or object touched',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Will negates (harmless) or Will negates (harmless, object)',
          spell_resistance: 'Yes (harmless) or Yes (harmless, object)',
          text:             `This spell confers invisibility upon all creatures within 10 feet of the recipient. The center of the effect is mobile with the recipient.
                             The creature or object included becomes [invisible](https://www.dandwiki.com/wiki/SRD:Invisible), vanishing from sight, even from darkvision. If the recipient is a creature carrying gear, that vanishes, too. Those affected by this spell can see each other and themselves as if unaffected by the spell. Any affected creature moving out of the area becomes visible, but creatures moving into the area after the spell is cast do not become [invisible](https://www.dandwiki.com/wiki/SRD:Invisible). Affected creatures (other than the recipient) who attack negate the invisibility only for themselves. If the spell recipient attacks, the [*invisibility sphere*]() ends.
                             Items dropped or put down by an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) creature become visible; items picked up disappear if tucked into the clothing or pouches worn by the creature. Light, however, never becomes [invisible](https://www.dandwiki.com/wiki/SRD:Invisible), although a source of light can become so (thus, the effect is that of a light with no visible source). Any part of an item that the subject carries but that extends more than 10 feet from it becomes visible.
                             Of course, the subject is not magically [*silenced*](https://www.dandwiki.com/wiki/SRD:Silence), and certain other conditions can render the recipient detectable (such as stepping in a puddle). The spell ends if the subject attacks any creature. For purposes of this spell, an attack includes any spell targeting a foe or whose area or effect includes a foe. (Exactly who is a foe depends on the [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) character’s perceptions.) Actions directed at unattended objects do not break the spell. Causing harm indirectly is not an attack. Thus, an [invisible](https://www.dandwiki.com/wiki/SRD:Invisible) being can open doors, talk, eat, climb stairs, summon monsters and have them attack, cut the ropes holding a rope bridge while enemies are on the bridge, remotely trigger traps, open a portcullis to release attack dogs, and so forth. If the subject attacks directly, however, it immediately becomes visible along with all its gear. Spells such as *bless* that specifically affect allies but not foes are not attacks for this purpose, even when they include foes in their area.`,
          component_details:'Arcane Material Component: An eyelash encased in a bit of gum arabic.'
        },
        'iron body': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Iron_Body',
          school:           'Transmutation',
          level:            'Earth 8, Sor/Wiz 8',
          components:       'V, S, M/DF',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          text:             `This spell transforms your body into living iron, which grants you several powerful resistances and abilities.
                             You gain damage reduction 15/adamantine. You are immune to [blindness](https://www.dandwiki.com/wiki/SRD:Blindness/Deafness), critical hits, ability score damage, [deafness](https://www.dandwiki.com/wiki/SRD:Deafened), [disease](https://www.dandwiki.com/wiki/SRD:Disease), drowning, electricity, poison, stunning, and all spells or attacks that affect your physiology or respiration, because you have no physiology or respiration while this spell is in effect. You take only half damage from acid and fire of all kinds. However, you also become vulnerable to all special attacks that affect iron golems.
                             You gain a +6 \`\`enhancement bonus\`\` to your Strength score, but you take a -6 \`\`penalty\`\` to Dexterity as well (to a minimum Dexterity score of 1), and your speed is reduced to half normal. You have an arcane spell failure chance of 50% and a -8 armor check penalty, just as if you were clad in full plate armor. You cannot drink (and thus can’t use potions) or play wind instruments.
                             Your unarmed attacks deal damage equal to a [club](https://www.dandwiki.com/wiki/SRD:Club) sized for you (‹1d4› for Small characters or ‹1d6› for Medium characters), and you are considered armed when making unarmed attacks.
                             Your weight increases by a factor of ten, causing you to sink in water like a stone. However, you could survive the crushing pressure and lack of air at the bottom of the ocean—at least until the spell duration expires.`,
          component_details:'Arcane Material Component: A small piece of iron that was once part of either an iron golem, a hero’s armor, or a war machine.'
        },
        'ironwood': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Ironwood',
          school:           'Transmutation',
          level:            'Drd 6',
          components:       'V, S, M',
          casting_time:     '1 minute/lb. created',
          range:            '0 ft.',
          target_type:      'Effect',
          target:           'An *ironwood* object weighing up to [[5*?{Casting Level}]] lb.',
          duration:         '[[?{Casting Level}]] day(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `*Ironwood* is a magical substance created by druids from normal wood. While remaining natural wood in almost every way, *ironwood* is as strong, heavy, and resistant to fire as steel. Spells that affect metal or iron do not function on *ironwood*. Spells that affect wood do affect *ironwood*, although *ironwood* does not burn. Using this spell with *wood shape* or a wood-related Craft check, you can fashion wooden items that function as steel items. Thus, wooden plate armor and wooden swords can be created that are as durable as their normal steel counterparts. These items are freely usable by druids.
                             Further, if you make only half as much *ironwood* as the spell would normally allow, any weapon, shield, or suit of armor so created is treated as a magic item with a +1 \`\`enhancement bonus\`\`.`,
          component_details:'Material Component: Wood shaped into the form of the intended *ironwood* object.'
        },
        'irresistible dance': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Irresistible_Dance',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 6, Sor/Wiz 8',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Living creature touched',
          duration:         '[[1d4+1]] rounds',
          saving_throw:     'None',
          spell_resistance: 'Yes',
          text:             `The subject feels an undeniable urge to dance and begins doing so, complete with foot shuffling and tapping. The spell effect makes it impossible for the subject to do anything other than caper and prance in place. The effect imposes a -4 \`\`penalty\`\` to Armor Class and a -10 \`\`penalty\`\` on Reflex saves, and it negates any AC bonus granted by a shield the target holds. The dancing subject provokes attacks of opportunity each round on its turn.`,
          component_details:null
        },
        // Spells that start with J
        'jump': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Jump',
          school:           'Transmutation',
          level:            'Asn 1, Drd 1, Rgr 1, Sor/Wiz 1',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes',
          text:             `The subject gets a +10 \`\`enhancement bonus\`\` on Jump checks. The enhancement bonus increases to +20 at caster level 5th, and to +30 (the maximum) at caster level 9th.`,
          component_details:'Material Component: A grasshopper’s hind leg, which you break when the spell is cast.'
        },
        // Spells that start with K
        'keen edge': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Keen_Edge',
          school:           'Transmutation',
          level:            'Sor/Wiz 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Targets',
          target:           'One weapon or fifty projectiles, all of which must be in contact with each other at the time of casting',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'Will negates (harmless, object)',
          spell_resistance: 'Yes (harmless, object)',
          text:             `This spell makes a weapon magically keen, improving its ability to deal telling blows. This transmutation doubles the threat range of the weapon. A threat range of 20 becomes 19–20, a threat range of 19–20 becomes 17–20, and a threat range of 18–20 becomes 15–20. The spell can be cast only on piercing or slashing weapons. If cast on arrows or crossbow bolts, the *keen edge* on a particular projectile ends after one use, whether or not the missile strikes its intended target. (Treat shuriken as arrows, rather than as thrown weapons, for the purpose of this spell.)
                             Multiple effects that increase a weapon’s threat range (such as the *keen edge* spell and the Improved Critical feat) don’t stack. You can’t cast this spell on a natural weapon, such as a claw.`,
          component_details:null
        },
        //Epic Spell: kinetic control
        'knock': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Knock',
          school:           'Transmutation',
          level:            'Sor/Wiz 2',
          components:       'V',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Target',
          target:           'One door, box, or chest with an area of up to [[10*?{Casting Level}]] sq. ft.',
          duration:         'Instantaneous; see text',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `The *knock* spell opens stuck, barred, locked, [*held*](https://www.dandwiki.com/wiki/SRD:Hold_Portal), or [*arcane locked*](https://www.dandwiki.com/wiki/SRD:Arcane_Lock) doors. It opens secret doors, as well as locked or trick-opening boxes or chests. It also loosens welds, shackles, or chains (provided they serve to hold closures shut). If used to open an *arcane locked* door, the spell does not remove the *arcane lock* but simply suspends its functioning for 10 minutes. In all other cases, the door does not relock itself or become stuck again on its own. *Knock* does not raise barred gates or similar impediments (such as a portcullis), nor does it affect ropes, vines, and the like. The effect is limited by the area. Each spell can undo as many as two means of preventing egress.`,
          component_details:null
        },
        'know direction': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Know_Direction',
          school:           'Divination',
          level:            'Brd 0, Drd 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         'Instantaneous',
          text:             `You instantly know the direction of north from your current position. The spell is effective in any environment in which “north” exists, but it may not work in extraplanar settings. Your knowledge of north is correct at the moment of casting, but you can get lost again within moments if you don’t find some external reference point to help you keep track of direction.`,
          component_details:null
        },
        // Spells that start with L
        'legend lore': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Legend_Lore',
          school:           'Divination',
          level:            'Brd 4, Knowledge 7, Sor/Wiz 6',
          components:       'V, S, M, F',
          casting_time:     'See text',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         'See text',
          text:             `*Legend lore* brings to your mind legends about an important person, place, or thing. If the person or thing is at hand, or if you are in the place in question, the casting time is only ‹1d4×10|[[1d4*10]]› minutes. If you have only detailed information on the person, place, or thing, the casting time is ‹1d10› days, and the resulting lore is less complete and specific (though it often provides enough information to help you find the person, place, or thing, thus allowing a better *legend lore* result next time). If you know only rumors, the casting time is ‹2d6› weeks, and the resulting lore is vague and incomplete (though it often directs you to more detailed information, thus allowing a better *legend lore* result next time).
                             During the casting, you cannot engage in other than routine activities: eating, sleeping, and so forth. When completed, the divination brings legends (if any) about the person, place, or things to your mind. These may be legends that are still current, legends that have been forgotten, or even information that has never been generally known. If the person, place, or thing is not of legendary importance, you gain no information. As a rule of thumb, characters who are 11th level and higher are “legendary,” as are the sorts of creatures they contend with, the major magic items they wield, and the places where they perform their key deeds.`,
          component_details:`Material Component: Incense worth at least 250 gp.
                             Focus: Four strips of ivory (worth 50 gp each) formed into a rectangle.`
        },
        'lesser confusion': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Lesser_Confusion',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 1, Madness 1',
          components:       'V, S, DF',
          casting_time:     '1 standard action',
          range:            'close',
          target_type:      'Target',
          target:           'One living creature',
          duration:         '1 round',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `This spell causes a single creature to become [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) for 1 round.
                             Roll ‹1d100› on the [*confused condition table*](https://www.dandwiki.com/wiki/SRD:Confused) at the beginning of each subject’s turn each round to see what the subject does in that round.
                             A [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) character who can’t carry out the indicated action does nothing but babble incoherently. Attackers are not at any special advantage when attacking a [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) character. Any [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) character who is attacked automatically attacks its attackers on its next turn, as long as it is still [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) when its turn comes. Note that a [*confused*](https://www.dandwiki.com/wiki/SRD:Confused) character will not make [attacks of opportunity](https://www.dandwiki.com/wiki/SRD:Attack_of_Opportunity) against any creature that it is not already devoted to attacking (either because of its most recent action or because it has just been attacked).`,
          component_details:null
        },
        'lesser geas': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Lesser_Geas',
          school:           'Enchantment (Compulsion) [Language-Dependent, Mind-Affecting]',
          level:            'Brd 3, Sor/Wiz 4',
          components:       'V',
          casting_time:     '1 round',
          range:            'close',
          target_type:      'Target',
          target:           'One living creature with 7 HD or less',
          duration:         '[[?{Casting Level}]] day(s) or until discharged (D)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `A *lesser geas* places a magical command on a creature to carry out some service or to refrain from some action or course of activity, as desired by you. The creature must have 7 or fewer Hit Dice and be able to understand you. While a geas cannot compel a creature to kill itself or perform acts that would result in certain death, it can cause almost any other course of activity.
                             The *geased* creature must follow the given instructions until the *geas* is completed, no matter how long it takes.
                             If the instructions involve some open-ended task that the recipient cannot complete through his own actions the spell remains in effect for a maximum of one day per caster level. A clever recipient can subvert some instructions:
                             If the subject is prevented from obeying the *lesser geas* for 24 hours, it takes a -2 \`\`penalty\`\` to each of its ability scores. Each day, another -2 \`\`penalty\`\` accumulates, up to a total of -8. No ability score can be reduced to less than 1 by this effect. The ability score penalties are removed 24 hours after the subject resumes obeying the *lesser geas*.
                             A *lesser geas* (and all ability score penalties) can be ended by [*break enchantment*]()https://www.dandwiki.com/wiki/SRD:Break_Enchantment, [*limited wish*](https://www.dandwiki.com/wiki/SRD:Limited_Wish), [*remove curse*](https://www.dandwiki.com/wiki/SRD:Remove_Curse), [*miracle*](https://www.dandwiki.com/wiki/SRD:Miracle), or [*wish*](https://www.dandwiki.com/wiki/SRD:Wish). [*Dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) does not affect a *lesser geas*.`,
          component_details:null
        },
        'lesser globe of invulnerability': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Lesser_Globe_of_Invulnerability',
          school:           'Abjuration',
          level:            'Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            '10 ft.',
          target_type:      'Area',
          target:           '10-ft.-radius spherical emanation, centered on you',
          duration:         '[[?{Casting Level}]] round(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `An immobile, faintly shimmering magical sphere surrounds you and excludes all spell effects of 3rd level or lower. The area or effect of any such spells does not include the area of the *lesser globe of invulnerability*. Such spells fail to affect any target located within the globe. Excluded effects include spell-like abilities and spells or spell-like effects from items. However, any type of spell can be cast through or out of the magical globe. Spells of 4th level and higher are not affected by the globe, nor are spells already in effect when the globe is cast. The globe can be brought down by a targeted [*dispel magic*](https://www.dandwiki.com/wiki/SRD:Dispel_Magic) spell, but not by an area *dispel magic*. You can leave and return to the globe without penalty.
                             Note that spell effects are not disrupted unless their effects enter the globe, and even then they are merely suppressed, not dispelled.
                             If a given spell has more than one level depending on which character class is casting it, use the level appropriate to the caster to determine whether *lesser globe of invulnerability* stops it.`,
          component_details:'Material Component: A glass or crystal bead that shatters at the expiration of the spell.'
        },
        'lesser planar ally': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Lesser_Planar_Ally',
          school:           'Conjuration (Calling) [see text]',
          level:            'Clr 4',
          components:       'V, S, DF, XP',
          casting_time:     '10 minutes',
          range:            'close',
          target_type:      'Effect',
          target:           'One called [elemental](https://www.dandwiki.com/wiki/SRD:Elemental) or [outsider](https://www.dandwiki.com/wiki/SRD:Outsider_Type) of 6 HD or less',
          duration:         'Instantaneous',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `By casting this spell, you request your deity to send you an elemental or outsider (of 6 HD or less) of the deity’s choice. If you serve no particular deity, the spell is a general plea answered by a creature sharing your philosophical alignment. If you know an individual creature’s name, you may request that individual by speaking the name during the spell (though you might get a different creature anyway).
                             You may ask the creature to perform one task in exchange for a payment from you. Tasks might range from the simple to the complex. You must be able to communicate with the creature called in order to bargain for its services.
                             The creature called requires a payment for its services. This payment can take a variety of forms, from donating gold or magic items to an allied temple, to a gift given directly to the creature, to some other action on your part that matches the creature’s alignment and goals. Regardless, this payment must be made before the creature agrees to perform any services. The bargaining takes at least 1 round, so any actions by the creature begin in the round after it arrives.
                             A task taking up to 1 minute per caster level requires a payment of 100 gp per HD of the creature called. For a task taking up to 1 hour per caster level, the creature requires a payment of 500 gp per HD. A long-term task, one requiring up to one day per caster level, requires a payment of 1,000 gp per HD.
                             A nonhazardous task requires only half the indicated payment, while an especially hazardous task might require a greater gift. Few if any creatures will accept a task that seems suicidal (remember, a called creature actually dies when it is killed, unlike a summoned creature). However, if the task is strongly aligned with the creature’s ethos, it may halve or even waive the payment.
                             At the end of its task, or when the duration bargained for expires, the creature returns to its home plane (after reporting back to you, if appropriate and possible).
                             *Note:* When you use a calling spell that calls an air, chaotic, earth, evil, fire, good, lawful, or water creature, it is a spell of that type.`,
          component_details:'XP Cost: 100 XP.'
        },
        'lesser planar binding': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Lesser_Planar_Binding',
          school:           'Conjuration (Calling) [see text]',
          level:            'Rune 5, Sor/Wiz 5',
          components:       'V, S',
          casting_time:     '10 minutes',
          range:            'Close ([[25+(5*floor([[?{Casting Level}/2]]))]] ft.); see text',
          target_type:      'Target',
          target:           'One [elemental](https://www.dandwiki.com/wiki/SRD:Elemental_Type) or [outsider](https://www.dandwiki.com/wiki/SRD:Outsider_Type) with 6 HD or less',
          duration:         'Instantaneous',
          saving_throw:     'Will negates',
          spell_resistance: 'No and Yes; see text',
          text:             `Casting this spell attempts a dangerous act: to lure a [creature from another plane](https://www.dandwiki.com/wiki/SRD:Outsider_Type) to a specifically prepared trap, which must lie within the spell’s range. The called creature is held in the trap until it agrees to perform one service in return for its freedom.
                             To create the trap, you must use a [*Magic Circle*](https://www.dandwiki.com/wiki/SRD:Magic_Circle_against_Evil) spell, focused inward. The kind of creature to be bound must be known and stated. If you wish to call a specific individual, you must use that individual’s proper name in casting the spell.
                             The target creature is allowed a Will saving throw. If the saving throw succeeds, the creature resists the spell. If the saving throw fails, the creature is immediately drawn to the trap (spell resistance does not keep it from being called). The creature can escape from the trap with by successfully pitting its spell resistance against your caster level check, by dimensional travel, or with a successful Charisma check (DC 15 + 1/2 your caster level + your Cha modifier). It can try each method once per day. If it breaks loose, it can flee or attack you. A [*dimensional anchor*](https://www.dandwiki.com/wiki/SRD:Dimensional_Anchor) cast on the creature prevents its escape via dimensional travel. You can also employ a calling diagram (see [*magic circle against evil*](https://www.dandwiki.com/wiki/SRD:Magic_Circle_against_Evil)) to make the trap more secure.
                             If the creature does not break free of the trap, you can keep it bound for as long as you dare. You can attempt to compel the creature to perform a service by describing the service and perhaps offering some sort of reward. You make a Charisma check opposed by the creature’s Charisma check. The check is assigned a bonus of +0 to +6 based on the nature of the service and the reward. If the creature wins the opposed check, it refuses service. New offers, bribes, and the like can be made or the old ones reoffered every 24 hours. This process can be repeated until the creature promises to serve, until it breaks free, or until you decide to get rid of it by means of some other spell. Impossible demands or unreasonable commands are never agreed to. If you roll a 1 on the Charisma check, the creature breaks free of the binding and can escape or attack you.
                             Once the requested service is completed, the creature need only so inform you to be instantly sent back whence it came. The creature might later seek revenge. If you assign some open-ended task that the creature cannot complete though its own actions the spell remains in effect for a maximum of one day per caster level, and the creature gains an immediate chance to break free. Note that a clever recipient can subvert some instructions.
                             *Note:* When you use a calling spell such as gate to call an air, chaotic, earth, evil, fire, good, lawful, or water creature, it is a spell of that type.`,
          component_details:null
        },
        'lesser restoration': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Lesser_Restoration',
          school:           'Conjuration (Healing)',
          level:            'Clr 2, Drd 2, Pal 1',
          components:       'V, S',
          casting_time:     '3 rounds',
          range:            'Touch',
          target_type:      'Target',
          target:           'Creature touched',
          duration:         'Instantaneous',
          saving_throw:     'Will negates (harmless)',
          spell_resistance: 'Yes (harmless)',
          text:             `*Lesser restoration8 dispels any magical effects reducing one of the subject’s ability scores or cures 1d4 points of temporary [ability damage](https://www.dandwiki.com/wiki/SRD:Ability_Score_Loss#Ability_Damage) to one of the subject’s ability scores. It also eliminates any [fatigue](https://www.dandwiki.com/wiki/SRD:Fatigued) suffered by the character, and improves an [exhausted condition](https://www.dandwiki.com/wiki/SRD:Exhausted) to [fatigued](https://www.dandwiki.com/wiki/SRD:Fatigued). It does not restore permanent [ability drain](https://www.dandwiki.com/wiki/SRD:Ability_Score_Loss#Ability_Drain).`,
          component_details:null
        },
        'lesser telepathic bond': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Lesser_Telepathic_Bond',
          school:           'Divination [Mind-Affecting]',
          level:            'Clr 3, Mind 3, Sor/Wiz 3',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            '30 ft.',
          target_type:      'Targets',
          target:           'You and one willing creature within 30 ft.',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You forge a telepathic bond with another creature with an Intelligence score of 6 or higher. The bond can be established only with a willing subject. You can communicate telepathically through the bond regardless of language. No special power or influence is established as a result of the bond. Once the bond is formed, it works over any distance (although not from one plane to another).`,
          component_details:null
        },
        // Epic Spell: let go of me
        'levitate': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Levitate',
          school:           'Transmutation',
          level:            'Sor/Wiz 2',
          components:       'V, S, F',
          casting_time:     '1 standard action',
          range:            'Personal or close ([[25+(5*floor([[?{Casting Level}/2]]))]] ft.)',
          target_type:      'Target',
          target:           'You or one willing creature or one object (total weight up to [[100*?{Casting Level}]] lb.)',
          duration:         '[[?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `*Levitate* allows you to move yourself, another creature, or an object up and down as you wish. A creature must be willing to be levitated, and an object must be unattended or possessed by a willing creature. You can mentally direct the recipient to move up or down as much as 20 feet each round; doing so is a move action. You cannot move the recipient horizontally, but the recipient could clamber along the face of a cliff, for example, or push against a ceiling to move laterally (generally at half its base land speed).
                             A *levitating* creature that attacks with a melee or ranged weapon finds itself increasingly unstable; the first attack has a -1 \`\`penalty\`\` on attack rolls, the second -2, and so on, to a maximum penalty of -5. A full round spent stabilizing allows the creature to begin again at -1.`,
          component_details:'Focus: Either a small leather loop or a piece of golden wire bent into a cup shape with a long shank on one end.'
        },
        'light': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Light',
          school:           'Evocation [Light]',
          level:            'Brd 0, Clr 0, Drd 0, Sor/Wiz 0',
          components:       'V, M/DF',
          casting_time:     '1 standard action',
          range:            'Touch',
          target_type:      'Target',
          target:           'Object touched',
          duration:         '[[10*?{Casting Level}]] minute(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell causes an object to glow like a torch, shedding bright light in a 20-foot radius (and dim light for an additional 20 feet) from the point you touch. The effect is immobile, but it can be cast on a movable object. Light taken into an area of magical *darkness* does not function.
                             A light spell (one with the light descriptor) counters and dispels a darkness spell (one with the darkness descriptor) of an equal or lower level.`,
          component_details:'Arcane Material Component: A firefly or a piece of phosphorescent moss.'
        },
        'lightning bolt': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Lightning_Bolt',
          school:           'Evocation [Electricity]',
          level:            'Sor/Wiz 3',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            '120 ft.',
          target_type:      'Area',
          target:           '120-ft. line',
          duration:         'Instantaneous',
          saving_throw:     'Reflex half',
          spell_resistance: 'Yes',
          text:             `You release a powerful stroke of electrical energy that deals [[[[{?{Casting Level},10}kl1]]d6]] points of electricity damage to each creature within its area. The bolt begins at your fingertips.
                             The *lightning bolt* sets fire to combustibles and damages objects in its path. It can melt metals with a low melting point, such as lead, gold, copper, silver, or bronze. If the damage caused to an interposing barrier shatters or breaks through it, the bolt may continue beyond the barrier if the spell’s range permits; otherwise, it stops at the barrier just as any other spell effect does.`,
          component_details:'Material Component: A bit of fur and an amber, crystal, or glass rod.'
        },
        'limited wish': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Limited_Wish',
          school:           'Universal',
          level:            'Sor/Wiz 7',
          components:       'V, S, XP',
          casting_time:     '1 standard action',
          range:            'See text',
          target_type:      'Target, Effect, or Area',
          target:           'See text',
          duration:         'See text',
          saving_throw:     'None; see text',
          spell_resistance: 'Yes',
          text:             `A *limited wish* lets you create nearly any type of effect. For example, a *limited wish* can do any of the following things.
                             • Duplicate any sorcerer/wizard spell of 6th level or lower, provided the spell is not of a school prohibited to you.
                             • Duplicate any other spell of 5th level or lower, provided the spell is not of a school prohibited to you.
                             • Duplicate any sorcerer/wizard spell of 5th level or lower, even if it’s of a prohibited school.
                             • Duplicate any other spell of 4th level or lower, even if it’s of a prohibited school.
                             • Undo the harmful effects of many spells, such as [*geas/quest*](https://www.dandwiki.com/wiki/SRD:Geas/Quest) or [*insanity*](https://www.dandwiki.com/wiki/SRD:Insanity).
                             • Produce any other effect whose power level is in line with the above effects, such as a single creature automatically hitting on its next attack or taking a -7 \`\`penalty\`\` on its next saving throw.
                             A duplicated spell allows saving throws and spell resistance as normal (but the save DC is for a 7th-level spell). When a *limited wish* duplicates a spell that has an XP cost, you must pay that cost or 300 XP, whichever is more. When a *limited wish* spell duplicates a spell with a material component that costs more than 1,000 gp, you must provide that component.`,
          component_details:'XP Cost: 300 XP or more (see above).'
        },
        'liveoak': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Liveoak',
          school:           'Transmutation',
          level:            'Drd 6',
          components:       'V, S',
          casting_time:     '10 minutes',
          range:            'Touch',
          target_type:      'Target',
          target:           'Tree touched',
          duration:         '[[?{Casting Level}]] day(s) (D)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `This spell turns an oak tree into a protector or guardian. The spell can be cast on only a single tree at a time; while *liveoak* is in effect, you can’t cast it again on another tree. The tree on which the spell is cast must be within 10 feet of your dwelling place, within a place sacred to you, or within 300 feet of something that you wish to guard or protect.
                             *Liveoak* must be cast on a healthy, Huge oak. A triggering phrase of up to one word per caster level is placed on the targeted oak. The *liveoak* spell triggers the tree into animating as a treant.
                             If *liveoak* is dispelled, the tree takes root immediately, wherever it happens to be. If released by you, the tree tries to return to its original location before taking root.`,
          component_details:null
        },
        // Epic Spell: living lightning
        'locate creature': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Locate_Creature',
          school:           'Divination',
          level:            'Asn 4, Brd 4, Sor/Wiz 4',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Area',
          target:           'Circle, centered on you, with a radius of [[400+(40*[[?{Casting Level}]])]] ft.',
          duration:         '[[10*?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You slowly turn and sense when you are facing in the direction of the creature to be located, provided it is within range. You also know in which direction the creature is moving, if any.
                             The spell can locate a creature of a specific kind or a specific creature known to you. It cannot find a creature of a certain type. To find a kind of creature, you must have seen such a creature up close (within 30 feet) at least once.
                             The spell is blocked by even a thin sheet of lead. Running water blocks the spell. It cannot detect objects. It can be fooled by [*mislead*](https://www.dandwiki.com/wiki/SRD:Mislead), [*nondetection*](https://www.dandwiki.com/wiki/SRD:Nondetection), and [*polymorph*](https://www.dandwiki.com/wiki/SRD:Polymorph_%28Spell%29) spells.`,
          component_details:'Material Component: A bit of fur from a bloodhound.'
        },
        'locate object': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Locate_Object',
          school:           'Divination',
          level:            'Brd 2, Clr 3, Sor/Wiz 2, Travel 2',
          components:       'V, S, F/DF',
          casting_time:     '1 standard action',
          range:            'long',
          target_type:      'Area',
          target:           'Circle, centered on you, with a radius of [[400+(40*[[?{Casting Level}]])]] ft.',
          duration:         '[[?{Casting Level}]] minute(s)',
          saving_throw:     'None',
          spell_resistance: 'No',
          text:             `You sense the direction of a well-known or clearly visualized object. You can search for general items, in which case you locate the nearest one of its kind if more than one is within range. Attempting to find a certain item requires a specific and accurate mental image; if the image is not close enough to the actual object, the spell fails. You cannot specify a unique item unless you have observed that particular item firsthand (not through divination).
                             The spell is blocked by even a thin sheet of lead. Creatures cannot be found by this spell. [*Polymorph any object*](https://www.dandwiki.com/wiki/SRD:Polymorph_Any_Object) fools it.`,
          component_details:'Arcane Focus: A forked twig.'
        },
        'longstrider': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Longstrider',
          school:           'Transmutation',
          level:            'Drd 1, Rgr 1, Travel 1',
          components:       'V, S, M',
          casting_time:     '1 standard action',
          range:            'Personal',
          target_type:      'Target',
          target:           'You',
          duration:         '[[?{Casting Level}]] hour(s) (D)',
          text:             `This spell increases your base land speed by 10 feet. (This adjustment counts as an \`\`enhancement bonus\`\`.) It has no effect on other modes of movement, such as burrow, climb, fly, or swim.`,
          component_details:'Material Component: A pinch of dirt.'
        },
        // Epic Wish: lord of nightmares
        'lullaby': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Lullaby',
          school:           'Enchantment (Compulsion) [Mind-Affecting]',
          level:            'Brd 0',
          components:       'V, S',
          casting_time:     '1 standard action',
          range:            'medium',
          target_type:      'Area',
          target:           'Living creatures within a 10-ft.-radius burst',
          duration:         'Concentration + [[?{Casting Level}]] round(s) (D)',
          saving_throw:     'Will negates',
          spell_resistance: 'Yes',
          text:             `Any creature within the area that fails a Will save becomes drowsy and inattentive, taking a -5 \`\`penalty\`\` on Listen and Spot checks and a -2 \`\`penalty\`\` on Will saves against *sleep* effects while the *lullaby* is in effect. *Lullaby* lasts for as long as the caster concentrates, plus up to 1 round per caster level thereafter.`,
          component_details:null
        },
        // Spells that start with M
        'maddening scream': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mage\'s disjunction': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mage\'s faithful hound': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mage\'s lucubration': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mage\'s magnificent mansion': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mage\'s private sanctum': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mage\'s sword': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mage armor': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mage hand': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic aura': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic circle against chaos': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic circle against evil': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic circle against good': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic circle against law': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic fang': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic jar': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic missile': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic mouth': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic stone': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic vestment': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'magic weapon': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'major creation': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'major image': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'make whole': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mark of justice': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass bear\'s endurance': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass bull\'s strength': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass cat\'s grace': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass charm monster': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass cure critical wounds': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass cure light wounds': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass cure moderate wounds': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass cure serious wounds': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass eagle\'s splendor': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass enlarge person': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass fox\'s cunning': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        // Epic Spell: mass frog
        'mass heal': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass hold monster': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass hold person': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass inflict critical wounds': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass inflict light wounds': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass inflict moderate wounds': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass inflict serious wounds': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass invisibility': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass owl\'s wisdom': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass reduce person': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mass suggestion': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'maze': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'meld into stone': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mending': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mental pinnacle': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'message': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'meteor swarm': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mind blank': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mind fog': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'minor creation': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'minor image': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'miracle': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mirage arcana': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mirror image': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'misdirection': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mislead': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'mnemonic enhancer': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'modify memory': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'moment of prescience': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        // Epic Spell: momento mori
        'mount': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        'move earth': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        },
        // Epic Spell: mummy dust


        // Spells that start with N
        // Spells that start with O
        // Spells that start with P
        // Spells that start with Q
        // Spells that start with R
        // Spells that start with S
        // Spells that start with T
        // Spells that start with U
        // Spells that start with V
        // Spells that start with W
        // Spells that start with X
        // Spells that start with Y
        // Spells that start with Z


        //'': {
        //// ↲’‹›«»•×†‡ %28Spell%29
        //  ref:              '',
        //  school:           '',
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
        //  component_details:null
        //},
        /////////////////////////////////////
        'wall of fire': {
          ref:              'https://www.dandwiki.com/wiki/SRD:Wall_of_Fire',
          school:           'Evocation [Fire]',
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
          component_details:'Arcane Material Component: A small piece of phosphorus.'
        }
      },
      //spell_schools: {
      //  'abjuration':    'https://www.dandwiki.com/wiki/SRD:Abjuration_School',
      //  'conjuration':   'https://www.dandwiki.com/wiki/SRD:Conjuration_School',
      //  'divination':    'https://www.dandwiki.com/wiki/SRD:Divination_School',
      //  'enchantment':   'https://www.dandwiki.com/wiki/SRD:Enchantment_School',
      //  'evocation':     'https://www.dandwiki.com/wiki/SRD:Evocation_School',
      //  'illusion':      'https://www.dandwiki.com/wiki/SRD:Illusion_School',
      //  'necromancy':    'https://www.dandwiki.com/wiki/SRD:Necromancy_School',
      //  'transmutation': 'https://www.dandwiki.com/wiki/SRD:Transmutation_School',
      //  'universal':     'https://www.dandwiki.com/wiki/SRD:Universal_School'
      //},
      //spell_subschools: {
      //  'calling':       'https://www.dandwiki.com/wiki/SRD:Calling_Subschool',
      //  'creation':      'https://www.dandwiki.com/wiki/SRD:Creation_Subschool',
      //  'healing':       'https://www.dandwiki.com/wiki/SRD:Healing_Subschool',
      //  'summoning':     'https://www.dandwiki.com/wiki/SRD:Summoning_Subschool',
      //  'teleportation': 'https://www.dandwiki.com/wiki/SRD:Teleportation_Subschool',
      //  'scrying':       'https://www.dandwiki.com/wiki/SRD:Scrying_Subschool',
      //  'charm':         'https://www.dandwiki.com/wiki/SRD:Charm_Subschool',
      //  'compulsion':    'https://www.dandwiki.com/wiki/SRD:Compulsion_Subschool',
      //  'figment':       'https://www.dandwiki.com/wiki/SRD:Figment_Subschool',
      //  'glamer':        'https://www.dandwiki.com/wiki/SRD:Glamer_Subschool',
      //  'pattern':       'https://www.dandwiki.com/wiki/SRD:Pattern_Subschool',
      //  'phantasm':      'https://www.dandwiki.com/wiki/SRD:Phantasm_Subschool',
      //  'shadow':        'https://www.dandwiki.com/wiki/SRD:Shadow_Subschool'
      //},
      //spell_effects: {
      //  'acid':               'https://www.dandwiki.com/wiki/SRD:Acid_Effect',
      //  'air':                'https://www.dandwiki.com/wiki/SRD:Air_Effect',
      //  'chaotic':            'https://www.dandwiki.com/wiki/SRD:Chaotic_Effect',
      //  'cold':               'https://www.dandwiki.com/wiki/SRD:Cold_Effect',
      //  'darkness':           'https://www.dandwiki.com/wiki/SRD:Darkness_Effect',
      //  'death':              'https://www.dandwiki.com/wiki/SRD:Death_Effect',
      //  'earth':              'https://www.dandwiki.com/wiki/SRD:Earth_Effect',
      //  'electricity':        'https://www.dandwiki.com/wiki/SRD:Electricity_Effect',
      //  'evil':               'https://www.dandwiki.com/wiki/SRD:Evil_Effect',
      //  'good':               'https://www.dandwiki.com/wiki/SRD:Good_Effect',
      //  'fear':               'https://www.dandwiki.com/wiki/SRD:Fear_Effect',
      //  'fire':               'https://www.dandwiki.com/wiki/SRD:Fire_Effect',
      //  'force':              'https://www.dandwiki.com/wiki/SRD:Force_Effect',
      //  'language-dependent': 'https://www.dandwiki.com/wiki/SRD:Language-Dependent_Effect',
      //  'lawful':             'https://www.dandwiki.com/wiki/SRD:Lawful_Effect',
      //  'light effect':       'https://www.dandwiki.com/wiki/SRD:Light_Effect',
      //  'mind-affecting':     'https://www.dandwiki.com/wiki/SRD:Mind-Affecting_Effect',
      //  'sleep':              'https://www.dandwiki.com/wiki/SRD:Sleep_Effect',
      //  'sonic':              'https://www.dandwiki.com/wiki/SRD:Sonic_Effect',
      //  'water':              'https://www.dandwiki.com/wiki/SRD:Water_Effect'
      //},
      spell_ranges: {
        'close':    'Close ([[25+(5*floor([[?{Casting Level}/2]]))]] ft.)',
        'medium':   'Medium ([[100+(10*[[?{Casting Level}]])]] ft.)',
        'long':     'Long ([[400+(40*[[?{Casting Level}]])]] ft.)'
      }
    },
    source_text_UA: {
      spells: {
        'acid arrow':                      { recharge: 'General' },
        'acid fog':                        { recharge: 'General' },
        'acid splash':                     { recharge: 'General' },
        'aid':                             { recharge: '5 minutes' },
        'air walk':                        { recharge: '1 hour' },
        'alarm':                           { recharge: '4 hours' },
        'align weapon':                    { recharge: '5 minutes' },
        'alter self':                      { recharge: '4 hours' },
        'analyze dweomer':                 { recharge: 'General' },
        'animal growth':                   { recharge: 'General' },
        'animal messenger':                { recharge: '6 hours' },
        'animal shapes':                   { recharge: '24 hours' },
        'animal trance':                   { recharge: 'General' },
        'animate dead':                    { recharge: 'General' },
        'animate objects':                 { recharge: 'General' },
        'animate plants':                  { recharge: 'General' },
        'animate rope':                    { recharge: 'General' },
        'antilife shell':                  { recharge: 'General' },
        'antimagic field':                 { recharge: 'General' },
        'antipathy':                       { recharge: 'General' },
        'antiplant shell':                 { recharge: 'General' },
        'arcane eye':                      { recharge: 'General' },
        'arcane lock':                     { recharge: '1 hour' },
        'arcane mark':                     { recharge: 'General' },
        'arcane sight':                    { recharge: '30 minutes' },
        'armor of darkness':               { recharge: 'General' },
        'astral projection':               { recharge: 'General' },
        'atonement':                       { recharge: 'General' },
        'augury':                          { recharge: '6 hours' },
        'awaken':                          { recharge: 'General' },
        'baleful polymorph':               { recharge: 'General' },
        'bane':                            { recharge: 'General' },
        'banishment':                      { recharge: 'General' },
        'barkskin':                        { recharge: '1 hour' },
        'bear\'s endurance':               { recharge: '5 minutes' },
        'bestow curse':                    { recharge: 'General' },
        'binding':                         { recharge: 'General' },
        'black tentacles':                 { recharge: 'General' },
        'blade barrier':                   { recharge: 'General' },
        'blasphemy':                       { recharge: 'General' },
        'bless':                           { recharge: '30 minutes' },
        'bless water':                     { recharge: 'General' },
        'bless weapon':                    { recharge: '5 minutes' },
        'blight':                          { recharge: 'General' },
        'blindness/deafness':              { recharge: 'General' },
        'blink':                           { recharge: 'General' },
        'blur':                            { recharge: '5 minutes' },
        'bolt of glory':                   { recharge: 'General' },
        'bolts of bedevilment':            { recharge: 'General' },
        'brain spider':                    { recharge: '1 hour' },
        'break enchantment':               { recharge: '1 hour' },
        'bull\'s strength':                { recharge: '5 minutes' },
        'burning hands':                   { recharge: 'General' },
        'call lightning':                  { recharge: 'General' },
        'call lightning storm':            { recharge: 'General' },
        'calm animals':                    { recharge: 'General' },
        'calm emotions':                   { recharge: 'General' },
        'cat\'s grace':                    { recharge: '5 minutes' },
        'cause fear':                      { recharge: 'General' },
        'chain lightning':                 { recharge: 'General' },
        'changestaff':                     { recharge: '6 hours' },
        'chaos hammer':                    { recharge: 'General' },
        'charm animal':                    { recharge: '1 hour' },
        'charm monster':                   { recharge: '1 hour' },
        'charm person':                    { recharge: '1 hour' },
        'chill metal':                     { recharge: 'General' },
        'chill touch':                     { recharge: 'General' },
        'circle of death':                 { recharge: 'General' },
        'clenched fist':                   { recharge: 'General' },
        'clairaudience/clairvoyance':      { recharge: 'General' },
        'cloak of chaos':                  { recharge: 'General' },
        'clone':                           { recharge: 'General' },
        'cloudkill':                       { recharge: 'General' },
        'color spray':                     { recharge: 'General' },
        'command':                         { recharge: 'General' },
        'command plants':                  { recharge: '1 hour' },
        'command undead':                  { recharge: '1 hour' },
        'commune':                         { recharge: '6 hours' },
        'commune with nature':             { recharge: '6 hours' },
        'comprehend languages':            { recharge: '4 hours' },
        'cone of cold':                    { recharge: 'General' },
        'confusion':                       { recharge: 'General' },
        'consecrate':                      { recharge: '30 minutes' },
        'contact other plane':             { recharge: '6 hours' },
        'contagion':                       { recharge: 'General' },
        'contingency':                     { recharge: 'General' },
        'continual flame':                 { recharge: 'General' },
        'control plants':                  { recharge: '30 minutes' },
        'control undead':                  { recharge: '30 minutes' },
        'control water':                   { recharge: '1 hour' },
        'control weather':                 { recharge: 'General' },
        'control winds':                   { recharge: '4 hours' },
        'create food and water':           { recharge: '24 hours' },
        'create greater undead':           { recharge: 'General' },
        'create undead':                   { recharge: 'General' },
        'create water':                    { recharge: '30 minutes' },
        'crushing despair':                { recharge: 'General' },
        'crushing hand':                   { recharge: 'General' },
        'cure critical wounds':            { recharge: 'General' },
        'cure light wounds':               { recharge: 'General' },
        'cure minor wounds':               { recharge: 'General' },
        'cure moderate wounds':            { recharge: 'General' },
        'cure serious wounds':             { recharge: 'General' },
        'curse water':                     { recharge: 'General' },
        'dancing lights':                  { recharge: 'General' },
        'darkness':                        { recharge: '4 hours' },
        'darkvision':                      { recharge: '6 hours' },
        'daylight':                        { recharge: '4 hours' },
        'daze':                            { recharge: 'General' },
        'daze monster':                    { recharge: 'General' },
        'death knell':                     { recharge: 'General' },
        'death ward':                      { recharge: '5 minutes' },
        'deathwatch':                      { recharge: '4 hours' },
        'deep slumber':                    { recharge: 'General' },
        'deeper darkness':                 { recharge: '24 hours' },
        'delay poison':                    { recharge: '6 hours' },
        'delayed blast fireball':          { recharge: 'General' },
        'demand':                          { recharge: '30 minutes' },
        'desecrate':                       { recharge: '30 minutes' },
        'destruction':                     { recharge: 'General' },
        'detect animals or plants':        { recharge: 'General' },
        'detect chaos':                    { recharge: 'General' },
        'detect evil':                     { recharge: 'General' },
        'detect good':                     { recharge: 'General' },
        'detect law':                      { recharge: 'General' },
        'detect magic':                    { recharge: 'General' },
        'detect poison':                   { recharge: '5 minutes' },
        'detect scrying':                  { recharge: 'General' },
        'detect secret doors':             { recharge: 'General' },
        'detect snares and pits':          { recharge: 'General' },
        'detect undead':                   { recharge: 'General' },
        'dictum':                          { recharge: 'General' },
        'dimension door':                  { recharge: 'General' },
        'dimensional anchor':              { recharge: 'General' },
        'dimensional lock':                { recharge: '24 hours' },
        'diminish plants':                 { recharge: '4 hours' },
        'discern lies':                    { recharge: '6 hours' },
        'discern location':                { recharge: '6 hours' },
        'disguise self':                   { recharge: '4 hours' },
        'disintegrate':                    { recharge: 'General' },
        'disjunction':                     { recharge: 'General' },
        'dismissal':                       { recharge: 'General' },
        'dispel chaos':                    { recharge: 'General' },
        'dispel evil':                     { recharge: 'General' },
        'dispel good':                     { recharge: 'General' },
        'dispel law':                      { recharge: 'General' },
        'dispel magic':                    { recharge: 'General' },
        'displacement':                    { recharge: 'General' },
        'disrupt undead':                  { recharge: 'General' },
        'disrupting weapon':               { recharge: '5 minutes' },
        'divination':                      { recharge: '6 hours' },
        'divine favor':                    { recharge: '5 minutes' },
        'divine power':                    { recharge: '5 minutes' },
        'dominate animal':                 { recharge: 'General' },
        'dominate monster':                { recharge: '12 hours' },
        'dominate person':                 { recharge: '12 hours' },
        'doom':                            { recharge: 'General' },
        'dream':                           { recharge: 'General' },
        'dweomer of transference':         { recharge: '1 hour' },
        'eagle\'s splendor':               { recharge: '5 minutes' },
        'earthquake':                      { recharge: '12 hours' },
        'elemental swarm':                 { recharge: '1 hour' },
        'endure elements':                 { recharge: '6 hours' },
        'energy drain':                    { recharge: 'General' },
        'enervation':                      { recharge: 'General' },
        'enlarge person':                  { recharge: '5 minutes' },
        'entangle':                        { recharge: 'General' },
        'enthrall':                        { recharge: 'General' },
        'entropic shield':                 { recharge: '30 minutes' },
        'erase':                           { recharge: 'General' },
        'ethereal jaunt':                  { recharge: '30 minutes' },
        'etherealness':                    { recharge: '30 minutes' },
        'expeditious retreat':             { recharge: '30 minutes' },
        'explosive runes':                 { recharge: '24 hours' },
        'eyebite':                         { recharge: 'General' },
        'fabricate':                       { recharge: '4 hours' },
        'faerie fire':                     { recharge: 'General' },
        'false life':                      { recharge: '30 minutes' },
        'false vision':                    { recharge: '24 hours' },
        'fear':                            { recharge: 'General' },
        'feather fall':                    { recharge: 'General' },
        'feeblemind':                      { recharge: 'General' },
        'find the path':                   { recharge: '4 hours' },
        'find traps':                      { recharge: '30 minutes' },
        'finger of death':                 { recharge: 'General' },
        'fire seeds':                      { recharge: '1 hour' },
        'fire shield':                     { recharge: 'General' },
        'fire storm':                      { recharge: 'General' },
        'fire trap':                       { recharge: '24 hours' },
        'fireball':                        { recharge: 'General' },
        'flame arrow':                     { recharge: 'General' },
        'flame blade':                     { recharge: 'General' },
        'flame strike':                    { recharge: 'General' },
        'flaming sphere':                  { recharge: 'General' },
        'flare':                           { recharge: 'General' },
        'flesh to stone':                  { recharge: 'General' },
        'floating disk':                   { recharge: '6 hours' },
        'fly':                             { recharge: '5 minutes' },
        'fog cloud':                       { recharge: 'General' },
        'forbiddance':                     { recharge: 'General' },
        'forcecage':                       { recharge: '1 hour' },
        'forceful hand':                   { recharge: 'General' },
        'foresight':                       { recharge: '1 hour' },
        'fox\'s cunning':                  { recharge: '5 minutes' },
        'freedom':                         { recharge: 'General' },
        'freedom of movement':             { recharge: '1 hour' },
        'freezing sphere':                 { recharge: 'General' },
        'gaseous form':                    { recharge: '5 minutes' },
        'gate':                            { recharge: 'General' },
        'geas/quest':                      { recharge: 'General' },
        'genesis':                         { recharge: 'General' },
        'gentle repose':                   { recharge: 'General' },
        'ghost sound':                     { recharge: 'General' },
        'ghoul touch':                     { recharge: 'General' },
        'giant vermin':                    { recharge: '30 minutes' },
        'glibness':                        { recharge: '4 hours' },
        'glitterdust':                     { recharge: 'General' },
        'globe of invulnerability':        { recharge: 'General' },
        'glossolalia':                     { recharge: 'General' },
        'glyph of warding':                { recharge: 'General' },
        'good hope':                       { recharge: '30 minutes' },
        'goodberry':                       { recharge: '6 hours' },
        'grasping hand':                   { recharge: 'General' },
        'grease':                          { recharge: 'General' },
        'greater arcane sight':            { recharge: '30 minutes' },
        'greater command':                 { recharge: 'General' },
        'greater dispel magic':            { recharge: 'General' },
        'greater glyph of warding':        { recharge: 'General' },
        'greater heroism':                 { recharge: '30 minutes' },
        'greater invisibility':            { recharge: 'General' },
        'greater magic fang':              { recharge: '6 hours' },
        'greater magic weapon':            { recharge: '6 hours' },
        'greater planar ally':             { recharge: '24 hours' },
        'greater planar binding':          { recharge: '24 hours' },
        'greater prying eyes':             { recharge: 'General' },
        'greater psychic turmoil':         { recharge: 'General' },
        'greater restoration':             { recharge: 'General' },
        'greater scrying':                 { recharge: '6 hours' },
        'greater shadow conjuration':      { recharge: 'General' },
        'greater shadow evocation':        { recharge: 'General' },
        'greater shout':                   { recharge: 'General' },
        'greater spell immunity':          { recharge: '1 hour' },
        'greater status':                  { recharge: 'General' },
        'greater teleport':                { recharge: '4 hours' },
        'guards and wards':                { recharge: '24 hours' },
        'guidance':                        { recharge: '5 minutes' },
        'gust of wind':                    { recharge: 'General' },
        'hallow':                          { recharge: 'General' },
        'hallucinatory terrain':           { recharge: '6 hours' },
        'halt undead':                     { recharge: 'General' },
        'hardening':                       { recharge: 'General' },
        'harm':                            { recharge: 'General' },
        'haste':                           { recharge: 'General' },
        'heal':                            { recharge: 'General' },
        'heal mount':                      { recharge: 'General' },
        'heat metal':                      { recharge: 'General' },
        'helping hand':                    { recharge: '6 hour' },
        'heroes\' feast':                  { recharge: '24 hours' },
        'heroism':                         { recharge: '1 hour' },
        'hide from animals':               { recharge: '4 hours' },
        'hide from undead':                { recharge: '4 hours' },
        'hideous laughter':                { recharge: 'General' },
        'hold animal':                     { recharge: 'General' },
        'hold monster':                    { recharge: 'General' },
        'hold person':                     { recharge: 'General' },
        'hold portal':                     { recharge: 'General' },
        'holy aura':                       { recharge: 'General' },
        'holy smite':                      { recharge: 'General' },
        'holy sword':                      { recharge: 'General' },
        'holy word':                       { recharge: 'General' },
        'horrid wilting':                  { recharge: 'General' },
        'hypnotic pattern':                { recharge: 'General' },
        'hypnotism':                       { recharge: 'General' },
        'ice storm':                       { recharge: 'General' },
        'identify':                        { recharge: 'General' },
        'illusory script':                 { recharge: 'General' },
        'illusory wall':                   { recharge: '24 hours' },
        'imbue with spell ability':        { recharge: 'General' },
        'implosion':                       { recharge: 'General' },
        'imprisonment':                    { recharge: 'General' },
        'incendiary cloud':                { recharge: 'General' },
        'inflict critical wounds':         { recharge: 'General' },
        'inflict light wounds':            { recharge: 'General' },
        'inflict minor wounds':            { recharge: 'General' },
        'inflict moderate wounds':         { recharge: 'General' },
        'inflict serious wounds':          { recharge: 'General' },
        'insanity':                        { recharge: 'General' },
        'insect plague':                   { recharge: '5 minutes' },
        'instant summons':                 { recharge: 'General' },
        'interposing hand':                { recharge: 'General' },
        'invisibility':                    { recharge: '5 minutes' },
        'invisibility purge':              { recharge: '30 minutes' },
        'invisibility sphere':             { recharge: 'General' },
        'iron body':                       { recharge: '30 minutes' },
        'ironwood':                        { recharge: '12 hours' },
        'irresistible dance':              { recharge: 'General' },
        'jump':                            { recharge: '5 minutes' },
        'keen edge':                       { recharge: '1 hour' },
        'knock':                           { recharge: '5 minutes' },
        'know direction':                  { recharge: 'General' },
        'legend lore':                     { recharge: 'General' },
        'lesser confusion':                { recharge: 'General' },
        'lesser geas':                     { recharge: 'General' },
        'lesser globe of invulnerability': { recharge: 'General' },
        'lesser planar ally':              { recharge: '24 hours' },
        'lesser planar binding':           { recharge: '24 hours' },
        'lesser restoration':              { recharge: 'General' },
        'lesser telepathic bond':          { recharge: '1 hour' },
        'levitate':                        { recharge: '5 minutes' },
        'light':                           { recharge: '1 hour' },
        'lightning bolt':                  { recharge: 'General' },
        'limited wish':                    { recharge: 'General' },
        'liveoak':                         { recharge: '12 hours' },
        'locate creature':                 { recharge: '4 hours' },
        'locate object':                   { recharge: '30 minutes' },
        'longstrider':                     { recharge: '24 hours' },
        'lullaby':                         { recharge: 'General' }
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
                      if (['','-','fill','empty'].includes(stringTrimWhitespace(spellmacro))) {
                        var spell_name = stringTrimWhitespace(spellname_attr.get('current').toLowerCase()).replace(/[^a-z ]/g, '');
                        if (Object.keys(dnd35.spells()).includes(spell_name)) {
                          var spell_spec = dnd35.spell(spell_name);
                          //log(spell_spec);
                          //log("^^^^^^^^^^^^^^");
                          var new_spell_name = spellname_attr.get('current').replace(/[^A-Za-z ]/g, '');
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
                          setAttrByName(character.id,spellname_attr.get('name'),new_spell_name);
                          spellmacro = '&{template:DnD35StdRoll} {{spellflag=true}} {{name=@{character_name}}}';
                          if (spell_spec.ref.match(/^https{0,1}:\/\//)) {
                            spellmacro = spellmacro.concat(' {{subtags=casts [',spellname_attr.get('current'), '](', spell_spec.ref, ')}}');
                          } else {
                            spellmacro = spellmacro.concat(' {{subtags=casts ',spellname_attr.get('current'),'↲',spell_spec.ref,'}}');
                          };
                          {
                            // SCHOOL
                            var match_results = spell_spec.school.match(/^([A-Za-z]+)( +\([A-Za-z]+\)){0,1}( +\[[-A-Za-z, ]+\]){0,1}$/);
                            if (match_results == null) { log("Error!") };
                            var formatted_school = stringTrimWhitespace(match_results[1]);
                            if (match_results[2] != null) { formatted_school = formatted_school.concat('↲', stringTrimWhitespace(match_results[2])); };
                            if (match_results[3] != null) { formatted_school = formatted_school.concat('↲', stringTrimWhitespace(match_results[3])); };
                            spellmacro = spellmacro.concat(' {{School:=',formatted_school,'}}');
                          };
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
                          spellmacro = spellmacro.concat(' {{',spell_spec.target_type,':=',spell_spec.target.replace(/\(S\)$/, "(Shapeable)"),'}}');
                          spellmacro = spellmacro.concat(' {{Duration:=',spell_spec.duration.replace(/\(D\)$/, "(Dismissible)"),'}}');
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
                          if (spell_spec.component_details) {
                            spellmacro = spellmacro.concat(' {{notes=',spell_spec.component_details.replace(/^([A-Za-z ]+\:)/gm, "**$1**"),'}}');
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
