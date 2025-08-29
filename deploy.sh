#!/bin/bash

# GCP Simple Survey System Deployment Script
# Optimized for Free Tier usage

set -e

# Environment Variables
PROJECT_ID="your-project-id"  # Change to your actual project ID
REGION="us-central1"
SERVICE_NAME="simple-survey-system"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 GCP Simple Survey System Deployment Started..."

# 1. Build Docker Image
echo "📦 Building Docker Image..."
cd backend
docker build -t $IMAGE_NAME .

# 2. Push Image to GCR
echo "📤 Pushing Image to GCR..."
docker push $IMAGE_NAME

# 3. Deploy to Cloud Run
echo "☁️ Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID"

# 4. Get Service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "✅ Deployment Completed Successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📋 Next Steps:"
echo "1. Create Firestore database in us-central1 region"
echo "2. Configure service account permissions if needed"
echo "3. Test the application"
echo ""
echo "🔗 Frontend URLs:"
echo "   Survey Form: $SERVICE_URL/frontend/index.html"
echo "   Results Page: $SERVICE_URL/frontend/results.html"
echo ""
echo "🔗 API Endpoints:"
echo "   Health Check: $SERVICE_URL/health"
echo "   Submit Survey: $SERVICE_URL/api/submit-survey"
echo "   Get Results: $SERVICE_URL/api/survey-results"
