// Initialize the Appwrite client
import { Databases } from "appwrite";
import client from "../../appwrite.config";

// This function calculates the Jaccard Index between two sets
// recommendations.js

// This function calculates the Jaccard Index between two sets
function jaccardIndex(setA, setB) {
  let intersection = new Set([...setA].filter((x) => setB.has(x)));
  let union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

const getRsvp = async () => {
  try {
    const database = new Databases(client);
    const response = await database.listDocuments(
      process.env.REACT_APP_DATABASE_ID,
      process.env.REACT_APP_RSVP_COLLECTION_ID
    );
    return response?.documents;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

// Export the function
export async function getRecommendations(userId) {
  // Fetch the RSVP data from your database
  let rsvps = await getRsvp(); // Fetch RSVP data from your database here

  // Create a Map to store the events attended by each user
  let userEvents = new Map();

  for (let rsvp of rsvps) {
    if (!userEvents.has(rsvp.userId)) {
      userEvents.set(rsvp.userId, new Set());
    }
    userEvents.get(rsvp.userId).add(rsvp.eventId);
  }

  // Calculate the Jaccard Index between each pair of users
  let userSimilarities = new Map();

  for (let [userIdA, eventsA] of userEvents) {
    userSimilarities.set(userIdA, new Map());
    for (let [userIdB, eventsB] of userEvents) {
      if (userIdA !== userIdB) {
        userSimilarities
          .get(userIdA)
          .set(userIdB, jaccardIndex(eventsA, eventsB));
      }
    }
  }

  // Recommend an event for each user
  let recommendations = new Map();

  for (let [userId, similarities] of userSimilarities) {
    // Find the most similar user
    let similarUser = Array.from(similarities.keys()).reduce((a, b) =>
      similarities.get(a) > similarities.get(b) ? a : b
    );

    // Find the events that the similar user has attended but the user has not
    let recommendedEvents = [...userEvents.get(similarUser)].filter(
      (eventId) => !userEvents.get(userId).has(eventId)
    );

    recommendations.set(userId, recommendedEvents);
  }

  // Return the recommendations for the specific user
  return recommendations.get(userId);
}
