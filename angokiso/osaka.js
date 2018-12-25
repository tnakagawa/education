
const SLIDO_URL = "https://app2.sli.do/event/cev8nwhm/questions";

function init() {
    let headers = document.getElementsByTagName("header");
    for (let header of headers) {
        header.addEventListener("click", toggle);
    }
    // Hash
    document.getElementById("hfast").addEventListener("click", calcHashs);
    document.getElementById("hplay").addEventListener("click", calcHash);
    document.getElementById("hshare").addEventListener("click", copyandsend);
    // DH
    document.getElementById("dhg").value = 2;
    document.getElementById("dhp").value = 107;
    document.getElementById("dhsk").value = 0;
    document.getElementById("dhpk").value = 0;
    let dhs = ["dhg", "dhp", "dhsk", "dhpk"];
    for (let dh of dhs) {
        document.getElementById(dh).addEventListener("change", changeDH);
    }
    changeDH();
    // Threshold secret sharing
    let ts = ["tp", "ts", "ta1", "ta2", "tc1", "tc2", "tc3", "tc4", "tc5"];
    for (let t of ts) {
        document.getElementById(t).addEventListener("change", changeThreshold);
    }
    document.getElementById("trand").addEventListener("click", setThresholdRandom);
    document.getElementById("tri").addEventListener("click", viewAnswer);
}

function changeThreshold() {
    let p = parseInt(document.getElementById("tp").value);
    console.log(p);
    let s = parseInt(document.getElementById("ts").value);
    let a1 = parseInt(document.getElementById("ta1").value);
    let a2 = parseInt(document.getElementById("ta2").value);
    console.log(s, a1, a2);
    if (!isNaN(p) && !isNaN(s) && !isNaN(a1) && !isNaN(a2)) {
        s = s % p;
        a1 = a1 % p;
        a2 = a2 % p;
        document.getElementById("ts").value = s;
        document.getElementById("ta1").value = a1;
        document.getElementById("ta2").value = a2;
        let tfi = "Dealar computes P<sub>i</sub> = " + s + " + " + a1 + "&times;i" + " + " + a2 + "&times;i<sup>2</sup> mod " + p;
        document.getElementById("tfi").innerHTML = tfi;
        let ys = [0, 0, 0, 0, 0];
        for (let i = 1; i <= 5; i++) {
            ys[i - 1] = (s + a1 * i + a2 * i * i) % p;
            let tf = "" + s + " + " + a1 + "&times;" + i + " + " + a2 + "&times;" + i + "<sup>2</sup> mod " + p
                + " = " + ys[i - 1];
            let tfs = "(" + i + "," + ys[i - 1] + ") ⇒ P<sub>" + i + "</sub>";
            document.getElementById("tf" + i).innerHTML = tf;
            document.getElementById("tfs" + i).innerHTML = tfs;
            let tcv = "(" + i + "," + ys[i - 1] + ") ⇒ P<sub>" + i + "</sub>";
            document.getElementById("tcv" + i).innerHTML = tcv;
        }
        document.getElementById("tfunc").style.display = "block";
        document.getElementById("tselect").style.display = "block";
        let xs = [];
        for (let i = 1; i <= 5; i++) {
            let c = document.getElementById("tc" + i).checked;
            if (c) {
                xs.push(i);
            }
        }
        if (xs.length < 3) {
            for (let i = 1; i <= 5; i++) {
                document.getElementById("tc" + i).disabled = false;
            }
        } else if (xs.length == 3) {
            for (let i = 1; i <= 5; i++) {
                let c = document.getElementById("tc" + i).checked;
                if (c) {
                    document.getElementById("tc" + i).disabled = false;
                } else {
                    document.getElementById("tc" + i).disabled = true;
                }
            }
            document.getElementById("tlp").style.display = "block";
            document.getElementById("trf").innerHTML = fomula(
                "x<sub>" + xs[0] + "</sub>", "y<sub>" + xs[0] + "</sub>",
                "x<sub>" + xs[1] + "</sub>", "y<sub>" + xs[1] + "</sub>",
                "x<sub>" + xs[2] + "</sub>", "y<sub>" + xs[2] + "</sub>",
                "p", "&middot;");
            document.getElementById("trv").innerHTML = fomula(
                xs[0], ys[xs[0] - 1],
                xs[1], ys[xs[1] - 1],
                xs[2], ys[xs[2] - 1],
                p, "&times;");
            document.getElementById("trs").innerHTML = ""
                + calcSecret(p, xs[0], ys[xs[0] - 1], xs[1], ys[xs[1] - 1], xs[2], ys[xs[2] - 1]);
        } else {
            for (let i = 1; i <= 5; i++) {
                document.getElementById("tc" + i).disabled = false;
                document.getElementById("tc" + i).checked = false;
            }
        }
    } else {
        document.getElementById("tfunc").style.display = "none";
        document.getElementById("tselect").style.display = "none";
        document.getElementById("tlp").style.display = "none";
    }
}

function setThresholdRandom() {
    let p = parseInt(document.getElementById("tp").value);
    let ts = ["ts", "ta1", "ta2"];
    for (let t of ts) {
        document.getElementById(t).value = Math.floor(Math.random() * p);
    }
    changeThreshold();
}

