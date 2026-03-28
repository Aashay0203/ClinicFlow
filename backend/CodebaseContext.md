# CODEBASE_CONTEXT.md

# DelhiMed — AI Codebase Context

# This file exists so any AI assistant (Claude, Copilot, Cursor, GPT-4, Gemini)

# can understand this project instantly without reading every file.

# Keep this file updated whenever you add routes, schemas, or major logic.

---

## PROJECT IDENTITY

- **Name:** DelhiMed (part of ClinicFlow startup)
- **Type:** Healthcare backend REST API
- **Stage:** MVP
- **Owner:** Aashay Gupta
- **Stack:** Node.js · Express.js · MongoDB (Mongoose) · Gemini AI · Razorpay · Cloudinary · JWT · Twilio

---

## WHAT THIS PROJECT DOES

DelhiMed is a healthcare platform backend with 3 core modules:

1. **Appointments** — Patients book slots with doctors. Payments via Razorpay (UPI, card, cash). Each confirmed appointment gets a token number and a PIN for physical arrival verification.

2. **Medical Reports** — Patients upload lab reports (images/PDFs). They go to Cloudinary for storage. A background job sends them to Gemini AI which extracts blood values, allergies, medications, and health flags into structured JSON.

3. **Health Profile** — An aggregated patient profile auto-built from all AI-analyzed reports. Also accepts manual user input (conditions, family history, lifestyle). Doctors can view this before consultation.

Additional modules: medication tracker with daily reset, live queue management for doctor clinics.

---

## ARCHITECTURE OVERVIEW

```
Request → Express Router → Middleware (JWT / Role) → Controller → Model (MongoDB)
                                                            ↓
                                                    Background Job (Gemini AI)
                                                            ↓
                                                    Update Health Profile
```

- **No service layer for business logic** — controllers directly call Mongoose models.
- **geminiService.js** is the only service; it wraps all Gemini API calls.
- **Jobs are NOT queued** (no Bull/BullMQ). They are fire-and-forget async functions called from controllers after sending HTTP response.
- **Authentication:** JWT stored client-side. `authmiddleware.js` decodes it and sets `req.user`.
- **File uploads:** Handled by Cloudinary. Multer (or similar) processes multipart form data before the controller.

---

## DIRECTORY MAP

```
backend/
├── server.js                    # App entry. Connects MongoDB, mounts all routers.
├── controllers/                 # All business logic lives here
├── routes/                      # Only routing + middleware chaining, no logic
├── models/                      # Mongoose schemas + model exports
├── middleware/                  # JWT auth, role checks, admin guard
├── services/geminiService.js    # All Gemini API interaction
├── jobs/                        # Async background tasks (AI processing)
└── utils/calculateETA.js        # Queue ETA math
```

---

## ROUTE → CONTROLLER MAPPING

### Auth (`/api/auth` ← `authRoutes.js` ← `authControllers.js`)

```
POST /api/auth/signup     → signup()        — hash password, create User, return JWT
POST /api/auth/login      → login()         — find User or Doctor, compare hash, return JWT
```

### Appointments (`/api/appointment` ← `appointment.js` ← `appointmentController.js`)

```
GET  /api/appointment/my-appointments    → testProtected()     — dev/test endpoint
GET  /api/appointment/booked-slots       → getBookedSlots()    — query Appointment by doctorId+date
POST /api/appointment/book               → bookAppointment()   — validate slot → create Razorpay order
GET  /api/appointment/my-appointements   → getMyAppointments() — populate doctorId on Appointment
GET  /api/appointment/:id/status         → getStatus()         — calls calculateETA(), returns queue info
PUT  /api/appointment/:id/arrive         → arriveAppointment() — bcrypt compare PIN → set status=arrived
```

### Doctor (`/api/doctor` ← `doctorRoutes.js` ← `doctorController.js`)

```
POST /api/doctor/signup       → doctorSignup()   — adminOnly middleware, create Doctor, return JWT
GET  /api/doctor/allDoctors   → getAllDoctors()  — find all, select public fields
GET  /api/doctor/:id          → getDoctorById()  — findById Doctor
```

### Health Profile (`/api/healthProfile` ← `healthProfileRoute.js` ← `healthProfileController.js`)

```
GET    /api/healthProfile/           → getProfile()        — findOne by userId
PUT    /api/healthProfile/user-data  → saveUserData()       — calls updateHealthProfileManual() job
DELETE /api/healthProfile/           → deleteProfile()      — deleteOne by userId
GET    /api/healthProfile/ai-only    → getAiSection()       — return only aiExtracted field
GET    /api/healthProfile/user-only  → getUserSection()     — return only userProvided field
```

### Medication (`/api/medication` ← `medicationRoute.js` ← `medicationController.js`)

```
GET   /api/medication/              → getMedications()   — find all by userId
POST  /api/medication/              → addMedication()    — create new Medication doc
PATCH /api/medication/reset-daily   → resetDaily()       — updateMany taken=false for userId
PATCH /api/medication/:id           → updateTaken()      — findByIdAndUpdate taken field
```

### Payment (`/api/payment` ← `paymentRoute.js` ← `paymentController.js`)

