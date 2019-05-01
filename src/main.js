// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable */
import "./bootstrap";
import Vue from 'vue'
import App from './App'
import router from './router'
import * as monaco from 'monaco-editor'
import vueAceEditor from "vue2-ace-editor";
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import 'material-icons/iconfont/material-icons.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import VueSelect from 'vue-cool-select'

Vue.use(VueSelect, {
  theme: 'bootstrap' // or 'material-design'
})
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faTrashAlt
} from "@fortawesome/free-solid-svg-icons";
import {
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import {
  faAngleLeft
} from "@fortawesome/free-solid-svg-icons";
import {
  faAngleRight
} from "@fortawesome/free-solid-svg-icons";

import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText
} from "@fortawesome/vue-fontawesome";

library.add(faSpinner, faTrashAlt, faAngleRight, faAngleLeft);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("font-awesome-layers", FontAwesomeLayers);
Vue.component("font-awesome-layers-text", FontAwesomeLayersText);


Vue.config.productionTip = false

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css' // This line here

Vue.use(VueMaterial)

Vue.use(BootstrapVue);
import {
  AppMixin
} from "./AppMixin.js";

import VueSessionStorage from "vue-sessionstorage";
Vue.mixin(AppMixin);

Vue.use(VueSessionStorage);

window.eventBus = new Vue();

Vue.component("codeeditor", vueAceEditor);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {
    App
  },
  template: '<App/>'
})

window.monaco = monaco

let topTitle = new Vue({
  el: "#topTitle",
  data: {
    title: "QSQL"
  },


  methods: {
    initialize() {
      this.title = this.$session.get("currentservername");

    },

    setupListeners() {

      eventBus.$on("updatetitle", data => {
        // alert(data);
        this.title = data;

        if (this.title.trim() === "") {
          this.title = "QSQL"
        }
      });


    },
    //-----------------------------------------------
    turnOffListeners() {

      eventBus.$off("updatetitle");
      this.title = "QSQL"
    },

  }
});
