require("dotenv").config()
const express = require("express")
const { Sequelize } = require("sequelize")
const app = express()
const Queue = require("bull")
const REDIS_URL = process.env.REDIS_URL
let workQueue = new Queue("queueEcheanceTodos", REDIS_URL )

app.use(express.json())

const sequelize = new Sequelize(process.env.DATABASE_URL)

app.get("/", function (req, res) {
  res.send(`Hello World! Environnement de ${process.env.ENV}`)
})

app.get("/todos", async function (req, res) {
  let todos = []
  try {
    todos = (await sequelize.query("SELECT * FROM todos"))[0]
  } catch (error) {
    console.error(error)
  }
  res.send(todos)
})

app.post("/todos", async function (req, res) {
  console.log(
    `Création d'un ToDo avec les données : ${JSON.stringify(req.body)}`
  )
  try {
    const todos = await sequelize.query(
      `INSERT INTO todos(description, date_echeance) VALUES(?, ?) RETURNING id`,
      {
        replacements: [req.body.description, req.body.date]
      }
    )
    await workQueue.add(
        { idTodo: todos[0][0].id, dateEcheance: req.body.date },
        { delay: new Date(req.body.date).getTime() - Date.now()}
    )
  } catch (error) {
    console.error(error)
    res.status(400)
  }
  res.send("Ok")
})

const port = process.env.PORT
app.listen(port, function () {
  console.log(`ToDo API listening on port ${port}`)
})
