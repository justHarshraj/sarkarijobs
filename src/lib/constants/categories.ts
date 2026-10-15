// ============================================================
// Categories configuration and metadata
// ============================================================

import type { JobCategory } from '@/types';

export interface CategoryMeta {
  name: JobCategory;
  slug: string;
  icon: string;
  description: string;
  displayOrder: number;
  keywords: string[];
}

export const CATEGORIES: CategoryMeta[] = [
  {
    name: 'Railway',
    slug: 'railway',
    icon: 'Train',
    description: 'Railway Recruitment Boards (RRB, RRC) jobs and apprenticeships',
    displayOrder: 1,
    keywords: ['railway', 'rrb', 'rrc', 'ntpc', 'group d', 'loco pilot', 'alp', 'station master', 'ticket collector', 'tc', 'trackman'],
  },
  {
    name: 'Banking',
    slug: 'banking',
    icon: 'Landmark',
    description: 'IBPS, SBI, RBI, NABARD and Public Sector Bank recruitments',
    displayOrder: 2,
    keywords: ['bank', 'ibps', 'sbi', 'rbi', 'nabard', 'po', 'clerk', 'specialist officer', 'so', 'canara', 'pnb', 'bob'],
  },
  {
    name: 'SSC',
    slug: 'ssc',
    icon: 'Building2',
    description: 'Staff Selection Commission (CGL, CHSL, MTS, CPO, GD Constable)',
    displayOrder: 3,
    keywords: ['ssc', 'cgl', 'chsl', 'mts', 'cpo', 'gd constable', 'stenographer', 'selection post', 'je'],
  },
  {
    name: 'UPSC',
    slug: 'upsc',
    icon: 'Award',
    description: 'Civil Services, NDA, CDS, CAPF, Engineering Services and EPFO',
    displayOrder: 4,
    keywords: ['upsc', 'civil services', 'ias', 'ips', 'ifs', 'nda', 'cds', 'capf', 'epfo', 'ies', 'cms'],
  },
  {
    name: 'Defence',
    slug: 'defence',
    icon: 'Shield',
    description: 'Indian Army, Navy, Air Force, Coast Guard and Paramilitary',
    displayOrder: 5,
    keywords: ['army', 'navy', 'air force', 'iaf', 'defence', 'agniveer', 'coast guard', 'crpf', 'bsf', 'cisf', 'itbp', 'ssb', 'assam rifles'],
  },
  {
    name: 'Police',
    slug: 'police',
    icon: 'ShieldAlert',
    description: 'State Police, SI, Constable, Jail Warder and Forest Guard posts',
    displayOrder: 6,
    keywords: ['police', 'constable', 'sub inspector', 'si', 'daroga', 'jail warder', 'home guard', 'fireman', 'cctns'],
  },
  {
    name: 'Teaching',
    slug: 'teaching',
    icon: 'GraduationCap',
    description: 'CTET, State TET, DSSSB, KVS, NVS, Assistant Professor and TGT/PGT',
    displayOrder: 7,
    keywords: ['teacher', 'teaching', 'ctet', 'tet', 'kvs', 'nvs', 'dsssb', 'tgt', 'pgt', 'prt', 'professor', 'lecturer'],
  },
  {
    name: 'State',
    slug: 'state',
    icon: 'MapPin',
    description: 'State Public Service Commissions (UPPSC, BPSC, MPPSC, RPSC, etc.)',
    displayOrder: 8,
    keywords: ['uppsc', 'bpsc', 'mppsc', 'rpsc', 'wbpsc', 'appsc', 'tspsc', 'hpsc', 'ukpsc', 'jpsc', 'cgpsc', 'upsssc', 'bssc', 'rsmssb'],
  },
  {
    name: 'Engineering',
    slug: 'engineering',
    icon: 'Wrench',
    description: 'GATE, PSU recruitments (BHEL, IOCL, ONGC, NTPC, DRDO, ISRO)',
    displayOrder: 9,
    keywords: ['engineer', 'engineering', 'junior engineer', 'je', 'ae', 'assistant engineer', 'drdo', 'isro', 'bhel', 'ongc', 'ntpc', 'iocl', 'gate'],
  },
  {
    name: 'Medical',
    slug: 'medical',
    icon: 'HeartPulse',
    description: 'AIIMS, NHM, Staff Nurse, Medical Officer, Pharmacist and Lab Tech',
    displayOrder: 10,
    keywords: ['medical', 'doctor', 'aiims', 'nhm', 'nurse', 'nursing', 'pharmacist', 'lab technician', 'cho', 'medical officer', 'mo'],
  },
  {
    name: 'Admission',
    slug: 'admission',
    icon: 'BookOpen',
    description: 'University Admissions, Entrance Tests, NTA, NEET, JEE and CUET',
    displayOrder: 11,
    keywords: ['admission', 'entrance exam', 'cuet', 'neet', 'jee', 'nta', 'polytechnic', 'bed admission', 'clat'],
  },
  {
    name: 'Other',
    slug: 'other',
    icon: 'Briefcase',
    description: 'Other government and public sector employment opportunities',
    displayOrder: 12,
    keywords: [],
  },
];
