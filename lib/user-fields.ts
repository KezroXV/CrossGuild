/**
 * Map frontend user fields to database field names
 * This helps handle cases where field names might be different
 * between code and database
 */
export const mapUserFields = (user: any) => {
  // Create a mapped user object that ensures consistent field naming
  const mappedUser = { ...user };

  // Map phoneNumber to phone if needed
  if (user.phoneNumber !== undefined && user.phone === undefined) {
    mappedUser.phone = user.phoneNumber;
    delete mappedUser.phoneNumber;
  }

  // Add other field mappings as needed

  return mappedUser;
};

/**
 * Map database user fields to frontend field names
 */
export const mapDatabaseUserToFrontend = (dbUser: any) => {
  const frontendUser = { ...dbUser };

  // Other mappings if needed in the future

  return frontendUser;
};
