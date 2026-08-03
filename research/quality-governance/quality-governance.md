---
author: Vitaly Sharovatov
status: structure draft
---
# Governance of quality

<!-- Structure draft 2026-07-27. Each section carries a short description of its intended content; the meat comes after structure review. Working title and folder name provisional. Standards are paraphrased with clause references only; licensed text is never reproduced beyond fair use. -->

## What this research does

Testing strategy, QA process, security work and product work usually run as separate management conversations, each negotiating its own budget, with no shared frame connecting any of them to what the organization is trying to achieve.

This research describes the level above them: governance, the company-wide human system of direction, oversight and accountability, through which an organization decides what quality is worth to it, how much uncertainty it accepts in pursuit of that value, and who answers for the outcome.

It does three things:

1. Defines quality governance and its interface with management, using the vocabulary of ISO 37000, ISO/IEC 38500 and ISO/IEC 38507: what flows down (purpose, value objectives, risk appetite, policy) and what flows up (evidence, exposures, acceptance decisions).
2. Positions two existing researches as management-layer implementations of this system for the quality domain: [Economics of Testing](../testing_economics/testing_economics.md) and [QA in the Age of AI-Accelerated Development](../ai-era-testing/analysis.md).
3. Advances its own thesis: AI-accelerated development does not merely add risks for this system to process; it erodes the human capacities the system runs on unless deliberate countermeasures are taken. The countermeasures are partly formulated in the ai-era-testing research already, and this work will feed updates back into it; governance is the level where they get mandated.

## 1. Problem statement

This section makes four observations and names their shared root.

- **Quality conversations are loss-driven and unstructured.** When quality comes up at all, it is about what broke or could break, almost never about what better quality would win. Yet even the loss side is rarely formalized: most companies run quality decisions on intuition and precedent, without a risk register, and an explicit value model does not exist at all. (The section will show why losses dominate the conversation, and why neither side gets structured into a model the organization can act on.)
- **The speed-quality fight runs with no numbers on either side.** Product fights for speed: it feels the cost of delay (deadlines, competitors) but cannot price it. QA fights for quality: it feels the failure risk but cannot price it either, often feels it is losing, and the AI era sharpens the loss (the ai-era-testing premise: testing-after cannot keep up with agent-speed code production). Neither side knows how to reason about the thing it is fighting for, so there is no common ground: the fight is settled by loudness and seniority; each function retreats to its own proxy metrics, the proxies become targets, and by Goodhart's law they stop being good measures. The result is one trade-off, a time term and a quality term of the same objective function, split across two functions with no exchange rate between their currencies and no owner of the sum.
- **Quality work is governed in silos.** QA work, security work and product work run as separate functions with separate budgets and separate escalation paths, although a single body is accountable for all three and sets one purpose across them. Risk appetite legitimately differs across the three (a company may tolerate months without new features and not one security breach), but the differentiation is itself a decision of that one body, and today nobody makes it: each silo's tolerance emerges implicitly from its own budget fights. The reporting lines exist; a quality interface does not: nothing flows up in comparable units, nothing flows down as explicit appetite, and nobody compares the exposures.
- **AI is being adopted into construction faster than it is being governed.** Companies hand code production to agents at a pace set by the market, and the adoption decision typically arrives with none of the instruments the AI-governance standard itself calls for: no human-oversight conditions, no delegation limits, no statement of appetite (ISO/IEC 38507). It is the speed-quality trade again, at the adoption scale: the speed side is visible and celebrated, the cost side is unpriced. Within this research's scope, the unpriced cost is knowledge: as agents take over construction, comprehension debt (the how) grows faster, and intent debt (the why) grows more slowly but is the harder one to recover.

The four observations are one information deficiency (no model of value or loss), one decision deficiency (no exchange rate between the time term and the quality term, no owner of the sum), one structural deficiency (no interface where the sum could be owned), and the same decision deficiency repeated at the adoption scale, under an external dynamic that erodes the knowledge any fix would run on. The root: quality is treated as a set of management practices with nothing above them. The governing body's instruments (purpose, value objectives, risk appetite, policy, delegation) are never explicitly connected to the quality work done below. The disconnect is self-reinforcing: organizational structure, incentive schemes, and the way processes and responsibilities are defined all shape one another, and together they produce the silos and the Goodhart's-law effects (a measure that becomes a target stops being a good measure) that keep each function optimizing its own numbers. This is why Deming's company-wide quality efforts only work when top management takes on leadership for the change, and why the governance standards make the same demand: governance starts from the very top, otherwise nothing works.

Repairing the four deficiencies buys four capabilities, one per deficiency, stated as capabilities rather than outcome promises: what becomes possible and decidable, not what improves by how much.

