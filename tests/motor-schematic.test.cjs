// Run with: node --test tests/motor-schematic.test.cjs
// Tests the actual drawn conductors as well as the teaching model. Expected
// junctions come from M7000 A34/A35; the internal Dahlander ring is the cited
// Six Team catalogue p.28 equivalent circuit, not a NORD slot-winding drawing.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../NORD-motor-and-drive-explorer.html'), 'utf8');
const start = html.indexOf('// BEGIN MOTOR TERMINAL WIRING');
const end = html.indexOf('function mwMount()', start);
const tweenStart = html.indexOf('function mwInterpolate(', end);
const tweenEnd = html.indexOf('function mwSvgNode(', tweenStart);
const frameStart = html.indexOf('function mwFrame(', tweenEnd);
const frameEnd = html.indexOf('function mwDraw(', frameStart);
assert.ok(start >= 0 && end > start && tweenEnd > tweenStart && frameEnd > frameStart);
let requestedFrames = 0;
let reducedMotion = false;
const context = vm.createContext({
  settings: {}, chapter: 45, C: ['#5bd9ff', '#ffc475', '#c5a1ff'], G: '#9aefb3', L: '#b7f568', M: '#9fb0c7',
  maLink: (url, label) => `${label} ${url}`, maEscape: value => String(value),
  matchMedia: () => ({ matches: reducedMotion }),
  $: () => ({ textContent: '' }),
  requestAnimationFrame: () => ++requestedFrames,
  mwPaint: () => {}
});
vm.runInContext(html.slice(start, end) + '\n' + html.slice(tweenStart, tweenEnd) + '\n' + html.slice(frameStart, frameEnd) +
  '\nthis.api={mwBuildScene,mwConfig,mwInterpolate,mwCurrent,mwNodeVoltage,mwFrame,mwMotion};', context);
