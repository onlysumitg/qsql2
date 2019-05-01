<template>
  <div class="page-container">
    <!-- single record -->
    <md-drawer
      :md-right="xtrue"
      :md-fixed="xtrue"
      v-if="showSingleRecord"
      :md-active.sync="showSingleRecord"
    >
      <div v-if="(alertMessage.length > 0)" style="max-width:600px;padding:15px">
        Query :
        <strong>
          <p>{{this.sqlToRun}}</p>
        </strong>

        <hr>

        <div v-html="alertMessage"></div>

        <hr>

        <md-button @click="alertMessage=''">close</md-button>
        <hr>
      </div>
      <!--------- next section ---------------->

      <div class="md-layout" style="min-width:400px; margin:10px">
        <div class="md-layout-item" style="min-width=500px">
          <md-toolbar class="md-transparent" md-elevation="0">
            <div class="md-toolbar-section-start">
              <md-button class="md-fab md-dense" @click="buildInsertSQL()">
                <md-icon>done</md-icon>
              </md-button>
            </div>
            <span class="md-title">Add Record</span>
            <div class="md-toolbar-section-end"></div>
          </md-toolbar>
          <md-progress-bar v-if="loading" class="md-accent" md-mode="indeterminate"></md-progress-bar>

          <table
            class="i-table table table-sm table-hover"
            style="min-width:400px;"
            :id="processId"
          >
            <tbody>
              <tr v-for="(col,n) in actualCoumns" :key="'cc'+n" @dblclick="setCurrentColumn(col)">
                <td>
                  <Strong>{{col.label}}</Strong>
                  <!-- <span v-if="col.modified">**</span> -->
                  <!-- <div class="md-caption" v-if="col.label != col.name">[{{col.name.trim()}}]</div> -->
                  <div
                    class="md-caption"
                    v-if="col.label != col.shortFieldName"
                  >[{{col.shortFieldName.trim()}}]</div>

                  <div class="md-caption">
                    [{{col.type.trim()}}] [ {{col.precision}}
                    <span
                      v-if="col.scale>0"
                    >, {{col.scale}}</span>
                    ]
                    <br>
                    <span v-if="multiTable">[{{col.libName.trim()}}/{{col.tableName.trim()}}]</span>
                    <!-- <span v-else class="md-caption">-</span> -->
                  </div>
                </td>
                <!-- need to make a function ??? -->
                <!-- <td>{{row[col.label+'_'+col.id].substring(0,50)}}</td> -->
                <td>
                  <div class="input-group">
                    <input
                      v-if="col.precision < 80"
                      type="text"
                      class="form-control"
                      aria-describedby="basic-addon2"
                      v-model="row[col.rowKey]"
                      :style="[{minWidth:'500px'}]"
                      :maxlength="getMaxLength(col)"
                    >
                    <textarea
                      v-else
                      class="form-control"
                      rows="5"
                      v-model="row[col.rowKey]"
                      cols="50"
                      :maxlength="getMaxLength(col)"
                    ></textarea>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </md-drawer>

    <!-- end single record -->
    <md-snackbar md-position="left" :md-duration="Infinity" :md-active.sync="showMessage">
      <span>{{mainMessage}}</span>
      <md-button class="md-primary" @click="showMessage = false">Close</md-button>
    </md-snackbar>
  </div>
