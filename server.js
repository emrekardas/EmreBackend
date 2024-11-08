const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
console.log(process.env.OPENAI_API_KEY);

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Server is running on http://localhost:3000')
  })
}) 