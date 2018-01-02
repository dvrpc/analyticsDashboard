// query string variables 
// with the changes to the homepage, today will be eliminated and startDate/endDate will always be whatever is the localStorage item
const path = localStorage.getItem('page')
const metricsSince = localStorage.getItem('metricsSince')
let startDate = localStorage.getItem('startDate')
let endDate = localStorage.getItem('endDate')

// set the main heading & the range subheading
const mainHeader = document.querySelector('#results-path')
const rangeHeader = document.getElementById('metrics-start')
mainHeader.textContent += path
rangeHeader.textContent = metricsSince


/***** API URL's *****/
const browsers = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:browser&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const os = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:operatingSystem&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const deviceCategory = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:deviceCategory&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const hourly = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:hour&metric=ga:pageviews&sortByDimension=true&sortAscending=true&dimensionFilter=ga:pagePath,${path}`
const activeUsers = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:hostname&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const subPaths = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:pagePath&metric=ga:pageviews,ga:sessions,ga:avgTimeOnPage&dimensionFilter=ga:pagePath,${path}&pageSize=10&sortByMetric=true`
const comingFrom = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:fullReferrer&metric=ga:organicSearches,ga:pageviews,ga:sessions,ga:avgTimeOnPage&dimensionFilter=ga:pagePath,${path}&pageSize=10&sortByMetric=true`
const dailyGraph = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:date&metric=ga:pageviews&sortAscending=true&dimensionFilter=ga:pagePath,${path}`


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


/***** Pageviews over Time Graph *****/
const addRangeForm = document.getElementById('add-range')
const chartDiv = document.getElementById('chart-div')

function drawChart(request){
    const ogData = []
    const response = JSON.parse(request.response)
    const rows = response.result.rows

    console.log('rows are ', rows)
    rows.forEach(function(row){
        const year = row.dimensions[0].slice(0, 4)
        const month = row.dimensions[0].slice(4, 6) - 1
        const day = row.dimensions[0].slice(6) - 1
        const date = new Date(year, month, day)
        ogData.push({
            x: date,
            y: row.metrics[0].values[0]
        })
    })

    console.log('ogdata is ', ogData)

    const chart = new Chartist.Line(chartDiv, {
        series: [
            {
                name: 'og',
                data: ogData
            }
        ]
    }, {
        showArea: true,
        axisX: {
            type: Chartist.AutoScaleAxis,
            divisor: 5,
            labelInterpolationFnc: function(value){
                return moment(value).format('MMM D')
            }
        }
    })
}

makeRequest(dailyGraph, drawChart)

addRangeForm.onclick = function(){
    let rangeStart = document.getElementById('range-start')
    rangeStart = new Date(rangeStart.value).toISOString().slice(0, 10)
    let rangeEnd = document.getElementById('range-end')
    rangeEnd = new Date(rangeEnd.value).toISOString().slice(0, 10)
    const rangeUrl = `http://intranet.dvrpc.org/google/analytics?startDate=${rangeStart}&endDate=${rangeEnd}&dimension=ga:date&metric=ga:pageviews&sortAscending=true&dimensionFilter=ga:pagePath,${path}`
}


/***** Update timeframe and/or section *****/
const newSearch = document.getElementById('main-form')

function updateData(){
    let start = document.getElementById('input-start')
    start.value ? start = new Date(start.value).toISOString().slice(0, 10) : start = null
    let end = document.getElementById('input-end')
    end.value ? end = new Date(end.value).toISOString().slice(0, 10) : end = null
    let newPath = document.getElementById('input-path')
    newPath = newPath.value.slice(14)

    path != newPath ? localStorage.setItem('page', newPath) : null
    start ? localStorage.setItem('startDate', start) : null
    end ? localStorage.setItem('endDate', end) : null

    console.log('why is update data not doing anything anymore wtf')
}
newSearch.onsubmit = function(){updateData()}
// the conditionals here add an error class to the date picker if the dates are invalid. USE it.
/*    $('#input-start, #input-end').prop('max', new Date().toISOString().slice(0, 10)).on('change', function () {
        if ($(this).val().length === 0 || isNaN(new Date($(this).val())) || new Date() - new Date($(this).val()) < 0) {
            $(this).closest('.form-group').addClass('has-error')
        }
        else if (new Date($('#input-end').val()) - new Date($('#input-start').val()) < 1) {
            $('#input-start, #input-end').closest('.form-group').addClass('has-error')
        }
        else {
            $('#input-start, #input-end').closest('.form-group').removeClass('has-error')
            time_range()
        }
    })*/


/***** General Functionality (scroll between the tabs, submit startDate/endDate and website search *****/

// TODO: rewrite this in vanilla so that I can remove the jQuery dependency 
$('.nav-tabs a').on('click', function (e) {
    e.preventDefault()
    $($(this).closest('.nav-tabs').find('li').removeClass('active').find('a').map(function () { return $(this).attr('href') }).toArray().join(',')).hide()
    $(this).parent().addClass('active')
    $($(this).attr('href')).show()
})


/* TODO (bringing it all together - last step): 
    put every makeRequest function in a main function that executes onpage load, whenever start/end date are updated
    and whenever a new website section is typed into the search bar. Paramaters for the main function will be the
    makeRequest function, startDate and endDate. the dates refresh the query strings (this is gonna be complicated)
    ex:
    mainFunc(startDate, endDate, urlArray){
        urlArray.forEach url => 
        // all the makeRequest functions
    }
*/