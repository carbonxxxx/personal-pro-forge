-- تحديث القوالب لتصبح فريدة مع تصاميم مختلفة

-- قالب الإبداعي
UPDATE templates 
SET template_data = '{
  "layout": "creative",
  "colors": {
    "primary": "#7c3aed",
    "secondary": "#ec4899", 
    "accent": "#06b6d4",
    "background": "#0f0f23",
    "text": "#ffffff"
  },
  "fonts": {
    "heading": "Cairo",
    "body": "Tajawal"
  },
  "sections": ["hero", "about", "portfolio", "gallery", "products", "contact"],
  "features": ["dark_theme", "animated_elements", "portfolio_grid", "color_animations"],
  "style": {
    "borderRadius": "2xl",
    "animations": true,
    "gradient": true,
    "shadows": "glow"
  }
}',
gradient_colors = 'from-purple-600 via-pink-500 to-cyan-400'
WHERE name = 'الإبداعي' AND tier = 'free';

-- قالب الأعمال التقليدي
UPDATE templates 
SET template_data = '{
  "layout": "business",
  "colors": {
    "primary": "#1f2937",
    "secondary": "#3b82f6",
    "accent": "#6b7280",
    "background": "#ffffff",
    "text": "#1f2937"
  },
  "fonts": {
    "heading": "Tajawal",
    "body": "Cairo"
  },
  "sections": ["hero", "experience", "skills", "products", "contact"],
  "features": ["clean_design", "professional_layout", "minimal_animations"],
  "style": {
    "borderRadius": "lg",
    "animations": false,
    "gradient": false,
    "shadows": "subtle"
  }
}',
gradient_colors = 'from-gray-700 via-blue-600 to-gray-500'
WHERE name = 'الأعمال التقليدي' AND tier = 'free';

-- قالب Minimalist Pro
UPDATE templates 
SET template_data = '{
  "layout": "minimalist",
  "colors": {
    "primary": "#000000",
    "secondary": "#ffffff",
    "accent": "#f59e0b",
    "background": "#fafafa",
    "text": "#1a1a1a"
  },
  "fonts": {
    "heading": "Cairo",
    "body": "Tajawal"
  },
  "sections": ["hero", "about", "gallery", "contact"],
  "features": ["ultra_minimal", "clean_typography", "white_space"],
  "style": {
    "borderRadius": "none",
    "animations": false,
    "gradient": false,
    "shadows": "none"
  }
}',
gradient_colors = 'from-black via-amber-500 to-white'
WHERE name = 'Minimalist Pro' AND tier = 'free';

-- قالب الاستشاري المتميز
UPDATE templates 
SET template_data = '{
  "layout": "consultant",
  "colors": {
    "primary": "#059669",
    "secondary": "#0d9488",
    "accent": "#f59e0b",
    "background": "#f0fdf4",
    "text": "#064e3b"
  },
  "fonts": {
    "heading": "Cairo",
    "body": "Tajawal"
  },
  "sections": ["hero", "expertise", "experience", "case_studies", "gallery", "products", "testimonials", "contact"],
  "features": ["case_studies", "certifications", "client_logos", "expertise_grid"],
  "style": {
    "borderRadius": "xl",
    "animations": true,
    "gradient": true,
    "shadows": "medium"
  }
}',
gradient_colors = 'from-emerald-600 via-teal-600 to-amber-500'
WHERE name = 'الاستشاري المتميز' AND tier = 'business';

-- قالب الشركاتي المهني
UPDATE templates 
SET template_data = '{
  "layout": "corporate",
  "colors": {
    "primary": "#1f2937",
    "secondary": "#374151",
    "accent": "#3b82f6",
    "background": "#f9fafb",
    "text": "#111827"
  },
  "fonts": {
    "heading": "Tajawal",
    "body": "Cairo"
  },
  "sections": ["hero", "about", "experience", "achievements", "gallery", "products", "testimonials", "contact"],
  "features": ["clean_design", "professional_layout", "print_ready", "company_branding"],
  "style": {
    "borderRadius": "lg",
    "animations": true,
    "gradient": false,
    "shadows": "corporate"
  }
}',
gradient_colors = 'from-gray-800 via-gray-600 to-blue-600'
WHERE name = 'الشركاتي المهني' AND tier = 'business';

-- قالب ريادة الأعمال
UPDATE templates 
SET template_data = '{
  "layout": "startup",
  "colors": {
    "primary": "#7c3aed",
    "secondary": "#ec4899",
    "accent": "#06b6d4",
    "background": "#faf5ff",
    "text": "#581c87"
  },
  "fonts": {
    "heading": "Cairo",
    "body": "Tajawal"
  },
  "sections": ["hero", "mission", "products", "team", "gallery", "investors", "contact"],
  "features": ["product_showcase", "team_section", "investor_deck", "startup_metrics"],
  "style": {
    "borderRadius": "2xl",
    "animations": true,
    "gradient": true,
    "shadows": "vibrant"
  }
}',
gradient_colors = 'from-purple-600 via-pink-500 to-cyan-500'
WHERE name = 'ريادة الأعمال' AND tier = 'business';

-- إضافة قوالب جديدة فريدة

