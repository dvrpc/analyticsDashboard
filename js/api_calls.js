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
	}
*/
// Sample queries:

// Top Pages: http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:pagePath&metric=ga:pageviews,ga:sessions,ga:avgTimeOnPage&sortByMetric=true
// Content Drilldown: http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:pagePath&metric=ga:pageviews,ga:sessions,ga:avgTimeOnPage&dimensionFilter=ga:pagePath,^\/Transportation\/Safety\/.*$&sortByMetric=true
// Top Downloads: http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:eventLabel&metric=ga:totalEvents,ga:uniqueEvents&sortByMetric=true&dimensionFilter=ga:eventAction,Download
// Browsers: http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:browser&metric=ga:pageviews&sortByMetric=true
// OS: http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:operatingSystem&metric=ga:pageviews&sortByMetric=true
// Device Category: http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:deviceCategory&metric=ga:pageviews&sortByMetric=true
// Hourly: http://intranet.dvrpc.org/google/analytics?startDate=2017-12-06&endDate=2017-12-06&dimension=ga:hour&metric=ga:pageviews&sortByDimension=true&sortAscending=true
// We don't have realtime data unfortunately, so we can't get realtime active users. Below is a total count of today's users OR we could use the last hour of users from the Hourly query
// Active Users: http://intranet.dvrpc.org/google/analytics?startDate=2017-12-06&endDate=2017-12-06&dimension=ga:hostname&metric=ga:sessions&sortByMetric=true

function activeUsers(params) {

}

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
    $('.section-hourly-users .progress-bar').each(function (i) {
        var x = (i / 24)
        var h = 1 / (( 1/( stdD * Math.sqrt(2 * Math.PI) ) ) * Math.pow(Math.E , -1 * Math.pow(x - mean, 2) / (2 * Math.pow(stdD,2))))
        $(this).height(150 - h * 10)
    })

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