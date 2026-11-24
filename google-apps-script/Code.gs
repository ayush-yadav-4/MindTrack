/**
 * MINDTRACK Landing Page — Feedback Form Receiver (Google Apps Script)
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet and copy its Spreadsheet ID from the URL:
 *    https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
 * 2. Paste your Spreadsheet ID into SPREADSHEET_ID below.
 * 3. Deploy this script as a Web App:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL and paste it into GOOGLE_SHEETS_WEB_APP_URL in js/script.js.
 *
 * SECURITY NOTE:
 * Keep SPREADSHEET_ID inside this Apps Script project only.
 * Never place your Spreadsheet ID or credentials in the public frontend code.
 */

// ==================== CONFIGURATION ====================
const SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SPREADSHEET_ID_HERE";
const SHEET_NAME = "Feedback";

const ALLOWED_FEEDBACK_TYPES = [
  "General Feedback",
  "Bug Report",
  "Feature Request",
  "UI/UX Suggestion",
  "Other",
];

const HEADERS = [
  "Timestamp",
  "Name",
  "Email",
  "Feedback Type",
  "Rating",
  "Message",
];

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 2000;

/**
 * Handles POST requests from the MINDTRACK landing page feedback form.
 * Expects application/x-www-form-urlencoded parameters.
 *
 * @param {GoogleAppsScript.Events.DoPost} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    // Honeypot check: bots often fill hidden fields; silently accept without storing
    const honeypot = sanitizeString(params.website, 200);
    if (honeypot.length > 0) {
      return createJsonResponse({
        ok: true,
        message: "Feedback received.",
      });
    }

    // Read and sanitize submitted fields
    const name = sanitizeString(params.name, MAX_NAME_LENGTH);
    const email = sanitizeString(params.email, MAX_EMAIL_LENGTH);
    const feedbackType = sanitizeString(params.feedbackType, 60);
    const rawRating = sanitizeString(params.rating, 10);
    const message = sanitizeString(params.message, MAX_MESSAGE_LENGTH + 1);

    // Server-side validation
    if (!feedbackType || ALLOWED_FEEDBACK_TYPES.indexOf(feedbackType) === -1) {
      return createJsonResponse({
        ok: false,
        error: "Invalid or missing feedback type.",
      });
    }

    if (!message) {
      return createJsonResponse({
        ok: false,
        error: "Feedback message is required.",
      });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return createJsonResponse({
        ok: false,
        error: "Feedback message exceeds the maximum length of " + MAX_MESSAGE_LENGTH + " characters.",
      });
    }

    if (email && !isValidEmail(email)) {
      return createJsonResponse({
        ok: false,
        error: "Invalid email address format.",
      });
    }

    let rating = "";
    if (rawRating !== "") {
      const parsedRating = Number(rawRating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return createJsonResponse({
          ok: false,
          error: "Rating must be an integer between 1 and 5.",
        });
      }
      rating = parsedRating;
    }

    // Verify Spreadsheet ID configuration
    if (!SPREADSHEET_ID || SPREADSHEET_ID === "PASTE_YOUR_GOOGLE_SPREADSHEET_ID_HERE") {
      return createJsonResponse({
        ok: false,
        error: "Spreadsheet ID is not configured in Code.gs.",
      });
    }

    // Open target spreadsheet and sheet (create sheet if missing)
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    // Add fixed header row if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // Append feedback row in exact header order
    const timestamp = new Date().toISOString();
    sheet.appendRow([
      timestamp,
      preventFormulaInjection(name),
      preventFormulaInjection(email),
      feedbackType,
      rating,
      preventFormulaInjection(message),
    ]);

    return createJsonResponse({
      ok: true,
      message: "Feedback saved successfully.",
    });
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: "Unable to process feedback submission.",
    });
  }
}

/**
 * Optional health-check GET handler to confirm the Web App is deployed.
 * Does not expose any spreadsheet IDs or stored records.
 */
function doGet() {
  return createJsonResponse({
    ok: true,
    service: "MINDTRACK Feedback Endpoint",
  });
}

/**
 * Trims a value safely and caps length.
 */
function sanitizeString(value, maxLen) {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  return maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

/**
 * Basic email validation for optional email field.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Prevents spreadsheet formula injection when values start with =, +, -, or @.
 */
function preventFormulaInjection(value) {
  if (!value) return "";
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

/**
 * Returns a JSON ContentService response.
 */
function createJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
