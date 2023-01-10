const buildFastify = require('./api-tdd')

const app = buildFastify()

app.listen(3006, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})