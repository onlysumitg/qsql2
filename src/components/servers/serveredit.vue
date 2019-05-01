<template>
  <div class="h-100">
    <md-card>
      <md-card-header>
        <div class="md-title" style="color:#448aff">Server details</div>
      </md-card-header>

      <md-card-content>
        <form novalidate class="md-layout">
          <md-field>
            <label>Server Name</label>
            <md-input v-model="selectedServerLocal.serverName" id="servername"></md-input>
          </md-field>

          <md-field md-inline>
            <label>Server IP</label>
            <md-input v-model="selectedServerLocal.serverIP" id="serverip"></md-input>
          </md-field>
          <md-switch md-inline v-model="selectedServerLocal.ssl" class="md-primary">SSL</md-switch>

          <md-field>
            <label>User</label>
            <md-input v-model="selectedServerLocal.userName" id="serveruser"></md-input>
          </md-field>

          <md-field>
            <label>Password</label>
            <md-input v-model="selectedServerLocal.password" type="password" required></md-input>
          </md-field>
        </form>
      </md-card-content>

      <md-card-actions>
        <md-button class="md-accent" @click="clearServers">Clear</md-button>
        <md-button class="md-accent" @click="deleteServers">Delete</md-button>
        <md-button :disabled="processing" @click="saveServers" class="md-primary">
          <md-progress-spinner
            v-show="processing"
            :md-diameter="12"
            :md-stroke="2"
            md-mode="indeterminate"
          ></md-progress-spinner>Connect
        </md-button>
      </md-card-actions>
    </md-card>

    <div v-if="showError" class="alert alert-danger" role="alert">{{errorMessage}}</div>
  </div>
</template>
<script>
export default {
  props: {
    selectedServer: {
      type: Object,
      required: false
    }
  },
  data: function() {
    return {
      processing: false,
      showError: false,
      errorMessage: "",
      selectedServerLocal: {
        id: 0,
        serverName: "",
        serverIP: "",
        userName: "",
        password: "",
        ssl: false,
        libl: new Array(20),
        modified: false
      }
    };
  },

  //=====================================

  watch: {
    selectedServer(newV) {
      this.selectedServerLocal = _.clone(newV);
    }
  },
  //=====================================
  methods: {
    saveServers() {
      this.showError = false;
      this.errorMessage = "";
      var vm = this;
      this.runWebService(
        "s/test",
        vm.selectedServerLocal,
        function() {
          vm.processing = true;
        },
        function(respons) {
          console.log(respons);
          vm.processing = false;
          if (respons.data.status == "s") {
            // go to next screen
            vm.selectedServerLocal.id = respons.data.id;
            vm.$session.set("currentserver", respons.data.id);
            vm.$session.set(
              "currentservername",
              vm.selectedServerLocal.serverName
            );
            eventBus.$emit("updatetitle", vm.selectedServerLocal.serverName);

            // setTimeout(function() {
            //   vm.getAutoCompleteData();
            // }, 5000);
            vm.$router.push({
              path: "/sql"
            });
          } else {
            vm.showError = true;
            vm.errorMessage = respons.data.message;
          }
        },
        function(error) {
          vm.processing = false;
          vm.showError = true;
          vm.errorMessage = "" + error;
        }
      );
    },
    getAutoCompleteData() {
      var vm = this;
      this.runWebService(
        "r/autoc",
        { serverId: vm.selectedServerLocal.id },
        function() {},
        function(respons) {
          console.log(respons);
          if (respons.data.status == "s") {
            // reload the list
          }
        },
        function(error) {}
      );
    },

    //------------------------------------------------------------
    clearServers() {
      // this.selectedServer = _.clone(this.selectedServer);
      this.selectedServerLocal.id = 0;
      this.selectedServerLocal.serverName = "";
      this.selectedServerLocal.serverIP = "";
      this.selectedServerLocal.userName = "";
      this.selectedServerLocal.password = "";
      this.selectedServerLocal.ssl = false;
      this.selectedServerLocal.libl = new Array(20);
      this.selectedServerLocal.modified = false;
    },

    //--------------------------------------------------------------
    deleteServers() {
      var vm = this;
      this.runWebService(
        "s/delete",
        vm.selectedServerLocal,
        function() {},
        function(respons) {
          console.log(respons);
          if (respons.data.status == "s") {
            // reload the list
          }
        },
        function(error) {}
      );
    }
  }
};
</script>




<style>
.checkbox-custom {
  display: none;
}

.checkbox-custom-label {
  display: inline-block;
  position: relative;
  vertical-align: middle;
  margin: 5px;
  cursor: pointer;
}

.checkbox-custom + .checkbox-custom-label:before {
  content: "";
  background: #fff;
  border-radius: 5px;
  border: 1px solid #ddd;
  display: inline-block;
  vertical-align: middle;

  width: 24px;
  height: 24px;
  padding: 2px;
  margin-right: 10px;
}

.checkbox-custom:checked + .checkbox-custom-label:after {
  content: "";
  padding: 2px;
  position: absolute;
  width: 12px;
  height: 25px;
  border: solid #53bafc;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
  top: -6px;
  left: 10px;
}

.content-container {
  padding: 8px 10px;
  display: flex;
}
</style>
