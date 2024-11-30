const functions = require('firebase-functions');
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });
const QRCode = require("qrcode");
const axios = require("axios");
const xml2js = require("xml2js");
const cheerio = require("cheerio");

if (!admin.apps.length) {
  admin.initializeApp();
}

const config = functions.config();

const EVENTS_XML_URL = "https://augustana.edu/events-feed.xml";
const SPORTS_XML_URL = "https://goaugie.com/calendar.ashx/calendar.rss";

async function loadRSS() {
  const events_response = await axios.get(EVENTS_XML_URL);
  const sports_response = await axios.get(SPORTS_XML_URL);
  return {
    events: events_response.data,
    sports: sports_response.data,
  };
}

// Event class definition remains the same
class Event {
  constructor(
    event_id,
    description,
    duration,
    email,
    telephone,
    imgid,
    location,
    name,
    organization,
    startDate,
    tags,
    weblink_url
  ) {
    this.event_id = event_id;
    this.description = description;
    this.duration = duration;
    this.email = email;
    this.telephone = telephone;
    this.imgid = imgid;
    this.location = location;
    this.name = name;
    this.organization = organization;
    this.startDate = startDate;
    this.tags = tags;
    this.weblink_url = weblink_url;
  }
}

// Helper functions remain the same
function extractLatLngFromLocation(location) {
  const matches = location.match(
    /place\/([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)/
  );
  return matches
    ? { lat: parseFloat(matches[1]), lng: parseFloat(matches[2]) }
    : null;
}

function generateTags(title, description) {
  // Combine words from title and description
  const words = `${title} ${description}`.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/); // Split on whitespace
    
  // Remove common words and duplicates
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  const tags = [...new Set(words)]
    .filter(word => 
      word.length > 2 && // Ignore short words
      !commonWords.has(word) && // Ignore common words
      !(/^\d+$/.test(word)) // Ignore numbers
    )
    .slice(0, 10); // Limit to 10 tags

  return tags;
}

const parseXML = async (event_item_list) => {
  const event_arr = [];
  const db = admin.database().ref("/current-events/");

  for (const item of event_item_list) {
    const description_block = cheerio.load(item.description[0]);

    const timeElement = description_block("time");
    const descriptionText = timeElement.next("p").text();

    const locationUrl = description_block('a[href*="google.com/maps/place/"]').attr("href") || "";
    const latLng = extractLatLngFromLocation(locationUrl);

    const buildingName = description_block("p[role='article'] span").text();
    const address_parts = description_block("p.address span")
      .map((idx, el) => description_block(el).text())
      .get()
      .filter(part => part.trim() !== "");
    const fullAddress = address_parts.join(", ");

    const eventTitle = item.title[0];

    const existingEventSnapshot = await db
      .orderByChild("name")
      .equalTo(eventTitle)
      .once("value");

    if (!existingEventSnapshot.exists()) {
      const event = new Event(
        item.guid[0]._.split(" ")[0],
        descriptionText,
        60,
        description_block('a[href*="mailto:"]').text() || "",
        description_block('a[href*="tel:"]').text() || "",
        "default",
        buildingName + ", " + fullAddress,
        eventTitle,
        "",
        description_block("time").attr("datetime") || "",
        generateTags(eventTitle, descriptionText),
        item.link[0]
      );

      if (latLng) {
        event.latitude = latLng.lat;
        event.longitude = latLng.lng;
      }

      event_arr.push(event);
      await db.push(event);
    }
  }
  return { events: event_arr };
};

// Helper function to get end date of an event
function getEndDate(event) {
  const dateTimePieces = event.startDate.trim().split(" ");
  const datePart = dateTimePieces[0];
  const timePart = dateTimePieces[1];
  const date = new Date(`${datePart}T${timePart}`);
  date.setMinutes(date.getMinutes() + event.duration);
  return date;
}

// Helper function to format date
function formatDate(date) {
  const year = date.getFullYear();
  let month = String(date.getMonth() + 1);
  let day = String(date.getDate());
  
  month = month.length < 2 ? `0${month}` : month;
  day = day.length < 2 ? `0${day}` : day;

  return `${year}-${month}-${day}`;
}

// Update the functions to use v1
exports.scrapeEvents = functions.pubsub
  .schedule("0 2 * * *")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    try {
      const rss_data = await loadRSS();
      const parser = new xml2js.Parser();
      const parsedXml = await parser.parseStringPromise(rss_data.events);
      const items = parsedXml.rss.channel[0].item;
      return await parseXML(items);
    } catch (error) {
      console.error('Error in scrapeEvents:', error);
      throw error;
    }
  });

