// app.js - Clinical Outpatient EMR with 1 Reception & 1 Specialist (Lilian Kathomi)
import { INITIAL_PATIENTS, CLINICAL_USERS } from './mockData.js';

// Application State
const STORAGE_KEY = 'nutricare_clinical_patients_v4_lilian';
const USER_KEY = 'nutricare_active_user_id_v4';
const THEME_KEY = 'nutricare_theme_mode';

let patients = [];
let currentUser = null;
let specialistScope = 'my'; // 'my' | 'all'
let activeFilter = 'all';
let searchQuery = '';
let currentPatientId = null;
let currentPreviewAttachment = null;
let pendingFiles = [];

// DOM References
const elements = {
  // Login & Portal
  loginOverlay: document.getElementById('loginOverlay'),
  loginForm: document.getElementById('loginForm'),
  loginEmail: document.getElementById('loginEmail'),
  roleOptionCards: document.querySelectorAll('.role-option-card'),
  userProfileBtn: document.getElementById('userProfileBtn'),
  switchUserBtn: document.getElementById('switchUserBtn'),
  navUserAvatar: document.getElementById('navUserAvatar'),
  navUserName: document.getElementById('navUserName'),
  navRoleTag: document.getElementById('navRoleTag'),
  
  portalBanner: document.getElementById('portalBanner'),
  portalTitleText: document.getElementById('portalTitleText'),
  portalSubtitle: document.getElementById('portalSubtitle'),
  scopeToggleGroup: document.getElementById('scopeToggleGroup'),
  btnScopeMyPatients: document.getElementById('btnScopeMyPatients'),
  btnScopeAllPatients: document.getElementById('btnScopeAllPatients'),
  scopeMyCount: document.getElementById('scopeMyCount'),
  scopeAllCount: document.getElementById('scopeAllCount'),
  queueSectionTitle: document.getElementById('queueSectionTitle'),

  // Header & Controls
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  resetDemoBtn2: document.getElementById('resetDemoBtn2'),
  searchInput: document.getElementById('globalSearchInput'),
  filterButtons: document.querySelectorAll('.filter-btn'),
  patientGrid: document.getElementById('patientGrid'),
  patientCountBadge: document.getElementById('patientCountBadge'),
  
  // KPI Stats
  statTotalPatients: document.getElementById('statTotalPatients'),
  statTodayCompleted: document.getElementById('statTodayCompleted'),
  statHighRiskMUAC: document.getElementById('statHighRiskMUAC'),
  statAllergiesAlert: document.getElementById('statAllergiesAlert'),
  statBillingBreakdown: document.getElementById('statBillingBreakdown'),

  // Intake Modal
  intakeModal: document.getElementById('intakeModal'),
  openIntakeBtn: document.getElementById('openIntakeBtn'),
  closeIntakeBtn: document.getElementById('closeIntakeBtn'),
  cancelIntakeBtn: document.getElementById('cancelIntakeBtn'),
  intakeForm: document.getElementById('intakeForm'),
  assignedSpecialist: document.getElementById('assignedSpecialist'),
  appointmentTime: document.getElementById('appointmentTime'),

  // Preterm inputs
  patientIsPreterm: document.getElementById('patientIsPreterm'),
  pretermDetailsRow: document.getElementById('pretermDetailsRow'),
  patientGestationalWeeks: document.getElementById('patientGestationalWeeks'),
  patientCorrectedAge: document.getElementById('patientCorrectedAge'),
  patientAge: document.getElementById('patientAge'),

  // Anthropometry live calculations
  inputWeight: document.getElementById('patientWeight'),
  inputHeight: document.getElementById('patientHeight'),
  inputBirthWeight: document.getElementById('patientBirthWeight'),
  inputMUAC: document.getElementById('patientMUAC'),
  muacTriageTag: document.getElementById('muacTriageTag'),
  growthBanner: document.getElementById('growthInsightBanner'),
  growthGainText: document.getElementById('growthGainText'),
  growthStatusBadge: document.getElementById('growthStatusBadge'),

  // MDD Checklist
  foodGroupCheckboxes: document.querySelectorAll('input[name="foodGroup"]'),
  mddScoreDisplay: document.getElementById('mddScoreDisplay'),

  // Billing inputs
  consultationFee: document.getElementById('consultationFee'),
  supplementsFee: document.getElementById('supplementsFee'),
  totalBillDisplay: document.getElementById('totalBillDisplay'),
  btnPaymentCash: document.getElementById('btnPaymentCash'),
  btnPaymentInsurance: document.getElementById('btnPaymentInsurance'),
  paymentModeInput: document.getElementById('paymentMode'),
  insuranceFieldsGroup: document.getElementById('insuranceFieldsGroup'),

  // File Upload
  dropzone: document.getElementById('attachmentDropzone'),
  fileInput: document.getElementById('attachmentFileInput'),
  uploadedFilesContainer: document.getElementById('uploadedFilesList'),
  attachmentCategorySelect: document.getElementById('attachmentCategorySelect'),

  // Chart Modal
  chartModal: document.getElementById('chartModal'),
  closeChartBtn: document.getElementById('closeChartBtn'),
  chartTabsNav: document.querySelectorAll('.chart-tab-btn'),
  chartTabContents: document.querySelectorAll('.chart-tab-content'),
  printSummaryBtn: document.getElementById('printSummaryBtn'),
  openFollowUpBtn: document.getElementById('openFollowUpBtn'),
  timelineAddVisitBtn: document.getElementById('timelineAddVisitBtn'),
  openReferralBtn: document.getElementById('openReferralBtn'),

  // Follow-up Encounter Modal
  followUpModal: document.getElementById('followUpModal'),
  closeFollowUpBtn: document.getElementById('closeFollowUpBtn'),
  cancelFollowUpBtn: document.getElementById('cancelFollowUpBtn'),
  followUpForm: document.getElementById('followUpForm'),

  // Referral Modal
  referralModal: document.getElementById('referralModal'),
  closeReferralBtn: document.getElementById('closeReferralBtn'),
  referralSpecialistSelect: document.getElementById('referralSpecialistSelect'),
  referralLetterContent: document.getElementById('referralLetterContent'),
  copyReferralBtn: document.getElementById('copyReferralBtn'),

  // Doc Viewer Modal
  docViewerModal: document.getElementById('docViewerModal'),
  closeDocViewerBtn: document.getElementById('closeDocViewerBtn'),
  docViewerTitle: document.getElementById('docViewerTitle'),
  docViewerBadge: document.getElementById('docViewerBadge'),
  docViewerContent: document.getElementById('docViewerContent'),
  docDownloadBtn: document.getElementById('docDownloadBtn'),

  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// 1. Initialization & Authentication
// ==========================================
function initApp() {
  loadTheme();
  loadPatients();
  initCurrentUser();
  setupEventListeners();
  renderDashboard();
}

function initCurrentUser() {
  const savedUserId = localStorage.getItem(USER_KEY) || 'spec-lilian';
  const found = CLINICAL_USERS.find(u => u.id === savedUserId);
  currentUser = found || CLINICAL_USERS[1]; // Default Lilian Kathomi
  applyUserPortal();
}

function loginAsUser(userId) {
  const found = CLINICAL_USERS.find(u => u.id === userId);
  if (!found) return;
  currentUser = found;
  localStorage.setItem(USER_KEY, currentUser.id);
  elements.loginOverlay.classList.remove('active');
  specialistScope = 'my';
  applyUserPortal();
  renderDashboard();
  showToast(`Switched workspace to ${currentUser.name} (${currentUser.roleTitle})`);
}

function applyUserPortal() {
  elements.navUserAvatar.textContent = currentUser.avatar;
  elements.navUserName.textContent = currentUser.name;
  elements.navRoleTag.textContent = currentUser.role === 'reception' ? 'Front Desk' : 'Specialist';
  elements.navRoleTag.className = `role-tag ${currentUser.role === 'reception' ? 'role-reception' : 'role-specialist'}`;

  if (currentUser.role === 'reception') {
    elements.portalTitleText.textContent = 'Reception & Triage Desk';
    elements.portalSubtitle.textContent = 'Front Desk • Patient Registration, Check-in, Triage & Cash/Insurance Billing';
    elements.scopeToggleGroup.style.display = 'none';
    elements.queueSectionTitle.textContent = 'Outpatient Central Clinic Roster & Triage Queue';
    elements.openIntakeBtn.innerHTML = '<span>+</span> New Patient Registration & Check-In';
  } else {
    // Specialist Lilian Kathomi
    elements.portalTitleText.textContent = "Lilian Kathomi's Consultation Suite";
    elements.portalSubtitle.textContent = 'Pediatric Nutrition & Outpatient Clinic • Showing patients scheduled for Lilian Kathomi';
    elements.scopeToggleGroup.style.display = 'flex';
    elements.queueSectionTitle.textContent = specialistScope === 'my' 
      ? 'Scheduled Outpatients for Lilian Kathomi' 
      : 'All Registered Clinic Patients';
    elements.openIntakeBtn.innerHTML = '<span>+</span> New Patient Intake & Consultation';
    
    if (elements.assignedSpecialist) {
      elements.assignedSpecialist.value = 'spec-lilian';
    }
  }
}

function loadPatients() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      patients = JSON.parse(cached);
    } catch (e) {
      console.error('Error parsing stored patients:', e);
      patients = [...INITIAL_PATIENTS];
      savePatients();
    }
  } else {
    patients = [...INITIAL_PATIENTS];
    savePatients();
  }
}

