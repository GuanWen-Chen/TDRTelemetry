function drawLineGraph(fileName, divId) {
    var onSuccess = function(json) {
            var normalLine;
            var color = 0;
            var colorStep = 111;
            normalLine = json;
            var dates = [];
            var versions = [];
            for (date in normalLine) {
                dates.push(date)
            }
            for (version in normalLine[dates[0]]) {
               versions.push(version)
            }
            var dataset = []

            for (version in versions) {
                let localMap = {};
                localMap['label'] = "Firefox" + versions[version];
                let dataArray = [];
                for (d in dates) {
                    dataArray.push([d, normalLine[dates[d]][versions[version]]]);
                }
                localMap['data'] = dataArray;
                localMap['color'] = color;
                color += colorStep;
                dataset.push(localMap);
            }
            drawChart(divId, dataset);
        };
    var onError = function (xhr, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
    }
    $.ajax({
        url: "json/" + fileName,
        dataType: 'json',
    })
    .done(onSuccess)
    .error(onError);

}

function drawNormalLineGraph() {
    drawLineGraph("normalLine.json", "#normalLineGraph");
}

function drawCrashLineGraph() {
    drawLineGraph("crashLine.json", "#crashLineGraph");
}

function showTDRCrashes() {
}

drawNormalLineGraph();

drawCrashLineGraph();

showTDRCrashes();
