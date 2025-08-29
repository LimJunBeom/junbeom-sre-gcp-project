# Simple Survey System on GCP

A lightweight survey system built on Google Cloud Platform using Cloud Run and Firestore, optimized for free tier usage.

## 🚀 Features

- **Survey Submission**: Web form for collecting survey responses
- **Data Storage**: Firestore NoSQL database integration
- **Real-time Results**: Live statistics and response visualization
- **Free Tier Optimized**: Designed to stay within GCP Always Free limits
- **Modern UI**: Responsive design with beautiful gradients and animations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Backend       │───▶│    Firestore    │
│   (HTML/CSS/JS) │    │   (Flask API)   │    │   (NoSQL DB)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Free Tier Limits

### Cloud Run
- **Requests**: 2 million requests per month (Always Free)
- **CPU**: 1 vCPU
- **Memory**: 512MB
- **Region**: us-central1

### Firestore
- **Storage**: 1GB (Always Free)
- **Reads/Writes**: 50,000 per month (Always Free)
- **Region**: us-central1

## 🛠️ Tech Stack

- **Backend**: Python Flask with REST API
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: Google Cloud Firestore
- **Container**: Docker
- **Platform**: Google Cloud Run
- **Infrastructure**: Terraform (optional)

## 📁 Project Structure

```
gcp-survey-app/
│
├── backend/                # Flask API (survey response storage, results retrieval)
│   ├── app.py               # Main Flask application
│   ├── requirements.txt     # Python packages
│   ├── Dockerfile           # Cloud Run deployment
│   ├── firestore_service.py # Firestore integration logic
│   └── .dockerignore        # Docker exclude files
│
├── frontend/               # Simple web forms
│   ├── index.html           # Survey input form
│   ├── results.html         # Aggregated results page
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
│
├── infra/                  # Optional (Terraform IaC)
│   └── main.tf              # Cloud Run + Firestore resource definitions
│
├── deploy.sh               # Deployment script
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Google Cloud Platform account
- Google Cloud CLI installed
- Docker installed
- Python 3.11+

### 1. GCP Project Setup

```bash
# Login to GCP CLI
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Local Testing

```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Run backend locally
python app.py

# Open frontend in browser
# Navigate to http://localhost:8080
```

### 3. Deployment

#### Option 1: Script Deployment (Recommended)

```bash
# Update PROJECT_ID in deploy.sh
vim deploy.sh

# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

#### Option 2: Terraform Deployment

```bash
cd infra

# Create variables file
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your project_id

# Initialize and deploy
terraform init
terraform plan
terraform apply
```

### 4. Firestore Database Setup

Create Firestore database manually in GCP Console or use Terraform:

```bash
# Manual setup in GCP Console:
# - Region: us-central1
# - Mode: Native mode
# - Delete protection: Disabled (for free tier)
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLOUD_PROJECT` | GCP Project ID | - |
| `PORT` | Application port | 8080 |

## 📈 Monitoring & Cost Management

### Cost Monitoring
- GCP Console > Billing for usage tracking
- Cloud Run metrics monitoring
- Firestore usage tracking

### Free Tier Optimization Tips
1. **Cloud Run**: Limit max instances (10)
2. **Firestore**: Optimize read/write operations
3. **Image Size**: Minimize Docker image size
4. **Region**: Use us-central1 (free tier optimized)

## 🧪 Testing

### API Endpoints

```bash
# Health check
curl https://your-service-url/health

# Submit survey (POST)
curl -X POST https://your-service-url/api/submit-survey \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","satisfaction":"5"}'

# Get results
curl https://your-service-url/api/survey-results
```

### Local Testing

```bash
# Build Docker image
cd backend
docker build -t simple-survey-system .

# Run locally
docker run -p 8080:8080 simple-survey-system
```

## 🔒 Security Considerations

- **Authentication**: Currently public access (development use)
- **Data Validation**: Server-side input validation
- **CORS**: Configured for frontend integration
- **Rate Limiting**: Recommended for production

## 🚨 Troubleshooting

### Common Issues

1. **Firestore Connection Error**
   - Check service account permissions
   - Verify project ID configuration

2. **Cloud Run Deployment Failure**
   - Verify Docker image build
   - Check memory/CPU limits

3. **Free Tier Exceeded**
   - Monitor usage in GCP Console
   - Set resource limits

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions, please use GitHub Issues.