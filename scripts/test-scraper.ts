import { scrapeSarkariResultListings, scrapeSarkariResultDetail } from '../src/lib/scraper/sarkariresult';

async function test() {
  console.log('Testing sarkariresult.com scraper...');
  const listings = await scrapeSarkariResultListings(3);
  console.log(`Found ${listings.length} listings:`);
  listings.forEach((l, i) => {
    console.log(`[${i + 1}] [${l.postType}] ${l.title} -> ${l.url}`);
  });

  if (listings.length > 0) {
    console.log('\nTesting detail scraper for first listing:');
    const detail = await scrapeSarkariResultDetail(listings[0].url);
    console.log('Detail extracted:', {
      title: detail?.title,
      organization: detail?.organization,
      dates: detail?.importantDates,
      fee: detail?.applicationFee,
      age: detail?.ageLimit,
      vacanciesCount: detail?.vacancyDetails?.length,
      applyOnlineUrl: detail?.applyOnlineUrl,
      pdfUrl: detail?.notificationPdfUrl,
    });
  }
}

test().catch(console.error);
