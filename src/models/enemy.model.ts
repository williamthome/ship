import { outOfBounds } from '../helpers'
import { Particle } from '.'
import type { HSL } from '../types'

export class Enemy {
  private _particles: Particle[]
  private _exploding: boolean
  private _exploded: boolean

  public readonly initialRadius: number

  constructor(
    public id: number,
    public x: number,
    public y: number,
    public radius: number,
    public minRadius: number,
    public speed: number,
    public color: HSL,
    public directionAngle: () => number,
    public damage: number
  ) {
    this._particles = []
    this._exploding = false
    this._exploded = false

    this.initialRadius = radius
  }

  get life(): number {
    return this.radius
  }

  get alive(): boolean {
    return this.radius > this.minRadius
  }

  get exploding(): boolean {
    return this._exploding
  }

  get exploded(): boolean {
    return this._exploded
  }

  hurt = (amount: number): void => {
    this.radius -= amount
  }

  outOfBoard = (boardWidth: number, boardHeight: number): boolean =>
    outOfBounds(this.x, this.y, this.radius, this.radius, boardWidth, boardHeight)

  update = (context: CanvasRenderingContext2D): void => {
    if (this.alive) {
      this.draw(context)
      this.move()
    } else if (!this._exploded) {
      !this._exploding && this.explode()
      this.updateParticles(context)
      if (this._particles.length === 0) this._exploded = true
    }
  }

  private draw = (context: CanvasRenderingContext2D): void => {
    const { h, s, l } = this.color

    context.save()
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
    context.fillStyle = `hsl(${h}, ${s}%, ${l}%)`
    context.fill()
    context.restore()
  }

  private move = (): void => {
    this.x += Math.cos(this.directionAngle()) * this.speed
    this.y += Math.sin(this.directionAngle()) * this.speed
  }

  private explode = (): void => {
    for (let i = 0; i <= 20; i++) {
      this._particles.push(
        new Particle(
          i,
          this.x,
          this.y,
          Math.random() * 5, // radius
          Math.random() * 20, // speed
          this.color, // color
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
