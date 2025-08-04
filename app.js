// Qase Value Calculator - Main Application Logic

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing calculator...');
    
    const form = document.getElementById('calculatorForm');
    const resultsSection = document.getElementById('results');
    const failureRateSlider = document.getElementById('failureRate');
    const failureRateValue = document.getElementById('failureRateValue');

    console.log('Form element:', form);
    console.log('Results section:', resultsSection);
    console.log('calculateCosts function:', typeof calculateCosts);

    if (!form) {
        console.error('Form not found!');
        return;
    }

    if (!resultsSection) {
        console.error('Results section not found!');
        return;
    }

    // Update slider value display
    if (failureRateSlider && failureRateValue) {
        failureRateSlider.addEventListener('input', function() {
            failureRateValue.textContent = this.value + '%';
        });
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted!');
        
        // Collect form data
        const formData = new FormData(form);
        const inputs = {
            teamSize: parseInt(formData.get('teamSize')),
            numTests: parseInt(formData.get('numTests')),
            failureRate: parseFloat(formData.get('failureRate')),
            runsPerDay: parseInt(formData.get('runsPerDay')),
            qaSalary: parseInt(formData.get('qaSalary')),
            sdetSalary: parseInt(formData.get('sdetSalary')),
            usesTMS: formData.get('usesTMS') === 'on',
            defectCost: parseInt(formData.get('defectCost'))
        };

        console.log('Form inputs:', inputs);

        try {
            // Calculate costs using the provided function
            const results = calculateCosts(inputs);
            console.log('Calculation results:', results);
            
            // Display results
            displayResults(results);
            
            // Show results section
            resultsSection.style.display = 'block';
            console.log('Results section should now be visible');
            
            // Smooth scroll to results
            resultsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } catch (error) {
            console.error('Error in calculation:', error);
            alert('Error calculating costs: ' + error.message);
        }
    });

    // Function to format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Function to display results
    function displayResults(results) {
        console.log('Displaying results:', results);
        
        // Update cost breakdown
        const elements = {
            testCreationCost: document.getElementById('testCreationCost'),
            maintenanceCost: document.getElementById('maintenanceCost'),
            coordinationCost: document.getElementById('coordinationCost'),
            flakyCost: document.getElementById('flakyCost'),
            escapedDefectCost: document.getElementById('escapedDefectCost'),
            totalCost: document.getElementById('totalCost')
        };

        // Check if all elements exist
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Element not found: ${key}`);
                return;
            }
        }

        // Update the values
        elements.testCreationCost.textContent = formatCurrency(results.testCreationCost);
        elements.maintenanceCost.textContent = formatCurrency(results.maintenanceCostAnnual);
        elements.coordinationCost.textContent = formatCurrency(results.coordinationCostAnnual);
        elements.flakyCost.textContent = formatCurrency(results.flakyCostAnnual);
        elements.escapedDefectCost.textContent = formatCurrency(results.escapedDefectCostAnnual);
        elements.totalCost.textContent = formatCurrency(results.totalCost);
        
        // Calculate and display savings
        calculateAndDisplaySavings(results);
        
        console.log('All cost elements updated');
    }

    // Function to calculate and display savings
    function calculateAndDisplaySavings(results) {
        // Savings percentages (using middle values for ranges)
        const savingsPercentages = {
            maintenance: 0.40, // 40% (middle of 30-50%)
            coordination: 0.60, // 60%
            flaky: 0.375 // 37.5% (middle of 25-50%)
        };

        // Calculate individual savings
        const maintenanceSavings = results.maintenanceCostAnnual * savingsPercentages.maintenance;
        const coordinationSavings = results.coordinationCostAnnual * savingsPercentages.coordination;
        const flakySavings = results.flakyCostAnnual * savingsPercentages.flaky;

        // Calculate total savings
        const totalSavings = maintenanceSavings + coordinationSavings + flakySavings;

        // Display savings
        document.getElementById('maintenanceSavings').textContent = formatCurrency(maintenanceSavings);
        document.getElementById('coordinationSavings').textContent = formatCurrency(coordinationSavings);
        document.getElementById('flakySavings').textContent = formatCurrency(flakySavings);
        document.getElementById('totalSavings').textContent = formatCurrency(totalSavings);
    }

    console.log('Calculator initialized successfully');
}); 