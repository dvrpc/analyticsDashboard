// get a hold of the top five cards
const topFive = document.querySelectorAll('.top-page-box')
console.log('the top five boxes ', topFive)

const today = new Date();
console.log('today ', today)

const options = {
	startDate: today,
	endDate: today,
	dimension: ''
}

// CORS issue, will resolve tomorrow with XMLHttpRequest (works with IE 11 so that's huge)
const topPages = 'http://intranet.dvrpc.org/google/analytics?startDate=2017-01-01&endDate=2017-12-01&dimension=ga:pagePath&metric=ga:pageviews,ga:sessions,ga:avgTimeOnPage&sortByMetric=true';
const check = async () => {
	const tops = await fetch(topPages, options)
}

check()

//const getTopFive = fetch('http://intranet.dvrpc.org/google/analytics?startDate=2017-12-06&endDate=2017-12-06&dimension=ga:hostname&metric=ga:sessions&sortByMetric=true')