(function () {
  "use strict";
  var brief = window.ANIMVERSE_BRIEF;
  var byId = function (id) { return document.getElementById(id); };
  var el = function (tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  var time = 0;
  var shotIndex = -1;
  var playing = false;
  var timer = null;
  var lastTick = null;
  var speed = 1;
  var filter = "All";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var tabs = [];
  var format = function (seconds) { return "00:" + seconds.toFixed(1).padStart(4, "0"); };
  var clock = function (seconds) { return "00:" + String(seconds).padStart(2, "0"); };

  function externalLink(label, url) {
    var link = el("a", "", label);
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  brief.shots.forEach(function (shot, index) {
    var button = el("button", "shot-tab");
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Shot " + shot.id + ": " + shot.title + ", " + shot.start + " to " + shot.end + " seconds");
    button.append(el("span", "tab-index", shot.id), el("span", "tab-title", shot.title), el("span", "tab-duration", (shot.end - shot.start).toFixed(1) + " SEC"));
    button.addEventListener("click", function () { selectShot(index); });
    tabs.push(button);
    byId("shot-strip").append(button);
  });

  var svgNS = "http://www.w3.org/2000/svg";
  [345, 655].forEach(function (x) {
    [170, 215, 260, 305].forEach(function (y) {
      var circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", "11");
      circle.setAttribute("fill", "#251d34");
      circle.setAttribute("stroke", "#a28abc");
      byId("soldiers").append(circle);
    });
  });

  function renderShot(index) {
    var shot = brief.shots[index];
    tabs.forEach(function (tab, i) { tab.setAttribute("aria-pressed", String(i === index)); });
    byId("stage").dataset.shot = shot.stage;
    byId("stage-shot").textContent = shot.id + " / " + shot.title.toUpperCase();
    byId("stage-line").textContent = shot.line;
    byId("stage-lens").textContent = shot.camera.split(" · ")[0].toUpperCase();
    byId("shot-range").textContent = clock(shot.start) + " — " + clock(shot.end);
    byId("shot-count").textContent = shot.id + " / 06";
    byId("shot-title").textContent = shot.title;
    byId("shot-action").textContent = shot.action;
    byId("shot-camera").textContent = shot.camera;
    byId("shot-composition").textContent = shot.composition;
    byId("shot-light").textContent = shot.light + " " + shot.effect;
    byId("shot-sound").textContent = shot.sound;
    byId("shot-purpose").textContent = shot.purpose;
    byId("map-title").textContent = shot.title + ": overhead camera blocking";
    byId("map-description").textContent = shot.composition + " " + shot.camera + ". The diagram represents camera and character placement.";
    byId("previous").disabled = index === 0;
    byId("next-shot").disabled = index === brief.shots.length - 1;
    byId("shot-announcement").textContent = "Shot " + shot.id + ", " + shot.title;
    var camera = shot.cameraPosition;
    var target = shot.cameraTarget;
    var spread = index === 1 ? 24 : index === 2 ? 42 : 95;
    var dx = target[0] - camera[0];
    var dy = target[1] - camera[1];
    var length = Math.hypot(dx, dy);
    var px = -dy / length * spread;
    var py = dx / length * spread;
    byId("camera-marker").setAttribute("transform", "translate(" + camera.join(" ") + ")");
    byId("camera-marker").querySelector("text").textContent = "CAMERA " + shot.id;
    byId("camera-cone").setAttribute("d", "M " + camera.join(" ") + " L " + (target[0] + px) + " " + (target[1] + py) + " L " + (target[0] - px) + " " + (target[1] - py) + " Z");
    byId("camera-path").setAttribute("d", "M " + (camera[0] + dx / length * 45) + " " + (camera[1] + dy / length * 45) + " L " + camera.join(" "));
    byId("shot-assets").replaceChildren();
    shot.assets.forEach(function (id) {
      var link = el("a", "", id);
      link.href = "#asset-" + id;
      var asset = brief.assets.find(function (item) { return item.id === id; });
      link.setAttribute("aria-label", id + ": " + asset.name);
      link.addEventListener("click", function (event) {
        event.preventDefault();
        setFilter("All");
        var row = byId("asset-" + id);
        row.open = true;
        row.querySelector("summary").focus({ preventScroll: true });
        row.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      });
      byId("shot-assets").append(link);
    });
  }

  function renderTime() {
    var index = brief.shots.findIndex(function (shot) { return time >= shot.start && time < shot.end; });
    if (index < 0) index = brief.shots.length - 1;
    if (index !== shotIndex) { shotIndex = index; renderShot(index); }
    byId("current-time").textContent = format(time);
    byId("scrubber").value = time;
    byId("scrubber").setAttribute("aria-valuetext", time.toFixed(1) + " seconds, " + brief.shots[index].title);
    tabs.forEach(function (tab, i) {
      var shot = brief.shots[i];
      var progress = Math.max(0, Math.min(1, (time - shot.start) / (shot.end - shot.start)));
      tab.style.setProperty("--progress", (progress * 100) + "%");
    });
  }

  function tick(timestamp) {
    if (!playing) return;
    if (lastTick !== null) time = Math.min(brief.duration, time + Math.max(0, timestamp - lastTick) / 1000 * speed);
    lastTick = timestamp;
    renderTime();
    if (time >= brief.duration) setPlaying(false);
  }

  function setPlaying(value) {
    playing = value;
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    lastTick = playing ? performance.now() : null;
    byId("play-icon").textContent = playing ? "Ⅱ" : "▶";
    var label = playing ? "Pause timing" : time >= brief.duration ? "Replay timing" : "Play timing";
    byId("play-label").textContent = label;
    byId("play").setAttribute("aria-label", label);
    // This is a timing notebook. A light timer keeps its clock independent of
    // compositor frames; elapsed time, rather than interval count, prevents drift.
    if (playing) timer = window.setInterval(function () { tick(performance.now()); }, 50);
  }

  function selectShot(index) {
    time = brief.shots[Math.max(0, Math.min(index, brief.shots.length - 1))].start;
    setPlaying(false);
    renderTime();
  }

  byId("play").addEventListener("click", function () {
    if (time >= brief.duration) { time = 0; renderTime(); }
    setPlaying(!playing);
  });
  byId("restart").addEventListener("click", function () { selectShot(0); });
  byId("previous").addEventListener("click", function () { selectShot(shotIndex - 1); });
  byId("next-shot").addEventListener("click", function () { selectShot(shotIndex + 1); });
  byId("scrubber").addEventListener("input", function (event) {
    time = Number(event.target.value);
    setPlaying(false);
    renderTime();
  });
  byId("speed").addEventListener("change", function (event) { speed = Number(event.target.value); });
  document.addEventListener("visibilitychange", function () { if (document.hidden) setPlaying(false); });
  window.addEventListener("pagehide", function () { setPlaying(false); });

  brief.candidates.forEach(function (candidate) {
    var card = el("article", "candidate");
    var image = el("img");
    image.src = candidate.preview;
    image.alt = "Publisher's model preview: " + candidate.name;
    image.width = 720;
    image.height = 405;
    image.loading = "lazy";
    var body = el("div", "candidate-body");
    body.append(el("span", "candidate-role", candidate.role), el("h3", "", candidate.name), el("p", "creator", "by " + candidate.creator), el("p", "candidate-fact", candidate.evidence), el("p", "candidate-limit", candidate.limitation), externalLink("Inspect source ↗", candidate.url));
    card.append(image, body);
    byId("candidates").append(card);
  });

  var categories = ["All"].concat(Array.from(new Set(brief.assets.map(function (asset) { return asset.category; }))));
  var filters = [];
  categories.forEach(function (category) {
    var button = el("button", "filter", category);
    button.type = "button";
    button.setAttribute("aria-pressed", String(category === filter));
    button.addEventListener("click", function () { setFilter(category); });
    filters.push({ category: category, button: button });
    byId("asset-filters").append(button);
  });

  function setFilter(category) {
    filter = category;
    filters.forEach(function (item) { item.button.setAttribute("aria-pressed", String(item.category === category)); });
    document.querySelectorAll(".asset-row").forEach(function (row) { row.hidden = category !== "All" && row.dataset.category !== category; });
  }

  brief.assets.forEach(function (asset) {
    var row = el("details", "asset-row");
    row.id = "asset-" + asset.id;
    row.dataset.category = asset.category;
    var summary = el("summary");
    summary.append(el("span", "asset-id", asset.id), el("span", "asset-name", asset.name), el("span", "asset-status", asset.status));
    var body = el("div", "asset-body");
    var need = el("p");
    need.append(el("b", "", "Required. "), document.createTextNode(asset.need));
    var acceptance = el("p");
    acceptance.append(el("b", "", "Acceptance. "), document.createTextNode(asset.acceptance));
    body.append(need, acceptance);
    asset.candidateIds.forEach(function (id) {
      var candidate = brief.candidates.find(function (item) { return item.id === id; });
      if (candidate) { var p = el("p"); p.append(externalLink(candidate.name + " / " + candidate.creator + " ↗", candidate.url)); body.append(p); }
    });
    row.append(summary, body);
    byId("asset-list").append(row);
  });

  brief.decisions.forEach(function (decision) {
    var card = el("article", "decision");
    card.append(el("span", "", decision.label.toUpperCase()), el("h3", "", decision.value), el("p", "", decision.note));
    byId("decisions").append(card);
  });
  brief.nextProof.forEach(function (step) { byId("next-proof").append(el("li", "", step)); });
  brief.references.forEach(function (reference) { byId("references").append(externalLink(reference.label + " ↗", reference.url)); });

  byId("export").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(brief, null, 2) + "\n"], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = el("a");
    link.href = url;
    link.download = "animverse-jinwoo-brief-v" + brief.version + ".json";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });

  var printShots = el("div", "print-only");
  brief.shots.forEach(function (shot) {
    var block = el("article", "print-shot");
    block.append(el("h3", "", shot.id + " / " + shot.title + " · " + clock(shot.start) + "–" + clock(shot.end)));
    [["Action", shot.action], ["Camera", shot.camera + ". " + shot.composition], ["Light and effects", shot.light + " " + shot.effect], ["Sound direction", shot.sound], ["Intent", shot.purpose], ["Assets", shot.assets.join(", ")]].forEach(function (line) {
      var p = el("p"); p.append(el("b", "", line[0] + ". "), document.createTextNode(line[1])); block.append(p);
    });
    printShots.append(block);
  });
  byId("sequence").append(printShots);
  var printState = null;
  window.addEventListener("beforeprint", function () {
    setPlaying(false);
    if (printState) return;
    printState = { filter: filter, open: Array.from(document.querySelectorAll(".asset-row")).map(function (row) { return row.open; }) };
    setFilter("All");
    document.querySelectorAll(".asset-row").forEach(function (row) { row.open = true; });
  });
  window.addEventListener("afterprint", function () {
    if (!printState) return;
    var state = printState;
    printState = null;
    setFilter(state.filter);
    document.querySelectorAll(".asset-row").forEach(function (row, i) { row.open = state.open[i]; });
  });
  byId("print").addEventListener("click", function () { window.print(); });
  renderTime();
}());
