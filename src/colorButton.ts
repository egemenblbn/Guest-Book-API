import { getListOfWearables } from 'node_modules/@dcl/crypto-scene-utils/dist/wearable/index'
import utils from '../node_modules/decentraland-ecs-utils/index'
import { sceneMessageBus } from './messageBus'
const base_Model = new GLTFShape('models/PaidButton/Base.glb')
const clickSound = new AudioClip('sounds/click.mp3')


export class ColorButton extends Entity {
    //Properties
    gameInProgress: boolean
    buttonMaterial: Material
    action: () => void
    //Constructor(Parameters){Implementation}
    constructor(
        pos: TranformConstructorArgs,
        hoverText: string,
        action: () => void
      ) {
          super()
          engine.addEntity(this)

          this.addComponent(new SphereShape())
          this.addComponent(new Transform(pos))
          this.buttonMaterial = new Material()
          this.buttonMaterial.albedoColor = Color3.Red()
          this.addComponent(this.buttonMaterial)

          this.gameInProgress = false

          this.addComponent(
            new OnPointerDown(
              () => {
                if (!this.gameInProgress) { //Then start a new game
                    sceneMessageBus.emit("started game", {})
                    log('STARTED NEW GAME!')
                } else { //Then win
                    sceneMessageBus.emit("ended game", {})
                    log('YOU WON!')
                }
              },
              { hoverText: hoverText }
            )
          )
    
      }

      public startGame() {
        this.gameInProgress = true
        let millisec = this.getRandomInt(5) * 1000
        this.addComponent(new utils.Interval(millisec, (): void => {
            this.buttonMaterial.albedoColor = Color3.Blue()
        }))
      }

      public endGame() {
        this.gameInProgress = false
        this.buttonMaterial.albedoColor = Color3.Red()
        this.removeComponent(utils.Interval)
      }

      public getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
      }

}
