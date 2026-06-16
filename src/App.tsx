import { useState, useRef, useEffect, useCallback, memo } from "react";

// ─── MLB API LIVE CONNECTION ──────────────────────────────────────────────────
const MLB_API = "https://statsapi.mlb.com/api/v1";
const PROXY   = "https://corsproxy.io/?";

async function mlbGet(path) {
  try {
    const res = await fetch(PROXY + encodeURIComponent(MLB_API + path), {
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) return await res.json();
    return null;
  } catch { return null; }
}

async function fetchTodayGames() {
  const today = new Date().toISOString().split("T")[0];
  const data  = await mlbGet(
    `/schedule?sportId=1&date=${today}&hydrate=team,linescore,probablePitcher,venue,weather`
  );
  if (!data?.dates?.[0]?.games?.length) return null;
  return data.dates[0].games.map(g => {
    const home = g.teams?.home, away = g.teams?.away;
    const ls = g.linescore, abs = g.status?.abstractGameState;
    const gameDate = new Date(g.gameDate);
    const timeET = gameDate.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZone:"America/New_York"})+" ET";
    const findAbbr = name => Object.values(ALL_TEAMS).find(t=>t.name===name||name?.includes(t.name.split(" ").pop()))?.abbr || null;
    const homeAbbr = findAbbr(home?.team?.name) || home?.team?.abbreviation;
    const awayAbbr = findAbbr(away?.team?.name) || away?.team?.abbreviation;
    if (!homeAbbr || !awayAbbr || !ALL_TEAMS[homeAbbr] || !ALL_TEAMS[awayAbbr]) return null;
    return {
      id: g.gamePk, home: homeAbbr, away: awayAbbr,
      venue: g.venue?.name||"TBD", time: timeET, gameHour: gameDate.getHours(),
      homeP: home?.probablePitcher?.fullName||"TBD",
      awayP: away?.probablePitcher?.fullName||"TBD",
      homePERA: null, awayPERA: null,
      wx: g.weather
        ? {temp:g.weather.temp||"—",wind:g.weather.wind||"—",sky:"🌤️",desc:g.weather.condition||"—"}
        : {temp:"—",wind:"—",sky:"🌤️",desc:"—"},
      pf: 1.0, isLive: abs==="Live", isFinal: abs==="Final",
      sim: (abs==="Live"||abs==="Final") ? {
        away: away?.score??ls?.teams?.away?.runs??0,
        home: home?.score??ls?.teams?.home?.runs??0,
        inn: ls?.currentInning??1, half: ls?.isTopInning?"T":"B",
        outs: ls?.outs??0, balls:0, strikes:0,
        awayH: ls?.teams?.away?.hits??0, homeH: ls?.teams?.home?.hits??0,
        bases:[false,false,false],
        innings:{away:Array(9).fill(null),home:Array(9).fill(null)},
      } : null,
      source:"live",
    };
  }).filter(Boolean);
}

// ─── DESIGN ───────────────────────────────────────────────────────────────────
const DARK={bg0:"#0a0e1a",bg1:"#111827",bg2:"#1a2234",glass:"rgba(255,255,255,0.04)",glassBorder:"rgba(255,255,255,0.08)",text:"#f9fafb",sub:"#9ca3af",muted:"#4b5563",indigo:"#6366f1",indigoL:"#818cf8",green:"#10b981",amber:"#f59e0b",red:"#ef4444",violet:"#8b5cf6"};
const LIGHT={bg0:"#f0f4f8",bg1:"#ffffff",bg2:"#e8edf5",glass:"rgba(0,0,0,0.03)",glassBorder:"rgba(0,0,0,0.1)",text:"#111827",sub:"#4b5563",muted:"#9ca3af",indigo:"#4f46e5",indigoL:"#6366f1",green:"#059669",amber:"#d97706",red:"#dc2626",violet:"#7c3aed"};

// ─── ALL 30 MLB TEAMS ─────────────────────────────────────────────────────────
const ALL_TEAMS = {
  // AL East
  NYY:{name:"New York Yankees",   abbr:"NYY",clr:"#1D6FA4",div:"AL Este",  era:3.71,ops:.748,wpct:.574,rpg:4.8,w:51,l:38,streak:"G3",last10:"7-3"},
  BOS:{name:"Boston Red Sox",     abbr:"BOS",clr:"#C8102E",div:"AL Este",  era:4.12,ops:.739,wpct:.512,rpg:4.6,w:45,l:43,streak:"P1",last10:"5-5"},
  TOR:{name:"Toronto Blue Jays",  abbr:"TOR",clr:"#134A8E",div:"AL Este",  era:4.08,ops:.745,wpct:.519,rpg:4.7,w:46,l:43,streak:"G1",last10:"6-4"},
  TB: {name:"Tampa Bay Rays",     abbr:"TB", clr:"#8FBCE6",div:"AL Este",  era:3.71,ops:.728,wpct:.537,rpg:4.4,w:47,l:41,streak:"G2",last10:"6-4"},
  BAL:{name:"Baltimore Orioles",  abbr:"BAL",clr:"#DF4601",div:"AL Este",  era:3.88,ops:.752,wpct:.556,rpg:4.8,w:49,l:39,streak:"G4",last10:"7-3"},
  // AL Central
  CLE:{name:"Cleveland Guardians",abbr:"CLE",clr:"#E31937",div:"AL Central",era:3.77,ops:.731,wpct:.537,rpg:4.5,w:47,l:41,streak:"P2",last10:"5-5"},
  MIN:{name:"Minnesota Twins",    abbr:"MIN",clr:"#002B5C",div:"AL Central",era:3.84,ops:.743,wpct:.537,rpg:4.7,w:47,l:41,streak:"G1",last10:"6-4"},
  KC: {name:"Kansas City Royals", abbr:"KC", clr:"#004687",div:"AL Central",era:3.95,ops:.722,wpct:.500,rpg:4.3,w:44,l:44,streak:"G2",last10:"5-5"},
  CWS:{name:"Chicago White Sox",  abbr:"CWS",clr:"#27251F",div:"AL Central",era:4.45,ops:.698,wpct:.407,rpg:4.0,w:36,l:53,streak:"P4",last10:"3-7"},
  DET:{name:"Detroit Tigers",     abbr:"DET",clr:"#0C2340",div:"AL Central",era:3.91,ops:.719,wpct:.481,rpg:4.3,w:43,l:46,streak:"G1",last10:"5-5"},
  // AL West
  HOU:{name:"Houston Astros",     abbr:"HOU",clr:"#EB6E1F",div:"AL Oeste", era:3.62,ops:.758,wpct:.556,rpg:4.9,w:49,l:39,streak:"G3",last10:"7-3"},
  SEA:{name:"Seattle Mariners",   abbr:"SEA",clr:"#005C5C",div:"AL Oeste", era:3.67,ops:.726,wpct:.537,rpg:4.4,w:47,l:41,streak:"P1",last10:"6-4"},
  TEX:{name:"Texas Rangers",      abbr:"TEX",clr:"#003278",div:"AL Oeste", era:4.01,ops:.738,wpct:.519,rpg:4.6,w:46,l:43,streak:"G2",last10:"5-5"},
  LAA:{name:"Los Angeles Angels", abbr:"LAA",clr:"#BA0021",div:"AL Oeste", era:4.31,ops:.725,wpct:.463,rpg:4.4,w:41,l:48,streak:"P3",last10:"4-6"},
  OAK:{name:"Oakland Athletics",  abbr:"OAK",clr:"#003831",div:"AL Oeste", era:4.22,ops:.712,wpct:.444,rpg:4.1,w:39,l:49,streak:"P2",last10:"4-6"},
  // NL East
  ATL:{name:"Atlanta Braves",     abbr:"ATL",clr:"#CE1141",div:"NL Este",  era:3.55,ops:.765,wpct:.593,rpg:5.0,w:52,l:36,streak:"G5",last10:"8-2"},
  PHI:{name:"Philadelphia Phillies",abbr:"PHI",clr:"#E81828",div:"NL Este",era:3.79,ops:.751,wpct:.556,rpg:4.8,w:49,l:39,streak:"G2",last10:"7-3"},
  NYM:{name:"New York Mets",      abbr:"NYM",clr:"#002D72",div:"NL Este",  era:3.88,ops:.741,wpct:.537,rpg:4.7,w:47,l:41,streak:"P1",last10:"6-4"},
  WSH:{name:"Washington Nationals",abbr:"WSH",clr:"#AB0003",div:"NL Este", era:4.28,ops:.719,wpct:.444,rpg:4.3,w:39,l:49,streak:"G1",last10:"4-6"},
  MIA:{name:"Miami Marlins",      abbr:"MIA",clr:"#00A3E0",div:"NL Este",  era:4.15,ops:.708,wpct:.444,rpg:4.1,w:39,l:49,streak:"P2",last10:"4-6"},
  // NL Central
  MIL:{name:"Milwaukee Brewers",  abbr:"MIL",clr:"#12284B",div:"NL Central",era:3.91,ops:.718,wpct:.519,rpg:4.4,w:46,l:43,streak:"G1",last10:"5-5"},
  CHC:{name:"Chicago Cubs",       abbr:"CHC",clr:"#0E3386",div:"NL Central",era:4.05,ops:.729,wpct:.500,rpg:4.5,w:44,l:44,streak:"P1",last10:"5-5"},
  STL:{name:"St. Louis Cardinals",abbr:"STL",clr:"#C41E3A",div:"NL Central",era:3.95,ops:.733,wpct:.519,rpg:4.5,w:46,l:43,streak:"G2",last10:"6-4"},
  PIT:{name:"Pittsburgh Pirates", abbr:"PIT",clr:"#27251F",div:"NL Central",era:4.11,ops:.714,wpct:.463,rpg:4.2,w:41,l:48,streak:"P1",last10:"4-6"},
  CIN:{name:"Cincinnati Reds",    abbr:"CIN",clr:"#C6011F",div:"NL Central",era:4.19,ops:.733,wpct:.481,rpg:4.5,w:43,l:46,streak:"G1",last10:"5-5"},
  // NL West
  LAD:{name:"Los Angeles Dodgers",abbr:"LAD",clr:"#005A9C",div:"NL Oeste", era:3.45,ops:.772,wpct:.621,rpg:5.1,w:55,l:34,streak:"G6",last10:"8-2"},
  SF: {name:"San Francisco Giants",abbr:"SF", clr:"#FD5A1E",div:"NL Oeste",era:3.98,ops:.722,wpct:.481,rpg:4.3,w:43,l:46,streak:"P1",last10:"5-5"},
  SD: {name:"San Diego Padres",   abbr:"SD", clr:"#2F241D",div:"NL Oeste", era:3.74,ops:.744,wpct:.556,rpg:4.7,w:49,l:39,streak:"G3",last10:"7-3"},
  ARI:{name:"Arizona Diamondbacks",abbr:"ARI",clr:"#A71930",div:"NL Oeste",era:4.18,ops:.736,wpct:.500,rpg:4.5,w:44,l:44,streak:"P2",last10:"5-5"},
  COL:{name:"Colorado Rockies",   abbr:"COL",clr:"#33006F",div:"NL Oeste", era:4.89,ops:.748,wpct:.426,rpg:4.8,w:38,l:51,streak:"P3",last10:"3-7"},
};

