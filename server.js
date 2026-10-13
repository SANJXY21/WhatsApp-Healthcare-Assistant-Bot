const express = require("express");
const bodyParser = require("body-parser");
const { MessagingResponse } = require("twilio").twiml;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

let userSessions = {};

const PAGE_SIZE = 5;

const hospitals = [
  { name: "KMCH Hospital", url: "https://www.kmchhospitals.com/" },
  { name: "PSG Hospitals", url: "https://www.psghospitals.com/" },
  { name: "Ganga Hospital", url: "https://www.gangahospital.com/" },
  { name: "Sankara Eye Hospital", url: "https://www.sankaraeye.com/" },
  { name: "Sri Ramakrishna Hospital", url: "https://www.sriramakrishnahospital.com/" },
  { name: "KG Hospital", url: "https://www.kghospital.com/" },
  { name: "Royal Care Hospital", url: "https://www.royalcarehospital.in/" },
  { name: "GKNM Hospital", url: "https://www.gknmhospital.org/" },
  { name: "FIMS Hospital", url: "https://www.fimshospital.com/" },
  { name: "Aravind Eye Hospital", url: "https://aravind.org/" }
];

app.post("/whatsapp", (req, res) => {
  const twiml = new MessagingResponse();
  const msg = req.body.Body ? req.body.Body.trim().toLowerCase() : "";
  const user = req.body.From;

  if (!userSessions[user]) {
    userSessions[user] = { step: "start", page: 0 };
  }

  const session = userSessions[user];
  let reply = "";

  // ===== RESTART =====
  if (msg === "hi" || msg === "restart") {
    session.step = "main";
    session.page = 0;
    reply =
      "Welcome to Coimbatore Health Assistant 🤖\n\n" +
      "1️⃣ View Hospitals\n" +
      "2️⃣ Search by Disease\n\n" +
      "Reply with number.";
  }

  // ===== BACK =====
  else if (msg === "0") {
    session.step = "main";
    session.page = 0;
    reply =
      "Main Menu:\n\n" +
      "1️⃣ View Hospitals\n" +
      "2️⃣ Search by Disease";
  }

  // ===== MAIN MENU =====
  else if (session.step === "main") {

    if (msg === "1") {
      session.step = "hospitalList";
      session.page = 0;
      reply = generateHospitalPage(session.page);
    }

    else if (msg === "2") {
      session.step = "diseaseMenu";
      reply =
        "Select Disease:\n\n" +
        "1️⃣ Heart ❤️\n" +
        "2️⃣ Eye 👁️\n" +
        "3️⃣ Bone 🦴\n" +
        "4️⃣ General 🩺\n\n" +
        "Reply with number.\n0️⃣ Back";
    }

    else {
      reply = "Invalid input ❌";
    }
  }

  // ===== DISEASE MENU =====
  else if (session.step === "diseaseMenu") {

    session.step = "hospitalList";
    session.page = 0;

    reply =
      "Recommended Hospitals:\n\n" +
      "Showing all available hospitals.\n\n" +
      generateHospitalPage(session.page);
  }

  // ===== HOSPITAL PAGINATION =====
  else if (session.step === "hospitalList") {

    if (msg === "9") {
      if ((session.page + 1) * PAGE_SIZE < hospitals.length) {
        session.page++;
        reply = generateHospitalPage(session.page);
      } else {
        reply = "No more hospitals.\n0️⃣ Back";
      }
    }

    else {
      const selected = parseInt(msg) - 1 + (session.page * PAGE_SIZE);

      if (selected >= 0 && selected < hospitals.length) {
        reply = `Book at ${hospitals[selected].name}:\n${hospitals[selected].url}`;
        session.step = "main";
        session.page = 0;
      } else {
        reply = "Invalid selection ❌\n9️⃣ Next Page\n0️⃣ Back";
      }
    }
  }

  else {
    reply = "Type 'hi' to start.";
  }

  twiml.message(reply);
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

function generateHospitalPage(page) {
  let start = page * PAGE_SIZE;
  let end = start + PAGE_SIZE;
  let pageHospitals = hospitals.slice(start, end);

  let message = "Select Hospital:\n\n";

  pageHospitals.forEach((h, index) => {
    message += `${index + 1}️⃣ ${h.name}\n`;
  });

  message += "\n9️⃣ Next Page\n0️⃣ Back";

  return message;
}

app.listen(3000, () => {
  console.log("WhatsApp Bot FULL VERSION running on port 3000");
});