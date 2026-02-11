# VERY EARLY DRAFT EXGTREMELY EARLY DRAFT

**Speakers**: Vitaly (plays the manager) + Anupam (plays the engineer)

**Format**: Standup-comedy-style pair talk. Short roleplay scenes alternate with straight explanatory segments. Scenes are relatable, slightly exaggerated, and funny (I hope). Explanations are based on the research and our experience.

**Core message**: The "technical" quality and rationality of a testing improvement proposal is necessary but not sufficient. Engineers must also address the social, political, and structural conditions that determine whether a rational proposal gets adopted.

**Research base**:
- [Economics of testing](https://beyondquality.org/research/testing_economics/testing_economics) — the model for building a rational proposal
- [Social resistance to rational change](first.md) — CFIR-based analysis of why rational proposals get rejected
- [Companion guide](companion-guide.md) — practical strategies for overcoming resistance

---

## Opening (3-5 min)

Straight intro. Set up the premise:

- We all know what good testing looks like. We have models, standards, evidence. The economics of testing tells us how to build a rational, justified testing strategy.
- And yet: many engineers who propose well-reasoned improvements get rejected, stalled, or ignored.
- Meanwhile, consultants proposing the same changes often succeed.
- This talk is about why that happens and what engineers can do about it.

Briefly introduce the two characters: Anupam is The Engineer. Vitaly is The Manager. We will show you what you already know, and then explain what is actually going on underneath.

---

## Scene 1 — "Let's circle back" (2-3 min)

**Resistance factor**: Time scarcity, overload, structural inertia.

**Setup**: Anupam has prepared a case. He's excited. He walks up to Vitaly-the-manager, who is visibly drowning — glancing at laptop, checking phone, half-listening.

**The scene**:
- Anupam: "Hey, I've been looking at our testing strategy and I think we can significantly reduce escaped defects if we shift some of our investment from—"
- Vitaly (not looking up): "Uh-huh."
- Anupam: "—from end-to-end regression to earlier prevention. I ran the numbers and—"
- Vitaly: "Yeah that sounds interesting. Can you send me a doc? Let's circle back next quarter."
- Anupam: "...it's already in a doc. I sent it two weeks ago."
- Vitaly: "Right, right. I'll look at it. Definitely."

_(Anupam turns to the audience with a knowing look.)_

**Break character. Explain (3-5 min)**:

What just happened? The manager didn't reject the idea. He didn't even evaluate it. He couldn't — he's overloaded.

Explain:
- Managers are often operating at capacity. Reviewing a proposal thoughtfully, building internal support, shepherding it through approval — this all takes time and energy they may not have.
- Structural inertia (Hannan & Freeman): organisations are biased towards stability. The default is to continue what is already in motion. Changing requires effort; not changing is free.
- This is not personal. It is structural. The manager isn't lazy or hostile — they are rationally conserving scarce attention.

**What to do about it**: size the ask (companion guide Strategy 4). Don't bring a portfolio restructuring to a hallway conversation. Bring a one-paragraph summary with a specific, small ask: "Can I run a two-week pilot on our team? Here's what I'll measure." Make the cost of saying yes as low as possible.

---

## Scene 2 — "We ain't got time" (2-3 min)

**Resistance factor**: Budget rigidity, short-term pressure, incentive misalignment.

**Setup**: A proper meeting this time. Anupam has a slot. Vitaly-the-manager is actually listening.

**The scene**:
- Anupam: "So I've analysed our defect data. 30% of our sprint capacity goes to rework and hotfixes. If we invest in prevention — design reviews, better unit test coverage on the payment module — we can cut that significantly."
- Vitaly: "I hear you. But look at this roadmap. We promised all of this by Q3. The board is watching. I can't tell the team to slow down right now."
- Anupam: "It's not slowing down, it's—"
- Vitaly: "I know, I know. 'Invest now, save later.' But my OKR review is in June. I need features shipped, not a testing experiment."
- Anupam: "But we're already slow because of the rework—"
- Vitaly: "Look, I agree with you in principle. But not this quarter. Maybe next quarter."

_(Pause. Both turn to the audience.)_

**Break character. Explain (3-5 min)**:

The manager understood the argument. He even agreed. But he still said no. Why?

Explain:
- Kerr's "Rewarding A while hoping for B": the manager is incentivised for feature delivery velocity. Prevention investment helps Q3-Q4 but hurts Q1-Q2 metrics. The manager is being rational relative to their incentives.
- Prospect theory (Kahneman & Tversky): the certain short-term cost of slowing down outweighs the probabilistic future gain. Loss aversion makes "invest now, save later" a psychologically losing pitch.
- Budget rigidity: budgets are planned annually. Mid-cycle reallocation means renegotiating commitments and accepting accountability for a deviation.

**What to do about it**: align with the manager's incentives (companion guide Strategy 2). Don't pitch "invest in quality." Pitch "here's how to ship faster." Show that rework is the drag on the metric they are already measured on. Frame prevention as removing an obstacle to their existing goals, not adding a new one.

Also: time the proposal to the planning cycle (Strategy 3). The same pitch that fails in May can succeed in September when next year's budget is being shaped.

---

## Scene 3 — "That's not really your job" (2-3 min)

**Resistance factor**: Source credibility, role/identity threat.

**Setup**: Anupam has gone further this time. He's talked to Support about ticket costs, to Sales about at-risk renewals. He comes with cross-functional data.

**The scene**:
- Anupam: "I spoke with Customer Support. They're spending 200 hours a month on tickets caused by defects we could have caught earlier. Sales told me three renewals are at risk because of reliability issues. I think we need to—"
- Vitaly (interrupting): "Hold on. You spoke with Sales?"
- Anupam: "Yes, I wanted to understand the business impact—"
- Vitaly: "That's... I appreciate the initiative, but that's not really your role. We have processes for cross-team coordination. You can't just go around talking to other departments about our quality problems."
- Anupam: "I wasn't going around anyone, I was just trying to—"
- Vitaly: "Let me handle the stakeholder conversations. You focus on the testing."

_(Silence.)_

**Break character. Explain (3-5 min)**:

This is the most personal rejection. Not "your idea is bad" but "you are not the right person to propose this."

Explain:
- Source credibility (Hovland & Weiss): the same message gets discounted based on who delivers it. Engineers are often perceived as "non-business people caring for tech shiny things." The message is filtered through the messenger's perceived role.
- Legitimacy (Suchman): organisations grant or withhold legitimacy. An engineer proposing cross-functional change may be seen as overstepping, even if the data is solid.
- Identity threat: the manager may feel that the engineer is implying current management is insufficient, or is encroaching on the manager's domain. This triggers defensive behaviour that has nothing to do with the proposal's merit.
- This is exactly why consultants succeed where internal engineers fail. The consultant has external legitimacy by default. Their role explicitly includes talking to Sales, Support, and Finance. The engineer must earn that permission.

**What to do about it**: read the culture first (companion guide Strategy 1 caveat). Frame data-gathering as learning, not as building a case. "I want to understand how quality issues affect us" is received differently from "I've found evidence that we're doing it wrong." And critically: find a sponsor who can open the cross-functional doors legitimately. The engineer provides the analysis; the sponsor provides the mandate.

---

## Scene 4 — "Yeah let's do it!" (2-3 min)

**Resistance factor**: Process failure, no owner, no accountability.

**Setup**: Everything has come together. The manager is enthusiastic.

**The scene**:
- Vitaly: "OK, I've looked at your proposal. The data is compelling. I spoke with my director and she's supportive. Let's do this."
- Anupam: "Great! So, should we set up a kickoff? Define the pilot scope, success criteria, timeline?"
- Vitaly: "Yeah, absolutely. Let me find a slot... actually, this week is packed. Next week I've got offsite. How about we sync after that?"
- Anupam: "Sure."

_(Text on screen: "3 weeks later")_

- Anupam: "Hey, did you get a chance to think about the pilot scope?"
- Vitaly: "Oh right, yeah. Things got crazy with the Q2 planning. Let's definitely pick this up. Maybe after the release?"

_(Text on screen: "2 months later")_

- Anupam: "So... the testing improvement?"
- Vitaly: "Remind me what we decided?"

_(Both turn to the audience.)_

**Break character. Explain (3-5 min)**:

This is the most insidious failure mode. The engineer won the argument. The manager said yes. And nothing happened.

Explain:
- Normalization Process Theory (May & Finch): embedding a new practice requires sustained, deliberate work — coherence (shared understanding), cognitive participation (commitment), collective action (doing the work), and reflexive monitoring (evaluating). A verbal "yes" covers none of these.
- Kotter's failure patterns: without urgency, a guiding coalition, and short-term wins, change efforts fade. Agreeing is not implementing.
- Pfeffer: a good decision does not equal behaviour change. Implementation is influence plus sustained effort plus overcoming resistance over time.

**What to do about it**: when you get the "yes", immediately convert it into structure (companion guide Strategy 5). Define the pilot scope in that meeting. Agree on success criteria. Set a review date. Get it into a shared document with names and dates. A "yes" without a named owner, a timeline, and a review cadence is not a "yes" — it is a polite deferral.

---

## Pulling it together (5-7 min)

Straight segment. No roleplay.

Summarise the pattern: four scenes, four different failure modes, one common thread. The technical case was strong every time. What varied was the social, structural, and political context.

Show the map:

| Scene | What the engineer saw | What was actually happening | What works |
|-------|----------------------|----------------------------|------------|
| "Let's circle back" | Manager doesn't care | Overload, structural inertia | Size the ask, lower the cost of "yes" |
| "We ain't got time" | Manager is short-sighted | Rational response to misaligned incentives | Align with their OKRs, time to planning cycle |
| "Not your job" | Manager is territorial | Source credibility, legitimacy, identity threat | Find a sponsor, frame as learning |
| "Yeah let's do it!" | Manager agreed, so it's done | No process, no owner, no accountability | Convert "yes" into structure immediately |

Key message: **the engineer's job is not just to build the right proposal. It is to create the conditions under which the proposal can be heard, adopted, and sustained.**

This is not cynicism. It is professional skill. Engineers who understand organisational dynamics are more effective at improving quality than engineers who only understand testing.

---

## Close (2-3 min)

Brief return to the economics of testing framing: we have a model that tells us how to invest in testing rationally. We have research that tells us why rational proposals get blocked. And now we have practical strategies to navigate that.

The goal is not to manipulate managers. It is to close the gap between knowing the right thing and being able to do it.

Point the audience to the published research for the full framework:
- Economics of testing: the model
- Social resistance to rational change: the diagnosis
- Companion guide: the strategies

---

## Logistics

**Estimated total time**: 35-45 minutes (adjustable by adding/removing scenes or extending/compressing explanatory segments).

**Props/AV needed**: minimal. Two people, two mics. Optional: a few slides for the summary table and research links. Text-on-screen cards for Scene 4 time jumps.

**Preparation notes**:
- Scenes should be rehearsed enough to feel natural but not scripted word-for-word. The comedy comes from recognition, not from punchlines.
- Each scene should be short (under 3 minutes). The moment the audience gets the point, break character and explain.
- The explanatory segments should reference specific research but stay conversational. This is a talk, not a lecture.
- The transition from "scene" to "explanation" should be clean and explicit. A simple physical cue works: both speakers step forward, drop character, and address the audience directly.
