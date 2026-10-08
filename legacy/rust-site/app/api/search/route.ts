import { source } from '@/lib/source';
import { frameworkDocIdentity } from '@/lib/framework-docs';
import { createFromSource } from 'fumadocs-core/search/server';

export const dynamic = 'force-static';
// The index contains both English and Chinese documents. Fumadocs' default
// multilingual tokenizer is intentionally used so one language cannot make
// the other unsearchable.
export const { staticGET: GET } = createFromSource(source, {
  buildIndex: async (page) => {
    const identity = await frameworkDocIdentity(page);
    return {
      id: page.url,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      structuredData: page.data.structuredData,
      tag: [`channel:${identity.channel}`, `locale:${identity.locale}`, `revision:${identity.revision}`],
    };
  },
});
