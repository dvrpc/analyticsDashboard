// query string variables 
const path = localStorage.getItem('page')
let startDate = localStorage.getItem('startDate')
let endDate = localStorage.getItem('endDate')
let rangeStart;
let rangeEnd = startDate

// set the main heading & the range subheading
const mainHeader = document.querySelector('#results-path')
const rangeHeader = document.getElementById('metrics-start')
mainHeader.textContent += path
rangeHeader.textContent = `${moment(startDate).format('MMM Do YYYY')} - ${moment(endDate).format('MMM Do YYYY')}`


/***** API URL's *****/
const browsers = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:browser&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const os = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:operatingSystem&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const deviceCategory = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:deviceCategory&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const hourly = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:hour&metric=ga:pageviews&sortByDimension=true&sortAscending=true&dimensionFilter=ga:pagePath,${path}`
const activeUsers = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:hostname&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const subPaths = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:pagePath&metric=ga:pageviews,ga:sessions,ga:avgTimeOnPage&dimensionFilter=ga:pagePath,${path}&pageSize=10&sortByMetric=true`
const comingFrom = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:fullReferrer&metric=ga:organicSearches,ga:pageviews,ga:sessions,ga:avgTimeOnPage&dimensionFilter=ga:pagePath,${path}&pageSize=10&sortByMetric=true`
const dailyGraph = startDate != endDate ? `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:date&metric=ga:pageviews&sortAscending=true&dimensionFilter=ga:pagePath,${path}` : hourly


/**** Functions to set up the API Calls *****/
function createCORSRequest(method, url) {
    const xhr = new XMLHttpRequest()

    // handle xmlhttprequest2 objects which have a withCredentials property (most use cases)
    if('withCredentials' in xhr){
        xhr.open(method, url, true)

    // IE uses XDomainRequest objects to make CORS requests
    }else if(typeof XDomainRequest != 'undefined'){
        xhr = new XDomainRequest()
        xhr.open(method, url)

    // if CORS isn't supported by the browser
    }else{xhr = null}

    return xhr
}
function makeRequest(url, callback) {
    const request = createCORSRequest('GET', url)
    if (!request) throw new Error('CORS not supported')

    // required headers to allow CORS
    request.setRequestHeader('Access-Control-Allow-Origin', 'http://intranet.dvrpc.org/google/analytics')
    request.setRequestHeader('Vary', 'Origin')

    request.onload = function() {callback(request)}

    request.onerror = function() {
        console.log('error making the request')
    }

    request.send()
}


/***** variables and function for the Tab tables - Subpages and Traffic Sources *****/
const subPagesTable = document.querySelector('#subpages-content-body')
const trafficTable = document.querySelector('#referral-content-body')

function buildTabTables(rows, tableID){
    rows.forEach(function(subpath){
        // traffic metrics first value is organicSearches which isn't needed here
        const values = subpath.metrics[0].values
        if(values.length > 3) values.shift()

        let row = document.createElement('tr')

        let source = document.createElement('td')
        source.innerHTML = subpath.dimensions[0]
        let sourcePath = document.createElement('a')
        source.appendChild(sourcePath)
        row.appendChild(source)

        let views = document.createElement('td')
        views.classList.add('text-right')
        views.innerHTML = values[0]
        row.appendChild(views)

        let sessions = document.createElement('td')
        sessions.classList.add('text-right')
        sessions.innerHTML = values[1]
        row.appendChild(sessions)

        let timeSpent = document.createElement('td')
        timeSpent.classList.add('text-right')
        timeSpent.innerHTML = Math.round(values[2])+'s'
        row.appendChild(timeSpent)

        tableID.appendChild(row)
    })
}

function makeSubpageTable(request) {
    const response = JSON.parse(request.response)

    let rows = response.result.rows
    buildTabTables(rows, subPagesTable)
}

function makeTrafficTable(request) {
    const response = JSON.parse(request.response)
    const organicSearches = response.result.totals[0].values[0]
    const organicHeader = document.querySelector('#organic-searches')
    organicHeader.textContent += organicSearches

    let rows = response.result.rows
    buildTabTables(rows, trafficTable)
}

makeRequest(subPaths, makeSubpageTable)
makeRequest(comingFrom, makeTrafficTable)


/***** variables and functions for the devices, browsers and operating systems sections *****/
const browserName = document.querySelectorAll('.browser p')
const browserPercentage = document.querySelectorAll('.browser-percent')
const browserProgressBar = document.querySelectorAll('.progress-bar-browser')

const osName = document.querySelectorAll('.os p')
const osPercentage = document.querySelectorAll('.os-percent')
const osProgressBar = document.querySelectorAll('.progress-bar-os')

const deviceName = document.querySelectorAll('.device p')
const devicePercentage = document.querySelectorAll('.device-percent')
const deviceProgressBar = document.querySelectorAll('.progress-bar-device')

function buildTechSection(index, rank, row, total, techName, techPercent, techBar){
    if(index < 4){
        rank.percent = Math.floor((row.metrics[0].values[0] / total) * 100)
        rank.technology = row.dimensions[0]
    } else{
        rank.percent += Math.floor((row.metrics[0].values[0] / total) * 100)
    }
    techName[index].textContent = rank.technology
    techPercent[index].textContent = rank.percent + '%'
    techBar[index].textContent = rank.percent + '%'
    techBar[index].style.width = `${rank.percent}%`
}

function deviceRequest(request) {
    const response = JSON.parse(request.response)
    const result = response.result

    let total = result.totals[0].values[0]
    let first = {percent: 0, technology: ''}
    let second = {percent: 0, technology: ''}
    let third = {percent: 0, technology: ''}

    result.rows.forEach(function(row, index) {
        switch(index){
            case 0:
                buildTechSection(index, first, row, total, deviceName, devicePercentage, deviceProgressBar)
                break
            case 1:
                buildTechSection(index, second, row, total, deviceName, devicePercentage, deviceProgressBar)
                break
            case 2:
                buildTechSection(index, third, row, total, deviceName, devicePercentage, deviceProgressBar)
                break
        }
    })
}

function browserRequest(request) {
    const response = JSON.parse(request.response)
    const result = response.result

    let total = result.totals[0].values[0]
    let first = {percent: 0, technology: ''}
    let second = {percent: 0, technology: ''}
    let third = {percent: 0, technology: ''}
    let fourth = {percent: 0, technology: ''}
    let other = {percent: 0, technology: 'Other'}

    result.rows.forEach(function(row, index) {
        switch(index){
            case 0:
                buildTechSection(index, first, row, total, browserName, browserPercentage, browserProgressBar)
                break
            case 1:
                buildTechSection(index, second, row, total, browserName, browserPercentage, browserProgressBar)
                break
            case 2:
                buildTechSection(index, third, row, total, browserName, browserPercentage, browserProgressBar)
                break
            case 3:
                buildTechSection(index, fourth, row, total, browserName, browserPercentage, browserProgressBar)
                break
            default:
                buildTechSection(4, other, row, total, browserName, browserPercentage, browserProgressBar)
                break
        }
    })
}

function osRequest(request) {
    const response = JSON.parse(request.response)
    const result = response.result

    let total = result.totals[0].values[0]
    let first = {percent: 0, technology: ''}
    let second = {percent: 0, technology: ''}
    let third = {percent: 0, technology: ''}
    let fourth = {percent: 0, technology: ''}
    let other = {percent: 0, technology: 'Other'}

    result.rows.forEach(function(row, index) {
        switch(index){
            case 0:
                buildTechSection(index, first, row, total, osName, osPercentage, osProgressBar)
                break
            case 1:
                buildTechSection(index, second, row, total, osName, osPercentage, osProgressBar)
                break
            case 2:
                buildTechSection(index, third, row, total, osName, osPercentage, osProgressBar)
                break
            case 3:
                buildTechSection(index, fourth, row, total, osName, osPercentage, osProgressBar)
                break
            default:
                buildTechSection(4, other, row, total, osName, osPercentage, osProgressBar)
                break
        }
    })
}

makeRequest(deviceCategory, deviceRequest)
makeRequest(browsers, browserRequest)
makeRequest(os, osRequest)


/***** Page view in the past day, per hour *****/
function hourlyRequest(request) {
    const response = JSON.parse(request.response)
    const max = response.result.maximums[0].values[0]
    const rows = response.result.rows
    const bar = document.querySelectorAll('.progress-vertical')

    // later optimization: try running the loop backwards in order to use pop instead of shift..
    for(var i = 0; i < 24; i++){
        const hour = rows[0]

        if(hour && hour.dimensions[0] == i){
            const barHeight = (hour.metrics[0].values[0]/max) * 100
            bar[i].style.height = `${barHeight}%`
            rows.shift()
        }
    }
}
makeRequest(hourly, hourlyRequest)


/***** Number of people online today *****/
function activeRequest(request) {
    const text = document.querySelector('.active-users')
    const response = JSON.parse(request.response)
    text.textContent = response.result.totals[0].values[0]
}
makeRequest(activeUsers, activeRequest)


/***** Pageviews over Time Graph(s) *****/
const addRangeForm = document.getElementById('add-range')
const chartDiv = document.getElementById('chart-div')

const convertToAMPM = timeString => {
    if(!timeString) return ''
    let hours = +timeString.substr(0, 2)
    const hoursFormatted = (hours % 12) || 12
    let amORpm = hours < 12 ? 'a' : 'p'
    const formattedTime = hoursFormatted + timeString.substr(2, 3) + amORpm
    return formattedTime
}

// I hate that this entire plugin is needed JUST to have axes titles. Absurd. TODO: swith to something other than Chartist.js
/**
 * Chartist.js plugin to display a title for 1 or 2 axes.
 * version 0.0.4
 * author: alex stanbury
 */
/* global Chartist */
(function (window, document, Chartist) {
    var axisDefaults = {
        axisTitle: '',
        axisClass: 'ct-axis-title',
        offset: {
            x: 0,
            y: 0
        },
        textAnchor: 'middle',
        flipTitle: false
    };

    var defaultOptions = {
        axisX: axisDefaults,
        axisY: axisDefaults
    };

    var getTitle = function (title) {
        if (title instanceof Function) {
            return title();
        }
        return title;
    };

    var getClasses = function (classes) {
        if (classes instanceof Function) {
            return classes();
        }
        return classes;
    };

    Chartist.plugins = Chartist.plugins || {};
    Chartist.plugins.ctAxisTitle = function(options) {

        options = Chartist.extend({}, defaultOptions, options);

        return function ctAxisTitle(chart) {

            chart.on('created', function(data) {

                if (!options.axisX.axisTitle && !options.axisY.axisTitle) {
                    throw new Error(
                        'ctAxisTitle plugin - You must provide at least one axis title'
                    );
                } else if (!data.axisX && !data.axisY) {
                    throw new Error(
                        'ctAxisTitle plugin can only be used on charts that have at least one axis'
                    );
                }

                var xPos,
                    yPos,
                    title,
                    chartPadding = Chartist.normalizePadding(data.options.chartPadding); // normalize the padding in case the full padding object was not passed into the options

                //position axis X title
                if (options.axisX.axisTitle && data.axisX) {

                    xPos = (data.axisX.axisLength / 2) + data.options.axisY.offset +
                        chartPadding.left;

                    yPos = chartPadding.top;

                    if (data.options.axisY.position === 'end') {
                        xPos -= data.options.axisY.offset;
                    }

                    if (data.options.axisX.position === 'end') {
                        yPos += data.axisY.axisLength;
                    }

                    title = new Chartist.Svg("text");
                    title.addClass(getClasses(options.axisX.axisClass));
                    title.text(getTitle(options.axisX.axisTitle));
                    title.attr({
                        x: xPos + options.axisX.offset.x,
                        y: yPos + options.axisX.offset.y,
                        "text-anchor": options.axisX.textAnchor
                    });

                    data.svg.append(title, true);

                }

                //position axis Y title
                if (options.axisY.axisTitle && data.axisY) {
                    xPos = 0;


                    yPos = (data.axisY.axisLength / 2) + chartPadding
                            .top;

                    if (data.options.axisX.position === 'start') {
                        yPos += data.options.axisX.offset;
                    }

                    if (data.options.axisY.position === 'end') {
                        xPos = data.axisX.axisLength;
                    }

                    var transform = 'rotate(' + (options.axisY.flipTitle ? -
                                90 : 90) + ', ' + xPos + ', ' + yPos + ')';

                    title = new Chartist.Svg("text");
                    title.addClass(getClasses(options.axisY.axisClass));
                    title.text(getTitle(options.axisY.axisTitle));
                    title.attr({
                        x: xPos + options.axisY.offset.x,
                        y: yPos + options.axisY.offset.y,
                        transform: transform,
                        "text-anchor": options.axisY.textAnchor
                    });
                    data.svg.append(title, true);
                }
            });
        };
    };
}(window, document, Chartist));

function drawChart(request, chartDiv, start, end){
    const initialChartData = []

    const response = JSON.parse(request.response)
    const rows = response.result.rows
    let date;

    rows.forEach(function(row){
        if(row.dimensions[0].length === 2){
            date = [row.dimensions[0]]
        }else{
            const year = row.dimensions[0].slice(0, 4)
            const month = row.dimensions[0].slice(4, 6) - 1
            const day = row.dimensions[0].slice(6) - 1
            date = new Date(year, month, day)
        }
        initialChartData.push({
            x: date,
            y: row.metrics[0].values[0]
        })
    })

    const chart = new Chartist.Line(chartDiv, {
        series: [
            {
                name: 'Original',
                data: initialChartData
            }
        ]
    }, {
        showArea: true,
        axisX: {
            type: Chartist.AutoScaleAxis,
            labelInterpolationFnc: function(value){
                if(start === end) {
                    const hours = ''+Math.floor(value)
                    return convertToAMPM(hours)
                }else{
                    return moment(value).format('MMM D')
                }
            }
        },
        plugins: [
            Chartist.plugins.ctAxisTitle({
                axisY: {
                    axisTitle: 'Page Views',
                    offset: {
                        x: 0,
                        y: 12
                    },
                    flipTitle: true
                },
                axisX: {
                    axisTitle: 'Time',
                    offset: {
                        x: 0,
                        y: 35
                    }
                }
            })
        ]
    })
}

// helper function to deal with some scoping stuff
function invokeChart(request){
    drawChart(request, chartDiv, startDate, endDate)
}

makeRequest(dailyGraph, invokeChart)

addRangeForm.onclick = function(){
    let radioButtons = document.getElementsByName('comp')
    let selectedRadioButton;
    let rangeURL;

    let startDay = startDate.substring(8)
    let startMonth = startDate.substring(5, 7) - 1
    let startYear = startDate.substring(0, 4)
    const date = new Date(startYear, startMonth, startDay)
    
    // get the checked radio button
    for(var i = 0; i < radioButtons.length; i++){
        if(radioButtons[i].checked){
            selectedRadioButton = radioButtons[i].value
            break;
        }
    }

    // build yesterday/lastweek/lastmonth/lastyear from startDate
    switch(selectedRadioButton){
        case 'day':
            date.setDate(startDay - 1)
            const yesterday = date.toISOString().slice(0, 10)
            rangeEnd = rangeStart = yesterday
            // have to make an hourly request for a single day comparison - date request for single day only returns 1 value
            rangeURL = `http://intranet.dvrpc.org/google/analytics?startDate=${rangeStart}&endDate=${rangeEnd}&dimension=ga:hour&metric=ga:pageviews&sortByDimension=true&sortAscending=true&dimensionFilter=ga:pagePath,${path}`
            break
        case 'week':
            date.setDate(startDay - 7)
            const lastWeek = date.toISOString().slice(0, 10)
            rangeStart = lastWeek
            break
        case 'month':
            date.setMonth(startMonth - 1)
            const lastMonth = date.toISOString().slice(0, 10)
            rangeStart = lastMonth
            break
        case 'year':
            rangeStart = startYear - 1 + startDate.slice(4)
            break
    }

    rangeURL ? null : rangeURL = `http://intranet.dvrpc.org/google/analytics?startDate=${rangeStart}&endDate=${rangeEnd}&dimension=ga:date&metric=ga:pageviews&sortAscending=true&dimensionFilter=ga:pagePath,${path}`
    makeRequest(rangeURL, addRange)
}

