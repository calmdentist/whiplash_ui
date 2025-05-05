"use client";
import * as React from "react";
import * as RxAvatar from "@radix-ui/react-avatar";
import BoringAvatar from "boring-avatars";
import { twMerge } from "tailwind-merge";

const getAvatarColorPalette = (publicKey: string) => {
  // Simple hash function to generate consistent colors
  const hash = publicKey.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colors = [
    ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'],
    ['#FF9999', '#99FF99', '#9999FF', '#FFFF99', '#FF99FF'],
    ['#FFB347', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C'],
    ['#E6E6FA', '#FFA07A', '#98FB98', '#87CEEB', '#DDA0DD'],
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

type AvatarProps = (
  | {
      publicKey: string;
      src?: never;
      alt?: never;
    }
  | {
      publicKey?: never;
      src: string;
      alt: string;
    }
) & {
  size: number;
  wrapperClass?: string;
  fallbackComponent?: React.ReactNode;
};

export function Avatar(props: AvatarProps) {
  const {
    publicKey,
    src,
    alt,
    size,
    fallbackComponent: userFallbackComponent,
    wrapperClass,
  } = props;

  if (publicKey) {
    return (
      <div
        className={twMerge(
          "m-2 border border-transparent",
          wrapperClass && wrapperClass,
        )}
      >
        <BoringAvatar
          size={size}
          name={publicKey}
          variant="marble"
          colors={getAvatarColorPalette(publicKey)}
        />
      </div>
    );
  }

  const fallback = (
    <div
      className={twMerge(
        "border-primary-800 from-primary-900/0 to-primary-900 rounded-full border bg-gradient-to-b text-[0]",
        wrapperClass,
      )}
      style={{ height: size }}
    >
      Image not available
    </div>
  );

  const renderFallback = userFallbackComponent
    ? userFallbackComponent
    : fallback;

  return (
    <RxAvatar.Root className="inline-block">
      {src ? (
        <div
          className={twMerge(
            "border-primary-900 bg-primary-950 rounded-full border p-2",
            wrapperClass,
          )}
        >
          <img
            src={src}
            alt={alt}
            width={size}
            className="aspect-square rounded-full"
          />
        </div>
      ) : (
        <RxAvatar.Fallback>{renderFallback}</RxAvatar.Fallback>
      )}
    </RxAvatar.Root>
  );
} 