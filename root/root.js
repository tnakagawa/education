function sqrt(v) {
    let n = BigInt(v);
    let x = [];
    let b = 16n;
    while (n != 0n) {
        let r = n % b;
        n = (n - r) / b;
        x.push(r);
    }
    if (x.length % 2 == 1) {
        x.push(0n);
    }
    x.reverse();
    let z = 0n;
    let r = 0n;
    let p = 0n;
    let s = "";
    let d = 16;
    for (let i = 0; i < x.length + d * 2; i += 2) {
        let xx = 0n;
        if (i < x.length) {
            xx = b * x[i] + x[i + 1];
        }
        if (i == x.length) {
            s += ".";
        }
        let a = b - 1n;
        // z = b^2(z-r)+xx
        z = b * b * (z - r) + xx;
        while (true) {
            // r = (2*b*p+a)a
            r = (2n * b * p + a) * a;
            if (r <= z) {
                p = b * p + a;
                s += a.toString(Number(b));
                break;
            }
            a--;
        }
    }
    return s;
}

function cbrt(v) {
    let n = BigInt(v);
    let x = [];
    let b = 16n;
    while (n != 0n) {
        let r = n % b;
        n = (n - r) / b;
        x.push(r);
    }
    while (x.length % 3 != 0) {
        x.push(0n);
    }
    x.reverse();
    let z = 0n;
    let r = 0n;
    let p = 0n;
    let s = "";
    let d = 16;
    for (let i = 0; i < x.length + d * 3; i += 3) {
        let xxx = 0n;
        if (i < x.length) {
            xxx = b * b * x[i] + b * x[i + 1] + x[i + 2];
        }
        if (i == x.length) {
            s += ".";
        }
        let a = b - 1n;
        z = b * b * b * (z - r) + xxx;
        while (true) {
            r = (3n * b * b * p * p + 3n * b * p * a + a * a) * a;
            if (r <= z) {
                p = b * p + a;
                s += a.toString(Number(b));
                break;
            }
            a--;
        }
    }
    return s;
}
