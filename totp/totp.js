"use strict";

/**
 * HOTP(An HMAC-Based One-Time Password Algorithm)
 * 
 * @param {string} K shared secret
 * @param {number} C 8-byte counter value
 * @param {*} A Hash algorithm(SHA-1,SHA-256,SHA-512)
 * @param {*} Digit number of digits in an HOTP value
 * @returns HOTP values
 */
function HOTP(K, C, A, Digit) {
    // https://www.rfc-editor.org/rfc/rfc4226#section-5.3
    // Step 1: Generate an HMAC-SHA-1 value Let HS = HMAC-SHA-1(K,C)
    // HS is a 20-byte string
    let hmac = new jsSHA(A, "HEX", {
        hmacKey: { value: K, format: "TEXT" },
    });
    let hexC = C.toString(16);
    while (hexC.length < 16) {
        hexC = '0' + hexC;
    }
    hmac.update(hexC);
    let HS = hmac.getHash("HEX");
    // Step 2: Generate a 4-byte string (Dynamic Truncation)   Let Sbits = DT(HS)
    // DT, defined below, returns a 31-bit string
    let Offset = parseInt(HS.substring(HS.length - 1), 16);
    let P = HS.substring(Offset * 2, (Offset + 4) * 2);
    let Snum = parseInt(P, 16) & 0x7fffffff;
    // Step 3: Compute an HOTP value 
    // Let Snum  = StToNum(Sbits) 
    // Convert S to a number in 0...2^{31}-1
    // Return D = Snum mod 10^Digit 
    // D is a number in the range 0...10^{Digit}-1
    let D = (Snum % (Math.pow(10, Digit))).toString(10);
    while (D.length < Digit) {
        D = "0" + D;
    }
    return D;
}

/**
 * TOTP(Time-Based One-Time Password Algorithm)
 * 
 * @param {string} K shared secret
 * @param {number} C 8-byte counter value
 * @param {*} A Hash algorithm(SHA-1,SHA-256,SHA-512)
 * @param {*} Digit number of digits in an HOTP value
 * @returns TOTP values
 */
function TOTP(K, C, A, Digit) {
    // https://www.rfc-editor.org/rfc/rfc6238#section-4.2
    // More specifically, T = (Current Unix time - T0) / X, where the
    // default floor function is used in the computation.
    let T0 = 0;
    let X = 30;
    let T = Math.floor((C - T0) / X);
    return HOTP(K, T, A, Digit);
}

/**
 * Create TOTP URI
 * 
 * @param {string} issuer Issuer
 * @param {string} account Accoount
 * @param {string} secret  Share Secret
 * @returns TOTP URI
 */
function createTotpUri(issuer, account, secret) {
    const params = {
        secret: base32Encode(secret, true),
        issuer: issuer,
    };
    let p = new URLSearchParams(params).toString();
    let uri = "otpauth://totp/" + encodeURI(issuer) + ":" + encodeURI(account)
        + "?" + new URLSearchParams(params).toString();
    return uri;
}

/**
 * base32Encode
 * 
 * @param {string} text Target text
 * @param {boolean} nopad No padding flg
 * @returns BASE32
 */
function base32Encode(text, nopad) {
    const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let encoder = new TextEncoder();
    let bs = encoder.encode(text);
    let bits = "";
    for (let b of bs) {
        let binary = b.toString(2);
        if (binary.length < 8) {
            binary = "0".repeat(8 - binary.length) + binary;
        }
        bits += binary;
    }
    let encoded = "";
    for (let i = 0; i < bits.length; i += 5) {
        let chunk = bits.substring(i, i + 5);
        if (chunk.length < 5) {
            chunk += "0".repeat(5 - chunk.length);
        }
        let index = parseInt(chunk, 2);
        encoded += base32Chars[index];
    }
    let pad = 0;
    if (!nopad) {
        pad = Math.ceil(((bs.length % 5) * 8) / 5);
        if (pad != 0) {
            pad = 8 - pad;
        }
    }
    return encoded + "=".repeat(pad);
}


