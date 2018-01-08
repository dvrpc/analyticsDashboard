const form = document.querySelector('#main-form')
let searchQuery = document.querySelector('#user-input')

let pageURL = ''
const dateObj = new Date()
const day = dateObj.getDate()
let thisMonth = dateObj.getMonth()
const year = dateObj.getFullYear()
let start = `${year}-${thisMonth +  1}-${day}`
let end = start

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
	start = new Date(dates[0]).toISOString().slice(0, 10)
	end = new Date(dates[1]).toISOString().slice(0, 10)
})

/* TODO: when plugging this in to the main jawn - only update if pageURL, startDate or endDate have values. This allows people to update 
all three, or any combination of the three with predictable results. */
form.onsubmit = function(){
  pageURL = searchQuery.value.slice(14)
	localStorage.setItem('page', pageURL)
	localStorage.setItem('startDate', start)
	localStorage.setItem('endDate', end)
}