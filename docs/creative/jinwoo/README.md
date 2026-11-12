# Animverse — Jin-Woo: “Arise”

Creative brief 0.1 · updated 10 November 2026 · first character-intro pilot

**Production update · 11 November:** the user chose a newly created Jin-Woo
matching Kaif.3D's hosted preview. The approved design, textured GLB, and body
rig are saved locally; 23 generation credits were explicitly approved and
consumed. The base rig works, but face/hair surface cleanup, facial/finger
controls, and coat weighting remain before cinematic acceptance. See
[model-production.md](model-production.md). The catalog shortlist below is
historical sourcing context; Igris's source package is still unacquired.

**He gives the order. The battlefield becomes his army.**

Animverse is the larger anime platform; Shadow Arena is one feature within it. Its character introductions should express each character's own identity, abilities, allies, and presence. This first sequence centers on Sung Jin-Woo's authority as the Shadow Monarch and the army that answers him.

## Open the storyboard

From the repository root:

    make storyboard

Then open http://127.0.0.1:4175. The [storyboard](index.html) also works when opened directly from disk: its scripts and catalog preview images are local. The separate [3D model review](models.html), at http://127.0.0.1:4175/models.html, uses official Sketchfab embeds and requires internet access.

The page contains a 15-second timing player, six selectable shots, overhead camera-blocking diagrams, shot-specific asset links, a filterable asset checklist, researched model candidates, a JSON brief download, and a print layout containing all six shots.

The model review opens with the user's [shared Jin-Woo collection](https://sketchfab.com/fernanflowvera/collections/gffgfg-8def5dabb51a4804ada3a2ead74e2489), using the supplied Sketchfab playlist embed. Its collection attribution links to **gffgfg**, curator **fernanflowvera**, and **Sketchfab**; individual model credits remain in the hosted viewer. Switch between this preview and the two free model selections with the buttons above the viewer. Only the selected embed is mounted. The collection is recorded separately in `brief.js` as `previewCollections`, without assigning it a download license or marking its source models as acquired.

**This milestone is a production storyboard and asset specification.** The diagrams describe staging; final 3D character animation, illustrated concept frames, effects, and sound have not been produced. The current Shadow Arena application is separate from this review artifact.

## Free model selection

The model budget is fixed at **free only**. The first inspection choices are Jin-Woo FBX by Anime fan's club and Knight Igris by damr.optimus2008, both listed under CC BY 4.0. The [3D model review](models.html) provides interactive source viewers, creator credits, and download links. Jin-Woo has no listed animations and an undocumented rig; Igris lists two animations whose suitability still needs checking.

The official download endpoints require a signed-in Sketchfab account. Download the free packages and place them in `assets/incoming/jinwoo/` and `assets/incoming/igris/`; keep ZIP archives and textures together. See the [intake instructions](../../../assets/incoming/README.md). The embedded viewers do not import files into Animverse or establish that the rigs are ready to animate.

Browser validation on 10 November 2026 passed 19 checks covering the supplied collection URL, attribution, model switching, keyboard access, brief export, standalone access, and layouts from 320px to 1440px. The collection loaded its Jin-Woo listing, but the nested Sketchfab model viewer displayed “Something went wrong with the 3D viewer” during the automated desktop check; live model rendering remains unverified. Direct source links remain available on the review page.

## Character direction

- All character animation uses rigged 3D models: Jin-Woo, Igris, and the shadow infantry. No sprite sheets, animated PNG cutouts, or billboard characters, including distant army ranks.
- Jin-Woo's face, posture, black coat, blue-violet eyes, and human proportions must stay recognizable.
- He moves with restraint. The environment and soldiers supply the larger motion.
- The command has a consequence: “Arise” precedes the pulse, emergence, and formation.
- The army consists of physical, readable shadow soldiers. Igris serves as the intended named commander in the allegiance shot.
- The climax is the army recognizing its monarch. Let that relationship carry the reveal.
- Keep dark materials readable with selective rim and face light. Preserve detail in the eyes and armor.

The exact outfit is still a working choice. A model's name or marketplace tag is not sufficient to establish its visual suitability. Confirm the chosen appearance before acquisition or adaptation.

## Six-shot sequence

| Time | Shot | Character action | Camera |
| --- | --- | --- | --- |
| 0–2 s | Arrival | A measured step; Jin-Woo stops, but his shadow continues spreading. | 28 mm, knee height, backward track |
| 2–4 s | Recognition | He raises his gaze; restrained blue-violet light catches his eyes. | 85 mm, eye height, nearly still |
| 4–5.5 s | The command | One quiet “Arise” at about 4.5 s; a small gesture; the shadow responds after the word. | 50 mm, chest height, locked frame |
| 5.5–8.5 s | Awakening | Armored soldiers rise from separate shadow pools into two receding ranks. | 35 mm, waist height, slow rise |
| 8.5–12 s | Allegiance | Igris kneels; the infantry follows in a controlled wave. | 28 mm, low three-quarter angle, outward arc |
| 12–15 s | The monarch | Pull back to Jin-Woo against the assembled army; hold his name and title. | 35 mm, slight low angle, pull back and hold |

