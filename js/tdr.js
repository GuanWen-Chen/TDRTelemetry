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
            dates.sort();
            for (version in normalLine[dates[0]]) {
               versions.push(version)
            }
            var dataset = []

            for (version in versions) {
                let localMap = {};
                localMap['label'] = "Firefox" + versions[version];
                let dataArray = [];
                for (d in dates) {
                    dateStr = []
                    dateStr = dates[d].split("-")
                    console.log(dateStr[0] + "~~~~" + dateStr[1] + "~~~~~~" + parseInt(dateStr[2]))
                    plotDate = new Date(parseInt(dateStr[0]), parseInt(dateStr[1]), parseInt(dateStr[2]))
                    plotDate.setDate(plotDate.getDate() - 29)
                    dataArray.push([plotDate.getTime(), normalLine[dates[d]][versions[version]]]);
                    //dataArray.push([new Date(2017, 11 ,1).getTime(), normalLine[dates[d]][versions[version]]]);
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
            var row = table.insertRow(-1);
            var cellsig = row.insertCell(0);
            var cellnum = row.insertCell(1);
            var cellper = row.insertCell(2);
            cellsig.innerHTML = "Signature";
            cellnum.innerHTML = "TRD Number";
            cellper.innerHTML = "Percentage";
            cellsig.style.backgroundColor = "#9999ff";
            cellnum.style.backgroundColor = "#9999ff";
            cellper.style.backgroundColor = "#9999ff";
            cellsig.style.width = "80%";
            cellnum.style.textAlign = "center";;
            cellper.style.textAlign = "center";;

            for (sig in json[version]) {
                if (count >= 10) break;
                count += 1
                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = "<a href='" + reportLink + json[version][sig]['term'] + tdrLog + "'>" + json[version][sig]['term'] + "</a>";
                cell2.innerHTML = json[version][sig]['count'];
                cell3.innerHTML = ((parseFloat(json[version][sig]['count']) / parseFloat(json[version][sig]['total']))*100).toFixed(2);
                cell1.style.width = "80%";
                cell1.style.backgroundColor = "#99ff99";
                cell2.style.backgroundColor = "#ffffcc";
                cell3.style.backgroundColor = "#ffffcc";
                cell2.style.textAlign = "center";
                cell3.style.textAlign = "center";
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