function savePatients() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

function resetToDemoData() {
  if (confirm('Reset patient records to the clinical demo profiles for Lilian Kathomi?')) {
    patients = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
    savePatients();
    renderDashboard();
    showToast('Reset to clinical demo dataset successfully.');
  }
}

// ==========================================
// 2. Clinical Calculations
// ==========================================
function evaluateMUAC(muac) {
  if (!muac || muac <= 0) return null;
  if (muac < 11.5) {
    return { label: 'SAM (Severe Acute Malnutrition)', category: 'sam', class: 'muac-sam', color: '#b91c1c' };
  } else if (muac < 12.5) {
    return { label: 'MAM (Moderate Acute Malnutrition)', category: 'mam', class: 'muac-mam', color: '#b45309' };
  }
  return { label: 'Well-Nourished (Normal)', category: 'normal', class: 'muac-normal', color: '#047857' };
}

function calculateWeightGain(birthWeight, currentWeight) {
  if (!birthWeight || !currentWeight) return null;
  const diff = currentWeight - birthWeight;
  const pct = ((diff / birthWeight) * 100).toFixed(1);
  return {
    diffKg: diff.toFixed(2),
    pct: pct,
    isGain: diff >= 0
  };
}

function computeNutritionalStatus(weight, height, birthWeight, muac) {
  if (muac && muac < 11.5) {
    return { label: 'SAM Alert', class: 'tag-mixed', badgeBg: 'var(--danger-light)', badgeColor: 'var(--danger)', isAlert: true };
  }
  if (muac && muac < 12.5) {
    return { label: 'MAM Alert', class: 'tag-mixed', badgeBg: 'var(--warning-light)', badgeColor: 'var(--warning)', isAlert: true };
  }
  if (birthWeight && weight) {
    const gain = weight - birthWeight;
    if (gain < 1.5 && weight < 6.0) {
      return { label: 'Growth Faltering Alert', class: 'tag-mixed', badgeBg: 'var(--warning-light)', badgeColor: 'var(--warning)', isAlert: true };
    }
  }
  return { label: 'Adequate Growth', class: 'tag-weaned', badgeBg: 'var(--success-light)', badgeColor: 'var(--success)', isAlert: false };
}

function calculateCorrectedAge() {
  if (!elements.patientIsPreterm.checked) {
    elements.pretermDetailsRow.style.display = 'none';
    return;
  }
  elements.pretermDetailsRow.style.display = 'grid';
  
  const gestWeeks = parseInt(elements.patientGestationalWeeks.value, 10);
  const ageStr = elements.patientAge.value.trim().toLowerCase();
  
  let months = 0;
  if (ageStr.includes('m')) {
    months = parseFloat(ageStr) || 0;
  } else if (ageStr.includes('y')) {
    months = (parseFloat(ageStr) || 0) * 12;
  }

  if (gestWeeks && gestWeeks >= 24 && gestWeeks < 37 && months > 0) {
    const weeksPremature = 40 - gestWeeks;
    const monthsPremature = weeksPremature / 4.33;
    const correctedMonths = Math.max(0, months - monthsPremature).toFixed(1);
    elements.patientCorrectedAge.value = `${correctedMonths} months (Corrected Age)`;
  } else {
    elements.patientCorrectedAge.value = '';
  }
}

function updateLiveAnthropometry() {
  const currentWeight = parseFloat(elements.inputWeight.value);
  const currentHeight = parseFloat(elements.inputHeight.value);
  const birthWeight = parseFloat(elements.inputBirthWeight.value);
  const muac = parseFloat(elements.inputMUAC.value);

  if (muac && muac > 0) {
    const muacRes = evaluateMUAC(muac);
    elements.muacTriageTag.textContent = `MUAC: ${muac}cm (${muacRes.label})`;
    elements.muacTriageTag.style.color = muacRes.color;
    elements.muacTriageTag.style.display = 'block';
  } else {
    elements.muacTriageTag.style.display = 'none';
  }

  if (currentWeight && birthWeight) {
    const gain = calculateWeightGain(birthWeight, currentWeight);
    const gainSign = gain.isGain ? '+' : '';
    elements.growthGainText.textContent = `Weight Gain Since Birth: ${gainSign}${gain.diffKg} kg (${gainSign}${gain.pct}%)`;

    const status = computeNutritionalStatus(currentWeight, currentHeight, birthWeight, muac);
    elements.growthStatusBadge.textContent = status.label;
    elements.growthStatusBadge.style.backgroundColor = status.badgeBg;
    elements.growthStatusBadge.style.color = status.badgeColor;
    elements.growthBanner.style.display = 'flex';
  } else {
    elements.growthBanner.style.display = 'none';
  }
}

function updateBillingTotals() {
  const consult = parseFloat(elements.consultationFee.value) || 0;
  const supplements = parseFloat(elements.supplementsFee.value) || 0;
  const total = consult + supplements;
  elements.totalBillDisplay.value = `$${total.toFixed(2)} USD`;
}

function updateMDDScore() {
  let count = 0;
  elements.foodGroupCheckboxes.forEach(cb => {
    if (cb.checked) count++;
  });
  elements.mddScoreDisplay.textContent = `Score: ${count} / 8 (${count >= 5 ? 'Adequate Diversity' : 'Low Micronutrient Adequacy'})`;
  elements.mddScoreDisplay.style.color = count >= 5 ? 'var(--success)' : 'var(--warning)';
}

// ==========================================
// 3. Render Dashboard & Patients
// ==========================================
function renderDashboard() {
  updateStatsKPIs();
  renderPatientList();
}

function updateStatsKPIs() {
  const allPatientsCount = patients.length;
  const myPatientsCount = patients.filter(p => p.assignedSpecialistId === 'spec-lilian').length;
  
  if (elements.scopeMyCount) elements.scopeMyCount.textContent = myPatientsCount;
  if (elements.scopeAllCount) elements.scopeAllCount.textContent = allPatientsCount;

  // Active pool depending on role and scope
  const activePool = (currentUser?.role === 'specialist' && specialistScope === 'my')
    ? patients.filter(p => p.assignedSpecialistId === 'spec-lilian')
    : patients;

  const total = activePool.length;
  const completedToday = activePool.filter(p => p.status === 'Completed').length;
  
  let cashRevenue = 0;
  let insuranceClaims = 0;
  let muacRiskCount = 0;
  let allergyCount = 0;

  activePool.forEach(p => {
    const totalPaid = p.payment?.totalAmount || p.payment?.amount || 0;
    if (p.payment?.mode === 'Cash') {
      cashRevenue += totalPaid;
    } else if (p.payment?.mode === 'Insurance') {
      insuranceClaims += totalPaid;
    }

    if (p.muac && p.muac < 12.5) {
      muacRiskCount++;
    }

    const hasAllergy = p.allergies?.some(a => !a.toLowerCase().includes('no known') && !a.toLowerCase().includes('nkfa'));
    if (hasAllergy) {
      allergyCount++;
    }
  });

  elements.statTotalPatients.textContent = total;
  elements.statTodayCompleted.textContent = completedToday;
  elements.statHighRiskMUAC.textContent = muacRiskCount;
  elements.statAllergiesAlert.textContent = allergyCount;
  elements.statBillingBreakdown.textContent = `$${cashRevenue} / $${insuranceClaims}`;
}

