import { useEffect, useRef } from 'react'

const VERT = `
attribute vec3 a_position;
attribute vec3 a_normal;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;
varying vec3 v_normal;
varying vec3 v_world;
void main(){
  vec4 world=u_model*vec4(a_position,1.0);
  v_world=world.xyz;
  v_normal=mat3(u_model)*a_normal;
  gl_Position=u_projection*u_view*world;
}`

const FRAG = `
precision mediump float;
uniform vec3 u_color;
uniform vec3 u_camera;
uniform float u_glow;
varying vec3 v_normal;
varying vec3 v_world;
void main(){
  vec3 n=normalize(v_normal);
  vec3 l=normalize(vec3(-0.55,0.8,0.7));
  float diff=max(dot(n,l),0.0);
  float rim=pow(1.0-max(dot(n,normalize(u_camera-v_world)),0.0),2.6);
  vec3 c=u_color*(0.28+0.72*diff)+vec3(0.28,0.95,1.0)*rim*u_glow;
  gl_FragColor=vec4(c,1.0);
}`

const cubeVerts=new Float32Array([
 -1,-1, 1, 0,0,1, 1,-1, 1,0,0,1, 1, 1, 1,0,0,1, -1,-1, 1,0,0,1, 1, 1, 1,0,0,1, -1, 1, 1,0,0,1,
  1,-1,-1, 0,0,-1,-1,-1,-1,0,0,-1,-1, 1,-1,0,0,-1, 1,-1,-1,0,0,-1,-1, 1,-1,0,0,-1, 1, 1,-1,0,0,-1,
 -1,-1,-1,-1,0,0,-1,-1, 1,-1,0,0,-1, 1, 1,-1,0,0,-1,-1,-1,-1,0,0,-1, 1, 1,-1,0,0,-1, 1,-1,0,0,
  1,-1, 1,1,0,0, 1,-1,-1,1,0,0, 1, 1,-1,1,0,0, 1,-1, 1,1,0,0, 1, 1,-1,1,0,0, 1, 1, 1,1,0,0,
 -1, 1, 1,0,1,0, 1, 1, 1,0,1,0, 1, 1,-1,0,1,0,-1, 1, 1,0,1,0, 1, 1,-1,0,1,0,-1, 1,-1,0,1,0,
 -1,-1,-1,0,-1,0, 1,-1,-1,0,-1,0, 1,-1, 1,0,-1,0,-1,-1,-1,0,-1,0, 1,-1, 1,0,-1,0,-1,-1, 1,0,-1,0
])

const I=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
const mul=(a,b)=>{
  const o=new Array(16).fill(0)
  for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k]
  return o
}
const translate=(x,y,z)=>{const m=I();m[12]=x;m[13]=y;m[14]=z;return m}
const scale=(x,y,z)=>{const m=I();m[0]=x;m[5]=y;m[10]=z;return m}
const rotX=a=>{const c=Math.cos(a),s=Math.sin(a),m=I();m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m}
const rotY=a=>{const c=Math.cos(a),s=Math.sin(a),m=I();m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m}
const rotZ=a=>{const c=Math.cos(a),s=Math.sin(a),m=I();m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m}
const perspective=(fov,aspect,near,far)=>{
  const f=1/Math.tan(fov/2),nf=1/(near-far)
  return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]
}
const lookAt=(eye,target=[0,0,0],up=[0,1,0])=>{
  let zx=eye[0]-target[0],zy=eye[1]-target[1],zz=eye[2]-target[2]
  let zl=Math.hypot(zx,zy,zz)||1;zx/=zl;zy/=zl;zz/=zl
  let xx=up[1]*zz-up[2]*zy,xy=up[2]*zx-up[0]*zz,xz=up[0]*zy-up[1]*zx
  let xl=Math.hypot(xx,xy,xz)||1;xx/=xl;xy/=xl;xz/=xl
  const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx
  return [xx,yx,zx,0,xy,yy,zy,0,xz,yz,zz,0,-(xx*eye[0]+xy*eye[1]+xz*eye[2]),-(yx*eye[0]+yy*eye[1]+yz*eye[2]),-(zx*eye[0]+zy*eye[1]+zz*eye[2]),1]
}

