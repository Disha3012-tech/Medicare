export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  subspecialty: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  location: string;
  hospital: string;
  avatar: string;
  bio: string;
  education: string[];
  languages: string[];
  insurances: string[];
  consultationFee: number;
  nextAvailable: string;
  appointmentTypes: ("in-person" | "video")[];
  tags: string[];
  availableDays: number[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  body: string;
  verified: boolean;
}

export const DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Amara Osei",
    specialty: "Cardiology",
    subspecialty: "Interventional Cardiology",
    rating: 4.9,
    reviewCount: 312,
    yearsExperience: 14,
    location: "Downtown, San Francisco",
    hospital: "St. Luke's Medical Center",
    avatar: "photo-1612349317150-e413f6a5b16d",
    bio: "Dr. Osei is a board-certified interventional cardiologist with over 14 years of experience treating complex coronary artery disease, heart failure, and structural heart conditions. She completed her fellowship at Johns Hopkins and is recognized nationally for her minimally invasive techniques.",
    education: ["MD, Johns Hopkins University School of Medicine", "Residency, UCSF Medical Center", "Fellowship in Interventional Cardiology, Johns Hopkins Hospital"],
    languages: ["English", "French", "Twi"],
    insurances: ["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealth", "Medicare"],
    consultationFee: 220,
    nextAvailable: "Today, 3:30 PM",
    appointmentTypes: ["in-person", "video"],
    tags: ["Heart failure", "Coronary artery disease", "Pacemakers", "Echocardiography"],
    availableDays: [1, 2, 3, 5, 8, 9, 10, 12, 15, 16, 17, 19, 22, 23, 24],
  },
  {
    id: "d2",
    name: "Dr. Lena Kovač",
    specialty: "Neurology",
    subspecialty: "Headache & Migraine Medicine",
    rating: 4.8,
    reviewCount: 198,
    yearsExperience: 11,
    location: "Mission District, San Francisco",
    hospital: "UCSF Medical Center",
    avatar: "photo-1559839734-2b71ea197ec2",
    bio: "Dr. Kovač specializes in headache disorders, epilepsy, and neurodegenerative diseases. She earned her neurology training at Mayo Clinic and has published over 30 peer-reviewed articles on migraine prevention. She takes a holistic, patient-centered approach to neurological care.",
    education: ["MD, University of Vienna", "Residency in Neurology, Mayo Clinic", "Fellowship in Headache Medicine, UCSF"],
    languages: ["English", "Croatian", "German"],
    insurances: ["Aetna", "Cigna", "Kaiser Permanente", "Medicare", "Medi-Cal"],
    consultationFee: 190,
    nextAvailable: "Tomorrow, 9:00 AM",
    appointmentTypes: ["in-person", "video"],
    tags: ["Migraine", "Epilepsy", "Multiple sclerosis", "Parkinson's disease"],
    availableDays: [2, 3, 4, 9, 10, 11, 16, 17, 18, 23, 24, 25],
  },
  {
    id: "d3",
    name: "Dr. James Tran",
    specialty: "Orthopedics",
    subspecialty: "Sports Medicine & Joint Reconstruction",
    rating: 4.9,
    reviewCount: 445,
    yearsExperience: 18,
    location: "SoMa, San Francisco",
    hospital: "CPMC Davies Campus",
    avatar: "photo-1537368910025-700350fe46c7",
    bio: "Dr. Tran is a fellowship-trained orthopedic surgeon specializing in ACL reconstruction, knee and hip replacement, and sports-related injuries. He has been the team physician for three professional sports teams and brings elite athletic care to all his patients.",
    education: ["MD, Stanford University School of Medicine", "Residency in Orthopedic Surgery, UCLA", "Fellowship in Sports Medicine, Hospital for Special Surgery"],
    languages: ["English", "Vietnamese"],
    insurances: ["Blue Cross Blue Shield", "Cigna", "Aetna", "UnitedHealth", "Medicare"],
    consultationFee: 250,
    nextAvailable: "Jul 8, 9:00 AM",
    appointmentTypes: ["in-person"],
    tags: ["ACL reconstruction", "Knee replacement", "Hip replacement", "Sports injuries"],
    availableDays: [1, 4, 5, 8, 11, 12, 15, 18, 19, 22, 25, 26],
  },
  {
    id: "d4",
    name: "Dr. Priya Nair",
    specialty: "General Practice",
    subspecialty: "Preventive Medicine",
    rating: 4.7,
    reviewCount: 521,
    yearsExperience: 9,
    location: "Noe Valley, San Francisco",
    hospital: "SF Health Network",
    avatar: "photo-1594824476967-48c8b964273f",
    bio: "Dr. Nair is a primary care physician who believes in proactive, preventive healthcare. She manages chronic conditions, conducts annual wellness exams, and coordinates specialist care for her patients. She is known for her warmth, thoroughness, and clear communication.",
    education: ["MD, University of California San Diego", "Residency in Family Medicine, UCSF"],
    languages: ["English", "Hindi", "Malayalam"],
    insurances: ["Aetna", "Blue Cross Blue Shield", "Cigna", "Kaiser Permanente", "Medi-Cal", "Medicare"],
    consultationFee: 140,
    nextAvailable: "Today, 4:00 PM",
    appointmentTypes: ["in-person", "video"],
    tags: ["Annual wellness", "Diabetes management", "Hypertension", "Preventive care"],
    availableDays: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23],
  },
  {
    id: "d5",
    name: "Dr. Marcus Hill",
    specialty: "Dermatology",
    subspecialty: "Cosmetic & Medical Dermatology",
    rating: 4.8,
    reviewCount: 287,
    yearsExperience: 12,
    location: "Pacific Heights, San Francisco",
    hospital: "Sutter Health",
    avatar: "photo-1582750433449-648ed127bb54",
    bio: "Dr. Hill treats the full spectrum of skin conditions — from acne and eczema to melanoma and complex autoimmune disorders. He also offers cosmetic procedures including Mohs surgery, laser therapy, and injectables. He is a clinical instructor at UCSF Dermatology.",
    education: ["MD, Harvard Medical School", "Residency in Dermatology, Stanford University Medical Center", "Fellowship in Mohs Surgery, MD Anderson"],
    languages: ["English", "Spanish"],
    insurances: ["Aetna", "Blue Cross Blue Shield", "UnitedHealth", "Medicare"],
    consultationFee: 185,
    nextAvailable: "Jul 7, 11:00 AM",
    appointmentTypes: ["in-person"],
    tags: ["Acne", "Eczema", "Skin cancer", "Mohs surgery", "Psoriasis"],
    availableDays: [1, 2, 7, 8, 9, 14, 15, 16, 21, 22, 23, 28, 29],
  },
  {
    id: "d6",
    name: "Dr. Yuki Tanaka",
    specialty: "Psychiatry",
    subspecialty: "Anxiety & Mood Disorders",
    rating: 4.9,
    reviewCount: 163,
    yearsExperience: 8,
    location: "Hayes Valley, San Francisco",
    hospital: "SF Mental Health Clinic",
    avatar: "photo-1567532939604-b6b5b0db2604",
    bio: "Dr. Tanaka is a psychiatrist specializing in anxiety, depression, OCD, and PTSD. She combines evidence-based medication management with psychotherapy-informed care. She is committed to destigmatizing mental health treatment and creating a safe, non-judgmental space for every patient.",
    education: ["MD, Columbia University Vagelos College of Physicians and Surgeons", "Residency in Psychiatry, Massachusetts General Hospital"],
    languages: ["English", "Japanese"],
    insurances: ["Aetna", "Cigna", "Kaiser Permanente", "Blue Shield of California"],
    consultationFee: 210,
    nextAvailable: "Tomorrow, 1:00 PM",
    appointmentTypes: ["video", "in-person"],
    tags: ["Anxiety", "Depression", "OCD", "PTSD", "Medication management"],
    availableDays: [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26],
  },
  {
    id: "d7",
    name: "Dr. Rafael Santos",
    specialty: "Pediatrics",
    subspecialty: "Developmental Pediatrics",
    rating: 4.8,
    reviewCount: 394,
    yearsExperience: 15,
    location: "Inner Sunset, San Francisco",
    hospital: "UCSF Benioff Children's Hospital",
    avatar: "photo-1612349317150-e413f6a5b16d",
    bio: "Dr. Santos has dedicated his career to the health and development of children from birth through adolescence. He has special expertise in autism spectrum disorder, ADHD, and developmental delays, and works closely with schools and families to ensure holistic support.",
    education: ["MD, Universidade de São Paulo", "Residency in Pediatrics, Children's Hospital of Philadelphia", "Fellowship in Developmental Pediatrics, UCSF"],
    languages: ["English", "Portuguese", "Spanish"],
    insurances: ["Aetna", "Blue Cross Blue Shield", "Kaiser Permanente", "Medi-Cal", "CHIP"],
    consultationFee: 160,
    nextAvailable: "Jul 9, 10:00 AM",
    appointmentTypes: ["in-person", "video"],
    tags: ["Well-child visits", "ADHD", "Autism", "Developmental delays", "Vaccines"],
    availableDays: [2, 4, 5, 9, 11, 12, 16, 18, 19, 23, 25, 26],
  },
  {
    id: "d8",
    name: "Dr. Ingrid Larsen",
    specialty: "Endocrinology",
    subspecialty: "Diabetes & Thyroid",
    rating: 4.7,
    reviewCount: 241,
    yearsExperience: 13,
    location: "Richmond District, San Francisco",
    hospital: "Kaiser Permanente SF Medical Center",
    avatar: "photo-1573496359142-b8d87734a5a2",
    bio: "Dr. Larsen manages complex endocrine disorders including Type 1 and Type 2 diabetes, thyroid disease, adrenal conditions, and osteoporosis. She uses the latest continuous glucose monitoring technology and personalized insulin regimens to help patients achieve optimal metabolic control.",
    education: ["MD, University of Oslo", "Residency, Karolinska University Hospital", "Fellowship in Endocrinology, UCSF"],
    languages: ["English", "Norwegian", "Swedish"],
    insurances: ["Kaiser Permanente", "Aetna", "Blue Cross Blue Shield", "Medicare"],
    consultationFee: 195,
    nextAvailable: "Jul 10, 2:00 PM",
    appointmentTypes: ["in-person", "video"],
    tags: ["Type 1 diabetes", "Type 2 diabetes", "Thyroid nodules", "Osteoporosis", "Hyperthyroidism"],
    availableDays: [3, 4, 5, 10, 11, 12, 17, 18, 19, 24, 25, 26],
  },
];

