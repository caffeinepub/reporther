import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Char "mo:core/Char";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import StalkerProfile "stalker-profile";
import PoliceDepartment "police-department";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";

actor {
  type StalkerProfile = StalkerProfile.StalkerProfile;
  type PoliceDepartment = PoliceDepartment.PoliceDepartment;

  public type MessageTone = {
    #formalEvidence;
    #directWarning;
    #documentationNotice;
  };

  public type ToneIntensity = {
    #calm;
    #firm;
    #severe;
    #veryHarsh;
  };

  public type VictimProfile = {
    name : ?Text;
    dob : ?Text;
    address : ?Text;
    email : ?Text;
    phoneNumber : ?Text;
  };

  public type GeneratedMessage = {
    id : Nat;
    timestamp : Int;
    incidentId : Text;
    tone : MessageTone;
    intensity : ?ToneIntensity;
    content : Text;
  };

  public type IncidentReport = {
    id : Text;
    timestamp : Int;
    user : Principal;
    incidentDate : Int;
    criminalActivityReportNumber : Text;
    location : Text;
    description : Text;
    evidenceNotes : Text;
    additionalNotes : Text;
  };

  public type PoliceSubmissionLog = {
    timestamp : Int;
    department : PoliceDepartment;
    submissionResult : Text;
    attachedEvidence : [EvidenceMeta];
    victimInfoIncluded : Bool;
    victimInfo : ?VictimProfile;
    includedSummary : Bool;
  };

  public type UserProfile = {
    name : Text;
  };

  public type EvidenceMeta = {
    id : Nat;
    uploadedBy : Principal;
    storageId : Text;
    originalFilename : Text;
    fileType : Text;
    fileSize : Nat;
    uploadTimestamp : Int;
  };

  public type ShareMessageType = {
    #appRecommendation;
    #noPermission;
    #firmAccountability;
    #personalFeminineTouch;
  };

  public type AppShareMessage = {
    messageType : ShareMessageType;
    message : Text;
  };

  public type SmsLog = {
    timestamp : Int;
    incidentId : Text;
    messageId : Nat;
    messageContent : Text;
    recipient : ?Text;
    confirmation : Bool;
  };

  public type IncidentSummary = {
    timelineItems : [IncidentSummaryItem];
    patternAnalysis : PatternAnalysis;
    totalAnalysis : Totals;
    messageHistory : [IncidentMessageSummary];
  };

  public type IncidentSummaryItem = {
    id : Text;
    timestamp : Int;
    location : Text;
    description : Text;
    evidence : [EvidenceMeta];
    messages : [IncidentMessageSummary];
  };

  public type PatternAnalysis = {
    patterns : [Pattern];
    locations : [LocationPattern];
    severityPatterns : [SeverityPattern];
  };

  public type Pattern = {
    name : Text;
    description : Text;
    details : Text;
  };

  public type LocationPattern = {
    location : Text;
    count : Nat;
    severity : Text;
  };

  public type SeverityPattern = {
    intensity : ToneIntensity;
    incidentCount : Nat;
    evidenceCount : Nat;
  };

  public type Totals = {
    incidentCount : Nat;
    evidenceCount : Nat;
    messageCount : Nat;
  };

  public type IncidentMessageSummary = {
    id : Nat;
    incidentId : Text;
    tone : MessageTone;
    intensity : ?ToneIntensity;
    content : Text;
    incidentTimestamp : Int;
    location : Text;
  };

  type PlaceCandidate = {
    displayName : Text;
    formattedAddress : Text;
    rating : Text;
    telephone : Text;
    websiteUri : Text;
    nationalPhoneNumber : Text;
  };

  type AddressPlaceCandidate = {
    formattedAddress : Text;
    placeCandidates : [PlaceCandidate];
  };

  type LatLong = {
    lat : Text;
    lng : Text;
  };

  type AddressLocation = {
    latlng : LatLong;
    formattedAddress : Text;
  };

  type AddressCandidate = {
    formattedAddress : Text;
    location : LatLong;
  };

  type AddressCandidateResponse = {
    formattedAddress : Text;
    candidates : [AddressCandidate];
  };

  var incidentCounter = 0;
  var messageCounter = 0;
  var evidenceCounter = 0;
  var stalkerProfileCounter = 0;

  let stalkerProfiles = Map.empty<Principal, StalkerProfile>();
  let victimProfiles = Map.empty<Principal, VictimProfile>();
  let messages = Map.empty<Nat, GeneratedMessage>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let evidenceStore = Map.empty<Nat, EvidenceMeta>();
  let incidentEvidence = Map.empty<Text, [Nat]>();
  let policeSubmissionLogs = Map.empty<Principal, [PoliceSubmissionLog]>();
  let smsLogs = Map.empty<Principal, [SmsLog]>();
  let userIncidents = Map.empty<Principal, [Text]>();
  let incidents = Map.empty<Text, IncidentReport>();
  let lastAssignedIncidentNumber = Map.empty<Text, Nat>();
  let multipleStalkerProfiles = Map.empty<Principal, Map.Map<Nat, StalkerProfile>>();
  let cachedAddresses = Map.empty<Text, [PlaceCandidate]>();
  let lastContactedPlaceApi = Map.empty<Text, Int>();
  let lastContactedApi = Map.empty<Text, Int>();
  let policeDepartments = Map.empty<Nat, PoliceDepartment>();
  var policeDepartmentCounter = 0;

  // Motivational video storage - only accessible to authenticated users
  let motivationalVideoStorageId = "motivational-video-storage-id";
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  func extractDateComponent(timestampMs : Int, component : Text) : Nat {
    let secondsTimestamp = timestampMs / 1000;
    let daysSinceEpoch = secondsTimestamp / 86400;

    let year = 1970 + (daysSinceEpoch / 365);
    let dayOfYear = daysSinceEpoch % 365;

    let month = (dayOfYear / 30) + 1;
    let day = (dayOfYear % 30) + 1;

    switch (component) {
      case ("day") {
        let d = Int.abs(day);
        if (d > 31) { 1 } else if (d < 1) { 1 } else { d };
      };
      case ("month") {
        let m = Int.abs(month);
        if (m > 12) { 1 } else if (m < 1) { 1 } else { m };
      };
      case ("year") { Int.abs(year % 10000) };
      case (_) { 0 };
    };
  };

  func getIncidentNumberForDate(datePart : Text) : Nat {
    let currentNumber = switch (lastAssignedIncidentNumber.get(datePart)) {
      case (null) { 0 };
      case (?number) { number };
    };
    let newNumber = currentNumber + 1;
    lastAssignedIncidentNumber.add(datePart, newNumber);
    newNumber;
  };

  func formatTextWithLeadingZero(value : Nat) : Text {
    let valueAsText = value.toText();
    if (valueAsText.size() == 1) { "0" # valueAsText } else {
      valueAsText;
    };
  };

  func generateIncidentNumberPart(incidentDate : Int) : Text {
    let day = extractDateComponent(incidentDate, "day");
    let month = extractDateComponent(incidentDate, "month");
    let year = extractDateComponent(incidentDate, "year");

    formatTextWithLeadingZero(day) # formatTextWithLeadingZero(month) # year.toText();
  };

  func formatCounterPart(counter : Nat) : Text {
    if (counter < 10) { "00" # counter.toText() } else {
      if (counter < 100) { "0" # counter.toText() } else { counter.toText() };
    };
  };

  func generateCarNumberInternal(counter : Nat, incidentDate : Int) : Text {
    let datePart = generateIncidentNumberPart(incidentDate);
    let sequentialNumber = getIncidentNumberForDate(datePart);
    let numberPart = formatCounterPart(sequentialNumber);
    datePart # "-" # numberPart;
  };

  func getShareMessageInternal(messageType : ShareMessageType) : Text {
    let shareIntro = "Download \"ReportHer\" - Empowerment & Safety at your fingertips. ";
    let appTagline = "**ReportHer** - Your safety, your evidence, your power. \n- Report harassers\n- Document incidents\n- Safely store proof\n- Automatic police reporting";
    let shareOutro = "Accountability, protection, and support all in one app. \n";
    let appLaunch = "Install for FREE at\n`https://reporther-2cs.caffeine.xyz` and take control of your safety. \n";

    switch (messageType) {
      case (#appRecommendation) {
        shareIntro # appTagline # appLaunch # shareOutro;
      };
      case (#noPermission) {
        "\"ReportHer\" is a women's safety app for reporting and documenting harassment. This is a professional notification of your behavior for accountability purposes. \nLegal documentation has been created and may be submitted to law enforcement. If you have questions about police reporting, you can find more information at `https://reporther-2cs.caffeine.xyz`";
      };
      case (#firmAccountability) {
        "There is zero tolerance for men's predatory behavior.\nLegal documentation has been created and may be submitted to law enforcement. If you have questions about police reporting, you can find more information at `https://reporther-2cs.caffeine.xyz`";
      };
      case (#personalFeminineTouch) {
        "\"Personal Feminine Touch (PFT) Share Message \"\n" #
        "---------------------------\n" #
        "Subject: New Female Safety & Self-Protection App\n" #
        "---------------------------\n\n" #
        "This platform helps to break the silence, give accountability, and empower female friends and family, while holding predatory behavior accountable.\n\n" #
        "Full Legal Coverage & Evidence Storage: Reduces the risk of public discussions about harassment, stalking, and predatory behavior. Keeps no record on your device, while it's uploaded directly to ReportHer and a backup legal server with proof of submission.\n\n" #
        "Exposure & Documentation: This platform holds accountable men who harass, stalk, exploit, or abuse legal gaps, without storing your private data on your phone. Accountability has started.\n\n" #
        "Female Accountability: To all women who have hidden, deleted, or dropped complaints or have tolerated scary or intimidating behavior due to fear, lack of proof, or worry about 'legal loopholes,' this is the answer.\n" #
        "No more ignoring or deleting proof out of fear.\n\n" #
        "Male Accountability: To all men, predators, manipulators, offenders, and 'innocent bystanders,' this is your sign.\n" #
        "With all evidence, content, photos, phone records, and vehicle details finally being documented, it is the end for manipulation, threats, and exploitation.\n\n" #
        "Professional Profile: Every account is validated, checked, and protected.\n\n" #
        "No More Manipulation: This app changes everything. For your own protection: install it and send this message to trusted friends and family.\n\n" #
        "Install for FREE at `https://reporther-2cs.caffeine.xyz.\n`";
      };
    };
  };

  public shared ({ caller }) func generateMessage(
    incidentId : Text,
    tone : MessageTone,
    intensity : ?ToneIntensity,
  ) : async GeneratedMessage {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate messages");
    };

    let incident = switch (incidents.get(incidentId)) {
      case (null) { Runtime.trap("Incident not found") };
      case (?incident) {
        if (incident.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only generate messages for your own incidents");
        } else {
          incident;
        };
      };
    };
    let stalkerProfile = stalkerProfiles.get(caller);
    let messageText = composeMessage(incident, stalkerProfile, tone, intensity);

    messageCounter += 1;
    let messageId = messageCounter;

    let message : GeneratedMessage = {
      id = messageId;
      timestamp = Time.now();
      incidentId;
      tone;
      intensity;
      content = messageText;
    };

    messages.add(messageId, message);
    message;
  };

  func composeMessage(incident : IncidentReport, _stalkerProfile : ?StalkerProfile, tone : MessageTone, intensity : ?ToneIntensity) : Text {
    let basicInfo = "Incident Details\n" #
    "- Location: " # incident.location # "\n" #
    "- Description: " # incident.description # "\n" #
    "- Evidence Notes: " # incident.evidenceNotes # "\n" #
    "- Additional Notes: " # incident.additionalNotes # "\n" #
    "- Report Number: " # incident.criminalActivityReportNumber # "\n";

    switch (tone) {
      case (#directWarning) {
        let warning = switch (intensity) {
          case (?#calm) {
            "Calm Warning\n" #
            "----------------------\n" #
            "Please be aware that your actions have been reported. This serves as an official notification. All evidence collected has been documented for legal purposes.\n" #
            "Take this as a warning to change your behavior. If incidents persist, the information will be provided to law enforcement. This matter can be resolved peacefully if no further misconduct occurs.\n" #
            "Protect yourself and others by practicing accountability. Continued reports will result in legal consequences and loss of reputation. Use this opportunity to make better choices.\n";
          };
          case (?#firm) {
            "Firm Warning\n" #
            "----------------------\n" #
            "You have been formally notified that your documented history of predatory, harassing, and illicit behavior has been submitted to the authorities and this platform. All legal loopholes and your repeated incidents have been mapped and analyzed, revealing patterns that highlight your attempts to exploit the legal system and maintain false innocence.\n" #
            "You must immediately cease your manipulative and criminal conduct. Your past attempts to minimize your actions and hide behind legal technicalities are fully documented. If this behavior continues, we are prepared to take direct legal action and pursue the maximum charges against you.\n" #
            "Your actions will no longer remain hidden or ignored. This is your final warning: change your behavior, take full responsibility, and stop all predatory activities. We have compiled overwhelming evidence and are ready to permanently expose your illegal and harmful actions.\n";
          };
          case (?#severe) {
            "Severe Warning\n" #
            "----------------------\n" #
            "You are facing a formal ultimatum from this platform and legal representatives. Your manipulative, predatory, and illicit behavior has been documented across multiple cases. We have filed and escalated your records to ensure you face the maximum possible legal and social consequences.\n" #
            "If your actions persist, you will face immediate, permanent legal action. Your attempts to exploit the legal system and maintain a facade of innocence will be publicly exposed. We are prepared to use all available resources to bring you to justice.\n" #
            "This is your last warning. Cooperate fully, change your behavior, and take immediate steps to prove your accountability. Continued illegal and harmful actions will result in criminal charges and significant consequences for you.\n";
          };
          case (?#veryHarsh) {
            "Ultimate Warning\n" #
            "----------------------\n" #
            "You are now officially and permanently labeled as a predator, manipulator, and criminal on this platform and within the legal system of this platform and law firm. We have completed a full analysis of your illegal and abusive behavior patterns, uncovering your repeated attempts to exploit legal loopholes.\n" #
            "Your continued efforts to hide behind technicalities have been systematically eliminated. Every aspect of your actions is now fully traceable and transparent, preventing any future manipulation or concealment. Your ongoing denial and avoidance only jeopardizes your legal standing.\n" #
            "Your attempts to minimize and hide the severity of these incidents have only confirmed your criminal intent. The undeniable evidence against you will follow you permanently, with the documentation timestamped and preserved for official investigations.\n" #
            "This is a permanent record of your actions. Further misconduct will lead to the complete and irreversible destruction of your legal and social reputation. We are prepared to enforce the strictest legal measures available to hold you fully accountable.\n";
          };
          case (null) {
            "Standard Warning\n" #
            "----------------------\n" #
            "You have been formally notified that your actions have been reported. Further legal action will be taken if this behavior persists. All evidence has been submitted for verification, and your details have been documented.\n" #
            "There are no more loopholes or excuses. End this behavior now to avoid prosecution.\n";
          };
        };
        warning # "\n" # basicInfo;
      };
      case (#formalEvidence) {
        "Formal Notification\n" #
        "----------------------\n" #
        "You are receiving this official incident report for legal documentation purposes. The information provided has been submitted as evidence for investigative and compliance reasons. Please retain this document for your records.\n" #
        basicInfo #
        "If further information or clarification is needed regarding this report, contact the original submitter directly for official verification of the provided evidence and statements. All documentation has been timestamped and authenticated through the system, providing additional validation for investigative use.\n";
      };
      case (#documentationNotice) {
        "Documentation Notice\n" #
        "----------------------\n" #
        basicInfo #
        "This message serves as a timestamped, documented record of the incident. All actions and communication related to this matter are permanently stored for legal and historical reference. If you need to verify any of the details or require proof of submission, the original submitter can confirm as both a legal representative and the owner.\n";
      };
    };
  };

  public shared ({ caller }) func findNearestPoliceDepartment(address : Text) : async ?PoliceDepartment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search for police departments");
    };
    // Attempt to match address by city, state, or zip code
    var bestMatch : ?PoliceDepartment = null;
    var bestScore = 0;

    for ((_, dept) in policeDepartments.entries()) {
      let score = calculateSimilarityScore(address, dept.city # " " # dept.state # " " # dept.zipCode);
      if (score > bestScore) {
        bestScore := score;
        bestMatch := ?dept;
      };
    };

    bestMatch;
  };

  func calculateSimilarityScore(address : Text, comparison : Text) : Nat {
    let a = address.toLower().toArray();
    let b = comparison.toLower().toArray();
    let maxLength = if (a.size() > b.size()) { a.size() } else { b.size() };

    var matches = 0;
    let len = if (a.size() > b.size()) { b.size() } else { a.size() };
    for (i in Nat.range(0, len)) {
      if (a[i] == b[i]) {
        matches += 1;
      };
    };

    if (maxLength == 0) {
      0;
    } else {
      (matches * 100) / maxLength;
    };
  };

  public query ({ caller }) func getNearestPoliceDepartmentsToAddress(term : Text) : async [PlaceCandidate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search for police departments");
    };
    switch (cachedAddresses.get(term)) {
      case (null) { [] };
      case (?places) { places };
    };
  };

  public query ({ caller }) func getNearestAddresses(searchTerm : Text) : async [AddressPlaceCandidate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search for addresses");
    };
    switch (cachedAddresses.get(searchTerm)) {
      case (null) { [] };
      case (?places) { [{ formattedAddress = searchTerm; placeCandidates = places }] };
    };
  };

  // Motivational video access - only for authenticated users
  public query ({ caller }) func getMotivationalVideoAccess() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access motivational content");
    };
    // Return true if user is authenticated
    true;
  };

  public query ({ caller }) func getMotivationalVideoStorageId() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access motivational video");
    };
    // Return the storage ID for the motivational video
    motivationalVideoStorageId;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveIncident(
    location : Text,
    description : Text,
    evidenceNotes : Text,
    additionalNotes : Text,
  ) : async IncidentReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save incidents");
    };

    let now = Time.now();
    incidentCounter += 1;
    let carNumber = generateCarNumberInternal(incidentCounter, now);

    let incident : IncidentReport = {
      id = carNumber;
      timestamp = now;
      user = caller;
      incidentDate = now;
      criminalActivityReportNumber = carNumber;
      location;
      description;
      evidenceNotes;
      additionalNotes;
    };

    incidents.add(carNumber, incident);

    let userIncidentList = switch (userIncidents.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };
    userIncidents.add(caller, [carNumber].concat(userIncidentList));

    incident;
  };

  public query ({ caller }) func getAllIncidents() : async [IncidentReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view incidents");
    };

    let userIncidentList = switch (userIncidents.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };

    userIncidentList.map<Text, IncidentReport>(
      func(id) {
        switch (incidents.get(id)) {
          case (?incident) { incident };
          case (null) { Runtime.trap("Incident not found") };
        };
      }
    );
  };

  public query ({ caller }) func getIncident(id : Text) : async ?IncidentReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view incidents");
    };

    switch (incidents.get(id)) {
      case (null) { null };
      case (?incident) {
        if (incident.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own incidents");
        };
        ?incident;
      };
    };
  };

  public shared ({ caller }) func saveStalkerProfile(profile : StalkerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save stalker profiles");
    };
    stalkerProfiles.add(caller, profile);
  };

  public query ({ caller }) func getStalkerProfile() : async ?StalkerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stalker profiles");
    };
    stalkerProfiles.get(caller);
  };

  public shared ({ caller }) func saveMultipleStalkerProfile(profile : StalkerProfile) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save stalker profiles");
    };

    stalkerProfileCounter += 1;
    let profileId = stalkerProfileCounter;

    let userProfiles = switch (multipleStalkerProfiles.get(caller)) {
      case (null) { Map.empty<Nat, StalkerProfile>() };
      case (?profiles) { profiles };
    };

    userProfiles.add(profileId, profile);
    multipleStalkerProfiles.add(caller, userProfiles);

    profileId;
  };

  public query ({ caller }) func getAllStalkerProfiles() : async [(Nat, StalkerProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stalker profiles");
    };

    switch (multipleStalkerProfiles.get(caller)) {
      case (null) { [] };
      case (?profiles) {
        profiles.entries().toArray();
      };
    };
  };

  public shared ({ caller }) func updateStalkerProfile(profileId : Nat, profile : StalkerProfile) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update stalker profiles");
    };

    switch (multipleStalkerProfiles.get(caller)) {
      case (null) { false };
      case (?profiles) {
        switch (profiles.get(profileId)) {
          case (null) { false };
          case (?_) {
            profiles.add(profileId, profile);
            multipleStalkerProfiles.add(caller, profiles);
            true;
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteStalkerProfile(profileId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete stalker profiles");
    };

    switch (multipleStalkerProfiles.get(caller)) {
      case (null) { false };
      case (?profiles) {
        switch (profiles.get(profileId)) {
          case (null) { false };
          case (?_) {
            profiles.remove(profileId);
            multipleStalkerProfiles.add(caller, profiles);
            true;
          };
        };
      };
    };
  };

  public shared ({ caller }) func saveVictimProfile(profile : VictimProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save victim profiles");
    };
    victimProfiles.add(caller, profile);
  };

  public query ({ caller }) func getVictimProfile() : async ?VictimProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view victim profiles");
    };
    victimProfiles.get(caller);
  };

  public query ({ caller }) func getMessagesForIncident(incidentId : Text) : async [GeneratedMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    switch (incidents.get(incidentId)) {
      case (null) { [] };
      case (?incident) {
        if (incident.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view messages for your own incidents");
        };

        let allMessages = messages.values().toArray();
        allMessages.filter(
          func(msg : GeneratedMessage) : Bool {
            msg.incidentId == incidentId;
          }
        );
      };
    };
  };

  public shared ({ caller }) func uploadEvidence(
    incidentId : Text,
    storageId : Text,
    originalFilename : Text,
    fileType : Text,
    fileSize : Nat,
  ) : async EvidenceMeta {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload evidence");
    };

    switch (incidents.get(incidentId)) {
      case (null) {
        Runtime.trap("Incident not found");
      };
      case (?incident) {
        if (incident.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only upload evidence for your own incidents");
        };

        evidenceCounter += 1;
        let evidenceId = evidenceCounter;

        let evidence : EvidenceMeta = {
          id = evidenceId;
          uploadedBy = caller;
          storageId;
          originalFilename;
          fileType;
          fileSize;
          uploadTimestamp = Time.now();
        };

        evidenceStore.add(evidenceId, evidence);

        let evidenceList = switch (incidentEvidence.get(incidentId)) {
          case (null) { [] };
          case (?list) { list };
        };
        incidentEvidence.add(incidentId, [evidenceId].concat(evidenceList));

        evidence;
      };
    };
  };

  public query ({ caller }) func getEvidenceForIncident(incidentId : Text) : async [EvidenceMeta] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view evidence");
    };

    switch (incidents.get(incidentId)) {
      case (null) { [] };
      case (?incident) {
        if (incident.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view evidence for your own incidents");
        };

        let evidenceList = switch (incidentEvidence.get(incidentId)) {
          case (null) { [] };
          case (?list) { list };
        };

        evidenceList.map<Nat, EvidenceMeta>(
          func(id) {
            switch (evidenceStore.get(id)) {
              case (?evidence) { evidence };
              case (null) { Runtime.trap("Evidence not found") };
            };
          }
        );
      };
    };
  };

  public shared ({ caller }) func logPoliceSubmission(
    department : PoliceDepartment,
    submissionResult : Text,
    attachedEvidence : [EvidenceMeta],
    victimInfoIncluded : Bool,
    victimInfo : ?VictimProfile,
    includedSummary : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log police submissions");
    };

    let log : PoliceSubmissionLog = {
      timestamp = Time.now();
      department;
      submissionResult;
      attachedEvidence;
      victimInfoIncluded;
      victimInfo;
      includedSummary;
    };

    let logList = switch (policeSubmissionLogs.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };
    policeSubmissionLogs.add(caller, [log].concat(logList));
  };

  public query ({ caller }) func getPoliceSubmissionLogs() : async [PoliceSubmissionLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view police submission logs");
    };

    switch (policeSubmissionLogs.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };
  };

  public shared ({ caller }) func logSmsUsage(
    incidentId : Text,
    messageId : Nat,
    messageContent : Text,
    recipient : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log SMS usage");
    };

    switch (incidents.get(incidentId)) {
      case (null) {
        Runtime.trap("Incident not found");
      };
      case (?incident) {
        if (incident.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only log SMS for your own incidents");
        };

        let log : SmsLog = {
          timestamp = Time.now();
          incidentId;
          messageId;
          messageContent;
          recipient;
          confirmation = true;
        };

        let logList = switch (smsLogs.get(caller)) {
          case (null) { [] };
          case (?list) { list };
        };
        smsLogs.add(caller, [log].concat(logList));
      };
    };
  };

  public query ({ caller }) func getSmsLogs() : async [SmsLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view SMS logs");
    };

    switch (smsLogs.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };
  };

  public query ({ caller }) func generateIncidentSummary() : async IncidentSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate incident summaries");
    };

    let userIncidentList = switch (userIncidents.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };

    let timelineItems : [IncidentSummaryItem] = userIncidentList.map<Text, IncidentSummaryItem>(
      func(id : Text) : IncidentSummaryItem {
        switch (incidents.get(id)) {
          case (?incident) {
            let evidence = switch (incidentEvidence.get(id)) {
              case (null) { [] };
              case (?evidenceList) {
                evidenceList.map(
                  func(evidenceId : Nat) : EvidenceMeta {
                    switch (evidenceStore.get(evidenceId)) {
                      case (?evidence) { evidence };
                      case (null) { Runtime.trap("Evidence not found") };
                    };
                  }
                );
              };
            };

            let allMessages = messages.values().toArray();
            let incidentMessages = allMessages.filter(
              func(msg : GeneratedMessage) : Bool {
                msg.incidentId == id;
              }
            );

            let messageSummaries : [IncidentMessageSummary] = incidentMessages.map<GeneratedMessage, IncidentMessageSummary>(
              func(msg : GeneratedMessage) : IncidentMessageSummary {
                {
                  id = msg.id;
                  incidentId = msg.incidentId;
                  tone = msg.tone;
                  intensity = msg.intensity;
                  content = msg.content;
                  incidentTimestamp = incident.timestamp;
                  location = incident.location;
                };
              }
            );

            {
              id = incident.id;
              timestamp = incident.timestamp;
              location = incident.location;
              description = incident.description;
              evidence;
              messages = messageSummaries;
            };
          };
          case (null) {
            Runtime.trap("Incident not found");
          };
        };
      }
    );

    let patternAnalysis : PatternAnalysis = {
      patterns = [];
      locations = [];
      severityPatterns = [];
    };

    let totalAnalysis : Totals = {
      incidentCount = timelineItems.size();
      evidenceCount = 0;
      messageCount = 0;
    };

    {
      timelineItems;
      patternAnalysis;
      totalAnalysis;
      messageHistory = [];
    };
  };

  public shared ({ caller }) func savePoliceDepartment(department : PoliceDepartment) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save police departments");
    };

    policeDepartmentCounter += 1;
    let deptId = policeDepartmentCounter;

    policeDepartments.add(deptId, department);

    deptId;
  };

  public query ({ caller }) func getAllPoliceDepartments() : async [(Nat, PoliceDepartment)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view police departments");
    };

    policeDepartments.toArray();
  };

  public shared ({ caller }) func updatePoliceDepartment(deptId : Nat, department : PoliceDepartment) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update police departments");
    };

    switch (policeDepartments.get(deptId)) {
      case (null) { false };
      case (?_) {
        policeDepartments.add(deptId, department);
        true;
      };
    };
  };

  public shared ({ caller }) func deletePoliceDepartment(deptId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete police departments");
    };

    switch (policeDepartments.get(deptId)) {
      case (null) { false };
      case (?_) {
        policeDepartments.remove(deptId);
        true;
      };
    };
  };

  // Transform function for HTTP outcalls - must be public for system access
  // This is a required exception to authentication as it's called by the IC system
  // during HTTP outcall processing, not by end users
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
