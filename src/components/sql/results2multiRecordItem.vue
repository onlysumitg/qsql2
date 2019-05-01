<template>
  <tr
    md-selectable="single"
    class="md-primary"
    @dblclick="setCurrentRecord(dataRowIndex) "
    :key="'c'+dataRowIndex"
  >
    <td>
      <strong>{{dataRowIndex+1}}</strong>

      <!-- <div>
        <button v-if="this.isModified" type="button" class="btn btn-link btn-sm">Ok</button>
      </div>-->
    </td>
    <td v-if="canDuplicate">
      <button
        class="btn btn-sm"
        data-toggle="button"
        v-if="canDuplicate"
        @click="editThis = !editThis"
        v-bind:class="{'btn-link btn-outline-secondary':!editThis , 'btn-primary':editThis}"
      >
        <i class="fa fa-pen"></i>
      </button>
    </td>
    <td v-if="canDuplicate">
      <button
        class="btn btn-sm btn-link btn-outline-secondary"
        v-if="canDuplicate"
        @click="duplucateRecord(dataRowIndex)"
      >
        <i class="fa fa-clone"></i>
      </button>
    </td>
    <td v-if="canDuplicate">
      <button
        class="btn btn-sm btn-outline-danger"
        v-if="canDuplicate"
        @click="deleteRecord(dataRowIndex)"
      >
        <i class="fa fa-trash-alt"></i>
      </button>
    </td>

    <td v-for="(valx,indxx, colIndx) in dataRow" v-if="isColumnVisible(colIndx)" :key="'r'+indxx">
      <!--  editable values -->
      <div v-if="isColumnEditable(colIndx)" :style="[{width:getInputWidth2(dataRow[indxx])+'px'}]">
        <div class="input-group input-group-sm">
          <input
            v-if="dataRow[indxx].length < 80"
            type="text"
            class="form-control"
            v-bind:class="{'sucessBackground':dataRowSucess[indxx] , 'errorBackground':dataRowError[indxx]}"
            v-model="dataRow[indxx]"
            :style="[{width:getInputWidth(dataRow[indxx])+'px'}]"
            :maxlength="getMaxLength(columns[colIndx])"
            @dblclick.stop
          >
          <textarea
            v-else
            class="form-control"
            rows="5"
            v-bind:class="{'sucessBackground':dataRowSucess[indxx] ,'errorBackground':dataRowError[indxx]}"
            v-model="dataRow[indxx]"
            :cols="getColumns(dataRow[indxx])"
            :maxlength="getMaxLength(columns[colIndx])"
            @dblclick.stop
          ></textarea>
          <span class="input-group-append" v-if="dataRowOriginal[indxx] !=dataRow[indxx]">
            <button class="btn btn-primary" type="button" @click="updateColumn(colIndx,indxx)">ok</button>
          </span>
        </div>

        <div v-if="dataRowOriginal[indxx] !=dataRow[indxx]">{{dataRowOriginal[indxx] }}</div>
      </div>

      <!-- Non editable values -->
      <div v-else>{{valx}}</div>
    </td>
  </tr>
