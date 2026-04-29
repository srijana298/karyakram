import { eventService } from "../../services/events";
import { rsvpService } from "../../services/rsvps";

function jaccardIndex(setA, setB) {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export async function getRecommendations(userId) {
  const rsvpsRes = await rsvpService.listMine({});
  if (!rsvpsRes.ok) return [];

  const rsvpsData = rsvpsRes.data;

  const userEvents = new Map();
  for (const rsvp of rsvpsData) {
    if (!userEvents.has(rsvp.user_id)) {
      userEvents.set(rsvp.user_id, new Set());
    }
    userEvents.get(rsvp.user_id).add(rsvp.event_id);
  }

  const userSimilarities = new Map();
  for (const [userIdA, eventsA] of userEvents) {
    userSimilarities.set(userIdA, new Map());
    for (const [userIdB, eventsB] of userEvents) {
      if (userIdA !== userIdB) {
        userSimilarities.get(userIdA).set(userIdB, jaccardIndex(eventsA, eventsB));
      }
    }
  }

  const recommendations = new Map();
  for (const [uid, similarities] of userSimilarities) {
    const similarUser = Array.from(similarities.keys()).reduce((a, b) =>
      similarities.get(a) > similarities.get(b) ? a : b
    );
    const recommendedEventIds = [...userEvents.get(similarUser)].filter(
      (eventId) => !userEvents.get(uid).has(eventId)
    );
    recommendations.set(uid, recommendedEventIds);
  }

  const eventIds = recommendations.get(userId) || [];
  const events = [];
  for (const eid of eventIds) {
    const res = await eventService.getById(eid);
    if (res.ok) events.push(res.data);
  }
  return events;
}
