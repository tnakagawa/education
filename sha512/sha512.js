
const MASK = BigInt("0xffffffffffffffff");

const H512 = ["0x6a09e667f3bcc908", "0xbb67ae8584caa73b", "0x3c6ef372fe94f82b", "0xa54ff53a5f1d36f1",
    "0x510e527fade682d1", "0x9b05688c2b3e6c1f", "0x1f83d9abfb41bd6b", "0x5be0cd19137e2179",]

const K512 = ["0x428a2f98d728ae22", "0x7137449123ef65cd", "0xb5c0fbcfec4d3b2f", "0xe9b5dba58189dbbc",
    "0x3956c25bf348b538", "0x59f111f1b605d019", "0x923f82a4af194f9b", "0xab1c5ed5da6d8118",
    "0xd807aa98a3030242", "0x12835b0145706fbe", "0x243185be4ee4b28c", "0x550c7dc3d5ffb4e2",
    "0x72be5d74f27b896f", "0x80deb1fe3b1696b1", "0x9bdc06a725c71235", "0xc19bf174cf692694",
    "0xe49b69c19ef14ad2", "0xefbe4786384f25e3", "0x0fc19dc68b8cd5b5", "0x240ca1cc77ac9c65",
    "0x2de92c6f592b0275", "0x4a7484aa6ea6e483", "0x5cb0a9dcbd41fbd4", "0x76f988da831153b5",
    "0x983e5152ee66dfab", "0xa831c66d2db43210", "0xb00327c898fb213f", "0xbf597fc7beef0ee4",
    "0xc6e00bf33da88fc2", "0xd5a79147930aa725", "0x06ca6351e003826f", "0x142929670a0e6e70",
    "0x27b70a8546d22ffc", "0x2e1b21385c26c926", "0x4d2c6dfc5ac42aed", "0x53380d139d95b3df",
    "0x650a73548baf63de", "0x766a0abb3c77b2a8", "0x81c2c92e47edaee6", "0x92722c851482353b",
    "0xa2bfe8a14cf10364", "0xa81a664bbc423001", "0xc24b8b70d0f89791", "0xc76c51a30654be30",
    "0xd192e819d6ef5218", "0xd69906245565a910", "0xf40e35855771202a", "0x106aa07032bbd1b8",
    "0x19a4c116b8d2d0c8", "0x1e376c085141ab53", "0x2748774cdf8eeb99", "0x34b0bcb5e19b48a8",
    "0x391c0cb3c5c95a63", "0x4ed8aa4ae3418acb", "0x5b9cca4f7763e373", "0x682e6ff3d6b2b8a3",
    "0x748f82ee5defb2fc", "0x78a5636f43172f60", "0x84c87814a1f0ab72", "0x8cc702081a6439ec",
    "0x90befffa23631e28", "0xa4506cebde82bde9", "0xbef9a3f7b2c67915", "0xc67178f2e372532b",
    "0xca273eceea26619c", "0xd186b8c721c0c207", "0xeada7dd6cde0eb1e", "0xf57d4f7fee6ed178",
    "0x06f067aa72176fba", "0x0a637dc5a2c898a6", "0x113f9804bef90dae", "0x1b710b35131c471b",
    "0x28db77f523047d84", "0x32caab7b40c72493", "0x3c9ebe0a15c9bebc", "0x431d67c49c100d4c",
    "0x4cc5d4becb3e42b6", "0x597f299cfc657e2a", "0x5fcb6fab3ad6faec", "0x6c44198c4a475817",];

function padding(msg) {
    let len = msg.length;
    let tmp = Array(128);
    tmp.fill(0);
    tmp[0] = 0x80;
    let bs = msg.concat();
    if (len % 128 < 112) {
        bs = bs.concat(tmp.slice(0, 112 - len % 128));
    } else {
        bs = bs.concat(tmp.slice(0, 128 + 112 - len % 128));
    }
    let bits = len * 8;
    let size = Array(16);
    size.fill(0);
    size[12] = (bits & 0xff000000) >> 24;
    size[13] = (bits & 0x00ff0000) >> 16;
    size[14] = (bits & 0x0000ff00) >> 8;
    size[15] = (bits & 0x000000ff);
    bs = bs.concat(size);
    return bs;
}

function ROTR(x, n) {
    return ((x >> n) | (x << (64n - n))) & MASK;
}

function SHR(x, n) {
    return x >> n;
}

function Ch(x, y, z) {
    return (x & y) ^ (~x & z);
}

function Maj(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
}

function SIGMA0(x) {
    return ROTR(x, 28n) ^ ROTR(x, 34n) ^ ROTR(x, 39n);
}

function SIGMA1(x) {
    return ROTR(x, 14n) ^ ROTR(x, 18n) ^ ROTR(x, 41n);
}

function sigma0(x) {
    return ROTR(x, 1n) ^ ROTR(x, 8n) ^ SHR(x, 7n);
}

function sigma1(x) {
    return ROTR(x, 19n) ^ ROTR(x, 61n) ^ SHR(x, 6n);
}

function compute(msg) {
    let N = msg.length / 128;
    let W = [];
    let H = [];
    for (let i = 0; i < H512.length; i++) {
        H[i] = BigInt(H512[i]);
    }
    for (let i = 1; i <= N; i++) {
        for (let t = 0; t < 80; t++) {
            if (t < 16) {
                let p = (i - 1) * 128 + t * 8;
                let w = "0x";
                for (let j = 0; j < 8; j++) {
                    if (msg[p + j] < 0x10) {
                        w += "0" + msg[p + j].toString(16);
                    } else {
                        w += msg[p + j].toString(16);
                    }
                }
                W[t] = BigInt(w);
            } else {
                W[t] = (sigma1(W[t - 2]) + W[t - 7] + sigma0(W[t - 15]) + W[t - 16]) & MASK;
            }
        }
        let a = H[0];
        let b = H[1];
        let c = H[2];
        let d = H[3];
        let e = H[4];
        let f = H[5];
        let g = H[6];
        let h = H[7];
        for (let t = 0; t < 80; t++) {
            let T1 = (h + SIGMA1(e) + Ch(e, f, g) + BigInt(K512[t]) + W[t]) & MASK;
            let T2 = (SIGMA0(a) + Maj(a, b, c)) & MASK;
            h = g;
            g = f;
            f = e;
            e = (d + T1) & MASK;
            d = c;
            c = b;
            b = a;
            a = (T1 + T2) & MASK;
        }
        H[0] = (a + H[0]) & MASK;
        H[1] = (b + H[1]) & MASK;
        H[2] = (c + H[2]) & MASK;
        H[3] = (d + H[3]) & MASK;
        H[4] = (e + H[4]) & MASK;
        H[5] = (f + H[5]) & MASK;
        H[6] = (g + H[6]) & MASK;
        H[7] = (h + H[7]) & MASK;
    }
    return H;
}

function hash2str(hash) {
    let h = "";
    for (let i = 0; i < hash.length; i++) {
        let t = hash[i].toString(16);
        while (t.length < 16) {
            t = "0" + t;
        }
        h += t;
    }
    return h;
}

function bs2str(bs) {
    let s = "";
    for (let i = 0; i < bs.length; i++) {
        if (bs[i] > 0xf) {
            s += bs[i].toString(16);
        } else {
            s += "0" + bs[i].toString(16);
        }
    }
    return s;
}