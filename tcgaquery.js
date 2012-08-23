(function () {

  TCGA.loadScript({
    registerModules : false,
    scripts : [ 'https://raw.github.com/marijnh/CodeMirror/master/lib/codemirror.js',
                'https://raw.github.com/marijnh/CodeMirror/master/mode/sparql/sparql.js'],
  }, function () {

    $("<link>")
      .attr('rel', 'stylesheet')
      .attr('href', 'https://dl.dropbox.com/u/4000409/Repos/TCGA-Query/codemirror.css')
      .attr('type', 'text/css')
      .appendTo("head");

    var Query, editor;

    Query = {

      executeQuery : function (e) {
        var query = editor.getValue();
        if(query !== ""){
          TCGA.find(query, function (err, sparqlResult) {
            if (err) TCGA.ui.toast.error("Unable to complete query");
            else Query.displayResults(sparqlResult);
          });
        }
        return false;
      },

      displayResults : function (results) {
        var tableTemplate = "<table class='table table-condensed table-bordered'><thead><tr></tr></thead><tbody><tr></tr></tbody></table>";
        if (typeof results === 'object') {
          $("#results").html(tableTemplate);
          var labels = results.head.vars,
              $heads = $("#results table thead tr").first(),
              $body = $("#results table tbody");
          labels.forEach(function(label){
            $heads.append($("<th>").text(label));
          });
          results.results.bindings.forEach(function(row){
            var $rowhtml = $("<tr>");
            labels.forEach(function(label, index){
              $rowhtml.append($("<td>").text(row[label].value));
            });
            $body.append($rowhtml);
          });
        }
      }

    };

    // Register Tab
    TCGA.ui.registerTab({
      id : 'sparql',
      title : 'SPARQL',
      content : '<div class="page-header"><h1>TCGA SPARQL Interface</h1></div><div class="row"><div class="span8"><form class="sparql-query"><textarea id="query" rows="5"></textarea><button type="submit" class="btn btn-primary">Submit Query</button></form></div><div class="help span4"><h3>Schema Overview</h3></div></div><div id="results"></div>',
      switchTab : true
    });

    // Connect query button to behavior
    $("form.sparql-query").first().submit(Query.executeQuery);

    // Make the editor
    editor = CodeMirror.fromTextArea($("#query").get(0));
    editor.setValue(["prefix tcga:<http://purl.org/tcga/core#>",
                          "",
                          "select ?disease (count (?file) as ?files) {",
                          "  ?file tcga:disease-study ?d .",
                          "  ?d rdfs:label ?disease .",
                          "} group by ?disease order by desc(?files)"].join("\n"));

    // Populate the help
    $(".help").append('<p>  <ul class="nav nav-tabs">    <li class="active"><a href="#schema-types" data-toggle="tab">Types</a></li>    <li><a href="#other-properties" data-toggle="tab">Properties</a></li>    <li><a href="#file-properties" data-toggle="tab">File Only Properties</a></li>  </ul></p> <div class="tab-content"><div id="schema-types" class="tab-pane active">  <p>See the <a href="https://wiki.nci.nih.gov/display/TCGA/TCGA+Data+Primer">TCGA Data Primer</a> and <a href="https://tcga-data.nci.nih.gov/datareports/codeTablesReport.htm?codeTable=center">Code Tables</a> for details on these types.</p>  <ul>    <li>tcga:DiseaseStudy</li>    <li>tcga:CenterType</li>    <li>tcga:CenterDomain</li>    <li>tcga:Platform</li>    <li>tcga:DataType</li>    <li>tcga:Archive</li>    <li>tcga:File</li>  </ul></div><div id="other-properties" class="tab-pane">  <p>All classes have the following properties</p>  <ul>    <li>rdfs:label</li>    <li>rdf:type</li>    <li>tcga:url</li>    <li>tcga:lastModified</li><li>tcga:firstSeen</li><li>tcga:lastSeen</li>  </ul></div><div id="file-properties" class="tab-pane">  <p>Files also have the following properties</p>  <ul>  <li>tcga:diseaseStudy</li>    <li>tcga:centerType</li>    <li>tcga:centerDomain</li>    <li>tcga:platform</li>    <li>tcga:dataType</li>    <li>tcga:archive</li>  </ul></div></div> <p><a href="https://docs.google.com/open?id=0Bzu4cytkv4B8Y1VMVXNOMFhvaGM">Class Diagram</a></p> <p><a href="https://docs.google.com/open?id=0Bzu4cytkv4B8V3lsc0VzQWE2c28">Instance Diagram</a></p>');

    TCGA.Query = TCGA.Query || Query;

  });

})();
