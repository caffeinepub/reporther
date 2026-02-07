import Map "mo:core/Map";
import Principal "mo:core/Principal";
import PoliceDepartment "police-department";

module {
  // Old actor type
  type OldActor = {
    policeDepartments : Map.Map<Nat, PoliceDepartment.PoliceDepartment>;
  };

  // New actor type
  type NewActor = {
    policeDepartments : Map.Map<Nat, PoliceDepartment.PoliceDepartment>;
    userSelectedDepartments : Map.Map<Principal, PoliceDepartment.PoliceDepartment>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      userSelectedDepartments = Map.empty<Principal, PoliceDepartment.PoliceDepartment>()
    };
  };
};
