/**
 * BIP: 32
 * Title: Hierarchical Deterministic Wallets
 * 
 * https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 */

var HDW = (function () {
    // 2^31
    const HARDENED = Math.pow(2, 31);
    // secp256k1
    const SECP256K1 = KJUR.crypto.ECParameterDB.getByName("secp256k1");
    // As standard conversion functions, we assume:
    // point(p): returns the coordinate pair resulting from EC point multiplication
    // (repeated application of the EC group operation) of the secp256k1 base point with the integer p.
    function point(p) {
        return SECP256K1['G'].multiply(p);
    }
    // ser32(i): serialize a 32-bit unsigned integer i as a 4-byte sequence, most significant byte first.
    function ser32(i) {
        return toHex(i.toString(16), 4);
    }
    // ser256(p): serializes the integer p as a 32-byte sequence, most significant byte first.
    function ser256(p) {
        return toHex(p.toString(16), 32);
    }
    // serP(P): serializes the coordinate pair P = (x,y) as a byte sequence using SEC1's compressed form:
    // (0x02 or 0x03) || ser256(x), where the header byte depends on the parity of the omitted y coordinate.
    function serP(P) {
        let x = P.getX().toBigInteger();
        let y = P.getY().toBigInteger();
        let hex = toHex(x.toString(16), 32);
        let head = "03";
        if (y.isEven()) {
            head = "02";
        }
        return head + hex;
    }
    // parse256(p): interprets a 32-byte sequence as a 256-bit number, most significant byte first.
    function parse256(p) {
        return new BigInteger(p, 16);
    }
    // HMAC-SHA512
    function hmacSha512(key, data) {
        let mac = new KJUR.crypto.Mac({ alg: "hmacsha512", "pass": { "hex": key } });
        return mac.doFinalHex(data);
    }
    // toHex
    function toHex(hex, byteSize) {
        let ret = hex;
        while (ret.length < (byteSize * 2)) {
            ret = "0" + ret;
        }
        return ret;
    }
    // https://bitcointalk.org/index.php?topic=162805.msg1712294#msg1712294
    function decompressPoint(pub) {
        // ec.CurveFp.prototype.decompressPoint = function (yOdd, X) {
        //     if (this.q.mod(BigInteger.valueOf(4)).equals(BigInteger.valueOf(3))) {
        // secp256k1 is match condition.
        let curve = SECP256K1['curve'];
        let yOdd = (pub.substring(0, 2) == "03") ? true : false;
        let X = new BigInteger(pub.substr(2), 16);
        //         // y^2 = x^3 + ax^2 + b, so we need to perform sqrt to recover y
        //         var ySquared = X.multiply(X.square().add(this.a)).add(this.b);
        let b = curve.getB().toBigInteger();
        let ySquared = X.multiply(X.square()).add(b); // secp256k1 is a = 0;
        //         // sqrt(a) = a^((q+1)/4) if q = 3 mod 4
        //         var Y = ySquared.x.modPow(this.q.add(BigInteger.ONE).divide(BigInteger.valueOf(4)), this.q);
        let q = curve.getQ();
        let Y = ySquared.modPow(q.add(BigInteger.ONE).divide(new BigInteger("4")), q);
        //         if (Y.testBit(0) !== yOdd) {
        //             Y = this.q.subtract(Y);
        //         }
        if (Y.testBit(0) !== yOdd) {
            Y = q.subtract(Y);
        }
        //         return new ec.PointFp(this, X, this.fromBigInteger(Y));
        return new ECPointFp(curve, curve.fromBigInteger(X), curve.fromBigInteger(Y));
        //     }
        //     else {
        //         // only implement sqrt for q = 3 mod 4
        //         return null;
        //     }
        // };
    };
    const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const BASE58_RADIX = new BigInteger("" + BASE58.length);
    function base58enc(hex) {
        let x = new BigInteger(hex, 16);
        let base58 = "";
        while (x.compareTo(BigInteger.ZERO) > 0) {
            let dr = x.divideAndRemainder(BASE58_RADIX);
            base58 = BASE58[dr[1].intValue()] + base58;
            x = dr[0];
        }
        for (let i = 0; i < hex.length; i += 2) {
            if (hex.substr(i, 2) == "00") {
                base58 = BASE58[0] + base58;
            } else {
                break;
            }
        }
        return base58;
    }
    function base58dec(base58) {
        let answer = new BigInteger("0");
        let j = new BigInteger("1");
        let scratch = null;
        for (let i = base58.length - 1; i >= 0; i--) {
            let tmp = BASE58.indexOf(base58.charAt(i));
            if (tmp < 0) {
                return "";
            }
            scratch = new BigInteger("" + tmp);
            scratch = j.multiply(scratch);
            answer = answer.add(scratch);
            j = j.multiply(BASE58_RADIX);
        }
        let hex = "";
        if (answer.compareTo(BigInteger.ZERO) > 0) {
            hex = answer.toString(16);
            if (hex.length % 2 == 1) {
                hex = "0" + hex;
            }
        }
        let numZeros = null;
        for (numZeros = 0; numZeros < base58.length; numZeros++) {
            if (base58.charAt(numZeros) != '1') {
                break;
            } else {
                hex = "00" + hex;
            }
        }
        return hex;
    }
    function sha256(hex) {
        let sha256 = "";
        let md = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "sjcl" }); // sjcl supports sha256 only
        sha256 = md.digestHex(hex);
        return sha256;
    }
    function ripemd160(hex) {
        let ripemd160 = "";
        let md = new KJUR.crypto.MessageDigest({ alg: "ripemd160", prov: "cryptojs" });
        ripemd160 = md.digestHex(hex);
        return ripemd160;
    }
    function hash256(hex) {
        return sha256(sha256(hex));
    }
    function hash160(hex) {
        return ripemd160(sha256(hex));
    }
    function HDW(priver, pubver) {
        let privateversion = "0488ade4";
        let publicversion = "0488b21e";
        if (priver && KJUR.lang.String.isHex(priver)) {
            privateversion = priver;
        }
        if (pubver && KJUR.lang.String.isHex(pubver)) {
            publicversion = pubver;
        }
        /**
         * Private parent key → private child key
         * 
         * The function CKDpriv((kpar, cpar), i) → (ki, ci)
         * computes a child extended private key from the parent extended private key:
         * 
         */
        this.CKDpriv = function (Kpar, cpar, i) {
            let kpar = new BigInteger(Kpar, 16);
            let hash = null;
            // Check whether i ≥ 2^31 (whether the child is a hardened key).
            if (i >= HARDENED) {
                // If so (hardened child):
                // let I = HMAC-SHA512(Key = cpar, Data = 0x00 || ser256(kpar) || ser32(i)).
                // (Note: The 0x00 pads the private key to make it 33 bytes long.)
                hash = hmacSha512(cpar, "00" + ser256(kpar) + ser32(i));
            } else {
                // If not (normal child):
                // let I = HMAC-SHA512(Key = cpar, Data = serP(point(kpar)) || ser32(i)).
                hash = hmacSha512(cpar, serP(point(kpar)) + ser32(i));
            }

            // Split I into two 32-byte sequences, IL and IR.
            let left = hash.substring(0, 64);
            let right = hash.substr(64);

            // The returned child key ki is parse256(IL) + kpar (mod n).
            let ki = ser256(parse256(left).add(kpar).mod(SECP256K1['n']));

            // The returned chain code ci is IR.
            let ci = right;

            // TODO
            // In case parse256(IL) ≥ n or ki = 0, the resulting key is invalid,
            // and one should proceed with the next value for i.
            // (Note: this has probability lower than 1 in 2127.)

            return { ki: ki, ci: ci };
        }
        /**
         * Public parent key → public child key
         * The function CKDpub((Kpar, cpar), i) → (Ki, ci)
         * computes a child extended public key from the parent extended public key.
         * It is only defined for non-hardened child keys.
         */
        this.CKDpub = function (Kpar, cpar, i) {
            // Check whether i ≥ 2^31 (whether the child is a hardened key).
            if (i >= HARDENED) {
                // If so (hardened child): return failure
                return null;
            } else {
                let kpar = decompressPoint(Kpar);
                // If not (normal child): let I = HMAC-SHA512(Key = cpar, Data = serP(Kpar) || ser32(i)).
                let hash = hmacSha512(cpar, serP(kpar) + ser32(i));

                // Split I into two 32-byte sequences, IL and IR.
                let left = hash.substring(0, 64);
                let right = hash.substr(64);

                // The returned child key Ki is point(parse256(IL)) + Kpar.
                let ki = serP(point(parse256(left)).add(kpar));

                // The returned chain code ci is IR.
                let ci = right;

                // TODO
                // In case parse256(IL) ≥ n or Ki is the point at infinity,
                // the resulting key is invalid, and one should proceed with the next value for i.

                return { ki: ki, ci: ci };
            }
        }
        /**
         * Private parent key → public child key
         * The function N((k, c)) → (K, c)
         * computes the extended public key corresponding to an extended private key
         * (the "neutered" version, as it removes the ability to sign transactions).
         */
        this.N = function (k, c) {
            // The returned key K is point(k).
            // The returned chain code c is just the passed chain code.
            let K = serP(point(new BigInteger(k, 16)));
            return { K: K, c: c };
        }
        // Public parent key → private child key
        // This is not possible.

        // Master key generation
        // The total number of possible extended keypairs is almost 2512, but the produced keys are only 256 bits long,
        // and offer about half of that in terms of security. Therefore, master keys are not generated directly,
        // but instead from a potentially short seed value.
        this.generate = function (seed) {
            // Generate a seed byte sequence S of a chosen length (between 128 and 512 bits; 256 bits is advised) from a (P)RNG.
            let data = "Bitcoin seed";
            let key = "";
            for (let i = 0; i < data.length; i++) {
                key += toHex(data.charCodeAt(i).toString(16));
            }
            // Calculate I = HMAC-SHA512(Key = "Bitcoin seed", Data = S)
            let hash = hmacSha512(key, seed);

            // Split I into two 32-byte sequences, IL and IR.
            let left = hash.substring(0, 64);
            let right = hash.substr(64);

            // Use parse256(IL) as master secret key, and IR as master chain code.
            return { key: left, chain: right };
        }

        // Serialization format
        // Extended public and private keys are serialized as follows:
        this.format = function (version, depth, fingerprint, childNumber, chainCode, key) {
            let format = null;
            // 4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
            let hex = version;
            // 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 derived keys, ....
            hex += toHex(depth.toString(16), 1);
            // 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
            hex += fingerprint;
            // 4 bytes: child number. This is ser32(i) for i in xi = xpar/i, with xi the key being serialized. (0x00000000 if master key)
            hex += ser32(childNumber);
            // 32 bytes: the chain code
            hex += chainCode;
            // 33 bytes: the public key or private key data (serP(K) for public keys, 0x00 || ser256(k) for private keys)
            if (key.length == 64) {
                hex += "00" + key;
            } else {
                hex += key;
            }
            // This 78 byte structure can be encoded like other Bitcoin data in Base58, by first adding 32 checksum bits
            // (derived from the double SHA-256 checksum), and then converting to the Base58 representation.
            if (hex.length == (78 * 2)) {
                let checksum = hash256(hex).substring(0, 8);
                format = base58enc(hex + checksum);
            }
            // This results in a Base58-encoded string of up to 112 characters. Because of the choice of the version bytes,
            // the Base58 representation will start with "xprv" or "xpub" on mainnet, "tprv" or "tpub" on testnet.

            // Note that the fingerprint of the parent only serves as a fast way to detect parent and child nodes in software,
            // and software must be willing to deal with collisions. Internally, the full 160-bit identifier could be used.

            // When importing a serialized extended public key, implementations must verify whether the X coordinate
            // in the public key data corresponds to a point on the curve.
            // If not, the extended public key is invalid.
            return format;
        }

        this.derive = function (path, seed) {
            let format = null;
            if (path.match(/^m(\/[0-9]+[H']?)*$/)) {
                let items = path.split("/");
                let m = this.generate(seed);
                let prvkey = m.key;
                let chain = m.chain;
                let pubkey = this.N(prvkey, chain).K;
                let fingerprint = "00000000";
                let childNumber = 0;
                for (let i = 1; i < items.length; i++) {
                    let item = items[i];
                    if (item.charAt(item.length - 1) == 'H' || item.charAt(item.length - 1) == '\'') {
                        childNumber = parseInt(item.substring(0, item.length - 1));
                        childNumber += 0x80000000;
                    } else {
                        childNumber = parseInt(item);
                    }
                    if (i == items.length - 1) {
                        fingerprint = hash160(pubkey).substring(0, 8);
                    }
                    let key = this.CKDpriv(prvkey, chain, childNumber);
                    prvkey = key.ki;
                    if (childNumber >= HARDENED) {
                        pubkey = this.N(prvkey, key.ci).K;
                    } else {
                        pubkey = this.CKDpub(pubkey, chain, childNumber).ki;
                    }
                    chain = key.ci;
                }
                format = {
                    prv: prvkey,
                    pub: pubkey,
                    chain: chain,
                    xprv: this.format(privateversion, items.length - 1, fingerprint, childNumber, chain, prvkey),
                    xpub: this.format(publicversion, items.length - 1, fingerprint, childNumber, chain, pubkey),
                };
            }
            return format;
        }
    }
    return HDW;
})();
