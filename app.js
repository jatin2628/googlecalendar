const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { OAuth2 } = google.auth;
const app = express();
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const googleAuth = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);


const scope = ["https://www.googleapis.com/auth/calendar"];

app.get("/", (req, res) => {
  const authUrl = googleAuth.generateAuthUrl({
    access_type: "offline",
    scope: scope,
  });

  res.redirect(authUrl);
});

const calnder = google.calendar({
  version:'v3',
  auth:process.env.API_KEY
})

app.get("/auth/calender", async (req, res) => {
  
  const token = req.query.code;
  
  const {tokens} = await googleAuth.getToken(token);
  googleAuth.setCredentials(tokens);
  // res.send("user are logged in");
  res.redirect('/event');
  
});




app.get('/event',(req,res)=>{
  res.render('index');
})

app.post('/event',async (req,res)=>{
  try{
    const { summary, location, description, start, end } = req.body;

    const event = {
      summary,
      location,
      description,
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      end: {
        dateTime: new Date(end).toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      reminders: {
        useDefault: true
      }
    };
    const response = await calnder.events.insert({
      calendarId: 'primary',
      auth:googleAuth,
      resource: event
    });;

    const calendarUrl = "https://calendar.google.com/calendar/u/0/r/day" ;
    res.redirect(calendarUrl);
  } catch(error) {
    console.log(error);
    res.status(500).send('Failed to create event');
  }
});



app.listen(5000,()=>{
  console.log("APP IS LISEN AT PORT 5000");
})