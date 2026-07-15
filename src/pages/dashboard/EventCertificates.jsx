import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { certificateService } from "../../services/certificates";
import { eventService } from "../../services/events";
import { attendanceService } from "../../services/attendance";
import { userService } from "../../services/users";
import { toast } from "react-hot-toast";
import {
  IoChevronBackOutline,
  IoCloseOutline,
  IoCopyOutline,
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoExpandOutline,
  IoImageOutline,
  IoRefreshOutline,
  IoRibbonOutline,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
} from "../../components/icons";
import Loading from "../../components/Loading";

/* ── Certificate Preview Modal ───────────────────────────────── */
function CertPreviewModal({ cert, userMap, onClose }) {
  const user = userMap[String(cert.user_id)];
  const name =
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    `User ${cert.user_id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-[90vw] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-stone-800">{name}</h3>
            <p className="text-[11px] text-stone-400 font-mono">
              {cert.verification_code}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {cert.image_data && (
              <a
                href={cert.image_data}
                download={`certificate-${cert.verification_code}.png`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                <IoDownloadOutline className="text-sm" />
                Download
              </a>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            >
              <IoCloseOutline className="text-lg" />
            </button>
          </div>
        </div>

        {/* Certificate image */}
        <div className="flex-1 overflow-auto p-6 bg-stone-50">
          {cert.image_data ? (
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <img
                src={cert.image_data}
                alt={`Certificate for ${name}`}
                className="w-full h-auto"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <IoImageOutline className="text-4xl text-stone-300 mb-3" />
              <p className="text-sm text-stone-500">No preview available</p>
              <p className="text-xs text-stone-400 mt-1">
                The certificate image hasn't been generated yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Certificate Row ─────────────────────────────────────────── */
function CertificateRow({ cert, userMap, onPreview }) {
  const user = userMap[String(cert.user_id)];
  const name =
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    `User ${cert.user_id}`;

  const [verified, setVerified] = useState(null);

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await certificateService.verify(cert.verification_code);
      if (!res.ok) throw new Error(res.error || "Invalid certificate");
      return res.data;
    },
    onSuccess: () => {
      setVerified(true);
      toast.success("Certificate is valid ✓");
    },
    onError: () => {
      setVerified(false);
      toast.error("Invalid certificate");
    },
  });
  const verifying = verifyMutation.isPending;
  const verify = () => {
    if (!cert.verification_code) return;
    verifyMutation.mutate();
  };

  return (
    <div className="px-4 py-3.5 hover:bg-stone-50/60 transition-colors">
      <div className="flex items-center gap-4">
        {/* Thumbnail preview */}
        <button
          onClick={() => onPreview(cert)}
          className="shrink-0 w-16 h-12 rounded-lg border border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center hover:border-primary/30 hover:shadow-sm transition-all group relative"
        >
          {cert.image_data ? (
            <>
              <img
                src={cert.image_data}
                alt={`Preview for ${name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <IoExpandOutline className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          ) : (
            <IoImageOutline className="text-stone-300 text-lg" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800 truncate">{name}</p>
          <p className="text-[11px] text-stone-400">
            Code:{" "}
            <span className="font-mono font-medium text-stone-500">
              {cert.verification_code}
            </span>
          </p>
        </div>

        {/* Verification badge */}
        {verified === true && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
            <IoShieldCheckmarkOutline className="text-xs" />
            Verified
          </span>
        )}
        {verified === false && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">
            Invalid
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onPreview(cert)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-primary/10 hover:text-primary transition-colors"
            title="Preview"
          >
            <IoExpandOutline className="text-sm" />
          </button>
          <button
            onClick={verify}
            disabled={verifying}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            title="Verify"
          >
            <IoShieldCheckmarkOutline className="text-sm" />
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(cert.verification_code);
              toast.success("Code copied");
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            title="Copy code"
          >
            <IoCopyOutline className="text-sm" />
          </button>
          {cert.image_data && (
            <a
              href={cert.image_data}
              download={`certificate-${cert.verification_code}.png`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-primary/10 hover:text-primary transition-colors"
              title="Download"
            >
              <IoDownloadOutline className="text-sm" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function EventCertificates() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [generateResult, setGenerateResult] = useState(null);
  const [search, setSearch] = useState("");
  const [previewCert, setPreviewCert] = useState(null);

  // Verify certificate section
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

  /* ── Data loading ──────────────────────────────────── */
  const eventQuery = useQuery({
    queryKey: ["event", Number(id)],
    enabled: !!id,
    queryFn: async () => {
      const res = await eventService.getById(id);
      if (!res.ok) throw new Error(res.error || "Failed to load event");
      return res.data;
    },
  });
  const templatesQuery = useQuery({
    queryKey: ["certificate-templates"],
    queryFn: async () => {
      const res = await certificateService.templates();
      if (!res.ok) throw new Error(res.error || "Failed to load templates");
      return res.data || [];
    },
  });
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await userService.list();
      if (!res.ok) throw new Error(res.error || "Failed to load users");
      return res.data || [];
    },
  });
  const attendanceQuery = useQuery({
    queryKey: ["attendance", Number(id)],
    enabled: !!id,
    queryFn: async () => {
      const res = await attendanceService.list(id);
      if (!res.ok) throw new Error(res.error || "Failed to load attendance");
      return res.data || [];
    },
  });
  const certificatesQuery = useQuery({
    queryKey: ["certificates", Number(id)],
    enabled: !!id,
    queryFn: async () => {
      const res = await certificateService.listForEvent(id);
      if (!res.ok) throw new Error(res.error || "Failed to load certificates");
      return res.data || [];
    },
  });

  const event = eventQuery.data ?? null;
  const templates = templatesQuery.data || [];
  const certificates = certificatesQuery.data || [];
  const attendance = attendanceQuery.data || [];
  const userMap = useMemo(() => {
    const map = {};
    (usersQuery.data || []).forEach((user) => {
      map[String(user.id)] = user;
    });
    return map;
  }, [usersQuery.data]);

  const loading =
    eventQuery.isPending ||
    templatesQuery.isPending ||
    usersQuery.isPending ||
    attendanceQuery.isPending ||
    certificatesQuery.isPending;
  const isFetchingAny =
    eventQuery.isFetching ||
    templatesQuery.isFetching ||
    usersQuery.isFetching ||
    attendanceQuery.isFetching ||
    certificatesQuery.isFetching;
  const refresh = () => {
    eventQuery.refetch();
    templatesQuery.refetch();
    usersQuery.refetch();
    attendanceQuery.refetch();
    certificatesQuery.refetch();
  };

  // Default the selected template to the first available one.
  useEffect(() => {
    if (templates.length && !selectedTemplate) {
      setSelectedTemplate(String(templates[0].id));
    }
  }, [templates, selectedTemplate]);

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setPreviewCert(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* ── Stats ─────────────────────────────────────────── */
  const checkedInCount = attendance.length;
  const certCount = certificates.length;
  const pendingCount = Math.max(checkedInCount - certCount, 0);

  /* ── Generate certificates ─────────────────────────── */
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await certificateService.generateForEvent(id, {
        templateId: Number(selectedTemplate),
      });
      if (!res.ok) throw new Error(res.error || "Failed to generate certificates");
      return res.data;
    },
    onSuccess: (data) => {
      setGenerateResult(data);
      toast.success(`${data?.generatedCount ?? 0} certificate(s) generated`);
      queryClient.invalidateQueries({ queryKey: ["certificates", Number(id)] });
    },
    onError: (err) => toast.error(err.message),
  });
  const generating = generateMutation.isPending;
  const generate = () => {
    if (!selectedTemplate) {
      toast.error("Select a template first");
      return;
    }
    setGenerateResult(null);
    generateMutation.mutate();
  };

  /* ── Verify certificate ────────────────────────────── */
  const verifyMutation = useMutation({
    mutationFn: async (code) => {
      const res = await certificateService.verify(code);
      if (!res.ok) throw new Error(res.error || "Certificate not found or invalid");
      return res.data;
    },
    onSuccess: (data) => {
      setVerifyResult({ valid: true, data });
      toast.success("Certificate is valid ✓");
    },
    onError: () => {
      setVerifyResult({ valid: false });
      toast.error("Certificate not found or invalid");
    },
  });
  const verifying = verifyMutation.isPending;
  const verifyCertificate = (e) => {
    e?.preventDefault();
    if (!verifyCode.trim()) return;
    setVerifyResult(null);
    verifyMutation.mutate(verifyCode.trim());
  };

  /* ── Filtered certificates ─────────────────────────── */
  const filteredCerts = useMemo(() => {
    if (!search) return certificates;
    const q = search.toLowerCase();
    return certificates.filter((c) => {
      const user = userMap[String(c.user_id)];
      const name =
        user?.name ||
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        "";
      return (
        name.toLowerCase().includes(q) ||
        (c.verification_code || "").toLowerCase().includes(q)
      );
    });
  }, [certificates, search, userMap]);

  if (loading) return <Loading />;

  return (
    <div>
      {/* Preview modal */}
      {previewCert && (
        <CertPreviewModal
          cert={previewCert}
          userMap={userMap}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors mb-5"
      >
        <IoChevronBackOutline className="text-sm" />
        Back to Event
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-secondary">Certificates</h1>
          {event?.title && (
            <p className="text-sm text-stone-400 mt-0.5">{event.title}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-500 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <IoRefreshOutline
              className={`text-base ${isFetchingAny ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 mb-3">
            <IoCheckmarkCircleOutline className="text-lg" />
          </div>
          <h2 className="text-2xl font-extrabold text-secondary">
            {checkedInCount}
          </h2>
          <p className="text-[11px] text-stone-400 mt-1">Checked In</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 text-amber-600 mb-3">
            <IoRibbonOutline className="text-lg" />
          </div>
          <h2 className="text-2xl font-extrabold text-secondary">
            {certCount}
          </h2>
          <p className="text-[11px] text-stone-400 mt-1">Certificates Issued</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-50 text-violet-600 mb-3">
            <IoDocumentTextOutline className="text-lg" />
          </div>
          <h2 className="text-2xl font-extrabold text-secondary">
            {pendingCount}
          </h2>
          <p className="text-[11px] text-stone-400 mt-1">Pending</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left column: Generate + Verify ── */}
        <div className="space-y-5">
          {/* Generate certificates */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
              Generate Certificates
            </h3>

            <Link
              to="/template-editor"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-primary bg-primary/10 rounded-xl hover:bg-primary hover:text-white transition-colors border-2 border-dashed border-primary/30 mb-4"
            >
              <IoDocumentTextOutline className="text-base" />
              Design New Template
            </Link>

            {templates.length > 0 && (
              <div className="space-y-3 mb-4">
                {templates.map((t) => (
                  <div key={t.id} className="relative text-left rounded-2xl border-2 p-4 transition-all cursor-pointer">
                    <div className="w-full h-24 rounded-xl mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/10 to-emerald-50 border border-primary/20">
                      {t.background_url ? (
                        <img src={t.background_url} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <IoDocumentTextOutline className="text-3xl text-primary/50" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-stone-800">{t.name}</p>
                    <Link
                      to={`/template-editor/${t.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      Edit in Designer →
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {templates.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-3">
                  <IoImageOutline className="text-xl text-stone-300" />
                </div>
                <p className="text-sm text-stone-500">No templates available</p>
                <p className="text-xs text-stone-400 mt-1">
                  Design a template first to generate certificates
                </p>
              </div>
            )}

            <button
              onClick={generate}
              disabled={generating || !selectedTemplate || checkedInCount === 0}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20 transition-all"
            >
              <IoRibbonOutline className="text-base" />
              {generating ? "Generating..." : "Generate Certificates"}
            </button>

            {checkedInCount === 0 && (
              <p className="text-[11px] text-amber-600 mt-2 text-center">
                No checked-in attendees yet. Mark attendance first.
              </p>
            )}

            {/* Result banner */}
            {generateResult && (
              <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-center">
                <p className="text-sm font-semibold text-primary">
                  ✓{" "}
                  {generateResult.generatedCount ?? 0} certificate(s) generated
                  successfully
                </p>
              </div>
            )}
          </div>

          {/* Verify Certificate */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
              Verify a Certificate
            </h3>
            <p className="text-xs text-stone-400 mb-3">
              Enter a verification code to check authenticity
            </p>

            <form onSubmit={verifyCertificate} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-stone-50 rounded-xl px-3.5 py-2.5 border border-stone-100 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <IoShieldCheckmarkOutline className="text-stone-400 text-sm shrink-0" />
                  <input
                    value={verifyCode}
                    onChange={(e) => {
                      setVerifyCode(e.target.value);
                      setVerifyResult(null);
                    }}
                    type="text"
                    placeholder="Enter verification code"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={verifying || !verifyCode.trim()}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-primary bg-primary/10 rounded-xl hover:bg-primary hover:text-white disabled:opacity-50 transition-colors"
                >
                  {verifying ? "..." : "Verify"}
                </button>
              </div>
            </form>

            {verifyResult && (
              <div
                className={`mt-3 rounded-xl px-4 py-3 text-center ${
                  verifyResult.valid
                    ? "bg-primary/5 border border-primary/20"
                    : "bg-red-50 border border-red-100"
                }`}
              >
                {verifyResult.valid ? (
                  <>
                    <p className="text-sm font-semibold text-primary">
                      ✓ Certificate is valid
                    </p>
                    {verifyResult.data?.event_title && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        Event: {verifyResult.data.event_title}
                      </p>
                    )}
                    {verifyResult.data?.user_name && (
                      <p className="text-xs text-stone-400">
                        Issued to: {verifyResult.data.user_name}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-semibold text-red-600">
                    ✕ Certificate not found or invalid
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: Generated certificates list ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Issued Certificates
                </h3>
                <span className="text-xs text-stone-400">
                  {certCount} total
                </span>
              </div>

              {/* Search */}
              {certificates.length > 0 && (
                <div className="flex items-center gap-2.5 bg-stone-50 rounded-xl px-3.5 py-2.5 border border-stone-100 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <IoSearchOutline className="text-stone-400 text-sm shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="Search by name or code..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <IoCloseOutline />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Rows */}
            <div className="divide-y divide-stone-50">
              {filteredCerts.map((c) => (
                <CertificateRow
                  key={c.id}
                  cert={c}
                  userMap={userMap}
                  onPreview={setPreviewCert}
                />
              ))}
            </div>

            {/* Empty state */}
            {filteredCerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                  <IoRibbonOutline className="text-2xl text-stone-300" />
                </div>
                <p className="text-sm font-semibold text-stone-500">
                  {search
                    ? "No matching certificates"
                    : certCount === 0
                    ? "No certificates generated yet"
                    : "No matching certificates"}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {search
                    ? "Try adjusting your search"
                    : "Select a template and generate certificates for checked-in attendees"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
