import { useState, useRef, useEffect, useCallback, memo } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SUPA_URL = "https://mojcqdvsahciksczoqhb.supabase.co";
const SUPA_KEY = ""; // Se lee de window.__ENV__ en Vercel
const MLB_API  = "https://statsapi.mlb.com/api/v1";
const PROXIES  = [
  u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://cors-anywhere.herokuapp.com/${u}`,
];

// En Vercel, las variables de entorno se inyectan en index.html
// En local/preview, usamos valores directos
function getEnv(key) {
  try {
    if (typeof window !== "undefined" && window.__ENV__?.[key]) return window.__ENV__[key];
    return "";
  } catch { return ""; }
}

// ─── MLB API ──────────────────────────────────────────────────────────────────
async function mlbFetch(path) {
  const url = MLB_API + path;
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(url), { signal: AbortSignal.timeout(7000) });
      if (res.ok) { const d = await res.json(); return d; }
    } catch { continue; }
  }
  return null;
}

// ─── ALL 30 TEAMS ─────────────────────────────────────────────────────────────
const ALL_TEAMS = {
  NYY:{name:"New York Yankees",    abbr:"NYY",clr:"#1D6FA4",div:"AL Este",  era:3.71,ops:.748,wpct:.574,rpg:4.8,w:51,l:38,streak:"G3",last10:"7-3"},
  BOS:{name:"Boston Red Sox",      abbr:"BOS",clr:"#C8102E",div:"AL Este",  era:4.12,ops:.739,wpct:.512,rpg:4.6,w:45,l:43,streak:"P1",last10:"5-5"},
  TOR:{name:"Toronto Blue Jays",   abbr:"TOR",clr:"#134A8E",div:"AL Este",  era:4.08,ops:.745,wpct:.519,rpg:4.7,w:46,l:43,streak:"G1",last10:"6-4"},
  TB: {name:"Tampa Bay Rays",      abbr:"TB", clr:"#8FBCE6",div:"AL Este",  era:3.71,ops:.728,wpct:.537,rpg:4.4,w:47,l:41,streak:"G2",last10:"6-4"},
  BAL:{name:"Baltimore Orioles",   abbr:"BAL",clr:"#DF4601",div:"AL Este",  era:3.88,ops:.752,wpct:.556,rpg:4.8,w:49,l:39,streak:"G4",last10:"7-3"},
  CLE:{name:"Cleveland Guardians", abbr:"CLE",clr:"#E31937",div:"AL Central",era:3.77,ops:.731,wpct:.537,rpg:4.5,w:47,l:41,streak:"P2",last10:"5-5"},
  MIN:{name:"Minnesota Twins",     abbr:"MIN",clr:"#002B5C",div:"AL Central",era:3.84,ops:.743,wpct:.537,rpg:4.7,w:47,l:41,streak:"G1",last10:"6-4"},
  KC: {name:"Kansas City Royals",  abbr:"KC", clr:"#004687",div:"AL Central",era:3.95,ops:.722,wpct:.500,rpg:4.3,w:44,l:44,streak:"G2",last10:"5-5"},
  CWS:{name:"Chicago White Sox",   abbr:"CWS",clr:"#27251F",div:"AL Central",era:4.45,ops:.698,wpct:.407,rpg:4.0,w:36,l:53,streak:"P4",last10:"3-7"},
  DET:{name:"Detroit Tigers",      abbr:"DET",clr:"#0C2340",div:"AL Central",era:3.91,ops:.719,wpct:.481,rpg:4.3,w:43,l:46,streak:"G1",last10:"5-5"},
  HOU:{name:"Houston Astros",      abbr:"HOU",clr:"#EB6E1F",div:"AL Oeste", era:3.62,ops:.758,wpct:.556,rpg:4.9,w:49,l:39,streak:"G3",last10:"7-3"},
  SEA:{name:"Seattle Mariners",    abbr:"SEA",clr:"#005C5C",div:"AL Oeste", era:3.67,ops:.726,wpct:.537,rpg:4.4,w:47,l:41,streak:"P1",last10:"6-4"},
  TEX:{name:"Texas Rangers",       abbr:"TEX",clr:"#003278",div:"AL Oeste", era:4.01,ops:.738,wpct:.519,rpg:4.6,w:46,l:43,streak:"G2",last10:"5-5"},
  LAA:{name:"Los Angeles Angels",  abbr:"LAA",clr:"#BA0021",div:"AL Oeste", era:4.31,ops:.725,wpct:.463,rpg:4.4,w:41,l:48,streak:"P3",last10:"4-6"},
  OAK:{name:"Oakland Athletics",   abbr:"OAK",clr:"#003831",div:"AL Oeste", era:4.22,ops:.712,wpct:.444,rpg:4.1,w:39,l:49,streak:"P2",last10:"4-6"},
  ATL:{name:"Atlanta Braves",      abbr:"ATL",clr:"#CE1141",div:"NL Este",  era:3.55,ops:.765,wpct:.593,rpg:5.0,w:52,l:36,streak:"G5",last10:"8-2"},
  PHI:{name:"Philadelphia Phillies",abbr:"PHI",clr:"#E81828",div:"NL Este", era:3.79,ops:.751,wpct:.556,rpg:4.8,w:49,l:39,streak:"G2",last10:"7-3"},
  NYM:{name:"New York Mets",       abbr:"NYM",clr:"#002D72",div:"NL Este",  era:3.88,ops:.741,wpct:.537,rpg:4.7,w:47,l:41,streak:"P1",last10:"6-4"},
  WSH:{name:"Washington Nationals",abbr:"WSH",clr:"#AB0003",div:"NL Este",  era:4.28,ops:.719,wpct:.444,rpg:4.3,w:39,l:49,streak:"G1",last10:"4-6"},
  MIA:{name:"Miami Marlins",       abbr:"MIA",clr:"#00A3E0",div:"NL Este",  era:4.15,ops:.708,wpct:.444,rpg:4.1,w:39,l:49,streak:"P2",last10:"4-6"},
  MIL:{name:"Milwaukee Brewers",   abbr:"MIL",clr:"#12284B",div:"NL Central",era:3.91,ops:.718,wpct:.519,rpg:4.4,w:46,l:43,streak:"G1",last10:"5-5"},
  CHC:{name:"Chicago Cubs",        abbr:"CHC",clr:"#0E3386",div:"NL Central",era:4.05,ops:.729,wpct:.500,rpg:4.5,w:44,l:44,streak:"P1",last10:"5-5"},
  STL:{name:"St. Louis Cardinals", abbr:"STL",clr:"#C41E3A",div:"NL Central",era:3.95,ops:.733,wpct:.519,rpg:4.5,w:46,l:43,streak:"G2",last10:"6-4"},
  PIT:{name:"Pittsburgh Pirates",  abbr:"PIT",clr:"#27251F",div:"NL Central",era:4.11,ops:.714,wpct:.463,rpg:4.2,w:41,l:48,streak:"P1",last10:"4-6"},
  CIN:{name:"Cincinnati Reds",     abbr:"CIN",clr:"#C6011F",div:"NL Central",era:4.19,ops:.733,wpct:.481,rpg:4.5,w:43,l:46,streak:"G1",last10:"5-5"},
  LAD:{name:"Los Angeles Dodgers", abbr:"LAD",clr:"#005A9C",div:"NL Oeste", era:3.45,ops:.772,wpct:.621,rpg:5.1,w:55,l:34,streak:"G6",last10:"8-2"},
  SF: {name:"San Francisco Giants",abbr:"SF", clr:"#FD5A1E",div:"NL Oeste", era:3.98,ops:.722,wpct:.481,rpg:4.3,w:43,l:46,streak:"P1",last10:"5-5"},
  SD: {name:"San Diego Padres",    abbr:"SD", clr:"#2F241D",div:"NL Oeste", era:3.74,ops:.744,wpct:.556,rpg:4.7,w:49,l:39,streak:"G3",last10:"7-3"},
  ARI:{name:"Arizona Diamondbacks",abbr:"ARI",clr:"#A71930",div:"NL Oeste", era:4.18,ops:.736,wpct:.500,rpg:4.5,w:44,l:44,streak:"P2",last10:"5-5"},
  COL:{name:"Colorado Rockies",    abbr:"COL",clr:"#33006F",div:"NL Oeste", era:4.89,ops:.748,wpct:.426,rpg:4.8,w:38,l:51,streak:"P3",last10:"3-7"},
};

// MLB ID → abbr map
const MLB_ID_MAP = {
  147:"NYY",111:"BOS",141:"TOR",139:"TB",110:"BAL",
  114:"CLE",142:"MIN",118:"KC",145:"CWS",116:"DET",
  117:"HOU",136:"SEA",140:"TEX",108:"LAA",133:"OAK",
  144:"ATL",143:"PHI",121:"NYM",120:"WSH",146:"MIA",
  158:"MIL",112:"CHC",138:"STL",134:"PIT",113:"CIN",
  119:"LAD",137:"SF",135:"SD",109:"ARI",115:"COL",
};

const DIVISIONS = ["AL Este","AL Central","AL Oeste","NL Este","NL Central","NL Oeste"];

