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


//on close button, disappear iframe
$(".wiki-entry-iframe").on("click", ".close-button", handleCloseButtonClick);

function handleCloseButtonClick(e) {
  e.preventDefault();
  $("#iframe").addClass("displayNone");
  $("#iframe").attr("src", "");
  // $(".close-button").addClass("displayNone");
  $(".close-button").hide();
}

function annotateWithDandelion(explanation){
  const token = '2e0335e9f4b440f7aa8283398c390d69';
  let text = explanation;
  text = text.split(" ").join("%20");
  const url = `https://api.dandelion.eu/datatxt/nex/v1/?text=${text}&include=categories%2Cabstract%2Cimage%2Clod&token=${token}`;

    $.ajax({
      url: url,
      dataType: 'json',
      type: 'GET',
      success: function(data) {
        console.log('annotated dandelion data', data);
        matchTextAndUri(explanation, data);
      },
      error: function(err) {
        console.log(err);
      }
    });
}

function matchTextAndUri(explanation, data) {
  let wordAndUriPairs = data.annotations.map((annotation) => {
    let uri = annotation.uri;
    let startIndex = annotation.start;
    let endIndex = annotation.end;
    let annotatedText = explanation.slice(startIndex, endIndex);
    return [annotatedText, annotatedText.length, uri];
  });
  console.log('wordAndUriPairs here', wordAndUriPairs)
  findTextAddLink(wordAndUriPairs, explanation);
}

function findTextAddLink(wordAndUriPairs, explanation) {
  let explWithLinksHtml = "";
  let expl = explanation;

  wordAndUriPairs.forEach((pair) => {
    let word = pair[0];
    let uri = pair[2];

    if (expl.indexOf(word) !== -1) {
      let startIndex = expl.indexOf(word);
      let endIndex = startIndex + pair[1] + 1;

      let beforeWord = expl.slice(0, startIndex);
      let afterWord = expl.slice(endIndex);
      expl = expl.slice(endIndex);
      // console.log('newly defined expl here', expl);
      explWithLinksHtml += ` ${beforeWord}<a class="annotated-link" data-uri="${uri}" href="${uri}" alt="link to ${word}">${word}</a>`;

    }


  })
  console.log('this is explanation inside findTextAddLink', `<p class="nasa-explanation">${explWithLinksHtml}</p>`);
  $(".nasa-explanation").html(`${explWithLinksHtml}.`);

}



$(".js-nasa-search-results").on("click", ".annotated-link", onAnnotatedLinkClick);

function onAnnotatedLinkClick(e) {
  e.preventDefault();
  const body = $("#iframe").contents().find("body");
  const uri = $(this).data('uri');


  console.log('this is the annotated link clicked on', uri);

  const output = $(".wiki-entry-iframe");

  //need to figure out the problem of not being able to click on a second link without first hitting the x button


  $(".js-wikipedia-search-results").addClass("displayNone");
  $("#iframe").removeClass("displayNone");
  $("#iframe").attr("src", uri);


  output
  .prop("hidden", false)

  $(".close-button").show();
  // .prop("hidden", false)

  $("#iframe")
  .prop("hidden", false)

  body
  .html(uri)
}

//nasa search form
function htmlifyNasaResults(data) {
    let { copyright="NASA", date, explanation, hdurl, title, url, media_type } = data;
    const placeholderText = `e.g. ${title}`;

    explanation = annotateWithDandelion(explanation);
    // if (!explanation) {
    //   explanation = "Loading..."
    // }
    console.log('this is explanation inside htmlifyNasaResults', explanation)

    $("#wiki-query").attr("placeholder", placeholderText);

    if (media_type === "image") {

      return `
        <h4 class="title">${title}</h4>
        <h4>Date: ${date}</h4>
        <a href="${hdurl}" target="_blank" alt="${title}"><span class="sr-only">opens in new window</span><img alt="${title}" src="${url}"></a><p class="nasa-explanation">${explanation}</p>
        <p>copyright: ${copyright}</p>
        `;
    }

    if (media_type === "video") {
      return `
      <h4 class="title">${title}</h4>
      <h4>Date: ${date}</h4>
      <iframe class="nasa-video" alt="${title}" src="${url}" width="100%" height="100%"></iframe><p class="nasa-explanation">${explanation}</p>
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
    // $("#wiki-query").val("");
    // $(".wiki-search-results").hide();
    // $("#iframe").hide();
  });

}

function getAstronomyPictureOfTheDay(rootUrl, searchDate) {

	const url = `${rootUrl}&date=${searchDate.year}-${searchDate.month}-${searchDate.date}&api_key=${API_KEY}`;
  $.ajax({
  	url: url,
  	dataType: 'json',
  	type: 'GET',
  	success: function(data) {
      console.log('get astronomy picture of the day', data)
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
