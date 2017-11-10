function drawChart(name, dataset) {
    options = {
        series: {
            lines: {
                show: true,
                lineWidth: 1.2
            }
        }
    };
    $.plot($(name), dataset, options);
}
