import {
  IoMusicalNotesOutline,
  IoHardwareChipOutline,
  IoColorPaletteOutline,
  IoBasketballOutline,
  IoRestaurantOutline,
  IoBookOutline,
  IoFilmOutline,
  IoLeafOutline,
  IoSchoolOutline,
  IoHeartOutline,
  IoShirtOutline,
  IoBalloonOutline,
  IoPricetagOutline,
} from "../../components/icons";

// Maps a category's `icon` keyword (stored in the DB) to a react-icon.
// Falls back to a generic tag icon for unknown keywords.
const ICONS = {
  music: IoMusicalNotesOutline,
  tech: IoHardwareChipOutline,
  arts: IoColorPaletteOutline,
  sports: IoBasketballOutline,
  food: IoRestaurantOutline,
  book: IoBookOutline,
  film: IoFilmOutline,
  wellness: IoLeafOutline,
  education: IoSchoolOutline,
  charity: IoHeartOutline,
  fashion: IoShirtOutline,
  kids: IoBalloonOutline,
};

export function CategoryIcon({ icon, className }) {
  const Icon = ICONS[icon] || IoPricetagOutline;
  return <Icon className={className} />;
}

// Formats an event count the way the reference does (e.g. 3200 → "3.2K").
export function formatCount(n) {
  const num = Number(n) || 0;
  if (num >= 1000) {
    const k = num / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  return `${num}`;
}
