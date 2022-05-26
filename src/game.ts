import { buildBuilderScene } from './builderContent'
import { signGuestBook } from './serverHandler'
import { GuestBook } from './guestbook'
import { PayButton } from './payButton'
import { ColorButton } from './colorButton'
import utils from '../node_modules/decentraland-ecs-utils/index'
import * as crypto from "@dcl/crypto-scene-utils"
import * as EthereumController from "@decentraland/EthereumController"
import { Interval } from '@dcl/ecs-scene-utils'

//0x1aefd6f4f59777cd33c6fbe152aa622b1f7d58db
buildBuilderScene()

signGuestBook().catch((error) => log(error))

const guestBook = new GuestBook(
  {
    position: new Vector3(8, 0, 10),
    rotation: Quaternion.Euler(0, 300, 0)
  },
  'test'
)

//Define left wall
const wallLeft = new Entity()
wallLeft.addComponent(
  new Transform({
    position: new Vector3(5.75, 1, 16),
    scale: new Vector3(1.5, 2, 0.1)
  })
)
wallLeft.addComponent(new BoxShape())

//Define right wall
const wallRight = new Entity()
wallRight.addComponent(
  new Transform({
    position: new Vector3(2.25, 1, 16),
    scale: new Vector3(1.5, 2, 0.1)
  })
)
wallRight.addComponent(new BoxShape())

//Define left door
const doorLeft = new Entity()
doorLeft.addComponent(
  new Transform({
    position: new Vector3(0.5, 0, 0),
    scale: new Vector3(1.1, 2, 0.05)
  })
)
doorLeft.addComponent(new BoxShape())

//Define right door
const doorRight = new Entity()
doorRight.addComponent(
  new Transform({
    position: new Vector3(-0.5, 0, 0),
    scale: new Vector3(1.1, 2, 0.05)
  })
)
doorRight.addComponent(new BoxShape())

//Make entities visible
engine.addEntity(wallLeft)
engine.addEntity(wallRight)
engine.addEntity(doorLeft)
engine.addEntity(doorRight)

// Define a material to color the door sides red
const doorMaterial = new Material()
doorMaterial.albedoColor = Color3.Red()
doorMaterial.metallic = 0.9
doorMaterial.roughness = 0.1

// Assign the material to both door sides
doorLeft.addComponent(doorMaterial)
doorRight.addComponent(doorMaterial)

// Define open and closed positions for both door sides
const doorLeftClosed = new Vector3(0.5, 0, 0)
const doorLeftOpen = new Vector3(1.25, 0, 0)
const doorRightClosed = new Vector3(-0.5, 0, 0)
const doorRightOpen = new Vector3(-1.25, 0, 0)


// This parent entity holds the state for both door sides
const doorParent = new Entity()
doorParent.addComponent(
  new Transform({
    position: new Vector3(4, 1, 16)
  })
)

//toggle behavior for doorParent
doorParent.addComponent(
  new utils.ToggleComponent(utils.ToggleState.Off, (value) => {
    if (value === utils.ToggleState.On) {
      // open doors
      doorLeft.addComponentOrReplace(
        new utils.MoveTransformComponent(doorLeftClosed, doorLeftOpen, 1)
      )
      doorRight.addComponentOrReplace(
        new utils.MoveTransformComponent(doorRightClosed, doorRightOpen, 1)
      )
    } else {
      // close doors
      doorLeft.addComponentOrReplace(
        new utils.MoveTransformComponent(doorLeftOpen, doorLeftClosed, 1)
      )
      doorRight.addComponentOrReplace(
        new utils.MoveTransformComponent(doorRightOpen, doorRightClosed, 1)
      )
    }
  })
)

engine.addEntity(doorParent)

// Set the doorParent as a parent of both door sides
doorLeft.setParent(doorParent)
doorRight.setParent(doorParent)

// Set the click behavior for both door sides
doorLeft.addComponent(
  new OnPointerDown(
    (e) => {
      checkTokens()
    },
    { button: ActionButton.POINTER, hoverText: 'Open/Close' }
  )
)

doorRight.addComponent(
  new OnPointerDown(
    (e) => {
      checkTokens()
    },
    { button: ActionButton.POINTER, hoverText: 'Open/Close' }
  )
)


//---------------------- NFT SCANNER ACCESS ---------------------------
let userAddress: string
const contractAddress = "0x1aefd6f4f59777cd33c6fbe152aa622b1f7d58db" // Contract for Pegasus

// On load
executeTask(async () => {
  try {
    userAddress = await EthereumController.getUserAccount()
    log("User Address: ", userAddress)
  } catch (error) {
    log(error.toString())
  }
})

// Check player's wallet to see if they're holding any tokens relating to that contract address
async function checkTokens() {
  let balance = await crypto.currency.balance(contractAddress, userAddress)
  log("BALANCE: ", balance)

  if (Number(balance) > 0) {
    doorParent.getComponent(utils.ToggleComponent).toggle() //Toggle doors to open if user has the token
  } else {
    log("Access Denied!")
  }
}

//--------------------------- Pay Button --------------------------
const payButton = new PayButton(
  { position: new Vector3(4, 0, 11), rotation: Quaternion.Euler(0, 0, 0) },
  '0x94b5C4fF2D4B04CF9011f3bD5D1c551caeffF5Fc',
  0.05,
  'Open Door',
  () => {//If the button called its action method, i.e. if mana is sent
    //sceneMessageBus.emit('openDoor', {})
  }
)

//---------------------- Color Changing Button --------------------------
//const interval = new Interval(3000, ()=> {log('deneme')} )
const colorButton = new ColorButton(
  { position: new Vector3(4, 0, 9)}, "Start Game", () => {})