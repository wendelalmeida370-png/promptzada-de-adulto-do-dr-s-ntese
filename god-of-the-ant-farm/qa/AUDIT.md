# God of the Ant Farm — Stabilization milestone: audit notes & bug ledger

## 1. Architecture map (discovered)

80 js files, ~51k lines, one global `G`, all state in `G.S` (one world). Scripts load in index.html order (util → … → main → devmode).

### Simulation step (main.js `step(dt)`, dt ≤ 0.1 s; DAY_LEN = 200 s = 1 year)
1. S.clock, S.time (slows ×0.35 while a scene is watched); day rollover → `Village.onNewDay` (expansion, politics daily, …)
2. `Nature.update` (trees, fire, weather, clouds)
3. `Village.update` → faith, **`Fac.update`** → [Politics, WorldWar, War (bands), Siege, Civ, City, **Naval** (→ Know, Fishers, Expe, Fleets), Sea, **Stories** (+Party tick, Riches poll), Eco, Army, Wars, Fest]; farms/ruins/milestones (1 s), housing (2.5 s), jobs (4 s), plan (3.5 s; empty settlement → abandon)
4. `Vg.updateAll` (villager AI, tasks, movement, emergencies, babies, watchdog)
5. Life, Carnage, Animals.updateAll, Flora, Riches, Estates, Court, Trade, Migrate, Nests, **Polity, Justice, Riots, Secrets, Scene**, Caves, Pets, Powers, Lore, Events
Frame (rAF): Cinema, Photo, Scene.frame, Track.frame, Render, FX, Sky; Skip runs slices via MessageChannel instead.

### Persistence
- `Save.serialize`: core arrays (RLE/zero-run/delta), trees/rocks/bushes, buildings, villagers (**task, path, emo deleted; coup/rebel/revolt zeroed; inside → door**), dead, animals, settlements, factions (rel deduped by id, coup/rev/revolt/exec nulled), history, stats, weather…
- `saveHooks` (save/load per module): animals(eco), biomes, carnage, caves, city, economy(ores), expeditions(exps, castaways), fleets, flora, justice(execs, scaffolds), lore, migrate, miracles, naval, nests, pets, riots, sea, seaknow, secrets, siege(walls), stories(saga), trade(luxRoutes), wars(wz → resume: armies re-muster), wild, worldwar.
- NOT persisted: War.bands (raids/defence bands), Scene.list (running scenes), Fest live map (festivals in progress), task state of every villager.

### Cross-module glue
- Story engine observes the world by **wrapping** functions in `St.init` (Village.kill, War.capture/freeCaptive/startEscape/foundFree/conquer/onPeace, Politics.extinct/declareWar/crown, Animals.kill) and by explicit `St.signal(kind, d)` calls (~40 kinds).
- Dev mode wraps St.signal, console.warn/error, and (on demand) module update functions.

## 2. Bug ledger

