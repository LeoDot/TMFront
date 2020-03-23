import Vue from "vue";
import App from "./App.vue";
import store from "./store";

Vue.config.productionTip = false;

let vue = new Vue({
  store,
  render: h => h(App)
}).$mount("#app");

window.vue = vue;
export default vue;
