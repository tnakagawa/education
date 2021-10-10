
// キャンパスサイズ
const SIZE = 1024;
// プロット数
const PLOT_NUM = 10000;

// プロット総数
var total = 0;
// 円内プロット数
var inCircle = 0;

function init() {
    // キャンバス
    let c = document.getElementById('c');
    // キャンパスサイズ設定
    c.width = SIZE;
    c.height = SIZE;
    c.style.height = SIZE;
    c.style.width = SIZE;
    // クリックイベント追加
    document.getElementById('btn').addEventListener('click', add);
}

// プロット追加
function add() {
    for (let i = 0; i < PLOT_NUM; i++) {
        plot();
    }
    document.getElementById('total').innerText = total.toLocaleString();
    document.getElementById('in_circle').innerText = inCircle.toLocaleString();
    let pi = (4 * inCircle) / total;
    document.getElementById('pi').innerText = pi.toFixed(5);
}

// プロット
function plot() {
    // 乱数生成
    let xy = new Uint32Array(2);
    window.crypto.getRandomValues(xy);
    let x = xy[0] % SIZE;
    let y = xy[1] % SIZE;
    let color = 'red';
    // 円内であるか判定
    if (x * x + y * y < SIZE * SIZE) {
        color = 'blue';
        inCircle++;
    }
    total++;
    // 描写
    draw(x, y, color);
}

// 描写
function draw(x, y, color) {
    // キャンバス
    let c = document.getElementById('c');
    let ctx = c.getContext('2d');
    // 色を設定
    ctx.fillStyle = color;
    // 矩形を描写
    ctx.fillRect(x, y, 1, 1);
}

window.addEventListener('load', init);