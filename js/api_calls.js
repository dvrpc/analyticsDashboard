/* API: http://intranet.dvrpc.org/google/analytics
   Options:
	{
		startDate: <YYYY-MM-dd>
		endDate: <YYYY-MM-dd>
		dimension: <comma-separated> // rows
		metric: <comma-separated>    // columns
		dimensionFilter: <dimension>,<RegExp>
		metricFilter: <metric>,<RegExp>
		sortByMetric: <bool>         // Only first metric sorted
		sortByDimension: <bool>      // Only first dimension sorted
		sortAscending: <bool>        // Default: false
        pageSize: <number> // limits number of pages returned (ex. 5) RETURNS nextPageToken
        pageToken: use nextPageToken from pageSize to get results

	}
*/
console.log('local storage in this moment ', localStorage)
const path = localStorage.getItem('page')

// set the main heading
const mainHeader = document.querySelector('#results-path')
mainHeader.textContent += path

// initial query, hourly and online today are exclusively for todays date
// TODO: have localStorage keys for start and end date and update them on submit. startDate/endDate will be localStorage['startDate'] || today
const today = new Date().toISOString().slice(0, 10)
let startDate = localStorage.getItem('startDate') || today
let endDate = localStorage.getItem('endDate') || today
console.log('start date is ', startDate)
console.log('end date is ', endDate)

/***** API URL's *****/
const subPaths = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:pagePath&metric=ga:pageviews,ga:sessions,ga:avgTimeOnPage&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const browsers = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:browser&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const os = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:operatingSystem&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const deviceCategory = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:deviceCategory&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const hourly = `http://intranet.dvrpc.org/google/analytics?startDate=${today}&endDate=${today}&dimension=ga:hour&metric=ga:pageviews&sortByDimension=true&sortAscending=true&dimensionFilter=ga:pagePath,${path}`
const activeUsers = `http://intranet.dvrpc.org/google/analytics?startDate=${today}&endDate=${today}&dimension=ga:hostname&metric=ga:pageviews&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
const comingFrom = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=${endDate}&dimension=ga:fullReferrer&metric=ga:organicSearches,ga:pageviews,ga:sessions,ga:avgTimeOnPage&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`


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
    rows = rows.length < 10 ? rows : rows.slice(0, 10)

    buildTabTables(rows, subPagesTable)
}

function makeTrafficTable(request) {
    const response = JSON.parse(request.response)

    const organicSearches = response.result.totals[0].values[0]
    const organicHeader = document.querySelector('#organic-searches')
    organicHeader.textContent += organicSearches

    let rows = response.result.rows
    rows = rows.length < 10 ? rows : rows.slice(0, 10)

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


/***** General Functionality (scroll between the tabs, submit startDate/endDate and website search *****/

// Toggles Top Pages and Top Downloads tabs (Make this a function once I include tabs for hourly bar/graph. Or just add that to the current tab jawn)
// This function works but it requires the inline style=display:none for the hidden tabs so at a future date rewrite it in a way that doesn't require that
$('.nav-tabs a').on('click', function (e) {
    e.preventDefault()
    $($(this).closest('.nav-tabs').find('li').removeClass('active').find('a').map(function () { return $(this).attr('href') }).toArray().join(',')).hide()
    $(this).parent().addClass('active')
    $($(this).attr('href')).show()
})

// update query whenever someone toggles startDate, endDate and/or website section
// as it stands, everything in this function only represents the values at their DEFAULT. they don't reflect updates, for some reason.
// look into this. 
const newSearch = document.getElementById('main-form')

function updateData(){
    let start = document.getElementById('input-start')
    start = new Date(start.value).toISOString().slice(0, 10)
    let end = document.getElementById('input-end')
    end = new Date(end.value).toISOString().slice(0, 10)
    let newPath = document.getElementById('input-path')
    newPath = newPath.value.slice(14)

    console.log('newPath value straight up ', newPath)
    console.log('start value is ', start)
    console.log('end value is ', end)

    path != newPath ? localStorage.setItem('page', newPath) : null
    start ? localStorage.setItem('startDate', start) : null
    end ? localStorage.setItem('endDate', end) : null
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


// main function
/*$(function () {

    // Initial configuration of Start Date and End Date based of of current date
    var d = new Date()
    $('#input-end').val(d.toISOString().slice(0, 10))
    d.setMonth(new Date().getMonth() - 1)
    $('#input-start').val(d.toISOString().slice(0, 10))

    getParameterByName('section') && $('#input-path').val(getParameterByName('section'))

    var stdD = -.00000000001
    var mean = -.000000001

    // VISITORS BY HOUR BARS
    $('.section-hourly-users .progress-bar').each(function (i) {
        var x = (i / 24)
        var h = 1 / (( 1/( stdD * Math.sqrt(2 * Math.PI) ) ) * Math.pow(Math.E , -1 * Math.pow(x - mean, 2) / (2 * Math.pow(stdD,2))))
        $(this).height(150 - h * 10)
    })


    // User Toggles Start Date and End State
    time_range()

    // find the inputed Website Section and display the metrics for that particular page
    $('#input-path').on('change', function () {
        history.replaceState({section: $(this).val()}, '', '?section=' + $(this).val())
        update_table()
    })

    $('form').on('submit', function (e) {
        e.preventDefault()
        console.log($(this).serialize())
    })
})


// * Find the webpage the user searched for in Website Section 
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Calculate and display how many users visted over the 30 days inbetween Start and End Date.
function time_range() {
    var days = (new Date($('#input-end').val()) - new Date($('#input-start').val())) / 8.64e+7
    $('.time-range').text('over the ' + (new Date().toISOString().slice(0,10) == $('#input-end').val() ? 'last ' : 'selected ') + (days === 365 ? 'year' : days < 90 ? days % 7 === 0 ? days === 7 ? 'week' : days / 7 + ' weeks' : days + ' days' : ~~(days / 30) + ' months'))

    var total_users = ~~(days * 1602.5)
    var text = ''
    switch (total_users.toString().length) {
        case 1:
        case 2:
        case 3: 
        case 4: text = total_users; break;
        case 5:
        case 6: text = ~~(total_users / 1000) + ' thousand'; break;
        case 7: 
        case 8: 
        case 9: text = ~~(total_users / 1000000) + ' million'; break;
    }

    $('.total-users').text(text)
}

// Update data tables to display data relevant to the page entered in Website Section
function update_table() {
    $('table a').each(function () {
        var i = $('#input-path').val().length
        $(this).html('<span class="subtle">' + $(this).text().slice(0, i) + '</span>' + $(this).text().substr(i))
    }).on('click', function (e) {
        e.preventDefault()
        if ($(this).text().trim().endsWith('/')) {
            $('#input-path').val($(this).text())
        }
    })
}*/