"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const PLACEHOLDER = "/images/placeholder-watch.svg";

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
};

export default function ProductImage({ src, ...props }: ProductImageProps) {
  const [errored, setErrored] = useState(false);

  return (
    <Image
      {...props}
      src={errored || !src ? PLACEHOLDER : src}
      unoptimized
      onError={() => setErrored(true)}
    />
  );
}