// ─── FALLBACK GAMES ───────────────────────────────────────────────────────────
function buildFallbackGames() {
  const h = new Date().getHours();
  const SLATE = [
    {id:1001,away:"NYY",home:"BOS",venue:"Fenway Park",time:"1:10 PM ET",gameHour:13,awayP:"Gerrit Cole",awayPERA:2.89,homeP:"Brayan Bello",homePERA:3.54,wx:{temp:71,wind:"8 mph E",sky:"⛅",desc:"Partly Cloudy"},pf:1.08,sim:{away:3,home:2,inn:7,half:"T",outs:1,balls:2,strikes:1,awayH:7,homeH:5,bases:[true,false,false]}},
    {id:1002,away:"SF",home:"LAD",venue:"Dodger Stadium",time:"2:10 PM ET",gameHour:14,awayP:"Logan Webb",awayPERA:3.21,homeP:"Y. Yamamoto",homePERA:2.71,wx:{temp:78,wind:"5 mph W",sky:"☀️",desc:"Sunny"},pf:0.99,sim:{away:1,home:4,inn:4,half:"B",outs:2,balls:1,strikes:2,awayH:4,homeH:8,bases:[false,true,false]}},
    {id:1003,away:"ATL",home:"PHI",venue:"Citizens Bank Park",time:"4:05 PM ET",gameHour:16,awayP:"Spencer Strider",awayPERA:2.44,homeP:"Zack Wheeler",homePERA:2.91,wx:{temp:82,wind:"12 mph SW",sky:"☀️",desc:"Clear"},pf:1.06},
    {id:1004,away:"HOU",home:"TEX",venue:"Globe Life Field",time:"4:10 PM ET",gameHour:16,awayP:"Framber Valdez",awayPERA:2.97,homeP:"Nathan Eovaldi",homePERA:3.42,wx:{temp:91,wind:"7 mph S",sky:"🌡️",desc:"Hot"},pf:1.01},
    {id:1005,away:"MIL",home:"CHC",venue:"Wrigley Field",time:"7:08 PM ET",gameHour:19,awayP:"Freddy Peralta",awayPERA:3.18,homeP:"Justin Steele",homePERA:3.05,wx:{temp:74,wind:"15 mph OUT",sky:"💨",desc:"Windy"},pf:1.03},
    {id:1006,away:"SD",home:"NYM",venue:"Citi Field",time:"7:10 PM ET",gameHour:19,awayP:"Dylan Cease",awayPERA:3.37,homeP:"Kodai Senga",homePERA:2.88,wx:{temp:76,wind:"9 mph NE",sky:"🌤️",desc:"Clear"},pf:1.00},
    {id:1007,away:"CLE",home:"BAL",venue:"Oriole Park",time:"7:40 PM ET",gameHour:19,awayP:"Shane Bieber",awayPERA:3.47,homeP:"Corbin Burnes",homePERA:2.78,wx:{temp:79,wind:"6 mph E",sky:"☀️",desc:"Clear"},pf:1.01},
    {id:1008,away:"MIN",home:"SEA",venue:"T-Mobile Park",time:"10:10 PM ET",gameHour:22,awayP:"Pablo Lopez",awayPERA:3.14,homeP:"Luis Castillo",homePERA:3.08,wx:{temp:65,wind:"4 mph W",sky:"🌥️",desc:"Overcast"},pf:0.95},
  ];
  return SLATE.map(g => ({...g,
    isLive:  h >= g.gameHour && h < g.gameHour + 3 && !!g.sim,
    isFinal: h >= g.gameHour + 3 && !!g.sim,
    source:  "demo",
  }));
}

// ─── FETCH LIVE GAMES FROM MLB API ────────────────────────────────────────────
async function fetchLiveGames() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const data = await mlbFetch(
      `/schedule?sportId=1&date=${today}&hydrate=team,linescore,probablePitcher,venue,weather`
    );
    if (!data?.dates?.[0]?.games?.length) return null;

    const games = data.dates[0].games.map(g => {
      const home     = g.teams?.home;
      const away     = g.teams?.away;
      const ls       = g.linescore;
      const status   = g.status?.abstractGameState;
      const detailed = g.status?.detailedState;
      const gameDate = new Date(g.gameDate);

      const homeId   = home?.team?.id;
      const awayId   = away?.team?.id;
      const homeAbbr = MLB_ID_MAP[homeId] || Object.values(ALL_TEAMS).find(t => t.name === home?.team?.name)?.abbr;
      const awayAbbr = MLB_ID_MAP[awayId] || Object.values(ALL_TEAMS).find(t => t.name === away?.team?.name)?.abbr;

      if (!homeAbbr || !awayAbbr || !ALL_TEAMS[homeAbbr] || !ALL_TEAMS[awayAbbr]) return null;

      const isLive  = status === "Live";
      const isFinal = status === "Final" || detailed === "Final";

      const timeET = gameDate.toLocaleTimeString("en-US", {
        hour:"2-digit", minute:"2-digit", timeZone:"America/New_York"
      }) + " ET";

      // Build inning scores
      const innings = { away: Array(9).fill(null), home: Array(9).fill(null) };
      if (ls?.innings) {
        ls.innings.forEach((inn, i) => {
          if (i < 9) {
            innings.away[i] = inn.away?.runs ?? null;
            innings.home[i] = inn.home?.runs ?? null;
          }
        });
      }

      return {
        id:       g.gamePk,
        home:     homeAbbr,
        away:     awayAbbr,
        venue:    g.venue?.name || "TBD",
        time:     timeET,
        gameHour: gameDate.getHours(),
        homeP:    home?.probablePitcher?.fullName || "Por confirmar",
        awayP:    away?.probablePitcher?.fullName || "Por confirmar",
        homePERA: null,
        awayPERA: null,
        wx: g.weather ? {
          temp: g.weather.temp  || "—",
          wind: g.weather.wind  || "—",
          sky:  "🌤️",
          desc: g.weather.condition || "—",
        } : { temp:"—", wind:"—", sky:"🌤️", desc:"—" },
        pf:      1.0,
        isLive,
        isFinal,
        sim: (isLive || isFinal) ? {
          away:    away?.score  ?? ls?.teams?.away?.runs ?? 0,
          home:    home?.score  ?? ls?.teams?.home?.runs ?? 0,
          inn:     ls?.currentInning  ?? 1,
          half:    ls?.isTopInning ? "T" : "B",
          outs:    ls?.outs ?? 0,
          balls:   ls?.balls ?? 0,
          strikes: ls?.strikes ?? 0,
          awayH:   ls?.teams?.away?.hits ?? 0,
          homeH:   ls?.teams?.home?.hits ?? 0,
          bases:   [
            !!ls?.offense?.first,
            !!ls?.offense?.second,
            !!ls?.offense?.third,
          ],
          innings,
        } : null,
        source: "live",
      };
    }).filter(Boolean);

    return games.length > 0 ? games : null;
  } catch (e) {
    console.error("MLB API error:", e);
    return null;
  }
}

// ─── PREDICT ─────────────────────────────────────────────────────────────────
function predict(away, home, pf=1, wind="") {
  const H = ALL_TEAMS[home], A = ALL_TEAMS[away];
  if (!H || !A) return null;
  const hA = H.wpct * 1.04 * pf, aA = A.wpct * 0.96;
  let hW = (hA/(hA+aA))*100 + (A.era-H.era)*3;
  hW = Math.min(74, Math.max(31, hW));
  const hWr = Math.round(hW), aWr = 100-hWr;
  const wB  = wind.includes("OUT")?1.08:wind.includes("IN")?0.93:1;
  const proj = +((H.rpg+A.rpg)/2*pf*wB).toFixed(1);
  const line = Math.round(proj*2)/2;
  const hO = hWr>50 ? -Math.round((hWr/(100-hWr))*100) : Math.round(((100-hWr)/hWr)*100);
  const aO = aWr>50 ? -Math.round((aWr/(100-aWr))*100) : Math.round(((100-aWr)/aWr)*100);
  const impl = 110/(hO<0?Math.abs(hO)+100:100+hO)*100;
  const edge = +(hWr-impl).toFixed(1);
  const conf = Math.round(Math.min(89, 57+Math.abs(hWr-50)*0.55+(Math.abs(H.era-A.era)>.5?5:0)));
  const risk = conf>=75?"Bajo":conf>=62?"Medio":"Alto";
  const grade = conf>=78&&edge>4?"A":conf>=67&&edge>1.5?"B":conf>=56?"C":"D";
  return {hWr,aWr,hO,aO,edge,ev:+(edge*0.38).toFixed(1),conf,proj,line,
    overP:proj>line?57:43,underP:proj>line?43:57,
    rlCover:Math.round(hWr*0.73),grade,rec:proj>line?"OVER":"UNDER",risk};
}

const fO = n => n>=0?`+${n}`:`${n}`;
const GC = {A:"#10b981",B:"#6366f1",C:"#f59e0b",D:"#ef4444"};
const RISK_C = {Bajo:"#10b981",Medio:"#f59e0b",Alto:"#ef4444"};

// ─── PLANS ────────────────────────────────────────────────────────────────────
const PLANS = {
  starter:{name:"Starter",price:"$0",   period:"/siempre",color:"#6366f1",axeLimit:10,
    features:["Todos los partidos del día","Partidos en vivo","Diamante en tiempo real","Oportunidades básicas","30 equipos MLB","Análisis básico","Asistente Axe (10/día)","Notificaciones","Modo claro/oscuro"]},
  pro:    {name:"Pro",    price:"$4.99",period:"/mes",    color:"#8b5cf6",axeLimit:100,popular:true,
    features:["Todo del Starter","Sabermetría avanzada","Análisis detallado ML/RL/O-U","Modelos predictivos","Tendencias avanzadas","Axe (100/día)","Filtros avanzados","Reportes"]},
  elite:  {name:"Elite",  price:"$9.99",period:"/mes",    color:"#10b981",axeLimit:Infinity,
    features:["Todo del Pro","Acceso anticipado","Dashboard configurable","Estadísticas exclusivas","Alertas inteligentes","Axe ilimitado","Soporte prioritario"]},
};

// ─── DESIGN ───────────────────────────────────────────────────────────────────
const DARK  = {bg0:"#0a0e1a",bg1:"#111827",bg2:"#1a2234",glass:"rgba(255,255,255,0.04)",glassBorder:"rgba(255,255,255,0.08)",text:"#f9fafb",sub:"#9ca3af",muted:"#4b5563",indigo:"#6366f1",iL:"#818cf8",green:"#10b981",amber:"#f59e0b",red:"#ef4444",violet:"#8b5cf6"};
const LIGHT = {bg0:"#f0f4f8",bg1:"#ffffff",bg2:"#e8edf5",glass:"rgba(0,0,0,0.03)",glassBorder:"rgba(0,0,0,0.1)", text:"#111827",sub:"#4b5563", muted:"#9ca3af",indigo:"#4f46e5",iL:"#6366f1", green:"#059669",amber:"#d97706",red:"#dc2626",violet:"#7c3aed"};

