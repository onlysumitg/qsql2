export const AppMixin = {
  beforeMount() {
    this.turnOffListeners();
  },
  mounted() {
    this.initialize();
    this.setupListeners();

  },
  beforeDestroy() {
    this.turnOffListeners();
  },
  deactivated() {
    this.turnOffListeners();
  },

  methods: {
    initialize() {},
    setupListeners() {},
    turnOffListeners() {},

    setupAxios() {
      // const sToken =  window.$cookies.get("QSQL_TOKEN");
      const sToken = this.$session.get("QSQL_TOKEN");

      axios.defaults.headers.common = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: sToken
      };

      return true;
    },

    runWebService(url, params, beforeRun, onSucess, onError) {
      //      alert("ok3");
      if (this.setupAxios()) {
        beforeRun();
        if (axios.defaults.baseURL == undefined) {
          return;

        }
        axios
          .post(url, params)
          .then(response => {
            try {
              onSucess(response);
            } catch (e) {
              console.log(url);
              console.log(e);
            }
          })
          .catch(err => {
            //alert(err);
            console.log(err);
            onError(err);
          });
      }
    }
  }
};
