
export type ProductType = 'Physical' | 'Digital' | 'Service' | 'Event' | 'Subscription' | 'Software' | 'Other';
export type Language = 'en' | 'pt' | 'es';
export type GenerationMode = 'Fast' | 'Quality';

export interface Lead {
  id: string;
  name: string;
  jobTitle: string;
  location: string;
  companyName: string;
  linkedinUrl: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  status: 'new' | 'enriching' | 'verified';
}

export interface LeadSearchSuggestions {
  industries: string[];
  seniorityLevels: string[];
  jobTitles: string[];
}

export interface IndustryNews {
  id: string;
  title: string;
  source: string;
  date: string;
  snippet: string;
  url: string;
}

export interface LinkedInPost {
  id: string;
  hook: string;
  content: string;
  category: string;
  linkedNewsId?: string;
}

export interface B2BTrigger {
  name: string;
  date: string;
  type: string;
  description: string;
}

export interface PhoneScript {
  id: string;
  opening: string;
  reason: string;
  observation: string;
  valueProp: string;
  question: string;
  exit: string;
}

export interface PhoneCampaign {
  scripts: PhoneScript[];
}

export interface DesignDirectorData {
  settings: {
    style: string;
    typography: string;
    colorPalette: string;
    iconSet: string;
    visualIntensity: string;
    borderRadius: string;
    themeMode: string;
  };
  brandKit?: {
    colors: string[];
    fontPairingRecommendation: string;
    vibeKeywords: string[];
    suggestion: string;
  };
  referenceImages?: string[];
  generatedPrompt?: string;
  generatedElementorJson?: string;
  generatedSiteSettingsJson?: string;
}

export interface CreativeSettings {
  metaDirection?: string;
  metaShotType?: string;
  metaBaseImage?: string;
  metaBaseImages?: string[];
  metaActiveStyle?: string;
  excludeBuyerContext?: boolean;
  searchDirection?: string;
  emailDirection?: string;
  emailActiveAngle?: string;
  emailActiveStyle?: EmailStyle;
  linkedinDirection?: string;
  linkedinActiveStyle?: string;
  linkedinExcludeContext?: boolean;
  phoneDirection?: string;
  storyboardDirection?: string;
  storyboardActiveStyle?: string;
  storyboardIgnoreContext?: boolean;
  softwareDirection?: string;
}

