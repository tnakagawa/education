"use strict";

/// <reference path="./lib/knockout.d.ts" />
/// <reference path="./lib/jquery.d.ts" />

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

const SECP256K1 = KJUR.crypto.ECParameterDB.getByName("secp256k1");

function init() {
    let tabs = new Tabs();
    ko.applyBindings(tabs, document.getElementById("header"));

    let shamir = new Shamir(3, 5);
    ko.applyBindings(shamir, document.getElementById("Shamir"));

    let vss = new Vss(2, 3);
    ko.applyBindings(vss, document.getElementById("VSS"));

    let schnorr = new Schnorr(2, 3);
    ko.applyBindings(schnorr, document.getElementById("Schnorr"));

    let etc = new Etc();
    ko.applyBindings(etc, document.getElementById("Etc"));
}

// Tabs
class Tabs {
    constructor() {
        this.tabs = ko.observableArray();
        this.tabs.push(new Tab("Shamir", "Shamir's Secret Sharing"));
        this.tabs.push(new Tab("VSS", "Verifiable Secret Sharing"));
        this.tabs.push(new Tab("Schnorr", "Schnorr's Signature"));
        this.tabs.push(new Tab("Etc", "Etc"));
        this.show(this.tabs()[0]);
    }
    show(data) {
        for (let i = 0; i < this.tabs().length; i++) {
            let item = this.tabs()[i];
            if (item.id === data.id) {
                item.css("menu clickable select");
                $("#" + item.id).delay(100).fadeIn(100);
            } else {
                item.css("menu clickable");
                $("#" + item.id).fadeOut(100);
            }
        }
        window.scrollTo(0, 0);
    }
}

class Tab {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.css = ko.observable("menu clickable");
    }
}

