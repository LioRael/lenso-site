import type { KeylessProvenance } from '../lib/plugin-candidates';
export function matchesVerifiedHead(head: unknown, provenance: KeylessProvenance): boolean;
export function confirmVerifiedHead(provenance: KeylessProvenance, fetcher?: typeof fetch): Promise<boolean>;
export function marketplaceCommand(command: string): string;
export function supportsLinkedAdoption(release: {
  integration: string;
  registryUrl: string;
  package: string;
  version: string;
}): boolean;
