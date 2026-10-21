# Builds the two Silolona ARCX journey pages on the house ARCX journey template (Dragons & Corals engine):
#   /journeys/raja-ampat-karst-and-mantas/        ARCX · divers and snorkellers together
#   /journeys/raja-ampat-dive-karst-and-mantas/   ARCX Dive · divers-only charter, own date
import json, re, html, math, os, shutil, sys
from shapely.geometry import shape, box, Polygon
E = lambda s: html.escape(str(s), quote=True)
HERE = os.path.dirname(os.path.abspath(__file__)) + "/"
REPO = "/home/claude/arcterraexpeditions/"
TPL = REPO + "journeys/komodo-dragons-and-corals/"
SR = json.load(open(HERE + "SR.json"))
P = SR["stops"]
HI = json.load(open(HERE + "hi-raja.json"))
HIP = [Polygon(p[0]) for p in HI["coordinates"]]

CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/"
IMG = {  # key: (public_id, alt, credit)
 "karst-hero": ("arcterra/destinations/raja-ampat/silolona-raja-ampat-hero", "Forested karst islets rising from a turquoise lagoon in Raja Ampat"),
 "karst-aerial": ("arcterra/destinations/raja-ampat/silolona-raja-ampat-social", "Aerial view of karst islands and channels in Raja Ampat with a boat below"),
 "piaynemo": ("arcterra/destinations/raja-ampat/silolona-raja-ampat-02", "The viewpoint over the karst islands and lagoons of Piaynemo"),
 "night-dive": ("arcterra/destinations/raja-ampat/silolona-raja-ampat-03", "A diver with a torch beside a sea anemone on a night dive"),
 "clownfish": ("arcterra/destinations/raja-ampat/silolona-raja-ampat-04", "A clownfish among the tentacles of its anemone"),
 "reef-swim": ("arcterra/destinations/raja-ampat/silolona-raja-ampat-05", "A swimmer over a hard-coral reef in clear blue water"),
 "fleet": ("arcterra/vessels/silolona/silolona-fleet-banner", "Silolona and her sister Si Datu Bua at anchor under sail"),
 "silolona": ("arcterra/vessels/silolona/silolona-01", "The phinisi Silolona under her dark sails among karst islands"),
 "silolona-2": ("arcterra/vessels/silolona/silolona-02", "Silolona at anchor, her two masts rigged with dark sails"),
 "manta-a": ("arcterra/vessels/silolona/instagram/activity-reef-conservation-dive", "A manta ray banking over the reef in blue water"),
 "manta-b": ("arcterra/vessels/silolona/instagram/activity-manta-ray", "A manta ray seen from below, gliding overhead"),
 "under-sail": ("arcterra/vessels/silolona/instagram/silolona-si-datu-bua-under-sail", "Silolona and Si Datu Bua sailing together off a green coast"),
 "crew": ("arcterra/vessels/silolona/instagram/crew-traditional-dress", "Silolona crew and local hosts in traditional Papuan dress"),
 "bay-aerial": ("arcterra/vessels/silolona/instagram/island-bay-aerial", "Green islands and a sheltered bay seen from above"),
}
def url(k, w=1600):
    return f"{CLD}c_limit,w_{w}/f_auto/q_auto/{IMG[k][0]}"
CREDIT = "© Silolona Sojourns"

NAMES = {"sor":"Sorong","yen":"Yenbuba Bay · Mansuar","kri":"Cape Kri","arb":"Arborek","mas":"Manta Sandy","blu":"Blue Magic","pia":"Piaynemo",
         "way":"Wayag","fam":"Fam Islands","mm":"Magic Mountain · Misool","bal":"Balbulol","boo":"Boo Windows","fia":"Fiabacet","dar":"Daram"}
OVERNIGHT = ["yen","arb","blu","pia","way","mm","bal","fia","sor"]
STOPIMG = {"sor":("silolona","Silolona · Sorong"),"yen":("reef-swim","Yenbuba jetty reef"),"kri":("clownfish","Cape Kri"),"arb":("crew","Arborek village"),
           "mas":("manta-b","Mantas · Manta Sandy"),"blu":("manta-a","Blue Magic"),"pia":("piaynemo","Piaynemo viewpoint"),"way":("karst-hero","The karst of Wayag"),
           "fam":("reef-swim","Fam Islands reefs"),"mm":("manta-a","Mantas · Magic Mountain"),"bal":("karst-aerial","Balbulol lagoon"),"boo":("night-dive","Boo Windows"),
           "fia":("clownfish","Fiabacet"),"dar":("bay-aerial","Daram"),"sea":("under-sail","Under sail")}

