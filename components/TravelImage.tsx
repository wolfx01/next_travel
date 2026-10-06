"use client";

import type { ImgHTMLAttributes } from 'react';

const fallback = '/images/destination-placeholder.svg';

export default function TravelImage({ src, alt, onError, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} src={src || fallback} alt={alt || ''} onError={(event) => {
    onError?.(event);
    const image = event.currentTarget;
    if (image.getAttribute('src') !== fallback) {
      image.srcset = '';
      image.src = fallback;
    }
  }} />;
}