const box=(x,y,z,sx,sy,sz,color,rz=0,ry=0,rx=0)=>({x,y,z,sx,sy,sz,color,rz,ry,rx})
const C={
  cyan:[.12,.82,.95], blue:[.08,.34,.96], violet:[.47,.2,1], white:[.82,.92,1],
  gold:[1,.55,.08], teal:[.05,.72,.68], void:[.19,.06,.39], red:[.68,.08,.18]
}

function sceneFor(variant){
  if(variant.includes('Plugin')) return [
    box(0,0,0,1.35,1.55,.3,C.blue,0,.35,.12),
    box(0,0,.55,.96,1.12,.12,C.cyan,0,-.18,-.06),
    box(-.42,.28,.9,.13,.48,.12,C.white,-.08),box(.42,.28,.9,.13,.48,.12,C.white,.08),
    box(0,-.38,.9,.45,.12,.12,C.white),
    box(-1.65,1.1,-.25,.1,.1,.1,C.cyan),box(1.62,-1.05,.1,.12,.12,.12,C.violet),
    box(0,-1.95,0,.85,.1,.5,C.violet)
  ]
  if(variant==='hero') return [
    box(0,0,0,1.65,1.65,.22,C.blue,0,.45,.18),
    box(0,0,.55,1.2,1.2,.12,C.cyan,0,-.2,-.1),
    box(-.58,.15,.92,.18,.62,.14,C.white,-.12),box(.58,.15,.92,.18,.62,.14,C.white,.12),
    box(0,-.48,.92,.62,.15,.14,C.white),
    box(-2.15,1.05,-.3,.12,.12,.12,C.cyan),box(2.05,-1.1,.1,.12,.12,.12,C.violet)
  ]
  if(variant.includes('Realm 100')) return [
    box(0,.4,0,.34,1.35,.28,C.gold,0,0,.12),box(0,-.85,0,.72,.22,.4,C.gold),
    box(-.52,-.82,0,.18,.18,.52,C.cyan),box(.52,-.82,0,.18,.18,.52,C.cyan),
    box(0,1.65,0,.62,.3,.32,C.white)
  ]
  if(variant.includes('Relic')) return [
    box(0,.15,0,.55,.55,.55,C.cyan,0,.4,.35),
    box(-1.35,.25,.05,.85,.12,.5,C.white,-.45,0,.08),box(1.35,.25,.05,.85,.12,.5,C.white,.45,0,-.08),
    box(0,-1.25,0,.2,.8,.2,C.gold),box(0,-2.0,0,.55,.14,.3,C.gold)
  ]
  if(variant.includes('Riftwalker')) return [
    box(0,.1,0,.23,1.65,.24,C.violet,.18,0,.08),box(0,1.78,0,.5,.18,.2,C.white,.18),
    box(-1.15,.15,.1,.78,.11,.4,C.violet,-.5,0,.2),box(1.15,.15,.1,.78,.11,.4,C.violet,.5,0,-.2),
    box(0,-1.35,.15,.55,.3,.7,C.blue)
  ]
  if(variant.includes('Warden')) return [
    box(0,1.15,0,.75,.7,.55,C.teal,0,.25,.04),box(0,.05,0,.85,.95,.48,C.teal),
    box(-.85,.15,0,.25,.85,.28,C.cyan,.12),box(.85,.15,0,.25,.85,.28,C.cyan,-.12),
    box(-.35,-1.35,0,.3,.75,.34,C.teal),box(.35,-1.35,0,.3,.75,.34,C.teal),
    box(1.35,.4,.15,.16,1.2,.16,C.white,.28)
  ]
  return [
    box(0,1.15,0,.75,.55,.5,C.void,0,.25),box(0,.1,0,.85,.9,.45,C.void),
    box(-.35,-1.25,0,.3,.7,.32,C.violet),box(.35,-1.25,0,.3,.7,.32,C.violet),
    box(1.2,.25,.1,.18,1.25,.17,C.violet,.25)
  ]
}

