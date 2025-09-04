// src/lib/org.ts
export function getEffectiveOrgId(profile?: { org_id?: string | null }) {
  return profile?.org_id ?? process.env.NEXT_PUBLIC_DEFAULT_ORG_ID ?? null
}