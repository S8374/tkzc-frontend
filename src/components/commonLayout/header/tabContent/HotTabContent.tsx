// HotTabCOntent.tsx
"use client";

import { useState, useMemo } from "react";
import ItemsCard from "@/components/reUseAbleItems/ItemsCard";
import SearchField from "@/components/reUseAbleItems/SearchField";
import { gameItems } from "@/lib/data";

const HotTabCOntent = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items by type AND search query
  const filteredItems = useMemo(() => {
    return gameItems.filter((item) => {
      const matchesType = !selectedType || item.type === selectedType;
      const matchesSearch = !searchQuery 
        || item.title.toLowerCase().includes(searchQuery.toLowerCase())
        || item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [selectedType, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto">
      <SearchField
        onSearch={(q) => setSearchQuery(q)}
        className="mb-6"
      />

      <ItemsCard
        items={filteredItems}
        title="Lottery Games"
        rounded={true}
        icon="🔥"
        cardWidth={{ base: "140px", sm: "140px", md: "160px" }}
        cardHeight="160px"
        spaceBetween={12} // ← now fixed via gap-3
      />
    </div>
  );
};

export default HotTabCOntent;