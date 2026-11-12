# Jin-Woo intro — 3D asset research

Researched 9 November 2026 through public Sketchfab catalog pages and API metadata. Update 11 November: a newly generated Jin-Woo base model, body rig, and walk/run GLBs now exist in `assets/incoming/jinwoo/generated/`. This is separate from the catalog packages below; see [model-production.md](model-production.md) for actual inspection findings and remaining cinematic work.

**Required asset type:** rigged 3D character meshes and skeletal animation, with facial controls where needed. Sprite sheets, animated 2D cutouts, and billboard characters do not satisfy this requirement. Optimize distant army ranks with simplified 3D meshes and shared animation.

## Free-only shortlist

The user has set a zero acquisition budget. The first two models below are selected for package inspection and the first motion proof; neither is validated for production yet. Their official public viewers are embedded in [models.html](models.html).

| Role and source | Catalog evidence | What remains to validate |
| --- | --- | --- |
| [Jin-Woo FBX — Anime fan's club](https://sketchfab.com/3d-models/solo-leveling-sung-jin-woo-3d-model-fbx-file-43566534e3b9469d867a056ec13471ba) — selected | Free downloadable listing, CC BY 4.0, 40,000 catalog faces, zero listed animations. Creator describes FBX. Preview shows a long coat and neutral pose. | Skeleton and facial controls are undocumented. Inspect the package; rigging, animation, and coat adaptation may be necessary. |
| [Knight Igris — damr.optimus2008](https://sketchfab.com/3d-models/knight-igris-3615001481f24efbba830ccdcc506d05) — selected | Free downloadable listing, CC BY 4.0, 36,600 catalog faces, two listed animations. | Shadow-form appearance, skeleton, plume, sword grip, material work, and suitability for kneeling. Clip contents have not been verified. |
| [Shadow Knight — Mama](https://sketchfab.com/3d-models/none-4f09d63a0ffd455b893b875bc8106620) | Downloadable flag, CC Attribution label, 350,501 catalog faces, zero listed animations. | Rigging and major optimization or a replacement mesh for a repeated browser army. Treat as a visual/modeling candidate until those costs are known. |

**Recommended first inspection:** the free long-coat Jin-Woo and free Knight Igris. Jin-Woo's silhouette suits the intended entrance, and Igris is the named commander. A free download does not mean animation-ready: inspect deformation and clip contents before building the performance around either model.

**Package access:** the official download endpoints returned HTTP 401 without sign-in. No model package has been downloaded or imported. Use a free Sketchfab account to download GLB/glTF if offered, or the original FBX archive, then save the complete packages in the [intake folders](../../../assets/incoming/README.md). Public embeds allow source inspection but cannot supply Animverse's editable character files.

The catalog's face count is reported as provided. It is not a measured triangle count of an optimized runtime export. Downloadability and license labels describe the listing; verify the actual provider terms and required attribution when acquiring a package.

## Animation work is a separate requirement

A rig supports motion, but the intro still needs authored performances:

| Clip | Character | Required performance |
| --- | --- | --- |
| Measured arrival | Jin-Woo | Step, stop, weight settle, coat follow-through |
| Recognition | Jin-Woo | Head lift, focus, restrained breathing |
| Arise gesture | Jin-Woo | Hand lift and facial performance timed to an original voice recording |
| Emergence | Infantry, then commander | Controlled rise designed with the shadow-to-body reveal |
| Allegiance | Igris and infantry | Kneel, physical contact, and a stable hold; staggered across the ranks |
| Final living hold | Jin-Woo and army | Subtle breathing and secondary motion that supports a clean handoff |

## Package inspection checklist

- Open the delivered source file and confirm the actual costume, likeness, and proportions.
- Check the skeleton, bone naming, finger controls, face controls, and bind pose.
- Test shoulder lifts, knee bends, wrist rotations, and the coat around the legs.
- Inspect texture completeness, eye materials, hair alpha, normals, and backfaces.
- Preview every included clip and identify what can be reused or must be authored.
- Export one GLB sample and inspect the actual node hierarchy, skin, materials, animation clips, and file size.
- Keep the source package and an attributed source record alongside any derived exports.

## Rejected or deferred search results

- [Sung Jinwoo - Solo Leveling (VRM, Unity, Unreal) — Kaif.3D](https://sketchfab.com/3d-models/none-3c539f932e254372a36a77e4113cb449) was also proposed by the user. Its creator advertises a full rig, 52 ARKit facial shape keys, VRM blend shapes, and humanoid FBX exports. It is the stronger animation candidate of the user's two proposed alternatives, subject to inspecting the actual package. A fresh official API check returned `isDownloadable: false` and no catalog license; acquisition is linked to CGTrader. The redirect returned HTTP 403 during this check, so the current price was not verified. Earlier research identified a paid acquisition route. It remains outside the free-only active shortlist unless an authorized free package becomes available.
- [Sung Jinwoo Character Bust — Makayla_Uram](https://sketchfab.com/3d-models/none-1579dfcbc3e44413addc0ea5f08de94c) was the user's other proposed alternative. The official API returned `isDownloadable: false`, no catalog license, and zero listed animations. A bust cannot supply the full-body arrival, commanding gesture, and final standing composition without substantial new character work. It is not selected for the motion proof.
- A result named “Shadow Soldier Obj” depicts a contemporary human soldier. Its name matched the query, but its appearance did not fit Jin-Woo's army.
- The “ARISE (Solo Leveling)” sculpt by K- lists about 3.48 million faces and no animations. Its density and unknown rig make it unsuitable as an immediate browser prototype asset.
- “Hall of Blood-Red Commander Igris” is a useful environmental reference, but simple original blocking geometry is enough to test the first performance.

## Preview attribution

The three active images in references/ are resized publisher thumbnails used in this internal creative notebook. [candidates.js](candidates.js) records each creator, model page, API source, original thumbnail URL, catalog license label, and inspection status. The unused `jinwoo-rigged.webp` thumbnail is a historical reference attributed to Kaif.3D and the excluded listing linked above. These images are reference previews; they are not the planned 3D character deliverables.