export const REVIEWS: Record<string, Review[]> = {
  d1: [
    { id: "r1", author: "Marcus Webb", rating: 5, date: "Jun 20, 2026", body: "Dr. Osei is exceptional. She explained my heart condition in terms I could actually understand and her interventional procedure was seamless. Couldn't be in better hands.", verified: true },
    { id: "r2", author: "Sandra Kim", rating: 5, date: "Jun 5, 2026", body: "Best cardiologist in SF. She is thorough, compassionate, and incredibly knowledgeable. The wait time was minimal and the staff made me feel at ease throughout.", verified: true },
    { id: "r3", author: "Tom Reyes", rating: 4, date: "May 18, 2026", body: "Very professional and attentive. She followed up with my results quickly and her care plan has already made a measurable difference. Booking was easy through the app.", verified: true },
    { id: "r4", author: "Anne Hoffman", rating: 5, date: "Apr 30, 2026", body: "After years of misdiagnoses elsewhere, Dr. Osei correctly identified my condition on the first visit. Her expertise is genuinely life-changing.", verified: false },
  ],
  d2: [
    { id: "r5", author: "Bella Torres", rating: 5, date: "Jun 22, 2026", body: "Dr. Kovač finally solved my decade-long migraine problem. The preventive plan she designed has reduced my episodes by 80%. I cannot recommend her enough.", verified: true },
    { id: "r6", author: "Ryo Nakamura", rating: 5, date: "Jun 11, 2026", body: "Incredibly thorough neurologist. She spent a full 45 minutes with me, asked excellent questions, and never made me feel rushed.", verified: true },
    { id: "r7", author: "Claire Dubois", rating: 4, date: "May 25, 2026", body: "Dr. Kovač is very knowledgeable and patient. She walked me through all my options before recommending a treatment path. Office is clean and well-run.", verified: true },
  ],
  d3: [
    { id: "r8", author: "Kevin Park", rating: 5, date: "Jun 28, 2026", body: "Dr. Tran performed my ACL surgery and the recovery has been incredible. He has a calm confidence that puts you at ease, and his aftercare instructions were detailed and spot-on.", verified: true },
    { id: "r9", author: "Danielle Moore", rating: 5, date: "Jun 15, 2026", body: "Hip replacement at 62. Dr. Tran gave me my life back. Six weeks post-op and I'm walking without pain for the first time in years. Brilliant surgeon.", verified: true },
    { id: "r10", author: "Luca Romano", rating: 5, date: "May 30, 2026", body: "Total professional. Quick diagnosis, no fluff. Had my knee back to 100% in four months. Would recommend to any athlete dealing with a serious injury.", verified: true },
    { id: "r11", author: "Grace O'Connor", rating: 4, date: "May 12, 2026", body: "Excellent surgeon and lovely bedside manner. The only reason not 5 stars is the wait time for the initial consultation was about 3 weeks.", verified: false },
  ],
  d4: [
    { id: "r12", author: "Alex Johnson", rating: 5, date: "Jun 25, 2026", body: "Dr. Nair has been my primary care doctor for three years. She remembers everything about my history and always goes the extra mile. A true healer.", verified: true },
    { id: "r13", author: "Nina Okafor", rating: 5, date: "Jun 14, 2026", body: "I brought my whole family to Dr. Nair. She's the kind of doctor you actually want to visit — warm, thorough, and never dismissive.", verified: true },
  ],
  d5: [], d6: [], d7: [], d8: [],
};

export const SPECIALTIES = [
  "All Specialties",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "General Practice",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
];

export const INSURANCES = [
  "Aetna",
  "Blue Cross Blue Shield",
  "Cigna",
  "Kaiser Permanente",
  "Medi-Cal",
  "Medicare",
  "UnitedHealth",
];