// Shamir
class Shamir {
    constructor(m, n) {
        this.m = ko.observable(m);
        this.n = ko.observable(n);
        this.p = ko.observable("97");
        this.s = ko.observable("");
        this.rs = ko.observableArray([]);
        for (let i = 1; i < this.m(); i++) {
            this.rs.push(new ShamirRandom(this, ""));
        }
        this.fs = ko.observableArray([]);
        this.ps = ko.observableArray([]);
        for (let i = 0; i < this.n(); i++) {
            this.ps.push(new ShamirPlayer(this, i + 1));
        }
        this.ans = ko.observable(false);
        this.sec = ko.observable("");
    }
    set ns(value) {
        this.s("");
        this.s(mod(value, this.p()));
    }
    get ns() {
        return this.s();
    }
    setSecret() {
        this.s(rnd(this.p()).toString());
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            player.c(false);
        }
    }
    setRandom() {
        for (let i = 0; i < this.rs().length; i++) {
            let item = this.rs()[i];
            item.r = rnd(this.p()).toString();
        }
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            player.c(false);
        }
    }
    viewPlayer() {
        this.fs.removeAll();
        if (!this.s()) {
            return false;
        }
        for (let i = 0; i < this.rs().length; i++) {
            let item = this.rs()[i].r;
            if (!item) {
                return false;
            }
        }
        for (let i = 1; i <= this.ps().length; i++) {
            let y = this.polynomial(i);
            this.ps()[i - 1].y(y);
            let html = "<td class=\"left\">" + this.formula(i) + " = " + y + "</td><td>&nbsp;</td>"
            html += "<td class=\"left\">(" + i + "," + y + ")</td><td> &rArr; P<sub>" + i + "</sub></td>";
            this.fs.push(html);
        }
        return true;
    }
    formula(idx) {
        let html = this.s();
        for (let i = 0; i < this.rs().length; i++) {
            let item = this.rs()[i].r;
            html += " + " + item + "&times;" + idx;
            if (i > 0) {
                html += "<sup>" + (i + 1) + "</sup>";
            }
        }
        html += " mod " + this.p();
        return html;
    }
    selectPlayer() {
        let cnt = 0;
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            player.e(true);
            if (player.c()) {
                cnt++;
            }
        }
        if (cnt >= this.m()) {
            for (let i = 0; i < this.ps().length; i++) {
                let player = this.ps()[i];
                if (!player.c()) {
                    player.e(false);
                }
            }
        }
    }
    polynomial(n) {
        let x = new BigInteger(n.toString(10));
        let as = [new BigInteger(this.s())];
        for (let i = 0; i < this.rs().length; i++) {
            as.push(new BigInteger("" + this.rs()[i].r));
        }
        let fx = BigInteger.ZERO;
        for (let i = 0; i < as.length; i++) {
            fx = fx.add(as[i].multiply(x.pow(new BigInteger(i.toString()))));
        }
        return mod(fx.toString(), this.p());
    }
    viewSecret() {
        let cnt = 0;
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            player.e(true);
            if (player.c()) {
                cnt++;
            }
        }
        if (cnt >= this.m()) {
            return true;
        }
        this.ans(false);
        return false;
    }
    de() {
        if (!this.viewSecret()) {
            return [];
        }
        let htmls = [];
        for (let i = 1; i <= this.m(); i++) {
            let html = "";
            for (let j = 1; j <= this.m(); j++) {
                if (i == j) {
                    continue;
                }
                html += "(x<sub>" + j + "</sub>-x<sub>" + i + "</sub>)";
            }
            htmls.push(html);
        }
        return htmls;
    }
    nu() {
        if (!this.viewSecret()) {
            return [];
        }
        let htmls = [];
        for (let i = 1; i <= this.m(); i++) {
            let html = {};
            html["rowspan"] = "2";
            html["css"] = "";
            if (i == 1) {
                html["html"] = "s = y<sub>" + i + "</sub>";
            } else {
                html["html"] = "&nbsp;+ y<sub>" + i + "</sub>";
            }
            htmls.push(html);
            html = {};
            html["rowspan"] = "1";
            html["css"] = "bunsu";
            html["html"] = "";
            for (let j = 1; j <= this.m(); j++) {
                if (i == j) {
                    continue;
                }
                html["html"] += "x<sub>" + j + "</sub>";
            }
            htmls.push(html);
        }
        let html = {};
        html["rowspan"] = "2";
        html["css"] = "";
        html["html"] = "&nbsp;mod p";
        htmls.push(html);
        return htmls;
    }
    dep() {
        if (!this.viewSecret()) {
            return [];
        }
        let signer = [];
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            if (player.c()) {
                signer.push(player);
            }
        }
        let htmls = [];
        for (let i = 0; i < signer.length; i++) {
            let html = "";
            for (let j = 0; j < signer.length; j++) {
                if (i == j) {
                    continue;
                }
                html += "(" + signer[j].idx + "-" + signer[i].idx + ")";
            }
            htmls.push(html);
        }
        return htmls;
    }
    nup() {
        if (!this.viewSecret()) {
            return [];
        }
        let signer = [];
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            if (player.c()) {
                signer.push(player);
            }
        }
        let htmls = [];
        for (let i = 0; i < signer.length; i++) {
            let html = {};
            html["rowspan"] = "2";
            html["css"] = "";
            if (i == 0) {
                html["html"] = "s = " + signer[i].y();
            } else {
                html["html"] = "&nbsp;+ " + signer[i].y();
            }
            htmls.push(html);
            html = {};
            html["rowspan"] = "1";
            html["css"] = "bunsu";
            html["html"] = "";
            let flg = false;
            for (let j = 0; j < signer.length; j++) {
                if (i == j) {
                    continue;
                }
                if (flg) {
                    html["html"] += "&times;" + signer[j].idx;
                } else {
                    html["html"] += "" + signer[j].idx;
                    flg = true;
                }
            }
            htmls.push(html);
        }
        let html = {};
        html["rowspan"] = "2";
        html["css"] = "";
        html["html"] = "&nbsp;mod " + this.p() + "</sub> =&nbsp;";
        this.sec(this.secret(signer));
        htmls.push(html);
        return htmls;
    }
    secret(signer) {
        let s = BigInteger.ZERO;
        let p = new BigInteger(this.p());
        for (let i = 0; i < signer.length; i++) {
            let xi = new BigInteger("" + signer[i].idx);
            let yi = new BigInteger("" + signer[i].y());
            let item = yi;
            for (let j = 0; j < signer.length; j++) {
                if (i == j) {
                    continue;
                }
                let xj = new BigInteger("" + signer[j].idx);
                let yj = new BigInteger("" + signer[j].y());
                item = item.multiply(xj);
                item = item.multiply(xj.subtract(xi).mod(p).modInverse(p));
            }
            s = s.add(item).mod(p);
        }
        return s.toString();
    }
    toggleAns() {
        this.ans(!this.ans());
    }
}

class ShamirRandom {
    constructor(parent, value) {
        this.parent = parent;
        this.value = ko.observable("");
    }
    set r(value) {
        this.value("");
        this.value(mod(value, this.parent.p()));
    }
    get r() {
        return this.value();
    }
}

class ShamirPlayer {
    constructor(parent, idx) {
        this.parent = parent;
        this.idx = idx;
        this.c = ko.observable(false);
        this.e = ko.observable(true);
        this.y = ko.observable("");
    }
    selectPlayer() {
        this.c(!this.c());
        this.parent.selectPlayer();
        return true;
    }
}

function supnum(num) {
    let n = "";
    if (num > 1) {
        n = num;
    }
    return n;
}

//

