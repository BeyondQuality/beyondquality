---
author: Vitaly Sharovatov
status: done
---
# What each role does and gains

Part of [Governance of quality](quality-governance.md).

Managers spend hours every week in alignment meetings and in defending budgets, and product still pushes for the deadline and cuts quality, sometimes deep enough to damage the whole product. That much effort with that little effect points at a missing tool: a way to state the trade between speed and quality that everyone in the fight can read. The pages before this one describe the tool. This page says what each role does with it and what each gains, because no single role can put it in place alone.

The reason is in who answers for what. Usually the product manager answers for delivery and the QA lead for quality, and each pushes for what they answer for. The QA lead can write a rule, that nothing ships without a regression run, say, and the product manager is free to ignore it, because the QA lead has no authority over product; a rule the product manager writes has the same standing with QA; and when the two agree a rule together, the argument continues over what its words mean, because neither side has a number to settle it with. The product manager is rewarded for shipping on time, the QA lead is blamed for the failures that reach customers, and nobody below the top is judged on the balance between the two. So a rule both have to follow can only come from someone with authority over both, and it needs numbers that no single function sees; [value.md](value.md) says why that place is the top.

## The governing body

The body supplies the two numbers nobody below it can: what each level of quality is worth to the company, and how much risk of each kind the company accepts, its risk appetite. It writes both down in the statement, the short document [value.md](value.md) describes, next to the bets: one line per quality the company bets on, with the level to hold, what holding it is expected to earn or protect, what it costs and when it is reviewed. [value.md](value.md) describes how the body arrives at the numbers, [interface.md](interface.md) what comes back to it, and [implementations.md](implementations.md) the testing work management runs in between, which the body does not have to learn.

Between reevaluations, the regular moments when it re-asks what each level is worth and how much risk it accepts, and remakes the statement, the body holds the department heads to account for the numbers they own: it asks questions, judges the answers and applies consequences (ISO 37000 6.5.3.3). It stops deciding the cases that fit inside the appetite ([interface.md](interface.md)), and it stops taking the compliance function's files for its governance ([definitions.md](definitions.md)).

What a board usually receives about quality today, when it receives anything, is a certificate: a SOC 2 report, an ISO 27001 certificate, a passed audit. A certificate tells outsiders that a process met a standard's criteria over a period. It does not say whether the checkout path held four nines (99.99% availability), what missing them cost, or whether the risk sizes management reported were right. Assurance is the body's own check on exactly those things, run by someone who does not write the reports ([interface.md](interface.md) describes the check). The body decides how much scrutiny each risk gets by the size of the risk, and it gives the checker the authority, the resources and the independence to do it (ISO 37000 6.4.3.3). A company can hold every certificate on the market and have no assurance about its quality levels.

Nobody outside the company will demand any of this of the body. Cyber security got its board-level interface when regulation put it there: under rules adopted in 2023, public companies in the United States describe in their annual reports how the board oversees the risks from cybersecurity threats, and what management's role and expertise in managing them are (SEC, Regulation S-K, Item 106). The default, then, is no interface between the board and a risk-bearing function until someone demands one. Product quality has no regulator, so the demand has to come from the body itself, and the standards put the duty there. The body develops the criteria by which progress towards its purpose is measured, and sets its expectation of the quality and timeliness of measurement (ISO 37000 4.3.2 b and c). Its stated performance expectations are the basis for measurement, its own and management's (38500 7.2.6).

The body also has its own reason to want this. [value.md](value.md) describes good quality as a competitive advantage that comes back as renewals kept, deals won and a price that holds, each in the numbers of one department. Below the top nobody answers for the whole of that return; the body does, so it has the most to gain from stating what quality is worth.

For software built with agents the body has four acts, and [erosion.md](erosion.md) describes them:

- it names the practice, how the company's software is built with agents, as something it governs;
- it sets the conditions on the people who use the agent, among them the size of the step that may be handed to the agent in one piece;
- it sets the appetite for the risk of losing the knowledge all of the above runs on: how the software works, and why it is the way it is;
- it pays for the people who keep that knowledge.

