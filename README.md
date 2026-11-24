# MINDTRACK — Landing Page

A fast, responsive, dark-themed static single-page landing website for **MINDTRACK**, an offline-first Android productivity application bringing tasks, Pomodoro focus sessions, daily planning, and productivity insights together.

Built strictly with **HTML5**, **CSS3**, and **Vanilla JavaScript** — no frameworks, no build step, and no backend required.

---

## Project Structure

```text
.
├── index.html                   # Complete semantic single-page landing site
├── css/
│   └── style.css                # Dark-theme design system, feature slider & feedback form styles
├── js/
│   └── script.js                # APK URL config, feature slider, feedback form & interactions
├── assets/
│   └── icon.png                 # MINDTRACK app icon & favicon
├── google-apps-script/
│   └── Code.gs                  # Google Apps Script Web App receiver for Google Sheets feedback
├── README.md                    # Documentation, Google Sheets setup & deployment guide
└── .gitignore
```

> **Note on visuals:** The hero dashboard and feature slider previews use CSS-based illustrative mockups rather than fabricated screenshots.

---

## How to Run Locally

Because this is a pure static website, you can run it immediately:

### Option 1 — Open directly
Double-click `index.html` to open it in your browser.

### Option 2 — Local static server (recommended)
```bash
# Using Python 3
python -m http.server 8080

# Or using Node.js
npx serve .
```
Then visit `http://localhost:8080`.

---

## Android APK Download Configuration

Every download CTA button reads from `APK_DOWNLOAD_URL` at the top of `js/script.js`:

```javascript
const APK_DOWNLOAD_URL =
  "https://github.com/ayush-yadav-4/MindTrack/releases/download/v1/application-0e5f962b-5fa2-4f74-99e3-ec6492785e02.apk";
```

To release a newer APK version later, replace that URL with the new direct `.apk` link (never an Expo build-details page URL).

---

## Google Sheets Feedback Integration

The **Help Us Make MINDTRACK Better** form sends feedback directly to a Google Sheet using a Google Apps Script Web App — with zero backend server or exposed spreadsheet IDs in the frontend.

### 1. Create and configure the Google Sheet
1. Go to [Google Sheets](https://sheets.google.com/) and create a new spreadsheet (e.g., `MINDTRACK Feedback`).
2. Copy the **Spreadsheet ID** from the browser URL:
   ```text
   https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
   ```
   *(The script automatically creates a `Feedback` tab and the header row `Timestamp | Name | Email | Feedback Type | Rating | Message` on the first submission.)*

### 2. Create and deploy the Google Apps Script Web App
1. Open [Google Apps Script](https://script.google.com/) and click **New project** (or in your Google Sheet click **Extensions → Apps Script**).
2. Replace the default code in `Code.gs` with the full contents of [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. Replace `"PASTE_YOUR_GOOGLE_SPREADSHEET_ID_HERE"` with your actual Spreadsheet ID:
   ```javascript
   const SPREADSHEET_ID = "your-actual-spreadsheet-id";
   ```
4. Save the project (`Ctrl+S`).
5. Click **Deploy → New deployment**.
6. Click the gear icon next to **Select type** and choose **Web app**.
7. Configure:
   - **Description:** `MINDTRACK Feedback Receiver v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
8. Click **Deploy**, review permissions, and authorize access to your Google Sheet.
9. Copy the generated **Web app URL** (it ends with `/exec`).

### 3. Paste the Web App URL into the website
Open `js/script.js` and replace the placeholder in `GOOGLE_SHEETS_WEB_APP_URL`:

```javascript
const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

> **Important:** Never put your Spreadsheet ID or credentials in `js/script.js`. Only the public Web App URL goes in the frontend.

### 4. Test a feedback submission
1. Reload the landing page in your browser.
2. Scroll to **Help Us Make MINDTRACK Better**.
3. Select a **Feedback type**, enter a **Feedback message** (optionally add Name, Email, and a 1–5 star Rating), and click **Submit Feedback**.
4. Open your Google Sheet and confirm a new row was appended under the `Feedback` tab with `Timestamp`, `Name`, `Email`, `Feedback Type`, `Rating`, and `Message`.

> **Known CORS / `no-cors` limitation:** Because Google Apps Script Web Apps redirect POST responses across Google domains, the static frontend submits a simple `application/x-www-form-urlencoded` POST request using `mode: "no-cors"` to avoid CORS preflight failures. In `no-cors` mode, the browser receives an opaque response and cannot read the HTTP status or JSON body. The UI therefore displays an honest confirmation that the request was sent rather than falsely claiming server-verified storage. Always verify the first test submission directly inside your Google Sheet.

### 5. Redeploy the website after configuration
After updating `GOOGLE_SHEETS_WEB_APP_URL` in `js/script.js`:
- **GitHub Pages:** Commit and push your updated `js/script.js` to your repository branch (`main`). GitHub Pages will rebuild and publish automatically.
- **Vercel:** Commit and push to your connected Git repository (or run `vercel --prod`) to publish the updated static files.

---

## How to Deploy

### GitHub Pages
1. Push this project to a GitHub repository.
2. Go to **Settings → Pages → Build and deployment**.
3. Select **Deploy from a branch**, choose `main` and `/ (root)`, then click **Save**.

### Vercel
1. Import the repository in [Vercel](https://vercel.com/).
2. Leave **Framework Preset** as **Other** and build command empty.
3. Click **Deploy**.

---

## Creator

Made by Ayush.
