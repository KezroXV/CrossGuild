"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortSelectProps {
  sortOption: string;
}

export default function SortSelect({ sortOption }: SortSelectProps) {
  const router = useRouter();

  return (
    <Select
      value={sortOption}
      onValueChange={(value) => {
        const url = new URL(window.location.href);
        url.searchParams.set("sort", value);
        router.push(url.pathname + url.searchParams.toString());
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="top-selling">Best Selling</SelectItem>
        <SelectItem value="rating">Highest Rated</SelectItem>
      </SelectContent>
    </Select>
  );
}