function getFilteredPatients() {
  let baseList = patients;
  if (currentUser?.role === 'specialist' && specialistScope === 'my') {
    baseList = patients.filter(p => p.assignedSpecialistId === 'spec-lilian');
  }

  return baseList.filter(p => {
    // Search Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchMRN = p.mrn?.toLowerCase().includes(q);
      const matchGuardian = p.guardian?.name?.toLowerCase().includes(q);
      const matchPhone = p.guardian?.phone?.toLowerCase().includes(q);
      const matchAllergy = p.allergies?.some(a => a.toLowerCase().includes(q));
      const matchDiagnosis = p.visits?.[p.visits.length - 1]?.conditionDiagnosed?.toLowerCase().includes(q);
      if (!matchName && !matchMRN && !matchGuardian && !matchPhone && !matchAllergy && !matchDiagnosis) {
        return false;
      }
    }

    // Category Filter
    if (activeFilter === 'all') return true;
    if (activeFilter === 'allergies') {
      return p.allergies?.some(a => !a.toLowerCase().includes('no known') && !a.toLowerCase().includes('nkfa'));
    }
    if (activeFilter === 'muac-risk') {
      return p.muac && p.muac < 12.5;
    }
    if (activeFilter === 'preterm') {
      return p.isPreterm;
    }
    if (activeFilter === 'cash') return p.payment?.mode === 'Cash';
    if (activeFilter === 'insurance') return p.payment?.mode === 'Insurance';
    if (activeFilter === 'exclusive-bf') return p.breastfeedingStatus?.includes('Exclusive');
    if (activeFilter === 'mixed-bf') return p.breastfeedingStatus?.includes('Mixed');
    if (activeFilter === 'weaned') return p.breastfeedingStatus?.includes('Weaned');
    return true;
  });
}

function renderPatientList() {
  const filtered = getFilteredPatients();
  elements.patientCountBadge.textContent = `${filtered.length} Patients`;

  if (filtered.length === 0) {
    const isSpecialistMy = currentUser?.role === 'specialist' && specialistScope === 'my';
    elements.patientGrid.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <h3>${isSpecialistMy ? 'No Patients Scheduled for Lilian Kathomi' : 'No Patients Match Your Filter'}</h3>
        <p>${isSpecialistMy ? 'Switch to \"All Registered Patients\" or enter new patient data directly.' : 'Adjust search terms or register a new outpatient intake.'}</p>
        <button class="btn btn-primary" id="emptyStateIntakeBtn">
          + Enter Patient Data & Consultation
        </button>
      </div>
    `;
    const btn = document.getElementById('emptyStateIntakeBtn');
    if (btn) btn.addEventListener('click', openIntakeModal);
    return;
  }

  elements.patientGrid.innerHTML = filtered.map(patient => {
    const avatarClass = patient.sex === 'Female' ? 'avatar-female' : (patient.sex === 'Male' ? 'avatar-male' : 'avatar-other');
    const initials = patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const gain = calculateWeightGain(patient.birthWeight, patient.weight);
    const gainStr = gain ? `${gain.isGain ? '+' : ''}${gain.diffKg}kg since birth` : 'Birth Wt N/A';
    
    // MUAC pill
    let muacHtml = '';
    if (patient.muac) {
      const muacEval = evaluateMUAC(patient.muac);
      muacHtml = `<span class="muac-pill ${muacEval.class}">MUAC ${patient.muac}cm (${muacEval.category.toUpperCase()})</span>`;
    }

    // Preterm badge
    const pretermHtml = patient.isPreterm 
      ? `<span class="badge-preterm">👶 Ex-${patient.gestationalWeeks}w Preemie (Corrected: ${patient.correctedAge || 'N/A'})</span>`
      : '';

    // Allergy chip
    const hasAllergy = patient.allergies?.some(a => !a.toLowerCase().includes('no known') && !a.toLowerCase().includes('nkfa'));
    const allergyHtml = hasAllergy 
      ? `<div class="allergy-alert-chip"><span>⚠️</span> <span>ALLERGY: ${escapeHtml(patient.allergies.join(', '))}</span></div>`
      : '';

    // Specialist tag
    const doctorTag = `<span class="assigned-doctor-chip">👩‍⚕️ Specialist: Lilian Kathomi (${patient.appointmentTime || '10:00 AM'})</span>`;

    // Latest Visit & Diagnosis
    const latestVisit = patient.visits?.[patient.visits.length - 1] || patient.encounter || {};
    const condition = latestVisit.conditionDiagnosed || latestVisit.patientSummary || 'Routine Nutritional Audit';
    
    // Weight Velocity pill
    const velocityStr = latestVisit.weightVelocity ? `⚡ ${latestVisit.weightVelocity}` : `${patient.visits?.length || 1} Consultation(s)`;

    // Payment Info
    const totalAmount = patient.payment?.totalAmount || patient.payment?.amount || 0;
    const isCash = patient.payment?.mode === 'Cash';
    const payBadge = isCash 
      ? `<span class="payment-badge cash">💵 Cash: $${totalAmount} (${patient.payment.status})</span>`
      : `<span class="payment-badge insurance">🛡️ ${patient.payment.provider || 'Insurance'}: $${totalAmount}</span>`;

    return `
      <div class="patient-card" data-id="${patient.id}">
        <div>
          <!-- Top Card Row -->
          <div class="card-top">
            <div class="patient-identity">
              <div class="patient-avatar ${avatarClass}">${initials}</div>
              <div class="patient-name-box">
                <h3>${escapeHtml(patient.name)}</h3>
                <div class="patient-meta-row">
                  <span>${patient.mrn}</span>
                  <span>•</span>
                  <span>${escapeHtml(patient.sex || 'Unknown')}</span>
                  <span>•</span>
                  <span style="font-weight:700;">${escapeHtml(patient.age || 'N/A')}</span>
                  ${pretermHtml}
                </div>
              </div>
            </div>
            <span class="status-chip completed">${patient.queueStatus || patient.status}</span>
          </div>

          <!-- Assigned Specialist Room Routing -->
          <div style="margin-bottom:0.6rem;">
            ${doctorTag}
          </div>

          <!-- Allergy Warning Banner if applicable -->
          ${allergyHtml}

          <!-- Vitals Strip with MUAC & Head Circ -->
          <div class="vitals-strip">
            <div class="vital-item">
              <span class="vital-item-label">Weight</span>
              <span class="vital-item-val">${patient.weight ? patient.weight + ' kg' : '--'}</span>
              <span class="vital-gain">${gainStr}</span>
            </div>
            <div class="vital-item">
              <span class="vital-item-label">Length</span>
              <span class="vital-item-val">${patient.height ? patient.height + ' cm' : '--'}</span>
              <span class="vital-item-label">Birth: ${patient.birthWeight ? patient.birthWeight + 'kg' : '--'}</span>
            </div>
            <div class="vital-item">
              <span class="vital-item-label">Head Circ</span>
              <span class="vital-item-val">${patient.headCircumference ? patient.headCircumference + ' cm' : '--'}</span>
              <span class="vital-item-label">Edema: ${patient.edema || 'None'}</span>
            </div>
            <div class="vital-item">
              <span class="vital-item-label">MUAC Triage</span>
              <div style="margin-top:0.15rem;">${muacHtml || '<span style="font-size:0.75rem; color:var(--text-muted);">--</span>'}</div>
            </div>
          </div>

          <!-- Feeding & Velocity Pills -->
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.75rem;">
            <div class="nutrition-tag tag-weaned" style="margin-bottom:0;">
              🍼 ${escapeHtml(patient.breastfeedingStatus || 'Feeding Status N/A')}
            </div>
            <span class="velocity-pill positive" style="margin-bottom:0;">${velocityStr}</span>
          </div>

          <!-- Guardian Contact -->
          <div class="guardian-box">
            <div class="guardian-row">
              <span><strong>Guardian:</strong> ${escapeHtml(patient.guardian?.name || 'N/A')} (${escapeHtml(patient.guardian?.relationship || 'Parent')})</span>
              <span class="guardian-phone">📞 ${escapeHtml(patient.guardian?.phone || 'N/A')}</span>
            </div>
          </div>

          <!-- Clinical Notes / Diagnosis Preview -->
          <div class="notes-preview">
            <strong>Diagnosis / Condition:</strong> ${escapeHtml(condition)}
          </div>
        </div>

        <!-- Card Footer -->
        <div class="card-bottom">
          <div>${payBadge}</div>
          <div class="card-actions">
            <button class="btn btn-secondary btn-sm open-chart-btn" data-id="${patient.id}" title="Open Full Clinical Chart">
              📋 Clinical Chart
            </button>
            <button class="btn btn-primary btn-sm quick-print-btn" data-id="${patient.id}" title="Print Consultation Slip">
              🖨️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Event Listeners for Cards
  document.querySelectorAll('.open-chart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPatientChart(btn.dataset.id);
    });
  });

  document.querySelectorAll('.quick-print-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPatientChart(btn.dataset.id);
      setTimeout(() => window.print(), 300);
    });
  });

  document.querySelectorAll('.patient-card').forEach(card => {
    card.addEventListener('click', () => {
      openPatientChart(card.dataset.id);
    });
  });
}

