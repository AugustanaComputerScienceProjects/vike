const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors');
const QRCode = require('qrcode');
admin.initializeApp();

// File for Firebase Functions

// Transporter config for sending emails
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'acesdispatcher@augustana.edu',
        //Need to fill in password to deploy
        pass: ''
    }
});

// Firebase Cloud Function moveEvents - moves current events to past events when they have expired
// and uses the Google Cloud Scheduler to run it on a regular basis
exports.scheduledMoveEvents =
                            //runs every 10 minutes
functions.pubsub.schedule('*/10 * * * *').onRun((context) => {
    let db = admin.database();
    console.log("working"); 
    db.ref('/current-events').once('value').then(function(snapshot) {
        snapshot.forEach(function(child) {
            let event = child.val();
            let nowDate = new Date();
            let eventEndDate = getEndDate(event);
            if (nowDate > eventEndDate) {
                console.log("Moving Event: " + event["name"]);
                db.ref('/past-events/' + child.key).set(event);
                db.ref('/current-events/' + child.key).remove();
                if (event["imgid"] !== "default") {
                    admin.storage().bucket('Images/' + event["imgid"] + '.jpg').delete();
                }
            }
        });
        return;
    }).catch(error => {console.log(error);});
});

exports.pepsicoEventAutoScheduling =
                            //run daily at 2:00 am
functions.pubsub.schedule('0 2 * * *').onRun((context) => {
    let databaseRef = admin.database();
    console.log("start");
    databaseRef.ref('/Pepsico').once('value').then(function(snapshot) {
        console.log("next");
        let event;
        let nowDate = new Date();
        let year = nowDate.getFullYear();
        let month = nowDate.getMonth();
        let day = nowDate.getDay();
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        if (snapshot.hasChildren()) {
            snapshot.forEach(function(child) {
                event = child.val();
            });
            let eventEndDate = getEndDate(event);
            console.log("checking pepsico");
            if (nowDate > eventEndDate) {
                console.log("Moving Pepsico");
                databaseRef.ref('/past-events/' + snapshot.child.key).set(event);
                databaseRef.ref("/Pepsico").child(snapshot.child.key).remove();
                databaseRef.ref("/Pepsico").push({
                    name: "Pepsico Attendance",
                    startDate: year + '-' + month + '-' + day + " " + "6:00",
                    duration: 1020,
                    location: "Pepsico Recreational Center",
                    organization: "Pepsico",
                    imgid: "default.jpg",
                    description: "Pepsico is open",
                    tags: "",
                    email: "michaelwardach17@augustana.edu"
                });
                console.log("Created Pepsico");
            }
        } else {
            console.log("creating Pepsico");
            databaseRef.ref('/Pepsico').push({
                name: "Pepsico Attendance",
                startDate: year + '-' + month + '-' + day + " " + "6:00",
                duration: 1020,
                location: "Pepsico Recreational Center",
                organization: "Pepsico",
                imgid: "default.jpg",
                description: "Pepsico is open",
                tags: "",
                email: "michaelwardach17@augustana.edu"
            });
            console.log("pepsico created");
        }
        return;
    }).catch(error => {console.log(error);});
});

  // Gets the end date of a given Event
  function getEndDate(event) {
    let arr = event["startDate"].split(' ');
    let arr2 = arr[0].split('-');
    let arr3 = arr[1].split(':');
    let date = new Date(arr2[0] + '-' + arr2[1] + '-' + arr2[2] + 'T' + arr3[0] + ':' + arr3[1] + '-05:00');
    date.setMinutes(date.getMinutes() + event["duration"]);
    return date;
}

// Firebase Cloud Function emailNotify - notifies leaders when their Event gets accepted or rejected via email
exports.emailNotify = functions.database.ref('/pending-events/{eventID}').onDelete((snapshot, context) => {
    console.log("Deleted");
    admin.database().ref('/current-events/' + snapshot.key).once('value').then(function(snap) {
        console.log("Current Event: " + snap);
        let event = snapshot.val();
        console.log("Event: " + event);
        if (event["email"] === "Deleted by user") {
            return;
        }

        return QRCode.toDataURL('https://osl-events-app.firebaseapp.com/event?id=' + snapshot.key + '&name=' + event["name"], function (err, url) {
            console.log("QR code function");
            if(err) {
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
                message = '<p>Your event was accepted and is now in current events! You can view the event on the mobile Augustana OSL Events App and save/download the QR code below.</p>'
                attachments = [
                    {
                      filename: event["name"] + "-QR Code.png",
                      path: url, 
                    }
                  ]
            } else {
                console.log("Event Rejected: " + event["name"]);
                subject = "Augie Events - Event Rejected: " + event["name"];
                message = '<p>Your event was rejected. Contact OSL with any concerns or questions: studentactivity@augustana.edu</p>'
            }

            const mailOptions = {
                from: 'Augie Events <no-reply.osleventsapp@augustana.edu>',
                to: event["email"],
                subject: subject,
                html: message,
                attachments: attachments
            };

            return transporter.sendMail(mailOptions)
                .then(() => console.log('Email sent!'))
                .catch((error) => console.error('There was an error while sending the email:', error));
        });

    }).catch(error => {console.log(error);});
});