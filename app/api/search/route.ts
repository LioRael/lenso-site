import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const dynamic = 'force-static';
// The index contains both English and Chinese documents. Fumadocs' default
// multilingual tokenizer is intentionally used so one language cannot make
// the other unsearchable.
export const { staticGET: GET } = createFromSource(source);
