// ============================================================
// TypeScript type definitions for the Sarkari Jobs platform
// ============================================================

// --- Job Types ---

export interface VacancyBreakdown {
  postName: string;
  count: number;
  eligibility: string;
  urCount?: number;
  obcCount?: number;
  ewsCount?: number;
  scCount?: number;
  stCount?: number;
}

export interface AdditionalLink {
  label: string;
  url: string;
}

export type JobCategory =
  | 'Railway'
  | 'Banking'
  | 'UPSC'
  | 'SSC'
  | 'Defence'
  | 'State'
  | 'Teaching'
  | 'Police'
  | 'Engineering'
  | 'Medical'
  | 'Admission'
  | 'Other';

export type PostType =
  | 'Latest Job'
  | 'Result'
  | 'Admit Card'
  | 'Answer Key'
  | 'Admission'
  | 'Syllabus';

export type Qualification =
  | '8th Pass'
  | '10th Pass'
  | '12th Pass'
  | 'ITI'
  | 'Diploma'
  | 'Graduate'
  | 'Post Graduate'
  | 'Engineering'
  | 'Medical'
  | 'Law'
  | 'B.Ed'
  | 'Any';

export interface IJob {
  _id?: string;

  // Identity
  title: string;
  slug: string;
  organization: string;
  department: string;
  shortDescription: string;

  // Classification
  category: JobCategory;
  subCategory: string;
  state: string;
  qualification: Qualification[];
  postType: PostType;

  // Vacancy Details
  totalVacancies: number;
  vacancyBreakdown: VacancyBreakdown[];

  // Important Dates
  applicationStartDate: Date | string | null;
  applicationEndDate: Date | string | null;
  feePaymentLastDate: Date | string | null;
  correctionWindowStart: Date | string | null;
  correctionWindowEnd: Date | string | null;
  examDate: string;
  admitCardDate: string;
  resultDate: string;

  // Fee Details
  feeGeneral: number | null;
  feeOBC: number | null;
  feeSCST: number | null;
  feeFemale: number | null;
  feePH: number | null;
  feeRefundGeneral: number | null;
  feeRefundSCST: number | null;
  feePaymentModes: string[];

  // Age Limit
  ageMinimum: number | null;
  ageMaximum: number | null;
  ageAsOn: Date | string | null;
  ageRelaxation: string;

  // Important Links
  applyOnlineUrl: string;
  notificationPdfUrl: string;
  officialWebsiteUrl: string;
  additionalLinks: AdditionalLink[];

  // Scraper Metadata
  sourceUrl: string;
  sourceSite: string;
  sourceHash: string;
  scrapedAt: Date | string;
  lastUpdated: Date | string;

  // Flags
  isActive: boolean;
  isNew?: boolean;
  isRecent?: boolean;
  isEndingSoon: boolean;
  isFeatured: boolean;

  // SEO
  metaTitle: string;
  metaDescription: string;

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

// --- API Response Types ---

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationInfo;
  error?: string;
}

export interface JobFilters {
  category?: JobCategory;
  state?: string;
  qualification?: Qualification;
  postType?: PostType;
  search?: string;
  sort?: 'latest' | 'ending-soon' | 'vacancies';
  page?: number;
  limit?: number;
}

// --- Category Types ---

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  jobCount: number;
  displayOrder: number;
}

// --- User Types ---

export interface IUser {
  _id?: string;
  email: string;
  name: string;
  bookmarkedJobs: string[];
  preferences: {
    categories: JobCategory[];
    states: string[];
    qualifications: Qualification[];
  };
  createdAt: Date | string;
}

// --- Scraper Types ---

export interface ScrapedJobListing {
  title: string;
  url: string;
  lastDate?: string;
  postType: PostType;
}

export interface ScrapedJobDetail {
  title: string;
  organization: string;
  shortDescription: string;
  importantDates: Record<string, string>;
  applicationFee: Record<string, string>;
  ageLimit: Record<string, string>;
  vacancyDetails: VacancyBreakdown[];
  importantLinks: AdditionalLink[];
  applyOnlineUrl: string;
  notificationPdfUrl: string;
  officialWebsiteUrl: string;
  sourceUrl: string;
}

export interface DashboardStats {
  totalActiveJobs: number;
  endingSoonCount: number;
  resultsCount: number;
  admitCardCount: number;
  newJobsToday: number;
  totalJobsScraped: number;
}