```
POST /api/payment/verify       → verifyPayment()    — validate Razorpay HMAC signature → finalize appointment
POST /api/payment/upi-confirm  → upiConfirm()       — confirm UPI → assign token, generate PIN, set paymentStatus=paid
POST /api/payment/cash-confirm → cashConfirm()      — skip payment → assign token, generate PIN, set paymentStatus=cash
```

### Queue (`/api/queue` ← `queueRoute.js` ← `queueController.js`)

```
PUT /api/queue/next   → nextInQueue()   — increment Queue.currentNumber, mark previous Appointment as served
```

### Report (`/api/report` ← `reportRoute.js` ← `reportController.js`)

```
POST  /api/report/upload                   → uploadReport()         — upload to Cloudinary, save Report doc, fire processReportInBackground()
GET   /api/report/                         → getReports()           — find all by userId
GET   /api/report/:id/ai-status            → getAiStatus()          — return aiStatus + aiSummary + aiError
POST  /api/report/:id/regenerate-summary   → regenerateSummary()    — reset aiStatus=pending, re-fire processReportInBackground()
GET   /api/report/:id                      → getReport()            — findById, verify ownership
PATCH /api/report/:id                      → updateReport()         — update metadata fields
DELETE /api/report/:id                     → deleteReport()         — Cloudinary delete + deleteOne from DB
```

### User (`/api/user` ← `userRoute.js` ← `userController.js`)

```
GET   /api/user/profile          → getProfile()        — findById, exclude password
PATCH /api/user/profile          → updateProfile()     — findByIdAndUpdate allowed fields
POST  /api/user/profile/picture  → uploadPicture()     — Cloudinary upload → update profilePicture field
```

---

## MONGODB SCHEMAS

### User

```js
{
  (name,
    phone,
    email,
    password(hashed),
    role("user" | "doctor" | "admin"),
    abhaId,
    profilePicture,
    createdAt,
    updatedAt);
}
```

### Doctor

```js
{
  (name,
    phone,
    email,
    password(hashed),
    speciality,
    startTime,
    avgConsultTime(minutes),
    fees);
}
```

### Appointment

```js
{
  patientId(ref:User), doctorId(ref:Doctor), date, slotTime,
  appointmentNumber(token), pinHash(bcrypt),
  status('pending'|'arrived'|'served'|'cancelled'),
  paymentStatus('pending'|'paid'|'cash'),
  createdAt, updatedAt
}
```

### Medication

```js
{ userId(ref:User), name, dosage, time, taken(bool, default:false), createdAt, updatedAt }
```

### Queue

```js
{ doctorId(ref:Doctor), date, currentNumber, lastTokenNumber, lastUpdatedAt, createdAt, updatedAt }
```

### Report

```js
{
  userId(ref:User), fileName, fileUrl, fileType, fileSize,
  cloudinaryPublicId, reportType, doctorClinicName, reportDate,
  uploadedBy, tags([]),
  aiStatus('pending'|'processing'|'done'|'failed'),
  aiSummary: { testTable, plainSummary, extractedHealthData, generatedAt },
  aiError,
  createdAt, updatedAt
}
```

### PatientHealthSummary

```js
{
  userId(ref:User),
  aiExtracted: {
    bloodGroup, detectedAllergies([]), currentMedications([]),
    labValues: { hemoglobin, wbc, platelets, bloodSugar, creatinine, urea,
                 sodium, potassium, sgpt, sgot, bilirubin, cholesterol },
    specialFlags: { anemia, infection, kidneyIssue, liverIssue, diabetesRisk },
    personalizedInsights([]), trends: { hemoglobin, wbc, sugar },
    lastUpdated
  },
  userProvided: {
    conditions: { diabetes, hypertension, thyroid },
    pastEvents: { surgeries([]), injuries([]), majorIllness([]) },
    medications([]), allergies([]), currentSymptoms([]),
    familyHistory: { diabetes, heartDisease, cancer, geneticConditions([]) },
    lifestyle: { smoking, alcohol },
    completedAt
  },
  quickSummary: { criticalAlerts([]), shortSummary, lastGenerated },
  createdAt, updatedAt
}
```

---

## MIDDLEWARE

| File                | Applied to                 | What it does                                                                        |
| ------------------- | -------------------------- | ----------------------------------------------------------------------------------- |
| `authmiddleware.js` | All protected routes       | Reads `Authorization: Bearer <token>`, verifies JWT, sets `req.user = { id, role }` |
| `adminOnly.js`      | `POST /api/doctor/signup`  | Checks `req.user.role === 'admin'`, returns 403 otherwise                           |
| `roleMiddleware.js` | Queue routes (doctor-only) | Generic role checker — `allowRoles('doctor')` pattern                               |

---

## SERVICES

### `geminiService.js`

| Function                          | Purpose                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `getGeminiModel()`                | Returns model string from `process.env.GEMINI_MODEL` or fallback             |
| `fetchFileAsBase64(url)`          | Downloads file from Cloudinary URL, converts to base64                       |
| `resolveMimeType(response, url)`  | Gets MIME type from headers or extension                                     |
| `parseGeminiJSON(text)`           | Strips markdown fences, parses JSON from Gemini response                     |
| `analyzeReport(report)`           | Sends single report to Gemini → returns structured `aiSummary` JSON          |
| `buildHealthProfile(summaries[])` | Sends all report summaries → returns consolidated `aiExtracted` profile JSON |

