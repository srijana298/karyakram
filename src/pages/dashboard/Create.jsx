import React from "react";
import { IoChevronBackOutline, IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import CreateEventLogic from "../../Logic/EventsLogic/createEvent.logic";
import Input from "../../components/Input";
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

  const pageTitle = id ? "Edit Event" : "Create Event";

  if (fetchingDoc) return <Loading />;

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

      <form onSubmit={handleCreateEvent} className="dashboard-panel p-5 md:p-6 space-y-4 rounded-md">
        {inputs.map((input, index) => (
          <Input {...input} key={index} />
        ))}

        <input
          ref={fileRef}
          type="file"
          onChange={handleImage}
          className="hidden"
        />

        <div className="pt-1">
          <button
            onClick={(e) => {
              e?.preventDefault();
              fileRef.current.click();
            }}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-dashboard-text border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <MdUpload className="text-base" />
            Upload Feature Image
          </button>
        </div>

        {imagePreview && (
          <div className="w-56 rounded-md border border-gray-200 overflow-hidden relative bg-white">
            <img alt="preview" className="w-full h-36 object-cover" src={imagePreview ?? ""} />
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

export default Create;
