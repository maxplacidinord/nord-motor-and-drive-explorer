# NORD Motor and Drive Explorer

A self-contained, single-file interactive atlas for drive and motor engineering: power circuits, modulation,
motor physics, encoder and tuning behaviour, functional safety, communications, and now **motor failure**.

Open `NORD-motor-and-drive-explorer.html` in any modern browser. No build step, no server, no dependencies.
Everything — styles, SVG scenes, models, embedded reference documents — lives in the one file (about 14 MB).

## The motor failure chapters

Chapter 43, **Where motors fail — evidence, mechanism and prevention**, sits under the Motor lesson
(`#motor`) in the lesson menu and is deep-linkable at:

```
NORD-motor-and-drive-explorer.html#motor-failure
```

It covers:

- the five failure families and their published shares — bearings, stator winding, rotor, shaft/coupling,
  application and environment;
- a clickable motor cross-section that ties each family to the physical part;
- the evidence chain for each family: what you see, the test that proves it, and the fix;
- an insulation-life model (Montsinger, 10 K per halving, Class F 155 °C reference);
- NEMA voltage-unbalance derating and the 2 × (%unbalance)² temperature-rise penalty;
- six reference cards on statistics, diagnostics and root-cause discipline, plus field photographs of an
  overheated stator and a squirrel-cage rotor.

Chapter 44, **Watch a drive fail — from symptom to trip** (`#failure-in-motion`), is the animated companion:

- inject one of six faults (bearing, insulation, rotor bar, misalignment, cooling, supply unbalance);
- the motor rotates, shakes and heats while damage accumulates, with a drive display, protection LEDs,
  a spectrum-signature panel and a protection trip at the end;
- live vibration, current and winding-temperature traces show which channel moves first;
- pause, reset, start from a chosen damage level and run at 1×, 4× or 12× time scale.

Both chapters are teaching models, not reliability predictions or settings advice. See the limits note on
each page. The numbers are built on published rules (IEC 60034, IEEE 43/1415, ISO 20816, NEMA MG 1,
EASA AR100).

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
