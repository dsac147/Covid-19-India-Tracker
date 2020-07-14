function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
async function getData() {
    const res = await axios(`https://api.covid19india.org/data.json`);
    this.totalconfirmed = res.data.cases_time_series[res.data.cases_time_series.length-1].totalconfirmed;
    this.totalrecovered = res.data.cases_time_series[res.data.cases_time_series.length-1].totalrecovered;
    this.totaldeceased = res.data.cases_time_series[res.data.cases_time_series.length-1].totaldeceased;
    this.dailyconfirmed = res.data.cases_time_series[res.data.cases_time_series.length-1].dailyconfirmed;
    this.dailydeceased = res.data.cases_time_series[res.data.cases_time_series.length-1].dailydeceased;
    this.dailyrecovered = res.data.cases_time_series[res.data.cases_time_series.length-1].dailyrecovered;
    this.totalactive = parseInt(this.totalconfirmed)-parseInt(this.totalrecovered)-parseInt(this.totaldeceased);
    document.querySelector('.cases__active-no').textContent=numberWithCommas(this.totalactive);
    document.querySelector('.cases__total-no').textContent=numberWithCommas(this.totalconfirmed);
    document.querySelector('.cases__recovered-no').textContent=numberWithCommas(this.totalrecovered);
    document.querySelector('.cases__death-no').textContent=numberWithCommas(this.totaldeceased);
    document.querySelector('.cases__total-delta').textContent=`+` + numberWithCommas(this.dailyconfirmed);
    document.querySelector('.cases__recovered-delta').textContent=`+` + numberWithCommas(this.dailyrecovered);
    document.querySelector('.cases__death-delta').textContent=`+` + numberWithCommas(this.dailydeceased);
}
getData();
