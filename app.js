const KEY="roadpilot_v4_state";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const days=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const platforms=["DoorDash","Uber Driver","Uber Eats","Veho"];

const defaultState={
  session:null, users:{}, orders:[], zones:[], connections:{},
  planner:days.map(d=>({day:d,active:false,start:"09:00",end:"17:00",goal:120})),
  vehicle:{eff:25,fuel:3.5,maint:.12,other:1},
  profile:{name:"Driver",email:"",dailyGoal:150,weeklyGoal:900}
};

let state=load();
let authMode="login";

function load(){try{return {...structuredClone(defaultState),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return structuredClone(defaultState)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400)}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function money(n){return "$"+Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
function initials(n){return (n||"R").split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()}

function enterApp(){ $("#authView").classList.add("hidden");$("#appView").classList.remove("hidden");renderAll(); }
function enterAuth(){ $("#authView").classList.remove("hidden");$("#appView").classList.add("hidden"); }

function setupAuth(){
  $$(".tab").forEach(b=>b.onclick=()=>{authMode=b.dataset.auth;$$(".tab").forEach(x=>x.classList.toggle("active",x===b));$(".auth-card").classList.toggle("register-mode",authMode==="register");$("#authSubmit").textContent=authMode==="register"?"Crear cuenta":"Entrar a RoadPilot";});
  $("#authForm").onsubmit=e=>{
    e.preventDefault();
    const email=$("#authEmail").value.trim().toLowerCase(), pass=$("#authPassword").value;
    if(authMode==="register"){
      if(state.users[email]) return toast("Ya existe una cuenta RoadPilot.");
      state.users[email]={name:$("#authName").value.trim()||"Driver",pass};
      state.profile={...state.profile,name:state.users[email].name,email};
      state.session=email; save(); enterApp(); toast("Cuenta RoadPilot creada.");
    }else{
      const u=state.users[email];
      if(!u) return toast("No existe esa cuenta en este dispositivo.");
      if(u.pass!==pass) return toast("Contraseña incorrecta.");
      state.session=email; state.profile.email=email; state.profile.name=u.name||"Driver"; save(); enterApp(); toast("Bienvenido a RoadPilot.");
    }
  };
  $("#logoutBtn").onclick=()=>{state.session=null;save();enterAuth()};
}
function nav(){
  $$(".nav").forEach(b=>b.onclick=()=>showSection(b.dataset.section));
  $$("[data-go]").forEach(b=>b.onclick=()=>showSection(b.dataset.go));
  $("#menuBtn").onclick=()=>$(".sidebar").classList.toggle("open");
}
function showSection(id){
  $$(".section").forEach(s=>s.classList.toggle("active",s.id===id));
  $$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.section===id));
  const names={dashboard:"Dashboard",radar:"Smart Radar",planner:"Plan semanal",calculator:"Rentabilidad",zones:"Zonas",connections:"Plataformas",profile:"Perfil"};
  $("#pageTitle").textContent=names[id]||"Dashboard";
  $(".sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderDashboard(){
  const active=state.planner.filter(x=>x.active), hours=active.reduce((a,x)=>a+duration(x.start,x.end),0), goal=active.reduce((a,x)=>a+Number(x.goal||0),0);
  const ranked=rankOrders();
  $("#dashGoal").textContent=money(goal||state.profile.weeklyGoal);
  $("#dashGoalSub").textContent=active.length?`${active.length} días activos`:"Configura tu plan";
  $("#dashHours").textContent=hours.toFixed(1)+"h";
  $("#dashBest").textContent=ranked[0]?money(ranked[0].pay):"$0";
  $("#dashBestSub").textContent=ranked[0]?`${ranked[0].score}/100 · ${ranked[0].platform}`:"Agrega órdenes";
  $("#dashRate").textContent=hours?money(goal/hours)+"/h":"$0/h";
  $("#heroScore").textContent=ranked.length?ranked[0].score:"--";
  $("#nextMove").textContent=ranked[0]?`Prioridad: ${ranked[0].platform} · ${money(ranked[0].pay)} · ${ranked[0].miles} mi · Score ${ranked[0].score}.`:"Configura tu zona y agrega una orden al Radar.";
  $("#userName").textContent=state.profile.name||"Driver";$("#avatar").textContent=initials(state.profile.name)[0];$("#profileAvatar").textContent=initials(state.profile.name);
  $("#dashConnections").innerHTML=platforms.map(p=>`<div class="connection-row"><span><i class="${state.connections[p]?'on':''}"></i>${p}</span><small>${state.connections[p]?"Configurada":"No conectada"}</small></div>`).join("");
}
function duration(a,b){const [ah,am]=a.split(":").map(Number),[bh,bm]=b.split(":").map(Number);let x=bh*60+bm-(ah*60+am);if(x<0)x+=1440;return x/60}

function renderPlanner(){
  $("#plannerGrid").innerHTML=state.planner.map((d,i)=>`<div class="day-card"><h4>${d.day}</h4><label><span>Trabajar</span><input data-plan="${i}" data-k="active" type="checkbox" ${d.active?"checked":""}></label><label>Inicio<input data-plan="${i}" data-k="start" type="time" value="${d.start}"></label><label>Fin<input data-plan="${i}" data-k="end" type="time" value="${d.end}"></label><label>Meta $<input data-plan="${i}" data-k="goal" type="number" value="${d.goal}"></label></div>`).join("");
  $$("[data-plan]").forEach(el=>el.onchange=()=>{const i=+el.dataset.plan,k=el.dataset.k;state.planner[i][k]=el.type==="checkbox"?el.checked:el.value;k==="goal"&&(state.planner[i][k]=Number(el.value));updatePlannerSummary()});
  updatePlannerSummary();
}
function updatePlannerSummary(){const active=state.planner.filter(x=>x.active),h=active.reduce((a,x)=>a+duration(x.start,x.end),0),g=active.reduce((a,x)=>a+Number(x.goal||0),0);$("#weekHours").textContent=h.toFixed(1)+"h";$("#weekGoal").textContent=money(g);$("#weekRate").textContent=h?money(g/h)+"/h":"$0";}
$("#savePlanner").onclick=()=>{save();renderDashboard();toast("Plan semanal guardado.")};

function scoreOrder(o){
  const pay=Number(o.pay), miles=Number(o.miles), mins=Number(o.minutes);
  let score=50;
  score+=Math.min(25,Math.max(0,(pay-10)*1.5));
  score+=Math.min(15,Math.max(0,(2-miles/4)*8));
  score+=Math.min(10,Math.max(0,(35-mins)/3.5));
  score-=Math.max(0,(miles-8)*3);
  return Math.max(0,Math.min(100,Math.round(score)));
}
function rankOrders(){
  const minPay=Number($("#minPay")?.value||0), maxMiles=Number($("#maxMiles")?.value||999), minScore=Number($("#minScore")?.value||0);
  return state.orders.map(o=>({...o,score:scoreOrder(o)})).filter(o=>o.pay>=minPay&&o.miles<=maxMiles&&o.score>=minScore).sort((a,b)=>b.score-a.score||b.pay-a.pay);
}
function renderOrders(){
  const all=[...state.orders].map(o=>({...o,score:scoreOrder(o)})).sort((a,b)=>b.score-a.score);
  const visible=rankOrders();$("#orderCount").textContent=visible.length;
  $("#ordersList").innerHTML=all.length?all.map(o=>{const good=visible.some(v=>v.id===o.id);return `<div class="order-row ${good?"good":""}"><div class="order-main"><b>${esc(o.platform)}</b><small>${esc(o.zone||"Sin zona")}</small></div><b>${money(o.pay)}</b><span>${o.miles} mi</span><span>${o.minutes} min</span><span class="order-meta"><small>estimado</small><br>${money((o.pay/Math.max(o.minutes/60,.1)))} / h</span><strong class="score">${o.score}</strong></div>`}).join(""):`<div class="next-move">No hay órdenes. Puedes cargar ejemplos o analizar una orden manual.</div>`;
  renderDashboard();
}
$("#orderForm").onsubmit=e=>{e.preventDefault();const o={id:Date.now(),platform:$("#orderPlatform").value||"Plataforma",pay:Number($("#orderPay").value||0),miles:Number($("#orderMiles").value||0),minutes:Number($("#orderMinutes").value||0),zone:$("#orderZone").value||"General"};state.orders.unshift(o);save();renderOrders();toast("Orden analizada.");if(o.score>=Number($("#minScore").value||70))notifyUser("RoadPilot Radar",`Oportunidad detectada: ${money(o.pay)} · Score ${scoreOrder(o)}`);e.target.reset();};
["minPay","maxMiles","minScore"].forEach(id=>$("#"+id).oninput=renderOrders);
$("#demoOrders").onclick=()=>{state.orders=[{id:1,platform:"Uber Driver",pay:28,miles:6.2,minutes:34,zone:"Centro"},{id:2,platform:"DoorDash",pay:19,miles:3.1,minutes:29,zone:"Norte"},{id:3,platform:"Uber Eats",pay:36,miles:11,minutes:52,zone:"Sur"},{id:4,platform:"Veho",pay:31,miles:7.4,minutes:40,zone:"Centro"}];save();renderOrders();toast("Ejemplos cargados.");};

function renderZones(){$("#zonesList").innerHTML=state.zones.length?state.zones.map((z,i)=>`<div class="zone-card"><strong>${esc(z.name)}</strong><span>Radio: ${z.radius} km</span><button class="ghost" onclick="removeZone(${i})">Eliminar</button></div>`).join(""):`<div class="next-move">Todavía no tienes zonas guardadas.</div>`}
window.removeZone=i=>{state.zones.splice(i,1);save();renderZones();toast("Zona eliminada.")};
$("#zoneForm").onsubmit=e=>{e.preventDefault();const name=$("#zoneName").value.trim();if(!name)return;state.zones.push({name,radius:Number($("#zoneRadius").value||5)});save();renderZones();e.target.reset();$("#zoneRadius").value=5;toast("Zona guardada.")};

function renderPlatforms(){$("#platformCards").innerHTML=platforms.map(p=>`<div class="platform"><div style="display:flex;gap:13px;align-items:center"><div class="logo">${p.split(" ")[0].slice(0,2).toUpperCase()}</div><div><b>${p}</b><p>${state.connections[p]?"Configuración local guardada":"Sin conexión oficial configurada"}</p></div></div><button class="${state.connections[p]?"ghost":"primary"}" onclick="togglePlatform('${p}')">${state.connections[p]?"Desconectar":"Configurar"}</button></div>`).join("")}
window.togglePlatform=p=>{if(state.connections[p]){delete state.connections[p];toast(`${p} desconectada.`)}else{state.connections[p]={connectedAt:new Date().toISOString()};toast(`${p} marcada para conexión. Usa la autorización oficial cuando esté disponible.`)}save();renderPlatforms();renderDashboard()};

function loadVehicle(){const v=state.vehicle;$("#vehicleEfficiency").value=v.eff;$("#fuelPrice").value=v.fuel;$("#maintCost").value=v.maint;$("#otherCost").value=v.other}
function calc(){const pay=Number($("#calcPayInput").value||0),m=Number($("#calcMilesInput").value||0),min=Number($("#calcMinutesInput").value||0),v=state.vehicle;const fuel=m/Math.max(v.eff,.1)*v.fuel,maint=m*v.maint,other=min/60*v.other,net=pay-fuel-maint-other;$("#calcNet").textContent=money(net);$("#calcPay").textContent=money(pay);$("#calcFuel").textContent="-"+money(fuel);$("#calcMaint").textContent="-"+money(maint);$("#calcOther").textContent="-"+money(other)}
["calcPayInput","calcMilesInput","calcMinutesInput"].forEach(id=>$("#"+id).oninput=calc);
$("#saveVehicle").onclick=()=>{state.vehicle={eff:Number($("#vehicleEfficiency").value||25),fuel:Number($("#fuelPrice").value||3.5),maint:Number($("#maintCost").value||.12),other:Number($("#otherCost").value||1)};save();calc();toast("Vehículo guardado.")};

$("#saveProfile").onclick=()=>{state.profile.name=$("#profileName").value.trim()||"Driver";state.profile.email=$("#profileEmail").value.trim();state.profile.dailyGoal=Number($("#dailyGoal").value||150);state.profile.weeklyGoal=Number($("#weeklyGoal").value||900);if(state.session&&state.users[state.session])state.users[state.session].name=state.profile.name;save();renderDashboard();toast("Perfil actualizado.")};
$("#resetData").onclick=()=>{if(confirm("¿Restablecer órdenes, zonas, plan y configuración?")){const keep={...state.users,};state={...structuredClone(defaultState),users:keep,session:state.session,profile:{...structuredClone(defaultState.profile),...state.profile}};save();renderAll();toast("Datos restablecidos.")}};

async function notifyUser(title,body){try{if("Notification"in window&&Notification.permission==="granted")new Notification(title,{body,icon:"icon.svg"})}catch(e){}}
$("#notifyBtn").onclick=async()=>{if(!("Notification"in window))return toast("Este navegador no admite notificaciones.");const p=await Notification.requestPermission();toast(p==="granted"?"Alertas activadas.":"Alertas no activadas.")};

function renderProfile(){$("#profileName").value=state.profile.name||"";$("#profileEmail").value=state.profile.email||state.session||"";$("#dailyGoal").value=state.profile.dailyGoal||150;$("#weeklyGoal").value=state.profile.weeklyGoal||900}
function renderAll(){renderDashboard();renderOrders();renderPlanner();renderZones();renderPlatforms();loadVehicle();calc();renderProfile()}

setupAuth();nav(); if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(()=>{});}
if(state.session){enterApp()}else{enterAuth()}