</template>
<script>
export default {
  components: {},
  props: {
    dataRow: {
      type: Object,
      required: true
    },
    sqldata: {
      type: Object,
      required: true
    },
    rows: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    dataRowIndex: {
      type: Number,
      required: true
    },
    canDuplicate: {
      type: Boolean,
      required: true
    },
    reload: {
      type: Boolean,
      required: true
    },
    masterId: {
      type: String,
      required: true
    }
  },
  created() {},
  destroyed() {},
  updated() {},
  computed: {
    //---------------------------------
    isModified: function() {
      return !_.isEqual(this.dataRow, this.dataRowOriginal);
    }
    //---------------------------------
  },
  watch: {
    dataRow: {
      handler: function(newValue, oldValue) {
        //this.dataRowError[dataRowIndex] = false;
        //this.dataRowSucess[dataRowIndex] = false;
        // console.log("OLDValue ==============");
        // console.log(this.dataRowOriginal["DATECOLUMN_3"]);
        // console.log("newValue ==============");
        // console.log(newValue["DATECOLUMN_3"]);
        //console.log(_.isEqual(this.dataRow, this.dataRowOriginal));
      },
      deep: true
    },
    reload: function(newVal) {
      if (newVal) {
        alert("Re :: " + newVal);
        this.reload = false;
        this.initialize();
      }
    }
  },

  methods: {
    initialize() {
      //alert("okk11");
      // this.dataRow = {};
      this.dataRowOriginal = {};
      this.dataRowOriginal = _.cloneDeep(this.dataRow);
      this.dataRowError = {};
      this.dataRowSucess = {};
    },
    //--------------------------------------------------------
    setupListeners() {
      eventBus.$on("reloadSQLDATA", data => {
        this.initialize();
        this.dataRowOriginal = {};
        this.dataRowOriginal = _.cloneDeep(this.dataRow);
      });
    },
    //-----------------------------------------------
    turnOffListeners() {
      eventBus.$off("reloadSQLDATA");
    },
    //---------------------------------------------

    getMaxLength(col) {
      var length = col.precision;
      if (col.scale > 0) {
        length += 1;
      }
      //  alert(length);
      return length;
    },
    //-----------------------------------------
    getInputWidth2(chars) {
      if (chars.length > 80) {
        return this.getColumns(chars) + 20;
      }
      //alert(charCount * 20);
      var inputLength = this.getInputWidth(chars);

      return inputLength + 50;
    },
    //---------------------------------------------
    getInputWidth(chars) {
      //alert(charCount * 20);
      var charCount = chars.length;
      if (charCount <= 3) {
        charCount = 5;
      }
      return charCount * 7 + 50;
    },
    //---------------------------------------------
    getColumns(chars) {
      //alert(charCount * 20);
      var charCount = chars.trim().length / 5;
      return 500;
      return charCount * 5;
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
        if (this.columns[index].editable == true && this.editThis == true) {
          return true;
        }
      } catch (e) {
        return true;
      }
      return false;
    },
    //---------------------------------------------
    duplucateRecord(val) {
      //alert(val);

      var data = {};
      var rows = this.rows;
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
    deleteRecord(val) {
      var data = {};
      data.processId = this.sqldata.processId;
      var rows = this.rows;

      data.row = {};
      if (val >= 0) {
        data.row = _.cloneDeep(rows[val]);
      }

      data.table = this.sqldata.tableName;
      data.tableLib = this.sqldata.tableLib;
      data.columns = this.columns;

      data.serverid = this.sqldata.serverId;

      data.rrn = data.row.RRN_X___1;
      //alert("XXX :: " + data.rrn);
      eventBus.$emit("runsql3SingleRecordDelete", data);
    },
    //---------------------------------------------
    //---------------------------------------------
    setCurrentRecord(val) {
      //alert(val);
      var data = {};

      data.currentRecord = val;

      eventBus.$emit(this.masterId + "runsql3SingleRecordData", data);
    },
    //---------------------------------------------
    setCurrentColumn(indexx) {},
    //--------------------------------------------------------
    updateColumn(indexx, rowIndex) {
      // alert(rowIndex + " : " + indexx);
      this.currentCol = this.columns[indexx];
      this.currentIndex = indexx;

      if (!this.currentCol.editable) {
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
          value: vm.dataRow[rowIndex],
          rrn: vm.dataRow["RRN_X___1"],
          colindex: vm.currentIndex,
          rowindex: rowIndex
        },
        function() {
          vm.dataRowError[rowIndex] = false;
          vm.dataRowSucess[rowIndex] = false;
        },
        function(responce) {
          vm.showMessage = true;
          var XData = JSON.parse(responce.config.data);
          //  var colIndex = XData.colindex;
          var rowIndex2 = XData.rowindex;
          console.log(responce);
          // alert(responce.data.status);
          switch (responce.data.status) {
            case "e": {
              vm.dataRowSucess[rowIndex2] = false;
              vm.dataRowError[rowIndex2] = true;

              vm.mainMessage = responce.data.sqldata.error.substring(0, 100);
              var backup = vm.dataRow[rowIndex2];
              vm.dataRow[rowIndex2] = vm.dataRow[rowIndex2] + " ";
              vm.dataRow[rowIndex2] = backup;
              break;
            }

            case "u": {
              //console.log(responce);

              vm.dataRowOriginal[rowIndex2] = vm.dataRow[rowIndex2];
              vm.dataRowError[rowIndex2] = false;
              vm.dataRowSucess[rowIndex2] = true;

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
    }
  },

  //-----------------------------------

  data() {
    return {
      dataRowOriginal: "",
      currentCol: {},
      dataRowSucess: {},
      dataRowError: {},
      currentIndex: 0,
      mainMessage: "",
      currentRecord: 0,
      editThis: false
    };
  }
};
</script>

<style lang="scss" scoped>
input {
  outline-width: 0;

  &:focus {
    //width: 1000px;
    border-color: none;
    box-shadow: none;
    -webkit-box-shadow: none;
  }
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

.sucessBackground {
  color: #000;
  border: 1px solid #07f326;
}

.errorBackground {
  color: #000;

  border: 1px solid red;
}
</style>
