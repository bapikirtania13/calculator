// Global variables for charts
let sipChart = null;
let investChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calculators
    initializeSIPCalculator();
    initializeInvestmentCalculator();
    initializeAgeCalculator();
    
    // Set default birth date to show example
    const today = new Date();
    const defaultDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
    document.getElementById('birth-date').value = defaultDate.toISOString().split('T')[0];
    calculateAge();
});

// Tab switching functionality
function showCalculator(calculatorType) {
    // Hide all calculators
    const calculators = document.querySelectorAll('.calculator-section');
    calculators.forEach(calc => calc.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected calculator
    document.getElementById(`${calculatorType}-calculator`).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Refresh charts when switching tabs
    setTimeout(() => {
        if (calculatorType === 'sip' && sipChart) {
            sipChart.resize();
        } else if (calculatorType === 'investment' && investChart) {
            investChart.resize();
        }
    }, 100);
}

// SIP Calculator Functions
function initializeSIPCalculator() {
    const inputs = ['sip-amount', 'sip-rate', 'sip-duration'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateSIP);
    });
    calculateSIP(); // Initial calculation
}

function calculateSIP() {
    const monthlyAmount = parseFloat(document.getElementById('sip-amount').value) || 0;
    const annualRate = parseFloat(document.getElementById('sip-rate').value) || 0;
    const years = parseFloat(document.getElementById('sip-duration').value) || 0;
    
    if (monthlyAmount <= 0 || annualRate <= 0 || years <= 0) {
        updateSIPResults(0, 0, 0);
        return;
    }
    
    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = years * 12;
    
    // SIP formula: M * [((1 + r)^n - 1) / r] * (1 + r)
    const futureValue = monthlyAmount * 
        (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * 
        (1 + monthlyRate));
    
    const totalInvestment = monthlyAmount * totalMonths;
    const estimatedReturns = futureValue - totalInvestment;
    
    updateSIPResults(totalInvestment, estimatedReturns, futureValue);
    updateSIPChart(monthlyAmount, annualRate, years);
}

function updateSIPResults(investment, returns, maturity) {
    document.getElementById('sip-total-investment').textContent = formatCurrency(investment);
    document.getElementById('sip-returns').textContent = formatCurrency(returns);
    document.getElementById('sip-maturity').textContent = formatCurrency(maturity);
}

function updateSIPChart(monthlyAmount, annualRate, years) {
    const ctx = document.getElementById('sip-chart').getContext('2d');
    
    // Generate data points for each year
    const labels = [];
    const investmentData = [];
    const returnsData = [];
    
    const monthlyRate = annualRate / 12 / 100;
    
    for (let year = 1; year <= years; year++) {
        labels.push(`Year ${year}`);
        
        const months = year * 12;
        const totalInvestment = monthlyAmount * months;
        
        const futureValue = monthlyAmount * 
            (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
            (1 + monthlyRate));
        
        const returns = futureValue - totalInvestment;
        
        investmentData.push(Math.round(totalInvestment));
        returnsData.push(Math.round(returns));
    }
    
    // Destroy existing chart
    if (sipChart) {
        sipChart.destroy();
    }
    
    sipChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Investment',
                data: investmentData,
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }, {
                label: 'Estimated Returns',
                data: returnsData,
                backgroundColor: 'rgba(33, 150, 243, 0.7)',
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + formatNumber(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₹' + formatNumber(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

// One-Time Investment Calculator Functions
function initializeInvestmentCalculator() {
    const inputs = ['invest-amount', 'invest-rate', 'invest-duration'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateInvestment);
    });
    calculateInvestment(); // Initial calculation
}

function calculateInvestment() {
    const principal = parseFloat(document.getElementById('invest-amount').value) || 0;
    const annualRate = parseFloat(document.getElementById('invest-rate').value) || 0;
    const years = parseFloat(document.getElementById('invest-duration').value) || 0;
    
    if (principal <= 0 || annualRate <= 0 || years <= 0) {
        updateInvestmentResults(0, 0, 0);
        return;
    }
    
    // Compound interest formula: A = P(1 + r)^t
    const futureValue = principal * Math.pow(1 + (annualRate / 100), years);
    const estimatedReturns = futureValue - principal;
    
    updateInvestmentResults(principal, estimatedReturns, futureValue);
    updateInvestmentChart(principal, annualRate, years);
}

