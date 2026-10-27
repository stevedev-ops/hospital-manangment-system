// app.js - Clinical Outpatient EMR with 1 Reception & 1 Specialist (Lilian Kathomi)
import { INITIAL_PATIENTS, CLINICAL_USERS } from './mockData.js';

// Application State
const STORAGE_KEY = 'nutricare_clinical_patients_v4_lilian';
const USER_KEY = 'nutricare_active_user_id_v4';
const THEME_KEY = 'nutricare_theme_mode';

let patients = [];
let currentUser = null;
let specialistScope = 'my'; // 'my' | 'all'
let dietFilter = 'all'; // 'all' | 'exclusive-bf' | 'mixed-bf' | 'weaned'
let paymentFilter = 'all'; // 'all' | 'cash' | 'insurance'
let currentAlterPatientId = null;
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
  logoutBtn: document.getElementById('logoutBtn'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  userProfileModal: document.getElementById('userProfileModal'),
  closeUserProfileBtn: document.getElementById('closeUserProfileBtn'),
  cancelUserProfileBtn: document.getElementById('cancelUserProfileBtn'),
  modalLogoutBtn: document.getElementById('modalLogoutBtn'),
  modalUserName: document.getElementById('modalUserName'),
  modalUserRole: document.getElementById('modalUserRole'),
  modalUserDept: document.getElementById('modalUserDept'),
  modalUserStation: document.getElementById('modalUserStation'),
  modalUserAvatar: document.getElementById('modalUserAvatar'),
  navUserAvatar: document.getElementById('sidebarUserAvatar'),
  navUserName: document.getElementById('sidebarUserName'),
  navRoleTag: document.getElementById('sidebarRoleTag'),

  // Sidebar & Layout Controls
  appSidebar: document.getElementById('appSidebar'),
  sidebarBackdrop: document.getElementById('sidebarBackdrop'),
  mobileSidebarToggle: document.getElementById('mobileSidebarToggle'),
  sidebarUserCard: document.getElementById('userProfileBtn'),
  sidebarUserAvatar: document.getElementById('sidebarUserAvatar'),
  sidebarUserName: document.getElementById('sidebarUserName'),
  sidebarRoleTag: document.getElementById('sidebarRoleTag'),
  sidebarThemeText: document.getElementById('sidebarThemeText'),
  navBadgePatients: document.getElementById('navBadgePatients'),
  navBadgeRisk: document.getElementById('navBadgeRisk'),
  launchIntakeBtn: document.getElementById('launchIntakeBtn'),

  // Analytics View
  analyticsMuacList: document.getElementById('analyticsMuacList'),
  analyticsAllergyList: document.getElementById('analyticsAllergyList'),
  analyticsFeedingList: document.getElementById('analyticsFeedingList'),

  // Billing View
  billingTotalGross: document.getElementById('billingTotalGross'),
  billingTotalCash: document.getElementById('billingTotalCash'),
  billingTotalInsurance: document.getElementById('billingTotalInsurance'),
  billingInsuranceRatio: document.getElementById('billingInsuranceRatio'),
  billingTableBody: document.getElementById('billingTableBody'),

  // Supplements View
  supplementsTableBody: document.getElementById('supplementsTableBody'),

  // Referrals Hub View
  hubPatientSelect: document.getElementById('hubPatientSelect'),
  hubSpecialistSelect: document.getElementById('hubSpecialistSelect'),
  hubReferralLetterContent: document.getElementById('hubReferralLetterContent'),
  hubPrintReferralBtn: document.getElementById('hubPrintReferralBtn'),
  hubCopyReferralBtn: document.getElementById('hubCopyReferralBtn'),
  
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
  toastContainer: document.getElementById('toastContainer'),

  // Clinical Filter Bar
  filterSegmentedGroup: document.getElementById('filterSegmentedGroup'),
  filterDietSelect: document.getElementById('filterDietSelect'),
  filterPaymentSelect: document.getElementById('filterPaymentSelect'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),

  // Alter Encounter Modal
  alterEncounterModal: document.getElementById('alterEncounterModal'),
  alterEncounterForm: document.getElementById('alterEncounterForm'),
  closeAlterModalBtn: document.getElementById('closeAlterModalBtn'),
  cancelAlterBtn: document.getElementById('cancelAlterBtn'),
  alterPatientId: document.getElementById('alterPatientId'),
  alterPatientName: document.getElementById('alterPatientName'),
  alterPatientMRN: document.getElementById('alterPatientMRN'),
  alterCurrentBilled: document.getElementById('alterCurrentBilled'),
  alterPaymentMode: document.getElementById('alterPaymentMode'),
  alterProceduresCount: document.getElementById('alterProceduresCount'),
  alterExistingProceduresBox: document.getElementById('alterExistingProceduresBox'),
  alterExistingProceduresList: document.getElementById('alterExistingProceduresList'),
  alterProcedurePreset: document.getElementById('alterProcedurePreset'),
  alterProcedureName: document.getElementById('alterProcedureName'),
  alterProcedureFee: document.getElementById('alterProcedureFee'),
  alterProcedureNotes: document.getElementById('alterProcedureNotes'),
  alterConditionDiagnosed: document.getElementById('alterConditionDiagnosed'),
  alterRecommendedManagement: document.getElementById('alterRecommendedManagement'),
  chartAlterEncounterBtn: document.getElementById('chartAlterEncounterBtn'),

  // Schedule View
  scheduleBlocksContainer: document.getElementById('scheduleBlocksContainer')
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
  showToast(`Authenticated as ${currentUser.name} (${currentUser.roleTitle}). Workstation active.`);
}


function handleLogout() {
  if (typeof closeIntakeModal === 'function') closeIntakeModal();
  if (typeof closeChartModal === 'function') closeChartModal();
  if (typeof closeFollowUpModal === 'function') closeFollowUpModal();
  if (typeof closeReferralModal === 'function') closeReferralModal();
  if (elements.userProfileModal) elements.userProfileModal.classList.remove('active');
  
  elements.loginOverlay.classList.add('active');
  showToast('Workstation session closed. Logged out successfully.');
}

function openUserProfileModal() {
  if (!elements.userProfileModal) return;
  elements.modalUserName.textContent = currentUser.name;
  elements.modalUserRole.textContent = currentUser.roleTitle;
  elements.modalUserDept.textContent = currentUser.department;
  elements.modalUserStation.textContent = currentUser.station || (currentUser.role === 'reception' ? 'Main Admissions Desk 01' : 'Consultation Suite 04 (Pediatric Wing)');
  elements.modalUserAvatar.textContent = currentUser.avatar;
  elements.userProfileModal.classList.add('active');
}

function closeUserProfileModal() {
  if (elements.userProfileModal) elements.userProfileModal.classList.remove('active');
}

