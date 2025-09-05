import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Plus, 
  Eye, 
  Edit, 
  Share2, 
  TrendingUp, 
  Users, 
  DollarSign,
  FileText,
  Settings,
  BarChart3,
  ExternalLink,
  Copy,
  Star,
  LogOut,
  Wallet,
  Download,
  Upload
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { usePayments } from "@/hooks/usePayments";
import { useEmailConfirmation } from "@/hooks/useEmailConfirmation";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import SubscriptionManagement from "@/components/SubscriptionManagement";
import EmailConfirmationModal from "@/components/EmailConfirmationModal";
import SubscriptionLimitModal from "@/components/SubscriptionLimitModal";
import { PaymentForm, TransactionsList } from "@/components/PaymentForms";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<'profiles' | 'templates'>('profiles');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, transactions, referralEarnings, stats, loading } = useProfile();
  const { profiles, loading: profilesLoading, canCreateProfile } = useUserProfiles();
  const { currentPlan } = useSubscriptions();
  const { transactions: paymentTransactions } = usePayments();
  const { shouldShowModal, hideModal, onConfirmationComplete } = useEmailConfirmation();

  // Check if user needs to complete subscription step
  useEffect(() => {
    if (user && profile && !(profile as any).subscription_step_completed) {
      navigate('/subscription-selection');
      return;
    }
  }, [user, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground arabic-body">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 arabic-heading">يرجى تسجيل الدخول</h1>
          <Link to="/login">
            <Button>تسجيل الدخول</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(`https://proforge.ly/${url}`);
    toast.success("تم نسخ الرابط بنجاح!");
  };

  const handleCopyReferralCode = () => {
    if (profile?.referral_code) {
      const referralUrl = `${window.location.origin}?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(referralUrl);
      toast.success("تم نسخ رابط الإحالة بنجاح!");
    }
  };

  const referrals = [
    { name: "سارة أحمد", joinDate: "2024-03-10", plan: "premium", earnings: 11.00 },
    { name: "محمد علي", joinDate: "2024-03-08", plan: "business", earnings: 24.00 },
    { name: "فاطمة حسن", joinDate: "2024-03-05", plan: "premium", earnings: 11.00 }
  ];

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Badge className="bg-gradient-to-r from-premium to-purple-600 text-white">مميز</Badge>;
      case 'business':
        return <Badge className="bg-gradient-to-r from-business to-blue-600 text-white">أعمال</Badge>;
      case 'super':
        return <Badge className="bg-gradient-to-r from-super to-pink-600 text-white">خارق 💥</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">مجاني</Badge>;
    }
  };

  const tabs = [
    { id: "overview", name: "نظرة عامة", icon: BarChart3 },
    { id: "profiles", name: "ملفاتي", icon: FileText },
    { id: "earnings", name: "الأرباح", icon: DollarSign },
    { id: "wallet", name: "المحفظة", icon: Wallet },
    { id: "referrals", name: "الإحالات", icon: Users },
    { id: "subscriptions", name: "الاشتراكات", icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-premium rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl font-bold arabic-heading bg-gradient-to-r from-primary to-premium bg-clip-text text-transparent">
                برو فورج
              </div>
            </Link>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="font-medium arabic-heading">{profile?.display_name || user.email?.split('@')[0]}</div>
                <div className="text-sm text-muted-foreground arabic-body flex items-center gap-2">
                  {getPlanBadge("free")}
                  <span className="text-success">{profile?.wallet_balance?.toFixed(2) || "0.00"} د.ل</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-premium rounded-full flex items-center justify-center text-white font-bold">
                {(profile?.display_name || user.email || "").charAt(0).toUpperCase()}
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 rounded-2xl border-gray-200 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      className={`w-full justify-start h-12 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-primary to-premium text-white shadow-lg"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <IconComponent className="w-5 h-5 ml-3 rtl:mr-3 rtl:ml-0" />
                      <span className="arabic-body">{tab.name}</span>
                    </Button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {activeTab === "overview" && (
              <>
                {/* Welcome */}
                <div className="bg-gradient-to-r from-primary/10 to-premium/10 rounded-2xl p-8 border border-primary/20">
                  <h1 className="text-3xl font-bold mb-4 arabic-heading">مرحباً، {profile?.display_name || user.email?.split('@')[0]}!</h1>
                  <p className="text-muted-foreground arabic-body mb-6">
                    إليك نظرة عامة على أداء ملفاتك الشخصية وأرباحك
                  </p>
              <div className="flex gap-2">
                <Button 
                  className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  disabled={!canCreateProfile().canCreate}
                  onClick={() => {
                    const profileCheck = canCreateProfile();
                    if (!profileCheck.canCreate) {
                      setLimitModalType('profiles');
                      setShowLimitModal(true);
                    } else {
                      navigate('/create-profile');
                    }
                  }}
                >
                  <Plus className="w-5 h-5 ml-2" />
                  إنشاء ملف جديد
                </Button>
                    {profile && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl border">
                        <span className="text-sm text-muted-foreground arabic-body">كود الإحالة:</span>
                        <code className="font-mono text-sm bg-primary/10 px-2 py-1 rounded">{profile.referral_code}</code>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleCopyReferralCode}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6 rounded-2xl border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-premium rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold arabic-heading">{profiles.length}</div>
                    <div className="text-sm text-muted-foreground arabic-body">إجمالي الملفات</div>
                  </div>
                    </div>
                  </Card>

                  <Card className="p-6 rounded-2xl border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-business to-blue-600 rounded-xl flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold arabic-heading">{profiles.reduce((sum, p) => sum + (p.view_count || 0), 0).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground arabic-body">إجمالي المشاهدات</div>
                      </div>
                    </div>
                    <div className="text-sm text-success arabic-body">
                      +{stats.thisMonth.views} هذا الشهر
                    </div>
                  </Card>

                  <Card className="p-6 rounded-2xl border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-success to-green-600 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold arabic-heading">{stats.totalEarnings} د.ل</div>
                        <div className="text-sm text-muted-foreground arabic-body">إجمالي الأرباح</div>
                      </div>
                    </div>
                    <div className="text-sm text-success arabic-body">
                      +{stats.thisMonth.earnings} د.ل هذا الشهر
                    </div>
                  </Card>

                  <Card className="p-6 rounded-2xl border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-super to-pink-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold arabic-heading">{stats.totalReferrals}</div>
                        <div className="text-sm text-muted-foreground arabic-body">إجمالي الإحالات</div>
                      </div>
                    </div>
                    <div className="text-sm text-success arabic-body">
                      +{stats.thisMonth.referrals} هذا الشهر
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="p-6 rounded-2xl border-gray-200">
                  <h3 className="text-xl font-bold mb-6 arabic-heading">النشاط الأخير</h3>
                  <div className="space-y-4">
                    {[
                      { action: "تم إنشاء ملف جديد", item: "أحمد - مصمم جرافيك", time: "منذ ساعتين", type: "create" },
                      { action: "مشاهدة جديدة", item: "أحمد محمد - مطور", time: "منذ 4 ساعات", type: "view" },
                      { action: "إحالة جديدة", item: "سارة أحمد", time: "منذ يوم", type: "referral" },
                      { action: "تحديث الملف", item: "أحمد - استشاري أعمال", time: "منذ يومين", type: "update" }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-300">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'create' ? 'bg-primary/20 text-primary' :
                          activity.type === 'view' ? 'bg-business/20 text-business' :
                          activity.type === 'referral' ? 'bg-success/20 text-success' :
                          'bg-premium/20 text-premium'
                        }`}>
                          {activity.type === 'create' ? <Plus className="w-5 h-5" /> :
                           activity.type === 'view' ? <Eye className="w-5 h-5" /> :
                           activity.type === 'referral' ? <Users className="w-5 h-5" /> :
                           <Edit className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium arabic-body">{activity.action}</div>
                          <div className="text-sm text-muted-foreground arabic-body">{activity.item}</div>
                        </div>
                        <div className="text-sm text-muted-foreground arabic-body">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {activeTab === "profiles" && (
              <>
                {/* Profile limit warning */}
                {canCreateProfile().isAtLimit && (
                  <div className="bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-warning" />
                      <div>
                        <h4 className="font-medium arabic-heading">وصلت للحد الأقصى من الملفات</h4>
                        <p className="text-sm text-muted-foreground arabic-body">
                          لديك {canCreateProfile().currentCount} من {canCreateProfile().maxAllowed} ملف. قم بترقية باقتك لإنشاء المزيد.
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setActiveTab('subscriptions')}
                        className="bg-warning text-white hover:bg-warning/90"
                      >
                        ترقية الباقة
                      </Button>
                    </div>
                  </div>
                )}

                {/* Profiles Grid */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold arabic-heading">ملفاتي الشخصية</h2>
                    <p className="text-muted-foreground arabic-body">إدارة وتحرير ملفاتك الاحترافية</p>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    disabled={!canCreateProfile().canCreate}
                    onClick={() => {
                      const profileCheck = canCreateProfile();
                      if (!profileCheck.canCreate) {
                        setLimitModalType('profiles');
                        setShowLimitModal(true);
                      } else {
                        navigate('/create-profile');
                      }
                    }}
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    إنشاء ملف جديد
                  </Button>
                </div>

                {/* Profiles Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map((userProfile) => (
                    <Card key={userProfile.id} className="p-6 rounded-2xl border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          className={`${
                            userProfile.is_active 
                              ? 'bg-success text-white' 
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {userProfile.is_active ? 'نشط' : 'مسودة'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{userProfile.view_count || 0}</span>
                        </div>
                      </div>

                      <h3 className="font-bold mb-2 arabic-heading">{userProfile.profile_data?.name || 'ملف بدون عنوان'}</h3>
                      <p className="text-sm text-muted-foreground mb-4 arabic-body">القالب: {userProfile.template?.name || 'غير محدد'}</p>
                      
                      <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-xl">
                        <span className="text-sm text-muted-foreground arabic-body">الرابط:</span>
                        <code className="text-sm font-mono bg-white px-2 py-1 rounded">
                          proforge.ly/{userProfile.custom_url || userProfile.id.slice(0, 8)}
                        </code>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyUrl(userProfile.custom_url || userProfile.id.slice(0, 8))}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground mb-4 arabic-body">
                        آخر تحديث: {new Date(userProfile.updated_at).toLocaleDateString('ar')}
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/${userProfile.custom_url || userProfile.id}`} target="_blank" className="flex-1">
                          <Button size="sm" variant="outline" className="w-full rounded-lg hover:bg-primary/5 hover:border-primary/40">
                            <Eye className="w-4 h-4 ml-1" />
                            معاينة
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="flex-1 rounded-lg hover:bg-primary/5 hover:border-primary/40">
                          <Edit className="w-4 h-4 ml-1" />
                          تحرير
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg hover:bg-primary/5 hover:border-primary/40">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {/* Add New Profile Card */}
                  <Card className="p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary/40 transition-colors duration-300 flex items-center justify-center min-h-[280px] group cursor-pointer">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-premium rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold mb-2 arabic-heading">إنشاء ملف جديد</h3>
                      <p className="text-sm text-muted-foreground arabic-body">
                        اختر قالب وابدأ في إنشاء ملفك الاحترافي
                      </p>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {activeTab === "earnings" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold arabic-heading">الأرباح والعمولات</h2>
                    <p className="text-muted-foreground arabic-body">تتبع أرباحك من الإحالات والاشتراكات</p>
                  </div>
                </div>

                {/* Earnings Summary */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 rounded-2xl border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2 arabic-heading text-success">{stats.totalEarnings} د.ل</div>
                      <div className="text-sm text-muted-foreground arabic-body">إجمالي الأرباح</div>
                    </div>
                  </Card>
                  <Card className="p-6 rounded-2xl border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2 arabic-heading text-primary">{stats.thisMonth.earnings} د.ل</div>
                      <div className="text-sm text-muted-foreground arabic-body">أرباح هذا الشهر</div>
                    </div>
                  </Card>
                  <Card className="p-6 rounded-2xl border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2 arabic-heading text-premium">85.30 د.ل</div>
                      <div className="text-sm text-muted-foreground arabic-body">متاح للسحب</div>
                    </div>
                  </Card>
                </div>

                {/* Withdrawal Button */}
                <Card className="p-6 rounded-2xl border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-2 arabic-heading">سحب الأرباح</h3>
                      <p className="text-muted-foreground arabic-body">الحد الأدنى للسحب: 50 د.ل</p>
                    </div>
                    <Button className="bg-gradient-to-r from-success to-green-600 hover:from-green-600 hover:to-success rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <DollarSign className="w-5 h-5 ml-2" />
                      طلب سحب
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {activeTab === "wallet" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold arabic-heading">المحفظة والمعاملات</h2>
                    <p className="text-muted-foreground arabic-body">إدارة إيداع وسحب الأموال</p>
                  </div>
                </div>

                {/* Wallet Balance */}
                <Card className="p-6 rounded-2xl border-gray-200 bg-gradient-to-r from-success/5 to-green-600/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-2 arabic-heading">رصيد المحفظة</h3>
                      <div className="text-3xl font-bold text-success arabic-heading">
                        {profile?.wallet_balance?.toFixed(2) || "0.00"} د.ل
                      </div>
                      <p className="text-sm text-muted-foreground arabic-body mt-1">
                        متاح للسحب
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-r from-success to-green-600 rounded-2xl flex items-center justify-center">
                      <Wallet className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Card>

                {/* Payment Forms */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <PaymentForm type="deposit" />
                  <PaymentForm type="withdrawal" />
                </div>

                {/* Transactions List */}
                <TransactionsList />
              </>
            )}

            {activeTab === "referrals" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold arabic-heading">نظام الإحالات</h2>
                    <p className="text-muted-foreground arabic-body">شارك رابطك واربح من كل إحالة</p>
                  </div>
                </div>

                {/* Referral Link */}
                <Card className="p-6 rounded-2xl border-primary/20 bg-gradient-to-r from-primary/5 to-premium/5">
                  <h3 className="text-lg font-bold mb-4 arabic-heading">رابط الإحالة الخاص بك</h3>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border">
                    <code className="flex-1 font-mono text-sm">
                      https://proforge.ly/ref/ahmed123
                    </code>
                    <Button size="sm" className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary">
                      <Copy className="w-4 h-4 ml-2" />
                      نسخ
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 arabic-body">
                    اربح 20-25% من كل اشتراك + 10% من إحالات المحالين
                  </p>
                </Card>

                {/* Referrals List */}
                <Card className="p-6 rounded-2xl border-gray-200">
                  <h3 className="text-lg font-bold mb-6 arabic-heading">الإحالات الأخيرة</h3>
                  <div className="space-y-4">
                    {referrals.map((referral, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-premium rounded-full flex items-center justify-center text-white font-bold">
                            {referral.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium arabic-body">{referral.name}</div>
                            <div className="text-sm text-muted-foreground arabic-body">{referral.joinDate}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getPlanBadge(referral.plan)}
                          <div className="text-sm font-medium text-success mt-1">+{referral.earnings} د.ل</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {activeTab === "subscriptions" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold arabic-heading">إدارة الاشتراكات</h2>
                    <p className="text-muted-foreground arabic-body">اختر خطة تناسب احتياجاتك</p>
                  </div>
                </div>

                <SubscriptionManagement />
              </>
            )}

            {activeTab === "settings" && (
              <>
                <div>
                  <h2 className="text-2xl font-bold arabic-heading">إعدادات الحساب</h2>
                  <p className="text-muted-foreground arabic-body">إدارة معلوماتك الشخصية والاشتراك</p>
                </div>

                {/* Account Settings */}
                <Card className="p-6 rounded-2xl border-gray-200">
                  <h3 className="text-lg font-bold mb-6 arabic-heading">المعلومات الشخصية</h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium mb-2 arabic-body">الاسم الكامل</label>
                         <input 
                           type="text" 
                           value={profile?.display_name || ""}
                           className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary/40 focus:ring-primary/20"
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium mb-2 arabic-body">البريد الإلكتروني</label>
                         <input 
                           type="email" 
                           value={user.email || ""}
                           className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary/40 focus:ring-primary/20"
                         />
                       </div>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary rounded-xl">
                      حفظ التغييرات
                    </Button>
                  </div>
                </Card>

                {/* Subscription Management */}
                <Card className="p-6 rounded-2xl border-gray-200">
                  <h3 className="text-lg font-bold mb-6 arabic-heading">إدارة الاشتراك</h3>
                  <div className="flex items-center justify-between p-4 bg-premium/10 rounded-xl border border-premium/20">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold arabic-heading">الخطة الحالية:</span>
                        {getPlanBadge("free")}
                      </div>
                      <p className="text-sm text-muted-foreground arabic-body">
                        تجديد تلقائي في 15 أبريل 2024
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="rounded-xl border-primary/20 hover:border-primary/40">
                        تغيير الخطة
                      </Button>
                      <Button variant="outline" className="rounded-xl border-destructive/20 hover:border-destructive/40 text-destructive">
                        إلغاء الاشتراك
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      <SubscriptionLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType={limitModalType}
        currentLimit={canCreateProfile().maxAllowed}
      />

      {/* Email Confirmation Modal */}
      {shouldShowModal && user?.email && (
        <EmailConfirmationModal
          isOpen={shouldShowModal}
          onClose={hideModal}
          userEmail={user.email}
          onConfirmationComplete={onConfirmationComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;