function subscribePrompt(){
  toast("RoadPilot Pro seleccionado — integra un proveedor de pagos para activar cobros reales.");
}
$("#subscribeBtn")?.addEventListener("click",subscribePrompt);
$("#subscribeBtn2")?.addEventListener("click",subscribePrompt);

/* ===== ROADPILOT V6 CLOUD MODE ===== */
let cloud = null;
let cloudUser = null;
function cloudConfigured(){
  return window.ROADPILOT_CONFIG &&
    window.ROADPILOT_CONFIG.SUPABASE_URL &&
    !window.ROADPILOT_CONFIG.SUPABASE_URL.includes("TU-PROYECTO") &&
    window.ROADPILOT_CONFIG.SUPABASE_PUBLISHABLE_KEY &&
    !window.ROADPILOT_CONFIG.SUPABASE_PUBLISHABLE_KEY.includes("TU_PUBLISHABLE");
}
async function initCloud(){
  if(!cloudConfigured() || !window.supabase) return false;
  try{
    cloud=supabase.createClient(window.ROADPILOT_CONFIG.SUPABASE_URL,window.ROADPILOT_CONFIG.SUPABASE_PUBLISHABLE_KEY);
    const {data}=await cloud.auth.getSession();
    cloudUser=data.session?.user||null;
    if(cloudUser){
      state.session=cloudUser.id;
      state.profile.email=cloudUser.email||"";
      await loadCloudProfile();
      enterApp();
      await checkAdmin();
    }
    cloud.auth.onAuthStateChange(async (_event,session)=>{
      cloudUser=session?.user||null;
      if(cloudUser){state.session=cloudUser.id;await loadCloudProfile();enterApp();await checkAdmin();}
      else {state.session=null;enterAuth();}
    });
    return true;
  }catch(e){console.warn("Supabase init failed",e);return false}
}
async function loadCloudProfile(){
  if(!cloudUser)return;
  const {data}=await cloud.from("profiles").select("*").eq("id",cloudUser.id).maybeSingle();
  if(data) state.profile={...state.profile,name:data.full_name||"Driver",email:cloudUser.email||"",dailyGoal:data.daily_goal||150,weeklyGoal:data.weekly_goal||900};
  const {data:subs}=await cloud.from("subscriptions").select("*").eq("user_id",cloudUser.id).maybeSingle();
  if(subs) state.subscription=subs;
  const {data:zones}=await cloud.from("zones").select("*").eq("user_id",cloudUser.id).order("created_at");
  if(zones) state.zones=zones.map(z=>({id:z.id,name:z.name,radius:z.radius_km}));
  const {data:orders}=await cloud.from("orders").select("*").eq("user_id",cloudUser.id).order("created_at",{ascending:false});
  if(orders) state.orders=orders;
  const {data:conns}=await cloud.from("platform_connections").select("*").eq("user_id",cloudUser.id);
  if(conns){state.connections={};conns.forEach(c=>state.connections[c.platform]={status:c.status,connectedAt:c.connected_at,label:c.external_account_label})}
}
async function cloudSignUp(email,password,name){
  const {data,error}=await cloud.auth.signUp({email,password,options:{data:{full_name:name||"Driver"}}});
  if(error) throw error;
  toast("Cuenta creada. Revisa tu correo si la confirmación está activada.");
}
async function cloudSignIn(email,password){
  const {error}=await cloud.auth.signInWithPassword({email,password});
  if(error) throw error;
}
async function cloudSignOut(){if(cloud) await cloud.auth.signOut();}
async function saveCloudProfile(){
  if(!cloudUser)return;
  await cloud.from("profiles").upsert({id:cloudUser.id,full_name:state.profile.name,phone:null,daily_goal:Number(state.profile.dailyGoal),weekly_goal:Number(state.profile.weeklyGoal),updated_at:new Date().toISOString()});
}
async function saveCloudZone(z){
  if(!cloudUser)return;
  const {data,error}=await cloud.from("zones").insert({user_id:cloudUser.id,name:z.name,radius_km:z.radius}).select().single();
  if(!error&&data)z.id=data.id;
}
async function deleteCloudZone(id){if(cloudUser&&id)await cloud.from("zones").delete().eq("id",id)}
async function saveCloudOrder(o){
  if(!cloudUser)return;
  await cloud.from("orders").insert({user_id:cloudUser.id,platform:o.platform,pay:o.pay,miles:o.miles,minutes:o.minutes,zone:o.zone,score:scoreOrder(o)});
}
async function saveCloudConnection(p){
  if(!cloudUser)return;
  const c=state.connections[p];
  if(c) await cloud.from("platform_connections").upsert({user_id:cloudUser.id,platform:p,status:c.status||"configured",external_account_label:c.label||null,connected_at:c.connectedAt||new Date().toISOString()},{onConflict:"user_id,platform"});
  else await cloud.from("platform_connections").delete().eq("user_id",cloudUser.id).eq("platform",p);
}
async function loadSubscription(){
  if(!cloudUser)return null;
  const {data}=await cloud.from("subscriptions").select("*").eq("user_id",cloudUser.id).maybeSingle();
  state.subscription=data; return data;
}
async function checkAdmin(){
  if(!cloudUser||!cloud)return;
  const {data}=await cloud.from("profiles").select("id").eq("id",cloudUser.id).maybeSingle();
  const meta=cloudUser.app_metadata||{};
  const isAdmin=meta.role==="admin";
  $("#adminNav").style.display=isAdmin?"flex":"none";
  if(isAdmin) await loadAdmin();
}
async function loadAdmin(){
  if(!cloud||cloudUser?.app_metadata?.role!=="admin")return;
  const [p,s,c,o]=await Promise.all([
    cloud.from("profiles").select("id,full_name,created_at"),
    cloud.from("subscriptions").select("user_id,plan,status,current_period_end"),
    cloud.from("platform_connections").select("id"),
    cloud.from("orders").select("id")
  ]);
  const users=p.data||[], subs=s.data||[];
  $("#adminUsers").textContent=users.length;
  $("#adminPro").textContent=subs.filter(x=>x.status==="active").length;
  $("#adminConnections").textContent=(c.data||[]).length;
  $("#adminOrders").textContent=(o.data||[]).length;
  $("#adminTable").innerHTML=users.map(u=>{
    const sub=subs.find(x=>x.user_id===u.id);
    return `<div class="order-row"><div class="order-main"><b>${esc(u.full_name||"Driver")}</b><small>${esc(u.id)}</small></div><span>${sub?.plan||"free"}</span><span>${sub?.status||"inactive"}</span><span>${sub?.current_period_end?new Date(sub.current_period_end).toLocaleDateString():"—"}</span></div>`
  }).join("")||'<div class="next-move">No hay clientes.</div>';
}
$("#refreshAdmin")?.addEventListener("click",loadAdmin);

