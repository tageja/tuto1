/**
 * Resolve School Identifier to UUID
 * 
 * Accepts either:
 * - UUID string (returns as-is)
 * - School name (queries database to find UUID)
 * 
 * @param supabaseClient - Supabase client instance
 * @param identifier - School UUID or name
 * @returns School UUID or null if not found
 */
export async function resolveSchoolId(
  supabaseClient: any,
  identifier: string | null | undefined
): Promise<string | null> {
  if (!identifier) {
    return null;
  }

  // Decode URL-encoded characters and trim
  let normalizedIdentifier: string;
  try {
    normalizedIdentifier = decodeURIComponent(identifier).trim();
  } catch {
    // If decoding fails, use original
    normalizedIdentifier = identifier.trim();
  }

  // Check if it's already a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(normalizedIdentifier)) {
    // It's a UUID, verify it exists
    const { data, error } = await supabaseClient
      .from('schools')
      .select('id')
      .eq('id', normalizedIdentifier)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.id;
  }

  // It's a school name, look it up (exact match first)
  const { data, error } = await supabaseClient
    .from('schools')
    .select('id, name')
    .eq('name', normalizedIdentifier)
    .maybeSingle();

  if (data) {
    return data.id;
  }

  // Try without status filter (in case status is different)
  const { data: dataWithoutStatus, error: errorWithoutStatus } = await supabaseClient
    .from('schools')
    .select('id, name')
    .eq('name', normalizedIdentifier)
    .limit(1)
    .maybeSingle();

  if (dataWithoutStatus) {
    return dataWithoutStatus.id;
  }

  // Try case-insensitive search - ilike requires wildcards for pattern matching
  // But for exact match, we need to wrap with %
  const { data: data2, error: error2 } = await supabaseClient
    .from('schools')
    .select('id, name')
    .ilike('name', `%${normalizedIdentifier}%`)
    .limit(1)
    .maybeSingle();

  if (data2) {
    // Verify it's an exact match (case-insensitive)
    if (data2.name.toLowerCase() === normalizedIdentifier.toLowerCase()) {
      return data2.id;
    }
  }

  // Last resort: fetch all schools and find match (case-insensitive)
  const { data: allSchools, error: allError } = await supabaseClient
    .from('schools')
    .select('id, name, status');

  if (!allError && allSchools && allSchools.length > 0) {
    // Try to find exact match (case-insensitive)
    const match = allSchools.find(
      s => s.name.toLowerCase() === normalizedIdentifier.toLowerCase()
    );
    
    if (match) {
      return match.id;
    }
    
    // Log available schools only if lookup failed (for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 School not found. Available schools:', allSchools.map(s => `"${s.name}"`).join(', '));
      console.log('🔍 Looking for:', `"${normalizedIdentifier}"`);
    }
  }

  return null;
}

