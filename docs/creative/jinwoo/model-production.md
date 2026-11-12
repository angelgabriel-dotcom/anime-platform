# Matching Jin-Woo model — production specification

Updated 11 November 2026.

The user has accepted a newly created model matching the appearance of the
Kaif.3D Jin-Woo preview. The Sketchfab embed remains a visual reference; this
workflow creates a new asset rather than importing the creator's geometry.

Reference listing:
https://sketchfab.com/3d-models/sung-jinwoo-solo-leveling-vrm-unity-unreal-3c539f932e254372a36a77e4113cb449

Local reference thumbnail: `references/jinwoo-rigged.webp`. The screenshot
supplied by the user identifies the same listing. Neither supplies editable
geometry, a skeleton, or textures.

## Appearance

- Recognizable Sung Jin-Woo: adult human proportions, lean athletic build,
  angular anime face, pale skin, short tousled black hair, and blue-violet eyes.
- Dark navy, nearly black, open long coat with a standing collar and lapels;
  hem below the knees. Preserve a split/open lower coat for leg movement.
- Plain white V-neck shirt, fitted black trousers, and dark sneakers with white
  soles, following the preferred preview's outfit.
- Restrained expression. Keep the face readable for the recognition close-up.
- One complete character. The generation input contains no duplicate figure,
  sword, floor, aura, particles, logo, or title; those belong to scene production.

## Completed generation workflow

The user approved the design image for 3 credits, then approved the textured
model and body rig for an additional 20 credits. All three stages succeeded.
Actual consumption is 23 credits; there were no paid retries. Additional
generation or paid animation tasks are not authorized by these completed steps.

1. Create one front-facing full-body design image using Meshy's
   `nano-banana-2-lite`, in a T-pose: **3 credits**. Review likeness and outfit
   with the user before creating geometry.
2. From the approved image, create a textured humanoid using `meshy-t2.5`
   smart topology and `meshy-n1` textures: **15 credits**. Request a T-pose,
   30,000 target faces, 2K base color, and GLB output. Actual face count and
   geometry quality must be inspected after generation.
3. If the geometry passes inspection, generate a humanoid body rig:
   **5 credits**. Use 1.8 metres as a working scale. Save the rigged GLB in
   `assets/incoming/jinwoo/generated/` with a source/task record.

Actual total: **23 credits for one image/model/rig attempt**. Retries, additional
formats, and custom animation generation are outside this proposal. No model
purchase or credit purchase is included. Costs are from the available Meshy
tool guide; actual consumption should be recorded per completed task.

## Design-image prompt

```text
Create a clean full-body character design reference for a new 3D Sung Jin-Woo
model for an animated Solo Leveling character entrance. One adult male only,
lean athletic human proportions, angular recognizable anime face, pale skin,
short tousled black hair with a fringe, restrained blue-violet eyes, calm
expression. Dark navy nearly black open long coat with raised collar and
lapels, hem below the knees and open split lower panels. Plain white V-neck
shirt, fitted black trousers, dark sneakers with white soles. Stylized anime
3D game-character appearance. Front view, facing the camera, neutral standing
T-pose with both arms horizontal, straight wrists, visible separated fingers,
legs slightly apart and both feet flat. Show the entire head, hands, coat hem,
and shoes with a margin around the figure. Even soft studio lighting on a
plain light-grey background; preserve face and dark-cloth detail. No second
figure, weapons, armor, aura, smoke, pedestal, environment, text, logo, or
watermark. This is a model-making reference, not the cinematic composition.
```

## Inspection before animation

- Review face, hairstyle, outfit, proportions, and silhouette against the
  preferred preview. Generation does not guarantee likeness.
- Inspect complete limbs and fingers, coat/body intersections, texture seams,
  backfaces, normals, material separation, and actual file size.
- Inspect the GLB's nodes, skin, joints, weights, animation clips, and materials.
- Test shoulder lifts, head turns, elbows, wrists, knees, and the coat around
  the legs. An automatic body rig does not establish good deformation.
- Check whether fingers and facial controls exist. Do not assume lip sync,
  eye-emission controls, or a separately deforming coat are provided. Those may
  require additional rigging or model editing for the planned close-ups.
- Record generator task IDs, settings, applicable provider terms, consumed
  credits, and subsequent modifications alongside the asset.

## First design result

- Image: [jinwoo-design-v1.png](../../../assets/incoming/jinwoo/generated/jinwoo-design-v1.png)
- Generation record and exact prompt:
  `assets/incoming/jinwoo/generated/jinwoo-design-v1.record.json`
- Provider: Meshy; image model: `nano-banana-2-lite`.
- Task ID: `01a1cac8-54a3-71e7-810c-26c9a7a77a5f`.
- Status: succeeded; actual consumption: **3 credits**.
- Review: full character and intended outfit are visible. The generator
  returned an A-pose-like stance despite the T-pose request. Request a T-pose
  again during 3D generation and inspect the actual result before rigging.
- The user approved this appearance and the additional model/rig stage. The
  PNG remains reference material; the actual GLBs are listed below.

## Textured model and rig result

- Working rig: `assets/incoming/jinwoo/generated/jinwoo-rigged-v1.glb`.
- Model task: `01a1cacf-e144-7450-a023-c291c98cc052`; **15 credits**.
- Rig task: `01a1cade-4fba-7796-8803-bd54186d624f`; **5 credits**.
- 29,691 triangles, 22,793 vertices, one mesh/material with embedded texture.
- 24 body joints; 1.8 m working height; normalized weights; no unweighted vertices.
- Walking and running samples are saved as separate GLBs at no added charge.
- Eight browser checks loaded the actual textured/rigged files and captured
  front, side, back, face, shoulder, walking, and running poses with no runtime
  exceptions. These are functional checks, not performance benchmarks.
- Detailed records and a local review viewer are in the
  [generated asset folder](../../../assets/incoming/jinwoo/generated/README.md).

**Acceptance: base asset only.** The face/hair have visible surface artifacts in
close-up. There are no finger bones or facial morph targets. The coat shares
the body mesh and stretches with the legs in the running sample; dedicated
weighting/secondary motion is needed. Eye emission cannot yet be controlled
through a separate eye material. Resolve those before the recognition close-up,
spoken command, and final cinematic acceptance.

To view the files from the repository root:

```sh
python3 -m http.server 4176 --bind 127.0.0.1 --directory assets/incoming/jinwoo/generated
```

Open http://127.0.0.1:4176/review.html.

After the model is usable, the next milestone remains the restrained command
and one soldier's emergence in a simple hall. The complete 15-second sequence
and its live-versus-rendered delivery decision follow that proof.