The lens values are initial production choices, not measurements taken from the references. The overhead diagrams show relative camera and actor placement; they do not represent the final camera image or accurately scaled fields of view.

The complete editable shot list is in [brief.js](brief.js). Each shot includes action, composition, camera, light, effect, sound, narrative purpose, and required asset IDs. [review.js](review.js) renders that data, so the on-screen notes, timing, and downloadable JSON share one source.

## Asset and performance requirements

The full checklist includes 17 items:

- **Characters:** one deforming Jin-Woo model, one shadow-form Igris, and reusable infantry with silhouette variants.
- **Environment:** a modular ruined stone hall with a clear central aisle and depth between ranks.
- **Animation:** arrival, recognition, command, emergence, kneel-and-hold, and the final living pose.
- **Effects:** shadow pools and body reveals, controlled eye emission and command pulse, atmospheric layers and secondary motion.
- **Sound:** atmosphere and score, an originally recorded command, and summoning/armor effects.
- **Presentation:** character title, accessible skip and sound controls, a reduced-motion still, mobile framing, and a stable handoff.

Start the army proof with one rigged 3D soldier. The full blocking scene can use eight foreground soldiers and simplified 3D meshes for distant ranks. Increase visual complexity after the deformation, material transition, and formation are convincing.

The character-animation method is fixed: 3D meshes and rigs. The remaining live-versus-rendered decision concerns delivery of that 3D scene. Model thumbnails and the overhead diagrams in this notebook are reference and planning material.

See [asset-research.md](asset-research.md) for the candidate assessment. Their packages have not been acquired, imported, or tested. A catalog animation count does not establish that the necessary acting clips are included.

## First production proof

1. Inspect the selected candidate package's actual skeleton, mesh, textures, and provider terms.
2. Test Jin-Woo's face, fingers, shoulders, and coat deformation in a close-up.
3. Block the command-to-emergence beat with one soldier and simple hall geometry.
4. Compare a live browser scene with a rendered cinematic using the same intended performance. Measure load time, frame time, visual quality, and phone behavior before choosing delivery.
5. Extend the motion into the army's allegiance and the complete sequence.

The initial proof is successful when Jin-Woo is recognizable, the command clearly causes the summon, the soldier emerges coherently, and both rigs deform cleanly. Record actual performance measurements when there is a scene to measure; this brief contains no claimed rendering benchmarks.

## Platform integration decisions still open

- Where character intros appear: character selection, a character page, or a featured Animverse entrance.
- Whether this intro ships as a rendered cinematic or a live scene. Interactive 3D character presentation can remain a separate deliverable.
- Whether the free starting models need rigging, outfit adaptation, or replacement after package inspection. The acquisition budget is fixed at zero.
- The final voice, score, and title treatment.

The first design should include an immediate skip control. Sound starts muted unless enabled by the visitor. Reduced-motion and low-capability paths should offer a composed still and a direct entry. Use a dedicated portrait composition on phones so the character and army remain understandable.

## Reference notes

- [Pinterest intro supplied by the user](https://www.pinterest.com/pin/400609329379707416/): reviewed the accessible 10-second clip's visual sequence. It informs the buildup from darkness, concentrated energy response, and final reveal. It does not define Jin-Woo's powers or costume.
- [Anime-game intro compilation supplied by the user](https://www.youtube.com/watch?v=PlqiJ_TKCT0): sampled visual sequences inform character framing and cinematic scene staging.

No new AI concept images were generated for this milestone because the built-in image generator was unavailable. The model thumbnails in this notebook are attributed publisher previews for evaluating candidates.

## File map

| File | Purpose |
| --- | --- |
| [index.html](index.html) | Accessible, standalone review page |
| [brief.js](brief.js) | Creative direction, six shots, 17 assets, and next-step criteria |
| [candidates.js](candidates.js) | Source links, metadata, caveats, and attribution for two free selections and one reserve |
| [models.html](models.html) | Official 3D viewers, attribution, and package download instructions |
| [models.js](models.js), [models.css](models.css) | Model switching and responsive model review layout |
| [review.js](review.js) | Timing player, shot navigation, filters, export, and print behavior |
| [review.css](review.css) | Responsive notebook layout and reduced-motion/print styles |
| [asset-research.md](asset-research.md) | Human-readable sourcing assessment |
| references/ | Local, attributed catalog preview thumbnails |
