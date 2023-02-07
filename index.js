const express = require("express");
const app = express();
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const { OAuth2 } = google.auth;
const ical = require("ical-generator");



const oAuth2Client = new OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET 
);

oAuth2Client.setCredentials({
  refresh_token:
    "1//04mDOdanaf49-CgYIARAAGAQSNwF-L9IrKQGgmCJVNwgjgvvD2BsD2y95_ehkVfhbX8HVRSIYHBqShejj55Rz5CTZCAlMIws9PC0",
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "manish.khulbe@mobcoder.com",
    pass: "khulbe9456694701",
  },
});

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
const eventStartTime = new Date();
eventStartTime.setDate(eventStartTime.getDate() + 1);
const eventEndTime = new Date();
eventEndTime.setDate(eventEndTime.getDate() + 1);

eventEndTime.setMinutes(eventEndTime.getMinutes() + 45);

const attendeesEmails = [
  { email: "user1@example.com" },
  { email: "user2@example.com" },
];
const event = {
  summary: "Coding class",
  location: "Mobcoder Noida",
  description: "Manish secret meeting",
  start: {
    dateTime: eventStartTime,
    timeZone: "Asia/Kolkata",
  },
  end: {
    dateTime: eventEndTime,
    timeZone: "Asia/Kolkata",
  },
  attendees: attendeesEmails,
  reminders: {
    useDefault: false,
    overrides: [
      { method: "email", minutes: 24 * 60 },
      { method: "popup", minutes: 10 },
    ],
  },
  conferenceData: {
    createRequest: {
      conferenceSolutionKey: {
        type: "hangoutsMeet",
      },
      requestId: "unique",
    },
  },
};


function getIcalObjectInstance(starttime, endtime, summary,description, location, url , name ,email) {
  const cal = ical({ name: 'My test calendar event' });
  
  cal.createEvent({
          start: starttime,         // eg : moment()
          end: endtime,             // eg : moment(1,'days')
          summary: summary,         // 'Summary of your event'
          description: description, // 'More description'
          location: location,       // 'Delhi'
          url: url,                 // 'event url'
          organizer: {              // 'organizer details'
              name: name,
              email: email
          },
      });
  return cal;
  }
  
  let calObj = getIcalObjectInstance(eventStartTime,eventEndTime, 'Google meet invite link', 'Hii lets connect in a google meet call', 'Delhi', '', 'Manish Khulbe', 'manishkhulbe123@gmail.com')
  
calendar.events.insert(
  { calendarId: "primary", resource: event, conferenceDataVersion: 1 },
  async (err, event) => {
    if (err) return console.error("Error Creating Calender Event:", err);
    sendemail("manish.khulbe@mobcoder.com","manishkhulbe123@gmail.com","Google meet invitation" , `<h1>Hi, Please join the google meet link for the meeting ${event.data.hangoutLink}</h1>` , calObj ,event.data.hangoutLink)
    console.log("Event created, google meet link :  %s", event.data);
    return console.log("Calendar event created.");
  }
);

async function sendemail(from , sendto, subject, htmlbody, calendarObj = null , meetLink) {
  const mailOptions = {
    from: from,
    to: sendto,
    subject: subject,
    htmlbody: htmlbody,
  
  };

  if (calendarObj) {
    let alternatives = {
      "Content-Type": "text/calendar",
      method: "REQUEST",
      content: new Buffer(calendarObj.toString()),
      component: "VEVENT",
      "Content-Class": "urn:content-classes:calendarmessage",
    };
    mailOptions["url"]= meetLink
    mailOptions["alternatives"] = alternatives;
    mailOptions["alternatives"]["contentType"] = "text/calendar";
    mailOptions["alternatives"]["content"] = new Buffer(calendarObj.toString());
  }
  transporter.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: ", response);
    }
  });
}

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