// Override local auth submit when cloud is configured.
const oldAuthForm=$("#authForm");
oldAuthForm.addEventListener("submit",async e=>{
  if(!cloud)return;
  e.stopImmediatePropagation(); e.preventDefault();
  const email=$("#authEmail").value.trim().toLowerCase(), pass=$("#authPassword").value, name=$("#authName").value.trim();
  try{
    if(authMode==="register"){await cloudSignUp(email,pass,name)}
    else {await cloudSignIn(email,pass)}
  }catch(err){toast(err.message||"No se pudo autenticar.")}
},true);

$("#logoutBtn").addEventListener("click",async e=>{
  if(cloud){e.stopImmediatePropagation();e.preventDefault();await cloudSignOut();return}
},true);

const oldSaveProfile=$("#saveProfile");
oldSaveProfile.addEventListener("click",async e=>{
  if(!cloud)return;
  e.stopImmediatePropagation();e.preventDefault();
  state.profile.name=$("#profileName").value.trim()||"Driver";
  state.profile.email=$("#profileEmail").value.trim();
  state.profile.dailyGoal=Number($("#dailyGoal").value||150);
  state.profile.weeklyGoal=Number($("#weeklyGoal").value||900);
  await saveCloudProfile();renderDashboard();toast("Perfil sincronizado en la nube.");
},true);

