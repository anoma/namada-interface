"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signature = void 0;
class Signature {
    constructor(signature) {
        if (signature == null) {
            this.isFilled = false;
            this.pubkey = Buffer.from([]);
            this.raw_salt = Buffer.from([]);
            this.raw_signature = Buffer.from([]);
            this.wrapper_salt = Buffer.from([]);
            this.wrapper_signature = Buffer.from([]);
            this.raw_indices = Buffer.from([]);
            this.wrapper_indices = Buffer.from([]);
        }
        else {
            this.isFilled = true;
            this.pubkey = signature.pubkey;
            this.raw_salt = signature.raw_salt;
            this.raw_signature = signature.raw_signature;
            this.wrapper_salt = signature.wrapper_salt;
            this.wrapper_signature = signature.wrapper_signature;
            this.raw_indices = signature.raw_indices;
            this.wrapper_indices = signature.wrapper_indices;
        }
    }
}
exports.Signature = Signature;
//# sourceMappingURL=types.js.map