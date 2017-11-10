function drawChart(name, dataset) {
    options = {
        series: {
            lines: {
                show: true,
                lineWidth: 2.0
            }
        }
    };
    $.plot($(name), dataset, options);
}
