import { IJob } from '@/types';

export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://sarkarijobs-eta.vercel.app')
  );
}

/**
 * WebSite schema with Google Sitelinks Searchbox (SearchAction)
 */
export function generateWebSiteSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'Sarkari Jobs',
    alternateName: [
      'Sarkari Result',
      'Sarkari Naukri',
      'Sarkari Job 2026',
      'SarkariJobs Aggregator',
      'Free Job Alert India',
    ],
    description:
      "India's fastest automated government job aggregator. Get instant alerts for Sarkari Result, UPSC, SSC, Railway RRB, Banking IBPS, Police, Defence, and State PSC notifications.",
    inLanguage: 'en-IN',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Organization schema for Google Knowledge Graph
 */
export function generateOrganizationSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'Sarkari Jobs',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/icon.png`,
      caption: 'Sarkari Jobs Logo',
    },
    sameAs: [
      'https://twitter.com/sarkarijobs',
      'https://t.me/sarkarijobs',
      'https://whatsapp.com/channel/sarkarijobs',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}

/**
 * BreadcrumbList schema for breadcrumb display in SERP
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Google Jobs (JobPosting) schema for rich Google Jobs 3-pack listing
 */
export function generateJobPostingSchema(job: IJob) {
  const baseUrl = getBaseUrl();
  const jobUrl = `${baseUrl}/jobs/${job.slug}`;

  // Build clean description HTML for Google Jobs
  const descriptionHtml = `
    <div>
      <p><strong>${job.title}</strong></p>
      <p>${job.shortDescription || 'Recruitment notification released by ' + job.organization + '.'}</p>
      <h3>Important Details:</h3>
      <ul>
        <li><strong>Organization:</strong> ${job.organization}</li>
        <li><strong>Category:</strong> ${job.category}</li>
        <li><strong>Total Vacancies:</strong> ${job.totalVacancies > 0 ? job.totalVacancies.toLocaleString('en-IN') : 'As per official notification'}</li>
        <li><strong>Eligibility / Qualification:</strong> ${job.qualification && job.qualification.length > 0 ? job.qualification.join(', ') : 'Check Notification PDF'}</li>
        <li><strong>Application Fee:</strong> General: ₹${job.feeGeneral ?? 'Nil'} | SC/ST: ₹${job.feeSCST ?? 'Nil'}</li>
        <li><strong>Age Limit:</strong> ${job.ageMinimum || '18'} to ${job.ageMaximum || '35'} years</li>
        <li><strong>Job Location:</strong> ${job.state || 'All India'}</li>
      </ul>
      <p>Candidates are advised to read the official notification PDF and apply online through the official portal before the closing deadline.</p>
    </div>
  `.replace(/\s+/g, ' ').trim();

  // Valid through date (fallback to 30 days from creation if not provided)
  let validThrough: string;
  if (job.applicationEndDate) {
    validThrough = new Date(job.applicationEndDate).toISOString();
  } else {
    const fallbackDate = new Date(job.createdAt || Date.now());
    fallbackDate.setDate(fallbackDate.getDate() + 30);
    validThrough = fallbackDate.toISOString();
  }

  const datePosted = job.createdAt
    ? new Date(job.createdAt).toISOString()
    : new Date().toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: descriptionHtml,
    datePosted,
    validThrough,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.organization || 'Government of India',
      sameAs: job.officialWebsiteUrl || undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.state || 'New Delhi',
        addressRegion: job.state || 'Delhi',
        addressCountry: 'IN',
      },
    },
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'India',
    },
    directApply: Boolean(job.applyOnlineUrl),
    occupationalCategory: job.category,
    industry: 'Government & Public Administration',
    totalJobOpenings: job.totalVacancies > 0 ? job.totalVacancies : 1,
    url: jobUrl,
    mainEntityOfPage: jobUrl,
    educationRequirements:
      job.qualification && job.qualification.length > 0
        ? job.qualification.join(', ')
        : 'Recognized Board / University Degree',
    experienceRequirements: 'Freshers Eligible',
  };
}

/**
 * FAQPage schema for expandable FAQ accordions in Google SERP
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
