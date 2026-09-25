export function isNativeTarget(target: string) {
  return /-(?:apple-darwin|unknown-linux-gnu|pc-windows-msvc)$/.test(target);
}

export function npmTargetMatches(distributions: readonly { targets: readonly string[] }[], target?: string) {
  if (distributions.length === 0) return false;
  if (!target) return true;
  if (target === 'Native') {
    return distributions.some((distribution) => distribution.targets.length === 0
      || distribution.targets.some((value) => value === '*' || isNativeTarget(value)));
  }
  if (target === 'Workers') {
    return distributions.some((distribution) => distribution.targets.some((value) =>
      value === 'workers' || value === 'cloudflare-workers'));
  }
  return false;
}
