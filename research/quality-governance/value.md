---
author: Vitaly Sharovatov
status: draft
---
# Value first, risk second

Part of [Governance of quality](quality-governance.md).

## The ordering

Structured quality work usually starts with risks: risk-based testing, the risk register. What the quality is for, what it would be worth, rarely comes up. [Risks are a good start](../testing_economics/testing_economics.md); they are just not the beginning.

Risk is the "effect of uncertainty on objectives" (ISO 31000:2018, 3.1). The definition dictates the order of work: until objectives exist, there is nothing for a risk to be a risk to. The objectives come from defining what quality is worth to the company; only then can the risks to them be derived and prioritized. No insurer prices a policy before asking what the warehouse stores: the premium follows the value at risk.

## The value model

So the value of quality comes first, and the risks are derived from it. The value model is the organization's answer to two questions: how good must the product be, and what is that worth. The first question is harder than it sounds: "good" has to be answered for whom, and in what.

ISO/IEC 25010:2011 defines the quality of a system as the "degree to which the system satisfies the stated and implied needs of its various stakeholders, and thus provides value" (3.1). Quality is a degree: somebody must choose how high to aim. The product provides value to customers by satisfying their needs, and the company gets value from customers in return: their money, and their loyalty, the decision to keep spending it.

The organization answers the first question (how good must the product be) by setting the level for each need and each user segment. Take the simplest need software has: being available when users come for it. "Available" sounds like yes or no, yet the level is _how much of the time_: 99% and 99.99% both describe time, but they cost very differently. The same organization may hold four nines on the paying customers' path while accepting a day's outage on an internal tool. Every organization sets these levels somehow, deliberately or as the residue of budget fights ([definitions.md](definitions.md)).

Why deliberately? Most companies are for-profit, so their quality decisions, like any other spending decisions, are meant to be economically optimal: of the available options, the one that leaves the company best off. In the availability example: is the next nine worth buying? It costs real money, and buying it is optimal only if it satisfies customers' needs so much better that the gain covers the cost.

Until the worth of quality is defined, "economically optimal" has no measure: optimal against what?

The measure comes from the second question: what is the level worth? Stay with availability: how much more satisfied will users be with the next nine, and what will that bring the company? Renewals kept for one business, enterprise deals unblocked for another, a price that holds against cheaper rivals for a third: whatever the level wins or protects for that particular company. Two organizations can set the same uptime target with entirely different value at stake: for one it protects an SLA-bound contract book; for the other, a pre-revenue prototype, almost nothing. That is availability alone; the same questions repeat for every need and every segment.

## Quality as competitive advantage

Quality can be a competitive advantage big enough to reshape a market. Deming taught statistical quality control to Japanese industry from 1950 onward, and Japanese manufacturers, cars most visibly, took large US market share in the 1970s and 80s with quality reputation carrying much of it. Yet "competitive advantage" alone does not make a good economic discussion: a company can price nothing until it states what the advantage consists of.

The advantage consists of the value satisfied customers give back. The organization sets the quality levels it aims for, hoping to get more value from customers. The channels below are a few recurring kinds of that return, an open list; each can be expressed in money, from numbers a business already tracks.
- **Retention and expansion.** Customers stay and grow on a product that keeps working (churn attributed to quality, renewal rate, expansion revenue).
- **Conversion.** Quality experienced in trials and demos wins deals (trial-to-paid rate, win rate).
- **Price premium.** Buyers pay more for the option they trust (realized price against substitutes, discount depth needed to close).
- **Trust as a sales asset.** A clean reliability and compliance record unblocks enterprise deals (deals passing vendor assessment, days spent in security review).

Kano and his colleagues sorted qualities by how customers respond to them (Kano, Seraku, Takahashi and Tsuji 1984). Some are _expected_: nobody thanks a product for being available, everyone complains the moment it is not. Others _delight_: nobody misses them when absent, yet they win customers when present. Both kinds return value; the expected kind returns it silently. A company that tracks only the complaints sees half the picture, and that half is the loss-driven conversation the [problem statement](quality-governance.md) describes.

The four above are just the most obvious channels, value coming back from customers whose needs the product satisfies. Another return comes from the system itself. When internal quality keeps the system quick and safe to change, every future plan is cheaper to pursue: the next feature ships sooner, the response to a competitor takes weeks rather than quarters, and engineers spend their hours on new work instead of rework (calendar time from decision to release, share of engineering time spent on rework, regressions per release). DORA's 2019 report states: "High performers achieve both speed and stability in software delivery, refuting the notion that there's an inherent trade-off between the two"; the link from delivery performance to organizational performance is a predictive association in survey data.

