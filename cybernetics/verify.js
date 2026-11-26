#!/usr/bin/env node
// Automated regression suite for the Cybernetic Product Visualisation (cybernetics/).
// Run after every slice change: node cybernetics/verify.js

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const dir = __dirname;
const htmlSource = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const cssSource = fs.readFileSync(path.join(dir, 'styles.css'), 'utf8');

const scriptFiles = [];
const scriptTagRegex = /<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/gi;
let scriptMatch;
while ((scriptMatch = scriptTagRegex.exec(htmlSource)) !== null) {
  scriptFiles.push(scriptMatch[1]);
}
assert(scriptFiles.length >= 1, 'Expected at least one <script src="..."> tag in index.html');

const scriptSources = scriptFiles.map(function (file) {
  return [file, fs.readFileSync(path.join(dir, file), 'utf8')];
});
const jsSource = scriptSources.map(function (entry) { return entry[1]; }).join('\n');

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('  PASS  ' + name);
  } catch (err) {
    console.error('  FAIL  ' + name);
    console.error('        ' + err.message);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// 1. Static Copy & Style Guards (CLAUDE.md + domain terminology)
// ---------------------------------------------------------------------------
console.log('1. Copy and terminology guards');

check('No em-dashes in index.html, styles.css, or simulator scripts', function () {
  [
    ['index.html', htmlSource],
    ['styles.css', cssSource]
  ]
    .concat(scriptSources)
    .forEach(function ([file, src]) {
      assert(!src.includes('\u2014') && !src.includes('&mdash;'), file + ' contains an em-dash');
    });
});

check('Post-build appraisal is called Testing, never QA', function () {
  assert(!/\bQA\b/.test(htmlSource), 'index.html contains "QA"');
  assert(!/\bQA\b/.test(jsSource), 'app.js contains "QA"');
});

check('Work items are never called tokens', function () {
  assert(!/\btokens?\b/i.test(htmlSource), 'index.html contains "token"');
  assert(!/\btokens?\b/i.test(jsSource), 'app.js contains "token"');
});

check('CLAUDE.md style guards hold across HTML and chapter prose (no banned filler, unhyphenated preempt, or "move" metaphor)', function () {
  const bannedPhrases = /\b(here's why|here's the thing|let me explain|worth pausing on|note that|it's worth mentioning|candid|clear-eyed|frank|honest|floated|preempt(?:s|ed|ing|ion|ive)?)\b/i;
  assert(!bannedPhrases.test(htmlSource), 'index.html contains a banned phrase or unhyphenated preempt');
  assert(!bannedPhrases.test(jsSource), 'app.js contains a banned phrase or unhyphenated preempt');
  const visibleHtml = htmlSource
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  assert(!/\b(move|moved|moves|moving)\b/i.test(visibleHtml), 'index.html visible copy uses "move/moved/moving"');
  assert(!/(?:^|[.!?]\s+)(?:And|Or)\s+/.test(visibleHtml), 'index.html visible copy opens a sentence with And/Or');
  assert(!/[.!?]\s+(?:And|Or)\s+/.test(jsSource), 'app.js opens a sentence with And/Or');
});

// ---------------------------------------------------------------------------
// 2. Minimal DOM Harness Backed by Real index.html Elements
// ---------------------------------------------------------------------------
function makeClassList(initialClasses) {
  const set = new Set((initialClasses || '').split(/\s+/).filter(Boolean));
  return {
    add: function () {
      for (let i = 0; i < arguments.length; i++) set.add(arguments[i]);
    },
    remove: function () {
      for (let i = 0; i < arguments.length; i++) set.delete(arguments[i]);
    },
    toggle: function (cls, force) {
      if (force === undefined) {
        if (set.has(cls)) set.delete(cls);
        else set.add(cls);
      } else if (force) {
        set.add(cls);
      } else {
        set.delete(cls);
      }
    },
    contains: function (cls) {
      return set.has(cls);
    }
  };
}

function makeElement(tag, attrs) {
  const attributeMap = Object.assign({}, attrs || {});
  const listeners = {};
  const styleProps = {};
  let _innerHTML = '';
  const children = [];
  return {
    tagName: tag.toUpperCase(),
    id: attributeMap.id || '',
    textContent: '',
    style: {
      setProperty: function (k, v) {
        styleProps[k] = String(v);
      },
      removeProperty: function (k) {
        delete styleProps[k];
      },
      getPropertyValue: function (k) {
        return styleProps[k] || '';
      }
    },
    get innerHTML() {
      return _innerHTML;
    },
    set innerHTML(val) {
      _innerHTML = String(val);
      children.length = 0;
    },
    value: attributeMap.value || '0',
    checked: Boolean(attributeMap.checked),
    disabled: attributeMap.disabled !== undefined,
    open: false,
    className: attributeMap.class || '',
    classList: makeClassList(attributeMap.class || ''),
    children: children,
    appendChild: function (child) {
      children.push(child);
      return child;
    },
    addEventListener: function (ev, fn) {
      if (!listeners[ev]) listeners[ev] = [];
      listeners[ev].push(fn);
    },
    dispatchEvent: function (ev, payload) {
      (listeners[ev] || []).forEach(function (fn) { fn(payload); });
    },
    getAttribute: function (k) {
      return attributeMap[k] !== undefined ? String(attributeMap[k]) : null;
    },
    setAttribute: function (k, v) {
      attributeMap[k] = String(v);
    },
    querySelector: function (sel) {
      if (sel === '.unlock-tag') return this._unlockTag || null;
      return null;
    },
    getContext: function () {
      const el = this;
      el._canvasTexts = [];
      el._canvasSegments = [];
      el._canvasArcs = [];
      el._canvasClipCount = 0;
      el._trackPathBBoxes = false;
      el._trackPolarStrokes = false;
      el._pathBBoxes = [];
      el._polarStrokes = [];
      let curX = 0;
      let curY = 0;
      let tx = 0;
      let ty = 0;
      let pathMinX = Infinity;
      let pathMaxX = -Infinity;
      let pathMinY = Infinity;
      let pathMaxY = -Infinity;
      let pathPts = 0;
      let currentDash = [];
      const saveStack = [];
      const state = { font: '', textAlign: 'left', strokeStyle: '' };
      return new Proxy(state, {
        get: function (target, prop) {
          if (prop === 'clearRect') {
            return function () {
              el._canvasTexts = [];
              el._canvasSegments = [];
              el._canvasArcs = [];
              el._canvasClipCount = 0;
              el._pathBBoxes = [];
              el._polarStrokes = [];
              currentDash = [];
              tx = 0;
              ty = 0;
              saveStack.length = 0;
            };
          }
          if (prop === 'clip') {
            return function () {
              el._canvasClipCount += 1;
            };
          }
          if (prop === 'save') {
            return function () {
              saveStack.push({
                tx: tx,
                ty: ty,
                font: target.font,
                textAlign: target.textAlign,
                strokeStyle: target.strokeStyle,
                dash: currentDash.slice()
              });
            };
          }
          if (prop === 'restore') {
            return function () {
              const prev = saveStack.pop();
              if (prev) {
                tx = prev.tx;
                ty = prev.ty;
                target.font = prev.font;
                target.textAlign = prev.textAlign;
                target.strokeStyle = prev.strokeStyle;
                currentDash = prev.dash.slice();
              }
            };
          }
          if (prop === 'setLineDash') {
            return function (arr) {
              currentDash = Array.isArray(arr) ? arr.slice() : [];
            };
          }
          if (prop === 'stroke') {
            return function () {
              if (el._trackPolarStrokes && pathPts >= 200) {
                el._polarStrokes.push({
                  cx: (pathMinX + pathMaxX) / 2,
                  cy: (pathMinY + pathMaxY) / 2,
                  strokeStyle: String(target.strokeStyle || ''),
                  dash: currentDash.slice()
                });
              }
            };
          }
          if (prop === 'translate') {
            return function (dx, dy) {
              tx += dx;
              ty += dy;
            };
          }
          if (prop === 'setTransform') {
            return function () {
              tx = 0;
              ty = 0;
            };
          }
          if (prop === 'arc') {
            return function (x, y, r) {
              el._canvasArcs.push({ x: tx + x, y: ty + y, r: r });
            };
          }
          if (prop === 'beginPath') {
            return function () {
              if (el._trackPathBBoxes || el._trackPolarStrokes) {
                pathMinX = Infinity;
                pathMaxX = -Infinity;
                pathMinY = Infinity;
                pathMaxY = -Infinity;
                pathPts = 0;
              }
            };
          }
          if (prop === 'closePath') {
            return function () {
              if (el._trackPathBBoxes && pathPts >= 200) {
                el._pathBBoxes.push({
                  minX: pathMinX,
                  maxX: pathMaxX,
                  minY: pathMinY,
                  maxY: pathMaxY
                });
              }
            };
          }
          if (prop === 'moveTo') {
            return function (x, y) {
              curX = tx + x;
              curY = ty + y;
              if (el._trackPathBBoxes || el._trackPolarStrokes) {
                pathPts += 1;
                if (curX < pathMinX) pathMinX = curX;
                if (curX > pathMaxX) pathMaxX = curX;
                if (curY < pathMinY) pathMinY = curY;
                if (curY > pathMaxY) pathMaxY = curY;
              }
            };
          }
          if (prop === 'lineTo') {
            return function (x, y) {
              const nx = tx + x;
              const ny = ty + y;
              if (curX === nx || curY === ny) {
                el._canvasSegments.push({ x1: curX, y1: curY, x2: nx, y2: ny });
              }
              if (el._trackPathBBoxes || el._trackPolarStrokes) {
                pathPts += 1;
                if (nx < pathMinX) pathMinX = nx;
                if (nx > pathMaxX) pathMaxX = nx;
                if (ny < pathMinY) pathMinY = ny;
                if (ny > pathMaxY) pathMaxY = ny;
              }
              curX = nx;
              curY = ny;
            };
          }
          if (prop === 'strokeRect' || prop === 'fillRect') {
            return function () {};
          }
          if (prop === 'fillText') {
            return function (txt, x, y) {
              el._canvasTexts.push({
                text: String(txt),
                x: tx + x,
                y: ty + y,
                font: target.font,
                align: target.textAlign
              });
            };
          }
          if (prop === 'measureText') {
            return function (txt) { return { width: String(txt).length * 6 }; };
          }
          return function () {};
        },
        set: function (target, prop, val) {
          target[prop] = val;
          return true;
        }
      });
    }
  };
}

const idElements = {};
const idRegex = /<([a-zA-Z0-9]+)\s+([^>]*?\bid="([^"]+)"[^>]*)>/g;
let match;
while ((match = idRegex.exec(htmlSource)) !== null) {
  const tag = match[1];
  const rawAttrs = match[2];
  const id = match[3];
  const clsMatch = rawAttrs.match(/\bclass="([^"]+)"/);
  const valMatch = rawAttrs.match(/\bvalue="([^"]+)"/);
  const elemAttrs = {
    id: id,
    class: clsMatch ? clsMatch[1] : '',
    value: valMatch ? valMatch[1] : '0'
  };
  if (/\bdisabled\b/.test(rawAttrs)) elemAttrs.disabled = 'disabled';
  idElements[id] = makeElement(tag, elemAttrs);
}

const chapterTabs = [];
const tabRegex = /<button\s+([^>]*?\bclass="[^"]*chapter-tab[^"]*"[^>]*)>/g;
while ((match = tabRegex.exec(htmlSource)) !== null) {
  const raw = match[1];
  const chMatch = raw.match(/data-chapter="(\d+)"/);
  const clsMatch = raw.match(/class="([^"]+)"/);
  const attrs = {
    class: clsMatch ? clsMatch[1] : 'chapter-tab',
    'data-chapter': chMatch ? chMatch[1] : '1'
  };
  if (/\bdisabled\b/.test(raw)) attrs.disabled = 'disabled';
  chapterTabs.push(makeElement('button', attrs));
}

const speedBtns = ['0.5', '1', '2'].map(function (s) {
  return makeElement('button', {
    class: s === '1' ? 'speed-btn active' : 'speed-btn',
    'data-speed': s
  });
});

global.window = {
  devicePixelRatio: 2,
  _listeners: {},
  location: {
    origin: 'https://beyondquality.org',
    pathname: '/cybernetics/',
    search: '',
    hash: '',
    href: 'https://beyondquality.org/cybernetics/'
  },
  history: {
    _replaceCount: 0,
    replaceState: function (_state, _title, nextUrl) {
      this._replaceCount += 1;
      const str = String(nextUrl || '');
      const hashIdx = str.indexOf('#');
      const noHash = hashIdx === -1 ? str : str.slice(0, hashIdx);
      const hashPart = hashIdx === -1 ? '' : str.slice(hashIdx);
      const qIdx = noHash.indexOf('?');
      const pathPart = qIdx === -1 ? noHash : noHash.slice(0, qIdx);
      const searchPart = qIdx === -1 ? '' : noHash.slice(qIdx);
      global.window.location.pathname = pathPart || '/cybernetics/';
      global.window.location.search = searchPart;
      global.window.location.hash = hashPart;
      global.window.location.href = global.window.location.origin + global.window.location.pathname + searchPart + hashPart;
    }
  },
  navigator: {
    clipboard: {
      _lastText: '',
      writeText: function (txt) {
        this._lastText = String(txt);
        return Promise.resolve();
      }
    }
  },
  addEventListener: function (ev, fn) {
    if (!this._listeners[ev]) this._listeners[ev] = [];
    this._listeners[ev].push(fn);
  },
  dispatchEvent: function (ev, payload) {
    (this._listeners[ev] || []).forEach(function (fn) { fn(payload); });
  },
  localStorage: {
    _store: {},
    getItem: function (k) { return this._store[k] || null; },
    setItem: function (k, v) { this._store[k] = String(v); }
  }
};

global.document = {
  getElementById: function (id) {
    assert(idElements[id], 'app.js requested missing DOM id #' + id);
    return idElements[id];
  },
  querySelectorAll: function (sel) {
    if (sel === '.chapter-tab') return chapterTabs;
    if (sel === '.speed-btn') return speedBtns;
    return [];
  },
  createElement: function (tag) {
    return makeElement(tag, {});
  }
};

global.performance = { now: function () { return 0; } };
global.requestAnimationFrame = function () {};

// Boot simulator scripts in exact index.html load order
scriptFiles.forEach(function (file) {
  require(path.join(dir, file));
});
const api = global.window.CyberneticSim;

function runSeconds(totalSec, onFrame) {
  const dt = 0.04;
  const steps = Math.round(totalSec / dt);
  for (let i = 0; i < steps; i++) {
    api.step(dt);
    if (onFrame) onFrame(api.getState());
  }
  return api.getState();
}

function avgFit(history) {
  assert(history.length >= 6, 'Expected at least 6 completed launches, got ' + history.length);
  const sum = history.reduce(function (acc, h) { return acc + h.fitPct; }, 0);
  return sum / history.length;
}

function settledAvgFit(history) {
  const settled = history.filter(function (h) { return h.settled; });
  assert(settled.length >= 5, 'Expected at least 5 settled bets, got ' + settled.length);
  const sum = settled.reduce(function (acc, h) { return acc + h.fitPct; }, 0);
  return sum / settled.length;
}

// ---------------------------------------------------------------------------
// 3. Slice-by-Slice Regression Contracts
// ---------------------------------------------------------------------------
console.log('2. Chapter 1 contracts (Adaptation Time)');

check('B1: Visual onboarding legend sits directly below canvas and Real Users uses Market Fit / Live need labels', function () {
  const legendOrder = /<div class="canvas-wrap">[\s\S]*?<\/div>\s*<div id="visualLegend" class="visual-legend"[\s\S]*?<\/div>\s*<div class="history-bar">/;
  assert(legendOrder.test(htmlSource), 'Expected #visualLegend inside .stage-card directly between .canvas-wrap and .history-bar');
  [
    'Blue silhouette = live market need',
    'Dashed outline = written Spec',
    'Solid shape = built product',
    'Launch chips = % market fit'
  ].forEach(function (clause) {
    assert(htmlSource.includes(clause), 'Missing visual legend clause: ' + clause);
  });
  assert(!/Cutout|Live cutout/i.test(htmlSource), 'index.html still contains Cutout jargon');
  assert(!/Cutout|Live cutout/i.test(jsSource), 'app.js still contains Cutout jargon');

  api.applyChapter(1);
  api.step(0);
  const texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(texts.includes('Real Users (Market Fit)'), 'Expected canvas station title "Real Users (Market Fit)"');
  assert(texts.includes('Live need: STAR'), 'Expected opening canvas caption "Live need: STAR"');
});

check('Ch. 1 enforces held assumptions (1 item in flight, 0 noise, 0 testing, 0 queues)', function () {
  api.applyChapter(1);
  const st = runSeconds(95, function (frame) {
    assert(frame.inFlightCount <= 1, 'Ch. 1 exceeded 1 item in flight');
    assert.strictEqual(frame.queueCount, 0, 'Ch. 1 had non-zero queue');
    assert.strictEqual(frame.effective.discoveryNoise, 0, 'Ch. 1 leaked discovery noise');
    assert.strictEqual(frame.effective.buildNoise, 0, 'Ch. 1 leaked build noise');
    assert.strictEqual(frame.effective.testingIdx, 0, 'Ch. 1 leaked testing');
    if (frame.item) {
      assert.strictEqual(frame.item.reworkCount, 0, 'Ch. 1 triggered rework');
    }
  });
  const fit = avgFit(st.history);
  assert(fit < 56, 'Ch. 1 default (Analysis paralysis) should show stale low fit (<56%), got ' + fit.toFixed(1) + '%');
});

check('Ch. 1 "Nimble loop (in sync)" preset recovers high real-world fit (>=75%)', function () {
  api.applyPreset(1, 1);
  const st = runSeconds(60);
  const fit = avgFit(st.history);
  assert(fit >= 75, 'Expected >=75% fit on Nimble loop, got ' + fit.toFixed(1) + '%');
  assert(st.history.every(function (h) { return h.outerReturns === 0; }), 'Outer Loop leaked into Ch. 1');
});

check('Ch. 1 "Turbulent market vs slow build" preset loses to rapid market drift (<56%)', function () {
  api.applyPreset(1, 2);
  const st = runSeconds(95);
  const fit = avgFit(st.history);
  assert(fit < 56, 'Expected <56% fit on Turbulent market vs slow build, got ' + fit.toFixed(1) + '%');
});

check('B4.1: Ch. 1 distinguishes closed-loop shower tap delay from pure transport lag against independent drift', function () {
  const ch1 = api.getChapters()[1];
  assert(!htmlSource.includes('longer than the changes you are reacting to'), 'index.html still has imprecise shower-delay wording');
  assert(!ch1.storyHtml.includes('longer than the changes you are reacting to'), 'Ch. 1 storyHtml still has imprecise shower-delay wording');
  assert(htmlSource.includes('blinds you to the effect of each adjustment until it is too late'), 'index.html missing tightened Ch. 1 shower sentence');
  assert(ch1.storyHtml.includes('A product company faces the same lag constraint against a changing market.'), 'Ch. 1 storyHtml missing tightened bridge sentence');
  assert(
    ch1.cyberneticsHtml.includes('closed-loop thermostat') &&
    ch1.cyberneticsHtml.includes('changes independently') &&
    ch1.cyberneticsHtml.includes('Chapters 6 and 7'),
    'Ch. 1 cyberneticsHtml should contrast closed-loop thermostat over-correction with pure transport lag before Ch. 6-7 rework'
  );
});

console.log('3. Chapter 2 contracts (Handoff Noise)');

check('Ch. 2 enforces testing=Off & 1-item-at-a-time while default Leaky handoffs fails (<48%)', function () {
  api.applyChapter(2);
  assert(!idElements.discoveryNoiseGroup.classList.contains('is-hidden') && !idElements.discoveryNoiseSlider.disabled, 'Discovery noise stayed hidden/locked on Ch. 2');
  assert(!idElements.buildNoiseGroup.classList.contains('is-hidden') && !idElements.buildNoiseSlider.disabled, 'Build noise stayed hidden/locked on Ch. 2');
  assert(idElements.testingControlBlock.classList.contains('is-hidden') && idElements.testingSlider.disabled, 'Testing visible/unlocked early on Ch. 2');

  const st = runSeconds(60, function (frame) {
    assert(frame.inFlightCount <= 1, 'Ch. 2 exceeded 1 item in flight');
    assert.strictEqual(frame.effective.testingIdx, 0, 'Ch. 2 leaked testing');
  });
  const fit = avgFit(st.history);
  assert(fit < 48, 'Ch. 2 default (Leaky handoffs) expected <48% fit, got ' + fit.toFixed(1) + '%');
});

check('Ch. 2 "Observed + paired" preset recovers real-world fit (>=72%)', function () {
  api.applyPreset(2, 1);
  const st = runSeconds(75);
  const fit = avgFit(st.history);
  assert(fit >= 72, 'Expected >=72% fit when observed + paired, got ' + fit.toFixed(1) + '%');
});

check('Ch. 2 "Wrong problem, clean code" preset fails (<48%) despite zero Build noise', function () {
  api.applyPreset(2, 2);
  const st = runSeconds(60);
  const fit = avgFit(st.history);
  assert(fit < 48, 'Expected <48% fit on Wrong problem, clean code, got ' + fit.toFixed(1) + '%');
});

check('Ch. 2 "\'Huge upfront spec\' trap" preset loses to staleness + residual static (<62%)', function () {
  api.applyPreset(2, 3);
  const st = runSeconds(95);
  const fit = avgFit(st.history);
  assert(fit < 62, 'Expected <62% fit on Huge upfront spec trap, got ' + fit.toFixed(1) + '%');
});

console.log('4. Chapter 3 contracts (Testing\'s Blind Spot)');

check('Ch. 3 default reworks items & marks Passed, yet still fails (<48%) on wrong Spec', function () {
  api.applyChapter(3);
  assert(!idElements.testingControlBlock.classList.contains('is-hidden') && !idElements.testingSlider.disabled, 'Testing stayed hidden/locked on Ch. 3');
  assert(idElements.flowControlBlock.classList.contains('is-hidden') && idElements.wipSlider.disabled, 'Flow visible/unlocked early on Ch. 3');
  assert(idElements.demandControlGroup.classList.contains('is-hidden') && idElements.demandSlider.disabled, 'Demand visible/unlocked early on Ch. 3');

  const st = runSeconds(95, function (frame) {
    assert(frame.inFlightCount <= 1, 'Ch. 3 exceeded 1 item in flight');
    assert.strictEqual(frame.queueCount, 0, 'Ch. 3 had non-zero queue');
  });
  const fit = avgFit(st.history);
  assert(fit < 48, 'Ch. 3 default (wrong Spec + strict testing) expected <48% fit, got ' + fit.toFixed(1) + '%');
  assert(
    st.history.every(function (h) { return h.testedPassed; }),
    'Expected every item to pass testing after rework'
  );
  assert(
    st.history.some(function (h) { return h.reworkCount >= 1; }),
    'Expected Inner Loop wrench rework to fire'
  );
});

check('Ch. 3 "Clean Spec + buggy Build" preset rescues fit via testing rework (>=75%)', function () {
  api.applyPreset(3, 1);
  const st = runSeconds(95);
  const fit = avgFit(st.history);
  assert(fit >= 75, 'Expected >=75% fit when Spec is clean and testing catches build bugs, got ' + fit.toFixed(1) + '%');
  assert(
    st.history.every(function (h) { return h.reworkCount >= 1 && h.testedPassed; }),
    'Expected rework + Passed on Clean Spec + buggy Build'
  );
});

check('Ch. 3 "Rework delay in a rapid market" drops fit (<55%) due to rework aging', function () {
  api.applyPreset(3, 2);
  const st = runSeconds(95);
  const fit = avgFit(st.history);
  assert(fit < 55, 'Expected rework delay in rapid market to drop fit <55%, got ' + fit.toFixed(1) + '%');
});

check('Ch. 3 "Prevent at source (observe + pair)" preset achieves high fit (>=72%) without rework', function () {
  api.applyPreset(3, 3);
  const st = runSeconds(85);
  const fit = avgFit(st.history);
  assert(fit >= 72, 'Expected >=72% fit on Prevent at source, got ' + fit.toFixed(1) + '%');
  assert(
    st.history.every(function (h) { return h.reworkCount === 0 && h.outerReturns === 0; }),
    'Expected zero Inner/Outer rework when prevented at source'
  );
});

check('B4.2: Ch. 3 Cybernetics view distinguishes System 3 internal control from System 3* direct audit', function () {
  const ch3 = api.getChapters()[3];
  assert(ch3.cyberneticsHeading.includes('System 3 & 3*'), 'Expected Ch. 3 cyberneticsHeading to name System 3 & 3*');
  assert(
    ch3.cyberneticsHtml.includes('allocating <strong>System 1</strong> capacity') &&
    ch3.cyberneticsHtml.includes('rather than relying on status reports') &&
    ch3.cyberneticsHtml.includes('System 3* flags the discrepancy so System 3 routes'),
    'Expected Ch. 3 cyberneticsHtml to separate System 3 control/rework routing from System 3* direct inspection'
  );
  assert(
    ch3.cyberneticsLessonText.includes('System 3 and its System 3* audit channel'),
    'Expected Ch. 3 cyberneticsLessonText to pair System 3 with its System 3* audit channel'
  );
});

console.log('5. Chapter 4 contracts (Queues & Bottlenecks)');

check('Ch. 4 default ("10x Build into 1x Testing") builds queues & releases stale (<55%) despite clean Specs', function () {
  api.applyChapter(4);
  assert(!idElements.flowControlBlock.classList.contains('is-hidden') && !idElements.wipSlider.disabled, 'Flow stayed hidden/locked on Ch. 4');
  assert(!idElements.demandControlGroup.classList.contains('is-hidden') && !idElements.demandSlider.disabled, 'Demand stayed hidden/locked on Ch. 4');
  assert(!idElements.build10xBox.classList.contains('is-hidden') && !idElements.build10xToggle.disabled, '10x Build stayed hidden/locked on Ch. 4');
  assert(idElements.rolloutControlBlock.classList.contains('is-hidden') && idElements.reachSlider.disabled, 'Rollout visible/unlocked early on Ch. 4');

  let peakTestingQueue = 0;
  const st = runSeconds(95, function (frame) {
    if (frame.queues.testing > peakTestingQueue) {
      peakTestingQueue = frame.queues.testing;
    }
  });
  assert(peakTestingQueue >= 5, 'Expected Testing queue to pile up (>=5), peak was ' + peakTestingQueue);
  const fit = avgFit(st.history);
  assert(fit < 55, 'Expected queued items to arrive stale (<55% fit), got ' + fit.toFixed(1) + '%');
});

check('Ch. 4 "Controlled WIP + paired Build" preset clears queues and restores fit (>=72%)', function () {
  api.applyPreset(4, 1);
  assert(
    Math.abs(api.getState().effective.buildSec - 0.18) < 1e-6,
    'Expected 10x Build + pairing to keep 0.18s build time with 0s lead-time penalty'
  );
  assert.strictEqual(
    idElements.buildRegime.textContent,
    'Medium batch \u2192 10x (0.36d)',
    'Expected #buildRegime to display Medium batch -> 10x (0.36d) without artificial pairing delay'
  );
  let peakTestingQueue = 0;
  const st = runSeconds(90, function (frame) {
    if (frame.queues.testing > peakTestingQueue) {
      peakTestingQueue = frame.queues.testing;
    }
  });
  assert(peakTestingQueue <= 1, 'Expected Testing queue to stay clear (<=1), peak was ' + peakTestingQueue);
  const fit = avgFit(st.history);
  assert(fit >= 72, 'Expected >=72% fit when queues clear under controlled WIP + pairing, got ' + fit.toFixed(1) + '%');

  idElements.buildDampenerToggle.checked = false;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert.strictEqual(
    idElements.buildRegime.textContent,
    'Medium batch \u2192 10x (0.36d)',
    'Expected #buildRegime to stay Medium batch -> 10x (0.36d) when pairing is unchecked'
  );
});

check('Ch. 4 "Flooded backlog (even with zero bugs)" still degrades fit (<60%) from pure queue wait', function () {
  api.applyPreset(4, 2);
  let peakQueue = 0;
  const st = runSeconds(95, function (frame) {
    if (frame.queueCount > peakQueue) peakQueue = frame.queueCount;
  });
  assert(peakQueue >= 6, 'Expected high WIP to accumulate queues (>=6), peak was ' + peakQueue);
  const fit = avgFit(st.history);
  assert(fit < 60, 'Expected flooded backlog wait to degrade fit <60%, got ' + fit.toFixed(1) + '%');

  const wipMatch = jsSource.match(/const WIP_REGIMES = \[([\s\S]*?)\];/);
  assert(wipMatch, 'Expected WIP_REGIMES table in content.js');
  const maxWips = (wipMatch[1].match(/maxWip:\s*(\d+)/g) || []).map(function (s) {
    return Number(s.replace(/maxWip:\s*/, ''));
  });
  assert.strictEqual(maxWips.length, 4, 'Expected 4 WIP_REGIMES entries');
  for (let i = 1; i < maxWips.length; i++) {
    assert(
      maxWips[i] > maxWips[i - 1],
      'Expected strictly increasing WIP_REGIMES maxWip, got ' + maxWips.join(' -> ')
    );
  }

  const demandMatch = jsSource.match(/const DEMAND_REGIMES = \[([\s\S]*?)\];/);
  assert(demandMatch, 'Expected DEMAND_REGIMES table in content.js');
  const demandIntervals = (demandMatch[1].match(/intervalSec:\s*([\d.]+)/g) || []).map(function (s) {
    return Number(s.replace(/intervalSec:\s*/, ''));
  });
  assert.strictEqual(demandIntervals.length, 4, 'Expected 4 DEMAND_REGIMES entries');
  for (let i = 1; i < demandIntervals.length; i++) {
    assert(
      demandIntervals[i] < demandIntervals[i - 1],
      'Expected strictly faster DEMAND_REGIMES intervalSec, got ' + demandIntervals.join(' -> ')
    );
  }
});

console.log('6. Chapter 5 contracts (Rollout & Messaging)');

check('Stories and lessons stay in real-world domain language (zero canvas shape/badge glyphs, UI widget terms, or "move" metaphor)', function () {
  const chapters = api.getChapters();
  const forbidden = /\b(Circle|Triangle|Oval|Square|wrench badge|solid Built|Queue Tray|dials?|sliders?|presets?|checkbox(?:es)?|toggles?|buttons?)\b|\?\?\?/i;
  const moveWord = /\b(move|moved|moves|moving)\b/i;
  Object.keys(chapters).forEach(function (k) {
    const ch = chapters[k];
    assert(!forbidden.test(ch.storyHtml), 'Ch. ' + k + ' storyHtml mentions a canvas shape/badge glyph');
    assert(!forbidden.test(ch.lessonText), 'Ch. ' + k + ' lessonText mentions a canvas shape/badge glyph');
    assert(!moveWord.test(ch.storyHtml), 'Ch. ' + k + ' storyHtml uses "move/moved/moving"');
    assert(!moveWord.test(ch.lessonText), 'Ch. ' + k + ' lessonText uses "move/moved/moving"');
    assert(!moveWord.test(ch.cyberneticsHeading), 'Ch. ' + k + ' cyberneticsHeading uses "move/moved/moving"');
    assert(!moveWord.test(ch.cyberneticsHtml), 'Ch. ' + k + ' cyberneticsHtml uses "move/moved/moving"');
    assert(!moveWord.test(ch.cyberneticsLessonText), 'Ch. ' + k + ' cyberneticsLessonText uses "move/moved/moving"');
  });
});

check('All 8 chapter tabs (1..8) are enabled in the finished 8-chapter walkthrough', function () {
  assert(!htmlSource.includes('class="topbar"'), 'Topbar header should be removed');
  assert(!/<span class="chapter-num">Chapter\s+\d+<\/span>/.test(htmlSource), 'Chapter tabs should use compact single-line 1..8 numbers');
  assert.strictEqual(api.getState().maxBuiltChapter, 8, 'Expected maxBuiltChapter === 8');
  assert.strictEqual(chapterTabs.length, 8, 'Expected 8 chapter tabs in index.html');
  chapterTabs.forEach(function (tab, idx) {
    assert(!tab.disabled, 'Expected Chapter ' + (idx + 1) + ' tab to be enabled');
  });
});

check('Ch. 5 default ("Hype label on clean code") passes testing yet fails (<35%) due to mislabelling', function () {
  api.applyChapter(5);
  assert(!idElements.rolloutControlBlock.classList.contains('is-hidden') && !idElements.reachSlider.disabled, 'Rollout stayed hidden/locked on Ch. 5');
  assert(!idElements.messagingNoiseGroup.classList.contains('is-hidden') && !idElements.messagingNoiseSlider.disabled, 'Messaging noise stayed hidden/locked on Ch. 5');
  assert(idElements.channelsControlBlock.classList.contains('is-hidden') && idElements.diagnosticChannelToggle.disabled, 'Channels visible/unlocked early on Ch. 5');

  const st = runSeconds(65);
  const fit = avgFit(st.history);
  assert(fit < 35, 'Expected hype mislabelling to drop fit <35%, got ' + fit.toFixed(1) + '%');
  assert(
    st.history.every(function (h) {
      return h.testedPassed && h.labelStatus === 'hype' && h.shippedLabel !== h.builtFor;
    }),
    'Expected every item to pass testing cleanly yet carry a mismatched hype label'
  );
});

