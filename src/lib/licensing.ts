// No implicit API: a missing or unsafe build setting leaves the forms unavailable.
export function licensingBase(value?: string, development = false): string {
  const match = value?.match(/^https:\/\/[a-z0-9]{10}\.execute-api\.ap-northeast-1\.amazonaws\.com\/(production|staging)\/?$/);
  return match && (match[1] === 'production' || development) ? value!.replace(/\/$/, '') : '';
}
