const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔒 Lista de tokens registrados
const tokens = [];
// 🟢 Tokens que aceptaron ver ofertas
const tokensAceptaron = [];
// 📝 Último mensaje promocional
let ultimoMensaje = null;

// 🔐 Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-adminsdk.json"))
});

// ✅ Registrar un token de cliente
app.post("/registrar-token", (req, res) => {
  const { token } = req.body;
  if (token && !tokens.includes(token)) {
    tokens.push(token);
    console.log("✅ Token registrado:", token);
  }
  res.sendStatus(200);
});

// ✅ Marcar que el cliente aceptó las notificaciones
app.post("/marcar-aceptado", (req, res) => {
  const { token } = req.body;
  if (token && !tokensAceptaron.includes(token)) {
    tokensAceptaron.push(token);
    console.log("🟢 Token aceptó recibir ofertas:", token);
  }
  res.json({ ok: true });
});

// ✅ Enviar notificación a todos los tokens registrados
app.post("/enviar", async (req, res) => {
  const mensajeTexto = req.body.mensaje || "¡Ofertas increíbles!";
  ultimoMensaje = mensajeTexto;

  const mensaje = {
    notification: {
      title: "Promo del día",
      body: mensajeTexto
    },
    tokens
  };

  try {
    const respuesta = await admin.messaging().sendEachForMulticast(mensaje);
    console.log("📣 Notificaciones enviadas:", respuesta.successCount);
    res.send("Notificaciones enviadas");
  } catch (err) {
    console.error("❌ Error al enviar notificaciones:", err);
    res.status(500).send("Error enviando notificaciones");
  }
});

// ✅ Consultar el último mensaje enviado
app.get("/ultimo", (req, res) => {
  res.json({ mensaje: ultimoMensaje });
});

// ✅ Ver quiénes aceptaron recibir ofertas
app.get("/aceptaron", (req, res) => {
  res.json({ aceptaron: tokensAceptaron });
});

// 🟢 Iniciar servidor
app.listen(3000, () => console.log("🚀 Servidor escuchando en puerto 3000"));
