import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../screens/SplashScreen.js', import.meta.url), 'utf8');
const start = source.indexOf('  const goHome = () => {');
const end = source.indexOf('\n  return (\n', start);
assert.ok(start >= 0 && end > start, 'splash navigation handlers must be present');

const createHandlers = new Function('ctx', `
  const {
    hasNavigatedRef, navigationTimeoutRef, navigation, clearTimeout, setTimeout,
    animationRef, Animated, logoScale, logoOpacity, textOpacity,
  } = ctx;
  ${source.slice(start, end)}
  return { goHome, startAnimation };
`);

function setup() {
  const navigations = [];
  const pending = new Map();
  let nextId = 1;
  let finish;
  let stopped = false;
  const ctx = {
    hasNavigatedRef: { current: false },
    navigationTimeoutRef: { current: null },
    animationRef: { current: null },
    navigation: { replace: screen => navigations.push(screen) },
    setTimeout: callback => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    },
    clearTimeout: id => pending.delete(id),
    Animated: {
      sequence: () => ({
        start: callback => { finish = callback; },
        stop: () => { stopped = true; },
      }),
      parallel: () => ({}),
      timing: () => ({}),
    },
    logoScale: {}, logoOpacity: {}, textOpacity: {},
  };
  const handlers = createHandlers(ctx);
  return {
    ctx, handlers, navigations, pending,
    finish: status => finish(status),
    stopped: () => stopped,
  };
}

test('skip immediately navigates once even if animation finishes afterward', () => {
  const s = setup();
  s.handlers.startAnimation();
  s.handlers.goHome();
  s.handlers.goHome();
  s.finish({ finished: true });
  assert.deepEqual(s.navigations, ['Home']);
  assert.equal(s.pending.size, 0);
});

test('normal splash completion still navigates after the delay', () => {
  const s = setup();
  s.handlers.startAnimation();
  s.finish({ finished: true });
  assert.equal(s.pending.size, 1);
  assert.deepEqual(s.navigations, []);
  [...s.pending.values()][0]();
  assert.deepEqual(s.navigations, ['Home']);
  assert.equal(s.pending.size, 0);
});

test('skipping during the delay cancels pending navigation', () => {
  const s = setup();
  s.handlers.startAnimation();
  s.finish({ finished: true });
  s.handlers.goHome();
  assert.equal(s.pending.size, 0);
  assert.deepEqual(s.navigations, ['Home']);
});

test('stopped animation never schedules navigation', () => {
  const s = setup();
  s.handlers.startAnimation();
  s.finish({ finished: false });
  assert.equal(s.pending.size, 0);
  assert.deepEqual(s.navigations, []);
});

test('unmount cancels timer and stops animation', () => {
  const s = setup();
  s.handlers.startAnimation();
  s.finish({ finished: true });
  const effectStart = source.indexOf('  useEffect(() => {');
  const effectEnd = source.indexOf('  const goHome =', effectStart);
  assert.ok(effectStart >= 0 && effectEnd > effectStart);
  let cleanup;
  const runEffect = new Function(
    'useEffect', 'startAnimation', 'navigationTimeoutRef', 'clearTimeout', 'animationRef',
    source.slice(effectStart, effectEnd),
  );
  runEffect(fn => { cleanup = fn(); }, s.handlers.startAnimation,
    s.ctx.navigationTimeoutRef, s.ctx.clearTimeout, s.ctx.animationRef);
  cleanup();
  assert.equal(s.pending.size, 0);
  assert.equal(s.ctx.navigationTimeoutRef.current, null);
  assert.equal(s.stopped(), true);
});

test('skip control is accessible and wired to the guarded navigation', () => {
  assert.match(source, /accessibilityRole="button"/);
  assert.match(source, /accessibilityLabel="Tanıtımı geç ve ana menüye git"/);
  assert.match(source, /onPress=\{goHome\}/);
});
