(function () {
  var PASS_HASH = "b0e288c299f99c819ca4dddccbb63a547bbf0c95cdfc9eb7e1f850d27ea9cf0c";
  var STORE_KEY = "unlocked";

  var gate = document.getElementById("gate");
  var main = document.getElementById("main");
  var form = document.getElementById("gate-form");
  var input = document.getElementById("pass");
  var error = document.getElementById("gate-error");

  function remembered() {
    try { return localStorage.getItem(STORE_KEY) === PASS_HASH; } catch (e) { return false; }
  }

  function card(app) {
    var a = document.createElement("a");
    a.className = "card focusable";
    a.href = app.url;
    var art = document.createElement("div");
    art.className = "art";
    if (app.image) {
      var img = document.createElement("img");
      img.src = app.image;
      img.alt = "";
      art.appendChild(img);
    } else {
      art.appendChild(document.createTextNode(app.name.charAt(0)));
    }
    var label = document.createElement("div");
    label.className = "label";
    label.appendChild(document.createTextNode(app.name));
    a.appendChild(art);
    a.appendChild(label);
    return a;
  }

  function fill(id, apps) {
    var row = document.getElementById(id);
    for (var i = 0; i < apps.length; i++) row.appendChild(card(apps[i]));
    if (!apps.length) row.parentNode.style.display = "none";
  }

  function unlock() {
    gate.style.display = "none";
    main.style.display = "block";
    fill("top-row", TOP_APPS);
    fill("vod-row", VOD_APPS);
    fill("other-row", OTHER_APPS);
    var first = main.querySelector(".focusable");
    if (first) first.focus();
  }

  form.onsubmit = function (e) {
    e.preventDefault();
    var hash = sha256(input.value.replace(/\s+/g, "").toUpperCase());
    if (hash === PASS_HASH) {
      try { localStorage.setItem(STORE_KEY, PASS_HASH); } catch (err) {}
      unlock();
    } else {
      error.style.visibility = "visible";
      input.value = "";
      input.focus();
    }
  };

  // D-pad navigation: move focus to the nearest focusable in the pressed direction.
  var DIRS = { 37: [-1, 0], 38: [0, -1], 39: [1, 0], 40: [0, 1] };

  function centre(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  document.onkeydown = function (e) {
    var dir = DIRS[e.keyCode];
    if (!dir) return;
    var current = document.activeElement;
    if (current === input && dir[0] !== 0) return;
    var all = document.querySelectorAll(".focusable");
    var items = [];
    for (var i = 0; i < all.length; i++) if (all[i].offsetParent !== null) items.push(all[i]);
    if (!items.length) return;
    e.preventDefault();
    if (!current || items.indexOf(current) === -1) { items[0].focus(); return; }

    var from = centre(current), best = null, bestScore = Infinity;
    for (i = 0; i < items.length; i++) {
      if (items[i] === current) continue;
      var to = centre(items[i]);
      var along = (to.x - from.x) * dir[0] + (to.y - from.y) * dir[1];
      var across = Math.abs((to.x - from.x) * dir[1]) + Math.abs((to.y - from.y) * dir[0]);
      if (along < 10) continue;
      var score = along + across * 3;
      if (score < bestScore) { bestScore = score; best = items[i]; }
    }
    if (best) {
      best.focus();
      if (best.scrollIntoView) best.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  if (remembered()) unlock(); else input.focus();
})();
