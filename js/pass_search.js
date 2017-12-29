const form = document.querySelector('#main-form')
let searchQuery = document.querySelector('#user-input')
let pageURL = ''
const timeframe = document.getElementsByName('timeframe')

// get day, month and year for this year
const dateObj = new Date()

/***** set up to create THIS months calendar *****/
const day = dateObj.getDate()
let thisMonth = dateObj.getMonth()
const year = dateObj.getFullYear()

// yyyy-mm-dd
const today = `${year}-${thisMonth}-${day}`

searchQuery.onkeyup = function() {
	pageURL = searchQuery.value
}

// add switch case for the radio button selection


// pass result of that into the onsubmit function to set the initial date for all the queries 
form.onsubmit = function(){
	localStorage.setItem('page', pageURL.slice(14))

	for(var i = 0; i < timeframe.length; i++){
		if(timeframe[i].checked){
			const selectedRange = timeframe[i].id
			console.log('selectedRange is ', selectedRange)
			break
		}
	}

	switch(selectedRange){
		case 'today':
			start = today
			break
		case 'last-week':
			start = ''

	}

	localStorage.setItem('startDate', start)
	localStorage.setItem('endDate', today)
}