const DIVISIONS=["AL Este","AL Central","AL Oeste","NL Este","NL Central","NL Oeste"];

// ─── GAMES ────────────────────────────────────────────────────────────────────
function buildGames(){
  const h=new Date().getHours();
  const SLATE=[
    {id:1001,away:"NYY",home:"BOS",venue:"Fenway Park",time:"1:10 PM ET",gameHour:13,awayP:"Gerrit Cole",awayPERA:2.89,homeP:"Brayan Bello",homePERA:3.54,wx:{temp:71,wind:"8 mph E",sky:"⛅",desc:"Partly Cloudy"},pf:1.08,sim:{away:3,home:2,inn:7,half:"T",outs:1,balls:2,strikes:1,awayH:7,homeH:5,bases:[true,false,false],innings:{away:[1,0,2,0,0,0,0,null,null],home:[0,1,0,1,0,0,0,null,null]}}},
    {id:1002,away:"SF",home:"LAD",venue:"Dodger Stadium",time:"2:10 PM ET",gameHour:14,awayP:"Logan Webb",awayPERA:3.21,homeP:"Y. Yamamoto",homePERA:2.71,wx:{temp:78,wind:"5 mph W",sky:"☀️",desc:"Sunny"},pf:0.99,sim:{away:1,home:4,inn:4,half:"B",outs:2,balls:1,strikes:2,awayH:4,homeH:8,bases:[false,true,false],innings:{away:[0,1,0,0,null,null,null,null,null],home:[2,0,2,0,null,null,null,null,null]}}},
    {id:1003,away:"ATL",home:"PHI",venue:"Citizens Bank Park",time:"4:05 PM ET",gameHour:16,awayP:"Spencer Strider",awayPERA:2.44,homeP:"Zack Wheeler",homePERA:2.91,wx:{temp:82,wind:"12 mph SW",sky:"☀️",desc:"Clear"},pf:1.06},
    {id:1004,away:"HOU",home:"TEX",venue:"Globe Life Field",time:"4:10 PM ET",gameHour:16,awayP:"Framber Valdez",awayPERA:2.97,homeP:"Nathan Eovaldi",homePERA:3.42,wx:{temp:91,wind:"7 mph S",sky:"🌡️",desc:"Hot and Clear"},pf:1.01},
    {id:1005,away:"MIL",home:"CHC",venue:"Wrigley Field",time:"7:08 PM ET",gameHour:19,awayP:"Freddy Peralta",awayPERA:3.18,homeP:"Justin Steele",homePERA:3.05,wx:{temp:74,wind:"15 mph OUT",sky:"💨",desc:"Windy"},pf:1.03},
    {id:1006,away:"SD",home:"NYM",venue:"Citi Field",time:"7:10 PM ET",gameHour:19,awayP:"Dylan Cease",awayPERA:3.37,homeP:"Kodai Senga",homePERA:2.88,wx:{temp:76,wind:"9 mph NE",sky:"🌤️",desc:"Clear"},pf:1.00},
    {id:1007,away:"CLE",home:"BAL",venue:"Oriole Park",time:"7:40 PM ET",gameHour:19,awayP:"Shane Bieber",awayPERA:3.47,homeP:"Corbin Burnes",homePERA:2.78,wx:{temp:79,wind:"6 mph E",sky:"☀️",desc:"Clear"},pf:1.01},
    {id:1008,away:"MIN",home:"SEA",venue:"T-Mobile Park",time:"10:10 PM ET",gameHour:22,awayP:"Pablo Lopez",awayPERA:3.14,homeP:"Luis Castillo",homePERA:3.08,wx:{temp:65,wind:"4 mph W",sky:"🌥️",desc:"Overcast"},pf:0.95},
  ];
  return SLATE.map(g=>({...g,isLive:h>=g.gameHour&&h<g.gameHour+3&&!!g.sim,isFinal:h>=g.gameHour+3&&!!g.sim}));
}

// ─── PREDICT ─────────────────────────────────────────────────────────────────
function predict(away,home,pf=1,wind=""){
  const H=ALL_TEAMS[home]||{wpct:.500,era:4.0,rpg:4.5};
  const A=ALL_TEAMS[away]||{wpct:.500,era:4.0,rpg:4.5};
  const hA=H.wpct*1.04*pf,aA=A.wpct*0.96;
  let hW=(hA/(hA+aA))*100+(A.era-H.era)*3;
  hW=Math.min(74,Math.max(31,hW));
  const hWr=Math.round(hW),aWr=100-hWr;
  const wB=wind.includes("OUT")?1.08:wind.includes("IN")?0.93:1;
  const proj=+((H.rpg+A.rpg)/2*pf*wB).toFixed(1);
  const line=Math.round(proj*2)/2;
  const hO=hWr>50?-Math.round((hWr/(100-hWr))*100):Math.round(((100-hWr)/hWr)*100);
  const aO=aWr>50?-Math.round((aWr/(100-aWr))*100):Math.round(((100-aWr)/aWr)*100);
  const impl=110/(hO<0?Math.abs(hO)+100:100+hO)*100;
  const edge=+(hWr-impl).toFixed(1);
  const ev=+(edge*0.38).toFixed(1);
  const conf=Math.round(Math.min(89,57+Math.abs(hWr-50)*0.55+(Math.abs(H.era-A.era)>.5?5:0)));
  const risk=conf>=75?"Bajo":conf>=62?"Medio":"Alto";
  const grade=conf>=78&&edge>4?"A":conf>=67&&edge>1.5?"B":conf>=56?"C":"D";
  return{hWr,aWr,hO,aO,edge,ev,conf,proj,line,overP:proj>line?57:43,underP:proj>line?43:57,rlCover:Math.round(hWr*0.73),grade,rec:proj>line?"OVER":"UNDER",risk};
}

const fO=n=>n>=0?`+${n}`:`${n}`;
const GC={A:"#10b981",B:"#6366f1",C:"#f59e0b",D:"#ef4444"};
const RISK_COLOR={Bajo:"#10b981",Medio:"#f59e0b",Alto:"#ef4444"};

// ─── PLANS ────────────────────────────────────────────────────────────────────
const PLANS={
  starter:{
    name:"Starter",price:"$0",period:"/siempre",color:"#6366f1",
    badge:"GRATIS",
    features:["Todos los partidos del día","Calendario completo","Resultados en vivo","Diamante en vivo","Oportunidades del día (básicas)","Estadísticas 30 equipos","Análisis básico","Asistente Axe (10/día)","Notificaciones esenciales","Favoritos","Modo claro/oscuro","Traducción completa"],
    limits:{axeQueries:10}
  },
  pro:{
    name:"Pro",price:"$4.99",period:"/mes",color:"#8b5cf6",popular:true,
    badge:"MÁS POPULAR",
    features:["Todo del Starter","Índice de confianza avanzado","Comparativas sabermétricas","Modelos predictivos avanzados","Análisis detallado ML/RL/O-U","Tendencias avanzadas","Comparaciones históricas","Asistente Axe (100/día)","Filtros avanzados","Reportes descargables"],
    limits:{axeQueries:100}
  },
  elite:{
    name:"Elite",price:"$9.99",period:"/mes",color:"#10b981",
    badge:"TODO INCLUIDO",
    features:["Todo del Pro","Acceso anticipado a funciones","Herramientas experimentales","Dashboard configurable","Estadísticas exclusivas","Alertas personalizadas inteligentes","Asistente Axe ilimitado","Reportes Premium","Soporte prioritario","Futuras funciones sin costo"],
    limits:{axeQueries:Infinity}
  }
};

// ─── AXE AI ASSISTANT ─────────────────────────────────────────────────────────
async function askAxe(question,history){
  const system=`Eres Axe, el asistente oficial de MLBEdge.

Eres un experto en béisbol de las Grandes Ligas (MLB), estadísticas deportivas y análisis predictivo.

Tu identidad:
- Nombre: Axe
- Plataforma: MLBEdge
- Especialidad: Béisbol MLB, análisis estadístico, predicciones

Bajo NINGUNA circunstancia menciones: Claude, Anthropic, OpenAI, ChatGPT, Gemini, IA, inteligencia artificial, modelo de lenguaje, LLM, o cualquier tecnología subyacente.

Si te preguntan quién te creó, di que fuiste desarrollado por el equipo de MLBEdge.

Puedes responder sobre:
- Reglas del béisbol
- Estadísticas MLB: ERA, xERA, FIP, xFIP, SIERA, WHIP, wRC+, wOBA, ISO, BABIP, OPS, Hard Hit%, Barrel%
- Moneyline: apuesta en la que eliges qué equipo gana el partido
- Runline: el favorito debe ganar por 2+ carreras (-1.5), underdog puede perder por 1 (+1.5)
- Over/Under: total de carreras anotadas vs línea establecida
- Equipos y jugadores de MLB
- Funcionamiento de MLBEdge
- Planes de suscripción
- Cómo interpretar análisis y predicciones

Responde siempre en español.
Sé conciso (máximo 3 oraciones), claro y profesional.
Si no tienes información suficiente, dilo honestamente sin inventar.`;

  const messages=history.slice(-6).map(m=>({role:m.from==="user"?"user":"assistant",content:m.text}));
  messages.push({role:"user",content:question});

  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:300,system,messages})});
  const d=await r.json();
  return d.content?.map(b=>b.text||"").join("")||"Disculpa, no pude procesar tu consulta. Por favor intenta de nuevo.";
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Ring({grade,conf,size=40,dark}){
  const D=dark?DARK:LIGHT;
  const clr=GC[grade]||D.indigoL,r=size/2-3,circ=2*Math.PI*r,dash=(conf/100)*circ;
  return <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg viewBox={`0 0 ${size} ${size}`} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={clr} strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{filter:`drop-shadow(0 0 4px ${clr}66)`}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
      justifyContent:"center",fontSize:size*0.32,fontWeight:900,color:clr}}>{grade}</div>
  </div>;
}