function renderSidebarNav() {
  const navContainer = document.querySelector('.sidebar-nav');
  if (!navContainer) return;

  const isReception = currentUser?.role === 'reception';
  const waitingCount = patients.filter(p => p.queueStatus === 'Waiting' || p.queueStatus === 'Checked In').length;
  const lilianCount = patients.filter(p => p.assignedSpecialistId === 'spec-lilian').length;
  const criticalCount = patients.filter(p => (p.muac && p.muac < 12.5) || (p.allergies && p.allergies.some(a => !a.toLowerCase().includes('no known')))).length;

  if (isReception) {
    // Receptionist / Front Desk Menu
    navContainer.innerHTML = `
      <div class="sidebar-section-label">Admissions & Front Desk</div>

      <button class="nav-item ${currentView === 'patients' ? 'active' : ''}" data-view="patients" onclick="switchView('patients')" id="navItemPatients">
        <span class="nav-item-icon">📋</span>
        <span class="nav-item-label">Admissions & Queue</span>
        <span class="nav-item-badge ${waitingCount > 0 ? 'danger' : ''}">${waitingCount > 0 ? waitingCount + ' Waiting' : patients.length}</span>
      </button>

      <button class="nav-item ${currentView === 'schedule' ? 'active' : ''}" data-view="schedule" onclick="switchView('schedule')" id="navItemSchedule">
        <span class="nav-item-icon">📅</span>
        <span class="nav-item-label">Clinic Appointments</span>
        <span class="nav-item-badge" style="background:var(--secondary); color:#fff;">Dr. Lilian</span>
      </button>

      <button class="nav-item ${currentView === 'billing' ? 'active' : ''}" data-view="billing" onclick="switchView('billing')" id="navItemBilling">
        <span class="nav-item-icon">💳</span>
        <span class="nav-item-label">Cashier & Collections</span>
      </button>

      <div class="sidebar-section-label" style="margin-top: 0.75rem;">Patient Administration</div>

      <button class="nav-item ${currentView === 'intake' ? 'active' : ''}" data-view="intake" onclick="switchView('intake')" id="navItemIntake">
        <span class="nav-item-icon">🩺</span>
        <span class="nav-item-label">New Patient Intake</span>
      </button>
    `;
  } else {
    // Dr. Lilian Kathomi (Pediatrician & Specialist) Menu
    navContainer.innerHTML = `
      <div class="sidebar-section-label">Clinical Consultation Suite</div>

      <button class="nav-item ${currentView === 'patients' ? 'active' : ''}" data-view="patients" onclick="switchView('patients')" id="navItemPatients">
        <span class="nav-item-icon">🩺</span>
        <span class="nav-item-label">Scheduled Outpatients</span>
        <span class="nav-item-badge" id="navBadgePatients">${lilianCount}</span>
      </button>

      <button class="nav-item ${currentView === 'analytics' ? 'active' : ''}" data-view="analytics" onclick="switchView('analytics')" id="navItemAnalytics">
        <span class="nav-item-icon">📊</span>
        <span class="nav-item-label">Malnutrition & Triage</span>
        ${criticalCount > 0 ? `<span class="nav-item-badge danger">${criticalCount} Alert</span>` : ''}
      </button>

      <button class="nav-item ${currentView === 'billing' ? 'active' : ''}" data-view="billing" onclick="switchView('billing')" id="navItemBilling">
        <span class="nav-item-icon">💳</span>
        <span class="nav-item-label">Doctor Billing & Add-ons</span>
      </button>

      <div class="sidebar-section-label" style="margin-top: 0.75rem;">Prescriptions & Referrals</div>

      <button class="nav-item ${currentView === 'supplements' ? 'active' : ''}" data-view="supplements" onclick="switchView('supplements')" id="navItemSupplements">
        <span class="nav-item-icon">💊</span>
        <span class="nav-item-label">Therapeutic Formulas</span>
      </button>

      <button class="nav-item ${currentView === 'referrals' ? 'active' : ''}" data-view="referrals" onclick="switchView('referrals')" id="navItemReferrals">
        <span class="nav-item-icon">📨</span>
        <span class="nav-item-label">Specialist Referrals</span>
      </button>

      <button class="nav-item ${currentView === 'intake' ? 'active' : ''}" data-view="intake" onclick="switchView('intake')" id="navItemIntake">
        <span class="nav-item-icon">🩺</span>
        <span class="nav-item-label">New Intake Suite</span>
      </button>
    `;
  }
}

