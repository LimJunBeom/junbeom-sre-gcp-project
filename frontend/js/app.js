// Simple Survey System - Frontend JavaScript
// Configuration
const API_BASE_URL = window.location.origin; // Use same origin for API calls

// API endpoints
const API_ENDPOINTS = {
    submitSurvey: '/api/submit-survey',
    getResults: '/api/survey-results',
    health: '/health'
};

// Utility functions
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function showLoading(button) {
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Submitting...';
}

function hideLoading(button, originalText) {
    button.disabled = false;
    button.textContent = originalText;
}

function validateForm(formData) {
    const required = ['name', 'email', 'satisfaction'];

    for (const field of required) {
        if (!formData.get(field) || formData.get(field).trim() === '') {
            return `Please fill in the ${field} field.`;
        }
    }

    // Validate email format
    const email = formData.get('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address.';
    }

    // Validate satisfaction score
    const satisfaction = parseInt(formData.get('satisfaction'));
    if (isNaN(satisfaction) || satisfaction < 1 || satisfaction > 5) {
        return 'Please select a valid satisfaction score.';
    }

    return null;
}

// Survey form submission
async function submitSurvey(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    // Get form data
    const formData = new FormData(form);

    // Validate form
    const validationError = validateForm(formData);
    if (validationError) {
        showAlert(validationError, 'error');
        return;
    }

    // Show loading state
    showLoading(submitButton);

    try {
        // Convert form data to JSON
        const surveyData = {};
        formData.forEach((value, key) => {
            surveyData[key] = value.trim();
        });

        // Submit survey
        const response = await fetch(API_ENDPOINTS.submitSurvey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(surveyData)
        });

        const result = await response.json();

        if (result.success) {
            showAlert(result.message, 'success');
            form.reset();
        } else {
            showAlert(result.message, 'error');
        }

    } catch (error) {
        console.error('Error submitting survey:', error);
        showAlert('An error occurred while submitting the survey. Please try again.', 'error');
    } finally {
        hideLoading(submitButton, originalButtonText);
    }
}

// Load and display survey results
async function loadSurveyResults() {
    const resultsContainer = document.getElementById('survey-results');
    if (!resultsContainer) return;

    try {
        const response = await fetch(API_ENDPOINTS.getResults);
        const result = await response.json();

        if (result.success) {
            displayResults(result.data);
        } else {
            showAlert('Failed to load survey results.', 'error');
        }

    } catch (error) {
        console.error('Error loading results:', error);
        showAlert('An error occurred while loading the results.', 'error');
    }
}

// Display survey results
function displayResults(data) {
    const resultsContainer = document.getElementById('survey-results');

    if (data.total_responses === 0) {
        resultsContainer.innerHTML = `
            <div class="card">
                <div class="header">
                    <h1>Survey Results</h1>
                    <p>No survey responses yet. Be the first to submit!</p>
                </div>
            </div>
        `;
        return;
    }

    // Create statistics cards
    const statsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${data.total_responses}</div>
                <div class="stat-label">Total Responses</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.avg_satisfaction.toFixed(1)}</div>
                <div class="stat-label">Average Satisfaction</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.completion_rate.toFixed(1)}%</div>
                <div class="stat-label">Completion Rate</div>
            </div>
        </div>
    `;

    // Create satisfaction distribution chart
    const chartHTML = createSatisfactionChart(data.satisfaction_distribution, data.total_responses);

    // Create recent responses list
    const responsesHTML = createRecentResponsesList(data.recent_responses);

    // Combine all sections
    resultsContainer.innerHTML = `
        <div class="card">
            <div class="header">
                <h1>Survey Results</h1>
                <p>Real-time statistics and responses</p>
            </div>
            ${statsHTML}
            ${chartHTML}
            ${responsesHTML}
            <div class="nav-links">
                <a href="index.html">← Back to Survey</a>
            </div>
        </div>
    `;
}

// Create satisfaction distribution chart
function createSatisfactionChart(distribution, total) {
    let chartHTML = `
        <div class="chart-container">
            <h3>Satisfaction Distribution</h3>
    `;

    for (let score = 1; score <= 5; score++) {
        const count = distribution[score] || 0;
        const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;

        chartHTML += `
            <div class="satisfaction-label">
                <span>${score} Star${score > 1 ? 's' : ''}</span>
                <span>${count} responses (${percentage}%)</span>
            </div>
            <div class="satisfaction-bar">
                <div class="satisfaction-fill" style="width: ${percentage}%"></div>
            </div>
        `;
    }

    chartHTML += '</div>';
    return chartHTML;
}

// Create recent responses list
function createRecentResponsesList(responses) {
    if (responses.length === 0) {
        return '<div class="recent-responses"><h3>Recent Responses</h3><p>No responses yet.</p></div>';
    }

    let responsesHTML = `
        <div class="recent-responses">
            <h3>Recent Responses (Latest ${responses.length})</h3>
    `;

    responses.forEach(response => {
        const age = response.age || 'Not specified';
        const feedback = response.feedback ? `<br><strong>Feedback:</strong> ${response.feedback}` : '';

        responsesHTML += `
            <div class="response-item">
                <div class="response-header">${response.name} (${response.email})</div>
                <div class="response-details">
                    <strong>Age Group:</strong> ${age} | 
                    <strong>Satisfaction:</strong> ${response.satisfaction} stars | 
                    <strong>Submitted:</strong> ${formatTimestamp(response.timestamp)}
                    ${feedback}
                </div>
            </div>
        `;
    });

    responsesHTML += '</div>';
    return responsesHTML;
}

// Format timestamp for display
function formatTimestamp(timestamp) {
    if (!timestamp || timestamp === 'Unknown') {
        return 'Unknown';
    }

    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch (error) {
        return timestamp;
    }
}

// Health check function
async function checkHealth() {
    try {
        const response = await fetch(API_ENDPOINTS.health);
        const result = await response.json();

        if (result.status === 'healthy') {
            console.log('API is healthy:', result);
        } else {
            console.warn('API health check failed:', result);
        }
    } catch (error) {
        console.error('Health check error:', error);
    }
}

// Initialize application
function init() {
    // Add event listeners
    const surveyForm = document.getElementById('survey-form');
    if (surveyForm) {
        surveyForm.addEventListener('submit', submitSurvey);
    }

    // Load results if on results page
    const resultsPage = document.getElementById('survey-results');
    if (resultsPage) {
        loadSurveyResults();
    }

    // Perform health check
    checkHealth();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
