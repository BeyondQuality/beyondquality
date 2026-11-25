// Product Work as a Cybernetic System: Pure <canvas> Diagram Renderer

(function () {
  'use strict';

  const C = window.CyberneticContent;
  const M = window.CyberneticModel;

  const NOISE_REGIMES = C.NOISE_REGIMES;
  const TESTING_REGIMES = C.TESTING_REGIMES;
  const MESSAGING_NOISE_REGIMES = C.MESSAGING_NOISE_REGIMES;
  const MAX_REWORK_PASSES = C.MAX_REWORK_PASSES;
  const OUTER_RETURN_SEC = C.OUTER_RETURN_SEC;
  const CANVAS_COPY = C.CANVAS_COPY;

  const N_ANGLES = M.N_ANGLES;
  const ANGLES = M.ANGLES;
  const maxPolarRadius = M.maxPolarRadius;
  const smoothstep = M.smoothstep;

  const settings = M.settings;
  const sim = M.sim;

  const isCyberneticsView = M.isCyberneticsView;
  const isAndonActive = M.isAndonActive;
  const isOuterRoutingActive = M.isOuterRoutingActive;
  const isDiagnosticActive = M.isDiagnosticActive;
  const getEffectiveDiscoverySec = M.getEffectiveDiscoverySec;
  const getEffectiveBuildSec = M.getEffectiveBuildSec;
  const getEffectiveBuildConcurrency = M.getEffectiveBuildConcurrency;
  const isOversizedBuildBatch = M.isOversizedBuildBatch;
  const getEffectiveDiscoveryNoise = M.getEffectiveDiscoveryNoise;
  const getEffectiveBuildNoise = M.getEffectiveBuildNoise;
  const getEffectiveTestingIdx = M.getEffectiveTestingIdx;
  const isRolloutActive = M.isRolloutActive;
  const isSilentRollout = M.isSilentRollout;
  const getEffectiveRolloutSec = M.getEffectiveRolloutSec;
  const getEffectiveReachScale = M.getEffectiveReachScale;
  const getEffectiveReachFactor = M.getEffectiveReachFactor;
  const getEffectiveMessagingNoise = M.getEffectiveMessagingNoise;
  const seededRandom = M.seededRandom;
  const warpShape = M.warpShape;
  const getWipGateState = M.getWipGateState;
  const getActiveSpotlightSpec = M.getActiveSpotlightSpec;
  const formatCompactSimDays = M.formatCompactSimDays;

  let enableEmptyStationPreview = true;

  // ---------------------------------------------------------------------------
  // 1. Canvas Drawing Helpers & Scene Rendering
  // ---------------------------------------------------------------------------
  const W = 1140;
  const H = 386;

  const WORLD_LEFT_BOX = { x: 10, y: 26, w: 178, h: 236, cx: 99, cy: 148, rScale: 50 };
  const WORLD_RIGHT_BOX = { x: 952, y: 26, w: 178, h: 236, cx: 1041, cy: 148, rScale: 50 };

  function makeStationBox(x) {
    return { x: x, y: 66, w: 126, h: 148, cx: x + 63, cy: 148, rScale: 29 };
  }

  const BOX = {
    worldLeft: WORLD_LEFT_BOX,
    discovery: makeStationBox(248),
    build: makeStationBox(436),
    testing: makeStationBox(600),
    rollout: makeStationBox(764),
    worldRight: WORLD_RIGHT_BOX
  };

  const INNER_LOOP_Y = 252;
  const OUTER_LOOP_Y = 332;

  function getSceneLayout() {
    const ch = settings.chapter;
    let discovery;
    let build;
    let testing = null;
    let rollout = null;
    let height;

    if (ch <= 2) {
      height = 276;
      discovery = makeStationBox(358);
      build = makeStationBox(656);
    } else if (ch <= 4) {
      height = 314;
      discovery = makeStationBox(284);
      build = makeStationBox(507);
      testing = makeStationBox(730);
    } else {
      height = ch >= 6 ? 386 : 314;
      discovery = BOX.discovery;
      build = BOX.build;
      testing = BOX.testing;
      rollout = BOX.rollout;
    }

    return {
      height: height,
      boxes: {
        worldLeft: WORLD_LEFT_BOX,
        discovery: discovery,
        build: build,
        testing: testing,
        rollout: rollout,
        worldRight: WORLD_RIGHT_BOX
      },
      buildOuterExitX: build.x + 36,
      buildInnerExitX: build.x + 90,
      innerLoopY: INNER_LOOP_Y,
      outerLoopY: OUTER_LOOP_Y
    };
  }

  function resolveTransitStartX(fromAnchor) {
    const b = getSceneLayout().boxes;
    if (fromAnchor === 'build_exit') return b.build.x + b.build.w + 6;
    if (fromAnchor === 'build_exit_users') return b.build.x + b.build.w + 16;
    if (fromAnchor === 'testing_entry') return b.testing ? b.testing.x : b.build.x + b.build.w + 6;
    if (fromAnchor === 'testing_exit') return (b.testing ? b.testing.x + b.testing.w : b.build.x + b.build.w) + 6;
    if (fromAnchor === 'testing_exit_users') return (b.testing ? b.testing.x + b.testing.w : b.build.x + b.build.w) + 14;
    return undefined;
  }

  const canvas = document.getElementById('simCanvas');
  const ctx = canvas.getContext('2d');
  let currentLogicalHeight = 0;

  function syncCanvasDimensions(targetH) {
    const dpr = window.devicePixelRatio || 1;
    const targetW = W * dpr;
    const targetPxH = targetH * dpr;
    if (canvas.width !== targetW || canvas.height !== targetPxH || currentLogicalHeight !== targetH) {
      currentLogicalHeight = targetH;
      canvas.width = targetW;
      canvas.height = targetPxH;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function setupCanvasResolution() {
    currentLogicalHeight = 0;
    renderCanvas();
  }

  function fitPairScale(baseScale, maxRadiusPx, radiiA, radiiB) {
    const peak = Math.max(maxPolarRadius(radiiA), radiiB ? maxPolarRadius(radiiB) : 0);
    if (peak * baseScale <= maxRadiusPx) return baseScale;
    return maxRadiusPx / peak;
  }

  function clipStationWorkBay(ctx2d, box, topPad, bottomPad) {
    drawRoundedRect(
      ctx2d,
      box.x + 3,
      box.y + topPad,
      box.w - 6,
      box.h - topPad - bottomPad,
      4
    );
    ctx2d.clip();
  }

  function tracePolarPath(ctx2d, cx, cy, radii, scale) {
    ctx2d.beginPath();
    for (let k = 0; k < N_ANGLES; k++) {
      const r = radii[k] * scale;
      const x = cx + r * Math.cos(ANGLES[k]);
      const y = cy + r * Math.sin(ANGLES[k]);
      if (k === 0) ctx2d.moveTo(x, y);
      else ctx2d.lineTo(x, y);
    }
    ctx2d.closePath();
  }

  function drawPolarShape(ctx2d, cx, cy, radii, scale, opts) {
    ctx2d.save();
    tracePolarPath(ctx2d, cx, cy, radii, scale);
    if (opts.fill) {
      ctx2d.fillStyle = opts.fill;
      ctx2d.fill();
    }
    if (opts.stroke) {
      ctx2d.strokeStyle = opts.stroke;
      ctx2d.lineWidth = opts.lineWidth || 2;
      if (opts.dash) ctx2d.setLineDash(opts.dash);
      ctx2d.stroke();
    }
    ctx2d.restore();
  }

  function drawOutcomeOverlay(ctx2d, cx, cy, worldRadii, landing, scale, cc) {
    const builtRadii = landing.builtRadii;
    const specRadii = landing.specRadii;
    const rMult = landing.reachScale === undefined ? 1.0 : landing.reachScale;
    const lblFac = landing.labelFactor === undefined ? 1.0 : landing.labelFactor;
    const shippedLabel = landing.shippedLabel;
    const labelStatus = landing.labelStatus;
    const missCause = landing.missCause;
    const showSpec = Boolean(
      specRadii && (missCause === 'stale' || missCause === 'spec' || missCause === 'build')
    );
    const peakCombined = Math.max(
      maxPolarRadius(worldRadii),
      maxPolarRadius(builtRadii) * rMult,
      showSpec ? maxPolarRadius(specRadii) * rMult : 0
    );
    const effScale = peakCombined * scale > 76 ? 76 / peakCombined : scale;
    const sBuilt = effScale * rMult;
    const inter = new Float64Array(N_ANGLES);
    for (let k = 0; k < N_ANGLES; k++) {
      inter[k] = Math.min(worldRadii[k] * effScale, builtRadii[k] * sBuilt);
    }

    ctx2d.save();
    tracePolarPath(ctx2d, cx, cy, worldRadii, effScale);
    ctx2d.fillStyle = 'rgba(239, 68, 68, 0.24)';
    ctx2d.fill();

    tracePolarPath(ctx2d, cx, cy, builtRadii, sBuilt);
    ctx2d.fillStyle = 'rgba(239, 68, 68, 0.36)';
    ctx2d.fill();

    tracePolarPath(ctx2d, cx, cy, inter, 1.0);
    if (lblFac >= 0.85) {
      ctx2d.fillStyle = 'rgba(16, 185, 129, 0.84)';
    } else if (lblFac >= 0.55) {
      ctx2d.fillStyle = 'rgba(245, 158, 11, 0.72)';
    } else {
      ctx2d.fillStyle = 'rgba(239, 68, 68, 0.55)';
    }
    ctx2d.fill();

    ctx2d.setLineDash([]);
    tracePolarPath(ctx2d, cx, cy, worldRadii, effScale);
    ctx2d.strokeStyle = '#1d4ed8';
    ctx2d.lineWidth = 2.2;
    ctx2d.stroke();

    ctx2d.setLineDash([]);
    tracePolarPath(ctx2d, cx, cy, builtRadii, sBuilt);
    ctx2d.strokeStyle = '#0f172a';
    ctx2d.lineWidth = 2;
    ctx2d.stroke();

    if (showSpec) {
      ctx2d.save();
      ctx2d.setLineDash([5, 3]);
      tracePolarPath(ctx2d, cx, cy, specRadii, sBuilt);
      ctx2d.strokeStyle = '#2563eb';
      ctx2d.lineWidth = 1.8;
      ctx2d.stroke();
      ctx2d.restore();
    }

    if (missCause === 'silent' || missCause === 'label') {
      const tagText = missCause === 'silent' ? 'Unlabelled "???"' : 'Label: "' + shippedLabel + '"!';
      ctx2d.font = '700 9.5px ui-monospace, monospace';
      const tw = ctx2d.measureText(tagText).width + 12;
      const silentExtent = Math.min(34, maxPolarRadius(builtRadii) * sBuilt);
      const pillCy = missCause === 'silent' ? Math.min(cy + 62, cy + silentExtent + 15) : cy;
      drawRoundedRect(ctx2d, cx - tw / 2, pillCy - 10, tw, 20, 4);
      ctx2d.fillStyle = missCause === 'silent' ? '#475569' : '#b91c1c';
      ctx2d.fill();
      ctx2d.strokeStyle = '#ffffff';
      ctx2d.lineWidth = 1.2;
      ctx2d.stroke();
      ctx2d.fillStyle = '#ffffff';
      ctx2d.textAlign = 'center';
      ctx2d.fillText(tagText, cx, pillCy + 3.5);
    } else if (
      cc &&
      (missCause === 'stale' || missCause === 'spec' || missCause === 'build' || missCause === 'reach')
    ) {
      const causeText =
        missCause === 'stale'
          ? cc.landingCauseStale
          : missCause === 'spec'
            ? cc.landingCauseSpec
            : missCause === 'build'
              ? cc.landingCauseBuild
              : cc.landingCauseReach;
      ctx2d.font = '700 9px ui-monospace, monospace';
      const tw = Math.min(168, ctx2d.measureText(causeText).width + 12);
      const pillCy = cy + 68;
      drawRoundedRect(ctx2d, cx - tw / 2, pillCy - 9, tw, 18, 4);
      ctx2d.fillStyle = landing.fitPct < 52 ? '#b91c1c' : '#b45309';
      ctx2d.fill();
      ctx2d.strokeStyle = '#ffffff';
      ctx2d.lineWidth = 1.2;
      ctx2d.stroke();
      ctx2d.fillStyle = '#ffffff';
      ctx2d.textAlign = 'center';
      ctx2d.fillText(causeText, cx, pillCy + 3.2);
    }

    ctx2d.restore();
  }

  function drawRoundedRect(ctx2d, x, y, w, h, r) {
    ctx2d.beginPath();
    ctx2d.moveTo(x + r, y);
    ctx2d.lineTo(x + w - r, y);
    ctx2d.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx2d.lineTo(x + w, y + h - r);
    ctx2d.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx2d.lineTo(x + r, y + h);
    ctx2d.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx2d.lineTo(x, y + r);
    ctx2d.quadraticCurveTo(x, y, x + r, y);
    ctx2d.closePath();
  }

  function drawArrowHead(ctx2d, tipX, tipY, angle, size, colour) {
    ctx2d.save();
    ctx2d.translate(tipX, tipY);
    ctx2d.rotate(angle);
    ctx2d.beginPath();
    ctx2d.moveTo(0, 0);
    ctx2d.lineTo(-size, -size * 0.58);
    ctx2d.lineTo(-size, size * 0.58);
    ctx2d.closePath();
    ctx2d.fillStyle = colour;
    ctx2d.fill();
    ctx2d.restore();
  }

  function drawWrenchBadge(ctx2d, cx, cy) {
    ctx2d.save();
    ctx2d.translate(cx, cy);
    ctx2d.beginPath();
    ctx2d.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx2d.fillStyle = '#f59e0b';
    ctx2d.fill();
    ctx2d.strokeStyle = '#ffffff';
    ctx2d.lineWidth = 1.6;
    ctx2d.stroke();

    ctx2d.rotate(-Math.PI / 4);
    ctx2d.strokeStyle = '#ffffff';
    ctx2d.lineWidth = 2.1;
    ctx2d.lineCap = 'round';
    ctx2d.beginPath();
    ctx2d.moveTo(-4.5, 0);
    ctx2d.lineTo(2.2, 0);
    ctx2d.stroke();

    ctx2d.beginPath();
    ctx2d.arc(4.0, 0, 2.5, 0.65, Math.PI * 2 - 0.65);
    ctx2d.stroke();
    ctx2d.restore();
  }

  function drawPassedBadge(ctx2d, cx, cy) {
    ctx2d.save();
    ctx2d.translate(cx, cy);
    ctx2d.beginPath();
    ctx2d.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx2d.fillStyle = '#10b981';
    ctx2d.fill();
    ctx2d.strokeStyle = '#ffffff';
    ctx2d.lineWidth = 1.5;
    ctx2d.stroke();

    ctx2d.strokeStyle = '#ffffff';
    ctx2d.lineWidth = 1.9;
    ctx2d.lineCap = 'round';
    ctx2d.lineJoin = 'round';
    ctx2d.beginPath();
    ctx2d.moveTo(-3.5, 0.2);
    ctx2d.lineTo(-0.8, 2.9);
    ctx2d.lineTo(3.8, -2.5);
    ctx2d.stroke();
    ctx2d.restore();
  }

  // Red "?" badge for blind 1-bit guessing on the Outer Loop
  function drawQuestionBadge(ctx2d, cx, cy) {
    ctx2d.save();
    ctx2d.translate(cx, cy);
    ctx2d.beginPath();
    ctx2d.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx2d.fillStyle = '#ef4444';
    ctx2d.fill();
    ctx2d.strokeStyle = '#ffffff';
    ctx2d.lineWidth = 1.6;
    ctx2d.stroke();

    ctx2d.font = '800 11px Inter, sans-serif';
    ctx2d.fillStyle = '#ffffff';
    ctx2d.textAlign = 'center';
    ctx2d.fillText('?', 0, 4);
    ctx2d.restore();
  }

  // Green target badge when Diagnostic Channel isolates the true root stage
  function drawDiagnosedBadge(ctx2d, cx, cy) {
    ctx2d.save();
    ctx2d.translate(cx, cy);
    ctx2d.beginPath();
    ctx2d.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx2d.fillStyle = '#10b981';
    ctx2d.fill();
    ctx2d.strokeStyle = '#ffffff';
    ctx2d.lineWidth = 1.6;
    ctx2d.stroke();

    ctx2d.beginPath();
    ctx2d.arc(0, 0, 3.8, 0, Math.PI * 2);
    ctx2d.strokeStyle = '#ffffff';
    ctx2d.lineWidth = 1.6;
    ctx2d.stroke();
    ctx2d.restore();
  }

  function getWipGateBox(layout) {
    const ds = layout.boxes.discovery;
    const isCh4Layout = ds.x >= 280;
    const w = isCh4Layout ? 58 : 50;
    const x = isCh4Layout ? ds.x - w - 8 : 193;
    return { x: x, y: 24, w: w, h: 36, cx: x + w / 2, cy: 42 };
  }

  function drawWipGateAndRail(layout, cc) {
    if (settings.chapter < 4) return;
    const b = layout.boxes;
    const gate = getWipGateBox(layout);
    const st = getWipGateState();
    const activeBoxes = [b.discovery, b.build];
    if (b.testing && getEffectiveTestingIdx() > 0) activeBoxes.push(b.testing);
    if (b.rollout && isRolloutActive()) activeBoxes.push(b.rollout);

    const holding = st.holdingAtGate && st.wipIdx <= 1;
    const overloaded = st.queued >= 4;
    const railCol = overloaded ? '#fca5a5' : (holding ? '#34d399' : '#cbd5e1');

    ctx.save();
    ctx.strokeStyle = railCol;
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 2]);
    let prevRight = gate.x + gate.w;
    for (let i = 0; i < activeBoxes.length; i++) {
      const nextBox = activeBoxes[i];
      ctx.beginPath();
      ctx.moveTo(prevRight + 1, gate.cy);
      ctx.lineTo(nextBox.x - 1, gate.cy);
      ctx.stroke();
      prevRight = nextBox.x + nextBox.w;
    }

    ctx.beginPath();
    ctx.moveTo(gate.cx, gate.y + gate.h);
    ctx.lineTo(gate.cx, 108);
    ctx.stroke();
    ctx.setLineDash([]);

    if (holding) {
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gate.cx - 5, 108);
      ctx.lineTo(gate.cx + 5, 108);
      ctx.stroke();
    }

    drawRoundedRect(ctx, gate.x, gate.y, gate.w, gate.h, 6);
    ctx.fillStyle = overloaded ? '#fef2f2' : (holding ? '#ecfdf5' : '#f8fafc');
    ctx.fill();
    ctx.strokeStyle = overloaded
      ? '#ef4444'
      : (holding ? '#059669' : (st.wipIdx <= 1 ? '#3b82f6' : '#cbd5e1'));
    ctx.lineWidth = overloaded || holding ? 1.6 : 1.2;
    ctx.stroke();

    const gateLabel = st.isUncapped ? cc.wipGateUncapped : cc.wipGateCapped;
    ctx.textAlign = 'center';
    ctx.font = '700 ' + (gateLabel.length > 7 ? '7.5px' : '8px') + ' Inter, sans-serif';
    ctx.fillStyle = overloaded
      ? '#b91c1c'
      : (holding ? '#047857' : (st.wipIdx <= 1 ? '#1d4ed8' : '#64748b'));
    ctx.fillText(gateLabel, gate.cx, gate.y + 13);

    const countText = st.isUncapped
      ? st.inFlight + '/\u221e'
      : st.inFlight + '/' + st.maxWip;
    ctx.font = '700 9.5px ui-monospace, monospace';
    ctx.fillStyle = overloaded ? '#b91c1c' : (holding ? '#047857' : '#0f172a');
    ctx.fillText(countText, gate.cx, gate.y + 27);
    ctx.restore();
  }

  function drawQueueTray(box, queueItems) {
    if (settings.chapter < 4) return;
    const trayY = 24;
    const trayH = 36;
    const qLen = queueItems.length;
    const crowded = qLen >= 3;

    ctx.save();
    drawRoundedRect(ctx, box.x, trayY, box.w, trayH, 6);
    ctx.fillStyle = crowded ? '#fef2f2' : '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = crowded ? '#ef4444' : '#e2e8f0';
    ctx.lineWidth = crowded ? 1.5 : 1.1;
    ctx.stroke();

    if (qLen === 0) {
      ctx.font = '500 9px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Queue: 0', box.cx, trayY + 22);
      ctx.restore();
      return;
    }

    const maxVisible = qLen >= 10 ? 2 : (qLen > 4 ? 3 : 4);
    const visible = Math.min(qLen, maxVisible);
    const startX = box.x + 7;
    for (let i = 0; i < visible; i++) {
      const qIt = queueItems[i];
      const isObsolete = qIt.bornEpoch < sim.worldEpoch;
      const tx = startX + i * 25 + 11;
      const ty = trayY + 18;
      drawRoundedRect(ctx, tx - 11, ty - 11, 22, 22, 4);
      ctx.fillStyle = isObsolete ? '#fef2f2' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = isObsolete ? '#dc2626' : (qIt.hasWrench ? '#f59e0b' : '#64748b');
      ctx.lineWidth = isObsolete || qIt.hasWrench ? 1.7 : 1.1;
      if (isObsolete) ctx.setLineDash([2.5, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      const miniRadii = qIt.builtRadii || qIt.specRadii || qIt.capturedWorldRadii;
      const miniScale = fitPairScale(6.8, 8.8, miniRadii, null);
      drawPolarShape(ctx, tx, ty, miniRadii, miniScale, {
        fill: qIt.builtRadii ? 'rgba(51, 65, 85, 0.82)' : 'rgba(37, 99, 235, 0.16)',
        stroke: isObsolete ? '#dc2626' : (qIt.builtRadii ? '#0f172a' : '#2563eb'),
        lineWidth: 1.0
      });
    }

    if (qLen > maxVisible) {
      ctx.font = '700 9.5px ui-monospace, monospace';
      ctx.fillStyle = crowded ? '#b91c1c' : '#475569';
      ctx.textAlign = 'right';
      ctx.fillText('+' + (qLen - maxVisible) + ' (' + qLen + ')', box.x + box.w - 5, trayY + 22);
    }
    ctx.restore();
  }

  function drawTransducerConnector(
    x1,
    x2,
    y,
    rawNoise,
    dampened,
    dampLabel,
    cleanLabel,
    degraded,
    effectiveNoisePct
  ) {
    ctx.save();
    const labelX = (x1 - 4 + x2 + 6) / 2;

    if (dampened && rawNoise > 0 && degraded) {
      const amp = 2.4;
      const steps = 7;
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      for (let i = 1; i < steps; i++) {
        const px = x1 + ((x2 - x1) * i) / steps;
        const py = y + (i % 2 === 0 ? -amp : amp) * Math.sin(sim.clockSec * 5 + i);
        ctx.lineTo(px, py);
      }
      ctx.lineTo(x2, y);
      ctx.stroke();
      drawArrowHead(ctx, x2 + 2, y, 0, 7, '#d97706');

      ctx.font = '700 8.5px Inter, sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.textAlign = 'center';
      ctx.fillText(dampLabel, labelX, y - 12);
    } else if (dampened && rawNoise > 0) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
      drawArrowHead(ctx, x2 + 2, y, 0, 7, '#10b981');

      ctx.font = '700 8.5px Inter, sans-serif';
      ctx.fillStyle = '#047857';
      ctx.textAlign = 'center';
      ctx.fillText(dampLabel, labelX, y - 12);
    } else if (rawNoise > 0.01) {
      const amp = 2.5 + rawNoise * 5.5;
      const steps = 9;
      ctx.strokeStyle = '#ed6736';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      for (let i = 1; i < steps; i++) {
        const px = x1 + ((x2 - x1) * i) / steps;
        const py = y + (i % 2 === 0 ? -amp : amp) * Math.sin(sim.clockSec * 7 + i);
        ctx.lineTo(px, py);
      }
      ctx.lineTo(x2, y);
      ctx.stroke();
      drawArrowHead(ctx, x2 + 2, y, 0, 7, '#ed6736');

      ctx.font = '700 8.5px Inter, sans-serif';
      ctx.fillStyle = '#c2410c';
      ctx.textAlign = 'center';
      ctx.fillText('Noise!', labelX, y - 12);
    } else {
      ctx.strokeStyle = degraded ? '#d97706' : '#94a3b8';
      ctx.lineWidth = 1.8;
      if (degraded) ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
      ctx.setLineDash([]);
      drawArrowHead(ctx, x2 + 2, y, 0, 7, degraded ? '#d97706' : '#94a3b8');

      if (cleanLabel) {
        ctx.font = (degraded ? '700 ' : '600 ') + '8.5px Inter, sans-serif';
        ctx.fillStyle = degraded ? '#b45309' : '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText(cleanLabel, labelX, y - 12);
      }
    }

    if (effectiveNoisePct && effectiveNoisePct > 0) {
      ctx.font = '600 8px ui-monospace, monospace';
      ctx.fillStyle = degraded ? '#b45309' : (dampened ? '#047857' : '#c2410c');
      ctx.textAlign = 'center';
      ctx.fillText(effectiveNoisePct + '%', labelX, y + 13);
    }
    ctx.restore();
  }

  function drawStationDurationBadge(b, sec, spotlightTone) {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = '600 8px ui-monospace, monospace';
    if (spotlightTone === 'good') ctx.fillStyle = '#047857';
    else if (spotlightTone === 'warn') ctx.fillStyle = '#b45309';
    else if (spotlightTone === 'bad') ctx.fillStyle = '#b91c1c';
    else ctx.fillStyle = '#64748b';
    ctx.fillText(formatCompactSimDays(sec), b.x + 6, b.y + 15);
    ctx.restore();
  }

  function shouldRenderEmptyPreview(stationKey, spotlightSpec) {
    if (!enableEmptyStationPreview || settings.chapter < 2 || !spotlightSpec) return false;
    if (!spotlightSpec.isPreview || spotlightSpec.alpha <= 0.12) return false;
    const ck = spotlightSpec.controlKey;
    if (stationKey === 'discovery') {
      return ck === 'discovery' || ck === 'discoveryNoise' || ck === 'discoveryDampener';
    }
    if (stationKey === 'build') {
      return ck === 'build' || ck === 'buildNoise' || ck === 'buildDampener';
    }
    if (stationKey === 'rollout') {
      return ck === 'reach' || ck === 'messagingNoise' || ck === 'rolloutDampener';
    }
    return false;
  }

  function drawEmptyStationPreview(stationKey, box, cc, spotlightSpec) {
    const alpha = Math.min(1, spotlightSpec.alpha);
    ctx.save();
    ctx.globalAlpha = 0.84 * alpha;

    if (stationKey === 'discovery') {
      const effNoise = getEffectiveDiscoveryNoise();
      const previewSpec = effNoise > 0.005 ? warpShape(sim.worldRadii, effNoise, 4242) : sim.worldRadii;
      const dScale = fitPairScale(box.rScale, 36, previewSpec, sim.worldRadii);
      ctx.save();
      clipStationWorkBay(ctx, box, 37, 23);
      if (effNoise > 0.02) {
        drawPolarShape(ctx, box.cx, box.cy - 1, sim.worldRadii, dScale, {
          stroke: 'rgba(148, 163, 184, 0.58)',
          lineWidth: 1.3
        });
      }
      drawPolarShape(ctx, box.cx, box.cy - 1, previewSpec, dScale, {
        fill: 'rgba(37, 99, 235, 0.09)',
        stroke: '#2563eb',
        lineWidth: 1.9,
        dash: [5, 3]
      });
      ctx.restore();
      ctx.restore();

      ctx.save();
      ctx.font = '500 9.5px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(
        settings.chapter >= 2 && settings.discoveryDampener
          ? cc.discoveryIdleDampened
          : cc.discoveryIdleBase,
        box.cx,
        box.y + box.h - 10
      );
      ctx.restore();
      return;
    }

    if (stationKey === 'build') {
      const effNoise = getEffectiveBuildNoise();
      const previewBuilt = effNoise > 0.005 ? warpShape(sim.worldRadii, effNoise, 7331) : sim.worldRadii;
      const bScale = fitPairScale(box.rScale, 36, sim.worldRadii, previewBuilt);
      ctx.save();
      clipStationWorkBay(ctx, box, 37, 23);
      drawPolarShape(ctx, box.cx, box.cy - 1, previewBuilt, bScale, {
        fill: 'rgba(51, 65, 85, 0.58)',
        stroke: '#334155',
        lineWidth: 1.6
      });
      drawPolarShape(ctx, box.cx, box.cy - 1, sim.worldRadii, bScale, {
        stroke: '#2563eb',
        lineWidth: 1.6,
        dash: [4, 3]
      });
      ctx.restore();
      ctx.restore();

      ctx.save();
      ctx.font = '500 9.5px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      const idleLabel =
        settings.chapter >= 4 && settings.build10x
          ? cc.buildIdle10x
          : (settings.chapter >= 2 && settings.buildDampener
              ? cc.buildIdlePaired
              : (getEffectiveBuildConcurrency() >= 2 ? cc.buildIdleSoloParallel : cc.buildIdleBase));
      ctx.fillText(idleLabel, box.cx, box.y + box.h - 10);
      ctx.restore();
      return;
    }

    if (stationKey === 'rollout') {
      const rScale = getEffectiveReachScale();
      const fullR = fitPairScale(box.rScale, 36, sim.worldRadii, null);
      const drawR = fitPairScale(box.rScale * rScale, 36, sim.worldRadii, null);
      ctx.save();
      clipStationWorkBay(ctx, box, 37, 23);
      if (rScale < 0.99) {
        drawPolarShape(ctx, box.cx, box.cy - 1, sim.worldRadii, fullR, {
          stroke: 'rgba(148, 163, 184, 0.45)',
          lineWidth: 1.2,
          dash: [3, 3]
        });
      }
      drawPolarShape(ctx, box.cx, box.cy - 1, sim.worldRadii, drawR, {
        fill: 'rgba(51, 65, 85, 0.64)',
        stroke: '#334155',
        lineWidth: 1.6
      });
      ctx.restore();
      ctx.restore();

      ctx.save();
      ctx.font = '500 9.5px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(
        !isSilentRollout() && settings.rolloutDampener ? cc.rolloutIdleChecked : cc.rolloutIdleBase,
        box.cx,
        box.y + box.h - 10
      );
      ctx.restore();
      return;
    }

    ctx.restore();
  }

  function drawStationHeader(b, eyebrow, title, muted) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 9px Inter, sans-serif';
    ctx.fillStyle = muted ? '#94a3b8' : '#64748b';
    ctx.fillText(eyebrow, b.cx, b.y + 16);

    const titlePx = b.w < 150 && isCyberneticsView() ? 11 : 12;
    ctx.font = '700 ' + titlePx + 'px Inter, sans-serif';
    ctx.fillStyle = muted ? '#94a3b8' : '#0f172a';
    ctx.fillText(title, b.cx, b.y + 32);
    ctx.restore();
  }

  function drawProgressRing(cx, cy, radius, progress, colour) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, progress));
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawConnectorsAndLoops(layout) {
    const b = layout.boxes;
    const wl = b.worldLeft;
    const ds = b.discovery;
    const bd = b.build;
    const ts = b.testing;
    const ro = b.rollout;
    const wr = b.worldRight;
    const lastInternal = ro || ts || bd;

    ctx.save();

    ctx.fillStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.beginPath();
    ctx.moveTo(wl.x + wl.w, wl.y + 18);
    ctx.lineTo(ds.x, ds.y + 10);
    ctx.lineTo(ds.x, ds.y + ds.h - 10);
    ctx.lineTo(wl.x + wl.w, wl.y + wl.h - 18);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(lastInternal.x + lastInternal.w, lastInternal.y + 10);
    ctx.lineTo(wr.x, wr.y + 18);
    ctx.lineTo(wr.x, wr.y + wr.h - 18);
    ctx.lineTo(lastInternal.x + lastInternal.w, lastInternal.y + lastInternal.h - 10);
    ctx.closePath();
    ctx.fill();

    const rawDiscNoise = settings.chapter >= 2 ? NOISE_REGIMES[settings.discoveryNoiseIdx].level : 0;
    const rawBuildNoise = settings.chapter >= 2 ? NOISE_REGIMES[settings.buildNoiseIdx].level : 0;
    const rawMsgNoise = isRolloutActive() && !isSilentRollout()
      ? MESSAGING_NOISE_REGIMES[settings.messagingNoiseIdx].level
      : 0;
    const effDiscPct = settings.chapter >= 2 ? Math.round(getEffectiveDiscoveryNoise() * 100) : 0;
    const effBuildPct = settings.chapter >= 2 ? Math.round(getEffectiveBuildNoise() * 100) : 0;
    const effMsgPct = isRolloutActive() && !isSilentRollout()
      ? Math.round(getEffectiveMessagingNoise() * 100)
      : 0;

    const isCyber = isCyberneticsView();
    const cc = CANVAS_COPY[isCyber ? 'cybernetics' : 'product'];

    drawTransducerConnector(
      wl.x + wl.w + 4,
      ds.x - 6,
      140,
      rawDiscNoise,
      settings.chapter >= 2 && settings.discoveryDampener,
      cc.senseDampened,
      cc.senseClean,
      false,
      effDiscPct
    );

    if (cc.horizonChannel) {
      ctx.save();
      ctx.font = '600 8.5px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(cc.horizonChannel, (wl.x + wl.w + ds.x) / 2, 198);
      ctx.restore();
    }

    const buildPairDegraded =
      settings.chapter >= 2 &&
      settings.buildDampener &&
      rawBuildNoise > 0 &&
      isOversizedBuildBatch();

    drawTransducerConnector(
      ds.x + ds.w + 4,
      bd.x - 6,
      140,
      rawBuildNoise,
      settings.chapter >= 2 && settings.buildDampener,
      buildPairDegraded ? cc.buildDegraded : cc.buildDampened,
      '',
      buildPairDegraded,
      effBuildPct
    );

    if (!ts) {
      drawTransducerConnector(
        bd.x + bd.w + 4,
        wr.x - 6,
        140,
        0,
        false,
        '',
        cc.rolloutClean
      );
    } else if (!ro) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(bd.x + bd.w + 4, 140);
      ctx.lineTo(ts.x - 6, 140);
      ctx.stroke();
      drawArrowHead(ctx, ts.x - 4, 140, 0, 7, '#94a3b8');

      drawTransducerConnector(
        ts.x + ts.w + 4,
        wr.x - 6,
        140,
        0,
        false,
        '',
        cc.rolloutClean
      );
    } else {
      const middleArrows = [
        [bd.x + bd.w + 4, ts.x - 6, 140],
        [ts.x + ts.w + 4, ro.x - 6, 140]
      ];
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < middleArrows.length; i++) {
        const [x1, x2, y] = middleArrows[i];
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
        drawArrowHead(ctx, x2 + 2, y, 0, 7, '#94a3b8');
      }

      const silentOut = isRolloutActive() && isSilentRollout();
      drawTransducerConnector(
        ro.x + ro.w + 4,
        wr.x - 6,
        140,
        rawMsgNoise,
        isRolloutActive() && !silentOut && settings.rolloutDampener,
        cc.rolloutDampened,
        silentOut ? cc.rolloutSilent : cc.rolloutClean,
        silentOut,
        effMsgPct
      );
    }

    // Inner Loop: Testing rework track (introduced in Chapter 3 alongside Testing)
    ctx.textAlign = 'center';
    if (ts) {
      const innerActive = getEffectiveTestingIdx() > 0;
      const onReworkNow = sim.transits.some(function (t) { return t.kind === 'inner_rework'; });
      const buildInnerExitX = layout.buildInnerExitX;
      ctx.strokeStyle = onReworkNow ? '#f59e0b' : (innerActive ? '#64748b' : '#e2e8f0');
      ctx.lineWidth = onReworkNow ? 2.4 : (innerActive ? 1.8 : 1.5);
      if (!innerActive) ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ts.cx, ts.y + ts.h);
      ctx.lineTo(ts.cx, INNER_LOOP_Y);
      ctx.lineTo(buildInnerExitX, INNER_LOOP_Y);
      ctx.lineTo(buildInnerExitX, bd.y + bd.h + 5);
      ctx.stroke();
      ctx.setLineDash([]);
      drawArrowHead(
        ctx,
        buildInnerExitX,
        bd.y + bd.h + 2,
        -Math.PI / 2,
        innerActive ? 7 : 6,
        onReworkNow ? '#f59e0b' : (innerActive ? '#64748b' : '#cbd5e1')
      );

      ctx.font = innerActive ? '600 9.5px Inter, sans-serif' : '500 9.5px Inter, sans-serif';
      ctx.fillStyle = onReworkNow ? '#b45309' : (innerActive ? '#475569' : '#94a3b8');
      const innerText = innerActive ? cc.innerLoopActive : cc.innerLoopLocked;
      const innerCaptionX = settings.chapter >= 6 ? 648 : (buildInnerExitX + ts.cx) / 2;
      ctx.fillText(innerText, innerCaptionX, 299);
    }

    // Outer Loop base trunk + three upward highway exits (introduced in Chapter 6)
    if (isOuterRoutingActive()) {
      const buildOuterExitX = layout.buildOuterExitX;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(wr.cx, wr.y + wr.h);
      ctx.lineTo(wr.cx, OUTER_LOOP_Y);
      ctx.lineTo(ds.cx, OUTER_LOOP_Y);
      ctx.lineTo(ds.cx, ds.y + ds.h + 6);
      ctx.stroke();
      drawArrowHead(ctx, ds.cx, ds.y + ds.h + 2, -Math.PI / 2, 7, '#64748b');

      const earlyExits = [
        { name: 'rollout', exitX: ro.cx, bottomY: ro.y + ro.h },
        { name: 'build', exitX: buildOuterExitX, bottomY: bd.y + bd.h }
      ];
      earlyExits.forEach(function (ex) {
        ctx.save();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ex.exitX, OUTER_LOOP_Y);
        ctx.lineTo(ex.exitX, ex.bottomY + 6);
        ctx.stroke();
        drawArrowHead(ctx, ex.exitX, ex.bottomY + 2, -Math.PI / 2, 6.5, '#94a3b8');
        ctx.restore();
      });

      // Highlight all highway exit segments currently taken by returning failed items
      const activeOuterTransits = sim.transits.filter(function (t) { return t.kind === 'outer_return'; });
      activeOuterTransits.forEach(function (outerTr) {
        if (
          outerTr.mode === 'blind' &&
          outerTr.trueFault &&
          outerTr.trueFault !== outerTr.exitTarget &&
          !activeOuterTransits.some(function (other) { return other.exitTarget === outerTr.trueFault; })
        ) {
          const missedExitX =
            outerTr.trueFault === 'rollout'
              ? ro.cx
              : (outerTr.trueFault === 'build' ? buildOuterExitX : ds.cx);
          const missedBottomY =
            outerTr.trueFault === 'rollout'
              ? ro.y + ro.h
              : (outerTr.trueFault === 'build' ? bd.y + bd.h : ds.y + ds.h);
          ctx.save();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2.0;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(missedExitX, OUTER_LOOP_Y);
          ctx.lineTo(missedExitX, missedBottomY + 6);
          ctx.stroke();
          ctx.setLineDash([]);
          drawArrowHead(ctx, missedExitX, missedBottomY + 2, -Math.PI / 2, 7, '#d97706');
          ctx.restore();
        }
      });

      activeOuterTransits.forEach(function (outerTr) {
        const activeCol = outerTr.mode === 'diagnosed' ? '#10b981' : '#ef4444';
        const targetExitX =
          outerTr.exitTarget === 'rollout'
            ? ro.cx
            : (outerTr.exitTarget === 'build' ? buildOuterExitX : ds.cx);
        const targetBottomY =
          outerTr.exitTarget === 'rollout'
            ? ro.y + ro.h
            : (outerTr.exitTarget === 'build' ? bd.y + bd.h : ds.y + ds.h);

        ctx.strokeStyle = activeCol;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(wr.cx, wr.y + wr.h);
        ctx.lineTo(wr.cx, OUTER_LOOP_Y);
        ctx.lineTo(targetExitX, OUTER_LOOP_Y);
        ctx.lineTo(targetExitX, targetBottomY + 6);
        ctx.stroke();
        drawArrowHead(ctx, targetExitX, targetBottomY + 2, -Math.PI / 2, 7.5, activeCol);
      });

      const rampSigns = [
        { name: 'discovery', cx: ds.cx, baseLabel: cc.rampDiscovery },
        { name: 'build', cx: buildOuterExitX, baseLabel: cc.rampBuild },
        { name: 'rollout', cx: ro.cx, baseLabel: cc.rampRollout }
      ];
      const signCy = 238;
      rampSigns.forEach(function (sign) {
        const takingTransit = activeOuterTransits.find(function (t) {
          return t.exitTarget === sign.name;
        });
        const isTaken = Boolean(takingTransit);
        const isMissedFault = !isTaken && activeOuterTransits.some(function (t) {
          return t.mode === 'blind' && t.trueFault === sign.name && t.exitTarget !== sign.name;
        });

        let text = sign.baseLabel;
        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        let textCol = '#475569';
        let dashed = false;

        if (isTaken && takingTransit.mode === 'diagnosed') {
          text = sign.baseLabel + ' \u2713';
          fill = '#059669';
          stroke = '#047857';
          textCol = '#ffffff';
        } else if (isTaken && takingTransit.mode === 'blind') {
          text = sign.baseLabel + ' ?';
          fill = '#dc2626';
          stroke = '#b91c1c';
          textCol = '#ffffff';
        } else if (isMissedFault) {
          text = 'Actual fault';
          fill = '#fffbeb';
          stroke = '#d97706';
          textCol = '#b45309';
          dashed = true;
        }

        ctx.save();
        ctx.font = (isTaken || isMissedFault ? '700 ' : '600 ') + '9.5px Inter, sans-serif';
        const pillW = ctx.measureText(text).width + 14;
        const pillH = 18;
        drawRoundedRect(ctx, sign.cx - pillW / 2, signCy - pillH / 2, pillW, pillH, 9);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = isTaken || isMissedFault ? 1.5 : 1.1;
        if (dashed) ctx.setLineDash([3, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = textCol;
        ctx.textAlign = 'center';
        ctx.fillText(text, sign.cx, signCy + 3.3);
        ctx.restore();
      });

      ctx.font = '600 10.5px Inter, sans-serif';
      ctx.fillStyle = isDiagnosticActive() ? '#047857' : '#475569';
      const outerCaption = isDiagnosticActive() ? cc.outerDiagnosed : cc.outerBlind;
      ctx.fillText(outerCaption, (ds.cx + wr.cx) / 2, layout.height - 9);
    }

    ctx.restore();
  }

  function drawWorkItemTile(cx, cy, specRadii, solidRadii, labelText, badgeType, labelAlert) {
    ctx.save();
    drawRoundedRect(ctx, cx - 22, cy - 22, 44, 44, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    let borderCol = '#475569';
    if (badgeType === 'wrench') borderCol = '#f59e0b';
    else if (badgeType === 'passed' || badgeType === 'diagnosed') borderCol = '#10b981';
    else if (badgeType === 'blind') borderCol = '#ef4444';
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = badgeType ? 1.9 : 1.5;
    ctx.stroke();

    const tileScale = fitPairScale(14, 18.5, specRadii, solidRadii);
    if (solidRadii) {
      drawPolarShape(ctx, cx, cy, solidRadii, tileScale, {
        fill: 'rgba(51, 65, 85, 0.85)',
        stroke: '#0f172a',
        lineWidth: 1.3
      });
    }
    if (specRadii) {
      drawPolarShape(ctx, cx, cy, specRadii, tileScale, {
        stroke: '#2563eb',
        lineWidth: 1.3,
        dash: [3, 2]
      });
    }
    if (labelText) {
      ctx.font = '700 8.5px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = labelAlert ? '#b91c1c' : '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(labelText, cx, cy + 30);
    }

    if (badgeType === 'wrench') {
      drawWrenchBadge(ctx, cx + 19, cy - 19);
    } else if (badgeType === 'passed') {
      drawPassedBadge(ctx, cx + 19, cy - 19);
    } else if (badgeType === 'blind') {
      drawQuestionBadge(ctx, cx + 19, cy - 19);
    } else if (badgeType === 'diagnosed') {
      drawDiagnosedBadge(ctx, cx + 19, cy - 19);
    }
    ctx.restore();
  }

  function renderCanvas() {
    const layout = getSceneLayout();
    const b = layout.boxes;
    syncCanvasDimensions(layout.height);
    ctx.clearRect(0, 0, W, layout.height);

    drawConnectorsAndLoops(layout);

    const isCyber = isCyberneticsView();
    const cc = CANVAS_COPY[isCyber ? 'cybernetics' : 'product'];

    drawWipGateAndRail(layout, cc);
    drawQueueTray(b.discovery, sim.stations.discovery.queue);
    drawQueueTray(b.build, sim.stations.build.queue);
    if (b.testing && getEffectiveTestingIdx() > 0) {
      drawQueueTray(b.testing, sim.stations.testing.queue);
    }
    if (b.rollout && isRolloutActive()) {
      drawQueueTray(b.rollout, sim.stations.rollout.queue);
    }

    // Chapter 7+: Andon cord top pre-emption wire, shock status banner, & Chapter 8 Governance (System 5) header
    if (settings.chapter >= 7 && b.rollout) {
      ctx.save();
      const wireStartX = b.worldLeft.x + b.worldLeft.w;
      const wireEndX = b.rollout.x + b.rollout.w;
      const wireMidX = (b.discovery.x + wireEndX) / 2;
      if (sim.andonFlash) {
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(wireStartX, 11);
        ctx.lineTo(wireEndX, 11);
        ctx.stroke();

        const n = sim.andonFlash.flushedCount;
        const itemNoun = sim.andonFlash.kind === 'jam'
          ? (n === 1 ? 'queued item' : 'queued items')
          : (n === 1 ? 'pre-shock item' : 'pre-shock items');
        const msg = cc.andonFlashPrefix + n + ' ' + itemNoun;
        ctx.font = '700 10px Inter, sans-serif';
        const bw = ctx.measureText(msg).width + 18;
        drawRoundedRect(ctx, wireMidX - bw / 2, 2, bw, 18, 9);
        ctx.fillStyle = '#059669';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(msg, wireMidX, 14.5);
      } else if (sim.shockFlash && !isAndonActive()) {
        ctx.font = '700 9.5px Inter, sans-serif';
        ctx.fillStyle = '#dc2626';
        ctx.textAlign = 'center';
        const rem = sim.shockFlash.staleRemaining;
        const remNoun = rem === 1 ? 'pre-shock item' : 'pre-shock items';
        ctx.fillText(
          isCyber
            ? 'No algedonic interrupt: ' + rem + ' ' + remNoun + ' clogging queues!'
            : 'No Andon cord: ' + rem + ' ' + remNoun + ' still clogging the line!',
          wireMidX,
          14
        );
      } else if (settings.chapter === 8) {
        const govStationCenters = [b.discovery.cx, b.build.cx];
        if (b.testing) govStationCenters.push(b.testing.cx);
        govStationCenters.push(b.rollout.cx);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(b.discovery.cx, 11);
        ctx.lineTo(b.rollout.cx, 11);
        ctx.stroke();
        govStationCenters.forEach(function (tickX) {
          ctx.beginPath();
          ctx.moveTo(tickX, 11);
          ctx.lineTo(tickX, 22);
          ctx.stroke();
        });

        const govText = isAndonActive() ? cc.govBarArmed : cc.govBarOff;
        ctx.font = '600 9px Inter, sans-serif';
        const gw = ctx.measureText(govText).width + 18;
        drawRoundedRect(ctx, wireMidX - gw / 2, 2, gw, 17, 8.5);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.strokeStyle = isAndonActive() ? '#6366f1' : '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = isAndonActive() ? '#312e81' : '#475569';
        ctx.textAlign = 'center';
        ctx.fillText(govText, wireMidX, 13.8);
      } else if (isAndonActive()) {
        ctx.font = '600 9px Inter, sans-serif';
        ctx.fillStyle = '#047857';
        ctx.textAlign = 'center';
        ctx.fillText(cc.andonArmed, wireMidX, 14);
      }
      ctx.restore();
    }

    // 1. Left Large Box: Outside World / Environment
    const wl = b.worldLeft;
    const worldShocking = Boolean(sim.shockFlash);
    drawRoundedRect(ctx, wl.x, wl.y, wl.w, wl.h, 10);
    ctx.fillStyle = worldShocking ? '#fef2f2' : '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = worldShocking ? '#dc2626' : '#cbd5e1';
    ctx.lineWidth = worldShocking ? 2.6 : 1.6;
    ctx.stroke();
    drawStationHeader(wl, cc.worldLeftEyebrow, cc.worldLeftTitle, false);

    ctx.save();
    clipStationWorkBay(ctx, wl, 38, 26);
    const wlScale = fitPairScale(wl.rScale, 76, sim.worldRadii, null);
    drawPolarShape(ctx, wl.cx, wl.cy + 2, sim.worldRadii, wlScale, {
      fill: worldShocking ? 'rgba(220, 38, 38, 0.16)' : 'rgba(59, 130, 246, 0.14)',
      stroke: worldShocking ? '#dc2626' : '#1d4ed8',
      lineWidth: 2.4
    });
    ctx.restore();

    if (worldShocking) {
      ctx.save();
      const shockTag = cc.shockTag;
      ctx.font = '700 9.5px Inter, sans-serif';
      const sw = ctx.measureText(shockTag).width + 14;
      drawRoundedRect(ctx, wl.cx - sw / 2, 7, sw, 17, 8.5);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(shockTag, wl.cx, 18.8);
      ctx.restore();
    }

    ctx.font = '600 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = '#1e40af';
    ctx.textAlign = 'center';
    ctx.fillText(cc.worldStatePrefix + sim.worldLabel, wl.cx, wl.y + wl.h - 14);

    const activeSpotSpec = getActiveSpotlightSpec();
    const spotTones = activeSpotSpec && !activeSpotSpec.dashed && activeSpotSpec.zoneTones
      ? activeSpotSpec.zoneTones
      : null;

    // 2. Small Box: Discovery (System 4)
    const ds = b.discovery;
    const dActive = sim.stations.discovery.active;
    const discDur = getEffectiveDiscoverySec();
    drawRoundedRect(ctx, ds.x, ds.y, ds.w, ds.h, 8);
    ctx.fillStyle = dActive ? '#eff6ff' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = dActive ? '#2563eb' : '#cbd5e1';
    ctx.lineWidth = dActive ? 2 : 1.4;
    ctx.stroke();
    drawStationHeader(ds, cc.discoveryEyebrow, cc.discoveryTitle, false);
    drawStationDurationBadge(ds, discDur, spotTones ? spotTones.discovery : null);

    if (dActive) {
      const prog = Math.min(1, dActive.stageElapsed / discDur);
      const dScale = fitPairScale(
        ds.rScale,
        40,
        dActive.specRadii,
        getEffectiveDiscoveryNoise() > 0.04 ? dActive.capturedWorldRadii : null
      );
      ctx.save();
      clipStationWorkBay(ctx, ds, 37, 21);
      if (getEffectiveDiscoveryNoise() > 0.04) {
        drawPolarShape(ctx, ds.cx, ds.cy + 1, dActive.capturedWorldRadii, dScale, {
          stroke: 'rgba(148, 163, 184, 0.55)',
          lineWidth: 1.3
        });
      }
      drawPolarShape(ctx, ds.cx, ds.cy + 1, dActive.specRadii, dScale, {
        fill: 'rgba(37, 99, 235, 0.09)',
        stroke: '#2563eb',
        lineWidth: 2,
        dash: [5, 3]
      });
      ctx.restore();
      drawProgressRing(ds.x + ds.w - 13, ds.y + 13, 5.8, prog, '#2563eb');
      ctx.font = '600 9px ui-monospace, monospace';
      ctx.fillStyle = dActive.hadDiscoveryWarp ? '#c2410c' : '#1d4ed8';
      ctx.textAlign = 'center';
      ctx.fillText(
        dActive.hadDiscoveryWarp ? cc.discoveryWarped : cc.discoveryCleanPrefix + dActive.capturedName,
        ds.cx,
        ds.y + ds.h - 10
      );
    } else if (shouldRenderEmptyPreview('discovery', activeSpotSpec)) {
      drawEmptyStationPreview('discovery', ds, cc, activeSpotSpec);
    } else if (settings.chapter >= 2 && sim.lastDiscoveryTrace) {
      const trc = sim.lastDiscoveryTrace;
      const showRef = trc.hadDiscoveryWarp || getEffectiveDiscoveryNoise() > 0.04;
      const tScale = fitPairScale(
        ds.rScale,
        40,
        trc.specRadii,
        showRef ? trc.capturedWorldRadii : null
      );
      ctx.save();
      clipStationWorkBay(ctx, ds, 37, 21);
      ctx.globalAlpha = 0.56;
      if (showRef) {
        drawPolarShape(ctx, ds.cx, ds.cy + 1, trc.capturedWorldRadii, tScale, {
          stroke: 'rgba(100, 116, 139, 0.72)',
          lineWidth: 1.35
        });
      }
      drawPolarShape(ctx, ds.cx, ds.cy + 1, trc.specRadii, tScale, {
        fill: 'rgba(37, 99, 235, 0.07)',
        stroke: '#2563eb',
        lineWidth: 1.8,
        dash: [5, 3]
      });
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.78;
      ctx.font = '600 9px ui-monospace, monospace';
      ctx.fillStyle = trc.hadDiscoveryWarp ? '#c2410c' : '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(
        trc.hadDiscoveryWarp ? cc.discoveryWarped : cc.discoveryCleanPrefix + trc.capturedName,
        ds.cx,
        ds.y + ds.h - 10
      );
      ctx.restore();
    } else {
      ctx.font = '500 10px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(
        settings.chapter >= 2 && settings.discoveryDampener
          ? cc.discoveryIdleDampened
          : cc.discoveryIdleBase,
        ds.cx,
        ds.cy + 10
      );
    }

    // 3. Small Box: Build (System 1)
    const bd = b.build;
    const bActive = sim.stations.build.active;
    const bSecondary = sim.stations.build.secondary;
    const buildDur = getEffectiveBuildSec();
    const isReworkingNow = Boolean(bActive && bActive.hasWrench);
    drawRoundedRect(ctx, bd.x, bd.y, bd.w, bd.h, 8);
    ctx.fillStyle = isReworkingNow ? '#fffbeb' : (bActive ? '#fff7ed' : '#ffffff');
    ctx.fill();
    ctx.strokeStyle = isReworkingNow ? '#f59e0b' : (bActive ? '#ed6736' : '#cbd5e1');
    ctx.lineWidth = bActive ? 2 : 1.4;
    ctx.stroke();
    const buildEyebrow = settings.chapter >= 4 && settings.build10x ? cc.buildEyebrow10x : cc.buildEyebrowBase;
    drawStationHeader(bd, buildEyebrow, cc.buildTitle, false);
    drawStationDurationBadge(bd, buildDur, spotTones ? spotTones.build : null);

    if (bActive) {
      const prog = Math.min(1, bActive.stageElapsed / buildDur);
      const bScale = fitPairScale(bd.rScale, 40, bActive.specRadii, bActive.builtRadii);
      const fillScale = bScale * (0.3 + 0.7 * prog);
      ctx.save();
      clipStationWorkBay(ctx, bd, 37, 21);
      drawPolarShape(ctx, bd.cx, bd.cy + 1, bActive.builtRadii, fillScale, {
        fill: 'rgba(51, 65, 85, 0.85)',
        stroke: '#0f172a',
        lineWidth: 1.8
      });
      drawPolarShape(ctx, bd.cx, bd.cy + 1, bActive.specRadii, bScale, {
        stroke: '#2563eb',
        lineWidth: 1.6,
        dash: [4, 3]
      });
      ctx.restore();
      drawProgressRing(bd.x + bd.w - 13, bd.y + 13, 5.8, prog, isReworkingNow ? '#f59e0b' : '#ed6736');
      if (bSecondary) {
        const prog2 = Math.min(1, bSecondary.stageElapsed / buildDur);
        const tagText = cc.buildParallelTag || '2/2 solo';
        ctx.save();
        ctx.font = '700 8px ui-monospace, monospace';
        const tagW = ctx.measureText(tagText).width + 8;
        const ring2X = bd.x + bd.w - 12;
        const ring2Y = bd.y + 45;
        drawRoundedRect(ctx, ring2X - 7 - tagW - 2, ring2Y - 6.5, tagW, 13, 3.5);
        ctx.fillStyle = 'rgba(255, 247, 237, 0.94)';
        ctx.fill();
        ctx.strokeStyle = '#fdba74';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#c2410c';
        ctx.textAlign = 'right';
        ctx.fillText(tagText, ring2X - 9 - 2, ring2Y + 2.8);
        ctx.restore();
        drawProgressRing(ring2X, ring2Y, 4.6, prog2, '#ea580c');
      }
      if (isReworkingNow) {
        drawWrenchBadge(ctx, bd.x + 18, bd.y + 48);
      }
      ctx.font = '600 9px ui-monospace, monospace';
      ctx.fillStyle = isReworkingNow ? '#b45309' : (bActive.hadBuildWarp ? '#c2410c' : '#334155');
      ctx.textAlign = 'center';
      ctx.fillText(
        isReworkingNow
          ? cc.buildReworking
          : (bActive.hadBuildWarp ? cc.buildDrifted : 'Building ' + bActive.capturedName),
        bd.cx,
        bd.y + bd.h - 10
      );
    } else if (shouldRenderEmptyPreview('build', activeSpotSpec)) {
      drawEmptyStationPreview('build', bd, cc, activeSpotSpec);
    } else {
      ctx.font = '500 10px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      const idleLabel =
        settings.chapter >= 4 && settings.build10x
          ? cc.buildIdle10x
          : (settings.chapter >= 2 && settings.buildDampener
              ? cc.buildIdlePaired
              : (getEffectiveBuildConcurrency() >= 2 ? cc.buildIdleSoloParallel : cc.buildIdleBase));
      ctx.fillText(idleLabel, bd.cx, bd.cy + 10);
    }

    // 4. Small Box: Testing (System 3*, introduced in Chapter 3)
    const ts = b.testing;
    const tIdx = getEffectiveTestingIdx();
    if (ts) {
      const tActive = sim.stations.testing.active;
      ctx.save();
      if (tIdx === 0) {
        drawRoundedRect(ctx, ts.x, ts.y + 10, ts.w, ts.h - 20, 8);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        drawStationHeader({ cx: ts.cx, y: ts.y + 10 }, cc.testingEyebrow, cc.testingTitle, true);
        ctx.font = '600 9.5px ui-monospace, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('Off (0d)', ts.cx, ts.cy + 16);
      } else {
        const testDur = TESTING_REGIMES[tIdx].sec;
        drawRoundedRect(ctx, ts.x, ts.y, ts.w, ts.h, 8);
        ctx.fillStyle = tActive ? '#f0fdf4' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = tActive ? '#0d9488' : '#cbd5e1';
        ctx.lineWidth = tActive ? 2 : 1.4;
        ctx.stroke();
        drawStationHeader(ts, cc.testingEyebrow, cc.testingTitle, false);
        drawStationDurationBadge(ts, testDur, spotTones ? spotTones.testing : null);

        if (tActive) {
          const prog = Math.min(1, tActive.stageElapsed / testDur);
          const tScale = fitPairScale(ts.rScale, 40, tActive.specRadii, tActive.builtRadii);
          ctx.save();
          clipStationWorkBay(ctx, ts, 37, 21);
          drawPolarShape(ctx, ts.cx, ts.cy + 1, tActive.builtRadii, tScale, {
            fill: 'rgba(51, 65, 85, 0.82)',
            stroke: '#0f172a',
            lineWidth: 1.7
          });
          drawPolarShape(ctx, ts.cx, ts.cy + 1, tActive.specRadii, tScale, {
            stroke: '#2563eb',
            lineWidth: 1.8,
            dash: [4, 3]
          });
          ctx.restore();
          drawProgressRing(ts.x + ts.w - 13, ts.y + 13, 5.8, prog, '#0d9488');

          const willPass =
            tActive.specFitPct / 100 >= TESTING_REGIMES[tIdx].threshold ||
            tActive.reworkCount >= MAX_REWORK_PASSES;
          ctx.font = '600 9px ui-monospace, monospace';
          ctx.fillStyle = willPass ? '#047857' : '#b45309';
          ctx.textAlign = 'center';
          ctx.fillText(cc.testingActivePrefix + tActive.specFitPct + '%', ts.cx, ts.y + ts.h - 10);
        } else if (sim.testingBanner) {
          ctx.font = '700 9px ui-monospace, monospace';
          ctx.fillStyle = sim.testingBanner.type === 'pass' ? '#047857' : '#b45309';
          ctx.textAlign = 'center';
          ctx.fillText(
            sim.testingBanner.type === 'pass' ? cc.testingBannerPass : cc.testingBannerRework,
            ts.cx,
            ts.cy + 10
          );
        } else {
          ctx.font = '500 9.5px Inter, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(cc.testingIdle, ts.cx, ts.cy + 10);
        }
      }
      ctx.restore();
    }

    // 5. Small Box: Rollout / Amplification (introduced in Chapter 5)
    const ro = b.rollout;
    if (ro && isRolloutActive()) {
      const rActive = sim.stations.rollout.active;
      const rolloutDur = getEffectiveRolloutSec();
      ctx.save();
      drawRoundedRect(ctx, ro.x, ro.y, ro.w, ro.h, 8);
      ctx.fillStyle = rActive ? '#faf5ff' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = rActive ? '#7c3aed' : '#cbd5e1';
      ctx.lineWidth = rActive ? 2 : 1.4;
      ctx.stroke();
      drawStationHeader(ro, cc.rolloutEyebrow, cc.rolloutTitle, false);
      drawStationDurationBadge(ro, rolloutDur, spotTones ? spotTones.rollout : null);

      if (rActive) {
        const prog = Math.min(1, rActive.stageElapsed / rolloutDur);
        const drawR = fitPairScale(ro.rScale * rActive.reachScale, 40, rActive.builtRadii, null);
        ctx.save();
        clipStationWorkBay(ctx, ro, 37, 21);
        drawPolarShape(ctx, ro.cx, ro.cy + 1, rActive.builtRadii, drawR, {
          fill: 'rgba(51, 65, 85, 0.85)',
          stroke: '#0f172a',
          lineWidth: 1.7
        });
        ctx.restore();
        drawProgressRing(ro.x + ro.w - 13, ro.y + 13, 5.8, prog, '#7c3aed');

        const badLabel = rActive.labelStatus !== 'accurate';
        ctx.font = '700 9px ui-monospace, monospace';
        ctx.fillStyle = badLabel ? '#b91c1c' : '#047857';
        ctx.textAlign = 'center';
        const tag =
          rActive.labelStatus === 'silent'
            ? 'Silent "???"'
            : 'Tag: "' + rActive.shippedLabel + '"' + (badLabel ? '!' : '');
        ctx.fillText(tag, ro.cx, ro.y + ro.h - 10);
      } else if (shouldRenderEmptyPreview('rollout', activeSpotSpec)) {
        drawEmptyStationPreview('rollout', ro, cc, activeSpotSpec);
      } else {
        ctx.font = '500 10px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(
          !isSilentRollout() && settings.rolloutDampener ? cc.rolloutIdleChecked : cc.rolloutIdleBase,
          ro.cx,
          ro.cy + 10
        );
      }
      ctx.restore();
    }

    // 6. Right Large Box: Real Users (Market Fit) / Environmental Fit
    const wr = b.worldRight;
    drawRoundedRect(ctx, wr.x, wr.y, wr.w, wr.h, 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = sim.landing
      ? (sim.landing.fitPct >= 75 ? '#10b981' : sim.landing.fitPct >= 52 ? '#f59e0b' : '#ef4444')
      : '#cbd5e1';
    ctx.lineWidth = sim.landing ? 2.4 : 1.6;
    ctx.stroke();
    drawStationHeader(wr, cc.worldRightEyebrow, cc.worldRightTitle, false);

    if (sim.landing) {
      ctx.save();
      clipStationWorkBay(ctx, wr, 38, 26);
      drawOutcomeOverlay(
        ctx,
        wr.cx,
        wr.cy + 2,
        sim.worldRadii,
        sim.landing,
        wr.rScale,
        cc
      );
      ctx.restore();
      const fit = sim.landing.fitPct;
      ctx.font = '700 10px ui-monospace, monospace';
      ctx.fillStyle = fit >= 75 ? '#047857' : fit >= 52 ? '#b45309' : '#b91c1c';
      ctx.textAlign = 'center';
      const prefix = sim.landing.testedPassed ? cc.landingTestPrefix : '';
      ctx.fillText(
        prefix + 'Fit ' + fit + '%',
        wr.cx,
        wr.y + wr.h - 14
      );
    } else {
      ctx.save();
      clipStationWorkBay(ctx, wr, 38, 26);
      const wrScale = fitPairScale(wr.rScale, 76, sim.worldRadii, null);
      drawPolarShape(ctx, wr.cx, wr.cy + 2, sim.worldRadii, wrScale, {
        fill: 'rgba(59, 130, 246, 0.14)',
        stroke: '#1d4ed8',
        lineWidth: 2.2
      });
      ctx.restore();
      ctx.font = '600 9.5px Inter, sans-serif';
      ctx.fillStyle = '#1e40af';
      ctx.textAlign = 'center';
      ctx.fillText(cc.worldRightLivePrefix + sim.worldLabel, wr.cx, wr.y + wr.h - 14);
    }

    // 7. In-transit Work Item Tile animations
    sim.transits.forEach(function (tr) {
      const it = tr.item;
      const u = smoothstep(tr.elapsed / tr.duration);
      if (tr.kind === 'to_discovery') {
        const x = (wl.x + wl.w) + u * (ds.x - (wl.x + wl.w));
        drawWorkItemTile(x, 140, it.capturedWorldRadii, null, null, null, false);
      } else if (tr.kind === 'to_build') {
        const x = (ds.x + ds.w) + u * (bd.x - (ds.x + ds.w));
        drawWorkItemTile(x, 140, it.specRadii, null, it.capturedName, null, false);
      } else if (tr.kind === 'to_testing' && ts) {
        const x = (bd.x + bd.w) + u * (ts.x - (bd.x + bd.w));
        drawWorkItemTile(x, 140, it.specRadii, it.builtRadii, null, it.hasWrench ? 'wrench' : null, false);
      } else if (tr.kind === 'inner_rework' && ts) {
        const buildInnerExitX = layout.buildInnerExitX;
        let x;
        let y;
        if (u < 0.2) {
          const p = u / 0.2;
          x = ts.cx;
          y = ts.y + ts.h + p * (INNER_LOOP_Y - (ts.y + ts.h));
        } else if (u < 0.8) {
          const p = (u - 0.2) / 0.6;
          x = ts.cx + p * (buildInnerExitX - ts.cx);
          y = INNER_LOOP_Y;
        } else {
          const p = (u - 0.8) / 0.2;
          x = buildInnerExitX;
          y = INNER_LOOP_Y - p * (INNER_LOOP_Y - (bd.y + bd.h));
        }
        drawWorkItemTile(x, y, it.specRadii, it.builtRadii, 'Rework', 'wrench', false);
      } else if (tr.kind === 'to_rollout' && ro) {
        const resolvedFromX = resolveTransitStartX(tr.fromAnchor);
        const startX =
          resolvedFromX !== undefined
            ? resolvedFromX
            : (ts && getEffectiveTestingIdx() > 0 ? ts.x + ts.w : bd.x + bd.w) + 6;
        const endX = ro.x - 6;
        const x = startX + u * (endX - startX);
        drawWorkItemTile(
          x,
          140,
          it.specRadii,
          it.builtRadii,
          null,
          it.testedPassed ? 'passed' : null,
          false
        );
      } else if (tr.kind === 'from_rollout_to_users' && ro) {
        const startX = ro.x + ro.w + 22;
        const endX = wr.x - 28;
        const x = startX + u * (endX - startX);
        const alertLbl = it.labelStatus !== 'accurate';
        drawWorkItemTile(
          x,
          140,
          it.specRadii,
          it.builtRadii,
          '"' + it.shippedLabel + '"' + (alertLbl ? '!' : ''),
          it.testedPassed ? 'passed' : null,
          alertLbl
        );
      } else if (tr.kind === 'outer_return' && ro) {
        const buildOuterExitX = layout.buildOuterExitX;
        const targetBox =
          tr.exitTarget === 'rollout'
            ? ro
            : (tr.exitTarget === 'build' ? bd : ds);
        const targetExitX =
          tr.exitTarget === 'rollout'
            ? ro.cx
            : (tr.exitTarget === 'build' ? buildOuterExitX : ds.cx);
        let x;
        let y;
        if (u < 0.16) {
          const p = u / 0.16;
          x = wr.cx;
          y = wr.y + wr.h + p * (OUTER_LOOP_Y - (wr.y + wr.h));
        } else if (u < 0.80) {
          const p = (u - 0.16) / 0.64;
          x = wr.cx + p * (targetExitX - wr.cx);
          y = OUTER_LOOP_Y;
        } else {
          const p = (u - 0.80) / 0.20;
          x = targetExitX;
          y = OUTER_LOOP_Y - p * (OUTER_LOOP_Y - (targetBox.y + targetBox.h));
        }
        const exitNames = cc.outerExitNames;
        const caption =
          tr.mode === 'diagnosed'
            ? 'Fix ' + exitNames[tr.exitTarget]
            : 'Guess: ' + exitNames[tr.exitTarget] + '?';
        drawWorkItemTile(
          x,
          y,
          it.specRadii,
          it.builtRadii,
          caption,
          tr.mode === 'diagnosed' ? 'diagnosed' : 'blind',
          tr.mode !== 'diagnosed'
        );
      } else if (tr.kind === 'from_testing_to_users' && ts) {
        const startX = ts.x + ts.w + 22;
        const endX = wr.x - 28;
        const x = startX + u * (endX - startX);
        drawWorkItemTile(x, 140, it.specRadii, it.builtRadii, '"' + it.shippedLabel + '"', 'passed', false);
      } else if (tr.kind === 'to_users') {
        const resolvedFromX = resolveTransitStartX(tr.fromAnchor);
        const startX = resolvedFromX !== undefined ? resolvedFromX : bd.x + bd.w + 22;
        const endX = wr.x - 28;
        const x = startX + u * (endX - startX);
        drawWorkItemTile(x, 140, it.specRadii, it.builtRadii, '"' + it.shippedLabel + '"', null, false);
      }
    });

    // 8. Outer Loop return pulses (visible in Chapter 6+ alongside the Outer Loop)
    if (isOuterRoutingActive()) {
      sim.returnPulses.forEach(function (rp) {
        const u = smoothstep(rp.elapsed / OUTER_RETURN_SEC);
        const px = wr.cx + u * (ds.cx - wr.cx);
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, OUTER_LOOP_Y, 6, 0, Math.PI * 2);
        ctx.fillStyle = rp.fitPct >= 75
          ? '#10b981'
          : rp.fitPct >= 52 ? '#f59e0b' : '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });
    }

    // 9. Coupled-effect spotlight halos (Chapters 2 to 8)
    drawSpotlightHalos(layout);
  }

  function getSpotlightZones(optLayout) {
    const layout = optLayout || getSceneLayout();
    const b = layout.boxes;
    const gate = getWipGateBox(layout);
    const zones = {
      worldLeft:      { shape: 'circle', cx: b.worldLeft.cx, cy: 144, r: 87 },
      connSense:      { shape: 'circle', cx: (b.worldLeft.x + b.worldLeft.w + b.discovery.x) / 2, cy: 140, r: 30 },
      wipGate:        { shape: 'pill',   cx: gate.cx,        cy: 42,  rx: Math.round(gate.w / 2) + 3, ry: 21 },
      queueDiscovery: { shape: 'pill',   cx: b.discovery.cx, cy: 42,  rx: 66, ry: 21 },
      discovery:      { shape: 'circle', cx: b.discovery.cx, cy: 140, r: 74 },
      connBuild:      { shape: 'circle', cx: (b.discovery.x + b.discovery.w + b.build.x) / 2, cy: 140, r: 30 },
      queueBuild:     { shape: 'pill',   cx: b.build.cx,     cy: 42,  rx: 66, ry: 21 },
      build:          { shape: 'circle', cx: b.build.cx,     cy: 140, r: 74 },
      worldRight:     { shape: 'circle', cx: b.worldRight.cx, cy: 144, r: 87 },
      outerLoop:      { shape: 'pill',   cx: 605, cy: 332, rx: 290, ry: 26 },
      andonWire:      { shape: 'pill',   cx: 540, cy: 13,  rx: 320, ry: 11 },
      govBar:         { shape: 'pill',   cx: 569, cy: 11,  rx: 225, ry: 10 }
    };
    if (b.testing) {
      const innerHalfSpan = (b.testing.cx - layout.buildInnerExitX) / 2;
      zones.queueTesting = { shape: 'pill', cx: b.testing.cx, cy: 42, rx: 66, ry: 21 };
      zones.testing = { shape: 'circle', cx: b.testing.cx, cy: 140, r: 74 };
      zones.innerLoop = {
        shape: 'pill',
        cx: (layout.buildInnerExitX + b.testing.cx) / 2 + 2,
        cy: 264,
        rx: Math.max(88, innerHalfSpan + 18),
        ry: 28
      };
    }
    if (b.rollout) {
      zones.queueRollout = { shape: 'pill', cx: b.rollout.cx, cy: 42, rx: 66, ry: 21 };
      zones.rollout = { shape: 'circle', cx: b.rollout.cx, cy: 140, r: 74 };
      zones.connRollout = { shape: 'circle', cx: (b.rollout.x + b.rollout.w + b.worldRight.x) / 2, cy: 140, r: 30 };
    }
    return zones;
  }

  const SPOTLIGHT_ZONES = getSpotlightZones({
    height: H,
    boxes: BOX,
    buildOuterExitX: BOX.build.x + 36,
    buildInnerExitX: BOX.build.x + 90,
    innerLoopY: INNER_LOOP_Y,
    outerLoopY: OUTER_LOOP_Y
  });

  function traceSpotlightZone(z) {
    if (z.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(z.cx, z.cy, z.r, 0, Math.PI * 2);
    } else {
      drawRoundedRect(ctx, z.cx - z.rx, z.cy - z.ry, z.rx * 2, z.ry * 2, z.ry);
    }
  }

  const SPOTLIGHT_PALETTES = {
    good: {
      fill: [16, 185, 129, 0.10],
      outer: [52, 211, 153, 0.28],
      inner: [5, 150, 105, 0.86]
    },
    warn: {
      fill: [245, 158, 11, 0.11],
      outer: [251, 191, 36, 0.28],
      inner: [217, 119, 6, 0.86]
    },
    bad: {
      fill: [239, 68, 68, 0.11],
      outer: [248, 113, 113, 0.28],
      inner: [220, 38, 38, 0.86]
    },
    preview: {
      fill: [99, 102, 241, 0.08],
      outer: [129, 140, 248, 0.24],
      inner: [79, 70, 229, 0.80]
    }
  };

  function rgbaStr(rgbAlpha, scale) {
    return (
      'rgba(' +
      rgbAlpha[0] +
      ', ' +
      rgbAlpha[1] +
      ', ' +
      rgbAlpha[2] +
      ', ' +
      (rgbAlpha[3] * scale).toFixed(3) +
      ')'
    );
  }

  function drawSpotlightHalos(layout) {
    const spec = getActiveSpotlightSpec();
    if (!spec || spec.alpha <= 0.02 || spec.zones.length === 0) return;
    const a = spec.alpha;
    const zonesMap = getSpotlightZones(layout);
    const tones = spec.zoneTones || {};

    spec.zones.forEach(function (zoneId) {
      const z = zonesMap[zoneId];
      if (!z) return;
      const toneKey = tones[zoneId] || 'preview';
      const pal = SPOTLIGHT_PALETTES[toneKey] || SPOTLIGHT_PALETTES.preview;
      ctx.save();
      traceSpotlightZone(z);
      ctx.fillStyle = rgbaStr(pal.fill, a);
      ctx.fill();

      ctx.strokeStyle = rgbaStr(pal.outer, a);
      ctx.lineWidth = 5.5;
      ctx.stroke();

      traceSpotlightZone(z);
      ctx.strokeStyle = rgbaStr(pal.inner, a);
      ctx.lineWidth = 2.0;
      if (spec.dashed) ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.restore();
    });
  }

  const api = {
    W: W,
    H: H,
    BOX: BOX,
    SPOTLIGHT_ZONES: SPOTLIGHT_ZONES,
    getSceneLayout: getSceneLayout,
    getSpotlightZones: getSpotlightZones,
    resolveTransitStartX: resolveTransitStartX,
    setupCanvasResolution: setupCanvasResolution,
    renderCanvas: renderCanvas,
    isEmptyStationPreviewEnabled: function () {
      return enableEmptyStationPreview;
    },
    setEmptyStationPreviewEnabled: function (flag) {
      enableEmptyStationPreview = Boolean(flag);
    }
  };

  if (typeof window !== 'undefined') {
    window.CyberneticDiagramView = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
