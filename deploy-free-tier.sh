#!/bin/bash

# GCP Simple Survey System - Free Tier Deployment Script
# No local Docker required - uses Cloud Build

set -e

# Environment Variables
PROJECT_ID="your-project-id"  # Change to your actual project ID
REGION="us-central1"
SERVICE_NAME="simple-survey-system"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 GCP Simple Survey System - Free Tier Deployment"
echo "=================================================="

# 1. Set project and region
echo "📋 Setting up GCP configuration..."
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

# 2. Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# 3. Build and push image using Cloud Build
echo "📦 Building and pushing Docker image..."
gcloud builds submit --tag $IMAGE_NAME -f backend/Dockerfile .

# 4. Deploy to Cloud Run with free tier settings
echo "☁️ Deploying to Cloud Run (Free Tier Optimized)..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID"

# 5. Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo ""
echo "✅ Deployment Completed Successfully!"
echo "====================================="
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📋 Next Steps:"
echo "1. Create Firestore database in GCP Console:"
echo "   - Go to Firestore → Create database"
echo "   - Select 'Native mode'"
echo "   - Choose 'us-central1' region"
echo "   - Disable delete protection (for free tier)"
echo ""
echo "2. Test the application:"
echo "   📝 Survey Form: $SERVICE_URL/"
echo "   📊 Results Page: $SERVICE_URL/results"
echo "   🔍 Health Check: $SERVICE_URL/health"
echo ""
echo "3. API Endpoints:"
echo "   POST /api/submit-survey - Submit survey response"
echo "   GET  /api/survey-results - Get survey results"
echo "   GET  /health - Health check"
echo ""
echo "💰 Free Tier Limits:"
echo "   - Cloud Run: 2M requests/month"
echo "   - Firestore: 1GB storage + 50K reads/writes/month"
echo "   - Region: us-central1 (Always Free)"
echo ""
echo "🎯 Ready to use! Your survey system is now live."
