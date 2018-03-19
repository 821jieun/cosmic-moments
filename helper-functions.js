//helper functions
function todaysDate() {
  let n = new Date();
  const y = n.getFullYear();
  const m = n.getMonth();
  const month = monthNames[m];
  const d = n.getDate();
  let date = `${month} ${d} ${y}`;
  $('.todays-date').text(date);
  date = convertDate(date);
  nasaQuery.attr("max", date);
}

function convertDate(dateString) {
    //converting date selected from date-picker to correct format for NASA api
   let year = parseInt(dateString.slice(0, 4));
   let monthNum = parseInt(dateString.slice(6, 8));
   let date = parseInt(dateString.slice(-2))

    return {
      year: year,
      month: monthNum,
      date: date
    }
}

function lessThanTen(num) {
  if (num < 10) {
    return `0${num}`;
  } else {
    return num;
  }
}

function altSearchDate() {
  const year = $('#year').val();

  let month = $('#month').val();
    month = monthNames.indexOf(month) + 1;
    month = lessThanTen(month);

  let day = $('#day').val();
    day = lessThanTen(day);

  return `${year}-${month}-${day}`
}
