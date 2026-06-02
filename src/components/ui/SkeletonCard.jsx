import React from "react";

export const SkeletonCard = ({ lines = 3, className = "" }) => (
  <div className={`card p-5 space-y-3 ${className}`}>
    <div className="skeleton h-4 w-2/3 rounded" />
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <div key={i} className={`skeleton h-3 rounded ${i === lines - 2 ? "w-1/2" : "w-full"}`} />
    ))}
  </div>
);

export const SkeletonMetric = ({ className = "" }) => (
  <div className={`card p-5 space-y-3 ${className}`}>
    <div className="skeleton h-3 w-1/3 rounded" />
    <div className="skeleton h-8 w-2/3 rounded" />
    <div className="skeleton h-3 w-1/4 rounded" />
  </div>
);

export const SkeletonWorkItem = ({ className = "" }) => (
  <div className={`card p-5 space-y-3 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-5 w-20 rounded-full" />
    </div>
    <div className="skeleton h-3 w-full rounded" />
    <div className="skeleton h-3 w-4/5 rounded" />
    <div className="flex gap-2 pt-1">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  </div>
);

export const SkeletonNFT = ({ className = "" }) => (
  <div className={`card p-5 space-y-4 ${className}`}>
    <div className="skeleton h-48 w-full rounded-xl" />
    <div className="skeleton h-4 w-2/3 rounded" />
    <div className="flex gap-2">
      <div className="skeleton h-6 w-24 rounded-full" />
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  </div>
);

export default SkeletonCard;
