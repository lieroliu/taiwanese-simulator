#!/usr/bin/env python3
"""Build the small county map (pre-2010 counties) and embed it in index.html.

Source: g0v/twgeojson twTown1982.topo.json (town boundaries, 內政部 data),
dissolved into the 24 counties the game uses. Needs shapely>=2 (GEOS 3.12+
for coverage_simplify). Writes data/map/taiwan_counties.json, then replaces
the /*MAP_START*/.../*MAP_END*/ block in index.html.
    python3 tools/build_map.py [path/to/twTown1982.topo.json]
"""
import json,math,os,sys,urllib.request
import shapely,shapely.affinity
from shapely.geometry import Polygon,MultiPolygon
from shapely.ops import unary_union
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL='https://raw.githubusercontent.com/g0v/twgeojson/master/json/twTown1982.topo.json'
OURS=['台北市','台北縣','基隆市','桃園縣','新竹市','新竹縣','苗栗縣','台中市','台中縣','彰化縣','南投縣','雲林縣','嘉義縣','嘉義市','台南縣','台南市','高雄縣','高雄市','屏東縣','宜蘭縣','花蓮縣','台東縣','澎湖縣','金門縣']

src=sys.argv[1] if len(sys.argv)>1 else None
topo=json.load(open(src)) if src else json.load(urllib.request.urlopen(URL))
sc,tr=topo['transform']['scale'],topo['transform']['translate']
arcs=[]
for a in topo['arcs']:
  x=y=0;pts=[]
  for dx,dy in a:x+=dx;y+=dy;pts.append((x*sc[0]+tr[0],y*sc[1]+tr[1]))
  arcs.append(pts)
def ring(ids):
  out=[]
  for i in ids:
    p=arcs[i] if i>=0 else arcs[~i][::-1]
    out.extend(p if not out else p[1:])
  return out
def geom(g):
  polys=[g['arcs']] if g['type']=='Polygon' else g['arcs']
  ps=[]
  for P in polys:
    rs=[ring(r) for r in P]
    if len(rs[0])>=4:ps.append(Polygon(rs[0],rs[1:]).buffer(0))
  return unary_union(ps)

by={}
for g in topo['objects']['layer1']['geometries']:
  c=g['properties']['COUNTYNAME'].replace('臺','台')
  if c in OURS and g.get('arcs'):by.setdefault(c,[]).append(geom(g))
LAT0=23.7;KX=math.cos(math.radians(LAT0))
def proj(g):return shapely.transform(g,lambda a:a*[KX,-1])
cty={c:proj(unary_union(v).buffer(0)) for c,v in by.items()}
# Kinmen sits far west; move it into an inset box at the top-left.
KM=cty['金門縣'];kb=KM.bounds
cty['金門縣']=shapely.affinity.translate(KM,119.55*KX-kb[0],-25.15-kb[1])
names=list(cty)
simp=shapely.coverage_simplify([cty[c] for c in names],0.012)
def keep(g,c):
  parts=list(g.geoms) if isinstance(g,MultiPolygon) else [g]
  big=max(p.area for p in parts)
  # drop tiny islets; keep the main islands of 澎湖/金門 and 綠島/蘭嶼
  return [p for p in parts if p.area>=big*(0.004 if c in('澎湖縣','金門縣','台東縣') else 0.02)]
allb=unary_union([unary_union(keep(g,c)) for g,c in zip(simp,names)]).bounds
W=200;S=W/(allb[2]-allb[0]);PAD=7
def path(parts):
  d=''
  for p in parts:
    for r in [p.exterior]+list(p.interiors):
      pts=[(round((x-allb[0])*S+PAD,1),round((y-allb[1])*S+PAD,1)) for x,y in r.coords[:-1]]
      d+='M'+'L'.join(f'{x:g} {y:g}' for x,y in pts)+'Z'
  return d
out={'w':round(W+PAD*2),'h':round((allb[3]-allb[1])*S+PAD*2),'c':{}}
for g,c in zip(simp,names):
  parts=keep(g,c);ctr=max(parts,key=lambda p:p.area).representative_point()
  out['c'][c]={'d':path(parts),'x':round((ctr.x-allb[0])*S+PAD,1),'y':round((ctr.y-allb[1])*S+PAD,1)}
kb=unary_union(keep(simp[names.index('金門縣')],'金門縣')).bounds
out['inset']=[round((kb[0]-allb[0])*S+PAD-5,1),round((kb[1]-allb[1])*S+PAD-5,1),round((kb[2]-kb[0])*S+10,1),round((kb[3]-kb[1])*S+10,1)]
# Matsu (連江縣) is not in twTown1982; draw its three main island groups (南竿, 北竿, 東引) by hand in a second inset.
out['c']['連江縣']={'d':'M49 12.2L51.6 11.6L52.4 13.2L51 14.6L48.8 14Z M53.6 8.6L56 8.2L56.6 9.6L54.4 10.4Z M61.4 4.6L63 4.4L63.4 5.6L61.8 6Z','x':50.6,'y':13.1}
out['inset2']=[45.6,2.2,20.6,15.2]
os.makedirs(os.path.join(ROOT,'data','map'),exist_ok=True)
js=json.dumps(out,ensure_ascii=False,separators=(',',':'))
open(os.path.join(ROOT,'data','map','taiwan_counties.json'),'w').write(js)
p=os.path.join(ROOT,'index.html');h=open(p).read()
if '/*MAP_START*/' in h:
  import re
  h=re.sub(r'/\*MAP_START\*/.*?/\*MAP_END\*/',lambda m:'/*MAP_START*/const TWMAP='+js+';/*MAP_END*/',h,flags=re.S)
  open(p,'w').write(h)
print('counties',len(out['c']),'size',len(js),'viewBox',out['w'],out['h'])
