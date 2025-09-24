"use client";
export default function Error({error}: {error: Error}) {
  return <div className="alert alert-error">Error: {error.message}</div>;
}
