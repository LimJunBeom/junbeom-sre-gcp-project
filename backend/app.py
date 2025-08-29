from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from firestore_service import FirestoreService

app = Flask(__name__, static_folder='frontend', static_url_path='')
CORS(app)  # Enable CORS for frontend integration

# Initialize Firestore service
firestore_service = FirestoreService()

@app.route('/api/submit-survey', methods=['POST'])
def submit_survey():
    """Submit survey response API endpoint"""
    try:
        # Get form data
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        # Extract survey data
        survey_data = {
            'name': data.get('name', '').strip(),
            'email': data.get('email', '').strip(),
            'age': data.get('age', '').strip() or None,
            'satisfaction': data.get('satisfaction', '').strip(),
            'feedback': data.get('feedback', '').strip() or None
        }
        
        # Validate data
        if not firestore_service.validate_survey_data(survey_data):
            return jsonify({
                'success': False,
                'message': 'Please fill in all required fields correctly.'
            }), 400
        
        # Convert satisfaction to integer
        survey_data['satisfaction'] = int(survey_data['satisfaction'])
        
        # Save to Firestore
        doc_id = firestore_service.save_survey_response(survey_data)
        
        return jsonify({
            'success': True,
            'message': 'Survey submitted successfully! Thank you for your response.',
            'document_id': doc_id
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error occurred: {str(e)}'
        }), 500

@app.route('/api/survey-results', methods=['GET'])
def get_survey_results():
    """Get survey results API endpoint"""
    try:
        limit = request.args.get('limit', 100, type=int)
        results = firestore_service.get_survey_results(limit)
        
        return jsonify({
            'success': True,
            'data': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving results: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'simple-survey-system',
        'version': '1.0.0'
    }), 200

@app.route('/', methods=['GET'])
def root():
    """Serve the main survey form"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/results', methods=['GET'])
def results_page():
    """Serve the results page"""
    return send_from_directory(app.static_folder, 'results.html')

@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'service': 'Simple Survey System API',
        'version': '1.0.0',
        'endpoints': {
            'submit_survey': '/api/submit-survey (POST)',
            'get_results': '/api/survey-results (GET)',
            'health_check': '/health (GET)'
        },
        'documentation': 'See README.md for usage instructions'
    }), 200

if __name__ == '__main__':
    # Use port 8080 for Cloud Run compatibility
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
