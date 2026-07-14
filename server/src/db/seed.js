import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { db } from './index.js';
import {
  users,
  eventGroups,
  events,
  rsvps,
  eventMembers,
  attendance,
  notifications,
  certificateTemplates
} from './schema.js';

// ── Helpers ──────────────────────────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function futureDate(daysFromNow, hour, minute) {
  const now = new Date();
  const d = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ── Seed Data ────────────────────────────────────────────────────────

// ── Users ────────────────────────────────────────────────────────────
const ADMIN = {
  name: 'Admin Mahotsav',
  email: 'admin@mahotsav.com',
  phone: '+977-9800000001',
  role: 'admin'
};

const ORGANIZERS = [
  {
    name: 'Srijana Dahal',
    email: 'srijana@mahotsav.com',
    phone: '+977-9801111111',
    role: 'organizer'
  },
  {
    name: 'Aarav Sharma',
    email: 'aarav@mahotsav.com',
    phone: '+977-9802222222',
    role: 'organizer'
  },
  {
    name: 'Bikash Thapa',
    email: 'bikash@mahotsav.com',
    phone: '+977-9803333333',
    role: 'organizer'
  }
];

const ATTENDEES = [
  { name: 'Nisha Tamang', email: 'nisha.tamang@mahotsav.com', phone: '+977-9810000001' },
  { name: 'Rajesh Adhikari', email: 'rajesh.adhikari@mahotsav.com', phone: '+977-9810000002' },
  { name: 'Prabina Shrestha', email: 'prabina.shrestha@mahotsav.com', phone: '+977-9810000003' },
  { name: 'Suman Karki', email: 'suman.karki@mahotsav.com', phone: '+977-9810000004' },
  { name: 'Anita Gurung', email: 'anita.gurung@mahotsav.com', phone: '+977-9810000005' },
  { name: 'Dipak Poudel', email: 'dipak.poudel@mahotsav.com', phone: '+977-9810000006' },
  { name: 'Maya Rai', email: 'maya.rai@mahotsav.com', phone: '+977-9810000007' },
  { name: 'Rohan Koirala', email: 'rohan.koirala@mahotsav.com', phone: '+977-9810000008' },
  { name: 'Sita Magar', email: 'sita.magar@mahotsav.com', phone: '+977-9810000009' },
  { name: 'Hari Subedi', email: 'hari.subedi@mahotsav.com', phone: '+977-9810000010' },
  { name: 'Gita Limbu', email: 'gita.limbu@mahotsav.com', phone: '+977-9810000011' },
  { name: 'Krishna Basnet', email: 'krishna.basnet@mahotsav.com', phone: '+977-9810000012' },
  { name: 'Laxmi Chhetri', email: 'laxmi.chhetri@mahotsav.com', phone: '+977-9810000013' },
  { name: 'Bimal Pandey', email: 'bimal.pandey@mahotsav.com', phone: '+977-9810000014' },
  { name: 'Kamala Sherpa', email: 'kamala.sherpa@mahotsav.com', phone: '+977-9810000015' },
  { name: 'Dinesh Rana', email: 'dinesh.rana@mahotsav.com', phone: '+977-9810000016' },
  { name: 'Sarita Yadav', email: 'sarita.yadav@mahotsav.com', phone: '+977-9810000017' },
  { name: 'Bikram Khadka', email: 'bikram.khadka@mahotsav.com', phone: '+977-9810000018' },
  { name: 'Anjali Pariyar', email: 'anjali.pariyar@mahotsav.com', phone: '+977-9810000019' },
  { name: 'Sandesh Maharjan', email: 'sandesh.maharjan@mahotsav.com', phone: '+977-9810000020' },
  { name: 'Pramila Dongol', email: 'pramila.dongol@mahotsav.com', phone: '+977-9810000021' },
  { name: 'Ramesh Bhattrai', email: 'ramesh.bhattrai@mahotsav.com', phone: '+977-9810000022' },
  { name: 'Sunita Thakuri', email: 'sunita.thakuri@mahotsav.com', phone: '+977-9810000023' },
  { name: 'Aashis Manandhar', email: 'aashis.manandhar@mahotsav.com', phone: '+977-9810000024' },
  { name: 'Nirmala Rawal', email: 'nirmala.rawal@mahotsav.com', phone: '+977-9810000025' }
];

