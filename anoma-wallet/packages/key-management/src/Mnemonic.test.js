"use strict";
exports.__esModule = true;
var Mnemonic_1 = require("./Mnemonic");
test("mnemonic should have a correct length", function () {
    var mnemonic1 = new Mnemonic_1.Mnemonic(Mnemonic_1.MnemonicLength.Twelve);
    expect(mnemonic1.value.split(" ")).toHaveLength(12);
    var mnemonic2 = new Mnemonic_1.Mnemonic(Mnemonic_1.MnemonicLength.TwentyFour);
    expect(mnemonic2.value.split(" ")).toHaveLength(24);
});
