

const DAY_OF_WEEK = ['土', '日', '月', '火', '水', '木', '金'];

function init() {
    let y = document.getElementById('y');
    let m = document.getElementById('m');
    let d = document.getElementById('d');
    for (let i = 1; i <= 3000; i++) {
        let yop = document.createElement('option');
        yop.text = i;
        yop.value = i;
        y.appendChild(yop);
        if (i <= 31) {
            let dop = document.createElement('option');
            dop.text = i;
            dop.value = i;
            d.appendChild(dop);
            if (i <= 12) {
                let mop = document.createElement('option');
                mop.text = i;
                mop.value = i;
                m.appendChild(mop);
            }
        }
    }
    let now = new Date();
    y.value = now.getFullYear();
    m.value = now.getMonth() + 1;
    d.value = now.getDate();
    y.addEventListener('change', chgYMD);
    m.addEventListener('change', chgYMD);
    d.addEventListener('change', chgYMD);
    chgYMD();
}

function chgYMD() {
    let y = parseInt(document.getElementById('y').value);
    let m = parseInt(document.getElementById('m').value);
    let d = parseInt(document.getElementById('d').value);
    let date = new Date('' + y + '/' + m + '/' + d);
    document.getElementById('dow').innerText = '（' + DAY_OF_WEEK[(date.getDay() + 1) % 7] + '）';
    zeller(y, m, d);
}

function zeller(y, m, d) {
    let C = Math.floor(y / 100);
    let Y = y % 100;
    let x = 5 * C + Y + Math.floor(Y / 4) + Math.floor(C / 4) + Math.floor(26 * (m + 1) / 10) + d;
    let h = x % 7;
    document.getElementById('f1').innerText = 'C = [' + y + '/100] = ' + C;
    document.getElementById('f2').innerText = 'Y = ' + y + ' mod 100 = ' + Y;
    document.getElementById('f3').innerText = 'h = (5*' + C + ' + ' + Y + ' + [' + Y + '/4] + [' + C + '/4] + [26(' + m + '+1)/10] + ' + d + ') mod 7';
    document.getElementById('f4').innerHTML = '&nbsp;&nbsp;= (' + x + ') mod 7';
    document.getElementById('f5').innerHTML = '&nbsp;&nbsp;= ' + h;
    document.getElementById('ret').innerText = '' + y + '/' + m + '/' + d + ' は' + DAY_OF_WEEK[h] + '曜日';
}

window.addEventListener('load', init);