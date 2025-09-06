import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Heart, 
  Eye, 
  Download,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  ExternalLink,
  Copy,
  MessageCircle
} from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { toast } from "sonner";

const ProfileView = () => {
  const { username } = useParams();
  const [liked, setLiked] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getProfileByUrl } = useUserProfiles();

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        const profileData = await getProfileByUrl(username);
        setProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('خطأ في تحميل الملف الشخصي');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground arabic-body">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 arabic-heading">الملف غير موجود</h1>
          <p className="text-muted-foreground arabic-body mb-8">لم يتم العثور على الملف الشخصي المطلوب</p>
          <Button asChild>
            <Link to="/">العودة للصفحة الرئيسية</Link>
          </Button>
        </div>
      </div>
    );
  }

  const profileData = profile.profile_data || {};
  
  // Mock fallback data - in real app this would come from database
  const fallbackProfile = {
    name: "أحمد محمد",
    title: "مطور تطبيقات الويب | مختص React & Node.js",
    bio: "مطور ويب محترف مع أكثر من 5 سنوات خبرة في تطوير التطبيقات الحديثة. أعمل مع الشركات الناشئة والمؤسسات لتحويل الأفكار إلى منتجات رقمية ناجحة.",
    image: null,
    location: "طرابلس، ليبيا",
    email: "ahmed@example.com",
    phone: "+218 91 234 5678",
    website: "https://ahmed-dev.com",
    template: "minimalist",
    skills: [
      "React", "Node.js", "JavaScript", "TypeScript", "Python",
      "MongoDB", "PostgreSQL", "Docker", "AWS", "Git"
    ],
    socialLinks: [
      { platform: "LinkedIn", url: "https://linkedin.com/in/ahmed", icon: "linkedin" },
      { platform: "GitHub", url: "https://github.com/ahmed", icon: "github" },
      { platform: "Twitter", url: "https://twitter.com/ahmed", icon: "twitter" }
    ],
    portfolio: [
      {
        title: "منصة التجارة الإلكترونية",
        description: "تطبيق ويب متكامل للتجارة الإلكترونية باستخدام React و Node.js",
        image: null,
        link: "https://example.com",
        tags: ["React", "Node.js", "MongoDB"]
      },
      {
        title: "تطبيق إدارة المشاريع",
        description: "أداة لإدارة المشاريع والمهام للفرق الصغيرة والمتوسطة",
        image: null,
        link: "https://example.com",
        tags: ["Vue.js", "Laravel", "MySQL"]
      },
      {
        title: "منصة التعلم الرقمي",
        description: "نظام إدارة التعلم مع أدوات تفاعلية ومتابعة التقدم",
        image: null,
        link: "https://example.com",
        tags: ["Angular", "Django", "PostgreSQL"]
      }
    ],
    services: [
      {
        title: "تطوير تطبيقات الويب",
        description: "تطوير تطبيقات ويب حديثة ومتجاوبة",
        price: "من 500 د.ل",
        duration: "2-4 أسابيع"
      },
      {
        title: "استشارات تقنية",
        description: "استشارات في اختيار التقنيات والمعمارية",
        price: "100 د.ل/ساعة",
        duration: "مرن"
      }
    ],
    testimonials: [
      {
        name: "سارة أحمد",
        role: "مدير منتج",
        content: "أحمد مطور محترف ومبدع. ساعدنا في تطوير منصتنا بجودة عالية وفي الوقت المحدد.",
        rating: 5
      },
      {
        name: "محمد علي",
        role: "رائد أعمال",
        content: "تعامل رائع ونتائج مذهلة. أنصح بالتعامل مع أحمد لأي مشروع تقني.",
        rating: 5
      }
    ]
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - ${profile.title}`,
          text: profile.bio,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-premium rounded-lg flex items-center justify-center text-white font-bold text-sm">
                ب
              </div>
              <span className="font-bold text-lg arabic-heading">برو فورج</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{profile.view_count || 0}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLiked(!liked)}
                className={`rounded-full ${liked ? 'text-red-500 border-red-200' : ''}`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="rounded-full"
              >
                <Share2 className="w-4 h-4" />
              </Button>

              <Button 
                size="sm"
                className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-full"
                asChild
              >
                <Link to="/login">إنشاء ملفي</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="p-8 rounded-2xl border-gray-200 shadow-lg mb-8">
            <div className="text-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-primary to-premium rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {(profileData.name || fallbackProfile.name).charAt(0)}
              </div>
              <h1 className="text-4xl font-bold mb-4 arabic-heading">{profileData.name || fallbackProfile.name}</h1>
              <p className="text-xl text-muted-foreground mb-6 arabic-body">{profileData.title || fallbackProfile.title}</p>
              <p className="text-muted-foreground arabic-body max-w-2xl mx-auto leading-relaxed">
                {profileData.bio || fallbackProfile.bio}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{profile.view_count || 0} مشاهدة</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {(profileData.location || fallbackProfile.location) && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="arabic-body">{profileData.location || fallbackProfile.location}</span>
                </div>
              )}
              {(profileData.email || fallbackProfile.email) && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="arabic-body">{profileData.email || fallbackProfile.email}</span>
                </div>
              )}
              {(profileData.phone || fallbackProfile.phone) && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="arabic-body">{profileData.phone || fallbackProfile.phone}</span>
                </div>
              )}
              {(profileData.website || fallbackProfile.website) && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <Globe className="w-5 h-5 text-primary" />
                  <a href={profileData.website || fallbackProfile.website} target="_blank" rel="noopener noreferrer" className="arabic-body hover:text-primary">
                    الموقع الإلكتروني
                  </a>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-4">
              {(profileData.socialLinks || fallbackProfile.socialLinks).map((link, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 ml-2" />
                    {link.platform}
                  </a>
                </Button>
              ))}
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6 rounded-2xl border-gray-200 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6 arabic-heading">المهارات والخبرات</h2>
            <div className="flex flex-wrap gap-3">
              {(profileData.skills || fallbackProfile.skills).map((skill, index) => (
                <Badge 
                  key={index}
                  className="bg-gradient-to-r from-primary/10 to-premium/10 text-primary border border-primary/20 px-4 py-2 rounded-full text-base"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Galleries */}
          {profileData.galleries && profileData.galleries.length > 0 && (
            <Card className="p-6 rounded-2xl border-gray-200 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-6 arabic-heading">معارض الصور</h2>
              {profileData.galleries.map((gallery, galleryIndex) => (
                <div key={galleryIndex} className="mb-8">
                  <h3 className="text-xl font-bold mb-4 arabic-heading">{gallery.title}</h3>
                  {gallery.description && (
                    <p className="text-muted-foreground mb-4 arabic-body">{gallery.description}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {gallery.images.map((image, imageIndex) => (
                      <div key={imageIndex} className="aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer">
                        <img
                          src={image.url}
                          alt={image.title || `صورة ${imageIndex + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="%236b7280">صورة غير متاحة</text></svg>';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Products */}
          {profileData.products && profileData.products.length > 0 && (
            <Card className="p-6 rounded-2xl border-gray-200 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-6 arabic-heading">المنتجات والخدمات</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profileData.products.map((product, index) => (
                  <Card key={index} className="p-4 rounded-xl border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    {product.images && product.images.length > 0 && (
                      <div className="w-full h-40 bg-muted rounded-lg mb-4 overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="%236b7280">صورة غير متاحة</text></svg>';
                          }}
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold mb-1 arabic-heading">{product.name}</h3>
                        {product.category && (
                          <Badge className="bg-muted text-muted-foreground text-xs mb-2">
                            {product.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground arabic-body line-clamp-3">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-primary">
                          {product.price} {product.currency}
                        </span>
                        <Button variant="outline" size="sm" className="rounded-lg arabic-body">
                          <MessageCircle className="w-4 h-4 ml-2" />
                          استفسار
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Portfolio */}
          <Card className="p-6 rounded-2xl border-gray-200 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6 arabic-heading">معرض الأعمال</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(profileData.portfolio || fallbackProfile.portfolio).map((project, index) => (
                <Card key={index} className="p-6 rounded-xl border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-premium/10 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-4xl">🚀</div>
                  </div>
                  <h3 className="font-bold mb-2 arabic-heading">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 arabic-body">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} className="bg-muted text-muted-foreground text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full rounded-lg" asChild>
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 ml-2" />
                      عرض المشروع
                    </a>
                  </Button>
                </Card>
              ))}
            </div>
          </Card>

          {/* Services */}
          <Card className="p-6 rounded-2xl border-gray-200 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6 arabic-heading">الخدمات المتاحة</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {(profileData.services || fallbackProfile.services).map((service, index) => (
                <Card key={index} className="p-6 rounded-xl border-primary/20 bg-gradient-to-br from-primary/5 to-premium/5">
                  <h3 className="font-bold mb-3 arabic-heading">{service.title}</h3>
                  <p className="text-muted-foreground mb-4 arabic-body">{service.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-primary">{service.price}</span>
                    <span className="text-sm text-muted-foreground arabic-body">{service.duration}</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-lg">
                    <MessageCircle className="w-4 h-4 ml-2" />
                    طلب الخدمة
                  </Button>
                </Card>
              ))}
            </div>
          </Card>

          {/* Testimonials */}
          <Card className="p-6 rounded-2xl border-gray-200 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6 arabic-heading">آراء العملاء</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {(profileData.testimonials || fallbackProfile.testimonials).map((testimonial, index) => (
                <Card key={index} className="p-6 rounded-xl border-gray-200 bg-muted/30">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gold fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 arabic-body italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-bold arabic-heading">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground arabic-body">{testimonial.role}</div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Contact CTA */}
          <Card className="p-8 rounded-2xl border-primary/20 bg-gradient-to-r from-primary/5 to-premium/5 text-center">
            <h2 className="text-2xl font-bold mb-4 arabic-heading">هل تريد التعامل معي؟</h2>
            <p className="text-muted-foreground mb-6 arabic-body">
              دعني أساعدك في تحويل فكرتك إلى واقع رقمي
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <MessageCircle className="w-5 h-5 ml-2" />
                تواصل معي الآن
              </Button>
              <Button variant="outline" className="rounded-xl border-primary/20 hover:border-primary/40">
                <Download className="w-5 h-5 ml-2" />
                تحميل السيرة الذاتية
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-gray-200/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground arabic-body mb-4">
            تم إنشاء هذا الملف باستخدام 
            <Link to="/" className="text-primary hover:text-primary/80 mx-1 font-medium">
              برو فورج
            </Link>
          </p>
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link to="/login">إنشاء ملفك الاحترافي مجاناً</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ProfileView;