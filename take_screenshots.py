# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
AI Expense Tracker - Full Website Screenshot Script
Takes screenshots of every page and compiles into a PDF
"""

import asyncio
import os
import time
from pathlib import Path
from playwright.async_api import async_playwright
from fpdf import FPDF
from PIL import Image

# ── Config ────────────────────────────────────────────────────────────────────
BASE_URL   = "http://localhost:3000"
API_URL    = "http://localhost:5000"
OUT_DIR    = Path(__file__).parent / "screenshots"
PDF_PATH   = Path(__file__).parent / "Website_Screenshots.pdf"
EMAIL      = "test@test.com"
PASSWORD   = "Test1234!"
VIEWPORT   = {"width": 1440, "height": 900}
# ─────────────────────────────────────────────────────────────────────────────

OUT_DIR.mkdir(exist_ok=True)

async def screenshot(page, name, label):
    path = str(OUT_DIR / f"{name}.png")
    await page.wait_for_load_state("networkidle", timeout=10000)
    await asyncio.sleep(1.5)          # let animations settle
    await page.screenshot(path=path, full_page=True)
    print(f"  [OK]  {label}")
    return path, label

async def main():
    shots = []   # list of (filepath, label)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=400)
        ctx     = await browser.new_context(viewport=VIEWPORT)
        page    = await ctx.new_page()

        # ── 1. Landing Page ────────────────────────────────────────────────
        print("\n[1] Landing Page")
        await page.goto(BASE_URL, wait_until="networkidle")
        shots.append(await screenshot(page, "01_landing_top", "Landing Page - Top Section"))

        # Scroll down to show more sections
        await page.evaluate("window.scrollTo(0, 600)")
        await asyncio.sleep(1)
        shots.append(await screenshot(page, "02_landing_features", "Landing Page - Features Section"))

        await page.evaluate("window.scrollTo(0, 1400)")
        await asyncio.sleep(1)
        shots.append(await screenshot(page, "03_landing_bottom", "Landing Page - Bottom / CTA Section"))

        # ── 2. Login Page ──────────────────────────────────────────────────
        print("\n[2] Login Page")
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        shots.append(await screenshot(page, "04_login", "Login Page"))

        # ── 3. Register / Signup ───────────────────────────────────────────
        print("\n[3] Register Page")
        # Look for signup link on login page
        try:
            signup_link = page.locator("a[href*='signup'], a[href*='register'], button:has-text('Sign up'), a:has-text('Sign up'), a:has-text('Register')")
            if await signup_link.count() > 0:
                await signup_link.first.click()
                await page.wait_for_load_state("networkidle")
                shots.append(await screenshot(page, "05_register", "Register / Sign Up Page"))
            else:
                await page.goto(f"{BASE_URL}/signup", wait_until="networkidle")
                shots.append(await screenshot(page, "05_register", "Register / Sign Up Page"))
        except Exception:
            pass

        # ── 4. Login Flow ──────────────────────────────────────────────────
        print("\n[4] Logging in...")
        await page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        await asyncio.sleep(1)

        # Fill email
        email_sel = "input[type='email'], input[name='email'], input[placeholder*='email' i], input[placeholder*='Email' i]"
        await page.fill(email_sel, EMAIL)

        # Fill password
        pass_sel = "input[type='password'], input[name='password']"
        await page.fill(pass_sel, PASSWORD)

        # Screenshot before submit
        shots.append(await screenshot(page, "06_login_filled", "Login Page - Credentials Filled"))

        # Submit
        submit_sel = "button[type='submit'], button:has-text('Login'), button:has-text('Sign in'), button:has-text('Log in')"
        await page.click(submit_sel)
        await page.wait_for_load_state("networkidle", timeout=15000)
        await asyncio.sleep(2)

        print(f"  Current URL after login: {page.url}")

        # ── 5. Dashboard ───────────────────────────────────────────────────
        print("\n[5] Dashboard")
        shots.append(await screenshot(page, "07_dashboard_top", "Dashboard - Overview (Top)"))

        await page.evaluate("window.scrollTo(0, 500)")
        await asyncio.sleep(1)
        shots.append(await screenshot(page, "08_dashboard_charts", "Dashboard - Charts & Spending"))

        await page.evaluate("window.scrollTo(0, 1100)")
        await asyncio.sleep(1)
        shots.append(await screenshot(page, "09_dashboard_bottom", "Dashboard - Recent Transactions"))

        # ── 6. Navigate through sidebar/nav links ──────────────────────────
        nav_pages = [
            ("transactions", "10_transactions",  "Transactions Page"),
            ("budgets",      "11_budgets",       "Budgets Page"),
            ("savings",      "12_savings",       "Savings Goals Page"),
            ("emergency",    "13_emergency",     "Emergency Fund Page"),
            ("subscriptions","14_subscriptions", "Subscriptions Page"),
            ("income",       "15_income",        "Income Sources Page"),
            ("analytics",    "16_analytics",     "Analytics Page"),
            ("insights",     "17_insights",      "AI Insights Page"),
        ]

        for route, fname, label in nav_pages:
            print(f"\n[Nav] {label}")
            # Try clicking nav link first, fallback to direct URL
            try:
                nav_link = page.locator(
                    f"a[href*='{route}'], nav a:has-text('{route.capitalize()}'), "
                    f"[data-route='{route}'], aside a:has-text('{route.capitalize()}')"
                )
                if await nav_link.count() > 0:
                    await nav_link.first.click()
                    await page.wait_for_load_state("networkidle", timeout=8000)
                else:
                    await page.goto(f"{BASE_URL}/{route}", wait_until="networkidle")
            except Exception:
                await page.goto(f"{BASE_URL}/{route}", wait_until="networkidle")
            
            await asyncio.sleep(1.5)
            shots.append(await screenshot(page, fname, label))
            
            # Scroll down a bit to capture more content
            await page.evaluate("window.scrollTo(0, 500)")
            await asyncio.sleep(0.8)
            shots.append(await screenshot(page, f"{fname}_scroll", f"{label} - Scrolled"))

        await browser.close()

    # ── Build PDF ─────────────────────────────────────────────────────────────
    print("\n\nBuilding PDF...")
    build_pdf(shots)
    print(f"\n✅  PDF saved → {PDF_PATH}")
    print(f"    Total pages: {len(shots)}")


def build_pdf(shots):
    pdf = FPDF(orientation="L", unit="mm", format="A4")   # Landscape for wide screenshots
    pdf.set_auto_page_break(auto=False)

    # Cover page
    pdf.add_page()
    pdf.set_fill_color(15, 23, 42)   # dark navy
    pdf.rect(0, 0, 297, 210, "F")
    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(99, 202, 183)
    pdf.cell(0, 80, "", ln=True)
    pdf.cell(0, 15, "AI Expense Tracker", align="C", ln=True)
    pdf.set_font("Helvetica", "", 16)
    pdf.set_text_color(180, 180, 200)
    pdf.cell(0, 10, "Website Screenshots - All Pages", align="C", ln=True)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(120, 130, 150)
    from datetime import datetime
    pdf.cell(0, 10, f"Generated on {datetime.now().strftime('%d %B %Y, %I:%M %p')}", align="C", ln=True)

    PAGE_W, PAGE_H = 297, 210   # A4 landscape mm
    MARGIN = 8
    HEADER_H = 10

    for idx, (img_path, label) in enumerate(shots):
        if not os.path.exists(img_path):
            continue

        pdf.add_page()

        # Header bar
        pdf.set_fill_color(15, 23, 42)
        pdf.rect(0, 0, PAGE_W, HEADER_H + 2, "F")
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(99, 202, 183)
        pdf.set_y(3)
        pdf.cell(0, 6, f"  Page {idx + 1}/{len(shots)}  |  {label}", ln=True)

        # Fit image
        with Image.open(img_path) as im:
            iw, ih = im.size

        avail_w = PAGE_W - 2 * MARGIN
        avail_h = PAGE_H - HEADER_H - 2 * MARGIN - 4

        scale = min(avail_w / iw, avail_h / ih)
        draw_w = iw * scale
        draw_h = ih * scale
        x = MARGIN + (avail_w - draw_w) / 2
        y = HEADER_H + 4 + (avail_h - draw_h) / 2

        pdf.image(img_path, x=x, y=y, w=draw_w, h=draw_h)

    pdf.output(str(PDF_PATH))


if __name__ == "__main__":
    asyncio.run(main())
