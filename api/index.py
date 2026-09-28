from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client
import os

# ----------------------------------------------------------
# ShiftShield Python Backend
# ----------------------------------------------------------
# This file serves as both:
#   1. A local development server  (python api/index.py)
#   2. A Vercel serverless function (api/index.py is auto-detected)
#
# Data is stored in Supabase via the server-side secret key.
# The secret key bypasses RLS and is never exposed to the browser.
# ----------------------------------------------------------

# Read credentials from environment (loaded from .env locally, Vercel dashboard in production)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY")

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_SECRET_KEY. "
        "Set them in your .env file (local) or Vercel environment variables (production)."
    )

supabase = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests during local development


# ── Health Check ──────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    """Confirms the Python backend is running."""
    return jsonify({"status": "ok"})


# ── Save Submission ───────────────────────────────────────
@app.route("/api/submit", methods=["POST"])
def submit():
    """
    Accepts a complete user submission and stores it in Supabase.
    Expects JSON body:
      {
        "workProfile": { ... },
        "concern": "unpaid-work",
        "situationDetails": { ... }
      }
    Returns:
      { "success": true, "id": "<uuid>", "total_count": N }
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

    # Map camelCase frontend keys to snake_case database columns
    record = {
        "concern": data["concern"],
        "work_profile": data["workProfile"],
        "situation_details": data["situationDetails"]
    }

    # Insert into Supabase
    try:
        result = supabase.table("submissions").insert(record).execute()
        new_id = result.data[0]["id"]

        # Count total rows to demonstrate persistence
        count_result = supabase.table("submissions").select("id", count="exact").execute()
        total = count_result.count

        return jsonify({"success": True, "id": new_id, "total_count": total}), 201

    except Exception as e:
        print(f"[Supabase error on submit] {e}")
        return jsonify({
            "success": False,
            "error": "Failed to save submission. Please try again."
        }), 500


# ── Retrieve Submissions (local development only) ─────────
@app.route("/api/submissions", methods=["GET"])
def get_submissions():
    """
    Returns the most recent submissions (newest first, max 20).
    Only available when ALLOW_SUBMISSIONS_LIST=true is set in the environment.
    Returns 403 in production to prevent public exposure of stored data.
    """
    if os.environ.get("ALLOW_SUBMISSIONS_LIST") != "true":
        return jsonify({"error": "This endpoint is not available."}), 403

    try:
        result = (
            supabase.table("submissions")
            .select("*")
            .order("submitted_at", desc=True)
            .limit(20)
            .execute()
        )
        return jsonify({"submissions": result.data})

    except Exception as e:
        print(f"[Supabase error on retrieve] {e}")
        return jsonify({
            "submissions": [],
            "error": "Failed to retrieve submissions."
        }), 500


# ── Local development entry point ─────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"ShiftShield API running on http://localhost:{port}")
    app.run(debug=True, port=port)