check('A1: renderHistoryStrip() escapes HTML attributes so mislabelled chip tooltips never truncate', function () {
  api.applyChapter(5);
  runSeconds(65);
  const rawHtml = idElements.historyStrip.innerHTML;
  const chips = rawHtml.split('</span>').filter(Boolean);
  assert(chips.length >= 6, 'Expected at least 6 rendered history chips');
  chips.forEach(function (chipHtml) {
    const m = chipHtml.match(/^<span class="history-chip [^"]+" title="([^"]+)">[^<]+$/);
    assert(m, 'Malformed or unescaped quote in history chip HTML: ' + chipHtml);
    assert(
      m[1].includes('labelled &quot;') && m[1].includes('&quot;], world was '),
      'Expected escaped quotes and non-truncated world suffix in tooltip: ' + m[1]
    );
  });
});

check('Ch. 5 "Silent launch" preset leaves product unlabelled ("???") with low reach (<35% fit)', function () {
  api.applyPreset(5, 1);
  const st = runSeconds(65);
  const fit = avgFit(st.history);
  assert(fit < 35, 'Expected silent rollout to drop fit <35%, got ' + fit.toFixed(1) + '%');
  assert(
    st.history.every(function (h) {
      return h.labelStatus === 'silent' && h.shippedLabel === '???';
    }),
    'Expected silent rollout items to carry "???" unlabelled status'
  );
});

check('Ch. 5 "Accurate messaging + guided onboarding" preset restores accurate label and high fit (>=75%)', function () {
  api.applyPreset(5, 2);
  const st = runSeconds(75);
  const fit = avgFit(st.history);
  assert(fit >= 75, 'Expected >=75% fit with guided onboarding & messaging check, got ' + fit.toFixed(1) + '%');
  assert(
    st.history.every(function (h) {
      return h.labelStatus === 'accurate' && h.shippedLabel === h.builtFor;
    }),
    'Expected guided onboarding check to restore accurate label matching what was built'
  );
});

check('B4.4: Ch. 5 & Ch. 8 Cybernetics view keep Amplification consistent as output-boundary variety amplification & transduction', function () {
  const chapters = api.getChapters();
  assert(
    chapters[5].cyberneticsHtml.includes('output-boundary <strong>transducer</strong>') &&
    chapters[5].cyberneticsHtml.includes('variety amplification'),
    'Expected Ch. 5 cyberneticsHtml to frame Amplification as variety amplification & output-boundary transduction'
  );
  assert(
    !chapters[8].cyberneticsHtml.includes('<code>Operations</code> and <code>Amplification</code>') &&
    chapters[8].cyberneticsHtml.includes('output-boundary <code>Amplification</code> and transduction'),
    'Expected Ch. 8 cyberneticsHtml not to lump Amplification inside System 1 Operations'
  );
});

console.log('7. Chapter 6 contracts (Fault Isolation)');

check('Ch. 6 default ("Summary metric: blind guessing") mis-routes Rollout fault into Build/Discovery (<48% fit, 0 green recoveries)', function () {
  api.applyChapter(6);
  assert(!idElements.channelsControlBlock.classList.contains('is-hidden') && !idElements.diagnosticChannelBox.classList.contains('is-hidden') && !idElements.diagnosticChannelToggle.disabled, 'Diagnostic channel stayed hidden/locked on Ch. 6');
  assert(idElements.andonCordBox.classList.contains('is-hidden') && idElements.andonCordToggle.disabled, 'Andon cord visible/unlocked early on Ch. 6');
  assert(idElements.shockControlGroup.classList.contains('is-hidden') && idElements.shockSlider.disabled, 'Shock probability visible/unlocked early on Ch. 6');

  const st = runSeconds(115, function (frame) {
    assert.strictEqual(frame.effective.diagnosticActive, false, 'Diagnostic channel should start off on Ch. 6');
  });
  const fit = avgFit(st.history);
  assert(fit < 48, 'Expected blind 1-bit guessing to keep settled fit <48%, got ' + fit.toFixed(1) + '%');
  assert(
    st.history.every(function (h) { return h.fitPct < 75; }),
    'Expected zero green recoveries when blind guessing leaves Rollout broken'
  );
  assert(
    st.history.some(function (h) {
      return (
        h.outerReturns >= 1 &&
        h.outerMode === 'blind' &&
        h.trueFault === 'rollout' &&
        (h.outerExit === 'build' || h.outerExit === 'discovery')
      );
    }),
    'Expected blind Outer Loop guessing to mark Rollout as trueFault while routing to Build or Discovery'
  );
});

check('Ch. 6 "Watch real users: isolates Rollout" preset keeps initial Red flops on record, marks retries with ↻, and recovers settled fit (>=75%)', function () {
  api.applyPreset(6, 1);
  const st = runSeconds(95, function (frame) {
    assert.strictEqual(frame.effective.diagnosticActive, true, 'Diagnostic channel should be active on Ch. 6 preset 1');
  });
  const sFit = settledAvgFit(st.history);
  const rawFit = avgFit(st.history);
  assert(sFit >= 75, 'Expected settled bet fit >=75% when watching real users isolates Rollout, got ' + sFit.toFixed(1) + '%');
  assert(rawFit < sFit - 10, 'Expected raw launch average to stay lower than settled fit because initial flops remain in history');

  const firstPassFlops = st.history.filter(function (h) { return h.outerReturns === 0; });
  const returns = st.history.filter(function (h) { return h.outerReturns >= 1; });
  assert(firstPassFlops.length >= 6, 'Expected initial Red flops to stay in rolling history instead of being overwritten');
  assert(
    firstPassFlops.every(function (h) { return h.fitPct < 60 && !h.settled; }),
    'Expected initial launches on Preset 1 to record <60% pre-rework flops'
  );
  assert(returns.length >= 6, 'Expected continuous diagnosed Outer Loop returns in rolling history');
  assert(
    returns.every(function (h) {
      return (
        h.outerMode === 'diagnosed' &&
        h.trueFault === h.outerExit &&
        h.initialFitPct < 60 &&
        h.initialFitPct < h.fitPct
      );
    }),
    'Expected every diagnosed return to match its trueFault exit and preserve initialFitPct < fitPct'
  );
  assert(
    returns.filter(function (h) { return h.outerExit === 'rollout'; }).length >= 6,
    'Expected Rollout exit to be taken repeatedly on Preset 1'
  );
  assert(
    idElements.historyStrip.innerHTML.includes('\u21bb'),
    'Expected retry chips in #historyStrip to carry the ↻ marker'
  );
  assert(
    idElements.historySummary.innerHTML.includes('Settled bet fit:') &&
    idElements.historySummary.innerHTML.includes('All launches:'),
    'Expected #historySummary to report both Settled bet fit and All launches when retries occur'
  );
});

check('Ch. 6 "\'Marketing push\' on a wrong Spec" preset mis-routes wrong-Spec failures (<50% fit), and enabling Diagnostic channel takes Discovery exit (>=74% settled fit)', function () {
  api.applyPreset(6, 2);
  const st = runSeconds(115);
  const fit = avgFit(st.history);
  assert(fit < 50, 'Expected blind guessing on a wrong Spec to stay <50% fit, got ' + fit.toFixed(1) + '%');
  assert(
    st.history.some(function (h) {
      return h.outerReturns >= 1 && h.outerMode === 'blind' && (h.outerExit === 'rollout' || h.outerExit === 'build');
    }),
    'Expected wrong-Spec failures to be mis-routed to Rollout or Build under blind guessing'
  );

  // Turning on Diagnostic channel isolates Discovery and takes the Re-read market exit
  idElements.diagnosticChannelToggle.checked = true;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  const recovered = runSeconds(185);
  const recFit = settledAvgFit(recovered.history);
  assert(recFit >= 74, 'Expected Diagnostic channel on wrong Spec to recover settled fit >=74%, got ' + recFit.toFixed(1) + '%');
  const discReturns = recovered.history.filter(function (h) { return h.outerExit === 'discovery'; });
  assert(discReturns.length >= 6, 'Expected Discovery (Re-read market) exit to be taken repeatedly');
});

check('Ch. 6 "Escaped bug: isolates Build hotfix" preset escapes Light testing, takes Build exit, and recovers settled fit (>=75%)', function () {
  api.applyPreset(6, 3);
  assert.strictEqual(api.getState().effective.testingIdx, 1, 'Expected Preset 4 to run Light testing (testingIdx === 1)');
  const diagLoop = parseFloat(idElements.loopTimeValue.textContent);
  assert(
    idElements.loopTimeValue.textContent.includes('(incl. rework)'),
    'Expected Preset 4 loopTimeValue to reflect Outer Loop rework, got ' + idElements.loopTimeValue.textContent
  );

  const earlySt = runSeconds(6.0);
  assert(
    earlySt.history.length >= 1 &&
      earlySt.history[0].testedPassed &&
      earlySt.history[0].reworkCount === 0 &&
      earlySt.history[0].fitPct < 60 &&
      !earlySt.history[0].settled,
    'Expected Bet #1 on Preset 4 to escape Light testing within 6s and trigger an Outer Loop Build hotfix'
  );

  const st = runSeconds(89);
  const fit = settledAvgFit(st.history);
  assert(fit >= 75, 'Expected settled fit >=75% when watching real users isolates an escaped Build bug, got ' + fit.toFixed(1) + '%');
  const escapedFlops = st.history.filter(function (h) {
    return h.outerReturns === 0 && !h.settled;
  });
  assert(
    escapedFlops.length >= 6 &&
      escapedFlops.every(function (h) { return h.testedPassed && h.reworkCount === 0 && h.fitPct < 60; }),
    'Expected escaped bugs to genuinely pass Light testing (testedPassed && reworkCount === 0) before failing at Real Users'
  );
  const returns = st.history.filter(function (h) { return h.outerReturns >= 1; });
  assert(returns.length >= 6, 'Expected continuous diagnosed Build returns in rolling history');
  assert(
    returns.every(function (h) {
      return h.outerMode === 'diagnosed' && h.trueFault === h.outerExit && h.initialFitPct < 62 && h.initialFitPct < h.fitPct;
    }),
    'Expected every diagnosed return to match its trueFault exit'
  );
  assert(
    returns.filter(function (h) { return h.outerExit === 'build'; }).length >= 6,
    'Expected Build exit to be taken repeatedly on Preset 4'
  );

  idElements.diagnosticChannelToggle.checked = false;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  const blindLoop = parseFloat(idElements.loopTimeValue.textContent);
  assert(
    blindLoop > diagLoop + 3.6,
    'Expected unchecking Diagnostic channel on Preset 4 to inflate expected loop time (' + diagLoop + 'd -> ' + blindLoop + 'd)'
  );
});

check('B2: Concurrent Outer Loop retries (Ch. 7/8) also preserve initialFitPct < fitPct and ↻ chip markers', function () {
  api.applyChapter(7);
  runSeconds(35);
  idElements.topShockBtn.dispatchEvent('click');
  const st = runSeconds(45);
  const retries = st.history.filter(function (h) { return h.outerReturns > 0; });
  assert(retries.length >= 2, 'Expected concurrent Outer Loop retries after un-preempted shock in Ch. 7');
  assert(
    retries.every(function (h) { return h.initialFitPct < 60 && h.initialFitPct !== h.fitPct; }),
    'Expected concurrent retries in Ch. 7 to preserve true Pass-1 initialFitPct rather than overwriting with Pass-2 fitPct'
  );
  assert(idElements.historyStrip.innerHTML.includes('\u21bb'), 'Expected ↻ marker on Ch. 7 retry chips');
});

check('B4.3: Ch. 6 & Ch. 8 Cybernetics view explicitly connect System 4 scanning to the horizon channel alongside diagnostic & algedonic channels', function () {
  const chapters = api.getChapters();
  assert(
    chapters[6].cyberneticsHtml.includes('horizon channel') &&
    chapters[6].cyberneticsHtml.includes('outside yesterday\'s build'),
    'Expected Ch. 6 cyberneticsHtml to name System 4\'s upstream horizon channel'
  );
  assert(
    chapters[8].cyberneticsHtml.includes('horizon channel') &&
    chapters[8].cyberneticsHtml.includes('diagnostic channel') &&
    chapters[8].cyberneticsHtml.includes('algedonic channel') &&
    chapters[8].cyberneticsHtml.includes('all three incoming channels'),
    'Expected Ch. 8 cyberneticsHtml to unite all three incoming channels from factors.md'
  );
});

console.log('8. Chapter 7 contracts (Rogue Waves & the Andon Cord)');

check('Ch. 7 default opens in healthy changing-world steady flow (Queue: 0, >=75% Green fit) before a shock', function () {
  api.applyChapter(7);
  assert(!idElements.topShockBtn.classList.contains('is-hidden'), 'Top Trigger Shock Wave button hidden on Ch. 7');
  assert(!idElements.shockControlGroup.classList.contains('is-hidden') && !idElements.shockSlider.disabled, 'Shock group stayed hidden/locked on Ch. 7');
  assert(!idElements.andonCordBox.classList.contains('is-hidden') && !idElements.andonCordToggle.disabled, 'Andon cord box stayed hidden/locked on Ch. 7');

  let peakQueue = 0;
  const st = runSeconds(180, function (frame) {
    assert.strictEqual(frame.effective.diagnosticActive, true, 'Ch. 7 should start with Diagnostic channel active');
    assert.strictEqual(frame.effective.andonActive, false, 'Ch. 7 should start with Andon cord off');
    if (frame.queueCount > peakQueue) peakQueue = frame.queueCount;
  });
  assert.strictEqual(st.shockCount, 0, 'Expected zero automatic shocks before manual trigger');
  assert(peakQueue <= 2 && st.queueCount <= 1, 'Expected steady pre-shock flow over 180s without queue jam (peak<=2, end<=1), peak was ' + peakQueue + ', end was ' + st.queueCount);
  const fit = avgFit(st.history);
  assert(fit >= 75, 'Expected healthy changing-world baseline fit >=75% over 180s, got ' + fit.toFixed(1) + '%');
});

check('Clicking Trigger Shock Wave once without Code Blue tips steady flow into a runaway rework queue; pulling Code Blue breaks the jam', function () {
  api.applyChapter(7);
  runSeconds(45);
  idElements.topShockBtn.dispatchEvent('click');

  const jammed = runSeconds(60);
  assert(jammed.queues.discovery >= 6, 'Expected single un-preempted shock to trigger a Discovery rework jam (>=6), got ' + jammed.queues.discovery);
  const jammedFit = avgFit(jammed.history);
  assert(jammedFit < 62, 'Expected rework-queue jam after shock to degrade rolling fit <62%, got ' + jammedFit.toFixed(1) + '%');
  assert(
    jammed.history.some(function (h) { return h.fitPct < 48; }),
    'Expected Red launches during post-shock congestion spiral'
  );

  // Pulling Code Blue / Andon cord reactively clears the jammed queue and restores Green fit
  idElements.andonCordToggle.checked = true;
  idElements.andonCordToggle.dispatchEvent('change');
  assert.strictEqual(api.getState().queueCount, 0, 'Pulling Code Blue should immediately flush the jammed queue');
  assert(api.getState().totalFlushedByAndon >= 6, 'Expected reactive Code Blue pull to flush jammed items');

  const recovered = runSeconds(75);
  const recoveredFit = avgFit(recovered.history);
  assert(recoveredFit >= 72, 'Expected reactive Code Blue flush to restore steady fit >=72%, got ' + recoveredFit.toFixed(1) + '%');
});

check('Ch. 7 "Healthy flow + Code Blue armed" preset preempts manual shock with zero queue jam (>=72% fit)', function () {
  api.applyPreset(7, 1);
  runSeconds(45);
  let peakQueueAfterShock = 0;
  idElements.topShockBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().queueCount, 0, 'Preemptive Code Blue should clear queues immediately');
  assert(api.getState().totalFlushedByAndon >= 3, 'Expected preemptive Code Blue to clear in-flight pre-shock items');

  const st = runSeconds(40, function (frame) {
    if (frame.queueCount > peakQueueAfterShock) peakQueueAfterShock = frame.queueCount;
  });
  assert(
    peakQueueAfterShock <= 2 && st.queueCount === 0,
    'Expected zero rework queue jam when Code Blue is armed (peak<=2, end===0), peak was ' + peakQueueAfterShock + ', end was ' + st.queueCount
  );
  const fit = avgFit(st.history);
  assert(fit >= 72, 'Expected Code Blue armed to keep rolling fit >=72% across shock, got ' + fit.toFixed(1) + '%');
});

check('Ch. 7 "Frequent auto-shocks (no Andon cord)" preset collapses into congestion (<58% fit)', function () {
  api.applyPreset(7, 2);
  let peakQueue = 0;
  const st = runSeconds(115, function (frame) {
    if (frame.queueCount > peakQueue) peakQueue = frame.queueCount;
  });
  assert(st.shockCount >= 8, 'Expected frequent shocks to fire (>=8)');
  assert(peakQueue >= 5, 'Expected auto-shocks without Andon to build rework queues (>=5), peak was ' + peakQueue);
  const fit = avgFit(st.history);
  assert(fit < 58, 'Expected auto-shocks without Andon to degrade fit <58%, got ' + fit.toFixed(1) + '%');
});

check('Ch. 7 "Frequent auto-shocks + Code Blue active" preset keeps queues clear and restores fit (>=72%)', function () {
  api.applyPreset(7, 3);
  let peakQueue = 0;
  const st = runSeconds(115, function (frame) {
    if (frame.queueCount > peakQueue) peakQueue = frame.queueCount;
  });
  assert(st.totalFlushedByAndon >= 20, 'Expected Code Blue to flush pre-shock items across frequent shocks');
  assert(peakQueue <= 1, 'Expected Code Blue to prevent rework queue buildup (<=1), peak was ' + peakQueue);
  const fit = avgFit(st.history);
  assert(fit >= 72, 'Expected Code Blue to preserve fit >=72% under frequent shocks, got ' + fit.toFixed(1) + '%');
});

check('Panel Trigger Shock Wave button matches top-bar shock button behaviour', function () {
  api.applyChapter(7);
  runSeconds(8.0);
  const beforeOff = api.getState().inFlightCount;
  assert(beforeOff >= 3, 'Expected items in flight before panel shock');
  idElements.triggerShockBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().shockCount, 1, 'Expected shockCount === 1 after panel shock click');
  assert.strictEqual(api.getState().inFlightCount, beforeOff, 'Panel shock with Andon off should keep in-flight items');

  api.applyPreset(7, 1);
  runSeconds(8.0);
  idElements.triggerShockBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().queueCount, 0, 'Panel shock with Andon on should clear queues immediately');
  assert.strictEqual(api.getState().inFlightCount, 1, 'Panel shock with Andon on should leave 1 fresh item starting Discovery');
});

check('B4.5: Ch. 7 Cybernetics view distinguishes internal System 1 operational pain from external System 4 step-shocks on the algedonic wire', function () {
  const ch7 = api.getChapters()[7];
  assert(
    ch7.cyberneticsHtml.includes('operational pain inside <strong>System 1</strong>') &&
    ch7.cyberneticsHtml.includes('<strong>System 4</strong> emergency scanning') &&
    ch7.cyberneticsHtml.includes('<strong>Systems 3 and 5</strong>'),
    'Expected Ch. 7 cyberneticsHtml to distinguish internal System 1 pain from external System 4 emergency scanning'
  );
});

check('B5.1: Ch. 7 uses Major-Incident Trauma Alert in the hospital story and clean Andon cord labels on UI, presets, and canvas', function () {
  const ch7 = api.getChapters()[7];
  assert(ch7.heading.includes('Major-Incident Alarm'), 'Expected Ch. 7 heading to reference Major-Incident Alarm');
  assert(
    ch7.storyHtml.includes('Major-Incident Trauma Alert') &&
    ch7.storyHtml.includes('14:14') &&
    !ch7.storyHtml.includes('Code Blue'),
    'Expected Ch. 7 storyHtml to replace Code Blue with Major-Incident Trauma Alert at 14:14'
  );
  assert(
    ch7.lessonText.includes('an Andon cord that pre-empts') &&
    !ch7.lessonText.includes('Code Blue'),
    'Expected Ch. 7 lessonText to use Andon cord without Code Blue'
  );
  assert(
    ch7.presets.every(function (p) { return !p.label.includes('Code Blue'); }),
    'Expected Ch. 7 preset labels not to contain Code Blue'
  );
  assert(!htmlSource.includes('Code Blue'), 'Expected static index.html not to contain Code Blue');

  api.setViewMode('product');
  api.applyPreset(7, 1);
  api.step(0);
  assert.strictEqual(idElements.andonCordTitle.textContent, 'Andon cord: pre-empt & flush queues on shock');
  const armedTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; }).join(' | ');
  assert(
    armedTexts.includes('Andon cord armed') && !armedTexts.includes('Code Blue'),
    'Expected armed canvas status to use Andon cord without Code Blue'
  );
  runSeconds(8.0);
  idElements.topShockBtn.dispatchEvent('click');
  api.step(0);
  const flashTextObjs = idElements.simCanvas._canvasTexts || [];
  const flashTexts = flashTextObjs.map(function (t) { return t.text; }).join(' | ');
  assert(
    flashTexts.includes('ANDON CORD PULLED') && !flashTexts.includes('CODE BLUE'),
    'Expected shock flash pill to say ANDON CORD PULLED without CODE BLUE'
  );
  const pillTextObj = flashTextObjs.find(function (t) { return t.text.includes('ANDON CORD PULLED'); });
  const queueTextObjs = flashTextObjs.filter(function (t) { return t.text === 'Queue: 0'; });
  assert(
    pillTextObj && pillTextObj.y <= 18 && queueTextObjs.length === 4 && queueTextObjs.every(function (q) { return q.y >= 40; }),
    'Expected ANDON CORD PULLED banner (y<=18) to stay cleanly above all four Queue Trays (y>=40)'
  );
  const andonWire = (idElements.simCanvas._canvasSegments || []).find(function (s) {
    return s.y1 === s.y2 && Math.abs(s.x2 - s.x1) > 600 && s.y1 < 60;
  });
  assert(
    andonWire && andonWire.y1 <= 16,
    'Expected horizontal Andon flash wire to sit in the top header lane (y<=16), clear of Queue Trays (y=24..60)'
  );
});

console.log('9. Chapter 8 contracts (Full Sandbox / Governance, System 5)');

check('Ch. 8 opens on "Viable System (balanced, default)" with all controls unlocked and steady fit (>=72%) under drift + shocks', function () {
  api.applyChapter(8);
  assert(!idElements.flowControlBlock.classList.contains('is-hidden') && !idElements.wipSlider.disabled, 'Flow hidden/locked on Ch. 8');
  assert(!idElements.demandControlGroup.classList.contains('is-hidden') && !idElements.demandSlider.disabled, 'Demand hidden/locked on Ch. 8');
  assert(!idElements.shockControlGroup.classList.contains('is-hidden') && !idElements.shockSlider.disabled, 'Shock group hidden/locked on Ch. 8');
  assert(!idElements.topShockBtn.classList.contains('is-hidden'), 'Top shock button hidden on Ch. 8');
  assert(!idElements.discoveryNoiseGroup.classList.contains('is-hidden') && !idElements.discoveryNoiseSlider.disabled, 'Discovery noise hidden/locked on Ch. 8');
  assert(!idElements.buildNoiseGroup.classList.contains('is-hidden') && !idElements.buildNoiseSlider.disabled, 'Build noise hidden/locked on Ch. 8');
  assert(!idElements.build10xBox.classList.contains('is-hidden') && !idElements.build10xToggle.disabled, '10x Build hidden/locked on Ch. 8');
  assert(!idElements.testingControlBlock.classList.contains('is-hidden') && !idElements.testingSlider.disabled, 'Testing hidden/locked on Ch. 8');
  assert(!idElements.rolloutControlBlock.classList.contains('is-hidden') && !idElements.reachSlider.disabled, 'Rollout hidden/locked on Ch. 8');
  assert(!idElements.channelsControlBlock.classList.contains('is-hidden') && !idElements.diagnosticChannelToggle.disabled, 'Channels hidden/locked on Ch. 8');
  assert(!idElements.andonCordBox.classList.contains('is-hidden') && !idElements.andonCordToggle.disabled, 'Andon cord hidden/locked on Ch. 8');
  assert(
    [
      idElements.flowNewBadge,
      idElements.worldNewBadge,
      idElements.discoveryNewBadge,
      idElements.buildNewBadge,
      idElements.testingNewBadge,
      idElements.rolloutNewBadge,
      idElements.channelsNewBadge
    ].every(function (el) { return el.classList.contains('is-hidden'); }),
    'Expected per-chapter Ch. N badges to hide cleanly in Full Sandbox'
  );

  let peakQueue = 0;
  const st = runSeconds(105, function (frame) {
    if (frame.queueCount > peakQueue) peakQueue = frame.queueCount;
  });
  assert(st.shockCount >= 5, 'Expected occasional shocks to fire on Viable System (>=5), got ' + st.shockCount);
  assert(st.totalFlushedByAndon >= 12, 'Expected Code Blue to preempt shocks on Viable System');
  assert(peakQueue <= 1, 'Expected Viable System to keep queues clear (<=1), peak was ' + peakQueue);
  const fit = avgFit(st.history);
  assert(fit >= 72, 'Expected Viable System default on Ch. 8 to achieve >=72% fit, got ' + fit.toFixed(1) + '%');
});

check('R3.1: Ch. 8 Viable System also stays queue-free and healthy (>=75% fit) over 180s when Shock probability is Off', function () {
  api.applyChapter(8);
  idElements.shockSlider.value = '0';
  idElements.shockSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  let peakQueue = 0;
  const st = runSeconds(180, function (frame) {
    if (frame.queueCount > peakQueue) peakQueue = frame.queueCount;
  });
  assert.strictEqual(st.shockCount, 0, 'Expected zero shocks when Shock probability is Off');
  assert(peakQueue <= 2 && st.queueCount <= 1, 'Expected Ch. 8 Viable System with shocks Off to stay queue-free (peak<=2, end<=1) over 180s, peak was ' + peakQueue + ', end was ' + st.queueCount);
  const fit = avgFit(st.history);
  assert(fit >= 75, 'Expected Ch. 8 Viable System with shocks Off to sustain >=75% fit over 180s, got ' + fit.toFixed(1) + '%');
});

check('R3.2: Pair/mob adds 0s lead time, Diagnostic channel adds +0.35s per release, and Stormy shocks surface thrashing & Aborted by Andon count', function () {
  // 1. Pair or mob adds 0s elapsed build time while cutting Build noise ~84%
  api.setViewMode('product');
  api.applyChapter(2);
  const soloBuildSec = api.getState().effective.buildSec;
  const soloBuildNoise = api.getState().effective.buildNoise;
  idElements.buildDampenerToggle.checked = true;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert.strictEqual(api.getState().effective.buildSec, soloBuildSec, 'Pair or mob must not add elapsed build time');
  assert(api.getState().effective.buildNoise < soloBuildNoise * 0.2, 'Pair or mob should still cut Build noise ~84%');
  assert(!idElements.buildRegime.textContent.includes('+0.7s') && !idElements.buildRegime.textContent.includes('+1.4d'), 'Expected #buildRegime not to show artificial pairing delay');
  const buildIdleTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(buildIdleTexts.includes('Paired \u00b7 1 at a time'), 'Expected Build idle label "Paired · 1 at a time" when pairing is active');

  // 2. Diagnostic channel adds +0.7d (+0.35s) ongoing observation per release even on healthy 1-pass flow
  api.applyChapter(7);
  const diagOnLoop = parseFloat(idElements.loopTimeValue.textContent);
  idElements.diagnosticChannelToggle.checked = false;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  const diagOffLoop = parseFloat(idElements.loopTimeValue.textContent);
  assert(
    Math.abs((diagOnLoop - diagOffLoop) - 0.7) < 0.25,
    'Expected Diagnostic channel to add ~0.7d per release on healthy flow (' + diagOffLoop + 'd vs ' + diagOnLoop + 'd)'
  );

  // 3. Stormy shocks (10.8d) + Strict testing (>10.8d loop) + Andon ON flags red thrashing and surfaces aborted bets
  api.applyChapter(8);
  idElements.shockSlider.value = '3';
  idElements.shockSlider.dispatchEvent('input');
  idElements.testingSlider.value = '3';
  idElements.testingSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  assert(idElements.worldCycleValue.textContent.includes('shock ~10.8d'), 'Expected #worldCycleValue to display shock ~10.8d');
  assert(idElements.stabilityBadge.classList.contains('danger'), 'Expected #stabilityBadge to have .danger class under thrashing');
  assert.strictEqual(
    idElements.stabilityBadge.textContent,
    'Slower than shocks (thrashing!)',
    'Expected red thrashing warning when shocks outpace loop with Andon ON'
  );

  const thrashed = runSeconds(60);
  assert.strictEqual(thrashed.history.length, 0, 'Expected 0 completed launches under Stormy thrashing');
  assert(thrashed.totalFlushedByAndon >= 20, 'Expected Andon to abort >=20 in-flight bets during Stormy thrashing');
  assert(
    idElements.historyStrip.innerHTML.includes('0 launches completed (') &&
      idElements.historyStrip.innerHTML.includes('aborted mid-flight by Andon cord'),
    'Expected #historyStrip to surface 0 launches completed + aborted mid-flight message'
  );
  assert(
    idElements.historySummary.innerHTML.includes('Aborted by Andon: <span class="mono-stat">' + thrashed.totalFlushedByAndon + '</span>'),
    'Expected #historySummary to report exact Aborted by Andon count'
  );

  // Cybernetics view equivalents for thrashing & purged counts
  api.setViewMode('cybernetics');
  assert.strictEqual(idElements.stabilityBadge.textContent, 'Unstable (lag > shocks: thrashing!)');
  assert(idElements.historyStrip.innerHTML.includes('purged by algedonic interrupt'));
  assert(idElements.historySummary.innerHTML.includes('Purged by algedonic:'));

  // With Andon OFF under Stormy shocks, badge switches from thrashing to stale
  api.setViewMode('product');
  idElements.andonCordToggle.checked = false;
  idElements.andonCordToggle.dispatchEvent('change');
  assert.strictEqual(
    idElements.stabilityBadge.textContent,
    'Slower than shocks (stale!)',
    'Expected red stale warning when shocks outpace loop with Andon OFF'
  );

  // 4. Normal Viable System with Occasional shocks also displays Aborted by Andon alongside positive launch fit
  api.applyChapter(8);
  const viable = runSeconds(35);
  assert(viable.history.length >= 6 && viable.totalFlushedByAndon >= 3, 'Expected both completed launches and Andon flushes on Viable System');
  assert(
    idElements.historySummary.innerHTML.includes('Aborted by Andon:'),
    'Expected #historySummary to append Aborted by Andon alongside completed launch fit'
  );
});

check('Ch. 8 "Feature Factory" preset floods pipeline with unvalidated noisy bets (<50% fit)', function () {
  api.applyPreset(8, 1);
  const st = runSeconds(95);
  const fit = avgFit(st.history);
  assert(fit < 50, 'Expected Feature Factory to stay <50% fit, got ' + fit.toFixed(1) + '%');
});

check('Ch. 8 "Analysis Paralysis" preset loses to market drift despite careful upfront specs (<56% fit)', function () {
  api.applyPreset(8, 2);
  const dampedDisc = api.getState().effective.discoveryNoise;
  const dampedMsg = api.getState().effective.messagingNoise;
  const st = runSeconds(185);
  const fit = avgFit(st.history);
  assert(fit < 56, 'Expected Analysis Paralysis to stay <56% fit, got ' + fit.toFixed(1) + '%');

  idElements.discoveryDampenerToggle.checked = false;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  idElements.rolloutDampenerToggle.checked = false;
  idElements.rolloutDampenerToggle.dispatchEvent('change');
  assert(
    api.getState().effective.discoveryNoise > dampedDisc * 3 &&
      api.getState().effective.messagingNoise > dampedMsg * 3,
    'Expected unticking collaboration checkboxes in Analysis Paralysis to expose real Discovery and Rollout noise'
  );
});

check('Ch. 8 "Ungoverned 10x Build" preset jams Testing queue and ships stale misfits (<52% fit)', function () {
  api.applyPreset(8, 3);
  let peakTestingQueue = 0;
  const st = runSeconds(95, function (frame) {
    if (frame.queues.testing > peakTestingQueue) peakTestingQueue = frame.queues.testing;
  });
  assert(peakTestingQueue >= 5, 'Expected Ungoverned 10x Build to jam Testing queue (>=5), peak was ' + peakTestingQueue);
  const fit = avgFit(st.history);
  assert(fit < 52, 'Expected Ungoverned 10x Build to stay <52% fit, got ' + fit.toFixed(1) + '%');
});

check('Ch. 8 "Hype-Driven Rollout" preset ruins clean code with hype labels and blind blame (<42% fit)', function () {
  api.applyPreset(8, 4);
  const dampedDisc = api.getState().effective.discoveryNoise;
  const dampedBuild = api.getState().effective.buildNoise;
  const st = runSeconds(95);
  const fit = avgFit(st.history);
  assert(fit < 42, 'Expected Hype-Driven Rollout to stay <42% fit, got ' + fit.toFixed(1) + '%');
  assert(
    st.history.some(function (h) {
      return h.testedPassed && h.labelStatus === 'hype' && h.outerMode === 'blind';
    }),
    'Expected Hype-Driven Rollout to pass Testing yet fail with hype label and blind guessing'
  );

  idElements.discoveryDampenerToggle.checked = false;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  idElements.buildDampenerToggle.checked = false;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert(
    api.getState().effective.discoveryNoise > dampedDisc * 3 &&
      api.getState().effective.buildNoise > dampedBuild * 3,
    'Expected unticking collaboration checkboxes in Hype-Driven Rollout to expose real Discovery and Build noise'
  );
});

check('B4.6: Ch. 8 Cybernetics view separates external environmental disturbances from System 5 internal policy levers', function () {
  const ch8 = api.getChapters()[8];
  assert(
    ch8.cyberneticsHtml.includes('Environmental drift and step-shocks remain external disturbances outside the organisation\'s control') &&
    ch8.cyberneticsHtml.includes('setting the internal policy levers below them is <strong>System 5</strong>'),
    'Expected Ch. 8 cyberneticsHtml to separate external disturbances from System 5 internal policy levers'
  );
});

check('B5.2: Ch. 8 sailing-ship story maps all stages accurately and stays strictly in domain-only prose', function () {
  const ch8 = api.getChapters()[8];
  [
    'Flow &amp; WIP',
    'signal flags and harbour pilots',
    'Fault Isolation',
    'Andon cord'
  ].forEach(function (phrase) {
    assert(ch8.storyHtml.includes(phrase), 'Expected Ch. 8 storyHtml to include "' + phrase + '"');
  });
  assert(
    !ch8.storyHtml.includes('helmsman') &&
    !ch8.storyHtml.includes('Code Blue') &&
    !ch8.storyHtml.includes('turning the dials') &&
    !ch8.storyHtml.includes('company presets'),
    'Expected Ch. 8 storyHtml to drop helmsman->Rollout, Code Blue, and UI widget references'
  );
  assert(ch8.lessonText.includes('shock pre-emption'), 'Expected hyphenated shock pre-emption in Ch. 8 lessonText');
  assert(!jsSource.includes('Code Blue'), 'Expected zero remaining Code Blue strings in app.js');
});

console.log('10. Round-trip chapter navigation isolation');

check('Switching 8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1 cleanly clears shocks/queues and re-locks later controls in place', function () {
  api.applyPreset(8, 3);
  runSeconds(20);
  assert(api.getState().queueCount > 0, 'Expected active queue on Ch. 8 Ungoverned 10x Build');

  api.applyChapter(7);
  assert.strictEqual(api.getState().queueCount, 0, 'Switching 8 -> 7 should reset queues cleanly');
  api.applyPreset(7, 3);
  runSeconds(20);
  assert(api.getState().shockCount >= 1, 'Expected shock on Ch. 7 before switching back');

  api.applyChapter(6);
  assert(idElements.topShockBtn.classList.contains('is-hidden'), 'Top shock button stayed visible on Ch. 6');
  assert(idElements.shockControlGroup.classList.contains('is-hidden') && idElements.shockSlider.disabled, 'Shock group stayed visible on Ch. 6');
  assert(idElements.andonCordBox.classList.contains('is-hidden') && idElements.andonCordToggle.disabled, 'Andon cord box stayed visible on Ch. 6');
  assert.strictEqual(api.getState().effective.shockIdx, 0, 'Shock probability leaked onto Ch. 6');
  assert.strictEqual(api.getState().effective.andonActive, false, 'Andon cord leaked onto Ch. 6');
  runSeconds(20);
  assert.strictEqual(api.getState().shockCount, 0, 'Random shock fired on Ch. 6');

  api.applyChapter(5);
  assert(idElements.topShockBtn.classList.contains('is-hidden'), 'Top shock button stayed visible on Ch. 5');
  assert(idElements.channelsControlBlock.classList.contains('is-hidden') && idElements.diagnosticChannelToggle.disabled, 'Channels block stayed visible on Ch. 5');
  assert.strictEqual(api.getState().effective.diagnosticActive, false, 'Diagnostic channel leaked onto Ch. 5');
  runSeconds(15);
  assert.strictEqual(api.getState().shockCount, 0, 'Random shock fired on Ch. 5');
  assert(api.getState().history.every(function (h) { return h.outerReturns === 0; }), 'Outer Loop leaked onto Ch. 5');

  api.applyChapter(4);
  assert(idElements.topShockBtn.classList.contains('is-hidden'), 'Top shock button stayed visible on Ch. 4');
  assert(idElements.rolloutControlBlock.classList.contains('is-hidden') && idElements.reachSlider.disabled, 'Rollout block stayed visible on Ch. 4');
  assert(idElements.messagingNoiseGroup.classList.contains('is-hidden') && idElements.messagingNoiseSlider.disabled, 'Messaging noise stayed visible on Ch. 4');
  runSeconds(15);
  assert(api.getState().queueCount > 0, 'Expected active queue on Ch. 4 before switching back');
  assert.strictEqual(api.getState().shockCount, 0, 'Random shock fired on Ch. 4');
  assert(api.getState().history.every(function (h) { return h.outerReturns === 0; }), 'Outer Loop leaked onto Ch. 4');

  api.applyChapter(3);
  assert.strictEqual(api.getState().queueCount, 0, 'Queues were not cleared when switching 4 -> 3');
  assert(idElements.topShockBtn.classList.contains('is-hidden'), 'Top shock button stayed visible on Ch. 3');
  assert(idElements.flowControlBlock.classList.contains('is-hidden') && idElements.wipSlider.disabled, 'Flow block stayed visible on Ch. 3');
  assert(idElements.demandControlGroup.classList.contains('is-hidden') && idElements.demandSlider.disabled, 'Demand group stayed visible on Ch. 3');
  assert(idElements.build10xBox.classList.contains('is-hidden') && idElements.build10xToggle.disabled, '10x Build box stayed visible on Ch. 3');

  api.applyChapter(2);
  assert(idElements.topShockBtn.classList.contains('is-hidden'), 'Top shock button stayed visible on Ch. 2');
  assert(idElements.testingControlBlock.classList.contains('is-hidden') && idElements.testingSlider.disabled, 'Testing block stayed visible on Ch. 2');

  api.applyChapter(1);
  assert(idElements.topShockBtn.classList.contains('is-hidden'), 'Top shock button stayed visible on Ch. 1');
  assert(idElements.impactBar.classList.contains('is-hidden'), 'Impact bar stayed visible on Ch. 1');
  assert(idElements.shockControlGroup.classList.contains('is-hidden') && idElements.shockSlider.disabled, 'Shock group stayed visible on Ch. 1');
  assert(idElements.noiseConditionsBlock.classList.contains('is-hidden'), 'Noise conditions block stayed visible on Ch. 1');
  assert(idElements.discoveryNoiseGroup.classList.contains('is-hidden') && idElements.discoveryNoiseSlider.disabled, 'Discovery noise stayed visible on Ch. 1');
  assert(idElements.buildNoiseGroup.classList.contains('is-hidden') && idElements.buildNoiseSlider.disabled, 'Build noise stayed visible on Ch. 1');
  assert(idElements.messagingNoiseGroup.classList.contains('is-hidden') && idElements.messagingNoiseSlider.disabled, 'Messaging noise stayed visible on Ch. 1');
  assert(idElements.discoveryDampenerBox.classList.contains('is-hidden') && idElements.discoveryDampenerToggle.disabled, 'Discovery dampener stayed visible on Ch. 1');
  assert(idElements.buildDampenerBox.classList.contains('is-hidden') && idElements.buildDampenerToggle.disabled, 'Build dampener stayed visible on Ch. 1');
  assert(idElements.testingControlBlock.classList.contains('is-hidden') && idElements.testingSlider.disabled, 'Testing block stayed visible on Ch. 1');
  assert(idElements.rolloutControlBlock.classList.contains('is-hidden') && idElements.reachSlider.disabled, 'Rollout block stayed visible on Ch. 1');
  assert(idElements.channelsControlBlock.classList.contains('is-hidden') && idElements.diagnosticChannelToggle.disabled, 'Channels block stayed visible on Ch. 1');
  assert.strictEqual(api.getState().history.length, 0, 'History did not reset on chapter switch');
});

