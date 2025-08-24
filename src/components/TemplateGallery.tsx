import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Download, Star } from "lucide-react";

const TemplateGallery = () => {
  const templates = [
    {
      id: 1,
      name: "Minimalist Pro",
      description: "تصميم بسيط وأنيق للمحترفين",
      image: "/api/placeholder/300/200",
      category: "احترافي",
      tier: "free",
      rating: 4.8,
      downloads: 1200,
      preview: true,
      gradient: "from-gray-400 to-gray-600"
    },
    {
      id: 2,
      name: "Creative Grid",
      description: "عرض أعمال بنمط شبكي إبداعي",
      image: "/api/placeholder/300/200",
      category: "إبداعي",
      tier: "premium",
      rating: 4.9,
      downloads: 850,
      preview: true,
      gradient: "from-premium to-purple-600"
    },
    {
      id: 3,
      name: "Dark Mode Hero",
      description: "تصميم ليلي جذاب ومميز",
      image: "/api/placeholder/300/200",
      category: "مبدع",
      tier: "premium",
      rating: 4.7,
      downloads: 950,
      preview: true,
      gradient: "from-gray-800 to-purple-900"
    },
    {
      id: 4,
      name: "Startup Pitch",
      description: "مناسب للمؤسسين ورواد الأعمال",
      image: "/api/placeholder/300/200",
      category: "أعمال",
      tier: "business",
      rating: 4.9,
      downloads: 720,
      preview: true,
      gradient: "from-business to-blue-600"
    },
    {
      id: 5,
      name: "Freelancer Hub",
      description: "عرض خدمات ومهارات المستقلين",
      image: "/api/placeholder/300/200", 
      category: "خدمات",
      tier: "premium",
      rating: 4.6,
      downloads: 1100,
      preview: true,
      gradient: "from-green-500 to-teal-600"
    },
    {
      id: 6,
      name: "Corporate Card",
      description: "تصميم رسمي احترافي للشركات",
      image: "/api/placeholder/300/200",
      category: "شركات",
      tier: "business",
      rating: 4.8,
      downloads: 680,
      preview: true,
      gradient: "from-blue-700 to-indigo-800"
    },
    {
      id: 7,
      name: "Visual Portfolio",
      description: "تركيز على الصور والفيديوهات",
      image: "/api/placeholder/300/200",
      category: "بورتفوليو",
      tier: "premium",
      rating: 4.7,
      downloads: 920,
      preview: true,
      gradient: "from-pink-500 to-rose-600"
    },
    {
      id: 8,
      name: "Interactive Resume",
      description: "سيرة ذاتية تفاعلية مبتكرة",
      image: "/api/placeholder/300/200",
      category: "سيرة ذاتية",
      tier: "business",
      rating: 4.9,
      downloads: 580,
      preview: true,
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      id: 9,
      name: "Influencer Style",
      description: "مناسب للمؤثرين وصناع المحتوى",
      image: "/api/placeholder/300/200",
      category: "تأثير",
      tier: "super",
      rating: 5.0,
      downloads: 450,
      preview: true,
      gradient: "from-super to-pink-600"
    },
    {
      id: 10,
      name: "Arabic Modern",
      description: "تصميم عربي عصري بطابع مزبر",
      image: "/api/placeholder/300/200",
      category: "عربي",
      tier: "super",
      rating: 4.9,
      downloads: 380,
      preview: true,
      gradient: "from-gold to-orange-500"
    }
  ];

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Badge className="bg-gray-500 text-white">مجاني</Badge>;
      case 'premium':
        return <Badge className="bg-gradient-to-r from-premium to-purple-600 text-white">مميز</Badge>;
      case 'business':
        return <Badge className="bg-gradient-to-r from-business to-blue-600 text-white">أعمال</Badge>;
      case 'super':
        return <Badge className="bg-gradient-to-r from-super to-pink-600 text-white animate-pulse">خارق 💥</Badge>;
      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background" id="templates">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 arabic-heading bg-gradient-to-r from-primary via-premium to-super bg-clip-text text-transparent">
            معرض القوالب
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto arabic-body">
            اختر من مجموعة قوالب احترافية مصممة خصيصاً للسوق العربي والعالمي
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['الكل', 'مجاني', 'مميز', 'أعمال', 'خارق'].map((filter) => (
            <Button
              key={filter}
              variant={filter === 'الكل' ? 'default' : 'outline'}
              className={`px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 ${
                filter === 'الكل' 
                  ? 'bg-gradient-to-r from-primary to-primary-glow text-white shadow-lg' 
                  : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {templates.map((template, index) => (
            <Card 
              key={template.id}
              className="group overflow-hidden rounded-2xl border-2 border-gray-200 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Template Image */}
              <div className="relative overflow-hidden">
                <div 
                  className={`w-full h-48 bg-gradient-to-br ${template.gradient} flex items-center justify-center relative`}
                >
                  {/* Mockup Content */}
                  <div className="absolute inset-4 bg-white/90 rounded-lg p-4 shadow-lg">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-premium rounded-full mx-auto mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-1 bg-gray-200 rounded"></div>
                      <div className="h-1 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  {/* Tier Badge */}
                  <div className="absolute top-3 right-3">
                    {getTierBadge(template.tier)}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Button size="sm" className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                      <Eye className="w-4 h-4 ml-2" />
                      معاينة
                    </Button>
                    <Button size="sm" className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold arabic-heading">{template.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="text-sm font-medium">{template.rating}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-3 arabic-body">{template.description}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="arabic-body">{template.category}</span>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{template.downloads.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  className={`w-full rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                    template.tier === 'super' 
                      ? 'bg-gradient-to-r from-super to-pink-600 text-white shadow-lg hover:shadow-xl animate-glow' 
                      : template.tier === 'business'
                      ? 'bg-gradient-to-r from-business to-blue-600 text-white shadow-lg hover:shadow-xl'
                      : template.tier === 'premium'
                      ? 'bg-gradient-to-r from-premium to-purple-600 text-white shadow-lg hover:shadow-xl'
                      : 'border-2 border-primary/20 hover:border-primary/40 bg-white hover:bg-primary/5'
                  }`}
                >
                  {template.tier === 'free' ? 'استخدام مجاناً' : 'معاينة وتفعيل'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Show More Button */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-6 rounded-xl border-2 border-primary/20 hover:border-primary/40 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105"
          >
            عرض المزيد من القوالب
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TemplateGallery;