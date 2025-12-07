import{r as ie,a as O}from"./icons-vendor-g855qC_X.js";var H={exports:{}},l={};var Q;function ae(){if(Q)return l;Q=1;var s=ie();function o(n){var e="https://react.dev/errors/"+n;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var i=2;i<arguments.length;i++)e+="&args[]="+encodeURIComponent(arguments[i])}return"Minified React error #"+n+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function r(){}var a={d:{f:r,r:function(){throw Error(o(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},u=Symbol.for("react.portal");function t(n,e,i){var d=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:u,key:d==null?null:""+d,children:n,containerInfo:e,implementation:i}}var c=s.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function f(n,e){if(n==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}return l.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=a,l.createPortal=function(n,e){var i=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(o(299));return t(n,e,null,i)},l.flushSync=function(n){var e=c.T,i=a.p;try{if(c.T=null,a.p=2,n)return n()}finally{c.T=e,a.p=i,a.d.f()}},l.preconnect=function(n,e){typeof n=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,a.d.C(n,e))},l.prefetchDNS=function(n){typeof n=="string"&&a.d.D(n)},l.preinit=function(n,e){if(typeof n=="string"&&e&&typeof e.as=="string"){var i=e.as,d=f(i,e.crossOrigin),E=typeof e.integrity=="string"?e.integrity:void 0,S=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;i==="style"?a.d.S(n,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:d,integrity:E,fetchPriority:S}):i==="script"&&a.d.X(n,{crossOrigin:d,integrity:E,fetchPriority:S,nonce:typeof e.nonce=="string"?e.nonce:void 0})}},l.preinitModule=function(n,e){if(typeof n=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var i=f(e.as,e.crossOrigin);a.d.M(n,{crossOrigin:i,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&a.d.M(n)},l.preload=function(n,e){if(typeof n=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var i=e.as,d=f(i,e.crossOrigin);a.d.L(n,i,{crossOrigin:d,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}},l.preloadModule=function(n,e){if(typeof n=="string")if(e){var i=f(e.as,e.crossOrigin);a.d.m(n,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:i,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else a.d.m(n)},l.requestFormReset=function(n){a.d.r(n)},l.unstable_batchedUpdates=function(n,e){return n(e)},l.useFormState=function(n,e,i){return c.H.useFormState(n,e,i)},l.useFormStatus=function(){return c.H.useHostTransitionStatus()},l.version="19.2.4",l}var X;function oe(){if(X)return H.exports;X=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(o){console.error(o)}}return s(),H.exports=ae(),H.exports}var ce=oe(),se=function(s,o,r,a){function u(t){return t instanceof r?t:new r(function(c){c(t)})}return new(r||(r=Promise))(function(t,c){function f(i){try{e(a.next(i))}catch(d){c(d)}}function n(i){try{e(a.throw(i))}catch(d){c(d)}}function e(i){i.done?t(i.value):u(i.value).then(f,n)}e((a=a.apply(s,o||[])).next())})},ue=function(s,o){var r={label:0,sent:function(){if(t[0]&1)throw t[1];return t[1]},trys:[],ops:[]},a,u,t,c;return c={next:f(0),throw:f(1),return:f(2)},typeof Symbol=="function"&&(c[Symbol.iterator]=function(){return this}),c;function f(e){return function(i){return n([e,i])}}function n(e){if(a)throw new TypeError("Generator is already executing.");for(;c&&(c=0,e[0]&&(r=0)),r;)try{if(a=1,u&&(t=e[0]&2?u.return:e[0]?u.throw||((t=u.return)&&t.call(u),0):u.next)&&!(t=t.call(u,e[1])).done)return t;switch(u=0,t&&(e=[e[0]&2,t.value]),e[0]){case 0:case 1:t=e;break;case 4:return r.label++,{value:e[1],done:!1};case 5:r.label++,u=e[1],e=[0];continue;case 7:e=r.ops.pop(),r.trys.pop();continue;default:if(t=r.trys,!(t=t.length>0&&t[t.length-1])&&(e[0]===6||e[0]===2)){r=0;continue}if(e[0]===3&&(!t||e[1]>t[0]&&e[1]<t[3])){r.label=e[1];break}if(e[0]===6&&r.label<t[1]){r.label=t[1],t=e;break}if(t&&r.label<t[2]){r.label=t[2],r.ops.push(e);break}t[2]&&r.ops.pop(),r.trys.pop();continue}e=o.call(s,r)}catch(i){e=[6,i],u=0}finally{a=t=0}if(e[0]&5)throw e[1];return{value:e[0]?e[1]:void 0,done:!0}}},Z=typeof window<"u",de=function(){if(Z){var s="theme-switch-base-style";if(!document.getElementById(s)){var o=document.createElement("style");o.id=s;var r=window.innerWidth>=3e3||window.innerHeight>=2e3;o.textContent=`
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
          `.concat(r?"transform: translateZ(0);":"",`
        }
        
        `).concat(r?`
        ::view-transition-group(root),
        ::view-transition-image-pair(root),
        ::view-transition-old(root),
        ::view-transition-new(root) {
          backface-visibility: hidden;
          perspective: 1000px;
          transform: translate3d(0, 0, 0);
        }
        `:"",`
      `),document.head.appendChild(o)}}},h;(function(s){s.CIRCLE="circle",s.BLUR_CIRCLE="blur-circle",s.QR_SCAN="qr-scan"})(h||(h={}));var fe=function(s){var o=s||{},r=o.duration,a=r===void 0?750:r,u=o.easing,t=u===void 0?"ease-in-out":u,c=o.pseudoElement,f=c===void 0?"::view-transition-new(root)":c,n=o.globalClassName,e=n===void 0?"dark":n,i=o.animationType,d=i===void 0?h.CIRCLE:i,E=o.blurAmount,S=E===void 0?2:E,P=o.styleId,D=P===void 0?"theme-switch-style":P,T=o.isDarkMode,B=o.onDarkModeChange,J=typeof window<"u"&&(window.innerWidth>=3e3||window.innerHeight>=2e3),w=J?Math.max(a*.8,500):a;O.useEffect(function(){de()},[]);var U=O.useState(Z?localStorage.getItem("theme")==="dark":!1),ee=U[0],ne=U[1],x=T??ee,z=function(v){var y=typeof v=="function"?v(x):v;B?B(y):ne(y)},M=O.useRef(null),te=function(v){var y=typeof window<"u"&&(window.innerWidth>=3e3||window.innerHeight>=2e3),R='<filter id="blur"><feGaussianBlur stdDeviation="'.concat(v,'" /></filter>'),k=y?20:25;return`url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100"><defs>`.concat(R,'</defs><circle cx="0" cy="0" r="').concat(k,`" fill="white" filter="url(%23blur)"/></svg>')`)},re=function(){return se(void 0,void 0,void 0,function(){var v,y,R,k,W,G,m,g,q,F,V,j,L,A,_,I,K,C,Y,b,N;return ue(this,function($){switch($.label){case 0:return!M.current||!document.startViewTransition||window.matchMedia("(prefers-reduced-motion: reduce)").matches?(z(function(p){return!p}),[2]):(v=document.getElementById(D),v&&v.remove(),y=M.current.getBoundingClientRect(),R=y.top,k=y.left,W=y.width,G=y.height,m=k+W/2,g=R+G/2,q=Math.hypot(m,g),F=Math.hypot(window.innerWidth-m,g),V=Math.hypot(m,window.innerHeight-g),j=Math.hypot(window.innerWidth-m,window.innerHeight-g),L=Math.max(q,F,V,j),A=Math.max(window.innerWidth,window.innerHeight)+200,_=window.innerWidth>=3e3||window.innerHeight>=2e3,I=_?2.5:4,K=_?Math.min(A*I,5e3):A*I,d===h.BLUR_CIRCLE&&(C=document.createElement("style"),C.id=D,Y=_?1.5:1.2,b=Math.max(K,L*2.5),C.textContent=`
        ::view-transition-group(root) {
          animation-duration: `.concat(w,`ms;
          animation-timing-function: `).concat(_?"cubic-bezier(0.2, 0, 0.2, 1)":"linear(0 0%, 0.2342 12.49%, 0.4374 24.99%,0.6093 37.49%, 0.6835 43.74%,0.7499 49.99%, 0.8086 56.25%,0.8593 62.5%, 0.9023 68.75%, 0.9375 75%,0.9648 81.25%, 0.9844 87.5%,0.9961 93.75%, 1 100%)",`;
          will-change: transform;
        }

        ::view-transition-new(root) {
          mask: `).concat(te(S*Y),` 0 0 / 100% 100% no-repeat;
          mask-position: `).concat(m,"px ").concat(g,`px;
          animation: maskScale `).concat(w,"ms ").concat(t,`;
          transform-origin: `).concat(m,"px ").concat(g,`px;
          will-change: mask-size, mask-position;
        }

        ::view-transition-old(root),
        .dark::view-transition-old(root) {
          animation: maskScale `).concat(w,"ms ").concat(t,`;
          transform-origin: `).concat(m,"px ").concat(g,`px;
          z-index: -1;
          will-change: mask-size, mask-position;
        }

        @keyframes maskScale {
          0% {
            mask-size: 0px;
            mask-position: `).concat(m,"px ").concat(g,`px;
          }
          100% {
            mask-size: `).concat(b,`px;
            mask-position: `).concat(m-b/2,"px ").concat(g-b/2,`px;
          }
        }
      `),document.head.appendChild(C)),[4,document.startViewTransition(function(){ce.flushSync(function(){z(function(p){return!p})})}).ready]);case 1:return $.sent(),d===h.CIRCLE&&document.documentElement.animate({clipPath:["circle(0px at ".concat(m,"px ").concat(g,"px)"),"circle(".concat(L,"px at ").concat(m,"px ").concat(g,"px)")]},{duration:w,easing:t,pseudoElement:f}),d===h.QR_SCAN&&(N=_?8:4,document.documentElement.animate({clipPath:["polygon(0% 0%, ".concat(N,"px 0%, ").concat(N,"px 100%, 0% 100%)"),"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"]},{duration:w,easing:t,pseudoElement:f})),d===h.BLUR_CIRCLE&&setTimeout(function(){var p=document.getElementById(D);p&&p.remove()},w),[2]}})})};return O.useEffect(function(){x?(document.documentElement.classList.add(e),localStorage.theme="dark"):(document.documentElement.classList.remove(e),localStorage.theme="light")},[x,e]),{ref:M,toggleSwitchTheme:re,isDarkMode:x}};export{h as T,oe as r,fe as u};
