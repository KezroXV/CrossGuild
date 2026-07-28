"use client";

import { Button } from "./ui/button";

export default function ProductActions() {
  return (
    <div className="mt-4 flex justify-center gap-2">
      <Button className="bg-accent px-4 py-2 text-sm shadow-md">Buy Now</Button>
      <Button
        variant="outline"
        className="px-4 py-2 border-primary border-2 hover:text-white text-sm shadow-md"
        onClick={() => window.history.back()}
      >
        Go Back
      </Button>
    </div>
  );
}
