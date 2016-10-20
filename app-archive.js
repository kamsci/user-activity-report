$(document).ready(function() {
    console.log('ready');
    // FLOW/OPTIMIZATION
    // Create default chart with no data
    // Update chart on ajax call
    // Remove functions from ajax call
    // Handle no data from ajax request

    // Get Data from API //
    $.ajax({
        method: 'GET',
        url: 'https://gist.githubusercontent.com/evanjacobs/c150c0375030dc4de65e9b95784dc894/raw/35c5f455b147703db3989df0cb90f5781c3b312f/usage_data.json'
    }).done(function(data) {
        var data = JSON.parse(data);

        // Identify Chart Variables //
        var time = [];
        var userData = [];
        var searchData = [];
        var customStart = '';
        var customEnd = '';

        // Identify Date Range with data //
        max_Date = data[0].date;
        min_Date = data[0].date;

        for(var k = 1; k < data.length; k++) {
            if(data[k].date > max_Date) { 
                max_Date = data[k].date;
            }
            if(data[k].date < min_Date) {
                min_Date = data[k].date;
            }
        }

        // Create Chart on load with week as default //
        $(window).one( "load", function() {
            createChart();
        });
        
        // HighChart Function
        function createChart() {
            // Reset Chart data to Empty values //
            time = [];
            userData = [];
            searchData = [];

            var dateOption = $("input[name='dateRanges']:checked")[0].id;
            // console.log("dateOption", dateOption, typeof dateOption);

            switch(dateOption){
                case 'week':
                    var latestWeek = moment(max_Date).subtract(6, 'days');
                    latestWeek = moment(latestWeek).format('YYYY-MM-DD');

                    for(var i = 0; i < data.length; i++) {
                        if(data[i].date >= latestWeek && data[i].date <= max_Date) {
                            time.unshift(moment(data[i].date).format('ddd, M-D-YY'));
                            userData.unshift(data[i].users);
                            searchData.unshift(data[i].searches);
                        }
                    }
                    break;
                case 'month':
                    var latestMonth = moment(max_Date).subtract(29, 'days');
                    latestMonth = moment(latestMonth).format('YYYY-MM-DD');

                    for(var i = 0; i < data.length; i++) {
                        if(data[i].date >= latestMonth && data[i].date <= max_Date) {
                            time.unshift(moment(data[i].date).format('ddd, M-D-YY'));
                            userData.unshift(data[i].users);
                            searchData.unshift(data[i].searches);
                        }
                    }
                    break;
                case 'custom':
                    for(var i = 0; i < data.length; i++) {
                        if(data[i].date >= customStart && data[i].date <= customEnd) {
                            time.unshift(moment(data[i].date).format('ddd, M-D-YY'));
                            userData.unshift(data[i].users);
                            searchData.unshift(data[i].searches);
                        }
                    }
                    break;
            }

            // console.log('time', time, 'users', userData, 'search', searchData);

            $('#chart-container').highcharts({
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
                    floating: true,
                    // backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
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
            }); // End HighChart
        }; // End createChart function

        // Re-create chart when form is submitted
        $('#dateData').submit(function() {
            createChart();
            return false;
        }); // end on submit

        // Enable and populate date picker when selected //
        $('#custom').on('click', function() {
            // Enable input fields
            $('#from').removeAttr('disabled');
            $('#to').removeAttr('disabled');

            // Enable Date Picker
            var dateFormat = "mm/dd/yy",
            from = $("#from").datepicker({
                maxDate: new Date(max_Date),
                minDate: new Date(min_Date),
                defaultDate: new Date(max_Date),
                changeMonth: true,
                numberOfMonths: 1
            })
            .on("change", function() {
                var date = getDate(this, 'from');
                to.datepicker("option", "minDate",  date);
                // to.datepicker("option", defaultDate, date);
            }),
            to = $("#to").datepicker({
                maxDate: new Date(max_Date),
                minDate: new Date(min_Date),
                defaultDate: new Date(max_Date),
                changeMonth: true,
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
                    if(source === 'from'){ 
                        customStart = strDate;
                        console.log("from date", date)
                    }
                    if(source === 'to') { 
                        customEnd = strDate 
                        console.log("to date", date)
                    }
                } catch( error ) {
                    date = null;
                }
                return date;
            }

        }); // End #custom onclick

        // Disable and reset datepicker when custom is not selected
        $('#week, #month').on('click', function() {
            $('#from').attr('disabled','disabled');
            $('#to').attr('disabled','disabled');
            $('#from').val('');
            $('#to').val('');
        });

    }); // End ajax request
}); // End Doc Ready