## The loss side, derived


Every channel can be written as a loss instead: renewals kept become churn, deals unblocked become deals lost. The loss version often persuades better, "we are losing enterprise deals over reliability" gets approved faster than "we could win more deals", so the risk register may well carry these loss entries. The order still matters: first the value model, then the loss entries derived from it. A company whose quality thinking starts and ends with a register of threats never asks what better quality would win for it, and that is how the value of quality went missing from these conversations in the first place. The standards allow the win side in a register: ISO/IEC 38507 lists "missed opportunities" among the sources of risk (6.7.4). A register of losses alone holds half the risk picture. Losses that law or contract impose are not derived from any choice of level; they have their own place in the statement (Part 4).

The loss version is also reactive. "We are losing enterprise deals over reliability" can only be written after deals have been lost, and the lost deals are not the whole damage: buyers who chose a rival tell other buyers why, so part of the reputation and the trust is gone before the register entry exists. Spending on quality before the losses arrive is a bet, like any investment; but any business is a bet, and being smart about the bets it places is what good management is. The Japanese manufacturers above placed exactly that bet: Deming's case to them was building quality in during design and production rather than finding failures afterwards, and the US market share was the return.

Return-on-quality researchers built their approach on four assumptions (Rust, Zahorik and Keiningham 1995):
- quality spending is an investment;
- the spender must be ready to show the return;
- it is possible to spend too much on quality;
- not all quality spending is equally justified.

In a firm-level study, firms leading with revenue expansion outperformed firms leading with cost reduction and firms attempting both at once (Rust, Moorman and Dickson 2002). Empirically, the return concentrates on the value side.

## How the top arrives at the statement

The governing body writes the statement in a few working sessions with the heads of the departments. Each of them brings the numbers their department already tracks. The body brings the company's purpose, the place where it intends to win, and the minimums that law and contract set. Nothing has to be measured first.

The body uses today's numbers for three things:
- as the starting point, since every worth it estimates is a change against them;
- as evidence of where the company earns its money today and where it loses it;
- later, at each review, as the baseline it compares the new numbers with.

The body gets from these inputs to a written statement in eight steps. The numbers stay estimates throughout. At each review the body recalibrates them and brings them up to date. They never become precise, and they do not have to.

**Step 1. Whose needs.** The body lists everyone whose needs the product has to satisfy:
- each customer segment;
- the regulators and authorities the company answers to (tax, data protection, safety);
- the partners whose systems connect to the product;
- the company itself, which needs a system that stays quick and safe to change.

Under each of them the body writes down what that party needs from the product. Where a law, a regulation, a contract or an SLA sets a minimum for a need, the body marks that need as a required minimum. Nothing is dropped at this step; the body sorts the list in step 3. The standards ask for the same list: the governing body identifies and engages the internal and external stakeholders (38500 6.2.1), and it defines the value objectives by identifying the stakeholder groups and their expectations (37000 6.2.3.2).

**Step 2. Today's numbers.** Each department states its current numbers, in its own units: customer success its churn and renewals, sales its win rates and discount depth, engineering its outages and rework, and so on (the statement's Part 2 lists the numbers with their owners). Nobody converts anyone else's numbers into their own. Each department keeps its numbers and answers for them. These numbers are the starting point: every level the body considers in step 5 is a change against them.

**Step 3. Two tiers, value first.** Not every need gets a bet of its own. The body sorts the list by what is at stake. The needs where the company intends to win, according to its purpose and strategy, each get a bet. So do the needs the department heads expect to matter for their numbers soon ("enterprise deals are stalling on reliability questions"). Every other need is covered by the common rule, described after the statement: kept as good as products of this kind usually are, with no extra money spent on purpose. Past incidents and lost deals are evidence in this sorting, but a list of past damage alone would be the register of threats again, with the value side missing. No need is left off both lists, because a need on neither would get its level from the budget fights again. The whole list is covered and only the detail is rationed by the stakes: a full bet on every need would be spending too much on the model itself.

**Step 4. Where the return would show.** For each need that gets a bet, and before anyone estimates anything, the body decides where better quality on that need would show up in the company's numbers:
- in customers kept and a trust record that stays clean;
- in deals won and a price that holds;
- in a system that is quicker and safer to change;
- for a required minimum, in a licence kept and fines avoided.

