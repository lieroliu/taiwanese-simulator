#!/usr/bin/env python3
"""Re-embed data/stats and content/*.json into index.html.

The game is one self-contained HTML file. Run this after editing anything in
data/stats/ or content/, then run the tests in tests/.
    python3 tools/build.py
"""
import json,re,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

D=os.path.join(ROOT,'data','stats')+'/'
OURS=['台北市','台北縣','基隆市','桃園縣','新竹市','新竹縣','苗栗縣','台中市','台中縣','彰化縣','南投縣','雲林縣','嘉義縣','嘉義市','台南縣','台南市','高雄縣','高雄市','屏東縣','宜蘭縣','花蓮縣','台東縣','澎湖縣','金門縣']
def mapc(c):
  c=c.replace('臺','台')
  m={'新北市':['台北縣'],'桃園市':['桃園縣'],'台中市':['台中市','台中縣'],'台南市':['台南市','台南縣'],'高雄市':['高雄市','高雄縣'],'桃園縣':['桃園縣'],'全台':OURS}
  if c in m:return m[c]
  return [c] if c in OURS else []
ev=[]
R=json.load(open(D+'region_events.json'))['tables']
dis=R['disasters_by_county'];dis=dis.get('data',dis)
seen={}
for k,v in dis.items():
  if not isinstance(v,list):continue
  for x in v:
    key=(x['year'],x.get('month'),x['event'])
    seen.setdefault(key,{'y':x['year'],'m':x.get('month') or 7,'k':'d','ty':x['type'],'ev':re.sub(r'[（(].*?[)）]','',x['event']),'dn':x.get('deaths_national') or 0,'c':set()})
    seen[key]['c'].update(mapc(k))
loc=R['local_events_by_county'];loc=loc.get('data',loc)
for k,v in loc.items():
  if not isinstance(v,list):continue
  for x in v:
    key=(x['year'],x.get('month'),x['event'])
    seen.setdefault(key,{'y':x['year'],'m':x.get('month') or 6,'k':'l','ty':x['type'],'ev':re.sub(r'[（(].*?[)）]','',x['event']),'c':set()})
    seen[key]['c'].update(mapc(k))
A=json.load(open(D+'region_access.json'))['tables']['transport_milestones']['data']
for y,v in A.items():
  for x in v:
    if '典禮' in x['event']:continue
    e=re.sub(r'[（(].*?[)）]','',x['event']).split('；')[0].strip()
    m=int(x['date'][5:7]) if len(x.get('date',''))>=7 else 6
    key=(int(y),m,e);seen.setdefault(key,{'y':int(y),'m':m,'k':'t','ty':'交通','ev':e,'c':set()});seen[key]['c'].update(sum([mapc(c) for c in x['counties']],[]))
ev=[dict(v,c=sorted(v['c'])) for v in seen.values() if v['c']]
E=json.load(open(D+'region_economy.json'))['tables']['employment_by_industry_by_county']['data']['1990']['by_historical_unit']
tot={'a':0,'m':0,'c':0,'p':0};n=0
W={}
for k,v in E.items():
  for c in mapc(k):W[c]=[v['agriculture'],v['manufacturing']+v['construction']*.5,v['commerce'],v['public_education_health']]
nat=[sum(x[i] for x in W.values())/len(W) for i in range(4)]
PJ={c:[round(x[i]/nat[i],2) for i in range(4)] for c,x in W.items()}
block='/*REG_START*/const REGD='+json.dumps(ev,ensure_ascii=False)+';const PJW='+json.dumps(PJ,ensure_ascii=False)+';/*REG_END*/'

reg_block='/*REG_START*/const REGD='+json.dumps(ev,ensure_ascii=False)+';const PJW='+json.dumps(PJ,ensure_ascii=False)+';/*REG_END*/'
C=os.path.join(ROOT,'content')+'/'
def J(f,d):
  try:return json.load(open(C+f))
  except Exception as e:print('skip',f,e);return d
hv={k:v for k,v in J('history_variants.json',{}).items() if not k.startswith('_')}
ec=J('early_childhood.json',[])
rm={k:v for k,v in J('romance.json',{}).items() if not k.startswith('_')}
eth=J('ethnic.json',{})
eth={k:v for k,v in eth.items() if not k.startswith('_')}
for v in eth.get('lens',{}).get('_any',[]):
  assert v.get('match'),'ethnic.json lens._any entries need a match regex: '+v['text']
ids=[e['id'] for e in eth.get('events',[])]
assert len(ids)==len(set(ids)),'ethnic.json has duplicate event ids'
eth_block='/*ETH_START*/const ETHC='+json.dumps(eth,ensure_ascii=False)+';/*ETH_END*/'
ct_block='/*CT_START*/const HVP='+json.dumps(hv,ensure_ascii=False)+';const EC='+json.dumps(ec,ensure_ascii=False)+';const RM='+json.dumps(rm,ensure_ascii=False)+';/*CT_END*/'
p=os.path.join(ROOT,'index.html');h=open(p).read()
fn_block='/*FN_START*/const FUN='+json.dumps(J('funny.json',{}).get('events',[]),ensure_ascii=False)+',NEAR='+json.dumps(J('near_death.json',{}).get('events',[]),ensure_ascii=False)+',DCF='+json.dumps({k:v for k,v in J('death_causes.json',{'flavor':{},'addWeights':[]}).items() if not k.startswith('_')},ensure_ascii=False)+',DGR='+json.dumps(J('danger.json',{}).get('events',[]),ensure_ascii=False)+';/*FN_END*/'
kin={k:v for k,v in J('kin_advice.json',{}).items() if not k.startswith('_')}
kin_block='/*KIN_START*/const KIN='+json.dumps(kin,ensure_ascii=False)+';/*KIN_END*/'
for tag,blk in [('REG',reg_block),('CT',ct_block),('FN',fn_block),('ETH',eth_block),('KIN',kin_block)]:
  assert '/*%s_START*/'%tag in h, tag
  h=re.sub(r'/\*%s_START\*/.*?/\*%s_END\*/'%(tag,tag),lambda m:blk,h,flags=re.S)
open(p,'w').write(h)
print('region events',len(ev),'| history',len(hv),'events | early',len(ec),'| romance',{k:len(v) for k,v in rm.items()},'| ethnic events',len(eth.get('events',[])),'lens',sum(len(v) for v in eth.get('lens',{}).values()))