// ── Nepal Venues ─────────────────────────────────────────────────────
const VENUES = [
  { name: 'ACE Institute of Management, Satdobato', lat: '27.6710', lng: '85.3180' },
  { name: 'ACE Higher Secondary School, Gyaneshwor', lat: '27.7110', lng: '85.3330' },
  { name: 'Islington College (ICMS), Kamaladi', lat: '27.7040', lng: '85.3230' },
  { name: 'Pulchowk Campus, IOE, Lalitpur', lat: '27.6828', lng: '85.3217' },
  { name: 'Thapathali Campus, Kathmandu', lat: '27.6910', lng: '85.3190' },
  { name: 'Kathmandu University, Dhulikhel', lat: '27.6197', lng: '85.5397' },
  { name: 'Tribhuvan University, Kirtipur', lat: '27.6810', lng: '85.2780' },
  { name: "St. Xavier's College, Maitighar", lat: '27.6980', lng: '85.3250' },
  { name: 'British College, Thapathali', lat: '27.6920', lng: '85.3200' },
  { name: 'Himalayan White House College, Khumaltar', lat: '27.6590', lng: '85.3190' },
  { name: 'Deerwalk Institute of Technology, Sifal', lat: '27.7060', lng: '85.3450' },
  { name: 'Softwarica College, Dillibazar', lat: '27.7030', lng: '85.3280' },
  { name: 'Prime College, Khusibu', lat: '27.7080', lng: '85.2990' },
  { name: 'Apex College, Sinamangal', lat: '27.6850', lng: '85.3360' },
  { name: 'Texas International College, Mitrapark', lat: '27.6880', lng: '85.3350' },
  { name: 'Sagarmatha College, Sanepa', lat: '27.6760', lng: '85.3130' },
  { name: 'Nagarjuna College, Kalanki', lat: '27.6990', lng: '85.2800' },
  { name: 'Chandigarh International College, Baneshwor', lat: '27.6930', lng: '85.3380' }
];