check('B3: Product view vs Cybernetics view toggle swaps headings, prose, lessons, headers, and canvas eyebrows cleanly', function () {
  assert(!htmlSource.includes('governance-note'), 'Removed .governance-note still in index.html');
  assert(!htmlSource.includes('cyberneticsLens'), 'Old <details> cybernetics drawer still in index.html');
  assert(!/\bSystem\s+[1-5]\*?|relaxation time|Transducer/i.test(htmlSource), 'Static index.html leaks cybernetics jargon in Product view');
  assert(!htmlSource.includes('Unlocks Ch.') && !jsSource.includes('Unlocks Ch.'), 'Retired "Unlocks Ch." lock copy still present');
  const panelCards = htmlSource.match(/<section class="panel-card[^>]*>/g) || [];
  assert.strictEqual(panelCards.length, 2, 'Expected two side-by-side panel-card columns (World & Unchecked Noise left, Governance right)');
  assert(!htmlSource.includes('narrative-toolbar'), 'View toggle should no longer sit inside .narrative-toolbar');
  assert(htmlSource.includes('<span class="view-mode-prefix">Language:</span>'), 'Expected Language: prefix beside view toggle');
  assert(
    htmlSource.indexOf('id="productViewBtn"') < htmlSource.indexOf('class="chapter-nav"'),
    'Expected global view-mode toggle bar to sit above .chapter-nav'
  );

  // Verify Product view across all 8 chapters has zero VSM / 1-bit / relaxation-time leaks
  api.setViewMode('product');
  const vsmLeak = /\b(System\s*[1-5]\*?|SYSTEM\s*[1-5]\*?|SYS\s*1|HIGH VARIETY|1-bit|relaxation time)\b/;
  for (let ch = 1; ch <= 8; ch++) {
    api.applyChapter(ch);
    api.step(0);
    assert(!vsmLeak.test(idElements.chapterHeading.textContent), 'Product heading leaked VSM jargon on Ch. ' + ch);
    assert(!vsmLeak.test(idElements.chapterStory.innerHTML), 'Product story leaked VSM jargon on Ch. ' + ch);
    assert(!vsmLeak.test(idElements.lessonText.textContent), 'Product lesson leaked VSM jargon on Ch. ' + ch);
    assert(!vsmLeak.test(idElements.activeControlsEyebrow.textContent), 'Active controls eyebrow leaked VSM on Ch. ' + ch);
    assert(!vsmLeak.test(idElements.flowBlockTitle.textContent), 'Flow header leaked VSM in Product view');
    assert(!vsmLeak.test(idElements.discoveryBlockTitle.textContent), 'Discovery header leaked VSM in Product view');
    assert(!vsmLeak.test(idElements.buildBlockTitle.textContent), 'Build header leaked VSM in Product view');
    assert(!vsmLeak.test(idElements.testingBlockTitle.textContent), 'Testing header leaked VSM in Product view');
    const cTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; }).join(' | ');
    assert(!vsmLeak.test(cTexts), 'Canvas text leaked VSM/1-bit jargon in Product view on Ch. ' + ch + ': ' + cTexts);
  }

  // Flip to Cybernetics view without resetting simulation progress
  api.applyChapter(6);
  runSeconds(10);
  const clockBeforeToggle = api.getState().item ? api.getState().item.stageElapsed : 0;
  idElements.cyberneticsViewBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().settings.viewMode, 'cybernetics', 'Expected viewMode === cybernetics');
  assert.strictEqual(global.window.localStorage.getItem('bq_view_mode'), 'cybernetics', 'Expected viewMode persisted in localStorage');
  assert(idElements.chapterHeading.textContent.includes('Credit Assignment'), 'Expected Ch. 6 cybernetics heading');
  assert(idElements.chapterStory.innerHTML.includes('Requisite Variety'), 'Expected Ch. 6 cybernetics story');
  assert(idElements.lessonText.textContent.includes('1-bit'), 'Expected Ch. 6 cybernetics lesson');
  assert.strictEqual(idElements.environmentEyebrow.textContent, 'Environment & Unchecked Noise (Disturbances)');
  assert.strictEqual(idElements.worldBlockTitle.textContent, 'Environment');
  assert.strictEqual(idElements.noiseBlockTitle.textContent, 'Unchecked Transducer & Operational Noise');
  assert.strictEqual(idElements.flowBlockTitle.textContent, 'System 2: Coordination (Flow & WIP)');
  assert.strictEqual(idElements.discoveryBlockTitle.textContent, 'System 4: Intelligence & Horizon (Discovery)');
  assert.strictEqual(idElements.buildBlockTitle.textContent, 'System 1: Operations (Build)');
  assert.strictEqual(idElements.testingBlockTitle.textContent, 'System 3 & 3*: Control & Audit (Testing)');
  assert.strictEqual(idElements.rolloutBlockTitle.textContent, 'Variety Amplification (Rollout)');
  assert.strictEqual(idElements.channelsBlockTitle.textContent, 'Diagnostic & Algedonic (Outer Loop)');
  assert(
    htmlSource.indexOf('id="environmentEyebrow"') < htmlSource.indexOf('id="activeControlsEyebrow"'),
    'Expected Environment section above System 5 Governance / Active Controls'
  );
  assert.strictEqual(idElements.experimentsRow.children[0].textContent, '1-bit metric: blind guessing (default)');
  assert.strictEqual(idElements.loopTimePrefix.textContent, 'Relaxation time:');
  assert.strictEqual(idElements.worldCyclePrefix.textContent, 'Disturbance cycle:');
  assert.strictEqual(idElements.driftLabel.textContent, 'Environmental drift rate');
  assert.strictEqual(idElements.shockLabel.textContent, 'Step-shock probability');
  assert.strictEqual(idElements.tabName1.textContent, 'Relaxation Time');
  assert.strictEqual(idElements.tabName7.textContent, 'Algedonic Channel');
  const cyberControlDump = [
    idElements.driftLabel.textContent,
    idElements.driftHelp.textContent,
    idElements.demandLabel.textContent,
    idElements.demandHelp.textContent,
    idElements.shockLabel.textContent,
    idElements.shockHelp.textContent,
    idElements.wipLabel.textContent,
    idElements.wipHelp.textContent,
    idElements.discoveryLabel.textContent,
    idElements.discoveryHelp.textContent,
    idElements.discoveryNoiseHelp.textContent,
    idElements.build10xMeta.textContent,
    idElements.messagingNoiseHelp.textContent,
    idElements.andonCordTitle.textContent,
    idElements.andonCordMeta.textContent
  ].join(' | ');
  assert(
    !/the breeze|rogue wave|Outside World|written ticket|15 devs|Code Blue/i.test(cyberControlDump),
    'Cybernetics view leaked Product-view metaphor in controls: ' + cyberControlDump
  );
  const cyberCanvasTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  [
    'HIGH VARIETY', 'Environment (Market)',
    'SYSTEM 4', 'Intelligence (Spec)',
    'SYSTEM 1', 'Operations (Build)',
    'SYSTEM 3*', 'Audit (Testing)',
    'AMPLIFY', 'Amplify (Rollout)',
    'VIABILITY', 'Env. Fit (Real Users)'
  ].forEach(function (lbl) {
    assert(cyberCanvasTexts.includes(lbl), 'Expected Cybernetics view canvas label: ' + lbl);
  });
  assert(
    !cyberCanvasTexts.includes('Outside World') && !cyberCanvasTexts.includes('Real Users (Market Fit)'),
    'Cybernetics view canvas leaked Product station titles'
  );
  if (api.getState().item) {
    assert.strictEqual(api.getState().item.stageElapsed, clockBeforeToggle, 'Toggling view mode should not reset simulation');
  }

  // Persistence across chapter change, then clean flip back to Product view
  api.applyChapter(8);
  assert(idElements.activeControlsEyebrow.textContent.includes('System 5 Governance'), 'Expected Cybernetics view to persist on Ch. 8');
  idElements.productViewBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().settings.viewMode, 'product');
  assert(idElements.activeControlsEyebrow.textContent.includes('Process & Governance Levers'), 'Expected Product view eyebrow restored');
  assert.strictEqual(idElements.environmentEyebrow.textContent, 'World & Unchecked Noise (Model Conditions)');
  assert.strictEqual(idElements.noiseBlockTitle.textContent, 'Unchecked Handoff & Defect Noise');
  assert.strictEqual(idElements.driftLabel.textContent, 'Market drift speed (the breeze)');
  assert.strictEqual(idElements.worldBlockTitle.textContent, 'Outside World');
  assert.strictEqual(idElements.tabName1.textContent, 'Adaptation Time');
});

check('R2.1: Collapsible top story card sits above live model, and all world/noise sliders sit in left column separate from Governance levers', function () {
  const storyIdx = htmlSource.indexOf('id="storyCard"');
  const stageIdx = htmlSource.indexOf('class="stage-card"');
  const historyIdx = htmlSource.indexOf('class="history-bar"');
  const expIdx = htmlSource.indexOf('id="experimentsRow"');
  const gridIdx = htmlSource.indexOf('class="book-grid"');
  const envIdx = htmlSource.indexOf('id="environmentEyebrow"');
  const govIdx = htmlSource.indexOf('id="activeControlsEyebrow"');
  const pagerIdx = htmlSource.indexOf('id="nextChapterBtn"');

  assert(storyIdx !== -1 && storyIdx < stageIdx, 'Expected collapsible #storyCard above .stage-card');
  assert(expIdx > historyIdx && expIdx < gridIdx, 'Expected #experimentsRow inside .stage-card below .history-bar');
  assert(envIdx > gridIdx && envIdx < govIdx, 'Expected left conditions column before right governance column');
  assert(pagerIdx > govIdx, 'Expected bottom chapter pager below .book-grid so navigation stays accessible when story is collapsed');

  // Every disturbance & raw noise slider sits in the left column strictly before #activeControlsEyebrow
  ['driftSlider', 'demandSlider', 'shockSlider', 'discoveryNoiseSlider', 'buildNoiseSlider', 'messagingNoiseSlider'].forEach(function (id) {
    const idx = htmlSource.indexOf('id="' + id + '"');
    assert(idx > envIdx && idx < govIdx, 'Expected #' + id + ' inside left World & Unchecked Noise column');
  });

  // Every process & governance lever sits in the right column strictly after #activeControlsEyebrow
  [
    'wipSlider',
    'discoverySlider',
    'discoveryDampenerToggle',
    'buildSlider',
    'build10xToggle',
    'buildDampenerToggle',
    'testingSlider',
    'reachSlider',
    'rolloutDampenerToggle',
    'diagnosticChannelToggle',
    'andonCordToggle'
  ].forEach(function (id) {
    const idx = htmlSource.indexOf('id="' + id + '"');
    assert(idx > govIdx && idx < pagerIdx, 'Expected #' + id + ' inside right Process & Governance Levers column');
  });

  // Collapsible story behaviour + auto-reopen on chapter change
  api.setViewMode('product');
  api.applyChapter(2);
  assert(!idElements.storyBody.classList.contains('is-hidden'), 'Story body should open by default on chapter load');
  assert.strictEqual(idElements.storyToggleBtn.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(idElements.storyToggleBtn.textContent, 'Collapse story \u25b2');

  idElements.storyToggleBtn.dispatchEvent('click');
  assert(idElements.storyBody.classList.contains('is-hidden'), 'Clicking #storyToggleBtn should collapse #storyBody');
  assert(idElements.storyCard.classList.contains('is-collapsed'), 'Clicking #storyToggleBtn should add .is-collapsed');
  assert.strictEqual(idElements.storyToggleBtn.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(idElements.storyToggleBtn.textContent, 'Show story \u25bc');

  api.setViewMode('cybernetics');
  assert.strictEqual(idElements.storyToggleBtn.textContent, 'Show explanation \u25bc');
  api.setViewMode('product');

  // Switching chapter re-opens the new chapter's story automatically
  api.applyChapter(5);
  assert(!idElements.storyBody.classList.contains('is-hidden'), 'Switching chapters should re-open #storyBody automatically');
  assert.strictEqual(idElements.storyToggleBtn.getAttribute('aria-expanded'), 'true');

  // Live safeguard status tags bridge left-column noise sliders to right-column safeguard checkboxes
  assert.strictEqual(idElements.rolloutDampenerStatus.textContent, 'Unchecked: Pure hype');
  idElements.rolloutDampenerToggle.checked = true;
  idElements.rolloutDampenerToggle.dispatchEvent('change');
  assert.strictEqual(idElements.rolloutDampenerStatus.textContent, 'Pure hype \u2192 Checked');

  idElements.reachSlider.value = '0';
  idElements.reachSlider.dispatchEvent('input');
  assert(idElements.rolloutDampenerBox.classList.contains('is-dimmed'), 'Expected #rolloutDampenerBox to dim on Silent reach');
  assert.strictEqual(idElements.rolloutDampenerStatus.textContent, 'Unlabelled (Silent)');
});

check('S0.1 (replaces R2.4): Progressive per-chapter visibility hides unintroduced stations, loops, controls, and Ch. 1 spotlight chrome', function () {
  assert(!htmlSource.includes('assumptionsBlock') && !htmlSource.includes('assumptionsList'), 'Removed Held Assumptions markup still present in index.html');
  assert(!cssSource.includes('.assumptions-list') && !cssSource.includes('.is-locked'), 'Removed .assumptions-list or .is-locked CSS still present in styles.css');
  assert(
    cssSource.includes('.station-control-block:not(.is-hidden) ~ .station-control-block:not(.is-hidden)') &&
      cssSource.includes('.control-group:not(.is-hidden) ~ .control-group:not(.is-hidden)'),
    'Expected sibling margin-top CSS rules so hidden trailing blocks/groups leave zero extra bottom spacing'
  );

  const D = global.window.CyberneticDiagramView;

  // Chapter 1: 4-box balanced layout, 276px trimmed height, no noise mention in left eyebrow, no #impactBar or spotlights
  api.setViewMode('product');
  api.applyChapter(1);
  const ch1Layout = D.getSceneLayout();
  assert.strictEqual(ch1Layout.height, 276, 'Expected Ch. 1 canvas height trimmed to 276px');
  assert.strictEqual(ch1Layout.boxes.testing, null, 'Expected Testing box absent on Ch. 1');
  assert.strictEqual(ch1Layout.boxes.rollout, null, 'Expected Rollout box absent on Ch. 1');
  assert.strictEqual(
    (ch1Layout.boxes.discovery.cx + ch1Layout.boxes.build.cx) / 2,
    570,
    'Expected Discovery & Build symmetrically centred across W=1140 on Ch. 1-2'
  );
  assert.strictEqual(idElements.environmentEyebrow.textContent, 'Outside World (Model Conditions)');
  api.setViewMode('cybernetics');
  assert.strictEqual(idElements.environmentEyebrow.textContent, 'Environment (Disturbances)');
  api.setViewMode('product');

  const ch1Texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    !ch1Texts.some(function (txt) {
      return txt.includes('Testing') || txt.includes('Rollout') || txt.includes('Inner Loop') || txt.includes('Outer Loop');
    }),
    'Expected zero Testing, Rollout, Inner Loop, or Outer Loop labels on Ch. 1 canvas'
  );

  // Chapter 1 suppresses #impactBar and pink spotlight rings on hover, drag, and preset click
  assert(idElements.impactBar.classList.contains('is-hidden'), 'Expected #impactBar hidden on Ch. 1');
  idElements.discoverySliderZone.dispatchEvent('mouseenter');
  assert.strictEqual(api.getState().spotlightZones.length, 0, 'Ch. 1 hover must not activate spotlight zones');
  assert(idElements.impactBar.classList.contains('is-hidden'), 'Ch. 1 hover must keep #impactBar hidden');
  idElements.discoverySlider.value = '0';
  idElements.discoverySlider.dispatchEvent('input');
  assert.strictEqual(api.getState().spotlightZones.length, 0, 'Ch. 1 slider edit must not activate spotlight zones');
  assert.strictEqual(api.getState().lastImpact, null, 'Ch. 1 slider edit must not populate lastImpact');
  idElements.discoverySliderZone.dispatchEvent('mouseleave');
  idElements.experimentsRow.children[1].dispatchEvent('click');
  assert.strictEqual(api.getState().spotlightZones.length, 0, 'Ch. 1 preset click must not activate spotlight zones');
  assert(idElements.impactBar.classList.contains('is-hidden'), 'Ch. 1 preset click must keep #impactBar hidden');

  // Chapter 2 reveals Noise heading, #impactBar, and spotlights while keeping 4-box 276px canvas
  api.applyChapter(2);
  assert.strictEqual(D.getSceneLayout().height, 276, 'Expected Ch. 2 canvas height trimmed to 276px');
  assert.strictEqual(idElements.environmentEyebrow.textContent, 'World & Unchecked Noise (Model Conditions)');
  assert(!idElements.impactBar.classList.contains('is-hidden'), 'Expected #impactBar visible on Ch. 2+');

  // Chapter 3 & 4 use 5-box balanced layout (build centred at x=570) and 314px trimmed height (Inner Loop, no Outer Loop)
  api.applyChapter(3);
  const ch3Layout = D.getSceneLayout();
  assert.strictEqual(ch3Layout.height, 314, 'Expected Ch. 3 canvas height trimmed to 314px');
  assert(ch3Layout.boxes.testing && ch3Layout.boxes.rollout === null, 'Expected Testing present and Rollout absent on Ch. 3');
  assert.strictEqual(ch3Layout.boxes.build.cx, 570, 'Expected Build centred at cx=570 in 5-box Ch. 3-4 layout');
  const ch3Texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    ch3Texts.some(function (txt) { return txt.includes('Inner Loop'); }) &&
      !ch3Texts.some(function (txt) { return txt.includes('Outer Loop') || txt.includes('Rollout'); }),
    'Expected Inner Loop visible and Rollout / Outer Loop absent on Ch. 3'
  );

  // Chapter 5 uses 6-box layout with 314px height (Rollout added, Outer Loop still absent until Ch. 6)
  api.applyChapter(5);
  assert.strictEqual(D.getSceneLayout().height, 314, 'Expected Ch. 5 canvas height trimmed to 314px before Outer Loop unlocks');
  assert(D.getSceneLayout().boxes.rollout !== null, 'Expected Rollout box present on Ch. 5');
  assert(
    !(idElements.simCanvas._canvasTexts || []).some(function (t) { return t.text.includes('Outer Loop'); }),
    'Expected Outer Loop absent on Ch. 5'
  );

  // Chapter 6+ expands to full 386px height for Outer Loop highway
  api.applyChapter(6);
  assert.strictEqual(D.getSceneLayout().height, 386, 'Expected Ch. 6+ canvas height 386px with Outer Loop');
  assert(
    (idElements.simCanvas._canvasTexts || []).some(function (t) { return t.text.includes('Outer Loop'); }),
    'Expected Outer Loop visible on Ch. 6'
  );

  // Disabled/hidden controls still ignore synthetic events on Ch. 1
  api.applyChapter(1);
  idElements.testingSlider.value = '3';
  idElements.testingSlider.dispatchEvent('input');
  idElements.triggerShockBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().settings.testingIdx, 0, 'Hidden testingSlider mutated settings on Ch. 1');
  assert.strictEqual(api.getState().shockCount, 0, 'Hidden triggerShockBtn fired a shock on Ch. 1');

  // Chapter-by-chapter progressive visibility & disabled schedule across all graduating containers and inputs
  const schedule = [
    { containerId: 'noiseConditionsBlock', inputId: 'discoveryNoiseSlider', unlocksAt: 2 },
    { containerId: 'discoveryNoiseGroup', inputId: 'discoveryNoiseSlider', unlocksAt: 2 },
    { containerId: 'buildNoiseGroup', inputId: 'buildNoiseSlider', unlocksAt: 2 },
    { containerId: 'discoveryDampenerBox', inputId: 'discoveryDampenerToggle', unlocksAt: 2 },
    { containerId: 'buildDampenerBox', inputId: 'buildDampenerToggle', unlocksAt: 2 },
    { containerId: 'testingControlBlock', inputId: 'testingSlider', unlocksAt: 3 },
    { containerId: 'demandControlGroup', inputId: 'demandSlider', unlocksAt: 4 },
    { containerId: 'flowControlBlock', inputId: 'wipSlider', unlocksAt: 4 },
    { containerId: 'build10xBox', inputId: 'build10xToggle', unlocksAt: 4 },
    { containerId: 'rolloutControlBlock', inputId: 'reachSlider', unlocksAt: 5 },
    { containerId: 'messagingNoiseGroup', inputId: 'messagingNoiseSlider', unlocksAt: 5 },
    { containerId: 'rolloutControlBlock', inputId: 'rolloutDampenerToggle', unlocksAt: 5 },
    { containerId: 'channelsControlBlock', inputId: 'diagnosticChannelToggle', unlocksAt: 6 },
    { containerId: 'diagnosticChannelBox', inputId: 'diagnosticChannelToggle', unlocksAt: 6 },
    { containerId: 'shockControlGroup', inputId: 'shockSlider', unlocksAt: 7 },
    { containerId: 'andonCordBox', inputId: 'andonCordToggle', unlocksAt: 7 }
  ];
  for (let ch = 1; ch <= 8; ch++) {
    api.applyChapter(ch);
    schedule.forEach(function (item) {
      const shouldBeHidden = ch < item.unlocksAt;
      assert.strictEqual(
        idElements[item.containerId].classList.contains('is-hidden'),
        shouldBeHidden,
        'Expected #' + item.containerId + ' hidden=' + shouldBeHidden + ' on Ch. ' + ch
      );
      assert.strictEqual(
        idElements[item.inputId].disabled,
        shouldBeHidden,
        'Expected #' + item.inputId + '.disabled === ' + shouldBeHidden + ' on Ch. ' + ch
      );
    });
  }
});

check('R2.2: Discovery diminishing-returns curve, Build batch-grain drift, spotlight halos, impact bar, and history "|" divider work together', function () {
  api.setViewMode('product');
  api.applyChapter(1);
  assert.strictEqual(idElements.discoveryLabel.textContent, 'Upfront discovery & spec depth');
  assert.strictEqual(idElements.buildLabel.textContent, 'Build slice size (batch scope)');
  assert(
    api.getChapters()[1].lessonText.includes('thin vertical slices'),
    'Expected Ch. 1 lessonText to clarify thin vertical slices rather than rushing people'
  );

  // 1. Hovering an unlocked control on Ch. 2+ shows hover spotlight zones and #impactBar preview
  api.applyChapter(2);
  idElements.testingControlGroup.dispatchEvent('mouseenter');
  assert.strictEqual(api.getState().spotlightZones.length, 0, 'Hidden/disabled control hover should not light up spotlights');

  idElements.discoverySliderZone.dispatchEvent('mouseenter');
  assert.deepStrictEqual(api.getState().spotlightZones, ['connSense', 'discovery', 'worldRight']);
  assert(idElements.impactBar.classList.contains('is-hover'), 'Expected .is-hover on #impactBar during hover');
  idElements.discoverySliderZone.dispatchEvent('mouseleave');
  assert.strictEqual(api.getState().spotlightZones.length, 0, 'Mouseleave should clear hover spotlights');

  // 2. Discovery diminishing-returns curve on Ch. 2 (when user observation is off)
  idElements.buildNoiseSlider.value = '0';
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.discoveryNoiseSlider.value = '3'; // Heavy (0.82)
  idElements.discoveryNoiseSlider.dispatchEvent('input');

  const noises = [0, 1, 2, 3].map(function (idx) {
    idElements.discoverySlider.value = String(idx);
    idElements.discoverySlider.dispatchEvent('input');
    return api.getState().effective.discoveryNoise;
  });
  // Strictly decreasing with diminishing step sizes: (n0 - n1) > (n1 - n2) > (n2 - n3) > 0
  const d01 = noises[0] - noises[1];
  const d12 = noises[1] - noises[2];
  const d23 = noises[2] - noises[3];
  assert(d01 > d12 && d12 > d23 && d23 > 0, 'Expected strictly diminishing returns on Discovery noise: ' + noises.join(' -> '));
  assert(
    idElements.discoveryNoiseRegime.textContent.includes('study'),
    'Expected #discoveryNoiseRegime to echo upfront study trim when Watch real users is unchecked'
  );
  assert(
    idElements.impactBar.classList.contains('is-active') &&
      idElements.impactPills.innerHTML.includes('Diminishing returns') &&
      idElements.impactPills.innerHTML.includes('Spec misread'),
    'Expected #impactBar to display Spec misread delta and Diminishing returns pill at Paralysis'
  );
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['connSense', 'discovery', 'worldRight'],
    'Expected Ch. 2 Discovery change to spotlight connSense, discovery, and worldRight'
  );
  const spotlightArcs = (idElements.simCanvas._canvasArcs || []).filter(function (a) { return a.r >= 28; });
  assert.strictEqual(spotlightArcs.length, 6, 'Expected 2 concentric spotlight rings per circular zone (3 zones * 2 = 6 arcs)');

  // Calm-market "Sufficient" beats "Thin slice" when user observation is unchecked, while Thin slice + Watch real users beats Paralysis
  idElements.discoverySlider.value = '0';
  idElements.discoverySlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  const thinUnobservedFit = avgFit(runSeconds(65).history);

  idElements.discoverySlider.value = '1'; // Sufficient
  idElements.discoverySlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  const sufficientUnobservedFit = avgFit(runSeconds(75).history);
  assert(
    sufficientUnobservedFit > thinUnobservedFit + 5,
    'Expected Sufficient upfront study to visibly improve Calm-market fit over Thin slice when unobserved (' +
      thinUnobservedFit.toFixed(1) + '% -> ' + sufficientUnobservedFit.toFixed(1) + '%)'
  );

  // Ch. 2 Preset 3 ("Huge upfront spec" trap) keeps discoveryNoiseIdx honestly at 2 (Moderate)
  assert.strictEqual(
    api.getChapters()[2].presets[3].values.discoveryNoiseIdx,
    2,
    'Expected Ch. 2 Huge upfront spec preset to keep baseline discoveryNoiseIdx at 2 (Moderate)'
  );

  // 2. Oversized Build batches increase Build drift, weaken pairing with amber visual cues, and mark "|" on #historyStrip
  api.applyPreset(2, 1); // Observed + paired (Small slice, Heavy buildNoiseIdx=3)
  runSeconds(25);
  assert(api.getState().history.length >= 4, 'Expected pre-change launches in #historyStrip');
  const smallPairedNoise = api.getState().effective.buildNoise;

  idElements.buildSlider.value = '3'; // Mega-batch
  idElements.buildSlider.dispatchEvent('input');
  const megaPairedNoise = api.getState().effective.buildNoise;
  assert(
    megaPairedNoise > smallPairedNoise * 2.5,
    'Expected Mega-batch to substantially weaken pairing and raise Build drift (' + smallPairedNoise.toFixed(3) + ' -> ' + megaPairedNoise.toFixed(3) + ')'
  );
  assert(idElements.buildDampenerBox.classList.contains('active-warn'), 'Expected .active-warn on #buildDampenerBox under Mega-batch');
  assert.strictEqual(idElements.buildDampenerStatus.textContent, 'Weakened by batch size!');
  assert(idElements.buildNoiseRegime.textContent.includes('Partial (big batch)'), 'Expected #buildNoiseRegime to reflect partial pairing on oversized batch');
  assert(
    idElements.impactPills.innerHTML.includes('Weakens pairing!') &&
      idElements.impactPills.innerHTML.includes('Build drift'),
    'Expected #impactBar pills to flag Build drift and Weakens pairing!'
  );
  const buildCanvasTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(buildCanvasTexts.includes('Big batch!'), 'Expected canvas connector to display "Big batch!" warning');

  // Pending "|" marker appears immediately on last pre-change chip, then converts to .after-change on next launch
  assert(idElements.historyStrip.innerHTML.includes('pending-change'), 'Expected .pending-change "|" marker on #historyStrip immediately after change');
  runSeconds(12);
  assert(idElements.historyStrip.innerHTML.includes('after-change'), 'Expected .after-change "|" divider on first post-change launch chip');
  assert.strictEqual(api.getState().spotlightZones.length, 0, 'Expected active spotlight halos to fade cleanly after 9.5s');

  // Flipping to Cybernetics view translates #impactBar and oversized-batch connector cleanly
  idElements.buildSlider.value = '2'; // Large batch (down from Mega-batch -> Batch still coarse for sync)
  idElements.buildSlider.dispatchEvent('input');
  api.setViewMode('cybernetics');
  assert(idElements.impactHeader.textContent.includes('System 1 batch grain'), 'Expected Cybernetics view header in #impactBar');
  assert(idElements.impactPills.innerHTML.includes('Batch still coarse for sync'), 'Expected Cybernetics view pill in #impactBar on downward step');
  idElements.resetBtn.dispatchEvent('click');
  idElements.buildSlider.value = '3'; // Up to Mega-batch -> Weakens sync control!
  idElements.buildSlider.dispatchEvent('input');
  assert(idElements.impactPills.innerHTML.includes('Weakens sync control!'), 'Expected Cybernetics view Weakens sync control! pill on upward step');
  const cyberBuildTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(cyberBuildTexts.includes('Coarse!'), 'Expected Cybernetics view connector warning "Coarse!"');
  // Verify "Big batch!" and "Coarse!" both respect Discovery->Build gap across Ch. 2 and Ch. 5+ layouts
  [2, 5].forEach(function (chCheck) {
    api.applyChapter(chCheck);
    idElements.buildNoiseSlider.value = '2';
    idElements.buildNoiseSlider.dispatchEvent('input');
    idElements.buildDampenerToggle.checked = true;
    idElements.buildDampenerToggle.dispatchEvent('change');
    idElements.buildSlider.value = '2';
    idElements.buildSlider.dispatchEvent('input');
    const boxes = global.window.CyberneticDiagramView.getSceneLayout().boxes;
    const gapLeft = boxes.discovery.x + boxes.discovery.w;
    const gapRight = boxes.build.x;
    ['product', 'cybernetics'].forEach(function (mode) {
      api.setViewMode(mode);
      api.step(0);
      const connLbl = (idElements.simCanvas._canvasTexts || []).find(function (t) {
        return Math.abs(t.y - 128) < 2 && t.x > gapLeft && t.x < gapRight;
      });
      assert(connLbl, 'Expected Discovery->Build connector label in ' + mode + ' on Ch. ' + chCheck);
      const estW = connLbl.text.length * 5.2;
      assert(connLbl.x - estW / 2 >= gapLeft + 1 && connLbl.x + estW / 2 <= gapRight - 1, 'Connector label "' + connLbl.text + '" clipped walls in ' + mode);
    });
  });
  api.setViewMode('product');
});

check('C1.1a: Multi-notch slider gestures keep starting baseline, preserve rework warnings, and revert cleanly on return to start', function () {
  api.setViewMode('product');
  api.applyChapter(2);
  idElements.discoveryNoiseSlider.value = '0';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.buildNoiseSlider.value = '0';
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.discoverySlider.value = '3';
  idElements.discoverySlider.dispatchEvent('input');
  idElements.buildSlider.value = '1';
  idElements.buildSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  runSeconds(12);
  assert(api.getState().history.length >= 1, 'Expected at least 1 launch before drag');

  // 1. Held pointer drag out (3 -> 2 -> 1) and straight back to start (1 -> 2 -> 3) leaves no fake 0.0s pill or stray "|"
  idElements.discoverySlider.dispatchEvent('mousedown');
  ['2', '1', '2', '3'].forEach(function (v) {
    idElements.discoverySlider.value = v;
    idElements.discoverySlider.dispatchEvent('input');
  });
  global.window.dispatchEvent('mouseup');
  assert(!idElements.impactBar.classList.contains('is-active'), 'Returning slider to starting notch should restore idle impact bar');
  assert.strictEqual(idElements.impactPills.innerHTML, '', 'Returning slider to starting notch should clear transient delta pills');
  assert(!api.getState().pendingPolicyBreak, 'Returning slider to starting notch should clear pending "|" break');

  // 2. Full multi-notch drag 3 (Paralysis, 19.7d) -> 2 -> 1 -> 0 (Thin slice, 7.7d) reports full -12.0d delta
  idElements.discoverySlider.dispatchEvent('mousedown');
  ['2', '1', '0'].forEach(function (v) {
    idElements.discoverySlider.value = v;
    idElements.discoverySlider.dispatchEvent('input');
  });
  idElements.discoverySlider.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('Discovery -12.0d') &&
      idElements.impactPills.innerHTML.includes('Loop 19.7d \u2192 7.7d'),
    'Expected 3 -> 0 drag to report full -12.0d / 19.7d -> 7.7d delta, got: ' + idElements.impactPills.innerHTML
  );

  // Subsequent separate pointer drag (0 -> 1) starts fresh from 0 rather than coalescing with completed drag
  idElements.discoverySlider.dispatchEvent('mousedown');
  idElements.discoverySlider.value = '1';
  idElements.discoverySlider.dispatchEvent('input');
  global.window.dispatchEvent('mouseup');
  assert(
    idElements.impactPills.innerHTML.includes('Discovery +2.0d') &&
      idElements.impactPills.innerHTML.includes('Loop 7.7d \u2192 9.7d'),
    'Expected fresh pointer drag 0 -> 1 to start from 0, got: ' + idElements.impactPills.innerHTML
  );

  // 3. Multi-notch Build slice drag (0 -> 1 -> 2 -> 3) on Ch. 3 Preset 4 keeps "Triggers Testing rework!" at notch 3
  api.applyPreset(3, 3); // Prevent at source: Strict testing, Heavy build noise, Pair or mob ON, Small slice
  ['1', '2', '3'].forEach(function (v) {
    idElements.buildSlider.value = v;
    idElements.buildSlider.dispatchEvent('input');
  });
  assert(
    idElements.impactPills.innerHTML.includes('Build 1.6d \u2192 12.4d') &&
      idElements.impactPills.innerHTML.includes('Build drift 13% \u2192 54%') &&
      idElements.impactPills.innerHTML.includes('Weakens pairing!') &&
      idElements.impactPills.innerHTML.includes('Triggers Testing rework!'),
    'Expected 0 -> 3 Build slice drag to keep full range and rework warning, got: ' + idElements.impactPills.innerHTML
  );

  // 4. Multi-notch Build noise drag (0 -> 1 -> 2 -> 3) under Standard testing keeps 0% -> 82% and "Triggers Testing rework"
  api.applyChapter(3);
  idElements.testingSlider.value = '2';
  idElements.testingSlider.dispatchEvent('input');
  idElements.buildNoiseSlider.value = '0';
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  ['1', '2', '3'].forEach(function (v) {
    idElements.buildNoiseSlider.value = v;
    idElements.buildNoiseSlider.dispatchEvent('input');
  });
  assert(
    idElements.impactPills.innerHTML.includes('Build distortion 0% \u2192 82%') &&
      idElements.impactPills.innerHTML.includes('Triggers Testing rework'),
    'Expected 0 -> 3 Build noise drag to keep 0% -> 82% and rework warning, got: ' + idElements.impactPills.innerHTML
  );
});

check('C1.1b: Both Trigger Shock Wave buttons match on hover and click without parent hover masking or "triggered updated:" wording', function () {
  api.setViewMode('product');
  api.applyChapter(7);
  runSeconds(8);

  // 1. Nested hover: entering #shockControlGroup then #triggerShockBtn previews Trigger Shock Wave:
  idElements.shockControlGroup.dispatchEvent('mouseenter');
  assert.strictEqual(idElements.impactHeader.textContent, 'Shock probability:');
  idElements.triggerShockBtn.dispatchEvent('mouseenter');
  assert(idElements.impactBar.classList.contains('is-hover'), 'Expected hover state on #triggerShockBtn');
  assert.strictEqual(idElements.impactHeader.textContent, 'Trigger Shock Wave:');

  // 2. Clicking #triggerShockBtn while pointer remains inside #triggerShockBtn + #shockControlGroup immediately shows shock impact
  idElements.triggerShockBtn.dispatchEvent('click');
  assert(idElements.impactBar.classList.contains('is-active'), 'Expected active impact bar immediately on clicking #triggerShockBtn');
  assert.strictEqual(idElements.impactHeader.textContent, 'Rogue-wave shock fired:');
  assert(!idElements.impactHeader.textContent.includes('updated'), 'Action button header must not append "updated:"');
  assert(
    idElements.impactPills.innerHTML.includes('Need \u2192') &&
      idElements.impactPills.innerHTML.includes('pre-shock bets in flight'),
    'Expected shock result pills while pointer remains over #triggerShockBtn, got: ' + idElements.impactPills.innerHTML
  );

  // 3. Sliding pointer off #triggerShockBtn onto surrounding #shockControlGroup resumes Shock probability hover
  idElements.triggerShockBtn.dispatchEvent('mouseleave');
  assert(idElements.impactBar.classList.contains('is-hover'), 'Expected #shockControlGroup hover to resume when leaving button');
  assert.strictEqual(idElements.impactHeader.textContent, 'Shock probability:');

  // Leaving #shockControlGroup restores the committed shock result
  idElements.shockControlGroup.dispatchEvent('mouseleave');
  assert(idElements.impactBar.classList.contains('is-active'));
  assert.strictEqual(idElements.impactHeader.textContent, 'Rogue-wave shock fired:');

  // 4. Cybernetics view equivalents on #topShockBtn hover & click
  api.setViewMode('cybernetics');
  assert.strictEqual(idElements.impactHeader.textContent, 'Step-function shock fired:');
  idElements.experimentsRow.children[1].dispatchEvent('click'); // Steady flow + algedonic interrupt armed
  runSeconds(8);
  idElements.topShockBtn.dispatchEvent('mouseenter');
  assert.strictEqual(idElements.impactHeader.textContent, 'Trigger Step Shock:');
  idElements.topShockBtn.dispatchEvent('click');
  assert.strictEqual(idElements.impactHeader.textContent, 'Step-function shock fired:');
  assert(idElements.impactPills.innerHTML.includes('Purged '), 'Expected Purged N bets pill with Andon armed in Cybernetics view');
  idElements.topShockBtn.dispatchEvent('mouseleave');
  api.setViewMode('product');
});

check('C1.1c: Re-hovering an adjusted control previews hover description consistently, and Reset clears stale impact pills', function () {
  api.setViewMode('product');
  api.applyChapter(2);
  idElements.discoverySlider.value = '3';
  idElements.discoverySlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  // 1. Hover -> adjust keeps live result pills while parked (even past 4.6s)
  idElements.discoverySliderZone.dispatchEvent('mouseenter');
  assert(idElements.impactBar.classList.contains('is-hover'));
  idElements.discoverySlider.value = '0';
  idElements.discoverySlider.dispatchEvent('input');
  assert(idElements.impactBar.classList.contains('is-active'));
  assert(idElements.impactPills.innerHTML.includes('Discovery -12.0d'));

  runSeconds(6.0);
  assert(idElements.impactBar.classList.contains('is-active'), 'Expected result pills to stay visible while cursor stays parked');

  // 2. Leaving and later pointing back at the same control shows normal hover preview, then restores summary on leave
  idElements.discoverySliderZone.dispatchEvent('mouseleave');
  assert(idElements.impactBar.classList.contains('is-active'), 'Expected last change summary to remain visible at rest');

  idElements.discoverySliderZone.dispatchEvent('mouseenter');
  assert(idElements.impactBar.classList.contains('is-hover'), 'Expected re-hovering adjusted control to show hover preview');
  assert.strictEqual(idElements.impactHeader.textContent, 'Upfront discovery & spec depth:');
  assert.strictEqual(idElements.impactPills.innerHTML, '');

  idElements.discoverySliderZone.dispatchEvent('mouseleave');
  assert(idElements.impactBar.classList.contains('is-active'), 'Expected leaving without editing to restore last change summary');
  assert(idElements.impactPills.innerHTML.includes('Discovery -12.0d'));

  // 3. Clicking Reset clears stale impact pills and spotlight rings back to calm idle prompt
  api.applyChapter(7);
  runSeconds(6.0);
  idElements.topShockBtn.dispatchEvent('click');
  assert(idElements.impactBar.classList.contains('is-active'));
  assert(api.getState().spotlightZones.length > 0);

  idElements.resetBtn.dispatchEvent('click');
  assert(!idElements.impactBar.classList.contains('is-active') && !idElements.impactBar.classList.contains('is-hover'), 'Reset should clear active/hover impact bar classes');
  assert(idElements.impactHeader.classList.contains('is-hidden'), 'Reset should hide impact header');
  assert.strictEqual(idElements.impactPills.innerHTML, '', 'Reset should clear stale impact pills');
  assert.strictEqual(api.getState().spotlightZones.length, 0, 'Reset should clear active spotlight halos');
  assert(idElements.impactSummary.textContent.includes('Hover or adjust any unlocked control below'), 'Reset should restore calm starting prompt');

  // 4. Quick experiment preset buttons still show preset spotlight rings and summary after resetting internally
  idElements.experimentsRow.children[1].dispatchEvent('click');
  assert(idElements.impactBar.classList.contains('is-active'), 'Preset click should still activate impact bar');
  assert(idElements.impactHeader.textContent.includes('Experiment loaded:'), 'Preset click should show preset header');
  assert(api.getState().spotlightZones.length > 0, 'Preset click should still light spotlight zones');
});

