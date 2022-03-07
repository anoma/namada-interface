"use strict";
exports.__esModule = true;
exports.Mnemonic = exports.MnemonicLength = void 0;
var anoma_wasm_js_1 = require("./lib/anoma_wasm.js");
var MnemonicLength;
(function (MnemonicLength) {
    MnemonicLength[MnemonicLength["Twelve"] = 12] = "Twelve";
    MnemonicLength[MnemonicLength["TwentyFour"] = 24] = "TwentyFour";
})(MnemonicLength = exports.MnemonicLength || (exports.MnemonicLength = {}));
var Mnemonic = /** @class */ (function () {
    function Mnemonic(length, mnemonicFromString) {
        if (mnemonicFromString) {
            this.value = mnemonicFromString;
            return;
        }
        this.value = (0, anoma_wasm_js_1.generate_mnemonic)(length);
    }
    Mnemonic.fromString = function (fromString) {
        var mnemonicLength;
        switch (fromString.split(" ").length) {
            case 12:
                mnemonicLength = MnemonicLength.Twelve;
                break;
            case 24:
                mnemonicLength = MnemonicLength.TwentyFour;
                break;
            default:
                throw new Error("Invalid number of words in the mnemonic");
        }
        var self = new Mnemonic(mnemonicLength, fromString);
        return self;
    };
    return Mnemonic;
}());
exports.Mnemonic = Mnemonic;