// ── Event Groups ─────────────────────────────────────────────────────
const SEED_GROUPS = [
  {
    title: 'Sports Week 2026',
    description:
      'Annual inter-department sports week featuring futsal, basketball, cricket, table tennis, and more. Open to all students.',
    category: 'Sports',
    cover_image: '/uploads/seed/sports.jpg',
    organizerIndex: 0, // Srijana
    subEvents: [
      {
        title: 'Futsal — Group Stage',
        cat: 'Sports',
        desc: '5-a-side futsal group stage matches. Teams from BCA, BBA, and BIM compete for knockout spots.',
        venue: 'ACE Institute of Management, Satdobato — Futsal Court',
        lat: '27.6710',
        lng: '85.3180',
        image: '/uploads/seed/futsal.jpg',
        dayOffset: 5,
        startHour: 8,
        endHour: 12,
        acceptingAttendance: true
      },
      {
        title: 'Futsal — Finals',
        cat: 'Sports',
        desc: 'Top two teams from the group stage battle it out for the trophy. Medal ceremony follows.',
        venue: 'ACE Institute of Management, Satdobato — Futsal Court',
        lat: '27.6710',
        lng: '85.3180',
        image: '/uploads/seed/futsal.jpg',
        dayOffset: 9,
        startHour: 14,
        endHour: 17,
        acceptingAttendance: true
      },
      {
        title: 'Basketball Tournament',
        cat: 'Sports',
        desc: "Inter-college basketball tournament — men's and women's divisions. 5-on-5 full court.",
        venue: 'Pulchowk Campus, IOE — Indoor Court',
        lat: '27.6828',
        lng: '85.3217',
        image: '/uploads/seed/basketball.jpg',
        dayOffset: 6,
        startHour: 10,
        endHour: 15,
        acceptingAttendance: true
      },
      {
        title: 'Cricket T20',
        cat: 'Sports',
        desc: 'T20 cricket match between BCA and BBA departments. Bring your cheering voices!',
        venue: 'Tribhuvan University Ground, Kirtipur',
        lat: '27.6810',
        lng: '85.2780',
        image: '/uploads/seed/cricket.jpg',
        dayOffset: 7,
        startHour: 9,
        endHour: 16,
        acceptingAttendance: true
      },
      {
        title: 'Table Tennis Singles',
        cat: 'Sports',
        desc: 'Singles table tennis championship — knockout format. Open to all students.',
        venue: 'ACE Higher Secondary School, Gyaneshwor — Hall',
        lat: '27.7110',
        lng: '85.3330',
        image: '/uploads/seed/sports.jpg',
        dayOffset: 8,
        startHour: 11,
        endHour: 14,
        acceptingAttendance: true
      }
    ]
  },
  {
    title: 'Tech Fest 2026',
    description:
      'A 3-day technology festival featuring hackathons, coding competitions, tech talks, and workshops. Organized by the BCA department.',
    category: 'Technology',
    cover_image: '/uploads/seed/tech-fest.jpg',
    organizerIndex: 1, // Aarav
    subEvents: [
      {
        title: 'Hackathon: Build for Nepal',
        cat: 'Technology',
        desc: '24-hour hackathon. Build a prototype that solves a real problem facing Nepal. Teams of 3-4. Prizes worth Rs. 50,000.',
        venue: 'Islington College (ICMS), Kamaladi — Computer Lab',
        lat: '27.7040',
        lng: '85.3230',
        image: '/uploads/seed/hackathon.jpg',
        dayOffset: 12,
        startHour: 8,
        endHour: 20,
        acceptingAttendance: true
      },
      {
        title: 'Code Championship',
        cat: 'Technology',
        desc: 'Competitive programming contest — 5 problems, 3 hours. Top 3 win prizes and internship interviews.',
        venue: 'Deerwalk Institute of Technology, Sifal — Lab 1',
        lat: '27.7060',
        lng: '85.3450',
        image: '/uploads/seed/coding.jpg',
        dayOffset: 13,
        startHour: 10,
        endHour: 13,
        acceptingAttendance: true
      },
      {
        title: 'AI & ML Workshop',
        cat: 'Technology',
        desc: 'Hands-on workshop covering machine learning fundamentals using Python and scikit-learn. Laptops required.',
        venue: 'Softwarica College, Dillibazar — Room 301',
        lat: '27.7030',
        lng: '85.3280',
        image: '/uploads/seed/workshop.jpg',
        dayOffset: 14,
        startHour: 10,
        endHour: 16,
        acceptingAttendance: true
      }
    ]
  },
  {
    title: 'Cultural Week 2026',
    description:
      'Celebrating the diversity of Nepal through music, art, food, and cultural performances. A week of colors, rhythms, and flavors.',
    category: 'Culture',
    cover_image: '/uploads/seed/culture.jpg',
    organizerIndex: 0, // Srijana
    subEvents: [
      {
        title: 'Nepali Folk Music Night',
        cat: 'Music',
        desc: 'Live performances of traditional Nepali folk music — Madal, Sarangi, and Panche Baja. Food stalls available.',
        venue: 'ACE Institute of Management, Satdobato — Open Amphitheatre',
        lat: '27.6710',
        lng: '85.3180',
        image: '/uploads/seed/music.jpg',
        dayOffset: 20,
        startHour: 17,
        endHour: 21,
        acceptingAttendance: false
      },
      {
        title: 'Art Exhibition: Colours of Nepal',
        cat: 'Arts',
        desc: 'Showcasing paintings, sculptures, and mixed media works by emerging Nepali artists. Open for all to visit.',
        venue: 'Himalayan White House College, Khumaltar — Gallery Hall',
        lat: '27.6590',
        lng: '85.3190',
        image: '/uploads/seed/art.jpg',
        dayOffset: 21,
        startHour: 10,
        endHour: 17,
        acceptingAttendance: false
      },
      {
        title: 'Newari Food Festival',
        cat: 'Culture',
        desc: 'Taste authentic Newari cuisine — Chatamari, Bara, Choila, Yomari, and more. Prepared by local Newari chefs.',
        venue: "St. Xavier's College, Maitighar — Courtyard",
        lat: '27.6980',
        lng: '85.3250',
        image: '/uploads/seed/culture.jpg',
        dayOffset: 22,
        startHour: 11,
        endHour: 18,
        acceptingAttendance: false
      }
    ]
  }
];

