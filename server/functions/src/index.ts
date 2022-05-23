const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors({ origin: true }))
const bcrypt = require("bcrypt");

exports.app = functions.https.onRequest(app)

//Keccak Hashing
/*
const { Keccak } = require('sha3')
const hash = new Keccak(256)
hash.update('foo')
let hashedCode = hash.digest('hex')
*/

//Bcrypt
// generate salt to hash password
/*
const salt = await bcrypt.genSalt(10);
let code = "foo"
let password = await bcrypt.hash(code, salt);
*/

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

  const salt = await bcrypt.genSalt(10);
  let userHash = await bcrypt.hash(req.body.authID, salt);
  const validPassword = await bcrypt.compare("foo", userHash);

  if (!validPassword) {
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
    return res.status(500).send(error)
  }
})

app.post('/add-signature', async (req: any, res: any) => {

  const salt = await bcrypt.genSalt(10);
  let userHash = await bcrypt.hash(req.body.authID, salt);
  const validPassword = await bcrypt.compare("foo", userHash);

  if (!validPassword) {
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
