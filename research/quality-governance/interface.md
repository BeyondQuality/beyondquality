---
author: Vitaly Sharovatov
status: draft
---
# The governance-management interface for quality

Part of [Governance of quality](quality-governance.md).

This page describes what flows between the top and the two functions.

The interface is everything that passes between the top and the two functions: what flows down from governance, what flows up from product and quality, and who decides what along the way. Most companies already have the reporting lines. What is missing is the content: nothing flows up in comparable units, nothing flows down as stated appetite. (The same mechanism would serve any risk-bearing function, security included; this research develops it for quality and product only, see the [scope](quality-governance.md).)

## What flows down

Down come the parameters only the top can set:
- the purpose, which states what the organization is trying to achieve;
- the value objectives, which state what quality is worth pursuing and why ([value.md](value.md) describes them);
- the quality targets, which state how well the product must satisfy which needs, per quality characteristic and per user segment;
- the risk appetite and its acceptance thresholds, which state how much exposure is acceptable in pursuit of the objectives;
- the delegation limits, which state who may decide what, and up to which size of decision.

Most of these exist in companies already, only unstated: budget decisions imply an appetite, and every deadline fight implies what a delay is worth, even though nobody ever wrote either down. Through the interface, the top turns the parameters into one explicit, published document, the statement that [value.md](value.md) describes; what a particular delay or a particular failure costs is worked out from it case by case (the decision rule below). Written down together, the parameters are what the standards call a governance policy: the governing body's intentions and direction, formally expressed (ISO 37000 3.2.9), with the risk appetite among its contents (38500 7.2.4).

The statement is a short written document with a fixed set of entries:
- the purpose, and where the company intends to win;
- the numbers each department tracks and answers for;
- one line per bet, with the level, its worth, its cost and its review date;
- the minimums law and contract require;
- the common rule for every need without a bet;
- the risk appetite, per kind of risk, with the size of decision above which management escalates.

[value.md](value.md) describes each part. The framework says what must be readable and leaves the choice of tool to the company. A statement counts as published only when it is used: teams decide against its numbers, the reports refer to them, and the decisions and sign-offs are kept. Otherwise the policy exists on paper only (38500 7.2.7).

The governing body publishes the statement and answers for it (38500 6.1). The whole statement is published anew each time the top remakes it, and refreshed at each reevaluation, when the top re-asks the two questions; between those, each bet has its own review date, and the top reopens a bet at once when an event changes its stakes.

## The decision rule

In daily work, the delegation limits become a decision rule. The statement publishes what holding each level is expected to earn or protect, what shortfall is tolerated, how much risk of each kind the company accepts, and the size of decision above which management must escalate. From these, management works out the numbers for each case as it comes: product with engineering estimates what postponing a particular feature would cost the company, and what a particular failure would cost against how likely it is. There is no company-wide number for what a day of delay costs, because features differ in what their delay loses. A team facing "ship now or test more" then weighs the delay it avoids against the failures it risks and the quality value it gives up, and checks the result against the published appetite. If the case fits inside it, the team decides alone, no meeting, no escalation; if it is bigger than the allowed size, it goes up. The argument is no longer won by authority or by pushing harder (the second capability the [problem statement](quality-governance.md) promises). The rule comes from Reinertsen's flow economics; in the standard's terms, teams decide within the authority governance established, and accountability stays above (38500 3.7, 6.1).

## What flows up

The top has published the statement: the bets, the common rule, the risk appetite. What comes back are the reports through which the top learns whether its numbers hold, and the record from which it answers for what the company tolerates.

Every report refers to a number the statement itself published. A bet is settled in the numbers of the department that backed it; a risk report is compared against the published appetite for that kind of risk. The [problem statement](quality-governance.md) says that today nothing flows up in comparable units; under the statement every report is measured against a published number, so the units are comparable from the start. The top receives summaries; test results, review notes and the rest stay below, with management. The economics research describes how every risk stays tied to its evidence ([step 3](../testing_economics/step3.md)), so when the top wants to check a number, the detail behind it can be pulled up on demand.

At each reevaluation, the top also has someone check the reporting itself, not just single numbers: someone who does not write the reports takes a few of them, traces each back to the raw material behind it, and sees that the numbers match reality and that the machinery works, that breaches really get reported at once and that acceptances really get signed. A false report looks exactly like a true one, so the check runs on that schedule, when nothing looks wrong, and never only on suspicion. 38500 asks for this assurance (5.6.3), feeds its results into the regular assessment of the governance framework (7.2.1), and points at auditing as a further source of it (7.2.7).

