import type { AnchorHTMLAttributes, ImgHTMLAttributes } from 'react';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean;
};

export function Link({ href, ...props }: LinkProps) {
  return <a href={href} {...props} />;
}

export function Image({ priority, ...props }: ImageProps) {
  return <img fetchPriority={priority ? 'high' : props.fetchPriority} {...props} />;
}
