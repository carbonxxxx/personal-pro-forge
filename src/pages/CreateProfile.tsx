import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload, 
  Plus, 
  X,
  Link2,
  Star,
  User,
  MapPin,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useTemplates } from "@/hooks/useTemplates";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { toast } from "sonner";
import SubscriptionLimitModal from "@/components/SubscriptionLimitModal";

const CreateProfile = () => {
  const navigate = useNavigate();
  const { allTemplates, loading: templatesLoading } = useTemplates();
  const { createProfile, loading: creatingProfile, canCreateProfile } = useUserProfiles();
  const { canAccessTemplate } = useSubscriptions();
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    title: "",
    bio: "",
    location: "",
    email: "",
    phone: "",
    website: "",
    profileImage: "",
    customUrl: "",
    socialLinks: [
      { platform: "LinkedIn", url: "" },
      { platform: "Twitter", url: "" },
      { platform: "Instagram", url: "" }
    ],
    skills: [],
    portfolio: [],
    services: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<'profiles' | 'templates'>('profiles');

  const handleSave = async () => {
    if (!selectedTemplate) {
      toast.error("يرجى اختيار قالب");
      return;
    }

    if (!profileData.name || !profileData.title) {
      toast.error("يرجى ملء الحقول المطلوبة");
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
      await createProfile(selectedTemplate, profileData, profileData.customUrl);
      toast.success("تم إنشاء الملف بنجاح!");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ في إنشاء الملف");
    } finally {
      setSaving(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Badge className="bg-gray-500 text-white">مجاني</Badge>;
      case 'premium':
        return <Badge className="bg-gradient-to-r from-premium to-purple-600 text-white">مميز</Badge>;
      case 'business':
        return <Badge className="bg-gradient-to-r from-business to-blue-600 text-white">أعمال</Badge>;
      default:
        return null;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, url: value } : link
      )
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const steps = [
    { id: 1, name: "اختيار القالب", icon: Star },
    { id: 2, name: "المعلومات الأساسية", icon: User },
    { id: 3, name: "الروابط والمهارات", icon: Link2 },
    { id: 4, name: "المعاينة والنشر", icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300">
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              <span className="arabic-body">العودة للوحة التحكم</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-premium rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl font-bold arabic-heading bg-gradient-to-r from-primary to-premium bg-clip-text text-transparent">
                إنشاء ملف جديد
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-xl border-primary/20 hover:border-primary/40">
                <Eye className="w-4 h-4 ml-2" />
                معاينة
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving || !selectedTemplate}
                className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Save className="w-4 h-4 ml-2" />
                {saving ? "جاري الحفظ..." : "حفظ ونشر"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary to-premium text-white shadow-lg' 
                        : isCompleted
                        ? 'bg-success/20 text-success'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isActive || isCompleted ? 'bg-white/20' : 'bg-muted-foreground/20'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="arabic-body font-medium">{step.name}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        currentStep > step.id ? 'bg-success' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 arabic-heading">اختر القالب المناسب</h2>
                <p className="text-muted-foreground arabic-body">اختر التصميم الذي يناسب مجال عملك وشخصيتك المهنية</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {allTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedTemplate === template.id 
                        ? 'border-primary shadow-xl ring-2 ring-primary/20' 
                        : canAccessTemplate(template.tier)
                        ? 'border-gray-200 hover:border-primary/30 hover:shadow-lg'
                        : 'border-muted bg-muted/20 cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => {
                      if (!canAccessTemplate(template.tier)) {
                        setLimitModalType('templates');
                        setShowLimitModal(true);
                        return;
                      }
                      setSelectedTemplate(template.id);
                    }}
                  >
                    {/* Template Preview */}
                    <div className={`w-full h-32 bg-gradient-to-br ${template.gradient_colors || 'from-gray-400 to-gray-600'} rounded-xl mb-4 flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-3 bg-white/90 rounded-lg p-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-premium rounded-full mx-auto mb-2"></div>
                        <div className="h-1 bg-gray-200 rounded mb-1"></div>
                        <div className="h-1 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="h-0.5 bg-gray-200 rounded"></div>
                          <div className="h-0.5 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      
                      {selectedTemplate === template.id && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold arabic-heading ${!canAccessTemplate(template.tier) ? 'text-muted-foreground' : ''}`}>
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getTierBadge(template.tier)}
                        {!canAccessTemplate(template.tier) && (
                          <Crown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground arabic-body">
                      {template.description}
                      {!canAccessTemplate(template.tier) && (
                        <span className="block mt-1 text-xs text-primary">
                          يتطلب ترقية الباقة
                        </span>
                      )}
                    </p>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedTemplate}
                  className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  متابعة
                  <ArrowLeft className="w-5 h-5 mr-2 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 arabic-heading">المعلومات الأساسية</h2>
                <p className="text-muted-foreground arabic-body">أدخل معلوماتك الشخصية والمهنية</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="p-6 rounded-2xl border-gray-200">
                  <h3 className="text-xl font-bold mb-6 arabic-heading">المعلومات الشخصية</h3>
                  
                  <div className="space-y-6">
                    {/* Profile Image */}
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-primary to-premium rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                        {profileData.name.charAt(0) || "أ"}
                      </div>
                      <Button variant="outline" className="rounded-xl border-primary/20 hover:border-primary/40">
                        <Upload className="w-4 h-4 ml-2" />
                        رفع صورة
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="arabic-body font-medium">الاسم الكامل</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="أدخل اسمك الكامل"
                          className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title" className="arabic-body font-medium">المسمى الوظيفي</Label>
                        <Input
                          id="title"
                          value={profileData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="مطور ويب، مصمم، استشاري..."
                          className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio" className="arabic-body font-medium">نبذة تعريفية</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="اكتب نبذة مختصرة عن نفسك وخبراتك..."
                        className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 mt-2"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="customUrl" className="arabic-body font-medium">الرابط المخصص</Label>
                      <div className="flex items-center mt-2">
                        <span className="px-4 py-3 bg-muted rounded-r-xl border border-l-0 text-muted-foreground">
                          proforge.ly/
                        </span>
                        <Input
                          id="customUrl"
                          value={profileData.customUrl}
                          onChange={(e) => handleInputChange('customUrl', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="your-name"
                          className="rounded-l-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 arabic-body">
                        سيكون هذا الرابط الخاص بملفك الشخصي
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl border-gray-200">
                  <h3 className="text-xl font-bold mb-6 arabic-heading">معلومات التواصل</h3>
                  
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="arabic-body font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          البريد الإلكتروني
                        </Label>
                        <Input
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your@email.com"
                          className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
                        />
                      </div>
                      <div>
                        <Label className="arabic-body font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          رقم الهاتف
                        </Label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+218 91 234 5678"
                          className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="arabic-body font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          الموقع
                        </Label>
                        <Input
                          value={profileData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="طرابلس، ليبيا"
                          className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
                        />
                      </div>
                      <div>
                        <Label className="arabic-body font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" />
                          الموقع الإلكتروني
                        </Label>
                        <Input
                          value={profileData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-3 rounded-xl border-primary/20 hover:border-primary/40"
                >
                  السابق
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  متابعة
                  <ArrowLeft className="w-5 h-5 mr-2 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 arabic-heading">الروابط والمهارات</h2>
                <p className="text-muted-foreground arabic-body">أضف روابط التواصل الاجتماعي ومهاراتك</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="p-6 rounded-2xl border-gray-200">
                  <h3 className="text-xl font-bold mb-6 arabic-heading">روابط التواصل الاجتماعي</h3>
                  
                  <div className="space-y-4">
                    {profileData.socialLinks.map((link, index) => (
                      <div key={index}>
                        <Label className="arabic-body font-medium">{link.platform}</Label>
                        <Input
                          value={link.url}
                          onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                          placeholder={`رابط ${link.platform}`}
                          className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12 mt-2"
                        />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl border-gray-200">
                  <h3 className="text-xl font-bold mb-6 arabic-heading">المهارات والخبرات</h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="أضف مهارة جديدة"
                        className="rounded-xl border-gray-200 focus:border-primary/40 focus:ring-primary/20 h-12"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button 
                        onClick={addSkill}
                        className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl h-12 px-6"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {profileData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge 
                            key={index}
                            className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-full flex items-center gap-2"
                          >
                            <span className="arabic-body">{skill}</span>
                            <button 
                              onClick={() => removeSkill(index)}
                              className="hover:text-destructive transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-3 rounded-xl border-primary/20 hover:border-primary/40"
                >
                  السابق
                </Button>
                <Button 
                  onClick={() => setCurrentStep(4)}
                  className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  معاينة الملف
                  <Eye className="w-5 h-5 mr-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 arabic-heading">معاينة الملف الشخصي</h2>
                <p className="text-muted-foreground arabic-body">راجع ملفك قبل النشر</p>
              </div>

              {/* Preview Card */}
              <Card className="max-w-2xl mx-auto p-8 rounded-2xl border-gray-200 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary to-premium rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.name.charAt(0) || "أ"}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 arabic-heading">{profileData.name || "الاسم"}</h3>
                  <p className="text-lg text-muted-foreground mb-4 arabic-body">{profileData.title || "المسمى الوظيفي"}</p>
                  <p className="text-muted-foreground arabic-body max-w-md mx-auto">{profileData.bio || "النبذة التعريفية"}</p>
                </div>

                {profileData.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-3 arabic-heading">المهارات</h4>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <Badge key={index} className="bg-primary/10 text-primary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground arabic-body mb-4">
                    سيكون الرابط: proforge.ly/{profileData.customUrl || "your-name"}
                  </p>
                </div>
              </Card>

              <div className="flex justify-center gap-4 mt-8">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-3 rounded-xl border-primary/20 hover:border-primary/40"
                >
                  السابق
                </Button>
                <Button 
                  className="bg-gradient-to-r from-success to-green-600 hover:from-green-600 hover:to-success px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Save className="w-5 h-5 ml-2" />
                  نشر الملف الشخصي
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SubscriptionLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType={limitModalType}
        currentLimit={limitModalType === 'profiles' ? canCreateProfile().maxAllowed : 0}
        requiredTier={limitModalType === 'templates' ? 
          allTemplates.find(t => t.id === selectedTemplate)?.tier : undefined
        }
      />
    </div>
  );
};

export default CreateProfile;