exports.scheduledMoveEvents = functions.pubsub
  .schedule("*/10 * * * *")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    const db = admin.database();
    console.log("Running scheduled move events");

    try {
      const snapshot = await db.ref("/current-events").once("value");
      const promises = [];

      snapshot.forEach((child) => {
        const event = child.val();
        const nowDate = new Date();
        const eventEndDate = getEndDate(event);
        nowDate.setMinutes(nowDate.getMinutes() - 300);
        
        // Add one hour buffer before moving to past events
        eventEndDate.setMinutes(eventEndDate.getMinutes() + 60);
        
        if (nowDate > eventEndDate) {
          console.log("Moving Event:", event.name);
          promises.push(db.ref(`/past-events/${child.key}`).set(event));
          promises.push(db.ref(`/current-events/${child.key}`).remove());
          
          if (event.imgid !== "default") {
            promises.push(
              admin.storage().bucket(`Images/${event.imgid}.jpg`).delete()
            );
          }
        }
      });

      await Promise.all(promises);
      return null;
    } catch (error) {
      console.error("Error in scheduledMoveEvents:", error);
      throw error;
    }
  });

exports.pepsicoEventAutoScheduling = functions.pubsub
  .schedule("0 2 * * *")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    const databaseRef = admin.database();
    const nowDate = new Date();

    try {
      const snapshot = await databaseRef.ref("/pepsico").once("value");
      const promises = [];

      snapshot.forEach((child) => {
        const event = child.val();
        promises.push(databaseRef.ref(`/past-events/${child.key}`).set(event));
        promises.push(databaseRef.ref(`/past-pepsico/${child.key}`).set(event));
        promises.push(databaseRef.ref("/pepsico").child(child.key).remove());
      });

      // Create new Pepsico event for today
      promises.push(
        databaseRef.ref("/pepsico").push({
          name: "Pepsico Attendance",
          startDate: `${formatDate(nowDate)} 06:00`,
          duration: 18 * 60 - 1, // Almost 18 hours, until 11:59 PM
          location: "Pepsico Recreational Center",
          organization: "Pepsico",
          imgid: "default.jpg",
          description: "(auto-generated Pepsico Event)",
          tags: "",
          email: "michaelwardach17@augustana.edu",
        })
      );

      await Promise.all(promises);
      return null;
    } catch (error) {
      console.error("Error in pepsicoEventAutoScheduling:", error);
      throw error;
    }
  });

// Update emailNotifyTrigger to match old emailNotify function
exports.emailNotifyTrigger = functions.database
  .ref("/pending-events/{eventID}")
  .onDelete((snapshot, context) => {
    console.log("Deleted");
    return admin
      .database()
      .ref("/current-events/" + snapshot.key)
      .once("value")
      .then((snap) => {
        console.log("Current Event: " + snap);
        let event = snapshot.val();
        console.log("Event: " + event);
        if (event["email"] === "Deleted by user") {
          return;
        }

        return QRCode.toDataURL(
          "https://osl-events-app.firebaseapp.com/event?id=" +
            snapshot.key +
            "&name=" +
            event["name"],
          (err, url) => {
            if (err) return err;
            
            var subject = "";
            var message = "";
            var attachments = [];
            if (snap.hasChildren()) {
              console.log("Event Accepted: " + event["name"]);
              subject = "Augie Events - Event Accepted: " + event["name"];
              message = "<p>Your event was accepted and is now in current events! You can view the event on the mobile Augustana OSL Events App and save/download the QR code below.</p>";
              attachments = [
                {
                  filename: event["name"] + "-QR Code.png",
                  path: url,
                },
              ];
            } else {
              console.log("Event Rejected: " + event["name"]);
              subject = "Augie Events - Event Rejected: " + event["name"];
              message = "<p>Your event was rejected. Contact OSL with any concerns or questions: osleventsapp@augustana.edu</p>";
            }

            const mailOptions = {
              from: "Augie Events <no-reply.osleventsapp@augustana.edu>",
              to: event["email"],
              subject: subject,
              html: message,
              attachments: attachments,
            };

            return transporter
              .sendMail(mailOptions)
              .then(() => console.log("Email sent!"))
              .catch((error) =>
                console.error("There was an error while sending the email:", error)
              );
          }
        );
      })
      .catch((error) => {
        console.log(error);
      });
  });

exports.migrateOldEvents = functions.https.onRequest(async (req, res) => {
  const db = admin.database();
  console.log("Starting migration of old events");

  try {
    const cutoffDate = new Date('2024-11-29');
    const snapshot = await db.ref("/current-events").once("value");
    const promises = [];

    snapshot.forEach((child) => {
      const event = child.val();
      const eventStartDate = new Date(event.startDate);
      
      if (eventStartDate < cutoffDate) {
        console.log("Moving Event:", event.name);
        promises.push(db.ref(`/past-events/${child.key}`).set(event));
        promises.push(db.ref(`/current-events/${child.key}`).remove());
        
        if (event.imgid !== "default") {
          promises.push(
            admin.storage().bucket().file(`Images/${event.imgid}.jpg`).delete()
          );
        }
      }
    });

    await Promise.all(promises);
    console.log("Migration completed successfully");
    res.status(200).send("Migration completed successfully");
  } catch (error) {
    console.error("Error in migrateOldEvents:", error);
    res.status(500).send("Error during migration: " + error.message);
  }
});
