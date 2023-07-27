"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signature = void 0;
class Signature {
    constructor(signature) {
        if (signature == null) {
            this.raw = Buffer.from([]);
            this.isFilled = false;
            this.salt = Buffer.from([]);
            this.indices = Buffer.from([]);
            this.pubkey = Buffer.from([]);
            this.signature = null;
        }
        else {
            this.isFilled = true;
            this.raw = signature.raw;
            this.salt = signature.salt;
            this.indices = signature.indices;
            this.pubkey = signature.pubkey;
            this.signature = signature.signature;
        }
    }
}
exports.Signature = Signature;
//# sourceMappingURL=types.js.map