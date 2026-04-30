import React, { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import dayjs from "dayjs";
import "flatpickr/dist/flatpickr.min.css";

/**
 * DateTimePicker — date + time picker with validation.
 *
 * Props:
 *   label
 *   value        — datetime-local string (YYYY-MM-DDTHH:mm)
 *   onChange(val)
 *   minDate?     — datetime-local string
 *   maxDate?     — datetime-local string
 *   placeholder?
 *   required?
 *   error?
 */
export default function DateTimePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date & time",
  required = false,
  error,
}) {
  const inputRef = useRef(null);
  const fpRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;

    fpRef.current = flatpickr(inputRef.current, {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      minDate: minDate ? new Date(minDate) : "today",
      maxDate: maxDate ? new Date(maxDate) : undefined,
      time_24hr: false,
      allowInput: false,
      clickOpens: true,
      minuteIncrement: 5,
      static: true,
      disableMobile: true,
      defaultDate: value ? new Date(value) : undefined,
      onChange: (selectedDates) => {
        if (selectedDates[0] && onChange) {
          const formatted = dayjs(selectedDates[0]).format("YYYY-MM-DDTHH:mm");
          onChange(formatted);
        }
      },
    });

    return () => {
      if (fpRef.current) {
        fpRef.current.destroy();
        fpRef.current = null;
      }
    };
  }, []); // init once

  // Sync minDate/maxDate when they change
  useEffect(() => {
    if (!fpRef.current) return;
    if (minDate) fpRef.current.set("minDate", new Date(minDate));
    if (maxDate) fpRef.current.set("maxDate", new Date(maxDate));
  }, [minDate, maxDate]);

  // Sync value from outside (e.g. form reset or edit load)
  useEffect(() => {
    if (!fpRef.current) return;
    if (value) {
      fpRef.current.setDate(new Date(value), false);
    } else {
      fpRef.current.clear(false);
    }
  }, [value]);

  const displayValue = value
    ? dayjs(value).format("MMM D, YYYY · h:mm A")
    : "";

  return (
    <div>
      {label && (
        <label className="text-xs font-medium text-stone-500 mb-1.5 block">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
          placeholder={placeholder}
          data-input
          readOnly
        />
        {displayValue && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-[11px] text-dashboard-muted bg-stone-50 px-1.5 py-0.5 rounded">
              {dayjs(value).format("h:mm A")}
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