// ── Standalone Events (not in groups) ────────────────────────────────
const STANDALONE_EVENTS = [
  {
    title: 'Web Dev Bootcamp: React + Node.js',
    cat: 'Technology',
    desc: 'Intensive 2-day bootcamp on modern web development. Day 1: React fundamentals, hooks, routing. Day 2: Node.js, Express, and building a full-stack app. Laptops required. Certificates provided.',
    venue: 'Softwarica College, Dillibazar — Lab 2',
    lat: '27.7030',
    lng: '85.3280',
    image: '/uploads/seed/workshop.jpg',
    organizerIndex: 1,
    dayOffset: 15,
    startHour: 9,
    endHour: 17,
    maxParticipants: 40,
    acceptingAttendance: true
  },
  {
    title: 'Cybersecurity 101 Seminar',
    cat: 'Technology',
    desc: 'Introduction to cybersecurity threats in Nepal — phishing, ransomware, social engineering. Learn practical defense techniques. Open to all departments.',
    venue: 'Islington College (ICMS), Kamaladi — Auditorium',
    lat: '27.7040',
    lng: '85.3230',
    image: '/uploads/seed/seminar.jpg',
    organizerIndex: 2,
    dayOffset: 18,
    startHour: 13,
    endHour: 16,
    maxParticipants: 100,
    acceptingAttendance: true
  },
  {
    title: 'Career Fair 2026',
    cat: 'Lifestyle',
    desc: "Connect with 15+ top employers from Nepal's tech, finance, and management sectors. Bring your resume. On-spot interviews available.",
    venue: 'ACE Institute of Management, Satdobato — Main Hall',
    lat: '27.6710',
    lng: '85.3180',
    image: '/uploads/seed/career.jpg',
    organizerIndex: 0,
    dayOffset: 25,
    startHour: 10,
    endHour: 16,
    maxParticipants: 200,
    acceptingAttendance: false
  },
  {
    title: 'Inter-College Debate Championship',
    cat: 'Literature',
    desc: 'Debate competition on current affairs — Nepali politics, climate change, and AI ethics. Teams of 2 per college. Grand prize Rs. 25,000.',
    venue: 'British College, Thapathali — Seminar Hall',
    lat: '27.6920',
    lng: '85.3200',
    image: '/uploads/seed/debate.jpg',
    organizerIndex: 1,
    dayOffset: 30,
    startHour: 10,
    endHour: 15,
    maxParticipants: 60,
    acceptingAttendance: true
  },
  {
    title: 'Yoga & Wellness Morning',
    cat: 'Lifestyle',
    desc: 'Start your morning with guided yoga and meditation on the campus grounds. Mats provided. Open to all students and faculty.',
    venue: 'Kathmandu University, Dhulikhel — Central Lawn',
    lat: '27.6197',
    lng: '85.5397',
    image: '/uploads/seed/yoga.jpg',
    organizerIndex: 2,
    dayOffset: 10,
    startHour: 6,
    endHour: 8,
    maxParticipants: 0,
    acceptingAttendance: false
  },
  {
    title: 'Open Mic Night',
    cat: 'Music',
    desc: 'Bring your guitar, your voice, your poetry — anything goes. Solo or group performances welcome. Sign up at the door.',
    venue: 'Sagarmatha College, Sanepa — Cafeteria Hall',
    lat: '27.6760',
    lng: '85.3130',
    image: '/uploads/seed/music.jpg',
    organizerIndex: 0,
    dayOffset: 35,
    startHour: 17,
    endHour: 20,
    maxParticipants: 0,
    acceptingAttendance: false
  },
  {
    title: 'Startup Pitch Competition',
    cat: 'Technology',
    desc: "Pitch your startup idea to a panel of investors and mentors from Nepal's startup ecosystem. Top 3 ideas win incubation support and seed funding.",
    venue: 'Prime College, Khusibu — Conference Room',
    lat: '27.7080',
    lng: '85.2990',
    image: '/uploads/seed/career.jpg',
    organizerIndex: 1,
    dayOffset: 40,
    startHour: 10,
    endHour: 14,
    maxParticipants: 50,
    acceptingAttendance: true
  },
  {
    title: 'Blood Donation Drive',
    cat: 'Charity',
    desc: 'Organized in partnership with Nepal Red Cross Society. All healthy students and faculty are encouraged to donate. Refreshments provided.',
    venue: 'ACE Institute of Management, Satdobato — Health Unit',
    lat: '27.6710',
    lng: '85.3180',
    image: '/uploads/seed/culture.jpg',
    organizerIndex: 2,
    dayOffset: 3,
    startHour: 9,
    endHour: 15,
    maxParticipants: 0,
    acceptingAttendance: false
  }
];

