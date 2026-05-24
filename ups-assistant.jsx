import { useState, useEffect } from "react";

const UPS_CATALOG = {
  "Eaton": ["5P","5PX","9PX","9SX","9E","EX RT","Ellipse ECO","3S","5E","Pulsar M","EPE","93PM","93E","BladeUPS"],
  "APC / Schneider": ["Smart-UPS 750","Smart-UPS 1000","Smart-UPS 1500","Smart-UPS 2200","Smart-UPS 3000","Smart-UPS RT","Symmetra LX","Symmetra PX","Galaxy 3500","Galaxy 5500","Easy UPS"],
  "Riello": ["iDialog","Dialog Vision","Dialog+","Mistral","Sentinel Dual","Sentinel Pro","UPower","Master HP","Master MHT","Megaline","Multi Sentry"],
  "Vertiv": ["Liebert GXT4","Liebert GXT5","Liebert PSI5","Liebert ITA2","Liebert EXL S1","Liebert APM","Liebert NXC","Liebert NXL","Liebert EXM2"],
  "Socomec": ["NETYS PR","NETYS RT","ITYS E","ITYS R","DIGYS","DELPHYS GP","DELPHYS MX","MODULYS GP","MASTERYS GP4"],
  "Legrand": ["Keor SP","Keor LP","Keor S","Keor T","Keor Multiplug","Daker DK","Niky S","Megaline"],
  "Salicru": ["SLC ADVANCE","SLC CUBE3+","SPS.ONE","SPS SOHO","EQX","SLC X-PERT"],
  "CyberPower": ["PR750ELCD","PR1000ELCD","PR1500ELCD","PR2200ELCD","OR600ERM1U","OL1000ERT2U","OL2000ERT2U"],
  "Powerware": ["9120","9130","9140","9150","9155","9170+","9315"],
  "Ever": ["ECO Pro","Sinline RT XL","Powerline RT","Forte","Ecoline"],
};
const BATTERY_BRANDS = ["YUASA","CSB","Fiamm","Vision","Leoch","Sonnenschein","EnerSys","Banner","Panasonic","Coslight","Altra"];
const CONFIGS = ["1F in / 1F out","3F in / 1F out","3F in / 3F out","1F in / 3F out"];
const TOPOLOGIE = ["Online doppia conversione","Line-interactive","Standby / Off-line","Delta conversion"];
const STORAGE_KEY = "ups_assistant_v2";

function loadData() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : { clients:[], customBrands:{} }; }
  catch { return { clients:[], customBrands:{} }; }
}

const C = { bg:"#0f1117",surface:"#161b27",border:"#1e293b",text:"#e2e8f0",muted:"#64748b",faint:"#334155",accent:"#f59e0b",accentDim:"rgba(245,158,11,0.1)",ok:"#22c55e",warn:"#f59e0b",danger:"#ef4444" };