check('C1.2a: Smooth Outer Loop Spec-rework ramp, accurate Loop pill tone, 0%-gain Diminishing returns pill, and paired Large-batch Strict rework flag', function () {
  api.setViewMode('product');

  // 1. Ch. 6 Moderate Discovery noise (0.52), Watch real users OFF, clean Rollout: no fake -5.2s cliff on Thin -> Sufficient
  api.applyChapter(6);
  idElements.messagingNoiseSlider.value = '0';
  idElements.messagingNoiseSlider.dispatchEvent('input');
  idElements.discoveryNoiseSlider.value = '2'; // Moderate (0.52)
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  const thinLoop = parseFloat(idElements.loopTimeValue.textContent);
  assert(idElements.loopTimeValue.textContent.includes('(incl. rework)'), 'Expected Moderate Thin-slice to include partial rework');

  idElements.discoverySlider.value = '1'; // Sufficient
  idElements.discoverySlider.dispatchEvent('input');
  const suffLoop = parseFloat(idElements.loopTimeValue.textContent);
  assert(idElements.loopTimeValue.textContent.includes('(incl. rework)'), 'Expected Moderate Sufficient to retain partial rework rather than dropping to 0%');
  assert(
    Math.abs(thinLoop - suffLoop) < 3.2,
    'Expected smooth Thin -> Sufficient loop transition without -10d cliff (' + thinLoop + 'd -> ' + suffLoop + 'd)'
  );
  // Loop pill tone matches actual loop direction (green when loop decreased under Calm 48d market, never amber for a shorter loop)
  if (suffLoop < thinLoop - 0.1) {
    assert(
      idElements.impactPills.innerHTML.includes('impact-pill good">Loop '),
      'Expected Loop pill to be coloured good when expected loop time decreased, got: ' + idElements.impactPills.innerHTML
    );
  }

  // Advancing further to Exhaustive and Paralysis climbs monotonically as diminishing returns kick in
  idElements.resetBtn.dispatchEvent('click');
  idElements.discoverySlider.value = '2'; // Exhaustive
  idElements.discoverySlider.dispatchEvent('input');
  const exhLoop = parseFloat(idElements.loopTimeValue.textContent);
  idElements.resetBtn.dispatchEvent('click');
  idElements.discoverySlider.value = '3'; // Paralysis
  idElements.discoverySlider.dispatchEvent('input');
  const parLoop = parseFloat(idElements.loopTimeValue.textContent);
  assert(exhLoop > suffLoop + 1.6 && parLoop > exhLoop + 4.0, 'Expected Exhaustive and Paralysis to climb monotonically (' + suffLoop + 'd -> ' + exhLoop + 'd -> ' + parLoop + 'd)');

  // 2. When Watch real users is ON under Moderate noise, Exhaustive -> Paralysis (6% -> 6%) still shows Spec misread and Diminishing returns
  api.applyChapter(2);
  idElements.discoveryNoiseSlider.value = '2';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.discoveryDampenerToggle.checked = true;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  idElements.discoverySlider.value = '2'; // Exhaustive (6%)
  idElements.discoverySlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  idElements.discoverySlider.value = '3'; // Paralysis (6%)
  idElements.discoverySlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('Spec misread 6% \u2192 6%') &&
      idElements.impactPills.innerHTML.includes('Diminishing returns'),
    'Expected 0%-gain step (6% -> 6%) at Paralysis to show flat Spec misread and Diminishing returns, got: ' + idElements.impactPills.innerHTML
  );

  // 3. Strict testing + Moderate Build noise + Pair or mob ON + Large batch (~22% drift) flags rework in clock bar and impact bar
  api.applyChapter(3);
  idElements.discoveryNoiseSlider.value = '0';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.testingSlider.value = '3'; // Strict
  idElements.testingSlider.dispatchEvent('input');
  idElements.buildNoiseSlider.value = '2'; // Moderate
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.buildDampenerToggle.checked = true;
  idElements.buildDampenerToggle.dispatchEvent('change');
  idElements.buildSlider.value = '0'; // Small slice
  idElements.buildSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  assert(!idElements.loopTimeValue.textContent.includes('(incl. rework)'), 'Small slice paired should not flag rework');

  idElements.buildSlider.value = '2'; // Large batch
  idElements.buildSlider.dispatchEvent('input');
  assert(idElements.loopTimeValue.textContent.includes('(incl. rework)'), 'Expected paired Large batch under Strict testing to flag (incl. rework)');
  assert(
    idElements.impactPills.innerHTML.includes('Triggers Testing rework!'),
    'Expected paired Large batch under Strict testing to show Triggers Testing rework!, got: ' + idElements.impactPills.innerHTML
  );
});

check('C1.2b: Silent (25%) Rollout mutes dimmed Messaging noise & Guided onboarding in timer, diagram, and impact bar, and aligns ~88% copy', function () {
  assert(htmlSource.includes('~88% less label noise'), 'Expected index.html Guided onboarding copy to state ~88%');
  assert(!htmlSource.includes('~85%'), 'Expected stale ~85% removed from index.html');
  assert(!jsSource.includes('~85%'), 'Expected stale ~85% removed from app.js');

  api.setViewMode('product');
  api.applyChapter(5); // Opens on Pure hype (messagingNoiseIdx = 3), Full reach (3)
  assert(idElements.rolloutDampenerMeta.textContent.includes('~88%'), 'Expected Product view rolloutDampenerMeta to state ~88%');
  api.setViewMode('cybernetics');
  assert(idElements.rolloutDampenerMeta.textContent.includes('~88%'), 'Expected Cybernetics view rolloutDampenerMeta to state ~88%');
  api.setViewMode('product');

  // Switch Rollout reach to Silent (25%) while Pure hype is still set
  idElements.reachSlider.value = '0';
  idElements.reachSlider.dispatchEvent('input');
  assert.strictEqual(api.getState().effective.messagingNoise, 0, 'Effective messaging noise must be 0 while Silent (25%)');

  // Diagram Rollout -> Real Users arrow shows Silent! (no Scale, Noise!, or Checked (+1d)) while Silent
  const silentTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    silentTexts.includes('Silent!') && !silentTexts.includes('Scale') && !silentTexts.includes('Noise!') && !silentTexts.includes('Checked \u2713'),
    'Expected Rollout -> Users connector to show Silent! instead of Scale/Noise! while Silent: ' + silentTexts.join(' | ')
  );

  // Adjusting dimmed Messaging noise while Silent shows Muted while Silent (25%) instead of Label noise 0% -> 90%
  idElements.messagingNoiseSlider.value = '2';
  idElements.messagingNoiseSlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('Muted while Silent (25%)') &&
      !idElements.impactPills.innerHTML.includes('Label noise'),
    'Expected Muted while Silent (25%) pill on dimmed Messaging noise edit, got: ' + idElements.impactPills.innerHTML
  );

  // Ticking dimmed Guided onboarding while Silent adds 0s to loop/Rollout time and shows Muted while Silent (25%)
  const loopBeforeOnboarding = parseFloat(idElements.loopTimeValue.textContent);
  idElements.rolloutDampenerToggle.checked = true;
  idElements.rolloutDampenerToggle.dispatchEvent('change');
  const loopWithSilentOnboarding = parseFloat(idElements.loopTimeValue.textContent);
  assert.strictEqual(loopWithSilentOnboarding, loopBeforeOnboarding, 'Guided onboarding must not add +0.5s while Rollout is Silent');
  assert(
    idElements.impactPills.innerHTML.includes('Muted while Silent (25%)'),
    'Expected Muted while Silent (25%) pill on dimmed Guided onboarding toggle'
  );
  const silentCheckedTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    !silentCheckedTexts.includes('Checked (+1d)') && !silentCheckedTexts.includes('Checked \u2713'),
    'Expected idle Rollout box and connector not to claim Checked (+1d) while Silent'
  );

  // Raising Rollout reach above Silent wakes up stored Guided onboarding (+1d) alongside graduated reach time (+0.8d = +1.8d total)
  idElements.reachSlider.value = '3';
  idElements.reachSlider.dispatchEvent('input');
  const loopAfterWaking = parseFloat(idElements.loopTimeValue.textContent);
  assert(
    Math.abs((loopAfterWaking - loopBeforeOnboarding) - 1.8) < 0.25,
    'Expected stored Guided onboarding (+1d) plus Silent->Full reach step (+0.8d) to add ~1.8d (' + loopBeforeOnboarding + 'd -> ' + loopAfterWaking + 'd)'
  );
});

check('C1.3a: Loop delta pills, rework transition pills, and Outer Loop / Light-testing spotlights match actual rework paths', function () {
  api.setViewMode('product');

  // 1. Build slice size includes Loop X.Xd -> Y.Yd from Chapter 2 onwards (when #impactBar unlocks)
  api.applyChapter(2);
  idElements.driftSlider.value = '1'; // Moderate (21.0d)
  idElements.driftSlider.dispatchEvent('input');
  idElements.discoveryNoiseSlider.value = '0';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.buildNoiseSlider.value = '0';
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.discoverySlider.value = '0'; // Thin (1.6d)
  idElements.discoverySlider.dispatchEvent('input');
  idElements.buildSlider.value = '0'; // Small (1.6d)
  idElements.buildSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  idElements.buildSlider.value = '2'; // Large batch (7.6d)
  idElements.buildSlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('Build 1.6d \u2192 7.6d') &&
      idElements.impactPills.innerHTML.includes('impact-pill warn">Loop 5.7d \u2192 11.7d'),
    'Expected Ch. 2+ Build slice size to show Loop delta pill, got: ' + idElements.impactPills.innerHTML
  );

  // 2. Ch. 3 Build noise lowering shows Loop drop + Clears Testing rework (and Sys 3* in Cybernetics view)
  api.applyPreset(3, 1); // Clean Spec + buggy Build (Heavy build noise, Strict testing)
  idElements.buildNoiseSlider.value = '0';
  idElements.buildNoiseSlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('impact-pill good">Loop ') &&
      idElements.impactPills.innerHTML.includes('Clears Testing rework'),
    'Expected lowering Build noise under Strict testing to show green Loop drop + Clears Testing rework, got: ' +
      idElements.impactPills.innerHTML
  );
  api.setViewMode('cybernetics');
  assert(
    idElements.impactPills.innerHTML.includes('Clears Sys 3* rework'),
    'Expected Cybernetics view to translate Clears Sys 3* rework'
  );
  api.setViewMode('product');

  // 3. Ch. 6 Rollout & Discovery safeguards show green Loop shrinkage + Clears Outer Loop rework + outerLoop spotlight
  api.applyChapter(6); // Summary metric: blind guessing (Confusing messaging, Loop ~25.6d)
  idElements.rolloutDampenerToggle.checked = true;
  idElements.rolloutDampenerToggle.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('Rollout +1d') &&
      idElements.impactPills.innerHTML.includes('impact-pill good">Loop ') &&
      idElements.impactPills.innerHTML.includes('Clears Outer Loop rework'),
    'Expected Ch. 6 Guided onboarding to show green Loop reduction + Clears Outer Loop rework, got: ' +
      idElements.impactPills.innerHTML
  );
  assert(
    api.getState().spotlightZones.includes('outerLoop'),
    'Expected Guided onboarding clearing Outer Loop rework to spotlight outerLoop'
  );

  // Dropping Rollout reach to Silent triggers Outer Loop rework; muted controls while Silent do not spotlight outerLoop
  idElements.reachSlider.value = '0';
  idElements.reachSlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('Loop ') &&
      idElements.impactPills.innerHTML.includes('Triggers Outer Loop rework!') &&
      api.getState().spotlightZones.includes('outerLoop'),
    'Expected Silent Rollout in Ch. 6 to show Loop jump, Triggers Outer Loop rework!, and outerLoop spotlight'
  );
  idElements.messagingNoiseGroup.dispatchEvent('mouseenter');
  assert(
    !api.getState().spotlightZones.includes('outerLoop'),
    'Muted Messaging noise while Silent must not spotlight outerLoop'
  );
  idElements.messagingNoiseGroup.dispatchEvent('mouseleave');

  // Ch. 6 Preset 3 ("Marketing push" on a wrong Spec): Watch real users clears Outer Loop rework with green Loop drop
  api.applyPreset(6, 2);
  idElements.discoveryDampenerToggle.checked = true;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('Discovery +1.8d') &&
      idElements.impactPills.innerHTML.includes('impact-pill good">Loop ') &&
      idElements.impactPills.innerHTML.includes('Clears Outer Loop rework') &&
      api.getState().spotlightZones.includes('outerLoop'),
    'Expected Watch real users on wrong Spec to show green Loop drop, Clears Outer Loop rework, and outerLoop spotlight'
  );

  // 4. Light testing (Ch. 8 default) spotlights worldRight + outerLoop instead of innerLoop for Build noise & Pair/mob
  api.applyChapter(8); // Viable System: Testing = Light (1), Moderate build noise (2), Pair or mob ON
  idElements.buildNoiseGroup.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['connBuild', 'build', 'testing', 'worldRight', 'outerLoop'],
    'Expected Light testing Build noise hover to spotlight worldRight + outerLoop without innerLoop'
  );
  idElements.buildNoiseGroup.dispatchEvent('mouseleave');

  idElements.buildDampenerBox.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['connBuild', 'build', 'testing', 'worldRight', 'outerLoop'],
    'Expected Light testing Pair/mob hover to spotlight worldRight + outerLoop without innerLoop'
  );

  // Unchecking Pair or mob while parked under Light testing triggers Outer Loop rework (not Testing rework) and keeps outerLoop lit
  idElements.buildDampenerToggle.checked = false;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('Loop ') &&
      idElements.impactPills.innerHTML.includes('Triggers Outer Loop rework!') &&
      !idElements.impactPills.innerHTML.includes('Triggers Testing rework'),
    'Expected unchecking Pair/mob under Light testing to report Outer Loop rework, got: ' + idElements.impactPills.innerHTML
  );
  assert(
    api.getState().spotlightZones.includes('outerLoop') &&
      api.getState().spotlightZones.includes('worldRight') &&
      !api.getState().spotlightZones.includes('innerLoop'),
    'Expected parked spotlight after unchecking Pair/mob under Light testing to light worldRight + outerLoop without innerLoop'
  );
  idElements.buildDampenerBox.dispatchEvent('mouseleave');
  assert(
    api.getState().spotlightZones.includes('outerLoop') &&
      !api.getState().spotlightZones.includes('innerLoop'),
    'Expected post-leave spotlight under Light testing to match committed zones'
  );

  // Raising Testing to Standard (2) switches Build spotlights back to innerLoop
  idElements.testingSlider.value = '2';
  idElements.testingSlider.dispatchEvent('input');
  idElements.buildNoiseGroup.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['connBuild', 'build', 'testing', 'innerLoop'],
    'Expected Standard testing Build noise hover to spotlight innerLoop'
  );
  idElements.buildNoiseGroup.dispatchEvent('mouseleave');
});

check('S0.2a: Tactical pause freezes motion on control touch/change and keeps spotlight halos steady across pause, hover, and 2x speed', function () {
  function tickWallSeconds(sec) {
    const dt = 0.05;
    const n = Math.round(sec / dt);
    for (let i = 0; i < n; i++) {
      api.tickFrame(dt);
    }
  }

  api.setViewMode('product');
  api.applyChapter(2);
  tickWallSeconds(2.0);
  const frozenClock = api.getState().clockSec;
  assert(frozenClock >= 1.95 && frozenClock <= 2.05, 'Expected ~2.0s baseline clock before touch');

  // 1. Touching a slider freezes the world immediately and holds indefinitely while pointer is down; unchanged release resumes immediately
  idElements.discoverySlider.dispatchEvent('mousedown');
  assert.strictEqual(api.getState().tacticallyPaused, true, 'Slider mousedown should trigger tactical pause');
  assert(idElements.playPauseBtn.classList.contains('is-tactical-pause'), 'Expected .is-tactical-pause on #playPauseBtn');
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Resume (3s)');
  assert.strictEqual(idElements.playPauseBtn.style.getPropertyValue('--tactical-progress'), '1.000');

  tickWallSeconds(5.0);
  assert.strictEqual(api.getState().clockSec, frozenClock, 'Simulation clock must stay frozen while slider pointer is held');
  assert.strictEqual(api.getState().tacticallyPaused, true, 'Tactical pause must hold past 3s while dragging');
  assert.strictEqual(idElements.playPauseBtn.style.getPropertyValue('--tactical-progress'), '1.000');

  global.window.dispatchEvent('mouseup');
  assert.strictEqual(api.getState().tacticallyPaused, false, 'Releasing slider without changing value should cancel tactical pause');
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Pause');

  // 2. Changing a slider holds during drag, counts down 3s -> 2s -> 1s on release, and resumes flow automatically
  idElements.discoverySlider.dispatchEvent('mousedown');
  idElements.discoverySlider.value = '2';
  idElements.discoverySlider.dispatchEvent('input');
  global.window.dispatchEvent('mouseup');

  assert.strictEqual(api.getState().tacticallyPaused, true, 'Changing slider notch should keep tactical pause active after mouseup');
  assert.strictEqual(api.getState().spotlightAlpha, 1.0, 'Spotlight must stay at full 1.0 alpha during tactical pause');

  tickWallSeconds(1.2);
  assert.strictEqual(api.getState().clockSec, frozenClock, 'Clock must stay frozen during tactical pause countdown');
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Resume (2s)');
  const midProgress = Number(idElements.playPauseBtn.style.getPropertyValue('--tactical-progress'));
  assert(midProgress > 0.55 && midProgress < 0.65, 'Expected --tactical-progress ~0.6 after 1.2s, got ' + midProgress);

  tickWallSeconds(1.2);
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Resume (1s)');
  assert.strictEqual(api.getState().clockSec, frozenClock);
  assert.strictEqual(api.getState().spotlightAlpha, 1.0, 'Spotlight must not decay while tactically paused');

  tickWallSeconds(0.8);
  assert.strictEqual(api.getState().tacticallyPaused, false, 'Tactical pause should auto-resume after 3.0s');
  assert(!idElements.playPauseBtn.classList.contains('is-tactical-pause'));
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Pause');
  assert(api.getState().clockSec > frozenClock, 'Simulation clock should advance once tactical pause finishes');

  // 3. Safeguard toggle triggers tactical pause; clicking Resume skips wait early; manual Pause is never overridden
  idElements.discoveryDampenerToggle.checked = true;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  assert.strictEqual(api.getState().tacticallyPaused, true, 'Safeguard checkbox should trigger tactical pause');
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Resume (3s)');

  idElements.playPauseBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().running, true, 'Clicking Resume during tactical pause must keep running=true');
  assert.strictEqual(api.getState().tacticallyPaused, false, 'Clicking Resume must clear tactical pause immediately');
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Pause');

  idElements.playPauseBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().running, false, 'Clicking Pause while running enters manual pause');
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Play');

  const manualPausedClock = api.getState().clockSec;
  idElements.buildDampenerToggle.checked = true;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert.strictEqual(api.getState().tacticallyPaused, false, 'Manual pause must not be overwritten by tactical pause');
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Play');

  tickWallSeconds(12.0);
  assert.strictEqual(api.getState().clockSec, manualPausedClock, 'Manual pause must keep clock frozen');
  assert.strictEqual(api.getState().spotlightAlpha, 1.0, 'Manual pause must hold spotlight rings steady indefinitely');

  idElements.playPauseBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().running, true);
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Pause');

  // 4. Steady (non-pulsing) real wall-clock dwell at 2x speed + #impactBar hover hold & re-illumination
  speedBtns[2].dispatchEvent('click'); // 2x simulation speed
  idElements.buildSlider.value = '2';
  idElements.buildSlider.dispatchEvent('input');
  idElements.playPauseBtn.dispatchEvent('click'); // skip 3s tactical pause immediately

  const startClock2x = api.getState().clockSec;
  tickWallSeconds(7.5);
  assert(
    api.getState().clockSec - startClock2x >= 14.5,
    'Expected ~15.0s simulation clock advance over 7.5s wall time at 2x speed'
  );
  assert(api.getState().spotlightZones.length > 0, 'Spotlight must remain active at 7.5s real wall time even at 2x speed');
  assert.strictEqual(api.getState().spotlightAlpha, 1.0, 'Spotlight must sit at steady 1.0 without pulsing before 8.0s');

  tickWallSeconds(1.0); // 8.5s total -> inside 8.0s..9.5s fade window
  const fadingAlpha = api.getState().spotlightAlpha;
  assert(fadingAlpha > 0.2 && fadingAlpha < 0.8, 'Expected smooth mid-fade alpha at 8.5s, got ' + fadingAlpha);

  // Hovering #impactBar restores full 1.0 alpha and freezes fade timer
  idElements.impactBar.dispatchEvent('mouseenter');
  assert.strictEqual(api.getState().spotlightAlpha, 1.0, 'Hovering #impactBar should hold spotlight at full 1.0');
  tickWallSeconds(4.0);
  assert.strictEqual(api.getState().spotlightAlpha, 1.0, 'Spotlight must not expire while hovering #impactBar');

  idElements.impactBar.dispatchEvent('mouseleave');
  tickWallSeconds(1.5);
  assert.strictEqual(api.getState().spotlightZones.length, 0, 'Spotlight should finish fading after leaving #impactBar');
  assert.strictEqual(api.getState().spotlightAlpha, 0);

  // Re-hovering #impactBar after fade re-lights the last adjustment's diagram zones
  idElements.impactBar.dispatchEvent('mouseenter');
  assert(api.getState().spotlightZones.includes('build'), 'Hovering #impactBar after fade should re-light last adjustment zones');
  assert.strictEqual(api.getState().spotlightAlpha, 1.0);
  idElements.impactBar.dispatchEvent('mouseleave');
  assert.strictEqual(api.getState().spotlightZones.length, 0);

  speedBtns[1].dispatchEvent('click'); // restore 1x speed
});

check('S0.2c & R6.1: 4-detent rotary radio knobs, physical safeguard switches, sub-column layout, and Hide hints toggle work together', function () {
  api.setViewMode('product');
  api.applyChapter(8);

  const knobPairs = [
    ['driftKnob', 'driftSlider'],
    ['demandKnob', 'demandSlider'],
    ['shockKnob', 'shockSlider'],
    ['discoveryNoiseKnob', 'discoveryNoiseSlider'],
    ['buildNoiseKnob', 'buildNoiseSlider'],
    ['messagingNoiseKnob', 'messagingNoiseSlider'],
    ['wipKnob', 'wipSlider'],
    ['discoveryKnob', 'discoverySlider'],
    ['buildKnob', 'buildSlider'],
    ['testingKnob', 'testingSlider'],
    ['reachKnob', 'reachSlider']
  ];

  // 1. All 11 knobs mount 4 radial detents, fluted rotor, and cap hit zone paired with hidden synced knob-input
  knobPairs.forEach(function (pair) {
    const knobEl = idElements[pair[0]];
    const sliderEl = idElements[pair[1]];
    assert(knobEl && knobEl.classList.contains('rotary-knob'), 'Expected .rotary-knob for #' + pair[0]);
    assert(sliderEl && sliderEl.classList.contains('knob-input'), 'Expected .knob-input for #' + pair[1]);
    assert.strictEqual(knobEl.children.length, 1, 'Expected 1 SVG root inside #' + pair[0]);
    assert.strictEqual(knobEl._detentHits.length, 4, 'Expected 4 radial detent hit targets on #' + pair[0]);
    assert.strictEqual(knobEl._detentGroups.length, 4, 'Expected 4 radial detent visual groups on #' + pair[0]);
    assert(knobEl._capHit && knobEl._rotor, 'Expected cap hit zone and rotor group on #' + pair[0]);
    assert(sliderEl.getAttribute('aria-valuetext'), 'Expected aria-valuetext synced on #' + pair[1]);
  });

  // 2. All 6 boolean safeguards use role="switch" physical toggle switches
  const switchIds = [
    'discoveryDampenerToggle',
    'build10xToggle',
    'buildDampenerToggle',
    'rolloutDampenerToggle',
    'diagnosticChannelToggle',
    'andonCordToggle'
  ];
  const toggleSwitchSpans = htmlSource.match(/class="toggle-switch"/g) || [];
  assert.strictEqual(toggleSwitchSpans.length, 6, 'Expected 6 physical .toggle-switch tracks in index.html');
  switchIds.forEach(function (id) {
    assert(idElements[id].classList.contains('switch-input'), 'Expected .switch-input on #' + id);
  });

  // 3. Direct radial-detent clicks snap straight to that notch (-105, -35, 35, 105 deg) and trigger Tactical Pause
  const discKnob = idElements.discoveryKnob;
  idElements.playPauseBtn.dispatchEvent('click'); // clear any prior tactical pause if active
  if (!api.getState().running) idElements.playPauseBtn.dispatchEvent('click');

  discKnob._detentHits[3].dispatchEvent('mousedown', { button: 0 });
  global.window.dispatchEvent('mouseup');
  assert.strictEqual(api.getState().settings.discoveryIdx, 3, 'Clicking detent 3 should snap discoveryIdx to 3');
  assert.strictEqual(discKnob.getAttribute('data-angle'), '105');
  assert(discKnob._detentGroups[3].classList.contains('is-active') && !discKnob._detentGroups[0].classList.contains('is-active'));
  assert.strictEqual(idElements.discoverySlider.getAttribute('aria-valuetext'), 'Paralysis');
  assert.strictEqual(api.getState().tacticallyPaused, true, 'Detent snap should trigger Tactical Pause');

  idElements.playPauseBtn.dispatchEvent('click'); // resume immediately
  assert.strictEqual(api.getState().tacticallyPaused, false);

  // Clicking the already-active detent (3) and releasing leaves Tactical Pause off
  discKnob._detentHits[3].dispatchEvent('mousedown', { button: 0 });
  global.window.dispatchEvent('mouseup');
  assert.strictEqual(api.getState().settings.discoveryIdx, 3);
  assert.strictEqual(api.getState().tacticallyPaused, false, 'Clicking unchanged detent should not leave Tactical Pause active');

  // 4. Single-clicking the centre cap steps +1 notch and wraps 3 -> 0 -> 1 -> 2 -> 3
  const expectedCycle = [0, 1, 2, 3];
  expectedCycle.forEach(function (expectedIdx, stepIdx) {
    discKnob._capHit.dispatchEvent('mousedown', { clientX: 50, clientY: 50, button: 0 });
    global.window.dispatchEvent('mouseup');
    assert.strictEqual(
      api.getState().settings.discoveryIdx,
      expectedIdx,
      'Cap click #' + (stepIdx + 1) + ' should step/wrap to ' + expectedIdx
    );
    idElements.playPauseBtn.dispatchEvent('click'); // skip tactical pause between clicks
  });
  assert.strictEqual(discKnob.getAttribute('data-angle'), '105');

  // 5. Linear drag (down/left to 0, up/right to 2, and drag-out-and-back revert without firing +1 cap click)
  discKnob._capHit.dispatchEvent('mousedown', { clientX: 100, clientY: 100, button: 0 });
  global.window.dispatchEvent('mousemove', { clientX: 100, clientY: 160 }); // dy = +60 -> linearDelta = -60 -> 0
  assert.strictEqual(api.getState().settings.discoveryIdx, 0, 'Dragging straight down should step knob down to 0');
  assert.strictEqual(discKnob.getAttribute('data-angle'), '-105');
  global.window.dispatchEvent('mouseup');
  idElements.playPauseBtn.dispatchEvent('click'); // skip tactical pause
  idElements.resetBtn.dispatchEvent('click');

  // Drag right (+40px -> notch 2) then back to start (0px -> notch 0) before release reverts cleanly
  discKnob._capHit.dispatchEvent('mousedown', { clientX: 100, clientY: 100, button: 0 });
  global.window.dispatchEvent('mousemove', { clientX: 140, clientY: 100 }); // +40px -> notch 2
  assert.strictEqual(api.getState().settings.discoveryIdx, 2, 'Dragging right should step knob up to 2');
  global.window.dispatchEvent('mousemove', { clientX: 100, clientY: 100 }); // back to start -> notch 0
  global.window.dispatchEvent('mouseup');
  assert.strictEqual(api.getState().settings.discoveryIdx, 0, 'Returning drag to origin must not trigger +1 cap step');
  assert.strictEqual(api.getState().tacticallyPaused, false, 'Returning drag to origin should cancel Tactical Pause');
  assert(!idElements.impactBar.classList.contains('is-active'), 'Returning drag to origin should leave impact bar idle');

  // touchcancel aborts touch without stepping +1
  discKnob._capHit.dispatchEvent('touchstart', { touches: [{ clientX: 80, clientY: 80 }] });
  global.window.dispatchEvent('touchcancel');
  assert.strictEqual(api.getState().settings.discoveryIdx, 0, 'touchcancel must not step knob +1');

  // 6. Disabled knobs in earlier chapters ignore cap clicks and detent clicks
  api.applyChapter(1);
  assert(idElements.governanceColumns.classList.contains('is-early-chapters'), 'Expected .is-early-chapters on Ch. 1');
  assert(idElements.testingKnob.classList.contains('is-disabled'), 'Expected #testingKnob disabled on Ch. 1');
  idElements.testingKnob._capHit.dispatchEvent('mousedown', { clientX: 20, clientY: 20, button: 0 });
  global.window.dispatchEvent('mouseup');
  idElements.testingKnob._detentHits[3].dispatchEvent('mousedown', { button: 0 });
  global.window.dispatchEvent('mouseup');
  assert.strictEqual(api.getState().settings.testingIdx, 0, 'Disabled rotary knob must ignore cap and detent clicks');

  api.applyChapter(2);
  assert(idElements.governanceColumns.classList.contains('is-early-chapters'), 'Expected .is-early-chapters on Ch. 2');
  api.applyChapter(3);
  assert(!idElements.governanceColumns.classList.contains('is-early-chapters'), 'Expected two sub-columns active on Ch. 3+');

  // 7. Helper sentences visible by default + Hide hints / Show hints toggle persists across chapters
  assert(!idElements.bookGrid.classList.contains('is-hints-hidden'), 'Hints should be visible by default');
  assert.strictEqual(idElements.hintsToggleBtn.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(idElements.hintsToggleBtn.textContent, 'Hide hints \u25b2');

  idElements.hintsToggleBtn.dispatchEvent('click');
  assert(idElements.bookGrid.classList.contains('is-hints-hidden'), 'Clicking #hintsToggleBtn should hide hints');
  assert.strictEqual(idElements.hintsToggleBtn.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(idElements.hintsToggleBtn.textContent, 'Show hints \u25bc');
  assert.strictEqual(global.window.localStorage.getItem('bq_hints_collapsed'), '1');

  api.applyChapter(8);
  assert(idElements.bookGrid.classList.contains('is-hints-hidden'), 'Hints preference should persist across chapter switches');

  idElements.hintsToggleBtn.dispatchEvent('click');
  assert(!idElements.bookGrid.classList.contains('is-hints-hidden'), 'Clicking #hintsToggleBtn again should show hints');
  assert.strictEqual(idElements.hintsToggleBtn.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(idElements.hintsToggleBtn.textContent, 'Hide hints \u25b2');
  assert.strictEqual(global.window.localStorage.getItem('bq_hints_collapsed'), '0');

  // 8. Regime and switch status readouts occupy dedicated single-line rows so turning knobs never shifts block height
  assert(
    /\.control-header\s*\{[^}]*flex-direction:\s*column/.test(cssSource) &&
      /\.dampener-title-row\s*\{[^}]*flex-direction:\s*column/.test(cssSource) &&
      /\.control-regime\s*\{[^}]*white-space:\s*nowrap/.test(cssSource) &&
      /\.dampener-status\s*\{[^}]*white-space:\s*nowrap/.test(cssSource),
    'Expected dedicated single-line stacked rows for .control-regime and .dampener-status to prevent vertical layout shift'
  );
});

check('S0.2b: Semantic spotlight zone tones, Gain vs Cost balance strip, live diagram numbers, and empty-station shape previews work together', function () {
  const D = global.window.CyberneticDiagramView;
  api.setViewMode('product');

  // 1. Watch real users ON under Moderate noise: green on connSense + worldRight, amber on discovery, Gain vs Cost ledger
  api.applyChapter(2); // Moderate Discovery noise (52%), Moderate Build noise (52%), Thin slice (0.8s)
  idElements.discoveryDampenerToggle.checked = true;
  idElements.discoveryDampenerToggle.dispatchEvent('change');

  const obsTones = api.getState().spotlightZoneTones;
  assert.strictEqual(obsTones.connSense, 'good', 'Expected green spotlight on connSense when noise drops');
  assert.strictEqual(obsTones.discovery, 'warn', 'Expected amber spotlight on discovery when +0.9s delay is added');
  assert.strictEqual(obsTones.worldRight, 'good', 'Expected green spotlight on worldRight when net fit improves');
  assert(
    idElements.impactBar.classList.contains('is-tradeoff') &&
      idElements.impactBar.classList.contains('tone-good') &&
      idElements.impactPills.innerHTML.includes('class="tradeoff-group tradeoff-gain"') &&
      idElements.impactPills.innerHTML.includes('class="tradeoff-group tradeoff-cost"'),
    'Expected #impactBar to render Gain vs Cost trade-off groups with tone-good'
  );

  // Quiet live station durations & connector noise % on diagram
  const ch2Texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(ch2Texts.includes('3.4d') && ch2Texts.includes('1.6d'), 'Expected live station durations 3.4d and 1.6d on Ch. 2 canvas');
  assert(ch2Texts.includes('9%') && ch2Texts.includes('82%'), 'Expected live effective noise percentages 9% and 82% below connectors');

  // 2. Enabling Watch real users when baseline Discovery noise is None (0%) surfaces None (0% baseline noise) on Gain side
  idElements.discoveryDampenerToggle.checked = false;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  idElements.discoveryNoiseSlider.value = '0';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  idElements.discoveryDampenerToggle.checked = true;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('None (0% baseline noise)') &&
      idElements.impactBar.classList.contains('tone-warn'),
    'Expected wasted safeguard on 0% noise to display None (0% baseline noise) under Gain'
  );

  // 3. Mega-batch under Pairing + Strict Testing colours degraded zones red and marks Gain as None
  api.applyPreset(3, 3); // Prevent at source: Small slice (0.8s), Heavy build noise, Pair or mob ON, Strict testing
  idElements.buildSlider.value = '3'; // Mega-batch (6.2s)
  idElements.buildSlider.dispatchEvent('input');

  const megaTones = api.getState().spotlightZoneTones;
  assert.strictEqual(megaTones.connBuild, 'bad', 'Expected red spotlight on connBuild when pairing weakens');
  assert.strictEqual(megaTones.build, 'bad', 'Expected red spotlight on oversized Mega-batch Build');
  assert.strictEqual(megaTones.innerLoop, 'bad', 'Expected red spotlight on Inner Loop when rework triggers');
  assert(
    idElements.impactBar.classList.contains('tone-bad') &&
      idElements.impactPills.innerHTML.includes('tradeoff-empty">None<'),
    'Expected Mega-batch degradation to show tone-bad and Gain: None'
  );

  // 4. Empty-station instant shape preview renders inside empty Build bay during active spotlight / hover
  assert.strictEqual(api.getState().item && api.getState().item.stage === 'build', false, 'Build should be empty right after reset + edit');
  idElements.simCanvas._trackPathBBoxes = true;
  let previewShapesOn = 0;
  let previewShapesOff = 0;
  try {
    api.step(0);
    previewShapesOn = (idElements.simCanvas._pathBBoxes || []).filter(function (bb) {
      const cx = (bb.minX + bb.maxX) / 2;
      return cx > 500 && cx < 640; // Ch. 3 Build centred at cx = 570
    }).length;

    D.setEmptyStationPreviewEnabled(false);
    api.step(0);
    previewShapesOff = (idElements.simCanvas._pathBBoxes || []).filter(function (bb) {
      const cx = (bb.minX + bb.maxX) / 2;
      return cx > 500 && cx < 640;
    }).length;
  } finally {
    D.setEmptyStationPreviewEnabled(true);
    idElements.simCanvas._trackPathBBoxes = false;
  }
  assert(
    previewShapesOn >= 2 && previewShapesOff === 0,
    'Expected empty Build station to draw Spec + Built preview shapes when Option 3 preview is enabled (on=' +
      previewShapesOn + ', off=' + previewShapesOff + ')'
  );

  // 5. Hovering a different unedited control shows calm preview zone tones and clears .is-tradeoff
  idElements.testingControlGroup.dispatchEvent('mouseenter');
  const hoverTones = api.getState().spotlightZoneTones;
  assert.strictEqual(hoverTones.testing, 'preview', 'Expected hover preview tone on unedited control');
  assert(!idElements.impactBar.classList.contains('is-tradeoff'), 'Hover preview should clear .is-tradeoff');
  idElements.testingControlGroup.dispatchEvent('mouseleave');

  // 6. Single-line fixed-height impact bar & borderless Gain/Cost text prevent vertical console jumping and box clutter
  assert.strictEqual(idElements.impactSummary.textContent, '', 'Committed Gain/Cost line should omit duplicate summary sentence');
  assert(
    /\.impact-bar\s*\{[^}]*height:\s*36px;[^}]*min-height:\s*36px;[^}]*max-height:\s*36px;/.test(cssSource) &&
      /\.impact-content\s*\{[^}]*flex-wrap:\s*nowrap;/.test(cssSource) &&
      /\.impact-pill\s*\{[^}]*border:\s*none;[^}]*background:\s*transparent;/.test(cssSource) &&
      /\.visual-legend\s*\{[^}]*border-top:\s*none;/.test(cssSource),
    'Expected fixed 36px single-line .impact-bar, borderless .impact-pill, and borderless .visual-legend'
  );
});

