# PlayerNation Match Report Generator

PlayerNation is a premium mobile application that automatically transforms raw, low-level football event data (passes, shots, duels, fouls, telemetry) into narrative, actionable tactical match reports for players and coaches.

The system features a custom data pre-processing pipeline that reduces thousands of on-field events into structured statistical dimensions, which are then analyzed by a Large Language Model (Gemini or Llama) to produce clean, factual sports summaries.

---

## 🛠️ Architecture & Tech Stack

The project is structured as a mono-repo containing:
- **`backend/`**: A Fastify API written in TypeScript. It integrates **Prisma ORM** with a **PostgreSQL** database (running in Docker) to cache generated reports and store bookmarked matches.
- **`mobile/`**: A React Native Expo mobile application utilizing standard vanilla styling and **Zustand** for state management.

```text
React Native APK Client (Zustand + Expo)
                    │
                    ▼ (HTTP REST)
         Fastify API (TypeScript)
                    │
         ┌──────────┼──────────┐
         ▼          ▼          ▼
   Local Dataset  Prisma  LLM Provider (Gemini / Groq / Fallback)
                    │
                    ▼
              PostgreSQL (Docker)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v20+
- **pnpm** (preferred for backend package management)
- **Docker Desktop** (for running PostgreSQL)

---

### 2. Database & Backend Setup

1. **Start Docker Desktop** on your machine.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. **Start PostgreSQL DB**:
   ```bash
   docker compose up -d
   ```
   This spins up the database container on port `5432` with username `playernation_user` and password `playernation_password`.
5. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` folder:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL="postgresql://playernation_user:playernation_password@localhost:5432/playernation_dev?schema=public"
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   ```
   *Note: If no API keys are provided, the backend falls back to a structured mock report generator.*
6. **Run Database Migrations**:
   Sync your database tables and generate Prisma Client TS declarations:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
7. **Download the Dataset**:
   Fetch and unpack the Wyscout World Cup match events using the automated script:
   ```bash
   npx tsx scripts/download-dataset.ts
   ```
8. **Start the API Server**:
   ```bash
   pnpm dev
   ```
   The backend server runs at `http://localhost:3000`. You can test connection health by visiting `http://localhost:3000/health`.

---

### 3. Mobile Setup & Running the App

1. Navigate to the mobile directory:
   ```bash
   cd ../mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Expo development server:
   ```bash
   npm start
   ```
4. **Run on Device or Emulator**:
   - **Android Emulator:** Ensure your emulator is open, then press `a` in your terminal.
   - **Physical Device:** Install the **Expo Go** app from the Google Play Store, and scan the QR code printed in the terminal (ensure both your computer and phone are connected to the same Wi-Fi network).

---

## 📱 Building & Installing the APK

To generate a standalone installable APK on a standard Android device:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```
2. **Login to Expo Account**:
   ```bash
   eas login
   ```
3. **Configure Build profile**:
   Create or verify `eas.json` in the `mobile/` directory:
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       },
       "production": {}
     }
   }
   ```
4. **Trigger Build**:
   ```bash
   eas build -p android --profile preview
   ```
5. **Install on Device**:
   EAS will generate a QR code pointing to a download link containing the `.apk` file. Scan the QR code or download the file directly, and transfer it to your Android device. Enable "Install from unknown sources" on your phone to complete installation.
