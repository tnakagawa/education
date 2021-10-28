function init() {
    let elements = document.getElementsByTagName('button');
    for (let element of elements) {
        if (element.getAttribute('data-id')) {
            element.addEventListener('click', testLoad);
        }
    }
    stopAllLoad();
}

function testLoad() {
    let dataId = this.getAttribute('data-id');
    if (dataId) {
        startLoad(dataId);
        setTimeout(stopAllLoad, 15000);
    }
}

function startLoad(id) {
    document.getElementById(id).style.visibility = 'visible';
}

function stopAllLoad() {
    let elements = document.getElementsByClassName('loading');
    for (let element of elements) {
        element.style.visibility = 'hidden';
    }
}

window.addEventListener('load', init);