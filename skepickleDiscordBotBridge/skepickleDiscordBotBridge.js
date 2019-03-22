var skepickleDiscordBotBridge = skepickleDiscordBotBridge || (function skepickleDiscordBotBridgeImp() {
  "use strict";

  // SHAMEFULLY stolen from https://github.com/Roll20/roll20-api-scripts/blob/master/Base64/Base64.js
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  var utf8_encode = function (string) {
    var utftext = '',
      n, c1;
    for (n = 0; n < string.length; n++) {
      c1 = string.charCodeAt(n);
      if (c1 < 128) {
        utftext += String.fromCharCode(c1);
      }
      else if((c1 > 127) && (c1 < 2048)) {
        utftext += String.fromCharCode((c1 >> 6) | 192);
        utftext += String.fromCharCode((c1 & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c1 >> 12) | 224);
        utftext += String.fromCharCode(((c1 >> 6) & 63) | 128);
        utftext += String.fromCharCode((c1 & 63) | 128);
      }
    }
    return utftext;
  };

  var utf8_decode = function (utftext) {
    var string = '',
        i = 0,
        c1 = 0,
        c2 = 0,
        c3 = 0;
    while ( i < utftext.length ) {
      c1 = utftext.charCodeAt(i);
      if (c1 < 128) {
        string += String.fromCharCode(c1);
        i++;
      }
      else if((c1 > 191) && (c1 < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  };

  var base64_encode = function (input) {
    var output = '',
        chr1, chr2, chr3, enc1, enc2, enc3, enc4,
        i = 0;
    input = utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output +
      keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
  };

  var base64_decode = function (input) {
    var output = '',
        chr1, chr2, chr3,
        enc1, enc2, enc3, enc4,
        i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = utf8_decode(output);
    return output;
  };

  // SHAMEFULLY stolen from https://gist.github.com/sukima/5613286
  var b64_table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  function b64_encode(data) {
    var o1, o2, o3, h1, h2, h3, h4, bits, r, i = 0, enc = "";
    if (!data) { return data; }
    do {
      o1 = data[i++];
      o2 = data[i++];
      o3 = data[i++];
      bits = o1 << 16 | o2 << 8 | o3;
      h1 = bits >> 18 & 0x3f;
      h2 = bits >> 12 & 0x3f;
      h3 = bits >> 6 & 0x3f;
      h4 = bits & 0x3f;
      enc += b64_table.charAt(h1) + b64_table.charAt(h2) + b64_table.charAt(h3) + b64_table.charAt(h4);
    } while (i < data.length);
    r = data.length % 3;
    return (r ? enc.slice(0, r - 3) : enc) + "===".slice(r || 3);
  }

  function b64_decode(data) {
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, result = [];
    if (!data) { return data; }
    data += "";
    do {
      h1 = b64_table.indexOf(data.charAt(i++));
      h2 = b64_table.indexOf(data.charAt(i++));
      h3 = b64_table.indexOf(data.charAt(i++));
      h4 = b64_table.indexOf(data.charAt(i++));
      bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
      o1 = bits >> 16 & 0xff;
      o2 = bits >> 8 & 0xff;
      o3 = bits & 0xff;
      result.push(o1);
      if (h3 !== 64) {
        result.push(o2);
        if (h4 !== 64) {
          result.push(o3);
        }
      }
    } while (i < data.length);
    return result;
  }

  function keyCharAt(key, i) {
    return key.charCodeAt( Math.floor(i % key.length) );
  }

  function xor_encrypt(key, data) {
    return _.map(data, function(c, i) {
      return c.charCodeAt(0) ^ keyCharAt(key, i);
    });
  }

  function xor_decrypt(key, data) {
    return _.map(data, function(c, i) {
      return String.fromCharCode( c ^ keyCharAt(key, i) );
    }).join("");
  }

  // OC

  var info = {
    version: 0.1,
    authorName: "skepickle"
  };

  var config = {
    debugDEFCON: 5,
  };

  var temp = {
    //campaignLoaded: false,
    GMPlayer: Campaign
  };

  var handleInput = function inputHandler(msg) {
    if (msg.type !== "api" || msg.content.indexOf("!sdbb") === -1 ) { return; };

    var argsFromUser,
        who,
        errors=[],
        msg_sender_id,
        msg_sender_name,
        pageID,
        tileID,
        requestedToggle,
        userCommand,
        selected_creatures=[];

    msg_sender_name = msg.who.replace(new RegExp(" \\(GM\\)$"), "");
    msg_sender_id   = msg.playerid;

    argsFromUser = msg.content.split(/ +/);
    userCommand = argsFromUser[1];
    tileID = argsFromUser[2];
    requestedToggle = argsFromUser[2];

    if (msg.selected) {
      for (var selected of msg.selected) {
        if (selected["_type"] != "graphic") { continue; };
        var obj = getObj("graphic", selected["_id"]);
        if (obj.get("_subtype") != "token") { continue; };
        if (obj.get("represents") == "") { continue; };
        //var character = getObj("character", obj.get("represents"));
        //var npcreach = getAttrByName(character.id, "npcreach").replace(new RegExp("[^\.0-9].*$"), "");
        //if (isNaN(npcreach)) { continue; };
        selected_creatures.push(selected["_id"]);
      };
    };

    switch(userCommand) {
      case '--cs-to-discord':
        var bridge_obj = findObjs({
          _type: "handout",
          name: "DISCORD_BRIDGE",
        }, {caseInsensitive: false});
        if (!bridge_obj) {
          // No DISCORD_BRIDGE handout found
          log("ERROR!");
          return;
        };
        if (bridge_obj.length > 1) {
          log("Found more than one DISCORD_BRIDGE handout, picking first arbitrarily");
        };
        bridge_obj = bridge_obj[0];
        var discord_bridge_data = {};
        selected_creatures.forEach(function(selected) {
          var obj = getObj("graphic", selected);
          var character = getObj("character", obj.get("represents"));
          if (!character) { return; };
          var playername     = getAttrByName(character.id, "playername");
          var character_name = getAttrByName(character.id, "character_name");
          if (!(playername in discord_bridge_data)) {
            discord_bridge_data[playername] = {};
          };
          if (!(character_name in discord_bridge_data[playername])) {
            discord_bridge_data[playername][character_name] = { attributes: {} };
          };
          var attributes = findObjs({
              _type: "attribute",
              _characterid: character.id
          });
          attributes.forEach(function(attrib) {
            discord_bridge_data[playername][character_name].attributes[attrib.get("name")]          = attrib.get("current");
            if (attrib.get("max") !== "") {
              discord_bridge_data[playername][character_name].attributes[attrib.get("name")+"|max"] = attrib.get("max");
            };
          });
        });
        //bridge_obj.set("notes", utf8_decode(xor_decrypt("SUPER!SECRET~KEY",b64_decode(b64_encode(xor_encrypt("SUPER!SECRET~KEY", utf8_encode(JSON.stringify(discord_bridge_data)))))))); // Do the full cycle for testing
        bridge_obj.set("notes", b64_encode(xor_encrypt("SUPER!SECRET~KEY", utf8_encode(JSON.stringify(discord_bridge_data)))));
        break;
      case '--help':
      //  getHelp();
          sendChat(msg_sender_name, '/w "'+msg_sender_name+'" Test 1 2 3 '+msg_sender_name);
          break;
      break;
      case undefined:
      //  getHelp();
      break;
    };
    //getHelp();
  };

  var registerEventHandlers = function() {
    on('chat:message', handleInput);
  };

  var checkInstall = function() {
    if ( Boolean(state.skepickleDiscordBotBridgeImp) === false ) {
      state.skepickleDiscordBotBridgeImp = {
        info: info,
        config: config
      };
    };
  };

  var initialize = function() {
    temp.campaignLoaded = true;
  };

  return { // make these functions available outside the local namespace
    CheckInstall: checkInstall,
    RegisterEventHandlers: registerEventHandlers,
    Initialize: initialize
  };

}());

on("ready", function() {
  skepickleDiscordBotBridge.CheckInstall();
  skepickleDiscordBotBridge.Initialize();
  skepickleDiscordBotBridge.RegisterEventHandlers();
});