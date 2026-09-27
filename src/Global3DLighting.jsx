import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const routePalettes={
  home:[[.22,.48,1.0],[.35,.95,1.0],[.58,.36,1.0]],
  services:[[.46,.28,1.0],[.28,.78,1.0],[.66,.42,.96]],
  smp:[[.16,.86,.55],[.22,.58,1.0],[.28,.92,.82]],
  arcade:[[.62,.28,1.0],[.22,.82,1.0],[.52,.42,1.0]],
  tools:[[1.0,.54,.18],[.28,.78,1.0],[.86,.42,.2]],
  reviews:[[1.0,.72,.22],[.64,.34,1.0],[1.0,.52,.32]],
  about:[[.28,.58,1.0],[.34,.9,1.0],[.44,.56,1.0]],
}

const VERT=`
attribute vec2 a_position;
void main(){
  gl_Position=vec4(a_position,0.0,1.0);
}`

const FRAG=`
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_scroll;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform float u_day;

float hash21(vec2 p){
  p=fract(p*vec2(123.34,456.21));
  p+=dot(p,p+45.32);
  return fract(p.x*p.y);
}

float lightVolume(vec3 ro,vec3 rd,vec3 lp,float radius){
  vec3 oc=lp-ro;
  float t=max(dot(oc,rd),0.0);
  vec3 closest=ro+rd*t;
  float d=length(closest-lp);
  float beam=exp(-d*d/(radius*radius));
  float depth=1.0/(1.0+.11*t*t);
  return beam*depth;
}

float floorGrid(vec3 ro,vec3 rd){
  if(rd.y>=-.02)return 0.0;
  float t=(-1.55-ro.y)/rd.y;
  if(t<=0.0)return 0.0;
  vec3 p=ro+rd*t;
  vec2 wave=abs(sin(p.xz*1.10));
  float line=pow(max(0.0,1.0-min(wave.x,wave.y)),16.0);
  float fade=exp(-.055*length(p.xz));
  return line*fade*.11;
}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
  vec2 mouse=(u_mouse-.5)*vec2(.34,.22);

  vec3 ro=vec3(mouse.x*.65,.08+mouse.y*.35,4.3+u_scroll*.35);
  vec3 rd=normalize(vec3(uv.x+mouse.x*.06,uv.y+mouse.y*.05,-1.62));

  float t=u_time;
  vec3 l1=vec3(sin(t*.23)*2.7, .55+sin(t*.31)*.45, -1.6+cos(t*.17)*1.2);
  vec3 l2=vec3(cos(t*.19)*3.1,-.35+cos(t*.27)*.5,-3.6+sin(t*.21)*1.4);
  vec3 l3=vec3(sin(t*.14+2.1)*2.2,1.25+cos(t*.2)*.35,-5.2+cos(t*.16)*1.1);

  float v1=lightVolume(ro,rd,l1,1.05);
  float v2=lightVolume(ro,rd,l2,1.25);
  float v3=lightVolume(ro,rd,l3,.92);

  vec3 nightBase=vec3(.003,.007,.018);
  vec3 dayBase=vec3(.025,.042,.075);
  vec3 col=mix(nightBase,dayBase,u_day);
  float lightBoost=mix(1.0,.78,u_day);
  col+=u_colorA*v1*.44*lightBoost;
  col+=u_colorB*v2*.34*lightBoost;
  col+=u_colorC*v3*.3*lightBoost;

  float horizon=exp(-pow((uv.y+.12)*4.0,2.0))*mix(.055,.095,u_day);
  col+=(u_colorA*.34+u_colorB*.24)*horizon;

  float grid=floorGrid(ro,rd);
  col+=(u_colorB*.55+u_colorA*.15)*grid*mix(1.0,.7,u_day);

  float vignette=1.0-smoothstep(.28,1.05,length(uv*vec2(.86,1.08)));
  col*=.62+.38*vignette;

  float grain=(hash21(gl_FragCoord.xy+fract(t)*73.0)-.5)*.012;
  col+=grain;

  gl_FragColor=vec4(col,1.0);
}`

function shader(gl,type,source){
  const s=gl.createShader(type)
  gl.shaderSource(s,source)
  gl.compileShader(s)
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
    const error=gl.getShaderInfoLog(s)
    gl.deleteShader(s)
    throw new Error(error||'Shader compilation failed')
  }
  return s
}

function createProgram(gl){
  const p=gl.createProgram()
  const vs=shader(gl,gl.VERTEX_SHADER,VERT)
  const fs=shader(gl,gl.FRAGMENT_SHADER,FRAG)
  gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p)
  gl.deleteShader(vs);gl.deleteShader(fs)
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){
    const error=gl.getProgramInfoLog(p)
    gl.deleteProgram(p)
    throw new Error(error||'Shader link failed')
  }
  return p
}

function routeKey(pathname){
  if(pathname.startsWith('/smp')||pathname.startsWith('/store'))return 'smp'
  if(['/arcade','/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense'].includes(pathname))return 'arcade'
  if(pathname==='/serviceshowcase')return 'services'
  if(pathname==='/estools'||pathname==='/tools')return 'tools'
  if(pathname==='/testimonials')return 'reviews'
  if(['/about','/leadership','/faq'].includes(pathname))return 'about'
  return 'home'
}

