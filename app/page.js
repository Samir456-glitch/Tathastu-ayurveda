"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// Master Presets
const DEFAULT_CATEGORIES = {
  "वटी / गुटिका": ["Chandraprabha Vati", "Arogyavardhini Vati", "Mahasudarshan Vati", "Sanjivani Vati", "Khadiradi Vati", "Chitrakadi Vati", "Lashunadi Vati", "Brahmi Vati", "Shankh Vati", "Giloy Ghanvati", "Pramehin"],
  "आसव / अरिष्ट": ["Amritarishta", "Ashokarishta", "Ashwagandharishta", "Arvindasava", "Balarishta", "Dashmularishta", "Draksharishta", "Kumaryasava", "Lohasava", "Punarnavarishta"],
  "चूर्ण": ["Triphala Churna", "Avipattikar Churna", "Hingwashtak Churna", "Sitopaladi Churna", "Talisadi Churna", "Trikatu Churna", "Lavan Bhaskar Churna", "Ashwagandha Churna", "Shatavari Churna"],
  "गुग्गुलु / रस / भस्म": ["Kaishore Guggulu", "Yograj Guggulu", "Gokshuradi Guggulu", "Triphala Guggulu", "Medohar Guggulu", "Madhumeha Kusumakar Ras", "Tribhuvan Kirti Ras", "Kamdudha Ras", "Sootshekhar Ras", "Godanti Bhasma", "Switran"],
  "क्वाथ / तैल / अन्य": ["Maharasnadi Kwath", "Dashmool Kwath", "Mahanarayan Taila", "Ksheerabala Taila", "Jatyadi Taila", "Triphala Ghrita", "Liv.52", "Cystone"]
};

const DEFAULT_SEVAN_KAAL = ["भोजन पश्चात (Post-Meal)", "भोजन पूर्व (Pre-Meal / प्राग्भक्त)", "प्रातः खाली पेट (Empty Stomach)", "भोजन मध्य (With Food)", "शयनकाल (Bedtime)", "दिन में दो बार (BD)", "दिन में तीन बार (TDS)", "यथावश्यक (SOS)"];
const DEFAULT_ANUPANA = ["कोष्ण जल (Lukewarm Water)", "शहद (Honey / मधु)", "दुग्ध / गोदुग्ध (Milk)", "गोघृत (Cow's Ghee)", "तक्र / छाछ (Buttermilk)", "ताज़ा जल (Fresh Water)", "तुलसी स्वरस", "अदरक स्वरस", "दशमूल क्वाथ", "पुनर्नवा क्वाथ", "बराबर मात्रा में जल"];
const DEFAULT_DOSES = ["1-1 वटी", "2-2 वटी", "1 वटी दिन में 3 बार", "3 ग्राम", "5 ग्राम", "1 चम्मच (5g)", "15ml बराबर जल मिलाकर", "20ml बराबर जल मिलाकर", "यथावश्यक"];
const DEFAULT_INVESTIGATIONS = ["CBC & ESR", "Blood Sugar (F & PP)", "HbA1c", "LFT (Liver Function)", "KFT (Kidney Function)", "Lipid Profile", "Urine R/M", "Serum Uric Acid", "Thyroid Profile (T3, T4, TSH)", "USG Whole Abdomen", "Chest X-Ray (PA View)", "12-Lead ECG"];

const DEFAULT_DOCTOR_SUGGESTIONS = [
  "Dr. Sumer Kumar Sharma (BAMS)",
  "Dr. Anshuman Mishra (BAMS)",
  "Dr. Prashant Rai (BAMS)",
  "Dr. Mohit Kumar (BAMS)"
];

const COMMON_DIAGNOSIS_SUGGESTIONS = [
  "Amalpitta / अम्लपित्त (Hyperacidity / GERD)",
  "Sandhivata / संधिवात (Osteoarthritis)",
  "Amavata / आमवात (Rheumatoid Arthritis)",
  "Grahani / ग्रहणी दोष (IBS / Malabsorption)",
  "Prameha / प्रमेह (Diabetes Mellitus)",
  "Arsha / अर्श (Piles / Hemorrhoids)",
  "Katishoola / कटीशूल (Back Pain / Sciatica)",
  "Kasa & Shwasa / कास व श्वास (Cough / Asthma)",
  "Twak Vikar / कुष्ठ / त्वक विकार (Skin Disease)",
  "Kamala / यकृत विकार / कामला (Jaundice / Liver)",
  "Sthaulya / स्थौल्य (Obesity / Weight Gain)",
  "Ajeerna / अग्निमांद्य / अजीर्ण (Indigestion)",
  "Vatavyadhi / वातव्याधि (Neurological / Pain)",
  "Shirashoola / शिरःशूल (Headache / Migraine)",
  "Anidra / अनिद्रा (Insomnia / Stress)"
];

const REFERRAL_SOURCES = [
  "Direct / स्वयं आए",
  "पुराने रोगी (Existing Patient Reference)",
  "Dr. Reference",
  "Social Media / Online",
  "स्टाफ / कैंप (Camp Reference)"
];

const PINS = {
  admin: "1234",
  doctor: "1111",
  reception: "2222",
  pharmacy: "3333"
};

function formatTime(isoStr) {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDate(isoStr) {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function AssessmentInput({ label, value, onChange, textarea = false, list = null }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "bold", color: "#333" }}>{label}</label>
      {textarea ? (
        <textarea rows="3" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
      ) : (
        <input list={list} type="text" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} />
      )}
    </div>
  );
}