// ==========================================
// 4. Patient Chart & Detail Dossier
// ==========================================
function openPatientChart(patientId) {
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;
  currentPatientId = patientId;

  // Hero Demographics
  document.getElementById('chartPatientName').textContent = patient.name;
  document.getElementById('chartMRN').textContent = patient.mrn;
  document.getElementById('chartAge').textContent = patient.age;
  document.getElementById('chartSex').textContent = patient.sex;
  document.getElementById('chartStatusBadge').textContent = patient.status;
  document.getElementById('chartAssignedDoctorChip').textContent = `Specialist: Lilian Kathomi`;
  
  const avatarEl = document.getElementById('chartAvatar');
  avatarEl.className = 'chart-avatar ' + (patient.sex === 'Female' ? 'avatar-female' : (patient.sex === 'Male' ? 'avatar-male' : 'avatar-other'));
  avatarEl.textContent = patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Preterm Badge in Chart
  const pretermBadge = document.getElementById('chartPretermBadge');
  if (patient.isPreterm) {
    pretermBadge.textContent = `Ex-${patient.gestationalWeeks}w Preemie (Corrected Age: ${patient.correctedAge || 'N/A'})`;
    pretermBadge.style.display = 'inline-flex';
  } else {
    pretermBadge.style.display = 'none';
  }

  // Allergy Warning Banner
  const allergyBanner = document.getElementById('chartAllergyBanner');
  const allergiesText = document.getElementById('chartAllergiesText');
  const hasAllergy = patient.allergies?.some(a => !a.toLowerCase().includes('no known') && !a.toLowerCase().includes('nkfa'));
  if (hasAllergy) {
    allergyBanner.style.display = 'flex';
    allergiesText.textContent = patient.allergies.join(', ');
  } else {
    allergyBanner.style.display = 'none';
  }

  // Tab 1: Anthropometry & Vitals
  const gain = calculateWeightGain(patient.birthWeight, patient.weight);
  document.getElementById('chartCurrentWeight').textContent = patient.weight ? `${patient.weight} kg` : '--';
  document.getElementById('chartHeight').textContent = patient.height ? `${patient.height} cm` : '--';
  document.getElementById('chartHeadCirc').textContent = patient.headCircumference ? `${patient.headCircumference} cm` : '--';
  document.getElementById('chartWeightGain').textContent = gain ? `${gain.isGain ? '+' : ''}${gain.diffKg} kg (${gain.pct}%)` : 'N/A';
  
  if (patient.muac) {
    const muacRes = evaluateMUAC(patient.muac);
    document.getElementById('chartMUAC').textContent = `${patient.muac} cm`;
    document.getElementById('chartMUACBadge').textContent = muacRes.label;
    document.getElementById('chartMUACBadge').style.color = muacRes.color;
  } else {
    document.getElementById('chartMUAC').textContent = '--';
    document.getElementById('chartMUACBadge').textContent = 'Not Recorded';
  }

  document.getElementById('chartBreastfeedingStatus').textContent = patient.breastfeedingStatus || 'Not Recorded';
  document.getElementById('chartEdemaStatus').textContent = patient.edema || 'None (Normal)';

  // Guardian Details
  document.getElementById('chartGuardianName').textContent = patient.guardian?.name || 'N/A';
  document.getElementById('chartGuardianRel').textContent = patient.guardian?.relationship || 'Parent';
  document.getElementById('chartGuardianPhone').textContent = patient.guardian?.phone || 'N/A';
  document.getElementById('chartGuardianEmail').textContent = patient.guardian?.email || 'N/A';

  // Tabs
  renderVisitsTimeline(patient);
  renderDietaryDiversity(patient);
  renderPrescriptions(patient);
  renderChartAttachments(patient);
  renderItemizedBilling(patient);

  // Print Header Fill
  const latestVisit = patient.visits?.[patient.visits.length - 1] || patient.encounter || {};
  document.getElementById('printPatientName').textContent = patient.name;
  document.getElementById('printMRN').textContent = patient.mrn;
  document.getElementById('printAgeSex').textContent = `${patient.age} / ${patient.sex} ${patient.isPreterm ? '(Preterm Corrected: ' + patient.correctedAge + ')' : ''}`;
  document.getElementById('printDate').textContent = latestVisit.visitDate || new Date().toISOString().split('T')[0];
  document.getElementById('printGuardianInfo').textContent = `${patient.guardian?.name} (${patient.guardian?.relationship}) - ${patient.guardian?.phone}`;
  document.getElementById('printVitalsSummary').textContent = `Weight: ${patient.weight}kg | Length: ${patient.height}cm | MUAC: ${patient.muac || '--'}cm | Head Circ: ${patient.headCircumference || '--'}cm | Edema: ${patient.edema || 'None'}`;
  document.getElementById('printAllergies').textContent = patient.allergies?.join(', ') || 'No known allergies reported';
  document.getElementById('printDiagnosisSummary').textContent = latestVisit.conditionDiagnosed || latestVisit.patientSummary || 'N/A';
  document.getElementById('printManagementSummary').textContent = latestVisit.recommendedManagement || 'N/A';
  document.getElementById('printFollowUpSummary').textContent = latestVisit.followUpDate || 'None scheduled';
  document.getElementById('printDoctorName').textContent = 'Lilian Kathomi, RDN';

  switchChartTab('vitalsTab');
  elements.chartModal.classList.add('active');
}