export interface PLGActionBlock {
  stage: string;
  goal: string;
  actions: string[];
  impactScore: number;
  effortScore: number;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType | null;
  description: string;
  websiteUrl?: string;
  images: string[]; 
  audienceType: 'B2B' | 'B2C' | 'Both' | null;
  location: string; 
  decisionMaker: string;
  goal: string;
  isPinned?: boolean;
  dreamBuyer?: DreamBuyer;
  bigIdea?: BigIdea;
  offer?: UniqueOffer; 
  marketIntel?: MarketIntel;
  campaignPlan?: CampaignPlan;
  creatives: Creative[];
  searchAds: SearchAdGroup[];
  emailCampaign?: EmailCampaign;
  phoneCampaign?: PhoneCampaign;
  storyboards?: Storyboard[];
  salesPage?: SalesPage;
  brandKit?: BrandKit;
  launchBlueprint?: LaunchBlueprint;
  industryNews?: IndustryNews[];
  linkedinPosts?: LinkedInPost[];
  softwareRecommendations?: SoftwareRecommendation[];
  lastUpdated: number;
  lpBuilderData?: LandingPageBuilderData;
  designDirectorData?: DesignDirectorData;
  creativeSettings?: CreativeSettings;
  offerFocus?: string;
  planFocus?: string;
  buyerFocus?: string;
  chatHistory?: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface LaunchBlueprint {
  productSummary: string;
  currentState?: string;
  priorityInitiatives?: string[];
  resourceRequirements?: string;
  decisionFramework?: string;
  oneHourBrief?: string;
  buyerSummary: string;
  marketSummary: string;
  offerSummary: string;
  planSummary: string;
  creativeSummary: string;
  salesSummary: string;
  bottomLine: string;
}

export type EmailStyle = 'Human-Written' | 'HTML Newsletter';

export interface EmailCampaign {
  category: string;
  style: EmailStyle;
  emails: Array<{
    subject: string;
    body: string;
    primaryAction: string;
  }>;
}

export interface DreamBuyer {
  name: string;
  archetype?: string; 
  ageRange: string;
  occupation: string;
  income: string;
  painPoint: string;
  desire: string;
  objection: string;
  trigger: string;
  mediaConsumption?: string; 
  avatarUrl?: string; 
  avatarOptions?: string[]; 
  physicalDescription?: string; 
  selectionReasoning?: string; 
}

export interface BigIdea {
  uniqueMechanism: string;
  uniqueMechanismDescription: string;
  emotionalDriver: string;
  tagline: string;
  viralStrategy: string; 
}

export interface UniqueOffer {
  paretoFocus?: {
    the20Percent: string;
    the80PercentOutcome: string;
    innovationStrategy: string;
    focusAction: string;
  };
  headline: string; 
  corePromise: string; 
  timeframe: string; 
  bonuses: Array<{ title: string; value: string; description: string }>; 
  riskReversal: string; 
  scarcity: string; 
  priceAnchor: string; 
}

export interface MonetizationStrategy {
    discountStrategy: {
        when: string;
        amount: string;
        audience: string;
    };
    opportunities: {
        upsells: string[];
        crossSells: string[];
        usageBased: string;
    };
}

export interface MarketIntel {
  workingNow: string[];
  saturated: string[];
  opportunities: string[];
  pricingSuggestions?: {
    sameForLess: PricingSuggestion;
    moreForSame: PricingSuggestion;
    monetization?: MonetizationStrategy;
  };
  competitors?: Competitor[];
  leanCanvas?: LeanCanvas;
  ownBrandInsights?: {
    positives: string[];
    negatives: string[];
    sentimentScore: number;
  };
  lastAnalyzed?: number;
}

export interface PricingSuggestion {
  price: string;
  logic: string;
  valueAdd?: string[]; 
}

export interface Competitor {
  name: string;
  url: string;
  strength: string;
  weakness: string;
  pricePoint: string;
  rating?: number;
  reviewCount?: string;
  socialLinks?: string[];
  strategicMoves?: string[];
  reviewInsights?: {
    whatTheyLove: string[];
    commonComplaints: string[];
  };
}

export interface LeanCanvas {
  problem: string;
  solution: string;
  uniqueValueProp: string;
  unfairAdvantage: string;
  customerSegments: string;
  channels: string;
  keyMetrics: string;
  costStructure: string;
  revenueStreams: string;
}

export interface BrandKit {
  colors: string[];
  fontHeadline: string;
  fontBody: string;
  tone: string;
}

export type StrategyStep = 
  | 'product' 
  | 'dream_buyer' 
  | 'market_intel' 
  | 'offer' 
  | 'campaign_plan'
  | 'creatives' 
  | 'sales_page' 
  | 'blueprint';

export type BuilderSectionId = 
  | 'header'
  | 'hero' 
  | 'numbers_bar'
  | 'categories'
  | 'intro_pain' 
  | 'solution' 
  | 'features' 
  | 'who_transformation'
  | 'comparison_vs'
  | 'process' 
  | 'about_author'
  | 'offer' 
  | 'social_proof' 
  | 'faq'
  | 'full_width_cta'
  | 'lead_form'
  | 'footer_contact';

export interface LandingPageBuilderData {
  selectedSections: BuilderSectionId[];
  tone: string;
  language: Language;
  creativityLevel: number;
  includeStrategy?: boolean; 
  isSolutionAware?: boolean;
  copy?: LandingPageCopy;
  customDirection?: string;
}

export interface LandingPageCopy {
  designRecommendation?: {
    style: string;
    typography: string;
    visualIntensity: string;
  };
  header?: {
    logo: string;
    navLinks: string[];
    cta: string;
  };
  hero?: {
    eyebrow: string;
    headline: string;
    subtitle: string;
    trustSignals: string[];
    cta: string;
    ctaSubtext: string;
    formTitle?: string;
    formSubtitle?: string;
    formButtonText?: string;
    formTrustText?: string;
  };
  numbers_bar?: {
    metrics: Array<{ label: string; value: string }>;
  };
  categories?: {
      sectionTitle: string;
      sectionSubtitle: string;
      items: Array<{
          title: string;
          description: string;
          linkText: string;
          imagePrompt: string;
      }>;
  };
  intro_pain?: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionParagraph?: string;
    painStory: string[]; 
    hook?: string;
    agitation: string;
    problemImagePrompts?: string[];
  };
  solution?: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionParagraph?: string;
    headline: string;
    description: string;
    comparison: string;
    specLabel?: string;
    keyBenefits?: string[];
    imagePrompt?: string;
    resultBox?: {
        label: string;
        text: string;
    };
  };
  features?: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionParagraph?: string;
    mainFeatures: Array<{ 
        headline: string; 
        body: string; 
        imagePrompt: string;
    }>;
    secondaryFeaturesTitle?: string;
    secondaryFeatures: Array<{ 
        title: string; 
        benefit: string; 
    }>;
  };
  who_transformation?: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionParagraph?: string;
    whoIsItFor: string; 
    audienceSegments: string[]; 
    whoIsNotFor: string;
    beforeState: string;
    afterState: string;
    bridge: string;
    labels: { before: string; after: string; bridge: string }; 
  };
  comparison_vs?: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionParagraph?: string;
    items: Array<{ feature: string; us: string; them: string }>;
  };
  process?: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionParagraph?: string;
    headline: string;
    steps: Array<{ title: string; description: string }>;
  };
  about_author?: {
    sectionTitle: string;
    authorName: string;
    authorTitle: string;
    authorBio: string;
    signatureText: string;
    stats: Array<{ label: string; value: string }>;
    imagePrompt: string;
  };
  offer?: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionParagraph?: string;
    whatYouGet: string;
    stack: Array<{ item: string; value: string }>;
    pricingTiers: Array<{ name: string; price: string; deliverables: string[] }>;
    guaranteeTitle: string;
    guaranteeText: string;
    finalCta: string;
  };
  social_proof?: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionParagraph?: string;
    testimonials: Array<{ quote: string; author: string; role: string }>;
    summaryMetric: string;
  };
  faq?: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionParagraph?: string;
    items: Array<{ q: string; a: string }>;
  };
  full_width_cta?: {
    headline: string;
    description: string;
    ctaText: string;
  };
  lead_form?: {
    sectionTitle?: string;
    sectionSubtitle?: string;
    headline: string;
    subheadline: string;
    deliverables: string[];
    formTitle: string;
    buttonText: string;
  };
  footer_contact?: {
    sectionTitle: string;
    sectionSubtitle: string;
    sectionParagraph?: string;
    contactInfo: { email: string; phone: string; address: string };
    socialLinks: Array<{ platform: string; url: string }>;
    copyrightText: string;
    formTitle: string;
    formButtonText: string;
  };
  [key: string]: any;
}

