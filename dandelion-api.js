
function annotateWithDandelion(explanation){
  const token = '2e0335e9f4b440f7aa8283398c390d69';
  let text = explanation;
  text = encodeURIComponent(text);
  const url = `https://api.dandelion.eu/datatxt/nex/v1/?text=${text}&top_entities=6&include=categories%2Cabstract%2Cimage%2Clod&token=${token}&origin=*`;

    $.ajax({
      url: url,
      dataType: 'json',
      type: 'GET',
      success: function(data) {
        topEntities(explanation, data);
      },
      error: function(err) {
        const errorMessage = 'uh oh! something went awry...please try another date';
        const outputElem = $('.nasa-explanation');
        outputElem
          .prop('hidden', false)
          .html(`<p>${errorMessage}</p>`);
         }
    });
}

function topEntities(explanation, data) {
  const topEntities = data.topEntities; //array of 6 to annotate

  //find the id of these six
  const wordsToAnnotateIds = topEntities.map((entity) => {
    return entity.id;
  });

  matchTextAndUri(explanation, data, wordsToAnnotateIds)
}

function matchTextAndUri(explanation, data, wordsToAnnotateIds) {

  let wordAndUriPairs = data.annotations.map((annotation) => {
    let currentId = annotation.id;
    if (wordsToAnnotateIds.indexOf(currentId) !== -1 ) {
      let uri = annotation.uri;
      let startIndex = annotation.start;
      let endIndex = annotation.end;
      let annotatedText = explanation.slice(startIndex, endIndex);
      return [annotatedText, annotatedText.length, uri];
    }
  });
  wordAndUriPairs = filterArray(wordAndUriPairs);
  findTextAddLink(wordAndUriPairs, explanation);
}

function filterArray(arr) {
  return arr.filter((ele) => ele !== undefined);
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
  $('.nasa-explanation').html(`${explWithLinksHtml}.`);
}

$(".js-nasa-search-results").on('click', '.annotated-link', onAnnotatedLinkClick);

function onAnnotatedLinkClick(e) {
  e.preventDefault();
  const body = iFrame.find('body');
  const uri = $(this).data('uri');
  const output = $('.wiki-entry-iframe');

  iFrame.removeClass('displayNone');
  iFrame.attr('src', uri);

  //ensure that wiki results show up; this will make flex-grow: 1 from flex-grow:0;
  wikiContents.css('flex-grow', '1');

  output
  .prop('hidden', false)

  $('.close-button').show();

  iFrame
  .prop('hidden', false);

  body
  .html(uri)
}
