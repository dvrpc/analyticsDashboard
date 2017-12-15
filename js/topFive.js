// get a hold of the top five cards
const topFive = document.querySelectorAll('.top-page-box')

// paramaters to include in the url
const startDate = new Date().toISOString().slice(0, 10)
const endDate = 'tbd'
const dimensions = 'ga:pagePath'
const metrics = 'ga:pageviews,ga:sessions,ga:avgTimeOnPage'

// rn this gets every single page and takes a while. I only need the top 5
const topPages = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=2017-12-15&dimension=${dimensions}&metric=${metrics}&sortByMetric=true&pageSize=5`

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

function getTopFive(url) {
	const request = createCORSRequest('GET', url)
	if (!request) throw new Error('CORS not supported')

	// required headers to allow CORS
	request.setRequestHeader('Access-Control-Allow-Origin', 'http://intranet.dvrpc.org/google/analytics')
	request.setRequestHeader('Vary', 'Origin')


	// get a hold of the value and attach them to the cards
	request.onload = function() {
		const response = JSON.parse(request.response)

		// response.result.rows[index].dimensions = url (ex. '/' for homepage. so output string format will be `dvrpc.org/${val}`)
		// response.result.rows[index].metrics[0].values[0] = pageviews
		// response.result.rows[index].metrics[0].values[1] = sessions
		// response.result.rows[index].metrics[0].values[2] = avgTimeOnPage
		topFive.forEach((card, index) => {
			card.children[0].innerHTML += response.result.rows[index].dimensions
			card.children[3].innerHTML = response.result.rows[index].metrics[0].values[0]
			card.children[5].innerHTML = response.result.rows[index].metrics[0].values[1]
			card.children[7].innerHTML = Math.floor(response.result.rows[index].metrics[0].values[2]) + ' seconds'
		})
	}

	request.onerror = function() {
		console.log('error making the request')
	}

	request.send()
}

getTopFive(topPages)