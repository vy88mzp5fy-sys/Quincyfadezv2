import AsyncStorage from "@react-native-async-storage/async-storage";

const API=(process.env.EXPO_PUBLIC_API_URL||"").replace(/\/$/,"");
const TTL=10*60*1000;
const SERVICES=["Haircut","Haircut & Beard","Shape Up","Beard Trim"];
const memory=new Map();
const keyFor=s=>`quincyfadez.availability.${encodeURIComponent(s)}`;
const read=r=>r.json().catch(()=>({}));

export function peekAvailability(service){
  const hit=memory.get(service);
  return hit&&Date.now()-hit.savedAt<TTL?hit.data:null;
}

export async function readCachedAvailability(service){
  const hot=peekAvailability(service);
  if(hot)return hot;
  try{
    const raw=await AsyncStorage.getItem(keyFor(service));
    if(!raw)return null;
    const cached=JSON.parse(raw);
    if(!cached?.data||Date.now()-Number(cached.savedAt||0)>TTL)return null;
    memory.set(service,cached);
    return cached.data;
  }catch{return null}
}

export async function fetchAvailability(service,days=21){
  if(!API)return null;
  const r=await fetch(`${API}/api/booking/availability?service=${encodeURIComponent(service)}&days=${days}`);
  const data=await read(r);
  if(!r.ok)throw new Error(typeof data.detail==="string"?data.detail:"Availability could not be loaded.");
  const cached={data,savedAt:Date.now()};
  memory.set(service,cached);
  AsyncStorage.setItem(keyFor(service),JSON.stringify(cached)).catch(()=>{});
  return data;
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
  return Promise.allSettled(SERVICES.map(service=>fetchAvailability(service,days)));
}

export {SERVICES};
