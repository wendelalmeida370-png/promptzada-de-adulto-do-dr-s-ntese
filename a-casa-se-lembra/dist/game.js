(()=>{var Sf=Object.defineProperty;var wf=(n,t,e)=>t in n?Sf(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e;var Rh=(n,t,e)=>wf(n,typeof t!="symbol"?t+"":t,e);var Kh=0,Jl=1,Qh=2;var Xn=1,tu=2,Rs=3,In=0,oi=1,Ne=2,en=0,Cs=1,fa=2,$l=3,jl=4,eu=5;var Yn=100,iu=101,nu=102,su=103,au=104,ru=200,ou=201,lu=202,cu=203,Kl=204,Ql=205,hu=206,uu=207,du=208,fu=209,pu=210,mu=211,gu=212,vu=213,_u=214,cr=0,hr=1,ur=2,xs=3,dr=4,fr=5,pr=6,mr=7,tc=0,xu=1,yu=2,Ci=0,ec=1,ic=2,nc=3,sc=4,ac=5,rc=6,oc=7;var lc=300,Ln=301,Zn=302,Br=303,zr=304,pa=306,ji=1e3,Di=1001,gr=1002,ei=1003,bu=1004;var ma=1005;var ri=1006,Vr=1007;var Dn=1008;var Mi=1009,cc=1010,hc=1011,Ps=1012,Hr=1013,Hi=1014,Gi=1015,li=1016,Gr=1017,Wr=1018,Is=1020,uc=35902,dc=35899,fc=1021,pc=1022,Ni=1023,Ki=1026,Fn=1027,mc=1028,qr=1029,Nn=1030,Xr=1031;var Yr=1033,ga=33776,va=33777,_a=33778,xa=33779,Zr=35840,Jr=35841,$r=35842,jr=35843,Kr=36196,Qr=37492,to=37496,eo=37488,io=37489,ya=37490,no=37491,so=37808,ao=37809,ro=37810,oo=37811,lo=37812,co=37813,ho=37814,uo=37815,fo=37816,po=37817,mo=37818,go=37819,vo=37820,_o=37821,xo=36492,yo=36494,bo=36495,Mo=36283,So=36284,ba=36285,wo=36286;var Ys=2300,vr=2301,or=2302,zl=2303,Vl=2400,Hl=2401,Gl=2402;var Mu=3200;var Eo=0,Su=1,Wi="",xe="srgb",Zs="srgb-linear",Js="linear",ve="srgb";var lr=7680;var wu=519,Eu=512,Tu=513,Au=514,To=515,Ru=516,Cu=517,Ao=518,Pu=519,Iu=35044;var gc="300 es",Vi=2e3,ys=2001;function Ef(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}function Tf(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function $s(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Lu(){let n=$s("canvas");return n.style.display="block",n}var Ch={},bs=null;function vc(...n){let t="THREE."+n.shift();bs?bs("log",t,...n):console.log(t,...n)}function Du(n){let t=n[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=n[1];e&&e.isStackTrace?n[0]+=" "+e.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Gt(...n){n=Du(n);let t="THREE."+n.shift();if(bs)bs("warn",t,...n);else{let e=n[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...n)}}function Ht(...n){n=Du(n);let t="THREE."+n.shift();if(bs)bs("error",t,...n);else{let e=n[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...n)}}function Hn(...n){let t=n.join(" ");t in Ch||(Ch[t]=!0,Gt(...n))}function Fu(n,t,e){return new Promise(function(i,s){function a(){switch(n.clientWaitSync(t,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(a,e);break;default:i()}}setTimeout(a,e)})}var Nu={[cr]:hr,[ur]:pr,[dr]:mr,[xs]:fr,[hr]:cr,[pr]:ur,[mr]:dr,[fr]:xs},Qi=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let a=s.indexOf(e);a!==-1&&s.splice(a,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let a=0,r=s.length;a<r;a++)s[a].call(this,t);t.target=null}}},ui=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var vl=Math.PI/180,js=180/Math.PI;function Ma(){let n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(ui[n&255]+ui[n>>8&255]+ui[n>>16&255]+ui[n>>24&255]+"-"+ui[t&255]+ui[t>>8&255]+"-"+ui[t>>16&15|64]+ui[t>>24&255]+"-"+ui[e&63|128]+ui[e>>8&255]+"-"+ui[e>>16&255]+ui[e>>24&255]+ui[i&255]+ui[i>>8&255]+ui[i>>16&255]+ui[i>>24&255]).toLowerCase()}function ce(n,t,e){return Math.max(t,Math.min(e,n))}function Af(n,t){return(n%t+t)%t}function _l(n,t,e){return(1-e)*n+e*t}function Hs(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function xi(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Mc=class Mc{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=ce(this.x,t.x,e.x),this.y=ce(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=ce(this.x,t,e),this.y=ce(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ce(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(ce(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),s=Math.sin(e),a=this.x-t.x,r=this.y-t.y;return this.x=a*i-r*s+t.x,this.y=a*s+r*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Mc.prototype.isVector2=!0;var jt=Mc,tn=class{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,a,r,o){let l=i[s+0],c=i[s+1],h=i[s+2],d=i[s+3],u=a[r+0],f=a[r+1],g=a[r+2],_=a[r+3];if(d!==_||l!==u||c!==f||h!==g){let p=l*u+c*f+h*g+d*_;p<0&&(u=-u,f=-f,g=-g,_=-_,p=-p);let m=1-o;if(p<.9995){let M=Math.acos(p),A=Math.sin(M);m=Math.sin(m*M)/A,o=Math.sin(o*M)/A,l=l*m+u*o,c=c*m+f*o,h=h*m+g*o,d=d*m+_*o}else{l=l*m+u*o,c=c*m+f*o,h=h*m+g*o,d=d*m+_*o;let M=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=M,c*=M,h*=M,d*=M}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,i,s,a,r){let o=i[s],l=i[s+1],c=i[s+2],h=i[s+3],d=a[r],u=a[r+1],f=a[r+2],g=a[r+3];return t[e]=o*g+h*d+l*f-c*u,t[e+1]=l*g+h*u+c*d-o*f,t[e+2]=c*g+h*f+o*u-l*d,t[e+3]=h*g-o*d-l*u-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,s=t._y,a=t._z,r=t._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(s/2),d=o(a/2),u=l(i/2),f=l(s/2),g=l(a/2);switch(r){case"XYZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"YZX":this._x=u*h*d+c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d-u*f*g;break;case"XZY":this._x=u*h*d-c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d+u*f*g;break;default:Gt("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],s=e[4],a=e[8],r=e[1],o=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=i+o+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(a-c)*f,this._z=(r-s)*f}else if(i>o&&i>d){let f=2*Math.sqrt(1+i-o-d);this._w=(h-l)/f,this._x=.25*f,this._y=(s+r)/f,this._z=(a+c)/f}else if(o>d){let f=2*Math.sqrt(1+o-i-d);this._w=(a-c)/f,this._x=(s+r)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+d-i-o);this._w=(r-s)/f,this._x=(a+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ce(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,s=t._y,a=t._z,r=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+r*o+s*c-a*l,this._y=s*h+r*l+a*o-i*c,this._z=a*h+r*c+i*l-s*o,this._w=r*h-i*o-s*l-a*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,s=t._y,a=t._z,r=t._w,o=this.dot(t);o<0&&(i=-i,s=-s,a=-a,r=-r,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+s*e,this._z=this._z*l+a*e,this._w=this._w*l+r*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+s*e,this._z=this._z*l+a*e,this._w=this._w*l+r*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),a*Math.sin(e),a*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Sc=class Sc{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Ph.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Ph.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*e+a[3]*i+a[6]*s,this.y=a[1]*e+a[4]*i+a[7]*s,this.z=a[2]*e+a[5]*i+a[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,a=t.elements,r=1/(a[3]*e+a[7]*i+a[11]*s+a[15]);return this.x=(a[0]*e+a[4]*i+a[8]*s+a[12])*r,this.y=(a[1]*e+a[5]*i+a[9]*s+a[13])*r,this.z=(a[2]*e+a[6]*i+a[10]*s+a[14])*r,this}applyQuaternion(t){let e=this.x,i=this.y,s=this.z,a=t.x,r=t.y,o=t.z,l=t.w,c=2*(r*s-o*i),h=2*(o*e-a*s),d=2*(a*i-r*e);return this.x=e+l*c+r*d-o*h,this.y=i+l*h+o*c-a*d,this.z=s+l*d+a*h-r*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*s,this.y=a[1]*e+a[5]*i+a[9]*s,this.z=a[2]*e+a[6]*i+a[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=ce(this.x,t.x,e.x),this.y=ce(this.y,t.y,e.y),this.z=ce(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=ce(this.x,t,e),this.y=ce(this.y,t,e),this.z=ce(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ce(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,s=t.y,a=t.z,r=e.x,o=e.y,l=e.z;return this.x=s*l-a*o,this.y=a*r-i*l,this.z=i*o-s*r,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return xl.copy(this).projectOnVector(t),this.sub(xl)}reflect(t){return this.sub(xl.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(ce(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Sc.prototype.isVector3=!0;var I=Sc,xl=new I,Ph=new tn,wc=class wc{constructor(t,e,i,s,a,r,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,a,r,o,l,c)}set(t,e,i,s,a,r,o,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=a,h[5]=l,h[6]=i,h[7]=r,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,a=this.elements,r=i[0],o=i[3],l=i[6],c=i[1],h=i[4],d=i[7],u=i[2],f=i[5],g=i[8],_=s[0],p=s[3],m=s[6],M=s[1],A=s[4],b=s[7],w=s[2],S=s[5],R=s[8];return a[0]=r*_+o*M+l*w,a[3]=r*p+o*A+l*S,a[6]=r*m+o*b+l*R,a[1]=c*_+h*M+d*w,a[4]=c*p+h*A+d*S,a[7]=c*m+h*b+d*R,a[2]=u*_+f*M+g*w,a[5]=u*p+f*A+g*S,a[8]=u*m+f*b+g*R,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*r*h-e*o*c-i*a*h+i*o*l+s*a*c-s*r*l}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=h*r-o*c,u=o*l-h*a,f=c*a-r*l,g=e*d+i*u+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return t[0]=d*_,t[1]=(s*c-h*i)*_,t[2]=(o*i-s*r)*_,t[3]=u*_,t[4]=(h*e-s*l)*_,t[5]=(s*a-o*e)*_,t[6]=f*_,t[7]=(i*l-c*e)*_,t[8]=(r*e-i*a)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,a,r,o){let l=Math.cos(a),c=Math.sin(a);return this.set(i*l,i*c,-i*(l*r+c*o)+r+t,-s*c,s*l,-s*(-c*r+l*o)+o+e,0,0,1),this}scale(t,e){return Hn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(yl.makeScale(t,e)),this}rotate(t){return Hn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(yl.makeRotation(-t)),this}translate(t,e){return Hn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(yl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};wc.prototype.isMatrix3=!0;var Jt=wc,yl=new Jt,Ih=new Jt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Lh=new Jt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Rf(){let n={enabled:!0,workingColorSpace:Zs,spaces:{},convert:function(s,a,r){return this.enabled===!1||a===r||!a||!r||(this.spaces[a].transfer===ve&&(s.r=hn(s.r),s.g=hn(s.g),s.b=hn(s.b)),this.spaces[a].primaries!==this.spaces[r].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===ve&&(s.r=_s(s.r),s.g=_s(s.g),s.b=_s(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Wi?Js:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,r){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[r].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return Hn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return Hn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,a)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Zs]:{primaries:t,whitePoint:i,transfer:Js,toXYZ:Ih,fromXYZ:Lh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:xe},outputColorSpaceConfig:{drawingBufferColorSpace:xe}},[xe]:{primaries:t,whitePoint:i,transfer:ve,toXYZ:Ih,fromXYZ:Lh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:xe}}}),n}var le=Rf();function hn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function _s(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var as,_r=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{as===void 0&&(as=$s("canvas")),as.width=t.width,as.height=t.height;let s=as.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=as}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=$s("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),a=s.data;for(let r=0;r<a.length;r++)a[r]=hn(a[r]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(hn(e[i]/255)*255):e[i]=hn(e[i]);return{data:e,width:t.width,height:t.height}}else return Gt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Cf=0,Ms=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Cf++}),this.uuid=Ma(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let r=0,o=s.length;r<o;r++)s[r].isDataTexture?a.push(bl(s[r].image)):a.push(bl(s[r]))}else a=bl(s);i.url=a}return e||(t.images[this.uuid]=i),i}};function bl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?_r.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Gt("Texture: Unable to serialize Texture."),{})}var Pf=0,Ml=new I,mi=class n extends Qi{constructor(t=n.DEFAULT_IMAGE,e=n.DEFAULT_MAPPING,i=Di,s=Di,a=ri,r=Dn,o=Ni,l=Mi,c=n.DEFAULT_ANISOTROPY,h=Wi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Pf++}),this.uuid=Ma(),this.name="",this.source=new Ms(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=a,this.minFilter=r,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new jt(0,0),this.repeat=new jt(1,1),this.center=new jt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Jt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ml).x}get height(){return this.source.getSize(Ml).y}get depth(){return this.source.getSize(Ml).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Gt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Gt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==lc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ji:t.x=t.x-Math.floor(t.x);break;case Di:t.x=t.x<0?0:1;break;case gr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ji:t.y=t.y-Math.floor(t.y);break;case Di:t.y=t.y<0?0:1;break;case gr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};mi.DEFAULT_IMAGE=null;mi.DEFAULT_MAPPING=lc;mi.DEFAULT_ANISOTROPY=1;var Ec=class Ec{constructor(t=0,e=0,i=0,s=1){this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,a=this.w,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s+r[12]*a,this.y=r[1]*e+r[5]*i+r[9]*s+r[13]*a,this.z=r[2]*e+r[6]*i+r[10]*s+r[14]*a,this.w=r[3]*e+r[7]*i+r[11]*s+r[15]*a,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,a,l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],g=l[9],_=l[2],p=l[6],m=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+_)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let A=(c+1)/2,b=(f+1)/2,w=(m+1)/2,S=(h+u)/4,R=(d+_)/4,x=(g+p)/4;return A>b&&A>w?A<.01?(i=0,s=.707106781,a=.707106781):(i=Math.sqrt(A),s=S/i,a=R/i):b>w?b<.01?(i=.707106781,s=0,a=.707106781):(s=Math.sqrt(b),i=S/s,a=x/s):w<.01?(i=.707106781,s=.707106781,a=0):(a=Math.sqrt(w),i=R/a,s=x/a),this.set(i,s,a,e),this}let M=Math.sqrt((p-g)*(p-g)+(d-_)*(d-_)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(p-g)/M,this.y=(d-_)/M,this.z=(u-h)/M,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=ce(this.x,t.x,e.x),this.y=ce(this.y,t.y,e.y),this.z=ce(this.z,t.z,e.z),this.w=ce(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=ce(this.x,t,e),this.y=ce(this.y,t,e),this.z=ce(this.z,t,e),this.w=ce(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ce(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Ec.prototype.isVector4=!0;var we=Ec,xr=class extends Qi{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ri,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new we(0,0,t,e),this.scissorTest=!1,this.viewport=new we(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:i.depth},a=new mi(s),r=i.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:ri,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Ms(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ze=class extends xr{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},Ks=class extends mi{constructor(t=null,e=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=ei,this.minFilter=ei,this.wrapR=Di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var yr=class extends mi{constructor(t=null,e=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=ei,this.minFilter=ei,this.wrapR=Di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Or=class Or{constructor(t,e,i,s,a,r,o,l,c,h,d,u,f,g,_,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,a,r,o,l,c,h,d,u,f,g,_,p)}set(t,e,i,s,a,r,o,l,c,h,d,u,f,g,_,p){let m=this.elements;return m[0]=t,m[4]=e,m[8]=i,m[12]=s,m[1]=a,m[5]=r,m[9]=o,m[13]=l,m[2]=c,m[6]=h,m[10]=d,m[14]=u,m[3]=f,m[7]=g,m[11]=_,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Or().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,s=1/rs.setFromMatrixColumn(t,0).length(),a=1/rs.setFromMatrixColumn(t,1).length(),r=1/rs.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*a,e[5]=i[5]*a,e[6]=i[6]*a,e[7]=0,e[8]=i[8]*r,e[9]=i[9]*r,e[10]=i[10]*r,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,s=t.y,a=t.z,r=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(a),d=Math.sin(a);if(t.order==="XYZ"){let u=r*h,f=r*d,g=o*h,_=o*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=f+g*c,e[5]=u-_*c,e[9]=-o*l,e[2]=_-u*c,e[6]=g+f*c,e[10]=r*l}else if(t.order==="YXZ"){let u=l*h,f=l*d,g=c*h,_=c*d;e[0]=u+_*o,e[4]=g*o-f,e[8]=r*c,e[1]=r*d,e[5]=r*h,e[9]=-o,e[2]=f*o-g,e[6]=_+u*o,e[10]=r*l}else if(t.order==="ZXY"){let u=l*h,f=l*d,g=c*h,_=c*d;e[0]=u-_*o,e[4]=-r*d,e[8]=g+f*o,e[1]=f+g*o,e[5]=r*h,e[9]=_-u*o,e[2]=-r*c,e[6]=o,e[10]=r*l}else if(t.order==="ZYX"){let u=r*h,f=r*d,g=o*h,_=o*d;e[0]=l*h,e[4]=g*c-f,e[8]=u*c+_,e[1]=l*d,e[5]=_*c+u,e[9]=f*c-g,e[2]=-c,e[6]=o*l,e[10]=r*l}else if(t.order==="YZX"){let u=r*l,f=r*c,g=o*l,_=o*c;e[0]=l*h,e[4]=_-u*d,e[8]=g*d+f,e[1]=d,e[5]=r*h,e[9]=-o*h,e[2]=-c*h,e[6]=f*d+g,e[10]=u-_*d}else if(t.order==="XZY"){let u=r*l,f=r*c,g=o*l,_=o*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+_,e[5]=r*h,e[9]=f*d-g,e[2]=g*d-f,e[6]=o*h,e[10]=_*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(If,t,Lf)}lookAt(t,e,i){let s=this.elements;return Ei.subVectors(t,e),Ei.lengthSq()===0&&(Ei.z=1),Ei.normalize(),_n.crossVectors(i,Ei),_n.lengthSq()===0&&(Math.abs(i.z)===1?Ei.x+=1e-4:Ei.z+=1e-4,Ei.normalize(),_n.crossVectors(i,Ei)),_n.normalize(),Ha.crossVectors(Ei,_n),s[0]=_n.x,s[4]=Ha.x,s[8]=Ei.x,s[1]=_n.y,s[5]=Ha.y,s[9]=Ei.y,s[2]=_n.z,s[6]=Ha.z,s[10]=Ei.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,a=this.elements,r=i[0],o=i[4],l=i[8],c=i[12],h=i[1],d=i[5],u=i[9],f=i[13],g=i[2],_=i[6],p=i[10],m=i[14],M=i[3],A=i[7],b=i[11],w=i[15],S=s[0],R=s[4],x=s[8],E=s[12],P=s[1],N=s[5],B=s[9],V=s[13],L=s[2],U=s[6],$=s[10],K=s[14],ot=s[3],j=s[7],it=s[11],Z=s[15];return a[0]=r*S+o*P+l*L+c*ot,a[4]=r*R+o*N+l*U+c*j,a[8]=r*x+o*B+l*$+c*it,a[12]=r*E+o*V+l*K+c*Z,a[1]=h*S+d*P+u*L+f*ot,a[5]=h*R+d*N+u*U+f*j,a[9]=h*x+d*B+u*$+f*it,a[13]=h*E+d*V+u*K+f*Z,a[2]=g*S+_*P+p*L+m*ot,a[6]=g*R+_*N+p*U+m*j,a[10]=g*x+_*B+p*$+m*it,a[14]=g*E+_*V+p*K+m*Z,a[3]=M*S+A*P+b*L+w*ot,a[7]=M*R+A*N+b*U+w*j,a[11]=M*x+A*B+b*$+w*it,a[15]=M*E+A*V+b*K+w*Z,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],s=t[8],a=t[12],r=t[1],o=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],f=t[14],g=t[3],_=t[7],p=t[11],m=t[15],M=l*f-c*u,A=o*f-c*d,b=o*u-l*d,w=r*f-c*h,S=r*u-l*h,R=r*d-o*h;return e*(_*M-p*A+m*b)-i*(g*M-p*w+m*S)+s*(g*A-_*w+m*R)-a*(g*b-_*S+p*R)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],s=t[8],a=t[1],r=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return e*(r*h-o*c)-i*(a*h-o*l)+s*(a*c-r*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],f=t[11],g=t[12],_=t[13],p=t[14],m=t[15],M=e*o-i*r,A=e*l-s*r,b=e*c-a*r,w=i*l-s*o,S=i*c-a*o,R=s*c-a*l,x=h*_-d*g,E=h*p-u*g,P=h*m-f*g,N=d*p-u*_,B=d*m-f*_,V=u*m-f*p,L=M*V-A*B+b*N+w*P-S*E+R*x;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let U=1/L;return t[0]=(o*V-l*B+c*N)*U,t[1]=(s*B-i*V-a*N)*U,t[2]=(_*R-p*S+m*w)*U,t[3]=(u*S-d*R-f*w)*U,t[4]=(l*P-r*V-c*E)*U,t[5]=(e*V-s*P+a*E)*U,t[6]=(p*b-g*R-m*A)*U,t[7]=(h*R-u*b+f*A)*U,t[8]=(r*B-o*P+c*x)*U,t[9]=(i*P-e*B-a*x)*U,t[10]=(g*S-_*b+m*M)*U,t[11]=(d*b-h*S-f*M)*U,t[12]=(o*E-r*N-l*x)*U,t[13]=(e*N-i*E+s*x)*U,t[14]=(_*A-g*w-p*M)*U,t[15]=(h*w-d*A+u*M)*U,this}scale(t){let e=this.elements,i=t.x,s=t.y,a=t.z;return e[0]*=i,e[4]*=s,e[8]*=a,e[1]*=i,e[5]*=s,e[9]*=a,e[2]*=i,e[6]*=s,e[10]*=a,e[3]*=i,e[7]*=s,e[11]*=a,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),s=Math.sin(e),a=1-i,r=t.x,o=t.y,l=t.z,c=a*r,h=a*o;return this.set(c*r+i,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+i,h*l-s*r,0,c*l-s*o,h*l+s*r,a*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,a,r){return this.set(1,i,a,0,t,1,r,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){let s=this.elements,a=e._x,r=e._y,o=e._z,l=e._w,c=a+a,h=r+r,d=o+o,u=a*c,f=a*h,g=a*d,_=r*h,p=r*d,m=o*d,M=l*c,A=l*h,b=l*d,w=i.x,S=i.y,R=i.z;return s[0]=(1-(_+m))*w,s[1]=(f+b)*w,s[2]=(g-A)*w,s[3]=0,s[4]=(f-b)*S,s[5]=(1-(u+m))*S,s[6]=(p+M)*S,s[7]=0,s[8]=(g+A)*R,s[9]=(p-M)*R,s[10]=(1-(u+_))*R,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let a=this.determinantAffine();if(a===0)return i.set(1,1,1),e.identity(),this;let r=rs.set(s[0],s[1],s[2]).length(),o=rs.set(s[4],s[5],s[6]).length(),l=rs.set(s[8],s[9],s[10]).length();a<0&&(r=-r),Oi.copy(this);let c=1/r,h=1/o,d=1/l;return Oi.elements[0]*=c,Oi.elements[1]*=c,Oi.elements[2]*=c,Oi.elements[4]*=h,Oi.elements[5]*=h,Oi.elements[6]*=h,Oi.elements[8]*=d,Oi.elements[9]*=d,Oi.elements[10]*=d,e.setFromRotationMatrix(Oi),i.x=r,i.y=o,i.z=l,this}makePerspective(t,e,i,s,a,r,o=Vi,l=!1){let c=this.elements,h=2*a/(e-t),d=2*a/(i-s),u=(e+t)/(e-t),f=(i+s)/(i-s),g,_;if(l)g=a/(r-a),_=r*a/(r-a);else if(o===Vi)g=-(r+a)/(r-a),_=-2*r*a/(r-a);else if(o===ys)g=-r/(r-a),_=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,s,a,r,o=Vi,l=!1){let c=this.elements,h=2/(e-t),d=2/(i-s),u=-(e+t)/(e-t),f=-(i+s)/(i-s),g,_;if(l)g=1/(r-a),_=r/(r-a);else if(o===Vi)g=-2/(r-a),_=-(r+a)/(r-a);else if(o===ys)g=-1/(r-a),_=-a/(r-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};Or.prototype.isMatrix4=!0;var he=Or,rs=new I,Oi=new he,If=new I(0,0,0),Lf=new I(1,1,1),_n=new I,Ha=new I,Ei=new I,Dh=new he,Fh=new tn,un=class n{constructor(t=0,e=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let s=t.elements,a=s[0],r=s[4],o=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(ce(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ce(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,a),this._z=0);break;case"ZXY":this._x=Math.asin(ce(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-r,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-ce(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,c));break;case"YZX":this._z=Math.asin(ce(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,a)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-ce(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Gt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Dh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Dh,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Fh.setFromEuler(this),this.setFromQuaternion(Fh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};un.DEFAULT_ORDER="XYZ";var Ss=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Df=0,Nh=new I,os=new tn,an=new he,Ga=new I,Gs=new I,Ff=new I,Nf=new tn,kh=new I(1,0,0),Uh=new I(0,1,0),Oh=new I(0,0,1),Bh={type:"added"},kf={type:"removed"},ls={type:"childadded",child:null},Sl={type:"childremoved",child:null},ii=class n extends Qi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Df++}),this.uuid=Ma(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let t=new I,e=new un,i=new tn,s=new I(1,1,1);function a(){i.setFromEuler(e,!1)}function r(){e.setFromQuaternion(i,void 0,!1)}e._onChange(a),i._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new he},normalMatrix:{value:new Jt}}),this.matrix=new he,this.matrixWorld=new he,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ss,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return os.setFromAxisAngle(t,e),this.quaternion.multiply(os),this}rotateOnWorldAxis(t,e){return os.setFromAxisAngle(t,e),this.quaternion.premultiply(os),this}rotateX(t){return this.rotateOnAxis(kh,t)}rotateY(t){return this.rotateOnAxis(Uh,t)}rotateZ(t){return this.rotateOnAxis(Oh,t)}translateOnAxis(t,e){return Nh.copy(t).applyQuaternion(this.quaternion),this.position.add(Nh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(kh,t)}translateY(t){return this.translateOnAxis(Uh,t)}translateZ(t){return this.translateOnAxis(Oh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(an.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Ga.copy(t):Ga.set(t,e,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Gs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?an.lookAt(Gs,Ga,this.up):an.lookAt(Ga,Gs,this.up),this.quaternion.setFromRotationMatrix(an),s&&(an.extractRotation(s.matrixWorld),os.setFromRotationMatrix(an),this.quaternion.premultiply(os.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Ht("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Bh),ls.child=t,this.dispatchEvent(ls),ls.child=null):Ht("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(kf),Sl.child=t,this.dispatchEvent(Sl),Sl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),an.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),an.multiply(t.parent.matrixWorld)),t.applyMatrix4(an),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Bh),ls.child=t,this.dispatchEvent(ls),ls.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){let r=this.children[i].getObjectByProperty(t,e);if(r!==void 0)return r}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let s=this.children;for(let a=0,r=s.length;a<r;a++)s[a].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gs,t,Ff),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gs,Nf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,s=t.z,a=this.matrix.elements;a[12]+=e-a[0]*e-a[4]*i-a[8]*s,a[13]+=i-a[1]*e-a[5]*i-a[9]*s,a[14]+=s-a[2]*e-a[6]*i-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let a=this.children;for(let r=0,o=a.length;r<o;r++)a[r].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];a(t.shapes,d)}else a(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(t.materials,this.material[l]));s.material=o}else s.material=a(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(a(t.animations,l))}}if(e){let o=r(t.geometries),l=r(t.materials),c=r(t.textures),h=r(t.images),d=r(t.shapes),u=r(t.skeletons),f=r(t.animations),g=r(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=s,i;function r(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};ii.DEFAULT_UP=new I(0,1,0);ii.DEFAULT_MATRIX_AUTO_UPDATE=!0;ii.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var We=class extends ii{constructor(){super(),this.isGroup=!0,this.type="Group"}},Uf={type:"move"},ws=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new We,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new We,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new We,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let s=null,a=null,r=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){r=!0;for(let _ of t.hand.values()){let p=e.getJointPose(_,i),m=this._getHandJoint(c,_);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&u>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(a=e.getPose(t.gripSpace,i),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,i),s===null&&a!==null&&(s=a),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Uf)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new We;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},ku={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},xn={h:0,s:0,l:0},Wa={h:0,s:0,l:0};function wl(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}var Xt=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=xe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,le.colorSpaceToWorking(this,e),this}setRGB(t,e,i,s=le.workingColorSpace){return this.r=t,this.g=e,this.b=i,le.colorSpaceToWorking(this,s),this}setHSL(t,e,i,s=le.workingColorSpace){if(t=Af(t,1),e=ce(e,0,1),i=ce(i,0,1),e===0)this.r=this.g=this.b=i;else{let a=i<=.5?i*(1+e):i+e-i*e,r=2*i-a;this.r=wl(r,a,t+1/3),this.g=wl(r,a,t),this.b=wl(r,a,t-1/3)}return le.colorSpaceToWorking(this,s),this}setStyle(t,e=xe){function i(a){a!==void 0&&parseFloat(a)<1&&Gt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let a,r=s[1],o=s[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,e);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,e);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,e);break;default:Gt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let a=s[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,e);if(r===6)return this.setHex(parseInt(a,16),e);Gt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=xe){let i=ku[t.toLowerCase()];return i!==void 0?this.setHex(i,e):Gt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=hn(t.r),this.g=hn(t.g),this.b=hn(t.b),this}copyLinearToSRGB(t){return this.r=_s(t.r),this.g=_s(t.g),this.b=_s(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=xe){return le.workingToColorSpace(di.copy(this),t),Math.round(ce(di.r*255,0,255))*65536+Math.round(ce(di.g*255,0,255))*256+Math.round(ce(di.b*255,0,255))}getHexString(t=xe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=le.workingColorSpace){le.workingToColorSpace(di.copy(this),e);let i=di.r,s=di.g,a=di.b,r=Math.max(i,s,a),o=Math.min(i,s,a),l,c,h=(o+r)/2;if(o===r)l=0,c=0;else{let d=r-o;switch(c=h<=.5?d/(r+o):d/(2-r-o),r){case i:l=(s-a)/d+(s<a?6:0);break;case s:l=(a-i)/d+2;break;case a:l=(i-s)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=le.workingColorSpace){return le.workingToColorSpace(di.copy(this),e),t.r=di.r,t.g=di.g,t.b=di.b,t}getStyle(t=xe){le.workingToColorSpace(di.copy(this),t);let e=di.r,i=di.g,s=di.b;return t!==xe?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL(xn),this.setHSL(xn.h+t,xn.s+e,xn.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(xn),t.getHSL(Wa);let i=_l(xn.h,Wa.h,e),s=_l(xn.s,Wa.s,e),a=_l(xn.l,Wa.l,e);return this.setHSL(i,s,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,s=this.b,a=t.elements;return this.r=a[0]*e+a[3]*i+a[6]*s,this.g=a[1]*e+a[4]*i+a[7]*s,this.b=a[2]*e+a[5]*i+a[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},di=new Xt;Xt.NAMES=ku;var Qs=class n{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Xt(t),this.density=e}clone(){return new n(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Gn=class extends ii{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new un,this.environmentIntensity=1,this.environmentRotation=new un,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Bi=new I,rn=new I,El=new I,on=new I,cs=new I,hs=new I,zh=new I,Tl=new I,Al=new I,Rl=new I,Cl=new we,Pl=new we,Il=new we,Sn=class n{constructor(t=new I,e=new I,i=new I){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),Bi.subVectors(t,e),s.cross(Bi);let a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(t,e,i,s,a){Bi.subVectors(s,e),rn.subVectors(i,e),El.subVectors(t,e);let r=Bi.dot(Bi),o=Bi.dot(rn),l=Bi.dot(El),c=rn.dot(rn),h=rn.dot(El),d=r*c-o*o;if(d===0)return a.set(0,0,0),null;let u=1/d,f=(c*l-o*h)*u,g=(r*h-o*l)*u;return a.set(1-f-g,g,f)}static containsPoint(t,e,i,s){return this.getBarycoord(t,e,i,s,on)===null?!1:on.x>=0&&on.y>=0&&on.x+on.y<=1}static getInterpolation(t,e,i,s,a,r,o,l){return this.getBarycoord(t,e,i,s,on)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,on.x),l.addScaledVector(r,on.y),l.addScaledVector(o,on.z),l)}static getInterpolatedAttribute(t,e,i,s,a,r){return Cl.setScalar(0),Pl.setScalar(0),Il.setScalar(0),Cl.fromBufferAttribute(t,e),Pl.fromBufferAttribute(t,i),Il.fromBufferAttribute(t,s),r.setScalar(0),r.addScaledVector(Cl,a.x),r.addScaledVector(Pl,a.y),r.addScaledVector(Il,a.z),r}static isFrontFacing(t,e,i,s){return Bi.subVectors(i,e),rn.subVectors(t,e),Bi.cross(rn).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Bi.subVectors(this.c,this.b),rn.subVectors(this.a,this.b),Bi.cross(rn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return n.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return n.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,a){return n.getInterpolation(t,this.a,this.b,this.c,e,i,s,a)}containsPoint(t){return n.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return n.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,s=this.b,a=this.c,r,o;cs.subVectors(s,i),hs.subVectors(a,i),Tl.subVectors(t,i);let l=cs.dot(Tl),c=hs.dot(Tl);if(l<=0&&c<=0)return e.copy(i);Al.subVectors(t,s);let h=cs.dot(Al),d=hs.dot(Al);if(h>=0&&d<=h)return e.copy(s);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return r=l/(l-h),e.copy(i).addScaledVector(cs,r);Rl.subVectors(t,a);let f=cs.dot(Rl),g=hs.dot(Rl);if(g>=0&&f<=g)return e.copy(a);let _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(i).addScaledVector(hs,o);let p=h*g-f*d;if(p<=0&&d-h>=0&&f-g>=0)return zh.subVectors(a,s),o=(d-h)/(d-h+(f-g)),e.copy(s).addScaledVector(zh,o);let m=1/(p+_+u);return r=_*m,o=u*m,e.copy(i).addScaledVector(cs,r).addScaledVector(hs,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},wn=class{constructor(t=new I(1/0,1/0,1/0),e=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(zi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(zi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=zi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let a=i.getAttribute("position");if(e===!0&&a!==void 0&&t.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)t.isMesh===!0?t.getVertexPosition(r,zi):zi.fromBufferAttribute(a,r),zi.applyMatrix4(t.matrixWorld),this.expandByPoint(zi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),qa.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),qa.copy(i.boundingBox)),qa.applyMatrix4(t.matrixWorld),this.union(qa)}let s=t.children;for(let a=0,r=s.length;a<r;a++)this.expandByObject(s[a],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,zi),zi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ws),Xa.subVectors(this.max,Ws),us.subVectors(t.a,Ws),ds.subVectors(t.b,Ws),fs.subVectors(t.c,Ws),yn.subVectors(ds,us),bn.subVectors(fs,ds),On.subVectors(us,fs);let e=[0,-yn.z,yn.y,0,-bn.z,bn.y,0,-On.z,On.y,yn.z,0,-yn.x,bn.z,0,-bn.x,On.z,0,-On.x,-yn.y,yn.x,0,-bn.y,bn.x,0,-On.y,On.x,0];return!Ll(e,us,ds,fs,Xa)||(e=[1,0,0,0,1,0,0,0,1],!Ll(e,us,ds,fs,Xa))?!1:(Ya.crossVectors(yn,bn),e=[Ya.x,Ya.y,Ya.z],Ll(e,us,ds,fs,Xa))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,zi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(zi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(ln[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),ln[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),ln[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),ln[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),ln[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),ln[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),ln[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),ln[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(ln),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},ln=[new I,new I,new I,new I,new I,new I,new I,new I],zi=new I,qa=new wn,us=new I,ds=new I,fs=new I,yn=new I,bn=new I,On=new I,Ws=new I,Xa=new I,Ya=new I,Bn=new I;function Ll(n,t,e,i,s){for(let a=0,r=n.length-3;a<=r;a+=3){Bn.fromArray(n,a);let o=s.x*Math.abs(Bn.x)+s.y*Math.abs(Bn.y)+s.z*Math.abs(Bn.z),l=t.dot(Bn),c=e.dot(Bn),h=i.dot(Bn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Ye=new I,Za=new jt,Of=0,Oe=class extends Qi{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Of++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Iu,this.updateRanges=[],this.gpuType=Gi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Za.fromBufferAttribute(this,e),Za.applyMatrix3(t),this.setXY(e,Za.x,Za.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Ye.fromBufferAttribute(this,e),Ye.applyMatrix3(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Ye.fromBufferAttribute(this,e),Ye.applyMatrix4(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Ye.fromBufferAttribute(this,e),Ye.applyNormalMatrix(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Ye.fromBufferAttribute(this,e),Ye.transformDirection(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Hs(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=xi(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Hs(e,this.array)),e}setX(t,e){return this.normalized&&(e=xi(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Hs(e,this.array)),e}setY(t,e){return this.normalized&&(e=xi(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Hs(e,this.array)),e}setZ(t,e){return this.normalized&&(e=xi(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Hs(e,this.array)),e}setW(t,e){return this.normalized&&(e=xi(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=xi(e,this.array),i=xi(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){return t*=this.itemSize,this.normalized&&(e=xi(e,this.array),i=xi(i,this.array),s=xi(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,a){return t*=this.itemSize,this.normalized&&(e=xi(e,this.array),i=xi(i,this.array),s=xi(s,this.array),a=xi(a,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var ta=class extends Oe{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var ea=class extends Oe{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var be=class extends Oe{constructor(t,e,i){super(new Float32Array(t),e,i)}},Bf=new wn,qs=new I,Dl=new I,Es=class{constructor(t=new I,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):Bf.setFromPoints(t).getCenter(i);let s=0;for(let a=0,r=t.length;a<r;a++)s=Math.max(s,i.distanceToSquared(t[a]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;qs.subVectors(t,this.center);let e=qs.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),s=(i-this.radius)*.5;this.center.addScaledVector(qs,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Dl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(qs.copy(t.center).add(Dl)),this.expandByPoint(qs.copy(t.center).sub(Dl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},zf=0,Li=new he,Fl=new ii,ps=new I,Ti=new wn,Xs=new wn,ti=new I,Be=class n extends Qi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:zf++}),this.uuid=Ma(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Ef(t)?ea:ta)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let a=new Jt().getNormalMatrix(t);i.applyNormalMatrix(a),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Li.makeRotationFromQuaternion(t),this.applyMatrix4(Li),this}rotateX(t){return Li.makeRotationX(t),this.applyMatrix4(Li),this}rotateY(t){return Li.makeRotationY(t),this.applyMatrix4(Li),this}rotateZ(t){return Li.makeRotationZ(t),this.applyMatrix4(Li),this}translate(t,e,i){return Li.makeTranslation(t,e,i),this.applyMatrix4(Li),this}scale(t,e,i){return Li.makeScale(t,e,i),this.applyMatrix4(Li),this}lookAt(t){return Fl.lookAt(t),Fl.updateMatrix(),this.applyMatrix4(Fl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ps).negate(),this.translate(ps.x,ps.y,ps.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let s=0,a=t.length;s<a;s++){let r=t[s];i.push(r.x,r.y,r.z||0)}this.setAttribute("position",new be(i,3))}else{let i=Math.min(t.length,e.count);for(let s=0;s<i;s++){let a=t[s];e.setXYZ(s,a.x,a.y,a.z||0)}t.length>e.count&&Gt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new wn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ht("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){let a=e[i];Ti.setFromBufferAttribute(a),this.morphTargetsRelative?(ti.addVectors(this.boundingBox.min,Ti.min),this.boundingBox.expandByPoint(ti),ti.addVectors(this.boundingBox.max,Ti.max),this.boundingBox.expandByPoint(ti)):(this.boundingBox.expandByPoint(Ti.min),this.boundingBox.expandByPoint(Ti.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ht('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Es);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ht("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(t){let i=this.boundingSphere.center;if(Ti.setFromBufferAttribute(t),e)for(let a=0,r=e.length;a<r;a++){let o=e[a];Xs.setFromBufferAttribute(o),this.morphTargetsRelative?(ti.addVectors(Ti.min,Xs.min),Ti.expandByPoint(ti),ti.addVectors(Ti.max,Xs.max),Ti.expandByPoint(ti)):(Ti.expandByPoint(Xs.min),Ti.expandByPoint(Xs.max))}Ti.getCenter(i);let s=0;for(let a=0,r=t.count;a<r;a++)ti.fromBufferAttribute(t,a),s=Math.max(s,i.distanceToSquared(ti));if(e)for(let a=0,r=e.length;a<r;a++){let o=e[a],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)ti.fromBufferAttribute(o,c),l&&(ps.fromBufferAttribute(t,c),ti.add(ps)),s=Math.max(s,i.distanceToSquared(ti))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ht('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Ht("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,s=e.normal,a=e.uv,r=this.getAttribute("tangent");(r===void 0||r.count!==i.count)&&(r=new Oe(new Float32Array(4*i.count),4),this.setAttribute("tangent",r));let o=[],l=[];for(let x=0;x<i.count;x++)o[x]=new I,l[x]=new I;let c=new I,h=new I,d=new I,u=new jt,f=new jt,g=new jt,_=new I,p=new I;function m(x,E,P){c.fromBufferAttribute(i,x),h.fromBufferAttribute(i,E),d.fromBufferAttribute(i,P),u.fromBufferAttribute(a,x),f.fromBufferAttribute(a,E),g.fromBufferAttribute(a,P),h.sub(c),d.sub(c),f.sub(u),g.sub(u);let N=1/(f.x*g.y-g.x*f.y);isFinite(N)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(N),p.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(N),o[x].add(_),o[E].add(_),o[P].add(_),l[x].add(p),l[E].add(p),l[P].add(p))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let x=0,E=M.length;x<E;++x){let P=M[x],N=P.start,B=P.count;for(let V=N,L=N+B;V<L;V+=3)m(t.getX(V+0),t.getX(V+1),t.getX(V+2))}let A=new I,b=new I,w=new I,S=new I;function R(x){w.fromBufferAttribute(s,x),S.copy(w);let E=o[x];A.copy(E),A.sub(w.multiplyScalar(w.dot(E))).normalize(),b.crossVectors(S,E);let N=b.dot(l[x])<0?-1:1;r.setXYZW(x,A.x,A.y,A.z,N)}for(let x=0,E=M.length;x<E;++x){let P=M[x],N=P.start,B=P.count;for(let V=N,L=N+B;V<L;V+=3)R(t.getX(V+0)),R(t.getX(V+1)),R(t.getX(V+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new Oe(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let u=0,f=i.count;u<f;u++)i.setXYZ(u,0,0,0);let s=new I,a=new I,r=new I,o=new I,l=new I,c=new I,h=new I,d=new I;if(t)for(let u=0,f=t.count;u<f;u+=3){let g=t.getX(u+0),_=t.getX(u+1),p=t.getX(u+2);s.fromBufferAttribute(e,g),a.fromBufferAttribute(e,_),r.fromBufferAttribute(e,p),h.subVectors(r,a),d.subVectors(s,a),h.cross(d),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,p),o.add(h),l.add(h),c.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(p,c.x,c.y,c.z)}else for(let u=0,f=e.count;u<f;u+=3)s.fromBufferAttribute(e,u+0),a.fromBufferAttribute(e,u+1),r.fromBufferAttribute(e,u+2),h.subVectors(r,a),d.subVectors(s,a),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)ti.fromBufferAttribute(t,e),ti.normalize(),t.setXYZ(e,ti.x,ti.y,ti.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),f=0,g=0;for(let _=0,p=l.length;_<p;_++){o.isInterleavedBufferAttribute?f=l[_]*o.data.stride+o.offset:f=l[_]*h;for(let m=0;m<h;m++)u[g++]=c[f++]}return new Oe(u,h,d)}if(this.index===null)return Gt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new n,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,i);e.setAttribute(o,c)}let a=this.morphAttributes;for(let o in a){let l=[],c=a[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],f=t(u,i);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,l=r.length;o<l;o++){let c=r[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},a=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d];h.push(f.toJSON(t.data))}h.length>0&&(s[l]=h,a=!0)}a&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let r=this.groups;r.length>0&&(t.data.groups=JSON.parse(JSON.stringify(r)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let a=t.morphAttributes;for(let c in a){let h=[],d=a[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let r=t.groups;for(let c=0,h=r.length;c<h;c++){let d=r[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Nl=new I,Vf=new I,Hf=new Jt,Ai=class{constructor(t=new I(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let s=Nl.subVectors(i,e).cross(Vf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let s=t.delta(Nl),a=this.normal.dot(s);if(a===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/a;return i===!0&&(r<0||r>1)?null:e.copy(t.start).addScaledVector(s,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||Hf.getNormalMatrix(t),s=this.coplanarPoint(Nl).applyMatrix4(t),a=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Gf=0,En=class extends Qi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Gf++}),this.uuid=Ma(),this.name="",this.type="Material",this.blending=Cs,this.side=In,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Kl,this.blendDst=Ql,this.blendEquation=Yn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Xt(0,0,0),this.blendAlpha=0,this.depthFunc=xs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=wu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=lr,this.stencilZFail=lr,this.stencilZPass=lr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){Gt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Gt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(a=>a.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(a){let r=[];for(let o in a){let l=a[o];delete l.metadata,r.push(l)}return r}if(e){let a=s(t.textures),r=s(t.images);a.length>0&&(i.textures=a),r.length>0&&(i.images=r)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Xt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new Ai().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new jt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new jt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let s=e.length;i=new Array(s);for(let a=0;a!==s;++a)i[a]=e[a].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var cn=new I,kl=new I,Ja=new I,$a=new I,ia=class{constructor(t=new I,e=new I(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,cn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=cn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(cn.copy(this.origin).addScaledVector(this.direction,e),cn.distanceToSquared(t))}distanceSqToSegment(t,e,i,s){kl.copy(t).add(e).multiplyScalar(.5),Ja.copy(e).sub(t).normalize(),$a.copy(this.origin).sub(kl);let a=t.distanceTo(e)*.5,r=-this.direction.dot(Ja),o=$a.dot(this.direction),l=-$a.dot(Ja),c=$a.lengthSq(),h=Math.abs(1-r*r),d,u,f,g;if(h>0)if(d=r*l-o,u=r*o-l,g=a*h,d>=0)if(u>=-g)if(u<=g){let _=1/h;d*=_,u*=_,f=d*(d+r*u+2*o)+u*(r*d+u+2*l)+c}else u=a,d=Math.max(0,-(r*u+o)),f=-d*d+u*(u+2*l)+c;else u=-a,d=Math.max(0,-(r*u+o)),f=-d*d+u*(u+2*l)+c;else u<=-g?(d=Math.max(0,-(-r*a+o)),u=d>0?-a:Math.min(Math.max(-a,-l),a),f=-d*d+u*(u+2*l)+c):u<=g?(d=0,u=Math.min(Math.max(-a,-l),a),f=u*(u+2*l)+c):(d=Math.max(0,-(r*a+o)),u=d>0?a:Math.min(Math.max(-a,-l),a),f=-d*d+u*(u+2*l)+c);else u=r>0?-a:a,d=Math.max(0,-(r*u+o)),f=-d*d+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(kl).addScaledVector(Ja,u),f}intersectSphere(t,e){if(t.radius<0)return null;cn.subVectors(t.center,this.origin);let i=cn.dot(this.direction),s=cn.dot(cn)-i*i,a=t.radius*t.radius;if(s>a)return null;let r=Math.sqrt(a-s),o=i-r,l=i+r;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,s,a,r,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(a=(t.min.y-u.y)*h,r=(t.max.y-u.y)*h):(a=(t.max.y-u.y)*h,r=(t.min.y-u.y)*h),i>r||a>s||((a>i||isNaN(i))&&(i=a),(r<s||isNaN(s))&&(s=r),d>=0?(o=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(o=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,cn)!==null}intersectTriangle(t,e,i,s,a){let r=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,d=t.x-r.x,u=t.y-r.y,f=t.z-r.z,g=e.x-r.x,_=e.y-r.y,p=e.z-r.z,m=i.x-r.x,M=i.y-r.y,A=i.z-r.z,b=Math.abs(l),w=Math.abs(c),S=Math.abs(h),R,x,E,P,N,B,V,L,U,$,K,ot;if(b>=w&&b>=S?(E=l,B=d,U=g,ot=m,l>=0?(R=c,x=h,P=u,N=f,V=_,L=p,$=M,K=A):(R=h,x=c,P=f,N=u,V=p,L=_,$=A,K=M)):w>=S?(E=c,B=u,U=_,ot=M,c>=0?(R=h,x=l,P=f,N=d,V=p,L=g,$=A,K=m):(R=l,x=h,P=d,N=f,V=g,L=p,$=m,K=A)):(E=h,B=f,U=p,ot=A,h>=0?(R=l,x=c,P=d,N=u,V=g,L=_,$=m,K=M):(R=c,x=l,P=u,N=d,V=_,L=g,$=M,K=m)),E===0)return null;let j=R/E,it=x/E,Z=1/E,ct=P-j*B,At=N-it*B,zt=V-j*U,Vt=L-it*U,qt=$-j*ot,Q=K-it*ot,rt=qt*Vt-Q*zt,Rt=ct*Q-At*qt,$t=zt*At-Vt*ct;if(s){if(rt<0||Rt<0||$t<0)return null}else if((rt<0||Rt<0||$t<0)&&(rt>0||Rt>0||$t>0))return null;let Et=rt+Rt+$t;if(Et===0)return null;let se=Z*(rt*B+Rt*U+$t*ot);return(Et>0?se<0:se>0)?null:this.at(se/Et,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Yt=class extends En{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Xt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new un,this.combine=tc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Vh=new he,zn=new ia,ja=new Es,Hh=new I,Ka=new I,Qa=new I,tr=new I,Ul=new I,er=new I,Gh=new I,ir=new I,Lt=class extends ii{constructor(t=new Be,e=new Yt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(t,e){let i=this.geometry,s=i.attributes.position,a=i.morphAttributes.position,r=i.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(a&&o){er.set(0,0,0);for(let l=0,c=a.length;l<c;l++){let h=o[l],d=a[l];h!==0&&(Ul.fromBufferAttribute(d,t),r?er.addScaledVector(Ul,h):er.addScaledVector(Ul.sub(e),h))}e.add(er)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),ja.copy(i.boundingSphere),ja.applyMatrix4(a),zn.copy(t.ray).recast(t.near),!(ja.containsPoint(zn.origin)===!1&&(zn.intersectSphere(ja,Hh)===null||zn.origin.distanceToSquared(Hh)>(t.far-t.near)**2))&&(Vh.copy(a).invert(),zn.copy(t.ray).applyMatrix4(Vh),!(i.boundingBox!==null&&zn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,zn)))}_computeIntersections(t,e,i){let s,a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,h=a.attributes.uv1,d=a.attributes.normal,u=a.groups,f=a.drawRange;if(o!==null)if(Array.isArray(r))for(let g=0,_=u.length;g<_;g++){let p=u[g],m=r[p.materialIndex],M=Math.max(p.start,f.start),A=Math.min(o.count,Math.min(p.start+p.count,f.start+f.count));for(let b=M,w=A;b<w;b+=3){let S=o.getX(b),R=o.getX(b+1),x=o.getX(b+2);s=nr(this,m,t,i,c,h,d,S,R,x),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),_=Math.min(o.count,f.start+f.count);for(let p=g,m=_;p<m;p+=3){let M=o.getX(p),A=o.getX(p+1),b=o.getX(p+2);s=nr(this,r,t,i,c,h,d,M,A,b),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(r))for(let g=0,_=u.length;g<_;g++){let p=u[g],m=r[p.materialIndex],M=Math.max(p.start,f.start),A=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let b=M,w=A;b<w;b+=3){let S=b,R=b+1,x=b+2;s=nr(this,m,t,i,c,h,d,S,R,x),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let p=g,m=_;p<m;p+=3){let M=p,A=p+1,b=p+2;s=nr(this,r,t,i,c,h,d,M,A,b),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}};function Wf(n,t,e,i,s,a,r,o){let l;if(t.side===oi?l=i.intersectTriangle(r,a,s,!0,o):l=i.intersectTriangle(s,a,r,t.side===In,o),l===null)return null;ir.copy(o),ir.applyMatrix4(n.matrixWorld);let c=e.ray.origin.distanceTo(ir);return c<e.near||c>e.far?null:{distance:c,point:ir.clone(),object:n}}function nr(n,t,e,i,s,a,r,o,l,c){n.getVertexPosition(o,Ka),n.getVertexPosition(l,Qa),n.getVertexPosition(c,tr);let h=Wf(n,t,e,i,Ka,Qa,tr,Gh);if(h){let d=new I;Sn.getBarycoord(Gh,Ka,Qa,tr,d),s&&(h.uv=Sn.getInterpolatedAttribute(s,o,l,c,d,new jt)),a&&(h.uv1=Sn.getInterpolatedAttribute(a,o,l,c,d,new jt)),r&&(h.normal=Sn.getInterpolatedAttribute(r,o,l,c,d,new I),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new I,materialIndex:0};Sn.getNormal(Ka,Qa,tr,u.normal),h.face=u,h.barycoord=d}return h}var br=class extends mi{constructor(t=null,e=1,i=1,s,a,r,o,l,c=ei,h=ei,d,u){super(null,r,o,l,c,h,s,a,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Vn=new Es,qf=new jt(.5,.5),sr=new I,Ts=class{constructor(t=new Ai,e=new Ai,i=new Ai,s=new Ai,a=new Ai,r=new Ai){this.planes=[t,e,i,s,a,r]}set(t,e,i,s,a,r){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(s),o[4].copy(a),o[5].copy(r),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Vi,i=!1){let s=this.planes,a=t.elements,r=a[0],o=a[1],l=a[2],c=a[3],h=a[4],d=a[5],u=a[6],f=a[7],g=a[8],_=a[9],p=a[10],m=a[11],M=a[12],A=a[13],b=a[14],w=a[15];if(s[0].setComponents(c-r,f-h,m-g,w-M).normalize(),s[1].setComponents(c+r,f+h,m+g,w+M).normalize(),s[2].setComponents(c+o,f+d,m+_,w+A).normalize(),s[3].setComponents(c-o,f-d,m-_,w-A).normalize(),i)s[4].setComponents(l,u,p,b).normalize(),s[5].setComponents(c-l,f-u,m-p,w-b).normalize();else if(s[4].setComponents(c-l,f-u,m-p,w-b).normalize(),e===Vi)s[5].setComponents(c+l,f+u,m+p,w+b).normalize();else if(e===ys)s[5].setComponents(l,u,p,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Vn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Vn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Vn)}intersectsSprite(t){Vn.center.set(0,0,0);let e=qf.distanceTo(t.center);return Vn.radius=.7071067811865476+e,Vn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Vn)}intersectsSphere(t){let e=this.planes,i=t.center,s=-t.radius;for(let a=0;a<6;a++)if(e[a].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let s=e[i];if(sr.x=s.normal.x>0?t.max.x:t.min.x,sr.y=s.normal.y>0?t.max.y:t.min.y,sr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(sr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var na=class extends mi{constructor(t=[],e=Ln,i,s,a,r,o,l,c,h){super(t,e,i,s,a,r,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Je=class extends mi{constructor(t,e,i,s,a,r,o,l,c){super(t,e,i,s,a,r,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Tn=class extends mi{constructor(t,e,i=Hi,s,a,r,o=ei,l=ei,c,h=Ki,d=1){if(h!==Ki&&h!==Fn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:d};super(u,s,a,r,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Ms(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Mr=class extends Tn{constructor(t,e=Hi,i=Ln,s,a,r=ei,o=ei,l,c=Ki){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,i,s,a,r,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},sa=class extends mi{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Fi=class n extends Be{constructor(t=1,e=1,i=1,s=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:a,depthSegments:r};let o=this;s=Math.floor(s),a=Math.floor(a),r=Math.floor(r);let l=[],c=[],h=[],d=[],u=0,f=0;g("z","y","x",-1,-1,i,e,t,r,a,0),g("z","y","x",1,-1,i,e,-t,r,a,1),g("x","z","y",1,1,t,i,e,s,r,2),g("x","z","y",1,-1,t,i,-e,s,r,3),g("x","y","z",1,-1,t,e,i,s,a,4),g("x","y","z",-1,-1,t,e,-i,s,a,5),this.setIndex(l),this.setAttribute("position",new be(c,3)),this.setAttribute("normal",new be(h,3)),this.setAttribute("uv",new be(d,2));function g(_,p,m,M,A,b,w,S,R,x,E){let P=b/R,N=w/x,B=b/2,V=w/2,L=S/2,U=R+1,$=x+1,K=0,ot=0,j=new I;for(let it=0;it<$;it++){let Z=it*N-V;for(let ct=0;ct<U;ct++){let At=ct*P-B;j[_]=At*M,j[p]=Z*A,j[m]=L,c.push(j.x,j.y,j.z),j[_]=0,j[p]=0,j[m]=S>0?1:-1,h.push(j.x,j.y,j.z),d.push(ct/R),d.push(1-it/x),K+=1}}for(let it=0;it<x;it++)for(let Z=0;Z<R;Z++){let ct=u+Z+U*it,At=u+Z+U*(it+1),zt=u+(Z+1)+U*(it+1),Vt=u+(Z+1)+U*it;l.push(ct,At,Vt),l.push(At,zt,Vt),ot+=6}o.addGroup(f,ot,E),f+=ot,u+=K}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var aa=class n extends Be{constructor(t=1,e=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:s},e=Math.max(3,e);let a=[],r=[],o=[],l=[],c=new I,h=new jt;r.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let d=0,u=3;d<=e;d++,u+=3){let f=i+d/e*s;c.x=t*Math.cos(f),c.y=t*Math.sin(f),r.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(r[u]/t+1)/2,h.y=(r[u+1]/t+1)/2,l.push(h.x,h.y)}for(let d=1;d<=e;d++)a.push(d,d+1,0);this.setIndex(a),this.setAttribute("position",new be(r,3)),this.setAttribute("normal",new be(o,3)),this.setAttribute("uv",new be(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.segments,t.thetaStart,t.thetaLength)}},gi=class n extends Be{constructor(t=1,e=1,i=1,s=32,a=1,r=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:s,heightSegments:a,openEnded:r,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),a=Math.floor(a);let h=[],d=[],u=[],f=[],g=0,_=[],p=i/2,m=0;M(),r===!1&&(t>0&&A(!0),e>0&&A(!1)),this.setIndex(h),this.setAttribute("position",new be(d,3)),this.setAttribute("normal",new be(u,3)),this.setAttribute("uv",new be(f,2));function M(){let b=new I,w=new I,S=0,R=(e-t)/i;for(let x=0;x<=a;x++){let E=[],P=x/a,N=P*(e-t)+t;for(let B=0;B<=s;B++){let V=B/s,L=V*l+o,U=Math.sin(L),$=Math.cos(L);w.x=N*U,w.y=-P*i+p,w.z=N*$,d.push(w.x,w.y,w.z),b.set(U,R,$).normalize(),u.push(b.x,b.y,b.z),f.push(V,1-P),E.push(g++)}_.push(E)}for(let x=0;x<s;x++)for(let E=0;E<a;E++){let P=_[E][x],N=_[E+1][x],B=_[E+1][x+1],V=_[E][x+1];(t>0||E!==0)&&(h.push(P,N,V),S+=3),(e>0||E!==a-1)&&(h.push(N,B,V),S+=3)}c.addGroup(m,S,0),m+=S}function A(b){let w=g,S=new jt,R=new I,x=0,E=b===!0?t:e,P=b===!0?1:-1;for(let B=1;B<=s;B++)d.push(0,p*P,0),u.push(0,P,0),f.push(.5,.5),g++;let N=g;for(let B=0;B<=s;B++){let L=B/s*l+o,U=Math.cos(L),$=Math.sin(L);R.x=E*$,R.y=p*P,R.z=E*U,d.push(R.x,R.y,R.z),u.push(0,P,0),S.x=U*.5+.5,S.y=$*.5*P+.5,f.push(S.x,S.y),g++}for(let B=0;B<s;B++){let V=w+B,L=N+B;b===!0?h.push(L,L+1,V):h.push(L+1,L,V),x+=3}c.addGroup(m,x,b===!0?1:2),m+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Wn=class n extends gi{constructor(t=1,e=1,i=32,s=1,a=!1,r=0,o=Math.PI*2){super(0,t,e,i,s,a,r,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:r,thetaLength:o}}static fromJSON(t){return new n(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var Me=class n extends Be{constructor(t=1,e=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};let a=t/2,r=e/2,o=Math.floor(i),l=Math.floor(s),c=o+1,h=l+1,d=t/o,u=e/l,f=[],g=[],_=[],p=[];for(let m=0;m<h;m++){let M=m*u-r;for(let A=0;A<c;A++){let b=A*d-a;g.push(b,-M,0),_.push(0,0,1),p.push(A/o),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let M=0;M<o;M++){let A=M+c*m,b=M+c*(m+1),w=M+1+c*(m+1),S=M+1+c*m;f.push(A,b,S),f.push(b,w,S)}this.setIndex(f),this.setAttribute("position",new be(g,3)),this.setAttribute("normal",new be(_,3)),this.setAttribute("uv",new be(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.widthSegments,t.heightSegments)}},ra=class n extends Be{constructor(t=.5,e=1,i=32,s=1,a=0,r=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:s,thetaStart:a,thetaLength:r},i=Math.max(3,i),s=Math.max(1,s);let o=[],l=[],c=[],h=[],d=t,u=(e-t)/s,f=new I,g=new jt;for(let _=0;_<=s;_++){for(let p=0;p<=i;p++){let m=a+p/i*r;f.x=d*Math.cos(m),f.y=d*Math.sin(m),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/e+1)/2,g.y=(f.y/e+1)/2,h.push(g.x,g.y)}d+=u}for(let _=0;_<s;_++){let p=_*(i+1);for(let m=0;m<i;m++){let M=m+p,A=M,b=M+i+1,w=M+i+2,S=M+1;o.push(A,b,S),o.push(b,w,S)}}this.setIndex(o),this.setAttribute("position",new be(l,3)),this.setAttribute("normal",new be(c,3)),this.setAttribute("uv",new be(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var dn=class n extends Be{constructor(t=1,e=32,i=16,s=0,a=Math.PI*2,r=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:s,phiLength:a,thetaStart:r,thetaLength:o},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(r+o,Math.PI),c=0,h=[],d=new I,u=new I,f=[],g=[],_=[],p=[];for(let m=0;m<=i;m++){let M=[],A=m/i,b=r+A*o,w=t*Math.cos(b),S=Math.sqrt(t*t-w*w),R=0;m===0&&r===0?R=.5/e:m===i&&l===Math.PI&&(R=-.5/e);for(let x=0;x<=e;x++){let E=x/e,P=s+E*a;d.x=-S*Math.cos(P),d.y=w,d.z=S*Math.sin(P),g.push(d.x,d.y,d.z),u.copy(d).normalize(),_.push(u.x,u.y,u.z),p.push(E+R,1-A),M.push(c++)}h.push(M)}for(let m=0;m<i;m++)for(let M=0;M<e;M++){let A=h[m][M+1],b=h[m][M],w=h[m+1][M],S=h[m+1][M+1];(m!==0||r>0)&&f.push(A,b,S),(m!==i-1||l<Math.PI)&&f.push(b,w,S)}this.setIndex(f),this.setAttribute("position",new be(g,3)),this.setAttribute("normal",new be(_,3)),this.setAttribute("uv",new be(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var yi=class n extends Be{constructor(t=1,e=.4,i=12,s=48,a=Math.PI*2,r=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:s,arc:a,thetaStart:r,thetaLength:o},i=Math.floor(i),s=Math.floor(s);let l=[],c=[],h=[],d=[],u=new I,f=new I,g=new I;for(let _=0;_<=i;_++){let p=r+_/i*o;for(let m=0;m<=s;m++){let M=m/s*a;f.x=(t+e*Math.cos(p))*Math.cos(M),f.y=(t+e*Math.cos(p))*Math.sin(M),f.z=e*Math.sin(p),c.push(f.x,f.y,f.z),u.x=t*Math.cos(M),u.y=t*Math.sin(M),g.subVectors(f,u).normalize(),h.push(g.x,g.y,g.z),d.push(m/s),d.push(_/i)}}for(let _=1;_<=i;_++)for(let p=1;p<=s;p++){let m=(s+1)*_+p-1,M=(s+1)*(_-1)+p-1,A=(s+1)*(_-1)+p,b=(s+1)*_+p;l.push(m,M,b),l.push(M,A,b)}this.setIndex(l),this.setAttribute("position",new be(c,3)),this.setAttribute("normal",new be(h,3)),this.setAttribute("uv",new be(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function Jn(n){let t={};for(let e in n){t[e]={};for(let i in n[e]){let s=n[e][i];if(Wh(s))s.isRenderTargetTexture?(Gt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=s.clone();else if(Array.isArray(s))if(Wh(s[0])){let a=[];for(let r=0,o=s.length;r<o;r++)a[r]=s[r].clone();t[e][i]=a}else t[e][i]=s.slice();else t[e][i]=s}}return t}function fi(n){let t={};for(let e=0;e<n.length;e++){let i=Jn(n[e]);for(let s in i)t[s]=i[s]}return t}function Wh(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function Xf(n){let t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function _c(n){let t=n.getRenderTarget();return t===null?n.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:le.workingColorSpace}var Ro={clone:Jn,merge:fi},Yf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Zf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ze=class extends En{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Yf,this.fragmentShader=Zf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Jn(t.uniforms),this.uniformsGroups=Xf(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let r=this.uniforms[s].value;r&&r.isTexture?e.uniforms[s]={type:"t",value:r.toJSON(t).uuid}:r&&r.isColor?e.uniforms[s]={type:"c",value:r.getHex()}:r&&r.isVector2?e.uniforms[s]={type:"v2",value:r.toArray()}:r&&r.isVector3?e.uniforms[s]={type:"v3",value:r.toArray()}:r&&r.isVector4?e.uniforms[s]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?e.uniforms[s]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?e.uniforms[s]={type:"m4",value:r.toArray()}:e.uniforms[s]={value:r}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=e[s.value]||null;break;case"c":this.uniforms[i].value=new Xt().setHex(s.value);break;case"v2":this.uniforms[i].value=new jt().fromArray(s.value);break;case"v3":this.uniforms[i].value=new I().fromArray(s.value);break;case"v4":this.uniforms[i].value=new we().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Jt().fromArray(s.value);break;case"m4":this.uniforms[i].value=new he().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Sr=class extends ze{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},bi=class extends En{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Xt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Xt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Eo,this.normalScale=new jt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new un,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var wr=class extends En{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Mu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Er=class extends En{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function ms(n,t){return!n||n.constructor===t?n:typeof t.BYTES_PER_ELEMENT=="number"?new t(n):Array.prototype.slice.call(n)}function Ol(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}var An=class{constructor(t,e,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,s=e[i],a=e[i-1];i:{t:{let r;e:{n:if(!(t<s)){for(let o=i+2;;){if(s===void 0){if(t<a)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(a=s,s=e[++i],t<s)break t}r=e.length;break e}if(!(t>=a)){let o=e[1];t<o&&(i=2,a=o);for(let l=i-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=a,a=e[--i-1],t>=a)break t}r=i,i=0;break e}break i}for(;i<r;){let o=i+r>>>1;t<e[o]?r=o:i=o+1}if(s=e[i],a=e[i-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,a,s)}return this.interpolate_(i,a,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,s=this.valueSize,a=t*s;for(let r=0;r!==s;++r)e[r]=i[a+r];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Tr=class extends An{constructor(t,e,i,s){super(t,e,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Vl,endingEnd:Vl}}intervalChanged_(t,e,i){let s=this.parameterPositions,a=t-2,r=t+1,o=s[a],l=s[r];if(o===void 0)switch(this.getSettings_().endingStart){case Hl:a=t,o=2*e-i;break;case Gl:a=s.length-2,o=e+s[a]-s[a+1];break;default:a=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Hl:r=t,l=2*i-e;break;case Gl:r=1,l=i+s[1]-s[0];break;default:r=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-i),this._offsetPrev=a*h,this._offsetNext=r*h}interpolate_(t,e,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(i-e)/(s-e),_=g*g,p=_*g,m=-u*p+2*u*_-u*g,M=(1+u)*p+(-1.5-2*u)*_+(-.5+u)*g+1,A=(-1-f)*p+(1.5+f)*_+.5*g,b=f*p-f*_;for(let w=0;w!==o;++w)a[w]=m*r[h+w]+M*r[c+w]+A*r[l+w]+b*r[d+w];return a}},Ar=class extends An{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(i-e)/(s-e),d=1-h;for(let u=0;u!==o;++u)a[u]=r[c+u]*d+r[l+u]*h;return a}},Rr=class extends An{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Cr=class extends An{interpolate_(t,e,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let g=(i-e)/(s-e),_=1-g;for(let p=0;p!==o;++p)a[p]=r[c+p]*_+r[l+p]*g;return a}let u=o*2,f=t-1;for(let g=0;g!==o;++g){let _=r[c+g],p=r[l+g],m=f*u+g*2,M=d[m],A=d[m+1],b=t*u+g*2,w=h[b],S=h[b+1],R=$f(i,e,M,w,s);a[g]=Uu(R,_,A,S,p)}return a}};function Uu(n,t,e,i,s){let a=1-n;return a*a*a*t+3*a*a*n*e+3*a*n*n*i+n*n*n*s}function Jf(n,t,e,i,s){let a=1-n;return 3*a*a*(e-t)+6*a*n*(i-e)+3*n*n*(s-i)}function $f(n,t,e,i,s){let a=(n-t)/(s-t);for(let r=0;r<8;r++){let o=Uu(a,t,e,i,s)-n;if(Math.abs(o)<1e-10)break;let l=Jf(a,t,e,i,s);if(Math.abs(l)<1e-10)break;a=Math.max(0,Math.min(1,a-o/l))}return a}var Ri=class{constructor(t,e,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=ms(e,this.TimeBufferType),this.values=ms(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:ms(t.times,Array),values:ms(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s),Ol(t.settings)&&(i.settings={inTangents:ms(t.settings.inTangents,Array),outTangents:ms(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new Rr(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ar(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Tr(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Cr(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Ys:e=this.InterpolantFactoryMethodDiscrete;break;case vr:e=this.InterpolantFactoryMethodLinear;break;case or:e=this.InterpolantFactoryMethodSmooth;break;case zl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Gt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ys;case this.InterpolantFactoryMethodLinear:return vr;case this.InterpolantFactoryMethodSmooth:return or;case this.InterpolantFactoryMethodBezier:return zl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]*=t;Ol(this.settings)&&(qh(this.settings.inTangents,t),qh(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,s=i.length,a=0,r=s-1;for(;a!==s&&i[a]<t;)++a;for(;r!==-1&&i[r]>e;)--r;if(++r,a!==0||r!==s){a>=r&&(r=Math.max(r,1),a=r-1);let o=this.getValueSize();this.times=i.slice(a,r),this.values=this.values.slice(a*o,r*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Ht("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,a=i.length;a===0&&(Ht("KeyframeTrack: Track is empty.",this),t=!1);let r=null;for(let o=0;o!==a;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){Ht("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(r!==null&&r>l){Ht("KeyframeTrack: Out of order keys.",this,o,l,r),t=!1;break}r=l}if(s!==void 0&&Tf(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Ht("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===or,a=t.length-1,r=1;for(let o=1;o<a;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(s)l=!0;else{let d=o*i,u=d-i,f=d+i;for(let g=0;g!==i;++g){let _=e[d+g];if(_!==e[u+g]||_!==e[f+g]){l=!0;break}}}if(l){if(o!==r){t[r]=t[o];let d=o*i,u=r*i;for(let f=0;f!==i;++f)e[u+f]=e[d+f]}++r}}if(a>0){t[r]=t[a];for(let o=a*i,l=r*i,c=0;c!==i;++c)e[l+c]=e[o+c];++r}return r!==t.length?(this.times=t.slice(0,r),this.values=e.slice(0,r*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,s=new i(this.name,t,e);return s.createInterpolant=this.createInterpolant,Ol(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function qh(n,t){for(let e=0,i=n.length;e!==i;e+=2)n[e]*=t}Ri.prototype.ValueTypeName="";Ri.prototype.TimeBufferType=Float32Array;Ri.prototype.ValueBufferType=Float32Array;Ri.prototype.DefaultInterpolation=vr;var Rn=class extends Ri{constructor(t,e,i){super(t,e,i)}};Rn.prototype.ValueTypeName="bool";Rn.prototype.ValueBufferType=Array;Rn.prototype.DefaultInterpolation=Ys;Rn.prototype.InterpolantFactoryMethodLinear=void 0;Rn.prototype.InterpolantFactoryMethodSmooth=void 0;var Pr=class extends Ri{constructor(t,e,i,s){super(t,e,i,s)}};Pr.prototype.ValueTypeName="color";var Ir=class extends Ri{constructor(t,e,i,s){super(t,e,i,s)}};Ir.prototype.ValueTypeName="number";var Lr=class extends An{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=(i-e)/(s-e),c=t*o;for(let h=c+o;c!==h;c+=4)tn.slerpFlat(a,0,r,c-o,r,c,l);return a}},oa=class extends Ri{constructor(t,e,i,s){super(t,e,i,s)}InterpolantFactoryMethodLinear(t){return new Lr(this.times,this.values,this.getValueSize(),t)}};oa.prototype.ValueTypeName="quaternion";oa.prototype.InterpolantFactoryMethodSmooth=void 0;var Cn=class extends Ri{constructor(t,e,i){super(t,e,i)}};Cn.prototype.ValueTypeName="string";Cn.prototype.ValueBufferType=Array;Cn.prototype.DefaultInterpolation=Ys;Cn.prototype.InterpolantFactoryMethodLinear=void 0;Cn.prototype.InterpolantFactoryMethodSmooth=void 0;var Dr=class extends Ri{constructor(t,e,i,s){super(t,e,i,s)}};Dr.prototype.ValueTypeName="vector";var Fr=class{constructor(t,e,i){let s=this,a=!1,r=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,a===!1&&s.onStart!==void 0&&s.onStart(h,r,o),a=!0},this.itemEnd=function(h){r++,s.onProgress!==void 0&&s.onProgress(h,r,o),r===o&&(a=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let f=c[d],g=c[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Ou=new Fr,Nr=class{constructor(t){this.manager=t!==void 0?t:Ou,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(s,a){i.load(t,s,e,a)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Nr.DEFAULT_MATERIAL_NAME="__DEFAULT";var As=class extends ii{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Xt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},la=class extends As{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ii.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Xt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Bl=new he,Xh=new I,Yh=new I,ca=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new jt(512,512),this.mapType=Mi,this.map=null,this.mapPass=null,this.matrix=new he,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ts,this._frameExtents=new jt(1,1),this._viewportCount=1,this._viewports=[new we(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Xh.setFromMatrixPosition(t.matrixWorld),e.position.copy(Xh),Yh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Yh),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,s){Bl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Bl,t.coordinateSystem,t.reversedDepth);let a=this._frameExtents,r=s?s.z/a.x:1,o=s?s.w/a.y:1,l=s?s.x/a.x:0,c=s?s.y/a.y:0;t.coordinateSystem===ys||t.reversedDepth?e.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*r,0,0,.5*r+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(Bl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},ar=new I,rr=new tn,$i=new I,ha=class extends ii{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new he,this.projectionMatrix=new he,this.projectionMatrixInverse=new he,this.coordinateSystem=Vi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(ar,rr,$i),$i.x===1&&$i.y===1&&$i.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ar,rr,$i.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(ar,rr,$i),$i.x===1&&$i.y===1&&$i.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ar,rr,$i.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Mn=new I,Zh=new jt,Jh=new jt,Ge=class extends ha{constructor(t=50,e=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=js*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(vl*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return js*2*Math.atan(Math.tan(vl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){Mn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Mn.x,Mn.y).multiplyScalar(-t/Mn.z),Mn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Mn.x,Mn.y).multiplyScalar(-t/Mn.z)}getViewSize(t,e){return this.getViewBounds(t,Zh,Jh),e.subVectors(Jh,Zh)}setViewOffset(t,e,i,s,a,r){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(vl*.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,a=-.5*s,r=this.view;if(this.view!==null&&this.view.enabled){let l=r.fullWidth,c=r.fullHeight;a+=r.offsetX*s/l,e-=r.offsetY*i/c,s*=r.width/l,i*=r.height/c}let o=this.filmOffset;o!==0&&(a+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Wl=class extends ca{constructor(){super(new Ge(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){let e=this.camera,i=js*2*t.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,a=t.distance||e.far;(i!==e.fov||s!==e.aspect||a!==e.far)&&(e.fov=i,e.aspect=s,e.far=a,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){let t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}},ua=class extends As{constructor(t,e,i=0,s=Math.PI/3,a=0,r=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ii.DEFAULT_UP),this.updateMatrix(),this.target=new ii,this.distance=i,this.angle=s,this.penumbra=a,this.decay=r,this.map=null,this.shadow=new Wl}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture&&(e.object.map=this.map.toJSON(t).uuid),e.object.shadow=this.shadow.toJSON(),e}},ql=class extends ca{constructor(){super(new Ge(90,1,.5,500)),this.isPointLightShadow=!0}},Pn=class extends As{constructor(t,e,i=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new ql}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},qn=class extends ha{constructor(t=-1,e=1,i=1,s=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,a=i-t,r=i+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,r=a+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}};var gs=-90,vs=1,kr=class extends ii{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ge(gs,vs,t,e);s.layers=this.layers,this.add(s);let a=new Ge(gs,vs,t,e);a.layers=this.layers,this.add(a);let r=new Ge(gs,vs,t,e);r.layers=this.layers,this.add(r);let o=new Ge(gs,vs,t,e);o.layers=this.layers,this.add(o);let l=new Ge(gs,vs,t,e);l.layers=this.layers,this.add(l);let c=new Ge(gs,vs,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,s,a,r,o,l]=e;for(let c of e)this.remove(c);if(t===Vi)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ys)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[a,r,o,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,1,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,2,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,3,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.generateMipmaps=_,t.setRenderTarget(i,5,s),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(d,u,f),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Ur=class extends Ge{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var xc="\\[\\]\\.:\\/",jf=new RegExp("["+xc+"]","g"),yc="[^"+xc+"]",Kf="[^"+xc.replace("\\.","")+"]",Qf=/((?:WC+[\/:])*)/.source.replace("WC",yc),tp=/(WCOD+)?/.source.replace("WCOD",Kf),ep=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",yc),ip=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",yc),np=new RegExp("^"+Qf+tp+ep+ip+"$"),sp=["material","materials","bones","map"],Xl=class{constructor(t,e,i){let s=i||De.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,a=i.length;s!==a;++s)i[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},De=class n{constructor(t,e,i){this.path=e,this.parsedPath=i||n.parseTrackName(e),this.node=n.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new n.Composite(t,e,i):new n(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(jf,"")}static parseTrackName(t){let e=np.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let a=i.nodeName.substring(s+1);sp.indexOf(a)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=a)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(a){for(let r=0;r<a.length;r++){let o=a[r];if(o.name===e||o.uuid===e)return o;let l=i(o.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)t[e++]=i[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,s=e.propertyName,a=e.propertyIndex;if(t||(t=n.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Gt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){Ht("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Ht("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Ht("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Ht("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Ht("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Ht("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Ht("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let r=t[s];if(r===void 0){let c=e.nodeName;Ht("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(a!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Ht("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Ht("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}l=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=a}else r.fromArray!==void 0&&r.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=r):Array.isArray(r)?(l=this.BindingType.EntireArray,this.resolvedProperty=r):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};De.Composite=Xl;De.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};De.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};De.prototype.GetterByBindingType=[De.prototype._getValue_direct,De.prototype._getValue_array,De.prototype._getValue_arrayElement,De.prototype._getValue_toArray];De.prototype.SetterByBindingTypeAndVersioning=[[De.prototype._setValue_direct,De.prototype._setValue_direct_setNeedsUpdate,De.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[De.prototype._setValue_array,De.prototype._setValue_array_setNeedsUpdate,De.prototype._setValue_array_setMatrixWorldNeedsUpdate],[De.prototype._setValue_arrayElement,De.prototype._setValue_arrayElement_setNeedsUpdate,De.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[De.prototype._setValue_fromArray,De.prototype._setValue_fromArray_setNeedsUpdate,De.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var D_=new Float32Array(1);var $h=new he,da=class{constructor(t,e,i=0,s=1/0){this.ray=new ia(t,e),this.near=i,this.far=s,this.camera=null,this.layers=new Ss,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Ht("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return $h.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4($h),this}intersectObject(t,e=!0,i=[]){return Yl(t,this,i,e),i.sort(jh),i}intersectObjects(t,e=!0,i=[]){for(let s=0,a=t.length;s<a;s++)Yl(t[s],this,i,e);return i.sort(jh),i}};function jh(n,t){return n.distance-t.distance}function Yl(n,t,e,i){let s=!0;if(n.layers.test(t.layers)&&n.raycast(t,e)===!1&&(s=!1),s===!0&&i===!0){let a=n.children;for(let r=0,o=a.length;r<o;r++)Yl(a[r],t,e,!0)}}var Tc=class Tc{constructor(t,e,i,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,s){let a=this.elements;return a[0]=t,a[2]=e,a[1]=i,a[3]=s,this}};Tc.prototype.isMatrix2=!0;var Zl=Tc;function bc(n,t,e,i){let s=ap(i);switch(e){case fc:return n*t;case mc:return n*t/s.components*s.byteLength;case qr:return n*t/s.components*s.byteLength;case Nn:return n*t*2/s.components*s.byteLength;case Xr:return n*t*2/s.components*s.byteLength;case pc:return n*t*3/s.components*s.byteLength;case Ni:return n*t*4/s.components*s.byteLength;case Yr:return n*t*4/s.components*s.byteLength;case ga:case va:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case _a:case xa:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case Jr:case jr:return Math.max(n,16)*Math.max(t,8)/4;case Zr:case $r:return Math.max(n,8)*Math.max(t,8)/2;case Kr:case Qr:case eo:case io:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case to:case ya:case no:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case so:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case ao:return Math.floor((n+4)/5)*Math.floor((t+3)/4)*16;case ro:return Math.floor((n+4)/5)*Math.floor((t+4)/5)*16;case oo:return Math.floor((n+5)/6)*Math.floor((t+4)/5)*16;case lo:return Math.floor((n+5)/6)*Math.floor((t+5)/6)*16;case co:return Math.floor((n+7)/8)*Math.floor((t+4)/5)*16;case ho:return Math.floor((n+7)/8)*Math.floor((t+5)/6)*16;case uo:return Math.floor((n+7)/8)*Math.floor((t+7)/8)*16;case fo:return Math.floor((n+9)/10)*Math.floor((t+4)/5)*16;case po:return Math.floor((n+9)/10)*Math.floor((t+5)/6)*16;case mo:return Math.floor((n+9)/10)*Math.floor((t+7)/8)*16;case go:return Math.floor((n+9)/10)*Math.floor((t+9)/10)*16;case vo:return Math.floor((n+11)/12)*Math.floor((t+9)/10)*16;case _o:return Math.floor((n+11)/12)*Math.floor((t+11)/12)*16;case xo:case yo:case bo:return Math.ceil(n/4)*Math.ceil(t/4)*16;case Mo:case So:return Math.ceil(n/4)*Math.ceil(t/4)*8;case ba:case wo:return Math.ceil(n/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function ap(n){switch(n){case Mi:case cc:return{byteLength:1,components:1};case Ps:case hc:case li:return{byteLength:2,components:1};case Gr:case Wr:return{byteLength:2,components:4};case Hi:case Hr:case Gi:return{byteLength:4,components:1};case uc:case dc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Gt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function rd(){let n=null,t=!1,e=null,i=null;function s(a,r){i=n.requestAnimationFrame(s),e(a,r)}return{start:function(){t!==!0&&e!==null&&n!==null&&(i=n.requestAnimationFrame(s),t=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(a){e=a},setContext:function(a){n=a}}}function fp(n){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=n.createBuffer();n.bindBuffer(l,u),n.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,c){let h=l.array,d=l.updateRanges;if(n.bindBuffer(c,o),d.length===0)n.bufferSubData(c,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){let g=d[u],_=d[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++u,d[u]=_)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){let _=d[f];n.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(n.deleteBuffer(l.buffer),t.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:a,update:r}}var pp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,mp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,gp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,vp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,_p=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,xp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,yp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,bp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Mp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Sp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,wp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ep=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Tp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ap=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Rp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Cp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Pp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ip=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Lp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Dp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Fp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Np=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,kp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Up=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Op=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Bp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,zp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Vp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Hp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Gp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Wp="gl_FragColor = linearToOutputTexel( gl_FragColor );",qp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Xp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Yp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Zp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Jp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,$p=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,jp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Kp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Qp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,t0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,e0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,i0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,n0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,s0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,a0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,r0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,o0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,l0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,c0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,h0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,u0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,d0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,f0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,p0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,m0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,g0=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,v0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,_0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,x0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,y0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,b0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,M0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,S0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,w0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,E0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,T0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,A0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,R0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,C0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,P0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,I0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,L0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,D0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,F0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,N0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,k0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,U0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,O0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,B0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,z0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,V0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,H0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,G0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,W0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,q0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,X0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Y0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Z0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,J0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,$0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,j0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,K0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Q0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,tm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,em=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,im=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,nm=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,sm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,am=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,rm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,om=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,lm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,cm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,hm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,um=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,dm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,fm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,pm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,mm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,vm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_m=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,xm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ym=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,bm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Mm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Sm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,wm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Em=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Am=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Rm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Cm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Im=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Lm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Dm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Nm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,km=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Um=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Om=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Bm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Vm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Gm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Wm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,qm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Xm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ym=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ne={alphahash_fragment:pp,alphahash_pars_fragment:mp,alphamap_fragment:gp,alphamap_pars_fragment:vp,alphatest_fragment:_p,alphatest_pars_fragment:xp,aomap_fragment:yp,aomap_pars_fragment:bp,batching_pars_vertex:Mp,batching_vertex:Sp,begin_vertex:wp,beginnormal_vertex:Ep,bsdfs:Tp,iridescence_fragment:Ap,bumpmap_pars_fragment:Rp,clipping_planes_fragment:Cp,clipping_planes_pars_fragment:Pp,clipping_planes_pars_vertex:Ip,clipping_planes_vertex:Lp,color_fragment:Dp,color_pars_fragment:Fp,color_pars_vertex:Np,color_vertex:kp,common:Up,cube_uv_reflection_fragment:Op,defaultnormal_vertex:Bp,displacementmap_pars_vertex:zp,displacementmap_vertex:Vp,emissivemap_fragment:Hp,emissivemap_pars_fragment:Gp,colorspace_fragment:Wp,colorspace_pars_fragment:qp,envmap_fragment:Xp,envmap_common_pars_fragment:Yp,envmap_pars_fragment:Zp,envmap_pars_vertex:Jp,envmap_physical_pars_fragment:r0,envmap_vertex:$p,fog_vertex:jp,fog_pars_vertex:Kp,fog_fragment:Qp,fog_pars_fragment:t0,gradientmap_pars_fragment:e0,lightmap_pars_fragment:i0,lights_lambert_fragment:n0,lights_lambert_pars_fragment:s0,lights_pars_begin:a0,lights_toon_fragment:o0,lights_toon_pars_fragment:l0,lights_phong_fragment:c0,lights_phong_pars_fragment:h0,lights_physical_fragment:u0,lights_physical_pars_fragment:d0,lights_fragment_begin:f0,lights_fragment_maps:p0,lights_fragment_end:m0,lightprobes_pars_fragment:g0,logdepthbuf_fragment:v0,logdepthbuf_pars_fragment:_0,logdepthbuf_pars_vertex:x0,logdepthbuf_vertex:y0,map_fragment:b0,map_pars_fragment:M0,map_particle_fragment:S0,map_particle_pars_fragment:w0,metalnessmap_fragment:E0,metalnessmap_pars_fragment:T0,morphinstance_vertex:A0,morphcolor_vertex:R0,morphnormal_vertex:C0,morphtarget_pars_vertex:P0,morphtarget_vertex:I0,normal_fragment_begin:L0,normal_fragment_maps:D0,normal_pars_fragment:F0,normal_pars_vertex:N0,normal_vertex:k0,normalmap_pars_fragment:U0,clearcoat_normal_fragment_begin:O0,clearcoat_normal_fragment_maps:B0,clearcoat_pars_fragment:z0,iridescence_pars_fragment:V0,opaque_fragment:H0,packing:G0,premultiplied_alpha_fragment:W0,project_vertex:q0,dithering_fragment:X0,dithering_pars_fragment:Y0,roughnessmap_fragment:Z0,roughnessmap_pars_fragment:J0,shadowmap_pars_fragment:$0,shadowmap_pars_vertex:j0,shadowmap_vertex:K0,shadowmask_pars_fragment:Q0,skinbase_vertex:tm,skinning_pars_vertex:em,skinning_vertex:im,skinnormal_vertex:nm,specularmap_fragment:sm,specularmap_pars_fragment:am,tonemapping_fragment:rm,tonemapping_pars_fragment:om,transmission_fragment:lm,transmission_pars_fragment:cm,uv_pars_fragment:hm,uv_pars_vertex:um,uv_vertex:dm,worldpos_vertex:fm,background_vert:pm,background_frag:mm,backgroundCube_vert:gm,backgroundCube_frag:vm,cube_vert:_m,cube_frag:xm,depth_vert:ym,depth_frag:bm,distance_vert:Mm,distance_frag:Sm,equirect_vert:wm,equirect_frag:Em,linedashed_vert:Tm,linedashed_frag:Am,meshbasic_vert:Rm,meshbasic_frag:Cm,meshlambert_vert:Pm,meshlambert_frag:Im,meshmatcap_vert:Lm,meshmatcap_frag:Dm,meshnormal_vert:Fm,meshnormal_frag:Nm,meshphong_vert:km,meshphong_frag:Um,meshphysical_vert:Om,meshphysical_frag:Bm,meshtoon_vert:zm,meshtoon_frag:Vm,points_vert:Hm,points_frag:Gm,shadow_vert:Wm,shadow_frag:qm,sprite_vert:Xm,sprite_frag:Ym},xt={common:{diffuse:{value:new Xt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Jt},alphaMap:{value:null},alphaMapTransform:{value:new Jt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Jt}},envmap:{envMap:{value:null},envMapRotation:{value:new Jt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Jt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Jt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Jt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Jt},normalScale:{value:new jt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Jt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Jt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Jt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Jt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Xt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new I},probesMax:{value:new I},probesResolution:{value:new I}},points:{diffuse:{value:new Xt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Jt},alphaTest:{value:0},uvTransform:{value:new Jt}},sprite:{diffuse:{value:new Xt(16777215)},opacity:{value:1},center:{value:new jt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Jt},alphaMap:{value:null},alphaMapTransform:{value:new Jt},alphaTest:{value:0}}},sn={basic:{uniforms:fi([xt.common,xt.specularmap,xt.envmap,xt.aomap,xt.lightmap,xt.fog]),vertexShader:ne.meshbasic_vert,fragmentShader:ne.meshbasic_frag},lambert:{uniforms:fi([xt.common,xt.specularmap,xt.envmap,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.fog,xt.lights,{emissive:{value:new Xt(0)},envMapIntensity:{value:1}}]),vertexShader:ne.meshlambert_vert,fragmentShader:ne.meshlambert_frag},phong:{uniforms:fi([xt.common,xt.specularmap,xt.envmap,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.fog,xt.lights,{emissive:{value:new Xt(0)},specular:{value:new Xt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ne.meshphong_vert,fragmentShader:ne.meshphong_frag},standard:{uniforms:fi([xt.common,xt.envmap,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.roughnessmap,xt.metalnessmap,xt.fog,xt.lights,{emissive:{value:new Xt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ne.meshphysical_vert,fragmentShader:ne.meshphysical_frag},toon:{uniforms:fi([xt.common,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.gradientmap,xt.fog,xt.lights,{emissive:{value:new Xt(0)}}]),vertexShader:ne.meshtoon_vert,fragmentShader:ne.meshtoon_frag},matcap:{uniforms:fi([xt.common,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.fog,{matcap:{value:null}}]),vertexShader:ne.meshmatcap_vert,fragmentShader:ne.meshmatcap_frag},points:{uniforms:fi([xt.points,xt.fog]),vertexShader:ne.points_vert,fragmentShader:ne.points_frag},dashed:{uniforms:fi([xt.common,xt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ne.linedashed_vert,fragmentShader:ne.linedashed_frag},depth:{uniforms:fi([xt.common,xt.displacementmap]),vertexShader:ne.depth_vert,fragmentShader:ne.depth_frag},normal:{uniforms:fi([xt.common,xt.bumpmap,xt.normalmap,xt.displacementmap,{opacity:{value:1}}]),vertexShader:ne.meshnormal_vert,fragmentShader:ne.meshnormal_frag},sprite:{uniforms:fi([xt.sprite,xt.fog]),vertexShader:ne.sprite_vert,fragmentShader:ne.sprite_frag},background:{uniforms:{uvTransform:{value:new Jt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ne.background_vert,fragmentShader:ne.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Jt}},vertexShader:ne.backgroundCube_vert,fragmentShader:ne.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ne.cube_vert,fragmentShader:ne.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ne.equirect_vert,fragmentShader:ne.equirect_frag},distance:{uniforms:fi([xt.common,xt.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ne.distance_vert,fragmentShader:ne.distance_frag},shadow:{uniforms:fi([xt.lights,xt.fog,{color:{value:new Xt(0)},opacity:{value:1}}]),vertexShader:ne.shadow_vert,fragmentShader:ne.shadow_frag}};sn.physical={uniforms:fi([sn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Jt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Jt},clearcoatNormalScale:{value:new jt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Jt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Jt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Jt},sheen:{value:0},sheenColor:{value:new Xt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Jt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Jt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Jt},transmissionSamplerSize:{value:new jt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Jt},attenuationDistance:{value:0},attenuationColor:{value:new Xt(0)},specularColor:{value:new Xt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Jt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Jt},anisotropyVector:{value:new jt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Jt}}]),vertexShader:ne.meshphysical_vert,fragmentShader:ne.meshphysical_frag};var Co={r:0,b:0,g:0},Zm=new he,od=new Jt;od.set(-1,0,0,0,1,0,0,0,1);function Jm(n,t,e,i,s,a){let r=new Xt(0),o=s===!0?0:1,l,c,h=null,d=0,u=null;function f(M){let A=M.isScene===!0?M.background:null;if(A&&A.isTexture){let b=M.backgroundBlurriness>0;A=t.get(A,b)}return A}function g(M){let A=!1,b=f(M);b===null?p(r,o):b&&b.isColor&&(p(b,1),A=!0);let w=n.xr.getEnvironmentBlendMode();w==="additive"?e.buffers.color.setClear(0,0,0,1,a):w==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,a),(n.autoClear||A)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function _(M,A){let b=f(A);b&&(b.isCubeTexture||b.mapping===pa)?(c===void 0&&(c=new Lt(new Fi(1,1,1),new ze({name:"BackgroundCubeMaterial",uniforms:Jn(sn.backgroundCube.uniforms),vertexShader:sn.backgroundCube.vertexShader,fragmentShader:sn.backgroundCube.fragmentShader,side:oi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(w,S,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=b,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Zm.makeRotationFromEuler(A.backgroundRotation)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(od),c.material.toneMapped=le.getTransfer(b.colorSpace)!==ve,(h!==b||d!==b.version||u!==n.toneMapping)&&(c.material.needsUpdate=!0,h=b,d=b.version,u=n.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):b&&b.isTexture&&(l===void 0&&(l=new Lt(new Me(2,2),new ze({name:"BackgroundMaterial",uniforms:Jn(sn.background.uniforms),vertexShader:sn.background.vertexShader,fragmentShader:sn.background.fragmentShader,side:In,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=b,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=le.getTransfer(b.colorSpace)!==ve,b.matrixAutoUpdate===!0&&b.updateMatrix(),l.material.uniforms.uvTransform.value.copy(b.matrix),(h!==b||d!==b.version||u!==n.toneMapping)&&(l.material.needsUpdate=!0,h=b,d=b.version,u=n.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function p(M,A){M.getRGB(Co,_c(n)),e.buffers.color.setClear(Co.r,Co.g,Co.b,A,a)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return r},setClearColor:function(M,A=1){r.set(M),o=A,p(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,p(r,o)},render:g,addToRenderList:_,dispose:m}}function $m(n,t){let e=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=u(null),a=s,r=!1;function o(N,B,V,L,U){let $=!1,K=d(N,L,V,B);a!==K&&(a=K,c(a.object)),$=f(N,L,V,U),$&&g(N,L,V,U),U!==null&&t.update(U,n.ELEMENT_ARRAY_BUFFER),($||r)&&(r=!1,b(N,B,V,L),U!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(U).buffer))}function l(){return n.createVertexArray()}function c(N){return n.bindVertexArray(N)}function h(N){return n.deleteVertexArray(N)}function d(N,B,V,L){let U=L.wireframe===!0,$=i[B.id];$===void 0&&($={},i[B.id]=$);let K=N.isInstancedMesh===!0?N.id:0,ot=$[K];ot===void 0&&(ot={},$[K]=ot);let j=ot[V.id];j===void 0&&(j={},ot[V.id]=j);let it=j[U];return it===void 0&&(it=u(l()),j[U]=it),it}function u(N){let B=[],V=[],L=[];for(let U=0;U<e;U++)B[U]=0,V[U]=0,L[U]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:B,enabledAttributes:V,attributeDivisors:L,object:N,attributes:{},index:null}}function f(N,B,V,L){let U=a.attributes,$=B.attributes,K=0,ot=V.getAttributes();for(let j in ot)if(ot[j].location>=0){let Z=U[j],ct=$[j];if(ct===void 0&&(j==="instanceMatrix"&&N.instanceMatrix&&(ct=N.instanceMatrix),j==="instanceColor"&&N.instanceColor&&(ct=N.instanceColor)),Z===void 0||Z.attribute!==ct||ct&&Z.data!==ct.data)return!0;K++}return a.attributesNum!==K||a.index!==L}function g(N,B,V,L){let U={},$=B.attributes,K=0,ot=V.getAttributes();for(let j in ot)if(ot[j].location>=0){let Z=$[j];Z===void 0&&(j==="instanceMatrix"&&N.instanceMatrix&&(Z=N.instanceMatrix),j==="instanceColor"&&N.instanceColor&&(Z=N.instanceColor));let ct={};ct.attribute=Z,Z&&Z.data&&(ct.data=Z.data),U[j]=ct,K++}a.attributes=U,a.attributesNum=K,a.index=L}function _(){let N=a.newAttributes;for(let B=0,V=N.length;B<V;B++)N[B]=0}function p(N){m(N,0)}function m(N,B){let V=a.newAttributes,L=a.enabledAttributes,U=a.attributeDivisors;V[N]=1,L[N]===0&&(n.enableVertexAttribArray(N),L[N]=1),U[N]!==B&&(n.vertexAttribDivisor(N,B),U[N]=B)}function M(){let N=a.newAttributes,B=a.enabledAttributes;for(let V=0,L=B.length;V<L;V++)B[V]!==N[V]&&(n.disableVertexAttribArray(V),B[V]=0)}function A(N,B,V,L,U,$,K){K===!0?n.vertexAttribIPointer(N,B,V,U,$):n.vertexAttribPointer(N,B,V,L,U,$)}function b(N,B,V,L){_();let U=L.attributes,$=V.getAttributes(),K=B.defaultAttributeValues;for(let ot in $){let j=$[ot];if(j.location>=0){let it=U[ot];if(it===void 0&&(ot==="instanceMatrix"&&N.instanceMatrix&&(it=N.instanceMatrix),ot==="instanceColor"&&N.instanceColor&&(it=N.instanceColor)),it!==void 0){let Z=it.normalized,ct=it.itemSize,At=t.get(it);if(At===void 0)continue;let zt=At.buffer,Vt=At.type,qt=At.bytesPerElement,Q=Vt===n.INT||Vt===n.UNSIGNED_INT||it.gpuType===Hr;if(it.isInterleavedBufferAttribute){let rt=it.data,Rt=rt.stride,$t=it.offset;if(rt.isInstancedInterleavedBuffer){for(let Et=0;Et<j.locationSize;Et++)m(j.location+Et,rt.meshPerAttribute);N.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=rt.meshPerAttribute*rt.count)}else for(let Et=0;Et<j.locationSize;Et++)p(j.location+Et);n.bindBuffer(n.ARRAY_BUFFER,zt);for(let Et=0;Et<j.locationSize;Et++)A(j.location+Et,ct/j.locationSize,Vt,Z,Rt*qt,($t+ct/j.locationSize*Et)*qt,Q)}else{if(it.isInstancedBufferAttribute){for(let rt=0;rt<j.locationSize;rt++)m(j.location+rt,it.meshPerAttribute);N.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=it.meshPerAttribute*it.count)}else for(let rt=0;rt<j.locationSize;rt++)p(j.location+rt);n.bindBuffer(n.ARRAY_BUFFER,zt);for(let rt=0;rt<j.locationSize;rt++)A(j.location+rt,ct/j.locationSize,Vt,Z,ct*qt,ct/j.locationSize*rt*qt,Q)}}else if(K!==void 0){let Z=K[ot];if(Z!==void 0)switch(Z.length){case 2:n.vertexAttrib2fv(j.location,Z);break;case 3:n.vertexAttrib3fv(j.location,Z);break;case 4:n.vertexAttrib4fv(j.location,Z);break;default:n.vertexAttrib1fv(j.location,Z)}}}}M()}function w(){E();for(let N in i){let B=i[N];for(let V in B){let L=B[V];for(let U in L){let $=L[U];for(let K in $)h($[K].object),delete $[K];delete L[U]}}delete i[N]}}function S(N){if(i[N.id]===void 0)return;let B=i[N.id];for(let V in B){let L=B[V];for(let U in L){let $=L[U];for(let K in $)h($[K].object),delete $[K];delete L[U]}}delete i[N.id]}function R(N){for(let B in i){let V=i[B];for(let L in V){let U=V[L];if(U[N.id]===void 0)continue;let $=U[N.id];for(let K in $)h($[K].object),delete $[K];delete U[N.id]}}}function x(N){for(let B in i){let V=i[B],L=N.isInstancedMesh===!0?N.id:0,U=V[L];if(U!==void 0){for(let $ in U){let K=U[$];for(let ot in K)h(K[ot].object),delete K[ot];delete U[$]}delete V[L],Object.keys(V).length===0&&delete i[B]}}}function E(){P(),r=!0,a!==s&&(a=s,c(a.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:E,resetDefaultState:P,dispose:w,releaseStatesOfGeometry:S,releaseStatesOfObject:x,releaseStatesOfProgram:R,initAttributes:_,enableAttribute:p,disableUnusedAttributes:M}}function jm(n,t,e){let i;function s(l){i=l}function a(l,c){n.drawArrays(i,l,c),e.update(c,i,1)}function r(l,c,h){h!==0&&(n.drawArraysInstanced(i,l,c,h),e.update(c,i,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let u=0;for(let f=0;f<h;f++)u+=c[f];e.update(u,i,1)}this.setMode=s,this.render=a,this.renderInstances=r,this.renderMultiDraw=o}function Km(n,t,e,i){let s;function a(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let R=t.get("EXT_texture_filter_anisotropic");s=n.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function r(R){return!(R!==Ni&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let x=R===li&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==Mi&&R!==Gi&&!x&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Gt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&Gt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),p=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),m=n.getParameter(n.MAX_VERTEX_ATTRIBS),M=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),A=n.getParameter(n.MAX_VARYING_VECTORS),b=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),w=n.getParameter(n.MAX_SAMPLES),S=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:M,maxVaryings:A,maxFragmentUniforms:b,maxSamples:w,samples:S}}function Qm(n){let t=this,e=null,i=0,s=!1,a=!1,r=new Ai,o=new Jt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||i!==0||s;return s=u,i=d.length,f},this.beginShadows=function(){a=!0,h(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,f){let g=d.clippingPlanes,_=d.clipIntersection,p=d.clipShadows,m=n.get(d);if(!s||g===null||g.length===0||a&&!p)a?h(null):c();else{let M=a?0:i,A=M*4,b=m.clippingState||null;l.value=b,b=h(g,u,A,f);for(let w=0;w!==A;++w)b[w]=e[w];m.clippingState=b,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(d,u,f,g){let _=d!==null?d.length:0,p=null;if(_!==0){if(p=l.value,g!==!0||p===null){let m=f+_*4,M=u.matrixWorldInverse;o.getNormalMatrix(M),(p===null||p.length<m)&&(p=new Float32Array(m));for(let A=0,b=f;A!==_;++A,b+=4)r.copy(d[A]).applyMatrix4(M,o),r.normal.toArray(p,b),p[b+3]=r.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,p}}var Ds=4,tg=6,eg=20,ig=256,Sa=new qn,Bu=new Xt,Ac=null,Rc=0,Cc=0,Pc=!1,ng=new I,$n=new I,Io=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,s=100,a={}){let{size:r=256,position:o=ng}=a;Ac=this._renderer.getRenderTarget(),Rc=this._renderer.getActiveCubeFace(),Cc=this._renderer.getActiveMipmapLevel(),Pc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Hu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Vu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Ac,Rc,Cc),this._renderer.xr.enabled=Pc,t.scissorTest=!1,Ls(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ln||t.mapping===Zn?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Ac=this._renderer.getRenderTarget(),Rc=this._renderer.getActiveCubeFace(),Cc=this._renderer.getActiveMipmapLevel(),Pc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:ri,minFilter:ri,generateMipmaps:!1,type:li,format:Ni,colorSpace:Zs,depthBuffer:!1},s=zu(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=zu(t,e,i);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=sg(a)),this._blurMaterial=rg(a,t,e),this._ggxMaterial=ag(a,t,e)}return s}_compileMaterial(t){let e=new Lt(new Be,t);this._renderer.compile(e,Sa)}_sceneToCubeUV(t,e,i,s,a){let l=new Ge(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(Bu),d.toneMapping=Ci,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Lt(new Fi,new Yt({name:"PMREM.Background",side:oi,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,p=_.material,m=!1,M=t.background;M?M.isColor&&(p.color.copy(M),t.background=null,m=!0):(p.color.copy(Bu),m=!0);for(let A=0;A<6;A++){let b=A%3;b===0?(l.up.set(0,c[A],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x+h[A],a.y,a.z)):b===1?(l.up.set(0,0,c[A]),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y+h[A],a.z)):(l.up.set(0,c[A],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y,a.z+h[A]));let w=this._cubeSize;Ls(s,b*w,A>2?w:0,w,w),d.setRenderTarget(s),m&&d.render(_,l),d.render(t,l)}d.toneMapping=f,d.autoClear=u,t.background=M}_textureToCubeUV(t,e){let i=this._renderer,s=t.mapping===Ln||t.mapping===Zn;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Hu()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Vu());let a=s?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=a;let o=a.uniforms;o.envMap.value=t;let l=this._cubeSize;Ls(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(r,Sa)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let a=1;a<s;a++)this._applyGGXFilter(t,a-1,a);e.autoClear=i}_applyGGXFilter(t,e,i){let s=this._renderer,a=this._pingPongRenderTarget,r=this._ggxMaterial,o=this._lodMeshes[i];o.material=r;let l=r.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,f=d*u,{_lodMax:g}=this,_=this._sizeLods[i],p=3*_*(i>g-Ds?i-g+Ds:0),m=4*(this._cubeSize-_);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=g-e,Ls(a,p,m,3*_,2*_),s.setRenderTarget(a),s.render(o,Sa),l.envMap.value=a.texture,l.roughness.value=0,l.mipInt.value=g-i,Ls(t,p,m,3*_,2*_),s.setRenderTarget(t),s.render(o,Sa)}_blur(t,e,i,s){let a=this._pingPongRenderTarget,r=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,a,e,i,r),this._blurPass(a,t,i,i,r)}_blurPass(t,e,i,s,a){let r=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=a,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[s],d=3*h*(s>this._lodMax-Ds?s-this._lodMax+Ds:0),u=4*(this._cubeSize-h);Ls(e,d,u,3*h,2*h),r.setRenderTarget(e),r.render(l,Sa)}};function sg(n){let t=[],e=[],i=n,s=n-Ds+1+tg;for(let a=0;a<s;a++){let r=Math.pow(2,i);t.push(r);let o=1/(r-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,f=3,g=new Float32Array(f*u*d),_=new Float32Array(f*u*d);for(let m=0;m<d;m++){let M=m%3*2/3-1,A=m>2?0:-1,b=[M,A,0,M+2/3,A,0,M+2/3,A+1,0,M,A,0,M+2/3,A+1,0,M,A+1,0];g.set(b,f*u*m);for(let w=0;w<u;w++){let S=h[w*2]*2-1,R=h[w*2+1]*2-1;m===0?$n.set(1,R,S):m===1?$n.set(-S,1,-R):m===2?$n.set(-S,R,1):m===3?$n.set(-1,R,-S):m===4?$n.set(-S,-1,R):$n.set(S,R,-1),$n.toArray(_,(m*u+w)*f)}}let p=new Be;p.setAttribute("position",new Oe(g,f)),p.setAttribute("outputDirection",new Oe(_,f)),e.push(new Lt(p,null)),i>Ds&&i--}return{lodMeshes:e,sizeLods:t}}function zu(n,t,e){let i=new Ze(n,t,e);return i.texture.mapping=pa,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ls(n,t,e,i,s){n.viewport.set(t,e,i,s),n.scissor.set(t,e,i,s)}function ag(n,t,e){return new ze({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:ig,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Fo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:en,depthTest:!1,depthWrite:!1})}function rg(n,t,e){return new ze({name:"SphericalGaussianBlur",defines:{SAMPLES:eg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Fo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:en,depthTest:!1,depthWrite:!1})}function Vu(){return new ze({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Fo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:en,depthTest:!1,depthWrite:!1})}function Hu(){return new ze({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Fo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:en,depthTest:!1,depthWrite:!1})}function Fo(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Lo=class extends Ze{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new na(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Fi(5,5,5),a=new ze({name:"CubemapFromEquirect",uniforms:Jn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:oi,blending:en});a.uniforms.tEquirect.value=e;let r=new Lt(s,a),o=e.minFilter;return e.minFilter===Dn&&(e.minFilter=ri),new kr(1,10,this).update(t,r),e.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(t,e=!0,i=!0,s=!0){let a=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(e,i,s);t.setRenderTarget(a)}};function og(n){let t=new WeakMap,e=new WeakMap,i=null;function s(u,f=!1){return u==null?null:f?r(u):a(u)}function a(u){if(u&&u.isTexture){let f=u.mapping;if(f===Br||f===zr)if(t.has(u)){let g=t.get(u).texture;return o(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let _=new Lo(g.height);return _.fromEquirectangularTexture(n,u),t.set(u,_),u.addEventListener("dispose",c),o(_.texture,u.mapping)}else return null}}return u}function r(u){if(u&&u.isTexture){let f=u.mapping,g=f===Br||f===zr,_=f===Ln||f===Zn;if(g||_){let p=e.get(u),m=p!==void 0?p.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==m)return i===null&&(i=new Io(n)),p=g?i.fromEquirectangular(u,p):i.fromCubemap(u,p),p.texture.pmremVersion=u.pmremVersion,e.set(u,p),p.texture;if(p!==void 0)return p.texture;{let M=u.image;return g&&M&&M.height>0||_&&M&&l(M)?(i===null&&(i=new Io(n)),p=g?i.fromEquirectangular(u):i.fromCubemap(u),p.texture.pmremVersion=u.pmremVersion,e.set(u,p),u.addEventListener("dispose",h),p.texture):null}}}return u}function o(u,f){return f===Br?u.mapping=Ln:f===zr&&(u.mapping=Zn),u}function l(u){let f=0,g=6;for(let _=0;_<g;_++)u[_]!==void 0&&f++;return f===g}function c(u){let f=u.target;f.removeEventListener("dispose",c);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(u){let f=u.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function d(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:d}}function lg(n){let t={};function e(i){if(t[i]!==void 0)return t[i];let s=n.getExtension(i);return t[i]=s,s}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let s=e(i);return s===null&&Hn("WebGLRenderer: "+i+" extension not supported."),s}}}function cg(n,t,e,i){let s={},a=new WeakMap;function r(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);u.removeEventListener("dispose",r),delete s[u.id];let f=a.get(u);f&&(t.remove(f),a.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function o(d,u){return s[u.id]===!0||(u.addEventListener("dispose",r),s[u.id]=!0,e.memory.geometries++),u}function l(d){let u=d.attributes;for(let f in u)t.update(u[f],n.ARRAY_BUFFER)}function c(d){let u=[],f=d.index,g=d.attributes.position,_=0;if(g===void 0)return;if(f!==null){let M=f.array;_=f.version;for(let A=0,b=M.length;A<b;A+=3){let w=M[A+0],S=M[A+1],R=M[A+2];u.push(w,S,S,R,R,w)}}else{let M=g.array;_=g.version;for(let A=0,b=M.length/3-1;A<b;A+=3){let w=A+0,S=A+1,R=A+2;u.push(w,S,S,R,R,w)}}let p=new(g.count>=65535?ea:ta)(u,1);p.version=_;let m=a.get(d);m&&t.remove(m),a.set(d,p)}function h(d){let u=a.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return a.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function hg(n,t,e){let i;function s(d){i=d}let a,r;function o(d){a=d.type,r=d.bytesPerElement}function l(d,u){n.drawElements(i,u,a,d*r),e.update(u,i,1)}function c(d,u,f){f!==0&&(n.drawElementsInstanced(i,u,a,d*r,f),e.update(u,i,f))}function h(d,u,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,a,d,0,f);let _=0;for(let p=0;p<f;p++)_+=u[p];e.update(_,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function ug(n){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,r,o){switch(e.calls++,r){case n.TRIANGLES:e.triangles+=o*(a/3);break;case n.LINES:e.lines+=o*(a/2);break;case n.LINE_STRIP:e.lines+=o*(a-1);break;case n.LINE_LOOP:e.lines+=o*a;break;case n.POINTS:e.points+=o*a;break;default:Ht("WebGLInfo: Unknown draw mode:",r);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:i}}function dg(n,t,e){let i=new WeakMap,s=new we;function a(r,o,l){let c=r.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=i.get(o);if(u===void 0||u.count!==d){let E=function(){R.dispose(),i.delete(o),o.removeEventListener("dispose",E)};u!==void 0&&u.texture.dispose();let f=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],A=0;f===!0&&(A=1),g===!0&&(A=2),_===!0&&(A=3);let b=o.attributes.position.count*A,w=1;b>t.maxTextureSize&&(w=Math.ceil(b/t.maxTextureSize),b=t.maxTextureSize);let S=new Float32Array(b*w*4*d),R=new Ks(S,b,w,d);R.type=Gi,R.needsUpdate=!0;let x=A*4;for(let P=0;P<d;P++){let N=p[P],B=m[P],V=M[P],L=b*w*4*P;for(let U=0;U<N.count;U++){let $=U*x;f===!0&&(s.fromBufferAttribute(N,U),S[L+$+0]=s.x,S[L+$+1]=s.y,S[L+$+2]=s.z,S[L+$+3]=0),g===!0&&(s.fromBufferAttribute(B,U),S[L+$+4]=s.x,S[L+$+5]=s.y,S[L+$+6]=s.z,S[L+$+7]=0),_===!0&&(s.fromBufferAttribute(V,U),S[L+$+8]=s.x,S[L+$+9]=s.y,S[L+$+10]=s.z,S[L+$+11]=V.itemSize===4?s.w:1)}}u={count:d,texture:R,size:new jt(b,w)},i.set(o,u),o.addEventListener("dispose",E)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",r.morphTexture,e);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let g=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(n,"morphTargetsTextureSize",u.size)}return{update:a}}function fg(n,t,e,i,s){let a=new WeakMap;function r(c){let h=s.render.frame,d=c.geometry,u=t.get(c,d);if(a.get(u)!==h&&(t.update(u),a.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),a.get(c)!==h&&(e.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,n.ARRAY_BUFFER),a.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;a.get(f)!==h&&(f.update(),a.set(f,h))}return u}function o(){a=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:r,dispose:o}}var pg={[ec]:"LINEAR_TONE_MAPPING",[ic]:"REINHARD_TONE_MAPPING",[nc]:"CINEON_TONE_MAPPING",[sc]:"ACES_FILMIC_TONE_MAPPING",[rc]:"AGX_TONE_MAPPING",[oc]:"NEUTRAL_TONE_MAPPING",[ac]:"CUSTOM_TONE_MAPPING"};function mg(n,t,e,i,s,a){let r=new Ze(t,e,{type:n,depthBuffer:s,stencilBuffer:a,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Be;c.setAttribute("position",new be([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new be([0,2,0,0,2,0],2));let h=new Sr({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Lt(c,h),u=new qn(-1,1,1,-1,0,1),f=null,g=null,_=!1,p,m=null,M=[],A=!1;this.setSize=function(b,w){r.setSize(b,w),o!==null&&o.setSize(b,w),l!==null&&l.setSize(b,w);for(let S=0;S<M.length;S++){let R=M[S];R.setSize&&R.setSize(b,w)}},this.setEffects=function(b){M=b,A=M.length>0&&M[0].isRenderPass===!0;let w=r.width,S=r.height;M.length>0&&o===null&&(o=new Ze(w,S,{type:li,depthBuffer:!1,stencilBuffer:!1}),l=new Ze(w,S,{type:li,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<M.length;R++){let x=M[R];x.setSize&&x.setSize(w,S)}},this.begin=function(b,w){if(_||b.toneMapping===Ci&&M.length===0)return!1;if(m=w,w!==null){let S=w.width,R=w.height;(r.width!==S||r.height!==R)&&this.setSize(S,R)}return A===!1&&b.setRenderTarget(r),p=b.toneMapping,b.toneMapping=Ci,!0},this.hasRenderPass=function(){return A},this.end=function(b,w){b.toneMapping=p,_=!0;let S=r,R=o;for(let x=0;x<M.length;x++){let E=M[x];E.enabled!==!1&&(E.render(b,R,S,w),E.needsSwap!==!1&&(S=R,R=R===o?l:o))}if(f!==b.outputColorSpace||g!==b.toneMapping){f=b.outputColorSpace,g=b.toneMapping,h.defines={},le.getTransfer(f)===ve&&(h.defines.SRGB_TRANSFER="");let x=pg[g];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=S.texture,b.setRenderTarget(m),b.render(d,u),m=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){r.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var ld=new mi,Dc=new Tn(1,1),cd=new Ks,hd=new yr,ud=new na,Gu=[],Wu=[],qu=new Float32Array(16),Xu=new Float32Array(9),Yu=new Float32Array(4);function Ns(n,t,e){let i=n[0];if(i<=0||i>0)return n;let s=t*e,a=Gu[s];if(a===void 0&&(a=new Float32Array(s),Gu[s]=a),t!==0){i.toArray(a,0);for(let r=1,o=0;r!==t;++r)o+=e,n[r].toArray(a,o)}return a}function je(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function Ke(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function No(n,t){let e=Wu[t];e===void 0&&(e=new Int32Array(t),Wu[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function gg(n,t){let e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function vg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(je(e,t))return;n.uniform2fv(this.addr,t),Ke(e,t)}}function _g(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(je(e,t))return;n.uniform3fv(this.addr,t),Ke(e,t)}}function xg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(je(e,t))return;n.uniform4fv(this.addr,t),Ke(e,t)}}function yg(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(je(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),Ke(e,t)}else{if(je(e,i))return;Yu.set(i),n.uniformMatrix2fv(this.addr,!1,Yu),Ke(e,i)}}function bg(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(je(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),Ke(e,t)}else{if(je(e,i))return;Xu.set(i),n.uniformMatrix3fv(this.addr,!1,Xu),Ke(e,i)}}function Mg(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(je(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),Ke(e,t)}else{if(je(e,i))return;qu.set(i),n.uniformMatrix4fv(this.addr,!1,qu),Ke(e,i)}}function Sg(n,t){let e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function wg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(je(e,t))return;n.uniform2iv(this.addr,t),Ke(e,t)}}function Eg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(je(e,t))return;n.uniform3iv(this.addr,t),Ke(e,t)}}function Tg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(je(e,t))return;n.uniform4iv(this.addr,t),Ke(e,t)}}function Ag(n,t){let e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function Rg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(je(e,t))return;n.uniform2uiv(this.addr,t),Ke(e,t)}}function Cg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(je(e,t))return;n.uniform3uiv(this.addr,t),Ke(e,t)}}function Pg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(je(e,t))return;n.uniform4uiv(this.addr,t),Ke(e,t)}}function Ig(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let a;this.type===n.SAMPLER_2D_SHADOW?(Dc.compareFunction=e.isReversedDepthBuffer()?Ao:To,a=Dc):a=ld,e.setTexture2D(t||a,s)}function Lg(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture3D(t||hd,s)}function Dg(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTextureCube(t||ud,s)}function Fg(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture2DArray(t||cd,s)}function Ng(n){switch(n){case 5126:return gg;case 35664:return vg;case 35665:return _g;case 35666:return xg;case 35674:return yg;case 35675:return bg;case 35676:return Mg;case 5124:case 35670:return Sg;case 35667:case 35671:return wg;case 35668:case 35672:return Eg;case 35669:case 35673:return Tg;case 5125:return Ag;case 36294:return Rg;case 36295:return Cg;case 36296:return Pg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ig;case 35679:case 36299:case 36307:return Lg;case 35680:case 36300:case 36308:case 36293:return Dg;case 36289:case 36303:case 36311:case 36292:return Fg}}function kg(n,t){n.uniform1fv(this.addr,t)}function Ug(n,t){let e=Ns(t,this.size,2);n.uniform2fv(this.addr,e)}function Og(n,t){let e=Ns(t,this.size,3);n.uniform3fv(this.addr,e)}function Bg(n,t){let e=Ns(t,this.size,4);n.uniform4fv(this.addr,e)}function zg(n,t){let e=Ns(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function Vg(n,t){let e=Ns(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function Hg(n,t){let e=Ns(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function Gg(n,t){n.uniform1iv(this.addr,t)}function Wg(n,t){n.uniform2iv(this.addr,t)}function qg(n,t){n.uniform3iv(this.addr,t)}function Xg(n,t){n.uniform4iv(this.addr,t)}function Yg(n,t){n.uniform1uiv(this.addr,t)}function Zg(n,t){n.uniform2uiv(this.addr,t)}function Jg(n,t){n.uniform3uiv(this.addr,t)}function $g(n,t){n.uniform4uiv(this.addr,t)}function jg(n,t,e){let i=this.cache,s=t.length,a=No(e,s);je(i,a)||(n.uniform1iv(this.addr,a),Ke(i,a));let r;this.type===n.SAMPLER_2D_SHADOW?r=Dc:r=ld;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||r,a[o])}function Kg(n,t,e){let i=this.cache,s=t.length,a=No(e,s);je(i,a)||(n.uniform1iv(this.addr,a),Ke(i,a));for(let r=0;r!==s;++r)e.setTexture3D(t[r]||hd,a[r])}function Qg(n,t,e){let i=this.cache,s=t.length,a=No(e,s);je(i,a)||(n.uniform1iv(this.addr,a),Ke(i,a));for(let r=0;r!==s;++r)e.setTextureCube(t[r]||ud,a[r])}function tv(n,t,e){let i=this.cache,s=t.length,a=No(e,s);je(i,a)||(n.uniform1iv(this.addr,a),Ke(i,a));for(let r=0;r!==s;++r)e.setTexture2DArray(t[r]||cd,a[r])}function ev(n){switch(n){case 5126:return kg;case 35664:return Ug;case 35665:return Og;case 35666:return Bg;case 35674:return zg;case 35675:return Vg;case 35676:return Hg;case 5124:case 35670:return Gg;case 35667:case 35671:return Wg;case 35668:case 35672:return qg;case 35669:case 35673:return Xg;case 5125:return Yg;case 36294:return Zg;case 36295:return Jg;case 36296:return $g;case 35678:case 36198:case 36298:case 36306:case 35682:return jg;case 35679:case 36299:case 36307:return Kg;case 35680:case 36300:case 36308:case 36293:return Qg;case 36289:case 36303:case 36311:case 36292:return tv}}var Fc=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=Ng(e.type)}},Nc=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=ev(e.type)}},kc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let s=this.seq;for(let a=0,r=s.length;a!==r;++a){let o=s[a];o.setValue(t,e[o.id],i)}}},Ic=/(\w+)(\])?(\[|\.)?/g;function Zu(n,t){n.seq.push(t),n.map[t.id]=t}function iv(n,t,e){let i=n.name,s=i.length;for(Ic.lastIndex=0;;){let a=Ic.exec(i),r=Ic.lastIndex,o=a[1],l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&r+2===s){Zu(e,c===void 0?new Fc(o,n,t):new Nc(o,n,t));break}else{let d=e.map[o];d===void 0&&(d=new kc(o),Zu(e,d)),e=d}}}var Fs=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let o=t.getActiveUniform(e,r),l=t.getUniformLocation(e,o.name);iv(o,l,this)}let s=[],a=[];for(let r of this.seq)r.type===t.SAMPLER_2D_SHADOW||r.type===t.SAMPLER_CUBE_SHADOW||r.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(r):a.push(r);s.length>0&&(this.seq=s.concat(a))}setValue(t,e,i,s){let a=this.map[e];a!==void 0&&a.setValue(t,i,s)}setOptional(t,e,i){let s=e[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,e,i,s){for(let a=0,r=e.length;a!==r;++a){let o=e[a],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let i=[];for(let s=0,a=t.length;s!==a;++s){let r=t[s];r.id in e&&i.push(r)}return i}};function Ju(n,t,e){let i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}var nv=37297,sv=0;function av(n,t){let e=n.split(`
`),i=[],s=Math.max(t-6,0),a=Math.min(t+6,e.length);for(let r=s;r<a;r++){let o=r+1;i.push(`${o===t?">":" "} ${o}: ${e[r]}`)}return i.join(`
`)}var $u=new Jt;function rv(n){le._getMatrix($u,le.workingColorSpace,n);let t=`mat3( ${$u.elements.map(e=>e.toFixed(4))} )`;switch(le.getTransfer(n)){case Js:return[t,"LinearTransferOETF"];case ve:return[t,"sRGBTransferOETF"];default:return Gt("WebGLProgram: Unsupported color space: ",n),[t,"LinearTransferOETF"]}}function ju(n,t,e){let i=n.getShaderParameter(t,n.COMPILE_STATUS),a=(n.getShaderInfoLog(t)||"").trim();if(i&&a==="")return"";let r=/ERROR: 0:(\d+)/.exec(a);if(r){let o=parseInt(r[1]);return e.toUpperCase()+`

`+a+`

`+av(n.getShaderSource(t),o)}else return a}function ov(n,t){let e=rv(t);return[`vec4 ${n}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var lv={[ec]:"Linear",[ic]:"Reinhard",[nc]:"Cineon",[sc]:"ACESFilmic",[rc]:"AgX",[oc]:"Neutral",[ac]:"Custom"};function cv(n,t){let e=lv[t];return e===void 0?(Gt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Po=new I;function hv(){le.getLuminanceCoefficients(Po);let n=Po.x.toFixed(4),t=Po.y.toFixed(4),e=Po.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function uv(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ea).join(`
`)}function dv(n){let t=[];for(let e in n){let i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function fv(n,t){let e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let a=n.getActiveAttrib(t,s),r=a.name,o=1;a.type===n.FLOAT_MAT2&&(o=2),a.type===n.FLOAT_MAT3&&(o=3),a.type===n.FLOAT_MAT4&&(o=4),e[r]={type:a.type,location:n.getAttribLocation(t,r),locationSize:o}}return e}function Ea(n){return n!==""}function Ku(n,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Qu(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var pv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Uc(n){return n.replace(pv,gv)}var mv=new Map;function gv(n,t){let e=ne[t];if(e===void 0){let i=mv.get(t);if(i!==void 0)e=ne[i],Gt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Uc(e)}var vv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function td(n){return n.replace(vv,_v)}function _v(n,t,e,i){let s="";for(let a=parseInt(t);a<parseInt(e);a++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function ed(n){let t=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var xv={[Xn]:"SHADOWMAP_TYPE_PCF",[Rs]:"SHADOWMAP_TYPE_VSM"};function yv(n){return xv[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var bv={[Ln]:"ENVMAP_TYPE_CUBE",[Zn]:"ENVMAP_TYPE_CUBE",[pa]:"ENVMAP_TYPE_CUBE_UV"};function Mv(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":bv[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var Sv={[Zn]:"ENVMAP_MODE_REFRACTION"};function wv(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":Sv[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Ev={[tc]:"ENVMAP_BLENDING_MULTIPLY",[xu]:"ENVMAP_BLENDING_MIX",[yu]:"ENVMAP_BLENDING_ADD"};function Tv(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":Ev[n.combine]||"ENVMAP_BLENDING_NONE"}function Av(n){let t=n.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function Rv(n,t,e,i){let s=n.getContext(),a=e.defines,r=e.vertexShader,o=e.fragmentShader,l=yv(e),c=Mv(e),h=wv(e),d=Tv(e),u=Av(e),f=uv(e),g=dv(a),_=s.createProgram(),p,m,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ea).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ea).join(`
`),m.length>0&&(m+=`
`)):(p=[ed(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ea).join(`
`),m=[ed(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Ci?"#define TONE_MAPPING":"",e.toneMapping!==Ci?ne.tonemapping_pars_fragment:"",e.toneMapping!==Ci?cv("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ne.colorspace_pars_fragment,ov("linearToOutputTexel",e.outputColorSpace),hv(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ea).join(`
`)),r=Uc(r),r=Ku(r,e),r=Qu(r,e),o=Uc(o),o=Ku(o,e),o=Qu(o,e),r=td(r),o=td(o),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===gc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===gc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let A=M+p+r,b=M+m+o,w=Ju(s,s.VERTEX_SHADER,A),S=Ju(s,s.FRAGMENT_SHADER,b);s.attachShader(_,w),s.attachShader(_,S),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function R(N){if(n.debug.checkShaderErrors){let B=s.getProgramInfoLog(_)||"",V=s.getShaderInfoLog(w)||"",L=s.getShaderInfoLog(S)||"",U=B.trim(),$=V.trim(),K=L.trim(),ot=!0,j=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(ot=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,_,w,S);else{let it=ju(s,w,"vertex"),Z=ju(s,S,"fragment");Ht("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+U+`
`+it+`
`+Z)}else U!==""?Gt("WebGLProgram: Program Info Log:",U):($===""||K==="")&&(j=!1);j&&(N.diagnostics={runnable:ot,programLog:U,vertexShader:{log:$,prefix:p},fragmentShader:{log:K,prefix:m}})}s.deleteShader(w),s.deleteShader(S),x=new Fs(s,_),E=fv(s,_)}let x;this.getUniforms=function(){return x===void 0&&R(this),x};let E;this.getAttributes=function(){return E===void 0&&R(this),E};let P=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(_,nv)),P},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=sv++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=w,this.fragmentShader=S,this}var Cv=0,Oc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new Bc(t),e.set(t,i)),i}},Bc=class{constructor(t){this.id=Cv++,this.code=t,this.usedTimes=0}};function Pv(n){return n===Nn||n===ya||n===ba}function Iv(n,t,e,i,s,a){let r=new Ss,o=new Oc,l=new Set,c=[],h=new Map,d=i.logarithmicDepthBuffer,u=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function _(x,E,P,N,B,V){let L=N.fog,U=B.geometry,$=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?N.environment:null,K=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,ot=t.get(x.envMap||$,K),j=ot&&ot.mapping===pa?ot.image.height:null,it=f[x.type];x.precision!==null&&(u=i.getMaxPrecision(x.precision),u!==x.precision&&Gt("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let Z=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,ct=Z!==void 0?Z.length:0,At=0;U.morphAttributes.position!==void 0&&(At=1),U.morphAttributes.normal!==void 0&&(At=2),U.morphAttributes.color!==void 0&&(At=3);let zt,Vt,qt,Q;if(it){let Re=sn[it];zt=Re.vertexShader,Vt=Re.fragmentShader}else{zt=x.vertexShader,Vt=x.fragmentShader;let Re=o.getVertexShaderStage(x),me=o.getFragmentShaderStage(x);o.update(x,Re,me),qt=Re.id,Q=me.id}let rt=n.getRenderTarget(),Rt=n.state.buffers.depth.getReversed(),$t=B.isInstancedMesh===!0,Et=B.isBatchedMesh===!0,se=!!x.map,$e=!!x.matcap,ae=!!ot,fe=!!x.aoMap,Ae=!!x.lightMap,oe=!!x.bumpMap&&x.wireframe===!1,Fe=!!x.normalMap,Qe=!!x.displacementMap,_i=!!x.emissiveMap,Ue=!!x.metalnessMap,qe=!!x.roughnessMap,z=x.anisotropy>0,ci=x.clearcoat>0,_e=x.dispersion>0,T=x.retroreflectivity>0,v=x.iridescence>0,H=x.sheen>0,Y=x.transmission>0,tt=z&&!!x.anisotropyMap,dt=ci&&!!x.clearcoatMap,ft=ci&&!!x.clearcoatNormalMap,et=ci&&!!x.clearcoatRoughnessMap,st=v&&!!x.iridescenceMap,pt=v&&!!x.iridescenceThicknessMap,Nt=H&&!!x.sheenColorMap,_t=H&&!!x.sheenRoughnessMap,mt=!!x.specularMap,kt=!!x.specularColorMap,Bt=!!x.specularIntensityMap,Qt=Y&&!!x.transmissionMap,O=Y&&!!x.thicknessMap,gt=!!x.gradientMap,nt=!!x.alphaMap,vt=x.alphaTest>0,Mt=!!x.alphaHash,lt=!!x.extensions,Ut=Ci;x.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&(Ut=n.toneMapping);let It={shaderID:it,shaderType:x.type,shaderName:x.name,vertexShader:zt,fragmentShader:Vt,defines:x.defines,customVertexShaderID:qt,customFragmentShaderID:Q,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:Et,batchingColor:Et&&B._colorsTexture!==null,instancing:$t,instancingColor:$t&&B.instanceColor!==null,instancingMorph:$t&&B.morphTexture!==null,outputColorSpace:rt===null?n.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:le.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:se,matcap:$e,envMap:ae,envMapMode:ae&&ot.mapping,envMapCubeUVHeight:j,aoMap:fe,lightMap:Ae,bumpMap:oe,normalMap:Fe,displacementMap:Qe,emissiveMap:_i,normalMapObjectSpace:Fe&&x.normalMapType===Su,normalMapTangentSpace:Fe&&x.normalMapType===Eo,packedNormalMap:Fe&&x.normalMapType===Eo&&Pv(x.normalMap.format),metalnessMap:Ue,roughnessMap:qe,anisotropy:z,anisotropyMap:tt,clearcoat:ci,clearcoatMap:dt,clearcoatNormalMap:ft,clearcoatRoughnessMap:et,dispersion:_e,retroreflection:T,iridescence:v,iridescenceMap:st,iridescenceThicknessMap:pt,sheen:H,sheenColorMap:Nt,sheenRoughnessMap:_t,specularMap:mt,specularColorMap:kt,specularIntensityMap:Bt,transmission:Y,transmissionMap:Qt,thicknessMap:O,gradientMap:gt,opaque:x.transparent===!1&&x.blending===Cs&&x.alphaToCoverage===!1,alphaMap:nt,alphaTest:vt,alphaHash:Mt,combine:x.combine,mapUv:se&&g(x.map.channel),aoMapUv:fe&&g(x.aoMap.channel),lightMapUv:Ae&&g(x.lightMap.channel),bumpMapUv:oe&&g(x.bumpMap.channel),normalMapUv:Fe&&g(x.normalMap.channel),displacementMapUv:Qe&&g(x.displacementMap.channel),emissiveMapUv:_i&&g(x.emissiveMap.channel),metalnessMapUv:Ue&&g(x.metalnessMap.channel),roughnessMapUv:qe&&g(x.roughnessMap.channel),anisotropyMapUv:tt&&g(x.anisotropyMap.channel),clearcoatMapUv:dt&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:ft&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:et&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:st&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:pt&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Nt&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:_t&&g(x.sheenRoughnessMap.channel),specularMapUv:mt&&g(x.specularMap.channel),specularColorMapUv:kt&&g(x.specularColorMap.channel),specularIntensityMapUv:Bt&&g(x.specularIntensityMap.channel),transmissionMapUv:Qt&&g(x.transmissionMap.channel),thicknessMapUv:O&&g(x.thicknessMap.channel),alphaMapUv:nt&&g(x.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(Fe||z),vertexNormals:!!U.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!U.attributes.uv&&(se||nt),fog:!!L,useFog:x.fog===!0,fogExp2:!!L&&L.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||U.attributes.normal===void 0&&Fe===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Rt,skinning:B.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:ct,morphTextureStride:At,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:V.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ut,decodeVideoTexture:se&&x.map.isVideoTexture===!0&&le.getTransfer(x.map.colorSpace)===ve,decodeVideoTextureEmissive:_i&&x.emissiveMap.isVideoTexture===!0&&le.getTransfer(x.emissiveMap.colorSpace)===ve,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Ne,flipSided:x.side===oi,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:lt&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(lt&&x.extensions.multiDraw===!0||Et)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return It.vertexUv1s=l.has(1),It.vertexUv2s=l.has(2),It.vertexUv3s=l.has(3),l.clear(),It}function p(x){let E=[];if(x.shaderID?E.push(x.shaderID):(E.push(x.customVertexShaderID),E.push(x.customFragmentShaderID)),x.defines!==void 0)for(let P in x.defines)E.push(P),E.push(x.defines[P]);return x.isRawShaderMaterial===!1&&(m(E,x),M(E,x),E.push(n.outputColorSpace)),E.push(x.customProgramCacheKey),E.join()}function m(x,E){x.push(E.precision),x.push(E.outputColorSpace),x.push(E.envMapMode),x.push(E.envMapCubeUVHeight),x.push(E.mapUv),x.push(E.alphaMapUv),x.push(E.lightMapUv),x.push(E.aoMapUv),x.push(E.bumpMapUv),x.push(E.normalMapUv),x.push(E.displacementMapUv),x.push(E.emissiveMapUv),x.push(E.metalnessMapUv),x.push(E.roughnessMapUv),x.push(E.anisotropyMapUv),x.push(E.clearcoatMapUv),x.push(E.clearcoatNormalMapUv),x.push(E.clearcoatRoughnessMapUv),x.push(E.iridescenceMapUv),x.push(E.iridescenceThicknessMapUv),x.push(E.sheenColorMapUv),x.push(E.sheenRoughnessMapUv),x.push(E.specularMapUv),x.push(E.specularColorMapUv),x.push(E.specularIntensityMapUv),x.push(E.transmissionMapUv),x.push(E.thicknessMapUv),x.push(E.combine),x.push(E.fogExp2),x.push(E.sizeAttenuation),x.push(E.morphTargetsCount),x.push(E.morphAttributeCount),x.push(E.numSunLights),x.push(E.numDirLights),x.push(E.numPointLights),x.push(E.numSpotLights),x.push(E.numSpotLightMaps),x.push(E.numHemiLights),x.push(E.numRectAreaLights),x.push(E.numSunLightShadows),x.push(E.numDirLightShadows),x.push(E.numPointLightShadows),x.push(E.numSpotLightShadows),x.push(E.numSpotLightShadowsWithMaps),x.push(E.numLightProbes),x.push(E.shadowMapType),x.push(E.toneMapping),x.push(E.numClippingPlanes),x.push(E.numClipIntersection),x.push(E.depthPacking)}function M(x,E){r.disableAll(),E.instancing&&r.enable(0),E.instancingColor&&r.enable(1),E.instancingMorph&&r.enable(2),E.matcap&&r.enable(3),E.envMap&&r.enable(4),E.normalMapObjectSpace&&r.enable(5),E.normalMapTangentSpace&&r.enable(6),E.clearcoat&&r.enable(7),E.iridescence&&r.enable(8),E.alphaTest&&r.enable(9),E.vertexColors&&r.enable(10),E.vertexAlphas&&r.enable(11),E.vertexUv1s&&r.enable(12),E.vertexUv2s&&r.enable(13),E.vertexUv3s&&r.enable(14),E.vertexTangents&&r.enable(15),E.anisotropy&&r.enable(16),E.alphaHash&&r.enable(17),E.batching&&r.enable(18),E.dispersion&&r.enable(19),E.retroreflection&&r.enable(24),E.batchingColor&&r.enable(20),E.gradientMap&&r.enable(21),E.packedNormalMap&&r.enable(22),E.vertexNormals&&r.enable(23),x.push(r.mask),r.disableAll(),E.fog&&r.enable(0),E.useFog&&r.enable(1),E.flatShading&&r.enable(2),E.logarithmicDepthBuffer&&r.enable(3),E.reversedDepthBuffer&&r.enable(4),E.skinning&&r.enable(5),E.morphTargets&&r.enable(6),E.morphNormals&&r.enable(7),E.morphColors&&r.enable(8),E.premultipliedAlpha&&r.enable(9),E.shadowMapEnabled&&r.enable(10),E.doubleSided&&r.enable(11),E.flipSided&&r.enable(12),E.useDepthPacking&&r.enable(13),E.dithering&&r.enable(14),E.transmission&&r.enable(15),E.sheen&&r.enable(16),E.opaque&&r.enable(17),E.pointsUvs&&r.enable(18),E.decodeVideoTexture&&r.enable(19),E.decodeVideoTextureEmissive&&r.enable(20),E.alphaToCoverage&&r.enable(21),E.numLightProbeGrids>0&&r.enable(22),E.hasPositionAttribute&&r.enable(23),x.push(r.mask)}function A(x){let E=f[x.type],P;if(E){let N=sn[E];P=Ro.clone(N.uniforms)}else P=x.uniforms;return P}function b(x,E){let P=h.get(E);return P!==void 0?++P.usedTimes:(P=new Rv(n,E,x,s),c.push(P),h.set(E,P)),P}function w(x){if(--x.usedTimes===0){let E=c.indexOf(x);c[E]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function S(x){o.remove(x)}function R(){o.dispose()}return{getParameters:_,getProgramCacheKey:p,getUniforms:A,acquireProgram:b,releaseProgram:w,releaseShaderCache:S,programs:c,dispose:R}}function Lv(){let n=new WeakMap;function t(r){return n.has(r)}function e(r){let o=n.get(r);return o===void 0&&(o={},n.set(r,o)),o}function i(r){n.delete(r)}function s(r,o,l){n.get(r)[o]=l}function a(){n=new WeakMap}return{has:t,get:e,remove:i,update:s,dispose:a}}function Dv(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.materialVariant!==t.materialVariant?n.materialVariant-t.materialVariant:n.z!==t.z?n.z-t.z:n.id-t.id}function id(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function nd(){let n=[],t=0,e=[],i=[],s=[];function a(){t=0,e.length=0,i.length=0,s.length=0}function r(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,g,_,p,m){let M=n[t];return M===void 0?(M={id:u.id,object:u,geometry:f,material:g,materialVariant:r(u),groupOrder:_,renderOrder:u.renderOrder,z:p,group:m},n[t]=M):(M.id=u.id,M.object=u,M.geometry=f,M.material=g,M.materialVariant=r(u),M.groupOrder=_,M.renderOrder=u.renderOrder,M.z=p,M.group=m),t++,M}function l(u,f,g,_,p,m,M){M.reversedDepth===!0&&(p=-p);let A=o(u,f,g,_,p,m);g.transmission>0?i.push(A):g.transparent===!0?s.push(A):e.push(A)}function c(u,f,g,_,p,m){let M=o(u,f,g,_,p,m);g.transmission>0?i.unshift(M):g.transparent===!0?s.unshift(M):e.unshift(M)}function h(u,f){e.length>1&&e.sort(u||Dv),i.length>1&&i.sort(f||id),s.length>1&&s.sort(f||id)}function d(){for(let u=t,f=n.length;u<f;u++){let g=n[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:i,transparent:s,init:a,push:l,unshift:c,finish:d,sort:h}}function Fv(){let n=new WeakMap;function t(i,s){let a=n.get(i),r;return a===void 0?(r=new nd,n.set(i,[r])):s>=a.length?(r=new nd,a.push(r)):r=a[s],r}function e(){n=new WeakMap}return{get:t,dispose:e}}function Nv(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new I,color:new Xt};break;case"SpotLight":e={position:new I,direction:new I,color:new Xt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new I,color:new Xt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new I,skyColor:new Xt,groundColor:new Xt};break;case"RectAreaLight":e={color:new Xt,position:new I,halfWidth:new I,halfHeight:new I};break}return n[t.id]=e,e}}}function kv(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new jt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new jt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new jt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}var Uv=0;function Ov(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function Bv(n){let t=new Nv,e=kv(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new I);let s=new I,a=new he,r=new he;function o(c){let h=0,d=0,u=0;for(let B=0;B<9;B++)i.probe[B].set(0,0,0);let f=0,g=0,_=0,p=0,m=0,M=0,A=0,b=0,w=0,S=0,R=0,x=0,E=0,P=0;c.sort(Ov);for(let B=0,V=c.length;B<V;B++){let L=c[B],U=L.color,$=L.intensity,K=L.distance,ot=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===Nn?ot=L.shadow.map.texture:ot=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)h+=U.r*$,d+=U.g*$,u+=U.b*$;else if(L.isLightProbe){for(let j=0;j<9;j++)i.probe[j].addScaledVector(L.sh.coefficients[j],$);P++}else if(L.isSunLight){let j=t.get(L);if(j.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let it=L.shadow,Z=e.get(L);Z.shadowIntensity=it.intensity,Z.shadowBias=it.bias,Z.shadowNormalBias=it.normalBias,Z.shadowRadius=it.radius,Z.shadowMapSize.copy(it.mapSize).multiply(it.getFrameExtents()),i.sunShadow[g]=Z,i.sunShadowMap[g]=ot;let ct=it.getViewportCount();for(let At=0;At<ct;At++)i.sunShadowMatrix[_+At]=it.getMatrix(At),i.sunShadowCascade[_+At]=it._cascadeData[At];_+=ct,g++}i.sun[f]=j,f++}else if(L.isDirectionalLight){let j=t.get(L);if(j.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let it=L.shadow,Z=e.get(L);Z.shadowIntensity=it.intensity,Z.shadowBias=it.bias,Z.shadowNormalBias=it.normalBias,Z.shadowRadius=it.radius,Z.shadowMapSize=it.mapSize,i.directionalShadow[p]=Z,i.directionalShadowMap[p]=ot,i.directionalShadowMatrix[p]=L.shadow.matrix,w++}i.directional[p]=j,p++}else if(L.isSpotLight){let j=t.get(L);j.position.setFromMatrixPosition(L.matrixWorld),j.color.copy(U).multiplyScalar($),j.distance=K,j.coneCos=Math.cos(L.angle),j.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),j.decay=L.decay,i.spot[M]=j;let it=L.shadow;if(L.map&&(i.spotLightMap[x]=L.map,x++,it.updateMatrices(L),L.castShadow&&E++),i.spotLightMatrix[M]=it.matrix,L.castShadow){let Z=e.get(L);Z.shadowIntensity=it.intensity,Z.shadowBias=it.bias,Z.shadowNormalBias=it.normalBias,Z.shadowRadius=it.radius,Z.shadowMapSize=it.mapSize,i.spotShadow[M]=Z,i.spotShadowMap[M]=ot,R++}M++}else if(L.isRectAreaLight){let j=t.get(L);j.color.copy(U).multiplyScalar($),j.halfWidth.set(L.width*.5,0,0),j.halfHeight.set(0,L.height*.5,0),i.rectArea[A]=j,A++}else if(L.isPointLight){let j=t.get(L);if(j.color.copy(L.color).multiplyScalar(L.intensity),j.distance=L.distance,j.decay=L.decay,L.castShadow){let it=L.shadow,Z=e.get(L);Z.shadowIntensity=it.intensity,Z.shadowBias=it.bias,Z.shadowNormalBias=it.normalBias,Z.shadowRadius=it.radius,Z.shadowMapSize=it.mapSize,Z.shadowCameraNear=it.camera.near,Z.shadowCameraFar=it.camera.far,i.pointShadow[m]=Z,i.pointShadowMap[m]=ot,i.pointShadowMatrix[m]=L.shadow.matrix,S++}i.point[m]=j,m++}else if(L.isHemisphereLight){let j=t.get(L);j.skyColor.copy(L.color).multiplyScalar($),j.groundColor.copy(L.groundColor).multiplyScalar($),i.hemi[b]=j,b++}}A>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=xt.LTC_FLOAT_1,i.rectAreaLTC2=xt.LTC_FLOAT_2):(i.rectAreaLTC1=xt.LTC_HALF_1,i.rectAreaLTC2=xt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;let N=i.hash;(N.sunLength!==f||N.directionalLength!==p||N.pointLength!==m||N.spotLength!==M||N.rectAreaLength!==A||N.hemiLength!==b||N.numSunShadows!==g||N.numDirectionalShadows!==w||N.numPointShadows!==S||N.numSpotShadows!==R||N.numSpotMaps!==x||N.numLightProbes!==P)&&(i.sun.length=f,i.directional.length=p,i.spot.length=M,i.rectArea.length=A,i.point.length=m,i.hemi.length=b,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=_,i.sunShadowCascade.length=_,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.directionalShadowMatrix.length=w,i.pointShadow.length=S,i.pointShadowMap.length=S,i.pointShadowMatrix.length=S,i.spotShadow.length=R,i.spotShadowMap.length=R,i.spotLightMatrix.length=R+x-E,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=P,N.sunLength=f,N.directionalLength=p,N.pointLength=m,N.spotLength=M,N.rectAreaLength=A,N.hemiLength=b,N.numSunShadows=g,N.numDirectionalShadows=w,N.numPointShadows=S,N.numSpotShadows=R,N.numSpotMaps=x,N.numLightProbes=P,i.version=Uv++)}function l(c,h){let d=0,u=0,f=0,g=0,_=0,p=0,m=h.matrixWorldInverse;for(let M=0,A=c.length;M<A;M++){let b=c[M];if(b.isSunLight){let w=i.sun[d];w.direction.setFromMatrixPosition(b.matrixWorld),w.direction.transformDirection(m),d++}else if(b.isDirectionalLight){let w=i.directional[u];w.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(m),u++}else if(b.isSpotLight){let w=i.spot[g];w.position.setFromMatrixPosition(b.matrixWorld),w.position.applyMatrix4(m),w.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(m),g++}else if(b.isRectAreaLight){let w=i.rectArea[_];w.position.setFromMatrixPosition(b.matrixWorld),w.position.applyMatrix4(m),r.identity(),a.copy(b.matrixWorld),a.premultiply(m),r.extractRotation(a),w.halfWidth.set(b.width*.5,0,0),w.halfHeight.set(0,b.height*.5,0),w.halfWidth.applyMatrix4(r),w.halfHeight.applyMatrix4(r),_++}else if(b.isPointLight){let w=i.point[f];w.position.setFromMatrixPosition(b.matrixWorld),w.position.applyMatrix4(m),f++}else if(b.isHemisphereLight){let w=i.hemi[p];w.direction.setFromMatrixPosition(b.matrixWorld),w.direction.transformDirection(m),p++}}}return{setup:o,setupView:l,state:i}}function sd(n){let t=new Bv(n),e=[],i=[],s=[];function a(u){d.camera=u,e.length=0,i.length=0,s.length=0}function r(u){e.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){t.setup(e)}function h(u){t.setupView(e,u)}let d={lightsArray:e,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:c,setupLightsView:h,pushLight:r,pushShadow:o,pushLightProbeGrid:l}}function zv(n){let t=new WeakMap;function e(s,a=0){let r=t.get(s),o;return r===void 0?(o=new sd(n),t.set(s,[o])):a>=r.length?(o=new sd(n),r.push(o)):o=r[a],o}function i(){t=new WeakMap}return{get:e,dispose:i}}var Vv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Hv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Gv=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],Wv=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],ad=new he,wa=new I,Lc=new I;function qv(n,t,e){let i=new Ts,s=new jt,a=new jt,r=new we,o=new wr,l=new Er,c={},h=e.maxTextureSize,d={[In]:oi,[oi]:In,[Ne]:Ne},u=new ze({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new jt},radius:{value:4}},vertexShader:Vv,fragmentShader:Hv}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let g=new Be;g.setAttribute("position",new Oe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Lt(g,u),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Xn;let m=this.type;this.render=function(S,R,x){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;this.type===tu&&(Gt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Xn);let E=n.getRenderTarget(),P=n.getActiveCubeFace(),N=n.getActiveMipmapLevel(),B=n.state;B.setBlending(en),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);let V=m!==this.type;V&&R.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(U=>U.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,U=S.length;L<U;L++){let $=S[L],K=$.shadow;if(K===void 0){Gt("WebGLShadowMap:",$,"has no shadow.");continue}if(K.autoUpdate===!1&&K.needsUpdate===!1)continue;s.copy(K.mapSize);let ot=K.getFrameExtents();s.multiply(ot),a.copy(K.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(a.x=Math.floor(h/ot.x),s.x=a.x*ot.x,K.mapSize.x=a.x),s.y>h&&(a.y=Math.floor(h/ot.y),s.y=a.y*ot.y,K.mapSize.y=a.y));let j=n.state.buffers.depth.getReversed();if(K.camera._reversedDepth=j,K.map===null||V===!0){if(K.map!==null&&(K.map.depthTexture!==null&&(K.map.depthTexture.dispose(),K.map.depthTexture=null),K.map.dispose()),this.type===Rs){if($.isPointLight){Gt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}K.map=new Ze(s.x,s.y,{format:Nn,type:li,minFilter:ri,magFilter:ri,generateMipmaps:!1}),K.map.texture.name=$.name+".shadowMap",K.map.depthTexture=new Tn(s.x,s.y,Gi),K.map.depthTexture.name=$.name+".shadowMapDepth",K.map.depthTexture.format=Ki,K.map.depthTexture.compareFunction=null,K.map.depthTexture.minFilter=ei,K.map.depthTexture.magFilter=ei}else $.isPointLight?(K.map=new Lo(s.x),K.map.depthTexture=new Mr(s.x,Hi)):(K.map=new Ze(s.x,s.y),K.map.depthTexture=new Tn(s.x,s.y,Hi)),K.map.depthTexture.name=$.name+".shadowMap",K.map.depthTexture.format=Ki,this.type===Xn?(K.map.depthTexture.compareFunction=j?Ao:To,K.map.depthTexture.minFilter=ri,K.map.depthTexture.magFilter=ri):(K.map.depthTexture.compareFunction=null,K.map.depthTexture.minFilter=ei,K.map.depthTexture.magFilter=ei);K.camera.updateProjectionMatrix()}K.map.isWebGLCubeRenderTarget!==!0&&(K.map.width!==s.x||K.map.height!==s.y)&&K.map.setSize(s.x,s.y);let it=K.map.isWebGLCubeRenderTarget?6:K.getViewportCount();$.isPointLight!==!0&&K.updateMatrices($,x);for(let Z=0;Z<it;Z++){let ct=K.getCamera(Z);if($.isPointLight){let At=K.camera,zt=K.matrix,Vt=$.distance||At.far;Vt!==At.far&&(At.far=Vt,At.updateProjectionMatrix()),wa.setFromMatrixPosition($.matrixWorld),At.position.copy(wa),Lc.copy(At.position),Lc.add(Gv[Z]),At.up.copy(Wv[Z]),At.lookAt(Lc),At.updateMatrixWorld(),zt.makeTranslation(-wa.x,-wa.y,-wa.z),ad.multiplyMatrices(At.projectionMatrix,At.matrixWorldInverse),K._frustum.setFromProjectionMatrix(ad,At.coordinateSystem,At.reversedDepth)}if(K.map.isWebGLCubeRenderTarget)n.setRenderTarget(K.map,Z),n.clear();else{Z===0&&(n.setRenderTarget(K.map),n.clear());let At=K.getViewport(Z);r.set(a.x*At.x,a.y*At.y,a.x*At.z,a.y*At.w),B.viewport(r)}i=K.getFrustum(Z),b(R,x,ct,$,this.type)}K.isPointLightShadow!==!0&&this.type===Rs&&M(K,x),K.needsUpdate=!1}m=this.type,p.needsUpdate=!1,n.setRenderTarget(E,P,N)};function M(S,R){let x=t.update(_);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null?S.mapPass=new Ze(s.x,s.y,{format:Nn,type:li}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value.set(S.map.width,S.map.height),u.uniforms.radius.value=S.radius,n.setRenderTarget(S.mapPass),n.clear(),n.renderBufferDirect(R,null,x,u,_,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value.set(S.map.width,S.map.height),f.uniforms.radius.value=S.radius,n.setRenderTarget(S.map),n.clear(),n.renderBufferDirect(R,null,x,f,_,null)}function A(S,R,x,E){let P=null,N=x.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(N!==void 0)P=N;else if(P=x.isPointLight===!0?l:o,n.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let B=P.uuid,V=R.uuid,L=c[B];L===void 0&&(L={},c[B]=L);let U=L[V];U===void 0&&(U=P.clone(),L[V]=U,R.addEventListener("dispose",w)),P=U}if(P.visible=R.visible,P.wireframe=R.wireframe,E===Rs?P.side=R.shadowSide!==null?R.shadowSide:R.side:P.side=R.shadowSide!==null?R.shadowSide:d[R.side],P.alphaMap=R.alphaMap,P.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,P.map=R.map,P.clipShadows=R.clipShadows,P.clippingPlanes=R.clippingPlanes,P.clipIntersection=R.clipIntersection,P.displacementMap=R.displacementMap,P.displacementScale=R.displacementScale,P.displacementBias=R.displacementBias,P.wireframeLinewidth=R.wireframeLinewidth,P.linewidth=R.linewidth,x.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let B=n.properties.get(P);B.light=x}return P}function b(S,R,x,E,P){if(S.visible===!1)return;if(S.layers.test(R.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&P===Rs)&&(!S.frustumCulled||S.intersectsFrustum(i))){S.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,S.matrixWorld);let V=t.update(S),L=S.material;if(Array.isArray(L)){let U=V.groups;for(let $=0,K=U.length;$<K;$++){let ot=U[$],j=L[ot.materialIndex];if(j&&j.visible){let it=A(S,j,E,P);S.onBeforeShadow(n,S,R,x,V,it,ot),n.renderBufferDirect(x,null,V,it,S,ot),S.onAfterShadow(n,S,R,x,V,it,ot)}}}else if(L.visible){let U=A(S,L,E,P);S.onBeforeShadow(n,S,R,x,V,U,null),n.renderBufferDirect(x,null,V,U,S,null),S.onAfterShadow(n,S,R,x,V,U,null)}}let B=S.children;for(let V=0,L=B.length;V<L;V++)b(B[V],R,x,E,P)}function w(S){S.target.removeEventListener("dispose",w);for(let x in c){let E=c[x],P=S.target.uuid;P in E&&(E[P].dispose(),delete E[P])}}}function Xv(n,t){function e(){let O=!1,gt=new we,nt=null,vt=new we(0,0,0,0);return{setMask:function(Mt){nt!==Mt&&!O&&(n.colorMask(Mt,Mt,Mt,Mt),nt=Mt)},setLocked:function(Mt){O=Mt},setClear:function(Mt,lt,Ut,It,Re){Re===!0&&(Mt*=It,lt*=It,Ut*=It),gt.set(Mt,lt,Ut,It),vt.equals(gt)===!1&&(n.clearColor(Mt,lt,Ut,It),vt.copy(gt))},reset:function(){O=!1,nt=null,vt.set(-1,0,0,0)}}}function i(){let O=!1,gt=!1,nt=null,vt=null,Mt=null;return{setReversed:function(lt){if(gt!==lt){let Ut=t.get("EXT_clip_control");lt?Ut.clipControlEXT(Ut.LOWER_LEFT_EXT,Ut.ZERO_TO_ONE_EXT):Ut.clipControlEXT(Ut.LOWER_LEFT_EXT,Ut.NEGATIVE_ONE_TO_ONE_EXT),gt=lt;let It=Mt;Mt=null,this.setClear(It)}},getReversed:function(){return gt},setTest:function(lt){lt?rt(n.DEPTH_TEST):Rt(n.DEPTH_TEST)},setMask:function(lt){nt!==lt&&!O&&(n.depthMask(lt),nt=lt)},setFunc:function(lt){if(gt&&(lt=Nu[lt]),vt!==lt){switch(lt){case cr:n.depthFunc(n.NEVER);break;case hr:n.depthFunc(n.ALWAYS);break;case ur:n.depthFunc(n.LESS);break;case xs:n.depthFunc(n.LEQUAL);break;case dr:n.depthFunc(n.EQUAL);break;case fr:n.depthFunc(n.GEQUAL);break;case pr:n.depthFunc(n.GREATER);break;case mr:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}vt=lt}},setLocked:function(lt){O=lt},setClear:function(lt){Mt!==lt&&(Mt=lt,gt&&(lt=1-lt),n.clearDepth(lt))},reset:function(){O=!1,nt=null,vt=null,Mt=null,gt=!1}}}function s(){let O=!1,gt=null,nt=null,vt=null,Mt=null,lt=null,Ut=null,It=null,Re=null;return{setTest:function(me){O||(me?rt(n.STENCIL_TEST):Rt(n.STENCIL_TEST))},setMask:function(me){gt!==me&&!O&&(n.stencilMask(me),gt=me)},setFunc:function(me,Ui,Zi){(nt!==me||vt!==Ui||Mt!==Zi)&&(n.stencilFunc(me,Ui,Zi),nt=me,vt=Ui,Mt=Zi)},setOp:function(me,Ui,Zi){(lt!==me||Ut!==Ui||It!==Zi)&&(n.stencilOp(me,Ui,Zi),lt=me,Ut=Ui,It=Zi)},setLocked:function(me){O=me},setClear:function(me){Re!==me&&(n.clearStencil(me),Re=me)},reset:function(){O=!1,gt=null,nt=null,vt=null,Mt=null,lt=null,Ut=null,It=null,Re=null}}}let a=new e,r=new i,o=new s,l=new WeakMap,c=new WeakMap,h={},d={},u={},f=new WeakMap,g=[],_=null,p=!1,m=null,M=null,A=null,b=null,w=null,S=null,R=null,x=new Xt(0,0,0),E=0,P=!1,N=null,B=null,V=null,L=null,U=null,$=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),K=!1,ot=0,j=n.getParameter(n.VERSION);j.indexOf("WebGL")!==-1?(ot=parseFloat(/^WebGL (\d)/.exec(j)[1]),K=ot>=1):j.indexOf("OpenGL ES")!==-1&&(ot=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),K=ot>=2);let it=null,Z={},ct=n.getParameter(n.SCISSOR_BOX),At=n.getParameter(n.VIEWPORT),zt=new we().fromArray(ct),Vt=new we().fromArray(At);function qt(O,gt,nt,vt){let Mt=new Uint8Array(4),lt=n.createTexture();n.bindTexture(O,lt),n.texParameteri(O,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(O,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ut=0;Ut<nt;Ut++)O===n.TEXTURE_3D||O===n.TEXTURE_2D_ARRAY?n.texImage3D(gt,0,n.RGBA,1,1,vt,0,n.RGBA,n.UNSIGNED_BYTE,Mt):n.texImage2D(gt+Ut,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Mt);return lt}let Q={};Q[n.TEXTURE_2D]=qt(n.TEXTURE_2D,n.TEXTURE_2D,1),Q[n.TEXTURE_CUBE_MAP]=qt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Q[n.TEXTURE_2D_ARRAY]=qt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Q[n.TEXTURE_3D]=qt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),a.setClear(0,0,0,1),r.setClear(1),o.setClear(0),rt(n.DEPTH_TEST),r.setFunc(xs),oe(!1),Fe(Jl),rt(n.CULL_FACE),fe(en);function rt(O){h[O]!==!0&&(n.enable(O),h[O]=!0)}function Rt(O){h[O]!==!1&&(n.disable(O),h[O]=!1)}function $t(O,gt){return u[O]!==gt?(n.bindFramebuffer(O,gt),u[O]=gt,O===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=gt),O===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=gt),!0):!1}function Et(O,gt){let nt=g,vt=!1;if(O){nt=f.get(gt),nt===void 0&&(nt=[],f.set(gt,nt));let Mt=O.textures;if(nt.length!==Mt.length||nt[0]!==n.COLOR_ATTACHMENT0){for(let lt=0,Ut=Mt.length;lt<Ut;lt++)nt[lt]=n.COLOR_ATTACHMENT0+lt;nt.length=Mt.length,vt=!0}}else nt[0]!==n.BACK&&(nt[0]=n.BACK,vt=!0);vt&&n.drawBuffers(nt)}function se(O){return _!==O?(n.useProgram(O),_=O,!0):!1}let $e={[Yn]:n.FUNC_ADD,[iu]:n.FUNC_SUBTRACT,[nu]:n.FUNC_REVERSE_SUBTRACT};$e[su]=n.MIN,$e[au]=n.MAX;let ae={[ru]:n.ZERO,[ou]:n.ONE,[lu]:n.SRC_COLOR,[Kl]:n.SRC_ALPHA,[pu]:n.SRC_ALPHA_SATURATE,[du]:n.DST_COLOR,[hu]:n.DST_ALPHA,[cu]:n.ONE_MINUS_SRC_COLOR,[Ql]:n.ONE_MINUS_SRC_ALPHA,[fu]:n.ONE_MINUS_DST_COLOR,[uu]:n.ONE_MINUS_DST_ALPHA,[mu]:n.CONSTANT_COLOR,[gu]:n.ONE_MINUS_CONSTANT_COLOR,[vu]:n.CONSTANT_ALPHA,[_u]:n.ONE_MINUS_CONSTANT_ALPHA};function fe(O,gt,nt,vt,Mt,lt,Ut,It,Re,me){if(O===en){p===!0&&(Rt(n.BLEND),p=!1);return}if(p===!1&&(rt(n.BLEND),p=!0),O!==eu){if(O!==m||me!==P){if((M!==Yn||w!==Yn)&&(n.blendEquation(n.FUNC_ADD),M=Yn,w=Yn),me)switch(O){case Cs:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case fa:n.blendFunc(n.ONE,n.ONE);break;case $l:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case jl:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Ht("WebGLState: Invalid blending: ",O);break}else switch(O){case Cs:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case fa:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case $l:Ht("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case jl:Ht("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ht("WebGLState: Invalid blending: ",O);break}A=null,b=null,S=null,R=null,x.set(0,0,0),E=0,m=O,P=me}return}Mt=Mt||gt,lt=lt||nt,Ut=Ut||vt,(gt!==M||Mt!==w)&&(n.blendEquationSeparate($e[gt],$e[Mt]),M=gt,w=Mt),(nt!==A||vt!==b||lt!==S||Ut!==R)&&(n.blendFuncSeparate(ae[nt],ae[vt],ae[lt],ae[Ut]),A=nt,b=vt,S=lt,R=Ut),(It.equals(x)===!1||Re!==E)&&(n.blendColor(It.r,It.g,It.b,Re),x.copy(It),E=Re),m=O,P=!1}function Ae(O,gt){O.side===Ne?Rt(n.CULL_FACE):rt(n.CULL_FACE);let nt=O.side===oi;gt&&(nt=!nt),oe(nt),O.blending===Cs&&O.transparent===!1?fe(en):fe(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),r.setFunc(O.depthFunc),r.setTest(O.depthTest),r.setMask(O.depthWrite),a.setMask(O.colorWrite);let vt=O.stencilWrite;o.setTest(vt),vt&&(o.setMask(O.stencilWriteMask),o.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),o.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),_i(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?rt(n.SAMPLE_ALPHA_TO_COVERAGE):Rt(n.SAMPLE_ALPHA_TO_COVERAGE)}function oe(O){N!==O&&(O?n.frontFace(n.CW):n.frontFace(n.CCW),N=O)}function Fe(O){O!==Kh?(rt(n.CULL_FACE),O!==B&&(O===Jl?n.cullFace(n.BACK):O===Qh?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Rt(n.CULL_FACE),B=O}function Qe(O){O!==V&&(K&&n.lineWidth(O),V=O)}function _i(O,gt,nt){O?(rt(n.POLYGON_OFFSET_FILL),(L!==gt||U!==nt)&&(L=gt,U=nt,r.getReversed()&&(gt=-gt),n.polygonOffset(gt,nt))):Rt(n.POLYGON_OFFSET_FILL)}function Ue(O){O?rt(n.SCISSOR_TEST):Rt(n.SCISSOR_TEST)}function qe(O){O===void 0&&(O=n.TEXTURE0+$-1),it!==O&&(n.activeTexture(O),it=O)}function z(O,gt,nt){nt===void 0&&(it===null?nt=n.TEXTURE0+$-1:nt=it);let vt=Z[nt];vt===void 0&&(vt={type:void 0,texture:void 0},Z[nt]=vt),(vt.type!==O||vt.texture!==gt)&&(it!==nt&&(n.activeTexture(nt),it=nt),n.bindTexture(O,gt||Q[O]),vt.type=O,vt.texture=gt)}function ci(){let O=Z[it];O!==void 0&&O.type!==void 0&&(n.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function _e(){try{n.compressedTexImage2D(...arguments)}catch(O){Ht("WebGLState:",O)}}function T(){try{n.compressedTexImage3D(...arguments)}catch(O){Ht("WebGLState:",O)}}function v(){try{n.texSubImage2D(...arguments)}catch(O){Ht("WebGLState:",O)}}function H(){try{n.texSubImage3D(...arguments)}catch(O){Ht("WebGLState:",O)}}function Y(){try{n.compressedTexSubImage2D(...arguments)}catch(O){Ht("WebGLState:",O)}}function tt(){try{n.compressedTexSubImage3D(...arguments)}catch(O){Ht("WebGLState:",O)}}function dt(){try{n.texStorage2D(...arguments)}catch(O){Ht("WebGLState:",O)}}function ft(){try{n.texStorage3D(...arguments)}catch(O){Ht("WebGLState:",O)}}function et(){try{n.texImage2D(...arguments)}catch(O){Ht("WebGLState:",O)}}function st(){try{n.texImage3D(...arguments)}catch(O){Ht("WebGLState:",O)}}function pt(O){return d[O]!==void 0?d[O]:n.getParameter(O)}function Nt(O,gt){d[O]!==gt&&(n.pixelStorei(O,gt),d[O]=gt)}function _t(O){zt.equals(O)===!1&&(n.scissor(O.x,O.y,O.z,O.w),zt.copy(O))}function mt(O){Vt.equals(O)===!1&&(n.viewport(O.x,O.y,O.z,O.w),Vt.copy(O))}function kt(O,gt){let nt=c.get(gt);nt===void 0&&(nt=new WeakMap,c.set(gt,nt));let vt=nt.get(O);vt===void 0&&(vt=n.getUniformBlockIndex(gt,O.name),nt.set(O,vt))}function Bt(O,gt){let vt=c.get(gt).get(O);l.get(gt)!==vt&&(n.uniformBlockBinding(gt,vt,O.__bindingPointIndex),l.set(gt,vt))}function Qt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),r.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),h={},d={},it=null,Z={},u={},f=new WeakMap,g=[],_=null,p=!1,m=null,M=null,A=null,b=null,w=null,S=null,R=null,x=new Xt(0,0,0),E=0,P=!1,N=null,B=null,V=null,L=null,U=null,zt.set(0,0,n.canvas.width,n.canvas.height),Vt.set(0,0,n.canvas.width,n.canvas.height),a.reset(),r.reset(),o.reset()}return{buffers:{color:a,depth:r,stencil:o},enable:rt,disable:Rt,bindFramebuffer:$t,drawBuffers:Et,useProgram:se,setBlending:fe,setMaterial:Ae,setFlipSided:oe,setCullFace:Fe,setLineWidth:Qe,setPolygonOffset:_i,setScissorTest:Ue,activeTexture:qe,bindTexture:z,unbindTexture:ci,compressedTexImage2D:_e,compressedTexImage3D:T,texImage2D:et,texImage3D:st,pixelStorei:Nt,getParameter:pt,updateUBOMapping:kt,uniformBlockBinding:Bt,texStorage2D:dt,texStorage3D:ft,texSubImage2D:v,texSubImage3D:H,compressedTexSubImage2D:Y,compressedTexSubImage3D:tt,scissor:_t,viewport:mt,reset:Qt}}function Yv(n,t,e,i,s,a,r){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new jt,h=new WeakMap,d=new Set,u,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(T,v){return g?new OffscreenCanvas(T,v):$s("canvas")}function p(T,v,H){let Y=1,tt=_e(T);if((tt.width>H||tt.height>H)&&(Y=H/Math.max(tt.width,tt.height)),Y<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let dt=Math.floor(Y*tt.width),ft=Math.floor(Y*tt.height);u===void 0&&(u=_(dt,ft));let et=v?_(dt,ft):u;return et.width=dt,et.height=ft,et.getContext("2d").drawImage(T,0,0,dt,ft),Gt("WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+dt+"x"+ft+")."),et}else return"data"in T&&Gt("WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),T;return T}function m(T){return T.generateMipmaps}function M(T){n.generateMipmap(T)}function A(T){return T.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?n.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function b(T,v,H,Y,tt,dt=!1){if(T!==null){if(n[T]!==void 0)return n[T];Gt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let ft;Y&&(ft=t.get("EXT_texture_norm16"),ft||Gt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let et=v;if(v===n.RED&&(H===n.FLOAT&&(et=n.R32F),H===n.HALF_FLOAT&&(et=n.R16F),H===n.UNSIGNED_BYTE&&(et=n.R8),H===n.UNSIGNED_SHORT&&ft&&(et=ft.R16_EXT),H===n.SHORT&&ft&&(et=ft.R16_SNORM_EXT)),v===n.RED_INTEGER&&(H===n.UNSIGNED_BYTE&&(et=n.R8UI),H===n.UNSIGNED_SHORT&&(et=n.R16UI),H===n.UNSIGNED_INT&&(et=n.R32UI),H===n.BYTE&&(et=n.R8I),H===n.SHORT&&(et=n.R16I),H===n.INT&&(et=n.R32I)),v===n.RG&&(H===n.FLOAT&&(et=n.RG32F),H===n.HALF_FLOAT&&(et=n.RG16F),H===n.UNSIGNED_BYTE&&(et=n.RG8),H===n.UNSIGNED_SHORT&&ft&&(et=ft.RG16_EXT),H===n.SHORT&&ft&&(et=ft.RG16_SNORM_EXT)),v===n.RG_INTEGER&&(H===n.UNSIGNED_BYTE&&(et=n.RG8UI),H===n.UNSIGNED_SHORT&&(et=n.RG16UI),H===n.UNSIGNED_INT&&(et=n.RG32UI),H===n.BYTE&&(et=n.RG8I),H===n.SHORT&&(et=n.RG16I),H===n.INT&&(et=n.RG32I)),v===n.RGB_INTEGER&&(H===n.UNSIGNED_BYTE&&(et=n.RGB8UI),H===n.UNSIGNED_SHORT&&(et=n.RGB16UI),H===n.UNSIGNED_INT&&(et=n.RGB32UI),H===n.BYTE&&(et=n.RGB8I),H===n.SHORT&&(et=n.RGB16I),H===n.INT&&(et=n.RGB32I)),v===n.RGBA_INTEGER&&(H===n.UNSIGNED_BYTE&&(et=n.RGBA8UI),H===n.UNSIGNED_SHORT&&(et=n.RGBA16UI),H===n.UNSIGNED_INT&&(et=n.RGBA32UI),H===n.BYTE&&(et=n.RGBA8I),H===n.SHORT&&(et=n.RGBA16I),H===n.INT&&(et=n.RGBA32I)),v===n.RGB&&(H===n.UNSIGNED_SHORT&&ft&&(et=ft.RGB16_EXT),H===n.SHORT&&ft&&(et=ft.RGB16_SNORM_EXT),H===n.UNSIGNED_INT_5_9_9_9_REV&&(et=n.RGB9_E5),H===n.UNSIGNED_INT_10F_11F_11F_REV&&(et=n.R11F_G11F_B10F)),v===n.RGBA){let st=dt?Js:le.getTransfer(tt);H===n.FLOAT&&(et=n.RGBA32F),H===n.HALF_FLOAT&&(et=n.RGBA16F),H===n.UNSIGNED_BYTE&&(et=st===ve?n.SRGB8_ALPHA8:n.RGBA8),H===n.UNSIGNED_SHORT&&ft&&(et=ft.RGBA16_EXT),H===n.SHORT&&ft&&(et=ft.RGBA16_SNORM_EXT),H===n.UNSIGNED_SHORT_4_4_4_4&&(et=n.RGBA4),H===n.UNSIGNED_SHORT_5_5_5_1&&(et=n.RGB5_A1)}return(et===n.R16F||et===n.R32F||et===n.RG16F||et===n.RG32F||et===n.RGBA16F||et===n.RGBA32F)&&t.get("EXT_color_buffer_float"),et}function w(T,v){let H;return T?v===null||v===Hi||v===Is?H=n.DEPTH24_STENCIL8:v===Gi?H=n.DEPTH32F_STENCIL8:v===Ps&&(H=n.DEPTH24_STENCIL8,Gt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Hi||v===Is?H=n.DEPTH_COMPONENT24:v===Gi?H=n.DEPTH_COMPONENT32F:v===Ps&&(H=n.DEPTH_COMPONENT16),H}function S(T,v){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==ei&&T.minFilter!==ri?Math.log2(Math.max(v.width,v.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?v.mipmaps.length:1}function R(T){let v=T.target;v.removeEventListener("dispose",R),E(v),v.isVideoTexture&&h.delete(v),v.isHTMLTexture&&d.delete(v)}function x(T){let v=T.target;v.removeEventListener("dispose",x),N(v)}function E(T){let v=i.get(T);if(v.__webglInit===void 0)return;let H=T.source,Y=f.get(H);if(Y){let tt=Y[v.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&P(T),Object.keys(Y).length===0&&f.delete(H)}i.remove(T)}function P(T){let v=i.get(T);n.deleteTexture(v.__webglTexture);let H=T.source,Y=f.get(H);delete Y[v.__cacheKey],r.memory.textures--}function N(T){let v=i.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),i.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(v.__webglFramebuffer[Y]))for(let tt=0;tt<v.__webglFramebuffer[Y].length;tt++)n.deleteFramebuffer(v.__webglFramebuffer[Y][tt]);else n.deleteFramebuffer(v.__webglFramebuffer[Y]);v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer[Y])}else{if(Array.isArray(v.__webglFramebuffer))for(let Y=0;Y<v.__webglFramebuffer.length;Y++)n.deleteFramebuffer(v.__webglFramebuffer[Y]);else n.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&n.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let Y=0;Y<v.__webglColorRenderbuffer.length;Y++)v.__webglColorRenderbuffer[Y]&&n.deleteRenderbuffer(v.__webglColorRenderbuffer[Y]);v.__webglDepthRenderbuffer&&n.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let H=T.textures;for(let Y=0,tt=H.length;Y<tt;Y++){let dt=i.get(H[Y]);dt.__webglTexture&&(n.deleteTexture(dt.__webglTexture),r.memory.textures--),i.remove(H[Y])}i.remove(T)}let B=0;function V(){B=0}function L(){return B}function U(T){B=T}function $(){let T=B;return T>=s.maxTextures&&Gt("WebGLTextures: Trying to use "+(T+1)+" texture units while this GPU supports only "+s.maxTextures),B+=1,T}function K(T){let v=[];return v.push(T.wrapS),v.push(T.wrapT),v.push(T.wrapR||0),v.push(T.magFilter),v.push(T.minFilter),v.push(T.anisotropy),v.push(T.internalFormat),v.push(T.format),v.push(T.type),v.push(T.generateMipmaps),v.push(T.premultiplyAlpha),v.push(T.flipY),v.push(T.unpackAlignment),v.push(T.colorSpace),v.join()}function ot(T,v){let H=i.get(T);if(T.isVideoTexture&&z(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&H.__version!==T.version){let Y=T.image;if(Y===null)Gt("WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)Gt("WebGLRenderer: Texture marked for update but image is incomplete");else{Rt(H,T,v);return}}else T.isExternalTexture&&(H.__webglTexture=T.sourceTexture?T.sourceTexture:null);e.bindTexture(n.TEXTURE_2D,H.__webglTexture,n.TEXTURE0+v)}function j(T,v){let H=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&H.__version!==T.version){Rt(H,T,v);return}else T.isExternalTexture&&(H.__webglTexture=T.sourceTexture?T.sourceTexture:null);e.bindTexture(n.TEXTURE_2D_ARRAY,H.__webglTexture,n.TEXTURE0+v)}function it(T,v){let H=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&H.__version!==T.version){Rt(H,T,v);return}e.bindTexture(n.TEXTURE_3D,H.__webglTexture,n.TEXTURE0+v)}function Z(T,v){let H=i.get(T);if(T.isCubeDepthTexture!==!0&&T.version>0&&H.__version!==T.version){$t(H,T,v);return}e.bindTexture(n.TEXTURE_CUBE_MAP,H.__webglTexture,n.TEXTURE0+v)}let ct={[ji]:n.REPEAT,[Di]:n.CLAMP_TO_EDGE,[gr]:n.MIRRORED_REPEAT},At={[ei]:n.NEAREST,[bu]:n.NEAREST_MIPMAP_NEAREST,[ma]:n.NEAREST_MIPMAP_LINEAR,[ri]:n.LINEAR,[Vr]:n.LINEAR_MIPMAP_NEAREST,[Dn]:n.LINEAR_MIPMAP_LINEAR},zt={[Eu]:n.NEVER,[Pu]:n.ALWAYS,[Tu]:n.LESS,[To]:n.LEQUAL,[Au]:n.EQUAL,[Ao]:n.GEQUAL,[Ru]:n.GREATER,[Cu]:n.NOTEQUAL};function Vt(T,v){if(v.type===Gi&&t.has("OES_texture_float_linear")===!1&&(v.magFilter===ri||v.magFilter===Vr||v.magFilter===ma||v.magFilter===Dn||v.minFilter===ri||v.minFilter===Vr||v.minFilter===ma||v.minFilter===Dn)&&Gt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(T,n.TEXTURE_WRAP_S,ct[v.wrapS]),n.texParameteri(T,n.TEXTURE_WRAP_T,ct[v.wrapT]),(T===n.TEXTURE_3D||T===n.TEXTURE_2D_ARRAY)&&n.texParameteri(T,n.TEXTURE_WRAP_R,ct[v.wrapR]),n.texParameteri(T,n.TEXTURE_MAG_FILTER,At[v.magFilter]),n.texParameteri(T,n.TEXTURE_MIN_FILTER,At[v.minFilter]),v.compareFunction&&(n.texParameteri(T,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(T,n.TEXTURE_COMPARE_FUNC,zt[v.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===ei||v.minFilter!==ma&&v.minFilter!==Dn||v.type===Gi&&t.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||i.get(v).__currentAnisotropy){let H=t.get("EXT_texture_filter_anisotropic");n.texParameterf(T,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),i.get(v).__currentAnisotropy=v.anisotropy}}}function qt(T,v){let H=!1;T.__webglInit===void 0&&(T.__webglInit=!0,v.addEventListener("dispose",R));let Y=v.source,tt=f.get(Y);tt===void 0&&(tt={},f.set(Y,tt));let dt=K(v);if(dt!==T.__cacheKey){tt[dt]===void 0&&(tt[dt]={texture:n.createTexture(),usedTimes:0},r.memory.textures++,H=!0),tt[dt].usedTimes++;let ft=tt[T.__cacheKey];ft!==void 0&&(tt[T.__cacheKey].usedTimes--,ft.usedTimes===0&&P(v)),T.__cacheKey=dt,T.__webglTexture=tt[dt].texture}return H}function Q(T,v,H){return Math.floor(Math.floor(T/H)/v)}function rt(T,v,H,Y){let dt=T.updateRanges;if(dt.length===0)e.texSubImage2D(n.TEXTURE_2D,0,0,0,v.width,v.height,H,Y,v.data);else{dt.sort((Nt,_t)=>Nt.start-_t.start);let ft=0;for(let Nt=1;Nt<dt.length;Nt++){let _t=dt[ft],mt=dt[Nt],kt=_t.start+_t.count,Bt=Q(mt.start,v.width,4),Qt=Q(_t.start,v.width,4);mt.start<=kt+1&&Bt===Qt&&Q(mt.start+mt.count-1,v.width,4)===Bt?_t.count=Math.max(_t.count,mt.start+mt.count-_t.start):(++ft,dt[ft]=mt)}dt.length=ft+1;let et=e.getParameter(n.UNPACK_ROW_LENGTH),st=e.getParameter(n.UNPACK_SKIP_PIXELS),pt=e.getParameter(n.UNPACK_SKIP_ROWS);e.pixelStorei(n.UNPACK_ROW_LENGTH,v.width);for(let Nt=0,_t=dt.length;Nt<_t;Nt++){let mt=dt[Nt],kt=Math.floor(mt.start/4),Bt=Math.ceil(mt.count/4),Qt=kt%v.width,O=Math.floor(kt/v.width),gt=Bt,nt=1;e.pixelStorei(n.UNPACK_SKIP_PIXELS,Qt),e.pixelStorei(n.UNPACK_SKIP_ROWS,O),e.texSubImage2D(n.TEXTURE_2D,0,Qt,O,gt,nt,H,Y,v.data)}T.clearUpdateRanges(),e.pixelStorei(n.UNPACK_ROW_LENGTH,et),e.pixelStorei(n.UNPACK_SKIP_PIXELS,st),e.pixelStorei(n.UNPACK_SKIP_ROWS,pt)}}function Rt(T,v,H){let Y=n.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(Y=n.TEXTURE_2D_ARRAY),v.isData3DTexture&&(Y=n.TEXTURE_3D);let tt=qt(T,v),dt=v.source;e.bindTexture(Y,T.__webglTexture,n.TEXTURE0+H);let ft=i.get(dt);if(dt.version!==ft.__version||tt===!0){if(e.activeTexture(n.TEXTURE0+H),(typeof ImageBitmap<"u"&&v.image instanceof ImageBitmap)===!1){let nt=le.getPrimaries(le.workingColorSpace),vt=v.colorSpace===Wi?null:le.getPrimaries(v.colorSpace),Mt=v.colorSpace===Wi||nt===vt?n.NONE:n.BROWSER_DEFAULT_WEBGL;e.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),e.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),e.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Mt)}e.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment);let st=p(v.image,!1,s.maxTextureSize);st=ci(v,st);let pt=a.convert(v.format,v.colorSpace),Nt=a.convert(v.type),_t=b(v.internalFormat,pt,Nt,v.normalized,v.colorSpace,v.isVideoTexture);Vt(Y,v);let mt,kt=v.mipmaps,Bt=v.isVideoTexture!==!0,Qt=ft.__version===void 0||tt===!0,O=dt.dataReady,gt=S(v,st);if(v.isDepthTexture)_t=w(v.format===Fn,v.type),Qt&&(Bt?e.texStorage2D(n.TEXTURE_2D,1,_t,st.width,st.height):e.texImage2D(n.TEXTURE_2D,0,_t,st.width,st.height,0,pt,Nt,null));else if(v.isDataTexture)if(kt.length>0){Bt&&Qt&&e.texStorage2D(n.TEXTURE_2D,gt,_t,kt[0].width,kt[0].height);for(let nt=0,vt=kt.length;nt<vt;nt++)mt=kt[nt],Bt?O&&e.texSubImage2D(n.TEXTURE_2D,nt,0,0,mt.width,mt.height,pt,Nt,mt.data):e.texImage2D(n.TEXTURE_2D,nt,_t,mt.width,mt.height,0,pt,Nt,mt.data);v.generateMipmaps=!1}else Bt?(Qt&&e.texStorage2D(n.TEXTURE_2D,gt,_t,st.width,st.height),O&&rt(v,st,pt,Nt)):e.texImage2D(n.TEXTURE_2D,0,_t,st.width,st.height,0,pt,Nt,st.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Bt&&Qt&&e.texStorage3D(n.TEXTURE_2D_ARRAY,gt,_t,kt[0].width,kt[0].height,st.depth);for(let nt=0,vt=kt.length;nt<vt;nt++)if(mt=kt[nt],v.format!==Ni)if(pt!==null)if(Bt){if(O)if(v.layerUpdates.size>0){let Mt=bc(mt.width,mt.height,v.format,v.type);for(let lt of v.layerUpdates){let Ut=mt.data.subarray(lt*Mt/mt.data.BYTES_PER_ELEMENT,(lt+1)*Mt/mt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,nt,0,0,lt,mt.width,mt.height,1,pt,Ut)}}else e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,nt,0,0,0,mt.width,mt.height,st.depth,pt,mt.data)}else e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,nt,_t,mt.width,mt.height,st.depth,0,mt.data,0,0);else Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Bt?O&&e.texSubImage3D(n.TEXTURE_2D_ARRAY,nt,0,0,0,mt.width,mt.height,st.depth,pt,Nt,mt.data):e.texImage3D(n.TEXTURE_2D_ARRAY,nt,_t,mt.width,mt.height,st.depth,0,pt,Nt,mt.data);v.layerUpdates.size>0&&v.clearLayerUpdates()}else{Bt&&Qt&&e.texStorage2D(n.TEXTURE_2D,gt,_t,kt[0].width,kt[0].height);for(let nt=0,vt=kt.length;nt<vt;nt++)mt=kt[nt],v.format!==Ni?pt!==null?Bt?O&&e.compressedTexSubImage2D(n.TEXTURE_2D,nt,0,0,mt.width,mt.height,pt,mt.data):e.compressedTexImage2D(n.TEXTURE_2D,nt,_t,mt.width,mt.height,0,mt.data):Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Bt?O&&e.texSubImage2D(n.TEXTURE_2D,nt,0,0,mt.width,mt.height,pt,Nt,mt.data):e.texImage2D(n.TEXTURE_2D,nt,_t,mt.width,mt.height,0,pt,Nt,mt.data)}else if(v.isDataArrayTexture)if(Bt){if(Qt&&e.texStorage3D(n.TEXTURE_2D_ARRAY,gt,_t,st.width,st.height,st.depth),O)if(v.layerUpdates.size>0){let nt=bc(st.width,st.height,v.format,v.type);for(let vt of v.layerUpdates){let Mt=st.data.subarray(vt*nt/st.data.BYTES_PER_ELEMENT,(vt+1)*nt/st.data.BYTES_PER_ELEMENT);e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,vt,st.width,st.height,1,pt,Nt,Mt)}v.clearLayerUpdates()}else e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,st.width,st.height,st.depth,pt,Nt,st.data)}else e.texImage3D(n.TEXTURE_2D_ARRAY,0,_t,st.width,st.height,st.depth,0,pt,Nt,st.data);else if(v.isData3DTexture)Bt?(Qt&&e.texStorage3D(n.TEXTURE_3D,gt,_t,st.width,st.height,st.depth),O&&e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,st.width,st.height,st.depth,pt,Nt,st.data)):e.texImage3D(n.TEXTURE_3D,0,_t,st.width,st.height,st.depth,0,pt,Nt,st.data);else if(v.isFramebufferTexture){if(Qt)if(Bt)e.texStorage2D(n.TEXTURE_2D,gt,_t,st.width,st.height);else{let nt=st.width,vt=st.height;for(let Mt=0;Mt<gt;Mt++)e.texImage2D(n.TEXTURE_2D,Mt,_t,nt,vt,0,pt,Nt,null),nt>>=1,vt>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in n){let nt=n.canvas;if(nt.hasAttribute("layoutsubtree")||nt.setAttribute("layoutsubtree","true"),st.parentNode!==nt){nt.appendChild(st),d.add(v),nt.onpaint=vt=>{let Mt=vt.changedElements;for(let lt of d)Mt.includes(lt.image)&&(lt.needsUpdate=!0)},nt.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,st);else{let Mt=n.RGBA,lt=n.RGBA,Ut=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Mt,lt,Ut,st)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(kt.length>0){if(Bt&&Qt){let nt=_e(kt[0]);e.texStorage2D(n.TEXTURE_2D,gt,_t,nt.width,nt.height)}for(let nt=0,vt=kt.length;nt<vt;nt++)mt=kt[nt],Bt?O&&e.texSubImage2D(n.TEXTURE_2D,nt,0,0,pt,Nt,mt):e.texImage2D(n.TEXTURE_2D,nt,_t,pt,Nt,mt);v.generateMipmaps=!1}else if(Bt){if(Qt){let nt=_e(st);e.texStorage2D(n.TEXTURE_2D,gt,_t,nt.width,nt.height)}O&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,pt,Nt,st)}else e.texImage2D(n.TEXTURE_2D,0,_t,pt,Nt,st);m(v)&&M(Y),ft.__version=dt.version,v.onUpdate&&v.onUpdate(v)}T.__version=v.version}function $t(T,v,H){if(v.image.length!==6)return;let Y=qt(T,v),tt=v.source;e.bindTexture(n.TEXTURE_CUBE_MAP,T.__webglTexture,n.TEXTURE0+H);let dt=i.get(tt);if(tt.version!==dt.__version||Y===!0){e.activeTexture(n.TEXTURE0+H);let ft=le.getPrimaries(le.workingColorSpace),et=v.colorSpace===Wi?null:le.getPrimaries(v.colorSpace),st=v.colorSpace===Wi||ft===et?n.NONE:n.BROWSER_DEFAULT_WEBGL;e.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),e.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),e.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),e.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,st);let pt=v.isCompressedTexture||v.image[0].isCompressedTexture,Nt=v.image[0]&&v.image[0].isDataTexture,_t=[];for(let lt=0;lt<6;lt++)!pt&&!Nt?_t[lt]=p(v.image[lt],!0,s.maxCubemapSize):_t[lt]=Nt?v.image[lt].image:v.image[lt],_t[lt]=ci(v,_t[lt]);let mt=_t[0],kt=a.convert(v.format,v.colorSpace),Bt=a.convert(v.type),Qt=b(v.internalFormat,kt,Bt,v.normalized,v.colorSpace),O=v.isVideoTexture!==!0,gt=dt.__version===void 0||Y===!0,nt=tt.dataReady,vt=S(v,mt);Vt(n.TEXTURE_CUBE_MAP,v);let Mt;if(pt){O&&gt&&e.texStorage2D(n.TEXTURE_CUBE_MAP,vt,Qt,mt.width,mt.height);for(let lt=0;lt<6;lt++){Mt=_t[lt].mipmaps;for(let Ut=0;Ut<Mt.length;Ut++){let It=Mt[Ut];v.format!==Ni?kt!==null?O?nt&&e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Ut,0,0,It.width,It.height,kt,It.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Ut,Qt,It.width,It.height,0,It.data):Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?nt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Ut,0,0,It.width,It.height,kt,Bt,It.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Ut,Qt,It.width,It.height,0,kt,Bt,It.data)}}}else{if(Mt=v.mipmaps,O&&gt){Mt.length>0&&vt++;let lt=_e(_t[0]);e.texStorage2D(n.TEXTURE_CUBE_MAP,vt,Qt,lt.width,lt.height)}for(let lt=0;lt<6;lt++)if(Nt){O?nt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,0,0,_t[lt].width,_t[lt].height,kt,Bt,_t[lt].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,Qt,_t[lt].width,_t[lt].height,0,kt,Bt,_t[lt].data);for(let Ut=0;Ut<Mt.length;Ut++){let Re=Mt[Ut].image[lt].image;O?nt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Ut+1,0,0,Re.width,Re.height,kt,Bt,Re.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Ut+1,Qt,Re.width,Re.height,0,kt,Bt,Re.data)}}else{O?nt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,0,0,kt,Bt,_t[lt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,Qt,kt,Bt,_t[lt]);for(let Ut=0;Ut<Mt.length;Ut++){let It=Mt[Ut];O?nt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Ut+1,0,0,kt,Bt,It.image[lt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Ut+1,Qt,kt,Bt,It.image[lt])}}}m(v)&&M(n.TEXTURE_CUBE_MAP),dt.__version=tt.version,v.onUpdate&&v.onUpdate(v)}T.__version=v.version}function Et(T,v,H,Y,tt,dt){let ft=a.convert(H.format,H.colorSpace),et=a.convert(H.type),st=b(H.internalFormat,ft,et,H.normalized,H.colorSpace),pt=i.get(v),Nt=i.get(H);if(Nt.__renderTarget=v,!pt.__hasExternalTextures){let _t=Math.max(1,v.width>>dt),mt=Math.max(1,v.height>>dt);tt===n.TEXTURE_3D||tt===n.TEXTURE_2D_ARRAY?e.texImage3D(tt,dt,st,_t,mt,v.depth,0,ft,et,null):e.texImage2D(tt,dt,st,_t,mt,0,ft,et,null)}e.bindFramebuffer(n.FRAMEBUFFER,T),qe(v)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Y,tt,Nt.__webglTexture,0,Ue(v)):(tt===n.TEXTURE_2D||tt>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,Y,tt,Nt.__webglTexture,dt),e.bindFramebuffer(n.FRAMEBUFFER,null)}function se(T,v,H){if(n.bindRenderbuffer(n.RENDERBUFFER,T),v.depthBuffer){let Y=v.depthTexture,tt=Y&&Y.isDepthTexture?Y.type:null,dt=w(v.stencilBuffer,tt),ft=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;qe(v)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ue(v),dt,v.width,v.height):H?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ue(v),dt,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,dt,v.width,v.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ft,n.RENDERBUFFER,T)}else{let Y=v.textures;for(let tt=0;tt<Y.length;tt++){let dt=Y[tt],ft=a.convert(dt.format,dt.colorSpace),et=a.convert(dt.type),st=b(dt.internalFormat,ft,et,dt.normalized,dt.colorSpace);qe(v)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ue(v),st,v.width,v.height):H?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ue(v),st,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,st,v.width,v.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function $e(T,v,H){let Y=v.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(n.FRAMEBUFFER,T),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let tt=i.get(v.depthTexture);if(tt.__renderTarget=v,(!tt.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),Y){if(tt.__webglInit===void 0&&(tt.__webglInit=!0,v.depthTexture.addEventListener("dispose",R)),tt.__webglTexture===void 0){tt.__webglTexture=n.createTexture(),e.bindTexture(n.TEXTURE_CUBE_MAP,tt.__webglTexture),Vt(n.TEXTURE_CUBE_MAP,v.depthTexture);let pt=a.convert(v.depthTexture.format),Nt=a.convert(v.depthTexture.type),_t;v.depthTexture.format===Ki?_t=n.DEPTH_COMPONENT24:v.depthTexture.format===Fn&&(_t=n.DEPTH24_STENCIL8);for(let mt=0;mt<6;mt++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,_t,v.width,v.height,0,pt,Nt,null)}}else ot(v.depthTexture,0);let dt=tt.__webglTexture,ft=Ue(v),et=Y?n.TEXTURE_CUBE_MAP_POSITIVE_X+H:n.TEXTURE_2D,st=v.depthTexture.format===Fn?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(v.depthTexture.format===Ki)qe(v)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,st,et,dt,0,ft):n.framebufferTexture2D(n.FRAMEBUFFER,st,et,dt,0);else if(v.depthTexture.format===Fn)qe(v)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,st,et,dt,0,ft):n.framebufferTexture2D(n.FRAMEBUFFER,st,et,dt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ae(T){let v=i.get(T),H=T.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==T.depthTexture){let Y=T.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),Y){let tt=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,Y.removeEventListener("dispose",tt)};Y.addEventListener("dispose",tt),v.__depthDisposeCallback=tt}v.__boundDepthTexture=Y}if(T.depthTexture&&!v.__autoAllocateDepthBuffer)if(H)for(let Y=0;Y<6;Y++)$e(v.__webglFramebuffer[Y],T,Y);else{let Y=T.texture.mipmaps;Y&&Y.length>0?$e(v.__webglFramebuffer[0],T,0):$e(v.__webglFramebuffer,T,0)}else if(H){v.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(e.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[Y]),v.__webglDepthbuffer[Y]===void 0)v.__webglDepthbuffer[Y]=n.createRenderbuffer(),se(v.__webglDepthbuffer[Y],T,!1);else{let tt=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,dt=v.__webglDepthbuffer[Y];n.bindRenderbuffer(n.RENDERBUFFER,dt),n.framebufferRenderbuffer(n.FRAMEBUFFER,tt,n.RENDERBUFFER,dt)}}else{let Y=T.texture.mipmaps;if(Y&&Y.length>0?e.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[0]):e.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=n.createRenderbuffer(),se(v.__webglDepthbuffer,T,!1);else{let tt=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,dt=v.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,dt),n.framebufferRenderbuffer(n.FRAMEBUFFER,tt,n.RENDERBUFFER,dt)}}e.bindFramebuffer(n.FRAMEBUFFER,null)}function fe(T,v,H){let Y=i.get(T);v!==void 0&&Et(Y.__webglFramebuffer,T,T.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),H!==void 0&&ae(T)}function Ae(T){let v=T.texture,H=i.get(T),Y=i.get(v);T.addEventListener("dispose",x);let tt=T.textures,dt=T.isWebGLCubeRenderTarget===!0,ft=tt.length>1;if(ft||(Y.__webglTexture===void 0&&(Y.__webglTexture=n.createTexture()),Y.__version=v.version,r.memory.textures++),dt){H.__webglFramebuffer=[];for(let et=0;et<6;et++)if(v.mipmaps&&v.mipmaps.length>0){H.__webglFramebuffer[et]=[];for(let st=0;st<v.mipmaps.length;st++)H.__webglFramebuffer[et][st]=n.createFramebuffer()}else H.__webglFramebuffer[et]=n.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){H.__webglFramebuffer=[];for(let et=0;et<v.mipmaps.length;et++)H.__webglFramebuffer[et]=n.createFramebuffer()}else H.__webglFramebuffer=n.createFramebuffer();if(ft)for(let et=0,st=tt.length;et<st;et++){let pt=i.get(tt[et]);pt.__webglTexture===void 0&&(pt.__webglTexture=n.createTexture(),r.memory.textures++)}if(T.samples>0&&qe(T)===!1){H.__webglMultisampledFramebuffer=n.createFramebuffer(),H.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let et=0;et<tt.length;et++){let st=tt[et];H.__webglColorRenderbuffer[et]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,H.__webglColorRenderbuffer[et]);let pt=a.convert(st.format,st.colorSpace),Nt=a.convert(st.type),_t=b(st.internalFormat,pt,Nt,st.normalized,st.colorSpace,T.isXRRenderTarget===!0),mt=Ue(T);n.renderbufferStorageMultisample(n.RENDERBUFFER,mt,_t,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+et,n.RENDERBUFFER,H.__webglColorRenderbuffer[et])}n.bindRenderbuffer(n.RENDERBUFFER,null),T.depthBuffer&&(H.__webglDepthRenderbuffer=n.createRenderbuffer(),se(H.__webglDepthRenderbuffer,T,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(dt){e.bindTexture(n.TEXTURE_CUBE_MAP,Y.__webglTexture),Vt(n.TEXTURE_CUBE_MAP,v);for(let et=0;et<6;et++)if(v.mipmaps&&v.mipmaps.length>0)for(let st=0;st<v.mipmaps.length;st++)Et(H.__webglFramebuffer[et][st],T,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+et,st);else Et(H.__webglFramebuffer[et],T,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+et,0);m(v)&&M(n.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ft){for(let et=0,st=tt.length;et<st;et++){let pt=tt[et],Nt=i.get(pt),_t=n.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(_t=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(_t,Nt.__webglTexture),Vt(_t,pt),Et(H.__webglFramebuffer,T,pt,n.COLOR_ATTACHMENT0+et,_t,0),m(pt)&&M(_t)}e.unbindTexture()}else{let et=n.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(et=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(et,Y.__webglTexture),Vt(et,v),v.mipmaps&&v.mipmaps.length>0)for(let st=0;st<v.mipmaps.length;st++)Et(H.__webglFramebuffer[st],T,v,n.COLOR_ATTACHMENT0,et,st);else Et(H.__webglFramebuffer,T,v,n.COLOR_ATTACHMENT0,et,0);m(v)&&M(et),e.unbindTexture()}T.depthBuffer&&ae(T)}function oe(T){let v=T.textures;for(let H=0,Y=v.length;H<Y;H++){let tt=v[H];if(m(tt)){let dt=A(T),ft=i.get(tt).__webglTexture;e.bindTexture(dt,ft),M(dt),e.unbindTexture()}}}let Fe=[],Qe=[];function _i(T){if(T.samples>0){if(qe(T)===!1){let v=T.textures,H=T.width,Y=T.height,tt=n.COLOR_BUFFER_BIT,dt=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ft=i.get(T),et=v.length>1;if(et)for(let pt=0;pt<v.length;pt++)e.bindFramebuffer(n.FRAMEBUFFER,ft.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+pt,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,ft.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+pt,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,ft.__webglMultisampledFramebuffer);let st=T.texture.mipmaps;st&&st.length>0?e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ft.__webglFramebuffer[0]):e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ft.__webglFramebuffer);for(let pt=0;pt<v.length;pt++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(tt|=n.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(tt|=n.STENCIL_BUFFER_BIT)),et){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ft.__webglColorRenderbuffer[pt]);let Nt=i.get(v[pt]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Nt,0)}n.blitFramebuffer(0,0,H,Y,0,0,H,Y,tt,n.NEAREST),l===!0&&(Fe.length=0,Qe.length=0,Fe.push(n.COLOR_ATTACHMENT0+pt),T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&(Fe.push(dt),Qe.push(dt),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Qe)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Fe))}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),et)for(let pt=0;pt<v.length;pt++){e.bindFramebuffer(n.FRAMEBUFFER,ft.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+pt,n.RENDERBUFFER,ft.__webglColorRenderbuffer[pt]);let Nt=i.get(v[pt]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,ft.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+pt,n.TEXTURE_2D,Nt,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ft.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&l){let v=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[v])}}}function Ue(T){return Math.min(s.maxSamples,T.samples)}function qe(T){let v=i.get(T);return T.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function z(T){let v=r.render.frame;h.get(T)!==v&&(h.set(T,v),T.update())}function ci(T,v){let H=T.colorSpace,Y=T.format,tt=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||H!==Zs&&H!==Wi&&(le.getTransfer(H)===ve?(Y!==Ni||tt!==Mi)&&Gt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ht("WebGLTextures: Unsupported texture color space:",H)),v}function _e(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=$,this.resetTextureUnits=V,this.getTextureUnits=L,this.setTextureUnits=U,this.setTexture2D=ot,this.setTexture2DArray=j,this.setTexture3D=it,this.setTextureCube=Z,this.rebindTextures=fe,this.setupRenderTarget=Ae,this.updateRenderTargetMipmap=oe,this.updateMultisampleRenderTarget=_i,this.setupDepthRenderbuffer=ae,this.setupFrameBufferTexture=Et,this.useMultisampledRTT=qe,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Zv(n,t){function e(i,s=Wi){let a,r=le.getTransfer(s);if(i===Mi)return n.UNSIGNED_BYTE;if(i===Gr)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Wr)return n.UNSIGNED_SHORT_5_5_5_1;if(i===uc)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===dc)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===cc)return n.BYTE;if(i===hc)return n.SHORT;if(i===Ps)return n.UNSIGNED_SHORT;if(i===Hr)return n.INT;if(i===Hi)return n.UNSIGNED_INT;if(i===Gi)return n.FLOAT;if(i===li)return n.HALF_FLOAT;if(i===fc)return n.ALPHA;if(i===pc)return n.RGB;if(i===Ni)return n.RGBA;if(i===Ki)return n.DEPTH_COMPONENT;if(i===Fn)return n.DEPTH_STENCIL;if(i===mc)return n.RED;if(i===qr)return n.RED_INTEGER;if(i===Nn)return n.RG;if(i===Xr)return n.RG_INTEGER;if(i===Yr)return n.RGBA_INTEGER;if(i===ga||i===va||i===_a||i===xa)if(r===ve)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===ga)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===va)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===_a)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===xa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===ga)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===va)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===_a)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===xa)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Zr||i===Jr||i===$r||i===jr)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===Zr)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Jr)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===$r)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===jr)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Kr||i===Qr||i===to||i===eo||i===io||i===ya||i===no)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(i===Kr||i===Qr)return r===ve?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===to)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(i===eo)return a.COMPRESSED_R11_EAC;if(i===io)return a.COMPRESSED_SIGNED_R11_EAC;if(i===ya)return a.COMPRESSED_RG11_EAC;if(i===no)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===so||i===ao||i===ro||i===oo||i===lo||i===co||i===ho||i===uo||i===fo||i===po||i===mo||i===go||i===vo||i===_o)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(i===so)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ao)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===ro)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===oo)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===lo)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===co)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ho)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===uo)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===fo)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===po)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===mo)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===go)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===vo)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===_o)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===xo||i===yo||i===bo)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(i===xo)return r===ve?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===yo)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===bo)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Mo||i===So||i===ba||i===wo)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(i===Mo)return a.COMPRESSED_RED_RGTC1_EXT;if(i===So)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===ba)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===wo)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Is?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:e}}var Jv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,$v=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,zc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new sa(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new ze({vertexShader:Jv,fragmentShader:$v,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Lt(new Me(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Vc=class extends Qi{constructor(t,e){super();let i=this,s=null,a=1,r=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,g=null,_=typeof XRWebGLBinding<"u",p=new zc,m={},M=e.getContextAttributes(),A=null,b=null,w=[],S=[],R=new jt,x=null,E=null,P=new Ge;P.viewport=new we;let N=new Ge;N.viewport=new we;let B=[P,N],V=new Ur,L=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Q){let rt=w[Q];return rt===void 0&&(rt=new ws,w[Q]=rt),rt.getTargetRaySpace()},this.getControllerGrip=function(Q){let rt=w[Q];return rt===void 0&&(rt=new ws,w[Q]=rt),rt.getGripSpace()},this.getHand=function(Q){let rt=w[Q];return rt===void 0&&(rt=new ws,w[Q]=rt),rt.getHandSpace()};function $(Q){let rt=S.indexOf(Q.inputSource);if(rt===-1)return;let Rt=w[rt];Rt!==void 0&&(Rt.update(Q.inputSource,Q.frame,c||r),Rt.dispatchEvent({type:Q.type,data:Q.inputSource}))}function K(){s.removeEventListener("select",$),s.removeEventListener("selectstart",$),s.removeEventListener("selectend",$),s.removeEventListener("squeeze",$),s.removeEventListener("squeezestart",$),s.removeEventListener("squeezeend",$),s.removeEventListener("end",K),s.removeEventListener("inputsourceschange",ot);for(let Q=0;Q<w.length;Q++){let rt=S[Q];rt!==null&&(S[Q]=null,w[Q].disconnect(rt))}L=null,U=null,p.reset();for(let Q in m)delete m[Q];if(t.setRenderTarget(A),f=null,u=null,d=null,s=null,b=null,qt.stop(),i.isPresenting=!1,t.setPixelRatio(x),t.setSize(R.width,R.height,!1),E!==null){let Q=E.camera;Q.fov=E.fov,Q.zoom=E.zoom,Q.updateProjectionMatrix(),E=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Q){a=Q,i.isPresenting===!0&&Gt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Q){o=Q,i.isPresenting===!0&&Gt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||r},this.setReferenceSpace=function(Q){c=Q},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&_&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Q){if(s=Q,s!==null){if(A=t.getRenderTarget(),s.addEventListener("select",$),s.addEventListener("selectstart",$),s.addEventListener("selectend",$),s.addEventListener("squeeze",$),s.addEventListener("squeezestart",$),s.addEventListener("squeezeend",$),s.addEventListener("end",K),s.addEventListener("inputsourceschange",ot),M.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(R),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Rt=null,$t=null,Et=null;M.depth&&(Et=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Rt=M.stencil?Fn:Ki,$t=M.stencil?Is:Hi);let se={colorFormat:e.RGBA8,depthFormat:Et,scaleFactor:a};d=this.getBinding(),u=d.createProjectionLayer(se),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),b=new Ze(u.textureWidth,u.textureHeight,{format:Ni,type:Mi,depthTexture:new Tn(u.textureWidth,u.textureHeight,$t,void 0,void 0,void 0,void 0,void 0,void 0,Rt),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let Rt={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:a};f=new XRWebGLLayer(s,e,Rt),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),b=new Ze(f.framebufferWidth,f.framebufferHeight,{format:Ni,type:Mi,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,r=await s.requestReferenceSpace(o),qt.setContext(s),qt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function ot(Q){for(let rt=0;rt<Q.removed.length;rt++){let Rt=Q.removed[rt],$t=S.indexOf(Rt);$t>=0&&(S[$t]=null,w[$t].disconnect(Rt))}for(let rt=0;rt<Q.added.length;rt++){let Rt=Q.added[rt],$t=S.indexOf(Rt);if($t===-1){for(let se=0;se<w.length;se++)if(se>=S.length){S.push(Rt),$t=se;break}else if(S[se]===null){S[se]=Rt,$t=se;break}if($t===-1)break}let Et=w[$t];Et&&Et.connect(Rt)}}let j=new I,it=new I;function Z(Q,rt,Rt){j.setFromMatrixPosition(rt.matrixWorld),it.setFromMatrixPosition(Rt.matrixWorld);let $t=j.distanceTo(it),Et=rt.projectionMatrix.elements,se=Rt.projectionMatrix.elements,$e=Et[14]/(Et[10]-1),ae=Et[14]/(Et[10]+1),fe=(Et[9]+1)/Et[5],Ae=(Et[9]-1)/Et[5],oe=(Et[8]-1)/Et[0],Fe=(se[8]+1)/se[0],Qe=$e*oe,_i=$e*Fe,Ue=$t/(-oe+Fe),qe=Ue*-oe;if(rt.matrixWorld.decompose(Q.position,Q.quaternion,Q.scale),Q.translateX(qe),Q.translateZ(Ue),Q.matrixWorld.compose(Q.position,Q.quaternion,Q.scale),Q.matrixWorldInverse.copy(Q.matrixWorld).invert(),Et[10]===-1)Q.projectionMatrix.copy(rt.projectionMatrix),Q.projectionMatrixInverse.copy(rt.projectionMatrixInverse);else{let z=$e+Ue,ci=ae+Ue,_e=Qe-qe,T=_i+($t-qe),v=fe*ae/ci*z,H=Ae*ae/ci*z;Q.projectionMatrix.makePerspective(_e,T,v,H,z,ci),Q.projectionMatrixInverse.copy(Q.projectionMatrix).invert()}}function ct(Q,rt){rt===null?Q.matrixWorld.copy(Q.matrix):Q.matrixWorld.multiplyMatrices(rt.matrixWorld,Q.matrix),Q.matrixWorldInverse.copy(Q.matrixWorld).invert()}this.updateCamera=function(Q){if(s===null)return;let rt=Q.near,Rt=Q.far;p.texture!==null&&(p.depthNear>0&&(rt=p.depthNear),p.depthFar>0&&(Rt=p.depthFar)),V.near=N.near=P.near=rt,V.far=N.far=P.far=Rt,(L!==V.near||U!==V.far)&&(s.updateRenderState({depthNear:V.near,depthFar:V.far}),L=V.near,U=V.far),V.layers.mask=Q.layers.mask|6,P.layers.mask=V.layers.mask&-5,N.layers.mask=V.layers.mask&-3;let $t=Q.parent,Et=V.cameras;ct(V,$t);for(let se=0;se<Et.length;se++)ct(Et[se],$t);Et.length===2?Z(V,P,N):V.projectionMatrix.copy(P.projectionMatrix),E===null&&Q.isPerspectiveCamera&&(E={camera:Q,fov:Q.fov,zoom:Q.zoom}),At(Q,V,$t)};function At(Q,rt,Rt){Rt===null?Q.matrix.copy(rt.matrixWorld):(Q.matrix.copy(Rt.matrixWorld),Q.matrix.invert(),Q.matrix.multiply(rt.matrixWorld)),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale),Q.updateMatrixWorld(!0),Q.projectionMatrix.copy(rt.projectionMatrix),Q.projectionMatrixInverse.copy(rt.projectionMatrixInverse),Q.isPerspectiveCamera&&(Q.fov=js*2*Math.atan(1/Q.projectionMatrix.elements[5]),Q.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(Q){l=Q,u!==null&&(u.fixedFoveation=Q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Q)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(V)},this.getCameraTexture=function(Q){return m[Q]};let zt=null;function Vt(Q,rt){if(h=rt.getViewerPose(c||r),g=rt,h!==null){let Rt=h.views;f!==null&&(t.setRenderTargetFramebuffer(b,f.framebuffer),t.setRenderTarget(b));let $t=!1;Rt.length!==V.cameras.length&&(V.cameras.length=0,$t=!0);for(let ae=0;ae<Rt.length;ae++){let fe=Rt[ae],Ae=null;if(f!==null)Ae=f.getViewport(fe);else{let Fe=d.getViewSubImage(u,fe);Ae=Fe.viewport,ae===0&&(t.setRenderTargetTextures(b,Fe.colorTexture,Fe.depthStencilTexture),t.setRenderTarget(b))}let oe=B[ae];oe===void 0&&(oe=new Ge,oe.layers.enable(ae),oe.viewport=new we,B[ae]=oe),oe.matrix.fromArray(fe.transform.matrix),oe.matrix.decompose(oe.position,oe.quaternion,oe.scale),oe.projectionMatrix.fromArray(fe.projectionMatrix),oe.projectionMatrixInverse.copy(oe.projectionMatrix).invert(),oe.viewport.set(Ae.x,Ae.y,Ae.width,Ae.height),ae===0&&(V.matrix.copy(oe.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),$t===!0&&V.cameras.push(oe)}let Et=s.enabledFeatures;if(Et&&Et.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){d=i.getBinding();let ae=d.getDepthInformation(Rt[0]);ae&&ae.isValid&&ae.texture&&p.init(ae,s.renderState)}if(Et&&Et.includes("camera-access")&&_){t.state.unbindTexture(),d=i.getBinding();for(let ae=0;ae<Rt.length;ae++){let fe=Rt[ae].camera;if(fe){let Ae=m[fe];Ae||(Ae=new sa,m[fe]=Ae);let oe=d.getCameraImage(fe);Ae.sourceTexture=oe}}}}for(let Rt=0;Rt<w.length;Rt++){let $t=S[Rt],Et=w[Rt];$t!==null&&Et!==void 0&&Et.update($t,rt,c||r)}zt&&zt(Q,rt),rt.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:rt}),g=null}let qt=new rd;qt.setAnimationLoop(Vt),this.setAnimationLoop=function(Q){zt=Q},this.dispose=function(){}}},jv=new he,dd=new Jt;dd.set(-1,0,0,0,1,0,0,0,1);function Kv(n,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function i(p,m){m.color.getRGB(p.fogColor.value,_c(n)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function s(p,m,M,A,b){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?a(p,m):m.isMeshLambertMaterial?(a(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(a(p,m),d(p,m)):m.isMeshPhongMaterial?(a(p,m),h(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(a(p,m),u(p,m),m.isMeshPhysicalMaterial&&f(p,m,b)):m.isMeshMatcapMaterial?(a(p,m),g(p,m)):m.isMeshDepthMaterial?a(p,m):m.isMeshDistanceMaterial?(a(p,m),_(p,m)):m.isMeshNormalMaterial?a(p,m):m.isLineBasicMaterial?(r(p,m),m.isLineDashedMaterial&&o(p,m)):m.isPointsMaterial?l(p,m,M,A):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function a(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===oi&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===oi&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let M=t.get(m),A=M.envMap,b=M.envMapRotation;A&&(p.envMap.value=A,p.envMapRotation.value.setFromMatrix4(jv.makeRotationFromEuler(b)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(dd),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function r(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function o(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,M,A){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*M,p.scale.value=A*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function d(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function u(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,M){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===oi&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=M.texture,p.transmissionSamplerSize.value.set(M.width,M.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function _(p,m){let M=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(M.matrixWorld),p.nearDistance.value=M.shadow.camera.near,p.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Qv(n,t,e,i){let s={},a={},r=[],o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,w){let S=w.program;i.uniformBlockBinding(b,S)}function c(b,w){let S=s[b.id];S===void 0&&(p(b),S=h(b),s[b.id]=S,b.addEventListener("dispose",M));let R=w.program;i.updateUBOMapping(b,R);let x=t.render.frame;a[b.id]!==x&&(u(b),a[b.id]=x)}function h(b){let w=d();b.__bindingPointIndex=w;let S=n.createBuffer(),R=b.__size,x=b.usage;return n.bindBuffer(n.UNIFORM_BUFFER,S),n.bufferData(n.UNIFORM_BUFFER,R,x),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,w,S),S}function d(){for(let b=0;b<o;b++)if(r.indexOf(b)===-1)return r.push(b),b;return Ht("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(b){let w=s[b.id],S=b.uniforms,R=b.__cache;n.bindBuffer(n.UNIFORM_BUFFER,w);for(let x=0,E=S.length;x<E;x++){let P=S[x];if(Array.isArray(P))for(let N=0,B=P.length;N<B;N++)f(P[N],x,N,R);else f(P,x,0,R)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(b,w,S,R){if(_(b,w,S,R)===!0){let x=b.__offset,E=b.value;if(Array.isArray(E)){let P=0;for(let N=0;N<E.length;N++){let B=E[N],V=m(B);g(B,b.__data,P),typeof B!="number"&&typeof B!="boolean"&&!B.isMatrix3&&!ArrayBuffer.isView(B)&&(P+=V.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(E,b.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,x,b.__data)}}function g(b,w,S){typeof b=="number"||typeof b=="boolean"?w[0]=b:b.isMatrix3?(w[0]=b.elements[0],w[1]=b.elements[1],w[2]=b.elements[2],w[3]=0,w[4]=b.elements[3],w[5]=b.elements[4],w[6]=b.elements[5],w[7]=0,w[8]=b.elements[6],w[9]=b.elements[7],w[10]=b.elements[8],w[11]=0):ArrayBuffer.isView(b)?w.set(new b.constructor(b.buffer,b.byteOffset,w.length)):b.toArray(w,S)}function _(b,w,S,R){let x=b.value,E=w+"_"+S;if(R[E]===void 0)return typeof x=="number"||typeof x=="boolean"?R[E]=x:ArrayBuffer.isView(x)?R[E]=x.slice():R[E]=x.clone(),!0;{let P=R[E];if(typeof x=="number"||typeof x=="boolean"){if(P!==x)return R[E]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(P.equals(x)===!1)return P.copy(x),!0}}return!1}function p(b){let w=b.uniforms,S=0,R=16;for(let E=0,P=w.length;E<P;E++){let N=Array.isArray(w[E])?w[E]:[w[E]];for(let B=0,V=N.length;B<V;B++){let L=N[B],U=Array.isArray(L.value)?L.value:[L.value];for(let $=0,K=U.length;$<K;$++){let ot=U[$],j=m(ot),it=S%R,Z=it%j.boundary,ct=it+Z;S+=Z,ct!==0&&R-ct<j.storage&&(S+=R-ct),L.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=S,S+=j.storage}}}let x=S%R;return x>0&&(S+=R-x),b.__size=S,b.__cache={},this}function m(b){let w={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(w.boundary=4,w.storage=4):b.isVector2?(w.boundary=8,w.storage=8):b.isVector3||b.isColor?(w.boundary=16,w.storage=12):b.isVector4?(w.boundary=16,w.storage=16):b.isMatrix3?(w.boundary=48,w.storage=48):b.isMatrix4?(w.boundary=64,w.storage=64):b.isTexture?Gt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(b)?(w.boundary=16,w.storage=b.byteLength):Gt("WebGLRenderer: Unsupported uniform value type.",b),w}function M(b){let w=b.target;w.removeEventListener("dispose",M);let S=r.indexOf(w.__bindingPointIndex);r.splice(S,1),n.deleteBuffer(s[w.id]),delete s[w.id],delete a[w.id]}function A(){for(let b in s)n.deleteBuffer(s[b]);r=[],s={},a={}}return{bind:l,update:c,dispose:A}}var t_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),nn=null;function e_(){return nn===null&&(nn=new br(t_,16,16,Nn,li),nn.name="DFG_LUT",nn.minFilter=ri,nn.magFilter=ri,nn.wrapS=Di,nn.wrapT=Di,nn.generateMipmaps=!1,nn.needsUpdate=!0),nn}var Do=class{constructor(t={}){let{canvas:e=Lu(),context:i=null,depth:s=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=Mi}=t;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=r;let _=f,p=new Set([Yr,Xr,qr]),m=new Set([Mi,Hi,Ps,Is,Gr,Wr]),M=new Uint32Array(4),A=new Int32Array(4),b=new I,w=null,S=null,R=[],x=[],E=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ci,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,N=!1,B=null,V=null,L=null,U=null;this._outputColorSpace=xe;let $=0,K=0,ot=null,j=-1,it=null,Z=new we,ct=new we,At=null,zt=new Xt(0),Vt=0,qt=e.width,Q=e.height,rt=1,Rt=null,$t=null,Et=new we(0,0,qt,Q),se=new we(0,0,qt,Q),$e=!1,ae=new Ts,fe=!1,Ae=!1,oe=new he,Fe=new I,Qe=new we,_i={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ue=!1;function qe(){return ot===null?rt:1}let z=i;function ci(y,k){return e.getContext(y,k)}let _e,T,v,H,Y,tt,dt,ft,et,st,pt,Nt,_t,mt,kt,Bt,Qt,O,gt,nt,vt,Mt,lt;try{let y={alpha:!0,depth:s,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Re,!1),e.addEventListener("webglcontextrestored",me,!1),e.addEventListener("webglcontextcreationerror",Ui,!1),z===null){let k="webgl2";if(z=ci(k,y),z===null)throw ci(k)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ut()}catch(y){throw e.removeEventListener("webglcontextlost",Re,!1),e.removeEventListener("webglcontextrestored",me,!1),e.removeEventListener("webglcontextcreationerror",Ui,!1),Ht("WebGLRenderer: "+y.message),y}function Ut(){_e=new lg(z),_e.init(),vt=new Zv(z,_e),T=new Km(z,_e,t,vt),v=new Xv(z,_e),T.reversedDepthBuffer&&u&&v.buffers.depth.setReversed(!0),V=z.createFramebuffer(),L=z.createFramebuffer(),U=z.createFramebuffer(),H=new ug(z),Y=new Lv,tt=new Yv(z,_e,v,Y,T,vt,H),dt=new og(P),ft=new fp(z),Mt=new $m(z,ft),et=new cg(z,ft,H,Mt),st=new fg(z,et,ft,Mt,H),O=new dg(z,T,tt),kt=new Qm(Y),pt=new Iv(P,dt,_e,T,Mt,kt),Nt=new Kv(P,Y),_t=new Fv,mt=new zv(_e),Qt=new Jm(P,dt,v,st,g,l),Bt=new qv(P,st,T),lt=new Qv(z,H,T,v),gt=new jm(z,_e,H),nt=new hg(z,_e,H),H.programs=pt.programs,P.capabilities=T,P.extensions=_e,P.properties=Y,P.renderLists=_t,P.shadowMap=Bt,P.state=v,P.info=H}_!==Mi&&(E=new mg(_,e.width,e.height,o,s,a));let It=new Vc(P,z);this.xr=It,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let y=_e.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){let y=_e.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return rt},this.setPixelRatio=function(y){y!==void 0&&(rt=y,this.setSize(qt,Q,!1))},this.getSize=function(y){return y.set(qt,Q)},this.setSize=function(y,k,J=!0){if(It.isPresenting){Gt("WebGLRenderer: Can't change size while VR device is presenting.");return}qt=y,Q=k,e.width=Math.floor(y*rt),e.height=Math.floor(k*rt),J===!0&&(e.style.width=y+"px",e.style.height=k+"px"),E!==null&&E.setSize(e.width,e.height),this.setViewport(0,0,y,k)},this.getDrawingBufferSize=function(y){return y.set(qt*rt,Q*rt).floor()},this.setDrawingBufferSize=function(y,k,J){qt=y,Q=k,rt=J,e.width=Math.floor(y*J),e.height=Math.floor(k*J),this.setViewport(0,0,y,k)},this.setEffects=function(y){if(_===Mi){Ht("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let k=0;k<y.length;k++)if(y[k].isOutputPass===!0){Gt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(Z)},this.getViewport=function(y){return y.copy(Et)},this.setViewport=function(y,k,J,W){y.isVector4?Et.set(y.x,y.y,y.z,y.w):Et.set(y,k,J,W),v.viewport(Z.copy(Et).multiplyScalar(rt).round())},this.getScissor=function(y){return y.copy(se)},this.setScissor=function(y,k,J,W){y.isVector4?se.set(y.x,y.y,y.z,y.w):se.set(y,k,J,W),v.scissor(ct.copy(se).multiplyScalar(rt).round())},this.getScissorTest=function(){return $e},this.setScissorTest=function(y){v.setScissorTest($e=y)},this.setOpaqueSort=function(y){Rt=y},this.setTransparentSort=function(y){$t=y},this.getClearColor=function(y){return y.copy(Qt.getClearColor())},this.setClearColor=function(){Qt.setClearColor(...arguments)},this.getClearAlpha=function(){return Qt.getClearAlpha()},this.setClearAlpha=function(){Qt.setClearAlpha(...arguments)},this.clear=function(y=!0,k=!0,J=!0){let W=0;if(y){let q=!1;if(ot!==null){let bt=ot.texture.format;q=p.has(bt)}if(q){let bt=ot.texture.type,Tt=m.has(bt),yt=Qt.getClearColor(),Ct=Qt.getClearAlpha(),Dt=yt.r,ie=yt.g,re=yt.b;Tt?(M[0]=Dt,M[1]=ie,M[2]=re,M[3]=Ct,z.clearBufferuiv(z.COLOR,0,M)):(A[0]=Dt,A[1]=ie,A[2]=re,A[3]=Ct,z.clearBufferiv(z.COLOR,0,A))}else W|=z.COLOR_BUFFER_BIT}k&&(W|=z.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),J&&(W|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&z.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),B=y},this.dispose=function(){e.removeEventListener("webglcontextlost",Re,!1),e.removeEventListener("webglcontextrestored",me,!1),e.removeEventListener("webglcontextcreationerror",Ui,!1),Qt.dispose(),_t.dispose(),mt.dispose(),Y.dispose(),dt.dispose(),st.dispose(),Mt.dispose(),lt.dispose(),pt.dispose(),It.dispose(),It.removeEventListener("sessionstart",xh),It.removeEventListener("sessionend",yh),Un.stop()};function Re(y){y.preventDefault(),vc("WebGLRenderer: Context Lost."),N=!0}function me(){vc("WebGLRenderer: Context Restored."),N=!1;let y=H.autoReset,k=Bt.enabled,J=Bt.autoUpdate,W=Bt.needsUpdate,q=Bt.type;Ut(),H.autoReset=y,Bt.enabled=k,Bt.autoUpdate=J,Bt.needsUpdate=W,Bt.type=q}function Ui(y){Ht("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function Zi(y){let k=y.target;k.removeEventListener("dispose",Zi),gf(k)}function gf(y){vf(y),Y.remove(y)}function vf(y){let k=Y.get(y).programs;k!==void 0&&(k.forEach(function(J){pt.releaseProgram(J)}),y.isShaderMaterial&&pt.releaseShaderCache(y))}this.renderBufferDirect=function(y,k,J,W,q,bt){k===null&&(k=_i);let Tt=q.isMesh&&q.matrixWorld.determinantAffine()<0,yt=yf(y,k,J,W,q);v.setMaterial(W,Tt);let Ct=J.index,Dt=1;if(W.wireframe===!0){if(Ct=et.getWireframeAttribute(J),Ct===void 0)return;Dt=2}let ie=J.drawRange,re=J.attributes.position,Pt=ie.start*Dt,ge=(ie.start+ie.count)*Dt;bt!==null&&(Pt=Math.max(Pt,bt.start*Dt),ge=Math.min(ge,(bt.start+bt.count)*Dt)),Ct!==null?(Pt=Math.max(Pt,0),ge=Math.min(ge,Ct.count)):re!=null&&(Pt=Math.max(Pt,0),ge=Math.min(ge,re.count));let Xe=ge-Pt;if(Xe<0||Xe===1/0)return;Mt.setup(q,W,yt,J,Ct);let Le,Se=gt;if(Ct!==null&&(Le=ft.get(Ct),Se=nt,Se.setIndex(Le)),q.isMesh)W.wireframe===!0?(v.setLineWidth(W.wireframeLinewidth*qe()),Se.setMode(z.LINES)):Se.setMode(z.TRIANGLES);else if(q.isLine){let hi=W.linewidth;hi===void 0&&(hi=1),v.setLineWidth(hi*qe()),q.isLineSegments?Se.setMode(z.LINES):q.isLineLoop?Se.setMode(z.LINE_LOOP):Se.setMode(z.LINE_STRIP)}else q.isPoints?Se.setMode(z.POINTS):q.isSprite&&Se.setMode(z.TRIANGLES);if(q.isBatchedMesh)if(_e.get("WEBGL_multi_draw"))Se.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{let hi=q._multiDrawStarts,wt=q._multiDrawCounts,pi=q._multiDrawCount,de=Ct?ft.get(Ct).bytesPerElement:1,Ii=Y.get(W).currentProgram.getUniforms();for(let Ji=0;Ji<pi;Ji++)Ii.setValue(z,"_gl_DrawID",Ji),Se.render(hi[Ji]/de,wt[Ji])}else if(q.isInstancedMesh)Se.renderInstances(Pt,Xe,q.count);else if(J.isInstancedBufferGeometry){let hi=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,wt=Math.min(J.instanceCount,hi);Se.renderInstances(Pt,Xe,wt)}else Se.render(Pt,Xe)};function _h(y,k,J,W){B!==null&&y.isNodeMaterial&&B.setObject(W,y),fe===!0&&kt.setState(y,J,!1),y.transparent===!0&&y.side===Ne&&y.forceSinglePass===!1?(y.side=oi,y.needsUpdate=!0,Va(y,k,W),y.side=In,y.needsUpdate=!0,Va(y,k,W),y.side=Ne):Va(y,k,W)}this.compile=function(y,k,J=null){J===null&&(J=y),B!==null&&B.renderStart(y,k,J),S=mt.get(J),S.init(k),x.push(S),J.traverseVisible(function(q){q.isLight&&q.layers.test(k.layers)&&(S.pushLight(q),q.castShadow&&S.pushShadow(q))}),y!==J&&y.traverseVisible(function(q){q.isLight&&q.layers.test(k.layers)&&(S.pushLight(q),q.castShadow&&S.pushShadow(q))}),S.setupLights(),B!==null&&B.updateLights(S.state.lightsArray),Ae=this.localClippingEnabled,fe=kt.init(this.clippingPlanes,Ae),fe===!0&&kt.setGlobalState(this.clippingPlanes,k),B!==null&&Bt.render(S.state.shadowsArray,J,k);let W=new Set;return y.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;let bt=q.material;if(bt)if(Array.isArray(bt))for(let Tt=0;Tt<bt.length;Tt++){let yt=bt[Tt];_h(yt,J,k,q),W.add(yt)}else _h(bt,J,k,q),W.add(bt)}),S=x.pop(),B!==null&&B.renderEnd(),W},this.compileAsync=function(y,k,J=null){let W=this.compile(y,k,J);return new Promise(q=>{function bt(){if(W.forEach(function(Tt){let Ct=Y.get(Tt).currentProgram;(Ct===void 0||Ct.isReady())&&W.delete(Tt)}),W.size===0){q(y);return}setTimeout(bt,10)}_e.get("KHR_parallel_shader_compile")!==null?bt():setTimeout(bt,10)})};let ml=null;function _f(y){ml&&ml(y)}function xh(){Un.stop()}function yh(){Un.start()}let Un=new rd;Un.setAnimationLoop(_f),typeof self<"u"&&Un.setContext(self),this.setAnimationLoop=function(y){ml=y,It.setAnimationLoop(y),y===null?Un.stop():Un.start()},It.addEventListener("sessionstart",xh),It.addEventListener("sessionend",yh),this.render=function(y,k){if(k!==void 0&&k.isCamera!==!0){Ht("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;B!==null&&B.renderStart(y,k);let J=It.enabled===!0&&It.isPresenting===!0,W=E!==null&&(ot===null||J)&&E.begin(P,ot);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),It.enabled===!0&&It.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(It.cameraAutoUpdate===!0&&It.updateCamera(k),k=It.getCamera()),y.isScene===!0&&y.onBeforeRender(P,y,k,ot),S=mt.get(y,x.length),S.init(k),S.state.textureUnits=tt.getTextureUnits(),x.push(S),oe.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),ae.setFromProjectionMatrix(oe,Vi,k.reversedDepth),Ae=this.localClippingEnabled,fe=kt.init(this.clippingPlanes,Ae),w=_t.get(y,R.length),w.init(),R.push(w),It.enabled===!0&&It.isPresenting===!0){let Tt=P.xr.getDepthSensingMesh();Tt!==null&&gl(Tt,k,-1/0,P.sortObjects)}gl(y,k,0,P.sortObjects),w.finish(),B!==null&&B.updateLights(S.state.lightsArray),P.sortObjects===!0&&w.sort(Rt,$t),Ue=It.enabled===!1||It.isPresenting===!1||It.hasDepthSensing()===!1,Ue&&Qt.addToRenderList(w,y),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),fe===!0&&kt.beginShadows();let q=S.state.shadowsArray;if(Bt.render(q,y,k),fe===!0&&kt.endShadows(),(W&&E.hasRenderPass())===!1){let Tt=w.opaque,yt=w.transmissive;if(S.setupLights(),k.isArrayCamera){let Ct=k.cameras;if(yt.length>0)for(let Dt=0,ie=Ct.length;Dt<ie;Dt++){let re=Ct[Dt];Mh(Tt,yt,y,re)}Ue&&Qt.render(y);for(let Dt=0,ie=Ct.length;Dt<ie;Dt++){let re=Ct[Dt];bh(w,y,re,re.viewport)}}else yt.length>0&&Mh(Tt,yt,y,k),Ue&&Qt.render(y),bh(w,y,k)}ot!==null&&K===0&&(tt.updateMultisampleRenderTarget(ot),tt.updateRenderTargetMipmap(ot)),W&&E.end(P),y.isScene===!0&&y.onAfterRender(P,y,k),Mt.resetDefaultState(),j=-1,it=null,x.pop(),x.length>0?(S=x[x.length-1],tt.setTextureUnits(S.state.textureUnits),fe===!0&&kt.setGlobalState(P.clippingPlanes,S.state.camera)):S=null,R.pop(),R.length>0?w=R[R.length-1]:w=null,B!==null&&B.renderEnd()};function gl(y,k,J,W){if(y.visible===!1)return;if(y.layers.test(k.layers)){if(y.isGroup)J=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(k);else if(y.isLightProbeGrid)S.pushLightProbeGrid(y);else if(y.isLight)S.pushLight(y),y.castShadow&&S.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||y.intersectsFrustum(ae)){W&&Qe.setFromMatrixPosition(y.matrixWorld).applyMatrix4(oe);let Tt=st.update(y),yt=y.material;yt.visible&&w.push(y,Tt,yt,J,Qe.z,null,k)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||y.intersectsFrustum(ae))){let Tt=st.update(y),yt=y.material;if(W&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Qe.copy(y.boundingSphere.center)):(Tt.boundingSphere===null&&Tt.computeBoundingSphere(),Qe.copy(Tt.boundingSphere.center)),Qe.applyMatrix4(y.matrixWorld).applyMatrix4(oe)),Array.isArray(yt)){let Ct=Tt.groups;for(let Dt=0,ie=Ct.length;Dt<ie;Dt++){let re=Ct[Dt],Pt=yt[re.materialIndex];Pt&&Pt.visible&&w.push(y,Tt,Pt,J,Qe.z,re,k)}}else yt.visible&&w.push(y,Tt,yt,J,Qe.z,null,k)}}let bt=y.children;for(let Tt=0,yt=bt.length;Tt<yt;Tt++)gl(bt[Tt],k,J,W)}function bh(y,k,J,W){let{opaque:q,transmissive:bt,transparent:Tt}=y;S.setupLightsView(J),fe===!0&&kt.setGlobalState(P.clippingPlanes,J),W&&v.viewport(Z.copy(W)),q.length>0&&za(q,k,J),bt.length>0&&za(bt,k,J),Tt.length>0&&za(Tt,k,J),v.buffers.depth.setTest(!0),v.buffers.depth.setMask(!0),v.buffers.color.setMask(!0),v.setPolygonOffset(!1)}function Mh(y,k,J,W){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[W.id]===void 0){let Pt=_e.has("EXT_color_buffer_half_float")||_e.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[W.id]=new Ze(1,1,{generateMipmaps:!0,type:Pt?li:Mi,minFilter:Dn,samples:Math.max(4,T.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:le.workingColorSpace})}let bt=S.state.transmissionRenderTarget[W.id],Tt=W.viewport||Z;bt.setSize(Tt.z*P.transmissionResolutionScale,Tt.w*P.transmissionResolutionScale);let yt=P.getRenderTarget(),Ct=P.getActiveCubeFace(),Dt=P.getActiveMipmapLevel();P.setRenderTarget(bt),P.getClearColor(zt),Vt=P.getClearAlpha(),Vt<1&&P.setClearColor(16777215,.5),P.clear(),Ue&&Qt.render(J);let ie=P.toneMapping;P.toneMapping=Ci;let re=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),S.setupLightsView(W),fe===!0&&kt.setGlobalState(P.clippingPlanes,W),za(y,J,W),tt.updateMultisampleRenderTarget(bt),tt.updateRenderTargetMipmap(bt),_e.has("WEBGL_multisampled_render_to_texture")===!1){let Pt=!1;for(let ge=0,Xe=k.length;ge<Xe;ge++){let Le=k[ge],{object:Se,geometry:hi,material:wt,group:pi}=Le;if(wt.side===Ne&&Se.layers.test(W.layers)){let de=wt.side;wt.side=oi,wt.needsUpdate=!0,Sh(Se,J,W,hi,wt,pi),wt.side=de,wt.needsUpdate=!0,Pt=!0}}Pt===!0&&(tt.updateMultisampleRenderTarget(bt),tt.updateRenderTargetMipmap(bt))}P.setRenderTarget(yt,Ct,Dt),P.setClearColor(zt,Vt),re!==void 0&&(W.viewport=re),P.toneMapping=ie}function za(y,k,J){let W=k.isScene===!0?k.overrideMaterial:null;for(let q=0,bt=y.length;q<bt;q++){let Tt=y[q],{object:yt,geometry:Ct,group:Dt}=Tt,ie=Tt.material;ie.allowOverride===!0&&W!==null&&(ie=W),yt.layers.test(J.layers)&&Sh(yt,k,J,Ct,ie,Dt)}}function Sh(y,k,J,W,q,bt){B!==null&&q.isNodeMaterial&&B.setObject(y,q),y.onBeforeRender(P,k,J,W,q,bt),y.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),q.onBeforeRender(P,k,J,W,y,bt),q.transparent===!0&&q.side===Ne&&q.forceSinglePass===!1?(q.side=oi,q.needsUpdate=!0,P.renderBufferDirect(J,k,W,q,y,bt),q.side=In,q.needsUpdate=!0,P.renderBufferDirect(J,k,W,q,y,bt),q.side=Ne):P.renderBufferDirect(J,k,W,q,y,bt),y.onAfterRender(P,k,J,W,q,bt)}function Va(y,k,J){k.isScene!==!0&&(k=_i);let W=Y.get(y),q=S.state.lights,bt=S.state.shadowsArray,Tt=q.state.version,yt=pt.getParameters(y,q.state,bt,k,J,S.state.lightProbeGridArray),Ct=pt.getProgramCacheKey(yt),Dt=W.programs;W.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?k.environment:null,W.fog=k.fog;let ie=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;W.envMap=dt.get(y.envMap||W.environment,ie),W.envMapRotation=W.environment!==null&&y.envMap===null?k.environmentRotation:y.envMapRotation,Dt===void 0&&(y.addEventListener("dispose",Zi),Dt=new Map,W.programs=Dt);let re=Dt.get(Ct);if(re!==void 0){if(W.currentProgram===re&&W.lightsStateVersion===Tt)return Eh(y,yt),re}else yt.uniforms=pt.getUniforms(y),B!==null&&y.isNodeMaterial&&B.build(y,J,yt),y.onBeforeCompile(yt,P),re=pt.acquireProgram(yt,Ct),Dt.set(Ct,re),W.uniforms=yt.uniforms;let Pt=W.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(Pt.clippingPlanes=kt.uniform),Eh(y,yt),W.needsLights=Mf(y),W.lightsStateVersion=Tt,W.needsLights&&(Pt.ambientLightColor.value=q.state.ambient,Pt.lightProbe.value=q.state.probe,Pt.sunLights.value=q.state.sun,Pt.sunLightShadows.value=q.state.sunShadow,Pt.directionalLights.value=q.state.directional,Pt.directionalLightShadows.value=q.state.directionalShadow,Pt.spotLights.value=q.state.spot,Pt.spotLightShadows.value=q.state.spotShadow,Pt.rectAreaLights.value=q.state.rectArea,Pt.ltc_1.value=q.state.rectAreaLTC1,Pt.ltc_2.value=q.state.rectAreaLTC2,Pt.pointLights.value=q.state.point,Pt.pointLightShadows.value=q.state.pointShadow,Pt.hemisphereLights.value=q.state.hemi,Pt.sunShadowMatrix.value=q.state.sunShadowMatrix,Pt.sunShadowCascade.value=q.state.sunShadowCascade,Pt.directionalShadowMatrix.value=q.state.directionalShadowMatrix,Pt.spotLightMatrix.value=q.state.spotLightMatrix,Pt.spotLightMap.value=q.state.spotLightMap,Pt.pointShadowMatrix.value=q.state.pointShadowMatrix),W.lightProbeGrid=S.state.lightProbeGridArray.length>0,W.currentProgram=re,W.uniformsList=null,re}function wh(y){if(y.uniformsList===null){let k=y.currentProgram.getUniforms();y.uniformsList=Fs.seqWithValue(k.seq,y.uniforms)}return y.uniformsList}function Eh(y,k){let J=Y.get(y);J.outputColorSpace=k.outputColorSpace,J.batching=k.batching,J.batchingColor=k.batchingColor,J.instancing=k.instancing,J.instancingColor=k.instancingColor,J.instancingMorph=k.instancingMorph,J.skinning=k.skinning,J.morphTargets=k.morphTargets,J.morphNormals=k.morphNormals,J.morphColors=k.morphColors,J.morphTargetsCount=k.morphTargetsCount,J.numClippingPlanes=k.numClippingPlanes,J.numIntersection=k.numClipIntersection,J.vertexAlphas=k.vertexAlphas,J.vertexTangents=k.vertexTangents,J.toneMapping=k.toneMapping}function xf(y,k){if(y.length===0)return null;if(y.length===1)return y[0].texture!==null?y[0]:null;b.setFromMatrixPosition(k.matrixWorld);for(let J=0,W=y.length;J<W;J++){let q=y[J];if(q.texture!==null&&q.boundingBox.containsPoint(b))return q}return null}function yf(y,k,J,W,q){k.isScene!==!0&&(k=_i),tt.resetTextureUnits();let bt=k.fog,Tt=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?k.environment:null,yt=ot===null?P.outputColorSpace:ot.isXRRenderTarget===!0?ot.texture.colorSpace:le.workingColorSpace,Ct=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,Dt=dt.get(W.envMap||Tt,Ct),ie=W.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,re=!!J.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Pt=!!J.morphAttributes.position,ge=!!J.morphAttributes.normal,Xe=!!J.morphAttributes.color,Le=Ci;W.toneMapped&&(ot===null||ot.isXRRenderTarget===!0)&&(Le=P.toneMapping);let Se=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,hi=Se!==void 0?Se.length:0,wt=Y.get(W),pi=S.state.lights;if(fe===!0&&(Ae===!0||y!==it)){let Ce=y===it&&W.id===j;kt.setState(W,y,Ce)}let de=!1;W.version===wt.__version?(wt.needsLights&&wt.lightsStateVersion!==pi.state.version||wt.outputColorSpace!==yt||q.isBatchedMesh&&wt.batching===!1||!q.isBatchedMesh&&wt.batching===!0||q.isBatchedMesh&&wt.batchingColor===!0&&q._colorsTexture===null||q.isBatchedMesh&&wt.batchingColor===!1&&q._colorsTexture!==null||q.isInstancedMesh&&wt.instancing===!1||!q.isInstancedMesh&&wt.instancing===!0||q.isSkinnedMesh&&wt.skinning===!1||!q.isSkinnedMesh&&wt.skinning===!0||q.isInstancedMesh&&wt.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&wt.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&wt.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&wt.instancingMorph===!1&&q.morphTexture!==null||wt.envMap!==Dt||W.fog===!0&&wt.fog!==bt||wt.numClippingPlanes!==void 0&&(wt.numClippingPlanes!==kt.numPlanes||wt.numIntersection!==kt.numIntersection)||wt.vertexAlphas!==ie||wt.vertexTangents!==re||wt.morphTargets!==Pt||wt.morphNormals!==ge||wt.morphColors!==Xe||wt.toneMapping!==Le||wt.morphTargetsCount!==hi||!!wt.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(de=!0):(de=!0,wt.__version=W.version);let Ii=wt.currentProgram;de===!0&&(Ii=Va(W,k,q),B&&W.isNodeMaterial&&B.onUpdateProgram(W,Ii,wt));let Ji=!1,mn=!1,ns=!1,ye=Ii.getUniforms(),He=wt.uniforms;if(v.useProgram(Ii.program)&&(Ji=!0,mn=!0,ns=!0),W.id!==j&&(j=W.id,mn=!0),wt.needsLights){let Ce=xf(S.state.lightProbeGridArray,q);wt.lightProbeGrid!==Ce&&(wt.lightProbeGrid=Ce,mn=!0)}if(Ji||it!==y){v.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),ye.setValue(z,"projectionMatrix",y.projectionMatrix),ye.setValue(z,"viewMatrix",y.matrixWorldInverse);let vn=ye.map.cameraPosition;vn!==void 0&&vn.setValue(z,Fe.setFromMatrixPosition(y.matrixWorld)),T.logarithmicDepthBuffer&&ye.setValue(z,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&ye.setValue(z,"isOrthographic",y.isOrthographicCamera===!0),it!==y&&(it=y,mn=!0,ns=!0)}if(wt.needsLights&&(pi.state.sunShadowMap.length>0&&ye.setValue(z,"sunShadowMap",pi.state.sunShadowMap,tt),pi.state.directionalShadowMap.length>0&&ye.setValue(z,"directionalShadowMap",pi.state.directionalShadowMap,tt),pi.state.spotShadowMap.length>0&&ye.setValue(z,"spotShadowMap",pi.state.spotShadowMap,tt),pi.state.pointShadowMap.length>0&&ye.setValue(z,"pointShadowMap",pi.state.pointShadowMap,tt)),q.isSkinnedMesh){ye.setOptional(z,q,"bindMatrix"),ye.setOptional(z,q,"bindMatrixInverse");let Ce=q.skeleton;Ce&&(Ce.boneTexture===null&&Ce.computeBoneTexture(),ye.setValue(z,"boneTexture",Ce.boneTexture,tt))}q.isBatchedMesh&&(ye.setOptional(z,q,"batchingTexture"),ye.setValue(z,"batchingTexture",q._matricesTexture,tt),ye.setOptional(z,q,"batchingIdTexture"),ye.setValue(z,"batchingIdTexture",q._indirectTexture,tt),ye.setOptional(z,q,"batchingColorTexture"),q._colorsTexture!==null&&ye.setValue(z,"batchingColorTexture",q._colorsTexture,tt));let gn=J.morphAttributes;if((gn.position!==void 0||gn.normal!==void 0||gn.color!==void 0)&&O.update(q,J,Ii),(mn||wt.receiveShadow!==q.receiveShadow)&&(wt.receiveShadow=q.receiveShadow,ye.setValue(z,"receiveShadow",q.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&k.environment!==null&&(He.envMapIntensity.value=k.environmentIntensity),He.dfgLUT!==void 0&&(He.dfgLUT.value=e_()),mn){if(ye.setValue(z,"toneMappingExposure",P.toneMappingExposure),wt.needsLights&&bf(He,ns),bt&&W.fog===!0&&Nt.refreshFogUniforms(He,bt),Nt.refreshMaterialUniforms(He,W,rt,Q,S.state.transmissionRenderTarget[y.id]),wt.needsLights&&wt.lightProbeGrid){let Ce=wt.lightProbeGrid;He.probesSH.value=Ce.texture,He.probesMin.value.copy(Ce.boundingBox.min),He.probesMax.value.copy(Ce.boundingBox.max),He.probesResolution.value.copy(Ce.resolution)}Fs.upload(z,wh(wt),He,tt)}if(W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(Fs.upload(z,wh(wt),He,tt),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&ye.setValue(z,"center",q.center),ye.setValue(z,"modelViewMatrix",q.modelViewMatrix),ye.setValue(z,"normalMatrix",q.normalMatrix),ye.setValue(z,"modelMatrix",q.matrixWorld),W.uniformsGroups!==void 0){let Ce=W.uniformsGroups;for(let vn=0,ss=Ce.length;vn<ss;vn++){let Ah=Ce[vn];lt.update(Ah,Ii),lt.bind(Ah,Ii)}}return Ii}function bf(y,k){y.ambientLightColor.needsUpdate=k,y.lightProbe.needsUpdate=k,y.sunLights.needsUpdate=k,y.sunLightShadows.needsUpdate=k,y.directionalLights.needsUpdate=k,y.directionalLightShadows.needsUpdate=k,y.pointLights.needsUpdate=k,y.pointLightShadows.needsUpdate=k,y.spotLights.needsUpdate=k,y.spotLightShadows.needsUpdate=k,y.rectAreaLights.needsUpdate=k,y.hemisphereLights.needsUpdate=k}function Mf(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return $},this.getActiveMipmapLevel=function(){return K},this.getRenderTarget=function(){return ot},this.setRenderTargetTextures=function(y,k,J){let W=Y.get(y);W.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),Y.get(y.texture).__webglTexture=k,Y.get(y.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:J,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,k){let J=Y.get(y);J.__webglFramebuffer=k,J.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(y,k=0,J=0){ot=y,$=k,K=J;let W=null,q=!1,bt=!1;if(y){let yt=Y.get(y);if(yt.__useDefaultFramebuffer!==void 0){v.bindFramebuffer(z.FRAMEBUFFER,yt.__webglFramebuffer),Z.copy(y.viewport),ct.copy(y.scissor),At=y.scissorTest,v.viewport(Z),v.scissor(ct),v.setScissorTest(At),j=-1;return}else if(yt.__webglFramebuffer===void 0)tt.setupRenderTarget(y);else if(yt.__hasExternalTextures)tt.rebindTextures(y,Y.get(y.texture).__webglTexture,Y.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){let ie=y.depthTexture;if(yt.__boundDepthTexture!==ie){if(ie!==null&&Y.has(ie)&&(y.width!==ie.image.width||y.height!==ie.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");tt.setupDepthRenderbuffer(y)}}let Ct=y.texture;(Ct.isData3DTexture||Ct.isDataArrayTexture||Ct.isCompressedArrayTexture)&&(bt=!0);let Dt=Y.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Dt[k])?W=Dt[k][J]:W=Dt[k],q=!0):y.samples>0&&tt.useMultisampledRTT(y)===!1?W=Y.get(y).__webglMultisampledFramebuffer:Array.isArray(Dt)?W=Dt[J]:W=Dt,Z.copy(y.viewport),ct.copy(y.scissor),At=y.scissorTest}else Z.copy(Et).multiplyScalar(rt).floor(),ct.copy(se).multiplyScalar(rt).floor(),At=$e;if(J!==0&&(W=V),v.bindFramebuffer(z.FRAMEBUFFER,W)&&v.drawBuffers(y,W),v.viewport(Z),v.scissor(ct),v.setScissorTest(At),q){let yt=Y.get(y.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+k,yt.__webglTexture,J)}else if(bt){let yt=k;for(let Ct=0;Ct<y.textures.length;Ct++){let Dt=Y.get(y.textures[Ct]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+Ct,Dt.__webglTexture,J,yt)}}else if(y!==null&&J!==0){let yt=Y.get(y.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,yt.__webglTexture,J)}j=-1};function Th(y){let k=Y.get(y);return(k.__readFormat!==y.format||k.__readType!==y.type)&&(k.__readFormat=y.format,k.__readType=y.type,k.__formatReadable=T.textureFormatReadable(y.format),k.__typeReadable=T.textureTypeReadable(y.type)),k}this.readRenderTargetPixels=function(y,k,J,W,q,bt,Tt,yt=0){if(!(y&&y.isWebGLRenderTarget)){Ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ct=Y.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Tt!==void 0&&(Ct=Ct[Tt]),Ct){v.bindFramebuffer(z.FRAMEBUFFER,Ct);try{let Dt=y.textures[yt],ie=Dt.format,re=Dt.type;y.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+yt);let Pt=Th(Dt);if(Pt.__formatReadable===!1){Ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pt.__typeReadable===!1){Ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=y.width-W&&J>=0&&J<=y.height-q&&z.readPixels(k,J,W,q,vt.convert(ie),vt.convert(re),bt)}finally{let Dt=ot!==null?Y.get(ot).__webglFramebuffer:null;v.bindFramebuffer(z.FRAMEBUFFER,Dt)}}},this.readRenderTargetPixelsAsync=async function(y,k,J,W,q,bt,Tt,yt=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ct=Y.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Tt!==void 0&&(Ct=Ct[Tt]),Ct)if(k>=0&&k<=y.width-W&&J>=0&&J<=y.height-q){v.bindFramebuffer(z.FRAMEBUFFER,Ct);let Dt=y.textures[yt],ie=Dt.format,re=Dt.type;y.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+yt);let Pt=Th(Dt);if(Pt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ge=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,ge),z.bufferData(z.PIXEL_PACK_BUFFER,bt.byteLength,z.STREAM_READ),z.readPixels(k,J,W,q,vt.convert(ie),vt.convert(re),0),z.bindBuffer(z.PIXEL_PACK_BUFFER,null);let Xe=ot!==null?Y.get(ot).__webglFramebuffer:null;v.bindFramebuffer(z.FRAMEBUFFER,Xe);let Le=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await Fu(z,Le,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,ge),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,bt),z.bindBuffer(z.PIXEL_PACK_BUFFER,null),z.deleteBuffer(ge),z.deleteSync(Le),bt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,k=null,J=0){let W=Math.pow(2,-J),q=Math.floor(y.image.width*W),bt=Math.floor(y.image.height*W),Tt=k!==null?k.x:0,yt=k!==null?k.y:0;tt.setTexture2D(y,0),z.copyTexSubImage2D(z.TEXTURE_2D,J,0,0,Tt,yt,q,bt),v.unbindTexture()},this.copyTextureToTexture=function(y,k,J=null,W=null,q=0,bt=0){let Tt,yt,Ct,Dt,ie,re,Pt,ge,Xe,Le=y.isCompressedTexture?y.mipmaps[bt]:y.image;if(J!==null)Tt=J.max.x-J.min.x,yt=J.max.y-J.min.y,Ct=J.isBox3?J.max.z-J.min.z:1,Dt=J.min.x,ie=J.min.y,re=J.isBox3?J.min.z:0;else{let He=Math.pow(2,-q);Tt=Math.floor(Le.width*He),yt=Math.floor(Le.height*He),y.isDataArrayTexture?Ct=Le.depth:y.isData3DTexture?Ct=Math.floor(Le.depth*He):Ct=1,Dt=0,ie=0,re=0}W!==null?(Pt=W.x,ge=W.y,Xe=W.z):(Pt=0,ge=0,Xe=0);let Se=vt.convert(k.format),hi=vt.convert(k.type),wt;k.isData3DTexture?(tt.setTexture3D(k,0),wt=z.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(tt.setTexture2DArray(k,0),wt=z.TEXTURE_2D_ARRAY):(tt.setTexture2D(k,0),wt=z.TEXTURE_2D),v.activeTexture(z.TEXTURE0),v.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,k.flipY),v.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),v.pixelStorei(z.UNPACK_ALIGNMENT,k.unpackAlignment);let pi=v.getParameter(z.UNPACK_ROW_LENGTH),de=v.getParameter(z.UNPACK_IMAGE_HEIGHT),Ii=v.getParameter(z.UNPACK_SKIP_PIXELS),Ji=v.getParameter(z.UNPACK_SKIP_ROWS),mn=v.getParameter(z.UNPACK_SKIP_IMAGES);v.pixelStorei(z.UNPACK_ROW_LENGTH,Le.width),v.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Le.height),v.pixelStorei(z.UNPACK_SKIP_PIXELS,Dt),v.pixelStorei(z.UNPACK_SKIP_ROWS,ie),v.pixelStorei(z.UNPACK_SKIP_IMAGES,re);let ns=y.isDataArrayTexture||y.isData3DTexture,ye=k.isDataArrayTexture||k.isData3DTexture;if(y.isDepthTexture){let He=Y.get(y),gn=Y.get(k),Ce=Y.get(He.__renderTarget),vn=Y.get(gn.__renderTarget);v.bindFramebuffer(z.READ_FRAMEBUFFER,Ce.__webglFramebuffer),v.bindFramebuffer(z.DRAW_FRAMEBUFFER,vn.__webglFramebuffer);for(let ss=0;ss<Ct;ss++)ns&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Y.get(y).__webglTexture,q,re+ss),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Y.get(k).__webglTexture,bt,Xe+ss)),z.blitFramebuffer(Dt,ie,Tt,yt,Pt,ge,Tt,yt,z.DEPTH_BUFFER_BIT,z.NEAREST);v.bindFramebuffer(z.READ_FRAMEBUFFER,null),v.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(q!==0||y.isRenderTargetTexture||Y.has(y)){let He=Y.get(y),gn=Y.get(k);v.bindFramebuffer(z.READ_FRAMEBUFFER,L),v.bindFramebuffer(z.DRAW_FRAMEBUFFER,U);for(let Ce=0;Ce<Ct;Ce++)ns?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,He.__webglTexture,q,re+Ce):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,He.__webglTexture,q),ye?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,gn.__webglTexture,bt,Xe+Ce):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,gn.__webglTexture,bt),q!==0?z.blitFramebuffer(Dt,ie,Tt,yt,Pt,ge,Tt,yt,z.COLOR_BUFFER_BIT,z.NEAREST):ye?z.copyTexSubImage3D(wt,bt,Pt,ge,Xe+Ce,Dt,ie,Tt,yt):z.copyTexSubImage2D(wt,bt,Pt,ge,Dt,ie,Tt,yt);v.bindFramebuffer(z.READ_FRAMEBUFFER,null),v.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else ye?y.isDataTexture||y.isData3DTexture?z.texSubImage3D(wt,bt,Pt,ge,Xe,Tt,yt,Ct,Se,hi,Le.data):k.isCompressedArrayTexture?z.compressedTexSubImage3D(wt,bt,Pt,ge,Xe,Tt,yt,Ct,Se,Le.data):z.texSubImage3D(wt,bt,Pt,ge,Xe,Tt,yt,Ct,Se,hi,Le):y.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,bt,Pt,ge,Tt,yt,Se,hi,Le.data):y.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,bt,Pt,ge,Le.width,Le.height,Se,Le.data):z.texSubImage2D(z.TEXTURE_2D,bt,Pt,ge,Tt,yt,Se,hi,Le);v.pixelStorei(z.UNPACK_ROW_LENGTH,pi),v.pixelStorei(z.UNPACK_IMAGE_HEIGHT,de),v.pixelStorei(z.UNPACK_SKIP_PIXELS,Ii),v.pixelStorei(z.UNPACK_SKIP_ROWS,Ji),v.pixelStorei(z.UNPACK_SKIP_IMAGES,mn),bt===0&&k.generateMipmaps&&z.generateMipmap(wt),v.unbindTexture()},this.initRenderTarget=function(y){Y.get(y).__webglFramebuffer===void 0&&tt.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?tt.setTextureCube(y,0):y.isData3DTexture?tt.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?tt.setTexture2DArray(y,0):tt.setTexture2D(y,0),v.unbindTexture()},this.resetState=function(){$=0,K=0,ot=null,v.reset(),Mt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Vi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=le._getDrawingBufferColorSpace(t),e.unpackColorSpace=le._getUnpackColorSpace()}};var ko=class{constructor(t){this.canvas=t,this.down=new Set,this.pressed=new Set,this.mdx=0,this.mdy=0,this.lmb=!1,this.rmb=!1,this.lclick=!1,this.wheel=0,this.locked=!1,this.enabled=!0,this.listeners=[],this.onLockChange=null,window.addEventListener("keydown",e=>{if(e.target&&(e.target.tagName==="INPUT"||e.target.tagName==="SELECT"||e.target.tagName==="TEXTAREA")){(e.code==="Escape"||e.code==="Enter")&&this._emit(e);return}["Tab","Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)&&e.preventDefault(),e.repeat||this.pressed.add(e.code),this.down.add(e.code),this._emit(e)}),window.addEventListener("keyup",e=>{this.down.delete(e.code)}),window.addEventListener("blur",()=>{this.down.clear(),this.lmb=this.rmb=!1}),document.addEventListener("mousemove",e=>{this.locked&&(Math.abs(e.movementX)>400||Math.abs(e.movementY)>400||(this.mdx+=e.movementX,this.mdy+=e.movementY))}),document.addEventListener("mousedown",e=>{this.locked&&(e.button===0&&(this.lmb=!0,this.lclick=!0),e.button===2&&(this.rmb=!0))}),document.addEventListener("mouseup",e=>{e.button===0&&(this.lmb=!1),e.button===2&&(this.rmb=!1)}),document.addEventListener("contextmenu",e=>e.preventDefault()),document.addEventListener("wheel",e=>{this.locked&&(this.wheel+=Math.sign(e.deltaY))},{passive:!0}),document.addEventListener("pointerlockchange",()=>{this.locked=document.pointerLockElement===this.canvas,this.locked||(this.lmb=this.rmb=!1,this.down.clear()),this.onLockChange&&this.onLockChange(this.locked)})}onKey(t){this.listeners.push(t)}_emit(t){for(let e of this.listeners)e(t)}lock(){if(!this.locked)try{let t=this.canvas.requestPointerLock({unadjustedMovement:!1});t&&t.catch&&t.catch(()=>{})}catch{}}unlock(){document.pointerLockElement&&document.exitPointerLock()}key(t){return this.down.has(t)}hit(t){return this.pressed.has(t)}endFrame(){this.pressed.clear(),this.mdx=0,this.mdy=0,this.lclick=!1,this.wheel=0}};var fd="casa-se-lembra/settings/v1",pd="casa-se-lembra/names/v1",i_={master:.9,music:.8,sfx:1,voices:.9,sensitivity:1,invertY:!1,fov:72,shake:1,scare:2,flashes:!0,tts:!0,quality:"auto",storyMode:!1},ks={rafaela:"Rafaela",rafa:"Rafa",wendel:"Wendel",julia:"J\xFAlia",mae:"Josi",pai:"Henrique",pedro:"Pedro",bento:"Bento",lili:"Lili",sobrenome:"",escola:""};function md(n,t){try{let e=localStorage.getItem(n);return e?{...t,...JSON.parse(e)}:{...t}}catch{return{...t}}}var te=md(fd,i_),ue=md(pd,ks);function Hc(){try{localStorage.setItem(fd,JSON.stringify(te))}catch{}}function gd(){for(let n of Object.keys(ks))typeof ue[n]!="string"&&(ue[n]=ks[n]),ue[n]=ue[n].trim().slice(0,40),!ue[n]&&n!=="sobrenome"&&n!=="escola"&&(ue[n]=ks[n]);try{localStorage.setItem(pd,JSON.stringify(ue))}catch{}}function Ft(n){return typeof n!="string"?n:n.replace(/\{(\w+)\}/g,(t,e)=>e==="RAFA"?ue.rafa.toUpperCase():e==="RAFAELA"?ue.rafaela.toUpperCase():e==="nomecompleto"?(ue.rafaela+(ue.sobrenome?" "+ue.sobrenome:"")).trim():e==="colegio"?ue.escola?ue.escola:"o col\xE9gio":ue[e]!==void 0?ue[e]:t)}var Pe=(n,t,e)=>n<t?t:n>e?e:n,jn=(n,t,e)=>n+(t-n)*e;var vd=n=>n<.5?2*n*n:1-Math.pow(-2*n+2,2)/2,St=(n=0,t=1)=>n+Math.random()*(t-n);var Uo=n=>n[Math.floor(Math.random()*n.length)];var si=(n,t)=>{let e=(t-n)%(Math.PI*2);return e>Math.PI&&(e-=Math.PI*2),e<-Math.PI&&(e+=Math.PI*2),e};function Ie(n){let t=n>>>0;return function(){t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function ht(n){return document.getElementById(n)}function at(n,t={},...e){let i=document.createElement(n);for(let[s,a]of Object.entries(t||{}))s==="class"?i.className=a:s==="html"?i.innerHTML=a:s.startsWith("on")?i.addEventListener(s.slice(2),a):a!=null&&a!==!1&&i.setAttribute(s,a);for(let s of e.flat())s==null||s===!1||i.appendChild(typeof s=="string"?document.createTextNode(s):s);return i}function Kn(n){return String(n).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Qn(n){return String(n||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"")}var n_=[[800,1200,2500],[400,2e3,2600],[300,2300,3e3],[450,800,2500],[325,700,2400],[600,1e3,2400]];function Ta(n){return 440*Math.pow(2,(n-69)/12)}var Gc=class{constructor(){this.ctx=null,this.ready=!1,this.occlude=null,this.loops=new Set,this.musicHandle=null,this.duck=1}init(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}let t=window.AudioContext||window.webkitAudioContext;if(!t)return;let e=this.ctx=new t;this.master=e.createGain(),this.comp=e.createDynamicsCompressor(),this.comp.threshold.value=-10,this.comp.knee.value=8,this.comp.ratio.value=6,this.comp.attack.value=.003,this.comp.release.value=.25,this.master.connect(this.comp).connect(e.destination),this.sfx=e.createGain(),this.amb=e.createGain(),this.mus=e.createGain(),this.voice=e.createGain(),this.duckGain=e.createGain(),this.sfx.connect(this.master),this.voice.connect(this.master),this.amb.connect(this.duckGain),this.mus.connect(this.duckGain),this.duckGain.connect(this.master),this.reverb=e.createConvolver(),this.reverb.buffer=this._impulse(2.4,2.6),this.revGain=e.createGain(),this.revGain.gain.value=.32,this.reverb.connect(this.revGain).connect(this.master),this.revSend=e.createGain(),this.revSend.gain.value=1,this.revSend.connect(this.reverb),this.noiseBuf=this._noise(3,"white"),this.pinkBuf=this._noise(3,"pink"),this.brownBuf=this._noise(4,"brown"),this.distCurve=this._distCurve(40),this.hardCurve=this._distCurve(400),this.ready=!0,this.applyVolumes()}resume(){this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}get now(){return this.ctx?this.ctx.currentTime:0}applyVolumes(){if(!this.ready)return;let t=this.now;this.master.gain.setTargetAtTime(te.master,t,.05),this.sfx.gain.setTargetAtTime(te.sfx,t,.05),this.amb.gain.setTargetAtTime(te.sfx*.9,t,.05),this.mus.gain.setTargetAtTime(te.music,t,.05),this.voice.gain.setTargetAtTime(te.voices,t,.05)}setDuck(t,e=.4){this.ready&&this.duckGain.gain.setTargetAtTime(t,this.now,e)}_noise(t,e){let i=this.ctx,s=Math.floor(i.sampleRate*t),a=i.createBuffer(1,s,i.sampleRate),r=a.getChannelData(0),o=0,l=0,c=0,h=0,d=0,u=0,f=0,g=0;for(let _=0;_<s;_++){let p=Math.random()*2-1;e==="white"?r[_]=p:e==="pink"?(o=.99886*o+p*.0555179,l=.99332*l+p*.0750759,c=.969*c+p*.153852,h=.8665*h+p*.3104856,d=.55*d+p*.5329522,u=-.7616*u-p*.016898,r[_]=(o+l+c+h+d+u+f+p*.5362)*.11,f=p*.115926):(g=(g+.02*p)/1.02,r[_]=g*3.5)}return a}_impulse(t,e){let i=this.ctx,s=Math.floor(i.sampleRate*t),a=i.createBuffer(2,s,i.sampleRate);for(let r=0;r<2;r++){let o=a.getChannelData(r);for(let l=0;l<s;l++)o[l]=(Math.random()*2-1)*Math.pow(1-l/s,e)}return a}_distCurve(t){let i=new Float32Array(2048);for(let s=0;s<2048;s++){let a=s*2/2048-1;i[s]=(3+t)*a*20*(Math.PI/180)/(Math.PI+t*Math.abs(a))}return i}_dest(t={}){let e=this.ctx,i=t.bus==="amb"?this.amb:t.bus==="voice"?this.voice:t.bus==="mus"?this.mus:this.sfx,s=e.createGain();s.gain.value=t.vol===void 0?1:t.vol;let a=s;if(t.pos){let r=e.createPanner();r.panningModel="HRTF",r.distanceModel="inverse",r.refDistance=t.ref||1.2,r.rolloffFactor=t.rolloff||1.3,r.maxDistance=60,this._setPannerPos(r,t.pos);let o=this.occlude?this.occlude(t.pos):0;if(o>0){let c=e.createBiquadFilter();c.type="lowpass",c.frequency.value=5e3-4200*o,s.connect(c);let h=e.createGain();h.gain.value=1-.45*o,c.connect(h),h.connect(r)}else s.connect(r);r.connect(i);let l=e.createGain();l.gain.value=t.rev===void 0?.35:t.rev,r.connect(l).connect(this.revSend),a.panner=r}else{if(t.pan){let r=e.createStereoPanner();r.pan.value=t.pan,s.connect(r).connect(i)}else s.connect(i);if(t.rev){let r=e.createGain();r.gain.value=t.rev,s.connect(r).connect(this.revSend)}}return a}_setPannerPos(t,e){let i=this.now,s=e.x!==void 0?e.x:e[0],a=e.y!==void 0?e.y:e[1],r=e.z!==void 0?e.z:e[2];t.positionX?(t.positionX.setValueAtTime(s,i),t.positionY.setValueAtTime(a,i),t.positionZ.setValueAtTime(r,i)):t.setPosition(s,a,r)}updateListener(t){if(!this.ready)return;let e=this.ctx.listener,i=t.matrixWorld.elements,s=i[12],a=i[13],r=i[14],o=-i[8],l=-i[9],c=-i[10],h=i[4],d=i[5],u=i[6],f=this.now;e.positionX?(e.positionX.setValueAtTime(s,f),e.positionY.setValueAtTime(a,f),e.positionZ.setValueAtTime(r,f),e.forwardX.setValueAtTime(o,f),e.forwardY.setValueAtTime(l,f),e.forwardZ.setValueAtTime(c,f),e.upX.setValueAtTime(h,f),e.upY.setValueAtTime(d,f),e.upZ.setValueAtTime(u,f)):(e.setPosition(s,a,r),e.setOrientation(o,l,c,h,d,u))}_env(t,e,i,s,a,r=0){t.gain.setValueAtTime(1e-4,e),t.gain.linearRampToValueAtTime(s,e+i),t.gain.exponentialRampToValueAtTime(Math.max(1e-4,r),e+i+a)}_src(t,e=!1,i=1){let s=this.ctx.createBufferSource();return s.buffer=t,s.loop=e,s.playbackRate.value=i,e&&(s.loopStart=Math.random()*1.5),s}_filter(t,e,i=1){let s=this.ctx.createBiquadFilter();return s.type=t,s.frequency.value=e,s.Q.value=i,s}_osc(t,e){let i=this.ctx.createOscillator();return i.type=t,i.frequency.value=e,i}_noiseBurst(t,e,i,{type:s="bandpass",f:a=1e3,q:r=1,peak:o=.5,a:l=.002,buf:c}={}){let h=this._src(c||this.noiseBuf),d=this._filter(s,a,r),u=this.ctx.createGain();return this._env(u,e,l,o,i),h.connect(d).connect(u).connect(t),h.start(e,Math.random()*2),h.stop(e+l+i+.05),{s:h,fl:d,g:u}}_tone(t,e,i,s,a,r,o=.005){let l=this._osc(i,s),c=this.ctx.createGain();return this._env(c,e,o,r,a),l.connect(c).connect(t),l.start(e),l.stop(e+o+a+.05),{o:l,g:c}}play(t,e={}){if(!this.ready)return null;let i=this["_"+t];if(!i)return console.warn("som desconhecido",t),null;let s=this.now+(e.delay||0),a=this._dest(e);try{return i.call(this,a,s,e)||null}catch(r){return console.warn(r),null}}_step(t,e,i){let s=i.surface||"wood",a=(i.soft?.35:1)*St(.8,1.1);s==="tile"?(this._noiseBurst(t,e,.05,{f:St(2200,3200),q:1.5,peak:.35*a}),this._tone(t,e,"sine",St(120,150),.05,.25*a)):s==="stairs"?(this._noiseBurst(t,e,.09,{type:"lowpass",f:500,peak:.6*a}),this._tone(t,e,"sine",St(70,90),.1,.5*a),this._noiseBurst(t,e+.03,.18,{f:St(700,1100),q:12,peak:.08*a})):(this._noiseBurst(t,e,.07,{type:"lowpass",f:St(500,800),peak:.5*a}),this._tone(t,e,"sine",St(80,100),.07,.35*a),Math.random()<.12&&this._noiseBurst(t,e+.05,.25,{f:St(900,1400),q:18,peak:.05}))}_creak(t,e,i){let s=i.dur||St(.7,1.2),a=this._osc("sawtooth",40),r=a.frequency;r.setValueAtTime(St(25,40),e);let o=8;for(let d=1;d<=o;d++)r.linearRampToValueAtTime(St(30,110),e+s*d/o);let l=this._filter("bandpass",St(700,1e3),9),c=this._filter("bandpass",St(1600,2200),12),h=this.ctx.createGain();h.gain.setValueAtTime(1e-4,e),h.gain.linearRampToValueAtTime((i.v||1)*.5,e+.08),h.gain.linearRampToValueAtTime((i.v||1)*.35,e+s*.7),h.gain.exponentialRampToValueAtTime(1e-4,e+s),a.connect(l).connect(h),a.connect(c).connect(h),h.connect(t),a.start(e),a.stop(e+s+.1)}_door_open(t,e,i){this._noiseBurst(t,e,.04,{f:3e3,q:3,peak:.4}),this._tone(t,e,"square",1200,.02,.05),i.creak!==!1&&Math.random()<(i.creakChance||.75)&&this._creak(t,e+.05,{dur:St(.6,1.1),v:i.creakV||.9})}_door_close(t,e){this._noiseBurst(t,e,.12,{type:"lowpass",f:400,peak:.9}),this._tone(t,e,"sine",70,.15,.7),this._noiseBurst(t,e+.02,.04,{f:2500,q:3,peak:.35})}_door_slam(t,e){this._noiseBurst(t,e,.35,{type:"lowpass",f:700,peak:1.4}),this._tone(t,e,"sine",55,.4,1.2),this._noiseBurst(t,e+.03,.2,{f:1800,q:2,peak:.5});for(let i=0;i<4;i++)this._noiseBurst(t,e+.1+i*.05,.03,{f:3e3,q:4,peak:.12})}_locked(t,e){for(let i=0;i<3;i++)this._noiseBurst(t,e+i*.09,.05,{f:2400,q:5,peak:.45}),this._tone(t,e+i*.09,"square",900+i*40,.02,.05)}_knock(t,e,i){let s=i.n||3;for(let a=0;a<s;a++){let r=e+a*(i.gap||.32)+St(0,.03);this._noiseBurst(t,r,.09,{type:"lowpass",f:600,peak:1*(i.v||1)}),this._tone(t,r,"sine",110,.1,.8*(i.v||1))}}_drawer(t,e,i){let a=this._src(this.noiseBuf),r=this._filter("bandpass",700,2);r.frequency.setValueAtTime(i.close?1400:600,e),r.frequency.linearRampToValueAtTime(i.close?600:1400,e+.35);let o=this.ctx.createGain();o.gain.setValueAtTime(1e-4,e),o.gain.linearRampToValueAtTime(.35,e+.04),o.gain.linearRampToValueAtTime(.2,e+.35),o.gain.exponentialRampToValueAtTime(1e-4,e+.35+.05),a.connect(r).connect(o).connect(t),a.start(e,St(0,2)),a.stop(e+.35+.1),i.close&&this._noiseBurst(t,e+.35,.06,{type:"lowpass",f:500,peak:.6})}_switch(t,e){this._noiseBurst(t,e,.015,{type:"highpass",f:2e3,peak:.5}),this._tone(t,e,"square",2600,.01,.08)}_breaker(t,e){this._noiseBurst(t,e,.08,{type:"lowpass",f:1200,peak:1}),this._tone(t,e,"sine",90,.12,.8),this._noiseBurst(t,e+.01,.02,{f:4e3,q:2,peak:.6})}_power_up(t,e){for(let r=0;r<5;r++)this._noiseBurst(t,e+r*St(.05,.14),.03,{f:St(3e3,6e3),q:3,peak:.25});let i=this._osc("sawtooth",50),s=this.ctx.createGain(),a=this._filter("lowpass",300,1);this._env(s,e+.3,.2,.25,1.4),i.frequency.setValueAtTime(30,e+.3),i.frequency.linearRampToValueAtTime(60,e+1.2),i.connect(a).connect(s).connect(t),i.start(e+.3),i.stop(e+2)}_power_down(t,e){let i=this._osc("sawtooth",60),s=this.ctx.createGain(),a=this._filter("lowpass",500,1);this._env(s,e,.01,.5,1.2),i.frequency.setValueAtTime(120,e),i.frequency.exponentialRampToValueAtTime(20,e+1.2),i.connect(a).connect(s).connect(t),i.start(e),i.stop(e+1.4),this._noiseBurst(t,e,.1,{type:"lowpass",f:900,peak:.8})}_pickup(t,e){this._noiseBurst(t,e,.12,{f:1800,q:.8,peak:.25}),this._tone(t,e+.02,"sine",660,.12,.06)}_page(t,e){let i=this._src(this.noiseBuf),s=this._filter("bandpass",3e3,.7),a=this.ctx.createGain();a.gain.setValueAtTime(0,e);for(let r=0;r<6;r++)a.gain.linearRampToValueAtTime(St(.05,.25),e+r*.05);a.gain.linearRampToValueAtTime(0,e+.35),i.connect(s).connect(a).connect(t),i.start(e,St(0,2)),i.stop(e+.4)}_ui(t,e){this._tone(t,e,"sine",880,.05,.04)}_ui_back(t,e){this._tone(t,e,"sine",520,.06,.04)}_phone_vibrate(t,e,i){let s=i.n||2;for(let a=0;a<s;a++){let r=e+a*.45,o=this._osc("square",150),l=this._filter("lowpass",260,2),c=this.ctx.createGain();c.gain.setValueAtTime(0,r),c.gain.linearRampToValueAtTime(.35,r+.02),c.gain.setValueAtTime(.35,r+.28),c.gain.linearRampToValueAtTime(0,r+.3),o.connect(l).connect(c).connect(t),o.start(r),o.stop(r+.32)}}_phone_notify(t,e){this._tone(t,e,"sine",1318,.12,.12),this._tone(t,e+.1,"sine",1760,.18,.1)}_phone_glitch(t,e){for(let i=0;i<8;i++)this._tone(t,e+i*.035,"square",St(300,2400),.03,.06);this._noiseBurst(t,e,.3,{f:2500,q:.5,peak:.15})}_shutter(t,e){this._noiseBurst(t,e,.03,{type:"highpass",f:3e3,peak:.5}),this._noiseBurst(t,e+.07,.04,{type:"highpass",f:2500,peak:.4})}_record_beep(t,e){this._tone(t,e,"sine",1e3,.15,.1)}_intercom(t,e,i){let s=i.dur||1.4,a=this._osc("square",460),r=this._osc("square",473),o=this._osc("square",32),l=this.ctx.createGain();l.gain.value=.5;let c=this.ctx.createGain();c.gain.setValueAtTime(0,e),c.gain.linearRampToValueAtTime(.28,e+.01),c.gain.setValueAtTime(.28,e+s),c.gain.linearRampToValueAtTime(0,e+s+.02);let h=this.ctx.createGain();h.gain.value=.5,o.connect(l).connect(h.gain);let d=this._filter("bandpass",1400,.8);a.connect(h),r.connect(h),h.connect(d).connect(c).connect(t),[a,r,o].forEach(u=>{u.start(e),u.stop(e+s+.05)})}_intercom_static(t,e,i){this._noiseBurst(t,e,i.dur||1.2,{f:1800,q:.6,peak:.25,a:.05})}_meow(t,e,i){let s=i.dur||St(.55,.8),a=i.pitch||St(480,620),r=this._osc("sawtooth",a);r.frequency.setValueAtTime(a*.8,e),r.frequency.linearRampToValueAtTime(a*1.45,e+s*.35),r.frequency.linearRampToValueAtTime(a*.9,e+s);let o=this._osc("sine",7),l=this.ctx.createGain();l.gain.value=12,o.connect(l).connect(r.frequency);let c=this._filter("bandpass",800,4);c.frequency.setValueAtTime(700,e),c.frequency.linearRampToValueAtTime(1900,e+s*.4),c.frequency.linearRampToValueAtTime(900,e+s);let h=this._filter("bandpass",2600,6),d=this.ctx.createGain();d.gain.setValueAtTime(1e-4,e),d.gain.linearRampToValueAtTime(.35*(i.v||1),e+.06),d.gain.linearRampToValueAtTime(.25*(i.v||1),e+s*.7),d.gain.exponentialRampToValueAtTime(1e-4,e+s),r.connect(c).connect(d),r.connect(h).connect(d),d.connect(t),r.start(e),r.stop(e+s+.05),o.start(e),o.stop(e+s+.05)}_hiss(t,e){let i=this._noiseBurst(t,e,1,{type:"highpass",f:2500,peak:.45,a:.05});i.g.gain.setValueAtTime(.45,e+.3),i.g.gain.exponentialRampToValueAtTime(1e-4,e+1.1)}_honk(t,e,i){let s=(r,o)=>{let l=this._osc("sawtooth",o);l.frequency.setValueAtTime(o*1.05,r),l.frequency.linearRampToValueAtTime(o*.93,r+.22);let c=this.ctx.createWaveShaper();c.curve=this.distCurve;let h=this._filter("bandpass",950,3),d=this._filter("bandpass",2100,5),u=this.ctx.createGain();u.gain.setValueAtTime(1e-4,r),u.gain.linearRampToValueAtTime(.5*(i.v||1),r+.02),u.gain.setValueAtTime(.45*(i.v||1),r+.18),u.gain.exponentialRampToValueAtTime(1e-4,r+.3),l.connect(c),c.connect(h).connect(u),c.connect(d).connect(u),u.connect(t),l.start(r),l.stop(r+.35),this._noiseBurst(t,r,.05,{f:3500,q:6,peak:.12})},a=i.pitch||300;s(e,a),i.single!==!0&&s(e+.36,a*.94)}_clock(t,e,i){this._noiseBurst(t,e,.012,{f:i.tock?1800:2600,q:8,peak:.5})}_heartbeat(t,e,i){let s=i.v||1,a=(r,o)=>{let l=this._osc("sine",62);l.frequency.setValueAtTime(70,r),l.frequency.exponentialRampToValueAtTime(38,r+.12);let c=this.ctx.createGain();this._env(c,r,.008,o*s,.16),l.connect(c).connect(t),l.start(r),l.stop(r+.2)};a(e,.9),a(e+.24,.6)}_breath(t,e,i){let s=i.out,a=i.dur||(s?1.3:1),r=this._src(this.pinkBuf),o=this._filter("bandpass",s?900:1300,.6),l=this.ctx.createGain();l.gain.setValueAtTime(1e-4,e),l.gain.linearRampToValueAtTime((i.v||1)*.3,e+a*.35),l.gain.linearRampToValueAtTime(1e-4,e+a),r.connect(o).connect(l).connect(t),r.start(e,St(0,2)),r.stop(e+a+.05)}_gasp(t,e){let i=this._src(this.pinkBuf),s=this._filter("bandpass",1500,.8),a=this.ctx.createGain();this._env(a,e,.02,.6,.45),i.connect(s).connect(a).connect(t),i.start(e,St(0,2)),i.stop(e+.5)}_whisper(t,e,i){let s=i.syl||Math.floor(St(5,11)),a=this._src(this.pinkBuf),r=this.ctx.createGain(),o=[this._filter("bandpass",800,8),this._filter("bandpass",1500,10),this._filter("bandpass",2500,12)],l=this._filter("highpass",4e3,.7),c=this.ctx.createGain();c.gain.value=0,o.forEach(d=>a.connect(d).connect(r)),a.connect(l).connect(c).connect(t),r.connect(t),r.gain.setValueAtTime(0,e);let h=e;for(let d=0;d<s;d++){let u=Uo(n_),f=St(.12,.24);o.forEach((g,_)=>g.frequency.setValueAtTime(u[_]*St(.9,1.1),h)),Math.random()<.4&&(c.gain.setValueAtTime(.25*(i.v||1),h),c.gain.linearRampToValueAtTime(0,h+.07)),r.gain.linearRampToValueAtTime((i.v||1)*St(1.2,2.4),h+f*.3),r.gain.linearRampToValueAtTime(.02,h+f),h+=f+St(0,.06)}return r.gain.linearRampToValueAtTime(0,h+.05),a.start(e,St(0,2)),a.stop(h+.1),{dur:h-e}}_entity_step(t,e,i){this._tone(t,e,"sine",St(40,50),.25,.9*(i.v||1)),this._noiseBurst(t,e,.15,{type:"lowpass",f:250,peak:.9*(i.v||1)}),Math.random()<.5&&this._noiseBurst(t,e+St(.02,.1),.03,{f:St(2500,4500),q:3,peak:.35*(i.v||1)})}_crack(t,e){for(let i=0;i<4;i++)this._noiseBurst(t,e+i*St(.02,.06),.025,{f:St(1500,5e3),q:2,peak:.5})}_growl(t,e,i){let s=i.dur||1.6,a=this._osc("sawtooth",52),r=this._osc("sawtooth",55.5),o=this._filter("lowpass",380,3);o.frequency.setValueAtTime(200,e),o.frequency.linearRampToValueAtTime(700,e+s*.5),o.frequency.linearRampToValueAtTime(180,e+s);let l=this.ctx.createWaveShaper();l.curve=this.distCurve;let c=this.ctx.createGain();c.gain.setValueAtTime(1e-4,e),c.gain.linearRampToValueAtTime(.6*(i.v||1),e+.3),c.gain.exponentialRampToValueAtTime(1e-4,e+s),a.connect(l),r.connect(l),l.connect(o).connect(c).connect(t),a.start(e),r.start(e),a.stop(e+s+.1),r.stop(e+s+.1),this._noiseBurst(t,e,s*.9,{f:200,q:2,peak:.5*(i.v||1),a:.3})}_scream(t,e,i){let s=i.dur||1.8,a=i.v||1,r=this.ctx.createWaveShaper();r.curve=this.hardCurve;let o=this._filter("bandpass",1900,.9),l=this.ctx.createGain();l.gain.setValueAtTime(1e-4,e),l.gain.linearRampToValueAtTime(.55*a,e+.02),l.gain.exponentialRampToValueAtTime(1e-4,e+s),r.connect(o).connect(l).connect(t);let c=this._osc("sine",13),h=this.ctx.createGain();h.gain.value=70,c.connect(h),[1850,1930,2470,3120,740].forEach(d=>{let u=this._osc("sawtooth",d);u.frequency.setValueAtTime(d*1.1,e),u.frequency.exponentialRampToValueAtTime(d*.7,e+s),h.connect(u.frequency),u.connect(r),u.start(e),u.stop(e+s+.05)}),c.start(e),c.stop(e+s+.05),this._noiseBurst(t,e,s*.7,{type:"highpass",f:900,peak:.45*a})}_stinger(t,e,i){let s=i.v||1,a=this._osc("sine",60);a.frequency.setValueAtTime(75,e),a.frequency.exponentialRampToValueAtTime(28,e+1.4);let r=this.ctx.createGain();this._env(r,e,.004,1.4*s,1.6),a.connect(r).connect(t),a.start(e),a.stop(e+1.8),this._scream(t,e,{dur:1.6,v:1.1*s}),this._noiseBurst(t,e,.9,{type:"highpass",f:600,peak:.9*s}),[523,587,622,740,1244].forEach(o=>this._tone(t,e,"triangle",o*St(.98,1.02),2.2,.12*s));for(let o=0;o<6;o++)this._noiseBurst(t,e+.05+o*.06,.05,{f:St(2e3,6e3),q:3,peak:.3*s})}_stinger_small(t,e,i){let s=i.v||1;[620,660,698].forEach(a=>{let r=this._osc("sawtooth",a),o=this._filter("bandpass",a*1.5,2),l=this.ctx.createGain();this._env(l,e,.01,.22*s,.9),r.connect(o).connect(l).connect(t),r.start(e),r.stop(e+1)}),this._tone(t,e,"sine",50,.6,.8*s)}_swell(t,e,i){let s=i.dur||1.6,a=this._src(this.noiseBuf),r=this._filter("bandpass",400,.8);r.frequency.setValueAtTime(200,e),r.frequency.exponentialRampToValueAtTime(3500,e+s);let o=this.ctx.createGain();o.gain.setValueAtTime(1e-4,e),o.gain.exponentialRampToValueAtTime(.7*(i.v||1),e+s),o.gain.setValueAtTime(1e-4,e+s+.01),a.connect(r).connect(o).connect(t),a.start(e,St(0,1)),a.stop(e+s+.05);let l=this._osc("sawtooth",55);l.frequency.exponentialRampToValueAtTime(110,e+s);let c=this.ctx.createGain();c.gain.setValueAtTime(1e-4,e),c.gain.exponentialRampToValueAtTime(.25*(i.v||1),e+s),c.gain.setValueAtTime(1e-4,e+s+.01);let h=this._filter("lowpass",600,1);l.connect(h).connect(c).connect(t),l.start(e),l.stop(e+s+.05)}_wrong(t,e,i){let s=i.v||1;[220,261.6,311.1,415.3].forEach(a=>{let r=this._osc("triangle",a);r.frequency.setValueAtTime(a,e),r.frequency.linearRampToValueAtTime(a*.82,e+2.2);let o=this.ctx.createGain();this._env(o,e,.3,.09*s,2.2);let l=this._filter("lowpass",1400,1);r.connect(l).connect(o).connect(t),r.start(e),r.stop(e+2.6)}),this._noiseBurst(t,e,2,{f:3e3,q:.5,peak:.03*s,a:.4})}_boom(t,e,i){let s=this._osc("sine",50);s.frequency.setValueAtTime(60,e),s.frequency.exponentialRampToValueAtTime(25,e+2.5);let a=this.ctx.createGain();this._env(a,e,.01,1.2*(i.v||1),3),s.connect(a).connect(t),s.start(e),s.stop(e+3.1),this._noiseBurst(t,e,1.5,{type:"lowpass",f:200,peak:.8*(i.v||1)})}_chime(t,e,i){(i.notes||[57,64,69,73,76]).forEach((a,r)=>this._bell(t,e+r*.12,Ta(a),3.5,.08*(i.v||1)))}_bell(t,e,i,s,a){[[1,1],[2.01,.35],[3.02,.15],[4.2,.07]].forEach(([r,o])=>this._tone(t,e,"sine",i*r,s/r,a*o,.004))}_tv_on(t,e){this._noiseBurst(t,e,.5,{f:4e3,q:.4,peak:.6}),this._tone(t,e,"sine",7800,.8,.02),this._noiseBurst(t,e,.03,{type:"lowpass",f:300,peak:.6})}_tv_off(t,e){let i=this._osc("sine",4e3);i.frequency.exponentialRampToValueAtTime(200,e+.25);let s=this.ctx.createGain();this._env(s,e,.005,.12,.3),i.connect(s).connect(t),i.start(e),i.stop(e+.35),this._noiseBurst(t,e,.03,{type:"lowpass",f:400,peak:.5})}_stove(t,e){for(let i=0;i<4;i++)this._noiseBurst(t,e+i*.18,.012,{f:3500,q:3,peak:.6});this._noiseBurst(t,e+.75,.8,{f:700,q:.6,peak:.12,a:.1})}_fridge_open(t,e){this._noiseBurst(t,e,.08,{type:"lowpass",f:700,peak:.6}),this._noiseBurst(t,e,.4,{f:2500,q:.6,peak:.08,a:.05})}_microwave(t,e,i){let s=i.dur||3,a=this._osc("sawtooth",120),r=this._filter("lowpass",500,1),o=this.ctx.createGain();o.gain.setValueAtTime(0,e),o.gain.linearRampToValueAtTime(.12,e+.1),o.gain.setValueAtTime(.12,e+s),o.gain.linearRampToValueAtTime(0,e+s+.05),a.connect(r).connect(o).connect(t),a.start(e),a.stop(e+s+.1);for(let l=0;l<3;l++)this._tone(t,e+s+.2+l*.35,"sine",2100,.2,.15)}_ice(t,e){for(let i=0;i<6;i++)this._noiseBurst(t,e+i*St(.02,.07),.04,{f:St(3e3,7e3),q:4,peak:.25})}_unlock(t,e){this._noiseBurst(t,e,.05,{f:2800,q:4,peak:.5}),this._noiseBurst(t,e+.15,.08,{f:1800,q:3,peak:.6}),this._tone(t,e+.15,"square",700,.03,.08)}_glass(t,e){for(let i=0;i<10;i++)this._tone(t,e+i*St(.005,.03),"sine",St(2500,7e3),St(.2,.6),.08);this._noiseBurst(t,e,.3,{type:"highpass",f:3e3,peak:.5})}_thud(t,e,i){this._noiseBurst(t,e,.2,{type:"lowpass",f:300,peak:1*(i.v||1)}),this._tone(t,e,"sine",60,.25,.9*(i.v||1))}_water_drip(t,e){let i=this._osc("sine",1400);i.frequency.exponentialRampToValueAtTime(700,e+.08);let s=this.ctx.createGain();this._env(s,e,.002,.12,.1),i.connect(s).connect(t),i.start(e),i.stop(e+.15)}_car(t,e){let i=St(4,7),s=this._src(this.brownBuf),a=this._filter("bandpass",300,.5);a.frequency.setValueAtTime(200,e),a.frequency.linearRampToValueAtTime(700,e+i/2),a.frequency.linearRampToValueAtTime(250,e+i);let r=this.ctx.createGain();r.gain.setValueAtTime(0,e),r.gain.linearRampToValueAtTime(.15,e+i/2),r.gain.linearRampToValueAtTime(0,e+i),s.connect(a).connect(r).connect(t),s.start(e,St(0,2)),s.stop(e+i)}_musicbox_note(t,e,i){this._bell(t,e,i.f,i.dur||1.8,i.v||.12)}musicBox(t,e=1,i=1){if(!this.ready)return 0;let s=[[69,1],[72,1],[76,1],[74,2],[72,1],[71,3],[69,1],[64,1],[69,1],[68,2],[71,1],[76,3],[77,1],[76,1],[74,1],[72,2],[71,1],[69,1],[72,1],[71,1],[69,3],[64,1],[69,1],[72,1],[71,2],[68,1],[69,4]],a=.34/i,r=this.now+.05,o=this._dest({pos:t,vol:e,rev:.5});for(let[l,c]of s){let h=Ta(l)*Math.pow(2,St(-10,10)/1200);this._bell(o,r+St(0,.02),h,2.2,.14),c>=3&&this._bell(o,r,Ta(l-24),2.5,.05),r+=a*c*St(.97,1.05)}return r-this.now}loop(t,e={}){if(!this.ready)return null;let i=this._dest({...e,vol:0}),s=this["_loop_"+t];if(!s)return console.warn("loop desconhecido",t),null;let a=[],r=s.call(this,i,a,e)||{},o=e.vol===void 0?1:e.vol;i.gain.setTargetAtTime(o,this.now,e.fade||.5);let l=this,c={name:t,dest:i,nodes:a,extra:r,vol:o,stopped:!1,setVol(h,d=.3){this.stopped||(this.vol=h,i.gain.setTargetAtTime(Math.max(0,h),l.now,d))},setPos(h){i.panner&&l._setPannerPos(i.panner,h)},set(h,d){r[h]&&r[h](d)},stop(h=.4){this.stopped||(this.stopped=!0,i.gain.setTargetAtTime(0,l.now,h/3),setTimeout(()=>{a.forEach(d=>{try{d.stop()}catch{}});try{i.disconnect()}catch{}},h*1e3+200),l.loops.delete(this))}};return this.loops.add(c),c}stopAllLoops(t=.5){for(let e of[...this.loops])e.stop(t)}_loop_roomtone(t,e){let i=this._src(this.brownBuf,!0),s=this._filter("lowpass",180,.7),a=this.ctx.createGain();a.gain.value=.35,i.connect(s).connect(a).connect(t),i.start(),e.push(i)}_loop_city(t,e){let i=this._src(this.brownBuf,!0),s=this._filter("bandpass",350,.4),a=this.ctx.createGain();a.gain.value=.35;let r=this._osc("sine",.05),o=this.ctx.createGain();o.gain.value=.15,r.connect(o).connect(a.gain),i.connect(s).connect(a).connect(t),i.start(),r.start(),e.push(i,r);let l=this._src(this.noiseBuf,!0),c=this._filter("bandpass",5e3,.5),h=this.ctx.createGain();h.gain.value=.015,l.connect(c).connect(h).connect(t),l.start(),e.push(l)}_loop_fridge(t,e){let i=this._osc("sine",100),s=this._osc("sine",50.4),a=this._osc("triangle",150.5),r=this.ctx.createGain();r.gain.value=.08;let o=this.ctx.createGain();o.gain.value=.5,i.connect(r),s.connect(o).connect(r),a.connect(o),r.connect(t);let l=this._src(this.pinkBuf,!0),c=this._filter("lowpass",400,1),h=this.ctx.createGain();h.gain.value=.05,l.connect(c).connect(h).connect(t),[i,s,a,l].forEach(d=>{d.start(),e.push(d)})}_loop_fan(t,e,i){let s=this._src(this.pinkBuf,!0),a=this._filter("bandpass",380,.6),r=this.ctx.createGain();r.gain.value=.3;let o=this._osc("sine",i.rate||3.2),l=this.ctx.createGain();l.gain.value=.18,o.connect(l).connect(r.gain),s.connect(a).connect(r).connect(t),s.start(),o.start(),e.push(s,o);let c=this._osc("sine",i.rate||3.2),h=this.ctx.createGain();return h.gain.value=0,e.push(c),{rate:d=>{o.frequency.setTargetAtTime(d,this.now,1)}}}_loop_static(t,e,i){let s=this._src(this.noiseBuf,!0),a=this._filter("highpass",i.hp||900,.7),r=this._filter("peaking",4e3,1);r.gain.value=6;let o=this.ctx.createGain();o.gain.value=.28,s.connect(a).connect(r).connect(o).connect(t),s.start(),e.push(s);let l=this._osc("sawtooth",60),c=this._filter("lowpass",200,1),h=this.ctx.createGain();h.gain.value=.04,l.connect(c).connect(h).connect(t),l.start(),e.push(l)}_loop_radio(t,e){let i=this._src(this.noiseBuf,!0),s=this._filter("bandpass",1800,.5),a=this.ctx.createGain();a.gain.value=0,i.connect(s).connect(a).connect(t),i.start(),e.push(i);let r=this._src(this.noiseBuf,!0,.5),o=this._filter("highpass",2500,1),l=this.ctx.createGain();l.gain.value=0;let c=this._osc("square",9),h=this.ctx.createGain();h.gain.value=0,c.connect(h).connect(l.gain),r.connect(o).connect(l).connect(t),r.start(),c.start(),e.push(r,c);let d=this._osc("sine",1200),u=this.ctx.createGain();return u.gain.value=0,d.connect(u).connect(t),d.start(),e.push(d),{level:f=>{let g=this.now;a.gain.setTargetAtTime(.04+.4*f,g,.1),h.gain.setTargetAtTime(.35*f*f,g,.1),c.frequency.setTargetAtTime(6+20*f,g,.2),s.frequency.setTargetAtTime(1600+1400*f,g,.2),u.gain.setTargetAtTime(f>.85?.04:0,g,.05),d.frequency.setTargetAtTime(900+St(0,800),g,.02)}}}_loop_drone(t,e,i){let s=i.base||55,a=this.ctx.createGain();a.gain.value=.25;let r=this._filter("lowpass",i.cut||260,1),o=this._osc("sine",.07),l=this.ctx.createGain();l.gain.value=120,o.connect(l).connect(r.frequency);let c=[this._osc("sine",s),this._osc("sine",s*1.012),this._osc("sawtooth",s*2.003)];return i.dark&&c.push(this._osc("triangle",s*1.414),this._osc("sawtooth",s*.5)),c.forEach(h=>{h.connect(r),h.start(),e.push(h)}),r.connect(a).connect(t),o.start(),e.push(o),{cut:h=>r.frequency.setTargetAtTime(h,this.now,1)}}_loop_heart(t,e,i){let s=i.rate||1.1,a=!0,r=()=>{a&&(this._heartbeat(t,this.now+.02,{v:.9}),setTimeout(r,1e3/s))};return r(),e.push({stop:()=>{a=!1}}),{rate:o=>{s=Pe(o,.6,3.2)}}}_loop_clock(t,e){let i=!0,s=!1,a=()=>{i&&(this._clock(t,this.now+.01,{tock:s}),s=!s,setTimeout(a,1e3))};a(),e.push({stop:()=>{i=!1}})}_loop_growl(t,e){let i=this._osc("sawtooth",41),s=this._osc("sawtooth",43.7),a=this._filter("lowpass",240,4),r=this._osc("sine",.4),o=this.ctx.createGain();o.gain.value=140,r.connect(o).connect(a.frequency);let l=this.ctx.createGain();l.gain.value=.35;let c=this._osc("sine",1.7),h=this.ctx.createGain();h.gain.value=.2,c.connect(h).connect(l.gain),i.connect(a),s.connect(a),a.connect(l).connect(t);let d=this._src(this.pinkBuf,!0),u=this._filter("bandpass",160,2),f=this.ctx.createGain();f.gain.value=.6,d.connect(u).connect(f).connect(l),[i,s,r,c,d].forEach(g=>{g.start(),e.push(g)})}_loop_shower(t,e){let i=this._src(this.noiseBuf,!0),s=this._filter("highpass",400,.5),a=this._filter("lowpass",6e3,.5),r=this.ctx.createGain();r.gain.value=.25,i.connect(s).connect(a).connect(r).connect(t),i.start(),e.push(i)}_loop_whispers(t,e,i){let s=!0,a=()=>{if(!s)return;let r=this._whisper(t,this.now+.05,{v:i.v||.7});setTimeout(a,(r.dur+St(.3,2.5))*1e3)};a(),e.push({stop:()=>{s=!1}})}_loop_party(t,e){let i=!0,s=()=>{i&&(this._whisper(t,this.now+.02,{v:.35,syl:4+Math.floor(St(0,4))}),Math.random()<.25&&this._noiseBurst(t,this.now+.1,.4,{f:1200,q:.8,peak:.05}),setTimeout(s,St(300,1100)))};s(),e.push({stop:()=>{i=!1}})}music(t){if(!this.ready||this.musicHandle&&this.musicHandle.kind===t||(this.stopMusic(),!t))return;let e=!0,i=this._dest({bus:"mus",vol:0});i.gain.setTargetAtTime(1,this.now,1.5);let s=[],a=this;if(t==="menu"||t==="memory"||t==="end"||t==="nowhere"){let r=t==="end"?[[57,64,69,72],[53,60,65,69],[48,55,64,67],[52,59,64,68]]:t==="nowhere"?[[50,57,62,66],[47,54,59,62],[43,50,55,59],[45,52,57,61]]:[[57,60,64,69],[53,57,60,65],[50,53,57,62],[52,56,59,64]],o=0,l=this._loop_drone(i,s,{base:t==="memory"?110:55,cut:t==="memory"?700:300}),c=()=>{if(!e)return;let h=r[o%r.length],d=a.now+.05;h.forEach((u,f)=>{let g=Ta(u)*Math.pow(2,St(-12,12)/1200),_=t==="memory"?1.8:3.4;a._bell(i,d+f*(t==="nowhere"?.5:.62),g,_,t==="end"?.07:.05)}),o%2===1&&t!=="nowhere"&&a._bell(i,d+2.6,Ta(h[3]+12),3,.025),o++,setTimeout(c,t==="nowhere"?4200:4800)};c()}else if(t==="chase"){let r=this._loop_drone(i,s,{base:41.2,cut:500,dark:!0}),o=()=>{e&&(a._heartbeat(i,a.now+.02,{v:.9}),a._noiseBurst(i,a.now+.3,.06,{f:St(1500,4e3),q:6,peak:.08}),setTimeout(o,520))};o()}else t==="dread"&&this._loop_drone(i,s,{base:36.7,cut:180,dark:!0});this.musicHandle={kind:t,stop(){e=!1,i.gain.setTargetAtTime(0,a.now,.6),setTimeout(()=>{s.forEach(r=>{try{r.stop()}catch{}});try{i.disconnect()}catch{}},2500)}}}stopMusic(){this.musicHandle&&(this.musicHandle.stop(),this.musicHandle=null)}speak(t,e={}){if(!(!te.tts||!window.speechSynthesis))try{let i=new SpeechSynthesisUtterance(t),s=window.speechSynthesis.getVoices(),a=s.filter(o=>/pt[-_]BR/i.test(o.lang)),r=(e.female?a.find(o=>/female|maria|francisca|luciana|vit|fem/i.test(o.name)):null)||a[0]||s.find(o=>/^pt/i.test(o.lang));r&&(i.voice=r),i.lang="pt-BR",i.pitch=e.pitch===void 0?1:e.pitch,i.rate=e.rate===void 0?.9:e.rate,i.volume=Pe(te.master*te.voices*(e.vol===void 0?1:e.vol),0,1),window.speechSynthesis.speak(i)}catch{}}hush(){try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch{}}},C=new Gc;var s_=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,a_=`
precision highp float;
uniform sampler2D tDiffuse;
uniform vec2 res;
uniform float time, exposure, grain, vignette, chroma, scan, glitch, mode, flash, redFlash, desat, blackout, warp, fisheye, bright;
uniform vec3 tint;
varying vec2 vUv;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
vec3 aces(vec3 x){ const float a=2.51, b=0.03, c=2.43, d=0.59, e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0); }

void main(){
  vec2 uv = vUv;
  vec2 cc = uv - 0.5;
  // lente de celular levemente abaulada
  if (fisheye > 0.0) { float r2 = dot(cc, cc); uv = 0.5 + cc * (1.0 - fisheye * r2); }
  // distor\xE7\xE3o de "casa mudando"
  if (warp > 0.0) {
    uv.x += sin(uv.y * 18.0 + time * 3.0) * 0.006 * warp;
    uv.y += sin(uv.x * 14.0 + time * 2.3) * 0.004 * warp;
  }
  // glitch: faixas horizontais deslocadas
  if (glitch > 0.0) {
    float band = floor(uv.y * 24.0 + floor(time * 18.0));
    float n = hash(vec2(band, floor(time * 30.0)));
    if (n < glitch * 0.5) uv.x += (hash(vec2(band, time)) - 0.5) * 0.12 * glitch;
    uv.y += (hash(vec2(floor(time*40.0), 3.0)) - 0.5) * 0.01 * glitch;
  }
  // VHS: leve tremor de linha
  if (scan > 0.0) uv.x += (hash(vec2(floor(uv.y * res.y * 0.5), floor(time * 24.0))) - 0.5) * 0.0025 * scan;

  float ca = chroma * (0.4 + length(cc));
  vec3 col;
  col.r = texture2D(tDiffuse, uv + vec2(ca, 0.0) * 0.004).r;
  col.g = texture2D(tDiffuse, uv).g;
  col.b = texture2D(tDiffuse, uv - vec2(ca, 0.0) * 0.004).b;

  col *= exposure;
  col = aces(col);
  col = pow(col, vec3(1.0/2.2));

  // modos da c\xE2mera do celular
  if (mode > 0.5 && mode < 1.5) { // C\xC2MERA
    col = mix(col, vec3(dot(col, vec3(0.3,0.59,0.11))), 0.25);
    col *= vec3(0.95, 1.02, 0.98);
    col += bright;
  } else if (mode > 1.5) { // V\xCDDEO (mem\xF3ria gravada)
    float l = dot(col, vec3(0.3,0.59,0.11));
    col = mix(col, vec3(l) * vec3(0.8, 0.95, 1.15), 0.55);
    col += bright;
  }
  float l = dot(col, vec3(0.3,0.59,0.11));
  col = mix(col, vec3(l), desat);
  col *= tint;

  // scanlines
  if (scan > 0.0) {
    col *= 1.0 - scan * 0.18 * (0.5 + 0.5 * sin(uv.y * res.y * 1.6));
    col += (hash(uv * res + time) - 0.5) * 0.06 * scan;
  }
  // gr\xE3o
  col += (hash(uv * res * 0.7 + fract(time * 7.0)) - 0.5) * grain;
  // vinheta
  float v = smoothstep(0.85, 0.2, length(cc * vec2(1.1, 1.0)));
  col *= mix(1.0, v, vignette);

  col = mix(col, vec3(1.0), flash);
  col = mix(col, vec3(0.6, 0.0, 0.0), redFlash);
  col *= 1.0 - blackout;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`,Oo=class{constructor(t){this.renderer=t;let e=t.getDrawingBufferSize(new jt);this.rt=new Ze(e.x,e.y,{type:li,samples:0}),this.uniforms={tDiffuse:{value:this.rt.texture},res:{value:new jt(e.x,e.y)},time:{value:0},exposure:{value:1},grain:{value:.05},vignette:{value:.75},chroma:{value:.6},scan:{value:0},glitch:{value:0},mode:{value:0},flash:{value:0},redFlash:{value:0},desat:{value:.1},blackout:{value:0},warp:{value:0},fisheye:{value:0},tint:{value:new Xt(1,1,1)},bright:{value:0}},this.mat=new ze({uniforms:this.uniforms,vertexShader:s_,fragmentShader:a_,depthTest:!1,depthWrite:!1}),this.quad=new Lt(new Me(2,2),this.mat),this.quad.frustumCulled=!1,this.scene=new Gn,this.scene.add(this.quad),this.cam=new qn(-1,1,1,-1,0,1)}setSize(){let t=this.renderer.getDrawingBufferSize(new jt);this.rt.setSize(t.x,t.y),this.uniforms.res.value.set(t.x,t.y)}render(t,e){let i=this.renderer;i.setRenderTarget(this.rt),i.clear(),i.render(t,e),i.setRenderTarget(null),i.render(this.scene,this.cam)}};var Wc=new Map,_d=4;function xd(n){_d=n}function Ee(n,t){let e=document.createElement("canvas");return e.width=n,e.height=t,e}function Te(n,t=1,e={}){let i=new Je(n);return i.colorSpace=e.linear?Wi:xe,i.wrapS=i.wrapT=e.clamp?Di:ji,i.anisotropy=_d,i.userData.size=t,i}function ke(n,t){return Wc.has(n)||Wc.set(n,t()),Wc.get(n)}function Pi(n,t,e,i,s,a,r=1,o=2,l=.05){n.fillStyle=a;for(let c=0;c<s;c++){n.globalAlpha=l*(.4+i());let h=r+i()*(o-r);n.fillRect(i()*t,i()*e,h,h)}n.globalAlpha=1}function Aa(n,t,e,i,s,a,r,o,l){for(let c=0;c<s;c++){let h=i()*t,d=i()*e,u=r+i()*(o-r),f=n.createRadialGradient(h,d,0,h,d,u);f.addColorStop(0,a.replace("A",String(l*(.5+i())))),f.addColorStop(1,a.replace("A","0")),n.fillStyle=f,n.fillRect(h-u,d-u,u*2,u*2)}}function qi(n,t={}){return ke("paint"+n+JSON.stringify(t),()=>{let e=Ee(256,256),i=e.getContext("2d"),s=Ie(t.seed||7);return i.fillStyle=n,i.fillRect(0,0,256,256),Pi(i,256,256,s,2500,"#000",1,2,.035),Pi(i,256,256,s,1500,"#fff",1,2,.03),t.mottled&&Aa(i,256,256,s,40,"rgba(0,0,0,A)",20,70,t.mottled),t.stains&&Aa(i,256,256,s,10,"rgba(60,40,20,A)",10,40,t.stains),Te(e,t.size||1.2)})}function yd(){return ke("purple",()=>{let n=Ee(512,512),t=n.getContext("2d"),e=Ie(21);return t.fillStyle="#6e57a8",t.fillRect(0,0,512,512),Aa(t,512,512,e,90,"rgba(160,140,210,A)",20,90,.25),Aa(t,512,512,e,60,"rgba(40,25,80,A)",15,70,.25),Pi(t,512,512,e,9e3,"#fff",1,2,.05),Pi(t,512,512,e,5e3,"#000",1,2,.05),Te(n,1.6)})}function qc(n="#dfe3e6",t=.3,e={}){return ke("wtile"+n+t+JSON.stringify(e),()=>{let i=Ee(256,256),s=i.getContext("2d"),a=Ie(3);s.fillStyle=e.grout||"#9aa3a8",s.fillRect(0,0,256,256);let r=2,o=256/r;for(let l=0;l<r;l++)for(let c=0;c<r;c++){let h=s.createLinearGradient(c*o,l*o,c*o+o,l*o+o);h.addColorStop(0,n),h.addColorStop(1,zo(n,-.06+a()*.04)),s.fillStyle=h,s.fillRect(c*o+2,l*o+2,o-4,o-4),s.fillStyle="rgba(255,255,255,0.18)",s.fillRect(c*o+8,l*o+6,o*.5,4)}return Pi(s,256,256,a,800,"#000",1,2,.03),Te(i,t*r)})}function Ra(n="#d8ccb4",t={}){return ke("ftile"+n+JSON.stringify(t),()=>{let e=Ee(512,512),i=e.getContext("2d"),s=Ie(t.seed||11);i.fillStyle=t.grout||"#a8a090",i.fillRect(0,0,512,512),t.diagonal&&(i.translate(256,256),i.rotate(Math.PI/4),i.translate(-362,-362));let a=t.diagonal?181:256,r=t.diagonal?4:2;for(let o=0;o<r;o++)for(let l=0;l<r;l++){i.fillStyle=zo(n,(s()-.5)*.06),i.fillRect(l*a+2,o*a+2,a-4,a-4);for(let c=0;c<6;c++)i.strokeStyle=`rgba(120,100,80,${.05+s()*.06})`,i.lineWidth=1+s()*3,i.beginPath(),i.moveTo(l*a+s()*a,o*a+s()*a),i.bezierCurveTo(l*a+s()*a,o*a+s()*a,l*a+s()*a,o*a+s()*a,l*a+s()*a,o*a+s()*a),i.stroke()}return i.setTransform(1,0,0,1,0,0),Pi(i,512,512,s,2e3,"#000",1,2,.03),Te(e,t.size||1.2)})}function Us(n={}){return ke("wfloor"+JSON.stringify(n),()=>{let t=Ee(512,512),e=t.getContext("2d"),i=Ie(n.seed||5),s=4,a=512/s,r=n.tones||["#7a4a2c","#8a5634","#6d4128","#94603a","#7f4f30"];for(let l=0;l<s;l++){let c=-i()*300;for(;c<512;){let h=260+i()*260;e.fillStyle=r[Math.floor(i()*r.length)],e.fillRect(c,l*a,h,a);for(let d=0;d<16;d++){e.strokeStyle=`rgba(40,20,10,${.08+i()*.12})`,e.lineWidth=1+i()*1.5;let u=l*a+i()*a;e.beginPath(),e.moveTo(c,u),e.bezierCurveTo(c+h*.3,u+(i()-.5)*8,c+h*.6,u+(i()-.5)*8,c+h,u+(i()-.5)*6),e.stroke()}i()<.3&&(e.fillStyle="rgba(40,20,10,0.25)",e.beginPath(),e.ellipse(c+i()*h,l*a+i()*a,8+i()*8,3+i()*3,0,0,Math.PI*2),e.fill()),e.fillStyle="rgba(20,10,5,0.55)",e.fillRect(c,l*a,2,a),c+=h}e.fillStyle="rgba(20,10,5,0.6)",e.fillRect(0,l*a,512,2)}let o=e.createLinearGradient(0,0,512,512);return o.addColorStop(0,"rgba(255,220,180,0.06)"),o.addColorStop(1,"rgba(0,0,0,0.06)"),e.fillStyle=o,e.fillRect(0,0,512,512),Te(t,n.size||2.4)})}function Vo(n="#b98a5a",t={}){return ke("wgrain"+n+JSON.stringify(t),()=>{let e=Ee(256,256),i=e.getContext("2d"),s=Ie(t.seed||9);i.fillStyle=n,i.fillRect(0,0,256,256);for(let a=0;a<70;a++){i.strokeStyle=`rgba(60,30,10,${.05+s()*.12})`,i.lineWidth=.5+s()*2;let r=s()*256;i.beginPath(),i.moveTo(r,0),i.bezierCurveTo(r+(s()-.5)*30,80,r+(s()-.5)*30,170,r+(s()-.5)*20,256),i.stroke()}if(t.vertical===!1){let a=Ee(256,256),r=a.getContext("2d");return r.translate(256,0),r.rotate(Math.PI/2),r.drawImage(e,0,0),Te(a,t.size||1)}return Te(e,t.size||1)})}function Ho(n={}){return ke("door"+JSON.stringify(n),()=>{let t=Ee(256,512),e=t.getContext("2d"),i=Ie(n.seed||13),s=n.base||"#6a2f1c";e.fillStyle=s,e.fillRect(0,0,256,512);for(let r=0;r<90;r++){e.strokeStyle=`rgba(30,10,5,${.06+i()*.12})`,e.lineWidth=.5+i()*2;let o=i()*256;e.beginPath(),e.moveTo(o,0),e.bezierCurveTo(o+(i()-.5)*20,170,o+(i()-.5)*20,340,o+(i()-.5)*10,512),e.stroke()}let a=e.createLinearGradient(0,0,256,0);if(a.addColorStop(0,"rgba(255,200,160,0.08)"),a.addColorStop(.5,"rgba(255,200,160,0.0)"),a.addColorStop(1,"rgba(0,0,0,0.12)"),e.fillStyle=a,e.fillRect(0,0,256,512),n.pattern==="diag"){e.strokeStyle="rgba(25,10,4,0.75)",e.lineWidth=3;let r=[[40,0,40,512],[216,0,216,512],[40,150,216,120],[40,330,216,300],[128,120,150,512],[60,0,100,150]];for(let[o,l,c,h]of r)e.beginPath(),e.moveTo(o,l),e.lineTo(c,h),e.stroke()}else if(n.pattern==="grooves"){e.strokeStyle="rgba(20,8,4,0.7)",e.lineWidth=3;for(let r of[64,128,192])e.beginPath(),e.moveTo(r,40),e.lineTo(r,472),e.stroke();e.beginPath(),e.moveTo(40,40),e.lineTo(216,40),e.moveTo(40,472),e.lineTo(216,472),e.stroke()}else n.pattern==="old"&&(e.strokeStyle="rgba(15,5,2,0.8)",e.lineWidth=4,e.strokeRect(36,40,184,180),e.strokeRect(36,260,184,210),Aa(e,256,512,i,30,"rgba(0,0,0,A)",10,50,.3));return Te(t,1,{clamp:!0})})}function Xi(n="#6b6b6b",t={}){return ke("fabric"+n+JSON.stringify(t),()=>{let e=Ee(256,256),i=e.getContext("2d"),s=Ie(t.seed||17);i.fillStyle=n,i.fillRect(0,0,256,256);for(let a=0;a<256;a+=2)i.fillStyle=`rgba(0,0,0,${.03+s()*.04})`,i.fillRect(0,a,256,1);for(let a=0;a<256;a+=2)i.fillStyle=`rgba(255,255,255,${.02+s()*.03})`,i.fillRect(a,0,1,256);return Pi(i,256,256,s,1500,"#000",1,2,.05),Te(e,t.size||.5)})}function bd(){return ke("blanket",()=>{let n=Ee(256,256),t=n.getContext("2d");t.fillStyle="#e9eef4",t.fillRect(0,0,256,256),t.strokeStyle="#2d4f8f",t.lineWidth=5;for(let i=0;i<4;i++)for(let s=0;s<4;s++){let a=s*64+32,r=i*64+32;t.beginPath(),t.moveTo(a,r-24),t.lineTo(a+24,r),t.lineTo(a,r+24),t.lineTo(a-24,r),t.closePath(),t.stroke(),t.fillStyle="#35589a",t.fillRect(a-4,r-4,8,8)}let e=Ie(4);return Pi(t,256,256,e,2e3,"#223",1,2,.08),Te(n,.7)})}function Md(n="#233e86"){return ke("knit"+n,()=>{let t=Ee(128,128),e=t.getContext("2d");e.fillStyle=n,e.fillRect(0,0,128,128);for(let i=0;i<128;i+=16)for(let s=0;s<128;s+=16){let a=e.createRadialGradient(s+8,i+8,1,s+8,i+8,10);a.addColorStop(0,"rgba(255,255,255,0.18)"),a.addColorStop(1,"rgba(0,0,0,0.35)"),e.fillStyle=a,e.fillRect(s,i,16,16)}return Te(t,.25)})}function Xc(n="#bfae96"){return ke("curtain"+n,()=>{let t=Ee(256,64),e=t.getContext("2d"),i=e.createLinearGradient(0,0,256,0);for(let s=0;s<=8;s++)i.addColorStop(s/8,s%2?zo(n,-.18):zo(n,.06));return e.fillStyle=i,e.fillRect(0,0,256,64),Te(t,1.2)})}function Sd(){return ke("granite",()=>{let n=Ee(256,256),t=n.getContext("2d"),e=Ie(31);return t.fillStyle="#2a2622",t.fillRect(0,0,256,256),Pi(t,256,256,e,5e3,"#8a7a60",1,3,.35),Pi(t,256,256,e,3e3,"#000",1,3,.4),Pi(t,256,256,e,800,"#c8b89a",1,2,.4),Te(n,.6)})}function Go(n=!1){return ke("popart"+n,()=>{let t=Ee(512,384),e=t.getContext("2d"),i=Ie(99),s=["#f5d10c","#e8327a","#1ea5e0","#3cc34a","#f47a12","#9b3fd1","#ffffff","#ee2b2b"];e.fillStyle="#fff",e.fillRect(0,0,512,384);for(let r=0;r<26;r++){e.fillStyle=s[Math.floor(i()*s.length)],e.beginPath();let o=i()*512,l=i()*384;e.moveTo(o,l);for(let c=0;c<4;c++)e.lineTo(o+(i()-.5)*260,l+(i()-.5)*220);e.closePath(),e.fill(),e.lineWidth=6,e.strokeStyle="#111",e.stroke()}let a=(r,o,l)=>{e.fillStyle=o,e.strokeStyle="#111",e.lineWidth=7,e.beginPath(),e.ellipse(r,150,58,66,0,0,Math.PI*2),e.fill(),e.stroke(),e.fillStyle=l,e.beginPath(),e.ellipse(r,102,64,32,0,Math.PI,Math.PI*2),e.fill(),e.stroke(),e.fillStyle="#111",e.beginPath(),e.arc(r-20,146,7,0,Math.PI*2),e.arc(r+20,146,7,0,Math.PI*2),e.fill(),e.lineWidth=5,e.beginPath(),e.arc(r,170,22,.15*Math.PI,.85*Math.PI),e.stroke(),e.lineWidth=7,e.fillStyle=s[Math.floor(i()*6)],e.beginPath(),e.moveTo(r-70,384),e.lineTo(r-60,230),e.lineTo(r+60,230),e.lineTo(r+70,384),e.closePath(),e.fill(),e.stroke();for(let c=0;c<6;c++)e.fillStyle="#111",e.beginPath(),e.arc(r-40+i()*80,260+i()*110,5,0,Math.PI*2),e.fill()};if(a(190,"#f7c89b","#f47a12"),a(330,"#fbe1b0","#f5d10c"),e.fillStyle="#e8327a",e.strokeStyle="#111",e.lineWidth=5,Yc(e,260,60,26),e.lineWidth=16,e.strokeStyle="#fafafa",e.strokeRect(0,0,512,384),n){let r=Ee(512,384),o=r.getContext("2d");return o.translate(512,384),o.rotate(Math.PI),o.drawImage(t,0,0),Te(r,1,{clamp:!0})}return Te(t,1,{clamp:!0})})}function Yc(n,t,e,i){n.beginPath(),n.moveTo(t,e+i*.3),n.bezierCurveTo(t,e,t-i,e,t-i,e+i*.4),n.bezierCurveTo(t-i,e+i,t,e+i*1.2,t,e+i*1.6),n.bezierCurveTo(t,e+i*1.2,t+i,e+i,t+i,e+i*.4),n.bezierCurveTo(t+i,e,t,e,t,e+i*.3),n.fill(),n.stroke()}function wd(n="Fam\xEDlia"){return ke("keysign"+n,()=>{let t=Ee(256,128),e=t.getContext("2d"),i=e.createLinearGradient(0,0,256,128);return i.addColorStop(0,"#b7875b"),i.addColorStop(1,"#94683f"),e.fillStyle=i,e.fillRect(0,0,256,128),e.strokeStyle="#5a3a1f",e.lineWidth=6,e.strokeRect(3,3,250,122),e.fillStyle="#3b2412",e.font='italic 52px "Brush Script MT", "Segoe Script", cursive',e.textAlign="center",e.textBaseline="middle",e.fillText(n,128,62),Yc(Object.assign(e,{strokeStyle:"#3b2412",lineWidth:2}),222,30,8),Te(t,1,{clamp:!0})})}function Wo(n,t={}){return ke("label"+n+JSON.stringify(t),()=>{let e=t.w||256,i=t.h||64,s=Ee(e,i),a=s.getContext("2d");a.fillStyle=t.bg||"#f0ece2",a.fillRect(0,0,e,i),a.fillStyle=t.fg||"#222",a.font=t.font||`bold ${Math.floor(i*.55)}px sans-serif`,a.textAlign="center",a.textBaseline="middle";let r=String(n).split(`
`);return r.forEach((o,l)=>a.fillText(o,e/2,i/2+(l-(r.length-1)/2)*i*.6/Math.max(1,r.length-.5))),Te(s,1,{clamp:!0})})}function Ed(n=1,t="#f2eddf"){return ke("paper"+n+t,()=>{let e=Ee(128,160),i=e.getContext("2d"),s=Ie(n);i.fillStyle=t,i.fillRect(0,0,128,160),i.strokeStyle="rgba(30,40,120,0.7)",i.lineWidth=2;for(let a=22;a<150;a+=14){i.beginPath();let r=10;for(i.moveTo(r,a);r<110*(.6+s()*.4);)r+=6,i.lineTo(r,a+(s()-.5)*4);i.stroke()}return Te(e,1,{clamp:!0})})}function Td(n=14,t=2){return ke("fridge"+n+t,()=>{let e=Ee(256,512),i=e.getContext("2d"),s=Ie(t),a=i.createLinearGradient(0,0,256,0);a.addColorStop(0,"#e9ebea"),a.addColorStop(1,"#d5d8d7"),i.fillStyle=a,i.fillRect(0,0,256,512);let r=["#e33","#3a3","#36c","#fc3","#f80","#c3c","#222","#0aa","#fff"];for(let o=0;o<n;o++){let l=20+s()*190,c=40+s()*260,h=18+s()*26,d=16+s()*26;i.fillStyle=r[Math.floor(s()*r.length)],s()<.3?(i.beginPath(),i.arc(l,c,h/2,0,Math.PI*2),i.fill()):i.fillRect(l,c,h,d),i.fillStyle="rgba(0,0,0,0.25)",i.fillRect(l+2,c+d*.6,h*.8,2)}i.fillStyle="#f2eee2",i.fillRect(150,300,70,90),i.fillStyle="#333";for(let o=312;o<380;o+=10)i.fillRect(156,o,40+s()*16,2);return i.fillStyle="#b9bcbb",i.fillRect(20,200,8,120),Te(e,1,{clamp:!0})})}function Ad(){return ke("sashflag",()=>{let n=Ee(384,256),t=n.getContext("2d");t.fillStyle="#0c0c0c",t.fillRect(0,0,384,256),t.save(),t.translate(192,128),t.rotate(-.55),t.fillStyle="#f4f1ea",t.fillRect(-300,-26,600,52),t.fillStyle="#0c0c0c",t.fillRect(-300,-3,600,6),t.restore(),t.fillStyle="rgba(255,255,255,0.8)",t.font="bold 22px Georgia",t.textAlign="right",t.fillText("1898",370,240);let e=Ie(8);return Pi(t,384,256,e,1200,"#fff",1,2,.04),Te(n,1,{clamp:!0})})}function Os(n="ok",t=5,e=1){return ke("fphoto"+n+t+e,()=>{let i=Ee(256,192),s=i.getContext("2d"),a=Ie(e),r=s.createLinearGradient(0,0,0,192);r.addColorStop(0,"#9fb6c9"),r.addColorStop(1,"#6f7b62"),s.fillStyle=r,s.fillRect(0,0,256,192);for(let o=0;o<t;o++){let l=30+o*(196/Math.max(1,t-1)),c=70+a()*40;if(s.fillStyle=["#2b3a67","#8a2b2b","#2f6b3a","#6b4a2b","#111","#5a3c7a"][o%6],s.fillRect(l-18,192-c+30,36,c),s.fillStyle="#c69468",s.beginPath(),s.arc(l,192-c+16,14,0,Math.PI*2),s.fill(),s.fillStyle="#1b120b",s.beginPath(),s.arc(l,192-c+10,15,Math.PI,Math.PI*2),s.fill(),n==="blank"&&(s.fillStyle="#e8e4da",s.beginPath(),s.arc(l,192-c+16,15,0,Math.PI*2),s.fill()),n==="scratched"){s.strokeStyle="#111",s.lineWidth=2;for(let h=0;h<14;h++)s.beginPath(),s.moveTo(l-16+a()*32,192-c+a()*30),s.lineTo(l-16+a()*32,192-c+a()*30),s.stroke()}}return s.fillStyle="rgba(255,240,200,0.12)",s.fillRect(0,0,256,192),Te(i,1,{clamp:!0})})}function Zc(n=0){return ke("bday"+n,()=>{let t=Ee(256,192),e=t.getContext("2d");e.fillStyle="#d7c79f",e.fillRect(0,0,256,192),["#e33","#36c","#fc3","#3a3"].forEach((r,o)=>{e.fillStyle=r,e.beginPath(),e.ellipse(30+o*60,30,14,18,0,0,Math.PI*2),e.fill()}),e.fillStyle="#f4d3e0",e.fillRect(100,130,70,40);for(let r=0;r<5;r++)e.fillStyle="#fff",e.fillRect(108+r*12,118,3,12),e.fillStyle="#fb2",e.fillRect(108+r*12,113,3,5);e.fillStyle="#6b3f26",e.beginPath(),e.arc(70,110,16,0,Math.PI*2),e.fill(),e.fillStyle="#1a0f08";for(let r=0;r<14;r++)e.beginPath(),e.arc(70+Math.cos(r)*16,104+Math.sin(r*1.7)*10,6,0,Math.PI*2),e.fill();e.fillStyle="#e8327a",e.fillRect(56,126,28,50);let s=205;e.fillStyle="#e26a1c";for(let r=0;r<10;r++)e.beginPath(),e.arc(s-20+r%5*10,78+Math.floor(r/5)*40,10,0,Math.PI*2),e.fill();e.fillStyle="#f5f1e8",e.beginPath(),e.ellipse(s,98,20,24,0,0,Math.PI*2),e.fill(),e.fillStyle="#d11",e.beginPath(),e.arc(s,100,5,0,Math.PI*2),e.fill(),e.strokeStyle="#d11",e.lineWidth=3,e.beginPath(),e.arc(s,104,11,.1*Math.PI,.9*Math.PI),e.stroke(),e.fillStyle="#111",n===1?(e.fillRect(s-9,90,5,3),e.fillRect(s+1,90,5,3)):(e.beginPath(),e.arc(s-7,91,3,0,Math.PI*2),e.arc(s+7,91,3,0,Math.PI*2),e.fill()),e.fillStyle="#243f8f",e.fillRect(s-22,122,44,60),e.fillStyle="#f5f1e8",e.beginPath(),e.arc(s,145,11,0,Math.PI*2),e.fill(),e.strokeStyle="#111",e.lineWidth=2,e.beginPath(),e.moveTo(s,145),e.lineTo(s,137),e.moveTo(s,145),e.lineTo(s+6,147),e.stroke(),e.fillStyle="rgba(255,200,120,0.18)",e.fillRect(0,0,256,192);let a=Ie(5+n);return Pi(e,256,192,a,900,"#000",1,2,.08),Te(t,1,{clamp:!0})})}function Rd(){return ke("city",()=>{let n=Ee(2048,512),t=n.getContext("2d"),e=Ie(77),i=t.createLinearGradient(0,0,0,512);i.addColorStop(0,"#05070d"),i.addColorStop(.55,"#101626"),i.addColorStop(.8,"#2a2320"),i.addColorStop(1,"#0a0806"),t.fillStyle=i,t.fillRect(0,0,2048,512);for(let a=0;a<300;a++)t.fillStyle=`rgba(255,255,255,${e()*.5})`,t.fillRect(e()*2048,e()*220,1,1);let s=0;for(;s<2048;){let a=40+e()*120,r=60+e()*200;t.fillStyle=`rgb(${10+e()*10},${10+e()*10},${16+e()*12})`,t.fillRect(s,420-r,a,r+92);for(let o=420-r+8;o<500;o+=14)for(let l=s+6;l<s+a-6;l+=12)e()<.22&&(t.fillStyle=e()<.8?`rgba(255,${190+e()*50},${120+e()*60},${.5+e()*.5})`:"rgba(170,200,255,0.7)",t.fillRect(l,o,6,7));s+=a+e()*20}for(let a=0;a<70;a++)t.fillStyle=`rgba(${8+e()*10},${16+e()*14},${8+e()*8},1)`,t.beginPath(),t.arc(e()*2048,470+e()*50,30+e()*50,0,Math.PI*2),t.fill();return Te(n,1)})}function Jc(n=!1){return ke("moon"+n,()=>{let t=Ee(256,256),e=t.getContext("2d"),i=Ie(12),s=e.createRadialGradient(128,128,60,128,128,128);s.addColorStop(0,n?"rgba(255,90,70,1)":"rgba(240,236,220,1)"),s.addColorStop(.72,n?"rgba(220,60,50,1)":"rgba(225,220,205,1)"),s.addColorStop(.78,n?"rgba(160,30,30,0.35)":"rgba(200,200,220,0.3)"),s.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=s,e.fillRect(0,0,256,256);for(let a=0;a<25;a++)e.fillStyle=`rgba(0,0,0,${.05+i()*.1})`,e.beginPath(),e.arc(70+i()*120,70+i()*120,5+i()*18,0,Math.PI*2),e.fill();return Te(t,1,{clamp:!0})})}function Cd(){return ke("score",()=>{let n=Ee(512,128),t=n.getContext("2d");return t.fillStyle="#050505",t.fillRect(0,0,512,128),t.fillStyle="#ffae2a",t.font='bold 44px "Courier New", monospace',t.textAlign="center",t.textBaseline="middle",t.fillText("CASA 0 x 0 VISITANTE",256,64),Te(n,1,{clamp:!0})})}function Pd(){return ke("clown",()=>{let n=Ee(256,256),t=n.getContext("2d");t.fillStyle="#f4efe4",t.fillRect(0,0,256,256),t.fillStyle="#1a2f7a",t.beginPath(),t.moveTo(80,60),t.lineTo(96,130),t.lineTo(64,128),t.closePath(),t.fill(),t.beginPath(),t.moveTo(176,60),t.lineTo(192,128),t.lineTo(160,130),t.closePath(),t.fill(),t.fillStyle="#fff",t.beginPath(),t.arc(82,112,13,0,Math.PI*2),t.arc(174,112,13,0,Math.PI*2),t.fill(),t.fillStyle="#050505",t.beginPath(),t.arc(84,113,7,0,Math.PI*2),t.arc(176,113,7,0,Math.PI*2),t.fill(),t.fillStyle="#c3121c",t.beginPath(),t.moveTo(40,160),t.quadraticCurveTo(128,250,216,160),t.quadraticCurveTo(128,205,40,160),t.fill(),t.strokeStyle="#6a0a0e",t.lineWidth=3,t.stroke(),t.fillStyle="#f7f1dc";for(let i=0;i<9;i++){let s=70+i*13;t.fillRect(s,183+Math.sin(i/8*Math.PI)*10,8,10)}t.strokeStyle="rgba(90,70,60,0.35)",t.lineWidth=1;let e=Ie(66);for(let i=0;i<40;i++){t.beginPath();let s=e()*256,a=e()*256;t.moveTo(s,a),t.lineTo(s+(e()-.5)*30,a+(e()-.5)*30),t.stroke()}return Te(n,1,{clamp:!0})})}var Bo=class{constructor(){this.c=Ee(128,160),this.ctx=this.c.getContext("2d"),this.texture=Te(this.c,1,{clamp:!0}),this.t=0,this.draw(0)}draw(t,e=1){this.t+=t;let i=this.ctx,s=128,a=160;i.fillStyle="#000",i.fillRect(0,0,s,a);let r=i.getImageData(0,0,s,a),o=r.data;for(let c=0;c<o.length;c+=4){let h=Math.floor(c/4/s),d=Math.random()<.5?Math.random()*90*e:0,u=Math.sin(h*.3+this.t*20)>.93?80:0;o[c]=o[c+1]=o[c+2]=d+u,o[c+3]=255}i.putImageData(r,0,0);let l=()=>(Math.random()-.5)*3*e;i.fillStyle="#fff",i.beginPath(),i.ellipse(40+l(),64+l(),9,4,0,0,Math.PI*2),i.fill(),i.beginPath(),i.ellipse(88+l(),64+l(),9,4,0,0,Math.PI*2),i.fill(),i.fillStyle="#000",i.beginPath(),i.arc(40+l(),64,3,0,Math.PI*2),i.arc(88+l(),64,3,0,Math.PI*2),i.fill(),i.strokeStyle="#ddd",i.lineWidth=2,i.beginPath(),i.moveTo(24,112+l());for(let c=24;c<=104;c+=8)i.lineTo(c,112+(c%16?8:-2)+l());i.stroke(),this.texture.needsUpdate=!0}};function zo(n,t){let e=parseInt(n.slice(1),16),i=e>>16&255,s=e>>8&255,a=e&255,r=o=>Math.max(0,Math.min(255,Math.round(o+255*t)));return i=r(i),s=r(s),a=r(a),"#"+((1<<24)+(i<<16)+(s<<8)+a).toString(16).slice(1)}function $c(n,t,e){n.clearRect(0,0,e,e),n.save(),n.scale(e/100,e/100),n.lineWidth=3,n.strokeStyle="#111";let i=s=>{n.fillStyle=s};switch(t){case"carregador":i("#eee"),n.fillRect(30,20,30,34),n.strokeRect(30,20,30,34),i("#999"),n.fillRect(38,10,4,10),n.fillRect(48,10,4,10),n.strokeStyle="#ddd",n.lineWidth=4,n.beginPath(),n.moveTo(45,54),n.bezierCurveTo(45,90,80,60,80,90),n.stroke();break;case"banquinho":i("#9a6a3a"),n.beginPath(),n.ellipse(50,30,30,10,0,0,Math.PI*2),n.fill(),n.stroke(),n.fillRect(28,32,6,55),n.fillRect(66,32,6,55),n.fillRect(47,36,6,50);break;case"racao":i("#d9632a"),n.fillRect(28,18,44,66),n.strokeRect(28,18,44,66),i("#fff"),n.beginPath(),n.arc(50,50,12,0,Math.PI*2),n.fill(),i("#111"),n.font="bold 12px sans-serif",n.fillText("CAT",38,78);break;case"chave_velha":i("#8a6a3a"),n.beginPath(),n.arc(30,50,14,0,Math.PI*2),n.fill(),n.stroke(),n.fillRect(42,46,44,8),n.fillRect(74,54,6,12),n.fillRect(82,54,5,8),i("#111"),n.beginPath(),n.arc(30,50,5,0,Math.PI*2),n.fill();break;case"fone":n.strokeStyle="#eee",n.lineWidth=4,n.beginPath(),n.moveTo(30,30),n.bezierCurveTo(30,70,70,60,50,90),n.moveTo(70,30),n.bezierCurveTo(70,70,40,60,50,90),n.stroke(),i("#fff"),n.beginPath(),n.arc(30,26,8,0,Math.PI*2),n.arc(70,26,8,0,Math.PI*2),n.fill();break;case"caixinha":i("#6b2b3a"),n.fillRect(20,40,60,40),n.strokeRect(20,40,60,40),i("#d8b27a"),n.fillRect(20,36,60,8),n.beginPath(),n.arc(50,60,8,0,Math.PI*2),n.fill(),n.fillRect(80,56,12,4);break;case"gelo":i("rgba(190,230,255,0.9)"),n.fillRect(22,24,56,52),n.strokeRect(22,24,56,52),i("#c9a23a"),n.fillRect(40,44,22,5),n.beginPath(),n.arc(38,46,6,0,Math.PI*2),n.fill();break;case"chaves_mae":i("#c9a23a"),n.beginPath(),n.arc(34,40,12,0,Math.PI*2),n.fill(),n.stroke(),n.fillRect(40,38,40,6),n.fillRect(36,50,6,36),i("#e8327a"),Yc(n,70,64,10);break;case"pendrive":i("#222"),n.fillRect(30,30,30,50),i("#bbb"),n.fillRect(36,18,18,14),i("#fff"),n.font="10px sans-serif",n.fillText("FESTA",31,58);break;case"chave_pai":i("#aaa"),n.beginPath(),n.arc(34,50,12,0,Math.PI*2),n.fill(),n.stroke(),n.fillRect(44,46,40,8),n.fillRect(72,54,5,10),i("#d8c38a"),n.beginPath(),n.ellipse(34,26,20,7,0,0,Math.PI*2),n.fill();break;case"registro":i("#999"),n.beginPath(),n.arc(50,50,20,0,Math.PI*2),n.fill(),n.stroke(),i("#c33"),n.fillRect(46,20,8,60),n.fillRect(20,46,60,8);break;case"relogio_ovo":i("#e9dcc0"),n.beginPath(),n.ellipse(50,54,26,34,0,0,Math.PI*2),n.fill(),n.stroke(),i("#c9a23a"),n.beginPath(),n.arc(50,18,6,0,Math.PI*2),n.fill(),n.strokeStyle="#555",n.beginPath(),n.arc(50,56,14,0,Math.PI*2),n.stroke();break;case"powerbank":i("#1d1d22"),n.fillRect(28,20,44,64),n.strokeRect(28,20,44,64),i("#4c4"),n.fillRect(36,30,6,6),n.fillRect(46,30,6,6),n.fillRect(56,30,6,6);break;case"foto_festa":i("#eee"),n.fillRect(18,22,64,56),i("#d7c79f"),n.fillRect(22,26,56,40),i("#e26a1c"),n.beginPath(),n.arc(64,42,8,0,Math.PI*2),n.fill(),i("#f5f1e8"),n.beginPath(),n.arc(64,46,6,0,Math.PI*2),n.fill();break;case"chapeu":i("#d8c38a"),n.beginPath(),n.ellipse(50,62,40,12,0,0,Math.PI*2),n.fill(),n.stroke(),n.fillRect(30,36,40,26),i("#333"),n.fillRect(30,52,40,6);break;default:i("#777"),n.fillRect(25,25,50,50)}n.restore()}var ai={EYE:1,VIDEO:2,MIRROR:3,SPIRIT:4,CCTV:5,CAMONLY:6},jc={e:ai.EYE,v:ai.VIDEO,m:ai.MIRROR,s:ai.SPIRIT,c:ai.CCTV,k:ai.CAMONLY};function pe(n,t){return n.traverse(e=>{e.layers.disableAll();for(let i of t)jc[i]&&e.layers.enable(jc[i]);e.userData.vis=t}),n}var r_="evmc";function Kc(n){n.traverse(t=>{if(t.isLight){t.layers.enableAll();return}if(t.userData.vis===void 0&&t.layers.mask===1){t.layers.disableAll();for(let e of r_)t.layers.enable(jc[e])}})}function Pa(n,t=!1){let e=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),a={},r={},o=n[0].morphTargetsRelative,l=new Be,c=0;for(let h=0;h<n.length;++h){let d=n[h],u=0;if(e!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in d.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;a[f]===void 0&&(a[f]=[]),a[f].push(d.attributes[f]),u++}if(u!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in d.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;r[f]===void 0&&(r[f]=[]),r[f].push(d.morphAttributes[f])}if(t){let f;if(e)f=d.index.count;else if(d.attributes.position!==void 0)f=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(e){let h=0,d=[];for(let u=0;u<n.length;++u){let f=n[u].index;for(let g=0;g<f.count;++g)d.push(f.getX(g)+h);h+=n[u].attributes.position.count}l.setIndex(d)}for(let h in a){let d=Id(a[h]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,d)}for(let h in r){let d=r[h][0].length;if(d!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let u=0;u<d;++u){let f=[];for(let _=0;_<r[h].length;++_)f.push(r[h][_][u]);let g=Id(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}}return l}function Id(n){let t,e,i,s=-1,a=0;for(let c=0;c<n.length;++c){let h=n[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;a+=h.count*e}let r=new t(a),o=new Oe(r,e,i),l=0;for(let c=0;c<n.length;++c){let h=n[c];if(h.isInterleavedBufferAttribute){let d=l/e;for(let u=0,f=h.count;u<f;u++)for(let g=0;g<e;g++){let _=h.getComponent(u,g);o.setComponent(u+d,g,_)}}else r.set(h.array,l);l+=h.count*e}return s!==void 0&&(o.gpuType=s),o}var qo=class{constructor(t){this.scene=t,this.sections=new Map,this.cur=null,this.colliders=[],this.interactables=[],this.meshToInteract=new Map,this.fixtures=[],this.zones=[],this.floors=[],this.hides=[],this.doors=new Map,this.updaters=[],this.navNodes=new Map,this.navEdges=[],this.photoTargets=[],this.objects=new Map}begin(t){this.sections.has(t)&&this.remove(t);let e={id:t,group:new We,colliders:[],interactables:[],fixtures:[],zones:[],floors:[],hides:[],doors:[],updaters:[],navNodes:[],navEdges:[],photoTargets:[],objects:[]};return e.group.name="section:"+t,this.scene.add(e.group),this.sections.set(t,e),this.cur=e,e.group}end(){let t=this.cur;return Kc(t.group),this.bake!==!1&&this.bakeStatic(t),this.cur=null,this.refresh(),t}bakeStatic(t){let e=new Set,i=(h,d=0)=>{if(!(!h||d>2)){if(h.isObject3D){e.add(h);return}if(Array.isArray(h)){h.forEach(u=>i(u,d+1));return}if(typeof h=="object")for(let u of Object.keys(h)){let f=h[u];f&&(f.isObject3D||Array.isArray(f)||typeof f=="object"&&d<1)&&i(f,d+1)}}};for(let h of t.interactables){e.add(h.obj);for(let d of h.meshes)e.add(d)}for(let h of t.objects)i(this.objects.get(h));for(let h of t.doors)i(h.pivot);let s=h=>{let d=h;for(;d&&d!==t.group;){if(e.has(d)||d.userData.dynamic||d.isMirror)return!0;d=d.parent}return!1};t.group.updateMatrixWorld(!0);let a=new he().copy(t.group.matrixWorld).invert(),r=new Map,o=[];t.group.traverse(h=>{if(!h.isMesh||!h.visible||s(h)||h.isSkinnedMesh||h.isInstancedMesh)return;let d=h.geometry;if(!d||!d.attributes.position||!d.attributes.normal||!d.attributes.uv)return;let u=!1,f=h.parent;for(;f&&f!==t.group;){if(!f.visible){u=!0;break}f=f.parent}if(u)return;let g=new he().multiplyMatrices(a,h.matrixWorld),_=Array.isArray(h.material)?h.material:[h.material],p=Array.isArray(h.material)&&d.groups.length?d.groups:[{start:0,count:d.index?d.index.count:d.attributes.position.count,materialIndex:0}];for(let m of p){let M=_[m.materialIndex];if(!M||M.visible===!1)continue;let A=M.uuid+"|"+h.layers.mask+"|"+(h.castShadow?1:0)+(h.receiveShadow?1:0),b;if(Array.isArray(h.material)){b=new Be;let w=d.index.array.slice(m.start,m.start+m.count);b.setAttribute("position",d.attributes.position.clone()),b.setAttribute("normal",d.attributes.normal.clone()),b.setAttribute("uv",d.attributes.uv.clone()),b.setIndex(new Oe(new Uint32Array(w),1))}else if(b=new Be,b.setAttribute("position",d.attributes.position.clone()),b.setAttribute("normal",d.attributes.normal.clone()),b.setAttribute("uv",d.attributes.uv.clone()),d.index)b.setIndex(new Oe(new Uint32Array(d.index.array),1));else{let w=d.attributes.position.count,S=new Uint32Array(w);for(let R=0;R<w;R++)S[R]=R;b.setIndex(new Oe(S,1))}b.applyMatrix4(g),r.has(A)||r.set(A,{m:M,layers:h.layers.mask,cast:h.castShadow,recv:h.receiveShadow,geos:[],vis:h.userData.vis}),r.get(A).geos.push(b)}o.push(h)});let l=new Set,c=(h,d=0)=>{if(!(!h||d>2)){if(h.isObject3D){l.add(h);return}if(Array.isArray(h)){h.forEach(u=>c(u,d+1));return}if(typeof h=="object")for(let u of Object.keys(h))c(h[u],d+1)}};for(let h of t.objects)c(this.objects.get(h));for(let h of t.interactables){let d=h.obj;if(!d||l.has(d)||d.userData.dynamic||h.kind==="door"||h.kind==="drawer"||h.kind==="leaf"||h.kind==="pickup")continue;let u=!1,f=d.parent;for(;f&&f!==t.group;){if(l.has(f)||f.userData.dynamic){u=!0;break}f=f.parent}if(u||!d.isGroup)continue;d.updateMatrixWorld(!0);let g=new he().copy(d.matrixWorld).invert(),_=new Map,p=[];if(d.traverse(M=>{if(!M.isMesh||M===d||!M.visible||M.isMirror||Array.isArray(M.material))return;let A=M.parent,b=!1;for(;A&&A!==d;){if(l.has(A)||A.userData.dynamic||!A.visible){b=!0;break}A=A.parent}if(b||l.has(M))return;let w=M.geometry;if(!w.attributes.uv||!w.attributes.normal)return;let S=new Be;if(S.setAttribute("position",w.attributes.position.clone()),S.setAttribute("normal",w.attributes.normal.clone()),S.setAttribute("uv",w.attributes.uv.clone()),w.index)S.setIndex(new Oe(new Uint32Array(w.index.array),1));else{let x=w.attributes.position.count,E=new Uint32Array(x);for(let P=0;P<x;P++)E[P]=P;S.setIndex(new Oe(E,1))}S.applyMatrix4(new he().multiplyMatrices(g,M.matrixWorld));let R=M.material.uuid+"|"+M.layers.mask+"|"+(M.castShadow?1:0);_.has(R)||_.set(R,{m:M.material,mask:M.layers.mask,cast:M.castShadow,geos:[],vis:M.userData.vis}),_.get(R).geos.push(S),p.push(M)}),p.length<3){_.forEach(M=>M.geos.forEach(A=>A.dispose()));continue}p.forEach(M=>M.parent.remove(M));let m=[];for(let M of _.values()){let A=Pa(M.geos,!1);if(M.geos.forEach(w=>w.dispose()),!A)continue;let b=new Lt(A,M.m);b.layers.mask=M.mask,b.userData.vis=M.vis,b.castShadow=M.cast,b.receiveShadow=!0,d.add(b),m.push(b)}h.meshes=h.meshes.filter(M=>!p.includes(M)).concat(m)}if(o.length){for(let h of o)h.parent.remove(h);for(let h of r.values()){let d=Pa(h.geos,!1);if(h.geos.forEach(f=>f.dispose()),!d)continue;let u=new Lt(d,h.m);u.layers.mask=h.layers,u.userData.vis=h.vis||"baked",u.castShadow=h.cast,u.receiveShadow=h.recv,u.matrixAutoUpdate=!1,u.name="baked",t.group.add(u)}}}remove(t){let e=this.sections.get(t);if(e){e.group.traverse(i=>{i.geometry&&i.geometry.dispose(),i.isMirror&&i.rt&&i.rt.dispose()}),this.scene.remove(e.group);for(let i of e.doors)this.doors.delete(i.id);for(let i of e.objects)this.objects.delete(i);this.sections.delete(t),this.refresh()}}has(t){return this.sections.has(t)}addTo(t,e){let i=this.sections.get(t);if(!i)return null;let s=this.cur;this.cur=i;let a=e(i.group);return Kc(i.group),this.cur=s,this.refresh(),a}refresh(){let t=e=>[].concat(...[...this.sections.values()].map(i=>i[e]));this.colliders=t("colliders"),this.interactables=t("interactables"),this.fixtures=t("fixtures"),this.zones=t("zones"),this.floors=t("floors"),this.hides=t("hides"),this.updaters=t("updaters"),this.photoTargets=t("photoTargets"),this.meshToInteract.clear();for(let e of this.interactables)for(let i of e.meshes)this.meshToInteract.has(i)||this.meshToInteract.set(i,e);for(let e of this.interactables)this.meshToInteract.has(e.obj)||this.meshToInteract.set(e.obj,e);this.navNodes.clear();for(let e of this.sections.values())for(let i of e.navNodes)this.navNodes.set(i.id,i);this.navEdges=t("navEdges").filter(e=>this.navNodes.has(e.a)&&this.navNodes.has(e.b)),this._adj=null}name(t,e){return this.objects.set(t,e),this.cur&&this.cur.objects.push(t),e}get(t){return this.objects.get(t)}collider(t,e,i,s,a={}){let r={minX:Math.min(t,e),maxX:Math.max(t,e),minZ:Math.min(i,s),maxZ:Math.max(i,s),enabled:!0,los:a.los!==!1,id:a.id||null,tag:a.tag||null,entity:a.entity!==!1};return this.cur.colliders.push(r),r}colliderC(t,e,i,s,a){return this.collider(t-i/2,t+i/2,e-s/2,e+s/2,a)}interact(t,e){let i=[];t.traverse(a=>{a.isMesh&&i.push(a)});for(let a of e.extra||[])a.traverse(r=>{r.isMesh&&i.push(r)});let s={dist:2.3,enabled:!0,...e,obj:t,meshes:i};return this.cur.interactables.push(s),s}fixture(t,e,i,s={}){let a={x:t,y:e,z:i,color:new Xt(s.color||16773596),intensity:s.intensity===void 0?6:s.intensity,dist:s.dist||7,on:s.on!==!1,flicker:0,id:s.id||null,room:s.room||null,bulb:s.bulb||null,level:0,priority:s.priority||0};return this.cur.fixtures.push(a),a}zone(t,e,i,s,a,r={}){let o={id:t,minX:Math.min(e,i),maxX:Math.max(e,i),minZ:Math.min(s,a),maxZ:Math.max(s,a),...r};return this.cur.zones.push(o),o}floor(t,e,i,s,a,r=null,o=null){let l={minX:Math.min(t,e),maxX:Math.max(t,e),minZ:Math.min(i,s),maxZ:Math.max(i,s),surface:a,heightFn:r,room:o};return this.cur.floors.push(l),l}hide(t){return this.cur.hides.push(t),t}door(t){return this.cur.doors.push(t),this.doors.set(t.id,t),t}update(t){return this.cur.updaters.push(t),t}photo(t){return this.cur.photoTargets.push(t),t}nav(t,e,i,s){let a={id:t,x:e,z:i,room:s};return this.cur.navNodes.push(a),a}link(t,e,i=null){this.cur.navEdges.push({a:t,b:e,door:i})}floorAt(t,e){let i=null;for(let s of this.floors)t>=s.minX&&t<=s.maxX&&e>=s.minZ&&e<=s.maxZ&&(i=s);return i}heightAt(t,e){let i=this.floorAt(t,e);return i&&i.heightFn?i.heightFn(t,e):0}roomAt(t,e){let i=this.floorAt(t,e);return i?i.room:null}zonesAt(t,e){let i=[];for(let s of this.zones)t>=s.minX&&t<=s.maxX&&e>=s.minZ&&e<=s.maxZ&&i.push(s.id);return i}inZone(t,e,i){for(let s of this.zones)if(s.id===t&&e>=s.minX&&e<=s.maxX&&i>=s.minZ&&i<=s.maxZ)return!0;return!1}resolve(t,e,i=null){for(let s=0;s<3;s++){let a=!1;for(let r of this.colliders){if(!r.enabled||i&&!i(r))continue;let o=Math.max(r.minX,Math.min(t.x,r.maxX)),l=Math.max(r.minZ,Math.min(t.z,r.maxZ)),c=t.x-o,h=t.z-l,d=c*c+h*h;if(d<e*e){if(d>1e-8){let u=Math.sqrt(d);t.x+=c/u*(e-u),t.z+=h/u*(e-u)}else{let u=t.x-r.minX,f=r.maxX-t.x,g=t.z-r.minZ,_=r.maxZ-t.z,p=Math.min(u,f,g,_);p===u?t.x=r.minX-e:p===f?t.x=r.maxX+e:p===g?t.z=r.minZ-e:t.z=r.maxZ+e}a=!0}}if(!a)break}}losBlocked(t,e,i,s,a=!1){let r=i-t,o=s-e;for(let l of this.colliders){if(!l.enabled||!l.los||a&&l.tag==="door")continue;let c=0,h=1;if(Math.abs(r)<1e-9){if(t<l.minX||t>l.maxX)continue}else{let d=(l.minX-t)/r,u=(l.maxX-t)/r;if(d>u&&([d,u]=[u,d]),c=Math.max(c,d),h=Math.min(h,u),c>h)continue}if(Math.abs(o)<1e-9){if(e<l.minZ||e>l.maxZ)continue}else{let d=(l.minZ-e)/o,u=(l.maxZ-e)/o;if(d>u&&([d,u]=[u,d]),c=Math.max(c,d),h=Math.min(h,u),c>h)continue}return!0}return!1}adj(){if(this._adj)return this._adj;let t=new Map;for(let e of this.navNodes.keys())t.set(e,[]);for(let e of this.navEdges)t.get(e.a).push({to:e.b,door:e.door}),t.get(e.b).push({to:e.a,door:e.door});return this._adj=t,t}nearestNode(t,e,i=!0){let s=null,a=1/0;for(let r of this.navNodes.values()){let o=Math.hypot(r.x-t,r.z-e);o<a&&(!i||!this.losBlocked(t,e,r.x,r.z,!0))&&(a=o,s=r)}return!s&&i?this.nearestNode(t,e,!1):s}path(t,e,i){let s=this.adj();if(!s.has(t)||!s.has(e))return null;let a=new Set([t]),r=new Map([[t,0]]),o=new Map,l=new Map,c=h=>{let d=this.navNodes.get(h),u=this.navNodes.get(e);return Math.hypot(d.x-u.x,d.z-u.z)};for(o.set(t,c(t));a.size;){let h=null,d=1/0;for(let u of a){let f=o.get(u);f<d&&(d=f,h=u)}if(h===e){let u=[h];for(;l.has(h);)h=l.get(h),u.unshift(h);return u.map(f=>this.navNodes.get(f))}a.delete(h);for(let u of s.get(h)){if(i&&!i(u))continue;let f=this.navNodes.get(h),g=this.navNodes.get(u.to),_=r.get(h)+Math.hypot(f.x-g.x,f.z-g.z);_<(r.has(u.to)?r.get(u.to):1/0)&&(l.set(u.to,h),r.set(u.to,_),o.set(u.to,_+c(u.to)),a.add(u.to))}}return null}};var Qc=new Map;function th(n,t){return Qc.has(n)||Qc.set(n,t()),Qc.get(n)}function X(n,t={}){let e="std"+n+JSON.stringify(t,(i,s)=>s&&s.isTexture?s.uuid:s);return th(e,()=>new bi({color:n,roughness:.85,metalness:0,...t}))}function Ot(n,t={}){let e="tex"+n.uuid+JSON.stringify(t);return th(e,()=>new bi({map:n,roughness:.85,metalness:0,...t}))}function Si(n,t={}){let e="basic"+n+JSON.stringify(t,(i,s)=>s&&s.isTexture?s.uuid:s);return th(e,()=>new Yt({color:n,...t}))}var F={get white(){return Ot(qi("#e9e6df",{seed:1}),{roughness:.95})},get whiteDirty(){return Ot(qi("#dcd8cf",{seed:2,stains:.12}),{roughness:.95})},get gray(){return Ot(qi("#7d8186",{seed:3,mottled:.08}),{roughness:.95})},get darkGray(){return Ot(qi("#4a4d52",{seed:4,mottled:.1}),{roughness:.95})},get purple(){return Ot(yd(),{roughness:.95})},get ceiling(){return Ot(qi("#eeece6",{seed:5}),{roughness:1})},get woodFloor(){return Ot(Us(),{roughness:.6})},get kitchenFloor(){return Ot(Ra("#d9cdb3",{diagonal:!0,size:1.3}),{roughness:.45})},get serviceFloor(){return Ot(Ra("#d3cfc6",{size:1,seed:4}),{roughness:.5})},get bathFloor(){return Ot(Ra("#b9c0c4",{size:.8,seed:8,grout:"#7d878c"}),{roughness:.4})},get balconyFloor(){return Ot(Ra("#a89e8e",{size:.9,seed:9}),{roughness:.6})},get bathWall(){return Ot(qc("#c9d0d4",.3),{roughness:.3})},get kitchenWall(){return Ot(qc("#ecebe6",.32,{grout:"#b8b6ae"}),{roughness:.3})},get doorWood(){return Ot(Ho({pattern:"grooves"}),{roughness:.45})},get doorEntrance(){return Ot(Ho({pattern:"diag",base:"#8a4f2a"}),{roughness:.45})},get doorOld(){return Ot(Ho({pattern:"old",base:"#3a2216",seed:44}),{roughness:.7})},get oak(){return Ot(Vo("#b98a5a"),{roughness:.6})},get oakDark(){return Ot(Vo("#7a5234",{seed:3}),{roughness:.6})},get rustic(){return Ot(Vo("#8d6a44",{seed:5,size:.7}),{roughness:.7})},get cream(){return X("#e8e0cc",{roughness:.6})},get whiteFurn(){return X("#eeeeea",{roughness:.5})},get black(){return X("#141414",{roughness:.5})},get blackMatte(){return X("#1c1c1c",{roughness:.9})},get metal(){return X("#9aa0a6",{roughness:.35,metalness:.7})},get chrome(){return X("#d0d4d8",{roughness:.18,metalness:.95})},get sofa(){return Ot(Xi("#6c6a67"),{roughness:1})},get blanket(){return Ot(bd(),{roughness:1})},get knit(){return Ot(Md(),{roughness:1})},get curtainBeige(){return Ot(Xc("#bfae96"),{roughness:1,side:Ne})},get curtainWhite(){return Ot(Xc("#e8e6e2"),{roughness:1,side:Ne,transparent:!0,opacity:.92})},get granite(){return Ot(Sd(),{roughness:.25})},get sheetPink(){return Ot(Xi("#d9a3ad",{seed:3}),{roughness:1})},get sheetWhite(){return Ot(Xi("#e4e2dc",{seed:4}),{roughness:1})},get sheetLilac(){return Ot(Xi("#c9b3d6",{seed:5}),{roughness:1})},get glass(){return X("#9fb8c8",{roughness:.05,metalness:.2,transparent:!0,opacity:.18})},get screenOff(){return X("#050607",{roughness:.15,metalness:.3})},get porcelain(){return X("#f1f1ee",{roughness:.2})},get skin(){return X("#8d5a3b",{roughness:.7})}};function o_(n,t,e,i=1){let s=new Fi(n,t,e);if(i){let a=s.attributes.uv,r=[[e,t],[e,t],[n,e],[n,e],[n,t],[n,t]];for(let o=0;o<6;o++){let[l,c]=r[o];for(let h=0;h<4;h++){let d=o*4+h;a.setXY(d,a.getX(d)*l/i,a.getY(d)*c/i)}}}return s}function l_(n,t,e=1){let i=new Me(n,t);if(e){let s=i.attributes.uv;for(let a=0;a<s.count;a++)s.setXY(a,s.getX(a)*n/e,s.getY(a)*t/e)}return i}function Ld(n){return Array.isArray(n)&&(n=n[0]),n&&n.map&&n.map.userData.size?n.map.userData.size:1}function D(n,t,e,i,s,a,r,o,l={}){let c=l.uv===!1?new Fi(t,e,i):o_(t,e,i,l.uvSize||Ld(s)),h=new Lt(c,s);return h.position.set(a,r,o),l.ry&&(h.rotation.y=l.ry),l.rx&&(h.rotation.x=l.rx),l.rz&&(h.rotation.z=l.rz),h.castShadow=l.cast!==!1,h.receiveShadow=l.receive!==!1,n.add(h),h}function ut(n,t,e,i,s,a,r,o,l={}){let c=new Lt(new gi(t,e,i,l.seg||16,1,!!l.open),s);return c.position.set(a,r,o),l.rx&&(c.rotation.x=l.rx),l.rz&&(c.rotation.z=l.rz),l.ry&&(c.rotation.y=l.ry),c.castShadow=l.cast!==!1,c.receiveShadow=!0,n.add(c),c}function ee(n,t,e,i,s,a,r={}){let o=new Lt(new dn(t,r.seg||14,r.seg2||10),e);return o.position.set(i,s,a),r.sx&&o.scale.set(r.sx,r.sy||1,r.sz||1),o.castShadow=r.cast!==!1,n.add(o),o}function Ve(n,t,e,i,s,a,r,o={}){let l=new Lt(o.uv===!1?new Me(t,e):l_(t,e,o.uvSize||Ld(i)),i);return l.position.set(s,a,r),o.rx!==void 0&&(l.rotation.x=o.rx),o.ry!==void 0&&(l.rotation.y=o.ry),o.rz!==void 0&&(l.rotation.z=o.rz),l.receiveShadow=o.receive!==!1,l.castShadow=!!o.cast,n.add(l),l}function G(n,t=0,e=0,i=0,s=0){let a=new We;return a.position.set(t,e,i),a.rotation.y=s,n.add(a),a}function Ia(n){n.updateMatrixWorld(!0);let t=new he().copy(n.matrixWorld).invert(),e=new Map,i=[];n.traverse(s=>{if(!s.isMesh||s===n||Array.isArray(s.material))return;let a=s.geometry;if(!a.attributes.uv||!a.attributes.normal)return;let r=new Be;if(r.setAttribute("position",a.attributes.position.clone()),r.setAttribute("normal",a.attributes.normal.clone()),r.setAttribute("uv",a.attributes.uv.clone()),a.index)r.setIndex(new Oe(new Uint32Array(a.index.array),1));else{let l=a.attributes.position.count,c=new Uint32Array(l);for(let h=0;h<l;h++)c[h]=h;r.setIndex(new Oe(c,1))}r.applyMatrix4(new he().multiplyMatrices(t,s.matrixWorld));let o=s.material.uuid+(s.castShadow?1:0);e.has(o)||e.set(o,{m:s.material,cast:s.castShadow,geos:[]}),e.get(o).geos.push(r),i.push(s)}),i.forEach(s=>s.parent.remove(s));for(let s of e.values()){let a=Pa(s.geos,!1);if(s.geos.forEach(o=>o.dispose()),!a)continue;let r=new Lt(a,s.m);r.castShadow=s.cast,r.receiveShadow=!0,n.add(r)}return n}function Dd(n,t=2.6){D(n,t,.42,.95,F.sofa,0,.21,0),D(n,t,.55,.22,F.sofa,0,.62,-.95/2+.11),D(n,.2,.62,.95,F.sofa,-t/2+.1,.31,0),D(n,.2,.62,.95,F.sofa,t/2-.1,.31,0);for(let s=0;s<3;s++){let a=D(n,t/3-.12,.42,.2,F.sofa,-t/3+s*(t/3),.72,-.175);a.rotation.x=-.18}let i=D(n,t*.55,.03,.95*.95,F.blanket,t*.15,.435,.03);return i.rotation.z=.01,D(n,t*.55,.3,.03,F.blanket,t*.15,.3,.95/2+.01),n}function Xo(n,t=2.4){D(n,t,.04,.42,F.oak,0,.55,0),D(n,t,.04,.42,F.oak,0,.12,0),D(n,.04,.55-.1,.42,F.oak,-t/2+.02,.55/2+.06,0),D(n,.04,.55-.1,.42,F.oak,t/2-.02,.55/2+.06,0),D(n,.04,.55-.1,.42,F.oak,0,.55/2+.06,0),D(n,t/2-.08,.55-.16,.02,F.cream,t/4,.55/2+.06,.42/2),D(n,t/4-.06,.55-.16,.02,F.cream,-t/2+t/8+.02,.55/2+.06,.42/2);for(let s of[-1,1])for(let a of[-1,1])ut(n,.018,.012,.12,F.oakDark,s*(t/2-.08),.06,a*(.42/2-.06),{seg:6});return n}function Yo(n,t=1.3){let e=t*.58;return D(n,t+.03,e+.03,.05,F.black,0,0,0),Ve(n,t,e,F.screenOff,0,0,.027,{uv:!1})}function eh(n){ut(n,.02,.02,.25,F.whiteFurn,0,-.12,0,{seg:8}),ut(n,.16,.2,.1,F.whiteFurn,0,-.28,0);let t=ee(n,.16,Si("#fff6e6"),0,-.36,0,{sy:.55,cast:!1}),e=G(n,0,-.26,0);for(let i=0;i<3;i++){let s=D(e,.55,.012,.13,F.whiteFurn,.42,0,0,{cast:!1});G(e,0,0,0,i*Math.PI*2/3).add(s)}return{blades:e,bulb:t}}function Zo(n){let t=X("#161616",{roughness:.4,metalness:.4}),e=X("#0b0b0b",{roughness:.9}),i=X("#e8e8e8",{roughness:.3}),s=.33;for(let r of[-.52,.52]){let o=new Lt(new yi(s,.022,8,28),e);o.position.set(r,s+.02,0),o.castShadow=!0,n.add(o);for(let c=0;c<8;c++){let h=D(n,.005,s*2,.005,F.metal,r,s+.02,0,{cast:!1});h.rotation.z=c*Math.PI/8}let l=new Lt(new yi(s+.05,.02,4,16,Math.PI*.8),i);l.position.set(r,s+.02,0),l.rotation.z=Math.PI*.1,n.add(l)}let a=(r,o,l,c,h=.018)=>{let d=Math.hypot(l-r,c-o),u=ut(n,h,h,d,t,(r+l)/2,(o+c)/2,0,{seg:8});u.rotation.z=Math.atan2(l-r,o-c)};return a(-.52,.35,-.05,.38),a(-.05,.38,-.15,.78),a(-.15,.78,.38,.72),a(-.05,.38,.38,.72),a(.38,.72,.52,.35),a(.38,.72,.36,.95),a(-.52,.35,-.15,.78),D(n,.05,.02,.5,t,.34,.97,0),D(n,.24,.06,.12,X("#222"),-.17,.84,0),D(n,.35,.015,.14,t,-.48,.72,0),Ia(n)}function ts(n,t=.45){ut(n,.16,.16,.04,F.rustic,0,t,0,{seg:18});for(let e=0;e<3;e++){let i=e*Math.PI*2/3,s=ut(n,.018,.022,t,F.rustic,Math.cos(i)*.1,t/2,Math.sin(i)*.1,{seg:6});s.rotation.z=Math.cos(i)*.12,s.rotation.x=-Math.sin(i)*.12}return Ia(n)}function Fd(n){let t=X("#b8bcc0",{metalness:.6,roughness:.35}),e=X("#6d1d2a",{roughness:.9});return D(n,.02,.9,.02,t,-.22,.45,0),D(n,.02,.9,.02,t,.22,.45,0),D(n,.44,.02,.02,t,0,.9,0),D(n,.44,.02,.02,t,0,.1,0),D(n,.42,.45,.01,e,0,.55,.012),Ia(n)}function Bs(n,t=!1){return D(n,1.02,.78,.04,F.whiteFurn,0,0,0),Ve(n,.96,.72,Ot(Go(t),{roughness:.5}),0,0,.021,{uv:!1}),n}function Jo(n,t=5,e=!1){Ve(n,.3,.15,Ot(wd(),{roughness:.7}),0,.06,.012,{uv:!1}),D(n,.31,.16,.02,F.oakDark,0,.06,0);let i=e?6:5,s=[];for(let a=0;a<i;a++){let r=-.12+a*(.24/(i-1));if(ut(n,.005,.005,.03,F.chrome,r,-.03,.02,{rx:Math.PI/2,seg:6,cast:!1}),a<t){let o=G(n,r,-.06,.03),l=e&&a===i-1;D(o,.012,.06,.003,l?X("#7a5a2a",{metalness:.5,roughness:.6}):F.chrome,0,-.02,0,{cast:!1});let c=["#e8327a","#2d4f8f","#111","#f5d10c","#3cc34a","#5a3a1f"][a];ee(o,.013,X(c),0,-.065,0,{seg:8,seg2:6,cast:!1}),s.push(o)}}return s}function Nd(n){D(n,.1,.22,.05,F.whiteFurn,0,0,0);let t=D(n,.06,.2,.05,X("#f4f4f2",{roughness:.4}),0,.01,.05),e=new Lt(new yi(.025,.004,4,20),F.whiteFurn);for(let i=0;i<5;i++){let s=e.clone();s.position.set(0,-.12-i*.02,.05),s.rotation.x=Math.PI/2,n.add(s)}return t}function kd(n){D(n,.36,.46,.08,F.whiteFurn,0,0,0);let t=G(n,0,0,.041);D(t,.32,.42,.005,F.blackMatte,0,0,0,{cast:!1});let e=[];for(let i=0;i<6;i++){let s=D(t,.035,.06,.03,X("#dcdcdc"),-.1+i%3*.1,.1-Math.floor(i/3)*.16,.015);e.push(s)}return{inner:t,switches:e}}function Ud(n){D(n,.9,.03,.5,F.whiteFurn,0,.74,0);for(let t of[-1,1])for(let e of[-1,1])D(n,.03,.74,.03,F.whiteFurn,t*.42,.37,e*.22);return D(n,.3,.2,.14,F.black,-.2,.86,0),ut(n,.05,.05,.14,X("#d8c8a8",{transparent:!0,opacity:.7}),.12,.83,.05,{seg:12}),ut(n,.052,.052,.03,X("#c62828"),.12,.915,.05,{seg:12}),D(n,.16,.18,.14,X("#e0e6ea",{transparent:!0,opacity:.65}),.3,.84,-.08),n}function Od(n){ut(n,.2,.2,.03,F.oak,0,.55,0,{seg:18});for(let t=0;t<3;t++){let e=t*2.1;ut(n,.015,.015,.55,F.oakDark,Math.cos(e)*.14,.275,Math.sin(e)*.14,{seg:6})}return ut(n,.04,.035,.18,F.chrome,.05,.66,.02,{seg:12}),n}function Bd(n){let t=X("#e6e8e7",{roughness:.35}),e=X("#f4f6f7",{roughness:.6});return D(n,.68,1.75,.03,t,0,.875,-.315),D(n,.03,1.75,.66,t,-.325,.875,0),D(n,.03,1.75,.66,t,.325,.875,0),D(n,.68,.03,.66,t,0,1.735,0),D(n,.68,.1,.66,t,0,.05,0),D(n,.64,.04,.62,e,0,1.2,0),D(n,.62,1.6,.01,e,0,.9,-.295,{cast:!1}),D(n,.66,.06,.02,X("#555"),0,.05,.33),n}function zd(n,t,e={}){D(n,t,.88-.04,.6-.05,F.whiteFurn,0,(.88-.04)/2,-.025),D(n,t+.02,.04,.6,F.granite,0,.88-.02,0);let a=Math.round(t/.45);for(let r=0;r<a;r++){let o=-t/2+(r+.5)*(t/a);D(n,t/a-.02,.88-.2,.015,F.oakDark,o,(.88-.04)/2+.02,.6/2-.045,{cast:!1}),D(n,.1,.012,.02,F.chrome,o,.88-.2,.6/2-.03,{cast:!1})}if(D(n,t,.08,.02,X("#222"),0,.04,.6/2-.06),e.sink!==void 0){let r=G(n,e.sink,.88,0);D(r,.5,.02,.38,F.chrome,0,.002,0,{cast:!1}),D(r,.44,.02,.32,X("#666",{metalness:.8,roughness:.3}),0,-.05,0,{cast:!1}),ut(r,.012,.012,.28,F.chrome,0,.14,-.2,{seg:8}),D(r,.02,.02,.16,F.chrome,0,.28,-.13),D(r,.34,.14,.24,X("#dcdcdc",{roughness:.4}),.52,.08,.02);for(let o=0;o<5;o++){let l=ut(r,.1,.1,.01,F.porcelain,.42+o*.045,.16,.02,{rz:Math.PI/2,seg:16});l.rotation.x=.2}}if(e.stove!==void 0){let r=G(n,e.stove,.89,0);D(r,.56,.02,.5,X("#1a1a1a",{roughness:.2,metalness:.3}),0,.01,0);for(let[o,l]of[[-.14,-.1],[.14,-.1],[-.14,.12],[.14,.12]])ut(r,.07,.07,.015,X("#333",{metalness:.6}),o,.025,l,{seg:14})}return n}function Vd(n,t){let s=Math.round(t/.5);D(n,t,.62,.34-.02,F.whiteFurn,0,0,-.01);let a=[];for(let r=0;r<s;r++){let o=-t/2+(r+.5)*(t/s);a.push({x:o,w:t/s-.02})}return{h:.62,d:.34,leaves:a}}function Hd(n){return D(n,.5,.3,.36,X("#e2e2e2",{roughness:.4}),0,.15,0),D(n,.33,.22,.01,X("#111",{roughness:.2,metalness:.2}),-.06,.15,.181),Ve(n,.09,.035,Si("#0a2a0a"),.17,.22,.182,{uv:!1})}function Gd(n){return D(n,.62,.95,.62,X("#eeeeec",{roughness:.35}),0,.475,0),ut(n,.22,.22,.02,X("#8aa0aa",{transparent:!0,opacity:.6,roughness:.1}),0,.96,.02,{seg:20}),D(n,.6,.1,.06,X("#dcdcdc"),0,1,-.28),n}function Wd(n){return D(n,.55,.14,.5,X("#cfcfcb",{roughness:.5}),0,.82,0),D(n,.08,.82,.08,X("#cfcfcb"),0,.41,-.15),ut(n,.012,.012,.2,F.chrome,0,1,-.24,{seg:8}),n}function qd(n){let t=ut(n,.012,.012,1.3,X("#caa46a"),0,.65,0,{seg:6});return t.rotation.z=.18,D(n,.3,.06,.06,X("#c0392b"),-.11,.04,0),n}function Xd(n,t,e=3,i=.35){for(let s=0;s<e;s++)D(n,t,.025,i,F.whiteFurn,0,.5+s*.5,0);return D(n,.025,.5*e+.1,i,F.whiteFurn,-t/2,.25*e+.05,0),D(n,.025,.5*e+.1,i,F.whiteFurn,t/2,.25*e+.05,0),n}function $o(n,t,e,i,s){for(let a of[-1,1])for(let r of[-1,1])D(n,.06,.3,.06,F.oakDark,a*(t/2-.02),.15,r*(e/2-.02));if(D(n,t+.06,.1,e+.06,F.oakDark,0,.35,0),D(n,t,.2,e,F.whiteFurn,0,.5,0),D(n,t+.02,.03,e+.02,i,0,.605,0),D(n,t*.7,.1,.32,F.sheetWhite,0,.67,-e/2+.22),s){let a=D(n,t+.06,.06,e*.62,s,0,.64,e*.18);a.rotation.z=.015,D(n,.03,.34,e*.62,s,t/2+.03,.48,e*.18)}return D(n,t+.1,.9,.05,F.oakDark,0,.45,-e/2-.03),n}function La(n,t,e,i,s){D(n,t,e,.02,s,0,e/2,-i/2+.01),D(n,.02,e,i,s,-t/2+.01,e/2,0),D(n,.02,e,i,s,t/2-.01,e/2,0),D(n,t,.02,i,s,0,e-.01,0),D(n,t,.08,i,s,0,.04,0),D(n,t-.04,.02,i-.04,s,0,e*.72,0,{cast:!1}),ut(n,.012,.012,t-.06,F.chrome,0,e*.68,0,{rz:Math.PI/2,seg:6});let a=["#222","#6a1d2a","#2b3a67","#e2e0da","#3f5d3a","#111"];for(let r=0;r<Math.floor(t/.12);r++)D(n,.04,.7,i*.7,X(a[r%a.length],{roughness:1}),-t/2+.1+r*.12,e*.68-.38,0,{cast:!1});return n}function Yd(n,t,e,i,s=4){return D(n,t,e,i-.02,F.whiteFurn,0,e/2,-.01),D(n,t+.02,.02,i,F.whiteFurn,0,e+.01,0),{rowH:(e-.08)/s}}function Zd(n){D(n,.9,.03,.45,F.whiteFurn,0,.75,0),D(n,.03,.74,.43,F.whiteFurn,-.43,.37,0),D(n,.3,.74,.43,F.whiteFurn,.3,.37,0);let t=["#e8327a","#fff","#f5d10c","#3cc34a","#9b3fd1","#1ea5e0","#f47a12"];for(let e=0;e<9;e++)ut(n,.02+e%3*.008,.02,.06+e%4*.04,X(t[e%t.length],{roughness:.4}),-.35+e*.07,.8+e%4*.02,.1-e%2*.08,{seg:8});return n}function ih(n,t,e,i){return D(n,t,.035,e,i,0,.74,0),D(n,.03,.74,e,i,-t/2+.015,.37,0),D(n,.03,.74,e,i,t/2-.015,.37,0),D(n,t,.35,.02,i,0,.55,-e/2+.01),n}function Jd(n){let t=D(n,.36,.02,.25,X("#2a2a2e",{metalness:.4,roughness:.4}),0,.01,0),e=G(n,0,.02,-.12);e.rotation.x=-.25,D(e,.36,.24,.012,X("#2a2a2e",{metalness:.4,roughness:.4}),0,.12,0);let i=Ve(e,.33,.2,Si("#0a0c10"),0,.125,.0075,{uv:!1});return{base:t,lid:e,screen:i}}function nh(n){let t=X("#161616",{roughness:.6});D(n,.46,.08,.46,t,0,.48,0),D(n,.44,.55,.06,t,0,.8,-.22),ut(n,.03,.03,.4,F.metal,0,.26,0,{seg:8});for(let e=0;e<5;e++){let i=e/5*Math.PI*2;D(n,.3,.03,.04,t,Math.cos(i)*.15,.06,Math.sin(i)*.15,{ry:-i})}return Ia(n)}function sh(n){let t=D(n,.85,.28,.2,X("#efeee8",{roughness:.4}),0,0,0);return D(n,.75,.03,.02,X("#bbb"),0,-.1,.1),t}function jo(n,t,e,i,s=.35){let a=[],r=t*(.5-s/2)+.12;ut(n,.012,.012,t+.3,F.metal,0,e+.05,0,{rz:Math.PI/2,seg:6});for(let o of[-1,1]){let l=new Me(r,e,12,1),c=l.attributes.position;for(let d=0;d<c.count;d++)c.setZ(d,Math.sin(c.getX(d)*26)*.035);l.computeVertexNormals();let h=new Lt(l,i);h.position.set(o*(t/2-r/2+.12),e/2+.03,.02),h.castShadow=!0,h.receiveShadow=!0,n.add(h),a.push(h)}return a}function es(n,t,e,i={}){let s=X(i.frame||"#d8d8d4",{roughness:.4,metalness:.3});if(D(n,t,.04,.08,s,0,0,0),D(n,t,.04,.08,s,0,e,0),D(n,.04,e,.08,s,-t/2,e/2,0),D(n,.04,e,.08,s,t/2,e/2,0),i.louver)for(let a=.08;a<e-.04;a+=.1){let r=D(n,t-.06,.08,.01,X("#b8c4c8",{transparent:!0,opacity:.55,roughness:.2}),0,a,0,{cast:!1});r.rotation.x=.5}else D(n,.03,e,.05,s,0,e/2,0),D(n,t,e,.01,F.glass,0,e/2,0,{cast:!1});if(i.bars)for(let a=-t/2+.12;a<t/2;a+=.14)ut(n,.01,.01,e,X("#222",{metalness:.5}),a,e/2,.08,{seg:6});return n}function $d(n){let t=F.porcelain;ut(n,.17,.14,.38,t,0,.19,.05,{seg:16});let e=ut(n,.2,.2,.04,t,0,.4,.07,{seg:18});e.scale.z=1.25;let i=D(n,.36,.03,.44,X("#e2d8a8",{roughness:.5}),0,.44,.07);return i.rotation.x=.05,D(n,.42,.36,.18,t,0,.6,-.22),ut(n,.06,.06,.1,F.whiteFurn,.08,.83,-.22,{seg:10}),ut(n,.025,.03,.12,X("#f2c500"),-.1,.84,-.22,{seg:8}),n}function jd(n){return D(n,.55,.12,.42,F.porcelain,0,.82,0),D(n,.1,.8,.1,F.porcelain,0,.4,-.08),ut(n,.012,.012,.18,F.chrome,0,.96,-.16,{seg:8}),n}function ah(n,t){let e=X(t,{roughness:.35}),i=new Lt(new gi(.1,.075,.06,20,1,!0),e);i.position.y=.03,n.add(i),ut(n,.075,.075,.005,e,0,.003,0,{seg:20});let s=ut(n,.085,.085,.02,X("#7a4a22",{roughness:1}),0,.035,0,{seg:16});return s.visible=!1,s}function Kd(n,t=3.55){ut(n,.16,.16,.03,X("#f2f0e8"),0,0,0,{rx:Math.PI/2,seg:24});let e=new Lt(new yi(.16,.015,6,24),X("#222"));n.add(e);let i=G(n,0,0,.02),s=G(n,0,0,.022);D(i,.012,.09,.005,X("#111"),0,.045,0,{cast:!1}),D(s,.008,.13,.005,X("#111"),0,.065,0,{cast:!1});let a=r=>{i.rotation.z=-(r%12/12)*Math.PI*2,s.rotation.z=-(r%1)*Math.PI*2};return a(t),{hour:i,minute:s,set:a}}function Ko(n){let t=X("#d8c38a",{roughness:.9}),e=ut(n,.22,.22,.015,t,0,0,0,{seg:20});return ut(n,.11,.12,.11,t,0,.06,0,{seg:16}),ut(n,.121,.121,.025,X("#222"),0,.02,0,{seg:16}),e}function Da(n,t,e=.2,i=.15,s=!0){D(n,e+.03,i+.03,.015,F.oakDark,0,0,0);let a=Ve(n,e,i,Ot(t,{roughness:.6}),0,0,.009,{uv:!1});if(s){let r=D(n,.02,i*.8,.01,F.oakDark,0,-.02,-.05);r.rotation.x=.4}return a}function rh(n,t){return D(n,.3,.4,.16,X(t,{roughness:.9}),0,.2,0),D(n,.24,.18,.06,X(t,{roughness:.9}),0,.14,.1),n}function Qd(n){for(let t of[-.08,.08]){D(n,.1,.18,.26,X("#161616"),t,.14,0);for(let e=0;e<4;e++)ut(n,.03,.03,.02,X("#e33"),t,.03,-.1+e*.066,{rz:Math.PI/2,seg:10})}return n}function Qo(n,t,e,i){let s=new Me(t,e,6,6),a=s.attributes.position;for(let o=0;o<a.count;o++)a.setZ(o,Math.sin(a.getY(o)*12)*.01+Math.sin(a.getX(o)*9)*.01);s.computeVertexNormals();let r=new Lt(s,X(i,{roughness:1,side:Ne}));return r.castShadow=!0,n.add(r),r}var Yi=class{constructor(t,e,i){this.world=t,this.id=i.id,this.def=i,this.name=i.name||"porta",this.locked=!!i.locked,this.lockMsg=i.lockMsg||"Est\xE1 trancada.",this.houseDoor=!!i.houseDoor,this.fake=!!i.fake,this.open=0,this.target=i.startOpen?1:0,this.open=this.target,this.maxAngle=i.maxAngle||1.65,this.speed=i.speed||2.2,this.onOpen=i.onOpen||null;let s=i.width||.82,a=i.height||2.08,r=.04;this.pivot=new We,this.pivot.position.set(i.hx,i.y||0,i.hz),this.baseRot=i.rot||0,this.swing=i.swing||1,this.pivot.rotation.y=this.baseRot,this.pivot.userData.dynamic=!0,e.add(this.pivot);let o=i.mat||F.doorWood,l=D(this.pivot,s,a,r,o,s/2,a/2,0,{uv:!1});this.panel=l;let c=s-.08;D(this.pivot,.03,.18,.02,F.chrome,c,1,r/2+.012,{cast:!1}),D(this.pivot,.03,.18,.02,F.chrome,c,1,-r/2-.012,{cast:!1}),D(this.pivot,.12,.022,.05,F.chrome,c-.05,1.05,r/2+.03,{cast:!1}),D(this.pivot,.12,.022,.05,F.chrome,c-.05,1.05,-r/2-.03,{cast:!1});let h=i.hx+Math.cos(this.baseRot)*s/2,d=i.hz-Math.sin(this.baseRot)*s/2,u=Math.abs(Math.cos(this.baseRot))>.5;this.col=u?t.colliderC(h,d,s,.12,{tag:"door",id:this.id}):t.colliderC(h,d,.12,s,{tag:"door",id:this.id}),this.center=new I(h,(i.y||0)+1,d),t.door(this),this.interact=t.interact(this.pivot,{id:this.id,kind:"door",prompt:()=>this.fake?"Abrir":this.open>.5?"Fechar":"Abrir",action:()=>this.toggle(!0)}),t.update(f=>this.update(f)),this.update(0)}toggle(t=!1){this.target<.5?this.tryOpen(t):this.close(t)}tryOpen(t=!1){return this.fake?(C.play("locked",{pos:this.center}),!1):this.locked?(C.play("locked",{pos:this.center}),t&&this.world.game&&this.world.game.ui.toast(this.lockMsg),!1):(this.openNow(t),!0)}openNow(t=!1,e={}){this.target!==1&&(this.target=1,this.speed=e.speed||this.def.speed||2.2,C.play(e.slam?"door_slam":"door_open",{pos:this.center,creakChance:t?.55:1}),t&&this.world.game&&this.world.game.noise(this.center.x,this.center.z,3),this.onOpen&&this.onOpen(t))}close(t=!1,e={}){this.target!==0&&(this.target=0,this.speed=e.speed||this.def.speed||2.2,this._closeSound=e.slam?"door_slam":"door_close",t&&this.world.game&&this.world.game.noise(this.center.x,this.center.z,e.slam?9:3))}set(t){this.open=this.target=t,this.update(0)}update(t){if(this.open!==this.target){let i=Math.sign(this.target-this.open);this.open=Pe(this.open+i*t*this.speed,0,1),i<0&&this.open===0&&this._closeSound&&(C.play(this._closeSound,{pos:this.center}),this._closeSound=null)}let e=this.open*this.open*(3-2*this.open);this.pivot.rotation.y=this.baseRot+this.swing*e*this.maxAngle,this.col.enabled=this.open<.25}},Fa=class{constructor(t,e,i){this.id=i.id,this.world=t,this.open=i.startOpen?1:0,this.target=this.open,this.dir=i.dir||new I(0,0,1),this.depth=i.depth||.35,this.group=new We,this.group.position.copy(i.pos),this.base=i.pos.clone(),this.group.rotation.y=i.ry||0,this.group.userData.dynamic=!0,e.add(this.group);let s=i.w||.5,a=i.h||.18,r=i.d||.4;D(this.group,s,a,.02,i.mat||F.whiteFurn,0,0,r/2),D(this.group,s-.04,.02,r,i.inner||F.oak,0,-a/2+.02,0,{cast:!1}),D(this.group,.02,a-.04,r,i.inner||F.oak,-s/2+.02,0,0,{cast:!1}),D(this.group,.02,a-.04,r,i.inner||F.oak,s/2-.02,0,0,{cast:!1}),ut(this.group,.018,.018,.02,F.chrome,0,0,r/2+.015,{rx:Math.PI/2,seg:10,cast:!1}),this.locked=!!i.locked,this.lockMsg=i.lockMsg||"Emperrada.",this.onChange=i.onChange||null,this.interact=t.interact(this.group,{id:this.id,kind:"drawer",name:i.name||"gaveta",prompt:()=>this.target>.5?"Fechar gaveta":"Abrir gaveta",action:()=>this.toggle()}),t.update(o=>this.update(o))}toggle(){if(this.locked){C.play("locked",{pos:this.group.position}),this.world.game&&this.world.game.ui.toast(this.lockMsg);return}this.target=this.target>.5?0:1,C.play("drawer",{pos:this.group.getWorldPosition(new I),close:this.target===0}),this.onChange&&this.onChange(this.target>.5)}set(t){this.open=this.target=t?1:0,this.update(0)}get isOpen(){return this.target>.5}update(t){this.open!==this.target&&(this.open=Pe(this.open+Math.sign(this.target-this.open)*t*3,0,1));let e=this.dir.clone().multiplyScalar(this.open*this.depth);this.group.position.copy(this.base).add(e)}},ki=class{constructor(t,e,i){this.id=i.id,this.world=t,this.pivot=new We,this.pivot.position.copy(i.hinge),this.baseRot=i.rot||0,this.swing=i.swing||1,this.pivot.userData.dynamic=!0,e.add(this.pivot),this.open=0,this.target=0,this.locked=!!i.locked,this.lockMsg=i.lockMsg||"N\xE3o abre.",this.onChange=i.onChange||null;let s=i.w||.5,a=i.h||1.9;this.panel=D(this.pivot,s,a,.025,i.mat||F.whiteFurn,s/2*(i.leftHinge?1:-1),a/2,0),D(this.pivot,.02,.3,.03,F.chrome,(s-.06)*(i.leftHinge?1:-1),a/2+(i.handleY||0),.025,{cast:!1}),this.dirSign=i.leftHinge?1:-1,i.interact!==!1&&(this.interact=t.interact(this.pivot,{id:this.id,kind:"leaf",name:i.name||"porta do arm\xE1rio",prompt:()=>this.target>.5?"Fechar":"Abrir",action:()=>this.toggle()})),t.update(r=>this.update(r))}toggle(){if(this.locked){C.play("locked",{pos:this.pivot.getWorldPosition(new I)}),this.world.game&&this.world.game.ui.toast(this.lockMsg);return}this.target=this.target>.5?0:1,C.play(this.target?"door_open":"door_close",{pos:this.pivot.getWorldPosition(new I),vol:.5,creakChance:.4,creakV:.5}),this.onChange&&this.onChange(this.target>.5)}set(t){this.open=this.target=t?1:0,this.update(0)}update(t){this.open!==this.target&&(this.open=Pe(this.open+Math.sign(this.target-this.open)*t*3,0,1)),this.pivot.rotation.y=this.baseRot-this.dirSign*this.swing*this.open*1.7}};var lh=!1,hh=null;function tf(n){hh=n}var ch={uniforms:{tDiffuse:{value:null},textureMatrix:{value:null},tint:{value:new Xt(1,1,1)},strength:{value:1},time:{value:0},fog:{value:0}},vertexShader:`
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec2 vUv2;
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vUv2 = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform vec3 tint;
    uniform float strength, time, fog;
    varying vec4 vUv;
    varying vec2 vUv2;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main() {
      vec4 base = texture2DProj(tDiffuse, vUv);
      vec3 c = base.rgb * tint * strength;
      // emba\xE7ado (vapor)
      float n = hash(floor(vUv2 * 90.0));
      c = mix(c, vec3(0.55, 0.58, 0.6) * (0.8 + 0.2 * n), fog);
      // manchas nas bordas
      float e = smoothstep(0.0, 0.08, vUv2.x) * smoothstep(1.0, 0.92, vUv2.x) * smoothstep(0.0, 0.08, vUv2.y) * smoothstep(1.0, 0.92, vUv2.y);
      c *= mix(0.7, 1.0, e);
      gl_FragColor = vec4(c, 1.0);
    }`},is=class extends Lt{constructor(t,e,i={}){super(new Me(t,e)),this.isMirror=!0;let s=i.res||512,a=t/e;this.rt=new Ze(Math.round(a>=1?s:s*a),Math.round(a>=1?s/a:s),{type:li,samples:0}),this.textureMatrix=new he,this.material=new ze({uniforms:Ro.clone(ch.uniforms),vertexShader:ch.vertexShader,fragmentShader:ch.fragmentShader}),this.material.uniforms.tDiffuse.value=this.rt.texture,this.material.uniforms.textureMatrix.value=this.textureMatrix,i.tint&&this.material.uniforms.tint.value.set(i.tint),this.material.uniforms.strength.value=i.strength===void 0?.92:i.strength,this.camLayers=i.layers||[ai.MIRROR],this.maxDist=i.maxDist||9,this.enabled=!0,this.virtualCam=new Ge,this.virtualCam.layers.disableAll();for(let r of this.camLayers)this.virtualCam.layers.enable(r);this._tmp={plane:new Ai,normal:new I,rpos:new I,cpos:new I,rot:new he,look:new I,clip:new we,view:new I,target:new I,q:new we},this.onBeforeRender=(r,o,l)=>this._renderReflection(r,o,l)}set fog(t){this.material.uniforms.fog.value=t}get fog(){return this.material.uniforms.fog.value}_renderReflection(t,e,i){if(lh||!this.enabled)return;let s=this._tmp;if(s.rpos.setFromMatrixPosition(this.matrixWorld),s.cpos.setFromMatrixPosition(i.matrixWorld),s.rpos.distanceTo(s.cpos)>this.maxDist||(s.rot.extractRotation(this.matrixWorld),s.normal.set(0,0,1).applyMatrix4(s.rot),s.view.subVectors(s.rpos,s.cpos),s.view.dot(s.normal)>0)||hh&&hh(s.cpos.x,s.cpos.z,s.rpos.x+s.normal.x*.2,s.rpos.z+s.normal.z*.2))return;s.view.reflect(s.normal).negate().add(s.rpos),s.rot.extractRotation(i.matrixWorld),s.look.set(0,0,-1).applyMatrix4(s.rot).add(s.cpos),s.target.subVectors(s.rpos,s.look).reflect(s.normal).negate().add(s.rpos);let a=this.virtualCam;a.position.copy(s.view),a.up.set(0,1,0).applyMatrix4(s.rot).reflect(s.normal),a.lookAt(s.target),a.far=i.far,a.updateMatrixWorld(),a.projectionMatrix.copy(i.projectionMatrix),this.textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),this.textureMatrix.multiply(a.projectionMatrix).multiply(a.matrixWorldInverse).multiply(this.matrixWorld),s.plane.setFromNormalAndCoplanarPoint(s.normal,s.rpos).applyMatrix4(a.matrixWorldInverse),s.clip.set(s.plane.normal.x,s.plane.normal.y,s.plane.normal.z,s.plane.constant);let r=a.projectionMatrix.elements;s.q.x=(Math.sign(s.clip.x)+r[8])/r[0],s.q.y=(Math.sign(s.clip.y)+r[9])/r[5],s.q.z=-1,s.q.w=(1+r[10])/r[14],s.clip.multiplyScalar(2/s.clip.dot(s.q)),r[2]=s.clip.x,r[6]=s.clip.y,r[10]=s.clip.z+1-.003,r[14]=s.clip.w,lh=!0,this.visible=!1;let o=t.getRenderTarget(),l=t.shadowMap.autoUpdate;t.shadowMap.autoUpdate=!1,t.setRenderTarget(this.rt),t.state.buffers.depth.setMask(!0),t.clear(),t.render(e,a),t.shadowMap.autoUpdate=l,t.setRenderTarget(o),this.visible=!0,lh=!1}};var vi=2.6,Na=.12;function c_(n){let t=n.corridorLong?2.4:0;return{len:t,P:11+t,corridorEnd:11+t}}function ef(n){return n&&n.map&&n.map.userData.size?n.map.userData.size:1.2}function h_(n,t,e,i,s){let a=n.attributes.position,r=n.attributes.normal,o=n.attributes.uv;for(let l=0;l<a.count;l++){let c=Math.floor(l/4),h=ef(Array.isArray(s)?s[c]:s),d=a.getX(l)+t,u=a.getY(l)+e,f=a.getZ(l)+i,g=Math.abs(r.getX(l)),_=Math.abs(r.getY(l)),p=Math.abs(r.getZ(l));p>=g&&p>=_?o.setXY(l,d/h,u/h):g>=_?o.setXY(l,f/h,u/h):o.setXY(l,d/h,f/h)}o.needsUpdate=!0}function tl(n,t,e,i,s,a,r,o,l,c,h,d){if(a-s<.005||o-r<.005)return null;let u,f,g,_=(r+o)/2,p;e==="x"?(u=new Fi(a-s,o-r,d.thick||Na),f=(s+a)/2,g=i,p=[l,l,l,l,c,l]):(u=new Fi(d.thick||Na,o-r,a-s),f=i,g=(s+a)/2,p=[c,l,l,l,l,l]),h_(u,f,_,g,p);let m=new Lt(u,p);if(m.position.set(f,_,g),m.castShadow=!0,m.receiveShadow=!0,t.add(m),h){let M=(d.thick||Na)/2;e==="x"?n.collider(s,a,i-M,i+M,{los:o>1.5||d.los===!0}):n.collider(i-M,i+M,s,a,{los:o>1.5||d.los===!0})}return m}function Kt(n,t,e,i,s,a,r,o,l=[],c={}){let h=c.h||vi,d=c.y0||0,u=[...l].sort((_,p)=>_.a-p.a),f=s,g=[];for(let _ of u){_.a>f&&g.push(tl(n,t,e,i,f,_.a,d,h,r,o,!0,c));let p=_.top===void 0?2.1:_.top,m=_.bottom||0;m>0&&g.push(tl(n,t,e,i,_.a,_.b,d,m,r,o,!0,{...c,los:!1})),p<h&&g.push(tl(n,t,e,i,_.a,_.b,p,h,r,o,!1,c)),f=Math.max(f,_.b)}return a>f&&g.push(tl(n,t,e,i,f,a,d,h,r,o,!0,c)),g}function el(n,t,e,i,s,a,r,o=!1){let l=e-t,c=s-i,h=new Me(l,c),d=(t+e)/2,u=(i+s)/2,f=ef(a),g=h.attributes.position,_=h.attributes.uv;for(let m=0;m<g.count;m++){let M=g.getX(m),A=g.getY(m);_.setXY(m,(d+M)/f,(o?u+A:-(u-A))/f)}let p=new Lt(h,a);return p.rotation.x=o?Math.PI/2:-Math.PI/2,p.position.set(d,r,u),p.receiveShadow=!0,n.add(p),p}function fn(n,t,e,i,s,a,r,o,l,c={}){el(t,e,i,s,a,r,c.y||0),c.ceiling!==!1&&el(t,e,i,s,a,c.ceilMat||F.ceiling,(c.y||0)+(c.h||vi),!0),n.floor(e,i,s,a,o,null,l)}function ka(n,t,e,i,s,a){let r=s-i;t==="x"?D(n,r,.07,.012,F.whiteFurn,(i+s)/2,.035,e+a*(Na/2+.006),{cast:!1}):D(n,.012,.07,r,F.whiteFurn,e+a*(Na/2+.006),.035,(i+s)/2,{cast:!1})}function uh(){return new Yt({color:16774108})}function kn(n,t,e,i,s={}){let a=G(t,e,s.y||vi,i),r=uh(),o;s.kind==="bulb"?(ut(a,.025,.025,.08,F.whiteFurn,0,-.04,0,{seg:8}),o=ee(a,.055,r,0,-.12,0,{cast:!1})):o=ut(a,.17,.15,.05,r,0,-.025,0,{seg:20,cast:!1});let l=n.fixture(e,(s.y||vi)-.25,i,{...s,bulb:r});return{g:a,f:l,mat:r,bulbMesh:o}}function il(n,t,e,i,s,a,r){let o=G(t,i,s,a,r);return D(o,.08,.08,.01,F.whiteFurn,0,0,0,{cast:!1}),D(o,.012,.02,.012,X("#333"),-.015,0,.006,{cast:!1}),D(o,.012,.02,.012,X("#333"),.015,0,.006,{cast:!1}),D(o,.26,.26,.04,new Yt({visible:!1}),0,0,.02,{cast:!1}),n.interact(o,{id:e,kind:"socket",dist:1.9,prompt:()=>n.game&&n.game.inventory.has("carregador")?"Segure E para carregar o celular":"Tomada",action:()=>{n.game.inventory.has("carregador")||n.game.ui.toast("Uma tomada. Falta o carregador.")}}),o}function nf(n,t){let e=c_(t);return u_(n,t),d_(n,t),f_(n,t),p_(n,t),m_(n,t,e),g_(n,t),v_(n,t),__(n,t),x_(n,t,e),t.corridorLong&&M_(n,t,e),S_(n,t),e}function u_(n,t){let e=n.begin("sala");fn(n,e,0,4.2,0,8,F.woodFloor,"wood","sala"),Kt(n,e,"x",0,0,4.2,F.white,F.white,[{a:.5,b:3.7,top:2.25}]),Kt(n,e,"z",0,0,4,F.white,F.darkGray),Kt(n,e,"z",0,4,5.2,F.kitchenWall,F.darkGray),Kt(n,e,"z",0,5.2,8,F.kitchenWall,F.white,[{a:5.4,b:6.3}]),Kt(n,e,"x",8,0,4.2,F.white,F.white,[{a:.55,b:1.4}]),Kt(n,e,"z",4.2,0,3.4,F.white,F.white),Kt(n,e,"z",4.2,3.4,4.2,F.white,F.purple),Kt(n,e,"z",4.2,4.2,6.7,F.gray,F.purple),Kt(n,e,"z",4.2,6.7,8,F.gray,F.bathWall,[{a:6.7,b:7.7}]),ka(e,"z",0,0,5.4,1),ka(e,"z",4.2,0,6.7,-1),ka(e,"x",8,1.4,4.2,-1),n.zone("sala",0,4.2,0,8),n.zone("entrada",0,2.2,6,8),new Yi(n,e,{id:"porta_entrada",name:"porta de entrada",hx:.55,hz:8,rot:0,swing:1,width:.85,mat:F.doorEntrance,locked:!0,lockMsg:"Trancada. A chave n\xE3o est\xE1 aqui."});let i=G(e,0,0,0);D(i,1.6,2.2,.03,F.glass,1.3,1.1,0,{cast:!1}),D(i,.05,2.25,.08,X("#d8d8d4",{metalness:.3}),2.1,1.125,0),D(i,3.2,.05,.08,X("#d8d8d4",{metalness:.3}),2.1,2.22,0),n.collider(.5,2.1,-.06,.06,{los:!1});let s=G(e,2.1,0,.12),a=jo(s,3.4,2.3,F.curtainWhite,t.d_cortina===!1?0:.55);n.name("cortina_sala",s),n.interact(s,{id:"cortina_sala",kind:"hide",prompt:()=>"Esconder-se atr\xE1s da cortina"}),n.hide({id:"cortina_sala",kind:"curtain",cam:{x:3.2,y:1.42,z:.08,yaw:Math.PI,pitch:-.05},exit:{x:3,z:.7}});let r=G(e,.24,0,2.8,Math.PI/2);Xo(r,2.4),n.collider(.02,.46,1.6,4,{los:!1});let o=G(e,.04,1.42,2.8,Math.PI/2),l=Yo(o,1.35);n.name("tv_screen",l),n.name("tv_group",o),n.interact(o,{id:"tv",kind:"examine",prompt:()=>"Olhar a TV"});let c=new is(1.33,.76,{res:384,strength:.16,tint:8952234,maxDist:7});c.position.set(.069,1.42,2.8),c.rotation.y=Math.PI/2,pe(c,"e"),e.add(c),n.name("tv_mirror",c);let h=G(e,.28,.66,2,Math.PI/2),d=[];for(let j=0;j<3;j++){let it=G(h,-.25+j*.26,.09,0,0),Z=Da(it,Os("ok",4+j%2,j+1),.18,.13);d.push({f:it,pic:Z})}n.name("rack_photos",h),n.name("rack_photo_list",{photos:d}),n.interact(h,{id:"rack_photos",kind:"examine",prompt:()=>"Olhar as fotos"});let u=G(e,.24,.66,3.75,Math.PI/2),f=Da(u,Zc(0),.16,.12);n.name("bday_photo",f),n.interact(u,{id:"bday_photo",kind:"examine",prompt:()=>"Olhar a foto"});let g=G(e,.46,.3,3.68);D(g,.02,.38,.28,new Yt({visible:!1}),0,0,0,{cast:!1}),n.interact(g,{id:"rack_door",kind:"examine",prompt:()=>"Portinha do rack"}),n.name("rack_drawer_obj",new Fa(n,e,{id:"rack_drawer",name:"gaveta do rack",pos:new I(.26,.33,3.1),ry:Math.PI/2,dir:new I(1,0,0),w:.5,h:.14,d:.36,mat:F.cream,locked:!0,lockMsg:"A gaveta do rack est\xE1 trancada."}));let _=G(e,3.68,0,2.6,-Math.PI/2);Dd(_,2.6),n.collider(3.2,4.2,1.3,3.9,{los:!1}),n.interact(_,{id:"sofa",kind:"examine",prompt:()=>"Examinar o sof\xE1"});let p=G(e,3.85,0,.75);Od(p),n.collider(3.65,4.05,.55,.95,{los:!1}),il(n,e,"socket_sala",4.13,.35,1.1,-Math.PI/2),D(e,.004,.004,.5,X("#111"),3.45,.44,3.4,{cast:!1});let m=G(e,3.9,0,4.35,-Math.PI/2);Ud(m),n.collider(3.62,4.2,3.9,4.8,{los:!1}),n.interact(m,{id:"white_table",kind:"examine",prompt:()=>"Examinar a mesinha"});let M=G(e,3.98,0,5.8,Math.PI/2);Zo(M),n.name("bike",M),n.interact(M,{id:"bike",kind:"examine",prompt:()=>"Examinar a bicicleta"}),n.name("bike_col",n.collider(3.8,4.2,5,6.6,{los:!1,id:"bike_col"}));let A=G(e,3.98,0,5.8,Math.PI/2);Zo(A),pe(A,"v"),n.name("bike_video",A);let b=G(e,3.45,0,5.2);ts(b),n.name("stool",b),n.interact(b,{id:"stool",kind:"pickup",prompt:()=>"Pegar o banquinho"});let w=G(e,3.2,1.55,7.93,Math.PI);Bs(w,!1),pe(w,"ec"),n.name("painting",w),n.interact(w,{id:"painting",kind:"examine",prompt:()=>"Examinar o quadro"});let S=G(e,3.2,.39,7.86,Math.PI);Bs(S,!1),S.rotation.x=-.12,pe(S,"v");let R=G(e,3.2,1.55,7.93,Math.PI);Bs(R,!0),pe(R,"m"),n.name("painting_mirror",R);let x=G(e,2.35,0,7.88,Math.PI);Fd(x),x.rotation.x=-.18,n.name("folding_chair",x),n.interact(x,{id:"folding_chair",kind:"examine",prompt:()=>"Examinar a cadeira"});let E=G(e,1.9,0,3,-Math.PI/2);D(E,.44,.03,.42,X("#6d1d2a"),0,.46,0),D(E,.44,.45,.03,X("#6d1d2a"),0,.72,-.2);for(let j of[-1,1])D(E,.02,.9,.02,X("#b8bcc0",{metalness:.6}),j*.21,.45,-.18),D(E,.02,.46,.02,X("#b8bcc0",{metalness:.6}),j*.21,.23,.18);pe(E,"ec"),n.name("chair_open",E),n.interact(E,{id:"chair_open",kind:"examine",prompt:()=>"Examinar a cadeira"});let P=G(e,1.75,1.5,7.93,Math.PI);D(P,.34,.3,.05,new Yt({visible:!1}),0,0,.03,{cast:!1}),n.name("keyholder",P),n.interact(P,{id:"keyholder",kind:"examine",prompt:()=>"Olhar o porta-chaves"});let N=G(e,.07,1.45,7.65,Math.PI/2),B=Nd(N);n.name("intercom_handset",B),n.interact(N,{id:"intercom",kind:"examine",prompt:()=>"Interfone"});let V=G(e,.06,1.75,7,Math.PI/2),L=kd(V);n.name("breaker",L),n.interact(V,{id:"breaker",kind:"examine",prompt:()=>"Quadro de luz"});let U=G(e,1.62,1.2,7.93,Math.PI);D(U,.08,.12,.012,F.whiteFurn,0,0,0,{cast:!1});let $=G(e,2.1,vi,3.2),K=eh($);n.name("fan_sala",K);let ot=uh();K.bulb.material=ot,n.fixture(2.1,vi-.45,3.2,{id:"sala",room:"sala",intensity:7,dist:8,bulb:ot}),kn(n,e,1.6,6.9,{id:"entrada",room:"sala",intensity:5,dist:6}),n.fixture(.7,1.4,2.8,{id:"tv_glow",room:"sala",intensity:0,dist:5,on:!1,color:10467583}),n.nav("s_bal",2.9,.4,"sala"),n.nav("s1",2.3,1.2,"sala"),n.nav("s2",2.3,4,"sala"),n.nav("s3",2.2,6.9,"sala"),n.nav("s_ent",1,7.4,"sala"),n.nav("s_kd",.45,5.85,"sala"),n.nav("s_cd",3.9,7.2,"sala"),n.link("s_bal","s1"),n.link("s1","s2"),n.link("s2","s3"),n.link("s3","s_ent"),n.link("s2","s_kd"),n.link("s3","s_kd"),n.link("s3","s_cd"),n.link("s2","s_cd"),n.end()}function d_(n,t){let e=n.begin("varanda");fn(n,e,0,4.2,-1.5,0,F.balconyFloor,"tile","varanda"),Kt(n,e,"z",0,-1.5,0,F.white,F.white),Kt(n,e,"z",4.2,-1.5,0,F.white,F.white),Kt(n,e,"x",-1.5,0,4.2,F.white,F.white,[],{h:1.05}),n.collider(0,4.2,-1.62,-1.44,{los:!1});let i=(()=>{let f=document.createElement("canvas");f.width=f.height=128;let g=f.getContext("2d");g.strokeStyle="rgba(230,230,230,0.8)",g.lineWidth=2;for(let p=-128;p<256;p+=16)g.beginPath(),g.moveTo(p,0),g.lineTo(p+128,128),g.stroke(),g.beginPath(),g.moveTo(p+128,0),g.lineTo(p,128),g.stroke();let _=new Je(f);return _.wrapS=_.wrapT=ji,_.repeat.set(12,5),_})(),s=Ve(e,4.2,1.5,new Yt({map:i,transparent:!0,opacity:.45,side:Ne,depthWrite:!1}),2.1,1.8,-1.5,{uv:!1,receive:!1});n.interact(s,{id:"net",kind:"examine",prompt:()=>"Olhar l\xE1 fora"});let a=G(e,2,0,-.75),r=X("#dfe3e6",{metalness:.4}),o=X("#2f6fd0",{roughness:.5});D(a,1.6,.03,.03,r,0,1.45,-.3),D(a,1.6,.03,.03,r,0,1.45,.3),D(a,.04,1.45,.04,o,-.8,.72,0),D(a,.04,1.45,.04,o,.8,.72,0);let l=[];for(let[f,g]of[[-.35,"#f2f0ea"],[.35,"#e6e9ee"]]){let _=Qo(G(a,f,1,0),.6,.9,g);l.push(_)}let c=G(a,0,0,.3),h=new gi(.18,.34,1.5,14,4),d=h.attributes.position;for(let f=0;f<d.count;f++)d.getY(f)>.5&&(d.setX(f,d.getX(f)*.65),d.setZ(f,d.getZ(f)*.65));h.computeVertexNormals();let u=new Lt(h,X("#eceae4",{roughness:1}));u.position.y=.76,u.castShadow=!0,c.add(u),ee(c,.16,X("#eceae4",{roughness:1}),0,1.56,0),pe(c,"ec"),n.name("sheet_figure",c),n.interact(c,{id:"sheet_figure",kind:"examine",prompt:()=>"Puxar o len\xE7ol"}),n.interact(a,{id:"drying_rack",kind:"examine",prompt:()=>"Examinar o varal"}),n.collider(1.15,2.85,-1.15,-.35,{los:!1}),n.fixture(2.1,2.2,-.9,{id:"varanda",room:"varanda",intensity:1.2,dist:6,color:9414360}),n.nav("v1",3,-.4,"varanda"),n.link("v1","s_bal"),n.end()}function f_(n,t){let e=n.begin("cozinha");fn(n,e,-3,0,4,8,F.kitchenFloor,"tile","cozinha"),Kt(n,e,"x",4,-3,0,F.white,F.kitchenWall,[{a:-2.55,b:-1.45,bottom:1.25,top:2.1}]),Kt(n,e,"z",-3,4,10.2,F.white,F.kitchenWall),Kt(n,e,"x",8,-3,0,F.kitchenWall,F.kitchenWall,[{a:-2.4,b:-1.6}]);let i=G(e,-2,1.25,4);es(i,1.1,.85,{louver:!0}),n.zone("cozinha",-3,0,4,8);let s=G(e,-2.7,0,6.1,Math.PI/2);zd(s,3,{sink:-.3,stove:.9}),n.collider(-3,-2.4,4.6,7.6,{los:!1});let a=G(e,-2.7,.9,5.2);D(a,.5,.05,.5,new Yt({visible:!1}),0,0,0,{cast:!1}),n.interact(a,{id:"stove",kind:"examine",prompt:()=>"Fog\xE3o"});let r=G(e,-2.84,.94,5.1);for(let L=0;L<8;L++){let U=L/8*Math.PI*2;ee(r,.018,Si("#5aa0ff"),Math.cos(U)*.05,0,Math.sin(U)*.05,{seg:6,seg2:4,cast:!1})}r.visible=!1,n.name("stove_flame",r);let o=G(e,-2.83,1.95,6.1,Math.PI/2),l=Vd(o,3),c=[];l.leaves.forEach((L,U)=>{let $=new I(-2.66,1.64,6.1-L.x-L.w/2),K=new ki(n,e,{id:"cab_"+(U+1),hinge:$,rot:Math.PI/2,w:L.w,h:.6,mat:F.oakDark,leftHinge:!1,name:"arm\xE1rio"});c.push(K)}),n.name("cabinets",c);let h=G(e,-2.85,1.72,6.1-l.leaves[1].x);ut(h,.06,.06,.16,X("#7a1c1c"),0,.08,0,{seg:12});let d=G(e,-.55,0,4.42);Bd(d),n.collider(-.9,-.2,4.08,4.76,{los:!1});let u=new ki(n,e,{id:"fridge_door",hinge:new I(-.21,0,4.76),rot:0,w:.68,h:1.2,mat:Ot(Td(14,2),{roughness:.4}),leftHinge:!1,name:"geladeira",handleY:.2});u.panel.position.y=.6,u.panel.scale.set(1,1,1);let f=new ki(n,e,{id:"freezer_door",hinge:new I(-.21,1.22,4.76),rot:0,w:.68,h:.52,mat:X("#e6e8e7",{roughness:.35}),leftHinge:!1,name:"congelador"});n.name("fridge_door",u),n.name("freezer_door",f);let g=G(e,-.55,0,4.45);D(g,.6,.02,.5,X("#dfe8ee",{transparent:!0,opacity:.8}),0,.5,0,{cast:!1}),D(g,.6,.02,.5,X("#dfe8ee",{transparent:!0,opacity:.8}),0,.85,0,{cast:!1}),ut(g,.05,.05,.2,X("#fff"),-.15,.62,0,{seg:10}),ut(g,.04,.04,.24,X("#2a8a3a"),.12,.99,.05,{seg:10});let _=G(e,-.55,1.35,4.5);D(_,.22,.16,.2,X("#bfe6ff",{transparent:!0,opacity:.8,roughness:.1}),0,.08,0),D(_,.12,.02,.02,X("#c9a23a",{metalness:.7}),0,.08,.02),_.visible=!1,n.name("ice_block",_),n.interact(_,{id:"ice_block",kind:"pickup",prompt:()=>"Pegar o bloco de gelo"}),n.fixture(-.55,1,4.9,{id:"fridge_light",room:"cozinha",intensity:0,dist:3,on:!1,color:14675967});let p=G(e,-.42,1.45,4.785);Ve(p,.12,.15,Ot(Ed(3),{roughness:.9}),0,0,.001,{uv:!1}),n.interact(p,{id:"fridge_note",kind:"examine",prompt:()=>"Ler o bilhete"});let m=G(e,-1.3,0,4.3);D(m,.6,.9,.5,F.whiteFurn,0,.45,0),n.collider(-1.6,-1,4.05,4.55,{los:!1});let M=G(e,-1.3,.9,4.32),A=Hd(M);n.name("microwave_display",A),n.interact(M,{id:"microwave",kind:"examine",prompt:()=>"Micro-ondas"});let b=G(e,-.07,2,5,-Math.PI/2),w=Kd(b,3.55);n.name("kitchen_clock",w),n.interact(b,{id:"kitchen_clock",kind:"examine",prompt:()=>"Rel\xF3gio"});let S=G(e,-1.9,0,7.1);ts(S,.62),n.interact(S,{id:"kitchen_stool",kind:"examine",prompt:()=>"Examinar"});let R=G(e,-.35,0,7.6);ut(R,.14,.12,.45,X("#222",{metalness:.6,roughness:.3}),0,.225,0,{seg:14});let x=G(e,-1.25,0,7.65),E=ah(x,"#2d5fbf");Ve(x,.16,.05,Ot(Wo("BENTO",{bg:"#2d5fbf",fg:"#fff",h:48})),0,.005,.14,{rx:-Math.PI/2,uv:!1});let P=G(e,-.8,0,7.65),N=ah(P,"#e3649a");Ve(P,.16,.05,Ot(Wo("LILI",{bg:"#e3649a",fg:"#fff",h:48})),0,.005,.14,{rx:-Math.PI/2,uv:!1}),n.name("food_bento",E),n.name("food_lili",N),n.interact(x,{id:"bowl_bento",kind:"examine",prompt:()=>"Pote do Bento"}),n.interact(P,{id:"bowl_lili",kind:"examine",prompt:()=>"Pote da Lili"});let B=G(e,-.55,0,5);ts(B),B.visible=!1,n.name("stool_fridge",B),n.interact(B,{id:"stool_fridge",kind:"examine",prompt:()=>null});let V=G(e,-.55,1.78,4.42);D(V,.6,.06,.55,new Yt({visible:!1}),0,0,0,{cast:!1}),n.interact(V,{id:"fridge_top",kind:"examine",dist:2.6,prompt:()=>null}),kn(n,e,-1.5,6,{id:"cozinha",room:"cozinha",intensity:6,dist:7}),n.nav("k0",-.45,5.85,"cozinha"),n.nav("k1",-1.4,6,"cozinha"),n.nav("k2",-1.6,5,"cozinha"),n.nav("k3",-2,7.5,"cozinha"),n.link("k0","s_kd"),n.link("k0","k1"),n.link("k1","k2"),n.link("k1","k3"),n.end()}function p_(n,t){let e=n.begin("servico");fn(n,e,-3,-.8,8,10.2,F.serviceFloor,"tile","servico"),Kt(n,e,"z",-.8,8,10.2,F.kitchenWall,F.white),Kt(n,e,"x",10.2,-3,-.8,F.kitchenWall,F.white,[{a:-2.4,b:-1.4,bottom:1.3,top:2}]);let i=G(e,-1.9,1.3,10.2);es(i,1,.7,{louver:!0}),n.zone("servico",-3,-.8,8,10.2);let s=G(e,-2.62,0,9.82);Gd(s),n.collider(-2.95,-2.3,9.5,10.15,{los:!1}),n.interact(s,{id:"washer",kind:"examine",prompt:()=>"M\xE1quina de lavar"});let a=G(e,-1.9,0,9.9);Wd(a),n.collider(-2.2,-1.6,9.62,10.15,{los:!1}),n.interact(a,{id:"tank",kind:"examine",prompt:()=>"Tanque"});let r=G(e,-1.35,0,10.05);qd(r);let o=G(e,-1,0,9,-Math.PI/2);Xd(o,1.2,3,.35),n.collider(-1.18,-.8,8.4,9.6,{los:!1});let l=["#2a8a3a","#e8e8e8","#c62828"];for(let _=0;_<3;_++)D(o,.2,.25,.2,X(l[_],{roughness:.9}),-.4+_*.3,.64,0);let c=G(e,-1,1.52,9.1);D(c,.2,.3,.12,X("#d9632a"),0,.15,0),Ve(c,.12,.08,Ot(Wo("RA\xC7\xC3O",{bg:"#fff",fg:"#d9632a",h:48})),0,.17,-.061,{ry:Math.PI,uv:!1}),n.name("racao",c),n.interact(c,{id:"racao",kind:"pickup",dist:2.6,prompt:()=>"Pegar a ra\xE7\xE3o"});let h=G(e,-1.45,0,9.1);ts(h),h.visible=!1,n.name("stool_shelf",h);let d=G(e,-1.75,.9,9.85);ut(d,.04,.04,.03,X("#999",{metalness:.8}),0,.015,0,{seg:12}),D(d,.09,.012,.02,X("#c33"),0,.035,0),d.visible=!1,n.name("registro",d),n.interact(d,{id:"registro",kind:"pickup",prompt:()=>"Pegar o registro do chuveiro"});let u=G(e,-2.72,0,8.45,Math.PI/2);La(u,.6,1.9,.5,F.whiteFurn);let f=new ki(n,e,{id:"cab_servico",hinge:new I(-2.46,.02,8.15),rot:Math.PI/2,w:.6,h:1.86,leftHinge:!1,interact:!1});n.collider(-3,-2.45,8.15,8.75),n.interact(u,{id:"hide_servico",kind:"hide",extra:[f.pivot],prompt:()=>"Esconder-se no arm\xE1rio"}),n.hide({id:"hide_servico",kind:"wardrobe",leaf:f,cam:{x:-2.72,y:1.35,z:8.45,yaw:-Math.PI/2,pitch:0},exit:{x:-2,z:8.5}});let g=kn(n,e,-1.9,9.1,{id:"servico",room:"servico",intensity:4.5,dist:5,kind:"bulb"});n.name("servico_bulb",g),n.nav("sv0",-2,8,"servico"),n.nav("sv1",-1.9,8.9,"servico"),n.link("sv0","k3"),n.link("sv0","sv1"),n.end()}function m_(n,t,e){let i=n.begin("corredor"),s=e.corridorEnd;fn(n,i,4.2,s,6.7,7.7,F.woodFloor,"wood","corredor"),Kt(n,i,"x",6.7,4.2,7.3,F.purple,F.white,[{a:5,b:5.82}]),Kt(n,i,"x",6.7,7.3,10.4,F.white,F.white,[{a:8.3,b:9.12}]),Kt(n,i,"x",6.7,10.4,s,F.white,F.white);let a=t.corridorLong?[{a:11.8,b:12.62}]:[];Kt(n,i,"x",7.7,4.2,6.6,F.white,F.bathWall,[{a:4.65,b:5.37}]),Kt(n,i,"x",7.7,6.6,s,F.white,F.white,a),ka(i,"x",6.7,4.2,s,1),ka(i,"x",7.7,4.2,s,-1),n.zone("corredor",4.2,s,6.7,7.7),n.zone("corredor_fim",s-2.2,s,6.7,7.7),kn(n,i,5.6,7.2,{id:"corredor1",room:"corredor",intensity:3.5,dist:5}),kn(n,i,s-1.6,7.2,{id:"corredor2",room:"corredor",intensity:3.5,dist:5}),n.nav("c0",4.6,7.2,"corredor"),n.nav("c1",5.4,7.2,"corredor"),n.nav("c2",8.7,7.2,"corredor"),n.nav("c3",s-.45,7.2,"corredor"),n.link("c0","s_cd"),n.link("c0","c1"),n.link("c1","c2"),n.link("c2","c3"),t.corridorLong&&(n.nav("c4",12.2,7.2,"corredor"),n.link("c2","c4"),n.link("c4","c3")),n.end()}function g_(n,t){let e=n.begin("banheiro");fn(n,e,4.2,6.6,7.7,9.9,F.bathFloor,"tile","banheiro"),Kt(n,e,"z",4.2,8,9.9,F.white,F.bathWall),Kt(n,e,"x",9.9,4.2,6.6,F.bathWall,F.white,[{a:5.85,b:6.4,bottom:1.6,top:2.1}]),Kt(n,e,"z",6.6,7.7,9.9,F.bathWall,F.white);let i=G(e,6.12,1.6,9.9);es(i,.55,.5,{louver:!0}),n.zone("banheiro",4.2,6.6,7.7,9.9),new Yi(n,e,{id:"porta_banheiro",name:"porta do banheiro",hx:4.65,hz:7.7,rot:0,swing:-1,width:.72});let s=G(e,4.45,0,8.45,Math.PI/2);jd(s),n.collider(4.2,4.72,8.2,8.7,{los:!1});let a=new is(.5,.7,{res:384,maxDist:6});a.position.set(4.276,1.6,8.45),a.rotation.y=Math.PI/2,pe(a,"e"),e.add(a),D(e,.02,.74,.54,F.whiteFurn,4.26,1.6,8.45),n.name("bath_mirror",a),n.interact(a,{id:"bath_mirror",kind:"examine",prompt:()=>"Olhar o espelho"});let r=G(e,4.32,1.62,8.45,Math.PI/2);Qo(r,.6,.78,"#6fb89a"),pe(r,"ec"),r.visible=!1,n.name("towel_mirror",r),n.interact(r,{id:"towel_mirror",kind:"examine",prompt:()=>"Tirar a toalha do espelho"});let o=G(e,5.05,0,9.6,Math.PI);$d(o),n.collider(4.8,5.3,9.3,9.9,{los:!1}),n.interact(o,{id:"toilet",kind:"examine",prompt:()=>"Examinar"});let l=G(e,0,0,0);D(l,.02,1.9,1.1,F.glass,5.66,.95,9.3,{cast:!1}),ut(l,.015,.015,1.15,F.chrome,5.66,1.95,9.3,{rx:Math.PI/2,seg:6});let c=G(l,5.66,1.55,9,Math.PI/2);Qo(c,.5,.75,"#6fb89a");let h=G(l,6.35,2.05,9.8);ut(h,.07,.05,.03,F.chrome,0,0,0,{seg:12}),n.collider(5.6,5.72,8.75,9.85,{los:!1}),n.interact(l,{id:"shower",kind:"hide",prompt:()=>"Esconder-se no box"}),n.hide({id:"shower",kind:"shower",cam:{x:6.25,y:1.4,z:9.55,yaw:Math.PI*.5,pitch:0},exit:{x:5.4,z:8.9}});let d=G(e,6.55,1.2,9.3,-Math.PI/2),u=ut(d,.04,.04,.03,X("#999",{metalness:.8}),0,0,.015,{rx:Math.PI/2,seg:12}),f=D(d,.09,.012,.02,X("#c33"),0,0,.035);n.name("shower_valve",{regMesh:u,regHandle:f,g:d}),n.interact(d,{id:"shower_valve",kind:"examine",prompt:()=>"Registro do chuveiro"});let g=G(e,6.15,0,9.35,Math.PI/2);Zo(g),g.rotation.z=.25,pe(g,"ec"),n.name("bike_bath",g),n.interact(g,{id:"bike_bath",kind:"examine",prompt:()=>"A bicicleta?"});let _=G(e,6.53,1.65,8.2,-Math.PI/2);D(_,.26,.32,.02,X("#6b3b1c"),0,0,0),Ve(_,.2,.26,X("#d9cba0"),0,0,.011,{uv:!1}),n.interact(_,{id:"bath_picture",kind:"examine",prompt:()=>"Examinar o quadrinho"}),kn(n,e,5.4,8.8,{id:"banheiro",room:"banheiro",intensity:5,dist:5}),n.fixture(6.1,1.9,9.3,{id:"shower_steam",room:"banheiro",intensity:0,dist:3,on:!1,color:16769216}),n.nav("h0",5.01,7.9,"banheiro"),n.nav("h1",5.2,8.7,"banheiro"),n.link("h0","c1","porta_banheiro"),n.link("h0","h1"),n.end()}function v_(n,t){let e=n.begin("roxo");fn(n,e,4.2,7.3,3.4,6.7,F.woodFloor,"wood","roxo"),Kt(n,e,"x",3.4,4.2,7.3,F.white,F.purple,[{a:4.6,b:5.9,bottom:.9,top:2.2}]),Kt(n,e,"z",7.3,3.4,6.7,F.purple,F.white);let i=G(e,5.25,.9,3.4);es(i,1.3,1.3);let s=G(e,5.25,0,3.52);jo(s,1.7,2.3,F.curtainBeige,.15),n.zone("roxo",4.2,7.3,3.4,6.7),new Yi(n,e,{id:"porta_roxo",name:"porta do quarto",hx:5,hz:6.7,rot:0,swing:1,width:.82});let a=G(e,4.74,0,4.45);$o(a,.95,1.95,F.sheetLilac,F.knit),n.collider(4.2,5.24,3.45,5.45,{los:!1}),n.interact(a,{id:"bed_roxo",kind:"hide",prompt:()=>"Esconder-se embaixo da cama"}),n.hide({id:"bed_roxo",kind:"bed",cam:{x:4.74,y:.2,z:4.5,yaw:-Math.PI/2,pitch:.02},exit:{x:5.6,z:4.6}});let r=G(e,4.74,.66,4.2),o=ee(r,.32,F.knit,0,.02,.1,{sx:.9,sy:.45,sz:2}),l=G(r,0,.06,-.62);for(let U=0;U<9;U++)ee(l,.07,X("#140c07",{roughness:1}),Math.cos(U)*.08,Math.sin(U*1.3)*.04,Math.sin(U)*.06,{seg:8,seg2:6});n.name("julia_sleeper",{g:r,body:o,hair:l});let c=G(e,4.74,.62,4.3),h=["#222","#e2e0da","#6a1d2a","#2b3a67"];for(let U=0;U<7;U++){let $=D(c,.3,.06,.25,X(h[U%4],{roughness:1}),(U%3-1)*.12,.03+U%2*.05,(U-3)*.08);$.rotation.y=U}c.visible=!1,n.name("clothes_pile",c);let d=G(e,6.72,0,3.74);La(d,1.05,2.1,.58,F.whiteFurn),n.collider(6.2,7.25,3.45,4.03);let u=new ki(n,e,{id:"wr_roxo_l",hinge:new I(6.2,.02,4.04),rot:0,w:.52,h:2.05,leftHinge:!0,interact:!1}),f=new ki(n,e,{id:"wr_roxo_r",hinge:new I(7.24,.02,4.04),rot:0,w:.52,h:2.05,leftHinge:!1,interact:!1});n.name("wr_roxo",[u,f]),n.interact(d,{id:"wardrobe_roxo",kind:"hide",extra:[u.pivot,f.pivot],prompt:()=>"Esconder-se no guarda-roupa"}),n.hide({id:"wardrobe_roxo",kind:"wardrobe",leaf:u,leaf2:f,cam:{x:6.72,y:1.3,z:3.75,yaw:Math.PI,pitch:-.05},exit:{x:6.7,z:4.6}});let g=G(e,6.72,1.12,3.8);D(g,.14,.1,.1,X("#6b2b3a"),-.2,.05,0),D(g,.14,.02,.1,X("#d8b27a"),-.2,.11,0);let _=G(g,.15,.02,0);ut(_,.03,.03,.01,X("#fff"),0,0,0,{seg:10}),ut(_,.03,.03,.01,X("#fff"),.08,0,.02,{seg:10}),g.visible=!1,n.name("wr_roxo_items",g);let p=G(e,7.05,0,4.95,-Math.PI/2);Zd(p),n.collider(6.82,7.3,4.5,5.4,{los:!1});let m=new is(.62,.62,{res:384,maxDist:5});m.geometry.dispose(),m.geometry=new aa(.31,32),m.position.set(7.228,1.35,4.95),m.rotation.y=-Math.PI/2,pe(m,"e"),e.add(m);let M=new Lt(new yi(.32,.025,8,32),F.whiteFurn);M.position.set(7.232,1.35,4.95),M.rotation.y=-Math.PI/2,e.add(M),n.name("round_mirror",m),n.interact(m,{id:"round_mirror",kind:"examine",prompt:()=>"Olhar o espelho redondo"});let A=G(e,7,.78,5.25);D(A,.05,.05,.03,X("#f2f2f2"),0,.025,0),D(A,.25,.006,.006,X("#eee"),-.12,.004,.02),n.name("charger",A),n.interact(A,{id:"charger",kind:"pickup",prompt:()=>"Pegar o carregador"});let b=G(e,6.45,0,4.95,Math.PI/2);nh(b),n.collider(6.2,6.7,4.7,5.2,{los:!1});let w=G(e,7.07,0,6.05,-Math.PI/2),S=Yd(w,1,.9,.45,4);n.collider(6.84,7.3,5.55,6.55,{los:!1});let R=[];for(let U=0;U<4;U++){let $=.82-S.rowH*(U+.5);R.push(new Fa(n,e,{id:"dresser_"+(U+1),name:"gaveta "+(U+1),pos:new I(7.07,$,6.05),ry:-Math.PI/2,dir:new I(-1,0,0),w:.92,h:S.rowH-.02,d:.4,depth:.28}))}R.forEach(U=>pe(U.group,"evc")),n.name("dresser_drawers",R);let x=G(e,0,0,0);[1,0,0,1].forEach((U,$)=>{let K=.82-S.rowH*($+.5);D(x,.02,S.rowH-.03,.9,F.whiteFurn,6.83-U*.28,K,6.05),U&&D(x,.28,.02,.86,F.oak,6.97-.14,K-S.rowH/2+.03,6.05)}),pe(x,"m"),n.name("dresser_mirror",x);let P=G(e,7.18,2.25,4.3,-Math.PI/2);sh(P);for(let U=0;U<3;U++)il(n,e,U===1?"socket_roxo":"socket_roxo_"+U,7.232,1.25,3.95+U*.18,-Math.PI/2);let N=G(e,5.55,0,5.95,.4);rh(N,"#5a3c7a"),n.interact(N,{id:"backpack",kind:"examine",prompt:()=>"Mochila"});let B=G(e,5.95,0,6.2,-.3);rh(B,"#222");let V=G(e,6.3,0,5.8,.5);Qd(V),n.interact(V,{id:"skates",kind:"examine",prompt:()=>"Patins"});let L=kn(n,e,5.75,5,{id:"roxo",room:"roxo",intensity:5,dist:6,color:16773350});n.nav("r0",5.41,6.45,"roxo"),n.nav("r1",5.8,5.6,"roxo"),n.nav("r2",5.8,4.5,"roxo"),n.link("r0","c1","porta_roxo"),n.link("r0","r1"),n.link("r1","r2"),n.end()}function __(n,t){let e=n.begin("meninos");fn(n,e,7.3,10.4,3.4,6.7,F.woodFloor,"wood","meninos"),Kt(n,e,"x",3.4,7.3,10.4,F.white,F.whiteDirty,[{a:8.1,b:9.3,bottom:.9,top:2.2}]),Kt(n,e,"z",10.4,3.4,6.7,F.whiteDirty,F.white);let i=G(e,8.7,.9,3.4);es(i,1.2,1.3);let s=G(e,8.7,0,3.52);jo(s,1.6,2.3,F.curtainBeige,.1);let a=G(e,8.7,2.35,3.55);sh(a),n.zone("meninos",7.3,10.4,3.4,6.7),new Yi(n,e,{id:"porta_meninos",name:"porta do quarto",hx:8.3,hz:6.7,rot:0,swing:1,width:.82});let r=G(e,7.66,0,4.4,Math.PI/2);ih(r,1.4,.6,F.black),n.collider(7.36,7.96,3.7,5.1,{los:!1});let o=G(e,7.7,.76,4.3,Math.PI/2),l=Jd(o);n.name("laptop",l),n.interact(o,{id:"laptop",kind:"examine",prompt:()=>"Notebook"}),D(e,.14,.02,.44,X("#111"),7.82,.77,4.95),["#1a3c7a","#b33","#eee","#dba531"].forEach((b,w)=>D(e,.22,.04,.3,X(b),7.62,.78+w*.04,3.9,{ry:w*.1}));let h=G(e,8.25,0,4.4,-Math.PI/2);nh(h),n.collider(8,8.5,4.15,4.65,{los:!1});let d=G(e,7.6,0,5.42,Math.PI/2);D(d,.42,.62,.42,X("#1d1d1d"),0,.31,0),D(d,.38,.2,.02,X("#2a2a2a"),0,.46,.215),D(d,.1,.02,.02,F.chrome,0,.5,.23,{cast:!1});let u=D(d,.06,.07,.02,X("#c9a23a",{metalness:.8,roughness:.3}),0,.4,.235);n.collider(7.36,7.82,5.2,5.64,{los:!1}),n.name("vasco_lock",u),n.interact(d,{id:"vasco_drawer",kind:"examine",prompt:()=>"Gaveta com cadeado"});let f=G(e,7.37,1.75,4.4,Math.PI/2);Ve(f,1,.66,Ot(Ad(),{roughness:.9,side:Ne}),0,0,0,{uv:!1}),n.interact(f,{id:"flag",kind:"examine",prompt:()=>"Bandeira"});let g=G(e,7.9,1.7,6.63,Math.PI);Yo(g,.9);let _=G(e,9.9,0,4.45);$o(_,.95,1.95,F.sheetPink,null),n.collider(9.4,10.4,3.45,5.45,{los:!1}),n.interact(_,{id:"bed_meninos",kind:"hide",prompt:()=>"Esconder-se embaixo da cama"}),n.hide({id:"bed_meninos",kind:"bed",cam:{x:9.9,y:.2,z:4.5,yaw:Math.PI/2,pitch:.02},exit:{x:9,z:4.6}});let p=G(e,9.9,.66,4.3);ee(p,.3,F.sheetWhite,0,0,.1,{sx:.9,sy:.5,sz:2.1}),ee(p,.11,X("#1a0f08",{roughness:1}),0,.05,-.6),n.name("pedro_sleeper",p);let m=G(e,9.85,0,6.38,Math.PI);La(m,1.05,2.1,.58,X("#5d6066",{roughness:.6})),n.collider(9.32,10.38,6.08,6.67);let M=new ki(n,e,{id:"wr_men_l",hinge:new I(10.37,.02,6.07),rot:Math.PI,w:.52,h:2.05,leftHinge:!0,interact:!1,mat:F.oakDark}),A=new ki(n,e,{id:"wr_men_r",hinge:new I(9.33,.02,6.07),rot:Math.PI,w:.52,h:2.05,leftHinge:!1,interact:!1,mat:X("#5d6066",{roughness:.6})});n.interact(m,{id:"wardrobe_meninos",kind:"hide",extra:[M.pivot,A.pivot],prompt:()=>"Esconder-se no guarda-roupa"}),n.hide({id:"wardrobe_meninos",kind:"wardrobe",leaf:M,leaf2:A,cam:{x:9.85,y:1.3,z:6.4,yaw:0,pitch:-.05},exit:{x:9.8,z:5.7}}),il(n,e,"socket_meninos",7.368,.35,5.3,Math.PI/2),kn(n,e,8.85,5,{id:"meninos",room:"meninos",intensity:5,dist:6}),n.fixture(7.9,1,4.3,{id:"laptop_glow",room:"meninos",intensity:0,dist:3,on:!1,color:10471679}),n.nav("m0",8.71,6.45,"meninos"),n.nav("m1",8.8,5.6,"meninos"),n.nav("m2",8.8,4.4,"meninos"),n.link("m0","c2","porta_meninos"),n.link("m0","m1"),n.link("m1","m2"),n.end()}function x_(n,t,e){let i=n.begin("pais"),s=e.P;fn(n,i,s,s+3.6,4.9,9.4,F.woodFloor,"wood","pais"),Kt(n,i,"z",s,4.9,9.4,F.white,F.white,[{a:6.79,b:7.61}]),Kt(n,i,"x",4.9,s,s+3.6,F.white,F.white),Kt(n,i,"x",9.4,s,s+3.6,F.white,F.white,[{a:s+1.2,b:s+2.6,bottom:.95,top:2.1}]),Kt(n,i,"z",s+3.6,4.9,9.4,F.white,F.white);let a=G(i,s+1.9,.95,9.4);es(a,1.4,1.15,{bars:!0}),n.zone("pais",s,s+3.6,4.9,9.4),new Yi(n,i,{id:"porta_pais",name:"porta do quarto dos pais",hx:s,hz:6.79,rot:-Math.PI/2,swing:1,width:.82,locked:!0,lockMsg:"Trancada por dentro."});let r=G(i,s+2.58,0,7.2,-Math.PI/2);$o(r,1.6,2,F.sheetWhite,Ot(Xi("#8a7f74",{seed:9}),{roughness:1})),n.collider(s+1.55,s+3.6,6.35,8.05,{los:!1}),n.interact(r,{id:"bed_pais",kind:"hide",prompt:()=>"Esconder-se embaixo da cama"}),n.hide({id:"bed_pais",kind:"bed",cam:{x:s+2.6,y:.2,z:7.2,yaw:Math.PI/2+.3,pitch:.02},exit:{x:s+1,z:7.2}});let o=G(i,s+2.7,.66,7.2);ee(o,.3,Ot(Xi("#8a7f74",{seed:9})),0,0,-.35,{sx:2,sy:.5,sz:.9}),ee(o,.3,Ot(Xi("#8a7f74",{seed:9})),0,0,.38,{sx:2,sy:.5,sz:.9}),n.name("parents_sleepers",o);let l=G(i,s+1.8,0,5.2);La(l,3,2.2,.6,F.rustic),n.collider(s+.3,s+3.3,4.9,5.52),D(i,1,2.12,.03,F.rustic,s+.8,1.08,5.5),D(i,1,2.12,.03,F.rustic,s+2.8,1.08,5.5),D(i,1.02,2.12,.02,F.rustic,s+1.8,1.08,5.49);let c=new is(.92,1.95,{res:512,maxDist:8});c.position.set(s+1.8,1.08,5.51),pe(c,"e"),i.add(c),n.name("wardrobe_mirror",c),n.interact(c,{id:"wardrobe_mirror",kind:"examine",prompt:()=>"Olhar o espelho"});let h=new ki(n,i,{id:"wr_pais",hinge:new I(s+3.3,.02,5.53),rot:0,w:.98,h:2.1,leftHinge:!1,interact:!1,mat:F.rustic}),d=G(i,s+2.8,1,5.55);D(d,.9,1.9,.04,new Yt({visible:!1}),0,0,0,{cast:!1}),n.interact(d,{id:"wardrobe_pais",kind:"hide",extra:[h.pivot],prompt:()=>"Esconder-se no guarda-roupa"}),n.hide({id:"wardrobe_pais",kind:"wardrobe",leaf:h,cam:{x:s+2.8,y:1.35,z:5.2,yaw:Math.PI,pitch:-.05},exit:{x:s+2.8,z:6.1}});let u=G(i,s+.3,0,8.6,Math.PI/2);ih(u,1.2,.55,F.oak),n.collider(s,s+.58,8,9.2,{los:!1});let f=G(i,s+.3,.86,8.35,Math.PI/2);Da(f,Os("ok",2,7),.16,.2);let g=G(i,s+.3,.84,8.75,Math.PI/2);Da(g,Os("ok",6,8),.2,.15),n.name("parents_photos",[f,g]),n.interact(f,{id:"desk_photos",kind:"examine",prompt:()=>"Olhar as fotos"});let _=G(i,s+.08,1.75,8.9,Math.PI/2);_.rotation.z=Math.PI/2,_.rotation.order="YZX",Ko(_),n.name("hat_wall",_),n.interact(_,{id:"hat",kind:"examine",prompt:()=>"Chap\xE9u de palha"});for(let S=0;S<10;S++)ee(i,.008,X("#aaa"),s+.04,1.62-S*.03,8.9+Math.sin(S*.6)*.03,{seg:5,seg2:4,cast:!1});let p=G(i,s+3.2,0,8.95,Math.PI);D(p,.7,.8,.45,F.oak,0,.4,0);let m=["#e8327a","#fff","#f5d10c","#3cc34a","#9b3fd1","#1ea5e0"];for(let S=0;S<8;S++)ut(p,.025,.025,.08+S%3*.05,X(m[S%6]),-.28+S*.08,.84+S%3*.025,S%2*.1,{seg:8});n.collider(s+2.85,s+3.55,8.72,9.4,{los:!1});let M=G(i,s+.04,1.6,5.95,Math.PI/2);Yo(M,1),il(n,i,"socket_pais",s+.07,.35,8,Math.PI/2);let A=G(i,s+1.8,vi,7.2),b=eh(A),w=uh();b.bulb.material=w,n.name("fan_pais",b),n.fixture(s+1.8,vi-.45,7.2,{id:"pais",room:"pais",intensity:6,dist:7,bulb:w}),n.nav("pp0",s+.4,7.2,"pais"),n.nav("pp1",s+1.1,7.2,"pais"),n.nav("pp2",s+1.2,6,"pais"),n.nav("pp3",s+1.2,8.7,"pais"),n.link("pp0","c3","porta_pais"),n.link("pp0","pp1"),n.link("pp1","pp2"),n.link("pp1","pp3"),n.end()}var wi={x0:11.3,x1:13.3,z0:8.4,z1:10.3,drop:1.45};function y_(n,t){let e=Math.max(0,Math.min(1,(t-wi.z0)/(wi.z1-wi.z0)));return-Math.floor(e*8)/8*wi.drop}function b_(n,t,e,i=8){let s=(wi.z1-wi.z0)/i,a=wi.drop/i;for(let r=0;r<i;r++)D(n,wi.x1-wi.x0,.2,s,e,t+(wi.x0+wi.x1)/2,-a*r-.1,wi.z0+s*(r+.5))}function M_(n,t,e){let i=n.begin("extra"),s=Ot(qi("#6b5a44",{seed:31,stains:.35,mottled:.2}),{roughness:1}),a=Ot(Us({seed:21,tones:["#3a2618","#2e1d12","#452c1b"]}),{roughness:.9});el(i,11.1,13.3,7.7,8.4,a,0),el(i,11.1,13.3,7.7,10.4,s,vi,!0),n.floor(11.1,13.3,7.7,8.4,"wood",null,"extra"),n.floor(wi.x0,wi.x1,8.4,10.6,"stairs",y_,"extra"),b_(i,0,a),Kt(n,i,"z",11.1,7.7,10.6,F.white,s,[],{y0:-3}),Kt(n,i,"z",13.3,7.7,10.6,s,F.white,[],{y0:-3}),Kt(n,i,"x",10.6,11.1,13.3,s,F.white,[],{y0:-3}),n.collider(11.1,11.3,8.4,10.6),n.zone("extra",11.1,13.3,7.7,10.6),n.zone("stairs_bottom",11.1,13.3,9.75,10.6);let r=new Yi(n,i,{id:"porta_extra",name:"porta que n\xE3o existe",hx:11.8,hz:7.7,rot:0,swing:-1,width:.82,mat:F.doorOld,houseDoor:!0,locked:!0,lockMsg:"A ma\xE7aneta n\xE3o gira."}),o=G(i,12.3,-1.2,10.2);D(o,2.2,2.6,.1,new Yt({color:0}),0,0,0,{cast:!1}),n.name("stairs_dark",o),D(i,2.2,3.2,.05,new Yt({color:0}),12.2,-1.3,10.5,{cast:!1}),n.name("stairs_dark_col",n.collider(11.1,13.3,9.6,9.8,{los:!1})),n.fixture(12.2,2.2,8,{id:"extra",room:"extra",intensity:.8,dist:4,color:16756848}),n.nav("x0",12.21,7.95,"extra"),n.link("x0","c4","porta_extra"),n.end()}function S_(n,t){let e=n.begin("outside"),i=new Yt({map:Rd(),side:oi,fog:!1}),s=new Lt(new gi(70,70,60,48,1,!0),i);s.position.set(4,-8,4),e.add(s);let a=new Lt(new Me(200,200),new Yt({color:329221,fog:!1}));a.rotation.x=-Math.PI/2,a.position.set(4,-22,4),e.add(a);let r=G(e,18,-21.8,-38),o=new Lt(new Me(26,16),new Yt({color:3107628,fog:!1}));o.rotation.x=-Math.PI/2,r.add(o);let l=new Lt(new ra(2.4,2.6,32),new Yt({color:14674136,fog:!1}));l.rotation.x=-Math.PI/2,l.position.y=.02,r.add(l);let c=new Lt(new Me(.2,16),new Yt({color:14674136,fog:!1}));c.rotation.x=-Math.PI/2,c.position.y=.02,r.add(c);for(let[m,M]of[[-14,-9],[14,-9],[-14,9],[14,9]]){let A=new Lt(new gi(.15,.2,14,6),new Yt({color:2236962,fog:!1}));A.position.set(m,7,M),r.add(A);let b=new Lt(new Me(2.4,1.2),new Yt({color:16774872,fog:!1,side:Ne}));b.position.set(m,14,M),b.lookAt(0,0,0),r.add(b)}let h=new Lt(new Me(8,2),new Yt({map:Cd(),fog:!1}));h.position.set(0,5,-9.5),r.add(h),n.name("field",r);let d=G(r,0,0,0),u=new Yt({color:0,fog:!1}),f=new Lt(new gi(.25,.3,1.8,6),u);f.position.y=.9,d.add(f);let g=new Lt(new dn(.22,8,6),u);g.position.y=2,d.add(g),d.visible=!1,n.name("field_figure",d);let _=new Yt({map:Jc(!1),transparent:!0,fog:!1,depthWrite:!1}),p=new Lt(new Me(9,9),_);p.position.set(-10,22,-60),p.lookAt(2,1.5,0),e.add(p),n.name("moon",p),e.traverse(m=>{m.castShadow=!1,m.receiveShadow=!1}),n.end()}function dh(n,t){let e=zt=>n.get(zt),i=t.act||1,s=e("painting");if(s){let zt=t.paintingMode||"wall",Vt=Go(zt==="upside");s.traverse(qt=>{qt.isMesh&&qt.material.map&&qt.material.map.image&&qt.material.map.image.width===512&&(qt.material=Ot(Vt,{roughness:.5}))}),zt==="floor"?(s.position.set(3.2,.39,7.86),s.rotation.set(-.12,Math.PI,0)):(s.position.set(3.2,1.55,7.93),s.rotation.set(0,Math.PI,0))}let a=t.d_bike!==!1&&i<3?!!t.d_bike:!0,r=e("bike");r&&(r.visible=t.d_bike===!0||i>=2);let o=e("bike_col");o&&(o.enabled=!!(r&&r.visible));let l=e("bike_bath");l&&(l.visible=!(t.d_bike===!0||i>=2));let c=e("rack_photo_list");c&&c.photos.forEach(({f:zt,pic:Vt},qt)=>{zt.rotation.x=t.d_fotos||i>=2?0:Math.PI/2-.05,zt.position.y=t.d_fotos||i>=2?.09:.012;let Q=i>=2?i>=3?"scratched":"blank":"ok";Vt.material=Ot(Os(Q,4+qt%2,qt+1),{roughness:.6})});let h=e("parents_photos");h&&h.forEach((zt,Vt)=>{zt.children.filter(qt=>qt.isMesh&&qt.geometry.type==="PlaneGeometry").forEach(qt=>{qt.material=Ot(Os(i>=2?"blank":"ok",Vt?6:2,7+Vt),{roughness:.6})})});let d=e("bday_photo");d&&(d.material=Ot(Zc(t.clownLooked?1:0),{roughness:.6}));let u=e("sheet_figure");u&&(u.visible=!t.d_lencol&&i===1);let f=e("chair_open");f&&(f.visible=i===2&&!t.d_cadeira);let g=e("folding_chair");g&&(g.visible=!(i===2&&!t.d_cadeira));let _=e("towel_mirror");_&&(_.visible=i===2&&!t.d_toalha);let p=e("keyholder");if(p){for(;p.children.length>1;)p.remove(p.children[1]);let zt=5,Vt=!1;t.oldKeyShown&&!t.hasOldKey&&(Vt=!0),i>=2&&(zt=0),t.keysHung&&(zt=5);let qt=Jo(p,Vt?6:zt,Vt);if(Vt&&i>=2&&qt.slice(0,-1).forEach(Q=>Q.visible=!1),t.keysHung&&t.oldKeyHung){let Q=G(p,.15,-.06,.03);D(Q,.012,.06,.003,X("#7a5a2a",{metalness:.5}),0,-.02,0,{cast:!1})}}let m=e("julia_sleeper");m&&(m.g.visible=i===1);let M=e("clothes_pile");M&&(M.visible=i>=2);let A=e("pedro_sleeper");A&&(A.visible=i===1);let b=e("parents_sleepers");b&&(b.visible=i===1);let w=t.stoolAt||"sala",S=e("stool");S&&(S.visible=w==="sala");let R=e("stool_shelf");R&&(R.visible=w==="shelf");let x=e("stool_fridge");x&&(x.visible=w==="fridge");let E=e("racao");E&&(E.visible=!t.hasRacao&&!t.fedCats);let P=e("food_bento");P&&(P.visible=!!t.fedCats);let N=e("food_lili");N&&(N.visible=!!t.fedCats);let B=e("charger");B&&(B.visible=!t.hasCharger);let V=e("wr_roxo_items");V&&(V.visible=!!t.wardrobeRoxoOpen&&!t.gotJuliaItems);let L=e("ice_block");L&&(L.visible=!!t.iceVisible&&!t.hasIce&&!t.hasMomKeys);let U=e("registro");U&&(U.visible=i>=3&&!t.hasRegistro&&!t.valveFixed);let $=e("shower_valve");if($){let zt=i<3||t.valveFixed;$.regHandle.visible=zt}let K=e("hat_wall");K&&(K.visible=i===1||t.dadFound);let ot=e("stairs_dark");ot&&(ot.visible=!t.stairsOpen);let j=e("stairs_dark_col");j&&(j.enabled=!t.stairsOpen);let it=e("moon");it&&(it.material.map=Jc(i>=3));let Z=e("field_figure");Z&&(Z.visible=!!t.fieldFigure);let ct=n.doors;if(ct.get("porta_pais")&&(ct.get("porta_pais").locked=i===1),ct.get("porta_meninos")&&(ct.get("porta_meninos").locked=i===2&&!t.hasMomKeys),ct.get("porta_meninos")&&(ct.get("porta_meninos").lockMsg="Trancada. Algu\xE9m tem a chave reserva..."),ct.get("porta_extra")){let zt=ct.get("porta_extra");zt.locked=!t.extraUnlocked,zt.lockMsg=t.hasOldKey&&!t.extraUnlocked?"A chave velha gira... mas algo do outro lado segura a ma\xE7aneta.":"A ma\xE7aneta n\xE3o gira."}ct.get("rack_drawer")&&ct.get("rack_drawer");let At=n.interactables.find(zt=>zt.id==="rack_drawer")}var Wt=100,Zt=-2.9;function w_(n,t){return t<8.4?0:t<10.3?-Math.floor((t-8.4)/1.9*8)/8*1.45:t<12.2?-1.45-Math.floor((t-10.3)/1.9*8)/8*1.45:Zt}function E_(n){let t=document.createElement("canvas");t.width=1024,t.height=160;let e=t.getContext("2d"),i=["#e33","#fc3","#36c","#3a3","#e8327a","#f80"],s=n.split(""),a=1024/s.length;s.forEach((o,l)=>{e.fillStyle=i[l%i.length],e.beginPath(),e.moveTo(l*a+4,10),e.lineTo(l*a+a-4,10),e.lineTo(l*a+a/2,150),e.closePath(),e.fill(),e.fillStyle="#fff",e.font="bold 64px Georgia",e.textAlign="center",e.fillText(o,l*a+a/2,80)});let r=new Je(t);return r.colorSpace=xe,r}function nl(n,t){let e=n.begin("porao"),i=Ot(Us({seed:21,tones:["#3a2618","#2e1d12","#452c1b"]}),{roughness:.9}),s=Ot(qi("#c9b27a",{seed:41,mottled:.12}),{roughness:.95}),a=Ot(qi("#6b5a44",{seed:31,stains:.35,mottled:.2}),{roughness:1}),r=new Yt({color:0}),o=1.9/8,l=1.45/8;for(let Z=0;Z<16;Z++)D(e,2,.2,o,i,Wt+12.3,-l*Z-.1,8.4+o*(Z+.5));Kt(n,e,"z",Wt+11.1,7.7,12.2,F.white,a,[],{y0:-3.5,h:2.6}),Kt(n,e,"z",Wt+13.3,7.7,12.2,a,F.white,[],{y0:-3.5,h:2.6}),n.collider(Wt+11.1,Wt+13.3,7.6,8.35,{los:!0}),D(e,2.3,3.2,.1,r,Wt+12.2,.6,8.3,{cast:!1}),fh(e,Wt+11.1,Wt+13.3,7.7,12.2,a,1.3),n.floor(Wt+11.1,Wt+13.3,8.3,12.25,"stairs",w_,"porao_escada"),n.zone("porao_escada",Wt+11.1,Wt+13.3,7.7,12.2),n.zone("porao_topo",Wt+11.1,Wt+13.3,7.7,9.35);let c=Wt+10.2,h=Wt+14.4,d=12.2,u=20.2;fh(e,c,h,d,u,i,Zt),fh(e,c,h,d,u,F.ceiling,Zt+vi,!0),n.floor(c,h,d,u,"wood",()=>Zt,"porao"),Kt(n,e,"x",d,c,h,s,s,[{a:Wt+11.1,b:Wt+13.3,top:Zt+2.4}],{y0:Zt,h:Zt+vi}),Kt(n,e,"x",u,c,h,s,s,[],{y0:Zt,h:Zt+vi}),Kt(n,e,"z",c,d,u,a,s,[{a:15.8,b:16.62,top:Zt+2.1}],{y0:Zt,h:Zt+vi}),Kt(n,e,"z",h,d,u,s,a,[],{y0:Zt,h:Zt+vi}),n.zone("porao",c,h,d,u);let f=G(e,Wt+12.3,Zt,16.2);D(f,1.6,.04,.9,X("#f4f1ea"),0,.74,0),D(f,1.62,.3,.92,X("#f4f1ea",{roughness:1}),0,.6,0);for(let[Z,ct]of[[-1,-1],[1,-1],[-1,1],[1,1]])D(f,.05,.72,.05,F.oakDark,Z*.72,.36,ct*.38);let g=G(f,0,.76,0);ut(g,.22,.22,.2,X("#f4c3d6"),0,.1,0,{seg:24}),ut(g,.16,.16,.12,X("#fbe2ea"),0,.26,0,{seg:24});for(let Z=0;Z<5;Z++){let ct=Z/5*Math.PI*2;ut(g,.01,.01,.1,X("#fff"),Math.cos(ct)*.1,.37,Math.sin(ct)*.1,{seg:6}),ee(g,.018,Si("#ffcc55"),Math.cos(ct)*.1,.44,Math.sin(ct)*.1,{sy:1.8,seg:8,seg2:6,cast:!1})}n.collider(Wt+11.5,Wt+13.1,15.75,16.65,{los:!1}),n.interact(g,{id:"cake",kind:"examine",prompt:()=>"Olhar o bolo"});let _=["#e33","#36c","#fc3","#3a3"];for(let Z=0;Z<6;Z++){let ct=new Lt(new Wn(.06,.16,10),X(_[Z%4]));ct.position.set(Wt+11.7+Z%3*.5,Zt+.84,15.9+Math.floor(Z/3)*.6),e.add(ct)}let p=Ie(55);for(let Z=0;Z<18;Z++){let ct=["#e33","#36c","#fc3","#3a3","#e8327a","#fff"][Z%6],At=c+.4+p()*3.4,zt=d+.6+p()*7.2,Vt=Zt+1.7+p()*.7;ee(e,.15,X(ct,{roughness:.3}),At,Vt,zt,{sy:1.2}),D(e,.003,.8,.003,X("#ddd"),At,Vt-.55,zt,{cast:!1})}let m=Ve(e,3.6,.55,new Yt({map:E_(Ft("PARAB\xC9NS {RAFA}")),transparent:!0,side:Ne}),Wt+12.3,Zt+2.2,19.9,{uv:!1,ry:Math.PI});for(let Z=0;Z<5;Z++){let ct=D(e,4,.02,.02,X(["#e33","#fc3","#36c","#3a3","#e8327a"][Z]),Wt+12.3,Zt+2.4-Z%2*.1,13+Z*1.5,{cast:!1});ct.rotation.z=Z%2?.05:-.05}let M=G(e,c+.3,Zt,15,Math.PI/2);Xo(M,1.8),n.collider(c,c+.52,14.1,15.9,{los:!1});let A=G(e,c+.35,Zt+.55,15,Math.PI/2);D(A,.7,.55,.55,X("#2a2825",{roughness:.6}),0,.28,-.1);let b=Ve(A,.5,.38,Si("#1a2a22"),0,.3,.181,{uv:!1});n.name("crt_screen",b),n.interact(A,{id:"crt",kind:"examine",prompt:()=>"TV antiga"});let w=G(e,h-.5,Zt,15.6,-Math.PI/2),S=Ot(Xi("#6a4a32"),{roughness:1});D(w,2.2,.42,.9,S,0,.21,0),D(w,2.2,.55,.2,S,0,.62,-.35),n.collider(h-.95,h,14.5,16.7,{los:!1});let R=G(e,Wt+12.3,Zt+1.55,u-.07,Math.PI);Bs(R,!1);let x=G(e,Wt+11,Zt+1.5,u-.07,Math.PI);Jo(x,5,!1);let E=(()=>{let Z=document.createElement("canvas");Z.width=256,Z.height=512;let ct=Z.getContext("2d");ct.fillStyle="#2a1a10",ct.fillRect(0,0,256,512),ct.strokeStyle="#d8c89a",ct.lineWidth=6,ct.beginPath(),ct.arc(128,200,60,0,Math.PI*2),ct.stroke(),ct.beginPath(),ct.moveTo(128,200),ct.lineTo(128,160),ct.moveTo(128,200),ct.lineTo(160,210),ct.stroke(),ct.fillStyle="#d8c89a",ct.font="italic 26px Georgia",ct.textAlign="center",ct.fillText("?",128,320);let At=new Je(Z);return At.colorSpace=xe,new bi({map:At,roughness:.7})})();new Yi(n,e,{id:"porta_relogio",name:"porta do rel\xF3gio",hx:c,hz:15.8,y:Zt,rot:-Math.PI/2,swing:-1,width:.82,mat:E,houseDoor:!0}),n.fixture(Wt+12.3,Zt+2.3,14.5,{id:"porao1",room:"porao",intensity:5,dist:7,color:16761466}),n.fixture(Wt+12.3,Zt+2.3,18.3,{id:"porao2",room:"porao",intensity:4,dist:6,color:16757866}),n.fixture(Wt+12.2,Zt+1.8,11.5,{id:"porao_escada",room:"porao_escada",intensity:1.2,dist:4,color:16752720});let P=Wt-2,N=c,B=9,V=24,L=new Lt(new Me(N-P,V-B),X("#0b0a0f",{roughness:1}));L.rotation.x=-Math.PI/2,L.position.set((P+N)/2,Zt,(B+V)/2),L.receiveShadow=!0,e.add(L),n.floor(P,N-.07,B,V,"stairs",()=>Zt,"horanenhuma"),n.collider(P-.2,P,B,V),n.collider(P,N,B-.2,B),n.collider(P,N,V,V+.2),n.zone("horanenhuma",P,N-.1,B,V),n.collider(N-.1,N,B,d),n.collider(N-.1,N,u,V);for(let Z=0;Z<160;Z++)ee(e,.01+p()*.02,Si("#8a8aa8"),P+p()*(N-P),Zt+.005,B+p()*(V-B),{seg:4,seg2:3,cast:!1});let U=G(e,Wt+3.5,Zt,16.5);ut(U,.06,.09,3.2,X("#1c1c20",{metalness:.6}),0,1.6,0,{seg:10}),D(U,.5,.06,.06,X("#1c1c20"),.2,3.1,0),ee(U,.14,Si("#ffe2a8"),.42,2.95,0,{cast:!1}),n.collider(Wt+3.4,Wt+3.6,16.4,16.6,{los:!1}),n.interact(U,{id:"lamppost",kind:"examine",prompt:()=>"Poste de luz"}),n.fixture(Wt+3.9,Zt+2.9,16.5,{id:"lamppost",room:"horanenhuma",intensity:9,dist:9,color:16766874});let $=G(e,Wt+5,Zt,17.4),K=new Lt(new gi(.2,.16,.34,16,1,!0),X("#6a6a70",{metalness:.6,roughness:.5,side:Ne}));K.position.y=.17,$.add(K),ut($,.16,.16,.01,Si("#000000"),0,.02,0,{seg:16});let ot=new Lt(new yi(.2,.008,4,16,Math.PI),X("#555"));ot.position.y=.34,$.add(ot),n.interact($,{id:"bucket",kind:"examine",prompt:()=>"Balde"});let j=G(e,Wt+2.4,Zt,17.2);ts(j,.5);let it=G(e,Wt+2.4,Zt+.56,17.2);ee(it,.06,X("#e9dcc0",{roughness:.4,metalness:.2}),0,.06,0,{sy:1.3}),ut(it,.012,.012,.02,X("#c9a23a",{metalness:.8}),0,.15,0,{seg:8}),n.name("egg_watch",it),n.interact(it,{id:"egg_watch",kind:"pickup",prompt:()=>"Pegar o rel\xF3gio"}),n.nav("pb0",Wt+12.2,12.8,"porao"),n.nav("pb1",Wt+12.3,14.5,"porao"),n.nav("pb2",Wt+12.3,18.2,"porao"),n.link("pb0","pb1"),n.link("pb1","pb2"),e.traverse(Z=>{Z.isMesh&&Z.material&&Z.material.isMeshBasicMaterial&&(Z.castShadow=!1)}),n.end()}function fh(n,t,e,i,s,a,r,o=!1){let l=new Lt(new Me(e-t,s-i),a);return l.rotation.x=o?Math.PI/2:-Math.PI/2,l.position.set((t+e)/2,r,(i+s)/2),l.receiveShadow=!0,n.add(l),l}var pn=1.42,T_=.86,sf=.22,sl=class{constructor(t,e){this.game=t,this.cam=e,this.pos=new I(3.6,0,2.6),this.vel=new jt,this.yaw=Math.PI/2,this.pitch=0,this.eyeH=pn,this.crouch=!1,this.stamina=1,this.running=!1,this.moveLock=!1,this.lookLock=!1,this.hidden=null,this.bob=0,this.stepDist=0,this.trauma=0,this.shakeT=0,this.breath=1,this.holdingBreath=!1,this.lastNoise=0,this.tween=null,this.speedMul=1,this.seated=!1}get eye(){return new I(this.pos.x,this.pos.y+this.eyeH,this.pos.z)}get forward(){return new I(-Math.sin(this.yaw),0,-Math.cos(this.yaw))}teleport(t,e,i,s=0){this.pos.set(t,this.game.world.heightAt(t,e),e),i!==void 0&&(this.yaw=i),this.pitch=s,this.vel.set(0,0),this.apply()}lookAt(t,e=1){let i=this.eye,s=t.x-i.x,a=t.y-i.y,r=t.z-i.z,o=Math.atan2(-s,-r),l=Math.atan2(a,Math.hypot(s,r));return this.turnTo(o,l,e)}turnTo(t,e,i=1){return new Promise(s=>{this.tween={y0:this.yaw,y1:this.yaw+si(this.yaw,t),p0:this.pitch,p1:e,t:0,dur:Math.max(.01,i),res:s}})}shake(t){this.trauma=Math.min(1.2,this.trauma+t*te.shake)}hideIn(t){this.hidden||(this.hidden=t,this.preHide={x:this.pos.x,z:this.pos.z,yaw:this.yaw},t.leaf&&t.leaf.set(.7),t.leaf2&&t.leaf2.set(.7),C.play(t.kind==="bed"?"drawer":"door_open",{pos:[t.cam.x,1,t.cam.z],creakChance:.3,vol:.5}),this.game.ui.hideOverlay(t.kind),setTimeout(()=>{t.leaf&&t.leaf.set(0),t.leaf2&&t.leaf2.set(0)},350),this.pos.set(t.cam.x,0,t.cam.z),this.eyeH=t.cam.y,this.yaw=t.cam.yaw,this.pitch=t.cam.pitch||0,this.game.noise(t.cam.x,t.cam.z,2.5))}exitHide(){let t=this.hidden;t&&(this.hidden=null,this.holdingBreath=!1,t.leaf&&(t.leaf.set(.8),setTimeout(()=>t.leaf.set(0),500)),t.leaf2&&(t.leaf2.set(.8),setTimeout(()=>t.leaf2.set(0),500)),C.play("door_open",{pos:[t.cam.x,1,t.cam.z],creakChance:.5,vol:.5}),this.game.ui.hideOverlay(null),this.pos.set(t.exit.x,0,t.exit.z),this.eyeH=pn,this.crouch=!1,this.game.world.resolve(this.pos,sf))}update(t){let e=this.game,i=e.input,s=e.world;if(this.tween){let o=this.tween;o.t+=t;let l=vd(Pe(o.t/o.dur,0,1));this.yaw=jn(o.y0,o.y1,l),this.pitch=jn(o.p0,o.p1,l),o.t>=o.dur&&(this.tween=null,o.res())}else if(!this.lookLock&&i.locked){let o=.0022*te.sensitivity*(e.phone.raised?.7:1);this.yaw-=i.mdx*o,this.pitch-=i.mdy*o*(te.invertY?-1:1);let l=this.hidden?this.hidden.kind==="bed"?.35:.5:1.45;if(this.pitch=Pe(this.pitch,-l,l),this.hidden){let c=si(this.hidden.cam.yaw,this.yaw),h=this.hidden.kind==="bed"?.9:.7;Math.abs(c)>h&&(this.yaw=this.hidden.cam.yaw+Math.sign(c)*h)}}this.hidden?i.key("Space")&&this.breath>0?(this.holdingBreath=!0,this.breath=Math.max(0,this.breath-t/7)):(this.holdingBreath&&this.breath<=0&&(C.play("gasp",{vol:.9}),e.noise(this.pos.x,this.pos.z,3.5)),this.holdingBreath=!1,this.breath=Math.min(1,this.breath+t/4)):(this.breath=Math.min(1,this.breath+t/3),this.holdingBreath=!1);let a=!1;if(!this.hidden&&!this.moveLock&&!this.tween){let o=0,l=0;(i.key("KeyW")||i.key("ArrowUp"))&&(l-=1),(i.key("KeyS")||i.key("ArrowDown"))&&(l+=1),(i.key("KeyA")||i.key("ArrowLeft"))&&(o-=1),(i.key("KeyD")||i.key("ArrowRight"))&&(o+=1),i.hit("KeyC")&&(this.crouch=!this.crouch);let c=this.crouch||i.key("ControlLeft")||i.key("ControlRight");(i.key("ShiftLeft")||i.key("ShiftRight"))&&!c&&!e.phone.raised&&(o||l)&&this.stamina>.02?(this.running=!0,this.stamina=Math.max(0,this.stamina-t/5.5)):(this.running=!1,this.stamina=Math.min(1,this.stamina+t/(o||l?7:4)));let d=(this.running?3.5:c?.95:e.phone.raised?1.25:1.9)*this.speedMul,u=Math.hypot(o,l)||1,f=Math.sin(this.yaw),g=Math.cos(this.yaw),_=(o*g+l*f)/u,p=(-o*f+l*g)/u,m=_*d,M=p*d,A=1-Math.exp(-t*12);this.vel.x=jn(this.vel.x,m,A),this.vel.y=jn(this.vel.y,M,A);let b=this.pos.x,w=this.pos.z;this.pos.x+=this.vel.x*t,this.pos.z+=this.vel.y*t,s.resolve(this.pos,sf);let S=Math.hypot(this.pos.x-b,this.pos.z-w);if(a=S>.002,this.eyeH=jn(this.eyeH,c?T_:pn,1-Math.exp(-t*10)),this.crouching=c,a){this.stepDist+=S;let R=this.running?.85:c?.55:.62;if(this.stepDist>R){this.stepDist=0;let x=s.floorAt(this.pos.x,this.pos.z);C.play("step",{surface:x?x.surface:"wood",soft:c,vol:this.running?1:c?.4:.7}),e.noise(this.pos.x,this.pos.z,this.running?9:c?.8:3)}}this.bob+=S*(this.running?2.3:2.9)}else this.vel.set(0,0);let r=s.heightAt(this.pos.x,this.pos.z);this.pos.y=this.hidden?0:jn(this.pos.y,r,1-Math.exp(-t*14)),this.moving=a,this.trauma=Math.max(0,this.trauma-t*.9),this.shakeT+=t,this.apply()}apply(){let t=this.cam,e=te.shake*(this.running?.045:.022),i=this.moving?Math.sin(this.bob*2)*e:0,s=this.moving?Math.cos(this.bob)*e*.6:0,a=this.trauma*this.trauma,r=a*.05*Math.sin(this.shakeT*37.1),o=a*.05*Math.sin(this.shakeT*41.7+1),l=a*.04*Math.sin(this.shakeT*29.3+2);t.position.set(this.pos.x+s*Math.cos(this.yaw),this.pos.y+this.eyeH+i+o,this.pos.z-s*Math.sin(this.yaw)),t.rotation.order="YXZ",t.rotation.set(this.pitch+o*.5,this.yaw+r,l),t.updateMatrixWorld()}};var al=class{constructor(t){this.game=t,this.battery=12,this.flashlight=!1,this.raised=!1,this.mode="camera",this.apps={video:!1,radio:!1},this.radioOn=!1,this.threads=[],this.gallery=[],this.pendingPhoto=null,this.charging=!1,this.photoCooldown=0,this.dead=!1,this.radioLoop=null;let e=new ua(16773856,0,14,.52,.55,1.6);e.castShadow=!0,e.shadow.mapSize.set(1024,1024),e.shadow.camera.near=.1,e.shadow.camera.far=14,e.shadow.bias=-8e-4,e.shadow.normalBias=.02,e.layers.enableAll(),this.spot=e,this.spotTarget=new ii,e.target=this.spotTarget,this.glow=new Pn(11193599,0,2.5,2),this.glow.layers.enableAll(),this.flicker=0}attach(t){t.add(this.spot),t.add(this.spotTarget),t.add(this.glow)}thread(t){return this.threads.find(e=>e.id===t)}ensureThread(t,e){let i=this.thread(t);return i||(i={id:t,name:e,msgs:[],unread:0},this.threads.unshift(i)),i}unread(){return this.threads.reduce((t,e)=>t+(e.unread||0),0)}receive(t,e,i,s={}){let a=this.ensureThread(t,e);a.msgs.push({text:i,time:s.time||this.game.clockText(),day:s.day||"hoje",glitch:s.glitch,out:s.out}),s.out||(a.unread=(a.unread||0)+1),this.threads=[a,...this.threads.filter(r=>r!==a)],!s.silent&&(C.play("phone_vibrate",{n:2}),C.play("phone_notify",{delay:.1,vol:.6}),this.game.ui.notify(e,(s.glitch,i),{glitch:s.glitch}),this.game.ui.overlay==="phone"&&this.game.ui.renderPhone(this.game.ui.phoneView==="chat"?"msgs":this.game.ui.phoneView))}toggleFlashlight(t){let e=t===void 0?!this.flashlight:t;if(e&&this.battery<=0){this.game.ui.toast("Bateria descarregada.");return}this.flashlight=e,C.play("switch",{vol:.5})}toggleRadio(t){if(!this.apps.radio){this.game.ui.toast("Sem fone de ouvido, o r\xE1dio n\xE3o sintoniza.");return}this.radioOn=t===void 0?!this.radioOn:t,C.play("switch",{vol:.5}),this.radioOn&&!this.radioLoop&&(this.radioLoop=C.loop("radio",{vol:.8})),!this.radioOn&&this.radioLoop&&(this.radioLoop.stop(.3),this.radioLoop=null),this.game.ui.radio(this.radioOn?0:null)}charge(t){this.battery=Pe(this.battery+t*7,0,100),this.dead=!1}update(t){let e=this.game,i=e.input,s=!e.cutscene||e.allowPhoneInCutscene,a=i.rmb&&i.locked&&s&&!e.ui.overlay;a&&this.battery<=0?this._deadMsg||(e.ui.toast("Bateria descarregada. Procure uma tomada (com o carregador)."),this._deadMsg=!0):this._deadMsg=!1;let r=this.raised;this.raised=a&&this.battery>0,this.raised!==r&&(C.play(this.raised?"record_beep":"switch",{vol:.35}),this.raised&&e.story.onPhoneRaised&&e.story.onPhoneRaised()),this.raised&&(i.hit("KeyQ")||i.wheel!==0)&&(this.apps.video?(this.mode=this.mode==="camera"?"video":"camera",C.play("phone_glitch",{vol:.3}),e.story.onModeChange&&e.story.onModeChange(this.mode)):e.ui.toast("O v\xEDdeo ainda n\xE3o carregou (bateria fraca?).")),this.raised&&i.lclick&&this.photoCooldown<=0&&this.takePhoto(),this.photoCooldown-=t;let o=0;this.flashlight&&(o+=.07),this.raised&&(o+=.12),this.radioOn&&(o+=.02),e.flags.noDrain||(this.battery=Math.max(0,this.battery-o*t)),this.battery<=0&&!this.dead&&(this.dead=!0,this.flashlight&&(this.flashlight=!1,C.play("switch")),e.ui.toast("O celular descarregou.")),e.ui.battery(this.battery);let l=e.camera,c=this.flashlight&&this.battery>0;this.flicker=Math.max(0,this.flicker-t);let h=this.flicker>0&&Math.random()<.5?.1:1,d=this.battery<8?.55+.45*Math.abs(Math.sin(performance.now()*.013)):1;this.spot.intensity=c?22*h*d:0,this.spot.castShadow=c;let u=l.matrixWorld.elements;this.spot.position.set(u[12]+u[0]*.14-u[4]*.12,u[13]+u[1]*.14-u[5]*.12,u[14]+u[2]*.14-u[6]*.12),this.spotTarget.position.set(u[12]-u[8]*5,u[13]-u[9]*5,u[14]-u[10]*5),this.spotTarget.updateMatrixWorld(),this.glow.position.set(u[12]-u[8]*.3,u[13]-u[9]*.3-.1,u[14]-u[10]*.3),this.glow.intensity=this.raised?.35:.04}takePhoto(){let t=this.game;this.photoCooldown=.7,C.play("shutter"),t.ui.flash(.55,.35),t.flashLight(.12);let e=t.story.photoTargetsInView(),i=e.length?e[0].caption:this.mode==="video"?"Quadro do v\xEDdeo casa.mp4":"Foto: "+(t.world.roomAt(t.player.pos.x,t.player.pos.z)||"casa"),s=e.length?e[0].detail:null;this.pendingPhoto={caption:Ft(i),detail:s?Ft(s):null,time:t.clockText()};for(let a of e)a.onPhoto&&a.onPhoto();t.noise(t.player.pos.x,t.player.pos.z,2)}capture(t){if(!this.pendingPhoto)return;let e=this.pendingPhoto;this.pendingPhoto=null;try{let i=document.createElement("canvas");i.width=320,i.height=180;let s=i.getContext("2d"),a=t.width,r=t.height,o=16/9,l=a,c=a/o;c>r&&(c=r,l=r*o),s.drawImage(t,(a-l)/2,(r-c)/2,l,c,0,0,320,180),s.fillStyle="rgba(255,255,255,0.8)",s.font="12px monospace",s.fillText(e.time,8,172),e.img=i.toDataURL("image/jpeg",.72)}catch{e.img=null}this.gallery.unshift(e),this.gallery.length>40&&this.gallery.pop(),this.game.ui.toast("Foto salva na galeria.",1.4)}},zs=class{constructor(){this.items=[]}add(t){this.items.includes(t)||this.items.push(t)}remove(t){this.items=this.items.filter(e=>e!==t)}has(t){return this.items.includes(t)}list(){return[...this.items]}};var Ua={banquinho:{name:"Banquinho de madeira",desc:"O banquinho que fica perto da bicicleta. D\xE1 pra subir nele e alcan\xE7ar lugares altos."},racao:{name:"Pacote de ra\xE7\xE3o",desc:"Ra\xE7\xE3o dos gatos. O {bento} come qualquer coisa. A {lili} \xE9 mais desconfiada."},carregador:{name:"Carregador do {wendel}",desc:`O carregador que o {wendel} esqueceu no quarto.
Encoste numa tomada e segure E para carregar o celular.`},chave_velha:{name:"Chave velha",desc:`Pesada, enferrujada, com um dente torto. Nenhuma porta desta casa usa uma chave assim.
Ela apareceu no porta-chaves depois do interfone tocar.`},fone:{name:"Fone de ouvido da {julia}",desc:`Com o fone plugado, o r\xE1dio FM do celular funciona.
Aperte R para ligar ou desligar o r\xE1dio.
O chiado aumenta quando ELE est\xE1 perto.`},caixinha:{name:"Caixinha de m\xFAsica",desc:`Vinho, com manivela dourada. Tem um bilhete dobrado preso na tampa:
"Quando o seu pai esquecer da gente, toca isso pra ele. \xC9 a m\xFAsica que faz ele lembrar." \u2014 M\xE3e`},gelo:{name:"Bloco de gelo",desc:"Tem um molho de chaves congelado l\xE1 dentro. Um chaveiro de cora\xE7\xE3o."},chaves_mae:{name:"Chaveiro da m\xE3e",desc:"O chaveiro de cora\xE7\xE3o da {mae}. Chaves reserva de todos os quartos, e uma pequenininha que parece de gaveta."},foto_festa:{name:"Foto: festa de 5 anos",desc:`Voc\xEA, pequena, de cabelo cacheado, e o palha\xE7o contratado pra festa. Atr\xE1s, a letra da m\xE3e:
"Tique-Taque, o palha\xE7o que para o tempo. A {rafa} n\xE3o largou dele a festa inteira."`},chave_pai:{name:"Chave do pai",desc:'Estava dentro do chap\xE9u de palha. O chaveiro tem um pedacinho de fita escrito "CASA".'},registro:{name:"Registro do chuveiro",desc:"A manopla vermelha do registro do chuveiro. Algu\xE9m tirou do lugar."},relogio_ovo:{name:"Rel\xF3gio-ovo",desc:`Um rel\xF3gio em forma de ovo. N\xE3o tem ponteiros, s\xF3 um bot\xE3o.
Na base, gravado bem pequeno: "PARA DESFAZER UM MOMENTO".`},powerbank:{name:"Bateria port\xE1til",desc:"Uma bateria port\xE1til carregada. Use (clique) para recarregar o celular em 60%."}};var rl=class{constructor(t){this.game=t,this.subQueue=[],this.subTimer=null,this.overlay=null,this.resolver=null,this.menuOpen=!0,this.cb={},this._wire(),this._menuBg()}setObjective(t){let e=ht("objective");if(!t){e.classList.remove("show");return}ht("objective-text").textContent=Ft(t),e.classList.remove("show"),e.offsetWidth,e.classList.add("show"),clearTimeout(this._objT),this._objT=setTimeout(()=>e.classList.remove("show"),9e3)}flashObjective(){let t=ht("objective");t.classList.add("show"),clearTimeout(this._objT),this._objT=setTimeout(()=>t.classList.remove("show"),6e3)}prompt(t){let e=ht("prompt");if(!t){e.classList.remove("show"),ht("crosshair").classList.remove("active");return}e.innerHTML="<b>E</b>"+Kn(Ft(t)),e.classList.add("show"),ht("crosshair").classList.add("active")}say(t,e,i,s=""){return new Promise(a=>{let r=i||Math.max(2.2,Ft(e).length*.065);this.subQueue.push({who:t,text:Ft(e),dur:this.fast?Math.min(.03,r):r,kind:s,res:a}),this.subTimer||this._nextSub()})}_nextSub(){let t=this.subQueue.shift(),e=ht("subtitle");if(!t){e.classList.remove("show"),this.subTimer=null;return}e.innerHTML=(t.who?`<span class="who ${t.kind}">${Kn(Ft(t.who))}:</span>`:"")+Kn(t.text).replace(/\*(.+?)\*/g,"<i>$1</i>"),e.classList.add("show"),this.subTimer=setTimeout(()=>{t.res(),this._nextSub()},t.dur*1e3)}clearSubs(){this.subQueue.forEach(t=>t.res()),this.subQueue=[],clearTimeout(this.subTimer),this.subTimer=null,ht("subtitle").classList.remove("show")}notify(t,e,i={}){let s=at("div",{class:"notif"+(i.glitch?" glitch":"")},at("div",{class:"n-app"},at("span",{},i.app||"Mensagens"),at("span",{},i.time||"agora")),at("div",{class:"n-from"},Ft(t)),at("div",{},Ft(e)));ht("notify").appendChild(s),setTimeout(()=>{s.style.transition="opacity .6s",s.style.opacity="0",setTimeout(()=>s.remove(),700)},i.dur||6500)}toast(t,e=2.6){let i=ht("toast");i.innerHTML=Kn(Ft(t)).replace(/\n/g,"<br>"),i.classList.add("show"),clearTimeout(this._toastT),this._toastT=setTimeout(()=>i.classList.remove("show"),e*1e3)}battery(t){ht("bat-fill").style.width=Math.round(Pe(t,0,100))+"%",ht("bat-text").textContent=Math.round(t)+"%",ht("battery").classList.toggle("low",t<15),ht("vf-bat").textContent=Math.round(t)+"%",ht("ph-bat").textContent=Math.round(t)+"%"}radio(t){if(t===null){ht("radio").classList.add("hidden");return}ht("radio").classList.remove("hidden"),ht("radio-fill").style.width=Math.round(Pe(t,0,1)*100)+"%"}breath(t,e){ht("breath").classList.toggle("hidden",!e),ht("breath-fill").style.width=Math.round(t*100)+"%"}stamina(t){ht("stamina").classList.toggle("show",t<.98),ht("stamina-fill").style.width=Math.round(t*100)+"%"}hideOverlay(t){let e=ht("hide-overlay");e.className=t||"",t||e.classList.add("hidden")}hint(t,e){let i=ht("hint-box");i.innerHTML=`<div class="h-lvl">DICA ${t}/3</div>${Kn(Ft(e))}`,i.classList.remove("hidden"),clearTimeout(this._hintT),this._hintT=setTimeout(()=>i.classList.add("hidden"),12e3)}viewfinder(t,e={}){let i=ht("viewfinder");if(!t){i.classList.add("hidden");return}i.classList.remove("hidden"),i.classList.toggle("video",t==="video"),ht("vf-mode").textContent=t==="video"?"\u25B6 casa.mp4":"C\xC2MERA",ht("vf-time").textContent=e.time||"",ht("vf-sim").textContent=e.sim||"";let s=ht("vf-tag");e.tag?(s.textContent=e.tag,s.classList.add("show"),s.classList.toggle("echo",!!e.tagEcho)):s.classList.remove("show"),ht("vf-help").innerHTML=e.help||"Q: trocar modo &nbsp;\xB7&nbsp; clique: foto";let a=ht("vf-progress");e.progress!==void 0&&e.progress!==null?(a.classList.remove("hidden"),ht("vf-progress-fill").style.width=Math.round(e.progress*100)+"%"):a.classList.add("hidden")}showHud(t){ht("hud").classList.toggle("hidden",!t)}fade(t,e=1){let i=ht("fade");return this.fast&&(e=Math.min(e,.02)),i.style.transition=`opacity ${e}s`,i.style.opacity=String(t),new Promise(s=>setTimeout(s,e*1e3))}flash(t=1,e=.4,i="#fff"){te.flashes||(t*=.25);let s=ht("flash");s.style.background=i,s.style.transition="none",s.style.opacity=String(t),s.offsetWidth,s.style.transition=`opacity ${e}s`,s.style.opacity="0"}clickToPlay(t){ht("clickplay").classList.toggle("hidden",!t)}get paused(){return!!this.overlay||!ht("pause").classList.contains("hidden")||!ht("sub-panel").classList.contains("hidden")||this.menuOpen}openOverlay(t){this.overlay&&this.closeOverlay(),this.overlay=t,ht(t).classList.remove("hidden"),this.game.input.unlock(),C.play("ui")}closeOverlay(t){if(!this.overlay)return;ht(this.overlay).classList.add("hidden");let e=this.resolver;this.resolver=null,this.overlay=null,C.play("ui_back"),e&&e(t),this.game.resumePointer()}note(t,e,i={}){return new Promise(s=>{ht("note-title").textContent=Ft(t||""),ht("note-body").innerHTML=Kn(Ft(e)).replace(/\n/g,"<br>").replace(/\[\[(.+?)\]\]/g,'<span class="hand">$1</span>');let a=ht("note").querySelector(".paper");a.className="paper"+(i.style?" "+i.style:""),this.openOverlay("note"),C.play("page"),this.resolver=s})}choice(t,e){return new Promise(i=>{ht("choice-title").textContent=Ft(t);let s=ht("choice-options");s.innerHTML="",e.forEach((a,r)=>{let o=at("button",{onclick:()=>this.closeOverlay(r)},at("span",{class:"k"},String(r+1)),Ft(a));s.appendChild(o)}),this.openOverlay("choice"),this._choiceN=e.length,this.resolver=i,setTimeout(()=>s.firstChild&&s.firstChild.focus(),50)})}keypad({title:t,hint:e,mode:i="text",wheels:s=[],check:a}){return new Promise(r=>{ht("keypad-title").textContent=Ft(t),ht("keypad-hint").textContent=Ft(e||""),ht("keypad-msg").textContent="";let o=ht("keypad-input"),l=ht("keypad-wheels");l.innerHTML="";let c=[];i==="text"?(o.classList.remove("hidden"),o.value="",setTimeout(()=>o.focus(),60)):(o.classList.add("hidden"),c=s.map(()=>0),s.forEach((d,u)=>{let f=at("div",{class:"val"},String(d.values[0])),g=at("button",{onclick:()=>{c[u]=(c[u]+1)%d.values.length,f.textContent=d.values[c[u]],C.play("switch")}},"\u25B2"),_=at("button",{onclick:()=>{c[u]=(c[u]-1+d.values.length)%d.values.length,f.textContent=d.values[c[u]],C.play("switch")}},"\u25BC");l.appendChild(at("div",{class:"wheel"},at("div",{class:"lbl"},d.label||""),g,f,_))}));let h=()=>{let d=i==="text"?o.value:c.map((f,g)=>s[g].values[f]).join(""),u=a(d);u===!0?(this._kpOk=null,this.closeOverlay(d)):(ht("keypad-msg").textContent=Ft(u||"N\xE3o abriu."),C.play("locked"))};this._kpOk=h,ht("keypad-ok").onclick=h,ht("keypad-cancel").onclick=()=>this.closeOverlay(null),o.onkeydown=d=>{d.key==="Enter"&&h(),d.key==="Escape"&&this.closeOverlay(null)},this.openOverlay("keypad"),this.resolver=r})}openInventory(){let t=this.game;this.openOverlay("inventory");let e=ht("inv-grid");e.innerHTML="";let i=t.inventory.list(),s=a=>{[...e.children].forEach(c=>c.classList.toggle("sel",c.dataset.id===a));let r=Ua[a];ht("inv-name").textContent=Ft(r.name),ht("inv-desc").textContent=Ft(r.desc);let o=ht("inv-icon");o.innerHTML="";let l=at("canvas",{width:110,height:110});if($c(l.getContext("2d"),a,110),o.appendChild(l),a==="powerbank"){let c=at("button",{style:"margin-top:10px;padding:6px 12px;background:#1b1b1b;border:1px solid #444;cursor:pointer",onclick:()=>{t.usePowerbank(),this.closeOverlay()}},"Usar agora");ht("inv-desc").appendChild(at("br")),ht("inv-desc").appendChild(c)}};i.length||e.appendChild(at("div",{style:"grid-column:1/-1;color:#777;padding:20px"},"Nada por enquanto. S\xF3 o celular no bolso."));for(let a of i){let r=Ua[a],o=at("canvas",{width:64,height:64});$c(o.getContext("2d"),a,64);let l=at("div",{class:"inv-slot","data-id":a,onclick:()=>s(a)},o,at("div",{},Ft(r.name)));e.appendChild(l)}ht("inv-name").textContent="",ht("inv-desc").textContent="",ht("inv-icon").innerHTML="",i.length&&s(i[0])}openJournal(t="obj"){let e=this.game;this.openOverlay("journal");let i=[["obj","OBJETIVO"],["notes","NOTAS"],["photos","FOTOS"],["rules","REGRAS"],["map","PLANTA"]];e.flags.evidence&&i.push(["ev","EVID\xCANCIAS"]);let s=ht("journal-tabs");s.innerHTML="";let a=ht("journal-body"),r=o=>{if([...s.children].forEach(l=>l.classList.toggle("on",l.dataset.t===o)),a.innerHTML="",o==="obj")a.appendChild(at("h3",{style:"font-family:Georgia;font-weight:400"},Ft(e.story.objectiveText()||"\u2014"))),a.appendChild(at("p",{style:"color:#9b958a"},"Travou? Aperte H para uma dica (elas ficam mais claras aos poucos).")),e.story.statusLines().forEach(c=>a.appendChild(at("div",{class:"j-item"},Ft(c))));else if(o==="notes")e.notes.length||a.appendChild(at("p",{style:"color:#777"},"Nenhuma nota ainda.")),e.notes.forEach(l=>a.appendChild(at("div",{class:"j-item",onclick:()=>{this.closeOverlay(),this.note(l.title,l.body,{style:l.style})}},at("b",{},Ft(l.title)),at("br"),at("small",{},Ft(l.where||"")))));else if(o==="photos"){let l=e.phone.gallery;l.length||a.appendChild(at("p",{style:"color:#777"},"Nenhuma foto. Levante o celular (bot\xE3o direito) e clique para fotografar."));let c=at("div",{class:"gal-grid",style:"grid-template-columns:repeat(3,1fr)"});l.forEach(h=>c.appendChild(at("div",{},h.img?at("img",{src:h.img}):at("div",{class:"gal-empty"}),at("div",{class:"gal-cap"},Ft(h.caption))))),a.appendChild(c)}else o==="rules"?(e.rules.length||a.appendChild(at("p",{style:"color:#777"},"Voc\xEA ainda n\xE3o sabe nada sobre as regras desta noite.")),e.rules.forEach(l=>a.appendChild(at("div",{class:"j-rule"},Ft(l))))):o==="map"?(a.appendChild(this._mapCanvas()),a.appendChild(at("p",{style:"color:#9b958a;font-size:12px"},"Planta desenhada de mem\xF3ria. A casa pode discordar."))):o==="ev"&&(a.appendChild(at("p",{},"Coisas que n\xE3o batiam. Agora batem.")),e.story.evidence().forEach(l=>a.appendChild(at("div",{class:"j-ev"},Ft(l)))))};i.forEach(([o,l])=>s.appendChild(at("button",{"data-t":o,onclick:()=>r(o)},l))),r(t)}_mapCanvas(){let t=this.game,e=at("canvas",{width:900,height:520,class:"j-map"}),i=e.getContext("2d"),s=!!t.flags.corridorLong,a=42,r=150,o=90,l=(d,u,f,g,_,p="#fffaf0")=>{i.fillStyle=p,i.fillRect(r+d*a,o+f*a,(u-d)*a,(g-f)*a),i.strokeStyle="#3a3026",i.lineWidth=3,i.strokeRect(r+d*a,o+f*a,(u-d)*a,(g-f)*a),i.fillStyle="#3a3026",i.font='15px "Comic Sans MS", cursive',i.textAlign="center",i.fillText(_,r+(d+u)/2*a,o+(f+g)/2*a+5)};i.fillStyle="#e7e0cf",i.fillRect(0,0,900,520);let c=s?13.4:11;l(0,4.2,-1.5,0,"varanda","#e8efe9"),l(0,4.2,0,8,"sala"),l(-3,0,4,8,"cozinha","#f4efe4"),l(-3,-.8,8,10.2,"servi\xE7o","#f4efe4"),l(4.2,c,6.7,7.7,"corredor"),l(4.2,7.3,3.4,6.7,"quarto roxo","#e6def2"),l(7.3,10.4,3.4,6.7,"quarto dos meninos"),l(4.2,6.6,7.7,9.9,"banheiro","#e3eaee"),l(c,c+3.6,4.9,9.4,"quarto dos pais"),s&&t.flags.sawExtraDoor&&(i.setLineDash([6,6]),l(11.1,13.3,7.7,10.4,"???","rgba(120,40,40,0.15)"),i.setLineDash([])),i.fillStyle="#b22",i.font="bold 13px sans-serif",i.textAlign="center",i.fillText("porta de entrada",r+1*a,o+8.6*a);let h=t.player.pos;return i.fillStyle="#c3121c",i.beginPath(),i.arc(r+h.x*a,o+h.z*a,7,0,Math.PI*2),i.fill(),i.fillStyle="#3a3026",i.font="13px sans-serif",i.fillText("voc\xEA",r+h.x*a,o+h.z*a-12),e}openPhone(t="home"){this.openOverlay("phone"),this.renderPhone(t)}renderPhone(t,e){let i=this.game,s=i.phone;this.phoneView=t;let a=ht("phone-screen");a.innerHTML="",ht("ph-time").textContent=i.clockText();let r=i.flags.signal?"4G \u2582\u2584\u2586":"Sem servi\xE7o";if(ht("ph-signal").textContent=r,ht("ph-signal").style.color=i.flags.signal?"#8f8":"#ff8a8a",ht("ph-back").onclick=()=>{t==="home"?this.closeOverlay():t==="chat"?this.renderPhone("msgs"):this.renderPhone("home")},ht("ph-home").onclick=()=>this.renderPhone("home"),ht("ph-close").onclick=()=>this.closeOverlay(),t==="home"){a.appendChild(at("div",{class:"wallpaper-clock"},i.clockText())),a.appendChild(at("div",{class:"wallpaper-date"},"madrugada \xB7 "+Ft("{rafaela}")));let l=[["msgs","\u{1F4AC}","Mensagens","#2a7a4a",!0,s.unread()],["video","\u25B6","casa.mp4","#1f4f8f",s.apps.video,0],["cam","\u{1F4F7}","C\xE2mera","#444",!0,0],["radio","\u{1F4FB}","R\xE1dio FM","#7a4a1f",s.apps.radio,0],["gallery","\u{1F5BC}","Galeria","#6a2a6a",!0,0],["light","\u{1F526}",s.flashlight?"Lanterna: ON":"Lanterna","#8a7a1a",!0,0]],c=at("div",{class:"app-grid"});for(let[h,d,u,f,g,_]of l){let p=at("button",{class:"app"+(g?"":" locked"),onclick:()=>g&&this._phoneApp(h)},at("div",{class:"ic",style:`background:${f}`},d,_?at("span",{class:"badge"},String(_)):null),at("span",{},u));c.appendChild(p)}a.appendChild(c),a.appendChild(at("p",{class:"phone-p",style:"margin-top:26px;text-align:center;color:#888;font-size:11px"},"F: lanterna \xB7 bot\xE3o direito: c\xE2mera \xB7 Q: modo"))}else if(t==="msgs")a.appendChild(at("div",{class:"chat-head"},"Conversas")),s.threads.forEach(o=>{let l=o.msgs[o.msgs.length-1];a.appendChild(at("div",{class:"chat-list-item",onclick:()=>this.renderPhone("chat",o.id)},at("b",{},Ft(o.name)+(o.unread?` (${o.unread})`:"")),at("span",{},l?Ft(l.text).slice(0,42):"")))});else if(t==="chat"){let o=s.thread(e);o.unread=0,i.story.onReadThread&&i.story.onReadThread(o.id),a.appendChild(at("div",{class:"chat-head"},at("span",{},Ft(o.name)),at("small",{},o.status||"")));let l="";o.msgs.forEach(c=>{c.day&&c.day!==l&&(a.appendChild(at("div",{class:"msg-time"},c.day)),l=c.day),a.appendChild(at("div",{class:"msg "+(c.out?"out":"in")+(c.glitch?" glitchy":"")},Ft(c.text),at("div",{style:"font-size:9px;color:#888;text-align:right;margin-top:2px"},c.time||"")))}),setTimeout(()=>{a.scrollTop=a.scrollHeight},10),ht("ph-back").onclick=()=>this.renderPhone("msgs")}else if(t==="video")a.appendChild(at("div",{class:"vid-card"},at("div",{class:"vid-thumb"},"\u25B6"),at("b",{},"casa.mp4"),at("div",{style:"color:#888;font-size:12px"},"recebido de "+Ft("{wendel}")+" \xB7 04:05"),i.flags.showSim?at("div",{},at("div",{style:"margin-top:10px;font-size:12px"},`Compat\xEDvel com a casa: ${Math.round(i.story.sim())}%`),at("div",{class:"sim-bar"},at("div",{class:"sim-fill",style:`width:${i.story.sim()}%`}))):null,at("p",{class:"phone-p"},"Para comparar: segure o bot\xE3o direito do mouse para levantar o celular e aperte Q at\xE9 aparecer \u25B6 casa.mp4. A imagem mostra a casa como foi gravada.")));else if(t==="radio")a.appendChild(at("div",{class:"vid-card"},at("b",{},"R\xE1dio FM 87.9"),at("p",{class:"phone-p"},s.radioOn?"Ligado. S\xF3 chiado... e \xE0s vezes, vozes.":"Desligado."),at("button",{style:"padding:8px 14px;background:#222;border:1px solid #555;cursor:pointer",onclick:()=>{i.phone.toggleRadio(),this.renderPhone("radio")}},s.radioOn?"Desligar (R)":"Ligar (R)")));else if(t==="gallery"){s.gallery.length||a.appendChild(at("p",{class:"phone-p"},"Nenhuma foto."));let o=at("div",{class:"gal-grid"});s.gallery.forEach(l=>o.appendChild(at("div",{onclick:()=>this.renderPhone("photo",l)},l.img?at("img",{src:l.img}):at("div",{class:"gal-empty"}),at("div",{class:"gal-cap"},Ft(l.caption))))),a.appendChild(o)}else t==="photo"?(a.appendChild(at("div",{class:"gal-full"},e.img?at("img",{src:e.img}):null,at("p",{class:"phone-p"},Ft(e.caption)),e.detail?at("p",{class:"phone-p",style:"color:#aaa"},Ft(e.detail)):null)),ht("ph-back").onclick=()=>this.renderPhone("gallery")):t==="cam"&&a.appendChild(at("p",{class:"phone-p"},"Segure o bot\xE3o direito do mouse (fora deste menu) para levantar o celular e usar a c\xE2mera. Clique para tirar foto. A c\xE2mera v\xEA coisas que o olho n\xE3o v\xEA."))}_phoneApp(t){if(t==="light"){this.game.phone.toggleFlashlight(),this.renderPhone("home");return}this.renderPhone(t)}_wire(){ht("main-buttons").addEventListener("click",t=>{let e=t.target.closest("button");if(!e)return;C.init(),C.play("ui");let i=e.dataset.act;i==="new"&&this.cb.onNew&&this.cb.onNew(),i==="continue"&&this.cb.onContinue&&this.cb.onContinue(),i==="options"&&this.openOptions(),i==="controls"&&this.openControls(),i==="credits"&&this.openCredits(),i==="names"&&this.openNames()}),ht("pause").addEventListener("click",t=>{let e=t.target.closest("button");if(!e)return;C.play("ui");let i=e.dataset.act;i==="resume"&&this.cb.onResume&&this.cb.onResume(),i==="hint"&&(this.cb.onResume&&this.cb.onResume(),this.cb.onHint&&this.cb.onHint()),i==="options"&&this.openOptions(),i==="controls"&&this.openControls(),i==="lastcp"&&this.cb.onLastCheckpoint&&this.cb.onLastCheckpoint(),i==="quit"&&this.cb.onQuit&&this.cb.onQuit()}),ht("sub-back").addEventListener("click",()=>{C.play("ui_back"),this.closeSub()}),ht("note").addEventListener("click",()=>{this.overlay==="note"&&this.closeOverlay()}),ht("clickplay").addEventListener("click",()=>this.game.resumePointer(!0)),this.game.input.onKey(t=>this._key(t))}_key(t){let e=t.code;if(!ht("sub-panel").classList.contains("hidden")){e==="Escape"&&this.closeSub();return}if(this.overlay){if(this.overlay==="note"&&(e==="Escape"||e==="KeyE"||e==="Enter"||e==="Space"))this.closeOverlay();else if(this.overlay==="choice"){let i=parseInt(t.key,10);i>=1&&i<=this._choiceN&&this.closeOverlay(i-1)}else this.overlay==="keypad"?(e==="Escape"&&this.closeOverlay(null),e==="Enter"&&this._kpOk&&this._kpOk()):this.overlay==="phone"&&(e==="Tab"||e==="Escape")?this.closeOverlay():this.overlay==="inventory"&&(e==="KeyI"||e==="Escape")?this.closeOverlay():this.overlay==="journal"&&(e==="KeyJ"||e==="Escape")&&this.closeOverlay();return}this.game.onKey(e)}showMenu(){this.menuOpen=!0,ht("menu").classList.remove("hidden"),ht("pause").classList.add("hidden"),ht("btn-continue").disabled=!this.game.hasSave(),ht("menu-player-name").textContent=ue.rafaela,this.showHud(!1)}hideMenu(){this.menuOpen=!1,ht("menu").classList.add("hidden")}showPause(t){ht("pause").classList.toggle("hidden",!t)}openSub(t,e){ht("sub-panel").classList.remove("hidden");let i=ht("sub-content");i.innerHTML=t||"",e&&e(i)}closeSub(){if(ht("sub-panel").classList.add("hidden"),this._onSubClose){let t=this._onSubClose;this._onSubClose=null,t()}}openOptions(){this.openSub("<h2>OP\xC7\xD5ES</h2>",t=>{let e=(a,r,o)=>at("div",{class:"opt-row"},at("span",{},a),at("span",{style:"display:flex;gap:8px;align-items:center"},r,o||"")),i=(a,r,o,l,c=h=>Math.round(h*100)+"%")=>{let h=at("span",{class:"val"},c(te[a])),d=at("input",{type:"range",min:r,max:o,step:l,value:te[a]});return d.addEventListener("input",()=>{te[a]=parseFloat(d.value),h.textContent=c(te[a]),Hc(),C.applyVolumes(),this.game.applySettings()}),[d,h]},s=(a,r)=>{let o=at("select",{});return r.forEach(([l,c])=>{let h=at("option",{value:String(l)},c);String(te[a])===String(l)&&(h.selected=!0),o.appendChild(h)}),o.addEventListener("change",()=>{let l=o.value;te[a]=l==="true"?!0:l==="false"?!1:isNaN(+l)?l:+l,Hc(),this.game.applySettings()}),o};t.appendChild(at("div",{class:"opt-note"},"\xC1UDIO")),t.appendChild(e("Volume geral",...i("master",0,1,.05))),t.appendChild(e("Efeitos e ambiente",...i("sfx",0,1,.05))),t.appendChild(e("M\xFAsica",...i("music",0,1,.05))),t.appendChild(e("Vozes",...i("voices",0,1,.05))),t.appendChild(e("Vozes sintetizadas (navegador)",s("tts",[[!0,"Ligadas"],[!1,"S\xF3 legendas"]]))),t.appendChild(at("div",{class:"opt-note"},"CONTROLE E C\xC2MERA")),t.appendChild(e("Sensibilidade do mouse",...i("sensitivity",.2,3,.05,a=>a.toFixed(2)))),t.appendChild(e("Inverter eixo Y",s("invertY",[[!1,"N\xE3o"],[!0,"Sim"]]))),t.appendChild(e("Campo de vis\xE3o",...i("fov",60,95,1,a=>Math.round(a)+"\xB0"))),t.appendChild(e("Tremor de c\xE2mera",...i("shake",0,1,.05))),t.appendChild(at("div",{class:"opt-note"},"SUSTOS E ACESSIBILIDADE")),t.appendChild(e("Jump scares",s("scare",[[2,"Completos"],[1,"Suaves"],[0,"Desligados"]]))),t.appendChild(e("Flashes e luzes piscando",s("flashes",[[!0,"Normais"],[!1,"Reduzidos"]]))),t.appendChild(e("Modo hist\xF3ria (persegui\xE7\xF5es n\xE3o te pegam)",s("storyMode",[[!1,"N\xE3o"],[!0,"Sim"]]))),t.appendChild(e("Qualidade gr\xE1fica",s("quality",[["auto","Autom\xE1tica"],["high","Alta"],["low","Leve (PCs fracos)"]]))),t.appendChild(at("div",{class:"opt-note"},"As op\xE7\xF5es s\xE3o salvas automaticamente neste navegador."))})}openControls(){let t=[["W A S D / setas","andar"],["Mouse","olhar"],["Shift","correr (faz barulho)"],["C (alterna) / Ctrl (segura)","agachar"],["E ou clique","interagir / examinar / esconder-se"],["F","lanterna do celular"],["Bot\xE3o direito (segure)","levantar o celular: c\xE2mera"],["Q ou rodinha (com o celular levantado)","trocar modo: C\xC2MERA \u2194 V\xCDDEO (casa.mp4)"],["Clique (com o celular levantado)","tirar foto"],["R","r\xE1dio (depois de achar o fone)"],["TAB","celular (mensagens, v\xEDdeo, galeria)"],["I","mochila (itens)"],["J","di\xE1rio (objetivo, notas, fotos, regras, planta)"],["H","dica (fica mais clara aos poucos)"],["Espa\xE7o (escondida)","prender a respira\xE7\xE3o"],["ESC","pausar"]];this.openSub("<h2>CONTROLES</h2>",e=>{let i=at("table",{class:"ctrl-table"});t.forEach(([s,a])=>i.appendChild(at("tr",{},at("td",{},s),at("td",{},a)))),e.appendChild(i),e.appendChild(at("p",{class:"opt-note"},"Dica: jogue com fones de ouvido. Muitos sons v\xEAm de outros c\xF4modos \u2014 e alguns v\xEAm do c\xF4modo errado."))})}openNames(){let t=[["rafaela","Protagonista (nome)"],["rafa","Apelido dela"],["wendel","Irm\xE3o (que gravou a casa)"],["julia","Irm\xE3"],["pedro","Irm\xE3o"],["mae","M\xE3e"],["pai","Pai"],["bento","Gato 1"],["lili","Gato 2"],["sobrenome","Sobrenome (opcional)"],["escola","Col\xE9gio (opcional)"]];this.openSub("<h2>PERSONALIZAR NOMES</h2>",e=>{e.appendChild(at("p",{class:"opt-note"},"Os nomes ficam salvos s\xF3 neste navegador. Deixe em branco para usar o padr\xE3o.")),t.forEach(([i,s])=>{let a=at("input",{type:"text",value:ue[i]||"",placeholder:ks[i]||""});a.addEventListener("input",()=>{ue[i]=a.value}),e.appendChild(at("div",{class:"opt-row"},at("span",{},s),a))}),this._onSubClose=()=>{gd(),ht("menu-player-name").textContent=ue.rafaela}})}openCredits(){this.openSub("",t=>{t.appendChild(at("div",{class:"credits"},at("h2",{},"CR\xC9DITOS"),at("p",{},Ft("Feito para {rafaela}, a pedido do irm\xE3o, {wendel}.")),at("p",{},"A casa: ela mesma, a partir de dois v\xEDdeos gravados pela fam\xEDlia. Planta, m\xF3veis e cores reinterpretados \xE0 m\xE3o."),at("p",{},Ft("Elenco: {rafaela} \xB7 {wendel} \xB7 {julia} \xB7 {pedro} \xB7 {mae} \xB7 {pai} \xB7 {bento} e {lili} \xB7 Tique-Taque \xB7 O Inquilino")),at("p",{},"Dire\xE7\xE3o, roteiro, programa\xE7\xE3o, sons e m\xFAsica: criados com Claude (IA da Anthropic), com three.js. Todos os sons e imagens s\xE3o gerados por c\xF3digo."),at("p",{style:"color:#9b958a"},"Tr\xEAs segredos est\xE3o escondidos pela casa: um \xE9 preto e branco, um toca uma m\xFAsica para quem esqueceu, e um guarda um momento que pode ser desfeito.")))})}ending(t,e){this.showHud(!1);let i=ht("ending");i.classList.remove("hidden");let s=ht("ending-inner");s.innerHTML=t;let a=at("button",{onclick:()=>{i.classList.add("hidden"),e()}},"Voltar ao menu");s.appendChild(at("div",{},a))}loading(t){ht("loading").classList.toggle("hidden",!t)}_menuBg(){let t=ht("menu-bg"),e=t.getContext("2d"),i=0,s=()=>{if(!this.menuOpen){requestAnimationFrame(s);return}let a=t.width=Math.floor(innerWidth/2),r=t.height=Math.floor(innerHeight/2);i+=1/60,e.fillStyle="#050505",e.fillRect(0,0,a,r);let o=a/2,l=r*.55,c=a*.06,h=r*.2;e.strokeStyle="rgba(200,190,170,0.18)",e.lineWidth=1;let d=[[-1,-1],[1,-1],[1,1],[-1,1]];for(let[p,m]of d)e.beginPath(),e.moveTo(o+p*c,l+m*h),e.lineTo(o+p*a*.7,l+m*r*.9),e.stroke();for(let p=1;p<6;p++){let m=Math.pow(p/6,1.6),M=c+(a*.7-c)*m,A=h+(r*.9-h)*m;e.strokeStyle=`rgba(200,190,170,${.05+m*.1})`,e.strokeRect(o-M,l-A,M*2,A*2)}e.fillStyle="rgba(80,40,25,0.8)",e.fillRect(o-c*.6,l-h*.9,c*1.2,h*1.9);let u=(Math.sin(i*.3)+1)/2;u>.8&&(e.fillStyle=`rgba(0,0,0,${(u-.8)*5})`,e.fillRect(o-c*.22,l-h*.75,c*.44,h*1.7),e.beginPath(),e.arc(o,l-h*.85,c*.2,0,Math.PI*2),e.fill());let f=e.getImageData(0,0,a,r),g=f.data;for(let p=0;p<g.length;p+=4){let m=(Math.random()-.5)*40;g[p]+=m,g[p+1]+=m,g[p+2]+=m}e.putImageData(f,0,0);let _=i*60%r;e.fillStyle="rgba(255,255,255,0.04)",e.fillRect(0,_,a,6),requestAnimationFrame(s)};s()}};function A_(){let n=document.createElement("canvas");n.width=256,n.height=256;let t=n.getContext("2d");t.fillStyle="#101010",t.fillRect(0,0,256,256),t.save(),t.translate(128,128),t.rotate(-.7),t.fillStyle="#1e1e1e",t.fillRect(-200,-34,400,68),t.fillStyle="#d6b26a",t.fillRect(-200,-38,400,5),t.fillRect(-200,33,400,5),t.fillStyle="rgba(120,120,120,0.35)";for(let i=-180;i<180;i+=22)for(let s=-22;s<=22;s+=22)t.fillRect(i-3,s-1,7,2),t.fillRect(i-1,s-3,2,7);t.restore(),t.fillStyle="#d6b26a",t.fillRect(0,0,256,8);let e=new Je(n);return e.colorSpace=xe,e}function af(){let n=new We,t=X("#8a5436",{roughness:.7}),e=X("#120b07",{roughness:1}),i=new bi({map:A_(),roughness:.8}),s=X("#1d2a24",{roughness:.9}),a=G(n,0,0,0),r=G(a,-.08,.72,0);ut(r,.055,.045,.7,t,0,-.35,0,{seg:8});let o=G(a,.08,.72,0);ut(o,.055,.045,.7,t,0,-.35,0,{seg:8}),D(n,.3,.16,.18,s,0,.74,0);let l=ut(n,.15,.14,.42,i,0,1.02,0,{seg:12});l.scale.z=.7,D(n,.36,.08,.16,i,0,1.2,0);let c=G(n,-.2,1.2,0);ut(c,.045,.035,.5,t,0,-.25,0,{seg:8}),D(c,.1,.12,.1,i,0,-.04,0);let h=G(n,.2,1.2,0);ut(h,.045,.035,.5,t,0,-.25,0,{seg:8}),D(h,.1,.12,.1,i,0,-.04,0),ut(n,.045,.05,.08,t,0,1.27,0,{seg:8});let d=G(n,0,1.4,0);ee(d,.11,t,0,0,0,{sy:1.12}),ee(d,.012,X("#111"),-.038,.01,.1,{seg:6,seg2:4,cast:!1}),ee(d,.012,X("#111"),.038,.01,.1,{seg:6,seg2:4,cast:!1});let u=Ie(12);for(let g=0;g<46;g++){let _=u()*Math.PI*2,p=.12-u()*.34,m=.12+(p<0?.03:0)+u()*.03,M=Math.sin(_)*m;M>.06&&p>-.08&&p<.1||ee(d,.045+u()*.02,e,Math.cos(_)*m,p,M-.01,{seg:7,seg2:5})}let f=D(h,.07,.14,.01,X("#111",{roughness:.3}),0,-.5,.05);return f.visible=!1,n.userData={lL:r,lR:o,aL:c,aR:h,head:d,phone:f},n}function rf(){let n=new We,t=X("#233f8f",{roughness:.8}),e=X("#c3121c",{roughness:.6}),i=X("#f2eee4",{roughness:.7}),s=X("#e2641a",{roughness:1});for(let m of[-1,1]){let M=ut(n,.1,.13,.85,t,m*.12,.5,0,{seg:10}),A=ee(n,.1,e,m*.13,.06,.1,{sx:1.1,sy:.6,sz:2.2})}let a=ut(n,.24,.2,.62,t,0,1.2,0,{seg:14});for(let m=0;m<3;m++)ee(n,.04,X(["#f5d10c","#3cc34a","#e8327a"][m]),0,1.35-m*.14,.2,{seg:8});let r=G(n,.1,1.3,.2);ut(r,.08,.08,.02,i,0,0,0,{rx:Math.PI/2,seg:16}),D(r,.008,.06,.005,X("#111"),0,.02,.012,{cast:!1});let o=new Lt(new yi(.2,.06,6,18),i);o.rotation.x=Math.PI/2,o.position.y=1.53,n.add(o);let l=G(n,-.3,1.45,0);ut(l,.07,.06,.6,t,0,-.3,0,{seg:8}),ee(l,.08,i,0,-.62,.02);let c=G(n,.3,1.45,0);ut(c,.07,.06,.6,t,0,-.3,0,{seg:8}),ee(c,.08,i,0,-.62,.02),l.rotation.z=.1,c.rotation.z=-.1;let h=G(n,0,1.78,0);ee(h,.2,i,0,0,0,{sy:1.1});let d=new dn(.205,24,16,0,Math.PI,Math.PI*.15,Math.PI*.7),u=new Lt(d,new bi({map:Pd(),roughness:.6}));u.scale.y=1.1,h.add(u),ee(h,.05,X("#e0101a",{roughness:.3,emissive:"#300000"}),0,-.01,.21,{seg:12});let f=Ie(4);for(let m=0;m<26;m++){let M=f()*Math.PI*2;Math.sin(M)>.35||ee(h,.07+f()*.05,s,Math.cos(M)*.22,.02+f()*.14,Math.sin(M)*.18,{seg:7,seg2:5})}let g=G(h,.05,.22,0);g.rotation.z=-.25,ut(g,.14,.14,.015,X("#111"),0,0,0,{seg:16}),ut(g,.08,.09,.12,X("#111"),0,.06,0,{seg:16});let _=G(c,0,-.72,.1),p=D(_,.34,.22,.01,i,0,0,0,{cast:!1});return _.visible=!1,n.userData={head:h,aL:l,aR:c,card:_,cardMesh:p},n}function of(n){let t=document.createElement("canvas");t.width=512,t.height=320;let e=t.getContext("2d");e.fillStyle="#f4efe2",e.fillRect(0,0,512,320),e.strokeStyle="#c3121c",e.lineWidth=10,e.strokeRect(12,12,488,296),e.fillStyle="#1a1a1a",e.textAlign="center",e.textBaseline="middle";let i=n.split(" "),s=[],a="";e.font="bold 44px Georgia";for(let l of i){let c=a?a+" "+l:l;e.measureText(c).width>440?(s.push(a),a=l):a=c}a&&s.push(a);let r=s.length>4?34:44;e.font=`bold ${r}px Georgia`,s.forEach((l,c)=>e.fillText(l,256,160+(c-(s.length-1)/2)*r*1.15));let o=new Je(t);return o.colorSpace=xe,o}function lf(){let n=new We,t=new bi({color:328965,roughness:1,metalness:0}),e=G(n,0,0,0);for(let c of[-1,1]){let h=ut(e,.05,.04,.8,t,c*.1,.95,0,{seg:6});h.rotation.z=c*.04,ut(e,.04,.03,.62,t,c*.12,.33,.02,{seg:6})}let i=ut(e,.13,.09,.8,t,0,1.62,0,{seg:8});i.scale.z=.55;for(let c=0;c<5;c++){let h=D(e,.22,.015,.1,t,0,1.4+c*.1,.05);h.rotation.x=.1}let s=[];for(let c of[-1,1]){let h=G(e,c*.2,1.98,0);ut(h,.035,.03,.75,t,0,-.37,0,{seg:6});let d=G(h,0,-.75,0);ut(d,.03,.025,.7,t,0,-.35,0,{seg:6});for(let u=0;u<4;u++){let f=ut(d,.008,.004,.28,t,(u-1.5)*.02,-.82,.01,{seg:4});f.rotation.x=.2-u*.05}h.rotation.z=c*.12,s.push({sh:h,fore:d})}let a=G(e,0,2.05,0);ut(a,.03,.035,.22,t,0,.1,0,{seg:6});let r=G(a,0,.36,.02),o=new Bo;D(r,.26,.36,.14,t,0,0,-.02);let l=new Lt(new Me(.24,.32),new Yt({map:o.texture,color:10066329}));return l.position.z=.051,r.add(l),n.userData={body:e,arms:s,neck:a,head:r,face:l,faceTex:o,black:t},n.traverse(c=>{c.isMesh&&(c.castShadow=!0)}),n}function R_(n){let t=document.createElement("canvas");t.width=128,t.height=128;let e=t.getContext("2d"),i=Ie(n==="bento"?3:9);e.fillStyle="#f3f1ec",e.fillRect(0,0,128,128);let s=n==="bento"?"#141414":"#6b6560";for(let r=0;r<(n==="bento"?7:10);r++)e.fillStyle=s,e.beginPath(),e.ellipse(i()*128,i()*128,10+i()*18,8+i()*12,i()*3,0,Math.PI*2),e.fill();if(n==="lili"){e.strokeStyle="rgba(40,36,32,0.5)",e.lineWidth=2;for(let r=0;r<20;r++){e.beginPath();let o=i()*128;e.moveTo(0,o),e.lineTo(128,o+(i()-.5)*10),e.stroke()}}let a=new Je(t);return a.colorSpace=xe,a.wrapS=a.wrapT=ji,a}function cf(n){let t=new We,e=new bi({map:R_(n),roughness:1}),i=ee(t,.12,e,0,.19,0,{sx:.9,sy:.85,sz:1.9}),s=G(t,0,.3,.22);ee(s,.085,e,0,0,0,{sx:1.05,sy:.95,sz:.95});for(let l of[-1,1]){let c=new Lt(new Wn(.032,.07,4),e);c.position.set(l*.045,.08,-.01),c.rotation.z=-l*.25,s.add(c);let h=ee(s,.014,new Yt({color:n==="bento"?13164618:14727242}),l*.032,.015,.075,{seg:8,seg2:6,cast:!1})}ee(s,.012,X("#e59aa3"),0,-.012,.085,{seg:6,seg2:4});let a=[];for(let[l,c]of[[-.06,.13],[.06,.13],[-.06,-.13],[.06,-.13]]){let h=G(t,l,.14,c);ut(h,.022,.02,.14,e,0,-.07,0,{seg:6}),a.push(h)}let r=[],o=G(t,0,.22,-.2);for(let l=0;l<6;l++){let c=G(o,0,0,-.045);ee(c,.022-l*.002,e,0,0,0,{seg:6,seg2:4}),r.push(c),o=c}return t.userData={head:s,legs:a,tail:r},t}var C_=`
  varying vec3 vPos; varying vec3 vN;
  void main(){ vPos = position; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,P_=`
  uniform float time; uniform vec3 color; uniform float alpha;
  varying vec3 vPos; varying vec3 vN;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
  void main(){
    float n = hash(floor(vec2(gl_FragCoord.x * 0.5, gl_FragCoord.y * 0.5)) + floor(time * 24.0));
    float band = step(0.92, fract(vPos.y * 6.0 - time * 1.3));
    float rim = 1.0 - abs(vN.z);
    float a = alpha * (0.35 + 0.65 * rim) * (0.55 + 0.45 * n) + band * 0.25 * alpha;
    gl_FragColor = vec4(color * (0.7 + 0.6 * n), a);
  }`;function I_(n=12572927,t=.7){return new ze({uniforms:{time:{value:0},color:{value:new Xt(n)},alpha:{value:t}},vertexShader:C_,fragmentShader:P_,transparent:!0,depthWrite:!1,blending:fa,side:Ne})}function ph(n={}){let t=new We,e=n.mat||I_(n.color,n.alpha),i=(n.h||1.7)/1.7,s=G(t,0,0,0);s.scale.setScalar(i);let a=[];for(let l of[-1,1]){let c=G(s,l*.1,.88,0),h=ut(c,.07,.055,.86,e,0,-.43,0,{seg:8,cast:!1});a.push(c)}ut(s,.2,.16,.62,e,0,1.2,0,{seg:10,cast:!1}).scale.z=.65;let r=[];for(let l of[-1,1]){let c=G(s,l*.24,1.46,0);ut(c,.055,.045,.62,e,0,-.31,0,{seg:8,cast:!1}),c.rotation.z=l*.08,r.push(c)}let o=G(s,0,1.64,0);if(ee(o,.12,e,0,0,0,{sy:1.15,cast:!1}),n.hair==="curly")for(let l=0;l<22;l++){let c=l/22*Math.PI*2;Math.sin(c)>.5||ee(o,.06,e,Math.cos(c)*.13,-.05+l%3*.06,Math.sin(c)*.12,{seg:6,seg2:4,cast:!1})}return n.hair==="long"&&D(o,.26,.4,.12,e,0,-.12,-.08,{cast:!1}),n.hair==="bun"&&ee(o,.07,e,0,.1,-.1,{seg:6,cast:!1}),n.hat&&(ut(o,.24,.24,.015,n.hatMat||e,0,.13,0,{seg:16,cast:!1}),ut(o,.12,.13,.12,n.hatMat||e,0,.19,0,{seg:12,cast:!1})),n.sitting&&(a.forEach(l=>{l.rotation.x=-Math.PI/2,l.position.y=.46,l.position.z=0}),s.position.y=-.42),t.userData={body:s,legs:a,arms:r,head:o,mat:e},t}function mh(){let n=new bi({color:657672,roughness:1,transparent:!0,opacity:.94}),t=X("#b8a472",{roughness:1}),e=ph({h:1.78,mat:n,hat:!0,hatMat:t}),i=G(e.userData.head,0,.01,.11);return ee(i,.012,new Yt({color:16771264}),-.04,0,0,{seg:6,seg2:4,cast:!1}),ee(i,.012,new Yt({color:16771264}),.04,0,0,{seg:6,seg2:4,cast:!1}),e.traverse(s=>{s.isMesh&&(s.castShadow=!0)}),e.userData.eyes=i,e}var ol=class{constructor(t){Rh(this,"canPass",t=>{if(!t.door)return!0;let e=this.game.world.doors.get(t.door);return e?!(e.houseDoor||e.locked):!0});this.game=t,this.model=lf(),this.model.visible=!1,t.scene.add(this.model),this.pos=new I(0,0,0),this.drawPos=new I,this.yaw=0,this.state="off",this.path=[],this.target=null,this.speed=1.3,this.strength=1,this.lastSeen=null,this.searchT=0,this.huntT=0,this.stepAcc=0,this.frameAcc=0,this.growl=null,this.sawHide=null,this.hunt=null,this.alert=0,this.nearHideT=0,this.layerSpec="ecv",this.onCatch=null,this.stunT=0,this.blockedT=0,this.ignoreT=0}setLayers(t){this.layerSpec=t,pe(this.model,t)}place(t,e,i=0){this.pos.set(t,this.game.world.heightAt(t,e),e),this.drawPos.copy(this.pos),this.yaw=i,this.model.position.copy(this.pos),this.model.rotation.y=i}show(t,e,i,s="ecv"){this.setLayers(s),this.place(t,e,i),this.model.visible=!0,this.state==="off"&&(this.state="static")}hide(){this.model.visible=!1,this.state="off",this.hunt=null,this.path=[],this.growl&&(this.growl.stop(.8),this.growl=null),C.music(null)}startHunt(t={}){let e=this.game.world,i=t.from?e.navNodes.get(t.from):null;i?this.place(i.x,i.z,0):t.x!==void 0&&this.place(t.x,t.z,0),this.setLayers(t.spec||"ecv"),this.model.visible=!0,this.state="patrol",this.hunt={dur:t.duration||45,exit:t.exit||t.from,patrol:t.patrol||[...e.navNodes.keys()],onEnd:t.onEnd||null,endless:!!t.endless,leaving:!1},this.huntT=0,this.path=[],this.lastSeen=null,this.sawHide=null,this.speed=1.3,this.strength=t.strength||this.strength||1,t.investigate&&this.investigate(t.investigate.x,t.investigate.z),this.growl||(this.growl=C.loop("growl",{pos:this.pos,vol:.9,ref:1.5,rolloff:1.4})),C.play("crack",{pos:this.pos}),C.music("dread")}endHunt(){this.hunt&&(this.hunt.leaving=!0,this.state="leave",this.goTo(this.hunt.exit))}giveUp(){let t=this.game.world,e=this.game.player.pos,i=null,s=0,a=this.hunt?this.hunt.patrol:[...t.navNodes.keys()];for(let r of a){let o=t.navNodes.get(r);if(!o)continue;let l=Math.hypot(o.x-e.x,o.z-e.z);l>s&&(s=l,i=r)}i&&this.goTo(i)}stun(t){this.stunT=t,C.play("scream",{pos:this.pos,v:.4,dur:1.2})}goTo(t){let e=this.game.world,i=e.nearestNode(this.pos.x,this.pos.z);if(!i||!e.navNodes.has(t))return this.path=[],!1;let s=e.path(i.id,t,this.canPass);return this.path=s?s.slice():[],!!s}goToPoint(t,e){let s=this.game.world.nearestNode(t,e);s&&this.goTo(s.id),this.finalPoint={x:t,z:e}}investigate(t,e){this.state==="chase"||this.state==="leave"||this.state==="off"||this.state==="static"||(this.state="investigate",this.goToPoint(t,e),this.searchT=0)}hear(t,e,i){if(!this.hunt||this.state==="off")return;Math.hypot(t-this.pos.x,e-this.pos.z)<i*this.strength&&this.investigate(t,e)}sees(t){let e=this.game,i=Math.hypot(t.x-this.pos.x,t.z-this.pos.z);if(i>11||e.player.hidden||e.world.losBlocked(this.pos.x,this.pos.z,t.x,t.z))return!1;if(this.state!=="chase"){let s=Math.atan2(-(t.x-this.pos.x),-(t.z-this.pos.z));if(Math.abs(si(this.yaw,s))>1.2&&i>2.2)return!1}return!(e.player.crouching&&i>6&&this.state!=="chase")}update(t){let e=this.game,i=e.world,s=e.player;if(this.model.visible){let g=this.model.userData;if(this.frameAcc+=t,this.frameAcc>1/12){this.frameAcc=0,g.faceTex.draw(1/12,this.state==="chase"?1.6:1);let _=this.state==="chase"?.04:.015;this.drawPos.set(this.pos.x+St(-_,_),this.pos.y,this.pos.z+St(-_,_)),this.model.position.copy(this.drawPos),this.model.rotation.y=this.yaw+St(-.04,.04),g.neck.rotation.z=Math.sin(performance.now()*.002)*.25+(Math.random()<.05?St(-.6,.6):0),g.neck.rotation.x=.25+Math.sin(performance.now()*.0013)*.1;let p=performance.now()*.004;g.arms[0].sh.rotation.x=Math.sin(p)*.35,g.arms[1].sh.rotation.x=-Math.sin(p)*.35,g.arms[0].fore.rotation.x=-.3+Math.sin(p*1.3)*.2,g.arms[1].fore.rotation.x=-.3-Math.sin(p*1.3)*.2}}if(this.growl&&this.growl.setPos(this.pos),this.state==="off"||this.state==="static")return;if(this.stunT>0){this.stunT-=t;return}let a=s.pos,r=Math.hypot(a.x-this.pos.x,a.z-this.pos.z),o=this.hunt;o&&(this.huntT+=t,!o.leaving&&!o.endless&&this.huntT>o.dur&&this.state!=="chase"&&this.endHunt()),this.ignoreT=Math.max(0,(this.ignoreT||0)-t);let l=this.state!=="leave"&&this.ignoreT<=0&&!this.sanctuary(a.x,a.z)&&this.sees(a);l&&(this.state!=="chase"&&(C.play("stinger_small",{pos:this.pos,v:.7}),C.music("chase"),e.onSpotted&&e.onSpotted()),this.state="chase",this.lastSeen={x:a.x,z:a.z},this.alert=1),s.hidden&&this.state==="chase"&&this.lastSeen&&!this.sawHide&&Math.hypot(this.lastSeen.x-s.hidden.exit.x,this.lastSeen.z-s.hidden.exit.z)<1.8&&this.alert>.5&&(this.sawHide=s.hidden.id);let c=1.25,h=null,d=null;if(this.state==="chase")c=2.55*this.strength,l?(h=a.x,d=a.z,this.path=[]):this.sawHide&&s.hidden?(h=s.hidden.exit.x,d=s.hidden.exit.z):this.lastSeen&&(h=this.lastSeen.x,d=this.lastSeen.z,Math.hypot(h-this.pos.x,d-this.pos.z)<.5&&(this.state="search",this.searchT=0,this.lastSeen=null,C.music("dread"))),this.alert=Math.max(0,this.alert-t*.3);else if(this.state==="search")this.searchT+=t,c=.9,this.searchT>6?(this.state="patrol",this.path=[]):this.yaw+=t*1.4*Math.sin(this.searchT);else if(this.state==="investigate")c=1.7*this.strength,this.path.length||(this.finalPoint?(h=this.finalPoint.x,d=this.finalPoint.z,Math.hypot(h-this.pos.x,d-this.pos.z)<.4&&(this.finalPoint=null,this.state="search",this.searchT=0)):(this.state="search",this.searchT=0));else if(this.state==="patrol"){if(c=1.2*this.strength,!this.path.length){let g=Uo(o?o.patrol:[...i.navNodes.keys()]);this.goTo(g)}}else if(this.state==="leave"){if(c=1.5,!this.path.length){this.hide(),o&&o.onEnd&&o.onEnd();return}}else if(this.state==="scripted"&&(c=this.scriptSpeed||1.3,!this.path.length&&(this.state="static",this._scriptRes))){let g=this._scriptRes;this._scriptRes=null,g()}if(h===null&&this.path.length){let g=this.path[0];h=g.x,d=g.z,Math.hypot(g.x-this.pos.x,g.z-this.pos.z)<.25&&(this.path.shift(),this._openDoorsNear())}let u=this.pos.x,f=this.pos.z;if(h!==null){let g=h-this.pos.x,_=d-this.pos.z,p=Math.hypot(g,_);if(p>.05){let m=Math.min(p,c*t);this.pos.x+=g/p*m,this.pos.z+=_/p*m,this.state==="chase"&&i.resolve(this.pos,.28,A=>A.tag!=="door"||!this._canOpen(A));let M=Math.atan2(-g,-_);this.yaw+=si(this.yaw,M)*Math.min(1,t*6),this.stepAcc+=m,this.stepAcc>(this.state==="chase"?.9:.75)&&(this.stepAcc=0,C.play("entity_step",{pos:this.pos,v:this.state==="chase"?1.1:.8}),Math.random()<.15&&C.play("crack",{pos:this.pos}))}this._openDoorsNear()}if(this.sanctuary(this.pos.x,this.pos.z)?(this.pos.x=u,this.pos.z=f,this.blockedT+=t,e.story.onEntityBlocked&&e.story.onEntityBlocked(this.blockedT),this.blockedT>5&&this.state!=="leave"&&(this.state="patrol",this.path=[],this.ignoreT=10,this.blockedT=0)):this.blockedT>0&&(this.blockedT=Math.max(0,this.blockedT-t)),this.pos.y=i.heightAt(this.pos.x,this.pos.z),s.hidden){let g=Math.hypot(s.hidden.exit.x-this.pos.x,s.hidden.exit.z-this.pos.z);if(this.sawHide===s.hidden.id&&g<.9)return this._catch(!0);if(g<1.5&&this.state!=="leave"){if(this.nearHideT+=t,s.holdingBreath)this.heldT=(this.heldT||0)+t,this.heldT>2.5&&(this.heldT=0,this.nearHideT=0,this.state="patrol",this.path=[],this.ignoreT=5,this.finalPoint=null,this.giveUp());else if(this.nearHideT>1.4)return this._catch(!0)}else this.nearHideT=0,this.heldT=0}else if(r<.8&&this.state!=="leave"&&!this.sanctuary(a.x,a.z))return this._catch(!1)}sanctuary(t,e){return t>60?!0:t>11.1&&t<13.3&&e>7.74&&e<10.7&&!!this.game.flags.corridorLong}_canOpen(t){let e=this.game.world.doors.get(t.id);return e&&!e.houseDoor}_openDoorsNear(){for(let t of this.game.world.doors.values())t.houseDoor||t.fake||t.locked||t.target<.5&&Math.hypot(t.center.x-this.pos.x,t.center.z-this.pos.z)<1&&t.openNow(!1,{slam:this.state==="chase",speed:this.state==="chase"?6:2.5})}_catch(t){let e=this.game;if(te.storyMode){C.play("scream",{pos:this.pos,v:.8}),e.ui.flash(.4,.5,"#300"),this.hide(),this.hunt&&this.hunt.onEnd&&this.hunt.onEnd();return}let i=this.onCatch;this.state="static",i&&i(t)}walkTo(t,e=1.3){return new Promise(i=>{this.state="scripted",this.scriptSpeed=e,this.goTo(t),this._scriptRes=i})}proximity(){if(!this.model.visible||this.state==="off")return 0;let t=this.game.player.pos,e=Math.hypot(t.x-this.pos.x,t.z-this.pos.z);return Pe(1-e/14,0,1)}};var Oa=class{constructor(t,e){this.game=t,this.kind=e,this.model=cf(e),pe(this.model,"evmc"),t.scene.add(this.model),this.pos=new I,this.yaw=0,this.target=null,this.mode="idle",this.t=0,this.meowT=St(8,20),this.walkPhase=0,this.stareAt=null,this.enabled=!0,this.speed=1.2,this.path=[],this.purr=null,this.onArrive=null}place(t,e,i=0){this.pos.set(t,0,e),this.yaw=i,this.model.position.copy(this.pos),this.model.rotation.y=i}setVisible(t){this.model.visible=t,this.enabled=t}goTo(t,e,i){let s=this.game.world,a=s.nearestNode(this.pos.x,this.pos.z),r=s.nearestNode(t,e),o=a&&r?s.path(a.id,r.id):null;this.path=o?o.map(l=>({x:l.x,z:l.z})):[],this.path.push({x:t,z:e}),this.mode="goto",this.onArrive=i||null}meow(t=1){C.play("meow",{pos:[this.pos.x,.3,this.pos.z],v:t,pitch:this.kind==="lili"?640:520})}hiss(){C.play("hiss",{pos:[this.pos.x,.3,this.pos.z]})}update(t){if(!this.enabled)return;let e=this.model.userData;this.t+=t;let i=!1;if(this.mode==="goto"||this.mode==="follow"){let a=null;if(this.mode==="follow"){let r=this.game.player.pos;if(Math.hypot(r.x-this.pos.x,r.z-this.pos.z)>1.4)if(this.game.world.losBlocked(this.pos.x,this.pos.z,r.x,r.z)){if(!this.path.length||this.t>1.5){this.t=0;let l=this.game.world.nearestNode(this.pos.x,this.pos.z),c=this.game.world.nearestNode(r.x,r.z),h=l&&c?this.game.world.path(l.id,c.id):null;this.path=h?h.map(d=>({x:d.x,z:d.z})):[]}a=this.path[0]||null}else a={x:r.x,z:r.z},this.path=[]}else a=this.path[0];if(a){let r=a.x-this.pos.x,o=a.z-this.pos.z,l=Math.hypot(r,o);if(l<.15){if(this.path.shift(),this.mode==="goto"&&!this.path.length&&(this.mode="idle",this.onArrive)){let c=this.onArrive;this.onArrive=null,c()}}else{let c=this.mode==="follow"?1.9:this.speed;this.pos.x+=r/l*c*t,this.pos.z+=o/l*c*t,this.yaw+=si(this.yaw,Math.atan2(r,o))*Math.min(1,t*8),i=!0}}}if(this.mode==="stare"&&this.stareAt){let a=this.stareAt.x-this.pos.x,r=this.stareAt.z-this.pos.z;this.yaw+=si(this.yaw,Math.atan2(a,r))*Math.min(1,t*5)}this.walkPhase+=t*(i?10:0),e.legs.forEach((a,r)=>{a.rotation.x=i?Math.sin(this.walkPhase+(r%2?Math.PI:0)+(r>1?Math.PI/2:0))*.5:0});let s=this.mode==="stare"?1:.3;e.tail.forEach((a,r)=>{a.rotation.x=-s*.35+Math.sin(this.t*2+r*.6)*.15,a.rotation.y=Math.sin(this.t*1.3+r)*.12}),e.head.rotation.y=this.mode==="stare"?0:Math.sin(this.t*.7)*.3,this.model.position.set(this.pos.x,this.mode==="eat"?-.03:0,this.pos.z),this.model.rotation.y=this.yaw,this.meowT-=t,this.meowT<0&&this.mode!=="hide"&&(this.meowT=St(14,35),Math.random()<.6&&this.meow(.6))}},ll=class{constructor(t){this.game=t,this.model=rf(),this.model.visible=!1,t.scene.add(this.model),this.track=!1,this.cards=[],this.t=0}show(t,e,i=0,s="ec",a=!0){pe(this.model,s),this.model.position.set(t,this.game.world.heightAt(t,e),e),this.model.rotation.y=i,this.model.userData.head.rotation.set(0,0,0),this.model.visible=!0,this.track=a}hide(){this.model.visible=!1,this.track=!1,this.showCard(null)}honk(t=1,e=!1){let i=this.model.visible?this.model.position:this.game.player.pos;C.play("honk",{pos:[i.x,1.4,i.z],v:t,rev:e?.9:.4,pitch:e?280:300})}honkAt(t,e,i=1){C.play("honk",{pos:[t,1.4,e],v:i,rev:.8})}showCard(t){let e=this.model.userData.card;if(!t){e.visible=!1;return}let i=of(t);this.model.userData.cardMesh.material=new Yt({map:i}),this.model.userData.aR.rotation.x=-1.2,e.visible=!0}update(t){if(!this.model.visible)return;this.t+=t;let e=this.model.userData;if(this.track){let i=this.game.player.eye,s=this.model.position,a=Math.atan2(i.x-s.x,i.z-s.z)-this.model.rotation.y,r=Pe(si(0,a),-2.6,2.6);e.head.rotation.y+=(r-e.head.rotation.y)*Math.min(1,t*1.2),e.head.rotation.z=Math.sin(this.t*.5)*.12+.1}e.card.visible||(e.aR.rotation.x=Math.sin(this.t*.8)*.05)}},cl=class{constructor(t){this.game=t,this.list=new Map,this.time=0}add(t,e){this.remove(t);let i=e.esquecido?mh():ph(e);pe(i,e.spec||"sv"),i.position.set(e.x,e.y||0,e.z),i.rotation.y=e.yaw||0,this.game.scene.add(i);let s={id:t,f:i,opts:e,t:0,anim:e.anim||"idle",route:e.route||null,ri:0,fade:1};return this.list.set(t,s),s}get(t){return this.list.get(t)}remove(t){let e=this.list.get(t);e&&(this.game.scene.remove(e.f),this.list.delete(t))}clear(){for(let t of[...this.list.keys()])this.remove(t)}fadeOut(t,e=2){let i=this.list.get(t);return i?(i.fadeDur=e,i.fading=!0,new Promise(s=>{i.onFaded=s})):Promise.resolve()}update(t){this.time+=t;for(let e of this.list.values()){e.t+=t;let i=e.f.userData;if(i.mat&&i.mat.uniforms&&(i.mat.uniforms.time.value=this.time),e.fading&&(e.fade-=t/e.fadeDur,i.mat&&i.mat.uniforms?i.mat.uniforms.alpha.value=Math.max(0,e.fade)*(e.opts.alpha||.7):e.f.traverse(s=>{s.material&&s.material.opacity!==void 0&&(s.material.transparent=!0,s.material.opacity=Math.max(0,e.fade))}),e.f.position.y+=t*.15,e.fade<=0)){let s=e.onFaded;this.remove(e.id),s&&s();continue}if(e.anim==="breathe"&&(i.body.position.y=Math.sin(e.t*1.5)*.01),e.anim==="wave"&&(i.arms[1].rotation.z=-2.4+Math.sin(e.t*5)*.3),e.anim==="point"&&e.opts.pointAt){let s=e.opts.pointAt;i.arms[1].rotation.x=-1.4;let a=Math.atan2(s.x-e.f.position.x,s.z-e.f.position.z);e.f.rotation.y+=si(e.f.rotation.y,a)*Math.min(1,t*3)}if(e.anim==="look"){let s=this.game.player.pos,a=Math.atan2(s.x-e.f.position.x,s.z-e.f.position.z);i.head.rotation.y+=(Pe(si(e.f.rotation.y,a),-1.3,1.3)-i.head.rotation.y)*Math.min(1,t*2)}if(e.anim==="type"&&(i.arms[0].rotation.x=-1.2+Math.sin(e.t*14)*.08,i.arms[1].rotation.x=-1.2+Math.cos(e.t*13)*.08),e.route&&this._route(e,t),e.anim==="walk"||e.walking){let s=Math.sin(e.t*6);i.legs[0].rotation.x=s*.4,i.legs[1].rotation.x=-s*.4}}}_route(t,e){let i=t.route,s=i[t.ri];if(!s)return;if(t.waitT>0){t.waitT-=e,t.walking=!1,t.waitT<=0&&(t.ri=(t.ri+1)%i.length);return}let a=s.x-t.f.position.x,r=s.z-t.f.position.z,o=Math.hypot(a,r);if(o<.08){t.waitT=s.wait||1.5,s.yaw!==void 0&&(t.f.rotation.y=s.yaw),s.act&&this.game.story.onEchoAct&&this.game.story.onEchoAct(t.id,s.act);let h=t.f.userData;h.arms[1].rotation.x=s.act?-1.3:0;return}t.walking=!0;let l=t.f.userData;l.arms[1].rotation.x=0;let c=.9;t.f.position.x+=a/o*Math.min(o,c*e),t.f.position.z+=r/o*Math.min(o,c*e),t.f.rotation.y+=si(t.f.rotation.y,Math.atan2(a,r))*Math.min(1,e*6)}},hl=class{constructor(t){this.game=t,this.model=mh(),pe(this.model,"ecv"),this.model.visible=!1,t.scene.add(this.model),this.pos=new I,this.active=!1,this.calm=!1,this.t=0,this.speakT=3,this.pushed=null}spawn(t,e){this.pos.set(t,0,e),this.model.position.copy(this.pos),this.model.visible=!0,this.active=!0,this.calm=!1}hide(){this.model.visible=!1,this.active=!1}update(t){if(!this.active)return;this.t+=t;let e=this.game,i=e.player.pos,s=this.model.userData,a=i.x-this.pos.x,r=i.z-this.pos.z,o=Math.hypot(a,r);if(this.model.rotation.y+=si(this.model.rotation.y,Math.atan2(a,r))*Math.min(1,t*2),this.calm){s.body.rotation.x=Math.min(.5,s.body.rotation.x+t*.4);return}if(e.world.roomAt(i.x,i.z)==="pais"&&!e.player.hidden)if(o>.9){this.pos.x+=a/o*.55*t,this.pos.z+=r/o*.55*t,e.world.resolve(this.pos,.25);let c=Math.sin(this.t*3);s.legs[0].rotation.x=c*.3,s.legs[1].rotation.x=-c*.3}else this.pushed||(this.pushed=!0,e.story.onEsquecidoTouch&&e.story.onEsquecidoTouch());s.arms[0].rotation.x=-.6+Math.sin(this.t*1.1)*.1,s.arms[1].rotation.x=-.6+Math.cos(this.t)*.1,this.model.position.copy(this.pos),this.speakT-=t,this.speakT<0&&o<7&&(this.speakT=St(6,9),e.story.onEsquecidoSpeak&&e.story.onEsquecidoSpeak())}};var hf={async startAct2(n){let t=this.g,e=this.F;e.act=2,e.power=!1,this.phase="a2",t.clockMin=214,t.rebuildWorld(),this.setupLights(),this.setupActors(),t.phone.battery=Math.max(t.phone.battery,30),t.phone.flashlight=!1,t.player.teleport(1.3,2.9,Math.PI,.5),t.player.eyeH=.3,this.cut(!0,{look:!0}),t.startAmbience("act2"),this.powerAmbience(!1),await t.ui.fade(0,3),await n.say("{rafa}","*...o que... o que foi aquilo?*",{dur:2.6});for(let i=0;i<30;i++)t.player.eyeH+=(pn-t.player.eyeH)*.12,t.player.pitch*=.9,await n.wait(.05);t.player.eyeH=pn,await n.say("{rafa}","*A luz caiu. At\xE9 a geladeira parou. Nunca ouvi essa casa t\xE3o quieta.*",{dur:3.6}),this.cut(!1),this.msg("{rafaela}."),await n.wait(1.2),this.msg("A luz caiu. O quadro de luz fica do lado da porta de entrada."),this.objective("breaker"),this.toast("F: lanterna",2.5),t.checkpoint("a2_start")},resume_a2(){let n=this.F,t=this.g;if(this._prevZones=[],n.armFridgeClown=!1,this.fridgeClown=null,this._blocked=!1,!n.power){this.objective("breaker");return}n.familyIntro?this.objective("family"):this.objective("lookvideo"),n.hasIce&&!n.hunt2Done&&this.after(3,()=>this.startHunt2()),n.laptopUnlocked&&n.webcamDone&&!n.hunt3Done&&this.after(2,()=>this.startHunt3(!0)),n.hunt1Started&&!n.hunt1Done&&(n.hunt1Started=!1)},resume_a2_door(){this._prevZones=[],this.objective(this.F.extraOpened?"descend":"door"),this.doorPhaseAmbience()},setupFamilyEchoes(){let n=this.g,t=this.F,e=n.layout.P,i=13623551;t.momFound||n.echoes.add("v_mae",{x:-2.25,z:6.1,yaw:-Math.PI/2,spec:"v",hair:"bun",anim:"breathe",color:i,caption:"A m\xE3e, parada na bancada, dentro do v\xEDdeo."}),t.dadFound||n.echoes.add("v_pai",{x:e+1.8,z:6.2,yaw:Math.PI,spec:"v",hat:!0,anim:"breathe",color:i,h:1.78,caption:"O pai, de chap\xE9u, olhando o espelho. Dentro do v\xEDdeo."}),t.juliaFound||(n.echoes.add("v_julia",{x:4.74,z:4.9,yaw:Math.PI/2,spec:"v",hair:"long",sitting:!0,anim:"breathe",color:i,h:1.6,caption:"A {julia}, sentada na cama. Dentro do v\xEDdeo."}),n.echoes.add("m_julia",{x:4.74,z:4.9,yaw:Math.PI/2,spec:"m",hair:"long",sitting:!0,anim:"look",color:16770760,alpha:.85,h:1.6})),t.pedroFound||n.echoes.add("v_pedro",{x:8.2,z:4.4,yaw:-Math.PI/2,spec:"v",hair:"short",sitting:!0,anim:"type",color:i,h:1.7,caption:"O {pedro}, na escrivaninha. Dentro do v\xEDdeo."}),!t.momFound&&t.power&&this.startMomRoutine()},prompt_breaker(){return this.F.act===2&&!this.F.power?"Abrir o quadro e subir a chave GERAL":"Quadro de luz"},do_breaker(){let n=this.F,t=this.g;if(!(n.act===2&&!n.power)){this.say0("","O quadro de luz. Todas as chaves est\xE3o pra cima.");return}this.run(async e=>{let i=t.world.get("breaker");i&&i.switches.forEach(s=>{s.rotation.x=-.5}),C.play("breaker",{pos:[.06,1.75,7]}),n.power=!0,this.progress(),await e.wait(.4),C.play("power_up"),this.setupLights(),["sala","entrada","cozinha","corredor1","corredor2","roxo","meninos","banheiro","pais"].forEach(s=>t.setLight(s,!0,1.6)),this.powerAmbience(!0),t.flags.fanSpeed=3,await e.wait(2),this.setupActors(),await e.say("{rafa}","*M\xE3e? ...Pai?*",{dur:2.2}),await e.wait(1.2),this.msg("{rafaela}. Eles n\xE3o est\xE3o mais a\xED."),await e.wait(1.6),this.msg("Ele levou eles para dentro do v\xEDdeo."),await e.wait(1.4),this.msg("Olhe no v\xEDdeo."),this.objective("lookvideo"),t.checkpoint("a2_lights")})},update_a2(n){let t=this.g,e=this.F;if(e.power&&!e.familyIntro&&t.phone.raised&&t.phone.mode==="video")for(let a of["v_mae","v_pai","v_julia","v_pedro"]){let r=t.echoes.get(a);if(r&&this.lookingAt([r.f.position.x,1.1,r.f.position.z],.45,9)){this.familyIntro();break}}if(e.power&&!e.familyIntro&&(this._fiT=(this._fiT||0)+n,this._fiT>100&&this.familyIntro()),e.armClownScare&&!t.player.hidden&&this._wasHidden&&this.clownExitScare(),this._wasHidden=!!t.player.hidden,e.armClownScare&&this.t-(e.armClownAt||0)>25&&(e.armClownScare=!1),this.fridgeClown){let a=t.clown.model.position;(this.lookingAt([a.x,1.7,a.z],.5,3)||this.t-this.fridgeClown>6)&&this.fridgeClownReveal()}let i=t.esquecido;if(i.active&&!i.calm){let a=Math.hypot(i.pos.x-t.player.pos.x,i.pos.z-t.player.pos.z);this.has("caixinha")&&a<4&&this.lookingAt([i.pos.x,1.3,i.pos.z],.6,4.5)&&(this.customPrompt="Tocar a caixinha de m\xFAsica",this._customAction=()=>this.playMusicBox());let r=t.echoes.get("m_pai");r&&(r.f.position.set(i.pos.x,0,i.pos.z),r.f.rotation.y=i.model.rotation.y)}if(!e.liliFollow&&this.zones&&this.zones.includes("sala")&&e.power&&(this._liliT=(this._liliT||12)-n,this._liliT<0&&(this._liliT=20+Math.random()*15,C.play("meow",{pos:[.3,.3,3.68],v:.35,pitch:700}),e.liliHint=!0)),t.phone.radioOn&&e.juliaFound&&!e.radioBroadcast&&(e.radioBroadcast=!0,this.after(3,()=>this.radioBroadcast())),e.hunt3Done&&!e.extraRelocked&&!(this.zones||[]).includes("extra")){e.extraRelocked=!0;let a=t.world.doors.get("porta_extra");a&&(a.close(),a.locked=!0)}let s=t.entity;s.hunt&&this.huntId===3&&!e.hunt3Done&&(this.zones||[]).includes("extra")&&Math.hypot(s.pos.x-12.21,s.pos.z-7.2)<1.6&&this.entityBlocked()},familyIntro(){let n=this.F;n.familyIntro||(n.familyIntro=!0,n.showSim=!0,this.progress(),this.run(async t=>{await t.say("{rafa}","*Eles... est\xE3o no v\xEDdeo. Parados. Como se fossem parte da casa.*",{dur:3.4}),await t.wait(1),this.msg("Viu? Eles est\xE3o presos no v\xEDdeo."),await t.wait(1.4),this.msg("Se a casa ficar IGUAL ao v\xEDdeo, eles voltam."),await t.wait(1.4),this.msg(`A casa est\xE1 ${Math.round(this.sim())}% igual. Conserte o que estiver diferente. Ache eles.`),this.objective("family"),this.F.liliHint=!0,this.toast(`Dica: pelo v\xEDdeo, o que est\xE1 diferente ganha uma etiqueta vermelha.
Pela c\xE2mera (sem v\xEDdeo) aparecem PRESEN\xC7AS.`,5)}))},familyHints(){let n=this.F;return n.juliaFound?n.momFound?n.dadFound?n.pedroFound?["Todos voltaram pro espelho da casa. Algo mudou no corredor."]:[n.hasMomKeys?"O chaveiro da m\xE3e abre o quarto dos meninos.":"O quarto dos meninos est\xE1 trancado. A m\xE3e tem as chaves reserva.",'O notebook do {wendel} pede senha. A dica fala dos "donos da casa".',"A senha \xE9 o nome dos dois gatos, juntos, sem espa\xE7o (ex.: "+Qn(ue.bento+ue.lili)+")."]:["O pai est\xE1 no quarto dos pais, mas n\xE3o te reconhece. Se ele te alcan\xE7ar, te empurra pra fora.","Leia o bilhete da caixinha de m\xFAsica (na mochila, I). A m\xE3e explica o que faz ele lembrar.","Chegue perto do pai com a caixinha de m\xFAsica, olhe pra ele e aperte E."]:["Na cozinha, levante o celular no modo C\xC2MERA (n\xE3o o v\xEDdeo). Tem uma presen\xE7a repetindo alguma coisa.","A m\xE3e faz sempre a mesma rotina: um arm\xE1rio de cima, o fog\xE3o, a geladeira. Repita na mesma ordem.","Abra o arm\xE1rio de cima em frente \xE0 porta da cozinha, acenda o fog\xE3o, abra o congelador. Pegue o gelo e use o micro-ondas."]:["A {julia} aparece no v\xEDdeo sentada na cama do quarto roxo. O v\xEDdeo n\xE3o \xE9 o \xFAnico jeito de ver o que a casa lembra: espelhos tamb\xE9m mostram.","Olhe o espelho redondo da penteadeira. Compare a c\xF4moda do reflexo com a c\xF4moda de verdade.","No reflexo, as gavetas 1 e 4 (de cima para baixo) est\xE3o abertas e a 2 e a 3 fechadas. Deixe a c\xF4moda igual e abra o guarda-roupa branco."]},hunt1(){let n=this.F,t=this.g;n.hunt1Started||n.hunt1Done||(t.checkpoint("a2_hunt1",!0),n.hunt1Started=!0,this.huntId=1,this.run(async e=>{C.play("honk",{pos:[5.4,1.4,8.9],v:.8,rev:.8}),t.setLight("corredor1",!0,2.5),t.setLight("corredor2",!0,2.5),await e.wait(1.6),this.msg("ESCONDA-SE.",{glitch:!0}),this.toast(`ESCONDA-SE!
Guarda-roupas e embaixo das camas (E).
Correr faz barulho. Agachar (C) \xE9 silencioso.`,6),await e.wait(3);let i=t.world.doors.get("porta_pais");i&&(i.locked=!1,i.openNow(!1,{speed:.5})),C.play("creak",{pos:[t.layout.P,1.5,7.2],dur:2.5,v:1.2}),await e.wait(1.5),t.entity.startHunt({from:"pp1",duration:38,exit:"pp1",strength:.95,patrol:["c3","c2","c1","c0","s_cd","s3","s2","c2","r1","m1","c1"],onEnd:()=>this.hunt1End()})}))},hunt1End(){let n=this.F,t=this.g;n.hunt1Done=!0,C.music(null),this.rule("ouve","Ele ouve. Correr, bater porta e fazer barulho chamam ele. Agachada eu quase n\xE3o fa\xE7o som."),this.rule("buzina","Antes dele aparecer, algu\xE9m buzina. Uma buzina de palha\xE7o."),this.rule("esconde","Escondida, ele n\xE3o me v\xEA \u2014 a n\xE3o ser que me veja entrando. Se chegar muito perto, prender a respira\xE7\xE3o (ESPA\xC7O)."),t.player.hidden?(n.armClownScare=!0,n.armClownAt=this.t):this.after(2,()=>{t.clown.show(t.layout.P-.6,7.2,-Math.PI/2,"ec"),this.after(1.2,()=>{t.setLight("corredor2",!0,1.2),this.after(.6,()=>t.clown.hide())})}),this.after(6,()=>{this.msg("Esse palha\xE7o est\xE1 com ele. N\xE3o confie."),t.checkpoint("a2_after_hunt1")})},clownExitScare(){let n=this.g,t=this.F;t.armClownScare=!1;let e=n.player.pos,i=new I(-Math.sin(n.player.yaw),0,-Math.cos(n.player.yaw));n.clown.show(e.x+i.x*.95,e.z+i.z*.95,n.player.yaw+Math.PI,"ec");let s=te.scare;n.clown.honk(s===2?1.3:.7),s>0&&(C.play("stinger_small",{v:s===2?1:.5}),n.player.shake(s===2?.7:.3),n.ui.flash(s===2?.35:.15,.3)),this.after(1.3,()=>{n.lightMul=0,this.after(.35,()=>{n.clown.hide(),n.lightMul=1})})},mirrorJulia(){let n=this.F;if(n.juliaFound){this.say0("","No espelho, a cama est\xE1 vazia. A {julia} n\xE3o est\xE1 mais l\xE1.");return}n.sawMirrorJulia=!0,this.run(async t=>{await t.say("{rafa}","*No espelho, a {julia} t\xE1 sentada na cama. Olhando pra mim.*",{dur:3.2}),await t.say("{rafa}","*E a c\xF4moda do reflexo... t\xE1 com gavetas abertas. A de verdade n\xE3o.*",{dur:3.4}),this.note("espelho_redondo","Espelho redondo",`No reflexo: a {julia} sentada na cama.
A c\xF4moda do reflexo tem gavetas abertas e fechadas num padr\xE3o.
(Olhe de novo para conferir.)`,{show:!1,where:"quarto roxo"})})},checkDresser(){let n=this.F,t=this.g;if(n.act!==2||n.wardrobeRoxoUnlocked)return;let e=t.world.get("dresser_drawers");if(!e)return;let i=[!0,!1,!1,!0];if(e.every((s,a)=>s.isOpen===i[a])){n.wardrobeRoxoUnlocked=!0,this.progress(),C.play("unlock",{pos:[6.72,1,4]}),this.after(.8,()=>{C.play("chime",{notes:[64,67,71],v:.5}),this.say0("{rafa}","*Clique. O guarda-roupa destravou sozinho.*")});let s=t.echoes.get("m_julia");s&&(s.opts.pointAt={x:6.72,z:3.8},s.anim="point")}},prompt_wardrobe_roxo(){let n=this.F;if(n.act===2&&n.wardrobeRoxoUnlocked&&!n.gotJuliaItems)return"Abrir o guarda-roupa"},do_wardrobe_roxo(){let n=this.F,t=this.g;return n.act===2&&n.wardrobeRoxoUnlocked&&!n.gotJuliaItems?(this.run(async e=>{let i=t.world.get("wr_roxo");i.forEach(s=>{s.target=1}),C.play("door_open",{pos:[6.72,1,4],creakChance:1}),n.wardrobeRoxoOpen=!0,t.applyWorld(),await e.wait(.8),n.gotJuliaItems=!0,this.give("fone",!0),this.give("caixinha",!0),t.phone.apps.radio=!0,t.applyWorld(),this.toast(`Pegou: Fone de ouvido da {julia} e Caixinha de m\xFAsica
R: r\xE1dio \u2014 o chiado aumenta quando ELE est\xE1 perto.`,5),await e.wait(1.5),this.note("caixinha","Bilhete na caixinha de m\xFAsica",`[[Quando o seu pai esquecer da gente, toca isso pra ele. \xC9 a m\xFAsica que faz ele lembrar. Ele sempre volta.]]

\u2014 M\xE3e`,{where:"guarda-roupa do quarto roxo"}),await e.wait(.5),await this.juliaFound(e),i.forEach(s=>{s.target=0})}),!0):n.act===2&&!n.wardrobeRoxoUnlocked&&!t.entity.hunt?(C.play("locked",{pos:[6.72,1,4]}),this.say0("{rafa}","*Emperrado. Como se estivesse preso por dentro.*"),!0):!1},async juliaFound(n){let t=this.g,e=this.F;e.juliaFound=!0,t.echoes.remove("v_julia");let i=t.echoes.get("m_julia");i&&(i.anim="look"),await n.say("{julia}","*(no reflexo, sussurrando)* {rafa}... n\xE3o deixa ele lembrar da casa.",{dur:3.6,tts:"julia"}),t.echoes.fadeOut("m_julia",2.5),C.play("chime",{v:.6}),this.toast(`{julia}: encontrada (${this.familyCount()}/4) \xB7 casa.mp4: ${Math.round(this.sim())}% igual`,3.5),this.objective("family"),this.after(4,()=>this.familyComplaint()),t.checkpoint("a2_julia"),this.checkFamilyDone()},familyComplaint(){let n=this.familyCount(),t=["","A porcentagem caiu. O que voc\xEA fez?","Pare de mexer nos espelhos. Conserte a casa.","{rafaela}. Estou avisando.",""];t[n]&&this.msg(t[n])},radioBroadcast(){this.run(async n=>{this.radioExtra=.5,await n.say("R\xC1DIO","...kssshh... aten\xE7\xE3o, moradores... o visitante foi visto... usando a voz de familiares...",{dur:4.4,kind:"house",tts:"tv"}),await n.say("R\xC1DIO","...n\xE3o respondam mensagens... recebidas sem sinal... repetindo: sem sinal...",{dur:4.2,kind:"house"}),await n.say("R\xC1DIO","...n\xE3o deixem a casa... kssshh... igual...",{dur:3.2,kind:"house"}),this.radioExtra=0,this.F.heardRadio=!0,await n.wait(2),this.msg("Desliga esse r\xE1dio. Ele est\xE1 com ELE.")})},startMomRoutine(){let n=this.g;n.echoes.get("mae_route")||n.echoes.add("mae_route",{x:-1.4,z:6.4,spec:"k",hair:"bun",color:16769216,alpha:.75,caption:"A m\xE3e, repetindo uma rotina.",route:[{x:-2.3,z:5.85,wait:2.4,yaw:-Math.PI/2,act:"cab"},{x:-2.3,z:5.2,wait:2.4,yaw:-Math.PI/2,act:"stove"},{x:-.55,z:5.25,wait:2.4,yaw:Math.PI,act:"freezer"},{x:-1.4,z:6.5,wait:2}]})},onEchoAct(n,t){if(n!=="mae_route")return;let e=this.g;!e.phone.raised||e.phone.mode!=="camera"||(t==="cab"&&C.play("door_open",{pos:[-2.7,1.9,5.85],vol:.25,creakChance:0}),t==="stove"&&C.play("stove",{pos:[-2.7,1,5.2],vol:.35}),t==="freezer"&&C.play("fridge_open",{pos:[-.55,1.4,4.8],vol:.35}),this.F.sawRoutine||(this.F.sawRoutine=!0,this.after(1,()=>this.say0("{rafa}","*\xC9 a m\xE3e... s\xF3 aparece na c\xE2mera. Ela faz sempre a mesma coisa. Na mesma ordem.*"))))},routineStep(n){let t=this.F,e=this.g;if(t.act!==2||t.momFound||t.iceVisible||t.hasIce||t.hasMomKeys)return;let i=["cab","stove","freezer"];this.routine=this.routine||[];let s=i[this.routine.length];if(n===s)this.routine.push(n),C.play("musicbox_note",{f:[523,659,784][this.routine.length-1],v:.12}),this.routine.length===3&&(t.iceVisible=!0,this.progress(),e.applyWorld(),this.after(.8,()=>this.say0("{rafa}","*Tem um bloco de gelo no congelador. Com um chaveiro dentro.*")));else if(this.routine.length>0){this.routine=[];let a=e.world.get("cabinets");a&&a.forEach(r=>r.set(0)),C.play("door_slam",{pos:[-2.7,1.9,6.1],vol:.7}),C.play("whisper",{pos:[-1.5,1.6,6],v:.8}),this.say0("{rafa}","*As portas bateram sozinhas. N\xE3o era essa a ordem.*")}},do_cab_4(){let n=this.g.world.get("cabinets")[3];return n&&n.target<.5&&this.routineStep("cab"),!1},do_cab_1(){let n=this.g.world.get("cabinets")[0];return n&&n.target<.5&&this.routineStep("x"),!1},do_cab_2(){let n=this.g.world.get("cabinets")[1];return n&&n.target<.5&&this.routineStep("x"),!1},do_cab_3(){let n=this.g.world.get("cabinets")[2];return n&&n.target<.5&&this.routineStep("x"),!1},do_cab_5(){let n=this.g.world.get("cabinets")[4];return n&&n.target<.5&&this.routineStep("x"),!1},do_cab_6(){let n=this.g.world.get("cabinets")[5];return n&&n.target<.5&&this.routineStep("x"),!1},prompt_stove(){return this.F.act===2&&!this.F.momFound?"Acender o fog\xE3o":"Fog\xE3o"},do_stove(){let n=this.g;if(!(this.F.act===2&&!this.F.momFound)){this.say0("","O fog\xE3o. Ainda tem cheiro de caf\xE9.");return}C.play("stove",{pos:[-2.7,1,5.2]});let t=n.world.get("stove_flame");t&&(t.visible=!0,this.after(5,()=>{t.visible=!1})),this.routineStep("stove")},do_freezer_door(){let n=this.F,t=this.g,e=t.world.get("freezer_door");return e&&e.target<.5?(C.play("fridge_open",{pos:[-.55,1.4,4.8]}),this.routineStep("freezer"),t.setLight("fridge_light",!0)):(t.setLight("fridge_light",!1),n.armFridgeClown&&(n.armFridgeClown=!1,this.after(.3,()=>this.fridgeClownStart()))),!1},do_fridge_door(){let n=this.g.world.get("fridge_door");return n&&n.target<.5?(C.play("fridge_open",{pos:[-.55,.8,4.8]}),this.g.setLight("fridge_light",!0)):this.g.setLight("fridge_light",!1),!1},prompt_fridge_note(){return"Ler o bilhete"},do_fridge_note(){this.note("bilhete_geladeira","Bilhete na geladeira",`[[{rafa}: ra\xE7\xE3o dos gatos de manh\xE3 e de noite. A {lili} s\xF3 come se ningu\xE9m estiver olhando.
N\xE3o mexe na gaveta do rack, \xE9 das fotos antigas.
Te amo. \u2014 M\xE3e]]`,{where:"geladeira"})},prompt_ice_block(){return this.F.iceVisible&&!this.F.hasIce?"Pegar o bloco de gelo":null},do_ice_block(){let n=this.F,t=this.g;n.hasIce=!0,this.give("gelo"),C.play("ice"),t.applyWorld(),this.progress(),n.armFridgeClown=!0,t.checkpoint("a2_ice",!0),n.armFridgeClown=!0,this.after(8,()=>{n.armFridgeClown&&(n.armFridgeClown=!1,this.fridgeClownStart())})},fridgeClownStart(){let n=this.g,t=n.player.pos,e=new I(Math.sin(n.player.yaw),0,Math.cos(n.player.yaw)),i=t.x+e.x*1,s=t.z+e.z*1;i=Math.max(-2.3,Math.min(-.3,i)),s=Math.max(4.9,Math.min(7.6,s)),n.clown.show(i,s,Math.atan2(t.x-i,t.z-s),"ec"),C.play("honk",{pos:[i,1.4,s],v:.35,single:!0}),this.fridgeClown=this.t},fridgeClownReveal(){let n=this.g;this.fridgeClown=null;let t=te.scare;n.clown.honk(t===2?1.3:.7),t>0&&(C.play("stinger_small",{v:t===2?1:.5}),n.player.shake(t===2?.8:.3),n.ui.flash(t===2?.3:.12,.3)),this.after(1.2,()=>{n.lightMul=0,this.after(.4,()=>{n.clown.hide(),n.lightMul=1,this.startHunt2()})})},startHunt2(){let n=this.F,t=this.g;if(!(n.hunt2Started&&t.entity.hunt))if(n.hunt2Started=!0,this.huntId=2,this.toast("Ele est\xE1 vindo. ESCONDA-SE.",3),n.invited){let e=t.world.doors.get("porta_entrada");e&&(e.locked=!1,e.openNow(!1,{slam:!0,speed:6})),t.entity.startHunt({from:"s_ent",duration:40,exit:"s_ent",strength:1,patrol:["k1","k2","k3","sv1","s2","s3","k0","s1"],onEnd:()=>this.hunt2End()})}else t.entity.startHunt({from:"c3",duration:45,exit:"c3",strength:1,patrol:["k1","k2","k3","sv1","s2","s3","k0","c1"],investigate:{x:-1.2,z:5.8},onEnd:()=>this.hunt2End()})},hunt2End(){let n=this.F,t=this.g;n.hunt2Done=!0,C.music(null);let e=t.world.doors.get("porta_entrada");e&&(e.close(),e.locked=!0),n.invited&&this.after(2,()=>this.say0("{rafa}","*Ele entrou pela porta da frente. ...Porque eu deixei.*")),this.after(4,()=>t.checkpoint("a2_hunt2"))},prompt_microwave(){return this.has("gelo")?"Descongelar o gelo no micro-ondas":"Micro-ondas"},do_microwave(){let n=this.F,t=this.g;if(!this.has("gelo")){this.say0("",n.act===1?"O micro-ondas marca 03:07.":"O rel\xF3gio do micro-ondas pisca 03:33, 03:33, 03:33.");return}this.run(async e=>{this.take("gelo"),C.play("microwave",{pos:[-1.3,1.05,4.32],dur:3.5}),t.noise(-1.3,4.3,7),await e.wait(4.5),this.give("chaves_mae"),n.hasMomKeys=!0,t.applyWorld(),this.progress(),await e.wait(.8),await this.momFound(e)})},async momFound(n){let t=this.g,e=this.F,i=t.echoes.get("mae_route");i&&(i.route=null,i.anim="look",i.f.position.set(-1.3,0,5),i.opts.spec="ekc",pe(i.f,"ekcv")),await n.say("M\xE3e","*(bem baixinho)* Filha... a chave reserva t\xE1 com voc\xEA agora.",{dur:3.4,tts:"mae",vol:.5}),await n.say("M\xE3e","*(bem baixinho)* Cuidado com o que voc\xEA conserta.",{dur:3,tts:"mae",vol:.5}),e.momFound=!0,t.echoes.remove("v_mae"),await t.echoes.fadeOut("mae_route",2.5),C.play("chime",{v:.6}),this.toast(`M\xE3e: encontrada (${this.familyCount()}/4) \xB7 casa.mp4: ${Math.round(this.sim())}% igual`,3.5),this.objective("family"),this.after(3,()=>this.familyComplaint()),t.checkpoint("a2_mae"),this.checkFamilyDone()},prompt_rack_drawer(){return this.has("chaves_mae")&&!this.F.rackOpened?"Abrir a gaveta com a chave pequena":void 0},do_rack_drawer(){let n=this.F,t=this.g;if(!this.has("chaves_mae")||n.rackOpened)return!1;n.rackOpened=!0;let e=t.world.get("rack_drawer_obj");return e&&(e.locked=!1,e.set(1)),C.play("unlock",{pos:[.4,.33,3.1]}),C.play("drawer",{pos:[.4,.33,3.1],delay:.3}),this.give("foto_festa"),n.clownLooked=!0,t.applyWorld(),this.note("cartao_festa","Cart\xE3o guardado com a foto",`[[Tique-Taque \u2014 o palha\xE7o que para o tempo.
Contratado pra festa de 5 anos da {rafa}.
Ela chorou quando ele foi embora. Ele disse que ia lembrar dela pra sempre.]]

(A letra \xE9 da m\xE3e. Embaixo, com outra letra, torta: "EU LEMBRO.")`,{where:"gaveta do rack"}),!0},enter_pais(){let n=this.F,t=this.g;if(n.act!==2||!n.power||n.dadFound||t.esquecido.active)return;let e=t.layout.P;t.esquecido.spawn(e+2.3,8.7),t.esquecido.model.rotation.y=Math.PI,t.echoes.add("m_pai",{x:e+2.3,z:8.7,spec:"m",hat:!0,color:16770760,alpha:.8,h:1.78}),t.flags.fanPais=2.5,C.play("creak",{pos:[e+1.8,2.4,7.2],dur:2,v:.8}),n.metEsquecido||(n.metEsquecido=!0,this.after(1.5,()=>this.say0("{rafa}","*Pai...? Por que voc\xEA t\xE1 t\xE3o escuro?*")))},onEsquecidoSpeak(){let n=["Quem \xE9 voc\xEA?","Essa casa n\xE3o \xE9 minha.","Eu esqueci alguma coisa... eu esqueci algu\xE9m.","Sai do meu quarto.","Tinha uma m\xFAsica... como era a m\xFAsica?"];this._esqI=((this._esqI||0)+1)%n.length,this.voice(n[this._esqI],{tts:"pai"}),this.g.ui.say("O pai (?)",n[this._esqI],2.6,"enemy")},onEsquecidoTouch(){let n=this.g,t=this.F;this.run(async e=>{this.cut(!0),C.play("thud",{v:.9}),C.play("gasp"),n.player.shake(.8),n.ui.flash(.3,.3,"#200"),await n.ui.fade(1,.4);let i=n.layout.P;n.player.teleport(i-.8,7.2,Math.PI/2,0);let s=n.world.doors.get("porta_pais");s&&s.set(0),n.esquecido.pos.set(i+2.3,0,8.7),n.esquecido.pushed=!1,await e.wait(.6),await n.ui.fade(0,.8),this.cut(!1),await e.say("{rafa}","*Ele me empurrou pra fora. Ele n\xE3o me reconheceu.*",{dur:3}),t.pushedOnce||(t.pushedOnce=!0,this.toast(this.has("caixinha")?"Voc\xEA tem a caixinha de m\xFAsica...":"Talvez exista alguma coisa que fa\xE7a ele lembrar.",4))})},playMusicBox(){let n=this.g,t=this.F,e=n.esquecido;this.run(async i=>{this.cut(!0,{look:!0}),e.calm=!0;let s=C.musicBox(n.player.eye,1);await i.wait(3),await i.say("O pai","...essa m\xFAsica...",{dur:2.4,tts:"pai"}),await i.wait(1.5),await i.say("O pai","A {mae} colocava ela pra... {rafa}? Filha?",{dur:3.4,tts:"pai"}),await i.say("O pai","Eu tava esquecendo voc\xEAs. Tava esquecendo a nossa casa.",{dur:3.6,tts:"pai"}),await i.wait(Math.max(0,s-11)),e.model.traverse(a=>{a.material&&(a.material.transparent=!0)});for(let a=0;a<20;a++)e.model.traverse(r=>{r.material&&r.material.opacity!==void 0&&(r.material.opacity=Math.max(0,1-a/20))}),await i.wait(.08);e.hide(),n.echoes.fadeOut("m_pai",2),t.dadFound=!0,n.echoes.remove("v_pai"),n.flags.fanPais=0,n.applyWorld(),C.play("chime",{v:.6}),this.toast(`Pai: encontrado (${this.familyCount()}/4) \xB7 casa.mp4: ${Math.round(this.sim())}% igual`,3.5),this.rule("musica","A m\xFAsica da caixinha acalma quem esqueceu."),this.cut(!1),await i.wait(2.5),await i.say("{rafa}","*Tem alguma coisa escrita no espelho... s\xF3 no reflexo. Em vermelho.*",{dur:3.2}),this.msg("Ignore o espelho. \xC9 ele tentando te confundir."),this.objective("family"),n.checkpoint("a2_pai"),this.checkFamilyDone()})},prompt_hat(){},prompt_hat_floor(){return this.F.act>=3&&!this.F.hasDadKey?"Olhar dentro do chap\xE9u":"Chap\xE9u de palha"},do_hat_floor(){let n=this.F;if(n.act>=3&&!n.hasDadKey){n.hasDadKey=!0,this.give("chave_pai"),this.g.applyWorld(),this.say0("{rafa}","*A chave do pai. Tava escondida no chap\xE9u.*");return}this.say0("","O chap\xE9u de palha do pai. Cheira a chuva, e a uma noite muito longa.")},prompt_porta_meninos(){if(this.F.act===2&&!this.F.hasMomKeys)return"Porta trancada"},prompt_laptop(){let n=this.F;return n.laptopUnlocked?n.act===2&&!n.webcamDone?"Mexer no notebook":"Notebook":"Ligar o notebook do {wendel}"},do_laptop(){let n=this.F,t=this.g;if(!n.laptopUnlocked){this.run(async e=>{let i=0,s=ue.bento,a=ue.lili,r=[s+a,a+s,s+"e"+a,a+"e"+s].map(Qn),o=await t.ui.keypad({title:"Notebook do {wendel}",hint:'Dica de senha: "os donos da casa" \u{1F431}\u{1F431}',mode:"text",check:c=>r.includes(Qn(c))?!0:(i++,i>=3?"Senha incorreta. (Quem manda de verdade nesta casa? Dois nomes, juntos.)":"Senha incorreta.")});if(t.resumePointer(!0),o==null)return;n.laptopUnlocked=!0,this.progress(),C.play("record_beep");let l=t.world.get("laptop");l&&(l.screen.material=new Yt({color:1710618})),await this.showDesktop(),n.act===2&&this.webcamSequence()});return}if(n.act===2&&!n.webcamDone){this.webcamSequence();return}this.showDesktop()},async showDesktop(){this.F.laptopSeen=!0,await this.note("notebook","Notebook do {wendel}",`Papel de parede: preto, com uma faixa branca atravessada.

\u25B8 Upload conclu\xEDdo: casa.mp4 (2 min 11 s) \u2014 enviado ontem, 16:44

\u25B8 Conversa aberta com "desconhecido":
16:45  desconhecido: Recebido. Obrigado por me mostrar a casa.
16:45  desconhecido: Agora eu vou me lembrar dela.
16:46  desconhecido: Quantas pessoas moram a\xED?
16:46  {wendel}: seis kkkk oito contando os gatos
16:47  desconhecido: Vou conhecer todas.

\u25B8 projeto.txt
"gravar a casa inteira, todos os c\xF4modos. mandar o v\xEDdeo.
(ideia: fazer um jogo de terror pra {rafa} kkkk)"`,{style:"screen",where:"quarto dos meninos"})},webcamSequence(){let n=this.F,t=this.g;n.webcamDone||(n.webcamDone=!0,t.checkpoint("a2_laptop",!0),this.run(async e=>{let i=t.world.get("laptop"),s=t.cctvCam;s.position.set(7.78,1.02,4.3),s.lookAt(9.2,1.2,5.6);let a=new ze({uniforms:{tRT:{value:t.cctvRT.texture}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:"uniform sampler2D tRT; varying vec2 vUv; void main(){ vec3 c = texture2D(tRT, vUv).rgb * 2.4; float l = dot(c, vec3(0.3,0.59,0.11)); gl_FragColor = vec4(mix(c, vec3(l), 0.4), 1.0); }"}),r=i.screen.material;i.screen.material=a,t.cctvOn=!0,t.setLight("laptop_glow",!0),t.echoes.add("k_pedro",{x:9.9,z:4.9,yaw:-Math.PI/2,spec:"ck",hair:"short",sitting:!0,anim:"look",color:16769216,alpha:.8,h:1.7}),await e.say("{rafa}",'*Abriu a c\xE2mera sozinha. "AO VIVO".*',{dur:2.6}),await e.say("{rafa}","*...o {pedro} t\xE1 sentado na cama. Atr\xE1s de mim. S\xF3 na tela.*",{dur:3.2});let o=t.entity;o.show(8.71,6.55,Math.PI,"c"),C.play("swell",{dur:3,v:.4}),await e.wait(2),await e.say("{rafa}","*E tem mais algu\xE9m. Na porta.*",{dur:2.4});let l=t.player.yaw,c=0,h=!1;for(;c<8;){await e.wait(.1),c+=.1;let u=t.player.pos,f=Math.min(1,c/8);if(o.place(8.71+(u.x+.4-8.71)*f*.8,6.55+(u.z-6.55)*f*.8,Math.atan2(-(u.x-8.71),-(u.z-6.55))+Math.PI),Math.abs(si(l,t.player.yaw))>1.6){h=!0;break}}if(h)for(o.hide(),await e.say("{rafa}","*...n\xE3o tem ningu\xE9m.*",{dur:2}),await e.wait(1.5);!this.lookingAt([7.72,.95,4.3],.5,3);)await e.wait(.1);o.show(7.55,4.3,-Math.PI/2,"c"),o.model.position.y=-1.3,s.lookAt(7.4,1,4.3),s.position.set(7.85,1.02,4.3);let d=te.scare;d>0?(C.play("stinger",{v:d===2?.9:.45}),t.player.shake(d===2?1:.4),this.glitch=1):C.play("boom",{v:.5}),await e.wait(.9),this.glitch=0,o.hide(),t.cctvOn=!1,i.screen.material=r,t.setLight("laptop_glow",!1),t.echoes.remove("k_pedro"),this.startHunt3(!1)}))},startHunt3(n){let t=this.F,e=this.g;this.huntId=3,e.setLight("meninos",!1),e.setLight("corredor2",!1,0),e.setLight("corredor1",!0,3);let i=e.world.doors.get("porta_extra");i&&(i.locked=!1,i.openNow(!1,{speed:1.2})),e.setLight("extra",!0);let s=e.fixture("extra");s&&(s.intensity=3),this.toast("CORRA! A porta que n\xE3o existe se abriu!",3.5),e.entity.startHunt({x:n?4.6:8.71,z:n?7.2:6.2,duration:60,exit:"c0",strength:.95,patrol:["c2","c4","c1","c3"]}),n||(e.entity.state="chase",e.entity.lastSeen={x:e.player.pos.x,z:e.player.pos.z},C.music("chase")),e.entity.hunt.onEnd=()=>this.hunt3End()},onEntityBlocked(n){this.huntId===3&&!this.F.hunt3Done&&n>.6&&this.entityBlocked()},entityBlocked(){let n=this.F,t=this.g;this._blocked||(this._blocked=!0,this.run(async e=>{let i=t.entity;i.state="static",i.place(12.21,7.25,Math.PI),C.play("scream",{pos:i.pos,v:.9,dur:2});for(let s=0;s<6;s++)C.play("crack",{pos:[12.2,1.2,7.6]}),C.play("knock",{pos:[12.2,1.2,7.65],n:1,v:1}),await e.wait(.5);await e.say("{rafa}","*Ele parou. Ele n\xE3o consegue passar dessa porta.*",{dur:3}),i.endHunt(),i.state="leave",await e.wait(2),this.hunt3End()}))},hunt3End(){let n=this.F,t=this.g;n.hunt3Done||(n.hunt3Done=!0,this._blocked=!1,C.music(null),t.entity.hide(),this.rule("porta","Ele n\xE3o atravessa a porta que n\xE3o existe. Ele n\xE3o entra no que a casa fez."),this.run(async e=>{await e.wait(2.5),this.msg("Ele n\xE3o conhece essa porta porque ela n\xE3o est\xE1 no v\xEDdeo."),await e.wait(1.6),this.msg("\xC9 por isso que a casa precisa ficar igual. Para ele n\xE3o ter onde se esconder de voc\xEA."),await e.wait(2),t.echoes.add("k_pedro2",{x:12.2,z:8.1,yaw:Math.PI,spec:"ek",hair:"short",anim:"look",color:16769216,alpha:.7,h:1.7}),await e.say("{pedro}","*(de dentro da porta)* Ele n\xE3o entra nas portas que a casa faz, {rafa}. S\xF3 nas que ele conhece.",{dur:4}),n.pedroFound=!0,t.echoes.remove("v_pedro"),await t.echoes.fadeOut("k_pedro2",2.5),C.play("chime",{v:.6}),this.toast(`{pedro}: encontrado (${this.familyCount()}/4) \xB7 casa.mp4: ${Math.round(this.sim())}% igual`,3.5),this.objective("family"),this.after(3,()=>this.familyComplaint()),t.checkpoint("a2_pedro"),this.checkFamilyDone()}))},prompt_rack_door(){let n=this.F;return n.act===2&&!n.liliFollow?n.sawLiliRack?this.has("racao")?"Chamar a {lili} com a ra\xE7\xE3o":"Chamar a {lili}":"Abrir a portinha do rack":"Portinha do rack"},do_rack_door(){let n=this.F,t=this.g;if(!(n.act===2&&!n.liliFollow)){this.say0("","S\xF3 cabos e controles velhos.");return}if(!n.sawLiliRack){n.sawLiliRack=!0,t.cats.lili.hiss(),this.say0("{rafa}","*Dois olhos brilhando l\xE1 no fundo. A {lili}! Ela t\xE1 tremendo.*");return}if(!this.has("racao")){t.cats.lili.hiss(),this.say0("{rafa}","*Ela n\xE3o sai. Talvez com comida.*");return}n.liliFollow=!0,C.play("ice",{pos:[.4,.2,3.7]});let e=t.cats.lili;e.place(.8,3.7,Math.PI/2),e.meow(.9),e.mode="follow",this.after(2,()=>this.say0("{rafa}","*Vem, {lili}. Fica comigo.*")),this.rule("lili","A {lili} fica comigo. Ela sibila e arrepia quando ele est\xE1 perto \u2014 mesmo quando eu n\xE3o vejo nada."),t.checkpoint("a2_lili",!0)},prompt_flag(){return"Bandeira (tem um bilhete)"},do_flag(){this.note("bilhete_bandeira","Bilhete preso na bandeira",`[[senha da gaveta: o ano em que o Gigante nasceu.
voc\xEA sabe, {rafa} \u{1F5A4}\u{1F90D}
\u2014 W]]`,{where:"quarto dos meninos"})},prompt_vasco_drawer(){return this.F.vascoOpen?"Gaveta (aberta)":"Gaveta com cadeado"},do_vasco_drawer(){let n=this.F,t=this.g;if(n.vascoOpen){this.say0("","A gaveta est\xE1 vazia agora. S\xF3 um cheiro de camisa guardada.");return}this.run(async e=>{let i=await t.ui.keypad({title:"Cadeado de 4 d\xEDgitos",mode:"wheels",wheels:[0,1,2,3].map(()=>({values:["0","1","2","3","4","5","6","7","8","9"]})),hint:"",check:a=>a==="1898"?!0:"N\xE3o abriu."});if(t.resumePointer(!0),!i)return;n.vascoOpen=!0,C.play("unlock");let s=t.world.get("vasco_lock");s&&(s.visible=!1),this.give("powerbank"),await this.note("vasco","Dentro da gaveta",`Uma bateria port\xE1til carregada, e um papel dobrado:

[[Camisa preta, faixa branca atravessada no peito.
Quem veste essa camisa n\xE3o desiste no meio do jogo.
Nunca tira a sua, {rafa}. D\xE1 sorte.
\u2014 W \u{1F5A4}\u{1F90D}]]`,{where:"gaveta do quarto dos meninos"}),this.toast("Segredo encontrado: Gigante da Colina",3.5),n.secretVasco=!0})},prompt_chair_open(){return this.F.act===2&&!this.F.d_cadeira?"Fechar a cadeira e encostar (como no v\xEDdeo)":null},do_chair_open(){this.F.d_cadeira=!0,C.play("thud",{v:.5}),this.g.applyWorld(),this.onFix("cadeira"),this.after(1.5,()=>this.msg("Isso."))},prompt_towel_mirror(){return this.F.act===2&&!this.F.d_toalha?"Tirar a toalha do espelho (como no v\xEDdeo)":null},do_towel_mirror(){this.F.d_toalha=!0,C.play("page"),this.g.applyWorld(),this.onFix("toalha"),this.after(1.5,()=>this.msg("Isso."))},checkFamilyDone(){let n=this.F,t=this.g;this.familyCount()<4||n.familyDone||(n.familyDone=!0,this.run(async e=>{await e.wait(4),this.phase="a2_door",C.play("unlock",{pos:[12.2,1,7.7],vol:1.2}),await e.wait(1),this.doorPhaseAmbience(),this.msg(`A casa est\xE1 ${Math.round(this.sim())}% igual. Estava quase.`),await e.wait(1.8),this.msg("O que voc\xEA fez, {rafaela}?"),await e.wait(1.5),this.msg("N\xC3O des\xE7a. Conserte a casa.",{glitch:!0}),this.objective("door"),t.checkpoint("a2_door")}))},doorPhaseAmbience(){let n=this.g;n.setLight("extra",!0);let t=n.fixture("extra");t&&(t.intensity=2.5),this._partyLoop||(this._partyLoop=C.loop("party",{pos:[12.2,.5,8.6],vol:.6}))},prompt_porta_extra2(){}};function uf(n){let t=n.g.world.get("dresser_drawers");t&&t.forEach(e=>{let i=e.onChange;e.onChange=s=>{i&&i(s),n.after(.4,()=>n.checkDresser())}})}var df=["OI, {RAFA}.","VOC\xCA CRESCEU.","LEMBRA DE MIM? TIQUE-TAQUE. SUA FESTA DE 5 ANOS.","EU SOU A CASA. ESSE FOI O \xDANICO ROSTO QUE EU ACHEI PRA FALAR COM VOC\xCA.","EU ESCONDI SUA FAM\xCDLIA AQUI, NA MINHA MEM\xD3RIA. ELE N\xC3O ENTRA AQUI.","TUDO QUE EU MUDEI NA CASA ERA UMA PORTA TRANCADA PRA ELE.","O {wendel} N\xC3O TE MANDOU NENHUMA MENSAGEM.","OLHA O SEU CELULAR."],ff=["ELE PRECISA QUE A CASA FIQUE IGUAL AO V\xCDDEO PRA MORAR NELA. NO LUGAR DE VOC\xCAS.","ME AJUDA. DEIXA A CASA DIFERENTE. TR\xCAS COISAS QUE S\xD3 A GENTE SABE.","O QUADRO DE CABE\xC7A PRA BAIXO. O SEU NOME NO ESPELHO. A FAM\xCDLIA NO PORTA-CHAVES.","VAI, {RAFA}. EU BUZINO QUANDO ELE CHEGAR PERTO."],pf={prompt_porta_extra(){let n=this.F;if(this.phase==="a2_door"&&!n.extraOpened)return this.has("chave_velha")?"Abrir com a chave velha":"A porta que n\xE3o existe (precisa de uma chave)";if(n.act===1||n.act===2&&!n.extraUnlocked&&this.phase!=="a2_door")return this.has("chave_velha")?"Tentar a chave velha":"Abrir"},do_porta_extra(){let n=this.F,t=this.g,e=t.world.doors.get("porta_extra");return this.phase==="a2_door"&&!n.extraOpened?this.has("chave_velha")?(n.extraOpened=!0,n.extraUnlocked=!0,C.play("unlock",{pos:e.center}),e.locked=!1,e.openNow(!0,{speed:.8}),n.stairsOpen=!0,n.basementBuilt||(n.basementBuilt=!0,nl(t.world,n),this.setupLights()),t.applyWorld(),this.objective("descend"),this.after(1.2,()=>this.say0("{rafa}","*Uma escada. A gente mora num apartamento. N\xE3o existe escada aqui.*")),t.checkpoint("a2_opened",!0),!0):(C.play("locked",{pos:e.center}),this.say0("{rafa}","*Precisa de uma chave velha. O porta-chaves da entrada tinha uma chave estranha...*"),!0):n.extraUnlocked||n.act>=3?!1:(C.play("locked",{pos:e.center}),this.has("chave_velha")?(C.play("unlock",{pos:e.center,vol:.6}),this.say0("{rafa}","*A chave gira... mas alguma coisa do outro lado segura a ma\xE7aneta.*")):this.say0("{rafa}","*A ma\xE7aneta n\xE3o gira. Parece de mentira.*"),n.act===1&&!n.extraHeld&&(n.extraHeld=!0,this.after(1.5,()=>C.play("knock",{pos:[12.2,1.2,8.1],n:2,gap:.9,v:.7}))),!0)},enter_descida(){let n=this.F,t=this.g;this._partyLoop&&(this._partyLoop.stop(1),this._partyLoop=null),n.descended?n.act>=3&&C.music("memory"):(n.descended=!0,this.phase="a3_basement",t.stopAmbience(),C.music("memory"))},enter_subida(){let n=this.F;C.music(null),n.revealDone&&!n.act3Started&&this.startAct3Up()},enter_porao(){let n=this.F,t=this.g;C.music("memory"),this._nowhere&&(this._nowhere=!1),!n.basementIntro&&(n.basementIntro=!0,this.setupBasementActors(),this.run(async e=>{await e.wait(1.2),await e.say("{rafa}","*A sala... de quando eu era pequena. A parede era amarela.*",{dur:3.2}),await e.say("{rafa}","*A minha festa. Parada. Como uma foto que d\xE1 pra entrar.*",{dur:3.2}),await e.wait(1.5),await e.say("{rafa}","*M\xE3e? Pai? ...Eles est\xE3o aqui. Todos. Quietos.*",{dur:3}),this.objective("clown"),t.checkpoint("a3_basement",!0)}))},enter_horanenhuma(){let n=this.F;this._nowhere=!0,C.music("nowhere"),n.nowhereIntro||(n.nowhereIntro=!0,this.after(1.5,()=>this.say0("???","*Chegou cedo, ou tarde demais? Tanto faz. Aqui \xE9 a Hora Nenhuma. O tempo descansa aqui.*",4.5)))},prompt_egg_watch(){return this.has("relogio_ovo")?null:"Pegar o rel\xF3gio"},do_egg_watch(){let n=this.F,t=this.g;if(this.has("relogio_ovo"))return;this.give("relogio_ovo"),n.secretChrono=!0;let e=t.world.get("egg_watch");e&&(e.visible=!1),C.play("chime",{notes:[62,66,69,74,78],v:.5}),this.run(async i=>{await i.say("???","*Leva. Um dia voc\xEA vai precisar desfazer um momento. S\xF3 um.*",{dur:3.6}),this.toast("Segredo encontrado: A Hora Nenhuma",3.5)})},setupBasementActors(){let n=this.g,t=this.F;n.echoes.clear();let e=16766624,i=(s,a)=>n.echoes.add(s,{spec:"ec",color:e,alpha:.38,...a});i("b_mae",{x:Wt+13.9,z:15.2,y:Zt,yaw:-Math.PI/2,hair:"bun",sitting:!0}),i("b_pai",{x:Wt+13.2,z:17.3,y:Zt,yaw:-Math.PI/2-.4,hat:!0,h:1.78}),i("b_julia",{x:Wt+13.9,z:16.1,y:Zt,yaw:-Math.PI/2,hair:"long",sitting:!0,h:1.6}),i("b_pedro",{x:Wt+11.3,z:17.4,y:Zt,yaw:Math.PI/2,hair:"short",h:1.6}),i("b_wendel",{x:Wt+11,z:14.7,y:Zt,yaw:Math.PI/2+.3,hair:"short",h:1.72,anim:"wave"}),i("b_rafa5",{x:Wt+12,z:15.45,y:Zt,yaw:.2,hair:"curly",h:1.05,alpha:.6});for(let s=0;s<4;s++)i("b_kid"+s,{x:Wt+11.2+s*.7,z:18.6+s%2*.4,y:Zt,yaw:Math.PI,h:1+s%2*.15,alpha:.3});for(let s of n.echoes.list.values())s.f.position.y=Zt;t.revealDone,n.clown.show(Wt+12.9,16.95,0,"ec",!0),n.clown.model.position.y=Zt,this.cardI=t.revealDone?df.length+ff.length-1:t.cardI||0},resume_a3_basement(){let n=this.F,t=this.g;this._prevZones=[],t.stopAmbience(),C.music("memory"),this.setupBasementActors(),this.objective(n.revealDone?"ruptures":"clown")},update_a3_basement(){let n=this.g,t=this.F;if(!n.clown.model.visible||this.cardBusy)return;let e=n.clown.model.position;Math.hypot(e.x-n.player.pos.x,e.z-n.player.pos.z)<2.6&&this.lookingAt([e.x,e.y+1.5,e.z],.6,3)&&(this.customPrompt=this.cardI===0?"Falar com o palha\xE7o":"Pr\xF3ximo cart\xE3o",this._customAction=()=>this.nextCard())},nextCard(){let n=this.F,t=this.g,e=[...df,"__REVEAL__",...ff],i=this.cardI||0;i>=e.length&&(i=e.length-1);let s=e[i];if(s==="__REVEAL__"){this.cardI=i+1,n.cardI=this.cardI,this.phoneReveal();return}let a=Ft(s).toUpperCase();t.clown.showCard(a),C.play("page",{vol:.8}),t.ui.say("Tique-Taque",a,Math.max(3,a.length*.06),"house"),this.cardI=Math.min(e.length-1,i+1),n.cardI=this.cardI,i===e.length-2&&this.afterCards()},phoneReveal(){let n=this.F,t=this.g,e=t.phone;this.cardBusy=!0,this.run(async i=>{t.clown.showCard(null),n.signal=!0,C.play("phone_vibrate",{n:4}),await i.wait(1);let s=e.thread("wendel"),a=s?s.msgs.filter(l=>l.day==="ontem"):[];s&&(s.msgs=s.msgs.filter(l=>l.day!=="ontem").map(l=>({...l,glitch:!0})),s.name="??? (sem n\xFAmero)",s.status="n\xFAmero n\xE3o encontrado");let r=e.ensureThread("wendel_real","{wendel} \u{1F5A4}");r.msgs=a,r.status="online agora";let o=[["rafinha kkkk t\xF4 na casa do L\xE9o","23:12","ontem"],["esqueci de falar, mandei o v\xEDdeo da casa pro meu projeto l\xE1, se chegar coisa estranha no meu notebook ignora kkkk","23:13","ontem"],["cuida do {bento} e da {lili} \u{1F5A4}\u{1F90D} boa noite","23:14","ontem"],["rafa?? acordei do nada com um pesadelo com a nossa casa. t\xE1 tudo bem a\xED? \u{1F5A4}","03:36","hoje"]];for(let[l,c,h]of o)e.receive("wendel_real","{wendel} \u{1F5A4}",l,{time:c,day:h}),await i.wait(.9);await i.say("{rafa}",'*Essas s\xE3o do {wendel}. Do {wendel} DE VERDADE. Com "kkkk". Com cora\xE7\xE3ozinho.*',{dur:3.6}),await i.say("{rafa}","*Tava sem sinal a noite inteira. Ent\xE3o quem... quem tava falando comigo?*",{dur:3.6}),await i.wait(1),e.receive("wendel","??? (sem n\xFAmero)","Tarde demais.",{glitch:!0}),await i.wait(1.4),e.receive("wendel","??? (sem n\xFAmero)",`A casa est\xE1 ${Math.round(this.sim())}% igual. Eu j\xE1 estou a\xED em cima.`,{glitch:!0}),await i.wait(1.6),e.receive("wendel","??? (sem n\xFAmero)","Obrigado por consertar tudo, {rafaela}.",{glitch:!0}),C.play("phone_glitch"),n.simAtReveal=this.sim(),n.evidence=!0,await i.wait(2),this.toast("Nova aba no di\xE1rio: EVID\xCANCIAS",3),t.ui.openJournal("ev"),this.cardBusy=!1,n.revealDone=!0,this.nextCard()})},afterCards(){let n=this.F,t=this.g;n.threeThings||(n.threeThings=!0,this.note("tres_coisas","As tr\xEAs coisas",`Deixar a casa DIFERENTE do v\xEDdeo:

1. O quadro de cabe\xE7a pra baixo (sala).
2. O meu nome no espelho (banheiro).
3. A fam\xEDlia no porta-chaves (entrada).

Ele est\xE1 l\xE1 em cima. O palha\xE7o buzina quando ele chega perto.`,{show:!1,where:"a mem\xF3ria da casa"}),this.objective("ruptures"),this.toast('Anotado no di\xE1rio: "As tr\xEAs coisas" (J)',3),t.checkpoint("a3_reveal",!0))},startAct3Up(){let n=this.F,t=this.g;n.act=3,n.act3Started=!0,this.phase="a3",t.clockMin=284,t.applyWorld(),this.setupLights(),t.echoes.clear(),t.clown.hide(),t.cats.bento.setVisible(!1),n.liliFollow&&(t.cats.lili.setVisible(!0),t.cats.lili.place(t.player.pos.x+.5,t.player.pos.z-.4,0),t.cats.lili.mode="follow"),t.startAmbience("act3"),C.play("wrong",{v:.8}),this.after(2,()=>t.phone.receive("wendel","??? (sem n\xFAmero)","Eu sei onde voc\xEA est\xE1.",{glitch:!0})),this.objective("ruptures"),t.checkpoint("a3_up"),this.startEndlessHunt(14)},resume_a3(){let n=this.F,t=this.g;this._prevZones=[],t.cats.bento.setVisible(!1),n.liliFollow&&(t.cats.lili.setVisible(!0),t.cats.lili.place(t.player.pos.x+.5,t.player.pos.z-.4,0),t.cats.lili.mode="follow"),this.objective("ruptures"),this.startEndlessHunt(9)},huntStrength(){let n=this.F.simAtReveal||this.sim();return Pe(.85+(n-75)/60,.85,1.15)+this.ruptureCount()*.03},startEndlessHunt(n){let t=this.g;this.after(n,()=>{if(this.phase!=="a3")return;let e=[...t.world.navNodes.keys()].filter(i=>!/^(x|pb)/.test(i));t.entity.startHunt({from:"pp1",endless:!0,strength:this.huntStrength(),patrol:e,exit:"pp1"}),this.huntId=4})},ruptureCount(){let n=this.F;return(n.paintingMode==="upside"?1:0)+(n.nameWritten?1:0)+(n.keysHung?1:0)},ruptureHints(){let n=this.F;return n.paintingMode!=="upside"?["O quadro colorido fica na sala, perto da porta de entrada.","Lembra do reflexo da TV no come\xE7o? Ele mostrava como a casa queria o quadro.",'V\xE1 at\xE9 o quadro e escolha "Pendurar de cabe\xE7a pra baixo".']:n.nameWritten?n.keysHung?["V\xE1 para a sala."]:['O porta-chaves "Fam\xEDlia" est\xE1 vazio. A casa quer a fam\xEDlia de volta nele.',`Voc\xEA precisa de tr\xEAs chaves: a da m\xE3e${this.has("chaves_mae")?" (tem)":""}, a do pai${this.has("chave_pai")?" (tem)":" (o chap\xE9u dele ficou no ch\xE3o do quarto)"} e a chave velha${this.has("chave_velha")?" (tem)":""}.`,"Com as tr\xEAs chaves, interaja com o porta-chaves na entrada."]:[n.valveFixed?"Espelho s\xF3 emba\xE7a com vapor.":"O registro do chuveiro sumiu. Procure num lugar com \xE1gua: a \xE1rea de servi\xE7o.","Encaixe o registro no chuveiro e abra a \xE1gua quente. Espere o espelho emba\xE7ar.","Depois de emba\xE7ado, interaja com o espelho do banheiro e escreva o seu nome."]},update_a3(n){let t=this.g,e=this.F,i=t.entity;this._honkCd=(this._honkCd||0)-n;let s=i.proximity();i.hunt&&s>.42&&(this._lastProx||0)<=.42&&this._honkCd<=0&&(this._honkCd=18,C.play("honk",{pos:[i.pos.x,1.5,i.pos.z],v:.9,rev:.8})),this._lastProx=s;let a=t.cats.lili;if(e.liliFollow&&i.model.visible&&Math.hypot(i.pos.x-a.pos.x,i.pos.z-a.pos.z)<7?a.mode!=="stare"&&(a.mode="stare",a.stareAt=i.pos,a.hiss()):e.liliFollow&&a.mode==="stare"&&(a.mode="follow"),e.showerOn&&!e.nameWritten){this._showerT=(this._showerT||0)-n,this._showerT<0&&(this._showerT=4,t.noise(6.1,9.3,7));let r=t.world.get("bath_mirror");r&&r.fog<.75&&(r.fog=Math.min(.75,r.fog+n*.12),r.fog>=.75&&!e.fogNoted&&(e.fogNoted=!0,this.toast("O espelho do banheiro emba\xE7ou.",3)))}},rupturePainting(){let n=this.F,t=this.g;n.paintingMode="upside",t.applyWorld(),C.play("thud",{v:.7}),this.afterRupture("Quadro")},prompt_shower_valve(){let n=this.F;return n.act<3?"Registro do chuveiro":n.valveFixed?n.showerOn?n.nameWritten?"Fechar o chuveiro":"Chuveiro ligado (espere o espelho emba\xE7ar)":"Abrir o chuveiro quente":this.has("registro")?"Encaixar o registro":"Registro do chuveiro (falta a manopla)"},do_shower_valve(){let n=this.F,t=this.g;if(n.act<3){this.say0("","O registro do chuveiro. Emperra se girar demais.");return}if(!n.valveFixed){if(!this.has("registro")){this.say0("{rafa}","*Algu\xE9m arrancou a manopla do registro. Sem ela n\xE3o abre.*");return}this.take("registro"),n.valveFixed=!0,t.applyWorld(),C.play("unlock",{pos:[6.5,1.2,9.3]});return}if(!n.showerOn){n.showerOn=!0,C.play("switch"),this.showerLoop=C.loop("shower",{pos:[6.2,2,9.4],vol:.8}),t.setLight("shower_steam",!0);let e=t.fixture("shower_steam");e&&(e.intensity=1.5),this.say0("{rafa}","*\xC1gua quente. T\xE1 fazendo barulho demais... ele vai ouvir.*");return}n.nameWritten&&(n.showerOn=!1,this.showerLoop&&(this.showerLoop.stop(),this.showerLoop=null),t.setLight("shower_steam",!1))},prompt_registro(){return"Pegar o registro do chuveiro"},do_registro(){this.F.hasRegistro=!0,this.give("registro"),this.g.applyWorld()},ruptureMirror(){let n=this.F,t=this.g,e=t.world.get("bath_mirror");if(!e||e.fog<.7){this.say0("{rafa}","*Ainda n\xE3o emba\xE7ou o suficiente.*");return}this.run(async i=>{let s=await t.ui.keypad({title:"Escrever no espelho emba\xE7ado",hint:"Escreva com o dedo.",mode:"text",check:r=>String(r).trim().length?!0:"Escreva alguma coisa."});if(t.resumePointer(!0),!s)return;n.nameWritten=String(s).trim().slice(0,24),this.drawMirrorName(n.nameWritten),t.applyWorld(),C.play("page");let a=[ue.rafaela,ue.rafa,ue.rafaela+" "+ue.sobrenome].map(Qn).includes(Qn(s));await i.wait(.8),await i.say("{rafa}",a?"*A casa lembra de mim. Eu moro aqui.*":"*N\xE3o era bem o meu nome... mas a casa entendeu.*",{dur:3}),this.afterRupture("Espelho")})},ruptureKeys(){let n=this.F,t=this.g,e=[["chaves_mae","o chaveiro da m\xE3e"],["chave_pai","a chave do pai"],["chave_velha","a chave velha"]],i=e.filter(([s])=>!this.has(s)).map(([,s])=>s);if(i.length){this.say0("{rafa}","*Falta "+i.join(" e ")+".*");return}e.forEach(([s])=>this.take(s)),n.keysHung=!0,n.oldKeyHung=!0,t.applyWorld(),C.play("pickup"),C.play("chime",{notes:[60,64,67,72],v:.4,delay:.3}),this.afterRupture("Porta-chaves")},afterRupture(n){let t=this.g,e=this.F;this.progress(),C.play("wrong",{v:1}),C.play("boom",{v:.6,delay:.3}),this.warp=1.4,t.player.shake(.4);let i=this.ruptureCount();this.toast(`A casa ficou diferente (${i}/3) \xB7 casa.mp4: ${Math.round(this.sim())}% igual`,3.5);let s=["","PARE.","VOC\xCA N\xC3O SABE O QUE EST\xC1 FAZENDO",""];s[i]&&this.after(1.5,()=>t.phone.receive("wendel","??? (sem n\xFAmero)",s[i],{glitch:!0}));let a=t.entity;if(a.hunt&&(a.strength=this.huntStrength(),a.investigate(t.player.pos.x,t.player.pos.z)),this.objective("ruptures"),i>=3){this.after(2.5,()=>this.startClimaxPhase());return}t.checkpoint("a3_r"+i)},startClimaxPhase(){let n=this.g,t=this.F;n.entity.hide(),this.phase="a3_climax",t.climaxReady=!0;for(let e of n.world.fixtures)["varanda","extra","porao1","porao2","porao_escada","lamppost"].includes(e.id)||(e.on=!1);n.tv.set("static"),C.play("tv_on",{pos:[.3,1.4,2.8],vol:1.5}),n.phone.receive("wendel","??? (sem n\xFAmero)","Ent\xE3o venha me dizer isso na cara.",{glitch:!0}),this.objective("climax"),n.checkpoint("a3_climax"),this.climaxArmed=!0,(this.zones||[]).includes("sala")&&this.after(1.5,()=>this.enter_a3_climax_sala())},resume_a3_climax(){let n=this.g;this._prevZones=[];for(let t of n.world.fixtures)["varanda","extra","porao1","porao2","porao_escada","lamppost"].includes(t.id)||(t.on=!1);n.tv.set("static"),this.objective("climax"),this.climaxArmed=!0},enter_a3_climax_sala(){this.climaxArmed&&(this.climaxArmed=!1,this.run(n=>this.climax(n)))},async climax(n){let t=this.g,e=this.F,i=t.entity,s=t.clown;this.cut(!0,{look:!0}),t.setLight("sala",!0,1.5),await n.wait(1),await t.player.lookAt(new I(.2,1.4,2.8),1.2),await n.wait(1.5),i.show(.3,2.8,Math.PI/2,"ecv"),i.model.scale.setScalar(.25),i.model.position.y=1,t.tv.set("static");for(let u=0;u<=30;u++){let f=u/30;i.model.scale.setScalar(.25+.75*f),i.place(.3+1*f,2.8,Math.PI/2),i.model.position.y=1*(1-f),await n.wait(.08)}t.tv.set("off"),await n.wait(1.2),C.play("scream",{pos:i.pos,v:1,dur:2.2});let a=C.loop("growl",{pos:i.pos,vol:1});t.player.shake(.6),await n.wait(1.2),s.show(2.1,3.4,-Math.PI/2-.3,"ec",!0),s.honk(1.2),await n.wait(1.2),await n.say("O Inquilino","Eu s\xF3 quero uma casa, {rafaela}.",{tts:"inq",kind:"enemy",dur:3}),await n.say("O Inquilino","Todo mundo quer uma casa.",{tts:"inq",kind:"enemy",dur:2.6}),await n.say("O Inquilino","Me d\xE1 um c\xF4modo. Um s\xF3. Um que ningu\xE9m v\xE1 lembrar. E eu devolvo eles pra voc\xEA. Agora.",{tts:"inq",kind:"enemy",dur:5});let r=await t.ui.choice("O Inquilino estende a m\xE3o comprida. Atr\xE1s dele, o palha\xE7o balan\xE7a a cabe\xE7a devagar: n\xE3o.",["Dar um c\xF4modo pra ele.","N\xE3o. Essa casa \xE9 nossa."]);if(t.resumePointer(!0),r===0)return a.stop(1),this.endingInquilino(n);C.play("scream",{pos:i.pos,v:1.1,dur:1.6});for(let u=0;u<6;u++)i.place(1.3+u*.12,2.8,Math.PI/2),await n.wait(.05);s.show(i.pos.x+.3,i.pos.z+.25,-Math.PI/2,"ec",!0),s.honk(1.4),await n.say("","*O palha\xE7o agarra ele por tr\xE1s!*",{dur:2}),this.objective("record"),this.toast("GRAVE ELE! Segure o bot\xE3o direito e mantenha ele no centro.",4),t.allowPhoneInCutscene=!0,t.player.lookLock=!1,this.recordProgress=0;let o=0,l=0;for(;this.recordProgress<1;){await n.wait(.05),l+=.05;let u=1.55+Math.sin(l*1.1)*.35,f=2.8+Math.sin(l*1.7)*.9;if(i.place(u,f,Math.PI/2+Math.sin(l*3)*.4),s.model.position.set(u+.3,0,f+.2),a.setPos(i.pos),t.phone.raised&&this.lookingAt([u,2,f],.24,8)?(this.recordProgress=Math.min(1,this.recordProgress+.05/9),o=0,this.glitch=.15,i.stunT=0):(o+=.05,this.glitch=Math.min(.6,o*.2)),o>3.5){this.recordProgress=void 0,this.glitch=0,a.stop(.2),t.allowPhoneInCutscene=!1,s.hide(),await n.say("","*Ele se soltou!*",{dur:1}),t.caught(!1);return}}this.recordProgress=void 0,this.glitch=0,t.allowPhoneInCutscene=!1,C.play("record_beep"),this.toast("casa.mp4 \u2014 grava\xE7\xE3o substitu\xEDda",3),C.play("scream",{pos:i.pos,v:1.2,dur:2.5});let c=t.camera;for(let u=0;u<=25;u++){let f=u/25,g=c.position.x-Math.sin(t.player.yaw)*.6,_=c.position.z-Math.cos(t.player.yaw)*.6;i.place(i.pos.x+(g-i.pos.x)*.15,i.pos.z+(_-i.pos.z)*.15,i.yaw+.3),i.model.scale.setScalar(Math.max(.02,1-f)),i.model.position.y=f*1.2,await n.wait(.05)}i.hide(),i.model.scale.setScalar(1),a.stop(.3),t.player.shake(.8),C.play("boom",{v:1}),t.ui.flash(.5,.6),await n.wait(1.5),await n.say("{rafa}","*Ele t\xE1... dentro do meu celular. Dentro do v\xEDdeo.*",{dur:3});let h=await t.ui.choice("casa.mp4 agora s\xF3 tem uma coisa gravada: ele.",["Apagar casa.mp4","Guardar o v\xEDdeo"]);if(t.resumePointer(!0),h===1)return this.endingEpilogue(n,"copia");this.toast("Excluindo casa.mp4...",2),C.play("phone_glitch"),await n.wait(2),C.play("boom",{v:.8}),C.play("chime",{notes:[57,64,69,73,76,81],v:.7});for(let u of t.world.fixtures)["sala","entrada"].includes(u.id)&&(u.on=!0);await n.wait(1.2),s.show(2,3.2,-Math.PI/2,"ec",!0),s.showCard(Ft("OBRIGADO POR LEMBRAR DE MIM, {RAFA}.").toUpperCase()),t.ui.say("Tique-Taque",Ft("OBRIGADO POR LEMBRAR DE MIM, {RAFA}.").toUpperCase(),3.5,"house"),await n.wait(3.5);let d=!1;if(this.has("relogio_ovo")){let u=await t.ui.choice(`O palha\xE7o come\xE7a a sumir, como uma foto velha desbotando.
No seu bolso, o rel\xF3gio-ovo esquenta: "PARA DESFAZER UM MOMENTO".`,["Apertar o bot\xE3o do rel\xF3gio-ovo","Deixar ele ir"]);if(t.resumePointer(!0),u===0){d=!0;for(let f=0;f<8;f++)C.play("clock",{tock:f%2===1,vol:1.2}),await n.wait(.25);this.warp=2,t.ui.flash(.4,1.2,"#cfe0ff"),await n.wait(1.2),s.showCard("...TIQUE-TAQUE."),t.ui.say("Tique-Taque","...TIQUE-TAQUE.",2.5,"house"),e.clownSaved=!0,await n.wait(2.5)}}if(!d){s.model.traverse(u=>{u.material&&(u.material=u.material.clone(),u.material.transparent=!0)});for(let u=0;u<25;u++)s.model.traverse(f=>{f.material&&(f.material.opacity=1-u/25)}),await n.wait(.08);s.hide()}return this.endingEpilogue(n,"casa")},async endingInquilino(n){let t=this.g;C.speak(Ft("Obrigado, {rafaela}."),{pitch:.1,rate:.6}),await n.say("O Inquilino","Obrigado, {rafaela}.",{dur:2.6,kind:"enemy"}),t.ui.flash(1,3,"#fff"),await t.ui.fade(1,2),t.entity.hide(),t.clown.hide(),this.finish("inquilino")},async endingEpilogue(n,t){let e=this.g,i=this.F;await e.ui.fade(1,2),e.clown.hide(),e.entity.hide(),e.stopAmbience(),C.music("end"),i.act=1,e.clockMin=360;for(let r of e.world.fixtures)r.on=!1;let s=e.fixture("varanda");s&&(s.on=!0,s.color.set(16756848),s.intensity=9,s.dist=12),e.fixture("sala")&&(e.fixture("sala").on=!0),this.tint=[1.12,1,.9],e.player.teleport(2.6,6.6,Math.PI,0),e.echoes.clear(),e.cats.bento.setVisible(!0),e.cats.bento.place(3.4,3,0),i.liliFollow&&(e.cats.lili.setVisible(!0),e.cats.lili.place(2.9,6.9,Math.PI),e.cats.lili.mode="idle"),this.cut(!0,{look:!0}),await e.ui.fade(0,3),e.ui.toast("06:00",3),await n.say("{rafa}","*Amanheceu. A geladeira voltou a zumbir. O {bento} t\xE1 pedindo ra\xE7\xE3o.*",{dur:3.6}),await n.wait(1.5),C.play("intercom",{pos:[.07,1.45,7.65],dur:1.3}),await n.wait(1.6),C.play("intercom",{pos:[.07,1.45,7.65],dur:1.3}),await n.say("{rafa}","*O interfone. De novo.*",{dur:2.2}),await e.player.lookAt(new I(.07,1.45,7.65),1.2),C.play("switch"),await n.say("Interfone","rafinha? abre a\xED, esqueci a chave kkkk",{tts:"wendel",dur:3.2});let a=await e.ui.choice("A voz \xE9 do {wendel}. Parece o {wendel}.",["Abrir","Qual o nome dos gatos?"]);e.resumePointer(!0),a===1&&(await n.say("Interfone","{bento} e {lili}, n\xE9?? t\xE1 doida? kkkkk abre logo que eu t\xF4 morrendo de fome",{tts:"wendel",dur:4}),await n.say("{rafa}","*...\xE9 ele.*",{dur:2})),C.play("intercom",{dur:.6}),await n.wait(1.2),await e.ui.fade(1,2.5),this.finish(t)},finish(n){let t=this.g,e=this.F;t._endingNow=!0,this.cut(!1),t.state="ending",t.input.unlock(),C.stopAllLoops(1),C.music("end");try{localStorage.removeItem("casa-se-lembra/save/v1")}catch{}let i=Math.max(1,Math.round(t.time/60)),s=[];n==="inquilino"?(s.push("06:00. A sua m\xE3e te acorda no sof\xE1. Todo mundo em casa. O {bento} miando pela ra\xE7\xE3o."),s.push("Ningu\xE9m lembra de nada. Ningu\xE9m lembra de uma porta roxa no corredor."),s.push("\u2014 Que quarto roxo, {rafa}? Voc\xEA sempre dormiu na sala."),s.push(`\xC0 noite, algu\xE9m muito alto se mexe no quarto que ningu\xE9m lembra.
Ele \xE9 um \xF3timo inquilino. Nunca faz barulho.`)):(s.push("A sua fam\xEDlia acordou cada um na sua cama, dizendo que teve o mesmo sonho: uma festa, uma sala amarela, um palha\xE7o com um rel\xF3gio no peito."),s.push(n==="copia"?`Mas casa.mp4 continua no seu celular. Toda noite, \xE0s 3:33, o arquivo fica um pouquinho maior.

[notifica\xE7\xE3o] casa.mp4 \u2014 101% igual.`:e.clownSaved?"Na foto da festa de 5 anos, o palha\xE7o agora est\xE1 olhando pra voc\xEA. E sorrindo.":"Na foto da festa de 5 anos, o palha\xE7o est\xE1 de olhos fechados. Como quem dorme depois de um dia muito longo.")),s.push(e.liliFollow?"A {lili} dormiu em cima do seu p\xE9 a manh\xE3 inteira.":"A {lili} ficou tr\xEAs dias sem sair de dentro do rack."),s.push(e.invited?"Na porta da frente ficaram arranh\xF5es fundos, do lado de dentro. Ningu\xE9m soube explicar.":"A porta da frente nunca foi aberta naquela noite. Voc\xEA n\xE3o convidou ningu\xE9m.");let a=this.fixCount();s.push(a<=1?"Voc\xEA s\xF3 consertou o que te mandaram consertar. Desconfiou cedo. A casa gostou disso.":a>=5?"Voc\xEA consertou quase tudo o que a casa tinha mudado pra te proteger. Ela te perdoou mesmo assim.":`Voc\xEA consertou ${a} coisas que a casa tinha mudado pra te proteger.`),e.secretVasco&&s.push("A camisa preta com a faixa ficou pendurada na cadeira. Pra dar sorte."),e.secretChrono&&s.push("\xC0s vezes, quando a casa fica em sil\xEAncio, d\xE1 pra ouvir um tique-taque que n\xE3o vem de rel\xF3gio nenhum.");let r=n==="inquilino"?"FINAL: O INQUILINO":n==="copia"?"FINAL: C\xD3PIA DE SEGURAN\xC7A":e.clownSaved?"FINAL: A CASA SE LEMBRA (e o palha\xE7o tamb\xE9m)":"FINAL: A CASA SE LEMBRA",o=["Vasco","Chrono","Bloodborne"].filter(c=>c==="Vasco"?e.secretVasco:c==="Chrono"?e.secretChrono:e.dadFound).length,l=`<div class="end-tag">${r}</div><h1>A CASA SE LEMBRA</h1>`+s.map(c=>`<p>${Ft(c).replace(/\n/g,"<br>")}</p>`).join("")+`<p class="end-tag">tempo de jogo: ${i} min \xB7 vezes que a casa esqueceu: ${t.deaths} \xB7 segredos: ${o}/3</p><p style="margin-top:30px">${Ft("Para {rafaela}.")}<br>${Ft("Com carinho, {wendel}.")}</p>`+(n!=="casa"?'<p class="end-tag">(existe outro final)</p>':"");t.ui.ending(l,()=>{t._endingNow=!1,t.quitToMenu()})}};var ul={msgs:{text:"Ler as mensagens no celular (TAB).",hints:["O celular vibrou. Chegou mensagem nova.","Aperte TAB para abrir o celular e toque em Mensagens.","TAB \u2192 Mensagens \u2192 abra a conversa do {wendel}."]},charger:{text:"O celular est\xE1 com 12%. Achar o carregador do {wendel}.",hints:["Leia as mensagens antigas do {wendel} (de ontem): ele contou onde esqueceu o carregador.","Ele esqueceu no SEU quarto \u2014 o quarto roxo, no corredor. Leve a lanterna (F).","O carregador est\xE1 na penteadeira, do lado do espelho redondo."]},charge:{text:"Carregar o celular numa tomada (olhe para a tomada e segure E).",hints:["Tomadas ficam perto do ch\xE3o ou embaixo do ar-condicionado.","No quarto roxo tem tr\xEAs tomadas embaixo do ar-condicionado. Na sala tem uma ao lado do sof\xE1.","Olhe para uma tomada e SEGURE E at\xE9 passar de 35%."]},video:{text:"Assistir casa.mp4: segure o bot\xE3o direito (levanta o celular) e aperte Q.",hints:["O bot\xE3o direito do mouse levanta o celular.","Com o celular levantado, aperte Q (ou gire a rodinha) para trocar para \u25B6 casa.mp4.","Segure o bot\xE3o direito e aperte Q. A imagem vai ficar azulada: \xE9 o v\xEDdeo."]},compare:{text:"Comparar a sala com o v\xEDdeo e arrumar o que estiver diferente.",hints:["No modo \u25B6 casa.mp4 a imagem mostra a casa como o {wendel} gravou. Quando algo n\xE3o bate, aparece uma etiqueta vermelha.","Olhe pelo v\xEDdeo para a parede da porta de entrada. Depois olhe sem o v\xEDdeo.","O quadro colorido: no v\xEDdeo ele est\xE1 encostado no ch\xE3o; na sua frente est\xE1 pendurado. Interaja com ele (E)."]},a1list:{text:`Antes de voltar a dormir:
\u2022 dar ra\xE7\xE3o pro {bento} e pra {lili}
\u2022 ver se a m\xE3e est\xE1 dormindo`,status:n=>[(n.F.fedCats?"\u2611":"\u2610")+" Ra\xE7\xE3o dos gatos",(n.F.checkedMom?"\u2611":"\u2610")+" Ver se a m\xE3e est\xE1 dormindo (quarto dos pais)","\u2026 diferen\xE7as ainda vis\xEDveis no v\xEDdeo: "+n.diffs().filter(t=>t.id!=="extra").length+" (opcional)"],hints:n=>n.F.fedCats?["O quarto dos pais \xE9 a porta no fim do corredor.","A porta est\xE1 trancada. Bata nela (E).","V\xE1 at\xE9 o fim do corredor e interaja com a porta."]:["A ra\xE7\xE3o fica na \xE1rea de servi\xE7o, depois da cozinha.","A ra\xE7\xE3o est\xE1 na prateleira mais alta. Alto demais pra voc\xEA. O que tem na sala que ajuda a subir?","Pegue o banquinho de madeira (perto da bicicleta), use-o na prateleira da \xE1rea de servi\xE7o, pegue a ra\xE7\xE3o e sirva nos potes da cozinha."]},intercom:{text:"O interfone est\xE1 tocando.",hints:["O interfone fica na parede, ao lado da porta de entrada.","V\xE1 at\xE9 a porta de entrada e atenda (E).","O interfone \xE9 o aparelho branco na parede esquerda, perto da porta."]},bed:{text:"Voltar para o quarto.",hints:["Seu quarto \xE9 o roxo, no corredor.","Tem alguma coisa diferente no corredor. Olhe com aten\xE7\xE3o.","Ande pelo corredor at\xE9 o fim."]},extradoor:{text:'Tem uma porta nova no corredor. O "{wendel}" disse para n\xE3o abrir.',hints:["Talvez seja melhor voltar para o quarto.","A chave velha do porta-chaves pode ter a ver com isso.","Por enquanto essa porta n\xE3o abre. Siga em frente."]},tv:{text:"A TV ligou sozinha na sala.",hints:["O barulho vem da sala.","V\xE1 at\xE9 a sala e olhe para a TV.","Entre na sala."]},breaker:{text:"Religar a energia no quadro de luz (ao lado da porta de entrada).",hints:["Est\xE1 escuro, mas voc\xEA conhece a sua casa. A porta de entrada fica no lado oposto \xE0 varanda.","Siga pela parede da TV at\xE9 o fim da sala. O quadro de luz \xE9 a caixa branca na parede, perto do interfone.","O quadro fica na parede \xE0 esquerda da porta de entrada, um pouco acima do interfone. Interaja com ele."]},lookvideo:{text:"Olhar pelo v\xEDdeo (casa.mp4) onde est\xE1 a fam\xEDlia.",hints:["Levante o celular (bot\xE3o direito) e troque para \u25B6 casa.mp4 (Q).","No v\xEDdeo, procure nos c\xF4modos: cozinha, quartos.","Olhe pela cozinha no modo v\xEDdeo: a m\xE3e aparece l\xE1."]},family:{text:n=>`Encontrar a fam\xEDlia (${n.familyCount()}/4).`,status:n=>[(n.F.juliaFound?"\u2611":"\u2610")+" {julia} \u2014 quarto roxo",(n.F.momFound?"\u2611":"\u2610")+" M\xE3e \u2014 cozinha",(n.F.dadFound?"\u2611":"\u2610")+" Pai \u2014 quarto dos pais",(n.F.pedroFound?"\u2611":"\u2610")+" {pedro} \u2014 quarto dos meninos"+(n.F.hasMomKeys?"":" (trancado)"),n.F.liliFollow?"\u2611 {lili} est\xE1 com voc\xEA":n.F.liliHint?"\u2610 (opcional) a {lili} sumiu":""].filter(Boolean),hints:n=>n.familyHints()},door:{text:"Os quatro sumiram do v\xEDdeo. A porta que n\xE3o existe se abriu um pouco.",hints:["A porta nova do corredor.","Use a chave velha do porta-chaves (se ainda n\xE3o pegou, ela est\xE1 l\xE1).","Abra a porta que n\xE3o existe e des\xE7a a escada."]},descend:{text:"Descer a escada que n\xE3o pode existir.",hints:["Um apartamento n\xE3o tem escada. Mesmo assim...","Des\xE7a.","Siga a escada at\xE9 o fim."]},clown:{text:"Chegar perto do palha\xE7o.",hints:["Ele est\xE1 perto do bolo.","Aproxime-se e interaja (E).","Interaja com ele v\xE1rias vezes para ver todos os cart\xF5es."]},ruptures:{text:n=>`Deixar a casa DIFERENTE do v\xEDdeo (${n.ruptureCount()}/3).`,status:n=>[(n.F.paintingMode==="upside"?"\u2611":"\u2610")+" O quadro de cabe\xE7a pra baixo (sala)",(n.F.nameWritten?"\u2611":"\u2610")+" O seu nome no espelho (banheiro)",(n.F.keysHung?"\u2611":"\u2610")+" A fam\xEDlia no porta-chaves (entrada)","Ele est\xE1 na casa. Use o r\xE1dio (R), ou\xE7a a buzina, esconda-se."],hints:n=>n.ruptureHints()},climax:{text:"Enfrentar o Inquilino na sala.",hints:["Ele est\xE1 na TV.","V\xE1 para a sala.","Entre na sala."]},record:{text:"GRAVE ELE: segure o bot\xE3o direito e mantenha ele no centro da tela.",hints:["Bot\xE3o direito levanta o celular.","Deixe o quadradinho do centro em cima dele.","Siga o movimento dele com o mouse."]}};var dl=Symbol("abort"),Ba=class{constructor(t){this.g=t,this.token=0,this.phase="none",this.objId=null,this.hintLvl=0,this.hintAt=0,this.stuckT=0,this.warp=0,this.glitch=0,this.chroma=0,this.scan=0,this.tint=null,this.exposure=1,this.t=0,this.timers=[],this.customPrompt=null}get F(){return this.g.flags}run(t){let e=this.token;return t({wait:async s=>{if(await this.g.wait(s),e!==this.token)throw dl},say:async(s,a,r={})=>{if(this.voice(a,r),await this.g.ui.say(s,a,r.dur,r.kind||""),e!==this.token)throw dl},alive:()=>e===this.token,check:()=>{if(e!==this.token)throw dl}}).catch(s=>{s!==dl&&(console.error(s),this.cut(!1))})}voice(t,e){if(!e.tts)return;let i=Ft(t).replace(/\*/g,""),s=e.tts;s==="mae"?C.speak(i,{pitch:1.05,rate:.9,female:!0,vol:e.vol||.8}):s==="inq"?C.speak(i,{pitch:.1,rate:.7,vol:1}):s==="pai"?C.speak(i,{pitch:.55,rate:.8,vol:.9}):s==="julia"?C.speak(i,{pitch:1.35,rate:.85,female:!0,vol:.6}):s==="tv"?C.speak(i,{pitch:.75,rate:.82,vol:.9}):s==="wendel"&&C.speak(i,{pitch:.95,rate:1,vol:.9})}cut(t,e={}){this.g.cutscene=t,this.g.player.moveLock=t,this.g.player.lookLock=t&&!e.look,t&&this.g.phone.raised&&(this.g.phone.raised=!1)}after(t,e){let i=this.token;this.timers.push({t,fn:e,tk:i})}toast(t,e){this.g.ui.toast(t,e)}msg(t,e={}){this.g.phone.receive("wendel","{wendel} \u{1F5A4}",t,{glitch:e.glitch,time:e.time}),this.F.lastMsgAt=this.t}note(t,e,i,s={}){return this.g.notes.find(a=>a.id===t)||this.g.notes.push({id:t,title:e,body:i,where:s.where||"",style:s.style}),s.show!==!1?this.g.ui.note(e,i,{style:s.style}):Promise.resolve()}rule(t,e){let i="rule_"+t;this.F[i]||(this.F[i]=!0,this.g.rules.push(e),this.toast("Regra anotada no di\xE1rio (J)",2.2))}give(t,e=!1){this.g.inventory.add(t),C.play("pickup"),e||this.toast("Pegou: "+Ft(Ua[t].name)+`
(I para ver a mochila)`,2.8)}take(t){this.g.inventory.remove(t)}has(t){return this.g.inventory.has(t)}objective(t,e=!1){this.objId=t,this.hintLvl=0,this.hintAt=0,this.stuckT=0,this._nudged=!1,e||this.g.ui.setObjective(this.objectiveText())}objectiveText(){let t=ul[this.objId];return t?typeof t.text=="function"?t.text(this):t.text:""}statusLines(){let t=ul[this.objId];return t&&t.status?t.status(this):[]}hint(){let t=ul[this.objId];if(!t){this.toast("Nenhuma dica agora.");return}let e=typeof t.hints=="function"?t.hints(this):t.hints;if(!e||!e.length){this.toast("Explore. Olhe pelo celular (bot\xE3o direito).");return}let i=this.hintLvl===0?0:35;if(this.hintLvl>0&&this.t-this.hintAt<i&&this.hintLvl<e.length){this.g.ui.hint(this.hintLvl,e[this.hintLvl-1]+`
(pr\xF3xima dica em ${Math.ceil(i-(this.t-this.hintAt))}s)`);return}this.hintLvl=Math.min(e.length,this.hintLvl+1),this.hintAt=this.t,this.g.ui.hint(this.hintLvl,e[this.hintLvl-1])}progress(){this.stuckT=0}sim(){let t=this.F,e=87;return t.paintingMode==="floor"&&(e+=3),e+=2*["d_bike","d_fotos","d_lencol","d_cadeira","d_toalha"].filter(i=>t[i]).length,t.invited&&(e+=3),t.corridorLong&&(e-=2),t.power&&(e+=2),e-=3*this.familyCount(),t.paintingMode==="upside"&&(e-=9),t.nameWritten&&(e-=9),t.keysHung&&(e-=10),Pe(e,40,99)}familyCount(){let t=this.F;return["juliaFound","momFound","dadFound","pedroFound"].filter(e=>t[e]).length}fixCount(){let t=this.F;return(t.paintingMode==="floor"||t.fixedQuadro?1:0)+["d_bike","d_fotos","d_lencol","d_cadeira","d_toalha"].filter(e=>t[e]).length}start(){this.abort(),this.phase="intro",this.F.act=1,this.run(t=>this.intro(t))}abort(){this.token++,this.g._waits=[],this.timers=[],this.cut(!1),this.customPrompt=null,this.warp=this.glitch=this.chroma=this.scan=0,this.tint=null,this.exposure=1,this.extraLayers=null,this.blockExitHide=!1,this.g.allowPhoneInCutscene=!1,this.g.allowInteractInCutscene=!1,this.g.lightMul=1,this.g.ui.clearSubs(),this.g.player.speedMul=1}save(){return{phase:this.phase,objId:this.objId,t:this.t}}load(t,e){this.phase=t.phase||"a1",this.t=t.t||0,this._prevZones=[],this.objId=t.objId,this.resume(e)}resume(){let t=this.g,e=this.F;t.player.eyeH=pn,t.player.moveLock=!1,t.player.lookLock=!1,this.setupLights(),this.setupActors(),t.startAmbience(e.act===3?"act3":e.act===2?"act2":"house"),!e.power&&e.act===2&&this.powerAmbience(!1),C.music(null),this.objId&&this.objective(this.objId);let i=this["resume_"+this.phase];i&&i.call(this)}setupLights(){let t=this.g,e=this.F,i=t.world.fixtures;for(let a of i)a.level=0,a.flicker=0;let s=(a,r=!0)=>{let o=t.fixture(a);o&&(o.on=r,o.level=r?1:0)};if(i.forEach(a=>{["tv_glow","fridge_light","laptop_glow","shower_steam"].includes(a.id)||(a.on=!1)}),e.act===1)["sala","cozinha","corredor1","varanda","servico"].forEach(a=>s(a)),e.corridorLong&&s("corredor2"),e.lightsRoxo&&s("roxo");else if(e.act===2)s("varanda"),e.power&&["sala","entrada","cozinha","servico","corredor1","corredor2","banheiro","roxo","meninos","pais"].forEach(a=>s(a)),(e.hunt3Done||e.pedroFound)&&s("corredor2",!1);else if(e.act>=3){["varanda","sala","cozinha","corredor1","banheiro","roxo","pais","servico"].forEach(r=>s(r)),["sala","corredor1"].forEach(r=>{let o=t.fixture(r);o&&(o.intensity*=.6)});let a=t.fixture("varanda");a&&(a.color.set(13652032),a.intensity=2.2)}["extra","porao1","porao2","porao_escada","lamppost"].forEach(a=>s(a)),t.flags.fanSpeed=e.act===1?5:e.power?3:0}setupActors(){let t=this.g,e=this.F;t.echoes.clear(),t.clown.hide(),t.esquecido.hide(),t.entity.hide();let{bento:i,lili:s}=t.cats;i.setVisible(!0),i.mode="idle",e.act===1?(e.fedCats?(i.place(-1.25,7.35,Math.PI),i.mode="eat"):i.place(2.7,6.9,.8),s.setVisible(!0),s.place(4.72,4.9,Math.PI/2),s.mode="hide"):(i.place(-.9,6.6,0),e.liliFollow?(s.setVisible(!0),s.place(t.player.pos.x+.6,t.player.pos.z+.4,0),s.mode="follow"):e.act===2?(s.setVisible(!0),s.place(.2,3.68,Math.PI/2),s.mode="hide"):s.setVisible(!1)),e.act<=2&&t.echoes.add("rafa_video",{x:3.55,z:3.2,yaw:-Math.PI/2,spec:"v",hair:"curly",sitting:!0,h:1.5,anim:e.act===2?"look":"breathe",color:14214911,alpha:.75}),e.act===2&&this.setupFamilyEchoes(),e.act===2&&e.dadFound===void 0&&e.power}powerAmbience(t){for(let e of this.g.ambience)["fridge","fan","clock"].includes(e.name)&&e.setVol(t?e.vol||.7:0,.2)}afterBuild(){let t=this.g,e=t.world,i=this.F;if(uf(this),e.addTo("sala",s=>{D(s,1.2,2.3,.3,Si("#000000"),.97,1.15,8.45,{cast:!1}),e.collider(.4,1.6,8.3,8.6)}),i.corridorLong){let s=e.doors.get("porta_extra");s&&pe(s.pivot,"ecm"),e.addTo("corredor",a=>{let r=Ve(a,.82,2.1,X("#e9e6df"),12.21,1.05,7.7,{uv:!1});pe(r,"v")})}e.addTo("banheiro",s=>{let a=document.createElement("canvas");a.width=256,a.height=360;let r=new Je(a);r.colorSpace=xe;let o=Ve(s,.48,.68,new Yt({map:r,transparent:!0,depthWrite:!1}),4.285,1.6,8.45,{uv:!1,ry:Math.PI/2});pe(o,"em"),o.visible=!1,e.name("mirror_writing",{m:o,c:a,tex:r})}),e.addTo("pais",s=>{let a=document.createElement("canvas");a.width=256,a.height=512;let r=a.getContext("2d");r.strokeStyle="rgba(190,20,30,0.9)",r.lineWidth=9,r.lineCap="round",r.fillStyle="rgba(190,20,30,0.9)",r.font='bold 58px "Comic Sans MS", cursive',r.textAlign="center",r.fillText("N\xC3O",128,170),r.fillText("DEIXA",128,250),r.fillText("IGUAL",128,330);let o=new Je(a);o.colorSpace=xe;let l=Ve(s,.9,1.8,new Yt({map:o,transparent:!0,depthWrite:!1}),t.layout.P+1.8,1.1,5.525,{uv:!1});pe(l,"m"),l.visible=!1,e.name("wardrobe_writing",l);let c=G(s,t.layout.P+1.5,.02,6.2);c.rotation.z=.1,Ko(c),c.visible=!1,e.name("hat_floor",c),e.interact(c,{id:"hat_floor",kind:"examine",prompt:()=>"Chap\xE9u de palha"})})}afterApply(){let t=this.g.world,e=this.F,i=t.get("mirror_writing");i&&(i.m.visible=!!e.nameWritten,e.nameWritten&&this.drawMirrorName(e.nameWritten));let s=t.get("wardrobe_writing");s&&(s.visible=!!e.dadFound);let a=t.get("hat_floor");a&&(a.visible=!!e.dadFound&&!e.hasDadKey);let r=t.get("bath_mirror");r&&(r.fog=e.showerOn||e.nameWritten?.75:0);let o=t.doors.get("porta_extra");o&&e.extraUnlocked&&e.act>=2&&(o.locked=!1);let l=t.get("egg_watch");l&&(l.visible=!this.has("relogio_ovo"))}drawMirrorName(t){let e=this.g.world.get("mirror_writing");if(!e)return;let i=e.c.getContext("2d");i.clearRect(0,0,256,360),i.strokeStyle="rgba(255,255,255,0.85)",i.fillStyle="rgba(255,255,255,0.85)",i.font='bold 44px "Comic Sans MS", cursive',i.textAlign="center";let s=String(t).toUpperCase().slice(0,24).split(" ");s.forEach((a,r)=>i.fillText(a,128,150+r*52-(s.length-1)*26)),i.font='28px "Comic Sans MS", cursive',i.fillText("MORA AQUI",128,300),e.tex.needsUpdate=!0}update(t){let e=this.g,i=this.F;if(this.t+=t,this.stuckT+=t,this.timers.length){let l=this.timers.filter(c=>(c.t-=t)<=0);l.length&&(this.timers=this.timers.filter(c=>!l.includes(c)),l.forEach(c=>{c.tk===this.token&&c.fn()}))}this.stuckT>300&&!this._nudged&&this.objId&&(this._nudged=!0,this.toast("Travou? Aperte H para uma dica.",4));let s=e.player.pos,a=e.world.zonesAt(s.x,s.z);this.zones=a;let r=this._prevZones||[];for(let l of a)r.includes(l)||this.onEnter(l);this._prevZones=a,i.stairsOpen&&s.x>11.1&&s.x<13.3&&s.z>9.7&&s.z<10.6?(e.player.pos.x+=100,this.onEnter("descida")):s.x>111.1&&s.x<113.3&&s.z<9.4&&s.z>7.7&&(e.player.pos.x-=100,this.onEnter("subida")),this.customPrompt=null;let o=this["update_"+this.phase];o&&o.call(this,t),this.updateAct(t),this.customPrompt&&e.ui.prompt(this.customPrompt),this.warp=Math.max(0,this.warp-t*.4)}updateAct(t){let e=this.g,i=this.F,s=e.cats.bento;if(e.entity.model.visible&&s.enabled?Math.hypot(e.entity.pos.x-s.pos.x,e.entity.pos.z-s.pos.z)<6&&s.mode!=="stare"&&(s.mode="stare",s.stareAt=e.entity.pos,s.hiss()):s.mode==="stare"&&!this._bentoStareFixed&&(s.mode="idle"),this._creakT=(this._creakT||St(20,40))-t,this._creakT<0&&e.state==="playing"&&!e.cutscene){this._creakT=St(25,60)/(i.act||1);let a=[[2,4],[8.7,7.2],[5.8,5],[-1.5,6],[12,7]],r=a[Math.floor(Math.random()*a.length)],o=Math.random();o<.5?C.play("creak",{pos:[r[0],2.4,r[1]],v:.4}):o<.7&&i.act>=2?C.play("knock",{pos:[r[0],1.2,r[1]],n:1+Math.floor(Math.random()*3),v:.4,gap:.5}):o<.85&&i.act>=2?C.play("whisper",{pos:[r[0],1.5,r[1]],v:.5}):C.play("water_drip",{pos:[5.4,1,9.3],vol:.6})}i.act===1&&Math.random()<t/90&&C.play("car",{pos:[2,-5,-30],bus:"amb"})}onEnter(t){let e=this["enter_"+t];e&&e.call(this);let i=this["enter_"+this.phase+"_"+t];i&&i.call(this)}prompt(t,e){let i=this["prompt_"+t];if(i)return i.call(this,e)}interact(t,e){let i=this["do_"+t];if(i)return i.call(this,e)!==!1;let s=this.examineText(t);return s?(this.g.ui.say("",s,Math.max(3,s.length*.055)),!0):!1}customInteract(){return this._customAction&&this.customPrompt?(this._customAction(),!0):!1}examineText(t){let e=this.F,i=e.act||1,a={sofa:i===1?"O sof\xE1 cinza. Ainda est\xE1 quente de onde voc\xEA estava deitada.":i===2?"O sof\xE1 est\xE1 frio. Como se ningu\xE9m sentasse nele h\xE1 anos.":"O sof\xE1 tem uma marca funda no meio. Do tamanho de algu\xE9m muito alto.",white_table:"A mesinha branca com a bolsa preta, o pote de tampa vermelha e a caixa pl\xE1stica. Tudo no lugar de sempre.",bike:i===1?"A bicicleta preta de para-lamas brancos. O pneu da frente est\xE1 murcho.":"A bicicleta est\xE1 de volta. Os pedais giram devagar, sozinhos.",folding_chair:"A cadeira dobr\xE1vel vinho, encostada perto da porta.",net:e.act===3?"A lua est\xE1 vermelha. Enorme. L\xE1 embaixo, no campo iluminado, algu\xE9m est\xE1 parado bem no meio do gramado, olhando pra c\xE1.":"A tela de prote\xE7\xE3o por causa dos gatos. L\xE1 embaixo, o campo de futebol est\xE1 com os refletores acesos \xE0s tr\xEAs da manh\xE3. O placar diz: CASA 0 x 0 VISITANTE.",drying_rack:"O varal com os len\xE7\xF3is. Est\xE3o \xFAmidos e frios.",washer:"A m\xE1quina de lavar. L\xE1 dentro, s\xF3 roupa molhada.",tank:i>=3&&!e.hasRegistro?void 0:"O tanque. Pinga uma gota a cada tanto.",toilet:"O vaso com a tampa amarelada. A descarga faz barulho a noite toda.",bath_picture:"O quadrinho pendurado no azulejo. Uma paisagem desbotada. Nunca ningu\xE9m soube quem pendurou.",kitchen_stool:"O banquinho alto da cozinha.",kitchen_clock:"O rel\xF3gio parou em 3:33. Os ponteiros tremem, como se tentassem andar.",skates:"Seus patins. Uma rodinha ainda est\xE1 torta daquele tombo.",backpack:Ft("A mochila do col\xE9gio. "+(ue.escola?'O chaveiro diz "'+ue.escola+'".':"Tem um trabalho pra entregar segunda.")),bowl_bento:e.fedCats?"O {bento} est\xE1 comendo, fazendo barulho.":"O pote azul do {bento}. Vazio.",bowl_lili:e.fedCats?"O pote rosa da {lili} continua cheio. Ela n\xE3o veio comer.":"O pote rosa da {lili}. Vazio.",fan:"O ventilador de teto.",desk_photos:i===1?"Fotos da fam\xEDlia na escrivaninha dos pais.":"As fotos dos pais... os rostos est\xE3o em branco, como papel sem nada.",flag:"Uma bandeira preta com uma faixa branca atravessada. Tem um bilhete preso com fita no canto.",bday_photo:e.clownLooked?"A foto da sua festa de 5 anos. O palha\xE7o... est\xE1 olhando pra outro lado agora. Para o corredor.":"A foto da sua festa de 5 anos. Voc\xEA e o palha\xE7o contratado, o Tique-Taque. Voc\xEA n\xE3o lembra muito dele. S\xF3 que ele fazia um truque com um rel\xF3gio.",intercom:"O interfone. Ele s\xF3 toca quando algu\xE9m est\xE1 l\xE1 embaixo.",hat:"O chap\xE9u de palha do pai, pendurado junto com um colar. Ele usa quando vai pra rua.",rack_drawer:"A gaveta do rack. A m\xE3e guarda as fotos antigas a\xED.",cake:"Cinco velinhas. As chamas est\xE3o paradas, sem tremer, como se fossem de vidro.",crt:"Uma TV de tubo, igual a que tinha antes. Passando a sua festa. Em sil\xEAncio.",lamppost:"Um poste de luz no meio do nada. Parece o \xFAnico lugar do mundo onde nunca \xE9 tarde.",bucket:`Um balde velho. L\xE1 no fundo, em vez de \xE1gua, um barulho enorme respirando, muito, muito longe no tempo.
Melhor n\xE3o mexer. Ainda n\xE3o \xE9 a hora.`,washer2:"",white:""}[t];return a?Ft(a):null}onPhoneRaised(){this.F.tutCam||(this.F.tutCam=!0,this.toast(`C\xC2MERA: clique para fotografar.
`+(this.g.phone.apps.video?"Q troca para o V\xCDDEO (casa.mp4).":"A c\xE2mera v\xEA coisas que o olho n\xE3o v\xEA."),4))}onModeChange(t){t==="video"&&!this.F.tutVideo&&(this.F.tutVideo=!0,this.toast(`\u25B6 casa.mp4: voc\xEA v\xEA a casa como o {wendel} gravou.
Procure o que est\xE1 diferente.`,4.5))}diffs(){let t=this.F;return[{id:"quadro",pos:[3.2,1.2,7.8],on:()=>t.act===1&&t.paintingMode!=="floor",label:"DIFERENTE: O QUADRO"},{id:"bike",pos:[3.9,.6,5.8],on:()=>t.act===1&&!t.d_bike,label:"DIFERENTE: A BICICLETA"},{id:"fotos",pos:[.3,.72,2],on:()=>t.act===1&&!t.d_fotos,label:"DIFERENTE: AS FOTOS"},{id:"lencol",pos:[2,1,-.45],on:()=>t.act===1&&!t.d_lencol,label:"DIFERENTE: O LEN\xC7OL"},{id:"cadeira",pos:[1.9,.6,3],on:()=>t.act===2&&!t.d_cadeira,label:"DIFERENTE: A CADEIRA"},{id:"toalha",pos:[4.3,1.6,8.45],on:()=>t.act===2&&!t.d_toalha,label:"DIFERENTE: O ESPELHO"},{id:"extra",pos:[12.21,1.1,7.55],on:()=>t.corridorLong&&t.act<3,label:"ISSO N\xC3O EXISTE NO V\xCDDEO"}].filter(i=>i.on())}lookingAt(t,e=.3,i=7){let s=this.g.camera,a=new I(t[0],t[1],t[2]).sub(s.position),r=a.length();if(r>i)return null;let l=new I(0,0,-1).applyQuaternion(s.quaternion).angleTo(a);return l>e||this.g.world.losBlocked(s.position.x,s.position.z,t[0],t[2])?null:{d:r,ang:l}}viewfinderData(){let t=this.g,e=this.F,i=t.phone,s=r=>{let o=Math.floor(r);return`${String(Math.floor(o/3600)).padStart(2,"0")}:${String(Math.floor(o/60)%60).padStart(2,"0")}:${String(o%60).padStart(2,"0")}`},a={time:i.mode==="video"?"casa.mp4 "+s(this.t*.7%131):t.clockText()+" "+s(this.t)};if(i.mode==="video"&&e.showSim&&(a.sim=`${Math.round(this.sim())}% igual`),i.mode==="video"){for(let r of this.diffs())if(this.lookingAt(r.pos,.28,7)){a.tag=r.label;break}}else for(let r of this.presenceTargets())if(this.lookingAt(r.pos,.3,8)){a.tag=r.label,a.tagEcho=!0;break}return this.recordProgress!==void 0&&(a.progress=this.recordProgress,a.help="MANTENHA ELE NO CENTRO"),i.apps.video||(a.help="clique: foto"),a}presenceTargets(){let t=[];for(let e of this.g.echoes.list.values())/[sk]/.test(e.f.userData.vis||e.opts.spec||"")&&t.push({pos:[e.f.position.x,1.2,e.f.position.z],label:"PRESEN\xC7A"});return this.g.entity.model.visible&&/s/.test(this.g.entity.layerSpec)&&t.push({pos:[this.g.entity.pos.x,1.8,this.g.entity.pos.z],label:"???"}),t}photoTargetsInView(){let t=this.F,e=this.g,i=[{pos:[3.55,1,3.2],cond:()=>e.phone.mode==="video"&&t.act<=2,caption:"Voc\xEA, no v\xEDdeo, sentada no sof\xE1.",detail:"Voc\xEA n\xE3o lembra de estar no sof\xE1 quando o {wendel} gravou."},{pos:[3.2,1.2,7.8],cond:()=>t.act===1&&t.paintingMode!=="floor",caption:"O quadro pendurado na parede."},{pos:[2,1,-.45],cond:()=>t.act===1&&!t.d_lencol,caption:"Tem algu\xE9m embaixo do len\xE7ol?"},{pos:[12.21,1.1,7.55],cond:()=>t.corridorLong,caption:"A porta que n\xE3o existe.",onPhoto:()=>{t.photoExtra=!0}},{pos:[e.clown.model.position.x,1.7,e.clown.model.position.z],cond:()=>e.clown.model.visible,caption:"O palha\xE7o.",detail:"Na foto, ele est\xE1 sorrindo. Ao vivo, n\xE3o."},{pos:[e.entity.pos.x,1.9,e.entity.pos.z],cond:()=>e.entity.model.visible,caption:"ELE.",detail:"A foto saiu tremida. Mas d\xE1 pra ver que ele n\xE3o tem rosto: tem um chiado no lugar."},{pos:[-.55,1,5.2],cond:()=>!!e.echoes.get("mae_route"),caption:"A m\xE3e, repetindo alguma coisa na cozinha."}];for(let a of e.echoes.list.values())a.opts.caption&&i.push({pos:[a.f.position.x,1.2,a.f.position.z],cond:()=>!0,caption:a.opts.caption});let s=[];for(let a of i){if(!a.cond())continue;let r=this.lookingAt(a.pos,.35,9);r&&s.push({...a,ang:r.ang})}return s.sort((a,r)=>a.ang-r.ang)}evidence(){let t=this.F,e=['O celular est\xE1 "Sem servi\xE7o" desde as 3h. Mesmo assim, as mensagens do "{wendel}" chegavam.','O {wendel} de verdade escreve "kkkk", usa \u{1F5A4}\u{1F90D} e te chama de {rafa}. O das 3h escrevia "{rafaela}." e "est\xE1", como algu\xE9m que aprendeu a escrever lendo.','A TV avisou: o visitante n\xE3o pode entrar em uma casa que N\xC3O RECONHECE. Toda coisa "consertada" deixava a casa mais reconhec\xEDvel.','Cada vez que algu\xE9m da fam\xEDlia voltava pelo espelho, a porcentagem do v\xEDdeo ca\xEDa \u2014 e o "{wendel}" ficava bravo.'];return t.askedCats&&e.push('No interfone, a "m\xE3e" disse "do gato", no singular. Ele n\xE3o enxerga os gatos. Os gatos enxergam ele.'),t.laptopSeen&&e.push('No notebook: "Obrigado por me mostrar a casa. Agora eu vou me lembrar dela."'),t.hunt3Done&&e.push("Ele parou na porta que n\xE3o existe. N\xE3o conseguiu passar. A casa fez aquela porta pra voc\xEA."),t.dadFound&&e.push("O espelho do guarda-roupa dizia: N\xC3O DEIXA IGUAL."),e.push("No reflexo da TV desligada, o quadro estava pendurado de cabe\xE7a pra baixo. A casa queria diferente desde o come\xE7o."),t.invited&&e.push("Voc\xEA abriu o port\xE3o pelo interfone. Ele n\xE3o pedia pra entrar no pr\xE9dio. Pedia pra ser convidado."),e}async intro(t){let e=this.g,i=e.ui;this.cut(!0),i.showHud(!0),await i.fade(1,0),this.F.act=1,this.setupLights(),this.setupActors(),this.seedPhone(),e.phone.battery=12,e.player.teleport(3.55,2.5,Math.PI/2,-.12),e.player.eyeH=.98,e.player.apply(),e.tv.set("static"),e.startAmbience("house"),await t.wait(1.2);for(let s=0;s<3;s++)C.play("clock",{tock:s%2===1,vol:1.2,delay:s*.9});await t.wait(2.6),C.speak(Ft("{rafa}... acorda."),{pitch:.9,rate:.75,female:!0,vol:.55}),await t.say("???","*{rafa}... acorda.*",{dur:2.6}),i.toast("03:07",2.5),await i.fade(0,3.5),await t.wait(1),await t.say("{rafa}","*...dormi no sof\xE1 de novo.*",{dur:2.6}),C.play("phone_vibrate",{n:2}),await t.wait(1),this.fakeMessages(),await t.wait(1.5),await t.say("{rafa}",'*U\xE9. T\xE1 escrito "Sem servi\xE7o"... como chegou mensagem?*',{dur:3.4}),await t.say("{rafa}","*Deve ter pegado o wi-fi do vizinho de novo.*",{dur:2.8}),e.player.eyeH=pn,this.cut(!1),this.phase="a1",this.objective("msgs"),i.toast(`WASD: andar \xB7 Mouse: olhar \xB7 E: interagir
TAB: celular \xB7 F: lanterna \xB7 ESC: pausa`,7),e.checkpoint("intro",!0),e.resumePointer(!0)}seedPhone(){let t=this.g.phone;t.threads=[];let e=t.ensureThread("familia","Fam\xEDlia \u{1F3E0}");e.msgs.push({text:"Gente, amanh\xE3 \xE9 faxina. Ningu\xE9m tira nada do lugar.",time:"19:12",day:"ontem"}),e.msgs.push({text:"{rafa}, desliga essa TV e vai dormir.",time:"22:31",day:"ontem"}),e.msgs.push({text:"t\xE1 m\xE3e",time:"22:32",day:"ontem",out:!0}),e.status="M\xE3e, Pai, {wendel}, {julia}, {pedro}";let i=t.ensureThread("wendel","{wendel} \u{1F5A4}");i.msgs.push({text:"rafa pega meu carregador no teu quarto kkkkk esqueci l\xE1 do lado do espelho",time:"17:58",day:"ontem"}),i.msgs.push({text:"e n\xE3o esquece da ra\xE7\xE3o do {bento} e da {lili} \u{1F5A4}\u{1F90D}",time:"17:59",day:"ontem"}),i.msgs.push({text:"t\xE1",time:"18:02",day:"ontem",out:!0}),i.msgs.push({text:"VASCOOOOOO \u{1F5A4}\u{1F90D}\u{1F5A4}\u{1F90D} kkkkkkk",time:"21:40",day:"ontem"}),i.msgs.push({text:"chato",time:"21:41",day:"ontem",out:!0}),i.msgs.push({text:"vou dormir na casa do L\xE9o hj, amanh\xE3 cedo t\xF4 a\xED",time:"23:10",day:"ontem"}),i.msgs.push({text:"cuida da casa kkkk",time:"23:11",day:"ontem"}),i.status="visto por \xFAltimo ontem \xE0s 23:11"}fakeMessages(){let t=this.g.phone,e=["{rafaela}.","Acorda.","Eu gravei a casa hoje \xE0 tarde. O v\xEDdeo est\xE1 no seu celular: casa.mp4","Preciso que voc\xEA confira se a casa est\xE1 igual ao v\xEDdeo. Tudo.","Antes das 3:33."];e.forEach((s,a)=>t.receive("wendel","{wendel} \u{1F5A4}",s,{time:a<2?"03:03":"03:04",silent:a!==0}));let i=t.thread("wendel");i.unread=e.length,i.status="online"}onReadThread(t){t==="wendel"&&this.phase==="a1"&&this.objId==="msgs"&&(this.progress(),this.after(.6,()=>{this.objective("charger"),this.toast("Bateria: 12%. N\xE3o d\xE1 pra rodar o v\xEDdeo assim.",3.5)}))}resume_a1(){let t=this.F;if(t.tvEventPending){this.phase="a1",this.startTVEvent(!0);return}this.objId||this.objective("msgs"),this.g.tv.set(t.tvOff?"off":"static"),t.intercomDone&&!t.sawExtraDoor&&this.objective("bed")}prompt_tv(){let t=this.F;return t.act===1&&t.tvEventStarted||this.phase==="a3_climax"?null:t.act===1&&!t.tvOff&&this.phase==="a1"?"Desligar a TV":t.act===1&&t.tvOff?"Olhar a TV desligada":t.act===3?"Olhar a TV":"TV"}do_tv(){let t=this.F,e=this.g;if(t.act===1&&!t.tvOff&&this.phase==="a1"){t.tvOff=!0,e.tv.set("off"),C.play("tv_off",{pos:[.3,1.4,2.8]}),this.say0("{rafa}","*Pronto. Sil\xEAncio.*");return}if(t.act===1&&t.tvOff){this.say0("","A tela preta reflete a sala. Tem alguma coisa estranha no reflexo... o quadro colorido. No reflexo, ele est\xE1 pendurado de cabe\xE7a pra baixo."),t.sawTVReflection=!0;return}this.say0("",t.act===2?"A TV est\xE1 desligada. O reflexo mostra a sala... sem voc\xEA nela.":"A tela est\xE1 quente. Tem marcas de dedos por dentro do vidro.")}say0(t,e,i){this.g.ui.say(t,e,i||Math.max(2.5,Ft(e).length*.06))}prompt_charger(){return this.F.hasCharger?null:"Pegar o carregador do {wendel}"}do_charger(){this.F.hasCharger=!0,this.give("carregador"),this.g.applyWorld(),this.progress(),this.say0("{rafa}","*Achei. Agora uma tomada.*"),(this.objId==="charger"||this.objId==="msgs")&&this.objective("charge")}onCharge(){let t=this.F,e=this.g;!t.videoUnlocked&&e.phone.battery>=35&&(t.videoUnlocked=!0,e.phone.apps.video=!0,this.progress(),e.phone.receive("wendel","{wendel} \u{1F5A4}","O v\xEDdeo carregou. Assista. Compare com a casa.",{}),this.objective("video"),this.toast(`casa.mp4 liberado!
Segure o bot\xE3o direito e aperte Q para ver o v\xEDdeo.`,5),e.checkpoint("a1_video",!0))}update_a1(t){let e=this.g,i=this.F;this.objId==="video"&&e.phone.raised&&e.phone.mode==="video"&&(this.objective("compare"),i.showSim=!0,this.progress()),this.objId==="compare"&&e.phone.raised&&e.phone.mode==="video"&&!i.sawPaintingDiff&&this.lookingAt([3.2,1.2,7.8],.35,7)&&(i.sawPaintingDiff=!0,this.after(1.2,()=>this.say0("{rafa}","*No v\xEDdeo o quadro t\xE1 no ch\xE3o... e aqui t\xE1 pendurado?*"))),i.fedCats&&!i.bentoAte&&(i.bentoAte=!0),i.act===1&&!i.intercomDone&&this.zones&&this.zones.includes("corredor_fim")&&!i.heardParents&&(i.heardParents=!0,C.play("breath",{pos:[e.layout.P+1.5,1,7.2],dur:2.2,v:.5,out:!0})),this.zones&&this.zones.includes("roxo")&&!i.sawLiliA1&&e.player.crouching&&this.lookingAt([4.72,.15,4.9],.5,3.5)&&(i.sawLiliA1=!0,e.cats.lili.hiss(),this.say0("{rafa}","*{lili}? O que voc\xEA t\xE1 fazendo a\xED embaixo? ...Do que voc\xEA t\xE1 com medo?*")),!i.intercomStarted&&i.fixedQuadro&&i.fedCats&&i.checkedMom&&(i.intercomStarted=!0,this.after(4,()=>this.startIntercom())),i.corridorLong&&!i.sawExtraDoor&&this.zones&&this.zones.includes("corredor")&&e.player.pos.x>8.3&&this.lookingAt([12.21,1.1,7.55],.6,6)&&this.sawExtraDoor(),i.sawExtraDoor&&!i.tvEventStarted&&(this._tvT=(this._tvT||0)+t,(this._tvT>35||this.zones&&this.zones.includes("roxo"))&&this.startTVEvent()),i.sawExtraDoor&&!i.extraKnocked&&Math.hypot(e.player.pos.x-12.2,e.player.pos.z-7.4)<1.3&&(i.extraKnocked=!0,this.after(.8,()=>C.play("knock",{pos:[12.2,1.2,8.1],n:3,gap:.7,v:.8})))}prompt_painting(){let t=this.F;return t.act===1&&t.paintingMode!=="floor"?t.videoUnlocked?"Colocar o quadro no ch\xE3o (como no v\xEDdeo)":"Examinar o quadro":t.act===3&&t.paintingMode!=="upside"?"Pendurar o quadro de cabe\xE7a pra baixo":"Examinar o quadro"}do_painting(){let t=this.F,e=this.g;if(t.act===1&&t.paintingMode!=="floor"){if(!t.videoUnlocked){this.say0("{rafa}","*O quadro colorido da sala. Ele n\xE3o ficava encostado no ch\xE3o?*");return}t.paintingMode="floor",t.fixedQuadro=!0,e.applyWorld(),C.play("thud",{pos:[3.2,.5,7.8],v:.6}),this.progress(),this.onFix("quadro"),this.after(1.5,()=>{this.msg("Isso."),this.after(1.4,()=>this.msg("Tem mais coisas diferentes. E n\xE3o esque\xE7a da ra\xE7\xE3o dos gatos. Veja tamb\xE9m se a sua m\xE3e est\xE1 dormindo.")),this.after(2.5,()=>{this.objective("a1list")})});return}if(t.act===3&&t.paintingMode!=="upside")return this.rupturePainting();this.say0("",t.paintingMode==="upside"?"De cabe\xE7a pra baixo. Do jeito que a casa quer.":"O quadro colorido. Duas pessoas abra\xE7adas, um cora\xE7\xE3o em cima.")}onFix(t){let e=this.g,i=e.cats.bento;C.play("chime",{notes:[69,72,76],v:.5}),this.toast(`Diferen\xE7a corrigida \xB7 casa.mp4: ${Math.round(this.sim())}% igual`,2.6),i.enabled&&Math.hypot(i.pos.x-e.player.pos.x,i.pos.z-e.player.pos.z)<7&&(i.hiss(),i.mode="stare",i.stareAt=e.player.pos.clone(),this.after(1.6,()=>{i.goTo(-1.4,6.8,()=>{i.mode="idle"})}),this.F.bentoHissNote||(this.F.bentoHissNote=!0,this.after(2,()=>this.say0("{rafa}","*U\xE9, {bento}. T\xE1 bravo comigo?*")))),this.after(3,()=>C.play("creak",{pos:[12,2.3,7.2],v:.35}))}prompt_bike_bath(){return this.F.act===1&&!this.F.d_bike?this.F.videoUnlocked?"Levar a bicicleta de volta pra sala":"A bicicleta... no box?":null}async do_bike_bath(){let t=this.F,e=this.g;if(!t.videoUnlocked){this.say0("{rafa}","*Quem colocou a bicicleta dentro do box? Isso \xE9 coisa do {pedro}?*");return}this.cut(!0),await e.ui.fade(1,.5),C.play("creak",{v:.4}),C.play("thud",{v:.4,delay:.3}),t.d_bike=!0,e.applyWorld(),await new Promise(i=>setTimeout(i,600)),await e.ui.fade(0,.5),this.cut(!1),this.onFix("bike")}prompt_rack_photos(){let t=this.F;return t.act===1&&!t.d_fotos?t.videoUnlocked?"Levantar as fotos (como no v\xEDdeo)":"Fotos viradas pra baixo":"Olhar as fotos"}do_rack_photos(){let t=this.F;if(t.act===1&&!t.d_fotos){if(!t.videoUnlocked){this.say0("{rafa}","*As fotos da fam\xEDlia est\xE3o viradas pra baixo. Todas.*");return}t.d_fotos=!0,this.g.applyWorld(),C.play("page"),this.onFix("fotos");return}this.say0("",t.act===1?"Fotos da fam\xEDlia. Todo mundo sorrindo.":t.act===2?"As fotos... os rostos sumiram. S\xF3 ficou o seu.":"Todos os rostos est\xE3o riscados. Menos o seu.")}prompt_sheet_figure(){return this.F.act===1&&!this.F.d_lencol?"Puxar o len\xE7ol":null}async do_sheet_figure(){let t=this.F,e=this.g;this.cut(!0,{look:!0}),C.play("breath",{dur:1.2,v:.7}),await new Promise(i=>setTimeout(i,900)),t.d_lencol=!0,e.applyWorld(),C.play("page",{vol:.8}),this.cut(!1),this.say0("{rafa}","*...n\xE3o tem ningu\xE9m. Era s\xF3 o len\xE7ol. Era s\xF3 o len\xE7ol.*"),t.videoUnlocked&&this.onFix("lencol")}prompt_stool(){return this.has("banquinho")?null:"Pegar o banquinho"}do_stool(){this.F.stoolAt="inv",this.give("banquinho"),this.g.applyWorld()}prompt_racao(){let t=this.F;return t.hasRacao||t.fedCats?null:t.stoolAt==="shelf"?"Pegar a ra\xE7\xE3o":this.has("banquinho")?"Colocar o banquinho e subir":"A ra\xE7\xE3o (alto demais)"}do_racao(){let t=this.F,e=this.g;if(t.stoolAt!=="shelf"){if(!this.has("banquinho")){this.say0("{rafa}","*T\xE1 l\xE1 em cima. N\xE3o alcan\xE7o. Preciso subir em alguma coisa.*"),this.F.triedRacao=!0;return}this.take("banquinho"),t.stoolAt="shelf",e.applyWorld(),C.play("thud",{v:.4})}t.hasRacao=!0,this.give("racao"),e.applyWorld(),this.progress(),this.say0("{rafa}","*Agora os potes, na cozinha.*")}prompt_stool_fridge(){return null}prompt_bowl_bento(){return this.has("racao")&&!this.F.fedCats?"Servir a ra\xE7\xE3o":void 0}prompt_bowl_lili(){return this.has("racao")&&!this.F.fedCats?"Servir a ra\xE7\xE3o":void 0}do_bowl_bento(){return this.has("racao")&&!this.F.fedCats?this.feedCats():!1}do_bowl_lili(){return this.has("racao")&&!this.F.fedCats?this.feedCats():!1}feedCats(){let t=this.F,e=this.g;t.fedCats=!0,C.play("ice",{pos:[-1,.2,7.6]}),e.applyWorld(),this.progress();let i=e.cats.bento;i.meow(1),i.goTo(-1.25,7.35,()=>{i.mode="eat",i.yaw=Math.PI}),this.after(4,()=>this.say0("{rafa}","*O {bento} veio correndo. A {lili} n\xE3o.*")),this.toast(this.statusLines().join(`
`),3)}prompt_porta_pais(){if(this.F.act===1)return"Bater na porta"}do_porta_pais(){let t=this.F,e=this.g;if(t.act!==1)return!1;let i=e.layout.P;C.play("knock",{pos:[i,1.2,7.2],n:3,v:.9}),t.checkedMom?this.after(2,()=>this.say0("M\xE3e","*(abafado)* {rafa}... dorme.")):(t.checkedMom=!0,this.progress(),this.after(2.2,()=>{this.voice("Hmmm... vai dormir, {rafa}. J\xE1 \xE9 tarde.",{tts:"mae",vol:.45}),this.g.ui.say("M\xE3e","*(abafado)* Hmmm... vai dormir, {rafa}. J\xE1 \xE9 tarde.",3.2)}),this.after(6,()=>{C.play("breath",{pos:[i+2,1,7.2],dur:2.5,v:.5}),this.toast(this.statusLines().join(`
`),3)}))}prompt_porta_meninos(){}prompt_bed_meninos(){return this.F.act===1?"Olhar":void 0}do_bed_meninos(){if(this.F.act!==1)return!1;this.say0("","O {pedro} dorme de boca aberta, enrolado no len\xE7ol rosa. Ronca baixinho.")}prompt_bed_roxo(){return this.F.act===1?this.g.player.crouching?"Olhar embaixo da cama":"Olhar a {julia}":void 0}do_bed_roxo(){let t=this.F;if(t.act!==1)return!1;if(this.g.player.crouching){this.g.cats.lili.hiss(),this.say0("{rafa}","*A {lili} t\xE1 l\xE1 no fundo, com os olhos arregalados. Ela n\xE3o quer sair. Ela t\xE1 olhando... pra porta.*"),t.sawLiliA1=!0;return}this.voice("Rafa... apaga a luz...",{tts:"julia",vol:.4}),this.say0("{julia}","*(dormindo)* {rafa}... apaga a luz...")}prompt_round_mirror(){return"Olhar o espelho redondo"}do_round_mirror(){if(this.F.act===1){this.say0("{rafa}","*Meu cabelo t\xE1 um ninho. ...Por um segundo, parecia que meu reflexo demorou pra se mexer.*");return}return this.mirrorJulia()}prompt_wardrobe_mirror(){return"Olhar o espelho"}do_wardrobe_mirror(){let t=this.F;if(t.dadFound){this.say0("","Escrito no espelho, s\xF3 no reflexo: N\xC3O DEIXA IGUAL.");return}this.say0("",t.act===1?"O espelho do guarda-roupa. Voc\xEA de pijama... quer dizer, de camisa preta com a faixa. A da sorte.":"No espelho, o quarto parece mais arrumado do que est\xE1.")}prompt_bath_mirror(){let t=this.F;return t.act===3&&t.showerOn&&!t.nameWritten?"Escrever no espelho emba\xE7ado":"Olhar o espelho"}do_bath_mirror(){let t=this.F;if(t.act===3&&t.showerOn&&!t.nameWritten)return this.ruptureMirror();this.say0("",t.act===3?"Voc\xEA no espelho. S\xF3 voc\xEA. Nenhuma sombra atr\xE1s.":"O espelho do banheiro. Voc\xEA parece cansada.")}prompt_keyholder(){let t=this.F;return t.oldKeyShown&&!t.hasOldKey?"Pegar a chave velha":t.act===3&&!t.keysHung?"Pendurar as chaves da fam\xEDlia":"Olhar o porta-chaves"}do_keyholder(){let t=this.F;if(t.oldKeyShown&&!t.hasOldKey){t.hasOldKey=!0,this.give("chave_velha"),this.g.applyWorld(),this.say0("{rafa}","*Essa chave n\xE3o \xE9 de ningu\xE9m daqui. Tinha cinco chaves nesse porta-chaves. Agora tinha seis.*");return}if(t.act===3&&!t.keysHung)return this.ruptureKeys();this.say0("",t.act===1?'O porta-chaves "Fam\xEDlia". Cinco chaves, cinco chaveiros. Todo mundo em casa.':t.keysHung?"Todas as chaves da fam\xEDlia de volta. E mais uma, velha, que agora tamb\xE9m \xE9 de casa.":'O porta-chaves "Fam\xEDlia" est\xE1 vazio.')}startIntercom(){let t=this.g,e=this.F;this.objective("intercom"),this.ringing=!0;let i=()=>{if(this.ringing){if(C.play("intercom",{pos:[.07,1.45,7.65],dur:1.3,vol:1.1}),this._ringCount=(this._ringCount||0)+1,this._ringCount>20){this.ringing=!1,e.intercomIgnored=!0,this.afterIntercom(3);return}this.after(2.6,i)}};i(),this.after(2,()=>this.say0("{rafa}","*O interfone? \xC0s tr\xEAs da manh\xE3?*"))}prompt_intercom(){return this.ringing?"Atender o interfone":"Interfone"}do_intercom(){if(!this.ringing){this.say0("",this.examineText("intercom"));return}this.ringing=!1,this.run(async t=>{let e=this.g,i=this.F,s=e.ui;this.cut(!0,{look:!0}),C.play("switch"),C.play("intercom_static",{dur:2,vol:.6}),await t.wait(1.2),await t.say("Voz no interfone","{rafa}? Sou eu, a m\xE3e. Esqueci a chave. Abre pra mim, filha?",{tts:"mae",vol:.6,dur:4.2});let a=await s.choice("A voz parece a da sua m\xE3e. Mas a porta do quarto dela estava trancada por dentro.",["Apertar o bot\xE3o e abrir o port\xE3o","M\xE3e? Voc\xEA t\xE1 dormindo no quarto.","Se for voc\xEA mesmo... qual o nome dos gatos?","Desligar sem dizer nada"]);e.resumePointer(!0),a===0?(i.invited=!0,C.play("intercom",{dur:.6,vol:.8}),await t.wait(1.4),C.play("door_slam",{pos:[1,-8,12],vol:.6}),await t.say("Voz no interfone","...obrigada.",{dur:2.2,kind:"enemy",tts:"inq"})):a===1?(await t.wait(1.6),await t.say("Voz no interfone","T\xF4?",{dur:2,kind:"enemy",tts:"inq"}),C.play("intercom_static",{dur:1.2,vol:1.1}),await t.say("Voz no interfone","Ent\xE3o quem t\xE1 no quarto?",{dur:2.8,kind:"enemy"})):a===2?(i.askedCats=!0,await t.wait(1.4),await t.say("Voz no interfone","...do gato, filha. Abre.",{dur:2.8,kind:"enemy",tts:"mae"}),C.play("intercom_static",{dur:1.2,vol:1.1}),await t.say("{rafa}",'*"Do gato"? A gente tem DOIS.*',{dur:2.8})):await t.wait(.6),C.play("switch"),this.cut(!1),this.afterIntercom(1)})}afterIntercom(t){let e=this.F;e.intercomDone=!0,this.after(t,()=>this.run(async i=>{let s=this.g;C.play("power_down",{vol:.5}),s.lightMul=0,await i.wait(.6),e.corridorLong=!0,e.oldKeyShown=!0;let a=s.player.pos.clone(),r=s.player.yaw;s.rebuildWorld(),this.setupLights(),s.player.teleport(a.x,a.z,r,s.player.pitch),await i.wait(.6),C.play("power_up",{vol:.5}),s.lightMul=1,C.play("wrong",{v:.6}),await i.wait(1.5),e.invited?this.msg("Voc\xEA abriu."):this.msg("N\xE3o abra a porta pra ningu\xE9m."),await i.wait(1.8),this.msg("Agora volte para o seu quarto e fique l\xE1."),this.objective("bed"),s.checkpoint("a1_intercom")}))}sawExtraDoor(){let t=this.F;t.sawExtraDoor=!0,C.play("wrong",{v:.9}),this.warp=1.2,this.progress(),this.run(async e=>{await e.say("{rafa}","*Essa porta... essa porta n\xE3o existia.*",{dur:2.8}),await e.say("{rafa}","*O corredor t\xE1 mais comprido. T\xE1. Mais. Comprido.*",{dur:2.8}),await e.wait(1),this.msg("Essa porta n\xE3o est\xE1 no v\xEDdeo. N\xE3o abra."),this.F.tvEventStarted||this.objective("extradoor")})}prompt_porta_extra(){let t=this.F;if(t.act===1)return this.has("chave_velha")?"Tentar a chave velha":"Abrir";if(t.act===2&&!t.extraUnlocked)return this.has("chave_velha")?"Tentar a chave velha":"Abrir"}do_porta_extra(t){let e=this.F,i=this.g.world.doors.get("porta_extra");return e.extraUnlocked?!1:(C.play("locked",{pos:i.center}),this.has("chave_velha")?(C.play("unlock",{pos:i.center,vol:.6}),this.say0("{rafa}","*A chave gira... mas alguma coisa do outro lado segura a ma\xE7aneta.*")):this.say0("{rafa}","*A ma\xE7aneta n\xE3o gira. Parece de mentira.*"),e.act===1&&!e.extraHeld&&(e.extraHeld=!0,this.after(1.5,()=>C.play("knock",{pos:[12.2,1.2,8.1],n:2,gap:.9,v:.7}))),!0)}startTVEvent(t=!1){let e=this.F,i=this.g;e.tvEventStarted&&!t||(e.tvEventStarted=!0,e.tvEventPending=!0,i.clockMin=212,i.tv.set("static"),C.play("tv_on",{pos:[.3,1.4,2.8],vol:1.4}),this.objective("tv"),t||i.checkpoint("a1_tv",!0),this.tvArmed=!0,(this.zones||[]).includes("sala")&&this.after(2,()=>this.enter_sala()))}enter_sala(){this.tvArmed&&this.phase==="a1"&&(this.tvArmed=!1,this.run(t=>this.tvBroadcast(t)))}async tvBroadcast(t){let e=this.g,i=this.F;await t.wait(1.5),e.clockMin=213;let s=[["","CANAL 0",2.6],["AVISO AOS MORADORES","",3],["H\xC1 UM VISITANTE NO PR\xC9DIO.","",3.4],["O VISITANTE N\xC3O PODE ENTRAR","EM UMA CASA QUE N\xC3O RECONHECE.",4.6],["MANTENHA A SUA CASA","COMO VOC\xCA SE LEMBRA DELA.",4.2],["N\xC3O OLHE PARA TR\xC1S","DURANTE A TRANSMISS\xC3O.",3.6]],a=0,r=0;e.tv.set("canvas",(p,m,M,A)=>{let b=s[Math.min(a,s.length-1)];a===0?(["#c0c0c0","#c0c000","#00c0c0","#00c000","#c000c0","#c00000","#0000c0"].forEach((S,R)=>{p.fillStyle=S,p.fillRect(R*m/7,0,m/7+1,M*.7)}),p.fillStyle="#111",p.fillRect(0,M*.7,m,M*.3),p.fillStyle="#fff",p.font="bold 44px monospace",p.textAlign="center",p.fillText("CANAL 0",m/2,M*.88)):(p.fillStyle="#0a1a3a",p.fillRect(0,0,m,M),p.fillStyle="#e8e8e8",p.textAlign="center",p.font="bold 30px monospace",p.fillText(b[0],m/2,M*.42),p.font="bold 26px monospace",p.fillText(b[1],m/2,M*.58),p.font="14px monospace",p.fillStyle="#9ab",p.textAlign="left",p.fillText("CANAL 0 \xB7 03:33",14,24));for(let w=0;w<40;w++)p.fillStyle=`rgba(255,255,255,${Math.random()*.12})`,p.fillRect(0,Math.random()*M,m,1)}),C.play("record_beep",{pos:[.3,1.4,2.8],vol:1.2});for(let p=0;p<s.length;p++)a=p,p>0&&(this.voice((s[p][0]+" "+s[p][1]).toLowerCase(),{tts:"tv"}),e.ui.say("TV",s[p][0]+" "+s[p][1],s[p][2]-.2,"house")),await t.wait(s[p][2]);let o=e.cctvCam;o.position.set(4,2.45,7.7);let l=e.player.pos;o.lookAt(l.x,1,l.z);let c=e.entity,h=new I(Math.sin(e.player.yaw),0,Math.cos(e.player.yaw)).multiplyScalar(1.5);c.show(l.x+h.x,l.z+h.z,e.player.yaw,"c"),e.tv.set("cctv"),this.cctvOverlay("C\xC2MERA 2 \xB7 SALA \xB7 AO VIVO"),C.play("swell",{dur:5,v:.5}),e.ui.say("{rafa}","*Essa imagem... \xE9 a sala. Agora. Aquela ali sou eu.*",3.2);let d=e.player.yaw,u=0;for(;u<7;){await t.wait(.1),u+=.1;let p=e.player.pos,m=new I(Math.sin(e.player.yaw),0,Math.cos(e.player.yaw)),M=Math.max(.55,1.5-u*.14);if(c.place(p.x+m.x*M,p.z+m.z*M,e.player.yaw),o.lookAt(p.x,1.2,p.z),Math.abs(si(d,e.player.yaw))>1.9)break}this.cut(!0),e.tv.set("static");let f=e.player.pos,g=new I(-Math.sin(e.player.yaw),0,-Math.cos(e.player.yaw));await e.player.turnTo(e.player.yaw+Math.PI,.05,.25);let _=new I(-Math.sin(e.player.yaw),0,-Math.cos(e.player.yaw));c.show(f.x+_.x*.55,f.z+_.z*.55,e.player.yaw,"ecv"),c.model.position.y=-.75,te.scare>0?(C.play("stinger",{v:te.scare===2?1:.5}),e.player.shake(te.scare===2?1.2:.5),this.glitch=1,e.ui.flash(te.scare===2?.6:.25,.2)):C.play("boom",{v:.6}),await t.wait(te.scare===2?.8:.4),await e.ui.fade(1,.05),this.glitch=0,c.hide(),e.tv.set("off"),e.stopAmbience(),C.play("power_down",{vol:.8}),C.music(null),await t.wait(3),i.tvEventPending=!1,this.startAct2(t)}cctvOverlay(t){let e=this.g,i=document.createElement("canvas");i.width=512,i.height=288;let s=i.getContext("2d");s.fillStyle="#fff",s.font="bold 18px monospace",s.fillText(t,14,26),s.fillStyle="#e22",s.beginPath(),s.arc(490,20,7,0,Math.PI*2),s.fill(),s.fillStyle="#fff",s.font="16px monospace",s.fillText("03:33:"+String(Math.floor(Math.random()*60)).padStart(2,"0"),14,276);let a=new Je(i);a.colorSpace=xe,e.tv.cctvMat=new ze({uniforms:{tRT:{value:e.cctvRT.texture},tOv:{value:a},time:{value:0}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:`uniform sampler2D tRT; uniform sampler2D tOv; uniform float time; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
        void main(){ vec3 c = texture2D(tRT, vUv).rgb; float l = dot(c, vec3(0.3,0.59,0.11));
          c = vec3(l) * vec3(0.8, 1.0, 0.85) * 3.6 + vec3(0.02, 0.04, 0.02); c += (h(vUv*512.0 + time) - 0.5) * 0.12; c *= 0.85 + 0.15*sin(vUv.y*300.0);
          vec4 o = texture2D(tOv, vUv); c = mix(c, o.rgb, o.a); gl_FragColor = vec4(c, 1.0); }`}),e.tv.set("cctv")}enter_corredor(){this.phase==="a2"&&this.F.power&&!this.F.hunt1Done&&this.hunt1()}};Object.assign(Ba.prototype,hf,pf);var Vs="casa-se-lembra/save/v1",gh=6,fl=class{constructor(){let t=document.getElementById("app");this.renderer=new Do({antialias:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1}),this.renderer.toneMapping=Ci,this.renderer.outputColorSpace=xe,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Xn,this.renderer.setClearColor(0),t.appendChild(this.renderer.domElement),xd(Math.min(8,this.renderer.capabilities.getMaxAnisotropy())),this.scene=new Gn,this.scene.fog=new Qs(131586,.055),this.camera=new Ge(te.fov,innerWidth/innerHeight,.05,200),this.camera.layers.set(ai.EYE),this.scene.add(this.camera),this.hemi=new la(9081768,1709072,.22),this.hemi.layers.enableAll(),this.scene.add(this.hemi),this.pool=[];for(let e=0;e<gh;e++){let i=new Pn(16777215,0,7,2);i.layers.enableAll(),this.scene.add(i),this.pool.push(i)}this.flashL=new Pn(16777215,0,8,2),this.flashL.layers.enableAll(),this.scene.add(this.flashL),this.flashT=0,this.post=new Oo(this.renderer),this.input=new ko(this.renderer.domElement),this.input.onLockChange=e=>this._onLock(e),this.world=new qo(this.scene),this.world.game=this,this.flags={},this.inventory=new zs,this.notes=[],this.rules=[],this.ui=new rl(this),this.player=new sl(this,this.camera),this.phone=new al(this),this.phone.attach(this.scene),this.entity=new ol(this),this.entity.onCatch=e=>this.caught(e),this.clown=new ll(this),this.echoes=new cl(this),this.esquecido=new hl(this),this.cats={bento:new Oa(this,"bento"),lili:new Oa(this,"lili")},this.body=af(),pe(this.body,"mc"),this.scene.add(this.body),this.story=new Ba(this),this.audioEngine=C,this.raycaster=new da,this.raycaster.layers.set(ai.EYE),this.raycaster.far=3,this.hover=null,this.state="menu",this.cutscene=!1,this.time=0,this.clockMin=187,this.checkpointData=null,this.chargeHold=0,this.fear=0,this.deaths=0,this.ambience=[],this.tv=new vh(this),this.cctvCam=new Ge(60,16/9,.05,40),this.cctvCam.layers.set(ai.CCTV),this.cctvRT=new Ze(512,288,{type:li}),this.cctvOn=!1,this.ui.cb={onNew:()=>this.newGame(),onContinue:()=>this.continueGame(),onResume:()=>this.resume(),onQuit:()=>this.quitToMenu(),onLastCheckpoint:()=>{this.ui.showPause(!1),this.loadCheckpoint()},onHint:()=>this.story.hint()},C.occlude=e=>{let i=e.x!==void 0?e.x:e[0],s=e.z!==void 0?e.z:e[2],a=this.player.pos;return this.world.losBlocked(a.x,a.z,i,s)?1:0},tf((e,i,s,a)=>this.world.losBlocked(e,i,s,a)),this.renderer.domElement.addEventListener("click",()=>{this.state==="playing"&&!this.ui.paused&&!this.input.locked&&this.resumePointer(!0)}),window.addEventListener("resize",()=>this.resize()),this.applySettings(),this.resize(),this.rebuildWorld(),this.player.teleport(3.3,3.2,Math.PI/2+.2,-.05),this.ui.loading(!1),this.ui.showMenu(),this.last=performance.now(),requestAnimationFrame(e=>this.loop(e))}applySettings(){this.camera.fov=te.fov,this.camera.updateProjectionMatrix(),this.resize()}resize(){let t=Math.min(window.devicePixelRatio||1,1.5);te.quality==="low"?t=.6:te.quality==="auto"&&(t=Math.min(t,innerWidth>1600?1:1.25)),this.renderer.setPixelRatio(t),this.renderer.setSize(innerWidth,innerHeight),this.camera.aspect=innerWidth/innerHeight,this.camera.updateProjectionMatrix(),this.post.setSize(),this.renderer.shadowMap.enabled=te.quality!=="low"}rebuildWorld(){for(let t of[...this.world.sections.keys()])this.world.remove(t);this.layout=nf(this.world,this.flags),this.flags.basementBuilt&&nl(this.world,this.flags),dh(this.world,this.flags),this.story.afterBuild&&this.story.afterBuild()}applyWorld(){dh(this.world,this.flags),this.story.afterApply&&this.story.afterApply()}hasSave(){try{return!!localStorage.getItem(Vs)}catch{return!1}}newGame(){C.init(),this.input.lock();try{localStorage.removeItem(Vs)}catch{}this.resetState(),this.ui.hideMenu(),this.state="playing",this.ui.showHud(!0),this.story.start()}continueGame(){C.init(),this.input.lock();let t=null;try{t=JSON.parse(localStorage.getItem(Vs))}catch{t=null}if(!t){this.newGame();return}this.ui.hideMenu(),this.state="playing",this.ui.showHud(!0),this.restore(t)}quitToMenu(){this.ui.showPause(!1),this.state="menu",this.cutscene=!1,this.story.abort(),this.entity.hide(),C.stopAllLoops(.3),C.music("menu"),C.hush(),this.ui.clearSubs(),this.ui.showMenu(),this.input.unlock()}pause(){this.state!=="playing"||this.ui.overlay||(this.ui.showPause(!0),this.input.unlock())}resume(){this.ui.showPause(!1),this.resumePointer(!0)}resumePointer(t){this.state==="playing"&&(this.ui.paused&&!t||(this.input.lock(),setTimeout(()=>{!this.input.locked&&this.state==="playing"&&!this.ui.paused&&this.ui.clickToPlay(!0)},350)))}_onLock(t){if(t){this.ui.clickToPlay(!1),C.resume();return}this.state==="playing"&&!this.ui.overlay&&!this.ui.paused&&!this._endingNow&&this.pause()}resetState(){this.flags={act:1},this.inventory=new zs,this.notes=[],this.rules=[],this.phone.threads=[],this.phone.gallery=[],this.phone.battery=12,this.phone.apps={video:!1,radio:!1},this.phone.flashlight=!1,this.phone.radioOn&&this.phone.toggleRadio(!1),this.phone.mode="camera",this.clockMin=187,this.deaths=0,this.time=0,this.echoes.clear(),this.entity.hide(),this.clown.hide(),this.esquecido.hide(),this.tv.set("off"),this.cctvOn=!1,this.rebuildWorld()}snapshot(t){return{v:1,id:t,flags:JSON.parse(JSON.stringify(this.flags)),inv:this.inventory.list(),notes:this.notes,rules:this.rules,phone:{battery:Math.max(this.phone.battery,25),apps:this.phone.apps,threads:this.phone.threads,gallery:this.phone.gallery.slice(0,10),flashlight:this.phone.flashlight},player:{x:this.player.pos.x,z:this.player.pos.z,yaw:this.player.yaw},clock:this.clockMin,time:this.time,deaths:this.deaths,story:this.story.save()}}checkpoint(t,e=!1){this.checkpointData=this.snapshot(t);try{localStorage.setItem(Vs,JSON.stringify(this.checkpointData))}catch{this.checkpointData.phone.gallery=[];try{localStorage.setItem(Vs,JSON.stringify(this.checkpointData))}catch{}}e||this.ui.toast("progresso salvo",1.6)}loadCheckpoint(){let t=this.checkpointData||(()=>{try{return JSON.parse(localStorage.getItem(Vs))}catch{return null}})();t&&this.restore(t)}restore(t){this.story.abort(),this.cutscene=!1,this.ui.clearSubs(),C.hush(),C.stopAllLoops(.2),this.entity.hide(),this.clown.hide(),this.esquecido.hide(),this.echoes.clear(),this.flags=JSON.parse(JSON.stringify(t.flags)),this.inventory=new zs,t.inv.forEach(e=>this.inventory.add(e)),this.notes=t.notes||[],this.rules=t.rules||[],this.phone.battery=t.phone.battery,this.phone.apps={...t.phone.apps},this.phone.threads=t.phone.threads||[],this.phone.gallery=t.phone.gallery||[],this.phone.flashlight=!!t.phone.flashlight,this.phone.radioOn&&this.phone.toggleRadio(!1),this.clockMin=t.clock,this.time=t.time||0,this.deaths=t.deaths||0,this.tv.set("off"),this.cctvOn=!1,this.player.hidden&&this.player.exitHide(),this.rebuildWorld(),this.player.teleport(t.player.x,t.player.z,t.player.yaw),this.checkpointData=t,this.ui.fade(1,0).then(()=>this.ui.fade(0,1.2)),this.story.load(t.story||{},t.id),this.resumePointer(!0)}noise(t,e,i){this.entity.hear(t,e,i)}async caught(t){if(this._dying)return;this._dying=!0,this.cutscene=!0;let e=this.entity,i=te.scare;this.player.hidden&&this.player.exitHide();let s=this.camera,a=new I(0,0,-1).applyQuaternion(s.quaternion);e.model.visible=!0,pe(e.model,"ecv"),e.place(s.position.x+a.x*.55,s.position.z+a.z*.55,Math.atan2(a.x,a.z)),e.model.position.y=s.position.y-2.3,e.state="static",i>0?(C.play("stinger",{v:i===2?1:.5}),this.player.shake(i===2?1.2:.5),this.post.uniforms.glitch.value=1,this.ui.flash(i===2?.7:.3,.25,"#fff"),await this.wait(i===2?.9:.5,!0)):C.play("boom",{v:.6}),await this.ui.fade(1,.15),e.hide(),this.post.uniforms.glitch.value=0,this.deaths++;let r=this.deaths;this.ui.say("","*A casa esquece o que aconteceu. Voc\xEA n\xE3o.*",2.6),await this.wait(1.6,!0),this._dying=!1,this.loadCheckpoint(),this.deaths=r,this.checkpointData&&(this.checkpointData.deaths=r)}flashLight(t){let e=this.camera;this.flashL.position.copy(e.position),this.flashL.intensity=30,this.flashT=t}wait(t,e=!1){return new Promise(i=>{if(e){setTimeout(i,t*1e3*(this.ui.fast?.02:1));return}this._waits=this._waits||[],this._waits.push({t,res:i,token:this.story.token})})}clockText(){let t=Math.floor(this.clockMin)%1440;return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0")}usePowerbank(){this.inventory.has("powerbank")&&(this.inventory.remove("powerbank"),this.phone.battery=Math.min(100,this.phone.battery+60),C.play("record_beep"),this.ui.toast("Celular carregado com a bateria port\xE1til."))}onKey(t){if(this.state==="playing"){if(t==="Escape"){this.pause();return}this.ui.paused||(t==="KeyE"&&this.interact(),!(this.cutscene&&!this.allowPhoneInCutscene)&&(t==="KeyF"&&this.phone.toggleFlashlight(),t==="Tab"&&(this.cutscene||this.ui.openPhone("home")),t==="KeyI"&&this.ui.openInventory(),t==="KeyJ"&&this.ui.openJournal(),t==="KeyH"&&this.story.hint(),t==="KeyR"&&this.phone.toggleRadio()))}}interact(){if(this.cutscene&&!this.allowInteractInCutscene)return;if(this.player.hidden){this.story.blockExitHide||this.player.exitHide();return}if(this.story.customInteract&&this.story.customInteract())return;let t=this.hover;if(t&&this.story.interact(t.id,t)!==!0){if(t.kind==="hide"){let e=this.world.hides.find(i=>i.id===t.id);e&&(this.story.onHide&&this.story.onHide(e),this.player.hideIn(e));return}t.action&&t.action()}}updateHover(){if(this.player.hidden||this.cutscene&&!this.allowInteractInCutscene||this.phone.raised){this.hover=null,this.ui.prompt(this.player.hidden?this.story.blockExitHide?null:"Sair do esconderijo":null);return}this.raycaster.setFromCamera({x:0,y:0},this.camera),this.raycaster.far=3;let t=[...this.world.sections.values()].map(a=>a.group);for(let a of t)a.updateMatrixWorld();let e=this.raycaster.intersectObjects(t,!0),i=null;for(let a of e){let r=a.object;if(!r.visible)continue;let o=null;for(;r&&!o;)o=this.world.meshToInteract.get(r),o||(r=r.parent);if(o){let l=!0,c=a.object;for(;c;){if(!c.visible){l=!1;break}c=c.parent}if(!l)continue;a.distance<=(o.dist||2.3)&&(i=o);break}if(!(a.object.material&&a.object.material.visible===!1)&&!(a.object.material&&a.object.material.transparent&&a.object.material.opacity<.5))break}let s=null;if(i){let a=this.story.prompt(i.id,i);s=a!==void 0?a:i.prompt?i.prompt():"Examinar",s||(i=null)}this.hover=i,this.ui.prompt(s)}updateLights(t){let e=this.player.pos,i=this.player.eye,s=this.world.roomAt(e.x,e.z),a=this.world.fixtures;for(let o of a){let l=o.on?1:0;o.level+=(l-o.level)*Math.min(1,t*(o.on?3:6));let c=1;o.flicker>0&&(o.flicker-=t,c=Math.random()<.35?.05:Math.random()<.5?.6:1),o.fl=c;let h=o.room===s||!this.world.losBlocked(i.x,i.z,o.x,o.z);o.seen=(o.seen||0)+((h?1:0)-(o.seen||0))*Math.min(1,t*5),o.bulb&&o.bulb.color.setRGB(.15+.85*o.level*c,.13+.82*o.level*c,.12+.75*o.level*c)}let r=a.filter(o=>o.level*o.intensity>.01&&o.seen>.02).map(o=>({f:o,s:Math.hypot(o.x-e.x,o.z-e.z)-(o.room===s?3:0)-(o.priority||0)})).sort((o,l)=>o.s-l.s).slice(0,gh);for(let o=0;o<gh;o++){let l=this.pool[o],c=r[o];if(!c){l.intensity=0;continue}let h=c.f;l.position.set(h.x,h.y,h.z),l.color.copy(h.color),l.distance=h.dist,l.intensity=h.intensity*h.level*h.fl*h.seen*this.lightMul}this.flashT>0&&(this.flashT-=t,this.flashT<=0&&(this.flashL.intensity=0))}fixture(t){return this.world.fixtures.find(e=>e.id===t)}setLight(t,e,i=0){let s=this.fixture(t);s&&(s.on=e,i&&(s.flicker=i))}get lightMul(){return this._lightMul===void 0?1:this._lightMul}set lightMul(t){this._lightMul=t}loop(t){requestAnimationFrame(s=>this.loop(s));let e=(t-this.last)/1e3;this.last=t,e=Pe(e,0,.05);let i=this.ui.paused||this.state!=="playing";!i&&!this.testMode?this.update(e):this.state==="menu"&&(this.time+=e,this.player.yaw+=e*.02,this.player.apply()),this.render(e,i),this.input.endFrame()}update(t){if(this.time+=t,this.cutscene||(this.clockMin+=t/45),this._waits&&this._waits.length){let a=[];for(let r of this._waits)r.t-=t,r.t<=0&&a.push(r);a.length&&(this._waits=this._waits.filter(r=>!a.includes(r)),a.forEach(r=>r.res()))}this.player.update(t),this.phone.update(t);for(let a of this.world.updaters)a(t);this.entity.update(t),this.clown.update(t),this.echoes.update(t),this.esquecido.update(t),this.cats.bento.update(t),this.cats.lili.update(t),this.updateHover(),this.input.lclick&&!this.phone.raised&&!this.player.hidden&&(this.hover||this.story.customPrompt)&&this.interact(),this.updateCharging(t),this.story.update(t),this.updateLights(t),this.tv.update(t);let e=this.entity.proximity();if(this.phone.radioOn&&this.phone.radioLoop){let a=Math.min(1,e*1.3+(this.story.radioExtra||0));this.phone.radioLoop.set("level",a),this.ui.radio(a)}this.fear+=(e-this.fear)*Math.min(1,t*2),this.heart&&this.heart.set("rate",1+this.fear*1.8),this.ui.breath(this.player.breath,!!this.player.hidden&&(this.fear>.35||this.player.breath<1)),this.ui.stamina(this.player.stamina);let i=this.world.get("fan_sala");i&&(i.blades.rotation.y+=t*(this.flags.fanSpeed===void 0?5:this.flags.fanSpeed));let s=this.world.get("fan_pais");s&&(s.blades.rotation.y+=t*(this.flags.fanPais||0)),C.updateListener(this.camera)}updateCharging(t){let e=this.hover;e&&e.id&&e.id.startsWith("socket")&&this.inventory.has("carregador")&&this.input.key("KeyE")&&!this.cutscene?(this.phone.charge(t),this.chargeHold+=t,this.chargeHold>.3&&this.ui.prompt(`Carregando... ${Math.round(this.phone.battery)}%`),this.story.onCharge&&this.story.onCharge(t)):this.chargeHold=0}render(t,e){let i=this.post.uniforms;i.time.value+=t;let s=this.body,a=this.player.pos;s.visible=this.state==="playing"&&!this.player.hidden,s.position.set(a.x,a.y+(this.player.eyeH<1?-.5:0),a.z),s.rotation.y=this.player.yaw+Math.PI;let r=s.userData,o=this.player.moving?Math.sin(this.player.bob*1.5)*.5:0;r.lL.rotation.x=o,r.lR.rotation.x=-o,r.aL.rotation.x=-o*.6,r.aR.rotation.x=this.phone.raised?-1.4:o*.6,r.phone.visible=this.phone.raised,r.head.rotation.x=-this.player.pitch*.5;let l=this.camera;if(l.layers.disableAll(),this.phone.raised?this.phone.mode==="video"?(l.layers.enable(ai.VIDEO),l.layers.enable(ai.SPIRIT)):(l.layers.enable(ai.EYE),l.layers.enable(ai.SPIRIT),l.layers.enable(ai.CAMONLY)):l.layers.enable(ai.EYE),this.story.extraLayers)for(let u of this.story.extraLayers)l.layers.enable(u);let c=this.phone.raised,h=this.flags.act||1;i.mode.value=c?this.phone.mode==="video"?2:1:0,i.scan.value=c?this.phone.mode==="video"?1:.5:this.story.scan||0,i.fisheye.value=c?.12:0,i.bright.value=c?.02:0,i.grain.value=.045+this.fear*.08+(c?.04:0),i.chroma.value=.5+this.fear*2.5+(this.story.chroma||0),i.vignette.value=.7+this.fear*.3+(this.player.hidden?.2:0),i.desat.value=.08+(h>=2?.12:0)+this.fear*.2;let d=this.story.tint||(h===3?[1.08,.9,.88]:h===2?[.95,.98,1.04]:[1.03,1,.95]);if(i.tint.value.setRGB(d[0],d[1],d[2]),i.warp.value=Math.max(0,this.story.warp||0),this._dying||(i.glitch.value=Math.max(this.story.glitch||0,this.fear>.7?(this.fear-.7)*.6:0)),i.exposure.value=this.story.exposure||1,this.player.cam.updateMatrixWorld(),this.cctvOn){let u=this.renderer;u.setRenderTarget(this.cctvRT),u.clear(),u.render(this.scene,this.cctvCam),u.setRenderTarget(null)}this.post.render(this.scene,l),this.phone.pendingPhoto&&this.phone.capture(this.renderer.domElement),this.ui.viewfinder(c?this.phone.mode:null,c?this.story.viewfinderData():null)}startAmbience(t="house"){this.stopAmbience();let e=i=>(i&&this.ambience.push(i),i);e(C.loop("roomtone",{bus:"amb",vol:.5})),e(C.loop("city",{bus:"amb",pos:[2.1,1.2,-1.6],vol:.8,ref:2,rolloff:.8})),e(C.loop("fridge",{bus:"amb",pos:[-.55,.8,4.4],vol:.8,ref:.8,rolloff:1.6})),e(C.loop("fan",{bus:"amb",pos:[2.1,2.3,3.2],vol:.6,ref:1,rolloff:1.4})),e(C.loop("clock",{bus:"amb",pos:[-.1,2,5],vol:.7,ref:.7,rolloff:1.8})),t==="act2"&&e(C.loop("drone",{bus:"amb",vol:.35,base:43.6,cut:220})),t==="act3"&&(e(C.loop("drone",{bus:"amb",vol:.5,base:36.7,cut:260,dark:!0})),e(C.loop("whispers",{bus:"amb",vol:.25,v:.5}))),this.heart=t==="act3"||t==="act2"?e(C.loop("heart",{bus:"sfx",vol:0})):null}stopAmbience(){this.ambience.forEach(t=>t.stop(.6)),this.ambience=[],this.heart=null}},vh=class{constructor(t){this.game=t,this.c=document.createElement("canvas"),this.c.width=512,this.c.height=288,this.ctx=this.c.getContext("2d"),this.tex=new Je(this.c),this.tex.colorSpace=xe,this.mat=new Yt({map:this.tex,toneMapped:!1}),this.mode="off",this.drawFn=null,this.t=0,this.loop=null}set(t,e){this.mode=t,this.drawFn=e||null;let i=this.game.world,s=i.get("tv_screen"),a=i.get("tv_mirror"),r=this.game.fixture("tv_glow");s&&(t==="off"?(s.material=this._offMat||(this._offMat=s.material),a&&(a.visible=!0),r&&(r.on=!1,r.intensity=0),this.loop&&(this.loop.stop(.2),this.loop=null),this.game.cctvOn=!1):(this._offMat||(this._offMat=s.material),a&&(a.visible=!1),t==="cctv"?(this.cctvMat=this.cctvMat||new Yt({map:this.game.cctvRT.texture,toneMapped:!1}),s.material=this.cctvMat,this.game.cctvOn=!0):(s.material=this.mat,this.game.cctvOn=!1),r&&(r.on=!0,r.intensity=2.2),t==="static"&&!this.loop&&(this.loop=C.loop("static",{pos:[.3,1.4,2.8],vol:.35})),t!=="static"&&this.loop&&(this.loop.stop(.2),this.loop=null)))}update(t){if(this.mode==="off"||this.mode==="cctv")return;this.t+=t;let e=this.ctx,i=512,s=288;if(this.mode==="static"||this.mode==="canvas"&&!this.drawFn){let r=e.createImageData(i/2,s/2),o=r.data;for(let l=0;l<o.length;l+=4){let c=Math.random()*255;o[l]=o[l+1]=o[l+2]=c,o[l+3]=255}e.putImageData(r,0,0),e.drawImage(this.c,0,0,i/2,s/2,0,0,i,s)}else this.drawFn&&this.drawFn(e,i,s,this.t);this.tex.needsUpdate=!0;let a=this.game.fixture("tv_glow");a&&(a.intensity=1.6+Math.random()*.8)}};function pl(n){let t=document.getElementById("err");t&&(t.classList.remove("hidden"),t.textContent="Erro: "+n+`
(Tente recarregar a p\xE1gina. Se persistir, use Chrome, Edge ou Firefox atualizados.)`)}window.addEventListener("error",n=>pl(n.message+(n.filename?" @ "+n.filename.split("/").pop()+":"+n.lineno:"")));window.addEventListener("unhandledrejection",n=>pl(String(n.reason&&n.reason.stack?n.reason.stack:n.reason)));function mf(){try{let n=document.createElement("canvas");if(!(n.getContext("webgl2")||n.getContext("webgl"))){pl("Seu navegador n\xE3o suporta WebGL.");return}window.__casa=new fl}catch(n){console.error(n),pl(n&&n.stack?n.stack:String(n))}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",mf):mf();})();
