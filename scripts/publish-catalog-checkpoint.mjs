import { checkpointConfig, publishCheckpointCandidate } from './catalog-checkpoint-files.mjs';

const config = checkpointConfig(process.env, Boolean(
  process.env.LENSO_MARKETPLACE_LINKED_CARGO_URL || process.env.LENSO_MARKETPLACE_PORTABLE_URL
    || process.env.LENSO_MARKETPLACE_PACKAGE_URL,
));
if (config) {
  await publishCheckpointCandidate(config, process.env.LENSO_MARKETPLACE_CATALOG_ID);
  console.log(`Site checkpoint candidate written to ${config.output}; persist as next INPUT only after successful deployment.`);
}
