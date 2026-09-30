from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client
from datetime import datetime, timezone
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

# Two separate clients to prevent sign_in_with_password() from
# mutating the database client's auth context.
db = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)          # Database operations only
auth_client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)  # All Auth operations

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests during local development


# ── Token Verification Helper ─────────────────────────────
def _verify_token():
    """Verify the Authorization header and return the authenticated user's UUID.
    Returns (user_id, None) on success or (None, error_tuple) on failure."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, (jsonify({"error": "Missing authorization token."}), 401)
    token = auth_header[7:]
    try:
        user = auth_client.auth.get_user(token)
        return user.user.id, None
    except Exception:
        return None, (jsonify({"error": "Invalid or expired token."}), 401)


# ── Health Check ──────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    """Confirms the Python backend is running."""
    return jsonify({"status": "ok"})


# ── Login (Supabase Auth) ─────────────────────────────────
@app.route("/api/login", methods=["POST"])
def login():
    """
    Authenticates a user via Supabase Auth.
    Expects JSON body: { "email": "...", "password": "..." }
    Returns: { "accessToken": "<jwt>" }
    """
    data = request.get_json(silent=True)

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required."}), 400

    try:
        result = auth_client.auth.sign_in_with_password({
            "email": data["email"],
            "password": data["password"]
        })
        return jsonify({
            "accessToken": result.session.access_token
        })
    except Exception as e:
        error_msg = str(e).lower()
        if "invalid" in error_msg or "credentials" in error_msg or "not found" in error_msg:
            return jsonify({"error": "Invalid email or password."}), 401
        print(f"[Auth error on login] {e}")
        return jsonify({"error": "Login failed. Please try again."}), 500


# ── Get User Profile ──────────────────────────────────────
@app.route("/api/profile", methods=["GET"])
def get_profile():
    """
    Retrieves the authenticated user's saved profile.
    Requires: Authorization: Bearer <access_token>
    Returns: { "profile": { ... } } or { "profile": null }
    """
    user_id, error = _verify_token()
    if error:
        return error

    try:
        result = (
            db.table("user_profiles")
            .select("full_name, phone_number, employment_type, hours_per_week, pay_basis, approximate_rate")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if result.data:
            return jsonify({"profile": result.data})
        return jsonify({"profile": None})
    except Exception as e:
        print(f"[Supabase error on get_profile] {e}")
        return jsonify({"profile": None, "error": "Failed to retrieve profile."}), 500


# ── Save/Update User Profile ──────────────────────────────
@app.route("/api/profile", methods=["POST"])
def save_profile():
    """
    Saves or updates the authenticated user's profile (upsert).
    Requires: Authorization: Bearer <access_token>
    Expects JSON body with all six mandatory profile fields.
    Returns: { "success": true }
    """
    user_id, error = _verify_token()
    if error:
        return error

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "No profile data provided."}), 400

    # Validate all six mandatory fields
    required_fields = ["fullName", "phoneNumber", "employmentType", "hoursPerWeek", "payBasis", "approximateRate"]
    for field in required_fields:
        value = data.get(field)
        if not value or (isinstance(value, str) and not value.strip()):
            return jsonify({"success": False, "error": "All profile fields are required."}), 400

    try:
        record = {
            "user_id": user_id,
            "full_name": data["fullName"].strip(),
            "phone_number": data["phoneNumber"].strip(),
            "employment_type": data["employmentType"],
            "hours_per_week": data["hoursPerWeek"],
            "pay_basis": data["payBasis"],
            "approximate_rate": data["approximateRate"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        db.table("user_profiles").upsert(record, on_conflict="user_id").execute()
        return jsonify({"success": True}), 201
    except Exception as e:
        print(f"[Supabase error on save_profile] {e}")
        return jsonify({"success": False, "error": "Failed to save profile."}), 500


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
    # Verify the authenticated user
    user_id, error = _verify_token()
    if error:
        return error

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
        "user_id": user_id,
        "concern": data["concern"],
        "work_profile": data["workProfile"],
        "situation_details": data["situationDetails"]
    }

    # Insert into Supabase
    try:
        result = db.table("submissions").insert(record).execute()
        new_id = result.data[0]["id"]

        # Count total rows to demonstrate persistence
        count_result = db.table("submissions").select("id", count="exact").execute()
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
            db.table("submissions")
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
