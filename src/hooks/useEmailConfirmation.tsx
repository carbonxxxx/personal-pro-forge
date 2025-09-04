import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useEmailConfirmation = () => {
  const { user } = useAuth();
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEmailConfirmationStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // التحقق من حالة تأكيد البريد الإلكتروني في profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('email_confirmed, welcome_bonus_claimed')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('خطأ في جلب بيانات المستخدم:', error);
          setLoading(false);
          return;
        }

        // إظهار المودال فقط إذا لم يتم تأكيد البريد من قبل
        const needsConfirmation = !profile?.email_confirmed && !user.email_confirmed_at;
        setShouldShowModal(needsConfirmation);
        
      } catch (error) {
        console.error('خطأ في التحقق من حالة البريد الإلكتروني:', error);
      } finally {
        setLoading(false);
      }
    };

    checkEmailConfirmationStatus();
  }, [user]);

  const hideModal = () => {
    setShouldShowModal(false);
  };

  const onConfirmationComplete = async () => {
    setShouldShowModal(false);
    
    // إعادة تحديث البيانات
    if (user) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('email_confirmed, welcome_bonus_claimed')
        .eq('user_id', user.id)
        .single();
      
      console.log('تم تحديث بيانات المستخدم:', updatedProfile);
    }
  };

  return {
    shouldShowModal,
    loading,
    hideModal,
    onConfirmationComplete
  };
};