export interface Creative {
  id: string;
  style: 'Direct-Response' | 'YouTube-Thumbnail' | 'Breaking News' | 'Highlight Method' | 'Secret Info' | 'Social Gossip' | 'Short-Human' | 'Pop-Culture-Twist' | 'Storytelling' | 'UGC/Raw' | 'Humor' | 'Minimalist' | 'Versus' | 'Unique-Mechanism' | 'Emotional-Driver' | 'Viral-Angle' | 'Product-First';
  hook: string;
  headline: string;
  subheadline: string;
  caption: string;
  cta: string;
  visualPrompt: string;
  imageUrl?: string;
  shotType?: string;
  selectedBaseImage?: string; // Legacy
  selectedBaseImages?: string[];
}

export interface SearchAd {
  headlines: string[];
  descriptions: string[];
  path1: string;
  path2: string;
  keywords: string[];
}

export interface SearchAdGroup {
  intent: string;
  keywords: string[];
  ads: SearchAd[];
  assets?: {
    sitelinks: Array<{ title: string; desc1: string; desc2: string }>;
    callouts: string[];
    structuredSnippets: Array<{ header: string; values: string[] }>;
  };
}

export interface Scene {
  number: number;
  timing: string;
  energyTag: 'Hook' | 'Pain' | 'Logic' | 'Proof' | 'CTA';
  shotDetails: string;
  onScreenText: string;
  voiceover: string;
  editNotes: string;
  imagePrompt: string;
  imageUrl?: string;
  selectedBaseImage?: string;
}

export interface Storyboard {
  id: string;
  title: string;
  narrativeSummary: string;
  viralMusicTrack?: string;
  scenes: Scene[];
  retentionChecklist?: {
    hookUnder2s: boolean;
    interruptsEvery3s: boolean;
    proofShown: boolean;
    loopEnding: boolean;
  };
}

export interface CampaignPlan {
  direction: string;
  goal: string;
  coreMessage: string;
  marketNuance: string;
  viralInitiative: string;
  channelSetup: {
    platform: string;
    budgetRange: string;
    testDuration: string;
    whyThisPlatform: string;
  };
  launchSteps: string[];
  quickWins: {
    tactics: string[];
    partnerships: string[];
  };
  firstSignals: {
    goodSigns: string[];
    redFlags: string[];
  };
  keywords: Array<{ term: string; volume: string; cpc: string; relevance: string }>;
  plgStrategy: PLGActionBlock[];
  nextMove: string;
  creativeRecommendations: Array<{ type: string; count: string; priority: string; reason: string }>;
  b2bSuggestions?: {
    industries: string[];
    seniorityLevels: string[];
    jobTitles: string[];
  };
  b2bTriggers?: B2BTrigger[];
  growthHackAutomation?: Array<{
    title?: string;
    overview: string;
    objective: string;
    ultimateOutcome: string;
    why: string;
    aiAgent: string;
    subAgents?: Array<{
      name: string;
      role: string;
      skills: string[];
    }>;
    initialPrompt: string;
    tasks: string[];
  }>;
}

export interface SalesPage {
  // Legacy Interface for compatibility
  visualIdentity: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
  };
}

export type SalesPageAesthetic = string;

export interface SoftwareRecommendation {
  id?: string;
  name: string;
  category: string;
  url?: string;
  overview: string;
  objective: string;
  ultimateOutcome: string;
  why: string;
  aiAgent: string;
  subAgents?: Array<{
    name: string;
    role: string;
    skills: string[];
  }>;
  initialPrompt: string;
  tasks: string[];
}