check('C1.3b: Switch-off, post-shock recovery, and Stormy thrashing Gain/Cost readouts match actual system effects', function () {
  const M = global.window.CyberneticModel;
  api.setViewMode('product');

  // 1. Pair or mob during Build: ON shows 0d added lead time; OFF shows Gain: None + red tone-bad + switch-off summary; ON at 0% noise warns None (0% baseline noise)
  api.applyChapter(3); // Moderate Build noise (52%), Strict testing, Pair or mob OFF
  const ch3SoloSnap = M.captureMetricsSnapshot();
  idElements.buildDampenerToggle.checked = true;
  idElements.buildDampenerToggle.dispatchEvent('change');
  const ch3PairedSnap = M.captureMetricsSnapshot();
  assert(
    idElements.impactPills.innerHTML.includes('Build drift ') &&
      idElements.impactPills.innerHTML.includes('0d added lead time') &&
      idElements.impactBar.classList.contains('tone-good'),
    'Expected enabling Pair or mob on noisy Build to show 0d added lead time and tone-good, got: ' + idElements.impactPills.innerHTML
  );

  idElements.buildDampenerToggle.checked = false;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert(
    !idElements.impactPills.innerHTML.includes('0d added lead time') &&
      idElements.impactPills.innerHTML.includes('tradeoff-gain"><span class="tradeoff-kicker">Gain:</span><span class="tradeoff-empty">None</span>') &&
      idElements.impactPills.innerHTML.includes('Triggers Testing rework') &&
      idElements.impactBar.classList.contains('tone-bad'),
    'Expected unchecking Pair or mob on noisy Build to show Gain: None and tone-bad without 0d added lead time, got: ' +
      idElements.impactPills.innerHTML
  );
  const pairOffProd = M.explainControlImpact('buildDampener', ch3PairedSnap, ch3SoloSnap, false);
  const pairOffCyber = M.explainControlImpact('buildDampener', ch3PairedSnap, ch3SoloSnap, true);
  assert(
    pairOffProd.summary.includes('Solo async handoffs') &&
      pairOffCyber.summary.includes('Removing synchronous redundancy'),
    'Expected buildDampener switch-off summaries to describe solo/unpaired behaviour'
  );

  idElements.buildNoiseSlider.value = '0';
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  idElements.buildDampenerToggle.checked = true;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('None (0% baseline noise)') &&
      !idElements.impactPills.innerHTML.includes('0d added lead time') &&
      idElements.impactBar.classList.contains('tone-warn'),
    'Expected enabling Pair or mob on 0% Build noise to show None (0% baseline noise) and tone-warn, got: ' +
      idElements.impactPills.innerHTML
  );

  // 2. Diagnostic channel: pace-aware Loop pill tones (warn/bad on loop jumps, good on loop drops) and switch-off summaries
  api.applyPreset(6, 1); // Watch real users: isolates Rollout (Diagnostic ON, Calm 24s market, Loop ~6.9s)
  const diagOnSnap = M.captureMetricsSnapshot();
  idElements.diagnosticChannelToggle.checked = false;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  const diagOffSnap = M.captureMetricsSnapshot();
  assert(
    idElements.impactPills.innerHTML.includes('Blind &quot;?&quot; guessing') &&
      idElements.impactPills.innerHTML.includes('impact-pill warn">Loop ') &&
      idElements.impactBar.classList.contains('tone-bad'),
    'Expected unchecking Diagnostic channel under Calm market to colour loop jump warn and bar tone-bad, got: ' +
      idElements.impactPills.innerHTML
  );
  const diagOffProd = M.explainControlImpact('diagnostic', diagOnSnap, diagOffSnap, false);
  const diagOffCyber = M.explainControlImpact('diagnostic', diagOnSnap, diagOffSnap, true);
  assert(
    diagOffProd.summary.includes('guessing blind') &&
      diagOffCyber.summary.includes('guessing blind'),
    'Expected diagnostic switch-off summaries to describe blind guessing'
  );

  // Under Moderate market (10.5s), unchecking Diagnostic channel pushes loop (~12.8s) past 90% of market -> red Loop pill
  api.applyPreset(6, 1);
  idElements.driftSlider.value = '1'; // Moderate (10.5s)
  idElements.driftSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  idElements.diagnosticChannelToggle.checked = false;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('impact-pill bad">Loop '),
    'Expected unchecking Diagnostic channel into >90% market lag to colour Loop pill bad, got: ' +
      idElements.impactPills.innerHTML
  );

  // During clean 1-pass flow (Ch. 7 default), unchecking trims 0.35s (green Loop + amber trade-off bar), re-checking adds +0.35s (amber Loop)
  api.applyChapter(7);
  idElements.diagnosticChannelToggle.checked = false;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('impact-pill good">Loop ') &&
      idElements.impactBar.classList.contains('tone-warn'),
    'Expected unchecking Diagnostic channel on clean flow to show green Loop trim with amber trade-off bar'
  );
  idElements.diagnosticChannelToggle.checked = true;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('impact-pill warn">Loop '),
    'Expected re-checking Diagnostic channel on clean flow to show amber +0.35s Loop increase'
  );

  // 3. 10x Build throughput & Guided onboarding switch-off readouts and summaries
  api.applyChapter(4); // Opens on 10x Build ON, Strict Testing (2.8d)
  const b10OnSnap = M.captureMetricsSnapshot();
  idElements.build10xToggle.checked = false;
  idElements.build10xToggle.dispatchEvent('change');
  const b10OffSnap = M.captureMetricsSnapshot();
  assert(
    idElements.impactPills.innerHTML.includes('Eases 1x Testing (2.8d) bottleneck') &&
      idElements.impactPills.innerHTML.includes('impact-pill warn">Build ') &&
      idElements.impactPills.innerHTML.includes('Loop '),
    'Expected unchecking 10x Build under Strict Testing to show Eases 1x Testing bottleneck, warn Build slowdown, and Loop delta, got: ' +
      idElements.impactPills.innerHTML
  );
  api.setViewMode('cybernetics');
  assert(
    idElements.impactPills.innerHTML.includes('Eases 1x Sys 3* (2.8d) bottleneck'),
    'Expected Cybernetics view to show Eases 1x Sys 3* bottleneck'
  );
  api.setViewMode('product');
  const b10OffProd = M.explainControlImpact('build10x', b10OnSnap, b10OffSnap, false);
  const b10OffCyber = M.explainControlImpact('build10x', b10OnSnap, b10OffSnap, true);
  assert(
    b10OffProd.summary.includes('Returning Build to 1x pace') &&
      b10OffCyber.summary.includes('Returning System 1 to 1x pace'),
    'Expected build10x switch-off summaries to describe returning to 1x pace'
  );

  api.applyPreset(5, 2); // Accurate messaging + guided onboarding (rolloutDampener ON, reach = Full)
  const roOnSnap = M.captureMetricsSnapshot();
  idElements.rolloutDampenerToggle.checked = false;
  idElements.rolloutDampenerToggle.dispatchEvent('change');
  const roOffSnap = M.captureMetricsSnapshot();
  const roOffProd = M.explainControlImpact('rolloutDampener', roOnSnap, roOffSnap, false);
  const roOffCyber = M.explainControlImpact('rolloutDampener', roOnSnap, roOffSnap, true);
  assert(
    roOffProd.summary.includes('Skipping the messaging and docs check') &&
      roOffCyber.summary.includes('Skipping output-boundary verification'),
    'Expected rolloutDampener switch-off summaries to describe skipping the check'
  );

  // 4. Pulling Andon cord during a post-shock queue jam includes the green Loop recovery pill alongside Flushed N bets
  api.applyChapter(7); // Healthy flow, Andon OFF
  runSeconds(35);
  idElements.topShockBtn.dispatchEvent('click');
  runSeconds(45);
  assert(parseFloat(idElements.loopTimeValue.textContent) > 22, 'Expected post-shock jam to inflate loop time >22d');
  idElements.andonCordToggle.checked = true;
  idElements.andonCordToggle.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('Andon armed') &&
      idElements.impactPills.innerHTML.includes('Flushed ') &&
      idElements.impactPills.innerHTML.includes('impact-pill good">Loop '),
    'Expected pulling Andon cord on post-shock jam to show green Loop recovery pill alongside Flushed N bets, got: ' +
      idElements.impactPills.innerHTML
  );
  const andonOnSnap = M.captureMetricsSnapshot();
  idElements.andonCordToggle.checked = false;
  idElements.andonCordToggle.dispatchEvent('change');
  const andonOffSnap = M.captureMetricsSnapshot();
  const andonOffProd = M.explainControlImpact('andon', andonOnSnap, andonOffSnap, false);
  const andonOffCyber = M.explainControlImpact('andon', andonOnSnap, andonOffSnap, true);
  assert(
    andonOffProd.summary.includes('jam rework queues') &&
      andonOffCyber.summary.includes('flood Outer Loop rework'),
    'Expected andon switch-off summaries to describe unpre-empted shock rework jams'
  );

  // 5. Stormy shocks outpacing the loop surface red Andon thrashing / Loop slower than shocks warnings in #impactBar & andonWire spotlight
  api.applyChapter(7); // Loop ~5.6s, Andon OFF, Shocks Off
  idElements.shockSlider.value = '3'; // Stormy (~5.4s)
  idElements.shockSlider.dispatchEvent('input');
  assert(
    idElements.stabilityBadge.textContent === 'Slower than shocks (stale!)' &&
      idElements.impactPills.innerHTML.includes('impact-pill bad">Loop slower than shocks!') &&
      idElements.impactBar.classList.contains('tone-bad'),
    'Expected Stormy shocks with Andon OFF to show red Loop slower than shocks! warning, got: ' +
      idElements.impactPills.innerHTML
  );

  // Arming Andon cord under Stormy shocks triggers thrashing: amber trade-off bar + red Andon thrashing Cost + red andonWire ring
  const preArmSnap = M.captureMetricsSnapshot();
  idElements.andonCordToggle.checked = true;
  idElements.andonCordToggle.dispatchEvent('change');
  const postArmSnap = M.captureMetricsSnapshot();
  assert(
    idElements.stabilityBadge.textContent === 'Slower than shocks (thrashing!)' &&
      idElements.impactPills.innerHTML.includes('Andon armed') &&
      idElements.impactPills.innerHTML.includes('impact-pill bad">Andon thrashing (loop &gt; shocks)!') &&
      idElements.impactBar.classList.contains('tone-warn') &&
      api.getState().spotlightZoneTones.andonWire === 'bad',
    'Expected arming Andon under Stormy shocks to surface red Andon thrashing Cost, tone-warn bar, and bad andonWire ring, got: ' +
      idElements.impactPills.innerHTML
  );
  api.setViewMode('cybernetics');
  assert(
    idElements.impactPills.innerHTML.includes('Algedonic thrashing (lag &gt; shocks)!'),
    'Expected Cybernetics view to show Algedonic thrashing (lag > shocks)!'
  );
  api.setViewMode('product');
  const thrashProd = M.explainControlImpact('andon', preArmSnap, postArmSnap, false);
  assert(
    thrashProd.summary.includes('aborts every bet'),
    'Expected thrashing summary on andon when shocks outpace loop'
  );

  // Raising Shock probability to Stormy when Andon is already ON shows red tone-bad + Andon thrashing + bad andonWire ring
  idElements.shockSlider.value = '1'; // Occasional (22s)
  idElements.shockSlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('impact-pill good">Shocks: Occasional') &&
      idElements.impactBar.classList.contains('tone-good'),
    'Expected lowering Shock probability out of thrashing to show green Shocks: Occasional'
  );
  idElements.resetBtn.dispatchEvent('click');
  idElements.shockSlider.value = '3'; // Stormy (5.4s)
  idElements.shockSlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('impact-pill bad">Andon thrashing (loop &gt; shocks)!') &&
      idElements.impactBar.classList.contains('tone-bad') &&
      api.getState().spotlightZoneTones.andonWire === 'bad',
    'Expected raising Shock probability to Stormy with Andon ON to show red Andon thrashing, tone-bad bar, and bad andonWire ring'
  );
});

check('C1.3c: Spotlight zones skip clean 0% handoff arrows on depth/slice knobs, include visible queue trays, and keep Ch. 2 copy Testing-free', function () {
  api.setViewMode('product');

  // 1. Upfront discovery & Build slice size omit connSense / connBuild when baseline channel noise is None (0%)
  api.applyChapter(5); // Opens with discoveryNoiseIdx = 0, buildNoiseIdx = 0
  idElements.discoverySliderZone.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['discovery', 'worldRight'],
    'Expected Discovery depth hover at 0% Discovery noise to omit connSense'
  );
  idElements.discoverySlider.value = '2';
  idElements.discoverySlider.dispatchEvent('input');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['discovery', 'worldRight'],
    'Expected Discovery depth edit at 0% Discovery noise to omit connSense'
  );
  idElements.discoverySliderZone.dispatchEvent('mouseleave');

  idElements.buildSliderZone.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['build', 'worldRight'],
    'Expected Build slice hover at 0% Build noise to omit connBuild'
  );
  idElements.buildSlider.value = '2';
  idElements.buildSlider.dispatchEvent('input');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['build', 'worldRight'],
    'Expected Build slice edit at 0% Build noise to omit connBuild'
  );
  idElements.buildSliderZone.dispatchEvent('mouseleave');

  // In Ch. 6 Preset 2 (Watch real users: isolates Rollout, 0% Discovery/Build noise, Light/Off testing), Build slice hover omits connBuild & outerLoop
  api.applyPreset(6, 1);
  idElements.buildSliderZone.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['build', 'worldRight'],
    'Expected Ch. 6 isolated-Rollout Build slice hover at 0% Build noise to omit connBuild and outerLoop'
  );
  idElements.buildSliderZone.dispatchEvent('mouseleave');

  // 2. Visible queue trays (queueRollout in Ch. 5+ and queueTesting when Testing > Off) and wipGate highlight consistently
  api.applyChapter(4); // Ch. 4: Rollout hidden, Testing = Strict (3)
  idElements.flowControlGroup.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['wipGate', 'discovery', 'queueDiscovery', 'queueBuild', 'queueTesting'],
    'Expected Ch. 4 WIP hover to include wipGate and omit queueRollout before Ch. 5'
  );
  idElements.flowControlGroup.dispatchEvent('mouseleave');
  idElements.demandControlGroup.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['worldLeft', 'wipGate', 'discovery', 'queueDiscovery', 'queueBuild', 'queueTesting'],
    'Expected Ch. 4 demand hover to include worldLeft + wipGate + active queues and omit queueRollout'
  );
  idElements.demandControlGroup.dispatchEvent('mouseleave');

  api.applyChapter(5); // Ch. 5: Rollout visible, Testing = Standard (2)
  idElements.flowControlGroup.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['wipGate', 'discovery', 'queueDiscovery', 'queueBuild', 'queueTesting', 'queueRollout'],
    'Expected Ch. 5+ WIP hover to include wipGate and queueRollout'
  );
  idElements.flowControlGroup.dispatchEvent('mouseleave');
  idElements.demandControlGroup.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['worldLeft', 'wipGate', 'discovery', 'queueDiscovery', 'queueBuild', 'queueTesting', 'queueRollout'],
    'Expected Ch. 5+ demand hover to include worldLeft, wipGate, and queueRollout'
  );
  idElements.demandControlGroup.dispatchEvent('mouseleave');

  // In Ch. 5+ with Testing Off, 10x Build highlights build, queueBuild, queueRollout (bad when ON, good when OFF), and rollout
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  idElements.build10xToggle.checked = true;
  idElements.build10xToggle.dispatchEvent('change');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['build', 'queueBuild', 'queueRollout', 'rollout'],
    'Expected Ch. 5+ 10x Build with Testing Off to highlight queueRollout and rollout'
  );
  assert.strictEqual(api.getState().spotlightZoneTones.queueRollout, 'bad', 'Expected red queueRollout tone when 10x Build feeds Rollout');
  idElements.build10xToggle.checked = false;
  idElements.build10xToggle.dispatchEvent('change');
  assert.strictEqual(api.getState().spotlightZoneTones.queueRollout, 'good', 'Expected green queueRollout tone when 10x Build turns off');

  // In Ch. 7, Andon cord highlights all active queue trays (queueDiscovery, queueBuild, queueTesting, queueRollout) and omits queueTesting if Testing = Off
  api.applyChapter(7); // Testing = Strict (3)
  idElements.andonCordBox.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['andonWire', 'queueDiscovery', 'queueBuild', 'queueTesting', 'queueRollout', 'discovery'],
    'Expected Ch. 7 Andon hover with Testing active to include queueTesting and queueRollout'
  );
  idElements.andonCordBox.dispatchEvent('mouseleave');
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  idElements.andonCordBox.dispatchEvent('mouseenter');
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['andonWire', 'queueDiscovery', 'queueBuild', 'queueRollout', 'discovery'],
    'Expected Ch. 7 Andon hover with Testing Off to include queueRollout and omit queueTesting'
  );
  idElements.andonCordBox.dispatchEvent('mouseleave');

  // 3. Chapter 2 control explanations stay free of Testing / System 3* / Inner Loop before Chapter 3 unlocks them
  const M = global.window.CyberneticModel;
  api.applyChapter(2);
  const ch2Start = M.captureMetricsSnapshot();
  idElements.discoveryNoiseSlider.value = '3';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.buildNoiseSlider.value = '3';
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.buildDampenerToggle.checked = true;
  idElements.buildDampenerToggle.dispatchEvent('change');
  const ch2End = M.captureMetricsSnapshot();

  ['discoveryNoise', 'buildNoise', 'buildDampener'].forEach(function (ck) {
    const prodExp = M.explainControlImpact(ck, ch2Start, ch2End, false);
    const cyberExp = M.explainControlImpact(ck, ch2Start, ch2End, true);
    assert(
      !/Testing|Inner Loop|System 3|Sys 3/i.test(prodExp.summary) &&
        !/Testing|Inner Loop|System 3|Sys 3/i.test(cyberExp.summary),
      'Expected Ch. 2 ' + ck + ' summaries to omit Testing/Inner Loop/System 3* before Ch. 3, got: ' +
        prodExp.summary + ' | ' + cyberExp.summary
    );
  });

  // In Chapter 3+, Testing / System 3* returns in those summaries
  api.applyChapter(3);
  const ch3Start = M.captureMetricsSnapshot();
  idElements.discoveryNoiseSlider.value = '2';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  const ch3End = M.captureMetricsSnapshot();
  assert(
    M.explainControlImpact('discoveryNoise', ch3Start, ch3End, false).summary.includes('Testing') &&
      M.explainControlImpact('discoveryNoise', ch3Start, ch3End, true).summary.includes('System 3*'),
    'Expected Ch. 3+ discoveryNoise summaries to include Testing / System 3*'
  );
});

