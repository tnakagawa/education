const ALPHABET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHABET_LOWER = 'abcdefghijklmnopqrstuvwxyz';

/**
 * 初期化
 */
function init() {
    let n = document.getElementById('n');
    for (let i = 1; i < ALPHABET_UPPER.length; i++) {
        let e = document.createElement('option');
        e.setAttribute('value', i);
        e.innerText = i.toString();
        n.appendChild(e);
    }
    document.getElementById('n').value = 3;
    document.getElementById('enc').addEventListener('click', encode);
    document.getElementById('dec').addEventListener('click', decode);
    document.getElementById('clsm').addEventListener('click', clsm);
    document.getElementById('clsc').addEventListener('click', clsc);
}

/**
 * エンコード
 */
function encode() {
    let m = document.getElementById('m').value;
    let n = parseInt(document.getElementById('n').value);
    let c = rot(n, m, ALPHABET_UPPER);
    c = rot(n, c, ALPHABET_LOWER);
    document.getElementById('c').value = c;
}

/**
 * デコード
 */
function decode() {
    let c = document.getElementById('c').value;
    let n = parseInt(document.getElementById('n').value);
    let m = rot(-n, c, ALPHABET_UPPER);
    m = rot(-n, m, ALPHABET_LOWER);
    document.getElementById('m').value = m;
}

/**
 * メッセージ部分クリア
 */
function clsm() {
    document.getElementById('m').value = '';
}

/**
 * 暗号文部分クリア
 */
function clsc() {
    document.getElementById('c').value = '';
}

/**
 * ROTn
 * @param {Number} n シフト数
 * @param {String} str 対称文字列
 * @param {String} base シフト文字列
 * @returns シフト後文字列
 */
function rot(n, str, base) {
    // 返り値初期化
    let ret = '';
    // n が負の値であった場合の対応
    let t = n;
    while (t < 0) {
        t += base.length;
    }
    // 文字分ループ
    for (let c of str) {
        // 変換対象の文字であるか判定
        let p = base.indexOf(c);
        if (p >= 0) {
            // 文字をシフトして返り値に設定
            ret += base[(p + n) % base.length];
        } else {
            // 変換対象ではないのでそのまま設定
            ret += c;
        }
    }
    return ret;
}

/**
 * 画面ロード処理設定
 */
window.addEventListener('load', init);