// https://www.rfc-editor.org/rfc/rfc6238#appendix-B
function testTOTP() {
    const TEST_VECTORS = [
        {
            Time: 59,
            TOTP: "94287082",
            Mode: "SHA-1",
            Secret: "12345678901234567890",
        },
        {
            Time: 59,
            TOTP: "46119246",
            Mode: "SHA-256",
            Secret: "12345678901234567890123456789012",
        },
        {
            Time: 59,
            TOTP: "90693936",
            Mode: "SHA-512",
            Secret: "1234567890123456789012345678901234567890123456789012345678901234",
        },
        {
            Time: 1111111109,
            TOTP: "07081804",
            Mode: "SHA-1",
            Secret: "12345678901234567890",
        },
        {
            Time: 1111111109,
            TOTP: "68084774",
            Mode: "SHA-256",
            Secret: "12345678901234567890123456789012",
        },
        {
            Time: 1111111109,
            TOTP: "25091201",
            Mode: "SHA-512",
            Secret: "1234567890123456789012345678901234567890123456789012345678901234",
        },
        {
            Time: 1111111111,
            TOTP: "14050471",
            Mode: "SHA-1",
            Secret: "12345678901234567890",
        },
        {
            Time: 1111111111,
            TOTP: "67062674",
            Mode: "SHA-256",
            Secret: "12345678901234567890123456789012",
        },
        {
            Time: 1111111111,
            TOTP: "99943326",
            Mode: "SHA-512",
            Secret: "1234567890123456789012345678901234567890123456789012345678901234",
        },
        {
            Time: 1234567890,
            TOTP: "89005924",
            Mode: "SHA-1",
            Secret: "12345678901234567890",
        },
        {
            Time: 1234567890,
            TOTP: "91819424",
            Mode: "SHA-256",
            Secret: "12345678901234567890123456789012",
        },
        {
            Time: 1234567890,
            TOTP: "93441116",
            Mode: "SHA-512",
            Secret: "1234567890123456789012345678901234567890123456789012345678901234",
        },
        {
            Time: 2000000000,
            TOTP: "69279037",
            Mode: "SHA-1",
            Secret: "12345678901234567890",
        },
        {
            Time: 2000000000,
            TOTP: "90698825",
            Mode: "SHA-256",
            Secret: "12345678901234567890123456789012",
        },
        {
            Time: 2000000000,
            TOTP: "38618901",
            Mode: "SHA-512",
            Secret: "1234567890123456789012345678901234567890123456789012345678901234",
        },
        {
            Time: 20000000000,
            TOTP: "65353130",
            Mode: "SHA-1",
            Secret: "12345678901234567890",
        },
        {
            Time: 20000000000,
            TOTP: "77737706",
            Mode: "SHA-256",
            Secret: "12345678901234567890123456789012",
        },
        {
            Time: 20000000000,
            TOTP: "47863826",
            Mode: "SHA-512",
            Secret: "1234567890123456789012345678901234567890123456789012345678901234",
        },
    ];
    let result = true;
    for (let test of TEST_VECTORS) {
        let totp = TOTP(test.Secret, test.Time, test.Mode, 8);
        console.log(test.Time, test.Mode, test.TOTP, test.TOTP == totp);
        if (test.TOTP != totp) {
            result = false;
        }
    }
    return false;
}

// https://www.rfc-editor.org/rfc/rfc4648#section-10
function testBase32() {
    const TEST_VECTORS = [
        {
            text: "",
            base32: "",
        },
        {
            text: "f",
            base32: "MY======",
        },
        {
            text: "fo",
            base32: "MZXQ====",
        },
        {
            text: "foo",
            base32: "MZXW6===",
        },
        {
            text: "foob",
            base32: "MZXW6YQ=",
        },
        {
            text: "fooba",
            base32: "MZXW6YTB",
        },
        {
            text: "foobar",
            base32: "MZXW6YTBOI======",
        },
    ];
    let result = true;
    for (let test of TEST_VECTORS) {
        let base32 = base32Encode(test.text);
        console.log(test.text, test.base32, base32, base32 == test.base32);
        if (base32 != test.base32) {
            result = false;
        }
    }
    return result;
}

