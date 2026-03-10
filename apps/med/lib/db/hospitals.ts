import { getServiceClient, NursedHospital } from '../supabase'

export async function getHospitals() {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_hospitals')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as NursedHospital[]
}

export async function getHospitalById(id: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_hospitals')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as NursedHospital
}

export async function createHospital(payload: Partial<NursedHospital>) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_hospitals')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as NursedHospital
}

export async function updateHospital(id: string, payload: Partial<NursedHospital>) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_hospitals')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as NursedHospital
}

export async function getPairGroups(hospitalId?: string) {
  const db = getServiceClient()
  let q = db.from('nursed_pair_groups').select('*, nursed_pair_members(*)').eq('active', true)
  if (hospitalId) q = q.eq('hospital_id', hospitalId)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function createPairGroup(payload: { name?: string; hospital_id?: string; max_size?: number }) {
  const db = getServiceClient()
  const join_code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const { data, error } = await db
    .from('nursed_pair_groups')
    .insert({ ...payload, join_code })
    .select()
    .single()
  if (error) throw error
  return data
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function generateHospitalInviteCode(hospitalId: string): Promise<string> {
  const db = getServiceClient()
  const code = generateInviteCode()
  const { error } = await db
    .from('nursed_hospitals')
    .update({ invite_code: code })
    .eq('id', hospitalId)
  if (error) throw error
  return code
}

export async function getHospitalByInviteCode(code: string): Promise<NursedHospital | null> {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_hospitals')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .single()
  if (error) return null
  return data as NursedHospital
}

export async function joinPairGroup(joinCode: string, userId: string) {
  const db = getServiceClient()
  const { data: group, error: gErr } = await db
    .from('nursed_pair_groups')
    .select('*')
    .eq('join_code', joinCode.toUpperCase())
    .eq('active', true)
    .single()
  if (gErr || !group) throw new Error('Group not found')

  const { data: members } = await db
    .from('nursed_pair_members')
    .select('*')
    .eq('pair_group_id', group.id)

  if ((members?.length ?? 0) >= group.max_size) throw new Error('Group is full')

  const { data, error } = await db
    .from('nursed_pair_members')
    .upsert({ pair_group_id: group.id, user_id: userId }, { onConflict: 'pair_group_id,user_id' })
    .select()
    .single()
  if (error) throw error
  return { group, membership: data }
}
