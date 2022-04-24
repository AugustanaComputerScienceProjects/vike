const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors');
const QRCode = require('qrcode');
admin.initializeApp();

// File for Firebase Functions
('use strict');
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
// Transporter config for sending emails
let transporter = nodemailer.createTransport({
  service: 'gmail',
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
    .schedule('*/10 * * * *') // every 10 minute
    .timeZone('America/Chicago')
    .onRun((context) => {
      let db = admin.database();
      console.log('working');

      return db
        .ref('/current-events')
        .once('value')
        .then((snapshot) => {
          let promises = [];
          snapshot.forEach((child) => {
            let event = child.val();
            let nowDate = new Date();
            let eventEndDate = getEndDate(event);
            nowDate.setMinutes(nowDate.getMinutes() - 300);
            console.log(nowDate + 'vs.' + eventEndDate);
            // add one hour buffer before we move to past events (e.g. for Raffle time)
            eventEndDate.setMinutes(eventEndDate.getMinutes() + 60);
            if (nowDate > eventEndDate) {
              console.log('Moving Event: ' + event['name']);
              promises.push(db.ref('/past-events/' + child.key).set(event));
              promises.push(db.ref('/current-events/' + child.key).remove());
              if (event['imgid'] !== 'default') {
                promises.push(
                  admin
                    .storage()
                    .bucket('Images/' + event['imgid'] + '.jpg')
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
    .schedule('0 2 * * *')
    .timeZone('America/Chicago')
    .onRun((context) => {
      let databaseRef = admin.database();
      let nowDate = new Date();
      return databaseRef
        .ref('/pepsico')
        .once('value')
        .then((snapshot) => {
          let promises = [];
          snapshot.forEach((child) => {
            let event = child.val();
            // promises.push(
            //   databaseRef.ref('/past-events/' + child.key).set(event)
            // );
            promises.push(
              databaseRef.ref('/past-pepsico/' + child.key).set(event)
            );
            promises.push(
              databaseRef
                .ref('/pepsico')
                .child(child.key)
                .remove()
            );
          });

          promises.push(
            databaseRef.ref('/pepsico').push({
              name: 'Pepsico Attendance',
              startDate: formatDate(nowDate) + ' ' + '06:00',
              duration: 18 * 60 - 1, //almost 18 hours, until 11:59 PM
              location: 'Pepsico Recreational Center',
              organization: 'Pepsico',
              imgid: 'default.jpg',
              description: '(auto-generated Pepsico Event)',
              tags: '',
              email: 'michaelwardach17@augustana.edu',
            })
          );
          console.log(nowDate.getDay());
          console.log(nowDate.getMonth());
          console.log('Pepsico Moved and Created');
          return Promise.all(promises);
        })
        .catch((error) => {
          console.log(error);
        });
    });

// Gets the end date of a given Event
function getEndDate(event) {
  let dateTimePieces = event['startDate'].trim().split(' ');
  let datePart = dateTimePieces[0];
  let timePart = dateTimePieces[1];
  let date = new Date(datePart + 'T' + timePart);
  date.setMinutes(date.getMinutes() + event['duration']);
  return date;
}
//Formats a date object with padded zeros, e.g.  2019-02-25
function formatDate(date) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1);
  let day = String(date.getDate());
  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    console.log('Day before: ' + day);
    day = '0' + day;
    console.log('Day after: ' + day);
  }

  return year + '-' + month + '-' + day;
}

// Firebase Cloud Function emailNotify - notifies leaders when their Event gets accepted or rejected via email
exports.emailNotify = functions.database
  .ref('/pending-events/{eventID}')
  .onDelete((snapshot, context) => {
    console.log('Deleted');
    return admin
      .database()
      .ref('/current-events/' + snapshot.key)
      .once('value')
      .then((snap) => {
        console.log('Current Event: ' + snap);
        let event = snapshot.val();
        console.log('Event: ' + event);
        if (event['email'] === 'Deleted by user') {
          return;
        }

        return QRCode.toDataURL(
          'https://osl-events-app.firebaseapp.com/event?id=' +
            snapshot.key +
            '&name=' +
            event['name'],
          function(err, url) {
            console.log('QR code function');
            if (err) {
              return err;
            }
            console.log('No error');
            var subject = '';
            var message = '';
            var attachments = [];
            if (snap.hasChildren()) {
              console.log('Has Children');
              console.log('Event Accepted: ' + event['name']);
              subject = 'Augie Events - Event Accepted: ' + event['name'];
              message =
                '<p>Your event was accepted and is now in current events! You can view the event on the mobile Augustana OSL Events App and save/download the QR code below.</p>';
              attachments = [
                {
                  filename: event['name'] + '-QR Code.png',
                  path: url,
                },
              ];
            } else {
              console.log('Event Rejected: ' + event['name']);
              subject = 'Augie Events - Event Rejected: ' + event['name'];
              message =
                '<p>Your event was rejected. Contact OSL with any concerns or questions: osleventsapp@augustana.edu</p>';
            }

            const mailOptions = {
              from: 'Augie Events <no-reply.osleventsapp@augustana.edu>',
              to: event['email'],
              subject: subject,
              html: message,
              attachments: attachments,
            };

            return transporter
              .sendMail(mailOptions)
              .then(() => console.log('Email sent!'))
              .catch((error) =>
                console.error(
                  'There was an error while sending the email:',
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
