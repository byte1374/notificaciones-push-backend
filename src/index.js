const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const tokens = [];

admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-adminsdk.json"))
});

app.post("/registrar-token", (req, res) => {
  const { token } = req.body;
  if (token && !tokens.includes(token)) tokens.push(token);
  console.log("Token registrado:", token);
  res.sendStatus(200);
});

app.post("/enviar", async (req, res) => {
  const mensaje = {
    notification: {
      title: "Promo del día",
      body: req.body.mensaje || "¡Ofertas increíbles!"
    },
    tokens
  };

  try {
    const respuesta = await admin.messaging().sendEachForMulticast(mensaje);
    console.log("Notificaciones enviadas:", respuesta.successCount);
    res.send("Notificaciones enviadas");
  } catch (err) {
    console.error("Error al enviar notificaciones:", err);
    res.status(500).send("Error enviando notificaciones");
  }
});

app.listen(3000, () => console.log("Servidor escuchando en puerto 3000"));
