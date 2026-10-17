#!/usr/bin/env python3
"""Build index.html from src/.

The game ships as one self-contained HTML file, but it is written as many
files under src/ (see CONTRIBUTING.md). This script
  1. turns data/stats and content/*.json into the generated src/data/*.js
     blocks, then
  2. joins src/page.html and every file it includes into index.html.
Run it after editing anything in src/, data/stats/ or content/, then run the
tests in tests/.
    python3 tools/build.py           # regenerate data blocks + index.html
    python3 tools/build.py --check   # exit 1 if index.html is not what src/ builds
"""
import json,re,os,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

D=os.path.join(ROOT,'data','stats')+'/'
OURS=['台北市','台北縣','基隆市','桃園縣','新竹市','新竹縣','苗栗縣','台中市','台中縣','彰化縣','南投縣','雲林縣','嘉義縣','嘉義市','台南縣','台南市','高雄縣','高雄市','屏東縣','宜蘭縣','花蓮縣','台東縣','澎湖縣','金門縣','連江縣']
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
fn_block='/*FN_START*/const FUN='+json.dumps(J('funny.json',{}).get('events',[]),ensure_ascii=False)+',NEAR='+json.dumps(J('near_death.json',{}).get('events',[]),ensure_ascii=False)+',DCF='+json.dumps({k:v for k,v in J('death_causes.json',{'flavor':{},'addWeights':[]}).items() if not k.startswith('_')},ensure_ascii=False)+',DGR='+json.dumps(J('danger.json',{}).get('events',[]),ensure_ascii=False)+';/*FN_END*/'
kin={k:v for k,v in J('kin_advice.json',{}).items() if not k.startswith('_')}
kin_block='/*KIN_START*/const KIN='+json.dumps(kin,ensure_ascii=False)+';/*KIN_END*/'
pop_block='/*POP_START*/const POP='+json.dumps(J('popculture.json',{}).get('items',[]),ensure_ascii=False)+';/*POP_END*/'
strip=lambda d:{k:(strip(v) if isinstance(v,dict) else v) for k,v in d.items() if not k.startswith('_')} if isinstance(d,dict) else d
pt_block='/*PT_START*/const PT='+json.dumps(strip(J('partners.json',{})),ensure_ascii=False)+';/*PT_END*/'
af_block='/*AF_START*/const AF='+json.dumps(strip(J('affair.json',{})),ensure_ascii=False)+';/*AF_END*/'
sx_block='/*SX_START*/const SX='+json.dumps(strip(J('sexuality.json',{})),ensure_ascii=False)+';/*SX_END*/'
# official figures for "你這一屆" on the end screen and the diary's 同一年 lines (no simulation)
def T(f,t):return json.load(open(D+f))['tables'][t]['data']
W=T('income_prices.json','avg_monthly_earnings');LE=T('mortality.json','life_expectancy');MA=T('marriage_divorce.json','mean_age_first_marriage')
off={'births':{y:v['total'] for y,v in T('births.json','births_total_and_sex_ratio').items()},
 'uni':T('education.json','univ_admission_rate'),
 'mar':{y:{'M':v['male'],'F':v['female']} for y,v in MA.items() if v.get('male') and v.get('female')},
 'tfr':T('births.json','total_fertility_rate'),
 'le':{y:{'M':v['male'],'F':v['female']} for y,v in LE.items() if v.get('male') and v.get('female')},
 'wage':{y:v.get('total') or v.get('industry_sector_total') for y,v in W.items() if v.get('total') or v.get('industry_sector_total')}}
off={k:{int(y):v for y,v in d.items()} for k,d in off.items()}
def T(f,t):return json.load(open(D+f))['tables'][t]['data']
# occupation pay: regular wage relative to the all-occupation average, and total/regular (bonus share) relative to the average
OC=json.load(open(D+'occupations.json'))['tables']['by_occupation']['data'];oc0=OC['總計']
occ={k:[round(v['regular']/oc0['regular'],3),round((v['total']/v['regular'])/(oc0['total']/oc0['regular']),3)] for k,v in OC.items() if v['regular']}
BW=T('income_prices.json','basic_wage');minw={}
for k in sorted(BW):
  if BW[k].get('monthly'):minw[int(k[:4])+(1 if int(k[5:7])>7 else 0)]=BW[k]['monthly']
