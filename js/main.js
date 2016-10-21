$(document).ready(function() {

    //** IDENTIFY GLOBAL VARIABLES **//
    var data = [];

    var time = [];
    var userData = [];
    var searchData = [];
    
    var customStart = '';
    var customEnd = '';

    var max_Date = '';
    var min_Date = '';

    //** CREATE DEFAULT CHART VARIABLE WITH NO DATA **//
    var userActivityChart = {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: 'Count of User Searches over Count of Users'
        },
        subtitle: {
            text: 'Searches displayed in a line graph | Users displayed in a bar chart'
        },
        xAxis: [{
            categories: time,
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[3]
                }
            },
            title: {
                text: 'Searches',
                style: {
                    color: Highcharts.getOptions().colors[3]
                }
            }
        }, { // Secondary yAxis
            title: {
                text: 'Users',
                style: {
                    color: Highcharts.getOptions().colors[4]
                }
            },
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[4]
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            x: 120,
            verticalAlign: 'top',
            y: 20,
            floating: true
        },
        series: [{
            name: 'Users',
            type: 'column',
            yAxis: 1,
            data: userData,
            color: Highcharts.getOptions().colors[4],
            tooltip: {
                valueSuffix: ' unique users'
            }

        }, {
            name: 'Searches',
            type: 'spline',
            data: searchData,
            color: Highcharts.getOptions().colors[3],
            tooltip: {
                valueSuffix: ' searches'
            }
        }]
    };

    //** ADD userActivityChart TO DIV **//
    $('#chart-container').highcharts(userActivityChart);
    
    //** UPDATE HIGHCHART WITH DATA SELECTION **//
    function updateChart() {

        time = [];
        userData = [];
        searchData = [];

        var dateOption = $("input[name='dateRanges']:checked")[0].id;

        switch(dateOption){
            case 'week':
                var latestWeek = moment(max_Date).subtract(6, 'days');
                latestWeek = moment(latestWeek).format('YYYY-MM-DD');

                for(var i = 0; i < data.length; i++) {
                    if(data[i].date >= latestWeek && data[i].date <= max_Date) {
                        pushData(data);
                    }
                }
                break;
            case 'month':
                var latestMonth = moment(max_Date).subtract(29, 'days');
                latestMonth = moment(latestMonth).format('YYYY-MM-DD');

                for(var i = 0; i < data.length; i++) {
                    if(data[i].date >= latestMonth && data[i].date <= max_Date) {
                        pushData(data);
                    }
                }
                break;
            case 'custom':
                for(var i = 0; i < data.length; i++) {
                    if(data[i].date >= customStart && data[i].date <= customEnd) {
                        pushData(data);
                    }
                }
                break;

            function pushData(data) {
                time.unshift(moment(data[i].date).format('ddd, M-D-YY'));
                userData.unshift(data[i].users);
                searchData.unshift(data[i].searches);
            }
        }

        // Update Chart Series Data
        userActivityChart.xAxis[0].categories = time;
        userActivityChart.series[0].data = userData;
        userActivityChart.series[1].data = searchData;

        $('#chart-container').highcharts(userActivityChart);

    };

    //** CALL updateChart FUNCTION WHEN FORM IS SUBMITTED **//
    $('#dateData').submit(function() {
        updateChart();
        return false;
    });

    //** ENABLE/POPULATE DATEPICKER **//
    $('#custom').on('click', function() {
        // Enable input fields
        $('#from').removeAttr('disabled');
        $('#to').removeAttr('disabled');

        // Enable Date Picker
        var dateFormat = "mm/dd/yy",
        from = $("#from").datepicker({
            maxDate: new Date(moment(max_Date).format()),
            minDate: new Date(moment(min_Date).format()),
            defaultDate: new Date(moment(max_Date).format()),
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1
        })
        .on("change", function() {
            var date = getDate(this, 'from');
            to.datepicker("option", "minDate",  date);
        }),
        to = $("#to").datepicker({
            maxDate: new Date(moment(max_Date).format()),
            minDate: new Date(moment(min_Date).format()),
            defaultDate: new Date(moment(max_Date).format()),
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1
        })
        .on( "change", function() {
            from.datepicker( "option", "maxDate", getDate(this, 'to') );
        });

        function getDate(element, source) {
            var date;
            var strDate;
            try {
                date = $.datepicker.parseDate(dateFormat, element.value);
                strDate = JSON.stringify(date).substring(1, 11)

                if(source === 'from') { customStart = strDate; }
                if(source === 'to') { customEnd = strDate; }
            } catch( error ) { date = null; }
            return date;
        }
    });

    //** DISABLE AND RESET DATEPICKER WHEN CUSTOM IS NOT CHECKED **//
    $('#week, #month').on('click', function() {
        $('#from').attr('disabled','disabled');
        $('#to').attr('disabled','disabled');
        $('#from').datepicker('destroy');
        $('#to').datepicker('destroy');
        $('#from').val('');
        $('#to').val('');
    });

    //** GET DATA FROM API **//
    $.ajax({
        method: 'GET',
        url: 'https://gist.githubusercontent.com/evanjacobs/c150c0375030dc4de65e9b95784dc894/raw/35c5f455b147703db3989df0cb90f5781c3b312f/usage_data.json'
    }).done(function(returnData) {
        // Set returnData to Global 'data' Variable
        data = JSON.parse(returnData);

        // Identify Date Range that contains data to report
        max_Date = data[0].date;
        min_Date = data[data.length -1].date;

        // Verify that dates are in order
        for(var k = 1; k < data.length; k++) {
            if(data[k].date > max_Date) { 
                max_Date = data[k].date;
            }
            if(data[k].date < min_Date) {
                min_Date = data[k].date;
            }
        }

        // Update Chart using Global Variable: 'data'
        updateChart();
    })
    .fail(function(err) {
        $('#noData').text('Data Not Available');
    })

}); // End Doc Ready