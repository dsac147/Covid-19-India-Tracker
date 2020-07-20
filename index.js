const elements = {
    tested__location : document.querySelector('.tested__location'),
    tested__number : document.querySelector('.tested__number'),
    tableBody : document.querySelector('.table-body')
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function stateName(stateCode) {
    const states = {
        AN : "Andaman and Nicobar Islands",AP : "Andhra Pradesh",AR : "Arunachal Pradesh",AS : "Assam",BR : "Bihar",CH : "Chandigarh",CT : "Chhattisgarh",DL : "Delhi",DN : "Dadra and Nagar Haveli",GA : "Goa",GJ : "Gujarat",HP : "Himachal Pradesh",HR : "Haryana",JH : "Jharkhand",JK : "Jammu and Kashmir",KA : "Karnataka",KL : "Kerala",LA : "Ladakh",LD : "Lakshadweep",MH : "Maharashtra",ML : "Meghalaya",MN : "Manipur",MP : "Madhya Pradesh",MZ : "Mizoram",NL : "Nagaland",OR : "Odisha",PB : "Punjab",PY : "Puducherry",RJ : "Rajasthan",SK : "Sikkim",TG : "Telangana",TN : "Tamil Nadu",TR : "Tripura",TT : "Total",UP : "Uttar Pradesh",UT : "Uttarakhand",WB : "West Bengal"
    };
    return states[stateCode];
}

function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b","t"];
        var suffixNum = Math.floor( (""+value).length/3 );
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
        newValue = shortValue+suffixes[suffixNum];
    }
    return newValue;
}

function dateFormatter(x){
    const date = new Date(x);
    const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: '2-digit' });
    const [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat .formatToParts(date);
    return `${day} ${month} ${year}`;
}

// var totalArr = [];
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
        // for(var i = 0 ; i<res.data.cases_time_series.length ; i++)
        // {
        //     totalArr.push(res.data.cases_time_series[i].totalconfirmed);
        // }
    }
    catch (error)
    {
        alert(error);
    }    
}

getNationalData();

async function getStateData() 
{
    try
    {
        const res = await axios(`https://api.covid19india.org/v3/data.json`);
        const resData = res.data;
        for (var key in resData) {
            if (resData.hasOwnProperty(key)) {
                if (resData[key].total !== undefined) {//total exists
                    var total = resData[key].total
                    if (total.migrated !== undefined){//has migrations
                        if (total.deceased !== undefined) {//has deaths
                            if (key === 'TT')//Total cases
                            {
                                var markUp = `
                                <tr id="${key}">
                                    <td class="total total-name">${stateName(key)}</td>
                                    <td class="total total-total">${abbreviateNumber(total.confirmed)}</td>
                                    <td class="total total-active">${abbreviateNumber(parseInt(total.confirmed)-parseInt(total.recovered)-parseInt(total.deceased)-parseInt(total.migrated))}</td>
                                    <td class="total total-recovered">${abbreviateNumber(total.recovered)}</td>
                                    <td class="total total-deceased">${abbreviateNumber(total.deceased)}</td>
                                </tr>`;
                                document.querySelector('.table-footer').insertAdjacentHTML('beforeend',markUp);
                            }
                            else
                            {
                                markUp = `
                                <tr id="${key}">
                                    <td class="state-name">${stateName(key)}</td>
                                    <td class="state-cases">${abbreviateNumber(total.confirmed)}</td>
                                    <td class="state-cases">${abbreviateNumber(parseInt(total.confirmed)-parseInt(total.recovered)-parseInt(total.deceased)-parseInt(total.migrated))}</td>
                                    <td class="state-cases">${abbreviateNumber(total.recovered)}</td>
                                    <td class="state-cases">${abbreviateNumber(total.deceased)}</td>
                                </tr>`;
                                elements.tableBody.insertAdjacentHTML('beforeend',markUp);
                            }
                        }
                        else{//no deaths
                            markUp = `
                            <tr id="${key}">
                                <td class="state-name">${stateName(key)}</td>
                                <td class="state-cases">${abbreviateNumber(total.confirmed)}</td>
                                <td class="state-cases">${abbreviateNumber(parseInt(total.confirmed)-parseInt(total.recovered)-parseInt(total.migrated))}</td>
                                <td class="state-cases">${abbreviateNumber(total.recovered)}</td>
                                <td class="state-cases">0</td>
                            </tr>`;
                            elements.tableBody.insertAdjacentHTML('beforeend',markUp);
                        }
                    }
                    else{//no migrations
                        if (total.deceased !== undefined) {//has deaths
                            markUp = `
                            <tr id="${key}">
                                <td class="state-name">${stateName(key)}</td>
                                <td class="state-cases">${abbreviateNumber(total.confirmed)}</td>
                                <td class="state-cases">${abbreviateNumber(parseInt(total.confirmed)-parseInt(total.recovered)-parseInt(total.deceased))}</td>
                                <td class="state-cases">${abbreviateNumber(total.recovered)}</td>
                                <td class="state-cases">${abbreviateNumber(total.deceased)}</td>
                            </tr>`;
                            elements.tableBody.insertAdjacentHTML('beforeend',markUp);
                        }
                        else{//no deaths
                            markUp = `
                            <tr id="${key}">
                                <td class="state-name">${stateName(key)}</td>
                                <td class="state-cases">${abbreviateNumber(total.confirmed)}</td>
                                <td class="state-cases">${abbreviateNumber(parseInt(total.confirmed)-parseInt(total.recovered))}</td>
                                <td class="state-cases">${abbreviateNumber(total.recovered)}</td>
                                <td class="state-cases">0</td>
                            </tr>`;
                            elements.tableBody.insertAdjacentHTML('beforeend',markUp);
                        }
                    }
                }
                // else{//total doesnt exist
                //     markUp = `
                //     <tr id="${key}">
                //         <td>${key}</td>
                //         <td colspan="4" class="state-cases__unavailable">Data Unavailable</td>
                //     </tr>`;
                //     elements.tableBody.insertAdjacentHTML('beforeend',markUp);
                // }
            }
        }
        elements.tested__location.textContent='India';
        elements.tested__number.textContent=numberWithCommas(resData.TT.total.tested);
        document.querySelector('.tested__info-date').textContent=`${dateFormatter(resData.TT.meta.tested.last_updated)}`;
        document.querySelector('.tested__info-source').href=`${resData.TT.meta.tested.source}`;

        $('tr').hover(
            function() {
                var stateId = this.id;
                elements.tested__location.textContent = stateName(stateId);
                elements.tested__number.textContent=numberWithCommas(resData[stateId].total.tested);
            },
            function() {
                elements.tested__location.textContent='India';
                elements.tested__number.textContent=numberWithCommas(resData.TT.total.tested);
            }
        );
    }
    catch (error)
    {
        alert(error);
    }    
}

getStateData();

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