// 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
const S256P = new BigInteger("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16);

// 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
const S256N = new BigInteger("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16);

// (p-1)/2
const S256PH = new BigInteger("7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFE17", 16);

// (p+1)/4
const S256PQ = new BigInteger("3FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFBFFFFF0C", 16);

class Point {
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }
    bytes() {
        if (this.isNone()) {
            return null;
        }
        let str = this.X.toString(16);
        while (str.length < 64) {
            str = "0" + str;
        }
        let bit = this.Y.toString(2).slice(-1);
        if (bit == "0") {
            str = "02" + str;
        } else {
            str = "03" + str;
        }
        return str;
    }
    isNone() {
        if (this.X == null || this.Y == null) {
            return true;
        }
        return false;
    }
    add(p) {
        if (this.isNone()) {
            return new Point(p.X, p.Y);
        }
        if (p.isNone()) {
            return new Point(this.X, this.Y);
        }
        if (this.X.equals(p.X) && !this.Y.equals(p.Y)) {
            return new Point(null, null);
        }
        let lam = null;
        if (this.X.equals(p.X) && this.Y.equals(p.Y)) {
            lam = (new BigInteger("3")).multiply(this.X).multiply(this.X).multiply(
                (new BigInteger("2")).multiply(this.Y).modPow(S256P.subtract(new
                    BigInteger("2")), S256P)).mod(S256P);
        } else {
            lam = p.Y.subtract(this.Y).multiply(
                p.X.subtract(this.X).modPow(S256P.subtract(new BigInteger("2")),
                    S256P)).mod(S256P);
        }
        let x3 = lam.multiply(lam).subtract(this.X).subtract(p.X).mod(S256P);
        let y3 = lam.multiply(this.X.subtract(x3)).subtract(this.Y).mod(S256P);
        return new Point(x3, y3);
    }
    mul(x) {
        let n = new BigInteger(x.toString(10), 10);
        let bits = n.toString(2);
        let len = bits.length;
        let r = new Point(null, null);
        let p = new Point(this.X, this.Y);
        for (let i = 1; i <= len; i++) {
            if (bits[len - i] == "1") {
                r = r.add(p);
            }
            p = p.add(p);
        }
        return r;
    }
    onCurve() {
        return (new BigInteger("7")).equals(
            this.Y.modPow(new BigInteger("2"), S256P).subtract(this.X.modPow(new
                BigInteger("3"), S256P)).mod(S256P));
    }
}

const G = new Point(new BigInteger("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", 16),
    new BigInteger("483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", 16));

function b2p(str) {
    let bs = str.toString().trim();
    let p = new Point(null, null);
    if (bs.length != 33 * 2) {
        return p;
    }
    let h = bs.slice(0, 2);
    if (h != "02" && h != "03") {
        return p;
    }
    let x = new BigInteger(bs.slice(2), 16);
    let y = x.modPow(bi(3), S256P).add(bi(7)).modPow(S256PQ, S256P);
    let bit = y.toString(2).slice(-1);
    if ((bit == "0" && h == "03") || (bit == "1" && h == "02")) {
        y = S256P.subtract(y);
    }
    return new Point(x, y);
}

class Vss {
    constructor(m, n) {
        this.m = ko.observable(m);
        this.n = ko.observable(n);
        this.ps = ko.observableArray([]);
        this.x = ko.observable(2);
        this.H = G.mul(this.x());
        for (let i = 1; i <= this.n(); i++) {
            this.ps.push(new VssPlayer(this, this.m(), this.n(), i, this.H));
        }
        this.fix = ko.observable(false);
        this.p = ko.observable("");
        this.s = ko.observable("");
        this.pfix = ko.observable(false);
        this.ans = ko.observable(false);
    }
    setRandom() {
        let ps = this.ps();
        let ads = ps[ps.length - 1].ads();
        ads[ads.length - 1].r = "";
        for (let i = 0; i < this.ps().length; i++) {
            for (let j = 0; j < this.ps()[i].as().length; j++) {
                this.ps()[i].as()[j].r = rndnz(97);
            }
            for (let j = 0; j < this.ps()[i].ads().length; j++) {
                this.ps()[i].ads()[j].r = rndnz(97);
            }
        }
    }
    fixRandom() {
        let ps = this.ps();
        for (let i = 0; i < ps.length; i++) {
            for (let j = 0; j < ps[i].as().length; j++) {
                if (!ps[i].as()[j].r) {
                    this.fix(false);
                    return false;
                }
            }
            for (let j = 0; j < ps[i].ads().length; j++) {
                if (!ps[i].ads()[j].r) {
                    this.fix(false);
                    return false;
                }
            }
        }
        for (let i = 0; i < ps.length; i++) {
            ps[i].ss.removeAll();
            ps[i].sds.removeAll();
            ps[i].vcs.removeAll();
        }
        for (let i = 0; i < ps.length; i++) {
            ps[i].com();
            ps[i].pub();
            for (let j = 0; j < ps.length; j++) {
                ps[j].ss.push(ps[i].f(j + 1));
                ps[j].sds.push(ps[i].fd(j + 1));
            }
        }
        for (let i = 0; i < ps.length; i++) {
            for (let j = 0; j < ps.length; j++) {
                ps[i].vcs.push(this.verifyCom(i, j));
                ps[i].vps.push(this.verifyPub(i, j));
            }
        }
        let p = new Point(null, null);
        for (let i = 0; i < ps.length; i++) {
            p = p.add(ps[i].ps()[0]);
        }
        this.p(p.bytes());
        this.fix(true);
        return true;
    }
    verifyCom(i, j) {
        let pi = this.ps()[i];
        let pj = this.ps()[j];
        let sG = G.mul(pi.ss()[j]);
        let sdH = this.H.mul(pi.sds()[j]);
        let sGsdH = sG.add(sdH);
        let p = new Point(null, null);
        let cs = pj.cs();
        for (let i = 0; i < cs.length; i++) {
            p = p.add(cs[i].mul(bi(pi.idx()).modPow(bi(i), S256N)));
        }
        return sGsdH.bytes() == p.bytes();
    }
    verifyPub(i, j) {
        let pi = this.ps()[i];
        let pj = this.ps()[j];
        let sG = G.mul(pi.ss()[j]);
        let p = new Point(null, null);
        let ps = pj.ps();
        for (let i = 0; i < ps.length; i++) {
            p = p.add(ps[i].mul(bi(pi.idx()).modPow(bi(i), S256N)));
        }
        return sG.bytes() == p.bytes();
    }
    selectPlayer() {
        let cnt = 0;
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            player.e(true);
            if (player.c()) {
                cnt++;
            }
        }
        if (cnt >= this.m()) {
            for (let i = 0; i < this.ps().length; i++) {
                let player = this.ps()[i];
                if (!player.c()) {
                    player.e(false);
                }
            }
            this.pfix(true);
        } else {
            this.pfix(false);
        }
    }
    dep(idx) {
        if (!this.pfix()) {
            return [];
        }
        let de = "";
        for (let i = 0; i < this.ps().length; i++) {
            let p = this.ps()[i];
            if (p.c() && p.idx() != idx) {
                de += "(" + p.idx() + "-" + idx + ")";
            }
        }
        let htmls = [];
        htmls.push(de);
        return htmls;
    }
    nup(idx) {
        if (!this.pfix()) {
            return [];
        }
        let pi = null;
        let pjs = [];
        for (let i = 0; i < this.ps().length; i++) {
            let p = this.ps()[i];
            if (p.c()) {
                if (p.idx() == idx) {
                    pi = p;
                } else {
                    pjs.push(p);
                }
            }
        }
        let htmls = [];
        let html = {};
        html["rowspan"] = "2";
        html["css"] = "";
        html["html"] = "s<sub>" + pi.idx() + "</sub>";
        for (let i = 0; i < pi.ss().length; i++) {
            if (i == 0) {
                html["html"] += " = (" + pi.ss()[i];
            } else {
                html["html"] += " + " + pi.ss()[i];
            }
        }
        html["html"] += ")";
        htmls.push(html);
        html = {};
        html["rowspan"] = "1";
        html["css"] = "bunsu";
        html["html"] = "";
        for (let j = 0; j < pjs.length; j++) {
            if (j != 0) {
                html["html"] += "&times;";
            }
            html["html"] += pjs[j].idx();
        }
        htmls.push(html);
        html = {};
        html["rowspan"] = "2";
        html["css"] = "";
        html["html"] = "&nbsp;mod N";
        htmls.push(html);
        return htmls;
    }
    secret() {
        if (!this.pfix()) {
            return "";
        }
        let ps = [];
        for (let i = 0; i < this.ps().length; i++) {
            let p = this.ps()[i];
            if (p.c()) {
                ps.push(p);
            }
        }
        let s = BigInteger.ZERO;
        for (let i = 0; i < ps.length; i++) {
            s = s.add(bi(ps[i].secret(ps))).mod(S256N);
        }
        return s.toString(10);
    }
    shtml() {
        let html = "s";
        let flg = true;
        for (let i = 0; i < this.ps().length; i++) {
            let p = this.ps()[i];
            if (p.c()) {
                if (flg) {
                    html += " = "
                    flg = false;
                } else {
                    html += " + "
                }
                html += "s<sub>" + p.idx() + "</sub>";
            }
        }
        html += " mod N = ";
        return html;
    }
    toggleAns() {
        this.ans(!this.ans());
    }
}

