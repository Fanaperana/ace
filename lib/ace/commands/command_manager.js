define(function(require, exports, module) {

var keyUtil = require('pilot/keys');
var useragent = require('pilot/useragent');

var commands = {};
var commmandKeyBinding = {};

exports.addCommand = function(command) {
    commands[command.name] = command;

    if (command.bindKey) {
        buildKeyHash(command);   
    }
};

var platform = useragent.isMac ? "mac" : "win";
function buildKeyHash(command) {
    var binding = command.bindKey;
    var key = binding[platform];
    var ckb = commmandKeyBinding;

    if(!binding[platform]) {
        return;   
    }
    
    key.split("|").forEach(function(keyPart) {
        var binding = parseKeys(keyPart, command);
        var hashId = binding.hashId;
        (ckb[hashId] || (ckb[hashId] = {}))[binding.key] = command;
    });
}

function parseKeys(keys, val, ret) {
    var key;
    var hashId = 0;
    var parts = splitSafe(keys, "\\-", null, true);

    for (var i=0, l = parts.length; i < l; i++) {
        if (keyUtil.KEY_MODS[parts[i]])
            hashId = hashId | keyUtil.KEY_MODS[parts[i]];
        else
            key = parts[i] || "-"; //when empty, the splitSafe removed a '-'
    }
    
    return {
        key: key,
        hashId: hashId
    }   
}

function splitSafe(s, separator, limit, bLowerCase) {
    return (bLowerCase && s.toLowerCase() || s)
        .replace(/(?:^\s+|\n|\s+$)/g, "")
        .split(new RegExp("[\\s ]*" + separator + "[\\s ]*", "g"), limit || 999);
}

exports.findKeyCommand = function findKeyCommand(env, hashId, textOrKey) {
    // Convert keyCode to the string representation.
    if (typeof textOrKey == "number") {
        textOrKey = keyUtil.keyCodeToString(textOrKey);
    }
    
    var ckbr = commmandKeyBinding;
    return ckbr[hashId] && ckbr[hashId][textOrKey];
}

exports.exec = function(command, env, args) {
    command.exec(env, args || {});
};

});