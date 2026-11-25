// Product Work as a Cybernetic System: URL Query-State & Clipboard Adapter

(function () {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const C = root.CyberneticContent || require('./content.js');
  const M = root.CyberneticModel || require('./model.js');

  const CHAPTERS = C.CHAPTERS;

  const URL_CONTROL_PARAMS = [
    { param: 'drift', key: 'driftIdx', kind: 'knob', minCh: 1 },
    { param: 'demand', key: 'demandIdx', kind: 'knob', minCh: 4 },
    { param: 'shock', key: 'shockIdx', kind: 'knob', minCh: 7 },
    { param: 'wip', key: 'wipIdx', kind: 'knob', minCh: 4 },
    { param: 'disc', key: 'discoveryIdx', kind: 'knob', minCh: 1 },
    { param: 'discNoise', key: 'discoveryNoiseIdx', kind: 'knob', minCh: 2 },
    { param: 'watch', key: 'discoveryDampener', kind: 'bool', minCh: 2 },
    { param: 'build', key: 'buildIdx', kind: 'knob', minCh: 1 },
    { param: 'build10x', key: 'build10x', kind: 'bool', minCh: 4 },
    { param: 'buildNoise', key: 'buildNoiseIdx', kind: 'knob', minCh: 2 },
    { param: 'pair', key: 'buildDampener', kind: 'bool', minCh: 2 },
    { param: 'testing', key: 'testingIdx', kind: 'knob', minCh: 3 },
    { param: 'reach', key: 'reachIdx', kind: 'knob', minCh: 5 },
    { param: 'msgNoise', key: 'messagingNoiseIdx', kind: 'knob', minCh: 5 },
    { param: 'msgCheck', key: 'rolloutDampener', kind: 'bool', minCh: 5 },
    { param: 'diag', key: 'diagnosticChannel', kind: 'bool', minCh: 6 },
    { param: 'andon', key: 'andonCord', kind: 'bool', minCh: 7 }
  ];

  function getChapterBaselineValue(chNum, key, activeSettings) {
    const ch = CHAPTERS[chNum];
    if (ch && Object.prototype.hasOwnProperty.call(ch.defaults, key)) {
      return ch.defaults[key];
    }
    if (key === 'shockIdx') return 0;
    if (key === 'andonCord') return false;
    return activeSettings[key];
  }

  function buildShareQueryString(uiFlags, settingsOverride) {
    const st = settingsOverride || M.settings;
    const chNum = st.chapter;
    const extraPairs = [];

    if (st.viewMode === 'cybernetics') {
      extraPairs.push('view=cybernetics');
    }

    for (let i = 0; i < URL_CONTROL_PARAMS.length; i++) {
      const entry = URL_CONTROL_PARAMS[i];
      if (entry.minCh > chNum) continue;
      const curVal = st[entry.key];
      const baseVal = getChapterBaselineValue(chNum, entry.key, st);
      if (curVal !== baseVal) {
        if (entry.kind === 'bool') {
          extraPairs.push(entry.param + '=' + (curVal ? '1' : '0'));
        } else {
          extraPairs.push(entry.param + '=' + String(curVal));
        }
      }
    }

    if (uiFlags) {
      if (uiFlags.speed === 0.5 || uiFlags.speed === 2) {
        extraPairs.push('speed=' + String(uiFlags.speed));
      }
      if (uiFlags.paused) {
        extraPairs.push('paused=1');
      }
      if (uiFlags.storyCollapsed) {
        extraPairs.push('story=0');
      }
      if (uiFlags.hintsCollapsed) {
        extraPairs.push('hints=0');
      }
    }

    if (chNum === 1 && extraPairs.length === 0) {
      return '';
    }
    return '?' + ['ch=' + String(chNum)].concat(extraPairs).join('&');
  }

  function safeDecodeComponent(str) {
    try {
      return decodeURIComponent(String(str).replace(/\+/g, ' '));
    } catch (_) {
      return String(str);
    }
  }

  function parseKnobQueryVal(raw) {
    if (raw === undefined || raw === null || String(raw).trim() === '') return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(3, Math.round(n)));
  }

  function parseBoolQueryVal(raw) {
    if (raw === undefined || raw === null) return null;
    const s = String(raw).trim().toLowerCase();
    if (s === '1' || s === 'true' || s === 'on' || s === 'yes') return true;
    if (s === '0' || s === 'false' || s === 'off' || s === 'no') return false;
    return null;
  }

  function parseShareQueryString(rawSearch) {
    const clean = String(rawSearch || '').replace(/^[?#]+/, '').trim();
    if (!clean) {
      return { hasRecognizedParams: false };
    }

    const rawMap = {};
    const parts = clean.split('&');
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];
      if (!seg) continue;
      const eqIdx = seg.indexOf('=');
      const k = eqIdx === -1 ? safeDecodeComponent(seg) : safeDecodeComponent(seg.slice(0, eqIdx));
      const v = eqIdx === -1 ? '' : safeDecodeComponent(seg.slice(eqIdx + 1));
      if (k) rawMap[k] = v;
    }

    let hasRecognizedParams = false;

    let explicitChapter = null;
    if (Object.prototype.hasOwnProperty.call(rawMap, 'ch') && String(rawMap.ch).trim() !== '') {
      const chN = Number(rawMap.ch);
      if (Number.isFinite(chN)) {
        explicitChapter = Math.max(1, Math.min(8, Math.round(chN)));
        hasRecognizedParams = true;
      }
    }

    let view = null;
    if (Object.prototype.hasOwnProperty.call(rawMap, 'view')) {
      const vm = String(rawMap.view).trim().toLowerCase();
      if (vm === 'cybernetics' || vm === 'product') {
        view = vm;
        hasRecognizedParams = true;
      }
    }

    let rawPresetNum = null;
    if (Object.prototype.hasOwnProperty.call(rawMap, 'preset') && String(rawMap.preset).trim() !== '') {
      const pN = Number(rawMap.preset);
      if (Number.isFinite(pN)) {
        rawPresetNum = Math.round(pN);
        hasRecognizedParams = true;
      }
    }

    const parsedControls = [];
    for (let i = 0; i < URL_CONTROL_PARAMS.length; i++) {
      const entry = URL_CONTROL_PARAMS[i];
      if (!Object.prototype.hasOwnProperty.call(rawMap, entry.param)) continue;
      const val = entry.kind === 'bool'
        ? parseBoolQueryVal(rawMap[entry.param])
        : parseKnobQueryVal(rawMap[entry.param]);
      if (val !== null) {
        parsedControls.push({ entry: entry, val: val });
        hasRecognizedParams = true;
      }
    }

    let speed = null;
    if (Object.prototype.hasOwnProperty.call(rawMap, 'speed') && String(rawMap.speed).trim() !== '') {
      const sp = Number(rawMap.speed);
      if (sp === 0.5 || sp === 1 || sp === 2) {
        speed = sp;
        hasRecognizedParams = true;
      }
    }

    let paused = null;
    if (Object.prototype.hasOwnProperty.call(rawMap, 'paused')) {
      const pv = parseBoolQueryVal(rawMap.paused);
      if (pv !== null) {
        paused = pv;
        hasRecognizedParams = true;
      }
    }

    let storyCollapsed = null;
    if (Object.prototype.hasOwnProperty.call(rawMap, 'story')) {
      const sv = parseBoolQueryVal(rawMap.story);
      if (sv !== null) {
        storyCollapsed = !sv;
        hasRecognizedParams = true;
      }
    }

    let hintsCollapsed = null;
    if (Object.prototype.hasOwnProperty.call(rawMap, 'hints')) {
      const hv = parseBoolQueryVal(rawMap.hints);
      if (hv !== null) {
        hintsCollapsed = !hv;
        hasRecognizedParams = true;
      }
    }

    if (!hasRecognizedParams) {
      return { hasRecognizedParams: false };
    }

    const chapter = explicitChapter !== null
      ? explicitChapter
      : (parsedControls.length > 0 || rawPresetNum !== null ? 8 : 1);

    let presetIdx = null;
    const chObj = CHAPTERS[chapter];
    if (rawPresetNum !== null && chObj && chObj.presets.length > 0) {
      const zeroBased = rawPresetNum <= 0 ? 0 : rawPresetNum - 1;
      presetIdx = Math.max(0, Math.min(chObj.presets.length - 1, zeroBased));
    }

    const overrides = {};
    for (let i = 0; i < parsedControls.length; i++) {
      const item = parsedControls[i];
      if (item.entry.minCh <= chapter) {
        overrides[item.entry.key] = item.val;
      }
    }

    return {
      hasRecognizedParams: true,
      chapter: chapter,
      view: view,
      presetIdx: presetIdx,
      overrides: overrides,
      speed: speed,
      paused: paused,
      storyCollapsed: storyCollapsed,
      hintsCollapsed: hintsCollapsed
    };
  }

  function getLocationSearch() {
    return root.location ? String(root.location.search || '') : '';
  }

  function buildFullShareUrl(query) {
    const loc = root.location;
    if (!loc) return 'index.html' + query;
    const hash = loc.hash || '';
    if (!loc.origin || loc.origin === 'null') {
      const hrefBase = String(loc.href || 'index.html').split('#')[0].split('?')[0];
      return hrefBase + query + hash;
    }
    return loc.origin + (loc.pathname || '/index.html') + query + hash;
  }

  function replaceBrowserQuery(query) {
    try {
      if (root.history && typeof root.history.replaceState === 'function' && root.location) {
        const pathPart = root.location.pathname || 'index.html';
        const hashPart = root.location.hash || '';
        root.history.replaceState(null, '', pathPart + query + hashPart);
      }
    } catch (_) {
      // Ignore history restrictions in sandboxed frames
    }
  }

  function copyTextToClipboard(text) {
    if (
      root.navigator &&
      root.navigator.clipboard &&
      typeof root.navigator.clipboard.writeText === 'function'
    ) {
      try {
        const res = root.navigator.clipboard.writeText(text);
        if (res && typeof res.catch === 'function') res.catch(function () {});
        return;
      } catch (_) {
        // Fall through to execCommand fallback
      }
    }
    try {
      const doc = root.document;
      if (doc && doc.createElement && doc.body && typeof doc.execCommand === 'function') {
        const ta = doc.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', 'readonly');
        ta.style.setProperty('position', 'fixed');
        ta.style.setProperty('opacity', '0');
        doc.body.appendChild(ta);
        if (typeof ta.select === 'function') ta.select();
        doc.execCommand('copy');
        if (typeof doc.body.removeChild === 'function') doc.body.removeChild(ta);
      }
    } catch (_) {
      // Ignore clipboard restrictions
    }
  }

  const CyberneticUrlState = {
    URL_CONTROL_PARAMS: URL_CONTROL_PARAMS,
    buildShareQueryString: buildShareQueryString,
    parseShareQueryString: parseShareQueryString,
    getLocationSearch: getLocationSearch,
    buildFullShareUrl: buildFullShareUrl,
    replaceBrowserQuery: replaceBrowserQuery,
    copyTextToClipboard: copyTextToClipboard
  };

  root.CyberneticUrlState = CyberneticUrlState;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CyberneticUrlState;
  }
})();