function applyUserPortal() {
  const isReception = currentUser?.role === 'reception';

  // Update Sidebar user card
  if (elements.sidebarUserAvatar) elements.sidebarUserAvatar.textContent = currentUser.avatar;
  if (elements.sidebarUserName) elements.sidebarUserName.textContent = currentUser.name;
  if (elements.sidebarRoleTag) {
    elements.sidebarRoleTag.textContent = isReception ? 'Front Desk Admissions' : 'Pediatric Specialist';
    elements.sidebarRoleTag.className = `role-tag ${isReception ? 'role-reception' : 'role-specialist'}`;
  }

  // Workstation Title & Banners
  if (isReception) {
    elements.portalTitleText.textContent = 'Central Outpatient Admissions & Front Desk';
    elements.portalSubtitle.textContent = 'Front Desk Workstation • Patient Registration, Check-in, Queue Triage & Cash/Insurance Fee Collection';
    elements.scopeToggleGroup.style.display = 'none';
    elements.queueSectionTitle.textContent = 'Central Outpatient Admissions Queue';
    elements.openIntakeBtn.innerHTML = '<span>+</span> Register & Check-In Patient';
  } else {
    elements.portalTitleText.textContent = "Dr. Lilian Kathomi's Consultation Suite";
    elements.portalSubtitle.textContent = 'Pediatric Clinical Nutrition & Medical Outpatient Care • Patients Scheduled for Consultation';
    elements.scopeToggleGroup.style.display = 'flex';
    elements.queueSectionTitle.textContent = specialistScope === 'my' 
      ? 'Scheduled Outpatients for Dr. Lilian Kathomi' 
      : 'All Registered Clinic Patients';
    elements.openIntakeBtn.innerHTML = '<span>+</span> New Patient Intake & Consultation';
    
    if (elements.assignedSpecialist) {
      elements.assignedSpecialist.value = 'spec-lilian';
    }
  }

  renderSidebarNav();
  renderFilterToolbar();
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
  if (confirm('Synchronize and refresh the clinical outpatient database with the central clinic server?')) {
    patients = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
    savePatients();
    renderDashboard();
    showToast('Outpatient registry roster synchronized successfully.');
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

// ==========================================
// Multi-Dashboard View Switcher Architecture
// ==========================================
let currentView = 'patients';

function switchView(viewName) {
  currentView = viewName;
  
  // Update sidebar active buttons
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Update visible dashboard view
  document.querySelectorAll('.dashboard-view').forEach(view => {
    view.classList.toggle('active', view.id === `view-${viewName}`);
  });

  // Update topbar breadcrumb
  const viewTitles = {
    patients: 'Patient Roster & Queue',
    analytics: 'Clinical Analytics & Triage Dashboard',
    billing: 'Billing & Revenue Ledger',
    intake: 'New Patient Intake & Registration Workspace',
    supplements: 'Therapeutic Supplements & Nutrition Formulas',
    referrals: 'Specialist Referrals Hub'
  };

  if (elements.topbarCurrentView) {
    elements.topbarCurrentView.textContent = viewTitles[viewName] || 'Dashboard';
  }

  // Refresh view-specific data
  if (viewName === 'billing') renderBillingDashboard();
  if (viewName === 'analytics') renderAnalyticsDashboard();
  if (viewName === 'supplements') renderSupplementsDashboard();
  if (viewName === 'referrals') renderReferralsHub();

  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function openMobileSidebar() {
  if (elements.appSidebar) elements.appSidebar.classList.add('open');
  if (elements.sidebarBackdrop) elements.sidebarBackdrop.classList.add('active');
}

function closeMobileSidebar() {
  if (elements.appSidebar) elements.appSidebar.classList.remove('open');
  if (elements.sidebarBackdrop) elements.sidebarBackdrop.classList.remove('active');
}

function renderAnalyticsDashboard() {
  if (!elements.analyticsMuacList) return;

  const samPatients = patients.filter(p => p.muac && p.muac < 11.5);
  const mamPatients = patients.filter(p => p.muac && p.muac >= 11.5 && p.muac < 12.5);
  const normalPatients = patients.filter(p => p.muac && p.muac >= 12.5);

  elements.analyticsMuacList.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.75rem;">
      <div style="background:#fef2f2; border:1px solid #fecaca; padding:0.75rem; border-radius:var(--radius-md);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:700; color:#b91c1c; font-size:0.8125rem;">🔴 Severe Acute Malnutrition (SAM &lt; 11.5cm)</span>
          <span style="font-weight:800; color:#b91c1c; font-size:0.875rem;">${samPatients.length} Patients</span>
        </div>
        <div style="font-size:0.75rem; color:#991b1b; margin-top:0.35rem; line-height:1.5;">
          ${samPatients.length > 0 ? samPatients.map(p => `• <strong>${p.name}</strong> (${p.mrn}) — MUAC: <strong>${p.muac} cm</strong> (Urgent RUTF Protocol)`).join('<br>') : 'No active SAM cases in outpatient queue.'}
        </div>
      </div>

      <div style="background:#fffbeb; border:1px solid #fde68a; padding:0.75rem; border-radius:var(--radius-md);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:700; color:#b45309; font-size:0.8125rem;">🟡 Moderate Acute Malnutrition (MAM 11.5–12.4cm)</span>
          <span style="font-weight:800; color:#b45309; font-size:0.875rem;">${mamPatients.length} Patients</span>
        </div>
        <div style="font-size:0.75rem; color:#92400e; margin-top:0.35rem; line-height:1.5;">
          ${mamPatients.length > 0 ? mamPatients.map(p => `• <strong>${p.name}</strong> (${p.mrn}) — MUAC: <strong>${p.muac} cm</strong> (Supplementary Feed)`).join('<br>') : 'No active MAM cases.'}
        </div>
      </div>

      <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:0.75rem; border-radius:var(--radius-md);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:700; color:#15803d; font-size:0.8125rem;">🟢 Normal Nutritional Status (MUAC &ge; 12.5cm)</span>
          <span style="font-weight:800; color:#15803d; font-size:0.875rem;">${normalPatients.length} Patients</span>
        </div>
      </div>
    </div>
  `;

  // Allergy breakdown
  const allergyPatients = patients.filter(p => p.allergies?.some(a => !a.toLowerCase().includes('no known') && !a.toLowerCase().includes('nkfa')));
  elements.analyticsAllergyList.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.6rem;">
      ${allergyPatients.length > 0 ? allergyPatients.map(p => `
        <div style="padding:0.65rem 0.85rem; background:var(--bg-subtle); border-radius:var(--radius-md); border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:0.8125rem; color:var(--text-main);">${p.name} <span style="font-size:0.75rem; color:var(--text-muted);">(${p.mrn})</span></div>
            <div style="font-size:0.75rem; color:var(--danger); font-weight:700; margin-top:0.15rem;">Allergies: ${p.allergies.join(', ')}</div>
          </div>
          <span class="role-tag" style="background:#fee2e2; color:#b91c1c;">Alert Active</span>
        </div>
      `).join('') : '<p style="color:var(--text-muted); font-size:0.8125rem;">No active food allergy alerts in current queue.</p>'}
    </div>
  `;

  // Feeding & Gestational
  const exclusiveBf = patients.filter(p => p.breastfeedingStatus === 'Exclusive Breastfeeding').length;
  const mixedBf = patients.filter(p => p.breastfeedingStatus === 'Mixed Feeding').length;
  const weaned = patients.filter(p => p.breastfeedingStatus === 'Weaned / Not Breastfeeding').length;
  const preterms = patients.filter(p => p.isPreterm).length;

  elements.analyticsFeedingList.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.65rem;">
      <div style="display:flex; justify-content:space-between; font-size:0.8125rem;">
        <span style="color:var(--text-secondary);">🍼 Exclusive Breastfeeding:</span>
        <span style="font-weight:700; color:var(--text-main);">${exclusiveBf} (${Math.round((exclusiveBf / (patients.length || 1)) * 100)}%)</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.8125rem;">
        <span style="color:var(--text-secondary);">🥣 Mixed / Formula Feeding:</span>
        <span style="font-weight:700; color:var(--text-main);">${mixedBf} (${Math.round((mixedBf / (patients.length || 1)) * 100)}%)</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.8125rem;">
        <span style="color:var(--text-secondary);">🥗 Weaned / Solid Foods:</span>
        <span style="font-weight:700; color:var(--text-main);">${weaned} (${Math.round((weaned / (patients.length || 1)) * 100)}%)</span>
      </div>
      <div style="padding-top:0.6rem; border-top:1px dashed var(--border-color); display:flex; justify-content:space-between; font-size:0.8125rem;">
        <span style="color:var(--text-secondary);">👶 Preterm Ex-Preemies (&lt; 37 wks):</span>
        <span style="font-weight:700; color:var(--primary);">${preterms} patients requiring corrected age</span>
      </div>
    </div>
  `;
}

function renderBillingDashboard() {
  if (!elements.billingTableBody) return;

  let totalGross = 0;
  let totalCash = 0;
  let totalInsurance = 0;
  let insuredCount = 0;

  const rows = patients.map(p => {
    const consultFee = parseFloat(p.payment?.consultationFee) || 45;
    const suppFee = parseFloat(p.payment?.supplementsFee) || 0;
    const procedures = p.payment?.procedures || [];
    const proceduresTotal = procedures.reduce((sum, pr) => sum + (parseFloat(pr.amount) || 0), 0);
    const total = parseFloat(p.payment?.totalAmount) || (consultFee + suppFee + proceduresTotal);
    const isCash = p.payment?.mode === 'Cash';

    totalGross += total;
    if (isCash) {
      totalCash += total;
    } else {
      totalInsurance += total;
      insuredCount++;
    }

    const modeBadge = isCash 
      ? `<span style="background:var(--success-light); color:var(--success); font-weight:700; padding:0.25rem 0.6rem; border-radius:var(--radius-sm); font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;">💵 Cash</span>`
      : `<span style="background:var(--secondary-light); color:var(--secondary); font-weight:700; padding:0.25rem 0.6rem; border-radius:var(--radius-sm); font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;">🛡️ Insurance</span>`;

    const insPolicy = isCash 
      ? '<span style="color:var(--text-muted); font-size:0.75rem;">Point-of-Sale (Direct)</span>' 
      : `<span style="font-size:0.78rem; font-weight:600; color:var(--text-main);">${escapeHtml(p.payment?.provider || 'Jubilee / Cigna')}</span><div style="font-size:0.72rem; color:var(--text-muted); font-family:monospace;">Pol: ${escapeHtml(p.payment?.policyNumber || 'POL-9941')}</div>`;

    const proceduresNote = procedures.length > 0 
      ? `<div style="font-size:0.72rem; color:var(--primary); font-weight:700; margin-top:0.2rem;">+${procedures.length} Added Procedure(s) (+$${proceduresTotal.toFixed(2)})</div>`
      : '';

    return `
      <tr>
        <td>
          <div style="font-weight:700; color:var(--text-main);">${escapeHtml(p.name)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${p.mrn} • ${escapeHtml(p.age || '')}</div>
        </td>
        <td>
          <div style="font-weight:600; font-size:0.8125rem;">${escapeHtml(p.guardian?.name || p.parent?.name || 'Guardian')}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(p.guardian?.phone || p.parent?.phone || '')}</div>
        </td>
        <td style="font-family:monospace; font-weight:600;">$${consultFee.toFixed(2)}</td>
        <td style="font-family:monospace; color:var(--text-muted);">$${suppFee.toFixed(2)}</td>
        <td>
          <div style="font-family:monospace; font-weight:800; color:var(--primary); font-size:0.95rem;">$${total.toFixed(2)}</div>
          ${proceduresNote}
        </td>
        <td>${modeBadge}</td>
        <td>${insPolicy}</td>
        <td style="font-family:monospace; font-size:0.75rem; color:var(--text-muted);">${escapeHtml(p.payment?.icd10 || 'Z76.2')}</td>
        <td>
          <button class="btn btn-action-charge btn-sm" onclick="openAlterEncounterModal('${p.id}')" title="Alter Record / Add Service" style="padding:0.25rem 0.55rem; font-size:0.75rem;">
            <span>⚡</span> Alter / Bill
          </button>
        </td>
      </tr>
    `;
  });

  elements.billingTableBody.innerHTML = rows.join('');

  const ratio = patients.length > 0 ? Math.round((insuredCount / patients.length) * 100) : 0;
  if (elements.billingGrossRevenue) elements.billingGrossRevenue.textContent = `$${totalGross.toFixed(2)}`;
  if (elements.billingCashTotal) elements.billingCashTotal.textContent = `$${totalCash.toFixed(2)}`;
  if (elements.billingInsuranceTotal) elements.billingInsuranceTotal.textContent = `$${totalInsurance.toFixed(2)}`;
  if (elements.billingInsuranceRatio) elements.billingInsuranceRatio.textContent = `${ratio}%`;
}

function renderSupplementsDashboard() {
  if (!elements.supplementsTableBody) return;

  const rows = [];
  patients.forEach(p => {
    if (p.prescriptions && p.prescriptions.length > 0) {
      p.prescriptions.forEach(rx => {
        rows.push(`
          <tr>
            <td>
              <div style="font-weight:700; color:var(--text-main);">${p.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${p.mrn} • ${p.age}</div>
            </td>
            <td>
              <div style="font-weight:700; color:var(--primary); font-size:0.9rem;">${rx.item}</div>
            </td>
            <td style="font-weight:600; font-size:0.8125rem;">${rx.dosage || rx.instructions || 'Standard pediatric dosing'}</td>
            <td style="color:var(--text-secondary); font-size:0.8125rem;">${rx.duration || '30 days duration'}</td>
            <td><span class="role-tag" style="background:var(--bg-subtle); color:var(--text-main); font-size:0.75rem;">${p.diagnosis || 'Clinical Nutrition Management'}</span></td>
            <td><span style="font-weight:700; color:var(--text-main); font-size:0.8rem;">🩺 Lilian Kathomi, RD</span></td>
          </tr>
        `);
      });
    }
  });

  if (rows.length === 0) {
    elements.supplementsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2.5rem;">No active therapeutic supplements currently recorded.</td></tr>`;
  } else {
    elements.supplementsTableBody.innerHTML = rows.join('');
  }
}


function generateReferralLetterText(patient, dept) {
  if (!patient) return '';
  const department = dept || 'Pediatric Specialist';
  const latestVisit = patient.visits?.[patient.visits.length - 1] || patient.encounter || {};
  const parentName = patient.parent?.name || patient.guardian?.name || 'Guardian';
  const parentPhone = patient.parent?.phone || patient.guardian?.phone || 'N/A';
  const muacEval = evaluateMUAC(patient.muac)?.label || 'Normal nutritional status';

  return `CLINICAL OUTPATIENT REFERRAL LETTER
NutriCare Pediatric & Clinical Nutrition Outpatient Center
Nairobi, Kenya | Tel: +254 700 000 000 | outpatient@nutricare.med
Date: ${new Date().toISOString().split('T')[0]}

TO: Attending Specialist, Department of ${department}
FROM: Lilian Kathomi, RD, CNS (Pediatric Nutritionist & Specialist)

RE: Formal Clinical Referral & Outpatient Consultation Summary
Patient: ${patient.name}
MRN: ${patient.mrn} | Sex: ${patient.sex} | Age: ${patient.age} ${patient.isPreterm ? `(Ex-${patient.gestationalWeeks}w Preterm, Corrected Age: ${patient.correctedAge || 'N/A'})` : '(Full Term)'}
Parent / Guardian: ${parentName} (${parentPhone})

1. ALLERGIES & CLINICAL SAFETY FLAGS:
${patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'No known food allergies reported.'}

2. ANTHROPOMETRIC PARAMETERS:
- Current Weight: ${patient.weight || '--'} kg (Birth Weight: ${patient.birthWeight || '--'} kg)
- Length / Height: ${patient.height || '--'} cm
- MUAC: ${patient.muac || '--'} cm (${muacEval})
- Head Circumference: ${patient.headCircumference || '--'} cm
- Bilateral Nutritional Edema: ${patient.edema || 'None'}

3. CLINICAL SUMMARY & NUTRITIONAL PRESENTATION:
${latestVisit.patientSummary || patient.diagnosis || 'Patient undergoing outpatient nutritional evaluation and growth faltering management.'}

4. PROVISIONAL CLINICAL DIAGNOSIS:
${latestVisit.conditionDiagnosed || patient.diagnosis || 'Nutritional deficiency / Gastrointestinal intolerance evaluation'}

5. REASON FOR SPECIALIST REFERRAL:
We kindly request your expert multidisciplinary evaluation regarding ${department.toLowerCase()} management, diagnostic confirmation, and collaborative therapeutic care.

Sincerely,
Lilian Kathomi, RD, CNS
Lead Pediatric Clinical Nutritionist | MOH Reg #MED-PED-881`;
}

function renderReferralsHub() {
  if (!elements.hubPatientSelect) return;

  const currentVal = elements.hubPatientSelect.value;
  elements.hubPatientSelect.innerHTML = patients.map(p => `
    <option value="${p.id}">${p.name} (${p.mrn}) — ${p.age}</option>
  `).join('');

  if (currentVal && patients.some(p => p.id === currentVal)) {
    elements.hubPatientSelect.value = currentVal;
  }

  updateHubReferralLetter();
}

function updateHubReferralLetter() {
  if (!elements.hubReferralLetterContent || !elements.hubPatientSelect) return;
  const pId = elements.hubPatientSelect.value;
  const patient = patients.find(p => p.id === pId) || patients[0];
  if (!patient) return;

  const specialistType = elements.hubSpecialistSelect?.value || 'Pediatric Specialist';
  const letter = generateReferralLetterText(patient, specialistType);
  elements.hubReferralLetterContent.textContent = letter;
}

function renderDashboard() {
  updateStatsKPIs();
  renderPatientList();
  renderAnalyticsDashboard();
  renderBillingDashboard();
  renderSupplementsDashboard();
  renderReferralsHub();
  renderScheduleDashboard();
  renderFilterToolbar();
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

function renderFilterToolbar() {
  const container = document.getElementById('filterSegmentedGroup');
  if (!container) return;

  const isReception = currentUser?.role === 'reception';
  const basePool = (currentUser?.role === 'specialist' && specialistScope === 'my')
    ? patients.filter(p => p.assignedSpecialistId === 'spec-lilian')
    : patients;

  if (isReception) {
    // Receptionist segmented filters
    const allCount = basePool.length;
    const waitingCount = basePool.filter(p => p.queueStatus === 'Waiting' || p.queueStatus === 'Checked In').length;
    const consultingCount = basePool.filter(p => p.queueStatus === 'In Consultation').length;
    const completedCount = basePool.filter(p => p.queueStatus === 'Completed' || p.status === 'Completed').length;
    const unpaidCount = basePool.filter(p => p.payment?.status !== 'Paid').length;

    container.innerHTML = `
      <button class="filter-segment-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
        <span>📋</span> All Admissions <span class="filter-count-chip">${allCount}</span>
      </button>
      <button class="filter-segment-btn ${activeFilter === 'waiting' ? 'active' : ''}" data-filter="waiting">
        <span>🕒</span> Waiting Room <span class="filter-count-chip">${waitingCount}</span>
      </button>
      <button class="filter-segment-btn ${activeFilter === 'consulting' ? 'active' : ''}" data-filter="consulting">
        <span>🩺</span> In Consultation <span class="filter-count-chip">${consultingCount}</span>
      </button>
      <button class="filter-segment-btn ${activeFilter === 'completed' ? 'active' : ''}" data-filter="completed">
        <span>✓</span> Completed <span class="filter-count-chip">${completedCount}</span>
      </button>
      <button class="filter-segment-btn danger-btn ${activeFilter === 'unpaid' ? 'active' : ''}" data-filter="unpaid">
        <span>💳</span> Payment Due <span class="filter-count-chip">${unpaidCount}</span>
      </button>
    `;
  } else {
    // Specialist Lilian Kathomi segmented clinical triage filters
    const allCount = basePool.length;
    const criticalCount = basePool.filter(p => (p.muac && p.muac < 12.5) || (p.allergies && p.allergies.some(a => !a.toLowerCase().includes('no known')))).length;
    const muacCount = basePool.filter(p => p.muac && p.muac < 12.5).length;
    const pretermCount = basePool.filter(p => p.isPreterm).length;

    container.innerHTML = `
      <button class="filter-segment-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
        <span>📋</span> All Scheduled <span class="filter-count-chip">${allCount}</span>
      </button>
      <button class="filter-segment-btn danger-btn ${activeFilter === 'critical' ? 'active' : ''}" data-filter="critical">
        <span>⚠️</span> Critical Alerts <span class="filter-count-chip">${criticalCount}</span>
      </button>
      <button class="filter-segment-btn ${activeFilter === 'muac-risk' ? 'active' : ''}" data-filter="muac-risk">
        <span>🔴</span> SAM / MAM Malnutrition <span class="filter-count-chip">${muacCount}</span>
      </button>
      <button class="filter-segment-btn ${activeFilter === 'preterm' ? 'active' : ''}" data-filter="preterm">
        <span>👶</span> Preterm Ex-Preemies <span class="filter-count-chip">${pretermCount}</span>
      </button>
    `;
  }

  // Bind segmented pill clicks
  if (container && typeof container.querySelectorAll === 'function') {
    container.querySelectorAll('.filter-segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.filter-segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        renderPatientList();
      });
    });
  }
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
      const matchDiagnosis = (p.visits?.[p.visits.length - 1]?.conditionDiagnosed || p.diagnosis || '').toLowerCase().includes(q);
      if (!matchName && !matchMRN && !matchGuardian && !matchPhone && !matchAllergy && !matchDiagnosis) {
        return false;
      }
    }

    // Role-specific Segmented Filter
    if (activeFilter === 'critical') {
      const hasAllergy = p.allergies?.some(a => !a.toLowerCase().includes('no known') && !a.toLowerCase().includes('nkfa'));
      const hasMalnutrition = p.muac && p.muac < 12.5;
      if (!hasAllergy && !hasMalnutrition) return false;
    } else if (activeFilter === 'muac-risk') {
      if (!p.muac || p.muac >= 12.5) return false;
    } else if (activeFilter === 'preterm') {
      if (!p.isPreterm) return false;
    } else if (activeFilter === 'waiting') {
      if (p.queueStatus !== 'Waiting' && p.queueStatus !== 'Checked In') return false;
    } else if (activeFilter === 'consulting') {
      if (p.queueStatus !== 'In Consultation') return false;
    } else if (activeFilter === 'completed') {
      if (p.queueStatus !== 'Completed' && p.status !== 'Completed') return false;
    } else if (activeFilter === 'unpaid') {
      if (p.payment?.status === 'Paid') return false;
    }

    // Secondary Diet Filter
    if (dietFilter !== 'all') {
      if (dietFilter === 'exclusive-bf' && !p.breastfeedingStatus?.includes('Exclusive')) return false;
      if (dietFilter === 'mixed-bf' && !p.breastfeedingStatus?.includes('Mixed') && !p.breastfeedingStatus?.includes('Formula')) return false;
      if (dietFilter === 'weaned' && !p.breastfeedingStatus?.includes('Weaned') && !p.breastfeedingStatus?.includes('Complementary')) return false;
    }

    // Secondary Payment Filter
    if (paymentFilter !== 'all') {
      if (paymentFilter === 'cash' && p.payment?.mode !== 'Cash') return false;
      if (paymentFilter === 'insurance' && p.payment?.mode !== 'Insurance') return false;
    }

    return true;
  });
}

