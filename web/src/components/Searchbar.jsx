"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { TMDB_CONFIG } from "@/lib/tmdb";

export default function Searchbar({ placeholder = "Rechercher un film ou une série...", onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const abortRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const handle = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const url = `${TMDB_CONFIG.BASE_URL}/search/multi?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR&query=${encodeURIComponent(
          query.trim()
        )}&page=1&include_adult=false`;

        const res = await fetch(url, { signal: abortRef.current.signal });
        if (!res.ok) throw new Error("Search request failed");
        const data = await res.json();

        const items = (data?.results || [])
          .filter((i) => i.media_type === "movie" || i.media_type === "tv")
          .slice(0, 8)
          .map((i) => ({
            id: i.id,
            title: i.title || i.name || "Sans titre",
            type: i.media_type, // movie | tv
            year: (i.release_date || i.first_air_date || "").slice(0, 4),
            poster: i.poster_path,
          }));

        setSuggestions(items);
        setIsOpen(true);
      } catch (e) {
        if (e?.name !== "AbortError") {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery("");
    if (onSelect) onSelect(item);
    const path = item.type === "movie" ? `/movie/${item.id}` : `/serie/${item.id}`;
    router.push(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
    if (e.key === "Escape") setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pr-10"
      />

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border border-input bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
          {isLoading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Chargement…</div>
          )}

          {!isLoading && suggestions.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent focus:bg-accent transition-colors"
            >
              <div className="h-10 w-7 shrink-0 rounded bg-muted overflow-hidden flex items-center justify-center">
                {item.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={item.title}
                    src={`https://image.tmdb.org/t/p/w92${item.poster}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-[10px] text-muted-foreground">N/A</div>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium leading-tight">
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.type === "movie" ? "Film" : "Série"}
                  {item.year ? ` • ${item.year}` : ""}
                </div>
              </div>
            </button>
          ))}

          {!isLoading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Aucun résultat</div>
          )}
        </div>
      )}
    </div>
  );
}


