
export interface SearchParams {
  firstName: string;
  lastName: string;
  location: string;
  dob?: string;
  additionalContext?: string;
  aliases?: string;
  socialProfiles?: string;
  image?: string;
  imageMimeType?: string;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ResearchLink {
  title: string;
  url: string;
  description: string;
}

export interface ReportData {
  summary: string;
  sources: GroundingSource[];
  riskAnalysis: string;
  safetyScore: number;
  safetyLevel: 'SAFE' | 'CAUTION' | 'HIGH_RISK' | 'CRITICAL';
  recommendedDirectories: ResearchLink[];
  timestamp: number;
}

export interface SocialFeedback {
  id: string;
  rating: number;
  tags: string[];
  comment: string;
  relationship: string;
  timestamp: number;
  isVerified: boolean;
  authorId?: string; // Link to user
  authorEmail?: string; // For admin view
}

// --- NEW TYPES FOR ACCOUNTS & EVIDENCE ---

export type SubscriptionTier = 'FREE' | 'PAID';

export interface User {
  id: string;
  username?: string; // Added username support
  email: string;
  role: 'USER' | 'ADMIN';
  tier: SubscriptionTier;
  searchesUsedThisMonth: number;
  maxSearches: number;
  billingCycleStart: number;
  passwordHash: string; // Simplified for mock
  referralCode?: string;
  referredByUserId?: string;
  commissionBalance?: number;
}

export interface EvidenceAnalysis {
  isHarmful: boolean;
  riskScore: number;
  summary: string;
  detectedBehaviors: string[]; // e.g., "Gaslighting", "Threats"
}

export interface UserSubmission {
  id: string;
  targetName: string; // "John Doe"
  submittedByUserId: string;
  submittedByUserEmail: string;
  type: 'COURT_DOC' | 'CONVERSATION' | 'OTHER';
  text: string;
  images?: string[]; // Base64
  aiAnalysis?: EvidenceAnalysis;
  timestamp: number;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AdminConfig {
  stripePublicKey: string;
  stripeSecretKey: string;
  sendGridApiKey?: string;
  sendGridFromEmail?: string;
  // Email Templates
  passwordResetEmailSubject?: string;
  passwordResetEmailBody?: string;
  referralWelcomeSubject?: string;
  referralWelcomeBody?: string;
  // Firebase
  firebaseConfig?: FirebaseConfig;
}

export interface SavedRecord {
  id: string;
  params: SearchParams;
  report: ReportData;
  source?: 'AI_GENERATED' | 'USER_SUBMITTED';
  userId?: string;
}

// --- NEW TYPES FOR DATA REMOVAL & SUBMISSION ---

export interface RemovedProfile {
  id: string;
  firstName: string;
  lastName: string;
  location: string;
  reason: string;
  requesterEmail: string;
  timestamp: number;
}

export interface ProfileSubmissionParams {
  firstName: string;
  lastName: string;
  location: string;
  dob?: string;
  details: string;
}

export interface ProfileMatchResult {
  matchFound: boolean;
  matchedRecordId?: string;
  confidence: number;
  reasoning: string;
}

export interface Invite {
  code: string;
  status: 'PENDING' | 'USED';
  createdForEmail?: string; // If null, can be used by anyone
  createdAt: number;
  usedByUserId?: string;
  usedAt?: number;
}

export enum AppState {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING', // Used for Loading state
  REFINING = 'REFINING',   // Used for Editing previous search params
  REFINE_CHAT = 'REFINE_CHAT', // New Chat Interface for refinement
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  DATABASE = 'DATABASE',
  ADMIN = 'ADMIN',
  SUBMIT_PROFILE = 'SUBMIT_PROFILE',
  DATA_REMOVAL = 'DATA_REMOVAL',
  LEGAL_TOS = 'LEGAL_TOS',
  LEGAL_PRIVACY = 'LEGAL_PRIVACY',
  SHARED_REPORT = 'SHARED_REPORT', // New state for public shared links
  REFERRAL_INFO = 'REFERRAL_INFO', // New state for Referral Program info page
  REFERRAL_DASHBOARD = 'REFERRAL_DASHBOARD'
}