import { checkpointConfig, publishCheckpointCandidate } from './catalog-checkpoint-files.mjs';
import { keylessCheckpointConfig, publishKeylessCheckpoint } from './keyless-checkpoint.mjs';

if (process.env.LENSO_MARKETPLACE_KEYLESS === '1') {
  await publishKeylessCheckpoint(keylessCheckpointConfig(process.env));
} else {

const config = checkpointConfig(process.env, Boolean(
  process.env.LENSO_MARKETPLACE_LINKED_CARGO_URL
  || process.env.LENSO_MARKETPLACE_PORTABLE_URL
  || process.env.LENSO_MARKETPLACE_PACKAGE_URL
  || process.env.LENSO_MARKETPLACE_RELEASE_CONTENT_URL,
));
if (config) {
  await publishCheckpointCandidate(config, process.env.LENSO_MARKETPLACE_CATALOG_ID);
  console.log(`Site checkpoint candidate written to ${config.output}; persist as next INPUT only after successful deployment.`);
}
}
