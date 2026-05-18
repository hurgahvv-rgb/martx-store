export function shouldSkipDatabaseReads() {
  return process.env.USE_DATABASE_PRODUCTS !== "true";
}