class VssPlayer {
    constructor(p, m, n, idx, H) {
        this.parent = p;
        this.H = H;
        this.idx = ko.observable(idx);
        this.m = ko.observable(m);
        this.n = ko.observable(n);
        this.as = ko.observableArray([]);
        this.ads = ko.observableArray([]);
        this.ss = ko.observableArray([]);
        this.sds = ko.observableArray([]);
        this.cs = ko.observableArray([]);
        this.vcs = ko.observableArray([]);
        this.ps = ko.observableArray([]);
        this.vps = ko.observableArray([]);
        for (let i = 0; i < this.m(); i++) {
            this.as.push(new VssRandom());
            this.ads.push(new VssRandom());
        }
        this.c = ko.observable(false);
        this.e = ko.observable(true);
    }
    formula(t) {
        let html = "";
        let cs = null;
        if (t == 0) {
            html = "f<sub>" + this.idx() + "</sub>(x) = ";
            cs = this.as();
        } else if (t == 1) {
            html = "f'<sub>" + this.idx() + "</sub>(x) = ";
            cs = this.ads();
        }
        for (let i = 0; i < cs.length; i++) {
            if (i == 0) {
                html += " " + cs[i].r;
            } else if (i == 1) {
                html += " + " + cs[i].r + "&times;x";
            } else {
                html += " + " + cs[i].r + "&times;x<sup>" + i + "</sup>";
            }
        }
        return html;
    }
    f(x) {
        let y = BigInteger.ZERO;
        let cs = this.as();
        for (let i = 0; i < cs.length; i++) {
            y = y.add(bi(cs[i].r).multiply(bi(x).modPow(bi(i), S256N)));
        }
        return y;
    }
    fd(x) {
        let y = BigInteger.ZERO;
        let cs = this.ads();
        for (let i = 0; i < cs.length; i++) {
            y = y.add(bi(cs[i].r).multiply(bi(x).modPow(bi(i), S256N)));
        }
        return y;
    }
    com() {
        this.cs.removeAll();
        let as = this.as();
        let ads = this.ads();
        for (let i = 0; i < as.length; i++) {
            let p = G.mul(bi(as[i].r)).add(this.H.mul(bi(ads[i].r)));
            this.cs.push(p);
        }
    }
    pub() {
        this.ps.removeAll();
        let as = this.as();
        for (let i = 0; i < as.length; i++) {
            let p = G.mul(bi(as[i].r));
            this.ps.push(p);
        }
    }
    selectPlayer() {
        this.c(!this.c());
        this.parent.selectPlayer();
        return true;
    }
    secret(ps) {
        let s = BigInteger.ZERO;
        for (let i = 0; i < this.ss().length; i++) {
            s = s.add(bi(this.ss()[i])).mod(S256N);
        }
        let ui = new BigInteger("" + this.idx());
        for (let j = 0; j < ps.length; j++) {
            if (ps[j].idx() == this.idx()) {
                continue;
            }
            let uj = new BigInteger("" + ps[j].idx());
            s = s.multiply(uj).mod(S256N);
            s = s.multiply(uj.subtract(ui).mod(S256N).modInverse(S256N));
        }
        s = s.mod(S256N);
        return s.toString();
    }
}