- **Information:** the organization can state what quality is worth to it and what it stands to lose; quality investment gets an objective function instead of a plea.
- **Decision:** the speed-quality trade becomes a decision made inside published exchange rates, locally and without escalation; loudness stops being the tiebreaker.
- **Structure:** the governing body sees one exposure picture in comparable units and sets its appetite vector deliberately; it can answer what it tolerates and why.
- **Adoption:** AI adoption at a pace the organization can sustain: the debts named and watched, the countermeasures mandated and funded, the capacity to supervise, intervene and evolve retained.

The capabilities land differently per seat, and no single reader can implement them alone; §7 carries the per-seat version: what each seat gains next to what each must do.

## 2. Definitions

- **Governance vs management**, per ISO/IEC 38500: governance is the human-based system of directing, overseeing and holding to account (3.3); management fulfils the objectives within the authority and accountability that governance establishes (3.7). Accountability cannot be delegated, whether to a manager or to an AI system.
- **Governance is not compliance.** The section also covers the failure mode where management structures absorb governance functions (building on the argument in discussion #43).
- **Quality**, per ISO 9000 / ISO/IEC 25010: the degree to which what is produced matches the stated and implied needs of users and customers. Because it is a degree, "how well" is a decision variable, and that is what makes quality governable at all.
- **The one-liner the research builds on:** governance is the company-wide human system of direction, oversight and accountability; risk appetite is one of its instruments and value generation another; QA, security and product management operate within the parameters it sets.

## 3. Value first, risk second

This section states the ordering thesis, which is definitional rather than good practice: risk is the "effect of uncertainty on objectives" (ISO 31000:2018, 3.1), so until value work has set the objectives, there is nothing for a risk to be a risk to.

- The value work has two halves: target degrees of quality (how well we intend to satisfy which needs, per characteristic and per segment) and the payoff function (what achieving each target is worth: retention, win rate, price premium, deals unblocked). Two organizations can set identical targets with entirely different value at stake.
- The payoff function is time-dependent: what achieving and holding a target is worth over time. Priced that way, the cost of delay falls out of it as the time term (Reinertsen's flow economics supplies the method and the single-currency discipline), and "ship now vs test more" stops being a fight between intuitions: it becomes cost of delay compared against expected failure cost, checked against the risk appetite governance set.
- The operational ordering: do the value work first, define what you want to achieve and keep achieving, and only then derive the risks that can stop you.
- "Keep achieving" is extremely important: it is viability and performance over time (38500 5.12), and it is where the erosion thesis (§6) plugs in.
- The channels and measures of the value model get their own page in this research (to be linked when it lands); this section states the ordering and the two halves.

## 4. The governance-management interface for quality

This section applies the evaluate-direct-monitor cycle plus stakeholder engagement to the quality domain.

- Flows down: purpose, value objectives, quality targets, risk appetite and acceptance thresholds, policy, delegation limits.
- Flows up: evidence from testing and reviews, current exposures, acceptance decisions with their sign-offs, breaches and escapes.
- One conversation at the top, three functions below: where QA, security and product management sit, and why the interface is the same for all three.
- Economic decision rules are the operable form of policy and delegation: governance publishes the exchange rates (what a day of delay costs, what a unit of exposure reduction is worth), and teams decide locally within them without escalation. This is Reinertsen's device serving 38500's delegation element.

<!-- Interface diagram placeholder. -->

## 5. The management-layer implementations

The two linked researches are not special cases of risk management; they are implementations of this governance system for the quality domain, and each instantiates different parts of it. Reinertsen's flow economics is the neighboring implementation for the product domain: the same move (one currency, quantified trade-offs) applied to flow and delay. It presupposes exactly what this research supplies: an owner above the silos who mandates the single objective function.

### 5.1 Economics of testing: risk governance, oversight and performance

- The four-step loop is an evaluate-direct-monitor cycle for the quality portfolio: Step 2 consumes the risk appetite governance sets (acceptance thresholds); Step 4 produces the performance evidence oversight needs; risk-acceptance sign-offs and the risk-to-evidence traceability chain are accountability records.
- Breadth caveat: this covers the product-quality slice of risk governance; cyber, financial and legal risk governance sit outside it.
- Once the value model exists, the framework also implements value generation for quality.

<!-- Mapping table placeholder: four-step loop to 38500 principles and framework elements. -->

### 5.2 AI-era testing: maintaining governance when AI writes the software

- Implements the standards' own question (38507 4.2 "Maintaining governance when introducing AI" and 4.3 "Maintaining accountability when introducing AI") for the case where the AI writes the software.
- Intent debt is losing the capacity to direct. Comprehension debt is losing the capacity to evaluate and monitor. Human-authored anchors are what keep accountability demonstrable. The standard already names the mechanism: "agent atrophy" (38507 6.7.4).

<!-- Mapping table placeholder: the two debts and four conditions to 38500 tasks and 38507 clauses. -->

## 6. The erosion thesis

This section carries the research's own claim, the step §1 does not take: the problem statement establishes that the two debts grow; this section argues what their growth does to the governance system.

- AI-accelerated development does not merely add rows to the risk register. It erodes the organization's capacity to run the register at all: each step of the machinery depends on what the debts deplete. Risk identification needs intent (what could fail, and what failure would cost, cannot be named without knowing what the system is for); evidence evaluation needs comprehension (whether a check is credible evidence, and whether two checks are independent, cannot be judged without understanding what they exercise); review and rebalancing need both. The erosion reaches §3's value work too: intent debt manifests when decisions need to be made, and the value model is made of decisions.
- The erosion holds only in the absence of countermeasures. Those are partly formulated in the ai-era-testing research (human-authored anchors, collaborative construction, the four conditions); this research states who mandates them, and its findings will feed back into updating ai-era-testing.
- Knowledge that used to be a free byproduct of humans doing the work becomes a priced input. Someone has to decide to pay for it (human-authored anchors, collaborative construction, oversight skills), and that decision is a governance act: policy, delegation limits, and the human-oversight conditions of 38507 6.2 (understanding, authority, the ability to intervene). These are the same instruments §1's fourth observation shows arriving late or not at all: governed adoption is the countermeasure funded from the start.
- The erosion also has a price in flow-economics vocabulary: comprehension debt raises the cost of change, and the cost of change is what makes future delay expensive. An organization that can no longer change fast and safely carries a higher effective cost of delay on everything it will ever ship. Cost of Quality accounting alone does not capture this term.
- The consequence for the governing body: the question is no longer only "what are our risks" but "can our organization still know its risks".

## 7. Putting it to work

This section is the practice layer; its meat comes after the structure review. It carries the per-seat expansion of §1's four capabilities: what each seat gains next to what each must do, since no single seat can implement the system alone.

- For governing bodies and executives: the parameters to set (value objectives for quality, risk appetite, oversight cadence, AI delegation limits) and the assurance to demand.
- For QA and engineering leadership: what to supply upward (evidence, exposures, acceptance decisions) and how to run the two linked researches operationally underneath those parameters.
- Possibly a short diagnostic: the signs that an organization has no quality governance.

## 8. Scope and non-goals

- In scope: governance of quality, and governance of the use of AI in building software.
- Out of scope: governance of organizations in general (ISO 37000's territory), compliance management as such, and any reproduction of the standards, which are paraphrased with clause references.

## 9. Reading order

1. This hub.
2. [Economics of Testing](../testing_economics/testing_economics.md): the risk-governance and oversight machinery. Its AI-era addendum is planned; the value model gets its own page in this research.
3. [QA in the Age of AI-Accelerated Development](../ai-era-testing/analysis.md): the two debts, the generative ratification loop, the four conditions, and the Direction 3 proposal.

## References

Designations follow each standard's own: 37000, 31000 and 9000 are ISO standards with no IEC involvement; 38500, 38507 and 25010 are joint ISO/IEC standards from JTC 1. The mixed prefixes are deliberate.

- ISO 37000:2021, Governance of organizations
- ISO/IEC 38500:2024, Information technology, Governance of IT for the organization
- ISO/IEC 38507:2022, Governance implications of the use of artificial intelligence by organizations
- ISO 31000:2018, Risk management, Guidelines
- ISO 9000:2015, Quality management systems, Fundamentals and vocabulary
- ISO/IEC 25010, SQuaRE product quality model
- Deming, W. E., *Out of the Crisis*, MIT Press. The fourteen points (pp. 23-24) ground §1's top-management condition: point 2 has Western management taking on leadership for change, and point 14 makes the transformation everybody's job.
- Goodhart, C. A. E. (1975), "Problems of Monetary Management: The UK Experience", *Papers in Monetary Economics*, Reserve Bank of Australia. The original formulation behind Goodhart's law: an observed statistical regularity tends to collapse once pressure is placed upon it for control purposes.
- Strathern, M. (1997), "'Improving ratings': audit in the British University system", *European Review*, 5(3), 305-321. The usual source of the popular phrasing of Goodhart's law, "when a measure becomes a target, it ceases to be a good measure", paraphrased in §1.
- Reinertsen, D. G. (2009), *The Principles of Product Development Flow: Second Generation Lean Product Development*. Grounds the cost-of-delay and single-currency economics in §3, the economic decision rules in §4, and the delay price of erosion in §6.
- [Economics of Testing](../testing_economics/testing_economics.md) and [QA in the Age of AI-Accelerated Development](../ai-era-testing/analysis.md), the two researches this hub links
