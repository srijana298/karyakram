import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events, eventMembers, eventInvitations, rsvps, notifications, users } from '../db/schema.js';
import { Resend } from 'resend';
import { randomUUID } from 'node:crypto';
import {
  Ok,
  Created,
  Forbidden,
  NotFound,
  BadRequest,
  InternalError
} from '../utils/ApiResponse.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const listInvitations = async (req, res) => {
  const eventId = Number(req.params.id);
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return NotFound('Event not found');
  if (event.created_by !== req.user.id) return Forbidden('Only the event organizer can view invitations');

  const invitations = await db.select().from(eventInvitations)
    .where(eq(eventInvitations.event_id, eventId))
    .catch(() => null);
  if (!invitations) return InternalError('Failed to load invitations');
  return Ok(invitations);
};

export const inviteGuests = async (req, res) => {
  const eventId = Number(req.params.id);
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return NotFound('Event not found');
  if (event.created_by !== req.user.id) return Forbidden('Only the event organizer can invite guests');

  const requestedEmails = [...new Set(req.body.emails.map((email) => email.trim().toLowerCase()))];
  const existingInvitations = await db.select({ email: eventInvitations.email })
    .from(eventInvitations)
    .where(eq(eventInvitations.event_id, event.id))
    .catch(() => null);
  if (!existingInvitations) return InternalError('Failed to check existing invitations');

  const existingEmails = new Set(existingInvitations.map((invitation) => invitation.email.toLowerCase()));
  const emails = requestedEmails.filter((email) => !existingEmails.has(email));
  if (emails.length === 0) return BadRequest('All of these emails have already been invited to this event');

  const eventPath = event.short_code || genShortCode();
  const invitations = emails.map((email) => {
    const token = randomUUID();
    const link = `${process.env.APP_BASE_URL || 'http://localhost:5173'}/${eventPath}?invited=1&token=${token}`;
    return { email, token, link };
  });

  const { data, error } = await resend.batch.send(
    invitations.map(({ email, link }) => ({
      from: process.env.RESEND_FROM_EMAIL,
      to: [email],
      subject: `You're invited to ${event.title}`,
      template: {
        id: process.env.RESEND_INVITATION_TEMPLATE_ID,
        variables: {
          inviter_name: req.user.name || 'The organizer',
          event_name: event.title,
          event_url: link,
          link,
          // The published Resend template requires this exact variable.
          Name: 'Guest',
        },
      },
    }))
  );

  if (error) {
    console.error('Resend invitation error:', error);
    return InternalError(error.message || 'Failed to send invitations');
  }

  const sentEmails = data?.data || [];
  const saved = await db.insert(eventInvitations).values(
    invitations.map((invitation, index) => ({
      event_id: event.id,
      invited_by: req.user.id,
      email: invitation.email,
      token: invitation.token,
      status: 'sent',
      resend_email_id: sentEmails[index]?.id || null,
    }))
  ).catch((err) => {
    console.error('Failed to persist invitations:', err);
    return null;
  });

  if (!saved) return InternalError('Emails were sent, but invitation records could not be saved');

  return Ok({
    sent: invitations.length,
    skipped: requestedEmails.length - invitations.length,
    ids: sentEmails.map((item) => item.id),
  }, 'Invitations sent successfully');
};

