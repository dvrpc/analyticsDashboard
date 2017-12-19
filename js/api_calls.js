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

// remove www.dvrpc.org/ from input to just get 
const path = localStorage["page"]
// start and end date jawns
const startDate = ''
const endDate = ''

// TODO: UPDATE THE START AND END DATE TO REFLECT WHAT'S ON THE START/END DATE DROPDOWN IN THE PAGE! URGENT!
        //look into combining some of these - already tried browsers + deviceCategory and the result wasn't very workable 

// Content Drilldown:
const contentDrilldown = `http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:pagePath&metric=ga:pageviews,ga:sessions,ga:avgTimeOnPage&dimensionFilter=ga:pagePath,${path}&sortByMetric=true`
// Top Downloads:
const topDownloads = 'http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:eventLabel&metric=ga:totalEvents,ga:uniqueEvents&sortByMetric=true&dimensionFilter=ga:eventAction,Download'
// Browsers: 
const browsers = 'http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:browser&metric=ga:pageviews&sortByMetric=true'
// OS: 
const os = 'http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:operatingSystem&metric=ga:pageviews&sortByMetric=true'
// Device Category: 
const deviceCategory = 'http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:deviceCategory&metric=ga:pageviews&sortByMetric=true'
// Hourly: 
const hourly = 'http://intranet.dvrpc.org/google/analytics?startDate=2017-12-06&endDate=2017-12-06&dimension=ga:hour&metric=ga:pageviews&sortByDimension=true&sortAscending=true'
// We don't have realtime data unfortunately, so we can't get realtime active users. Below is a total count of today's users OR we could use the last hour of users from the Hourly query
// Active Users: 
const activeUsers = 'http://intranet.dvrpc.org/google/analytics?startDate=2017-12-06&endDate=2017-12-06&dimension=ga:hostname&metric=ga:sessions&sortByMetric=true'

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

/***** API calls happen here *****/

// result of getContentDrilldown are the url/metrics for the given path + every path that chains off of it
function drillDownRequest(request) {
/*    const response = JSON.parse(request.response)
    console.log('response is ', response)*/
}
makeRequest(contentDrilldown, drillDownRequest)


// variables and functions for the DEVICES, BROWSERS and OPERATING SYSTEMS sections
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


// returns pageviews in the past hour. results dimensions (time of day) and metrics values (# of visitors)
function hourlyRequest(request) {
    const response = JSON.parse(request.response)
    const max = response.result.maximums[0].values[0]
    console.log('max visitors in a given hour ', max)
    const rows = response.result.rows
    const bar = document.querySelectorAll('.progress-vertical')

    // later optimization: try running the loop backwards in order to use pop instead of shift..
    for(var i = 0; i < 24; i++){
        const hour = rows[0]

        if(hour && hour.dimensions[0] == i){
            console.log('valid comparison of hour ', hour.dimensions[0])
            console.log('valid comparison i ', i)
            const barHeight = (hour.metrics[0].values[0]/max) * 100
            console.log('bar height is ', barHeight)
            bar[i].style.height = `${barHeight}%`
            rows.shift()
        }
    }
}
makeRequest(hourly, hourlyRequest)


// variables and functions for the people online today section
function activeRequest(request) {
    const text = document.querySelector('.active-users')
    const response = JSON.parse(request.response)
    text.textContent = response.result.totals[0].values[0]
}
makeRequest(activeUsers, activeRequest)

// TODO: wrap all of the makeRequest functions in a promise and then execute them with promise.all for speeeeed purposes
// maybe. I don't know if that's actually a great idea. TBD. 


// main function
$(function () {

    // Initial configureation of Start Date and End Date based of of current date
    var d = new Date()
    $('#input-end').val(d.toISOString().slice(0, 10))
    d.setMonth(new Date().getMonth() - 1)
    $('#input-start').val(d.toISOString().slice(0, 10))

    getParameterByName('section') && $('#input-path').val(getParameterByName('section'))

    var stdD = -.00000000001
    var mean = -.000000001

    // VISITORS BY HOUR BARS
/*    $('.section-hourly-users .progress-bar').each(function (i) {
        var x = (i / 24)
        var h = 1 / (( 1/( stdD * Math.sqrt(2 * Math.PI) ) ) * Math.pow(Math.E , -1 * Math.pow(x - mean, 2) / (2 * Math.pow(stdD,2))))
        $(this).height(150 - h * 10)
    })*/

    // Toggles Top Pages and Top Downloads tabs
    $('.nav-tabs a').on('click', function (e) {
        e.preventDefault()
        $($(this).closest('.nav-tabs').find('li').removeClass('active').find('a').map(function () { return $(this).attr('href') }).toArray().join(',')).hide()
        $(this).parent().addClass('active')
        $($(this).attr('href')).show()
    })

    // User Toggles Start Date and End State
    $('#input-start, #input-end').prop('max', new Date().toISOString().slice(0, 10)).on('change', function () {
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
    })
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
}