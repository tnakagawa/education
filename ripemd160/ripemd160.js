// nonlinear functions at bit level: exor, mux, -, mux, -
function f(j, x, y, z) {
    // f(j, x, y, z) = x ⊕ y ⊕ z             ( 0 ≤ j ≤ 15)
    if (0 <= j && j <= 15) {
        return x ^ y ^ z;
    }
    // f(j, x, y, z) = (x ∧ y) ∨ (¬x ∧ z)   (16 ≤ j ≤ 31)
    if (16 <= j && j <= 31) {
        return (x & y) | (~x & z);
    }
    // f(j, x, y, z) = (x ∨ ¬y) ⊕ z          (32 ≤ j ≤ 47)
    if (32 <= j && j <= 47) {
        return (x | ~y) ^ z;
    }
    // f(j, x, y, z) = (x ∧ z) ∨ (y ∧ ¬z)   (48 ≤ j ≤ 63)
    if (48 <= j && j <= 63) {
        return (x & z) | (y & ~z);
    }
    // f(j, x, y, z) = x ⊕ (y ∨ ¬z)          (64 ≤ j ≤ 79)
    if (64 <= j && j <= 79) {
        return x ^ (y | ~z);
    }
    throw new Error("out of range : " + j);
}

// added constants (hexadecimal)
function K(j) {
    // K(j) = 00000000x (0 ≤ j ≤ 15)
    if (0 <= j && j <= 15) {
        return 0x00000000;
    }
    // K(j) = 5A827999x (16 ≤ j ≤ 31)
    if (16 <= j && j <= 31) {
        return 0x5A827999;
    }
    // K(j) = 6ED9EBA1x (32 ≤ j ≤ 47)
    if (32 <= j && j <= 47) {
        return 0x6ED9EBA1;
    }
    // K(j) = 8F1BBCDCx (48 ≤ j ≤ 63)
    if (48 <= j && j <= 63) {
        return 0x8F1BBCDC;
    }
    // K(j) = A953FD4Ex (64 ≤ j ≤ 79)
    if (64 <= j && j <= 79) {
        return 0xA953FD4E;
    }
    throw new Error("out of range : " + j);
}

// added constants (hexadecimal)
function K_(j) {
    // K'(j) = 50A28BE6x (0 ≤ j ≤ 15)
    if (0 <= j && j <= 15) {
        return 0x50A28BE6;
    }
    // K'(j) = 5C4DD124x (16 ≤ j ≤ 31)
    if (16 <= j && j <= 31) {
        return 0x5C4DD124;
    }
    // K'(j) = 6D703EF3x (32 ≤ j ≤ 47)
    if (32 <= j && j <= 47) {
        return 0x6D703EF3;
    }
    // K'(j) = 7A6D76E9x (48 ≤ j ≤ 63)
    if (48 <= j && j <= 63) {
        return 0x7A6D76E9;
    }
    // K'(j) = 00000000x (64 ≤ j ≤ 79)
    if (64 <= j && j <= 79) {
        return 0x00000000;
    }
    throw new Error("out of range : " + j);
}

// selection of message word
var r = [
    // r(j) = j (0 ≤ j ≤ 15)
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    // r(16..31) = 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8
    7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
    // r(32..47) = 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12
    3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
    // r(48..63) = 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2
    1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
    // r(64..79) = 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
    4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13,
];

// selection of message word
var r_ = [
    // r'(0..15) = 5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12
    5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
    // r'(16..31) = 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2
    6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
    // r'(32..47) = 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13
    15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
    // r'(48..63) = 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14
    8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
    // r'(64..79) = 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
    12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11,
];

// amount for rotate left (rol)
var s = [
    // s(0..15)  = 11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8
    11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
    // s(16..31) = 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12
    7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
    // s(32..47) = 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5
    11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
    // s(48..63) = 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12
    11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
    // s(64..79) = 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
    9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6,
];

// amount for rotate left (rol)
var s_ = [
    // s'(0..15)  = 8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6
    8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
    // s'(16..31) = 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11
    9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
    // s'(32..47) = 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5
    9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
    // s'(48..63) = 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8
    15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
    // s'(64..79) = 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11    
    8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11,
];

// rol_s denotes cyclic left shift (rotate) over s positions. 
function rol(s, x) {
    return (x << s) | (x >>> (32 - s));
}

