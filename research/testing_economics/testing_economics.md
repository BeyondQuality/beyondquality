# Economics of testing

## Testing as a risk-mitigation investment

Testing is an appraisal activity that provides information about risks and reduces their likelihood or impact when failures are found and fixed.

Like any other activity, testing consumes resources (effort, tools, and time).

In economics, investment is defined as "_any asset obtained at a cost, on the expectation that it will deliver future value greater than its initial cost._".

Testing fits into this definition: it is an investment made today to reduce the probability and impact of costly failures tomorrow, thereby optimizing future outcomes.

Since testing is an investment, its economic return can never be guaranteed. At best, we can estimate the expected benefits, but the value of testing lies in reducing the probability and impact of costly failures, and these events may or may not occur. Testing can be compared to insurance or preventive healthcare: we spend resources today because the risks of not doing so are far greater than the cost of investment.

Recognizing that we do need to invest, the next question becomes where to allocate those resources. Budgets are never limitless, and the law of diminishing returns means that simply "doing more testing" is not an efficient strategy. Instead, we must treat testing like an investment portfolio: selecting a mix of testing activities that provides the maximum reduction in risk for the resources available.

To build such a portfolio, we must first identify which risks matter most. ISO/IEC/IEEE 29119 makes this explicit: risk identification is the first step in test planning. Similarly, ISO/IEC 25010 provides a structured set of quality characteristics that can serve as categories for defining risk areas. By starting from risks, we can then make deliberate, economically sound decisions about which testing activities to invest in and to what extent, ensuring that the portfolio aligns with the organization’s tolerance for risk and its business priorities.

These risks failure can be understood as the risks of not meeting one or more quality characteristics. ISO 25010 defines nine groups of such characteristics, and for every product and at every stage of its lifecycle these groups will vary in importance.

[insert quality characteristics]

Once risks (not meeting certain quality characteristics) are prioritized, we gain clarity on _where_ to invest: which risks we need to reduce most, and which can be given less attention. For example, in an early prototype, flexibility and maintainability may carry little risk, while for a production system they become critical.

The question of _how_ to invest is more complex. Every testing level, type, and measure affects multiple risks at once, and in different ways. Overlaps are inevitable: the same activity may mitigate several risks, while different activities may address the same risk. This overlap is not a flaw but a feature and it provides safety margins. What must be avoided is underlap, where some risks remain uncovered. Since no investment can guarantee complete risk elimination, in practice it is often better to do _slightly more_ than strictly necessary, rather than fall short: from a risk management perspective, it's rational to "slightly over-invest" (better redundancy than a gap).

Figure 2: Testing types, activities and measures:

![Figure 2, Testing types, activities and measures](testing_types_activities_measures.png)

## Resources

- [ISO/IEC/IEEE 29119-1:2022 Software and systems engineering — Software testing](https://www.iso.org/standard/81291.html)
- [ISO/IEC 25019:2023 Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Quality-in-use model](https://www.iso.org/standard/78177.html)
- [Investments](https://www.financestrategists.com/wealth-management/investments/)