class VssRandom {
    constructor() {
        this.value = ko.observable("");
    }
    set r(value) {
        this.value("");
        if (value) {
            this.value(mod(value, S256N));
        }
    }
    get r() {
        return this.value();
    }
}

// Schnorr

class Schnorr {
    constructor(m, n) {
        this.m = ko.observable(m);
        this.n = ko.observable(n);
        this.ps = ko.observableArray([]);
        this.x = ko.observable(2);
        this.H = G.mul(this.x());
        for (let i = 1; i <= this.n(); i++) {
            this.ps.push(new SchnorrPlayer(this, this.m(), this.n(), i, this.H));
        }
        for (let i = 0; i < this.ps().length; i++) {
            let pi = this.ps()[i];
            for (let j = 0; j < this.ps().length; j++) {
                let pj = this.ps()[j];
                pj.ss.push(pi.f(pj.idx()));
                pj.sds.push(pi.fd(pj.idx()));
            }
        }
        for (let i = 0; i < this.ps().length; i++) {
            let pi = this.ps()[i];
            for (let j = 0; j < this.ps().length; j++) {
                let pj = this.ps()[j];
                let result = pj.verifyCs(pi.idx(), pi.Cs());
                //console.log("verify C", pi.idx(), pj.idx(), result);
                if (!result) {
                    console.log("verify commitments error!", result);
                }
            }
        }
        this.P = ko.observable(new Point(null, null));
        for (let i = 0; i < this.ps().length; i++) {
            let pi = this.ps()[i];
            this.P(this.P().add(pi.As()[0]));
            for (let j = 0; j < this.ps().length; j++) {
                let pj = this.ps()[j];
                let result = pj.verifyAs(pi.idx(), pi.As());
                //console.log("verify A", pi.idx(), pj.idx(), result);
                if (!result) {
                    console.log("verify shared public error!", result);
                }
            }
        }
        this.pfix = ko.observable(false);
        this.fps = ko.observableArray([]);
        this.R = ko.observable(new Point(null, null));
        this.ha = ko.observable(new BigInteger("3"));
        this.sigma = ko.observable(null);
        this.ans = ko.observable(false);
    }
    selectPlayer() {
        let cnt = 0;
        for (let i = 0; i < this.ps().length; i++) {
            let p = this.ps()[i];
            p.e(true);
            if (p.c()) {
                cnt++;
            }
        }
        if (cnt >= this.m()) {
            for (let i = 0; i < this.ps().length; i++) {
                let p = this.ps()[i];
                if (!p.c()) {
                    p.e(false);
                }
            }
            this.fixPlayers();
            this.pfix(true);
        } else {
            this.pfix(false);
        }
    }
    fixPlayers() {
        let fps = [];
        let idxs = [];
        this.fps.removeAll();
        for (let i = 0; i < this.ps().length; i++) {
            let p = this.ps()[i];
            p.rs.removeAll();
            p.rds.removeAll();
            p.cs.removeAll();
            if (p.c()) {
                fps.push(p);
                this.fps.push(p);
                idxs.push(p.idx());
            }
        }
        for (let i = 0; i < fps.length; i++) {
            let pi = fps[i];
            pi.idxs(idxs);
            for (let j = 0; j < fps.length; j++) {
                let pj = fps[j];
                pj.rs.push(pi.g(pj.idx()));
                pj.rds.push(pi.gd(pj.idx()));
            }
        }
        for (let i = 0; i < fps.length; i++) {
            let pi = fps[i];
            for (let j = 0; j < fps.length; j++) {
                let pj = fps[j];
                let result = pj.verifyCds(pi.idx(), pi.Cds());
                //console.log("verify C'", pi.idx(), pj.idx(), result);
                if (!result) {
                    console.log("verify commitments' error!", result);
                }
            }
        }
        let R = new Point(null, null);
        for (let i = 0; i < fps.length; i++) {
            let pi = fps[i];
            R = R.add(pi.Bs()[0]);
            for (let j = 0; j < fps.length; j++) {
                let pj = fps[j];
                let result = pj.verifyBs(pi.idx(), pi.Bs());
                //console.log("verify B", pi.idx(), pj.idx(), result);
                if (!result) {
                    console.log("verify random error!", result);
                }
            }
        }
        this.R(R);
        let cs = [];
        for (let i = 0; i < fps.length; i++) {
            let pi = fps[i];
            let c = pi.cert(this.ha());
            cs.push(c);
            for (let j = 0; j < fps.length; j++) {
                let pj = fps[j];
                pj.cs.push(c);
            }
        }
        for (let i = 0; i < fps.length; i++) {
            let pi = fps[i];
            let c = cs[i];
            let p = new Point(null, null);
            for (let j = 0; j < this.ps().length; j++) {
                let pj = this.ps()[j];
                for (let k = 0; k < pj.As().length; k++) {
                    let A = pj.As()[k];
                    p = p.add(A.mul(bi(pi.idx()).modPow(bi(k), S256N)));
                }
            }
            p = p.mul(bi(this.ha()));
            for (let j = 0; j < fps.length; j++) {
                let pj = fps[j];
                for (let k = 0; k < pj.Bs().length; k++) {
                    let B = pj.Bs()[k];
                    p = p.add(B.mul(bi(pi.idx()).modPow(bi(k), S256N)));
                }
            }
            let result = p.bytes() == G.mul(bi(c)).bytes();
            //console.log("verify Cert", pi.idx(), result);
            if (!result) {
                console.log("verify Cert error!", result);
            }
        }
        let s = BigInteger.ZERO;
        for (let i = 0; i < fps.length; i++) {
            let c = cs[i];
            let ui = new BigInteger("" + fps[i].idx());
            for (let j = 0; j < fps.length; j++) {
                if (i == j) {
                    continue;
                }
                let uj = new BigInteger("" + fps[j].idx());
                c = c.multiply(uj).mod(S256N);
                c = c.multiply(uj.subtract(ui).mod(S256N).modInverse(S256N));
            }
            s = s.add(c).mod(S256N);
        }
        this.sigma(s);
    }
    dep() {
        if (!this.pfix()) {
            return [];
        }
        let htmls = [];
        for (let i = 0; i < this.fps().length; i++) {
            let de = "";
            let ui = this.fps()[i].idx();
            for (let j = 0; j < this.fps().length; j++) {
                let uj = this.fps()[j].idx();
                if (ui == uj) {
                    continue;
                }
                de += "(" + uj + "-" + ui + ")";
            }
            htmls.push(de);
        }
        return htmls;
    }
    nup() {
        if (!this.pfix()) {
            return [];
        }
        let htmls = [];
        let html = {};
        html["rowspan"] = "2";
        html["css"] = "";
        html["html"] = "&sigma; =&nbsp;";
        htmls.push(html);
        for (let i = 0; i < this.fps().length; i++) {
            if (i != 0) {
                let html = {};
                html["rowspan"] = "2";
                html["css"] = "";
                html["html"] = "&nbsp;+&nbsp;";
                htmls.push(html);
            }
            let html = {};
            html["rowspan"] = "1";
            html["css"] = "bunsu";
            let nu = "";
            let ui = this.fps()[i].idx();
            for (let j = 0; j < this.fps().length; j++) {
                let uj = this.fps()[j].idx();
                if (ui == uj) {
                    continue;
                }
                if (nu.length > 0) {
                    nu += "&times;"
                }
                nu += uj;
            }
            html["html"] = nu;
            htmls.push(html);
            html = {};
            html["rowspan"] = "2";
            html["css"] = "";
            html["html"] = "&times;" + this.fps()[i].cs()[i];
            htmls.push(html);
        }
        html = {};
        html["rowspan"] = "2";
        html["css"] = "";
        html["html"] = "&nbsp;mod N =&nbsp;";
        htmls.push(html);
        return htmls;
    }
    toggleAns() {
        this.ans(!this.ans());
    }
}