export default function Global3DLighting(){
  const canvasRef=useRef(null)
  const location=useLocation()

  useEffect(()=>{
    const canvas=canvasRef.current
    const mobile=matchMedia('(max-width: 860px), (pointer: coarse)').matches

    // Mobile Performance Mode: skip the always-running WebGL shader completely.
    // The static fallback/depth layers preserve the look without burning GPU every frame.
    if(mobile){
      canvas?.classList.add('mobile-static')
      return
    }

    const gl=canvas?.getContext('webgl',{
      alpha:false,
      antialias:false,
      depth:false,
      stencil:false,
      powerPreference:'low-power',
      preserveDrawingBuffer:false,
    })
    if(!gl){
      canvas?.classList.add('webgl-failed')
      return
    }

    let program
    try{program=createProgram(gl)}
    catch{
      canvas.classList.add('webgl-failed')
      return
    }

    gl.useProgram(program)
    const quad=gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER,quad)
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW)

    const pos=gl.getAttribLocation(program,'a_position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0)

    const uniforms={
      resolution:gl.getUniformLocation(program,'u_resolution'),
      time:gl.getUniformLocation(program,'u_time'),
      mouse:gl.getUniformLocation(program,'u_mouse'),
      scroll:gl.getUniformLocation(program,'u_scroll'),
      a:gl.getUniformLocation(program,'u_colorA'),
      b:gl.getUniformLocation(program,'u_colorB'),
      c:gl.getUniformLocation(program,'u_colorC'),
      day:gl.getUniformLocation(program,'u_day'),
    }

    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
    const targetFps=50
    const frameMs=1000/targetFps
    const maxDpr=1.35
    const state={
      mx:.5,my:.5,tx:.5,ty:.5,scroll:0,visible:!document.hidden,
      palette:routePalettes[routeKey(location.pathname)]||routePalettes.home,
      day:localStorage.getItem('esn_lighting_mode')==='day'?1:0,
    }
    let raf=0
    let last=0
    const started=performance.now()

    const resize=()=>{
      const rect=canvas.getBoundingClientRect()
      const dpr=Math.min(devicePixelRatio||1,maxDpr)
      const width=Math.max(1,Math.floor(rect.width*dpr))
      const height=Math.max(1,Math.floor(rect.height*dpr))
      if(canvas.width!==width||canvas.height!==height){
        canvas.width=width;canvas.height=height
        gl.viewport(0,0,width,height)
      }
    }

    const pointer=e=>{
      state.tx=e.clientX/Math.max(1,innerWidth)
      state.ty=1-e.clientY/Math.max(1,innerHeight)
    }
    const scroll=()=>{
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight)
      state.scroll=Math.min(1,Math.max(0,scrollY/max))
    }
    const visibility=()=>{state.visible=!document.hidden}
    const settings=e=>{
      const detail=e.detail||{}
      if(Array.isArray(detail.palette)&&detail.palette.length>=2){
        const normalize=value=>{
          if(Array.isArray(value))return value
          return String(value).split(/\s+/).map(Number).slice(0,3).map(n=>Math.max(0,Math.min(255,n))/255)
        }
        const a=normalize(detail.palette[0]),b=normalize(detail.palette[1])
        const c=[Math.min(1,(a[0]+b[0])*.58),Math.min(1,(a[1]+b[1])*.58),Math.min(1,(a[2]+b[2])*.58)]
        if(a.length===3&&b.length===3)state.palette=[a,b,c]
      }
      state.day=detail.lighting==='day'?1:0
    }

    window.addEventListener('pointermove',pointer,{passive:true})
    window.addEventListener('scroll',scroll,{passive:true})
    document.addEventListener('visibilitychange',visibility)
    window.addEventListener('esn-visual-settings',settings)
    scroll()

    const draw=now=>{
      raf=requestAnimationFrame(draw)
      if(!state.visible)return
      if(now-last<frameMs&&!reduce)return
      last=now
      resize()

      state.mx+=(state.tx-state.mx)*.045
      state.my+=(state.ty-state.my)*.045

      const seconds=reduce?0:(now-started)/1000
      gl.uniform2f(uniforms.resolution,canvas.width,canvas.height)
      gl.uniform1f(uniforms.time,seconds)
      gl.uniform2f(uniforms.mouse,state.mx,state.my)
      gl.uniform1f(uniforms.scroll,state.scroll)
      gl.uniform3fv(uniforms.a,new Float32Array(state.palette[0]))
      gl.uniform3fv(uniforms.b,new Float32Array(state.palette[1]))
      gl.uniform3fv(uniforms.c,new Float32Array(state.palette[2]))
      gl.uniform1f(uniforms.day,state.day)
      gl.drawArrays(gl.TRIANGLES,0,3)
    }
    raf=requestAnimationFrame(draw)

    return()=>{
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove',pointer)
      window.removeEventListener('scroll',scroll)
      document.removeEventListener('visibilitychange',visibility)
      window.removeEventListener('esn-visual-settings',settings)
      gl.deleteBuffer(quad)
      gl.deleteProgram(program)
    }
  },[location.pathname])

  return <div className="global-3d-lighting" aria-hidden="true">
    <canvas ref={canvasRef}/>
    <div className="global-3d-fallback"/>
    <div className="global-3d-depth-mask"/>
  </div>
}
