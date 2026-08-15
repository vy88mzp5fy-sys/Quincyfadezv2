import AsyncStorage from "@react-native-async-storage/async-storage";

const API=(process.env.EXPO_PUBLIC_API_URL||"").replace(/\/$/,"");
const FRESH_TTL=10*60*1000;
const DISPLAY_TTL=6*60*60*1000;
const SERVICES=["Haircut","Haircut & Beard","Shape Up","Beard Trim"];
const memory=new Map();
const inflight=new Map();
const keyFor=s=>`quincyfadez.availability.${encodeURIComponent(s)}`;
const read=r=>r.json().catch(()=>({}));
const age=x=>Date.now()-Number(x?.savedAt||0);

export function peekAvailability(service,{freshOnly=false}={}){
  const hit=memory.get(service);
  if(!hit?.data)return null;
  const limit=freshOnly?FRESH_TTL:DISPLAY_TTL;
  return age(hit)<limit?hit.data:null;
}

export async function readCachedAvailability(service,{freshOnly=false}={}){
  const hot=peekAvailability(service,{freshOnly});
  if(hot)return hot;
  try{
    const raw=await AsyncStorage.getItem(keyFor(service));
    if(!raw)return null;
    const cached=JSON.parse(raw);
    if(!cached?.data)return null;
    const limit=freshOnly?FRESH_TTL:DISPLAY_TTL;
    if(age(cached)>limit)return null;
    memory.set(service,cached);
    return cached.data;
  }catch{return null}
}

export async function fetchAvailability(service,days=21){
  if(!API)return null;
  const requestKey=`${service}:${days}`;
  if(inflight.has(requestKey))return inflight.get(requestKey);
  const job=(async()=>{
    const r=await fetch(`${API}/api/booking/availability?service=${encodeURIComponent(service)}&days=${days}`);
    const data=await read(r);
    if(!r.ok)throw new Error(typeof data.detail==="string"?data.detail:"Availability could not be loaded.");
    const cached={data,savedAt:Date.now()};
    memory.set(service,cached);
    AsyncStorage.setItem(keyFor(service),JSON.stringify(cached)).catch(()=>{});
    return data;
  })();
  inflight.set(requestKey,job);
  try{return await job}finally{inflight.delete(requestKey)}
}

export async function getAvailability(service,days=21,{refresh=true}={}){
  const cached=await readCachedAvailability(service);
  if(cached){
    if(refresh)fetchAvailability(service,days).catch(()=>{});
    return {data:cached,cached:true};
  }
  const data=await fetchAvailability(service,days);
  return {data,cached:false};
}

export function primeAvailability(days=21){
  if(!API)return Promise.resolve([]);
  return Promise.allSettled(SERVICES.map(async service=>{
    const cached=await readCachedAvailability(service);
    if(cached){fetchAvailability(service,days).catch(()=>{});return cached}
    return fetchAvailability(service,days);
  }));
}

export {SERVICES,FRESH_TTL,DISPLAY_TTL};
