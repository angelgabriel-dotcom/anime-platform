(function () {
  "use strict";
  var brief = window.ANIMVERSE_BRIEF;
  var byId = function (id) { return document.getElementById(id); };
  var previews = brief.previewCollections.concat(brief.selectedModelIds.map(function (id) {
    return brief.candidates.find(function (model) { return model.id === id; });
  }).filter(Boolean));
  var selected = null;
  var buttons = [];
  var reasons = {
    "jinwoo-fbx": "The free long-coat model is our starting choice for Jin-Woo. It gives us the intended silhouette to inspect before committing to the rigging and performance work.",
    "igris-animated": "This free Igris listing includes two published animations. It is our starting choice for the commander, with his kneeling performance and shadow-form materials still to be evaluated."
  };
  function creditLink(label, url) {
    var link = document.createElement("a");
    link.textContent = label;
    link.href = url;
    link.target = "_blank";
    link.rel = "nofollow noopener noreferrer";
    return link;
  }
  function choose(index, updateHash) {
    var model = previews[index];
    if (!model || selected === model.id) return;
    var collection = model.kind === "collection";
    selected = model.id;
    buttons.forEach(function (button, i) { button.setAttribute("aria-pressed", String(i === index)); });
    byId("selected-name").textContent = model.name;
    byId("model-facts").hidden = collection;
    byId("model-license").hidden = collection;
    if (collection) {
      byId("selection-reason").textContent = "The collection you shared, presented in Sketchfab's interactive viewer. Explore the character from different angles using the viewer controls.";
      byId("model-role").textContent = "YOUR SHARED COLLECTION";
      byId("model-attribution").replaceChildren(
        creditLink(model.title, model.url), document.createTextNode(" · collection by "),
        creditLink(model.curator, model.curatorUrl), document.createTextNode(" on "),
        creditLink("Sketchfab", "https://sketchfab.com")
      );
      byId("model-check-label").textContent = "ABOUT THIS PREVIEW";
      byId("model-limit").textContent = "Individual model credits and available animation controls appear in Sketchfab's viewer. This collection is a hosted preview; creating our own character performance requires the model files.";
      byId("model-source").textContent = "Open collection on Sketchfab ↗";
      byId("download-note").textContent = "If the embedded viewer cannot load, open the collection directly using the link above.";
      byId("model-frame").title = "Interactive Sketchfab collection: " + model.title + " by " + model.curator;
      byId("model-frame").src = model.embedUrl;
    } else {
      byId("selection-reason").textContent = reasons[model.id] || model.evidence;
      byId("model-role").textContent = model.role.toUpperCase();
      byId("model-faces").textContent = model.catalogFaceCount.toLocaleString() + " catalog faces";
      byId("model-animations").textContent = model.animationCount === 0 ? "None listed — rigging needs inspection" : model.animationCount + " in the publisher's viewer";
      byId("model-check-label").textContent = "WHAT STILL NEEDS CHECKING";
      byId("model-limit").textContent = model.limitation;
      byId("model-attribution").textContent = model.sourceTitle + " · by " + model.creator;
      byId("model-license").href = model.licenseUrl;
      byId("model-source").textContent = "Open free model & download ↗";
      byId("download-note").textContent = "Sketchfab requires an account to download these free files. The public viewer does not provide a local project package.";
      byId("model-frame").title = "Interactive 3D model: " + model.name + " by " + model.creator;
      byId("model-frame").src = "https://sketchfab.com/models/" + encodeURIComponent(model.uid) + "/embed?autostart=1&preload=1";
    }
    byId("model-source").href = model.url;
    byId("model-announcement").textContent = model.name + " selected. " + (collection ? "Shared Sketchfab collection preview." : model.evidence);
    if (updateHash && /^https?:$/.test(location.protocol)) history.replaceState(null, "", "#" + model.id);
  }
  previews.forEach(function (model, index) {
    var button = document.createElement("button");
    button.className = "model-pick";
    button.type = "button";
    button.dataset.previewId = model.id;
    button.setAttribute("aria-pressed", "false");
    var label = document.createElement("span");
    label.textContent = model.kind === "collection" ? "SHARED / COLLECTION" : model.id === "jinwoo-fbx" ? "01 / THE MONARCH" : "02 / THE COMMANDER";
    var name = document.createElement("b");
    name.textContent = model.name;
    button.append(label, name);
    button.addEventListener("click", function () { choose(index, true); });
    buttons.push(button);
    byId("model-picker").append(button);
  });
  function fromHash() {
    var index = previews.findIndex(function (model) { return "#" + model.id === location.hash; });
    choose(index >= 0 ? index : 0, false);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
}());
