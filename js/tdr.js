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
    reportLink = "https://crash-stats.mozilla.com/signature/?_sort=-date&signature="
    tdrLog = "&graphics_critical_error=~Detected%20device%20reset&graphics_critical_error=~D3D11%20skip%20BeginFrame%20with%20with%20device-removed&graphics_critical_error=~D3D11%20detected%20a%20device%20reset"
    var onSuccess = function(json) {
        latestVersion = 58
        for (version in json) {
            table = document.getElementById("sig"+version)
            if (version < latestVersion - 2)
                continue;
            count = 0
            for (sig in json[version]) {
                if (count >= 10) break;
                count += 1
                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                cell1.innerHTML = "<a href='" + reportLink + json[version][sig]['term'] + tdrLog + "'>" + json[version][sig]['term'] + "</a>";
                cell2.innerHTML = json[version][sig]['count'];
                cell1.style.width = "90%";
                cell1.style.backgroundColor = "#99ff99";
                cell2.style.backgroundColor = "#ffffcc";
                console.log(sig + " : " + json[version][sig]['count'] + " | " +  json[version][sig]['term'])
            }
        }
    };
    var onError = function (xhr, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
    }

    $.ajax({
        url: "json/crashReports.json",
        dataType: 'json',
    })
    .done(onSuccess)
    .error(onError);

}

drawNormalLineGraph();

drawCrashLineGraph();

showTDRCrashes();
