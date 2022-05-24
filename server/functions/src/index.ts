const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors({ origin: true }))
const bcrypt = require("bcrypt");

exports.app = functions.https.onRequest(app)

var admin = require('firebase-admin')

var serviceAccount = require('../permissions.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://dmm-deneme.firebaseio.com',
})

app.get('/hello-world', (req: any, res: any) => {
  return res.status(200).send('Hello World!')
})

const db = admin.firestore()

let signatures = db.collection('Signatures')

app.get('/get-signatures', async (req: any, res: any) => {

  const salt = await bcrypt.genSalt(10); //Generate salt for encryption
  let userHash = await bcrypt.hash(req.body.authID, salt); //Hash user id
  const validPassword = await bcrypt.compare("foo", userHash); //Compare hashed id to password

  if (!validPassword) { //If id not valid, return
    return res.status(403).send("Forbidden")
  }

  try {
    let response: any = []
    await signatures.get().then((queryResult: { docs: any }) => {
      for (let doc of queryResult.docs) {
        response.push(doc.data())
      }
    })
    return res.status(200).send(response)
  } catch (error) {
    console.log(error)
    return res.status(500).send('server error')
  }
})

app.post('/add-signature', async (req: any, res: any) => {

  const salt = await bcrypt.genSalt(10); //Generate salt for encryption
  let userHash = await bcrypt.hash(req.body.authID, salt); //Hash user id
  const validPassword = await bcrypt.compare("foo", userHash); //Compare hashed id to password

  if (!validPassword) { //If id not valid, return
    return res.status(403).send("Forbidden")
  }
  let newSignature = req.body
  try {
    await signatures
      .doc('/' + Math.floor(Math.random() * 100000) + '/')
      .create({
        id: newSignature.id,
        name: newSignature.name,
      })

    return res.status(200).send('Signed book!')
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
})
