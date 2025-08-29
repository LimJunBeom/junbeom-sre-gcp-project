from google.cloud import firestore
from datetime import datetime
from typing import Dict, List, Optional

class FirestoreService:
    """Firestore database service for survey data management"""
    
    def __init__(self):
        """Initialize Firestore client"""
        self.db = firestore.Client()
        self.collection_name = 'surveys'
    
    def save_survey_response(self, survey_data: Dict) -> str:
        """
        Save survey response to Firestore
        
        Args:
            survey_data: Dictionary containing survey response data
            
        Returns:
            Document ID of the saved response
        """
        try:
            # Add timestamp and server timestamp
            survey_data['timestamp'] = datetime.now().isoformat()
            survey_data['created_at'] = firestore.SERVER_TIMESTAMP
            
            # Save to Firestore
            doc_ref = self.db.collection(self.collection_name).add(survey_data)
            return doc_ref[1].id
            
        except Exception as e:
            raise Exception(f"Failed to save survey response: {str(e)}")
    
    def get_survey_results(self, limit: int = 100) -> Dict:
        """
        Get survey results with statistics
        
        Args:
            limit: Maximum number of responses to retrieve
            
        Returns:
            Dictionary containing survey statistics and recent responses
        """
        try:
            # Get recent survey responses
            surveys_ref = self.db.collection(self.collection_name)
            surveys = list(surveys_ref.order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit).stream())
            
            if not surveys:
                return self._get_empty_results()
            
            # Calculate statistics
            total_responses = len(surveys)
            satisfaction_scores = [doc.to_dict()['satisfaction'] for doc in surveys]
            avg_satisfaction = sum(satisfaction_scores) / len(satisfaction_scores)
            
            # Calculate satisfaction distribution
            satisfaction_distribution = {}
            for score in range(1, 6):
                satisfaction_distribution[score] = satisfaction_scores.count(score)
            
            # Calculate completion rate
            completed_responses = sum(1 for doc in surveys 
                                    if doc.to_dict().get('name') and doc.to_dict().get('email') and doc.to_dict().get('satisfaction'))
            completion_rate = (completed_responses / total_responses) * 100 if total_responses > 0 else 0
            
            # Get recent responses (max 10)
            recent_responses = []
            for doc in surveys[:10]:
                data = doc.to_dict()
                recent_responses.append({
                    'name': data.get('name', 'Anonymous'),
                    'email': data.get('email', 'No email'),
                    'age': data.get('age'),
                    'satisfaction': data.get('satisfaction'),
                    'feedback': data.get('feedback'),
                    'timestamp': data.get('timestamp', 'Unknown')
                })
            
            return {
                'total_responses': total_responses,
                'avg_satisfaction': avg_satisfaction,
                'completion_rate': completion_rate,
                'satisfaction_distribution': satisfaction_distribution,
                'recent_responses': recent_responses
            }
            
        except Exception as e:
            raise Exception(f"Failed to retrieve survey results: {str(e)}")
    
    def _get_empty_results(self) -> Dict:
        """Return empty results structure"""
        return {
            'total_responses': 0,
            'avg_satisfaction': 0,
            'completion_rate': 0,
            'satisfaction_distribution': {},
            'recent_responses': []
        }
    
    def validate_survey_data(self, data: Dict) -> bool:
        """
        Validate survey data
        
        Args:
            data: Survey data to validate
            
        Returns:
            True if valid, False otherwise
        """
        required_fields = ['name', 'email', 'satisfaction']
        
        for field in required_fields:
            if not data.get(field):
                return False
        
        # Validate satisfaction score
        try:
            satisfaction = int(data['satisfaction'])
            if satisfaction < 1 or satisfaction > 5:
                return False
        except (ValueError, TypeError):
            return False
        
        # Validate email format (basic)
        email = data['email']
        if '@' not in email or '.' not in email:
            return False
        
        return True
