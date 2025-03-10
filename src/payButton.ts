import * as crypto from '@dcl/crypto-scene-utils'

export const screenSpaceUI = new UICanvas()
screenSpaceUI.visible = true

const imageTexture = new Texture('images/Pay_UI.png')
const scale = 0.55

const paid_button_Model = new GLTFShape('models/PaidButton/MANA_Button.glb')
const base_Model = new GLTFShape('models/PaidButton/Base.glb')

const clickSound = new AudioClip('sounds/click.mp3')

export class PayButton extends Entity {
    //Properties
    animation: AnimationState
    address: string
    paymentAmount: number
    background: UIImage
    donationInput: UIInputText
    action: () => void
    //Constructor(Parameters){Implementation}
    constructor(
        pos: TranformConstructorArgs,
        address: string,
        paymentAmount: number,
        hoverText: string,
        action: () => void
      ) {
        super()
        engine.addEntity(this)
    
        this.addComponent(base_Model)
        this.addComponent(new Transform(pos))
    
        const button = new Entity()
        button.addComponent(paid_button_Model)
        button.setParent(this)
    
        button.addComponent(new Animator())
    
        this.animation = new AnimationState('Button_Action', { looping: false })
        button.getComponent(Animator).addClip(this.animation)
    
        this.addComponent(new AudioSource(clickSound))
    
        this.address = address
        this.paymentAmount = paymentAmount
        this.action = action
    
        button.addComponent(
          new OnPointerDown(
            () => {
              this.openUI()
            },
            { hoverText: hoverText }
          )
        )
    
        const background = new UIImage(screenSpaceUI, imageTexture)
    
        background.name = 'background'
        background.width = 1024 * scale
        background.height = 448 * scale
        background.hAlign = 'center'
        background.vAlign = 'center'
        background.positionY = 0
        background.sourceLeft = 0
        background.sourceTop = 0
        background.sourceWidth = 1024
        background.sourceHeight = 429
        background.visible = false
        background.isPointerBlocker = false
    
        this.background = background
    
        const currentPayment = new UIText(background)
        currentPayment.value = this.paymentAmount.toString() + ' MANA'
        currentPayment.name = 'currentPayment'
        currentPayment.width = 200 * scale
        currentPayment.height = 100 * scale
        currentPayment.hAlign = 'center'
        currentPayment.vAlign = 'center'
        currentPayment.positionY = 18
        currentPayment.positionX = -37 * scale
        currentPayment.fontSize = 35 * scale
        currentPayment.vTextAlign = 'center'
        currentPayment.hTextAlign = 'center'
        currentPayment.color = Color4.FromHexString('#FF0050FF')
    
        const AcceptButton = new UIImage(background, imageTexture)
        AcceptButton.name = 'AcceptButton'
        AcceptButton.width = 460 * scale
        AcceptButton.height = 80 * scale
        AcceptButton.hAlign = 'center'
        AcceptButton.vAlign = 'center'
        AcceptButton.positionY = -60
        AcceptButton.positionX = -130
        AcceptButton.sourceLeft = 475
        AcceptButton.sourceTop = 425
        AcceptButton.sourceWidth = 460
        AcceptButton.sourceHeight = 74
        AcceptButton.isPointerBlocker = true
        AcceptButton.onClick = new OnClick(() => {
          this.closeUI()
          this.payFee()
        })
    
        const CancelButton = new UIImage(background, imageTexture)
        CancelButton.name = 'AcceptButton'
        CancelButton.width = 460 * scale
        CancelButton.height = 80 * scale
        CancelButton.hAlign = 'center'
        CancelButton.vAlign = 'center'
        CancelButton.positionY = -60
        CancelButton.positionX = 130
        CancelButton.sourceLeft = 0
        CancelButton.sourceTop = 425
        CancelButton.sourceWidth = 460
        CancelButton.sourceHeight = 74
        CancelButton.isPointerBlocker = true
        CancelButton.onClick = new OnClick(() => {
          this.closeUI()
        })
      }

      public openUI(): void {
        this.background.visible = true
        this.background.isPointerBlocker = true
      }
      public closeUI(): void {
        this.background.visible = false
        this.background.isPointerBlocker = false
      }
    
      public payFee(): void {
        log('PAYING FEE', this.paymentAmount)
        log('Serhanin manasi ',crypto.mana.balance(this.address))
    
        crypto.mana.send(this.address, this.paymentAmount, true).then(
          () => {
            this.action()
            this.getComponent(AudioSource).playOnce()
            this.animation.stop()
            this.animation.play()
            log('PAID', this.paymentAmount)
          },
          (error) => {
            log(error)
          }
        )
      }
}

