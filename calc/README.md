# Qase Value Calculator

A web-based tool to help potential customers understand the real cost of testing without a proper test management system (like Qase) or AI-assisted tooling (like AIDEN).

## Overview

This calculator focuses purely on cost modeling — highlighting how much teams are spending on inefficient testing. It's designed to create a clear "pain moment" that motivates visitors to talk to Sales.

## Features

- **Cost Breakdown**: Calculates and displays annual costs across 5 categories:
  - Test Creation Cost
  - Maintenance Cost
  - Coordination Cost
  - Flaky Test Cost
  - Escaped Defect Cost

## File Structure

```
qase-calc/
├── index.html              # Main HTML file
├── demo.html               # Demo version with pre-filled data
├── styles.css              # CSS styles
├── app.js                  # Main JavaScript logic
├── qase_cost_calculator.js # Cost calculation function
├── qase_calculator_assumptions.csv # Cost assumptions and parameters
└── README.md              # This file
```

## Usage

1. Open `index.html` in a web browser
2. Fill in your team's testing parameters
3. Click "Calculate Costs" to see the breakdown
4. Review potential savings with Qase & AIDEN

## Form Inputs

| Input | Description | Default Value |
|-------|-------------|---------------|
| Team Size | Number of developers and QA engineers | 15 |
| Number of E2E Tests | Total end-to-end tests in your suite | 625 |
| Test Failure Rate | Percentage of tests that fail on average | 3.0% |
| CI/CD Runs per Day | How many times your test suite runs daily | 1 |
| QA Engineer Salary | Average annual salary for QA engineers | $90,000 |
| SDET Salary | Average annual salary for SDETs | $120,000 |
| Uses TMS | Currently using a Test Management System | No |
| Cost per Escaped Defect | Average cost when a bug reaches production | $2,000 |

## Cost Categories

### 1. Test Creation Cost
- Initial test development and setup
- Based on 2 hours per test creation
- Split between QA engineers (60%) and SDETs (40%)

### 2. Maintenance Cost
- Ongoing test maintenance and debugging
- Based on 0.75 hours per test failure
- Split between QA engineers (80%) and SDETs (20%)

### 3. Coordination Cost
- Team coordination and communication overhead
- 4 hours per developer per month (60% reduction with Qase)
- Primarily handled by QA engineers

### 4. Flaky Test Tax
- Additional time spent on unreliable tests
- 0.5 hours extra per test failure
- Handled by QA engineers

### 5. Escaped Defect Cost
- Cost of bugs that reach production
- Based on 10% defect leakage rate
- Uses the cost per escaped defect parameter

## Potential Savings

The calculator highlights potential savings with Qase and AIDEN:

- **Maintenance Cost**: 30-50% reduction
- **Coordination Cost**: 60% reduction
- **Flaky Test Tax**: 25-50% reduction

## Deployment

This calculator is designed to be easily embeddable into static sites:

1. Upload all files to your web server
2. No build process required
3. Works with any static hosting service (Netlify, Vercel, GitHub Pages, etc.)
4. Can be embedded as an iframe or integrated directly

## Customization

### Calculations
- Edit `qase_cost_calculator.js` to modify cost assumptions
- Update default values in the HTML form
- Modify the savings percentages in the results section
