
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
async function getNationalData() 
{
    try
    {
        const res = await axios(`https://api.covid19india.org/data.json`);
        this.totalconfirmed = res.data.cases_time_series[res.data.cases_time_series.length-1].totalconfirmed;
        this.totalrecovered = res.data.cases_time_series[res.data.cases_time_series.length-1].totalrecovered;
        this.totaldeceased = res.data.cases_time_series[res.data.cases_time_series.length-1].totaldeceased;
        this.dailyconfirmed = res.data.cases_time_series[res.data.cases_time_series.length-1].dailyconfirmed;
        this.dailydeceased = res.data.cases_time_series[res.data.cases_time_series.length-1].dailydeceased;
        this.dailyrecovered = res.data.cases_time_series[res.data.cases_time_series.length-1].dailyrecovered;
        this.totalactive = parseInt(this.totalconfirmed)-parseInt(this.totalrecovered)-parseInt(this.totaldeceased);
        this.date = res.data.cases_time_series[res.data.cases_time_series.length-1].date;
        document.querySelector('.cases__active-no').textContent=numberWithCommas(this.totalactive);
        document.querySelector('.cases__total-no').textContent=numberWithCommas(this.totalconfirmed);
        document.querySelector('.cases__recovered-no').textContent=numberWithCommas(this.totalrecovered);
        document.querySelector('.cases__death-no').textContent=numberWithCommas(this.totaldeceased);
        document.querySelector('.cases__total-delta').textContent=`+ ` + numberWithCommas(this.dailyconfirmed);
        document.querySelector('.cases__active-delta').textContent=`As on ` + this.date;
        document.querySelector('.cases__recovered-delta').textContent=`+ ` + numberWithCommas(this.dailyrecovered);
        document.querySelector('.cases__death-delta').textContent=`+ ` + numberWithCommas(this.dailydeceased);
    }
    catch (error)
    {
        alert(error);
    }    
}

getNationalData();

google.load('visualization', '1', {'packages': ['geochart'],"mapsApiKey": "AIzaSyBKZkYtQriB88zglKW8JGqHmKI_27qok5c"});
google.setOnLoadCallback(drawVisualization);

function drawVisualization() {
    // grab the CSV
    $.get("https://api.covid19india.org/csv/latest/state_wise.csv", function(csvString) {
    // transform the CSV string into a 2-dimensional array
    var arrayData = $.csv.toArrays(csvString, {onParseValue: $.csv.hooks.castToScalar});

    // this new DataTable object holds all the data
    var dataTable = new google.visualization.arrayToDataTable(arrayData);
    
    // this view can select a subset of the data at a time
    var dataView = new google.visualization.DataView(dataTable);

    var changeStateCode = function(dataTable, rownum) {
        // Change State Code to format IN-UK
        return `IN-` + dataTable.getValue(rownum, 7)
    }

    dataView.setColumns([{calc: changeStateCode, type:'string', label: "State Code"}, 0, 4])
    dataView.hideRows([0]);

    var opts = {
        region: 'IN',
        domain: 'IN',
        displayMode: 'regions',
        resolution: 'provinces',
        backgroundColor: '#81d4fa',
        defaultColor: '#f9f9f9',
        colorAxis: {minValue: 0,values: [0,20000,50000,100000],colors: ['#cce5ff','#66b0ff','#3395ff','#007bff']},
        tooltip: {textStyle: { color: '#262626',
                               fontName: 'Montserrat',
                               fontSize: 20,
                               }, showColorCode: true},
        legend: 'none',
    };

    var geochart = new google.visualization.GeoChart(document.getElementById('visualization'));
    geochart.draw(dataView, opts);

    });
}
