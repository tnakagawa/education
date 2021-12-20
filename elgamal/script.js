
var p = 0n;
var g = 0n;
var b = 0;
var x = 0n;
var h = 0n;
var m = 0n;
var r = 0n;
var c1 = 0n;
var c2 = 0n;

function init() {
    p = (2n ** 17n) - 1n;
    // p = 2n ** 89n - 1n;
    // p = 2n ** 127n - 1n;
    g = 3n;
    console.log(p.toString(16));
    console.log('a'.charCodeAt(0).toString(10));
    document.getElementById('p').innerText = '0x' + hex(p) + ' ( ' + p.toString(10) + ' )';
    document.getElementById('g').innerText = '0x' + hex(g) + ' ( ' + g.toString(10) + ' )';
    b = Math.floor(p.toString(16).length / 2);
    document.getElementById('gen').addEventListener('click', genKeys);
    document.getElementById('msg').addEventListener('change', str2bs);
    document.getElementById('enc').addEventListener('click', encode);
    document.getElementById('dec').addEventListener('click', decode);
}

function str2bs() {
    let msg = document.getElementById('msg').value;
    document.getElementById('thex').innerText = '';
    document.getElementById('msgerr').innerText = '';
    if (msg) {
        let encoded = new TextEncoder('utf-8').encode(msg);
        m = 0n;
        for (let a of encoded) {
            m <<= 8n;
            m += BigInt(a);
        }
        document.getElementById('thex').innerText = '0x' + hex(m);
        if (m > p) {
            document.getElementById('msgerr').innerText = '文字数が多すぎます！';
            m = 0n;
        }
    } else {
        m = 0n;
    }
}

function decode() {
    if (c1 && c2) {
        let m = (c2 * modpow(c1, p - 1n - x, p)) % p;
        let str = hex(m);
        let bs = new Uint8Array(str.length / 2);
        for (let i = 0; i < bs.length; i++) {
            bs[i] = parseInt(str.substring(i * 2, i * 2 + 2), 16);
        }
        let de = new TextDecoder('utf-8').decode(bs);
        document.getElementById('decdata').innerText = de;
        document.getElementById('dhex').innerText = '0x' + str;
    }
}

function encode() {
    let bs = new Uint8Array(b + 1);
    window.crypto.getRandomValues(bs);
    r = 0n;
    for (let b of bs) {
        r <<= 8n;
        r += BigInt(b);
    }
    r = r % p;
    document.getElementById('r').innerText = '0x' + hex(r);
    c1 = modpow(g, r, p);
    c2 = (m * modpow(h, r, p)) % p;
    document.getElementById('encdata').innerText = '( 0x' + hex(c1) + ' , 0x' + hex(c2) + ' )';
}

function genKeys() {
    let bs = new Uint8Array(b + 1);
    window.crypto.getRandomValues(bs);
    x = 0n;
    for (let b of bs) {
        x <<= 8n;
        x += BigInt(b);
    }
    x = x % p;
    h = modpow(g, x, p);
    document.getElementById('x').innerText = x.toString(10) + ' ( 0x' + x.toString(16) + ' )';
    document.getElementById('h').innerText = h.toString(10) + ' ( 0x' + h.toString(16) + ' )';
    document.getElementById('msg').disabled = false;
}


function modpow(g, x, p) {
    let r = 1n;
    let a = g;
    let n = x;
    while (n > 0n) {
        if (n & 1n) {
            r = (r * a) % p;
        }
        a = (a * a) % p;
        n >>= 1n;
    }
    return r;
}

function hex(bi) {
    let hex = bi.toString(16);
    if (hex.length % 2 == 1) {
        hex = '0' + hex;
    }
    return hex;
}


window.addEventListener('load', init);