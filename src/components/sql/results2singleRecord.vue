<template>
  <div class="page-container">
    <!-- single record -->
    <md-drawer
      :md-right="xtrue"
      :md-fixed="xtrue"
      v-if="showSingleRecord"
      :md-active.sync="showSingleRecord"
    >
      <div class="md-layout" style="min-width:400px; margin:10px">
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

          <table
            class="i-table table table-sm table-hover"
            style="min-width:400px;"
            :id="processId"
          >
            <tbody>
              <tr v-for="(col,n) in columns" :key="'cc'+n" @dblclick="setCurrentColumn(col)">
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
                <td>
                  <!-- {{rows[currentRecord][col.label+'_'+col.id].substring(0,50)}} -->
                  <div class="input-group">
                    <input
                      v-if="col.precision < 80"
                      type="text"
                      class="form-control"
                      aria-describedby="basic-addon2"
                      v-model="rows[currentRecord][col.label+'_'+col.id]"
                      :style="[{minWidth:'500px'}]"
                      :maxlength="getMaxLength(col)"
                      disabled
                    >
                    <textarea
                      v-else
                      class="form-control"
                      rows="5"
                      v-model="rows[currentRecord][col.label+'_'+col.id]"
                      cols="50"
                      :maxlength="getMaxLength(col)"
                      disabled
                    ></textarea>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md-layout-item" v-show="showEditor" style="min-height:600px;">
          <md-toolbar class="md-transparent" md-elevation="0">
            <span class="md-title">{{currentCol.label}}</span>
            <md-button v-if="currentCol.editable" @click="updateColumn()">save</md-button>

            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button md-dense" @click="showEditor=false">
                <md-icon>close</md-icon>
              </md-button>
            </div>
          </md-toolbar>

          <codeeditor
            id="editor2"
            ref="editor2"
            v-model="editorValue2"
            @init="editorInit"
            :lang="editorLang"
            :options="editorOptions"
            theme="crimson_editor"
            width="600px"
            height="90%"
          ></codeeditor>
          <!-- <div id="idataeditor" style="width:600px;height:800px;border:1px solid #ccc"></div> -->
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
import * as monaco3 from "monaco-editor";

export default {
  components: {},

  updated() {
    //alert(this.processId);
    // try {
    //   this.table.remove();
    // } catch (e) {}
    // try {
    //   this.table = TableExport(document.getElementById(this.processId), {
    //     position: "top"
    //   });
    // } catch (e) {
    //   console.log(e);
    // }
  },

  computed: {
    //---------------------------------
    editorValue2: {
      get: function() {
        this.editorLang = "xml";
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

          var curVal = this.rows[this.currentRecord][
            this.currentCol.label + "_" + this.currentCol.id
          ];
          if (this.IsValidJSONString(curVal)) {
            this.editorLang = "json";
            return vkbeautify.json(curVal);
          }
          return this.rows[this.currentRecord][
            this.currentCol.label + "_" + this.currentCol.id
          ];
        } catch (e) {
          console.log(e);
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
    showSingleRecord: function(newval) {
      console.log(
        "showSingleRecord :: " + newval + " :: " + this.showSingleRecord
      );
    },

    showEditor: function(newValue) {
      // if (newValue) {
      //   this.monacoEditor = monaco3.editor.create(
      //     document.getElementById("idataeditor"),
      //     {
      //       value: "SELECT * FROM AFF_XMLLOG",
      //       language: "sql",
      //       automaticLayout: true,
      //       wordWrap: "on",
      //       minimap: {
      //         enabled: false
      //       }
      //     }
      //   );
      // }
    }
  },
  //------------------------------------------------------------
  methods: {
    initialize() {},

    //-----------------------------------------
    getMaxLength(col) {
      var length = col.precision;
      if (col.scale > 0) {
        length += 1;
      }
      //  alert(length);
      return length;
    },
    //-------------------------------------------
    IsValidJSONString(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    },
    //--------------------------------------------------------
    setupListeners() {
      eventBus.$on("runsql3SingleRecordData", data => {
        this.columns = data.columns;
        this.rows = data.rows;
        this.currentRecord = data.currentRecord;
        this.showSingleRecord = true;
        this.multiTable = data.multiTable;
        this.processId = data.processId + "_sing";
      });

      eventBus.$on("hidesinglerecord3", data => {
        (this.showEditor = false), (this.showSingleRecord = false);
      });
    },
    //-----------------------------------------------
    turnOffListeners() {
      eventBus.$off("runsql3SingleRecordData");
      eventBus.$off("hidesinglerecord3");
    },

    //--------------------------------------------------------
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
          field: vm.currentCol.name,
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

    //----------------------------------------------
    editorInit: function() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/xml");
      require("brace/mode/json");
      require("brace/theme/crimson_editor");
      require("brace/snippets/javascript"); //snippet
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
      this.showEditor = true;
      this.currentCol = column;
    }
    //---------------------------------------------
  },

  data() {
    return {
      editorLang: "xml",
      monacoEditor: "",
      currentRecord: 0,
      xtrue: true,
      xfalse: false,
      showSingleRecord: false,
      showEditor: false,
      processId: "",
      table: "",

      multiTable: false,

      columns: [],
      rows: [],
      currentCol: {},

      showMessage: false,
      mainMessage: "",

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
