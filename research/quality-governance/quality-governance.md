---
author: Vitaly Sharovatov
status: work in progress
---
# Governance of quality

## What this research does

Testing strategy, QA process, security work and product work usually run as separate management conversations, each negotiating its own budget, with no shared frame connecting any of them to what the organization is trying to achieve.

This research describes the level above them: governance, the company-wide human system of direction, oversight and accountability, through which an organization decides what quality is worth to it, how much uncertainty it accepts in pursuit of that value, and who answers for the outcome.

The purpose of this research is to provide a tool (a framework) that allows organizations to gain and maintain clarity on the economics of their quality-related decisions. With that clarity, the right people can make these decisions on time and on economic grounds, and monitor their outcomes.

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

The capabilities land differently per role, and no single reader can implement them alone; the [practice page](practice.md) will carry the per-role version: what each role gains next to what each must do.

## 2. Definitions

The vocabulary this research operates, taken from the standards and explained in simple words: governance, the governing body, management, accountability, risk appetite, compliance (including why governance is not compliance), quality as a degree (which is what makes it governable at all), and the working definition the research builds on. Page: [definitions.md](definitions.md).

## 3. Value first, risk second

The ordering thesis, definitional rather than good practice: risk is the effect of uncertainty on objectives, so the value work sets objectives before risks can be derived. The value model (target degrees plus a time-dependent payoff function, with cost of delay as the time term) lives on the same page. Page: [value.md](value.md).

## 4. The governance-management interface for quality

What flows down (purpose, value objectives, quality targets, risk appetite, policy, delegation limits), what flows up (evidence, exposures, acceptance decisions, breaches) and why, the never-ending loop the interface runs as, and why the parameters are set at the top and nowhere else. Page: [interface.md](interface.md).

## 5. The management-layer implementations

The two linked researches as implementations of this governance system, each instantiating different parts: economics implements risk governance, oversight and performance; ai-era-testing implements maintaining governance and accountability when AI writes the software. Page: [implementations.md](implementations.md).

## 6. The erosion thesis

The research's own claim: AI-accelerated development erodes the capacity to run the machinery above unless countermeasures are mandated and funded, and this is where the purpose statement's "maintain" is defended. Page: [erosion.md](erosion.md).

## 7. Putting it to work

The practice layer, per role: what each role gains next to what each must do; the parameters governing bodies set, what QA and engineering leadership supply upward, possibly a short diagnostic. Page: [practice.md](practice.md).

## 8. Scope and non-goals

- In scope: governance of quality, and governance of the use of AI in building software.
- Out of scope: governance of organizations in general (ISO 37000's territory), compliance management as such, security work (the same governance mechanism would serve it, but its standards are not studied in this research; it may be added later), and any reproduction of the standards, which are paraphrased with clause references.

## 9. Reading order

1. This hub.
2. The section pages in order: [definitions.md](definitions.md), [value.md](value.md), [interface.md](interface.md), [implementations.md](implementations.md), [erosion.md](erosion.md), [practice.md](practice.md).
3. [Economics of Testing](../testing_economics/testing_economics.md): the risk-governance and oversight machinery. Its AI-era addendum is planned.
4. [QA in the Age of AI-Accelerated Development](../ai-era-testing/analysis.md): the two debts, the generative ratification loop, the four conditions, and the Direction 3 proposal.

## References

Designations follow each standard's own: 37000, 31000 and 9000 are ISO standards with no IEC involvement; 38500, 38507 and 25010 are joint ISO/IEC standards from JTC 1. The mixed prefixes are deliberate. Standards are paraphrased with clause references only; no licensed text is reproduced beyond fair use.

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