function renderPatientList() {
  const filtered = getFilteredPatients();
  if (elements.patientCountBadge) {
    elements.patientCountBadge.textContent = `${filtered.length} Patients`;
  }

  if (filtered.length === 0) {
    const isSpecialistMy = currentUser?.role === 'specialist' && specialistScope === 'my';
    elements.patientGrid.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <h3>${isSpecialistMy ? 'No Patients Scheduled for Dr. Lilian Kathomi' : 'No Patients Match Your Filter'}</h3>
        <p>${isSpecialistMy ? 'Switch to "All Registered Patients" or enter new patient data directly.' : 'Adjust search terms or register a new outpatient intake.'}</p>
        <button class="btn btn-primary" id="emptyStateIntakeBtn">
          + Enter Patient Data & Consultation
        </button>
      </div>
    `;
    const btn = document.getElementById('emptyStateIntakeBtn');
    if (btn) btn.addEventListener('click', openIntakeModal);
    return;
  }

  const isReception = currentUser?.role === 'reception';

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
      ? `<span class="badge-preterm">👶 Ex-${patient.gestationalWeeks}w Preterm ${patient.correctedAge ? `(Corr: ${patient.correctedAge})` : ''}</span>`
      : '';

    // Allergies alert
    const hasAllergies = patient.allergies && patient.allergies.length > 0 && !patient.allergies.some(a => a.toLowerCase().includes('no known'));
    const allergyHtml = hasAllergies
      ? `<div class="allergy-alert-chip"><span>⚠️</span> <span>ALLERGY: ${escapeHtml(patient.allergies.join(', '))}</span></div>`
      : '';

    // Latest visit details
    const latestVisit = patient.visits?.[patient.visits.length - 1] || patient.encounter || {};
    const condition = latestVisit.conditionDiagnosed || patient.diagnosis || latestVisit.patientSummary || 'Routine Nutritional Audit';
    const velocityStr = latestVisit.weightVelocity ? `📈 ${latestVisit.weightVelocity}` : `${patient.visits?.length || 1} Consultation(s)`;

    // Payment Info & Extra Procedures Count
    const totalAmount = patient.payment?.totalAmount || patient.payment?.amount || 0;
    const isCash = patient.payment?.mode === 'Cash';
    const procedures = patient.payment?.procedures || [];
    const proceduresCount = procedures.length;
    const extraProceduresTotal = procedures.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const payBadge = isCash 
      ? `<span class="payment-badge cash">💵 Cash: $${totalAmount} (${patient.payment?.status || 'Paid'})</span>`
      : `<span class="payment-badge insurance">🛡️ ${patient.payment?.provider || 'Insurance'}: $${totalAmount}</span>`;

    const proceduresBadge = proceduresCount > 0
      ? `<div class="procedure-itemized-badge">⚡ ${proceduresCount} Added Procedure${proceduresCount > 1 ? 's' : ''} (+$${extraProceduresTotal.toFixed(2)})</div>`
      : '';

    // Queue status badge for Reception
    const qStatus = patient.queueStatus || patient.status || 'Scheduled';
    let queueStatusClass = 'scheduled';
    if (qStatus.includes('Waiting') || qStatus.includes('Checked In')) queueStatusClass = 'waiting';
    else if (qStatus.includes('Consultation') || qStatus.includes('With Doctor')) queueStatusClass = 'consulting';
    else if (qStatus.includes('Completed')) queueStatusClass = 'completed';

    if (isReception) {
      // ----------------------------------------------------
      // Receptionist Patient Card (Admissions & Check-in Desk)
      // ----------------------------------------------------
      return `
        <div class="patient-card" data-id="${patient.id}">
          <div>
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
              <span class="status-pill ${queueStatusClass}">● ${qStatus}</span>
            </div>

            <div style="margin: 0.65rem 0; display:flex; align-items:center; justify-content:space-between; background:var(--bg-subtle); padding:0.5rem 0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color); font-size:0.8rem;">
              <div>
                <span style="color:var(--text-muted); font-size:0.7rem; font-weight:700; text-transform:uppercase;">Appt Slot & Room:</span>
                <div style="font-weight:700; color:var(--text-main);">🕒 ${patient.appointmentTime || '10:00 AM'} • Suite 04 (Dr. Lilian Kathomi)</div>
              </div>
              <div>${payBadge}</div>
            </div>

            ${allergyHtml}

            <div class="guardian-box" style="margin-top:0.5rem;">
              <div class="guardian-row">
                <span><strong>Guardian:</strong> ${escapeHtml(patient.guardian?.name || 'N/A')} (${escapeHtml(patient.guardian?.relationship || 'Parent')})</span>
                <span class="guardian-phone">📞 <a href="tel:${patient.guardian?.phone || ''}" style="color:var(--primary); text-decoration:none;">${escapeHtml(patient.guardian?.phone || 'N/A')}</a></span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">
                Residence: ${escapeHtml(patient.guardian?.residence || 'Nairobi')} • Insurance: ${escapeHtml(patient.payment?.provider || 'Self-Pay Cash')}
              </div>
            </div>

            <div class="notes-preview" style="margin-top:0.5rem;">
              <strong>Admissions Desk Routing:</strong> Registered for Dr. Lilian Kathomi's Pediatric Consultation Suite.
            </div>
          </div>

          <div class="card-bottom" style="margin-top:1rem; border-top:1px solid var(--border-color); padding-top:0.75rem;">
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
              ${qStatus === 'Scheduled' 
                ? `<button class="btn btn-action-checkin" onclick="updatePatientQueueStatus('${patient.id}', 'Waiting')">✓ Check In Patient</button>`
                : (qStatus.includes('Waiting') 
                  ? `<button class="btn btn-action-checkin" style="background:var(--accent-purple-light); color:var(--accent-purple); border-color:var(--accent-purple);" onclick="updatePatientQueueStatus('${patient.id}', 'In Consultation')">Call to Dr. Lilian</button>`
                  : `<button class="btn btn-action-checkin" style="background:var(--success-light); color:var(--success); border-color:var(--success);" onclick="updatePatientQueueStatus('${patient.id}', 'Completed')">Mark Completed</button>`)}
            </div>
            <div class="card-actions">
              <button class="btn btn-secondary btn-sm open-chart-btn" data-id="${patient.id}" title="View Patient File">
                📋 View File
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // ----------------------------------------------------
    // Pediatrician Patient Card (Dr. Lilian Kathomi)
    // ----------------------------------------------------
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

          <!-- Doctor Tag & Procedures Badge -->
          <div style="margin-bottom:0.6rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.4rem;">
            <span class="assigned-doctor-chip">🩺 Attending: Dr. Lilian Kathomi (${patient.appointmentTime || '10:00 AM'})</span>
            ${proceduresBadge}
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
            <button class="btn btn-action-charge alter-encounter-btn" data-id="${patient.id}" title="Doctor: Add billable procedure or alter encounter">
              <span>⚡</span> Add Charge / Alter
            </button>
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

  // Attach card event listeners
  document.querySelectorAll('.open-chart-btn').forEach(btn => {
    btn.addEventListener('click', () => openPatientChart(btn.dataset.id));
  });

  document.querySelectorAll('.alter-encounter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAlterEncounterModal(btn.dataset.id);
    });
  });

  document.querySelectorAll('.quick-print-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPatientChart(btn.dataset.id);
      setTimeout(() => window.print(), 350);
    });
  });
}

