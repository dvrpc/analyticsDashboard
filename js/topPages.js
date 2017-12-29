// get a hold of the top five cards
const topFive = document.querySelectorAll('.top-page-box')

// looking for todays top five, so StartDate and EndDate are both today's date
const date = new Date().toISOString().slice(0, 10)

const dimensions = 'ga:pagePath'
const metrics = 'ga:pageviews,ga:sessions,ga:avgTimeOnPage'

const topPages = `http://intranet.dvrpc.org/google/analytics?startDate=${date}&endDate=${date}&dimension=${dimensions}&metric=${metrics}&sortByMetric=true&pageSize=5`

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

function getTopPages(url) {
	const request = createCORSRequest('GET', url)
	if (!request) throw new Error('CORS not supported')

	// required headers to allow CORS
	request.setRequestHeader('Access-Control-Allow-Origin', 'http://intranet.dvrpc.org/google/analytics')
	request.setRequestHeader('Vary', 'Origin')


	// get a hold of the value and attach them to the cards
	request.onload = function() {
		const response = JSON.parse(request.response)

		topFive.forEach((card, index) => {
			card.children[0].textContent += response.result.rows[index].dimensions
			card.children[3].textContent = response.result.rows[index].metrics[0].values[0]
			card.children[5].textContent = response.result.rows[index].metrics[0].values[1]
			card.children[7].textContent = Math.floor(response.result.rows[index].metrics[0].values[2]) + ' seconds'
		})
	}

	request.onerror = function() {
		console.log('error making the request')
	}

	request.send()
}

getTopPages(topPages)