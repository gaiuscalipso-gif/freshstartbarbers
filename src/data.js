/* ────────────────────────────────────────────────────────────
   Fresh Start Grooming Lounge — content model
   ──────────────────────────────────────────────────────────── */

export const BUSINESS = {
  name: 'Fresh Start Grooming Lounge',
  logoName: 'Fresh Start Barbers',
  tagline: 'Every haircut is a fresh start',
  heroTagline: 'Your grooming. Your standard.',
  phone: '0741 578791',
  phoneIntl: '+254741578791',
  phoneDigits: '254741578791',
  address:
    'Superior Center, Kenyatta Avenue, 4th Floor, Suite K-5, Nairobi, Kenya',
  shortAddress: 'Superior Center, 4th Floor, K-5 · Nairobi',
  plusCode: 'PR8F+H4 Nairobi',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Superior+Center+Kenyatta+Avenue+Nairobi',
  instagram: 'https://www.instagram.com/fresh_start_barbers/',
  facebook: 'https://www.facebook.com/Freshstartbarbers',
  tiktok: 'https://www.tiktok.com/@freshstartbarbers',
  whatsapp:
    'https://wa.me/254741578791?text=Hello%20Fresh%20Start%20Grooming%20Lounge!%20I%27d%20like%20to%20reserve%20a%20chair.',
  rating: 5.0,
  timezone: 'Africa/Nairobi',
};

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'signature', label: 'Signature Haircuts' },
  { id: 'grooming', label: 'Precision & Beard Grooming' },
  { id: 'colour', label: 'Colour & Hair Artistry' },
  { id: 'face', label: 'Face & Skin Rituals' },
  { id: 'hands', label: 'Hand & Foot Care' },
  { id: 'body', label: 'Body Rituals' },
  { id: 'vip', label: 'Fresh Start VIP Collection' },
];

export const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
);

/* id, category, name, duration (min), price (KSh), description.
   Services are arranged lowest → highest price within each category. */
