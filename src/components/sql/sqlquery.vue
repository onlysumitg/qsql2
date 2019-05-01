<template>
  <div class style="height:900px">
    <div class="btnc">
      <md-button @click="emitSQLToRun(true)" class="md-primary md-raised">Run Selected</md-button>
      <md-button @click="emitSQLToRun(false)" class="md-primary md-raised">Run All</md-button>
    </div>

    <!-- <codeeditor
      id="editor"
      ref="editor"
      v-model="value"
      :value="value"
      @init="editorInit"
      lang="sql"
      :options="options"
      theme="crimson_editor"
      width="100%"
      height="100%"
    ></codeeditor>-->
    <div id="sqleditor" style="width:100%;height:90%;border:1px solid #ccc"></div>

    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>

    <!-- show save query dialof -->
    <b-modal
      id="modalPrevent"
      ref="modal"
      title="Save Query"
      v-model="showSaveQueryDialog"
      @ok="saveQueryToDB"
      @shown="clearName"
    >
      <form @submit.stop.prevent="handleSubmit">
        {{modalErrorMessage}}
        <b-form-input type="text" placeholder="Title*" v-model="queryHeading"></b-form-input>
        <br>
        <b-form-input type="text" placeholder="Description*" v-model="queryDesc"></b-form-input>
      </form>
    </b-modal>

    <!--____________________________  save query  ___________________________ -->
    <!-- <md-dialog-prompt
      :md-active.sync="showSaveQueryDialog"
      v-model="queryHeading"
      md-title="Enter a Title"
      md-input-maxlength="100"
      md-input-placeholder="Title*"
      md-confirm-text="Done"
    />-->
  </div>
</template>
<script>
import * as monaco2 from "monaco-editor";

