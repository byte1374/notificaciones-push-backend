const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔐 Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-adminsdk.json"))
});

// 🗂️ Almacenamiento temporal en memoria
const tokensRegistrados = new Set();         // Todos los tokens
const tokensAceptaron = new Set();           // Tokens que aceptaron ver ofertas
let ultimoMensaje = null;                    // Último mensaje enviado

// ✅ Registrar un token al momento de avanzar
app.post("/registrar-token", (req, res) => {
  const { token } = req.body;
  if (token) {
    tokensRegistrados.add(token);
    console.log("✅ Token registrado:", token);
  }
  res.sendStatus(200);
});

// ✅ Marcar que el cliente aceptó recibir notificaciones al hacer clic en "Ver Ofertas"
app.post("/marcar-aceptado", (req, res) => {
  const { token } = req.body;
  if (token) {
    tokensAceptaron.add(token);
    console.log("🟢 Token aceptó ofertas:", token);
  }
  res.json({ ok: true });
});

// ✅ Enviar notificación a todos los tokens registrados
app.post("/enviar", async (req, res) => {
  const mensajeTexto = req.body.mensaje || "¡Ofertas increíbles!";
  ultimoMensaje = mensajeTexto;

  const tokens = Array.from(tokensRegistrados);
  if (tokens.length === 0) return res.status(400).send("No hay tokens registrados.");

  const mensaje = {
    notification: {
      title: "Promo del día",
      body: mensajeTexto
    },
    tokens
  };

  try {
    const respuesta = await admin.messaging().sendEachForMulticast(mensaje);
    console.log("📢 Notificaciones enviadas:", respuesta.successCount);
    res.send("✅ Notificaciones enviadas correctamente.");
  } catch (err) {
    console.error("❌ Error al enviar notificaciones:", err);
    res.status(500).send("❌ Error al enviar notificaciones.");
  }
});

// ✅ Consultar el último mensaje promocional enviado
app.get("/ultimo", (req, res) => {
  res.json({ mensaje: ultimoMensaje });
});

// ✅ Ver tokens que aceptaron recibir ofertas
app.get("/aceptaron", (req, res) => {
  res.json({ aceptaron: Array.from(tokensAceptaron) });
});

// 🟢 Iniciar servidor en el puerto 3000
app.listen(3000, () => {
  console.log("🚀 Backend escuchando en http://localhost:3000");
});
