const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config();
const { google } = require("googleapis");

const { OAuth2 } = google.auth;

const oAuth2Client = new OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const calendar = google.calendar({
  version: "v3",
  auth: process.env.CALENDAR_API_KEY,
});
app.get("/signIn", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });

  res.redirect(url);
});

app.get("/auth/google/callback", async (req, res) => {
  console.log(req.query);
  const code = req.query.code;
  if (code) {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("token", tokens);
    oAuth2Client.setCredentials(tokens);

    res.send("success....");
  } else {
    res.status(400).send("error");
  }
});

app.post("/send_meet_invite", (req, res) => {
  oAuth2Client.setCredentials({
    refresh_token:process.env.REFRESH_TOKEN
  });
  let { emailArr, startDate, endDate, description, location, summary } =
    req.body;

  const eventStartTime = new Date(startDate);

  const eventEndTime = new Date(endDate);

  const attendees = emailArr.map((email) => {
    return { email: email };
  });

  const event = {
    summary: summary,
    location: location,
    description: description,
    start: {
      dateTime: eventStartTime,
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: eventEndTime,
      timeZone: "Asia/Kolkata",
    },
    attendees: attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
    colorId: 1,
    conferenceData: {
      createRequest: {
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
        requestId: "unique",
      },
    }
  };

  calendar.events.insert(
    {
      calendarId: "primary",
      eventId: "asc3rd4",
      resource: event,
      conferenceDataVersion: 1,
      sendNotifications: true,
      auth: oAuth2Client,
    },
    (err, event) => {
      if (err) return console.error("Error Creating Calender Event:", err);
      return console.log("Calendar event created.", event);
    }
  );
});

app.put("/edit_meet_link", async (req, res) => {
  let { emailArr, startDate, endDate, description, location, summary } = req.body;
  oAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  try {
    const attendees = emailArr.map((email) => {
      return { email: email };
    });
    const updatedEvent = {
      summary: summary,
      location: location,
      description: description,
      start: {
        dateTime: new Date(startDate),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: new Date(endDate),
        timeZone: "Asia/Kolkata",
      },
      attendees: attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
      colorId: 1,
      conferenceData: {
        createRequest: {
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
          requestId: "unique",
        },
      },
    };

    const result = await calendar.events.patch({
      auth: oAuth2Client,
      calendarId: "primary",
      eventId: eventId, 
      resource: updatedEvent,
    });
    console.log(result);
    if(result.status === 200){
      res.send("success update");
    }
  
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`);
    return 0;
  }
});


app.delete("/delete_meet_link", async (req, res) => {
  oAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });
  try {
    let {eventId} = req.body;
    const result = await calendar.events.delete({
      auth: oAuth2Client,
      calendarId: "primary",
      eventId: eventId,
    });
    if(result.status === 204){
      res.send("success delete");
    }
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`);
    return 0;
  }
});

app.listen(3001, () => {
  console.log("server is running on port 3001");
});
