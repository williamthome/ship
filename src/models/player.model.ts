import { Projectile, Particle } from '.'
import type { HSL } from '../types'

export class Player {
  private _speed: number
  private _moving: boolean
  private _particles: Particle[]
  private _exploding: boolean
  private _exploded: boolean

  public life: number
  public angle: number
  public projectiles: Projectile[]

  constructor(
    public id: number,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public color: HSL,
    public maxSpeed: number,
    public rotateSpeed: number,
    public friction: number,
    public acceleration: number
  ) {
    this._speed = 0
    this._moving = false
    this._particles = []
    this._exploding = false
    this._exploded = false

    this.life = 100
    this.angle = 0
    this.projectiles = []
  }

  get alive(): boolean {
    return this.life > 0
  }

  get exploding(): boolean {
    return this._exploding
  }

  get exploded(): boolean {
    return this._exploded
  }

  accelerate = (): void => {
    this._moving = true
  }

  stop = (): void => {
    this._moving = false
  }

  rotateLeft = (): void => {
    this.angle = this.angle - this.rotateSpeed < 0 ? 360 : this.angle - this.rotateSpeed
  }

  rotateRight = (): void => {
    this.angle = this.angle + +this.rotateSpeed > 360 ? 0 : this.angle + this.rotateSpeed
  }

  shot = (projectile: Projectile): void => {
    this.projectiles.push(projectile)
  }

  hurt = (amount: number): void => {
    this.life -= amount
  }

  update = (context: CanvasRenderingContext2D): void => {
    if (this.alive) {
      this.updateProjectiles(context)
      this.checkSpeed()
      this.checkPosition(context)
      this.draw(context)
    } else if (!this._exploded) {
      this.life = 0
      !this._exploding && this.explode()
      this.updateParticles(context)
      if (this._particles.length === 0) this._exploded = true
    }
  }

  private checkSpeed = (): void => {
    if (this._moving) {
      this._speed += this.acceleration
      if (this._speed > this.maxSpeed) this._speed = this.maxSpeed
    } else if (this._speed > 0) {
      this._speed -= this.friction
      if (this._speed < 0) this._speed = 0
    }

    this._speed > 0 && this.move()
  }

  private move = (): void => {
    const cos = Math.cos((this.angle * Math.PI) / 180)
    const sin = Math.sin((this.angle * Math.PI) / 180)

    const velocity = {
      x: cos * this._speed,
      y: sin * this._speed,
    }

    this.x += velocity.x
    this.y += velocity.y
  }

  private checkPosition = (context: CanvasRenderingContext2D): void => {
    const { width: boardWidth, height: boardHeight } = context.canvas
    this.x = (this.x + boardWidth * 2) % boardWidth
    this.y = (this.y + boardHeight * 2) % boardHeight
  }

  private draw = (context: CanvasRenderingContext2D): void => {
    const { h, s, l } = this.color

    context.save()
    context.translate(this.x, this.y)
    context.rotate((Math.PI / 180) * this.angle)
    context.beginPath()
    context.moveTo(this.width / 2, 0)
    context.lineTo(-this.width / 2, this.height / 2)
    context.lineTo(-this.width / 4, 0)
    context.lineTo(-this.width / 2, -this.height / 2)
    context.closePath()
    context.fillStyle = `hsl(${h}, ${s}%, ${l}%)`
    context.fill()
    context.restore()
  }

  private updateProjectiles = (context: CanvasRenderingContext2D): void => {
    const { width: boardWidth, height: boardHeight } = context.canvas
    this.projectiles = this.projectiles.filter((p) => !p.outOfBoard(boardWidth, boardHeight))
    for (const projectile of this.projectiles) {
      projectile.update(context)
    }
  }

  private explode = (): void => {
    for (let i = 0; i <= 100; i++) {
      this._particles.push(
        new Particle(
          i,
          this.x,
          this.y,
          Math.random() * 5, // radius
          Math.random() * 20, // speed
          { h: 0, s: 50, l: 50 }, // color
          Math.random() * 360, // direction
          0.97 // fricton
        )
      )
    }
    this._exploding = true
  }

  private updateParticles = (context: CanvasRenderingContext2D): void => {
    this._particles = this._particles.filter((particle) => !particle.stopped)
    for (const particle of this._particles) {
      particle.update(context)
    }
  }
}