const base = {
  app:{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'IBM Plex Mono','Courier New',monospace" },
  header:{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"13px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logoWrap:{ display:"flex", alignItems:"center", gap:10 },
  logoIcon:{ width:34,height:34,background:"linear-gradient(135deg,#f59e0b,#ef4444)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17 },
  body:{ padding:"16px", maxWidth:500, margin:"0 auto" },
  section:{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px",marginBottom:12 },
  secTitle:{ fontSize:10,color:C.accent,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:14 },
  field:{ marginBottom:12 },
  label:{ display:"block",fontSize:10,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5 },
  input:{ display:"block",width:"100%",background:"#0f1117",border:`1px solid ${C.border}`,borderRadius:6,padding:"10px 11px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box" },
  select:{ display:"block",width:"100%",background:"#0f1117",border:`1px solid ${C.border}`,borderRadius:6,padding:"10px 11px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none",cursor:"pointer",boxSizing:"border-box" },
  textarea:{ display:"block",width:"100%",background:"#0f1117",border:`1px solid ${C.border}`,borderRadius:6,padding:"10px 11px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",minHeight:80,boxSizing:"border-box" },
  row2:{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 },
  calcBox:{ background:"#0f1117",border:`1px solid ${C.border}`,borderRadius:6,padding:"10px 11px",fontSize:14,color:C.accent },
  saveBtn:{ display:"block",width:"100%",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#0f1117",border:"none",borderRadius:8,padding:"14px",fontSize:13,fontWeight:700,letterSpacing:"0.08em",cursor:"pointer",fontFamily:"inherit",boxSizing:"border-box" },
  outlineBtn:{ background:"transparent",border:`1px dashed ${C.accent}`,borderRadius:6,padding:"8px 12px",color:C.accent,fontSize:11,cursor:"pointer",fontFamily:"inherit",width:"100%",marginTop:8,boxSizing:"border-box" },
  navBtn:(a)=>({ padding:"7px 13px",borderRadius:6,border:"1px solid",borderColor:a?C.accent:C.border,background:a?"rgba(245,158,11,0.1)":"transparent",color:a?C.accent:C.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit" }),
  searchWrap:{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:8,marginBottom:14 },
  searchInput:{ flex:1,background:"none",border:"none",outline:"none",color:C.text,fontSize:14,fontFamily:"inherit",minWidth:0 },
  card:{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,marginBottom:12,overflow:"hidden" },
  cardHead:{ padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between" },
  badge:(color)=>({ background:color+"20",color,border:`1px solid ${color}40`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:700,whiteSpace:"nowrap" }),
  upsRow:{ padding:"9px 14px",borderTop:`1px solid ${C.border}` },
  detailSec:{ borderTop:`1px solid ${C.border}`,padding:"12px 14px" },
  detailSecTitle:{ fontSize:10,color:C.accent,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:700,marginBottom:10 },
  detailItem:{ marginBottom:8 },
  detailLabel:{ fontSize:10,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase" },
  detailValue:{ fontSize:13,color:C.text,fontWeight:600,marginTop:1 },
  notesBox:{ margin:"0 14px 14px",background:"#0f1117",borderRadius:6,padding:"10px",fontSize:12,color:"#94a3b8",borderLeft:`3px solid ${C.accent}`,lineHeight:1.6 },
  empty:{ textAlign:"center",padding:"50px 20px",color:C.faint },
  toast:(t)=>({ position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:t==="ok"?"#14532d":"#7f1d1d",border:`1px solid ${t==="ok"?C.ok:C.danger}`,color:"#f8fafc",padding:"11px 22px",borderRadius:8,fontSize:13,zIndex:999,whiteSpace:"nowrap" }),
  fab:{ position:"fixed",bottom:20,right:20,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#0f1117",border:"none",borderRadius:"50%",width:52,height:52,fontSize:22,cursor:"pointer",boxShadow:"0 4px 18px rgba(245,158,11,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50 },
  backBtn:{ fontSize:11,color:C.accent,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",gap:5 },
  deleteBtn:{ background:"transparent",border:`1px solid rgba(239,68,68,0.3)`,borderRadius:5,padding:"4px 10px",color:C.danger,fontSize:10,cursor:"pointer",fontFamily:"inherit" },
  inlineBox:{ background:"#0f1117",border:`1px dashed ${C.accent}`,borderRadius:8,padding:12,marginBottom:12 },
};

function batteryAge(d) {
  if (!d) return null;
  const p = d.split("/"); if (p.length!==3) return null;
  const inst = new Date(`${p[2]}-${p[1]}-${p[0]}`); if (isNaN(inst)) return null;
  const months = Math.floor((Date.now()-inst)/(1000*60*60*24*30));
  if (months>48) return {label:`${months}m ⚠️ SCADUTA`,color:C.danger};
  if (months>36) return {label:`${months}m 🔶 In scadenza`,color:C.warn};
  return {label:`${months}m ✅`,color:C.ok};
}

const emptyForm = { clientName:"",location:"",brand:"",newBrand:"",model:"",newModel:"",power:"",topology:"",configIO:"",serial:"",yearMfg:"",voltageIn:"",voltageOut:"",battBrand:"",battModel:"",battVoltage:"",battAh:"",battElements:"",battStrings:"",battInstallDate:"",notes:"" };

export default function App() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState("search");
  const [search, setSearch] = useState("");
  const [activeClientId, setActiveClientId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [addingBrand, setAddingBrand] = useState(false);
  const [addingModel, setAddingModel] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(()=>{ try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{} },[data]);

  const showToast=(msg,type="ok")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),2500); };

  const allBrands = [...Object.keys(UPS_CATALOG),...Object.keys(data.customBrands||{})].sort();
  const modelsFor = b => [...(UPS_CATALOG[b]||[]),...(data.customBrands?.[b]||[])];

  const set = (k,v) => setForm(f=>{ const n={...f,[k]:v}; if(k==="brand"){n.model="";setAddingModel(false);} return n; });

  const totalV = ()=>{ const v=parseFloat(form.battVoltage),n=parseInt(form.battElements); return(!isNaN(v)&&!isNaN(n)&&n>0)?`${v*n} V`:"—"; };

  const saveBrand = ()=>{ const name=form.newBrand.trim(); if(!name)return; setData(p=>({...p,customBrands:{...p.customBrands,[name]:[]}})); setForm(f=>({...f,brand:name,newBrand:"",model:""})); setAddingBrand(false); showToast(`Marca "${name}" aggiunta!`); };

  const saveModel = ()=>{ const name=form.newModel.trim(); if(!name||!form.brand)return; setData(p=>{const cb={...(p.customBrands||{})};cb[form.brand]=[...(cb[form.brand]||[]),name];return{...p,customBrands:cb};}); setForm(f=>({...f,model:name,newModel:""})); setAddingModel(false); showToast(`Modello "${name}" aggiunto!`); };

  const handleSave = ()=>{
    if(!form.clientName.trim()||!form.brand||!form.model){showToast("Cliente, marca e modello obbligatori","critical");return;}
    const ups={ id:Date.now(),brand:form.brand,model:form.model,power:form.power,topology:form.topology,configIO:form.configIO,serial:form.serial,yearMfg:form.yearMfg,voltageIn:form.voltageIn,voltageOut:form.voltageOut,battery:{brand:form.battBrand,model:form.battModel,voltage:form.battVoltage,ah:form.battAh,elements:form.battElements,strings:form.battStrings,installDate:form.battInstallDate,totalVoltage:totalV()},notes:form.notes,addedAt:new Date().toLocaleDateString("it-IT") };
    setData(p=>{ const clients=[...p.clients]; const i=clients.findIndex(c=>c.name.toLowerCase()===form.clientName.trim().toLowerCase()); if(i>=0)clients[i]={...clients[i],ups:[...clients[i].ups,ups]};else clients.push({id:Date.now(),name:form.clientName.trim(),location:form.location,ups:[ups]}); return{...p,clients}; });
    setForm(emptyForm); setAddingBrand(false); setAddingModel(false);
    showToast("✅ Impianto salvato!"); setView("search");
  };

  const deleteUps=(clientId,upsId)=>{ setData(p=>({...p,clients:p.clients.map(c=>c.id!==clientId?c:{...c,ups:c.ups.filter(u=>u.id!==upsId)}).filter(c=>c.ups.length>0)})); showToast("UPS eliminato"); };

  const filtered = data.clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||(c.location||"").toLowerCase().includes(search.toLowerCase()));
  const activeClient = data.clients.find(c=>c.id===activeClientId);

  const Logo = ()=>(
    <div style={base.logoWrap}>
      <div style={base.logoIcon}>⚡</div>
      <div><div style={{fontSize:13,fontWeight:700,color:"#f8fafc",letterSpacing:"0.08em"}}>UPS ASSISTANT</div><div style={{fontSize:10,color:C.muted}}>{view==="add"?"Nuovo impianto":view==="detail"?"Scheda cliente":"Field Manager v1"}</div></div>
    </div>
  );

  // DETAIL
  if (view==="detail" && activeClient) return (
    <div style={base.app}>
      <div style={base.header}><Logo/></div>
      <div style={base.body}>
        <div style={base.backBtn} onClick={()=>{setView("search");setActiveClientId(null);}}>← Torna alla ricerca</div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:18,fontWeight:700,color:"#f8fafc"}}>{activeClient.name}</div>
          {activeClient.location&&<div style={{fontSize:12,color:C.muted,marginTop:3}}>📍 {activeClient.location}</div>}
          <div style={{fontSize:11,color:C.faint,marginTop:3}}>{activeClient.ups.length} UPS registrat{activeClient.ups.length===1?"o":"i"}</div>
        </div>
        {activeClient.ups.map(ups=>{
          const bAge=batteryAge(ups.battery?.installDate);
          return (
            <div key={ups.id} style={base.card}>
              <div style={{...base.cardHead,background:C.accentDim,borderBottom:`1px solid ${C.border}`}}>
                <div><div style={{fontSize:15,fontWeight:700,color:C.accent}}>{ups.brand} {ups.model}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{[ups.power&&`${ups.power} kVA`,ups.topology].filter(Boolean).join(" · ")}</div></div>
                <button style={base.deleteBtn} onClick={()=>deleteUps(activeClient.id,ups.id)}>🗑</button>
              </div>
              <div style={base.detailSec}>
                <div style={base.detailSecTitle}>⚡ Dati tecnici</div>
                {[["Seriale",ups.serial],["Anno fabbrica",ups.yearMfg],["Config I/O",ups.configIO],["Tensione ingresso",ups.voltageIn&&`${ups.voltageIn}V`],["Tensione uscita",ups.voltageOut&&`${ups.voltageOut}V`]].filter(x=>x[1]).map(([l,v])=>(
                  <div key={l} style={base.detailItem}><div style={base.detailLabel}>{l}</div><div style={base.detailValue}>{v}</div></div>
                ))}
              </div>
              {(ups.battery?.brand||ups.battery?.model||ups.battery?.voltage)&&(
                <div style={base.detailSec}>
                  <div style={base.detailSecTitle}>🔋 Batterie</div>
                  {[["Marca",ups.battery.brand],["Modello",ups.battery.model],["Tensione elemento",ups.battery.voltage&&`${ups.battery.voltage}V`],["Capacità",ups.battery.ah&&`${ups.battery.ah}Ah`],["Elementi/stringa",ups.battery.elements],["N° stringhe",ups.battery.strings],["Tensione totale",ups.battery.totalVoltage!=="—"&&ups.battery.totalVoltage]].filter(x=>x[1]).map(([l,v])=>(
                    <div key={l} style={base.detailItem}><div style={base.detailLabel}>{l}</div><div style={{...base.detailValue,color:l==="Tensione totale"?C.accent:C.text}}>{v}</div></div>
                  ))}
                  {ups.battery.installDate&&(<div style={base.detailItem}><div style={base.detailLabel}>Data installazione</div><div style={{...base.detailValue,color:bAge?.color||C.text}}>{ups.battery.installDate}{bAge?` — ${bAge.label}`:""}</div></div>)}
                </div>
              )}
              {ups.notes&&<div style={base.notesBox}>📝 {ups.notes}</div>}
              <div style={{padding:"6px 14px 10px",fontSize:10,color:C.faint}}>Inserito il {ups.addedAt}</div>
            </div>
          );
        })}
        <div style={{height:30}}/>
      </div>
      {toast&&<div style={base.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );

  // ADD
  if (view==="add") {
    const models=modelsFor(form.brand);
    return (
      <div style={base.app}>
        <div style={base.header}><Logo/><button style={base.navBtn(false)} onClick={()=>setView("search")}>← Annulla</button></div>
        <div style={base.body}>

          <div style={base.section}>
            <div style={base.secTitle}>👤 Cliente</div>
            <div style={base.field}><label style={base.label}>Nome cliente *</label><input style={base.input} value={form.clientName} onChange={e=>set("clientName",e.target.value)} placeholder="es. Rossi Srl"/></div>
            <div style={base.field}><label style={base.label}>Sede / Indirizzo</label><input style={base.input} value={form.location} onChange={e=>set("location",e.target.value)} placeholder="es. Via Roma 5, Milano"/></div>
          </div>

          <div style={base.section}>
            <div style={base.secTitle}>⚡ Dati UPS</div>
            <div style={base.field}>
              <label style={base.label}>Marca *</label>
              <select style={base.select} value={form.brand} onChange={e=>{ if(e.target.value==="__add__"){setAddingBrand(true);set("brand","");}else{set("brand",e.target.value);setAddingBrand(false);} }}>
                <option value="">— Seleziona marca —</option>
                {allBrands.map(b=><option key={b} value={b}>{b}</option>)}
                <option value="__add__">➕ Aggiungi nuova marca...</option>
              </select>
            </div>
            {addingBrand&&(
              <div style={base.inlineBox}>
                <label style={base.label}>Nome nuova marca</label>
                <input style={base.input} value={form.newBrand} onChange={e=>set("newBrand",e.target.value)} placeholder="es. Socomec" autoFocus/>
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button style={{...base.saveBtn,padding:"9px"}} onClick={saveBrand}>Aggiungi</button>
                  <button style={{...base.outlineBtn,marginTop:0}} onClick={()=>{setAddingBrand(false);set("newBrand","");}}>Annulla</button>
                </div>
              </div>
            )}
            <div style={base.field}>
              <label style={base.label}>Modello *</label>
              <select style={base.select} value={form.model} disabled={!form.brand} onChange={e=>{ if(e.target.value==="__add__"){setAddingModel(true);set("model","");}else{set("model",e.target.value);setAddingModel(false);} }}>
                <option value="">{form.brand?"— Seleziona modello —":"— Prima seleziona marca —"}</option>
                {models.map(m=><option key={m} value={m}>{m}</option>)}
                {form.brand&&<option value="__add__">➕ Aggiungi nuovo modello...</option>}
              </select>
            </div>
            {addingModel&&(
              <div style={base.inlineBox}>
                <label style={base.label}>Nome nuovo modello</label>
                <input style={base.input} value={form.newModel} onChange={e=>set("newModel",e.target.value)} placeholder="es. 9PX 3000i RT2U" autoFocus/>
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button style={{...base.saveBtn,padding:"9px"}} onClick={saveModel}>Aggiungi</button>
                  <button style={{...base.outlineBtn,marginTop:0}} onClick={()=>{setAddingModel(false);set("newModel","");}}>Annulla</button>
                </div>
              </div>
            )}
            <div style={base.row2}>
              <div style={base.field}><label style={base.label}>Potenza (kVA)</label><input style={base.input} type="number" value={form.power} onChange={e=>set("power",e.target.value)} placeholder="3"/></div>
              <div style={base.field}><label style={base.label}>Anno fabbrica</label><input style={base.input} type="number" value={form.yearMfg} onChange={e=>set("yearMfg",e.target.value)} placeholder="2021"/></div>
            </div>
            <div style={base.field}><label style={base.label}>N° Seriale</label><input style={base.input} value={form.serial} onChange={e=>set("serial",e.target.value)} placeholder="es. G123456789"/></div>
            <div style={base.field}><label style={base.label}>Topologia</label>
              <select style={base.select} value={form.topology} onChange={e=>set("topology",e.target.value)}>
                <option value="">—</option>{TOPOLOGIE.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={base.field}><label style={base.label}>Configurazione ingresso / uscita</label>
              <select style={base.select} value={form.configIO} onChange={e=>set("configIO",e.target.value)}>
                <option value="">—</option>{CONFIGS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={base.row2}>
              <div style={base.field}><label style={base.label}>Tensione in (V)</label><input style={base.input} type="number" value={form.voltageIn} onChange={e=>set("voltageIn",e.target.value)} placeholder="230"/></div>
              <div style={base.field}><label style={base.label}>Tensione out (V)</label><input style={base.input} type="number" value={form.voltageOut} onChange={e=>set("voltageOut",e.target.value)} placeholder="230"/></div>
            </div>
          </div>

          <div style={base.section}>
            <div style={base.secTitle}>🔋 Batterie</div>
            <div style={base.field}><label style={base.label}>Marca batteria</label>
              <select style={base.select} value={form.battBrand} onChange={e=>set("battBrand",e.target.value)}>
                <option value="">—</option>{BATTERY_BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={base.field}><label style={base.label}>Modello batteria</label><input style={base.input} value={form.battModel} onChange={e=>set("battModel",e.target.value)} placeholder="es. NPL65-12"/></div>
            <div style={base.row2}>
              <div style={base.field}><label style={base.label}>Tensione elem. (V)</label><input style={base.input} type="number" value={form.battVoltage} onChange={e=>set("battVoltage",e.target.value)} placeholder="12"/></div>
              <div style={base.field}><label style={base.label}>Capacità (Ah)</label><input style={base.input} type="number" value={form.battAh} onChange={e=>set("battAh",e.target.value)} placeholder="65"/></div>
            </div>
            <div style={base.row2}>
              <div style={base.field}><label style={base.label}>Elementi/stringa</label><input style={base.input} type="number" value={form.battElements} onChange={e=>set("battElements",e.target.value)} placeholder="4"/></div>
              <div style={base.field}><label style={base.label}>N° stringhe</label><input style={base.input} type="number" value={form.battStrings} onChange={e=>set("battStrings",e.target.value)} placeholder="2"/></div>
            </div>
            <div style={base.field}><label style={base.label}>Data installazione (gg/mm/aaaa)</label><input style={base.input} value={form.battInstallDate} onChange={e=>set("battInstallDate",e.target.value)} placeholder="15/03/2023"/></div>
            <div style={base.field}><label style={base.label}>Tensione totale calcolata</label>
              <div style={base.calcBox}>⚡ {totalV()}{form.battElements&&form.battVoltage?<span style={{color:C.muted,fontSize:11,marginLeft:8}}>({form.battVoltage}V × {form.battElements})</span>:null}</div>
            </div>
          </div>

          <div style={base.section}>
            <div style={base.secTitle}>📝 Note tecniche</div>
            <div style={base.field}><label style={base.label}>Codici accesso, avvertenze, particolarità...</label>
              <textarea style={base.textarea} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="es. Codice menu tecnico: 0012 — NON toccare EPO senza autorizzazione"/>
            </div>
          </div>

          <button style={base.saveBtn} onClick={handleSave}>💾 Salva impianto</button>
          <div style={{height:50}}/>
        </div>
        {toast&&<div style={base.toast(toast.type)}>{toast.msg}</div>}
      </div>
    );
  }

  // SEARCH
  return (
    <div style={base.app}>
      <div style={base.header}><Logo/><button style={base.navBtn(false)} onClick={()=>setView("add")}>+ Nuovo</button></div>
      <div style={base.body}>
        <div style={base.searchWrap}>
          <span style={{color:C.muted}}>🔍</span>
          <input style={base.searchInput} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca cliente o indirizzo..." autoFocus/>
          {search&&<span style={{color:C.muted,cursor:"pointer",fontSize:18}} onClick={()=>setSearch("")}>×</span>}
        </div>
        {filtered.length===0?(
          <div style={base.empty}>
            <div style={{fontSize:36,marginBottom:10}}>⚡</div>
            <div style={{fontSize:13,marginBottom:6}}>{data.clients.length===0?"Nessun impianto registrato":"Nessun risultato"}</div>
            <div style={{fontSize:11}}>{data.clients.length===0?"Premi + Nuovo per iniziare":"Prova con un altro nome"}</div>
          </div>
        ):filtered.map(client=>(
          <div key={client.id} style={{...base.card,cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
            onClick={()=>{setActiveClientId(client.id);setView("detail");}}>
            <div style={base.cardHead}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#f8fafc"}}>{client.name}</div>
                {client.location&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>📍 {client.location}</div>}
              </div>
              <div style={base.badge(C.muted)}>{client.ups.length} UPS</div>
            </div>
            {client.ups.map(ups=>{
              const bAge=batteryAge(ups.battery?.installDate);
              return (
                <div key={ups.id} style={base.upsRow}>
                  <div style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>{ups.brand} {ups.model}{ups.power?` · ${ups.power}kVA`:""}</div>
                  {bAge&&<div style={{fontSize:10,color:bAge.color,marginTop:2}}>🔋 {bAge.label}</div>}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{height:80}}/>
      </div>
      <button style={base.fab} onClick={()=>setView("add")}>+</button>
      {toast&&<div style={base.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );
}
