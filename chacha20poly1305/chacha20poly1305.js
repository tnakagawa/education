"use strict";

function Qround(state, x, y, z, w) {
    let a = state[x]; let b = state[y]; let c = state[z]; let d = state[w];
    a = (a + b) & 0xffffffff; d = d ^ a; d = (d << 16) | (d >>> 16);
    c = (c + d) & 0xffffffff; b = b ^ c; b = (b << 12) | (b >>> 20);
    a = (a + b) & 0xffffffff; d = d ^ a; d = (d << 8) | (d >>> 24);
    c = (c + d) & 0xffffffff; b = b ^ c; b = (b << 7) | (b >>> 25);
    state[x] = a; state[y] = b; state[z] = c; state[w] = d;
}

function inner_block(state) {
    Qround(state, 0, 4, 8, 12);
    Qround(state, 1, 5, 9, 13);
    Qround(state, 2, 6, 10, 14);
    Qround(state, 3, 7, 11, 15);
    Qround(state, 0, 5, 10, 15);
    Qround(state, 1, 6, 11, 12);
    Qround(state, 2, 7, 8, 13);
    Qround(state, 3, 4, 9, 14);
}

function chacha20_block(key, counter, nonce) {
    // 初期化
    // 定数
    let state = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];
    // キー
    for (let i = 0; i < 8; i++) {
        state.push(key[i * 4] | (key[i * 4 + 1] << 8) |
            (key[i * 4 + 2] << 16) | (key[i * 4 + 3] << 24));
    }
    // ブロックカウント
    state.push(counter);
    // ナンス
    for (let i = 0; i < 3; i++) {
        state.push(nonce[i * 4] | (nonce[i * 4 + 1] << 8) |
            (nonce[i * 4 + 2] << 16) | (nonce[i * 4 + 3] << 24));
    }
    // 最後の加算用に状態コピー
    let ininitial_state = state.concat();
    // 20ラウンド
    for (let i = 0; i < 10; i++) {
        inner_block(state);
    }
    // 加算
    for (let i = 0; i < state.length; i++) {
        state[i] = (state[i] + ininitial_state[i]) & 0xffffffff;
    }
    // シリアル化
    let block = [];
    for (let i = 0; i < state.length; i++) {
        block.push(state[i] & 0x000000ff);
        block.push((state[i] & 0x0000ff00) >>> 8);
        block.push((state[i] & 0x00ff0000) >>> 16);
        block.push((state[i] & 0xff000000) >>> 24);
    }
    return block;
}

function chacha20_encrypt(key, counter, nonce, plaintext) {
    let encrypted_message = [];
    for (let j = 0; j < Math.floor(plaintext.length / 64); j++) {
        let key_stream = chacha20_block(key, counter + j, nonce);
        for (let k = 0; k < 64; k++) {
            encrypted_message.push(plaintext[j * 64 + k] ^ key_stream[k]);
        }
    }
    if (plaintext.length % 64 != 0) {
        let j = Math.floor(plaintext.length / 64);
        let key_stream = chacha20_block(key, counter + j, nonce);
        for (let k = 0; k < plaintext.length % 64; k++) {
            encrypted_message.push(plaintext[j * 64 + k] ^ key_stream[k]);
        }
    }
    return encrypted_message;
}

function poly1305_mac(msg, key) {
    let mac = [];
    let r = 0n;
    let s = 0n;
    for (let i = 0; i < 16; i++) {
        r += BigInt(key[i]) << BigInt(i * 8);
        s += BigInt(key[i + 16]) << BigInt(i * 8);
    }
    r = r & BigInt("0x0ffffffc0ffffffc0ffffffc0fffffff");
    let a = 0n;
    let p = (1n << 130n) - 5n;
    for (let i = 1; i <= Math.ceil(msg.length / 16); i++) {
        let n = 1n;
        let len = 16;
        if (i == Math.ceil(msg.length / 16)) {
            len = msg.length - (i - 1) * 16;
        }
        for (let j = (16 * (i - 1) + len - 1); j >= 16 * (i - 1); j--) {
            n <<= 8n;
            n += BigInt(msg[j]);
        }
        a += n;
        a = (r * a) % p;
    }
    a += s;
    for (let i = 0; i < 16; i++) {
        let tmp = a & 255n;
        mac.push(parseInt(tmp.toString(10)));
        a >>= 8n;
    }
    return mac;
}

function poly1305_key_gen(key, nonce) {
    let counter = 0;
    let block = chacha20_block(key, counter, nonce);
    return block.slice(0, 32);
}

function pad16(x) {
    let a = x.concat();
    while ((a.length % 16) != 0) {
        a.push(0);
    }
    return a;
}

function num_to_8_le_bytes(num) {
    let bs = [0, 0, 0, 0, 0, 0, 0, 0];
    let tmp = num;
    for (let i = 0; i < bs.length; i++) {
        bs[i] = tmp & 0xff;
        tmp >>= 8;
    }
    return bs;
}

function chacha20_aead_encrypt(key, nonce, plaintext, aad) {
    let otk = poly1305_key_gen(key, nonce);
    let ciphertext = chacha20_encrypt(key, 1, nonce, plaintext);
    let mac_data = pad16(aad);
    mac_data = mac_data.concat(pad16(ciphertext));
    mac_data = mac_data.concat(num_to_8_le_bytes(aad.length));
    mac_data = mac_data.concat(num_to_8_le_bytes(ciphertext.length));
    let tag = poly1305_mac(mac_data, otk);
    return ciphertext.concat(tag);
}

function chacha20_aead_decrypt(key, nonce, aad, enc) {
    let otk = poly1305_key_gen(key, nonce);
    let ciphertext = enc.slice(0, enc.length - 16);
    let tag = enc.slice(enc.length - 16);
    let mac_data = pad16(aad);
    mac_data = mac_data.concat(pad16(ciphertext));
    mac_data = mac_data.concat(num_to_8_le_bytes(aad.length));
    mac_data = mac_data.concat(num_to_8_le_bytes(ciphertext.length));
    let mac = poly1305_mac(mac_data, otk);
    for (let i = 0; i < mac.length; i++) {
        if (mac[i] != tag[i]) {
            throw error("unmatch tag");
        }
    }
    let plaintext = chacha20_encrypt(key, 1, nonce, ciphertext);
    return plaintext;
}
