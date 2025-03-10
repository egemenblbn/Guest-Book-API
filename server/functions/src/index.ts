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
  let userAuthID = req.header("authID");
  //res.status(200).send(userAuthID)
  let userHash = await bcrypt.hash(userAuthID, salt); //Hash user id
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
  let userAuthID = req.header("authID");
  //res.status(200).send(userAuthID)
  let userHash = await bcrypt.hash(userAuthID, salt); //Hash user id
  const validPassword = await bcrypt.compare("foo", userHash); //Compare hashed id to password

  if (!validPassword) { //If id not valid, return
    return res.status(403).send("Forbidden")
  }
  let newSignature = req.body
  let oldCount = 0;
  let attempted : any = []
  try {
    await signatures.where("id", "==", newSignature.id).get().then((queryResults: {docs: any}) => {
      for(let doc of queryResults.docs) { attempted.push(doc.data())}
    } )
    oldCount =  await attempted[0].count;
    await signatures
      .doc('/' + newSignature.id + '/')
      .update({
        id: newSignature.id,
        name: newSignature.name,
        count: oldCount + 1
      })

    return res.status(200).send('Updated Signature!')
  } catch (error) {
    try {
      await signatures
      .doc('/' + newSignature.id + '/')
      .create({
        id: newSignature.id,
        name: newSignature.name,
        count: 1
      })

    return res.status(200).send('Created Signature!')
    } catch (e) {
      console.log(error)
      return res.status(500).send(error)
    }
    //console.log(error)
    //return res.status(500).send(error)
  }
})