function padding(msg) {
    // https://tools.ietf.org/html/rfc1320
    // 3.1 Step 1. Append Padding Bits
    let len = msg.length;
    let tmp = Array(64);
    tmp.fill(0);
    tmp[0] = 0x80;
    let bs = msg.concat();
    if (len % 64 < 56) {
        bs = bs.concat(tmp.slice(0, 56 - len % 64));
    } else {
        bs = bs.concat(tmp.slice(0, 64 + 56 - len % 64));
    }
    // 3.2 Step 2. Append Length
    let bits = len * 8;
    let size = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    size[3] = (bits & 0xff000000) >> 24;
    size[2] = (bits & 0x00ff0000) >> 16;
    size[1] = (bits & 0x0000ff00) >> 8;
    size[0] = (bits & 0x000000ff);
    bs = bs.concat(size);
    return bs;
}

function compute(msg) {
    let t = msg.length / 64;
    // initial value (hexadecimal)
    // h0 = 67452301x; h1 = EFCDAB89x; h2 = 98BADCFEx; h3 = 10325476x; h4 = C3D2E1F0x;
    let h0 = 0x67452301;
    let h1 = 0xEFCDAB89;
    let h2 = 0x98BADCFE;
    let h3 = 0x10325476;
    let h4 = 0xC3D2E1F0;
    // RIPEMD-160: pseudo-code
    for (let i = 0; i < t; i++) {
        let X = [];
        for (let t = 0; t < 16; t++) {
            let p = i * 64 + t * 4;
            X[t] = msg[p] + (msg[p + 1] << 8) + (msg[p + 2] << 16) + (msg[p + 3] << 24);
        }
        // A := h0; B := h1; C := h2; D = h3; E = h4;
        let A = h0; let B = h1; let C = h2; let D = h3; let E = h4;
        // A' := h0; B' := h1; C' := h2; D' = h3; E' = h4;
        let A_ = h0; let B_ = h1; let C_ = h2; let D_ = h3; let E_ = h4;
        let T = 0;
        for (let j = 0; j < 80; j++) {
            // T := rol_s(j) (A 田 f(j, B, C, D) 田 Xi[r(j)] 田 K(j)) 田 E;
            T = ta(rol(s[j], ta(ta(ta(A, f(j, B, C, D)), X[r[j]]), K(j))), E);
            // A := E; E := D; D := rol_10(C); C := B; B := T;
            A = E; E = D; D = rol(10, C); C = B; B = T;
            // T := rol_s'(j) (A'  田 f(79 - j, B', C', D')  田 Xi[r'(j)] 田 K'(j)) 田 E';
            T = ta(rol(s_[j], ta(ta(ta(A_, f(79 - j, B_, C_, D_)), X[r_[j]]), K_(j))), E_);
            // A' := E'; E' := D'; D' := rol_10(C'); C' := B'; B' := T;
            A_ = E_; E_ = D_; D_ = rol(10, C_); C_ = B_; B_ = T;
        }
        // T := h1 田 C 田 D'; h1 := h2 田 D 田 E'; h2 := h3 田 E 田 A_;
        T = ta(ta(h1, C), D_); h1 = ta(ta(h2, D), E_); h2 = ta(ta(h3, E), A_);
        // h3 := h4 田 A 田 B'; h4 := h0 田 B 田 C_; h0 := T;
        h3 = ta(ta(h4, A), B_); h4 = ta(ta(h0, B), C_); h0 = T;
    }
    let hs = [h0, h1, h2, h3, h4];
    let bs = [];
    for (let i = 0; i < hs.length; i++) {
        let h = hs[i];
        bs[i * 4] = (h & 0x000000ff);
        bs[i * 4 + 1] = (h & 0x0000ff00) >>> 8;
        bs[i * 4 + 2] = (h & 0x00ff0000) >>> 16;
        bs[i * 4 + 3] = (h & 0xff000000) >>> 24;
    }
    return bs;
}

function ta(x, y) {
    return (x + y) & 0xffffffff;
}

function bs2hex(bs) {
    let hex = "";
    for (let i = 0; i < bs.length; i++) {
        if (bs[i] < 0x0f) {
            hex += "0" + bs[i].toString(16);
        } else {
            hex += bs[i].toString(16);
        }
    }
    return hex;
}