// ── Seed Function ────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Seeding database...\n');

  // ── Wipe all tables (reverse dependency order) ────────────────────
  console.log('🧹 Wiping existing data...');
  const conn = await import('mysql2/promise').then((m) =>
    m.createConnection(process.env.DATABASE_URL)
  );
  const tables = [
    'certificates',
    'certificate_templates',
    'attendance',
    'notifications',
    'rsvps',
    'event_members',
    'events',
    'event_groups',
    'users'
  ];
  for (const table of tables) {
    try {
      await conn.execute(`DELETE FROM \`${table}\``);
      console.log(`  🗑  ${table}`);
    } catch (err) {
      console.log(`  ⏭️  ${table} — ${err.message}`);
    }
  }
  await conn.end();
  console.log('');

  const password = await bcrypt.hash('password123', 10);

  // ── 1. Create Admin ───────────────────────────────────────────────
  const adminIds = [];
  {
    const result = await db.insert(users).values({
      name: ADMIN.name,
      email: ADMIN.email,
      phone: ADMIN.phone,
      password,
      role: ADMIN.role
    });
    const id = result[0].insertId;
    adminIds.push(id);
    console.log(`  👑 Admin: ${ADMIN.name} (${id}) — password123`);
  }

  // ── 2. Create Organizers ──────────────────────────────────────────
  const organizerIds = [];
  for (const o of ORGANIZERS) {
    const result = await db.insert(users).values({
      name: o.name,
      email: o.email,
      phone: o.phone,
      password,
      role: 'organizer'
    });
    const id = result[0].insertId;
    organizerIds.push(id);
    console.log(`  🎓 Organizer: ${o.name} (${id}) — password123`);
  }

  // ── 3. Create Attendees ───────────────────────────────────────────
  const attendeeIds = [];
  for (const a of ATTENDEES) {
    const result = await db.insert(users).values({
      name: a.name,
      email: a.email,
      phone: a.phone,
      password,
      role: 'attendee'
    });
    const id = result[0].insertId;
    attendeeIds.push(id);
  }
  console.log(`  👥 Attendees: ${attendeeIds.length} created — password123\n`);

  const allUserIds = [...adminIds, ...organizerIds, ...attendeeIds];
  const rsvpPool = shuffle(attendeeIds); // attendees are the RSVPers

  // ── 4. Create Event Groups + Sub-events ───────────────────────────
  console.log('📅 Seeding event groups & sub-events...\n');
  const allEventIds = [];

  for (const group of SEED_GROUPS) {
    const organizerId = organizerIds[group.organizerIndex];
    const groupResult = await db.insert(eventGroups).values({
      title: group.title,
      description: group.description,
      category: group.category,
      cover_image: group.cover_image,
      privacy: 'public',
      created_by: organizerId
    });
    const groupId = groupResult[0].insertId;
    console.log(`  📁 Group: ${group.title} (id=${groupId}, organizer=${organizerId})`);

    for (const sub of group.subEvents) {
      const startDate = futureDate(
        sub.dayOffset,
        sub.startHour,
        sub.endHour > sub.startHour ? sub.startHour : sub.startHour
      );
      const endDate = futureDate(sub.dayOffset, sub.endHour, 0);
      const eventResult = await db.insert(events).values({
        title: sub.title,
        description: sub.desc,
        medium: 'offline',
        location_name: sub.venue,
        latitude: sub.lat,
        longitude: sub.lng,
        start_date: startDate,
        end_date: endDate,
        duration: `${sub.endHour - sub.startHour}h`,
        language: 'English',
        max_participants: 0,
        category: sub.cat,
        privacy: 'public',
        image: sub.image,
        tnc: null,
        accepting_rsvp: true,
        accepting_attendance: sub.acceptingAttendance ? true : false,
        group_id: groupId,
        created_by: organizerId
      });
      const eventId = eventResult[0].insertId;
      allEventIds.push(eventId);

      // Creator as owner
      await db
        .insert(eventMembers)
        .values({
          event_id: eventId,
          user_id: organizerId,
          role: 'owner',
          invited: true,
          joined: true,
          confirm: true
        })
        .catch(() => {});

      console.log(`    📌 ${sub.title} (event=${eventId}, ${sub.venue})`);
    }
    console.log('');
  }

  // ── 5. Create Standalone Events ───────────────────────────────────
  console.log('📌 Seeding standalone events...\n');
  for (const ev of STANDALONE_EVENTS) {
    const organizerId = organizerIds[ev.organizerIndex];
    const startDate = futureDate(ev.dayOffset, ev.startHour, 0);
    const endDate = futureDate(ev.dayOffset, ev.endHour, 0);
    const eventResult = await db.insert(events).values({
      title: ev.title,
      description: ev.desc,
      medium: 'offline',
      location_name: ev.venue,
      latitude: ev.lat,
      longitude: ev.lng,
      start_date: startDate,
      end_date: endDate,
      duration: `${ev.endHour - ev.startHour}h`,
      language: 'English',
      max_participants: ev.maxParticipants || 0,
      category: ev.cat,
      privacy: 'public',
      image: ev.image,
      tnc: null,
      accepting_rsvp: true,
      accepting_attendance: ev.acceptingAttendance ? true : false,
      created_by: organizerId
    });
    const eventId = eventResult[0].insertId;
    allEventIds.push(eventId);

    // Creator as owner
    await db
      .insert(eventMembers)
      .values({
        event_id: eventId,
        user_id: organizerId,
        role: 'owner',
        invited: true,
        joined: true,
        confirm: true
      })
      .catch(() => {});

    console.log(`  📌 ${ev.title} (event=${eventId}, organizer=${organizerId})`);
  }

  // ── 6. Seed RSVPs ─────────────────────────────────────────────────
  console.log('\n📨 Seeding RSVPs...');
  let rsvpCount = 0;
  const approvedRsvpMap = {}; // eventId -> [userId, ...]

  for (const eventId of allEventIds) {
    // 5-12 random attendees RSVP
    const numRsvps = rand(5, Math.min(12, attendeeIds.length));
    const rsvpUsers = shuffle(attendeeIds).slice(0, numRsvps);

    // Get event owner
    const [ownerRow] = await db
      .select()
      .from(eventMembers)
      .where(and(eq(eventMembers.event_id, eventId), eq(eventMembers.role, 'owner')))
      .limit(1)
      .catch(() => []);
    const ownerId = ownerRow?.user_id || organizerIds[0];

    approvedRsvpMap[eventId] = [];

    for (const uid of rsvpUsers) {
      if (uid === ownerId) continue;

      const isApproved = Math.random() > 0.25; // 75% approval rate
      const isRejected = !isApproved && Math.random() > 0.6;

      try {
        await db.insert(rsvps).values({
          event_id: eventId,
          user_id: uid,
          owner_user_id: ownerId,
          approved: isApproved,
          rejected: isRejected,
          pending: !isApproved && !isRejected
        });

        if (isApproved) {
          approvedRsvpMap[eventId].push(uid);
          await db
            .insert(eventMembers)
            .values({
              event_id: eventId,
              user_id: uid,
              role: 'attendee',
              invited: true,
              joined: true,
              confirm: true
            })
            .catch(() => {});
        }
        rsvpCount++;
      } catch (err) {
        // skip duplicates
      }
    }
  }
  console.log(`  ✅ Created ${rsvpCount} RSVPs\n`);

  // ── 7. Seed Attendance (for events with accepting_attendance) ─────
  console.log('✅ Seeding attendance...');
  let attendanceCount = 0;

  for (const eventId of allEventIds) {
    const approved = approvedRsvpMap[eventId] || [];
    if (approved.length === 0) continue;

    // Check if event accepts attendance
    const [eventRow] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .catch(() => []);
    if (!eventRow?.accepting_attendance) continue;

    // 60-90% of approved attendees checked in
    for (const uid of approved) {
      const isCheckedIn = Math.random() > 0.2; // 80% attendance rate
      if (isCheckedIn) {
        try {
          await db.insert(attendance).values({
            event_id: eventId,
            user_id: uid,
            checked_in: true,
            check_in_method: Math.random() > 0.5 ? 'manual' : 'self'
          });
          attendanceCount++;
        } catch (err) {
          // skip
        }
      }
    }
  }
  console.log(`  ✅ Created ${attendanceCount} attendance records\n`);

  // ── 8. Seed Notifications ─────────────────────────────────────────
  console.log('🔔 Seeding notifications...');
  let notifCount = 0;
  const notifTypes = ['RSVP', 'RSVP_APPROVED', 'RSVP_REJECTED', 'INVITE', 'INVITE_ACCEPTED'];
  const notifMessages = {
    RSVP: (name, title) => `${name} has RSVP'd to your event ${title}`,
    RSVP_APPROVED: (name, title) => `Your RSVP to ${title} has been approved`,
    RSVP_REJECTED: (name, title) => `Your RSVP to ${title} has been rejected`,
    INVITE: (name, title) => `${name} invited you to collaborate on ${title}`,
    INVITE_ACCEPTED: (name, title) => `${name} accepted your invitation to ${title}`
  };

  for (const uid of allUserIds) {
    const numNotifs = rand(2, 5);
    for (let i = 0; i < numNotifs; i++) {
      const type = pick(notifTypes);
      const fromPool = allUserIds.filter((id) => id !== uid);
      const fromUserId = pick(fromPool);
      const [fromRow] = await db
        .select()
        .from(users)
        .where(eq(users.id, fromUserId))
        .catch(() => []);
      const eventId = pick(allEventIds);

      let msg = `${fromRow?.name || 'Someone'} sent you a notification`;
      const [eventRow] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .catch(() => []);
      if (eventRow) {
        const fn = notifMessages[type];
        msg = fn ? fn(fromRow?.name || 'Someone', eventRow.title) : msg;
      }

      try {
        await db.insert(notifications).values({
          user_id: uid,
          from_user_id: fromUserId,
          from_user_name: fromRow?.name || 'Unknown',
          type,
          message: msg,
          link: `/event/${eventId}`,
          read: Math.random() > 0.4
        });
        notifCount++;
      } catch (err) {
        // skip
      }
    }
  }
  console.log(`  ✅ Created ${notifCount} notifications\n`);

  // ── 9. Seed Certificate Templates ─────────────────────────────────
  console.log('📜 Seeding certificate templates...');
  await db
    .insert(certificateTemplates)
    .values([
      { name: 'Classic', theme: 'classic', created_by: organizerIds[0] },
      { name: 'Modern', theme: 'modern', created_by: organizerIds[0] },
      { name: 'Sports', theme: 'sports', created_by: organizerIds[0] }
    ])
    .catch(() => {});
  console.log('  ✅ Created 3 built-in templates (Classic, Modern, Sports)\n');

  // ── Summary ───────────────────────────────────────────────────────
  console.log('🎉 Seeding complete!\n');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │  Login Credentials (all use: password123)     │');
  console.log('  ├──────────────────────────────────────────────┤');
  console.log(`  │  👑 Admin:    ${ADMIN.email.padEnd(30)}   │`);
  for (const o of ORGANIZERS) {
    console.log(`  │  🎓 Organizer: ${o.email.padEnd(29)}   │`);
  }
  console.log(
    `  │  👥 Attendees: ${ATTENDEES[0].email.padEnd(15)} ... ${ATTENDEES[ATTENDEES.length - 1].email}  │`
  );
  console.log('  └──────────────────────────────────────────────┘\n');

  console.log(
    `  Users:           ${allUserIds.length} (1 admin, ${organizerIds.length} organizers, ${attendeeIds.length} attendees)`
  );
  console.log(`  Event Groups:    ${SEED_GROUPS.length}`);
  console.log(`  Sub-events:      ${SEED_GROUPS.reduce((sum, g) => sum + g.subEvents.length, 0)}`);
  console.log(`  Standalone:      ${STANDALONE_EVENTS.length}`);
  console.log(`  Total Events:    ${allEventIds.length}`);
  console.log(`  RSVPs:           ${rsvpCount}`);
  console.log(`  Attendance:      ${attendanceCount}`);
  console.log(`  Notifications:   ${notifCount}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
