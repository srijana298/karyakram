import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { eventService } from "../../services/events";
import { categories } from "./categories";

function CreateEventLogic() {
  const [validateMessage, setValidateMessage] = useState(null);
  const [signingin, setSigningin] = useState(false);

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const groupIdParam = searchParams.get("groupId");

  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState(null);
  const [language, setLanguage] = useState(null);
  const [maxParticipants, setMaxParticipants] = useState(null);
  const [category, setCategory] = useState("");
  const [medium, setMedium] = useState("offline");
  const [meetLink, setMeetLink] = useState("");
  const [meetId, setMeetId] = useState("");
  const [meetPassword, setMeetPassword] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [groupId, setGroupId] = useState(groupIdParam || "");
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [fetchedDoc, setFetchedDoc] = useState(null);
  const [fetchingDoc, setFetchingDoc] = useState(false);
  const [tnc, setTnc] = useState(null);
  const [acceptingAttendance, setAcceptingAttendance] = useState(false);
  const [acceptingRsvp, setAcceptingRsvp] = useState(false);

  const handleImage = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageError("");
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const getEventById = useCallback(async () => {
    setFetchingDoc(true);
    const res = await eventService.getById(id);
    if (!res.ok) {
      toast.error(res.error);
      setFetchingDoc(false);
      return;
    }

    const data = res.data;
    setFetchedDoc(data);
    setTitle(data.title);
    setDescription(data.description || "");
    setLocation(data.location_name || "");
    setLatitude(data.latitude || "");
    setLongitude(data.longitude || "");
    setStartDate(data.start_date ? data.start_date.split(".")[0] : "");
    setEndDate(data.end_date ? data.end_date.split(".")[0] : "");
    setDuration(data.duration || null);
    setLanguage(data.language || null);
    setMaxParticipants(data.max_participants || null);
    setCategory(data.category || "");
    setMedium(data.medium || "offline");
    setMeetLink(data.meet_link || "");
    setMeetId(data.meet_id || "");
    setMeetPassword(data.meet_password || "");
    setPrivacy(data.privacy || "public");
    setGroupId(data.group_id || "");
    setImage(data.image || null);
    setImagePreview(data.image || null);
    setTnc(data.tnc || null);
    setAcceptingAttendance(data.accepting_attendance || false);
    setAcceptingRsvp(data.accepting_rsvp !== undefined ? data.accepting_rsvp : true);
    setFetchingDoc(false);
  }, [id]);

  useEffect(() => {
    if (id) getEventById();
  }, [getEventById]);

  const handleCreateEvent = async (e) => {
    e?.preventDefault();

    try {
      if (!title) throw new Error("Please provide a title for your event.");
      if (!description) throw new Error("Please provide a description for your event.");
      if (!privacy) throw new Error("Please provide a privacy setting for your event.");
      if (!startDate) throw new Error("Please provide a start date for your event.");
      if (endDate && new Date(endDate) < new Date(startDate)) {
        throw new Error("End date cannot be before start date.");
      }
      if (!category) throw new Error("Please provide a category for your event.");
      if (!image && !id) throw new Error("Please upload a feature image.");
      if (medium === "offline" && !location) {
        throw new Error("Please provide a location for your event.");
      }
    } catch (err) {
      toast.error(err.message);
      return;
    }

    setSigningin(true);
    setValidateMessage(null);

    const payload = {
      title,
      description,
      medium,
      start_date: startDate,
      end_date: endDate || null,
      category,
      max_participants: maxParticipants || 0,
      location_name: medium === "online" ? null : location,
      latitude: medium === "online" ? null : latitude,
      longitude: medium === "online" ? null : longitude,
      meet_link: medium === "offline" ? null : meetLink,
      meet_id: medium === "offline" ? null : meetId,
      meet_password: medium === "offline" ? null : meetPassword,
      privacy,
      group_id: groupId ? Number(groupId) : null,
      tnc,
      accepting_rsvp: acceptingRsvp,
      accepting_attendance: acceptingAttendance,
      duration,
      language,
    };

    let res;
    if (id) {
      // Update existing event
      if (image instanceof File) {
        const uploadRes = await eventService.uploadImage(id, image);
        if (uploadRes.ok) payload.image = uploadRes.data.image;
      }
      res = await eventService.update(id, payload);
    } else {
      // Create event first, then upload image
      res = await eventService.create(payload);
      if (res.ok && image instanceof File) {
        const uploadRes = await eventService.uploadImage(res.data.id, image);
        if (uploadRes.ok) res.data.image = uploadRes.data.image;
      }
    }

    if (!res.ok) {
      setValidateMessage(res.error);
      toast.error(res.error);
      setSigningin(false);
      return;
    }

    toast.success(`Event ${id ? "updated" : "created"} successfully`);
    navigate(-1);
    setSigningin(false);
  };

  const inputs = [
    { label: "Title", placeholder: "Please provide a title for your event.", value: title, cb: setTitle, show: true, required: true },
    { label: "Description", value: description, placeholder: "Please provide a description of your event.", cb: setDescription, multiline: true, show: true, required: true, type: "textarea" },
    { label: "Privacy", value: privacy, placeholder: "Please provide a medium for your event.", cb: setPrivacy, options: [{ label: "Public", value: "public" }, { label: "Private", value: "private" }], show: true, required: true },
    { label: "Group", value: groupId, placeholder: "Attach this event to a group", cb: setGroupId, show: true, type: "select" },
    { label: "Medium", value: medium, placeholder: "Please provide a medium for your event.", cb: setMedium, options: [{ label: "Online", value: "online" }, { label: "In Person", value: "offline" }], show: true, required: true },
    { label: "Start Date-Time", value: startDate, placeholder: "Please provide a start date for your event.", cb: setStartDate, show: true, required: true, type: "datetime-local" },
    { label: "End Date-Time", value: endDate, placeholder: "Please provide an end date for your event.", cb: setEndDate, show: true, type: "datetime-local" },
    { label: "Duration", value: duration, placeholder: "Please provide a duration for your event. (hh:mm)", cb: setDuration, show: true, type: "string" },
    { label: "Language", value: language, placeholder: "Please provide a language for your event.", cb: setLanguage, show: true, type: "string" },
    { label: "Max Participants (i.e. RSVPs)", value: maxParticipants, placeholder: "Please provide a maximum number of participants for your event.", cb: setMaxParticipants, type: "number", show: true },
    { label: "Category", value: category, placeholder: "Please provide a category for your event.", cb: setCategory, show: true, options: categories, required: true },
    { label: "Terms and Conditions", value: tnc, placeholder: "Please provide terms and conditions for your event.", cb: setTnc, multiline: true, show: true, type: "textarea" },
    { label: "Location Name", value: location, placeholder: "Please provide a location for your event.", cb: setLocation, show: medium === "offline", required: medium === "offline" },
    { label: "Latitude", value: latitude, placeholder: "Please provide a latitude for your event.", cb: setLatitude, inputMode: "numeric", show: medium === "offline", required: medium === "offline" },
    { label: "Longitude", value: longitude, placeholder: "Please provide a longitude for your event.", cb: setLongitude, inputMode: "numeric", show: medium === "offline", required: medium === "offline" },
    { label: "Meet Link", value: meetLink, placeholder: "Please provide a meet link for your event.", cb: setMeetLink, type: "url", show: medium === "online" },
    { label: "Meet ID", value: meetId, placeholder: "Please provide a meet ID for your event.", cb: setMeetId, show: medium === "online" },
    { label: "Meet Password", value: meetPassword, placeholder: "Please provide a meet password for your event.", cb: setMeetPassword, show: medium === "online" },
    { label: "Accepting RSVPs", value: acceptingRsvp, cb: setAcceptingRsvp, show: true, options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
  ];

  const removeImage = (e) => {
    e?.preventDefault();
    setImagePreview(null);
    setImage(null);
  };

  return {
    inputs,
    validateMessage,
    signingin,
    setSigningin,
    setValidateMessage,
    imageError,
    setImageError,
    fileRef,
    handleCreateEvent,
    handleImage,
    imagePreview,
    setImagePreview,
    setImage,
    removeImage,
    id,
    fetchingDoc,
  };
}

export default CreateEventLogic;