export const SERVICES = [
  // ── Signature Haircuts (8) — KSh 1,000 → 3,000
  { id: 'gentleman', cat: 'signature', name: "Gentleman's Cut (Normal Shave)", mins: 30, price: 1000, desc: 'Classic gentleman haircut with clean razor perimeter shave.', tags: 'gentleman classic shave razor normal' },
  { id: 'junior', cat: 'signature', name: "Young Gentleman's Cut Under 10", mins: 30, price: 1000, desc: 'Gentle, patient haircut crafted for junior gentlemen under 10 years.', tags: 'kids children junior boy under 10' },
  { id: 'bespoke', cat: 'signature', name: 'Bespoke Haircut', mins: 40, price: 1500, desc: 'Precision tailored haircut, scalp wash, hot towel finish & custom styling.', tags: 'cut fade haircut wash style signature' },
  { id: 'caucasian', cat: 'signature', name: 'Caucasian Haircut', mins: 45, price: 2500, desc: 'Specialized scissor-work, fine hair taper, texturing & refined styling.', tags: 'scissor cut fine hair taper texture caucasian' },
  { id: 'grey', cat: 'signature', name: 'Haircut + Grey Reduction/Dye', mins: 60, price: 2500, desc: 'Precision cut with subtle natural grey blending or full dye coverage.', tags: 'grey dye colour color blend reduction' },
  { id: 'student', cat: 'signature', name: 'The Mbogi Experience — 3 Student Haircuts', mins: 90, price: 2500, days: [1, 2, 3], desc: 'Three student haircuts for the crew — Monday to Wednesday only. Student ID optional; bring the mbogi, we handle the fresh.', tags: 'student mbogi shave na mbogi group offer campus monday tuesday wednesday', badge: 'Mon–Wed' },
  { id: 'group3', cat: 'signature', name: '3-Person Haircut Package', mins: 90, price: 3000, desc: 'Three haircuts in one relaxed 90-minute group session — brothers, friends or the whole crew.', tags: 'group three friends brothers package cut' },
  { id: 'freefriend', cat: 'signature', name: 'Bring 2 Friends — Free Classic Shave', mins: 90, price: 3000, desc: 'Referral treat: two friends enjoy Bespoke Haircuts (KSh 1,500 each) and the guest who brings them receives a complimentary Classic Shave in the same 90-minute visit.', tags: 'referral offer free classic shave friends group promo', badge: 'Referral' },

  // ── Precision & Beard Grooming (3) — KSh 500 → 1,000
  { id: 'hairline', cat: 'grooming', name: 'Hairline Shape Up', mins: 20, price: 500, desc: 'Crisp razor contouring, temple line definition & neck cleanup.', tags: 'line up shape hairline edge neck razor' },
  { id: 'beard', cat: 'grooming', name: 'Beard Trim', mins: 20, price: 500, desc: 'Detailed beard sculpture, edge line up, conditioning oil & soothing balm.', tags: 'beard sculpt trim oil balm edge' },
  { id: 'enhancement', cat: 'grooming', name: 'Enhancement/Dye Without Shave', mins: 20, price: 1000, desc: 'Semi-permanent hairline or beard fiber dye enhancement without a haircut.', tags: 'dye enhancement fiber beard hairline colour' },

  // ── Colour & Hair Artistry (3) — KSh 2,500 → 5,000
  { id: 'texture', cat: 'colour', name: 'Texturing + Shave', mins: 50, price: 2500, desc: 'Curl definition, wave texturing, or relaxing paired with signature shave.', tags: 'texture waves curls relax perm shave' },
  { id: 'halfcolour', cat: 'colour', name: 'Half Color + Shave', mins: 60, price: 3500, desc: 'Creative partial tone dye or bleach artistry paired with a full shave.', tags: 'colour color bleach dye shave half' },
  { id: 'fullcolour', cat: 'colour', name: 'Full Color + Shave', mins: 90, price: 5000, desc: 'Complete head color transformation paired with bespoke shave & finish.', tags: 'colour color dye bleach full shave transformation' },

  // ── Face & Skin Rituals (3) — KSh 1,000 → 3,000
  { id: 'scrub', cat: 'face', name: 'Face Scrub', mins: 20, price: 1000, desc: 'Deep exfoliating scrub to unclog pores, remove dead cells & refresh skin.', tags: 'scrub exfoliate skin face pores' },
  { id: 'halffacial', cat: 'face', name: 'Half Facial', mins: 30, price: 2000, desc: 'Targeted express cleansing, warm ozone steam & hydration mask.', tags: 'facial steam mask hydration express ozone' },
  { id: 'fullfacial', cat: 'face', name: 'Full Facial', mins: 45, price: 3000, desc: 'Comprehensive facial ritual with deep extraction, botanical mask & moisturizer.', tags: 'facial extraction botanical mask moisturizer' },

  // ── Hand & Foot Care (2) — KSh 1,000 → 2,000
  { id: 'manicure', cat: 'hands', name: 'Manicure', mins: 25, price: 1000, desc: 'Gentle hand exfoliation, nail trimming, cuticle grooming & buffing.', tags: 'manicure hands nails cuticle buff' },
  { id: 'pedicure', cat: 'hands', name: 'Pedicure', mins: 40, price: 2000, desc: 'Relaxing foot soak, scrub, callus treatment, nail shaping & cuticle care.', tags: 'pedicure feet nails callus soak' },

  // ── Body Rituals (2) — KSh 2,500 → 4,000
  { id: 'halfmassage', cat: 'body', name: 'Half Massage', mins: 30, price: 2500, desc: 'Focused tension release for neck, shoulders, and upper back.', tags: 'massage neck shoulders back tension' },
  { id: 'fullmassage', cat: 'body', name: 'Full Body Massage', mins: 60, price: 4000, desc: 'Full therapeutic relaxation massage with warm essential botanical oils.', tags: 'massage full body oils relaxation therapy' },

  // ── VIP Collection (4) — KSh 7,000 → 13,000
  { id: 'vip1', cat: 'vip', name: 'VIP Experience I: The Executive Grooming Ritual', mins: 90, price: 7000, vip: true, desc: 'Bespoke Shave + Pedicure + Manicure + Full Facial.', tags: 'vip executive shave pedicure manicure facial' },
  { id: 'vip3', cat: 'vip', name: 'VIP Experience III: The Renewal Ritual', mins: 120, price: 10000, vip: true, desc: 'Bespoke Shave + Manicure + Pedicure + Full Facial + Half Massage.', tags: 'vip renewal ritual facial massage shave' },
  { id: 'vip2', cat: 'vip', name: 'VIP Experience II: The Complete Gentleman', mins: 120, price: 10500, vip: true, desc: 'Bespoke Shave + Pedicure + Manicure + Full Facial + Full Body Massage.', tags: 'vip complete gentleman massage facial shave' },
  { id: 'vip4', cat: 'vip', name: 'VIP Experience IV: The Ultimate Fresh Start', mins: 150, price: 13000, vip: true, desc: 'Bespoke Shave + Pedicure + Manicure + Full Facial + Half Massage + Full Body Massage.', tags: 'vip ultimate fresh start massage facial shave' },
];

