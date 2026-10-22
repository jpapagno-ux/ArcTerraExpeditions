# Content for the two Silolona ARCX journeys. Route, stops and day plans are shared; the words differ.
START_OF = ["sor", "yen", "arb", "blu", "pia", "way", "way", "mm", "bal", "fia", "sor"]

def days(dive):
    D = []
    def add(**k): D.append(k)
    add(title="Sorong — Yenbuba Bay", stops=["sor", "yen"], anchor=["yen"], img="silolona", imgcap="Silolona at anchor",
        where=("Board Silolona in Sorong and sail west into the Dampier Strait, with a check dive under the Yenbuba jetty before the first sunset at anchor." if dive else
               "Board Silolona in Sorong, sail west into the Dampier Strait and slip into the water under the Yenbuba jetty before the first sunset at anchor."),
        tags=(["Embark", "Check dive", "Jetty reef", "First sunset"] if dive else ["Embark", "Snorkel", "Check dive", "First sunset"]),
        plan=[["dwell", "sor", 2.0, "embark"], ["sail", "yen"], ["dwell", "yen", 2.5], ["night"]],
        thumbs=[("fleet", "Silolona and Si Datu Bua"), ("reef-swim", "The Yenbuba reef")],
        paras=[("The crew meets you at Sorong airport and takes you to the harbour, where Silolona waits under her dark sails. Lunch is served as she clears the port and heads west for the Dampier Strait. "
                + ("The dive team runs a check dive under the Yenbuba jetty in the afternoon: weights, kit and buddy pairs sorted in calm, shallow water full of schooling fish. " if dive else
                   "In the afternoon the snorkellers drift under the Yenbuba jetty among schooling fish while the divers make an easy check dive below them. ")
                + "Sundowners on deck, then dinner at anchor off Mansuar.")],
        times=[("11:00", "Welcome aboard", "Airport meet, harbour transfer and safety briefing."), ("12:30", "Lunch under way", "West out of Sorong into the Dampier Strait."),
               ("15:30", "Check dive" if dive else "Jetty reef", "Yenbuba jetty: shallow, calm and full of fish."), ("18:00", "Sundowners", "First sunset at anchor off Mansuar.")],
        chips=[("Effort", "Easy"), ("In the water", "Check dive" if dive else "Snorkel · check dive"), ("Bring", "Certification card" if dive else "Reef-safe sunscreen"), ("Evening", "Sunset at anchor")],
        icons={"sor": ["plane", "embark"], "yen": ["dive", "snorkel", "sunset"]},
        xp={"sor": [("plane", "Fly in · SOQ"), ("embark", "Embark Silolona")], "yen": [("dive", "Check dive"), ("snorkel", "Jetty snorkel"), ("sunset", "Sundowners")]})
    add(title="Cape Kri — Arborek", stops=["kri", "arb"], anchor=["arb"], img="clownfish", imgcap="Reef life at Cape Kri",
        where="Cape Kri, where a single dive once logged a record 374 species of fish, then the village of Arborek and its jetty reef.",
        tags=["Cape Kri", "Fish count", "Village visit", "Jetty reef"],
        plan=[["sail", "kri"], ["dwell", "kri", 3], ["sail", "arb"], ["dwell", "arb", 3], ["night"]],
        thumbs=[("reef-swim", "Over the reef"), ("crew", "Hosts in traditional dress")],
        paras=[("Cape Kri is the dive that made Raja Ampat's name: a current-swept point where a scientist once counted 374 species of fish on a single dive. "
                + ("Two dives on the point, with the dive guide reading the current, then a third on the slope." if dive else "Divers drop onto the point; snorkellers drift the sheltered shallows with turtles and reef sharks.")
                + " In the afternoon Silolona moves to Arborek, a small village known for its craftwork and community-run reef, for a walk ashore and a sunset swim off the jetty.")],
        times=[("07:00", "Cape Kri", "The morning dive while the current is kind."), ("10:30", "Second dive" if dive else "Shallows", "The Kri slope, or turtles in the shallows."),
               ("15:00", "Arborek", "Village walk and the jetty reef."), ("18:00", "At anchor", "Dinner off Arborek.")],
        chips=[("Effort", "Easy to moderate"), ("In the water", "Up to 3 dives" if dive else "Dive · snorkel"), ("Current", "Moderate at Kri"), ("Ashore", "Arborek village")],
        icons={"kri": ["dive", "fish"], "arb": ["village", "snorkel", "sunset"]},
        xp={"kri": [("dive", "Cape Kri point"), ("fish", "Record fish count")], "arb": [("village", "Arborek village"), ("snorkel", "Jetty reef")]})
    add(title="Mantas of the Dampier Strait", stops=["mas", "blu"], anchor=["blu"], img="manta-b", imgcap="A manta overhead",
        where=("Manta Sandy at first light, where reef mantas queue at the cleaning stations, then the oceanic mantas and big schools of Blue Magic." if dive else
               "Manta Sandy at first light, where reef mantas circle the cleaning stations close enough to watch from the surface, then Blue Magic for the divers."),
        tags=["Manta Sandy", "Blue Magic", "Reef & oceanic mantas", "Cleaning stations"],
        plan=[["sail", "mas"], ["dwell", "mas", 3], ["sail", "blu"], ["dwell", "blu", 2.5], ["night"]],
        thumbs=[("manta-a", "Manta over the reef"), ("manta-b", "From below")],
        paras=[("The first of the two manta days. At Manta Sandy, a sandy cleaning station off Arborek, reef mantas come in to be cleaned by small wrasse, circling slowly over the rubble. "
                + ("You settle behind the marked line and let them come to you. The afternoon dive is Blue Magic, a submerged pinnacle where oceanic mantas sweep through schools of fusiliers and barracuda, with wobbegong sharks on the ledges." if dive else
                   "Divers settle on the sand; snorkellers float above, and the mantas often rise to the surface. The afternoon is for the divers at Blue Magic, a submerged pinnacle with oceanic mantas and big schools, while the snorkellers kayak the Mioskon shore."))],
        times=[("06:30", "Manta Sandy", "First light, when the stations are busiest."), ("10:00", "Second manta dive" if dive else "Manta snorkel", "A second session as the tide turns."),
               ("14:30", "Blue Magic", "The pinnacle: oceanic mantas and schooling fish."), ("18:30", "At anchor", "Mioskon, under the Gam hills.")],
        chips=[("Effort", "Moderate"), ("In the water", "Up to 4 dives" if dive else "Dive · snorkel · kayak"), ("Best season", "Oct–Apr"), ("Rule", "Never touch or chase")],
        icons={"mas": ["manta", "dive", "snorkel"], "blu": ["manta", "dive", "fish"]},
        xp={"mas": [("manta", "Reef mantas"), ("dive", "Cleaning station")] + ([] if dive else [("snorkel", "Surface viewing")]), "blu": [("manta", "Oceanic mantas"), ("fish", "Schooling fish")] + ([] if dive else [("toys", "Kayak Mioskon")])})
    add(title="Piaynemo", stops=["pia"], anchor=["pia"], img="piaynemo", imgcap="The view from Piaynemo",
        where="West along the strait to the karst of Piaynemo: the stairway to the view everyone comes for, then the lagoons and reefs below it.",
        tags=["Karst lagoons", "Viewpoint", "Kayak", "Reef dive"],
        plan=[["sail", "pia"], ["dwell", "pia", 5], ["night"]],
        thumbs=[("karst-aerial", "Karst from the air"), ("karst-hero", "Islets in the lagoon")],
        paras=["Silolona sails west along the Dampier Strait to the Fam group and anchors off Piaynemo. The wooden stairway climbs a little over three hundred steps to a lookout over the classic Raja Ampat picture: dozens of forested limestone islets in a turquoise lagoon. Go early, before the day boats.",
               ("The dive team takes two reef dives on the Fam walls and hard-coral gardens, with a sunset dive if you want it." if dive else "Afterwards, kayak the channels between the karst, snorkel the hard-coral gardens or dive the outer walls.")],
        times=[("06:00", "The stairway", "Up before the day boats arrive."), ("09:00", "Reef dive" if dive else "Lagoons", "Fam walls" if dive else "Kayak and snorkel among the karst."),
               ("14:00", "Second dive" if dive else "Reef", "Hard-coral gardens."), ("17:30", "Sunset", "Anchored below the islets.")],
        chips=[("Effort", "Moderate · 320-odd steps"), ("In the water", "Up to 3 dives" if dive else "Dive · snorkel · kayak"), ("Bring", "Grippy shoes"), ("Light", "Early morning")],
        icons={"pia": ["hike", "toys", "dive"]},
        xp={"pia": [("hike", "Piaynemo stairway"), ("toys", "Kayak the lagoons"), ("dive", "Fam walls")]})
    add(title="Across the Equator to Wayag", stops=["way"], anchor=["way"], img="karst-hero", imgcap="The karst of Wayag",
        where="North under sail across the equator to Wayag, the karst archipelago at the top of Raja Ampat, and the scramble to its summit for sunset.",
        tags=["Equator", "Under sail", "Wayag peak", "Sunset"],
        plan=[["sail", "way", "sails"], ["dwell", "way", 3], ["night"]],
        thumbs=[("under-sail", "Under sail"), ("bay-aerial", "Bays from above")],
        paras=["The longest sail of the northern days. With a fair wind the crew sets Silolona's sails and she crosses the equator heading for Wayag, at about ten minutes north. Expect a line-crossing toast on deck.",
               "Wayag is the outer edge of Raja Ampat: steep, jungle-topped limestone islands around lagoons so clear the blacktip reef sharks show from the tender. In the late afternoon, scramble up the peak for the view over the whole archipelago as the sun drops."],
        times=[("07:00", "Under sail", "North across the equator."), ("12:30", "Lunch", "Line-crossing toast."), ("15:30", "Wayag", "Tender into the lagoons."), ("17:00", "The peak", "Scramble up for sunset.")],
        chips=[("Effort", "Strenuous scramble, optional"), ("In the water", "Lagoon swim" if not dive else "One afternoon dive"), ("Latitude", "00°10′N"), ("Evening", "Sunset from the peak")],
        icons={"way": ["sail", "hike", "sunset"]},
        xp={"way": [("sail", "Equator under sail"), ("hike", "Wayag peak"), ("sunset", "Summit sunset")]})
    add(title="Wayag", stops=["way"], anchor=["way"], img="karst-aerial", imgcap="The Wayag lagoons",
        where="A whole day in the Wayag lagoons: blacktip reef sharks in the shallows, kayaks through the karst, and nobody else in sight.",
        tags=["Lagoons", "Blacktip sharks", "Kayak", "Slow day"],
        plan=[["dwell", "way", 9], ["night"]],
        thumbs=[("karst-hero", "Karst islets"), ("reef-swim", "Clear water")],
        paras=["A day with no passage at all. The tenders explore the lagoons, where young blacktip reef sharks patrol the sand in knee-deep water, and the kayaks go where the tenders can't. "
               + ("The dive team picks the outer walls and pinnacles for two or three dives, depending on the current." if dive else "Divers can take the outer walls; everyone else swims, paddles, naps and swims again."),
               "Wayag sits inside a marine protected area patrolled by local rangers, and the visit fee goes to them. This is the quiet heart of the voyage."],
        times=[("07:00", "Lagoons", "Blacktips in the shallows."), ("10:00", "Outer walls" if dive else "Kayak", "Pinnacles and walls" if dive else "Through the karst channels."),
               ("15:00", "Second dive" if dive else "Beach", "As the light softens."), ("19:00", "Dinner on deck", "The stars, far from any town.")],
        chips=[("Effort", "Easy"), ("In the water", "Up to 3 dives" if dive else "Snorkel · kayak · dive"), ("Wildlife", "Blacktip reef sharks"), ("Pace", "Slow")],
        icons={"way": ["shark", "toys", "beach"]},
        xp={"way": [("shark", "Blacktips in the shallows"), ("toys", "Kayak the karst"), ("beach", "Empty beaches")]})
    add(title="Fam Islands, then South", stops=["fam", "mm"], anchor=[], img="reef-swim", imgcap="Hard coral, Fam Islands",
        where="South to the hard-coral gardens of the Fam Islands, then the long night passage across the Seram Sea to Misool.",
        tags=["Hard coral", "Melissa's Garden", "Night passage"],
        plan=[["sail", "fam"], ["dwell", "fam", 4], ["sail", "mm", "over"], ["night"]],
        thumbs=[("clownfish", "Anemone and clownfish"), ("silolona-2", "Silolona under way")],
        paras=["Back south through the morning to the Fam Islands for some of the healthiest hard coral in Raja Ampat, at sites such as Melissa's Garden: tables, plates and staghorn in shallow, sunlit water that suits snorkellers as well as divers.",
               "After dinner Silolona starts the longest passage of the voyage, about ninety nautical miles south across the open Seram Sea to Misool. Most guests sleep through it; the crew does not."],
        times=[("08:30", "Fam reefs", "Hard-coral gardens."), ("11:30", "Second dive" if dive else "Snorkel", "Shallow and sunlit."), ("16:00", "Afternoon", "Last swim in the north."), ("21:00", "Night passage", "South across the Seram Sea.")],
        chips=[("Effort", "Easy"), ("In the water", "Up to 3 dives" if dive else "Snorkel · dive"), ("Passage", "≈ 90 NM overnight"), ("Tip", "Seasickness tablets if prone")],
        icons={"fam": ["dive", "snorkel", "fish"], "mm": ["moon"]},
        xp={"fam": [("dive", "Melissa's Garden"), ("snorkel", "Shallow hard coral")], "mm": [("moon", "Arrive overnight")]})
    add(title="Magic Mountain — Balbulol", stops=["mm", "bal"], anchor=["bal"], img="manta-a", imgcap="Mantas at Magic Mountain",
        where=("The second manta day: Magic Mountain, the Misool seamount where oceanic and reef mantas come in to be cleaned, then the karst lagoon of Balbulol." if dive else
               "The second manta day at Magic Mountain in Misool, then an afternoon paddling the karst lagoon of Balbulol."),
        tags=["Magic Mountain", "Mantas", "Balbulol lagoon", "Karst"],
        plan=[["dwell", "mm", 3.5], ["sail", "bal"], ["dwell", "bal", 3], ["night"]],
        thumbs=[("manta-b", "Manta from below"), ("karst-aerial", "Misool karst")],
        paras=[("Misool is the southern half of the story: older, wilder and protected by one of the largest no-take marine reserves in Indonesia. Magic Mountain is a submerged seamount with cleaning stations where oceanic and reef mantas come in from the blue, with schools of jacks and barracuda over the top. "
                + ("Two dives, timed to the tide." if dive else "Divers go down to the stations; snorkellers ride the tender to the sheltered edge and watch for mantas passing below.")),
               "In the afternoon Silolona moves to Balbulol, a maze of karst towers and lagoons where the kayaks go through narrow channels into still water the colour of glass."],
        times=[("07:00", "Magic Mountain", "First dive on the seamount."), ("10:30", "Second dive" if dive else "Mantas", "As the tide turns."), ("15:00", "Balbulol", "Kayak the karst lagoon."), ("18:00", "At anchor", "Among the towers.")],
        chips=[("Effort", "Moderate"), ("In the water", "Up to 4 dives" if dive else "Dive · snorkel · kayak"), ("Current", "Can be strong"), ("Ashore", "Karst lagoon")],
        icons={"mm": ["manta", "dive", "fish"], "bal": ["toys", "camera"]},
        xp={"mm": [("manta", "Oceanic & reef mantas"), ("dive", "Seamount")], "bal": [("toys", "Kayak the lagoon"), ("camera", "Karst towers")]})
    add(title="Boo Windows — Fiabacet", stops=["boo", "fia"], anchor=["fia"], img="night-dive", imgcap="After dark on the reef",
        where="Through the two windows of Boo Rock, then the soft-coral pinnacles of Fiabacet, with a night dive for those who want one.",
        tags=["Boo Windows", "Soft coral", "Pinnacles", "Night dive"],
        plan=[["sail", "boo"], ["dwell", "boo", 3], ["sail", "fia"], ["dwell", "fia", 3], ["night"]],
        thumbs=[("clownfish", "Anemone city"), ("reef-swim", "Fiabacet pinnacles")],
        paras=["Boo Rock breaks the surface off southern Misool, and just below the waterline two holes have worn right through it: the Boo Windows. Divers swim through; snorkellers look down through them from above. The reef around is thick with soft coral, fans and fish.",
               ("Fiabacet's pinnacles take the afternoon, followed by a night dive for crabs, shrimps, cuttlefish and sleeping parrotfish." if dive else "Fiabacet's pinnacles take the afternoon, and the divers can add a night dive after dinner.")],
        times=[("07:30", "Boo Windows", "Through the rock."), ("11:00", "Second dive" if dive else "Snorkel", "Soft coral and fans."), ("15:00", "Fiabacet", "The pinnacles."), ("19:30", "Night dive", "Torches on, for those who want it.")],
        chips=[("Effort", "Moderate"), ("In the water", "Up to 4 dives incl. night" if dive else "Dive · snorkel · night dive"), ("Highlight", "Soft coral"), ("Evening", "Night dive")],
        icons={"boo": ["dive", "snorkel"], "fia": ["dive", "moon"]},
        xp={"boo": [("dive", "Swim the windows"), ("snorkel", "Look down from above")], "fia": [("dive", "Soft-coral pinnacles"), ("moon", "Night dive")]})
    add(title="Daram, then North", stops=["dar", "sor"], anchor=[], img="bay-aerial", imgcap="The islands of eastern Misool",
        where="A last morning at Daram among soft coral and big fish, a farewell dinner with the crew, then the night passage back to Sorong.",
        tags=["Daram", "Last dives", "Farewell dinner", "Night passage"],
        plan=[["sail", "dar"], ["dwell", "dar", 4], ["sail", "sor", "over"], ["night"]],
        thumbs=[("crew", "The crew's farewell"), ("silolona", "Silolona")],
        paras=[("The last diving day, at the Daram islands in eastern Misool: walls dense with soft coral and fans, and the bigger fish that come with the current. "
                + ("Two dives, then the dive team's last debrief and a rinse of the kit." if dive else "One more dive or snorkel, then a last swim off the stern.")),
               "In the evening the crew lays a farewell dinner on deck, and Silolona heads north through the night for Sorong."],
        times=[("07:00", "Daram", "The last dive."), ("10:30", "Final dive" if dive else "Last swim", "Off the stern."), ("19:00", "Farewell dinner", "On deck with the crew."), ("22:00", "Night passage", "North to Sorong.")],
        chips=[("Effort", "Easy"), ("In the water", "Up to 2 dives" if dive else "Dive · snorkel"), ("Note", "No diving within 24 h of flying"), ("Evening", "Farewell dinner")],
        icons={"dar": ["dive", "fish", "dinner"], "sor": ["moon"]},
        xp={"dar": [("dive", "Soft-coral walls"), ("dinner", "Farewell dinner")], "sor": [("moon", "Night passage north")]})
    add(title="Sorong", stops=["sor"], anchor=["sor"], img="silolona-2", imgcap="The last morning",
        where="Breakfast in Sorong harbour, farewells to the crew and the transfer to the airport.",
        tags=["Disembark", "Airport transfer"],
        plan=[["dwell", "sor", 1.0, "disembark"]],
        thumbs=[("fleet", "Silolona and Si Datu Bua"), ("under-sail", "Under sail")],
        paras=["Silolona is back in Sorong by morning. Breakfast on deck, farewells to the crew, and the transfer to Sorong airport for flights onward through Jakarta or Makassar. Allow at least 24 hours between your last dive and your flight."],
        times=[("08:00", "Breakfast", "In Sorong harbour."), ("09:30", "Farewells", "To the crew."), ("10:30", "Transfer", "Sorong airport (SOQ).")],
        chips=[("Effort", "Easy"), ("Flights", "After midday"), ("Diving", "24 h before flying"), ("Bags", "Soft bags")],
        icons={"sor": ["anchor", "plane"]},
        xp={"sor": [("anchor", "Disembark"), ("plane", "Fly out · SOQ")]})
    return D

