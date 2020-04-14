// export const dbConfig = {
//   host: "spot-me-db-instance.cdnduxceh2ya.us-east-1.rds.amazonaws.com",
//   port: 5432,
//   user: "spotmedev",
//   password: "spotme?123",
//   database: "spot_me"
// };

export const dbConfig = async (stage) => {
  return {
    host: "test.us-east-1.rds.amazonaws.com",
    port: 5432,
    user: "testdev",
    password: "test?123",
    database: "test",
  };
};

export const s3Bucket = (stage) => {
  return "test";
};

export const s3BucketUrl = () => {
  return "https://test.s3.amazonaws.com/";
};

export const s3Access = {
  accessKeyId: "dsdsad",
  secretAccessKey: "dsadsaewiwqjljsaldslasadsadsa",
};

export const messages = {
  unAuthorizedUser: "User is not authorized",
  deleteUserSuccess: "User deleted successfully",
  getUserProfileSuccess: "User Profile fetched successfully",
  invalidUserId: "User Does not exist",
  updateLastVisitedScreen: "Last visited screen updated successfully",
  updateUserSuccess: "User profile updated successfully",
};
