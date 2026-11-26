# Interactive Cybernetic Model: Embedding & URL Parameter Manual

The 8-chapter interactive simulation at [beyondquality.org/cybernetics/](/cybernetics/) (companion to [Product Work as a Cybernetic System](factors.md)) doubles as a **parameter-driven visual component** that can be linked or embedded anywhere via GET parameters:

1. **Configurable state via URL**: every stage layout (`ch=1..8`), built-in scenario (`preset=1..5`), external condition, noise level, governance safeguard, and language lens (`view=product|cybernetics`) can be selected through URL query parameters, while progressive chapter isolation hides later stations so only the boxes relevant to that problem appear on screen.
2. **Three chrome levels (`ui`)**:
   - *(omitted)*: full 8-chapter walkthrough with stories, tabs, presets, and controls.
   - `ui=controls`: hides the language bar, 8-chapter tabs, Story card, and bottom pager, leaving the live diagram, `Quick experiments`, `Gain / Cost` bar, and that chapter's controls.
   - `ui=bare`: hides presets, the `Gain / Cost` bar, and all controls as well, leaving **only** the running diagram, clock/speed bar, 1-line visual key, and `Last 16 launches` strip.
3. **Drop-in `<iframe>` behaviour**: when embedded on another page (inline or inside a `<details class="sim-disclosure">` drawer), the card drops its outer side padding to sit flush with the text column, stays frozen at **`0.0d`** until scrolled or unfolded into view, and renders a quiet **`Open full interactive model →`** link that opens that exact setup in a full tab.

## Embedding snippet for Beyond Quality pages

Styled by `.sim-disclosure` in `assets/css/custom.css`:

```html
<details class="sim-disclosure">
  <summary>Watch [one-line description of the dynamic]</summary>
  <iframe
    src="/cybernetics/?ch=4&amp;ui=bare"
    title="Interactive diagram: [accessible description]"
    loading="lazy"></iframe>
</details>
```

---

## 1. Map of problems and built-in scenarios (`ch` & `preset`)

`preset=1` is always that chapter's default opening pathology (so `?ch=4&ui=bare` and `?ch=4&preset=1&ui=bare` are identical).

| Chapter & visible boxes | Problem isolated | `preset=` scenarios (`1..N`) |
|---|---|---|
| **`ch=1`** Adaptation Time *(4 boxes: World -> Discovery -> Build -> Users)* | Pure delivery lag against an independently shifting market: accurate research arrives stale when adaptation time exceeds market pace. | `1`: Analysis paralysis *(default)*<br>`2`: Nimble loop (in sync)<br>`3`: Turbulent market vs slow build |
| **`ch=2`** Handoff Noise *(4 boxes)* | Signal loss and invented assumptions across `World -> Spec` and `Spec -> Build`, plus why massive upfront specs lose to lag and diminishing returns. | `1`: Leaky async handoffs *(default)*<br>`2`: Observed + paired (clean)<br>`3`: Wrong problem, clean code<br>`4`: "Huge upfront spec" trap |
| **`ch=3`** Testing's Blind Spot *(5 boxes: adds Testing + Inner Loop rework)* | Post-build `Testing` checks `Built == Spec` with no view of the outside world: catches coding bugs at the cost of rework delay, yet stamps `Passed` on a flawed Spec. | `1`: Strict testing on wrong Spec *(default)*<br>`2`: Clean Spec + buggy Build (testing rescues)<br>`3`: Rework delay in a rapid market<br>`4`: Prevent at source (observe + pair) |
| **`ch=4`** Queues & Bottlenecks *(5 boxes + WIP gate + Queue trays)* | Local `10x Build` speedup ahead of `1x Testing` (or uncapped intake) jams queues, rework floods the queue a second time (`1 + r`), and waiting specs age into stale launches. | `1`: 10x Build into 1x Testing *(default)*<br>`2`: Tight WIP limit + paired Build (queues clear)<br>`3`: Flooded backlog (even with zero bugs) |
| **`ch=5`** Rollout & Messaging *(6 boxes: adds Rollout)* | Clean, timely builds still fail at the last metre when silent rollout leaves them undiscovered (`"???"`) or hype positioning mislabels what was built. | `1`: Hype label on clean code *(default)*<br>`2`: Silent launch ("good code sells itself")<br>`3`: Verified messaging & docs + full reach |
| **`ch=6`** Fault Isolation *(6 boxes + Outer Loop exits)* | A 1-bit failure metric (`"?"`) cannot tell whether Discovery, Build, or Rollout caused a flop, mis-routing whole rework cycles until post-launch user observation isolates the stage. | `1`: Summary metric: blind guessing *(default)*<br>`2`: Watch real users: isolates Rollout<br>`3`: "Marketing push" on a wrong Spec<br>`4`: Escaped bug: isolates Build hotfix |
| **`ch=7`** Rogue Waves & Andon Cord *(full loop + shock wire)* | Even a healthy near-capacity flow tips into a runaway Outer Loop rework spiral when a sudden shock invalidates in-flight bets unless an Andon cord flushes obsolete work immediately. | `1`: Healthy flow: click Trigger Shock Wave *(default)*<br>`2`: Healthy flow + Andon cord armed<br>`3`: Frequent auto-shocks (no Andon cord)<br>`4`: Frequent auto-shocks + Andon cord active |
| **`ch=8`** Full Sandbox *(complete loop + Governance bracket)* | Balancing speed, WIP limits, handoff fidelity, testing rigour, rollout checks, fault isolation, and shock pre-emption together under System 5 governance. | `1`: Viable System (balanced, default)<br>`2`: Feature Factory<br>`3`: Analysis Paralysis<br>`4`: Ungoverned 10x Build<br>`5`: Hype-Driven Rollout |

