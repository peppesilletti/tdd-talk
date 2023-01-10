const tap = require("tap")
const uuid = require("uuid").v4
const { Client } = require("undici")

const buildFastify = require("../api")
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

    t.equal(statusCodeGetSchedule, 200)

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

  t.test(
    "it should return an error if there's already another schedule",
    async (t) => {
      const robot = await createRobot()
      const area = "Park"
      const startTime = 11
      const endTime = 20

      await client.request({
        method: "POST",
        path: `/robots/${robot.id}/setSchedule`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startTime, endTime, area }),
      })

      const { statusCode: statusCodeSetSchedule, body: bodySetSchedule } =
        await client.request({
          method: "POST",
          path: `/robots/${robot.id}/setSchedule`,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ startTime, endTime, area }),
        })

      t.equal(statusCodeSetSchedule, 400)
      t.equal(
        await bodySetSchedule.text(),
        "There's already another robot working in this schedule"
      )

      t.end()
    }
  )

  t.test("it should make the robot clean if it's idle when assigning the schedule and no schedule is present", async (t) => {
    const robot = await createRobot()
    const area = "Park"
    const startTime = 11
    const endTime = 20

    await client.request({
      method: "POST",
      path: `/robots/${robot.id}/setSchedule`,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startTime, endTime, area }),
    })

    const { body } = await client.request({
      method: "GET",
      path: `/robots/${robot.id}`,
    })

    const scheduledRobot = await body.json()

    t.equal(scheduledRobot.status, "cleaning")
    t.equal(scheduledRobot.currentArea, area)

    t.end()
  })

  t.test("it should move the robot correctly to another area when it's not in a shift already", async (t) => {
    const robot = await createRobot({ status: 'idle' })
    const area = 'new area'

    await client.request({
      method: "POST",
      path: `/robots/${robot.id}/move`,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ area }),
    })

    const { body } = await client.request({
      method: "GET",
      path: `/robots/${robot.id}`,
    })

    const scheduledRobot = await body.json()

    t.equal(scheduledRobot.status, "cleaning")
    t.equal(scheduledRobot.currentArea, area)

    // get robot history and check that it has moved to the new area
    const { body: historyBody } = await client.request({
      method: "GET",
      path: `/robots/${robot.id}/history`,
    })

    const history = await historyBody.json()

    t.equal(history.length, 1)
    t.equal(history[0].metadata.area, area)
    t.equal(history[0].event, "moved")

    t.end()
  })

  t.test("when moving a robot already in a schedule and there is no other free robots, it should return an error", async (t) => {
    const robot = await createRobot({ status: 'cleaning' })
    const area = "Park"
    const startTime = 11
    const endTime = 20

    await client.request({
      method: "POST",
      path: `/robots/${robot.id}/setSchedule`,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startTime, endTime, area }),
    })

    const { body } =await client.request({
      method: "POST",
      path: `/robots/${robot.id}/move`,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ area }),
    })

    const error = await body.json()

    t.equal(error.error, "Robot is scheduled!")

    t.end()
  })

  t.end()
})