The body gains what the [problem statement](quality-governance.md) promises under Structure: one exposure picture in comparable units, an appetite set deliberately, and the record it answers from. From the four acts it gains what the problem statement promises under Adoption: agents used at a pace the company can sustain, with the knowledge risk watched like any other risk and the people who keep the knowledge paid for like any other bet.

## Every department head

The heads of the departments whose numbers stand in Part 2 of the statement, the list of the numbers each department tracks and answers for, are customer success, sales, support, engineering, finance and legal. Each of them holds two positions at once. In the statement the head answers for the department's numbers. In the four-step loop of [Economics of Testing](../testing_economics/testing_economics.md) the heads are the managers: they rank the risks and draw the lines between the risks that must be reduced, the risks the company can carry with a sign-off, and the risks it can live with ([implementations.md](implementations.md), step 2).

Each head has three duties in the statement, and the earlier pages describe them:

- stating the department's numbers as they stand today, in its own units, and what holding each level the body considers would win or protect, as a range ([value.md](value.md), steps 2 and 6 of its eight-step method);
- answering for that range as a bet: at the review date the head puts the actual number next to it and says why when it missed ([interface.md](interface.md), the first of the five kinds of report that flow up);
- proposing a bet when a number the department owns gets worse and the cause is a need the statement gave no bet of its own ([value.md](value.md), the needs without bets).

A head may state a worth only in numbers the department owns. Customer success can say three to five renewals a year, because at the review date it can count them. It cannot say "reputation", because nobody can put an actual number next to that word, so the bet could never be settled.

When the body hands a department a level to hold or a number to answer for, its head is entitled to the conditions of the delegation before accepting it. ISO 37000 lists five: the expected outcomes agreed, the resources available, authority matching responsibility, periodic reporting with evidence, and enforceable consequences (4.2.2). A head of support asked to hold a response time without the people to hold it can point at that clause, and so can an engineering manager asked to keep a level whose estimated cost the body never funded.

The department heads gain what the problem statement promises under Information, a case stated in money instead of a plea: the departments' numbers reach the top together ([value.md](value.md)), so the head of support no longer has to convince the head of product that this quarter's complaint counts mean something; the top sees them next to everyone else's numbers.

## Product leadership

Under the decision rule on [interface.md](interface.md), product with engineering estimates what postponing this particular feature would cost the company, and works out from the statement what the failure QA fears would cost. "It's urgent" carries no number, so today the argument is won by authority ([implementations.md](implementations.md)); the estimate carries one. Suppose a customer's March renewal depends on the feature: if the team postpones it past March, the company may lose the renewal, so product can state the delay cost. Suppose instead it is a redesign of the account-settings screen that no renewal and no trial depends on: the delay cost is almost nothing.

For software built with agents, the ai-era-testing research proposes a building session, in which two or more people decide each step while an agent writes the code; [implementations.md](implementations.md) describes the session and the bet the body places when it requires and pays for the sessions. Product leadership supplies the person who knows what the feature is for and can settle trade-offs in the session itself; the body pays for those hours through the bet, so they do not come out of the roadmap unpaid. The business rules that person states in the session go into the intent docs the research asks for, the written record of why the feature exists and what it must do, and product answers for that record being where the team can find it.

Product gains what the problem statement promises under Decision: the case for shipping now is decided from its numbers, locally and without escalation, and a case that goes up goes up with both numbers, so product can see what would change the answer. The bets in Part 3 of the statement state quality's worth in numbers product also wants to grow, so product and QA argue from the same statement.

## Engineering leadership

Engineering's numbers in Part 2, outages, rework, regressions and how long changes take, are its evidence when product asks for corners to be cut, and its cost ranges for holding each level go into the bets ([value.md](value.md)). When the company builds its software with agents, engineering carries the work behind the body's acts on [erosion.md](erosion.md):

- it proposes the step size, the delegation limit the body sets on what may be handed to the agent in one piece, because only engineering can say what size of step its people can still judge;
- it builds and keeps the suite of checks over the agent, fixed instructions with expected results written by people, run whenever the tool changes, with product and QA supplying the expected results for the rules they own;
- it reports the indicators [erosion.md](erosion.md) lists for the knowledge risk, as the current size of that risk next to the appetite the body set for it.

