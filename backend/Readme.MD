# 🏥 DelhiMed — Backend

> Node.js · Express · MongoDB · Gemini AI · Razorpay · Cloudinary

Healthcare platform backend powering doctor appointments, medication tracking, AI-analyzed medical reports, and patient health profiles.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [API Routes](#-api-routes)
  - [Auth](#auth----apiauth)
  - [Appointments](#appointments----apiappointment)
  - [Doctor](#doctor----apidoctor)
  - [Health Profile](#health-profile----apihealthprofile)
  - [Medication](#medication----apimedication)
  - [Payment](#payment----apipayment)
  - [Queue](#queue----apiqueue)
  - [Report](#report----apireport)
  - [User](#user----apiuser)
- [MongoDB Schemas](#-mongodb-schemas)
- [Services · Jobs · Utils](#-services--jobs--utils)
- [Middleware](#-middleware)

---

## 🛠 Tech Stack

| Layer         | Technology            |
| ------------- | --------------------- |
| Runtime       | Node.js               |
| Framework     | Express.js            |
| Database      | MongoDB (Mongoose)    |
| AI            | Google Gemini API     |
| Payments      | Razorpay              |
| File Storage  | Cloudinary            |
| Auth          | JWT                   |
| Notifications | Twilio (SMS/WhatsApp) |

---

## 📁 Project Structure

```
backend/
├── server.js                   # Express app entry, mounts all routers
├── package.json
├── .env
│
├── controllers/                # Route handler logic
│   ├── appointmentController.js
│   ├── authControllers.js
│   ├── doctorController.js
│   ├── healthProfileController.js
│   ├── medicationController.js
│   ├── paymentController.js
│   ├── queueController.js
│   ├── reportController.js
│   └── userController.js
│
├── routes/                     # Express routers
│   ├── authRoutes.js
│   ├── appointment.js
│   ├── doctorRoutes.js
│   ├── healthProfileRoute.js
│   ├── medicationRoute.js
│   ├── paymentRoute.js
│   ├── queueRoute.js
│   ├── reportRoute.js
│   ├── statusRoute.js
│   └── userRoute.js
│
├── models/                     # Mongoose schemas
│   ├── appointmentSchema.js
│   ├── docterSchema.js
│   ├── medicationSchema.js
│   ├── patientHealthSumSchema.js
│   ├── queueSchema.js
│   ├── reportSchema.js
│   └── userSchema.js
│
├── middleware/                 # Auth, role, admin guards
│   ├── authmiddleware.js
│   ├── adminOnly.js
│   └── roleMiddleware.js
│
├── services/                   # External API wrappers
│   └── geminiService.js
│
├── jobs/                       # Background async tasks
│   ├── processReport.js
│   └── updateHealthProfile.js
│
└── utils/                      # Pure helper functions
    └── calculateETA.js
```

---

## 🔑 Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash        # optional, has fallback

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=your_twilio_phone
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Add your .env file (see above)

# 3. Start dev server
npm run dev

# 4. Start production server
npm start
```

Server runs on `http://localhost:5000` by default.

---

## 🔀 API Routes

All routes require `Authorization: Bearer <token>` unless marked **Public**.

---

### Auth — `/api/auth`

| Method | Endpoint           | Auth   | Description                                                     |
| ------ | ------------------ | ------ | --------------------------------------------------------------- |
| `POST` | `/api/auth/signup` | Public | Registers a new user account and returns JWT token.             |
| `POST` | `/api/auth/login`  | Public | Authenticates user or doctor credentials and returns JWT token. |

---

### Appointments — `/api/appointment`

| Method | Endpoint                            | Auth    | Description                                                          |
| ------ | ----------------------------------- | ------- | -------------------------------------------------------------------- |
| `GET`  | `/api/appointment/my-appointments`  | 🔒 User | Returns a protected test response with current user id.              |
| `GET`  | `/api/appointment/booked-slots`     | 🔒 User | Returns already booked slots for a doctor on a given date.           |
| `POST` | `/api/appointment/book`             | 🔒 User | Validates slot and creates a Razorpay order for appointment booking. |
| `GET`  | `/api/appointment/my-appointements` | 🔒 User | Returns logged-in patient appointments with doctor details.          |
| `GET`  | `/api/appointment/:id/status`       | 🔒 User | Returns queue position, ETA, and live appointment status.            |
| `PUT`  | `/api/appointment/:id/arrive`       | 🔒 User | Verifies appointment PIN and marks patient as arrived.               |

---

### Doctor — `/api/doctor`

| Method | Endpoint                 | Auth     | Description                                                      |
| ------ | ------------------------ | -------- | ---------------------------------------------------------------- |
| `POST` | `/api/doctor/signup`     | 🔒 Admin | Creates doctor account (admin-only) and returns JWT token.       |
| `GET`  | `/api/doctor/allDoctors` | Public   | Returns doctor listing with key profile and availability fields. |
| `GET`  | `/api/doctor/:id`        | Public   | Returns full details for a specific doctor.                      |

---

### Health Profile — `/api/healthProfile`

| Method   | Endpoint                       | Auth    | Description                                            |
| -------- | ------------------------------ | ------- | ------------------------------------------------------ |
| `GET`    | `/api/healthProfile/`          | 🔒 User | Returns complete patient health profile.               |
| `PUT`    | `/api/healthProfile/user-data` | 🔒 User | Saves manual user-provided health information.         |
| `DELETE` | `/api/healthProfile/`          | 🔒 User | Deletes patient health profile document.               |
| `GET`    | `/api/healthProfile/ai-only`   | 🔒 User | Returns only the AI-extracted section of the profile.  |
| `GET`    | `/api/healthProfile/user-only` | 🔒 User | Returns only the user-provided section of the profile. |

---

### Medication — `/api/medication`

| Method  | Endpoint                      | Auth    | Description                                              |
| ------- | ----------------------------- | ------- | -------------------------------------------------------- |
| `GET`   | `/api/medication/`            | 🔒 User | Returns all medications for the logged-in user.          |
| `POST`  | `/api/medication/`            | 🔒 User | Creates a new medication record for the user.            |
| `PATCH` | `/api/medication/reset-daily` | 🔒 User | Resets the taken flag to false for all user medications. |
| `PATCH` | `/api/medication/:id`         | 🔒 User | Updates the taken status of one medication entry.        |

---

### Payment — `/api/payment`

| Method | Endpoint                    | Auth    | Description                                                         |
| ------ | --------------------------- | ------- | ------------------------------------------------------------------- |
| `POST` | `/api/payment/verify`       | 🔒 User | Verifies Razorpay signature and finalizes a paid appointment.       |
| `POST` | `/api/payment/upi-confirm`  | 🔒 User | Confirms UPI payment flow and finalizes appointment with token/PIN. |
| `POST` | `/api/payment/cash-confirm` | 🔒 User | Finalizes cash appointment and reserves slot/token.                 |

---

### Queue — `/api/queue`

| Method | Endpoint          | Auth      | Description                                                       |
| ------ | ----------------- | --------- | ----------------------------------------------------------------- |
| `PUT`  | `/api/queue/next` | 🔒 Doctor | Advances doctor queue to next token and marks previous as served. |

---

### Report — `/api/report`

| Method   | Endpoint                             | Auth    | Description                                                                    |
| -------- | ------------------------------------ | ------- | ------------------------------------------------------------------------------ |
| `POST`   | `/api/report/upload`                 | 🔒 User | Uploads report to Cloudinary, saves metadata, starts AI background processing. |
| `GET`    | `/api/report/`                       | 🔒 User | Returns all reports for the logged-in user.                                    |
| `GET`    | `/api/report/:id/ai-status`          | 🔒 User | Returns AI processing state, summary, and AI error for one report.             |
| `POST`   | `/api/report/:id/regenerate-summary` | 🔒 User | Resets AI state and re-triggers background summary generation.                 |
| `GET`    | `/api/report/:id`                    | 🔒 User | Returns one report document for the user.                                      |
| `PATCH`  | `/api/report/:id`                    | 🔒 User | Updates report metadata fields.                                                |
| `DELETE` | `/api/report/:id`                    | 🔒 User | Deletes report from Cloudinary and database.                                   |

---

### User — `/api/user`

| Method  | Endpoint                    | Auth    | Description                                             |
| ------- | --------------------------- | ------- | ------------------------------------------------------- |
| `GET`   | `/api/user/profile`         | 🔒 User | Returns logged-in user profile (without password).      |
| `PATCH` | `/api/user/profile`         | 🔒 User | Updates editable profile fields for the logged-in user. |
| `POST`  | `/api/user/profile/picture` | 🔒 User | Uploads and updates profile picture via Cloudinary.     |

---

## 🗄️ MongoDB Schemas

### `userSchema`

`name` · `phone` · `email` · `password` · `role` · `abhaId` · `profilePicture` · `createdAt` · `updatedAt`

### `docterSchema`

`name` · `phone` · `email` · `password` · `speciality` · `startTime` · `avgConsultTime` · `fees`

### `appointmentSchema`

`patientId` · `doctorId` · `date` · `slotTime` · `appointmentNumber` · `pinHash` · `status` · `paymentStatus` · `createdAt` · `updatedAt`

### `medicationSchema`

`userId` · `name` · `dosage` · `time` · `taken` · `createdAt` · `updatedAt`

### `queueSchema`

`doctorId` · `date` · `currentNumber` · `lastTokenNumber` · `lastUpdatedAt` · `createdAt` · `updatedAt`

### `reportSchema`

`userId` · `fileName` · `fileUrl` · `fileType` · `fileSize` · `cloudinaryPublicId` · `reportType` · `doctorClinicName` · `reportDate` · `uploadedBy` · `tags` · `uploadedAt` · `aiStatus` · `aiSummary.testTable` · `aiSummary.plainSummary` · `aiSummary.extractedHealthData` · `aiSummary.generatedAt` · `aiError` · `createdAt` · `updatedAt`

### `patientHealthSumSchema`

**`aiExtracted`**
`bloodGroup` · `detectedAllergies` · `currentMedications` · `personalizedInsights` · `lastUpdated`

`labValues`: `hemoglobin` · `wbc` · `platelets` · `bloodSugar` · `creatinine` · `urea` · `sodium` · `potassium` · `sgpt` · `sgot` · `bilirubin` · `cholesterol`

`specialFlags`: `anemia` · `infection` · `kidneyIssue` · `liverIssue` · `diabetesRisk`

`trends`: `hemoglobin` · `wbc` · `sugar`

**`userProvided`**
`conditions`: `diabetes` · `hypertension` · `thyroid`

`pastEvents`: `surgeries` · `injuries` · `majorIllness`

`medications` · `allergies` · `currentSymptoms` · `completedAt`

`familyHistory`: `diabetes` · `heartDisease` · `cancer` · `geneticConditions`

`lifestyle`: `smoking` · `alcohol`

**`quickSummary`**
`criticalAlerts` · `shortSummary` · `lastGenerated`

---

## ⚙️ Services · Jobs · Utils

### `services/geminiService.js`

| Function             | Description                                                                       |
| -------------------- | --------------------------------------------------------------------------------- |
| `getGeminiModel`     | Returns Gemini model id from env or default fallback.                             |
| `fetchFileAsBase64`  | Downloads remote report file and converts it to base64 with content type.         |
| `resolveMimeType`    | Resolves effective MIME type using response header or file extension fallback.    |
| `parseGeminiJSON`    | Cleans Gemini response text and parses strict JSON output.                        |
| `analyzeReport`      | Sends one uploaded report to Gemini, returns structured extracted summary.        |
| `buildHealthProfile` | Sends multiple report summaries to Gemini, returns consolidated profile insights. |

### `jobs/processReport.js`

| Function                    | Description                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `processReportInBackground` | Updates report AI state, runs Gemini analysis, stores `aiSummary`, triggers profile refresh. |

### `jobs/updateHealthProfile.js`

| Function                    | Description                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `updateHealthProfileAI`     | Aggregates completed report summaries, calls Gemini, upserts `aiExtracted` profile data. |
| `updateHealthProfileManual` | Upserts user-provided health form data into profile with a completion timestamp.         |

### `utils/calculateETA.js`

| Function       | Description                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------- |
| `calculateETA` | Computes remaining queue count and estimated wait from token difference and avg consult time. |

---

## 🛡️ Middleware

| File                | Description                                                                    |
| ------------------- | ------------------------------------------------------------------------------ |
| `authmiddleware.js` | Verifies JWT from `Authorization` header; attaches decoded user to `req.user`. |
| `adminOnly.js`      | Blocks non-admin requests; protects privileged routes like doctor signup.      |
| `roleMiddleware.js` | Checks `req.user.role` against allowed roles; returns 403 if access is denied. |

---

## 📖 Full Documentation

Open `docs/backend.html` in your browser for the interactive color-coded documentation.

---

_DelhiMed Backend · Aashay Gupta · ClinicFlow — 2026_
