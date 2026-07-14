import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './index.js';
import { users, categories, calendars, calendarFollows, events, eventMembers, rsvps } from './schema.js';

const PASSWORD = 'password123';

const CATEGORY_LABELS = [
  'Music', 'Games', 'Sports', 'Arts', 'Film', 'Literature', 'Technology',
  'Culture', 'Lifestyle', 'Charity', 'Faishon', 'Kids', 'Other',
];

const CATEGORY_META = {
  Music: ['music', '#ec4899'], Games: ['game', '#8b5cf6'], Sports: ['sports', '#22c55e'],
  Arts: ['art', '#f97316'], Film: ['film', '#ef4444'], Literature: ['book', '#6366f1'],
  Technology: ['tech', '#06b6d4'], Culture: ['culture', '#eab308'], Lifestyle: ['lifestyle', '#14b8a6'],
  Charity: ['charity', '#f43f5e'], Faishon: ['fashion', '#d946ef'], Kids: ['kids', '#84cc16'], Other: ['sparkles', '#78716c'],
};

const CITIES = [
  { city: 'Kathmandu', lat: '27.7172453', lng: '85.3239605' },
  { city: 'Lalitpur', lat: '27.6588000', lng: '85.3247000' },
  { city: 'Bhaktapur', lat: '27.6710000', lng: '85.4298000' },
  { city: 'Pokhara', lat: '28.2096000', lng: '83.9856000' },
  { city: 'Chitwan', lat: '27.5291000', lng: '84.3542000' },
  { city: 'Biratnagar', lat: '26.4525000', lng: '87.2718000' },
  { city: 'Butwal', lat: '27.7006000', lng: '83.4484000' },
  { city: 'Dharan', lat: '26.8125000', lng: '87.2833000' },
  { city: 'Nepalgunj', lat: '28.0500000', lng: '81.6167000' },
  { city: 'Janakpur', lat: '26.7288000', lng: '85.9263000' },
];

const VENUES = [
  ['Nepal Academy Hall, Kamaladi', 'Kathmandu', '27.7065000', '85.3206000'],
  ['Patan Museum Courtyard', 'Lalitpur', '27.6727000', '85.3253000'],
  ['Bhaktapur Durbar Square Community Hall', 'Bhaktapur', '27.6721000', '85.4288000'],
  ['Pokhara Lakeside Event Ground', 'Pokhara', '28.2096000', '83.9586000'],
  ['Sauraha Community Center', 'Chitwan', '27.5797000', '84.4986000'],
  ['Biratnagar City Hall', 'Biratnagar', '26.4525000', '87.2718000'],
  ['Butwal International Convention Center', 'Butwal', '27.7006000', '83.4484000'],
  ['Dharan Sabha Griha', 'Dharan', '26.8125000', '87.2833000'],
  ['Nepalgunj Stadium Hall', 'Nepalgunj', '28.0500000', '81.6167000'],
  ['Janaki Mandir Cultural Hall', 'Janakpur', '26.7288000', '85.9263000'],
  ['Tribhuvan University Auditorium, Kirtipur', 'Kathmandu', '27.6810000', '85.2780000'],
  ['Kathmandu University Central Hall, Dhulikhel', 'Dhulikhel', '27.6197000', '85.5397000'],
];

const IMAGES = {
  Music: '/uploads/seed/music.jpg', Games: '/uploads/seed/futsal.jpg', Sports: '/uploads/seed/sports.jpg',
  Arts: '/uploads/seed/art.jpg', Film: '/uploads/seed/culture.jpg', Literature: '/uploads/seed/debate.jpg',
  Technology: '/uploads/seed/coding.jpg', Culture: '/uploads/seed/culture.jpg', Lifestyle: '/uploads/seed/yoga.jpg',
  Charity: '/uploads/seed/culture.jpg', Faishon: '/uploads/seed/art.jpg', Kids: '/uploads/seed/workshop.jpg', Other: '/uploads/seed/seminar.jpg',
};

const CALENDAR_NAMES = [
  'Kathmandu Creative Circle', 'Pokhara Lakeside Events', 'Patan Arts Collective', 'Bhaktapur Heritage Calendar',
  'Chitwan Community Hub', 'Biratnagar Youth Network', 'Butwal Sports & Culture', 'Dharan Music Forum',
  'Nepalgunj Civic Calendar', 'Janakpur Literature Sabha',
];