Five kinds of reports travel up.

1. **Each bet, checked at its review date.** The department that backed the bet puts its actual number next to the range it expected. Whoever did the work of holding the level puts the actual cost next to the estimate. Both halves of every bet get checked: what it earned or protected, and what it cost. When a number missed its range, its owner adds one line saying why, as best they can tell; accountability includes the duty to inform and to explain how the responsibility was fulfilled (ISO 37000 3.2.2, Note 1). There are three usual answers: we estimated wrong, we did not do the work we planned, or the world changed. Each answer calls for a different correction, so without the why, the top cannot know what to fix.

2. **The current size of each risk.** For every kind of risk listed in the statement, management reports how big that risk is currently estimated to be, next to the published appetite for that kind. The economics research supplies the machinery for measuring this on the quality side ([step 2](../testing_economics/step2.md) and [step 4](../testing_economics/step4.md)). The top sees one picture, in the numbers it itself published.

3. **What management accepted, with signatures.** The risks management chose to accept within its authority, each with the owner, the reason, and a review date; [step 2](../testing_economics/step2.md) of the economics research describes the acceptance decision. These records are what the top answers from when someone asks what the company tolerates and why.

4. **Breaches, and the warnings before them.** A level that fell short by more than its bet tolerates; a legal or contractual minimum broken or nearly broken; a risk that outgrew the published appetite for its kind; a failure that reached customers, with what it cost. Each report says which published number it broke. Breaches serve two purposes at once: they show where the estimates were wrong, and they belong on the record the top answers from. The warning comes before the breach: when a risk keeps growing and is getting close to the agreed limit, management says so while there is still time to act; when the number behind a bet keeps sliding toward the edge of what is tolerated, its owner flags it before it falls out (38500 7.2.6). Ten small problems count as one big one: when management sees the same limit being touched again and again, it reports that as a problem right away, even though no single case crossed the line (5.5.2). When the broken level is one the company promised outside, in a contract or an SLA, reporting it inside is not enough: the affected customers must be told promptly ([value.md](value.md), Part 3).

5. **Proposals to give a need its own bet, or to retire one.** When a department's worsening number traces to a need without a bet, or when a bet's stakes have disappeared, anyone may propose the change. The top decides, at review dates and whenever the whole statement is remade ([value.md](value.md)).

Each report has its moment. A breach, or a warning that one is coming, is reported at once; that is what the appetite and the minimums are for. The current risk sizes are reported on a regular schedule that management keeps; for parts of the system that change quickly, the reports come more often, because a quarterly report is useless for something that changes every week (38500 7.2.6). Each bet is checked at its own review date, set in the statement. When something big changes, a new law, a market shift, a new kind of deal, the top gets fresh reports on the affected entries right away, the same way it reopens the affected bets, instead of everyone waiting for the next schedule (6.2.2). At each reevaluation, when the top re-asks the two questions, all of it is gathered in one place.

Each department reports its own actual numbers, the same numbers it answered for in the statement. Management measures the risk sizes, records what it accepted, and assembles the reporting. The top holds the record it answers from. Nobody reports anyone else's numbers. Without the upward flow, the top just issues orders and never learns whether they work. Governance is both flows together.

## The loop

Run continuously, the interface is a loop. The top sets the parameters in the statement, from the whole picture. Management turns them into work: it pursues the quality targets, runs the prioritized risk register, and decides the everyday cases inside the published parameters. The four-step loop of [Economics of Testing](../testing_economics/testing_economics.md) is exactly this machinery; [implementations.md](implementations.md) carries the mapping.

The reports flow back up and go to two places:
- The bet checks and the proposals go into the reevaluation, where the top corrects the statement's numbers (otherwise they stay last year's guesses) and changes the set of bets. This half returns to [value.md](value.md), where the regular re-asking lives.
- The risk sizes, the accepted risks and the breaches stay with the top as the record it answers from, to owners, auditors, regulators, or a court if it comes to that.

Breaches go to both places: they correct the estimates, and they go on the record. The statement gets refreshed, and the loop runs again; it never ends by design. In economic terms, the company keeps maximizing value while keeping every exposure within its appetite. That is one half of the "maintain" promised in the research's [purpose statement](quality-governance.md): the loop keeps the numbers current. The other half, keeping the loop itself alive, is [the erosion thesis](erosion.md)'s subject.

<!-- Interface diagram placeholder. -->