export const BARBERS = [
  {
    id: 'any',
    name: 'Any Available Barber',
    role: 'Next open chair',
    img: null,
    initials: 'FS',
    specialties: ['Fastest seat', 'All services', 'Walk-in friendly'],
    note: 'Let the lounge match you to the next available craftsman.',
  },
  {
    id: 'starkid',
    name: 'Starkid Bright',
    role: 'Senior Barber',
    img: '/img/barber-starkid.jpg',
    initials: 'SB',
    specialties: ['Bespoke cuts', 'Line-ups', 'Beard sculpt'],
    note: 'Sharp, architectural fades finished with a razor line-up.',
  },
  {
    id: 'cossy',
    name: 'Cossy Romeo',
    role: 'Grooming Specialist',
    img: '/img/barber-cossy.jpg',
    initials: 'CR',
    specialties: ['Textured afro', 'Hot towel shave', 'Styling'],
    note: 'Texture, movement and a shave that smells like the lounge.',
  },
  {
    id: 'alphie',
    name: 'Alphie The Barber',
    role: 'Razor & Shave Artisan',
    img: '/img/barber-alphie.jpg',
    initials: 'AB',
    specialties: ['Straight razor', 'Clean shave', 'Skin fades'],
    note: 'The straight razor is the instrument. Patience is the method.',
  },
  {
    id: 'mike',
    name: 'Mike will fade it',
    role: 'Fade Specialist',
    img: '/img/barber-mike.jpg',
    initials: 'MF',
    specialties: ['Skin fades', 'Curl sponge', 'Kids cuts'],
    note: 'If it can be blended, it can be faded. Bring a reference.',
  },
];

export const OFFERS = [
  {
    title: 'Bring 2 friends — complimentary Classic Shave for the host',
    serviceId: 'freefriend',
  },
  {
    title: '3-Person Haircut Package — KSh 3,000 · 90 min',
    serviceId: 'group3',
  },
  {
    title: 'The Mbogi Experience — 3 student haircuts, KSh 2,500, Mon–Wed (ID optional)',
    serviceId: 'student',
  },
  {
    title:
      'Complimentary Aftershave Hand & Shoulder Massage included with every service.',
  },
];

export const REFRESHMENTS = [
  {
    name: 'Coffee',
    detail: 'Regular / Americano',
    price: 250,
    note: 'Freshly brewed, poured the moment you sit.',
  },
  {
    name: 'Tea',
    detail: 'Black / Green',
    price: 200,
    note: 'Black or green, served in the lounge.',
  },
  {
    name: 'Light Bites',
    detail: 'Lounge Snacks',
    price: 350,
    note: 'A small plate while the clippers cool.',
  },
];

/* 0 = Sunday … 6 = Saturday */
export const HOURS = [
  { day: 1, label: 'Monday', open: '8:00 am', close: '8:00 pm', openMin: 480, closeMin: 1200 },
  { day: 2, label: 'Tuesday', open: '8:00 am', close: '8:00 pm', openMin: 480, closeMin: 1200 },
  { day: 3, label: 'Wednesday', open: '8:00 am', close: '8:00 pm', openMin: 480, closeMin: 1200 },
  { day: 4, label: 'Thursday', open: '8:30 am', close: '8:00 pm', openMin: 510, closeMin: 1200 },
  { day: 5, label: 'Friday', open: '8:00 am', close: '8:00 pm', openMin: 480, closeMin: 1200 },
  { day: 6, label: 'Saturday', open: '8:00 am', close: '8:00 pm', openMin: 480, closeMin: 1200 },
  { day: 0, label: 'Sunday', open: 'By Appointment Only! Premium Rates Apply.', close: '', appointment: true },
];