// Generates a short, URL-safe code (base36) for share links like /<code>.
function genShortCode(len = 8) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export const createEvent = async (req, res) => {
  const {
    title,
    description,
    medium,
    location_name,
    latitude,
    longitude,
    meet_link,
    meet_id,
    meet_password,
    start_date,
    end_date,
    duration,
    language,
    max_participants,
    admission_mode,
    category,
    privacy,
    tnc,
    accepting_rsvp,
    accepting_attendance,
    require_approval,
    group_id,
    calendar_id
  } = req.body;

  const result = await db
    .insert(events)
    .values({
      title,
      description,
      medium,
      location_name,
      latitude,
      longitude,
      meet_link,
      meet_id,
      meet_password,
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : null,
      duration,
      language,
      max_participants,
      admission_mode,
      category,
      privacy,
      tnc,
      accepting_rsvp,
      accepting_attendance,
      require_approval: require_approval ?? true,
      group_id: group_id ?? null,
      calendar_id: calendar_id ?? null,
      short_code: genShortCode(),
      created_by: req.user.id
    })
    .catch(() => null);

  if (!result) return InternalError('Failed to create event');

  const eventId = result[0].insertId;

  // Auto-add creator as owner
  const memberResult = await db
    .insert(eventMembers)
    .values({
      event_id: eventId,
      user_id: req.user.id,
      role: 'owner',
      invited: true,
      joined: true,
      confirm: true
    })
    .catch(() => null);

  if (!memberResult) return InternalError('Failed to create event membership');

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .catch(() => []);

  return Created(event, 'Event created successfully');
};

export const listEvents = async (req, res) => {
  const { filter, category, mine } = req.query;

  const conditions = [];

  if (mine === 'true' && req.user) {
    conditions.push(eq(events.created_by, req.user.id));
  } else if (mine === 'true' && !req.user) {
    return Ok([]);
  }

  // Privacy filter
  if (filter === 'public' || filter === 'private') {
    conditions.push(eq(events.privacy, filter));
  } else if (mine !== 'true') {
    conditions.push(eq(events.privacy, 'public'));
  }

  if (category) conditions.push(eq(events.category, category));
  if (filter === 'online' || filter === 'offline') {
    conditions.push(eq(events.medium, filter));
  }

  const rows = await db
    .select()
    .from(events)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .catch(() => null);

  if (!rows) return InternalError('Failed to fetch events');

  return Ok(rows);
};

async function withEventPeople(event) {
  if (!event) return event;

  const [host] = await db
    .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
    .from(users)
    .where(eq(users.id, event.created_by))
    .catch(() => []);

  const going = await db
    .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
    .from(rsvps)
    .leftJoin(users, eq(rsvps.user_id, users.id))
    .where(and(eq(rsvps.event_id, event.id), eq(rsvps.approved, true)))
    .catch(() => []);

  return {
    ...event,
    host: host || null,
    going,
    going_count: going.length,
  };
}

export const getEvent = async (req, res) => {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, parseInt(req.params.id)))
    .catch(() => []);

  if (!event) return NotFound('Event not found');

  return Ok(await withEventPeople(event));
};

export const acceptInvitation = async (req, res) => {
  const token = req.params.token;
  const [invitation] = await db.select().from(eventInvitations).where(eq(eventInvitations.token, token)).catch(() => []);
  if (!invitation) return NotFound('Invitation not found');
  if (invitation.status === 'accepted') return BadRequest('Invitation already accepted');
  if (invitation.status === 'rejected' || invitation.status === 'revoked') return BadRequest('Invitation is no longer active');

  const [event] = await db.select().from(events).where(eq(events.id, invitation.event_id)).catch(() => []);
  if (!event) return NotFound('Event not found');
  if (event.created_by === req.user.id) return BadRequest('You cannot accept your own event invitation');

  const [existing] = await db.select().from(rsvps).where(and(eq(rsvps.event_id, event.id), eq(rsvps.user_id, req.user.id))).catch(() => []);
  if (existing?.approved) return BadRequest('You are already going to this event');

  let membershipId = existing?.membership_id || null;
  if (!membershipId) {
    const memberResult = await db.insert(eventMembers).values({
      event_id: event.id,
      user_id: req.user.id,
      role: 'attendee',
      invited: true,
      joined: false,
      confirm: false,
    }).catch(() => null);
    if (!memberResult) return InternalError('Failed to create membership');
    membershipId = memberResult[0].insertId;
  }

  if (existing) {
    await db.update(rsvps).set({ approved: true, pending: false, rejected: false, membership_id: membershipId }).where(eq(rsvps.id, existing.id)).catch(() => null);
  } else {
    const created = await db.insert(rsvps).values({
      event_id: event.id,
      user_id: req.user.id,
      owner_user_id: event.created_by,
      approved: true,
      rejected: false,
      pending: false,
      membership_id: membershipId,
    }).catch(() => null);
    if (!created) return InternalError('Failed to accept invitation');
  }

  await db.update(eventInvitations).set({ status: 'accepted', accepted_by: req.user.id, accepted_at: new Date() }).where(eq(eventInvitations.id, invitation.id)).catch(() => null);
  await db.insert(notifications).values({
    user_id: event.created_by,
    from_user_id: req.user.id,
    from_user_name: req.user.name,
    type: 'INVITE_ACCEPTED',
    message: `${req.user.name} accepted your invitation to ${event.title}`,
  }).catch(() => {});

  return Ok(null, 'Invitation accepted');
};

