const form = document.querySelector('#main-form')
let searchQuery = document.querySelector('#user-input')
let pageURL = ''
const timeframe = document.getElementsByName('timeframe')
let selectedRange = ''

const dateObj = new Date()
const day = dateObj.getDate()
let thisMonth = dateObj.getMonth()
const year = dateObj.getFullYear()
const today = `${year}-${thisMonth}-${day}`


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
			break
		case 'last-week':
			let lastWeek = new Date(year, thisMonth, day - 7)
			lastWeek = lastWeek.toISOString().slice(0, 10)
			start = lastWeek
			break
		case 'last-month':
			let lastMonth = new Date(year, thisMonth - 1, day)
			lastMonth = lastMonth.toISOString().slice(0, 10)
			start = lastMonth
			break
		case 'last-year':
			let lastYear = new Date(year - 1, thisMonth, day)
			lastYear = lastYear.toISOString().slice(0, 10)
			start = lastYear
			break
	}

	localStorage.setItem('startDate', start)
	localStorage.setItem('endDate', today)
}