/* The one canonical Sunday listing — used verbatim everywhere */
export const SUNDAY_POLICY = 'By Appointment Only! Premium Rates Apply.';

export const SOCIALS = [
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@fresh_start_barbers',
    href: 'https://www.instagram.com/fresh_start_barbers/',
    note: 'Latest cuts, styles & chair moments',
    icon: 'i-instagram',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    handle: '@Freshstartbarbers',
    href: 'https://www.facebook.com/Freshstartbarbers',
    note: 'Official page · grooming updates',
    icon: 'i-facebook',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@freshstartbarbers',
    href: 'https://www.tiktok.com/@freshstartbarbers',
    note: 'Transformations, fades & behind the chair',
    icon: 'i-tiktok',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    handle: '+254 741 578 791',
    href: 'https://wa.me/254741578791',
    note: 'Direct inquiries & chair reservations',
    icon: 'i-whatsapp',
  },
];

/* ────────────────────────────────────────────────────────────
   Added for the Hickson-style layout — same barber content,
   new sections: gallery filters, 4-step process, Google reviews.
   ──────────────────────────────────────────────────────────── */

/* Gallery — Hickson "Projects Gallery", translated to lounge work.
   cat ids: cuts · beard · face · body · lounge              */
export const GALLERY_FILTERS = [
  { id: 'all', label: 'All Work' },
  { id: 'cuts', label: 'Cuts & Fades' },
  { id: 'beard', label: 'Beard & Shave' },
  { id: 'face', label: 'Face & Skin' },
  { id: 'body', label: 'Body & Hands' },
  { id: 'lounge', label: 'The Lounge' },
];

export const GALLERY = [
  { src: '/img/fade.jpg', cat: 'cuts', catLabel: 'Cuts & Fades', title: 'Precision Skin Fade & Line-Up', detail: 'Clipper-blended fade · razor temple line · 40 min', serviceId: 'bespoke' },
  { src: '/img/vip.jpg', cat: 'beard', catLabel: 'Beard & Shave', title: 'The Hot-Towel Ritual', detail: 'Straight razor · hot towel · VIP Collection finish', serviceId: 'vip1' },
  { src: '/img/beard.jpg', cat: 'beard', catLabel: 'Beard & Shave', title: 'Beard Sculpture', detail: 'Detailed sculpt · edge line-up · conditioning oil & balm', serviceId: 'beard' },
  { src: '/img/facial.jpg', cat: 'face', catLabel: 'Face & Skin', title: 'Full Facial Ritual', detail: 'Deep cleansing · warm ozone steam · botanical mask', serviceId: 'fullfacial' },
  { src: '/img/massage.jpg', cat: 'body', catLabel: 'Body & Hands', title: 'Full Body Massage', detail: 'Therapeutic relaxation · warm botanical oils · 60 min', serviceId: 'fullmassage' },
  { src: '/img/hands.jpg', cat: 'body', catLabel: 'Body & Hands', title: 'Manicure & Hand Care', detail: 'Exfoliation · cuticle grooming · buff at the marble counter', serviceId: 'manicure' },
  { src: '/img/hero.jpg', cat: 'cuts', catLabel: 'Cuts & Fades', title: 'The Bespoke Chair', detail: 'Tailored cut · scalp wash · custom styling', serviceId: 'bespoke' },
  { src: '/img/lounge.jpg', cat: 'lounge', catLabel: 'The Lounge', title: 'Coffee, Always On Us', detail: 'Coffee · tea · light bites with every service', serviceId: null },
  { src: '/img/barber-starkid.jpg', cat: 'lounge', catLabel: 'The Lounge', title: 'Starkid Bright — Senior Barber', detail: 'Senior chair · Suite K-5, 4th floor', serviceId: null },
];