let compared = false
function addRange(request){
    let rangeChart;

    if(!compared){    
        rangeChart = document.createElement('div')
        rangeChart.id = 'comparison-chart'
        rangeChart.classList.add('ct-chart', 'ct-series-e', 'ct-major-twelfth')
        const parentDiv = document.getElementById('charts')
        parentDiv.insertAdjacentElement('afterbegin', rangeChart)
        compared = true
    }else rangeChart = document.getElementById('comparison-chart')

    drawChart(request, rangeChart, rangeStart, rangeEnd)
}

/***** General Functionality (scroll between the tabs, submit startDate/endDate and website search *****/

// TODO: rewrite this in vanilla so that I can remove the jQuery dependency 
$('.nav-tabs a').on('click', function (e) {
    e.preventDefault()
    $($(this).closest('.nav-tabs').find('li').removeClass('active').find('a').map(function () { return $(this).attr('href') }).toArray().join(',')).hide()
    $(this).parent().addClass('active')
    $($(this).attr('href')).show()
})

/*// get a handle of the clicked one (give each tab a class)
let activeTab = document.querySelector('.active')
let tabs = document.querySelectorAll('.active li')
// get a handle of 'visible'
// if( clicked != visible){
    //clicked.classList.add(visible)
    //visible.classList.remove(visible)
// tricky part: need to make the corresponding divs visible. do later.*/