NOTES_ = {"mas": ["Reef mantas · cleaning station", 46, 48], "blu": ["Oceanic mantas · pinnacle", -46, -48], "kri": ["374 species on one dive", 46, -46], "pia": ["The stairway view", -46, 48],
          "way": ["Across the equator · Wayag peak", 46, 46], "fam": ["Hard-coral gardens", 46, -46], "mm": ["Mantas · Magic Mountain", -46, 48], "bal": ["Karst lagoon by kayak", 46, -46],
          "boo": ["Through the windows", 46, 46], "fia": ["Soft-coral pinnacles", -46, 46], "dar": ["Soft coral · big fish", 46, -46], "sor": ["Sorong harbour", 44, 46], "arb": ["Arborek village", -44, -46], "yen": ["Jetty reef", 42, -42]}
HL_ = [{"k": "kri", "d": 1, "lab": "Cape Kri"}, {"k": "mas", "d": 2, "lab": "Mantas · Manta Sandy"}, {"k": "pia", "d": 3, "lab": "Piaynemo view"}, {"sails": True, "lab": "Across the equator"},
       {"k": "way", "d": 5, "lab": "Wayag lagoons"}, {"k": "mm", "d": 7, "lab": "Mantas · Magic Mountain"}, {"k": "boo", "d": 8, "lab": "Boo Windows"}]

