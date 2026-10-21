import json, math, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from skimage.graph import route_through_array
from shapely.geometry import LineString, shape
hi=json.load(open('hi-raja.json'))
LON0,LON1,LAT0,LAT1=129.3,131.4,-2.6,0.4; R=0.0025
NX=int((LON1-LON0)/R); NY=int((LAT1-LAT0)/R)
img=Image.new('L',(NX,NY),0); d=ImageDraw.Draw(img)
topx=lambda lo,la:((lo-LON0)/R,(LAT1-la)/R)
for poly in hi['coordinates']:
    d.polygon([topx(x,y) for x,y in poly[0]],fill=1)
land=np.array(img,bool)
near=ndimage.binary_dilation(land,iterations=2)
cost=np.where(land,1e6,np.where(near,4.0,1.0))
def cell(la,lo): return int((LAT1-la)/R), int((lo-LON0)/R)
def ll(r,c): return [round(LAT1-(r+.5)*R,5), round(LON0+(c+.5)*R,5)]
STOPS=json.load(open('stops2.json'))
dist=ndimage.distance_transform_edt(~land)
snapped={}
for k,(la,lo) in STOPS.items():
    r,c=cell(la,lo)
    if dist[r,c]<2.5:
        rr,cc=np.where(dist>=2.5); i=np.argmin((rr-r)**2+(cc-c)**2); r,c=rr[i],cc[i]
    snapped[k]=ll(r,c)
    if snapped[k]!=[la,lo] and abs(snapped[k][0]-la)+abs(snapped[k][1]-lo)>0.004: print('snap',k,(la,lo),'->',snapped[k])
pairs=json.load(open('pairs.json'))
legs={}
for a,b in pairs:
    p,_=route_through_array(cost,cell(*snapped[a]),cell(*snapped[b]),fully_connected=True,geometric=True)
    pts=[ll(r,c) for r,c in p]; pts[0]=snapped[a]; pts[-1]=snapped[b]
    ls=LineString([(q[1],q[0]) for q in pts]).simplify(0.006)
    co=list(ls.coords)
    for _ in range(3):
        nc=[co[0]]
        for (x0,y0),(x1,y1) in zip(co[:-1],co[1:]):
            nc+= [(0.75*x0+0.25*x1,0.75*y0+0.25*y1),(0.25*x0+0.75*x1,0.25*y0+0.75*y1)]
        nc.append(co[-1])
        ok=all(not land[cell(y,x)] for x,y in nc)
        if not ok: break
        co=nc
    # densify
    out=[]
    step=0.004
    for (x0,y0),(x1,y1) in zip(co[:-1],co[1:]):
        n=max(1,int(math.hypot(x1-x0,y1-y0)/step))
        for i in range(n): t=i/n; out.append([round(y0+(y1-y0)*t,5),round(x0+(x1-x0)*t,5)])
    out.append([round(co[-1][1],5),round(co[-1][0],5)])
    legs[a+'-'+b]=out
    nm=sum(math.dist(out[i],out[i+1]) for i in range(len(out)-1))*60
    print(a,b,len(out),round(nm,1),'nm')
json.dump({'stops':snapped,'legs':legs},open('SR.json','w'),separators=(',',':'))
