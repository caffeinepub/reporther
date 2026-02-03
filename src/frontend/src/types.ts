// Frontend type definitions for ReportHer application
// Re-export types from backend for consistency

export type {
  StalkerProfile,
  PoliceDepartment,
  VictimProfile,
  IncidentReport,
  GeneratedMessage,
  EvidenceMeta,
  PoliceSubmissionLog,
  SmsLog,
  IncidentSummaryItem,
  Pattern,
  LocationPattern,
  SeverityPattern,
  PatternAnalysis,
  Totals,
  IncidentMessageSummary,
  IncidentSummary,
  UserProfile,
} from './backend';

export { MessageTone, ToneIntensity, UserRole } from './backend';
