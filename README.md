# 🌿 Jharkhand Tourism

### Development of a Smart Digital Platform to Promote Eco & Cultural Tourism in Jharkhand

> **Discover Jharkhand – Where Nature Meets Culture**

Jharkhand Tourism is a **smart digital tourism platform** developed to promote the natural beauty, eco-tourism, cultural heritage, tribal experiences, local food, handicrafts, festivals, and tourist destinations of Jharkhand.

The platform combines **modern web technologies, AI-powered travel assistance, multilingual conversational support, personalized trip planning, digital tourism information, maps, weather services, and online payment capabilities** to create a convenient and engaging experience for tourists.

---

## 📌 Project Overview

Jharkhand is known for its waterfalls, forests, wildlife, tribal heritage, cultural traditions, temples, handicrafts, festivals, and natural landscapes.

However, tourists may need to use multiple sources to discover destinations, understand local experiences, plan an itinerary, and obtain travel assistance.

This project provides a **single digital tourism platform** where users can:

* Explore Jharkhand's tourist destinations.
* Discover waterfalls, wildlife, nature, and eco-tourism locations.
* Learn about tribal culture and local traditions.
* Explore local food, handicrafts, and festivals.
* Get personalized travel plans using AI.
* Ask tourism-related questions through an AI chatbot.
* Interact with the chatbot in multiple languages.
* Access destination information through a user-friendly interface.
* Use digital travel and booking/payment features.

---

# 🎯 Objectives

The major objectives of the project are:

1. **Promote Eco-Tourism**

   * Highlight waterfalls, forests, wildlife, hills, and nature-based destinations.

2. **Promote Cultural Tourism**

   * Showcase tribal culture, traditions, festivals, handicrafts, food, and local experiences.

3. **Provide Centralized Tourism Information**

   * Bring important destination and cultural information together in one platform.

4. **Enable Personalized Travel Planning**

   * Generate travel plans based on duration, interests, budget, and preferred activities.

5. **Provide AI-Based Tourist Assistance**

   * Allow users to ask questions and receive tourism-related information through an AI chatbot.

6. **Support Multilingual Interaction**

   * Enable tourists to interact using different languages and language styles.

7. **Improve Tourist Experience**

   * Combine tourism information with modern digital technologies.

---

# ⭐ Key Features

## 🤖 1. AI Tourism Chatbot

The platform includes an AI-powered tourism chatbot designed specifically for Jharkhand tourism.

### Capabilities

* Answers tourism-related questions.
* Provides destination information.
* Explains waterfalls, wildlife, culture, food, festivals, and handicrafts.
* Supports follow-up questions using conversation context.
* Detects the user's language.
* Provides multilingual responses.
* Uses verified project knowledge to reduce unsupported information.
* Avoids inventing unavailable tourism details.

### Supported Languages

* 🇬🇧 English
* 🇮🇳 Telugu
* 🔤 Roman Telugu / Telugu-English
* 🇮🇳 Hindi
* 🔤 Hinglish
* 🌐 Mixed-language conversations

### Example

```text
User:
Tell me about Dassam Falls.

Chatbot:
Provides available verified information about Dassam Falls.

User:
Where is it located?

Chatbot:
Understands that "it" refers to Dassam Falls
and continues the conversation using context.
```

---

# ✈️ 2. AI Trip Planner

The AI Trip Planner helps users create personalized travel itineraries.

Users can provide:

* Travel duration
* Budget
* Interests
* Preferred activities
* Destination preferences

The system uses these preferences to generate a suitable travel plan.

### Example

```text
Duration: 3 Days
Interest: Waterfalls + Nature
Budget: Moderate
Activity: Sightseeing
```

The system can generate a structured itinerary based on the selected preferences.

---

# 🏞️ 3. Tourist Destination Explorer

The platform provides information about important tourism destinations in Jharkhand.

### Featured Destinations

