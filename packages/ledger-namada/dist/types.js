"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signature = void 0;
class Signature {
    constructor(signature) {
        if (signature == null) {
            this.isFilled = false;
            this.raw = Buffer.from([]);
            this.secIndices = Buffer.from([]);
            this.sigType = 0 /* SignatureType.RawSignature */;
            this.singlesig = null;
            this.multisigIndices = Buffer.from([]);
            this.multisig = [];
        }
        else {
            this.isFilled = true;
            this.raw = signature.raw;
            this.secIndices = signature.secIndices;
            this.sigType = signature.sigType;
            this.singlesig = signature.singlesig;
            this.multisigIndices = signature.multisigIndices;
            this.multisig = signature.multisig;
        }
    }
}
exports.Signature = Signature;
//# sourceMappingURL=types.js.map