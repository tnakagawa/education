
function init() {
    // document.getElementById("powtitle").addEventListener("click", clicktitle);
    // document.getElementById("dhtitle").addEventListener("click", clicktitle);
    document.getElementById("pownext").addEventListener("click", play);
    document.getElementById("powstart").addEventListener("click", powstart);
    document.getElementById("powstop").addEventListener("click", powstop);
    document.getElementById("dhpeq").addEventListener("click", dhpub);
    document.getElementById("dhseq").addEventListener("click", dhshare);
    toggle("powdetail");
    toggle("dhdetail");
}

function clicktitle(event) {
    let id = event.target.attributes["data-toggle"].value;
    toggle(id);
}

function toggle(id) {
    let detail = document.getElementById(id);
    if (id) {
        let disp = detail.style.display;
        if (disp == "none" || disp == "") {
            detail.style.display = "block";
        } else {
            detail.style.display = "none";
        }
    }
}
function play() {
    calcpow(false);
}

var powflg = true;

function powstart() {
    document.getElementById("pownext").style.display = "none";
    document.getElementById("powstart").style.display = "none";
    document.getElementById("powstop").style.display = "inline-block";
    powflg = true;
    pownext();
}

function powstop() {
    document.getElementById("pownext").style.display = "inline-block";
    document.getElementById("powstart").style.display = "inline-block";
    document.getElementById("powstop").style.display = "none";
    powflg = false;
}

function pownext() {
    if (powflg) {
        calcpow(true);
        setTimeout(pownext, 1);
    }
}

function calcpow(rnd) {
    let name = document.getElementById("powname").value;
    let num = new BigInteger(document.getElementById("pownum").value, 10);
    let msg = name + " " + num;
    let md = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "sjcl" });
    let sha256 = md.digestString(msg);
    console.log(msg, sha256);
    document.getElementById("powmsg").innerHTML = msg;
    document.getElementById("powhash").innerHTML = sha256;
    let min = document.getElementById("powminhash").innerHTML;
    if (min) {
        if (sha256 < min) {
            document.getElementById("powminmsg").innerHTML = "★：" + msg;
            document.getElementById("powminhash").innerHTML = sha256;
        }
    } else {
        document.getElementById("powminmsg").innerHTML = "★：" + msg;
        document.getElementById("powminhash").innerHTML = sha256;
    }
    if (rnd) {
        let seed = new Array(32);
        new SecureRandom().nextBytes(seed);
        let hex = "";
        for (let i = 0; i < seed.length; i++) {
            if (seed[i] < 0x10) {
                hex += "0";
            }
            hex += seed[i].toString(16);
        }
        document.getElementById("pownum").value = new BigInteger(hex, 16);
    }
}

function dhpub() {
    let val = new BigInteger(document.getElementById("dhpv").value, 10);
    let exp = new BigInteger(document.getElementById("dhpe").value, 10);
    let mod = new BigInteger(document.getElementById("dhpm").value, 10);
    if (val && exp && mod) {
        let ans = val.modPow(exp, mod);
        document.getElementById("dhpa").value = ans.toString(10);
        document.getElementById("dhse").value = exp.toString(10);
        document.getElementById("dhsm").value = mod.toString(10);
    }
}

function dhshare() {
    let val = new BigInteger(document.getElementById("dhsv").value, 10);
    let exp = new BigInteger(document.getElementById("dhse").value, 10);
    let mod = new BigInteger(document.getElementById("dhsm").value, 10);
    if (val && exp && mod) {
        let ans = val.modPow(exp, mod);
        document.getElementById("dhsa").value = ans.toString(10);
    }
}

window.addEventListener("load", init);