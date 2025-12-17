import { supabase } from '../config/supabase';

export const validateSchoolCode = async (code: string) => {
  try {
    const { data, error } = await supabase.rpc('validate_school_code', {
      code: code
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error validating school code:', error);
    throw error;
  }
};






