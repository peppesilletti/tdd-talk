const tap = require("tap")
const uuid = require("uuid").v4
const { Client } = require("undici")

const buildFastify = require("../api-tdd")
const db = require("../db")

async function createRobot({ status = 'idle' } = {}) {
  return (await db
    .insert(
      { id: uuid(), currentArea: "Park", orientation: "N", status, battery: 100 },
    )
    .into("robots")
    .returning('*'))[0]
}

tap.test("scheduling", async (t) => {
  const fastify = buildFastify()
  await fastify.listen()
  const client = new Client("http://localhost:" + fastify.server.address().port)

  t.before(async () => {
    await db.migrate.latest()
  })

  t.teardown(async () => {    
    fastify.close()
    client.close()
    db.destroy()
  })

  t.test("it should create a new schedule for a robot correctly", async (t) => {
    const robot = await createRobot()

    const area = "Park"
    const startTime = 11
    const endTime = 20

    const { statusCode: statusCodeSetSchedule, body: bodySetSchedule } =
      await client.request({
        method: "POST",
        path: `/robots/${robot.id}/setSchedule`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startTime, endTime, area }),
      })

    t.equal(statusCodeSetSchedule, 200)
    t.equal(await bodySetSchedule.text(), "Schedule created!")

    const { statusCode: statusCodeGetSchedule, body: bodyGetSchedule } =
      await client.request({
        method: "GET",
        path: `/robots/${robot.id}/schedule`,
      })

    t.match(await bodyGetSchedule.json(), [
      {
        id: String,
        robotId: robot.id,
        startTime,
        endTime,
        area,
      },
    ])

    t.end()
  })

  t.skip("test", async (t) => {
    const robot = await createRobot()

    const area = "Park"
    const startTime = 11
    const endTime = 20

    const { statusCode: statusCodeSetSchedule, body: bodySetSchedule } =
      await client.request({
        method: "POST",
        path: `/robots/${robot.id}/setSchedule`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startTime, endTime, area }),
      })

    t.equal(statusCodeSetSchedule, 200)
    t.equal(await bodySetSchedule.text(), "Schedule created!")

    const { statusCode: statusCodeGetSchedule, body: bodyGetSchedule } =
      await client.request({
        method: "GET",
        path: `/robots/${robot.id}/schedule`,
      })

    t.match(await bodyGetSchedule.json(), [
      {
        id: String,
        robotId: robot.id,
        startTime,
        endTime,
        area,
      },
    ])

    t.end()
  })

  t.end()
})
