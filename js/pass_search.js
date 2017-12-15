const form = document.querySelector('#main-form')
let searchQuery = document.querySelector('#user-input')
let pageURL = ''

searchQuery.onkeyup = function() {
	pageURL = searchQuery.value
}

form.onsubmit = function(){localStorage["page"] = pageURL.slice(14)}