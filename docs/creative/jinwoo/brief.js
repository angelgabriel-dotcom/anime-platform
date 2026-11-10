/* The single source for the shot list, asset checklist, and review-page export. */
window.ANIMVERSE_BRIEF = {
  version: "0.1",
  status: "Preproduction storyboard",
  title: "Arise",
  character: "Sung Jin-Woo",
  series: "Solo Leveling",
  duration: 15,
  updated: "2026-11-10",
  modelBudget: "Free assets only. No paid model purchases.",
  selectedModelIds: ["jinwoo-fbx", "igris-animated"],
  previewCollections: [
    {
      id: "jinwoo-collection",
      kind: "collection",
      name: "Jin-Woo collection",
      title: "gffgfg",
      curator: "fernanflowvera",
      curatorUrl: "https://sketchfab.com/fernanflowvera",
      url: "https://sketchfab.com/fernanflowvera/collections/gffgfg-8def5dabb51a4804ada3a2ead74e2489",
      embedUrl: "https://sketchfab.com/playlists/embed?collection=8def5dabb51a4804ada3a2ead74e2489&autostart=1"
    }
  ],
  premise: "He gives the order. The battlefield becomes his army.",
  direction: "Jin-Woo's authority over his shadows drives the entrance. His movement is restrained; the army and environment respond to him.",
  animationPolicy: {
    required: "Rigged 3D models for Jin-Woo, Igris, and every shadow soldier.",
    excluded: "Sprite sheets, animated 2D character cutouts, and billboard characters.",
    distantRanks: "Simplified 3D meshes with shared animation.",
    delivery: "Live browser rendering or a rendered cinematic may be evaluated; either must originate from an animated 3D scene."
  },
  references: [
    { label: "User reference: smoke, energy, and a concentrated reveal", url: "https://www.pinterest.com/pin/400609329379707416/" },
    { label: "User reference: character staging in anime game openings", url: "https://www.youtube.com/watch?v=PlqiJ_TKCT0" }
  ],
  shots: [
    {
      id: "01", start: 0, end: 2, title: "Arrival", stage: "arrival",
      line: "A footstep. The shadows move first.",
      action: "A low tracking shot catches Jin-Woo's boot touching cracked stone. His coat settles as he stops. His shadow continues spreading a fraction longer than his movement.",
      composition: "Boot and coat hem in the foreground. A ruined hall disappears into depth. Keep the army concealed.",
      camera: "28 mm · knee height · slow backward track",
      light: "A narrow, cold rim separates the coat from the hall. Keep texture visible in the blacks.",
      sound: "One close footstep, cloth movement, and distant room tone. These are sound-design cues; this review page is silent.",
      effect: "A thin shadow pool follows the contact point, then reaches toward the rear of the hall.",
      purpose: "Establish a controlled, physical entrance and the first sign that his shadow has agency.",
      assets: ["JW-01", "AN-01", "ENV-01", "FX-01", "AU-01"],
      cameraPosition: [500, 480], cameraTarget: [500, 295]
    },
    {
      id: "02", start: 2, end: 4, title: "Recognition", stage: "recognition",
      line: "The face behind the darkness.",
      action: "Cut to a three-quarter close-up. Jin-Woo raises his gaze toward the camera. A restrained blue-violet light catches his eyes; his expression stays composed.",
      composition: "Eyes occupy the upper third. Preserve his recognizable face, hair, and human proportions. The background falls out of focus.",
      camera: "85 mm · eye height · almost still",
      light: "Soft face light and a fine coat rim. Eye emission must retain the iris and eyelid detail.",
      sound: "Room tone narrows. A low sustained note begins without an impact hit.",
      effect: "Localized eye emission and a faint shadow drift at the edge of frame.",
      purpose: "Make the character identifiable before the spectacle. His stillness communicates confidence.",
      assets: ["JW-01", "AN-02", "FX-02", "AU-01"],
      cameraPosition: [610, 330], cameraTarget: [500, 295]
    },
    {
      id: "03", start: 4, end: 5.5, title: "The command", stage: "command",
      line: "“Arise.”",
      action: "Hold a medium close-up. Jin-Woo gives the command once, at approximately 4.5 seconds. His hand lifts slightly. Only after the word, the shadow beneath him expands outward.",
      composition: "Face and commanding hand share the frame. His gesture is small; its consequence fills the next shot.",
      camera: "50 mm · chest height · locked frame",
      light: "The shadow pulse briefly lights the underside of his sleeve. Maintain the face exposure.",
      sound: "One originally recorded, restrained delivery of ‘Arise.’ A short silence follows the word, then a low pressure swell.",
      effect: "An outward shadow pulse with dark blue-violet edges. No repeated flashing.",
      purpose: "Make the summoning causal: he commands, and his army answers.",
      assets: ["JW-01", "AN-03", "FX-01", "FX-02", "AU-02"],
      cameraPosition: [545, 385], cameraTarget: [500, 295]
    },
    {
      id: "04", start: 5.5, end: 8.5, title: "Awakening", stage: "awakening",
      line: "The ground answers him.",
      action: "Cut behind Jin-Woo. Armored hands and helmet silhouettes rise from separate shadow pools. The nearest soldiers resolve first; the distant ranks emerge through low fog.",
      composition: "Jin-Woo anchors the foreground. The soldiers form two receding ranks, leaving a clear aisle through the frame.",
      camera: "35 mm · waist height · slow rise",
      light: "Selective rim light reveals armor edges and eyes. Fog carries depth between the ranks.",
      sound: "Layered shadow movement and restrained armor sounds spread across the stereo field. The score builds.",
      effect: "Shadow-to-body material transition. Stagger the emergence so each rank has weight and direction.",
      purpose: "Show an army materializing through his specific power. Keep individual bodies readable.",
      assets: ["JW-01", "SH-01", "AN-04", "ENV-01", "FX-01", "FX-03", "AU-03"],
      cameraPosition: [500, 470], cameraTarget: [500, 160]
    },
    {
      id: "05", start: 8.5, end: 12, title: "Allegiance", stage: "allegiance",
      line: "Power becomes loyalty.",
      action: "Igris takes the foreground position beside the ranks and lowers to one knee. The soldiers follow in a controlled wave. Jin-Woo barely moves as his coat lifts in the displaced air.",
      composition: "Jin-Woo and Igris remain distinct silhouettes. The central aisle preserves the relationship between monarch and commander.",
      camera: "28 mm · low three-quarter angle · short outward arc",
      light: "A violet edge traces Igris's armor and the nearest ranks. Distant soldiers remain darker and simpler.",
      sound: "The commander's kneel leads a short sequence of armor contacts. One low musical impact marks the completed formation.",
      effect: "Residual shadow ribbons settle close to the ground. The visible energy begins to calm.",
      purpose: "The emotional payoff is the army recognizing its monarch. Igris is the intended named commander; a proxy in blocking would not establish his final appearance.",
      assets: ["JW-01", "IG-01", "SH-01", "AN-05", "FX-03", "AU-03"],
      cameraPosition: [785, 420], cameraTarget: [490, 255]
    },
    {
      id: "06", start: 12, end: 15, title: "The monarch", stage: "monarch",
      line: "One monarch. An army of shadows.",
      action: "Pull back to reveal Jin-Woo against the assembled army. Hold the final composition as his name and ‘Shadow Monarch’ appear. The energy settles into a quiet living background.",
      composition: "Keep Jin-Woo in a stable hero position and reserve clean space for his name. Design a separate portrait framing for phones rather than cropping away the army.",
      camera: "35 mm · slight low angle · pull back, then hold",
      light: "Cold stone, readable black armor, and restrained blue-violet aura. His face remains the visual anchor.",
      sound: "A low resolve, lingering room tone, then a soft handoff. Dialogue and any music are added during production.",
      effect: "A few rising shadow motes. Match the final scene's light and framing to the subsequent character screen.",
      purpose: "Give the reveal time to register and create a graceful handoff to Animverse. Final placement within the platform remains a product decision.",
      assets: ["JW-01", "IG-01", "SH-01", "AN-06", "ENV-01", "FX-03", "UI-01", "AU-01"],
      cameraPosition: [500, 530], cameraTarget: [500, 200]
    }
  ],
  assets: [
    { id: "JW-01", category: "Characters", name: "Jin-Woo / Shadow Monarch", need: "One recognizable character with an expressive face, black coat, hair, eye materials, and a deforming humanoid skeleton.", acceptance: "Inspect face, fingers, shoulders, coat weighting, and materials in motion. The chosen outfit must match the intended Shadow Monarch interpretation.", status: "Free model selected; signed-in download needed", candidateIds: ["jinwoo-fbx"] },
    { id: "IG-01", category: "Characters", name: "Igris / named commander", need: "A recognizable shadow-form Igris, with helmet silhouette, plume, armor, weapon, and a usable skeleton.", acceptance: "Inspect the shoulder and knee deformation, sword grip, shadow-form materials, and the intended kneeling performance.", status: "Free animated model selected; package unverified", candidateIds: ["igris-animated"] },
    { id: "SH-01", category: "Characters", name: "Shadow infantry", need: "One reusable rigged 3D armored infantry body with 2–3 silhouette variants. Start with 8 foreground soldiers; use simplified 3D meshes for distant ranks.", acceptance: "Correct Solo Leveling visual language, clean instancing, and variation in timing and pose. Every soldier uses a 3D mesh and rig; sprite sheets and billboard characters are excluded.", status: "Source or author; rigging required", candidateIds: ["shadow-knight"] },
    { id: "ENV-01", category: "Environment", name: "Ruined stone hall", need: "A modular floor, several columns, and enough depth for an aisle and two ranks. Create a simple blocking hall first.", acceptance: "Readable silhouettes, predictable scale, and enough space for the six camera positions. An elaborate environment is not needed for the first animation proof.", status: "Build simple blocking geometry", candidateIds: [] },
    { id: "AN-01", category: "Animation", name: "Measured arrival", need: "One slow step, stop, and settle, including coat follow-through.", acceptance: "Foot contact without sliding; coat motion follows the stop.", status: "To author or adapt", candidateIds: [] },
    { id: "AN-02", category: "Animation", name: "Recognition", need: "Breathing idle, eye focus, and a small head lift.", acceptance: "The close-up retains Jin-Woo's likeness through every pose.", status: "To author", candidateIds: [] },
    { id: "AN-03", category: "Animation", name: "Arise gesture", need: "A restrained hand lift and facial performance for one spoken command.", acceptance: "The shadow response begins after the word. Lip and hand movement support the voice.", status: "To author", candidateIds: [] },
    { id: "AN-04", category: "Animation", name: "Shadow emergence", need: "A rising motion designed alongside the shadow-pool transition, with offset variants for the infantry.", acceptance: "Hands and armor emerge coherently; no visible popping or accidental floor clipping.", status: "To author", candidateIds: [] },
    { id: "AN-05", category: "Animation", name: "Commander and army kneel", need: "A readable kneel-and-hold clip for Igris, plus a simpler infantry version.", acceptance: "Knees, sword, and feet contact the floor correctly. The commander leads the wave.", status: "To author; existing clips not assumed suitable", candidateIds: [] },
    { id: "AN-06", category: "Animation", name: "Final living hold", need: "Breathing, coat settle, and very subtle secondary motion for the final shot.", acceptance: "The final pose can transition smoothly into a character presentation.", status: "To author", candidateIds: [] },
    { id: "FX-01", category: "Effects", name: "Shadow pools and emergence", need: "A controlled floor mask, dark upward wisps, and a body-reveal material treatment.", acceptance: "Effects follow the command and preserve the soldiers' silhouettes.", status: "To build", candidateIds: [] },
    { id: "FX-02", category: "Effects", name: "Eyes and command pulse", need: "Separate eye-emission control and a single outward energy response.", acceptance: "Preserve face detail; no strobing or washed-out whites.", status: "To build", candidateIds: [] },
    { id: "FX-03", category: "Effects", name: "Fog, shadow motes, and coat response", need: "Layered atmosphere with restrained secondary motion, and a light coat response to the summons.", acceptance: "Depth remains visible and effects settle for the final hold.", status: "To build", candidateIds: [] },
    { id: "AU-01", category: "Sound", name: "Atmosphere and score", need: "Room tone, a slow low-register build, one resolve, and a clean transition tail.", acceptance: "Music leaves room for the command and the armor contacts. Browser playback begins muted unless the visitor enables sound.", status: "Sound direction only; audio not produced", candidateIds: [] },
    { id: "AU-02", category: "Sound", name: "Arise / original voice performance", need: "One restrained original recording of ‘Arise,’ with optional subtitle.", acceptance: "Clear delivery and a short silence before the summoning response.", status: "To record", candidateIds: [] },
    { id: "AU-03", category: "Sound", name: "Summoning and armor", need: "Layered shadow movement, controlled armor contacts, and the commander's kneel.", acceptance: "Sound communicates body weight and the army's order of response.", status: "To produce", candidateIds: [] },
    { id: "UI-01", category: "Presentation", name: "Title and platform handoff", need: "Sung Jin-Woo / Shadow Monarch title treatment, skip control, mute control, and a stable final character composition.", acceptance: "Readable type, keyboard access, reduced-motion still, and a dedicated mobile composition.", status: "To design in the intro prototype", candidateIds: [] }
  ],
  candidates: [],
  decisions: [
    { label: "Pilot length", value: "15 seconds", note: "A working timing proposal for six distinct beats." },
    { label: "Visual interpretation", value: "Shadow Monarch", note: "Black coat, human face, blue-violet shadow energy. The free long-coat Jin-Woo is the starting choice; inspect the downloaded package before adaptation." },
    { label: "Commander", value: "Igris", note: "One named commander establishes Jin-Woo's relationship to his army." },
    { label: "Platform placement", value: "Still to decide", note: "The sequence can support a character reveal or a featured platform entrance. It will not be forced onto every navigation." },
    { label: "Character animation", value: "Rigged 3D models", note: "Jin-Woo and the entire army use 3D meshes and rigs. No sprite-based character animation. Choose live or rendered delivery of the 3D scene after blocking." },
    { label: "Next production milestone", value: "Rig and motion proof", note: "One Jin-Woo rig, one soldier, and the command-to-emergence beat in simple geometry." }
  ],
  nextProof: [
    "Download the selected free Jin-Woo and Igris packages through Sketchfab's signed-in flow, then inspect materials, skeletons, and included clips.",
    "Test Jin-Woo's head, shoulder, finger, and coat deformation in a close-up.",
    "Block the command-to-emergence beat with one soldier in a plain hall.",
    "Measure the browser load and frame time, and compare with the quality of a rendered clip.",
    "Expand the approved motion into the army formation and the complete 15-second sequence."
  ]
};
