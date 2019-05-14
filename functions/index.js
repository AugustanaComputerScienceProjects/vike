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
        pass: ''
    }
});

// Firebase Cloud Function moveEvents - moves current events to past events when they have expired
exports.moveEvents = functions.https.onRequest((req, res) => {
    var db = admin.database();
    
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
    res.end();
  });

  // Gets the end date of a given Event
  function getEndDate(event) {
    let arr = event["startDate"].split(' ');
    let arr2 = arr[0].split('-');
    let arr3 = arr[1].split(':');
    let date = new Date(arr2[2] + '-' + arr2[0] + '-' + arr2[1] + 'T' + arr3[0] + ':' + arr3[1] + '-05:00');
    date.setMinutes(date.getMinutes() + event["duration"]);
    return date;
}

// Firebase Cloud Function emailNotify - notifies leaders when their Event gets accepted or rejected via email
exports.emailNotify = functions.database.ref('/pending-events/{userID}/{eventID}').onDelete((snapshot, context) => {
    admin.database().ref('/current-events/' + snapshot.key).once('value').then(function(snap) {
        let event = snapshot.val();
        if (event["email"] === "Deleted by user") {
            return;
        }

        return QRCode.toDataURL('https://osl-events-app.firebaseapp.com/event?id=' + snapshot.key + '&name=' + event["name"], function (err, url) {
            if(err) {
                return err;
            }
            var subject = "";
            var message = "";
            var attachments = [];
            if (snap.hasChildren()) {
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