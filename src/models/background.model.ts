import type { HSL, RGBA } from '../types'
import type { Player } from '.'

export class Background {
  constructor(public color: RGBA, public led: { color: HSL; size: number; spaceBetween: number }) {}

  update = (context: CanvasRenderingContext2D, player?: Player): void => {
    this.draw(context)
    this.drawLeds(context, player)
  }

  private draw = (context: CanvasRenderingContext2D): void => {
    const { r, g, b, a } = this.color
    const { width: boardWidth, height: boardHeight } = context.canvas
    context.save()
    context.beginPath()
    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
    context.fillRect(0, 0, boardWidth, boardHeight)
    context.restore()
  }

  private drawLeds = (context: CanvasRenderingContext2D, player?: Player): void => {
    const { width: boardWidth, height: boardHeight } = context.canvas
    const { color, spaceBetween } = this.led
    const xLedCount = boardWidth / spaceBetween
    const yLedCount = boardHeight / spaceBetween

    for (let xIndex = 1; xIndex < xLedCount; xIndex++) {
      for (let yIndex = 1; yIndex < yLedCount; yIndex++) {
        let x = xIndex * spaceBetween
        let y = yIndex * spaceBetween

        let size = this.led.size
        let lightness = color.l

        if (player && player.alive) {
          const dist = Math.hypot(player.x - x, player.y - y)
          const angle = Math.atan2(y - player.y, x - player.x)
          const multiplier = spaceBetween * (spaceBetween / dist)

          // Ignore render
          if (dist < spaceBetween * 2) continue

          // Move away
          if (dist < spaceBetween * 5) {
            x += Math.cos(angle) * multiplier * 6
            y += Math.sin(angle) * multiplier * 6
            lightness += multiplier * 0.5
            size += multiplier * 0.08
          }
        }

        context.save()
        context.beginPath()
        context.arc(x, y, size, 0, 2 * Math.PI)
        context.fillStyle = `hsl(${color.h}, ${color.s}%, ${lightness}%)`
        context.fill()
        context.restore()
      }
    }
  }
}
