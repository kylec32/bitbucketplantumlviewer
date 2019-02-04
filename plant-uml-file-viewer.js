var plantUmlSplitterRegex = /@startuml([\s\S]*?)@enduml/g;

var srcRawUrl = '/2.0/repositories/'
                        + getUrlParameter("repoPath")
                        + '/src/'
                        + getUrlParameter("rev")
                        + '/'
                        + getUrlParameter("fileName");

sendAnalytics("RepoOwner", SHA1(getUrlParameter("repoPath").split('/')[0]));
sendAnalytics("Filetype", getUrlParameter("fileName").split('.')[1]);

AP.request({
    url: srcRawUrl,
    type: 'GET',
    responseType: "text",
    success: function (rawSrc) {
        var diagramMarkups = rawSrc.match(plantUmlSplitterRegex);
        if(diagramMarkups != undefined) {
            sendAnalytics('NumberOfDiagrams', diagramMarkups.length);
            diagramMarkups.forEach(dataItem => {
                var span = document.createElement('span');
                span.innerHTML = getDiagramSection(compress(dataItem));
                document.getElementById('diagrams').appendChild(span);
            });
        } else {
            document.querySelector("#diagrams").innerHTML = "<br/><div style='text-align:center;'>No diagram markup found.</div>"
        }
    },
    error: function(err) {
        document.querySelector("#diagrams").innerHTML =
        "Failed to load source file from Bitbucket. (" + JSON.stringify(err) + ")";
    }
});

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function sendAnalytics(type, value) {
    console.log(type + '  ' + value);
    gtag('event', value, {
        'event_category' : type,
        'event_label' : type
    });
}

function getDiagramSection(compressedData) {
    return `<div style="text-align:center">
                <object data='https://www.plantuml.com/plantuml/svg/` + compressedData + `' type='image/svg+xml'></object>
                <div id="plantumlparse_link_section">
                    <a target='_blank' href='https://www.plantuml.com/plantuml/svg/` + compressedData + `'>SVG</a> |
                    <a target='_blank' href='https://www.plantuml.com/plantuml/png/` + compressedData + `'>PNG</a> |
                    <a target='_blank' href='https://www.plantuml.com/plantuml/txt/` + compressedData + `'>TXT</a> 
                </div>
            </div>
            <br/>
            <br/>`;
}