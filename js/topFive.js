// get a hold of the top five cards
const topFive = document.querySelectorAll('.top-page-box')

// paramaters to include in the url
const startDate = new Date().toISOString().split('T')[0]
const endDate = 'tbd'
const dimensions = 'ga:pagePath'
const metrics = 'ga:pageviews,ga:sessions,ga:avgTimeOnPage'

const topPages = `http://intranet.dvrpc.org/google/analytics?startDate=${startDate}&endDate=2017-12-15&dimension=${dimensions}&metric=${metrics}&sortByMetric=true`

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
	}else{
		xhr = null
		console.log('ERROR: CORS NOT SUPPORTED IN BROWSER')
	}

	return xhr
}

function getTopFive(url) {
	const request = createCORSRequest('GET', url)

	// required headers to allow CORS
	request.setRequestHeader('Access-Control-Allow-Origin', 'http://intranet.dvrpc.org/google/analytics')
	request.setRequestHeader('Vary', 'Origin')

	if (!getTopFive) throw new Error('CORS not supported')

	request.onload = function() {
		const text = request.responseText
		console.log('request text is ', text)
	}

	request.onerror = function() {
		console.log('error making the request')
	}

	request.send()
}

getTopFive(topPages)