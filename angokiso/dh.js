
const g = 2n;

const pn = [97n, 997n, 9973n, 99991n];

function init() {
    let ps = document.getElementById('p');
    ps.innerHTML = '';
    for (let n of pn) {
        let op = document.createElement('option');
        op.value = n;
        op.innerText = n.toString();
        ps.appendChild(op);
    }
    ps.value = pn[pn.length - 2];
    document.getElementById('g').innerText = g.toString(10);
    document.getElementById('p').addEventListener('change', clear);
    document.getElementById('a').addEventListener('change', setA);
    document.getElementById('B').addEventListener('change', setB);
    document.getElementById('gen').addEventListener('click', gen);
}

function clear() {
    document.getElementById('a').value = null;
    document.getElementById('ga').innerText = '';
    document.getElementById('B').value = null;
    document.getElementById('K').innerText = '';
}

function gen() {
    let array = new Uint32Array(1);
    crypto.getRandomValues(array);
    let p = BigInt(document.getElementById('p').value);
    document.getElementById('a').value = BigInt(array[0]) % p;
    setA();
}

function setA() {
    let p = BigInt(document.getElementById('p').value);
    let a = BigInt(document.getElementById('a').value);
    let ga = document.getElementById('ga');
    ga.innerText = '';
    console.log(p);
    console.log(a);
    if (a) {
        ga.innerText = (g ** a) % p;
    }
    setB();
}

function setB() {
    let p = BigInt(document.getElementById('p').value);
    let a = BigInt(document.getElementById('a').value);
    let B = BigInt(document.getElementById('B').value);
    let K = document.getElementById('K');
    K.innerText = '';
    if (a && B) {
        K.innerText = (B ** a) % p;
    }
}

window.addEventListener('load', init);