/* How it works — Hickson 4-step flow, barber edition */
export const PROCESS = [
  { title: 'Pick Your Rituals', text: 'Browse the 25-service menu and select one or many. Your price and total chair time add up live — no surprises at the counter.' },
  { title: 'Choose Your Barber', text: 'Request Starkid, Cossy, Alphie or Mike — or take the next available chair and let the lounge match you.' },
  { title: 'Day & Time', text: 'Walk-ins welcome Mon–Sat, 8:00 am – 8:00 pm (Thu from 8:30 am) — no reservation needed. Sunday: By Appointment Only! Premium Rates Apply. Please book a day ahead.' },
  { title: 'Confirm & Sit Down', text: 'Your request opens pre-filled on WhatsApp 0741578791. We confirm, the towel warms, coffee is poured — take the chair.' },
];

/* Why gentlemen stay — Hickson 6-feature strip, barber edition */
export const PILLARS = [
  { icon: 'i-scissors', title: 'Consultation First', text: 'Hairline, growth pattern, lifestyle. Your barber reads the head before the clippers ever switch on.' },
  { icon: 'i-razor', title: 'Razor Discipline', text: 'Straight-razor perimeters, clean necks, sculpted beards — finished by hand, never rushed.' },
  { icon: 'i-cup', title: 'Lounge Hospitality', text: 'Freshly brewed coffee, tea and light bites are complimentary with every single service.' },
  { icon: 'i-crown', title: 'Discreet & Premium', text: 'A fourth-floor sanctuary on Kenyatta Avenue away from the street — private and unhurried.' },
  { icon: 'i-whatsapp', title: 'Direct WhatsApp Line', text: 'Call or WhatsApp 0741578791 and talk straight to the lounge — bookings confirmed fast.' },
  { icon: 'i-sparkle', title: 'Free Finishing Touch', text: 'Complimentary aftershave hand & shoulder massage included with every service, every visit.' },
];

/* Google Reviews — showcased reviews rendered by the Reviews section.
   Swap these entries with the lounge's live Google reviews any time;
   the "Read all on Google" button points at BUSINESS.mapsUrl.       */
export const REVIEW_SUMMARY = {
  rating: 5.0,
  label: '5 Star Rated · Google Verified',
  bars: [
    { stars: 5, pct: 100 },
    { stars: 4, pct: 0 },
    { stars: 3, pct: 0 },
    { stars: 2, pct: 0 },
    { stars: 1, pct: 0 },
  ],
};

