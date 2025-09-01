import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gift, Mail, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onConfirmationComplete: () => void;
}

const EmailConfirmationModal = ({ isOpen, onClose, userEmail, onConfirmationComplete }: EmailConfirmationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "تم إرسال البريد!",
        description: "تحقق من بريدك الإلكتروني لتأكيد الحساب",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في إرسال البريد",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBonus = async () => {
    try {
      // الحصول على المستخدم الحالي
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('المستخدم غير موجود');

      // إضافة المكافأة مباشرة للمحفظة
      const { error } = await supabase.rpc('add_manual_balance', {
        target_user_id: user.id,
        amount: 5,
        admin_notes: 'مكافأة ترحيب - تأكيد البريد الإلكتروني'
      });

      if (error) throw error;

      // تحديث حالة تأكيد البريد الإلكتروني
      await supabase
        .from('profiles')
        .update({ 
          email_confirmed: true,
          welcome_bonus_claimed: true
        })
        .eq('user_id', user.id);

      toast({
        title: "تهانينا! 🎉",
        description: "تم إضافة 5 دينار ليبي لمحفظتك كمكافأة ترحيب",
      });

      onConfirmationComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "خطأ في إضافة المكافأة",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="arabic-heading">تأكيد البريد الإلكتروني</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {!emailSent ? (
            <>
              <Card className="p-6 bg-gradient-to-br from-success/10 to-primary/10 border-success/20">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-success to-primary rounded-full flex items-center justify-center">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold arabic-heading mb-2">
                    مكافأة ترحيب خاصة!
                  </h3>
                  <p className="text-success font-bold text-lg arabic-heading mb-2">
                    احصل على 5 دينار ليبي مجاناً
                  </p>
                  <p className="text-muted-foreground arabic-body text-sm">
                    فقط قم بتأكيد بريدك الإلكتروني للحصول على المكافأة
                  </p>
                </div>
              </Card>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                  <span className="arabic-body">{userEmail}</span>
                </div>
                
                <p className="text-sm text-muted-foreground arabic-body">
                  أرسلنا لك رسالة تأكيد على بريدك الإلكتروني. انقر على الرابط في الرسالة لتأكيد حسابك والحصول على المكافأة.
                </p>

                <Button
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-premium hover:from-premium hover:to-primary text-white rounded-xl"
                >
                  {loading ? "جاري الإرسال..." : "إعادة إرسال البريد"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-success to-primary rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold arabic-heading">تم إرسال البريد!</h3>
              <p className="text-muted-foreground arabic-body">
                تحقق من بريدك الإلكتروني واتبع الرابط لتأكيد حسابك
              </p>

              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground arabic-body">
                  بعد تأكيد البريد، ستحصل تلقائياً على 5 دينار ليبي في محفظتك
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
            >
              إغلاق
            </Button>
            {emailSent && (
              <Button
                onClick={handleClaimBonus}
                className="flex-1 bg-gradient-to-r from-success to-primary hover:from-primary hover:to-success text-white rounded-xl"
              >
                تأكيد الحصول على المكافأة
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailConfirmationModal;