import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { IoDownloadOutline, IoMailOutline } from "./icons";
import { eventService } from "../services/events";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteGuestsModal({ event, guestCount = 0, onClose, onSent }) {
  const [value, setValue] = useState("");
  const [emails, setEmails] = useState([]);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);
  const capacity = event?.max_participants > 0 ? event.max_participants : null;
  const seatsLeft = capacity ? Math.max(capacity - guestCount - emails.length, 0) : null;

  const addEmails = (raw = value) => {
    const candidates = raw.split(/[\s,;\n]+/).map((email) => email.trim().toLowerCase()).filter(Boolean);
    const valid = candidates.filter((email) => EMAIL_PATTERN.test(email));
    const available = seatsLeft == null ? valid.length : seatsLeft;
    const next = [...new Set([...emails, ...valid])].slice(0, emails.length + available);
    setEmails(next);
    setValue("");
    if (!valid.length && candidates.length) toast.error("Enter at least one valid email address");
  };

  const importCsv = async (file) => {
    if (!file) return;
    addEmails(await file.text());
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob(["email\nfriend@example.com\n"], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "guest-invite-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const continueInvite = async () => {
    if (!emails.length) return toast.error("Add at least one guest email");
    setSending(true);
    const res = await eventService.inviteGuests(event.id, emails);
    setSending(false);
    if (!res.ok) return toast.error(res.error || "Failed to send invitations");
    const skipped = res.data.skipped || 0;
    toast.success(`${res.data.sent} invitation${res.data.sent === 1 ? "" : "s"} sent${skipped ? ` · ${skipped} already invited` : ""}`);
    onSent?.();
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[84vh] overflow-hidden p-0 sm:max-w-xl" showCloseButton>
        <DialogHeader className="border-b px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <DialogTitle className="text-xl font-semibold">Invite Guests</DialogTitle>
              <DialogDescription className="mt-1">
                Add guest emails manually or import a CSV list.
              </DialogDescription>
            </div>
            {seatsLeft != null && <Badge variant="secondary">{seatsLeft} left</Badge>}
          </div>
        </DialogHeader>

        <main className="max-h-[calc(84vh-10rem)] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-3">
            <Label htmlFor="guest-emails">Add Emails</Label>
            <div className="flex gap-2">
              <Input
                id="guest-emails"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmails())}
                placeholder="Paste or enter emails here"
                className="h-10"
              />
              <Button onClick={() => addEmails()} disabled={!value.trim()} className="h-10 px-4">
                Add
              </Button>
            </div>
            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emails.map((email) => (
                  <button
                    key={email}
                    onClick={() => setEmails(emails.filter((item) => item !== email))}
                    title="Remove"
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                  >
                    {email} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Label>Import CSV</Label>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => importCsv(e.target.files?.[0])} />
            <button
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); importCsv(e.dataTransfer.files?.[0]); }}
              className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <span className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-background text-lg text-muted-foreground"><IoMailOutline /></span>
              <strong className="text-sm font-semibold">Import CSV File</strong>
              <span className="mt-1 text-xs text-muted-foreground">Drop file or click here to choose file.</span>
            </button>
            <Button type="button" variant="ghost" size="sm" onClick={downloadTemplate} className="px-0 text-muted-foreground hover:text-primary">
              <IoDownloadOutline /> Download CSV Template
            </Button>
          </div>
        </main>

        <DialogFooter className="m-0 rounded-none border-t bg-muted/30 px-5 py-4 sm:px-6">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={continueInvite} disabled={!emails.length || sending} className="min-w-40">
            {sending ? "Sending…" : "Send invitations →"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
