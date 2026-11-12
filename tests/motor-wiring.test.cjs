// Run with: node --test tests/motor-wiring.test.cjs (no dependencies).
// Expected electrical groups were transcribed independently from M7000 en-1425,
// A34–A35. Row order is immaterial; terminals within a group share a node.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const html = readFileSync(resolve(__dirname, '../NORD-motor-and-drive-explorer.html'), 'utf8');
const start = html.indexOf('// BEGIN MOTOR TERMINAL WIRING');
const end = html.indexOf('function mwControls()', start);
assert.ok(start > 0 && end > start, 'Motor wiring model must be present');
const context = vm.createContext({ settings: {}, maLink: (url, label) => `${label} ${url}` });
vm.runInContext(html.slice(start, end) + '\nthis.config = mwConfig;', context);
function config(overrides) {
  context.settings = { mwView: 'iec', mwConnection: 'star', mwPlate: '230400',
    mwHz: '50', mwSpeed: 'low', mwVoltage: 'low', ...overrides };
  return JSON.parse(JSON.stringify(context.config()));
}
function groups(rows) {
  return Object.fromEntries(rows.map(([name, terminals]) => [name, [...terminals].sort()]));
}
const expectedStar = { L1: ['U1'], L2: ['V1'], L3: ['W1'], Join: ['U2', 'V2', 'W2'] };
const expectedDelta = { L1: ['U1', 'W2'], L2: ['U2', 'V1'], L3: ['V2', 'W1'] };
const cases = [
  ['IEC star', {}, expectedStar],
  ['IEC delta', { mwConnection: 'delta' }, expectedDelta],
  ['fan star', { mwView: 'fan' }, expectedStar],
  ['fan delta', { mwView: 'fan', mwConnection: 'delta' }, expectedDelta],
  ['Steinmetz delta nodes', { mwView: 'steinmetz' },
    { L1: ['U1', 'W2'], N: ['U2', 'V1'], 'Third corner': ['V2', 'W1'] }],
  ['Dahlander low', { mwView: 'dahlander' }, { L1: ['1U'], L2: ['1V'], L3: ['1W'] }],
  ['Dahlander high', { mwView: 'dahlander', mwSpeed: 'high' },
    { L1: ['2U'], L2: ['2V'], L3: ['2W'], Join: ['1U', '1V', '1W'] }],
  ['NEMA low 230 V', { mwView: 'nema' },
    { L1: ['T1', 'T7'], L2: ['T2', 'T8'], L3: ['T3', 'T9'], Join: ['T4', 'T5', 'T6'] }],
  ['NEMA high 460 V', { mwView: 'nema', mwVoltage: 'high' },
    { L1: ['T1'], L2: ['T2'], L3: ['T3'], 'Join A': ['T4', 'T7'], 'Join B': ['T5', 'T8'], 'Join C': ['T6', 'T9'] }]
];
for (const [name, settings, expected] of cases) {
  test(name + ': correct independent electrical junctions', () => {
    const c = config(settings);
    assert.deepEqual(groups(c.rows), expected);
    const connected = c.rows.flatMap(([, leads]) => leads);
    assert.equal(new Set(connected).size, connected.length, 'A terminal cannot bridge separate junctions');
    const all = [...connected, ...c.open];
    assert.equal(new Set(all).size, settings.mwView === 'nema' ? 9 : 6, 'Every terminal must be accounted for once');
    for (const lead of c.open) assert.ok(!connected.includes(lead), 'An open terminal must not be connected');
  });
}
test('Dahlander low leaves the three high-speed leads separate', () => {
  assert.deepEqual(config({ mwView: 'dahlander' }).open, ['2U', '2V', '2W']);
});
test('Fan voltage ranges change with frequency and winding connection', () => {
  for (const [mwHz, mwConnection, expected] of [
    ['50', 'star', '346–525 V'], ['60', 'star', '380–575 V'],
    ['50', 'delta', '200–303 V'], ['60', 'delta', '220–332 V']
  ]) assert.ok(config({ mwView: 'fan', mwHz, mwConnection }).facts[0][1].startsWith(expected));
});
test('IEC plate examples select the correct rated line voltage', () => {
  for (const [mwPlate, mwConnection, expected] of [
    ['230400', 'star', '400 V'], ['230400', 'delta', '230 V'],
    ['400690', 'star', '690 V'], ['400690', 'delta', '400 V']
  ]) assert.equal(config({ mwPlate, mwConnection }).facts[0][1], expected);
});
test('PM scope never inherits an induction-motor terminal map', () => {
  const c = config({ mwView: 'pm' });
  assert.deepEqual(c.rows, []);
  assert.match(c.source, /M5000.*0626/);
  assert.match(c.notes.join(' '), /Do not connect.*directly to the mains/);
  assert.match(c.notes.join(' '), /TP1 and TP2/);
});
test('All inline executable scripts parse', () => {
  let count = 0;
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/type=["'](?!text\/javascript|module)/i.test(match[1])) continue;
    new vm.Script(match[2]); count++;
  }
  assert.ok(count > 0);
});
