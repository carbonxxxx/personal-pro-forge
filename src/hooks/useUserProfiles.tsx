import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptions } from '@/hooks/useSubscriptions';

interface UserProfile {
  id: string;
  user_id: string;
  template_id: string;
  profile_data: any;
  custom_url: string | null;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  template?: {
    name: string;
    tier: string;
    gradient_colors: string;
  };
}

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  profileImage: string;
  socialLinks: Array<{ platform: string; url: string }>;
  skills: string[];
  portfolio: any[];
  services: any[];
  galleries?: Array<{
    id: string;
    title: string;
    description?: string;
    images: Array<{
      url: string;
      title?: string;
      description?: string;
    }>;
  }>;
  products?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    category?: string;
  }>;
}

export const useUserProfiles = () => {
  const { user } = useAuth();
  const { currentPlan } = useSubscriptions();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          template:templates(name, tier, gradient_colors)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateProfile = () => {
    if (!currentPlan) {
      return {
        canCreate: false,
        currentCount: profiles?.length || 0,
        maxAllowed: 1,
        isAtLimit: true
      };
    }
    
    const profileCount = profiles?.length || 0;
    const maxProfiles = currentPlan.max_profiles;
    const canCreate = profileCount < maxProfiles;
    
    return {
      canCreate,
      currentCount: profileCount,
      maxAllowed: maxProfiles,
      isAtLimit: profileCount >= maxProfiles
    };
  };

  const canAccessTemplate = (templateTier: string) => {
    if (!currentPlan) return templateTier === 'free';

    const tierHierarchy = { free: 0, premium: 1, business: 2, super: 3 };
    const currentTierLevel = tierHierarchy[currentPlan.tier as keyof typeof tierHierarchy] || 0;
    const templateTierLevel = tierHierarchy[templateTier as keyof typeof tierHierarchy] || 0;

    return currentTierLevel >= templateTierLevel;
  };

  const createProfile = async (templateId: string, profileData: ProfileData, customUrl?: string) => {
    if (!user) throw new Error('User not authenticated');

    // التحقق من قدرة المستخدم على إنشاء ملف جديد
    const profileCheck = canCreateProfile();
    if (!profileCheck.canCreate) {
      throw new Error(`تجاوزت العدد المسموح من الملفات الشخصية (${profileCheck.maxAllowed}). يرجى ترقية اشتراكك.`);
    }

    // Check if custom URL is available
    if (customUrl) {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('custom_url', customUrl)
        .single();

      if (existingProfile) {
        throw new Error('هذا الرابط مستخدم بالفعل، يرجى اختيار رابط آخر');
      }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        template_id: templateId,
        profile_data: profileData as any,
        custom_url: customUrl,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchProfiles();
    return data;
  };

  const updateProfile = async (profileId: string, profileData: Partial<ProfileData>, customUrl?: string) => {
    if (!user) throw new Error('User not authenticated');

    // Check if custom URL is available (if changed)
    if (customUrl) {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('custom_url', customUrl)
        .neq('id', profileId)
        .single();

      if (existingProfile) {
        throw new Error('هذا الرابط مستخدم بالفعل، يرجى اختيار رابط آخر');
      }
    }

    const updateData: any = {
      profile_data: profileData as any,
      updated_at: new Date().toISOString()
    };

    if (customUrl !== undefined) {
      updateData.custom_url = customUrl;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', profileId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    await fetchProfiles();
    return data;
  };

  const deleteProfile = async (profileId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', user.id);

    if (error) throw error;
    
    await fetchProfiles();
  };

  const toggleProfileStatus = async (profileId: string, isActive: boolean) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    await fetchProfiles();
    return data;
  };

  const getProfileByUrl = async (customUrl: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          template:templates(name, tier, gradient_colors, template_data),
          user_products(*)
        `)
        .eq('custom_url', customUrl)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // Increment view count
      await supabase
        .from('user_profiles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      return data;
    } catch (error) {
      console.error('Error fetching profile by URL:', error);
      throw error;
    }
  };

  const checkUrlAvailability = async (customUrl: string, excludeProfileId?: string) => {
    try {
      let query = supabase
        .from('user_profiles')
        .select('id')
        .eq('custom_url', customUrl);

      if (excludeProfileId) {
        query = query.neq('id', excludeProfileId);
      }

      const { data, error } = await query.single();

      if (error && error.code === 'PGRST116') {
        return true; // URL is available
      }

      return false; // URL is taken
    } catch (error) {
      console.error('Error checking URL availability:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  return {
    profiles,
    loading,
    createProfile,
    updateProfile,
    deleteProfile,
    toggleProfileStatus,
    getProfileByUrl,
    checkUrlAvailability,
    canCreateProfile,
    canAccessTemplate,
    refetch: fetchProfiles
  };
};