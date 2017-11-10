function drawNormalLineGraphFromJson(json) {
    var normalLine;
    console.log("yaya")
    console.log(json)
    normalLine = json;
    var dates = [];
    var versions = [];
    for (date in normalLine) {
        console.log("in!!!");
        dates.push(date)
    }

    for (version in normalLine[dates[0]]) {
        versions.push(version)
    }
    var dataset = []

    for (version in versions) {
        let localMap = {};
        localMap['label'] = version;
        let dataArray = [];
        for (date in dates) {
            dataArray.push([date, normalLine[date][version]]);
        }
        localMap['data'] = dataArray;
        localMap['color'] = "#00FF00";
        dataset.push(localMap);
    }

    drawChart("#normalLineGraph", dataset);
}

function drawNormalLineGraph() {
    var onSuccess = function(json) {
            var normalLine;
            console.log("yaya")
            console.log(json)
            normalLine = json;
            var dates = [];
            var versions = [];
            for (date in normalLine) {
                console.log("in!!!");
                dates.push(date)
            }

            for (version in normalLine[dates[0]]) {
               versions.push(version)
            }
            var dataset = []

            for (version in versions) {
                let localMap = {};
                localMap['label'] = version;
                let dataArray = [];
                for (date in dates) {
                    dataArray.push([date, normalLine[date][version]]);
                }
                localMap['data'] = dataArray;
                localMap['color'] = "#00FF00";
                dataset.push(localMap);
            }

            drawChart("#normalLineGraph", dataset);
        };
    var onError = function (xhr, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
        console.log("WTF");
    }
    $.ajax({
        url: "../json/normalLine.json",
        dataType: 'json',
    })
    .done(onSuccess)
    .error(onError);

/*    $.getJSON(
        "../json/normalLine.json",
        function(json) {
            var normalLine;
            console.log("yaya")
            console.log(json)
            normalLine = json;
            var dates = [];
            var versions = [];
            for (date in normalLine) {
                console.log("in!!!");
                dates.push(date)
            }

            for (version in normalLine[dates[0]]) {
               versions.push(version)
            }
            var dataset = []

            for (version in versions) {
                let localMap = {};
                localMap['label'] = version;
                let dataArray = [];
                for (date in dates) {
                    dataArray.push([date, normalLine[date][version]]);
                }
                localMap['data'] = dataArray;
                localMap['color'] = "#00FF00";
                dataset.push(localMap);
            }

            drawChart("#normalLineGraph", dataset);
        }
    );*/

}

function drawCrashLineGraph() {
    dataset = [
        {label: "Test", data:[[1,1],[2,5],[3,1]], color: "#00FF00"},
        {label: "Test2", data:[[1,2],[2,8],[3,1]], color: "#0000FF"}
    ];
    drawChart("#crashLineGraph", dataset);
}

function showTDRCrashes() {
}

drawNormalLineGraph();

drawCrashLineGraph();

showTDRCrashes();
