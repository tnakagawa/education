"use strict";

function init() {
    // testTOTP();
    // testBase32();
    setQrCode("issuer", "account", "secret");
    setTimer();
    setInterval(setTimer, 1000);
    document.getElementById("gen").addEventListener("click", generate);
}

var qrcode = null;
var secret_ = null;
var beforeT = 0;

function generate() {
    let issuer = document.getElementById("issuer").value;
    let account = document.getElementById("account").value;
    let secret = document.getElementById("secret").value;
    if (issuer && account && secret) {
        setQrCode(issuer, account, secret);
        let C = Math.floor(new Date().getTime() / 1000);
        setTotp(C);
        document.getElementById("issuer").value = "";
        document.getElementById("account").value = "";
        document.getElementById("secret").value = "";
        alert("TOTP has changed.");
    } else {
        alert("Illegal Parameter.");
    }
}

function setQrCode(issuer, account, secret) {
    let uri = createTotpUri(issuer, account, secret);
    if (qrcode) {
        qrcode.clear();
        qrcode.makeCode(uri);
    } else {
        qrcode = new QRCode("qrcode", {
            text: uri,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });
    }
    secret_ = secret;
}

function setTotp(C) {
    let K = secret_;
    // let C = Math.floor(new Date().getTime() / 1000);
    let totp = TOTP(K, C, "SHA-1", 6);
    document.getElementById("totp").innerText = totp.substring(0, 3) + " " + totp.substring(3);
}

function setTimer() {
    let T0 = 0;
    let X = 30;
    let C = Math.floor(new Date().getTime() / 1000);
    let T = Math.floor((C - T0) / X);
    let t = C % X;
    let text = "" + (30 - t);
    if (beforeT != T) {
        setTotp(C);
        beforeT = T;
    }
    let canvas = document.getElementById("timer");
    let context = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    context.clearRect(0, 0, w, h);
    context.beginPath();
    context.moveTo(w / 2, h / 2);
    context.fillStyle = "#f8f9fa";
    context.arc(w / 2, h / 2, w / 4, 0 * Math.PI / 180, 360 * Math.PI / 180, true);
    context.fill();
    context.beginPath();
    context.moveTo(w / 2, h / 2);
    context.fillStyle = "#0d6efd";
    context.arc(w / 2, h / 2, w / 4, -90 * Math.PI / 180, (t * 12 - 89.9) * Math.PI / 180, true);
    context.fill();
    context.beginPath();
    context.moveTo(w / 2, h / 2);
    context.fillStyle = "white";
    context.arc(w / 2, h / 2, w / 4 - 2, 0 * Math.PI / 180, 360 * Math.PI / 180, true);
    context.fill();
    context.fillStyle = "#0d6efd";
    let fontSize = 14;
    context.font = fontSize + "px Arial";
    let x = (canvas.width - context.measureText(text).width) / 2;
    let y = (canvas.height + fontSize) / 2 - 2;
    context.fillText(text, x, y);
}

window.addEventListener('load', init);