The body then knows which department to ask about the worth in step 6. Ask the wrong department and the answer is wrong. Sales, asked what availability is worth, may say that nobody raises it in demos, while customer success knows the two renewals lost over last year's outages.

**Step 5. Candidate levels, in both directions.** For each need with a bet, the body writes down two or three levels it could set instead of today's, some above it and some below. Lowering is a real option: a level held higher than it is worth costs money the company could keep (the four nines on an internal tool, from the availability example). For each candidate level, the people who would do the work of holding it estimate what it would cost. For most needs that is engineering; for the response time on support tickets it is the support team. They give a range, or an order of magnitude. If they cannot say closer than tenfold, the range is written down that wide. The width of the range is the uncertainty of that bet, and the body narrows it at each review as the actual costs become known.

**Step 6. The worth conversation.** This is the heart of the method. For each candidate level, the department chosen in step 4 states what that level would win or protect over the coming period, as a range, in its own units. Customer success might state three to five accounts a year that it would otherwise lose. Sales might state two to four stalled enterprise deals unblocked. Engineering, for a need of internal quality, might state a third less rework in the areas it changes most. The owner is forecasting, and the forecast is the bet. At the review date the owner puts the actual number next to the range and explains the difference. Nobody states a worth in numbers they do not own.

**Step 7. Choose the levels.** For each need, the body puts the cost range of each candidate level next to the worth ranges stated for it. It raises the level step by step, as long as each step earns or protects more than it costs, and stops at the first step that would not. It lowers a level where holding it costs more than it protects, after the look-ahead described under the statement: a level that today's numbers do not justify may still be kept for where the company intends to win. For the required minimums, the body's choices are smaller: the margin to hold above the minimum, the spend on making sure it holds, and how close to it the company tolerates coming. The statement lists those under Part 4.

**Step 8. Set the risk appetite and the review dates.** For each bet, the body decides how far the level may fall short before that counts as a breach, and when the bet is reviewed. Then it looks at the whole set and decides how much risk of each kind the company accepts: its risk appetite ([definitions.md](definitions.md)). How much of each kind depends on what is at stake. Where the damage would be catastrophic or irreversible (a data breach, a broken legal minimum), the appetite is near zero and nothing happens without a sign-off. Where the damage is linear and recoverable (a feature delayed, a report slow), the appetite is wide. The body also sets the size of problem above which management must escalate instead of deciding alone. The risk appetite, set out per kind of risk, is the company's priorities written as numbers. Two companies with the same product would set it differently, because their stakes differ, and the same company resets it when its stakes change. Then the body writes everything down as the statement and publishes it.

The body gives each need attention in proportion to what is at stake, in both directions. Where the stakes are high, it sets a low appetite for that kind of risk and a small escalation size, asks for more assurance, reviews earlier and spends more before problems appear. Where the stakes are small, it deliberately does little, and what it saves there it can spend on the big bets. The same limit holds for the biggest bet as for the smallest: it is possible to spend too much. ISO 37000 states this rule three times: limits of decision-making authority are applied in response to the assessed risk (4.2.2), the level of assurance scrutiny depends on the assessed risk (6.4.3.3 a), and limits of decision-making authority are based on the associated level of risk (6.8.3.2.2 b).

**Who does what.** The governing body decides the levels, the risk appetite and the escalation sizes, and it answers for the whole model (38500 6.1). Each department owns its numbers and answers for them. The people who would hold a level estimate its cost. Management works out the numbers of each daily case inside the published statement ([interface.md](interface.md), the decision rule).

**When.** The body finishes all eight steps before anyone changes how quality work is done. Nobody looks backward until a review date. In step 4 the body only chooses whom to ask; in step 6 the owners place the bet. Nothing is measured until the review date, when the owner puts the actual number next to the range and the bet is settled ([interface.md](interface.md), what flows up).

## The statement

The governing body writes the value model down as one short document, the statement. The statement says: which qualities the company bets on, and at what level; what holding each level is expected to earn or protect; the minimums law and contract require; one common rule for every quality the company did not bet on; and how much risk of each kind the company accepts. Once it is published, any team can decide its daily cases against these numbers without asking upward; how a team weighs a case is described in [interface.md](interface.md).

**Part 1. The opening.** The company's purpose, restated. The purpose is not decided in the statement; it comes from above and is repeated so the document stands on its own. Then one sentence stating where the company intends to win, so a reader sees why exactly these needs got bets and others did not ("We intend to win enterprise accounts on reliability; the bets concentrate there"). Then the decision rule: a team facing a daily case checks it against the published numbers; if the case fits inside them, the team decides alone, no meeting, no escalation; if it is bigger than the allowed size, it goes up.