// ─── SUPABASE AUTH ────────────────────────────────────────────────────────────
const AUTH = {
  user: null, token: null,
  getKey() { return getEnv("VITE_SUPABASE_KEY") || SUPA_KEY; },
  async signUp(email, password) {
    try {
      const r = await fetch(`${SUPA_URL}/auth/v1/signup`, {
        method:"POST", headers:{"apikey":this.getKey(),"Content-Type":"application/json"},
        body: JSON.stringify({email,password})
      });
      const d = await r.json();
      if(d.access_token){ this._save(d); return {ok:true,user:d.user}; }
      if(d.msg?.includes("already")) return {ok:false,error:"Este email ya está registrado. Inicia sesión."};
      return {ok:false,error:"Error al crear cuenta. Intenta de nuevo."};
    } catch { return {ok:false,error:"Sin conexión. Verifica tu internet."}; }
  },
  async signIn(email, password) {
    try {
      const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
        method:"POST", headers:{"apikey":this.getKey(),"Content-Type":"application/json"},
        body: JSON.stringify({email,password})
      });
      const d = await r.json();
      if(d.access_token){ this._save(d); return {ok:true,user:d.user}; }
      return {ok:false,error:"Email o contraseña incorrectos."};
    } catch { return {ok:false,error:"Sin conexión. Verifica tu internet."}; }
  },
  async sendOTP(phone) {
    try {
      const r = await fetch(`${SUPA_URL}/auth/v1/otp`, {
        method:"POST", headers:{"apikey":this.getKey(),"Content-Type":"application/json"},
        body: JSON.stringify({phone})
      });
      const d = await r.json();
      return d.error ? {ok:false,error:"No se pudo enviar el SMS. Verifica el número."} : {ok:true};
    } catch { return {ok:false,error:"Sin conexión."}; }
  },
  async verifyOTP(phone, token) {
    try {
      const r = await fetch(`${SUPA_URL}/auth/v1/verify`, {
        method:"POST", headers:{"apikey":this.getKey(),"Content-Type":"application/json"},
        body: JSON.stringify({phone,token,type:"sms"})
      });
      const d = await r.json();
      if(d.access_token){ this._save(d); return {ok:true,user:d.user}; }
      return {ok:false,error:"Código incorrecto o expirado."};
    } catch { return {ok:false,error:"Sin conexión."}; }
  },
  _save(d) {
    this.token = d.access_token; this.user = d.user;
    try { localStorage.setItem("mlb_tok", d.access_token); localStorage.setItem("mlb_usr", JSON.stringify(d.user)); } catch {}
  },
  signOut() {
    this.token=null; this.user=null;
    try { localStorage.removeItem("mlb_tok"); localStorage.removeItem("mlb_usr"); } catch {}
  },
  restore() {
    try {
      const tok = localStorage.getItem("mlb_tok");
      const usr = localStorage.getItem("mlb_usr");
      if(tok&&usr){ this.token=tok; this.user=JSON.parse(usr); return true; }
    } catch {}
    return false;
  },
  googleUrl() { return `${SUPA_URL}/auth/v1/authorize?provider=google&redirect_to=${typeof window!=="undefined"?window.location.origin:""}`; },
};

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Ring({grade,conf,size=40,dark}){
  const D=dark?DARK:LIGHT,clr=GC[grade]||D.iL,r=size/2-3,c=2*Math.PI*r,d=(conf/100)*c;
  return <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg viewBox={`0 0 ${size} ${size}`} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={clr} strokeWidth="2.5"
        strokeDasharray={`${d} ${c}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{filter:`drop-shadow(0 0 4px ${clr}66)`}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.32,fontWeight:900,color:clr}}>{grade}</div>
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
  return <div style={{fontSize:9,fontWeight:700,color:D.iL,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:9,display:"flex",alignItems:"center",gap:7}}>
    <div style={{height:1,width:12,background:`linear-gradient(90deg,${D.indigo},transparent)`}}/>
    {icon&&<span style={{fontSize:11}}>{icon}</span>}{children}
    <div style={{height:1,flex:1,background:`linear-gradient(90deg,${D.iL}33,transparent)`}}/>
  </div>;
}

function LiveDot({color="#10b981"}){
  return <div style={{width:7,height:7,borderRadius:"50%",background:color,boxShadow:`0 0 7px ${color}`,animation:"v15Pulse 1.5s ease infinite",flexShrink:0}}/>;
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({dark,onAuth}){
  const D=dark?DARK:LIGHT;
  const [mode,setMode]=useState("welcome");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState("");
  const [step,setStep]=useState("phone");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [info,setInfo]=useState("");

  const reset=()=>{setError("");setInfo("");};

  const doEmail=async(signup)=>{
    if(!email.trim()||!pass.trim()){setError("Completa todos los campos.");return;}
    if(pass.length<6){setError("La contraseña debe tener al menos 6 caracteres.");return;}
    setLoading(true);reset();
    const r=signup?await AUTH.signUp(email,pass):await AUTH.signIn(email,pass);
    setLoading(false);
    if(r.ok) onAuth(r.user);
    else if(signup&&r.error?.includes("registrado")){setError(r.error);}
    else if(signup){setInfo("¡Cuenta creada! Revisa tu email para confirmar y luego inicia sesión.");}
    else setError(r.error||"Error al iniciar sesión.");
  };

  const sendSMS=async()=>{
    if(!phone.trim()){setError("Ingresa tu número con código de país. Ej: +18091234567");return;}
    setLoading(true);reset();
    const r=await AUTH.sendOTP(phone);
    setLoading(false);
    if(r.ok){setStep("otp");setInfo("Código enviado por SMS.");}
    else setError(r.error);
  };

  const verifySMS=async()=>{
    if(otp.length<4){setError("Ingresa el código completo.");return;}
    setLoading(true);reset();
    const r=await AUTH.verifyOTP(phone,otp);
    setLoading(false);
    if(r.ok) onAuth(r.user);
    else setError(r.error);
  };

  const bg={minHeight:"100vh",background:D.bg0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:"'Inter',system-ui,sans-serif"};
  const inp={width:"100%",padding:"13px 14px",borderRadius:12,border:`1px solid ${D.glassBorder}`,background:D.glass,color:D.text,fontSize:14,outline:"none",marginBottom:10};
  const btn=(c)=>({width:"100%",padding:"14px",borderRadius:12,border:"none",cursor:"pointer",background:c||`linear-gradient(135deg,${D.indigo},${D.violet})`,color:"white",fontWeight:700,fontSize:14,marginBottom:8,opacity:loading?0.7:1});
  const ErrBox=()=>error?<div style={{fontSize:11,color:D.red,padding:"9px 12px",background:`${D.red}12`,border:`1px solid ${D.red}28`,borderRadius:9,marginBottom:10,textAlign:"center"}}>{error}</div>:null;
  const InfoBox=()=>info?<div style={{fontSize:11,color:D.green,padding:"9px 12px",background:`${D.green}12`,border:`1px solid ${D.green}28`,borderRadius:9,marginBottom:10,textAlign:"center"}}>{info}</div>:null;
  const Back=({to})=><button onClick={()=>{setMode(to);reset();}} style={{background:"transparent",border:"none",color:D.muted,fontSize:12,cursor:"pointer",marginBottom:20,display:"flex",alignItems:"center",gap:4}}>← Volver</button>;
  const Logo=()=><div style={{textAlign:"center",marginBottom:28}}><div style={{fontSize:40,marginBottom:8}}>⚾</div><div style={{fontSize:26,fontWeight:900,color:D.text,marginBottom:4}}>MLB<span style={{color:D.indigo}}>Edge</span></div><div style={{fontSize:11,color:D.muted}}>Análisis profesional de béisbol MLB</div></div>;
  const Spin=()=><span style={{animation:"v15Spin .7s linear infinite",display:"inline-block",marginRight:6}}>◌</span>;

  if(mode==="welcome") return(
    <div style={bg}>
      {dark&&<div style={{position:"fixed",inset:0,pointerEvents:"none"}}>
        {[{c:"rgba(99,102,241,0.1)",l:"50%",t:"20%",s:400},{c:"rgba(16,185,129,0.06)",l:"15%",t:"65%",s:300}].map((g,i)=>(
          <div key={i} style={{position:"absolute",width:g.s,height:g.s,borderRadius:"50%",background:`radial-gradient(circle,${g.c},transparent 70%)`,left:`calc(${g.l} - ${g.s/2}px)`,top:`calc(${g.t} - ${g.s/2}px)`,filter:"blur(40px)"}}/>
        ))}
      </div>}
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:380}}>
        <Logo/>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
          <a href={AUTH.googleUrl()} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px",borderRadius:14,border:`1px solid ${D.glassBorder}`,background:D.bg1,textDecoration:"none",boxShadow:dark?"0 4px 20px rgba(0,0,0,0.3)":"0 2px 10px rgba(0,0,0,0.08)"}}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span style={{fontSize:14,fontWeight:600,color:D.text}}>Continuar con Google</span>
          </a>
          {[{icon:"📧",label:"Continuar con Email",to:"email"},{icon:"📱",label:"Continuar con Teléfono",to:"phone"}].map(({icon,label,to})=>(
            <button key={to} onClick={()=>{setMode(to);reset();}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px",borderRadius:14,border:`1px solid ${D.glassBorder}`,background:D.bg1,cursor:"pointer",boxShadow:dark?"0 4px 20px rgba(0,0,0,0.3)":"0 2px 10px rgba(0,0,0,0.08)"}}>
              <span style={{fontSize:20}}>{icon}</span>
              <span style={{fontSize:14,fontWeight:600,color:D.text}}>{label}</span>
            </button>
          ))}
          <button onClick={()=>onAuth({id:"guest",email:"guest",isGuest:true})} style={{padding:"11px",borderRadius:11,border:`1px solid ${D.glassBorder}`,background:"transparent",cursor:"pointer",color:D.muted,fontSize:12,fontWeight:500}}>
            Explorar sin cuenta →
          </button>
        </div>
        <div style={{textAlign:"center",fontSize:10,color:D.muted,lineHeight:1.6}}>
          Al registrarte aceptas nuestros Términos de uso. Solo para análisis informativo · +21
        </div>
      </div>
    </div>
  );

  if(mode==="email"||mode==="signup") return(
    <div style={bg}><div style={{width:"100%",maxWidth:380}}>
      <Back to="welcome"/>
      <Logo/>
      <input type="email" placeholder="Email" value={email} onChange={e=>{setEmail(e.target.value);reset();}} style={inp}/>
      <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={pass} onChange={e=>{setPass(e.target.value);reset();}} style={inp}/>
      <ErrBox/><InfoBox/>
      <button onClick={()=>doEmail(false)} disabled={loading} style={btn()}>
        {loading?<><Spin/>Iniciando sesión...</>:"Iniciar sesión →"}
      </button>
      <button onClick={()=>doEmail(true)} disabled={loading} style={btn(`linear-gradient(135deg,${D.green},#059669)`)}>
        {loading?<><Spin/>Creando cuenta...</>:"Crear cuenta gratis →"}
      </button>
    </div></div>
  );

  if(mode==="phone") return(
    <div style={bg}><div style={{width:"100%",maxWidth:380}}>
      <Back to="welcome"/>
      <Logo/>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:800,color:D.text,marginBottom:4}}>
          {step==="phone"?"Tu número de teléfono":"Ingresa el código SMS"}
        </div>
        <div style={{fontSize:11,color:D.muted}}>
          {step==="phone"?"Incluye el código de país. Ej: +18091234567":"Revisa tus mensajes de texto"}
        </div>
      </div>
      {step==="phone"&&<>
        <input type="tel" placeholder="+1 (809) 000-0000" value={phone} onChange={e=>{setPhone(e.target.value);reset();}} style={inp}/>
        <ErrBox/><InfoBox/>
        <button onClick={sendSMS} disabled={loading} style={btn()}>
          {loading?<><Spin/>Enviando SMS...</>:"Enviar código →"}
        </button>
      </>}
      {step==="otp"&&<>
        <div style={{fontSize:11,color:D.muted,textAlign:"center",marginBottom:12}}>Código enviado a {phone}</div>
        <input type="number" placeholder="000000" value={otp} onChange={e=>setOtp(e.target.value)} style={{...inp,textAlign:"center",fontSize:22,letterSpacing:"0.3em"}}/>
        <ErrBox/><InfoBox/>
        <button onClick={verifySMS} disabled={loading} style={btn()}>
          {loading?<><Spin/>Verificando...</>:"Verificar código →"}
        </button>
        <button onClick={()=>{setStep("phone");reset();}} style={{...btn("transparent"),color:D.muted,border:`1px solid ${D.glassBorder}`}}>
          ← Cambiar número
        </button>
      </>}
    </div></div>
  );
  return null;
}

