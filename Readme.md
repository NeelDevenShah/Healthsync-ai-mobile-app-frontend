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

---

# HealthSync.ai

**HealthSync.ai** is a next-generation healthcare platform designed to drastically reduce administrative workload and streamline diagnostic workflows for both doctors and patients. Developed by **Team ML Mavericks**, this AI-driven application empowers medical professionals and patients by automating and optimizing the diagnostic and reporting process.

---

## 🧠 Problem Statement

Healthcare professionals are overwhelmed by administrative burdens and inefficient workflows. The current diagnostic journey involves:

- Multiple patient visits (consultation, test ordering, and result reviews).
- Delays in treatment decisions.
- Excessive time spent on non-critical tasks.

---

## ✅ Our Solution

**HealthSync.ai** reimagines the diagnostic workflow using AI-powered automation.

### Patient Benefits

- ⏱️ **50% Time Saved**: Streamlined pre-appointment diagnostic workflows.
- 🧠 **Intelligent Test Recommendations**: AI suggests appropriate diagnostic tests.
- 📋 **Comprehensive Pre-Analysis**: Patients receive initial results before seeing the doctor.

### Doctor Advantages

- ⚡ **40% Efficiency Increase**: Enhanced consultation speed.
- 📄 **Automated Summaries**: AI-generated summaries of patient data and diagnostics.
- 🏥 **Focus on Critical Care**: Less time on paperwork, more on patients.

---

## 🚀 Key Outcomes

- Faster, smarter healthcare delivery.
- Maximized professional productivity.
- Enhanced patient satisfaction and treatment outcomes.

---

## 🧩 App Modules

The app is divided into two main portals:

### 1. **Patient Portal**

- Upload reports and input symptoms.
- Receive AI-generated diagnosis.
- Review suggested tests and book appointments.

**Screenshots to add:**

- Patient dashboard
- Report upload screen
- AI diagnosis result

### 2. **Doctor Portal**

- Review patient history and test results.
- Approve/modify AI diagnosis.
- Schedule appointments and recommend follow-ups.

**Screenshots to add:**

- Doctor login dashboard
- Patient diagnosis summary
- Report recommendation approval

---

## 🛠️ Tech Stack

| Layer          | Technology   |
| -------------- | ------------ |
| Frontend       | React Native |
| Backend        | Node.js      |
| File Uploads   | Multer       |
| AI Integration | Gemini API   |

---

## 🔄 Diagnostic Workflow

1. **Patient Uploads Medical History**
   - Symptoms, prior reports, etc.
2. **AI Suggests Diagnostic Reports**
   - Smart recommendations powered by Gemini API.
3. **Doctor Reviews and Approves**
   - Doctors can accept or adjust AI suggestions.
4. **Schedule Appointments**
   - Based on test results and urgency.

---

## 🔭 Future Roadmap

### 🔬 Advanced Patient Monitoring

- Chronic disease tracking (Diabetes, Hypertension, IHD)

### 🛎️ Smart Notification System

- Medicine reminders, health check alerts

### 🔗 IoT Device Integration

- Real-time tracking of:
  - Heart rate
  - Blood oxygen saturation
  - Movement patterns

---

## 🧑‍💻 Team

**Team ML Mavericks**  
Passionate about solving real-world healthcare problems using AI and software innovation.

1. Neel Shah (neeldevenshah.ai@gmail.com)
1. Pankil Soni (pmsoni2016@gmail.com)
1. Sneh Shah (snehs5483@gmail.com)

---

## Acknowledgments

- Administrative Burden Survey – Office of Regulatory Affairs and Service Effectiveness, Nova Scotia, 2020
- Gemini API by Google (used for AI diagnosis)

---

## 📂 Repository Information

This is the **backend repository** for HealthSync.ai.

For the frontend repository, visit: [https://github.com/NeelDevenShah/Healthsync-ai-mobile-app-frontend](https://github.com/NeelDevenShah/Healthsync-ai-mobile-app-frontend)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/licenses/MIT) file for details.
