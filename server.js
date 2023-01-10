const buildFastify = require('./api')

const app = buildFastify()

app.listen(3005, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})