**Gemini prompt contract — `analyzeReport` expects back:**

```json
{
  "testTable": [],
  "plainSummary": "string",
  "extractedHealthData": { "labValues": {}, "flags": {}, "medications": [] }
}
```

**Gemini prompt contract — `buildHealthProfile` expects back:**

```json
{
  "bloodGroup": "",
  "detectedAllergies": [],
  "labValues": {},
  "specialFlags": {},
  "personalizedInsights": [],
  "trends": {},
  "quickSummary": { "criticalAlerts": [], "shortSummary": "" }
}
```

---

## BACKGROUND JOBS

### `processReport.js` → `processReportInBackground(reportId, userId)`

1. Set `report.aiStatus = 'processing'`
2. Call `analyzeReport(report)` from geminiService
3. Save result to `report.aiSummary`, set `aiStatus = 'done'`
4. On error: set `aiStatus = 'failed'`, save error to `report.aiError`
5. Trigger `updateHealthProfileAI(userId)`

### `updateHealthProfile.js`

- **`updateHealthProfileAI(userId)`** — Fetch all `done` reports for user → call `buildHealthProfile()` → upsert `PatientHealthSummary.aiExtracted`
- **`updateHealthProfileManual(userId, data)`** — Upsert `PatientHealthSummary.userProvided` with form data + set `completedAt`

---

## UTILS

### `calculateETA(currentToken, patientToken, avgConsultTime)`

```
remainingPatients = patientToken - currentToken
estimatedWait     = remainingPatients × avgConsultTime (minutes)
returns: { remainingPatients, estimatedWaitMinutes }
```

---

## KEY PATTERNS & CONVENTIONS

1. **Token + PIN system** — On payment confirmation, `appointmentNumber` (queue token) is assigned from `Queue.lastTokenNumber + 1`. A random PIN is generated, bcrypt-hashed, stored as `pinHash`. Raw PIN is sent to patient via SMS (Twilio). On arrival, patient enters PIN → bcrypt compare.

2. **Fire-and-forget jobs** — Controllers call background jobs without `await` after sending `res.json()`. This means AI processing never blocks HTTP response.

3. **Razorpay flow:**
   - `POST /book` → creates Razorpay order, returns `orderId` to frontend
   - Frontend completes payment, sends `razorpay_payment_id + razorpay_order_id + razorpay_signature`
   - `POST /payment/verify` → HMAC-SHA256 verify → finalize appointment

4. **No soft delete** — Reports and profiles are hard deleted. Cloudinary asset is deleted before DB record.

5. **Date handling** — Appointments use `date` (string or Date) + `slotTime` (string like "10:30"). No timezone normalization currently.

6. **Role values:** `'user'` | `'doctor'` | `'admin'` — stored in User schema, also present in JWT payload.

7. **Error responses** follow pattern: `res.status(4xx).json({ message: "..." })`

---

## KNOWN ISSUES / GOTCHAS

- `appointment.js` has a typo: route is `/my-appointements` (double 'e') — don't fix without updating frontend too.
- `docterSchema.js` has a typo in filename (`docter` not `doctor`) — model is still exported correctly.
- Jobs have no retry logic — if Gemini fails, user must manually hit `/regenerate-summary`.
- No request validation library (Joi/Zod) — validation is manual inside controllers.
- Queue and Appointment are separate collections — they are kept in sync manually in controllers, not via transactions.

---

## ENVIRONMENT VARIABLES REFERENCE

```
MONGO_URI               MongoDB connection string
JWT_SECRET              Secret for signing/verifying JWTs
RAZORPAY_KEY_ID         Razorpay public key
RAZORPAY_KEY_SECRET     Razorpay secret (used for HMAC verify)
CLOUDINARY_CLOUD_NAME   Cloudinary account name
CLOUDINARY_API_KEY      Cloudinary API key
CLOUDINARY_API_SECRET   Cloudinary API secret
GEMINI_API_KEY          Google Gemini API key
GEMINI_MODEL            Model string (optional, default: gemini-1.5-flash)
TWILIO_ACCOUNT_SID      Twilio account SID
TWILIO_AUTH_TOKEN       Twilio auth token
TWILIO_PHONE            Twilio sender phone number
PORT                    Server port (default: 5000)
```

---

## WHAT DOES NOT EXIST YET (Planned)

- [ ] Prescription manager (GPT-4o Vision + Twilio reminders) — not yet built
- [ ] React Native mobile app
- [ ] Webhook handler for Razorpay `payment.captured` event (production payment flow)
- [ ] Request validation (Joi or Zod)
- [ ] Job queue (Bull/BullMQ) for reliable background processing
- [ ] Doctor-side appointment management endpoints
- [ ] Notification system for appointment reminders

---

_Last updated: 2026 · DelhiMed Backend · Aashay Gupta_
