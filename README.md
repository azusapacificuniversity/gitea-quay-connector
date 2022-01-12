# Gitea Quay Connector
This is middleware that will proxy gitea post data into a format that quay will be able to consume consistently.
In some local testing, quay has not been able to consistently parse the data from the gitea payloads, to generate tags properly.
This alters the gitea payload to exactly match the currently documented requirements from RedHat.

## Testing Locally
You can make changes locally to the app.js and test it by running `npm start`.
After that you should be able to view the page locally at http://localhost:3000

## Building a container image:
Run `podman build ./ -t gitea-quay-connector:latest`

## Usage
Run the middleware container and append quaywebhook with the webhook from yourquay instance to the host url.
```
Examples:
http://localhost:3000/?quaywebhook=<YourWebhookFromQuayHere>
http://localhost:3000/?quaywebhook=https://$token:FJLSFK1gk8402...@quay.example.edu/...
https://middleware.okd.example.edu/?quaywebhook=https://$token:FJLSFK1gk8402...@quay.example.edu/...
```
