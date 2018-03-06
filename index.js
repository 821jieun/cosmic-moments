'use strict';

const API_KEY = 'UO59leZhmMDtmeu9Fp5nTPOCDuMmYFD63bJbFSBU';
const rootUrl = 'https://api.nasa.gov/planetary/apod?hd=True';

//get today's date
window.onload = todaysDate();

//helper functions

function placeholderSuggestions() {
  alert('inside placeholderSuggestions')
  const searchExamples = [ 'Want some suggestions?', 'shooting stars', 'quasars', 'iridescent clouds', 'leo triplet', 'globular cluster', 'great comet', 'solar wind', 'nebula', 'From the Earth to the Moon', 'helix', 'neutron star', 'supernova', 'cosmic dust', 'electromagnetic radiation', 'paradigm shift', 'summer triangle', 'nova delphini' ];
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
   console.log(typeof year)
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
    console.log('inside handleWikipediaFormSubmit');
    let searchTerm = $("#wiki-query").val();
    $("#wiki-query").val('');
    getWikipediaSearchResults(searchTerm);

  });
}

function getWikipediaSearchResults(searchTerm) {

  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchTerm}&inprop=url&utf8=&format=json`;

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
  const output = $(".js-wikipedia-search-results");
  const results = data.query.search.map((item, index) => htmlifyWikiResults(item));

  output
  .prop('hidden', false)

  body
  .html(results);
}

//function to update today's date
function todaysDate() {
  let date = new Date();
  date = new Array(date);
  date = date.slice(2, 5);
  return date;
}

function htmlifyWikiResults(data) {
  const {title, snippet } = data;
  const url = title.split(' ').join('_');

  //CORS?
      // return `
      // <video role="application" crossorigin="anonymous" alt="${title}" src="${url}" controls ></video><p>${explanation}</p>
      //   <p>copyright: ${copyright}</p>
      // `

  //why can't height of iframe be adjusted?
  return `
      <p><a alt="link to ${title} article" href="https://en.wikipedia.org/wiki/${url}">${title}</a><div class="box"><iframe src="https://en.wikipedia.org/wiki/${url}" width = "100%" height="70%" height ="500px"></iframe></div></p>
      `;
}

//lightbox
function handleLightBoxClick() {
  const lbBg = $("#lighboxBg");
  const lb = $("#lightbox");
 alert("in handleLightBoxClick")
  lbBg.addClass("displayBlock");
  lb.addClass("displayBlock")
}

$(".js-nasa-search-results").on("click", "#lightbox", handleLightBoxClick);

$(".js-nasa-search-results").on("click", "#lightboxBg", handleLightBoxBgClick);

function handleLightBoxBgClick() {
  const lbBg = $("#lighboxBg");
  const lb = $("#lightbox");
  lbBg.style.display = "block";
  lb.style.display = "block";
  // lbBg.addClass("dismiss");
  // lb.addClass("dismiss")
}


//nasa search form

function htmlifyNasaResults(data) {
    const { copyright="NASA", explanation, hdurl, title, url, media_type } = data;

    if (media_type === "image") {

      return `
        <a href="${hdurl}" target="_blank" alt="${title}"><img alt="${title}" src="${url}"></a><p>${explanation}</p>
        <p>copyright: ${copyright}</p>
        `;
    }

    if (media_type === "video") {
      return `
      <iframe class="nasa-video" alt="${title}" src="${url}" width="90%" ></iframe><p>${explanation}</p>
        <p>copyright: ${copyright}</p>
      `
    }

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

    placeholderSuggestions();
}

//error handling function
function showErr(err) {
  const outputElem = $(".js-search-results");

  const errMsg = (
    `<p>Please try a different date! Nothing is returned for entry.</p>`
  );

  outputElem
    .prop('hidden', false)
    .html(errMsg);
}

function handleNasaSubmitForm() {
  $("#js-nasa-search-form").submit((e) => {
    event.preventDefault();
    let searchDate = $("#nasa-query").val();
    //   console.log(typeof searchDate, searchDate);
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
  		console.log(data)
  		renderNasaSearchResults(data);
  	},
  error: function(request,status,errorThrown) {

  const outputElem = $(".js-search-results");
  outputElem
    .prop('hidden', false)
    .html(`${errorThrown}`);
  // const errMsg = (
  //   `<p>Please try a different date! Nothing is returned for that entry.</p>`
  // );

  // outputElem
  //   .prop('hidden', false)
  //   .html(errMsg);

   }
  });

}

$(handleNasaSubmitForm);
