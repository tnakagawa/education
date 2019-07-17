"use strict";

class BLAKE2s {
    constructor(nn, key) {
        if (nn < 1 || 32 < nn) {
            throw new Error("blake2s: invalid hash size");
        }
        let kk = key.length;                       // ①
        if (32 < kk) {
            throw new Error("blake2s: invalid key size");
        }
        this.nn = nn;                              // ②
        this.ll = [0, 0];                          // ③
        this.IV = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
            0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
        ];                                         // ④
        this.SIGMA = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
            [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
            [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
            [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
            [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
            [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
            [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
            [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
            [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
        ];                                         // ⑤
        this.h = this.IV.concat();                 // ⑥
        // Parameter block p[0]
        this.h[0] ^= 0x01010000 ^ (kk << 8) ^ nn;  // ⑦
        this.cash = [];
        if (kk > 0) {
            this.cash = key.concat();              // ⑧
            while (this.cash.length < 64) {        // ⑨
                this.cash.push(0);
            }
        }
    }
    g(v, a, b, c, d, x, y) {
        v[a] = (v[a] + v[b] + x) >>> 0;
        v[d] = ((v[d] ^ v[a]) >>> 16) | ((v[d] ^ v[a]) << 16);
        v[c] = (v[c] + v[d]) >>> 0;
        v[b] = ((v[b] ^ v[c]) >>> 12) | ((v[b] ^ v[c]) << 20);
        v[a] = (v[a] + v[b] + y) >>> 0;
        v[d] = ((v[d] ^ v[a]) >>> 8) | ((v[d] ^ v[a]) << 24);
        v[c] = (v[c] + v[d]) >>> 0;
        v[b] = ((v[b] ^ v[c]) >>> 7) | ((v[b] ^ v[c]) << 25);
    }
    f(m, f) {
        let v = this.h.concat(this.IV);                // ①
        v[12] ^= this.ll[0];                           // ②
        v[13] ^= this.ll[1];                           // ②'
        if (f) {
            v[14] ^= 0xffffffff;                       // ③
        }
        for (let i = 0; i < 10; i++) {                 // ④
            let s = this.SIGMA[i % 10];
            this.g(v, 0, 4, 8, 12, m[s[0]], m[s[1]]);
            this.g(v, 1, 5, 9, 13, m[s[2]], m[s[3]]);
            this.g(v, 2, 6, 10, 14, m[s[4]], m[s[5]]);
            this.g(v, 3, 7, 11, 15, m[s[6]], m[s[7]]);
            this.g(v, 0, 5, 10, 15, m[s[8]], m[s[9]]);
            this.g(v, 1, 6, 11, 12, m[s[10]], m[s[11]]);
            this.g(v, 2, 7, 8, 13, m[s[12]], m[s[13]]);
            this.g(v, 3, 4, 9, 14, m[s[14]], m[s[15]]);
        }
        for (let i = 0; i < 8; i++) {
            this.h[i] ^= v[i] ^ v[i + 8];              // ⑤
        }
    }
    update(bs) {
        for (let i = 0; i < bs.length; i++) {          // ①
            if (this.cash.length == 64) {              // ②
                this.ll[0] += 64;                      // ③
                if (this.ll[0] > 0xffffffff) {
                    this.ll[1] += 1;
                    this.ll[0] >>>= 0;
                }
                let m = [0, 0, 0, 0, 0, 0, 0, 0,       // ④
                    0, 0, 0, 0, 0, 0, 0, 0];
                for (let i = 0; i < m.length; i++) {
                    m[i] = this.cash[i * 4 + 3] << 24 |
                        this.cash[i * 4 + 2] << 16 |
                        this.cash[i * 4 + 1] << 8 |
                        this.cash[i * 4];
                }
                this.f(m, false);                      // ⑤
                this.cash = [];                        // ⑥
            }
            this.cash.push(bs[i]);                     // ⑦
        }
    }
    final() {
        let size = this.cash.length;                   // ①
        this.ll[0] += size;
        if (this.ll[0] > 0xffffffff) {
            this.ll[1] += 1;
            this.ll[0] >>>= 0;
        }
        while (this.cash.length < 64) {                // ②
            this.cash.push(0);
        }
        let m = [0, 0, 0, 0, 0, 0, 0, 0,               // ③
            0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < m.length; i++) {
            m[i] = this.cash[i * 4 + 3] << 24 |
                this.cash[i * 4 + 2] << 16 |
                this.cash[i * 4 + 1] << 8 |
                this.cash[i * 4];
        }
        this.f(m, true);                              // ④
        let out = [0, 0, 0, 0, 0, 0, 0, 0,            // ⑤
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < this.h.length; i++) {
            out[i * 4 + 3] = this.h[i] >>> 24 & 0xff;
            out[i * 4 + 2] = this.h[i] >>> 16 & 0xff;
            out[i * 4 + 1] = this.h[i] >>> 8 & 0xff;
            out[i * 4 + 0] = this.h[i] & 0xff;
            if ((i * 4) > this.nn) {
                break;
            }
        }
        return out.slice(0, this.nn);                 // ⑥
    }
    static blake2s(nn, key, in_) {
        let b2s = new BLAKE2s(nn, key);
        b2s.update(in_);
        return b2s.final();
    }
}