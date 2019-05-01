<template>
  <div class="h-100">
    <md-toolbar class="md-transparent" md-elevation="0">
      <div style="width: 80%;">
        <md-field>
          <label>Search</label>
          <md-input v-model="search"></md-input>
        </md-field>
      </div>
      <div class="md-toolbar-section-end">
        <md-button class="md-icon-button md-dense" @click="loadServerList()">
          <md-icon>refresh</md-icon>
        </md-button>
      </div>
    </md-toolbar>

    <div
      @click="selectServer(server)"
      class="card"
      v-for="server in filteredServerList"
      :key="server.id"
      style="margin:10px"
    >
      <md-ripple>
        <md-card-header>
          <div class="md-body-1">{{server.serverName}}</div>
          <div class="md-subhead">{{server.userName}}@{{server.serverIP}}</div>
        </md-card-header>
        <md-card-content>
          <md-badge
            v-if="server.ssl"
            class="md-square"
            style="margin-right: 10px"
            md-content="SSL"
          />
        </md-card-content>
      </md-ripple>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  data: function() {
    return {
      search: "",
      serverlist: [],
      serverProto: {
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

  computed: {
    filteredServerList() {
      var tempSearch = this.search.toUpperCase();
      if (tempSearch.trim().length == 0) return this.serverlist;

      return this.serverlist.filter(server => {
        return (
          server.serverName.toUpperCase().match(tempSearch) ||
          server.serverIP.toUpperCase().match(tempSearch) ||
          server.userName.toUpperCase().match(tempSearch)
        );
      });
    }
  },
  mounted() {
    // alert("loaded");
    this.loadServerList();
  },

  methods: {
    initialize() {
      this.loadServerList();
    },
    //--------------------------------------------
    selectServer(server) {
      //this.$emit("selectedserver", _.clone(serverProto));
      this.$emit("selectedserver", server);
    },

    //--------------------------------------------
    loadServerList() {
      // alert("this.loaded");
      var vm = this;
      this.runWebService(
        "s/getlist",
        {},
        function() {},
        function(respons) {
          console.log(respons);
          if (respons.data.status == "s") {
            vm.serverlist = [];
            respons.data.servers.forEach(server => {
              vm.serverlist.push(server);
            });
          }
        },
        function(error) {}
      );
    }
  }
};
</script>
<style scoped>
.card:hover {
  background-color: rgb(200, 200, 200);
  color: rgb(255, 255, 255);
}
</style>
