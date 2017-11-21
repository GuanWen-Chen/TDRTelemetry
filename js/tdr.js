var latestVersion = 59
var shownVerNum = 3
var tdrLog = "&graphics_critical_error=~Detected%20device%20reset&graphics_critical_error=~D3D11%20skip%20BeginFrame%20with%20with%20device-removed&graphics_critical_error=~D3D11%20detected%20a%20device%20reset"
var reportLink = "https://crash-stats.mozilla.com/signature/?_sort=-date&signature="
var superAPILink = "https://crash-stats.mozilla.com/api/SuperSearch/?product=Firefox"
var timeWindow = 2

function drawLineGraph(json, divId) {
    var color = 0;
    var colorStep = 111;
    var dates = [];
    var dataset = []
    for (date in json[latestVersion]) {
        dates.push(date)
    }
    dates.sort();
    for (version in json) {
        let localMap = {};
        localMap['label'] = "Firefox" + version;
        let dataArray = [];
        if (parseInt(version) < latestVersion - shownVerNum + 1)
            continue
        for (d in dates) {
            dateStr = []
            dateStr = dates[d].split("-")
            plotDate = new Date(parseInt(dateStr[0]), parseInt(dateStr[1]), parseInt(dateStr[2]))
            plotDate.setDate(plotDate.getDate() - 29)
            dataArray.push([plotDate.getTime(), json[version][dates[d]]]);
        }
        localMap['data'] = dataArray;
        localMap['color'] = color;
        color += colorStep;
        dataset.push(localMap);
    }
    drawChart(divId, dataset);
}

function formatJsDate(date) {
    dateS = (date.getDate() < 10)? "0" + date.getDate(): date.getDate();

    return date.getYear() + 1900 + "-" + (date.getMonth() + 1) + "-" + dateS
}

function getSuperAPILink(date, version, isTDR = false) {
    preDate = new Date()
    preDate.setDate(date.getDate() - 1)
    dateStr = "&date>" + formatJsDate(preDate) + "&date=<" + formatJsDate(date)
    verStr = "&version=" + version + ".0a1&version=" + version + ".0&version=" + version +".0b"
    result = superAPILink + dateStr + verStr
    if (isTDR) {
        return result + tdrLog
    }
    return result
}

function drawNormalLineGraph() {
    var onSuccess = function(json) {
            drawLineGraph(json, "#normalLineGraph");
        };
    var onError = function (xhr, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
    }
    $.ajax({
        url: "https://analysis-output.telemetry.mozilla.org/tdr-usage/data/tdr.json",
        dataType: 'json',
    })
    .done(onSuccess)
    .error(onError);
}

function drawCrashLineGraph() {
    var onSuccess = function(json) {
            drawLineGraph(json, "#crashLineGraph");
        };
    var onError = function (xhr, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
    }
    $.ajax({
        url: "json/crashLine.json",
        dataType: 'json',
        beforeSend: function(xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        },
    })
    .done(onSuccess)
    .error(onError);
}

function createTableTitle(table) {
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
}

function showTDRCrashes() {
    var onSuccess = function(json) {
        let body = document.getElementById("body");
        for (version in json) {
            if (parseInt(version) < latestVersion - shownVerNum + 1)
                continue
            let header = document.createElement("h5");
            header.innerText = "Top 10 Signature in Firefox" + version
            body.appendChild(header)

            let table = document.createElement("table");
            if (version < latestVersion - 2)
                continue;
            count = 0
            createTableTitle(table)

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

            body.appendChild(table)
        }
    };
    var onError = function (xhr, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
    }

    $.ajax({
        url: "json/crashReports.json",
        dataType: 'json',
        beforeSend: function(xhr) {
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("application/json");
            }
        },
    })
    .done(onSuccess)
    .error(onError);

}

drawNormalLineGraph();

drawCrashLineGraph();

showTDRCrashes();