const EVENT_TITLES = {
  Music: ['Kutumba Tribute Evening', 'Nepali Indie Night', 'Sarangi Sessions', 'Lakeside Acoustic Jam', 'Folk Fusion Concert', 'Madal & Basuri Workshop', 'Dharan Rock Meetup', 'Ghazal Night', 'Newari Music Showcase', 'Open Mic for Musicians'],
  Games: ['Futsal Friendly Cup', 'Chess Meetup Nepal', 'Board Game Saturday', 'E-sports Mini League', 'Carrom Community Night', 'Youth Gaming Jam', 'FIFA Knockout Cup', 'Strategy Games Circle', 'Campus Table Tennis Day', 'Family Game Fair'],
  Sports: ['5K Heritage Run', 'Inter-College Futsal', 'Cycling Around Ring Road', 'Yoga in the Park', 'Cricket Nets Session', 'Women’s Volleyball Meetup', 'Hiking Prep Clinic', 'Basketball Skills Camp', 'Badminton Open Day', 'Community Fitness Bootcamp'],
  Arts: ['Thangka Painting Intro', 'Pottery Wheel Workshop', 'Mithila Art Session', 'Sketching Patan Alleys', 'Watercolor Weekend', 'Printmaking Basics', 'Street Art Walk', 'Calligraphy for Beginners', 'Craft Market Meetup', 'Photography Critique Circle'],
  Film: ['Nepali Shorts Screening', 'Documentary Night', 'Mobile Filmmaking Class', 'Film Club Discussion', 'Editing Basics Workshop', 'Script to Screen Meetup', 'Outdoor Movie Evening', 'Cinematography Walkthrough', 'Student Film Premiere', 'Women in Nepali Cinema'],
  Literature: ['Poetry at Patan', 'Book Exchange Nepal', 'Storytelling Circle', 'Writing for Kathmandu', 'Nepali Essay Workshop', 'Youth Debate Forum', 'Translation Meetup', 'Author Talk Series', 'Zine Making Session', 'Library Reading Hour'],
  Technology: ['React Kathmandu Workshop', 'AI for Nepali Startups', 'Cybersecurity Basics', 'Open Data Nepal Meetup', 'Cloud Deployment Clinic', 'Women in Tech Nepal', 'Product Design Sprint', 'Python for Beginners', 'Startup Pitch Practice', 'Digital Payments Talk'],
  Culture: ['Indra Jatra Heritage Walk', 'Newari Food & Culture', 'Mithila Culture Evening', 'Tharu Cultural Showcase', 'Teej Community Program', 'Bisket Jatra Talk', 'Heritage Conservation Meetup', 'Traditional Dance Workshop', 'Local History Walk', 'Nepal Folk Stories Night'],
  Lifestyle: ['Mindful Morning Kathmandu', 'Sustainable Living Nepal', 'Coffee Tasting Session', 'Urban Gardening Clinic', 'Personal Finance Basics', 'Healthy Nepali Cooking', 'Career Reset Meetup', 'Minimal Wardrobe Workshop', 'Wellness Journaling', 'Weekend Social Mixer'],
  Charity: ['Blood Donation Drive', 'Winter Clothes Collection', 'Community Cleanup', 'Books for Rural Schools', 'Animal Shelter Support Day', 'Food Bank Volunteer Meet', 'Fundraiser for Flood Relief', 'Tree Plantation Drive', 'Health Camp Orientation', 'Volunteer Matching Day'],
  Faishon: ['Sustainable Fashion Pop-up', 'Dhaka Styling Workshop', 'Local Designers Meetup', 'Thrift Market Nepal', 'Runway Basics Session', 'Fashion Photography Walk', 'Textile Stories Nepal', 'Jewelry Craft Workshop', 'Wardrobe Swap Day', 'Ethnic Wear Showcase'],
  Kids: ['Children’s Story Morning', 'STEM for Kids', 'Junior Art Camp', 'Kids Futsal Hour', 'Robotics for School Kids', 'Parent & Child Yoga', 'Science Fun Day', 'Children’s Book Fair', 'Junior Debate Club', 'Creative Craft Sunday'],
  Other: ['Community Town Hall', 'Public Speaking Practice', 'Networking Breakfast', 'Local Organizers Meetup', 'Workshop Planning Clinic', 'First Aid Basics', 'Civic Tech Discussion', 'Travel Stories Nepal', 'Language Exchange', 'Open Community Meetup'],
};

