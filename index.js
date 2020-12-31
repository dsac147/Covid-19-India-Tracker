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

async function getNationalData() 
{
    try
    {
        const res = await axios(`https://api.covid19india.org/data.json`);
        const mig = await axios(`https://api.covid19india.org/v3/data.json`);
        this.migrated = mig.data.TT.total.migrated;
        this.totalconfirmed = res.data.cases_time_series[res.data.cases_time_series.length-1].totalconfirmed;
        this.totalrecovered = res.data.cases_time_series[res.data.cases_time_series.length-1].totalrecovered;
        this.totaldeceased = res.data.cases_time_series[res.data.cases_time_series.length-1].totaldeceased;
        this.dailyconfirmed = res.data.cases_time_series[res.data.cases_time_series.length-1].dailyconfirmed;
        this.dailydeceased = res.data.cases_time_series[res.data.cases_time_series.length-1].dailydeceased;
        this.dailyrecovered = res.data.cases_time_series[res.data.cases_time_series.length-1].dailyrecovered;
        this.totalactive = parseInt(this.totalconfirmed)-parseInt(this.totalrecovered)-parseInt(this.totaldeceased)-parseInt(this.migrated);
        this.date = res.data.cases_time_series[res.data.cases_time_series.length-1].date;
        document.querySelector('.cases__active-no').textContent=numberWithCommas(this.totalactive);
        document.querySelector('.cases__total-no').textContent=numberWithCommas(this.totalconfirmed);
        document.querySelector('.cases__recovered-no').textContent=numberWithCommas(this.totalrecovered);
        document.querySelector('.cases__death-no').textContent=numberWithCommas(this.totaldeceased);
        document.querySelector('.cases__total-delta').textContent=`+ ` + numberWithCommas(this.dailyconfirmed);
        document.querySelector('.cases__active-delta').textContent=`As on ` + this.date;
        document.querySelector('.cases__recovered-delta').textContent=`+ ` + numberWithCommas(this.dailyrecovered);
        document.querySelector('.cases__death-delta').textContent=`+ ` + numberWithCommas(this.dailydeceased);
        $(".cases__total").addClass("animate__slideInLeft animate__slow");
        $(".cases__active").addClass("animate__slideInLeft");
        $(".cases__recovered").addClass("animate__slideInRight");
        $(".cases__death").addClass("animate__slideInRight animate__slow");
        if (bpMedium.matches) {
            // window width is at less than 686px
            $(".cases__active").removeClass("animate__slideInLeft");
            $(".cases__active").addClass("animate__slideInRight");
            $(".cases__total").removeClass("animate__slow");
            $(".cases__death").removeClass("animate__slow");
            $(".cases__recovered").removeClass("animate__slideInRight");
            $(".cases__recovered").addClass("animate__slideInLeft");
        }
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
                elements.tested__number.innerHTML=numberWithCommas(resData[stateId].total.tested);
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

google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
        // grab the CSV
    $.get("https://api.covid19india.org/csv/latest/case_time_series.csv", function(csvString) 
    {
            // transform the CSV string into a 2-dimensional array
        var arrayData = $.csv.toArrays(csvString, {onParseValue: $.csv.hooks.castToScalar});
        
        // 0: "Date" string-
        // 1: "Date_YMD" string
        // 2: "Daily Confirmed" number-
        // 3: "Total Confirmed" number
        // 4: "Daily Recovered" number-
        // 5: "Total Recovered" number
        // 6: "Daily Deceased" number
        // 7: "Total Deceased" number

        arrayData[0] = [{label: 'Date', type: 'string'},
        {label: 'Date_YMD', type: 'number'},
        {label: 'Daily Confirmed', type: 'number'},
        {label: 'Total Confirmed', type: 'number'},
        {label: 'Daily Recovered', type: 'number'},
        {label: 'Total Recovered', type: 'number'},
        {label: 'Daily Deceased', type: 'number'},
        {label: 'Total Deceased', type: 'number'}];
            // this new DataTable object holds all the data
        var dataTable = new google.visualization.arrayToDataTable(arrayData);
            
            // this view can select a subset of the data at a time
        var dataView = new google.visualization.DataView(dataTable);
        
        // dataView.setColumns([0,5,3,1]);
        dataView.setColumns([0,6,4,2]);

            //creating a copy of the dataTable to overcome the startup animation bug
        dataView = dataView.toDataTable();

        var options = {
        titlePosition:'none',
        hAxis: {title: 'Date',  titleTextStyle: {color: '#262626', bold: true},showTextEvery: 30,maxAlternation:1,slantedText:true,slantedTextAngle:30,},
        vAxis: {title: 'Cases', minValue: 0,titleTextStyle: {color: '#262626', bold: true},format: 'short'},
        legend:{alignment:'center',textStyle:{ color: '#262626',bold: true}},
        isStacked:false,
        forceIFrame: true,
        areaOpacity: 0.5,
        backgroundColor: '#f9f9f9',
        chartArea:{left:'10%',top:'15%',width:'72%',height:'55%',backgroundColor:'#f9f9f9'},
        colors:['#f20505','#04ad19','#007bff'],
        crosshair: { trigger: 'both' },
        fontName:'Montserrat',
        fontSize:'16',
        animation:{
            startup:true,
            duration: 3000,
            easing: 'out',
          },
        };

        if (bpMedium.matches) {
            // window width is at less than 670px
            options = {
                fontSize:'12',
                titlePosition:'none',
                hAxis: {title: 'Date',  titleTextStyle: {color: '#262626', bold: false},showTextEvery: 60,maxAlternation:1,slantedText:true,slantedTextAngle:45,},
                vAxis: {title: 'Cases', minValue: 0,titleTextStyle: {color: '#262626', bold: false},format: 'short'},
                legend:{alignment:'center',textStyle:{ color: '#262626',bold: false}},
                isStacked: false,
                forceIFrame: true,
                areaOpacity: 0.5,
                backgroundColor: '#f9f9f9',
                chartArea:{left:'10%',top:'15%',width:'65%',height:'55%',backgroundColor:'#f9f9f9'},
                colors:['#f20505','#04ad19','#007bff'],
                crosshair: { trigger: 'both' },
                fontName:'Montserrat',
                animation:{
                    startup:true,
                    duration: 3000,
                    easing: 'out',
                },
            };
        }

        if (bpSmall.matches) {
            // window width is at less than 540px
            options = {
                fontSize:'8',
                titlePosition:'none',
                hAxis: {title: 'Date',  titleTextStyle: {color: '#262626', bold: false},showTextEvery: 60,maxAlternation:1,slantedText:true,slantedTextAngle:60,},
                vAxis: {title: 'Cases', minValue: 0,titleTextStyle: {color: '#262626', bold: false},format: 'short'},
                legend:{alignment:'center',textStyle:{ color: '#262626',bold: false}},
                isStacked: false,
                forceIFrame: true,
                areaOpacity: 0.5,
                backgroundColor: '#f9f9f9',
                chartArea:{left:'10%',top:'15%',width:'60%',height:'55%',backgroundColor:'#f9f9f9'},
                colors:['#f20505','#04ad19','#007bff'],
                crosshair: { trigger: 'both' },
                fontName:'Montserrat',
                animation:{
                    startup:true,
                    duration: 3000,
                    easing: 'out',
                },
            };
    }
        
        var chart = new google.visualization.AreaChart(document.getElementById('chart__div-1'));
        google.visualization.events.addListener(chart, 'ready',
          function() {
            document.querySelector('iframe').loading="lazy";
          });
        chart.draw(dataView, options);
    });
}

//Statewise distribution of cases Map
google.load('visualization', 'current', {'packages': ['geochart'],"mapsApiKey": "AIzaSyBKZkYtQriB88zglKW8JGqHmKI_27qok5c"});
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
        forceIFrame: true,
        magnifyingGlass:{enable: true, zoomFactor: 7.5}
    };

    if (bpSmall.matches) {
        // window width is at less than 540px
        opts = {
            region: 'IN',
            domain: 'IN',
            displayMode: 'regions',
            resolution: 'provinces',
            backgroundColor: '#81d4fa',
            defaultColor: '#f9f9f9',
            colorAxis: {minValue: 0,values: [0,20000,50000,100000],colors: ['#cce5ff','#66b0ff','#3395ff','#007bff']},
            tooltip: {textStyle: { color: '#262626',
                                fontName: 'Montserrat',
                                fontSize: 11,
                                }, showColorCode: true},
            legend: 'none',
            forceIFrame: true,
            magnifyingGlass:{enable: true, zoomFactor: 7.5}
        };
    }

    var geochart = new google.visualization.GeoChart(document.getElementById('visualization'));
    google.visualization.events.addListener(geochart, 'ready',
          function() {
            document.querySelector('iframe').loading="lazy";
          });
    
    geochart.draw(dataView, opts);

    });
}

