I tried applying the same QA improvement approach (described in the economics of testing research) in different companies, with mixed results. As a consultant, the change landed and scaled; as an internal QA engineer, the effort stalled. This contrast is why I want to study the social nature of resistance to change and give practical advice for engineers who want to improve QA processes in their companies.

One plausible mechanism is that a consultant role creates external legitimacy and a clear mandate for change, which can increase perceived readiness/implementation climate and reduce the political risk of rebudgeting. Internal QA often lacks that legitimacy and mandate, so status‑quo forces may dominate (e.g., loss aversion/status quo bias, reduced voice under threat, weak implementation climate) even when the technical case is strong. This observation is what made me think and dive deeper into the social nature of resistance to change; it also feels as if a consultant is simply better listened to by management.

**Research scope (for now)**: focus on explaining why change might be rejected or stalled. Practical guidance on effective change management will come after the explanatory map is solid.

**Assumption**: the change is instrumentally rational under the economics‑of‑testing model assumptions (i.e., it improves expected total cost of quality over an appropriate horizon). The research question is why such rational changes still stall or get blocked, and what social or organisational forces override the technical case.

We are using [Consolidated Framework for Implementation Research (CFIR)](https://cfirguide.org/) as an organising lens because it is a widely used, research-based taxonomy synthesised from multiple implementation theories and repeatedly applied in empirical studies. It provides a formal structure for mapping barriers.

It organises determinants into 5 domains (intervention characteristics, outer setting, inner setting, characteristics of individuals, process). Here is CFIR's construct example on [Implementation Climate](https://cfirguide.org/constructs/implementation-climate/)

Note: I am using the CFIR Guide presentation of the classic domains; newer CFIR updates use slightly different labels (e.g., "Innovation").

Mapped sources by CFIR domain:

**Intervention characteristics**

What the change is like: evidence strength, relative advantage, complexity, adaptability, cost, and how it is packaged.

Even when the change is rational, perceived complexity, cost, and disruption can make it look risky, while evidence strength and relative advantage can be discounted under short‑term pressure or low salience.

The economics of testing model predicts long‑term gains in quality (and can indirectly improve delivery speed under some conditions), but managers might still face _immediate_ delivery risk, visible budget costs, and accountability to current KPIs. That local short‑term pressure can outweigh the broader long‑term gains, especially if ownership of quality and benefits is unclear or not mapped to their current KPIs and team context.

Relevant constructs and sources:
- **[Evidence strength and quality (CFIR)](https://cfirguide.org/constructs/evidence-strength-quality/)**
- **[Relative advantage (CFIR)](https://cfirguide.org/constructs/relative-advantage/)**
- **[Complexity (CFIR)](https://cfirguide.org/constructs/complexity/)**
- **[Adaptability (CFIR)](https://cfirguide.org/constructs/adaptability/)**
- **[Design quality and packaging (CFIR)](https://cfirguide.org/constructs/design-quality-packaging/)**
- **[Cost (CFIR)](https://cfirguide.org/constructs/cost/)**


**Outer setting**

External context: customer needs, market pressures, peer influence, and external policy or regulatory incentives.

If external signals are weak or not salient, the change can still stall even when it is rational. For example, markets may reward short‑term speed, customers may not demand quality improvements, and regulations may not incentivise prevention.

How this applies to the economics of testing: if buyers are not churning because of defects, competitors ship faster with fewer checks, or external incentives value velocity over reliability, managers may feel pressure to keep the status quo despite the long‑term case for testing.

Relevant constructs and sources:
- **[Patient needs and resources (CFIR)](https://cfirguide.org/constructs/patient-needs-and-resources/)** (in this context, customer/user needs)
- **[Cosmopolitanism (CFIR)](https://cfirguide.org/constructs/cosmopolitanism/)**
- **[Peer pressure (CFIR)](https://cfirguide.org/constructs/peer-pressure/)**
- **[External policies and incentives (CFIR)](https://cfirguide.org/constructs/external-policies-and-incentives/)**

**Inner setting**

Internal context: structural characteristics, networks/communication, culture, implementation climate (including incentives), and organisational readiness for change.

Even when the change is rational, internal structures and incentives can still block it if teams are optimised for delivery speed, cross‑team coordination is weak, or the climate does not reward preventive work.

How this applies to the economics of testing: the long‑term gains can be outweighed by local incentives that reward shipping features, organisational silos that make quality a shared but unowned problem, or a climate where slowing down is punished.

- Klein & Sorra in their [The Challenge of Innovation Implementation](https://www.jstor.org/stable/259164) paper define implementation climate as whether innovation use is **expected, supported, and rewarded**, and link it to outcomes like avoidance vs commitment. Also related "[meaning and measurement of implementation climate](https://link.springer.com/article/10.1186/1748-5908-6-78)"

- **[Psychological safety](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Edmondson%20Psychological%20safety.pdf)** — safety predicts learning behaviours (speaking up, reporting errors, experimentation). **[Organisational silence](https://www.jstor.org/stable/259200)** — silence is a systemic barrier to change and development.
- These constructs are related but distinct: threat‑rigidity is about how threat changes information processing and control; psychological safety/silence are about whether people surface concerns and errors; implementation climate is about whether use of the new practice is expected, supported, and rewarded.

- **[Threat-rigidity](https://www.jstor.org/stable/2392337)** — under threat, information processing restricts and control constricts (bad for learning/rebudgeting).

- **[Kerr: "Rewarding A while hoping for B"](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Motivation/Kerr_Folly_of_rewarding_A_while_hoping_for_B.pdf)**, **[Campbell's warning about indicator corruption](https://www.jstor.org/stable/pdf/27521792.pdf) / [Goodhart](https://en.wikipedia.org/wiki/Goodhart%27s_law)'s law** — reward systems can reinforce the opposite of what is intended. For instance, if managers are rewarded for velocity, they wouldn't agree to slow down short-term to get preventive measures done right so that they could increase speed and quality later.

Additional supporting theories relevant to this domain:

- **[Weick: Sensemaking](https://uk.sagepub.com/en-gb/eur/sensemaking-in-organizations/book4988)** — under ambiguity, organisations coordinate via shared narratives; misaligned frames stall action.

- **[Hannan & Freeman structural inertia](https://www.jstor.org/stable/2095567)** — organisations are biased towards stability; change constrained by entrenched structures/routines.

- **[Armenakis et al. readiness](https://www.researchgate.net/profile/Achilles-Armenakis/publication/211381460_Creating_Readiness_for_Organizational_Change/links/00b7d51bc166dd4dce000000/Creating-Readiness-for-Organizational-Change.pdf)** — readiness is a precursor to resistance/adoption; assess/build readiness before rollout.

**Characteristics of individuals**

Individual-level factors: beliefs, knowledge, self‑efficacy, stage of change, identity, and personal attitudes towards the change.

Even when the change is rational, individual fears, identity threats, or low self‑efficacy can lead people to discount it or avoid the effort required to implement it.

How this applies to the economics of testing: engineers or managers may feel that testing changes undermine their current identity as "fast shippers", or they may doubt their ability to implement testing practices without slowing delivery, leading them to resist despite the rational case.

- **[Prospect theory](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Behavioral_Decision_Theory/Kahneman_Tversky_1979_Prospect_theory.pdf)** — loss aversion/reference dependence: immediate certain losses outweigh probabilistic future gains.

- **[Status quo bias](https://web.mit.edu/curhan/www/docs/Articles/biases/1_J_Risk_Uncertainty_7_%28Samuelson%29.pdf)** — people disproportionately stick with the current allocation ("do nothing" default).

- **[Hovland & Weiss: source credibility](https://doi.org/10.1086/266350)** — low-credibility sources reduce immediate persuasion, and source discounting can fade over time (content/source dissociation); relevant to why external consultants can be "better listened to".

- **[Oreg (2006)](https://bschool-en.huji.ac.il/sites/default/files/businesshe/files/oreg_2006_ejwop.pdf)** — resistance is multifaceted and associated with both personality and organisational context.

**Supplementary sources (relevant but not CFIR constructs)**

- **[Suchman: legitimacy](https://www.jstor.org/stable/258788)** — organisations grant/withhold legitimacy; perceived legitimacy shapes who gets heard and what actions feel acceptable.

**Process**

How change is enacted: planning, engaging, executing, and reflecting/evaluating over time.

Even when the change is rational, poor engagement, weak coalition‑building, or inconsistent execution can stall it, especially when there is no clear owner or feedback loop to sustain momentum.

How this applies to the economics of testing: the case may be strong, but if no sponsor owns the rollout, stakeholders are not engaged early, and outcomes are not tracked, the initiative can fade even when everyone agrees it is rational.

- [Normalization Process Theory](https://link.springer.com/article/10.1186/1748-5908-4-29) focuses on the work people do to **embed and sustain** a new practice as "how we do things here".

- **[Pfeffer: Managing with Power](https://books.google.com/books/about/Managing_with_Power.html?id=xbEN74KGZgsC)** — implementation is influence + overcoming resistance; "good decision" != behaviour change.

- **[Kotter](https://hbr.org/1995/05/leading-change-why-transformation-efforts-fail-2)** — recurring reasons transformations fail (urgency, coalition, barriers, reinforcement, etc.).

CFIR gives a systematic checklist of where blockage can occur: the change itself, the external context, the internal context, individual beliefs, or the implementation process. This makes diagnosis less anecdotal and more structured.

Using CFIR to analyse the consultant vs QA story:

Two alternative explanations to keep in mind: a selection effect (companies hire consultants when urgency and leadership buy‑in are already high) and sponsorship/accountability (consultant engagements often have an executive sponsor with reputational skin in the game).

**Intervention characteristics**: in the consultant role, prior "success cases" were requested as proof, which increased perceived evidence strength despite potentially limited transferability across companies. As internal QA, the same proposal was more likely to be judged by its immediate complexity and cost without a clear short‑term payoff.

The key difference is the default treatment of the same proposal. Being invited as a consultant signals that change is already desired, which raises the perceived legitimacy and lowers perceived risk. Separately, the request for "success cases" acts as a packaging and evidence‑strength signal: it can boost perceived credibility even though transferability is uncertain. As internal QA, without those default signals, the same proposal is more likely to be seen as extra process, extra cost, and extra risk to delivery schedules.

**Outer setting**: an external consultant often arrives because leadership already feels external pressure (customer demands, market risk, or board expectations). That external pressure creates a sense of urgency and makes the organisation more willing to rebudget or accept short‑term slowdown. As internal QA, I had less leverage to turn those external signals into an explicit mandate.

The same rational proposal can look optional or non‑urgent when there is no external forcing function. If customers are not visibly leaving because of quality issues, or if competitors are not penalised for low testing, leaders may not feel compelled to act. As a consultant, the timing itself signalled that the organisation already decided this was a business issue, not just a QA preference.

**Inner setting**: consultant involvement can shift implementation climate and readiness by signalling that change is expected and supported. It can also change how teams interpret incentives: "we hired help, so we are serious about changing the way we work". In practice, that often means top‑down incorporation into OKRs/KPIs and delivery goals. As internal QA, the proposal could conflict with local incentives that prioritise delivery speed over preventive work.

The difference is not just formal approval; it is also informal interpretation. Teams may read a consultant's presence as permission to slow down or to refactor processes. In contrast, an internal QA engineer proposing the same change can be perceived as protecting their own function or adding gatekeeping, which reduces receptivity.

**Characteristics of individuals**: managers may assign higher credibility to external expertise and be more open to recommendations that come from outside the organisation. Some individuals are more willing to accept uncomfortable changes when they are framed as expert guidance rather than internal critique. As internal QA, I might be perceived as advocating for my own function rather than for broader organisational outcomes.

There can also be status or role‑threat dynamics: a highly active QA engineer may be seen as encroaching on a manager’s domain or signalling that current leadership is insufficient. These individual perceptions can then cascade into group behaviour. If people do not trust the messenger, they discount the message, regardless of the underlying rationality. That is a key reason why the same argument can receive a very different reaction depending on who delivers it.

**Process**: a consultant role makes it easier to secure a sponsor, build a coalition, and create explicit ownership and milestones. The work gets a formal process: discovery, agreement on scope, explicit commitments, and regular progress reviews. Reflecting/evaluating is expected, often contractually, and people are more likely to support data collection and measurement. As a QA engineer, I may lack the mandate and support to drive planning, execution, and feedback loops across teams.

In practice, this means the change can die in the "everyone agrees in principle" stage. Without a named owner, a timeline, or shared accountability, the rational case does not translate into sustained action. Cost also shapes perception: a consultant is a visible investment, often sponsored by a director who is personally accountable, which can raise attention and follow‑through compared to an internal QA‑led initiative.