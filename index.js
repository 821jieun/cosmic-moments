'use strict';

const API_KEY = 'UO59leZhmMDtmeu9Fp5nTPOCDuMmYFD63bJbFSBU';
const rootUrl = 'https://api.nasa.gov/planetary/apod?hd=True';

//get today's date
window.onload = todaysDate();

//helper functions
function placeholderSuggestions() {
  const searchExamples = [ 'want some suggestions?', 'shooting stars', 'quasars', 'iridescent clouds', 'leo triplet', 'globular cluster', 'great comet', 'solar wind', 'nebula', 'From the Earth to the Moon', 'helix', 'neutron star', 'supernova', 'cosmic dust', 'electromagnetic radiation', 'paradigm shift', 'summer triangle', 'nova delphini' ];
  setInterval(function() {
    $("input#wiki-query").attr("placeholder", searchExamples[searchExamples.push(searchExamples.shift())-1]);
  }, 3000);
}


function todaysDate() {
  const monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
  let n = new Date();
  const y = n.getFullYear();
  const m = n.getMonth();
  const month = monthNames[m];
  const d = n.getDate();
  let date = `${month} ${d} ${y}`;
  $(".todays-date").text(date);
  date = convertDate(date);
  $("#nasa-query").attr("max", date);

}


function convertDate(dateString) {

    //if using date-picker
   let year = parseInt(dateString.slice(0, 4));
   let monthNum = parseInt(dateString.slice(6, 8));
   let date = parseInt(dateString.slice(-2))

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
    let searchTerm = $("#wiki-query").val();
    $("#wiki-query").val('');
    getWikipediaSearchResults(searchTerm);

  });
}

function getWikipediaSearchResults(searchTerm) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchTerm}&inprop=url&utf8=&format=json&origin=*`;

    $.ajax({
  	url: url,
  	dataType: 'jsonp',
  	type: 'POST',
    headers: { 'Api-User-Agent': 'Example/1.0' },
  	success: function(data) {
      console.log('wiki search results', data)
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
  .html(results);
  // body
  // .html(results);
}

function htmlifyWikiResults(data) {
  const {title, snippet } = data;
  const url = title.split(' ').join('_');

  return `
  <p><a class="wiki-entry" data-url="https://en.wikipedia.org/wiki/${url}" alt="link to ${title} article" href="https://en.wikipedia.org/wiki/${url}">${title}</a></p><p>${snippet}</p>
  `;
}
//on wiki-entry click, have an iframe
$(".js-wikipedia-search-results").on("click", ".wiki-entry", handleWikiEntryClick);

function handleWikiEntryClick(e) {
  var body = $("#iframe").contents().find("body");

  console.log('inside handle wiki entry click')
  e.preventDefault();
  const output = $(".wiki-entry-iframe");
  const url = $(this).data("url");

  $(".js-wikipedia-search-results").addClass("displayNone");
  $("#iframe").removeClass("displayNone");
  $("#iframe").attr("src", url);
  output
  .prop("hidden", false)

  $(".back-button")
  .prop("hidden", false)

  $("#iframe")
  .prop("hidden", false)

  body
  .html(url)

}

//on back arrow, return list of results from earlier
$(".wiki-entry-iframe").on("click", ".back-button", handleBackButtonClick);

function handleBackButtonClick(e) {
  e.preventDefault();
  $(".js-wikipedia-search-results").removeClass("displayNone");
  $("#iframe").addClass("displayNone");
  $("#iframe").attr("src", "");


}
//nasa search form
function htmlifyNasaResults(data) {
    const { copyright="NASA", date, explanation, hdurl, title, url, media_type } = data;
    const placeholderText = `e.g. ${title}`;
    $("#wiki-query").attr("placeholder", placeholderText);

    if (media_type === "image") {


      return `
        <h4 class="title">${title}</h4>
        <h4>Date: ${date}</h4>
        <a href="${hdurl}" target="_blank" alt="${title}"><img alt="${title}" src="${url}"></a><p>${explanation}</p>
        <p>copyright: ${copyright}</p>
        `;
    }

    if (media_type === "video") {
      return `
      <h4 class="title">${title}</h4>
      <h4>Date: ${date}</h4>
      <iframe class="nasa-video" alt="${title}" src="${url}" width="100%" ></iframe><p>${explanation}</p>
        <p>copyright: ${copyright}</p>
      `
    }

}


function renderNasaSearchResults(data) {
  const output = $(".js-nasa-search-results");
  const wikiSearchForm = $(".wikipedia-search-form")
  const results = htmlifyNasaResults(data);
    output
    .prop('hidden', false)
    .html(results);

    wikiSearchForm
    .prop('hidden', false);

    // placeholderSuggestions();
}



function handleNasaSubmitForm() {
  $("#js-nasa-search-form").submit((e) => {
    event.preventDefault();
    let searchDate = $("#nasa-query").val();
    searchDate = convertDate(searchDate);

    $("input").val('');
    getAstronomyPictureOfTheDay(rootUrl, searchDate)

  });

}

function getAstronomyPictureOfTheDay(rootUrl, searchDate) {

	const url = `${rootUrl}&date=${searchDate.year}-${searchDate.month}-${searchDate.date}&api_key=${API_KEY}`;
  $.ajax({
  	url: url,
  	dataType: 'json',
  	type: 'GET',
  	success: function(data) {
      console.log(data)
  		renderNasaSearchResults(data);
  	},
  error: function(err) {
  console.log('error here', err.responseJSON.msg);
  const errorMessage = err.responseJSON.msg;
  const outputElem = $(".js-nasa-search-results");
  outputElem
    .prop('hidden', false)
    .html(`<p>${errorMessage}</p>`);
   }
  });

}

$(handleNasaSubmitForm);
