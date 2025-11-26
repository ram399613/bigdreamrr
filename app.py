from flask import (
    Flask, render_template, request, redirect,
    session, url_for, send_file, jsonify
)
import sqlite3, secrets, smtplib
from email.message import EmailMessage
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "bigdream_secret_key"

DB_NAME = "database.db"
ADMIN_EMAIL = "bigdreamadmin@gmail.com"  # change if you want

# ===== EMAIL CONFIG (change to your real details) =====
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "yourgmail@gmail.com"
SMTP_PASS = "your_app_password"  # Gmail App Password, not normal password


def get_db():
    return sqlite3.connect(DB_NAME)


# ===== DB SETUP =====
with get_db() as con:
    cur = con.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            username TEXT UNIQUE,
            password TEXT,
            is_verified INTEGER DEFAULT 0,
            is_admin INTEGER DEFAULT 0,
            verify_token TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS messages(
            id INTEGER PRIMARY KEY,
            name TEXT,
            email TEXT,
            message TEXT
        )
    """)
    con.commit()


# ===== HELPERS =====
def send_verification_email(email, token):
    verify_link = f"http://127.0.0.1:5000/verify/{token}"

    msg = EmailMessage()
    msg["Subject"] = "Verify your BIG DREAM account"
    msg["From"] = SMTP_USER
    msg["To"] = email
    msg.set_content(
        f"Welcome to BIG DREAM!\n\nClick this link to verify your email:\n{verify_link}\n\nDream Big, Act Now."
    )

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(SMTP_USER, SMTP_PASS)
            smtp.send_message(msg)
    except Exception as e:
        print("Email send error:", e)


def login_required(func):
    from functools import wraps

    @wraps(func)
    def wrapper(*args, **kwargs):
        if "user" not in session:
            return redirect(url_for("login"))
        return func(*args, **kwargs)
    return wrapper


def admin_required(func):
    from functools import wraps

    @wraps(func)
    def wrapper(*args, **kwargs):
        if not session.get("is_admin"):
            return "Admin access only", 403
        return func(*args, **kwargs)
    return wrapper


# ===== ROUTES: PAGES =====
@app.route("/")
def home():
    return render_template("index.html")   # :contentReference[oaicite:0]{index=0}


@app.route("/aims")
def aims():
    return render_template("aims.html")    # :contentReference[oaicite:1]{index=1}


@app.route("/goals", methods=["GET", "POST"])
@login_required
def goals():
    if request.method == "POST":
        # Get form fields from goals.html
        name = request.form.get("name")
        big_dream = request.form.get("big_dream")
        first_step = request.form.get("first_step")
        why = request.form.get("why")
        obstacles = request.form.get("obstacles")
        resources = request.form.get("resources")
        deadline = request.form.get("deadline")
        frequency = request.form.get("frequency")

        # Create PDF in memory
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        pdf.setTitle("Big Dream Goal Plan")

        y = 750
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(50, y, "BIG DREAM - Goal Planner")
        y -= 40

        pdf.setFont("Helvetica", 11)
        lines = [
            f"Name: {name}",
            f"Big Dream: {big_dream}",
            f"First Step: {first_step}",
            f"Why Important: {why}",
            f"Obstacles: {obstacles}",
            f"Resources Needed: {resources}",
            f"Target Deadline: {deadline}",
            f"Progress Check: {frequency}",
        ]

        for line in lines:
            for sub in [line[i:i+95] for i in range(0, len(line), 95)]:
                pdf.drawString(50, y, sub)
                y -= 18
                if y < 80:
                    pdf.showPage()
                    y = 750

        pdf.showPage()
        pdf.save()
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name="goal_plan.pdf",
            mimetype="application/pdf"
        )

    return render_template("goals.html")   # :contentReference[oaicite:2]{index=2}


@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        msg = request.form["message"]
        with get_db() as con:
            con.execute(
                "INSERT INTO messages(name,email,message) VALUES(?,?,?)",
                (name, email, msg)
            )
            con.commit()
        return "Message Sent! Thank you ❤️"
    return render_template("contact.html")  # :contentReference[oaicite:3]{index=3}


# ===== AUTH =====
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        username = request.form["username"]
        password = request.form["password"]

        hashed = generate_password_hash(password)

        token = secrets.token_urlsafe(16)
        is_admin = 1 if email == ADMIN_EMAIL else 0

        with get_db() as con:
            cur = con.cursor()
            cur.execute("""
                INSERT INTO users(name,email,username,password,is_verified,is_admin,verify_token)
                VALUES(?,?,?,?,0,?,?)
            """, (nam
