<template>
  <div class="page-container">
    <md-card md-with-hover v-if="(alertMessage.length > 0)">
      <md-card-header>
        <div class="md-title">{{alertHeading}}</div>
      </md-card-header>

      <md-card-content>{{alertMessage}}</md-card-content>

      <md-card-actions>
        <md-button @click="alertMessage=''">close</md-button>
      </md-card-actions>
    </md-card>
    <md-progress-bar class="md-accent" v-if="loading" md-mode="indeterminate"></md-progress-bar>

    <!-- <md-empty-state
      v-if="(alertMessage.length <= 0) "
      class="md-accent"
      md-icon="priority_high"
      md-label="Nothing to show"
      md-description="Please run a query to get the results"
    ></md-empty-state>-->
    <!-- <md-tabs md-elevation="1" v-for="(value,key,index) in sqldata" :key="'c'+index">
      <md-tab md-elevation="1" :md-label="value.heading" :id="key">
        <results2multiRecord :initialData="value"></results2multiRecord>
      </md-tab>
    </md-tabs>-->
    <b-tabs>
      <b-tab v-for="(value,key,index) in sqldata" :key="'c'+index" :title="getHeading(value)">
        <!-- {{value.sql}} -->
        <results2multiRecord :initialData="value"></results2multiRecord>
      </b-tab>
    </b-tabs>
    <results2singleRecord></results2singleRecord>
    <results2singleRecordInsert></results2singleRecordInsert>
    <results2singleRecordDelete></results2singleRecordDelete>
  </div>
</template>
<script>
import results2multiRecord from "./results2multiRecord";
import results2singleRecord from "./results2singleRecord";
import results2singleRecordInsert from "./results2singleRecordInsert";
import results2singleRecordDelete from "./results2singleRecordDelete";
export default {
  components: {
    results2multiRecord,
    results2singleRecord,
    results2singleRecordInsert,
    results2singleRecordDelete
  },

  created() {},
  computed: {},
  watch: {},

  methods: {
    setupListeners() {
      eventBus.$on("runsql3ShowSingleRecord", data => {
        this.showSingleRecord = data;
      });

      eventBus.$on("runsql3", data => {
        //alert("okrrrrk");
        eventBus.$emit("hidesinglerecord3", true);

        this.sqlToRun = data.sqlsqlToRun;

        this.editorValue2 = "";

        this.showMessage = false;
        if (this.sqlToRun.trim().length > 0) {
          this.runSQL(
            this.sqlToRun,
            data.serverId,
            data.requestIdToProcess,
            data.requestIdToClose,
            true
          );
        }

        var i = sessionStorage.length;
        // alert(i);
        while (i--) {
          // alert("rrr");
          var key = sessionStorage.key(i);
          if (key.startsWith("tableexport-")) {
            sessionStorage.removeItem(key);
          }
        }
      });
    },
    //-----------------------------------------------
    turnOffListeners() {
      eventBus.$off("runsql3");
    },

    //-----------------------------
    getHeading(sqlResultData) {
      if (
        _.isEmpty(sqlResultData.serverName) ||
        sqlResultData.serverId == this.$session.get("currentserver")
      ) {
        return sqlResultData.heading;
      } else {
        return sqlResultData.serverName.trim() + " >> " + sqlResultData.heading;
      }
    },
    //---------------------------------------------

    runSQL: function(
      sqltorun,
      serverId,
      requestIdToProcess,
      requestIdToClose,
      newCall = true
    ) {
      this.loading = true;
      this.showMessage = false;
      var vm = this;
      this.runWebService(
        "r/sql3",
        {
          // vm.$session.get("currentserver")
          serverId: serverId,
          sql: sqltorun,
          requestIdToProcess: requestIdToProcess,
          requestIdToClose: requestIdToClose
        },
        function() {
          if (newCall) {
            vm.alertMessage = "";
            vm.sqldata = [];
          }
        },
        function(responce) {
          vm.loading = false;
          vm.sqldata = responce.data.sqldata;
          eventBus.$emit("updateHistorySQL", true);

          switch (responce.data.status) {
            case "s": {
              vm.alertMessage = responce.data.message;
              break;
            }
            case "e": {
              vm.alertMessage = responce.data.message;
              vm.hasMoreData = false;
              break;
            }

            case "u": {
              vm.alertMessage = responce.data.message;
              vm.hasMoreData = false;
              break;
            }
          }
        },
        function(error) {
          vm.loading = false;
        }
      );
    }
  },

  data() {
    return {
      sqldata: [],

      animate: true,

      alertMessage: "",
      alertHeading: "",
      showMessage: false,
      mainMessage: "",
      loading: false,
      showSingleRecord: false
    };
  }
};
</script>

<style lang="scss" scoped>
.md-tabs-content {
  overflow: visible;
}

.tdClass {
  white-space: nowrap !important;
  word-wrap: break-word;
}

.tableClasss {
  table-layout: fixed;
  white-space: normal;
}

.whitespace {
  white-space: normal;
}

.vs-sidebar {
  max-width: 600px;
}

.footer-sidebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
}

// Demo purposes only
.md-drawer {
  width: auto;
  //max-width: calc(100vw - 125px);
  background: white;
}
</style>
<style>
.md-overlay {
  background: none;
}

.md-table-head-container {
  height: auto;
  padding: 0%;
}

.i-table {
  white-space: nowrap;
  overflow: visible;
}

.md-table .md-table-content {
  overflow: visible;
}
</style>
