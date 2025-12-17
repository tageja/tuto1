/**
 * Resolve school identifiers (Airtable ID, name, or UUID) to Supabase UUID.
 * Caches results in-memory to avoid redundant lookups.
 */

import { supabase } from '../config/supabase';

// Known Airtable → Supabase mappings (expand as needed)
const SCHOOL_ID_MAPPING: Record<string, string> = {
  // Tuto Demo School
  rec6oStnXAgY4VCrC: 'bed99290-1b7c-4e90-ac55-0ec7f496491b',
};

// Simple in-memory cache for resolved IDs
const cache = new Map<string, string>();

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
  if (!schoolIdentifier) return null;

  // Cache hit
  if (cache.has(schoolIdentifier)) {
    return cache.get(schoolIdentifier) as string;
  }

  // Direct UUID
  if (uuidRegex.test(schoolIdentifier)) {
    cache.set(schoolIdentifier, schoolIdentifier);
    return schoolIdentifier;
  }

  // Known mapping
  if (SCHOOL_ID_MAPPING[schoolIdentifier]) {
    const mapped = SCHOOL_ID_MAPPING[schoolIdentifier];
    cache.set(schoolIdentifier, mapped);
    return mapped;
  }

  // Try lookup by school_code or name
  const { data: schoolByCode } = await supabase
    .from('schools')
    .select('id')
    .eq('school_code', schoolIdentifier)
    .maybeSingle();
  if (schoolByCode?.id) {
    cache.set(schoolIdentifier, schoolByCode.id);
    return schoolByCode.id;
  }

  const { data: schoolByName } = await supabase
    .from('schools')
    .select('id')
    .ilike('name', schoolIdentifier)
    .limit(1)
    .maybeSingle();
  if (schoolByName?.id) {
    cache.set(schoolIdentifier, schoolByName.id);
    return schoolByName.id;
  }

  return null;
}

export function clearSchoolIdCache() {
  cache.clear();
}