function shader(gl,type,src){
  const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s
}
function program(gl){
  const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,VERT));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(p);return p
}

export default function ES3DViewer({variant='hero',compact=false,label='Interactive 3D viewer'}){
  const canvasRef=useRef(null)
  const stateRef=useRef({rx:-.18,ry:.45,zoom:compact?7.3:7.8,drag:false,x:0,y:0,pinch:0})

  useEffect(()=>{
    const canvas=canvasRef.current
    const gl=canvas?.getContext('webgl',{antialias:true,alpha:true,powerPreference:'high-performance'})
    if(!gl)return
    const p=program(gl);gl.useProgram(p)
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,cubeVerts,gl.STATIC_DRAW)
    const stride=24
    const ap=gl.getAttribLocation(p,'a_position'),an=gl.getAttribLocation(p,'a_normal')
    gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,stride,0)
    gl.enableVertexAttribArray(an);gl.vertexAttribPointer(an,3,gl.FLOAT,false,stride,12)
    const up=gl.getUniformLocation(p,'u_projection'),uv=gl.getUniformLocation(p,'u_view'),um=gl.getUniformLocation(p,'u_model'),uc=gl.getUniformLocation(p,'u_color'),uca=gl.getUniformLocation(p,'u_camera'),ug=gl.getUniformLocation(p,'u_glow')
    gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK)
    const scene=sceneFor(variant)
    let raf=0,last=0
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
    const resize=()=>{
      const dpr=Math.min(window.devicePixelRatio||1,2)
      const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight)
      if(canvas.width!==Math.floor(w*dpr)||canvas.height!==Math.floor(h*dpr)){canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr)}
      gl.viewport(0,0,canvas.width,canvas.height)
    }
    const render=t=>{
      resize()
      const s=stateRef.current
      if(!s.drag&&!reduce)s.ry+=Math.min(.004,(t-last)*.000012)
      last=t
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
      const aspect=canvas.width/canvas.height
      const proj=perspective(Math.PI/4,aspect,.1,50)
      const eye=[0,.15,s.zoom],view=lookAt(eye)
      gl.uniformMatrix4fv(up,false,new Float32Array(proj));gl.uniformMatrix4fv(uv,false,new Float32Array(view));gl.uniform3fv(uca,new Float32Array(eye));gl.uniform1f(ug,compact?1.25:1.05)
      const orbit=mul(rotY(s.ry),rotX(s.rx))
      for(const q of scene){
        let m=mul(orbit,translate(q.x,q.y,q.z));m=mul(m,rotZ(q.rz));m=mul(m,rotY(q.ry));m=mul(m,rotX(q.rx));m=mul(m,scale(q.sx,q.sy,q.sz))
        gl.uniformMatrix4fv(um,false,new Float32Array(m));gl.uniform3fv(uc,new Float32Array(q.color));gl.drawArrays(gl.TRIANGLES,0,36)
      }
      raf=requestAnimationFrame(render)
    }
    raf=requestAnimationFrame(render)
    return()=>cancelAnimationFrame(raf)
  },[variant,compact])

  const down=e=>{const s=stateRef.current;s.drag=true;s.x=e.clientX;s.y=e.clientY;e.currentTarget.setPointerCapture?.(e.pointerId)}
  const move=e=>{const s=stateRef.current;if(!s.drag)return;s.ry+=(e.clientX-s.x)*.012;s.rx=Math.max(-1.25,Math.min(1.25,s.rx+(e.clientY-s.y)*.009));s.x=e.clientX;s.y=e.clientY}
  const up=()=>{stateRef.current.drag=false}
  const wheel=e=>{e.preventDefault();const s=stateRef.current;s.zoom=Math.max(5.2,Math.min(11.5,s.zoom+e.deltaY*.006))}

  return <div className={compact?'es3d-viewer compact':'es3d-viewer'} aria-label={label}>
    <canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel}/>
    <div className="es3d-hint"><span>↔ DRAG TO ROTATE</span><span>SCROLL TO ZOOM</span></div>
  </div>
}