check('C1.4: Quick experiments preset buttons surface dysfunction/safeguard readouts, accurate spotlights, and active button state', function () {
  api.setViewMode('product');

  // 1. Dysfunction presets never show green Adaptation loop, surface actual active faults, and colour bar tone-bad
  const dysfunctionCases = [
    { ch: 2, btnIdx: 0, mustInclude: 'Spec distortion 52%', label: 'Leaky async handoffs' },
    { ch: 3, btnIdx: 0, mustInclude: 'Strict testing (blind to Spec)', label: 'Strict testing on wrong Spec' },
    { ch: 4, btnIdx: 0, mustInclude: '10x Build \u2192 1x Testing bottleneck', label: '10x Build into 1x Testing' },
    { ch: 5, btnIdx: 0, mustInclude: 'Label noise 90%', label: 'Hype label on clean code' },
    { ch: 5, btnIdx: 1, mustInclude: 'Silent reach 25%', label: 'Silent launch' },
    { ch: 8, btnIdx: 3, mustInclude: '10x Build \u2192 1x Testing bottleneck', label: 'Ungoverned 10x Build' }
  ];
  dysfunctionCases.forEach(function (tc) {
    api.applyChapter(tc.ch);
    idElements.experimentsRow.children[tc.btnIdx].dispatchEvent('click');
    assert(
      !idElements.impactPills.innerHTML.includes('impact-pill good">Adaptation loop') &&
        idElements.impactPills.innerHTML.includes(tc.mustInclude) &&
        idElements.impactBar.classList.contains('tone-bad') &&
        idElements.impactSummary.textContent === '',
      'Expected dysfunction preset "' + tc.label + '" to show ' + tc.mustInclude + ' with tone-bad and zero green Adaptation loop, got: ' +
        idElements.impactPills.innerHTML
    );
  });

  // Healthy presets show green safeguard cues, green Adaptation loop, and tone-good (and translate in Cybernetics view)
  api.applyChapter(2);
  idElements.experimentsRow.children[1].dispatchEvent('click'); // Observed + paired (clean)
  assert(
    idElements.impactPills.innerHTML.includes('Observed + paired') &&
      idElements.impactPills.innerHTML.includes('impact-pill good">Adaptation loop') &&
      idElements.impactBar.classList.contains('tone-good'),
    'Expected clean preset "Observed + paired" to show green safeguard + green Adaptation loop + tone-good'
  );
  api.setViewMode('cybernetics');
  assert(
    idElements.impactPills.innerHTML.includes('Widened + sync Sys 1') &&
      idElements.impactPills.innerHTML.includes('impact-pill good">Loop '),
    'Expected Cybernetics view preset readout to translate Widened + sync Sys 1 and Loop'
  );
  api.setViewMode('product');

  // 2. Preset spotlights evaluate AFTER all preset values are applied and use chapter-aware focal zones when unchanged
  // Ch. 7: switching from "Healthy flow + Andon cord armed" (btn 1) to "Frequent auto-shocks (no Andon cord)" (btn 2)
  api.applyChapter(7);
  idElements.experimentsRow.children[1].dispatchEvent('click'); // Andon ON, shocks Off
  idElements.experimentsRow.children[2].dispatchEvent('click'); // Andon OFF, shocks Frequent
  assert(
    api.getState().spotlightZones.includes('outerLoop') &&
      api.getState().spotlightZones.includes('queueDiscovery'),
    'Expected Ch. 7 shock preset with Andon OFF to spotlight outerLoop + queueDiscovery after all preset values apply, got: ' +
      api.getState().spotlightZones.join(', ')
  );

  // Ch. 8: switching from "Ungoverned 10x Build" (btn 3, Strict testing) to "Feature Factory" (btn 1, Light testing)
  api.applyChapter(8);
  idElements.experimentsRow.children[3].dispatchEvent('click');
  idElements.experimentsRow.children[1].dispatchEvent('click');
  assert(
    api.getState().spotlightZones.includes('outerLoop') &&
      api.getState().spotlightZones.includes('worldRight'),
    'Expected Ch. 8 Feature Factory (Light testing) to spotlight outerLoop + worldRight after testingIdx updates'
  );

  // Clicking already-matching default preset highlights chapter focal zones across Ch. 3 to 7 instead of Ch. 2 fallback
  api.applyChapter(5);
  idElements.experimentsRow.children[0].dispatchEvent('click'); // Hype label on clean code (default, no diff)
  assert.deepStrictEqual(
    api.getState().spotlightZones,
    ['rollout', 'connRollout', 'worldRight'],
    'Expected Ch. 5 unchanged default preset click to spotlight Rollout focal zones'
  );
  api.applyChapter(6);
  idElements.experimentsRow.children[0].dispatchEvent('click'); // Summary metric: blind guessing (default, no diff)
  assert(
    api.getState().spotlightZones.includes('rollout') &&
      api.getState().spotlightZones.includes('outerLoop'),
    'Expected Ch. 6 unchanged default preset click to spotlight Rollout and Outer Loop'
  );
  api.applyChapter(7);
  idElements.experimentsRow.children[0].dispatchEvent('click'); // Healthy flow: click Trigger Shock Wave (default, no diff)
  assert(
    api.getState().spotlightZones.includes('worldLeft') &&
      api.getState().spotlightZones.includes('outerLoop'),
    'Expected Ch. 7 unchanged default preset click to spotlight Outside World and Outer Loop'
  );

  // 3. .btn-preset receives .active / aria-pressed="true" when matching, clears on divergence, and restores on match
  for (let ch = 1; ch <= 8; ch++) {
    api.applyChapter(ch);
    const btns = idElements.experimentsRow.children;
    assert(
      btns[0].classList.contains('active') &&
        btns[0].getAttribute('aria-pressed') === 'true' &&
        btns.slice(1).every(function (b) { return !b.classList.contains('active') && b.getAttribute('aria-pressed') === 'false'; }),
      'Expected Ch. ' + ch + ' opening default preset button to be .active'
    );
  }
  api.applyChapter(2);
  const ch2Btns = idElements.experimentsRow.children;
  ch2Btns[1].dispatchEvent('click'); // Observed + paired (clean)
  assert(
    !ch2Btns[0].classList.contains('active') &&
      ch2Btns[1].classList.contains('active') &&
      ch2Btns[1].getAttribute('aria-pressed') === 'true',
    'Expected clicked preset button to become .active'
  );
  // Diverging a control clears .active from all preset buttons
  idElements.discoveryDampenerToggle.checked = false;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  assert(
    ch2Btns.every(function (b) { return !b.classList.contains('active') && b.getAttribute('aria-pressed') === 'false'; }),
    'Expected diverging a control away from all presets to clear .active on all preset buttons'
  );
  // Restoring the control back into "Leaky async handoffs" (buildDampener -> false) highlights btn 0 automatically
  idElements.buildDampenerToggle.checked = false;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert(
    ch2Btns[0].classList.contains('active') && ch2Btns[0].getAttribute('aria-pressed') === 'true',
    'Expected dialling controls into a matching preset to restore .active automatically'
  );
  assert(/\.btn-preset\.active\s*\{/.test(cssSource), 'Expected .btn-preset.active rule in styles.css');
});

check('C1.5: Queued items compute Spec/Build outputs on station entry (plus instant active refresh), and policy "|" divider waits for pre-change items', function () {
  const M = global.window.CyberneticModel;
  api.setViewMode('product');

  // 1. Active Discovery / Build items refresh immediately on safeguard toggle, and queued items adopt the new settings when promoted
  api.applyChapter(4);
  idElements.build10xToggle.checked = false;
  idElements.build10xToggle.dispatchEvent('change');
  idElements.demandSlider.value = '3'; // Flooded
  idElements.demandSlider.dispatchEvent('input');
  idElements.wipSlider.value = '3'; // Uncapped
  idElements.wipSlider.dispatchEvent('input');
  idElements.discoveryNoiseSlider.value = '3'; // Heavy (82%)
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.buildNoiseSlider.value = '3'; // Heavy (82%)
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  idElements.buildSlider.value = '2'; // Large batch (3.8s) so Build queue builds up
  idElements.buildSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  runSeconds(8);
  assert(
    M.sim.stations.build.active && M.sim.stations.build.queue.length >= 2,
    'Expected active Build item + >=2 queued Build items'
  );
  // Fresh items waiting in Build queue have not been built yet (builtRadii === null)
  assert(
    M.sim.stations.build.queue.every(function (q) { return q.builtRadii === null; }),
    'Expected fresh items waiting in Build queue to keep builtRadii null until Build starts'
  );

  const activeBuildBefore = M.computeOverlapFit(
    M.sim.stations.build.active.specRadii,
    M.sim.stations.build.active.builtRadii,
    1.0,
    1.0
  );
  const queuedBuildIds = M.sim.stations.build.queue.map(function (q) { return q.id; });

  // Lower Build noise to None (0%) and Discovery noise to None (0%): active Build & Discovery items refresh immediately, and queued Build items construct cleanly on entry
  idElements.discoveryNoiseSlider.value = '0';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.buildNoiseSlider.value = '0';
  idElements.buildNoiseSlider.dispatchEvent('input');

  const activeBuildAfter = M.computeOverlapFit(
    M.sim.stations.build.active.specRadii,
    M.sim.stations.build.active.builtRadii,
    1.0,
    1.0
  );
  assert(
    activeBuildAfter > 0.99 && activeBuildAfter > activeBuildBefore + 0.15,
    'Expected active Build item to refresh immediately when Build noise drops to 0% (' + activeBuildBefore.toFixed(2) + ' -> ' + activeBuildAfter.toFixed(2) + ')'
  );
  if (M.sim.stations.discovery.active) {
    const activeDiscFit = M.computeOverlapFit(
      M.sim.stations.discovery.active.capturedWorldRadii,
      M.sim.stations.discovery.active.specRadii,
      1.0,
      1.0
    );
    assert(activeDiscFit > 0.99, 'Expected active Discovery item to refresh immediately when Discovery noise drops to 0%');
  }

  // Step forward until the queued Build items reach Real Users: none of them carry old pre-change Build warps
  runSeconds(16);
  const shippedFromQueue = api.getState().history.filter(function (h) {
    return queuedBuildIds.includes(h.id);
  });
  assert(shippedFromQueue.length >= 2, 'Expected queued Build items to finish shipping');
  // Note: those queued Build items already finished Discovery before Discovery noise dropped, while their Build warp must be false (hadBuildWarp === false -> verify builtRadii matches specRadii on newly promoted Build items)
  assert(
    M.sim.stations.build.active === null || !M.sim.stations.build.active.hadBuildWarp,
    'Expected promoted Build items after Build noise -> 0% to have zero Build warp'
  );

  // 2. Pink "|" policy-change divider waits until items already past the edited stage finish landing, and surfaces Since | fit
  api.applyChapter(5);
  idElements.demandSlider.value = '1'; // Steady demand
  idElements.demandSlider.dispatchEvent('input');
  idElements.wipSlider.value = '1'; // Tight (3) WIP (2-3 items in pipeline without queue staleness)
  idElements.wipSlider.dispatchEvent('input');
  idElements.discoveryNoiseSlider.value = '3'; // Heavy Discovery noise (82%)
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.messagingNoiseSlider.value = '0'; // Accurate messaging
  idElements.messagingNoiseSlider.dispatchEvent('input');
  idElements.testingSlider.value = '2'; // Balanced testing (1.4s)
  idElements.testingSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  // Run until history has completed launches AND items are simultaneously downstream past Discovery (in Build / Testing / Rollout)
  runSeconds(12);
  assert(api.getState().history.length >= 2, 'Expected completed pre-change launches in history');

  const downstreamIds = [];
  if (M.sim.stations.build.active) downstreamIds.push(M.sim.stations.build.active.id);
  M.sim.stations.build.queue.forEach(function (q) { downstreamIds.push(q.id); });
  if (M.sim.stations.testing.active) downstreamIds.push(M.sim.stations.testing.active.id);
  M.sim.stations.testing.queue.forEach(function (q) { downstreamIds.push(q.id); });
  if (M.sim.stations.rollout.active) downstreamIds.push(M.sim.stations.rollout.active.id);
  M.sim.stations.rollout.queue.forEach(function (q) { downstreamIds.push(q.id); });
  M.sim.transits.forEach(function (tr) {
    if (tr.kind !== 'to_discovery') downstreamIds.push(tr.item.id);
  });
  assert(downstreamIds.length >= 1, 'Expected >=1 pre-change item already downstream past Discovery');

  // Turn on Watch real users (cutting Discovery noise ~82%): downstream items still carry old flawed Specs
  idElements.discoveryDampenerToggle.checked = true;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  assert(api.getState().pendingPolicyBreak, 'Expected pendingPolicyBreak immediately after toggling Watch real users');

  // Step forward until post-change Discovery items also land
  runSeconds(14);
  const hist = api.getState().history;
  const breakIdx = hist.findIndex(function (h) { return h.afterPolicyChange; });
  assert(breakIdx > 0, 'Expected afterPolicyChange "|" divider to land after pre-change items');

  // Every item that was already downstream past Discovery at toggle time must sit BEFORE (index < breakIdx) the pink "|" divider
  downstreamIds.forEach(function (dId) {
    const pos = hist.findIndex(function (h) { return h.id === dId; });
    if (pos !== -1) {
      assert(
        pos < breakIdx,
        'Pre-change downstream item #' + dId + ' landed at index ' + pos + ' on/after breakIdx ' + breakIdx
      );
    }
  });

  // Post-change launches to the right of "|" average high fit and surface "Since |: XX%" in #historySummary
  const postChangeSlice = hist.slice(breakIdx);
  assert(postChangeSlice.length >= 2, 'Expected >=2 post-change launches after "|"');
  const postAvg = postChangeSlice.reduce(function (a, h) { return a + h.fitPct; }, 0) / postChangeSlice.length;
  assert(postAvg >= 72, 'Expected post-change launches after "|" to average >=72% fit, got ' + postAvg.toFixed(1) + '%');
  assert(
    idElements.historySummary.innerHTML.includes(
      'Since <span class="policy-divider-mark">|</span>: <span class="mono-stat">' + Math.round(postAvg) + '%</span>'
    ),
    'Expected #historySummary to surface Since |: ' + Math.round(postAvg) + '% with magenta divider mark, got: ' +
      idElements.historySummary.innerHTML
  );
});

console.log('11. Safe technical, state, CSS, & copy regression guards (A2, A3, A4, A5)');

check('A2.1 & A5.3: decideOuterLoopExit() never blames clean Rollout when reachIdx === 3 and messagingNoiseIdx === 0', function () {
  api.applyChapter(6);
  idElements.discoveryNoiseSlider.value = '1';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.buildNoiseSlider.value = '1';
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  idElements.reachSlider.value = '3';
  idElements.reachSlider.dispatchEvent('input');
  idElements.messagingNoiseSlider.value = '0';
  idElements.messagingNoiseSlider.dispatchEvent('input');
  idElements.diagnosticChannelToggle.checked = true;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  idElements.driftSlider.value = '2';
  idElements.driftSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  const st = runSeconds(140);
  const returns = st.history.filter(function (h) { return h.outerReturns > 0; });
  assert(returns.length >= 2, 'Expected compounded drift/noise misses to trigger Outer Loop returns');
  assert(
    returns.every(function (h) { return h.trueFault !== 'rollout' && h.outerExit !== 'rollout'; }),
    'Clean Rollout (reachIdx=3, messagingNoiseIdx=0) must never be blamed as trueFault'
  );
});

check('A2.2 & A5.4: Checking Andon cord when shockCount === 0 does not wipe valid non-shock queues', function () {
  api.applyChapter(8);
  idElements.shockSlider.value = '0';
  idElements.shockSlider.dispatchEvent('input');
  idElements.demandSlider.value = '3';
  idElements.demandSlider.dispatchEvent('input');
  idElements.wipSlider.value = '3';
  idElements.wipSlider.dispatchEvent('input');
  idElements.build10xToggle.checked = true;
  idElements.build10xToggle.dispatchEvent('change');
  idElements.testingSlider.value = '3';
  idElements.testingSlider.dispatchEvent('input');
  idElements.andonCordToggle.checked = false;
  idElements.andonCordToggle.dispatchEvent('change');
  idElements.resetBtn.dispatchEvent('click');

  runSeconds(15);
  const before = api.getState();
  assert.strictEqual(before.shockCount, 0, 'Expected shockCount === 0');
  assert(before.queueCount >= 3, 'Expected non-shock queue buildup (>=3)');

  idElements.andonCordToggle.checked = true;
  idElements.andonCordToggle.dispatchEvent('change');
  const after = api.getState();
  assert.strictEqual(after.totalFlushedByAndon, 0, 'Expected zero non-shock items flushed when shockCount === 0');
  assert.strictEqual(after.queueCount, before.queueCount, 'Expected non-shock queue preserved when arming Andon cord');
});

check('A2.4 & A5.4: Dragging testingSlider -> 0 mid-flight creates smooth forward transits from Testing and clears stale wrench badges', function () {
  // Case 1: item already inside Testing station when testingSlider -> 0
  api.applyPreset(3, 1);
  let sawInTesting = false;
  for (let i = 0; i < 150; i++) {
    api.step(0.04);
    const it = api.getState().item;
    if (it && api.getState().transits.length === 0 && it.builtRadii && !it.testedPassed && it.stageElapsed > 0.05) {
      // Check if testing station has active item by stepping after Discovery+Build (~1.6s + transits)
      if (i > 55) {
        sawInTesting = true;
        break;
      }
    }
  }
  assert(sawInTesting, 'Expected item inside Testing station');
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  const flushedTransits = api.getState().transits;
  assert(flushedTransits.length === 1 && flushedTransits[0].fromX >= 726, 'Expected flushed Testing item to start from Testing right edge (>=726), not snap back to Build');

  // Case 2: item mid-transit to_testing on Ch. 5 when testingSlider -> 0 does not teleport straight into Rollout
  api.applyChapter(5);
  for (let i = 0; i < 150; i++) {
    api.step(0.04);
    if (api.getState().transits.some(function (t) { return t.kind === 'to_testing'; })) break;
  }
  assert(api.getState().transits.some(function (t) { return t.kind === 'to_testing'; }), 'Expected item in to_testing transit');
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  runSeconds(0.32);
  const postArrival = api.getState().transits;
  assert(
    postArrival.some(function (t) { return t.kind === 'to_rollout' && t.fromX === 600; }),
    'Expected item arriving at Testing=Off to start forward to_rollout transit from Testing x=600 instead of teleporting'
  );
  assert(
    postArrival.every(function (t) { return !t.hasWrench; }),
    'Expected wrench badge cleared when Testing is Off'
  );
});

check('A2.5 & A5.5: Pause / Reset / chapter switch / resize keep #clockValue ("0.0d"), live Rollout packaging, and canvas synced', function () {
  api.applyChapter(5);
  runSeconds(12);
  idElements.clockValue.textContent = '24.0d';
  idElements.playPauseBtn.dispatchEvent('click');
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Play', 'Expected Play button label when paused');

  idElements.resetBtn.dispatchEvent('click');
  assert.strictEqual(idElements.clockValue.textContent, '0.0d', 'Expected Reset while paused to sync #clockValue to 0.0d');
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Play', 'Expected Pause state preserved across Reset');

  idElements.clockValue.textContent = '18.8d';
  api.applyChapter(6);
  assert.strictEqual(idElements.clockValue.textContent, '0.0d', 'Expected chapter switch while paused to sync #clockValue to 0.0d');

  // Advance until an item is inside Rollout, then edit messagingNoiseSlider while paused
  for (let i = 0; i < 150; i++) {
    api.step(0.04);
    const texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
    if (texts.some(function (tx) { return tx.indexOf('Tag: "') === 0; })) break;
  }
  idElements.reachSlider.value = '0';
  idElements.reachSlider.dispatchEvent('input');
  const pausedRolloutTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(pausedRolloutTexts.includes('Silent "???"'), 'Expected paused reachSlider edit to immediately update active Rollout item on canvas');

  // Resize repaints canvas synchronously even while paused
  idElements.simCanvas._canvasTexts = [];
  global.window.dispatchEvent('resize');
  assert(idElements.simCanvas._canvasTexts.length > 0, 'Expected window resize to repaint canvas synchronously');

  // Unpause back to running state
  idElements.playPauseBtn.dispatchEvent('click');
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Pause');
});

check('A3.5, A3.7, & A4.3: Queue tray >=10 clearance, mobile CSS rules, pre-boot Ch. 1 sync, and domain-neutral canvas banners', function () {
  assert(jsSource.includes('qLen >= 10 ? 2 : (qLen > 4 ? 3 : 4)'), 'Expected maxVisible=2 when qLen >= 10');
  assert(/\.clock-controls\s*\{[^}]*flex-wrap:\s*wrap/.test(cssSource), 'Expected flex-wrap: wrap on .clock-controls');
  assert(/\.canvas-wrap\s*\{[^}]*overflow-x:\s*auto/.test(cssSource), 'Expected overflow-x: auto on .canvas-wrap');
  assert(/#simCanvas\s*\{[^}]*min-width:\s*760px/.test(cssSource), 'Expected min-width: 760px on #simCanvas');

  assert(!jsSource.includes('Static!') && !htmlSource.includes('Static when reading'), 'Expected "Static" replaced with "Noise!" / "Distortion"');
  assert(!jsSource.includes('Re-fire! \\u2192 Rework') && !jsSource.includes('Re-fire! \u2192 Rework'), 'Expected cafe-specific Re-fire banner replaced with Failed -> Rework');
  assert(api.getChapters()[3].storyHtml.includes('<em>"Re-fire"</em>!'), 'Expected ! outside italics/quotes in Ch. 3 storyHtml');

  assert(htmlSource.includes('id="loopTimeValue" class="mono-stat">19.7d<'), 'Expected pre-boot Ch. 1 loopTimeValue 19.7d');
  assert(htmlSource.includes('id="worldCycleValue" class="mono-stat">10.8d<'), 'Expected pre-boot Ch. 1 worldCycleValue 10.8d');
  assert(htmlSource.includes('id="driftRegime" class="control-regime">Rapid<'), 'Expected pre-boot Ch. 1 driftRegime Rapid');
  assert(htmlSource.includes('id="discoveryRegime" class="control-regime">Paralysis<'), 'Expected pre-boot Ch. 1 discoveryRegime Paralysis');
});

check('A5.2: Retry tooltip integrity holds across Ch. 6, Ch. 7, and Ch. 8 (Pass-1 initialFitPct preserved & < fitPct on non-jammed diagnosed recovery)', function () {
  // 1. Concurrent retries in Ch. 8 preserve exact Pass-1 fitPct as initialFitPct
  api.applyChapter(8);
  idElements.andonCordToggle.checked = false;
  idElements.andonCordToggle.dispatchEvent('change');
  idElements.shockSlider.value = '0';
  idElements.shockSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  runSeconds(18);
  idElements.topShockBtn.dispatchEvent('click');
  const concurrentSt = runSeconds(22);
  const concurrentRetries = concurrentSt.history.filter(function (h) { return h.outerReturns > 0; });
  assert(concurrentRetries.length >= 2, 'Expected concurrent Outer Loop retries in Ch. 8 after un-pre-empted shock');
  concurrentRetries.forEach(function (ret) {
    assert(ret.initialFitPct < 60, 'Expected retry initialFitPct < 60');
    const pass1 = concurrentSt.history.find(function (h) { return h.id === ret.id && h.outerReturns === 0; });
    if (pass1) {
      assert.strictEqual(ret.initialFitPct, pass1.fitPct, 'Expected retry initialFitPct to match Pass-1 launch chip');
    }
  });

  // 2. Non-jammed diagnosed recovery in Ch. 8 satisfies initialFitPct < fitPct (>=75% settled)
  api.applyPreset(8, 4);
  idElements.diagnosticChannelToggle.checked = true;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  idElements.resetBtn.dispatchEvent('click');
  const recoveredSt = runSeconds(95);
  const diagRetries = recoveredSt.history.filter(function (h) { return h.outerReturns > 0; });
  assert(diagRetries.length >= 6, 'Expected diagnosed retries on Ch. 8 Hype-Driven Rollout + Diagnostic channel');
  assert(
    diagRetries.every(function (h) { return h.initialFitPct < 60 && h.initialFitPct < h.fitPct; }),
    'Expected initialFitPct < fitPct on every diagnosed Ch. 8 recovery'
  );
  assert(settledAvgFit(recoveredSt.history) >= 75, 'Expected settled fit >= 75% on diagnosed Ch. 8 recovery');
});

check('A2.3 & A5.4: Adaptation loop reflects Outer Loop rework, updates instantly on Andon flush, and drains cleanly when wipSlider -> 0', function () {
  // 1. Ch. 6 blind vs diagnostic Outer Loop rework reflected in #loopTimeValue
  api.applyChapter(6);
  const blindLoop = parseFloat(idElements.loopTimeValue.textContent);
  assert(
    idElements.loopTimeValue.textContent.includes('(incl. rework)') && blindLoop > 20,
    'Expected Ch. 6 blind default to include multi-pass Outer Loop rework (>20d), got ' + idElements.loopTimeValue.textContent
  );
  idElements.diagnosticChannelToggle.checked = true;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  const diagLoop = parseFloat(idElements.loopTimeValue.textContent);
  assert(
    diagLoop < blindLoop - 8 && diagLoop > 10,
    'Expected enabling Diagnostic channel on Rollout fault to shrink expected loop time (' + blindLoop + 'd -> ' + diagLoop + 'd)'
  );

  // 2. Ch. 7 Andon flush drops #loopTimeValue immediately rather than lagging behind 6 historical items
  api.applyChapter(7);
  const steadyLoop = parseFloat(idElements.loopTimeValue.textContent);
  runSeconds(35);
  idElements.topShockBtn.dispatchEvent('click');
  runSeconds(45);
  const jammedLoop = parseFloat(idElements.loopTimeValue.textContent);
  assert(jammedLoop > steadyLoop + 12, 'Expected post-shock queue jam to inflate loopTimeValue');

  idElements.andonCordToggle.checked = true;
  idElements.andonCordToggle.dispatchEvent('change');
  const postFlushLoop = parseFloat(idElements.loopTimeValue.textContent);
  assert.strictEqual(postFlushLoop, steadyLoop, 'Expected Andon flush to drop loopTimeValue back to steady base immediately');

  // 3. Dragging wipSlider 3 -> 0 while queues drain keeps updating (queue N) down to 0
  api.applyPreset(4, 2);
  runSeconds(25);
  assert(api.getState().queueCount >= 4, 'Expected built-up queue on Flooded backlog');
  idElements.wipSlider.value = '0';
  idElements.wipSlider.dispatchEvent('input');
  assert(
    idElements.loopTimeValue.textContent.includes('(queue '),
    'Expected (queue N) to remain visible while backlog drains at wipIdx === 0'
  );
  runSeconds(60);
  assert.strictEqual(api.getState().queueCount, 0, 'Expected backlog to finish draining');
  assert(
    !idElements.loopTimeValue.textContent.includes('(queue '),
    'Expected (queue N) suffix to clear once backlog finishes draining at wipIdx === 0'
  );
});

check('A2.6: REACH_REGIMES ideal fit scores match labels (25% / 60% / 85% / 100%) and Silent reach dims Messaging noise', function () {
  const expectedPcts = [25, 60, 85, 100];
  expectedPcts.forEach(function (pct, rIdx) {
    api.setViewMode('product');
    api.applyChapter(5);
    idElements.reachSlider.value = String(rIdx);
    idElements.reachSlider.dispatchEvent('input');
    idElements.messagingNoiseSlider.value = '0';
    idElements.messagingNoiseSlider.dispatchEvent('input');
    idElements.driftSlider.value = '0';
    idElements.driftSlider.dispatchEvent('input');
    idElements.resetBtn.dispatchEvent('click');

    if (rIdx === 0) {
      assert(
        idElements.messagingNoiseGroup.classList.contains('is-dimmed'),
        'Expected #messagingNoiseGroup to be dimmed when Rollout reach = Silent'
      );
      assert.strictEqual(
        idElements.messagingNoiseRegime.textContent,
        'Unlabelled (Silent)',
        'Expected Silent reach to mark #messagingNoiseRegime as Unlabelled (Silent)'
      );
      api.setViewMode('cybernetics');
      assert.strictEqual(
        idElements.messagingNoiseRegime.textContent,
        'Unencoded (Silent)',
        'Expected Cybernetics view Silent reach readout Unencoded (Silent)'
      );
      api.setViewMode('product');
    } else {
      assert(
        !idElements.messagingNoiseGroup.classList.contains('is-dimmed'),
        'Expected #messagingNoiseGroup not to be dimmed when reachIdx = ' + rIdx
      );
      assert.strictEqual(
        idElements.messagingNoiseRegime.textContent,
        'Accurate',
        'Expected #messagingNoiseRegime restored to Accurate when reachIdx = ' + rIdx
      );
    }

    // First launch lands during STAR's hold plateau (zero drift, zero noise)
    for (let i = 0; i < 200; i++) {
      api.step(0.04);
      if (api.getState().history.length >= 1) break;
    }
    const first = api.getState().history[0];
    assert(first, 'Expected first launch to complete for reachIdx = ' + rIdx);
    assert.strictEqual(
      first.fitPct,
      pct,
      'Expected ideal zero-noise launch at reachIdx=' + rIdx + ' to score ' + pct + '%, got ' + first.fitPct + '%'
    );
  });
});

check('A3.2: Connector labels clear neighbouring box walls in both views and arriving tiles do not poke into Real Users', function () {
  const D = global.window.CyberneticDiagramView;
  ['product', 'cybernetics'].forEach(function (mode) {
    api.setViewMode(mode);
    // Test clean/attenuate & dampened labels across all three horizontal layout tiers (Ch. 1-2, Ch. 3-4, Ch. 5-8)
    [1, 3, 8].forEach(function (chNum) {
      api.applyChapter(chNum);
      api.step(0);
      const b = D.getSceneLayout().boxes;
      const lastInternal = b.rollout || b.testing || b.build;
      const gaps = [
        { name: 'World->Discovery', leftWall: b.worldLeft.x + b.worldLeft.w, rightWall: b.discovery.x },
        { name: 'Discovery->Build', leftWall: b.discovery.x + b.discovery.w, rightWall: b.build.x },
        { name: 'Output->Users', leftWall: lastInternal.x + lastInternal.w, rightWall: b.worldRight.x }
      ];
      const connectorLabels = (idElements.simCanvas._canvasTexts || []).filter(function (t) {
        return Math.abs(t.y - 128) < 2;
      });
      assert(connectorLabels.length >= 2, 'Expected connector labels at y=128 on Ch. ' + chNum + ' (' + mode + ')');
      connectorLabels.forEach(function (lbl) {
        const gap = gaps.find(function (g) { return lbl.x > g.leftWall && lbl.x < g.rightWall; });
        assert(gap, 'Connector label "' + lbl.text + '" at x=' + lbl.x + ' did not fall inside a station gap on Ch. ' + chNum);
        const estWidth = lbl.text.length * 5.2;
        assert(
          lbl.x - estWidth / 2 >= gap.leftWall + 1 && lbl.x + estWidth / 2 <= gap.rightWall - 1,
          'Connector label "' + lbl.text + '" (~' + estWidth.toFixed(1) + 'px) clipped walls of ' + gap.name
        );
      });
    });
  });
  api.setViewMode('product');

  // Verify from_rollout_to_users endX keeps 44x44 tile + corner badge left of Real Users (x = 952)
  assert(
    jsSource.includes("const startX = ro.x + ro.w + 22;\n        const endX = wr.x - 28;"),
    'Expected from_rollout_to_users transit bounds to keep 44x44 tile and corner badge clear of Rollout and Real Users walls'
  );
});

check('A3.3: Station header eyebrows and titles stay clear of top-right progress rings and Build rework wrench badge', function () {
  const internalBoxes = [
    { name: 'discovery', x: 248, y: 66, w: 126, cx: 311 },
    { name: 'build', x: 436, y: 66, w: 126, cx: 499 },
    { name: 'testing', x: 600, y: 66, w: 126, cx: 663 },
    { name: 'rollout', x: 764, y: 66, w: 126, cx: 827 }
  ];
  ['product', 'cybernetics'].forEach(function (mode) {
    api.setViewMode(mode);
    api.applyPreset(8, 3); // Ungoverned 10x Build (exercises 10X OUTPUT / SYS 1 · 10X + active rings)
    runSeconds(6.0);
    const texts = idElements.simCanvas._canvasTexts || [];
    internalBoxes.forEach(function (b) {
      const eyebrow = texts.find(function (t) { return Math.abs(t.x - b.cx) < 1 && Math.abs(t.y - (b.y + 16)) < 1; });
      const title = texts.find(function (t) { return Math.abs(t.x - b.cx) < 1 && Math.abs(t.y - (b.y + 32)) < 1; });
      assert(eyebrow && title, 'Expected station eyebrow and title in ' + b.name + ' (' + mode + ')');
      const ringLeftEdge = b.x + b.w - 13 - (5.8 + 1.25);
      const ringBottomEdge = b.y + 13 + (5.8 + 1.25);
      const eyebrowHalfW = (eyebrow.text.length * 5.6) / 2;
      assert(
        b.cx + eyebrowHalfW <= ringLeftEdge - 6,
        'Eyebrow "' + eyebrow.text + '" crowded top-right progress ring in ' + b.name
      );
      const titleTopEdge = (b.y + 32) - 9.5;
      assert(
        ringBottomEdge <= titleTopEdge - 1.5,
        'Top-right progress ring overlapped station title "' + title.text + '" in ' + b.name
      );
    });
  });
  api.setViewMode('product');

  // Step Ch. 3 Preset 2 ("Clean Spec + buggy Build") until Build has an active rework wrench badge
  api.applyPreset(3, 1);
  let sawReworkInBuild = false;
  for (let i = 0; i < 200; i++) {
    api.step(0.04);
    const wrenchArc = (idElements.simCanvas._canvasArcs || []).find(function (a) {
      return Math.abs(a.r - 9.5) < 0.1 && a.x > 436 && a.x < 562 && a.y > 66 && a.y < 214;
    });
    if (wrenchArc) {
      sawReworkInBuild = true;
      assert(
        wrenchArc.y - 10.3 >= 66 + 32 + 4,
        'Expected Build rework wrench badge (y=' + wrenchArc.y + ') to sit cleanly below Build header (y=98)'
      );
      break;
    }
  }
  assert(sawReworkInBuild, 'Expected to observe active rework wrench badge inside Build station');
});

check('A3.4: Heavy-warped shapes stay inside station work bays without hitting headers/captions, and Silent "???" pill sits below miniature shape', function () {
  // 1. Compounded Heavy Discovery + Heavy Build noise across concurrent stations
  api.applyChapter(8);
  idElements.demandSlider.value = '3';
  idElements.demandSlider.dispatchEvent('input');
  idElements.wipSlider.value = '3';
  idElements.wipSlider.dispatchEvent('input');
  idElements.discoveryNoiseSlider.value = '3';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.discoveryDampenerToggle.checked = false;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  idElements.buildNoiseSlider.value = '3';
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.buildDampenerToggle.checked = false;
  idElements.buildDampenerToggle.dispatchEvent('change');
  idElements.testingSlider.value = '3';
  idElements.testingSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  idElements.simCanvas._trackPathBBoxes = true;
  try {
    let checkedStationShapes = 0;
    for (let i = 0; i < 450; i++) {
      api.step(0.04);
      assert(idElements.simCanvas._canvasClipCount >= 2, 'Expected station work-bay clipping during render');
      (idElements.simCanvas._pathBBoxes || []).forEach(function (bb) {
        const cx = (bb.minX + bb.maxX) / 2;
        const cy = (bb.minY + bb.maxY) / 2;
        // Internal station centre shapes sit near cy = 149 inside y = 66..214 (header y=98, bottom caption y=204)
        if (cx > 240 && cx < 900 && cy > 130 && cy < 168 && bb.maxX - bb.minX > 26) {
          checkedStationShapes += 1;
          assert(
            bb.minY >= 103 && bb.maxY <= 193,
            'Heavy-warped internal station shape spilled into header or bottom caption: y=' + bb.minY.toFixed(1) + '..' + bb.maxY.toFixed(1)
          );
        }
        // Large World / Real Users shapes sit near cy = 150 inside y = 26..262 (header y=58, bottom caption y=248)
        if ((cx < 195 || cx > 945) && cy > 130 && cy < 168) {
          assert(
            bb.minY >= 64 && bb.maxY <= 236,
            'Heavy-warped outer world/users shape spilled into header or bottom caption: y=' + bb.minY.toFixed(1) + '..' + bb.maxY.toFixed(1)
          );
        }
      });
    }
    assert(checkedStationShapes >= 40, 'Expected to verify >=40 heavy-warped internal station shapes');
  } finally {
    idElements.simCanvas._trackPathBBoxes = false;
  }

  // 2. Silent launch ("???") pill in Real Users sits below miniature shape rather than covering cy = 150
  api.applyPreset(5, 1);
  let sawSilentLandingPill = false;
  for (let i = 0; i < 200; i++) {
    api.step(0.04);
    const pillTxt = (idElements.simCanvas._canvasTexts || []).find(function (t) {
      return t.text === 'Unlabelled "???"';
    });
    if (pillTxt) {
      sawSilentLandingPill = true;
      assert(
        pillTxt.y >= 178 && pillTxt.y <= 228,
        'Expected Silent "Unlabelled ???" pill text (y=' + pillTxt.y + ') below miniature shape (cy=150) and clear of bottom Fit caption (y=248)'
      );
      break;
    }
  }
  assert(sawSilentLandingPill, 'Expected to observe landed Silent "Unlabelled ???" pill in Real Users');
});

check('A3.6 & A5: Inner Loop caption clears rework tiles, concurrent outer_return ramps all highlight, and canvas texts fit inside box walls', function () {
  // 1. Inner Loop caption sits in dedicated lane (y = 299) clear of inner_rework tile + "Rework" label (<=282) and outer_return trunk (310..362)
  api.applyPreset(3, 1);
  let sawInnerReworkTile = false;
  for (let i = 0; i < 200; i++) {
    api.step(0.04);
    const texts = idElements.simCanvas._canvasTexts || [];
    const reworkTileLbl = texts.find(function (t) { return t.text === 'Rework'; });
    const innerCap = texts.find(function (t) { return t.text.indexOf('Inner Loop:') === 0; });
    if (reworkTileLbl && innerCap && Math.abs(reworkTileLbl.y - 282) < 2) {
      sawInnerReworkTile = true;
      assert(
        innerCap.y >= reworkTileLbl.y + 14 && innerCap.y <= 306,
        'Expected Inner Loop caption (y=' + innerCap.y + ') clear below Rework tile label (y=' + reworkTileLbl.y + ') and above Outer Loop tiles (y>=310)'
      );
      break;
    }
  }
  assert(sawInnerReworkTile, 'Expected to observe inner_rework tile sliding along Inner Loop');

  // Verify on Ch. 6+ (where Outer Loop ramps exist) that Inner Loop caption clears Build (x=472) and Rollout (x=827) ramps in both views
  ['product', 'cybernetics'].forEach(function (mode) {
    api.setViewMode(mode);
    api.applyChapter(6);
    api.step(0);
    const ch6InnerCap = (idElements.simCanvas._canvasTexts || []).find(function (t) {
      return t.text.includes('Inner Loop:');
    });
    assert(ch6InnerCap, 'Expected Inner Loop caption on Ch. 6 (' + mode + ')');
    const innerHalfW = (ch6InnerCap.text.length * 5.2) / 2;
    assert(
      ch6InnerCap.x - innerHalfW >= 472 + 36 && ch6InnerCap.x + innerHalfW <= 827 - 40,
      'Expected Ch. 6+ Inner Loop caption (' + mode + ') clear horizontally of Build (x=472) and Rollout (x=827) Outer Loop ramps'
    );
  });
  api.setViewMode('product');

  // 2. Concurrent outer_return transits taking different exits highlight BOTH highway-sign pills simultaneously
  api.applyPreset(8, 1);
  idElements.demandSlider.value = '3';
  idElements.demandSlider.dispatchEvent('input');
  idElements.wipSlider.value = '3';
  idElements.wipSlider.dispatchEvent('input');
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  idElements.build10xToggle.checked = true;
  idElements.build10xToggle.dispatchEvent('change');
  idElements.discoveryNoiseSlider.value = '1';
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  idElements.buildNoiseSlider.value = '2';
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.messagingNoiseSlider.value = '2';
  idElements.messagingNoiseSlider.dispatchEvent('input');
  idElements.diagnosticChannelToggle.checked = true;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  idElements.resetBtn.dispatchEvent('click');

  let sawMultiHighlightedSigns = false;
  for (let i = 0; i < 250; i++) {
    api.step(0.04);
    const texts = (idElements.simCanvas._canvasTexts || []).filter(function (t) {
      return Math.abs(t.y - 241.3) < 2;
    });
    const litSigns = texts.filter(function (t) {
      return t.text.indexOf('\u2713') !== -1;
    });
    if (litSigns.length >= 2) {
      sawMultiHighlightedSigns = true;
      break;
    }
  }
  assert(sawMultiHighlightedSigns, 'Expected concurrent outer_return transits to highlight >=2 highway-sign pills simultaneously');

  // 3. Conservative text-width vs station-wall & trimmed canvas-edge guard across both views
  const D = global.window.CyberneticDiagramView;
  ['product', 'cybernetics'].forEach(function (mode) {
    api.setViewMode(mode);
    [1, 2, 3, 5, 6, 8].forEach(function (chNum) {
      api.applyChapter(chNum);
      const layout = D.getSceneLayout();
      const stationBoxes = Object.keys(layout.boxes)
        .filter(function (k) { return Boolean(layout.boxes[k]); })
        .map(function (k) {
          const bx = layout.boxes[k];
          return { name: k, x: bx.x, w: bx.w, y: bx.y, h: bx.h };
        });
      for (let step = 0; step < 35; step++) {
        api.step(0.2);
        (idElements.simCanvas._canvasTexts || []).forEach(function (t) {
          const sz = parseFloat((t.font.match(/(\d+(?:\.\d+)?)px/) || [0, 10])[1]);
          const perChar = t.font.includes('monospace') ? sz * 0.61 : sz * 0.55;
          const estW = t.text.length * perChar;
          if (t.align === 'center') {
            assert(
              t.x - estW / 2 >= 2 && t.x + estW / 2 <= 1138 && t.y >= 8 && t.y <= layout.height - 3,
              'Canvas text "' + t.text + '" clipped outer canvas bounds (' + mode + ', Ch. ' + chNum + ', y=' + t.y + ', h=' + layout.height + ')'
            );
            // Station-interior centred labels (headers, idle captions, bottom status lines)
            const hostBox = stationBoxes.find(function (b) {
              return Math.abs(t.x - (b.x + b.w / 2)) < 2 && t.y > b.y + 8 && t.y < b.y + b.h - 4;
            });
            if (hostBox) {
              assert(
                estW <= hostBox.w - 6,
                'Station text "' + t.text + '" (~' + estW.toFixed(1) + 'px) exceeded ' + hostBox.name + ' width (' + hostBox.w + 'px) in ' + mode
              );
            }
          }
        });
      }
    });
  });
  api.setViewMode('product');
});

check('A4.2: Chapter prose polish holds across Ch. 1, Ch. 3, Ch. 5, and Ch. 8', function () {
  const chapters = api.getChapters();
  assert(
    htmlSource.includes('wait 15 seconds, find it still freezing,') &&
      chapters[1].storyHtml.includes('wait 15 seconds, find it still freezing,'),
    'Expected smoothed finite-verb shower sequence in both index.html and Ch. 1 storyHtml'
  );
  assert(
    !chapters[3].lessonText.includes('rollout') &&
      !chapters[3].lessonText.includes('Noise has to be controlled'),
    'Expected Ch. 3 lessonText to omit premature Rollout reference and redundant tail sentence'
  );
  assert(
    chapters[5].storyHtml.includes('without ever noticing it. A hype-driven marketing team'),
    'Expected Ch. 5 storyHtml to use parallel declarative opening without sentence-initial Or'
  );
  assert(
    !chapters[8].cyberneticsHtml.includes('viability is a property of the balanced whole'),
    'Expected Ch. 8 cyberneticsHtml to drop redundant final sentence duplicated in cyberneticsLessonText'
  );
});

console.log('12. Direct CyberneticModel separation & unit contracts');

check('M1: content.js and model.js have zero DOM, canvas, or pixel-coordinate coupling', function () {
  assert(global.window.CyberneticContent, 'Expected window.CyberneticContent to be defined');
  assert(global.window.CyberneticModel, 'Expected window.CyberneticModel to be defined');
  ['content.js', 'model.js'].forEach(function (targetFile) {
    const entry = scriptSources.find(function (pair) { return pair[0] === targetFile; });
    assert(entry, 'Expected ' + targetFile + ' in index.html script load order');
    const src = entry[1];
    assert(
      !/\b(document|getElementById|querySelector|querySelectorAll|addEventListener|getContext|requestAnimationFrame|innerHTML|textContent|classList|localStorage|location|replaceState|clipboard|URL_CONTROL_PARAMS|buildShareQueryString|parseShareQueryString|storyCollapsed|hintsCollapsed|BOX|fromX)\b/.test(src),
      targetFile + ' leaked a DOM, canvas, URL-adapter, UI-collapse, or pixel-coordinate identifier'
    );
  });
});

check('M2: CyberneticModel steps deterministically and emits logical fromAnchor transits with zero pixel numbers', function () {
  const M = global.window.CyberneticModel;
  M.loadPreset(1, 1); // Nimble loop
  for (let i = 0; i < 400; i++) M.stepSimulation(0.04);
  const firstRunFits = M.sim.history.map(function (h) { return h.fitPct; });
  assert(firstRunFits.length >= 4 && firstRunFits[0] >= 75, 'Expected direct Model stepping to record high-fit Nimble launches');
  assert(
    M.sim.transits.every(function (t) { return t.fromX === undefined; }),
    'Raw CyberneticModel transits must never carry pixel fromX'
  );

  // Re-running from resetSimulationState() produces bit-identical launch fits
  M.resetSimulationState();
  for (let i = 0; i < 400; i++) M.stepSimulation(0.04);
  const secondRunFits = M.sim.history.map(function (h) { return h.fitPct; });
  assert.deepStrictEqual(secondRunFits, firstRunFits, 'Expected deterministic replay on CyberneticModel.resetSimulationState()');

  // Verify logical fromAnchor values ('build_exit_users', 'build_exit', 'testing_entry', 'testing_exit')
  M.loadPreset(1, 1); // Testing = Off, Rollout = inactive -> Build routes via 'build_exit_users'
  let sawBuildExitUsers = false;
  for (let i = 0; i < 100; i++) {
    M.stepSimulation(0.04);
    if (M.sim.transits.some(function (t) { return t.fromAnchor === 'build_exit_users' && t.fromX === undefined; })) {
      sawBuildExitUsers = true;
      break;
    }
  }
  assert(sawBuildExitUsers, 'Expected logical fromAnchor === "build_exit_users" in Ch. 1');

  M.loadChapter(5); // Testing = Standard -> reach to_testing then switch testingIdx = 0 for 'testing_entry'
  for (let i = 0; i < 150; i++) {
    M.stepSimulation(0.04);
    if (M.sim.transits.some(function (t) { return t.kind === 'to_testing'; })) break;
  }
  M.settings.testingIdx = 0;
  for (let i = 0; i < 12; i++) M.stepSimulation(0.04);
  assert(
    M.sim.transits.some(function (t) { return t.kind === 'to_rollout' && t.fromAnchor === 'testing_entry' && t.fromX === undefined; }),
    'Expected logical fromAnchor === "testing_entry" when arriving at Testing=Off'
  );
});

check('M3: CyberneticModel centralises snapshot diffing, loop/rework transitions, and spotlight zone selection', function () {
  const M = global.window.CyberneticModel;

  // Inner Loop rework diffing on Ch. 3
  M.loadPreset(3, 1); // Clean Spec + buggy Build (Strict testing, Heavy build noise)
  const prevCh3 = M.captureMetricsSnapshot();
  assert.strictEqual(prevCh3.expectsInnerRework, true);
  M.settings.buildNoiseIdx = 0;
  const nextCh3 = M.captureMetricsSnapshot();
  const diffCh3 = M.computeSnapshotDiff(prevCh3, nextCh3);
  assert.strictEqual(diffCh3.clearedInnerRework, true);
  assert.strictEqual(diffCh3.loopTone, 'good');
  const explainCh3 = M.explainControlImpact('buildNoise', prevCh3, nextCh3, true);
  assert(
    explainCh3.pills.some(function (p) { return p.text === 'Clears Sys 3* rework' && p.tone === 'good'; }),
    'Expected direct Model explainControlImpact to report Clears Sys 3* rework'
  );

  // Outer Loop rework diffing & logical spotlight zones on Ch. 6
  M.loadChapter(6);
  const prevCh6 = M.captureMetricsSnapshot();
  assert.strictEqual(prevCh6.expectsOuterRework, true);
  M.settings.rolloutDampener = true;
  const nextCh6 = M.captureMetricsSnapshot();
  const diffCh6 = M.computeSnapshotDiff(prevCh6, nextCh6);
  assert.strictEqual(diffCh6.clearedOuterRework, true);
  assert.strictEqual(diffCh6.loopTone, 'good');
  const zonesCh6 = M.getSpotlightZonesForControl('rolloutDampener', prevCh6, nextCh6);
  assert.deepStrictEqual(zonesCh6, ['rollout', 'connRollout', 'worldRight', 'outerLoop']);

  // Preset spotlight diffing via applyPresetValuesAndGetZones
  const presetZones = M.applyPresetValuesAndGetZones(global.window.CyberneticContent.CHAPTERS[6].presets[2].values);
  assert(presetZones.includes('discovery') && presetZones.includes('connSense'), 'Expected preset diff to include changed Discovery zones');

  api.applyChapter(1);
});

check('R5.2: Incoming demand (left card) separates from System 2 WIP limit (right card), capping queues even under Flooded demand', function () {
  api.setViewMode('product');

  // 1. Flooded demand + zero bugs + Uncapped WIP (Preset 4.2) piles up queues & ships stale; tightening ONLY WIP limit to Tight (3) under Flooded demand caps queues & restores fit
  api.applyPreset(4, 2);
  assert.strictEqual(api.getState().settings.demandIdx, 3, 'Expected Flooded demand on Ch. 4 Preset 2');
  assert.strictEqual(api.getState().settings.wipIdx, 3, 'Expected Uncapped WIP on Ch. 4 Preset 2');

  idElements.wipSlider.value = '1'; // Tight (3)
  idElements.wipSlider.dispatchEvent('input');
  assert(
    idElements.impactBar.classList.contains('is-tradeoff') &&
      idElements.impactBar.classList.contains('tone-good') &&
      idElements.impactPills.innerHTML.includes('WIP cap: Tight (3)') &&
      idElements.impactPills.innerHTML.includes('Extra requests wait outside'),
    'Expected Tight (3) WIP limit to surface Gain (WIP cap: Tight (3)) and Cost (Extra requests wait outside), got: ' +
      idElements.impactPills.innerHTML
  );
  assert.strictEqual(
    api.getState().spotlightZoneTones.queueTesting,
    'good',
    'Expected queueTesting spotlight ring to glow green when tightening WIP limit'
  );
  idElements.resetBtn.dispatchEvent('click');

  let peakQueueTight = 0;
  let peakInFlightTight = 0;
  const tightSt = runSeconds(95, function (frame) {
    if (frame.queueCount > peakQueueTight) peakQueueTight = frame.queueCount;
    if (frame.inFlightCount > peakInFlightTight) peakInFlightTight = frame.inFlightCount;
  });
  assert(peakInFlightTight <= 3, 'Expected Tight (3) WIP limit to cap total in-flight bets at <=3, peak was ' + peakInFlightTight);
  assert(peakQueueTight <= 2, 'Expected Tight (3) WIP limit under Flooded demand to bound queues (<=2), peak was ' + peakQueueTight);
  const tightFit = avgFit(tightSt.history);
  assert(tightFit >= 72, 'Expected Tight (3) WIP limit under Flooded demand to restore fresh market fit (>=72%), got ' + tightFit.toFixed(1) + '%');

  // 2. Slow downstream stages (Exhaustive Discovery + Large batch Build) under Tight (3) never accumulate >2 queued items (unlike old Controlled maxWip: 12)
  idElements.discoverySlider.value = '2'; // Exhaustive (3.8s)
  idElements.discoverySlider.dispatchEvent('input');
  idElements.buildSlider.value = '2'; // Large batch (3.8s)
  idElements.buildSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  let peakSlowQueue = 0;
  runSeconds(60, function (frame) {
    if (frame.queueCount > peakSlowQueue) peakSlowQueue = frame.queueCount;
  });
  assert(peakSlowQueue <= 2, 'Expected Tight (3) WIP limit to hold queues <=2 even with slow stations, peak was ' + peakSlowQueue);

  // 3. Raising Incoming demand from Steady -> Flooded highlights queue trays green when WIP is Tight (3), and red when WIP is Uncapped
  api.applyChapter(4);
  idElements.wipSlider.value = '1'; // Tight (3)
  idElements.wipSlider.dispatchEvent('input');
  idElements.demandSlider.value = '1'; // Steady
  idElements.demandSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  idElements.demandSlider.value = '3'; // Flooded
  idElements.demandSlider.dispatchEvent('input');
  assert.strictEqual(api.getState().spotlightZoneTones.worldLeft, 'warn', 'Expected worldLeft amber tone on Flooded demand');
  assert.strictEqual(
    api.getState().spotlightZoneTones.queueTesting,
    'good',
    'Expected queueTesting green tone when Tight (3) WIP cap shields queues from Flooded demand'
  );
  assert(
    idElements.impactPills.innerHTML.includes('WIP cap (3) holds queues'),
    'Expected demand impact bar to report WIP cap (3) holds queues'
  );

  idElements.wipSlider.value = '3'; // Uncapped
  idElements.wipSlider.dispatchEvent('input');
  idElements.demandSlider.value = '1'; // Steady
  idElements.demandSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  idElements.demandSlider.value = '3'; // Flooded
  idElements.demandSlider.dispatchEvent('input');
  assert.strictEqual(
    api.getState().spotlightZoneTones.queueTesting,
    'bad',
    'Expected queueTesting red tone when Flooded demand hits Uncapped WIP'
  );

  // 4. World Ch. 4 badge appears on Ch. 4 (Incoming demand) and Ch. 7 (Shock probability), hidden elsewhere
  api.applyChapter(4);
  assert(!idElements.worldNewBadge.classList.contains('is-hidden') && idElements.worldNewBadge.textContent === 'Ch. 4', 'Expected Ch. 4 badge on Outside World block');
  api.applyChapter(5);
  assert(idElements.worldNewBadge.classList.contains('is-hidden'), 'Expected Outside World badge hidden on Ch. 5');
  api.applyChapter(7);
  assert(!idElements.worldNewBadge.classList.contains('is-hidden') && idElements.worldNewBadge.textContent === 'Ch. 7', 'Expected Ch. 7 badge on Outside World block');

  api.applyChapter(1);
});

check('R1.1: Real Users keeps solid-blue live-need identity, overlays dashed Spec on non-Rollout misses, and tags Stale / Wrong Spec / Build defect', function () {
  const M = global.window.CyberneticModel;
  api.setViewMode('product');
  idElements.simCanvas._trackPolarStrokes = true;
  try {
    // 1. Idle Real Users matches Outside World solid-blue silhouette (#1d4ed8, dash=[]) rather than grey dashed
    api.applyChapter(1);
    api.step(0);
    const idleRightStrokes = (idElements.simCanvas._polarStrokes || []).filter(function (s) {
      return s.cx > 945;
    });
    assert.strictEqual(idleRightStrokes.length, 1, 'Expected 1 polar silhouette stroke inside idle Real Users');
    assert.strictEqual(idleRightStrokes[0].strokeStyle, '#1d4ed8', 'Expected idle Real Users live-need stroke to be solid blue #1d4ed8');
    assert.strictEqual(idleRightStrokes[0].dash.length, 0, 'Expected idle Real Users live-need stroke to be solid (zero dash)');

    // Helper: advance until first landing in Real Users and inspect strokes + cause pill
    function stepUntilNextLanding(maxSteps) {
      M.sim.landing = null;
      for (let i = 0; i < (maxSteps || 450); i++) {
        api.step(0.04);
        if (M.sim.landing) return M.sim.landing;
      }
      assert.fail('Expected work item to land in Real Users within ' + (maxSteps || 450) + ' steps');
    }

    // 2. Stale miss (Ch. 1 Analysis paralysis): solid blue live need + solid dark Built + dashed blue Spec + "Stale (market shifted)!" pill
    api.applyChapter(1);
    const staleLanding = stepUntilNextLanding(350);
    assert.strictEqual(staleLanding.missCause, 'stale', 'Expected Ch. 1 Analysis paralysis missCause === "stale"');
    const staleStrokes = (idElements.simCanvas._polarStrokes || []).filter(function (s) { return s.cx > 945; });
    assert(
      staleStrokes.some(function (s) { return s.strokeStyle === '#1d4ed8' && s.dash.length === 0; }),
      'Expected landed Real Users to draw live market need in solid blue #1d4ed8'
    );
    assert(
      staleStrokes.some(function (s) { return s.strokeStyle === '#0f172a' && s.dash.length === 0; }),
      'Expected landed Real Users to draw Built product in solid dark #0f172a'
    );
    assert(
      staleStrokes.some(function (s) { return s.strokeStyle === '#2563eb' && s.dash.length === 2; }),
      'Expected non-Rollout miss in Real Users to overlay dashed blue Spec (#2563eb)'
    );
    assert(
      !staleStrokes.some(function (s) { return s.strokeStyle === '#64748b'; }),
      'Expected zero legacy grey dashed #64748b strokes in Real Users'
    );
    const stalePill = (idElements.simCanvas._canvasTexts || []).find(function (t) {
      return t.text === 'Stale (market shifted)!';
    });
    assert(
      stalePill && stalePill.y >= 210 && stalePill.y <= 230,
      'Expected "Stale (market shifted)!" pill in lower bay clear of cy=150 and bottom Fit caption (y=248)'
    );

    // Cybernetics view translates the landed cause pill immediately on view switch
    api.setViewMode('cybernetics');
    assert(
      (idElements.simCanvas._canvasTexts || []).some(function (t) { return t.text === 'Stale (env drifted)!'; }),
      'Expected Cybernetics view to render "Stale (env drifted)!"'
    );
    api.setViewMode('product');

    // 3. Wrong Spec miss (Ch. 3 default: Strict testing on wrong Spec): "Wrong Spec!" right above "Test ✓ · Fit XX%"
    api.applyChapter(3);
    const specLanding = stepUntilNextLanding(350);
    assert.strictEqual(specLanding.missCause, 'spec', 'Expected Ch. 3 default missCause === "spec"');
    const ch3Texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
    assert(ch3Texts.includes('Wrong Spec!'), 'Expected "Wrong Spec!" pill on Ch. 3 wrong-Spec landing');
    assert(
      ch3Texts.some(function (tx) { return tx.indexOf('Test \u2713 \u00b7 Fit ') === 0; }),
      'Expected "Test ✓ · Fit XX%" caption beneath "Wrong Spec!" pill on Ch. 3'
    );

    // 4. Escaped Build defect miss (Ch. 6 Preset 3: Escaped bug: isolates Build hotfix): Pass-1 flop tags "Build defect!"
    api.applyPreset(6, 3);
    let sawBuildDefectLanding = false;
    for (let attempt = 0; attempt < 6; attempt++) {
      const lnd = stepUntilNextLanding(350);
      if (lnd.fitPct < 65) {
        assert.strictEqual(lnd.missCause, 'build', 'Expected escaped Build bug landing to classify missCause === "build"');
        const txs = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
        assert(txs.includes('Build defect!'), 'Expected "Build defect!" pill on escaped Build bug landing');
        sawBuildDefectLanding = true;
        break;
      }
    }
    assert(sawBuildDefectLanding, 'Expected to observe escaped Build defect landing on Ch. 6 Preset 3');

    // 5. Healthy Green fit (Ch. 1 Nimble loop): zero missCause pill and zero dashed Spec clutter on >=75% launch
    api.applyPreset(1, 1);
    const cleanLanding = stepUntilNextLanding(250);
    assert(cleanLanding.fitPct >= 75 && cleanLanding.missCause === null, 'Expected Nimble loop landing to have null missCause');
    const cleanStrokes = (idElements.simCanvas._polarStrokes || []).filter(function (s) { return s.cx > 945; });
    assert(
      !cleanStrokes.some(function (s) { return s.dash.length > 0; }),
      'Expected clean Green landing to omit dashed Spec clutter'
    );

    // 6. Ch. 8 archetypes with Slight spin keep upstream miss badges & dashed Spec aligned with Outer Loop trueFault (1A)
    api.applyPreset(8, 1); // Feature Factory (Slight spin + wrong Spec)
    const ffLanding = stepUntilNextLanding(350);
    assert.strictEqual(ffLanding.missCause, 'spec', 'Expected Feature Factory landing to classify missCause === "spec" rather than "label"');
    const ffTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
    assert(
      ffTexts.includes('Wrong Spec!') && !ffTexts.some(function (tx) { return tx.indexOf('Label: "') === 0; }),
      'Expected Feature Factory Real Users bay to show "Wrong Spec!" instead of a Rollout label sticker'
    );
    const ffStrokes = (idElements.simCanvas._polarStrokes || []).filter(function (s) { return s.cx > 945; });
    assert(
      ffStrokes.some(function (s) { return s.strokeStyle === '#2563eb' && s.dash.length === 2; }),
      'Expected Feature Factory Real Users bay to keep dashed blue Spec overlay visible'
    );

    api.applyPreset(8, 3); // Ungoverned 10x Build (Slight spin + Testing queue staleness)
    let sawUngovernedStale = false;
    for (let i = 0; i < 600; i++) {
      api.step(0.04);
      if (M.sim.landing && M.sim.landing.missCause === 'stale') {
        const ugTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
        assert(
          ugTexts.includes('Stale (market shifted)!') && !ugTexts.some(function (tx) { return tx.indexOf('Label: "') === 0; }),
          'Expected Ungoverned 10x Build stale miss to show "Stale (market shifted)!" instead of a Rollout label sticker'
        );
        sawUngovernedStale = true;
        break;
      }
    }
    assert(sawUngovernedStale, 'Expected Ungoverned 10x Build to surface "Stale (market shifted)!" in Real Users once queue builds');

    api.applyPreset(8, 4); // Hype-Driven Rollout (clean Spec/Build + Pure hype)
    const hypeLanding = stepUntilNextLanding(350);
    assert.strictEqual(hypeLanding.missCause, 'label', 'Expected Hype-Driven Rollout landing to classify missCause === "label"');
    const hypeTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
    assert(
      hypeTexts.some(function (tx) { return tx.indexOf('Label: "') === 0; }),
      'Expected Hype-Driven Rollout Real Users bay to retain "Label: \\"...\\"!" sticker'
    );
  } finally {
    idElements.simCanvas._trackPolarStrokes = false;
    api.setViewMode('product');
    api.applyChapter(1);
  }
});

check('R1.2: Intake WIP gate (Flow & WIP / System 2) in Ch. 4+ and Governance (System 5) header in Ch. 8 render cleanly on canvas', function () {
  api.setViewMode('product');

  // 1. Chapters 1 to 3 stay strictly free of WIP gate and Ch. 8 Governance header
  [1, 2, 3].forEach(function (chNum) {
    api.applyChapter(chNum);
    api.step(0);
    const txs = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
    assert(
      !txs.some(function (tx) {
        return tx === 'WIP CAP' || tx === 'NO CAP' || tx === 'SYS 2' || tx.includes('Governance:');
      }),
      'Expected Ch. ' + chNum + ' canvas to omit Ch. 4+ WIP gate and Ch. 8 Governance header'
    );
  });

  // 2. Chapter 4 default (Uncapped WIP) renders "NO CAP" + "1/∞" -> grows to "N/∞", and tightening WIP to Tight (3) renders "WIP CAP" + "N/3"
  api.applyChapter(4);
  api.step(0);
  let ch4Texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    ch4Texts.includes('NO CAP') && ch4Texts.some(function (tx) { return /\/\u221e$/.test(tx); }),
    'Expected Ch. 4 Uncapped default to render "NO CAP" and "N/∞" on intake WIP gate, got: ' + ch4Texts.join(' | ')
  );
  assert(
    !ch4Texts.some(function (tx) { return tx.includes('Governance:'); }),
    'Expected Ch. 4 canvas to omit Ch. 8 Governance header'
  );

  idElements.wipSlider.value = '1'; // Tight (3)
  idElements.wipSlider.dispatchEvent('input');
  runSeconds(8);
  ch4Texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    ch4Texts.includes('WIP CAP') && ch4Texts.includes('3/3'),
    'Expected Ch. 4 Tight (3) WIP under Busy demand to render "WIP CAP" and "3/3" on intake WIP gate, got: ' + ch4Texts.join(' | ')
  );
  assert.strictEqual(
    api.getState().spotlightZoneTones.wipGate,
    'good',
    'Expected wipGate spotlight zone to glow green when tightening WIP limit'
  );

  api.setViewMode('cybernetics');
  const ch4CyberTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    ch4CyberTexts.includes('SYS 2') && !ch4CyberTexts.includes('WIP CAP'),
    'Expected Cybernetics view WIP gate to render "SYS 2"'
  );
  api.setViewMode('product');

  // 3. Chapter 8 renders overarching Governance / System 5 header in Product and Cybernetics views, and yields cleanly to Andon flash on shock
  api.applyChapter(8);
  api.step(0);
  const ch8ProdTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    ch8ProdTexts.some(function (tx) { return tx.includes('Governance: Purpose, Value & Risk Appetite') && tx.includes('Andon armed'); }),
    'Expected Ch. 8 Product view canvas to render overarching Governance header, got: ' + ch8ProdTexts.join(' | ')
  );
  assert(
    !ch8ProdTexts.some(function (tx) { return tx.includes('System 5'); }),
    'Expected Ch. 8 Product view canvas to stay free of VSM numbering'
  );

  api.setViewMode('cybernetics');
  const ch8CyberTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    ch8CyberTexts.some(function (tx) { return tx.includes('System 5 Governance: Policy & Sys 3/4 Homeostat'); }) &&
      ch8CyberTexts.includes('SYS 2'),
    'Expected Ch. 8 Cybernetics view canvas to render System 5 Governance + SYS 2 together (Systems 1..5 all visible)'
  );

  // Firing a shock temporarily yields the top lane to ALGEDONIC INTERRUPT without overlapping System 5 Governance text
  runSeconds(6);
  idElements.topShockBtn.dispatchEvent('click');
  api.step(0);
  const ch8FlashTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    ch8FlashTexts.some(function (tx) { return tx.includes('ALGEDONIC INTERRUPT'); }) &&
      !ch8FlashTexts.some(function (tx) { return tx.includes('System 5 Governance:'); }),
    'Expected acute algedonic flash to pre-empt top lane cleanly without overlapping System 5 Governance pill'
  );

  api.setViewMode('product');
  api.applyChapter(1);
});

