function drawChart(name, dataset) {
    options = {
        series: {
            lines: {
                show: true,
                lineWidth: 2.0
            }
        },
        xaxis: {
            mode: "time",
        }
    };
    $.plot($(name), dataset, options);
}
