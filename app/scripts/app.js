(function(document) {
  'use strict';

  var app = document.querySelector('#app');

  window.addEventListener('WebComponentsReady', function() {

    /**
     * The data to use.
     */
    app.automata = {values: []};
    app.liveCompiling = true;
    app.liveBuilding = true;
    app.fairAbstraction = true;
    app.helpDialogSelectedTab = 0;
    app.currentBuild = {};
    app.previousBuild = {};
    app.previousCode = '';
    app.currentFile = '';

    app.compile = function(overrideBuild) {
      var code = app.getCode();

      if(!overrideBuild){
        // if there is nothing to parse then do not continue
        if(code.length === 0){
          app.$.console.clear();
          app.automata = {};
          app.previousCode = '';
          return;
        }

        // if the code has not changed then do not continue
        if(code === app.previousCode){
          return;
        }
      }

      app.build(overrideBuild);
    };

    /**
     * Runs the compiler converting the code in the editor into visualisable
     * graphs and calls the renderer.
     */
    app.build = function(override) {
      app.$.console.clear();
      setTimeout(function() {
        if(app.liveCompiling === true || override){
          var compileStartTime = (new Date()).getTime();
          var code = app.$.editor.getCode();
          var results = app.$.parser.compile(code, app.fairAbstraction);

          // check if an error was thrown by the compiler
          if(results.type === 'error'){
            app.$.console.error(results.toString());
          }
          else{
            if(app.liveBuilding === true || override){
              // otherwise render the automata
              app.set('automata.values', results.graphs.reverse());
              app.$.selector.initialSelection();

              if(results.operations.length !== 0){
                app.$.console.log('Operations:');
                for(var i = 0; i < results.operations.length; i++){
                  app.$.console.log(results.operations[i]);
                }
              }
            }
          }
        }
      }.bind(this), 0);
    }

    /**
     * Renders the specified graphs to the UI.
     */
    app.render = function(graphs) {
      app.$.console.log('Rendering...');
      var renderStartTime = (new Date()).getTime();
      // Can't simply assign app.automata.values to the new array as data bindings will not update.
      // Creating a new automata object then setting the its values slightly later will work (for some reason).
      app.automata = {};
      setTimeout(function() {
        app.set('automata.values', graphs);

        // listen for each rendered event.
        // once all automata have been rendered, log the results and stop listening.
        var automataRendered = 0;
        var renderComplete = function() {
          automataRendered++;
          if (automataRendered === app.automata.values.length) {
            var renderTime = Math.max(1, ((new Date()).getTime() - renderStartTime)) / 1000;
            app.$.console.clear(1);
            app.$.console.log('Rendered successfully after ' + renderTime.toFixed(3) + ' seconds.');

            document.removeEventListener('process-visualisation-rendered', renderComplete);
          }
        };

        document.addEventListener('process-visualisation-rendered', renderComplete);
      }.bind(this), 0)
    };

    app.operations = function(operations) {
      setTimeout(function (){
        // only print out operations results if the were any operations performed
        if(operations.length !== 0){
          app.$.console.log(' ');
          app.$.console.log('Operations:');
          var annotations = [];
          for(var i = 0; i < operations.length; i++){
            app.$.console.log(operations[i]);
          }
        }
      }.bind(this), 0);
    };

    /**
     * Compiles and builds what has currenty been entered into the text-area.
     * Ignores whether or not live compile and build are currently set.
     */
    app.compileAndBuild = function() {
      app.compile(true);
    };

    /**
     * Gets and returns the code from the editor. Strips the code of all whitespace
     * and unnecessary line breaks.
     */
    app.getCode = function() {
      var code = '';
      var temp = app.$.editor.getCode();

      // remove white space and line breaks
      temp = temp.replace(/ /g, '');

      // remove unnecessary whitespace
      var split = temp.split('\n');
      for(var i = 0; i < split.length; i++){
        if(split[i] !== ''){
          code += split[i] + '\n';
        }
      }

      return code;
    };

    /**
     * Open a text file from the user's computer and set the text-area to
     * the text parsed from the file.
     */
    app.openFile = function() {
      var opener = app.$['open-file'];
      opener.click();
      opener.onchange = function(e) {
        if (opener.value === '') {
          return;
        }

        // Load file into editor
        var input = e.target;
        app.currentFile = input.files[0];
        app.reloadFile();
        opener.value = '';

        // Enable reload button
        var reload = app.$['reload'];
        reload.disabled = false;
      };
    };

    /**
     * Reload the last used file.
     */
    app.reloadFile = function() {
      if (app.currentFile === '') {
        return;
      }

      var reader = new FileReader();
      reader.onload = function() {
        var text = reader.result;
        app.$.editor.setCode(text);
        app.$.editor.focus();
      };
      reader.readAsText(app.currentFile);
    }

    /**
     * Save to code the user has written to their computer (as a download).
     */
    app.downloadFile = function() {
      var filename = app.$['filename'].inputElement.bindValue;
      // if filename has not been defined set to untitled
      if(filename === ''){
        filename = 'untitled';
      }

      var blob = new Blob(
        [app.$.editor.getCode()],
        {type: 'text/plain;charset=utf-8'});
      saveAs(blob, filename + '.txt');
    };

    /**
     * Opens the help-dialog.
     */
    app.showHelp = function() {
      var help = app.$['help-dialog'];
      help.open();
    };

    /**
     * Simple event listener for when the checkbox in ticked.
     * Compile is called if it is.
     */
    app.$['chbx-live-compiling'].addEventListener('iron-change', function() {
      if (app.liveCompiling) {
        app.compile(false);
      }
      app.$.editor.focus();
    });

    /**
     * Simple event listener for when the live building checkbox is ticked.
     * Compile is called if live compiling is active.
     */
    app.$['chbx-live-building'].addEventListener('iron-change', function() {
      if(app.liveCompiling){
        app.compile(false);
      }
      app.$.editor.focus();
    });

    /**
     * Simple event listener for when the fair abstraction checkbox is ticked.
     * Compile is called every time the checkbox is ticked or unticked.
     */
    app.$['chbx-fair-abstraction'].addEventListener('iron-change', function() {
      app.compile(true);
      app.$.editor.focus();
    });

    document.addEventListener('render-single-process', function(e){
      app.$.visualiser.name = e.detail.name;
      app.$.visualiser.graph = e.detail.graph;
      app.$.visualiser.redraw();
    });


    /**
     * This is the event which triggers when the user selects an automata from the
     * list to walk down. It sets the root node of this automata, and all automata
     * with this automata as a sub-graph, blue.
     */
    document.addEventListener('automata-walker-start', function(e) {
      var visualisations = Polymer.dom(this).querySelectorAll('automata-visualisation');
      for (var i in visualisations) {
        visualisations[i].setHighlightNodeId(e.detail.node.id);
      }
    });
    /**
     * This is the event which triggers when the user presses the walk
     * button on the walker element. The walker has already checked for the valid
     * edge and thrown any errors. The edge to walk is given in the event argument
     * 'e.detail.edge'.
     */
    document.addEventListener('automata-walker-walk', function(e) {
      var visualisations = Polymer.dom(this).querySelectorAll('automata-visualisation');
      for (var i in visualisations) {
        visualisations[i].setHighlightNodeId(e.detail.edge.to.id);
      }
    });

    /**
     * This is the event which triggers when the text in the text area is changed.
     * Only care about this if the live-compiling check-box is ticked.
     */
    document.addEventListener('text-editor-change', function() {
      if (app.liveCompiling) {
        app.compile();
      }
    });

    /**
     * Listen for key presses.
     * Note: Needs to listen for keydown (not keyup) in order to prevent browser default action
     */
    document.addEventListener('keydown',function(e) {
      if (app.$['help-dialog'].opened) {
        return;
      }

      switch (e.keyCode) {
        case 13:
          // CTRL + ENTER
          if (e.ctrlKey) {
            app.compile();
            e.preventDefault();
          }
          break;
        case 79:
          // CTRL + O
          if (e.ctrlKey) {
            app.openFile();
            e.preventDefault();
          }
          break;
        case 83:
          // CTRL + S
          if (e.ctrlKey) {
            app.downloadFile();
            e.preventDefault();
          }
          break;
        case 112:
          // F1
          app.$['help-dialog'].open();
          e.preventDefault();
          break;
        default: return;
      }
    });

  });
})(document);
