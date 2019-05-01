<template>
  <div class="page-container" style="margin:2px;">
    <md-card md-with-hover v-if="(alertMessage.length > 0)" style="margin:2px;">
      <md-card-header>
        <div class="md-title">{{alertHeading}}</div>
      </md-card-header>

      <md-card-content>
        Query :
        <strong>{{sqldata.sqlOriginal}}</strong>
        <hr>
        <strong>{{sqldata.sql}}</strong>
        <hr>
        <div v-html="alertMessage"></div>
      </md-card-content>

      <md-card-actions>
        <md-button @click="alertMessage=''">close</md-button>
      </md-card-actions>
    </md-card>

    <md-card
      md-with-hover
      v-if="(typeof sqldata.downloadLocation !== 'undefined') && (sqldata.downloadLocation.length > 0)"
    >
      <md-card-header>
        <div class="md-title">File available at following location</div>
      </md-card-header>

      <md-card-content>
        <a :href="'file://'+sqldata.downloadLocation" download="a.xls">{{sqldata.downloadLocation}}</a>
      </md-card-content>

      <md-card-actions>
        <md-button @click="alertMessage=''">close</md-button>
      </md-card-actions>
    </md-card>

    <div>
      <div>
        <md-speed-dial
          v-if="sqldata.canInsert"
          class="md-bottom-right md-fixed md-mini"
          md-direction="top"
          md-event="click"
          style="z-index:6"
        >
          <md-speed-dial-target class="md-primary">
            <md-icon class="md-morph-initial">menu</md-icon>
            <md-icon class="md-morph-final">close</md-icon>
          </md-speed-dial-target>

          <md-speed-dial-content>
            <md-button class="md-fab md-mini" @click="refresh=true;runSQL(true)">
              <md-icon>refresh</md-icon>
            </md-button>

            <md-button class="md-fab md-mini" @click="addRecord(-1)">
              <md-icon>add</md-icon>
            </md-button>
          </md-speed-dial-content>
        </md-speed-dial>

        <!-- sdddddddddddddddddddd -->
        <md-button v-else class="md-fab md-fab-bottom-right md-fixed md-mini" @click="runSQL(true)">
          <md-icon>refresh</md-icon>
        </md-button>
      </div>
      <table
        :id="sqldata.processId"
        class="table i-table table-striped table-bordered table-sm table-hover"
      >
        <thead>
          <tr>
            <th class="stickyHead" v-if="columns.length>0">#</th>
            <th class="stickyHead" v-if="columns.length>0 && sqldata.canInsert">Edit</th>
            <th class="stickyHead" v-if="columns.length>0 && sqldata.canInsert">Copy</th>
            <th class="stickyHead" v-if="columns.length>0 && sqldata.canInsert">Delete</th>

            <th
              class="stickyHead"
              v-for="(col,indx) in columns"
              v-if="isColumnVisible(indx)"
              :key="'c'+indx"
            >
              {{col.label.trim()}}
              <!-- <span v-if="col.label.trim()!=col.name.trim()" class="md-caption">
                <br>
                [{{col.name.trim()}}]
              </span>-->
              <span v-if="col.label.trim()!=col.shortFieldName.trim()" class="md-caption">
                <br>
                [{{col.shortFieldName.trim()}}]
              </span>
              <span v-else>
                <br>&nbsp;
              </span>
              <span v-if="sqldata.multiTable && col.tableName.trim().length >0 " class="md-caption">
                <br>
                [{{col.libName.trim()}}/{{col.tableName.trim()}}]
              </span>
              <span
                v-if="sqldata.multiTable && col.tableName.trim().length <=0 "
                class="md-caption"
              >
                <br>-
              </span>
            </th>
          </tr>
        </thead>

        <!-- data -->
        <tbody>
          <results2multiRecordItem
            v-for="(row,indx) in rows"
            :key="'c'+indx"
            :dataRow="row"
            :sqldata="sqldata"
            :dataRowIndex="indx"
            :columns="columns"
            :rows="rows"
            :canDuplicate="sqldata.canInsert"
            :reload="reloadScreen"
            :masterId="sqldata.processId"
          ></results2multiRecordItem>
        </tbody>
      </table>

      <div class="md-caption">{{endOfData}}</div>
    </div>

    <md-progress-bar class="md-accent" v-if="loading" md-mode="indeterminate"></md-progress-bar>
  </div>
