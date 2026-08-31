// Name / geography / language pools used by the synthetic sample-data generator.
// These are generic Nigerian given/family names recombined programmatically —
// they do not represent, and are not intended to identify, any real individual.

export const MALE_FIRST_NAMES = [
  "Chidi", "Emeka", "Tunde", "Ayo", "Femi", "Kunle", "Segun", "Bayo", "Dele",
  "Obinna", "Chukwuemeka", "Ikenna", "Uche", "Nnamdi", "Kelechi", "Chinedu",
  "Yusuf", "Ibrahim", "Musa", "Aliyu", "Suleiman", "Abdullahi", "Sani",
  "Damilare", "Oluwaseun", "Adewale", "Babatunde", "Olumide", "Gbenga",
  "Chibuzor", "Ekene", "Chimezie", "Ifeanyi", "Tochukwu", "Onyeka",
  "Wale", "Tobi", "Yemi", "Lekan", "Wole", "Bode", "Rotimi",
];

export const FEMALE_FIRST_NAMES = [
  "Chioma", "Ngozi", "Amaka", "Ifeoma", "Adaeze", "Nkechi", "Chiamaka",
  "Funmilayo", "Bukola", "Yetunde", "Folake", "Aisha", "Fatima", "Zainab",
  "Amina", "Halima", "Hauwa", "Temitope", "Damilola", "Adaobi", "Chinaza",
  "Oluwadamilare", "Tolu", "Bimpe", "Kemi", "Simi", "Toke", "Tiwa",
  "Rita", "Blessing", "Grace", "Faith", "Precious", "Ejiro", "Efe",
  "Osato", "Iyabo", "Morayo", "Aduke", "Sade", "Ronke", "Ope",
];

export const LAST_NAMES = [
  "Okafor", "Okonkwo", "Adeyemi", "Adebayo", "Balogun", "Bello", "Eze",
  "Nwosu", "Okoro", "Uzoma", "Chukwu", "Abubakar", "Mohammed", "Yakubu",
  "Ogunleye", "Afolabi", "Fashola", "Akintola", "Oyelaran", "Ibrahim",
  "Suleiman", "Danjuma", "Etim", "Effiong", "Udoh", "Bassey", "Amadi",
  "Nnamani", "Obiora", "Onyema", "Ajayi", "Alabi", "Fagbenle", "Lawal",
  "Sanusi", "Usman", "Garba", "Momoh", "Igbinedion", "Osagie", "Ehigie",
  "Ogundipe", "Sowande", "Faleye", "Adisa", "Olawale", "Okoli", "Nwachukwu",
];

export const STATE_CITIES: { state: string; cities: string[] }[] = [
  { state: "Lagos", cities: ["Lagos Island", "Lekki", "Ikeja", "Surulere", "Yaba", "Ajah"] },
  { state: "FCT (Abuja)", cities: ["Abuja", "Gwarinpa", "Wuse", "Garki", "Maitama"] },
  { state: "Rivers", cities: ["Port Harcourt", "Obio-Akpor"] },
  { state: "Oyo", cities: ["Ibadan", "Ogbomosho"] },
  { state: "Kano", cities: ["Kano"] },
  { state: "Enugu", cities: ["Enugu", "Nsukka"] },
  { state: "Delta", cities: ["Warri", "Asaba"] },
  { state: "Kaduna", cities: ["Kaduna", "Zaria"] },
  { state: "Ogun", cities: ["Abeokuta", "Sagamu"] },
  { state: "Edo", cities: ["Benin City"] },
  { state: "Anambra", cities: ["Awka", "Onitsha"] },
  { state: "Cross River", cities: ["Calabar"] },
  { state: "Akwa Ibom", cities: ["Uyo"] },
  { state: "Plateau", cities: ["Jos"] },
  { state: "Osun", cities: ["Osogbo", "Ile-Ife"] },
];

export const LANGUAGES_POOL = ["English", "Pidgin", "Yoruba", "Igbo", "Hausa"];

export const HANDLE_SUFFIXES = ["", "official", "ng", "tv", "hq", "diaries", "world", "media", "_", "9ja"];

export const BRAND_POOL = [
  "GloMobile", "MTN Nigeria", "Airtel Nigeria", "Jumia", "PiggyVest", "Kuda Bank",
  "Opay", "Bolt", "Nivea", "Zaron Cosmetics", "House of Tara", "Wella Professionals",
  "Indomie", "Cowbell", "Peak Milk", "Nestle Nigeria", "Coca-Cola Nigeria", "Pepsi Nigeria",
  "Guinness Nigeria", "Heineken Nigeria", "Fidelity Bank", "GTBank", "Access Bank",
  "UBA", "Zenith Bank", "Konga", "Shoprite Nigeria", "SPAR Nigeria", "Nike Africa",
  "Adidas Nigeria", "Zara", "Shein Nigeria", "Temu", "Samsung Nigeria", "Infinix Nigeria",
  "Tecno Mobile", "Oraimo", "Netflix Naija", "Showmax", "Spotify Nigeria", "Booking.com",
  "Travelstart", "Cadbury Nigeria", "Nasco Foods", "Chivita", "La Casera", "Fan Milk",
  "Honeywell Flour", "Dangote Group", "BUA Foods", "Flutterwave", "Paystack",
];

export const CONTENT_THEME_POOL: Record<string, string[]> = {
  "Beauty & Skincare": ["skincare routines", "makeup tutorials", "product reviews", "GRWM", "skin tone matching"],
  Fashion: ["outfit styling", "thrift/ohrifting hauls", "runway recaps", "brand try-ons", "street style"],
  Lifestyle: ["day-in-the-life vlogs", "home tours", "self-care", "productivity tips", "relationship talk"],
  "Food & Beverage": ["recipe videos", "restaurant reviews", "street food tours", "cooking hacks", "recipe remixes"],
  Technology: ["gadget unboxings", "app reviews", "tech news breakdowns", "buying guides", "AI explainers"],
  Finance: ["personal finance tips", "investing 101", "savings challenges", "market commentary", "money mindset"],
  "Business & Entrepreneurship": ["startup stories", "hustle culture", "small business tips", "side-hustle guides", "networking events"],
  Comedy: ["skits", "relatable sketches", "pranks", "voiceover comedy", "parody content"],
  Entertainment: ["celebrity gist", "movie reviews", "event coverage", "reaction videos", "pop culture recaps"],
  Music: ["freestyles", "cover songs", "studio sessions", "artist interviews", "afrobeats commentary"],
  Sports: ["match analysis", "training vlogs", "athlete interviews", "football banter", "fitness challenges"],
  "Fitness & Wellness": ["home workouts", "gym routines", "nutrition tips", "transformation stories", "mobility drills"],
  "Parenting & Family": ["mom-life vlogs", "baby product reviews", "family routines", "parenting tips", "school-run diaries"],
  Gaming: ["mobile gaming streams", "esports commentary", "game reviews", "walkthroughs", "gaming setup tours"],
  Travel: ["destination guides", "hidden gems in Nigeria", "travel vlogs", "budget travel tips", "hotel reviews"],
  Education: ["exam prep tips", "study-with-me", "career advice", "scholarship guides", "explainer content"],
  Automotive: ["car reviews", "road trip vlogs", "car maintenance tips", "auto show coverage", "detailing content"],
  "Health & Wellness": ["mental health talks", "wellness routines", "healthy recipes", "sleep tips", "medical myth-busting"],
};
