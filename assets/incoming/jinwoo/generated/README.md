# Jin-Woo generated base asset

Created 11 November 2026 from the user-approved design reference.

## Files

- `jinwoo-rigged-v1.glb`: the working body rig; embedded texture; 1.8 m height.
- `jinwoo-model-v1.glb`: the original textured geometry before rigging.
- `jinwoo-walking-v1.glb` and `jinwoo-running-v1.glb`: included free rig-test clips.
- `jinwoo-design-v1.png`: the approved design image.
- `jinwoo-production-v1.record.json`: task IDs, settings, credits, and inspection findings.
- `*.inspection.json`: structural reports from `scripts/inspect_glb.py`.
- `jinwoo-browser-inspection-v1.json`: eight successful loading/view/pose checks.
- `review.html`, `review.js`, and `vendor/`: local 3D review viewer with Three.js
  0.170.0 and its MIT license. The viewer's library and model files are local.

The saved v2/v3 GLBs and packed `.blend` files checkpoint local face-surface
repairs and 12 coat-control joints. Their cleanup records and review images
are included. Open `review.html?version=v3` to inspect the latest saved output.
The finger, facial, and eye-control changes in `scripts/cleanup_jinwoo.py`
remain work in progress and have not been regenerated into these saved GLBs.

## View locally

From the repository root:

```sh
python3 -m http.server 4176 --bind 127.0.0.1 --directory assets/incoming/jinwoo/generated
```

Open http://127.0.0.1:4176/review.html. Orbit the model, select walk/run, pause,
or inspect the face. This viewer is separate from the main application.

## Current acceptance

The model has 29,691 triangles, 22,793 vertices, one textured mesh, and a
24-joint body rig. Skin weights are normalized, with no unweighted vertices.
The GLBs load and the test clips deform in headless Chrome/Three.js.

This is a base asset, not a finished cinematic character. The face/hair show
surface artifacts at close range. No finger bones, facial shape controls,
separate eye-emission material, or separate coat rig were supplied. The coat
stretches with the legs in the running sample. Clean up those areas before
close-up acting or acceptance of the full intro.

The successful browser checks establish loading and sampled poses; they are
not a phone-performance benchmark or a full deformation acceptance test.

## Provenance and cost

Meshy generated new geometry from the approved design. Kaif.3D's hosted Jin-Woo
preview supplied appearance direction only; its geometry was not imported.
Output rights follow the Meshy account's applicable terms, not an inferred
license from the visual reference.

Actual consumption: 3 credits for the image, 15 for the textured model, and
5 for the rig: **23 total**. The additional stage consumed exactly its approved
20 credits. Walking/running incurred no additional charge. No retries or
extra paid animation tasks were performed.