class SchnorrPlayer {
    constructor(p, m, n, idx, H) {
        this.parent = p;
        this.m = ko.observable(m);
        this.n = ko.observable(n);
        this.idx = ko.observable(idx);
        this.H = H;
        this.c = ko.observable(false);
        this.e = ko.observable(true);
        this.as = ko.observableArray([]);
        this.ads = ko.observableArray([]);
        this.ss = ko.observableArray([]);
        this.sds = ko.observableArray([]);
        this.Cs = ko.observableArray([]);
        this.As = ko.observableArray([]);
        this.bs = ko.observableArray([]);
        this.bds = ko.observableArray([]);
        this.rs = ko.observableArray([]);
        this.rds = ko.observableArray([]);
        this.Cds = ko.observableArray([]);
        this.Bs = ko.observableArray([]);
        for (let i = 0; i < this.m(); i++) {
            this.as.push(rndnz(97));
            this.ads.push(rndnz(97));
            this.Cs.push(G.mul(this.as()[i]).add(this.H.mul(this.ads()[i])));
            this.As.push(G.mul(this.as()[i]));
            this.bs.push(rndnz(97));
            this.bds.push(rndnz(97));
            this.Cds.push(G.mul(this.bs()[i]).add(this.H.mul(this.bds()[i])));
            this.Bs.push(G.mul(this.bs()[i]));
        }
        this.idxs = ko.observableArray([]);
        this.cs = ko.observableArray([]);
        this.cer = ko.observable(0);
    }
    f(x) {
        return this.pol(x, this.as());
    }
    fd(x) {
        return this.pol(x, this.ads());
    }
    g(x) {
        return this.pol(x, this.bs());
    }
    gd(x) {
        return this.pol(x, this.bds());
    }
    pol(x, cs) {
        let y = BigInteger.ZERO;
        for (let i = 0; i < cs.length; i++) {
            y = y.add(cs[i].multiply(bi(x).modPow(bi(i), S256N)));
        }
        return y;
    }
    verifyCs(idx, Cs) {
        let s = this.ss()[idx - 1];
        let sd = this.sds()[idx - 1];
        let sGsdH = G.mul(s).add(this.H.mul(sd));
        let i = bi(this.idx());
        let C = new Point(null, null);
        for (let k = 0; k < Cs.length; k++) {
            C = C.add(Cs[k].mul(i.modPow(bi(k), S256N)))
        }
        return sGsdH.bytes() == C.bytes();
    }
    verifyAs(idx, As) {
        let s = this.ss()[idx - 1];
        let sG = G.mul(s);
        let i = bi(this.idx());
        let A = new Point(null, null);
        for (let k = 0; k < As.length; k++) {
            A = A.add(As[k].mul(i.modPow(bi(k), S256N)))
        }
        return sG.bytes() == A.bytes();
    }
    selectPlayer() {
        this.c(!this.c());
        this.parent.selectPlayer();
        return true;
    }
    verifyCds(id, Cds) {
        let idx = 0;
        for (let i = 0; i < this.idxs().length; i++) {
            if (this.idxs()[i] == id) {
                idx = i;
            }
        }
        let r = this.rs()[idx];
        let rd = this.rds()[idx];
        let rGrdH = G.mul(r).add(this.H.mul(rd));
        let i = bi(this.idx());
        let Cd = new Point(null, null);
        for (let k = 0; k < Cds.length; k++) {
            Cd = Cd.add(Cds[k].mul(i.modPow(bi(k), S256N)))
        }
        return rGrdH.bytes() == Cd.bytes();
    }
    verifyBs(id, Bs) {
        let idx = 0;
        for (let i = 0; i < this.idxs().length; i++) {
            if (this.idxs()[i] == id) {
                idx = i;
            }
        }
        let r = this.rs()[idx];
        let rG = G.mul(r);
        let i = bi(this.idx());
        let B = new Point(null, null);
        for (let k = 0; k < Bs.length; k++) {
            B = B.add(Bs[k].mul(i.modPow(bi(k), S256N)))
        }
        return rG.bytes() == B.bytes();
    }
    cert(h) {
        let c = BigInteger.ZERO;
        for (let i = 0; i < this.ss().length; i++) {
            c = c.add(this.ss()[i]);
        }
        c = c.multiply(h);
        for (let i = 0; i < this.rs().length; i++) {
            c = c.add(this.rs()[i]);
        }
        this.cer(c);
        return c;
    }
    verifyCertHtml() {
        let html = "";
        html += this.cer().toString(10) + "G =? ";
        for (let i = 0; i < this.idxs().length; i++) {
            for (let j = 0; j < this.m(); j++) {
                if (i != 0 || j != 0) {
                    html += "+";
                }
                html += this.idx() + "<sup>" + j + "</sup>&times;B<sub>"
                    + this.idxs()[i] + "" + j + "</sub>";
            }
        }
        html += "+" + this.parent.ha() + "&times;(";
        for (let i = 1; i <= this.n(); i++) {
            for (let j = 0; j < this.m(); j++) {
                if (i != 1 || j != 0) {
                    html += "+";
                }
                html += this.idx() + "<sup>" + j + "</sup>&times;A<sub>"
                    + i + "" + j + "</sub>";
            }
        }
        html += ")";
        return html;
    }
}

