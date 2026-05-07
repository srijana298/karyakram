import React, { useEffect, useMemo, useState } from "react";
import { memberService } from "../../services/members";
import { toast } from "react-hot-toast";
import Loading from "../../components/Loading";
import DataTable from "../../components/DataTable";
import { resolveImage } from "../../lib/resolveImage";
import {
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoEllipsisVertical,
  IoEyeOutline,
  IoMailOpenOutline,
  IoMailOutline,
  IoSearchOutline,
  IoTimeOutline,
} from "react-icons/io5";

export default function Invites() {
  const [tab, setTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const [r, s] = await Promise.all([
      memberService.receivedInvites(),
      memberService.sentInvites(),
    ]);
    if (r.ok) setReceived(r.data || []);
    if (s.ok) setSent(s.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (inviteToken) => {
    const res = await memberService.acceptInvite(inviteToken);
    if (res.ok) {
      toast.success("Invitation accepted!");
      load();
    } else {
      toast.error(res.error || "Failed to accept");
    }
  };

  const receivedRows = useMemo(() => {
    return (received || []).map((inv) => ({
      id: inv.id,
      invitee: {
        name: inv.ownerName || "Event Owner",
        sub: inv.role ? `Invited as ${inv.role}` : "Pending invite",
        avatar: (inv.ownerName || "EO").slice(0, 2).toUpperCase(),
      },
      event: {
        title: inv.eventTitle || "Untitled Event",
        sub: "—",
        image: inv.eventImage,
      },
      status: "Pending",
      sentOn: formatDate(inv.created_at),
      respondedOn: "—",
      onAccept: () => handleAccept(inv.inviteToken),
    })).filter((row) => {
      const text = `${row.invitee.name} ${row.event.title} ${row.status}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [received, search]);

  const sentRows = useMemo(() => {
    return (sent || []).flatMap((ev) =>
      (ev.invitedUsers || []).map((u) => ({
        id: `${ev.eventId}-${u.memberId}`,
        invitee: {
          name: u.name || "Unknown",
          sub: u.email || "",
          avatar: (u.name || "U").slice(0, 2).toUpperCase(),
        },
        event: {
          title: ev.eventTitle || "Untitled Event",
          sub: "—",
          image: ev.eventImage,
        },
        status: capitalize(u.status || "pending"),
        sentOn: formatDate(ev.created_at),
        respondedOn: u.status === "pending" ? "—" : formatDate(u.updated_at),
      }))
    ).filter((row) => {
      const text = `${row.invitee.name} ${row.event.title} ${row.status}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [sent, search]);

  const columns = [
    {
      key: "invitee",
      label: "Invitee",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
            {row.invitee.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-dashboard-text">{row.invitee.name}</p>
            <p className="text-xs text-dashboard-muted">{row.invitee.sub}</p>
          </div>
        </div>
      ),
    },
    {
      key: "event",
      label: "Event",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <img
            src={resolveImage(row.event.image)}
            alt=""
            className="w-11 h-8 rounded object-cover bg-stone-200"
          />
          <div>
            <p className="text-sm font-semibold text-dashboard-text">{row.event.title}</p>
            <p className="text-xs text-dashboard-muted">{row.event.sub}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      className: "text-center",
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      key: "sentOn",
      label: "Sent On",
      className: "text-sm text-dashboard-muted",
    },
    {
      key: "respondedOn",
      label: "Responded On",
      className: "text-sm text-dashboard-muted",
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          {row.onAccept ? (
            <button
              onClick={row.onAccept}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-primary rounded hover:bg-emerald-600"
            >
              <IoCheckmarkCircleOutline /> Accept
            </button>
          ) : (
            <button className="w-8 h-8 rounded-md border border-gray-200 text-dashboard-muted inline-flex items-center justify-center hover:bg-stone-50">
              <IoEyeOutline />
            </button>
          )}
          <button className="w-8 h-8 rounded-md border border-gray-200 text-dashboard-muted inline-flex items-center justify-center hover:bg-stone-50">
            <IoEllipsisVertical />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="px-5 py-3 text-xs text-dashboard-muted border-b border-dashboard-border">
        Main Menu <span className="px-2">/</span> Invites
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-[34px] leading-tight font-semibold text-dashboard-text">Invites</h1>
              <p className="text-dashboard-muted mt-1">Manage and track all your event invitations.</p>
            </div>
            <div className="flex items-center gap-2 bg-stone-50 border border-gray-200 rounded-md p-1">
              <button
                onClick={() => setTab("received")}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  tab === "received" ? "bg-white border border-gray-200 text-dashboard-text" : "text-dashboard-muted"
                }`}
              >
                <span className="inline-flex items-center gap-1.5"><IoMailOutline /> Received</span>
              </button>
              <button
                onClick={() => setTab("sent")}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  tab === "sent" ? "bg-white border border-gray-200 text-dashboard-text" : "text-dashboard-muted"
                }`}
              >
                <span className="inline-flex items-center gap-1.5"><IoMailOpenOutline /> Sent</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_auto_auto] gap-2 mt-4">
            <div className="flex items-center gap-2 h-10 border border-gray-200 rounded-md px-3">
              <IoSearchOutline className="text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invites..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-stone-400"
              />
            </div>
            <button className="h-10 px-4 border border-gray-200 rounded-md text-sm text-dashboard-muted inline-flex items-center gap-2">
              All Events <IoChevronDownOutline className="text-xs" />
            </button>
            <button className="h-10 px-4 border border-gray-200 rounded-md text-sm text-dashboard-muted inline-flex items-center gap-2">
              All Status <IoChevronDownOutline className="text-xs" />
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={tab === "received" ? receivedRows : sentRows}
          pageSize={10}
          emptyMessage={tab === "received" ? "No pending invites" : "No sent invites"}
        />
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const s = (status || "pending").toLowerCase();
  const cls =
    s === "accepted"
      ? "bg-green-50 text-green-700 border-green-200"
      : s === "declined" || s === "rejected"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {s === "pending" && <IoTimeOutline className="text-[12px]" />}
      {capitalize(s)}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" });
}

function capitalize(v = "") {
  return v.charAt(0).toUpperCase() + v.slice(1);
}
