// curl http://localhost:3005/robots | json_pp
// curl http://localhost:3005/robots/6fbf967c-661c-4cc6-ba03-a9979195b9d3 | json_pp
// curl -X POST -H "Content-Type: application/json" -d '{"endTime": 20, "area": "Park"}' http://localhost:3005/robots/6fbf967c-661c-4cc6-ba03-a9979195b9d3/setSchedule
// curl -X POST -H "Content-Type: application/json" -d '{"startTime": 12, "endTime": 20, "area": "Park"}' http://localhost:3005/robots/6fbf967c-661c-4cc6-ba03-a9979195b9d3/setSchedule
// curl -X POST http://localhost:3005/robots/6fbf967c-661c-4cc6-ba03-a9979195b9d3/move
// curl -X POST -H "Content-Type: application/json" -d '{"area": "Park"}' http://localhost:3005/robots/6fbf967c-661c-4cc6-ba03-a9979195b9d3/move

const fastify = require("fastify")
const db = require("./db")
const { v4: uuid } = require("uuid")

function buildFastify() {
  const app = fastify()

  app.get("/robots", async () => {
    return db.select().from("robots")
  })

  app.get("/robots/:id", async (request, reply) => {
    return db.select().from("robots").where({ id: request.params.id }).first()
  })

  app.get("/robots/:id/history", async (request, reply) => {
    return db
      .select()
      .from("robots_history")
      .where({ robotId: request.params.id })
  })

  app.post("/robots/:id/move", async (request, reply) => {
    await db.transaction(async (trx) => {
      const robotToMove = await trx
        .select()
        .from("robots")
        .where({ id: request.params.id })
        .first()
  
      if (!robotToMove) return reply.code(404).send({ error: "Robot not found" })
  
      const { area } = request.body
      if (!area) return reply.code(400).send({ error: "Area should be set!" })
  
      const d = new Date()
      const hours = d.getUTCHours()
      const schedule = await trx
        .select()
        .from("schedules")
        .where({ robotId: robotToMove.id })
        .andWhere("startTime", "<", hours)
        .andWhere("endTime", ">", hours)
        .first()

      if (schedule) {
        // const udpatedSchedule = updateSchedule(schedule)
        // update schedule in database
        return reply.code(400).send({ error: "Robot is scheduled!" })
      }
  
      await trx("robots")
        .where({ id: robotToMove.id })
        .update({ status: "cleaning", currentArea: area })
  
      await trx("robots_history").insert({
        id: uuid(),
        robotId: robotToMove.id,
        event: "moved",
        metadata: { area },
      })
    })

    return "OK"
  })

  app.post("/robots/:id/setSchedule", async (request, reply) => {
    await db.transaction(async (trx) => {
    //   const id = request.params.id
    //   const schedule = request.body
  
    //   if (
    //     !schedule ||
    //     !schedule.startTime ||
    //     !schedule.endTime ||
    //     !schedule.area
    //   ) {
    //     reply.status(400).send({ error: "Invalid schedule object" })
    //     return
    //   }
  
    //   const isRobotAlreadyInSchedule = await trx
    //     .select("id")
    //     .from("schedules")
    //     .where({ robotId: id })
    //     .andWhere("startTime", "<", schedule.endTime)
    //     .andWhere("endTime", ">", schedule.startTime)
    //     .andWhere("area", "=", schedule.area)
    //     .first()
  
    //   if (Boolean(isRobotAlreadyInSchedule)) {
    //     return reply
    //       .status(400)
    //       .send("There's already another robot working in this schedule")
    //   }
  
      const [newSchedule] = await trx
        .insert({ ...schedule, robotId: id, id: uuid() })
        .into("schedules")
        .returning(["id", "robotId", "startTime", "endTime", "area"])
  
    //   const scheduledRobot = await trx
    //     .select()
    //     .from("robots")
    //     .where({ id: request.params.id })
    //     .first()
  
    //   if (scheduledRobot.status === "idle") {
    //     await trx("robots")
    //       .update({ currentArea: schedule.area, status: "cleaning" })
    //       .where("robots.id", "=", id)
    //   }
  
    //   await trx("robots_history").insert({
    //     id: uuid(),
    //     robotId: id,
    //     event: "scheduled",
    //     metadata: { scheduleId: newSchedule.id },
    //   })
    })

    return "Schedule created!"
  })

  app.get("/robots/:id/schedule", async (request, reply) => {
    return db.select().from("schedules").where({ robotId: request.params.id })
  })

  return app
}

module.exports = buildFastify
