<template>
  <div style="padding:10px">
    <div class="row">
      <div class="col-sm"></div>
      <div class="col-sm">
        <form novalidate class="md-layout">
          <md-field>
            <label>Table Name</label>
            <md-input required v-model="loadTableName"></md-input>
          </md-field>

          <md-field>
            <label>Library</label>
            <md-input required v-model="loadTableLib"></md-input>
          </md-field>

          <md-button @click="loadTable" class="md-primary">Load</md-button>
        </form>
      </div>
      <div class="col-sm">
        <md-field>
          <label>New Table Name</label>
          <md-input required v-model="newTableName"></md-input>
        </md-field>

        <md-field>
          <label>New Table lib</label>
          <md-input required v-model="newTableLib"></md-input>
        </md-field>

        <md-field>
          <label>Table Heading</label>
          <md-input required v-model="loadTableHeading"></md-input>
        </md-field>

        <md-field>
          <label>Table Record format</label>
          <md-input required v-model="newTableRecordFormat"></md-input>
        </md-field>

        <md-button @click="runCreateTable" class="md-primary">Create Table</md-button>
      </div>

      <div class="col-sm"></div>
    </div>

    <div class="row">
      <table class="table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">Seq</th>
            <th scope="col">Long Name</th>
            <th scope="col">Short Name</th>
            <th scope="col">Data type</th>
            <th scope="col">Length</th>
            <th scope="col">Decimal Position</th>
            <th scope="col">Nullable</th>
            <th scope="col">Default Value</th>
            <th scope="col">Heading</th>
            <th scope="col">Text</th>
            <th scope="col">Key Seq</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(afield,indx) in fieldList" :key="'c'+indx">
            <td>Delete</td>
            <td>
              <input style="min-width: 70px;" class="form-control" type="text" v-model="afield.seq">
            </td>

            <td>
              <input
                style="min-width: 200px;"
                class="form-control"
                type="text"
                v-model="afield.longName"
              >
            </td>
            <td>
              <input
                style="min-width: 140px;"
                class="form-control"
                type="text"
                v-model="afield.shortName"
              >
            </td>
            <td>
              <div>
                <!-- <md-autocomplete v-model="afield.dataType" :md-options="alloweddatatype" md-dense></md-autocomplete> -->
                <cool-select v-model="afield.dataType" :items="alloweddatatype" placeholder="CHAR"/>
              </div>
            </td>
            <td>
              <input
                style="min-width: 70px;"
                class="form-control"
                type="number"
                v-model="afield.length"
              >
            </td>
            <td>
              <input
                style="min-width: 40px;"
                class="form-control"
                type="number"
                v-model="afield.scale"
              >
            </td>
            <td>
              <div class="form-check">
                <input
                  type="checkbox"
                  v-model="afield.isNullable"
                  class="form-check-input"
                  id="exampleCheck1"
                >
              </div>
            </td>
            <td>
              <input
                style="min-width: 120px;"
                class="form-control"
                type="text"
                v-model="afield.defaultValue"
              >
            </td>
            <td>
              <input
                style="min-width: 200px;"
                class="form-control"
                type="text"
                v-model="afield.heading"
              >
            </td>
            <td>
              <input
                style="min-width: 200px;"
                class="form-control"
                type="text"
                v-model="afield.text"
              >
            </td>
            <td>
              <input
                style="min-width: 200px;"
                class="form-control"
                type="text"
                v-model="afield.keySeq"
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { CoolSelect } from "vue-cool-select";
export default {
  name: "Create_Table",
  components: { CoolSelect },

  methods: {
    initialize() {
      this.fieldList.push(_.clone(this.field));
      this.fieldList.push(_.clone(this.field));
      this.fieldList.push(_.clone(this.field));
      this.fieldList.push(_.clone(this.field));
      this.fieldList.push(_.clone(this.field));
    },
    loadScreen() {
      this.loadColumnsIds();
      this.fieldList = [];
      var vm = this;
      _.forEach(this.rows, function(row) {
        var currentField = _.clone(vm.field);
        (currentField.seq = row[vm.ORDINAL_POSITION_ID] * 100),
          (currentField.longName = row[vm.COLUMN_NAME_ID]),
          (currentField.shortName = row[vm.SYSTEM_COLUMN_NAME_ID]),
          (currentField.dataType = row[vm.DATA_TYPE_ID]),
          (currentField.length = row[vm.LENGTH_ID]),
          (currentField.scale = row[vm.NUMERIC_SCALE_ID]),
          (currentField.isNullable = row[vm.IS_NULLABLE_ID]),
          (currentField.defaultValue = "--"),
          (currentField.text = row[vm.COLUMN_TEXT_ID]),
          (currentField.heading = row[vm.COLUMN_HEADING_ID]);
        vm.fieldList.push(currentField);
      });
    },
    loadColumnsIds() {
      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "ORDINAL_POSITION";
      });

      this.ORDINAL_POSITION_ID =
        coll.label.trim() + "_" + _.toString(coll.id).trim();

      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "COLUMN_NAME";
      });
      this.COLUMN_NAME_ID =
        coll.label.trim() + "_" + _.toString(coll.id).trim();

      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "SYSTEM_COLUMN_NAME";
      });
      this.SYSTEM_COLUMN_NAME_ID =
        coll.label.trim() + "_" + _.toString(coll.id).trim();

      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "DATA_TYPE";
      });
      this.DATA_TYPE_ID = coll.label.trim() + "_" + _.toString(coll.id).trim();

      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "LENGTH";
      });
      this.LENGTH_ID = coll.label.trim() + "_" + _.toString(coll.id).trim();

      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "NUMERIC_SCALE";
      });
      this.NUMERIC_SCALE_ID =
        coll.label.trim() + "_" + _.toString(coll.id).trim();

      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "COLUMN_HEADING";
      });
      this.COLUMN_HEADING_ID =
        coll.label.trim() + "_" + _.toString(coll.id).trim();
      alert(this.COLUMN_HEADING_ID);

      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "COLUMN_TEXT";
      });
      this.COLUMN_TEXT_ID =
        coll.label.trim() + "_" + _.toString(coll.id).trim();

      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "LONG_COMMENT";
      });
      this.LONG_COMMENT_ID =
        coll.label.trim() + "_" + _.toString(coll.id).trim();

      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "IS_NULLABLE";
      });
      this.IS_NULLABLE_ID =
        coll.label.trim() + "_" + _.toString(coll.id).trim();

      var coll = _.find(this.columns, function(col) {
        return col.label.trim() == "IS_IDENTITY";
      });
      this.IS_IDENTITY_ID =
        coll.label.trim() + "_" + _.toString(coll.id).trim();
    },
    //-------------------------------------

    runCreateTable: function() {
      var vm = this;

      this.runWebService(
        "c/table",
        {
          serverId: vm.$session.get("currentserver"),
          requestIdToProcess: vm.sqldata.processId,
          tableName: vm.newTableName,
          tableLib: vm.newTableLib,
          tableHeading: vm.loadTableHeading,
          tableRecordFormat: vm.newTableRecordFormat,
          columns: vm.fieldList
        },
        function() {
          vm.loading = true;

          vm.alertMessage = "";
        },
        function(responce) {
          vm.loading = false;
        },
        function(error) {
          vm.loading = false;
        }
      );
    },
    //-------------------------------------
    loadTable: function() {
      if (this.loading) {
        return;
      }
      this.showMessage = false;
      var vm = this;

      vm.rows = [];
      vm.sqldata.processId = "";
      vm.sqldata.downloadLocation = "";
      vm.loadTableHeading = " ";
      this.loadTableSql =
        "@createtable " +
        this.loadTableLib.trim() +
        "." +
        this.loadTableName.trim();
      alert(vm.$session.get("currentserver"));

      this.runWebService(
        "r/sql3",
        {
          serverId: vm.$session.get("currentserver"),
          sql: vm.loadTableSql,
          requestIdToProcess: vm.sqldata.processId,
          requestIdToClose: ""
        },
        function() {
          vm.loading = true;

          vm.alertMessage = "";
          vm.rows = [];
          vm.sqldata = [];
          vm.columns = [];
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
          console.log("vm.sqldata.data " + vm.sqldata);

          switch (vm.sqldata.status) {
            case "s": {
              vm.columns = vm.sqldata.columns;
              console.log("vm.sqldata.data.length " + vm.sqldata.data.length);

              vm.rows = vm.sqldata.data;

              vm.loadTableHeading = vm.sqldata.heading;
              /// check if it has more fata

              vm.hasMoreData = false;

              vm.requestIdToProcess = responce.data.requestId;
              vm.alertMessage = vm.sqldata.error;
              vm.loadScreen();
              break;
            } // end sucess

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

    //--------------------------------------
  },
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      loadTableName: "",
      loadTableLib: "",
      loadTableSql: "",
      fieldList: [],
      loading: false,
      loadTableHeading: "",
      hasMoreData: true,

      // row ids
      ORDINAL_POSITION_ID: "",
      COLUMN_NAME_ID: "",
      SYSTEM_COLUMN_NAME_ID: "",
      DATA_TYPE_ID: "",
      LENGTH_ID: "",
      NUMERIC_SCALE_ID: "",
      COLUMN_HEADING_ID: "",
      COLUMN_TEXT_ID: "",
      LONG_COMMENT_ID: "",
      IS_NULLABLE_ID: "",
      IS_IDENTITY_ID: "",

      newTableName: "",
      newTableLib: "",
      newTableRecordFormat: "",

      // data
      rows: [],
      columns: {},
      sqldata: {},
      field: {
        seq: 100,
        longName: "x",
        shortName: "",
        dataType: "CHAR",
        length: 0,
        scale: "",
        isNullable: false,
        defaultValue: "",
        text: "",
        heading: "",
        keySeq: 0
      },

      alloweddatatype: [
        "CHAR",
        "VARCHAR",
        "CLOB",
        "DATE",
        "TIME",
        "TIMESTAMP",
        "XML",
        "DECIMAL",
        "NUMERIC",
        "SMALLINT",
        "INTEGER",
        "BLOB"
      ]
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
