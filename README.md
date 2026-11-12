# Animverse

An anime platform in development, with Shadow Arena as its current battle-simulation prototype. The creative direction centers on character-specific 3D presentations, cinematic entrances, and a cohesive dark interface.

**Character animation requirement:** use rigged 3D models for characters and their armies. Sprite sheets, animated 2D character cutouts, and billboard characters are excluded from the new animation pipeline. Distant ranks use simplified 3D meshes. Any rendered cinematic must also originate from an animated 3D scene.

## Current focus: finish Jin-Woo’s character intro

The active priority is the custom 3D “Arise” entrance, one production step at a time. Further interface work is deferred until this intro is complete. The storyboard and hosted model previews exist; the animated intro has not been produced.

**Current step:** clean up the newly generated Jin-Woo base model in `assets/incoming/jinwoo/generated/`. Its textured GLB and 24-joint body rig exist, with walking/running samples and a local viewer. Inspection found facial surface artifacts, no finger/facial controls, and coat stretching during running. Resolve those before accepting the character for cinematic close-ups, then build the command and one soldier's response. See the [model production record](docs/creative/jinwoo/model-production.md) and [intro brief](docs/creative/jinwoo/README.md).

Run `make model-review` and open http://127.0.0.1:4176/review.html to inspect the local rig and motion samples.

## Existing core interface

The React application's home screen is the main place to review the platform. It now presents a cinematic game lobby: featured characters, searchable profiles, a Jin-Woo 3D preview opened on request, and links to Shadow Arena and Rankings. The shared header identifies Animverse as the platform and Shadow Arena as one feature.

    cd frontend
    npm run dev

Open http://localhost:5173. The lobby uses static character artwork and has no flashing image intro. The Sketchfab collection is a hosted preview; the custom “Arise” animation has not been produced.

Shadow Arena now shares the lobby’s typography, artwork, and dark visual style. Choose a challenger and opponent, simulate the matchup, and follow the combat timeline with pause, speed, replay, and immediate-result controls. Fighter health and mana come from the API’s combat snapshots. Character portraits remain static; this is a battle simulator while the rigged 3D animation pipeline is in preproduction. Quick, Ranked, and Story currently use the same combat rules.

Rankings now uses the same character artwork and visual style. Featured leaders and searchable, tier-filtered standings can be sorted by power, win rate, or battles played. Selecting a fighter shows all six combat attributes and opens Shadow Arena with that fighter as the challenger. Filters retain the overall rank for the selected sort. Live records come from the API; unavailable or empty results show a labeled roster preview with unknown battle history. Failed refreshes retain previously loaded records.

The core interface is coherent. Further polish is deferred while the character intro is the active focus.

## Jin-Woo intro planning

The first creative deliverable is a six-shot, 15-second storyboard for Jin-Woo's “Arise” entrance, with camera blocking and a researched 3D asset checklist.

    make storyboard

Open http://127.0.0.1:4175 to explore the shots, play the timing, review candidate models, and export the brief. This review page also works directly from [index.html](docs/creative/jinwoo/index.html).

- [Creative brief and shot list](docs/creative/jinwoo/README.md)
- [Shared Jin-Woo collection and free model previews](docs/creative/jinwoo/models.html) — http://127.0.0.1:4175/models.html
- [3D asset research](docs/creative/jinwoo/asset-research.md)

Paid source-model purchases remain excluded. The user approved a newly created Jin-Woo matching Kaif.3D's preview, and separately authorized 23 Meshy credits for the design, textured geometry, and body rig; all three stages are complete. The original free long-coat Jin-Woo listing is now an alternative. Knight Igris by damr.optimus2008 remains the free commander candidate under CC BY 4.0; its source package has not been acquired. See the [model intake folders](assets/incoming/README.md).

The storyboard remains preproduction material. The new Jin-Woo base model has passed structural and sampled browser rig checks but needs cinematic cleanup; its appearance reference was not downloaded from Sketchfab. The actual command performance, shadow soldier, effects, sound, and full intro remain to be produced.

## Existing application

The application uses React/Vite and PixiJS for the interface, Go/Gin for the API, and SQLite for its current runtime storage. The Docker and SQL migration scaffolding still describes an older PostgreSQL setup.

Run the Go backend in one terminal:

    go run ./cmd/server

Run the frontend in another:

    cd frontend
    npm install
    npm run dev

The default frontend address is http://localhost:5173 and the API runs on port 8080. The SQLite driver requires CGO and a C compiler. Existing application routes are home, battle, and leaderboard.