// ─── AXE CHAT ─────────────────────────────────────────────────────────────────
async function askAxe(q,history){
  const sys=`Eres Axe, el asistente oficial de MLBEdge. Experto en béisbol MLB, estadísticas y análisis.
NUNCA menciones: Claude, Anthropic, OpenAI, ChatGPT, Gemini, IA, inteligencia artificial.
Si preguntan quién te creó: "Fui desarrollado por el equipo de MLBEdge."
Responde en español. Máximo 3 oraciones. Claro y profesional.
Temas: béisbol, reglas, estadísticas, ERA/xERA/FIP/wRC+/wOBA/OPS/BABIP, Moneyline, Runline, Over/Under, planes MLBEdge.`;
  try {
    const msgs=history.slice(-6).map(m=>({role:m.from==="user"?"user":"assistant",content:m.text}));
    msgs.push({role:"user",content:q});
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:300,system:sys,messages:msgs})});
    const d=await r.json();
    return d.content?.map(b=>b.text||"").join("")||"Intenta de nuevo.";
  } catch { return "No pude procesar tu consulta. Intenta de nuevo."; }
}

// ─── GAME CARD ────────────────────────────────────────────────────────────────
const GameCard = memo(function({game,idx,onSelect,dark}){
  const D=dark?DARK:LIGHT;
  const H=ALL_TEAMS[game.home],A=ALL_TEAMS[game.away];
  if(!H||!A) return null;
  const pred=useRef(predict(game.away,game.home,game.pf||1,game.wx?.wind||"")).current;
  if(!pred) return null;
  const clr=pred.edge>5?D.green:pred.edge>2?D.indigo:pred.edge>0?D.amber:D.muted;

  return(
    <div onClick={()=>onSelect(game)} style={{borderRadius:18,overflow:"hidden",animation:`v15Up 0.3s ${idx*0.04}s both ease`,border:`1px solid ${game.isLive?"rgba(16,185,129,0.3)":D.glassBorder}`,background:D.bg1,boxShadow:dark?(game.isLive?"0 0 0 1px rgba(16,185,129,0.1),0 8px 28px rgba(0,0,0,0.5)":"0 4px 16px rgba(0,0,0,0.3)"):"0 2px 10px rgba(0,0,0,0.07)",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
      <div style={{height:3,background:`linear-gradient(90deg,${A.clr},${H.clr})`}}/>
      <div style={{padding:"12px 13px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {game.isLive?<span style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:700,color:D.green}}><LiveDot/> EN VIVO {game.sim?.half==="T"?"▲":"▼"}{game.sim?.inn}</span>
              :game.isFinal?<span style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:600,color:D.muted}}>FINAL</span>
              :<span style={{background:`${D.indigo}14`,border:`1px solid ${D.iL}33`,borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:600,color:D.iL}}>{game.time}</span>}
            <span style={{fontSize:9,color:D.muted}}>{game.venue?.split(" ").slice(0,2).join(" ")}</span>
            {game.source==="live"&&<span style={{fontSize:7,color:D.green,background:`${D.green}14`,border:`1px solid ${D.green}28`,borderRadius:4,padding:"1px 5px",fontWeight:700}}>⚡ MLB LIVE</span>}
          </div>
          <Ring grade={pred.grade} conf={pred.conf} size={36} dark={dark}/>
        </div>

        {(game.isLive||game.isFinal)&&game.sim?(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9,padding:"9px 14px",background:D.glass,borderRadius:12,border:`1px solid ${D.glassBorder}`}}>
            {[{t:A,sc:game.sim.away,h:game.sim.awayH},{t:H,sc:game.sim.home,h:game.sim.homeH}].map((x,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:x.t.clr,marginBottom:2}}>{x.t.abbr}</div>
                <div style={{fontSize:30,fontWeight:900,color:D.text,lineHeight:1}}>{x.sc}</div>
                <div style={{fontSize:8,color:D.muted,marginTop:1}}>{x.h}H</div>
              </div>
            ))}
            {game.isLive&&game.sim.bases&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{fontSize:8,color:D.muted,marginBottom:2}}>Bases</div>
                {[{label:"2B",i:1},{label:"3B",i:2,},{label:"1B",i:0}].map(({label,i})=>(
                  <div key={i} style={{width:10,height:10,background:game.sim.bases[i]?"#f59e0b":"rgba(255,255,255,0.1)",border:`1px solid ${game.sim.bases[i]?"#f59e0b":"rgba(255,255,255,0.2)"}`,transform:"rotate(45deg)"}}/>
                ))}
              </div>
            )}
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",marginBottom:9}}>
            {[{t:A,label:"Visitante"},null,{t:H,label:"Local"}].map((x,i)=>{
              if(!x) return <div key="at" style={{padding:"0 8px",color:D.muted,fontWeight:700}}>@</div>;
              return <div key={i} style={{flex:1,textAlign:"center"}}>
                <div style={{width:42,height:42,borderRadius:11,margin:"0 auto 6px",background:`linear-gradient(135deg,${x.t.clr}22,${x.t.clr}08)`,border:`1.5px solid ${x.t.clr}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:x.t.clr}}>{x.t.abbr}</div>
                <div style={{fontSize:11,fontWeight:700,color:D.text}}>{x.t.name.split(" ").pop()}</div>
                <div style={{fontSize:9,color:D.muted,marginTop:1}}>{x.label}</div>
              </div>;
            })}
          </div>
        )}

        {!game.isFinal&&<div style={{display:"flex",gap:4,marginBottom:8}}>
          <Chip label="Home ML" value={fO(pred.hO)} color={H.clr} dark={dark}/>
          <Chip label="Away ML" value={fO(pred.aO)} color={A.clr} dark={dark}/>
          <Chip label={`${pred.rec} ${pred.line}`} value={`${pred.rec==="OVER"?pred.overP:pred.underP}%`} color={pred.rec==="OVER"?D.green:D.indigo} dark={dark}/>
          <Chip label="Conf" value={`${pred.conf}%`} color={D.iL} dark={dark}/>
        </div>}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:9,color:D.muted}}>⚾ {game.awayP?.split(" ").pop()||"TBD"} vs {game.homeP?.split(" ").pop()||"TBD"} · {game.wx?.sky} {game.wx?.temp}°F</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:9,fontWeight:700,color:clr,background:`${clr}14`,border:`1px solid ${clr}28`,borderRadius:6,padding:"2px 7px"}}>{pred.edge>0?"+":""}{pred.edge}%</span>
            <span style={{fontSize:9,color:D.iL,fontWeight:600}}>Ver →</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────────
function OppsScreen({games,onSelect,dark,userPlan,onUpgrade}){
  const D=dark?DARK:LIGHT;
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("conf");
  const isPro=userPlan==="pro"||userPlan==="elite";

  const opps=games.filter(g=>!g.isFinal).map(g=>{
    const pred=predict(g.away,g.home,g.pf||1,g.wx?.wind||"");
    if(!pred) return null;
    const H=ALL_TEAMS[g.home],A=ALL_TEAMS[g.away];
    return{...g,pred,
      mlRec:{abbr:pred.hWr>pred.aWr?g.home:g.away,prob:Math.max(pred.hWr,pred.aWr),line:pred.hWr>pred.aWr?fO(pred.hO):fO(pred.aO)},
      rlRec:{abbr:pred.hWr>pred.aWr?g.home:g.away,cover:pred.rlCover},
      ouRec:{rec:pred.rec,line:pred.line,proj:pred.proj,prob:pred.rec==="OVER"?pred.overP:pred.underP},
      reason:`ERA combinado ${(((ALL_TEAMS[g.home]?.era||4)+(ALL_TEAMS[g.away]?.era||4))/2).toFixed(2)} · Proyección ${pred.proj}R vs línea ${pred.line} · ${g.wx?.wind?.includes("OUT")?"Viento saliendo favorece OVER.":"Análisis basado en pitcheo y ofensiva."}`,
    };
  }).filter(Boolean).filter(g=>filter==="all"?true:filter==="over"?g.pred.rec==="OVER":filter==="under"?g.pred.rec==="UNDER":filter==="live"?g.isLive:true)
    .sort((a,b)=>sort==="conf"?b.pred.conf-a.pred.conf:sort==="edge"?b.pred.edge-a.pred.edge:a.gameHour-b.gameHour);

  return(
    <div style={{padding:"0"}}>
      <div style={{padding:"12px 13px 0"}}>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:20,fontWeight:900,color:D.text,letterSpacing:"-0.03em",marginBottom:2}}>Oportunidades del Día</div>
          <div style={{fontSize:10,color:D.muted}}>{opps.length} partidos · {new Date().toLocaleDateString("es",{weekday:"long",month:"long",day:"numeric"})}</div>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:8,overflowX:"auto",scrollbarWidth:"none"}}>
          {[["all","Todos"],["over","Over"],["under","Under"],["live","En Vivo"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{flexShrink:0,padding:"6px 12px",borderRadius:8,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",background:filter===v?`linear-gradient(135deg,${D.indigo}33,${D.violet}22)`:D.glass,color:filter===v?D.iL:D.muted,outline:filter===v?`1px solid ${D.iL}33`:`1px solid ${D.glassBorder}`}}>{l}</button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:4}}>
            {[["conf","Confianza"],["edge","Ventaja"],["time","Hora"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSort(v)} style={{flexShrink:0,padding:"6px 9px",borderRadius:8,border:"none",fontSize:9,fontWeight:600,cursor:"pointer",background:sort===v?`${D.amber}22`:D.glass,color:sort===v?D.amber:D.muted,outline:sort===v?`1px solid ${D.amber}44`:`1px solid ${D.glassBorder}`}}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{padding:"0 13px",display:"flex",flexDirection:"column",gap:10}}>
        {opps.map((g,i)=>{
          const H=ALL_TEAMS[g.home],A=ALL_TEAMS[g.away];
          const locked=i>=3&&!isPro;
          return(
            <div key={g.id} style={{borderRadius:18,overflow:"hidden",position:"relative",border:`1px solid ${g.isLive?"rgba(16,185,129,0.3)":D.glassBorder}`,background:D.bg1,animation:`v15Up 0.3s ${i*0.04}s both ease`,boxShadow:dark?"0 4px 16px rgba(0,0,0,0.3)":"0 2px 10px rgba(0,0,0,0.06)"}}>
              <div style={{height:3,background:`linear-gradient(90deg,${A?.clr||D.muted},${H?.clr||D.indigo})`}}/>
              <div style={{padding:"12px 13px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {g.isLive?<span style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:700,color:D.green}}><LiveDot/> EN VIVO</span>
                      :<span style={{background:`${D.indigo}14`,border:`1px solid ${D.iL}33`,borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:600,color:D.iL}}>{g.time}</span>}
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:8,fontWeight:700,color:RISK_C[g.pred.risk],background:`${RISK_C[g.pred.risk]}14`,border:`1px solid ${RISK_C[g.pred.risk]}28`,borderRadius:6,padding:"2px 7px"}}>Riesgo {g.pred.risk}</span>
                    <Ring grade={g.pred.grade} conf={g.pred.conf} size={34} dark={dark}/>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",marginBottom:9}}>
                  {[{t:A,label:"Visitante"},null,{t:H,label:"Local"}].map((x,idx)=>{
                    if(!x) return <div key="at" style={{padding:"0 8px",color:D.muted,fontWeight:700}}>@</div>;
                    return <div key={idx} style={{flex:1,textAlign:"center"}}>
                      <div style={{width:38,height:38,borderRadius:10,margin:"0 auto 5px",background:`${x.t?.clr||D.muted}22`,border:`1.5px solid ${x.t?.clr||D.muted}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:x.t?.clr||D.muted}}>{x.t?.abbr}</div>
                      <div style={{fontSize:10,fontWeight:700,color:D.text}}>{x.t?.name.split(" ").pop()}</div>
                    </div>;
                  })}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:9}}>
                  {[
                    {label:"💵 Moneyline",color:D.indigo,main:g.mlRec.abbr,val:`${g.mlRec.prob}%`,sub:g.mlRec.line},
                    {label:"📏 Runline",color:D.violet,main:`${g.rlRec.abbr} −1.5`,val:`${g.rlRec.cover}%`,sub:"cobertura"},
                    {label:"⚡ Over/Under",color:g.ouRec.rec==="OVER"?D.green:D.iL,main:g.ouRec.rec,val:`${g.ouRec.prob}%`,sub:`Línea ${g.ouRec.line}`},
                  ].map(({label,color,main,val,sub})=>(
                    <div key={label} style={{background:`${color}0a`,border:`1px solid ${color}22`,borderRadius:11,padding:"9px 7px",textAlign:"center"}}>
                      <div style={{fontSize:7,color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{label}</div>
                      <div style={{fontSize:11,fontWeight:800,color:D.text,marginBottom:2}}>{main}</div>
                      <div style={{fontSize:13,fontWeight:900,color,marginBottom:2}}>{val}</div>
                      <div style={{fontSize:8,color:D.muted}}>{sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"7px 10px",background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:9,marginBottom:8}}>
                  <div style={{fontSize:8,color:D.muted,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>📊 Análisis</div>
                  <div style={{fontSize:10,color:D.sub,lineHeight:1.5}}>{g.reason}</div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:10}}>
                    <div><div style={{fontSize:12,fontWeight:800,color:D.iL}}>{g.pred.conf}%</div><div style={{fontSize:7,color:D.muted,textTransform:"uppercase"}}>Conf.</div></div>
                    <div><div style={{fontSize:12,fontWeight:800,color:D.green}}>+{g.pred.edge}%</div><div style={{fontSize:7,color:D.muted,textTransform:"uppercase"}}>Ventaja</div></div>
                  </div>
                  <button onClick={()=>onSelect(g)} style={{padding:"7px 13px",borderRadius:9,border:`1px solid ${D.iL}33`,background:`${D.indigo}14`,color:D.iL,fontSize:10,fontWeight:700,cursor:"pointer"}}>Análisis →</button>
                </div>
              </div>
              {locked&&<div style={{position:"absolute",inset:0,background:dark?"rgba(10,14,26,0.88)":"rgba(240,244,248,0.88)",backdropFilter:"blur(3px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                <div style={{fontSize:22}}>🔒</div>
                <div style={{fontSize:12,fontWeight:700,color:D.text}}>Disponible en Plan Pro</div>
                <button onClick={onUpgrade} style={{padding:"8px 16px",borderRadius:9,border:"none",background:`linear-gradient(135deg,${D.violet},${D.indigo})`,color:"white",fontWeight:700,fontSize:11,cursor:"pointer"}}>Ver Planes →</button>
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── STATS SCREEN ─────────────────────────────────────────────────────────────
function StatsScreen({dark}){
  const D=dark?DARK:LIGHT;
  const [selDiv,setSelDiv]=useState(null);
  const [selTeam,setSelTeam]=useState(null);

  if(selTeam){
    const t=ALL_TEAMS[selTeam];
    const wrc=Math.round(95+(t.ops-.720)*400);
    return(
      <div>
        <div style={{position:"sticky",top:0,zIndex:30,background:dark?"rgba(10,14,26,0.97)":"rgba(240,244,248,0.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${D.glassBorder}`,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setSelTeam(null)} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:9,padding:"6px 11px",color:D.sub,fontSize:12,fontWeight:600,cursor:"pointer"}}>←</button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:32,height:32,borderRadius:9,background:`${t.clr}22`,border:`1px solid ${t.clr}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:t.clr}}>{t.abbr}</div>
              <div><div style={{fontSize:13,fontWeight:800,color:D.text}}>{t.name}</div><div style={{fontSize:9,color:D.muted}}>{t.div}</div></div>
            </div>
          </div>
        </div>
        <div style={{padding:"12px 13px 90px"}}>
          <div style={{background:`radial-gradient(circle at 20% 50%,${t.clr}18,transparent)`,border:`1px solid ${t.clr}28`,borderRadius:16,padding:"14px",marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
              {[{l:"G",v:t.w,c:D.green},{l:"P",v:t.l,c:D.red},{l:"PCG",v:`.${(t.wpct*1000).toFixed(0)}`,c:t.wpct>=.550?D.green:D.iL},{l:"Racha",v:t.streak,c:t.streak.startsWith("G")?D.green:D.red}].map(({l,v,c})=>(
                <div key={l} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
                  <div style={{fontSize:7,color:D.muted,textTransform:"uppercase",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <SLabel icon="⚾" dark={dark}>Pitcheo</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:12}}>
            {[{l:"ERA",v:t.era,c:t.era<3.7?D.green:t.era<4.2?D.iL:D.muted},{l:"R/J",v:t.rpg,c:D.sub},{l:"Racha",v:t.last10,c:D.sub}].map(({l,v,c})=>(
              <div key={l} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:900,color:c}}>{v}</div>
                <div style={{fontSize:7,color:D.muted,textTransform:"uppercase",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
          <SLabel icon="🏏" dark={dark}>Ofensiva</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {[{l:"OPS",v:`.${(t.ops*1000).toFixed(0)}`,c:t.ops>=.760?D.green:t.ops>=.730?D.iL:D.muted},{l:"wRC+",v:wrc,c:wrc>=115?D.green:wrc>=100?D.iL:D.muted},{l:"Últ. 10",v:t.last10,c:parseInt(t.last10)>=7?D.green:parseInt(t.last10)<=3?D.red:D.sub}].map(({l,v,c})=>(
              <div key={l} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:900,color:c}}>{v}</div>
                <div style={{fontSize:7,color:D.muted,textTransform:"uppercase",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:"12px 13px 0"}}>
      <div style={{fontSize:18,fontWeight:900,color:D.text,marginBottom:3,letterSpacing:"-0.03em"}}>Estadísticas MLB</div>
      <div style={{fontSize:10,color:D.muted,marginBottom:12}}>30 equipos · Temporada 2026</div>
      <div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",marginBottom:12,paddingBottom:2}}>
        <button onClick={()=>setSelDiv(null)} style={{flexShrink:0,padding:"6px 11px",borderRadius:9,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",background:!selDiv?`linear-gradient(135deg,${D.indigo}33,${D.violet}22)`:D.glass,color:!selDiv?D.iL:D.muted,outline:!selDiv?`1px solid ${D.iL}33`:`1px solid ${D.glassBorder}`}}>Todas</button>
        {DIVISIONS.map(div=>(
          <button key={div} onClick={()=>setSelDiv(div)} style={{flexShrink:0,padding:"6px 11px",borderRadius:9,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",background:selDiv===div?`linear-gradient(135deg,${D.indigo}33,${D.violet}22)`:D.glass,color:selDiv===div?D.iL:D.muted,outline:selDiv===div?`1px solid ${D.iL}33`:`1px solid ${D.glassBorder}`}}>{div}</button>
        ))}
      </div>
      {(selDiv?[selDiv]:DIVISIONS).map(div=>{
        const teams=Object.values(ALL_TEAMS).filter(t=>t.div===div).sort((a,b)=>b.wpct-a.wpct);
        return(
          <div key={div} style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:D.iL,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
              <div style={{height:1,width:10,background:`linear-gradient(90deg,${D.indigo},transparent)`}}/>{div}
            </div>
            <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${D.glassBorder}`}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:D.bg2}}>
                  {["Equipo","G","P","PCG","ERA","OPS"].map((h,i)=><th key={i} style={{padding:"7px 7px",textAlign:i===0?"left":"center",fontSize:8,color:D.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {teams.map((t,i)=>(
                    <tr key={t.abbr} onClick={()=>setSelTeam(t.abbr)} style={{background:i%2===0?D.glass:"transparent",borderTop:`1px solid ${D.glassBorder}`,cursor:"pointer"}}>
                      <td style={{padding:"9px 7px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:"50%",background:t.clr,flexShrink:0}}/><span style={{fontSize:11,fontWeight:700,color:D.text}}>{t.abbr}</span>{i===0&&<span style={{fontSize:7,color:D.green,background:`${D.green}14`,border:`1px solid ${D.green}28`,borderRadius:3,padding:"1px 3px",fontWeight:700}}>1°</span>}</div></td>
                      <td style={{textAlign:"center",fontSize:11,fontWeight:700,color:D.text,padding:"9px 5px"}}>{t.w}</td>
                      <td style={{textAlign:"center",fontSize:11,fontWeight:600,color:D.sub,padding:"9px 5px"}}>{t.l}</td>
                      <td style={{textAlign:"center",padding:"9px 5px"}}><span style={{fontSize:11,fontWeight:800,color:t.wpct>=.570?D.green:t.wpct>=.500?D.iL:D.muted}}>.{(t.wpct*1000).toFixed(0)}</span></td>
                      <td style={{textAlign:"center",padding:"9px 5px"}}><span style={{fontSize:11,fontWeight:700,color:t.era<3.7?D.green:t.era<4.2?D.iL:D.muted}}>{t.era}</span></td>
                      <td style={{textAlign:"center",padding:"9px 5px"}}><span style={{fontSize:11,fontWeight:700,color:t.ops>=.760?D.green:t.ops>=.730?D.iL:D.muted}}>.{(t.ops*1000).toFixed(0)}</span></td>
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

// ─── AXE CHAT UI ──────────────────────────────────────────────────────────────
function AxeChat({dark,onClose,userPlan}){
  const D=dark?DARK:LIGHT;
  const limit=PLANS[userPlan]?.axeLimit||10;
  const [msgs,setMsgs]=useState([{id:1,from:"agent",text:"¡Hola! Soy Axe, tu asistente de MLBEdge. Puedo ayudarte con béisbol, estadísticas, Moneyline, Runline, Over/Under y más. ¿En qué te ayudo?",time:"Ahora"}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [queries,setQ]=useState(0);
  const endRef=useRef(null);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs,typing]);
  const atLimit=queries>=limit;
  const send=async(text=input)=>{
    if(!text.trim()||atLimit) return;
    const um={id:Date.now(),from:"user",text,time:"Ahora"};
    setMsgs(m=>[...m,um]); setInput(""); setTyping(true); setQ(q=>q+1);
    const r=await askAxe(text,msgs);
    setMsgs(m=>[...m,{id:Date.now()+1,from:"agent",text:r,time:"Ahora"}]);
    setTyping(false);
  };
  const QUICK=["¿Qué es el Moneyline?","¿Cómo funciona el Over/Under?","¿Qué es el wRC+?","¿Qué incluye el Plan Pro?"];
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:480,height:"78vh",background:dark?"rgba(10,14,26,0.99)":"rgba(255,255,255,0.99)",borderRadius:"22px 22px 0 0",border:`1px solid ${D.glassBorder}`,borderBottom:"none",display:"flex",flexDirection:"column",animation:"v15SlideUp 0.3s ease"}}>
        <div style={{width:36,height:4,borderRadius:99,background:"rgba(255,255,255,0.15)",margin:"12px auto 0"}}/>
        <div style={{padding:"12px 16px 10px",borderBottom:`1px solid ${D.glassBorder}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${D.indigo},${D.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🤖</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:D.text}}>Axe — MLBEdge</div>
            <div style={{fontSize:10,color:D.green,display:"flex",alignItems:"center",gap:4}}><LiveDot color={D.green}/> {limit===Infinity?"Ilimitado":`${queries}/${limit} consultas hoy`}</div>
          </div>
          <button onClick={onClose} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:8,padding:"5px 10px",color:D.sub,cursor:"pointer",fontSize:13}}>✕</button>
        </div>
        {msgs.length<=1&&<div style={{padding:"10px 14px",borderBottom:`1px solid ${D.glassBorder}`}}>
          <div style={{fontSize:8,color:D.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Preguntas frecuentes</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {QUICK.map((q,i)=><button key={i} onClick={()=>send(q)} style={{background:`${D.indigo}14`,border:`1px solid ${D.iL}33`,borderRadius:7,padding:"5px 9px",color:D.iL,fontSize:9,fontWeight:600,cursor:"pointer"}}>{q}</button>)}
          </div>
        </div>}
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:9}}>
          {msgs.map(m=>(
            <div key={m.id} style={{display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start",animation:"v15Up 0.25s ease"}}>
              {m.from==="agent"&&<div style={{width:26,height:26,borderRadius:7,background:`linear-gradient(135deg,${D.indigo},${D.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,marginRight:6,flexShrink:0,alignSelf:"flex-end"}}>🤖</div>}
              <div style={{maxWidth:"78%",padding:"9px 12px",borderRadius:m.from==="user"?"13px 13px 4px 13px":"13px 13px 13px 4px",background:m.from==="user"?`linear-gradient(135deg,${D.indigo},${D.violet})`:D.glass,border:m.from==="user"?"none":`1px solid ${D.glassBorder}`}}>
                <div style={{fontSize:12,color:m.from==="user"?"white":D.text,lineHeight:1.65}}>{m.text}</div>
                <div style={{fontSize:8,color:m.from==="user"?"rgba(255,255,255,0.5)":D.muted,marginTop:3}}>{m.from==="user"?"✓✓":"Axe · MLBEdge"}</div>
              </div>
            </div>
          ))}
          {typing&&<div style={{display:"flex",gap:6,alignItems:"center"}}><div style={{width:26,height:26,borderRadius:7,background:`linear-gradient(135deg,${D.indigo},${D.violet})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🤖</div><div style={{padding:"9px 13px",background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:"13px 13px 13px 4px",display:"flex",gap:3,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:D.iL,animation:`v15Bounce 0.6s ${i*0.15}s ease infinite`}}/>)}</div></div>}
          <div ref={endRef}/>
        </div>
        {atLimit&&<div style={{padding:"8px 14px",background:`${D.amber}0a`,borderTop:`1px solid ${D.amber}22`,textAlign:"center",fontSize:10,color:D.amber,fontWeight:600}}>Límite diario alcanzado · Actualiza tu plan para más consultas</div>}
        <div style={{padding:"10px 14px 16px",borderTop:`1px solid ${D.glassBorder}`,display:"flex",gap:7}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} disabled={atLimit} placeholder={atLimit?"Límite alcanzado":"Pregunta a Axe sobre béisbol y MLBEdge..."} style={{flex:1,padding:"10px 13px",background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:11,color:D.text,fontSize:12,outline:"none",opacity:atLimit?0.5:1}}/>
          <button onClick={()=>send()} disabled={!input.trim()||typing||atLimit} style={{width:40,height:40,borderRadius:10,border:"none",background:input.trim()&&!typing&&!atLimit?`linear-gradient(135deg,${D.indigo},${D.violet})`:"rgba(255,255,255,0.1)",color:input.trim()&&!typing&&!atLimit?"white":D.muted,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>→</button>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const INIT_NOTIFS=[
  {id:1,icon:"🔴",title:"Partido En Vivo",body:"Datos en tiempo real de MLB activados",time:"Ahora",read:false,color:"#10b981"},
  {id:2,icon:"🎯",title:"Alta Confianza Detectada",body:"LAD @ ATL — 84% confianza Moneyline",time:"Hace 5 min",read:false,color:"#6366f1"},
  {id:3,icon:"📊",title:"Cambio en Proyección",body:"MIL @ CHC: Viento OUT — Over subió a 67%",time:"Hace 12 min",read:false,color:"#f59e0b"},
  {id:4,icon:"✨",title:"MLBEdge v15 Activo",body:"Auth, MLB Live y Axe AI conectados",time:"Hoy",read:true,color:"#818cf8"},
];

function NotifCenter({dark,onClose}){
  const D=dark?DARK:LIGHT;
  const [notifs,setNotifs]=useState(INIT_NOTIFS);
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:480,background:dark?"rgba(10,14,26,0.99)":"rgba(255,255,255,0.99)",borderRadius:"22px 22px 0 0",border:`1px solid ${D.glassBorder}`,borderBottom:"none",maxHeight:"80vh",display:"flex",flexDirection:"column",animation:"v15SlideUp 0.3s ease"}}>
        <div style={{width:36,height:4,borderRadius:99,background:"rgba(255,255,255,0.15)",margin:"12px auto 0"}}/>
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${D.glassBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:16,fontWeight:900,color:D.text}}>Notificaciones <span style={{background:D.red,color:"white",fontSize:10,fontWeight:700,borderRadius:99,padding:"1px 6px",marginLeft:6}}>{notifs.filter(n=>!n.read).length}</span></div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:7,padding:"5px 9px",color:D.iL,fontSize:10,fontWeight:600,cursor:"pointer"}}>Leer todas</button>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
function PricingScreen({userPlan,onSelect,dark,onBack}){
  const D=dark?DARK:LIGHT;
  return(
    <div style={{minHeight:"100vh",background:D.bg0}}>
      <div style={{position:"sticky",top:0,zIndex:30,background:dark?"rgba(10,14,26,0.97)":"rgba(240,244,248,0.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${D.glassBorder}`,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {onBack&&<button onClick={onBack} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"7px 12px",color:D.sub,fontSize:12,fontWeight:600,cursor:"pointer"}}>← Atrás</button>}
          <div><div style={{fontSize:16,fontWeight:900,color:D.text}}>Planes MLBEdge</div><div style={{fontSize:10,color:D.muted}}>Elige tu plan</div></div>
        </div>
      </div>
      <div style={{padding:"14px 13px 90px"}}>
        {Object.entries(PLANS).map(([key,plan],i)=>(
          <div key={key} style={{marginBottom:12,borderRadius:20,overflow:"hidden",border:`1px solid ${plan.popular?"rgba(139,92,246,0.4)":D.glassBorder}`,background:plan.popular?dark?`linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.06))`:`linear-gradient(135deg,rgba(139,92,246,0.06),rgba(99,102,241,0.03))`:D.bg1,animation:`v15Up 0.3s ${i*0.08}s both ease`}}>
            {plan.popular&&<div style={{height:2,background:`linear-gradient(90deg,${plan.color}00,${plan.color},${plan.color}00)`}}/>}
            <div style={{padding:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <div style={{fontSize:15,fontWeight:800,color:plan.color}}>{plan.name}</div>
                    {userPlan===key&&<span style={{fontSize:8,fontWeight:700,color:plan.color,background:`${plan.color}18`,border:`1px solid ${plan.color}33`,borderRadius:6,padding:"2px 7px"}}>ACTIVO</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                    <div style={{fontSize:30,fontWeight:900,color:D.text}}>{plan.price}</div>
                    <div style={{fontSize:12,color:D.muted}}>{plan.period}</div>
                  </div>
                </div>
                <div style={{fontSize:28}}>{key==="starter"?"⚾":key==="pro"?"🚀":"⭐"}</div>
              </div>
              <div style={{height:1,background:`${plan.color}22`,marginBottom:12}}/>
              {plan.features.map((f,j)=>(
                <div key={j} style={{display:"flex",gap:7,marginBottom:6}}><span style={{color:plan.color,fontSize:11,flexShrink:0}}>✓</span><span style={{fontSize:11,color:D.sub}}>{f}</span></div>
              ))}
              <button onClick={()=>onSelect(key)} style={{width:"100%",padding:"12px",marginTop:12,borderRadius:12,border:"none",cursor:"pointer",background:userPlan===key?D.glass:`linear-gradient(135deg,${plan.color},${plan.color}cc)`,color:userPlan===key?D.muted:"white",fontWeight:700,fontSize:13,border:userPlan===key?`1px solid ${D.glassBorder}`:"none"}}>
                {userPlan===key?"Plan Actual":key==="starter"?"Comenzar Gratis →":`Elegir ${plan.name} →`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfileScreen({dark,user,userPlan,onChangePlan,onLogout}){
  const D=dark?DARK:LIGHT;
  const plan=PLANS[userPlan];
  return(
    <div style={{padding:"12px 13px 0"}}>
      <div style={{background:`linear-gradient(135deg,${plan.color}18,${plan.color}08)`,border:`1px solid ${plan.color}28`,borderRadius:18,padding:"18px",marginBottom:12,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${plan.color},transparent)`}}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:52,height:52,borderRadius:14,background:`${plan.color}22`,border:`1px solid ${plan.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
            {user?.isGuest?"👤":"⚾"}
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:D.text,marginBottom:3}}>{user?.email||"Usuario"}</div>
            <span style={{background:`${plan.color}22`,border:`1px solid ${plan.color}33`,borderRadius:6,padding:"2px 9px",fontSize:8,fontWeight:800,color:plan.color,letterSpacing:"0.1em"}}>PLAN {plan.name.toUpperCase()}</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
          {[{l:"Precio",v:plan.price,c:plan.color},{l:"Período",v:plan.period.replace("/",""),c:D.sub},{l:"Axe",v:plan.axeLimit===Infinity?"∞":`${plan.axeLimit}/día`,c:D.iL}].map(s=>(
            <div key={s.l} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:7,color:D.muted,marginTop:2,textTransform:"uppercase"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      {userPlan!=="elite"&&<button onClick={onChangePlan} style={{width:"100%",padding:"13px",borderRadius:13,border:`1px solid ${D.iL}33`,background:`linear-gradient(135deg,${D.indigo}22,${D.violet}14)`,color:D.iL,fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:10}}>🚀 Ver todos los planes →</button>}
      <button onClick={onLogout} style={{width:"100%",padding:"11px",borderRadius:12,border:`1px solid ${D.glassBorder}`,background:D.glass,color:D.muted,fontWeight:600,fontSize:12,cursor:"pointer",marginBottom:10}}>↩ Cerrar sesión</button>
      <div style={{textAlign:"center",fontSize:8,color:D.muted,lineHeight:2,textTransform:"uppercase"}}>MLBEdge v15 · Axe AI · MLB Stats API · Statcast<br/>Solo para análisis informativo · +21</div>
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
          <span style={{fontSize:8,fontWeight:isA?700:500,color:isA?D.iL:D.muted,transition:"color .2s"}}>{tab.label}</span>
        </button>
      );})}
    </div>
  );
}

// ─── GAME DETAIL ─────────────────────────────────────────────────────────────
function GameDetail({game,onBack,dark,userPlan,onUpgrade}){
  const D=dark?DARK:LIGHT;
  const H=ALL_TEAMS[game.home],A=ALL_TEAMS[game.away];
  const pred=predict(game.away,game.home,game.pf||1,game.wx?.wind||"");
  return(
    <div style={{minHeight:"100vh",background:D.bg0}}>
      <div style={{position:"sticky",top:0,zIndex:30,background:dark?"rgba(10,14,26,0.97)":"rgba(240,244,248,0.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${D.glassBorder}`,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onBack} style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:10,padding:"7px 12px",color:D.sub,fontSize:12,fontWeight:600,cursor:"pointer"}}>← Atrás</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:900,color:D.text}}>
              <span style={{color:A?.clr}}>{A?.abbr}</span><span style={{color:D.muted,margin:"0 5px",fontWeight:400}}>@</span><span style={{color:H?.clr}}>{H?.abbr}</span>
            </div>
            <div style={{fontSize:9,color:D.muted}}>{game.venue} · {game.isLive?"🔴 EN VIVO":game.isFinal?"Final":game.time}</div>
          </div>
          {pred&&<Ring grade={pred.grade} conf={pred.conf} size={38} dark={dark}/>}
        </div>
      </div>
      <div style={{padding:"14px 13px 90px"}}>
        {/* Live score */}
        {(game.isLive||game.isFinal)&&game.sim&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,padding:"14px 18px",background:`linear-gradient(135deg,${A?.clr||D.muted}14,${H?.clr||D.indigo}14)`,border:`1px solid ${D.glassBorder}`,borderRadius:16}}>
            {[{t:A,sc:game.sim.away,h:game.sim.awayH},{t:H,sc:game.sim.home,h:game.sim.homeH}].map((x,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:x.t?.clr,marginBottom:3}}>{x.t?.abbr}</div>
                <div style={{fontSize:44,fontWeight:900,color:D.text,lineHeight:1}}>{x.sc}</div>
                <div style={{fontSize:8,color:D.muted,marginTop:2}}>{x.h}H</div>
              </div>
            ))}
            {game.isLive&&<div style={{textAlign:"center"}}><LiveDot/><div style={{fontSize:10,color:D.green,fontWeight:700,marginTop:3}}>{game.sim.half==="T"?"▲":"▼"}{game.sim.inn}</div></div>}
          </div>
        )}
        {pred&&<>
          <div style={{display:"flex",gap:4,marginBottom:12}}>
            <Chip label="Home ML" value={fO(pred.hO)} color={H?.clr||D.indigo} dark={dark}/>
            <Chip label="Away ML" value={fO(pred.aO)} color={A?.clr||D.muted} dark={dark}/>
            <Chip label={`O/U ${pred.line}`} value={pred.rec} color={pred.rec==="OVER"?D.green:D.indigo} dark={dark}/>
            <Chip label="Conf." value={`${pred.conf}%`} color={D.iL} dark={dark}/>
          </div>
          <div style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:13,padding:"13px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:11}}>
              <span style={{color:A?.clr,fontWeight:700}}>{A?.abbr} {pred.aWr}%</span>
              <span style={{fontSize:9,color:D.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Probabilidad</span>
              <span style={{color:H?.clr,fontWeight:700}}>{pred.hWr}% {H?.abbr}</span>
            </div>
            <div style={{display:"flex",borderRadius:99,overflow:"hidden",height:10,gap:1}}>
              <div style={{width:`${pred.aWr}%`,background:A?.clr||D.muted,transition:"width 1s ease"}}/>
              <div style={{width:`${pred.hWr}%`,background:H?.clr||D.indigo,transition:"width 1s ease"}}/>
            </div>
          </div>
          <SLabel icon="📊" dark={dark}>Análisis por Mercado</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:9,marginBottom:12}}>
            {[{title:"💵 Moneyline",color:D.indigo,content:`${pred.hWr>pred.aWr?H?.name:A?.name} es el favorito con ${Math.max(pred.hWr,pred.aWr)}% de probabilidad. Confianza ${pred.conf}% basado en ERA, OPS y parque.`,rec:`${pred.hWr>pred.aWr?H?.abbr:A?.abbr} ML ${pred.hWr>pred.aWr?fO(pred.hO):fO(pred.aO)}`},
              {title:"📏 Runline",color:D.violet,content:`${pred.rlCover}% de probabilidad de cubrir el Runline -1.5. Riesgo ${pred.risk}.`,rec:`${pred.hWr>pred.aWr?H?.abbr:A?.abbr} −1.5`},
              {title:"⚡ Over/Under",color:pred.rec==="OVER"?D.green:D.iL,content:`Proyección ${pred.proj} carreras vs línea ${pred.line}. ${game.wx?.wind?.includes("OUT")?"Viento saliendo favorece el Over.":"Análisis basado en pitcheo y clima."}`,rec:`${pred.rec} ${pred.line} (${pred.rec==="OVER"?pred.overP:pred.underP}%)`},
            ].map(({title,color,content,rec})=>(
              <div key={title} style={{background:`${color}0a`,border:`1px solid ${color}22`,borderRadius:13,padding:"12px"}}>
                <div style={{fontSize:11,fontWeight:800,color,marginBottom:6}}>{title}</div>
                <p style={{fontSize:11,color:D.sub,lineHeight:1.65,margin:0,marginBottom:7}}>{content}</p>
                <div style={{fontSize:11,fontWeight:700,color,background:`${color}14`,borderRadius:8,padding:"6px 10px"}}>{rec}</div>
              </div>
            ))}
          </div>
          {game.wx&&<div style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:12,padding:"12px",display:"flex",alignItems:"center",gap:9}}>
            <span style={{fontSize:18}}>{game.wx.sky}</span>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:D.text}}>{game.wx.desc}</div><div style={{fontSize:9,color:D.muted,marginTop:1}}>{game.wx.temp}°F · {game.wx.wind}</div></div>
            {game.wx.wind?.includes("OUT")&&<span style={{fontSize:9,color:D.green,fontWeight:700,background:`${D.green}14`,border:`1px solid ${D.green}28`,borderRadius:6,padding:"2px 7px"}}>↑ OVER</span>}
            {game.wx.wind?.includes("IN")&&<span style={{fontSize:9,color:D.iL,fontWeight:700,background:`${D.indigo}14`,border:`1px solid ${D.iL}28`,borderRadius:6,padding:"2px 7px"}}>↓ UNDER</span>}
          </div>}
        </>}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [dark,setDark]           = useState(true);
  const [tab,setTab]             = useState("calendar");
  const [games,setGames]         = useState([]);
  const [selected,setSelected]   = useState(null);
  const [showNotifs,setNotifs]   = useState(false);
  const [showAxe,setAxe]         = useState(false);
  const [showPricing,setPricing] = useState(false);
  const [userPlan,setUserPlan]   = useState("starter");
  const [notifCount,setNC]       = useState(3);
  const [user,setUser]           = useState(null);
  const [authReady,setReady]     = useState(false);
  const [liveStatus,setLiveStatus] = useState("loading"); // loading | live | demo

  const D = dark ? DARK : LIGHT;

  // Auth restore
  useEffect(()=>{
    try {
      const hash = window.location.hash;
      if(hash.includes("access_token")){
        const p = new URLSearchParams(hash.replace("#","?"));
        const tok = p.get("access_token");
        if(tok){ AUTH._save({access_token:tok,user:{id:"google",email:"google@user"}}); setUser(AUTH.user); window.history.replaceState(null,"",window.location.pathname); }
      } else { if(AUTH.restore()) setUser(AUTH.user); }
    } catch {}
    setReady(true);
  },[]);

  // Load games
  useEffect(()=>{
    if(!user) return;
    const load = async () => {
      setLiveStatus("loading");
      const live = await fetchLiveGames();
      if(live && live.length > 0){ setGames(live); setLiveStatus("live"); }
      else { setGames(buildFallbackGames()); setLiveStatus("demo"); }
    };
    load();
    const id = setInterval(load, 90_000);
    return () => clearInterval(id);
  },[user]);

  const liveN  = games.filter(g=>g.isLive).length;
  const valueN = games.filter(g=>{ const p=predict(g.away,g.home,g.pf||1,g.wx?.wind||""); return p&&p.edge>0&&!g.isFinal; }).length;

  const handleAuth    = u => setUser(u);
  const handleLogout  = () => { AUTH.signOut(); setUser(null); };
  const handleUpgrade = () => { setPricing(true); setSelected(null); };
  const handlePlan    = p  => { setUserPlan(p); setPricing(false); };

  // Splash
  if(!authReady) return(
    <div style={{minHeight:"100vh",background:"#0a0e1a",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`@keyframes v15Spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontSize:48}}>⚾</div>
      <div style={{fontSize:24,fontWeight:900,color:"#f9fafb"}}>MLB<span style={{color:"#6366f1"}}>Edge</span></div>
      <div style={{width:32,height:32,borderRadius:"50%",border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",animation:"v15Spin 0.7s linear infinite"}}/>
    </div>
  );

  // Auth
  if(!user) return(
    <>
      <style>{`@keyframes v15Spin{to{transform:rotate(360deg)}}@keyframes v15Pulse{0%,100%{opacity:1}50%{opacity:.35}}@keyframes v15Up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}button{font-family:'Inter',system-ui,sans-serif;cursor:pointer;transition:all .15s ease;}button:active{transform:scale(.96);}input{outline:none;font-family:'Inter',system-ui,sans-serif;}`}</style>
      <AuthScreen dark={dark} onAuth={handleAuth}/>
    </>
  );

  // Pricing
  if(showPricing) return(
    <div style={{background:D.bg0,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:D.text}}>
      <style>{`@keyframes v15Spin{to{transform:rotate(360deg)}}@keyframes v15Pulse{0%,100%{opacity:1}50%{opacity:.35}}@keyframes v15Up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes v15SlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes v15Bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}*{box-sizing:border-box;margin:0;padding:0;}button{font-family:inherit;cursor:pointer;}input,textarea{outline:none;font-family:inherit;}`}</style>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <PricingScreen userPlan={userPlan} onSelect={handlePlan} dark={dark} onBack={()=>setPricing(false)}/>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:D.bg0,fontFamily:"'Inter',system-ui,-apple-system,sans-serif",color:D.text,transition:"background 0.3s ease"}}>
      <style>{`
        @keyframes v15Spin    {to{transform:rotate(360deg)}}
        @keyframes v15Pulse   {0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes v15Up      {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes v15SlideUp {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes v15Bounce  {0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
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
                    {liveStatus==="live"&&<span style={{fontSize:7,color:D.green,background:`${D.green}14`,border:`1px solid ${D.green}28`,borderRadius:4,padding:"1px 5px",fontWeight:700}}>⚡ MLB LIVE</span>}
                    {liveStatus==="demo"&&<span style={{fontSize:7,color:D.amber,background:`${D.amber}14`,border:`1px solid ${D.amber}28`,borderRadius:4,padding:"1px 5px",fontWeight:700}}>DEMO</span>}
                  </div>
                  <div style={{fontSize:9,color:D.muted}}>{new Date().toLocaleDateString("es",{weekday:"long",month:"long",day:"numeric"})}</div>
                </div>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  {liveN>0&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:D.green,fontWeight:600}}><LiveDot color={D.green}/>{liveN}</div>}
                  <button onClick={()=>{setNotifs(true);setNC(0);}} style={{position:"relative",width:34,height:34,borderRadius:9,border:`1px solid ${D.glassBorder}`,background:D.glass,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    🔔{notifCount>0&&<div style={{position:"absolute",top:-2,right:-2,background:D.red,color:"white",fontSize:7,fontWeight:800,minWidth:14,height:14,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px",border:`1.5px solid ${D.bg0}`}}>{notifCount}</div>}
                  </button>
                  <button onClick={()=>setDark(d=>!d)} style={{width:34,height:34,borderRadius:9,border:`1px solid ${D.glassBorder}`,background:D.glass,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{dark?"☀️":"🌙"}</button>
                  <div style={{display:"flex",gap:4}}>
                    <div style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:7,padding:"4px 7px",textAlign:"center"}}><div style={{fontSize:11,fontWeight:800,color:D.iL}}>{valueN}</div><div style={{fontSize:6,color:D.muted,textTransform:"uppercase"}}>Oport.</div></div>
                    <div style={{background:D.glass,border:`1px solid ${D.glassBorder}`,borderRadius:7,padding:"4px 7px",textAlign:"center"}}><div style={{fontSize:11,fontWeight:800,color:D.text}}>{games.length}</div><div style={{fontSize:6,color:D.muted,textTransform:"uppercase"}}>Juegos</div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* SCREENS */}
            {tab==="calendar"&&(
              <div>
                <div style={{padding:"10px 13px 0"}}>
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:18,fontWeight:900,color:D.text,marginBottom:1}}>Calendario</div>
                    <div style={{fontSize:10,color:D.muted,display:"flex",alignItems:"center",gap:5}}>
                      {new Date().toLocaleDateString("es",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
                      {liveStatus==="loading"&&<span style={{fontSize:9,color:D.amber,animation:"v15Pulse 1.5s ease infinite"}}>Cargando datos MLB…</span>}
                      {liveStatus==="live"&&<span style={{fontSize:9,color:D.green,display:"flex",alignItems:"center",gap:3}}><LiveDot color={D.green} s={5}/>Datos en tiempo real</span>}
                      {liveStatus==="demo"&&<span style={{fontSize:9,color:D.amber}}>Datos de demostración</span>}
                    </div>
                  </div>
                </div>
                <div style={{padding:"0 13px",display:"flex",flexDirection:"column",gap:9}}>
                  {games.map((g,i)=><GameCard key={g.id} game={g} idx={i} onSelect={setSelected} dark={dark}/>)}
                </div>
              </div>
            )}
            {tab==="opps"   &&<OppsScreen games={games} onSelect={setSelected} dark={dark} userPlan={userPlan} onUpgrade={handleUpgrade}/>}
            {tab==="stats"  &&<StatsScreen dark={dark}/>}
            {tab==="profile"&&<ProfileScreen dark={dark} user={user} userPlan={userPlan} onChangePlan={handleUpgrade} onLogout={handleLogout}/>}

            <BottomNav active={tab} onChange={setTab} picksCount={valueN} dark={dark}/>

            {/* Axe button */}
            <button onClick={()=>setAxe(true)} style={{position:"fixed",bottom:80,right:16,width:52,height:52,borderRadius:"50%",border:"none",zIndex:40,background:`linear-gradient(135deg,${D.indigo},${D.violet})`,color:"white",fontSize:22,cursor:"pointer",boxShadow:`0 4px 20px ${D.indigo}66`,display:"flex",alignItems:"center",justifyContent:"center",animation:"v15Up 0.5s 0.3s both ease"}}>
              🤖
            </button>
          </>
        )}
      </div>

      {showNotifs&&<NotifCenter dark={dark} onClose={()=>setNotifs(false)}/>}
      {showAxe   &&<AxeChat dark={dark} onClose={()=>setAxe(false)} userPlan={userPlan}/>}
    </div>
  );
}