* Dassam Falls
* Hundru Falls
* Betla National Park
* Netarhat
* Dalma
* Baidyanath Temple
* Trikut Hill
* Parasnath Hill
* Canary Hill
* Moti Jharna

The destination section is designed to help users discover places and understand their tourism significance.

---

# 💧 4. Waterfall Tourism

Jharkhand is known for its natural waterfalls.

The platform highlights destinations such as:

* Dassam Falls
* Hundru Falls
* Other notable waterfall destinations

The system provides available destination information while avoiding unsupported claims about current fees, timings, access conditions, or other changing details.

---

# 🌳 5. Eco-Tourism

The platform promotes responsible and nature-based tourism.

### Eco-Tourism Areas

* Forest destinations
* Waterfalls
* Wildlife
* Hills
* Nature experiences
* Responsible tourism

The platform encourages tourists to explore natural destinations while supporting sustainable tourism practices.

---

# 🪶 6. Cultural Tourism

The platform highlights Jharkhand's cultural heritage.

### Cultural Categories

* Tribal culture
* Traditional lifestyles
* Local food
* Handicrafts
* Festivals
* Cultural experiences
* Local communities

This helps visitors understand Jharkhand beyond its tourist destinations.

---

# 🍲 7. Local Food

The platform provides information about local food and traditional culinary experiences of Jharkhand.

Users can explore the relationship between local cuisine, culture, and tourism.

---

# 🧵 8. Handicrafts

The platform promotes traditional handicrafts and local art.

This feature helps create awareness about local craftsmanship and supports the idea of community-based tourism.

---

# 🎉 9. Festivals & Cultural Experiences

Users can explore information about:

* Traditional festivals
* Tribal celebrations
* Local cultural activities
* Traditional practices
* Community experiences

---

# 🗺️ 10. Maps & Location Support

The platform can integrate digital map services to help users understand destination locations and plan their travel.

Maps can support:

* Destination discovery
* Location visualization
* Travel planning
* Route exploration

---

# 🌦️ 11. Weather Information

Weather information can help tourists understand environmental conditions while planning their trip.

This can support better travel planning for outdoor destinations and nature-based activities.

---

# 💳 12. Online Payment Integration

The platform includes a digital payment flow using **Razorpay**.

The payment system can support tourism-related booking or service transactions.

### Payment Flow

```text
User
  ↓
Select Service / Booking
  ↓
Create Payment Order
  ↓
Razorpay Checkout
  ↓
Payment Processing
  ↓
Payment Verification
  ↓
Booking / Transaction Confirmation
```

> Payment credentials and secret API keys must be stored securely using environment variables and must never be committed to GitHub.

---

# 🔐 13. Secure Configuration

The application uses environment variables for sensitive configuration.

Examples include:

* API keys
* Database credentials
* AI service credentials
* Payment credentials
* Backend configuration

Sensitive `.env` files are excluded from Git using `.gitignore`.

---

# 🏗️ System Architecture

The application follows a **frontend–backend–database–AI service architecture**.

```text
                    ┌──────────────────────┐
                    │       USER           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Next.js / React    │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌──────────────┐ ┌────────────┐ ┌──────────────┐
        │ AI Chatbot   │ │ Trip       │ │ Tourism      │
        │ Interface    │ │ Planner    │ │ Features     │
        └──────┬───────┘ └─────┬──────┘ └──────────────┘
               │                │
               └────────┬───────┘
                        ▼
              ┌─────────────────────┐
              │   Node.js /         │
              │   Express Backend   │
              └─────────┬───────────┘
                        │
             ┌──────────┼───────────┐
             │          │           │
             ▼          ▼           ▼
      ┌──────────┐ ┌──────────┐ ┌─────────────┐
      │ MongoDB  │ │ Groq AI  │ │ Razorpay    │
      │ Database │ │ Service  │ │ Payments    │
      └──────────┘ └──────────┘ └─────────────┘
```

---

# 🔄 Application Flow