VESSEL = ("A 50-metre phinisi built in 2004 by the Konjo shipwrights of South Sulawesi, Silolona was one of the first traditional Indonesian sailing ships fitted out for private charter, "
          "and she still sails under her dark gaff-rigged sails. Five suites, a crew of about seventeen and a full PADI dive centre with three tenders. She is chartered whole, to one group.")
VFACTS = [("Length", "50 m · 164 ft", False), ("Built", "2004 · Konjo shipwrights, Sulawesi", False), ("Suites", "5 · 2 guest, 3 master", False), ("Guests", "Up to 10 (12 with children)", True),
          ("Crew", "About 17", False), ("Diving", "PADI dive centre · 3 tenders", False), ("Water toys", "Kayaks · paddleboards · snorkel gear", False), ("Sister ship", "Si Datu Bua, 40 m", False)]
INFO = [("Getting there", "Fly to Sorong (SOQ) in West Papua, usually through Jakarta (CGK) or Makassar (UPG). Arrive the day before: flights to Papua run late more often than ships do, and Silolona sails on the day. The crew meets you at Sorong airport on day one."),
        ("Visas & entry", "Many nationalities can buy an Indonesian visa on arrival or apply online for an e-VOA before travel. Passports need at least six months' validity. Check the current rules for your nationality before you book."),
        ("Raja Ampat permit", "Every visitor buys a Raja Ampat marine park entry permit (the PIN card), which funds the reserve and its rangers. Wayag and some Misool sites charge a small local fee on top. The crew arranges both."),
        ("Health & insurance", "Speak to a travel clinic about malaria and vaccinations for West Papua. Medical facilities are limited and far apart, so travel insurance must include dive cover and medical evacuation."),
        ("Weather & sea", "Silolona sails Raja Ampat from about January to April and September to November. Expect 27–32 °C on deck and 28–30 °C in the water. The long passages to Wayag and Misool are in open sea; the crew times them for the calmest conditions."),
        ("What to pack", "Light clothes, a hat, reef-safe sunscreen, a rash guard or 3 mm wetsuit, grippy shoes for Piaynemo and Wayag, a dry bag, any personal dive kit and your certification card. Soft bags only.")]

