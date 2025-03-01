import React from "react";
import { Button } from "./ui/button";

const searchBar = () => {
  return (
    <div className="relative">
      <input type="text" placeholder="Search" className="p-2 rounded-md" />
      <Button variant="ghost" className="absolute right-2 top-1">
        🔍
      </Button>
    </div>
  );
};

export default searchBar;
