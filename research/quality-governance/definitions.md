---
author: Vitaly Sharovatov
status: draft
---
# Definitions

Part of [Governance of quality](quality-governance.md).

This research operates the vocabulary of the standards; this page collects the terms and explains them in simple words.

## Governance

ISO/IEC 38500 defines governance as a "human-based system comprising directing, overseeing and accountability" (3.3).

Governance is a system: parts connected and working together. Direction sets what is expected, oversight checks what actually happens against it, accountability answers for the difference, and what the checking reveals becomes the basis for the next decisions (3.8). The governing body is one part of the system; the policies it issues, the authority it delegates and the reports it receives are other parts; the parts working together, continuously, are the governance. It is called human-based because the deciding, watching and answering are done by people.

## The governing body

ISO 37000 defines the governing body as the "person or group of people who have ultimate accountability for the whole organization" (3.3.4). In practice that is a board of directors, a supervisory board, a sole director or trustees (3.3.4, Note 2); in a small company, simply the owners or the founders. Member stakeholders, typically shareholders or members, hold the right to make decisions about it, including its composition and the parameters within which it decides, and the body accounts to them for the organization's outcomes and its own performance (3.3.2).

The governing body directs: it decides what the organization wants, and it sets the limits within which everyone below acts, such as budgets, policies and how much risk may be taken. It oversees: it watches whether the organization gets what it wants. It answers for the result to owners, regulators and other stakeholders.

That answering is also the practical way to tell the governing body from management. A manager's authority is delegated from above and can be taken back; a manager answers inside the organization, ultimately to the governing body. The governing body answers outside the organization, and it cannot hand that answering to anyone (38500 6.1): when things go wrong badly enough, its members can be fined, removed or taken to court even for failures they never touched, because inadequate oversight is itself their failure (38507 4.3). Setting objectives or policies does not mark the line, since management can do that too when the authority is delegated to it (38500 3.1, Note 2).

## Management

ISO/IEC 38500 defines management as "fulfilment of the organization's objectives within the authority and accountability established by governance" (3.7).

Management is an activity: fulfilling the organization's objectives. The same word also names the people who do the fulfilling (3.7, Note 1). Management takes the objectives and the limits governance has set (the definition's "authority and accountability") and turns them into work: hiring, planning, building, shipping. It makes the everyday decisions inside those limits and reports the results back up.

## Accountability

ISO 37000 defines accountability as the "obligation to another for the fulfilment of a responsibility" (3.2.2), and responsibility as the "obligation to act and take decisions to achieve required outcomes" (3.2.3). Responsibility means you must do the work; accountability means you must answer to someone for it. You owe that someone the outcome and the explanation of how it was done, and they can enforce consequences on you if the responsibility was not fulfilled (3.2.2, Notes 1 and 2). For members of a governing body the consequences are concrete: penalties, removal from office or legal redress (38507 4.3).

Accountability does not travel with delegation. Responsibility for work can be delegated to management, but accountability "remains with the governing body and cannot be delegated" (38500 6.1), and the governing body holds to account those it has delegated to (5.6.1, quoting ISO 37000). The same holds for AI: the governing body answers for decisions made through the use of AI rather than attributing them to the AI system (38507 4.3). Whoever the work is handed to, the governing body still answers for it.

## Risk appetite

ISO/IEC 38507 defines risk appetite as the "amount and type of risk that an organization is willing to pursue or retain" (3.2.3, taken from ISO Guide 73).