```text
User
  │
  ▼
Web Interface
  │
  ├── Explore Destinations
  │
  ├── Explore Culture
  │
  ├── AI Trip Planner
  │
  ├── Tourism Chatbot
  │
  ├── Maps / Weather
  │
  └── Booking / Payment
          │
          ▼
      Backend APIs
          │
     ┌────┼─────┐
     ▼    ▼     ▼
 MongoDB Groq Razorpay
```

---

# 🧠 AI Architecture

The AI layer uses **Groq** for conversational AI functionality.

### AI Chatbot Flow

```text
User Question
      ↓
Language Detection
      ↓
Conversation Context
      ↓
Tourism Knowledge
      ↓
Groq AI Model
      ↓
Response Validation
      ↓
Language-Appropriate Response
      ↓
User
```

The chatbot is designed to provide known tourism information while avoiding unsupported factual claims.

---

# 🌐 Multilingual Chatbot Architecture

```text
User Input
    ↓
Language Detection
    ↓
┌─────────────────────────────┐
│ English                     │
│ Telugu                      │
│ Roman Telugu                │
│ Hindi                       │
│ Hinglish                    │
│ Mixed Language              │
└──────────────┬──────────────┘
               ↓
       Tourism Context
               ↓
          Groq AI
               ↓
     Language Validation
               ↓
      Final Chat Response
```

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| Next.js    | Web application framework     |
| React      | UI development                |
| JavaScript | Application logic             |
| HTML       | Page structure                |
| CSS        | Styling and responsive design |

## Backend

| Technology | Purpose                        |
| ---------- | ------------------------------ |
| Node.js    | Backend runtime                |
| Express.js | REST API development           |
| REST APIs  | Frontend-backend communication |

## Database

| Technology | Purpose                      |
| ---------- | ---------------------------- |
| MongoDB    | Tourism and application data |

## AI

| Technology             | Purpose                              |
| ---------------------- | ------------------------------------ |
| Groq                   | AI-powered chatbot                   |
| Tourism Knowledge Base | Verified project tourism information |
| AI Trip Planner        | Personalized itinerary generation    |

## Payment

| Technology | Purpose                    |
| ---------- | -------------------------- |
| Razorpay   | Digital payment processing |

## Development & Deployment

| Tool    | Purpose                |
| ------- | ---------------------- |
| Git     | Version control        |
| GitHub  | Source code management |
| VS Code | Development            |
| Vercel  | Frontend deployment    |
| Railway | Backend deployment     |

---

# 📂 Project Structure

```text
Tourism-Jharkhand/
│
├── app/                         # Next.js application
│
├── components/                 # Reusable React components
│   └── chatbot-widget.tsx      # AI chatbot interface
│
├── api/                        # API-related functionality
│
├── backend/                    # Express backend
│   ├── data/                   # Backend tourism data
│   ├── middleware/             # Backend middleware
│   ├── routes/                 # API routes
│   ├── server.js               # Backend entry point
│   ├── Procfile                # Deployment configuration
│   └── railway.json            # Railway configuration
│
├── data/
│   └── chatbot-knowledge.json  # Tourism chatbot knowledge
│
├── db/
│   └── places.js                # Tourism destination data
│
├── public/                     # Static assets
│
├── package.json                # Project dependencies
├── package-lock.json           # Dependency lock file
├── vercel.json                 # Vercel configuration
├── .gitignore                  # Git ignored files
└── README.md                   # Project documentation
```

---

# 🚀 Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/Maniharika4508/Tourism-Jharkhand.git
```

## 2. Navigate to the Project

```bash
cd Tourism-Jharkhand
```

## 3. Install Frontend Dependencies

```bash
npm install
```

## 4. Configure Environment Variables

Create:

```text
.env.local
```

Add the required configuration values for the project.

Do **not** commit secret keys or credentials to GitHub.

## 5. Start the Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

If port 3000 is already in use, Next.js may automatically use another available port.

---

# 🔧 Backend Setup

Open another terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### API Endpoints

```text
/api/health
/api/docs
/api/chatbot/health
/api/travel-planner/health
```

---

# 🔗 Frontend–Backend Communication

The frontend communicates with the Express backend through REST APIs.

```text
Next.js Frontend
       │
       │ HTTP Requests
       ▼
