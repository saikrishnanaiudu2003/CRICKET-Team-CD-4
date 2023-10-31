const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let du = null;

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`Server error ${e}`);
    process.exit(1);
  }
};

initializeDbServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (req, res) => {
  const getBooks = `
    SELECT * FROM cricket_team ORDER BY player_id`;
  const bookArray = await db.all(getBooks);
  res.send(bookArray);
});

app.post("/players/", async (req, res) => {
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    )`;
  const dbResponse = await db.run(addPlayerQuery);
  res.send("Player Added to Team");
});

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetailsId = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId}
    `;
  const dbResponse = await db.get(playerDetailsId);
  res.send(convertDbObjectToResponseObject(dbResponse));
});

app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerUpdateDetails = req.body;
  const { playerName, jerseyNumber, role } = playerUpdateDetails;
  const updatePlayerQuery = `
  UPDATE cricket_team SET player_name='${playerName}',jersey_number	=${jerseyNumber},role='${role}';
  `;
  const dbResponse = await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const deleteQuery = `
    DELETE FROM cricket_team WHERE player_id=${playerId};`;
  const dbResponse = await db.run(deleteQuery);
  res.send("Player Removed");
});

module.exports = app;