export const REVIEWS = [
  { name: 'Brian Mwangi', area: 'Nairobi CBD', initials: 'BM', hue: '#c9a24d', stars: 5, when: '1w ago', service: 'Bespoke Haircut', text: '“Sharpest fade I have had in town. Consultation first, razor line-up, hot towel finish — and the coffee is genuinely free. This is my weekly chair now.”' },
  { name: 'Abdirahman Noor', area: 'Eastleigh, Nairobi', initials: 'AB', hue: '#7a9cc6', stars: 5, when: '1w ago', service: 'Beard Sculpt & Trim', text: '“Alphie shaped my beard exactly how I like it and finished with a straight razor — clean, patient, zero rush. A premium lounge that respects your style and your time.”' },
  { name: 'Samuel Kiprop', area: 'Upper Hill, Nairobi', initials: 'SK', hue: '#8fbf7f', stars: 5, when: '2w ago', service: 'VIP Experience II', text: '“Took the Complete Gentleman before my wedding — shave, facial, mani-pedi and massage in one sitting. Worth every shilling. Five stars, no debate.”' },
  { name: 'Daniel Bennett', area: 'Visiting from London', initials: 'DB', hue: '#c67b5c', stars: 5, when: '2w ago', service: "Gentleman's Cut", text: '“Found Fresh Start on Google while in Nairobi for work and walked in. Standards I would happily pay London prices for — precise cut, hot towel, immaculate lounge.”' },
  { name: 'Yusuf Abdi', area: 'South C, Nairobi', initials: 'YA', hue: '#9b8fd4', stars: 5, when: '3w ago', service: 'Referral — Free Classic Shave', text: '“Brought two of my boys for bespoke cuts and my classic shave was complimentary, exactly as promised. Coffee on arrival, shoulder massage after. We are regulars now.”' },
  { name: 'Anthony Mutua', area: 'South B, Nairobi', initials: 'AM', hue: '#d4b15c', stars: 5, when: '1mo ago', service: 'The Mbogi Experience', text: '“Three of us did the Mbogi Experience on a Tuesday — three clean student cuts for KSh 2,500, student ID optional. Mike will fade it blends a fade like nobody else.”' },
  { name: 'Omar Haddad', area: 'Visiting from Dubai', initials: 'Omar Haddad', hue: '#5cb8a6', stars: 5, when: '1mo ago', service: 'Sunday Premium Appointment', text: '“Booked the Sunday premium appointment a day ahead and the team confirmed everything on WhatsApp. Facial and massage in total privacy — five-star, discreet, worth it.”' },
  { name: 'James Mwangi', area: 'Ruiru, Kiambu', initials: 'JW', hue: '#c65c7b', stars: 5, when: '2mo ago', service: 'Skin Fade & Line-Up', text: '“Starkid’s fades are architectural. Lines stayed crisp for weeks. Walked in on a Saturday and was in the chair fast. Highly recommend.”' },
  { name: 'Lukas Meyer', area: 'Visiting from Berlin', initials: 'LM', hue: '#6f9fd8', stars: 5, when: '2mo ago', service: 'Caucasian Haircut', text: '“Finally a Nairobi barber who truly understands fine-hair scissor work. Proper taper, proper texturing, and a hot-towel finish. World-class — five stars.”' },
];

/* FAQs — copied verbatim from the previous Info tab */
export const FAQS = [
  { q: 'Do I need an appointment, or can I walk in?', a: 'Walk-ins are welcome — no reservation needed — Monday to Saturday, 8:00 am to 8:00 pm (Thursday from 8:30 am). If you want a specific barber, or you\'re coming with friends, reserve on WhatsApp so your chair is held. Sundays are different: By Appointment Only! Premium Rates Apply.' },
  { q: 'How do Sunday bookings work?', a: 'Sunday is By Appointment Only! Premium Rates Apply. Our private Sunday chairs are reserved exclusively for pre-booked gentlemen: please book at least one day in advance and we will confirm your premium rate and exact slot on WhatsApp (0741578791) before your chair is reserved — no surprises, just a quieter, more exclusive lounge.' },
  { q: 'Can I combine several services in one visit?', a: 'Yes — that is exactly how the menu is built. Select any combination of the 25 services and your total chair time is added up for you before you reserve. The VIP Collection already bundles the full ritual.' },
  { q: 'What does the complimentary offer include?', a: 'Every service includes a complimentary aftershave hand & shoulder massage, plus coffee, tea and light bites in the lounge — normally KSh 250, KSh 200 and KSh 350, on the house.' },
  { q: 'How do the group, referral and Mbogi offers work?', a: 'Three ways to bring the crew: (1) 3-Person Haircut Package — three haircuts, KSh 3,000, 90 minutes. (2) Referral treat — two friends enjoy Bespoke Haircuts (KSh 1,500 each; KSh 3,000 total) and the guest who brings them receives a complimentary Classic Shave in the same 90-minute visit. (3) The Mbogi Experience — three student haircuts for KSh 2,500, Monday to Wednesday only, student ID optional.' },
  { q: 'Where exactly is the lounge?', a: 'Superior Center, Kenyatta Avenue, 4th Floor, Suite K-5, Nairobi. Google Plus Code PR8F+H4 Nairobi — take the lift to the fourth floor and follow the signage.' },
];

/* Who takes the chair — audience tags used in About (Hickson tag row) */
export const AUDIENCES = ['Executives', 'Grooms & Groomsmen', 'Students', 'Young Gentlemen', 'Beard Regulars', 'International Guests', 'Colour & Style', 'VIP Guests', 'Walk-ins'];

export const money = (n) => `KSh ${Number(n).toLocaleString('en-KE')}`;

export const durationLabel = (mins) => {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
};
