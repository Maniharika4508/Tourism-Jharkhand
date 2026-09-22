# AI Travel Planner – Implementation & Setup Guide

## 1. Introduction

The AI Travel Planner is an integrated feature of the Jharkhand Tourism platform that generates personalized travel plans based on the user's preferences.

The planner is connected directly with the existing Node.js and Express.js backend and uses the Groq AI service for itinerary generation.

The feature is designed specifically around Jharkhand tourism destinations and travel interests.

---

# 2. System Architecture

The travel planner follows this flow:

```text id="v3h8nd"
User
  │
  ▼
Travel Planner Form
  │
  ▼
Next.js Frontend
  │
  ▼
Express.js API
  │
  ├───────────────► Destination Data
  │
  ▼
Groq AI Service
  │
  ▼
Generated Itinerary
  │
  ▼
Frontend Result Page
```

---

# 3. Main Capabilities

The planner accepts travel preferences and creates a customized itinerary.

Users can specify:

* Destination
* Number of days
* Travel interests
* Budget range
* Group size
* Accommodation preference

The generated plan can contain suitable destinations and activities based on the submitted preferences.

---

# 4. Groq API Configuration

The AI functionality requires a Groq API key.

### Step 1 – C