</template>
<script>
export default {
  components: {},

  updated() {},

  computed: {
    actualCoumns: function() {
      var vm = this;
      //console.log(this.columns);
      return _.filter(this.columns, function(col) {
        return col.visible == true;
      });
    }
    //---------------------------------
    //---------------------------------
  },
  watch: {
    showSingleRecord: function(newval) {
      console.log(
        "showSingleRecord :: " + newval + " :: " + this.showSingleRecord
      );
    }
  },
  //------------------------------------------------------------
  methods: {
    //-----------------------------------------
    getMaxLength(col) {
      var length = col.precision;
      if (col.scale > 0) {
        length += 1;
      }
      //  alert(length);
      return length;
    },
    //--------------------------------------

    updateFormData(key, event) {
      //alert(key + " : " + this.row[key]);
      var index = Object.keys(this.row).indexOf(key);
      //alert(index);
      this.row[key] = event.target.value;
    },
    //--------------------------------------------
    initialize() {
      this.alertMessage = "";
    },
    //-------------------------------------------
    buildInsertSQL() {
      var vm = this;
      var insertSQL =
        "insert into " + this.tableLib.trim() + "/" + this.table.trim();

      var columneNames = "";
      var coma = "";
      _.forEach(this.actualCoumns, function(col) {
        columneNames += coma + col.shortFieldName.trim();
        coma = ",";
      });
      insertSQL += " (" + columneNames + ")";
      insertSQL += " values(";

      var columneValues = "";
      coma = "";
      _.forEach(this.actualCoumns, function(col) {
        columneValues +=
          coma + "'" + vm.row[col.label + "_" + col.id].trim() + "'";
        coma = ",";
      });
      insertSQL += columneValues.trim() + ")";
      this.sqlToRun = insertSQL;
      this.runSQL(false);
      console.log(insertSQL);
    },
    //---------------------------------------------
    getInputWidth(chars) {
      //alert(charCount * 20);
      var charCount = chars.length;
      if (charCount <= 3) {
        charCount = 5;
      }
      return charCount * 7 + 24;
    },
    //---------------------------------------------
    getColumns(chars) {
      //alert(charCount * 20);
      var charCount = chars.trim().length / 5;
      return 500;
      return charCount * 5;
    },
    //--------------------------------------------------------
    setupListeners() {
      eventBus.$on("runsql3SingleRecordInsert", data => {
        this.alertMessage = "";
        this.columns = data.columns;
        this.row = data.row;
        this.table = data.table;
        this.tableLib = data.tableLib;
        this.serverid = data.serverid;
        this.showSingleRecord = true;

        this.processId = data.processId + "_insert";

        if (_.isEmpty(this.row)) {
          this.createBlankRow();
        }
      });

      eventBus.$on("hidesinglerecord3", data => {
        this.showSingleRecord = false;
      });
    },
    //-----------------------------------------------
    turnOffListeners() {
      eventBus.$off("runsql3SingleRecordInsert");
      eventBus.$off("hidesinglerecord3");
    },
    //------------------------------------------------------
    createBlankRow() {
      var vm = this;
      _.forEach(this.actualCoumns, function(col) {
        vm.row[col.label + "_" + col.id] = "";
      });
    },
    //--------------------------------------------------------

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
    setCurrentColumn(column) {
      this.showEditor = true;
      this.currentCol = column;
    },
    //---------------------------------------------

    runSQL: function(newCall = true) {
      if (this.loading) {
        return;
      }
      //this.showMessage = false;
      var vm = this;

      this.runWebService(
        "r/sql3",
        {
          serverId: vm.serverid,
          sql: vm.sqlToRun,
          requestIdToProcess: "",
          requestIdToClose: ""
        },
        function() {
          vm.loading = true;
        },
        function(responce) {
          vm.loading = false;
          switch (responce.data.status) {
            case "s": {
              // vm.alertMessage = responce.data.message;
              var sqldata =
                responce.data.sqldata[Object.keys(responce.data.sqldata)[0]];
              vm.alertMessage = sqldata.error;
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
      currentRecord: 0,
      xtrue: true,
      xfalse: false,
      showSingleRecord: false,

      processId: "",
      table: "",
      tableLib: "",
      multiTable: false,

      columns: [],
      row: {},
      currentCol: {},

      showMessage: false,
      mainMessage: "",
      loading: false,
      serverid: 0,
      sqlToRun: "",
      alertMessage: ""
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
  overflow: visible;
}

.md-table .md-table-content {
  overflow: visible;
}
</style>
