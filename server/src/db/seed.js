import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "./index.js";
import { users, events, rsvps, eventMembers, notifications } from "./schema.js";

// ── Seed Data ────────────────────────────────────────────────────────
const SEED_USERS = [
  { name: "Srijana Dahal", email: "srijana.dahal@mahotsav.com", phone: "+977-9801111111" },
  { name: "Aarav Sharma", email: "aarav.sharma@mahotsav.com", phone: "+977-9801234567" },
  { name: "Bikash Thapa", email: "bikash.thapa@mahotsav.com", phone: "+977-9823456789" },
  { name: "Nisha Tamang", email: "nisha.tamang@mahotsav.com", phone: "+977-9834567890" },
  { name: "Rajesh Adhikari", email: "rajesh.adhikari@mahotsav.com", phone: "+977-9845678901" },
  { name: "Prabina Shrestha", email: "prabina.shrestha@mahotsav.com", phone: "+977-9856789012" },
  { name: "Suman Karki", email: "suman.karki@mahotsav.com", phone: "+977-9867890123" },
  { name: "Anita Gurung", email: "anita.gurung@mahotsav.com", phone: "+977-9878901234" },
  { name: "Dipak Poudel", email: "dipak.poudel@mahotsav.com", phone: "+977-9889012345" },
  { name: "Maya Rai", email: "maya.rai@mahotsav.com", phone: "+977-9890123456" },
  { name: "Rohan Koirala", email: "rohan.koirala@mahotsav.com", phone: "+977-9802222222" },
  { name: "Sita Magar", email: "sita.magar@mahotsav.com", phone: "+977-9803333333" },
  { name: "Hari Subedi", email: "hari.subedi@mahotsav.com", phone: "+977-9804444444" },
  { name: "Gita Limbu", email: "gita.limbu@mahotsav.com", phone: "+977-9805555555" },
  { name: "Krishna Basnet", email: "krishna.basnet@mahotsav.com", phone: "+977-9806666666" },
  { name: "Laxmi Chhetri", email: "laxmi.chhetri@mahotsav.com", phone: "+977-9807777777" },
  { name: "Bimal Pandey", email: "bimal.pandey@mahotsav.com", phone: "+977-9808888888" },
  { name: "Kamala Sherpa", email: "kamala.sherpa@mahotsav.com", phone: "+977-9809999999" },
  { name: "Dinesh Rana", email: "dinesh.rana@mahotsav.com", phone: "+977-9810000000" },
  { name: "Sarita Yadav", email: "sarita.yadav@mahotsav.com", phone: "+977-9811111111" },
];

const LOCATIONS = [
  { name: "Pulchowk Campus, Lalitpur", lat: "27.6828", lng: "85.3217" },
  { name: "Thapathali Campus, Kathmandu", lat: "27.6910", lng: "85.3190" },
  { name: "Pashupati Campus, Kathmandu", lat: "27.7060", lng: "85.3480" },
  { name: "Bhrikutimandap, Kathmandu", lat: "27.7003", lng: "85.3145" },
  { name: "Narayanhiti Palace Museum, Kathmandu", lat: "27.7050", lng: "85.3150" },
  { name: "Kathmandu University, Dhulikhel", lat: "27.6197", lng: "85.5397" },
  { name: "Tribhuvan University, Kirtipur", lat: "27.6810", lng: "85.2780" },
  { name: "Bhaktapur Durbar Square", lat: "27.6710", lng: "85.4290" },
  { name: "Thamel, Kathmandu", lat: "27.7083", lng: "85.3129" },
  { name: "Pokhara Lakeside, Pokhara", lat: "28.2096", lng: "83.9570" },
];

const CATEGORIES = [
  "Technology", "Music", "Sports", "Arts", "Film",
  "Literature", "Culture", "Games", "Charity", "Lifestyle",
];

