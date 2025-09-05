import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Building2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'profiles' | 'templates';
  currentLimit: number;
  requiredTier?: string;
}

const SubscriptionLimitModal = ({ 
  isOpen, 
  onClose, 
  limitType, 
  currentLimit, 
  requiredTier 
}: SubscriptionLimitModalProps) => {
  const navigate = useNavigate();

  const getLimitIcon = () => {
    switch (limitType) {
      case 'profiles':
        return <Crown className="w-12 h-12 text-primary" />;
      case 'templates':
        return <Sparkles className="w-12 h-12 text-premium" />;
      default:
        return <Zap className="w-12 h-12 text-business" />;
    }
  };

  const getLimitTitle = () => {
    switch (limitType) {
      case 'profiles':
        return 'وصلت للحد الأقصى من الملفات';
      case 'templates':
        return 'قالب غير متاح في باقتك';
      default:
        return 'ميزة غير متاحة';
    }
  };

  const getLimitDescription = () => {
    switch (limitType) {
      case 'profiles':
        return `يمكنك إنشاء ${currentLimit} ملف${currentLimit > 1 ? 'ات' : ''} فقط في باقتك الحالية. قم بترقية باقتك للحصول على المزيد من الملفات.`;
      case 'templates':
        return `هذا القالب متاح فقط للباقات ${requiredTier === 'premium' ? 'المميزة' : requiredTier === 'business' ? 'للأعمال' : 'الخارقة'} وما فوق. قم بترقية باقتك للوصول إليه.`;
      default:
        return 'هذه الميزة غير متاحة في باقتك الحالية.';
    }
  };

  const handleUpgrade = () => {
    onClose();
    navigate('/dashboard?tab=subscriptions');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-premium/10 rounded-full flex items-center justify-center">
              {getLimitIcon()}
            </div>
          </div>
          <DialogTitle className="text-xl arabic-heading">
            {getLimitTitle()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground arabic-body">
            {getLimitDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-r from-primary/5 to-premium/5 rounded-lg p-4 my-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-primary" />
            <span className="font-medium arabic-heading">ميزات الباقات المدفوعة:</span>
          </div>
          <div className="text-sm text-muted-foreground arabic-body space-y-1">
            <div>• ملفات شخصية غير محدودة</div>
            <div>• وصول لجميع القوالب</div>
            <div>• إحصائيات متقدمة</div>
            <div>• دعم أولوية</div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onClose} className="arabic-body">
            إلغاء
          </Button>
          <Button 
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary arabic-body"
          >
            <Crown className="w-4 h-4 ml-2" />
            ترقية الباقة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionLimitModal;