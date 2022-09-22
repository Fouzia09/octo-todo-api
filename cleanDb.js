const {Sequelize} = require("sequelize")
let workQueue = new Queue("queueEcheanceTodos", REDIS_URL)

await sequelize.query(
    `DELETE * FROM todos WHERE IS = ?`,
)
})