def build(V):
    t = open(TPL + "index.html").read()
    i = t.index('<script src="../../vendor/d3.min.js">'); j = t.index('<script>', i); k = t.index('</script>', j)
    js = t[j:k]
    # ---------- engine data ----------
    a = js.index('var SR='); st = js.index('{', a); depth = 0
    for n, ch in enumerate(js[st:]):
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: end = st + n + 1; break
    js = js[:a] + 'var SR=' + json.dumps({"stops": P, "legs": SR["legs"]}, separators=(',', ':')) + js[end:]
    def rep(old, new, cnt=1):
        nonlocal js
        c = js.count(old)
        assert c >= 1, ("missing", old[:80])
        if cnt == 1: assert c == 1, ("multi", c, old[:80])
        js = js.replace(old, new)
    js = re.sub(r'var NAMES=\{.*?\};', 'var NAMES=' + json.dumps(NAMES, ensure_ascii=False) + ';', js, count=1, flags=re.S)
    days_js = [{"title": d["title"], "stops": d["stops"], "text": d["where"], "tags": d["tags"], "plan": d["plan"], "img": d["img"]} for d in V["days"]]
    js = re.sub(r'var DAYS=\[.*?\];\nvar ND', lambda m: 'var DAYS=' + json.dumps(days_js, ensure_ascii=False) + ';\nvar ND', js, count=1, flags=re.S)
    rep('var OVERNIGHT={kal:1,pad:1,bmo:1,ban:1,pap:1};', 'var OVERNIGHT={' + ','.join(f'{k}:1' for k in OVERNIGHT) + '};')
    rep("var DPS=[-8.7482,115.1675],LBJ=[-8.4866,119.8890];", "var DPS=[-6.1256,106.6559],LBJ=[-0.8918,131.2868];")
    rep("ROUTE=[P.lb]", "ROUTE=[P.sor]"); rep("var cur='lb'", "var cur='sor'"); rep("if(sg.dir==='out')o.ship=P.lb", "if(sg.dir==='out')o.ship=P.sor")
    rep("(it[1]==='ban'?3.0:", "(it[1]==='way'?3.0:")
    rep("cam={phi:-6,lam:88,", "cam={phi:-3,lam:110,"); rep("[-6,88+22*esine(x)]", "[-3,110+20*esine(x)]"); rep("slerp(ah,[-6,88],e)", "slerp(ah,[-3,110],e)")
    rep("ISLB=[-8.70,-8.36,119.30,119.93]", "ISLB=[-2.35,0.25,129.95,131.3]")
    rep("if(inb([119.2,120.0,-8.76,-8.30]))return 4800*1.4*f;if(inb([118.6,120.6,-9.3,-7.8]))return 1536*1.5*f;",
        "if(inb([129.85,131.35,-2.4,0.3]))return 4800*1.4*f;if(inb([129.3,131.4,-2.6,0.4]))return 1536*1.5*f;")
    rep("Math.cos(-8.5*D)", "Math.cos(-1.1*D)")
    js = re.sub(r"var PLACES=\[.*?\];", lambda m: "var PLACES=[" + ",".join([
        "{n:'JAVA',c:[-7.2,110.0],k:[30,300]}","{n:'SULAWESI',c:[-2.0,120.5],k:[30,300]}","{n:'HALMAHERA',c:[0.9,128.0],k:[30,420]}","{n:'SERAM',c:[-3.15,129.6],k:[45,420]}",
        "{n:'PAPUA',c:[-1.6,133.2],k:[30,420]}","{n:'Laut Banda',c:[-5.0,127.5],it:1,k:[30,330]}","{n:'Laut Seram',c:[-2.6,128.3],it:1,k:[45,420]}","{n:'Samudra Pasifik',c:[1.6,132.5],it:1,k:[30,330]}",
        "{n:'WAIGEO',c:[-0.15,130.85],k:[420,5000]}","{n:'BATANTA',c:[-0.86,130.6],k:[420,5000]}","{n:'SALAWATI',c:[-1.07,130.95],k:[420,5000]}","{n:'MISOOL',c:[-1.92,129.95],k:[420,5000]}",
        "{n:'GAM',c:[-0.47,130.52],k:[900,5000]}","{n:'Selat Dampier',c:[-0.67,130.75],it:1,k:[600,5000]}","{n:'Laut Halmahera',c:[-0.2,129.55],it:1,k:[420,3000]}","{n:'EQUATOR · 0°',c:[0.02,129.62],it:1,k:[420,5000]}"]) + "];", js, count=1, flags=re.S)
    js = re.sub(r"var NOTES=\{.*?\};", lambda m: "var NOTES=" + json.dumps(V["notes"], ensure_ascii=False) + ";", js, count=1, flags=re.S)
    js = re.sub(r"var STOPIMG=\{.*?\};", lambda m: "var STOPIMG=" + json.dumps({k: [a, b] for k, (a, b) in STOPIMG.items()}, ensure_ascii=False) + ";", js, count=1, flags=re.S)
    js = re.sub(r"var HL=\[.*?\];", lambda m: "var HL=" + json.dumps(V["hl"], ensure_ascii=False) + ";", js, count=1, flags=re.S)
    rep("var DAYC=['#1D4E7E','#2A6F86','#3C8A8A','#22605A','#4D78A6','#2C4F78','#3F8EA8','#183C58'];", "var DAYC=" + json.dumps(V["dayc"]) + ";")
    # images from Cloudinary
    imap = {k: url(k, 900) for k in IMG}
    rep("var STOPIMG=", "var IMAP=" + json.dumps(imap) + ";function IMGURL(k){return IMAP[k]||('img/'+k+'.jpg')}\nvar STOPIMG=")
    js = js.replace("'img/'+m[0]+'.jpg'", "IMGURL(m[0])").replace("'img/'+img+'.jpg'", "IMGURL(img)")
    rep("var img=g.fl?'db-h5'", "var img=g.fl?'silolona'")
    rep("'Fly in · Jakarta → Ambon':'Fly out · Ambon → Jakarta'", "'Fly in · Jakarta → Sorong':'Fly out · Sorong → Jakarta'")
    # card texts
    rep("title='Dragons & Corals';stop='Komodo National Park, Indonesia';text='Six days aboard the phinisi Dunia Baru, Labuan Bajo to Labuan Bajo. Press pause at any time, or tap a day on the timeline.';tags=['ARCX','AX·011/27']",
        f"title={json.dumps(V['short'])};stop='Raja Ampat, West Papua, Indonesia';text={json.dumps(V['spin'])};tags=['{V['brand']}','{V['id']}']")
    rep("title=fin?'Arrival — Bali to Komodo':'Onward — Komodo to Bali';stop=fin?'Denpasar (DPS) → Komodo Airport (LBJ)':'Komodo Airport (LBJ) → Denpasar (DPS)';",
        "title=fin?'Arrival — Jakarta to Sorong':'Onward — Sorong to Jakarta';stop=fin?'Jakarta (CGK) → Sorong (SOQ)':'Sorong (SOQ) → Jakarta (CGK)';")
    js = re.sub(r"text=fin\?'Most guests connect through Bali:.*?':'After breakfast and farewells, the crew escorts you to Komodo Airport for your onward flight\.';tags=fin\?\['DPS → LBJ','≈ 1 h 10'\]:\['LBJ → DPS','≈ 1 h 10'\];tk=fin\?'fin':'fout';ik=fin\?'lb':'sea';",
        "text=fin?'Most guests fly to Sorong through Jakarta or Makassar, arriving the day before. The crew meets you at the airport and takes you to the harbour.':'After breakfast and farewells, the crew takes you to Sorong airport for your onward flight.';tags=fin?['CGK → SOQ','≈ 4 h 30']:['SOQ → CGK','≈ 4 h 30'];tk=fin?'fin':'fout';ik=fin?'sor':'sea';", js, count=1, flags=re.S)
    rep("stop='Dragons & Corals · AX·011/27';text='Six days, '+Math.round(NM)+' nautical miles and '+(Object.keys(P).length)+' anchorages through Komodo National Park aboard Dunia Baru.';tags=[Math.round(NM)+' NM',Object.keys(P).length+' anchorages','6 days · 5 nights']",
        f"stop={json.dumps(V['short'] + ' · ' + V['id'])};text='Eleven days, '+Math.round(NM)+' nautical miles and '+(Object.keys(P).length)+' anchorages through Raja Ampat aboard Silolona.';tags=[Math.round(NM)+' NM',Object.keys(P).length+' anchorages','11 days · 10 nights']")
    rep("' — embark Dunia Baru'", "' — embark Silolona'")
    js = js.replace("'AX·011 · '", f"'{V['id'].split('/')[0]} · '").replace("'AX·011 · KOMODO'", f"'{V['id'].split('/')[0]} · RAJA AMPAT'")
    # overview charts
    a = js.index("if(a)a.insertAdjacentHTML('afterbegin',chartSVG({"); b = js.index("/* ---------- boot ---------- */")
    lab = {"sor":[-12,-14,'end'],"yen":[12,-16,'start'],"kri":[14,20,'start'],"arb":[-10,-16,'end'],"mas":[-12,22,'end'],"blu":[10,-16,'start'],"pia":[-14,-10,'end'],
           "way":[14,6,'start'],"fam":[-14,22,'end'],"mm":[-14,8,'end'],"bal":[14,-12,'start'],"boo":[14,20,'start'],"fia":[-14,20,'end'],"dar":[14,6,'start']}
    over = ("if(a)a.insertAdjacentHTML('afterbegin',chartSVG({bb:[129.82,131.38,-2.36,0.3],rings:5,gap:7,step:.25,aria:" + json.dumps("Overview chart of the " + V['short'] + " route through Raja Ampat") + ",\n    lab:" + json.dumps(lab) +
            ",\n    names:[{t:'WAIGEO',c:[-0.18,130.75],s:20},{t:'BATANTA',c:[-0.85,130.62],s:18},{t:'SALAWATI',c:[-1.12,130.95],s:18},{t:'MISOOL',c:[-1.92,129.95],s:20},{t:'Laut Seram',c:[-1.55,130.55],s:20,it:1},{t:'EQUATOR',c:[0.04,129.95],s:14,it:1}]}));\n"
            "  if(b)b.insertAdjacentHTML('afterbegin',chartSVG({bb:[130.15,130.75,-2.32,-1.95],rings:6,gap:9,step:.1,aria:'Detail chart of the Misool karst: Magic Mountain, Balbulol, Boo Windows, Fiabacet and Daram',\n"
            "    lab:{mm:[-14,8,'end'],bal:[14,-12,'start'],boo:[14,20,'start'],fia:[-14,20,'end'],dar:[14,6,'start']},\n    names:[{t:'MISOOL',c:[-1.99,130.2],s:20}]}))}\n\n")
    js = js[:a] + over + js[b:]
    # textures
    rep("Promise.all([loadJSON('data/reg-sunda.json'),loadJSON('data/hi-komodo.json')])", "Promise.all([loadJSON('data/reg-papua.json'),loadJSON('data/hi-raja.json')])")
    rep("buildTex('reg',data.reg,[110.5,123.5,-15,-2]", "buildTex('reg',data.reg,[121,140.5,-7.5,2.4]")
    rep("buildTex('det',data.hi,[118.6,120.6,-9.3,-7.8]", "buildTex('det',data.hi,[129.3,131.4,-2.6,0.4]")
    rep("buildTex('close',data.hi,[119.2,120.0,-8.76,-8.30]", "buildTex('close',data.hi,[129.85,131.35,-2.4,0.3]")
    js = js.replace("ROUTEC='#1D4E7E'", f"ROUTEC='{V['routec']}'")
    t = t[:j] + js + t[k:]

    # ---------- page body ----------
    t = re.sub(r"<title>.*?</title>", f"<title>{E(V['title'])}</title>", t, count=1)
    t = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{E(V["desc"])}">', t, count=1)
    t = t.replace('<section class="hero" id="globeHero" aria-label="Engraved chart following the Dragons and Corals voyage through Komodo National Park">',
                  f'<section class="hero" id="globeHero" aria-label="Engraved chart following the {E(V["short"])} voyage through Raja Ampat">')
    t = t.replace('aria-label="Engraved chart: the phinisi Dunia Baru sails from Labuan Bajo through Komodo National Park and back, day by day"',
                  'aria-label="Engraved chart: the phinisi Silolona sails from Sorong north to Wayag and south to Misool, day by day"')
    t = t.replace('<div class="cap">Ocean Expeditions · AX·011/27</div>', f'<div class="cap">{E(V["capline"])}</div>')
    t = t.replace('<b id="sLat">08°29.78′S</b>', '<b id="sLat">00°52.20′S</b>').replace('<b id="sLon">119°53.26′E</b>', '<b id="sLon">131°14.10′E</b>')
    t = t.replace('<span id="cDay">DAY 01 / 06 · 08:30</span>', '<span id="cDay">DAY 01 / 11 · 08:30</span>')
    t = t.replace('<img class="L on" src="img/db-h5.jpg" alt="">', f'<img class="L on" src="{url("silolona",900)}" alt="">')
    t = t.replace('<span class="cc" id="cCap">Dunia Baru · Labuan Bajo</span><span class="cs" id="cStamp">AX·011 · KOMODO</span>', f'<span class="cc" id="cCap">Silolona · Sorong</span><span class="cs" id="cStamp">{V["id"].split("/")[0]} · RAJA AMPAT</span>')
    t = t.replace('<h2 id="cTitle">Dragons &amp; Corals</h2>', f'<h2 id="cTitle">{E(V["short"])}</h2>').replace('<div class="stop" id="cStop">Komodo National Park, Indonesia</div>', '<div class="stop" id="cStop">Raja Ampat, West Papua, Indonesia</div>')
    t = t.replace('<p id="cText">Six days aboard the phinisi Dunia Baru, Labuan Bajo to Labuan Bajo. Press pause at any time, or tap a day on the timeline.</p>', f'<p id="cText">{E(V["spin"])}</p>')
    t = t.replace('<div class="tags" id="cTags"><span>ARCX</span><span>AX·011/27</span></div>', f'<div class="tags" id="cTags"><span>{V["brand"]}</span><span>{V["id"]}</span></div>').replace('<div class="log" id="cLog">LOG · AX·011</div>', f'<div class="log" id="cLog">LOG · {V["id"].split("/")[0]}</div>')
    t = t.replace("SPACE play · 1–8 day", "SPACE play · 1–9 day")
    # replace nameband + main + enquiry + footer + bake + ld
    a = t.index('<section class="nameband"'); b = t.index('<script src="../../vendor/d3.min.js">')
    old = t[a:b]
    sprite_a = old.index('<svg width="0" height="0" style="position:absolute"'); sprite = old[sprite_a: old.index('</svg>', sprite_a) + 6]
    dialog = old[old.index('<dialog class="lb"'): old.index('</dialog>') + 9]
    t = t[:a] + body(V, sprite, dialog) + t[b:]
    t = t.replace('<a class="sb-logo" href="/"><img src="img/arcx-bleed.png"', '<a class="sb-logo" href="/"><img src="img/arcx-bleed.png"')
    for o, n in [("label('DPS · BALI'", "label('CGK · JAKARTA'"), ("lab:'✈ BALI'", "lab:'✈ JAKARTA'"), ("lab:'BALI ✈'", "lab:'JAKARTA ✈'"),
                 ("(Dunia Baru · Dragons & Corals)", "(Silolona · " + V["short"] + ")"), ("sails the Komodo voyage", "sails the Raja Ampat voyage"),
                 ("<b>ARCX Dragons and Corals</b>", "<b>" + E(V["brand"] + " " + V["short"]) + "</b>")]:
        assert o in t, o
        t = t.replace(o, n)
    if V.get("css"): t = t.replace("</head>", f"<style>{V['css']}</style></head>", 1) if "</head>" in t else t.replace("<header class=\"sitebar\"", f"<style>{V['css']}</style><header class=\"sitebar\"", 1)
    return t

