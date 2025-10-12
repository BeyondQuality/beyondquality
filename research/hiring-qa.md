# QA Approaches in Hiring: From Shift-Left Testing to Shewhart's Control Charts

- Author: [Vitaly Sharovatov](https://github.com/sharovatov)
- Collaborators: [Anupam Krishnamurthy](https://github.com/anupamck)
- Date: 8 October, 2025
- [Discussion thread](https://github.com/BeyondQuality/beyondquality/discussions/22)

## How QA principles can be applied to hiring.

This document contains two sections: the full one with all the content, and the short one where I will be preparing my talk based on this content.

# Full version

---

Hiring is a process, its goal is to fulfill the company's requirements by bringing in new team members who have (or are close to having) the skills to do work the current team cannot, and who stay long enough to deliver sustained value as part of the team.

We can say that hiring process _quality_ is the degree to which the hiring process's inherent characteristics fulfil its requirements (i.e., consistently producing quality hires with minimal waste, within a defined, documented, and controlled process). This follows ISO 9000's definition of quality.

How can we assure hiring quality? Simply do more interviews? I doubt.

# Process overview

Hiring quality doesn't emerge from intuition or luck, it rather emerges from how the process is designed and operated. If it is treated merely as a vague sequence of "find > interview > hire", then it's really hard to reason about its quality. If it is properly reasoned about as a system of subprocesses with their own inputs, outputs, and feedback loops, then we can see where it is efficient or inefficient, and in the latter case, we can change its design to eliminate waste.

Like any other system, hiring starts with a signal of need and ends with an outcome that either meets that need or doesn't. Between those points, multiple transformations happen: information becomes requirements, requirements become decisions, decisions become actions, and actions produce results that can be verified and measured.

Before we even start "hiring", there are steps that, in theory, must happen. In practice, they often don't — but omitting them distorts the whole process, because it means we start reacting to symptoms instead of diagnosing causes. Hiring isn't a standalone process; it is initiated by a sequence of decisions that follow signals of constraint or opportunity. So let's outline what should happen before hiring actually begins.

## Before hiring

**TODO**: revise the thing about constraints?

1. Diagnosing a constraint in existing processes, or a trend showing that one will inevitably emerge. This can come from regular process analysis or from a specific signal, such as a new contract being signed or a key person preparing to leave. Since every hire increases organizational complexity, hiring should never happen without clear justification.

2. Analysing if hiring can be avoided.

Proceed only if we make a decision that other measures are less efficient than hiring. To consider:
- we can list the work types and queues the person will relieve
- we tried at least one non-hiring countermeasure (or have a solid reason it won't help)
- we have a job analysis and realistic job preview (constraints/trade-offs included)
- we know where this role sits in the flow and how we'll see the effect (which charts should shift)
- we have onboarding capacity (buddy, 30/60/90 outcomes), so the hire doesn't reduce net throughput for months

These steps ensure that hiring begins as a controlled response to a defined constraint, not as a reflex to workload noise.

## Within hiring

Before hiring, we decide whether adding a person is the right countermeasure. Once that decision is made, the process shifts from _diagnostic_ to _productive_: we start "transforming the hiring signal into an actual team member".

When the decision to hire is made, the following processes are always executed. When the process is not defined or thought through, it still is executed but implicitly.

1. **Perform job analysis and create Job description [JD] & success criteria & a realistic job preview**. These are like the _requirements_.

2. **Design the validation/verification system**. These are interviews, take home exercises, etc. for the JDs, we need to be able to check if the person matches the requirements [at least to a certain extent].

3. **Design the onboarding system**. We need to be able to teach hired people things we can't reasonably check during interviews or expect them to know in advance.

4. **Define the sourcing strategy**. Essentially, _where to find people_. For instance, internal mobility mapping, referrals, channels, and employer brand assets, prepare candidate infopacks.

5. **Execute sourcing**. Find people [in the chosen channels] who we [and they] _think might match_ the JDs.

6. **Evaluate candidates**. Execute the validation/verification processes for the sourced people.

7. **Offer prep**. For those who pass, do Comp calibration to band/market, all the approvals, negotiation, contingencies (right-to-work, background/reference checks where lawful etc.)

8. **Execute onboarding & integration**. Run the onboaring processes to get the hired people "up to speed".

9. **Evaluate the probation**. Compare actual work outcomes to the selection predictions.

These processes aren't conceptually different from software development processes, where we, the QA folks, know how to improve quality at each step and how to test what needs to be tested. Each subprocess converts certain inputs into certain outputs, and there are multiple feedback loops. For instance, if at stage 5 (Sourcing execution) we see that we don't have any candidates, we must revise something in the earlier stages, maybe the compensation is off, or the channel is inefficient.

Ultimately, hiring behaves like any other system: it transforms inputs through controlled stages toward an intended outcome. This means it can be optimized and assured using the same QA approaches we already apply in software development.

## Applying QA principles and ideas to hiring

Here's an unsorted list of QA ideas and principles I've personally used in consulting and my own work experience.

### 1. Andon cord

In [Toyota Production System (TPS), Andon cord](https://mag.toyota.co.uk/andon-toyota-production-system/) is pulled by workers who notice a problem within the quality control system. The signal means: "Stop. There's a deviation". The issue is analysed immediately, and if it can lead to accumulated waste, the production process is paused until the cause is understood and corrected. The rationale is simple: the earlier we start fixing the problem, the less resources are wasted.

Every QA professional knows this logic: [detect early](https://www.researchgate.net/figure/Historical-cost-to-fix-curve-Adapted-from-Boehm-1981-p-40_fig11_308264787), contain locally, prevent system wide defects. We apply it naturally in software and manufacturing, where feedback loops are visible and measurable. The challenge is to recognise that hiring, though less tangible, is still a process with signals of deviation. Those signals just look different.

In hiring, the same logic applies. Every subprocess has outputs that must stay within expected limits, and when they don't, continuing the process only adds waste. I use Andon-like stops at these points:

1. **Sourcing Execution (5)**. If the funnel is empty after a defined sample (e.g. first 10 reaches), then the sourcing must stop and earlier stages must be reassesed.

2. **Candidates Evaluation stage (6)**. If the first few candidates perform outstandingly poorly (for example, average score below 30 out of 100), stop and reassess the previous stages

3. **In the Offer stage (7)**. If several candidates decline for the same reason, stop and revisit compensation, job preview, or scope alignment.

Each stop prevents downstream waste: more interviews with misaligned candidates, repeated negotiations that fail for the same reason, or onboarding effort spent on wrong hires. Pulling the Andon early means acknowledging that a small, local pause is cheaper than systemic rework later.

### 2. Shift-left testing

When Andon is pulled, the process stops and earlier stages are reassessed. This means the signal from Andon points to where the process design must change. One of the most effective ways to improve those upstream stages is by applying shift-left testing.

In software QA, shift-left means moving verification earlier in the flow, closer to where defects originate. The further right a defect travels, the more expensive it becomes to detect and fix. Shifting checks left reduces rework and stabilises the system.

Hiring follows the same logic. If any subprocess repeatedly produces low-quality outputs, the problem almost always lies one stage earlier. Redesigning that stage, or embedding earlier checks, saves time, effort, and candidate goodwill.

Sometimes this requires a full stage redesign. For instance, if Sourcing Execution (5) consistently yields poor candidates, the issue probably sits in Design Sourcing (4): wrong channels, unclear JD, or mismatched comp band. But often, quality can be improved simply by shifting verification earlier.

Here's how I apply shift-left ideas in hiring:

1. Before sourcing (1->4): improve the Job Description and Realistic Job Preview so candidates can self-select before outreach. The clearer we are about constraints, trade-offs, and expectations, the earlier they can decide whether the role fits. This effectively "outsources" part of testing to candidates themselves.

2. Right after JD creation (1): if the role already exists in the company, test the JD against a current employee. If it's a new role (for example, the first specialised frontender), test it against a known external expert. This prevents inflated or unrealistic requirements, which is equivalent to "requirements testing" in software QA.

3. After the Design the validation/verification system (2): test the interview kit on existing employees in the same role. If they fail the process, that process is invalid and must be redesigned.

Each of these measures moves detection closer to the source of potential deviation. By designing the process this way, we reduce the risk of defects propagating downstream, and as a result, we will pull the Andon cord less often.

### 3. Shewhart's control charts

Shift-left helps us detect issues earlier, but not every fluctuation means the process is broken. In manufacturing, one bad part can justify pulling the Andon because system variety is low, and a single defect often implies a systemic issue. In hiring, human variety is high. One weak interview or failed offer doesn't prove that the process itself has failed.

That's why we need statistical process control. In QA, we distinguish between common-cause variation (the normal noise inherent in a stable process) and special-cause variation, which signals that the system has changed. To tell the difference, we use Shewhart's control charts.

A control chart plots process data over time and sets statistical limits that define expected variation. When a point crosses those limits or forms a non-random pattern, it indicates a special cause that must be investigated. In manufacturing, that might be a worn tool or a new batch of material. In hiring, the process is less mechanical but just as measurable.

Here's how I use Shewhart charts for hiring:

1. **Proportions (p-charts)** — for ratios like CV->interview %, interview->offer %, offer declines for the same reason, or probation-period exits. Weekly buckets work well; _n_ can vary, and p-charts handle that naturally.

2. **Times (XmR charts)** — for durations like time to first response, time to decision, or time to first independent task after onboarding.

When a special-cause signal appears, the rule is simple: stop and examine earlier stages.

For example:
- Off-profile inflow -> revisit JD clarity, comp band, or sourcing channels
- Interview->offer collapse -> recalibrate interview kit, check for interviewer drift, confirm JD↔test alignment
- Repeated offer declines with same theme -> pause and fix scope, comp, or remote policy
- Probation exits increase -> compare onboarding reality vs. selection predictions; fix either onboarding or selection

Control charts make hiring variation visible and actionable. They help us see when the process itself has shifted, not just when outcomes fluctuate. That's how we can apply statistical discipline to a domain that usually relies on anecdotes.

Hiring processes rarely produce large data volumes, but that doesn't invalidate process-behaviour charts. Even with small samples, XmR or p-charts make variation visible and help distinguish between noise and meaningful shifts. The goal here isn't statistical precision but rather a disciplined observation and structured response.

For reference, typical data requirements are modest:
- XmR charts (individuals / moving range) work with as few as 10–12 points, ideally 20–30+.
- p-charts (proportions) — need roughly 20+ subgroups (each subgroup can vary in size), ideally 50–100+.
- x–R charts (average–range) — need 10+ subgroups of 3–5 points, ideally 25+.

In hiring, XmR and p-charts are usually sufficient: they tolerate irregular sample sizes and still reveal process behaviour patterns clearly enough to support improvement decisions.

### 4. Cost of quality

Detecting variation is only half of quality control. Once we see a shift, we need to decide whether it justifies intervention, and if so, how much effort is worth investing to correct it. Every improvement has a cost, and not all costs make sense. In QA, this trade-off is captured by the concept of _Cost of Quality (CoQ)_: the balance between the effort we spend on prevention and appraisal, and the losses we incur from failures. The same logic applies directly to hiring.

In software and manufacturing, CoQ helps us avoid over-engineering. We aim to do just enough prevention and testing to ensure acceptable quality, without wasting resources on unnecessary checks. The same reasoning applies to hiring: too much "testing" (interview loops, exercises, screening layers) wastes candidate time and internal effort, while too little testing increases the risk of bad hires.

In hiring, we also need to think about the cost of quality explicitly. For instance, it makes sense to invest much more into assuring hiring quality for a senior position than for a junior one. The logic is simple: a junior developer has fewer identifiable and measurable skills than a senior, and it's almost impossible to verify "learning capability" in an interview regardless how well structured it is. In such cases, it's often more efficient to cut down on testing and invest more into structured onboarding and teaching.

The logic is simple: prevention and appraisal costs should be smaller than the internal and external failure costs they help avoid. For example, investing heavily in automated testing for a one-off marketing page would be wasteful: the appraisal cost exceeds the potential failure cost. In hiring, the same principle tells us where to invest our quality effort.

1. Frame the risk: define impact * reversibility * time pressure for the role. High-risk -> deeper prevention/appraisal; low-risk -> lighter checks, stronger onboarding.

2. List the failure costs: what's painful now: late rejections? same reason for offer declines? probation exits? write the concrete failure I want to reduce.

3. List 2–3 upstream options: sharpen jd + realistic preview; add a 30-min role-real micro-sample; pair interviews + anchored rubrics; interviewer calibration.

4. Quick Compare (back-of-the-envelope): extra prevention/appraisal effort vs. likely drop in the failure you named. pick the smallest option with the best payoff.

5. Run a tiny experiment: apply it to the next ~5 candidates. Annotate my p-chart/xmr with the change

6. Read the signal, decide: signal disappears -> keep, nothing changes -> revert or try the next option.

7. Respect role differences: seniors/high-impact: clearer jd + preview, calibrated work sample, pair debriefs. juniors/low-impact: references + minimal screen + tiny sample; invest in onboarding/teaching instead of trying to "measure learnability" in 60 minutes.

CoQ makes hiring decisions economically rational. It forces the same discipline we use in QA: allocate quality effort where it pays off most, and accept reasonable imperfection elsewhere. This closes the loop from detection to prevention to optimisation, with cost awareness guiding every improvement.

Optimising the cost of quality tells us how much assurance effort to apply in total. The next question is where to apply it first. Not every role carries the same risk, and not every possible failure has the same consequence. In QA, we address this by using risk-based testing — prioritising testing effort based on the impact and likelihood of failure. The same principle can guide hiring.

### 5. Risk-based testing

In manufacturing, testing effort is never uniform. Parts that can cause catastrophic failure if they break (like brake components in a car or pressure valves in a reactor) are tested more frequently and under stricter conditions than decorative parts. This isn't about perfectionism; it's about managing risk. Testing intensity follows the potential impact of failure.

In software development, the same principle applies. We don't test every module equally, we spend more effort on testing the ones that can cause the greatest loss if they fail. A login function, payment processor, or safety-critical control system deserves heavier testing than a static help page. This is risk-based testing: allocate verification effort where failure carries the highest cost.

Hiring can follow exactly the same logic. The selection strategy should match the risk profile of the role and the failure modes that matter most. The goal is to spend testing effort where the consequences of a bad decision are highest.

To do that systematically, we can treat hiring as a risk-managed process and follow a simple sequence.

#### 1. Define the risk

Assess the role's impact on customers, safety, compliance, or critical operations; the reversibility of a bad hire; time pressure; and the degree of coupling with other critical systems or teams.

#### 2. Identify likely failure modes

- False positive on core skill
- Misfit on constraints (time zones, on-call, stakeholder load)
- Behaviour under load (ambiguity tolerance, recovery from mistakes)
- For managers: inability to hire, coach, or align others

#### 3. Map checks to risk level
- High-impact, low-reversibility roles -> deeper work-sample tied to JD's quality attributes; pair scoring with anchored rubrics; structured behavioural probes for comparable past outcomes; reference checks focused on the same anchors
- Medium-risk roles -> short, role-real micro-sample with anchored rubric; one behavioural loop; skip low-validity trivia
- Low-risk / junior roles -> minimal screen and references; avoid chasing weak validity signals; shift effort to onboarding and early feedback

#### 4.	Constrain appraisal debt

Cap total interview time and number of loops. Every check must trace to a defined risk or JD requirement. If a question or exercise doesn't map to a listed risk, remove it.

#### 5.	Decide with evidence

Use the smallest set of checks that meaningfully reduces the top two risks identified, then observe outcomes during probation and adjust.

This approach aligns with ISO 9001's risk-based thinking and ISO 31000's risk-management framework: identify, evaluate, mitigate, and monitor. It assures hiring quality by directing assurance effort where it delivers the highest return, while avoiding waste.

Prioritising assurance effort by risk helps us focus on what matters most, but focus alone isn't enough. Even a well-designed process will degrade if it runs beyond capacity. When workload exceeds the system's limits, signals blur, feedback slows, and quality drifts. In QA and Lean manufacturing, flow control prevents this by limiting work-in-progress. The same principle applies to hiring.

### 6. WIP limits

In manufacturing, production quality drops sharply when work-in-progress (WIP) exceeds system capacity. When too many parts are on the line at once, queues build, inspection slows, and attention fragments. Toyota's flow systems limit WIP at every stage, not to reduce throughput, but to keep it predictable. A stable flow prevents rework and allows immediate detection of upstream issues.

In software development, the same principle applies. Teams that start too many features at once see quality collapse and delivery slow down. Bugs pile up, feedback loops stretch, and context switching erodes concentration. Limiting WIP keeps cycle times short and stabilises output quality. It's a control mechanism, not a throttle.

Hiring behaves the same way. Like any pipeline, it "clogs" when we overload stages. WIP limits keep the process stable, preserve calibration, and prevent quality drift.

1. **Limit concurrent candidates per stage**. For example, cap at 3–5 candidates in the final loop per role. Too many concurrent evaluations lead to rushed debriefs and inconsistent decisions.

2. **Limit interviewer WIP**. Cap interviews per person per week to avoid fatigue, rushed scoring, and loss of calibration time.

3. **Limit open requisitions per hiring manager**

Fewer parallel roles create faster, clearer feedback loops.

- Use a visible flow board: columns = stages (JD, sourcing, screen, loops, offer, onboarding). Assign WIP limits per column; surface blockers daily.

- Track flow metrics: cycle time (screen -> decision), queue age per candidate, blocked work. Apply a stop-the-line rule if queue age breaches a defined threshold.

4. **Little's Law (practical)**. Throughput = WIP / cycle time. If cycle time is growing, WIP is too high.

Managing WIP is process control. When each stage operates within capacity, signals become clearer, feedback is faster, and quality stabilises. WIP limits don't slow hiring down, but rather make flow predictable and quality measurable.


**TODO**: add the process map and visualise interventions

---


# Talk version

---

...
