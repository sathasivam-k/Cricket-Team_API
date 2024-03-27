const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
const db_path = path.join(__dirname, 'cricketTeam.db')

app.use(express.json())

let db = null

const InitilizeDbandServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('server running at https://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB error : ${error.message}`)
    process.exit(1)
  }
}

InitilizeDbandServer()

const convertDbArrayToResponseArray = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersList = `
    SELECT *
    FROM cricket_team;`

  const playersArray = await db.all(getPlayersList)

  response.send(
    playersArray.map(eachPlayer => convertDbArrayToResponseArray(eachPlayer)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerId = `
  SELECT
    *
  FROM 
    cricket_team
  WHERE player_id = ${playerId};`
  const playerId_result = await db.get(getPlayerId)
  response.send(convertDbArrayToResponseArray(playerId_result))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayerQuery = `
  INSERT INTO cricket_team (player_name, jersey_number, role)
  VALUES (${playerName}, ${jerseyNumber}, ${role});`
  await db.run(postPlayerQuery)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const putPlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '&{ playerName }',
    jersey_number = '&{ jerseyNumber }',
    role = '&{ role }'
  WHERE
    player_id = ${playerId};
  `
  await db.run(putPlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = '&{playerId}';`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
