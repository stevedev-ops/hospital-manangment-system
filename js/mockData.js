// mockData.js - Clinical Outpatient Dataset with 1 Specialist (Lilian Kathomi) & 1 Reception

export const CLINICAL_USERS = [
  {
    id: "user-rec",
    username: "reception@nutricare.med",
    name: "Reception Desk",
    role: "reception",
    roleTitle: "Front Desk & Triage Officer",
    avatar: "RD",
    department: "Reception & Outpatient Billing"
  },
  {
    id: "spec-lilian",
    username: "lilian.kathomi@nutricare.med",
    name: "Lilian Kathomi",
    role: "specialist",
    roleTitle: "Pediatric Nutritionist & Specialist",
    avatar: "LK",
    department: "Pediatric Nutrition & Outpatient Clinic"
  }
];

export const INITIAL_PATIENTS = [
  {
    id: "pat-001",
    mrn: "NP-2026-001",
    createdAt: "2026-10-26T08:30:00Z",
    status: "Completed",
    queueStatus: "Completed",
    assignedSpecialistId: "spec-lilian",
    assignedSpecialistName: "Lilian Kathomi",
    appointmentTime: "09:00 AM",
    
    // Demographics & Birth History
    name: "Baby Liam Mwangi",
    sex: "Male",
    dob: "2026-05-18",
    age: "5 months",
    ageMonths: 5.2,
    isPreterm: false,
    gestationalWeeks: 39,
    correctedAge: null,
    birthWeight: 3.30,
    
    // Safety & Allergies
    allergies: ["Cow's Milk Protein (CMPA) Suspected"],
    currentMedications: ["Vitamin D3 drops (400 IU/day)"],

    // Guardian Details
    guardian: {
      name: "Grace W. Mwangi",
      relationship: "Mother",
      phone: "+254 712 984 521",
      email: "grace.mwangi@example.com",
      residence: "Kilimani, Nairobi"
    },

    // Current Anthropometry & Vitals
    weight: 5.90,
    height: 62.5,
    headCircumference: 41.2,
    muac: 12.8,
    edema: "None",
    breastfeedingStatus: "Exclusive Breastfeeding (0-6m)",

    // Dietary Assessment
    dietaryRecall: {
      dailyMilkVolumeMl: 0,
      fluidIntakeMl: 0,
      mddScore: 1,
      foodGroups: ["Breastmilk"],
      feedingDifficulties: ["Suboptimal latch duration", "Lactation fatigue"]
    },

    // Prescriptions
    prescriptions: [
      { item: "Vitamin D3 Drops", dosage: "400 IU (1 drop daily)", duration: "Ongoing", instructions: "Administer on mother's nipple before feed" },
      { item: "Maternal Galactagogue Support", dosage: "Moringa + Oats soup 2x/day", duration: "4 weeks", instructions: "Support maternal lactation volume" }
    ],

    // Itemized Billing & Payment
    payment: {
      mode: "Insurance",
      provider: "Jubilee Health Insurance",
      policyNumber: "JUB-883921-PED",
      authCode: "AUTH-2026-9481",
      icd10: "E45 - Retardation of development following protein-calorie malnutrition",
      consultationFee: 45.00,
      supplementsFee: 15.00,
      totalAmount: 60.00,
      currency: "USD",
      status: "Approved",
      receiptNumber: "RCP-2026-081",
      paidAt: "2026-10-26 09:45 AM"
    },

    // Longitudinal Visits
    visits: [
      {
        id: "v-101",
        visitDate: "2026-10-12",
        visitTime: "10:00 AM",
        weight: 5.65,
        height: 61.5,
        muac: 12.6,
        nutritionistName: "Lilian Kathomi",
        patientSummary: "Initial visit at 4.7 months. Weight velocity slowing down. Latch asymmetric.",
        conditionDiagnosed: "Mild Infant Growth Faltering; Suboptimal Latch.",
        recommendedManagement: "Corrected latch angle in clinic. Instructed frequent feeding schedule 8-10x/24h.",
        followUpDate: "2026-10-26"
      },
      {
        id: "v-102",
        visitDate: "2026-10-26",
        visitTime: "09:15 AM",
        weight: 5.90,
        height: 62.5,
        muac: 12.8,
        nutritionistName: "Lilian Kathomi",
        patientSummary: "Follow-up review after 2 weeks. Mother reports improved latch and infant swallowing sounds. Weight gained +250g over 14 days (+17.8g/day - good recovery velocity). Wet diapers 6-7 daily.",
        conditionDiagnosed: "Resolving Growth Faltering; Sustained Exclusive Breastfeeding Recovery.",
        recommendedManagement: "1. Continue exclusive breastfeeding until completion of 6 months (3 weeks remaining).\n2. Maintain nocturnal feeds.\n3. Re-evaluate for complementary feeding introduction at 6 months.",
        followUpDate: "2026-11-16",
        weightVelocity: "+17.8 g/day (Adequate Recovery)"
      }
    ],

    // Attachments
    attachments: [
      {
        id: "att-101",
        name: "WHO_Growth_Curve_0_6M.pdf",
        type: "application/pdf",
        size: "1.4 MB",
        category: "Growth Chart",
        uploadedAt: "2026-10-26",
        description: "WHO Weight-for-Age & Length-for-Age percentile curves showing recent upward recovery.",
        previewText: "CLINICAL GROWTH CURVE AUDIT\nPatient: Liam Mwangi (5M)\nBirth Weight: 3.30 kg\nCurrent Weight: 5.90 kg\nAttending: Lilian Kathomi"
      }
    ]
  },
  {
    id: "pat-002",
    mrn: "NP-2026-002",
    createdAt: "2026-10-26T09:15:00Z",
    status: "Completed",
    queueStatus: "Completed",
    assignedSpecialistId: "spec-lilian",
    assignedSpecialistName: "Lilian Kathomi",
    appointmentTime: "10:00 AM",
    
    // Demographics & Birth History
    name: "Sophia Nicole Chen",
    sex: "Female",
    dob: "2025-04-12",
    age: "18 months",
    ageMonths: 18.4,
    isPreterm: true,
    gestationalWeeks: 34,
    correctedAge: "16.5 months",
    birthWeight: 2.10,
    
    // Safety & Allergies
    allergies: ["Egg Whites (Mild Urticaria)", "Peanuts (Family History)"],
    currentMedications: ["None reported"],

    // Guardian Details
    guardian: {
      name: "Emily Zhang Chen",
      relationship: "Mother",
      phone: "+1 (555) 732-8819",
      email: "emily.chen@example.com",
      residence: "Westlands, Block B"
    },

    // Current Anthropometry & Vitals
    weight: 9.20,
    height: 79.0,
    headCircumference: 46.1,
    muac: 12.3,
    edema: "None",
    breastfeedingStatus: "Weaned / Complementary Foods",

    // Dietary Assessment
    dietaryRecall: {
      dailyMilkVolumeMl: 850,
      fluidIntakeMl: 1000,
      mddScore: 3,
      foodGroups: ["Grains / Cereals", "Dairy (Cow Milk)", "Fruits (Banana/Apple)"],
      feedingDifficulties: ["Refusal of textured solids", "Excessive cow milk reliance", "Picky eating"]
    },

    // Prescriptions
    prescriptions: [
      { item: "Elemental Iron Drops (Ferrous Sulfate)", dosage: "3 mg/kg/day (27 mg daily)", duration: "8 weeks", instructions: "Give with Vitamin C (fresh orange slice). Do NOT give with milk." },
      { item: "Nutrient-Dense Fortified Cereal (RUSF / Iron-fortified)", dosage: "2 servings daily (approx. 50g)", duration: "4 weeks", instructions: "Blend with vegetable mash and chicken liver puree" }
    ],

    // Itemized Billing & Payment
    payment: {
      mode: "Cash",
      provider: null,
      policyNumber: null,
      authCode: null,
      icd10: "D50.9 - Iron deficiency anemia, unspecified",
      consultationFee: 40.00,
      supplementsFee: 20.00,
      totalAmount: 60.00,
      currency: "USD",
      status: "Paid",
      receiptNumber: "RCP-2026-082",
      paidAt: "2026-10-26 10:15 AM"
    },

    // Longitudinal Visits
    visits: [
      {
        id: "v-201",
        visitDate: "2026-10-26",
        visitTime: "10:00 AM",
        weight: 9.20,
        height: 79.0,
        muac: 12.3,
        nutritionistName: "Lilian Kathomi",
        patientSummary: "18-month-old toddler (Corrected: 16.5M, ex-34w preemie) with chronic solid refusal and cow milk over-consumption (>850ml/day). Pale palpebral conjunctiva. CBC indicates microcytic hypochromic anemia (Hb 9.4 g/dL). MUAC 12.3cm indicates moderate wasting risk.",
        conditionDiagnosed: "Toddler Iron-Deficiency Anemia; Milk-Induced Anorexia & Moderate Acute Malnutrition (MAM).",
        recommendedManagement: "1. Cap whole cow milk strictly to 350-400ml/24h.\n2. Initiate therapeutic elemental iron drops with Vitamin C.\n3. Food Chaining therapy for textured solids: introduce liver pate and pureed pumpkin.\n4. Repeat CBC and serum ferritin in 6 weeks.",
        followUpDate: "2026-11-23",
        weightVelocity: "Baseline Consultation"
      }
    ],

    // Attachments
    attachments: [
      {
        id: "att-201",
        name: "CBC_Lab_Report_Iron_Ferritin.pdf",
        type: "application/pdf",
        size: "640 KB",
        category: "Lab Report",
        uploadedAt: "2026-10-26",
        description: "Complete Blood Count & Serum Ferritin indicating microcytic hypochromic anemia.",
        previewText: "LABORATORY REPORT - HEMATOLOGY\nPatient: Sophia Nicole Chen\nHemoglobin: 9.4 g/dL [LOW]\nSerum Ferritin: 8 ng/mL [CRITICAL LOW]"
      }
    ]
  },
  {
    id: "pat-003",
    mrn: "NP-2026-003",
    createdAt: "2026-10-26T10:00:00Z",
    status: "Waiting",
    queueStatus: "Waiting in Queue",
    assignedSpecialistId: "spec-lilian",
    assignedSpecialistName: "Lilian Kathomi",
    appointmentTime: "11:00 AM",
    
    // Demographics & Birth History
    name: "Tariq Al-Mansoor",
    sex: "Male",
    dob: "2026-02-20",
    age: "8 months",
    ageMonths: 8.2,
    isPreterm: false,
    gestationalWeeks: 38,
    correctedAge: null,
    birthWeight: 3.40,
    
    // Safety & Allergies
    allergies: ["Cow's Milk Protein (Severe CMPA)", "Soy Protein (Cross-reactivity)"],
    currentMedications: ["1% Hydrocortisone topical cream for eczema", "Probiotic infant drops"],

    // Guardian Details
    guardian: {
      name: "Omar Al-Mansoor",
      relationship: "Father",
      phone: "+971 50 491 8302",
      email: "omar.mansoor@example.com",
      residence: "Parklands Road, Suite 4"
    },

    // Current Anthropometry & Vitals
    weight: 7.20,
    height: 68.0,
    headCircumference: 44.0,
    muac: 12.9,
    edema: "None",
    breastfeedingStatus: "Mixed / Partial Breastfeeding",

    // Dietary Assessment
    dietaryRecall: {
      dailyMilkVolumeMl: 400,
      fluidIntakeMl: 600,
      mddScore: 4,
      foodGroups: ["Breastmilk", "Formula (Cow milk based)", "Roots/Tubers", "Vegetables"],
      feedingDifficulties: ["Frequent post-feed vomiting/GERD", "Severe colic / Arching back", "Blood-streaked loose stools"]
    },

    // Prescriptions
    prescriptions: [
      { item: "Extensively Hydrolyzed Formula (eHF) / Amino Acid Formula", dosage: "500-600 ml daily as needed", duration: "6 months", instructions: "Replace all standard cow milk formula immediately" },
      { item: "Maternal Calcium & Vitamin D3 Supplementation", dosage: "1000mg Calcium + 800 IU Vit D3 daily", duration: "During elimination", instructions: "For nursing mother during strict dairy-free diet" }
    ],

    // Itemized Billing & Payment
    payment: {
      mode: "Insurance",
      provider: "Cigna Global Health",
      policyNumber: "CG-99482-PEDIATRICS",
      authCode: "AUTH-2026-7719",
      icd10: "K52.2 - Allergic and dietetic gastroenteritis and colitis",
      consultationFee: 50.00,
      supplementsFee: 35.00,
      totalAmount: 85.00,
      currency: "USD",
      status: "Approved",
      receiptNumber: "RCP-2026-083",
      paidAt: "2026-10-26 10:45 AM"
    },

    // Longitudinal Visits
    visits: [
      {
        id: "v-301",
        visitDate: "2026-10-26",
        visitTime: "11:00 AM",
        weight: 7.20,
        height: 68.0,
        muac: 12.9,
        nutritionistName: "Lilian Kathomi",
        patientSummary: "8-month-old infant with severe flexural eczema, post-prandial distress, and occult blood in stool following formula introduction. Stool microscopy confirmed eosinophilia.",
        conditionDiagnosed: "Non-IgE Mediated Cow's Milk Protein Allergy (CMPA); Allergic Proctocolitis.",
        recommendedManagement: "1. Cease all standard cow milk formula immediately; switch to Amino Acid Formula (AAF) or eHF.\n2. Strict maternal dietary elimination of milk, casein, butter, cheese, whey.\n3. Commence hypoallergenic single-ingredient solids (steamed pear, avocado, sweet potato).",
        followUpDate: "2026-11-16",
        weightVelocity: "Scheduled for Today (In Queue)"
      }
    ],

    // Attachments
    attachments: [
      {
        id: "att-301",
        name: "Stool_Occult_Blood_Test.pdf",
        type: "application/pdf",
        size: "512 KB",
        category: "Lab Report",
        uploadedAt: "2026-10-26",
        description: "Fecal occult blood positive test with eosinophilic infiltration.",
        previewText: "CLINICAL LAB REPORT - FECAL ANALYSIS\nPatient: Tariq Al-Mansoor\nFecal Occult Blood: POSITIVE (+)"
      }
    ]
  },
  {
    id: "pat-004",
    mrn: "NP-2026-004",
    createdAt: "2026-10-26T11:00:00Z",
    status: "Completed",
    queueStatus: "Completed",
    assignedSpecialistId: "spec-lilian",
    assignedSpecialistName: "Lilian Kathomi",
    appointmentTime: "11:30 AM",
    
    // Demographics & Birth History
    name: "Zoe Zimmerman",
    sex: "Female",
    dob: "2024-06-15",
    age: "2 years 4 months",
    ageMonths: 28.3,
    isPreterm: false,
    gestationalWeeks: 40,
    correctedAge: null,
    birthWeight: 3.10,
    
    // Safety & Allergies
    allergies: ["No known food allergies (NKFA)"],
    currentMedications: ["Daily chewable multivitamin"],

    // Guardian Details
    guardian: {
      name: "Sarah Zimmerman",
      relationship: "Mother",
      phone: "+1 (555) 843-1940",
      email: "sarah.zimmerman@example.com",
      residence: "Highland Ridge, Apt 12"
    },

    // Current Anthropometry & Vitals
    weight: 12.80,
    height: 89.5,
    headCircumference: 48.5,
    muac: 15.2,
    edema: "None",
    breastfeedingStatus: "Weaned / Complementary Foods",

    // Dietary Assessment
    dietaryRecall: {
      dailyMilkVolumeMl: 250,
      fluidIntakeMl: 1200,
      mddScore: 7,
      foodGroups: ["Grains", "Legumes/Beans", "Dairy", "Flesh Foods (Poultry/Fish)", "Eggs", "Vit-A Veg", "Other Fruits"],
      feedingDifficulties: ["Occasional mild food jags"]
    },

    // Prescriptions
    prescriptions: [
      { item: "Fiber & Hydration Maintenance", dosage: "19g dietary fiber daily", duration: "Continuous", instructions: "Whole grains, chia seeds, fresh fruit with skin" }
    ],

    // Itemized Billing & Payment
    payment: {
      mode: "Cash",
      provider: null,
      policyNumber: null,
      authCode: null,
      icd10: "Z76.2 - Health supervision and care of other healthy infant and child",
      consultationFee: 35.00,
      supplementsFee: 0.00,
      totalAmount: 35.00,
      currency: "USD",
      status: "Paid",
      receiptNumber: "RCP-2026-084",
      paidAt: "2026-10-26 11:50 AM"
    },

    // Longitudinal Visits
    visits: [
      {
        id: "v-401",
        visitDate: "2026-10-26",
        visitTime: "11:30 AM",
        weight: 12.80,
        height: 89.5,
        muac: 15.2,
        nutritionistName: "Lilian Kathomi",
        patientSummary: "Healthy 28-month-old toddler attending annual nutritional milestone audit. Excellent dietary diversity score (7/8). Normal growth trajectory along the 50th percentile for age and height.",
        conditionDiagnosed: "Optimal Pediatric Growth & Nutritional Status.",
        recommendedManagement: "Maintain healthy toddler plate (50% vegetables/fruits, 25% whole grains, 25% protein). Ensure continued active physical play >= 60 min/day.",
        followUpDate: "2027-04-20",
        weightVelocity: "Optimal Velocity"
      }
    ],

    // Attachments
    attachments: [
      {
        id: "att-401",
        name: "Dietary_Diversity_Scorecard.pdf",
        type: "application/pdf",
        size: "420 KB",
        category: "Diet Plan",
        uploadedAt: "2026-10-26",
        description: "WHO Infant & Young Child Feeding (IYCF) Minimum Dietary Diversity score sheet: 7/8 food groups.",
        previewText: "PEDIATRIC NUTRITIONAL DIVERSITY SCORECARD\nScore: 7 / 8 Food Groups Met\nAttending: Lilian Kathomi"
      }
    ]
  }
];
