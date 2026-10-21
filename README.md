# NORD Motor and Drive Explorer

A self-contained, single-file interactive atlas for drive and motor engineering: power circuits, modulation,
motor physics, encoder and tuning behaviour, functional safety, communications, motor failure, and now
**cables and connectors**.

Open `NORD-motor-and-drive-explorer.html` in any modern browser. No build step, no server, no dependencies.
Everything — styles, SVG scenes, models, embedded reference documents — lives in the one file (about 1.75 MB).

## The motor failure chapter

Chapter 43, **Where motors fail — evidence, mechanism and the trip**, sits under the Motor lesson
(`#motor`) in the lesson menu and is deep-linkable at:

```
NORD-motor-and-drive-explorer.html#motor-failure
```

It is one section, not a reading page followed by a separate animation. Selecting a failure family
switches the evidence, the traces and the simulation together:

- five failure families and their published shares — bearings, stator winding, rotor, shaft/coupling,
  application and environment;
- a clickable, animated motor cross-section where each mechanism moves differently: bearing rattle with
  impact rings and local heat, stator arcing with charred coils and smoke, rotor speed wobble with a hot
  bar and growing crack, shaft orbit with eccentric offset, and cooling loss with a slowing fan and broad
  heat — damage overlays appear only for their own family;
- a drive panel with READY → WARN → ALARM → TRIP, protection LEDs, health bar, estimated time to trip and
  the protection code;
- a spectrum-signature panel (1×, 2×, BPFO, f(1±2s), 2×line) with a lime dominant bar, hover explanations
  and a dynamic "what this signature means" line, plus live vibration, current and winding temperature
  traces, so you can see which channel moves first;
- the evidence chain for the selected family: primary stress, first test, prevention;
- live hot-spot temperature and Montsinger insulation-life readouts, plus the NEMA unbalance derating
  background in the reference cards;
- nine reference cards, including a worked spectrum example (1475 rpm, 50 Hz, s ≈ 1.7 %) and field
  photographs of an overheated stator and a squirrel-cage rotor.

Controls: failure family, time scale (1× / 4× / 12×), start with 0–95 % damage, Pause and Reset.
The simulation is a teaching model, not a reliability prediction or settings advice. The numbers are built
on published rules (IEC 60034, IEEE 43/1415, ISO 20816, NEMA MG 1, EASA AR100).

Below the stage, every chapter's notes and reference cards are laid out as a single-column article (a
720 px measure) with larger type, section headings and full-width figures, so long explanations read as
prose instead of being squeezed into a card grid.

## The wiring and cables chapter

Chapter 44, **Wiring, cables and connectors**, has its own **Cables and wiring** group in the journey and
the Chapters menu. It is deep-linkable at:

```
NORD-motor-and-drive-explorer.html#cables-connectors
NORD-motor-and-drive-explorer.html#wiring
```

The home journey also has a direct **Wiring and cables** button. Inside the chapter, use the **Section**
selector to move between five views:

- **Connection chain** — separate versus hybrid routes from drive to motor, with power, brake, thermistor
  and encoder circuits.
- **Motor cable** — a cross-section with U/V/W/PE, brake and thermistor pairs, overall shield, and a
  shield-termination comparison.
- **Encoder cable** — incremental A/B/Z and complementary tracks versus an absolute position word, with
  resolution and homing readouts.
- **Connector pinout** — representative M12 and HAN faces and pin maps, including HAN Q5 power in and
  HAN Q8 motor.
- **Cable selection** — power, hybrid and signal families mapped to common applications and connector ends.

Six reference cards cover the connection chain, motor-cable construction, incremental versus absolute
encoders, connector families, subtle cable variants and pre-power wiring checks. Five inline figures
accompany the prose.

Pinouts and colours are representative examples from NORD internal wiring documents. They are teaching
aids, not an installation instruction; verify the device label, the cable data sheet and the manual before
wiring.

### Photograph credits

The field photographs in chapter 43 are embedded from Wikimedia Commons:

- Overheated motor interior — K.kudelina, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Squirrel-cage rotor — Zureks, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

They are reproduced unmodified apart from resizing, with attribution in the page itself.

## Using the atlas

- `Home` returns to the interactive power circuit.
- Click highlighted parts of a drawing to step into the matching lesson.
- `Present` hides the editing chrome for a walkthrough; `View options` controls labels, guides and readouts.
- Lesson URLs use the hash, for example `#motor`, `#vf-flux`, `#motor-failure`.

## Repository

- `NORD-motor-and-drive-explorer.html` — the complete explorer.
- `README.md` — this file.

The explorer is a working knowledge base, not a certified engineering document. Always verify settings against
the actual NORD manual and the machine nameplate.
