'use strict';

const API_KEY = 'UO59leZhmMDtmeu9Fp5nTPOCDuMmYFD63bJbFSBU';
const rootUrl = 'https://api.nasa.gov/planetary/apod?hd=True';

//tabs
function activateTab(prefix){

  if (prefix === 'wiki') {
    $("#wiki-contents").addClass("has-contents");
  }

  //hide all
  $('.tab-content').removeClass('active');
  $('.tab-nav a').removeClass('active');

  //unhide the active ones
  const contents = $(`#${prefix}-contents`);
  contents.addClass('active');
  const navLink = $(`#${prefix}-nav`);
  navLink.addClass('active');

}


  $('body').on('click', '.show-wiki', ev=>{
    ev.preventDefault();
    activateTab('wiki')
  })

  $('body').on('click', '.tab-nav a', ev=>{
    ev.preventDefault()
    const prefix = $(ev.target)
                    .attr('id')
                    .split('-')[0];

    console.log('tab prefix', prefix)
    activateTab(prefix);
  })


//Loading message
$(document).ajaxStart(function() {
  $("#loading").show();
});

$(document).ajaxStop(function() {
  $("#loading").hide();
});

//get today's date
window.onload = todaysDate();

//helper functions
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
  //make nasa-search section fill the whole screen again
  $("#wiki-contents").css("flex-grow", "0");
  // $("#wiki-contents").removeClass("has-contents");
  $(".close-button").hide();
}

function annotateWithDandelion(explanation){
  const token = '2e0335e9f4b440f7aa8283398c390d69';
  let text = explanation;
  text = text.split(" ").join("%20");
  const url = `https://api.dandelion.eu/datatxt/nex/v1/?text=${text}&include=categories%2Cabstract%2Cimage%2Clod&token=${token}&origin=*`;

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
    uri = uri.replace(/^http:/, 'https:')
    uri = uri.replace('en.wikipedia.org', 'en.m.wikipedia.org');

    if (expl.indexOf(word) !== -1) {
      let startIndex = expl.indexOf(word);
      let endIndex = startIndex + pair[1] + 1;

      let beforeWord = expl.slice(0, startIndex);
      let afterWord = expl.slice(endIndex);
      expl = expl.slice(endIndex);
      explWithLinksHtml += ` ${beforeWord}<a class="show-wiki annotated-link" data-uri="${uri}" href="${uri}" alt="link to ${word}">${word}</a>`;

    }


  })
  console.log('this is explanation inside findTextAddLink', `<p class="nasa-explanation">${explWithLinksHtml}</p>`);
  $(".nasa-explanation").html(`${explWithLinksHtml}.`);

}



$(".js-nasa-search-results").on("click", ".annotated-link", onAnnotatedLinkClick);


function onAnnotatedLinkClick(e) {
  e.preventDefault();
  const body = $("#iframe").find("body");
  const uri = $(this).data('uri');
  const output = $(".wiki-entry-iframe");

  // $(".js-wikipedia-search-results").addClass("displayNone");
  $("#iframe").removeClass("displayNone");
  $("#iframe").attr("src", uri);

  //ensure that wiki results show up; this will make flex-grow: 1 from flex-grow:0;
  $("#wiki-contents").css("flex-grow", "1");

  output
  .prop("hidden", false)

  $(".close-button").show();

  $("#iframe")
  .prop("hidden", false);

  body
  .html(uri)
}

//nasa search form
function htmlifyNasaResults(data) {
    let { copyright="NASA", date, explanation, hdurl, title, url, media_type } = data;
    explanation = annotateWithDandelion(explanation);

    if (media_type === "image") {

      return `
        <h3 class="title">Title: ${title}</h3>
        <h3>Date: ${date}</h3>
        <a href="${hdurl}" target="_blank" alt="${title}"><span class="sr-only">opens in new window</span><img alt="${title}" src="${url}"></a><p class="nasa-explanation">${explanation}</p>
        <p class="copyright">copyright: ${copyright}</p>
        `;
    }

    if (media_type === "video") {
      return `
      <h3 class="title">Title: ${title}</h4>
      <h3 class="date">Date: ${date}</h4>
      <iframe class="nasa-video" alt="${title}" src="${url}" width="100%" height="100%"></iframe><p class="nasa-explanation">${explanation}</p>
        <p class="copyright">copyright: ${copyright}</p>
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

}



function handleNasaSubmitForm() {
    activateTab('search');

  $("#js-nasa-search-form").submit((e) => {
    event.preventDefault();

    if (!$("#iframe").hasClass("displayNone")) {
      $("#iframe").addClass("displayNone")
    }


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