-- قالب المصور الاحترافي
INSERT INTO templates (name, name_en, description, category, tier, template_data, gradient_colors, is_active) VALUES
('المصور الاحترافي', 'Professional Photographer', 'قالب مخصص للمصورين المحترفين مع معرض صور تفاعلي', 'تصوير', 'premium', '{
  "layout": "photographer",
  "colors": {
    "primary": "#0c0c0c",
    "secondary": "#f5f5f5",
    "accent": "#ff6b6b",
    "background": "#1a1a1a",
    "text": "#ffffff"
  },
  "fonts": {
    "heading": "Cairo",
    "body": "Tajawal"
  },
  "sections": ["hero", "about", "portfolio", "gallery", "products", "services", "contact"],
  "features": ["fullscreen_gallery", "lightbox", "image_filters", "booking_system"],
  "style": {
    "borderRadius": "none",
    "animations": true,
    "gradient": false,
    "shadows": "dramatic"
  }
}', 'from-black via-red-500 to-gray-900', true);

-- قالب المطور التقني
INSERT INTO templates (name, name_en, description, category, tier, template_data, gradient_colors, is_active) VALUES
('المطور التقني', 'Tech Developer', 'قالب متخصص للمطورين مع عرض المشاريع والكود', 'تطوير', 'premium', '{
  "layout": "developer",
  "colors": {
    "primary": "#0d1117",
    "secondary": "#21262d",
    "accent": "#58a6ff",
    "background": "#010409",
    "text": "#f0f6fc"
  },
  "fonts": {
    "heading": "Cairo",
    "body": "Tajawal"
  },
  "sections": ["hero", "about", "skills", "projects", "gallery", "products", "github", "contact"],
  "features": ["code_syntax", "github_integration", "tech_stack", "project_demos"],
  "style": {
    "borderRadius": "md",
    "animations": true,
    "gradient": true,
    "shadows": "neon"
  }
}', 'from-blue-900 via-indigo-800 to-purple-900', true);

-- قالب الفنان الإبداعي
INSERT INTO templates (name, name_en, description, category, tier, template_data, gradient_colors, is_active) VALUES
('الفنان الإبداعي', 'Creative Artist', 'قالب للفنانين مع عرض الأعمال الفنية بطريقة إبداعية', 'فن', 'super', '{
  "layout": "artist",
  "colors": {
    "primary": "#ff6b35",
    "secondary": "#f7931e",
    "accent": "#ffd23f",
    "background": "#2d1b69",
    "text": "#ffffff"
  },
  "fonts": {
    "heading": "Cairo",
    "body": "Tajawal"
  },
  "sections": ["hero", "about", "artworks", "gallery", "products", "exhibitions", "contact"],
  "features": ["artistic_layout", "color_palette", "artwork_zoom", "exhibition_timeline"],
  "style": {
    "borderRadius": "3xl",
    "animations": true,
    "gradient": true,
    "shadows": "artistic"
  }
}', 'from-orange-500 via-yellow-400 to-purple-800', true);

-- قالب طبيب/مختص طبي
INSERT INTO templates (name, name_en, description, category, tier, template_data, gradient_colors, is_active) VALUES
('الطبيب المختص', 'Medical Specialist', 'قالب للأطباء والمختصين الطبيين', 'طب', 'premium', '{
  "layout": "medical",
  "colors": {
    "primary": "#0ea5e9",
    "secondary": "#0284c7",
    "accent": "#06b6d4",
    "background": "#f0f9ff",
    "text": "#0c4a6e"
  },
  "fonts": {
    "heading": "Tajawal",
    "body": "Cairo"
  },
  "sections": ["hero", "about", "specialties", "experience", "gallery", "services", "appointments", "contact"],
  "features": ["appointment_booking", "medical_credentials", "patient_reviews", "service_pricing"],
  "style": {
    "borderRadius": "xl",
    "animations": false,
    "gradient": true,
    "shadows": "soft"
  }
}', 'from-sky-500 via-blue-600 to-cyan-500', true);

-- قالب المعلم/المدرب
INSERT INTO templates (name, name_en, description, category, tier, template_data, gradient_colors, is_active) VALUES
('المعلم المبدع', 'Creative Educator', 'قالب للمعلمين والمدربين التعليميين', 'تعليم', 'business', '{
  "layout": "educator",
  "colors": {
    "primary": "#16a34a",
    "secondary": "#15803d",
    "accent": "#facc15",
    "background": "#f0fdf4",
    "text": "#14532d"
  },
  "fonts": {
    "heading": "Cairo",
    "body": "Tajawal"
  },
  "sections": ["hero", "about", "courses", "experience", "gallery", "products", "testimonials", "contact"],
  "features": ["course_catalog", "educational_content", "student_reviews", "learning_materials"],
  "style": {
    "borderRadius": "lg",
    "animations": true,
    "gradient": true,
    "shadows": "warm"
  }
}', 'from-green-600 via-emerald-500 to-yellow-400', true);

-- قالب رجل الأعمال
INSERT INTO templates (name, name_en, description, category, tier, template_data, gradient_colors, is_active) VALUES
('رجل الأعمال النخبة', 'Elite Businessman', 'قالب فاخر لرجال الأعمال والمديرين التنفيذيين', 'أعمال', 'super', '{
  "layout": "executive",
  "colors": {
    "primary": "#92400e",
    "secondary": "#a16207",
    "accent": "#d97706",
    "background": "#fffbeb",
    "text": "#451a03"
  },
  "fonts": {
    "heading": "Tajawal",
    "body": "Cairo"
  },
  "sections": ["hero", "about", "achievements", "portfolio", "gallery", "products", "network", "contact"],
  "features": ["luxury_design", "achievement_showcase", "business_network", "investment_portfolio"],
  "style": {
    "borderRadius": "2xl",
    "animations": true,
    "gradient": true,
    "shadows": "luxury"
  }
}', 'from-amber-700 via-orange-600 to-yellow-500', true);