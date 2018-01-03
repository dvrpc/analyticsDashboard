const form = document.querySelector('#main-form')
let searchQuery = document.querySelector('#user-input')
let pageURL = ''
const timeframe = document.getElementsByName('timeframe')
let selectedRange = ''

const dateObj = new Date()
const day = dateObj.getDate()
let thisMonth = dateObj.getMonth()
const year = dateObj.getFullYear()
const today = `${year}-${thisMonth +  1}-${day}`

$(function() {
	
    var start = moment().subtract(29, 'days');
    var end = moment()

    function cb(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb)

    cb(start, end)
    
})

searchQuery.onkeyup = function() {
	pageURL = searchQuery.value
}

form.onsubmit = function(){
	localStorage.setItem('page', pageURL.slice(14))

	for(var i = 0; i < timeframe.length; i++){
		if(timeframe[i].checked){
			selectedRange = timeframe[i].id
			break
		}
	}
	
	switch(selectedRange){
		case 'today':
			start = today
			localStorage.setItem('metricsSince', ' Today')
			break
		case 'last-week':
			let lastWeek = new Date(year, thisMonth, day - 7)
			lastWeek = lastWeek.toISOString().slice(0, 10)
			start = lastWeek
			localStorage.setItem('metricsSince', ' Last Week')
			break
		case 'last-month':
			let lastMonth = new Date(year, thisMonth - 1, day)
			lastMonth = lastMonth.toISOString().slice(0, 10)
			start = lastMonth
			localStorage.setItem('metricsSince', ' Last Month')
			break
		case 'last-year':
			let lastYear = new Date(year - 1, thisMonth, day)
			lastYear = lastYear.toISOString().slice(0, 10)
			start = lastYear
			localStorage.setItem('metricsSince', ' Last Year')
			break
		// TODO: create a custom case that:
			// sets start and end date to the custom parameters
			// sets metricsSince as 'startDate : endDate'
	}

	localStorage.setItem('startDate', start)
	localStorage.setItem('endDate', today)
}