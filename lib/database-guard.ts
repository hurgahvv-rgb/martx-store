export function shouldSkipDatabaseReads() {
  return process.env.NEXT_PHASE === "phase-production-build" || process.env.SKIP_DATABASE_READS === "true";
}
