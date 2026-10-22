// Move-in ready list filters. The cards are already on the page; this only shows and hides them.
(function () {
  'use strict';
  var form = document.querySelector('form[data-filters]');
  var grid = document.querySelector('[data-homes]');
  if (!form || !grid) return;
  var cards = [].slice.call(grid.querySelectorAll('.home-card'));
  var count = form.querySelector('[data-count]'), empty = document.querySelector('[data-empty]');
  var touched = false;

  function apply() {
    var town = form.town.value, price = +form.price.value || 0, beds = +form.beds.value || 0, sqft = +form.sqft.value || 0;
    var one = form.onefloor.checked, th = form.townhome.checked, rear = form.rear.checked, shown = 0;
    cards.forEach(function (c) {
      var d = c.dataset;
      var ok = (!town || d.town === town) && (!price || +d.price < price) && (!beds || +d.beds >= beds) && (!sqft || +d.sqft >= sqft) &&
        (!one || d.stories === '1') && (!th || d.type === 'townhome') && (!rear || d.rear === 'yes');
      c.hidden = !ok; if (ok) shown++;
    });
    count.textContent = shown === cards.length ? cards.length + (cards.length === 1 ? ' home' : ' homes') : shown + ' of ' + cards.length + ' homes match';
    if (empty) empty.hidden = shown > 0;
  }
  form.addEventListener('change', function () {
    apply();
    if (!touched) { touched = true; if (window.ccTrack) window.ccTrack('filter_homes'); }
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  apply();
})();
