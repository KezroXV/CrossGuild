export function logSecurityEvent(
  type: string,
  userId: string | null,
  metadata: Record<string, any>
) {
  console.log(`SECURITY EVENT: ${type}`, {
    timestamp: new Date().toISOString(),
    userId,
    ...metadata,
  });

  // In production you would send this to a proper logging system
  // like CloudWatch, Datadog, etc.
}