check('R1.3: Idle Discovery in Ch. 2+ keeps last captured-need vs dashed-Spec blueprint softly pinned while downstream stages run', function () {
  const M = global.window.CyberneticModel;
  api.setViewMode('product');

  // 1. Chapter 1 keeps idle Discovery free of pinned-blueprint traces
  api.applyChapter(1);
  idElements.discoverySlider.value = '0'; // Thin slice (0.8s)
  idElements.discoverySlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  runSeconds(1.5); // Past 0.32s sense + 0.8s Discovery -> item is now inside Build, Discovery is idle
  assert.strictEqual(M.sim.stations.discovery.active, null, 'Expected Discovery idle at t=1.5s on Ch. 1');
  const ch1Texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    ch1Texts.includes('Snapshots market') && !ch1Texts.includes('Warped Spec!'),
    'Expected Ch. 1 idle Discovery to show "Snapshots market" rather than a pinned blueprint'
  );

  // 2. Chapters 2 and 3 (Thin slice 0.8s): after the bet leaves Discovery into Build/Testing, capturedWorldRadii + dashed Spec + "Warped Spec!" stay pinned in Discovery
  [2, 3].forEach(function (chNum) {
    api.applyChapter(chNum);
    idElements.simCanvas._trackPolarStrokes = true;
    try {
      runSeconds(1.6); // Bet finished 0.8s Discovery and is now downstream in Build/Testing while Discovery is idle
      assert.strictEqual(M.sim.stations.discovery.active, null, 'Expected Discovery idle at t=1.6s on Ch. ' + chNum);
      assert(M.sim.lastDiscoveryTrace && M.sim.lastDiscoveryTrace.hadDiscoveryWarp, 'Expected lastDiscoveryTrace recorded with warp on Ch. ' + chNum);

      const discCx = chNum === 2 ? 421 : 347;
      const discStrokes = (idElements.simCanvas._polarStrokes || []).filter(function (s) {
        return Math.abs(s.cx - discCx) < 25;
      });
      assert(
        discStrokes.length >= 2 &&
          discStrokes.some(function (s) { return s.dash.length === 0; }) &&
          discStrokes.some(function (s) { return s.strokeStyle === '#2563eb' && s.dash.length === 2; }),
        'Expected idle Discovery on Ch. ' + chNum + ' to keep both solid capturedWorldRadii and dashed #2563eb Spec pinned, got ' + discStrokes.length + ' strokes'
      );
      const txs = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
      assert(
        txs.includes('Warped Spec!') && !txs.includes('Snapshots market'),
        'Expected idle Discovery on Ch. ' + chNum + ' to keep "Warped Spec!" caption visible while downstream stages run'
      );
    } finally {
      idElements.simCanvas._trackPolarStrokes = false;
    }
  });

  // 3. Hovering a Discovery control while Discovery is idle overrides the pinned trace with live empty-station preview
  api.applyChapter(2);
  runSeconds(1.6);
  idElements.discoveryDampenerToggle.checked = true;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  const previewTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    previewTexts.includes('Observed (+1.8d)'),
    'Expected active Discovery control edit to override pinned trace with live Observed (+1.8d) preview'
  );

  // 4. Reset clears lastDiscoveryTrace cleanly
  idElements.resetBtn.dispatchEvent('click');
  assert.strictEqual(M.sim.lastDiscoveryTrace, null, 'Expected Reset to clear lastDiscoveryTrace');

  api.applyChapter(1);
});

check('R4.1: Ch. 8 Product view offers Start Chapter 1 in Cybernetics view bridge, and Cybernetics view pairs VSM terms with product anchors', function () {
  api.setViewMode('product');
  api.applyChapter(8);

  // 1. Ch. 8 Product view shows "Start Chapter 1 in Cybernetics view ->" in #nextChapterBtn (jargon-free) and clicking it switches to Cybernetics view on Chapter 1
  assert(
    !idElements.nextChapterBtn.classList.contains('is-hidden') &&
      idElements.nextChapterBtn.textContent === 'Start Chapter 1 in Cybernetics view \u2192',
    'Expected Ch. 8 Product view #nextChapterBtn to offer "Start Chapter 1 in Cybernetics view ->", got: ' +
      idElements.nextChapterBtn.textContent
  );

  idElements.nextChapterBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().settings.viewMode, 'cybernetics', 'Expected bridge click to switch viewMode to cybernetics');
  assert.strictEqual(api.getState().settings.chapter, 1, 'Expected bridge click to open Chapter 1 in Cybernetics view');
  assert(
    idElements.chapterHeading.textContent.includes('Relaxation Time'),
    'Expected Chapter 1 Cybernetics heading after bridge click, got: ' + idElements.chapterHeading.textContent
  );
  assert(
    !idElements.nextChapterBtn.classList.contains('is-hidden') &&
      idElements.nextChapterBtn.textContent === 'Next: Chapter 2 (Transducers) \u2192',
    'Expected #nextChapterBtn on Ch. 1 Cybernetics view to step to Chapter 2 (Transducers)'
  );

  // On Ch. 8 in Cybernetics view, #nextChapterBtn hides cleanly
  api.applyChapter(8);
  assert(
    idElements.nextChapterBtn.classList.contains('is-hidden'),
    'Expected #nextChapterBtn to hide on Ch. 8 once inside Cybernetics view'
  );

  // 2. Cybernetics view visual legend, block headers, safeguard titles, and chapter prose include concise product anchors
  assert(idElements.legendNeedText.textContent.includes('(market need)'), 'Expected Cybernetics legendNeed anchor');
  assert(idElements.legendSpecText.textContent.includes('(Spec)'), 'Expected Cybernetics legendSpec anchor');
  assert(idElements.legendBuiltText.textContent.includes('(built product)'), 'Expected Cybernetics legendBuilt anchor');
  assert(idElements.discoveryDampenerTitle.textContent.includes('(watch users & check Spec)'), 'Expected Discovery safeguard anchor');
  assert(idElements.buildDampenerTitle.textContent.includes('(pairing in Build)'), 'Expected Build safeguard anchor');
  assert(idElements.rolloutDampenerTitle.textContent.includes('(verify messaging & docs)'), 'Expected Rollout safeguard anchor');
  assert(idElements.diagnosticChannelTitle.textContent.includes('(watch users)'), 'Expected Diagnostic safeguard anchor');
  assert(idElements.andonCordTitle.textContent.includes('(Andon cord on shock)'), 'Expected Algedonic safeguard anchor');

  const chapters = api.getChapters();
  assert(chapters[1].cyberneticsHtml.includes('(adaptation time)'), 'Expected Ch. 1 relaxation time product anchor');
  assert(chapters[2].cyberneticsHtml.includes('pairing during Build'), 'Expected Ch. 2 synchronous redundancy product anchor');
  assert(chapters[3].cyberneticsHtml.includes('post-build Testing'), 'Expected Ch. 3 System 3* product anchor');
  assert(chapters[4].cyberneticsHtml.includes('Flow &amp; WIP'), 'Expected Ch. 4 System 2 product anchor');
  assert(chapters[5].cyberneticsHtml.includes('Rollout: positioning, docs, and onboarding'), 'Expected Ch. 5 variety amplification product anchor');
  assert(chapters[6].cyberneticsHtml.includes('watching real users post-launch'), 'Expected Ch. 6 diagnostic channel product anchor');
  assert(chapters[7].cyberneticsHtml.includes('Andon cord'), 'Expected Ch. 7 algedonic channel product anchor');

  // Flipping back to Product view on Ch. 8 restores the bridge button cleanly
  idElements.productViewBtn.dispatchEvent('click');
  assert(
    !idElements.nextChapterBtn.classList.contains('is-hidden') &&
      idElements.nextChapterBtn.textContent === 'Start Chapter 1 in Cybernetics view \u2192',
    'Expected switching back to Product view on Ch. 8 to restore #nextChapterBtn bridge'
  );

  api.applyChapter(1);
});

check('R2.3: Working-day readouts (1s = 2d), wall-clock Tactical Pause, and Ch. 3 proactive Quality Assurance vs post-build Testing', function () {
  const C = global.window.CyberneticContent;
  const M = global.window.CyberneticModel;
  assert.strictEqual(C.SIM_DAYS_PER_SEC, 2, 'Expected SIM_DAYS_PER_SEC === 2');
  assert.strictEqual(M.formatSimDays(0.9), '1.8d');
  assert.strictEqual(M.formatCompactSimDays(0.18), '0.36d');
  assert.strictEqual(M.formatSignedSimDays(-6.0), '-12.0d');

  // 1. Clock bar, canvas station badges, and history chip lead-time tooltips report simulated days (d)
  api.setViewMode('product');
  api.applyChapter(1);
  assert.strictEqual(idElements.clockValue.textContent, '0.0d');
  assert.strictEqual(idElements.loopTimeValue.textContent, '19.7d');
  assert.strictEqual(idElements.worldCycleValue.textContent, '10.8d');
  const ch1CanvasTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    ch1CanvasTexts.includes('13.6d') && ch1CanvasTexts.includes('3.6d'),
    'Expected Ch. 1 Paralysis + Medium batch canvas badges 13.6d and 3.6d, got: ' + ch1CanvasTexts.join(' | ')
  );

  api.tickFrame(0.05);
  api.tickFrame(0.05);
  assert(idElements.clockValue.textContent.endsWith('d'), 'Expected advancing clock readout to end with d');
  runSeconds(11);
  assert(
    idElements.historyStrip.innerHTML.includes('lead ') &&
      /\[lead [0-9]+\.[0-9]d/.test(idElements.historyStrip.innerHTML),
    'Expected history chip tooltip to report lead time in simulated days (d)'
  );

  // 2. Switching off Watch real users (-1.8d), Guided onboarding (-1d), and Diagnostic channel (-0.7d) classifies time savings under Gain
  api.applyPreset(2, 1); // Observed + paired (discoveryDampener = true)
  assert.strictEqual(idElements.discoveryRegime.textContent, 'Thin slice (+1.8d)');
  idElements.discoveryDampenerToggle.checked = false;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  assert(
    /tradeoff-gain">[\s\S]*?Discovery -1\.8d[\s\S]*?tradeoff-cost">/.test(idElements.impactPills.innerHTML),
    'Expected Discovery -1.8d to appear under Gain when unchecking Watch real users, got: ' + idElements.impactPills.innerHTML
  );
  // Tactical pause button remains in wall-clock seconds ("Resume (3s)") rather than days
  assert.strictEqual(idElements.playPauseBtn.textContent, 'Resume (3s)');

  api.applyPreset(5, 2); // Guided onboarding ON
  idElements.rolloutDampenerToggle.checked = false;
  idElements.rolloutDampenerToggle.dispatchEvent('change');
  assert(
    /tradeoff-gain">[\s\S]*?Rollout -1d[\s\S]*?tradeoff-cost">/.test(idElements.impactPills.innerHTML),
    'Expected Rollout -1d to appear under Gain when unchecking Guided onboarding, got: ' + idElements.impactPills.innerHTML
  );

  api.applyChapter(3);
  const ch3Story = idElements.chapterStory.innerHTML;
  assert(
    ch3Story.includes('proactive <strong>Quality Assurance</strong>') &&
      ch3Story.includes('post-build <strong>Testing</strong> only inspects finished work at the pass'),
    'Expected Ch. 3 Product view story to distinguish upstream proactive Quality Assurance from post-build Testing'
  );
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  const offTestTexts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(offTestTexts.includes('Off (0d)'), 'Expected bypassed Testing box to render Off (0d)');

  api.applyChapter(1);
});

check('3A & 2A: Pair during Build halves parallel Build WIP (2 -> 1) and Rollout reach graduates rollout time (0.3d..1.1d)', function () {
  const M = global.window.CyberneticModel;
  api.setViewMode('product');

  // 1. Copy & label check: Pair during Build (2 people, zero "mob" or "2 to 3" in UI/HTML)
  const contentJsText = fs.readFileSync(path.join(dir, 'content.js'), 'utf8');
  api.applyChapter(2);
  assert.strictEqual(idElements.buildDampenerTitle.textContent, 'Pair during Build');
  assert(
    !/\bmob(?:bing|bed|s)?\b/i.test(htmlSource) &&
      !htmlSource.includes('2 to 3') &&
      !/\bmob(?:bing|bed|s)?\b/i.test(contentJsText) &&
      !contentJsText.includes('2 to 3'),
    'Expected simulator HTML and content.js to anchor pairing strictly to 2 people without "mob" or "2 to 3"'
  );

  // Ch. 2-3 (1-item pipeline) shows "2 people on 1 bet" under Cost: when Pair is turned ON
  idElements.buildDampenerToggle.checked = true;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert(
    idElements.impactPills.innerHTML.includes('2 people on 1 bet') &&
      !idElements.impactPills.innerHTML.includes('tradeoff-cost"><span class="tradeoff-kicker">Cost:</span><span class="tradeoff-empty">None</span>'),
    'Expected Ch. 2 Pair ON to list "2 people on 1 bet" under Cost:, got: ' + idElements.impactPills.innerHTML
  );

  // 2. Ch. 4+ concurrent flow: solo runs up to 2 parallel Build items ("2/2 solo"), paired runs 1 at a time ("Build WIP 2 -> 1")
  api.applyChapter(4);
  idElements.demandSlider.value = '2'; // Busy (2.1d)
  idElements.demandSlider.dispatchEvent('input');
  idElements.wipSlider.value = '2'; // Loose (12)
  idElements.wipSlider.dispatchEvent('input');
  idElements.discoverySlider.value = '0'; // Thin slice (1.6d)
  idElements.discoverySlider.dispatchEvent('input');
  idElements.buildSlider.value = '1'; // Medium batch (3.6d)
  idElements.buildSlider.dispatchEvent('input');
  idElements.build10xToggle.checked = false;
  idElements.build10xToggle.dispatchEvent('change');
  idElements.buildNoiseSlider.value = '0'; // 0% noise to isolate pure parallel WIP trade-off
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.testingSlider.value = '0'; // Testing Off
  idElements.testingSlider.dispatchEvent('input');
  idElements.buildDampenerToggle.checked = false; // Solo (2 slots)
  idElements.buildDampenerToggle.dispatchEvent('change');
  idElements.resetBtn.dispatchEvent('click');

  assert.strictEqual(api.getState().effective.buildConcurrency, 2, 'Expected solo Build in Ch. 4+ to have concurrency 2');
  let sawDualSoloOnCanvas = false;
  let soloLaunches = 0;
  let lastSoloLnd = null;
  for (let i = 0; i < 60 / 0.04; i++) {
    api.step(0.04);
    if (M.sim.stations.build.active && M.sim.stations.build.secondary) {
      const txs = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
      if (txs.includes('2/2 solo')) sawDualSoloOnCanvas = true;
    }
    if (M.sim.landing && M.sim.landing !== lastSoloLnd) {
      lastSoloLnd = M.sim.landing;
      soloLaunches += 1;
    }
  }
  assert(sawDualSoloOnCanvas, 'Expected Build bay to render "2/2 solo" when two solo items build concurrently');

  // Turning Pair ON mid-flight demotes secondary item to Build queue and shows "Build WIP 2 -> 1 (2 people per bet)" Cost
  if (!M.sim.stations.build.secondary) {
    // Ensure 2 items in Build before toggling
    idElements.demandSlider.value = '3';
    idElements.demandSlider.dispatchEvent('input');
    for (let k = 0; k < 120 && !M.sim.stations.build.secondary; k++) api.step(0.04);
    idElements.demandSlider.value = '2';
    idElements.demandSlider.dispatchEvent('input');
  }
  const hadSecondary = Boolean(M.sim.stations.build.secondary);
  idElements.buildDampenerToggle.checked = true;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert.strictEqual(api.getState().effective.buildConcurrency, 1, 'Expected paired Build to have concurrency 1');
  assert.strictEqual(M.sim.stations.build.secondary, null, 'Expected secondary Build slot to clear immediately when Pair turns ON');
  if (hadSecondary) {
    assert(M.sim.stations.build.queue.length >= 1, 'Expected demoted secondary Build item to wait at front of Build queue');
  }
  assert(
    idElements.impactPills.innerHTML.includes('Build WIP 2 \u2192 1 (2 people per bet)'),
    'Expected Ch. 4+ Pair ON to show "Build WIP 2 -> 1 (2 people per bet)" Cost pill, got: ' + idElements.impactPills.innerHTML
  );

  // Measure paired throughput over identical 60s window in 0%-noise Busy regime: solo finishes more raw bets than paired
  idElements.resetBtn.dispatchEvent('click');
  let pairedLaunches = 0;
  let lastPairedLnd = null;
  for (let i = 0; i < 60 / 0.04; i++) {
    api.step(0.04);
    if (M.sim.landing && M.sim.landing !== lastPairedLnd) {
      lastPairedLnd = M.sim.landing;
      pairedLaunches += 1;
    }
  }
  assert(
    soloLaunches > pairedLaunches + 4,
    'Expected 2 solo streams (' + soloLaunches + ') to ship more raw bets than 1 pair (' + pairedLaunches + ') under 0% noise & Busy demand'
  );

  // 3. Rollout reach graduated durations (0.3d / 0.5d / 0.8d / 1.1d) & Gain/Cost pills
  api.applyChapter(5);
  idElements.rolloutDampenerToggle.checked = false;
  idElements.rolloutDampenerToggle.dispatchEvent('change');
  const expectedRolloutDays = [0.3, 0.5, 0.8, 1.1];
  expectedRolloutDays.forEach(function (dVal, idx) {
    idElements.reachSlider.value = String(idx);
    idElements.reachSlider.dispatchEvent('input');
    const actualDays = api.getState().effective.rolloutSec * 2;
    assert(
      Math.abs(actualDays - dVal) < 0.01 && idElements.reachRegime.textContent.includes(dVal.toFixed(1) + 'd'),
      'Expected reachIdx=' + idx + ' rollout time ' + dVal.toFixed(1) + 'd, got ' + actualDays.toFixed(2) + 'd (' + idElements.reachRegime.textContent + ')'
    );
  });

  // Stepping reach UP (Narrow 0.5d -> Full 1.1d) reports Rollout +0.6d under Cost:
  idElements.reachSlider.value = '1';
  idElements.reachSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  idElements.reachSlider.value = '3';
  idElements.reachSlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('Market reach 60% \u2192 100%') &&
      idElements.impactPills.innerHTML.includes('Rollout +0.6d'),
    'Expected Narrow -> Full reach to show Gain: Market reach 60% -> 100% and Cost: Rollout +0.6d, got: ' + idElements.impactPills.innerHTML
  );

  // Stepping reach DOWN (Full 1.1d -> Broad 0.8d) reports Rollout -0.3d under Gain:
  idElements.resetBtn.dispatchEvent('click');
  idElements.reachSlider.value = '2';
  idElements.reachSlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('Rollout -0.3d') &&
      idElements.impactPills.innerHTML.includes('Market reach 100% \u2192 85%'),
    'Expected Full -> Broad reach to show Gain: Rollout -0.3d and Cost: Market reach 100% -> 85%, got: ' + idElements.impactPills.innerHTML
  );

  api.applyChapter(1);
});

check('3B: Testing thoroughness Gain/Cost readouts distinguish defect rescue, zero-noise cost, and looser checks', function () {
  function splitLedger(html) {
    const costIdx = html.indexOf('tradeoff-cost');
    assert(costIdx > 0, 'Expected both tradeoff-gain and tradeoff-cost groups in: ' + html);
    return {
      gain: html.slice(0, costIdx),
      cost: html.slice(costIdx)
    };
  }

  api.setViewMode('product');

  // 1. Turning Testing UP under coding noise (Ch. 3 "Clean Spec + buggy Build": Off -> Strict)
  api.applyPreset(3, 1); // Heavy build noise, Strict testing
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  idElements.testingSlider.value = '3';
  idElements.testingSlider.dispatchEvent('input');
  let ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Catches Build defects (Strict)') &&
      ledger.cost.includes('Testing +2.8d') &&
      ledger.cost.includes('Loop ') &&
      ledger.cost.includes('Blind to wrong Spec') &&
      !ledger.gain.includes('None'),
    'Expected Off -> Strict under coding noise to report Gain: Catches Build defects (Strict) and Cost: Testing +2.8d + Loop + Blind to wrong Spec, got: ' +
      idElements.impactPills.innerHTML
  );

  // Cybernetics view translation on the same committed edit
  api.setViewMode('cybernetics');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Catches Sys 1 defects (Strict)') &&
      ledger.cost.includes('Audit +2.8d') &&
      ledger.cost.includes('Blind to Sys 4 error'),
    'Expected Cybernetics view to translate Catches Sys 1 defects (Strict), Audit +2.8d, and Blind to Sys 4 error, got: ' +
      idElements.impactPills.innerHTML
  );
  api.setViewMode('product');

  // 2. Turning Testing UP at 0% coding noise reports Gain: None (0% baseline noise)
  idElements.buildNoiseSlider.value = '0';
  idElements.buildNoiseSlider.dispatchEvent('input');
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  idElements.testingSlider.value = '3';
  idElements.testingSlider.dispatchEvent('input');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('None (0% baseline noise)') &&
      ledger.cost.includes('Testing +2.8d') &&
      ledger.cost.includes('Loop ') &&
      ledger.cost.includes('Blind to wrong Spec') &&
      idElements.impactBar.classList.contains('tone-warn'),
    'Expected Off -> Strict at 0% coding noise to report Gain: None (0% baseline noise) and tone-warn, got: ' +
      idElements.impactPills.innerHTML
  );

  // 3. Turning Testing DOWN above Off (Strict -> Standard) vs to Off (Standard -> Off)
  api.applyPreset(3, 1); // Heavy build noise, Strict testing (2.8d)
  idElements.testingSlider.value = '2'; // Standard (1.8d)
  idElements.testingSlider.dispatchEvent('input');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Testing -1.0d') &&
      ledger.gain.includes('Loop ') &&
      ledger.cost.includes('Looser defect check (Standard)'),
    'Expected Strict -> Standard to show Gain: Testing -1.0d + Loop and Cost: Looser defect check (Standard), got: ' +
      idElements.impactPills.innerHTML
  );

  idElements.resetBtn.dispatchEvent('click');
  idElements.testingSlider.value = '0'; // Off
  idElements.testingSlider.dispatchEvent('input');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Testing -1.8d') &&
      ledger.cost.includes('Defects escape'),
    'Expected Standard -> Off to show Gain: Testing -1.8d and Cost: Defects escape, got: ' +
      idElements.impactPills.innerHTML
  );
  api.setViewMode('cybernetics');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Audit -1.8d') &&
      ledger.cost.includes('Sys 1 defects escape'),
    'Expected Cybernetics view Standard -> Off to show Audit -1.8d and Sys 1 defects escape, got: ' +
      idElements.impactPills.innerHTML
  );
  api.setViewMode('product');

  // 4. Ch. 6 escaped Build bug (Light -> Strict): catching bugs inside Testing shortens total loop (Loop drop in Gain)
  api.applyPreset(6, 3); // Escaped bug: Light testing (1.0d), Heavy build noise, Calm 48d market
  idElements.testingSlider.value = '3'; // Strict (2.8d)
  idElements.testingSlider.dispatchEvent('input');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Catches Build defects (Strict)') &&
      ledger.gain.includes('Loop ') &&
      ledger.cost.includes('Testing +1.8d') &&
      ledger.cost.includes('Blind to wrong Spec'),
    'Expected Ch. 6 Light -> Strict on escaped Build bug to list Loop speedup under Gain and Testing +1.8d under Cost, got: ' +
      idElements.impactPills.innerHTML
  );

  api.applyChapter(1);
});

check('3C: Shortening a stale adaptation loop places Loop speedup in green under Gain and keeps amber pace reminder until inside pace', function () {
  function splitLedger(html) {
    const costIdx = html.indexOf('tradeoff-cost');
    assert(costIdx > 0, 'Expected both tradeoff-gain and tradeoff-cost groups in: ' + html);
    return {
      gain: html.slice(0, costIdx),
      cost: html.slice(costIdx)
    };
  }

  api.setViewMode('product');

  // 1. Ch. 8 "Analysis Paralysis" (Loop ~37.5d vs 21.0d Moderate market, 0% Build noise):
  // Shrinking Build slice size from Large batch (7.6d) to Small slice (1.6d) shortens the loop yet leaves it > 21.0d
  api.applyPreset(8, 2); // Analysis Paralysis
  idElements.buildSlider.value = '0'; // Small slice (1.6d)
  idElements.buildSlider.dispatchEvent('input');

  let ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Build 7.6d \u2192 1.6d') &&
      ledger.gain.includes('impact-pill good">Loop ') &&
      !ledger.cost.includes('Loop ') &&
      ledger.cost.includes('Still slower than market') &&
      idElements.impactBar.classList.contains('tone-warn') &&
      api.getState().spotlightZoneTones.worldRight === 'warn',
    'Expected shortening a still-stale loop to place green Loop under Gain, Still slower than market under Cost, and amber tone-warn + worldRight, got: ' +
      idElements.impactPills.innerHTML
  );

  // Cybernetics view translates Still slower than market -> Lag still > cycle
  api.setViewMode('cybernetics');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('impact-pill good">Loop ') &&
      ledger.cost.includes('Lag still &gt; cycle'),
    'Expected Cybernetics view to show green Loop under Gain and Lag still > cycle under Cost, got: ' +
      idElements.impactPills.innerHTML
  );
  api.setViewMode('product');

  // 2. Second step in Analysis Paralysis: trimming Discovery from Paralysis (13.6d) to Thin slice (1.6d) brings Loop (~13.0d) well inside 21.0d pace
  idElements.resetBtn.dispatchEvent('click');
  idElements.discoverySlider.value = '0'; // Thin slice (1.6d)
  idElements.discoverySlider.dispatchEvent('input');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Discovery -12.0d') &&
      ledger.gain.includes('impact-pill good">Loop ') &&
      !ledger.cost.includes('Still slower') &&
      !ledger.cost.includes('Still crowding') &&
      idElements.impactBar.classList.contains('tone-good') &&
      api.getState().spotlightZoneTones.worldRight === 'good',
    'Expected bringing loop safely inside market pace to turn bar and worldRight green without remaining pace warning, got: ' +
      idElements.impactPills.innerHTML
  );

  // 3. Crowding band (90%..100% of market pace, 18.9d..21.0d):
  // Ch. 2 "Huge upfront spec" trap (21.0d market) with Watch real users ON (+1.8d) + Exhaustive (7.6d) + Large batch (7.6d) -> Loop = 19.5d
  api.applyPreset(2, 3); // "Huge upfront spec" trap: Moderate 21.0d market, Paralysis (13.6d), Medium batch (3.6d)
  idElements.discoveryDampenerToggle.checked = true;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  idElements.discoverySlider.value = '2'; // Exhaustive (7.6d)
  idElements.discoverySlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  idElements.buildSlider.value = '2'; // Large batch (7.6d) -> Loop = 19.5d (inside 18.9d..21.0d!)
  idElements.buildSlider.dispatchEvent('input');
  // Lengthening into >=90% pace still colours Loop red under Cost
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.cost.includes('impact-pill bad">Loop '),
    'Expected lengthening loop into >=90% market pace to keep red Loop under Cost, got: ' + idElements.impactPills.innerHTML
  );

  // Now raise Build to Mega-batch (12.4d -> Loop 24.3d) then step down to Large batch (Loop 19.5d, inside 18.9d..21.0d crowding band)
  idElements.buildSlider.value = '3';
  idElements.buildSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  idElements.buildSlider.value = '2';
  idElements.buildSlider.dispatchEvent('input');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('impact-pill good">Loop ') &&
      ledger.cost.includes('Still crowding market') &&
      idElements.impactBar.classList.contains('tone-warn'),
    'Expected shortening loop into 90%..100% band to show green Loop under Gain and Still crowding market under Cost, got: ' +
      idElements.impactPills.innerHTML
  );

  // 4. Tighter shock interval (< market cycle): shortening loop while still > shock interval warns Still slower than shocks
  api.applyChapter(7); // Moderate 21.0d market
  idElements.shockSlider.value = '3'; // Stormy (10.8d shocks)
  idElements.shockSlider.dispatchEvent('input');
  idElements.buildSlider.value = '2'; // Large batch -> Loop ~17.2d
  idElements.buildSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  idElements.buildSlider.value = '1'; // Medium batch -> Loop ~13.2d (still > 10.8d shocks)
  idElements.buildSlider.dispatchEvent('input');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('impact-pill good">Loop ') &&
      ledger.cost.includes('Still slower than shocks'),
    'Expected shortening loop while still slower than Stormy shocks to show Still slower than shocks under Cost, got: ' +
      idElements.impactPills.innerHTML
  );

  api.applyChapter(1);
});

check('4A: Cybernetics view diagram product anchors, System 3 locus, 4-station governance ticks, and VSM orientation', function () {
  const D = global.window.CyberneticDiagramView;
  const chapters = api.getChapters();

  // 1. Ch. 1 Cybernetics prose defines variety and explains regulatory-role VSM numbering (1..5)
  assert(
    chapters[1].cyberneticsHtml.includes('<strong>variety</strong> means the range of distinct states') &&
      chapters[1].cyberneticsHtml.includes('regulatory role rather than pipeline sequence'),
    'Expected Ch. 1 Cybernetics view orientation on variety and Systems 1..5 numbering'
  );

  // 2. Ch. 3 Cybernetics prose reconciles Beer sporadic spot-audit with per-release software Testing gate
  assert(
    chapters[3].cyberneticsHtml.includes('sporadic spot-audit') &&
      chapters[3].cyberneticsHtml.includes('per-release Testing gate'),
    'Expected Ch. 3 Cybernetics view reconciliation of sporadic System 3* audit vs per-release Testing gate'
  );

  // 3. Cybernetics view diagram anchors & System 3 Inner Loop locus across Ch. 3 and Ch. 6..8
  api.setViewMode('cybernetics');
  api.applyChapter(3);
  api.step(0);
  let texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert.strictEqual(idElements.testingBlockTitle.textContent, 'System 3 & 3*: Control & Audit (Testing)');
  assert(
    texts.includes('System 3 Inner Loop: Sys 3* rework (Sys 1 != Sys 4)'),
    'Expected Ch. 3 Cybernetics view Inner Loop to name System 3, got: ' + texts.join(' | ')
  );
  idElements.testingSlider.value = '0';
  idElements.testingSlider.dispatchEvent('input');
  texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    texts.includes('System 3 Inner Loop: Sys 3* audit (Off)'),
    'Expected Off Testing in Cybernetics view to show System 3 Inner Loop: Sys 3* audit (Off)'
  );

  // Outer Loop exit signs carry product anchors in Ch. 6..8 Cybernetics view
  api.applyChapter(6);
  api.step(0);
  texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  [
    'Update Sys 4 (Spec)',
    'Fix Sys 1 (Build)',
    'Fix transducer (Rollout)'
  ].forEach(function (rampLbl) {
    assert(
      texts.some(function (tx) { return tx.indexOf(rampLbl) === 0; }),
      'Expected Cybernetics view Outer Loop exit sign "' + rampLbl + '", got: ' + texts.join(' | ')
    );
  });

  // 4. Ch. 8 System 5 Governance bracket points ticks directly at the 4 governed stations (311, 499, 663, 827), never empty x=581
  api.applyChapter(8);
  api.step(0);
  const b8 = D.getSceneLayout().boxes;
  const expectedTickXs = [b8.discovery.cx, b8.build.cx, b8.testing.cx, b8.rollout.cx];
  const segs = idElements.simCanvas._canvasSegments || [];
  if (segs.length > 0) {
    const topTicks = segs.filter(function (s) {
      return Math.abs(s.x1 - s.x2) < 0.1 && Math.abs(s.y1 - 11) < 0.1 && Math.abs(s.y2 - 22) < 0.1;
    });
    assert.deepStrictEqual(
      topTicks.map(function (s) { return s.x1; }),
      expectedTickXs,
      'Expected Ch. 8 Governance bracket ticks at [311, 499, 663, 827], got: ' + JSON.stringify(topTicks)
    );
  }

  api.setViewMode('product');
  api.applyChapter(1);
});

check('5A: Ch. 7 default Trigger Shock Wave spirals reliably even when clicked in the first 24 wall-clock seconds', function () {
  api.setViewMode('product');

  // 1. Opening Ch. 7 starts steady flow mid-stride (3 items in flight across Discovery, Build, Rollout; Queue: 0; clock 0.0d)
  api.applyChapter(7);
  const openSt = api.getState();
  assert.strictEqual(idElements.clockValue.textContent, '0.0d', 'Expected Ch. 7 opening clock at 0.0d');
  assert.strictEqual(openSt.queueCount, 0, 'Expected Ch. 7 opening Queue: 0');
  assert.strictEqual(openSt.inFlightCount, 3, 'Expected Ch. 7 to open with 3 steady-flow bets mid-stride across stations');

  // 2. Clicking Trigger Shock Wave at early wall-clock moments (0.5s, 6s, 15s, 22s) without Andon cord reliably triggers a Discovery rework spiral (<62% fit)
  [0.5, 6.0, 15.0, 22.0].forEach(function (clickAtSec) {
    api.applyChapter(7);
    runSeconds(clickAtSec);
    idElements.topShockBtn.dispatchEvent('click');

    const jammed = runSeconds(60);
    assert(
      jammed.queues.discovery >= 6,
      'Expected Ch. 7 shock clicked at t=' + clickAtSec + 's to jam Discovery queue (>=6), got ' + jammed.queues.discovery
    );
    const jammedFit = avgFit(jammed.history);
    assert(
      jammedFit < 62,
      'Expected Ch. 7 shock clicked at t=' + clickAtSec + 's to degrade rolling fit <62%, got ' + jammedFit.toFixed(1) + '%'
    );
  });

  // 3. Immediate click on Preset 2 (Healthy flow + Andon cord armed) at t=0.5s flushes all 3 pre-shock bets with zero queue jam
  api.applyPreset(7, 1);
  runSeconds(0.5);
  idElements.topShockBtn.dispatchEvent('click');
  assert.strictEqual(api.getState().queueCount, 0, 'Expected immediate Andon shock at t=0.5s to keep Queue: 0');
  assert(api.getState().totalFlushedByAndon >= 3, 'Expected immediate Andon shock at t=0.5s to flush >=3 pre-shock bets');

  api.applyChapter(1);
});