export const rejectInvitation = async (req, res) => {
  const token = req.params.token;
  const [invitation] = await db.select().from(eventInvitations).where(eq(eventInvitations.token, token)).catch(() => []);
  if (!invitation) return NotFound('Invitation not found');
  if (invitation.status === 'accepted') return BadRequest('Invitation already accepted');

  const updated = await db.update(eventInvitations).set({ status: 'rejected' }).where(eq(eventInvitations.id, invitation.id)).catch(() => null);
  if (!updated) return InternalError('Failed to reject invitation');
  return Ok(null, 'Invitation rejected');
};

// Resolve a short share code (/<code>) to its event.
export const getEventByCode = async (req, res) => {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.short_code, req.params.code))
    .catch(() => []);

  if (!event) return NotFound('Event not found');

  return Ok(await withEventPeople(event));
};

export const updateEvent = async (req, res) => {
  const eventId = parseInt(req.params.id);

  const [existing] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .catch(() => []);
  if (!existing) return NotFound('Event not found');
  if (existing.created_by !== req.user.id) return Forbidden('Only the creator can update');

  const allowed = [
    'title',
    'description',
    'medium',
    'location_name',
    'latitude',
    'longitude',
    'meet_link',
    'meet_id',
    'meet_password',
    'start_date',
    'end_date',
    'duration',
    'language',
    'max_participants',
    'admission_mode',
    'category',
    'privacy',
    'image',
    'tnc',
    'accepting_rsvp',
    'accepting_attendance',
    'require_approval',
    'group_id',
    'calendar_id',
    'check_in_code'
  ];

  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] =
        key === 'start_date' || key === 'end_date'
          ? req.body[key]
            ? new Date(req.body[key])
            : null
          : req.body[key];
    }
  }

  if (Object.keys(updates).length === 0) return BadRequest('No valid fields to update');

  const updated = await db
    .update(events)
    .set(updates)
    .where(eq(events.id, eventId))
    .catch(() => null);
  if (!updated) return InternalError('Failed to update event');

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .catch(() => []);

  return Ok(event, 'Event updated successfully');
};

export const deleteEvent = async (req, res) => {
  const eventId = parseInt(req.params.id);

  const [existing] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .catch(() => []);
  if (!existing) return NotFound('Event not found');
  if (existing.created_by !== req.user.id) return Forbidden('Only the creator can delete');

  const deleted = await db
    .delete(events)
    .where(eq(events.id, eventId))
    .catch(() => null);
  if (!deleted) return InternalError('Failed to delete event');

  return Ok(null, 'Event deleted');
};

export const uploadEventImage = async (req, res) => {
  if (!req.file) return BadRequest('No image provided');

  const eventId = parseInt(req.params.id);

  const [existing] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .catch(() => []);
  if (!existing) return NotFound('Event not found');
  if (existing.created_by !== req.user.id) return Forbidden('Only the creator can upload images');

  const imageUrl = `/uploads/${req.file.filename}`;

  const updated = await db
    .update(events)
    .set({ image: imageUrl })
    .where(eq(events.id, eventId))
    .catch(() => null);
  if (!updated) return InternalError('Failed to update event image');

  return Ok({ image: imageUrl }, 'Image uploaded');
};
