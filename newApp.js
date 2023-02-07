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

const calendar = google.calendar({ version: "v3", auth: "AIzaSyBGI9YoqJ1C6KWcO_hlJLYkJDV7WxQdToc" });
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

app.get('/auth/google/callback', async(req, res) => {
console.log(req.query)
const code = req.query.code;
if (code) {
const {tokens} =await  oAuth2Client.getToken(code);
console.log("token",tokens);
oAuth2Client.setCredentials(tokens);

res.send("success....")
}
else{ 
  res.status(400).send("error")
}
  
})


app.post('/send_meet_invite',(req,res)=>{
    oAuth2Client.setCredentials({refresh_token :"1//0gWvM58MpR40-CgYIARAAGBASNwF-L9IrIyxo7IrEoDmVEPt6TGkJ5soh5ZE5j225xKu_KvO86N8ISTXXQyFak2ZlhuBA-2yfgIs"});
  let {emailArr, startDate,endDate , description  , location , summary} = req.body;

  const eventStartTime = new Date(startDate);

  const eventEndTime = new Date(endDate);

  const attendees = emailArr.map((email)=>{
    return {"email" : email}
  })

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
        { method: 'email', 'minutes':24*60 },
        { method: 'popup', 'minutes': 10 },
      ],
    },
    colorId: 1,
    conferenceData: {
      createRequest: {
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        },
        requestId:"unique"
      }
    },
    extendedProperties :{
        private: {
          myId: "myId",
        }
    }
    
  };

  calendar.events.insert(
    { calendarId: "primary", eventId:"asc3rd4", resource: event ,   conferenceDataVersion: 1,sendNotifications : true , auth : oAuth2Client },
    (err , event) => {
        if (err) return console.error("Error Creating Calender Event:", err);
        return console.log("Calendar event created." , event);
    }
); 

})


app.put('/edit_meet_link' ,async (req,res)=>{
    oAuth2Client.setCredentials({refresh_token :"1//0gWvM58MpR40-CgYIARAAGBASNwF-L9IrIyxo7IrEoDmVEPt6TGkJ5soh5ZE5j225xKu_KvO86N8ISTXXQyFak2ZlhuBA-2yfgIs"});
    
//     const result = await calendar.calendarList.list({ auth : oAuth2Client });
//    console.log(result.data.items)
    // const updateEvent = async (auth, calendarId, eventId, updatedEvent) => {
    //     const result = await calendar.events.patch({
    //       auth : oAuth2Client,
    //       calendarId,
    //       eventId,
    //       resource: updatedEvent,
    //     });
      
    //     return result.data;
    //   };

    // calendar.freebusy.query(
    //     {
    //       resource: {
    //         timeMin: new Date('2023-02-07T09:30'),
    //         timeMax: new Date("2023-02-07T10:30"),
    //         timeZone: "Asia/Kolkata",
    //         items: [{ id: "primary" }],
    //       },
    //     },
    //     (err, res) => {
    //         const events = res.data.calendars.primary.busy;
    //         console.log(events);
    //     }
    //     );

    try {
        let response = await calendar.events.list({
            auth: oAuth2Client,
            calendarId: "primary",
              timeMin: new Date('2023-02-07T09:30'),
            timeMax: new Date("2023-02-07T10:30"),
            timeZone: 'Asia/Kolkata',
            privateExtendedProperty: "myId=" + "myId"
        });
    
      console.log(response.data.items)
        return items;
    } catch (error) {
        console.log(`Error at getEvents --> ${error}`);
        return 0;
    }

})


  app.listen(3001, () => {
    console.log("server is running on port 3001");
  });

  