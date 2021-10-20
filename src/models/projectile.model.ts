import { outOfBounds } from '../helpers'
import type { HSL } from '../types'
import type { Enemy } from './enemy.model'

export class Projectile {
  constructor(
    public id: number,
    public x: number,
    public y: number,
    public radius: number,
    public speed: number,
    public color: HSL,
    public directionAngle: number,
    public damage: number
  ) {}

  update = (context: CanvasRenderingContext2D): void => {
    this.draw(context)
    this.move()
  }

  outOfBoard = (boardWidth: number, boardHeight: number): boolean =>
    outOfBounds(this.x, this.y, this.radius, this.radius, boardWidth, boardHeight)

  shotted = (enemy: Enemy): boolean => {
    const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y)
    const collided = dist - this.radius - enemy.radius <= 0
    return collided
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
