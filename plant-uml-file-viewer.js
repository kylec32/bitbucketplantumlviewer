var plantUmlSplitterRegex = /(@startuml([\s\S]*?)@enduml)|(@startsalt([\s\S]*?)@endsalt)/g;

var srcRawUrl = '/2.0/repositories/'
                        + getUrlParameter("repoPath")
                        + '/src/'
                        + getUrlParameter("rev")
                        + '/'
                        + getUrlParameter("filePath");

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
                var compressedData = compress(dataItem);
                span.innerHTML = getDiagramSection(compressedData);
                document.getElementById('diagrams').appendChild(span);
                grabAndPlaceDiagramMarkup(compressedData);
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
    try {
        if (typeof umami != 'undefined') {
            umami.track(type, {data: { name: `${value}`}})
        }
    } catch (e) {
        console.error(e);
    }
}

function sendPageView() {
    try {
        if (typeof umami != 'undefined') {
            umami.track({ website: '5b731534-c2b3-49e1-876c-0600dc54d45d', url: window.location.pathname + "?repoPath=" + new URLSearchParams(window.location.search).get('repoPath') })
        }
    } catch (e) {
        console.error(e);
    }
}

function grabAndPlaceDiagramMarkup(compressedData) {
    var identifier = SHA1(compressedData);
    fetch("https://www.plantuml.com/plantuml/svg/" + compressedData)
        .then(value => value.text()
        .then(text => {
            var links = document.getElementById("plantumlparse-link-section" + identifier);
            links.style.display = "block";
            var svg = document.getElementById("diagram-placeholder-" + identifier);
            svg.innerHTML = text;
            }
        ));
}

function getDiagramSection(compressedData) {
    var identifier = SHA1(compressedData);
    return `<div style="text-align:center">
                <img id="diagram-placeholder-` + identifier + `" src='https://www.plantuml.com/plantuml/png/` + compressedData + `' />
                <div id="plantumlparse-link-section` + identifier + `" style="display:none">
                    <a target='_blank' href='https://www.plantuml.com/plantuml/svg/` + compressedData + `'>SVG</a> |
                    <a target='_blank' href='https://www.plantuml.com/plantuml/png/` + compressedData + `'>PNG</a> |
                    <a target='_blank' href='https://www.plantuml.com/plantuml/txt/` + compressedData + `'>TXT</a> 
                </div>
            </div>
            <br/>
            <br/>`;
} 
