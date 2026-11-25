// Product Work as a Cybernetic System: Pure Cybernetic Simulation & State Diff Engine

(function () {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const C = root.CyberneticContent || require('./content.js');

  const SHAPE_KEYS = C.SHAPE_KEYS;
  const COUSIN_LABEL = C.COUSIN_LABEL;
  const HYPE_LABEL = C.HYPE_LABEL;
  const DRIFT_REGIMES = C.DRIFT_REGIMES;
  const SHOCK_REGIMES = C.SHOCK_REGIMES;
  const DEMAND_REGIMES = C.DEMAND_REGIMES;
  const WIP_REGIMES = C.WIP_REGIMES;
  const DISCOVERY_REGIMES = C.DISCOVERY_REGIMES;
  const BUILD_REGIMES = C.BUILD_REGIMES;
  const NOISE_REGIMES = C.NOISE_REGIMES;
  const TESTING_REGIMES = C.TESTING_REGIMES;
  const REACH_REGIMES = C.REACH_REGIMES;
  const MESSAGING_NOISE_REGIMES = C.MESSAGING_NOISE_REGIMES;

  const SIM_DAYS_PER_SEC = C.SIM_DAYS_PER_SEC;
  const DAMPENER_DISCOVERY_ADD_SEC = C.DAMPENER_DISCOVERY_ADD_SEC;
  const DAMPENER_DISCOVERY_FACTOR = C.DAMPENER_DISCOVERY_FACTOR;
  const DAMPENER_BUILD_ADD_SEC = C.DAMPENER_BUILD_ADD_SEC;
  const DAMPENER_BUILD_FACTOR = C.DAMPENER_BUILD_FACTOR;
  const ROLLOUT_BASE_SEC = C.ROLLOUT_BASE_SEC;
  const DAMPENER_ROLLOUT_ADD_SEC = C.DAMPENER_ROLLOUT_ADD_SEC;
  const DAMPENER_ROLLOUT_FACTOR = C.DAMPENER_ROLLOUT_FACTOR;
  const REWORK_NOISE_FACTOR = C.REWORK_NOISE_FACTOR;
  const MAX_REWORK_PASSES = C.MAX_REWORK_PASSES;
  const MAX_OUTER_RETURNS = C.MAX_OUTER_RETURNS;

  const TRANSIT_SENSE = C.TRANSIT_SENSE;
  const TRANSIT_TO_BUILD = C.TRANSIT_TO_BUILD;
  const TRANSIT_TO_TESTING = C.TRANSIT_TO_TESTING;
  const TRANSIT_TO_ROLLOUT = C.TRANSIT_TO_ROLLOUT;
  const TRANSIT_ROLLOUT_TO_USERS = C.TRANSIT_ROLLOUT_TO_USERS;
  const DIAGNOSTIC_OBSERVE_ADD_SEC = C.DIAGNOSTIC_OBSERVE_ADD_SEC;
  const TRANSIT_TESTING_TO_USERS = C.TRANSIT_TESTING_TO_USERS;
  const TRANSIT_IDEAL_GATES = C.TRANSIT_IDEAL_GATES;
  const INNER_REWORK_SEC = C.INNER_REWORK_SEC;
  const OUTER_BLIND_RETURN_SEC = C.OUTER_BLIND_RETURN_SEC;
  const OUTER_DIAG_RETURN_SEC = C.OUTER_DIAG_RETURN_SEC;
  const OUTCOME_HOLD_SEC = C.OUTCOME_HOLD_SEC;
  const OUTER_RETURN_SEC = C.OUTER_RETURN_SEC;
  const TACTICAL_PAUSE_SEC = 3.0;
  const SPOTLIGHT_STEADY_SEC = 8.0;
  const SPOTLIGHT_FADE_SEC = 1.5;
  const SPOTLIGHT_TOTAL_SEC = SPOTLIGHT_STEADY_SEC + SPOTLIGHT_FADE_SEC;

  const CHAPTERS = C.CHAPTERS;
  const CONTROL_DESCRIPTORS = C.CONTROL_DESCRIPTORS;
  const SETTING_KEY_TO_CONTROL = C.SETTING_KEY_TO_CONTROL;

  // ---------------------------------------------------------------------------
  // 1. Polar Silhouette Geometry Engine (N = 240, 1.5 deg exact corner steps)
  // ---------------------------------------------------------------------------
  const N_ANGLES = 240;
  const ANGLES = new Float64Array(N_ANGLES);
  for (let k = 0; k < N_ANGLES; k++) {
    ANGLES[k] = -Math.PI / 2 + (2 * Math.PI * k) / N_ANGLES;
  }

  function normaliseArea(radii) {
    let sumSq = 0;
    for (let k = 0; k < N_ANGLES; k++) {
      sumSq += radii[k] * radii[k];
    }
    const rms = Math.sqrt(sumSq / N_ANGLES);
    const out = new Float64Array(N_ANGLES);
    for (let k = 0; k < N_ANGLES; k++) {
      out[k] = radii[k] / rms;
    }
    return out;
  }

  function buildCircle() {
    const r = new Float64Array(N_ANGLES);
    r.fill(1.0);
    return normaliseArea(r);
  }

  function buildOval() {
    const r = new Float64Array(N_ANGLES);
    const a = 1.38;
    const b = 0.68;
    for (let k = 0; k < N_ANGLES; k++) {
      const th = ANGLES[k];
      const c = Math.cos(th);
      const s = Math.sin(th);
      r[k] = (a * b) / Math.sqrt(b * b * c * c + a * a * s * s);
    }
    return normaliseArea(r);
  }

  function buildSquare() {
    const r = new Float64Array(N_ANGLES);
    for (let k = 0; k < N_ANGLES; k++) {
      const th = ANGLES[k];
      r[k] = 1.0 / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th)));
    }
    return normaliseArea(r);
  }

  function buildTriangle() {
    const normals = [Math.PI / 2, -Math.PI / 6, (-5 * Math.PI) / 6];
    const r = new Float64Array(N_ANGLES);
    for (let k = 0; k < N_ANGLES; k++) {
      const th = ANGLES[k];
      let maxProj = -Infinity;
      for (let j = 0; j < 3; j++) {
        const proj = Math.cos(th - normals[j]);
        if (proj > maxProj) maxProj = proj;
      }
      r[k] = 1.0 / maxProj;
    }
    return normaliseArea(r);
  }

  function buildStar() {
    const rOut = 1.0;
    const rIn = 0.4;
    const vertsX = new Float64Array(10);
    const vertsY = new Float64Array(10);
    for (let j = 0; j < 10; j++) {
      const ang = -Math.PI / 2 + (j * Math.PI) / 5;
      const rad = j % 2 === 0 ? rOut : rIn;
      vertsX[j] = rad * Math.cos(ang);
      vertsY[j] = rad * Math.sin(ang);
    }
    const r = new Float64Array(N_ANGLES);
    const sector = Math.PI / 5;
    for (let k = 0; k < N_ANGLES; k++) {
      const th = ANGLES[k];
      let rel = th - -Math.PI / 2;
      while (rel < 0) rel += 2 * Math.PI;
      while (rel >= 2 * Math.PI) rel -= 2 * Math.PI;
      const idx = Math.min(9, Math.floor(rel / sector));
      const next = (idx + 1) % 10;
      const x1 = vertsX[idx];
      const y1 = vertsY[idx];
      const x2 = vertsX[next];
      const y2 = vertsY[next];
      const denom = (y2 - y1) * Math.cos(th) - (x2 - x1) * Math.sin(th);
      r[k] = (x1 * y2 - y1 * x2) / denom;
    }
    return normaliseArea(r);
  }

  function buildCross() {
    const L = 1.0;
    const w = Math.tan((21 * Math.PI) / 180);
    const r = new Float64Array(N_ANGLES);
    for (let k = 0; k < N_ANGLES; k++) {
      const th = ANGLES[k];
      const ac = Math.max(1e-9, Math.abs(Math.cos(th)));
      const as = Math.max(1e-9, Math.abs(Math.sin(th)));
      const horiz = Math.min(L / ac, w / as);
      const vert = Math.min(w / ac, L / as);
      r[k] = Math.max(horiz, vert);
    }
    return normaliseArea(r);
  }

  const BASE_SHAPES = {
    CIRCLE: buildCircle(),
    STAR: buildStar(),
    TRIANGLE: buildTriangle(),
    SQUARE: buildSquare(),
    CROSS: buildCross(),
    OVAL: buildOval()
  };

  function maxPolarRadius(radii) {
    if (!radii) return 1.0;
    let maxR = 0;
    for (let k = 0; k < N_ANGLES; k++) {
      if (radii[k] > maxR) maxR = radii[k];
    }
    return maxR || 1.0;
  }

  function smoothstep(x) {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
  }

  function morphShapes(rA, rB, alpha) {
    const u = smoothstep(alpha);
    const out = new Float64Array(N_ANGLES);
    for (let k = 0; k < N_ANGLES; k++) {
      out[k] = (1 - u) * rA[k] + u * rB[k];
    }
    return out;
  }

  function cloneRadii(r) {
    const out = new Float64Array(N_ANGLES);
    out.set(r);
    return out;
  }

  function seededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function warpShape(inputRadii, noiseLevel, seed) {
    if (noiseLevel <= 0.001) return cloneRadii(inputRadii);
    const rng = seededRandom(seed);
    const twistSteps = Math.round((rng() - 0.5) * 44 * noiseLevel * noiseLevel);
    const amps = [0, 0.24, 0.30, 0.24, 0.16];
    const phases = [0, rng() * 6.283, rng() * 6.283, rng() * 6.283, rng() * 6.283];
    const signs = [0, rng() > 0.5 ? 1 : -1, rng() > 0.5 ? 1 : -1, rng() > 0.5 ? 1 : -1, 1];

    const out = new Float64Array(N_ANGLES);
    for (let k = 0; k < N_ANGLES; k++) {
      const srcIdx = ((k + twistSteps) % N_ANGLES + N_ANGLES) % N_ANGLES;
      const th = ANGLES[k];
      let factor = 1.0;
      for (let m = 1; m <= 4; m++) {
        factor += noiseLevel * amps[m] * signs[m] * Math.cos(m * th + phases[m]);
      }
      out[k] = Math.max(0.22, inputRadii[srcIdx] * factor);
    }
    return out;
  }

  function computeOverlapFit(refRadii, candidateRadii, reachFactor, labelFactor) {
    const reach = reachFactor === undefined ? 1.0 : reachFactor;
    const lbl = labelFactor === undefined ? 1.0 : labelFactor;
    const dth = (2 * Math.PI) / N_ANGLES;
    let valSq = 0;
    let slopeSq = 0;
    for (let k = 0; k < N_ANGLES; k++) {
      const kp = (k + 1) % N_ANGLES;
      const km = (k + N_ANGLES - 1) % N_ANGLES;
      const dv = refRadii[k] - candidateRadii[k];
      const sw = (refRadii[kp] - refRadii[km]) / (2 * dth);
      const sb = (candidateRadii[kp] - candidateRadii[km]) / (2 * dth);
      valSq += dv * dv;
      slopeSq += (sw - sb) * (sw - sb);
    }
    const combined = Math.sqrt(valSq / N_ANGLES + 0.008 * (slopeSq / N_ANGLES));
    return Math.max(0, Math.min(1, Math.exp(-2.65 * combined))) * reach * lbl;
  }

  // ---------------------------------------------------------------------------
  // 2. Settings, Effective-Rate Queries, and Simulation State
  // ---------------------------------------------------------------------------
  const settings = {
    chapter: 1,
    viewMode: 'product',
    demandIdx: 1,
    wipIdx: 0,
    driftIdx: 2,
    shockIdx: 0,
    discoveryIdx: 3,
    buildIdx: 1,
    build10x: false,
    discoveryNoiseIdx: 0,
    discoveryDampener: false,
    buildNoiseIdx: 0,
    buildDampener: false,
    testingIdx: 0,
    reachIdx: 3,
    messagingNoiseIdx: 0,
    rolloutDampener: false,
    diagnosticChannel: false,
    andonCord: false
  };

  let onMetricsChanged = null;
  function setOnMetricsChanged(fn) {
    onMetricsChanged = typeof fn === 'function' ? fn : null;
  }

  function isCyberneticsView() {
    return settings.viewMode === 'cybernetics';
  }

  function getEffectiveDemandIdx() {
    if (settings.chapter < 4) return 1;
    return settings.demandIdx;
  }

  function getEffectiveWipIdx() {
    if (settings.chapter < 4) return 0;
    return settings.wipIdx;
  }

  function getEffectiveShockIdx() {
    if (settings.chapter < 7) return 0;
    return settings.shockIdx;
  }

  function isAndonActive() {
    return settings.chapter >= 7 && settings.andonCord;
  }

  function isOuterRoutingActive() {
    return settings.chapter >= 6;
  }

  function isDiagnosticActive() {
    return settings.chapter >= 6 && settings.diagnosticChannel;
  }

  function getEffectiveDiscoverySec() {
    const base = DISCOVERY_REGIMES[settings.discoveryIdx].sec;
    const extra = settings.chapter >= 2 && settings.discoveryDampener ? DAMPENER_DISCOVERY_ADD_SEC : 0;
    return base + extra;
  }

  function getEffectiveBuildSec() {
    const base = BUILD_REGIMES[settings.buildIdx].sec;
    const extra = settings.chapter >= 2 && settings.buildDampener ? DAMPENER_BUILD_ADD_SEC : 0;
    const coded = settings.chapter >= 4 && settings.build10x ? Math.max(0.15, base * 0.1) : base;
    return coded + extra;
  }

  function getEffectiveBuildConcurrency() {
    if (settings.chapter < 4) return 1;
    return settings.buildDampener ? 1 : 2;
  }

  function isOversizedBuildBatch() {
    return settings.chapter >= 2 && settings.buildIdx >= 2;
  }

  function getEffectiveDiscoveryNoise() {
    if (settings.chapter < 2) return 0;
    let raw = NOISE_REGIMES[settings.discoveryNoiseIdx].level;
    raw *= DISCOVERY_REGIMES[settings.discoveryIdx].noiseFactor;
    if (settings.discoveryDampener) raw *= DAMPENER_DISCOVERY_FACTOR;
    return raw;
  }

  function getEffectiveBuildNoise() {
    if (settings.chapter < 2) return 0;
    const raw = NOISE_REGIMES[settings.buildNoiseIdx].level;
    if (raw <= 0) return 0;
    const bReg = BUILD_REGIMES[settings.buildIdx];
    let eff = raw * bReg.batchNoiseMult;
    if (settings.buildDampener) {
      eff *= DAMPENER_BUILD_FACTOR * bReg.pairPenaltyMult;
    }
    return Math.min(0.95, eff);
  }

  function getEffectiveTestingIdx() {
    if (settings.chapter < 3) return 0;
    return settings.testingIdx;
  }

  function isRolloutActive() {
    return settings.chapter >= 5;
  }

  function isSilentRollout() {
    return isRolloutActive() && settings.reachIdx === 0;
  }

  function getEffectiveRolloutSec() {
    if (!isRolloutActive()) return 0;
    const rReg = REACH_REGIMES[settings.reachIdx];
    const baseSec = rReg && rReg.sec !== undefined ? rReg.sec : ROLLOUT_BASE_SEC;
    const onboardingSec = !isSilentRollout() && settings.rolloutDampener ? DAMPENER_ROLLOUT_ADD_SEC : 0;
    return (
      baseSec +
      onboardingSec +
      (isDiagnosticActive() ? DIAGNOSTIC_OBSERVE_ADD_SEC : 0)
    );
  }

  function getEffectiveReachScale() {
    if (!isRolloutActive()) return 1.0;
    return REACH_REGIMES[settings.reachIdx].scale;
  }

  function getEffectiveReachFactor() {
    if (!isRolloutActive()) return 1.0;
    return REACH_REGIMES[settings.reachIdx].reachFactor;
  }

  function getEffectiveMessagingNoise() {
    if (!isRolloutActive() || isSilentRollout()) return 0;
    let raw = MESSAGING_NOISE_REGIMES[settings.messagingNoiseIdx].level;
    if (settings.rolloutDampener) raw *= DAMPENER_ROLLOUT_FACTOR;
    return raw;
  }

  function isControlDisabled(key) {
    if (key === 'demand' || key === 'wip' || key === 'build10x') return settings.chapter < 4;
    if (key === 'shock' || key === 'manualShock' || key === 'andon') return settings.chapter < 7;
    if (key === 'discoveryNoise' || key === 'buildNoise' || key === 'discoveryDampener' || key === 'buildDampener') {
      return settings.chapter < 2;
    }
    if (key === 'testing') return settings.chapter < 3;
    if (key === 'reach' || key === 'messagingNoise' || key === 'rolloutDampener') return settings.chapter < 5;
    if (key === 'diagnostic') return settings.chapter < 6;
    return false;
  }

  function computeRolloutPackaging(trueShapeName, forceClean) {
    if (!isRolloutActive() || forceClean) {
      return {
        reachScale: forceClean ? Math.max(0.92, getEffectiveReachScale()) : 1.0,
        reachFactor: forceClean ? Math.max(0.92, getEffectiveReachFactor()) : 1.0,
        shippedLabel: trueShapeName,
        labelStatus: 'accurate',
        labelFactor: 1.0
      };
    }

    const reachScale = getEffectiveReachScale();
    const reachFactor = getEffectiveReachFactor();
    if (settings.reachIdx === 0) {
      return {
        reachScale: reachScale,
        reachFactor: reachFactor,
        shippedLabel: '???',
        labelStatus: 'silent',
        labelFactor: 1.0
      };
    }

    const mNoise = getEffectiveMessagingNoise();
    if (mNoise < 0.18) {
      return {
        reachScale: reachScale,
        reachFactor: reachFactor,
        shippedLabel: trueShapeName,
        labelStatus: 'accurate',
        labelFactor: 1.0
      };
    }
    if (mNoise < 0.45) {
      return {
        reachScale: reachScale,
        reachFactor: reachFactor,
        shippedLabel: COUSIN_LABEL[trueShapeName] || 'OVAL',
        labelStatus: 'spin',
        labelFactor: 0.68
      };
    }
    if (mNoise < 0.72) {
      return {
        reachScale: reachScale,
        reachFactor: reachFactor,
        shippedLabel: COUSIN_LABEL[trueShapeName] || 'OVAL',
        labelStatus: 'confusing',
        labelFactor: 0.46
      };
    }
    return {
      reachScale: reachScale,
      reachFactor: reachFactor,
      shippedLabel: HYPE_LABEL[trueShapeName] || 'TRIANGLE',
      labelStatus: 'hype',
      labelFactor: 0.28
    };
  }

  // ---------------------------------------------------------------------------
  // 3. Multi-Item + Station Queue + Outer Loop Routing Engine
  // ---------------------------------------------------------------------------
  const sim = {
    running: true,
    speedMultiplier: 1.0,
    clockSec: 0,
    nextSeed: 101,
    worldRng: seededRandom(4242),
    shockRng: seededRandom(7717),
    shockTimer: 0,
    nextShockInterval: Infinity,
    shockCount: 0,
    worldEpoch: 0,
    postShockJamActive: false,
    totalFlushedByAndon: 0,
    shockFlash: null,
    andonFlash: null,

    worldPrevKey: 'CROSS',
    worldFromKey: 'STAR',
    worldToKey: 'CIRCLE',
    worldPhase: 0,
    worldRadii: cloneRadii(BASE_SHAPES.STAR),
    worldLabel: 'STAR',

    spawnTimer: 0,
    stations: {
      discovery: { active: null, queue: [] },
      build: { active: null, secondary: null, queue: [] },
      testing: { active: null, queue: [] },
      rollout: { active: null, queue: [] }
    },
    transits: [],
    testingBanner: null,
    lastDiscoveryTrace: null,
    landing: null,
    returnPulses: [],
    history: [],
    policyEpoch: 0,
    pendingPolicyBreak: false,
    pendingBreakTargetEpoch: 0,
    pendingBreakMaxStage: 5,
    hoverStack: [],
    hoverControlKey: null,
    hoverCommittedKey: null,
    hoverImpactBar: false,
    activeSpotlight: null,
    lastSpotlightZones: [],
    lastImpact: null,
    sliderGesture: null,
    tacticalPauseRemaining: 0,
    tacticalPauseDuration: TACTICAL_PAUSE_SEC
  };

  function getTotalQueueCount() {
    return (
      sim.stations.discovery.queue.length +
      sim.stations.build.queue.length +
      sim.stations.testing.queue.length +
      sim.stations.rollout.queue.length
    );
  }

  function getTotalInFlightCount() {
    let count = sim.transits.length + getTotalQueueCount();
    if (sim.stations.discovery.active) count += 1;
    if (sim.stations.build.active) count += 1;
    if (sim.stations.build.secondary) count += 1;
    if (sim.stations.testing.active) count += 1;
    if (sim.stations.rollout.active) count += 1;
    return count;
  }

  function getWipGateState() {
    const wIdx = getEffectiveWipIdx();
    const dIdx = getEffectiveDemandIdx();
    const maxWip = WIP_REGIMES[wIdx].maxWip;
    const isUncapped = wIdx === 3;
    const inFlight = getTotalInFlightCount();
    const queued = getTotalQueueCount();
    const dReg = DEMAND_REGIMES[dIdx];
    const holdingAtGate =
      settings.chapter >= 4 &&
      !isUncapped &&
      inFlight >= maxWip &&
      sim.spawnTimer >= dReg.intervalSec * 0.95;
    return {
      wipIdx: wIdx,
      maxWip: maxWip,
      inFlight: inFlight,
      queued: queued,
      isUncapped: isUncapped,
      holdingAtGate: holdingAtGate
    };
  }

  function getPrimaryItemForInspection() {
    if (sim.stations.discovery.active) return sim.stations.discovery.active;
    if (sim.stations.build.active) return sim.stations.build.active;
    if (sim.stations.testing.active) return sim.stations.testing.active;
    if (sim.stations.rollout.active) return sim.stations.rollout.active;
    if (sim.transits.length > 0) return sim.transits[0].item;
    return null;
  }

  function pickNextShapeKey(excludeA, excludeB) {
    let pool = SHAPE_KEYS.filter(function (k) {
      return k !== excludeA && k !== excludeB;
    });
    if (sim.shockCount > 0 && BASE_SHAPES[excludeA]) {
      const sharpPool = pool.filter(function (k) {
        return k !== 'CIRCLE' && computeOverlapFit(BASE_SHAPES[excludeA], BASE_SHAPES[k], 1.0, 1.0) <= 0.46;
      });
      if (sharpPool.length > 0) pool = sharpPool;
    }
    const idx = Math.floor(sim.worldRng() * pool.length);
    return pool[idx];
  }

  function scheduleNextShockInterval() {
    const sIdx = getEffectiveShockIdx();
    if (sIdx === 0) {
      sim.nextShockInterval = Infinity;
      return;
    }
    const base = SHOCK_REGIMES[sIdx].intervalSec;
    sim.nextShockInterval = base * (0.88 + 0.24 * sim.shockRng());
  }

  function updateWorld(dt) {
    const sIdx = getEffectiveShockIdx();
    if (sIdx > 0) {
      if (!Number.isFinite(sim.nextShockInterval)) {
        scheduleNextShockInterval();
      }
      sim.shockTimer += dt;
      if (sim.shockTimer >= sim.nextShockInterval) {
        sim.shockTimer = 0;
        triggerWorldShock();
        scheduleNextShockInterval();
        return;
      }
    }

    const cycleSec = DRIFT_REGIMES[settings.driftIdx].cycleSec;
    sim.worldPhase += dt / cycleSec;
    while (sim.worldPhase >= 1.0) {
      sim.worldPhase -= 1.0;
      sim.worldPrevKey = sim.worldFromKey;
      sim.worldFromKey = sim.worldToKey;
      sim.worldToKey = pickNextShapeKey(sim.worldFromKey, sim.worldPrevKey);
    }

    const holdFraction = 0.26;
    if (sim.worldPhase < holdFraction) {
      sim.worldRadii = cloneRadii(BASE_SHAPES[sim.worldFromKey]);
      sim.worldLabel = sim.worldFromKey;
    } else {
      const morphAlpha = (sim.worldPhase - holdFraction) / (1.0 - holdFraction);
      sim.worldRadii = morphShapes(
        BASE_SHAPES[sim.worldFromKey],
        BASE_SHAPES[sim.worldToKey],
        morphAlpha
      );
      sim.worldLabel = morphAlpha < 0.5
        ? sim.worldFromKey + ' -> ' + sim.worldToKey
        : sim.worldToKey;
    }
  }

  function hasPreShockItemsInFlight() {
    const ep = sim.worldEpoch;
    const stNames = ['discovery', 'build', 'testing', 'rollout'];
    for (let i = 0; i < stNames.length; i++) {
      const st = sim.stations[stNames[i]];
      if (st.active && st.active.bornEpoch < ep) return true;
      if (st.secondary && st.secondary.bornEpoch < ep) return true;
      if (st.queue.some(function (q) { return q.bornEpoch < ep; })) return true;
    }
    return sim.transits.some(function (tr) { return tr.item.bornEpoch < ep; });
  }

  function hasOuterReworkInFlight() {
    const stNames = ['discovery', 'build', 'testing', 'rollout'];
    for (let i = 0; i < stNames.length; i++) {
      const st = sim.stations[stNames[i]];
      if (st.active && st.active.outerReturns > 0) return true;
      if (st.secondary && st.secondary.outerReturns > 0) return true;
      if (st.queue.some(function (q) { return q.outerReturns > 0; })) return true;
    }
    return sim.transits.some(function (tr) {
      return tr.kind === 'outer_return' || tr.item.outerReturns > 0;
    });
  }

  function isPostShockJamActive() {
    if (!sim.postShockJamActive) return false;
    return (
      hasOuterReworkInFlight() &&
      (getTotalQueueCount() > 0 ||
        sim.transits.some(function (tr) { return tr.kind === 'outer_return'; }))
    );
  }

  function flushPipelineWithAndon(reason) {
    sim.postShockJamActive = false;
    const flushed = getTotalInFlightCount();
    if (flushed === 0) return;
    const flushKind = reason || 'preshock';
    sim.stations.discovery.active = null;
    sim.stations.discovery.queue = [];
    sim.stations.build.active = null;
    sim.stations.build.secondary = null;
    sim.stations.build.queue = [];
    sim.stations.testing.active = null;
    sim.stations.testing.queue = [];
    sim.stations.rollout.active = null;
    sim.stations.rollout.queue = [];
    sim.transits = [];
    sim.testingBanner = null;
    sim.lastDiscoveryTrace = null;
    sim.returnPulses = [];
    sim.spawnTimer = 0;
    sim.totalFlushedByAndon += flushed;
    sim.andonFlash = {
      elapsed: 0,
      duration: 1.95,
      flushedCount: flushed,
      kind: flushKind
    };
    spawnWorkItem();
    if (onMetricsChanged) onMetricsChanged();
  }

  function triggerWorldShock() {
    const prevPrimaryKey = sim.worldPhase >= 0.62 ? sim.worldToKey : sim.worldFromKey;
    let rawCands = SHAPE_KEYS.filter(function (k) {
      if (k === sim.worldFromKey || k === sim.worldToKey) return false;
      if (sim.shockCount > 0 && k === sim.worldPrevKey) return false;
      return true;
    });
    if (rawCands.length === 0) {
      rawCands = SHAPE_KEYS.filter(function (k) { return k !== prevPrimaryKey; });
    }
    let minJumpOverlap = Infinity;
    const scoredJump = rawCands.map(function (k) {
      const ov = computeOverlapFit(sim.worldRadii, BASE_SHAPES[k], 1.0, 1.0);
      if (ov < minJumpOverlap) minJumpOverlap = ov;
      return { key: k, ov: ov };
    });
    const sharpJumpPool = scoredJump
      .filter(function (e) { return e.ov <= minJumpOverlap + 0.02; })
      .map(function (e) { return e.key; });
    const nextKey = sharpJumpPool[Math.floor(sim.shockRng() * sharpJumpPool.length)];

    const rawFollow = SHAPE_KEYS.filter(function (k) { return k !== nextKey; });
    let minFollowOverlap = Infinity;
    const scoredFollow = rawFollow.map(function (k) {
      const ov = computeOverlapFit(BASE_SHAPES[nextKey], BASE_SHAPES[k], 1.0, 1.0);
      if (ov < minFollowOverlap) minFollowOverlap = ov;
      return { key: k, ov: ov };
    });
    const sharpFollowPool = scoredFollow
      .filter(function (e) { return e.ov <= minFollowOverlap + 0.04; })
      .map(function (e) { return e.key; });
    const followKey = sharpFollowPool[Math.floor(sim.shockRng() * sharpFollowPool.length)];

    sim.worldPrevKey = prevPrimaryKey;
    sim.worldFromKey = nextKey;
    sim.worldToKey = followKey;
    sim.worldPhase = 0.12;
    sim.worldRadii = cloneRadii(BASE_SHAPES[nextKey]);
    sim.worldLabel = nextKey;
    sim.shockCount += 1;
    sim.worldEpoch += 1;

    const preShockInFlight = getTotalInFlightCount();
    sim.shockFlash = {
      elapsed: 0,
      duration: 2.1,
      shapeName: nextKey,
      staleRemaining: preShockInFlight
    };

    if (isAndonActive()) {
      flushPipelineWithAndon();
    } else if (preShockInFlight > 0) {
      sim.postShockJamActive = true;
    }
  }

  function createFreshWorkItem(startedAtSec) {
    const seed = sim.nextSeed++;
    const capturedWorld = cloneRadii(sim.worldRadii);
    const capturedName = sim.worldPhase < 0.62 ? sim.worldFromKey : sim.worldToKey;

    return {
      id: seed - 100,
      seed: seed,
      bornEpoch: sim.worldEpoch,
      policyEpoch: sim.policyEpoch,
      stageElapsed: 0,
      capturedWorldRadii: capturedWorld,
      capturedName: capturedName,
      specRadii: cloneRadii(capturedWorld),
      builtRadii: null,
      currentBuildNoise: 0,
      reworkCount: 0,
      outerReturns: 0,
      firstLandingFitPct: null,
      diagnosedRolloutFix: false,
      diagnosedDiscoveryFix: false,
      diagnosedBuildFix: false,
      lastOuterExit: null,
      lastOuterMode: null,
      hasWrench: false,
      isBuildReworkPass: false,
      baseBuildNoiseBeforeRework: 0,
      testedPassed: false,
      specFitPct: 100,
      hadDiscoveryWarp: false,
      hadBuildWarp: false,
      reachScale: 1.0,
      reachFactor: 1.0,
      shippedLabel: capturedName,
      labelStatus: 'accurate',
      labelFactor: 1.0,
      startedAt: startedAtSec
    };
  }

  function spawnWorkItem() {
    const item = createFreshWorkItem(sim.clockSec);
    sim.transits.push({
      item: item,
      kind: 'to_discovery',
      elapsed: 0,
      duration: TRANSIT_SENSE
    });
  }

  function applyDiscoverySpecToItem(item) {
    let dNoise = getEffectiveDiscoveryNoise();
    if (item.diagnosedDiscoveryFix) {
      dNoise *= 0.12;
    }
    item.specRadii = warpShape(item.capturedWorldRadii, dNoise, item.seed + item.outerReturns * 97);
    item.hadDiscoveryWarp = dNoise > 0.12;
  }

  function startDiscoveryForItem(item) {
    applyDiscoverySpecToItem(item);
    item.stageElapsed = 0;
    sim.stations.discovery.active = item;
  }

  function enqueueOrStartDiscovery(item, refreshFromLiveWorld) {
    if (refreshFromLiveWorld) {
      item.capturedWorldRadii = cloneRadii(sim.worldRadii);
      item.capturedName = sim.worldPhase < 0.62 ? sim.worldFromKey : sim.worldToKey;
      item.bornEpoch = sim.worldEpoch;
      item.hasWrench = false;
      item.builtRadii = null;
    }
    item.specRadii = cloneRadii(item.capturedWorldRadii);
    item.stageElapsed = 0;

    if (!sim.stations.discovery.active) {
      startDiscoveryForItem(item);
    } else {
      sim.stations.discovery.queue.push(item);
    }
  }

  function applyBuildOutputToItem(item) {
    if (item.isBuildReworkPass) {
      const baseNoise = Math.min(item.baseBuildNoiseBeforeRework, getEffectiveBuildNoise());
      item.currentBuildNoise = Math.min(0.05, baseNoise * REWORK_NOISE_FACTOR);
      item.builtRadii = warpShape(
        item.specRadii,
        item.currentBuildNoise,
        item.seed + 7919 + (item.reworkCount + item.outerReturns) * 131
      );
    } else {
      item.currentBuildNoise = getEffectiveBuildNoise();
      item.builtRadii = warpShape(
        item.specRadii,
        item.currentBuildNoise,
        item.seed + 7919 + item.outerReturns * 53
      );
    }
    item.hadBuildWarp = item.currentBuildNoise > 0.12;
  }

  function startBuildForItem(item, slot) {
    if (item.isBuildReworkPass) {
      item.baseBuildNoiseBeforeRework = item.currentBuildNoise;
    }
    applyBuildOutputToItem(item);
    item.stageElapsed = 0;
    if (slot === 'secondary') {
      sim.stations.build.secondary = item;
    } else {
      sim.stations.build.active = item;
    }
  }

  function enqueueOrStartBuild(item, isRework) {
    item.isBuildReworkPass = Boolean(isRework);
    if (!isRework) {
      item.builtRadii = null;
    }
    item.stageElapsed = 0;

    if (!sim.stations.build.active) {
      startBuildForItem(item, 'active');
    } else if (getEffectiveBuildConcurrency() >= 2 && !sim.stations.build.secondary) {
      startBuildForItem(item, 'secondary');
    } else {
      sim.stations.build.queue.push(item);
    }
  }

  function routeAfterBuild(item) {
    if (getEffectiveTestingIdx() > 0) {
      sim.transits.push({
        item: item,
        kind: 'to_testing',
        elapsed: 0,
        duration: TRANSIT_TO_TESTING
      });
    } else {
      item.hasWrench = false;
      if (isRolloutActive()) {
        sim.transits.push({
          item: item,
          kind: 'to_rollout',
          fromAnchor: 'build_exit',
          elapsed: 0,
          duration: 0.42
        });
      } else {
        sim.transits.push({
          item: item,
          kind: 'to_users',
          fromAnchor: 'build_exit_users',
          elapsed: 0,
          duration: TRANSIT_IDEAL_GATES
        });
      }
    }
  }

  function enqueueOrStartTesting(item) {
    if (getEffectiveTestingIdx() === 0) {
      item.hasWrench = false;
      if (isRolloutActive()) {
        sim.transits.push({
          item: item,
          kind: 'to_rollout',
          fromAnchor: 'testing_entry',
          elapsed: 0,
          duration: TRANSIT_TO_ROLLOUT
        });
      } else {
        sim.transits.push({
          item: item,
          kind: 'to_users',
          fromAnchor: 'testing_entry',
          elapsed: 0,
          duration: TRANSIT_TESTING_TO_USERS
        });
      }
      return;
    }

    const specFit = computeOverlapFit(item.specRadii, item.builtRadii, 1.0, 1.0);
    item.specFitPct = Math.round(specFit * 100);
    item.stageElapsed = 0;

    if (!sim.stations.testing.active) {
      sim.stations.testing.active = item;
    } else {
      sim.stations.testing.queue.push(item);
    }
  }

  function enqueueOrStartRollout(item) {
    const pkg = computeRolloutPackaging(item.capturedName, item.diagnosedRolloutFix);
    item.reachScale = pkg.reachScale;
    item.reachFactor = pkg.reachFactor;
    item.shippedLabel = pkg.shippedLabel;
    item.labelStatus = pkg.labelStatus;
    item.labelFactor = pkg.labelFactor;
    item.stageElapsed = 0;

    if (!sim.stations.rollout.active) {
      sim.stations.rollout.active = item;
    } else {
      sim.stations.rollout.queue.push(item);
    }
  }

  // Isolates true root stage vs blind 1-bit guessing for Chapter 6+ Outer Loop routing
  function decideOuterLoopExit(it) {
    const specVsWorld = computeOverlapFit(sim.worldRadii, it.specRadii, 1.0, 1.0);
    const builtVsSpec = computeOverlapFit(it.specRadii, it.builtRadii, 1.0, 1.0);

    let trueFault;
    if (specVsWorld < 0.64) {
      trueFault = 'discovery';
    } else if (builtVsSpec < 0.68) {
      trueFault = 'build';
    } else if (it.reachFactor < 0.99 || it.labelFactor < 0.99) {
      trueFault = 'rollout';
    } else {
      trueFault = specVsWorld <= builtVsSpec ? 'discovery' : 'build';
    }

    if (isDiagnosticActive()) {
      return {
        mode: 'diagnosed',
        trueFault: trueFault,
        chosenExit: trueFault
      };
    }

    // Blind 1-bit metric guessing: systematically picks a mismatched department exit
    const rng = seededRandom(it.seed + 9001 + it.outerReturns * 37);
    const r = rng();
    let wrongExit;
    if (trueFault === 'discovery') {
      wrongExit = r < 0.65 ? 'rollout' : 'build';
    } else if (trueFault === 'rollout') {
      wrongExit = r < 0.55 ? 'build' : 'discovery';
    } else {
      wrongExit = r < 0.65 ? 'rollout' : 'discovery';
    }

    return {
      mode: 'blind',
      trueFault: trueFault,
      chosenExit: wrongExit
    };
  }

  function classifyLandingCause(it, fitPct) {
    if (fitPct >= 70) {
      return null;
    }
    const specVsWorld = computeOverlapFit(sim.worldRadii, it.specRadii, 1.0, 1.0);
    const builtVsSpec = computeOverlapFit(it.specRadii, it.builtRadii, 1.0, 1.0);
    if (specVsWorld >= 0.64 && builtVsSpec >= 0.68) {
      if (it.labelStatus === 'silent') {
        return 'silent';
      }
      if (it.labelStatus && it.labelStatus !== 'accurate') {
        return 'label';
      }
      if (isRolloutActive() && it.reachFactor < 0.80) {
        return 'reach';
      }
      if (specVsWorld > builtVsSpec) {
        return 'build';
      }
    }
    if (specVsWorld >= 0.64 && builtVsSpec < 0.68) {
      return 'build';
    }
    if (!isOuterRoutingActive() && builtVsSpec < specVsWorld - 0.12 && builtVsSpec < 0.72) {
      return 'build';
    }
    if (it.bornEpoch !== sim.worldEpoch) {
      return 'stale';
    }
    const capturedVsSpec = computeOverlapFit(it.capturedWorldRadii, it.specRadii, 1.0, 1.0);
    const capturedVsNow = computeOverlapFit(sim.worldRadii, it.capturedWorldRadii, 1.0, 1.0);
    if (it.hadDiscoveryWarp && (1 - capturedVsSpec) >= (1 - capturedVsNow) * 0.75) {
      return 'spec';
    }
    if (!isOuterRoutingActive() && !it.hadDiscoveryWarp && builtVsSpec < 0.74 && capturedVsNow >= 0.78) {
      return 'build';
    }
    return 'stale';
  }

  function completeArrivalAtUsers(it) {
    if (!isRolloutActive()) {
      it.reachScale = 1.0;
      it.reachFactor = 1.0;
      it.shippedLabel = it.capturedName;
      it.labelStatus = 'accurate';
      it.labelFactor = 1.0;
    }

    const fit = computeOverlapFit(
      sim.worldRadii,
      it.builtRadii,
      it.reachFactor,
      it.labelFactor
    );
    const pct = Math.round(fit * 100);
    const currentWorldName = sim.worldPhase < 0.62 ? sim.worldFromKey : sim.worldToKey;
    const leadTimeSec = Math.max(0.1, sim.clockSec - it.startedAt);
    const missCause = classifyLandingCause(it, pct);

    sim.landing = {
      builtRadii: it.builtRadii,
      specRadii: it.specRadii,
      trueName: it.capturedName,
      shippedLabel: it.shippedLabel,
      labelStatus: it.labelStatus,
      reachScale: it.reachScale,
      labelFactor: it.labelFactor,
      worldNameAtLanding: currentWorldName,
      testedPassed: it.testedPassed,
      reworkCount: it.reworkCount,
      leadTimeSec: leadTimeSec,
      hadWarp: it.hadDiscoveryWarp || it.hadBuildWarp,
      missCause: missCause,
      fitPct: pct,
      elapsed: 0
    };

    if (it.firstLandingFitPct === null) {
      it.firstLandingFitPct = pct;
    }

    const willRetryOuter =
      isOuterRoutingActive() && pct < 60 && it.outerReturns < MAX_OUTER_RETURNS;

    const eligibleForBreak =
      Boolean(sim.pendingPolicyBreak) && it.policyEpoch >= sim.pendingBreakTargetEpoch;
    const afterPolicyChange = eligibleForBreak;
    if (eligibleForBreak) {
      sim.pendingPolicyBreak = false;
      sim.pendingBreakMaxStage = 5;
    }

    const historyEntry = {
      id: it.id,
      initialFitPct: it.firstLandingFitPct,
      fitPct: pct,
      settled: !willRetryOuter,
      leadTimeSec: leadTimeSec,
      builtFor: it.capturedName,
      shippedLabel: it.shippedLabel,
      labelStatus: it.labelStatus,
      landedOn: currentWorldName,
      testedPassed: it.testedPassed,
      reworkCount: it.reworkCount,
      outerReturns: it.outerReturns,
      outerMode: it.lastOuterMode,
      outerExit: it.lastOuterExit,
      trueFault: it.lastTrueFault,
      missCause: missCause,
      warped: it.hadDiscoveryWarp || it.hadBuildWarp,
      afterPolicyChange: afterPolicyChange
    };
    sim.history.push(historyEntry);
    if (sim.history.length > 16) sim.history.shift();
    if (onMetricsChanged) onMetricsChanged();

    // In Chapter 6+, failed launches (< 60% fit) return along the Outer Loop highway exits
    if (willRetryOuter) {
      const decision = decideOuterLoopExit(it);
      it.outerReturns += 1;
      it.lastOuterMode = decision.mode;
      it.lastOuterExit = decision.chosenExit;
      it.lastTrueFault = decision.trueFault;

      if (decision.mode === 'diagnosed') {
        if (decision.chosenExit === 'rollout') it.diagnosedRolloutFix = true;
        if (decision.chosenExit === 'build') {
          it.hasWrench = true;
          it.diagnosedBuildFix = true;
        }
        if (decision.chosenExit === 'discovery') it.diagnosedDiscoveryFix = true;
      }

      sim.transits.push({
        item: it,
        kind: 'outer_return',
        exitTarget: decision.chosenExit,
        trueFault: decision.trueFault,
        mode: decision.mode,
        elapsed: 0,
        duration: decision.mode === 'diagnosed' ? OUTER_DIAG_RETURN_SEC : OUTER_BLIND_RETURN_SEC
      });
      return;
    }

    sim.returnPulses.push({
      elapsed: 0,
      fitPct: pct
    });
  }

  function flushTestingStationIfOff() {
    while (sim.stations.testing.active || sim.stations.testing.queue.length > 0) {
      const flushed = sim.stations.testing.active || sim.stations.testing.queue.shift();
      sim.stations.testing.active = null;
      flushed.hasWrench = false;
      if (isRolloutActive()) {
        sim.transits.push({
          item: flushed,
          kind: 'to_rollout',
          fromAnchor: 'testing_exit',
          elapsed: 0,
          duration: TRANSIT_TO_ROLLOUT
        });
      } else {
        sim.transits.push({
          item: flushed,
          kind: 'to_users',
          fromAnchor: 'testing_exit_users',
          elapsed: 0,
          duration: TRANSIT_TESTING_TO_USERS
        });
      }
    }
  }

  function getControlPolicyStage(controlKey) {
    if (controlKey === 'demand' || controlKey === 'wip') {
      return 0;
    }
    if (controlKey === 'discovery' || controlKey === 'discoveryNoise' || controlKey === 'discoveryDampener') {
      return 1;
    }
    if (controlKey === 'build' || controlKey === 'build10x' || controlKey === 'buildNoise' || controlKey === 'buildDampener') {
      return 2;
    }
    if (controlKey === 'testing') {
      return 3;
    }
    if (controlKey === 'reach' || controlKey === 'messagingNoise' || controlKey === 'rolloutDampener') {
      return 4;
    }
    return 5;
  }

  function forEachInFlightItemWithStage(fn) {
    if (sim.stations.discovery.active) fn(sim.stations.discovery.active, 1);
    for (let i = 0; i < sim.stations.discovery.queue.length; i++) {
      fn(sim.stations.discovery.queue[i], 1);
    }
    if (sim.stations.build.active) fn(sim.stations.build.active, 2);
    if (sim.stations.build.secondary) fn(sim.stations.build.secondary, 2);
    for (let i = 0; i < sim.stations.build.queue.length; i++) {
      fn(sim.stations.build.queue[i], 2);
    }
    if (sim.stations.testing.active) fn(sim.stations.testing.active, 3);
    for (let i = 0; i < sim.stations.testing.queue.length; i++) {
      fn(sim.stations.testing.queue[i], 3);
    }
    if (sim.stations.rollout.active) fn(sim.stations.rollout.active, 4);
    for (let i = 0; i < sim.stations.rollout.queue.length; i++) {
      fn(sim.stations.rollout.queue[i], 4);
    }
    for (let i = 0; i < sim.transits.length; i++) {
      const tr = sim.transits[i];
      let st = 5;
      if (tr.kind === 'to_discovery' || (tr.kind === 'outer_return' && tr.exitTarget === 'discovery')) {
        st = 1;
      } else if (
        tr.kind === 'to_build' ||
        tr.kind === 'inner_rework' ||
        (tr.kind === 'outer_return' && tr.exitTarget === 'build')
      ) {
        st = 2;
      } else if (
        tr.kind === 'to_testing' ||
        ((tr.fromAnchor === 'testing_exit' || tr.fromAnchor === 'testing_exit_users') && tr.elapsed === 0)
      ) {
        st = 3;
      } else if (tr.kind === 'to_rollout' || (tr.kind === 'outer_return' && tr.exitTarget === 'rollout')) {
        st = 4;
      }
      fn(tr.item, st);
    }
  }

  function markPolicyChange(controlKey) {
    const stage = getControlPolicyStage(controlKey);
    const hadPending = sim.pendingPolicyBreak;
    const minEligibleEpoch = hadPending ? sim.pendingBreakTargetEpoch : 0;
    const combinedMaxStage = hadPending ? Math.min(sim.pendingBreakMaxStage, stage) : stage;

    sim.policyEpoch += 1;
    const nextEpoch = sim.policyEpoch;
    sim.pendingBreakTargetEpoch = nextEpoch;
    sim.pendingBreakMaxStage = combinedMaxStage;
    if (sim.history.length > 0) {
      sim.pendingPolicyBreak = true;
    }

    forEachInFlightItemWithStage(function (it, itStage) {
      if (itStage <= stage && it.policyEpoch >= minEligibleEpoch) {
        it.policyEpoch = nextEpoch;
      }
    });
  }

  function snapshotPolicyBreakState() {
    const itemEpochs = {};
    forEachInFlightItemWithStage(function (it) {
      itemEpochs[it.id] = it.policyEpoch;
    });
    return {
      policyEpoch: sim.policyEpoch,
      pendingPolicyBreak: sim.pendingPolicyBreak,
      pendingBreakTargetEpoch: sim.pendingBreakTargetEpoch,
      pendingBreakMaxStage: sim.pendingBreakMaxStage,
      itemEpochs: itemEpochs
    };
  }

  function restorePolicyBreakState(saved) {
    if (!saved) return;
    sim.policyEpoch = saved.policyEpoch;
    sim.pendingPolicyBreak = saved.pendingPolicyBreak;
    sim.pendingBreakTargetEpoch = saved.pendingBreakTargetEpoch;
    sim.pendingBreakMaxStage = saved.pendingBreakMaxStage;
    forEachInFlightItemWithStage(function (it) {
      if (Object.prototype.hasOwnProperty.call(saved.itemEpochs, it.id)) {
        it.policyEpoch = saved.itemEpochs[it.id];
      }
    });
  }

  function refreshActiveDiscoverySpec() {
    if (sim.stations.discovery.active) {
      applyDiscoverySpecToItem(sim.stations.discovery.active);
    }
  }

  function refreshActiveBuildOutput() {
    const buildCap = getEffectiveBuildConcurrency();
    if (buildCap < 2 && sim.stations.build.secondary) {
      const demoted = sim.stations.build.secondary;
      sim.stations.build.secondary = null;
      if (!demoted.isBuildReworkPass) {
        demoted.builtRadii = null;
      }
      demoted.stageElapsed = 0;
      sim.stations.build.queue.unshift(demoted);
    }
    if (sim.stations.build.active) {
      applyBuildOutputToItem(sim.stations.build.active);
    }
    if (sim.stations.build.secondary) {
      applyBuildOutputToItem(sim.stations.build.secondary);
    }
    if (buildCap >= 2 && sim.stations.build.active && !sim.stations.build.secondary && sim.stations.build.queue.length > 0) {
      startBuildForItem(sim.stations.build.queue.shift(), 'secondary');
    }
  }

  function refreshActiveRolloutPackaging() {
    if (isRolloutActive() && sim.stations.rollout.active) {
      const rItem = sim.stations.rollout.active;
      const pkg = computeRolloutPackaging(rItem.capturedName, rItem.diagnosedRolloutFix);
      rItem.reachScale = pkg.reachScale;
      rItem.reachFactor = pkg.reachFactor;
      rItem.shippedLabel = pkg.shippedLabel;
      rItem.labelStatus = pkg.labelStatus;
      rItem.labelFactor = pkg.labelFactor;
    }
  }

  function isTacticallyPaused() {
    return (
      sim.running &&
      (Boolean(sim.sliderGesture && sim.sliderGesture.pointerActive) ||
        sim.tacticalPauseRemaining > 0)
    );
  }

  function triggerTacticalPause(durationSec) {
    if (!sim.running) return;
    const dur = typeof durationSec === 'number' && durationSec > 0 ? durationSec : TACTICAL_PAUSE_SEC;
    sim.tacticalPauseDuration = dur;
    sim.tacticalPauseRemaining = dur;
  }

  function clearTacticalPause() {
    sim.tacticalPauseRemaining = 0;
  }

  function advanceTacticalPause(rawDt) {
    if (!sim.running) {
      sim.tacticalPauseRemaining = 0;
      return false;
    }
    if (sim.sliderGesture && sim.sliderGesture.pointerActive) {
      sim.tacticalPauseRemaining = sim.tacticalPauseDuration || TACTICAL_PAUSE_SEC;
      return true;
    }
    if (sim.tacticalPauseRemaining > 0) {
      sim.tacticalPauseRemaining = Math.max(0, sim.tacticalPauseRemaining - rawDt);
      return sim.tacticalPauseRemaining > 0;
    }
    return false;
  }

  function advanceSpotlightTimer(dt) {
    if (sim.activeSpotlight) {
      sim.activeSpotlight.elapsed += dt;
      if (sim.activeSpotlight.elapsed >= sim.activeSpotlight.duration) {
        sim.activeSpotlight = null;
      }
    }
  }

  function stepSimulation(dt) {
    sim.clockSec += dt;
    updateWorld(dt);

    if (sim.testingBanner) {
      sim.testingBanner.elapsed += dt;
      if (sim.testingBanner.elapsed >= 0.65) {
        sim.testingBanner = null;
      }
    }

    if (sim.shockFlash) {
      sim.shockFlash.elapsed += dt;
      if (sim.shockFlash.elapsed >= sim.shockFlash.duration) {
        sim.shockFlash = null;
      }
    }

    if (sim.andonFlash) {
      sim.andonFlash.elapsed += dt;
      if (sim.andonFlash.elapsed >= sim.andonFlash.duration) {
        sim.andonFlash = null;
      }
    }

    if (sim.landing) {
      sim.landing.elapsed += dt;
      if (sim.landing.elapsed >= OUTCOME_HOLD_SEC) {
        sim.landing = null;
      }
    }

    function tryAdmitFromGate() {
      if (settings.chapter < 4) {
        if (getTotalInFlightCount() === 0 && sim.returnPulses.length === 0) {
          spawnWorkItem();
        }
        return;
      }
      const dReg = DEMAND_REGIMES[getEffectiveDemandIdx()];
      const wReg = WIP_REGIMES[getEffectiveWipIdx()];
      if (wReg.maxWip === 1) {
        if (
          getTotalInFlightCount() === 0 &&
          sim.returnPulses.length === 0 &&
          sim.spawnTimer >= dReg.intervalSec
        ) {
          sim.spawnTimer = 0;
          spawnWorkItem();
        }
      } else if (sim.spawnTimer >= dReg.intervalSec && getTotalInFlightCount() < wReg.maxWip) {
        sim.spawnTimer = 0;
        spawnWorkItem();
      }
    }

    if (settings.chapter >= 4) {
      const dReg = DEMAND_REGIMES[getEffectiveDemandIdx()];
      sim.spawnTimer = Math.min(sim.spawnTimer + dt, dReg.intervalSec);
    }

    for (let i = sim.returnPulses.length - 1; i >= 0; i--) {
      const rp = sim.returnPulses[i];
      rp.elapsed += dt;
      if (rp.elapsed >= OUTER_RETURN_SEC) {
        sim.returnPulses.splice(i, 1);
      }
    }

    tryAdmitFromGate();

    // 1. Discovery station
    if (!sim.stations.discovery.active && sim.stations.discovery.queue.length > 0) {
      startDiscoveryForItem(sim.stations.discovery.queue.shift());
    }
    if (sim.stations.discovery.active) {
      const dItem = sim.stations.discovery.active;
      dItem.stageElapsed += dt;
      if (dItem.stageElapsed >= getEffectiveDiscoverySec()) {
        sim.lastDiscoveryTrace = {
          capturedWorldRadii: cloneRadii(dItem.capturedWorldRadii),
          specRadii: cloneRadii(dItem.specRadii),
          capturedName: dItem.capturedName,
          hadDiscoveryWarp: Boolean(dItem.hadDiscoveryWarp)
        };
        sim.stations.discovery.active = null;
        sim.transits.push({
          item: dItem,
          kind: 'to_build',
          elapsed: 0,
          duration: TRANSIT_TO_BUILD
        });
        if (sim.stations.discovery.queue.length > 0) {
          startDiscoveryForItem(sim.stations.discovery.queue.shift());
        }
      }
    }

    // 2. Build station (1 paired slot or up to 2 parallel solo slots in Ch. 4+)
    const buildCap = getEffectiveBuildConcurrency();
    if (buildCap < 2 && sim.stations.build.secondary) {
      const demoted = sim.stations.build.secondary;
      sim.stations.build.secondary = null;
      if (!demoted.isBuildReworkPass) {
        demoted.builtRadii = null;
      }
      demoted.stageElapsed = 0;
      sim.stations.build.queue.unshift(demoted);
    }
    if (!sim.stations.build.active && sim.stations.build.secondary) {
      sim.stations.build.active = sim.stations.build.secondary;
      sim.stations.build.secondary = null;
    }
    if (!sim.stations.build.active && sim.stations.build.queue.length > 0) {
      startBuildForItem(sim.stations.build.queue.shift(), 'active');
    }
    if (buildCap >= 2 && !sim.stations.build.secondary && sim.stations.build.queue.length > 0) {
      startBuildForItem(sim.stations.build.queue.shift(), 'secondary');
    }

    const buildDurNow = getEffectiveBuildSec();
    if (sim.stations.build.active) {
      sim.stations.build.active.stageElapsed += dt;
    }
    if (sim.stations.build.secondary) {
      sim.stations.build.secondary.stageElapsed += dt;
    }
    if (sim.stations.build.active && sim.stations.build.active.stageElapsed >= buildDurNow) {
      const donePrimary = sim.stations.build.active;
      sim.stations.build.active = null;
      routeAfterBuild(donePrimary);
    }
    if (sim.stations.build.secondary && sim.stations.build.secondary.stageElapsed >= buildDurNow) {
      const doneSecondary = sim.stations.build.secondary;
      sim.stations.build.secondary = null;
      routeAfterBuild(doneSecondary);
    }
    if (!sim.stations.build.active && sim.stations.build.secondary) {
      sim.stations.build.active = sim.stations.build.secondary;
      sim.stations.build.secondary = null;
    }
    if (!sim.stations.build.active && sim.stations.build.queue.length > 0) {
      startBuildForItem(sim.stations.build.queue.shift(), 'active');
    }
    if (buildCap >= 2 && !sim.stations.build.secondary && sim.stations.build.queue.length > 0) {
      startBuildForItem(sim.stations.build.queue.shift(), 'secondary');
    }

    // 3. Testing station
    const tIdx = getEffectiveTestingIdx();
    if (tIdx === 0) {
      flushTestingStationIfOff();
    } else {
      if (!sim.stations.testing.active && sim.stations.testing.queue.length > 0) {
        sim.stations.testing.active = sim.stations.testing.queue.shift();
        sim.stations.testing.active.stageElapsed = 0;
      }
      if (sim.stations.testing.active) {
        const tItem = sim.stations.testing.active;
        tItem.stageElapsed += dt;
        if (tItem.stageElapsed >= TESTING_REGIMES[tIdx].sec) {
          sim.stations.testing.active = null;
          const specFit = computeOverlapFit(tItem.specRadii, tItem.builtRadii, 1.0, 1.0);
          if (specFit < TESTING_REGIMES[tIdx].threshold && tItem.reworkCount < MAX_REWORK_PASSES) {
            tItem.reworkCount += 1;
            tItem.hasWrench = true;
            tItem.testedPassed = false;
            sim.testingBanner = { type: 'rework', elapsed: 0 };
            sim.transits.push({
              item: tItem,
              kind: 'inner_rework',
              elapsed: 0,
              duration: INNER_REWORK_SEC
            });
          } else {
            tItem.hasWrench = false;
            tItem.testedPassed = true;
            sim.testingBanner = { type: 'pass', elapsed: 0 };
            if (isRolloutActive()) {
              sim.transits.push({
                item: tItem,
                kind: 'to_rollout',
                elapsed: 0,
                duration: TRANSIT_TO_ROLLOUT
              });
            } else {
              sim.transits.push({
                item: tItem,
                kind: 'from_testing_to_users',
                elapsed: 0,
                duration: TRANSIT_TESTING_TO_USERS
              });
            }
          }
          if (sim.stations.testing.queue.length > 0) {
            sim.stations.testing.active = sim.stations.testing.queue.shift();
            sim.stations.testing.active.stageElapsed = 0;
          }
        }
      }
    }

    // 4. Rollout station (active in Chapter 5+)
    if (isRolloutActive()) {
      if (!sim.stations.rollout.active && sim.stations.rollout.queue.length > 0) {
        sim.stations.rollout.active = sim.stations.rollout.queue.shift();
        sim.stations.rollout.active.stageElapsed = 0;
      }
      if (sim.stations.rollout.active) {
        const rItem = sim.stations.rollout.active;
        const pkg = computeRolloutPackaging(rItem.capturedName, rItem.diagnosedRolloutFix);
        rItem.reachScale = pkg.reachScale;
        rItem.reachFactor = pkg.reachFactor;
        rItem.shippedLabel = pkg.shippedLabel;
        rItem.labelStatus = pkg.labelStatus;
        rItem.labelFactor = pkg.labelFactor;

        rItem.stageElapsed += dt;
        if (rItem.stageElapsed >= getEffectiveRolloutSec()) {
          sim.stations.rollout.active = null;
          sim.transits.push({
            item: rItem,
            kind: 'from_rollout_to_users',
            elapsed: 0,
            duration: TRANSIT_ROLLOUT_TO_USERS
          });
          if (sim.stations.rollout.queue.length > 0) {
            sim.stations.rollout.active = sim.stations.rollout.queue.shift();
            sim.stations.rollout.active.stageElapsed = 0;
          }
        }
      }
    }

    // Step in-transit animations
    for (let i = sim.transits.length - 1; i >= 0; i--) {
      const tr = sim.transits[i];
      tr.elapsed += dt;
      if (tr.elapsed >= tr.duration) {
        sim.transits.splice(i, 1);
        if (tr.kind === 'to_discovery') {
          enqueueOrStartDiscovery(tr.item, false);
        } else if (tr.kind === 'to_build') {
          enqueueOrStartBuild(tr.item, Boolean(tr.item.diagnosedBuildFix));
        } else if (tr.kind === 'inner_rework') {
          enqueueOrStartBuild(tr.item, true);
        } else if (tr.kind === 'to_testing') {
          enqueueOrStartTesting(tr.item);
        } else if (tr.kind === 'to_rollout') {
          enqueueOrStartRollout(tr.item);
        } else if (tr.kind === 'outer_return') {
          if (tr.exitTarget === 'rollout') {
            if (sim.pendingBreakMaxStage >= 4) tr.item.policyEpoch = sim.policyEpoch;
            enqueueOrStartRollout(tr.item);
          } else if (tr.exitTarget === 'build') {
            if (sim.pendingBreakMaxStage >= 2) tr.item.policyEpoch = sim.policyEpoch;
            enqueueOrStartBuild(tr.item, tr.mode === 'diagnosed');
          } else {
            tr.item.policyEpoch = sim.policyEpoch;
            enqueueOrStartDiscovery(tr.item, true);
          }
        } else if (
          tr.kind === 'from_testing_to_users' ||
          tr.kind === 'from_rollout_to_users' ||
          tr.kind === 'to_users'
        ) {
          completeArrivalAtUsers(tr.item);
        }
      }
    }

    tryAdmitFromGate();

    if (
      sim.postShockJamActive &&
      !hasPreShockItemsInFlight() &&
      (!hasOuterReworkInFlight() ||
        (getTotalQueueCount() === 0 &&
          !sim.transits.some(function (tr) { return tr.kind === 'outer_return'; })))
    ) {
      sim.postShockJamActive = false;
    }
  }

  function seedInitialFlowItems() {
    if (settings.chapter === 7 && WIP_REGIMES[getEffectiveWipIdx()].maxWip >= 3 && isRolloutActive()) {
      // Start Chapter 7 with steady flow mid-stride across Rollout (#1), Build (#2), and Discovery (#3), with Queue: 0
      const rItem = createFreshWorkItem(-4.2);
      applyDiscoverySpecToItem(rItem);
      applyBuildOutputToItem(rItem);
      rItem.testedPassed = getEffectiveTestingIdx() > 0;
      const pkg = computeRolloutPackaging(rItem.capturedName, false);
      rItem.reachScale = pkg.reachScale;
      rItem.reachFactor = pkg.reachFactor;
      rItem.shippedLabel = pkg.shippedLabel;
      rItem.labelStatus = pkg.labelStatus;
      rItem.labelFactor = pkg.labelFactor;
      rItem.stageElapsed = 0.2;
      sim.stations.rollout.active = rItem;

      const bItem = createFreshWorkItem(-2.1);
      applyDiscoverySpecToItem(bItem);
      startBuildForItem(bItem, 'active');
      bItem.stageElapsed = 0.2;

      const dItem = createFreshWorkItem(0);
      startDiscoveryForItem(dItem);
      dItem.stageElapsed = 0.15;
      return;
    }
    spawnWorkItem();
  }

  function applyChapterSettings(chNum) {
    const ch = CHAPTERS[chNum];
    if (!ch) return false;

    settings.chapter = chNum;
    settings.shockIdx = 0;
    settings.andonCord = false;
    Object.keys(ch.defaults).forEach(function (k) {
      settings[k] = ch.defaults[k];
    });
    sim.hoverStack.length = 0;
    sim.hoverControlKey = null;
    sim.hoverCommittedKey = null;
    sim.hoverImpactBar = false;
    sim.activeSpotlight = null;
    sim.lastSpotlightZones = [];
    sim.lastImpact = null;
    sim.sliderGesture = null;
    sim.tacticalPauseRemaining = 0;
    sim.policyEpoch = 0;
    sim.pendingPolicyBreak = false;
    sim.pendingBreakTargetEpoch = 0;
    sim.pendingBreakMaxStage = 5;
    return true;
  }

  function resetSimulationState() {
    sim.clockSec = 0;
    sim.nextSeed = 101;
    sim.worldRng = seededRandom(4242);
    sim.shockRng = seededRandom(7717);
    sim.shockTimer = 0;
    sim.nextShockInterval = Infinity;
    sim.shockCount = 0;
    sim.worldEpoch = 0;
    sim.postShockJamActive = false;
    sim.totalFlushedByAndon = 0;
    sim.shockFlash = null;
    sim.andonFlash = null;
    if (getEffectiveShockIdx() > 0) {
      scheduleNextShockInterval();
    }
    sim.worldPrevKey = 'CROSS';
    sim.worldFromKey = 'STAR';
    sim.worldToKey = 'CIRCLE';
    sim.worldPhase = 0;
    sim.worldRadii = cloneRadii(BASE_SHAPES.STAR);
    sim.worldLabel = 'STAR';

    sim.spawnTimer = 0;
    sim.stations.discovery.active = null;
    sim.stations.discovery.queue = [];
    sim.stations.build.active = null;
    sim.stations.build.secondary = null;
    sim.stations.build.queue = [];
    sim.stations.testing.active = null;
    sim.stations.testing.queue = [];
    sim.stations.rollout.active = null;
    sim.stations.rollout.queue = [];
    sim.transits = [];
    sim.testingBanner = null;
    sim.lastDiscoveryTrace = null;
    sim.landing = null;
    sim.returnPulses = [];
    sim.history = [];
    sim.policyEpoch = 0;
    sim.pendingPolicyBreak = false;
    sim.pendingBreakTargetEpoch = 0;
    sim.pendingBreakMaxStage = 5;
    sim.sliderGesture = null;
    sim.tacticalPauseRemaining = 0;
    sim.hoverCommittedKey = null;
    sim.activeSpotlight = null;
    sim.lastSpotlightZones = [];
    sim.lastImpact = null;

    seedInitialFlowItems();
  }

  function loadChapter(chNum) {
    if (applyChapterSettings(chNum)) {
      resetSimulationState();
    }
  }

  function loadPreset(chNum, presetIdx) {
    if (settings.chapter !== chNum) {
      applyChapterSettings(chNum);
    }
    const ch = CHAPTERS[chNum];
    if (!ch || !ch.presets[presetIdx]) return;
    const preset = ch.presets[presetIdx];
    Object.keys(preset.values).forEach(function (k) {
      settings[k] = preset.values[k];
    });
    resetSimulationState();
  }

  // ---------------------------------------------------------------------------
  // 4. Adaptation Loop Estimate, Snapshot Diffing, & Logical Spotlight Zones
  // ---------------------------------------------------------------------------
  function computeAdaptationLoopInfo() {
    const tIdx = getEffectiveTestingIdx();
    const discStepSec = getEffectiveDiscoverySec() + TRANSIT_TO_BUILD;
    const buildStepSec = getEffectiveBuildSec();
    const bNoise = getEffectiveBuildNoise();

    let cleanPostBuildSec = 0;
    let postBuildSec = 0;
    let expectsInnerRework = false;
    if (tIdx > 0) {
      const testPassSec = TRANSIT_TO_TESTING + TESTING_REGIMES[tIdx].sec;
      const tailSec = isRolloutActive()
        ? TRANSIT_TO_ROLLOUT + getEffectiveRolloutSec() + TRANSIT_ROLLOUT_TO_USERS
        : TRANSIT_TESTING_TO_USERS;
      cleanPostBuildSec = testPassSec + tailSec;
      postBuildSec = cleanPostBuildSec;
      if ((bNoise >= 0.5 && tIdx >= 2) || (bNoise >= 0.21 && tIdx >= 3)) {
        expectsInnerRework = true;
        postBuildSec += INNER_REWORK_SEC + buildStepSec + testPassSec;
      }
    } else if (isRolloutActive()) {
      cleanPostBuildSec = 0.42 + getEffectiveRolloutSec() + TRANSIT_ROLLOUT_TO_USERS;
      postBuildSec = cleanPostBuildSec;
    } else {
      cleanPostBuildSec = TRANSIT_IDEAL_GATES;
      postBuildSec = cleanPostBuildSec;
    }

    let baseSec = TRANSIT_SENSE + discStepSec + buildStepSec + postBuildSec;
    let expectsOuterRework = false;
    let outerLoopSec = 0;
    let specOuterActive = false;
    let buildOuterActive = false;
    let rolloutOuterActive = false;

    if (isOuterRoutingActive()) {
      const dNoise = getEffectiveDiscoveryNoise();
      const mNoise = getEffectiveMessagingNoise();
      const specFailWeight =
        dNoise <= 0.26
          ? 0
          : dNoise >= 0.62
            ? 1
            : (dNoise - 0.26) / 0.36;
      const escapedBuildBug = bNoise >= 0.5 && !expectsInnerRework;
      const badRollout = settings.reachIdx <= 1 || mNoise >= 0.45;
      const outerWeight = escapedBuildBug || badRollout ? 1 : specFailWeight;
      specOuterActive = specFailWeight >= 0.15;
      buildOuterActive = escapedBuildBug;
      rolloutOuterActive = badRollout;

      if (outerWeight > 0) {
        if (outerWeight >= 0.15) {
          expectsOuterRework = true;
        }
        const rolloutRetrySec = getEffectiveRolloutSec() + TRANSIT_ROLLOUT_TO_USERS;
        const buildRetrySec = buildStepSec + cleanPostBuildSec;
        const discRetrySec = discStepSec + buildStepSec + cleanPostBuildSec;
        const specDominates = specFailWeight > 0 && (!escapedBuildBug && !badRollout || specFailWeight >= 0.5);

        if (isDiagnosticActive()) {
          if (specDominates) {
            outerLoopSec = outerWeight * (OUTER_DIAG_RETURN_SEC + discRetrySec);
          } else if (escapedBuildBug) {
            outerLoopSec = OUTER_DIAG_RETURN_SEC + buildRetrySec;
          } else {
            outerLoopSec = OUTER_DIAG_RETURN_SEC + rolloutRetrySec;
          }
        } else {
          const specWrongPassSec = 0.65 * rolloutRetrySec + 0.35 * buildRetrySec;
          const buildWrongPassSec = 0.65 * rolloutRetrySec + 0.35 * discRetrySec;
          const rolloutWrongPassSec = 0.55 * buildRetrySec + 0.45 * discRetrySec;
          let singleWrongPassSec = 0;
          if (specFailWeight > 0) singleWrongPassSec = Math.max(singleWrongPassSec, specWrongPassSec);
          if (escapedBuildBug) singleWrongPassSec = Math.max(singleWrongPassSec, buildWrongPassSec);
          if (badRollout) singleWrongPassSec = Math.max(singleWrongPassSec, rolloutWrongPassSec);
          outerLoopSec = outerWeight * MAX_OUTER_RETURNS * (OUTER_BLIND_RETURN_SEC + singleWrongPassSec);
        }
        baseSec += outerLoopSec;
      }
    }

    const discUnitSec = getEffectiveDiscoverySec();
    const buildUnitSec = getEffectiveBuildSec() / getEffectiveBuildConcurrency();
    const testUnitSec = tIdx > 0 ? TESTING_REGIMES[tIdx].sec : 0;
    const rolloutUnitSec = isRolloutActive() ? getEffectiveRolloutSec() : 0;

    const qWait =
      sim.stations.discovery.queue.length * discUnitSec +
      sim.stations.build.queue.length * buildUnitSec +
      sim.stations.testing.queue.length * testUnitSec +
      sim.stations.rollout.queue.length * rolloutUnitSec;

    let projectedQueueWait = 0;
    if (settings.chapter >= 4) {
      const maxWip = WIP_REGIMES[getEffectiveWipIdx()].maxWip;
      if (maxWip > 3) {
        const arrivalSec = DEMAND_REGIMES[getEffectiveDemandIdx()].intervalSec;
        const innerMult = expectsInnerRework ? 2 : 1;
        const outerDiag = isDiagnosticActive();
        const discCap = discUnitSec * (1 + (expectsOuterRework ? (outerDiag ? (specOuterActive ? 0.85 : 0) : 0.70) : 0));
        const buildCap = buildUnitSec * innerMult * (1 + (expectsOuterRework ? (outerDiag ? (buildOuterActive ? 1 : 0) : 0.70) : 0));
        const testCap = testUnitSec * innerMult;
        const rolloutCap = rolloutUnitSec * (1 + (expectsOuterRework ? (outerDiag ? (rolloutOuterActive ? 1 : 0) : 0.90) : 0));

        const stationCaps = [
          { id: 'discovery', cap: discCap, unit: discUnitSec },
          { id: 'build', cap: buildCap, unit: buildUnitSec },
          { id: 'testing', cap: testCap, unit: testUnitSec },
          { id: 'rollout', cap: rolloutCap, unit: rolloutUnitSec }
        ];
        let bottleneck = stationCaps[0];
        for (let i = 1; i < stationCaps.length; i++) {
          if (stationCaps[i].cap > bottleneck.cap) {
            bottleneck = stationCaps[i];
          }
        }

        if (bottleneck.cap > arrivalSec * 0.98) {
          const overloadRamp = Math.min(1, (bottleneck.cap - arrivalSec * 0.98) / (arrivalSec * 0.22));
          const cleanSinglePassSec = TRANSIT_SENSE + discStepSec + buildStepSec + cleanPostBuildSec;
          const activeHeadroom = settings.build10x && bottleneck.id === 'testing'
            ? 1.8
            : (getEffectiveBuildConcurrency() >= 2 && bottleneck.id === 'testing' ? 3.3 : 2.6);
          const saturatedQueued = Math.max(0, maxWip - activeHeadroom);
          const steadyLoopSec =
            cleanSinglePassSec +
            saturatedQueued * bottleneck.unit +
            (expectsInnerRework ? INNER_REWORK_SEC + testUnitSec : 0) +
            outerLoopSec;
          projectedQueueWait = Math.max(0, steadyLoopSec - baseSec) * overloadRamp;
        }
      }
    }

    const effectiveQueueWait = Math.max(qWait, projectedQueueWait);
    const queuesBuilding = projectedQueueWait > qWait + 0.35;

    return {
      sec: baseSec + effectiveQueueWait,
      expectsRework: expectsInnerRework || expectsOuterRework,
      expectsInnerRework: expectsInnerRework,
      expectsOuterRework: expectsOuterRework,
      outerLoopSec: outerLoopSec,
      specOuterActive: specOuterActive,
      buildOuterActive: buildOuterActive,
      rolloutOuterActive: rolloutOuterActive,
      queuedNow: getTotalQueueCount(),
      queuesBuilding: queuesBuilding
    };
  }

  function captureMetricsSnapshot() {
    const loopInfo = computeAdaptationLoopInfo();
    const tIdx = getEffectiveTestingIdx();
    const sIdx = getEffectiveShockIdx();
    const dIdx = getEffectiveDemandIdx();
    const wIdx = getEffectiveWipIdx();
    return {
      chapter: settings.chapter,
      demandIdx: dIdx,
      wipIdx: wIdx,
      maxWip: WIP_REGIMES[wIdx].maxWip,
      demandSec: DEMAND_REGIMES[dIdx].intervalSec,
      driftIdx: settings.driftIdx,
      shockIdx: sIdx,
      discoveryIdx: settings.discoveryIdx,
      buildIdx: settings.buildIdx,
      build10x: settings.chapter >= 4 && settings.build10x,
      discoveryNoiseIdx: settings.discoveryNoiseIdx,
      discoveryDampener: settings.chapter >= 2 && settings.discoveryDampener,
      buildNoiseIdx: settings.buildNoiseIdx,
      buildDampener: settings.chapter >= 2 && settings.buildDampener,
      testingIdx: tIdx,
      reachIdx: settings.chapter >= 5 ? settings.reachIdx : 3,
      messagingNoiseIdx: settings.messagingNoiseIdx,
      rolloutDampener: settings.chapter >= 5 && settings.rolloutDampener,
      diagnosticActive: isDiagnosticActive(),
      andonActive: isAndonActive(),
      oversizedBatch: isOversizedBuildBatch(),
      loopSec: loopInfo.sec,
      expectsRework: loopInfo.expectsRework,
      expectsInnerRework: loopInfo.expectsInnerRework,
      expectsOuterRework: loopInfo.expectsOuterRework,
      outerLoopSec: loopInfo.outerLoopSec,
      specOuterActive: loopInfo.specOuterActive,
      buildOuterActive: loopInfo.buildOuterActive,
      rolloutOuterActive: loopInfo.rolloutOuterActive,
      worldSec: DRIFT_REGIMES[settings.driftIdx].cycleSec,
      shockSec: sIdx > 0 ? SHOCK_REGIMES[sIdx].intervalSec : Infinity,
      discSec: getEffectiveDiscoverySec(),
      buildSec: getEffectiveBuildSec(),
      buildConcurrency: getEffectiveBuildConcurrency(),
      testSec: tIdx > 0 ? TESTING_REGIMES[tIdx].sec : 0,
      rolloutSec: getEffectiveRolloutSec(),
      discNoisePct: Math.round(getEffectiveDiscoveryNoise() * 100),
      buildNoisePct: Math.round(getEffectiveBuildNoise() * 100),
      msgNoisePct: Math.round(getEffectiveMessagingNoise() * 100),
      reachPct: Math.round(getEffectiveReachFactor() * 100),
      flushedByAndon: sim.totalFlushedByAndon,
      worldLabel: sim.worldLabel,
      shockStaleRemaining: sim.shockFlash ? sim.shockFlash.staleRemaining : 0
    };
  }

  function formatSimDays(sec) {
    return (sec * SIM_DAYS_PER_SEC).toFixed(1) + 'd';
  }

  function formatCompactSimDays(sec) {
    const days = sec * SIM_DAYS_PER_SEC;
    if (Math.abs(days * 10 - Math.round(days * 10)) > 0.01) {
      return days.toFixed(2).replace(/0$/, '') + 'd';
    }
    return days.toFixed(1) + 'd';
  }

  function formatSignedSimDays(deltaSec) {
    const days = deltaSec * SIM_DAYS_PER_SEC;
    const sign = days > 0 ? '+' : '';
    return sign + days.toFixed(1) + 'd';
  }

  function formatSignedSec(delta) {
    return formatSignedSimDays(delta);
  }

  function isShockOutpacingLoop(snap) {
    return Number.isFinite(snap.shockSec) && snap.loopSec >= snap.shockSec * 0.9;
  }

  function getTightestPaceLimit(snap) {
    return Math.min(
      snap.worldSec,
      Number.isFinite(snap.shockSec) ? snap.shockSec : Infinity
    );
  }

  function computeLoopPillTone(prev, next) {
    const loopDelta = next.loopSec - prev.loopSec;
    if (loopDelta < -0.05) return 'good';
    const paceLimit = getTightestPaceLimit(next);
    if (next.loopSec >= paceLimit * 0.9) return 'bad';
    if (loopDelta > 0.05) return 'warn';
    return 'neutral';
  }

  function makeLoopDeltaPill(prev, next) {
    return {
      text: 'Loop ' + formatSimDays(prev.loopSec) + ' \u2192 ' + formatSimDays(next.loopSec),
      tone: computeLoopPillTone(prev, next)
    };
  }

  function makeRemainingPaceWarningPill(prev, next, isCyber) {
    const loopDelta = next.loopSec - prev.loopSec;
    if (loopDelta >= -0.05) return null;
    const shockTighter = Number.isFinite(next.shockSec) && next.shockSec < next.worldSec;
    const paceLimit = shockTighter ? next.shockSec : next.worldSec;
    if (next.loopSec < paceLimit * 0.9) return null;
    const fullyOver = next.loopSec >= paceLimit;
    let text;
    if (shockTighter) {
      text = fullyOver
        ? (isCyber ? 'Lag still > shocks' : 'Still slower than shocks')
        : 'Still crowding shocks';
    } else {
      text = fullyOver
        ? (isCyber ? 'Lag still > cycle' : 'Still slower than market')
        : (isCyber ? 'Still crowding cycle' : 'Still crowding market');
    }
    return { text: text, tone: 'warn' };
  }

  function pushLoopDeltaWithPaceCheck(pills, prev, next, isCyber, suppressRemainingWarn) {
    pills.push(makeLoopDeltaPill(prev, next));
    if (!suppressRemainingWarn) {
      const remWarn = makeRemainingPaceWarningPill(prev, next, isCyber);
      if (remWarn) pills.push(remWarn);
    }
  }

  function computeSnapshotDiff(prev, next) {
    const loopDelta = next.loopSec - prev.loopSec;
    const innerReworkChanged = next.expectsInnerRework !== prev.expectsInnerRework;
    const outerReworkChanged = next.expectsOuterRework !== prev.expectsOuterRework;
    return {
      loopDelta: loopDelta,
      loopTimeChanged: Math.abs(loopDelta) > 0.05,
      innerReworkChanged: innerReworkChanged,
      outerReworkChanged: outerReworkChanged,
      triggeredInnerRework: innerReworkChanged && next.expectsInnerRework,
      clearedInnerRework: innerReworkChanged && !next.expectsInnerRework,
      triggeredOuterRework: outerReworkChanged && next.expectsOuterRework,
      clearedOuterRework: outerReworkChanged && !next.expectsOuterRework,
      loopTone: computeLoopPillTone(prev, next)
    };
  }

  function pushReworkTransitionPills(pills, prev, next, isCyber, emphasizeInnerTrigger) {
    const diff = computeSnapshotDiff(prev, next);
    if (diff.innerReworkChanged) {
      pills.push({
        text: diff.triggeredInnerRework
          ? (isCyber
              ? (emphasizeInnerTrigger ? 'Triggers Sys 3* rework!' : 'Triggers Sys 3* rework')
              : (emphasizeInnerTrigger ? 'Triggers Testing rework!' : 'Triggers Testing rework'))
          : (isCyber ? 'Clears Sys 3* rework' : 'Clears Testing rework'),
        tone: diff.triggeredInnerRework ? (emphasizeInnerTrigger ? 'bad' : 'warn') : 'good'
      });
    }
    if (diff.outerReworkChanged) {
      pills.push({
        text: diff.triggeredOuterRework
          ? 'Triggers Outer Loop rework!'
          : 'Clears Outer Loop rework',
        tone: diff.triggeredOuterRework ? 'bad' : 'good'
      });
    }
  }

  function pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, emphasizeInnerTrigger, suppressRemainingWarn) {
    const diff = computeSnapshotDiff(prev, next);
    if (diff.loopTimeChanged || diff.innerReworkChanged || diff.outerReworkChanged) {
      pushLoopDeltaWithPaceCheck(pills, prev, next, isCyber, suppressRemainingWarn);
    }
    pushReworkTransitionPills(pills, prev, next, isCyber, emphasizeInnerTrigger);
  }

  const CONTROL_EXPLAINERS = {
    drift: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.drift;
      const pills = [
        {
          text: (isCyber ? 'Cycle ' : 'Shift cycle ') + formatSimDays(prev.worldSec) + ' \u2192 ' + formatSimDays(next.worldSec),
          tone: next.worldSec < prev.worldSec ? 'warn' : 'good'
        }
      ];
      if (next.loopSec >= next.worldSec * 0.9) {
        pills.push({ text: isCyber ? 'Lag > cycle!' : 'Loop slower than market!', tone: 'bad' });
      }
      return { pills: pills, summary: isCyber ? d.summaryCyber : d.summaryProduct };
    },
    shock: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.shock;
      const lbl = SHOCK_REGIMES[next.shockIdx].label;
      const shockTone = next.shockIdx < prev.shockIdx
        ? 'good'
        : (next.shockIdx > prev.shockIdx ? 'warn' : (next.shockIdx >= 2 ? 'warn' : 'neutral'));
      const pills = [{ text: (isCyber ? 'Step-shocks: ' : 'Shocks: ') + lbl, tone: shockTone }];
      const outpaced = isShockOutpacingLoop(next);
      if (!next.andonActive && next.shockIdx > 0) {
        pills.push({ text: isCyber ? 'No algedonic wire' : 'Andon cord off', tone: 'warn' });
      }
      if (outpaced) {
        pills.push({
          text: next.andonActive
            ? (isCyber ? 'Algedonic thrashing (lag > shocks)!' : 'Andon thrashing (loop > shocks)!')
            : (isCyber ? 'Lag > shock interval!' : 'Loop slower than shocks!'),
          tone: 'bad'
        });
      }
      return {
        pills: pills,
        summary: outpaced && next.andonActive
          ? (isCyber ? d.summaryThrashingCyber : d.summaryThrashingProduct)
          : (isCyber ? d.summaryCyber : d.summaryProduct)
      };
    },
    manualShock: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.manualShock;
      const flushedDelta = next.flushedByAndon - prev.flushedByAndon;
      const pills = [{ text: (isCyber ? 'State \u2192 ' : 'Need \u2192 ') + next.worldLabel, tone: 'bad' }];
      if (flushedDelta > 0) {
        pills.push({
          text: (isCyber ? 'Purged ' : 'Andon cleared ') + flushedDelta + (flushedDelta === 1 ? ' bet' : ' bets'),
          tone: 'good'
        });
      } else if (next.shockStaleRemaining > 0) {
        pills.push({
          text: next.shockStaleRemaining + ' pre-shock bets in flight',
          tone: 'bad'
        });
      }
      return {
        pills: pills,
        summary: next.andonActive
          ? (isCyber ? d.summaryAndonOnCyber : d.summaryAndonOnProduct)
          : (isCyber ? d.summaryAndonOffCyber : d.summaryAndonOffProduct)
      };
    },
    discoveryNoise: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.discoveryNoise;
      const pills = [
        {
          text: (isCyber ? 'Model error ' : 'Spec distortion ') + prev.discNoisePct + '% \u2192 ' + next.discNoisePct + '%',
          tone: next.discNoisePct > prev.discNoisePct ? 'bad' : 'good'
        }
      ];
      pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, false);
      return {
        pills: pills,
        summary: next.chapter < 3
          ? (isCyber ? d.summaryCh2Cyber : d.summaryCh2Product)
          : (isCyber ? d.summaryCyber : d.summaryProduct)
      };
    },
    buildNoise: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.buildNoise;
      const pills = [
        {
          text: (isCyber ? 'Sys 1 error ' : 'Build distortion ') + prev.buildNoisePct + '% \u2192 ' + next.buildNoisePct + '%',
          tone: next.buildNoisePct > prev.buildNoisePct ? 'bad' : 'good'
        }
      ];
      pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, false);
      return {
        pills: pills,
        summary: next.chapter < 3
          ? (isCyber ? d.summaryCh2Cyber : d.summaryCh2Product)
          : (isCyber ? d.summaryCyber : d.summaryProduct)
      };
    },
    messagingNoise: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.messagingNoise;
      if (next.reachIdx === 0) {
        return {
          pills: [{ text: 'Muted while Silent (25%)', tone: 'warn' }],
          summary: isCyber ? d.summarySilentCyber : d.summarySilentProduct
        };
      }
      const pills = [
        {
          text: (isCyber ? 'Encoding noise ' : 'Label noise ') + prev.msgNoisePct + '% \u2192 ' + next.msgNoisePct + '%',
          tone: next.msgNoisePct > prev.msgNoisePct ? 'bad' : 'good'
        }
      ];
      pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, false);
      return { pills: pills, summary: isCyber ? d.summaryCyber : d.summaryProduct };
    },
    demand: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.demand;
      const dReg = DEMAND_REGIMES[next.demandIdx];
      const dTone = next.demandIdx < prev.demandIdx
        ? 'good'
        : (next.demandIdx > prev.demandIdx ? 'warn' : (next.demandIdx >= 2 ? 'warn' : 'neutral'));
      const pills = [
        {
          text: (isCyber ? 'Arrival: ' : 'Demand: ') + dReg.label,
          tone: dTone
        }
      ];
      const cappedUnderLoad = next.demandIdx >= 2 && next.wipIdx <= 1;
      if (cappedUnderLoad) {
        pills.push({
          text: (isCyber ? 'Sys 2 cap (' : 'WIP cap (') + next.maxWip + ') holds queues',
          tone: 'good'
        });
      } else if (next.demandIdx >= 2 && next.wipIdx >= 2) {
        pills.push({
          text: next.wipIdx === 3
            ? (isCyber ? 'Uncapped WIP (queues flood!)' : 'No WIP cap (queues flood!)')
            : 'Loose WIP cap (queues build)',
          tone: next.demandIdx === 3 && next.wipIdx === 3 ? 'bad' : 'warn'
        });
      }
      return {
        pills: pills,
        summary: cappedUnderLoad
          ? (isCyber ? d.summaryCappedCyber : d.summaryCappedProduct)
          : (isCyber ? d.summaryCyber : d.summaryProduct)
      };
    },
    wip: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.wip;
      const wReg = WIP_REGIMES[next.wipIdx];
      let pills;
      if (next.wipIdx < prev.wipIdx || (next.wipIdx <= 1 && next.wipIdx === prev.wipIdx)) {
        const stillLooseUnderLoad = next.wipIdx === 2 && next.demandIdx >= 2;
        pills = [
          {
            text: (isCyber ? 'Sys 2 cap: ' : 'WIP cap: ') + wReg.label,
            tone: 'good'
          },
          {
            text: stillLooseUnderLoad
              ? 'Loose cap: 12 (queues still build)'
              : (next.wipIdx === 0
                  ? (isCyber ? 'Serialised (1 item in flight)' : '1 bet at a time (requests wait)')
                  : (isCyber ? 'Excess arrivals wait at gate' : 'Extra requests wait outside')),
            tone: 'warn'
          }
        ];
        pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, false);
      } else if (next.wipIdx === 1 && prev.wipIdx === 0) {
        pills = [
          {
            text: isCyber ? 'Parallel flow (Sys 2 cap: 3)' : 'Parallel flow (WIP cap: 3)',
            tone: 'good'
          },
          {
            text: isCyber ? 'Up to 3 items share capacity' : 'Up to 3 concurrent bets',
            tone: 'warn'
          }
        ];
      } else {
        pills = [
          {
            text: isCyber ? 'Admits arrivals immediately' : 'Starts requests immediately',
            tone: 'neutral'
          },
          {
            text: next.wipIdx === 3
              ? (isCyber ? 'Uncapped WIP (queues grow!)' : 'No WIP cap (queues pile up!)')
              : 'Loose cap: 12 (queues build)',
            tone: next.wipIdx === 3 && next.demandIdx >= 2 ? 'bad' : 'warn'
          }
        ];
      }
      return {
        pills: pills,
        summary: isCyber ? d.summaryCyber : d.summaryProduct
      };
    },
    discovery: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.discovery;
      const dSec = next.discSec - prev.discSec;
      const pills = [
        {
          text: (isCyber ? 'Sys 4 lag ' : 'Discovery ') + formatSignedSec(dSec),
          tone: dSec > 0 ? 'warn' : 'good'
        }
      ];
      pushLoopDeltaWithPaceCheck(pills, prev, next, isCyber);
      if (
        next.chapter >= 2 &&
        next.discoveryNoiseIdx > 0 &&
        (prev.discNoisePct !== next.discNoisePct || next.discoveryIdx >= prev.discoveryIdx)
      ) {
        pills.push({
          text: (isCyber ? 'Model error ' : 'Spec misread ') + prev.discNoisePct + '% \u2192 ' + next.discNoisePct + '%',
          tone: next.discNoisePct < prev.discNoisePct
            ? 'good'
            : (next.discNoisePct > prev.discNoisePct ? 'warn' : 'neutral')
        });
        if (next.discoveryIdx >= 2 && next.discoveryIdx >= prev.discoveryIdx) {
          pills.push({ text: 'Diminishing returns', tone: 'warn' });
        }
      }
      pushReworkTransitionPills(pills, prev, next, isCyber, false);
      return {
        pills: pills,
        summary: next.chapter < 2
          ? (isCyber ? d.summaryCh1Cyber : d.summaryCh1Product)
          : (next.discoveryIdx >= 2
              ? (isCyber ? d.summaryDiminishingCyber : d.summaryDiminishingProduct)
              : (isCyber ? d.summaryCyber : d.summaryProduct))
      };
    },
    discoveryDampener: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.discoveryDampener;
      const on = next.discoveryDampener;
      const pills = [
        {
          text: (isCyber ? 'Sys 4 lag ' : 'Discovery ') + (on ? '+1.8d' : '-1.8d'),
          tone: on ? 'warn' : 'neutral'
        }
      ];
      if (next.discoveryNoiseIdx > 0) {
        pills.unshift({
          text: (isCyber ? 'Model error ' : 'Spec misread ') + prev.discNoisePct + '% \u2192 ' + next.discNoisePct + '%',
          tone: on ? 'good' : 'bad'
        });
      }
      pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, false);
      return { pills: pills, summary: isCyber ? d.summaryCyber : d.summaryProduct };
    },
    build: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.build;
      const bDelta = next.buildSec - prev.buildSec;
      const pills = [
        {
          text: (isCyber ? 'Sys 1 time ' : 'Build ') + formatCompactSimDays(prev.buildSec) + ' \u2192 ' + formatCompactSimDays(next.buildSec),
          tone: bDelta > 0 ? 'warn' : 'good'
        }
      ];
      pushLoopDeltaWithPaceCheck(pills, prev, next, isCyber);
      if (next.chapter >= 2 && next.buildNoiseIdx > 0 && prev.buildNoisePct !== next.buildNoisePct) {
        pills.push({
          text: (isCyber ? 'Sys 1 drift ' : 'Build drift ') + prev.buildNoisePct + '% \u2192 ' + next.buildNoisePct + '%',
          tone: next.buildNoisePct > prev.buildNoisePct ? 'bad' : 'good'
        });
        if (next.oversizedBatch && next.buildDampener) {
          const steppedDown = next.buildIdx < prev.buildIdx;
          pills.push({
            text: steppedDown
              ? (isCyber ? 'Batch still coarse for sync' : 'Batch still oversized for pairing')
              : (isCyber ? 'Weakens sync control!' : 'Weakens pairing!'),
            tone: steppedDown ? 'warn' : 'bad'
          });
        }
      }
      pushReworkTransitionPills(pills, prev, next, isCyber, true);
      return {
        pills: pills,
        summary: next.oversizedBatch
          ? (isCyber ? d.summaryOversizedCyber : d.summaryOversizedProduct)
          : (isCyber ? d.summaryCyber : d.summaryProduct)
      };
    },
    build10x: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.build10x;
      const on = next.build10x;
      const pills = [
        {
          text: (isCyber ? 'Sys 1 ' : 'Build ') + formatCompactSimDays(prev.buildSec) + ' \u2192 ' + formatCompactSimDays(next.buildSec),
          tone: on ? 'good' : 'warn'
        }
      ];
      if (next.testingIdx > 0) {
        pills.push({
          text: on
            ? (isCyber ? '1x Sys 3* (' : '1x Testing (') + formatSimDays(next.testSec) + ') bottleneck'
            : (isCyber ? 'Eases 1x Sys 3* (' : 'Eases 1x Testing (') + formatSimDays(next.testSec) + ') bottleneck',
          tone: on ? 'warn' : 'good'
        });
      }
      pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, false);
      return {
        pills: pills,
        summary: on
          ? (isCyber ? d.summaryCyber : d.summaryProduct)
          : (isCyber ? d.summaryOffCyber : d.summaryOffProduct)
      };
    },
    buildDampener: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.buildDampener;
      const on = next.buildDampener;
      const pills = [];
      if (next.buildNoiseIdx > 0) {
        pills.push({
          text: (isCyber ? 'Sys 1 drift ' : 'Build drift ') + prev.buildNoisePct + '% \u2192 ' + next.buildNoisePct + '%',
          tone: on ? 'good' : 'bad'
        });
        if (on) {
          pills.push({ text: '0d added lead time', tone: 'good' });
        }
      }
      if (on) {
        pills.push({
          text: next.chapter >= 4
            ? (isCyber ? 'Sys 1 WIP 2 \u2192 1 (2 on 1 stream)' : 'Build WIP 2 \u2192 1 (2 people per bet)')
            : (isCyber ? '2 operators on 1 stream' : '2 people on 1 bet'),
          tone: 'warn'
        });
      } else if (next.chapter >= 4) {
        pills.push({
          text: isCyber ? 'Sys 1 WIP 1 \u2192 2 (parallel solo)' : 'Build WIP 1 \u2192 2 (parallel solo)',
          tone: next.buildNoiseIdx === 0 ? 'good' : 'neutral'
        });
      }
      if (on && next.oversizedBatch && next.buildNoiseIdx > 0) {
        pills.push({ text: isCyber ? 'Coarse batch leaks!' : 'Big batch still leaks!', tone: 'warn' });
      }
      pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, false);
      return {
        pills: pills,
        summary: !on
          ? (isCyber ? d.summaryOffCyber : d.summaryOffProduct)
          : (next.oversizedBatch && next.buildNoiseIdx > 0
              ? (isCyber ? d.summaryBigBatchCyber : d.summaryBigBatchProduct)
              : (next.chapter < 3
                  ? (isCyber ? d.summaryCh2Cyber : d.summaryCh2Product)
                  : (isCyber ? d.summaryCyber : d.summaryProduct)))
      };
    },
    testing: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.testing;
      const lbl = TESTING_REGIMES[next.testingIdx].label;
      const tDelta = (next.testSec || 0) - (prev.testSec || 0);
      const raised = next.testingIdx > prev.testingIdx;
      const lowered = next.testingIdx < prev.testingIdx;
      const pills = [];
      if (raised) {
        if (next.buildNoiseIdx > 0) {
          pills.push({
            text: (isCyber ? 'Catches Sys 1 defects (' : 'Catches Build defects (') + lbl + ')',
            tone: 'good'
          });
        }
        if (Math.abs(tDelta) > 0.02) {
          pills.push({
            text: (isCyber ? 'Audit ' : 'Testing ') + formatSignedSec(tDelta),
            tone: 'warn'
          });
        }
        if (Math.abs(next.loopSec - prev.loopSec) > 0.05) {
          pushLoopDeltaWithPaceCheck(pills, prev, next, isCyber);
        }
        pills.push({
          text: isCyber ? 'Blind to Sys 4 error' : 'Blind to wrong Spec',
          tone: 'neutral'
        });
      } else if (lowered) {
        if (Math.abs(tDelta) > 0.02) {
          pills.push({
            text: (isCyber ? 'Audit ' : 'Testing ') + formatSignedSec(tDelta),
            tone: 'good'
          });
        }
        if (Math.abs(next.loopSec - prev.loopSec) > 0.05) {
          pushLoopDeltaWithPaceCheck(pills, prev, next, isCyber);
        }
        const dropsActiveCatch = next.buildNoiseIdx > 0 && prev.expectsInnerRework && !next.expectsInnerRework;
        pills.push({
          text: next.testingIdx === 0
            ? (isCyber ? 'Sys 1 defects escape' : 'Defects escape')
            : (isCyber ? 'Looser Sys 3* check (' : 'Looser defect check (') + lbl + ')',
          tone: (next.testingIdx === 0 && next.buildNoiseIdx > 0) || dropsActiveCatch ? 'bad' : 'warn'
        });
      } else {
        pills.push({
          text: (isCyber ? 'Audit: ' : 'Testing: ') + lbl + (next.testSec > 0 ? ' (' + formatSimDays(next.testSec) + ')' : ''),
          tone: 'neutral'
        });
        pills.push(makeLoopDeltaPill(prev, next));
        pills.push({
          text: next.testingIdx > 0
            ? (isCyber ? 'Blind to Sys 4 error' : 'Blind to wrong Spec')
            : (isCyber ? 'Sys 1 defects escape' : 'Defects escape'),
          tone: next.testingIdx > 0 ? 'neutral' : 'warn'
        });
      }
      return { pills: pills, summary: isCyber ? d.summaryCyber : d.summaryProduct };
    },
    reach: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.reach;
      const pills = [
        {
          text: (isCyber ? 'Reach ' : 'Market reach ') + prev.reachPct + '% \u2192 ' + next.reachPct + '%',
          tone: next.reachPct < prev.reachPct ? 'warn' : 'good'
        }
      ];
      const rDelta = (next.rolloutSec || 0) - (prev.rolloutSec || 0);
      if (Math.abs(rDelta) > 0.02) {
        pills.push({
          text: (isCyber ? 'Amplify ' : 'Rollout ') + formatSignedSec(rDelta),
          tone: rDelta > 0 ? 'warn' : 'good'
        });
      }
      if (next.reachIdx === 0) {
        pills.push({ text: isCyber ? 'Unencoded "???"' : 'Unlabelled "???"', tone: 'bad' });
      }
      pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, false);
      return { pills: pills, summary: isCyber ? d.summaryCyber : d.summaryProduct };
    },
    rolloutDampener: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.rolloutDampener;
      if (next.reachIdx === 0) {
        return {
          pills: [{ text: 'Muted while Silent (25%)', tone: 'warn' }],
          summary: isCyber ? d.summarySilentCyber : d.summarySilentProduct
        };
      }
      const on = next.rolloutDampener;
      const pills = [
        { text: (isCyber ? 'Amplify ' : 'Rollout ') + (on ? '+1d' : '-1d'), tone: on ? 'warn' : 'neutral' }
      ];
      if (next.reachIdx > 0 && next.messagingNoiseIdx > 0) {
        pills.unshift({
          text: (isCyber ? 'Encoding noise ' : 'Label noise ') + prev.msgNoisePct + '% \u2192 ' + next.msgNoisePct + '%',
          tone: on ? 'good' : 'bad'
        });
      }
      pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, false);
      return {
        pills: pills,
        summary: on
          ? (isCyber ? d.summaryCyber : d.summaryProduct)
          : (isCyber ? d.summaryOffCyber : d.summaryOffProduct)
      };
    },
    diagnostic: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.diagnostic;
      const on = next.diagnosticActive;
      const pills = [
        { text: on ? (isCyber ? 'Targeted isolation' : 'Targeted fault routing') : 'Blind "?" guessing', tone: on ? 'good' : 'bad' },
        { text: on ? '+0.7d per launch' : '-0.7d per launch', tone: on ? 'warn' : 'neutral' }
      ];
      pushLoopDeltaWithPaceCheck(pills, prev, next, isCyber);
      return {
        pills: pills,
        summary: on
          ? (isCyber ? d.summaryCyber : d.summaryProduct)
          : (isCyber ? d.summaryOffCyber : d.summaryOffProduct)
      };
    },
    andon: function (prev, next, isCyber) {
      const d = CONTROL_DESCRIPTORS.andon;
      const on = next.andonActive;
      const flushedDelta = next.flushedByAndon - prev.flushedByAndon;
      const thrashing = on && isShockOutpacingLoop(next);
      const pills = [
        { text: on ? (isCyber ? 'Pre-emption armed' : 'Andon armed') : (isCyber ? 'Pre-emption off' : 'Andon off'), tone: on ? 'good' : 'warn' }
      ];
      if (flushedDelta > 0) {
        pills.push({ text: (isCyber ? 'Purged ' : 'Flushed ') + flushedDelta + (flushedDelta === 1 ? ' bet' : ' bets'), tone: 'good' });
      }
      pushOptionalLoopAndReworkPills(pills, prev, next, isCyber, false, thrashing);
      if (thrashing) {
        pills.push({
          text: isCyber ? 'Algedonic thrashing (lag > shocks)!' : 'Andon thrashing (loop > shocks)!',
          tone: 'bad'
        });
      }
      return {
        pills: pills,
        summary: thrashing
          ? (isCyber ? d.summaryThrashingCyber : d.summaryThrashingProduct)
          : (on
              ? (isCyber ? d.summaryCyber : d.summaryProduct)
              : (isCyber ? d.summaryOffCyber : d.summaryOffProduct))
      };
    }
  };

  function explainControlImpact(controlKey, prevSnap, nextSnap, isCyber) {
    const fn = CONTROL_EXPLAINERS[controlKey];
    if (!fn) return null;
    return fn(prevSnap, nextSnap, isCyber);
  }

  function explainPresetSnapshot(snap, isCyber) {
    const ch = snap.chapter;
    const cues = [];

    if (ch >= 2 && snap.discNoisePct >= 20) {
      cues.push({
        text: (isCyber ? 'Model error ' : 'Spec distortion ') + snap.discNoisePct + '%',
        tone: snap.discNoisePct >= 35 ? 'bad' : 'warn'
      });
    }
    if (ch >= 2 && snap.discoveryIdx >= 2) {
      cues.push({
        text: (isCyber ? 'Sys 4 ' : 'Discovery ') + DISCOVERY_REGIMES[snap.discoveryIdx].label + ' (' + formatSimDays(snap.discSec) + ')',
        tone: snap.discoveryIdx === 3 ? 'bad' : 'warn'
      });
    }
    if (ch >= 2 && snap.buildNoisePct >= 20) {
      const caughtInternally = ch >= 3 && snap.testingIdx >= 2 && snap.expectsInnerRework && snap.discNoisePct < 20 && !snap.build10x;
      cues.push({
        text: (isCyber ? 'Sys 1 error ' : 'Build distortion ') + snap.buildNoisePct + '%',
        tone: caughtInternally ? 'warn' : (snap.buildNoisePct >= 35 ? 'bad' : 'warn')
      });
      if (caughtInternally) {
        cues.push({
          text: isCyber ? 'Sys 3* rescues via rework' : 'Testing rescues via rework',
          tone: snap.loopSec >= snap.worldSec * 0.9 ? 'warn' : 'good'
        });
      }
    }
    if (ch === 3 && snap.testingIdx >= 2 && snap.discNoisePct >= 20) {
      cues.push({
        text: isCyber ? 'Strict Sys 3* (blind to model)' : 'Strict testing (blind to Spec)',
        tone: 'warn'
      });
    }
    if (ch >= 4) {
      if (snap.build10x && snap.testingIdx > 0 && (snap.wipIdx >= 2 || snap.buildNoisePct >= 20)) {
        cues.push({
          text: isCyber ? '10x Sys 1 \u2192 1x Sys 3* bottleneck' : '10x Build \u2192 1x Testing bottleneck',
          tone: 'bad'
        });
      }
      if (snap.wipIdx >= 2 && snap.demandIdx >= 2) {
        cues.push({
          text: snap.wipIdx === 3
            ? 'Uncapped WIP (' + DEMAND_REGIMES[snap.demandIdx].label + ' demand)'
            : 'Loose WIP (12)',
          tone: snap.wipIdx === 3 && snap.demandIdx === 3 ? 'bad' : 'warn'
        });
      }
      if (snap.demandIdx >= 3 && snap.wipIdx >= 3 && snap.testingIdx >= 2 && !snap.build10x) {
        cues.push({
          text: (isCyber ? 'Sys 3* ' : 'Testing ') + TESTING_REGIMES[snap.testingIdx].label + ' (' + formatSimDays(snap.testSec) + ')',
          tone: 'warn'
        });
      }
    }
    if (ch >= 5) {
      if (snap.reachIdx === 0) {
        cues.push({
          text: 'Silent reach 25% ("???")',
          tone: 'bad'
        });
      } else if (snap.reachPct < 100) {
        cues.push({
          text: (isCyber ? 'Reach ' : 'Market reach ') + snap.reachPct + '%',
          tone: 'warn'
        });
      }
      if (snap.reachIdx > 0 && snap.msgNoisePct >= 20) {
        cues.push({
          text: (isCyber ? 'Encoding noise ' : 'Label noise ') + snap.msgNoisePct + '%',
          tone: snap.msgNoisePct >= 40 ? 'bad' : 'warn'
        });
      }
    }
    if (ch >= 6 && snap.expectsOuterRework) {
      cues.push({
        text: snap.diagnosticActive
          ? (isCyber ? 'Targeted isolation' : 'Targeted fault routing')
          : 'Blind "?" guessing',
        tone: snap.diagnosticActive ? 'good' : 'bad'
      });
    }
    if (ch >= 7) {
      if (snap.shockIdx > 0 && !snap.andonActive) {
        cues.push({
          text: (isCyber ? 'Step-shocks: ' : 'Shocks: ') + SHOCK_REGIMES[snap.shockIdx].label + (isCyber ? ' (no algedonic!)' : ' (Andon off!)'),
          tone: 'bad'
        });
      } else if (snap.shockIdx === 0 && !snap.andonActive) {
        cues.push({
          text: isCyber ? 'No algedonic wire' : 'Andon cord off',
          tone: 'warn'
        });
      } else if (snap.shockIdx > 0 && snap.andonActive) {
        cues.push({
          text: (isCyber ? 'Step-shocks: ' : 'Shocks: ') + SHOCK_REGIMES[snap.shockIdx].label,
          tone: 'warn'
        });
      }
      if (snap.andonActive && isShockOutpacingLoop(snap)) {
        cues.push({
          text: isCyber ? 'Algedonic thrashing!' : 'Andon thrashing!',
          tone: 'bad'
        });
      }
    }
    if (snap.loopSec >= snap.worldSec * 0.9) {
      cues.push({
        text: isCyber ? 'Lag > cycle!' : 'Loop slower than market!',
        tone: 'bad'
      });
    }

    const hasRisk = cues.some(function (p) { return p.tone === 'bad' || p.tone === 'warn'; });

    if (!hasRisk || (ch >= 7 && snap.andonActive && !isShockOutpacingLoop(snap))) {
      if (ch >= 4 && snap.wipIdx <= 1 && !hasRisk) {
        cues.push({
          text: (isCyber ? 'Sys 2 cap: ' : 'WIP cap: ') + WIP_REGIMES[snap.wipIdx].label,
          tone: 'good'
        });
      }
      if (ch >= 2 && (snap.discoveryDampener || snap.buildDampener) && !hasRisk) {
        const both = snap.discoveryDampener && snap.buildDampener;
        cues.push({
          text: both
            ? (isCyber ? 'Widened + sync Sys 1' : 'Observed + paired')
            : (snap.discoveryDampener
                ? (isCyber ? 'Widened Sys 4' : 'Observed Spec')
                : (isCyber ? 'Sync Sys 1' : 'Paired Build')),
          tone: 'good'
        });
      }
      if (ch >= 5 && snap.reachPct === 100 && snap.msgNoisePct < 20 && !hasRisk) {
        cues.push({
          text: snap.rolloutDampener
            ? (isCyber ? 'Verified amplification' : 'Guided rollout')
            : (isCyber ? 'Clean amplification' : 'Accurate rollout'),
          tone: 'good'
        });
      }
      if (ch >= 7 && snap.andonActive && !isShockOutpacingLoop(snap)) {
        cues.push({
          text: isCyber ? 'Algedonic armed' : 'Andon armed',
          tone: 'good'
        });
      }
    }

    const trimmed = cues.slice(0, 3);
    const hasBad = cues.some(function (p) { return p.tone === 'bad'; });
    const hasWarn = cues.some(function (p) { return p.tone === 'warn'; });
    const hasGood = cues.some(function (p) { return p.tone === 'good'; });

    const paceLimit = Math.min(
      snap.worldSec,
      Number.isFinite(snap.shockSec) ? snap.shockSec : Infinity
    );
    let loopTone = 'good';
    if (snap.loopSec >= paceLimit * 0.9) loopTone = 'bad';
    else if (hasBad || hasWarn) {
      loopTone = snap.expectsInnerRework || snap.expectsOuterRework ? 'warn' : 'neutral';
    }

    trimmed.push({
      text: (isCyber ? 'Loop ' : 'Adaptation loop ') + formatSimDays(snap.loopSec),
      tone: loopTone
    });

    let barTone = 'tone-good';
    if (hasBad && !hasGood) barTone = 'tone-bad';
    else if (hasBad || hasWarn) barTone = 'tone-warn';

    return { barTone: barTone, pills: trimmed };
  }

  function isZoneVisibleInChapter(zoneId) {
    if (settings.chapter < 2) return false;
    if (zoneId === 'testing' || zoneId === 'innerLoop') return settings.chapter >= 3;
    if (zoneId === 'wipGate' || zoneId === 'queueDiscovery' || zoneId === 'queueBuild') return settings.chapter >= 4;
    if (zoneId === 'queueTesting') return settings.chapter >= 4 && getEffectiveTestingIdx() > 0;
    if (zoneId === 'rollout' || zoneId === 'connRollout' || zoneId === 'queueRollout') return settings.chapter >= 5;
    if (zoneId === 'outerLoop') return settings.chapter >= 6;
    if (zoneId === 'andonWire') return settings.chapter >= 7;
    if (zoneId === 'govBar') return settings.chapter >= 8;
    return true;
  }

  function getSpotlightZonesForControl(key, prevSnap, nextSnap) {
    const ch = settings.chapter;
    const tIdx = getEffectiveTestingIdx();
    const tOn = tIdx > 0;
    const tCatchesBuild = tIdx >= 2;
    const outerInCh = ch >= 6;
    const hasSnaps = Boolean(prevSnap && nextSnap);
    const hasDiscNoise = hasSnaps
      ? (prevSnap.discoveryNoiseIdx > 0 || nextSnap.discoveryNoiseIdx > 0)
      : settings.discoveryNoiseIdx > 0;
    const hasBuildNoise = hasSnaps
      ? (prevSnap.buildNoiseIdx > 0 || nextSnap.buildNoiseIdx > 0)
      : settings.buildNoiseIdx > 0;
    const outerTimeShifted = hasSnaps && Math.abs(nextSnap.outerLoopSec - prevSnap.outerLoopSec) > 0.02;
    const blindOuterVisitingAll =
      outerInCh && !hasSnaps && !settings.diagnosticChannel && computeAdaptationLoopInfo().expectsOuterRework;
    const discOuterEngaged =
      outerInCh && (!hasSnaps || prevSnap.specOuterActive || nextSnap.specOuterActive || outerTimeShifted);
    const buildOuterEngaged =
      outerInCh &&
      ((!hasSnaps && !tCatchesBuild) ||
        (hasSnaps && (prevSnap.buildOuterActive || nextSnap.buildOuterActive || outerTimeShifted)));
    const mutedSilentEdit =
      hasSnaps ? (prevSnap.reachIdx === 0 && nextSnap.reachIdx === 0) : isSilentRollout();
    const rolloutOuterEngaged =
      outerInCh &&
      !mutedSilentEdit &&
      (!hasSnaps || prevSnap.rolloutOuterActive || nextSnap.rolloutOuterActive || outerTimeShifted);

    let raw = [];
    if (key === 'drift') {
      raw = ['worldLeft', 'worldRight'];
    } else if (key === 'shock' || key === 'manualShock') {
      raw = ['worldLeft', 'worldRight'];
      if (isAndonActive()) raw.push('andonWire');
      else {
        if (ch >= 6) raw.push('outerLoop');
        if (ch >= 4) raw.push('queueDiscovery');
      }
    } else if (key === 'discoveryNoise') {
      raw = ['connSense', 'discovery', 'worldRight'];
      if (discOuterEngaged) raw.push('outerLoop');
    } else if (key === 'buildNoise') {
      if (tCatchesBuild) {
        raw = ['connBuild', 'build', 'testing', 'innerLoop'];
      } else {
        raw = tOn ? ['connBuild', 'build', 'testing', 'worldRight'] : ['connBuild', 'build', 'worldRight'];
      }
      if (buildOuterEngaged) raw.push('outerLoop');
    } else if (key === 'reach') {
      raw = ['rollout', 'connRollout', 'worldRight'];
      if (outerInCh && (!hasSnaps || prevSnap.rolloutOuterActive || nextSnap.rolloutOuterActive || outerTimeShifted)) {
        raw.push('outerLoop');
      }
    } else if (key === 'messagingNoise' || key === 'rolloutDampener') {
      raw = ['rollout', 'connRollout', 'worldRight'];
      if (rolloutOuterEngaged) raw.push('outerLoop');
    } else if (key === 'demand') {
      raw = ['worldLeft', 'wipGate', 'discovery', 'queueDiscovery', 'queueBuild', 'queueTesting', 'queueRollout'];
    } else if (key === 'wip') {
      raw = ['wipGate', 'discovery', 'queueDiscovery', 'queueBuild', 'queueTesting', 'queueRollout'];
    } else if (key === 'discovery') {
      raw = ch >= 2 && hasDiscNoise ? ['connSense', 'discovery', 'worldRight'] : ['discovery', 'worldRight'];
      const discSliceOuterEngaged =
        outerInCh &&
        (hasSnaps
          ? (prevSnap.specOuterActive || nextSnap.specOuterActive || outerTimeShifted)
          : (hasDiscNoise || blindOuterVisitingAll));
      if (discSliceOuterEngaged) raw.push('outerLoop');
    } else if (key === 'discoveryDampener') {
      raw = ['connSense', 'discovery', 'worldRight'];
      if (discOuterEngaged) raw.push('outerLoop');
    } else if (key === 'build') {
      raw = ch >= 2 && hasBuildNoise ? ['connBuild', 'build'] : ['build'];
      if (hasBuildNoise) {
        if (tCatchesBuild) raw.push('testing', 'innerLoop');
        else if (tOn) raw.push('testing');
      }
      raw.push('worldRight');
      const buildSliceOuterEngaged =
        outerInCh &&
        (hasSnaps
          ? (prevSnap.buildOuterActive || nextSnap.buildOuterActive || outerTimeShifted)
          : ((hasBuildNoise && !tCatchesBuild) || blindOuterVisitingAll));
      if (buildSliceOuterEngaged) raw.push('outerLoop');
    } else if (key === 'build10x') {
      if (tOn) {
        raw = ['build', 'queueBuild', 'queueTesting', 'testing'];
      } else if (ch >= 5) {
        raw = ['build', 'queueBuild', 'queueRollout', 'rollout'];
      } else {
        raw = ['build', 'queueBuild', 'worldRight'];
      }
    } else if (key === 'buildDampener') {
      if (tCatchesBuild) {
        raw = ['connBuild', 'build', 'innerLoop'];
      } else {
        raw = tOn ? ['connBuild', 'build', 'testing', 'worldRight'] : ['connBuild', 'build', 'worldRight'];
      }
      if (buildOuterEngaged) raw.push('outerLoop');
    } else if (key === 'testing') {
      raw = ['testing', 'innerLoop', 'build', 'worldRight'];
      if (outerInCh && hasSnaps && (prevSnap.buildOuterActive || nextSnap.buildOuterActive || outerTimeShifted)) {
        raw.push('outerLoop');
      }
    } else if (key === 'diagnostic') {
      raw = ['worldRight', 'outerLoop', 'rollout', 'build', 'discovery'];
    } else if (key === 'andon') {
      raw = ['andonWire', 'queueDiscovery', 'queueBuild', 'queueTesting', 'queueRollout', 'discovery'];
    }
    return raw.filter(isZoneVisibleInChapter);
  }

  function getChapterFocalZones() {
    const ch = settings.chapter;
    if (ch < 2) return [];
    let raw;
    if (ch === 2) {
      raw = [];
      if (settings.discoveryNoiseIdx > 0) raw.push('connSense');
      raw.push('discovery');
      if (settings.buildNoiseIdx > 0) raw.push('connBuild');
      raw.push('build', 'worldRight');
    } else if (ch === 3) {
      raw = ['discovery', 'build', 'testing', 'innerLoop', 'worldRight'];
    } else if (ch === 4) {
      raw = ['wipGate', 'discovery', 'queueDiscovery', 'build', 'queueBuild', 'queueTesting', 'testing'];
    } else if (ch === 5) {
      raw = ['rollout', 'connRollout', 'worldRight'];
    } else if (ch === 6) {
      raw = ['discovery', 'build', 'rollout', 'worldRight', 'outerLoop'];
    } else if (ch === 7) {
      raw = ['worldLeft', 'worldRight'];
      if (isAndonActive()) {
        raw.push('andonWire');
      } else {
        raw.push('outerLoop', 'queueDiscovery');
      }
    } else {
      raw = ['govBar', 'wipGate', 'discovery', 'build', 'testing', 'rollout', 'worldRight'];
      if (computeAdaptationLoopInfo().expectsOuterRework || settings.diagnosticChannel) {
        raw.push('outerLoop');
      }
      if (isAndonActive()) {
        raw.push('andonWire');
      }
    }
    return raw.filter(isZoneVisibleInChapter);
  }

  function applyPresetValuesAndGetZones(presetValues) {
    const prevSnap = captureMetricsSnapshot();
    const changedControlKeys = [];
    Object.keys(presetValues).forEach(function (k) {
      if (settings[k] !== presetValues[k]) {
        const zKey = SETTING_KEY_TO_CONTROL[k];
        if (zKey && !changedControlKeys.includes(zKey)) {
          changedControlKeys.push(zKey);
        }
      }
      settings[k] = presetValues[k];
    });
    const nextSnap = captureMetricsSnapshot();
    const changedZones = [];
    changedControlKeys.forEach(function (zKey) {
      getSpotlightZonesForControl(zKey, prevSnap, nextSnap).forEach(function (z) {
        if (!changedZones.includes(z)) changedZones.push(z);
      });
    });
    return changedZones.length > 0 ? changedZones.filter(isZoneVisibleInChapter) : getChapterFocalZones();
  }

  function makeUniformZoneTones(zones, tone) {
    const map = {};
    for (let i = 0; i < zones.length; i++) {
      map[zones[i]] = tone;
    }
    return map;
  }

  function computeSingleZoneTone(zoneId, controlKey, prevSnap, nextSnap, diff) {
    if (zoneId === 'worldLeft') {
      if (controlKey === 'manualShock') return 'bad';
      if (controlKey === 'demand') {
        return nextSnap.demandIdx > prevSnap.demandIdx ? 'warn' : 'good';
      }
      if (nextSnap.shockIdx !== prevSnap.shockIdx) {
        if (nextSnap.shockIdx > prevSnap.shockIdx && isShockOutpacingLoop(nextSnap)) return 'bad';
        return nextSnap.shockIdx > prevSnap.shockIdx ? 'warn' : 'good';
      }
      if (Math.abs(nextSnap.worldSec - prevSnap.worldSec) > 0.05) {
        return nextSnap.worldSec < prevSnap.worldSec ? 'warn' : 'good';
      }
      return 'preview';
    }
    if (zoneId === 'connSense') {
      if (nextSnap.discNoisePct < prevSnap.discNoisePct) return 'good';
      if (nextSnap.discNoisePct > prevSnap.discNoisePct) return 'bad';
      if (nextSnap.discoveryIdx > prevSnap.discoveryIdx && nextSnap.discoveryIdx >= 2) return 'warn';
      return 'preview';
    }
    if (zoneId === 'discovery') {
      if (Math.abs(nextSnap.discSec - prevSnap.discSec) > 0.02) {
        return nextSnap.discSec > prevSnap.discSec ? 'warn' : 'good';
      }
      if (nextSnap.discNoisePct !== prevSnap.discNoisePct) {
        return nextSnap.discNoisePct < prevSnap.discNoisePct ? 'good' : 'bad';
      }
      if (controlKey === 'wip') {
        return nextSnap.wipIdx > prevSnap.wipIdx ? (nextSnap.wipIdx >= 2 ? 'warn' : 'good') : 'good';
      }
      if (controlKey === 'demand') {
        return nextSnap.demandIdx > prevSnap.demandIdx ? 'warn' : 'good';
      }
      if (controlKey === 'diagnostic') {
        return nextSnap.diagnosticActive ? 'good' : 'warn';
      }
      if (controlKey === 'andon') {
        return nextSnap.andonActive ? 'good' : 'warn';
      }
      return 'preview';
    }
    if (zoneId === 'connBuild') {
      if (nextSnap.buildNoisePct < prevSnap.buildNoisePct) return 'good';
      if (nextSnap.buildNoisePct > prevSnap.buildNoisePct) return 'bad';
      return 'preview';
    }
    if (zoneId === 'build') {
      if (Math.abs(nextSnap.buildSec - prevSnap.buildSec) > 0.005) {
        return nextSnap.buildSec < prevSnap.buildSec
          ? 'good'
          : (nextSnap.oversizedBatch ? 'bad' : 'warn');
      }
      if (nextSnap.buildNoisePct !== prevSnap.buildNoisePct) {
        return nextSnap.buildNoisePct < prevSnap.buildNoisePct ? 'good' : 'bad';
      }
      if (diff.innerReworkChanged) {
        return diff.clearedInnerRework ? 'good' : 'warn';
      }
      if (controlKey === 'diagnostic') {
        return nextSnap.diagnosticActive ? 'good' : 'warn';
      }
      if (controlKey === 'buildDampener' && nextSnap.buildNoiseIdx === 0) {
        return nextSnap.buildDampener ? 'warn' : 'preview';
      }
      return 'preview';
    }
    if (zoneId === 'testing') {
      if (controlKey === 'build10x') {
        return nextSnap.build10x ? 'warn' : 'good';
      }
      if (Math.abs(nextSnap.testSec - prevSnap.testSec) > 0.02) {
        return nextSnap.testSec > prevSnap.testSec
          ? 'warn'
          : (nextSnap.buildNoisePct > 15 ? 'warn' : 'good');
      }
      if (nextSnap.buildNoisePct !== prevSnap.buildNoisePct) {
        return nextSnap.buildNoisePct < prevSnap.buildNoisePct ? 'good' : 'warn';
      }
      return 'preview';
    }
    if (zoneId === 'innerLoop') {
      if (diff.triggeredInnerRework) return 'bad';
      if (diff.clearedInnerRework) return 'good';
      if (nextSnap.testingIdx >= 2 && nextSnap.buildNoisePct !== prevSnap.buildNoisePct) {
        return nextSnap.buildNoisePct > prevSnap.buildNoisePct ? 'bad' : 'good';
      }
      if (controlKey === 'testing') {
        return nextSnap.testingIdx > prevSnap.testingIdx
          ? (nextSnap.expectsInnerRework ? 'warn' : 'good')
          : 'warn';
      }
      return 'preview';
    }
    if (zoneId === 'rollout') {
      if (
        nextSnap.reachIdx === 0 &&
        prevSnap.reachIdx === 0 &&
        (controlKey === 'messagingNoise' || controlKey === 'rolloutDampener')
      ) {
        return 'warn';
      }
      if (controlKey === 'build10x') {
        return nextSnap.build10x ? 'warn' : 'good';
      }
      if (controlKey === 'rolloutDampener') {
        return nextSnap.rolloutDampener ? 'warn' : 'good';
      }
      if (nextSnap.reachPct !== prevSnap.reachPct) {
        return nextSnap.reachPct > prevSnap.reachPct
          ? 'good'
          : (nextSnap.reachIdx === 0 ? 'bad' : 'warn');
      }
      if (nextSnap.msgNoisePct !== prevSnap.msgNoisePct) {
        return nextSnap.msgNoisePct < prevSnap.msgNoisePct ? 'good' : 'bad';
      }
      if (controlKey === 'diagnostic') {
        return nextSnap.diagnosticActive ? 'good' : 'warn';
      }
      return 'preview';
    }
    if (zoneId === 'connRollout') {
      if (nextSnap.reachIdx === 0 && prevSnap.reachIdx === 0) return 'warn';
      if (nextSnap.msgNoisePct !== prevSnap.msgNoisePct) {
        return nextSnap.msgNoisePct < prevSnap.msgNoisePct ? 'good' : 'bad';
      }
      if (nextSnap.reachPct !== prevSnap.reachPct) {
        return nextSnap.reachPct > prevSnap.reachPct
          ? 'good'
          : (nextSnap.reachIdx === 0 ? 'bad' : 'warn');
      }
      return 'preview';
    }
    if (
      zoneId === 'wipGate' ||
      zoneId === 'queueDiscovery' ||
      zoneId === 'queueBuild' ||
      zoneId === 'queueTesting' ||
      zoneId === 'queueRollout'
    ) {
      if (controlKey === 'andon' || (controlKey === 'manualShock' && nextSnap.andonActive)) {
        return nextSnap.andonActive ? 'good' : 'warn';
      }
      if (controlKey === 'shock' || controlKey === 'manualShock') return 'bad';
      if (controlKey === 'build10x') {
        if (zoneId === 'queueTesting' || zoneId === 'queueRollout') return nextSnap.build10x ? 'bad' : 'good';
        return nextSnap.build10x ? 'good' : 'preview';
      }
      if (controlKey === 'wip') {
        if (nextSnap.wipIdx >= 2 && nextSnap.demandIdx >= 2) {
          return nextSnap.wipIdx > prevSnap.wipIdx ? 'bad' : 'warn';
        }
        return nextSnap.wipIdx > prevSnap.wipIdx
          ? (nextSnap.wipIdx >= 2 ? 'bad' : 'warn')
          : 'good';
      }
      if (controlKey === 'demand') {
        if (nextSnap.demandIdx > prevSnap.demandIdx) {
          if (nextSnap.wipIdx <= 1) return 'good';
          return nextSnap.demandIdx >= 3 && nextSnap.wipIdx >= 3 ? 'bad' : 'warn';
        }
        return 'good';
      }
      return 'warn';
    }
    if (zoneId === 'outerLoop') {
      if (diff.triggeredOuterRework) return 'bad';
      if (diff.clearedOuterRework) return 'good';
      if (controlKey === 'diagnostic') return nextSnap.diagnosticActive ? 'good' : 'bad';
      if (nextSnap.outerLoopSec < prevSnap.outerLoopSec - 0.05) return 'good';
      if (nextSnap.outerLoopSec > prevSnap.outerLoopSec + 0.05) return 'bad';
      if ((controlKey === 'shock' || controlKey === 'manualShock') && !nextSnap.andonActive) return 'bad';
      return 'preview';
    }
    if (zoneId === 'andonWire') {
      if (nextSnap.andonActive && isShockOutpacingLoop(nextSnap)) return 'bad';
      return nextSnap.andonActive ? 'good' : 'warn';
    }
    if (zoneId === 'worldRight') {
      if (controlKey === 'manualShock') return nextSnap.andonActive ? 'warn' : 'bad';
      if (diff.triggeredOuterRework) return 'bad';
      if (diff.clearedOuterRework) return 'good';
      if (controlKey === 'discovery' && nextSnap.loopSec < prevSnap.loopSec - 0.05) {
        return nextSnap.loopSec >= getTightestPaceLimit(nextSnap) * 0.9 ? 'warn' : 'good';
      }
      if (
        nextSnap.discNoisePct < prevSnap.discNoisePct ||
        nextSnap.buildNoisePct < prevSnap.buildNoisePct ||
        nextSnap.msgNoisePct < prevSnap.msgNoisePct ||
        nextSnap.reachPct > prevSnap.reachPct
      ) {
        return nextSnap.loopSec >= getTightestPaceLimit(nextSnap) * 0.9
          ? 'warn'
          : 'good';
      }
      if (
        nextSnap.discNoisePct > prevSnap.discNoisePct ||
        nextSnap.buildNoisePct > prevSnap.buildNoisePct ||
        nextSnap.msgNoisePct > prevSnap.msgNoisePct ||
        nextSnap.reachPct < prevSnap.reachPct
      ) {
        return 'bad';
      }
      if (diff.loopTone === 'good') {
        return nextSnap.loopSec >= getTightestPaceLimit(nextSnap) * 0.9 ? 'warn' : 'good';
      }
      if (diff.loopTone === 'bad') return 'bad';
      if (Math.abs(nextSnap.worldSec - prevSnap.worldSec) > 0.05) {
        return nextSnap.worldSec < prevSnap.worldSec ? 'warn' : 'good';
      }
      return 'warn';
    }
    return 'preview';
  }

  function computeSpotlightZoneTones(controlKey, prevSnap, nextSnap, zones) {
    if (!prevSnap || !nextSnap) {
      return makeUniformZoneTones(zones, 'preview');
    }
    const diff = computeSnapshotDiff(prevSnap, nextSnap);
    const map = {};
    for (let i = 0; i < zones.length; i++) {
      const zId = zones[i];
      map[zId] = computeSingleZoneTone(zId, controlKey, prevSnap, nextSnap, diff);
    }
    return map;
  }

  function getActiveSpotlightSpec() {
    if (settings.chapter < 2) return null;
    if (sim.hoverControlKey) {
      const sameCommittedOnHover =
        sim.hoverCommittedKey === sim.hoverControlKey &&
        Boolean(
          sim.lastImpact &&
            sim.lastImpact.kind === 'change' &&
            sim.lastImpact.controlKey === sim.hoverControlKey
        );
      const zones = sameCommittedOnHover
        ? getSpotlightZonesForControl(
            sim.hoverControlKey,
            sim.lastImpact.prevSnap,
            sim.lastImpact.nextSnap
          )
        : getSpotlightZonesForControl(sim.hoverControlKey);
      return {
        controlKey: sim.hoverControlKey,
        zones: zones,
        zoneTones: sameCommittedOnHover
          ? computeSpotlightZoneTones(
              sim.hoverControlKey,
              sim.lastImpact.prevSnap,
              sim.lastImpact.nextSnap,
              zones
            )
          : makeUniformZoneTones(zones, 'preview'),
        alpha: sameCommittedOnHover ? 1.0 : 0.78,
        dashed: !sameCommittedOnHover,
        isPreview: true
      };
    }
    if (sim.hoverImpactBar && sim.lastImpact && sim.lastSpotlightZones.length > 0) {
      const isChange = sim.lastImpact.kind === 'change';
      return {
        controlKey: isChange ? sim.lastImpact.controlKey : 'preset',
        zones: sim.lastSpotlightZones,
        zoneTones: isChange
          ? computeSpotlightZoneTones(
              sim.lastImpact.controlKey,
              sim.lastImpact.prevSnap,
              sim.lastImpact.nextSnap,
              sim.lastSpotlightZones
            )
          : makeUniformZoneTones(sim.lastSpotlightZones, 'preview'),
        alpha: 1.0,
        dashed: false,
        isPreview: isChange
      };
    }
    if (sim.activeSpotlight && sim.activeSpotlight.zones.length > 0) {
      const isChange = Boolean(sim.lastImpact && sim.lastImpact.kind === 'change');
      const tones = isChange
        ? computeSpotlightZoneTones(
            sim.lastImpact.controlKey,
            sim.lastImpact.prevSnap,
            sim.lastImpact.nextSnap,
            sim.activeSpotlight.zones
          )
        : makeUniformZoneTones(sim.activeSpotlight.zones, 'preview');
      if (!sim.running || isTacticallyPaused()) {
        return {
          controlKey: sim.activeSpotlight.controlKey,
          zones: sim.activeSpotlight.zones,
          zoneTones: tones,
          alpha: 1.0,
          dashed: false,
          isPreview: isChange
        };
      }
      const el = sim.activeSpotlight.elapsed;
      const dur = sim.activeSpotlight.duration;
      const fadeStart = Math.max(0, dur - SPOTLIGHT_FADE_SEC);
      const fade = el < fadeStart ? 1.0 : Math.max(0, 1 - (el - fadeStart) / SPOTLIGHT_FADE_SEC);
      return {
        controlKey: sim.activeSpotlight.controlKey,
        zones: sim.activeSpotlight.zones,
        zoneTones: tones,
        alpha: fade,
        dashed: false,
        isPreview: isChange && el < SPOTLIGHT_STEADY_SEC
      };
    }
    return null;
  }

  const CyberneticModel = {
    TACTICAL_PAUSE_SEC: TACTICAL_PAUSE_SEC,
    SPOTLIGHT_STEADY_SEC: SPOTLIGHT_STEADY_SEC,
    SPOTLIGHT_FADE_SEC: SPOTLIGHT_FADE_SEC,
    SPOTLIGHT_TOTAL_SEC: SPOTLIGHT_TOTAL_SEC,
    N_ANGLES: N_ANGLES,
    ANGLES: ANGLES,
    BASE_SHAPES: BASE_SHAPES,
    maxPolarRadius: maxPolarRadius,
    smoothstep: smoothstep,
    morphShapes: morphShapes,
    cloneRadii: cloneRadii,
    seededRandom: seededRandom,
    warpShape: warpShape,
    computeOverlapFit: computeOverlapFit,

    settings: settings,
    sim: sim,
    setOnMetricsChanged: setOnMetricsChanged,

    isCyberneticsView: isCyberneticsView,
    getEffectiveDemandIdx: getEffectiveDemandIdx,
    getEffectiveWipIdx: getEffectiveWipIdx,
    getEffectiveShockIdx: getEffectiveShockIdx,
    isAndonActive: isAndonActive,
    isOuterRoutingActive: isOuterRoutingActive,
    isDiagnosticActive: isDiagnosticActive,
    getEffectiveDiscoverySec: getEffectiveDiscoverySec,
    getEffectiveBuildSec: getEffectiveBuildSec,
    isOversizedBuildBatch: isOversizedBuildBatch,
    getEffectiveDiscoveryNoise: getEffectiveDiscoveryNoise,
    getEffectiveBuildNoise: getEffectiveBuildNoise,
    getEffectiveTestingIdx: getEffectiveTestingIdx,
    isRolloutActive: isRolloutActive,
    isSilentRollout: isSilentRollout,
    getEffectiveRolloutSec: getEffectiveRolloutSec,
    getEffectiveReachScale: getEffectiveReachScale,
    getEffectiveReachFactor: getEffectiveReachFactor,
    getEffectiveMessagingNoise: getEffectiveMessagingNoise,
    isControlDisabled: isControlDisabled,
    computeRolloutPackaging: computeRolloutPackaging,
    classifyLandingCause: classifyLandingCause,

    getTotalQueueCount: getTotalQueueCount,
    getTotalInFlightCount: getTotalInFlightCount,
    getWipGateState: getWipGateState,
    getPrimaryItemForInspection: getPrimaryItemForInspection,
    scheduleNextShockInterval: scheduleNextShockInterval,
    getEffectiveBuildConcurrency: getEffectiveBuildConcurrency,
    hasPreShockItemsInFlight: hasPreShockItemsInFlight,
    hasOuterReworkInFlight: hasOuterReworkInFlight,
    isPostShockJamActive: isPostShockJamActive,
    flushPipelineWithAndon: flushPipelineWithAndon,
    triggerWorldShock: triggerWorldShock,
    spawnWorkItem: spawnWorkItem,
    flushTestingStationIfOff: flushTestingStationIfOff,
    markPolicyChange: markPolicyChange,
    snapshotPolicyBreakState: snapshotPolicyBreakState,
    restorePolicyBreakState: restorePolicyBreakState,
    refreshActiveDiscoverySpec: refreshActiveDiscoverySpec,
    refreshActiveBuildOutput: refreshActiveBuildOutput,
    refreshActiveRolloutPackaging: refreshActiveRolloutPackaging,
    isTacticallyPaused: isTacticallyPaused,
    triggerTacticalPause: triggerTacticalPause,
    clearTacticalPause: clearTacticalPause,
    advanceTacticalPause: advanceTacticalPause,
    advanceSpotlightTimer: advanceSpotlightTimer,
    stepSimulation: stepSimulation,
    applyChapterSettings: applyChapterSettings,
    resetSimulationState: resetSimulationState,
    loadChapter: loadChapter,
    loadPreset: loadPreset,

    computeAdaptationLoopInfo: computeAdaptationLoopInfo,
    captureMetricsSnapshot: captureMetricsSnapshot,
    SIM_DAYS_PER_SEC: SIM_DAYS_PER_SEC,
    formatSimDays: formatSimDays,
    formatCompactSimDays: formatCompactSimDays,
    formatSignedSimDays: formatSignedSimDays,
    formatSignedSec: formatSignedSec,
    computeLoopPillTone: computeLoopPillTone,
    makeLoopDeltaPill: makeLoopDeltaPill,
    computeSnapshotDiff: computeSnapshotDiff,
    pushReworkTransitionPills: pushReworkTransitionPills,
    pushOptionalLoopAndReworkPills: pushOptionalLoopAndReworkPills,
    explainControlImpact: explainControlImpact,
    explainPresetSnapshot: explainPresetSnapshot,
    isZoneVisibleInChapter: isZoneVisibleInChapter,
    getSpotlightZonesForControl: getSpotlightZonesForControl,
    computeSpotlightZoneTones: computeSpotlightZoneTones,
    applyPresetValuesAndGetZones: applyPresetValuesAndGetZones,
    getActiveSpotlightSpec: getActiveSpotlightSpec
  };

  root.CyberneticModel = CyberneticModel;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CyberneticModel;
  }
})();
