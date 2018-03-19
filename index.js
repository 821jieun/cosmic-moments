'use strict';

//api call url
const API_KEY = 'UO59leZhmMDtmeu9Fp5nTPOCDuMmYFD63bJbFSBU';
const rootUrl = 'https://api.nasa.gov/planetary/apod?hd=True';

//monthNames
  const monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

//caching frequently used jQuery selectors
const iFrame = $('#iframe');
const wikiContents = $('#wiki-contents');
const nasaQuery = $('#nasa-query');

//tabs
function activateTab(prefix){
  if (prefix === 'wiki') {
    wikiContents.addClass('has-contents');
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
});

$('body').on('click', '.tab-nav a', ev=>{
  ev.preventDefault()
  const prefix = $(ev.target)
                  .attr('id')
                  .split('-')[0];
  activateTab(prefix);
});

//Loading message
$(document).ajaxStart(function() {
  $('#loading').show();
});

$(document).ajaxStop(function() {
  $('#loading').hide();
});

//get today's date
window.onload = todaysDate();

//on close button, disappear iframe
$('.wiki-entry-iframe').on('click', '.close-button', handleCloseButtonClick);

function handleCloseButtonClick(e) {
  e.preventDefault();
  iFrame.addClass('displayNone');
  iFrame.attr('src', '');
  //make nasa-search section fill the whole screen again
  wikiContents.css('flex-grow', '0');
  $('.close-button').hide();
}

//nasa search form
function htmlifyNasaResults(data) {
    let { copyright='NASA', date, explanation, hdurl, title, url, media_type } = data;
    explanation = annotateWithDandelion(explanation);

    if (media_type === 'image') {
      return `
        <h3 class="title">Title: ${title}</h3>
        <h3>Date: ${date}</h3>
        <a href="${hdurl}" target="_blank" alt="${title}"><span class="sr-only">opens in new window</span><img alt="${title}" src="${url}"></a><p class="nasa-explanation">${explanation}</p>
        <p class="copyright">copyright: ${copyright}</p>
        `;
    }

    if (media_type === 'video') {
      return `
      <h3 class="title">Title: ${title}</h4>
      <h3 class="date">Date: ${date}</h4>
      <iframe class="nasa-video" alt="${title}" src="${url}" width="100%" height="100%"></iframe><p class="nasa-explanation">${explanation}</p>
        <p class="copyright">copyright: ${copyright}</p>
      `
    }
}

function renderNasaSearchResults(data) {
  const output = $('.js-nasa-search-results');
  const wikiSearchForm = $('.wikipedia-search-form')
  const results = htmlifyNasaResults(data);
    output
    .prop('hidden', false)
    .html(results);

    wikiSearchForm
    .prop('hidden', false);
}

function handleNasaSubmitForm() {
    activateTab('search');

  $('#js-nasa-search-form').submit((e) => {
    event.preventDefault();

    if (!iFrame.hasClass('displayNone')) {
      iFrame.addClass('displayNone');
      $('.close-button').css('display', 'none');
      wikiContents.css('flex-grow', '0');
    }

    let searchDate = nasaQuery.val() || altSearchDate();

    searchDate = convertDate(searchDate);

    $('input').val('');
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
  		renderNasaSearchResults(data);
  	},
  error: function(err) {
  const errorMessage = err.responseJSON.msg;
  const outputElem = $('.js-nasa-search-results');
  outputElem
    .prop('hidden', false)
    .html(`<p>${errorMessage}</p>`);
   }
  });
}

$(handleNasaSubmitForm);