Express Backend
       │
       ├── Chatbot
       ├── Travel Planner
       ├── Tourism Data
       └── Other Services
```

The backend URL is configured using environment variables rather than hardcoding deployment-specific URLs.

---

# 🧪 Testing

The project can be tested using:

### Chatbot Tests

```text
Tell me about Dassam Falls.

Tell me about Hundru Falls.

Plan a 3-day trip to Jharkhand.

Tell me about Jharkhand tribal culture.

झारखंड में घूमने के लिए अच्छी जगहें कौन सी हैं?

దస్సం జలపాతం గురించి చెప్పు.

dassam waterfalls gurinchi cheppu
```

### Follow-up Test

```text
User:
Tell me about Dassam Falls.

User:
Where is it located?

User:
What can I see there?
```

The chatbot should maintain the conversation context.

---

# 🛡️ Responsible AI Approach

The chatbot is designed with a focus on reliable tourism information.

When the project does not contain verified information about details such as:

* Current entry fees
* Current opening hours
* Exact distance
* Current accessibility
* Real-time facilities
* Current weather

the chatbot should avoid inventing information and clearly indicate when current verification is required.

This helps reduce misleading tourism information.

---

# 🌱 Sustainable Tourism Focus

The project promotes responsible tourism by highlighting:

* Eco-tourism
* Natural destinations
* Wildlife
* Local communities
* Tribal culture
* Handicrafts
* Local food
* Cultural heritage

The platform aims to encourage visitors to explore Jharkhand while increasing awareness of its natural and cultural resources.

---

# 🚀 Deployment

The project supports modern cloud deployment architecture.

### Frontend

```text
Next.js
   ↓
Vercel
```

### Backend

```text
Node.js + Express
   ↓
Railway
```

### Database

```text
MongoDB
```

### AI

```text
Groq API
```

### Payment

```text
Razorpay
```

---

# 🔮 Future Enhancements

Possible future improvements include:

* Advanced AI-based itinerary optimization.
* Real-time destination availability.
* Live weather and travel alerts.
* Personalized destination recommendations.
* AR/VR previews of tourist destinations.
* Smart crowd prediction.
* Enhanced local-business discovery.
* Improved accessibility features.
* More Indian language support.
* Mobile application version.
* Advanced analytics for tourism management.

---

# 📊 Project Highlights

| Area                | Implementation                                  |
| ------------------- | ----------------------------------------------- |
| 🌿 Eco-Tourism      | Nature, waterfalls and wildlife destinations    |
| 🪶 Cultural Tourism | Tribal culture, food, festivals and handicrafts |
| 🤖 AI Chatbot       | Groq-powered tourism assistant                  |
| 🌐 Multilingual     | English, Telugu, Hindi, Roman Telugu & Hinglish |
| ✈️ Trip Planner     | AI-assisted personalized itineraries            |
| 🗺️ Maps            | Digital destination/location support            |
| 🌦️ Weather         | Travel planning support                         |
| 💳 Payments         | Razorpay integration                            |
| 🗄️ Database        | MongoDB                                         |
| ⚙️ Backend          | Node.js + Express                               |
| 💻 Frontend         | Next.js + React                                 |
| 🚀 Deployment       | Vercel + Railway                                |

---

# 👥 Project Team

### Smart Tourism Platform for Jharkhand

Developed as an academic project focused on:

**“Development of a Smart Digital Platform to Promote Eco & Cultural Tourism in Jharkhand.”**

---

# 📜 Disclaimer

This project is developed for **educational, demonstration, and tourism-platform development purposes**.

Tourism information that can change over time, such as fees, timings, accessibility, weather, and travel conditions, should be verified from official or current local sources before making travel decisions.

---

# 📄 License

This project is developed for educational and academic purposes.