const FIRST = ['Aarav','Aarya','Srijana','Bikash','Nisha','Rohan','Prabina','Suman','Anita','Dipak','Maya','Sita','Hari','Gita','Krishna','Laxmi','Bimal','Kamala','Dinesh','Sarita','Bikram','Anjali','Sandesh','Pramila','Ramesh','Sunita','Aashis','Nirmala','Kabir','Asmita','Bibek','Pooja','Saurav','Manisha','Roshan','Elina','Nabin','Sangita','Kiran','Rekha','Milan','Sabina','Sagar','Binita','Raj','Samjhana','Utsav','Deepa','Nirajan','Menuka'];
const LAST = ['Sharma','Tamang','Shrestha','Karki','Gurung','Poudel','Rai','Koirala','Magar','Subedi','Limbu','Basnet','Chhetri','Pandey','Sherpa','Rana','Yadav','Khadka','Pariyar','Maharjan','Dongol','Bhattarai','Thakuri','Manandhar','Rawal'];

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function code(len = 8) { const a = 'abcdefghijklmnopqrstuvwxyz0123456789'; return Array.from({ length: len }, () => a[rand(0, a.length - 1)]).join(''); }
function futureDate(index, hour = 10) { const d = new Date(); d.setDate(d.getDate() + 3 + index); d.setHours(hour, 0, 0, 0); return d; }

async function wipe() {
  const conn = await import('mysql2/promise').then((m) => m.createConnection(process.env.DATABASE_URL));
  await conn.execute('SET FOREIGN_KEY_CHECKS=0');
  for (const table of ['certificates','certificate_templates','attendance','notifications','rsvps','event_invitations','event_members','events','calendar_follows','calendars','categories','event_groups','users']) {
    try { await conn.execute(`DELETE FROM \`${table}\``); console.log(`  🗑  ${table}`); } catch (err) { console.log(`  ⏭️  ${table}: ${err.message}`); }
  }
  await conn.execute('SET FOREIGN_KEY_CHECKS=1');
  await conn.end();
}

