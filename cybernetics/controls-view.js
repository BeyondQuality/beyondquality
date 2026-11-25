// Product Work as a Cybernetic System: DOM Controls, Readouts, & Facade

(function () {
  'use strict';

  const C = window.CyberneticContent;
  const M = window.CyberneticModel;
  const D = window.CyberneticDiagramView;
  const U = window.CyberneticUrlState;

  const MAX_BUILT_CHAPTER = C.MAX_BUILT_CHAPTER;
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
  const CHAPTERS = C.CHAPTERS;
  const UI_COPY = C.UI_COPY;
  const CONTROL_DESCRIPTORS = C.CONTROL_DESCRIPTORS;

  const warpShape = M.warpShape;
  const computeOverlapFit = M.computeOverlapFit;

  const settings = M.settings;
  const sim = M.sim;

  const isCyberneticsView = M.isCyberneticsView;
  const getEffectiveDemandIdx = M.getEffectiveDemandIdx;
  const getEffectiveWipIdx = M.getEffectiveWipIdx;
  const getEffectiveShockIdx = M.getEffectiveShockIdx;
  const isAndonActive = M.isAndonActive;
  const isDiagnosticActive = M.isDiagnosticActive;
  const getEffectiveDiscoverySec = M.getEffectiveDiscoverySec;
  const getEffectiveBuildSec = M.getEffectiveBuildSec;
  const getEffectiveBuildConcurrency = M.getEffectiveBuildConcurrency;
  const isOversizedBuildBatch = M.isOversizedBuildBatch;
  const getEffectiveDiscoveryNoise = M.getEffectiveDiscoveryNoise;
  const getEffectiveBuildNoise = M.getEffectiveBuildNoise;
  const getEffectiveTestingIdx = M.getEffectiveTestingIdx;
  const isRolloutActive = M.isRolloutActive;
  const getEffectiveReachScale = M.getEffectiveReachScale;
  const getEffectiveReachFactor = M.getEffectiveReachFactor;
  const getEffectiveMessagingNoise = M.getEffectiveMessagingNoise;
  const isControlDisabled = M.isControlDisabled;

  const getTotalQueueCount = M.getTotalQueueCount;
  const getTotalInFlightCount = M.getTotalInFlightCount;
  const getPrimaryItemForInspection = M.getPrimaryItemForInspection;
  const scheduleNextShockInterval = M.scheduleNextShockInterval;
  const hasPreShockItemsInFlight = M.hasPreShockItemsInFlight;
  const isPostShockJamActive = M.isPostShockJamActive;
  const flushPipelineWithAndon = M.flushPipelineWithAndon;
  const triggerWorldShock = M.triggerWorldShock;
  const flushTestingStationIfOff = M.flushTestingStationIfOff;
  const markPolicyChange = M.markPolicyChange;
  const snapshotPolicyBreakState = M.snapshotPolicyBreakState;
  const restorePolicyBreakState = M.restorePolicyBreakState;
  const refreshActiveDiscoverySpec = M.refreshActiveDiscoverySpec;
  const refreshActiveBuildOutput = M.refreshActiveBuildOutput;
  const refreshActiveRolloutPackaging = M.refreshActiveRolloutPackaging;
  const TACTICAL_PAUSE_SEC = M.TACTICAL_PAUSE_SEC;
  const SPOTLIGHT_TOTAL_SEC = M.SPOTLIGHT_TOTAL_SEC;
  const isTacticallyPaused = M.isTacticallyPaused;
  const triggerTacticalPause = M.triggerTacticalPause;
  const clearTacticalPause = M.clearTacticalPause;
  const advanceTacticalPause = M.advanceTacticalPause;
  const advanceSpotlightTimer = M.advanceSpotlightTimer;
  const stepSimulation = M.stepSimulation;

  const computeAdaptationLoopInfo = M.computeAdaptationLoopInfo;
  const captureMetricsSnapshot = M.captureMetricsSnapshot;
  const formatSimDays = M.formatSimDays;
  const formatCompactSimDays = M.formatCompactSimDays;
  const explainControlImpact = M.explainControlImpact;
  const explainPresetSnapshot = M.explainPresetSnapshot;
  const getSpotlightZonesForControl = M.getSpotlightZonesForControl;
  const applyPresetValuesAndGetZones = M.applyPresetValuesAndGetZones;
  const getActiveSpotlightSpec = M.getActiveSpotlightSpec;

  const resolveTransitStartX = D.resolveTransitStartX;
  const setupCanvasResolution = D.setupCanvasResolution;
  const renderCanvas = D.renderCanvas;

  // ---------------------------------------------------------------------------
  // 1. DOM Controls, Chapter Switching, and Readouts
  // ---------------------------------------------------------------------------
  const playPauseBtn = document.getElementById('playPauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const topShockBtn = document.getElementById('topShockBtn');
  const clockValueEl = document.getElementById('clockValue');
  const loopTimePrefixEl = document.getElementById('loopTimePrefix');
  const loopTimeValueEl = document.getElementById('loopTimeValue');
  const worldCyclePrefixEl = document.getElementById('worldCyclePrefix');
  const worldCycleValueEl = document.getElementById('worldCycleValue');
  const stabilityBadgeEl = document.getElementById('stabilityBadge');
  const legendNeedTextEl = document.getElementById('legendNeedText');
  const legendSpecTextEl = document.getElementById('legendSpecText');
  const legendBuiltTextEl = document.getElementById('legendBuiltText');
  const legendChipTextEl = document.getElementById('legendChipText');
  const historyLabelEl = document.getElementById('historyLabel');
  const historyStripEl = document.getElementById('historyStrip');
  const historySummaryEl = document.getElementById('historySummary');

  const tabNameEls = [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) {
    return document.getElementById('tabName' + n);
  });

  const chapterKickerEl = document.getElementById('chapterKicker');
  const productViewBtn = document.getElementById('productViewBtn');
  const cyberneticsViewBtn = document.getElementById('cyberneticsViewBtn');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const storyCardEl = document.getElementById('storyCard');
  const storyBodyEl = document.getElementById('storyBody');
  const storyToggleBtn = document.getElementById('storyToggleBtn');
  const chapterHeadingEl = document.getElementById('chapterHeading');
  const chapterStoryEl = document.getElementById('chapterStory');
  const lessonTitleEl = document.getElementById('lessonTitle');
  const lessonTextEl = document.getElementById('lessonText');
  const experimentsRowEl = document.getElementById('experimentsRow');
  const impactBarEl = document.getElementById('impactBar');
  const impactHeaderEl = document.getElementById('impactHeader');
  const impactPillsEl = document.getElementById('impactPills');
  const impactSummaryEl = document.getElementById('impactSummary');
  const driftControlGroupEl = document.getElementById('driftControlGroup');
  const discoverySliderZoneEl = document.getElementById('discoverySliderZone');
  const buildSliderZoneEl = document.getElementById('buildSliderZone');
  const reachSliderZoneEl = document.getElementById('reachSliderZone');
  const prevChapterBtn = document.getElementById('prevChapterBtn');
  const nextChapterBtn = document.getElementById('nextChapterBtn');
  const bookGridEl = document.getElementById('bookGrid');
  const governanceColumnsEl = document.getElementById('governanceColumns');
  const hintsToggleBtn = document.getElementById('hintsToggleBtn');
  const environmentEyebrowEl = document.getElementById('environmentEyebrow');
  const activeControlsEyebrowEl = document.getElementById('activeControlsEyebrow');

  const flowBlockTitleEl = document.getElementById('flowBlockTitle');
  const worldBlockTitleEl = document.getElementById('worldBlockTitle');
  const noiseBlockTitleEl = document.getElementById('noiseBlockTitle');
  const discoveryBlockTitleEl = document.getElementById('discoveryBlockTitle');
  const buildBlockTitleEl = document.getElementById('buildBlockTitle');
  const testingBlockTitleEl = document.getElementById('testingBlockTitle');
  const rolloutBlockTitleEl = document.getElementById('rolloutBlockTitle');
  const channelsBlockTitleEl = document.getElementById('channelsBlockTitle');

  const driftLabelEl = document.getElementById('driftLabel');
  const driftHelpEl = document.getElementById('driftHelp');
  const demandLabelEl = document.getElementById('demandLabel');
  const demandHelpEl = document.getElementById('demandHelp');
  const shockLabelEl = document.getElementById('shockLabel');
  const shockHelpEl = document.getElementById('shockHelp');
  const wipLabelEl = document.getElementById('wipLabel');
  const wipHelpEl = document.getElementById('wipHelp');
  const discoveryLabelEl = document.getElementById('discoveryLabel');
  const discoveryHelpEl = document.getElementById('discoveryHelp');
  const discoveryNoiseLabelEl = document.getElementById('discoveryNoiseLabel');
  const discoveryNoiseHelpEl = document.getElementById('discoveryNoiseHelp');
  const discoveryDampenerTitleEl = document.getElementById('discoveryDampenerTitle');
  const discoveryDampenerStatusEl = document.getElementById('discoveryDampenerStatus');
  const discoveryDampenerMetaEl = document.getElementById('discoveryDampenerMeta');
  const buildLabelEl = document.getElementById('buildLabel');
  const buildHelpEl = document.getElementById('buildHelp');
  const build10xTitleEl = document.getElementById('build10xTitle');
  const build10xStatusEl = document.getElementById('build10xStatus');
  const build10xMetaEl = document.getElementById('build10xMeta');
  const buildNoiseLabelEl = document.getElementById('buildNoiseLabel');
  const buildNoiseHelpEl = document.getElementById('buildNoiseHelp');
  const buildDampenerTitleEl = document.getElementById('buildDampenerTitle');
  const buildDampenerStatusEl = document.getElementById('buildDampenerStatus');
  const buildDampenerMetaEl = document.getElementById('buildDampenerMeta');
  const testingLabelEl = document.getElementById('testingLabel');
  const testingHelpEl = document.getElementById('testingHelp');
  const reachLabelEl = document.getElementById('reachLabel');
  const reachHelpEl = document.getElementById('reachHelp');
  const messagingNoiseLabelEl = document.getElementById('messagingNoiseLabel');
  const messagingNoiseHelpEl = document.getElementById('messagingNoiseHelp');
  const rolloutDampenerTitleEl = document.getElementById('rolloutDampenerTitle');
  const rolloutDampenerStatusEl = document.getElementById('rolloutDampenerStatus');
  const rolloutDampenerMetaEl = document.getElementById('rolloutDampenerMeta');
  const diagnosticChannelTitleEl = document.getElementById('diagnosticChannelTitle');
  const diagnosticChannelStatusEl = document.getElementById('diagnosticChannelStatus');
  const diagnosticChannelMetaEl = document.getElementById('diagnosticChannelMeta');
  const andonCordTitleEl = document.getElementById('andonCordTitle');
  const andonCordStatusEl = document.getElementById('andonCordStatus');
  const andonCordMetaEl = document.getElementById('andonCordMeta');

  const demandSlider = document.getElementById('demandSlider');
  const wipSlider = document.getElementById('wipSlider');
  const driftSlider = document.getElementById('driftSlider');
  const shockSlider = document.getElementById('shockSlider');
  const triggerShockBtn = document.getElementById('triggerShockBtn');
  const discoverySlider = document.getElementById('discoverySlider');
  const buildSlider = document.getElementById('buildSlider');
  const build10xToggle = document.getElementById('build10xToggle');
  const discoveryNoiseSlider = document.getElementById('discoveryNoiseSlider');
  const buildNoiseSlider = document.getElementById('buildNoiseSlider');
  const discoveryDampenerToggle = document.getElementById('discoveryDampenerToggle');
  const buildDampenerToggle = document.getElementById('buildDampenerToggle');
  const testingSlider = document.getElementById('testingSlider');
  const reachSlider = document.getElementById('reachSlider');
  const messagingNoiseSlider = document.getElementById('messagingNoiseSlider');
  const rolloutDampenerToggle = document.getElementById('rolloutDampenerToggle');
  const diagnosticChannelToggle = document.getElementById('diagnosticChannelToggle');
  const andonCordToggle = document.getElementById('andonCordToggle');

  const demandKnobEl = document.getElementById('demandKnob');
  const wipKnobEl = document.getElementById('wipKnob');
  const driftKnobEl = document.getElementById('driftKnob');
  const shockKnobEl = document.getElementById('shockKnob');
  const discoveryKnobEl = document.getElementById('discoveryKnob');
  const buildKnobEl = document.getElementById('buildKnob');
  const discoveryNoiseKnobEl = document.getElementById('discoveryNoiseKnob');
  const buildNoiseKnobEl = document.getElementById('buildNoiseKnob');
  const testingKnobEl = document.getElementById('testingKnob');
  const reachKnobEl = document.getElementById('reachKnob');
  const messagingNoiseKnobEl = document.getElementById('messagingNoiseKnob');

  const demandRegimeEl = document.getElementById('demandRegime');
  const wipRegimeEl = document.getElementById('wipRegime');
  const driftRegimeEl = document.getElementById('driftRegime');
  const shockRegimeEl = document.getElementById('shockRegime');
  const discoveryRegimeEl = document.getElementById('discoveryRegime');
  const buildRegimeEl = document.getElementById('buildRegime');
  const discoveryNoiseRegimeEl = document.getElementById('discoveryNoiseRegime');
  const buildNoiseRegimeEl = document.getElementById('buildNoiseRegime');
  const testingRegimeEl = document.getElementById('testingRegime');
  const reachRegimeEl = document.getElementById('reachRegime');
  const messagingNoiseRegimeEl = document.getElementById('messagingNoiseRegime');

  const flowControlBlockEl = document.getElementById('flowControlBlock');
  const flowControlGroupEl = document.getElementById('flowControlGroup');
  const demandControlGroupEl = document.getElementById('demandControlGroup');
  const shockControlGroupEl = document.getElementById('shockControlGroup');
  const noiseConditionsBlockEl = document.getElementById('noiseConditionsBlock');
  const discoveryNoiseGroupEl = document.getElementById('discoveryNoiseGroup');
  const buildNoiseGroupEl = document.getElementById('buildNoiseGroup');
  const build10xBoxEl = document.getElementById('build10xBox');
  const testingControlBlockEl = document.getElementById('testingControlBlock');
  const testingControlGroupEl = document.getElementById('testingControlGroup');
  const rolloutControlBlockEl = document.getElementById('rolloutControlBlock');
  const rolloutControlGroupEl = document.getElementById('rolloutControlGroup');
  const messagingNoiseGroupEl = document.getElementById('messagingNoiseGroup');
  const channelsControlBlockEl = document.getElementById('channelsControlBlock');

  const flowNewBadgeEl = document.getElementById('flowNewBadge');
  const worldNewBadgeEl = document.getElementById('worldNewBadge');
  const noiseNewBadgeEl = document.getElementById('noiseNewBadge');
  const discoveryNewBadgeEl = document.getElementById('discoveryNewBadge');
  const buildNewBadgeEl = document.getElementById('buildNewBadge');
  const testingNewBadgeEl = document.getElementById('testingNewBadge');
  const rolloutNewBadgeEl = document.getElementById('rolloutNewBadge');
  const channelsNewBadgeEl = document.getElementById('channelsNewBadge');

  const discoveryDampenerBoxEl = document.getElementById('discoveryDampenerBox');
  const buildDampenerBoxEl = document.getElementById('buildDampenerBox');
  const rolloutDampenerBoxEl = document.getElementById('rolloutDampenerBox');
  const diagnosticChannelBoxEl = document.getElementById('diagnosticChannelBox');
  const andonCordBoxEl = document.getElementById('andonCordBox');

  const KNOB_DETENT_ANGLES = [-105, -35, 35, 105];
  const rotaryKnobEntries = [];

  function syncAllKnobsUI() {
    for (let i = 0; i < rotaryKnobEntries.length; i++) {
      const entry = rotaryKnobEntries[i];
      const rawVal = Number(entry.sliderEl.value);
      const val = Math.max(0, Math.min(3, Number.isFinite(rawVal) ? Math.round(rawVal) : 0));
      const deg = KNOB_DETENT_ANGLES[val];
      const disabled = Boolean(entry.sliderEl.disabled);
      entry.knobEl.classList.toggle('is-disabled', disabled);
      entry.knobEl.setAttribute('data-value', String(val));
      entry.knobEl.setAttribute('data-angle', String(deg));
      if (entry.knobEl.style && entry.knobEl.style.setProperty) {
        entry.knobEl.style.setProperty('--knob-deg', deg + 'deg');
      }
      entry.sliderEl.setAttribute('aria-valuetext', entry.regimes[val].label);
      for (let d = 0; d < 4; d++) {
        entry.detentGroups[d].classList.toggle('is-active', d === val);
        entry.detentTitles[d].textContent = entry.regimes[d].label;
      }
    }
  }

  function syncControlsFromSettings() {
    const ch = settings.chapter;
    demandSlider.value = String(ch >= 4 ? settings.demandIdx : 1);
    wipSlider.value = String(ch >= 4 ? settings.wipIdx : 0);
    driftSlider.value = String(settings.driftIdx);
    shockSlider.value = String(ch >= 7 ? settings.shockIdx : 0);
    discoverySlider.value = String(settings.discoveryIdx);
    buildSlider.value = String(settings.buildIdx);
    build10xToggle.checked = ch >= 4 ? settings.build10x : false;
    discoveryNoiseSlider.value = String(ch >= 2 ? settings.discoveryNoiseIdx : 0);
    buildNoiseSlider.value = String(ch >= 2 ? settings.buildNoiseIdx : 0);
    discoveryDampenerToggle.checked = ch >= 2 ? settings.discoveryDampener : false;
    buildDampenerToggle.checked = ch >= 2 ? settings.buildDampener : false;
    testingSlider.value = String(ch >= 3 ? settings.testingIdx : 0);
    reachSlider.value = String(ch >= 5 ? settings.reachIdx : 3);
    messagingNoiseSlider.value = String(ch >= 5 ? settings.messagingNoiseIdx : 0);
    rolloutDampenerToggle.checked = ch >= 5 ? settings.rolloutDampener : false;
    diagnosticChannelToggle.checked = ch >= 6 ? settings.diagnosticChannel : false;
    andonCordToggle.checked = ch >= 7 ? settings.andonCord : false;

    discoveryDampenerBoxEl.classList.toggle('active', ch >= 2 && settings.discoveryDampener);
    buildDampenerBoxEl.classList.toggle('active', ch >= 2 && settings.buildDampener);
    rolloutDampenerBoxEl.classList.toggle('active', ch >= 5 && settings.rolloutDampener);
    diagnosticChannelBoxEl.classList.toggle('active', ch >= 6 && settings.diagnosticChannel);
    andonCordBoxEl.classList.toggle('active', ch >= 7 && settings.andonCord);
    build10xBoxEl.classList.toggle('active-boost', ch >= 4 && settings.build10x);
    syncAllKnobsUI();
    syncActivePresetButtonsUI();
  }

  function updateReadouts() {
    const ch = settings.chapter;
    demandRegimeEl.textContent = DEMAND_REGIMES[ch >= 4 ? settings.demandIdx : 1].label;
    wipRegimeEl.textContent = WIP_REGIMES[ch >= 4 ? settings.wipIdx : 0].label;
    driftRegimeEl.textContent = DRIFT_REGIMES[settings.driftIdx].label;
    shockRegimeEl.textContent = SHOCK_REGIMES[ch >= 7 ? settings.shockIdx : 0].label;

    const discLabel = DISCOVERY_REGIMES[settings.discoveryIdx].label;
    discoveryRegimeEl.textContent =
      ch >= 2 && settings.discoveryDampener ? discLabel + ' (+1.8d)' : discLabel;

    let buildLabel = BUILD_REGIMES[settings.buildIdx].label;
    if (ch >= 4 && settings.build10x) {
      buildLabel += ' \u2192 10x (' + formatCompactSimDays(getEffectiveBuildSec()) + ')';
    }
    buildRegimeEl.textContent = buildLabel;
    build10xStatusEl.classList.add('is-hidden');

    if (ch < 2) {
      discoveryNoiseRegimeEl.textContent = 'None';
      discoveryDampenerStatusEl.textContent = 'Baseline: None';
      buildNoiseRegimeEl.textContent = 'None';
      buildDampenerStatusEl.textContent = 'Baseline: None';
      buildDampenerBoxEl.classList.remove('active-warn');
    } else {
      const rawDiscName = NOISE_REGIMES[settings.discoveryNoiseIdx].label;
      const discTrimPct = Math.round((1 - DISCOVERY_REGIMES[settings.discoveryIdx].noiseFactor) * 100);
      if (settings.discoveryNoiseIdx === 0) {
        discoveryNoiseRegimeEl.textContent = 'None';
        discoveryDampenerStatusEl.textContent = 'Baseline: None';
      } else if (settings.discoveryDampener) {
        discoveryNoiseRegimeEl.textContent = rawDiscName + ' \u2192 Reduced';
        discoveryDampenerStatusEl.textContent = rawDiscName + ' \u2192 Reduced';
      } else if (discTrimPct > 0) {
        discoveryNoiseRegimeEl.textContent = rawDiscName + ' \u2192 -' + discTrimPct + '% study';
        discoveryDampenerStatusEl.textContent = 'Unchecked: ' + rawDiscName + ' (-' + discTrimPct + '%)';
      } else {
        discoveryNoiseRegimeEl.textContent = rawDiscName;
        discoveryDampenerStatusEl.textContent = 'Unchecked: ' + rawDiscName;
      }

      const rawBuildName = NOISE_REGIMES[settings.buildNoiseIdx].label;
      const oversized = isOversizedBuildBatch();
      buildDampenerBoxEl.classList.toggle(
        'active-warn',
        settings.buildDampener && settings.buildNoiseIdx > 0 && oversized
      );
      if (settings.buildNoiseIdx === 0) {
        buildNoiseRegimeEl.textContent = 'None';
        buildDampenerStatusEl.textContent = 'Baseline: None';
      } else if (settings.buildDampener) {
        if (oversized) {
          buildNoiseRegimeEl.textContent = rawBuildName + ' \u2192 Partial (big batch)';
          buildDampenerStatusEl.textContent = 'Weakened by batch size!';
        } else {
          buildNoiseRegimeEl.textContent = rawBuildName + ' \u2192 Reduced';
          buildDampenerStatusEl.textContent = rawBuildName + ' \u2192 Reduced';
        }
      } else if (oversized) {
        buildNoiseRegimeEl.textContent = rawBuildName + ' + Batch drift';
        buildDampenerStatusEl.textContent = 'Unchecked: ' + rawBuildName + ' (+batch)';
      } else {
        buildNoiseRegimeEl.textContent = rawBuildName;
        buildDampenerStatusEl.textContent = 'Unchecked: ' + rawBuildName;
      }
    }

    if (ch < 3) {
      testingRegimeEl.textContent = 'Off';
    } else {
      const tReg = TESTING_REGIMES[settings.testingIdx];
      testingRegimeEl.textContent =
        settings.testingIdx > 0 ? tReg.label + ' (' + formatSimDays(tReg.sec) + ')' : 'Off';
    }

    if (ch < 5) {
      messagingNoiseGroupEl.classList.remove('is-dimmed');
      rolloutDampenerBoxEl.classList.remove('is-dimmed');
      reachRegimeEl.textContent = 'Full (100%)';
      messagingNoiseRegimeEl.textContent = 'Accurate';
      rolloutDampenerStatusEl.textContent = 'Baseline: Accurate';
    } else {
      const isSilentReach = isRolloutActive() && settings.reachIdx === 0;
      messagingNoiseGroupEl.classList.toggle('is-dimmed', isSilentReach);
      rolloutDampenerBoxEl.classList.toggle('is-dimmed', isSilentReach);
      const rReg = REACH_REGIMES[settings.reachIdx];
      reachRegimeEl.textContent = rReg.label + ' \u00b7 ' + formatSimDays(rReg.sec);
      const rawMsgName = MESSAGING_NOISE_REGIMES[settings.messagingNoiseIdx].label;
      if (isSilentReach) {
        const silentText = UI_COPY[isCyberneticsView() ? 'cybernetics' : 'product'].silentRolloutStatus;
        messagingNoiseRegimeEl.textContent = silentText;
        rolloutDampenerStatusEl.textContent = silentText;
      } else {
        messagingNoiseRegimeEl.textContent = settings.rolloutDampener
          ? rawMsgName + ' \u2192 Checked'
          : rawMsgName;
        rolloutDampenerStatusEl.textContent = settings.messagingNoiseIdx === 0
          ? 'Baseline: Accurate'
          : (settings.rolloutDampener
              ? rawMsgName + ' \u2192 Checked'
              : 'Unchecked: ' + rawMsgName);
      }
    }

    diagnosticChannelStatusEl.classList.add('is-hidden');
    andonCordStatusEl.classList.add('is-hidden');

    const loopInfo = computeAdaptationLoopInfo();
    const worldSec = DRIFT_REGIMES[settings.driftIdx].cycleSec;
    const shockIdx = getEffectiveShockIdx();
    const shockSec = shockIdx > 0 ? SHOCK_REGIMES[shockIdx].intervalSec : Infinity;
    let suffix = '';
    if (loopInfo.queuesBuilding) {
      suffix = ' (queues building)';
    } else if (loopInfo.queuedNow > 0) {
      suffix = ' (queue ' + loopInfo.queuedNow + ')';
    } else if (loopInfo.expectsRework) {
      suffix = ' (incl. rework)';
    }
    loopTimeValueEl.textContent = formatSimDays(loopInfo.sec) + suffix;
    worldCycleValueEl.textContent = Number.isFinite(shockSec)
      ? formatSimDays(worldSec) + ' / shock ~' + formatSimDays(shockSec)
      : formatSimDays(worldSec);

    const driftRatio = loopInfo.sec / worldSec;
    const shockRatio = Number.isFinite(shockSec) ? loopInfo.sec / shockSec : 0;
    const stabCopy = UI_COPY[isCyberneticsView() ? 'cybernetics' : 'product'].stability;
    stabilityBadgeEl.classList.remove('warn', 'danger');
    if (shockRatio >= driftRatio && shockRatio >= 0.52) {
      if (shockRatio >= 0.9) {
        stabilityBadgeEl.textContent = isAndonActive()
          ? stabCopy.thrashing
          : stabCopy.slowerThanShocks;
        stabilityBadgeEl.classList.add('danger');
      } else {
        stabilityBadgeEl.textContent = stabCopy.crowdingShocks;
        stabilityBadgeEl.classList.add('warn');
      }
    } else if (driftRatio < 0.52) {
      stabilityBadgeEl.textContent = stabCopy.faster;
    } else if (driftRatio < 0.9) {
      stabilityBadgeEl.textContent = stabCopy.drifting;
      stabilityBadgeEl.classList.add('warn');
    } else {
      stabilityBadgeEl.textContent = stabCopy.slower;
      stabilityBadgeEl.classList.add('danger');
    }
    syncAllKnobsUI();
    syncActivePresetButtonsUI();
  }

  let storyCollapsed = false;
  let hintsCollapsed = false;
  let urlSyncReady = false;
  let lastSyncedQuery = null;
  let copyFeedbackTimer = null;

  function getCurrentUiFlags() {
    return {
      speed: sim.speedMultiplier,
      paused: !sim.running,
      storyCollapsed: storyCollapsed,
      hintsCollapsed: hintsCollapsed
    };
  }

  function getShareQueryString() {
    return U.buildShareQueryString(getCurrentUiFlags());
  }

  function buildFullShareUrl() {
    return U.buildFullShareUrl(getShareQueryString());
  }

  function syncUrlFromState() {
    if (!urlSyncReady) return;
    const query = getShareQueryString();
    if (query === lastSyncedQuery) return;
    lastSyncedQuery = query;
    U.replaceBrowserQuery(query);
  }

  function syncCopyLinkButtonUI() {
    if (!copyLinkBtn || copyLinkBtn.classList.contains('is-copied')) return;
    const ui = UI_COPY[isCyberneticsView() ? 'cybernetics' : 'product'];
    copyLinkBtn.textContent = ui.copyLinkLabel;
  }

  function syncStoryCollapseUI() {
    const ui = UI_COPY[isCyberneticsView() ? 'cybernetics' : 'product'];
    storyCardEl.classList.toggle('is-collapsed', storyCollapsed);
    storyBodyEl.classList.toggle('is-hidden', storyCollapsed);
    storyToggleBtn.setAttribute('aria-expanded', storyCollapsed ? 'false' : 'true');
    storyToggleBtn.textContent = storyCollapsed ? ui.storyShow : ui.storyCollapse;
  }

  function toggleStoryCollapsed() {
    storyCollapsed = !storyCollapsed;
    syncStoryCollapseUI();
    syncUrlFromState();
  }

  function syncHintsCollapseUI() {
    const ui = UI_COPY[isCyberneticsView() ? 'cybernetics' : 'product'];
    bookGridEl.classList.toggle('is-hints-hidden', hintsCollapsed);
    hintsToggleBtn.setAttribute('aria-expanded', hintsCollapsed ? 'false' : 'true');
    hintsToggleBtn.textContent = hintsCollapsed ? ui.hintsShow : ui.hintsHide;
  }

  function toggleHintsCollapsed() {
    hintsCollapsed = !hintsCollapsed;
    try {
      if (window.localStorage) {
        window.localStorage.setItem('bq_hints_collapsed', hintsCollapsed ? '1' : '0');
      }
    } catch (_) {
      // Ignore storage restrictions on file://
    }
    syncHintsCollapseUI();
    syncUrlFromState();
  }

  function renderPillsHtml(pills) {
    return (pills || [])
      .map(function (p) {
        const tone = p.tone || 'neutral';
        return '<span class="impact-pill ' + tone + '">' + escapeHtmlAttr(p.text) + '</span>';
      })
      .join('');
  }

  function clearImpactToneClasses() {
    impactBarEl.classList.remove('is-tradeoff', 'tone-good', 'tone-warn', 'tone-bad');
  }

  function renderTradeoffLedger(pills, controlKey, prevSnap, nextSnap, ui) {
    const gainPills = [];
    const costPills = [];
    (pills || []).forEach(function (p) {
      if (p.tone === 'good') {
        gainPills.push(p);
      } else if (p.tone === 'warn' || p.tone === 'bad') {
        costPills.push(p);
      } else if (
        /-[0-9]+(?:\.[0-9]+)?d\b/.test(p.text) ||
        p.text.indexOf(': Off') !== -1 ||
        p.text.indexOf('WIP 1 \u2192 2') !== -1
      ) {
        gainPills.push(p);
      } else if (
        p.text.indexOf('Blind to') === 0 ||
        (controlKey === 'build10x' && !nextSnap.build10x) ||
        nextSnap.loopSec > prevSnap.loopSec + 0.05
      ) {
        costPills.push(p);
      } else if (p.text.indexOf('Testing:') === 0 || p.text.indexOf('Audit:') === 0) {
        if (nextSnap.testingIdx > prevSnap.testingIdx) gainPills.push(p);
        else costPills.push(p);
      } else {
        gainPills.push(p);
      }
    });

    const wastedSafeguardOnZeroNoise =
      (controlKey === 'discoveryDampener' && nextSnap.discoveryDampener && nextSnap.discoveryNoiseIdx === 0) ||
      (controlKey === 'buildDampener' && nextSnap.buildDampener && nextSnap.buildNoiseIdx === 0) ||
      (controlKey === 'rolloutDampener' && nextSnap.rolloutDampener && nextSnap.reachIdx > 0 && nextSnap.messagingNoiseIdx === 0) ||
      (controlKey === 'testing' && nextSnap.testingIdx > prevSnap.testingIdx && nextSnap.buildNoiseIdx === 0);

    const gainEmptyText = wastedSafeguardOnZeroNoise ? ui.tradeoffNoNoise : ui.tradeoffNone;
    const gainInner = gainPills.length > 0
      ? renderPillsHtml(gainPills)
      : '<span class="tradeoff-empty">' + escapeHtmlAttr(gainEmptyText) + '</span>';
    const costInner = costPills.length > 0
      ? renderPillsHtml(costPills)
      : '<span class="tradeoff-empty">' + escapeHtmlAttr(ui.tradeoffNone) + '</span>';

    const hasBad = (pills || []).some(function (p) { return p.tone === 'bad'; });
    const hasGood = gainPills.some(function (p) { return p.tone === 'good'; });
    const paceLimit = Math.min(
      nextSnap.worldSec,
      Number.isFinite(nextSnap.shockSec) ? nextSnap.shockSec : Infinity
    );
    const staleNow = nextSnap.loopSec >= paceLimit * 0.9;
    const looseWipUnderHeavyDemand =
      controlKey === 'wip' && nextSnap.wipIdx >= 2 && nextSnap.demandIdx >= 2;
    let barTone = 'tone-warn';
    if (hasBad && !hasGood) barTone = 'tone-bad';
    else if (hasGood && !hasBad && !staleNow && !looseWipUnderHeavyDemand) barTone = 'tone-good';

    return {
      barTone: barTone,
      html:
        '<span class="tradeoff-group tradeoff-gain">' +
        '<span class="tradeoff-kicker">' + escapeHtmlAttr(ui.tradeoffGainLabel) + '</span>' +
        gainInner +
        '</span>' +
        '<span class="tradeoff-group tradeoff-cost">' +
        '<span class="tradeoff-kicker">' + escapeHtmlAttr(ui.tradeoffCostLabel) + '</span>' +
        costInner +
        '</span>'
    };
  }

  function renderImpactBar() {
    if (settings.chapter < 2) {
      impactBarEl.classList.add('is-hidden');
      impactBarEl.classList.remove('is-active', 'is-hover');
      clearImpactToneClasses();
      impactHeaderEl.textContent = '';
      impactHeaderEl.classList.add('is-hidden');
      impactPillsEl.innerHTML = '';
      return;
    }
    impactBarEl.classList.remove('is-hidden');
    const isCyber = isCyberneticsView();

    if (sim.hoverControlKey && CONTROL_DESCRIPTORS[sim.hoverControlKey]) {
      const hSpec = CONTROL_DESCRIPTORS[sim.hoverControlKey];
      const suppressHoverForCurrentEdit =
        sim.hoverCommittedKey === sim.hoverControlKey &&
        sim.lastImpact &&
        sim.lastImpact.kind === 'change' &&
        sim.lastImpact.controlKey === sim.hoverControlKey;
      if (!suppressHoverForCurrentEdit) {
        impactBarEl.classList.add('is-hover');
        impactBarEl.classList.remove('is-active');
        clearImpactToneClasses();
        impactHeaderEl.textContent = (isCyber ? hSpec.cyberTitle : hSpec.productTitle) + ':';
        impactHeaderEl.classList.remove('is-hidden');
        impactPillsEl.innerHTML = '';
        impactSummaryEl.textContent = isCyber ? hSpec.hoverCyber : hSpec.hoverProduct;
        return;
      }
    }

    if (sim.lastImpact) {
      const ui = UI_COPY[isCyber ? 'cybernetics' : 'product'];
      impactBarEl.classList.add('is-active');
      impactBarEl.classList.remove('is-hover');
      clearImpactToneClasses();
      if (sim.lastImpact.kind === 'preset') {
        const snap = captureMetricsSnapshot();
        const presetDetail = explainPresetSnapshot(snap, isCyber);
        impactBarEl.classList.add(presetDetail.barTone);
        if (sim.lastImpact.customUrl) {
          impactHeaderEl.textContent = ui.sharedSetupHeader;
        } else {
          const pName = isCyber ? sim.lastImpact.cyberneticsLabel : sim.lastImpact.presetLabel;
          impactHeaderEl.textContent = ui.presetHeaderPrefix + pName;
        }
        impactHeaderEl.classList.remove('is-hidden');
        impactPillsEl.innerHTML = renderPillsHtml(presetDetail.pills);
        impactSummaryEl.textContent = '';
        return;
      }

      const cSpec = CONTROL_DESCRIPTORS[sim.lastImpact.controlKey];
      if (cSpec) {
        const detail = explainControlImpact(
          sim.lastImpact.controlKey,
          sim.lastImpact.prevSnap,
          sim.lastImpact.nextSnap,
          isCyber
        );
        if (detail) {
          const ledger = renderTradeoffLedger(
            detail.pills,
            sim.lastImpact.controlKey,
            sim.lastImpact.prevSnap,
            sim.lastImpact.nextSnap,
            ui
          );
          impactBarEl.classList.add('is-tradeoff', ledger.barTone);
          impactHeaderEl.textContent = isCyber
            ? (cSpec.cyberCommittedHeader || (cSpec.cyberTitle + ' updated:'))
            : (cSpec.productCommittedHeader || (cSpec.productTitle + ' updated:'));
          impactHeaderEl.classList.remove('is-hidden');
          impactPillsEl.innerHTML = ledger.html;
          impactSummaryEl.textContent = '';
          return;
        }
      }
    }

    impactBarEl.classList.remove('is-active', 'is-hover');
    clearImpactToneClasses();
    impactHeaderEl.textContent = '';
    impactHeaderEl.classList.add('is-hidden');
    impactPillsEl.innerHTML = '';
    impactSummaryEl.textContent = UI_COPY[isCyber ? 'cybernetics' : 'product'].impactIdle;
  }

  function recordControlImpact(controlKey, prevSnap, markHistoryBreak) {
    if (sim.sliderGesture && sim.sliderGesture.controlKey !== controlKey) {
      sim.sliderGesture = null;
    }
    if (markHistoryBreak && sim.history.length > 0) {
      markPolicyChange(controlKey);
      renderHistoryStrip();
    }
    if (settings.chapter < 2) {
      sim.hoverCommittedKey = null;
      sim.activeSpotlight = null;
      sim.lastSpotlightZones = [];
      sim.lastImpact = null;
      renderImpactBar();
      return;
    }
    const nextSnap = captureMetricsSnapshot();
    const zones = getSpotlightZonesForControl(controlKey, prevSnap, nextSnap);
    sim.hoverCommittedKey = sim.hoverControlKey === controlKey ? controlKey : null;
    sim.lastSpotlightZones = zones.slice();
    sim.activeSpotlight = {
      controlKey: controlKey,
      zones: zones,
      elapsed: 0,
      duration: SPOTLIGHT_TOTAL_SEC
    };
    sim.lastImpact = {
      kind: 'change',
      controlKey: controlKey,
      prevSnap: prevSnap,
      nextSnap: nextSnap
    };
    renderImpactBar();
  }

  let activePresetButtons = [];

  function doesPresetMatchSettings(preset) {
    if (!preset || !preset.values) return false;
    const keys = Object.keys(preset.values);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (settings[k] !== preset.values[k]) return false;
    }
    return true;
  }

  function syncActivePresetButtonsUI() {
    let matchedOne = false;
    for (let i = 0; i < activePresetButtons.length; i++) {
      const entry = activePresetButtons[i];
      const active = !matchedOne && doesPresetMatchSettings(entry.preset);
      if (active) matchedOne = true;
      entry.btn.classList.toggle('active', active);
      entry.btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  function renderPresetsForChapter(chNum) {
    const ch = CHAPTERS[chNum];
    const isCyber = isCyberneticsView();
    activePresetButtons = [];
    experimentsRowEl.innerHTML = '<span class="experiments-label">Quick experiments:</span>';
    ch.presets.forEach(function (preset) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-preset';
      btn.textContent = isCyber && preset.cyberneticsLabel ? preset.cyberneticsLabel : preset.label;
      btn.addEventListener('click', function () {
        const zones = applyPresetValuesAndGetZones(preset.values);
        syncControlsFromSettings();
        resetSimulation();
        if (settings.chapter >= 2) {
          sim.lastSpotlightZones = zones.slice();
          sim.activeSpotlight = {
            controlKey: 'preset',
            zones: zones,
            elapsed: 0,
            duration: SPOTLIGHT_TOTAL_SEC
          };
          sim.lastImpact = {
            kind: 'preset',
            presetLabel: preset.label,
            cyberneticsLabel: preset.cyberneticsLabel || preset.label
          };
        }
        renderImpactBar();
        renderCanvas();
        syncUrlFromState();
      });
      activePresetButtons.push({ btn: btn, preset: preset });
      experimentsRowEl.appendChild(btn);
    });
    syncActivePresetButtonsUI();
  }

  function syncViewModeUI() {
    const chNum = settings.chapter;
    const ch = CHAPTERS[chNum];
    if (!ch) return;
    const isCyber = isCyberneticsView();
    const ui = UI_COPY[isCyber ? 'cybernetics' : 'product'];

    productViewBtn.classList.toggle('active', !isCyber);
    productViewBtn.setAttribute('aria-pressed', isCyber ? 'false' : 'true');
    cyberneticsViewBtn.classList.toggle('active', isCyber);
    cyberneticsViewBtn.setAttribute('aria-pressed', isCyber ? 'true' : 'false');

    tabNameEls.forEach(function (el, idx) {
      const c = CHAPTERS[idx + 1];
      if (el && c) {
        el.textContent = isCyber ? c.tabCyberneticsName : c.tabName;
      }
    });

    topShockBtn.textContent = ui.shockBtn;
    triggerShockBtn.textContent = ui.shockBtn;

    loopTimePrefixEl.textContent = ui.loopTimePrefix;
    worldCyclePrefixEl.textContent = ui.worldCyclePrefix;

    legendNeedTextEl.textContent = ui.legendNeed;
    legendSpecTextEl.textContent = ui.legendSpec;
    legendBuiltTextEl.textContent = ui.legendBuilt;
    legendChipTextEl.textContent = ui.legendChip;

    historyLabelEl.textContent = ui.historyLabel;

    chapterKickerEl.textContent = 'Chapter ' + chNum + ' of ' + MAX_BUILT_CHAPTER;
    chapterHeadingEl.textContent = isCyber ? ch.cyberneticsHeading : ch.heading;
    chapterStoryEl.innerHTML = isCyber ? ch.cyberneticsHtml : ch.storyHtml;
    lessonTitleEl.textContent = isCyber
      ? 'Cybernetic Principle (Chapter ' + chNum + ')'
      : ch.lessonTitle;
    lessonTextEl.textContent = isCyber ? ch.cyberneticsLessonText : ch.lessonText;

    if (ch.prevButtonLabel) {
      prevChapterBtn.textContent =
        isCyber && ch.cyberneticsPrevLabel ? ch.cyberneticsPrevLabel : ch.prevButtonLabel;
    }
    if (chNum < MAX_BUILT_CHAPTER && ch.nextButtonLabel) {
      nextChapterBtn.textContent =
        isCyber && ch.cyberneticsNextLabel ? ch.cyberneticsNextLabel : ch.nextButtonLabel;
      nextChapterBtn.classList.remove('is-hidden');
    } else if (chNum === MAX_BUILT_CHAPTER && !isCyber) {
      nextChapterBtn.textContent = ui.ch8CyberBridgeBtn;
      nextChapterBtn.classList.remove('is-hidden');
    } else {
      nextChapterBtn.classList.add('is-hidden');
    }

    environmentEyebrowEl.textContent = chNum === 1 ? ui.environmentEyebrowCh1 : ui.environmentEyebrow;
    activeControlsEyebrowEl.textContent =
      chNum === 8
        ? ui.activeControlsEyebrowPrefix + ' (Chapter 8: ' + ui.activeControlsCh8Suffix + ')'
        : ui.activeControlsEyebrowPrefix + ' (Chapter ' + chNum + ')';

    worldBlockTitleEl.textContent = ui.worldBlockTitle;
    noiseBlockTitleEl.textContent = ui.noiseBlockTitle;
    flowBlockTitleEl.textContent = ui.flowBlockTitle;
    discoveryBlockTitleEl.textContent = ui.discoveryBlockTitle;
    buildBlockTitleEl.textContent = ui.buildBlockTitle;
    testingBlockTitleEl.textContent = ui.testingBlockTitle;
    rolloutBlockTitleEl.textContent = ui.rolloutBlockTitle;
    channelsBlockTitleEl.textContent = ui.channelsBlockTitle;

    driftLabelEl.textContent = ui.driftLabel;
    driftHelpEl.textContent = ui.driftHelp;
    demandLabelEl.textContent = ui.demandLabel;
    demandHelpEl.textContent = ui.demandHelp;
    shockLabelEl.textContent = ui.shockLabel;
    shockHelpEl.textContent = ui.shockHelp;

    wipLabelEl.textContent = ui.wipLabel;
    wipHelpEl.textContent = ui.wipHelp;

    discoveryLabelEl.textContent = ui.discoveryLabel;
    discoveryHelpEl.textContent = ui.discoveryHelp;
    discoveryNoiseLabelEl.textContent = ui.discoveryNoiseLabel;
    discoveryNoiseHelpEl.textContent = ui.discoveryNoiseHelp;
    discoveryDampenerTitleEl.textContent = ui.discoveryDampenerTitle;
    discoveryDampenerMetaEl.textContent = ui.discoveryDampenerMeta;

    buildLabelEl.textContent = ui.buildLabel;
    buildHelpEl.textContent = ui.buildHelp;
    build10xTitleEl.textContent = ui.build10xTitle;
    build10xMetaEl.textContent = ui.build10xMeta;
    buildNoiseLabelEl.textContent = ui.buildNoiseLabel;
    buildNoiseHelpEl.textContent = ui.buildNoiseHelp;
    buildDampenerTitleEl.textContent = ui.buildDampenerTitle;
    buildDampenerMetaEl.textContent = ui.buildDampenerMeta;

    testingLabelEl.textContent = ui.testingLabel;
    testingHelpEl.textContent = ui.testingHelp;

    reachLabelEl.textContent = ui.reachLabel;
    reachHelpEl.textContent = ui.reachHelp;
    messagingNoiseLabelEl.textContent = ui.messagingNoiseLabel;
    messagingNoiseHelpEl.textContent = ui.messagingNoiseHelp;
    rolloutDampenerTitleEl.textContent = ui.rolloutDampenerTitle;
    rolloutDampenerMetaEl.textContent = ui.rolloutDampenerMeta;

    diagnosticChannelTitleEl.textContent = ui.diagnosticChannelTitle;
    diagnosticChannelMetaEl.textContent = ui.diagnosticChannelMeta;
    andonCordTitleEl.textContent = ui.andonCordTitle;
    andonCordMetaEl.textContent = ui.andonCordMeta;

    activePresetButtons.forEach(function (entry) {
      entry.btn.textContent =
        isCyber && entry.preset.cyberneticsLabel
          ? entry.preset.cyberneticsLabel
          : entry.preset.label;
    });

    syncStoryCollapseUI();
    syncHintsCollapseUI();
    syncCopyLinkButtonUI();
    renderImpactBar();
  }

  function setViewMode(mode) {
    const nextMode = mode === 'cybernetics' ? 'cybernetics' : 'product';
    settings.viewMode = nextMode;
    try {
      if (window.localStorage) {
        window.localStorage.setItem('bq_view_mode', nextMode);
      }
    } catch (_) {
      // Ignore storage restrictions on file://
    }
    syncViewModeUI();
    updateReadouts();
    renderHistoryStrip();
    renderCanvas();
    syncUrlFromState();
  }

  function applyChapter(chNum) {
    const ch = CHAPTERS[chNum];
    if (!ch || !M.applyChapterSettings(chNum)) return;

    document.querySelectorAll('.chapter-tab').forEach(function (tab) {
      const n = Number(tab.getAttribute('data-chapter'));
      tab.classList.toggle('active', n === chNum);
    });

    const showCh2 = chNum >= 2;
    const showCh3 = chNum >= 3;
    const showCh4 = chNum >= 4;
    const showCh5 = chNum >= 5;
    const showCh6 = chNum >= 6;
    const showCh7 = chNum >= 7;

    impactBarEl.classList.toggle('is-hidden', !showCh2);
    topShockBtn.classList.toggle('is-hidden', !showCh7);
    topShockBtn.disabled = !showCh7;
    governanceColumnsEl.classList.toggle('is-early-chapters', !showCh3);

    noiseConditionsBlockEl.classList.toggle('is-hidden', !showCh2);
    flowControlBlockEl.classList.toggle('is-hidden', !showCh4);
    testingControlBlockEl.classList.toggle('is-hidden', !showCh3);
    rolloutControlBlockEl.classList.toggle('is-hidden', !showCh5);
    channelsControlBlockEl.classList.toggle('is-hidden', !showCh6);

    demandControlGroupEl.classList.toggle('is-hidden', !showCh4);
    shockControlGroupEl.classList.toggle('is-hidden', !showCh7);
    discoveryNoiseGroupEl.classList.toggle('is-hidden', !showCh2);
    buildNoiseGroupEl.classList.toggle('is-hidden', !showCh2);
    messagingNoiseGroupEl.classList.toggle('is-hidden', !showCh5);
    discoveryDampenerBoxEl.classList.toggle('is-hidden', !showCh2);
    build10xBoxEl.classList.toggle('is-hidden', !showCh4);
    buildDampenerBoxEl.classList.toggle('is-hidden', !showCh2);
    diagnosticChannelBoxEl.classList.toggle('is-hidden', !showCh6);
    andonCordBoxEl.classList.toggle('is-hidden', !showCh7);

    demandSlider.disabled = !showCh4;
    shockSlider.disabled = !showCh7;
    triggerShockBtn.disabled = !showCh7;
    discoveryNoiseSlider.disabled = !showCh2;
    buildNoiseSlider.disabled = !showCh2;
    messagingNoiseSlider.disabled = !showCh5;
    wipSlider.disabled = !showCh4;
    discoveryDampenerToggle.disabled = !showCh2;
    build10xToggle.disabled = !showCh4;
    buildDampenerToggle.disabled = !showCh2;
    testingSlider.disabled = !showCh3;
    reachSlider.disabled = !showCh5;
    rolloutDampenerToggle.disabled = !showCh5;
    diagnosticChannelToggle.disabled = !showCh6;
    andonCordToggle.disabled = !showCh7;

    flowNewBadgeEl.classList.toggle('is-hidden', chNum !== 4);
    worldNewBadgeEl.classList.toggle('is-hidden', chNum !== 4 && chNum !== 7);
    if (chNum === 4) worldNewBadgeEl.textContent = 'Ch. 4';
    if (chNum === 7) worldNewBadgeEl.textContent = 'Ch. 7';
    noiseNewBadgeEl.classList.toggle('is-hidden', chNum !== 2 && chNum !== 5);
    if (chNum === 2) noiseNewBadgeEl.textContent = 'Ch. 2';
    if (chNum === 5) noiseNewBadgeEl.textContent = 'Ch. 5';
    discoveryNewBadgeEl.classList.toggle('is-hidden', chNum !== 2);
    buildNewBadgeEl.classList.toggle('is-hidden', chNum !== 2 && chNum !== 4);
    if (chNum === 2) buildNewBadgeEl.textContent = 'Ch. 2';
    if (chNum === 4) buildNewBadgeEl.textContent = 'Ch. 4';
    testingNewBadgeEl.classList.toggle('is-hidden', chNum !== 3);
    rolloutNewBadgeEl.classList.toggle('is-hidden', chNum !== 5);
    channelsNewBadgeEl.classList.toggle('is-hidden', chNum !== 6 && chNum !== 7);
    if (chNum === 6) channelsNewBadgeEl.textContent = 'Ch. 6';
    if (chNum === 7) channelsNewBadgeEl.textContent = 'Ch. 7';

    if (ch.prevButtonLabel) {
      prevChapterBtn.textContent = ch.prevButtonLabel;
      prevChapterBtn.classList.remove('is-hidden');
    } else {
      prevChapterBtn.classList.add('is-hidden');
    }

    if (chNum < MAX_BUILT_CHAPTER && ch.nextButtonLabel) {
      nextChapterBtn.textContent = ch.nextButtonLabel;
      nextChapterBtn.classList.remove('is-hidden');
    } else {
      nextChapterBtn.classList.add('is-hidden');
    }

    storyCollapsed = false;
    renderPresetsForChapter(chNum);
    syncViewModeUI();
    syncControlsFromSettings();
    resetSimulation();
    syncUrlFromState();
  }

  function escapeHtmlAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderHistoryStrip() {
    const isCyber = isCyberneticsView();
    const aborted = sim.totalFlushedByAndon;
    const abortedSuffix = aborted > 0
      ? (isCyber
          ? ' &middot; Purged by algedonic: <span class="mono-stat">' + aborted + '</span>'
          : ' &middot; Aborted by Andon: <span class="mono-stat">' + aborted + '</span>')
      : '';

    if (sim.history.length === 0) {
      const ui = UI_COPY[isCyber ? 'cybernetics' : 'product'];
      if (aborted > 0) {
        const betWord = aborted === 1 ? 'bet' : 'bets';
        const itemWord = aborted === 1 ? 'item' : 'items';
        historyStripEl.innerHTML = isCyber
          ? '<span class="history-empty history-thrash">0 outputs completed (' + aborted + ' in-flight ' + itemWord + ' purged by algedonic interrupt)</span>'
          : '<span class="history-empty history-thrash">0 launches completed (' + aborted + ' ' + betWord + ' aborted mid-flight by Andon cord)</span>';
      } else {
        historyStripEl.innerHTML = '<span class="history-empty">' + ui.historyWaiting + '</span>';
      }
      historySummaryEl.innerHTML = ui.historyAvgEmpty + abortedSuffix;
      return;
    }

    let sum = 0;
    const html = sim.history
      .map(function (h, idx) {
        sum += h.fitPct;
        const cls = h.fitPct >= 75 ? 'fit' : h.fitPct >= 52 ? 'partial' : 'miss';
        const notes = ['lead ' + formatSimDays(h.leadTimeSec)];
        if (h.testedPassed) notes.push('passed testing');
        if (h.reworkCount > 0) notes.push('reworked ' + h.reworkCount + 'x');
        if (h.outerReturns > 0) {
          notes.push(
            (h.outerMode === 'diagnosed' ? 'diagnosed \u2192 ' : 'guessed \u2192 ') + h.outerExit
          );
        }
        if (h.labelStatus === 'silent') notes.push('silent unlabelled rollout');
        else if (h.labelStatus && h.labelStatus !== 'accurate') {
          notes.push('labelled "' + h.shippedLabel + '"');
        }
        const fitLabel = h.outerReturns > 0
          ? h.initialFitPct + '% \u2192 ' + h.fitPct + '% fit'
          : h.fitPct + '% fit';
        const tip =
          'Bet #' + h.id + ': ' + fitLabel + ' (built ' + h.builtFor + ' [' + notes.join(', ') + '], world was ' + h.landedOn + ')';
        const retryCls = h.outerReturns > 0 ? ' retry' : '';
        const afterCls = h.afterPolicyChange ? ' after-change' : '';
        const pendingCls = sim.pendingPolicyBreak && idx === sim.history.length - 1 ? ' pending-change' : '';
        const chipText = (h.outerReturns > 0 ? '\u21bb' : '') + h.fitPct;
        return '<span class="history-chip ' + cls + retryCls + afterCls + pendingCls + '" title="' + escapeHtmlAttr(tip) + '">' + chipText + '</span>';
      })
      .join('');
    historyStripEl.innerHTML = html;

    const avg = Math.round(sum / sim.history.length);
    const hasOuterActivity = sim.history.some(function (h) {
      return h.outerReturns > 0 || !h.settled;
    });
    let lastBreakIdx = -1;
    for (let i = sim.history.length - 1; i >= 0; i--) {
      if (sim.history[i].afterPolicyChange) {
        lastBreakIdx = i;
        break;
      }
    }
    let sinceBreakPrefix = '';
    if (!sim.pendingPolicyBreak && lastBreakIdx !== -1) {
      const postSlice = sim.history.slice(lastBreakIdx);
      const postSettled = postSlice.filter(function (h) { return h.settled; });
      const basis = hasOuterActivity && postSettled.length > 0 ? postSettled : postSlice;
      const sinceAvg = Math.round(
        basis.reduce(function (acc, h) { return acc + h.fitPct; }, 0) / basis.length
      );
      sinceBreakPrefix = 'Since <span class="policy-divider-mark">|</span>: <span class="mono-stat">' + sinceAvg + '%</span> &middot; ';
    }
    if (hasOuterActivity) {
      const settledEntries = sim.history.filter(function (h) { return h.settled; });
      const settledText = settledEntries.length > 0
        ? Math.round(
            settledEntries.reduce(function (acc, h) { return acc + h.fitPct; }, 0) /
            settledEntries.length
          ) + '%'
        : '--';
      historySummaryEl.innerHTML = sinceBreakPrefix + (isCyber
        ? 'Settled bet fit: <span class="mono-stat">' + settledText + '</span>' +
          ' &middot; All outputs: <span class="mono-stat">' + avg + '%</span>'
        : 'Settled bet fit: <span class="mono-stat">' + settledText + '</span>' +
          ' &middot; All launches: <span class="mono-stat">' + avg + '%</span>') + abortedSuffix;
    } else {
      historySummaryEl.innerHTML = sinceBreakPrefix + (isCyber
        ? 'Average environmental fit (' + sim.history.length + ' outputs): <span class="mono-stat">' + avg + '%</span>'
        : 'Average real-world fit (' + sim.history.length + ' launches): <span class="mono-stat">' + avg + '%</span>') + abortedSuffix;
    }
  }

  function syncPlayPauseUI() {
    if (!sim.running) {
      playPauseBtn.classList.remove('is-tactical-pause');
      if (playPauseBtn.style && playPauseBtn.style.removeProperty) {
        playPauseBtn.style.removeProperty('--tactical-progress');
      }
      if (playPauseBtn.textContent !== 'Play') {
        playPauseBtn.textContent = 'Play';
      }
      return;
    }
    if (isTacticallyPaused()) {
      playPauseBtn.classList.add('is-tactical-pause');
      const holding = Boolean(sim.sliderGesture && sim.sliderGesture.pointerActive);
      const dur = sim.tacticalPauseDuration || TACTICAL_PAUSE_SEC;
      const ratio = holding ? 1 : Math.max(0, Math.min(1, sim.tacticalPauseRemaining / dur));
      if (playPauseBtn.style && playPauseBtn.style.setProperty) {
        playPauseBtn.style.setProperty('--tactical-progress', ratio.toFixed(3));
      }
      const secsLeft = Math.max(1, Math.ceil(holding ? dur : sim.tacticalPauseRemaining));
      const nextLabel = 'Resume (' + secsLeft + 's)';
      if (playPauseBtn.textContent !== nextLabel) {
        playPauseBtn.textContent = nextLabel;
      }
      return;
    }
    playPauseBtn.classList.remove('is-tactical-pause');
    if (playPauseBtn.style && playPauseBtn.style.removeProperty) {
      playPauseBtn.style.removeProperty('--tactical-progress');
    }
    if (playPauseBtn.textContent !== 'Pause') {
      playPauseBtn.textContent = 'Pause';
    }
  }

  function resetSimulation() {
    M.resetSimulationState();
    clockValueEl.textContent = '0.0d';
    syncPlayPauseUI();
    renderHistoryStrip();
    renderImpactBar();
    updateReadouts();
    renderCanvas();
  }

  document.querySelectorAll('.chapter-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (tab.disabled) return;
      const target = Number(tab.getAttribute('data-chapter'));
      applyChapter(target);
    });
  });

  storyToggleBtn.addEventListener('click', toggleStoryCollapsed);
  chapterHeadingEl.addEventListener('click', toggleStoryCollapsed);
  hintsToggleBtn.addEventListener('click', toggleHintsCollapsed);

  prevChapterBtn.addEventListener('click', function () {
    if (settings.chapter > 1) {
      applyChapter(settings.chapter - 1);
      if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  nextChapterBtn.addEventListener('click', function () {
    if (settings.chapter < MAX_BUILT_CHAPTER) {
      applyChapter(settings.chapter + 1);
      if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (settings.chapter === MAX_BUILT_CHAPTER && !isCyberneticsView()) {
      setViewMode('cybernetics');
      applyChapter(1);
      if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  function syncHoverControlFromStack() {
    sim.hoverControlKey = sim.hoverStack.length > 0 ? sim.hoverStack[sim.hoverStack.length - 1] : null;
    renderImpactBar();
    renderCanvas();
  }

  function bindHoverSpotlight(el, controlKey) {
    if (!el) return;
    el.addEventListener('mouseenter', function () {
      if (settings.chapter < 2 || isControlDisabled(controlKey)) return;
      sim.hoverCommittedKey = null;
      const existing = sim.hoverStack.indexOf(controlKey);
      if (existing !== -1) sim.hoverStack.splice(existing, 1);
      sim.hoverStack.push(controlKey);
      syncHoverControlFromStack();
    });
    el.addEventListener('mouseleave', function () {
      if (sim.hoverCommittedKey === controlKey) {
        sim.hoverCommittedKey = null;
      }
      const idx = sim.hoverStack.indexOf(controlKey);
      if (idx !== -1) {
        sim.hoverStack.splice(idx, 1);
        syncHoverControlFromStack();
      }
    });
  }

  bindHoverSpotlight(driftControlGroupEl, 'drift');
  bindHoverSpotlight(demandControlGroupEl, 'demand');
  bindHoverSpotlight(shockControlGroupEl, 'shock');
  bindHoverSpotlight(triggerShockBtn, 'manualShock');
  bindHoverSpotlight(topShockBtn, 'manualShock');
  bindHoverSpotlight(discoveryNoiseGroupEl, 'discoveryNoise');
  bindHoverSpotlight(buildNoiseGroupEl, 'buildNoise');
  bindHoverSpotlight(messagingNoiseGroupEl, 'messagingNoise');
  bindHoverSpotlight(flowControlGroupEl, 'wip');
  bindHoverSpotlight(discoverySliderZoneEl, 'discovery');
  bindHoverSpotlight(discoveryDampenerBoxEl, 'discoveryDampener');
  bindHoverSpotlight(buildSliderZoneEl, 'build');
  bindHoverSpotlight(build10xBoxEl, 'build10x');
  bindHoverSpotlight(buildDampenerBoxEl, 'buildDampener');
  bindHoverSpotlight(testingControlGroupEl, 'testing');
  bindHoverSpotlight(reachSliderZoneEl, 'reach');
  bindHoverSpotlight(rolloutDampenerBoxEl, 'rolloutDampener');
  bindHoverSpotlight(diagnosticChannelBoxEl, 'diagnostic');
  bindHoverSpotlight(andonCordBoxEl, 'andon');

  if (impactBarEl) {
    impactBarEl.addEventListener('mouseenter', function () {
      if (settings.chapter < 2) return;
      sim.hoverImpactBar = true;
      renderCanvas();
    });
    impactBarEl.addEventListener('mouseleave', function () {
      if (!sim.hoverImpactBar) return;
      sim.hoverImpactBar = false;
      renderCanvas();
    });
  }

  const SLIDER_GESTURE_WINDOW_MS = 1200;
  const SLIDER_GESTURE_WINDOW_SIM_SEC = 1.2;

  function getGestureNowMs() {
    const perfNow = typeof performance !== 'undefined' && performance.now ? performance.now() : 0;
    return perfNow > 0 ? perfNow : Date.now();
  }

  function startFreshSliderGesture(controlKey, settingKey, pointerActive) {
    sim.sliderGesture = {
      controlKey: controlKey,
      settingKey: settingKey,
      startVal: settings[settingKey],
      startSnap: captureMetricsSnapshot(),
      priorImpact: sim.lastImpact ? Object.assign({}, sim.lastImpact) : null,
      priorSpotlight: sim.activeSpotlight ? Object.assign({}, sim.activeSpotlight) : null,
      priorLastZones: sim.lastSpotlightZones.slice(),
      priorTacticalRemaining: sim.tacticalPauseRemaining,
      priorPolicyState: snapshotPolicyBreakState(),
      pointerActive: Boolean(pointerActive),
      markedBreak: false,
      lastWallMs: getGestureNowMs(),
      lastSimSec: sim.clockSec
    };
    return sim.sliderGesture;
  }

  function endActiveSliderPointer() {
    if (sim.sliderGesture && sim.sliderGesture.pointerActive) {
      const g = sim.sliderGesture;
      if (settings[g.settingKey] === g.startVal) {
        sim.tacticalPauseRemaining = g.priorTacticalRemaining;
      }
      sim.sliderGesture = null;
      syncPlayPauseUI();
      renderCanvas();
    }
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const KNOB_CX = 25;
  const KNOB_CY = 24;
  const KNOB_DRAG_PX_PER_NOTCH = 18;

  function createSvgEl(tag) {
    return document.createElementNS
      ? document.createElementNS(SVG_NS, tag)
      : document.createElement(tag);
  }

  function polarKnobPoint(r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: KNOB_CX + r * Math.cos(rad),
      y: KNOB_CY + r * Math.sin(rad)
    };
  }

  const KNOB_SCALE_ARC_PATH = (function () {
    const steps = 28;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const deg = -105 + (210 * i) / steps;
      const p = polarKnobPoint(19.0, deg);
      pts.push((i === 0 ? 'M ' : 'L ') + p.x.toFixed(2) + ' ' + p.y.toFixed(2));
    }
    return pts.join(' ');
  })();

  const KNOB_FLUTED_GRIP_PATH = (function () {
    const steps = 120;
    const pts = [];
    for (let i = 0; i < steps; i++) {
      const theta = (2 * Math.PI * i) / steps;
      const r = 14.85 + 0.68 * Math.cos(20 * theta);
      const x = KNOB_CX + r * Math.cos(theta);
      const y = KNOB_CY + r * Math.sin(theta);
      pts.push((i === 0 ? 'M ' : 'L ') + x.toFixed(2) + ' ' + y.toFixed(2));
    }
    pts.push('Z');
    return pts.join(' ');
  })();

  function extractPointerCoords(e) {
    if (!e) return { x: 0, y: 0 };
    if (e.touches && e.touches.length > 0) {
      return { x: Number(e.touches[0].clientX) || 0, y: Number(e.touches[0].clientY) || 0 };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { x: Number(e.changedTouches[0].clientX) || 0, y: Number(e.changedTouches[0].clientY) || 0 };
    }
    return { x: Number(e.clientX) || 0, y: Number(e.clientY) || 0 };
  }

  function focusKnobInput(sliderEl) {
    if (!sliderEl || !sliderEl.focus) return;
    try {
      sliderEl.focus({ preventScroll: true });
    } catch (_) {
      sliderEl.focus();
    }
  }

  let activeKnobDrag = null;

  function applySliderValueChange(controlKey, settingKey, sliderEl, afterChangeFn) {
    if (sliderEl.disabled) return;
    const nextVal = Math.max(0, Math.min(3, Math.round(Number(sliderEl.value))));
    sliderEl.value = String(nextVal);
    const nowMs = getGestureNowMs();
    let g = sim.sliderGesture;

    const isContinuation =
      g &&
      g.controlKey === controlKey &&
      (g.pointerActive ||
        (nowMs - g.lastWallMs <= SLIDER_GESTURE_WINDOW_MS &&
          Math.abs(sim.clockSec - g.lastSimSec) <= SLIDER_GESTURE_WINDOW_SIM_SEC));

    if (!isContinuation) {
      if (nextVal === settings[settingKey]) {
        syncAllKnobsUI();
        return;
      }
      g = startFreshSliderGesture(controlKey, settingKey, false);
    }

    g.lastWallMs = nowMs;
    g.lastSimSec = sim.clockSec;
    settings[settingKey] = nextVal;
    if (afterChangeFn) afterChangeFn();
    updateReadouts();

    if (nextVal === g.startVal) {
      sim.hoverCommittedKey = null;
      sim.lastImpact = g.priorImpact ? Object.assign({}, g.priorImpact) : null;
      sim.activeSpotlight = g.priorSpotlight ? Object.assign({}, g.priorSpotlight) : null;
      sim.lastSpotlightZones = g.priorLastZones.slice();
      sim.tacticalPauseRemaining = g.priorTacticalRemaining;
      restorePolicyBreakState(g.priorPolicyState);
      g.markedBreak = false;
      syncPlayPauseUI();
      renderHistoryStrip();
      renderImpactBar();
      renderCanvas();
      syncUrlFromState();
      return;
    }

    triggerTacticalPause();
    syncPlayPauseUI();
    const shouldMarkBreak = !g.markedBreak;
    if (shouldMarkBreak && sim.history.length > 0) {
      g.markedBreak = true;
    }
    recordControlImpact(controlKey, g.startSnap, shouldMarkBreak);
    renderCanvas();
    syncUrlFromState();
  }

  function onWindowPointerMove(e) {
    if (!activeKnobDrag || activeKnobDrag.sliderEl.disabled) return;
    const pt = extractPointerCoords(e);
    const dx = pt.x - activeKnobDrag.startX;
    const dy = pt.y - activeKnobDrag.startY;
    if (!activeKnobDrag.dragged && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      activeKnobDrag.dragged = true;
    }
    if (!activeKnobDrag.dragged) return;
    if (e && e.preventDefault) e.preventDefault();
    const linearDelta = dx - dy;
    const stepDelta = Math.round(linearDelta / KNOB_DRAG_PX_PER_NOTCH);
    const nextVal = Math.max(0, Math.min(3, activeKnobDrag.startVal + stepDelta));
    if (nextVal !== Number(activeKnobDrag.sliderEl.value)) {
      activeKnobDrag.sliderEl.value = String(nextVal);
      applySliderValueChange(
        activeKnobDrag.controlKey,
        activeKnobDrag.settingKey,
        activeKnobDrag.sliderEl,
        activeKnobDrag.afterChangeFn
      );
    }
  }

  function onWindowPointerEnd() {
    if (activeKnobDrag) {
      const drag = activeKnobDrag;
      activeKnobDrag = null;
      drag.knobEl.classList.remove('is-dragging');
      if (!drag.dragged && !drag.sliderEl.disabled) {
        const nextVal = (drag.startVal + 1) % 4;
        drag.sliderEl.value = String(nextVal);
        applySliderValueChange(
          drag.controlKey,
          drag.settingKey,
          drag.sliderEl,
          drag.afterChangeFn
        );
      }
    }
    endActiveSliderPointer();
  }

  function onWindowPointerCancel() {
    if (activeKnobDrag) {
      activeKnobDrag.knobEl.classList.remove('is-dragging');
      activeKnobDrag = null;
    }
    endActiveSliderPointer();
  }

  window.addEventListener('mousemove', onWindowPointerMove);
  window.addEventListener('touchmove', onWindowPointerMove, { passive: false });
  window.addEventListener('mouseup', onWindowPointerEnd);
  window.addEventListener('touchend', onWindowPointerEnd);
  window.addEventListener('touchcancel', onWindowPointerCancel);

  function bindSliderGesture(sliderEl, knobEl, regimes, controlKey, settingKey, afterChangeFn) {
    if (!sliderEl) return;

    function onPointerStart() {
      if (sliderEl.disabled) return;
      startFreshSliderGesture(controlKey, settingKey, true);
      triggerTacticalPause();
      syncPlayPauseUI();
      renderCanvas();
    }

    sliderEl.addEventListener('mousedown', onPointerStart);
    sliderEl.addEventListener('touchstart', onPointerStart);

    sliderEl.addEventListener('input', function () {
      applySliderValueChange(controlKey, settingKey, sliderEl, afterChangeFn);
    });

    sliderEl.addEventListener('change', function () {
      if (sim.sliderGesture && sim.sliderGesture.controlKey === controlKey && sim.sliderGesture.pointerActive) {
        const g = sim.sliderGesture;
        if (settings[g.settingKey] === g.startVal) {
          sim.tacticalPauseRemaining = g.priorTacticalRemaining;
        }
        sim.sliderGesture = null;
        syncPlayPauseUI();
        renderCanvas();
      }
    });

    if (!knobEl) return;

    const svg = createSvgEl('svg');
    svg.setAttribute('class', 'knob-svg');
    svg.setAttribute('viewBox', '0 0 50 44');
    svg.setAttribute('width', '50');
    svg.setAttribute('height', '44');
    svg.setAttribute('focusable', 'false');

    const arcPath = createSvgEl('path');
    arcPath.setAttribute('class', 'knob-scale-arc');
    arcPath.setAttribute('d', KNOB_SCALE_ARC_PATH);
    svg.appendChild(arcPath);

    const detentGroups = [];
    const detentHits = [];
    const detentTitles = [];

    for (let d = 0; d < 4; d++) {
      const deg = KNOB_DETENT_ANGLES[d];
      const pInner = polarKnobPoint(17.1, deg);
      const pOuter = polarKnobPoint(20.1, deg);
      const pPip = polarKnobPoint(21.4, deg);

      const gDet = createSvgEl('g');
      gDet.setAttribute('class', 'knob-detent');
      gDet.setAttribute('data-detent', String(d));

      const tick = createSvgEl('line');
      tick.setAttribute('class', 'knob-detent-tick');
      tick.setAttribute('x1', pInner.x.toFixed(2));
      tick.setAttribute('y1', pInner.y.toFixed(2));
      tick.setAttribute('x2', pOuter.x.toFixed(2));
      tick.setAttribute('y2', pOuter.y.toFixed(2));
      gDet.appendChild(tick);

      const pip = createSvgEl('circle');
      pip.setAttribute('class', 'knob-detent-pip');
      pip.setAttribute('cx', pPip.x.toFixed(2));
      pip.setAttribute('cy', pPip.y.toFixed(2));
      pip.setAttribute('r', '1.7');
      gDet.appendChild(pip);

      svg.appendChild(gDet);
      detentGroups.push(gDet);
    }

    const shadow = createSvgEl('circle');
    shadow.setAttribute('class', 'knob-shadow');
    shadow.setAttribute('cx', String(KNOB_CX));
    shadow.setAttribute('cy', String(KNOB_CY + 1.2));
    shadow.setAttribute('r', '15.2');
    svg.appendChild(shadow);

    const rotor = createSvgEl('g');
    rotor.setAttribute('class', 'knob-rotor');

    const grip = createSvgEl('path');
    grip.setAttribute('class', 'knob-fluted-grip');
    grip.setAttribute('d', KNOB_FLUTED_GRIP_PATH);
    rotor.appendChild(grip);

    const cap = createSvgEl('circle');
    cap.setAttribute('class', 'knob-cap');
    cap.setAttribute('cx', String(KNOB_CX));
    cap.setAttribute('cy', String(KNOB_CY));
    cap.setAttribute('r', '11.6');
    rotor.appendChild(cap);

    const pointer = createSvgEl('line');
    pointer.setAttribute('class', 'knob-pointer');
    pointer.setAttribute('x1', String(KNOB_CX));
    pointer.setAttribute('y1', String(KNOB_CY - 3.2));
    pointer.setAttribute('x2', String(KNOB_CX));
    pointer.setAttribute('y2', String(KNOB_CY - 10.6));
    rotor.appendChild(pointer);

    const pivot = createSvgEl('circle');
    pivot.setAttribute('class', 'knob-pivot');
    pivot.setAttribute('cx', String(KNOB_CX));
    pivot.setAttribute('cy', String(KNOB_CY));
    pivot.setAttribute('r', '1.45');
    rotor.appendChild(pivot);

    svg.appendChild(rotor);

    const capHit = createSvgEl('circle');
    capHit.setAttribute('class', 'knob-cap-hit');
    capHit.setAttribute('cx', String(KNOB_CX));
    capHit.setAttribute('cy', String(KNOB_CY));
    capHit.setAttribute('r', '13.5');

    function onCapPointerStart(e) {
      if (e && e.button !== undefined && e.button !== 0) return;
      if (sliderEl.disabled) return;
      if (e && e.stopPropagation) e.stopPropagation();
      if (e && e.preventDefault) e.preventDefault();
      focusKnobInput(sliderEl);
      const pt = extractPointerCoords(e);
      startFreshSliderGesture(controlKey, settingKey, true);
      triggerTacticalPause();
      syncPlayPauseUI();
      renderCanvas();
      knobEl.classList.add('is-dragging');
      activeKnobDrag = {
        knobEl: knobEl,
        sliderEl: sliderEl,
        controlKey: controlKey,
        settingKey: settingKey,
        afterChangeFn: afterChangeFn,
        startX: pt.x,
        startY: pt.y,
        startVal: settings[settingKey],
        dragged: false
      };
    }

    capHit.addEventListener('mousedown', onCapPointerStart);
    capHit.addEventListener('touchstart', onCapPointerStart, { passive: false });
    svg.appendChild(capHit);

    for (let d = 0; d < 4; d++) {
      (function (dIdx) {
        const deg = KNOB_DETENT_ANGLES[dIdx];
        const pHit = polarKnobPoint(19.8, deg);
        const hit = createSvgEl('circle');
        hit.setAttribute('class', 'knob-detent-hit');
        hit.setAttribute('data-detent', String(dIdx));
        hit.setAttribute('cx', pHit.x.toFixed(2));
        hit.setAttribute('cy', pHit.y.toFixed(2));
        hit.setAttribute('r', '5.5');

        const titleEl = createSvgEl('title');
        titleEl.textContent = regimes[dIdx].label;
        hit.appendChild(titleEl);

        hit.addEventListener('mouseenter', function () {
          if (sliderEl.disabled) return;
          detentGroups[dIdx].classList.add('is-hovered');
        });
        hit.addEventListener('mouseleave', function () {
          detentGroups[dIdx].classList.remove('is-hovered');
        });

        function onDetentPointerStart(e) {
          if (e && e.button !== undefined && e.button !== 0) return;
          if (sliderEl.disabled) return;
          if (e && e.stopPropagation) e.stopPropagation();
          if (e && e.preventDefault) e.preventDefault();
          if (activeKnobDrag) {
            activeKnobDrag.knobEl.classList.remove('is-dragging');
            activeKnobDrag = null;
          }
          focusKnobInput(sliderEl);
          startFreshSliderGesture(controlKey, settingKey, true);
          triggerTacticalPause();
          syncPlayPauseUI();
          if (dIdx !== settings[settingKey]) {
            sliderEl.value = String(dIdx);
            applySliderValueChange(controlKey, settingKey, sliderEl, afterChangeFn);
          } else {
            syncAllKnobsUI();
            renderCanvas();
          }
        }

        hit.addEventListener('mousedown', onDetentPointerStart);
        hit.addEventListener('touchstart', onDetentPointerStart, { passive: false });
        svg.appendChild(hit);
        detentHits.push(hit);
        detentTitles.push(titleEl);
      })(d);
    }

    knobEl.appendChild(svg);
    knobEl._capHit = capHit;
    knobEl._detentHits = detentHits;
    knobEl._detentGroups = detentGroups;
    knobEl._rotor = rotor;

    rotaryKnobEntries.push({
      knobEl: knobEl,
      sliderEl: sliderEl,
      regimes: regimes,
      detentGroups: detentGroups,
      detentTitles: detentTitles
    });
  }

  bindSliderGesture(demandSlider, demandKnobEl, DEMAND_REGIMES, 'demand', 'demandIdx');
  bindSliderGesture(wipSlider, wipKnobEl, WIP_REGIMES, 'wip', 'wipIdx');
  bindSliderGesture(driftSlider, driftKnobEl, DRIFT_REGIMES, 'drift', 'driftIdx');
  bindSliderGesture(shockSlider, shockKnobEl, SHOCK_REGIMES, 'shock', 'shockIdx', function () {
    sim.shockTimer = 0;
    scheduleNextShockInterval();
  });

  function fireManualShock() {
    if (settings.chapter < 7) return;
    const prev = captureMetricsSnapshot();
    sim.shockTimer = 0;
    triggerWorldShock();
    if (getEffectiveShockIdx() > 0) {
      scheduleNextShockInterval();
    }
    updateReadouts();
    recordControlImpact('manualShock', prev, true);
    renderCanvas();
  }

  triggerShockBtn.addEventListener('click', fireManualShock);
  topShockBtn.addEventListener('click', fireManualShock);

  bindSliderGesture(discoverySlider, discoveryKnobEl, DISCOVERY_REGIMES, 'discovery', 'discoveryIdx', refreshActiveDiscoverySpec);
  bindSliderGesture(buildSlider, buildKnobEl, BUILD_REGIMES, 'build', 'buildIdx', refreshActiveBuildOutput);

  build10xToggle.addEventListener('change', function () {
    if (build10xToggle.disabled) return;
    const prev = captureMetricsSnapshot();
    settings.build10x = build10xToggle.checked;
    build10xBoxEl.classList.toggle('active-boost', settings.build10x);
    triggerTacticalPause();
    syncPlayPauseUI();
    updateReadouts();
    recordControlImpact('build10x', prev, true);
    renderCanvas();
    syncUrlFromState();
  });

  bindSliderGesture(discoveryNoiseSlider, discoveryNoiseKnobEl, NOISE_REGIMES, 'discoveryNoise', 'discoveryNoiseIdx', refreshActiveDiscoverySpec);
  bindSliderGesture(buildNoiseSlider, buildNoiseKnobEl, NOISE_REGIMES, 'buildNoise', 'buildNoiseIdx', refreshActiveBuildOutput);

  discoveryDampenerToggle.addEventListener('change', function () {
    if (discoveryDampenerToggle.disabled) return;
    const prev = captureMetricsSnapshot();
    settings.discoveryDampener = discoveryDampenerToggle.checked;
    discoveryDampenerBoxEl.classList.toggle('active', settings.discoveryDampener);
    refreshActiveDiscoverySpec();
    triggerTacticalPause();
    syncPlayPauseUI();
    updateReadouts();
    recordControlImpact('discoveryDampener', prev, true);
    renderCanvas();
    syncUrlFromState();
  });

  buildDampenerToggle.addEventListener('change', function () {
    if (buildDampenerToggle.disabled) return;
    const prev = captureMetricsSnapshot();
    settings.buildDampener = buildDampenerToggle.checked;
    buildDampenerBoxEl.classList.toggle('active', settings.buildDampener);
    refreshActiveBuildOutput();
    triggerTacticalPause();
    syncPlayPauseUI();
    updateReadouts();
    recordControlImpact('buildDampener', prev, true);
    renderCanvas();
    syncUrlFromState();
  });

  bindSliderGesture(testingSlider, testingKnobEl, TESTING_REGIMES, 'testing', 'testingIdx', function () {
    if (getEffectiveTestingIdx() === 0) {
      flushTestingStationIfOff();
    }
  });
  bindSliderGesture(reachSlider, reachKnobEl, REACH_REGIMES, 'reach', 'reachIdx', refreshActiveRolloutPackaging);
  bindSliderGesture(messagingNoiseSlider, messagingNoiseKnobEl, MESSAGING_NOISE_REGIMES, 'messagingNoise', 'messagingNoiseIdx', refreshActiveRolloutPackaging);

  rolloutDampenerToggle.addEventListener('change', function () {
    if (rolloutDampenerToggle.disabled) return;
    const prev = captureMetricsSnapshot();
    settings.rolloutDampener = rolloutDampenerToggle.checked;
    rolloutDampenerBoxEl.classList.toggle('active', settings.rolloutDampener);
    refreshActiveRolloutPackaging();
    triggerTacticalPause();
    syncPlayPauseUI();
    updateReadouts();
    recordControlImpact('rolloutDampener', prev, true);
    renderCanvas();
    syncUrlFromState();
  });

  diagnosticChannelToggle.addEventListener('change', function () {
    if (diagnosticChannelToggle.disabled) return;
    const prev = captureMetricsSnapshot();
    settings.diagnosticChannel = diagnosticChannelToggle.checked;
    diagnosticChannelBoxEl.classList.toggle('active', settings.diagnosticChannel);
    triggerTacticalPause();
    syncPlayPauseUI();
    updateReadouts();
    recordControlImpact('diagnostic', prev, true);
    renderCanvas();
    syncUrlFromState();
  });

  andonCordToggle.addEventListener('change', function () {
    if (andonCordToggle.disabled) return;
    const prev = captureMetricsSnapshot();
    settings.andonCord = andonCordToggle.checked;
    andonCordBoxEl.classList.toggle('active', settings.andonCord);
    triggerTacticalPause();
    syncPlayPauseUI();
    const hasPreShock = hasPreShockItemsInFlight();
    const hasPostShockJam = isPostShockJamActive();
    if (settings.andonCord && (hasPreShock || hasPostShockJam)) {
      flushPipelineWithAndon(hasPreShock ? 'preshock' : 'jam');
      updateReadouts();
      recordControlImpact('andon', prev, true);
      renderCanvas();
      syncUrlFromState();
      return;
    }
    updateReadouts();
    recordControlImpact('andon', prev, true);
    renderCanvas();
    syncUrlFromState();
  });

  playPauseBtn.addEventListener('click', function () {
    if (isTacticallyPaused()) {
      if (activeKnobDrag) {
        activeKnobDrag.knobEl.classList.remove('is-dragging');
        activeKnobDrag = null;
      }
      if (sim.sliderGesture) sim.sliderGesture.pointerActive = false;
      clearTacticalPause();
      syncPlayPauseUI();
      renderCanvas();
      return;
    }
    sim.running = !sim.running;
    if (!sim.running) clearTacticalPause();
    syncPlayPauseUI();
    renderCanvas();
    syncUrlFromState();
  });

  resetBtn.addEventListener('click', function () {
    resetSimulation();
  });

  function applySpeedMultiplier(mult) {
    const valid = mult === 0.5 || mult === 2 ? mult : 1;
    sim.speedMultiplier = valid;
    document.querySelectorAll('.speed-btn').forEach(function (b) {
      b.classList.toggle('active', Number(b.getAttribute('data-speed')) === valid);
    });
  }

  document.querySelectorAll('.speed-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applySpeedMultiplier(Number(btn.getAttribute('data-speed')));
      syncUrlFromState();
    });
  });

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function () {
      syncUrlFromState();
      const shareUrl = buildFullShareUrl();
      copyLinkBtn._lastCopiedUrl = shareUrl;
      U.copyTextToClipboard(shareUrl);
      const ui = UI_COPY[isCyberneticsView() ? 'cybernetics' : 'product'];
      copyLinkBtn.classList.add('is-copied');
      copyLinkBtn.textContent = ui.copyLinkCopied;
      if (copyFeedbackTimer) clearTimeout(copyFeedbackTimer);
      copyFeedbackTimer = setTimeout(function () {
        copyFeedbackTimer = null;
        copyLinkBtn.classList.remove('is-copied');
        const curUi = UI_COPY[isCyberneticsView() ? 'cybernetics' : 'product'];
        copyLinkBtn.textContent = curUi.copyLinkLabel;
      }, 1500);
      if (copyFeedbackTimer && typeof copyFeedbackTimer.unref === 'function') {
        copyFeedbackTimer.unref();
      }
    });
  }

  window.addEventListener('resize', setupCanvasResolution);

  productViewBtn.addEventListener('click', function () {
    setViewMode('product');
  });

  cyberneticsViewBtn.addEventListener('click', function () {
    setViewMode('cybernetics');
  });

  try {
    if (window.localStorage) {
      const savedMode = window.localStorage.getItem('bq_view_mode');
      if (savedMode === 'cybernetics' || savedMode === 'product') {
        settings.viewMode = savedMode;
      } else if (window.localStorage.getItem('bq_cybernetics_lens_open') === '1') {
        settings.viewMode = 'cybernetics';
      }
      if (window.localStorage.getItem('bq_hints_collapsed') === '1') {
        hintsCollapsed = true;
      }
    }
  } catch (_) {
    // Ignore storage restrictions on file://
  }

  function applyPreset(chNum, presetIdx) {
    const prevReady = urlSyncReady;
    urlSyncReady = false;
    if (settings.chapter !== chNum) {
      applyChapter(chNum);
    }
    const ch = CHAPTERS[chNum];
    if (!ch || !ch.presets[presetIdx]) {
      urlSyncReady = prevReady;
      syncUrlFromState();
      return;
    }
    const preset = ch.presets[presetIdx];
    Object.keys(preset.values).forEach(function (k) {
      settings[k] = preset.values[k];
    });
    syncControlsFromSettings();
    resetSimulation();
    urlSyncReady = prevReady;
    syncUrlFromState();
  }

  function applyUrlQuery(rawSearch) {
    const parsed = U.parseShareQueryString(rawSearch);
    if (!parsed.hasRecognizedParams) {
      const prevReadyDefault = urlSyncReady;
      urlSyncReady = false;
      applySpeedMultiplier(1);
      sim.running = true;
      applyChapter(1);
      urlSyncReady = prevReadyDefault;
      return false;
    }

    const prevReady = urlSyncReady;
    urlSyncReady = false;

    settings.viewMode = parsed.view === 'cybernetics' ? 'cybernetics' : 'product';
    applyChapter(parsed.chapter);

    const targetValues = {};
    const chObj = CHAPTERS[parsed.chapter];
    if (parsed.presetIdx !== null && chObj && chObj.presets[parsed.presetIdx]) {
      const pVals = chObj.presets[parsed.presetIdx].values;
      Object.keys(pVals).forEach(function (k) {
        targetValues[k] = pVals[k];
      });
    }
    Object.keys(parsed.overrides).forEach(function (k) {
      targetValues[k] = parsed.overrides[k];
    });

    let zones = [];
    if (Object.keys(targetValues).length > 0) {
      zones = applyPresetValuesAndGetZones(targetValues);
    }

    applySpeedMultiplier(parsed.speed !== null ? parsed.speed : 1);
    storyCollapsed = parsed.storyCollapsed !== null ? parsed.storyCollapsed : false;
    hintsCollapsed = parsed.hintsCollapsed !== null ? parsed.hintsCollapsed : false;
    sim.running = parsed.paused !== null ? !parsed.paused : true;

    syncViewModeUI();
    syncControlsFromSettings();
    resetSimulation();

    if (settings.chapter >= 2 && Object.keys(targetValues).length > 0) {
      let matchedPreset = null;
      for (let i = 0; i < chObj.presets.length; i++) {
        if (doesPresetMatchSettings(chObj.presets[i])) {
          matchedPreset = chObj.presets[i];
          break;
        }
      }
      sim.lastSpotlightZones = zones.slice();
      sim.activeSpotlight = {
        controlKey: 'preset',
        zones: zones,
        elapsed: 0,
        duration: SPOTLIGHT_TOTAL_SEC
      };
      if (matchedPreset) {
        sim.lastImpact = {
          kind: 'preset',
          presetLabel: matchedPreset.label,
          cyberneticsLabel: matchedPreset.cyberneticsLabel || matchedPreset.label
        };
      } else {
        sim.lastImpact = {
          kind: 'preset',
          customUrl: true,
          presetLabel: '',
          cyberneticsLabel: ''
        };
      }
      renderImpactBar();
      renderCanvas();
    }

    urlSyncReady = prevReady;
    lastSyncedQuery = null;
    syncUrlFromState();
    return true;
  }

  window.CyberneticSim = {
    applyChapter: applyChapter,
    applyPreset: applyPreset,
    applyUrlQuery: applyUrlQuery,
    getShareQuery: getShareQueryString,
    getShareUrl: buildFullShareUrl,
    setViewMode: setViewMode,
    getChapters: function () {
      return CHAPTERS;
    },
    step: function (dt) {
      const prevQueued = getTotalQueueCount();
      stepSimulation(dt);
      if (!sim.hoverControlKey && !sim.hoverImpactBar) {
        advanceSpotlightTimer(dt);
      }
      if (getEffectiveWipIdx() > 0 || getTotalQueueCount() > 0 || prevQueued > 0) {
        updateReadouts();
      }
      renderCanvas();
    },
    tickFrame: function (rawDt) {
      advanceFrame(rawDt);
    },
    getState: function () {
      return {
        maxBuiltChapter: MAX_BUILT_CHAPTER,
        running: sim.running,
        tacticallyPaused: isTacticallyPaused(),
        tacticalPauseRemaining: sim.tacticalPauseRemaining,
        clockSec: sim.clockSec,
        settings: Object.assign({}, settings),
        effective: {
          demandIdx: getEffectiveDemandIdx(),
          wipIdx: getEffectiveWipIdx(),
          shockIdx: getEffectiveShockIdx(),
          discoverySec: getEffectiveDiscoverySec(),
          buildSec: getEffectiveBuildSec(),
          discoveryNoise: getEffectiveDiscoveryNoise(),
          buildNoise: getEffectiveBuildNoise(),
          buildConcurrency: getEffectiveBuildConcurrency(),
          testingIdx: getEffectiveTestingIdx(),
          reachScale: getEffectiveReachScale(),
          reachFactor: getEffectiveReachFactor(),
          rolloutSec: M.getEffectiveRolloutSec(),
          messagingNoise: getEffectiveMessagingNoise(),
          diagnosticActive: isDiagnosticActive(),
          andonActive: isAndonActive()
        },
        shockCount: sim.shockCount,
        totalFlushedByAndon: sim.totalFlushedByAndon,
        inFlightCount: getTotalInFlightCount(),
        queueCount: getTotalQueueCount(),
        queues: {
          discovery: sim.stations.discovery.queue.length,
          build: sim.stations.build.queue.length,
          testing: sim.stations.testing.queue.length,
          rollout: sim.stations.rollout.queue.length
        },
        transits: sim.transits.map(function (t) {
          return {
            kind: t.kind,
            fromAnchor: t.fromAnchor,
            fromX: resolveTransitStartX(t.fromAnchor),
            elapsed: t.elapsed,
            duration: t.duration,
            hasWrench: Boolean(t.item && t.item.hasWrench)
          };
        }),
        item: getPrimaryItemForInspection(),
        history: sim.history.slice(),
        pendingPolicyBreak: sim.pendingPolicyBreak,
        spotlightZones: (function () {
          const sp = getActiveSpotlightSpec();
          return sp ? sp.zones.slice() : [];
        })(),
        spotlightZoneTones: (function () {
          const sp = getActiveSpotlightSpec();
          return sp && sp.zoneTones ? Object.assign({}, sp.zoneTones) : {};
        })(),
        spotlightAlpha: (function () {
          const sp = getActiveSpotlightSpec();
          return sp ? sp.alpha : 0;
        })(),
        lastImpact: sim.lastImpact ? Object.assign({}, sim.lastImpact) : null
      };
    },
    triggerWorldShock: triggerWorldShock,
    warpShape: warpShape,
    computeOverlapFit: computeOverlapFit
  };

  // ---------------------------------------------------------------------------
  // 3. Boot
  // ---------------------------------------------------------------------------
  M.setOnMetricsChanged(function () {
    renderHistoryStrip();
    updateReadouts();
  });
  setupCanvasResolution();
  const initialSearch = U.getLocationSearch();
  urlSyncReady = false;
  if (!applyUrlQuery(initialSearch)) {
    lastSyncedQuery = getShareQueryString();
  }
  urlSyncReady = true;
  if (U.parseShareQueryString(initialSearch).hasRecognizedParams) {
    syncUrlFromState();
  }

  function advanceFrame(rawDt) {
    const tacticallyPaused = advanceTacticalPause(rawDt);
    syncPlayPauseUI();
    if (sim.running && !tacticallyPaused) {
      const prevQueued = getTotalQueueCount();
      stepSimulation(rawDt * sim.speedMultiplier);
      clockValueEl.textContent = formatSimDays(sim.clockSec);
      if (getEffectiveWipIdx() > 0 || getTotalQueueCount() > 0 || prevQueued > 0) {
        updateReadouts();
      }
      if (!sim.hoverControlKey && !sim.hoverImpactBar) {
        advanceSpotlightTimer(rawDt);
      }
    }
    renderCanvas();
  }

  let lastFrameMs = performance.now();
  function tick(nowMs) {
    const rawDt = Math.min(0.05, Math.max(0, (nowMs - lastFrameMs) / 1000));
    lastFrameMs = nowMs;
    advanceFrame(rawDt);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
