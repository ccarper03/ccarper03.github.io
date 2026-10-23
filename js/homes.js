// Move-in ready list filters. The cards are already on the page; this only shows and hides them.
// Shows 12 at a time with a "Show more homes" button, so the list isn't one endless scroll on a phone.
(function () {
  'use strict';
  var form = document.querySelector('form[data-filters]');
  var grid = document.querySelector('[data-homes]');
  if (!form || !grid) return;
  var cards = [].slice.call(grid.querySelectorAll('.home-card'));
  var count = form.querySelector('[data-count]'), empty = document.querySelector('[data-empty]');
  var touched = false, PAGE = 12, limit = PAGE;
  var more = document.createElement('div');
  more.className = 'homes-more';
  more.innerHTML = '<button class="btn btn-line" type="button">Show more homes</button>';
  grid.parentNode.insertBefore(more, grid.nextSibling);
  var moreBtn = more.querySelector('button');

  function apply() {
    var town = form.town.value, price = +form.price.value || 0, beds = +form.beds.value || 0, sqft = +form.sqft.value || 0;
    var one = form.onefloor.checked, th = form.townhome.checked, rear = form.rear.checked, shown = 0;
    cards.forEach(function (c) {
      var d = c.dataset;
      var ok = (!town || d.town === town) && (!price || +d.price < price) && (!beds || +d.beds >= beds) && (!sqft || +d.sqft >= sqft) &&
        (!one || d.stories === '1') && (!th || d.type === 'townhome') && (!rear || d.rear === 'yes');
      if (ok) shown++;
      c.hidden = !ok || shown > limit;
    });
    var visible = Math.min(shown, limit);
    var all = shown === cards.length, next = Math.min(PAGE, shown - visible);
    var total = all ? cards.length + (cards.length === 1 ? ' home' : ' homes') : shown + ' of ' + cards.length + ' homes match';
    count.textContent = visible < shown ? (all ? 'Showing ' + visible + ' of ' + total : total + ' · showing ' + visible) : total;
    more.hidden = visible >= shown;
    moreBtn.textContent = 'Show ' + next + ' more ' + (next === 1 ? 'home' : 'homes');
    if (empty) empty.hidden = shown > 0;
  }
  moreBtn.addEventListener('click', function () {
    var first = cards.filter(function (c) { return c.hidden; })[0];
    limit += PAGE; apply();
    if (first && !first.hidden) { var a = first.querySelector('a'); if (a) a.focus({ preventScroll: true }); }
    if (window.ccTrack) window.ccTrack('more_homes');
  });
  form.addEventListener('change', function () {
    limit = PAGE;
    apply();
    if (!touched) { touched = true; if (window.ccTrack) window.ccTrack('filter_homes'); }
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  apply();
})();
