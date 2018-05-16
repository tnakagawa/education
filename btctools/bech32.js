/**
 * BIP: 173
 * Title: Base32 address format for native v0-16 witness outputs
 * 
 * https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
 * https://github.com/sipa/bech32
 */

var Bech32 = (function () {

    const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

    const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

    function polymod(values) {
        var chk = 1;
        for (var p = 0; p < values.length; ++p) {
            var top = chk >> 25;
            chk = (chk & 0x1ffffff) << 5 ^ values[p];
            for (var i = 0; i < 5; ++i) {
                if ((top >> i) & 1) {
                    chk ^= GENERATOR[i];
                }
            }
        }
        return chk;
    }

    function hrpExpand(hrp) {
        var ret = [];
        var p;
        for (p = 0; p < hrp.length; ++p) {
            ret.push(hrp.charCodeAt(p) >> 5);
        }
        ret.push(0);
        for (p = 0; p < hrp.length; ++p) {
            ret.push(hrp.charCodeAt(p) & 31);
        }
        return ret;
    }

    function verifyChecksum(hrp, data) {
        return polymod(hrpExpand(hrp).concat(data)) === 1;
    }

    function createChecksum(hrp, data) {
        var values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
        var mod = polymod(values) ^ 1;
        var ret = [];
        for (var p = 0; p < 6; ++p) {
            ret.push((mod >> 5 * (5 - p)) & 31);
        }
        return ret;
    }

    function encode_(hrp, data) {
        var combined = data.concat(createChecksum(hrp, data));
        var ret = hrp + '1';
        for (var p = 0; p < combined.length; ++p) {
            ret += CHARSET.charAt(combined[p]);
        }
        return ret;
    }

    function decode_(bechString) {
        var p;
        var has_lower = false;
        var has_upper = false;
        for (p = 0; p < bechString.length; ++p) {
            if (bechString.charCodeAt(p) < 33 || bechString.charCodeAt(p) > 126) {
                return null;
            }
            if (bechString.charCodeAt(p) >= 97 && bechString.charCodeAt(p) <= 122) {
                has_lower = true;
            }
            if (bechString.charCodeAt(p) >= 65 && bechString.charCodeAt(p) <= 90) {
                has_upper = true;
            }
        }
        if (has_lower && has_upper) {
            return null;
        }
        bechString = bechString.toLowerCase();
        var pos = bechString.lastIndexOf('1');
        if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90) {
            return null;
        }
        var hrp = bechString.substring(0, pos);
        var data = [];
        for (p = pos + 1; p < bechString.length; ++p) {
            var d = CHARSET.indexOf(bechString.charAt(p));
            if (d === -1) {
                return null;
            }
            data.push(d);
        }
        if (!verifyChecksum(hrp, data)) {
            return null;
        }
        return { hrp: hrp, data: data.slice(0, data.length - 6) };
    }

    function convertbits(data, frombits, tobits, pad) {
        var acc = 0;
        var bits = 0;
        var ret = [];
        var maxv = (1 << tobits) - 1;
        for (var p = 0; p < data.length; ++p) {
            var value = data[p];
            if (value < 0 || (value >> frombits) !== 0) {
                return null;
            }
            acc = (acc << frombits) | value;
            bits += frombits;
            while (bits >= tobits) {
                bits -= tobits;
                ret.push((acc >> bits) & maxv);
            }
        }
        if (pad) {
            if (bits > 0) {
                ret.push((acc << (tobits - bits)) & maxv);
            }
        } else if (bits >= frombits || ((acc << (tobits - bits)) & maxv)) {
            return null;
        }
        return ret;
    }

    function toHex(bs) {
        let hex = "";
        for (let i = 0; i < bs.length; i++) {
            let b = bs[i];
            if (b > 0x0f) {
                hex += b.toString(16);
            } else {
                hex += "0" + b.toString(16);
            }
        }
        return hex;
    }

    function toBs(hex) {
        let bs = null;
        if (hex != null && hex.length > 0) {
            let tmp = hex.replace(/\s+/g, "");
            if (tmp.match(/^[0-9a-fA-F]+$/g) && tmp.length % 2 == 0) {
                bs = [];
                for (let i = 0; i < hex.length; i += 2) {
                    bs.push(parseInt(hex.substring(i, i + 2), 16));
                }
            }
        }
        return bs;
    }


    function Bech32() {
        this.decode = function (hrp, addr) {
            var dec = decode_(addr);
            if (dec === null || dec.hrp !== hrp || dec.data.length < 1 || dec.data[0] > 16) {
                return null;
            }
            var res = convertbits(dec.data.slice(1), 5, 8, false);
            if (res === null || res.length < 2 || res.length > 40) {
                return null;
            }
            if (dec.data[0] === 0 && res.length !== 20 && res.length !== 32) {
                return null;
            }
            return { version: dec.data[0], program: res, hex: toHex(res) };
        }

        this.encode = function (hrp, version, hex) {
            var program = toBs(hex);
            var ret = encode_(hrp, [version].concat(convertbits(program, 8, 5, true)));
            if (this.decode(hrp, ret) === null) {
                return null;
            }
            return ret;
        }
    }

    return Bech32;
})();