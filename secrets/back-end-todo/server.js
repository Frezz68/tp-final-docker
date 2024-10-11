const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

function handleDisconnect() {
  const db = mysql.createConnection({
    host: process.env.DATABASE_HOST || "db",
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "blablabla",
    database: process.env.DATABASE_NAME || "tododb",
  });

  db.connect((err) => {
    if (err) {
      console.error("Erreur de connexion à la base de données:", err);
      setTimeout(handleDisconnect, 2000); // Réessayer après 2 secondes
    } else {
      console.log("Connecté à la base de données MySQL");
    }
  });

  db.on("error", (err) => {
    console.error("Erreur MySQL:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect(); // Reconnecter automatiquement si la connexion est perdue
    } else {
      throw err;
    }
  });

  return db;
}
const db = handleDisconnect();
db.on("error", (err) => {
  console.error("Erreur MySQL:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    handleDisconnect(); // Reconnecter automatiquement si la connexion est perdue
  } else {
    throw err;
  }
});

// Récupérer toutes les tâches
app.get("/api/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Ajouter une nouvelle tâche
app.post("/api/tasks", (req, res) => {
  const task = req.body;
  if (!task.description) {
    return res.status(400).send("La description de la tâche est requise.");
  }

  db.query(
    "INSERT INTO tasks (description) VALUES (?)",
    [task.description],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res
          .status(201)
          .json({ id: result.insertId, description: task.description });
      }
    }
  );
});

// Supprimer une tâche
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  db.query("DELETE FROM tasks WHERE id = ?", [taskId], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(204).send();
    }
  });
});

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur back-end en écoute sur le port ${PORT}`);
});
