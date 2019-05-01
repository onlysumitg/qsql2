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

    <md-empty-state
      v-if="(alertMessage.length <= 0) && (columns.length<=0)"
      class="md-accent"
      md-icon="priority_high"
      md-label="Nothing to show"
      md-description="Please run a query to get the results"
    ></md-empty-state>

    <!-- <b-table hover :items="rows" :small="true" :foot-clone="true" :bordered="true" :outlined="true" :tbodyTrClass="nowrapclass"
      :theadTrClass="nowrapclass2" :tfootTrClass="nowrapclass2">


    </b-table>-->
    <div>
      <table class="i-table table table-striped table-bordered table-sm table-hover">
        <thead>
          <tr>
            <th v-if="columns.length>0">#</th>
            <th v-for="(col,indx) in columns" v-if="isColumnVisible(indx)" :key="'c'+indx">
              {{col.label.trim()}}
              <span
                v-if="col.label.trim()!=col.name.trim()"
                class="md-caption"
              >[{{col.name.trim()}}]</span>
            </th>
          </tr>
        </thead>
        <!-- data -->
        <tbody>
          <tr
            md-selectable="single"
            class="md-primary"
            @dblclick="setCurrentRecord(indx),modalShow2 = true,modalShow3 = false"
            v-for="(row,indx) in rows"
            :key="'c'+indx"
          >
            <td>{{indx+1}}</td>
            <td
              v-for="(valx,indxx, colIndx) in row"
              v-if="isColumnVisible(colIndx)"
              :key="'r'+indxx"
            >{{valx}}</td>
          </tr>
        </tbody>
      </table>

      <div class="md-caption">{{endOfData}}</div>
    </div>

    <md-progress-bar class="md-accent" v-if="loading" md-mode="indeterminate"></md-progress-bar>

    <!-- single record -->
    <md-drawer :md-right="xtrue" :md-fixed="xtrue" v-if="modalShow2" :md-active.sync="modalShow2">
      <div class="md-layout">
        <div class="md-layout-item" style="min-width=500px">
          <md-toolbar class="md-transparent" md-elevation="0">
            <div class="md-toolbar-section-start">
              <md-button class="md-icon-button md-dense" @click="setCurrentRecord(currentRecord-1)">
                <md-icon>keyboard_arrow_left</md-icon>
              </md-button>
            </div>
            <span class="md-title">#{{currentRecord+1}}</span>
            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button md-dense" @click="setCurrentRecord(currentRecord+1)">
                <md-icon>keyboard_arrow_right</md-icon>
              </md-button>
            </div>
          </md-toolbar>

          <table class="i-table table table-sm table-hover">
            <tbody>
              <tr v-for="(col,n) in columns" :key="'cc'+n" @dblclick="setCurrentColumn(col)">
                <td>
                  {{col.label}}
                  <!-- <span v-if="col.modified">**</span> -->
                  <div class="md-caption" v-if="col.label != col.name">[{{col.name.trim()}}]</div>
                  <div class="md-caption">
                    [{{col.type.trim()}}] [ {{col.precision}}
                    <span v-if="col.scale>0">,{{col.scale}}</span> ]
                  </div>
                </td>
                <!-- need to make a function ??? -->
                <td>{{rows[currentRecord][col.label+'_'+col.id].substring(0,50)}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md-layout-item" v-if="modalShow3">
          <md-toolbar class="md-transparent" md-elevation="0">
            <span class="md-title">{{currentCol.label}}</span>
            <md-button v-if="currentCol.editable" @click="updateColumn()">save</md-button>

            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button md-dense" @click="modalShow3=false">
                <md-icon>close</md-icon>
              </md-button>
            </div>
          </md-toolbar>

          <codeeditor
            id="editor2"
            ref="editor2"
            v-model="editorValue2"
            @init="editorInit"
            lang="xml"
            :options="editorOptions"
            theme="crimson_editor"
            width="600px"
            height="100%"
          ></codeeditor>
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

  created() {
    //alert("okk1");
    var vm = this;
    window.addEventListener("scroll", () => {
      //  alert("okk");
      // console.log("> " + vm.bottomVisible());
      vm.bottom = vm.bottomVisible();
    });
  },
  computed: {
    //---------------------------------
    endOfData: function() {
      if (!this.hasMoreData) {
        return "End of Data.";
      }
      return "";
    },

    //---------------------------------
    editorValue2: {
      get: function() {
        if (this.currentCol.type === undefined) {
          return "";
        }
        try {
          if (this.currentCol.type.toUpperCase() == "XML") {
            return vkbeautify.xml(
              this.rows[this.currentRecord][
                this.currentCol.label + "_" + this.currentCol.id
              ]
            );
          }
          return this.rows[this.currentRecord][
            this.currentCol.label + "_" + this.currentCol.id
          ];
        } catch (e) {
          return "";
        }
      },
      set: function(newValue) {
        console.log(newValue + " ::xx ");
        try {
          this.editorValue2Val = newValue;
          if (this.currentCol.editable) {
            this.currentCol.modified = true;
            this.rows[this.currentRecord]["MDT_X___2"] = "Y";
          }
        } catch (e) {
          console.log(e);
          this.currentCol.modified = false;
        }
      }
    }
    //---------------------------------
  },
  watch: {
    bottom: function(bottom) {
      if (bottom && this.hasMoreData && this.sqlToRun.length > 0) {
        this.runSQL(this.sqlToRun, false);
      }
    }
  },

  methods: {
    updateColumn() {
      this.showMessage = false;
      if (!this.currentCol.editable || !this.currentCol.modified) {
        console.log("Not allowed to edit this value");
        return;
      }

      var vm = this;
      this.runWebService(
        "r/sqlupdate",
        {
          serverId: vm.currentCol.serverid,
          field: vm.currentCol.field,
          table: vm.currentCol.tableName,
          lib: vm.currentCol.libName,
          value: vm.editorValue2Val,
          rrn: vm.rows[this.currentRecord]["RRN_X___1"]
        },
        function() {},
        function(responce) {
          vm.showMessage = true;
          switch (responce.data.status) {
            case "s": {
              try {
                vm.rows[vm.currentRecord][
                  vm.currentCol.label + "_" + vm.currentCol.id
                ] = vm.editorValue2Val;

                vm.currentCol.modified = false;
              } catch (e) {
                console.log(e);
              }
              vm.mainMessage = responce.data.sqldata.error.substring(0, 100);

              break;
            } // end sucess
            case "e": {
              vm.mainMessage = responce.data.sqldata.error.substring(0, 100);
              break;
            }

            case "u": {
              vm.mainMessage = responce.data.sqldata.error.substring(0, 100);
              break;
            }
            default: {
              vm.mainMessage = "Somthing is not right";
            }
          }
        },
        function(error) {}
      );
    },
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

    setupListeners() {
      eventBus.$on("runsql", data => {
        //alert("okrrrrk");
        this.sqlToRun = data;
        this.requestIdToClose = this.requestIdToProcess;
        this.modalShow2 = false;
        this.editorValue2 = "";
        this.editorValue2Val = "";
        this.modalShow3 = false;
        this.requestIdToProcess = "";
        this.hasMoreData = true;
        this.columns = [];
        this.rows = [];
        this.showMessage = false;
        this.currentRecord = 0;
        if (this.sqlToRun.trim().length > 0) {
          this.runSQL(this.sqlToRun);
        }
      });
    },
    //-----------------------------------------------
    turnOffListeners() {
      eventBus.$off("runsql");
    },
    //----------------------------------------------
    editorInit: function() {
      //require("vue2-ace-editor/node_modules/brace/ext/language_tools"); //language extension prerequsite...
      //require("vue2-ace-editor/node_modules/brace/mode/xml");
      //require("vue2-ace-editor/node_modules/brace/mode/json");
      //require("vue2-ace-editor/node_modules/brace/theme/crimson_editor");
      //require("vue2-ace-editor/node_modules/brace/snippets/javascript"); //snippet
    },
    //---------------------------------------------
    setCurrentRecord(val) {
      //alert(val);
      this.currentRecord = val;
      if (this.currentRecord <= 0) {
        this.currentRecord = 0;
      }
      if (this.currentRecord >= this.rows.length) {
        this.currentRecord = this.rows.length - 1;
      }
    },
    //---------------------------------------------
    setCurrentColumn(column) {
      this.modalShow3 = true;
      this.currentCol = column;
    },
    //---------------------------------------------
    bottomVisible() {
      const scrollY = window.scrollY;
      const visible = document.documentElement.clientHeight;
      const pageHeight = document.documentElement.scrollHeight - 400;
      const bottomOfPage = visible + scrollY >= pageHeight;
      return bottomOfPage || pageHeight < visible;
      // return this.bottom;
    },

    runSQL: function(sqltorun, newCall = true) {
      this.showMessage = false;
      var vm = this;
      this.runWebService(
        "r/sql2",
        {
          serverId: vm.$session.get("currentserver"),
          sql: sqltorun,
          requestIdToProcess: vm.requestIdToProcess,
          requestIdToClose: vm.requestIdToClose
        },
        function() {
          vm.loading = true;
          if (newCall) {
            vm.alertMessage = "";
            vm.rows = [];
            vm.sqldata = [];
          }
        },
        function(responce) {
          vm.loading = false;
          vm.requestIdToClose = "";
          vm.requestIdToProcess = "";
          vm.sqldata = responce.data.sqldata;
          eventBus.$emit("updateHistorySQL", true);

          switch (responce.data.status) {
            case "s": {
              vm.columns = responce.data.sqldata.columns;
              //  console.log("vm.rows.length " + vm.rows.length);
              if (vm.rows.length > 0) {
                vm.rows = vm.rows.concat(responce.data.sqldata.data);
              } else {
                vm.rows = responce.data.sqldata.data;
              }
              if (responce.data.sqldata.data.length <= 0) {
                vm.hasMoreData = false;
              }

              vm.requestIdToProcess = responce.data.requestId;

              break;
            } // end sucess
            case "e": {
              vm.alertMessage = responce.data.sqldata.error;
              vm.hasMoreData = false;
              break;
            }

            case "u": {
              vm.alertMessage = responce.data.sqldata.error;
              vm.hasMoreData = false;
              break;
            }
            default: {
              vm.alertMessage = "Somthing is not right";
              vm.hasMoreData = false;
            }
          }
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

  data() {
    return {
      sqlToRun: "",
      rightMClass: ["modal", "right", "fade"],
      currentRecord: 0,
      xtrue: true,
      xfalse: false,
      modalShow2: false,
      modalShow3: false,
      sqldata: [],
      columns: [],
      rows: [],
      currentCol: {},
      nowrapclass: ["text-nowrap", "small"],
      nowrapclass2: ["text-nowrap", "table-primary", "whitespace", "small"],
      loading: false,
      animate: true,
      alertVariant: "md-accent",
      alertMessage: "",
      alertHeading: "",
      showMessage: false,
      mainMessage: "",
      requestIdToProcess: "",
      requestIdToClose: "",
      bottom: false,
      hasMoreData: true,
      editorValue: "",
      editorValue2Val: "",
      editorOptions: {
        minLines: 2000,

        wrap: true,
        autoScrollEditorIntoView: true,
        showPrintMargin: false,

        fontSize: 14,
        showGutter: false,
        behavioursEnabled: true,
        wrapBehavioursEnabled: true,
        useSoftTabs: true,
        foldStyle: "markbeginend"
      },
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
  overflow: visible;
}

.md-table .md-table-content {
  overflow: visible;
}
</style>
