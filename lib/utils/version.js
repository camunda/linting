export function toSemverMinor(executionPlatformVersion) {
  return executionPlatformVersion.split('.').slice(0, 2).join('.');
}