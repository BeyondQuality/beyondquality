---
author: Vitaly Sharovatov
status: draft
---
# The governance-management interface for quality

Part of [Governance of quality](quality-governance.md).

This page argues why quality governance sits at the top, then describes what flows between the top and the two functions.

## Why quality governance sits at the top

Managers spend countless hours in alignment meetings and budget-defending meetings, and still products push for deadlines and cut quality, sometimes deep enough to damage the whole product. That much effort with that little effect points at a missing tool: there is no proper economic framework for the trade, clear to everyone involved. This section argues why that framework can only be set at the top.

**Reason #1. Authority.** "Ship now or test more" is one decision, but most organizations cut it in half: PMs answer for delivery, QA and sometimes the developers answer for quality. Each side pushes for what it answers for, and the argument goes to whoever has more authority, usually product. A framework set at their level changes nothing: rules one side writes will not bind the other, and rules they negotiate are the same fight again. The framework binds both sides only when it comes from above both, so that is where it has to be set.

**Reason #2. Incentives.** PMs are rewarded for shipping on time, QA is blamed for escaped failures, and nobody below the top is judged on the balance of the two. Rules written by either side would serve that side's rewards, so only the level judged on the whole outcome can write them neutrally.

**Reason #3. Information.** The framework demands numbers to be set: what quality is worth to the business, what a week of delay costs, what failures cost, in comparable units. No single function sees all of them: product sees the market and the deadlines, quality sees the defects and the failures, and the money numbers that price both sides (revenue, retention, contracts) are visible only above them. Only the top can put this picture together (today it usually has not), which is why the loop described below starts there.

So quality governance sits at the top not because a standard says so. All three reasons point at the same level, and at no other. Deming said the same from inside the quality discipline: company-wide quality efforts hold only when top management leads the change. Once the level is right, the standard gives that level its working vocabulary: evaluate, direct, monitor; delegate inside stated parameters; answer for the outcome. The rest of this page describes the interface those words demand.

## The interface

The interface is everything that passes between the top and the two functions: what flows down from governance, what flows up from product and quality, and who decides what along the way. Most companies already have the reporting lines. What is missing is the content: nothing flows up in comparable units, nothing flows down as stated appetite. (The same mechanism would serve any risk-bearing function, security included; this research develops it for quality and product only, see the [scope](quality-governance.md).)

Down come the parameters only the top can set. The purpose states what the organization is trying to achieve. The value objectives state what quality is worth pursuing and why; [value.md](value.md) describes them. Quality targets state how well the product must satisfy which needs, per quality characteristic and per user segment. Risk appetite and its acceptance thresholds state how much exposure is acceptable in pursuit of the objectives. Policy and delegation limits state who may decide what, and up to which size of decision. Most of these exist in companies already, only unstated: their budget decisions imply an appetite and a price of delay even though nobody ever wrote them down. The interface turns each into an explicit, published statement.

In daily work, policy and delegation become a decision rule. Governance publishes the numbers: what a day of delay costs, what failures cost, what holding the quality target earns. A team facing "ship now or test more" then weighs the delay it avoids against the failures it risks and the quality value it gives up, and checks the result against the published appetite. The decision needs no escalation and no alignment meeting, and the argument no longer goes to whoever pushes harder (the second capability the [problem statement](quality-governance.md) promises). The rule comes from Reinertsen's flow economics; in the standard's terms, teams decide within the authority governance established, and accountability stays above (38500 3.7, 6.1).

Up flow evidence from testing and reviews, current exposures, acceptance decisions with their sign-offs, breaches and escapes. The upward flow has two jobs. The first is recalibration: evidence updates the parameters, otherwise they stay last year's guesses. The second is accountability: the body that set the appetite must be able to answer for what it tolerates, and the exposure reports and sign-offs are the record it answers from. Without the upward flow, the top just issues orders and never learns whether they work. Governance is both flows together.

Run continuously, the interface is a loop. Governance sets the parameters (value objectives, risk appetite) from the whole picture. Management turns them into work: it pursues the quality targets, runs the prioritized risk register, and decides the everyday cases locally inside the published parameters; the four-step loop of [Economics of Testing](../testing_economics/testing_economics.md) is exactly this machinery, and [implementations.md](implementations.md) carries the mapping. Evidence and exposures flow back up. The parameters get updated, and the loop runs again; it is never-ending by design. Economically, it is constrained optimization sustained over time: maximize value, subject to exposures staying within appetite. That is one half of the "maintain" promised in the research's [purpose statement](quality-governance.md): the loop keeps the numbers current. The other half, keeping the loop itself alive, is [the erosion thesis](erosion.md)'s subject.

<!-- Interface diagram placeholder. -->