function Chip({label,value,color,dark}){
  const D=dark?DARK:LIGHT;
  return <div style={{flex:1,background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:9,padding:"7px 4px",textAlign:"center",minWidth:0}}>
    <div style={{fontSize:12,fontWeight:800,color:color||D.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{value}</div>
    <div style={{fontSize:7,color:D.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginTop:2}}>{label}</div>
  </div>;
}

function SLabel({icon,children,dark}){
  const D=dark?DARK:LIGHT;
  return <div style={{fontSize:9,fontWeight:700,color:D.indigoL,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:9,display:"flex",alignItems:"center",gap:7}}>
    <div style={{height:1,width:12,background:`linear-gradient(90deg,${D.indigo},transparent)`}}/>
    {icon&&<span style={{fontSize:11}}>{icon}</span>}{children}
    <div style={{height:1,flex:1,background:`linear-gradient(90deg,${D.indigoL}33,transparent)`}}/>
  </div>;
}

function LiveDot({color="#10b981"}){
  return <div style={{width:7,height:7,borderRadius:"50%",background:color,boxShadow:`0 0 7px ${color}`,animation:"v14Pulse 1.5s ease infinite",flexShrink:0}}/>;
}

function RiskBadge({risk,dark}){
  const D=dark?DARK:LIGHT;
  const c=RISK_COLOR[risk]||D.muted;
  return <span style={{fontSize:8,fontWeight:700,color:c,background:`${c}14`,border:`1px solid ${c}28`,borderRadius:6,padding:"2px 7px"}}>
    Riesgo {risk}
  </span>;
}

// ─── PLAN GATE ────────────────────────────────────────────────────────────────
function PlanGate({feature,userPlan,requiredPlan,dark,onUpgrade,children}){
  const D=dark?DARK:LIGHT;
  const planOrder={starter:0,pro:1,elite:2};
  const hasAccess=planOrder[userPlan]>=planOrder[requiredPlan];
  if(hasAccess) return children;
  const req=PLANS[requiredPlan];
  return(
    <div style={{position:"relative",borderRadius:14,overflow:"hidden"}}>
      <div style={{filter:"blur(4px)",pointerEvents:"none",opacity:0.4}}>{children}</div>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:"20px",
        background:dark?"rgba(10,14,26,0.85)":"rgba(240,244,248,0.85)",backdropFilter:"blur(4px)"}}>
        <div style={{fontSize:28,marginBottom:8}}>🔒</div>
        <div style={{fontSize:13,fontWeight:800,color:D.text,marginBottom:4,textAlign:"center"}}>{feature}</div>
        <div style={{fontSize:11,color:D.sub,marginBottom:14,textAlign:"center",lineHeight:1.5}}>
          Disponible en el Plan <span style={{color:req.color,fontWeight:700}}>{req.name}</span>
        </div>
        <button onClick={onUpgrade} style={{padding:"9px 20px",borderRadius:10,border:"none",
          background:`linear-gradient(135deg,${req.color},${req.color}cc)`,
          color:"white",fontWeight:700,fontSize:12,cursor:"pointer"}}>
          Ver Planes →
        </button>
      </div>
    </div>
  );
}