async function seed() {
  console.log('🇳🇵 Seeding Nepal demo data...');
  await wipe();
  const password = await bcrypt.hash(PASSWORD, 10);

  const userRows = Array.from({ length: 50 }, (_, i) => {
    const name = i === 0 ? 'Admin Mahotsav' : `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`;
    return {
      name,
      email: i === 0 ? 'admin@mahotsav.com' : `${slugify(name)}${i}@mahotsav.com`,
      phone: `+977-98${String(10000000 + i).slice(0, 8)}`,
      password,
      role: i === 0 ? 'admin' : i <= 10 ? 'organizer' : 'attendee',
    };
  });
  const userResult = await db.insert(users).values(userRows);
  const firstUserId = userResult[0].insertId;
  const userIds = userRows.map((_, i) => firstUserId + i);
  const organizerIds = userIds.slice(1, 11);
  const attendeeIds = userIds.slice(11);
  console.log(`  👥 Users: ${userIds.length}`);

  await db.insert(categories).values(CATEGORY_LABELS.map((label) => ({
    label,
    slug: slugify(label),
    icon: CATEGORY_META[label][0],
    color: CATEGORY_META[label][1],
    created_by: userIds[0],
  })));
  console.log(`  🏷️  Categories: ${CATEGORY_LABELS.length}`);

  const calendarRows = CALENDAR_NAMES.map((name, i) => ({
    name,
    slug: slugify(name),
    description: `Featured ${CITIES[i].city} calendar for concerts, workshops, community meetups, sports, literature and cultural happenings across Nepal.`,
    avatar: null,
    cover_image: `/uploads/seed/${['culture','music','art','seminar','sports'][i % 5]}.jpg`,
    color: ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#78716c'][i],
    city: CITIES[i].city,
    latitude: CITIES[i].lat,
    longitude: CITIES[i].lng,
    featured: true,
    created_by: organizerIds[i],
  }));
  const calendarResult = await db.insert(calendars).values(calendarRows);
  const firstCalendarId = calendarResult[0].insertId;
  const calendarIds = calendarRows.map((_, i) => firstCalendarId + i);
  console.log(`  📆 Featured calendars: ${calendarIds.length}`);

  const followRows = [];
  for (const calendarId of calendarIds) {
    for (const uid of attendeeIds.slice(0, rand(14, 28))) followRows.push({ calendar_id: calendarId, user_id: uid });
  }
  await db.insert(calendarFollows).values(followRows).catch(() => {});

  const eventRows = [];
  let eventIndex = 0;
  for (const category of CATEGORY_LABELS) {
    for (let i = 1; i <= 10; i++) {
      const venue = VENUES[eventIndex % VENUES.length];
      const start = futureDate(eventIndex === 10 ? 0 : eventIndex, 8 + (i % 9));
      const end = new Date(start.getTime() + rand(2, 5) * 60 * 60 * 1000);
      const calendarId = calendarIds[eventIndex % calendarIds.length];
      eventRows.push({
        title: `${EVENT_TITLES[category][i - 1]} — ${venue[1]}`,
        description: `A realistic ${category.toLowerCase()} event in ${venue[1]}, Nepal, hosted with local organizers, creators and community groups. The session is designed around Nepali audiences, venues and practical participation.`,
        medium: i % 7 === 0 ? 'online' : 'offline',
        location_name: i % 7 === 0 ? null : venue[0],
        latitude: i % 7 === 0 ? null : venue[2],
        longitude: i % 7 === 0 ? null : venue[3],
        meet_link: i % 7 === 0 ? 'https://meet.google.com/nepal-demo-event' : null,
        meet_id: i % 7 === 0 ? `NP-${1000 + eventIndex}` : null,
        meet_password: i % 7 === 0 ? 'mahotsav' : null,
        start_date: start,
        end_date: end,
        duration: `${Math.round((end - start) / 3600000)}h`,
        language: i % 3 === 0 ? 'Nepali' : 'English',
        max_participants: [0, 40, 60, 80, 120][i % 5],
        admission_mode: i % 4 === 0 ? 'waitlist' : 'capacity',
        category,
        privacy: 'public',
        image: IMAGES[category],
        tnc: null,
        accepting_rsvp: true,
        accepting_attendance: i % 2 === 0,
        require_approval: i % 3 !== 0,
        calendar_id: calendarId,
        short_code: code(),
        created_by: organizerIds[eventIndex % organizerIds.length],
      });
      eventIndex++;
    }
  }
  const eventResult = await db.insert(events).values(eventRows);
  const firstEventId = eventResult[0].insertId;
  const eventIds = eventRows.map((_, i) => firstEventId + i);
  console.log(`  🎪 Events: ${eventIds.length} (${CATEGORY_LABELS.length} categories × 10)`);

  await db.insert(eventMembers).values(eventRows.map((ev, i) => ({
    event_id: eventIds[i], user_id: ev.created_by, role: 'owner', invited: true, joined: true, confirm: true,
  })));

  const rsvpRows = [];
  const usedPairs = new Set();
  const addRsvp = (eventIndexForRow, userId, approved = true) => {
    const eventId = eventIds[eventIndexForRow];
    const owner = eventRows[eventIndexForRow].created_by;
    const key = `${eventId}:${userId}`;
    if (!eventId || userId === owner || usedPairs.has(key)) return;
    usedPairs.add(key);
    rsvpRows.push({
      event_id: eventId,
      user_id: userId,
      owner_user_id: owner,
      approved,
      rejected: false,
      pending: !approved,
    });
  };

  // Deterministic conflict fixture:
  // attendeeIds[0] is already going to Music #1. Games #1 happens at the same time.
  // Logging in as this attendee and RSVPing to Games #1 should return a conflict.
  addRsvp(0, attendeeIds[0], true);

  // Keep seeded data realistic: each attendee has only 1–2 RSVPs total.
  for (let i = 1; i < attendeeIds.length; i++) {
    const uid = attendeeIds[i];
    const firstEventIndex = (i * 3) % eventRows.length;
    addRsvp(firstEventIndex, uid, Math.random() > 0.2);
    if (i % 3 === 0) {
      const secondEventIndex = (firstEventIndex + 17) % eventRows.length;
      addRsvp(secondEventIndex, uid, Math.random() > 0.2);
    }
  }

  await db.insert(rsvps).values(rsvpRows).catch(() => {});
  console.log(`  📨 RSVPs: ${rsvpRows.length}`);
  console.log(`  🧪 Conflict fixture: ${userRows[11].email} is going to /${eventRows[0].short_code}; try RSVP on overlapping /${eventRows[10].short_code}`);

  console.log('\n✅ Nepal seed complete');
  console.log(`Login: admin@mahotsav.com / ${PASSWORD}`);
  console.log(`Organizer sample: ${userRows[1].email} / ${PASSWORD}`);
  console.log(`Attendee sample: ${userRows[11].email} / ${PASSWORD}`);
  process.exit(0);
}

seed().catch((err) => { console.error('❌ Nepal seed failed:', err); process.exit(1); });
