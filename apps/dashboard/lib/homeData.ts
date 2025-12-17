import { supabase } from './supabase';

export async function getPlatformStats() {
  const { data, error } = await supabase
    .from('platform_stats')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error || !data) {
    return {
      schools_count: 120,
      homework_completion_rate: 94,
      parent_engagement_rate: 88,
      attendance_rate: 98.5
    };
  }
  
  return data;
}

