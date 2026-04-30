import React, { useEffect, useState } from "react";
import { IoChevronBackOutline, IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import CreateEventLogic from "../../Logic/EventsLogic/createEvent.logic";
import Input from "../../components/Input";
import LocationInput from "../../components/LocationInput";
import DateTimePicker from "../../components/DateTimePicker";
import { groupService } from "../../services/groups";
import { MdUpload } from "react-icons/md";
import Loading from "../../components/Loading";

function Create() {
  const {
    inputs,
    signingin,
    handleImage,
    imagePreview,
    fileRef,
    handleCreateEvent,
    removeImage,
    id,
    fetchingDoc,
  } = CreateEventLogic();

  const [dateErrors, setDateErrors] = useState({ start: "", end: "" });
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    groupService.list({ mine: "true" }).then((res) => {
      if (res.ok) setGroups(res.data || []);
    });
  }, []);

  const pageTitle = id ? "Edit Event" : "Create Event";

  if (fetchingDoc) return <Loading />;

  // Extract special fields
  const startDateInput = inputs.find((inp) => inp.label === "Start Date-Time");
  const endDateInput = inputs.find((inp) => inp.label === "End Date-Time");
  const showLocation = inputs.find((inp) => inp.label === "Location Name");
  const groupInput = inputs.find((inp) => inp.label === "Group");

  const locationValue = showLocation?.value || "";
  const latValue = inputs.find((inp) => inp.label === "Latitude")?.value || "";
  const lngValue = inputs.find((inp) => inp.label === "Longitude")?.value || "";
  const setLocationCb = showLocation?.cb;
  const setLatCb = inputs.find((inp) => inp.label === "Latitude")?.cb;
  const setLngCb = inputs.find((inp) => inp.label === "Longitude")?.cb;

  // All other regular inputs (exclude location + date fields)
  const regularInputs = inputs.filter(
    (inp) =>
      !["Location Name", "Latitude", "Longitude", "Start Date-Time", "End Date-Time", "Group"].includes(inp.label)
  );

  // Split regular inputs around Medium for location insertion
  const mediumIndex = regularInputs.findIndex((inp) => inp.label === "Medium");
  const beforeMedium = regularInputs.slice(0, mediumIndex + 1);
  const afterMedium = regularInputs.slice(mediumIndex + 1);

  const handleLocationChange = ({ location, latitude, longitude }) => {
    if (setLocationCb) setLocationCb(location);
    if (setLatCb) setLatCb(latitude);
    if (setLngCb) setLngCb(longitude);
  };

  const startDate = startDateInput?.value || "";
  const endDate = endDateInput?.value || "";

  const handleStartChange = (val) => {
    startDateInput?.cb(val);
    setDateErrors((prev) => ({ ...prev, start: "" }));
    // Validate end date against new start
    if (endDate && val && dayjs(endDate).isBefore(dayjs(val))) {
      setDateErrors((prev) => ({ ...prev, end: "End date must be after start date" }));
    } else {
      setDateErrors((prev) => ({ ...prev, end: "" }));
    }
  };

  const handleEndChange = (val) => {
    endDateInput?.cb(val);
    if (startDate && val && dayjs(val).isBefore(dayjs(startDate))) {
      setDateErrors((prev) => ({ ...prev, end: "End date must be after start date" }));
    } else {
      setDateErrors((prev) => ({ ...prev, end: "" }));
    }
  };

  // Computed duration display
  const durationDisplay = startDate && endDate && dayjs(endDate).isAfter(dayjs(startDate))
    ? computeDuration(startDate, endDate)
    : null;

  const onSubmit = (e) => {
    if (!startDate) {
      setDateErrors((prev) => ({ ...prev, start: "Start date is required" }));
      e.preventDefault();
      return;
    }
    if (endDate && dayjs(endDate).isBefore(dayjs(startDate))) {
      setDateErrors((prev) => ({ ...prev, end: "End date must be after start date" }));
      e.preventDefault();
      return;
    }
    handleCreateEvent(e);
  };

  return (
    <div className="space-y-4">
      <div className="px-1">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-dashboard-muted hover:text-dashboard-text transition-colors"
        >
          <IoChevronBackOutline className="text-base" />
          Back
        </Link>
        <h1 className="text-[40px] leading-tight font-semibold text-dashboard-text mt-3">{pageTitle}</h1>
        <p className="text-dashboard-muted mt-1">Fill in the details below to create a new event.</p>
      </div>

      <form onSubmit={onSubmit} className="dashboard-panel p-5 md:p-6 space-y-4 rounded-md">
        {beforeMedium.map((input, index) => (
          <Input {...input} key={input.label || index} />
        ))}

        {/* Group select */}
        {groupInput?.show && (
          <div>
            <label className="text-xs font-medium text-stone-500 mb-1.5 block">
              Group
            </label>
            <select
              value={groupInput.value || ""}
              onChange={(e) => {
                e.preventDefault();
                groupInput.cb(e.target.value);
              }}
              className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            >
              <option value="">No group (standalone event)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Location autocomplete */}
        {showLocation?.show && (
          <div>
            <label className="text-xs font-medium text-stone-500 mb-1.5 block">
              Location <span className="text-red-500">*</span>
            </label>
            <LocationInput
              value={locationValue}
              lat={latValue}
              lng={lngValue}
              onChange={handleLocationChange}
              placeholder="Search for a venue or address..."
              required={showLocation.required}
            />
          </div>
        )}

        {/* Date & Time section */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Schedule</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <DateTimePicker
              label="Start Date & Time"
              value={startDate}
              onChange={handleStartChange}
              placeholder="Pick start date & time"
              required={startDateInput?.required}
              error={dateErrors.start}
            />
            <DateTimePicker
              label="End Date & Time"
              value={endDate}
              onChange={handleEndChange}
              placeholder="Pick end date & time"
              minDate={startDate || undefined}
              required={endDateInput?.required}
              error={dateErrors.end}
            />
          </div>

          {/* Auto-computed duration */}
          {durationDisplay && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
              ⏱ Duration: {durationDisplay}
            </div>
          )}
        </div>

        {/* Remaining inputs (skip Duration field since we auto-compute it) */}
        {afterMedium
          .filter((inp) => inp.label !== "Duration")
          .map((input, index) => (
            <Input {...input} key={input.label || index} />
          ))}

        <input
          ref={fileRef}
          type="file"
          onChange={handleImage}
          className="hidden"
        />

        <div className="pt-1">
          <label className="text-sm font-semibold text-dashboard-text mb-1.5 block">
            Feature Image <span className="text-red-500">*</span>
          </label>
          {!imagePreview ? (
            <button
              onClick={(e) => {
                e?.preventDefault();
                fileRef.current.click();
              }}
              type="button"
              className="w-full h-36 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-2 text-dashboard-muted hover:border-primary/40 hover:text-primary transition-colors"
            >
              <MdUpload className="text-2xl" />
              <span className="text-sm font-medium">Click to upload feature image</span>
              <span className="text-[11px] text-stone-400">PNG, JPG up to 5MB</span>
            </button>
          ) : (
            <div className="w-full max-w-sm rounded-md border border-gray-200 overflow-hidden relative bg-white">
              <img alt="preview" className="w-full h-44 object-cover" src={imagePreview ?? ""} />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white"
                title="Delete Image"
                type="button"
              >
                <IoClose className="text-sm" />
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 mt-2 border-t border-gray-200 flex items-center justify-end gap-3">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 text-sm font-semibold text-dashboard-text border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={signingin}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-md hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {signingin ? "Processing..." : pageTitle}
          </button>
        </div>
      </form>
    </div>
  );
}

function computeDuration(start, end) {
  const s = dayjs(start);
  const e = dayjs(end);
  const diffMin = e.diff(s, "minute");
  if (diffMin <= 0) return null;

  const days = Math.floor(diffMin / 1440);
  const hours = Math.floor((diffMin % 1440) / 60);
  const mins = diffMin % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);

  return parts.join(" ") || "0m";
}

export default Create;
