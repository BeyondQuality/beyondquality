---
author: Vitaly Sharovatov
status: draft
---
# Definitions

Part of [Governance of quality](quality-governance.md).

## Governance vs management

ISO/IEC 38500 separates the two layers by kind, not by seniority. Governance is the human-based system through which an organization is directed, overseen and held to account (3.3). Management is the fulfilment of the organization's objectives within the authority and accountability that governance establishes (3.7). One layer decides what the organization wants from its systems, how much uncertainty it accepts in pursuit of that, and who answers for the outcome; the other runs the work inside those parameters.

The risk vocabulary shows the split most clearly. Per ISO/IEC 38507 (6.7.1), the governing body determines the risk appetite, remains accountable for it, and delegates the process of identifying, assessing and treating risks to management. Management runs the register; deciding how much risk the organization is willing to carry in pursuit of its objectives is not the register's job, and no function that owns part of the exposure can decide it for the rest.

Accountability does not travel with the delegation: it cannot be delegated to a manager, and it cannot be delegated to an AI system (38500 6.1; 38507 4.3). Whoever the work is handed to, the answering stays where it was.

Risk appetite is also only one instrument of the governance layer. In 38500's own arrangement, purpose is primary; value generation, strategy, oversight and accountability are foundational; risk governance is one of six enabling principles. A risk-only picture of governance quietly loses the value side; [value.md](value.md) is where this research restores it.

## Governance is not compliance

In many companies "governance" in practice means the compliance function. The standard does not support the synonym. Compliance appears in ISO/IEC 38500 in exactly three places, all subordinate: one of three expected outcomes of the Oversight principle (5.5.3), one component of the monitor task (3.8, Note 2), and one bullet in the expectations for ethical behaviour (4.1.4). The containment is explicit: the governance system should be outcome-driven, "including but not limited to" its compliance needs (5.1). Of the three verbs in the definition of governance, compliance work covers a slice of the second: it can check, but it cannot direct, and it does not own outcomes.

The failure mode that follows is management capture of governance: one management discipline's working method (check against criteria, document, file) gets promoted into the definition of the whole system. Every loop the standard describes then degenerates into a gate. Nobody directs, because authoring desired outcomes was never in the function's design; evaluation becomes a one-time assessment instead of judgement made continually as circumstances change (6.2.2); monitoring becomes filing instead of a basis for decisions and adjustments (3.8); risk appetite never gets set. The capture is symmetric, and this research does not argue for quality's turn on the throne: QA-led governance would promote a different working method into the same wrong place. What quality work can legitimately claim is a seat in the decisions and the supply contract for the evidence governance must demand; both come later in this research. The argument is developed in [discussion #43](https://github.com/BeyondQuality/beyondquality/discussions/43).

## Quality

ISO 9000 and ISO/IEC 25010 define quality as a degree: the degree to which what is produced matches the stated and implied needs of users and customers. "Degree" is the load-bearing word. Because quality is a degree, "how well" is a variable, and a variable needs someone to set it. Every organization sets it somehow: deliberately, as a decision with an owner and a rationale, or implicitly, as the residue of budget fights and shipping pressure. The problem statement's observations are what the implicit version looks like. That quality is a degree is also what makes it governable at all: there is a level to choose, a price attached to choosing it, and someone who must answer for the choice.

## The working definition

Governance is the company-wide human system of direction, oversight and accountability; risk appetite is one of its instruments and value generation another; QA, security and product management operate within the parameters it sets.