| ID | Sev | System | Title | Status |
|---|---|---|---|---|
| L-001 | S2 | Narrative | "Sonho" never seeded in 60 years (2 seeds) | fixed (batch 1) |
| L-002 | S1 | Economy | stock.water = NaN (addStock on a key the stock does not have) | fixed (batch 1) |
| L-003 | S1 | Save/Fauna | livestock lose dom/pen/wool/milk/eggs on every load: herds turn wild, pastors lose their jobs | fixed (batch 1) |
| L-004 | S4 | Save | every load burns one id per animal (Animals.spawn takes S.nextId++ before the saved id) | fixed (batch 1) |
| L-005 | S3 | Narrative | Peregrinação: 0 in 60 years (seed 11), 1 in 25 (seed 7) — measure all story types | measured (storyfreq, 30 y): 9 seeds, 2 born, 2 fulfilled — rare by design (needs a holy place far enough); not a bug |
| L-006 | S2 | Scene | Scene.reset is never called: running scenes (and the cinematic view) survive newGame/load and can grab same-id people of the new world | fixed (batch 1) |
| L-007 | S3 | War | War 'pending' game-timers (delayed execution) survive War.reset → can fire in another world | fixed (batch 1) |
| L-008 | S4 | Siege | boiling oil splices b.engines inside for-of over it: the next ram is skipped | fixed (batch 1) |
| L-009 | S3 | Narrative | story signals queued in one world are flushed in the next (newGame/load): a death of the old world becomes a fact of the new one, with kin looked up by recycled ids | fixed (batch 1) |
| L-010 | S3 | Render/Sea | quay crates & net racks cached by building id keep the old building object after a load → frozen crates | fixed (batch 1) |
| L-011 | S4 | Court/UI | tavern brawls, story cards, follow tracker keep old-world entries (ids/clock) after newGame | fixed (batch 1) |
| L-012 | S2 | War | a separate peace between A and B inside a multi-party war (an ally joined = one war object) sends home A's armies fighting C; after it, a victorious army may pick its next town among the new friend's (foesOf ignores the truce) | fixed (batch 2) — test t_l012: before FAIL, after PASS 2/2 |
| L-013 | S3 | War | occupied town with loyalty exactly 0 can never rise: (loyalty \|\| 50) | fixed (batch 1b) |
| L-014 | S3 | City | an internal trade cart lifts a town at loyalty 0 to 61.5: (loyalty \|\| 60)+1.5 | fixed (batch 1b) |
| L-015 | S3 | Naval | a ship at morale 0 cannot be captured: (mor \|\| 70) | fixed (batch 1b) |
| L-016 | S4 | Caves/Court | oracle credibility 0 shown as 50%; legitimacy 0 treated as 50 in palace/city bonuses | fixed (batch 1b) |
| L-016b | S4 | Caves/Story | oracle with cred 0: a fulfilled prophecy jumps it to 65, a failed one *raises* it to 30; legit 0 never makes the merchants grumble | fixed (wip, batch 1c) |
| L-018 | S3 | Fishers | a fisherman away on another ship (voyage/fleet) keeps a place in his fishing boat's roster: the boat sails short-handed; checker "tripulante a bordo de outro navio" | fixed (batch 2) |
| L-019 | S2 | Naval | removeShip frees only the crew list: passengers/soldiers aboard (aboard = id) of a removed ship stay aboard a ship that no longer exists | fixed (batch 2) |
| L-020 | S3 | Fauna/Pets | the animals' spatial grids (who is near whom, rebuilt every 0.25 s) and the pigeons' people grid survive a world switch: right after newGame/load the beasts flee from, or hunt, the previous world's people and animals (a predator can lock on an old animal whose id is recycled in the new world); also the root of non-reproducible runs | fixed (batch 3) |
| L-021 | S4 | All | module timers/accumulators (fireAcc, slowAcc, tSlow, tMgr…) keep their phase across worlds (the menu world runs in real time): harmless offsets, but a world can't be replayed bit-for-bit from its seed | POSSÍVEL MELHORIA (reset in worldHooks) |
| L-022 | S3 | WorldGen | first people placed in the sea when 10 random tries around a small-island start all fail | fixed (batch 3) |
| L-023 | S4 | Fauna | a fleeing land animal may cut through shallow sea (fleeTarget falls back to a target without a clear line) | noted |
| L-024 | S4 | War | the battle record was capped on two of three creation paths | fixed (batch 3) |
| L-025 | S4 | Text | "fundou … em o porão" (no contraction) | fixed (batch 3) |
| L-026 | S2 | Naval | six places reset a ship's crew list (end of voyage, fleet disbanded, transport re-tasked, prize) without putting ashore whoever was still aboard; Nv.aboardOf only sees the list → fishermen stuck "aboard" an idle boat at the quay for 10+ years (all 4 long soaks) | fixed (batch 4): Nv.clearCrew at every reset + reconcile (counted, reported by the checker); soak D2: violation gone, 0 repairs |
| L-027 | S3 | Naval | a quay that changes hands (conquest, secession, treaty) keeps its boats under the old flag — or a dead people's flag | fixed (batch 4): idle docked ships follow the dock's owner; a dead people's idle ships are abandoned |
| L-028 | S4 | Secrets | two orders took the same cave as lodge: the same witness saw both rites, the same line told twice | fixed (batch 4) |
| L-029 | S4 | Naval | dead men stayed on warships' crew lists for decades | fixed (batch 4) |
| L-030 | S4 | Politics | the same two neighbours came to blows twice a day (border skirmish has no daily limit) | fixed (batch 4) |
| L-031 | S4 | Life | the "carried" flag outlived babyhood (harmless: every reader also checks age < 2) | fixed (batch 4) |
| L-032 | S3/perf | AI | a small child "following" its mother who is out on a boat ran a full path search every second (100+ failures in a row) | fixed (batch 4) |
| L-033 | S3 | Waters | pearl divers never reached their reef (shore tile = cliff-top rock, walkable but not enterable): 0 dives in 20 years, 9 690 failed searches | fixed (batch 4): go beside it; a day's rest after a real failure |
| L-034 | S1 | City/AI | a store whose front corner (frontTile = bottom-right footprint tile) opens on the sea is unreachable; the nearest-store choice never tries another: a whole town starved 3 tiles from its food (46 people failing, 2 children dead in 20 y, istmo montanhoso) | fixed (batch 4): frontTile picks a corner with dry ground beside it; eating tries the town's other stores → 0 failures, 0 hunger deaths; deliveries/builds failing: thousands → 0 |
| L-035 | S4 | Repro | audio shares Math.random with the simulation and throttles by the audio clock: a world's course depends on whether/when sounds play | harness mutes audio; POSSÍVEL MELHORIA: a private RNG for audio |
| L-036 | S2 | Narrative/AI | the scaffold story's rescued pair fled to the nearest foreign town in a straight line — across the sea; and a migration with no way there fell back to a same-people village anywhere: homeless, unreachable, starved | fixed (batch 4): refuge and fallback on the same land; checker invariant "mora numa terra aonde não chega a pé" |
| L-037 | S4 | Caves/Fauna | a cave that collapses during a storm keeps the animals sheltering inside in its list forever (saved and reloaded, never counted among the dead); the ones still heading there keep `shelter` = a cave that is gone and are never sheltered again | fixed (batch 5) |
| L-038 | S3 | Secrets/Narrative | an order's meeting place is never checked again: the tavern pulled down, the cave fallen in, the town lost — the order keeps meeting "no porão da taverna" that no longer exists (and the stories say so) | fixed (batch 5): a gone house moves to a new one near the same town (or the master's), keeping its id for the stories; test lodge1: repo BUG on both (storehouse pulled down, cave collapsed) → fixed: "uma clareira no bosque perto de Argos", the cave's order to another cave |
| L-039 | S3 | City/AI | housing is not a fixed point: a single mother in an overcrowded house is moved out as a "grown single adult", her small children follow her to the new house, which then overflows… the family flips houses every 2.5 s (the save/load diffs on `home` in every long soak) | fixed (batch 5): the parent the children live with does not move out to free a bed; test home1 (archipelago, 11 y, pop ≈95): repo 12 people re-housed on a rerun of housing, 4 flipping back, 180 home changes in 0.8 day → fixed 0 / 0 / 0 |
| L-040 | S2 | Save | the autosave (every 45 s, on tab hide, on close) fails in silence when the browser storage is full: the old save stays, the player keeps playing for hours believing the world is kept | fixed (batch 5): a failed autosave says so (at most once per 10 min); test quota1: repo 3 failed autosaves, 0 notices → fixed 3 failures, 1 notice, the next save after space returns works |
| L-041 | S2 | Naval | a man stays on a warship's list while aboard another ship (a planned crew member whose walk to the quay was cut short, who then took a fishing boat) — checker S2 in the 60-year soak D4 | fixed (batch 5): the periodic crew reconcile drops whoever is aboard another ship |
| L-042 | S3/perf | AI | regression of L-034: someone who can reach none of the town's stores searched up to four paths at every thought (the failed-search memory holds one target, so alternating four never hits it) and counted four failures per meal: streaks of 400–950 "failed paths" in the 60-year archipelago soak (≈110 before batch 4) | fixed (batch 5) — traced (dump_pf2: 49 failed meals in 24 s, 3 stores each — and the same store reached once for building): the stores are on the same land, behind a cliff detour longer than the default A* budget (3 500 nodes). Fixed (batch 5): the nearest store gets an 8 000-node search; one failed meal = one failure, then 12 s of gathering |
| L-044 | S0 | Secrets | an order left with no meeting place (its only house raided — or, with the first L-038 patch, gone with nowhere to move) threw from the secrets' tick when a witness spoke (the place's name of an undefined place) — found by the 31-year archipelago soak of batch 5 | fixed (batch 5): the place's names are safe for an order with no house (it finds one again when it recruits) |
| L-045 | S1 | Main loop / Time skip | one exception anywhere in a frame stopped the game for good (the next frame is asked for at the end of the frame), and one inside a time-skip slice left the skip screen up forever | fixed (batch 5): a broken frame is reported in the console and the next one comes; a broken skip ends as "parado"; and each module of the step (and of Fac.update) runs on its own: test bulk1 — Secrets throwing on every step for 1.5 days: 3 000 errors counted (3 printed), the world went on (34 chronicle lines, 7 births, the stories ticked 3 000×) |
| L-046 | S0 | Narrative | the scaffold's failed rescue plants a vengeance with no place; the vengeance's opening reads s.place.x — the throw from the story engine stopped the world (repro: continente 96, 3 peoples, belicoso, seed 7, before year 8; test vgnp: repo "Cannot read properties of null (reading 'x')" → fixed "O Juramento de …") | fixed (batch 5): the oath is sworn at the scaffold; a vengeance without a place still begins (3 readers guarded); a story whose opening throws is dropped with a warning |
| L-047 | S2 | War/AI | a captive freed overseas (peace exchange while carried on the captor's ship, the god's Liberation, the captor's death) was sent home on foot across the sea and stayed in the captor's land "living" in a town they could never reach — chaos run (archipelago): 8 people for decades | fixed (batch 5): freed overseas → their own people's village on this land, or they stay free as guests where they were held; no escape on foot to another island; a daily pass takes in anyone living across the water (outside voyages, wrecks, bands, caves): own village on this land > a town not at war (guest) > only enemies: taken, like a castaway on a hostile shore > nobody: a castaway's camp. Chaos run re-done: 0 lasting cases (checker: S2 only after 2 days) |
| L-048 | S2 | AI | someone shut in a pocket between buildings (the same "land" on the map — buildings are not in the land ids — but no way out on foot) walks about in it and starves beside a full store (demog2: hunger 100, stores 6–20 tiles away, no path even unbounded, nor to the town centre; 439 food in stock): the watchdog only helped people standing still, and L-042's pause made them fail less often | fixed (batch 5): a meal failing at every store asks the watchdog at once; 8 failed paths in a row count as stuck even on the move (the watchdog moves them only when home is out of reach) |
| L-043 | S4? | War | a guerrilla band may fight to the last man instead of melting away when it bleeds (suspected from reading; not reproduced in guer1 runs) | open — fix prepared (fix6_guerrilla.py), not applied: unconfirmed |
| L-049 | S3 | Narrative | a captive moved from town to town and back made the rescue re-tell "levaram para outra cidade" for a town already told | fixed (batch 5) |
| L-050 | S3 | Narrative | inquiry: each empty night of the vigil wrote the same chapter ("passou a noite em claro ... Ninguém veio.") — 3 identical chapters; generic guard added: a story never repeats one of its last 6 chapters | fixed (batch 6) |
| L-051 | S3 | AI/Diplomacy | someone pushed out of a building footprint had their task reset to step 0: an envoy who had already handed over the gifts walked back and handed them over again (two identical chronicle lines the same day, the gift paid twice); any multi-step errand could repeat its one-shot effect | fixed (batch 6): re-route to where they were going, keep the step; envoy delivers once (t.said) |
| L-052 | S3 | Diplomacy | the war, the court (polity) and the diplomats could each send a peace envoy to the same ruler at once: "recusou a paz oferecida" twice the same day | fixed (batch 6): one envoy with the same message on the road at a time; (batch 6g) with no envoy to send the offer arrives at once, so two offers the same day still gave two refusals (soak 105, year 16): a ruler who has refused a peace today does not answer another today |
| L-053 | S3 | Save/Menu | a damaged save that fails half way through loading (e.g. a building of a kind this build does not know) was refused, but the half-built world stayed behind the menu: every frame threw in Villagers/Eco/render until a new world was started (corrupt.js) | fixed (batch 6b): the menu gets a fresh world; unknown building kinds are left out on load; a chronicle line with a NaN/null position is written without one |
| L-054 | S3 | Save | a save without its map size (N) was read into a 64×64 map whatever its real size: the world loaded broken (people "off the map", the animals' AI throwing 2 000 times a year, frames failing on non-finite values) — only a damaged save, but the result was a broken world instead of a refusal (corrupt.js "sem a seção N") | fixed (batch 6c): the size is read from the saved terrain itself; a save whose terrain does not match its size is refused |
| L-055 | S2 | AI/Hand | someone thrown by the god more than 30 tiles from any shore never swam: the swim found no land within 30, ended at once and began again every second — a person floating forever in deep water, never tiring, never drowning (hand.js: a child thrown into the open sea, still there 0.3 y later) | fixed (batch 6c): the swim looks for the nearest shore however far (up to 90) and drowns on the way if it is too far; with no shore at all they drown |
| L-056 | S3 | Save | a save that lost a section kept an undefined in its place: no "milestones" → the village tick threw 2 000 times a year; no nextId → the newborn's ids would be NaN; no faith/era/awareness → undefined in the HUD (corrupt.js) | fixed (batch 6d): a lost section keeps the new world's default; the next id is recomputed above every id when missing or too low; a save with no day or clock is refused |
| L-057 | S2 | City/Fishers | a quay could be built where the town cannot walk to: dockSite only asked for dry ground by open water within 18 tiles — the map's "same land" does not see walls, buildings or steps. Its fishermen fetch the net, fail to reach the quay, give up and start again forever; the boat never fishes (sea test 5 on DET seed 3 fails on every build since before the stabilization: the quay spot was a pocket — the dock above, a cliff beside, water around) | fixed (batch 6e): the dock site is walked to from the town before it is chosen; whoever cannot reach the quay spot waits by the dock's door, and the catch is picked up from there; test 5 DET seed 3: FAIL on 4 builds → PASS. (batch 6i) the first version walked from the town's centre — in a grown town a yard boxed in by houses — so some towns never got a quay (sea test 4: the Egyptians with 0 boats); now it walks from where a townsman stands, over the 12 best sites; and nobody stepping down into a boat (it crosses a little water) is sent swimming |
| L-058 | S3 | Save | a person whose saved record lost a field (x, y, traits…) threw in the villagers' tick 2 000 times a year (corrupt.js "campos de gente apagados") | fixed (batch 6f): a lost field gets what a newborn would have; a lost position puts them at their town |
| T-009 | test | Sea t17 #14 | without DET the test lets the reloaded world run 400 ms of live frames at speed 1 before reading it: an expedition about to meet natives does so in that window ("exploracao" → "contato") | DET: PASS on batch 5 and 6; not a save bug |
| L-059 | S3 | Chronicle | two systems telling the same event the same day wrote the same line twice ("Hedeby chama seus defensores: 14 pegam em armas." in the 60-year soak; the envoys and refusals before L-051/L-052) | fixed (batch 6h): the chronicle does not write a line it already wrote today |
| T-008 | test | Sea t17 #8/#9 | both need the voyage to walk on new land; when the chosen voyage turns back having found nothing the case has nothing to measure and reads FALHOU (seen 1 in 3 runs) | inconclusive by construction, not a game bug |
| T-007 | test | Sea t17 #9 | waited due−day+0.6 days for home to give up on the lost voyage; the day counter is whole days so home gives up on the first morning after the due date — the window could end before it | test fixed (wait until presumed, up to due+1.6) |
| T-001 | test | Sea t17 #13 | asserted a wreck always remains; by design a small boat with no dead leaves one half the time (Nv.addWreck) | test fixed |
| T-002 | test | Sea t17 #1 | "≤ 6 voyages in 12 y" predates 29a4dbf (every island people takes to the sea); the case is about not colonizing everything (≤ 1 colony) | bound → 10 |
| T-003 | test | QA checker | ship states prep/unload/embark/wait/land are moored, not sailing (false "navegando sem ninguém") | checker fixed |
| L-017 | S4 | Life | cross-border love and royal marriages do not check kinship (courtship does): after a secession, siblings could be wed | fixed (batch 4) + checker invariant 'companheiro é parente próximo' |
| D-002 | design | Save | work inside caves/mines (ug) is interrupted by a save like work inside buildings: on load the person stands at the mouth/door | n/a |
| T-010 | test | War w10 #7 | "paz" needs the first war to end by treaty; it read FAIL on batches 5 and 6 (non-DET) and on one DET run of batch 5 — the same DET run repeated read PASS (fim 12, treaty): w10's DET is not bit-exact (wall-clock budgets), so the outcome varies; a war can also legitimately close without a treaty (a people falls, divine peace, the world war's truce). DET final build: PASS (fim 13, treaty) | flaky by design; final build passes |
| T-011 | test | Sea t17 #13 | counts the drowned's kin in mourning 1.2 days after the wreck; a blood relative mourns 0.8 day (a partner 1.5): with no partner aboard the count is 0 by design | test window, not a bug |
| T-012 | test | Sea t17 #4 | "every island people fishes" assumes every capital has a usable coast; on DET seed 11 the Egyptians' town has none (affinity 0.27, 0 docks) on batch 5 as on the final build | world-specific; the non-DET run passes (Egyptians: 3 boats, 8 voyages) |
| D-003 | design | WorldGen | on tight maps (istmo/alpino) start spacing degrades to 6–9 tiles (min-distance relaxes ×0.8 until 6) | POSSÍVEL MELHORIA: fewer peoples instead of crowding |
| D-004 | design | Repro | newGame seeds with Date.now ^ random: a world can't be recreated from a seed in-game | POSSÍVEL MELHORIA (dev mode: seed field) |
| D-005 | design | Naval | merchant ships are crewless abstractions (fishing, expedition, war and transport ships carry real people) | POSSÍVEL MELHORIA |
| D-006 | Secrets | a working mine (a cave with miners all day) can be chosen as a secret order's meeting place | POSSÍVEL MELHORIA: leave mines out of lodgeNear |
| D-001 | design | Riots | a riot in progress is dropped on load ("a riot is a moment") — documented intent, not a bug | n/a |

## Details

### L-001 Sonho never born
- Observed: 0 dream seeds in 60 years (seed 7 and seed 11), director loose.
- Measured (seed 7, 25 y): 8 tales by the fire, 43 children, 19 with the right temperament; the 'conto' fact reached the archetype **0 times**.
- Root cause: OBS.tale → placeOfTale(tale) returns a place only for chronicle events with a sea/cave/wonder/meteor/mountain icon or within 8 tiles of a named relief place. Most tales are the elder's own memories (bio, weight 4 each), which carry no place even when they are about the sea (voyage, discovered, wrecked, castaway, colonist, sawLand). For 'mar' the dream target is recomputed from the child's home (coastFor), so a sea memory is enough.
- Fix: sea memories carry ic 'sea'; placeOfTale's sea branch falls back to the nearest sea anywhere.

### L-002 NaN in stock
- Observed: Pólis de Argos/Clã de Hrafn stock.water = NaN at year 5 (soak seed 7 continente 96).
- Root cause: V.addStock(k,n): add = max(0, min(n, cap - f.stock[k])) with f.stock[k] undefined → NaN. Water carried from the well (v.carry {k:'water'}) is dumped into the store by every "drop what you carry" path (band return, army supply, trade, war call-up).
- Fix: addStock ignores water (never a store good) and non-positive/NaN amounts and treats a missing key as 0; load sanitizes non-finite stock values (old saves).

### L-003 Herds turn wild on load
- Observed: pastors (job curral) become guerreiro/oleiro after a save→load; canon diff on role/job.
- Root cause: the animal serialization in save.js omits dom, pen, wool, milk, eggs, shorn, tended; spawn defaults dom=0, pen=0 → every livestock animal becomes wild; pens are empty; jobs are reassigned.
- Fix: serialize the herd fields; restore state 'pen'.

### L-004 Ids burned on load
- Root cause: Sv.apply → Animals.spawn(kind,x,y,saved) runs id: S.nextId++ before the saved id overrides it.
- Fix: restore S.nextId after the animals are recreated.


## 3. Candidate risks to test
- R5 (unconfirmed): one non-deterministic regression run (w10 medium) recorded a battle where one side lost 117 of 118 with none wounded, captured or fled, during a guerrilla phase. Mechanism suspected: out of a formal battle a company regains morale fast (+0.3/s), so a guerrilla rarely breaks. Not reproduced: deterministic w10 medium ×4 (both builds) and 4 forced guerrillas (one broke and fled at 60% losses, the rest ended on the 70 s clock). A fix is prepared (qa/fix6_guerrilla.py: melt away after losing 2 in 5) but NOT applied without a repro.
- R1 save/load: armies re-muster on load (phase → mobilizar); siege continuity?
- R2 save/load: raid/defence bands (War.bands) are not saved → soldiers mid-raid lose their band; captives being escorted lose 'escorted'.
- R3 save/load: running scenes and festivals in progress are dropped.
- R4 villager tasks dropped on save: aboard/condemned/jail/escorted/scene restored by whom?

## 4. Harness notes
- Deterministic runs: init script seeds Math.random, freezes Date.now, stubs requestAnimationFrame before page scripts (the menu world never runs), reseeds at each chunk (music timers draw random numbers between chunks). Verified: 1500 steps identical; a 6-year soak with save/load cycles identical across two runs.
- saveloop.js: serialize→apply ×3: the save is a fixed point except per-villager AI jitter (think/scan, re-randomized on load by design) and default fields (hood, dz, robe, sac, wind, stormT).
- genmx.js: 40 worlds per run over 5 map types × 6 sizes × 5 climates × 5 reliefs × tempers × 1–6 peoples: no exceptions, no NaN heights, no animals in water; 1 world in 40 had 1–2 starting people in shallow sea (to investigate).
- T-005: sea test 8 ("ilha conhecida só por quem soube") needs the expedition to land somewhere new; with t17 made deterministic (DET=1: frozen clock, no menu frames), the pre-batch-4 build also fails it on seed 7 (the expedition comes back from an empty sea). A flaky test by design, not a regression — judge it over several seeds (DET seeds 3/7/11: old build 2/3, new 1/3; the phase traces of both builds show the same failing path: voyage → course ends with no region → a new leg cannot be plotted → home, "Não trouxe nada além de histórias do mar").
- T-006: "bando N: membro morto/inexistente" (S1) can be seen once right after a death: a raid band prunes its list on the war tick (every 0.5 s), so a death between two ticks is listed for < 0.5 s. A checker artifact, not a lasting state (chaos run: 1 hit in 213 iterations).
- Checker: castaways (v.wrecked) are not "living where they cannot walk" — the expeditions module re-tasks them (camp / native town / home); they were a false positive after a save (tasks are not saved).
- performance.memory is bucketed and cached by Chromium unless `--enable-precise-memory-info` is passed: heap figures from runs before that flag (ev.js/soak.js now carry it) are coarse (the 15-world loop read 23.1 MB every time). Re-measured with the flag in the memory phase.
- QA.canon drops `ug` (underground): a save never keeps anyone in a cave or mine — load brings them out at the mouth by design (caves.js load hook), so it showed up as a save/load "diff" in every long soak.