function renderVisitsTimeline(patient) {
  const container = document.getElementById('chartVisitsTimelineList');
  const visits = patient.visits || (patient.encounter ? [patient.encounter] : []);

  if (visits.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">No recorded visits.</p>`;
    return;
  }

  container.innerHTML = [...visits].reverse().map((v, idx) => {
    const isLatest = idx === 0;
    return `
      <div class="timeline-card" style="${isLatest ? 'border-left: 4px solid var(--primary);' : ''}">
        <div class="timeline-card-header">
          <div>
            <div class="timeline-doctor">Lilian Kathomi, RDN</div>
            <div class="timeline-date">Consultation on ${v.visitDate} ${v.visitTime ? 'at ' + v.visitTime : ''}</div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            ${v.weightVelocity ? `<span class="velocity-pill positive">${escapeHtml(v.weightVelocity)}</span>` : ''}
            <span class="status-chip completed">${isLatest ? 'Latest Encounter' : 'Past Visit'}</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:0.75rem; background:var(--bg-subtle); padding:0.6rem 0.85rem; border-radius:var(--radius-md); margin-bottom:0.75rem; font-size:0.8125rem;">
          <div><span>Recorded Weight:</span> <strong>${v.weight ? v.weight + ' kg' : '--'}</strong></div>
          <div><span>Length:</span> <strong>${v.height ? v.height + ' cm' : '--'}</strong></div>
          <div><span>MUAC:</span> <strong>${v.muac ? v.muac + ' cm' : '--'}</strong></div>
        </div>

        <div class="timeline-section-title">Clinical Summary:</div>
        <div class="timeline-text" style="font-size:0.8125rem; color:var(--text-secondary); margin-bottom:0.5rem;">
          ${escapeHtml(v.patientSummary || 'No summary notes.')}
        </div>

        <div class="timeline-section-title">Condition Diagnosed:</div>
        <div style="font-weight:700; font-size:0.875rem; color:var(--text-main); margin-bottom:0.5rem;">
          ${escapeHtml(v.conditionDiagnosed || 'Outpatient Dietary Audit')}
        </div>

        <div class="timeline-section-title">Prescribed Management:</div>
        <div class="timeline-text" style="background:var(--primary-light); padding:0.75rem; border-radius:var(--radius-md); font-size:0.8125rem;">
          ${escapeHtml(v.recommendedManagement || 'Standard care guidance.')}
        </div>

        ${v.followUpDate ? `
          <div style="margin-top:0.75rem; font-size:0.75rem; color:var(--text-muted);">
            📅 Scheduled Follow-up: <strong>${v.followUpDate}</strong>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function renderDietaryDiversity(patient) {
  const dRecall = patient.dietaryRecall || {};
  const score = dRecall.mddScore || 0;
  
  document.getElementById('chartMDDScoreBadge').textContent = `Score: ${score} / 8 (${score >= 5 ? 'Adequate Diversity' : 'Low Micronutrient Adequacy'})`;
  document.getElementById('chartMDDScoreBadge').className = `status-chip ${score >= 5 ? 'completed' : 'waiting'}`;

  const all8Groups = [
    { name: "1. Breastmilk", icon: "🍼" },
    { name: "2. Grains, roots, tubers", icon: "🌾" },
    { name: "3. Legumes, beans, nuts", icon: "🥜" },
    { name: "4. Dairy (milk, formula, yogurt)", icon: "🧀" },
    { name: "5. Flesh foods (meat, fish, liver)", icon: "🍗" },
    { name: "6. Eggs", icon: "🥚" },
    { name: "7. Vit-A rich fruits & veg", icon: "🥕" },
    { name: "8. Other fruits & vegetables", icon: "🍎" }
  ];

  const consumedGroups = dRecall.foodGroups || [];
  const container = document.getElementById('chartFoodGroupsList');
  
  container.innerHTML = all8Groups.map(fg => {
    const isConsumed = consumedGroups.some(cg => fg.name.toLowerCase().includes(cg.toLowerCase()) || cg.toLowerCase().includes(fg.name.toLowerCase()));
    return `
      <div style="display:flex; align-items:center; gap:0.5rem; padding:0.4rem 0.6rem; border-radius:var(--radius-sm); background:${isConsumed ? 'var(--primary-light)' : 'var(--bg-subtle)'}; color:${isConsumed ? 'var(--primary)' : 'var(--text-muted)'}; font-size:0.8125rem;">
        <span>${isConsumed ? '✅' : '⚪'}</span>
        <span>${fg.icon} ${fg.name}</span>
      </div>
    `;
  }).join('');

  document.getElementById('chartMilkVolumeDisplay').textContent = `${dRecall.dailyMilkVolumeMl || 0} ml/day ${dRecall.dailyMilkVolumeMl > 500 ? '⚠️ (High Risk: Milk Anemia)' : ''}`;
  document.getElementById('chartFeedingDifficultiesDisplay').textContent = dRecall.feedingDifficulties?.join(', ') || 'None reported';
}

function renderPrescriptions(patient) {
  const container = document.getElementById('chartPrescriptionsContainer');
  const rxList = patient.prescriptions || [];

  if (rxList.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.8125rem;">No therapeutic supplements currently prescribed.</p>`;
  } else {
    container.innerHTML = `
      <table class="prescriptions-table">
        <thead>
          <tr>
            <th>Item / Supplement</th>
            <th>Dosage & Instructions</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${rxList.map(rx => `
            <tr>
              <td><strong>💊 ${escapeHtml(rx.item)}</strong></td>
              <td>${escapeHtml(rx.dosage)} <br><span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(rx.instructions || '')}</span></td>
              <td><span class="file-badge">${escapeHtml(rx.duration || 'Ongoing')}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  const latestVisit = patient.visits?.[patient.visits.length - 1] || patient.encounter || {};
  document.getElementById('chartLatestManagementPlan').textContent = latestVisit.recommendedManagement || 'Standard nutritional guidance.';
}

function renderChartAttachments(patient) {
  const container = document.getElementById('chartAttachmentsList');
  if (!patient.attachments || patient.attachments.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <p>No medical or nutritional attachments uploaded for this patient.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = patient.attachments.map(att => `
    <div class="file-row" style="padding: 0.85rem 1rem;">
      <div class="file-info">
        <span style="font-size: 1.5rem;">📄</span>
        <div>
          <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(att.name)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); display:flex; gap:0.5rem; margin-top:0.2rem;">
            <span class="file-badge">${escapeHtml(att.category || 'Record')}</span>
            <span>Size: ${att.size || 'Unknown'}</span>
            <span>Uploaded: ${att.uploadedAt || 'Today'}</span>
          </div>
          ${att.description ? `<div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.25rem;">${escapeHtml(att.description)}</div>` : ''}
        </div>
      </div>
      <div>
        <button class="btn btn-secondary btn-sm preview-attachment-btn" data-att-id="${att.id}">
          🔍 View Record
        </button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.preview-attachment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const attId = btn.dataset.attId;
      const att = patient.attachments.find(a => a.id === attId);
      if (att) openDocViewer(att);
    });
  });
}

function renderItemizedBilling(patient) {
  const isCash = patient.payment?.mode === 'Cash';
  const container = document.getElementById('chartBillingDetails');
  const consultFee = patient.payment?.consultationFee || 40.00;
  const suppFee = patient.payment?.supplementsFee || 0.00;
  const total = patient.payment?.totalAmount || (consultFee + suppFee);

  container.innerHTML = `
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
      <div class="stat-card" style="padding: 1rem;">
        <div class="stat-info">
          <span class="stat-label">Payment Mode</span>
          <span class="stat-value" style="font-size: 1.3rem;">${isCash ? '💵 Cash' : '🛡️ Insurance'}</span>
          <span class="stat-subtext">Status: <strong>${patient.payment?.status || 'Paid'}</strong></span>
        </div>
      </div>
      <div class="stat-card" style="padding: 1rem;">
        <div class="stat-info">
          <span class="stat-label">Consultation Fee</span>
          <span class="stat-value" style="font-size: 1.3rem;">$${consultFee.toFixed(2)}</span>
          <span class="stat-subtext">Clinical review</span>
        </div>
      </div>
      <div class="stat-card" style="padding: 1rem;">
        <div class="stat-info">
          <span class="stat-label">Total Outpatient Bill</span>
          <span class="stat-value" style="font-size: 1.3rem; color:var(--primary);">$${total.toFixed(2)}</span>
          <span class="stat-subtext">Includes $${suppFee.toFixed(2)} supplements</span>
        </div>
      </div>
    </div>

    <div class="timeline-card">
      <div style="font-size:0.8125rem; margin-bottom:0.5rem;">
        <strong>Diagnostic Coding (ICD-10):</strong> ${escapeHtml(patient.payment?.icd10 || 'Z76.2 - Health supervision')}
      </div>
      <div style="font-size:0.8125rem; color:var(--text-muted);">
        Receipt / Claim Reference: <strong>${patient.payment?.receiptNumber || 'RCP-PENDING'}</strong> | Paid at: ${patient.payment?.paidAt || 'Today'}
      </div>
    </div>

    ${!isCash ? `
      <div class="timeline-card">
        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--primary); margin-bottom: 0.75rem;">Insurance Pre-Authorization Dossier</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; font-size: 0.8125rem;">
          <div><span style="color:var(--text-muted); display:block;">Provider:</span> <strong>${escapeHtml(patient.payment?.provider || 'N/A')}</strong></div>
          <div><span style="color:var(--text-muted); display:block;">Policy / Member ID:</span> <strong>${escapeHtml(patient.payment?.policyNumber || 'N/A')}</strong></div>
          <div><span style="color:var(--text-muted); display:block;">Pre-Auth Approval:</span> <strong>${escapeHtml(patient.payment?.authCode || 'APPROVED')}</strong></div>
        </div>
      </div>
    ` : ''}
  `;
}