function updateInvestmentResults(investment, returns, maturity) {
    document.getElementById('invest-total-investment').textContent = formatCurrency(investment);
    document.getElementById('invest-returns').textContent = formatCurrency(returns);
    document.getElementById('invest-maturity').textContent = formatCurrency(maturity);
}

function updateInvestmentChart(principal, annualRate, years) {
    const ctx = document.getElementById('invest-chart').getContext('2d');
    
    // Generate data points for each year
    const labels = [];
    const investmentData = [];
    const returnsData = [];
    
    for (let year = 1; year <= years; year++) {
        labels.push(`Year ${year}`);
        
        const futureValue = principal * Math.pow(1 + (annualRate / 100), year);
        const returns = futureValue - principal;
        
        investmentData.push(Math.round(principal));
        returnsData.push(Math.round(returns));
    }
    
    // Destroy existing chart
    if (investChart) {
        investChart.destroy();
    }
    
    investChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Investment Amount',
                data: investmentData,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 2,
                fill: false
            }, {
                label: 'Estimated Returns',
                data: returnsData,
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + formatNumber(value);
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₹' + formatNumber(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

// Age Calculator Functions
function initializeAgeCalculator() {
    document.getElementById('birth-date').addEventListener('change', calculateAge);
    document.getElementById('target-date').addEventListener('change', calculateAge);
    
    // Add event listeners for radio buttons
    const ageModeRadios = document.querySelectorAll('input[name="age-mode"]');
    ageModeRadios.forEach(radio => {
        radio.addEventListener('change', handleAgeModeChange);
    });
    
    // Set default target date to today
    document.getElementById('target-date').value = new Date().toISOString().split('T')[0];
}

function handleAgeModeChange() {
    const selectedMode = document.querySelector('input[name="age-mode"]:checked').value;
    const targetDateGroup = document.getElementById('target-date-group');
    
    if (selectedMode === 'specific') {
        targetDateGroup.style.display = 'flex';
    } else {
        targetDateGroup.style.display = 'none';
    }
    
    calculateAge();
}

function calculateAge() {
    const birthDate = new Date(document.getElementById('birth-date').value);
    const selectedMode = document.querySelector('input[name="age-mode"]:checked').value;
    
    let targetDate;
    if (selectedMode === 'specific') {
        targetDate = new Date(document.getElementById('target-date').value);
        if (!targetDate || isNaN(targetDate.getTime())) {
            updateAgeResults(0, 0, 0, 0, 0, 0, 'Please select a target date');
            return;
        }
    } else {
        targetDate = new Date();
    }
    
    if (!birthDate || isNaN(birthDate.getTime()) || birthDate > targetDate) {
        const message = selectedMode === 'specific' ? 
            'Please ensure birth date is before target date' : 
            'Please enter a valid birth date';
        updateAgeResults(0, 0, 0, 0, 0, 0, message);
        return;
    }
    
    // Calculate age
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();
    
    // Adjust for negative days
    if (days < 0) {
        months--;
        const daysInPrevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
        days += daysInPrevMonth;
    }
    
    // Adjust for negative months
    if (months < 0) {
        years--;
        months += 12;
    }
    
    // Calculate total days, hours, and minutes
    const totalDays = Math.floor((targetDate - birthDate) / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    
    // Create description based on mode
    let description;
    if (selectedMode === 'specific') {
        const targetDateStr = targetDate.toLocaleDateString();
        description = `Age on ${targetDateStr}: <span id="total-days">${formatNumber(totalDays)}</span> days`;
    } else {
        description = `You have lived for <span id="total-days">${formatNumber(totalDays)}</span> days`;
    }
    
    updateAgeResults(years, months, days, totalDays, totalHours, totalMinutes, description);
}

function updateAgeResults(years, months, days, totalDays, totalHours, totalMinutes, description = null) {
    document.getElementById('age-years').textContent = years;
    document.getElementById('age-months').textContent = months;
    document.getElementById('age-days').textContent = days;
    
    if (description) {
        document.getElementById('age-description').innerHTML = description;
    } else {
        document.getElementById('age-description').innerHTML = 
            `You have lived for <span id="total-days">${formatNumber(totalDays)}</span> days`;
    }
    
    document.getElementById('total-hours').textContent = formatNumber(totalHours);
    document.getElementById('total-minutes').textContent = formatNumber(totalMinutes);
}

// Utility Functions
function formatCurrency(amount) {
    if (amount >= 10000000) { // 1 crore
        return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) { // 1 lakh
        return '₹' + (amount / 100000).toFixed(2) + ' L';
    } else if (amount >= 1000) { // 1 thousand
        return '₹' + (amount / 1000).toFixed(2) + ' K';
    } else {
        return '₹' + Math.round(amount).toLocaleString('en-IN');
    }
}

function formatNumber(num) {
    if (num >= 10000000) { // 1 crore
        return (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) { // 1 lakh
        return (num / 100000).toFixed(2) + ' L';
    } else if (num >= 1000) { // 1 thousand
        return (num / 1000).toFixed(2) + ' K';
    } else {
        return Math.round(num).toLocaleString('en-IN');
    }
}

// Add smooth scrolling for better UX
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.select();
    });
});