const oldZoneForm=$("#zoneForm");
oldZoneForm.addEventListener("submit",async e=>{
  if(!cloud)return;
  e.stopImmediatePropagation();e.preventDefault();
  const name=$("#zoneName").value.trim(); if(!name)return;
  const z={name,radius:Number($("#zoneRadius").value||5)};
  await saveCloudZone(z); state.zones.push(z); renderZones(); e.target.reset(); $("#zoneRadius").value=5; toast("Zona sincronizada.");
},true);

const oldOrderForm=$("#orderForm");
oldOrderForm.addEventListener("submit",async e=>{
  if(!cloud)return;
  e.stopImmediatePropagation();e.preventDefault();
  const o={id:crypto.randomUUID(),platform:$("#orderPlatform").value||"Plataforma",pay:Number($("#orderPay").value||0),miles:Number($("#orderMiles").value||0),minutes:Number($("#orderMinutes").value||0),zone:$("#orderZone").value||"General"};
  o.score=scoreOrder(o); await saveCloudOrder(o); state.orders.unshift(o); renderOrders(); toast("Orden guardada en la nube."); e.target.reset();
},true);

const originalToggle=window.togglePlatform;
window.togglePlatform=async p=>{originalToggle(p); if(cloud) await saveCloudConnection(p)};

initCloud();