function switchChartTab(targetTabId) {
  elements.chartTabsNav.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === targetTabId);
  });
  elements.chartTabContents.forEach(content => {
    content.classList.toggle('active', content.id === targetTabId);
  });
}

// ==========================================
// 5. Follow-up Encounter & Referral
// ==========================================
function openFollowUpModal() {
  const patient = patients.find(p => p.id === currentPatientId);
  if (!patient) return;

  elements.followUpForm.reset();
  document.getElementById('fuVisitDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('fuWeight').value = patient.weight || '';
  document.getElementById('fuHeight').value = patient.height || '';
  document.getElementById('fuMUAC').value = patient.muac || '';
  
  elements.followUpModal.classList.add('active');
}

function handleFollowUpSubmit(e) {
  e.preventDefault();
  const patient = patients.find(p => p.id === currentPatientId);
  if (!patient) return;

  const date = document.getElementById('fuVisitDate').value;
  const newWeight = parseFloat(document.getElementById('fuWeight').value);
  const newHeight = parseFloat(document.getElementById('fuHeight').value) || patient.height;
  const newMUAC = parseFloat(document.getElementById('fuMUAC').value) || patient.muac;
  const fuDate = document.getElementById('fuFollowUpDate').value;
  const summary = document.getElementById('fuSummary').value.trim();
  const management = document.getElementById('fuManagement').value.trim();

  const prevWeight = patient.weight;
  let velocityText = 'Follow-up visit';
  if (prevWeight && newWeight) {
    const diffGrams = (newWeight - prevWeight) * 1000;
    const sign = diffGrams >= 0 ? '+' : '';
    velocityText = `${sign}${diffGrams.toFixed(0)}g overall (${sign}${(diffGrams / 14).toFixed(1)}g/day velocity)`;
  }

  const newVisit = {
    id: `v-${Date.now().toString(36)}`,
    visitDate: date,
    visitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    weight: newWeight,
    height: newHeight,
    muac: newMUAC,
    nutritionistName: 'Lilian Kathomi',
    patientSummary: summary,
    conditionDiagnosed: patient.visits?.[patient.visits.length - 1]?.conditionDiagnosed || 'Outpatient Dietary Progress',
    recommendedManagement: management,
    followUpDate: fuDate,
    weightVelocity: velocityText
  };

  if (!patient.visits) patient.visits = [];
  patient.visits.push(newVisit);

  patient.weight = newWeight;
  patient.height = newHeight;
  patient.muac = newMUAC;

  savePatients();
  elements.followUpModal.classList.remove('active');
  openPatientChart(patient.id);
  renderDashboard();

  showToast(`Logged follow-up visit for ${patient.name}! Growth velocity calculated.`);
}

function openReferralLetterModal() {
  const patient = patients.find(p => p.id === currentPatientId);
  if (!patient) return;

  updateReferralLetterText();
  elements.referralModal.classList.add('active');
}

function updateReferralLetterText() {
  const patient = patients.find(p => p.id === currentPatientId);
  if (!patient) return;
  const dept = elements.referralSpecialistSelect.value;
  const latestVisit = patient.visits?.[patient.visits.length - 1] || patient.encounter || {};

  const letter = 
`CLINICAL OUTPATIENT REFERRAL LETTER
NutriCare Pediatric & Clinical Nutrition Outpatient Center
Nairobi, Kenya | Tel: +254 700 000 000 | outpatient@nutricare.med
Date: ${new Date().toISOString().split('T')[0]}

TO: Attending Specialist, Department of ${dept}
FROM: Lilian Kathomi, RDN (Pediatric Nutritionist & Specialist)

RE: Formal Clinical Referral for Patient Evaluation
Patient: ${patient.name}
MRN: ${patient.mrn} | Age: ${patient.age} (${patient.isPreterm ? 'Ex-' + patient.gestationalWeeks + 'w Preterm, Corrected Age: ' + patient.correctedAge : 'Full Term'})
Sex: ${patient.sex} | Guardian: ${patient.guardian?.name} (${patient.guardian?.phone})

1. ALLERGIES & CLINICAL SAFETY FLAGS:
${patient.allergies?.join(', ') || 'No known allergies reported.'}

2. CURRENT ANTHROPOMETRIC PARAMETERS:
- Current Weight: ${patient.weight} kg (Birth Weight: ${patient.birthWeight} kg)
- Length / Height: ${patient.height} cm
- MUAC: ${patient.muac || '--'} cm (${evaluateMUAC(patient.muac)?.label || 'Normal'})
- Head Circumference: ${patient.headCircumference || '--'} cm
- Bilateral Nutritional Edema: ${patient.edema || 'None'}

3. CLINICAL SUMMARY & NUTRITIONAL PRESENTATION:
${latestVisit.patientSummary || 'Patient undergoing outpatient nutritional evaluation with Lilian Kathomi.'}

4. PROVISIONAL CLINICAL DIAGNOSIS:
${latestVisit.conditionDiagnosed || 'Nutritional faltering / Gastrointestinal intolerance'}

5. REASON FOR SPECIALIST REFERRAL:
We kindly request your specialized multidisciplinary evaluation regarding ${dept.toLowerCase()} management, diagnostic exclusion, and therapeutic coordination.

Sincerely,
Lilian Kathomi, RDN
Licensed Pediatric Nutrition Specialist | Medical Board Reg #MED-PED-881`;

  elements.referralLetterContent.textContent = letter;
}

// ==========================================
// 6. Patient Intake Form (Doctor or Reception)
// ==========================================
function openIntakeModal() {
  elements.intakeForm.reset();
  pendingFiles = [];
  renderPendingFiles();
  setPaymentMode('Cash');
  elements.growthBanner.style.display = 'none';
  elements.pretermDetailsRow.style.display = 'none';
  elements.muacTriageTag.style.display = 'none';
  updateMDDScore();
  updateBillingTotals();

  // Always assigned to Lilian Kathomi
  if (elements.assignedSpecialist) {
    elements.assignedSpecialist.value = 'spec-lilian';
  }
  document.getElementById('nutritionistName').value = 'Lilian Kathomi';

  document.getElementById('visitDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('visitTime').value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  elements.intakeModal.classList.add('active');
}

function closeIntakeModal() {
  elements.intakeModal.classList.remove('active');
}

function setPaymentMode(mode) {
  elements.paymentModeInput.value = mode;
  if (mode === 'Cash') {
    elements.btnPaymentCash.classList.add('active');
    elements.btnPaymentInsurance.classList.remove('active');
    elements.insuranceFieldsGroup.style.display = 'none';
  } else {
    elements.btnPaymentInsurance.classList.add('active');
    elements.btnPaymentCash.classList.remove('active');
    elements.insuranceFieldsGroup.style.display = 'grid';
  }
}

function renderPendingFiles() {
  if (pendingFiles.length === 0) {
    elements.uploadedFilesContainer.innerHTML = '';
    return;
  }

  elements.uploadedFilesContainer.innerHTML = pendingFiles.map((file, idx) => `
    <div class="file-row">
      <div class="file-info">
        <span>📎</span>
        <div>
          <strong>${escapeHtml(file.name)}</strong>
          <span class="file-badge">${escapeHtml(file.category)}</span>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${file.size}</span>
        </div>
      </div>
      <button type="button" class="btn btn-danger-outline btn-sm remove-file-btn" data-index="${idx}">
        Remove
      </button>
    </div>
  `).join('');

  elements.uploadedFilesContainer.querySelectorAll('.remove-file-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      pendingFiles.splice(idx, 1);
      renderPendingFiles();
    });
  });
}

function handleIntakeSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('patientName').value.trim();
  const sex = document.getElementById('patientSex').value;
  const age = document.getElementById('patientAge').value.trim();
  const isPreterm = elements.patientIsPreterm.checked;
  const gestationalWeeks = isPreterm ? parseInt(elements.patientGestationalWeeks.value, 10) : null;
  const correctedAge = isPreterm ? elements.patientCorrectedAge.value : null;

  // Always Lilian Kathomi
  const assignedDoctorId = 'spec-lilian';
  const assignedDoctorName = 'Lilian Kathomi';
  const apptTime = elements.appointmentTime.value.trim() || '10:00 AM';

  // Safety
  const allergiesRaw = document.getElementById('patientAllergies').value.trim();
  const allergies = allergiesRaw ? allergiesRaw.split(',').map(s => s.trim()) : ['No known food allergies (NKFA)'];
  const currentMedsRaw = document.getElementById('patientCurrentMeds').value.trim();
  const currentMedications = currentMedsRaw ? [currentMedsRaw] : ['None'];

  // Anthropometry
  const weight = parseFloat(document.getElementById('patientWeight').value) || null;
  const height = parseFloat(document.getElementById('patientHeight').value) || null;
  const birthWeight = parseFloat(document.getElementById('patientBirthWeight').value) || null;
  const muac = parseFloat(document.getElementById('patientMUAC').value) || null;
  const headCirc = parseFloat(document.getElementById('patientHeadCirc').value) || null;
  const edema = document.getElementById('patientEdema').value;
  const breastfeedingStatus = document.getElementById('breastfeedingStatus').value;

  // Dietary Recall
  const dailyMilkVolume = parseFloat(document.getElementById('dailyMilkVolume').value) || 0;
  const dailyFluid = parseFloat(document.getElementById('dailyFluidIntake').value) || 0;
  const feedingDifficulties = document.getElementById('feedingDifficultiesInput').value.trim();
  
  const selectedFoodGroups = [];
  elements.foodGroupCheckboxes.forEach(cb => {
    if (cb.checked) selectedFoodGroups.push(cb.value);
  });

  // Guardian
  const guardianName = document.getElementById('guardianName').value.trim();
  const guardianRel = document.getElementById('guardianRelationship').value;
  const guardianPhone = document.getElementById('guardianPhone').value.trim();

  // Clinical Encounter
  const visitDate = document.getElementById('visitDate').value || new Date().toISOString().split('T')[0];
  const visitTime = document.getElementById('visitTime').value || '10:00 AM';
  const nutritionistName = 'Lilian Kathomi';
  const patientSummary = document.getElementById('patientSummary').value.trim();
  const conditionDiagnosed = document.getElementById('conditionDiagnosed').value.trim() || 'Outpatient Dietary Consultation';
  const recommendedManagement = document.getElementById('recommendedManagement').value.trim();
  const followUpDate = document.getElementById('followUpDate').value;

  // Prescriptions
  const rxName = document.getElementById('rxItemName').value.trim();
  const rxDosage = document.getElementById('rxDosage').value.trim();
  const rxDuration = document.getElementById('rxDuration').value.trim();
  const prescriptions = [];
  if (rxName) {
    prescriptions.push({ item: rxName, dosage: rxDosage || 'As directed', duration: rxDuration || '4 weeks', instructions: 'Oral administration' });
  }

  // Billing
  const payMode = elements.paymentModeInput.value;
  const consultFee = parseFloat(elements.consultationFee.value) || 40.00;
  const suppFee = parseFloat(elements.supplementsFee.value) || 0.00;
  const total = consultFee + suppFee;
  const icd10 = document.getElementById('icd10Code').value;
  const provider = document.getElementById('insuranceProvider').value.trim();
  const policyNo = document.getElementById('insurancePolicyNumber').value.trim();
  const authCode = document.getElementById('insuranceAuthCode').value.trim();

  const newMRN = `NP-2026-${String(patients.length + 1).padStart(3, '0')}`;
  const newId = `pat-${Date.now().toString(36)}`;

  const newPatient = {
    id: newId,
    mrn: newMRN,
    createdAt: new Date().toISOString(),
    status: 'Completed',
    queueStatus: 'Scheduled / Waiting',
    assignedSpecialistId: assignedDoctorId,
    assignedSpecialistName: assignedDoctorName,
    appointmentTime: apptTime,
    name,
    sex,
    age,
    isPreterm,
    gestationalWeeks,
    correctedAge,
    birthWeight,
    allergies,
    currentMedications,
    weight,
    height,
    muac,
    headCircumference: headCirc,
    edema,
    breastfeedingStatus,
    guardian: {
      name: guardianName,
      relationship: guardianRel,
      phone: guardianPhone,
      email: 'parent@example.com',
      residence: 'Local Residence'
    },
    dietaryRecall: {
      dailyMilkVolumeMl: dailyMilkVolume,
      fluidIntakeMl: dailyFluid,
      mddScore: selectedFoodGroups.length,
      foodGroups: selectedFoodGroups,
      feedingDifficulties: feedingDifficulties ? [feedingDifficulties] : []
    },
    prescriptions,
    payment: {
      mode: payMode,
      provider: payMode === 'Insurance' ? provider : null,
      policyNumber: payMode === 'Insurance' ? policyNo : null,
      authCode: payMode === 'Insurance' ? (authCode || 'AUTH-' + Math.floor(1000 + Math.random() * 9000)) : null,
      icd10,
      consultationFee: consultFee,
      supplementsFee: suppFee,
      totalAmount: total,
      currency: 'USD',
      status: 'Paid',
      receiptNumber: `RCP-2026-${Math.floor(100 + Math.random() * 900)}`,
      paidAt: new Date().toLocaleString()
    },
    visits: [
      {
        id: `v-${Date.now().toString(36)}`,
        visitDate,
        visitTime,
        weight,
        height,
        muac,
        nutritionistName: 'Lilian Kathomi',
        patientSummary,
        conditionDiagnosed,
        recommendedManagement,
        followUpDate,
        weightVelocity: 'Initial Consultation'
      }
    ],
    attachments: [...pendingFiles]
  };

  patients.unshift(newPatient);
  savePatients();
  renderDashboard();
  closeIntakeModal();

  showToast(`Patient ${name} registered & scheduled for Lilian Kathomi!`);
}

// ==========================================
// 7. Document Viewer & Handlers
// ==========================================
function openDocViewer(attachment) {
  currentPreviewAttachment = attachment;
  elements.docViewerTitle.textContent = attachment.name;
  elements.docViewerBadge.textContent = attachment.category || 'Clinical Document';
  
  const contentText = attachment.previewText || 
`CLINICAL DOCUMENT AUDIT
File: ${attachment.name}
Category: ${attachment.category || 'General Attachment'}
Uploaded: ${attachment.uploadedAt || 'Current Session'}
Size: ${attachment.size || 'N/A'}

[Document contents verified by Pediatric Nutrition Outpatient Registry]`;

  elements.docViewerContent.textContent = contentText;
  elements.docViewerModal.classList.add('active');
}

