const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const axios = require('axios')
app.use(bodyParser.json())

// Check if we're using a custom cert.
if (process.env.QUAY_CA_FILE){
  const cert = fs.readFileSync(`/project/user-app/${process.env.QUAY_CA_FILE}`)
  const httpsAgent = new https.Agent({ ca: cert });
  instance = axios.create({ httpsAgent });
  console.log(`Loaded custom cert for Quay: ${process.env.QUAY_CA_FILE}`)
} else {
  instance = axios;
  console.log('No custom certs found.')
};

// This function POSTs to Quay.
const postToQuay = (payload, url) => {
  // Build a new payload that quay can consume.
  var quaypayload = {"commit":payload.after,"ref":payload.ref,"default_branch":payload.repository.default_branch,"commit_info":{"url": payload.head_commit.url,"message":payload.head_commit.message,"date":payload.head_commit.timestamp}};
  console.log(quaypayload)
  // Make the POST request to the quay webhook.
  instance.post(url, quaypayload, (error, res, body) => {
    if (error) {
      // Log errors if they exist.
      console.error(error)
      return error
    }
    // Log the results.
    console.log(`statusCode: ${res.statusCode}`)
    console.log(body)
    // Return the reponse to give back to gitea.
    return res
  })
};

app.get('/', (req, res) => {
  res.send('To use this middleware, POST the forwarding webhook as the "quaywebhook" query parameter.')
})

app.post('/', (req, res) => {
  if (req.headers['x-event-key'] == 'diagnostics:ping') {
    // This is a test and bitbucket doesn't send the HMAC, so we need to respond early.
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('pong - Please note that the server secret was not tested as a part of this test.');
  } else {
      // See if the req.query has the property token
      if (req.query.hasOwnProperty("quaywebhook")){
        var respond = postToQuay(req.body, req.query.quaywebhook);
        res.end(`Here's the response: ${respond}`);
      } else {
        // Error because we don't have this repo in the config.
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(`No quaywebhook param found in request's query parameter`);
      }
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