occ_block='/*OCC_START*/const OCCW='+json.dumps(occ,ensure_ascii=False,separators=(',',':'))+',MINW='+json.dumps(minw,separators=(',',':'))+';/*OCC_END*/'
# regional jobs: county industry mix relative to Taiwan (人力資源調查/普查) and county household disposable income relative to national (家庭收支調查)
EB=json.load(open(D+'region_economy.json'))['tables']['employment_by_industry_by_county']['data']
def indv(v):return [v['agriculture'],v['manufacturing'],v['commerce'],v['public_education_health'],v['other_services']]
def mapy(k,old):
  c=k.replace('臺','台')
  return [c] if old and c in OURS else mapc(k)
jri={}
for y,unit in [('1990','by_historical_unit'),('1995','by_historical_unit'),('2020','by_current_22')]:
  rows=EB[y][unit];nat=indv(rows['臺灣地區(total)']);r={}
  for k,v in rows.items():
    for c in mapy(k,unit=='by_historical_unit'):r[c]=[round(x/n,2) if n else 1 for x,n in zip(indv(v),nat)]
  for c in ['金門縣','連江縣']:r.setdefault(c,r['澎湖縣'])
  jri[int(y)]=r
HI=T('income_prices.json','household_income_by_county');jrc={}
for y in sorted(HI,key=int):
  v=HI[y];n=v['national'];r={}
  for k,x in v.items():
    if k=='national' or not x:continue
    for c in mapy(k,int(y)<=2010):r[c]=round(x/n,3)
  for a,b in [('新竹市','新竹縣'),('嘉義市','嘉義縣'),('金門縣','澎湖縣'),('連江縣','澎湖縣')]:
    if a not in r and b in r:r[a]=r[b]
  jrc[int(y)]=r
jr_block='/*JR_START*/const JRI='+json.dumps(jri,ensure_ascii=False,separators=(',',':'))+',JRC='+json.dumps(jrc,ensure_ascii=False,separators=(',',':'))+';/*JR_END*/'
off_block='/*OFF_START*/const OFF='+json.dumps(off,ensure_ascii=False,separators=(',',':'))+';/*OFF_END*/'
SRC=os.path.join(ROOT,'src')
INC=re.compile(r'^(?://|/\*)@include (\S+?)(?:\*/)?$',re.M)
def assemble(path='page.html',seen=()):
  """Replace every line that is just `//@include x` or `/*@include x*/` with the file src/x."""
  assert path not in seen,'include loop: '+' -> '.join(seen+(path,))
  t=open(os.path.join(SRC,path),encoding='utf-8').read()
  def inc(m):
    body=assemble(m.group(1),seen+(path,))
    return body[:-1] if body.endswith('\n') else body
  return INC.sub(inc,t)
if __name__=='__main__':
  out=os.path.join(ROOT,'index.html')
  if '--check' in sys.argv:
    ok=assemble()==open(out,encoding='utf-8').read()
    print('index.html is up to date' if ok else 'index.html differs from src/: run python3 tools/build.py');sys.exit(0 if ok else 1)
  for tag,blk in [('SX',sx_block),('REG',reg_block),('CT',ct_block),('FN',fn_block),('ETH',eth_block),('KIN',kin_block),('POP',pop_block),('PT',pt_block),('AF',af_block),('OFF',off_block),('OCC',occ_block),('JR',jr_block)]:
    open(os.path.join(SRC,'data',tag.lower()+'.js'),'w',encoding='utf-8').write(blk+'\n')
  open(out,'w',encoding='utf-8').write(assemble())
  print('region events',len(ev),'| history',len(hv),'events | early',len(ec),'| romance',{k:len(v) for k,v in rm.items()},'| ethnic events',len(eth.get('events',[])),'lens',sum(len(v) for v in eth.get('lens',{}).values()))