def dms(x, p, n, w):
    h = p if x >= 0 else n; x = abs(x); d = int(x); m = (x - d) * 60
    if m >= 59.995: d += 1; m = 0
    return f"{d:0{w}d}°{m:05.2f}′{h}"
def coord(c): return dms(c[0], 'N', 'S', 2) + " " + dms(c[1], 'E', 'W', 3)

def daychart(V, di, d):
    legs = []; cur = None
    plan = d["plan"]; prev = V["days"][di-1]["plan"] if di else None
    # the stop the ship starts the day at
    start = V["start_of"][di]
    cur = start
    for it in plan:
        if it[0] == "sail": legs.append(SR["legs"][cur + "-" + it[1]]); cur = it[1]
    pts = [P[k] for k in d["stops"]] + [p for L in legs for p in L] + [P[start]]
    la0 = min(p[0] for p in pts); la1 = max(p[0] for p in pts); lo0 = min(p[1] for p in pts); lo1 = max(p[1] for p in pts)
    cs = math.cos(math.radians((la0 + la1) / 2))
    w = max((lo1 - lo0) * cs, 0.06); h = max(la1 - la0, 0.04)
    W, H = 600, 380; pad = 70
    k = min((W - 2 * pad) / w, (H - 2 * pad) / h)
    cla = (la0 + la1) / 2; clo = (lo0 + lo1) / 2
    X = lambda lo: W / 2 + (lo - clo) * cs * k; Y = lambda la: H / 2 - (la - cla) * k
    vb = box(clo - (W / 2) / (cs * k) - .02, cla - (H / 2) / k - .02, clo + (W / 2) / (cs * k) + .02, cla + (H / 2) / k + .02)
    land = []
    for pg in HIP:
        if not pg.intersects(vb): continue
        g = pg.intersection(vb)
        for q in (g.geoms if hasattr(g, 'geoms') else [g]):
            if q.geom_type != 'Polygon' or q.is_empty: continue
            c = list(q.exterior.coords)
            land.append("M" + "L".join(f"{X(x):.1f},{Y(y):.1f}" for x, y in c) + "Z")
    L = "".join(land)
    full = []
    for kk, pp in SR["legs"].items():
        full.append("M" + "L".join(f"{X(p[1]):.1f},{Y(p[0]):.1f}" for p in pp[::2] + [pp[-1]]))
    legd = ["M" + "L".join(f"{X(p[1]):.1f},{Y(p[0]):.1f}" for p in Lg) for Lg in legs]
    id_ = f"dc{di+1}"
    s = [f'<svg viewBox="0 0 600 380" role="img" aria-label="{E("Day " + str(di+1) + " chart: " + d["title"])}" xmlns="http://www.w3.org/2000/svg">',
         f'<defs><pattern id="{id_}w" width="7" height="4" patternUnits="userSpaceOnUse"><line x1="0" y1="2" x2="5" y2="2" stroke="#2F4A50" stroke-width=".85"/></pattern>',
         f'<pattern id="{id_}f" width="12" height="6" patternUnits="userSpaceOnUse"><line x1="0" y1="3" x2="6" y2="3" stroke="#8C9A9C" stroke-width=".5"/></pattern>',
         f'<pattern id="{id_}h" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="1.6" y1="-1" x2="1.6" y2="4.2" stroke="#3B2618" stroke-width=".75"/></pattern>',
         f'<path id="{id_}L" d="{L or "M0,0"}"/><clipPath id="{id_}c"><use href="#{id_}L"/></clipPath></defs>',
         f'<rect width="600" height="380" fill="#EEEAE3"/><rect width="600" height="380" fill="url(#{id_}f)" opacity=".55"/>',
         f'<use href="#{id_}L" fill="none" stroke="url(#{id_}w)" stroke-width="22" stroke-linejoin="round" opacity=".38"/>',
         f'<use href="#{id_}L" fill="none" stroke="url(#{id_}w)" stroke-width="8" stroke-linejoin="round" opacity=".9"/>',
         f'<use href="#{id_}L" fill="#E2D6BC"/>',
         f'<use href="#{id_}L" fill="none" stroke="url(#{id_}h)" stroke-width="12" clip-path="url(#{id_}c)" opacity=".55"/>',
         f'<use href="#{id_}L" fill="none" stroke="#0E0E0E" stroke-width="1" stroke-linejoin="round"/>',
         f'<path d="{"".join(full)}" class="dc-full"/>']
    for ld_ in legd: s.append(f'<path d="{ld_}" class="dc-halo"/><path d="{ld_}" class="dc-leg"/>')
    for Lg in legs:
        m = Lg[len(Lg) // 2]; s.append(f'<g class="dc-veh" transform="translate({X(m[1]):.1f},{Y(m[0]):.1f})"><rect x="-12" y="-12" width="24" height="24" rx="3"/><use href="#i-boat" x="-8.5" y="-8.5" width="17" height="17"/></g>')
    seen = set()
    for kk in d["stops"]:
        if kk in seen: continue
        seen.add(kk)
        x, y = X(P[kk][1]), Y(P[kk][0]); right = x < 430
        if kk in d.get("anchor", []): s.append(f'<g class="dc-anc" transform="translate({x:.1f},{y:.1f})"><circle r="11"/><use href="#i-anchor" x="-8" y="-8" width="16" height="16"/></g>')
        else: s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" class="dc-pt"/>')
        tx = x + 14 if right else x - 14; anc = "start" if right else "end"; ty = y + 24 if y < 300 else y - 30
        s.append(f'<text x="{tx:.1f}" y="{ty:.1f}" text-anchor="{anc}" class="dc-lab">{E(NAMES[kk].split(" · ")[0])}</text>')
        for bi, ic in enumerate(d["icons"].get(kk, [])[:3]):
            bx = (tx + 8 + bi * 21) if right else (tx - 8 - bi * 21); s.append(f'<g class="dc-bdg" transform="translate({bx:.1f},{ty+16:.1f})"><circle r="9.5"/><use href="#i-{ic}" x="-6.5" y="-6.5" width="13" height="13"/></g>')
    nm = 120 / (k / 60)  # nautical miles per 120px (1 deg lat = 60 NM)
    step = [1, 2, 5, 10, 20, 25, 50][min(range(7), key=lambda i: abs([1, 2, 5, 10, 20, 25, 50][i] - nm))]
    px = step * k / 60
    s.append(f'<g class="dc-n" transform="translate(28,34)"><path d="M0,-16L6,6L0,1L-6,6Z"/><text y="20" text-anchor="middle">N</text></g><g class="dc-sb" transform="translate({576-px:.1f},360)"><path d="M0,0H{px:.1f}M0,-4V0M{px:.1f},-4V0"/><text x="{px/2:.1f}" y="-7" text-anchor="middle">{step} NM</text></g>')
    s.append(f'<text x="586" y="22" text-anchor="end" class="dc-tag">DAY {di+1:02d} · OVERHEAD</text></svg>')
    return "\n".join(s)

def ph(k, cap, stamp, eager=False, cls="ph", lb=True, w=1600):
    alt = IMG[k][1]
    return f'<figure class="{cls}"{f" data-lb={chr(34)}{url(k,2000)}{chr(34)} data-cap={chr(34)}{E(cap)}{chr(34)} data-alt={chr(34)}{E(alt)}{chr(34)} tabindex={chr(34)}0{chr(34)} role={chr(34)}button{chr(34)} aria-label={chr(34)}Open photo: {E(cap)}{chr(34)}" if lb else ""} style="margin:0"><img src="{url(k,w)}" alt="{E(alt)}" loading="{"eager" if eager else "lazy"}" decoding="async"><span class="capt">{E(cap)}</span><span class="stampc">{E(stamp)}</span></figure>'

def body(V, sprite, dialog):
    D = V["days"]; ND = len(D); idn = V["id"].split("/")[0]
    out = [f'''<section class="nameband" id="programme" aria-labelledby="bigH">
  <figure class="ph" style="margin:0"><img src="{url(V["band"],2400)}" alt="{E(IMG[V["band"]][1])}" loading="eager" decoding="async" style="object-position:50% 45%"><span class="capt">{E(V["bandcap"])}</span><span class="stampc">{E(idn)} · RAJA AMPAT</span></figure>
  <div class="shade" aria-hidden="true"></div>
  <div class="in g">
    <div>
      <span class="lgm lg-arcx" role="img" aria-label="ARCX"></span>
      <h1 class="bigname" id="bigH"><b class="bw">{V["h1a"]}</b><span>{V["h1b"]}</span></h1>
      <div class="nb-sub">{E(V["sub"])}</div>
    </div>
    <div class="nb-panel">
      <p class="nb-lede">{E(V["lede"])}</p>
      <div class="facts">''' + "".join(f'<div><b{" id=" + chr(34) + "stNm" + chr(34) if b == "—" else ""}>{E(b)}</b><span>{E(s)}</span></div>' for b, s in V["facts"]) + f'''</div>
      <div class="cta"><a class="btn" href="#prices">DATES &amp; PRICES</a><a class="btn ghost" href="#ledger">DAY BY DAY</a><a class="btn ghost" href="#info">TRAVEL INFO</a></div>
    </div>
  </div>
</section>
<main class="g">
<div class="wrap">
<div class="gradebar" role="group" aria-label="Photo treatment"><span class="k">PHOTO GRADE</span> <button type="button" data-grade="col" aria-pressed="false">COLOUR</button> <button type="button" data-grade="arcx" aria-pressed="true">ARCX GRADE</button> <button type="button" data-grade="duo" aria-pressed="false">ENGRAVED DUOTONE</button> </div>
<section aria-labelledby="glH"><div class="sechead"><h3 id="glH">At a glance</h3><span class="cap">The short answers</span></div><div class="glance">''' + "".join(f"<div><h4>{E(q)}</h4><p>{E(a)}</p></div>" for q, a in V["glance"]) + f'''</div></section>
<section aria-labelledby="ovH"><div class="sechead"><h3 id="ovH">The route</h3><span class="cap">{E(" · ".join(NAMES[k].split(" · ")[0] for k in ["sor","yen","kri","arb","mas","blu","pia","way","fam","mm","bal","boo","fia","dar"]))}</span></div>
<div class="ovgrid"><figure class="ovmap" id="ovMap" style="margin:0"><figcaption class="legend">{E(idn)} · SORONG ROUND TRIP · 130°E–131°E · ACROSS THE EQUATOR</figcaption></figure><figure class="ovmap" id="ovInset" style="margin:0"><figcaption class="legend">INSET · THE MISOOL KARST · DAYS 08–10</figcaption></figure></div></section>
<section aria-labelledby="dayH" id="ledger"><div class="sechead"><h3 id="dayH">The ledger, day by day</h3><span class="cap">Every day a coordinate</span></div><div class="ledger">
{sprite}
<nav class="daynav" aria-label="Jump to a day">''' + "".join(f'<a href="#day-{i+1}" title="Day {i+1}: {E(d["title"])}">D{i+1:02d}<i>{E(d["title"])}</i></a>' for i, d in enumerate(D)) + '</nav>']
    for i, d in enumerate(D):
        stamp = f"DAY {i+1:02d} · " + coord(P[d["stops"][0]])
        thumbs = "".join(f'<button type="button" data-lb="{url(k,2000)}" data-cap="{E(c)} · Day {i+1}" data-alt="{E(IMG[k][1])}" aria-label="Open photo: {E(c)}"><figure class="ph" style="margin:0"><img src="{url(k,700)}" alt="{E(IMG[k][1])}" loading="lazy" decoding="async"><span class="capt">{E(c)}</span><span class="stampc">D{i+1:02d}</span></figure></button>' for k, c in d["thumbs"])
        coords = "".join(f'<li><span>{E(NAMES[k])}</span><span class="mono">{coord(P[k])}</span></li>' for k in dict.fromkeys(d["stops"]))
        tl = "".join(f"<li><b>{E(a)}</b><i>{E(b)}</i> · {E(c)}</li>" for a, b, c in d["times"])
        chips = "".join(f"<div><span>{E(a)}</span>{E(b)}</div>" for a, b in d["chips"])
        stl = ""
        for kk in dict.fromkeys(d["stops"]):
            ik, cap = STOPIMG[kk]
            xp = "".join(f'<li><svg class="ic" aria-hidden="true"><use href="#i-{ic}"/></svg><span>{E(tx)}</span></li>' for ic, tx in d["xp"].get(kk, []))
            stl += f'<li class="st"><span class="sth-wrap"><button type="button" class="sth" data-lb="{url(ik,2000)}" data-cap="{E(cap)} · Day {i+1}" data-alt="{E(IMG[ik][1])}" aria-label="Open photo: {E(cap)}"><img src="{url(ik,300)}" alt="{E(cap)}" loading="lazy" decoding="async"></button></span><div class="stb"><b>{E(NAMES[kk])}</b><ul class="xp">{xp}</ul></div></li>'
        out.append(f'''<article class="dayrow{" flip" if i % 2 else ""}" id="day-{i+1}" aria-labelledby="dh{i+1}">
<div class="gal">{ph(d["img"], d["imgcap"], stamp)}<div class="thumbs">{thumbs}</div></div>
<div class="body"><div class="dn"><span>DAY {i+1:02d} / {ND:02d}</span><span>{E(idn)} · D{i+1:02d}</span></div><h3 id="dh{i+1}">{E(d["title"])}</h3><div class="where">{E(d["where"])}</div>
''' + "".join(f"<p>{E(p)}</p>" for p in d["paras"]) + f'''<ul class="coords">{coords}</ul><div class="exp"><h4>WHAT TO EXPECT · SAMPLE TIMINGS</h4><ol class="tline">{tl}</ol></div><div class="chips">{chips}</div><button type="button" class="go" data-day="{i}">SAIL TO DAY {i+1:02d} ↑</button></div>
<div class="daymap"><figure class="dchart" style="margin:0">{daychart(V, i, d)}<figcaption>Overhead chart · indicative track · <svg class="ic" aria-hidden="true"><use href="#i-anchor"/></svg> anchored <svg class="ic" aria-hidden="true"><use href="#i-boat"/></svg> cruising <svg class="ic" aria-hidden="true"><use href="#i-plane"/></svg> transfers</figcaption></figure>
<div class="stops"><h4>STOPS &amp; EXPERIENCES</h4><ol class="stl">{stl}</ol><p class="fine">* Wildlife sightings, including mantas, are seasonal and never guaranteed.</p></div></div>
</article>''')
    out.append('</div></section>')
    out.append(f'''<section aria-labelledby="seaH"><div class="sechead"><h3 id="seaH">Beneath the surface</h3><span class="cap">{E(V["seacap"])}</span></div><div class="mosaic">''' + "".join(ph(k, c, s, lb=False, w=1200) for k, c, s in V["sea"]) + f'''</div><p class="mosaicnote">Photography: Silolona Sojourns (partner imagery), served from the ARCX Cloudinary library.</p></section>
<section aria-labelledby="lifeH"><div class="sechead"><h3 id="lifeH">Life aboard</h3><span class="cap">Silolona · partner photography</span></div><div class="mosaic life">''' + "".join(ph(k, c, s, lb=False, w=1200) for k, c, s in V["life"]) + f'''</div></section>
<section aria-labelledby="vH"><div class="sechead"><h3 id="vH">The vessel</h3><span class="cap">Your floating home</span></div><div class="vessel">{ph("silolona-2", "Silolona", "PHINISI · 2004", lb=False, w=1400)}<div class="body"><h4>Silolona</h4><p>{E(V["vessel"])}</p><div class="vfacts">''' + "".join(f'<div><span class="k">{E(a)}</span>{E(b)}{" <span class=" + chr(34) + "ph-tag" + chr(34) + ">CONFIRM</span>" if c else ""}</div>' for a, b, c in V["vfacts"]) + f'''</div></div></div></section>
<section aria-labelledby="incH"><div class="sechead"><h3 id="incH">Included &amp; not included</h3><span class="draft">DRAFT · CONFIRM WITH SILOLONA SOJOURNS</span></div><div class="cols"><div class="list"><h4>Included</h4><ul class="yes">''' + "".join(f"<li>{x}</li>" for x in V["inc"]) + '</ul></div><div class="list"><h4>Not included</h4><ul class="no">' + "".join(f"<li>{x}</li>" for x in V["exc"]) + f'''</ul></div></div></section>
<section aria-labelledby="priceH" id="prices"><div class="sechead"><h3 id="priceH">Dates &amp; prices</h3><span class="cap">Prices in USD</span></div><div class="price"><div class="dep"><div class="mono" style="letter-spacing:.14em;font-size:11px">{E(V["deplabel"])}</div><div class="d">{E(V["dates"])}</div><span class="pill">{E(V["pill"])}</span><p style="margin:0;font-size:14px;color:#D8E3E5">{E(V["depnote"])}</p></div>
<div style="overflow-x:auto"><table class="pt"><thead><tr><th scope="col">Item</th><th scope="col" style="text-align:right">Price</th></tr></thead><tbody>''' + "".join(f'<tr><td>{E(a)}</td><td class="v">{E(b)}</td></tr>' for a, b in V["prices"]) + f'''</tbody></table></div></div><p class="fine" style="margin-top:8px">{E(V["pricenote"])}</p></section>
<section aria-labelledby="infoH" id="info"><div class="sechead"><h3 id="infoH">Travel information</h3><span class="cap">Before you go</span></div>''' + "".join(f'<details class="info"{" open" if n == 0 else ""}><summary>{E(q)}</summary><div class="b"><p>{E(a)}</p></div></details>' for n, (q, a) in enumerate(V["info"])) + f'''</section>
<section aria-labelledby="faqH"><div class="sechead"><h3 id="faqH">Questions travellers ask</h3><span class="cap">FAQ</span></div>''' + "".join(f'<details class="info"{" open" if n == 0 else ""}><summary>{E(q)}</summary><div class="b"><p>{E(a)}</p></div></details>' for n, (q, a) in enumerate(V["faq"])) + f'''</section>
<section aria-labelledby="seoH"><div class="sechead"><h3 id="seoH">Marketing director's report</h3><span class="cap">SEO · AEO · for the web team</span></div><div class="report"><div class="rh"><span>{E(idn)} {E(V["short"].upper())} · SEARCH &amp; ANSWER-ENGINE PLAN</span><span>INTERNAL · REMOVE BEFORE LAUNCH</span></div><div class="rb">{V["report"]}</div></div></section>
</div>
</main>
{dialog}
<section class="enq" id="enquire"><div class="in g"><h3>Reserve {E(V["short"])}</h3><div class="mail" aria-label="Enquiry email"><a href="mailto:Explore@Arcterra.travel?subject={E(V["id"])}%20{E(V["short"])}" style="color:inherit">Explore@Arcterra.travel</a> · <a href="tel:+15614796355" style="color:inherit">+1 561 479 6355</a></div></div></section>
<footer class="foot"><div class="in g"><span class="lgm lg-arcx" role="img" aria-label="ARCX"></span><div class="cap">Ocean expeditions | Land expeditions | A more connected world</div><div class="cap">Est. 2026</div>
<p class="credits">{E(V["credits"])} Coastlines © OpenStreetMap contributors (ODbL) via geo-maps, generalised; world map from Natural Earth. Photography: Silolona Sojourns (partner imagery). ArcTerra LLC, Miami, FL · operated under James Wild Co · Florida Seller of Travel ST45327 · IATA 10783883.</p></div></footer>
<script id="bake">window.__BAKE={{}};</script><script type="application/ld+json">{json.dumps(ld(V), ensure_ascii=False)}</script>
''')
    return "\n".join(out)

def ld(V):
    u = "https://arcterra.travel/journeys/" + V["slug"] + "/"
    items = [{"@type": "ListItem", "position": i + 1, "item": {"@type": "TouristAttraction", "name": f"Day {i+1}: {d['title']}", "description": d["where"],
              "geo": {"@type": "GeoCoordinates", "latitude": P[d["stops"][0]][0], "longitude": P[d["stops"][0]][1]}}} for i, d in enumerate(V["days"])]
    return {"@context": "https://schema.org", "@graph": [
        {"@type": "TouristTrip", "@id": u + "#trip", "name": V["title"], "description": V["desc"], "url": u, "touristType": V["types"],
         "provider": {"@type": "TravelAgency", "name": "ArcTerra Expeditions", "url": "https://arcterra.travel/", "email": "Explore@Arcterra.travel", "telephone": "+1-561-479-6355"},
         "itinerary": {"@type": "ItemList", "numberOfItems": len(items), "itemListElement": items},
         "subjectOf": {"@type": "Event", "name": V["short"] + " · " + V["dates"], "startDate": V["start"], "endDate": V["end"], "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                       "location": {"@type": "Place", "name": "Raja Ampat, West Papua, Indonesia", "geo": {"@type": "GeoCoordinates", "latitude": -0.87, "longitude": 131.24}}},
         "offers": {"@type": "Offer", "price": 187000, "priceCurrency": "USD", "description": "Private charter of Silolona, 10 nights, from US$18,700 a night plus 12% VAT (agent-listed rate, to confirm).", "url": u + "#prices", "availability": "https://schema.org/PreOrder"},
         "image": [url(V["band"], 1200), url("silolona", 1200), url("manta-a", 1200)]},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in V["faq"]]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "ArcTerra Expeditions", "item": "https://arcterra.travel/"},
            {"@type": "ListItem", "position": 2, "name": "Journeys", "item": "https://arcterra.travel/journeys/"}, {"@type": "ListItem", "position": 3, "name": V["short"], "item": u}]}]}

def write(V):
    out = REPO + "journeys/" + V["slug"] + "/"
    os.makedirs(out + "data", exist_ok=True); os.makedirs(out + "img", exist_ok=True)
    for f in ["arcterra-ink.png", "arcx-bleed.png", "arcx-ink.png", "arcx-white.png", "plane-bronze.png", "plane-shadow.png", "terray-white.png"]:
        shutil.copy(TPL + "img/" + f, out + "img/" + f)
    shutil.copy(TPL + "data/land-110m.geo.json", out + "data/")
    shutil.copy(HERE + "hi-raja.json", out + "data/"); shutil.copy(HERE + "reg-papua.json", out + "data/")
    open(out + "index.html", "w").write(build(V))
    print("wrote", out, os.path.getsize(out + "index.html") // 1024, "KB")

if __name__ == "__main__":
    sys.path.insert(0, HERE)
    from content import MIXED, DIVE
    for V in (MIXED, DIVE): write(V)