The engineers in a building session have to be able to judge each step the agent proposes. Where that skill has already gone, engineering leadership says so and asks for the time and the money to rebuild it before the company starts the sessions. The standard for the governance of IT asks the body for assurance that its intentions are carried out by people with the competence to do so, and that the organization has the skills to implement change ([erosion.md](erosion.md) carries the clauses); engineering is the department that tells it when either has stopped being true.

Engineering gains two things. Today, when product asks for a corner to be cut, the engineering manager can only say that something feels wrong, and the corner is cut; under the statement the manager points at rework rising every quarter since the last shortcut, a number engineering answers for, and the argument is about that number. When the company builds with agents, the hours engineers spend in the building sessions and on keeping the suite of checks are the cost of the body's bet, so the body pays for them and the engineering manager no longer takes them out of the delivery schedule.

## QA leadership

The QA lead's ask of the top is concrete, two numbers and the five kinds of report in return ([interface.md](interface.md) lists them), and the standard backs it. Those who have the appropriate IT knowledge should be engaged in the decisions that fall under their responsibilities (38500 5.6.2). The body should be informed in a timely manner of material breaches (5.5.3). It should have a sound process for managing IT-related risks in place (5.10.2). It should evaluate continually as circumstances change (6.2.2). It should monitor performance through appropriate measurement systems (6.2.4). Where legislation is unclear or underdeveloped, it should state the compliance elements it requires of the organization (5.5.2), and for quality levels no law speaks at all. It should direct the submission of proposals for the needs it has identified (6.2.3). The QA lead can point at each of those clauses.

The ask is for a seat in the decisions and for the duty of supplying the evidence; QA does not take governance over, and [definitions.md](definitions.md) says why.

Under the statement the QA lead convenes the four-step loop and picks the checks; [implementations.md](implementations.md) follows it step by step, and the strategy record, QA's written account of what covers each risk, stays below with management for the assurance check.

What the QA lead supplies is assurance evidence, and the difference from a certificate matters here too. "All tests pass" and a coverage percentage say that the testing process ran; they are certificates of the tests. The assurance check asks what the checks would have caught, what evidence they produced and who accepted what remains, and only the strategy record answers that. A QA lead who reports pass rates upward hands the body a certificate when the body needs assurance.

When the company builds with agents, the QA lead adds one thing to that record: for each risk size, whether the evidence behind it comes from somewhere other than the code. A risk covered only by tests the agent generated from its own code is marked as such, and its size is reported as unsupported.

QA leadership also decides which building sessions get a QA engineer: with one tester to five developers, say, the tester cannot sit in every session, and the research leaves open how many sessions one QA engineer can serve ([proposal](../ai-era-testing/proposal.md)). Until it is answered the QA lead chooses by the risk register: a QA engineer sits in the sessions on the refund flow [implementations.md](implementations.md) follows, where money leaves the company, and not in those on the account-settings screen; implementations.md describes what the QA engineer does in the session.

QA gains the upward case: the vocabulary, the clause references and the money, so the QA lead stops arguing from feelings. "This is risky" becomes "this risk is currently estimated at this size, against this appetite, with this evidence behind it". The standard says the seat should exist, so the QA lead asks for what the standard already expects of the body.

## Questions anyone can ask in their own company

Where the answer is "nobody" or "nowhere", the page in brackets is where this research answers it.

1. Who can say what a day's outage on the paying customers' path would cost the company, and which department owns that number? ([value.md](value.md))
2. Is there a written appetite per kind of risk, with the size of decision above which management escalates, or does each budget fight set its own? ([value.md](value.md), Part 6 of the statement)
3. When product says "it's urgent" and QA says "it's risky", what settles it: two numbers against a published appetite, or whoever has more authority? ([interface.md](interface.md))
4. For each risk on the risk register, can the QA lead show which checks cover it and who accepted what remains, and does anyone above ever ask to see it? ([implementations.md](implementations.md), [interface.md](interface.md))
5. When did the company last lower a quality level on purpose, with an owner, a reason and a review date? ([value.md](value.md))
6. Take one business rule in the code. Can someone say why it is there, and is the reason written anywhere the team can find? ([erosion.md](erosion.md))
7. Does the board know how the company's software is built with agents, what is handed over in one piece and who decides each step, or only that agents are used? ([implementations.md](implementations.md), [erosion.md](erosion.md))
