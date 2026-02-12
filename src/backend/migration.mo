import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    domesticViolenceJournals : Map.Map<Principal, { abuserName : Text; entries : [Record] }>;
    // Other state fields...
  };

  type Record = {
    timestamp : Int;
    timestampMs : Int;
    entry : Text;
  };

  type NewActor = {
    domesticViolenceJournals : Map.Map<Principal, { abuserName : Text; entries : [Record] }>;
    // Other state fields...
  };

  public func run(old : OldActor) : NewActor {
    // No changes needed as state is already persistent
    old;
  };
};
