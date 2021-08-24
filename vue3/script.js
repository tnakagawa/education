'use strict';

var app = null;

function init() {
    console.log('Vue.version', Vue.version);
    app = Vue.createApp(LifeCycle);
    let vm = app.mount('#counter');
    console.log(app);
    console.log(vm);
}

const LifeCycle = {
    data() {
        return {
            counter: 0,
        }
    },
    beforeCreate() {
        console.log('>>> beforeCreate');
        console.log(this.counter);
        console.log(this.$el);
        console.log(document.getElementById('cnt'));
        console.log('<<< beforeCreate');
    },
    created() {
        console.log('>>> created');
        console.log(this.counter);
        console.log(this.$el);
        console.log(document.getElementById('cnt'));
        console.log('<<< created');
    },
    beforeMount() {
        console.log('>>> beforeMount');
        console.log(this.counter);
        console.log(this.$el);
        console.log(document.getElementById('cnt'));
        console.log('<<< beforeMount');
    },
    mounted() {
        console.log('>>> mounted');
        console.log(this.counter);
        console.log(this.$el);
        console.log(document.getElementById('cnt'));
        console.log('<<< mounted');
        setInterval(() => {
            this.counter++;
            if (this.counter > 2) {
                app.unmount();
            }
        }, 1000)
    },
    beforeUpdate() {
        console.log('>>> beforeUpdate');
        console.log(this.counter);
        console.log(this.$el);
        console.log(document.getElementById('cnt').innerText);
        console.log('<<< beforeUpdate');
    },
    updated() {
        console.log('>>> updated');
        console.log(this.counter);
        console.log(this.$el);
        console.log(document.getElementById('cnt').innerText);
        console.log('<<< updated');
    },
    beforeUnmount() {
        console.log('>>> beforeUnmount');
        console.log(this.counter);
        console.log(this.$el);
        console.log(document.getElementById('cnt'));
        console.log('<<< beforeUnmount');
    },
    unmounted() {
        console.log('>>> unmounted');
        console.log(this.counter);
        console.log(this.$el);
        console.log(document.getElementById('cnt'));
        console.log('<<< unmounted');
    },
}

window.addEventListener('load', init);