**Part 2. The numbers and their owners.** A short list of the money numbers each department already tracks, and who answers for each: customer success for churn and renewals; sales for win rates, discount depth and vendor assessments; support for complaints by kind; engineering for outages, rework, regressions and how long changes take; product and marketing for market position; finance and legal for fines and penalties. The rest of the statement refers to these numbers, and the reporting back up comes through the same owners.

**Part 3. The bets.** One line per bet. Each line records: the need and the customer segment; the level the company chose; how much shortfall is tolerated before it counts as a breach; whether the level is promised to outsiders (a contract, an SLA, a public claim), and where; what holding the level is expected to earn or protect (kept customers, won deals, a held price, an unblocked deal), as a range, in the numbers of the department that answers for them; what holding the level costs, as a range estimated by the people who would do the work, and who they are; and when the bet is reviewed (the bigger the stake, the earlier and the more often). A promised level is treated like a legal or contractual minimum: the safety margin around it is set with the promise in mind, and breaking it means telling the affected customers promptly, on top of whatever penalties the promise carries (38500 6.2.1, 5.5.3).

**Part 4. The required minimums.** The needs bound by law or contract, one entry each, brought complete by its owner (legal, compliance, finance) when the statement is first put together: the obligation, the required minimum, and how far from it the company currently stands. These are not bets: the minimum is given from outside, and its value is known, staying in business; writing them as bets would be pretending to decide what is already decided. The statement usually points at the register compliance already keeps rather than copying it. Per entry the top decides the margin held above the minimum, the spend on making sure it holds (checks, audits, evidence), and how near to it the company is willing to come, normally not at all without a sign-off (Part 6).

**Part 5. The common rule.** One entry covering every need that got no bet. It says that those needs are kept as good as products of this kind usually are; that minimums set by law or contract are met, which catches anything not yet on Part 4's list; that no extra money is spent on them on purpose; and that management applies the rule with its own judgment. Written out, the entry is one sentence: "Every need not listed above is kept as good as products like ours usually are; where law or contract sets a minimum, we meet it; we spend nothing extra on these needs on purpose; management judges what usual means, and answers for keeping to this rule".

**Part 6. The risk appetite.** One entry per kind of risk: how much of it the company is willing to accept; why, with the stakes written next to it; the size of problem above which management must escalate instead of deciding alone; and what requires an explicit sign-off. A security breach and a late feature are different kinds of risk, and the appetite for each legitimately differs; the point of this part is that the top sets those differences deliberately.

A bet can lower a level, not only raise one. The right level is the one the worth supports, no higher and no lower; risk begins below that level, not below wherever the company stands today. If the company holds a level higher than it is worth (four nines on an internal tool nobody depends on), coming down to the supported level risks nothing and frees the money, and the saving is that bet's return. Before lowering a level, the top also looks ahead: 38500 expects service quality at the levels that current and future requirements demand (5.12.2), so a level today's numbers do not justify may still be kept for where the company intends to win. Finding over-held levels is perfectly normal: a company may have been spending far too much on something simply because authority once set it so, and nobody has asked since whether it is still worth the money.

## The needs without bets

Nobody is assigned to watch the needs without bets specially. Every department already watches its own numbers, because that is its normal work. When one of those numbers gets worse, the department that owns it looks for the cause. If the cause turns out to be a need that has no bet, that is the moment to propose giving it one.

Three needs that would usually fall under the common rule, and what would earn each of them a bet:
- How long the monthly invoice export takes in a B2B product. Customers pull it once a month; ten seconds or a minute changes nothing they pay for. It would get a bet if a large customer's finance team started running it daily.
- Which browser versions the web app supports: the current and previous major versions, like everyone else. It would get a bet if the company went after public-sector or banking customers, where old browsers block deals.
- The polish of rarely visited screens such as account settings: alignment, spacing, consistent wording. It would get a bet if trial users' first session ran through those screens.

This covers internal quality with no special arrangement. When a part of the system becomes hard to change, engineering notices it first, in numbers it already tracks: rework grows, changes take longer, the same bugs come back, on-call shifts get busier. Engineers complaining about an area of the code is the same signal before it shows in the numbers. Those numbers belong to the department that made the trade-offs. Corners are often cut under pressure from product to make a date, with engineering giving way, and the rework and slow changes that follow land in engineering's numbers. Under the statement those numbers stand in Part 2 with engineering answering for them, and that helps engineering: a worsening trend is its evidence in the next argument about cutting corners, where today it can only say that something feels wrong. The top also looks at how the numbers change over time rather than at one report: a single report can be made to look good, two years of growing rework cannot.

