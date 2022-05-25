import { buildBuilderScene } from './builderContent'
import { GuestBook } from './guestbook'
import utils from '../node_modules/decentraland-ecs-utils/index'

//0x1aefd6f4f59777cd33c6fbe152aa622b1f7d58db

buildBuilderScene()

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
      doorParent.getComponent(utils.ToggleComponent).toggle()
    },
    { button: ActionButton.POINTER, hoverText: 'Open/Close' }
  )
)

doorRight.addComponent(
  new OnPointerDown(
    (e) => {
      doorParent.getComponent(utils.ToggleComponent).toggle()
    },
    { button: ActionButton.POINTER, hoverText: 'Open/Close' }
  )
)