function setup(overrides = {}) {
  context.settings = { mwView: 'iec', mwConnection: 'star', mwPlate: '230400', mwHz: '50',
    mwVoltage: 'low', mwSpeed: 'low', mwMotorSpeed: 30, mwFanOn: true, ...overrides };
  const config = context.api.mwConfig();
  return { config, scene: context.api.mwBuildScene(config) };
}
const coils = scene => Object.entries(scene.paths).filter(([, p]) => p.kind === 'coil');
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function onSegment(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], length2 = dx * dx + dy * dy;
  const t = length2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length2)) : 0;
  // The renderer resamples corner polylines; its tiny rounding is covered by
  // the actual line radius. Deliberate wire bridges have a 12px clearance.
  return distance(p, [a[0] + dx * t, a[1] + dy * t]) <= 2;
}
function drawnGroups(scene) {
  const contacts = [], wires = [], named = new Map();
  const add = (point, name) => { const i = contacts.length; contacts.push(point); if (name) { if (!named.has(name)) named.set(name, []); named.get(name).push(i); } return i; };
  for (const [id, p] of Object.entries(scene.paths)) {
    if (p.opacity < .001) continue;
    if (p.kind === 'coil') { add(p.points[0], p.ends[0]); add(p.points.at(-1), p.ends[1]); }
    else if (p.kind === 'wire') {
      const feed = id.match(/^(?:feed-|nfeed|dfeed)([012])$/);
      const name = feed ? (scene.view === 'steinmetz' && feed[1] === '1' ? 'N' : `L${Number(feed[1]) + 1}`) : undefined;
      wires.push({ points: p.points, a: add(p.points[0], name), b: add(p.points.at(-1)) });
    }
  }
  const parent = contacts.map((_, i) => i);
  const root = i => parent[i] === i ? i : (parent[i] = root(parent[i]));
  const join = (a, b) => { parent[root(a)] = root(b); };
  for (let i = 0; i < contacts.length; i++) for (let j = 0; j < i; j++) if (distance(contacts[i], contacts[j]) < .01) join(i, j);
  for (const wire of wires) {
    join(wire.a, wire.b);
    for (let i = 0; i < contacts.length; i++) {
      if (wire.points.some((p, j) => j && onSegment(contacts[i], wire.points[j - 1], p))) join(i, wire.a);
    }
  }
  const groups = new Map();
  for (const [name, ids] of named) {
    assert.ok(ids.every(i => root(i) === root(ids[0])), `Repeated terminal ${name} must remain electrically common`);
    const id = root(ids[0]); if (!groups.has(id)) groups.set(id, []); groups.get(id).push(name);
  }
  return [...groups.values()].map(group => group.sort()).sort((a, b) => a.join().localeCompare(b.join()));
}
const normalise = groups => groups.map(g => [...g].sort()).sort((a, b) => a.join().localeCompare(b.join()));
const star = [['L1', 'U1'], ['L2', 'V1'], ['L3', 'W1'], ['U2', 'V2', 'W2']];
const delta = [['L1', 'U1', 'W2'], ['L2', 'V1', 'U2'], ['L3', 'W1', 'V2']];
const electricalCases = [
  ['IEC star', {}, star],
  ['IEC delta', { mwConnection: 'delta' }, delta],
  ['fan star', { mwView: 'fan' }, star],
  ['fan delta', { mwView: 'fan', mwConnection: 'delta' }, delta],
  ['Steinmetz (capacitor is not a wire)', { mwView: 'steinmetz' }, [['L1', 'U1', 'W2'], ['N', 'V1', 'U2'], ['W1', 'V2']]],
  ['NEMA 230 V parallel', { mwView: 'nema' }, [['L1', 'T1', 'T7'], ['L2', 'T2', 'T8'], ['L3', 'T3', 'T9'], ['T4', 'T5', 'T6'], ['internal']]],
  ['NEMA 460 V series', { mwView: 'nema', mwVoltage: 'high' }, [['L1', 'T1'], ['L2', 'T2'], ['L3', 'T3'], ['T4', 'T7'], ['T5', 'T8'], ['T6', 'T9'], ['internal']]],
  ['Dahlander low', { mwView: 'dahlander' }, [['L1', '1U'], ['L2', '1V'], ['L3', '1W'], ['2U'], ['2V'], ['2W']]],
  ['Dahlander high', { mwView: 'dahlander', mwSpeed: 'high' }, [['L1', '2U'], ['L2', '2V'], ['L3', '2W'], ['1U', '1V', '1W']]]
];
for (const [name, settings, expected] of electricalCases) test(`${name}: rendered wires form the documented electrical nodes`, () => {
  assert.deepEqual(drawnGroups(setup(settings).scene), normalise(expected));
});
test('Every configuration draws complete finite windings within the schematic', () => {
  for (const mwView of ['iec', 'fan', 'steinmetz', 'nema', 'dahlander', 'pm'])
    for (const mwConnection of ['star', 'delta']) for (const mwVoltage of ['low', 'high']) for (const mwSpeed of ['low', 'high']) {
      const { scene, config } = setup({ mwView, mwConnection, mwVoltage, mwSpeed });
      assert.equal(coils(scene).length, ['nema', 'dahlander'].includes(mwView) ? 6 : 3);
      for (const p of Object.values(scene.paths)) for (const [x, y] of p.points) {
        assert.ok(Number.isFinite(x) && Number.isFinite(y));
        assert.ok(x >= 0 && x <= 1100 && y >= 0 && y <= 680);
      }
      for (const [, p] of coils(scene)) for (let t = 0; t < Math.PI * 2; t += .13) assert.ok(Number.isFinite(context.api.mwCurrent(p, config, t)));
    }
});
test('Reconfiguration preserves coil identities and has finite intermediate geometry', () => {
  for (const [before, after] of [
    [{}, { mwConnection: 'delta' }],
    [{ mwView: 'nema' }, { mwView: 'nema', mwVoltage: 'high' }],
    [{ mwView: 'dahlander' }, { mwView: 'dahlander', mwSpeed: 'high' }]
  ]) {
    const a = setup(before).scene, b = setup(after).scene;
    assert.deepEqual(coils(a).map(([id]) => id).sort(), coils(b).map(([id]) => id).sort());
    for (const [id, p] of coils(a)) assert.deepEqual(b.paths[id].ends, p.ends, `${id} retains its winding-terminal identities`);
    assert.ok(coils(a).some(([id, p]) => JSON.stringify(p.points) !== JSON.stringify(b.paths[id].points)), 'The actual coil geometry must move');
    for (const t of [0, .15, .5, .85, 1]) {
      const d = context.api.mwInterpolate(a, b, t);
      for (const p of Object.values(d.paths)) assert.ok(p.points.every(point => point.every(Number.isFinite)));
      for (const l of Object.values(d.labels)) assert.ok(l.p.every(Number.isFinite));
    }
    for (const [id, p] of coils(b)) assert.deepEqual(context.api.mwInterpolate(a, b, 1).paths[id].points, p.points);
  }
});
for (const mwView of ['iec', 'fan']) test(`${mwView}: star/delta reconnection moves winding ends while supply terminals stay fixed`, () => {
  const a = setup({ mwView }).scene, b = setup({ mwView, mwConnection: 'delta' }).scene;
  for (const [from, to] of [[a, b], [b, a]]) for (const t of [0, .15, .25, .5, .75, .85, 1]) {
    const scene = context.api.mwInterpolate(from, to, t);
    for (const [id, p] of coils(from)) {
      const moving = scene.paths[id];
      assert.deepEqual(moving.ends, p.ends);
      assert.ok(distance(moving.points[0], p.points[0]) < 1e-8, `${id}: ${p.ends[0]} must not travel around the motor`);
      assert.ok(distance(moving.points[0], to.paths[id].points[0]) < 1e-8);
    }
    for (let phase = 0; phase < 3; phase++) {
      const id = `feed-${phase}`;
      assert.deepEqual(scene.paths[id].points, from.paths[id].points, `${id}: the supply lead stays in its own sector`);
    }
  }
  assert.ok(coils(a).every(([id, p]) => distance(p.points.at(-1), b.paths[id].points.at(-1)) > 10), 'Each winding end reconnects visibly');
});
test('Dahlander reconnection keeps every winding local without turning the ring inside out', () => {
  const low = setup({ mwView: 'dahlander' }).scene;
  const high = setup({ mwView: 'dahlander', mwSpeed: 'high' }).scene;
  // This catalogue order follows the unchanged internal six-section winding.
  // A reconnection must not reverse it or drag a winding across the motor.
  const ring = ['1U', '2W', '1V', '2V', '1W', '2U'];
  const terminalPoints = scene => {
    const points = new Map();
    for (const [, p] of coils(scene)) for (const [i, name] of p.ends.entries()) {
      const point = i ? p.points.at(-1) : p.points[0];
      if (points.has(name)) assert.ok(distance(points.get(name), point) < 1e-8, `${name}: adjoining winding sections must remain joined`);
      points.set(name, point);
    }
    return ring.map(name => points.get(name));
  };
  const signedArea = points => points.reduce((sum, a, i) => {
    const b = points[(i + 1) % points.length];
    return sum + a[0] * b[1] - b[0] * a[1];
  }, 0) / 2;
  const cross = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  const crosses = (a, b, c, d) => cross(a, b, c) * cross(a, b, d) < -1e-8 && cross(c, d, a) * cross(c, d, b) < -1e-8;
  const orientation = Math.sign(signedArea(terminalPoints(low)));
  for (const [from, to] of [[low, high], [high, low]]) for (let step = 0; step <= 20; step++) {
    const t = step / 20, scene = context.api.mwInterpolate(from, to, t), points = terminalPoints(scene);
    assert.ok(orientation * signedArea(points) > 0, `At t=${t}, the winding ring must retain its orientation`);
    for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || i === 0 && j === points.length - 1) continue;
      assert.equal(crosses(points[i], points[(i + 1) % points.length], points[j], points[(j + 1) % points.length]), false,
        `At t=${t}, nonadjacent winding sections ${i} and ${j} must not cross`);
    }
    for (const [id, p] of coils(from)) {
      assert.deepEqual(scene.paths[id].ends, p.ends);
      for (let i = 0; i < p.points.length; i++) assert.ok(distance(p.points[i], scene.paths[id].points[i]) <= 240,
        `At t=${t}, ${id} must reshape locally rather than move to the opposite side`);
    }
  }
});
function assertSceneMatches(actual, expected) {
  for (const collection of ['paths', 'labels']) for (const [id, p] of Object.entries(expected[collection])) {
    const q = actual[collection][id];
    assert.ok(q, `${collection}/${id}: the rendered component exists`);
    assert.equal(q.opacity, p.opacity, `${collection}/${id}: opacity matches the displayed endpoint`);
    assert.deepEqual(collection === 'paths' ? q.points : q.p, collection === 'paths' ? p.points : p.p,
      `${collection}/${id}: geometry matches the displayed endpoint`);
  }
}
test('Dahlander supply stubs fade at rest instead of sweeping through the winding', () => {
  const low = setup({ mwView: 'dahlander' }).scene;
  const high = setup({ mwView: 'dahlander', mwSpeed: 'high' }).scene;
  for (const [from, to] of [[low, high], [high, low]]) {
    assertSceneMatches(context.api.mwInterpolate(from, to, 0), from);
    assertSceneMatches(context.api.mwInterpolate(from, to, 1), to);
    const fadingOut = context.api.mwInterpolate(from, to, .1);
    const reshaping = context.api.mwInterpolate(from, to, .5);
    const fadingIn = context.api.mwInterpolate(from, to, .9);
    for (let phase = 0; phase < 3; phase++) for (const [collection, id, geometry] of [
      ['paths', `dfeed${phase}`, 'points'], ['labels', `dline${phase}`, 'p']
    ]) {
      assert.ok(Math.abs(fadingOut[collection][id].opacity - .5) < 1e-12);
      assert.deepEqual(fadingOut[collection][id][geometry], from[collection][id][geometry]);
      assert.equal(reshaping[collection][id].opacity, 0, 'Supply stubs and labels remain hidden while winding geometry changes');
      assert.ok(Math.abs(fadingIn[collection][id].opacity - .5) < 1e-12);
      assert.deepEqual(fadingIn[collection][id][geometry], to[collection][id][geometry]);
    }
    for (const [id, p] of coils(from)) {
      assert.deepEqual(fadingOut.paths[id].points, p.points, 'Coils wait for the old supply to fade');
      assert.deepEqual(fadingIn.paths[id].points, to.paths[id].points, 'Coils settle before the new supply appears');
      assert.notDeepEqual(reshaping.paths[id].points, p.points);
      assert.notDeepEqual(reshaping.paths[id].points, to.paths[id].points);
    }
  }
});
test('Interrupting and reversing a Dahlander transition starts from the visible geometry and opacity', () => {
  const low = setup({ mwView: 'dahlander' }).scene;
  const high = setup({ mwView: 'dahlander', mwSpeed: 'high' }).scene;
  for (const [from, to] of [[low, high], [high, low]]) for (const t of [.1, .5, .9]) {
    const interrupted = context.api.mwInterpolate(from, to, t);
    const reversed = context.api.mwInterpolate(interrupted, from, 0);
    assertSceneMatches(reversed, interrupted);
    const next = context.api.mwInterpolate(interrupted, from, 1e-7);
    for (const collection of ['paths', 'labels']) for (const [id, p] of Object.entries(interrupted[collection])) {
      const q = next[collection][id];
      assert.ok(Math.abs(q.opacity - p.opacity) < 1e-5, `${id}: restarting must not flash a hidden or partly faded component`);
      assert.deepEqual(collection === 'paths' ? q.points : q.p, collection === 'paths' ? p.points : p.p,
        `${id}: the restarted fade must hold the current geometry`);
    }
    assertSceneMatches(context.api.mwInterpolate(interrupted, from, 1), from);
  }
});
test('Reduced motion settles Dahlander reconnection immediately without a faded supply', () => {
  const low = setup({ mwView: 'dahlander' }).scene;
  const high = setup({ mwView: 'dahlander', mwSpeed: 'high' }).scene;
  const state = context.api.mwMotion;
  Object.assign(state, { run: false, phase: .75, from: low, to: high, start: 1000, last: 1000, speed: 1 });
  requestedFrames = 0;
  reducedMotion = true;
  try {
    context.api.mwFrame(1001);
    assertSceneMatches(state.current, high);
    assert.equal(state.current.pose, high.pose);
    assert.equal(state.phase, .75);
    assert.equal(requestedFrames, 0);
  } finally {
    reducedMotion = false;
  }
});
test('Balanced three-phase currents sum to zero', () => {
  for (const mwConnection of ['star', 'delta']) {
    const { scene, config } = setup({ mwConnection });
    for (let t = 0; t < Math.PI * 2; t += .07) {
      const sum = coils(scene).reduce((total, [, p]) => total + context.api.mwCurrent(p, config, t), 0);
      assert.ok(Math.abs(sum) < 1e-10);
    }
  }
});
test('NEMA rated reconnection preserves each half-winding excitation', () => {
  const low = setup({ mwView: 'nema' });
  const expected = coils(low.scene).map(([id, p]) => [id, Array.from({ length: 25 }, (_, i) => context.api.mwCurrent(p, low.config, i * .25))]);
  const high = setup({ mwView: 'nema', mwVoltage: 'high' });
  for (const [id, values] of expected) values.forEach((v, i) => assert.ok(Math.abs(v - context.api.mwCurrent(high.scene.paths[id], high.config, i * .25)) < 1e-10));
});
test('Switching off the separate fan supply removes fan-winding current', () => {
  const { scene, config } = setup({ mwView: 'fan', mwFanOn: false, mwMotorSpeed: 100 });
  for (const [, p] of coils(scene)) for (let t = 0; t < 7; t += .2) assert.equal(context.api.mwCurrent(p, config, t), 0);
});
test('Steinmetz floating-node solution obeys Kirchhoff current balance', () => {
  const { config } = setup({ mwView: 'steinmetz' });
  const v = (name, t) => context.api.mwNodeVoltage(name, config, t);
  const lag = Math.atan(2), admittanceMagnitude = 1 / Math.sqrt(5), dt = 1e-5;
  for (let t = 0; t < 7; t += .17) {
    const iw = (v('W1', t - lag) - v('W2', t - lag)) * admittanceMagnitude;
    const iv = (v('V1', t - lag) - v('V2', t - lag)) * admittanceMagnitude;
    const capacitorVoltage = s => v('U1', s) - v('W1', s);
    const ic = .25 * (capacitorVoltage(t + dt) - capacitorVoltage(t - dt)) / (2 * dt);
    assert.ok(Math.abs(iw - iv - ic) < 1e-8);
  }
});
test('Pause holds current phase and does not schedule another settled frame', () => {
  const { scene } = setup();const state = context.api.mwMotion;
  Object.assign(state, { run: false, phase: 1.234, from: scene, to: scene, start: 0, last: 2000, speed: 1 });
  requestedFrames = 0;context.api.mwFrame(3000);context.api.mwFrame(4000);
  assert.equal(state.phase, 1.234);assert.equal(requestedFrames, 0);
});