function updatePatientQueueStatus(patientId, newStatus) {
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;

  patient.queueStatus = newStatus;
  if (newStatus === 'Completed') patient.status = 'Completed';
  savePatients();
  renderPatientList();
  renderSidebarNav();
  renderFilterToolbar();
  showToast(`Queue updated: ${patient.name} is now "${newStatus}".`);
}

// ==========================================
// Doctor Alter Record & Billable Procedures
// ==========================================
function openAlterEncounterModal(patientId) {
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;

  currentAlterPatientId = patientId;

  if (elements.alterPatientId) elements.alterPatientId.value = patient.id;
  if (elements.alterPatientName) elements.alterPatientName.textContent = patient.name;
  if (elements.alterPatientMRN) elements.alterPatientMRN.textContent = `MRN: ${patient.mrn} • Age: ${patient.age}`;
  
  const totalAmount = patient.payment?.totalAmount || patient.payment?.amount || 0;
  if (elements.alterCurrentBilled) elements.alterCurrentBilled.textContent = `$${parseFloat(totalAmount).toFixed(2)}`;
  if (elements.alterPaymentMode) elements.alterPaymentMode.textContent = patient.payment?.mode || 'Cash';
  
  const procedures = patient.payment?.procedures || [];
  if (elements.alterProceduresCount) elements.alterProceduresCount.textContent = `${procedures.length} Added`;

  // Render existing procedures if any
  if (elements.alterExistingProceduresBox && elements.alterExistingProceduresList) {
    if (procedures.length > 0) {
      elements.alterExistingProceduresBox.style.display = 'block';
      elements.alterExistingProceduresList.innerHTML = procedures.map(pr => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-subtle); padding:0.4rem 0.65rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.775rem;">
          <div>
            <strong>${escapeHtml(pr.name)}</strong>
            <span style="color:var(--text-muted); font-size:0.7rem; display:block;">By ${escapeHtml(pr.performedBy || 'Dr. Lilian Kathomi')} • ${pr.date || 'Today'}</span>
          </div>
          <span style="font-weight:700; color:var(--primary); font-size:0.85rem;">+$${parseFloat(pr.amount).toFixed(2)}</span>
        </div>
      `).join('');
    } else {
      elements.alterExistingProceduresBox.style.display = 'none';
      elements.alterExistingProceduresList.innerHTML = '';
    }
  }

  // Prefill diagnosis & plan
  const latestVisit = patient.visits?.[patient.visits.length - 1] || {};
  if (elements.alterConditionDiagnosed) {
    elements.alterConditionDiagnosed.value = latestVisit.conditionDiagnosed || patient.diagnosis || '';
  }
  if (elements.alterRecommendedManagement) {
    elements.alterRecommendedManagement.value = latestVisit.recommendedManagement || patient.recommendedManagement || '';
  }

  // Reset inputs
  if (elements.alterProcedurePreset) elements.alterProcedurePreset.value = '';
  if (elements.alterProcedureName) elements.alterProcedureName.value = '';
  if (elements.alterProcedureFee) elements.alterProcedureFee.value = '';
  if (elements.alterProcedureNotes) elements.alterProcedureNotes.value = '';

  if (elements.alterEncounterModal) elements.alterEncounterModal.classList.add('active');
}

function closeAlterEncounterModal() {
  if (elements.alterEncounterModal) elements.alterEncounterModal.classList.remove('active');
  currentAlterPatientId = null;
}

function handleAlterEncounterSubmit(e) {
  e.preventDefault();
  if (!currentAlterPatientId) return;

  const patient = patients.find(p => p.id === currentAlterPatientId);
  if (!patient) return;

  const procName = elements.alterProcedureName?.value.trim() || 'Pediatric Clinical Service';
  const procFee = parseFloat(elements.alterProcedureFee?.value) || 0;
  const procNotes = elements.alterProcedureNotes?.value.trim() || '';
  const newDiagnosis = elements.alterConditionDiagnosed?.value.trim();
  const newManagement = elements.alterRecommendedManagement?.value.trim();

  // Initialize payment object if needed
  if (!patient.payment) {
    patient.payment = {
      mode: 'Cash',
      consultationFee: 45.00,
      supplementsFee: 0.00,
      totalAmount: 45.00,
      currency: 'USD',
      status: 'Paid',
      procedures: []
    };
  }

  if (!patient.payment.procedures) patient.payment.procedures = [];

  // Add procedure
  const newProc = {
    id: 'proc-' + Date.now(),
    name: procName,
    amount: procFee,
    date: new Date().toISOString().split('T')[0],
    performedBy: 'Dr. Lilian Kathomi, RD, CNS',
    notes: procNotes
  };
  patient.payment.procedures.push(newProc);

  // Recalculate totals
  const consultFee = parseFloat(patient.payment.consultationFee) || 45.00;
  const suppFee = parseFloat(patient.payment.supplementsFee) || 0.00;
  const proceduresSum = patient.payment.procedures.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  patient.payment.extraProceduresTotal = proceduresSum;
  patient.payment.totalAmount = consultFee + suppFee + proceduresSum;

  // Log to longitudinal visit history
  if (!patient.visits) patient.visits = [];
  patient.visits.push({
    id: 'v-' + Date.now(),
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    weight: patient.weight,
    height: patient.height,
    muac: patient.muac,
    nutritionistName: 'Lilian Kathomi',
    patientSummary: `[Clinical Procedure & Fee Added] ${procName} (+$${procFee.toFixed(2)}). ${procNotes}`,
    conditionDiagnosed: newDiagnosis || patient.diagnosis || 'Clinical Nutrition Outpatient Review',
    recommendedManagement: newManagement || patient.recommendedManagement || 'Continue specialized pediatric dietary plan.',
    followUpDate: patient.followUpDate || '2026-11-20'
  });

  if (newDiagnosis) patient.diagnosis = newDiagnosis;
  if (newManagement) patient.recommendedManagement = newManagement;

  savePatients();
  renderDashboard();

  // Update chart if currently viewing this patient
  if (currentPatientId === patient.id) {
    renderChartBilling(patient);
  }

  closeAlterEncounterModal();
  showToast(`⚡ Altered record: Added "${procName}" (+$${procFee.toFixed(2)}) for ${patient.name}.`);
}

// ==========================================
// Reception Schedule Dashboard (Secretary)
// ==========================================
function renderScheduleDashboard() {
  const container = document.getElementById('scheduleBlocksContainer');
  if (!container) return;

  const morningSlots = [
    { time: '09:00 AM', patient: patients[0], room: 'Suite 04', status: 'Completed' },
    { time: '10:00 AM', patient: patients[1], room: 'Suite 04', status: 'In Consultation' },
    { time: '11:30 AM', patient: patients[2], room: 'Suite 04', status: 'Checked In (Waiting)' },
    { time: '12:15 PM', patient: null, room: 'Suite 04', status: 'Available' }
  ];

  const afternoonSlots = [
    { time: '02:00 PM', patient: patients[3], room: 'Suite 04', status: 'Confirmed' },
    { time: '03:00 PM', patient: null, room: 'Suite 04', status: 'Available' },
    { time: '04:00 PM', patient: null, room: 'Suite 04', status: 'Available' }
  ];

  container.innerHTML = `
    <div class="schedule-block-card">
      <div class="schedule-block-header">
        <div>
          <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-bottom:0.15rem;">Morning Clinical Outpatient Block</h4>
          <span style="font-size:0.75rem; color:var(--text-muted);">Attending: Dr. Lilian Kathomi • 09:00 AM - 12:30 PM</span>
        </div>
        <span class="role-tag role-specialist">Pediatric Suite 04</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:0.4rem;">
        ${morningSlots.map(s => renderSlotRow(s)).join('')}
      </div>
    </div>

    <div class="schedule-block-card">
      <div class="schedule-block-header">
        <div>
          <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-bottom:0.15rem;">Afternoon Nutrition & Follow-up Block</h4>
          <span style="font-size:0.75rem; color:var(--text-muted);">Attending: Dr. Lilian Kathomi • 02:00 PM - 05:00 PM</span>
        </div>
        <span class="role-tag role-specialist">Pediatric Suite 04</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:0.4rem;">
        ${afternoonSlots.map(s => renderSlotRow(s)).join('')}
      </div>
    </div>
  `;
}

function renderSlotRow(slot) {
  if (slot.patient) {
    return `
      <div class="schedule-slot-row booked">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="schedule-slot-time">${slot.time}</span>
            <strong style="font-size:0.875rem; color:var(--text-main);">${escapeHtml(slot.patient.name)}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted);">(${slot.patient.mrn})</span>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
            Guardian: ${escapeHtml(slot.patient.guardian?.name || 'Parent')} • ${escapeHtml(slot.patient.age || '')}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="status-pill ${slot.status.includes('Completed') ? 'completed' : (slot.status.includes('Consultation') ? 'consulting' : 'waiting')}">
            ${slot.status}
          </span>
          <button class="btn btn-secondary btn-sm" onclick="openPatientChart('${slot.patient.id}')" style="padding:0.25rem 0.5rem; font-size:0.75rem;">
            File
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="schedule-slot-row available">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span class="schedule-slot-time" style="color:var(--text-muted);">${slot.time}</span>
        <span style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">Open Outpatient Consultation Slot</span>
      </div>
      <button class="btn btn-action-checkin" onclick="openIntakeModal()" style="padding:0.25rem 0.65rem; font-size:0.75rem;">
        + Book Slot
      </button>
    </div>
  `;
}

// ==========================================
// 4. Patient Chart & Detail Dossier
// ==========================================

function closeChartModal() {
  if (elements.chartModal) elements.chartModal.classList.remove('active');
}

function closeFollowUpModal() {
  if (elements.followUpModal) elements.followUpModal.classList.remove('active');
}

function closeReferralModal() {
  if (elements.referralModal) elements.referralModal.classList.remove('active');
}

function closeDocViewerModal() {
  if (elements.docViewerModal) elements.docViewerModal.classList.remove('active');
}

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
  const consultFee = parseFloat(patient.payment?.consultationFee) || 45.00;
  const suppFee = parseFloat(patient.payment?.supplementsFee) || 0.00;
  const procedures = patient.payment?.procedures || [];
  const proceduresTotal = procedures.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const total = parseFloat(patient.payment?.totalAmount) || (consultFee + suppFee + proceduresTotal);

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
          <span class="stat-label">Base Consultation</span>
          <span class="stat-value" style="font-size: 1.3rem;">$${consultFee.toFixed(2)}</span>
          <span class="stat-subtext">Dr. Lilian Kathomi Suite</span>
        </div>
      </div>
      <div class="stat-card" style="padding: 1rem;">
        <div class="stat-info">
          <span class="stat-label">Total Invoiced Bill</span>
          <span class="stat-value" style="font-size: 1.3rem; color:var(--primary);">$${total.toFixed(2)}</span>
          <span class="stat-subtext">${procedures.length > 0 ? `Includes $${proceduresTotal.toFixed(2)} in added procedures` : 'Includes $0 in extra procedures'}</span>
        </div>
      </div>
    </div>

    <!-- Doctor Clinical Procedures & Alterations Itemized Ledger -->
    <div class="timeline-card" style="margin-bottom:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <h4 style="font-size:0.95rem; font-weight:700; color:var(--primary); margin:0;">
          ⚡ Clinical Procedures & Services Added by Doctor
        </h4>
        <button class="btn btn-action-charge btn-sm" onclick="openAlterEncounterModal('${patient.id}')">
          <span>+</span> Add Clinical Procedure / Extra Charge
        </button>
      </div>

      ${procedures.length === 0 ? `
        <p style="color:var(--text-muted); font-size:0.825rem; font-style:italic; margin:0.5rem 0;">
          No additional procedures added yet. Dr. Lilian can add billable procedures (e.g. NG-tube placement, rehydration, allergy testing) using the button above.
        </p>
      ` : `
        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;">
          ${procedures.map(pr => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-subtle); padding:0.6rem 0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <div>
                <strong style="color:var(--text-main); font-size:0.875rem;">${escapeHtml(pr.name)}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem;">
                  Performed by ${escapeHtml(pr.performedBy || 'Dr. Lilian Kathomi')} • ${pr.date || 'Today'} ${pr.notes ? `— "${escapeHtml(pr.notes)}"` : ''}
                </div>
              </div>
              <span style="font-weight:800; color:var(--primary); font-size:1rem;">+$${parseFloat(pr.amount).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      `}
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
  const dept = elements.referralSpecialistSelect?.value || 'Pediatric Specialist';
  elements.referralLetterContent.textContent = generateReferralLetterText(patient, dept);
  return;
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
  // Sidebar Navigation Items
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      if (view) switchView(view);
    });
  });

  // Mobile Sidebar Toggle & Backdrop
  if (elements.mobileSidebarToggle) elements.mobileSidebarToggle.addEventListener('click', openMobileSidebar);
  if (elements.sidebarBackdrop) elements.sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // Sidebar User Card, Theme & Logout
  if (elements.sidebarUserCard) elements.sidebarUserCard.addEventListener('click', openUserProfileModal);

  // Launch Intake from view
  if (elements.launchIntakeBtn) elements.launchIntakeBtn.addEventListener('click', openIntakeModal);

  // Hub Referrals changes
  if (elements.hubPatientSelect) elements.hubPatientSelect.addEventListener('change', updateHubReferralLetter);
  if (elements.hubSpecialistSelect) elements.hubSpecialistSelect.addEventListener('change', updateHubReferralLetter);
  if (elements.hubPrintReferralBtn) elements.hubPrintReferralBtn.addEventListener('click', () => window.print());
  if (elements.hubCopyReferralBtn) {
    elements.hubCopyReferralBtn.addEventListener('click', () => {
      if (elements.hubReferralLetterContent) {
        navigator.clipboard.writeText(elements.hubReferralLetterContent.textContent);
        showToast('Referral letter copied to clipboard');
      }
    });
  }

  // Authentication & Workstation Profile
  if (elements.logoutBtn) elements.logoutBtn.addEventListener('click', handleLogout);
  if (elements.userProfileBtn) elements.userProfileBtn.addEventListener('click', openUserProfileModal);
  if (elements.closeUserProfileBtn) elements.closeUserProfileBtn.addEventListener('click', closeUserProfileModal);
  if (elements.cancelUserProfileBtn) elements.cancelUserProfileBtn.addEventListener('click', closeUserProfileModal);
  if (elements.modalLogoutBtn) {
    elements.modalLogoutBtn.addEventListener('click', () => {
      closeUserProfileModal();
      handleLogout();
    });
  }

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
  if (elements.btnScopeMyPatients) elements.btnScopeMyPatients.addEventListener('click', () => {
    specialistScope = 'my';
    elements.btnScopeMyPatients.classList.add('active');
    elements.btnScopeAllPatients.classList.remove('active');
    elements.queueSectionTitle.textContent = 'Scheduled Outpatients for Lilian Kathomi';
    renderDashboard();
  });

  if (elements.btnScopeAllPatients) elements.btnScopeAllPatients.addEventListener('click', () => {
    specialistScope = 'all';
    elements.btnScopeAllPatients.classList.add('active');
    elements.btnScopeMyPatients.classList.remove('active');
    elements.queueSectionTitle.textContent = 'All Registered Clinic Patients';
    renderDashboard();
  });

  // Theme & Reset
  if (elements.themeToggleBtn) elements.themeToggleBtn.addEventListener('click', toggleTheme);
  if (elements.resetDemoBtn2) elements.resetDemoBtn2.addEventListener('click', resetToDemoData);

  // Search
  if (elements.searchInput) elements.searchInput.addEventListener('input', (e) => {
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
  if (elements.openIntakeBtn) elements.openIntakeBtn.addEventListener('click', openIntakeModal);
  if (elements.closeIntakeBtn) elements.closeIntakeBtn.addEventListener('click', closeIntakeModal);
  if (elements.cancelIntakeBtn) elements.cancelIntakeBtn.addEventListener('click', closeIntakeModal);
  if (elements.intakeForm) elements.intakeForm.addEventListener('submit', handleIntakeSubmit);

  // Preterm calculation
  if (elements.patientIsPreterm) elements.patientIsPreterm.addEventListener('change', calculateCorrectedAge);
  if (elements.patientGestationalWeeks) elements.patientGestationalWeeks.addEventListener('input', calculateCorrectedAge);
  if (elements.patientAge) elements.patientAge.addEventListener('input', calculateCorrectedAge);

  // Anthropometry live calculations
  if (elements.inputWeight) elements.inputWeight.addEventListener('input', updateLiveAnthropometry);
  if (elements.inputHeight) elements.inputHeight.addEventListener('input', updateLiveAnthropometry);
  if (elements.inputBirthWeight) elements.inputBirthWeight.addEventListener('input', updateLiveAnthropometry);
  if (elements.inputMUAC) elements.inputMUAC.addEventListener('input', updateLiveAnthropometry);

  // MDD Checklist
  elements.foodGroupCheckboxes.forEach(cb => cb.addEventListener('change', updateMDDScore));

  // Billing live calculations
  if (elements.consultationFee) elements.consultationFee.addEventListener('input', updateBillingTotals);
  if (elements.supplementsFee) elements.supplementsFee.addEventListener('input', updateBillingTotals);
  if (elements.btnPaymentCash) elements.btnPaymentCash.addEventListener('click', () => setPaymentMode('Cash'));
  if (elements.btnPaymentInsurance) elements.btnPaymentInsurance.addEventListener('click', () => setPaymentMode('Insurance'));

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
  if (elements.dropzone) elements.dropzone.addEventListener('click', () => elements.fileInput.click());
  if (elements.fileInput) elements.fileInput.addEventListener('change', (e) => handleSelectedFiles(e.target.files));
  if (elements.dropzone) elements.dropzone.addEventListener('dragover', (e) => { e.preventDefault(); elements.dropzone.style.borderColor = 'var(--primary)'; });
  if (elements.dropzone) elements.dropzone.addEventListener('dragleave', () => elements.dropzone.style.borderColor = 'var(--border-color)');
  if (elements.dropzone) elements.dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropzone.style.borderColor = 'var(--border-color)';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectedFiles(e.dataTransfer.files);
    }
  });

  // Chart Modal
  if (elements.closeChartBtn) elements.closeChartBtn.addEventListener('click', () => elements.chartModal.classList.remove('active'));
  elements.chartTabsNav.forEach(btn => btn.addEventListener('click', () => switchChartTab(btn.dataset.tab)));
  if (elements.printSummaryBtn) elements.printSummaryBtn.addEventListener('click', () => window.print());

  // Follow-up Modal
  if (elements.openFollowUpBtn) elements.openFollowUpBtn.addEventListener('click', openFollowUpModal);
  if (elements.timelineAddVisitBtn) elements.timelineAddVisitBtn.addEventListener('click', openFollowUpModal);
  if (elements.closeFollowUpBtn) elements.closeFollowUpBtn.addEventListener('click', () => elements.followUpModal.classList.remove('active'));
  if (elements.cancelFollowUpBtn) elements.cancelFollowUpBtn.addEventListener('click', () => elements.followUpModal.classList.remove('active'));
  if (elements.followUpForm) elements.followUpForm.addEventListener('submit', handleFollowUpSubmit);

  // Referral Modal
  if (elements.openReferralBtn) elements.openReferralBtn.addEventListener('click', openReferralLetterModal);
  if (elements.closeReferralBtn) elements.closeReferralBtn.addEventListener('click', () => elements.referralModal.classList.remove('active'));
  if (elements.referralSpecialistSelect) elements.referralSpecialistSelect.addEventListener('change', updateReferralLetterText);
  if (elements.copyReferralBtn) elements.copyReferralBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(elements.referralLetterContent.textContent);
    showToast('Referral letter copied to clipboard!');
  });

  // Secondary filter dropdowns
  if (elements.filterDietSelect) {
    elements.filterDietSelect.addEventListener('change', (e) => {
      dietFilter = e.target.value;
      renderPatientList();
    });
  }

  if (elements.filterPaymentSelect) {
    elements.filterPaymentSelect.addEventListener('change', (e) => {
      paymentFilter = e.target.value;
      renderPatientList();
    });
  }

  if (elements.resetFiltersBtn) {
    elements.resetFiltersBtn.addEventListener('click', () => {
      activeFilter = 'all';
      dietFilter = 'all';
      paymentFilter = 'all';
      if (elements.filterDietSelect) elements.filterDietSelect.value = 'all';
      if (elements.filterPaymentSelect) elements.filterPaymentSelect.value = 'all';
      renderFilterToolbar();
      renderPatientList();
      showToast('Filters reset to default.');
    });
  }

  // Alter Encounter Modal listeners
  if (elements.chartAlterEncounterBtn) {
    elements.chartAlterEncounterBtn.addEventListener('click', () => {
      if (currentPatientId) openAlterEncounterModal(currentPatientId);
    });
  }

  if (elements.alterProcedurePreset) {
    elements.alterProcedurePreset.addEventListener('change', (e) => {
      const opt = e.target.selectedOptions[0];
      if (opt) {
        const name = opt.dataset.name;
        const fee = opt.dataset.fee;
        if (name !== undefined && name !== '') elements.alterProcedureName.value = name;
        if (fee !== undefined && fee !== '') elements.alterProcedureFee.value = fee;
      }
    });
  }

  if (elements.alterEncounterForm) {
    elements.alterEncounterForm.addEventListener('submit', handleAlterEncounterSubmit);
  }

  if (elements.closeAlterModalBtn) {
    elements.closeAlterModalBtn.addEventListener('click', closeAlterEncounterModal);
  }

  if (elements.cancelAlterBtn) {
    elements.cancelAlterBtn.addEventListener('click', closeAlterEncounterModal);
  }

  // Doc Viewer Modal
  if (elements.closeDocViewerBtn) elements.closeDocViewerBtn.addEventListener('click', () => elements.docViewerModal.classList.remove('active'));
  if (elements.docDownloadBtn) elements.docDownloadBtn.addEventListener('click', () => {
    if (currentPreviewAttachment) showToast(`Simulated download: ${currentPreviewAttachment.name}`);
  });

  // Backdrop clicks
  window.addEventListener('click', (e) => {
    if (e.target === elements.intakeModal) closeIntakeModal();
    if (e.target === elements.chartModal) elements.chartModal.classList.remove('active');
    if (e.target === elements.followUpModal) elements.followUpModal.classList.remove('active');
    if (e.target === elements.referralModal) elements.referralModal.classList.remove('active');
    if (e.target === elements.docViewerModal) elements.docViewerModal.classList.remove('active');
    if (e.target === elements.alterEncounterModal) closeAlterEncounterModal();
  });
}

function updateThemeUI(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = theme === 'dark' 
      ? '<span class="btn-icon">☀️</span> <span>Light Mode</span>' 
      : '<span class="btn-icon">🌙</span> <span>Dark Mode</span>';
    btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }
}

let lastThemeToggleTime = 0;
function toggleTheme() {
  const now = Date.now();
  if (now - lastThemeToggleTime < 300) return; // Debounce duplicate triggers
  lastThemeToggleTime = now;

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
  updateThemeUI(newTheme);
  showToast(newTheme === 'dark' ? 'Switched to Dark Mode' : 'Switched to Light Mode');
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  document.body.setAttribute('data-theme', saved);
  updateThemeUI(saved);
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


// Expose on window for direct HTML onclick execution
window.switchView = switchView;
window.openIntakeModal = openIntakeModal;
window.closeIntakeModal = closeIntakeModal;
window.openUserProfileModal = openUserProfileModal;
window.closeUserProfileModal = closeUserProfileModal;
window.toggleTheme = toggleTheme;
window.handleLogout = handleLogout;
window.openMobileSidebar = openMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.openPatientChart = openPatientChart;
window.viewPatientChart = openPatientChart;
window.closeChartModal = closeChartModal;
window.closeFollowUpModal = closeFollowUpModal;
window.closeReferralModal = closeReferralModal;
window.openFollowUpModal = openFollowUpModal;
window.openReferralModal = openReferralLetterModal;
window.openAlterEncounterModal = openAlterEncounterModal;
window.closeAlterEncounterModal = closeAlterEncounterModal;
window.updatePatientQueueStatus = updatePatientQueueStatus;
