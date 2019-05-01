    function getSqlCompletionProvider(monaco2) {
      alert("ok");
      return {
        provideCompletionItems: function (model, position) {
          console.log(model);
          console.log(model.getValue());

          let value = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });

          // console.log(position)
          var sqlxom = {
            incomplete: true,
            suggestions: [{
                label: '"SELECT"',
                kind: monaco.languages.CompletionItemKind.Keyword,
                detail: "SQL",
                documentation: "sql selector.",
                insertText: '"SELECT"'
              },

              {
                label: '"KDB108"',
                kind: monaco.languages.CompletionItemKind.Folder,
                detail: "SQL",
                documentation: "sql selector."
                //insertText: '"mkdirp": "*"'
              },




            ]
          };

          return sqlxom;
        }
      };
    }