// Etc

class Etc {
    constructor() {
        this.xv = ko.observable("");
        this.av = ko.observable("");
        this.bv = ko.observable("");
        this.AP = ko.observable(new Point(null, null));
        this.BP = ko.observable(new Point(null, null));
        this.data = ko.observable("");
        this.rhtml = ko.observable("");
    }
    set x(xv) {
        this.xv("");
        let x = new BigInteger(xv.toString(10), 10);
        if (x) {
            this.xv(x.toString(10));
        }
    }
    get x() {
        return this.xv();
    }
    get xG() {
        let x = new BigInteger(this.xv(), 10);
        if (!x) {
            return "";
        }
        let xG = G.mul(x);
        return xG.bytes();
    }
    set a(av) {
        this.av("");
        let a = new BigInteger(av.toString(10), 10);
        if (a) {
            this.av(a.toString(10));
        }
    }
    get a() {
        return this.av();
    }
    set b(bv) {
        this.bv("");
        let b = new BigInteger(bv.toString(10), 10);
        if (b) {
            this.bv(b.toString(10));
        }
    }
    get b() {
        return this.bv();
    }
    set A(ap) {
        this.AP(b2p(ap));
    }
    get A() {
        return this.AP().bytes();
    }
    set B(bp) {
        this.BP(b2p(bp));
    }
    get B() {
        return this.BP().bytes();
    }
    get aAbB() {
        let aA = this.AP().mul(this.av());
        let bB = this.BP().mul(this.bv());
        return aA.add(bB).bytes();
    }
    addall() {
        this.rhtml("");
        let data = this.data();
        let points = data.match(/([0-9a-fA-F]{66})/g);
        let sum = new Point(null, null);
        let html = "";
        for (let i = 0; i < points.length; i++) {
            if (i != 0) {
                html += "+&nbsp;";
            } else {
                html += "&nbsp;&nbsp;"
            }
            let p = b2p(points[i]);
            html += p.bytes() + "<br>"
            sum = sum.add(p);
        }
        html += "=&nbsp;" + sum.bytes();
        this.rhtml(html);
    }
}

function bi(i) {
    return new BigInteger(i.toString(10));
}

function mod(i, p) {
    let x = new BigInteger(i.toString(10), 10);
    let y = new BigInteger(p.toString(10), 10);
    return x.mod(y).toString(10);
}

function rnd(i) {
    let bs = new Array(32);
    new SecureRandom().nextBytes(bs);
    return (new BigInteger(bs)).mod(new BigInteger(i.toString(10)));
}

function rndnz(i) {
    let r = rnd(i);
    if (r.toString(10) == "0") {
        return rndnz(i);
    }
    return r;
}

$(init);