function calcSecret(pv, x1, y1, x2, y2, x3, y3) {
    let s = BigInteger.ZERO;
    let p = new BigInteger("" + pv);
    let xs = [x1, x2, x3];
    let ys = [y1, y2, y3];
    for (let i = 0; i < xs.length; i++) {
        let xi = new BigInteger("" + xs[i]);
        let yi = new BigInteger("" + ys[i]);
        let item = yi;
        for (let j = 0; j < xs.length; j++) {
            if (i == j) {
                continue;
            }
            let xj = new BigInteger("" + xs[j]);
            item = item.multiply(xj);
            item = item.multiply(xj.subtract(xi).mod(p).modInverse(p));
        }
        s = s.add(item).mod(p);
    }
    return s.toString();
}

function viewAnswer() {
    document.getElementById("tri").style.display = "none";
    document.getElementById("trs").style.display = "block";
}

function changeDH() {
    let g = new BigInteger(document.getElementById("dhg").value, 10);
    let p = new BigInteger(document.getElementById("dhp").value, 10);
    let sk = new BigInteger(document.getElementById("dhsk").value, 10);
    let pk = new BigInteger(document.getElementById("dhpk").value, 10);
    document.getElementById("dhgen").innerHTML = g.toString(10);
    document.getElementById("dhp1").innerHTML = p.toString(10);
    document.getElementById("dhp2").innerHTML = p.toString(10);
    document.getElementById("dhsk1").innerHTML = sk.toString(10);
    document.getElementById("dhsk2").innerHTML = sk.toString(10);
    document.getElementById("dhpk1").innerHTML = g.modPow(sk, p).toString(10);
    document.getElementById("dhpk2").innerHTML = pk.modPow(sk, p).toString(10);
}

function fomula(x1, y1, x2, y2, x3, y3, p, ex) {
    return ""
        + "<table>"
        + "<tr>"
        + "    <td rowspan=\"2\">s = " + y1 + "</td>"
        + "    <td class=\"de\">" + x2 + ex + x3 + "</td>"
        + "    <td rowspan=\"2\">&nbsp;+ " + y2 + "</td>"
        + "    <td class=\"de\">" + x1 + ex + x3 + "</td>"
        + "    <td rowspan=\"2\">&nbsp;+ " + y3 + "</td>"
        + "    <td class=\"de\">" + x1 + ex + x2 + "</td>"
        + "    <td rowspan=\"2\">&nbsp;mod " + p + "</td>"
        + "</tr>"
        + "<tr>"
        + "    <td>(" + x2 + "-" + x1 + ")(" + x3 + "-" + x1 + ")</td>"
        + "    <td>(" + x1 + "-" + x2 + ")(" + x3 + "-" + x2 + ")</td>"
        + "    <td>(" + x1 + "-" + x3 + ")(" + x2 + "-" + x3 + ")</td>"
        + "</tr>"
        + "</table>";
}

var hflg = false;
var mininput = "";
var minvalue = "";

function calcHashs() {
    if (hflg) {
        hflg = false;
        document.getElementById("hfast").src = "./img/fast.png";
    } else {
        hflg = true;
        document.getElementById("hfast").src = "./img/stop.png";
        loop();
    }
}

function loop() {
    if (hflg) {
        let seed = new Array(32);
        new SecureRandom().nextBytes(seed);
        let hex = "";
        for (let i = 0; i < seed.length; i++) {
            if (seed[i] < 0x10) {
                hex += "0";
            }
            hex += seed[i].toString(16);
        }
        let name = document.getElementById("hname").value;
        document.getElementById("hinput").value = name + "" + new BigInteger(hex, 16);
        calcHash();
        setTimeout(loop, 1);
    }
}

function calcHash() {
    let input = document.getElementById("hinput").value;
    let SHA256 = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "sjcl" });
    let value = SHA256.digestString(input);
    document.getElementById("hvalue").innerHTML = value;
    if (value < minvalue || minvalue == "") {
        mininput = input;
        minvalue = value;
        document.getElementById("mininput").innerHTML = mininput;
        document.getElementById("minvalue").innerHTML = minvalue;
    }
}

function copyandsend() {
    if (mininput && minvalue) {
        if (confirm("結果をクリップボードにコピーして、\n投稿サイトを開きます。\n良いですか？")) {
            document.getElementById("hcopy").value = mininput + "\n" + minvalue;
            document.getElementById("hcopy").select();
            document.execCommand("copy");
            window.open(SLIDO_URL, null);
        }
    }
}

function toggle() {
    hflg = true;
    calcHashs();
    let targets = this.parentElement.getElementsByTagName("section");
    let target = null;
    if (targets && targets.length > 0) {
        target = targets[0];
    }
    let sections = document.getElementsByTagName("section");
    for (let section of sections) {
        if (target === section) {
            continue;
        }
        section.style.display = "none";
    }
    if (target) {
        if (target.style.display == "block") {
            target.style.display = "none";
        } else {
            target.style.display = "block";
        }
    }
}

window.addEventListener("load", init);