export default function Home() {
  // Session Persistence (Swipe Refresh Fix)
  const [currentRole, setCurrentRole] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tathastu_role") || null;
    }
    return null;
  });

  const [enteredPin, setEnteredPin] = useState("");
  const [selectedRoleToLogin, setSelectedRoleToLogin] = useState("admin");
  const [loginError, setLoginError] = useState("");

  const [screen, setScreen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tathastu_screen") || "home";
    }
    return "home";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentRole) localStorage.setItem("tathastu_role", currentRole);
      else localStorage.removeItem("tathastu_role");
      if (screen) localStorage.setItem("tathastu_screen", screen);
    }
  }, [currentRole, screen]);

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [search, setSearch] = useState("");
  const [opdFilter, setOpdFilter] = useState("All");

  const [anupanaList, setAnupanaList] = useState(DEFAULT_ANUPANA);
  const [doseList, setDoseList] = useState(DEFAULT_DOSES);
  const [investigationList, setInvestigationList] = useState(DEFAULT_INVESTIGATIONS);
  const [doctorSuggestions, setDoctorSuggestions] = useState(DEFAULT_DOCTOR_SUGGESTIONS);
  const [medicineCategories, setMedicineCategories] = useState(DEFAULT_CATEGORIES);

  // Master Management State
  const [masterType, setMasterType] = useState("doctor");
  const [newMasterVal, setNewMasterVal] = useState("");
  const [newMasterCategory, setNewMasterCategory] = useState("वटी / गुटिका");

  // Hospital Settings State
  const [hospitalInfo, setHospitalInfo] = useState({
    hospital_name: "तथास्तु आयुर्वेद क्लिनिक व अनुसंधान केंद्र",
    tagline: "विशेष आयुर्वेद चिकित्सा, पंचकर्म एवं परामर्श केंद्र",
    address: "मुख्य मार्ग, निकट सदर अस्पताल",
    contact_phone: "+91 9876543210",
    doctor_name: "Dr. Sumer Kumar Sharma",
    doctor_qualification: "BAMS (KSDSU), CCAM",
    reg_number: "Reg. No: 4810 (BSCAUM)"
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  // New Patient State (With Fee Option)
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [complaint, setComplaint] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [bp, setBp] = useState("");
  const [pulseRate, setPulseRate] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [spo2, setSpo2] = useState("");
  const [feeAmount, setFeeAmount] = useState("200");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Edit Patient State
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editComplaint, setEditComplaint] = useState("");
  const [editReferredBy, setEditReferredBy] = useState("");
  const [editBp, setEditBp] = useState("");
  const [editPulseRate, setEditPulseRate] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editTemperature, setEditTemperature] = useState("");
  const [editSpo2, setEditSpo2] = useState("");
  const [editingPatient, setEditingPatient] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  // Clinical Assessment
  const [assessment, setAssessment] = useState({
    pulse: "", dosha: "", dhatu: "", mala: "", agni: "", ama: "", prakriti: "", vikriti: "",
    ashtavidha_nadi: "", ashtavidha_mutra: "", ashtavidha_mala: "", ashtavidha_jihwa: "",
    ashtavidha_shabda: "", ashtavidha_sparsha: "", ashtavidha_drik: "", ashtavidha_akriti: "",
    samprapti: "", diagnosis: "", treatment_plan: "", clinical_notes: ""
  });
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [assessmentMessage, setAssessmentMessage] = useState("");

  // Prescription
  const [attendingDoctor, setAttendingDoctor] = useState("Dr. Sumer Kumar Sharma (BAMS)");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("वटी / गुटिका");
  const [medicines, setMedicines] = useState([
    { category: "वटी / गुटिका", name: "", dose: "1-1 वटी", timing: "भोजन पश्चात (Post-Meal)", anupana: "कोष्ण जल (Lukewarm Water)" }
  ]);
  const [investigations, setInvestigations] = useState("");
  const [diet, setDiet] = useState("");
  const [followUpDays, setFollowUpDays] = useState("7");
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [prescriptionMsg, setPrescriptionMsg] = useState("");
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Pharmacy Queue & Dispensing
  const [pharmacyQueue, setPharmacyQueue] = useState([]);
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [dispenseRx, setDispenseRx] = useState(null);
  const [dispensePatient, setDispensePatient] = useState(null);
  const [dispenseItems, setDispenseItems] = useState([]);
  const [dispensePhone, setDispensePhone] = useState("");
  const [medicineBillAmount, setMedicineBillAmount] = useState("0");
  const [dispensePayMode, setDispensePayMode] = useState("Cash (नकद)");
  const [dispensing, setDispensing] = useState(false);

  // Follow-up
  const [followUps, setFollowUps] = useState([]);
  const [fuPhone, setFuPhone] = useState("");
  const [fuSymptomRelief, setFuSymptomRelief] = useState("50% सुधार");
  const [fuPulse, setFuPulse] = useState("");
  const [fuNewComplaints, setFuNewComplaints] = useState("");
  const [fuTreatmentMod, setFuTreatmentMod] = useState("पूर्वतः औषधि चालू रखें");
  const [fuNextVisit, setFuNextVisit] = useState("7");
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState("");
  const [lastSavedFu, setLastSavedFu] = useState(null);
  const [showSendPrompt, setShowSendPrompt] = useState(false);

  // Billing
  const [consultFee, setConsultFee] = useState("200");
  const [medFee, setMedFee] = useState("0");
  const [procedureFee, setProcedureFee] = useState("0");
  const [discountFee, setDiscountFee] = useState("0");
  const [payMode, setPayMode] = useState("Cash (नकद)");
  const [billNotes, setBillNotes] = useState("");
  const [savingBill, setSavingBill] = useState(false);
  const [billMsg, setBillMsg] = useState("");
  const [billsList, setBillsList] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);

  // Date-wise Report
  const [filterStartDate, setFilterStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterEndDate, setFilterEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [filteredReportBills, setFilteredReportBills] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportStats, setReportStats] = useState({
    opdCount: 0,
    consultationTotal: 0,
    medicineSalesTotal: 0,
    procedureTotal: 0,
    grandTotal: 0,
    cashTotal: 0,
    onlineTotal: 0
  });

  // Enhanced Inventory & Bulk CSV
  const [inventoryList, setInventoryList] = useState([]);
  const [invSearch, setInvSearch] = useState("");
  const [invMedName, setInvMedName] = useState("");
  const [invBrand, setInvBrand] = useState("Baidyanath");
  const [invCategory, setInvCategory] = useState("वटी / गुटिका");
  const [invQty, setInvQty] = useState("");
  const [invUnit, setInvUnit] = useState("डब्बी (Jar/Box)");
  const [invPrice, setInvPrice] = useState("");
  const [savingInv, setSavingInv] = useState(false);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Patient Documents
  const [patientDocs, setPatientDocs] = useState([]);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState("Lab Report (रक्त/मूत्र जाँच)");
  const [newDocNotes, setNewDocNotes] = useState("");
  const [savingDoc, setSavingDoc] = useState(false);

  // Counters
  const [stats, setStats] = useState({ 
    todayCount: 0, 
    waitingCount: 0, 
    completedCount: 0, 
    pharmacyPending: 0
  });

  // Today's Shift Calculation for Reception Desk
  const [todayPatientsList, setTodayPatientsList] = useState([]);

  useEffect(() => {
    loadHospitalSettings();
    loadMasterPresets();
    fetchStats();
    fetchInventory();
  }, []);

  // Auto-reload patient queue on screen change or page refresh
  useEffect(() => {
    if (screen === "patients") {
      fetchPatients();
    }
  }, [screen]);

  function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    if (enteredPin === PINS[selectedRoleToLogin]) {
      setCurrentRole(selectedRoleToLogin);
      setEnteredPin("");
      setScreen("home");
    } else {
      setLoginError("❌ गलत पिन कोड! कृपया सही PIN दर्ज करें।");
    }
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tathastu_role");
      localStorage.removeItem("tathastu_screen");
    }
    setCurrentRole(null);
    setEnteredPin("");
    setScreen("loginScreen");
  }

  async function loadHospitalSettings() {
    try {
      const { data } = await supabase.from("hospital_settings").select("*").eq("id", 1).single();
      if (data) setHospitalInfo(data);
    } catch (e) {
      console.log(e);
    }
  }

  async function loadMasterPresets() {
    try {
      const { data } = await supabase.from("master_presets").select("*");
      const meds = { ...DEFAULT_CATEGORIES };
      const anp = [...DEFAULT_ANUPANA];
      const doses = [...DEFAULT_DOSES];
      const invs = [...DEFAULT_INVESTIGATIONS];
      const docs = [...DEFAULT_DOCTOR_SUGGESTIONS];

      if (data && data.length > 0) {
        data.forEach((item) => {
          if (item.preset_type === "medicine") {
            const cat = item.category || "अन्य";
            if (!meds[cat]) meds[cat] = [];
            if (!meds[cat].includes(item.preset_value)) meds[cat].push(item.preset_value);
          } else if (item.preset_type === "anupana" && !anp.includes(item.preset_value)) {
            anp.push(item.preset_value);
          } else if (item.preset_type === "dose" && !doses.includes(item.preset_value)) {
            doses.push(item.preset_value);
          } else if (item.preset_type === "investigation" && !invs.includes(item.preset_value)) {
            invs.push(item.preset_value);
          } else if (item.preset_type === "doctor" && !docs.includes(item.preset_value)) {
            docs.push(item.preset_value);
          }
        });
      }

      setMedicineCategories(meds);
      setAnupanaList(anp);
      setDoseList(doses);
      setInvestigationList(invs);
      setDoctorSuggestions(docs);
    } catch (e) {
      console.log(e);
    }
  }

  async function addMasterPreset() {
    if (!newMasterVal.trim()) return;
    try {
      await supabase.from("master_presets").insert([{
        preset_type: masterType,
        preset_value: newMasterVal.trim(),
        category: newMasterCategory
      }]);
      setNewMasterVal("");
      loadMasterPresets();
      alert("✅ नया विकल्प सफलतापूर्वक जुड़ गया!");
    } catch (e) {
      alert("त्रुटि: " + e.message);
    }
  }

  async function saveHospitalSettings() {
    setSavingSettings(true);
    setSettingsMsg("⏳ सेटिंग्स सहेजी जा रही हैं...");
    try {
      const { error } = await supabase.from("hospital_settings").upsert({ id: 1, ...hospitalInfo });
      if (error) throw error;
      setSettingsMsg("✅ हॉस्पिटल विवरण सफलतापूर्वक अपडेट हो गया!");
      setTimeout(() => setSettingsMsg(""), 2500);
    } catch (e) {
      setSettingsMsg("❌ Error: " + e.message);
    } finally {
      setSavingSettings(false);
    }
  }

  async function fetchStats() {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: todPatients } = await supabase.from("patients").select("*").gte("created_at", todayStart.toISOString()).order("id", { ascending: true });
      const { data: pharmacyData } = await supabase.from("prescriptions").select("pharmacy_status").gte("created_at", todayStart.toISOString());

      const todList = todPatients || [];
      setTodayPatientsList(todList);
      const waiting = todList.filter((p) => (p.opd_status || "Waiting") === "Waiting").length;
      const completed = todList.filter((p) => p.opd_status === "Completed").length;
      
      const rxList = pharmacyData || [];
      const pharmPending = rxList.filter((r) => (r.pharmacy_status || "Pending") === "Pending").length;

      setStats({ 
        todayCount: todList.length, 
        waitingCount: waiting, 
        completedCount: completed, 
        pharmacyPending: pharmPending
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchDateWiseAccounts(startD = filterStartDate, endD = filterEndDate) {
    setReportLoading(true);
    try {
      const s = new Date(startD);
      s.setHours(0, 0, 0, 0);

      const e = new Date(endD);
      e.setHours(23, 59, 59, 999);

      const [pRes, bRes, rxRes] = await Promise.all([
        supabase.from("patients").select("*").gte("created_at", s.toISOString()).lte("created_at", e.toISOString()),
        supabase.from("billings").select("*, patients(name, phone)").gte("created_at", s.toISOString()).lte("created_at", e.toISOString()).order("created_at", { ascending: false }),
        supabase.from("prescriptions").select("medicine_bill_amount").gte("created_at", s.toISOString()).lte("created_at", e.toISOString())
      ]);

      const pList = pRes.data || [];
      const bList = bRes.data || [];
      const rxList = rxRes.data || [];

      const consult = bList.reduce((acc, curr) => acc + (Number(curr.consultation_fee) || 0), 0);
      const proc = bList.reduce((acc, curr) => acc + (Number(curr.procedure_fee) || 0), 0);
      const medFromBills = bList.reduce((acc, curr) => acc + (Number(curr.medicine_fee) || 0), 0);
      const medFromRx = rxList.reduce((acc, curr) => acc + (Number(curr.medicine_bill_amount) || 0), 0);
      const totalMedSales = Math.max(medFromBills, medFromRx);

      const grandTot = bList.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || (consult + proc + totalMedSales);
      const cash = bList.filter(b => (b.payment_mode || "").includes("Cash") || (b.payment_mode || "").includes("नकद")).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
      const online = grandTot - cash;

      setFilteredReportBills(bList);
      setReportStats({
        opdCount: pList.length,
        consultationTotal: consult,
        medicineSalesTotal: totalMedSales,
        procedureTotal: proc,
        grandTotal: grandTot,
        cashTotal: Math.max(0, cash),
        onlineTotal: Math.max(0, online)
      });
      setScreen("incomeReportScreen");
    } catch (err) {
      alert("रिपोर्ट लोड करने में त्रुटि: " + err.message);
    } finally {
      setReportLoading(false);
    }
  }

  async function exportPatientsCSV() {
    try {
      const { data } = await supabase.from("patients").select("*").order("id", { ascending: true });
      if (!data || data.length === 0) return alert("कोई डेटा उपलब्ध नहीं है");
      let csvContent = "data:text/csv;charset=utf-8,ID,UHID,Name,Age,Gender,Phone,Complaint,Referral,BP,Pulse,Weight,Temp,SpO2,Fee,PayStatus,PayMode,Date,Status\n";
      data.forEach((p) => {
        csvContent += `${p.id},TAT-${p.id},"${p.name || ""}",${p.age || ""},${p.gender || ""},"${p.phone || ""}","${(p.complaint || "").replace(/"/g, '""')}","${p.referred_by || ""}","${p.bp || ""}","${p.pulse_rate || ""}","${p.weight || ""}","${p.temperature || ""}","${p.spo2 || ""}",${p.fee_amount || 0},"${p.payment_status || ""}","${p.payment_mode || ""}","${formatDate(p.created_at)}",${p.opd_status || ""}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Tathastu_OPD_Backup_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("बैकअप डाउनलोड में त्रुटि: " + e.message);
    }
  }

  // Sample CSV Template Download for Pharmacy
  function downloadSampleMedicineCSV() {
    const csvHeader = "medicine_name,brand,category,stock_quantity,unit,price\n";
    const sampleRows = [
      "Chandraprabha Vati,Baidyanath,वटी / गुटिका,50,डब्बी (Jar/Box),120",
      "Arogyavardhini Vati,Dabur,वटी / गुटिका,40,डब्बी (Jar/Box),110",
      "Triphala Churna,Patanjali,चूर्ण,30,पैकेट (Pkt),60",
      "Dashmularishta,Baidyanath,आसव / अरिष्ट,25,बोतल (Bottle),180",
      "Gokshuradi Guggulu,Dhootapapeshwar,गुग्गुलु / रस / भस्म,20,डब्बी (Jar/Box),190"
    ].join("\n");

    const blob = new Blob([csvHeader + sampleRows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Tathastu_Medicine_Stock_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Bulk CSV File Upload for Pharmacy
  async function handleBulkMedicineUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBulk(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        if (!text) throw new Error("फ़ाइल खाली है");

        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) throw new Error("फ़ाइल में कोई डेटा पंक्ति नहीं मिली");

        const parsedItems = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 2 && cols[0]) {
            parsedItems.push({
              medicine_name: cols[0],
              brand: cols[1] || "Baidyanath",
              category: cols[2] || "वटी / गुटिका",
              stock_quantity: Number(cols[3]) || 10,
              unit: cols[4] || "डब्बी (Jar/Box)",
              price: Number(cols[5]) || 0,
              min_alert_limit: 10
            });
          }
        }

        if (parsedItems.length === 0) throw new Error("कोई मान्य दवा पंक्ति नहीं मिली");

        const { error } = await supabase.from("inventory").insert(parsedItems);
        if (error) throw error;

        alert(`✅ सफलतापूर्वक ${parsedItems.length} दवाइयाँ स्टॉक में जुड़ गईं!`);
        fetchInventory();
      } catch (err) {
        alert("अपलोड में त्रुटि: " + err.message);
      } finally {
        setUploadingBulk(false);
        e.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  // Save Patient with Auto-Billing Insertion
  async function savePatient() {
    setMessage("");
    if (!name.trim()) {
      setMessage("⚠️ रोगी का नाम भरना जरूरी है।");
      return;
    }
    setSaving(true);
    setMessage("⏳ रोगी सहेजा जा रहा है...");
    try {
      const patient = {
        name: name.trim(),
        age: age ? Number(age) : null,
        gender: gender || null,
        phone: phone.trim() || null,
        complaint: complaint.trim() || null,
        bp: bp.trim() || null,
        pulse_rate: pulseRate.trim() || null,
        weight: weight.trim() || null,
        temperature: temperature.trim() || null,
        spo2: spo2.trim() || null,
        fee_amount: Number(feeAmount) || 0,
        payment_status: paymentStatus,
        payment_mode: paymentMode,
        opd_status: "Waiting",
        created_at: new Date().toISOString()
      };

      if (referredBy && referredBy.trim()) {
        patient.referred_by = referredBy.trim();
      }

      let { data, error } = await supabase.from("patients").insert([patient]).select().single();
      
      if (error && error.message && error.message.includes("referred_by")) {
        delete patient.referred_by;
        const retryRes = await supabase.from("patients").insert([patient]).select().single();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) throw error;

      // Auto-insert billing record for Financial Accounts Dashboard
      if (Number(feeAmount) > 0 && paymentStatus === "Paid") {
        await supabase.from("billings").insert([{
          patient_id: data?.id,
          consultation_fee: Number(feeAmount) || 0,
          medicine_fee: 0,
          procedure_fee: 0,
          discount: 0,
          total_amount: Number(feeAmount) || 0,
          payment_mode: paymentMode === "Cash" ? "Cash (नकद)" : "UPI / Online",
          notes: "OPD Consultation Fee",
          created_at: new Date().toISOString()
        }]);
      }

      const generatedId = data?.id ? `TAT-${data.id}` : "";
      const regTime = formatTime(data?.created_at || patient.created_at);
      setMessage(`✅ टोकन जारी! (UHID: ${generatedId} | समय: ${regTime})`);
      setName(""); setAge(""); setGender(""); setPhone(""); setComplaint(""); setReferredBy("");
      setBp(""); setPulseRate(""); setWeight(""); setTemperature(""); setSpo2("");
      setFeeAmount("200");
      setPaymentStatus("Paid");
      setPaymentMode("Cash");
      fetchStats();
    } catch (error) {
      setMessage("❌ Save Error: " + (error?.message || "Failed"));
    } finally {
      setSaving(false);
    }
  }

  async function updatePatientOpdStatus(pId, newStatus, reQueueToday = false) {
    try {
      const updatePayload = { opd_status: newStatus };
      if (reQueueToday) {
        updatePayload.created_at = new Date().toISOString();
      }
      await supabase.from("patients").update(updatePayload).eq("id", pId);
      if (selectedPatient && selectedPatient.id === pId) {
        setSelectedPatient({ ...selectedPatient, ...updatePayload });
      }
      fetchPatients();
      fetchStats();
    } catch (e) {
      console.log(e);
    }
  }

  function startEditPatient() {
    if (!selectedPatient) return;
    setEditName(selectedPatient.name || "");
    setEditAge(selectedPatient.age?.toString() || "");
    setEditGender(selectedPatient.gender || "");
    setEditPhone(selectedPatient.phone || "");
    setEditComplaint(selectedPatient.complaint || "");
    setEditReferredBy(selectedPatient.referred_by || "");
    setEditBp(selectedPatient.bp || "");
    setEditPulseRate(selectedPatient.pulse_rate || "");
    setEditWeight(selectedPatient.weight || "");
    setEditTemperature(selectedPatient.temperature || "");
    setEditSpo2(selectedPatient.spo2 || "");
    setEditMsg("");
    setScreen("editPatient");
  }

  async function updatePatientDetails() {
    if (!selectedPatient?.id) return;
    if (!editName.trim()) {
      setEditMsg("⚠️ रोगी का नाम आवश्यक है।");
      return;
    }
    setEditingPatient(true);
    setEditMsg("⏳ विवरण अपडेट किया जा रहा है...");
    try {
      const updatedData = {
        name: editName.trim(),
        age: editAge ? Number(editAge) : null,
        gender: editGender || null,
        phone: editPhone.trim() || null,
        complaint: editComplaint.trim() || null,
        bp: editBp.trim() || null,
        pulse_rate: editPulseRate.trim() || null,
        weight: editWeight.trim() || null,
        temperature: editTemperature.trim() || null,
        spo2: editSpo2.trim() || null
      };

      if (editReferredBy && editReferredBy.trim()) {
        updatedData.referred_by = editReferredBy.trim();
      }

      let { data, error } = await supabase.from("patients").update(updatedData).eq("id", selectedPatient.id).select().single();
      
      if (error && error.message && error.message.includes("referred_by")) {
        delete updatedData.referred_by;
        const retryRes = await supabase.from("patients").update(updatedData).eq("id", selectedPatient.id).select().single();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) throw error;
      setSelectedPatient(data);
      setEditMsg("✅ विवरण सफलतापूर्वक अपडेट हो गया!");
      setTimeout(() => setScreen("profile"), 800);
    } catch (err) {
      setEditMsg("❌ Update Error: " + err.message);
    } finally {
      setEditingPatient(false);
    }
  }

  async function fetchPatients() {
    try {
      setLoadingPatients(true);
      const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      alert("रोगी सूची लोड नहीं हुई: " + error.message);
    } finally {
      setLoadingPatients(false);
    }
  }

  function openPatientList(filter = "All") {
    setSearch("");
    setOpdFilter(filter);
    setSelectedPatient(null);
    setScreen("patients");
    fetchPatients();
  }

  function updateAssessment(field, value) {
    setAssessment((prev) => ({ ...prev, [field]: value }));
  }

  async function saveAssessment() {
    const pId = selectedPatient?.id;
    if (!pId) {
      setAssessmentMessage("❌ रोगी का चयन नहीं हुआ है।");
      return;
    }
    setSavingAssessment(true);
    setAssessmentMessage("⏳ Assessment सहेजा जा रहा है...");
    try {
      const assessmentData = { patient_id: pId, ...assessment };
      const { error } = await supabase.from("clinical_assessments").insert([assessmentData]);
      if (error) throw error;
      setAssessmentMessage("✅ Clinical Assessment सफलतापूर्वक सहेजा गया!");
    } catch (error) {
      setAssessmentMessage("❌ Error: " + error.message);
    } finally {
      setSavingAssessment(false);
    }
  }

  const addMedicineFromCategory = (medName, catName) => {
    let defaultDose = "1-1 वटी";
    if (catName === "चूर्ण") defaultDose = "3 ग्राम";
    if (catName === "आसव / अरिष्ट") defaultDose = "15ml बराबर जल मिलाकर";
    if (catName === "गुग्गुलु / रस / भस्म") defaultDose = "1-1 वटी";
    if (catName === "क्वाथ / तैल / अन्य") defaultDose = "यथावश्यक";

    setMedicines([
      ...medicines,
      { category: catName, name: medName, dose: defaultDose, timing: "भोजन पश्चात (Post-Meal)", anupana: "कोष्ण जल (Lukewarm Water)" }
    ]);
  };

  const addEmptyMedicineRow = () => {
    setMedicines([
      ...medicines,
      { category: selectedCategoryTab, name: "", dose: "1-1 वटी", timing: "भोजन पश्चात (Post-Meal)", anupana: "कोष्ण जल (Lukewarm Water)" }
    ]);
  };

  const updateMedicineRow = (index, field, val) => {
    const updated = [...medicines];
    updated[index][field] = val;
    setMedicines(updated);
  };

  const removeMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const addInvestigationTag = (test) => {
    if (investigations.includes(test)) return;
    setInvestigations(investigations ? `${investigations}, ${test}` : test);
  };

  async function savePrescription() {
    if (!selectedPatient?.id) return;
    setSavingPrescription(true);
    setPrescriptionMsg("⏳ पर्चा सहेजा जा रहा है...");

    try {
      const nowIso = new Date().toISOString();
      const cleanMedicines = medicines.filter(m => m.name && m.name.trim());
      const newRx = {
        patient_id: selectedPatient.id,
        medicines: cleanMedicines.length > 0 ? cleanMedicines : medicines,
        diet_instructions: diet,
        lifestyle_advice: attendingDoctor,
        follow_up_days: followUpDays ? Number(followUpDays) : 7,
        investigations: investigations,
        pharmacy_status: "Pending",
        medicine_bill_amount: 0,
        created_at: nowIso
      };

      const { data, error } = await supabase.from("prescriptions").insert([newRx]).select().single();
      if (error) throw error;

      await updatePatientOpdStatus(selectedPatient.id, "Completed");
      setCurrentPrescription(data || newRx);
      setPrescriptionMsg("✅ पर्चा सहेजा गया!");
      fetchStats();
      setTimeout(() => setScreen("printPreview"), 600);
    } catch (err) {
      setPrescriptionMsg("❌ एरर: " + err.message);
    } finally {
      setSavingPrescription(false);
    }
  }

  async function fetchPatientPrescriptions() {
    if (!selectedPatient?.id) return;
    try {
      const { data, error } = await supabase.from("prescriptions").select("*").eq("patient_id", selectedPatient.id).order("created_at", { ascending: false });
      if (error) throw error;
      setSavedPrescriptions(data || []);
      setScreen("prescriptionList");
    } catch (err) {
      alert("पर्चा लोड करने में समस्या: " + err.message);
    }
  }

  // Pharmacy Queue & Dispense
  async function fetchPharmacyQueue() {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*, patients(*)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setPharmacyQueue(data || []);
      setScreen("pharmacyQueueScreen");
    } catch (err) {
      alert("फार्मेसी कतार लोड नहीं हुई: " + err.message);
    }
  }

  function openDispenseModal(rx) {
    setDispenseRx(rx);
    setDispensePatient(rx.patients);
    setDispensePhone(rx.patients?.phone || "");
    
    const items = (rx.medicines || []).filter(m => m.name && m.name.trim()).map((m) => {
      let defaultUnit = "डब्बी (Jar/Box)";
      if (m.category === "आसव / अरिष्ट" || m.category === "क्वाथ / तैल / अन्य") defaultUnit = "बोतल (Bottle)";
      if (m.category === "चूर्ण") defaultUnit = "पैकेट (Pkt)";

      const matchingInv = inventoryList.find(inv => (inv.medicine_name || "").toLowerCase().includes(m.name.toLowerCase()));
      const price = matchingInv?.price || 0;

      return {
        name: m.name,
        category: m.category || "औषधि",
        dose: m.dose || "—",
        qty: 1,
        unit: matchingInv?.unit || defaultUnit,
        pricePerUnit: price,
        total: price,
        availableStock: matchingInv?.stock_quantity ?? "—"
      };
    });

    setDispenseItems(items);
    const calculatedTotal = items.reduce((acc, curr) => acc + curr.total, 0);
    setMedicineBillAmount(rx.medicine_bill_amount ? rx.medicine_bill_amount.toString() : calculatedTotal.toString());
    setScreen("dispenseScreen");
  }

  function updateDispenseItemRow(index, field, value) {
    const updated = [...dispenseItems];
    updated[index][field] = value;

    const q = Number(updated[index].qty) || 0;
    const p = Number(updated[index].pricePerUnit) || 0;
    updated[index].total = q * p;

    setDispenseItems(updated);
    const grandTotal = updated.reduce((acc, curr) => acc + curr.total, 0);
    setMedicineBillAmount(grandTotal.toString());
  }

  function addDispenseItemRow() {
    setDispenseItems([
      ...dispenseItems,
      {
        name: "",
        category: "अन्य",
        dose: "—",
        qty: 1,
        unit: "डब्बी (Jar/Box)",
        pricePerUnit: 0,
        total: 0,
        availableStock: "—"
      }
    ]);
  }

  function removeDispenseItemRow(index) {
    const updated = dispenseItems.filter((_, i) => i !== index);
    setDispenseItems(updated);
    const grandTotal = updated.reduce((acc, curr) => acc + curr.total, 0);
    setMedicineBillAmount(grandTotal.toString());
  }

  async function completeDispensing() {
    if (!dispenseRx?.id) return;
    setDispensing(true);
    try {
      const amount = Number(medicineBillAmount) || 0;

      await supabase.from("prescriptions").update({
        pharmacy_status: "Dispensed",
        medicine_bill_amount: amount,
        dispensed_at: new Date().toISOString()
      }).eq("id", dispenseRx.id);

      for (const item of dispenseItems) {
        if (item.name && item.name.trim()) {
          const { data: invMatches } = await supabase.from("inventory").select("*").ilike("medicine_name", `%${item.name.trim()}%`);
          if (invMatches && invMatches.length > 0) {
            const stockRow = invMatches[0];
            const deductQty = Number(item.qty) || 1;
            const updatedStock = Math.max(0, (stockRow.stock_quantity || 0) - deductQty);
            await supabase.from("inventory").update({ stock_quantity: updatedStock }).eq("id", stockRow.id);
          }
        }
      }

      if (amount > 0 && dispensePatient?.id) {
        await supabase.from("billings").insert([{
          patient_id: dispensePatient.id,
          consultation_fee: 0,
          medicine_fee: amount,
          procedure_fee: 0,
          discount: 0,
          total_amount: amount,
          payment_mode: dispensePayMode,
          notes: `Pharmacy Rx Dispensed #${dispenseRx.id}`,
          created_at: new Date().toISOString()
        }]);
      }

      fetchInventory();
      fetchStats();
      setScreen("printMedicineBillPreview");
    } catch (err) {
      alert("वितरण पूरा करने में त्रुटि: " + err.message);
    } finally {
      setDispensing(false);
    }
  }

  function shareMedicineBillWhatsApp() {
    if (!dispensePatient || !dispenseRx) return;
    const billAmt = medicineBillAmount || dispenseRx.medicine_bill_amount || 0;
    const billTime = formatTime(dispenseRx.dispensed_at || new Date().toISOString());
    const billDate = formatDate(dispenseRx.dispensed_at || new Date().toISOString());

    let text = `🌿 *${hospitalInfo.hospital_name} - मेडिकल स्टोर बिल*\n\n`;
    text += `*रोगी:* ${dispensePatient.name} (TAT-${dispensePatient.id})\n`;
    text += `*Rx पर्चा सं.:* RX-${dispenseRx.id}\n`;
    text += `*दिनांक व समय:* ${billDate} (${billTime})\n\n`;
    text += `💊 *दी गई दवाइयों का विवरण:*\n`;
    dispenseItems.filter(m => m.name && m.name.trim()).forEach((m, idx) => {
      text += `${idx + 1}. *${m.name}* - ${m.qty} ${m.unit} @ ₹${m.pricePerUnit} = ₹${m.total}\n`;
    });
    text += `\n-------------------------\n`;
    text += `*कुल औषधि देय राशि:* ₹${billAmt} (${dispensePayMode})\n\n`;
    text += `_स्वास्थ्य लाभ की शुभकामनाओं सहित!_`;

    const phoneToSend = dispensePhone || dispensePatient.phone || "";
    const rawPhone = phoneToSend.replace(/\D/g, "");
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const url = formattedPhone ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // Inventory Functions
  async function fetchInventory() {
    try {
      const { data, error } = await supabase.from("inventory").select("*").order("medicine_name", { ascending: true });
      if (error) throw error;
      const list = data || [];
      setInventoryList(list);
      const lowCount = list.filter(i => (Number(i.stock_quantity) || 0) <= 10).length;
      setLowStockCount(lowCount);
    } catch (err) {
      console.log("Inventory load error:", err.message);
    }
  }

  function openInventoryScreen() {
    fetchInventory();
    setScreen("inventoryScreen");
  }

  async function addOrUpdateInventoryItem() {
    if (!invMedName.trim() || !invQty) return alert("कृपया दवा का नाम और स्टॉक मात्रा भरें");
    setSavingInv(true);
    try {
      const { data: existing } = await supabase.from("inventory").select("*").ilike("medicine_name", invMedName.trim());

      if (existing && existing.length > 0) {
        const currentItem = existing[0];
        const newTotal = (currentItem.stock_quantity || 0) + Number(invQty);
        await supabase.from("inventory").update({
          stock_quantity: newTotal,
          brand: invBrand,
          category: invCategory,
          unit: invUnit,
          price: Number(invPrice) || currentItem.price || 0
        }).eq("id", currentItem.id);
      } else {
        await supabase.from("inventory").insert([{
          medicine_name: invMedName.trim(),
          brand: invBrand,
          category: invCategory,
          stock_quantity: Number(invQty),
          unit: invUnit,
          price: Number(invPrice) || 0,
          min_alert_limit: 10
        }]);
      }

      setInvMedName("");
      setInvQty("");
      setInvPrice("");
      fetchInventory();
      alert("✅ स्टॉक सफलतापूर्वक जुड़ गया!");
    } catch (err) {
      alert("दवा जोड़ने में त्रुटि: " + err.message);
    } finally {
      setSavingInv(false);
    }
  }

  async function updateStockDirectly(id, currentStock, delta) {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await supabase.from("inventory").update({ stock_quantity: newStock }).eq("id", id);
      fetchInventory();
    } catch (e) {
      console.log(e);
    }
  }

  // Follow-up
  async function fetchFollowUps() {
    if (!selectedPatient?.id) return;
    try {
      setFuPhone(selectedPatient.phone || "");
      setShowSendPrompt(false);
      const { data, error } = await supabase.from("follow_ups").select("*").eq("patient_id", selectedPatient.id).order("created_at", { ascending: false });
      if (error) throw error;
      setFollowUps(data || []);
      setScreen("followUpScreen");
    } catch (err) {
      alert("Follow-up डेटा लोड नहीं हुआ: " + err.message);
    }
  }

  async function saveFollowUp() {
    if (!selectedPatient?.id) return;
    setSavingFollowUp(true);
    setFollowUpMsg("⏳ Follow-up सहेजा जा रहा है...");
    try {
      const fuData = {
        patient_id: selectedPatient.id,
        symptom_relief: fuSymptomRelief,
        pulse: fuPulse,
        new_complaints: fuNewComplaints,
        treatment_modification: fuTreatmentMod,
        attending_doctor: attendingDoctor,
        next_visit_days: fuNextVisit ? Number(fuNextVisit) : 7,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from("follow_ups").insert([fuData]).select().single();
      if (error) throw error;
      setLastSavedFu(data || fuData);
      setFollowUpMsg("✅ Follow-up सफलतापूर्वक सहेजा गया!");
      setShowSendPrompt(true);
      fetchFollowUps();
    } catch (err) {
      setFollowUpMsg("❌ Error: " + err.message);
    } finally {
      setSavingFollowUp(false);
    }
  }

  function shareFollowUpWhatsApp(fuItem, targetPhone = null) {
    if (!selectedPatient) return;
    const fu = fuItem || lastSavedFu || {
      symptom_relief: fuSymptomRelief,
      treatment_modification: fuTreatmentMod,
      next_visit_days: fuNextVisit,
      created_at: new Date().toISOString()
    };
    let text = `🌿 *${hospitalInfo.hospital_name} - अनुवर्तन (Follow-up)*\n\n`;
    text += `*रोगी ID:* TAT-${selectedPatient.id}\n`;
    text += `*रोगी:* ${selectedPatient.name}\n`;
    text += `*विज़िट दिनांक:* ${formatDate(fu.created_at)} (${formatTime(fu.created_at)})\n`;
    text += `*सुधार:* ${fu.symptom_relief || "प्रगति पर"}\n`;
    text += `*निर्देश:* ${fu.treatment_modification || "पूर्वतः जारी रखें"}\n\n`;
    text += `📅 *अगली विज़िट:* ${fu.next_visit_days || 7} दिन बाद।\n`;
    text += `*वैद्य:* ${fu.attending_doctor || attendingDoctor}`;

    const phoneToSend = targetPhone || fuPhone || selectedPatient.phone || "";
    const rawPhone = phoneToSend.replace(/\D/g, "");
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const url = formattedPhone ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // Billing
  async function fetchPatientBills() {
    if (!selectedPatient?.id) return;
    try {
      const { data, error } = await supabase.from("billings").select("*").eq("patient_id", selectedPatient.id).order("created_at", { ascending: false });
      if (error) throw error;
      setBillsList(data || []);
      setScreen("billingScreen");
    } catch (err) {
      alert("बिल लोड नहीं हुआ: " + err.message);
    }
  }

  async function saveBillingReceipt() {
    if (!selectedPatient?.id) return;
    setSavingBill(true);
    setBillMsg("⏳ रसीद बन रही है...");
    try {
      const c = Number(consultFee) || 0;
      const m = Number(medFee) || 0;
      const p = Number(procedureFee) || 0;
      const d = Number(discountFee) || 0;
      const total = c + m + p - d;

      const billData = {
        patient_id: selectedPatient.id,
        consultation_fee: c,
        medicine_fee: m,
        procedure_fee: p,
        discount: d,
        total_amount: total,
        payment_mode: payMode,
        notes: billNotes,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from("billings").insert([billData]).select().single();
      if (error) throw error;
      setCurrentBill(data || billData);
      setBillMsg("✅ रसीद सफलतापूर्वक सहेजी गई!");
      fetchStats();
      setTimeout(() => setScreen("printBillPreview"), 600);
    } catch (err) {
      setBillMsg("❌ Error: " + err.message);
    } finally {
      setSavingBill(false);
    }
  }

  function shareBillWhatsApp() {
    if (!selectedPatient || !currentBill) return;
    let text = `🌿 *${hospitalInfo.hospital_name} - OPD रसीद*\n\n`;
    text += `*रसीद सं.:* RCP-${currentBill.id || "01"}\n`;
    text += `*रोगी:* ${selectedPatient.name} (TAT-${selectedPatient.id})\n`;
    text += `*दिनांक व समय:* ${formatDate(currentBill.created_at)} (${formatTime(currentBill.created_at)})\n\n`;
    text += `*विवरण:*\n`;
    text += `• परामर्श शुल्क: ₹${currentBill.consultation_fee}\n`;
    if (currentBill.medicine_fee > 0) text += `• औषधि शुल्क: ₹${currentBill.medicine_fee}\n`;
    if (currentBill.procedure_fee > 0) text += `• पंचकर्म/उपक्रम: ₹${currentBill.procedure_fee}\n`;
    if (currentBill.discount > 0) text += `• छूट: -₹${currentBill.discount}\n`;
    text += `-------------------------\n`;
    text += `*कुल भुगतान:* ₹${currentBill.total_amount} (${currentBill.payment_mode})\n\n`;
    text += `_स्वास्थ्य लाभ की शुभकामनाओं सहित!_`;

    const rawPhone = (selectedPatient.phone || "").replace(/\D/g, "");
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const url = formattedPhone ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // Documents
  async function fetchPatientDocuments() {
    if (!selectedPatient?.id) return;
    try {
      const { data, error } = await supabase.from("patient_documents").select("*").eq("patient_id", selectedPatient.id).order("created_at", { ascending: false });
      if (error) throw error;
      setPatientDocs(data || []);
      setScreen("patientDocsScreen");
    } catch (err) {
      alert("रिपोर्ट लोड नहीं हुई: " + err.message);
    }
  }

  async function savePatientDocumentEntry() {
    if (!selectedPatient?.id || !newDocTitle.trim()) return alert("कृपया जाँच/रिपोर्ट का शीर्षक भरें");
    setSavingDoc(true);
    try {
      const doc = {
        patient_id: selectedPatient.id,
        doc_title: newDocTitle.trim(),
        doc_type: newDocType,
        notes: newDocNotes.trim(),
        created_at: new Date().toISOString()
      };
      const { error } = await supabase.from("patient_documents").insert([doc]);
      if (error) throw error;
      setNewDocTitle("");
      setNewDocNotes("");
      fetchPatientDocuments();
    } catch (err) {
      alert("रिपोर्ट सहेजने में त्रुटि: " + err.message);
    } finally {
      setSavingDoc(false);
    }
  }

  async function downloadPdfDirect(areaId = "printableArea", docName = "Document") {
    setDownloadingPdf(true);
    try {
      if (!window.html2pdf) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.body.appendChild(script);
        await new Promise((res) => (script.onload = res));
      }
      const element = document.getElementById(areaId);
      const opt = {
        margin: [6, 6, 6, 6],
        filename: `${docName}_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };
      await window.html2pdf().set(opt).from(element).save();
    } catch (e) {
      alert("PDF डाउनलोड में समस्या आई।");
    } finally {
      setDownloadingPdf(false);
    }
  }

  function shareOnWhatsApp() {
    if (!selectedPatient || !currentPrescription) return;
    const regTime = formatTime(selectedPatient.created_at);
    const consultTime = formatTime(currentPrescription.created_at);

    let text = `🌿 *${hospitalInfo.hospital_name}*\n\n`;
    text += `*रोगी ID (UHID):* TAT-${selectedPatient.id}\n`;
    text += `*रोगी:* ${selectedPatient.name} (${selectedPatient.age || "—"}y / ${selectedPatient.gender || "—"})\n`;
    if (selectedPatient.referred_by) {
      text += `*Referred By:* ${selectedPatient.referred_by}\n`;
    }
    if (selectedPatient.bp || selectedPatient.pulse_rate || selectedPatient.weight) {
      text += `*Vitals:* BP: ${selectedPatient.bp || "—"} | Pulse: ${selectedPatient.pulse_rate || "—"} | Wt: ${selectedPatient.weight || "—"}kg\n`;
    }
    text += `*दिनांक:* ${formatDate(currentPrescription.created_at)}\n`;
    text += `*आगमन:* ${regTime} | *निकास:* ${consultTime}\n`;
    text += `*परामर्शक वैद्य:* ${currentPrescription.lifestyle_advice || attendingDoctor}\n\n`;
    text += `📋 *Rx (औषधि निर्देश):*\n`;
    currentPrescription.medicines?.forEach((m, idx) => {
      text += `${idx + 1}. *${m.name}* [${m.category || "औषधि"}]\n   - मात्रा: ${m.dose || "—"} | काल: ${m.timing || "—"}\n   - अनुपान: ${m.anupana || "—"}\n`;
    });
    if (currentPrescription.investigations) text += `\n🔬 *जाँच:* ${currentPrescription.investigations}\n`;
    if (currentPrescription.diet_instructions) text += `\n🥗 *पथ्यापथ्य:* ${currentPrescription.diet_instructions}\n`;
    text += `\n🔄 *पुनः परीक्षण:* ${currentPrescription.follow_up_days || 7} दिन बाद`;

    const rawPhone = (selectedPatient.phone || "").replace(/\D/g, "");
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const url = formattedPhone ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // Global Datalists
  const GlobalDatalists = () => (
    <>
      <datalist id="diagnosisSuggestions">
        {COMMON_DIAGNOSIS_SUGGESTIONS.map((d, i) => <option key={i} value={d} />)}
      </datalist>
      <datalist id="referralSources">
        {REFERRAL_SOURCES.map((r, i) => <option key={i} value={r} />)}
      </datalist>
      <datalist id="doctorSuggestions">
        {doctorSuggestions.map((doc, idx) => <option key={idx} value={doc} />)}
      </datalist>
    </>
  );

  // 0. LOGIN SCREEN
  if (!currentRole || screen === "loginScreen") {
    return (
      <main style={{ minHeight: "100vh", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <div style={{ background: "#fff", padding: "28px 22px", borderRadius: "14px", border: "1.5px solid #81c784", maxWidth: "380px", width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1 style={{ color: "#2e7d32", margin: "0 0 4px 0", fontSize: "24px" }}>🌿 Tathastu</h1>
            <h2 style={{ fontSize: "14px", color: "#333", margin: "0 0 4px 0" }}>{hospitalInfo.hospital_name}</h2>
            <div style={{ fontSize: "12px", color: "#666" }}>सुरक्षित डेस्क लॉगिन (PIN Login)</div>
          </div>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "6px", color: "#333" }}>
                🔑 अपना डेस्क / रोल चुनें:
              </label>
              <select
                value={selectedRoleToLogin}
                onChange={(e) => { setSelectedRoleToLogin(e.target.value); setLoginError(""); }}
                style={{ width: "100%", padding: "11px", borderRadius: "6px", border: "1.5px solid #2e7d32", fontWeight: "bold", background: "#f9fbf9", fontSize: "14px" }}
              >
                <option value="admin">👑 Admin Desk (Full Access & Accounts)</option>
                <option value="doctor">👨‍⚕️ वैद्य डेस्क (Doctor Desk - Clinical & OPD)</option>
                <option value="reception">🏢 रिसेप्शन डेस्क (Registration & Queue)</option>
                <option value="pharmacy">💊 मेडिकल स्टोर (Pharmacy & Stock)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "6px", color: "#333" }}>
                🔒 डेस्क सुरक्षा पिन (Security PIN):
              </label>
              <input
                type="password"
                maxLength="6"
                placeholder="4-अंकीय PIN दर्ज करें..."
                value={enteredPin}
                autoFocus
                onChange={(e) => setEnteredPin(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1.5px solid #ccc", boxSizing: "border-box", fontSize: "16px", textAlign: "center", letterSpacing: "4px" }}
              />
            </div>

            <button
              type="submit"
              style={{ width: "100%", padding: "12px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", marginTop: "6px" }}
            >
              🔓 डेस्क में प्रवेश करें
            </button>

            {loginError && (
              <div style={{ color: "#d32f2f", background: "#ffebee", padding: "8px", borderRadius: "6px", fontSize: "12px", textAlign: "center", fontWeight: "bold" }}>
                {loginError}
              </div>
            )}
          </form>

          <div style={{ marginTop: "20px", borderTop: "1px dashed #ddd", paddingTop: "12px", fontSize: "11px", color: "#777", textAlign: "center", lineHeight: "1.5" }}>
            डिफ़ॉल्ट पिन: <strong>Admin: 1234</strong> | <strong>Doctor: 1111</strong><br />
            <strong>Reception: 2222</strong> | <strong>Pharmacy: 3333</strong>
          </div>
        </div>
      </main>
    );
  }

  // 1. HOME SCREEN
  if (screen === "home") {
    const isAdmin = currentRole === "admin";
    const isDoctor = currentRole === "doctor" || isAdmin;
    const isReception = currentRole === "reception" || isAdmin;
    const isPharmacy = currentRole === "pharmacy" || isAdmin;

    const roleBadge = {
      admin: { name: "👑 Admin Desk", color: "#006064", bg: "#e0f7fa" },
      doctor: { name: "👨‍⚕️ वैद्य डेस्क", color: "#1b5e20", bg: "#e8f5e9" },
      reception: { name: "🏢 रिसेप्शन डेस्क", color: "#e65100", bg: "#fff8e1" },
      pharmacy: { name: "💊 मेडिकल स्टोर", color: "#4a148c", bg: "#f3e5f5" }
    }[currentRole] || { name: "डेस्क", color: "#333", bg: "#eee" };

    const shiftCash = todayPatientsList.filter(p => (p.payment_status === "Paid" || p.payment_status === "जमा") && p.payment_mode === "Cash").reduce((sum, p) => sum + (Number(p.fee_amount) || 0), 0);
    const shiftOnline = todayPatientsList.filter(p => (p.payment_status === "Paid" || p.payment_status === "जमा") && (p.payment_mode === "Online" || p.payment_mode === "UPI")).reduce((sum, p) => sum + (Number(p.fee_amount) || 0), 0);
    const shiftDue = todayPatientsList.filter(p => p.payment_status === "Due" || p.payment_status === "बाकी").reduce((sum, p) => sum + (Number(p.fee_amount) || 0), 0);

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <h1 style={{ color: "#2e7d32", margin: "0 0 2px 0" }}>🌿 Tathastu</h1>
            <h2 style={{ fontSize: "15px", color: "#333", margin: "0 0 4px 0" }}>{hospitalInfo.hospital_name}</h2>
            <span style={{ background: roleBadge.bg, color: roleBadge.color, padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
              {roleBadge.name}
            </span>
          </div>
          
          <div style={{ display: "flex", gap: "6px" }}>
            {isAdmin && (
              <button
                onClick={() => setScreen("settingsScreen")}
                style={{ padding: "6px 10px", background: "#fff", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
              >
                ⚙️ सेटिंग्स
              </button>
            )}
            <button
              onClick={handleLogout}
              style={{ padding: "6px 10px", background: "#ffebee", border: "1px solid #ffcdd2", color: "#c62828", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
            >
              🚪 Exit
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", maxWidth: "480px", margin: "14px 0" }}>
          <div onClick={() => openPatientList("All")} style={{ background: "#e8f5e9", border: "1px solid #c8e6c9", padding: "12px 6px", borderRadius: "8px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: "12px", color: "#2e7d32", fontWeight: "bold" }}>👥 कुल OPD</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#1b5e20", marginTop: "4px" }}>{stats.todayCount}</div>
          </div>
          <div onClick={() => openPatientList("Waiting")} style={{ background: "#fff8e1", border: "1.5px solid #ffe082", padding: "12px 6px", borderRadius: "8px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: "12px", color: "#f57f17", fontWeight: "bold" }}>⏳ Live Waiting</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#e65100", marginTop: "4px" }}>{stats.waitingCount}</div>
          </div>
          <div onClick={() => openPatientList("Completed")} style={{ background: "#e0f2f1", border: "1px solid #80cbc4", padding: "12px 6px", borderRadius: "8px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: "12px", color: "#00695c", fontWeight: "bold" }}>✅ Done</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#004d40", marginTop: "4px" }}>{stats.completedCount}</div>
          </div>
        </div>

        {/* Receptionist Shift & Handover Box */}
        {isReception && (
          <div style={{ background: "#ffffff", padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb", maxWidth: "480px", marginBottom: "14px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#374151", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
              <span>💼 आज का शिफ्ट हिसाब (Daily Collection)</span>
              <span style={{ fontSize: "11px", color: "#6b7280" }}>टोकन: {todayPatientsList.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", textAlign: "center" }}>
              <div style={{ background: "#f0fdf4", padding: "6px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "10px", color: "#166534" }}>💵 Cash जमा</div>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#15803d" }}>₹{shiftCash}</div>
              </div>
              <div style={{ background: "#eff6ff", padding: "6px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: "10px", color: "#1e40af" }}>📱 Online UPI</div>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1d4ed8" }}>₹{shiftOnline}</div>
              </div>
              <div style={{ background: "#fef2f2", padding: "6px", borderRadius: "6px", border: "1px solid #fecaca" }}>
                <div style={{ fontSize: "10px", color: "#991b1b" }}>⏳ बाकी (Due)</div>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#b91c1c" }}>₹{shiftDue}</div>
              </div>
            </div>
            <div style={{ marginTop: "8px", padding: "6px 8px", background: "#f9fafb", borderRadius: "4px", fontSize: "11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>हैंडओवर नकद राशि (Gallah Cash):</span>
              <strong style={{ color: "#111827", fontSize: "13px" }}>₹{shiftCash}</strong>
            </div>
          </div>
        )}

        <div style={{ maxWidth: "480px", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="🔍 रोगी ID, नाम, या मोबाइल खोजें..."
            onFocus={() => openPatientList("All")}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid #2e7d32", boxSizing: "border-box", background: "#fff", fontSize: "14px" }}
          />
        </div>

        <div style={{ display: "grid", gap: "10px", maxWidth: "480px" }}>
          {isReception && (
            <button style={{ padding: "12px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "bold", textAlign: "left" }} onClick={() => setScreen("newPatient")}>
              ➕ <strong>नया टोकन / रोगी पंजीकरण</strong> (OPD Entry, Vitals & Referral)
            </button>
          )}

          {isPharmacy && (
            <button style={{ padding: "12px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ba68c8", background: "#f3e5f5", fontWeight: "bold", textAlign: "left", color: "#4a148c" }} onClick={fetchPharmacyQueue}>
              💊 <strong>मेडिकल स्टोर काउंटर (Pharmacy Rx Dispense & Bill)</strong>
            </button>
          )}

          {isDoctor && (
            <button style={{ padding: "12px", cursor: "pointer", borderRadius: "8px", border: "1.5px solid #ffb74d", background: "#fff8e1", fontWeight: "bold", textAlign: "left", color: "#e65100" }} onClick={() => openPatientList("Waiting")}>
              ⏳ <strong>लाइव OPD कतार (Waiting Room - {stats.waitingCount})</strong>
            </button>
          )}

          {(isDoctor || isReception) && (
            <button style={{ padding: "12px", cursor: "pointer", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", fontWeight: "500", textAlign: "left" }} onClick={() => openPatientList("All")}>
              👤 <strong>समस्त पंजीकृत रोगी सूची</strong> (UHID Directory & Re-Queue)
            </button>
          )}

          {isPharmacy && (
            <button style={{ padding: "12px", cursor: "pointer", borderRadius: "8px", border: "1px solid #81c784", background: "#f1f8e9", fontWeight: "bold", textAlign: "left", color: "#2e7d32", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={openInventoryScreen}>
              <span>📦 <strong>औषधि भंडार व स्टॉक (Inventory)</strong></span>
              {lowStockCount > 0 && (
                <span style={{ background: "#d32f2f", color: "#fff", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" }}>
                  ⚠️ {lowStockCount} Low
                </span>
              )}
            </button>
          )}

          {isAdmin && (
            <button style={{ padding: "12px", cursor: "pointer", borderRadius: "8px", border: "1.5px solid #80deea", background: "#e0f7fa", fontWeight: "bold", textAlign: "left", color: "#006064" }} onClick={() => fetchDateWiseAccounts(filterStartDate, filterEndDate)}>
              📊 <strong>तारीख-वार क्लिनिक आय व हिसाब (Accounts & Income)</strong>
            </button>
          )}
        </div>
      </main>
    );
  }

  // 2. NEW PATIENT SCREEN (WITH CONSULTATION FEE & AUTO-BILLING)
  if (screen === "newPatient") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => { setMessage(""); setScreen("home"); }}>
          ← वापस होम
        </button>
        <h2>👤 नया टोकन व रोगी पंजीकरण</h2>
        <div style={{ display: "grid", gap: "12px", maxWidth: "460px" }}>
          <input style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" }} placeholder="रोगी का नाम *" value={name} onChange={(e) => setName(e.target.value)} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <input style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="आयु" type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} />
            <select style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">लिंग चुनें</option>
              <option value="Male">पुरुष</option>
              <option value="Female">महिला</option>
              <option value="Other">अन्य</option>
            </select>
          </div>

          <input style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="मोबाइल नंबर (WhatsApp)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#2e7d32", marginBottom: "4px" }}>
              🤝 किसके संदर्भ से आए (Referred By - Optional):
            </label>
            <input
              list="referralSources"
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
              placeholder="उदा. Direct, पुराने रोगी, डॉ. शर्मा..."
              value={referredBy}
              onChange={(e) => setReferredBy(e.target.value)}
            />
          </div>

          <div style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #c8e6c9" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2e7d32", marginBottom: "8px" }}>🩺 रोगी वाइटल्स (Vitals Record):</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
              <input style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px" }} placeholder="BP (उदा. 120/80)" value={bp} onChange={(e) => setBp(e.target.value)} />
              <input style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px" }} placeholder="Pulse (उदा. 74 bpm)" value={pulseRate} onChange={(e) => setPulseRate(e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              <input style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "12px" }} placeholder="वजन (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <input style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "12px" }} placeholder="Temp (°F)" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
              <input style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "12px" }} placeholder="SpO2 (%)" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
            </div>
          </div>

          {/* Consultation Fee Section */}
          <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#166534", marginBottom: "8px" }}>💰 परामर्श शुल्क व भुगतान (Consultation Fee):</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#374151" }}>शुल्क (₹)</label>
                <input type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#374151" }}>स्थिति</label>
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box", background: "#fff" }}>
                  <option value="Paid">Paid (जमा)</option>
                  <option value="Due">Due (बाकी)</option>
                  <option value="Free">Free (निःशुल्क)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#374151" }}>माध्यम</label>
                <select disabled={paymentStatus === "Free"} value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box", background: "#fff" }}>
                  <option value="Cash">Cash (नकद)</option>
                  <option value="Online">Online (UPI)</option>
                </select>
              </div>
            </div>
          </div>

          <input
            list="diagnosisSuggestions"
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            placeholder="मुख्य शिकायत / लक्षण (उदा. Amalpitta, Sandhivata)..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
          />

          <button style={{ padding: "12px", fontWeight: "bold", cursor: "pointer", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", fontSize: "15px" }} onClick={savePatient} disabled={saving}>
            {saving ? "⏳ सहेजा जा रहा है..." : "💾 टोकन जारी करें (कतार में जोड़ें)"}
          </button>
          {message && <div style={{ padding: "12px", background: "#fff", borderRadius: "8px", fontWeight: "bold", border: "1px solid #ddd" }}>{message}</div>}
        </div>
      </main>
    );
  }

  // 3. PATIENTS LIST & QUEUE (WITH DIRECT START CONSULTATION BUTTON)
  if (screen === "patients") {
    const filtered = patients.filter((p) => {
      const pName = (p.name || "").toLowerCase();
      const pPhone = (p.phone || "").toString();
      const pId = (p.id || "").toString();
      const matchesSearch = pName.includes(search.toLowerCase()) || pPhone.includes(search) || pId.includes(search) || `tat-${pId}`.includes(search.toLowerCase());
      if (opdFilter === "Waiting") return matchesSearch && (p.opd_status || "Waiting") === "Waiting";
      if (opdFilter === "Completed") return matchesSearch && p.opd_status === "Completed";
      if (opdFilter === "NoShow") return matchesSearch && p.opd_status === "NoShow";
      return matchesSearch;
    });

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("home")}>
          ← वापस होम
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ margin: 0 }}>📋 OPD कतार व रोगी सूची</h2>
          <span style={{ fontSize: "13px", fontWeight: "bold", color: "#2e7d32" }}>फ़िल्टर: {opdFilter}</span>
        </div>

        <div style={{ display: "flex", gap: "6px", marginBottom: "14px", maxWidth: "520px" }}>
          <button onClick={() => setOpdFilter("All")} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ccc", background: opdFilter === "All" ? "#2e7d32" : "#fff", color: opdFilter === "All" ? "#fff" : "#333", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
            सभी (All)
          </button>
          <button onClick={() => setOpdFilter("Waiting")} style={{ flex: 1.2, padding: "8px", borderRadius: "6px", border: "1px solid #ffe082", background: opdFilter === "Waiting" ? "#f57f17" : "#fff8e1", color: opdFilter === "Waiting" ? "#fff" : "#e65100", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
            ⏳ प्रतीक्षारत
          </button>
          <button onClick={() => setOpdFilter("Completed")} style={{ flex: 1.2, padding: "8px", borderRadius: "6px", border: "1px solid #80cbc4", background: opdFilter === "Completed" ? "#00695c" : "#e0f2f1", color: opdFilter === "Completed" ? "#fff" : "#004d40", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
            ✅ Done
          </button>
          <button onClick={() => setOpdFilter("NoShow")} style={{ flex: 1.2, padding: "8px", borderRadius: "6px", border: "1px solid #ef9a9a", background: opdFilter === "NoShow" ? "#d32f2f" : "#ffebee", color: opdFilter === "NoShow" ? "#fff" : "#c62828", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
            ❌ No-Show
          </button>
        </div>

        <input
          type="text"
          placeholder="🔎 रोगी ID, नाम या मोबाइल से खोजें..."
          value={search}
          autoFocus
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: "520px", padding: "12px", marginBottom: "16px", boxSizing: "border-box", borderRadius: "8px", border: "2px solid #2e7d32", fontSize: "14px" }}
        />

        {loadingPatients ? (
          <p>⏳ लोड हो रहा है...</p>
        ) : filtered.length === 0 ? (
          <p>कोई रोगी नहीं मिला।</p>
        ) : (
          <div style={{ display: "grid", gap: "10px", maxWidth: "520px" }}>
            {filtered.map((p) => {
              const status = p.opd_status || "Waiting";
              const isWaiting = status === "Waiting";
              const isNoShow = status === "NoShow";

              return (
                <div key={p.id} style={{ padding: "14px", background: "#fff", border: isWaiting ? "1.5px solid #ffe082" : isNoShow ? "1px solid #ef9a9a" : "1px solid #ddd", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div onClick={() => { setSelectedPatient(p); setScreen("profile"); }} style={{ fontWeight: "bold", fontSize: "16px", color: "#222", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      👤 {p.name}
                      {/* Payment Badge */}
                      {p.fee_amount > 0 ? (
                        <span style={{
                          fontSize: "10px",
                          fontWeight: "bold",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          background: (p.payment_status === "Paid" || p.payment_status === "जमा") ? "#dcfce7" : "#fee2e2",
                          color: (p.payment_status === "Paid" || p.payment_status === "जमा") ? "#166534" : "#991b1b",
                          border: `1px solid ${(p.payment_status === "Paid" || p.payment_status === "जमा") ? "#86efac" : "#fca5a5"}`
                        }}>
                          ₹{p.fee_amount} [{p.payment_mode || "Cash"}]
                        </span>
                      ) : (
                        <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "10px", background: "#f3f4f6", color: "#6b7280" }}>
                          Free
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ background: isWaiting ? "#fff8e1" : isNoShow ? "#ffebee" : "#e8f5e9", color: isWaiting ? "#e65100" : isNoShow ? "#c62828" : "#2e7d32", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                        {isWaiting ? "⏳ Waiting" : isNoShow ? "❌ No-Show" : "✅ Done"}
                      </span>
                      <span style={{ background: "#2e7d32", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                        TAT-{p.id}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                    🕒 टोकन: {formatDate(p.created_at)} ({formatTime(p.created_at)})
                  </div>
                  
                  <div style={{ fontSize: "13px", color: "#555", marginTop: "2px" }}>
                    आयु: {p.age || "—"} | {p.gender || "—"} | 📱 {p.phone || "—"}
                  </div>

                  {p.referred_by && (
                    <div style={{ fontSize: "12px", color: "#00796b", marginTop: "2px" }}>
                      🤝 <strong>रेफरल:</strong> {p.referred_by}
                    </div>
                  )}

                  <div style={{ fontSize: "13px", color: "#333", marginTop: "4px" }}>
                    📋 {p.complaint || "कोई शिकायत नहीं"}
                  </div>

                  <div style={{ display: "flex", gap: "6px", marginTop: "10px", paddingTop: "8px", borderTop: "1px dashed #eee", flexWrap: "wrap" }}>
                    {/* Direct Consultation Button for Waiting Patients */}
                    {(currentRole === "doctor" || currentRole === "admin") && isWaiting && (
                      <button
                        onClick={() => {
                          setSelectedPatient(p);
                          setPrescriptionMsg("");
                          setScreen("prescription");
                        }}
                        style={{ flex: 1.5, padding: "8px", background: "#15803d", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        🩺 परामर्श शुरू करें (Start Consultation)
                      </button>
                    )}

                    <button
                      onClick={() => { setSelectedPatient(p); setScreen("profile"); }}
                      style={{ flex: 1, padding: "6px", background: "#e8f5e9", color: "#2e7d32", border: "1px solid #c8e6c9", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      👁️ प्रोफाइल खोलें
                    </button>

                    {isWaiting && (
                      <button
                        onClick={() => updatePatientOpdStatus(p.id, "NoShow")}
                        style={{ padding: "6px 10px", background: "#ffebee", color: "#c62828", border: "1px solid #ffcdd2", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        ❌ No-Show
                      </button>
                    )}

                    {!isWaiting && (
                      <button
                        onClick={() => updatePatientOpdStatus(p.id, "Waiting", true)}
                        style={{ padding: "6px 10px", background: "#fff8e1", color: "#e65100", border: "1px solid #ffe082", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        🔄 Re-Queue
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    );
  }

  // 4. PATIENT PROFILE SCREEN
  if (screen === "profile" && selectedPatient) {
    const p = selectedPatient;
    const isWaiting = (p.opd_status || "Waiting") === "Waiting";
    const isNoShow = p.opd_status === "NoShow";
    const isAdmin = currentRole === "admin";
    const isDoctor = currentRole === "doctor" || isAdmin;

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("patients")}>
          ← रोगी सूची / कतार
        </button>
        <h2>👤 रोगी प्रोफाइल व क्लिनिकल फाइल</h2>
        <div style={{ background: "#fff", borderRadius: "12px", padding: "18px", maxWidth: "480px", border: "1px solid #ddd" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>{p.name}</h3>
            <span style={{ background: "#2e7d32", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold" }}>
              UHID: TAT-{p.id}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: isWaiting ? "#fff8e1" : isNoShow ? "#ffebee" : "#e8f5e9", padding: "8px 10px", borderRadius: "6px", margin: "10px 0", fontSize: "13px" }}>
            <span><strong>स्थिति:</strong> {isWaiting ? "⏳ प्रतीक्षारत" : isNoShow ? "❌ No-Show" : "✅ Done"}</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {isWaiting ? (
                <button onClick={() => updatePatientOpdStatus(p.id, "NoShow")} style={{ padding: "4px 8px", background: "#fff", border: "1px solid #c62828", color: "#c62828", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>
                  Mark No-Show
                </button>
              ) : (
                <button onClick={() => updatePatientOpdStatus(p.id, "Waiting", true)} style={{ padding: "4px 8px", background: "#fff", border: "1px solid #e65100", color: "#e65100", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>
                  🔄 Re-Queue
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", background: "#e8f5e9", padding: "8px", borderRadius: "6px", margin: "10px 0", textAlign: "center", fontSize: "12px" }}>
            <div><strong>BP:</strong> {p.bp || "—"}</div>
            <div><strong>Pulse:</strong> {p.pulse_rate || "—"}</div>
            <div><strong>Weight:</strong> {p.weight ? `${p.weight} kg` : "—"}</div>
            <div><strong>Temp:</strong> {p.temperature ? `${p.temperature} °F` : "—"}</div>
            <div><strong>SpO2:</strong> {p.spo2 ? `${p.spo2} %` : "—"}</div>
            <div><strong>Ref:</strong> {p.referred_by || "Direct"}</div>
          </div>

          <p style={{ margin: "6px 0" }}><strong>आयु:</strong> {p.age || "—"} | <strong>लिंग:</strong> {p.gender || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>मोबाइल:</strong> {p.phone || "—"}</p>
          <p style={{ margin: "6px 0" }}><strong>परामर्श शुल्क:</strong> ₹{p.fee_amount || 0} ({p.payment_status || "Paid"} - {p.payment_mode || "Cash"})</p>
          <p style={{ margin: "6px 0" }}><strong>मुख्य शिकायत:</strong><br />{p.complaint || "—"}</p>

          <button onClick={startEditPatient} style={{ width: "100%", padding: "8px", margin: "8px 0 14px 0", cursor: "pointer", background: "#fff", border: "1px solid #1976d2", color: "#1976d2", borderRadius: "6px", fontWeight: "bold", fontSize: "13px" }}>
            ✏️ रोगी विवरण सुधारें
          </button>

          <hr style={{ margin: "12px 0" }} />

          {isDoctor && (
            <>
              <button onClick={() => { setAssessmentMessage(""); setScreen("assessment"); }} style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", textAlign: "left" }}>
                📋 <strong>Clinical Assessment</strong> (चिकित्सकीय परीक्षण)
              </button>

              <button onClick={() => { setPrescriptionMsg(""); setScreen("prescription"); }} style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", background: "#e8f5e9", border: "1px solid #81c784", borderRadius: "6px", textAlign: "left" }}>
                💊 <strong>नया Prescription</strong> (पर्चा बनाएं व फार्मेसी भेजें)
              </button>

              <button onClick={fetchPatientDocuments} style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", background: "#e1f5fe", border: "1px solid #81d4fa", borderRadius: "6px", textAlign: "left" }}>
                📑 <strong>जाँच व रिपोर्ट फाइलें (Lab / USG / ECG)</strong>
              </button>

              <button onClick={fetchFollowUps} style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", background: "#fff3e0", border: "1px solid #ffb74d", borderRadius: "6px", textAlign: "left" }}>
                🔄 <strong>अनुवर्तन (Follow-up Tracker)</strong>
              </button>
            </>
          )}

          {(isAdmin || currentRole === "reception") && (
            <button onClick={fetchPatientBills} style={{ width: "100%", padding: "12px", marginBottom: "8px", cursor: "pointer", fontWeight: "bold", background: "#e0f2f1", border: "1px solid #80cbc4", borderRadius: "6px", textAlign: "left" }}>
              💳 <strong>OPD बिलिंग व रसीद (Billing & Receipts)</strong>
            </button>
          )}

          <button onClick={fetchPatientPrescriptions} style={{ width: "100%", padding: "12px", cursor: "pointer", fontWeight: "bold", background: "#fff", border: "1px solid #90caf9", borderRadius: "6px", textAlign: "left" }}>
            📜 <strong>सहेजे गए पर्चे देखें / Print करें</strong>
          </button>
        </div>
      </main>
    );
  }

  // 5. INVENTORY SCREEN
  if (screen === "inventoryScreen") {
    const filteredInv = inventoryList.filter(item => 
      (item.medicine_name || "").toLowerCase().includes(invSearch.toLowerCase()) ||
      (item.brand || "").toLowerCase().includes(invSearch.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(invSearch.toLowerCase())
    );

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("home")}>
          ← वापस होम
        </button>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ margin: 0, color: "#2e7d32" }}>📦 औषधि भंडार व स्टॉक (Inventory)</h2>
          {lowStockCount > 0 && (
            <span style={{ background: "#ffebee", border: "1px solid #ffcdd2", color: "#c62828", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
              ⚠️ {lowStockCount} Low Stock
            </span>
          )}
        </div>

        {/* Excel / CSV Bulk Uploader Card */}
        <div style={{ background: "#e8f5e9", padding: "14px", borderRadius: "10px", border: "1.5px solid #81c784", maxWidth: "600px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontWeight: "bold", color: "#2e7d32", fontSize: "13px" }}>⚡ एक्सेल / CSV से बल्क स्टॉक अपलोड (1-Click Bulk Entry)</span>
            <button
              onClick={downloadSampleMedicineCSV}
              style={{ padding: "5px 10px", background: "#fff", border: "1px solid #2e7d32", color: "#2e7d32", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
            >
              📥 Sample Sheet
            </button>
          </div>
          
          <p style={{ margin: "0 0 10px 0", fontSize: "11px", color: "#555" }}>
            Excel या CSV फ़ाइल से 100-200 दवाइयाँ एक साथ अपलोड करें:
          </p>

          <input
            type="file"
            accept=".csv, .txt"
            onChange={handleBulkMedicineUpload}
            disabled={uploadingBulk}
            style={{ fontSize: "12px", background: "#fff", padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "100%", boxSizing: "border-box" }}
          />
          {uploadingBulk && <div style={{ fontSize: "12px", color: "#2e7d32", fontWeight: "bold", marginTop: "6px" }}>⏳ स्टॉक अपलोड व प्रोसेस हो रहा है...</div>}
        </div>

        {/* 1-by-1 Entry Card */}
        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "600px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#333", fontSize: "15px" }}>➕ मैन्युअल दवा जोड़ें / अपडेट करें</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            <input
              placeholder="दवा का नाम (उदा. Chandraprabha Vati)..."
              value={invMedName}
              onChange={(e) => setInvMedName(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px", fontWeight: "bold" }}
            />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <select value={invBrand} onChange={(e) => setInvBrand(e.target.value)} style={{ padding: "9px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }}>
                <option value="Baidyanath">Baidyanath (बैद्यनाथ)</option>
                <option value="Dabur">Dabur (डाबर)</option>
                <option value="Dhootapapeshwar">Dhootapapeshwar (धूतपापेश्वर)</option>
                <option value="Patanjali">Patanjali (पतंजलि)</option>
                <option value="Himalaya">Himalaya</option>
                <option value="Kottakkal">Kottakkal Arya Vaidya Sala</option>
                <option value="AVP Ayurveda">AVP Ayurveda</option>
                <option value="Self / अन्य">Self Prepared / अन्य</option>
              </select>

              <select value={invCategory} onChange={(e) => setInvCategory(e.target.value)} style={{ padding: "9px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }}>
                <option value="वटी / गुटिका">वटी / गुटिका</option>
                <option value="आसव / अरिष्ट">आसव / अरिष्ट</option>
                <option value="चूर्ण">चूर्ण</option>
                <option value="गुग्गुलु / रस / भस्म">गुग्गुलु / रस / भस्म</option>
                <option value="क्वाथ / तैल / अन्य">क्वाथ / तैल / अन्य</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <input
                type="number"
                placeholder="मात्रा (Qty) *"
                value={invQty}
                onChange={(e) => setInvQty(e.target.value)}
                style={{ padding: "9px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
              <select value={invUnit} onChange={(e) => setInvUnit(e.target.value)} style={{ padding: "9px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }}>
                <option value="डब्बी (Jar/Box)">डब्बी (Jar/Box)</option>
                <option value="स्ट्रिप (Strip)">स्ट्रिप (Strip)</option>
                <option value="बोतल (Bottle)">बोतल (Bottle)</option>
                <option value="पैकेट (Pkt)">पैकेट (Pkt)</option>
                <option value="पीस (Pcs)">पीस (Pcs)</option>
              </select>
              <input
                type="number"
                placeholder="दर ₹"
                value={invPrice}
                onChange={(e) => setInvPrice(e.target.value)}
                style={{ padding: "9px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
            </div>

            <button onClick={addOrUpdateInventoryItem} disabled={savingInv} style={{ padding: "12px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
              {savingInv ? "⏳ सहेजा जा रहा है..." : "➕ स्टॉक में जोड़ें"}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: "600px", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="🔎 दवा, ब्रांड या वर्ग से खोजें..."
            value={invSearch}
            onChange={(e) => setInvSearch(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1.5px solid #2e7d32", boxSizing: "border-box", background: "#fff" }}
          />
        </div>

        <h3 style={{ color: "#333", margin: "14px 0 8px 0" }}>📋 वर्तमान स्टॉक सूची ({filteredInv.length})</h3>
        
        {filteredInv.length === 0 ? (
          <p>कोई दवा उपलब्ध नहीं है।</p>
        ) : (
          <div style={{ display: "grid", gap: "8px", maxWidth: "600px" }}>
            {filteredInv.map((item) => {
              const isLow = (Number(item.stock_quantity) || 0) <= 10;
              return (
                <div key={item.id} style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: isLow ? "1.5px solid #ef5350" : "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: "15px", color: isLow ? "#c62828" : "#222" }}>
                      {item.medicine_name} {isLow && "⚠️"}
                    </strong>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      ब्रांड: <strong>{item.brand || "Standard"}</strong> | {item.category} | दर: ₹{item.price || 0}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: isLow ? "#d32f2f" : "#2e7d32" }}>
                      {item.stock_quantity} <span style={{ fontSize: "11px", fontWeight: "normal", color: "#555" }}>{item.unit}</span>
                    </div>
                    
                    <div style={{ display: "flex", gap: "4px", marginTop: "4px", justifyContent: "flex-end" }}>
                      <button onClick={() => updateStockDirectly(item.id, item.stock_quantity, -1)} style={{ padding: "2px 8px", background: "#ffebee", border: "1px solid #ffcdd2", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
                        -1
                      </button>
                      <button onClick={() => updateStockDirectly(item.id, item.stock_quantity, 10)} style={{ padding: "2px 8px", background: "#e8f5e9", border: "1px solid #c8e6c9", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    );
  }

  // 6. PHARMACY QUEUE SCREEN
  if (screen === "pharmacyQueueScreen") {
    const filteredPharmacy = pharmacyQueue.filter((rx) => {
      const p = rx.patients || {};
      const pName = (p.name || "").toLowerCase();
      const pPhone = (p.phone || "").toString();
      const pId = (p.id || "").toString();
      return pName.includes(pharmacySearch.toLowerCase()) || pPhone.includes(pharmacySearch) || pId.includes(pharmacySearch) || `tat-${pId}`.includes(pharmacySearch.toLowerCase());
    });

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("home")}>
          ← वापस होम
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ margin: 0, color: "#4a148c" }}>💊 मेडिकल स्टोर / फार्मेसी काउंटर</h2>
          <span style={{ fontSize: "13px", fontWeight: "bold", color: "#6a1b9a" }}>पर्चे: {filteredPharmacy.length}</span>
        </div>

        <input
          type="text"
          placeholder="🔎 पर्चा सं., रोगी ID, नाम या मोबाइल से खोजें..."
          value={pharmacySearch}
          autoFocus
          onChange={(e) => setPharmacySearch(e.target.value)}
          style={{ width: "100%", maxWidth: "520px", padding: "12px", marginBottom: "16px", boxSizing: "border-box", borderRadius: "8px", border: "2px solid #7b1fa2", fontSize: "14px" }}
        />

        <div style={{ display: "grid", gap: "10px", maxWidth: "520px" }}>
          {filteredPharmacy.map((rx) => {
            const p = rx.patients || {};
            const isPending = (rx.pharmacy_status || "Pending") === "Pending";
            const validMeds = (rx.medicines || []).filter(m => m.name && m.name.trim());

            return (
              <div key={rx.id} style={{ padding: "14px", background: "#fff", border: isPending ? "1.5px solid #ba68c8" : "1px solid #ddd", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: "bold", fontSize: "16px", color: "#222" }}>👤 {p.name || "अज्ञात रोगी"}</div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span style={{ background: isPending ? "#f3e5f5" : "#e8f5e9", color: isPending ? "#7b1fa2" : "#2e7d32", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                      {isPending ? "⏳ दवा निकालना शेष" : "✅ Dispensed"}
                    </span>
                    <span style={{ background: "#4a148c", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                      TAT-{p.id}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  🕒 पर्चा समय: {formatDate(rx.created_at)} ({formatTime(rx.created_at)}) | वैद्य: {rx.lifestyle_advice || "Doctor"}
                </div>

                <div style={{ background: "#fafafa", padding: "8px", borderRadius: "6px", margin: "8px 0", fontSize: "13px" }}>
                  <strong>दवाइयाँ ({validMeds.length}):</strong>
                  <div style={{ color: "#333", marginTop: "2px" }}>
                    {validMeds.map((m) => m.name).join(", ") || "कोई दवा नहीं"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button onClick={() => { setSelectedPatient(p); setCurrentPrescription(rx); setScreen("printPreview"); }} style={{ flex: 1, padding: "8px", background: "#fff", border: "1px solid #2e7d32", color: "#2e7d32", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                    🖨️ पर्चा प्रिंट
                  </button>
                  <button onClick={() => openDispenseModal(rx)} style={{ flex: 1.2, padding: "8px", background: isPending ? "#7b1fa2" : "#00796b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                    {isPending ? "💊 दवा दें व बिल बनाएं" : `💰 बिल देखें (₹${rx.medicine_bill_amount || 0})`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  // 7. DISPENSE SCREEN
  if (screen === "dispenseScreen" && dispenseRx && dispensePatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("pharmacyQueueScreen")}>
          ← फार्मेसी कतार
        </button>

        <h2>💊 दवा वितरण व आइटम-वार औषधि बिल</h2>

        <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1.5px solid #7b1fa2", maxWidth: "650px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div>
              <strong style={{ fontSize: "16px" }}>👤 {dispensePatient.name}</strong> ({dispensePatient.age || "—"}y / {dispensePatient.gender || "—"})
              <div style={{ fontSize: "12px", color: "#666" }}>📱 {dispensePatient.phone || "—"} | UHID: TAT-{dispensePatient.id}</div>
            </div>
            <button onClick={() => { setSelectedPatient(dispensePatient); setCurrentPrescription(dispenseRx); setScreen("printPreview"); }} style={{ padding: "6px 10px", background: "#e8f5e9", border: "1px solid #81c784", color: "#2e7d32", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "11px", height: "fit-content" }}>
              🖨️ पर्चा Print
            </button>
          </div>

          <h4 style={{ color: "#4a148c", margin: "14px 0 8px 0" }}>📦 दवाइयों का वितरण, मात्रा व मूल्य:</h4>
          
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "10px" }}>
            <thead>
              <tr style={{ background: "#f3e5f5", color: "#4a148c", textAlign: "left" }}>
                <th style={{ padding: "6px", border: "1px solid #e1bee7" }}>औषधि नाम</th>
                <th style={{ padding: "6px", border: "1px solid #e1bee7", width: "45px" }}>मात्रा</th>
                <th style={{ padding: "6px", border: "1px solid #e1bee7", width: "95px" }}>इकाई</th>
                <th style={{ padding: "6px", border: "1px solid #e1bee7", width: "55px" }}>दर (₹)</th>
                <th style={{ padding: "6px", border: "1px solid #e1bee7", width: "55px", textAlign: "right" }}>कुल (₹)</th>
                <th style={{ padding: "6px", border: "1px solid #e1bee7", width: "30px", textAlign: "center" }}>हटाएं</th>
              </tr>
            </thead>
            <tbody>
              {dispenseItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "4px", border: "1px solid #eee" }}>
                    <input type="text" value={item.name} placeholder="दवा का नाम..." onChange={(e) => updateDispenseItemRow(idx, "name", e.target.value)} style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontWeight: "bold", fontSize: "12px" }} />
                    <div style={{ fontSize: "10px", color: item.availableStock <= 10 && item.availableStock !== "—" ? "#d32f2f" : "#666", marginTop: "2px" }}>
                      स्टॉक: {item.availableStock} | Rx: {item.dose}
                    </div>
                  </td>
                  <td style={{ padding: "4px", border: "1px solid #eee" }}>
                    <input type="number" min="1" value={item.qty} onChange={(e) => updateDispenseItemRow(idx, "qty", e.target.value)} style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", textAlign: "center" }} />
                  </td>
                  <td style={{ padding: "4px", border: "1px solid #eee" }}>
                    <select value={item.unit} onChange={(e) => updateDispenseItemRow(idx, "unit", e.target.value)} style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "11px", background: "#fff" }}>
                      <option value="डब्बी (Jar/Box)">डब्बी (Jar/Box)</option>
                      <option value="स्ट्रिप (Strip)">स्ट्रिप (Strip)</option>
                      <option value="बोतल (Bottle)">बोतल (Bottle)</option>
                      <option value="पैकेट (Pkt)">पैकेट (Pkt)</option>
                      <option value="पीस (Pcs)">पीस (Pcs)</option>
                    </select>
                  </td>
                  <td style={{ padding: "4px", border: "1px solid #eee" }}>
                    <input type="number" placeholder="₹" value={item.pricePerUnit || ""} onChange={(e) => updateDispenseItemRow(idx, "pricePerUnit", e.target.value)} style={{ width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </td>
                  <td style={{ padding: "6px", border: "1px solid #eee", textAlign: "right", fontWeight: "bold", color: "#4a148c" }}>
                    ₹{item.total}
                  </td>
                  <td style={{ padding: "4px", border: "1px solid #eee", textAlign: "center" }}>
                    <button type="button" onClick={() => removeDispenseItemRow(idx)} style={{ color: "#d32f2f", background: "#ffebee", border: "1px solid #ffcdd2", borderRadius: "4px", cursor: "pointer", padding: "3px 6px", fontWeight: "bold", fontSize: "11px" }}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" onClick={addDispenseItemRow} style={{ width: "100%", padding: "7px", background: "#ede7f6", color: "#4a148c", border: "1px dashed #7b1fa2", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", marginBottom: "14px" }}>
            ➕ अन्य दवा / वस्तु जोड़ें (Add Extra Item)
          </button>

          <div style={{ background: "#fdf7ff", padding: "12px", borderRadius: "8px", border: "1px solid #e1bee7", marginBottom: "14px" }}>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#4a148c", marginBottom: "4px" }}>
                📱 WhatsApp बिल हेतु मोबाइल:
              </label>
              <input type="tel" placeholder="10 अंकों का मोबाइल..." value={dispensePhone} onChange={(e) => setDispensePhone(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: "14px" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "15px", fontWeight: "bold", color: "#4a148c" }}>कुल औषधि मूल्य:</span>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#4a148c" }}>₹{medicineBillAmount}</span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>भुगतान माध्यम:</label>
              <select value={dispensePayMode} onChange={(e) => setDispensePayMode(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", background: "#fff" }}>
                <option value="Cash (नकद)">Cash (नकद)</option>
                <option value="UPI / QR Code">UPI / QR Code</option>
                <option value="Card (कार्ड)">Card (कार्ड)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <button onClick={completeDispensing} disabled={dispensing} style={{ padding: "12px", background: "#7b1fa2", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
              {dispensing ? "⏳ प्रक्रियाधीन..." : "✅ दवा दें, स्टॉक घटाएं व बिल प्रिंट करें"}
            </button>
            <button onClick={() => setScreen("printMedicineBillPreview")} style={{ padding: "10px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}>
              🖨️ औषधि बिल Print / PDF Slip देखें
            </button>
            <button onClick={shareMedicineBillWhatsApp} style={{ padding: "10px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}>
              💬 WhatsApp पर दवा बिल भेजें
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 8. PRINT MEDICINE BILL PREVIEW
  if (screen === "printMedicineBillPreview" && dispenseRx && dispensePatient) {
    const validItems = dispenseItems.filter(m => m.name && m.name.trim());
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif", maxWidth: "620px", margin: "0 auto" }}>
        <GlobalDatalists />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <button style={{ padding: "8px 14px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("dispenseScreen")}>
            ← वापस बिलिंग
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={shareMedicineBillWhatsApp} style={{ padding: "8px 14px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              💬 WhatsApp
            </button>
            <button onClick={() => downloadPdfDirect("medicinePrintableArea", `${dispensePatient.name}_Medicine_Bill`)} disabled={downloadingPdf} style={{ padding: "8px 14px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              {downloadingPdf ? "⏳ PDF बन रही है..." : "📥 PDF डाउनलोड"}
            </button>
          </div>
        </div>

        <div id="medicinePrintableArea" style={{ border: "2px solid #7b1fa2", padding: "20px", borderRadius: "10px", background: "#fff" }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #7b1fa2", paddingBottom: "10px", marginBottom: "14px" }}>
            <h2 style={{ margin: "0", color: "#7b1fa2", fontSize: "20px" }}>🌿 {hospitalInfo.hospital_name}</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>{hospitalInfo.address} | 📱 {hospitalInfo.contact_phone}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#4a148c", fontWeight: "bold" }}>औषधि बिक्री रसीद (Pharmacy Cash Memo)</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "14px", background: "#f3e5f5", padding: "8px", borderRadius: "6px" }}>
            <div>
              <strong>रोगी:</strong> {dispensePatient.name} ({dispensePatient.age || "—"}y / {dispensePatient.gender || "—"})<br />
              <strong>UHID:</strong> TAT-{dispensePatient.id} | <strong>📱 Phone:</strong> {dispensePhone || dispensePatient.phone || "—"}
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>Rx पर्चा सं.:</strong> RX-{dispenseRx.id}<br />
              <strong>दिनांक:</strong> {formatDate(dispenseRx.dispensed_at || new Date().toISOString())}
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "14px" }}>
            <thead>
              <tr style={{ background: "#f3e5f5", color: "#4a148c", textAlign: "left" }}>
                <th style={{ padding: "6px", border: "1px solid #e1bee7", width: "24px", textAlign: "center" }}>#</th>
                <th style={{ padding: "6px", border: "1px solid #e1bee7" }}>औषधि विवरण</th>
                <th style={{ padding: "6px", border: "1px solid #e1bee7", width: "45px", textAlign: "center" }}>मात्रा</th>
                <th style={{ padding: "6px", border: "1px solid #e1bee7", width: "70px" }}>इकाई</th>
                <th style={{ padding: "6px", border: "1px solid #e1bee7", width: "60px", textAlign: "right" }}>दर (₹)</th>
                <th style={{ padding: "6px", border: "1px solid #e1bee7", width: "70px", textAlign: "right" }}>कुल (₹)</th>
              </tr>
            </thead>
            <tbody>
              {validItems.map((m, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "6px", border: "1px solid #eee", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ padding: "6px", border: "1px solid #eee" }}><strong>{m.name}</strong></td>
                  <td style={{ padding: "6px", border: "1px solid #eee", textAlign: "center" }}>{m.qty}</td>
                  <td style={{ padding: "6px", border: "1px solid #eee" }}>{m.unit}</td>
                  <td style={{ padding: "6px", border: "1px solid #eee", textAlign: "right" }}>₹{m.pricePerUnit}</td>
                  <td style={{ padding: "6px", border: "1px solid #eee", textAlign: "right", fontWeight: "bold" }}>₹{m.total}</td>
                </tr>
              ))}
              <tr style={{ background: "#f3e5f5", fontWeight: "bold" }}>
                <td colSpan="5" style={{ padding: "8px", border: "1px solid #e1bee7", textAlign: "right", fontSize: "13px", color: "#4a148c" }}>
                  कुल औषधि राशि (Total Amount):
                </td>
                <td style={{ padding: "8px", border: "1px solid #e1bee7", textAlign: "right", color: "#4a148c", fontSize: "16px" }}>
                  ₹{medicineBillAmount}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: "12px", color: "#555", marginBottom: "16px" }}>
            <strong>भुगतान विधि:</strong> {dispensePayMode}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px", fontSize: "12px" }}>
            <div>_शीघ्र स्वास्थ्य लाभ की कामना सहित!_</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px dashed #333", width: "120px", paddingTop: "4px", fontWeight: "bold" }}>फार्मासिस्ट हस्ताक्षर</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 9. DATE-WISE INCOME REPORT SCREEN
  if (screen === "incomeReportScreen") {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("home")}>
          ← वापस होम
        </button>

        <h2 style={{ margin: "0 0 12px 0", color: "#006064" }}>📊 दिनांक-वार क्लिनिक आय व वित्तीय हिसाब</h2>

        <div style={{ background: "#fff", padding: "14px", borderRadius: "10px", border: "1.5px solid #80deea", maxWidth: "550px", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "#006064", marginBottom: "8px" }}>📅 दिनांक फ़िल्टर:</div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "#555" }}>प्रारंभिक दिनांक:</label>
              <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: "13px" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "#555" }}>अंतिम दिनांक:</label>
              <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: "13px" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => fetchDateWiseAccounts(filterStartDate, filterEndDate)} disabled={reportLoading} style={{ flex: 1.5, padding: "10px", background: "#006064", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
              {reportLoading ? "⏳ गणना हो रही है..." : "🔍 हिसाब देखें / Filter"}
            </button>
            <button onClick={() => { const today = new Date().toISOString().slice(0, 10); setFilterStartDate(today); setFilterEndDate(today); fetchDateWiseAccounts(today, today); }} style={{ flex: 1, padding: "10px", background: "#e0f2f1", color: "#004d40", border: "1px solid #80cbc4", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
              आज (Today)
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "8px", maxWidth: "550px", marginBottom: "14px" }}>
          <div style={{ background: "#fff", border: "1px solid #c5e1a5", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#33691e", fontWeight: "bold" }}>👨‍⚕️ OPD परामर्श</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1b5e20", marginTop: "2px" }}>₹{reportStats.consultationTotal}</div>
            <div style={{ fontSize: "10px", color: "#666" }}>रोगी: {reportStats.opdCount}</div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #ce93d8", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#7b1fa2", fontWeight: "bold" }}>💊 औषधि बिक्री</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#4a148c", marginTop: "2px" }}>₹{reportStats.medicineSalesTotal}</div>
          </div>

          <div style={{ background: "#e0f7fa", border: "1.5px solid #80deea", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#006064", fontWeight: "bold" }}>💰 कुल कलेक्शन</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#004d40", marginTop: "2px" }}>₹{reportStats.grandTotal}</div>
            <div style={{ fontSize: "10px", color: "#004d40", marginTop: "2px" }}>Cash: ₹{reportStats.cashTotal} | UPI: ₹{reportStats.onlineTotal}</div>
          </div>
        </div>

        <h3 style={{ color: "#333", margin: "16px 0 10px 0" }}>📜 रसीदें ({filteredReportBills.length})</h3>

        {filteredReportBills.length === 0 ? (
          <p>इस दिनांक सीमा में कोई बिलिंग रिकॉर्ड दर्ज नहीं है।</p>
        ) : (
          <div style={{ display: "grid", gap: "10px", maxWidth: "550px" }}>
            {filteredReportBills.map((b) => (
              <div key={b.id} style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                  <span>👤 {b.patients?.name || `रोगी #${b.patient_id}`}</span>
                  <span style={{ color: "#00796b", fontSize: "15px" }}>₹{b.total_amount}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  दिनांक: {formatDate(b.created_at)} ({formatTime(b.created_at)}) | माध्यम: <strong>{b.payment_mode}</strong>
                </div>
                <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
                  परामर्श: ₹{b.consultation_fee || 0} | औषधि: ₹{b.medicine_fee || 0} | प्रक्रिया: ₹{b.procedure_fee || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // 10. EDIT PATIENT SCREEN
  if (screen === "editPatient" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "24px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
          ← वापस प्रोफाइल
        </button>
        <h2>✏️ रोगी विवरण सुधारें (TAT-{selectedPatient.id})</h2>
        <div style={{ display: "grid", gap: "12px", maxWidth: "460px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>रोगी का नाम:</label>
            <input style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>आयु:</label>
              <input style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} type="number" min="0" value={editAge} onChange={(e) => setEditAge(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>लिंग:</label>
              <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} value={editGender} onChange={(e) => setEditGender(e.target.value)}>
                <option value="">लिंग चुनें</option>
                <option value="Male">पुरुष</option>
                <option value="Female">महिला</option>
                <option value="Other">अन्य</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>मोबाइल नंबर:</label>
            <input style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#2e7d32", marginBottom: "4px" }}>रेफरल (Referred By):</label>
            <input list="referralSources" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} value={editReferredBy} onChange={(e) => setEditReferredBy(e.target.value)} />
          </div>

          <div style={{ background: "#fff", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#2e7d32", marginBottom: "6px" }}>वाइटल्स (Vitals):</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
              <input style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} placeholder="BP" value={editBp} onChange={(e) => setEditBp(e.target.value)} />
              <input style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} placeholder="Pulse" value={editPulseRate} onChange={(e) => setEditPulseRate(e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              <input style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} placeholder="Weight (kg)" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} />
              <input style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} placeholder="Temp (°F)" value={editTemperature} onChange={(e) => setEditTemperature(e.target.value)} />
              <input style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} placeholder="SpO2 (%)" value={editSpo2} onChange={(e) => setEditSpo2(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>मुख्य शिकायत:</label>
            <input list="diagnosisSuggestions" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} value={editComplaint} onChange={(e) => setEditComplaint(e.target.value)} />
          </div>
          <button style={{ padding: "12px", fontWeight: "bold", cursor: "pointer", background: "#1976d2", color: "#fff", border: "none", borderRadius: "6px" }} onClick={updatePatientDetails} disabled={editingPatient}>
            {editingPatient ? "⏳ अपडेट हो रहा है..." : "💾 अपडेट करें"}
          </button>
          {editMsg && <div style={{ padding: "12px", background: "#fff", borderRadius: "8px", fontWeight: "bold", border: "1px solid #ddd" }}>{editMsg}</div>}
        </div>
      </main>
    );
  }

  // 11. CLINICAL ASSESSMENT SCREEN
  if (screen === "assessment" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>
        <h2>🩺 चिकित्सकीय मूल्यांकन</h2>
        <div style={{ background: "#fff", padding: "18px", borderRadius: "12px", maxWidth: "520px", border: "1px solid #ddd" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0 }}>👤 {selectedPatient.name}</h3>
            <span style={{ color: "#2e7d32", fontWeight: "bold" }}>TAT-{selectedPatient.id}</span>
          </div>
          <p style={{ color: "#666", marginTop: "4px" }}>आयु: {selectedPatient.age || "—"} | {selectedPatient.gender || "—"}</p>
          <hr style={{ margin: "16px 0" }} />

          <h4 style={{ color: "#2e7d32" }}>🌿 आयुर्वेदिक मूलभूत परीक्षा</h4>
          <AssessmentInput label="नाड़ी" value={assessment.pulse} onChange={(v) => updateAssessment("pulse", v)} />
          <AssessmentInput label="दोष (वात/पित्त/कफ)" value={assessment.dosha} onChange={(v) => updateAssessment("dosha", v)} />
          <AssessmentInput label="धातु" value={assessment.dhatu} onChange={(v) => updateAssessment("dhatu", v)} />
          <AssessmentInput label="मल" value={assessment.mala} onChange={(v) => updateAssessment("mala", v)} />
          <AssessmentInput label="अग्नि (सम/विषम/तीक्ष्ण/मन्द)" value={assessment.agni} onChange={(v) => updateAssessment("agni", v)} />
          <AssessmentInput label="आम (साम/निराम)" value={assessment.ama} onChange={(v) => updateAssessment("ama", v)} />
          <AssessmentInput label="प्रकृति" value={assessment.prakriti} onChange={(v) => updateAssessment("prakriti", v)} />
          <AssessmentInput label="विकृति" value={assessment.vikriti} onChange={(v) => updateAssessment("vikriti", v)} />

          <h4 style={{ color: "#2e7d32", marginTop: "20px" }}>📋 अष्टविध परीक्षा</h4>
          <AssessmentInput label="नाड़ी" value={assessment.ashtavidha_nadi} onChange={(v) => updateAssessment("ashtavidha_nadi", v)} />
          <AssessmentInput label="मूत्र" value={assessment.ashtavidha_mutra} onChange={(v) => updateAssessment("ashtavidha_mutra", v)} />
          <AssessmentInput label="मल" value={assessment.ashtavidha_mala} onChange={(v) => updateAssessment("ashtavidha_mala", v)} />
          <AssessmentInput label="जिह्वा" value={assessment.ashtavidha_jihwa} onChange={(v) => updateAssessment("ashtavidha_jihwa", v)} />
          <AssessmentInput label="शब्द" value={assessment.ashtavidha_shabda} onChange={(v) => updateAssessment("ashtavidha_shabda", v)} />
          <AssessmentInput label="स्पर्श" value={assessment.ashtavidha_sparsha} onChange={(v) => updateAssessment("ashtavidha_sparsha", v)} />
          <AssessmentInput label="दृष्टि" value={assessment.ashtavidha_drik} onChange={(v) => updateAssessment("ashtavidha_drik", v)} />
          <AssessmentInput label="आकृति" value={assessment.ashtavidha_akriti} onChange={(v) => updateAssessment("ashtavidha_akriti", v)} />

          <h4 style={{ color: "#2e7d32", marginTop: "20px" }}>📋 रोग विवरण व निदान</h4>
          <AssessmentInput label="सम्प्राप्ति" value={assessment.samprapti} onChange={(v) => updateAssessment("samprapti", v)} textarea />
          <AssessmentInput list="diagnosisSuggestions" label="निदान (Diagnosis)" value={assessment.diagnosis} onChange={(v) => updateAssessment("diagnosis", v)} />
          <AssessmentInput label="चिकित्सा योजना" value={assessment.treatment_plan} onChange={(v) => updateAssessment("treatment_plan", v)} textarea />
          <AssessmentInput label="चिकित्सकीय टिप्पणियाँ" value={assessment.clinical_notes} onChange={(v) => updateAssessment("clinical_notes", v)} textarea />

          <button onClick={saveAssessment} disabled={savingAssessment} style={{ width: "100%", padding: "14px", marginTop: "16px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}>
            {savingAssessment ? "⏳ सहेजा जा रहा है..." : "💾 Assessment सहेजें"}
          </button>
          {assessmentMessage && <div style={{ marginTop: "12px", padding: "12px", background: "#f0f0f0", borderRadius: "8px", fontWeight: "bold" }}>{assessmentMessage}</div>}
        </div>
      </main>
    );
  }

  // 12. PRESCRIPTION CREATE SCREEN
  if (screen === "prescription" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("patients")}>
          ← वापस कतार / सूची
        </button>
        <h2>💊 आयुर्वेद चिकित्सा पर्चा (Rx)</h2>

        <div style={{ background: "#fff", padding: "18px", borderRadius: "12px", maxWidth: "600px", border: "1px solid #ddd" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ margin: "0 0 4px 0" }}>👤 {selectedPatient.name} ({selectedPatient.age || "—"}y / {selectedPatient.gender || "—"})</h3>
            <span style={{ color: "#2e7d32", fontWeight: "bold" }}>TAT-{selectedPatient.id}</span>
          </div>

          <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
            🕒 टोकन समय: {formatDate(selectedPatient.created_at)} at {formatTime(selectedPatient.created_at)}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>
              👨‍⚕️ परामर्शक वैद्य (Attending Doctor):
            </label>
            <input list="doctorSuggestions" value={attendingDoctor} onChange={(e) => setAttendingDoctor(e.target.value)} placeholder="डॉक्टर का नाम..." style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box", background: "#fff", fontSize: "14px" }} />
          </div>

          <hr style={{ margin: "12px 0" }} />

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#2e7d32", marginBottom: "6px" }}>
              📂 कल्प वर्ग चुनें (Quick Medicine Picker):
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {Object.keys(medicineCategories).map((cat) => (
                <button key={cat} type="button" onClick={() => setSelectedCategoryTab(cat)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #2e7d32", background: selectedCategoryTab === cat ? "#2e7d32" : "#f1f8e9", color: selectedCategoryTab === cat ? "#fff" : "#2e7d32", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "8px", background: "#fafafa", padding: "8px", borderRadius: "6px", border: "1px solid #eee", maxHeight: "120px", overflowY: "auto" }}>
              {medicineCategories[selectedCategoryTab]?.map((medName, i) => (
                <span key={i} onClick={() => addMedicineFromCategory(medName, selectedCategoryTab)} style={{ padding: "4px 8px", background: "#fff", border: "1px solid #b2dfdb", borderRadius: "12px", fontSize: "12px", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  ➕ {medName}
                </span>
              ))}
            </div>
          </div>

          <h4 style={{ color: "#2e7d32", margin: "16px 0 8px 0" }}>🌿 निर्धारित औषधियाँ ({medicines.length})</h4>
          {medicines.map((m, idx) => (
            <div key={idx} style={{ background: "#f9f9f9", padding: "12px", borderRadius: "8px", marginBottom: "10px", border: "1px solid #e0e0e0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", background: "#e8f5e9", color: "#2e7d32", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                  #{idx + 1} {m.category || "औषधि"}
                </span>
                {medicines.length > 1 && (
                  <button onClick={() => removeMedicineRow(idx)} style={{ color: "red", border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}>✕ हटाएं</button>
                )}
              </div>
              
              <input placeholder="औषधि नाम..." value={m.name} onChange={(e) => updateMedicineRow(idx, "name", e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "6px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
                <select value={m.dose} onChange={(e) => updateMedicineRow(idx, "dose", e.target.value)} style={{ padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", fontSize: "12px" }}>
                  <option value="">-- मात्रा (Dose) --</option>
                  {doseList.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>

                <select value={m.timing} onChange={(e) => updateMedicineRow(idx, "timing", e.target.value)} style={{ padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", fontSize: "12px" }}>
                  <option value="">-- सेवन काल (Timing) --</option>
                  {DEFAULT_SEVAN_KAAL.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </select>
              </div>

              <select value={m.anupana} onChange={(e) => updateMedicineRow(idx, "anupana", e.target.value)} style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", fontSize: "12px" }}>
                <option value="">-- अनुपान (Anupana) --</option>
                {anupanaList.map((anp, i) => <option key={i} value={anp}>{anp}</option>)}
              </select>
            </div>
          ))}

          <button onClick={addEmptyMedicineRow} style={{ padding: "8px 12px", marginBottom: "16px", cursor: "pointer", background: "#e0e0e0", border: "1px solid #ccc", borderRadius: "6px", fontSize: "13px" }}>
            ➕ अन्य खाली पंक्ति जोड़ें
          </button>

          <h4 style={{ color: "#2e7d32", margin: "14px 0 6px 0" }}>🔬 आवश्यक जाँच</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
            {investigationList.map((test, i) => (
              <span key={i} onClick={() => addInvestigationTag(test)} style={{ padding: "3px 8px", background: "#e1f5fe", border: "1px solid #81d4fa", borderRadius: "10px", fontSize: "11px", cursor: "pointer" }}>
                + {test}
              </span>
            ))}
          </div>
          <textarea placeholder="जाँच के नाम..." rows="2" value={investigations} onChange={(e) => setInvestigations(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "12px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />

          <h4 style={{ color: "#2e7d32", margin: "10px 0 6px 0" }}>🥗 पथ्यापथ्य निर्देश</h4>
          <textarea placeholder="पथ्य / अपथ्य निर्देश..." rows="2" value={diet} onChange={(e) => setDiet(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "12px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />

          <label style={{ display: "block", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
            🔄 पुनः परीक्षण (दिन बाद):
          </label>
          <input type="number" value={followUpDays} onChange={(e) => setFollowUpDays(e.target.value)} style={{ width: "100px", padding: "8px", marginBottom: "16px", borderRadius: "4px", border: "1px solid #ccc" }} />

          <button onClick={savePrescription} disabled={savingPrescription} style={{ width: "100%", padding: "14px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}>
            {savingPrescription ? "⏳ सहेजा जा रहा है..." : "💾 पर्चा सहेजें व फार्मेसी काउंटर भेजें"}
          </button>
          {prescriptionMsg && <div style={{ marginTop: "12px", padding: "10px", background: "#f0f0f0", borderRadius: "8px", fontWeight: "bold" }}>{prescriptionMsg}</div>}
        </div>
      </main>
    );
  }

  // 13. FOLLOW-UP SCREEN
  if (screen === "followUpScreen" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>

        <h2>🔄 अनुवर्तन (Follow-up) - {selectedPatient.name} (TAT-{selectedPatient.id})</h2>

        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "550px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#2e7d32" }}>➕ नया Follow-up दर्ज करें</h3>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>📱 रोगी का मोबाइल नंबर:</label>
            <input type="tel" value={fuPhone} placeholder="10 अंकों का मोबाइल..." onChange={(e) => setFuPhone(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>📊 लक्षणात्मक सुधार:</label>
            <select value={fuSymptomRelief} onChange={(e) => setFuSymptomRelief(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="कोई विशेष सुधार नहीं (No Change)">कोई विशेष सुधार नहीं (No Change)</option>
              <option value="25% सुधार (Mild Relief)">25% सुधार (Mild Relief)</option>
              <option value="50% सुधार (Moderate Relief)">50% सुधार (Moderate Relief)</option>
              <option value="75% सुधार (Significant Relief)">75% सुधार (Significant Relief)</option>
              <option value="100% पूर्ण स्वास्थ्य लाभ (Complete Cure)">100% पूर्ण स्वास्थ्य लाभ (Complete Cure)</option>
              <option value="लक्षणों में वृद्धि (Aggravated)">लक्षणों में वृद्धि (Aggravated)</option>
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>🩺 वर्तमान नाड़ी व लक्षण स्थिति:</label>
            <input value={fuPulse} placeholder="उदा. नाड़ी वात-कफज, अग्नि दीप्त..." onChange={(e) => setFuPulse(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>⚠️ नवीन शिकायतें:</label>
            <input value={fuNewComplaints} placeholder="यदि कोई नई शिकायत हो..." onChange={(e) => setFuNewComplaints(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>💊 चिकित्सा परिवर्तन / निर्देश:</label>
            <textarea rows="2" value={fuTreatmentMod} onChange={(e) => setFuTreatmentMod(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>🔄 अगली विज़िट (दिन बाद):</label>
            <input type="number" value={fuNextVisit} onChange={(e) => setFuNextVisit(e.target.value)} style={{ width: "100px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </div>

          <button onClick={saveFollowUp} disabled={savingFollowUp} style={{ width: "100%", padding: "12px", background: "#f57c00", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}>
            {savingFollowUp ? "⏳ सहेजा जा रहा है..." : "💾 Follow-up सहेजें"}
          </button>

          {showSendPrompt && (
            <div style={{ marginTop: "14px", padding: "12px", background: "#e8f5e9", border: "1.5px solid #81c784", borderRadius: "8px" }}>
              <div style={{ fontWeight: "bold", color: "#2e7d32", marginBottom: "8px", fontSize: "14px" }}>
                💬 क्या आप रोगी को WhatsApp पर Follow-up संदेश भेजना चाहते हैं?
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => shareFollowUpWhatsApp(null, fuPhone)} style={{ flex: 1, padding: "10px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                  📲 हाँ, WhatsApp भेजें
                </button>
                <button onClick={() => setShowSendPrompt(false)} style={{ flex: 1, padding: "10px", background: "#757575", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                  ❌ नहीं
                </button>
              </div>
            </div>
          )}

          {followUpMsg && <div style={{ marginTop: "10px", fontWeight: "bold", color: "#2e7d32" }}>{followUpMsg}</div>}
        </div>

        <h3 style={{ color: "#333" }}>📜 पूर्व Follow-up इतिहास ({followUps.length})</h3>
        {followUps.length === 0 ? (
          <p>कोई पूर्व Follow-up रिकॉर्ड मौजूद नहीं है।</p>
        ) : (
          <div style={{ display: "grid", gap: "10px", maxWidth: "550px" }}>
            {followUps.map((fu, idx) => (
              <div key={fu.id || idx} style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#2e7d32" }}>
                  <span>विज़िट #{followUps.length - idx}</span>
                  <span>{formatDate(fu.created_at)} ({formatTime(fu.created_at)})</span>
                </div>
                <div style={{ marginTop: "6px" }}><strong>सुधार:</strong> {fu.symptom_relief}</div>
                {fu.pulse && <div><strong>नाड़ी/स्थिति:</strong> {fu.pulse}</div>}
                {fu.new_complaints && <div><strong>नई शिकायत:</strong> {fu.new_complaints}</div>}
                <div><strong>निर्देश:</strong> {fu.treatment_modification}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "6px", borderTop: "1px dashed #eee" }}>
                  <span style={{ fontSize: "12px", color: "#666" }}>अगली विज़िट: {fu.next_visit_days} दिन बाद</span>
                  <button onClick={() => shareFollowUpWhatsApp(fu, fuPhone)} style={{ padding: "5px 10px", background: "#25D366", color: "#fff", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                    💬 WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // 14. BILLING & RECEIPTS SCREEN
  if (screen === "billingScreen" && selectedPatient) {
    const c = Number(consultFee) || 0;
    const m = Number(medFee) || 0;
    const p = Number(procedureFee) || 0;
    const d = Number(discountFee) || 0;
    const total = c + m + p - d;

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
          ← रोगी प्रोफाइल
        </button>
        <h2>💳 OPD बिलिंग व रसीद - {selectedPatient.name} (TAT-{selectedPatient.id})</h2>

        <div style={{ background: "#fff", padding: "18px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "500px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#00796b" }}>➕ नया बिल तैयार करें</h3>
          
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>परामर्श शुल्क (₹):</label>
            <input type="number" value={consultFee} onChange={(e) => setConsultFee(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>औषधि शुल्क (₹):</label>
            <input type="number" value={medFee} onChange={(e) => setMedFee(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>पंचकर्म / प्रक्रिया शुल्क (₹):</label>
            <input type="number" value={procedureFee} onChange={(e) => setProcedureFee(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>छूट (₹):</label>
            <input type="number" value={discountFee} onChange={(e) => setDiscountFee(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>भुगतान माध्यम:</label>
            <select value={payMode} onChange={(e) => setPayMode(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="Cash (नकद)">Cash (नकद)</option>
              <option value="UPI / QR Code">UPI / QR Code</option>
              <option value="Card (कार्ड)">Card (कार्ड)</option>
            </select>
          </div>

          <div style={{ background: "#e0f2f1", padding: "12px", borderRadius: "6px", margin: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "16px", color: "#004d40" }}>कुल देय राशि:</strong>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "#00796b" }}>₹{total}</span>
          </div>

          <button onClick={saveBillingReceipt} disabled={savingBill} style={{ width: "100%", padding: "12px", background: "#00796b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}>
            {savingBill ? "⏳ रसीद बन रही है..." : "💾 रसीद सहेजें व Print करें"}
          </button>
          {billMsg && <div style={{ marginTop: "10px", fontWeight: "bold" }}>{billMsg}</div>}
        </div>

        <h3 style={{ color: "#333" }}>📜 पूर्व रसीदें ({billsList.length})</h3>
        {billsList.length === 0 ? (
          <p>कोई बिलिंग रिकॉर्ड मौजूद नहीं है।</p>
        ) : (
          <div style={{ display: "grid", gap: "10px", maxWidth: "500px" }}>
            {billsList.map((b, idx) => (
              <div key={b.id || idx} style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                  <span>रसीद #{b.id}</span>
                  <span style={{ color: "#00796b" }}>₹{b.total_amount} ({b.payment_mode})</span>
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>दिनांक: {formatDate(b.created_at)} at {formatTime(b.created_at)}</div>
                <button onClick={() => { setCurrentBill(b); setScreen("printBillPreview"); }} style={{ marginTop: "8px", padding: "6px 12px", background: "#00796b", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                  👁️ रसीद देखें / Print
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // 15. PRINT OPD BILL PREVIEW
  if (screen === "printBillPreview" && selectedPatient && currentBill) {
    const b = currentBill;
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
        <GlobalDatalists />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <button style={{ padding: "8px 14px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
            ← वापस प्रोफाइल
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={shareBillWhatsApp} style={{ padding: "8px 14px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              💬 WhatsApp
            </button>
            <button onClick={() => downloadPdfDirect("printableArea", `${selectedPatient.name}_OPD_Receipt`)} style={{ padding: "8px 14px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              📥 PDF डाउनलोड
            </button>
          </div>
        </div>

        <div id="printableArea" style={{ border: "2px solid #00796b", padding: "20px", borderRadius: "10px", background: "#fff" }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #00796b", paddingBottom: "10px", marginBottom: "14px" }}>
            <h2 style={{ margin: "0", color: "#00796b", fontSize: "20px" }}>🌿 {hospitalInfo.hospital_name}</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>{hospitalInfo.address} | 📱 {hospitalInfo.contact_phone}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#333", fontWeight: "bold" }}>OPD परामर्श एवं चिकित्सा रसीद (Official Receipt)</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "14px", background: "#e0f2f1", padding: "8px", borderRadius: "6px" }}>
            <div>
              <strong>रोगी:</strong> {selectedPatient.name}<br />
              <strong>UHID:</strong> TAT-{selectedPatient.id}
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>रसीद सं.:</strong> RCP-{b.id || "01"}<br />
              <strong>दिनांक:</strong> {formatDate(b.created_at)} ({formatTime(b.created_at)})
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "14px" }}>
            <thead>
              <tr style={{ background: "#f2f2f2", textAlign: "left" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>मद (Particulars)</th>
                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right", width: "100px" }}>राशि (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>परामर्श शुल्क (Consultation)</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{b.consultation_fee}</td>
              </tr>
              {b.medicine_fee > 0 && (
                <tr>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>औषधि शुल्क (Medicines)</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{b.medicine_fee}</td>
                </tr>
              )}
              {b.procedure_fee > 0 && (
                <tr>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>पंचकर्म / उपक्रम (Procedure)</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{b.procedure_fee}</td>
                </tr>
              )}
              {b.discount > 0 && (
                <tr>
                  <td style={{ padding: "8px", border: "1px solid #ddd", color: "green" }}>छूट (Discount)</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right", color: "green" }}>-₹{b.discount}</td>
                </tr>
              )}
              <tr style={{ background: "#e0f2f1", fontWeight: "bold" }}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>कुल प्राप्त राशि (Total Paid)</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right", color: "#004d40", fontSize: "15px" }}>₹{b.total_amount}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: "12px", color: "#555", marginBottom: "16px" }}>
            <strong>भुगतान विधि:</strong> {b.payment_mode}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px", fontSize: "12px" }}>
            <div>_शीघ्र स्वास्थ्य लाभ की कामना सहित!_</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px dashed #333", width: "120px", paddingTop: "4px", fontWeight: "bold" }}>अधिकृत हस्ताक्षर</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 16. SAVED PRESCRIPTION LIST SCREEN
  if (screen === "prescriptionList" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
          ← वापस प्रोफाइल
        </button>
        <h2>📜 सहेजे गए पर्चे ({selectedPatient.name} - TAT-{selectedPatient.id})</h2>

        {savedPrescriptions.length === 0 ? (
          <p>कोई पुराना पर्चा नहीं मिला।</p>
        ) : (
          <div style={{ display: "grid", gap: "12px", maxWidth: "500px" }}>
            {savedPrescriptions.map((rx, idx) => (
              <div key={rx.id || idx} style={{ background: "#fff", padding: "14px", borderRadius: "8px", border: "1px solid #ddd" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>दिनांक: {formatDate(rx.created_at)}</strong>
                  <span style={{ fontSize: "12px", color: "#666" }}>🕒 {formatTime(rx.created_at)}</span>
                </div>
                <div style={{ marginTop: "4px" }}><strong>परामर्शक वैद्य:</strong> {rx.lifestyle_advice || "वैद्य डेस्क"}</div>
                <div><strong>औषधियाँ:</strong> {rx.medicines?.length || 0} आइटम्स</div>
                {rx.investigations && <div style={{ fontSize: "13px", color: "#555" }}><strong>जाँच:</strong> {rx.investigations}</div>}
                <button onClick={() => { setCurrentPrescription(rx); setScreen("printPreview"); }} style={{ marginTop: "10px", padding: "8px 14px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                  👁️ पर्चा देखें / डाउनलोड करें
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // 17. PRINT PREVIEW (RX)
  if (screen === "printPreview" && selectedPatient && currentPrescription) {
    const rx = currentPrescription;
    const entryTimeStr = formatTime(selectedPatient.created_at);
    const exitTimeStr = formatTime(rx.created_at);
    const consultDateStr = formatDate(rx.created_at);
    const validMeds = (rx.medicines || []).filter(m => m.name && m.name.trim());

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "16px", fontFamily: "Arial, sans-serif", maxWidth: "720px", margin: "0 auto" }}>
        <GlobalDatalists />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", marginBottom: "16px" }}>
          <button style={{ padding: "8px 14px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
            ← वापस प्रोफाइल
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={shareOnWhatsApp} style={{ padding: "10px 14px", background: "#25D366", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              💬 WhatsApp ({selectedPatient.phone || "Share"})
            </button>
            <button onClick={() => downloadPdfDirect("printableArea", `${selectedPatient.name}_TAT-${selectedPatient.id}`)} disabled={downloadingPdf} style={{ padding: "10px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              {downloadingPdf ? "⏳ PDF बन रही है..." : "📥 PDF Download"}
            </button>
          </div>
        </div>

        <div id="printableArea" style={{ border: "2px solid #2e7d32", padding: "20px", borderRadius: "10px", background: "#fff" }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #2e7d32", paddingBottom: "10px", marginBottom: "14px" }}>
            <h1 style={{ margin: "0", color: "#2e7d32", fontSize: "22px" }}>🌿 {hospitalInfo.hospital_name}</h1>
            <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#333", fontWeight: "bold" }}>{hospitalInfo.tagline}</p>
            <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>{hospitalInfo.address} | 📱 {hospitalInfo.contact_phone}</p>
            <div style={{ fontSize: "11px", color: "#2e7d32", fontWeight: "bold", marginTop: "2px" }}>
              {hospitalInfo.doctor_name} ({hospitalInfo.doctor_qualification}) | {hospitalInfo.reg_number}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.1fr", gap: "8px", fontSize: "12px", marginBottom: "10px", background: "#f4f9f4", padding: "8px 10px", borderRadius: "6px", border: "1px solid #c8e6c9" }}>
            <div>
              <strong>रोगी:</strong> {selectedPatient.name}<br />
              <span style={{ color: "#2e7d32", fontWeight: "bold" }}>UHID: TAT-{selectedPatient.id}</span>
              {selectedPatient.referred_by && (
                <div style={{ color: "#00796b" }}><strong>Ref:</strong> {selectedPatient.referred_by}</div>
              )}
            </div>
            <div>
              <strong>आयु/लिंग:</strong> {selectedPatient.age || "—"}y / {selectedPatient.gender || "—"}<br />
              <strong>मोबाइल:</strong> {selectedPatient.phone || "—"}
            </div>
            <div style={{ textAlign: "right" }}>
              <div><strong>दिनांक:</strong> {consultDateStr}</div>
              <div style={{ color: "#444" }}><strong>आगमन:</strong> {entryTimeStr}</div>
              <div style={{ color: "#2e7d32", fontWeight: "bold" }}><strong>निकास:</strong> {exitTimeStr}</div>
            </div>
          </div>

          {(selectedPatient.bp || selectedPatient.pulse_rate || selectedPatient.weight || selectedPatient.temperature) && (
            <div style={{ display: "flex", gap: "14px", fontSize: "11px", background: "#fafafa", padding: "5px 10px", borderRadius: "4px", border: "1px solid #eee", marginBottom: "12px", color: "#333" }}>
              {selectedPatient.bp && <span><strong>BP:</strong> {selectedPatient.bp}</span>}
              {selectedPatient.pulse_rate && <span><strong>Pulse:</strong> {selectedPatient.pulse_rate}</span>}
              {selectedPatient.weight && <span><strong>Weight:</strong> {selectedPatient.weight} kg</span>}
              {selectedPatient.temperature && <span><strong>Temp:</strong> {selectedPatient.temperature} °F</span>}
              {selectedPatient.spo2 && <span><strong>SpO2:</strong> {selectedPatient.spo2} %</span>}
            </div>
          )}

          <h3 style={{ color: "#2e7d32", borderBottom: "1px solid #2e7d32", paddingBottom: "4px", margin: "10px 0 8px 0", fontSize: "15px" }}>Rx (औषधि निर्देश)</h3>
          
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "14px" }}>
            <thead>
              <tr style={{ background: "#e8f5e9", color: "#1b5e20", textAlign: "left" }}>
                <th style={{ padding: "6px", border: "1px solid #c8e6c9", width: "24px", textAlign: "center" }}>#</th>
                <th style={{ padding: "6px", border: "1px solid #c8e6c9" }}>औषधि नाम (कल्पना)</th>
                <th style={{ padding: "6px", border: "1px solid #c8e6c9", width: "90px" }}>मात्रा</th>
                <th style={{ padding: "6px", border: "1px solid #c8e6c9", width: "120px" }}>सेवन काल</th>
                <th style={{ padding: "6px", border: "1px solid #c8e6c9", width: "120px" }}>अनुपान</th>
              </tr>
            </thead>
            <tbody>
              {validMeds.map((m, i) => (
                <tr key={i}>
                  <td style={{ padding: "6px", border: "1px solid #ddd", textAlign: "center" }}>{i + 1}</td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>
                    <strong>{m.name}</strong>
                    {m.category && <span style={{ display: "block", fontSize: "10px", color: "#666" }}>[{m.category}]</span>}
                  </td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>{m.dose || "—"}</td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>{m.timing || "—"}</td>
                  <td style={{ padding: "6px", border: "1px solid #ddd" }}>{m.anupana || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {rx.investigations && (
            <div style={{ marginTop: "10px", marginBottom: "12px" }}>
              <strong style={{ color: "#0277bd", fontSize: "13px" }}>🔬 आवश्यक जाँच (Investigations):</strong>
              <div style={{ background: "#e1f5fe", padding: "6px 10px", borderRadius: "4px", border: "1px solid #b3e5fc", margin: "4px 0", fontSize: "12px", color: "#01579b" }}>
                {rx.investigations}
              </div>
            </div>
          )}

          {rx.diet_instructions && (
            <div style={{ marginTop: "10px", marginBottom: "14px" }}>
              <strong style={{ color: "#2e7d32", fontSize: "13px" }}>🥗 पथ्यापथ्य निर्देश:</strong>
              <div style={{ background: "#fafafa", padding: "8px 10px", borderRadius: "4px", border: "1px solid #e0e0e0", margin: "4px 0", fontSize: "12px", color: "#333" }}>
                {rx.diet_instructions}
              </div>
            </div>
          )}

          <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "13px" }}>
            <div>
              <strong>🔄 पुनः परीक्षण:</strong> 
              <span style={{ marginLeft: "4px", color: "#2e7d32", fontWeight: "bold" }}>
                {rx.follow_up_days || 7} दिन बाद
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#555", fontSize: "12px", marginBottom: "2px" }}>
                {rx.lifestyle_advice || attendingDoctor}
              </div>
              <div style={{ borderTop: "1px dashed #444", width: "140px", paddingTop: "4px", fontWeight: "bold" }}>
                हस्ताक्षर (वैद्य)
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 18. PATIENT DOCUMENTS SCREEN
  if (screen === "patientDocsScreen" && selectedPatient) {
    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("profile")}>
          ← वापस प्रोफाइल
        </button>
        <h2>📑 जाँच व रिपोर्ट फाइलें - {selectedPatient.name} (TAT-{selectedPatient.id})</h2>

        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "500px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#0277bd" }}>➕ नई जाँच / रिपोर्ट विवरण जोड़ें</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            <input placeholder="जाँच का नाम (उदा. USG Abdomen, CBC)..." value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
            <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}>
              <option value="Lab Report (रक्त/मूत्र जाँच)">Lab Report (रक्त/मूत्र जाँच)</option>
              <option value="USG / Sonography">USG / Sonography</option>
              <option value="X-Ray (रेडियोलॉजी)">X-Ray (रेडियोलॉजी)</option>
              <option value="ECG Tracing">ECG Tracing</option>
              <option value="Discharge Summary">Discharge Summary</option>
              <option value="अन्य दस्तावेज">अन्य दस्तावेज</option>
            </select>
            <textarea placeholder="निष्कर्ष / मुख्य टिप्पणियाँ..." rows="3" value={newDocNotes} onChange={(e) => setNewDocNotes(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
            <button onClick={savePatientDocumentEntry} disabled={savingDoc} style={{ padding: "12px", background: "#0277bd", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
              {savingDoc ? "⏳ सहेजा जा रहा है..." : "💾 रिपोर्ट रिकॉर्ड जोड़ें"}
            </button>
          </div>
        </div>

        <h3 style={{ color: "#333" }}>📋 संलग्न रिपोर्टें ({patientDocs.length})</h3>
        {patientDocs.length === 0 ? (
          <p>कोई पूर्व रिपोर्ट दर्ज नहीं है।</p>
        ) : (
          <div style={{ display: "grid", gap: "10px", maxWidth: "500px" }}>
            {patientDocs.map((doc, idx) => (
              <div key={doc.id || idx} style={{ background: "#fff", padding: "14px", borderRadius: "8px", border: "1px solid #b3e5fc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "15px", color: "#01579b" }}>{doc.doc_title}</strong>
                  <span style={{ fontSize: "11px", background: "#e1f5fe", color: "#0277bd", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                    {doc.doc_type}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>दिनांक: {formatDate(doc.created_at)}</div>
                {doc.notes && <div style={{ fontSize: "13px", color: "#333", marginTop: "6px", background: "#fafafa", padding: "6px", borderRadius: "4px" }}>{doc.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // 19. MASTER SETTINGS SCREEN
  if (screen === "settingsScreen") {
    const getPlaceholderText = () => {
      switch (masterType) {
        case "doctor":
          return "डॉक्टर का नाम (उदा. Dr. Anshuman Mishra, BAMS)...";
        case "anupana":
          return "अनुपान का नाम (उदा. गोदुग्ध / अश्वगंधा क्वाथ)...";
        case "dose":
          return "मात्रा विवरण (उदा. 2 चम्मच दिन में दो बार)...";
        case "investigation":
          return "जाँच का नाम (उदा. Serum Creatinine / HbA1c)...";
        default:
          return "औषधि का नाम (उदा. गिलोय चूर्ण / गोखरू क्वाथ)...";
      }
    };

    return (
      <main style={{ minHeight: "100vh", background: "#f5f7f2", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <GlobalDatalists />
        <button style={{ padding: "8px 14px", marginBottom: "16px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} onClick={() => setScreen("home")}>
          ← वापस होम
        </button>
        <h2>⚙️ मास्टर सेटिंग्स व क्लिनिकल कंट्रोल</h2>

        {/* Card 1: Master Data Presets Manager */}
        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1.5px solid #81c784", maxWidth: "520px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#2e7d32" }}>🌿 मास्टर डेटा एवं सूची प्रबंधन</h3>

          <div style={{ display: "grid", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <select
                value={masterType}
                onChange={(e) => setMasterType(e.target.value)}
                style={{ padding: "9px", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", fontWeight: "bold" }}
              >
                <option value="doctor">👨‍⚕️ नया ड्यूटी डॉक्टर</option>
                <option value="medicine">💊 नई औषधि (Medicine)</option>
                <option value="anupana">🥛 नया अनुपान (Anupana)</option>
                <option value="dose">⚖️ नई मात्रा (Dose)</option>
                <option value="investigation">🔬 नया टेस्ट (Lab Test)</option>
              </select>

              {masterType === "medicine" ? (
                <select
                  value={newMasterCategory}
                  onChange={(e) => setNewMasterCategory(e.target.value)}
                  style={{ padding: "9px", borderRadius: "4px", border: "1px solid #ccc", background: "#fff" }}
                >
                  <option value="वटी / गुटिका">वटी / गुटिका</option>
                  <option value="आसव / अरिष्ट">आसव / अरिष्ट</option>
                  <option value="चूर्ण">चूर्ण</option>
                  <option value="गुग्गुलु / रस / भस्म">गुग्गुलु / रस / भस्म</option>
                  <option value="क्वाथ / तैल / अन्य">क्वाथ / तैल / अन्य</option>
                </select>
              ) : (
                <div style={{ fontSize: "12px", color: "#666", alignSelf: "center", background: "#f5f5f5", padding: "8px", borderRadius: "4px", textAlign: "center" }}>
                  {masterType === "doctor" ? "चिकित्सक पैनल" : "सामान्य सूची"}
                </div>
              )}
            </div>

            <input
              placeholder={getPlaceholderText()}
              value={newMasterVal}
              onChange={(e) => setNewMasterVal(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: "13px" }}
            />

            <button onClick={addMasterPreset} style={{ padding: "11px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
              ➕ सूची में जोड़ें
            </button>
          </div>
        </div>

        {/* Card 2: Letterhead & Hospital Info */}
        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "520px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#333" }}>🏥 हॉस्पिटल व लेटरहेड विवरण</h3>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>हॉस्पिटल नाम:</label>
            <input value={hospitalInfo.hospital_name} onChange={(e) => setHospitalInfo({ ...hospitalInfo, hospital_name: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>टैगलाइन:</label>
            <input value={hospitalInfo.tagline} onChange={(e) => setHospitalInfo({ ...hospitalInfo, tagline: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>क्लिनिक पता:</label>
            <input value={hospitalInfo.address} onChange={(e) => setHospitalInfo({ ...hospitalInfo, address: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>हेल्पलाइन फोन:</label>
            <input value={hospitalInfo.contact_phone} onChange={(e) => setHospitalInfo({ ...hospitalInfo, contact_phone: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>मुख्य चिकित्सक:</label>
            <input value={hospitalInfo.doctor_name} onChange={(e) => setHospitalInfo({ ...hospitalInfo, doctor_name: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>योग्यता:</label>
            <input value={hospitalInfo.doctor_qualification} onChange={(e) => setHospitalInfo({ ...hospitalInfo, doctor_qualification: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>काउंसिल Reg. No:</label>
            <input value={hospitalInfo.reg_number} onChange={(e) => setHospitalInfo({ ...hospitalInfo, reg_number: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} />
          </div>

          <button onClick={saveHospitalSettings} disabled={savingSettings} style={{ width: "100%", padding: "10px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            {savingSettings ? "⏳ सहेजा जा रहा है..." : "💾 लेटरहेड अपडेट करें"}
          </button>
          {settingsMsg && <div style={{ marginTop: "8px", fontWeight: "bold", color: "#2e7d32" }}>{settingsMsg}</div>}
        </div>

        {/* Card 3: Patient Records Excel / CSV Download */}
        <div style={{ background: "#fff", padding: "16px", borderRadius: "10px", border: "1px solid #ddd", maxWidth: "520px" }}>
          <h3 style={{ margin: "0 0 6px 0", color: "#333" }}>📥 ऑफलाइन डेटा बैकअप (Excel / CSV)</h3>
          <p style={{ fontSize: "12px", color: "#666", margin: "0 0 10px 0" }}>अपने क्लिनिक के समस्त रोगियों का रिकॉर्ड डाउनलोड करें:</p>
          <button onClick={exportPatientsCSV} style={{ width: "100%", padding: "10px", background: "#00796b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            📥 सम्पूर्ण रोगी डेटा (CSV) डाउनलोड करें
          </button>
        </div>
      </main>
    );
  }

  return null;
}
