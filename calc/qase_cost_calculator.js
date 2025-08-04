
// Qase Calculator - Cleaned version without infrastructure cost

function calculateCosts(inputs) {
    const {
        teamSize,
        numTests,
        failureRate = 3.0, // %
        runsPerDay = 1,
        qaSalary = 90000, // USD/year
        sdetSalary = 120000, // USD/year
        usesTMS = false,
        defectCost = 2000 // USD per defect
    } = inputs;

    const HOURS_PER_YEAR = 2080;

    // 1. Test Creation Cost
    const testCreationTimePerTest = 2;
    const creationQaeSplit = 0.6;
    const creationSdetSplit = 0.4;

    const testCreationTotalHours = numTests * testCreationTimePerTest;
    const testCreationCost =
        testCreationTotalHours *
        ((creationQaeSplit * qaSalary + creationSdetSplit * sdetSalary) / HOURS_PER_YEAR);

    // 2. Maintenance Cost (Annual)
    const maintenanceTimePerFailure = 0.75; // 45 minutes
    const failuresPerMonth = numTests * runsPerDay * 30 * (failureRate / 100);
    const maintenanceHoursAnnual = failuresPerMonth * 12 * maintenanceTimePerFailure;

    const maintenanceQaeSplit = 0.8;
    const maintenanceSdetSplit = 0.2;

    const maintenanceCostAnnual =
        maintenanceHoursAnnual *
        ((maintenanceQaeSplit * qaSalary + maintenanceSdetSplit * sdetSalary) / HOURS_PER_YEAR);

    // 3. Coordination Cost (Annual)
    let coordinationHoursPerDevPerMonth = 4;
    if (usesTMS) {
        coordinationHoursPerDevPerMonth *= (1 - 0.6); // 60% reduction with Qase
    }

    const coordinationHoursAnnual = coordinationHoursPerDevPerMonth * teamSize * 12;
    const coordinationCostAnnual = coordinationHoursAnnual * (qaSalary / HOURS_PER_YEAR);

    // 4. Flaky Test Tax
    const flakyExtraTimePerFailure = 0.5; // 30 minutes per failure
    const flakyTaxHoursAnnual = failuresPerMonth * flakyExtraTimePerFailure * 12;
    const flakyCostAnnual = flakyTaxHoursAnnual * (qaSalary / HOURS_PER_YEAR);

    // 5. Escaped Defect Cost
    const defectLeakageRate = 0.1; // 10%
    const escapedDefectsPerMonth = failuresPerMonth * defectLeakageRate;
    const escapedDefectCostAnnual = escapedDefectsPerMonth * 12 * defectCost;

    // Total Cost (without infrastructure)
    const totalCost = testCreationCost + maintenanceCostAnnual + coordinationCostAnnual +
                      flakyCostAnnual + escapedDefectCostAnnual;

    return {
        testCreationCost,
        maintenanceCostAnnual,
        coordinationCostAnnual,
        flakyCostAnnual,
        escapedDefectCostAnnual,
        totalCost
    };
}
