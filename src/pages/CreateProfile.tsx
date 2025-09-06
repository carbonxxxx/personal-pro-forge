import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, ArrowLeft, Eye, User, Briefcase, Award, MessageCircle, ImageIcon, Package } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { toast } from 'sonner';
import SubscriptionLimitModal from '@/components/SubscriptionLimitModal';
import GalleryManager from '@/components/GalleryManager';
import ProductManager from '@/components/ProductManager';

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  
  const { allTemplates, loading: templatesLoading, getTierBadge } = useTemplates();
  const { createProfile, canCreateProfile, canAccessTemplate } = useUserProfiles();
  const { currentPlan } = useSubscriptions();
  
  const [selectedTemplate, setSelectedTemplate] = useState(templateId || '');
  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    bio: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    profileImage: '',
    socialLinks: [] as Array<{ platform: string; url: string }>,
    skills: [] as string[],
    portfolio: [] as any[],
    services: [] as any[],
    galleries: [] as Array<{
      id: string;
      title: string;
      description?: string;
      images: Array<{
        url: string;
        title?: string;
        description?: string;
      }>;
    }>,
    products: [] as Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      currency: string;
      images: string[];
      category?: string;
    }>
  });
  
  const [customUrl, setCustomUrl] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<'profiles' | 'templates'>('profiles');

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleSave = async () => {
    if (!selectedTemplate) {
      toast.error('يرجى اختيار قالب');
      return;
    }

    if (!profileData.name || !profileData.title) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    // Check profile creation limit
    const profileCheck = canCreateProfile();
    if (!profileCheck.canCreate) {
      setLimitModalType('profiles');
      setShowLimitModal(true);
      return;
    }

    setSaving(true);
    try {
      await createProfile(selectedTemplate, profileData, customUrl || undefined);
      toast.success('تم إنشاء الملف بنجاح!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ في إنشاء الملف');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addSocialLink = () => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
    }));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSocialLink = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const addPortfolioItem = () => {
    setProfileData(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, {
        title: '',
        description: '',
        link: '',
        image: '',
        tags: []
      }]
    }));
  };

  const updatePortfolioItem = (index: number, updates: any) => {
    setProfileData(prev => ({
      ...prev,
      portfolio: prev.portfolio.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    }));
  };

  const removePortfolioItem = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    setProfileData(prev => ({
      ...prev,
      services: [...prev.services, {
        title: '',
        description: '',
        price: '',
        duration: ''
      }]
    }));
  };

  const updateService = (index: number, updates: any) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, ...updates } : service
      )
    }));
  };

  const removeService = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleTemplateSelect = (templateId: string, templateTier: string) => {
    if (!canAccessTemplate(templateTier)) {
      setLimitModalType('templates');
      setShowLimitModal(true);
      return;
    }
    setSelectedTemplate(templateId);
  };

  if (templatesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground arabic-body">جاري تحميل القوالب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="arabic-body">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للوحة التحكم
            </Button>

            <h1 className="text-xl font-bold arabic-heading">إنشاء ملف شخصي جديد</h1>

            <Button
              onClick={handleSave}
              disabled={saving || !selectedTemplate}
              className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary arabic-body"
            >
              <Save className="w-4 h-4 ml-2" />
              {saving ? 'جاري الحفظ...' : 'حفظ ونشر'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!selectedTemplate ? (
            /* Template Selection */
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 arabic-heading">اختر القالب المناسب</h2>
                <p className="text-muted-foreground arabic-body">اختر التصميم الذي يناسب مجال عملك</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      canAccessTemplate(template.tier)
                        ? 'hover:shadow-lg hover:border-primary/30'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => handleTemplateSelect(template.id, template.tier)}
                  >
                    <div className={`w-full h-32 bg-gradient-to-br ${template.gradient_colors || 'from-primary to-premium'} rounded-lg mb-4 flex items-center justify-center`}>
                      <div className="text-white text-4xl font-bold">
                        {template.name.charAt(0)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold arabic-heading">{template.name}</h3>
                      <Badge className={getTierBadge(template.tier).className}>
                        {getTierBadge(template.tier).text}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground arabic-body">
                      {template.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Profile Form */
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 arabic-body">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  الأساسية
                </TabsTrigger>
                <TabsTrigger value="work" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  الخبرات
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  المعرض
                </TabsTrigger>
                <TabsTrigger value="galleries" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  الصور
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  المنتجات
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  الخدمات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold arabic-heading mb-4">المعلومات الأساسية</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="arabic-body">الاسم الكامل *</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="أدخل اسمك الكامل"
                        className="arabic-body"
                      />
                    </div>
                    <div>
                      <Label className="arabic-body">المسمى الوظيفي *</Label>
                      <Input
                        value={profileData.title}
                        onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                        placeholder="مطور ويب، مصمم، استشاري..."
                        className="arabic-body"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="arabic-body">نبذة تعريفية</Label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="اكتب نبذة مختصرة عن نفسك وخبراتك..."
                        className="arabic-body"
                      />
                    </div>
                    <div>
                      <Label className="arabic-body">الموقع</Label>
                      <Input
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        placeholder="طرابلس، ليبيا"
                        className="arabic-body"
                      />
                    </div>
                    <div>
                      <Label className="arabic-body">البريد الإلكتروني</Label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="arabic-body"
                      />
                    </div>
                    <div>
                      <Label className="arabic-body">رقم الهاتف</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+218 91 234 5678"
                        className="arabic-body"
                      />
                    </div>
                    <div>
                      <Label className="arabic-body">الموقع الإلكتروني</Label>
                      <Input
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                        className="arabic-body"
                      />
                    </div>
                    <div>
                      <Label className="arabic-body">الرابط المخصص</Label>
                      <Input
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="your-name"
                        className="arabic-body"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        سيكون رابطك: proforge.ly/{customUrl || 'your-name'}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="work" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold arabic-heading mb-4">المهارات</h3>
                  
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="أضف مهارة جديدة"
                      className="flex-1 arabic-body"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} variant="outline" className="arabic-body">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Badge key={index} className="flex items-center gap-1">
                        {skill}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(index)}
                          className="h-auto p-0 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold arabic-heading mb-4">الروابط الاجتماعية</h3>
                  
                  {profileData.socialLinks.map((link, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <Input
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        placeholder="المنصة (LinkedIn, Twitter...)"
                        className="flex-1 arabic-body"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        placeholder="الرابط"
                        className="flex-1 arabic-body"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSocialLink(index)}
                        className="text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button onClick={addSocialLink} variant="outline" className="w-full arabic-body">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة رابط اجتماعي
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6">
                <h3 className="text-lg font-semibold arabic-heading">معرض الأعمال</h3>
                
                {profileData.portfolio.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium arabic-heading">مشروع {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePortfolioItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="arabic-body">عنوان المشروع</Label>
                        <Input
                          value={item.title || ''}
                          onChange={(e) => updatePortfolioItem(index, { title: e.target.value })}
                          placeholder="عنوان المشروع"
                          className="arabic-body"
                        />
                      </div>
                      <div>
                        <Label className="arabic-body">رابط المشروع</Label>
                        <Input
                          value={item.link || ''}
                          onChange={(e) => updatePortfolioItem(index, { link: e.target.value })}
                          placeholder="https://example.com"
                          className="arabic-body"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="arabic-body">وصف المشروع</Label>
                        <Textarea
                          value={item.description || ''}
                          onChange={(e) => updatePortfolioItem(index, { description: e.target.value })}
                          placeholder="وصف مفصل للمشروع والتقنيات المستخدمة"
                          className="arabic-body"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Button
                  onClick={addPortfolioItem}
                  variant="outline"
                  className="w-full arabic-body"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مشروع جديد
                </Button>
              </TabsContent>

              <TabsContent value="galleries" className="space-y-6">
                <GalleryManager
                  galleries={profileData.galleries}
                  onChange={(galleries) => setProfileData({ ...profileData, galleries })}
                />
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <ProductManager
                  products={profileData.products}
                  onChange={(products) => setProfileData({ ...profileData, products })}
                />
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <h3 className="text-lg font-semibold arabic-heading">الخدمات المقدمة</h3>
                
                {profileData.services.map((service, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium arabic-heading">خدمة {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="arabic-body">عنوان الخدمة</Label>
                        <Input
                          value={service.title || ''}
                          onChange={(e) => updateService(index, { title: e.target.value })}
                          placeholder="مثال: تطوير تطبيقات الويب"
                          className="arabic-body"
                        />
                      </div>
                      <div>
                        <Label className="arabic-body">السعر</Label>
                        <Input
                          value={service.price || ''}
                          onChange={(e) => updateService(index, { price: e.target.value })}
                          placeholder="مثال: من 500 د.ل"
                          className="arabic-body"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="arabic-body">وصف الخدمة</Label>
                        <Textarea
                          value={service.description || ''}
                          onChange={(e) => updateService(index, { description: e.target.value })}
                          placeholder="وصف مفصل للخدمة والمزايا المقدمة"
                          className="arabic-body"
                        />
                      </div>
                      <div>
                        <Label className="arabic-body">مدة التسليم</Label>
                        <Input
                          value={service.duration || ''}
                          onChange={(e) => updateService(index, { duration: e.target.value })}
                          placeholder="مثال: 2-4 أسابيع"
                          className="arabic-body"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Button
                  onClick={addService}
                  variant="outline"
                  className="w-full arabic-body"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة خدمة جديدة
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Modals */}
      <SubscriptionLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType={limitModalType}
        currentLimit={limitModalType === 'profiles' ? canCreateProfile().maxAllowed : 0}
        requiredTier={limitModalType === 'templates' ? 'premium' : undefined}
      />
    </div>
  );
};

export default CreateProfile;