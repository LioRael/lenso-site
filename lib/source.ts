import { llms, loader } from 'fumadocs-core/source';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { frameworkDocIdentity } from './framework-docs';
import { docsRoute } from './shared';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: { includeProcessedMarkdown: true },
  },
  meta: { schema: metaSchema },
});

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
});

export const docsLlms = llms(source, {
  renderPage: async (page) => {
    const identity = await frameworkDocIdentity(page);
    return `---\ndocumentation_channel: ${identity.channel}\nframework_version: null\nlocale: ${identity.locale}\ncontent_revision: ${identity.revision}\ncanonical_url: ${identity.canonicalUrl}\n---\n\n# ${page.data.title} (${page.url})\n\n${await page.data.getText('processed')}`;
  },
});
