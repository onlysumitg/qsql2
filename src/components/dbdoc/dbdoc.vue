<template>
  <div style="padding:10px">
    <div class="row">
      <div class="col-sm">
        <form novalidate class="md-layout">
          <md-field>
            <label>Table Name</label>
            <md-input required v-model="tableName"></md-input>
          </md-field>

          <md-field>
            <label>Library</label>
            <md-input required v-model="tableLib"></md-input>
          </md-field>

          <md-field>
            <label>Field/Column</label>
            <md-input required v-model="columneName"></md-input>
          </md-field>
          <md-field>
            <label>Text</label>
            <md-input required v-model="searchText"></md-input>
          </md-field>

          <md-button @click="emitSQLToRun2('ff')" class="md-primary">Search</md-button>
        </form>
      </div>
      <div class="col-sm"></div>
    </div>
    <div class="row">
      <div class="col-sm">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "dbdoc",
  components: {},

  methods: {
    initialize() {},
    loadScreen() {},

    //-------------------------------------
    //---------------------------------------------------
    emitSQLToRun2(sqltoRun) {
      //alert("ok");
      var sqldata3 = {};
      sqldata3.serverId = this.$session.get("currentserver");
      sqldata3.requestIdToProcess = "";
      sqldata3.requestIdToClose = "";

      sqldata3.sqlsqlToRun =
        "@dbdoc " +
        this.tableLib.toString() +
        " / " +
        this.tableName.toString() +
        " / " +
        this.columneName.toString() +
        " / " +
        this.searchText.toString();

      eventBus.$emit("runsql3", sqldata3);
    }
    //-------------------------------------

    //--------------------------------------
  },
  data() {
    return {
      tableName: "",
      tableLib: "",
      columneName: "",
      searchText: ""
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.IZ-select {
  min-width: 150px;
}
</style>
