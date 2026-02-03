import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SeverityPattern {
    incidentCount: bigint;
    evidenceCount: bigint;
    intensity: ToneIntensity;
}
export interface VictimProfile {
    dob?: string;
    name?: string;
    email?: string;
    address?: string;
    phoneNumber?: string;
}
export interface IncidentReport {
    id: string;
    additionalNotes: string;
    criminalActivityReportNumber: string;
    evidenceNotes: string;
    user: Principal;
    description: string;
    timestamp: bigint;
    location: string;
    incidentDate: bigint;
}
export interface Pattern {
    name: string;
    description: string;
    details: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface AddressPlaceCandidate {
    formattedAddress: string;
    placeCandidates: Array<PlaceCandidate>;
}
export interface StalkerProfile {
    age?: bigint;
    vehicleDescription?: string;
    vehiclePlate?: string;
    city?: string;
    name: string;
    zipCode?: string;
    state?: string;
    socialMediaLinks?: string;
    suspectDescription?: string;
    fullAddress?: string;
    phoneNumber?: string;
}
export interface GeneratedMessage {
    id: bigint;
    content: string;
    incidentId: string;
    tone: MessageTone;
    timestamp: bigint;
    intensity?: ToneIntensity;
}
export interface IncidentMessageSummary {
    id: bigint;
    content: string;
    incidentId: string;
    tone: MessageTone;
    incidentTimestamp: bigint;
    location: string;
    intensity?: ToneIntensity;
}
export interface SmsLog {
    messageContent: string;
    incidentId: string;
    messageId: bigint;
    recipient?: string;
    timestamp: bigint;
    confirmation: boolean;
}
export interface EvidenceMeta {
    id: bigint;
    originalFilename: string;
    fileSize: bigint;
    fileType: string;
    storageId: string;
    uploadTimestamp: bigint;
    uploadedBy: Principal;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface IncidentSummary {
    totalAnalysis: Totals;
    patternAnalysis: PatternAnalysis;
    messageHistory: Array<IncidentMessageSummary>;
    timelineItems: Array<IncidentSummaryItem>;
}
export interface PatternAnalysis {
    patterns: Array<Pattern>;
    severityPatterns: Array<SeverityPattern>;
    locations: Array<LocationPattern>;
}
export interface PlaceCandidate {
    displayName: string;
    websiteUri: string;
    nationalPhoneNumber: string;
    rating: string;
    formattedAddress: string;
    telephone: string;
}
export interface Totals {
    messageCount: bigint;
    incidentCount: bigint;
    evidenceCount: bigint;
}
export interface IncidentSummaryItem {
    id: string;
    messages: Array<IncidentMessageSummary>;
    description: string;
    evidence: Array<EvidenceMeta>;
    timestamp: bigint;
    location: string;
}
export interface PoliceSubmissionLog {
    victimInfo?: VictimProfile;
    attachedEvidence: Array<EvidenceMeta>;
    includedSummary: boolean;
    submissionResult: string;
    timestamp: bigint;
    victimInfoIncluded: boolean;
    department: PoliceDepartment;
}
export interface PoliceDepartment {
    city: string;
    name: string;
    zipCode: string;
    state: string;
    address: string;
    contactNumber: string;
}
export interface LocationPattern {
    count: bigint;
    severity: string;
    location: string;
}
export enum MessageTone {
    documentationNotice = "documentationNotice",
    formalEvidence = "formalEvidence",
    directWarning = "directWarning"
}
export enum ToneIntensity {
    calm = "calm",
    firm = "firm",
    veryHarsh = "veryHarsh",
    severe = "severe"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deletePoliceDepartment(deptId: bigint): Promise<boolean>;
    deleteStalkerProfile(profileId: bigint): Promise<boolean>;
    findNearestPoliceDepartment(address: string): Promise<PoliceDepartment | null>;
    generateIncidentSummary(): Promise<IncidentSummary>;
    generateMessage(incidentId: string, tone: MessageTone, intensity: ToneIntensity | null): Promise<GeneratedMessage>;
    getAllIncidents(): Promise<Array<IncidentReport>>;
    getAllPoliceDepartments(): Promise<Array<[bigint, PoliceDepartment]>>;
    getAllStalkerProfiles(): Promise<Array<[bigint, StalkerProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEvidenceForIncident(incidentId: string): Promise<Array<EvidenceMeta>>;
    getIncident(id: string): Promise<IncidentReport | null>;
    getMessagesForIncident(incidentId: string): Promise<Array<GeneratedMessage>>;
    getMotivationalVideoAccess(): Promise<boolean>;
    getMotivationalVideoStorageId(): Promise<string>;
    getNearestAddresses(searchTerm: string): Promise<Array<AddressPlaceCandidate>>;
    getNearestPoliceDepartmentsToAddress(term: string): Promise<Array<PlaceCandidate>>;
    getPoliceSubmissionLogs(): Promise<Array<PoliceSubmissionLog>>;
    getSmsLogs(): Promise<Array<SmsLog>>;
    getStalkerProfile(): Promise<StalkerProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVictimProfile(): Promise<VictimProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logPoliceSubmission(department: PoliceDepartment, submissionResult: string, attachedEvidence: Array<EvidenceMeta>, victimInfoIncluded: boolean, victimInfo: VictimProfile | null, includedSummary: boolean): Promise<void>;
    logSmsUsage(incidentId: string, messageId: bigint, messageContent: string, recipient: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveIncident(location: string, description: string, evidenceNotes: string, additionalNotes: string): Promise<IncidentReport>;
    saveMultipleStalkerProfile(profile: StalkerProfile): Promise<bigint>;
    savePoliceDepartment(department: PoliceDepartment): Promise<bigint>;
    saveStalkerProfile(profile: StalkerProfile): Promise<void>;
    saveVictimProfile(profile: VictimProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updatePoliceDepartment(deptId: bigint, department: PoliceDepartment): Promise<boolean>;
    updateStalkerProfile(profileId: bigint, profile: StalkerProfile): Promise<boolean>;
    uploadEvidence(incidentId: string, storageId: string, originalFilename: string, fileType: string, fileSize: bigint): Promise<EvidenceMeta>;
}
