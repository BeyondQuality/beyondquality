// Product Work as a Cybernetic System: Read-Only Regimes, Chapters, & Dual-Language Copy

(function () {
  'use strict';

  const MAX_BUILT_CHAPTER = 8;

  const SHAPE_KEYS = ['CIRCLE', 'STAR', 'TRIANGLE', 'SQUARE', 'CROSS', 'OVAL'];

  const COUSIN_LABEL = {
    CIRCLE: 'OVAL',
    OVAL: 'CIRCLE',
    SQUARE: 'CROSS',
    CROSS: 'SQUARE',
    STAR: 'TRIANGLE',
    TRIANGLE: 'STAR'
  };

  const HYPE_LABEL = {
    CIRCLE: 'TRIANGLE',
    OVAL: 'STAR',
    SQUARE: 'STAR',
    CROSS: 'TRIANGLE',
    STAR: 'SQUARE',
    TRIANGLE: 'OVAL'
  };

  const DRIFT_REGIMES = [
    { label: 'Calm', cycleSec: 24.0 },
    { label: 'Moderate', cycleSec: 10.5 },
    { label: 'Rapid', cycleSec: 5.4 },
    { label: 'Turbulent', cycleSec: 3.1 }
  ];

  const SHOCK_REGIMES = [
    { label: 'Off', intervalSec: Infinity },
    { label: 'Occasional', intervalSec: 14.5 },
    { label: 'Frequent', intervalSec: 8.2 },
    { label: 'Stormy', intervalSec: 5.4 }
  ];

  const DEMAND_REGIMES = [
    { label: 'Trickle', intervalSec: 3.20 },
    { label: 'Steady', intervalSec: 2.00 },
    { label: 'Busy', intervalSec: 1.05 },
    { label: 'Flooded', intervalSec: 0.62 }
  ];

  const WIP_REGIMES = [
    { label: 'One at a time (1)', maxWip: 1 },
    { label: 'Tight (3)', maxWip: 3 },
    { label: 'Loose (12)', maxWip: 12 },
    { label: 'Uncapped', maxWip: 18 }
  ];

  const DISCOVERY_REGIMES = [
    { label: 'Thin slice', sec: 0.8, noiseFactor: 1.00 },
    { label: 'Sufficient', sec: 1.8, noiseFactor: 0.76 },
    { label: 'Exhaustive', sec: 3.8, noiseFactor: 0.66 },
    { label: 'Paralysis', sec: 6.8, noiseFactor: 0.62 }
  ];

  const BUILD_REGIMES = [
    { label: 'Small slice', sec: 0.8, batchNoiseMult: 1.00, pairPenaltyMult: 1.00 },
    { label: 'Medium batch', sec: 1.8, batchNoiseMult: 1.00, pairPenaltyMult: 1.00 },
    { label: 'Large batch', sec: 3.8, batchNoiseMult: 1.25, pairPenaltyMult: 2.10 },
    { label: 'Mega-batch', sec: 6.2, batchNoiseMult: 1.45, pairPenaltyMult: 2.85 }
  ];

  const NOISE_REGIMES = [
    { label: 'None', level: 0.0 },
    { label: 'Mild', level: 0.25 },
    { label: 'Moderate', level: 0.52 },
    { label: 'Heavy', level: 0.82 }
  ];

  const TESTING_REGIMES = [
    { label: 'Off', sec: 0.0, threshold: 0.0 },
    { label: 'Light', sec: 0.5, threshold: 0.21 },
    { label: 'Standard', sec: 0.9, threshold: 0.66 },
    { label: 'Strict', sec: 1.4, threshold: 0.82 }
  ];

  const REACH_REGIMES = [
    { label: 'Silent (25%)', scale: 0.36, reachFactor: 0.25, sec: 0.15 },
    { label: 'Narrow (60%)', scale: 0.66, reachFactor: 0.60, sec: 0.25 },
    { label: 'Broad (85%)', scale: 0.86, reachFactor: 0.85, sec: 0.40 },
    { label: 'Full (100%)', scale: 1.0, reachFactor: 1.0, sec: 0.55 }
  ];

  const MESSAGING_NOISE_REGIMES = [
    { label: 'Accurate', level: 0.0 },
    { label: 'Slight spin', level: 0.32 },
    { label: 'Confusing', level: 0.60 },
    { label: 'Pure hype', level: 0.90 }
  ];

  const SIM_DAYS_PER_SEC = 2;

  const DAMPENER_DISCOVERY_ADD_SEC = 0.9;
  const DAMPENER_DISCOVERY_FACTOR = 0.18;

  const DAMPENER_BUILD_ADD_SEC = 0.0;
  const DAMPENER_BUILD_FACTOR = 0.16;

  const ROLLOUT_BASE_SEC = 0.55;
  const DAMPENER_ROLLOUT_ADD_SEC = 0.5;
  const DAMPENER_ROLLOUT_FACTOR = 0.12;

  const REWORK_NOISE_FACTOR = 0.06;
  const MAX_REWORK_PASSES = 2;
  const MAX_OUTER_RETURNS = 2;

  const TRANSIT_SENSE = 0.32;
  const TRANSIT_TO_BUILD = 0.32;
  const TRANSIT_TO_TESTING = 0.28;
  const TRANSIT_TO_ROLLOUT = 0.28;
  const TRANSIT_ROLLOUT_TO_USERS = 0.34;
  const DIAGNOSTIC_OBSERVE_ADD_SEC = 0.35;
  const TRANSIT_TESTING_TO_USERS = 0.45;
  const TRANSIT_IDEAL_GATES = 0.62;
  const INNER_REWORK_SEC = 0.72;
  const OUTER_BLIND_RETURN_SEC = 1.40;
  const OUTER_DIAG_RETURN_SEC = 1.25;
  const OUTCOME_HOLD_SEC = 1.35;
  const OUTER_RETURN_SEC = 0.52;

  const SETTING_KEY_TO_CONTROL = {
    demandIdx: 'demand',
    wipIdx: 'wip',
    driftIdx: 'drift',
    shockIdx: 'shock',
    discoveryIdx: 'discovery',
    buildIdx: 'build',
    build10x: 'build10x',
    discoveryNoiseIdx: 'discoveryNoise',
    discoveryDampener: 'discoveryDampener',
    buildNoiseIdx: 'buildNoise',
    buildDampener: 'buildDampener',
    testingIdx: 'testing',
    reachIdx: 'reach',
    messagingNoiseIdx: 'messagingNoise',
    rolloutDampener: 'rolloutDampener',
    diagnosticChannel: 'diagnostic',
    andonCord: 'andon'
  };

  // Stories and Lessons strictly use real-world domain language (enforced by verify.js).
  const CHAPTERS = {
    1: {
      tabName: 'Adaptation Time',
      tabCyberneticsName: 'Relaxation Time',
      heading: 'Chapter 1: Adaptation Time (The 45-Second Hotel Shower)',
      cyberneticsHeading: 'Chapter 1: Relaxation Time & Transport Lag (Systems 4 & 1)',
      storyHtml:
        '<p>Imagine adjusting an old hotel shower where turning the tap takes 45 seconds to change the water temperature at the showerhead. You feel freezing water, crank it hot, wait 15 seconds, find it still freezing, crank it further, get scalded, and yank it back to cold. You never stabilise because the delay in your feedback loop blinds you to the effect of each adjustment until it is too late.</p>' +
        '<p>A product company faces the same lag constraint against a changing market. Its round-trip duration from noticing a market need, through <strong>Discovery</strong> (writing the Spec) and <strong>Build</strong>, to observing real users is its <strong>adaptation time</strong>. Even when market diagnosis is 100% accurate and code has zero bugs, starting work today means delivering into the world of <strong>today + adaptation time</strong>.</p>',
      lessonTitle: 'Chapter 1 Lesson',
      lessonText:
        'Delay alone wrecks steering: when exhaustive upfront study or oversized build batches stretch your adaptation time past the market\'s pace of change, faultless research still ships an answer to yesterday\'s problem; keeping pace requires shipping thin vertical slices rather than rushing people.',
      cyberneticsHtml:
        '<p>In <em>Designing Freedom</em> (1974), Stafford Beer defines an organisation\'s <strong>relaxation time</strong> (adaptation time) as the round-trip duration a disturbed system needs to register an environmental shift, act, and settle back into equilibrium. Whenever the typical interval between external shifts drops below that relaxation time, the regulator responds to vanished states of the environment and fails to stabilise.</p>' +
        '<p>In cybernetics, <strong>variety</strong> means the range of distinct states or situations in play, and Beer\'s <strong>Viable System Model (VSM)</strong> numbers <strong>Systems 1 to 5</strong> by regulatory role rather than pipeline sequence (<code>1</code> delivery operations, <code>2</code> flow coordination, <code>3</code> &amp; <code>3*</code> internal control and audit, <code>4</code> outward intelligence, <code>5</code> policy governance), which is why work along the path enters through System 2 pacing and System 4 sensing before System 1 builds it. Here <strong>System 4</strong> (<code>Intelligence</code>, outward-looking sensing in Discovery) samples the high-variety environment and freezes a model (the Spec) at time <em>t</em>, while <strong>System 1</strong> (<code>Operations</code>, engineering Build) spends duration <em>T</em> constructing the output that lands at <em>t + T</em>. Unlike a closed-loop thermostat (where delayed control actions alter the variable itself and cause back-and-forth over-correction), the external environment here changes independently while post-release rework is still switched off, so Chapter 1 isolates pure <strong>transport lag</strong>: aiming at the state of <em>t</em> and arriving at <em>t + T</em> after the environment has changed (closed-loop rework enters in Chapters 6 and 7).</p>',
      cyberneticsLessonText:
        'When total relaxation time across System 4 sensing and System 1 execution exceeds the environment\'s interval of change, even noiseless regulation delivers responses tuned to a vanished state of the world.',
      defaults: {
        demandIdx: 1,
        wipIdx: 0,
        driftIdx: 2,
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
        diagnosticChannel: false
      },
      presets: [
        {
          label: 'Analysis paralysis (default)',
          cyberneticsLabel: 'Excessive relaxation time (default)',
          values: { driftIdx: 2, discoveryIdx: 3, buildIdx: 1 }
        },
        {
          label: 'Nimble loop (in sync)',
          cyberneticsLabel: 'Matched relaxation time (stable)',
          values: { driftIdx: 1, discoveryIdx: 0, buildIdx: 0 }
        },
        {
          label: 'Turbulent market vs slow build',
          cyberneticsLabel: 'Rapid disturbance vs System 1 lag',
          values: { driftIdx: 3, discoveryIdx: 0, buildIdx: 2 }
        }
      ],
      nextButtonLabel: 'Next: Chapter 2 (Handoff Noise) \u2192',
      cyberneticsNextLabel: 'Next: Chapter 2 (Transducers) \u2192'
    },

    2: {
      tabName: 'Handoff Noise',
      tabCyberneticsName: 'Transducers',
      heading: 'Chapter 2: Handoff Noise (Drawing a Bicycle from Memory)',
      cyberneticsHeading: 'Chapter 2: Transducers, Attenuation, & Channel Capacity',
      storyHtml:
        '<p>Psychologist Rebecca Lawson <a href="https://www.scotthyoung.com/blog/2015/12/22/illusion-of-explanatory-depth/" target="_blank" rel="noopener noreferrer">asked people to sketch a bicycle from memory</a>, and almost everybody happily drew a complete bicycle that could never roll: pedals bolted to the front hub, chains looping nowhere, frame tubes missing the rear wheel altogether (later rendered in 3D by designer Gianluca Gimini). Everyone has seen thousands of bicycles, yet turning a real object into a sketch from memory twists the shape.</p>' +
        '<p>Product handoffs distort work the same way. In <strong>Discovery</strong>, messy customer needs get turned into a written Spec; in <strong>Build</strong>, an engineer or coding agent reads that ticket asynchronously and guesses the missing details. Trying to fix that by writing a massive upfront specification drags you straight back into Chapter 1\'s trap (past a modest threshold of sufficient information, extra paper study hits steep diminishing returns while stretching Discovery into paralysis). Teams cut distortion directly by watching real users during Discovery (spending upfront research time) and sitting together on small slices during Build (pairing, focusing two people on one bet at a time as teams already do during a live incident) to keep the product true to need.</p>',
      lessonTitle: 'Chapter 2 Lesson',
      lessonText:
        'Every handoff loses detail and invents assumptions: working from written tickets alone ships complete-looking features bent out of shape, whereas watching real users (costing Discovery time) and pairing (focusing two people on one stream) keep intent intact.',
      cyberneticsHtml:
        '<p>In <em>Brain of the Firm</em> (1972) and <em>The Heart of Enterprise</em> (1979), Stafford Beer models every boundary crossing between subsystems that encode state in different media (environmental state into a Discovery Spec, Spec into Build code) as a <strong>transducer</strong>. By Ashby\'s <strong>Law of Requisite Variety</strong> and Shannon\'s noisy-channel coding theorem, any transducer whose channel capacity is narrower than the variety that matters drops essential signal (attenuation loss) and injects ambiguity (transducer noise).</p>' +
        '<p>By the <strong>Conant-Ashby theorem</strong> (1970), every effective regulator of a system must contain an accurate model of that system: System 1 cannot restore external variety that System 4 discarded when encoding its model, while attempting to eliminate ambiguity through exhaustive upfront modelling inflates relaxation time back into Chapter 1\'s lag trap. Direct environmental observation in System 4 (watching real users during Discovery, adding sensing lag) and synchronous closed-loop redundancy in System 1 (pairing during Build, concentrating two people onto one stream) widen channel capacity without inflating upfront modelling lag.</p>',
      cyberneticsLessonText:
        'Every narrow transducer across System 4 and System 1 drops variety and injects noise; preserving requisite variety requires widening the channel through direct observation and synchronous redundancy rather than inflating upfront modelling lag.',
      defaults: {
        demandIdx: 1,
        wipIdx: 0,
        driftIdx: 0,
        discoveryIdx: 0,
        buildIdx: 0,
        build10x: false,
        discoveryNoiseIdx: 2,
        discoveryDampener: false,
        buildNoiseIdx: 3,
        buildDampener: false,
        testingIdx: 0,
        reachIdx: 3,
        messagingNoiseIdx: 0,
        rolloutDampener: false,
        diagnosticChannel: false
      },
      presets: [
        {
          label: 'Leaky async handoffs (default)',
          cyberneticsLabel: 'Narrow noisy transducers (default)',
          values: {
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            discoveryNoiseIdx: 2,
            discoveryDampener: false,
            buildNoiseIdx: 3,
            buildDampener: false
          }
        },
        {
          label: 'Observed + paired (clean)',
          cyberneticsLabel: 'Widened + redundant channels (clean)',
          values: {
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            discoveryNoiseIdx: 2,
            discoveryDampener: true,
            buildNoiseIdx: 3,
            buildDampener: true
          }
        },
        {
          label: 'Wrong problem, clean code',
          cyberneticsLabel: 'Corrupted Sys 4 model, noiseless Sys 1',
          values: {
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            discoveryNoiseIdx: 3,
            discoveryDampener: false,
            buildNoiseIdx: 0,
            buildDampener: false
          }
        },
        {
          label: '"Huge upfront spec" trap',
          cyberneticsLabel: 'Over-modelled Sys 4 lag trap',
          values: {
            driftIdx: 1,
            discoveryIdx: 3,
            buildIdx: 1,
            discoveryNoiseIdx: 2,
            discoveryDampener: false,
            buildNoiseIdx: 2,
            buildDampener: false
          }
        }
      ],
      prevButtonLabel: '\u2190 Chapter 1 (Adaptation Time)',
      cyberneticsPrevLabel: '\u2190 Chapter 1 (Relaxation Time)',
      nextButtonLabel: 'Next: Chapter 3 (Testing\'s Blind Spot) \u2192',
      cyberneticsNextLabel: 'Next: Chapter 3 (System 3* Audit) \u2192'
    },

    3: {
      tabName: 'Testing\'s Blind Spot',
      tabCyberneticsName: 'System 3* Audit',
      heading: 'Chapter 3: Testing\'s Blind Spot (The Noisy Cafe & the Kitchen Pass)',
      cyberneticsHeading: 'Chapter 3: Internal Homeostasis (System 3 & 3*) & Type III Error',
      storyHtml:
        '<p>A diner in a loud cafe orders <strong>grilled salmon, no butter</strong>. Across the noisy room, the waiter mishears and writes <strong>grilled steak with garlic butter</strong> on the kitchen ticket. On the grill, the cook gets distracted and burns the steak. At the kitchen pass stands the head chef, inspecting every plate strictly against its paper ticket before it leaves the kitchen. Seeing the charred steak, the chef calls <em>"Re-fire"</em>! and sends it back to the grill. Ten minutes later, a second steak arrives cooked to perfection, matching the ticket down to the garnish. The chef approves it, rings the bell, and sends a five-star plate out to a diner who cannot eat beef or dairy.</p>' +
        '<p>Post-build <strong>Testing</strong> works like that head chef at the pass: it checks the built product strictly against the <strong>written Spec</strong>, with no direct view of what the <strong>Outside World</strong> actually needed. When <strong>Build</strong> introduces coding defects, testing catches the mismatch and routes the item back along the <strong>Inner Loop</strong> to be reworked, adding delay. When <strong>Discovery</strong> misread the market or wrote a flawed Spec, strict testing enforces that flawed Spec, marks the item <strong>Passed</strong>, and ships it straight into a failed outcome. Preventing misread needs and coding defects upstream inside <strong>Discovery</strong> and <strong>Build</strong> is proactive <strong>Quality Assurance</strong>; post-build <strong>Testing</strong> only inspects finished work at the pass.</p>',
      lessonTitle: 'Chapter 3 Lesson',
      lessonText:
        'Testing after Build can only check whether Build matched the written Spec (catching coding defects at the price of rework delay); it cannot save you from noise entering earlier in Discovery, because testing treats a flawed Spec as the standard of correctness.',
      cyberneticsHtml:
        '<p>Inside Stafford Beer\'s Viable System Model, <strong>System 3</strong> governs "inside-and-now" internal control (adopting the operational plan agreed with <strong>System 4</strong>, allocating <strong>System 1</strong> capacity, and enforcing delivery standards), while <strong>System 3*</strong> (<code>Audit</code>, post-build Testing) is its direct inspection channel checking actual System 1 output rather than relying on status reports (in Beer\'s classic VSM a sporadic spot-audit, turned in software pipelines into a per-release Testing gate from light smoke checks up to strict full verification). Together, Systems 3 and 3* close a strictly internal homeostat: System 3* compares System 1 output (<code>Operations</code> / Build) against the internal norm adopted from System 4 (<code>Intelligence</code> / Spec), without any direct sensory link to the external environment.</p>' +
        '<p>When System 1 introduces operational defects against a sound plan, System 3* flags the discrepancy so System 3 routes the item around the internal rework loop at the cost of appraisal and rework delay. When System 4\'s model of the environment is already distorted, strict System 3 / 3* control enforces that flawed norm as the standard of correctness, producing Russell Ackoff\'s <strong>Type III error</strong> (<em>solving the wrong problem precisely</em>) while stretching total relaxation time.</p>',
      cyberneticsLessonText:
        'System 3 and its System 3* audit channel regulate internal conformance (checking actual System 1 output against System 4\'s adopted plan) at the price of rework lag, and remain structurally blind to upstream model corruption in System 4.',
      defaults: {
        demandIdx: 1,
        wipIdx: 0,
        driftIdx: 0,
        discoveryIdx: 0,
        buildIdx: 0,
        build10x: false,
        discoveryNoiseIdx: 3,
        discoveryDampener: false,
        buildNoiseIdx: 2,
        buildDampener: false,
        testingIdx: 3,
        reachIdx: 3,
        messagingNoiseIdx: 0,
        rolloutDampener: false,
        diagnosticChannel: false
      },
      presets: [
        {
          label: 'Strict testing on wrong Spec (default)',
          cyberneticsLabel: 'Type III error: Sys 3* on bad model (default)',
          values: {
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            discoveryNoiseIdx: 3,
            discoveryDampener: false,
            buildNoiseIdx: 2,
            buildDampener: false,
            testingIdx: 3
          }
        },
        {
          label: 'Clean Spec + buggy Build (testing rescues)',
          cyberneticsLabel: 'Sound model + noisy Sys 1 (Sys 3* fix)',
          values: {
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 3,
            buildDampener: false,
            testingIdx: 3
          }
        },
        {
          label: 'Rework delay in a rapid market',
          cyberneticsLabel: 'Rework lag under rapid drift',
          values: {
            driftIdx: 2,
            discoveryIdx: 0,
            buildIdx: 0,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 3,
            buildDampener: false,
            testingIdx: 3
          }
        },
        {
          label: 'Prevent at source (observe + pair)',
          cyberneticsLabel: 'Redundancy at source (zero rework)',
          values: {
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            discoveryNoiseIdx: 3,
            discoveryDampener: true,
            buildNoiseIdx: 3,
            buildDampener: true,
            testingIdx: 2
          }
        }
      ],
      prevButtonLabel: '\u2190 Chapter 2 (Handoff Noise)',
      cyberneticsPrevLabel: '\u2190 Chapter 2 (Transducers)',
      nextButtonLabel: 'Next: Chapter 4 (Queues & Bottlenecks) \u2192',
      cyberneticsNextLabel: 'Next: Chapter 4 (System 2 & Queues) \u2192'
    },

    4: {
      tabName: 'Queues & Bottlenecks',
      tabCyberneticsName: 'System 2 & Queues',
      heading: 'Chapter 4: Queues & Bottlenecks (20 Kiosks Feeding One X-Ray Scanner)',
      cyberneticsHeading: 'Chapter 4: System 2 Coordination, Little\'s Law, & Rework Amplification',
      storyHtml:
        '<p>Trying to cut human labour costs, an airport replaces its staffed check-in desks with twenty instant self-serve kiosks, while keeping a single staffed X-ray scanner at security (because security cannot be made "self-serve": letting travellers certify their own bags defeats the entire purpose of checking them). Travellers print boarding passes in ten seconds flat, nobody at a desk reminds them to empty their water bottles, and everyone walks straight into a two-hour queue at the lone X-ray scanner. Flagged bags get sent back to unpack and join that crowded queue a second time, the overworked scanner officer gets blamed for the hold-up, and more people miss their flights than before.</p>' +
        '<p>Software organisations walk into this exact trap whenever they optimise one stage in isolation: a 2015 team hiring fifteen developers to one tester, or a team today multiplying <strong>Build</strong> throughput tenfold to save coding effort, speeds up the step that is easy to scale while <strong>independent Testing</strong> (which cannot simply let the build certify itself) and handoff noise stay unchanged. Longer queues mean every item waits longer to ship, and defective items bouncing back from Testing flood those already-crowded queues all over again. Because the <strong>Outside World</strong> keeps changing while items sit in line, releasing later turns even accurately researched Specs into stale, market-unfit launches. Leadership cannot stop customers and stakeholders from requesting new work, yet setting a strict internal <strong>WIP limit</strong> holds unstarted requests outside the pipeline until an active bet finishes, keeping queues short and shipped work fresh.</p>',
      lessonTitle: 'Chapter 4 Lesson',
      lessonText:
        'Teams cannot wish away incoming demand, yet admitting uncapped work or multiplying Build speed ahead of slower Testing piles up queues that rework floods a second time; enforcing an internal WIP limit holds excess requests outside the gate so started bets finish fresh instead of going stale in line.',
      cyberneticsHtml:
        '<p>In Stafford Beer\'s Viable System Model, external demand arrives from the environment outside management\'s decree, whereas damping inter-stage queues and capping concurrent operational streams across shared capacity is the internal governance role of <strong>System 2</strong> (anti-oscillatory coordination and Flow &amp; WIP limits). By <strong>Little\'s Law</strong>, mean waiting time scales with work-in-progress divided by bottleneck throughput, so accelerating System 1 construction (Build) tenfold ahead of an unchanged independent System 3* audit channel (Testing) without a System 2 WIP cap simply piles inventory in front of the audit bottleneck.</p>' +
        '<p>Because System 3* cannot be collapsed into self-certification by System 1 without abolishing independent audit, uncoordinated local speedups compound with transducer noise: a rejected share <code>r(n)</code> loops back to consume Build and Testing capacity a second time, raising effective load per incoming bet to <code>1 + r(n)</code> and pushing bottleneck queues past capacity. Enforcing a tight System 2 WIP limit buffers excess demand outside the committed loop (trading raw intake volume for bounded queue residence) so active items complete within the environment\'s interval of change.</p>',
      cyberneticsLessonText:
        'External arrival pressure cannot be abolished by decree, whereas an internal System 2 WIP limit caps concurrent inventory in flight so bottleneck queues and rework amplification cannot stretch relaxation time past environmental drift.',
      defaults: {
        demandIdx: 2,
        wipIdx: 3,
        driftIdx: 1,
        discoveryIdx: 0,
        buildIdx: 1,
        build10x: true,
        discoveryNoiseIdx: 0,
        discoveryDampener: false,
        buildNoiseIdx: 3,
        buildDampener: false,
        testingIdx: 3,
        reachIdx: 3,
        messagingNoiseIdx: 0,
        rolloutDampener: false,
        diagnosticChannel: false
      },
      presets: [
        {
          label: '10x Build into 1x Testing (default)',
          cyberneticsLabel: '10x Sys 1 into 1x Sys 3*, uncapped WIP (default)',
          values: {
            demandIdx: 2,
            wipIdx: 3,
            driftIdx: 1,
            discoveryIdx: 0,
            buildIdx: 1,
            build10x: true,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 3,
            buildDampener: false,
            testingIdx: 3
          }
        },
        {
          label: 'Tight WIP limit + paired Build (queues clear)',
          cyberneticsLabel: 'System 2 WIP limit + Sys 1 redundancy',
          values: {
            demandIdx: 2,
            wipIdx: 1,
            driftIdx: 1,
            discoveryIdx: 0,
            buildIdx: 1,
            build10x: true,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 3,
            buildDampener: true,
            testingIdx: 2
          }
        },
        {
          label: 'Flooded backlog (even with zero bugs)',
          cyberneticsLabel: 'Uncapped WIP under flooded demand (zero defects)',
          values: {
            demandIdx: 3,
            wipIdx: 3,
            driftIdx: 1,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 0,
            buildDampener: false,
            testingIdx: 3
          }
        }
      ],
      prevButtonLabel: '\u2190 Chapter 3 (Testing\'s Blind Spot)',
      cyberneticsPrevLabel: '\u2190 Chapter 3 (System 3* Audit)',
      nextButtonLabel: 'Next: Chapter 5 (Rollout & Messaging) \u2192',
      cyberneticsNextLabel: 'Next: Chapter 5 (Amplification) \u2192'
    },

    5: {
      tabName: 'Rollout & Messaging',
      tabCyberneticsName: 'Amplification',
      heading: 'Chapter 5: Rollout & Messaging (The Mislabelled Pasta-Sauce Tin)',
      cyberneticsHeading: 'Chapter 5: Variety Amplification & Output-Boundary Transduction',
      storyHtml:
        '<p>Suppose a food company researches what home cooks want and cooks a genuinely rich crushed-tomato pasta sauce. Between the factory floor and the supermarket shelf, two common habits can still wreck it. An engineering-led team assumes <em>"good food sells itself"</em> and stacks plain, unlabelled silver tins on a bottom back-aisle pallet, so shoppers looking for pasta sauce walk right past without ever noticing it. A hype-driven marketing team chases whatever trend is hot this quarter and prints <strong>"SPICY THAI CURRY"</strong> across the label to grab attention: now pasta-sauce shoppers skip the tin, while curry buyers take it home, open it over dinner, taste plain tomato, and throw it out angry. Not one drop of sauce inside the tin changed, yet from the buyer\'s side of the shelf the product failed completely.</p>' +
        '<p>Software crosses that same final boundary after <strong>Testing</strong> through positioning, pricing pages, documentation, and onboarding (<strong>Rollout</strong>). Even when <strong>Discovery</strong>, <strong>Build</strong>, and <strong>Testing</strong> deliver clean software right when the market needs it, shipping silently (burying a feature three menus deep with no docs or announcement) means almost nobody in the target market ever discovers or adopts it. Letting hype marketing or sloppy documentation promise a different capability than what was built leaves the compiled code untouched while destroying real-world fit through false expectations: users who needed the real feature walk past it, and users who bought the pitch churn disappointed. Investing in distribution reach and checking messaging and docs against what was actually built close both gaps at a modest rollout cost.</p>',
      lessonTitle: 'Chapter 5 Lesson',
      lessonText:
        'Bug-free software built for a real market need still fails at the last metre if silent rollout leaves it undiscovered or misleading positioning promises users something different from what is inside.',
      cyberneticsHtml:
        '<p>In Stafford Beer\'s variety hourglass, an organisation attenuates high environmental variety into a low-variety operational plan to build one coherent artefact, and must then perform the inverse operation at deployment: <strong>variety amplification</strong> (Rollout: positioning, docs, and onboarding), projecting that single System 1 output back across a high-variety population of external users.</p>' +
        '<p>That outward projection simultaneously acts as an output-boundary <strong>transducer</strong> encoding what the artefact does into the environment\'s language. Omitting amplification leaves effective reach near zero despite sound internal engineering; corrupting the output transducer mismatches external expectations against the unchanged operational artefact, destroying environmental fit at the final boundary.</p>',
      cyberneticsLessonText:
        'Operational conformance inside Systems 1 and 3* cannot achieve environmental fit unless output-side variety amplification reaches the target population and output transduction accurately encodes what was built.',
      defaults: {
        demandIdx: 1,
        wipIdx: 0,
        driftIdx: 0,
        discoveryIdx: 0,
        buildIdx: 0,
        build10x: false,
        discoveryNoiseIdx: 0,
        discoveryDampener: false,
        buildNoiseIdx: 0,
        buildDampener: false,
        testingIdx: 2,
        reachIdx: 3,
        messagingNoiseIdx: 3,
        rolloutDampener: false,
        diagnosticChannel: false
      },
      presets: [
        {
          label: 'Hype label on clean code (default)',
          cyberneticsLabel: 'Corrupted output transducer (default)',
          values: {
            demandIdx: 1,
            wipIdx: 0,
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 0,
            buildDampener: false,
            testingIdx: 2,
            reachIdx: 3,
            messagingNoiseIdx: 3,
            rolloutDampener: false
          }
        },
        {
          label: 'Silent launch ("good code sells itself")',
          cyberneticsLabel: 'Missing variety amplification (minimal reach)',
          values: {
            demandIdx: 1,
            wipIdx: 0,
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 0,
            buildDampener: false,
            testingIdx: 2,
            reachIdx: 0,
            messagingNoiseIdx: 0,
            rolloutDampener: false
          }
        },
        {
          label: 'Verified messaging & docs + full reach',
          cyberneticsLabel: 'Verified output transduction + full amplification',
          values: {
            demandIdx: 1,
            wipIdx: 0,
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 0,
            buildDampener: false,
            testingIdx: 2,
            reachIdx: 3,
            messagingNoiseIdx: 3,
            rolloutDampener: true
          }
        }
      ],
      prevButtonLabel: '\u2190 Chapter 4 (Queues & Bottlenecks)',
      cyberneticsPrevLabel: '\u2190 Chapter 4 (System 2 & Queues)',
      nextButtonLabel: 'Next: Chapter 6 (Fault Isolation) \u2192',
      cyberneticsNextLabel: 'Next: Chapter 6 (Credit Assignment) \u2192'
    },

    6: {
      tabName: 'Fault Isolation',
      tabCyberneticsName: 'Credit Assignment',
      heading: 'Chapter 6: Fault Isolation (The Bakery Owner & the Nightly Till Number)',
      cyberneticsHeading: 'Chapter 6: Credit Assignment & Requisite Diagnostic Variety',
      storyHtml:
        '<p>An absentee bakery owner never visits the shop and manages strictly from a single nightly text message: <strong>total takings at the till</strong>. One Friday evening the number drops 40%. That single datapoint is completely real, and completely useless for deciding what to fix: did customers dislike the new pastry recipe (<strong>Discovery</strong>), did the morning baker pull undercooked trays from the oven (<strong>Build</strong>), or did council roadworks put scaffolding across the shopfront sign so passers-by assumed the bakery was closed (<strong>Rollout</strong>)? Guessing from the till total alone, the owner fires the baker and scraps the recipe while the front door stays hidden behind scaffolding.</p>' +
        '<p>Software teams guess blind the same way when their only signal from the market is a single summary metric such as <em>"churn stayed high"</em> or <em>"adoption missed target"</em>. Dashboards sit effortlessly on screens, whereas watching real users work takes deliberate effort. Faced with a blunt failure number, each group guesses through its own lens: leadership tells <strong>Rollout</strong> to push harder on marketing when <strong>Discovery</strong> solved the wrong problem, or scraps a genuinely needed capability and restarts <strong>Discovery</strong> and <strong>Build</strong> from scratch when only confusing onboarding or one escaped coding defect blocked adoption. Maintaining a direct diagnostic channel (watching real users struggle and speaking with them) isolates which stage actually failed so rework routes straight to <strong>Rollout</strong>, <strong>Build</strong>, or <strong>Discovery</strong>.</p>',
      lessonTitle: 'Chapter 6 Lesson',
      lessonText:
        'Summary failure metrics tell you a launch missed without telling you why; without direct user observation to isolate the fault, teams waste whole cycles reworking the wrong stage.',
      cyberneticsHtml:
        '<p>In cybernetics and control theory, determining which internal subsystem caused an observed external error is the <strong>credit-assignment (fault-isolation) problem</strong>. A scalar summary telemetry signal carries roughly <strong>one bit of variety</strong>: it registers deviation on the Outer Loop without encoding whether the loss originated in System 4\'s environmental model, an escaped System 1 defect, or output-transducer distortion in amplification.</p>' +
        '<p>By Ashby\'s <strong>Law of Requisite Variety</strong>, a 1-bit feedback channel lacks the capacity to regulate a multi-stage cascade, forcing the System 3 / System 4 homeostat into blind trial-and-error oscillations across healthy subsystems. Opening a high-variety <strong>diagnostic channel</strong> (watching real users post-launch) through direct post-release observation in context isolates whether the fault lies in <code>Amplification</code> (Rollout), <code>System 1</code> (Build), or <code>System 4</code> (Discovery, sending wrong-model bets back to System 4\'s upstream <strong>horizon channel</strong>, which scans shifting needs outside yesterday\'s build).</p>',
      cyberneticsLessonText:
        'By Ashby\'s Law of Requisite Variety, scalar 1-bit outcome telemetry cannot isolate faults across a multi-stage regulator; targeted Outer Loop correction requires a high-variety diagnostic channel back from real use.',
      defaults: {
        demandIdx: 1,
        wipIdx: 0,
        driftIdx: 0,
        discoveryIdx: 0,
        buildIdx: 0,
        build10x: false,
        discoveryNoiseIdx: 0,
        discoveryDampener: false,
        buildNoiseIdx: 0,
        buildDampener: false,
        testingIdx: 2,
        reachIdx: 3,
        messagingNoiseIdx: 2,
        rolloutDampener: false,
        diagnosticChannel: false
      },
      presets: [
        {
          label: 'Summary metric: blind guessing (default)',
          cyberneticsLabel: '1-bit metric: blind guessing (default)',
          values: {
            demandIdx: 1,
            wipIdx: 0,
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 0,
            buildDampener: false,
            testingIdx: 2,
            reachIdx: 3,
            messagingNoiseIdx: 2,
            rolloutDampener: false,
            diagnosticChannel: false
          }
        },
        {
          label: 'Watch real users: isolates Rollout',
          cyberneticsLabel: 'Diagnostic channel: isolates Amplify',
          values: {
            demandIdx: 1,
            wipIdx: 0,
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 0,
            buildDampener: false,
            testingIdx: 2,
            reachIdx: 3,
            messagingNoiseIdx: 2,
            rolloutDampener: false,
            diagnosticChannel: true
          }
        },
        {
          label: '"Marketing push" on a wrong Spec',
          cyberneticsLabel: '1-bit mis-routing on bad Sys 4 model',
          values: {
            demandIdx: 1,
            wipIdx: 0,
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 3,
            discoveryDampener: false,
            buildNoiseIdx: 0,
            buildDampener: false,
            testingIdx: 2,
            reachIdx: 3,
            messagingNoiseIdx: 0,
            rolloutDampener: false,
            diagnosticChannel: false
          }
        },
        {
          label: 'Escaped bug: isolates Build hotfix',
          cyberneticsLabel: 'Diagnostic channel: isolates Sys 1',
          values: {
            demandIdx: 1,
            wipIdx: 0,
            driftIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 0,
            discoveryDampener: false,
            buildNoiseIdx: 3,
            buildDampener: false,
            testingIdx: 1,
            reachIdx: 3,
            messagingNoiseIdx: 0,
            rolloutDampener: false,
            diagnosticChannel: true
          }
        }
      ],
      prevButtonLabel: '\u2190 Chapter 5 (Rollout & Messaging)',
      cyberneticsPrevLabel: '\u2190 Chapter 5 (Amplification)',
      nextButtonLabel: 'Next: Chapter 7 (Rogue Waves & the Andon Cord) \u2192',
      cyberneticsNextLabel: 'Next: Chapter 7 (Algedonic Channel) \u2192'
    },

    7: {
      tabName: 'Rogue Waves',
      tabCyberneticsName: 'Algedonic Channel',
      heading: 'Chapter 7: Rogue Waves & the Andon Cord (Why Smooth Hospitals Need a Major-Incident Alarm)',
      cyberneticsHeading: 'Chapter 7: The Algedonic Pre-emption Channel',
      storyHtml:
        '<p>Imagine a well-run hospital where doctors conduct thorough daily ward rounds, collaborate closely across rooms, verify treatments carefully, watch patient recovery closely, and schedule routine admissions smoothly to match normal room capacity. On a normal changing day, waiting lines stay near zero and patients recover well. Even so, every department keeps a red <strong>Major-Incident Trauma Alert</strong> for sudden external surges. When ten ambulances call ahead from a motorway pile-up at 14:14, letting every prep room and theatre keep running scheduled routine cases causes an immediate pile-up inside the hospital too: theatres stay tied up on routine plans while acute arrivals back up in corridors, deteriorate into secondary emergencies, and loop back into intake on top of normal admissions, jamming a near-capacity hospital for days. Triggering the <strong>Trauma Alert</strong> (the hospital cousin of Toyota\'s <strong>Andon cord</strong>) immediately pre-empts and clears scheduled routine work out of the rooms before that backlog avalanche can form.</p>' +
        '<p>Product organisations face that same tipping point when sudden external shocks (<strong>rogue waves</strong>) hit: a zero-day security vulnerability drops overnight, a breaking platform change locks out live users, or a competitor bundles your paid capability for free. Even a team shipping smoothly in a changing market runs near steady capacity; if pre-shock items in <strong>Discovery</strong>, <strong>Build</strong>, <strong>Testing</strong>, and <strong>Rollout</strong> keep running to completion, they fail on arrival and flood back through <strong>Discovery</strong> alongside incoming roadmap work, creating a permanent queue spiral that makes every subsequent bet arrive stale too. Pulling the <strong>Andon cord</strong> aborts and flushes obsolete work immediately (either at the moment of the shock or to break an active jam), keeping <strong>Discovery</strong> and <strong>Build</strong> clear to steer into the new reality.</p>',
      lessonTitle: 'Chapter 7 Lesson',
      lessonText:
        'Even a healthy, smoothly paced pipeline running near capacity tips into a runaway rework backlog when a sudden shock invalidates work in flight; surviving acute shocks requires an Andon cord that pre-empts and flushes obsolete work immediately.',
      cyberneticsHtml:
        '<p>In <em>Brain of the Firm</em> (1972), Stafford Beer introduces the <strong>algedonic channel</strong> (Toyota\'s Andon cord, from the Greek <em>algos</em>, pain, and <em>hedone</em>, pleasure): a non-hierarchical interrupt wire modelled on the spinal pain reflex that bypasses routine upward summarisation when survival variables cross a critical threshold. Strictly in VSM, classical algedonic signals fire upward from acute operational pain inside <strong>System 1</strong> (such as a live outage), whereas abrupt external discontinuities enter through <strong>System 4</strong> emergency scanning; the simulation unites both on one pre-emption wire to <strong>Systems 3 and 5</strong> because both require the same immediate interrupt to abort obsolete work in flight.</p>' +
        '<p>A well-regulated <strong>System 2 / System 3 / System 4</strong> pipeline operating near steady-state capacity maintains minimal queues under gradual drift yet holds very little spare slack. When an abrupt step-function shock shifts the environment, every pre-shock item still in flight turns into a simultaneous Outer Loop error return on top of ongoing arrivals, tipping the bottleneck into nonlinear rework-queue collapse unless an algedonic interrupt immediately purges obsolete in-flight state.</p>',
      cyberneticsLessonText:
        'A near-capacity regulator stable under gradual drift still suffers nonlinear rework-queue collapse under step-function shocks unless an algedonic interrupt immediately pre-empts and flushes obsolete work in flight.',
      defaults: {
        demandIdx: 1,
        wipIdx: 2,
        driftIdx: 0,
        shockIdx: 0,
        discoveryIdx: 0,
        buildIdx: 0,
        build10x: false,
        discoveryNoiseIdx: 2,
        discoveryDampener: true,
        buildNoiseIdx: 2,
        buildDampener: true,
        testingIdx: 1,
        reachIdx: 3,
        messagingNoiseIdx: 2,
        rolloutDampener: true,
        diagnosticChannel: true,
        andonCord: false
      },
      presets: [
        {
          label: 'Healthy flow: click Trigger Shock Wave (default)',
          cyberneticsLabel: 'Steady flow: click Trigger Step Shock (default)',
          values: {
            demandIdx: 1,
            wipIdx: 2,
            driftIdx: 0,
            shockIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 2,
            discoveryDampener: true,
            buildNoiseIdx: 2,
            buildDampener: true,
            testingIdx: 1,
            reachIdx: 3,
            messagingNoiseIdx: 2,
            rolloutDampener: true,
            diagnosticChannel: true,
            andonCord: false
          }
        },
        {
          label: 'Healthy flow + Andon cord armed',
          cyberneticsLabel: 'Steady flow + algedonic armed',
          values: {
            demandIdx: 1,
            wipIdx: 2,
            driftIdx: 0,
            shockIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 2,
            discoveryDampener: true,
            buildNoiseIdx: 2,
            buildDampener: true,
            testingIdx: 1,
            reachIdx: 3,
            messagingNoiseIdx: 2,
            rolloutDampener: true,
            diagnosticChannel: true,
            andonCord: true
          }
        },
        {
          label: 'Frequent auto-shocks (no Andon cord)',
          cyberneticsLabel: 'Frequent shocks (no algedonic wire)',
          values: {
            demandIdx: 1,
            wipIdx: 2,
            driftIdx: 0,
            shockIdx: 2,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 2,
            discoveryDampener: true,
            buildNoiseIdx: 2,
            buildDampener: true,
            testingIdx: 1,
            reachIdx: 3,
            messagingNoiseIdx: 2,
            rolloutDampener: true,
            diagnosticChannel: true,
            andonCord: false
          }
        },
        {
          label: 'Frequent auto-shocks + Andon cord active',
          cyberneticsLabel: 'Frequent shocks + algedonic active',
          values: {
            demandIdx: 1,
            wipIdx: 2,
            driftIdx: 0,
            shockIdx: 2,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 2,
            discoveryDampener: true,
            buildNoiseIdx: 2,
            buildDampener: true,
            testingIdx: 1,
            reachIdx: 3,
            messagingNoiseIdx: 2,
            rolloutDampener: true,
            diagnosticChannel: true,
            andonCord: true
          }
        }
      ],
      prevButtonLabel: '\u2190 Chapter 6 (Fault Isolation)',
      cyberneticsPrevLabel: '\u2190 Chapter 6 (Credit Assignment)',
      nextButtonLabel: 'Next: Chapter 8 (Full Sandbox) \u2192',
      cyberneticsNextLabel: 'Next: Chapter 8 (Complete VSM) \u2192'
    },

    8: {
      tabName: 'Full Sandbox',
      tabCyberneticsName: 'Complete VSM',
      heading: 'Chapter 8: Full Sandbox (Steering the Whole Ship)',
      cyberneticsHeading: 'Chapter 8: Complete Viable System Model (Systems 1 to 5)',
      storyHtml:
        '<p>Think of a working sailing ship carrying cargo across open water. No single role brings a voyage safely into port alone: the lookout reads shifting winds and distant hazards (<strong>Discovery</strong>), the first mate paces deck work so crews never tangle three manoeuvres at once (<strong>Flow &amp; WIP</strong>), the deck hands set sails and lines (<strong>Build</strong>), the bosun inspects rigging before full load hits it (<strong>Testing</strong>), signal flags and harbour pilots guide the arrival so ports know what is aboard and offload it cleanly (<strong>Rollout</strong>), the navigator checks actual drift against landmarks instead of guessing from speed logs alone (<strong>Fault Isolation</strong>), and the alarm bell clears routine deck tasks the instant a rogue wave rises (<strong>Andon cord</strong>). Above them all sits the captain\'s charter (<strong>Governance</strong>): setting purpose and risk appetite, balancing raw speed against shared care, and deciding when to abandon a planned course immediately.</p>' +
        '<p>In a product company, leadership\'s job (<strong>Governance</strong>) is setting value objectives and risk appetite so outward speed and internal quality are balanced on shared reality rather than departmental politics. Nearly every recurring organisational failure comes from maximising one local metric while starving the rest of the loop: a <strong>Feature Factory</strong> floods the backlog and celebrates ticket output while flying blind on user outcomes; <strong>Analysis Paralysis</strong> polishes upfront specs until the market has already changed; <strong>Ungoverned 10x Build</strong> multiplies coding output straight into a testing bottleneck and rework jam; <strong>Hype-Driven Rollout</strong> buries working software under false promises and then blames engineering when users churn. A viable organisation avoids all four traps by funding the handoffs, queues, and incoming channels between teams with the same care as the teams themselves.</p>',
      lessonTitle: 'Chapter 8 Lesson',
      lessonText:
        'Local efficiency in any single stage cannot produce real-world fit on its own; governance means balancing adaptation speed, handoff clarity, queue discipline, accurate rollout, user observation, and shock pre-emption across the whole loop at once.',
      cyberneticsHtml:
        '<p>All five functions of Stafford Beer\'s <strong>Viable System Model (VSM)</strong> now operate together on screen: <strong>System 1</strong> (<code>Operations</code> / Build constructing the artefact, coupled to the environment through output-boundary <code>Amplification</code> and transduction in Rollout), <strong>System 2</strong> (<code>Coordination</code> / Flow &amp; WIP pacing concurrent streams against queue oscillation), <strong>System 3 &amp; System 3*</strong> (internal control and independent <code>Audit</code> / Testing regulating the Inner Loop), <strong>System 4</strong> (<code>Intelligence</code> / Discovery running the upstream <strong>horizon channel</strong> for gradual drift alongside the post-release <strong>diagnostic channel</strong> closing the Outer Loop), and the <strong>algedonic channel</strong> (Andon cord pre-empting step-function shocks), completing all three incoming channels from reality.</p>' +
        '<p>Environmental drift and step-shocks remain external disturbances outside the organisation\'s control; setting the internal policy levers below them is <strong>System 5</strong> (governance), arbitrating the central <strong>System 3 / System 4 homeostat</strong> between outward adaptation speed and internal stability, funding transducer redundancy versus throughput, and setting risk appetite.</p>',
      cyberneticsLessonText:
        'Viability belongs to the coupled whole rather than any isolated subsystem: System 5 governance must balance adaptation lag, transducer capacity, System 2 WIP pacing, System 3* audit, variety amplification, diagnostic variety, and algedonic pre-emption together.',
      defaults: {
        demandIdx: 1,
        wipIdx: 1,
        driftIdx: 0,
        shockIdx: 1,
        discoveryIdx: 0,
        buildIdx: 0,
        build10x: false,
        discoveryNoiseIdx: 2,
        discoveryDampener: true,
        buildNoiseIdx: 2,
        buildDampener: true,
        testingIdx: 1,
        reachIdx: 3,
        messagingNoiseIdx: 2,
        rolloutDampener: true,
        diagnosticChannel: true,
        andonCord: true
      },
      presets: [
        {
          label: 'Viable System (balanced, default)',
          cyberneticsLabel: 'Viable System (homeostatic, default)',
          values: {
            demandIdx: 1,
            wipIdx: 1,
            driftIdx: 0,
            shockIdx: 1,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 2,
            discoveryDampener: true,
            buildNoiseIdx: 2,
            buildDampener: true,
            testingIdx: 1,
            reachIdx: 3,
            messagingNoiseIdx: 2,
            rolloutDampener: true,
            diagnosticChannel: true,
            andonCord: true
          }
        },
        {
          label: 'Feature Factory',
          cyberneticsLabel: 'Unregulated Sys 1 (1-bit)',
          values: {
            demandIdx: 2,
            wipIdx: 3,
            driftIdx: 1,
            shockIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 2,
            discoveryDampener: false,
            buildNoiseIdx: 2,
            buildDampener: false,
            testingIdx: 1,
            reachIdx: 2,
            messagingNoiseIdx: 1,
            rolloutDampener: false,
            diagnosticChannel: false,
            andonCord: false
          }
        },
        {
          label: 'Analysis Paralysis',
          cyberneticsLabel: 'Sys 4 paralysis (lag > drift)',
          values: {
            demandIdx: 1,
            wipIdx: 0,
            driftIdx: 1,
            shockIdx: 0,
            discoveryIdx: 3,
            buildIdx: 2,
            build10x: false,
            discoveryNoiseIdx: 2,
            discoveryDampener: true,
            buildNoiseIdx: 0,
            buildDampener: false,
            testingIdx: 3,
            reachIdx: 3,
            messagingNoiseIdx: 1,
            rolloutDampener: true,
            diagnosticChannel: false,
            andonCord: false
          }
        },
        {
          label: 'Ungoverned 10x Build',
          cyberneticsLabel: '10x Sys 1 (Sys 3* jam)',
          values: {
            demandIdx: 3,
            wipIdx: 3,
            driftIdx: 1,
            shockIdx: 1,
            discoveryIdx: 0,
            buildIdx: 1,
            build10x: true,
            discoveryNoiseIdx: 1,
            discoveryDampener: false,
            buildNoiseIdx: 3,
            buildDampener: false,
            testingIdx: 3,
            reachIdx: 3,
            messagingNoiseIdx: 1,
            rolloutDampener: false,
            diagnosticChannel: false,
            andonCord: false
          }
        },
        {
          label: 'Hype-Driven Rollout',
          cyberneticsLabel: 'Corrupted output transducer',
          values: {
            demandIdx: 1,
            wipIdx: 0,
            driftIdx: 0,
            shockIdx: 0,
            discoveryIdx: 0,
            buildIdx: 0,
            build10x: false,
            discoveryNoiseIdx: 2,
            discoveryDampener: true,
            buildNoiseIdx: 2,
            buildDampener: true,
            testingIdx: 2,
            reachIdx: 3,
            messagingNoiseIdx: 3,
            rolloutDampener: false,
            diagnosticChannel: false,
            andonCord: false
          }
        }
      ],
      prevButtonLabel: '\u2190 Chapter 7 (Rogue Waves & the Andon Cord)',
      cyberneticsPrevLabel: '\u2190 Chapter 7 (Algedonic Channel)'
    }
  };

  const UI_COPY = {
    product: {
      shockBtn: 'Trigger Shock Wave',
      loopTimePrefix: 'Adaptation loop:',
      worldCyclePrefix: 'Market shift cycle:',
      legendNeed: 'Blue silhouette = live market need',
      legendSpec: 'Dashed outline = written Spec',
      legendBuilt: 'Solid shape = built product',
      legendChip: 'Launch chips = % market fit',
      historyLabel: 'Last 16 launches:',
      environmentEyebrowCh1: 'Outside World (Model Conditions)',
      environmentEyebrow: 'World & Unchecked Noise (Model Conditions)',
      activeControlsEyebrowPrefix: 'Process & Governance Levers',
      activeControlsCh8Suffix: 'Full Sandbox',
      worldBlockTitle: 'Outside World',
      noiseBlockTitle: 'Unchecked Handoff & Defect Noise',
      flowBlockTitle: 'Flow & WIP',
      discoveryBlockTitle: 'Discovery & Spec',
      buildBlockTitle: 'Build',
      testingBlockTitle: 'Testing',
      rolloutBlockTitle: 'Rollout & Messaging (Go-to-Market)',
      channelsBlockTitle: 'Incoming Channels (Outer Loop)',
      driftLabel: 'Market drift speed (the breeze)',
      driftHelp: 'How rapidly the Outside World morphs from one silhouette to the next.',
      demandLabel: 'Incoming demand (request arrival)',
      demandHelp: 'How fast customers and stakeholders push new requests to the intake gate.',
      shockLabel: 'Shock probability (rogue waves)',
      shockHelp: 'Abrupt step-change snapping Outside World to a new silhouette.',
      wipLabel: 'WIP limit (max bets in flight)',
      wipHelp: 'Caps active bets in flight; extra requests wait outside until a bet finishes.',
      discoveryLabel: 'Upfront discovery & spec depth',
      discoveryHelp: 'Thin slices ship fast; deeper desk study trims ~24% to 38% of misreads with diminishing returns while adding lag.',
      discoveryNoiseLabel: 'Discovery & spec noise (World \u2192 Spec)',
      discoveryNoiseHelp: 'Distortion when reading the market and compressing findings into a written ticket.',
      discoveryDampenerTitle: 'Watch real users & check the Spec together',
      discoveryDampenerMeta: 'Cuts Discovery noise by ~82%, adds +1.8d to Discovery.',
      buildLabel: 'Build slice size (batch scope)',
      buildHelp: 'Smaller vertical slices finish faster and stay steerable; oversized batches sit longer and drift harder.',
      build10xTitle: '10x Build throughput',
      build10xMeta: 'Cuts Build time per item 10x (e.g. 15 devs to 1 tester, or fast build automation).',
      buildNoiseLabel: 'Build handoff & coding noise (Spec \u2192 Code)',
      buildNoiseHelp: 'Distortion from async ticket gaps and coding defects warping the solid shape.',
      buildDampenerTitle: 'Pair during Build',
      buildDampenerMeta: 'Cuts Build noise by ~84%; focuses 2 people on 1 bet at a time (halves parallel Build WIP in Ch. 4+; 0d added lead time).',
      testingLabel: 'Testing thoroughness (Built == Spec)',
      testingHelp: 'Checks solid Built shape strictly against written Spec; mismatches loop back to Build with a wrench badge.',
      reachLabel: 'Rollout reach (distribution & visibility)',
      reachHelp: 'How much of the target market discovers the shipped product (Silent ships in 0.3d unlabelled; Full reach takes 1.1d).',
      messagingNoiseLabel: 'Messaging & docs noise (positioning)',
      messagingNoiseHelp: 'Mismatch between marketing/docs promises and what the shipped code actually does (e.g. labelling a Circle as "TRIANGLE").',
      rolloutDampenerTitle: 'Check messaging & docs against build',
      rolloutDampenerMeta: 'Aligns positioning and docs with the real build (~88% less label noise, +1d Rollout time).',
      diagnosticChannelTitle: 'Diagnostic channel: watch real users post-launch',
      diagnosticChannelMeta: 'Watches real users on every release (+0.7d per launch) so failed launches route straight to Rollout, Build, or Discovery.',
      andonCordTitle: 'Andon cord: pre-empt & flush queues on shock',
      andonCordMeta: 'Fires an immediate interrupt when a rogue wave hits, clearing pre-shock items from stations and queues right away.',
      silentRolloutStatus: 'Unlabelled (Silent)',
      storyShow: 'Show story \u25bc',
      storyCollapse: 'Collapse story \u25b2',
      hintsShow: 'Show hints \u25bc',
      hintsHide: 'Hide hints \u25b2',
      copyLinkLabel: 'Copy link',
      copyLinkCopied: 'Copied!',
      sharedSetupHeader: 'Shared setup:',
      impactIdle: 'Hover or adjust any unlocked control below to spotlight every place it affects in the loop.',
      presetHeaderPrefix: 'Experiment loaded: ',
      presetSummary: 'Highlighted rings mark the stations and handoffs reconfigured by this experiment.',
      tradeoffGainLabel: 'Gain:',
      tradeoffCostLabel: 'Cost:',
      tradeoffNone: 'None',
      tradeoffNoNoise: 'None (0% baseline noise)',
      historyWaiting: 'Waiting for first work item to reach real users...',
      historyAvgEmpty: 'Average real-world fit: <span class="mono-stat">--</span>',
      ch8CyberBridgeBtn: 'Start Chapter 1 in Cybernetics view \u2192',
      stability: {
        thrashing: 'Slower than shocks (thrashing!)',
        slowerThanShocks: 'Slower than shocks (stale!)',
        crowdingShocks: 'Crowding shock interval',
        faster: 'Loop faster than market',
        drifting: 'Drifting behind market',
        slower: 'Slower than market (stale!)'
      }
    },
    cybernetics: {
      shockBtn: 'Trigger Step Shock',
      loopTimePrefix: 'Relaxation time:',
      worldCyclePrefix: 'Disturbance cycle:',
      legendNeed: 'Blue silhouette = environmental state (market need)',
      legendSpec: 'Dashed outline = System 4 model (Spec)',
      legendBuilt: 'Solid shape = System 1 output (built product)',
      legendChip: 'Outcome chips = % environmental fit',
      historyLabel: 'Last 16 outputs:',
      environmentEyebrowCh1: 'Environment (Disturbances)',
      environmentEyebrow: 'Environment & Unchecked Noise (Disturbances)',
      activeControlsEyebrowPrefix: 'System 5 Governance',
      activeControlsCh8Suffix: 'Full VSM',
      worldBlockTitle: 'Environment',
      noiseBlockTitle: 'Unchecked Transducer & Operational Noise',
      flowBlockTitle: 'System 2: Coordination (Flow & WIP)',
      discoveryBlockTitle: 'System 4: Intelligence & Horizon (Discovery)',
      buildBlockTitle: 'System 1: Operations (Build)',
      testingBlockTitle: 'System 3 & 3*: Control & Audit (Testing)',
      rolloutBlockTitle: 'Variety Amplification (Rollout)',
      channelsBlockTitle: 'Diagnostic & Algedonic (Outer Loop)',
      driftLabel: 'Environmental drift rate',
      driftHelp: 'Rate at which the external environment continuously changes state.',
      demandLabel: 'External demand rate (input arrival)',
      demandHelp: 'Rate at which external demands arrive at the regulator boundary.',
      shockLabel: 'Step-shock probability',
      shockHelp: 'Discontinuous perturbation snapping the environment to a new state.',
      wipLabel: 'System 2 WIP limit (in-flight cap)',
      wipHelp: 'Caps concurrent items inside operational capacity; excess arrivals wait at the gate.',
      discoveryLabel: 'System 4 upfront modelling depth',
      discoveryHelp: 'Minimal sampling acts fast; deeper System 4 modelling trims ~24% to 38% of model error with diminishing returns while inflating lag.',
      discoveryNoiseLabel: 'Input transducer loss & noise (Env \u2192 Sys 4)',
      discoveryNoiseHelp: 'Variety attenuated and ambiguity injected when encoding environmental state into an internal model.',
      discoveryDampenerTitle: 'Widen System 4 channel (watch users & check Spec)',
      discoveryDampenerMeta: 'Cuts input transducer noise by ~82%, adds +1.8d to System 4 lag.',
      buildLabel: 'System 1 batch grain (execution lag)',
      buildHelp: 'Fine System 1 slices execute quickly and preserve shared control; coarse batches inflate lag and operational drift.',
      build10xTitle: '10x System 1 throughput',
      build10xMeta: 'Multiplies System 1 execution speed 10x while downstream System 3* audit capacity stays fixed.',
      buildNoiseLabel: 'Internal transducer & operational noise (Sys 4 \u2192 Sys 1)',
      buildNoiseHelp: 'Channel distortion across the Sys 4 \u2192 Sys 1 boundary plus operational execution error.',
      buildDampenerTitle: 'Synchronous redundancy (pairing in Build)',
      buildDampenerMeta: 'Cuts Sys 4 \u2192 Sys 1 noise by ~84%; focuses 2 operators on 1 stream (halves parallel Sys 1 WIP in Ch. 4+; 0d added lag).',
      testingLabel: 'System 3* audit strictness (Sys 1 == Sys 4)',
      testingHelp: 'Compares solid System 1 output strictly against System 4\'s internal model; discrepancies loop back for rework.',
      reachLabel: 'Variety amplification reach',
      reachHelp: 'Extent to which low-variety System 1 output projects across the external population (Silent leaves it tiny and unencoded).',
      messagingNoiseLabel: 'Output transducer distortion (encoding)',
      messagingNoiseHelp: 'Corruption at the output boundary when encoding what the artefact does into the environment\'s language.',
      rolloutDampenerTitle: 'Output transducer check (verify messaging & docs)',
      rolloutDampenerMeta: 'Aligns outward encoding with actual System 1 output (~88% less distortion, +1d lag).',
      diagnosticChannelTitle: 'High-variety diagnostic channel (watch users)',
      diagnosticChannelMeta: 'Maintains post-release observation (+0.7d per output) to isolate Amplification, System 1, or System 4 on failure.',
      andonCordTitle: 'Algedonic interrupt (Andon cord on shock)',
      andonCordMeta: 'Fires a non-hierarchical interrupt on step-shocks, purging obsolete in-flight state immediately.',
      silentRolloutStatus: 'Unencoded (Silent)',
      storyShow: 'Show explanation \u25bc',
      storyCollapse: 'Collapse explanation \u25b2',
      hintsShow: 'Show hints \u25bc',
      hintsHide: 'Hide hints \u25b2',
      copyLinkLabel: 'Copy link',
      copyLinkCopied: 'Copied!',
      sharedSetupHeader: 'Shared parameters:',
      impactIdle: 'Hover or adjust any unlocked parameter below to spotlight its coupled effects across the regulator.',
      presetHeaderPrefix: 'Preset loaded: ',
      presetSummary: 'Highlighted rings mark the stations and channels reconfigured by this preset.',
      tradeoffGainLabel: 'Gain:',
      tradeoffCostLabel: 'Cost:',
      tradeoffNone: 'None',
      tradeoffNoNoise: 'None (0% baseline noise)',
      historyWaiting: 'Waiting for first operational output to reach the environment...',
      historyAvgEmpty: 'Average environmental fit: <span class="mono-stat">--</span>',
      stability: {
        thrashing: 'Unstable (lag > shocks: thrashing!)',
        slowerThanShocks: 'Unstable (lag > shock interval!)',
        crowdingShocks: 'Approaching shock threshold',
        faster: 'Relaxation < disturbance',
        drifting: 'Approaching instability',
        slower: 'Unstable (lag > disturbance!)'
      }
    }
  };

  const CANVAS_COPY = {
    product: {
      senseDampened: 'Observed \u2713',
      senseClean: 'Filter',
      buildDegraded: 'Big batch!',
      buildDampened: 'Paired \u2713',
      rolloutDampened: 'Checked \u2713',
      rolloutClean: 'Scale',
      rolloutSilent: 'Silent!',
      innerLoopActive: 'Inner Loop: testing rework (Built != Spec)',
      innerLoopLocked: 'Inner Loop: testing rework (Off)',
      rampDiscovery: 'Re-read market',
      rampBuild: 'Fix code',
      rampRollout: 'Fix messaging',
      outerDiagnosed: 'Outer Loop: watching real users \u2192 routes failed launches straight to broken stage',
      outerBlind: 'Outer Loop: summary metric only \u2192 "?" guesses blind across Rollout, Build, Discovery',
      outerExitNames: { rollout: 'Rollout', build: 'Build', discovery: 'Discovery' },
      andonFlashPrefix: 'ANDON CORD PULLED \u00b7 Cleared ',
      andonArmed: 'Andon cord armed \u2192 pre-empts & clears queues on shock',
      wipGateCapped: 'WIP CAP',
      wipGateUncapped: 'NO CAP',
      govBarArmed: 'Governance: Purpose, Value & Risk Appetite  \u00b7  Andon armed \u2713',
      govBarOff: 'Governance: Purpose, Value & Risk Appetite  \u00b7  Andon off',
      worldLeftEyebrow: 'MARKET NEED',
      worldLeftTitle: 'Outside World',
      shockTag: 'ROGUE WAVE!',
      worldStatePrefix: 'Need: ',
      discoveryEyebrow: 'RESEARCH',
      discoveryTitle: 'Discovery & Spec',
      discoveryWarped: 'Warped Spec!',
      discoveryCleanPrefix: 'Spec: ',
      discoveryIdleDampened: 'Observed (+1.8d)',
      discoveryIdleBase: 'Snapshots market',
      buildEyebrowBase: 'ENGINEERING',
      buildEyebrow10x: '10X OUTPUT',
      buildTitle: 'Build',
      buildReworking: 'Reworking to Spec!',
      buildDrifted: 'Drifted from Spec!',
      buildIdle10x: '10x throughput',
      buildIdlePaired: 'Paired \u00b7 1 at a time',
      buildIdleSoloParallel: 'Solo (up to 2)',
      buildParallelTag: '2/2 solo',
      buildIdleBase: 'Fills solid shape',
      testingEyebrow: 'VERIFICATION',
      testingTitle: 'Testing',
      testingActivePrefix: 'Built vs Spec: ',
      testingBannerPass: 'Passed \u2713',
      testingBannerRework: 'Failed \u2192 Rework',
      testingIdle: 'Checks Built == Spec',
      rolloutEyebrow: 'LAUNCH',
      rolloutTitle: 'Rollout',
      rolloutIdleChecked: 'Checked (+1d)',
      rolloutIdleBase: 'Reach & label',
      worldRightEyebrow: 'OUTCOME',
      worldRightTitle: 'Real Users (Market Fit)',
      landingTestPrefix: 'Test \u2713 \u00b7 ',
      landingCauseStale: 'Stale (market shifted)!',
      landingCauseSpec: 'Wrong Spec!',
      landingCauseBuild: 'Build defect!',
      landingCauseReach: 'Low reach!',
      worldRightLivePrefix: 'Live need: '
    },
    cybernetics: {
      senseDampened: 'Widened \u2713',
      senseClean: 'Attenuate',
      horizonChannel: 'Horizon',
      buildDegraded: 'Coarse!',
      buildDampened: 'Redundant \u2713',
      rolloutDampened: 'Verified \u2713',
      rolloutClean: 'Amplify',
      rolloutSilent: 'No amplify',
      innerLoopActive: 'System 3 Inner Loop: Sys 3* rework (Sys 1 != Sys 4)',
      innerLoopLocked: 'System 3 Inner Loop: Sys 3* audit (Off)',
      rampDiscovery: 'Update Sys 4 (Spec)',
      rampBuild: 'Fix Sys 1 (Build)',
      rampRollout: 'Fix transducer (Rollout)',
      outerDiagnosed: 'Outer Loop: high-variety diagnostic channel \u2192 routes rework to failing subsystem',
      outerBlind: 'Outer Loop: 1-bit feedback only \u2192 "?" lacks variety to isolate failing stage',
      outerExitNames: { rollout: 'Amplify', build: 'Sys 1', discovery: 'Sys 4' },
      andonFlashPrefix: 'ALGEDONIC INTERRUPT \u00b7 Purged ',
      andonArmed: 'Algedonic channel armed \u2192 pre-empts & purges queues on shock',
      wipGateCapped: 'SYS 2',
      wipGateUncapped: 'SYS 2 OFF',
      govBarArmed: 'System 5 Governance: Policy & Sys 3/4 Homeostat  \u00b7  Algedonic armed \u2713',
      govBarOff: 'System 5 Governance: Policy & Sys 3/4 Homeostat  \u00b7  Algedonic off',
      worldLeftEyebrow: 'HIGH VARIETY',
      worldLeftTitle: 'Environment (Market)',
      shockTag: 'STEP SHOCK!',
      worldStatePrefix: 'State: ',
      discoveryEyebrow: 'SYSTEM 4',
      discoveryTitle: 'Intelligence (Spec)',
      discoveryWarped: 'Warped model!',
      discoveryCleanPrefix: 'Model: ',
      discoveryIdleDampened: 'Widened (+1.8d)',
      discoveryIdleBase: 'Samples state',
      buildEyebrowBase: 'SYSTEM 1',
      buildEyebrow10x: 'SYS 1 \u00b7 10X',
      buildTitle: 'Operations (Build)',
      buildReworking: 'Reworking to model!',
      buildDrifted: 'Drifted from model!',
      buildIdle10x: '10x capacity',
      buildIdlePaired: 'Sync pair \u00b7 1 slot',
      buildIdleSoloParallel: 'Solo (up to 2)',
      buildParallelTag: '2/2 Sys 1',
      buildIdleBase: 'Constructs output',
      testingEyebrow: 'SYSTEM 3*',
      testingTitle: 'Audit (Testing)',
      testingActivePrefix: 'Sys 1 vs 4: ',
      testingBannerPass: 'Conforms \u2713',
      testingBannerRework: 'Audit fail \u2192 Rework',
      testingIdle: 'Audits Sys 1 == Sys 4',
      rolloutEyebrow: 'AMPLIFY',
      rolloutTitle: 'Amplify (Rollout)',
      rolloutIdleChecked: 'Verified (+1d)',
      rolloutIdleBase: 'Project & encode',
      worldRightEyebrow: 'VIABILITY',
      worldRightTitle: 'Env. Fit (Real Users)',
      landingTestPrefix: 'Audit \u2713 \u00b7 ',
      landingCauseStale: 'Stale (env drifted)!',
      landingCauseSpec: 'Corrupted Sys 4 model!',
      landingCauseBuild: 'Sys 1 defect!',
      landingCauseReach: 'Insufficient amplify!',
      worldRightLivePrefix: 'Live state: '
    }
  };

  const CONTROL_DESCRIPTORS = {
    drift: {
      productTitle: 'Market drift speed',
      cyberTitle: 'Environmental drift rate',
      hoverProduct: 'Governs how rapidly customer needs shift between Outside World and Real Users while bets are in flight.',
      hoverCyber: 'Governs how rapidly the external environment changes state relative to total relaxation time.',
      summaryProduct: 'Faster market drift shrinks the window before work in flight lands out of date.',
      summaryCyber: 'Faster environmental drift shrinks the time window before in-flight outputs arrive stale.'
    },
    shock: {
      productTitle: 'Shock probability',
      cyberTitle: 'Step-shock probability',
      hoverProduct: 'Controls sudden external shocks that invalidate pre-shock work across queues and stations.',
      hoverCyber: 'Controls step-function perturbations that invalidate pre-shock state across the pipeline.',
      summaryThrashingProduct: 'When shocks arrive faster than the adaptation loop can finish, pre-emption aborts every bet until the loop is shortened.',
      summaryThrashingCyber: 'When step-shocks arrive faster than relaxation time, algedonic interrupts purge every item until lag is shortened.',
      summaryProduct: 'Sets how often sudden external shocks hit in-flight bets and test incident pre-emption.',
      summaryCyber: 'Sets how often discontinuous shocks test algedonic pre-emption and relaxation speed.'
    },
    manualShock: {
      productTitle: 'Trigger Shock Wave',
      cyberTitle: 'Trigger Step Shock',
      productCommittedHeader: 'Rogue-wave shock fired:',
      cyberCommittedHeader: 'Step-function shock fired:',
      hoverProduct: 'Snaps the market immediately to a new need, testing whether obsolete work gets flushed or jams queues.',
      hoverCyber: 'Snaps the environment immediately to a new state, testing algedonic pre-emption.',
      summaryAndonOnProduct: 'Andon cord cleared obsolete in-flight work immediately so Discovery starts fresh.',
      summaryAndonOnCyber: 'Algedonic interrupt purged obsolete in-flight state so System 4 samples the new state immediately.',
      summaryAndonOffProduct: 'Without the Andon cord, pre-shock bets keep running to flop at Real Users and jam rework queues.',
      summaryAndonOffCyber: 'Without an algedonic interrupt, pre-shock items keep running to fail and flood Outer Loop rework.'
    },
    discoveryNoise: {
      productTitle: 'Discovery & spec noise',
      cyberTitle: 'Input transducer noise',
      hoverProduct: 'Baseline distortion when reading the market and compressing nuance into a written Spec.',
      hoverCyber: 'Baseline attenuation loss and noise across the Environment \u2192 System 4 transducer.',
      summaryCh2Product: 'Distortion entering the Spec here gets carried straight through Build to Real Users.',
      summaryCh2Cyber: 'Corrupted System 4 models cannot be rescued downstream by System 1 execution.',
      summaryProduct: 'Distortion entering the Spec here gets enforced downstream by Build and Testing alike.',
      summaryCyber: 'Corrupted System 4 models cannot be rescued downstream by System 1 or System 3* audit.'
    },
    buildNoise: {
      productTitle: 'Build handoff & coding noise',
      cyberTitle: 'Sys 4 \u2192 Sys 1 transducer & operational noise',
      hoverProduct: 'Baseline distortion from async handoff gaps and coding defects warping the built product.',
      hoverCyber: 'Baseline channel distortion and operational execution error inside System 1.',
      summaryCh2Product: 'Coding defects warp the built product and ship straight to Real Users.',
      summaryCh2Cyber: 'Operational defects warp System 1 output and degrade environmental fit directly.',
      summaryProduct: 'Coding defects either escape to Real Users or loop back from Testing to consume Build again.',
      summaryCyber: 'Operational defects either escape to degrade fit or consume extra capacity in System 3* rework.'
    },
    messagingNoise: {
      productTitle: 'Messaging & docs noise',
      cyberTitle: 'Output transducer distortion',
      hoverProduct: 'Mismatch between outward positioning/docs and what the built software actually does.',
      hoverCyber: 'Distortion at the output transducer when encoding System 1 output for the environment.',
      summarySilentProduct: 'Silent launches ship unlabelled ("???") until Rollout reach is raised above Silent.',
      summarySilentCyber: 'Silent launches remain unencoded ("???") until Variety amplification reach is raised above Silent.',
      summaryProduct: 'Misleading positioning wrecks real-world adoption even when the underlying build passed Testing.',
      summaryCyber: 'Corrupted output encoding spoils environmental fit even when internal System 1 output is sound.'
    },
    demand: {
      productTitle: 'Incoming demand',
      cyberTitle: 'External demand rate',
      hoverProduct: 'External request pressure knocking at the intake gate before WIP limits admit work.',
      hoverCyber: 'External arrival pressure pressing against the regulator\'s System 2 intake gate.',
      summaryCappedProduct: 'Heavy demand presses at the gate while your WIP limit holds internal station queues short.',
      summaryCappedCyber: 'High arrival pressure buffers outside the boundary while the System 2 WIP cap bounds internal queues.',
      summaryProduct: 'Without a tight WIP limit, faster incoming demand pours straight into station queues.',
      summaryCyber: 'Without a tight System 2 WIP cap, faster external arrivals inflate inter-stage queues (Little\'s Law).'
    },
    wip: {
      productTitle: 'WIP limit',
      cyberTitle: 'System 2 WIP limit',
      hoverProduct: 'Governance pull cap on concurrent bets in flight; excess demand waits outside until a slot opens.',
      hoverCyber: 'System 2 anti-oscillatory cap on concurrent work-in-progress; excess arrivals buffer outside.',
      summaryProduct: 'Capping active WIP holds station queues short under heavy demand at the cost of deferring extra requests at the gate.',
      summaryCyber: 'System 2 WIP regulation bounds queue residence (Little\'s Law) by buffering excess demand outside operational capacity.'
    },
    discovery: {
      productTitle: 'Upfront discovery & spec depth',
      cyberTitle: 'System 4 upfront modelling depth',
      hoverProduct: 'Coupled trade-off: deeper upfront study trims initial misreads with diminishing returns while adding Discovery lag.',
      hoverCyber: 'Coupled trade-off: deeper System 4 sampling trims model error with diminishing returns while inflating relaxation time.',
      summaryCh1Product: 'Longer upfront study stretches adaptation time while customer needs keep shifting.',
      summaryCh1Cyber: 'Longer System 4 sampling stretches total relaxation time while the environment continues to drift.',
      summaryDiminishingProduct: 'Past Sufficient, extra paper study barely trims written-spec loss while stretching the loop into staleness.',
      summaryDiminishingCyber: 'Past Sufficient, extra upfront modelling barely reduces transducer loss while inflating lag into staleness.',
      summaryProduct: 'Sufficient upfront study trims obvious misreads modestly; thin slices keep adaptation fast.',
      summaryCyber: 'Sufficient upfront sampling trims initial model error modestly; smaller slices keep relaxation fast.'
    },
    discoveryDampener: {
      productTitle: 'Watch real users & check Spec',
      cyberTitle: 'Widen System 4 channel & cross-check',
      hoverProduct: 'Coupled safeguard: cuts Discovery handoff distortion by ~82% in exchange for +1.8d of user observation.',
      hoverCyber: 'Coupled safeguard: widens System 4 input channel (-82% noise) at a +1.8d sensing lag cost.',
      summaryProduct: 'Watching real users and checking edge cases cuts Spec distortion sharply for only +1.8d.',
      summaryCyber: 'Direct environmental observation cuts input transducer noise far more cheaply than exhaustive upfront modelling.'
    },
    build: {
      productTitle: 'Build slice size',
      cyberTitle: 'System 1 batch grain',
      hoverProduct: 'Coupled lever: oversized Build batches sit longer in Build, drift harder from intent, and weaken pairing.',
      hoverCyber: 'Coupled lever: coarse System 1 batches inflate execution lag, raise operational drift, and weaken synchronous control.',
      summaryOversizedProduct: 'Oversized batches tie up Build while the market shifts and tangle too much scope to steer step by step.',
      summaryOversizedCyber: 'Coarse batches tie up System 1 while the environment shifts and lose step-by-step shared comprehension.',
      summaryProduct: 'Small vertical slices finish quickly in Build and stay small enough for shared steering.',
      summaryCyber: 'Small vertical slices keep System 1 lag short and keep synchronous steering effective.'
    },
    build10x: {
      productTitle: '10x Build throughput',
      cyberTitle: '10x System 1 throughput',
      hoverProduct: 'Speeds up Build 10x while leaving downstream independent Testing unchanged, exposing queue bottlenecks.',
      hoverCyber: 'Accelerates System 1 construction 10x ahead of fixed System 3* audit capacity, exposing queue saturation.',
      summaryOffProduct: 'Returning Build to 1x pace slows single-item coding while easing queue build-up in front of 1x Testing.',
      summaryOffCyber: 'Returning System 1 to 1x pace slows single-item execution while easing queue saturation ahead of 1x System 3* audit.',
      summaryProduct: 'Multiplying Build speed 10x pours bets into the 1x Testing queue, where waiting items grow stale.',
      summaryCyber: 'Local 10x acceleration in System 1 piles inventory in front of unchanged System 3* audit capacity.'
    },
    buildDampener: {
      productTitle: 'Pair during Build',
      cyberTitle: 'Synchronous System 1 redundancy',
      hoverProduct: 'Focuses 2 people onto 1 bet at a time (halving parallel Build WIP in Ch. 4+), cutting Build distortion ~84% with 0d added wait.',
      hoverCyber: 'Concentrates 2 operators onto 1 synchronous stream (halving parallel Sys 1 WIP in Ch. 4+), cutting System 1 error ~84% with 0d added lag.',
      summaryBigBatchProduct: 'Pairing reduces defects, yet oversized Build batches are too large to steer cleanly step by step.',
      summaryBigBatchCyber: 'Synchronous redundancy helps, yet coarse System 1 batch grain still degrades shared comprehension.',
      summaryOffProduct: 'Solo async handoffs run up to 2 parallel streams while letting coding defects re-enter Build.',
      summaryOffCyber: 'Removing synchronous redundancy opens 2 parallel Sys 1 slots while letting execution error re-enter.',
      summaryCh2Product: 'Pairing prevents handoff and coding defects at source before shipping to Real Users.',
      summaryCh2Cyber: 'Synchronous collaboration prevents operational defects at source inside System 1.',
      summaryProduct: 'Pairing prevents coding defects at source, avoiding Inner Loop Testing rework.',
      summaryCyber: 'Synchronous collaboration prevents operational defects at source, avoiding downstream System 3* rework.'
    },
    testing: {
      productTitle: 'Testing thoroughness',
      cyberTitle: 'System 3* audit strictness',
      hoverProduct: 'Coupled Inner Loop check: catches Built != Spec coding defects at the cost of inspection + Build rework delay.',
      hoverCyber: 'Coupled System 3* audit: catches System 1 != System 4 discrepancies at the cost of inspection and rework lag.',
      summaryProduct: 'Testing catches coding bugs via Inner Loop rework while remaining blind to upstream flaws in the Spec.',
      summaryCyber: 'System 3* catches System 1 defects via Inner Loop rework while enforcing whatever plan System 4 wrote.'
    },
    reach: {
      productTitle: 'Rollout reach',
      cyberTitle: 'Variety amplification reach',
      hoverProduct: 'Governs how widely the shipped build is projected and discovered across target users.',
      hoverCyber: 'Governs output-side variety amplification projecting System 1 output across the environment.',
      summaryProduct: 'Silent launches leave working software undiscovered, capping real-world market fit.',
      summaryCyber: 'Without variety amplification, even conformant System 1 output fails to couple with external users.'
    },
    rolloutDampener: {
      productTitle: 'Check messaging & docs against build',
      cyberTitle: 'Output transducer verification',
      hoverProduct: 'Coupled safeguard: aligns outward positioning and docs with the real build (~88% less label noise, +1d rollout time).',
      hoverCyber: 'Coupled safeguard: verifies output-boundary transduction (-88% distortion) for +1d deployment lag.',
      summarySilentProduct: 'Silent launches skip positioning and docs checks (0d added time) until Rollout reach is raised above Silent.',
      summarySilentCyber: 'Silent launches skip output encoding verification (0d added lag) until reach is raised above Silent.',
      summaryOffProduct: 'Skipping the messaging and docs check saves 1d in Rollout while letting outward positioning drift from what was built.',
      summaryOffCyber: 'Skipping output-boundary verification saves 1d lag while letting outward encoding drift from System 1 output.',
      summaryProduct: 'Aligns positioning and docs with what was built at a modest +1d rollout cost.',
      summaryCyber: 'Verifies outward encoding against actual System 1 output at a modest +1d deployment cost.'
    },
    diagnostic: {
      productTitle: 'Diagnostic channel',
      cyberTitle: 'High-variety diagnostic channel',
      hoverProduct: 'Coupled Outer Loop safeguard: adds +0.7d post-launch user observation to route failed bets straight to the broken stage.',
      hoverCyber: 'Coupled Outer Loop channel: adds +0.7d observation to supply requisite variety for fault isolation.',
      summaryOffProduct: 'Relying on summary metrics alone leaves failed launches guessing blind ("?") across Rollout, Build, and Discovery.',
      summaryOffCyber: 'Scalar summary telemetry lacks requisite variety, leaving Outer Loop rework guessing blind ("?") across stages.',
      summaryProduct: 'Watching real users (+0.7d) sends failed launches straight to Rollout, Build, or Discovery.',
      summaryCyber: 'Direct post-release observation isolates Amplification, System 1, or System 4 instead of blind trial-and-error.'
    },
    andon: {
      productTitle: 'Andon cord',
      cyberTitle: 'Algedonic pre-emption wire',
      hoverProduct: 'Fires an immediate interrupt on external shocks, flushing obsolete pre-shock work from queues and stations.',
      hoverCyber: 'Fires a non-hierarchical interrupt on step-shocks, purging obsolete in-flight state immediately.',
      summaryThrashingProduct: 'When shocks arrive faster than the adaptation loop can finish, pre-emption aborts every bet until the loop is shortened.',
      summaryThrashingCyber: 'When step-shocks arrive faster than relaxation time, algedonic interrupts purge every item until lag is shortened.',
      summaryOffProduct: 'With the Andon cord off, sudden shocks leave obsolete in-flight bets running to fail at Real Users and jam rework queues.',
      summaryOffCyber: 'Without an algedonic interrupt, step-shocks leave obsolete in-flight state running to fail and flood Outer Loop rework.',
      summaryProduct: 'Clears obsolete pre-shock work immediately before failed launches jam the rework backlog.',
      summaryCyber: 'Purges obsolete in-flight state on step-shocks before Outer Loop error returns collapse queues.'
    }
  };

  const CyberneticContent = {
    MAX_BUILT_CHAPTER: MAX_BUILT_CHAPTER,
    SHAPE_KEYS: SHAPE_KEYS,
    COUSIN_LABEL: COUSIN_LABEL,
    HYPE_LABEL: HYPE_LABEL,
    DRIFT_REGIMES: DRIFT_REGIMES,
    SHOCK_REGIMES: SHOCK_REGIMES,
    DEMAND_REGIMES: DEMAND_REGIMES,
    WIP_REGIMES: WIP_REGIMES,
    DISCOVERY_REGIMES: DISCOVERY_REGIMES,
    BUILD_REGIMES: BUILD_REGIMES,
    NOISE_REGIMES: NOISE_REGIMES,
    TESTING_REGIMES: TESTING_REGIMES,
    REACH_REGIMES: REACH_REGIMES,
    MESSAGING_NOISE_REGIMES: MESSAGING_NOISE_REGIMES,
    SIM_DAYS_PER_SEC: SIM_DAYS_PER_SEC,
    DAMPENER_DISCOVERY_ADD_SEC: DAMPENER_DISCOVERY_ADD_SEC,
    DAMPENER_DISCOVERY_FACTOR: DAMPENER_DISCOVERY_FACTOR,
    DAMPENER_BUILD_ADD_SEC: DAMPENER_BUILD_ADD_SEC,
    DAMPENER_BUILD_FACTOR: DAMPENER_BUILD_FACTOR,
    ROLLOUT_BASE_SEC: ROLLOUT_BASE_SEC,
    DAMPENER_ROLLOUT_ADD_SEC: DAMPENER_ROLLOUT_ADD_SEC,
    DAMPENER_ROLLOUT_FACTOR: DAMPENER_ROLLOUT_FACTOR,
    REWORK_NOISE_FACTOR: REWORK_NOISE_FACTOR,
    MAX_REWORK_PASSES: MAX_REWORK_PASSES,
    MAX_OUTER_RETURNS: MAX_OUTER_RETURNS,
    TRANSIT_SENSE: TRANSIT_SENSE,
    TRANSIT_TO_BUILD: TRANSIT_TO_BUILD,
    TRANSIT_TO_TESTING: TRANSIT_TO_TESTING,
    TRANSIT_TO_ROLLOUT: TRANSIT_TO_ROLLOUT,
    TRANSIT_ROLLOUT_TO_USERS: TRANSIT_ROLLOUT_TO_USERS,
    DIAGNOSTIC_OBSERVE_ADD_SEC: DIAGNOSTIC_OBSERVE_ADD_SEC,
    TRANSIT_TESTING_TO_USERS: TRANSIT_TESTING_TO_USERS,
    TRANSIT_IDEAL_GATES: TRANSIT_IDEAL_GATES,
    INNER_REWORK_SEC: INNER_REWORK_SEC,
    OUTER_BLIND_RETURN_SEC: OUTER_BLIND_RETURN_SEC,
    OUTER_DIAG_RETURN_SEC: OUTER_DIAG_RETURN_SEC,
    OUTCOME_HOLD_SEC: OUTCOME_HOLD_SEC,
    OUTER_RETURN_SEC: OUTER_RETURN_SEC,
    SETTING_KEY_TO_CONTROL: SETTING_KEY_TO_CONTROL,
    CHAPTERS: CHAPTERS,
    UI_COPY: UI_COPY,
    CANVAS_COPY: CANVAS_COPY,
    CONTROL_DESCRIPTORS: CONTROL_DESCRIPTORS
  };

  const root = typeof window !== 'undefined' ? window : globalThis;
  root.CyberneticContent = CyberneticContent;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CyberneticContent;
  }
})();
