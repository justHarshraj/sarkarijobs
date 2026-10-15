import mongoose, { Schema, Model, Document } from 'mongoose';
import type { IJob, VacancyBreakdown, AdditionalLink } from '@/types';

// ============================================================
// Job Model — Core data model for government job listings
// ============================================================

export interface IJobDocument extends Omit<IJob, '_id' | 'isNew'>, Document {}

const VacancyBreakdownSchema = new Schema<VacancyBreakdown>(
  {
    postName: { type: String, default: '' },
    count: { type: Number, default: 0 },
    eligibility: { type: String, default: '' },
    urCount: { type: Number },
    obcCount: { type: Number },
    ewsCount: { type: Number },
    scCount: { type: Number },
    stCount: { type: Number },
  },
  { _id: false }
);

const AdditionalLinkSchema = new Schema<AdditionalLink>(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const JobSchema = new Schema(
  {
    // Identity
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    organization: { type: String, default: '', trim: true },
    department: { type: String, default: '', trim: true },
    shortDescription: { type: String, default: '' },

    // Classification
    category: {
      type: String,
      enum: [
        'Railway', 'Banking', 'UPSC', 'SSC', 'Defence',
        'State', 'Teaching', 'Police', 'Engineering',
        'Medical', 'Admission', 'Other',
      ],
      default: 'Other',
      index: true,
    },
    subCategory: { type: String, default: '' },
    state: { type: String, default: 'All India', index: true },
    qualification: {
      type: [String],
      default: ['Any'],
      index: true,
    },
    postType: {
      type: String,
      enum: ['Latest Job', 'Result', 'Admit Card', 'Answer Key', 'Admission', 'Syllabus'],
      default: 'Latest Job',
      index: true,
    },

    // Vacancy Details
    totalVacancies: { type: Number, default: 0 },
    vacancyBreakdown: { type: [VacancyBreakdownSchema], default: [] },

    // Important Dates
    applicationStartDate: { type: Date, default: null },
    applicationEndDate: { type: Date, default: null, index: true },
    feePaymentLastDate: { type: Date, default: null },
    correctionWindowStart: { type: Date, default: null },
    correctionWindowEnd: { type: Date, default: null },
    examDate: { type: String, default: '' },
    admitCardDate: { type: String, default: '' },
    resultDate: { type: String, default: '' },

    // Fee Details
    feeGeneral: { type: Number, default: null },
    feeOBC: { type: Number, default: null },
    feeSCST: { type: Number, default: null },
    feeFemale: { type: Number, default: null },
    feePH: { type: Number, default: null },
    feeRefundGeneral: { type: Number, default: null },
    feeRefundSCST: { type: Number, default: null },
    feePaymentModes: { type: [String], default: [] },

    // Age Limit
    ageMinimum: { type: Number, default: null },
    ageMaximum: { type: Number, default: null },
    ageAsOn: { type: Date, default: null },
    ageRelaxation: { type: String, default: '' },

    // Important Links
    applyOnlineUrl: { type: String, default: '' },
    notificationPdfUrl: { type: String, default: '' },
    officialWebsiteUrl: { type: String, default: '' },
    additionalLinks: { type: [AdditionalLinkSchema], default: [] },

    // Scraper Metadata
    sourceUrl: { type: String, required: true },
    sourceSite: { type: String, required: true },
    sourceHash: { type: String, default: '' },
    scrapedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },

    // Flags
    isActive: { type: Boolean, default: true, index: true },
    isRecent: { type: Boolean, default: true },
    isEndingSoon: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false },

    // SEO
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common query patterns
JobSchema.index({ category: 1, isActive: 1 });
JobSchema.index({ sourceUrl: 1, sourceSite: 1 }, { unique: true });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ applicationEndDate: 1, isActive: 1 });

// Text index for full-text search
JobSchema.index({ title: 'text', organization: 'text', shortDescription: 'text' });

// Virtual: days remaining until application closes
JobSchema.virtual('daysRemaining').get(function (this: IJobDocument) {
  if (!this.applicationEndDate) return null;
  const endDate = new Date(this.applicationEndDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Pre-save: Auto-generate metaTitle and metaDescription if empty
JobSchema.pre('save', function (this: IJobDocument) {
  if (!this.metaTitle) {
    this.metaTitle = `${this.title} | Sarkari Jobs`;
  }
  if (!this.metaDescription) {
    this.metaDescription = `Apply for ${this.title}. ${this.totalVacancies} vacancies. Last date: ${this.applicationEndDate ? new Date(this.applicationEndDate).toLocaleDateString('en-IN') : 'Check notification'}. Download official PDF and apply online.`;
  }
});

const Job: Model<IJobDocument> =
  (mongoose.models && mongoose.models.Job) || mongoose.model<IJobDocument>('Job', JobSchema);

export default Job;
