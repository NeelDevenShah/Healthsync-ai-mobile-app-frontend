# HealthSync AI Mobile App

HealthSync AI is a comprehensive health monitoring and wellness application that leverages artificial intelligence to provide personalized health insights, tracking, and recommendations.

## Features

- **Health Monitoring**: Track vital signs, activity levels, and sleep patterns
- **AI-Powered Analysis**: Get personalized insights based on your health data
- **Medication Management**: Set reminders and track medication intake
- **Appointment Scheduling**: Manage healthcare appointments
- **Secure Communication**: Connect with healthcare providers securely
- **Wellness Goals**: Set and track personalized wellness goals

## Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later) or yarn (v1.22.0 or later)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS dependencies, macOS only)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/NeelDevenShah/Healthsync-ai-app-backend
cd Healthsync-ai-mobile-app-frontend
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install
```

### 3. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 4. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
API_URL=your_api_url
SOCKET_URL=your_socket_url
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

###
