'use strict';

const API_KEY = 'UO59leZhmMDtmeu9Fp5nTPOCDuMmYFD63bJbFSBU';
const rootUrl = 'https://api.nasa.gov/planetary/apod?hd=True';

//get today's date
window.onload = todaysDate();

//helper functions
function placeholderSuggestions() {
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
console.log('date string', dateString);
    //if using date-picker
   let year = parseInt(dateString.slice(0, 4));
   console.log(typeof year)
   let monthNum = parseInt(dateString.slice(5, 7));
   const date = parseInt(dateString.slice(-2));
   console.log('date', date);

    return {
      year: year,
      month: monthNum,
      date: date
    }
}

//fallback date picker:https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#Browser_compatibility
// define variables
var nativePicker = document.querySelector('.nativeDatePicker');
var fallbackPicker = document.querySelector('.fallbackDatePicker');
var fallbackLabel = document.querySelector('.fallbackLabel');

var yearSelect = document.querySelector('#year');
var monthSelect = document.querySelector('#month');
var daySelect = document.querySelector('#day');

// hide fallback initially
fallbackPicker.style.display = 'none';
fallbackLabel.style.display = 'none';

// test whether a new date input falls back to a text input or not
var test = document.createElement('input');
test.type = 'date';

// if it does, run the code inside the if() {} block
if(test.type === 'text') {
  // hide the native picker and show the fallback
  nativePicker.style.display = 'none';
  fallbackPicker.style.display = 'block';
  fallbackLabel.style.display = 'block';

  // populate the days and years dynamically
  // (the months are always the same, therefore hardcoded)
  populateDays(monthSelect.value);
  populateYears();
}

function populateDays(month) {
  // delete the current set of <option> elements out of the
  // day <select>, ready for the next set to be injected
  while(daySelect.firstChild){
    daySelect.removeChild(daySelect.firstChild);
  }

  // Create variable to hold new number of days to inject
  var dayNum;

  // 31 or 30 days?
  if(month === 'January' || month === 'March' || month === 'May' || month === 'July' || month === 'August' || month === 'October' || month === 'December') {
    dayNum = 31;
  } else if(month === 'April' || month === 'June' || month === 'September' || month === 'November') {
    dayNum = 30;
  } else {
  // If month is February, calculate whether it is a leap year or not
    var year = yearSelect.value;
    (year - 2016) % 4 === 0 ? dayNum = 29 : dayNum = 28;
  }

  // inject the right number of new <option> elements into the day <select>
  for(i = 1; i <= dayNum; i++) {
    var option = document.createElement('option');
    option.textContent = i;
    daySelect.appendChild(option);
  }

  // if previous day has already been set, set daySelect's value
  // to that day, to avoid the day jumping back to 1 when you
  // change the year
  if(previousDay) {
    daySelect.value = previousDay;

    // If the previous day was set to a high number, say 31, and then
    // you chose a month with less total days in it (e.g. February),
    // this part of the code ensures that the highest day available
    // is selected, rather than showing a blank daySelect
    if(daySelect.value === "") {
      daySelect.value = previousDay - 1;
    }

    if(daySelect.value === "") {
      daySelect.value = previousDay - 2;
    }

    if(daySelect.value === "") {
      daySelect.value = previousDay - 3;
    }
  }
}

function populateYears() {
  // get this year as a number
  var date = new Date();
  var year = date.getFullYear();

  // Make this year, and the 100 years before it available in the year <select>
  for(var i = 0; i <= 100; i++) {
    var option = document.createElement('option');
    option.textContent = year-i;
    yearSelect.appendChild(option);
  }
}

// when the month or year <select> values are changed, rerun populateDays()
// in case the change affected the number of available days
yearSelect.onchange = function() {
  populateDays(monthSelect.value);
}

monthSelect.onchange = function() {
  populateDays(monthSelect.value);
}

//preserve day selection
var previousDay;

// update what day has been set to previously
// see end of populateDays() for usage
daySelect.onchange = function() {
  previousDay = daySelect.value;
}

//listen for click on wikipedia link to open modal
$(".js-wikipedia-search-results").on("click", ".wikiModal", openModal);

function openModal(event) {
  event.preventDefault();
  const modal = $(".modal");
  console.log("inside open modal")
  const url = $(this).data("url");
  // $(".modal-content").append(`<p>${url}</p>`);
    $.get(url, function(data) {
      $(".modal-content").html(data).foundation("open");
    });
  modal.addClass("displayBlock");
}

//listen for click on close button to close modal
$(".modal-content").on("click", ".closeBtn", closeModal);

function closeModal() {
  const modal = $(".modal");
  modal.addClass("displayNone");
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
  // var body = $("#iframe").contents().find("body");

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

  //CORS?
      // return `
      // <video role="application" crossorigin="anonymous" alt="${title}" src="${url}" controls ></video><p>${explanation}</p>
      //   <p>copyright: ${copyright}</p>
      // `

  //why can't height of iframe be adjusted?
  // return `
  //     <p><a alt="link to ${title} article" href="https://en.wikipedia.org/wiki/${url}">${title}</a><div class="box"><iframe src="https://en.wikipedia.org/wiki/${url}" width = "100%" height="70%""></iframe></div></p>
  //     `;

  return `
  <p><a class="wikiModal" data-url="https://en.wikipedia.org/wiki/${url}" alt="link to ${title} article" href="https://en.wikipedia.org/wiki/${url}">${title}</a></p><p>${snippet}</p>
  `;

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
