# NORD Motor and Drive Explorer

A self-contained, single-file interactive atlas for drive and motor engineering: power circuits, modulation,
motor physics, encoder and tuning behaviour, functional safety, communications, and now **motor failure**.

Open `NORD-motor-and-drive-explorer.html` in any modern browser. No build step, no server, no dependencies.
Everything — styles, SVG scenes, models, embedded reference documents — lives in the one file (about 14 MB).

## The motor failure chapter

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
- six reference cards on statistics, diagnostics and root-cause discipline.

The numbers are teaching models built on published rules (IEC 60034, IEEE 43/1415, ISO 20816, NEMA MG 1,
EASA AR100). They are not a reliability prediction for any specific machine.

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
