export const SITE_CONFIG = {
  name: "برو فورج",
  description: "منصة الملفات الشخصية الاحترافية",
  url: "https://proforge.com",
  author: "برو فورج"
};

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "مجاني",
    price: 0,
    profiles: 1,
    commission: 0,
    features: ["لوحة تحكم بسيطة", "رابط مميز", "قالب واحد"]
  },
  premium: {
    name: "مميز",
    price: 55,
    profiles: 3,
    commission: 20,
    features: ["لوحة تحكم متقدمة", "تتبع الإحالات", "تخصيص القالب", "5 قوالب"]
  },
  business: {
    name: "أعمال", 
    price: 155,
    profiles: 15,
    commission: 30,
    features: ["تحليلات متقدمة", "إدارة الفرق", "دعم فني مباشر", "10 قوالب"]
  },
  super: {
    name: "خارق",
    price: 250,
    profiles: -1,
    commission: 35,
    features: ["ذكاء صناعي", "أدوات تسويق", "تكامل API", "جميع القوالب"]
  }
};

export const TEMPLATE_CATEGORIES = [
  "الكل",
  "إبداعي",
  "احترافي",
  "تقني",
  "تجاري",
  "شخصي"
];