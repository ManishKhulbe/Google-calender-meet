const express = require("express");
const app = express();
express.json();
require("dotenv").config();
const { google } = require("googleapis");

const { OAuth2 } = google.auth;

const oAuth2Client = new OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
app.get('/signIn', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });

  res.redirect(url);
})
// oAuth2Client.getToken(code, (err, tokens) => {
//   if (err) {
//     console.error("Error retrieving access token", err);
//     return;
//   }
//   oAuth2Client.setCredentials(tokens);
//   res.redirect("http://localhost:3000");
// });
app.get('/auth/google/callback', (req, res) => {
console.log(req.query)
const code = req.query.code;
if (code) {
const {tokens} = oAuth2Client.getToken(code);
oAuth2Client.setCredentials(tokens);

res.send("success")
}
else{ 
  res.status(400).send("error")
}
  
})


app.post('/send_meet_invite',(req,res)=>{
console.log(req.body,"llll")
  // let {emailArr, startDate,endDate , description  , location , summary} = req.body;

  // // oAuth2Client.setCredentials({
  // //   refresh_token:refresh_token 
  // //     // "1//04mDOdanaf49-CgYIARAAGAQSNwF-L9IrKQGgmCJVNwgjgvvD2BsD2y95_ehkVfhbX8HVRSIYHBqShejj55Rz5CTZCAlMIws9PC0",
     
  // // });

  // const eventStartTime = new Date(startDate);
  // // eventStartTime.setDate(eventStartTime.getDate() + 1);
  // const eventEndTime = new Date(endDate);
  // // eventEndTime.setDate(eventEndTime.getDate() + 1);
  // // eventEndTime.setMinutes(eventEndTime.getMinutes() + 45);
  // const attendees = emailArr.map((email)=>{
  //   return {"email" : email}
  // })

  // const event = {
  //   summary: summary,
  //   location: location,
  //   description: description,
  //   start: {
  //     dateTime: eventStartTime,
  //     timeZone: "Asia/Kolkata",
  //   },
  //   end: {
  //     dateTime: eventEndTime,
  //     timeZone: "Asia/Kolkata",
  //   },
  //   attendees: attendees,
  //   reminders: {
  //     useDefault: false,
  //     overrides: [
  //       { method: 'email', 'minutes':24*60 },
  //       { method: 'popup', 'minutes': 10 },
  //     ],
  //   },
  //   colorId: 1,
  //   conferenceData: {
  //     createRequest: {
  //       conferenceSolutionKey: {
  //         type: 'hangoutsMeet'
  //       },
  //       requestId:"unique"
  //     }
  //   },
    
  // };

  // calendar.freebusy.query(
  //   {
  //     resource: {
  //       timeMin: eventStartTime,
  //       timeMax: eventEndTime,
  //       timeZone: "Asia/Kolkata",
  //       items: [{ id: "primary" }],
  //     },
  //   },
  //   (err, res) => {
  //     if (err) return console.error("Free Busy Query Error: ", err);
  //     const events = res.data.calendars.primary.busy;
  //     console.log(events);
  //     if (events.length === 0){
  //         return calendar.events.insert(
  //             { calendarId: "primary", resource: event ,   conferenceDataVersion: 1,sendNotifications : true},
  //             (err , event) => {
  //             if (err) return console.error("Error Creating Calender Event:", err);
  //             return console.log("Calendar event created.");
  //             }
  //         ); 
  //     }else{
  //         return console.log(`Sorry I'm busy...`);
  //     }
  //   }
  // )


  calendar.freebusy.query(
    {
      resource: {
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        timeZone: "Asia/Kolkata",
        items: [{ id: "primary" }],
      },
    },
    (err, res) => {
      if (err) return console.error("Free Busy Query Error: ", err);
      const events = res.data.calendars.primary.busy;
      console.log(events);
      if (events.length === 0){
          return calendar.events.insert(
              { calendarId: "primary", resource: event ,   conferenceDataVersion: 1,sendNotifications : true , auth : oAuth2Client},
              (err , event) => {
              if (err) return console.error("Error Creating Calender Event:", err);
              return console.log("Calendar event created.");
              }
          ); 
      }else{
          return console.log(`Sorry I'm busy...`);
      }
    }
  )

})


//   console.log(oAuth2Client,"vvvvvvv")
//   calendar.events.insert(
//     { calendarId: "primary", resource: event ,   conferenceDataVersion: 1,sendNotifications : true , auth : oAuth2Client},
//     (err , event) => {
//     if (err) return console.error("Error Creating Calender Event:", err);
//     return console.log("Calendar event created.");
//     }
// ); 
// OAUTH_CLIENT_ID=722701541478-75ovggpk6nl40tjk9e6c4sn4lb9l2b4n.apps.googleusercontent.com
// OAUTH_CLIENT_SECRET=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
// REDIRECT_URL=http://localhost:3001/auth/google/callback


// OAUTH_CLIENT_ID=430106054763-p48ggok365lr3al2dpvhs21t1k95gkbm.apps.googleusercontent.com
// OAUTH_CLIENT_SECRET=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
// REDIRECT_URL=http://localhost:3001/auth/google/callback

  app.listen(3001, () => {
    console.log("server is running on port 3001");
  });

  