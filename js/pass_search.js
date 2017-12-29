const form = document.querySelector('#main-form')
let searchQuery = document.querySelector('#user-input')
let pageURL = ''

searchQuery.onkeyup = function() {
	pageURL = searchQuery.value
}

// add switch case for the radio button selection 

// pass result of that into the onsubmit function to set the initial date for all the queries 
form.onsubmit = function(){localStorage.setItem('page', pageURL.slice(14))}