// Simple Survey System - Frontend JavaScript
const submitForm = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        age: form.age.value || null,
        satisfaction: Number(form.satisfaction.value),
        feedback: form.feedback.value.trim() || null
    };

    try {
        const res = await fetch('/api/submit-survey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        alert(json.success ? 'Survey submitted successfully!' : json.message || 'Failed to submit survey');
        if (json.success) form.reset();
    } catch (error) {
        console.error('Error submitting survey:', error);
        alert('Error submitting survey. Please try again.');
    }
};

const loadResults = async () => {
    try {
        const res = await fetch('/api/survey-results');
        const json = await res.json();
        const target = document.getElementById('survey-results');

        if (json.success && json.data) {
            const data = json.data;

            if (data.total_responses === 0) {
                target.innerHTML = `
          <div class="card">
            <div class="header">
              <h1>Survey Results</h1>
              <p>No survey responses yet. Be the first to submit!</p>
            </div>
          </div>
        `;
                return;
            }

            // Create statistics
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

            // Create satisfaction chart
            let chartHTML = '<div class="chart-container"><h3>Satisfaction Distribution</h3>';
            for (let score = 1; score <= 5; score++) {
                const count = data.satisfaction_distribution[score] || 0;
                const percentage = data.total_responses > 0 ? (count / data.total_responses * 100).toFixed(1) : 0;
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

            // Create recent responses
            let responsesHTML = '<div class="recent-responses"><h3>Recent Responses</h3>';
            if (data.recent_responses && data.recent_responses.length > 0) {
                data.recent_responses.forEach(response => {
                    const age = response.age || 'Not specified';
                    const feedback = response.feedback ? `<br><strong>Feedback:</strong> ${response.feedback}` : '';
                    responsesHTML += `
            <div class="response-item">
              <div class="response-header">${response.name} (${response.email})</div>
              <div class="response-details">
                <strong>Age Group:</strong> ${age} | 
                <strong>Satisfaction:</strong> ${response.satisfaction} stars | 
                <strong>Submitted:</strong> ${response.timestamp}
                ${feedback}
              </div>
            </div>
          `;
                });
            } else {
                responsesHTML += '<p>No responses yet.</p>';
            }
            responsesHTML += '</div>';

            target.innerHTML = `
        <div class="card">
          <div class="header">
            <h1>Survey Results</h1>
            <p>Real-time statistics and responses</p>
          </div>
          ${statsHTML}
          ${chartHTML}
          ${responsesHTML}
          <div class="nav-links">
            <a href="/">← Back to Survey</a>
          </div>
        </div>
      `;
        } else {
            target.innerHTML = `<pre>${JSON.stringify(json, null, 2)}</pre>`;
        }
    } catch (error) {
        console.error('Error loading results:', error);
        const target = document.getElementById('survey-results');
        target.innerHTML = '<div class="card"><p>Error loading survey results.</p></div>';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('survey-form');
    if (form) form.addEventListener('submit', submitForm);
    if (document.getElementById('survey-results')) loadResults();
});
