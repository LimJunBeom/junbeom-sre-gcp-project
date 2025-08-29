# GCP Simple Survey System - Infrastructure as Code
# Optimized for Free Tier usage

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

# GCP Project Configuration
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region (us-central1 recommended for free tier)"
  type        = string
  default     = "us-central1"
}

# GCP Provider Configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

# Firestore Database
resource "google_firestore_database" "database" {
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  
  # Free tier configuration
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
}

# Cloud Run Service Account
resource "google_service_account" "cloud_run_sa" {
  account_id   = "simple-survey-system-sa"
  display_name = "Simple Survey System Service Account"
  description  = "Service account for Simple Survey System"
}

# Firestore User Role
resource "google_project_iam_member" "firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Cloud Run Service
resource "google_cloud_run_service" "survey_service" {
  name     = "simple-survey-system"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/simple-survey-system"
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
        
        env {
          name  = "GOOGLE_CLOUD_PROJECT"
          value = var.project_id
        }
      }
      
      service_account_name = google_service_account.cloud_run_sa.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Public Access for Cloud Run
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_service.survey_service.location
  project  = google_cloud_run_service.survey_service.project
  service  = google_cloud_run_service.survey_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output Values
output "service_url" {
  description = "Cloud Run Service URL"
  value       = google_cloud_run_service.survey_service.status[0].url
}

output "firestore_database" {
  description = "Firestore Database Information"
  value       = google_firestore_database.database
}

output "service_account_email" {
  description = "Cloud Run Service Account Email"
  value       = google_service_account.cloud_run_sa.email
}
