import cmp from 'semver-compare';

export function greaterOrEqual(a, b) {
  return cmp(a, b) !== -1;
}

export function toSemverMinor(executionPlatformVersion) {
  return executionPlatformVersion.split('.').slice(0, 2).join('.');
}