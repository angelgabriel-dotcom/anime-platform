import * as THREE from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {OrbitControls} from './vendor/controls/OrbitControls.js';

const stage=document.querySelector('#stage');
const status=document.querySelector('#status');
const params=new URLSearchParams(location.search);
const diagnostics={ready:false,errors:[],file:null,triangles:0,joints:0,clipDuration:0,skinnedMeshes:0,textureLoaded:false};
window.modelReview={diagnostics};
const scene=new THREE.Scene();
scene.background=new THREE.Color('#22212a');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.3;
stage.prepend(renderer.domElement);
const camera=new THREE.PerspectiveCamera(38,1,.01,100);
const controls=new OrbitControls(camera,renderer.domElement);
Object.assign(window.modelReview,{camera,controls,renderer,THREE});
controls.enableDamping=true;
const hemi=new THREE.HemisphereLight('#ffffff','#6c5e83',2.4);scene.add(hemi);
const key=new THREE.DirectionalLight('#ffede0',3);key.position.set(2,4,4);scene.add(key);
const fill=new THREE.DirectionalLight('#b9ccff',2);fill.position.set(-3,2,1);scene.add(fill);
const rim=new THREE.DirectionalLight('#d7c6ff',2);rim.position.set(1,3,-3);scene.add(rim);
const grid=new THREE.GridHelper(5,20,'#686071','#393440');scene.add(grid);
let root=null,mixer=null,action=null,paused=params.has('time'),center=new THREE.Vector3(0,.9,0),height=1.8;
let revision=0;
const loader=new GLTFLoader();
const report=()=>document.querySelector('#diagnostics').textContent=JSON.stringify(diagnostics);

function draw(){scene.updateMatrixWorld(true);root?.traverse(n=>{if(n.isSkinnedMesh)n.skeleton.update();});renderer.render(scene,camera);}
function view(name){
  if(name==='close'){
    controls.target.set(center.x,center.y+height*.42,center.z);
    camera.position.set(center.x,center.y+height*.42,center.z+height*.43);
  }else{
    const distance=height*1.95;
    const direction=name==='side'?new THREE.Vector3(1,.03,.1):name==='back'?new THREE.Vector3(.08,.03,-1):new THREE.Vector3(.08,.03,1);
    controls.target.copy(center);camera.position.copy(center).addScaledVector(direction.normalize(),distance);
  }
  controls.update();draw();
}
function dispose(object){object.traverse(n=>{if(n.isMesh){n.geometry.dispose();for(const mat of Array.isArray(n.material)?n.material:[n.material]){for(const value of Object.values(mat))if(value?.isTexture)value.dispose();mat.dispose();}}});}
async function load(kind){
  const token=++revision;
  diagnostics.ready=false;status.textContent='Loading local GLB…';report();
  try{
    const version=['v1','v2','v3'].includes(params.get('version'))?params.get('version'):'v2';
    const filename=`jinwoo-${kind}-${version}.glb`;
    const gltf=await loader.loadAsync(filename);
    if(token!==revision){dispose(gltf.scene);return;}
    if(root){scene.remove(root);dispose(root);}mixer?.stopAllAction();
    root=gltf.scene;scene.add(root);root.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(root,true);box.getCenter(center);height=box.getSize(new THREE.Vector3()).y;
    grid.position.y=box.min.y;
    diagnostics.file=filename;diagnostics.triangles=0;diagnostics.joints=0;diagnostics.skinnedMeshes=0;diagnostics.textureLoaded=false;
    root.traverse(n=>{if(n.isMesh){diagnostics.triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;diagnostics.textureLoaded ||= Boolean(n.material.map?.image);if(n.isSkinnedMesh){diagnostics.skinnedMeshes++;diagnostics.joints=Math.max(diagnostics.joints,n.skeleton.bones.length);}}});
    if(params.get('surface')==='plain')root.traverse(n=>{if(n.isMesh)n.material=new THREE.MeshStandardMaterial({color:0x999999,roughness:1,side:THREE.DoubleSide});});
    window.modelReview.root=root;
    mixer=new THREE.AnimationMixer(root);action=null;
    const clip=gltf.animations.find(c=>c.duration>0);
    diagnostics.clipDuration=clip?.duration||0;
    if(clip){action=mixer.clipAction(clip);action.play();if(params.has('time'))mixer.setTime(Number(params.get('time'))%clip.duration);}
    if(params.get('pose')==='shoulder'){
      const bone=root.getObjectByName('RightArm');if(bone)bone.rotateZ(-Math.PI/4);
      const neck=root.getObjectByName('neck');if(neck)neck.rotateY(Math.PI/12);
      const hand=root.getObjectByName('RightHand');if(hand)hand.rotateY(Math.PI/9);
    }
    diagnostics.ready=true;report();view(params.get('view')||'front');
    status.textContent=`${kind==='rigged'?'Body rig / rest pose':kind} · ${diagnostics.joints} joints · ${Math.round(diagnostics.triangles).toLocaleString()} triangles`;
    document.querySelector('#clip').value=kind;
    document.querySelector('#pause').textContent=paused?'Play':'Pause';
  }catch(error){diagnostics.errors.push(String(error));report();status.textContent='Model could not load: '+error.message;throw error;}
}
const resize=()=>{camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();renderer.setSize(stage.clientWidth,stage.clientHeight);draw();};
window.addEventListener('resize',resize);resize();
document.querySelector('#clip').addEventListener('change',e=>load(e.target.value));
document.querySelector('#pause').addEventListener('click',()=>{paused=!paused;document.querySelector('#pause').textContent=paused?'Play':'Pause';});
for(const name of ['front','side','back','close'])document.querySelector('#'+name).addEventListener('click',()=>view(name));
window.modelReview.load=load;window.modelReview.view=view;window.modelReview.freeze=(time)=>{paused=true;mixer?.setTime(time);draw();};
const clock=new THREE.Clock();renderer.setAnimationLoop(()=>{const delta=Math.min(clock.getDelta(),.05);if(mixer&&!paused)mixer.update(delta);controls.update();draw();});
load(['model','rigged','walking','running'].includes(params.get('clip'))?params.get('clip'):'rigged');
