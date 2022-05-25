import utils from '../node_modules/decentraland-ecs-utils/index'
const base_Model = new GLTFShape('models/PaidButton/Base.glb')
const clickSound = new AudioClip('sounds/click.mp3')


export class ColorButton extends Entity {
    //Properties
    gameInProgress: boolean
    action: () => void
    //Constructor(Parameters){Implementation}
    constructor(
        pos: TranformConstructorArgs,
        hoverText: string,
        action: () => void
      ) {
          super()
          engine.addEntity(this)

          this.addComponent(base_Model)
          this.addComponent(new Transform(pos))

          const button = new Entity()
          const buttonMaterial = new Material()
          buttonMaterial.albedoColor = Color3.Red()
          button.addComponent(new SphereShape())
          button.addComponent(buttonMaterial)
          button.setParent(this)

          this.gameInProgress = false

          button.addComponent(
            new OnPointerDown(
              () => {
                if (!this.gameInProgress) { //Then start a new game
                    log('STARTED NEW GAME!')
                    this.gameInProgress = true
                    let millisec = this.getRandomInt(5) * 1000
                    button.addComponent(new utils.Interval(millisec, (): void => {
                        buttonMaterial.albedoColor = Color3.Blue()
                    }))
                } else { //Then win
                    log('YOU WON!')
                    this.gameInProgress = false
                    buttonMaterial.albedoColor = Color3.Red()
                    button.removeComponent(utils.Interval)
                }
              },
              { hoverText: hoverText }
            )
          )
    
      }

      public getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
      }

}