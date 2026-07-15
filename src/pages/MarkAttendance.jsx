import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading";
import { TiTick } from "../components/icons";
import { AiFillCloseCircle } from "../components/icons";
import { MdInfo } from "../components/icons";
import { memberService } from "../services/members";

function MarkAttendance() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const memberId = searchParams.get("memberId");
  const queryClient = useQueryClient();

  const [state, setState] = useState({
    new: false,
    attended: false,
    invalid: false,
    message: "",
  });

  const markMutation = useMutation({
    mutationFn: async () => {
      const res = await memberService.markAttendance(eventId, memberId);
      if (!res.ok) throw new Error(res.error || "Something went wrong");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Attendance Marked successfully!");
      setState((prev) => ({ ...prev, new: true, message: "Attendance Marked successfully!" }));
      queryClient.invalidateQueries({ queryKey: ["attendance", Number(eventId)] });
    },
    onError: (err) => {
      const msg = err.message;
      if (msg.includes("already")) {
        setState((prev) => ({ ...prev, attended: true, message: "Already marked attendance!" }));
      } else {
        setState((prev) => ({ ...prev, invalid: true, message: msg }));
      }
      toast.error(msg);
    },
  });

  useEffect(() => {
    if (eventId && memberId) markMutation.mutate();
    else setState((prev) => ({ ...prev, invalid: true, message: "Invalid Ticket" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, memberId]);

  if (markMutation.isPending) return <Loading text={"Marking Attendance"} />;

  return (
    <div className="flex flex-col items-center justify-center font-geist h-screen gap-8">
      <h1 className="font-bold text-lg">{state?.message}</h1>
      {state?.new && <TiTick className="text-5xl text-green-500" />}
      {state?.invalid && <AiFillCloseCircle className="text-5xl text-red-500" />}
      {state?.attended && <MdInfo className="text-5xl text-green-500" />}
    </div>
  );
}

export default MarkAttendance;
