import crypto from "crypto";
import path from "path";
import fs from "fs";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { attendance, certificates, certificateTemplates, events, users } from "../db/schema.js";
import { Ok, Created, BadRequest, NotFound, Forbidden, InternalError } from "../utils/ApiResponse.js";

/* ── Helpers ──────────────────────────────────────────────────── */

const UPLOAD_DIR = path.join(process.cwd(), "uploads/templates");

function getBackgroundUrl(req, file) {
  if (!file) return null;
  return `${req.protocol}://${req.get("host")}/uploads/templates/${file.filename}`;
}

/* ── Template CRUD ────────────────────────────────────────────── */

export const listTemplates = async (req, res) => {
  const rows = await db.select().from(certificateTemplates).catch(() => []);
  return Ok(rows);
};

export const getTemplate = async (req, res) => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(certificateTemplates).where(eq(certificateTemplates.id, id)).catch(() => []);
  if (!row) return NotFound("Template not found");
  return Ok(row);
};

export const createTemplate = async (req, res) => {
  const { name, canvas_json, canvas_width, canvas_height } = req.body;
  if (!name) return BadRequest("Template name is required");

  const background_url = getBackgroundUrl(req, req.file) || null;
  const values = {
    name,
    background_url,
    canvas_json: canvas_json || null,
    canvas_width: canvas_width ? Number(canvas_width) : 1400,
    canvas_height: canvas_height ? Number(canvas_height) : 1000,
    created_by: req.user.id,
  };

  const [row] = await db.insert(certificateTemplates).values(values).catch(() => []);
  if (!row?.insertId) return InternalError("Failed to create template");

  const [created] = await db.select().from(certificateTemplates).where(eq(certificateTemplates.id, row.insertId)).catch(() => []);
  return Created(created, "Template created");
};

export const updateTemplate = async (req, res) => {
  const id = parseInt(req.params.id);
  const [existing] = await db.select().from(certificateTemplates).where(eq(certificateTemplates.id, id)).catch(() => []);
  if (!existing) return NotFound("Template not found");
  if (existing.created_by !== req.user.id && req.user.role !== "admin") return Forbidden("Not authorized");

  const { name, canvas_json, canvas_width, canvas_height } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (canvas_json !== undefined) updates.canvas_json = canvas_json;
  if (canvas_width !== undefined) updates.canvas_width = Number(canvas_width);
  if (canvas_height !== undefined) updates.canvas_height = Number(canvas_height);
  if (req.file) updates.background_url = getBackgroundUrl(req, req.file);

  await db.update(certificateTemplates).set(updates).where(eq(certificateTemplates.id, id));
  const [updated] = await db.select().from(certificateTemplates).where(eq(certificateTemplates.id, id)).catch(() => []);
  return Ok(updated);
};

export const deleteTemplate = async (req, res) => {
  const id = parseInt(req.params.id);
  const [existing] = await db.select().from(certificateTemplates).where(eq(certificateTemplates.id, id)).catch(() => []);
  if (!existing) return NotFound("Template not found");
  if (existing.created_by !== req.user.id && req.user.role !== "admin") return Forbidden("Not authorized");

  await db.delete(certificateTemplates).where(eq(certificateTemplates.id, id));
  return Ok(null, "Template deleted");
};


/* ── Event Certificates ───────────────────────────────────────── */

export const listForEvent = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return NotFound("Event not found");
  if (event.created_by !== req.user.id && req.user.role !== "admin") return Forbidden("Only owner/admin can view event certificates");
  const rows = await db.select().from(certificates).where(eq(certificates.event_id, eventId)).catch(() => null);
  if (!rows) return InternalError("Failed to fetch certificates");
  return Ok(rows);
};

export const generateForEvent = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const templateId = req.body.templateId ? Number(req.body.templateId) : null;

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return NotFound("Event not found");
  if (event.created_by !== req.user.id && req.user.role !== "admin") return Forbidden("Only owner/admin can generate certificates");

  const attendees = await db.select().from(attendance).where(and(eq(attendance.event_id, eventId), eq(attendance.checked_in, true))).catch(() => null);
  if (!attendees) return InternalError("Failed to fetch attendance");
  if (attendees.length === 0) return BadRequest("No checked-in attendees found");

  let template = null;
  if (templateId) {
    [template] = await db.select().from(certificateTemplates).where(eq(certificateTemplates.id, templateId)).catch(() => []);
  }
  if (!template) {
    const rows = await db.select().from(certificateTemplates).catch(() => []);
    template = rows[0] || { id: null, name: "Classic" };
  }

  const generated = [];

  // If template has canvas_json (new editor), use compositing
  if (template.canvas_json) {
    for (const a of attendees) {
      const [u] = await db.select().from(users).where(eq(users.id, a.user_id)).catch(() => []);
      const code = crypto.randomBytes(6).toString("hex").toUpperCase();

      // Replace participant_name in canvas JSON
      let canvasData = template.canvas_json;
      const participantName = u?.name || `Participant #${a.user_id}`;
      canvasData = canvasData.replace(/\{\{participant_name\}\}/g, participantName);

      const img = renderCompositeSvg({
        backgroundUrl: template.background_url,
        canvasJson: canvasData,
        canvasWidth: template.canvas_width || 1400,
        canvasHeight: template.canvas_height || 1000,
        code,
        templateName: template.name,
      });

      const result = await db.insert(certificates).values({
        event_id: eventId,
        user_id: a.user_id,
        template_id: template.id,
        verification_code: code,
        image_data: img,
      }).catch(() => null);

      if (result) generated.push({ userId: a.user_id, code });
    }
  } else {
    // Legacy: hardcoded SVG
    for (const a of attendees) {
      const [u] = await db.select().from(users).where(eq(users.id, a.user_id)).catch(() => []);
      const code = crypto.randomBytes(6).toString("hex").toUpperCase();
      const img = renderCertificateSvg({
        studentName: u?.name || `User #${a.user_id}`,
        eventTitle: event.title,
        dateText: new Date(event.start_date || new Date()).toDateString(),
        code,
        templateName: template.name,
      });

      const result = await db.insert(certificates).values({
        event_id: eventId,
        user_id: a.user_id,
        template_id: template.id,
        verification_code: code,
        image_data: img,
      }).catch(() => null);

      if (result) generated.push({ userId: a.user_id, code });
    }
  }

  return Created({ generatedCount: generated.length, generated }, "Certificates generated");
};

