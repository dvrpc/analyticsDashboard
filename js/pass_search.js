const form = document.querySelector('#main-form')
let searchQuery = document.querySelector('#user-input')

let pageURL = ''
const dateObj = new Date()
const day = dateObj.getDate()
let thisMonth = dateObj.getMonth()
const year = dateObj.getFullYear()
let startDate = `${year}-${thisMonth +  1}-${day}`
let endDate = startDate

$(function() {

    let start = moment()
    let end = moment()

    function displayDate(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, displayDate)

    displayDate(start, end)
})

$('#reportrange').on('apply.daterangepicker', function(event, picker) {
	const dates = this.textContent.split('-')
	startDate = new Date(dates[0]).toISOString().slice(0, 10)
	endDate = new Date(dates[1]).toISOString().slice(0, 10)
})

searchQuery.onkeyup = function() {
	pageURL = searchQuery.value
}

form.onsubmit = function(){
	localStorage.setItem('page', pageURL.slice(14))
	localStorage.setItem('startDate', startDate)
	localStorage.setItem('endDate', endDate)
}