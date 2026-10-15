// ============================================================
// Indian States and Union Territories with aliases for normalization
// ============================================================

export interface StateMeta {
  name: string;
  code: string;
  aliases: string[];
}

export const INDIAN_STATES: StateMeta[] = [
  { name: 'All India', code: 'ALL', aliases: ['central', 'pan india', 'national', 'across india', 'india'] },
  { name: 'Andhra Pradesh', code: 'AP', aliases: ['andhra', 'ap', 'appsc'] },
  { name: 'Arunachal Pradesh', code: 'AR', aliases: ['arunachal', 'ar'] },
  { name: 'Assam', code: 'AS', aliases: ['assam', 'apsc'] },
  { name: 'Bihar', code: 'BR', aliases: ['bihar', 'bpsc', 'bssc', 'bpssc', 'patna'] },
  { name: 'Chhattisgarh', code: 'CG', aliases: ['chhattisgarh', 'cgpsc', 'cgvyapam', 'raipur'] },
  { name: 'Delhi', code: 'DL', aliases: ['delhi', 'dsssb', 'nct'] },
  { name: 'Goa', code: 'GA', aliases: ['goa', 'gpsc'] },
  { name: 'Gujarat', code: 'GJ', aliases: ['gujarat', 'gpsc', 'gsssb', 'ojas'] },
  { name: 'Haryana', code: 'HR', aliases: ['haryana', 'hpsc', 'hssc', 'chandigarh'] },
  { name: 'Himachal Pradesh', code: 'HP', aliases: ['himachal', 'hppsc', 'hpsssb', 'shimla'] },
  { name: 'Jharkhand', code: 'JH', aliases: ['jharkhand', 'jpsc', 'jssc', 'ranchi'] },
  { name: 'Karnataka', code: 'KA', aliases: ['karnataka', 'kpsc', 'kea', 'bengaluru', 'bangalore'] },
  { name: 'Kerala', code: 'KL', aliases: ['kerala', 'kpsc', 'thiruvananthapuram'] },
  { name: 'Madhya Pradesh', code: 'MP', aliases: ['madhya pradesh', 'mppsc', 'mp peb', 'esb mp', 'vyapam', 'bhopal'] },
  { name: 'Maharashtra', code: 'MH', aliases: ['maharashtra', 'mpsc', 'mahapolicerecruitment', 'mumbai', 'pune'] },
  { name: 'Manipur', code: 'MN', aliases: ['manipur', 'mpsc'] },
  { name: 'Meghalaya', code: 'ML', aliases: ['meghalaya', 'mpsc'] },
  { name: 'Mizoram', code: 'MZ', aliases: ['mizoram', 'mpsc'] },
  { name: 'Nagaland', code: 'NL', aliases: ['nagaland', 'npsc'] },
  { name: 'Odisha', code: 'OR', aliases: ['odisha', 'orissa', 'opsc', 'ossc', 'osssc', 'bhubaneswar'] },
  { name: 'Punjab', code: 'PB', aliases: ['punjab', 'ppsc', 'psssb'] },
  { name: 'Rajasthan', code: 'RJ', aliases: ['rajasthan', 'rpsc', 'rsmssb', 'rssb', 'jaipur'] },
  { name: 'Sikkim', code: 'SK', aliases: ['sikkim', 'spsc'] },
  { name: 'Tamil Nadu', code: 'TN', aliases: ['tamil nadu', 'tnpsc', 'trb tn', 'chennai'] },
  { name: 'Telangana', code: 'TG', aliases: ['telangana', 'tspsc', 'hyderabad'] },
  { name: 'Tripura', code: 'TR', aliases: ['tripura', 'tpsc'] },
  { name: 'Uttar Pradesh', code: 'UP', aliases: ['uttar pradesh', 'uppsc', 'upsssc', 'up police', 'lucknow', 'allahabad', 'prayagraj'] },
  { name: 'Uttarakhand', code: 'UK', aliases: ['uttarakhand', 'ukpsc', 'uksssc', 'dehradun'] },
  { name: 'West Bengal', code: 'WB', aliases: ['west bengal', 'wbpsc', 'wbprb', 'kolkata'] },
  { name: 'Jammu and Kashmir', code: 'JK', aliases: ['jammu', 'kashmir', 'jkpsc', 'jkssb'] },
  { name: 'Ladakh', code: 'LA', aliases: ['ladakh', 'leh'] },
];