check('5B: Overloaded bottleneck presets and 10x Build under uncapped WIP report steady-state bottleneck loop from 0.0d', function () {
  function splitLedger(html) {
    const costIdx = html.indexOf('tradeoff-cost');
    assert(costIdx > 0, 'Expected both tradeoff-gain and tradeoff-cost groups in: ' + html);
    return {
      gain: html.slice(0, costIdx),
      cost: html.slice(costIdx)
    };
  }

  api.setViewMode('product');

  // 1. Ch. 4 "Flooded backlog (even with zero bugs)" opens at 0.0d reporting bottlenecked loop + "(queues building)" + red stale badge (while Queue Trays still start at Queue: 0)
  api.applyChapter(4);
  idElements.experimentsRow.children[2].dispatchEvent('click'); // Flooded backlog (even with zero bugs)
  const openLoopDays = parseFloat(idElements.loopTimeValue.textContent);
  assert(
    openLoopDays >= 45 &&
      idElements.loopTimeValue.textContent.includes('(queues building)') &&
      idElements.stabilityBadge.textContent === 'Slower than market (stale!)' &&
      idElements.stabilityBadge.classList.contains('danger') &&
      idElements.impactBar.classList.contains('tone-bad') &&
      !idElements.impactPills.innerHTML.includes('impact-pill good">Adaptation loop'),
    'Expected Flooded backlog at 0.0d to report >=45d (queues building), red stale badge, and tone-bad preset bar, got loop=' +
      idElements.loopTimeValue.textContent +
      ', badge=' +
      idElements.stabilityBadge.textContent +
      ', pills=' +
      idElements.impactPills.innerHTML
  );
  assert.strictEqual(api.getState().queueCount, 0, 'Canvas queues must still start physically empty at 0.0d');

  // Once physical items fill the Testing queue, "(queues building)" hands over smoothly to "(queue N)"
  runSeconds(30);
  assert(
    api.getState().queues.testing >= 12 &&
      idElements.loopTimeValue.textContent.includes('(queue '),
    'Expected "(queues building)" to hand over to "(queue N)" once Testing queue fills, got: ' + idElements.loopTimeValue.textContent
  );

  // 2. Flipping 10x Build throughput ON under Uncapped WIP on Flooded backlog credits local Build speedup under Gain while placing red Loop under Cost
  api.applyPreset(4, 2); // Flooded backlog, 1x Small slice Build (1.6d), Strict Testing (2.8d), Uncapped WIP
  idElements.build10xToggle.checked = true;
  idElements.build10xToggle.dispatchEvent('change');
  let ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Build 1.6d \u2192 0.3d') &&
      !ledger.gain.includes('Loop ') &&
      ledger.cost.includes('1x Testing (2.8d) bottleneck') &&
      ledger.cost.includes('impact-pill bad">Loop '),
    'Expected 10x Build ON under uncapped Testing bottleneck to keep red Loop under Cost (never a fake green Loop speedup), got: ' +
      idElements.impactPills.innerHTML
  );

  // 3. Under Tight (3) WIP cap, flipping 10x Build throughput ON genuinely shortens Loop in green under Gain
  api.applyPreset(4, 2);
  idElements.wipSlider.value = '1'; // Tight (3)
  idElements.wipSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');
  idElements.build10xToggle.checked = true;
  idElements.build10xToggle.dispatchEvent('change');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Build 1.6d \u2192 0.3d') &&
      ledger.gain.includes('impact-pill good">Loop '),
    'Expected 10x Build ON under Tight (3) WIP cap to report genuine green Loop speedup under Gain, got: ' +
      idElements.impactPills.innerHTML
  );

  api.applyChapter(1);
});

check('1C: Outbound Rollout -> Real Users arrow shows Silent! / No amplify during Silent (25%) launch and restores Scale / Amplify above Silent', function () {
  api.setViewMode('product');
  api.applyPreset(5, 1); // Silent launch ("good code sells itself")
  api.step(0);
  let texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    texts.includes('Silent!') && !texts.includes('Scale'),
    'Expected Ch. 5 Silent launch outbound arrow to show "Silent!" instead of "Scale", got: ' + texts.join(' | ')
  );

  api.setViewMode('cybernetics');
  texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    texts.includes('No amplify') && !texts.includes('Amplify'),
    'Expected Cybernetics view Silent launch outbound arrow to show "No amplify" instead of "Amplify", got: ' + texts.join(' | ')
  );

  // Raising reach to Narrow (60%) restores Scale / Amplify
  idElements.reachSlider.value = '1';
  idElements.reachSlider.dispatchEvent('input');
  texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(texts.includes('Amplify') && !texts.includes('No amplify'), 'Expected Narrow reach to restore "Amplify"');

  api.setViewMode('product');
  texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(texts.includes('Scale') && !texts.includes('Silent!'), 'Expected Narrow reach in Product view to restore "Scale"');

  api.applyChapter(1);
});

check('1D: Since | readout in Launch history styles "|" with matching #db2777 magenta policy-divider-mark', function () {
  assert(
    /\.policy-divider-mark\s*\{[^}]*color:\s*#db2777;/i.test(cssSource),
    'Expected .policy-divider-mark CSS rule with matching #db2777 magenta colour'
  );
  api.setViewMode('product');
  api.applyChapter(2);
  runSeconds(6);
  idElements.discoveryDampenerToggle.checked = true;
  idElements.discoveryDampenerToggle.dispatchEvent('change');
  runSeconds(12);
  assert(
    idElements.historySummary.innerHTML.includes('Since <span class="policy-divider-mark">|</span>:'),
    'Expected #historySummary to wrap "|" inside .policy-divider-mark, got: ' + idElements.historySummary.innerHTML
  );
  api.applyChapter(1);
});

check('3D: Stepping Discovery or Build down from notch 4 to notch 3 omits upward-only Diminishing returns and Weakens pairing! warnings', function () {
  function splitLedger(html) {
    const costIdx = html.indexOf('tradeoff-cost');
    assert(costIdx > 0, 'Expected both tradeoff-gain and tradeoff-cost groups in: ' + html);
    return {
      gain: html.slice(0, costIdx),
      cost: html.slice(costIdx)
    };
  }

  api.setViewMode('product');

  // 1. Discovery: Paralysis (3) -> Exhaustive (2) omits "Diminishing returns", whereas Exhaustive (2) -> Paralysis (3) keeps it
  api.applyPreset(2, 3); // "Huge upfront spec" trap: Paralysis (3), Moderate Discovery noise (2)
  idElements.discoverySlider.value = '2'; // Exhaustive
  idElements.discoverySlider.dispatchEvent('input');
  let ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Discovery -6.0d') &&
      !idElements.impactPills.innerHTML.includes('Diminishing returns'),
    'Expected stepping Discovery down Paralysis -> Exhaustive to omit Diminishing returns, got: ' + idElements.impactPills.innerHTML
  );

  idElements.resetBtn.dispatchEvent('click');
  idElements.discoverySlider.value = '3'; // Back up to Paralysis
  idElements.discoverySlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('Diminishing returns'),
    'Expected stepping Discovery up Exhaustive -> Paralysis to keep Diminishing returns'
  );

  // 2. Build with Pair active: Mega-batch (3) -> Large batch (2) shows amber "Batch still oversized for pairing" instead of red "Weakens pairing!"
  api.applyPreset(3, 3); // Prevent at source: Pair ON, Heavy build noise
  idElements.buildSlider.value = '3'; // Mega-batch
  idElements.buildSlider.dispatchEvent('input');
  assert(
    idElements.impactPills.innerHTML.includes('Weakens pairing!'),
    'Expected stepping Build up to Mega-batch with Pair ON to warn Weakens pairing!'
  );
  idElements.resetBtn.dispatchEvent('click');

  idElements.buildSlider.value = '2'; // Step down to Large batch
  idElements.buildSlider.dispatchEvent('input');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('Build 12.4d \u2192 7.6d') &&
      ledger.gain.includes('Build drift ') &&
      ledger.cost.includes('impact-pill warn">Batch still oversized for pairing') &&
      !idElements.impactPills.innerHTML.includes('Weakens pairing!'),
    'Expected Mega-batch -> Large batch with Pair ON to show amber "Batch still oversized for pairing" without "Weakens pairing!", got: ' +
      idElements.impactPills.innerHTML
  );

  api.setViewMode('cybernetics');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.cost.includes('Batch still coarse for sync') &&
      !idElements.impactPills.innerHTML.includes('Weakens sync control!'),
    'Expected Cybernetics view to translate "Batch still coarse for sync"'
  );
  api.setViewMode('product');

  // Stepping down further to Medium batch (1) clears the oversized reminder completely
  idElements.resetBtn.dispatchEvent('click');
  idElements.buildSlider.value = '1';
  idElements.buildSlider.dispatchEvent('input');
  assert(
    !idElements.impactPills.innerHTML.includes('Batch still oversized') &&
      !idElements.impactPills.innerHTML.includes('Weakens pairing!'),
    'Expected Medium batch to omit oversized pairing warnings'
  );

  api.applyChapter(1);
});

check('3E: Raising Spec noise on escaped Build bug never reports a Loop gain, and Loose (12) WIP under heavy demand stays amber', function () {
  function splitLedger(html) {
    const costIdx = html.indexOf('tradeoff-cost');
    assert(costIdx > 0, 'Expected both tradeoff-gain and tradeoff-cost groups in: ' + html);
    return {
      gain: html.slice(0, costIdx),
      cost: html.slice(costIdx)
    };
  }

  api.setViewMode('product');

  // 1. Ch. 6 escaped Build bug + Diagnostic OFF (blind guessing): raising Discovery & spec noise 0% -> 82% never shows a Loop speedup
  api.applyPreset(6, 3); // Escaped bug: Light testing, Heavy build noise, 0% Discovery noise
  idElements.diagnosticChannelToggle.checked = false;
  idElements.diagnosticChannelToggle.dispatchEvent('change');
  idElements.resetBtn.dispatchEvent('click');

  const loopBeforeSpecNoise = parseFloat(idElements.loopTimeValue.textContent);
  idElements.discoveryNoiseSlider.value = '3'; // Heavy (82%)
  idElements.discoveryNoiseSlider.dispatchEvent('input');
  const loopAfterSpecNoise = parseFloat(idElements.loopTimeValue.textContent);
  let ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    loopAfterSpecNoise >= loopBeforeSpecNoise &&
      !ledger.gain.includes('Loop ') &&
      ledger.gain.includes('None') &&
      ledger.cost.includes('Spec distortion 0% \u2192 82%') &&
      idElements.impactBar.classList.contains('tone-bad'),
    'Expected raising Spec noise on blind escaped Build bug to report Gain: None without a Loop drop, got: ' +
      idElements.impactPills.innerHTML
  );

  // 2. Under Flooded demand (even in Calm market), stepping WIP limit Uncapped (3) -> Loose (12) (2) warns "Loose cap: 12 (queues still build)" and stays tone-warn
  api.applyPreset(4, 2); // Flooded backlog, Uncapped WIP
  idElements.driftSlider.value = '0'; // Calm 48d market so even <43.2d loop tests looseWipUnderHeavyDemand guard
  idElements.driftSlider.dispatchEvent('input');
  idElements.resetBtn.dispatchEvent('click');

  idElements.wipSlider.value = '2'; // Loose (12)
  idElements.wipSlider.dispatchEvent('input');
  ledger = splitLedger(idElements.impactPills.innerHTML);
  assert(
    ledger.gain.includes('WIP cap: Loose (12)') &&
      ledger.cost.includes('Loose cap: 12 (queues still build)') &&
      idElements.impactBar.classList.contains('tone-warn') &&
      api.getState().spotlightZoneTones.wipGate === 'warn',
    'Expected Uncapped -> Loose (12) under Flooded demand to warn "Loose cap: 12 (queues still build)" with tone-warn, got: ' +
      idElements.impactPills.innerHTML
  );

  // Stepping down further to Tight (3) turns the bar and wipGate green
  idElements.resetBtn.dispatchEvent('click');
  idElements.wipSlider.value = '1'; // Tight (3)
  idElements.wipSlider.dispatchEvent('input');
  assert(
    idElements.impactBar.classList.contains('tone-good') &&
      api.getState().spotlightZoneTones.wipGate === 'good',
    'Expected Loose (12) -> Tight (3) under Calm market to turn bar and wipGate green'
  );

  api.applyChapter(1);
});

check('4B: Cybernetics view labels Horizon on Environment -> System 4 and shows SYS 2 OFF when WIP is uncapped', function () {
  api.setViewMode('cybernetics');
  api.applyChapter(4); // Default opens on Uncapped WIP (wipIdx === 3)
  api.step(0);
  let texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert.strictEqual(
    idElements.discoveryBlockTitle.textContent,
    'System 4: Intelligence & Horizon (Discovery)',
    'Expected System 4 console header to name Horizon'
  );
  assert(
    texts.includes('Horizon'),
    'Expected Cybernetics view Environment -> System 4 channel to display "Horizon", got: ' + texts.join(' | ')
  );
  assert(
    texts.includes('SYS 2 OFF') && !texts.includes('SYS 2'),
    'Expected uncapped WIP gate in Cybernetics view to display "SYS 2 OFF", got: ' + texts.join(' | ')
  );

  // Tightening WIP to Tight (3) switches gate back to "SYS 2"
  idElements.wipSlider.value = '1';
  idElements.wipSlider.dispatchEvent('input');
  texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    texts.includes('SYS 2') && !texts.includes('SYS 2 OFF'),
    'Expected capped WIP gate in Cybernetics view to display "SYS 2"'
  );

  // Product view stays free of "Horizon" and "SYS 2 OFF"
  api.setViewMode('product');
  texts = (idElements.simCanvas._canvasTexts || []).map(function (t) { return t.text; });
  assert(
    !texts.includes('Horizon') && !texts.includes('SYS 2 OFF'),
    'Product view must not leak Cybernetics Horizon or SYS 2 OFF labels'
  );

  api.applyChapter(1);
});

check('4C: Rollout safeguard wording focuses strictly on checking messaging and docs against build without promising reach lift', function () {
  api.setViewMode('product');
  api.applyChapter(5);
  assert.strictEqual(idElements.rolloutDampenerTitle.textContent, 'Check messaging & docs against build');
  assert.strictEqual(idElements.experimentsRow.children[2].textContent, 'Verified messaging & docs + full reach');
  assert(!/onboarding/i.test(idElements.rolloutDampenerTitle.textContent), 'Rollout safeguard title must not suggest onboarding reach lift');

  api.setViewMode('cybernetics');
  assert.strictEqual(idElements.rolloutDampenerTitle.textContent, 'Output transducer check (verify messaging & docs)');

  api.setViewMode('product');
  api.applyChapter(1);
});

check('4D: Ch. 4 Cybernetics view cites single-pass rework load 1 + r(n) rather than 1 / (1 - r(n))', function () {
  const ch4 = api.getChapters()[4];
  assert(
    ch4.cyberneticsHtml.includes('<code>1 + r(n)</code>') &&
      !ch4.cyberneticsHtml.includes('1 / (1 - r(n))') &&
      !ch4.cyberneticsHtml.includes('1/(1 - r(n))'),
    'Expected Ch. 4 cyberneticsHtml to cite single-pass 1 + r(n) rework load'
  );
});

check('5C: Flipping Andon cord ON after an earlier shock has cleared arms quietly without flushing healthy current-epoch work', function () {
  const M = global.window.CyberneticModel;
  api.setViewMode('product');

  // Case 1: Shock was pre-empted when it occurred; later Andon is turned OFF, healthy current-epoch queue builds, and Andon is turned back ON
  api.applyPreset(7, 1); // Healthy flow + Andon cord armed
  runSeconds(10);
  idElements.topShockBtn.dispatchEvent('click');
  const flushedAtShock = api.getState().totalFlushedByAndon;
  assert(flushedAtShock >= 3, 'Expected initial shock pre-emption to flush obsolete bets');

  runSeconds(20);
  idElements.andonCordToggle.checked = false;
  idElements.andonCordToggle.dispatchEvent('change');
  idElements.demandSlider.value = '3'; // Flooded demand builds healthy current-epoch queue
  idElements.demandSlider.dispatchEvent('input');
  runSeconds(12);

  const beforeReArm = api.getState();
  assert(beforeReArm.shockCount >= 1 && beforeReArm.queueCount >= 2, 'Expected healthy current-epoch queue after old shock');
  assert(!M.hasPreShockItemsInFlight() && !M.isPostShockJamActive(), 'Expected zero active shock fallout');

  idElements.andonCordToggle.checked = true;
  idElements.andonCordToggle.dispatchEvent('change');
  const afterReArm = api.getState();
  assert.strictEqual(afterReArm.totalFlushedByAndon, flushedAtShock, 'Re-arming Andon after cleared shock must not flush healthy bets');
  assert.strictEqual(afterReArm.queueCount, beforeReArm.queueCount, 'Healthy current-epoch queue must stay intact');
  assert(
    idElements.impactPills.innerHTML.includes('Andon armed') &&
      !idElements.impactPills.innerHTML.includes('Flushed '),
    'Expected Gain: Andon armed without Flushed pill, got: ' + idElements.impactPills.innerHTML
  );

  // Case 2: Un-pre-empted shock self-heals under Tight (3) WIP; later healthy queue is preserved when arming Andon
  api.applyChapter(7); // Andon OFF
  idElements.wipSlider.value = '1'; // Tight (3) WIP prevents permanent spiral
  idElements.wipSlider.dispatchEvent('input');
  runSeconds(8);
  idElements.topShockBtn.dispatchEvent('click');
  runSeconds(40); // Let shock rework clear completely

  assert(!M.hasPreShockItemsInFlight() && !M.isPostShockJamActive(), 'Expected healed shock to clear postShockJamActive');
  idElements.wipSlider.value = '2'; // Loose (12)
  idElements.wipSlider.dispatchEvent('input');
  idElements.demandSlider.value = '3'; // Flooded
  idElements.demandSlider.dispatchEvent('input');
  runSeconds(10);

  const healthyQueueBefore = api.getState().queueCount;
  assert(healthyQueueBefore >= 2, 'Expected healthy current-epoch queue (>=2), got ' + healthyQueueBefore);
  idElements.andonCordToggle.checked = true;
  idElements.andonCordToggle.dispatchEvent('change');
  assert.strictEqual(api.getState().totalFlushedByAndon, 0, 'Expected zero healthy items flushed after healed shock');
  assert.strictEqual(api.getState().queueCount, healthyQueueBefore, 'Expected healthy queue preserved after healed shock');

  api.applyChapter(1);
});

check('5D: Chapter 8 opening preset label is "Viable System (balanced, default)"', function () {
  const ch8FirstPreset = api.getChapters()[8].presets[0].label;
  assert.strictEqual(ch8FirstPreset, 'Viable System (balanced, default)');
});

check('6B: Launch history and Quick experiments stay single-row across all 8 chapters in both views on laptop/desktop viewports', function () {
  const C = global.window.CyberneticContent;
  assert.strictEqual(C.UI_COPY.product.historyLabel, 'Last 16 launches:');
  assert.strictEqual(C.UI_COPY.cybernetics.historyLabel, 'Last 16 outputs:');
  assert(
    htmlSource.includes('<span id="historyLabel" class="history-label">Last 16 launches:</span>'),
    'Expected static index.html #historyLabel to match compact "Last 16 launches:"'
  );
  assert(
    /\.history-bar\s*\{[^}]*flex-wrap:\s*nowrap/s.test(cssSource) &&
      /\.stage-experiments\s*\{[^}]*flex-wrap:\s*nowrap/s.test(cssSource) &&
      /@media\s*\(max-width:\s*1060px\)\s*\{[\s\S]*?\.stage-experiments\s*\{\s*flex-wrap:\s*wrap/s.test(cssSource),
    'Expected styles.css to keep .history-bar and .stage-experiments single-row on desktop and wrap <=1060px'
  );

  // Desktop stage inner width at 1280px/1440px (.page-shell max-width 1220px - 48px shell pad - 2px border - 24px bar pad = 1146px)
  const stageInnerWidth = 1146;
  for (let ch = 1; ch <= 8; ch++) {
    ['product', 'cybernetics'].forEach(function (mode) {
      api.setViewMode(mode);
      api.applyChapter(ch);
      const btns = idElements.experimentsRow.children;
      const labels = [];
      for (let i = 1; i < btns.length; i++) {
        labels.push(btns[i].textContent);
      }
      const labelPx = 'Quick experiments:'.length * 6.2 + 2;
      const btnsPx = labels.reduce(function (acc, s) {
        return acc + s.length * 6.0 + 17.4;
      }, 0);
      const gapsPx = labels.length * 5.8;
      const estRowWidth = labelPx + btnsPx + gapsPx;
      assert(
        estRowWidth <= stageInnerWidth - 10,
        'Ch. ' + ch + ' (' + mode + ') Quick experiments estimated width ' + Math.round(estRowWidth) + 'px exceeds single-row budget'
      );
    });
  }

  // Worst-case Launch history width: 16 retry chips ("↻82") + "|" divider + Since | + Settled bet fit + All outputs + Purged by algedonic
  const worstPrefixPx = C.UI_COPY.cybernetics.historyLabel.length * 6.2;
  const worstChipsPx = 16 * 26 + 15 * 3.2 + 7;
  const worstSummaryText = 'Since |: 84% · Settled bet fit: 81% · All outputs: 69% · Purged by algedonic: 24';
  const worstSummaryPx = worstSummaryText.length * 5.9;
  const estHistoryWidth = worstPrefixPx + 7.2 + worstChipsPx + 8.8 + worstSummaryPx;
  assert(
    estHistoryWidth <= stageInnerWidth - 10,
    'Worst-case 16-chip Launch history estimated width ' + Math.round(estHistoryWidth) + 'px exceeds single-row budget'
  );

  api.setViewMode('product');
  api.applyChapter(1);
});

check('URL GET parameters: round-trip all 18 settings + UI flags, live replaceState sync from bare URL, chapter isolation, and Copy link button', function () {
  const M = global.window.CyberneticModel;
  const U = global.window.CyberneticUrlState;
  assert(U && typeof U.parseShareQueryString === 'function', 'Expected standalone CyberneticUrlState adapter');
  assert.strictEqual(M.parseShareQueryString, undefined, 'CyberneticModel must stay free of URL adapter helpers');

  // 1. Bare Chapter 1 default keeps query string completely empty, and turning a single dial reflects immediately in window.location.search
  api.setViewMode('product');
  speedBtns[1].dispatchEvent('click'); // 1x speed
  if (!api.getState().running) idElements.playPauseBtn.dispatchEvent('click');
  if (idElements.bookGrid.classList.contains('is-hints-hidden')) idElements.hintsToggleBtn.dispatchEvent('click');
  api.applyChapter(1);
  assert.strictEqual(api.getShareQuery(), '', 'Expected bare Chapter 1 default to produce empty query string');
  assert.strictEqual(global.window.location.search, '', 'Expected window.location.search to be empty on Chapter 1 defaults');

  idElements.driftSlider.value = '1';
  idElements.driftSlider.dispatchEvent('input');
  assert.strictEqual(
    global.window.location.search,
    '?ch=1&drift=1',
    'Turning a single dial on bare Chapter 1 must immediately reflect ?ch=1&drift=1 in URL (without &paused=1 during Tactical Pause)'
  );
  assert(api.getState().tacticallyPaused && api.getState().running, 'Tactical Pause must not mark URL as paused=1');

  // Returning dial to Chapter 1 default cleans URL back to empty
  idElements.driftSlider.value = '2';
  idElements.driftSlider.dispatchEvent('input');
  assert.strictEqual(global.window.location.search, '', 'Returning Chapter 1 dial to default must clean URL back to empty');

  // 2. Copy link button copies full shareable URL and shows "Copied!" feedback
  api.applyChapter(4);
  idElements.wipSlider.value = '1';
  idElements.wipSlider.dispatchEvent('input');
  idElements.buildDampenerToggle.checked = true;
  idElements.buildDampenerToggle.dispatchEvent('change');
  assert.strictEqual(global.window.location.search, '?ch=4&wip=1&pair=1');

  idElements.copyLinkBtn.dispatchEvent('click');
  assert.strictEqual(
    global.window.navigator.clipboard._lastText,
    'https://beyondquality.org/cybernetics/?ch=4&wip=1&pair=1',
    'Expected Copy link button to write full shareable URL to clipboard'
  );
  assert.strictEqual(idElements.copyLinkBtn.textContent, 'Copied!', 'Expected Copy link button to show Copied! feedback');
  assert(idElements.copyLinkBtn.classList.contains('is-copied'), 'Expected .is-copied class on Copy link button');

  // Also verify file:// URL construction when origin === "null"
  const prevOrigin = global.window.location.origin;
  const prevHref = global.window.location.href;
  global.window.location.origin = 'null';
  global.window.location.href = 'file:///Users/demo/cybernetics/index.html?ch=4&wip=1&pair=1';
  assert.strictEqual(
    api.getShareUrl(),
    'file:///Users/demo/cybernetics/index.html?ch=4&wip=1&pair=1',
    'Expected file:// getShareUrl() to preserve file:/// path cleanly'
  );
  global.window.location.origin = prevOrigin;
  global.window.location.href = prevHref;

  // 3. Full round-trip of all 17 control parameters + view + speed + paused + story + hints on Chapter 8
  const fullQuery =
    '?ch=8&view=cybernetics&drift=3&demand=3&shock=2&wip=2&disc=2&discNoise=1&watch=0' +
    '&build=2&build10x=1&buildNoise=3&pair=0&testing=3&reach=1&msgNoise=3&msgCheck=0&diag=0&andon=0' +
    '&speed=2&paused=1&story=0&hints=0';
  assert(api.applyUrlQuery(fullQuery), 'Expected applyUrlQuery to return true on full query');
  const st8 = api.getState();
  assert.strictEqual(st8.settings.chapter, 8);
  assert.strictEqual(st8.settings.viewMode, 'cybernetics');
  assert.strictEqual(st8.settings.driftIdx, 3);
  assert.strictEqual(st8.settings.demandIdx, 3);
  assert.strictEqual(st8.settings.shockIdx, 2);
  assert.strictEqual(st8.settings.wipIdx, 2);
  assert.strictEqual(st8.settings.discoveryIdx, 2);
  assert.strictEqual(st8.settings.discoveryNoiseIdx, 1);
  assert.strictEqual(st8.settings.discoveryDampener, false);
  assert.strictEqual(st8.settings.buildIdx, 2);
  assert.strictEqual(st8.settings.build10x, true);
  assert.strictEqual(st8.settings.buildNoiseIdx, 3);
  assert.strictEqual(st8.settings.buildDampener, false);
  assert.strictEqual(st8.settings.testingIdx, 3);
  assert.strictEqual(st8.settings.reachIdx, 1);
  assert.strictEqual(st8.settings.messagingNoiseIdx, 3);
  assert.strictEqual(st8.settings.rolloutDampener, false);
  assert.strictEqual(st8.settings.diagnosticChannel, false);
  assert.strictEqual(st8.settings.andonCord, false);
  assert.strictEqual(st8.running, false, 'Expected paused=1 to open paused without Tactical Pause');
  assert(!st8.tacticallyPaused, 'Expected initial URL load not to trigger Tactical Pause');
  assert(idElements.storyCard.classList.contains('is-collapsed'), 'Expected story=0 to collapse Story card');
  assert(idElements.bookGrid.classList.contains('is-hints-hidden'), 'Expected hints=0 to collapse knob hints');
  assert(speedBtns[2].classList.contains('active'), 'Expected speed=2 button active');
  assert.strictEqual(idElements.impactHeader.textContent, 'Shared parameters:', 'Expected custom Cybernetics URL to show "Shared parameters:"');
  assert.strictEqual(global.window.location.search, fullQuery, 'Expected canonical round-trip query string to match fullQuery');

  // 4. Omitting ch= when custom control parameters are passed defaults to Chapter 8 (Full Sandbox)
  api.applyUrlQuery('?build10x=1&wip=1&diag=1');
  assert.strictEqual(api.getState().settings.chapter, 8, 'Expected omitted ch= with custom controls to open Chapter 8 Full Sandbox');
  assert.strictEqual(api.getState().settings.build10x, true);
  assert.strictEqual(api.getState().settings.wipIdx, 1);
  assert.strictEqual(api.getState().settings.diagnosticChannel, true);

  // 5. Progressive chapter isolation: later-chapter params on ch=2 are ignored, preset= base can be overridden, and unknown params are ignored
  api.applyUrlQuery('?ch=2&preset=2&discNoise=3&testing=3&reach=0&andon=1&bogus=xyz&build=99');
  const st2 = api.getState();
  assert.strictEqual(st2.settings.chapter, 2);
  assert.strictEqual(st2.settings.discoveryDampener, true, 'Expected preset=2 base on Ch. 2 to set watch=true');
  assert.strictEqual(st2.settings.buildDampener, true, 'Expected preset=2 base on Ch. 2 to set pair=true');
  assert.strictEqual(st2.settings.discoveryNoiseIdx, 3, 'Expected discNoise=3 to override preset=2');
  assert.strictEqual(st2.settings.buildIdx, 3, 'Expected out-of-range build=99 to clamp safely to 3');
  assert.strictEqual(st2.effective.testingIdx, 0, 'Ch. 2 must keep Testing inactive even if testing=3 was in URL');
  assert.strictEqual(st2.effective.reachFactor, 1, 'Ch. 2 must keep Rollout reach=100% even if reach=0 was in URL');
  assert.strictEqual(st2.effective.andonActive, false, 'Ch. 2 must keep Andon inactive even if andon=1 was in URL');
  assert(!global.window.location.search.includes('testing=') && !global.window.location.search.includes('bogus='), 'Canonical synced URL must drop locked/unknown params');

  // Pure tracking query (?utm_source=github) is treated as unrecognized and boots clean Chapter 1
  assert.strictEqual(U.parseShareQueryString('?utm_source=github&ref=discussion').hasRecognizedParams, false);

  // Restore clean baseline state
  api.applyUrlQuery('');
  api.setViewMode('product');
  api.applyChapter(1);
});

check('Vignette URL modes (ui=bare & ui=controls): chrome stripping, sticky URL sync, and in-place Open full interactive model transition', function () {
  // 1. Default normal mode shows full walkthrough chrome and hides #vignetteFooter
  api.applyUrlQuery('');
  assert.strictEqual(api.getUiMode(), 'normal');
  assert(!idElements.pageShell.classList.contains('is-ui-bare') && !idElements.pageShell.classList.contains('is-ui-controls'));
  assert(!idElements.viewBar.classList.contains('is-hidden'), 'Expected .view-bar visible in normal mode');
  assert(!idElements.chapterNav.classList.contains('is-hidden'), 'Expected .chapter-nav visible in normal mode');
  assert(!idElements.storyCard.classList.contains('is-hidden'), 'Expected #storyCard visible in normal mode');
  assert(!idElements.experimentsRow.classList.contains('is-hidden'), 'Expected #experimentsRow visible in normal mode');
  assert(!idElements.bookGrid.classList.contains('is-hidden'), 'Expected #bookGrid visible in normal mode');
  assert(!idElements.bottomPager.classList.contains('is-hidden'), 'Expected #bottomPager visible in normal mode');
  assert(idElements.vignetteFooter.classList.contains('is-hidden'), 'Expected #vignetteFooter hidden in normal mode');

  // 2. ?ch=4&ui=bare strips navigation, story, presets, impactBar, controls, and pager while keeping stage + link
  assert(api.applyUrlQuery('?ch=4&wip=1&pair=1&ui=bare'), 'Expected applyUrlQuery to accept ui=bare');
  assert.strictEqual(api.getUiMode(), 'bare');
  assert(idElements.pageShell.classList.contains('is-ui-bare') && !idElements.pageShell.classList.contains('is-ui-controls'));
  assert(idElements.viewBar.classList.contains('is-hidden'), 'Expected .view-bar hidden in ui=bare');
  assert(idElements.chapterNav.classList.contains('is-hidden'), 'Expected .chapter-nav hidden in ui=bare');
  assert(idElements.storyCard.classList.contains('is-hidden'), 'Expected #storyCard hidden in ui=bare');
  assert(idElements.experimentsRow.classList.contains('is-hidden'), 'Expected #experimentsRow hidden in ui=bare');
  assert(idElements.impactBar.classList.contains('is-hidden'), 'Expected #impactBar hidden in ui=bare');
  assert(idElements.bookGrid.classList.contains('is-hidden'), 'Expected #bookGrid hidden in ui=bare');
  assert(idElements.bottomPager.classList.contains('is-hidden'), 'Expected #bottomPager hidden in ui=bare');
  assert(!idElements.vignetteFooter.classList.contains('is-hidden'), 'Expected #vignetteFooter visible in ui=bare');
  assert.strictEqual(api.getState().spotlightZones.length, 0, 'ui=bare must not light control-diff spotlight rings on load');
  assert.strictEqual(global.window.location.search, '?ch=4&wip=1&pair=1&ui=bare');
  assert.strictEqual(
    idElements.openFullModelLink.getAttribute('href'),
    'https://beyondquality.org/cybernetics/?ch=4&wip=1&pair=1',
    'Expected Open full interactive model link to preserve current chapter and active params without ui=bare'
  );
  assert.strictEqual(idElements.openFullModelLink.getAttribute('target'), '_self');

  // Speed and Pause changes inside ui=bare keep ui=bare sticky in URL and update full-model href
  speedBtns[2].dispatchEvent('click'); // 2x speed
  idElements.playPauseBtn.dispatchEvent('click'); // pause
  assert.strictEqual(global.window.location.search, '?ch=4&wip=1&pair=1&speed=2&paused=1&ui=bare');
  assert.strictEqual(
    idElements.openFullModelLink.getAttribute('href'),
    'https://beyondquality.org/cybernetics/?ch=4&wip=1&pair=1&speed=2&paused=1'
  );
  idElements.playPauseBtn.dispatchEvent('click'); // resume
  speedBtns[1].dispatchEvent('click'); // 1x speed
  assert.strictEqual(global.window.location.search, '?ch=4&wip=1&pair=1&ui=bare');

  // Advance simulation so history chips exist, then verify modifier-click leaves vignette intact while plain click unfolds in-place
  runSeconds(18);
  const preUnfoldState = api.getState();
  assert(preUnfoldState.clockSec >= 17.5 && preUnfoldState.history.length >= 1, 'Expected running clock and launch history before unfolding');

  let prevented = false;
  idElements.openFullModelLink.dispatchEvent('click', {
    button: 0,
    metaKey: true,
    preventDefault: function () { prevented = true; }
  });
  assert.strictEqual(prevented, false, 'Cmd/Ctrl-click must allow native new-tab link navigation');
  assert.strictEqual(api.getUiMode(), 'bare', 'Cmd/Ctrl-click must leave current tab in ui=bare');

  idElements.openFullModelLink.dispatchEvent('click', {
    button: 0,
    preventDefault: function () { prevented = true; }
  });
  assert.strictEqual(prevented, true, 'Plain left-click in top-level tab should unfold in-place without page reload');
  assert.strictEqual(api.getUiMode(), 'normal');
  assert(!idElements.viewBar.classList.contains('is-hidden') && !idElements.storyCard.classList.contains('is-hidden'));
  assert(!idElements.storyCard.classList.contains('is-collapsed'), 'Unfolding into full model should show chapter Story expanded');
  assert(!idElements.experimentsRow.classList.contains('is-hidden') && !idElements.impactBar.classList.contains('is-hidden'));
  assert(!idElements.bookGrid.classList.contains('is-hidden') && !idElements.bottomPager.classList.contains('is-hidden'));
  assert(idElements.vignetteFooter.classList.contains('is-hidden'));
  assert.strictEqual(global.window.location.search, '?ch=4&wip=1&pair=1', 'Unfolding into full model must drop ui=bare from URL');
  assert.strictEqual(api.getState().clockSec, preUnfoldState.clockSec, 'In-place unfold must preserve running clock');
  assert.strictEqual(api.getState().history.length, preUnfoldState.history.length, 'In-place unfold must preserve launch history');

  // 3. ?ch=4&ui=controls hides navigation, story, and pager while keeping presets, impactBar, and chapter controls active
  assert(api.applyUrlQuery('?ch=4&ui=controls'), 'Expected applyUrlQuery to accept ui=controls');
  assert.strictEqual(api.getUiMode(), 'controls');
  assert(idElements.pageShell.classList.contains('is-ui-controls') && !idElements.pageShell.classList.contains('is-ui-bare'));
  assert(idElements.viewBar.classList.contains('is-hidden') && idElements.chapterNav.classList.contains('is-hidden'));
  assert(idElements.storyCard.classList.contains('is-hidden') && idElements.bottomPager.classList.contains('is-hidden'));
  assert(!idElements.experimentsRow.classList.contains('is-hidden'), 'Expected #experimentsRow visible in ui=controls');
  assert(!idElements.impactBar.classList.contains('is-hidden'), 'Expected #impactBar visible on Ch. 2+ in ui=controls');
  assert(!idElements.bookGrid.classList.contains('is-hidden'), 'Expected #bookGrid visible in ui=controls');
  assert(!idElements.vignetteFooter.classList.contains('is-hidden'), 'Expected #vignetteFooter visible in ui=controls');
  assert.strictEqual(global.window.location.search, '?ch=4&ui=controls');
  assert.strictEqual(idElements.openFullModelLink.getAttribute('href'), 'https://beyondquality.org/cybernetics/?ch=4');

  // Turning a knob inside ui=controls keeps ui=controls sticky and updates full-model href
  idElements.wipSlider.value = '1';
  idElements.wipSlider.dispatchEvent('input');
  assert.strictEqual(global.window.location.search, '?ch=4&wip=1&ui=controls');
  assert.strictEqual(idElements.openFullModelLink.getAttribute('href'), 'https://beyondquality.org/cybernetics/?ch=4&wip=1');

  // When embedded inside an iframe (window.self !== window.top), link targets _blank and allows native navigation
  global.window.self = { frame: 1 };
  global.window.top = { topWindow: 1 };
  try {
    api.applyUrlQuery('?ui=bare');
    assert.strictEqual(api.getState().settings.chapter, 1, 'Expected bare ?ui=bare without ch= to open Chapter 1');
    assert.strictEqual(global.window.location.search, '?ch=1&ui=bare');
    assert.strictEqual(idElements.openFullModelLink.getAttribute('href'), 'https://beyondquality.org/cybernetics/');
    assert.strictEqual(idElements.openFullModelLink.getAttribute('target'), '_blank');
    let iframePrevented = false;
    idElements.openFullModelLink.dispatchEvent('click', {
      button: 0,
      preventDefault: function () { iframePrevented = true; }
    });
    assert.strictEqual(iframePrevented, false, 'Iframe click must not preventDefault so target=_blank opens full tab');
  } finally {
    delete global.window.self;
    delete global.window.top;
  }

  // Restore clean baseline state
  api.applyUrlQuery('');
  api.setViewMode('product');
  api.applyChapter(1);
});

check('Publishing metadata: index.html includes Beyond Quality favicon, canonical URL, and Open Graph / Twitter preview tags', function () {
  assert(
    /<link\s+rel="icon"\s+type="image\/jpeg"\s+href="\/bq\.jpeg">/i.test(htmlSource) &&
      /<link\s+rel="apple-touch-icon"\s+href="\/bq\.jpeg">/i.test(htmlSource),
    'Expected /bq.jpeg favicon and apple-touch-icon links in index.html'
  );
  assert(
    /<link\s+rel="canonical"\s+href="https:\/\/beyondquality\.org\/cybernetics\/">/i.test(htmlSource),
    'Expected canonical URL https://beyondquality.org/cybernetics/ in index.html'
  );
  assert(
    /<meta\s+property="og:title"\s+content="Product Work as a Cybernetic System: Interactive Model">/i.test(htmlSource) &&
      /<meta\s+property="og:image"\s+content="https:\/\/beyondquality\.org\/bq\.jpeg">/i.test(htmlSource) &&
      /<meta\s+property="og:url"\s+content="https:\/\/beyondquality\.org\/cybernetics\/">/i.test(htmlSource) &&
      /<meta\s+name="twitter:card"\s+content="summary_large_image">/i.test(htmlSource) &&
      /<meta\s+name="twitter:image"\s+content="https:\/\/beyondquality\.org\/bq\.jpeg">/i.test(htmlSource),
    'Expected Open Graph and Twitter summary_large_image tags in index.html'
  );
});

console.log('\nAll ' + passed + ' regression checks passed.');
