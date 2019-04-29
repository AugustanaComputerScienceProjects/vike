const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

exports.moveEvents = functions.https.onRequest((req, res) => {
    var db = admin.database();
    
    db.ref('/current-events').once('value').then(function(snapshot) {
        snapshot.forEach(function(child) {
            let event = child.val();
            let nowDate = new Date();
            let eventEndDate = getEndDate(event);
            console.log(nowDate);
            console.log(eventEndDate);
            if (nowDate > eventEndDate) {
                db.ref('/past-events/' + child.key).set(event);
                db.ref('/current-events/' + child.key).remove();
            }
        });
        return;
    }).catch(error => {console.log(error);});
    res.end();
  });

  function getEndDate(event) {
    let arr = event["startDate"].split(' ');
    let arr2 = arr[0].split('-');
    let arr3 = arr[1].split(':');
    let date = new Date(arr2[2] + '-' + arr2[0] + '-' + arr2[1] + 'T' + arr3[0] + ':' + arr3[1] + '-05:00');
    date.setMinutes(date.getMinutes() + event["duration"]);
    return date;
}