export const listMine = async (req, res) => {
  const rows = await db.select().from(certificates).where(eq(certificates.user_id, req.user.id)).catch(() => null);
  if (!rows) return InternalError("Failed to fetch certificates");
  return Ok(rows);
};

export const verifyCode = async (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const [row] = await db.select().from(certificates).where(eq(certificates.verification_code, code)).catch(() => []);
  if (!row) return NotFound("Certificate not found");
  return Ok(row);
};

/* ── SVG Renderers ────────────────────────────────────────────── */

function renderCompositeSvg({ backgroundUrl, canvasJson, canvasWidth, canvasHeight, code, templateName }) {
  // Parse the canvas JSON to extract text objects
  let objects = [];
  try {
    const parsed = JSON.parse(canvasJson);
    objects = parsed.objects || [];
  } catch {}

  const safe = (s = "") => String(s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

  let textSvg = "";
  for (const obj of objects) {
    if (obj.type !== "i-text" && obj.type !== "text" && obj.type !== "textbox") continue;
    const x = obj.left || 0;
    const y = obj.top || 0;
    const fontSize = obj.fontSize || 24;
    const fill = obj.fill || "#000000";
    const fontFamily = obj.fontFamily || "Inter";
    const fontWeight = obj.fontWeight || "normal";
    const fontStyle = obj.fontStyle || "normal";
    const textAlign = obj.textAlign || "left";
    const angle = obj.angle || 0;
    const width = obj.width || 400;
    const text = safe(obj.text || "");

    const anchor = textAlign === "center" ? "middle" : textAlign === "right" ? "end" : "start";
    const textX = textAlign === "center" ? x + width / 2 : textAlign === "right" ? x + width : x;

    textSvg += `
      <text
        x="${textX}" y="${y + fontSize}"
        font-family="${safe(fontFamily)}, Arial, sans-serif"
        font-size="${fontSize}"
        fill="${fill}"
        font-weight="${fontWeight}"
        font-style="${fontStyle}"
        text-anchor="${anchor}"
        transform="rotate(${angle}, ${x + (width / 2)}, ${y + (fontSize / 2)})"
      >${text}</text>`;
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">
    <image href="${backgroundUrl}" x="0" y="0" width="${canvasWidth}" height="${canvasHeight}" preserveAspectRatio="xMidYMid slice"/>
    ${textSvg}
    <text x="${canvasWidth / 2}" y="${canvasHeight - 30}" text-anchor="middle" font-family="Inter, Arial" font-size="12" fill="#64748b">Code: ${safe(code)}</text>
  </svg>`)}`
}

function renderCertificateSvg({ studentName, eventTitle, dateText, code, templateName = "Classic" }) {
  const safe = (s = "") => String(s).replace(/[<>&]/g, "");
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000" viewBox="0 0 1400 1000">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#ecfeff"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="1400" height="1000" fill="url(#bg)"/>
    <rect x="48" y="48" width="1304" height="904" rx="24" fill="none" stroke="#0f766e" stroke-width="8"/>
    <text x="700" y="180" text-anchor="middle" font-family="Inter, Arial" font-size="42" fill="#0f172a" font-weight="700">Certificate of Participation</text>
    <text x="700" y="245" text-anchor="middle" font-family="Inter, Arial" font-size="24" fill="#334155">This certifies that</text>
    <text x="700" y="355" text-anchor="middle" font-family="Georgia, serif" font-size="68" fill="#0f766e" font-weight="700">${safe(studentName)}</text>
    <text x="700" y="430" text-anchor="middle" font-family="Inter, Arial" font-size="24" fill="#334155">has successfully attended</text>
    <text x="700" y="505" text-anchor="middle" font-family="Inter, Arial" font-size="46" fill="#0f172a" font-weight="700">${safe(eventTitle)}</text>
    <text x="700" y="570" text-anchor="middle" font-family="Inter, Arial" font-size="20" fill="#64748b">Date: ${safe(dateText)}</text>
    <line x1="220" y1="760" x2="520" y2="760" stroke="#0f172a" stroke-width="2" />
    <text x="370" y="792" text-anchor="middle" font-family="Inter, Arial" font-size="18" fill="#334155">Organizer</text>
    <line x1="880" y1="760" x2="1180" y2="760" stroke="#0f172a" stroke-width="2" />
    <text x="1030" y="792" text-anchor="middle" font-family="Inter, Arial" font-size="18" fill="#334155">Participant</text>
    <text x="700" y="900" text-anchor="middle" font-family="Inter, Arial" font-size="16" fill="#475569">Verification Code: ${safe(code)} · Template: ${safe(templateName)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