REPORT = lambda kw, primary, extra: f'''<div><h5>Search intent &amp; targets</h5><div class="kw">{"".join(f"<span>{k}</span>" for k in kw)}</div>
<ul style="margin-top:10px"><li>Primary: <b>{primary}</b>. Secondary: <b>Silolona charter</b>, <b>Raja Ampat phinisi charter</b>.</li><li>Answer-first copy: every FAQ answer is 40–80 words and carries the liftable facts (11 days, 10 nights, Sorong round trip, Silolona, 5 suites, mantas at Manta Sandy, Blue Magic and Magic Mountain).</li><li>{extra}</li></ul></div>
<div><h5>Structured data &amp; AEO</h5><ul><li>Shipped: <code>TouristTrip</code> with a geo-coded <code>ItemList</code> of 11 days, an <code>Event</code> for the departure and an <code>Offer</code> (charter from US$187,000), plus <code>FAQPage</code> and <code>BreadcrumbList</code>.</li><li>Every stop shows coordinates in plain text, so answer engines can quote "where" as well as "what".</li><li>Add the journey to <code>/llms.txt</code> and <code>sitemap.xml</code> (done in this push) and to the Airtable Journeys table so the build adds it to the nav and the /journeys/ index.</li></ul></div>
<div><h5>Before launch</h5><ul><li>Confirm with Silolona Sojourns: dates, charter rate, guest maximum, nitrox, park permit fee.</li><li>Replace the two Instagram-crop images with full-resolution manta frames from Silolona.</li><li>Cut a 20-second vertical of the hero chart (Sorong → equator → Misool) for Reels and Shorts, linking to this page.</li></ul></div>'''

