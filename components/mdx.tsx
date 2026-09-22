import defaultMdxComponents from 'fumadocs-ui/mdx';
import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';

function CardGroup({ children }: { children: ReactNode }) {
  return <div className="mdx-card-group">{children}</div>;
}

function Card({ title, href, description }: { title: string; href: string; description?: string }) {
  return (
    <Link className="mdx-card" href={href}>
      <strong>{title}</strong>
      {description ? <span>{description}</span> : null}
    </Link>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="mdx-steps">{children}</ol>;
}

function Step({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

export function getMDXComponents(components?: MDXComponents) {
  return { ...defaultMdxComponents, CardGroup, Card, Steps, Step, ...components } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