</template>
<script>
import results2multiRecordItem from "./results2multiRecordItem";

export default {
  components: {
    results2multiRecordItem
  },
  props: {
    initialData: {
      type: Object,
      required: false
    }
  },
  created() {
    //alert("okk1");
    var vm = this;
    window.addEventListener(
      "scroll",
      () => {
        //  alert("okk");
        vm.bottom = vm.bottomVisible();
      },
      { passive: true }
    );
  },
  destroyed() {
    // try {
    //   this.table.remove();
    // } catch (e) {}
  },
  updated() {
    //alert(this.sqldata.processId);
    // try {
    //   this.table.remove();
    // } catch (e) {}
    // try {
    //   var filename = this.sqldata.heading;
    //   this.table = TableExport(
    //     document.getElementById(this.sqldata.processId),
    //     {
    //       position: "top",
    //       filename: filename,
    //       ignoreCols: 0
    //     }
    //   );
    // } catch (e) {
    //   console.log(e);
    // }
  },
  computed: {
    //---------------------------------
    endOfData: function() {
      if (!this.hasMoreData) {
        return "End of Data.";
      }
      return "";
    }

    //---------------------------------
  },
  watch: {
    bottom: function(bottom) {
      if (bottom && this.hasMoreData && this.sqldata.sqlOriginal.length > 0) {
        this.runSQL(false);
      }
    }
  },

  methods: {
    initialize() {
      this.sqldata = this.initialData;
      this.rows = this.initialData.data;
      this.columns = this.initialData.columns;
      this.hasMoreData = this.initialData.hasMoreData;
      this.alertMessage = this.initialData.error;
      //alert(this.sqldata.processId);
      try {
        this.table.remove();
      } catch (e) {}
    },

    //--------------------------------------------------------
    setupListeners() {
      eventBus.$on(this.sqldata.processId + "runsql3SingleRecordData", data => {
        this.setCurrentRecord(data.currentRecord);
      });
    },
    //-----------------------------------------------
    turnOffListeners() {
      eventBus.$off(this.sqldata.processId + "runsql3SingleRecordData");
    },

    //--------------------------------------------
    //---------------------------------------------
    setCurrentRecord(val) {
      //alert(val);
      var data = {};
      data.rows = this.rows;

      this.currentRecord = val;
      if (this.currentRecord <= 0) {
        this.currentRecord = 0;
      }
      if (this.currentRecord >= data.rows.length) {
        this.currentRecord = data.rows.length - 1;
      }

      data.processId = this.sqldata.processId;
      data.rows = this.rows;
      data.columns = this.columns;
      data.currentRecord = this.currentRecord;
      data.multiTable = this.sqldata.multiTable;

      eventBus.$emit("runsql3SingleRecordData", data);
    },
    //---------------------------------------------

    isColumnVisible(index) {
      try {
        if (this.columns[index].visible == true) {
          return true;
        }
      } catch (e) {
        return true;
      }
      return false;
    },
    //---------------------------------------------

    isColumnEditable(index) {
      try {
        if (this.columns[index].editable == true) {
          return true;
        }
      } catch (e) {
        return true;
      }
      return false;
    },
    //---------------------------------------------
    download(tableid) {
      // console.log(tableid);
      // var table = TableExport(document.getElementById(tableid), {
      //   position: "top",
      //   bootstrap: "false"
      // });
      // console.log(table);
    },

    //---------------------------------------------
    //---------------------------------------------
    addRecord(val) {
      //alert(val);

      var data = {};
      var rows = this.sqldata.data;
      data.processId = this.sqldata.processId;
      data.row = {};
      if (val >= 0) {
        data.row = _.cloneDeep(rows[val]);
      }

      data.table = this.sqldata.tableName;
      data.tableLib = this.sqldata.tableLib;
      data.columns = this.columns;

      data.serverid = this.sqldata.serverId;

      eventBus.$emit("runsql3SingleRecordInsert", data);
    },
    //---------------------------------------------

    //---------------------------------------------
    bottomVisible() {
      const scrollY = window.scrollY;
      const visible = document.documentElement.clientHeight;
      const pageHeight = document.documentElement.scrollHeight - 100;
      const bottomOfPage = visible + scrollY >= pageHeight;
      return bottomOfPage || pageHeight < visible;
      // return this.bottom;
    },
    //-------------------------------------------------------
    runSQL: function(newCall = true) {
      if (this.loading) {
        return;
      }

      this.loading = true;
      this.showMessage = false;
      var vm = this;
      if (newCall) {
        vm.alertMessage = "";
        vm.rows = {};
        vm.sqldata.processId = "";
        // vm.sqldata = {};
        vm.sqldata.downloadLocation = "";
        vm.sqldata.columns = {};
        vm.sqldata.data = {};
        vm.columns = {};
      }
      //

      this.runWebService(
        "r/sql3",
        {
          serverId: vm.sqldata.serverId,
          sql: vm.sqldata.sqlOriginal,
          requestIdToProcess: vm.sqldata.processId,
          requestIdToClose: ""
        },
        function() {
          vm.loading = true;
          if (newCall) {
            vm.alertMessage = "";
            vm.rows = {};
            vm.sqldata = {};
            //  eventBus.$emit("reloadSQLDATA", true);
          }
        },
        function(responce) {
          vm.loading = false;
          vm.requestIdToClose = "";
          vm.requestIdToProcess = "";
          //  alert("kkk;");
          //  console.log("KK: ");
          //  console.log("KK: " + Object.keys(responce.data.sqldata)[0]);

          vm.sqldata =
            responce.data.sqldata[Object.keys(responce.data.sqldata)[0]];

          eventBus.$emit("updateHistorySQL", true);
          console.log("vm.sqldata.data " + vm.sqldata.data.length);

          switch (vm.sqldata.status) {
            case "s": {
              vm.columns = vm.sqldata.columns;
              // console.log("vm.sqldata.data.length " + vm.sqldata.data.length);

              if (vm.rows.length > 0) {
                vm.rows = vm.rows.concat(vm.sqldata.data);
              } else {
                vm.rows = vm.sqldata.data;
              }

              /// check if it has more fata
              if (vm.sqldata.data.length <= 0) {
                vm.hasMoreData = false;
              } else {
                vm.hasMoreData = vm.sqldata.hasMoreData;
              }

              vm.requestIdToProcess = responce.data.requestId;
              vm.alertMessage = vm.sqldata.error;

              break;
            } // end sucess
            case "e": {
              vm.alertMessage = vm.sqldata.error;
              vm.hasMoreData = false;
              break;
            }

            case "u": {
              vm.alertMessage = vm.sqldata.error;
              vm.hasMoreData = false;
              break;
            }
            default: {
              vm.alertMessage = "Somthing is not right";
              vm.hasMoreData = false;
            }
          }

          vm.reloadScreen = true;
        },
        function(error) {
          vm.loading = false;
          vm.requestIdToClose = "";
          vm.requestIdToProcess = "";
          vm.hasMoreData = false;
        }
      );
    }
  },

  //-------------------------------------------------------
  //-------------------------------------------------------
  data() {
    return {
      sqlToRun: "",
      rightMClass: ["modal", "right", "fade"],
      currentRecord: 0,
      reloadScreen: true,
      refresh: false,

      sqldata: [],
      columns: [],
      rows: [],
      currentCol: {},

      loading: false,
      animate: true,

      alertMessage: "",
      alertHeading: "",
      showMessage: false,
      mainMessage: "",
      requestIdToProcess: "",
      requestIdToClose: "",
      bottom: false,
      hasMoreData: true,
      editorValue: "",
      table: {},
      modifiedDatas: [],
      modifiedData: {
        rrn: 0,
        row: 0,
        column: "",
        oldValue: "",
        newValue: ""
      }
    };
  }
};
</script>

<style lang="scss" scoped>
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
  overflow: auto;
}

.i-table2 {
  white-space: nowrap;
  overflow: auto;
  position: sticky;
}

.md-table .md-table-content {
  overflow: auto;
}

.stickyHead {
  position: sticky;
  background-color: #cfe3fa;
  top: 0;
  z-index: 7;
}
</style>