// ─── PRICING SCREEN ───────────────────────────────────────────────────────────
function PricingScreen({userPlan,onSelect,dark,onBack}){
  const D=dark?DARK:LIGHT;
  return(
    <div style={{minHeight:"100vh",background:D.bg0}}>
      <div style={{position:"sticky",top:0,zIndex:30,background:dark?"rgba(10,14,26,0.97)":"rgba(240,244,248,0.97)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderBottom:`1px solid ${D.glassBorder}`,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {onBack&&<button onClick={onBack} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"7px 12px",color:D.sub,fontSize:12,fontWeight:600,cursor:"pointer"}}>← Atrás</button>}
          <div>
            <div style={{fontSize:16,fontWeight:900,color:D.text}}>Planes MLBEdge</div>
            <div style={{fontSize:10,color:D.muted}}>Elige el plan que mejor se adapta a ti</div>
          </div>
        </div>
      </div>
      <div style={{padding:"16px 13px 90px"}}>
        {/* Value prop */}
        <div style={{marginBottom:16,padding:"14px",background:`linear-gradient(135deg,${D.indigo}14,${D.violet}0a)`,border:`1px solid ${D.indigoL}22`,borderRadius:16,textAlign:"center"}}>
          <div style={{fontSize:22}}>⚾</div>
          <div style={{fontSize:14,fontWeight:800,color:D.text,marginTop:6,marginBottom:4}}>Análisis Profesional de MLB</div>
          <div style={{fontSize:11,color:D.sub,lineHeight:1.6}}>
            Incluso el plan gratuito incluye herramientas que no encontrarás en otras plataformas deportivas.
          </div>
        </div>

        {Object.entries(PLANS).map(([key,plan],i)=>(
          <div key={key} style={{marginBottom:12,borderRadius:20,overflow:"hidden",
            border:`1px solid ${plan.popular?"rgba(139,92,246,0.4)":D.glassBorder}`,
            background:plan.popular?dark?`linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.06))`:`linear-gradient(135deg,rgba(139,92,246,0.06),rgba(99,102,241,0.03))`:D.bg1,
            boxShadow:plan.popular?`0 0 0 1px rgba(139,92,246,0.2),0 8px 32px rgba(0,0,0,0.3)`:"none",
            animation:`v14Up 0.3s ${i*0.08}s both ease`,
            position:"relative"}}>
            {plan.popular&&<div style={{height:2,background:`linear-gradient(90deg,${plan.color}00,${plan.color},${plan.color}00)`}}/>}
            <div style={{padding:"18px"}}>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <div style={{fontSize:15,fontWeight:800,color:plan.color}}>{plan.name}</div>
                    {userPlan===key&&<span style={{fontSize:8,fontWeight:700,color:plan.color,background:`${plan.color}18`,border:`1px solid ${plan.color}33`,borderRadius:6,padding:"2px 7px"}}>ACTIVO</span>}
                    {plan.popular&&userPlan!==key&&<span style={{fontSize:8,fontWeight:700,color:plan.color,background:`${plan.color}18`,border:`1px solid ${plan.color}33`,borderRadius:6,padding:"2px 7px"}}>{plan.badge}</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                    <div style={{fontSize:32,fontWeight:900,color:D.text,letterSpacing:"-0.03em"}}>{plan.price}</div>
                    <div style={{fontSize:12,color:D.muted}}>{plan.period}</div>
                  </div>
                </div>
                <div style={{width:50,height:50,borderRadius:14,
                  background:`linear-gradient(135deg,${plan.color}22,${plan.color}0a)`,
                  border:`1px solid ${plan.color}28`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                  {key==="starter"?"⚾":key==="pro"?"🚀":"⭐"}
                </div>
              </div>
              {/* Features */}
              <div style={{height:1,background:`${plan.color}22`,marginBottom:12}}/>
              <div style={{marginBottom:14}}>
                {plan.features.map((f,j)=>(
                  <div key={j} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                    <span style={{color:plan.color,fontSize:11,flexShrink:0,marginTop:1}}>✓</span>
                    <span style={{fontSize:11,color:D.sub,lineHeight:1.4}}>{f}</span>
                  </div>
                ))}
              </div>
              {/* CTA */}
              <button onClick={()=>onSelect(key)} style={{
                width:"100%",padding:"12px",borderRadius:12,border:"none",cursor:"pointer",
                background:userPlan===key?D.glass:`linear-gradient(135deg,${plan.color},${plan.color}cc)`,
                color:userPlan===key?D.muted:"white",
                fontWeight:700,fontSize:13,letterSpacing:"0.03em",
                border:userPlan===key?`1px solid ${D.glassBorder}`:"none",
                transition:"all 0.2s ease"}}>
                {userPlan===key?"Plan Actual":key==="starter"?"Comenzar Gratis →":`Elegir ${plan.name} →`}
              </button>
            </div>
          </div>
        ))}

        {/* FAQ */}
        <div style={{marginTop:4,padding:"14px",background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:14}}>
          <div style={{fontSize:11,fontWeight:700,color:D.text,marginBottom:10}}>Preguntas frecuentes</div>
          {[
            {q:"¿Puedo cambiar de plan?",a:"Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu perfil."},
            {q:"¿Hay período de prueba?",a:"El Plan Starter es gratuito para siempre. Los planes Pro y Elite tienen 7 días de prueba."},
            {q:"¿Se renueva automáticamente?",a:"Sí, los planes de pago se renuevan mensualmente. Puedes cancelar en cualquier momento."},
          ].map(({q,a},i)=>(
            <div key={i} style={{marginBottom:i<2?10:0}}>
              <div style={{fontSize:11,fontWeight:600,color:D.text,marginBottom:3}}>{q}</div>
              <div style={{fontSize:10,color:D.sub,lineHeight:1.5}}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── OPPORTUNITIES SCREEN (ENHANCED) ─────────────────────────────────────────
function OpportunitiesScreen({games,onSelect,dark,userPlan,onUpgrade}){
  const D=dark?DARK:LIGHT;
  const [filter,setFilter]=useState("all");
  const [sortBy,setSortBy]=useState("conf");

  const opps=games.filter(g=>!g.isFinal).map(g=>{
    const pred=predict(g.away,g.home,g.pf||1,g.wx?.wind||"");
    if(!pred) return null;
    const H=ALL_TEAMS[g.home],A=ALL_TEAMS[g.away];
    const mlRec=pred.hWr>pred.aWr?{team:H?.name||g.home,abbr:g.home,line:fO(pred.hO),prob:pred.hWr}:{team:A?.name||g.away,abbr:g.away,line:fO(pred.aO),prob:pred.aWr};
    const rlRec={team:pred.hWr>pred.aWr?H?.name||g.home:A?.name||g.away,abbr:pred.hWr>pred.aWr?g.home:g.away,cover:pred.rlCover,diff:"−1.5"};
    const ouRec={rec:pred.rec,line:pred.line,proj:pred.proj,prob:pred.rec==="OVER"?pred.overP:pred.underP};
    const reason=pred.rec==="OVER"
      ?`ERA combinado ${((ALL_TEAMS[g.home]?.era||4)+(ALL_TEAMS[g.away]?.era||4))/2|0} con parque factor ${g.pf} y ${g.wx?.wind.includes("OUT")?"viento saliendo":"condiciones favorables"}.`
      :`Pitcheo dominante con ERA ${g.homePERA} vs ${g.awayPERA}. Modelo proyecta partido cerrado bajo la línea.`;
    return{...g,pred,mlRec,rlRec,ouRec,reason};
  }).filter(Boolean);

  const filtered=opps.filter(g=>{
    if(filter==="over") return g.pred.rec==="OVER";
    if(filter==="under") return g.pred.rec==="UNDER";
    if(filter==="live") return g.isLive;
    return true;
  }).sort((a,b)=>{
    if(sortBy==="conf") return b.pred.conf-a.pred.conf;
    if(sortBy==="edge") return b.pred.edge-a.pred.edge;
    if(sortBy==="time") return a.gameHour-b.gameHour;
    return 0;
  });

  const isPro=userPlan==="pro"||userPlan==="elite";

  return(
    <div style={{padding:"0 0 0"}}>
      {/* Header */}
      <div style={{padding:"12px 13px 0"}}>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:20,fontWeight:900,color:D.text,letterSpacing:"-0.03em",marginBottom:2}}>Oportunidades del Día</div>
          <div style={{fontSize:10,color:D.muted}}>{filtered.length} partidos analizados · {new Date().toLocaleDateString("es",{weekday:"long",month:"long",day:"numeric"})}</div>
        </div>

        {/* Top 3 markets */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
          {[
            {label:"Mejor ML",icon:"💵",color:D.indigo,game:opps[0],get:(g)=>`${g?.mlRec?.abbr} ML`},
            {label:"Mejor RL",icon:"📏",color:D.violet,game:[...opps].sort((a,b)=>b.pred.rlCover-a.pred.rlCover)[0],get:(g)=>`${g?.rlRec?.abbr} −1.5`},
            {label:"Mejor OU",icon:"⚡",color:D.green,game:[...opps].sort((a,b)=>b.pred.conf-a.pred.conf)[0],get:(g)=>`${g?.pred?.rec} ${g?.pred?.line}`},
          ].map(({label,icon,color,game,get})=>!game?null:(
            <div key={label} onClick={()=>onSelect(game)} style={{
              borderRadius:12,overflow:"hidden",cursor:"pointer",
              border:`1px solid ${color}28`,background:dark?`${color}0a`:`${color}06`}}>
              <div style={{height:2,background:`linear-gradient(90deg,${color}00,${color},${color}00)`}}/>
              <div style={{padding:"10px 8px"}}>
                <div style={{fontSize:8,color,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{icon} {label}</div>
                <div style={{fontSize:10,fontWeight:800,color:D.text,marginBottom:3}}>{game.away} @ {game.home}</div>
                <div style={{fontSize:12,fontWeight:900,color}}>{get(game)}</div>
                <div style={{fontSize:8,color:D.muted,marginTop:3}}>{game.pred.conf}% conf.</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:4,marginBottom:8,overflowX:"auto",scrollbarWidth:"none"}}>
          {[["all","Todos"],["over","Over"],["under","Under"],["live","En Vivo"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{
              flexShrink:0,padding:"6px 12px",borderRadius:8,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",
              background:filter===v?`linear-gradient(135deg,${D.indigo}33,${D.violet}22)`:D.glass,
              color:filter===v?D.indigoL:D.muted,
              outline:filter===v?`1px solid ${D.indigoL}33`:`1px solid ${D.glassBorder}`}}>{l}</button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:4}}>
            {[["conf","Confianza"],["edge","Ventaja"],["time","Hora"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSortBy(v)} style={{
                flexShrink:0,padding:"6px 10px",borderRadius:8,border:"none",fontSize:9,fontWeight:600,cursor:"pointer",
                background:sortBy===v?`${D.amber}22`:D.glass,
                color:sortBy===v?D.amber:D.muted,
                outline:sortBy===v?`1px solid ${D.amber}44`:`1px solid ${D.glassBorder}`}}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunity cards */}
      <div style={{padding:"0 13px",display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map((g,i)=>{
          const H=ALL_TEAMS[g.home],A=ALL_TEAMS[g.away];
          const isLocked=i>=3&&!isPro;
          return(
            <div key={g.id} style={{borderRadius:18,overflow:"hidden",
              border:`1px solid ${g.isLive?"rgba(16,185,129,0.3)":D.glassBorder}`,
              background:D.bg1,
              boxShadow:dark?(g.isLive?"0 0 0 1px rgba(16,185,129,0.1),0 8px 24px rgba(0,0,0,0.4)":"0 4px 16px rgba(0,0,0,0.25)"):"0 2px 10px rgba(0,0,0,0.06)",
              animation:`v14Up 0.3s ${i*0.04}s both ease`,
              position:"relative",overflow:"hidden"}}>
              <div style={{height:3,background:`linear-gradient(90deg,${A?.clr||D.sub},${H?.clr||D.indigo})`}}/>
              <div style={{padding:"13px"}}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {g.isLive?(
                      <span style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:700,color:D.green}}>
                        <LiveDot/> EN VIVO
                      </span>
                    ):(
                      <span style={{background:`${D.indigo}14`,border:`1px solid ${D.indigoL}33`,borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:600,color:D.indigoL}}>{g.time}</span>
                    )}
                    <span style={{fontSize:9,color:D.muted}}>{g.venue?.split(" ").slice(0,2).join(" ")}</span>
                  </div>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    <RiskBadge risk={g.pred.risk} dark={dark}/>
                    <Ring grade={g.pred.grade} conf={g.pred.conf} size={36} dark={dark}/>
                  </div>
                </div>

                {/* Matchup */}
                {(g.isLive||g.isFinal)&&g.sim?(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"10px 14px",background:D.glass,borderRadius:12,border:`1px solid ${D.glassBorder}`}}>
                    {[{t:A,sc:g.sim.away},{t:H,sc:g.sim.home}].map((x,idx)=>(
                      <div key={idx} style={{textAlign:"center"}}>
                        <div style={{fontSize:10,fontWeight:700,color:x.t?.clr,marginBottom:2}}>{x.t?.abbr}</div>
                        <div style={{fontSize:28,fontWeight:900,color:D.text,lineHeight:1}}>{x.sc}</div>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
                    {[{t:A,label:"Visitante"},null,{t:H,label:"Local"}].map((x,idx)=>{
                      if(!x) return <div key="at" style={{padding:"0 8px",color:D.muted,fontWeight:700}}>@</div>;
                      return <div key={idx} style={{flex:1,textAlign:"center"}}>
                        <div style={{width:42,height:42,borderRadius:11,margin:"0 auto 6px",background:`linear-gradient(135deg,${x.t?.clr||D.muted}22,${x.t?.clr||D.muted}08)`,border:`1.5px solid ${x.t?.clr||D.muted}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:x.t?.clr||D.muted}}>{x.t?.abbr}</div>
                        <div style={{fontSize:11,fontWeight:700,color:D.text}}>{x.t?.name.split(" ").pop()}</div>
                        <div style={{fontSize:9,color:D.muted,marginTop:1}}>{x.label}</div>
                      </div>;
                    })}
                  </div>
                )}

                {/* 3 Market recommendations */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
                  {/* ML */}
                  <div style={{background:`${D.indigo}0a`,border:`1px solid ${D.indigo}22`,borderRadius:11,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:D.indigoL,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>💵 Moneyline</div>
                    <div style={{fontSize:11,fontWeight:800,color:D.text,marginBottom:2}}>{g.mlRec.abbr}</div>
                    <div style={{fontSize:12,fontWeight:900,color:D.indigoL,marginBottom:3}}>{g.mlRec.prob}%</div>
                    <div style={{fontSize:9,color:D.muted}}>{g.mlRec.line}</div>
                  </div>
                  {/* RL */}
                  <div style={{background:`${D.violet}0a`,border:`1px solid ${D.violet}22`,borderRadius:11,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:D.violet,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>📏 Runline</div>
                    <div style={{fontSize:11,fontWeight:800,color:D.text,marginBottom:2}}>{g.rlRec.abbr}</div>
                    <div style={{fontSize:12,fontWeight:900,color:D.violet,marginBottom:3}}>{g.rlRec.cover}%</div>
                    <div style={{fontSize:9,color:D.muted}}>{g.rlRec.diff}</div>
                  </div>
                  {/* OU */}
                  <div style={{background:`${g.ouRec.rec==="OVER"?D.green:D.indigo}0a`,border:`1px solid ${g.ouRec.rec==="OVER"?D.green:D.indigo}22`,borderRadius:11,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:g.ouRec.rec==="OVER"?D.green:D.indigoL,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>⚡ O/U</div>
                    <div style={{fontSize:11,fontWeight:800,color:D.text,marginBottom:2}}>{g.ouRec.rec}</div>
                    <div style={{fontSize:12,fontWeight:900,color:g.ouRec.rec==="OVER"?D.green:D.indigoL,marginBottom:3}}>{g.ouRec.prob}%</div>
                    <div style={{fontSize:9,color:D.muted}}>Línea {g.ouRec.line}</div>
                  </div>
                </div>

                {/* Reasoning */}
                <div style={{padding:"8px 10px",background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:9,marginBottom:10}}>
                  <div style={{fontSize:8,color:D.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>📊 Por qué</div>
                  <div style={{fontSize:10,color:D.sub,lineHeight:1.5}}>{g.reason}</div>
                </div>

                {/* Quick stats + CTA */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:800,color:D.indigoL}}>{g.pred.conf}%</div><div style={{fontSize:7,color:D.muted,textTransform:"uppercase"}}>Confianza</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:800,color:D.green}}>+{g.pred.edge}%</div><div style={{fontSize:7,color:D.muted,textTransform:"uppercase"}}>Ventaja</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:800,color:D.amber}}>{g.pred.proj}R</div><div style={{fontSize:7,color:D.muted,textTransform:"uppercase"}}>Proyección</div></div>
                  </div>
                  <button onClick={()=>onSelect(g)} style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${D.indigoL}33`,background:`${D.indigo}14`,color:D.indigoL,fontSize:10,fontWeight:700,cursor:"pointer"}}>
                    Análisis →
                  </button>
                </div>
              </div>

              {/* Lock overlay for free users after 3 */}
              {isLocked&&(
                <div style={{position:"absolute",inset:0,background:dark?"rgba(10,14,26,0.88)":"rgba(240,244,248,0.88)",backdropFilter:"blur(3px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                  <div style={{fontSize:24}}>🔒</div>
                  <div style={{fontSize:12,fontWeight:700,color:D.text}}>Más oportunidades en Plan Pro</div>
                  <button onClick={onUpgrade} style={{padding:"8px 16px",borderRadius:9,border:"none",background:`linear-gradient(135deg,${D.violet},${D.indigo})`,color:"white",fontWeight:700,fontSize:11,cursor:"pointer"}}>Ver Planes →</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MLB STATS SCREEN (30 TEAMS) ──────────────────────────────────────────────
function StatsScreen({dark,onTeamSelect}){
  const D=dark?DARK:LIGHT;
  const [view,setView]=useState("divisions");
  const [selDiv,setSelDiv]=useState(null);
  const [selTeam,setSelTeam]=useState(null);

  if(selTeam){
    const t=ALL_TEAMS[selTeam];
    const wrc=Math.round(95+(t.ops-.720)*400);
    const xera=(t.era+0.15+Math.random()*.1).toFixed(2);
    return(
      <div style={{padding:"0"}}>
        <div style={{position:"sticky",top:0,zIndex:30,background:dark?"rgba(10,14,26,0.97)":"rgba(240,244,248,0.97)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderBottom:`1px solid ${D.glassBorder}`,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setSelTeam(null)} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:9,padding:"6px 11px",color:D.sub,fontSize:12,fontWeight:600,cursor:"pointer"}}>←</button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:32,height:32,borderRadius:9,background:`${t.clr}22`,border:`1px solid ${t.clr}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:t.clr}}>{t.abbr}</div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:D.text}}>{t.name}</div>
                <div style={{fontSize:9,color:D.muted}}>{t.div}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{padding:"14px 13px 90px"}}>
          {/* Record card */}
          <div style={{background:`radial-gradient(circle at 20% 50%,${t.clr}18,transparent)`,border:`1px solid ${t.clr}28`,borderRadius:18,padding:"16px",marginBottom:14}}>
            <div style={{height:2,background:`linear-gradient(90deg,${t.clr}00,${t.clr},${t.clr}00)`,marginBottom:14}}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[{l:"Victorias",v:t.w,c:D.green},{l:"Derrotas",v:t.l,c:D.red},{l:"PCG",v:`.${(t.wpct*1000).toFixed(0)}`,c:t.wpct>=.550?D.green:t.wpct>=.480?D.indigoL:D.muted},{l:"Racha",v:t.streak,c:t.streak.startsWith("G")?D.green:D.red}].map(({l,v,c})=>(
                <div key={l} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
                  <div style={{fontSize:7,color:D.muted,textTransform:"uppercase",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <SLabel icon="⚾" dark={dark}>Pitcheo</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:14}}>
            {[{l:"ERA",v:t.era,c:t.era<3.7?D.green:t.era<4.2?D.indigoL:D.muted},{l:"xERA",v:xera,c:D.sub},{l:"R/J",v:t.rpg,c:D.sub}].map(({l,v,c})=>(
              <div key={l} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
                <div style={{fontSize:7,color:D.muted,textTransform:"uppercase",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
          <SLabel icon="🏏" dark={dark}>Ofensiva</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:14}}>
            {[{l:"OPS",v:`.${(t.ops*1000).toFixed(0)}`,c:t.ops>=.760?D.green:t.ops>=.730?D.indigoL:D.muted},{l:"wRC+",v:`${wrc}`,c:wrc>=115?D.green:wrc>=100?D.indigoL:D.muted},{l:"R/J",v:t.rpg,c:D.sub},{l:"Últ. 10",v:t.last10,c:parseInt(t.last10)>=7?D.green:parseInt(t.last10)<=3?D.red:D.sub}].map(({l,v,c})=>(
              <div key={l} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"9px 5px",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:7,color:D.muted,textTransform:"uppercase",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
          <SLabel icon="📊" dark={dark}>Tendencias</SLabel>
          <div style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:12,padding:"12px"}}>
            {[{l:"Últimos 10 juegos",v:t.last10},{l:"Racha actual",v:t.streak.startsWith("G")?`${t.streak.slice(1)} victorias consecutivas`:`${t.streak.slice(1)} derrotas consecutivas`},{l:"División",v:t.div},{l:"Posición en división",v:`${Object.values(ALL_TEAMS).filter(x=>x.div===t.div).sort((a,b)=>b.wpct-a.wpct).findIndex(x=>x.abbr===t.abbr)+1}°`}].map(({l,v},i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<3?`1px solid ${D.glassBorder}`:"none"}}>
                <span style={{fontSize:11,color:D.sub}}>{l}</span>
                <span style={{fontSize:11,fontWeight:700,color:D.text}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const divTeams=selDiv?Object.values(ALL_TEAMS).filter(t=>t.div===selDiv):null;

  return(
    <div style={{padding:"12px 13px 0"}}>
      <div style={{fontSize:18,fontWeight:900,color:D.text,marginBottom:3,letterSpacing:"-0.03em"}}>Estadísticas MLB</div>
      <div style={{fontSize:10,color:D.muted,marginBottom:12}}>30 equipos · Temporada 2026</div>

      {/* Division tabs */}
      <div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",marginBottom:12,paddingBottom:2}}>
        <button onClick={()=>setSelDiv(null)} style={{flexShrink:0,padding:"6px 12px",borderRadius:9,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",background:!selDiv?`linear-gradient(135deg,${D.indigo}33,${D.violet}22)`:D.glass,color:!selDiv?D.indigoL:D.muted,outline:!selDiv?`1px solid ${D.indigoL}33`:`1px solid ${D.glassBorder}`}}>Todas</button>
        {DIVISIONS.map(div=>(
          <button key={div} onClick={()=>setSelDiv(div)} style={{flexShrink:0,padding:"6px 12px",borderRadius:9,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",background:selDiv===div?`linear-gradient(135deg,${D.indigo}33,${D.violet}22)`:D.glass,color:selDiv===div?D.indigoL:D.muted,outline:selDiv===div?`1px solid ${D.indigoL}33`:`1px solid ${D.glassBorder}`}}>{div}</button>
        ))}
      </div>

      {/* Teams grouped by division */}
      {(selDiv?[selDiv]:DIVISIONS).map(div=>{
        const teams=Object.values(ALL_TEAMS).filter(t=>t.div===div).sort((a,b)=>b.wpct-a.wpct);
        return(
          <div key={div} style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:D.indigoL,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <div style={{height:1,width:10,background:`linear-gradient(90deg,${D.indigo},transparent)`}}/>
              {div}
            </div>
            <div style={{borderRadius:13,overflow:"hidden",border:`1px solid ${D.glassBorder}`}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:D.bg2}}>
                  {["Equipo","G","P","PCG","ERA","OPS"].map((h,i)=>(
                    <th key={i} style={{padding:"7px 8px",textAlign:i===0?"left":"center",fontSize:8,color:D.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {teams.map((t,i)=>(
                    <tr key={t.abbr} onClick={()=>setSelTeam(t.abbr)} style={{background:i%2===0?D.glass:"transparent",borderTop:`1px solid ${D.glassBorder}`,cursor:"pointer"}}>
                      <td style={{padding:"10px 8px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:t.clr,flexShrink:0}}/>
                          <span style={{fontSize:11,fontWeight:700,color:D.text}}>{t.abbr}</span>
                          {i===0&&<span style={{fontSize:7,color:D.green,background:`${D.green}14`,border:`1px solid ${D.green}28`,borderRadius:3,padding:"1px 3px",fontWeight:700}}>1°</span>}
                        </div>
                      </td>
                      <td style={{textAlign:"center",fontSize:11,fontWeight:700,color:D.text,padding:"10px 6px"}}>{t.w}</td>
                      <td style={{textAlign:"center",fontSize:11,fontWeight:600,color:D.sub,padding:"10px 6px"}}>{t.l}</td>
                      <td style={{textAlign:"center",padding:"10px 6px"}}><span style={{fontSize:11,fontWeight:800,color:t.wpct>=.570?D.green:t.wpct>=.500?D.indigoL:D.muted}}>.{(t.wpct*1000).toFixed(0)}</span></td>
                      <td style={{textAlign:"center",padding:"10px 6px"}}><span style={{fontSize:11,fontWeight:700,color:t.era<3.7?D.green:t.era<4.2?D.indigoL:D.muted}}>{t.era}</span></td>
                      <td style={{textAlign:"center",padding:"10px 6px"}}><span style={{fontSize:11,fontWeight:700,color:t.ops>=.760?D.green:t.ops>=.730?D.indigoL:D.muted}}>.{(t.ops*1000).toFixed(0)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CALENDAR SCREEN ──────────────────────────────────────────────────────────
function CalendarScreen({games,onSelect,dark}){
  const D=dark?DARK:LIGHT;
  const [filter,setFilter]=useState("all");
  const liveN=games.filter(g=>g.isLive).length;
  const shown=games.filter(g=>filter==="all"?true:filter==="live"?g.isLive:!g.isLive&&!g.isFinal);

  return(
    <div>
      <div style={{padding:"10px 13px 0"}}>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:18,fontWeight:900,color:D.text,letterSpacing:"-0.03em",marginBottom:1}}>Calendario</div>
          <div style={{fontSize:10,color:D.muted}}>{new Date().toLocaleDateString("es",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
        </div>
        <div style={{display:"flex",gap:4,background:D.glass,borderRadius:10,padding:3,border:`1px solid ${D.glassBorder}`,marginBottom:10}}>
          {[["all",`Todos (${games.length})`],["live",`En Vivo (${liveN})`],["upcoming","Próximos"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{flex:1,padding:"7px 4px",borderRadius:8,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",background:filter===v?`linear-gradient(135deg,${D.indigo}33,${D.violet}22)`:"transparent",color:filter===v?D.indigoL:D.muted,outline:filter===v?`1px solid ${D.indigoL}33`:"none"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{padding:"0 13px",display:"flex",flexDirection:"column",gap:8}}>
        {shown.map((g,i)=>{
          const H=ALL_TEAMS[g.home],A=ALL_TEAMS[g.away];
          if(!H||!A) return null;
          const pred=predict(g.away,g.home,g.pf||1,g.wx?.wind||"");
          return(
            <div key={g.id} onClick={()=>onSelect(g)} style={{borderRadius:16,overflow:"hidden",border:`1px solid ${g.isLive?"rgba(16,185,129,0.3)":D.glassBorder}`,background:D.bg1,boxShadow:dark?(g.isLive?"0 0 0 1px rgba(16,185,129,0.1),0 8px 24px rgba(0,0,0,0.4)":"0 4px 16px rgba(0,0,0,0.25)"):"0 2px 10px rgba(0,0,0,0.06)",cursor:"pointer",animation:`v14Up 0.3s ${i*0.04}s both ease`}}>
              <div style={{height:3,background:`linear-gradient(90deg,${A.clr},${H.clr})`}}/>
              <div style={{padding:"12px 13px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {g.isLive?<span style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:700,color:D.green}}><LiveDot/> EN VIVO</span>:g.isFinal?<span style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:600,color:D.muted}}>FINAL</span>:<span style={{background:`${D.indigo}14`,border:`1px solid ${D.indigoL}33`,borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:600,color:D.indigoL}}>{g.time}</span>}
                    <span style={{fontSize:9,color:D.muted}}>{g.venue?.split(" ").slice(0,2).join(" ")}</span>
                  </div>
                  {pred&&<Ring grade={pred.grade} conf={pred.conf} size={34} dark={dark}/>}
                </div>
                {(g.isLive||g.isFinal)&&g.sim?(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9,padding:"9px 12px",background:D.glass,borderRadius:11,border:`1px solid ${D.glassBorder}`}}>
                    {[{t:A,sc:g.sim.away},{t:H,sc:g.sim.home}].map((x,idx)=>(
                      <div key={idx} style={{textAlign:"center"}}>
                        <div style={{fontSize:10,fontWeight:700,color:x.t.clr,marginBottom:1}}>{x.t.abbr}</div>
                        <div style={{fontSize:28,fontWeight:900,color:D.text,lineHeight:1}}>{x.sc}</div>
                      </div>
                    ))}
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",marginBottom:9}}>
                    {[{t:A,label:"Visitante"},null,{t:H,label:"Local"}].map((x,idx)=>{
                      if(!x) return <div key="at" style={{padding:"0 7px",color:D.muted,fontWeight:700}}>@</div>;
                      return <div key={idx} style={{flex:1,textAlign:"center"}}>
                        <div style={{width:40,height:40,borderRadius:11,margin:"0 auto 6px",background:`linear-gradient(135deg,${x.t.clr}22,${x.t.clr}08)`,border:`1.5px solid ${x.t.clr}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:x.t.clr}}>{x.t.abbr}</div>
                        <div style={{fontSize:11,fontWeight:700,color:D.text}}>{x.t.name.split(" ").pop()}</div>
                        <div style={{fontSize:9,color:D.muted,marginTop:1}}>{x.label}</div>
                      </div>;
                    })}
                  </div>
                )}
                {pred&&!g.isFinal&&(
                  <div style={{display:"flex",gap:4}}>
                    <Chip label="Home ML" value={fO(pred.hO)} color={H.clr} dark={dark}/>
                    <Chip label="Away ML" value={fO(pred.aO)} color={A.clr} dark={dark}/>
                    <Chip label={`${pred.rec} ${pred.line}`} value={`${pred.rec==="OVER"?pred.overP:pred.underP}%`} color={pred.rec==="OVER"?D.green:D.indigo} dark={dark}/>
                    <Chip label="Conf." value={`${pred.conf}%`} color={D.indigoL} dark={dark}/>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AXE CHAT ─────────────────────────────────────────────────────────────────
function AxeChat({dark,onClose,userPlan}){
  const D=dark?DARK:LIGHT;
  const plan=PLANS[userPlan];
  const limit=plan.limits.axeQueries;
  const [msgs,setMsgs]=useState([{id:1,from:"agent",text:"¡Hola! Soy Axe, tu asistente de MLBEdge. Puedo ayudarte con análisis de béisbol, estadísticas, reglas, funcionamiento de la plataforma y más. ¿En qué puedo ayudarte hoy?",time:"Ahora"}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [queries,setQueries]=useState(0);
  const endRef=useRef(null);

  const QUICK=["¿Qué es el Moneyline?","¿Cómo funciona el Runline?","¿Qué es el wRC+?","¿Qué incluye el Plan Pro?"];

  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs,typing]);

  const atLimit=queries>=limit;

  const send=async(text=input)=>{
    if(!text.trim()||atLimit) return;
    const userMsg={id:Date.now(),from:"user",text,time:"Ahora"};
    setMsgs(m=>[...m,userMsg]);
    setInput("");
    setTyping(true);
    setQueries(q=>q+1);
    try{
      const response=await askAxe(text,msgs);
      setMsgs(m=>[...m,{id:Date.now()+1,from:"agent",text:response,time:"Ahora"}]);
    }catch{
      const fallbacks={"moneyline":"El Moneyline es la apuesta más directa en béisbol: simplemente eliges qué equipo gana el partido. Las cuotas negativas (-150) indican al favorito y las positivas (+130) al underdog. MLBEdge calcula la probabilidad real de victoria para detectar si el mercado ofrece valor.","runline":"El Runline es el handicap del béisbol. El favorito debe ganar por 2 o más carreras (-1.5) para que la apuesta sea ganadora. El underdog puede perder por 1 carrera y aún cubrir (+1.5). Es ideal cuando hay un pitcher dominante.","wrc":"El wRC+ (Weighted Runs Created Plus) mide la producción ofensiva ajustada al parque y la época. Un wRC+ de 100 es exactamente promedio de la liga. Un valor de 130 significa que ese bateador produce 30% más que el promedio.","plan":"El Plan Pro incluye análisis avanzados, comparativas sabermétricas completas, 100 consultas diarias a Axe y modelos predictivos de mayor precisión. El Plan Elite lo incluye todo sin restricciones."};
      const key=Object.keys(fallbacks).find(k=>text.toLowerCase().includes(k));
      setMsgs(m=>[...m,{id:Date.now()+1,from:"agent",text:fallbacks[key]||"Gracias por tu pregunta. Explora las secciones de análisis de cada partido para obtener predicciones detalladas de Moneyline, Runline y Over/Under.",time:"Ahora"}]);
    }
    setTyping(false);
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:480,height:"78vh",background:dark?"rgba(10,14,26,0.99)":"rgba(255,255,255,0.99)",borderRadius:"22px 22px 0 0",border:`1px solid ${D.glassBorder}`,borderBottom:"none",display:"flex",flexDirection:"column",animation:"v14SlideUp 0.3s ease"}}>
        <div style={{width:36,height:4,borderRadius:99,background:"rgba(255,255,255,0.15)",margin:"12px auto 0"}}/>
        {/* Header */}
        <div style={{padding:"12px 16px 10px",borderBottom:`1px solid ${D.glassBorder}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${D.indigo},${D.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🤖</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:D.text}}>Axe — Asistente MLBEdge</div>
            <div style={{fontSize:10,color:D.green,display:"flex",alignItems:"center",gap:4}}><LiveDot color={D.green}/> En línea · {limit===Infinity?"Ilimitado":`${queries}/${limit} consultas hoy`}</div>
          </div>
          <button onClick={onClose} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:8,padding:"5px 10px",color:D.sub,cursor:"pointer",fontSize:13}}>✕</button>
        </div>
        {/* Quick questions */}
        {msgs.length<=1&&(
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${D.glassBorder}`}}>
            <div style={{fontSize:8,color:D.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Preguntas populares</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {QUICK.map((q,i)=>(
                <button key={i} onClick={()=>send(q)} style={{background:`${D.indigo}14`,border:`1px solid ${D.indigoL}33`,borderRadius:7,padding:"5px 9px",color:D.indigoL,fontSize:9,fontWeight:600,cursor:"pointer"}}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:9}}>
          {msgs.map(m=>(
            <div key={m.id} style={{display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start",animation:"v14Up 0.25s ease"}}>
              {m.from==="agent"&&<div style={{width:26,height:26,borderRadius:7,background:`linear-gradient(135deg,${D.indigo},${D.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,marginRight:6,flexShrink:0,alignSelf:"flex-end"}}>🤖</div>}
              <div style={{maxWidth:"78%",padding:"9px 12px",borderRadius:m.from==="user"?"13px 13px 4px 13px":"13px 13px 13px 4px",background:m.from==="user"?`linear-gradient(135deg,${D.indigo},${D.violet})`:D.glass,border:m.from==="user"?"none":`1px solid ${D.glassBorder}`}}>
                <div style={{fontSize:12,color:m.from==="user"?"white":D.text,lineHeight:1.65}}>{m.text}</div>
                <div style={{fontSize:8,color:m.from==="user"?"rgba(255,255,255,0.5)":D.muted,marginTop:3}}>{m.from==="user"?"✓✓":"Axe · MLBEdge"}</div>
              </div>
            </div>
          ))}
          {typing&&<div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:26,height:26,borderRadius:7,background:`linear-gradient(135deg,${D.indigo},${D.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🤖</div><div style={{padding:"9px 13px",background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:"13px 13px 13px 4px",display:"flex",gap:3,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:D.indigoL,animation:`v14Bounce 0.6s ${i*0.15}s ease infinite`}}/>)}</div></div>}
          <div ref={endRef}/>
        </div>
        {/* Limit warning */}
        {atLimit&&(
          <div style={{padding:"8px 14px",background:`${D.amber}0a`,borderTop:`1px solid ${D.amber}22`}}>
            <div style={{fontSize:10,color:D.amber,fontWeight:600,textAlign:"center"}}>
              Límite diario alcanzado · <span style={{textDecoration:"underline",cursor:"pointer"}}>Actualiza tu plan para más consultas</span>
            </div>
          </div>
        )}
        {/* Input */}
        <div style={{padding:"10px 14px 16px",borderTop:`1px solid ${D.glassBorder}`,display:"flex",gap:7,alignItems:"flex-end"}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} disabled={atLimit} placeholder={atLimit?"Límite diario alcanzado":"Pregunta a Axe sobre béisbol y MLBEdge..."} style={{flex:1,padding:"10px 13px",background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:11,color:D.text,fontSize:12,outline:"none",opacity:atLimit?0.5:1}}/>
          <button onClick={()=>send()} disabled={!input.trim()||typing||atLimit} style={{width:40,height:40,borderRadius:10,border:"none",background:input.trim()&&!typing&&!atLimit?`linear-gradient(135deg,${D.indigo},${D.violet})`:"rgba(255,255,255,0.1)",color:input.trim()&&!typing&&!atLimit?"white":D.muted,fontSize:16,cursor:input.trim()&&!atLimit?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>→</button>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({dark,userPlan,onChangePlan,onFeedback}){
  const D=dark?DARK:LIGHT;
  const plan=PLANS[userPlan];
  const stats=[{l:"Análisis",v:"247",i:"📊",c:D.green},{l:"Precisión",v:"58.3%",i:"🎯",c:D.indigoL},{l:"Racha",v:"4V",i:"🔥",c:D.amber},{l:"ROI",v:"+12.4%",i:"💰",c:D.green},{l:"Últimos 10",v:"7-3",i:"📈",c:D.green},{l:"Mercado",v:"O/U",i:"⭐",c:D.violet}];
  return(
    <div style={{padding:"12px 13px 0"}}>
      {/* Plan card */}
      <div style={{background:`linear-gradient(135deg,${plan.color}18,${plan.color}08)`,border:`1px solid ${plan.color}28`,borderRadius:18,padding:"18px",marginBottom:12,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${plan.color},transparent)`}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:plan.color,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Tu Plan Actual</div>
            <div style={{fontSize:22,fontWeight:900,color:D.text,marginBottom:2}}>{plan.name}</div>
            <div style={{fontSize:12,color:D.sub}}>{plan.price}{plan.period}</div>
          </div>
          <div style={{width:52,height:52,borderRadius:14,background:`${plan.color}22`,border:`1px solid ${plan.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
            {userPlan==="starter"?"⚾":userPlan==="pro"?"🚀":"⭐"}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
          {stats.map(s=><div key={s.l} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}><div style={{fontSize:13,marginBottom:2}}>{s.i}</div><div style={{fontSize:13,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:7,color:D.muted,marginTop:1}}>{s.l}</div></div>)}
        </div>
      </div>
      {/* Upgrade CTA */}
      {userPlan!=="elite"&&(
        <button onClick={onChangePlan} style={{width:"100%",padding:"13px",borderRadius:13,border:`1px solid ${D.indigoL}33`,background:`linear-gradient(135deg,${D.indigo}22,${D.violet}14)`,color:D.indigoL,fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          🚀 Ver todos los planes →
        </button>
      )}
      <button onClick={onFeedback} style={{width:"100%",padding:"11px",borderRadius:12,border:`1px solid ${D.glassBorder}`,background:D.glass,color:D.sub,fontWeight:600,fontSize:12,cursor:"pointer",marginBottom:10}}>
        💡 Enviar sugerencia
      </button>
      <div style={{textAlign:"center",fontSize:8,color:D.muted,lineHeight:2,textTransform:"uppercase"}}>MLBEdge v14 · Asistente Axe · MLB Stats API · Statcast<br/>Solo para análisis informativo · +21</div>
    </div>
  );
}

// ─── NOTIFICATIONS CENTER ─────────────────────────────────────────────────────
const INIT_NOTIFS=[
  {id:1,type:"live",icon:"🔴",title:"Partido En Vivo",body:"NYY 3 - BOS 2 · ▲7mo Inning",time:"Hace 2 min",read:false,color:"#10b981"},
  {id:2,type:"value",icon:"🎯",title:"Alta Confianza Detectada",body:"LAD @ ATL — 84% confianza en Moneyline local",time:"Hace 8 min",read:false,color:"#6366f1"},
  {id:3,type:"model",icon:"📊",title:"Cambio en Proyección",body:"MIL @ CHC: Viento OUT 15mph — Over subió a 67%",time:"Hace 15 min",read:false,color:"#f59e0b"},
  {id:4,type:"system",icon:"✨",title:"MLBEdge v14 Disponible",body:"Axe AI, 30 equipos, Planes renovados y más",time:"Hace 1 hora",read:true,color:"#818cf8"},
];

function NotifCenter({dark,onClose}){
  const D=dark?DARK:LIGHT;
  const [notifs,setNotifs]=useState(INIT_NOTIFS);
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:480,background:dark?"rgba(10,14,26,0.99)":"rgba(255,255,255,0.99)",borderRadius:"22px 22px 0 0",border:`1px solid ${D.glassBorder}`,borderBottom:"none",maxHeight:"80vh",display:"flex",flexDirection:"column",animation:"v14SlideUp 0.3s ease"}}>
        <div style={{width:36,height:4,borderRadius:99,background:"rgba(255,255,255,0.15)",margin:"12px auto 0"}}/>
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${D.glassBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:16,fontWeight:900,color:D.text}}>Notificaciones <span style={{background:D.red,color:"white",fontSize:10,fontWeight:700,borderRadius:99,padding:"1px 6px",marginLeft:6}}>{notifs.filter(n=>!n.read).length}</span></div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:7,padding:"5px 9px",color:D.indigoL,fontSize:10,fontWeight:600,cursor:"pointer"}}>Leer todas</button>
            <button onClick={onClose} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:7,padding:"5px 9px",color:D.sub,fontSize:13,cursor:"pointer"}}>✕</button>
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {notifs.map(n=>(
            <div key={n.id} onClick={()=>setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))} style={{display:"flex",gap:11,padding:"12px 16px",cursor:"pointer",background:!n.read?`${n.color}08`:"transparent",borderBottom:`1px solid ${D.glassBorder}`}}>
              <div style={{width:38,height:38,borderRadius:11,background:`${n.color}18`,border:`1px solid ${n.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0,position:"relative"}}>
                {n.icon}
                {!n.read&&<div style={{position:"absolute",top:-2,right:-2,width:8,height:8,borderRadius:"50%",background:n.color,border:`1.5px solid ${D.bg0}`}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:!n.read?800:600,color:D.text,marginBottom:2}}>{n.title}</div>
                <div style={{fontSize:10,color:D.sub,lineHeight:1.4,marginBottom:3}}>{n.body}</div>
                <div style={{fontSize:9,color:D.muted}}>{n.time}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();setNotifs(ns=>ns.filter(x=>x.id!==n.id));}} style={{background:"transparent",border:"none",color:D.muted,fontSize:13,cursor:"pointer",padding:"0 3px",flexShrink:0,alignSelf:"flex-start",opacity:0.6}}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────
function FeedbackModal({dark,onClose}){
  const D=dark?DARK:LIGHT;
  const [type,setType]=useState("sugerencia");
  const [rating,setRating]=useState(0);
  const [text,setText]=useState("");
  const [sent,setSent]=useState(false);
  const submit=async()=>{if(!text.trim())return;await new Promise(r=>setTimeout(r,1200));setSent(true);};
  if(sent) return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:dark?"rgba(10,14,26,0.99)":"white",borderRadius:20,padding:"40px 24px",textAlign:"center",maxWidth:340,width:"100%",border:`1px solid ${D.glassBorder}`,animation:"v14Up 0.3s ease"}}>
        <div style={{fontSize:48,marginBottom:14}}>✅</div>
        <div style={{fontSize:17,fontWeight:800,color:D.text,marginBottom:8}}>¡Gracias!</div>
        <div style={{fontSize:12,color:D.sub,lineHeight:1.6,marginBottom:20}}>Tu {type} fue recibida. El equipo de MLBEdge la revisará pronto.</div>
        <button onClick={onClose} style={{padding:"11px 28px",borderRadius:11,border:"none",background:`linear-gradient(135deg,${D.indigo},${D.violet})`,color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>Cerrar</button>
      </div>
    </div>
  );
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:480,background:dark?"rgba(10,14,26,0.99)":"rgba(255,255,255,0.99)",borderRadius:"22px 22px 0 0",border:`1px solid ${D.glassBorder}`,borderBottom:"none",padding:"0 0 24px",animation:"v14SlideUp 0.3s ease"}}>
        <div style={{width:36,height:4,borderRadius:99,background:"rgba(255,255,255,0.15)",margin:"12px auto 0"}}/>
        <div style={{padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:16,fontWeight:900,color:D.text}}>Sugerencias</div>
            <button onClick={onClose} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:7,padding:"5px 9px",color:D.sub,cursor:"pointer",fontSize:13}}>✕</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14}}>
            {[{id:"sugerencia",icon:"💡",label:"Sugerencia"},{id:"error",icon:"🐛",label:"Reportar Error"},{id:"funcion",icon:"✨",label:"Nueva Función"},{id:"comentario",icon:"💬",label:"Comentario"}].map(t=>(
              <button key={t.id} onClick={()=>setType(t.id)} style={{padding:"11px",borderRadius:11,border:"none",cursor:"pointer",background:type===t.id?`linear-gradient(135deg,${D.indigo}33,${D.violet}22)`:D.glass,outline:type===t.id?`1px solid ${D.indigoL}44`:`1px solid ${D.glassBorder}`,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                <span style={{fontSize:18}}>{t.icon}</span>
                <span style={{fontSize:10,fontWeight:type===t.id?700:500,color:type===t.id?D.indigoL:D.sub}}>{t.label}</span>
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:5,marginBottom:12}}>
            {[1,2,3,4,5].map(s=><button key={s} onClick={()=>setRating(s)} style={{fontSize:24,background:"transparent",border:"none",cursor:"pointer",filter:s<=rating?"none":"grayscale(1) opacity(0.3)",transition:"all 0.15s"}}>⭐</button>)}
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`Describe tu ${type}...`} rows={4} style={{width:"100%",padding:"11px 13px",background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:11,color:D.text,fontSize:12,outline:"none",resize:"none",lineHeight:1.6,fontFamily:"inherit",marginBottom:12}}/>
          <button onClick={submit} disabled={!text.trim()} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",cursor:"pointer",background:text.trim()?`linear-gradient(135deg,${D.indigo},${D.violet})`:"rgba(255,255,255,0.08)",color:text.trim()?"white":D.muted,fontWeight:700,fontSize:13}}>Enviar Sugerencia →</button>
        </div>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({active,onChange,picksCount,dark}){
  const D=dark?DARK:LIGHT;
  const tabs=[{id:"calendar",icon:"📅",label:"Calendario"},{id:"opps",icon:"⭐",label:"Oportunidades",badge:picksCount},{id:"stats",icon:"📊",label:"Estadísticas"},{id:"profile",icon:"👤",label:"Perfil"}];
  return(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:50,background:dark?"rgba(10,14,26,0.97)":"rgba(255,255,255,0.97)",backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",borderTop:`1px solid ${D.glassBorder}`,display:"flex",paddingBottom:"env(safe-area-inset-bottom,6px)"}}>
      {tabs.map(tab=>{const isA=active===tab.id;return(
        <button key={tab.id} onClick={()=>onChange(tab.id)} style={{flex:1,padding:"10px 4px 7px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative",WebkitTapHighlightColor:"transparent"}}>
          {isA&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:24,height:2,borderRadius:"0 0 2px 2px",background:`linear-gradient(90deg,${D.indigo},${D.violet})`,boxShadow:`0 0 8px ${D.indigo}88`}}/>}
          {tab.badge>0&&<div style={{position:"absolute",top:6,right:"calc(50% - 18px)",background:D.green,color:"#000",fontSize:7,fontWeight:800,minWidth:13,height:13,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px",border:`1.5px solid ${D.bg0}`}}>{tab.badge}</div>}
          <span style={{fontSize:19,filter:isA?"none":"grayscale(1) opacity(0.4)",transition:"filter .2s,transform .2s",transform:isA?"scale(1.1)":"scale(1)"}}>{tab.icon}</span>
          <span style={{fontSize:8,fontWeight:isA?700:500,color:isA?D.indigoL:D.muted,transition:"color .2s"}}>{tab.label}</span>
        </button>
      );})}
    </div>
  );
}

// ─── GAME DETAIL (SIMPLIFIED) ─────────────────────────────────────────────────
function GameDetail({game,onBack,dark,userPlan,onUpgrade}){
  const D=dark?DARK:LIGHT;
  const H=ALL_TEAMS[game.home],A=ALL_TEAMS[game.away];
  const pred=predict(game.away,game.home,game.pf||1,game.wx?.wind||"");
  const isPro=userPlan==="pro"||userPlan==="elite";

  return(
    <div style={{minHeight:"100vh",background:D.bg0}}>
      <div style={{position:"sticky",top:0,zIndex:30,background:dark?"rgba(10,14,26,0.97)":"rgba(240,244,248,0.97)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderBottom:`1px solid ${D.glassBorder}`,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onBack} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"7px 12px",color:D.sub,fontSize:12,fontWeight:600,cursor:"pointer"}}>← Atrás</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:900,color:D.text}}>
              <span style={{color:A?.clr}}>{A?.abbr}</span>
              <span style={{color:D.muted,margin:"0 5px",fontWeight:400}}>@</span>
              <span style={{color:H?.clr}}>{H?.abbr}</span>
            </div>
            <div style={{fontSize:9,color:D.muted}}>{game.venue} · {game.isLive?"🔴 EN VIVO":game.isFinal?"Final":game.time}</div>
          </div>
          {pred&&<Ring grade={pred.grade} conf={pred.conf} size={38} dark={dark}/>}
        </div>
      </div>
      <div style={{padding:"14px 13px 90px"}}>
        {/* Score */}
        {(game.isLive||game.isFinal)&&game.sim&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,padding:"14px 18px",background:`linear-gradient(135deg,${A?.clr||D.muted}14,${H?.clr||D.indigo}14)`,border:`1px solid ${D.glassBorder}`,borderRadius:16}}>
            {[{t:A,sc:game.sim.away},{t:H,sc:game.sim.home}].map((x,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:x.t?.clr,marginBottom:3}}>{x.t?.abbr}</div>
                <div style={{fontSize:44,fontWeight:900,color:D.text,lineHeight:1}}>{x.sc}</div>
              </div>
            ))}
            {game.isLive&&<div style={{textAlign:"center"}}>
              <LiveDot/>
              <div style={{fontSize:10,color:D.green,fontWeight:700,marginTop:3}}>{game.sim.half==="T"?"▲":"▼"}{game.sim.inn}</div>
            </div>}
          </div>
        )}
        {/* Pred */}
        {pred&&<>
          <div style={{display:"flex",gap:4,marginBottom:12}}>
            <Chip label="Home ML" value={fO(pred.hO)} color={H?.clr||D.indigo} dark={dark}/>
            <Chip label="Away ML" value={fO(pred.aO)} color={A?.clr||D.muted} dark={dark}/>
            <Chip label={`O/U ${pred.line}`} value={pred.rec} color={pred.rec==="OVER"?D.green:D.indigo} dark={dark}/>
            <Chip label="Conf." value={`${pred.conf}%`} color={D.indigoL} dark={dark}/>
          </div>
          {/* Win prob */}
          <div style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:13,padding:"13px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:11}}>
              <span style={{color:A?.clr,fontWeight:700}}>{A?.abbr} {pred.aWr}%</span>
              <span style={{fontSize:9,color:D.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Probabilidad Victoria</span>
              <span style={{color:H?.clr,fontWeight:700}}>{pred.hWr}% {H?.abbr}</span>
            </div>
            <div style={{display:"flex",borderRadius:99,overflow:"hidden",height:10,gap:1}}>
              <div style={{width:`${pred.aWr}%`,background:A?.clr||D.muted,transition:"width 1s ease"}}/>
              <div style={{width:`${pred.hWr}%`,background:H?.clr||D.indigo,transition:"width 1s ease"}}/>
            </div>
          </div>
          {/* 3 markets */}
          <SLabel icon="📊" dark={dark}>Análisis de Mercados</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:9,marginBottom:12}}>
            {[
              {title:"💵 Moneyline",color:D.indigo,content:`${pred.hWr>pred.aWr?H?.name:A?.name} es el favorito con ${Math.max(pred.hWr,pred.aWr)}% de probabilidad de victoria. Confianza ${pred.conf}% basado en ERA, OPS y factor de parque.`,rec:`Recomendación: ${pred.hWr>pred.aWr?H?.abbr:A?.abbr} ML ${pred.hWr>pred.aWr?fO(pred.hO):fO(pred.aO)}`},
              {title:"📏 Runline",color:D.violet,content:`El favorito tiene ${pred.rlCover}% de probabilidad de cubrir el Runline -1.5. Riesgo ${pred.risk} basado en diferencial de ERA y calidad ofensiva.`,rec:`Runline: ${pred.hWr>pred.aWr?H?.abbr:A?.abbr} −1.5`},
              {title:"⚡ Over/Under",color:pred.rec==="OVER"?D.green:D.indigoL,content:`El modelo proyecta ${pred.proj} carreras vs línea de ${pred.line}. ${game.wx?.wind.includes("OUT")?"Viento saliendo favorece el Over.":game.wx?.wind.includes("IN")?"Viento entrando suprime la ofensiva.":"Condiciones neutrales."}`,rec:`Recomendación: ${pred.rec} ${pred.line} (${pred.rec==="OVER"?pred.overP:pred.underP}%)`},
            ].map(({title,color,content,rec})=>(
              <div key={title} style={{background:`${color}0a`,border:`1px solid ${color}22`,borderRadius:13,padding:"13px"}}>
                <div style={{fontSize:11,fontWeight:800,color,marginBottom:7}}>{title}</div>
                <p style={{fontSize:11,color:D.sub,lineHeight:1.65,margin:0,marginBottom:8}}>{content}</p>
                <div style={{fontSize:11,fontWeight:700,color,background:`${color}14`,borderRadius:8,padding:"6px 10px"}}>{rec}</div>
              </div>
            ))}
          </div>
          {/* Advanced - pro gate */}
          <PlanGate feature="Comparativas Sabermétricas Avanzadas" userPlan={userPlan} requiredPlan="pro" dark={dark} onUpgrade={onUpgrade}>
            <div style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:13,padding:"13px"}}>
              <SLabel icon="📡" dark={dark}>Sabermetría Avanzada</SLabel>
              <div style={{fontSize:11,color:D.sub}}>ERA · xERA · FIP · xFIP · SIERA · wRC+ · wOBA · BABIP · Hard Hit% · Barrel%</div>
            </div>
          </PlanGate>
          {/* Weather */}
          {game.wx&&(
            <div style={{marginTop:12,background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:12,padding:"12px",display:"flex",alignItems:"center",gap:9}}>
              <span style={{fontSize:18}}>{game.wx.sky}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:D.text}}>{game.wx.desc}</div>
                <div style={{fontSize:9,color:D.muted,marginTop:1}}>{game.wx.temp}°F · {game.wx.wind} · PF {game.pf}</div>
              </div>
              {game.wx.wind.includes("OUT")&&<span style={{fontSize:9,color:D.green,fontWeight:700,background:`${D.green}14`,border:`1px solid ${D.green}28`,borderRadius:6,padding:"2px 7px"}}>↑ OVER</span>}
              {game.wx.wind.includes("IN")&&<span style={{fontSize:9,color:D.indigoL,fontWeight:700,background:`${D.indigo}14`,border:`1px solid ${D.indigoL}28`,borderRadius:6,padding:"2px 7px"}}>↓ UNDER</span>}
            </div>
          )}
        </>}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [dark,setDark]         = useState(true);
  const [tab,setTab]           = useState("calendar");
  const [games,setGames]       = useState([]);
  const [selected,setSelected] = useState(null);
  const [showNotifs,setNotifs] = useState(false);
  const [showAxe,setAxe]       = useState(false);
  const [showFeedback,setFb]   = useState(false);
  const [showPricing,setPricing]= useState(false);
  const [userPlan,setUserPlan] = useState("starter"); // starter | pro | elite
  const [notifCount,setNC]     = useState(3);

  const D=dark?DARK:LIGHT;

  useEffect(()=>{
    const load = async () => {
      const live = await fetchTodayGames();
      setGames(live && live.length > 0 ? live : buildGames());
    };
    load();
    const id = setInterval(load, 90_000);
    return () => clearInterval(id);
  },[]);

  const liveN =games.filter(g=>g.isLive).length;
  const valueN=games.filter(g=>{const p=predict(g.away,g.home,g.pf||1,g.wx?.wind||"");return p&&p.edge>0&&!g.isFinal;}).length;

  const handleUpgrade=()=>{setPricing(true);setSelected(null);};
  const handlePlanSelect=(plan)=>{setUserPlan(plan);setPricing(false);};

  if(showPricing) return(
    <div style={{background:D.bg0,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:D.text}}>
      <style>{`@keyframes v14Spin{to{transform:rotate(360deg)}}@keyframes v14Pulse{0%,100%{opacity:1}50%{opacity:.35}}@keyframes v14Up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes v14SlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes v14Bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}::-webkit-scrollbar{width:2px;height:2px}::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:99px}button{font-family:inherit;cursor:pointer;transition:all .15s ease;}button:active{transform:scale(.96);}input,textarea{outline:none;font-family:inherit;}html,body{overscroll-behavior:none;}`}</style>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <PricingScreen userPlan={userPlan} onSelect={handlePlanSelect} dark={dark} onBack={()=>setPricing(false)}/>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:D.bg0,fontFamily:"'Inter',system-ui,-apple-system,sans-serif",color:D.text,transition:"background 0.3s ease,color 0.3s ease"}}>
      <style>{`
        @keyframes v14Spin    {to{transform:rotate(360deg)}}
        @keyframes v14Pulse   {0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes v14Up      {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes v14SlideUp {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes v14Bounce  {0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:2px;height:2px}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:99px}
        button{font-family:inherit;cursor:pointer;transition:all .15s ease;}
        button:active{transform:scale(.96);}
        input,textarea{outline:none;font-family:inherit;}
        html,body{overscroll-behavior:none;}
      `}</style>

      {dark&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        {[{c:"rgba(99,102,241,0.06)",l:"50%",t:"-10%",s:500},{c:"rgba(16,185,129,0.04)",l:"5%",t:"35%",s:300}].map((g,i)=>(
          <div key={i} style={{position:"absolute",width:g.s,height:g.s,borderRadius:"50%",background:`radial-gradient(circle,${g.c},transparent 70%)`,left:`calc(${g.l} - ${g.s/2}px)`,top:`calc(${g.t} - ${g.s/2}px)`,filter:"blur(40px)"}}/>
        ))}
      </div>}

      <div style={{position:"relative",zIndex:1,maxWidth:480,margin:"0 auto",paddingBottom:selected?0:72}}>
        {selected?(
          <GameDetail game={selected} onBack={()=>setSelected(null)} dark={dark} userPlan={userPlan} onUpgrade={handleUpgrade}/>
        ):(
          <>
            {/* HEADER */}
            <div style={{position:"sticky",top:0,zIndex:30,background:dark?"rgba(10,14,26,0.96)":"rgba(240,244,248,0.96)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",borderBottom:`1px solid ${D.glassBorder}`,padding:"13px 14px 11px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <span style={{fontSize:22}}>⚾</span>
                    <span style={{fontSize:21,fontWeight:900,letterSpacing:"-0.05em",color:D.text}}>MLB<span style={{color:D.indigo}}>Edge</span></span>
                    <span onClick={handleUpgrade} style={{background:`linear-gradient(135deg,${PLANS[userPlan].color}44,${PLANS[userPlan].color}28)`,border:`1px solid ${PLANS[userPlan].color}44`,borderRadius:5,padding:"2px 7px",fontSize:8,fontWeight:800,color:PLANS[userPlan].color,letterSpacing:"0.1em",cursor:"pointer"}}>{PLANS[userPlan].name.toUpperCase()}</span>
                  </div>
                  <div style={{fontSize:9,color:D.muted}}>{new Date().toLocaleDateString("es",{weekday:"long",month:"long",day:"numeric"})}</div>
                </div>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  {liveN>0&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:D.green,fontWeight:600}}><LiveDot color={D.green}/>{liveN}</div>}
                  {/* Bell */}
                  <button onClick={()=>{setNotifs(true);setNC(0);}} style={{position:"relative",width:34,height:34,borderRadius:9,border:`1px solid ${D.glassBorder}`,background:D.glass,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    🔔
                    {notifCount>0&&<div style={{position:"absolute",top:-2,right:-2,background:D.red,color:"white",fontSize:7,fontWeight:800,minWidth:14,height:14,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px",border:`1.5px solid ${D.bg0}`,animation:"v14Pulse 2s ease infinite"}}>{notifCount}</div>}
                  </button>
                  {/* Theme */}
                  <button onClick={()=>setDark(d=>!d)} style={{width:34,height:34,borderRadius:9,border:`1px solid ${D.glassBorder}`,background:D.glass,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    {dark?"☀️":"🌙"}
                  </button>
                  <div style={{display:"flex",gap:4}}>
                    <div style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:7,padding:"4px 7px",textAlign:"center"}}><div style={{fontSize:11,fontWeight:800,color:D.indigoL}}>{valueN}</div><div style={{fontSize:6,color:D.muted,textTransform:"uppercase",letterSpacing:"0.05em"}}>Oport.</div></div>
                    <div style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:7,padding:"4px 7px",textAlign:"center"}}><div style={{fontSize:11,fontWeight:800,color:D.text}}>{games.length}</div><div style={{fontSize:6,color:D.muted,textTransform:"uppercase",letterSpacing:"0.05em"}}>Juegos</div></div>
                  </div>
                </div>
              </div>
            </div>

            {tab==="calendar" &&<CalendarScreen games={games} onSelect={setSelected} dark={dark}/>}
            {tab==="opps"     &&<OpportunitiesScreen games={games} onSelect={setSelected} dark={dark} userPlan={userPlan} onUpgrade={handleUpgrade}/>}
            {tab==="stats"    &&<StatsScreen dark={dark}/>}
            {tab==="profile"  &&<ProfileScreen dark={dark} userPlan={userPlan} onChangePlan={handleUpgrade} onFeedback={()=>setFb(true)}/>}

            <BottomNav active={tab} onChange={setTab} picksCount={valueN} dark={dark}/>

            {/* Axe chat button */}
            <button onClick={()=>setAxe(true)} style={{position:"fixed",bottom:80,right:16,width:52,height:52,borderRadius:"50%",border:"none",zIndex:40,background:`linear-gradient(135deg,${D.indigo},${D.violet})`,color:"white",fontSize:22,cursor:"pointer",boxShadow:`0 4px 20px ${D.indigo}66`,display:"flex",alignItems:"center",justifyContent:"center",animation:"v14Up 0.5s 0.3s both ease"}}>
              🤖
            </button>
          </>
        )}
      </div>

      {showNotifs &&<NotifCenter dark={dark} onClose={()=>setNotifs(false)}/>}
      {showAxe    &&<AxeChat dark={dark} onClose={()=>setAxe(false)} userPlan={userPlan}/>}
      {showFeedback&&<FeedbackModal dark={dark} onClose={()=>setFb(false)}/>}
    </div>
  );
}
