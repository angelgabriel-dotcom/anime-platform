# Animverse

An anime platform in development, with Shadow Arena as its current battle-simulation prototype. The creative direction centers on character-specific 3D presentations, cinematic entrances, and a cohesive dark interface.

**Character animation requirement:** use rigged 3D models for characters and their armies. Sprite sheets, animated 2D character cutouts, and billboard characters are excluded from the new animation pipeline. Distant ranks use simplified 3D meshes. Any rendered cinematic must also originate from an animated 3D scene.

## Current milestone: the Animverse game lobby

The React application's home screen is the main place to review the platform. It now presents a cinematic game lobby: featured characters, searchable profiles, a Jin-Woo 3D preview opened on request, and links to Shadow Arena and Rankings. The shared header identifies Animverse as the platform and Shadow Arena as one feature.

    cd frontend
    npm run dev

Open http://localhost:5173. The lobby uses static character artwork and has no flashing image intro. The Sketchfab collection is a hosted preview; the custom “Arise” animation has not been produced.

**Next:** bring the Shadow Arena screen into the same visual style. After the core screens are coherent, inspect downloaded character rigs and build the first command-and-response animation. Character file acquisition remains separate from this UI milestone.

## Jin-Woo intro planning

The first creative deliverable is a six-shot, 15-second storyboard for Jin-Woo's “Arise” entrance, with camera blocking and a researched 3D asset checklist.

    make storyboard

Open http://127.0.0.1:4175 to explore the shots, play the timing, review candidate models, and export the brief. This review page also works directly from [index.html](docs/creative/jinwoo/index.html).

- [Creative brief and shot list](docs/creative/jinwoo/README.md)
- [Shared Jin-Woo collection and free model previews](docs/creative/jinwoo/models.html) — http://127.0.0.1:4175/models.html
- [3D asset research](docs/creative/jinwoo/asset-research.md)

The model budget is **free only**. The selected starting models are the long-coat Jin-Woo by Anime fan's club and Knight Igris by damr.optimus2008, both listed under CC BY 4.0. Their official 3D viewers require internet access. Downloading their source packages requires a free Sketchfab sign-in; save them in the [model intake folders](assets/incoming/README.md).

This is preproduction material. Model packages have not been acquired or tested, and Jin-Woo's rig is undocumented. Rig inspection, any needed rigging, and the first command-to-emergence animation come next.

## Existing application

The application uses React/Vite and PixiJS for the interface, Go/Gin for the API, and SQLite for its current runtime storage. The Docker and SQL migration scaffolding still describes an older PostgreSQL setup.

Run the Go backend in one terminal:

    go run ./cmd/server

Run the frontend in another:

    cd frontend
    npm install
    npm run dev

The default frontend address is http://localhost:5173 and the API runs on port 8080. The SQLite driver requires CGO and a C compiler. Existing application routes are home, battle, and leaderboard.
