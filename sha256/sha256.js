
const H0 = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

function padding(msg) {
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
    let bits = len * 8;
    let size = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    size[4] = (bits & 0xff000000) >> 24;
    size[5] = (bits & 0x00ff0000) >> 16;
    size[6] = (bits & 0x0000ff00) >> 8;
    size[7] = (bits & 0x000000ff);
    bs = bs.concat(size);
    return bs;
}

function ROTR(x, n) {
    return (x >>> n) | (x << (32 - n));
}

function SHR(x, n) {
    return x >>> n;
}

function Ch(x, y, z) {
    return (x & y) ^ (~x & z);
}

function Maj(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
}

function SIGMA0(x) {
    return ROTR(x, 2) ^ ROTR(x, 13) ^ ROTR(x, 22);
}

function SIGMA1(x) {
    return ROTR(x, 6) ^ ROTR(x, 11) ^ ROTR(x, 25);
}

function sigma0(x) {
    return ROTR(x, 7) ^ ROTR(x, 18) ^ SHR(x, 3);
}

function sigma1(x) {
    return ROTR(x, 17) ^ ROTR(x, 19) ^ SHR(x, 10);
}

function compute(msg) {
    let N = msg.length / 64;
    let W = [];
    let H = [];
    for (let i = 0; i < H0.length; i++) {
        H[i] = H0[i];
    }
    for (let i = 1; i <= N; i++) {
        for (let t = 0; t < 64; t++) {
            if (t < 16) {
                let p = (i - 1) * 64 + t * 4;
                W[t] = (msg[p] << 24) + (msg[p + 1] << 16) + (msg[p + 2] << 8) + msg[p + 3];
            } else {
                W[t] = (sigma1(W[t - 2]) + W[t - 7] + sigma0(W[t - 15]) + W[t - 16]) & 0xffffffff;
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
        for (let t = 0; t < 64; t++) {
            let T1 = (h + SIGMA1(e) + Ch(e, f, g) + K[t] + W[t]) & 0xffffffff;
            let T2 = (SIGMA0(a) + Maj(a, b, c)) & 0xffffffff;
            h = g;
            g = f;
            f = e;
            e = (d + T1) & 0xffffffff;
            d = c;
            c = b;
            b = a;
            a = (T1 + T2) & 0xffffffff;
        }
        H[0] = (a + H[0]) & 0xffffffff;
        H[1] = (b + H[1]) & 0xffffffff;
        H[2] = (c + H[2]) & 0xffffffff;
        H[3] = (d + H[3]) & 0xffffffff;
        H[4] = (e + H[4]) & 0xffffffff;
        H[5] = (f + H[5]) & 0xffffffff;
        H[6] = (g + H[6]) & 0xffffffff;
        H[7] = (h + H[7]) & 0xffffffff;
    }
    return H;
}

function hash2str(hash) {
    let bs = Array(hash.length * 4);
    for (let i = 0; i < hash.length; i++) {
        bs[i * 4] = (hash[i] & 0xff000000) >>> 24;
        bs[i * 4 + 1] = (hash[i] & 0x00ff0000) >>> 16;
        bs[i * 4 + 2] = (hash[i] & 0x0000ff00) >>> 8;
        bs[i * 4 + 3] = (hash[i] & 0x000000ff);
    }
    return bs2str(bs);
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