Pursuing any objective means accepting that things can go wrong. Risk appetite is how much of that possibility the organization is willing to accept, and of what kind: the risks it takes on deliberately because the objective is worth them (the definition's "pursue"), and the risks it decides to live with rather than pay to reduce ("retain"). The appetite legitimately differs across kinds of risk: a company may tolerate months without new features and not one security breach.

The term also shows the governance-management split most clearly. Per 38507 (6.7.1), the governing body decides the risk appetite in pursuit of the organization's objectives, remains accountable for it, and delegates the process of identifying, assessing and treating risks to management. Management works with the risks and keeps them within the appetite given from above; deciding how much risk the organization is willing to carry is not management's job, and no function that owns part of the exposure can decide it for the rest.

Risk appetite is only one instrument of the governance layer. In 38500's own arrangement of principles (clause 5), purpose is primary; value generation, strategy, oversight and accountability are foundational; risk governance is one of six enabling principles. A risk-only picture of governance quietly loses the value side; [value.md](value.md) is where this research restores it.

## Compliance

ISO/IEC 38507 defines compliance as "meeting all the organization's compliance obligations" (3.2.5, taken from ISO 37301), and the obligations as the requirements the organization is bound to meet, by law, regulation or contract, plus those it voluntarily chooses to meet (3.2.4).

Compliance checks the organization against criteria somebody else wrote: a regulation, a standard, a certification checklist. The organization picks some of those criteria voluntarily, but it does not write them; compliance receives them, checks against them, and documents the result.

GDPR is the most familiar example: the criteria were written by the EU legislator, and any organization the regulation reaches must meet them. Compliance work here means checking the organization against the regulation's requirements (a lawful basis for each use of personal data, breach notification on time, records of processing) and keeping the evidence that it does. Whether the organization agrees with any of it has no bearing; the criterion is external and binding.

In many companies "governance" in practice means the compliance function. The word often appears in the org chart only inside the GRC team, "governance, risk and compliance", whose actual work is certification and audit preparation: SOC 2, ISO 27001, GDPR evidence. Ask who owns governance and you get pointed at the auditors. "IT governance" and "data governance" programmes are often the same: their entire output is policy documents and filed audit evidence, and nothing in them directs anything.

Compliance is useful work, and governance must demand it, but compliance answers a different question. Governance decides what the organization itself wants, how much risk it accepts on the way, and who answers for the result; compliance can check, but it cannot decide any of that. So when a company treats its compliance function as its governance, every governance activity shrinks to what compliance knows how to do: nobody states desired outcomes, because compliance receives criteria and never writes them; evaluation becomes a yearly assessment instead of continuous judgement; monitoring becomes filing; risk appetite never gets set, because no checklist asks for it.

The trap is symmetric. Handing governance to QA would repeat the same mistake with a different method: QA's gates instead of compliance's files, and direction still missing. What quality work can rightly claim is a seat in the decisions and the job of supplying the evidence the governing body demands; both come later in this research.

The standard does not support the synonym. Compliance appears in ISO/IEC 38500 in exactly three places, all subordinate: one of three expected outcomes of the Oversight principle (5.5.3), one component of the monitor task (3.8, Note 2), and one bullet in the expectations for ethical behaviour (4.1.4). The containment is explicit: the governance system should be outcome-driven, "including but not limited to" its compliance needs (5.1). The standard's verbs make the same point: evaluation is making informed judgements (3.2), undertaken continually as circumstances change (6.2.2), and monitoring is review as a basis for decisions and adjustments (3.8); a yearly assessment and filed reports satisfy neither. The argument is developed in [discussion #43](https://github.com/BeyondQuality/beyondquality/discussions/43).

## Quality

ISO/IEC 25010:2011 defines the quality of a system as the "degree to which the system satisfies the stated and implied needs of its various stakeholders, and thus provides value" (3.1).

"Degree" is the load-bearing word. Because quality is a degree, "how well" is a variable, and a variable needs someone to set it. Every organization sets it somehow: deliberately, as a decision with an owner and a rationale, or implicitly, as the residue of budget fights and shipping pressure. The problem statement's observations are what the implicit version looks like. That quality is a degree is also what makes it governable at all: there is a level to choose, a price attached to choosing it, and someone who must answer for the choice. Satisfying the needs "thus provides value": the value side sits inside the definition of quality itself, and [value.md](value.md) builds on exactly this.

## The working definition

Governance is the company-wide human system of direction, oversight and accountability; risk appetite is one of its instruments and value generation another; QA, security and product management operate within the parameters it sets.
