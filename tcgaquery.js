(function () {

  TCGA.loadScript({
    registerModules : false,
    scripts : [ 'https://raw.github.com/marijnh/CodeMirror2/master/lib/codemirror.js',
                'https://raw.github.com/marijnh/CodeMirror2/master/mode/sparql/sparql.js'],
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
          TCGA.hub.query(query, function (err, sparqlResult) {
            if (err) TCGA.toast.error("Unable to complete query");
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
    TCGA.registerTab({
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
    $(".help").append('<p>  <div class="btn-group">    <button class="btn" data-toggle="collapse" data-target="#schema-types">Types</button>    <button class="btn" data-toggle="collapse" data-target="#other-properties">Properties</button>    <button class="btn" data-toggle="collapse" data-target="#file-properties">File Only Properties</button>  </div></p><div id="schema-types" class="collapse in">  <p>See the <a href="https://wiki.nci.nih.gov/display/TCGA/TCGA+Data+Primer">TCGA Data Primer</a> and <a href="https://tcga-data.nci.nih.gov/datareports/codeTablesReport.htm?codeTable=center">Code Tables</a> for details on these types.</p>  <ul>    <li>tcga:disease-study</li>    <li>tcga:center-type</li>    <li>tcga:center-domain</li>    <li>tcga:platform</li>    <li>tcga:data-type</li>    <li>tcga:archive</li>    <li>tcga:file</li>  </ul></div><div id="other-properties" class="collapse">  <p>All classes have the following properties</p>  <ul>    <li>rdfs:label</li>    <li>rdf:type</li>    <li>tcga:url</li>    <li>tcga:date-modified</li>  </ul></div><div id="file-properties" class="collapse">  <p>Files have the following properties</p>  <ul>    <li>rdfs:label</li>    <li>rdf:type</li>    <li>tcga:url</li>    <li>tcga:date-modified</li>    <li>tcga:disease-study</li>    <li>tcga:center-type</li>    <li>tcga:center-domain</li>    <li>tcga:platform</li>    <li>tcga:data-type</li>    <li>tcga:archive</li>  </ul></div>');

    TCGA.Query = TCGA.Query || Query;

  });

})();
