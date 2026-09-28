from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timezone
import uuid
import os

# ----------------------------------------------------------
# ShiftShield Python Backend
# ----------------------------------------------------------
# This file serves as both:
#   1. A local development server  (python api/index.py)
#   2. A Vercel serverless function (api/index.py is auto-detected)
#
# In-memory storage is used for Phase 1 testing.
# Supabase will replace it in Phase 2.
# ----------------------------------------------------------

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests during local development

# Temporary in-memory storage (Phase 1 only)
submissions_store = []


# ── Health Check ──────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    """Confirms the Python backend is running."""
    return jsonify({"status": "ok"})


# ── Save Submission ───────────────────────────────────────
@app.route("/api/submit", methods=["POST"])
def submit():
    """
    Accepts a complete user submission and stores it.
    Expects JSON body:
      {
        "workProfile": { ... },
        "concern": "unpaid-work",
        "situationDetails": { ... }
      }
    Returns:
      { "success": true, "id": "<uuid>" }
    """
    data = request.get_json(silent=True)

    # Basic validation
    if not data:
        return jsonify({"success": False, "error": "No JSON body provided."}), 400

    if not data.get("concern"):
        return jsonify({"success": False, "error": "Missing required field: concern."}), 400

    if not data.get("workProfile") or not isinstance(data["workProfile"], dict):
        return jsonify({"success": False, "error": "Missing or invalid field: workProfile."}), 400

    if not data.get("situationDetails") or not isinstance(data["situationDetails"], dict):
        return jsonify({"success": False, "error": "Missing or invalid field: situationDetails."}), 400

    # Create submission record
    submission_id = str(uuid.uuid4())
    record = {
        "id": submission_id,
        "concern": data["concern"],
        "work_profile": data["workProfile"],
        "situation_details": data["situationDetails"],
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }

    # Store in memory (will be replaced by Supabase insert in Phase 2)
    submissions_store.append(record)

    return jsonify({"success": True, "id": submission_id}), 201


# ── Retrieve Submissions ──────────────────────────────────
@app.route("/api/submissions", methods=["GET"])
def get_submissions():
    """
    Returns the most recent submissions (newest first, max 20).
    Will be replaced by a Supabase query in Phase 2.
    """
    # Return newest first, limit to 20
    recent = list(reversed(submissions_store[-20:]))
    return jsonify({"submissions": recent})


# ── Local development entry point ─────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"ShiftShield API running on http://localhost:{port}")
    app.run(debug=True, port=port)
