import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoLocationOutline } from "./icons";

/**
 * LocationInput — autocomplete using OpenStreetMap Nominatim API.
 *
 * Props:
 *   value       — current location name string
 *   lat         — current latitude
 *   lng         — current longitude
 *   onChange({ location, latitude, longitude })
 *   placeholder
 *   required
 */
export default function LocationInput({
  value = "",
  lat = "",
  lng = "",
  onChange,
  placeholder = "Search for a venue or address...",
  required = false,
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
    setSelected(!!value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback(async (q) => {
    if (!q || q.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    setSearching(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.features || []);
      setOpen(true);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(false);

    // Clear lat/lng while typing
    if (onChange) onChange({ location: val, latitude: "", longitude: "" });

    // Debounce API calls (400ms)
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const selectResult = (item) => {
    const props = item.properties || {};
    const coords = item.geometry?.coordinates || [];
    const name = buildDisplayName(props);
    const latitude = String(coords[1] || "");
    const longitude = String(coords[0] || "");

    setQuery(name);
    setSelected(true);
    setOpen(false);
    setResults([]);

    if (onChange) {
      onChange({ location: name, latitude, longitude });
    }
  };

  const clearSelection = () => {
    setQuery("");
    setSelected(false);
    setOpen(false);
    if (onChange) onChange({ location: "", latitude: "", longitude: "" });
  };

  // Build display name from Photon properties
  const buildDisplayName = (props) => {
    const parts = [
      props.name,
      props.street,
      props.housenumber ? `${props.housenumber}` : null,
      props.city || props.town || props.village || props.county,
      props.state,
      props.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Short label for dropdown
  const shortLabel = (item) => {
    const p = item.properties || {};
    return p.name || p.street || p.city || "Unknown";
  };

  // Secondary detail line
  const detailLine = (item) => {
    const p = item.properties || {};
    const parts = [
      p.street,
      p.city || p.town || p.village,
      p.state,
      p.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Type/category badge
  const typeLabel = (item) => {
    const p = item.properties || {};
    const type = p.type || p.osm_value || "";
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center border border-gray-200 rounded-md h-10 bg-white focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <span className="pl-3 text-stone-400">
          <IoLocationOutline className="text-base" />
        </span>
        <input
          value={query}
          onChange={handleInput}
          placeholder={placeholder}
          className="flex-1 px-2 py-2 bg-transparent text-sm outline-none placeholder:text-stone-400"
          autoComplete="off"
        />
        {required && !selected && (
          <span className="text-red-500 text-xs pr-2">*</span>
        )}
        {selected && (
          <button
            type="button"
            onClick={clearSelection}
            className="px-2 text-stone-400 hover:text-stone-600 text-xs"
          >
            ✕
          </button>
        )}
        {searching && (
          <span className="px-2 text-[11px] text-dashboard-muted">Searching...</span>
        )}
      </div>

      {/* Coordinates preview */}
      {selected && lat && lng && (
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-dashboard-muted">
          <span>📍 {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}</span>
        </div>
      )}

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {results.map((item, i) => {
            const p = item.properties || {};
            const coords = item.geometry?.coordinates || [];
            return (
              <button
                key={p.osm_id || i}
                type="button"
                onClick={() => selectResult(item)}
                className="w-full text-left px-3 py-2.5 hover:bg-stone-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <p className="text-sm font-medium text-dashboard-text truncate">
                  {shortLabel(item)}
                </p>
                {detailLine(item) && (
                  <p className="text-[11px] text-dashboard-muted truncate mt-0.5">
                    {detailLine(item)}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {typeLabel(item) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                      {typeLabel(item)}
                    </span>
                  )}
                  {coords[1] && coords[0] && (
                    <span className="text-[10px] text-stone-400">
                      {Number(coords[1]).toFixed(4)}, {Number(coords[0]).toFixed(4)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && !searching && query.length >= 3 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center">
          <p className="text-sm text-dashboard-muted">No results found</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Try a different search term</p>
        </div>
      )}

      {/* Hidden inputs for form compatibility */}
      <input type="hidden" value={lat} />
      <input type="hidden" value={lng} />
    </div>
  );
}