Legal and contractual minimums are the one exception. Waiting for their number to get worse is too late, because by then the law or the contract is already broken, so whoever owns such an obligation (legal, compliance, finance) watches the distance to the minimum and warns before the company reaches it.

So problems are noticed by the people who feel them, in numbers they already track. The top still learns about all of it, in three ways:
- at once, when a required minimum is about to be broken;
- through a proposal, when a department traced its worsening number to a need without a bet;
- at the reevaluation, the regular moment when the top re-asks the two questions and refreshes the numbers.

The reports that carry these are described in [interface.md](interface.md). The standard supports the shape: the governing body should be told about significant breaches and about patterns of breach (38500 5.5.2), and monitoring runs as routine watching plus periodic examination (3.8 Note 1).

The common rule leaves the judgment of what "normal" means to management. That does not keep things as they are today, for four reasons.

Today, management's local judgment silently sets the level for everything, including the qualities the business depends on. Under the statement, those qualities have explicit levels in their bets; management's judgment covers only the needs the top deliberately marked as low-stakes, and the top can take any need back by giving it a bet.

Today, when product and QA argue whether something is good enough, there is no written criterion, so the argument is won simply by authority. Under the statement, the common rule is a written criterion both sides can point at: "this is below what products like ours do" becomes a grounded argument, and so does "this is already normal, extra polish here is not funded".

Today, when an unspoken level turns out wrong, nobody answers for it, because nobody ever set it. Under the statement, the top answers for the common rule itself, management answers for keeping to it, and if one function quietly lowers the bar under deadline pressure, the damage shows up in other departments' numbers, which now reach the top together.

The fourth reason is that the delegation is checked. At each reevaluation the top looks at the numbers for these needs too. If they look fine, management's reading of "normal" is fine. If some number got worse and nobody proposed a bet for the cause, the delegation itself is not working, and the top steps in. The check costs nothing extra, because the reevaluation gathers all the numbers anyway. The standard makes this a condition: when interpreting a policy is delegated, the governing body must get feedback that the policy is interpreted reasonably, and data must support it (38500 7.2.4 f). The standard also allows a policy to be built this way: it may deliberately leave some things unprescribed, for flexibility (7.2.4), and management may set policies under authority delegated to it (3.1 Note 2).

One thing stays as it is today, on purpose: for needs where truly nothing is at stake and "normal" is genuinely unclear, management keeps using its judgment. The difference is that this is now a decision the top made and answers for, where before it was a state nobody chose. An example is how precise the "last synced" label on an internal dashboard should be, to the minute or to the second: nothing depends on it, comparable products have no shared habit, so whoever builds it decides.

A need can get its own bet later, or lose it. Anyone may propose either; the top decides, at review dates and whenever the whole statement is remade.


## Who sets it, and keeping it

The value model is, in the end, a set of deliberate bets: the quality levels the organization aims for, the money it spends holding them, and the returns it expects through the channels. Placing these bets well takes numbers, and every department already tracks its own, the ones Part 2 of the statement lists. Each answers only for what it tracks, and below the top nobody answers for the whole set: the silos the [problem statement](quality-governance.md) describes. The value model is what they can align on: one statement of what quality is worth to the company, for every department to check its own numbers against. A model written by one department would serve that department's case, so it is set where the whole picture can exist, at the top.

ISO/IEC 38500 backs the placement with an obligation: accountability "remains with the governing body and cannot be delegated" (6.1). The measuring, the reporting, even the drafting of the model can be handed down; deciding the numbers, and answering for what quality is worth to the company, cannot.

Setting the model once is not enough. Users' needs change, and so do the system and the company, so both questions must be asked again, regularly; 38500 states the concern as a principle, viability and performance over time (5.12). Some events do not wait for the regular date: when a new regulation, a market shift, a new kind of deal or a change of strategy changes the stakes, the top reopens the affected bets at once (6.2.2); the trigger list in the [economics research](../testing_economics/step4.md), step 4, already covers such events. The [interface](interface.md) loop is where the re-asking happens: the reports flow back up, and the targets and the numbers behind them get updated. People run that loop, and they can run it only while they understand the system and know what it is for; keeping both alive is the subject of [the erosion thesis](erosion.md).
