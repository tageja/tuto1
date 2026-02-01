/**
 * Parent PIN Code Service
 * 
 * Handles validation of 6-digit PIN codes for parents to join schools
 * and caching of access permissions to prevent repeated prompts
 */

import { supabase } from '../../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ParentPinValidationResult {
  success: boolean;
  schoolId?: string;
  schoolName?: string;
  studentsLinked?: number;
  alreadyLinked?: boolean;
  error?: string;
}

const CACHE_PREFIX = 'parent_access_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Validate a parent PIN code
 * 
 * @param pin - 6-digit numeric PIN
 * @param userEmail - Parent's email address
 * @returns Validation result with school info if successful
 */
export async function validateParentPin(
  pin: string,
  userEmail: string
): Promise<ParentPinValidationResult> {
  try {
    console.log('🔑 Validating parent PIN:', { pin: pin.substring(0, 2) + '****', userEmail });

    // Client-side validation: PIN must be exactly 6 digits
    const pinRegex = /^[0-9]{6}$/;
    if (!pinRegex.test(pin.trim())) {
      return {
        success: false,
        error: 'PIN must be exactly 6 digits',
      };
    }

    // Call Supabase RPC function
    const { data, error } = await supabase.rpc('validate_parent_pin', {
      pin: pin.trim(),
      user_email: userEmail.toLowerCase().trim(),
    });

    if (error) {
      console.error('❌ Error validating PIN:', error);
      return {
        success: false,
        error: error.message || 'Failed to validate PIN',
      };
    }

    // Parse the JSON result from RPC
    if (!data || !data.success) {
      return {
        success: false,
        error: data?.error || 'Invalid PIN or school is not active',
      };
    }

    console.log('✅ PIN validated successfully:', {
      schoolId: data.school_id,
      schoolName: data.school_name,
      studentsLinked: data.students_linked,
    });

    // Cache the access
    if (data.school_id) {
      await cacheParentAccess(userEmail, data.school_id);
    }

    return {
      success: true,
      schoolId: data.school_id,
      schoolName: data.school_name,
      studentsLinked: data.students_linked || 0,
      alreadyLinked: data.already_linked || false,
    };
  } catch (error: any) {
    console.error('❌ Exception validating PIN:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while validating PIN',
    };
  }
}

/**
 * Check if a parent has access to a specific school
 * 
 * @param userEmail - Parent's email address
 * @param schoolId - School ID to check
 * @returns True if parent has access, false otherwise
 */
export async function checkParentSchoolAccess(
  userEmail: string,
  schoolId: string
): Promise<boolean> {
  try {
    // Check cache first
    const cached = await getCachedParentAccess(userEmail, schoolId);
    if (cached) {
      console.log('✅ Parent access found in cache');
      return true;
    }

    // Check via RPC
    const { data, error } = await supabase.rpc('get_user_school_associations', {
      user_email: userEmail.toLowerCase().trim(),
    });

    if (error) {
      console.error('❌ Error checking parent access:', error);
      return false;
    }

    const schoolList = data || [];
    const hasAccess = schoolList.some(
      (s: any) => s.school_id === schoolId || s.school_id === decodeURIComponent(schoolId)
    );

    if (hasAccess) {
      // Cache the access
      await cacheParentAccess(userEmail, schoolId);
    }

    return hasAccess;
  } catch (error) {
    console.error('❌ Exception checking parent access:', error);
    return false;
  }
}

/**
 * Check if a parent has access to any school
 * 
 * @param userEmail - Parent's email address
 * @returns True if parent has access to any school
 */
export async function checkParentHasAnyAccess(userEmail: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('get_user_school_associations', {
      user_email: userEmail.toLowerCase().trim(),
    });

    if (error) {
      console.error('❌ Error checking parent access:', error);
      return false;
    }

    const schoolList = data || [];
    return schoolList.length > 0;
  } catch (error) {
    console.error('❌ Exception checking parent access:', error);
    return false;
  }
}

/**
 * Cache parent access to a school
 * 
 * @param userEmail - Parent's email address
 * @param schoolId - School ID
 */
export async function cacheParentAccess(userEmail: string, schoolId: string): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${userEmail}:${schoolId}`;
    const cacheData = {
      hasAccess: true,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('💾 Cached parent access:', cacheKey);
  } catch (error) {
    console.error('❌ Error caching parent access:', error);
  }
}

/**
 * Get cached parent access
 * 
 * @param userEmail - Parent's email address
 * @param schoolId - School ID
 * @returns True if cached access exists and is valid, false otherwise
 */
export async function getCachedParentAccess(
  userEmail: string,
  schoolId: string
): Promise<boolean> {
  try {
    const cacheKey = `${CACHE_PREFIX}${userEmail}:${schoolId}`;
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) {
      return false;
    }

    const cacheData = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;

    // Check if cache is expired
    if (age > CACHE_EXPIRY_MS) {
      await AsyncStorage.removeItem(cacheKey);
      return false;
    }

    return cacheData.hasAccess === true;
  } catch (error) {
    console.error('❌ Error reading cached access:', error);
    return false;
  }
}

/**
 * Clear parent access cache
 * 
 * @param userEmail - Optional: specific user email, or clear all if not provided
 */
export async function clearParentAccessCache(userEmail?: string): Promise<void> {
  try {
    if (userEmail) {
      // Clear cache for specific user
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter((key) =>
        key.startsWith(`${CACHE_PREFIX}${userEmail}:`)
      );
      await AsyncStorage.multiRemove(userKeys);
      console.log('🗑️ Cleared access cache for user:', userEmail);
    } else {
      // Clear all parent access cache
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('🗑️ Cleared all parent access cache');
    }
  } catch (error) {
    console.error('❌ Error clearing access cache:', error);
  }
}