---

## 2. Map of all GET parameters

Any individual parameter can be combined with `ch=` (and optionally `preset=`, where individual parameters override that preset's values). If `ch=` is omitted while control parameters are passed, `ch=8` (`Full Sandbox`) is used.

### Display, framing, and playback

| Param | Values | Effect |
|---|---|---|
| `ui` | *(omitted)* \| `controls` \| `bare` | Full walkthrough, chapter controls without book/story chrome, or pure diagram card only |
| `ch` | `1..8` | Selects chapter and locks later-chapter stations/controls out of view |
| `preset` | `1..5` | Loads that chapter's 1-based preset before applying any individual overrides |
| `view` | `product` \| `cybernetics` | Plain product terminology *(default)* or Stafford Beer VSM terminology |
| `speed` | `0.5` \| `1` \| `2` | Initial simulation clock multiplier |
| `paused` | `0` \| `1` | `1` opens manually paused |
| `story` | `0` \| `1` | `0` collapses the Story & Lesson card *(normal mode only)* |
| `hints` | `0` \| `1` | `0` hides helper sentences beside knobs and switches |

### External conditions & baseline noise (`0..3` rotary knobs)

| Param | Active from | `0` | `1` | `2` | `3` |
|---|---|---|---|---|---|
| `drift` | `ch=1` | Calm | Moderate | Rapid | Turbulent |
| `demand` | `ch=4` | Trickle | Steady | Busy | Flooded |
| `shock` | `ch=7` | Off | Occasional | Frequent | Stormy |
| `discNoise` | `ch=2` | None (`0%`) | Mild (`25%`) | Moderate (`52%`) | Heavy (`82%`) |
| `buildNoise` | `ch=2` | None (`0%`) | Mild (`25%`) | Moderate (`52%`) | Heavy (`82%`) |
| `msgNoise` | `ch=5` | Accurate (`0%`) | Slight spin (`32%`) | Confusing (`60%`) | Pure hype (`90%`) |

### Internal process & governance knobs (`0..3`) and switches (`0` \| `1`)

| Param | Active from | Values |
|---|---|---|
| `wip` | `ch=4` | `0` One at a time (1) · `1` Tight (3) · `2` Loose (12) · `3` Uncapped (18) |
| `disc` | `ch=1` | `0` Thin slice (`1.6d`) · `1` Sufficient (`3.6d`) · `2` Exhaustive (`7.6d`) · `3` Paralysis (`13.6d`) |
| `watch` | `ch=2` | `0` \| `1` Watch real users & check the Spec (`~82%` less spec noise, `+1.8d`) |
| `build` | `ch=1` | `0` Small slice (`1.6d`) · `1` Medium batch (`3.6d`) · `2` Large batch (`7.6d`, weakens pairing) · `3` Mega-batch (`12.4d`, weakens pairing) |
| `build10x` | `ch=4` | `0` \| `1` 10x Build throughput |
| `pair` | `ch=2` | `0` \| `1` Pair during Build (`~84%` less build noise, `0d` item lag, halves parallel Build WIP `2 -> 1` in Ch. 4+) |
| `testing` | `ch=3` | `0` Off · `1` Light (`1.0d`) · `2` Standard (`1.8d`) · `3` Strict (`2.8d`) |
| `reach` | `ch=5` | `0` Silent (`25%`, `0.3d`) · `1` Narrow (`60%`, `0.5d`) · `2` Broad (`85%`, `0.8d`) · `3` Full (`100%`, `1.1d`) |
| `msgCheck` | `ch=5` | `0` \| `1` Check messaging & docs against build (`~88%` less label noise, `+1.0d`) |
| `diag` | `ch=6` | `0` \| `1` Diagnostic channel: watch real users post-launch (`+0.7d`, isolates Rollout / Build / Discovery) |
| `andon` | `ch=7` | `0` \| `1` Andon cord: pre-empt & flush obsolete queues on shock |
