# The failure-cost template

Collect → Calculate → Propose → Approve & Implement → Measure & Brag

One defect class at a time. Pick the one behind your most painful recent incidents. All numbers per quarter.

## 1. Collect

**External failure costs — one visit per partner:**

| Partner | Ask for | Their number |
|---|---|---|
| Support | tickets × avg handling time × loaded rate; escalations | |
| Sales | renewals and expansions at risk (count ¼ of it) | |
| Marketing | campaigns disrupted, features too unreliable to promote | |
| Finance | SLA credits, refunds | |
| Engineering | incident response hours + hotfix hours × loaded rate | |
| PM | cost of the delayed roadmap work | |

**Internal failure costs — your own tracker:**

| Line | Formula | Number |
|---|---|---|
| Returns from testing | count of tickets bounced back to dev | |
| Dev rework | returns × avg fix hours × loaded rate | |
| Retesting | returns × avg retest hours × loaded rate | |
| Release delay | releases slipped — ask your PM to price | |

## 2. Calculate

- External bill /Q = sum of partner lines. Annualise: × 4.
- Internal bill /Q = rework + retesting. Annualise: × 4.
- Your multiplier = (external bill ÷ escaped defects) ÷ (internal bill ÷ returns).
- Convert yearly totals to salary units. Managers hear salaries.

## 3. Propose

| Change | CoQ bucket | Cost | Owner | Expected effect (conservative) |
|---|---|---|---|---|
| | | | | |
| | | | | |
| | | | | |

Reduce the priciest external failure costs first, then internal failure costs, by moving spend into appraisal and prevention.

## 4. Approve and implement

Bring the proposal to the manager who owns cost cutting. Every partner whose number is in it is an ally who wants it to pass. Agree the owners and the review date.

## 5. Measure and brag

Next quarter, recalculate the same bills. Report the difference — savings with your name on them. Then pick the next defect class.

## Rules

1. **Count conservatively**: ¼ of revenue at risk, ½ of expected effect. The proposal that survives the stingiest counting is the one that gets funded.
2. **Each dollar once**: a saving is claimed in one bucket only; a spend is charged to one proposal only.
3. **Cut re-testing, not testers**: the loop tax goes, discovery stays, freed hours go to exploration.
4. **Recalculate next quarter**: a proven cut funds the next defect class. That is what makes it an initiative, not a one-off.
