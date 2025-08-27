import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Template {
  id: string;
  name: string;
  name_en: string;
  description: string;
  category: string;
  tier: string;
  preview_image_url: string | null;
  template_data: any;
  gradient_colors: string;
  rating: number;
  downloads_count: number;
  is_active: boolean;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementDownloads = async (templateId: string) => {
    try {
      // First get current count
      const { data: currentTemplate } = await supabase
        .from('templates')
        .select('downloads_count')
        .eq('id', templateId)
        .single();

      const currentCount = currentTemplate?.downloads_count || 0;

      const { error } = await supabase
        .from('templates')
        .update({ 
          downloads_count: currentCount + 1
        })
        .eq('id', templateId);

      if (error) console.error('Error incrementing downloads:', error);
    } catch (error) {
      console.error('Error incrementing downloads:', error);
    }
  };

  const getFilteredTemplates = () => {
    if (selectedCategory === 'الكل') return templates;
    
    const tierMap: Record<string, string> = {
      'مجاني': 'free',
      'مميز': 'premium',
      'أعمال': 'business',
      'خارق': 'super'
    };
    
    const tierFilter = tierMap[selectedCategory];
    if (tierFilter) {
      return templates.filter(template => template.tier === tierFilter);
    }
    
    return templates.filter(template => template.category === selectedCategory);
  };

  const getCategories = () => {
    const categories = ['الكل', 'مجاني', 'مميز', 'أعمال', 'خارق'];
    const customCategories = [...new Set(templates.map(t => t.category))];
    return [...categories, ...customCategories];
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      'free': { text: 'مجاني', className: 'bg-gray-500 text-white' },
      'premium': { text: 'مميز', className: 'bg-gradient-to-r from-premium to-purple-600 text-white' },
      'business': { text: 'أعمال', className: 'bg-gradient-to-r from-business to-blue-600 text-white' },
      'super': { text: 'خارق 💥', className: 'bg-gradient-to-r from-super to-pink-600 text-white animate-pulse' }
    };
    
    return badges[tier as keyof typeof badges] || { text: tier, className: 'bg-gray-500 text-white' };
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates: getFilteredTemplates(),
    allTemplates: templates,
    loading,
    selectedCategory,
    setSelectedCategory,
    categories: getCategories(),
    getTierBadge,
    incrementDownloads,
    refetch: fetchTemplates
  };
};