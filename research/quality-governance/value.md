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

Quality can be a competitive advantage big enough to reshape a market. Deming taught statistical quality control to Japanese industry from 1950 onward, and Japanese manufacturers, cars most visibly, took large US market share in the 1970s and 80s with quality reputation carrying much of it. Yet "competitive advantage" alone does not make a good economic discussion: a company can price nothing until it names what the advantage consists of.

The advantage consists of the value satisfied customers give back. The organization sets the quality levels it aims for, hoping to get more value from customers. The channels below are a few recurring kinds of that return, an open list; each can be priced from numbers a business already tracks.
- **Retention and expansion.** Customers stay and grow on a product that keeps working (churn attributed to quality, renewal rate, expansion revenue).
- **Conversion.** Quality experienced in trials and demos wins deals (trial-to-paid rate, win rate).
- **Price premium.** Buyers pay more for the option they trust (realized price against substitutes, discount depth needed to close).
- **Trust as a sales asset.** A clean reliability and compliance record unblocks enterprise deals (deals passing vendor assessment, days spent in security review).

Kano and his colleagues sorted qualities by how customers respond to them (Kano, Seraku, Takahashi and Tsuji 1984). Some are expected: nobody thanks a product for being available, everyone complains the moment it is not. Others delight: nobody misses them when absent, yet they win customers when present. Both kinds return value; the expected kind returns it silently. A company that tracks only the complaints sees half the picture, and that half is the loss-driven conversation the [problem statement](quality-governance.md) describes.

The four above are just the most obvious channels, value coming back from customers whose needs the product satisfies. Another return comes from the system itself. When internal quality keeps the system quick and safe to change, every future plan is cheaper to pursue: the next feature ships sooner, the response to a competitor takes weeks rather than quarters, and engineers spend their hours on new work instead of rework (calendar time from decision to release, share of engineering time spent on rework, regressions per release). DORA's 2019 report states: "High performers achieve both speed and stability in software delivery, refuting the notion that there's an inherent trade-off between the two"; the link from delivery performance to organizational performance is a predictive association in survey data, and this page claims nothing stronger.

## The loss side, derived

Every channel can be written as a loss instead: renewals kept become churn, deals unblocked become deals lost. The loss version often persuades better, "we are losing enterprise deals over reliability" gets a faster yes than "we could win more deals", so the risk register may well carry these loss entries. The order still matters: first the value model, then the loss entries derived from it. A company that starts and ends with a register of threats never writes the win side down, and that is how the value of quality went missing from these conversations in the first place. The standards allow the win side in a register: ISO/IEC 38507 lists "missed opportunities" among the sources of risk (6.7.4). A register of losses alone holds half the risk picture.

The loss version is also reactive. "We are losing enterprise deals over reliability" can only be written after deals have been lost, and the lost deals are not the whole damage: buyers who chose a rival tell other buyers why, so part of the reputation and the trust is gone before the register entry exists. Spending on quality before the losses arrive is a bet, like any investment; but any business is a bet, and being smart about the bets it places is what good management is. The Japanese manufacturers above placed exactly that bet: Deming's case to them was building quality in during design and production rather than finding failures afterwards, and the US market share was the return.

Return-on-quality researchers built their approach on four assumptions: quality spending is an investment, the spender must be ready to show the return, it is possible to spend too much on quality, and not all quality spending is equally justified (Rust, Zahorik and Keiningham 1995). In a firm-level study, firms leading with revenue expansion outperformed firms leading with cost reduction and firms attempting both at once (Rust, Moorman and Dickson 2002). Empirically, the return concentrates on the value side.

## Who sets it, and keeping it

The value model is, in the end, a set of deliberate bets: the quality levels the organization aims for, the money it spends holding them, and the returns it expects through the channels. Placing these bets well takes numbers, and every department already tracks its own: customer success tracks churn and renewals; sales, win rates and discount depth; support, complaints; engineering, rework and regressions; product and marketing, market position. Each answers only for what it tracks, and below the top nobody answers for the whole set: the silos the [problem statement](quality-governance.md) describes. The value model is what they can align on: one statement of what quality is worth to the company, for every department to check its own numbers against. A model written by one department would serve that department's case, so it is set where the whole picture can exist, at the top; [interface.md](interface.md)'s three reasons apply to this instrument unchanged.

ISO/IEC 38500 backs the placement with an obligation: accountability "remains with the governing body and cannot be delegated" (6.1). The measuring, the reporting, even the drafting of the model can be handed down; answering for what quality is worth to the company cannot.

Setting the model once is not enough. Users' needs change, and so do the system and the company, so both questions must be asked again, regularly; 38500 states the concern as a principle, viability and performance over time (5.12). The [interface](interface.md) loop is where the re-asking happens: evidence flows back up, and the targets and the numbers behind them get updated. People run that loop, and they can run it only while they understand the system and know what it is for; keeping both alive is the subject of [the erosion thesis](erosion.md).
