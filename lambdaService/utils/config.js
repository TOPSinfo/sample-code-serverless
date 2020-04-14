// export const dbConfig = {
//   host: "spot-me-db-instance.cdnduxceh2ya.us-east-1.rds.amazonaws.com",
//   port: 5432,
//   user: "spotmedev",
//   password: "spotme?123",
//   database: "spot_me"
// };

export const dbConfig = async stage => {
  switch (stage) {
    case "prod":
      return {
        host:
          "spot-me-db-prod-instance.cdnduxceh2ya.us-east-1.rds.amazonaws.com",
        port: 5432,
        user: "spotmeprod",
        password: "spotme?123",
        database: "spot_me"
      };
    case "qa":
      return {
        host: "spot-me-db-qa-instance.cdnduxceh2ya.us-east-1.rds.amazonaws.com",
        port: 5432,
        user: "spotmeqa",
        password: "spotme?123",
        database: "spot_me"
      };
    default:
      return {
        host: "spot-me-db-instance.cdnduxceh2ya.us-east-1.rds.amazonaws.com",
        port: 5432,
        user: "spotmedev",
        password: "spotme?123",
        database: "spot_me"
      };
  }
};

export const s3Bucket = stage => {
  switch (stage) {
    case "prod":
      return "spot-me-user-image-prod";
    case "qa":
      return "spot-me-user-image-qa";
    default:
      return "spot-me-user-image";
  }
};

export const s3BucketUrl = stage => {
  switch (stage) {
    case "prod":
      return "https://spot-me-user-image-prod.s3.amazonaws.com/";
    case "qa":
      return "https://spot-me-user-image-qa.s3.amazonaws.com/";
    default:
      return "https://spot-me-user-image.s3.amazonaws.com/";
  }
};

export const s3Access = {
  accessKeyId: "AKIAZUJATGDNYJNWRZG6",
  secretAccessKey: "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"
};

export const messages = {
  loginSuccess: "Verification code sent successfully",
  deviceTokenRequired: "Device token required",
  verificationCodeSuccess: "Verification code verified successfully",
  invalidCode: "Invalid Verification code",
  invalidUserId: "User Does not exist",
  logoutSuccess: "Logged out successfully",
  unAuthorizedUser: "User is not authorized",
  deleteEventError: "Only admin can delete this event",
  deleteEventSuccess: "Event deleted successfully",
  invalidEventId: "Event does not exist",
  getEventByIdSuccess: "Selected event fetched Successfully",
  eventListSuccess: "List fetched successfully",
  eventUpdateSuccess: "Event updated successfully",
  addGroupMemberSuccess: "Member added in group successfully",
  invalidGroupId: "Group does not exist",
  groupCreateSuccess: "Group created successfully",
  groupDeleteSuccess: "Group deleted successfully",
  groupExitSuccess: "Exited from group successfully",
  groupRemoveSuccess: "User removed from group successfully",
  groupRemoveError: "Only admin can remove user from group",
  singleGroupAdminCase: "Please make another user an admin of this group",
  notPublicEvent: "This is not a public event",
  listGroupMemberSuccess: "Group members fetched successfully",
  listGroupSuccess: "Groups fetched successfully",
  creatorOfEvent: "Cannot revoke admin rights from event creator",
  changingRoleSuccess: "Roles updated successfully",
  alreadyAdmin: "User is already an admin",
  groupUpdateSuccess: "Group details updated successfully",
  getLastVisitedScreenSuccess: "Last visited screen fetched successfully",
  getUserProfileSuccess: "User Profile fetched successfully",
  updateLastScreenSuccess: "Updated last visited screen successfully",
  updateUserSuccess: "User profile updated successfully",
  createMeetSuccess: "Event Meet created successfully",
  meetAlreadyExist: "Event meet already exist on this location",
  deleteMeetSuccess: "Event meet deleted successfully",
  deleteMeetFailure: "You are not authorized to delete meet",
  updateMeetSuccess: "Event Meet updated successfully",
  updateMeetFailure: "You are not authorized to update meet",
  updateMeetValidation: "Meet already exist on particular location",
  addPoiSuccess: "Event P.O.I. created successfully",
  listMeetPoiSuccess: "Meet and P.O.I. list fetched successfully",
  deletePOISuccess: "Event P.O.I. deleted successfully",
  updatePOISuccess: "Event P.O.I. updated successfully",
  updatePOIFailure: "You are not authorized to update P.O.I.",
  updatePOIValidation: "P.O.I. already exist on particular location",
  acceptMeetSuccess: "Meet accepted successfully",
  rejectMeetSuccess: "Meet rejected successfully",
  listActiveMemberSuccess: "List fetched successfully",
  listMemberLocationSuccess: "List fetched successfully",
  deleteMeetPOISuccess: "Event meet and P.O.I. deleted successfully",
  reachedMeetSuccess: "Reached to meet location successfully"
};
