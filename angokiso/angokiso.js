
function init() {
    document.getElementById("powtitle").addEventListener("click", clicktitle);
    document.getElementById("dhtitle").addEventListener("click", clicktitle);
    document.getElementById("pownext").addEventListener("click", pownext);
    document.getElementById("dhpeq").addEventListener("click", dhpub);
    document.getElementById("dhseq").addEventListener("click", dhshare);
    toggle("powdetail");
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

function pownext() {
    let name = document.getElementById("powname").value;
    let num = parseInt(document.getElementById("pownum").value, 10);
    if (isNaN(num)) {
        num = 0;
    }
    let msg = name + " " + num;
    let md = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "sjcl" });
    let sha256 = md.digestString(msg);
    console.log(msg, sha256);
    document.getElementById("powmsg").innerHTML = "「" + msg + "」：";
    document.getElementById("powhash").innerHTML = sha256;
    let min = document.getElementById("powminhash").innerHTML;
    if (min) {
        if (sha256 < min) {
            document.getElementById("powminmsg").innerHTML = "★「" + msg + "」：";
            document.getElementById("powminhash").innerHTML = sha256;
        }
    } else {
        document.getElementById("powminmsg").innerHTML = "★「" + msg + "」：";
        document.getElementById("powminhash").innerHTML = sha256;
    }
    document.getElementById("pownum").value = num + 1;
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