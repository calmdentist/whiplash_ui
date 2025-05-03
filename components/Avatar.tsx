'use client';

import * as React from 'react';
import { twMerge } from 'tailwind-merge';

type AvatarProps = {
  publicKey?: string;
  src?: string;
  alt?: string;
  size?: number;
  wrapperClass?: string;
};

/**
 * A simple avatar component that displays a colored circle with initials
 * if no image is provided
 */
export function Avatar({
  publicKey,
  src,
  alt = 'Avatar',
  size = 40,
  wrapperClass,
}: AvatarProps) {
  // Generate a color based on publicKey or default to a purple gradient
  const getBackgroundColor = () => {
    if (!publicKey) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    
    // Simple hash function to generate a color
    const hash = publicKey
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-green-500',
      'bg-yellow-500',
    ];
    
    return colors[hash % colors.length];
  };
  
  // Get initials from publicKey or use fallback
  const getInitials = () => {
    if (!publicKey) return '??';
    return publicKey.slice(0, 2).toUpperCase();
  };
  
  if (src) {
    return (
      <div
        className={twMerge(
          'overflow-hidden rounded-full border border-gray-700',
          wrapperClass
        )}
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }
  
  return (
    <div
      className={twMerge(
        `flex items-center justify-center rounded-full text-white ${getBackgroundColor()}`,
        wrapperClass
      )}
      style={{ 
        width: size, 
        height: size,
        fontSize: size / 2.5
      }}
    >
      {getInitials()}
    </div>
  );
} 