//insert footer based on size
var footerMarkUp1 = `
    <div class="footer__box">
    <div class="footer__left">
        <div class="footer__left-text">
            <span>Your're still not wearing a mask?</span><br>
            <span>You're part of the problem.</span><br>
            <span>Don't be a <a href="https://www.instagram.com/p/B-Cl5zPgEFj/?igshid=ul9ljnji5bk4" class="footer__left-text-link" target="_blank">covidiot.</a></span>
        </div>
    </div>
    <div class="footer__center">
        <a href="https://www.reddit.com/r/funny/comments/flkwxn/when_fires_arent_the_biggest_problem_anymore/" target="_blank">
                <img src="./img/catwithmask.png" alt="Wear a Mask" class="footer-image">
        </a>
    </div>
    <div class="footer__right">
        <div class="footer__right-text">
            <div class="footer__right-text-github">
                <a href="https://github.com/dsac147/Covid-19-India-Tracker" target="_blank">
                    <svg class="icon icon-github footer__right-text-github-icon"><use xlink:href="img/sprite.svg#icon-github"></use></svg>
                </a>
                <div class="footer__right-text-github-text">
                    <span>Checkout the project on<a href="https://github.com/dsac147/Covid-19-India-Tracker" class="footer__left-text-link" target="_blank"> Github</a></span>
                </div> 
            </div>
            <div>
                <br>All data sourced from <a href="https://api.covid19india.org/" class="footer__right-text-link" target="_blank">COVID-19 India,<br>
                Org Data Operations Group</a>
            </div>
            
        </div>
    </div>
    </div>
`
var footerMarkUp2 = `
    <div class="footer__box">
    <div class="footer__left">
        <div class="footer__left-text">
            <span>Your're still not wearing a mask?</span><br>
            <span>You're part of the problem.</span><br>
            <span>Don't be a <a href="https://www.instagram.com/p/B-Cl5zPgEFj/?igshid=ul9ljnji5bk4" class="footer__left-text-link" target="_blank">covidiot.</a></span>
        </div>
    </div>
    <div class="footer__center">
        <a href="https://www.reddit.com/r/funny/comments/flkwxn/when_fires_arent_the_biggest_problem_anymore/" target="_blank">
                <img src="./img/catwithmask.png" alt="Wear a Mask" class="footer-image">
        </a>
    </div>
    <div class="footer__right">
        <div class="footer__right-text">
            <div>
                All data sourced from <a href="https://api.covid19india.org/" class="footer__right-text-link" target="_blank">COVID-19 India,
                Org Data Operations Group</a>
            </div>
            <div class="footer__right-text-github">
                <a href="https://github.com/dsac147/Covid-19-India-Tracker" target="_blank">
                    <svg class="icon icon-github footer__right-text-github-icon"><use xlink:href="img/sprite.svg#icon-github"></use></svg>
                </a>
                <div class="footer__right-text-github-text">
                    Checkout the project on<a href="https://github.com/dsac147/Covid-19-India-Tracker" class="footer__left-text-link" target="_blank"> Github</a>
                </div> 
            </div>
        </div>
    </div>
    </div>
`
var clickMarkUp = `
<div class="tested__misc">[Click on a state to view it's numbers]</div>
`
var hoverMarkUp = `
<div class="tested__misc">[Hover on a state to view it's numbers]</div>
`

//media queries
var bpLargest = window.matchMedia( "(max-width: 1124px)" );
var bpMedium = window.matchMedia( "(max-width: 850px)" );//850=670
var bpSmall = window.matchMedia( "(max-width: 676px)" );//540

if (bpMedium.matches) {
    // window width is at less than 686px
    document.querySelector('.tested').insertAdjacentHTML('beforeend',clickMarkUp);
}
else{
    document.querySelector('.tested').insertAdjacentHTML('beforeend',hoverMarkUp);
}

if (bpSmall.matches) {
    document.querySelector('.footer').insertAdjacentHTML('beforeend',footerMarkUp2);
    $(".dataTable").removeClass("scroll scroll2");
}
else{
    document.querySelector('.footer').insertAdjacentHTML('beforeend',footerMarkUp1);
    $(".dataTable").addClass("scroll scroll2");
}