import datetime as dt
def mk(dive):
    D = days(dive)
    for i, d in enumerate(D): d["start_of"] = START_OF[i]
    common = dict(days=D, start_of=START_OF, notes=NOTES_, hl=HL_, vessel=VESSEL, vfacts=VFACTS, info=INFO)
    if not dive:
        return dict(common, slug="raja-ampat-karst-and-mantas", id="AX·021/27", brand="ARCX", short="Karst & Mantas", h1a="Karst", h1b="&amp; Mantas",
            title="Karst & Mantas: Raja Ampat by Phinisi, 11 Days aboard Silolona | ARCX",
            desc="Karst & Mantas: an 11-day, 10-night ARCX voyage through Raja Ampat aboard the 50-metre phinisi Silolona, Sorong round trip. Cape Kri, the mantas of Manta Sandy and Magic Mountain, Piaynemo, Wayag across the equator and the Misool karst. For divers and snorkellers together.",
            capline="Ocean Expeditions · AX·021/27", spin="Eleven days aboard the phinisi Silolona, Sorong to Sorong, north across the equator to Wayag and south to Misool. Press pause at any time, or tap a day on the timeline.",
            band="karst-aerial", bandcap="The Raja Ampat karst",
            sub="RAJA AMPAT · SORONG TO SORONG · 11 DAYS · 10 NIGHTS · DIVERS & SNORKELLERS · AX·021/27",
            lede="Ten nights aboard Silolona, one of the original Indonesian phinisi charter yachts, through the richest reefs on earth. Two manta days, at Manta Sandy in the Dampier Strait and Magic Mountain in Misool; the view from Piaynemo; a sail across the equator to Wayag; and the karst lagoons of Misool. Divers and snorkellers travel together: every site has a way in from the surface.",
            facts=[("11 days", "10 nights"), ("—", "Nautical miles"), ("14", "Anchorages"), ("Sorong", "Start & finish"), ("Silolona", "Private phinisi"), ("Dive · Snorkel", "Together")],
            glance=[("What is Karst & Mantas?", "An 11-day, 10-night private voyage through Raja Ampat in West Papua, Indonesia, aboard the 50-metre phinisi Silolona, round trip from Sorong."),
                    ("Who is it for?", "Divers and snorkellers travelling together, families with confident swimmers, photographers, and anyone who wants mantas and limestone karst without a crowded liveaboard."),
                    ("What are the highlights?", "Mantas at Manta Sandy, Blue Magic and Magic Mountain; Cape Kri's record fish count; the Piaynemo viewpoint; crossing the equator to Wayag; Balbulol lagoon and the Boo Windows in Misool."),
                    ("How active is it?", "Easy to moderate, with two optional climbs (Piaynemo and the Wayag peak) and up to three dives or snorkels a day. Two overnight passages in open sea.")],
            seacap="Raja Ampat · reefs · mantas",
            sea=[("manta-a", "Oceanic manta", "BLUE MAGIC"), ("clownfish", "Anemone city", "CAPE KRI"), ("reef-swim", "Over the coral", "FAM ISLANDS"), ("manta-b", "Overhead", "MANTA SANDY"), ("night-dive", "After dark", "FIABACET")],
            life=[("under-sail", "Under sail", "SILOLONA"), ("crew", "Papuan hosts", "ARBOREK"), ("fleet", "Silolona & Si Datu Bua", "THE FLEET"), ("karst-hero", "Wayag", "00°10′N"), ("bay-aerial", "Island bays", "MISOOL")],
            inc=["Ten nights aboard Silolona, Sorong to Sorong, as a private charter for your group", "All meals and soft drinks on board; house wine with dinner <span class=\"ph-tag\">CONFIRM</span>",
                 "Guided diving for certified divers with dive equipment and wetsuits; snorkel gear for all", "Kayaks, paddleboards and tenders", "Sorong airport and harbour transfers",
                 "Up to 50 nautical miles a day of cruising (this route is about 410 NM, inside the 500 NM allowance)", "ARCX voyage ledger, pre-departure briefing and 24-hour support"],
            exc=["Flights to and from Sorong (SOQ)", "Indonesian visa on arrival or e-VOA", "Raja Ampat marine park permit and local site fees <span class=\"ph-tag\">CONFIRM</span>", "12% Indonesian VAT on the charter rate",
                 "Nitrox and PADI courses <span class=\"ph-tag\">CONFIRM</span>", "Travel insurance with dive and evacuation cover (required)", "Premium wines and spirits, crew gratuities", "Hotel nights before or after the voyage"],
            deplabel="PROPOSED DEPARTURE · AX·021/27", dates="Fri 5 — Mon 15 November 2027", start="2027-11-05", end="2027-11-15", pill="PRIVATE CHARTER · UP TO 10 GUESTS",
            depnote="Silolona sails Raja Ampat from about January to April and September to November; mantas are most reliable from October to April. Dates to confirm with Silolona Sojourns.",
            prices=[("Private charter, whole vessel, 10 nights", "from US$187,000"), ("12% Indonesian VAT", "US$22,440"), ("Per guest, based on 10 guests", "about US$20,944"),
                    ("Raja Ampat permit, per guest", "Arranged by the crew, paid locally"), ("Deposit to reserve · balance due", "Set at booking")],
            pricenote="Charter from US$18,700 a night plus 12% VAT, as listed by Silolona's agents in October 2026; to confirm with Silolona Sojourns for 2027. Includes up to 50 nautical miles a day.",
            faq=[("What is the Karst & Mantas voyage?", "Karst & Mantas is an ARCX private charter aboard the phinisi Silolona: 11 days and 10 nights, Sorong round trip, through Raja Ampat in West Papua. It covers the Dampier Strait, Piaynemo, Wayag across the equator and the Misool karst, with two days built around mantas."),
                 ("Can snorkellers and divers travel together?", "Yes. Every stop on this route has a way in from the surface: mantas often rise to the surface at Manta Sandy, the Fam reefs are shallow, and the Boo Windows can be seen from above. On the few dives that suit divers only, such as Blue Magic, snorkellers kayak or explore by tender."),
                 ("When is the best time to see manta rays in Raja Ampat?", "Mantas are seen all year, but the cleaning stations of the Dampier Strait and Misool are usually busiest from about October to April. This voyage is proposed for November 2027, with manta days at Manta Sandy and Blue Magic (day 3) and Magic Mountain (day 8)."),
                 ("How do I get to Sorong?", "Fly to Sorong (SOQ) in West Papua, usually through Jakarta or Makassar. Arrive the day before, as Silolona sails on day one. The crew meets you at the airport and takes you to the harbour."),
                 ("How many guests does Silolona take?", "Silolona has five suites and is chartered whole, to one group of up to about ten guests (twelve with children), with a crew of about seventeen and a PADI dive centre on board."),
                 ("How much does the charter cost?", "Silolona is listed from US$18,700 a night plus 12% Indonesian VAT, so ten nights start at about US$187,000 plus VAT for the whole yacht, or about US$20,900 a guest for ten. Flights and the Raja Ampat permit are extra.")],
            types=["Divers", "Snorkellers", "Families", "Photographers", "Couples"],
            credits="Itinerary designed by ArcTerra for a Silolona private charter, Sorong to Sorong, 11D10N; the captain adjusts the route for weather, tides and currents. Anchorages and sea tracks are indicative and need confirming with Silolona Sojourns. Dates and prices are proposed drafts.",
            report=REPORT(["raja ampat phinisi charter", "silolona", "silolona raja ampat", "raja ampat manta rays", "manta sandy", "magic mountain misool", "wayag", "piaynemo", "raja ampat snorkelling", "raja ampat liveaboard luxury"],
                          "Raja Ampat luxury phinisi charter", "Own the 'divers and snorkellers together' angle: most liveaboard pages are dive-only, and this is the question families and mixed groups ask answer engines."),
            dayc=["#1D4E7E", "#2A6F86", "#3C8A8A", "#22605A", "#4D78A6", "#2C4F78", "#3F8EA8", "#183C58", "#2A6F86", "#3C8A8A", "#1D4E7E"], routec="#1D4E7E", css="")
    return dict(common, slug="raja-ampat-dive-karst-and-mantas", id="AX·022/27", brand="ARCX DIVE", short="Karst & Mantas · Dive Charter", h1a="Karst", h1b="&amp; Mantas",
        title="Karst & Mantas Dive Charter: Raja Ampat aboard Silolona, Divers Only · 18–28 Oct 2027 | ARCX Dive",
        desc="ARCX Dive · Karst & Mantas: a divers-only private charter of the phinisi Silolona through Raja Ampat, 18–28 October 2027. Up to four dives a day at Cape Kri, Manta Sandy, Blue Magic, Magic Mountain, the Boo Windows and Fiabacet, with Wayag across the equator. 11 days, Sorong round trip.",
        capline="ARCX Dive · AX·022/27", spin="The divers-only Silolona charter: eleven days, Sorong to Sorong, up to four dives a day from the Dampier Strait to Misool. Press pause at any time, or tap a day on the timeline.",
        band="manta-a", bandcap="Oceanic manta, Blue Magic",
        sub="ARCX DIVE · RAJA AMPAT · SORONG TO SORONG · 18–28 OCTOBER 2027 · DIVERS ONLY · AX·022/27",
        lede="One departure, one date, divers only. We've proposed Silolona's ten nights from 18 October 2027 to a single group of certified divers, with the dive plan built around the tides: Cape Kri at slack water, two manta days at Manta Sandy, Blue Magic and Magic Mountain, the Boo Windows and a night dive at Fiabacet, and the karst of Wayag and Misool between dives. Up to four dives a day, all guided by the ship's PADI team.",
        facts=[("11 days", "10 nights"), ("—", "Nautical miles"), ("Up to 4", "Dives a day"), ("18 Oct 2027", "One date"), ("Silolona", "Whole-ship charter"), ("AOW+", "Recommended level")],
        glance=[("What is the Karst & Mantas Dive Charter?", "A divers-only, whole-ship charter of the phinisi Silolona through Raja Ampat, 18 to 28 October 2027, Sorong round trip, with up to four guided dives a day."),
                ("Who is it for?", "A group of certified divers, ideally Advanced Open Water with recent experience in current, who want Raja Ampat's best sites timed to the tide rather than a shared liveaboard schedule."),
                ("What will we dive?", "Cape Kri, Manta Sandy and Blue Magic in the Dampier Strait; the Fam walls; Wayag's pinnacles; Magic Mountain, the Boo Windows, Fiabacet and Daram in Misool, plus night dives."),
                ("Why one date?", "The whole ship is held for a single dive group, so the plan bends to the tides and the mantas, not to a mixed itinerary. Snorkellers have their own voyage: Karst & Mantas, AX·021.")],
        seacap="Mantas · walls · pinnacles · night",
        sea=[("manta-a", "Oceanic manta", "BLUE MAGIC"), ("night-dive", "Night dive", "FIABACET"), ("clownfish", "Anemone city", "CAPE KRI"), ("manta-b", "Cleaning station", "MANTA SANDY"), ("reef-swim", "Hard coral", "FAM ISLANDS")],
        life=[("under-sail", "Under sail", "SILOLONA"), ("silolona", "Between dives", "SILOLONA"), ("fleet", "Silolona & Si Datu Bua", "THE FLEET"), ("karst-hero", "Surface interval", "WAYAG"), ("crew", "Papuan hosts", "ARBOREK")],
        inc=["Ten nights aboard Silolona, Sorong to Sorong, as a private divers-only charter", "Up to four guided dives a day, including night dives, with the ship's PADI dive team", "Tanks, weights, dive equipment and wetsuits for certified divers",
             "Three dive tenders, with dive briefings for every site", "All meals and soft drinks on board; house wine with dinner <span class=\"ph-tag\">CONFIRM</span>", "Sorong airport and harbour transfers",
             "Up to 50 nautical miles a day of cruising (route about 410 NM)", "ARCX Dive log, pre-departure dive briefing and 24-hour support"],
        exc=["Flights to and from Sorong (SOQ)", "Nitrox fills <span class=\"ph-tag\">CONFIRM</span>", "Raja Ampat marine park permit and local site fees <span class=\"ph-tag\">CONFIRM</span>", "12% Indonesian VAT on the charter rate",
             "Dive insurance with evacuation cover (required) and travel insurance", "Courses and certifications", "Premium wines and spirits, crew gratuities", "Hotel nights before or after the voyage"],
        deplabel="THE ONLY DATE · AX·022/27 · DIVERS ONLY", dates="Mon 18 — Thu 28 October 2027", start="2027-10-18", end="2027-10-28", pill="WHOLE-SHIP DIVE CHARTER · UP TO 10 DIVERS",
        depnote="One proposed date, held for a single dive group, inside Silolona's September–November Raja Ampat season and at the start of the manta months. To confirm with Silolona Sojourns.",
        prices=[("Private charter, whole vessel, 10 nights", "from US$187,000"), ("12% Indonesian VAT", "US$22,440"), ("Per diver, based on 10 divers", "about US$20,944"),
                ("Nitrox, per diver", "On request"), ("Raja Ampat permit, per diver", "Arranged by the crew, paid locally"), ("Deposit to reserve · balance due", "Set at booking")],
        pricenote="Charter from US$18,700 a night plus 12% VAT, as listed by Silolona's agents in October 2026; to confirm with Silolona Sojourns for 2027. Includes up to 50 nautical miles a day.",
        faq=[("What is the Karst & Mantas Dive Charter?", "It is ARCX Dive's divers-only private charter of the phinisi Silolona through Raja Ampat, 18 to 28 October 2027, Sorong round trip: 11 days, 10 nights and up to four guided dives a day, from Cape Kri and the Dampier Strait mantas to Magic Mountain and the Boo Windows in Misool."),
             ("What certification do I need?", "Open Water is the minimum, but we recommend Advanced Open Water and recent experience in current, as Cape Kri, Blue Magic and Magic Mountain can run strong. The dive team matches every site to the group and offers easier alternatives."),
             ("How many dives a day?", "Up to four, including night dives at Yenbuba and Fiabacet, with three on most full days. Passage days and the last day have fewer, and there is no diving within 24 hours of your flight home."),
             ("Where can I dive with manta rays in Raja Ampat?", "This charter dives the three classic manta sites: Manta Sandy, a reef-manta cleaning station off Arborek; Blue Magic, a pinnacle visited by oceanic mantas; and Magic Mountain, a seamount in Misool with both. October is the start of the busiest manta months."),
             ("Is nitrox available on Silolona?", "Silolona runs a full PADI dive centre with three tenders and includes dive equipment for certified divers. Nitrox availability and price are being confirmed for 2027."),
             ("Can non-divers come?", "This date is held for divers only. Non-divers and snorkellers have their own voyage on the same route, Karst & Mantas (AX·021), proposed for November 2027.")],
        types=["Divers", "Underwater photographers", "Dive clubs"],
        credits="Dive charter designed by ArcTerra for Silolona, Sorong to Sorong, 11D10N, divers only; dive sites are chosen daily by the dive team for tides, currents and conditions. Anchorages and sea tracks are indicative and need confirming with Silolona Sojourns. Date and prices are proposed drafts.",
        report=REPORT(["raja ampat dive charter", "raja ampat liveaboard", "silolona diving", "private dive charter indonesia", "raja ampat manta dive", "blue magic raja ampat", "magic mountain misool", "cape kri dive", "boo windows misool", "raja ampat october diving"],
                      "Raja Ampat private dive charter", "Own the 'single date, whole ship, divers only' angle and link it both ways with AX·021, so each page answers the other audience's question."),
        dayc=["#0E2E55", "#123A6B", "#1E6C8A", "#0B2347", "#2F9FC0", "#123A6B", "#1E6C8A", "#0E2E55", "#2F9FC0", "#123A6B", "#0B2347"], routec="#0E2E55",
        css=".nameband .bigname span{color:#9FD9E6}.dep .pill{background:#0B2347}")

MIXED = mk(False)
DIVE = mk(True)