export default {
  props: {
    currentSQL: {
      type: String,
      required: false
    }
  },
  watch: {
    currentSQL(valx) {
      this.value = valx;
      var currentValue = this.monacoEditor.getModel().getValue();
      this.value = currentValue + " \n \n" + valx + " \n \n";
      this.monacoEditor.getModel().setValue(this.value);
    }
  },
  //------------------------------------------------------------------------------------------
  data: function() {
    return {
      selectedSQL: "",
      monacoEditor: "",
      value: "",
      queryHeading: "",
      queryDesc: "",
      showSaveQueryDialog: false,
      modalErrorMessage: "",
      autoComData: [],
      options: {
        minLines: 500,
        wrap: true,
        autoScrollEditorIntoView: false,
        showPrintMargin: false,
        fontSize: 14,
        showGutter: true,
        enableBasicAutocompletion: true
      }
    };
  },
  //------------------------------------------------------------------------------------------
  methods: {
    initialize() {
      var vm = this;
      // setTimeout(function() {
      //   monaco2.languages.registerCompletionItemProvider(
      //     "sql",
      //     vm.getSqlCompletionProvider(monaco2)
      //   );
      // }, 9000);

      this.monacoEditor = monaco2.editor.create(
        document.getElementById("sqleditor"),
        {
          value: "SELECT * FROM AFF_XMLLOG",
          language: "sql",
          automaticLayout: true,
          wordWrap: "on",
          minimap: {
            enabled: false
          }
        }
      );

      this.monaocEditorInit();

      //console.log(x1);
    },

    //--------------------------------------------------------
    getSqlCompletionProvider(monaco2) {
      var vm2 = this;

      return {
        provideCompletionItems: function(model, position) {
          //console.log(model);
          //console.log(model.getValue());

          return new Promise(function(resolve, reject) {
            // console.log(vm2.autoComData.length);
            if (vm2.autoComData.length > 0) {
              return resolve({
                suggestions: vm2.autoComData,

                isIncomplete: false
              });
            }

            vm2.runWebService(
              "r/autoc",
              { serverId: vm2.$session.get("currentserver") },
              function() {},
              function(respons) {
                //console.log(respons);
                if (respons.data.status == "s") {
                  // console.log(respons.data);
                  vm2.autoComData = respons.data.data;
                  resolve({
                    suggestions: respons.data.data,

                    isIncomplete: false
                  });
                }
              },
              function(error) {
                reject({ suggestions: [], isIncomplete: false });
              }
            );
          });

          let value = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });

          // console.log(position)
          var sqlxom = {
            incomplete: true,
            suggestions: [
              {
                label: '"SELECT"',
                kind: monaco.languages.CompletionItemKind.Keyword,
                detail: "SQL Select",
                documentation: "SQL Select statement.",
                insertText: "SELECT * FROM"
              },

              {
                label: '"CALL"',
                kind: monaco.languages.CompletionItemKind.Keyword,
                detail: "SQL Call SP",
                documentation: "SQL CALL statement.",
                insertText: "CALL "
              },
              {
                label: '"UPDATE"',
                kind: monaco.languages.CompletionItemKind.Keyword,
                detail: "SQL Update",
                documentation: "SQL UPDATE statement.",
                insertText: "UPDATE "
              },

              {
                label: '"DELETE"',
                kind: monaco.languages.CompletionItemKind.Keyword,
                detail: "SQL DELETE ",
                documentation: "SQL DELETE statement.",
                insertText: "DELETE FROM "
              },

              {
                label: '"@MULTI"',
                kind: monaco.languages.CompletionItemKind.Keyword,
                detail: "MULTIPLE SQL",
                documentation: "Run multiple SQL Queries",
                insertText: "@MULTI "
              },
              {
                label: '"@S"',
                kind: monaco.languages.CompletionItemKind.Keyword,
                detail: "SQL Select with Edit",
                documentation: "SQL Select statement with Edit option.",
                insertText: "@S "
              }
            ]
          };

          return sqlxom;
        }
      };
    },

    okke: function() {
      //console.log(this.$refs.editor);
      alert(this.$refs.editor.editor.getSelectedText());
    },
    saveQueryToDB(evt) {
      this.showSaveQueryDialog = false;

      this.modalErrorMessage = "";
      evt.preventDefault();
      if (
        this.queryHeading.trim().length == 0 ||
        this.queryDesc.trim().length == 0
      ) {
        this.modalErrorMessage = "Both Fields are required";
      } else {
        this.handleSubmit();
        eventBus.$emit("updateSavedSQL", true);
      }
    },

    //---------------------------------------
    handleSubmit() {
      var data = {
        id: 0,
        type: "S",
        heading: this.queryHeading,
        desc: this.queryDesc,
        sql: this.selectedSQL
      };

      this.runWebService(
        "r/savequery",
        data,
        function() {},
        function(response) {
          this.$emit("reloadQueryList", true);
          this.queryHeading = "";
          this.queryDesc = "";
        },
        function(error) {}
      );
    },
    //------------------------------------
    clearName() {},
    //---------------------------------------------------
    emitSQLToRun(seletedOnly) {
      //alert("ok");
      var sqldata3 = {};
      sqldata3.serverId = this.$session.get("currentserver");
      sqldata3.requestIdToProcess = "";
      sqldata3.requestIdToClose = "";

      if (seletedOnly) {
        eventBus.$emit("runsql", this.$refs.editor.editor.getSelectedText());

        sqldata3.sqlsqlToRun = this.$refs.editor.editor.getSelectedText();
      } else {
        eventBus.$emit("runsql", this.value);
        sqldata3.sqlsqlToRun = this.value;
      }
      eventBus.$emit("runsql3", sqldata3);
    },
    //---------------------------------------------------
    emitSQLToRun2(sqltoRun) {
      //alert("ok");
      var sqldata3 = {};
      sqldata3.serverId = this.$session.get("currentserver");
      sqldata3.requestIdToProcess = "";
      sqldata3.requestIdToClose = "";

      eventBus.$emit("runsql", sqltoRun);

      sqldata3.sqlsqlToRun = sqltoRun;

      eventBus.$emit("runsql3", sqldata3);
    },
    //---------------------------------------------------
    monaocEditorInit: function() {
      var vm2 = this;
      this.monacoEditor.addAction({
        id: "RunSeletedSQL",
        label: "Run Selected",
        keybindings: [monaco2.KeyMod.Alt | monaco2.KeyCode.KEY_R],
        precondition: null,
        keybindingContext: null,

        run: function(meditor) {
          var value = meditor
            .getModel()
            .getValueInRange(meditor.getSelection());
          // alert("ok " + value);
          //  console.log(vm2.monacoEditor.tokenize(value, "sql"));

          vm2.emitSQLToRun2(value);
          return null;
        }
      });

      //-----------------  RUN ALLL
      this.monacoEditor.addAction({
        id: "RunALLSQL",
        label: "Run All",
        keybindings: [
          monaco2.KeyMod.chord(monaco2.KeyMod.Alt | monaco2.KeyCode.KEY_A)
        ],
        precondition: null,
        keybindingContext: null,

        run: function(meditor) {
          // vm2.emitSQLToRun2();
          var value2 = meditor.getModel().getValue();
          //alert("ok " + value);
          //console.log(vm2.monacoEditor.tokenize(value, "sql"));
          vm2.emitSQLToRun2(value2);
          return null;
        }
      });

      //-----------------  RUN Current line
      this.monacoEditor.addAction({
        id: "RunCurrentLineSQL",
        label: "Run Current line",
        keybindings: [
          monaco2.KeyMod.chord(monaco2.KeyMod.Alt | monaco2.KeyCode.KEY_C)
        ],
        precondition: null,
        keybindingContext: null,

        run: function(meditor) {
          // vm2.emitSQLToRun2();
          var value = meditor
            .getModel()
            .getLineContent(meditor.getPosition().lineNumber);

          vm2.emitSQLToRun2(value);
          return null;
        }
      });
      //-----------------  SAVE
      this.monacoEditor.addAction({
        id: "saveSelectedSQL",
        label: "Save Selected",
        keybindings: [
          monaco2.KeyMod.chord(monaco2.KeyMod.Alt | monaco2.KeyCode.KEY_S)
        ],
        precondition: null,
        keybindingContext: null,

        run: function(meditor) {
          // vm2.emitSQLToRun2();
          vm2.selectedSQL = meditor
            .getModel()
            .getValueInRange(meditor.getSelection());
          //alert("ok " + value);
          //console.log(vm2.monacoEditor.tokenize(value, "sql"));
          vm2.modalErrorMessage = "";
          vm2.showSaveQueryDialog = true;
          return null;
        }
      });
    },
    //---------------------------------------------------
    editorInit: function() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/sql");

      require("brace/theme/crimson_editor");
      require("brace/snippets/javascript"); //snippet

      var vm2 = this;
      this.$refs.editor.editor.commands.addCommand({
        name: "runSelected",
        bindKey: {
          win: "Alt-R",
          mac: "Command-R"
        },
        exec: function(editor) {
          vm2.emitSQLToRun(true);
        }
      });

      this.$refs.editor.editor.commands.addCommand({
        name: "runAll",
        bindKey: {
          win: "Alt-A",
          mac: "Command-A"
        },
        exec: function(editor) {
          vm2.emitSQLToRun(false);
        }
      });

      this.$refs.editor.editor.commands.addCommand({
        name: "save",
        bindKey: {
          win: "Alt-S",
          mac: "Command-S"
        },
        exec: function(editor) {
          vm2.selectedSQL = editor.getSelectedText();
          vm2.modalErrorMessage = "";
          vm2.showSaveQueryDialog = true;
        }
      });
    }
  }
};
</script>

<style>
.btnc {
  position: sticky;
  top: 0;
  margin: 5px;
}
</style>