const EVENT_TITLES = [
  { title: "Tech Fest 2025", cat: "Technology", desc: "Annual technology festival featuring coding competitions, hackathons, and tech talks by industry leaders." },
  { title: "Hackathon: Build for Nepal", cat: "Technology", desc: "48-hour hackathon focused on building solutions for local Nepali communities." },
  { title: "AI & ML Workshop", cat: "Technology", desc: "Hands-on workshop covering machine learning fundamentals and real-world applications." },
  { title: "Web Dev Bootcamp", cat: "Technology", desc: "Intensive 2-day bootcamp on modern web development with React and Node.js." },
  { title: "Cybersecurity Seminar", cat: "Technology", desc: "Learn about latest cybersecurity threats and defense mechanisms." },
  { title: "Open Source Meetup", cat: "Technology", desc: "Monthly meetup for open source contributors and enthusiasts." },
  { title: "Flutter App Workshop", cat: "Technology", desc: "Build your first cross-platform mobile app with Flutter." },
  { title: "Cloud Computing Day", cat: "Technology", desc: "Deep dive into AWS, Azure, and GCP with hands-on labs." },
  { title: "Data Science Conclave", cat: "Technology", desc: "Explore data science career paths with panels and networking." },
  { title: "Blockchain Basics", cat: "Technology", desc: "Introduction to blockchain technology and smart contracts." },
  { title: "Jazz Night Live", cat: "Music", desc: "An evening of smooth jazz performed by local and international artists." },
  { title: "Nepali Folk Music Festival", cat: "Music", desc: "Celebrating traditional Nepali folk music with live performances." },
  { title: "Open Mic Acoustic", cat: "Music", desc: "Bring your guitar and your voice. All are welcome to perform." },
  { title: "DJ Battle Royale", cat: "Music", desc: "Campus DJs compete head-to-head in an electrifying showdown." },
  { title: "Band Competition", cat: "Music", desc: "College bands battle it out for the grand prize and recording deal." },
  { title: "Inter-College Basketball", cat: "Sports", desc: "Annual basketball tournament between colleges in the valley." },
  { title: "Marathon for Education", cat: "Sports", desc: "5K and 10K runs to raise funds for rural education programs." },
  { title: "Cricket Tournament", cat: "Sports", desc: "T20 cricket tournament with teams from different departments." },
  { title: "Futsal Championship", cat: "Sports", desc: "5-a-side futsal competition on campus grounds." },
  { title: "Yoga & Wellness Day", cat: "Sports", desc: "Morning yoga session followed by wellness workshops." },
  { title: "Art Exhibition: Colours of Nepal", cat: "Arts", desc: "Showcasing works of emerging Nepali artists." },
  { title: "Pottery Workshop", cat: "Arts", desc: "Learn traditional Nepali pottery techniques from master artisans." },
  { title: "Photography Walk", cat: "Arts", desc: "Guided photography walk through the heritage sites of Kathmandu." },
  { title: "Street Art Festival", cat: "Arts", desc: "Live mural painting and street art demonstrations." },
  { title: "Film Screening: Nepali Cinema", cat: "Film", desc: "Screening of award-winning Nepali short films and documentaries." },
  { title: "Short Film Competition", cat: "Film", desc: "Students submit and screen their 5-minute short films." },
  { title: "Documentary Making Workshop", cat: "Film", desc: "Learn the art of documentary filmmaking from professionals." },
  { title: "Poetry Slam", cat: "Literature", desc: "Spoken word poetry competition with prizes for top performers." },
  { title: "Book Club Meetup", cat: "Literature", desc: "Monthly book discussion — this month featuring Nepali novels." },
  { title: "Creative Writing Workshop", cat: "Literature", desc: "Fiction writing techniques with published authors." },
  { title: "Dashain Cultural Fair", cat: "Culture", desc: "Celebrating Dashain with traditional food, dance, and rituals." },
  { title: "Holi Color Festival", cat: "Culture", desc: "Campus-wide Holi celebration with music and colors." },
  { title: "Newari Food Festival", cat: "Culture", desc: "Taste authentic Newari cuisine and learn about the culture." },
  { title: "ESports Tournament", cat: "Games", desc: "Compete in Valorant, CS2, and League of Legends tournaments." },
  { title: "Board Game Night", cat: "Games", desc: "An evening of strategy board games — Catan, Chess, and more." },
  { title: "Charity Run for Flood Relief", cat: "Charity", desc: "Running event to raise funds for recent flood-affected areas." },
  { title: "Blood Donation Drive", cat: "Charity", desc: "Organized in partnership with Nepal Red Cross Society." },
  { title: "Mental Health Awareness Walk", cat: "Lifestyle", desc: "Walk and talk session promoting mental health awareness." },
  { title: "Sustainable Living Workshop", cat: "Lifestyle", desc: "Learn practical tips for reducing your carbon footprint." },
  { title: "Career Fair 2025", cat: "Lifestyle", desc: "Connect with top employers and explore career opportunities." },
  { title: "Startup Pitch Competition", cat: "Technology", desc: "Pitch your startup idea to a panel of investors and mentors." },
  { title: "UI/UX Design Sprint", cat: "Technology", desc: "5-day design sprint to solve real user experience problems." },
  { title: "IoT Workshop", cat: "Technology", desc: "Build IoT projects using Arduino and Raspberry Pi." },
  { title: "Debate Championship", cat: "Literature", desc: "Inter-college debate competition on current affairs." },
  { title: "Tihar Lights Festival", cat: "Culture", desc: "Celebrate Tihar with deusi bhailo, rangoli, and sweets." },
  { title: "Table Tennis Tournament", cat: "Sports", desc: "Singles and doubles table tennis championship." },
  { title: "Calligraphy Workshop", cat: "Arts", desc: "Learn beautiful handwriting and Nepali script calligraphy." },
  { title: "Robotics Challenge", cat: "Technology", desc: "Build and program robots to complete obstacle courses." },
  { title: "Agricultural Tech Summit", cat: "Technology", desc: "How technology is transforming agriculture in Nepal." },
];

const EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop",
];

// ── Helpers ──────────────────────────────────────────────────────────
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = rand(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function randomDate(startOffset, endOffset) {
  const now = new Date();
  const start = new Date(now.getTime() + startOffset * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + endOffset * 24 * 60 * 60 * 1000);
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d; // returns Date object
}

// ── Seed ─────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Seeding database...\n");

  // 1. Seed Users
  const password = await bcrypt.hash("password123", 10);
  const userIds = [];

  for (const u of SEED_USERS) {
    try {
      const result = await db.insert(users).values({
        name: u.name, email: u.email, phone: u.phone, password,
      });
      const id = result[0].insertId;
      userIds.push(id);
      console.log(`  ✅ User: ${u.name} (${id})`);
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        const [row] = await db.select().from(users).where(eq(users.email, u.email));
        if (row) { userIds.push(row.id); console.log(`  ⏭️  User: ${u.name} — exists (${row.id})`); }
      } else {
        console.log(`  ❌ User: ${u.name} — ${err.message}`);
      }
    }
  }

  // 2. Seed Events (50 events across users)
  console.log("\n📅 Seeding events...");
  const eventIds = [];

  for (let i = 0; i < EVENT_TITLES.length; i++) {
    const e = EVENT_TITLES[i];
    const loc = pick(LOCATIONS);
    const isOnline = Math.random() > 0.7;
    const isPrivate = Math.random() > 0.8;
    // First 15 events → owned by first user (Srijana Dahal), rest random
    const ownerId = i < 15 ? userIds[0] : pick(userIds);
    const startDate = randomDate(-30, 90);
    const endDate = Math.random() > 0.5
      ? new Date(startDate.getTime() + rand(1, 8) * 60 * 60 * 1000)
      : null;

    try {
      const result = await db.insert(events).values({
        title: e.title,
        description: e.desc,
        medium: isOnline ? "online" : "offline",
        location_name: isOnline ? null : loc.name,
        latitude: isOnline ? null : loc.lat,
        longitude: isOnline ? null : loc.lng,
        meet_link: isOnline ? `https://meet.google.com/${Math.random().toString(36).slice(2, 8)}` : null,
        start_date: startDate,
        end_date: endDate,
        duration: `${rand(1, 4)}:${rand(10, 59)}`,
        language: "English",
        max_participants: Math.random() > 0.5 ? rand(20, 200) : 0,
        category: e.cat,
        privacy: isPrivate ? "private" : "public",
        image: pick(EVENT_IMAGES),
        tnc: Math.random() > 0.5 ? "1. Participants must carry valid ID.\n2. No refunds after registration.\n3. Organizers reserve the right to modify the schedule." : null,
        accepting_rsvp: true,
        accepting_attendance: Math.random() > 0.6,
        created_by: ownerId,
      });
      const eventId = result[0].insertId;
      eventIds.push(eventId);

      // Auto-add creator as owner member
      await db.insert(eventMembers).values({
        event_id: eventId, user_id: ownerId,
        role: "owner", invited: true, joined: true, confirm: true,
      }).catch(() => {});

    } catch (err) {
      console.log(`  ❌ Event: ${e.title} — ${err.message}`);
    }
  }
  console.log(`  ✅ Created ${eventIds.length} events`);

  // 3. Seed RSVPs (3-8 RSVPs per event)
  console.log("\n📨 Seeding RSVPs...");
  let rsvpCount = 0;

  for (const eventId of eventIds) {
    const rsvpUsers = shuffle(userIds).slice(0, rand(3, 8));
    for (const uid of rsvpUsers) {
      // Get owner of this event
      const [ownerMember] = await db.select().from(eventMembers)
        .where(and(
          eq(eventMembers.event_id, eventId),
          eq(eventMembers.role, "owner"),
        )).limit(1).catch(() => []);

      const ownerId = ownerMember?.user_id || pick(userIds);
      if (uid === ownerId) continue; // owner can't RSVP

      const isApproved = Math.random() > 0.3;
      const isRejected = !isApproved && Math.random() > 0.7;

      try {
        const result = await db.insert(rsvps).values({
          event_id: eventId,
          user_id: uid,
          owner_user_id: ownerId,
          approved: isApproved,
          rejected: isRejected,
          pending: !isApproved && !isRejected,
        });

        // If approved, also create member
        if (isApproved) {
          await db.insert(eventMembers).values({
            event_id: eventId, user_id: uid,
            role: "attendee", invited: true, joined: true, confirm: true,
          }).catch(() => {});
        }

        rsvpCount++;
      } catch (err) {
        // skip duplicates
      }
    }
  }
  console.log(`  ✅ Created ${rsvpCount} RSVPs`);

  // 4. Seed Notifications (2-5 per user)
  console.log("\n🔔 Seeding notifications...");
  let notifCount = 0;
  const notifTypes = ["RSVP", "RSVP_APPROVED", "RSVP_REJECTED", "INVITE", "INVITE_ACCEPTED"];
  const notifMessages = {
    RSVP: (name, title) => `${name} has RSVP'd to your event ${title}`,
    RSVP_APPROVED: (name, title) => `Your RSVP to ${title} has been approved`,
    RSVP_REJECTED: (name, title) => `Your RSVP to ${title} has been rejected`,
    INVITE: (name, title) => `${name} invited you to join ${title}`,
    INVITE_ACCEPTED: (name, title) => `A member accepted your invitation to ${title}`,
  };

  for (const uid of userIds) {
    const numNotifs = rand(2, 5);
    for (let i = 0; i < numNotifs; i++) {
      const type = pick(notifTypes);
      const fromUser = pick(userIds.filter((id) => id !== uid));
      const [fromRow] = await db.select().from(users).where(eq(users.id, fromUser)).catch(() => []);
      const event = eventIds.length > 0 ? pick(eventIds) : null;

      let msg = `${fromRow?.name || "Someone"} sent you a notification`;
      if (event) {
        const [eventRow] = await db.select().from(events).where(eq(events.id, event)).catch(() => []);
        if (eventRow) {
          const fn = notifMessages[type];
          msg = fn ? fn(fromRow?.name || "Someone", eventRow.title) : msg;
        }
      }

      try {
        await db.insert(notifications).values({
          user_id: uid,
          from_user_id: fromUser,
          from_user_name: fromRow?.name || "Unknown",
          type,
          message: msg,
          link: event ? `/event/${event}` : null,
          read: Math.random() > 0.5,
        });
        notifCount++;
      } catch (err) {
        // skip
      }
    }
  }
  console.log(`  ✅ Created ${notifCount} notifications`);

  console.log("\n🎉 Seeding complete!");
  console.log(`   Users:         ${userIds.length}`);
  console.log(`   Events:        ${eventIds.length}`);
  console.log(`   RSVPs:         ${rsvpCount}`);
  console.log(`   Notifications: ${notifCount}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
