import * as THREE from 'three';
const canvas=document.getElementById('cup3d');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});}catch(e){canvas.remove();throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(35,1,.1,100);
cam.position.set(0,3.2,9.5);cam.lookAt(0,.4,0);
scene.add(new THREE.HemisphereLight(0xffe9cf,0x1b1008,1.1));
const key=new THREE.DirectionalLight(0xffd2a0,2.4);key.position.set(4,6,5);scene.add(key);
const rim=new THREE.DirectionalLight(0xc8643b,2.2);rim.position.set(-5,2,-4);scene.add(rim);

const root=new THREE.Group();scene.add(root);
// cup body (lathe)
const pts=[];
for(let i=0;i<=24;i++){const t=i/24;const y=t*1.9;const r=.78+.42*Math.pow(t,.8)-.06*Math.sin(t*Math.PI);pts.push(new THREE.Vector2(r,y));}
const outer=pts.slice();const inner=pts.slice().reverse().map(p=>new THREE.Vector2(p.x-.09,p.y));
const prof=[new THREE.Vector2(0,0),...outer,...inner.slice(0,-1),new THREE.Vector2(.0,.12)];
const ceramic=new THREE.MeshPhysicalMaterial({color:0xf4eadc,roughness:.35,clearcoat:1,clearcoatRoughness:.15,sheen:.3});
const cup=new THREE.Mesh(new THREE.LatheGeometry(prof,96),ceramic);
root.add(cup);
// coffee surface with latte art
const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
const grd=g.createRadialGradient(256,256,20,256,256,256);grd.addColorStop(0,'#c99a6b');grd.addColorStop(.55,'#8a5532');grd.addColorStop(1,'#4a2713');
g.fillStyle=grd;g.fillRect(0,0,512,512);
g.strokeStyle='rgba(250,236,214,.95)';g.fillStyle='rgba(250,236,214,.95)';g.lineCap='round';
for(let i=0;i<6;i++){g.beginPath();g.ellipse(256,300-i*34,150-i*20,46-i*4,0,Math.PI,0);g.lineWidth=16-i;g.stroke();}
g.beginPath();g.ellipse(256,110,40,40,0,0,Math.PI*2);g.fill();
g.lineWidth=8;g.beginPath();g.moveTo(256,90);g.lineTo(256,380);g.stroke();
const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
const coffee=new THREE.Mesh(new THREE.CircleGeometry(1.1,64),new THREE.MeshStandardMaterial({map:tex,roughness:.25,metalness:0}));
coffee.rotation.x=-Math.PI/2;coffee.position.y=1.72;root.add(coffee);
// handle
const handle=new THREE.Mesh(new THREE.TorusGeometry(.48,.11,24,64,Math.PI*1.25),ceramic);
handle.position.set(1.18,1.05,0);handle.rotation.z=-Math.PI*.62;root.add(handle);
// saucer
const sp=[new THREE.Vector2(0,-.05),new THREE.Vector2(1.9,-.02),new THREE.Vector2(2.1,.12),new THREE.Vector2(2.05,.16),new THREE.Vector2(1.85,.06),new THREE.Vector2(.9,.02),new THREE.Vector2(0,.03)];
const saucer=new THREE.Mesh(new THREE.LatheGeometry(sp,96),ceramic);saucer.position.y=-.05;root.add(saucer);
// beans
const beanMat=new THREE.MeshStandardMaterial({color:0x4a2412,roughness:.45});
const beans=[];
for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.16,24,16),beanMat);b.scale.set(1,.7,1.35);
  const groove=new THREE.Mesh(new THREE.TorusGeometry(.13,.018,8,24,Math.PI),new THREE.MeshStandardMaterial({color:0x26110a}));groove.rotation.y=Math.PI/2;groove.scale.set(1,1,1);b.add(groove);
  const a=i/14*Math.PI*2;b.userData={a,r:2.6+Math.random()*1.2,y:Math.random()*3-.3,s:.2+Math.random()*.35,spin:Math.random()*2};scene.add(b);beans.push(b);}
// steam
const N=320;const sg=new THREE.BufferGeometry();const pos=new Float32Array(N*3);const seed=new Float32Array(N),ox=new Float32Array(N),oz=new Float32Array(N);
for(let i=0;i<N;i++){seed[i]=Math.random();ox[i]=(Math.random()-.5)*.8;oz[i]=(Math.random()-.5)*.8;}
sg.setAttribute('position',new THREE.BufferAttribute(pos,3));
const sc=document.createElement('canvas');sc.width=sc.height=64;const s2=sc.getContext('2d');const rg=s2.createRadialGradient(32,32,0,32,32,32);rg.addColorStop(0,'rgba(255,245,230,.55)');rg.addColorStop(1,'rgba(255,245,230,0)');s2.fillStyle=rg;s2.fillRect(0,0,64,64);
const steam=new THREE.Points(sg,new THREE.PointsMaterial({size:.6,map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false,opacity:.5}));
root.add(steam);

let mx=0,my=0,sy=0;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;});
addEventListener('scroll',()=>{sy=scrollY;},{passive:true});
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
  const mobile=w<760;root.position.set(mobile?1.1:2.7,mobile?-2.2:-0.7,0);root.scale.setScalar(mobile?.78:.92);canvas.style.opacity=mobile?.55:1;}
addEventListener('resize',resize);resize();
const clock=new THREE.Clock();
function tick(){
  const t=clock.getElapsedTime();
  root.rotation.y+=((mx*.8+t*.15+sy*.002)-root.rotation.y)*.05;
  root.rotation.x+=((my*.25+.18)-root.rotation.x)*.05;
  root.position.y+=Math.sin(t*1.2)*.0018;
  for(let i=0;i<N;i++){const k=(seed[i]+t*.12)%1;const sw=Math.sin(t*1.5+seed[i]*20)*.35*k;
    pos[i*3]=ox[i]*(1+k*1.4)+sw;pos[i*3+1]=1.8+k*2.8;pos[i*3+2]=oz[i]*(1+k);}
  sg.attributes.position.needsUpdate=true;
  steam.material.opacity=.32;
  beans.forEach(b=>{const u=b.userData;const a=u.a+t*u.s*.3;b.position.set(root.position.x+Math.cos(a)*u.r,root.position.y+u.y+Math.sin(t*u.s+u.a)*.3,Math.sin(a)*u.r*.6-1);b.rotation.set(t*u.spin*.4,t*u.spin*.3,0);});
  renderer.render(scene,cam);
  if(!reduce)requestAnimationFrame(tick);
}
tick();
