'use strict';

const API_KEY = 'UO59leZhmMDtmeu9Fp5nTPOCDuMmYFD63bJbFSBU';
const rootUrl = 'https://api.nasa.gov/planetary/apod?hd=True';

//helper functions
function todaysDate() {
  let date = new Date();
  date = new Array(date);
  date = date.slice(2, 5);
  return date;
}

function showErr(err) {
  const outputElem = $(".js-search-results");

  const errMsg = (
    `<p>Please try a different date! Nothing is returned for entry.</p>`
  );

  outputElem
    .prop('hidden', false)
    .html(errMsg);
}

function convertDate(dateString) {
    const monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

    const dateDividers = [".", "/", "-"];
    let date;
    let monthNum;
    //accounts for if the user enters a number for the month
    if (parseInt(dateString.slice(0,2))) {
      monthNum = parseInt(dateString.slice(0,2));

   //accounts for if a user types in 'january' or 'jan'
    } else {
      const monthName = dateString.slice(0, 2).toLowerCase();
      const index = monthNames.findIndex(month => month.slice(0, 2).toLowerCase() === monthName);
      monthNum = index + 1;
    }

    //accounts for year
    const year = parseInt(dateString.slice(-4))

    //accounts for user entering '/' and '-' and ',' and '.'
    for (let i = 0; i < dateDividers.length; i++) {
      let divider = dateDividers[i];
      if (dateString.indexOf(divider) !== -1) {
        date = parseInt(dateString.split(divider)[1]);
        break;
      } else {
        date = parseInt(dateString.split(" ")[1]);
      }
    }

    return {
      year: year,
      month: monthNum,
      date: date
    }
}

//listen for wikipedia search submission
$('.wikipedia-search-form').on('click', '.wiki-button', handleWikipediaFormSubmit);

function handleWikipediaFormSubmit() {
  $("#js-wikipedia-search-form").submit((e) => {
    e.preventDefault();
    console.log('inside handleWikipediaFormSubmit');
    let searchTerm = $("#wiki-query").val();
    $("#wiki-query").val('');
    getWikipediaSearchResults(searchTerm);

  });
}

function getWikipediaSearchResults(searchTerm) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchTerm}&inprop=url&utf8=&format=json`;
  console.log(url);
  console.log('inside getWikipediaSearchResults');
    $.ajax({
  	url: url,
  	dataType: 'jsonp',
  	type: 'POST',
    headers: { 'Api-User-Agent': 'Example/1.0' },
  	success: function(data) {
  		console.log(data)
  		renderWikiSearchResults(data);
  	}
  });
}

function renderWikiSearchResults(data){
  var body = $("#iframe").contents().find("body");

  const output = $(".js-wikipedia-search-results");
  const results = data.query.search.map((item, index) => htmlifyWikiResults(item));

  output
  .prop('hidden', false)

  body
  .html(results);
}

function htmlifyWikiResults(data) {
  const {title, snippet } = data;
  const url = title.split(' ').join('_');
  return `
      <p><a alt="link to ${title} article" href="https://en.wikipedia.org/wiki/${url}">${title}</a><div class="box"><iframe src="https://en.wikipedia.org/wiki/${url}" width = "500px" height = "500px"></iframe></div></p><p>${snippet}</p>
      `;

}

//nasa search form
function htmlifyNasaResults(data) {
    const { copyright="NASA", explanation, hdurl, title, url } = data;

    return `
      <a href="${hdurl}" target="_blank" alt="${title}"><img alt="${title}" src="${url}"></a><p>${explanation}</p>
      <p>copyright: ${copyright}</p>
      `;
}


function renderNasaSearchResults(data) {
  const output = $(".js-nasa-search-results");
  const wikiSearchForm = $(".wikipedia-search-form")
  const results = htmlifyNasaResults(data);
  // console.log(results);
    output
    .prop('hidden', false)
    .html(results);

    wikiSearchForm
    .prop('hidden', false);
}



function handleNasaSubmitForm() {
  $("#js-nasa-search-form").submit((e) => {
    event.preventDefault();
    let searchDate = $("#nasa-query").val();
      console.log(typeof searchDate, searchDate);
    searchDate = convertDate(searchDate);

    $("input").val('');
    getAstronomyPictureOfTheDay(rootUrl, searchDate)

  });

}


function getAstronomyPictureOfTheDay(rootUrl, searchDate) {

	const url = `${rootUrl}&date=${searchDate.year}-${searchDate.month}-${searchDate.date}&api_key=${API_KEY}`;
  console.log(url)
  $.ajax({
  	url: url,
  	dataType: 'json',
  	type: 'GET',
  	success: function(data) {
  		// console.log(data)
  		renderNasaSearchResults(data);
  	}
  });

}

$(handleNasaSubmitForm);
