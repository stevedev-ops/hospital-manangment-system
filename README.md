# NutriCare Outpatient EMR (Reception & Specialist Lilian Kathomi)

A clinical **Outpatient Pediatric & Clinical Nutrition Patient Management System (MVP)** configured specifically for:
1. **Reception Desk** (Patient Registration, Check-in, Triage & Cash/Insurance Billing)
2. **Specialist: Lilian Kathomi** (Pediatric Nutritionist & Clinical Specialist)

---

## 👥 Dual Portal Architecture

### 1. Reception Desk
- **Patient Intake & Check-in:** Front desk enters demographics, parent/guardian details, initial triage vitals, and processes Cash/Insurance payments.
- **Queue Assignment:** Routes incoming patients to **Lilian Kathomi's Consultation Suite**.
- **Central Clinic Roster:** Views all registered patients across the clinic.

### 2. Specialist Suite: Lilian Kathomi
- **Scheduled Outpatients Queue:** Automatically filters to show patients scheduled for **Lilian Kathomi** along with their appointment time slots.
- **Doctor Can Directly Enter Patient Data:** Lilian Kathomi has full access to the `+ New Patient Intake & Consultation` button to directly register and consult walk-ins at any time.
- **Clinical Tools:**
  - High-visibility **Food Allergy & Intolerance Alert Banner** (CMPA, Eggs, Peanuts, Gluten).
  - Preterm & **Corrected Age Engine** (< 37 weeks).
  - Pediatric Anthropometry: Weight, Length, **MUAC Malnutrition Triage** (SAM < 11.5cm / MAM 11.5–12.4cm), Head Circumference, and Bilateral Edema.
  - Standardized **Minimum Dietary Diversity (MDD-C 8 Food Groups Checklist)** and milk volume tracking.
  - **Longitudinal Multi-Visit Tracking:** `+ Log Follow-up Visit` with automatic **Weight Velocity** engine (grams gained/day).
  - Structured Prescription Table (Iron drops, Vitamin D, Zinc, RUTF, eHF formula).
  - Specialist Clinical Referral Letter Generator (Pediatric GI, Allergist, Speech/Feeding).
  - Printable Consultation Slip (`window.print()`).

---

## 🔑 Login & Role Switcher

Click the **User Badge** or **"🔄 Switch Role"** button in the top navigation bar to switch between:
1. **Reception Desk**
2. **Lilian Kathomi** (Pediatric Nutritionist & Specialist)

---

## 💻 Running the App

The server is running live locally on **port 3030**:
👉 **[http://localhost:3030](http://localhost:3030)**

To run manually:
```bash
PORT=3030 npm start
# or
python3 -m http.server 3030
```