// Keyboard navigation for tabs
document.addEventListener('keydown', function(e) {
    if (e.altKey) {
        const tabs = document.querySelectorAll('.tab-btn');
        const activeTab = document.querySelector('.tab-btn.active');
        const currentIndex = Array.from(tabs).indexOf(activeTab);
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            tabs[currentIndex - 1].click();
            e.preventDefault();
        } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
            tabs[currentIndex + 1].click();
            e.preventDefault();
        }
    }
});

// Add input validation
function validateInput(input, min, max) {
    const value = parseFloat(input.value);
    if (value < min) {
        input.value = min;
    } else if (value > max) {
        input.value = max;
    }
}

// Add event listeners for input validation
document.getElementById('sip-amount').addEventListener('blur', function() {
    validateInput(this, 100, 1000000);
    calculateSIP();
});

document.getElementById('sip-rate').addEventListener('blur', function() {
    validateInput(this, 0.1, 50);
    calculateSIP();
});

document.getElementById('sip-duration').addEventListener('blur', function() {
    validateInput(this, 1, 50);
    calculateSIP();
});

document.getElementById('invest-amount').addEventListener('blur', function() {
    validateInput(this, 1000, 100000000);
    calculateInvestment();
});

document.getElementById('invest-rate').addEventListener('blur', function() {
    validateInput(this, 0.1, 50);
    calculateInvestment();
});

document.getElementById('invest-duration').addEventListener('blur', function() {
    validateInput(this, 1, 50);
    calculateInvestment();
});

// Make calculations responsive to window resize
window.addEventListener('resize', function() {
    setTimeout(() => {
        if (sipChart) sipChart.resize();
        if (investChart) investChart.resize();
    }, 100);
});

