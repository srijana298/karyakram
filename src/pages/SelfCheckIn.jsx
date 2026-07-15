import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { attendanceService } from "../services/attendance";
import { toast } from "react-hot-toast";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoArrowBackOutline,
  IoKeypadOutline,
} from "../components/icons";
import Loading from "../components/Loading";
import Brand from "../components/Brand";

export default function SelfCheckIn() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null); // null | "success" | "error"

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const res = await attendanceService.selfCheckIn(eventId, {
        code: code.trim(),
      });
      if (!res.ok) throw new Error(res.error || "Invalid code");
      return res.data;
    },
    onSuccess: () => {
      setStatus("success");
      toast.success("You're checked in!");
      queryClient.invalidateQueries({ queryKey: ["attendance", Number(eventId)] });
    },
    onError: (err) => {
      setStatus("error");
      toast.error(err.message);
    },
  });

  const loading = checkInMutation.isPending;

  const handleCheckIn = (e) => {
    e?.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter the check-in code");
      return;
    }
    setStatus(null);
    checkInMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex justify-center mb-10">
          <Brand />
        </div>

        {status === "success" ? (
          /* ── Success state ──────────────────────────────── */
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <IoCheckmarkCircleOutline className="text-3xl text-primary" />
            </div>
            <h2 className="text-lg font-bold text-stone-800 mb-1">
              You're checked in!
            </h2>
            <p className="text-sm text-stone-400 mb-6">
              Your attendance has been confirmed.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Go back
            </button>
          </div>
        ) : (
          /* ── Code entry form ─────────────────────────────── */
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <IoKeypadOutline className="text-2xl text-primary" />
            </div>

            <h1 className="text-xl font-bold text-stone-800 text-center mb-1">
              Check In
            </h1>
            <p className="text-sm text-stone-400 text-center mb-6">
              Enter the code shared by the event organizer
            </p>

            {status === "error" && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl mb-4">
                <IoCloseCircleOutline className="text-sm shrink-0" />
                Invalid or expired code. Please try again.
              </div>
            )}

            <form onSubmit={handleCheckIn} className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setStatus(null);
                }}
                placeholder="Enter code"
                maxLength={12}
                autoFocus
                className="w-full text-center text-2xl font-bold tracking-[0.2em] bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 outline-none placeholder:text-stone-300 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all text-stone-800"
              />
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20 transition-all"
              >
                {loading ? "Checking in..." : "Check In"}
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mx-auto mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
        >
          <IoArrowBackOutline className="text-sm" />
          Go back
        </button>
      </div>
    </div>
  );
}
