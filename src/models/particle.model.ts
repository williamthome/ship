import type { HSL } from '../types'

export class Particle {
  private _alpha: number

  constructor(
    public id: number,
    public x: number,
    public y: number,
    public radius: number,
    public speed: number,
    public color: HSL,
    public directionAngle: number,
    public friction: number
  ) {
    this._alpha = 1
  }

  get stopped(): boolean {
    return this.speed <= 1 || this._alpha <= 0
  }

  update = (context: CanvasRenderingContext2D): void => {
    this.draw(context)
    this.move()
  }

  private draw = (context: CanvasRenderingContext2D): void => {
    const { h, s, l } = this.color

    context.save()
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
    context.fillStyle = `hsl(${h}, ${s}%, ${l}%)`
    context.globalAlpha = this._alpha
    context.fill()
    context.restore()
  }

  private move = (): void => {
    this._alpha -= 0.01
    this.speed *= this.friction

    const cos = Math.cos((this.directionAngle * Math.PI) / 180)
    const sin = Math.sin((this.directionAngle * Math.PI) / 180)

    const velocity = {
      x: cos * this.speed,
      y: sin * this.speed,
    }

    this.x += velocity.x
    this.y += velocity.y
  }
}