// Modal functionality
function openModal(type) {
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    // Set modal content based on type
    switch(type) {
        case 'privacy':
            title.textContent = 'Privacy Policy';
            body.innerHTML = getPrivacyPolicyContent();
            break;
        case 'terms':
            title.textContent = 'Terms & Conditions';
            body.innerHTML = getTermsConditionsContent();
            break;
        case 'disclaimer':
            title.textContent = 'Disclaimer';
            body.innerHTML = getDisclaimerContent();
            break;
        case 'contact':
            title.textContent = 'Contact Information';
            body.innerHTML = getContactContent();
            break;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Modal content functions
function getPrivacyPolicyContent() {
    return `
        <h3>Information We Collect</h3>
        <p>This Financial Calculator website is designed to work entirely in your browser and does not collect any personal information. All calculations are performed locally on your device.</p>
        
        <h3>Data Storage</h3>
        <p>We do not store any of your financial information, calculation results, or personal data on our servers. All data remains on your device and is not transmitted to us.</p>
        
        <h3>Cookies and Local Storage</h3>
        <p>This website may use browser local storage to remember your preferences and input values for a better user experience. No personal information is stored or tracked.</p>
        
        <h3>Third-Party Services</h3>
        <p>We use Chart.js library for displaying charts, which is loaded from a CDN. Please refer to their privacy policy for more information about their data practices.</p>
        
        <h3>Analytics</h3>
        <p>We do not use any analytics services or tracking mechanisms on this website.</p>
        
        <h3>Contact</h3>
        <p>If you have any questions about this Privacy Policy, please contact us using the contact information provided.</p>
        
        <h3>Changes to Privacy Policy</h3>
        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
        
        <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
    `;
}

function getTermsConditionsContent() {
    return `
        <h3>Acceptance of Terms</h3>
        <p>By accessing and using this Financial Calculator website, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h3>Use License</h3>
        <p>Permission is granted to temporarily download one copy of this website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
        
        <h3>Calculator Accuracy</h3>
        <p>While we strive to provide accurate calculations, all results are estimates and should not be considered as financial advice. Please consult with a qualified financial advisor for investment decisions.</p>
        
        <h3>Disclaimer of Warranties</h3>
        <p>The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
        
        <h3>Limitations</h3>
        <p>In no event shall the website owner or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use this website.</p>
        
        <h3>Privacy</h3>
        <p>Your privacy is important to us. Please refer to our Privacy Policy for information about how we handle your data.</p>
        
        <h3>Governing Law</h3>
        <p>These terms and conditions are governed by and construed in accordance with applicable laws, and you irrevocably submit to the exclusive jurisdiction of the courts.</p>
        
        <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
    `;
}

function getDisclaimerContent() {
    return `
        <h3>Financial Information Disclaimer</h3>
        <p>The information provided by this Financial Calculator website is for general informational and educational purposes only. It is not intended as financial, investment, or professional advice.</p>
        
        <h3>No Financial Advice</h3>
        <p>The calculations and results provided by this website should not be construed as professional financial advice. Always consult with a qualified financial advisor before making any investment decisions.</p>
        
        <h3>Accuracy of Calculations</h3>
        <p>While we strive to ensure the accuracy of our calculators, we make no guarantees about the accuracy, completeness, or reliability of the calculations or results provided.</p>
        
        <h3>Market Risks</h3>
        <p>All investments carry inherent risks, and past performance does not guarantee future results. Market conditions can significantly affect investment returns.</p>
        
        <h3>No Warranty</h3>
        <p>This website is provided "as is" without any representations or warranties, express or implied. We disclaim all warranties, including but not limited to implied warranties of merchantability and fitness for a particular purpose.</p>
        
        <h3>Limitation of Liability</h3>
        <p>Under no circumstances shall we be liable for any direct, indirect, special, incidental, or consequential damages arising from the use of this website or reliance on its calculations.</p>
        
        <h3>External Links</h3>
        <p>This website may contain links to external sites. We are not responsible for the content, privacy policies, or practices of third-party websites.</p>
        
        <h3>Use at Your Own Risk</h3>
        <p>You acknowledge that you use this website and its calculators at your own risk and that you are solely responsible for any decisions made based on the information provided.</p>
        
        <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
    `;
}

function getContactContent() {
    return `
        <h3>Get in Touch</h3>
        <p>If you have any questions, suggestions, or feedback about our Financial Calculator, we'd love to hear from you!</p>
        
        <div class="contact-info">
            <h4>Developer Information</h4>
            <p><strong>Name:</strong> Bapi Kirtania</p>
            <p><strong>Role:</strong> Full Stack Developer & Website Owner</p>
            <p><strong>Email:</strong> <a href="mailto:business.kirtania@gmail.com">business.kirtania@gmail.com</a></p>
            <p><strong>Website:</strong> Financial Calculator</p>
        </div>
        
        <h3>About This Project</h3>
        <p>This Financial Calculator was developed to help individuals make informed financial decisions by providing easy-to-use tools for:</p>
        <ul>
            <li>SIP (Systematic Investment Plan) calculations</li>
            <li>One-time investment projections</li>
            <li>Age calculations with detailed breakdowns</li>
        </ul>
        
        <h3>Technical Support</h3>
        <p>If you encounter any technical issues or bugs while using the calculator, please don't hesitate to report them. Your feedback helps us improve the user experience.</p>
        
        <h3>Feature Requests</h3>
        <p>Have an idea for a new calculator or feature? We're always looking to improve and add new functionality based on user needs.</p>
        
        <h3>Business Inquiries</h3>
        <p>For business partnerships, collaboration opportunities, or custom development projects, please reach out via email.</p>
        
        <p><strong>Response Time:</strong> We typically respond to inquiries within 24-48 hours.</p>
    `;
}