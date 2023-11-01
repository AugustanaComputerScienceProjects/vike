const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors");
const QRCode = require("qrcode");

admin.initializeApp();

const axios = require("axios");
const xml2js = require("xml2js");
const cheerio = require("cheerio");

const EVENTS_XML_URL = "https://augustana.edu/events-feed.xml";
const SPORTS_XML_URL = "https://goaugie.com/calendar.ashx/calendar.rss";

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
    start_date,
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
    this.start_date = start_date;
    this.tags = tags;
    this.weblink_url = weblink_url;
  }
}

// Extracts the latitude and longitude from the Google Maps URL
function extractLatLngFromLocation(location) {
  const matches = location.match(
    /place\/([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)/
  );
  return matches
    ? { lat: parseFloat(matches[1]), lng: parseFloat(matches[2]) }
    : null;
}

// Generate tags from the event title and description
function generateTags(title, description) {
  // For simplicity, just split by spaces and take a limited number of words.
  // TODO: using NLP or other heuristics to parse necessary tags
  return title
    .split(" ")
    .concat(description.split(" "))
    .slice(0, 5); // Taking first 5 words
}

async function loadRSS() {
  const events_response = await axios.get(EVENTS_XML_URL);
  const sports_response = await axios.get(SPORTS_XML_URL);
  return {
    events: events_response.data,
    sports: sports_response.data,
  };
}

const parseXML = async (event_item_list) => {
  const event_arr = [];
  const db = admin.database().ref("/current-events/");
  // TODO: Remove this
  /* eslint-disable no-await-in-loop */

  for (const item of event_item_list) {
    const description_block = cheerio.load(item.description[0]);

    // Extract the desired event description part
    const timeElement = description_block("time");
    const descriptionText = timeElement.next("p").text();

    // Extract and format location and address
    const locationUrl =
      description_block('a[href*="google.com/maps/place/"]').attr("href") || "";
    const latLng = extractLatLngFromLocation(locationUrl);

    // Extract building name and full address
    const buildingName = description_block("p[role='article'] span").text();
    const address_parts = description_block("p.address span")
      .map((idx, el) => description_block(el).text())
      .get();
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
        "",
        item.link[0]
      );
      if (latLng) {
        event.latitude = latLng.lat;
        event.longitude = latLng.lng;
      }

      event_arr.push(event);

      // Add the event to the database
      await db.push(event);
    }
  }
  return { events: event_arr };
};

exports.scrapeEvents = functions.pubsub
  .schedule("0 2 * * *")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    try {
      const rss_data = await loadRSS();
      const parser = new xml2js.Parser();
      const parsedXml = await parser.parseStringPromise(rss_data.events);
      const items = parsedXml.rss.channel[0].item;
      const events_dict = await parseXML(items);
      return events_dict;
    } catch (error) {
      console.error(error);
      return error; // When an error occurs
    }
  });

// File for Firebase Functions
("use strict");
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
// Transporter config for sending emails
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    //Need to fill in password to deploy
    pass: gmailPassword,
  },
});

// Firebase Cloud Function moveEvents - moves current events to past events when they have expired
// and uses the Google Cloud Scheduler to run it on a regular basis
exports.scheduledMoveEvents =
  //runs every 10 minutes
  functions.pubsub
    .schedule("*/10 * * * *") // every 10 minute
    .timeZone("America/Chicago")
    .onRun((context) => {
      let db = admin.database();
      console.log("working");

      return db
        .ref("/current-events")
        .once("value")
        .then((snapshot) => {
          let promises = [];
          snapshot.forEach((child) => {
            let event = child.val();
            let nowDate = new Date();
            let eventEndDate = getEndDate(event);
            nowDate.setMinutes(nowDate.getMinutes() - 300);
            console.log(nowDate + "vs." + eventEndDate);
            // add one hour buffer before we move to past events (e.g. for Raffle time)
            eventEndDate.setMinutes(eventEndDate.getMinutes() + 60);
            if (nowDate > eventEndDate) {
              console.log("Moving Event: " + event["name"]);
              promises.push(db.ref("/past-events/" + child.key).set(event));
              promises.push(db.ref("/current-events/" + child.key).remove());
              if (event["imgid"] !== "default") {
                promises.push(
                  admin
                    .storage()
                    .bucket("Images/" + event["imgid"] + ".jpg")
                    .delete()
                );
              }
            }
          });
          return Promise.all(promises);
        })
        .catch((error) => {
          console.log(error);
        });
    });

exports.pepsicoEventAutoScheduling =
  //run daily at 2:00 am
  functions.pubsub
    .schedule("0 2 * * *")
    .timeZone("America/Chicago")
    .onRun((context) => {
      let databaseRef = admin.database();
      let nowDate = new Date();
      return databaseRef
        .ref("/pepsico")
        .once("value")
        .then((snapshot) => {
          let promises = [];
          snapshot.forEach((child) => {
            let event = child.val();
            promises.push(
              databaseRef.ref("/past-events/" + child.key).set(event)
            );
            promises.push(
              databaseRef.ref("/past-pepsico/" + child.key).set(event)
            );
            promises.push(
              databaseRef
                .ref("/pepsico")
                .child(child.key)
                .remove()
            );
          });

          promises.push(
            databaseRef.ref("/pepsico").push({
              name: "Pepsico Attendance",
              startDate: formatDate(nowDate) + " " + "06:00",
              duration: 18 * 60 - 1, //almost 18 hours, until 11:59 PM
              location: "Pepsico Recreational Center",
              organization: "Pepsico",
              imgid: "default.jpg",
              description: "(auto-generated Pepsico Event)",
              tags: "",
              email: "michaelwardach17@augustana.edu",
            })
          );
          console.log(nowDate.getDay());
          console.log(nowDate.getMonth());
          console.log("Pepsico Moved and Created");
          return Promise.all(promises);
        })
        .catch((error) => {
          console.log(error);
        });
    });

// Gets the end date of a given Event
function getEndDate(event) {
  let dateTimePieces = event["startDate"].trim().split(" ");
  let datePart = dateTimePieces[0];
  let timePart = dateTimePieces[1];
  let date = new Date(datePart + "T" + timePart);
  date.setMinutes(date.getMinutes() + event["duration"]);
  return date;
}
//Formats a date object with padded zeros, e.g.  2019-02-25
function formatDate(date) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1);
  let day = String(date.getDate());
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    console.log("Day before: " + day);
    day = "0" + day;
    console.log("Day after: " + day);
  }

  return year + "-" + month + "-" + day;
}

// Firebase Cloud Function emailNotify - notifies leaders when their Event gets accepted or rejected via email
exports.emailNotify = functions.database
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
            console.log("QR code function");
            if (err) {
              return err;
            }
            console.log("No error");
            var subject = "";
            var message = "";
            var attachments = [];
            if (snap.hasChildren()) {
              console.log("Has Children");
              console.log("Event Accepted: " + event["name"]);
              subject = "Augie Events - Event Accepted: " + event["name"];
              message =
                "<p>Your event was accepted and is now in current events! You can view the event on the mobile Augustana OSL Events App and save/download the QR code below.</p>";
              attachments = [
                {
                  filename: event["name"] + "-QR Code.png",
                  path: url,
                },
              ];
            } else {
              console.log("Event Rejected: " + event["name"]);
              subject = "Augie Events - Event Rejected: " + event["name"];
              message =
                "<p>Your event was rejected. Contact OSL with any concerns or questions: osleventsapp@augustana.edu</p>";
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
                console.error(
                  "There was an error while sending the email:",
                  error
                )
              );
          }
        );
      })
      .catch((error) => {
        console.log(error);
      });
  });