function handleSelectedFiles(fileList) {
  const category = elements.attachmentCategorySelect.value;
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const sizeKB = (file.size / 1024).toFixed(0);
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    pendingFiles.push({
      id: `att-${Date.now()}-${i}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: sizeStr,
      category: category,
      uploadedAt: new Date().toISOString().split('T')[0],
      description: `Uploaded record for ${category}`,
      previewText: `CLINICAL DOCUMENT PREVIEW\nFile: ${file.name}\nCategory: ${category}\nSize: ${sizeStr}\nProcessed into outpatient chart.`
    });
  }
  renderPendingFiles();
  showToast(`Added ${fileList.length} attachment(s)`);
}

function setupEventListeners() {
  // Login & Role Switcher
  elements.userProfileBtn.addEventListener('click', () => elements.loginOverlay.classList.add('active'));
  elements.switchUserBtn.addEventListener('click', () => elements.loginOverlay.classList.add('active'));

  elements.roleOptionCards.forEach(card => {
    card.addEventListener('click', () => {
      const roleId = card.dataset.roleId;
      loginAsUser(roleId);
    });
  });

  elements.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = elements.loginEmail.value.trim().toLowerCase();
    const matched = CLINICAL_USERS.find(u => u.username.toLowerCase() === email);
    if (matched) {
      loginAsUser(matched.id);
    } else {
      loginAsUser('spec-lilian');
    }
  });

  // Doctor Scope Switcher: [ Scheduled for Lilian (X) ] vs [ All Registered Patients (Y) ]
  elements.btnScopeMyPatients.addEventListener('click', () => {
    specialistScope = 'my';
    elements.btnScopeMyPatients.classList.add('active');
    elements.btnScopeAllPatients.classList.remove('active');
    elements.queueSectionTitle.textContent = 'Scheduled Outpatients for Lilian Kathomi';
    renderDashboard();
  });

  elements.btnScopeAllPatients.addEventListener('click', () => {
    specialistScope = 'all';
    elements.btnScopeAllPatients.classList.add('active');
    elements.btnScopeMyPatients.classList.remove('active');
    elements.queueSectionTitle.textContent = 'All Registered Clinic Patients';
    renderDashboard();
  });

  // Theme & Reset
  elements.themeToggleBtn.addEventListener('click', toggleTheme);
  if (elements.resetDemoBtn2) elements.resetDemoBtn2.addEventListener('click', resetToDemoData);

  // Search
  elements.searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderPatientList();
  });

  // Filter Buttons
  elements.filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderPatientList();
    });
  });

  // Intake Modal (Doctor Lilian Kathomi or Reception can enter data)
  elements.openIntakeBtn.addEventListener('click', openIntakeModal);
  elements.closeIntakeBtn.addEventListener('click', closeIntakeModal);
  elements.cancelIntakeBtn.addEventListener('click', closeIntakeModal);
  elements.intakeForm.addEventListener('submit', handleIntakeSubmit);

  // Preterm calculation
  elements.patientIsPreterm.addEventListener('change', calculateCorrectedAge);
  elements.patientGestationalWeeks.addEventListener('input', calculateCorrectedAge);
  elements.patientAge.addEventListener('input', calculateCorrectedAge);

  // Anthropometry live calculations
  elements.inputWeight.addEventListener('input', updateLiveAnthropometry);
  elements.inputHeight.addEventListener('input', updateLiveAnthropometry);
  elements.inputBirthWeight.addEventListener('input', updateLiveAnthropometry);
  elements.inputMUAC.addEventListener('input', updateLiveAnthropometry);

  // MDD Checklist
  elements.foodGroupCheckboxes.forEach(cb => cb.addEventListener('change', updateMDDScore));

  // Billing live calculations
  elements.consultationFee.addEventListener('input', updateBillingTotals);
  elements.supplementsFee.addEventListener('input', updateBillingTotals);
  elements.btnPaymentCash.addEventListener('click', () => setPaymentMode('Cash'));
  elements.btnPaymentInsurance.addEventListener('click', () => setPaymentMode('Insurance'));

  // Allergy preset chips
  document.querySelectorAll('.chip-allergy').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('patientAllergies');
      const val = chip.dataset.val;
      if (input.value === 'No known food allergies (NKFA)' || input.value === '') {
        input.value = val;
      } else if (!input.value.includes(val)) {
        input.value += `, ${val}`;
      }
      showToast(`Added allergy tag: ${val}`);
    });
  });

  // Preset Diagnosis Chips
  document.querySelectorAll('.preset-chip:not(.chip-allergy)').forEach(chip => {
    chip.addEventListener('click', () => {
      const summaryArea = document.getElementById('patientSummary');
      const diagArea = document.getElementById('conditionDiagnosed');
      const mgmtArea = document.getElementById('recommendedManagement');
      const text = chip.dataset.text;
      const mgmt = chip.dataset.mgmt;

      if (text) {
        diagArea.value = text;
        summaryArea.value = `Patient presenting with ${text.toLowerCase()}. Clinical triage completed by Lilian Kathomi.`;
      }
      if (mgmt) mgmtArea.value = mgmt;
      showToast(`Loaded clinical preset: "${text}"`);
    });
  });

  // File Upload Handlers
  elements.dropzone.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', (e) => handleSelectedFiles(e.target.files));
  elements.dropzone.addEventListener('dragover', (e) => { e.preventDefault(); elements.dropzone.style.borderColor = 'var(--primary)'; });
  elements.dropzone.addEventListener('dragleave', () => elements.dropzone.style.borderColor = 'var(--border-color)');
  elements.dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropzone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectedFiles(e.dataTransfer.files);
    }
  });

  // Chart Modal
  elements.closeChartBtn.addEventListener('click', () => elements.chartModal.classList.remove('active'));
  elements.chartTabsNav.forEach(btn => btn.addEventListener('click', () => switchChartTab(btn.dataset.tab)));
  elements.printSummaryBtn.addEventListener('click', () => window.print());

  // Follow-up Modal
  elements.openFollowUpBtn.addEventListener('click', openFollowUpModal);
  elements.timelineAddVisitBtn.addEventListener('click', openFollowUpModal);
  elements.closeFollowUpBtn.addEventListener('click', () => elements.followUpModal.classList.remove('active'));
  elements.cancelFollowUpBtn.addEventListener('click', () => elements.followUpModal.classList.remove('active'));
  elements.followUpForm.addEventListener('submit', handleFollowUpSubmit);

  // Referral Modal
  elements.openReferralBtn.addEventListener('click', openReferralLetterModal);
  elements.closeReferralBtn.addEventListener('click', () => elements.referralModal.classList.remove('active'));
  elements.referralSpecialistSelect.addEventListener('change', updateReferralLetterText);
  elements.copyReferralBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(elements.referralLetterContent.textContent);
    showToast('Referral letter copied to clipboard!');
  });

  // Doc Viewer Modal
  elements.closeDocViewerBtn.addEventListener('click', () => elements.docViewerModal.classList.remove('active'));
  elements.docDownloadBtn.addEventListener('click', () => {
    if (currentPreviewAttachment) showToast(`Simulated download: ${currentPreviewAttachment.name}`);
  });

  // Backdrop clicks
  window.addEventListener('click', (e) => {
    if (e.target === elements.intakeModal) closeIntakeModal();
    if (e.target === elements.chartModal) elements.chartModal.classList.remove('active');
    if (e.target === elements.followUpModal) elements.followUpModal.classList.remove('active');
    if (e.target === elements.referralModal) elements.referralModal.classList.remove('active');
    if (e.target === elements.docViewerModal) elements.docViewerModal.classList.remove('active');
  });
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
  elements.themeToggleBtn.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  elements.themeToggleBtn.textContent = saved === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🩺</span> <span>${escapeHtml(message)}</span>`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.addEventListener('DOMContentLoaded', initApp);
