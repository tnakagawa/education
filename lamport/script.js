
async function init() {
    document.getElementById('reload_btn').addEventListener('click', reload);
    document.getElementById('create_btn').addEventListener('click', createKeyPairs);
    document.getElementById('sign_btn').addEventListener('click', signMessage);
    document.getElementById('verify_btn').addEventListener('click', verifyMessage);
}

function reload() {
    location.reload();
}

var privateKeys = [];
var publicKeys = [];
var message = "";
var signatures = [];

async function createKeyPairs() {
    privateKeys.length = 0;
    publicKeys.length = 0;
    document.getElementById('private_keys').innerHTML = "";
    document.getElementById('public_keys').innerHTML = "";
    for (let i = 1; i <= 256; i++) {
        let trpri = document.createElement('tr');
        let trpub = document.createElement('tr');
        let tdpri = document.createElement('td');
        let tdpub = document.createElement('td');
        tdpri.innerText = '' + i;
        tdpub.innerText = '' + i;
        trpri.appendChild(tdpri);
        trpub.appendChild(tdpub)
        for (let j = 0; j < 2; j++) {
            let tdpri = document.createElement('td');
            let tdpub = document.createElement('td');
            tdpri.setAttribute('id', 'y_' + i + '_' + j);
            tdpub.setAttribute('id', 'z_' + i + '_' + j);
            let keyPair = await createKeyPair();
            privateKeys.push(keyPair.private);
            publicKeys.push(keyPair.public);
            tdpri.innerText = keyPair.private;
            tdpub.innerText = keyPair.public;
            trpri.appendChild(tdpri);
            trpub.appendChild(tdpub);
        }
        document.getElementById('private_keys').appendChild(trpri);
        document.getElementById('public_keys').appendChild(trpub);
    }
    document.getElementById('keys').style.display = 'block';
    document.getElementById('create_btn').style.display = 'none';
    document.getElementById('sign').style.display = 'block';
    toTail();
}

async function createKeyPair() {
    let private = new Uint8Array(32);
    window.crypto.getRandomValues(private);
    let public = await crypto.subtle.digest('SHA-256', private);
    let privateArray = Array.from(new Uint8Array(private));
    let privateHex = privateArray.map(b => b.toString(16).padStart(2, '0')).join('');
    let publicArray = Array.from(new Uint8Array(public));
    let publicHex = publicArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return { private: privateHex, public: publicHex };
}

async function signMessage() {
    signatures.length = 0;
    message = document.getElementById('targetMessage').value;
    if (message) {
        let msgUint8 = new TextEncoder().encode(message);
        let hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        let hashArray = Array.from(new Uint8Array(hashBuffer));
        let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        let hashBits = hashArray.map(b => b.toString(2).padStart(8, '0')).join('');
        document.getElementById('message').innerText = message;
        document.getElementById('hashHex').innerText = hashHex;
        document.getElementById('hashBits').innerText = hashBits;
        document.getElementById('signatures').innerHTML = "";
        for (let i = 0; i < hashBits.length; i++) {
            let bit = hashBits[i];
            let tr = document.createElement('tr');
            let tdi = document.createElement('td');
            let tds = document.createElement('td');
            tdi.innerText = '' + (i + 1);
            let signature = privateKeys[i * 2];
            if (bit != "0") {
                signature = privateKeys[i * 2 + 1];
            }
            tds.innerText = signature;
            signatures.push(signature);
            document.getElementById('y_' + (i + 1) + '_' + bit).style.backgroundColor = "lightblue";
            document.getElementById('z_' + (i + 1) + '_' + bit).style.backgroundColor = "lightblue";
            tr.appendChild(tdi);
            tr.appendChild(tds);
            document.getElementById('signatures').appendChild(tr);
        }
        document.getElementById('signBefore').style.display = "none";
        document.getElementById('signAfter').style.display = "block";
        document.getElementById('verify').style.display = "block";
        toTail();
    } else {
        alert('メッセージを入力してください。');
    }
}

async function verifyMessage() {
    let msgUint8 = new TextEncoder().encode(message);
    let hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    let hashArray = Array.from(new Uint8Array(hashBuffer));
    let hashBits = hashArray.map(b => b.toString(2).padStart(8, '0')).join('');
    document.getElementById('verifyResults').innerHTML = "";
    let flg = true;
    for (let i = 0; i < hashBits.length; i++) {
        let bit = hashBits[i];
        let signature = signatures[i];
        let sig = new Uint8Array(32);
        for (let j = 0; j < sig.length; j++) {
            sig[j] = parseInt(signature.substring(j * 2, j * 2 + 2), 16);
        }
        let hashBuffer = await crypto.subtle.digest('SHA-256', sig);
        let hashArray = Array.from(new Uint8Array(hashBuffer));
        let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        let public = publicKeys[i * 2];
        if (bit != "0") {
            public = publicKeys[i * 2 + 1];
        }
        let tr = document.createElement('tr');
        let tdi = document.createElement('td');
        tdi.innerText = '' + (i + 1);
        tr.appendChild(tdi);
        let tds = document.createElement('td');
        tds.innerText = hashHex;
        tr.appendChild(tds);
        let tdp = document.createElement('td');
        tdp.innerText = public;
        tr.appendChild(tdp);
        let tdm = document.createElement('td');
        tdm.innerText = '' + (hashHex == public);
        tr.appendChild(tdm);
        document.getElementById('verifyResults').appendChild(tr);
        if (hashHex != public) {
            flg = false;
        }
    }
    if (flg) {
        document.getElementById('result').innerText = "検証：OK";
    } else {
        document.getElementById('result').innerText = "検証：NG";
    }
    document.getElementById('verifyBefore').style.display = "none";
    document.getElementById('verifyAfter').style.display = "block";
    toTail();
}

function toTail() {
    let element = document.documentElement;
    let bottom = element.scrollHeight - element.clientHeight;
    window.scroll(0, bottom);
}

window.addEventListener('load', init);