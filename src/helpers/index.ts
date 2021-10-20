import { Background, Player, Projectile, Particle, Enemy } from '../models'
import type { HSL, NonFunctionProperties } from '../types'

const createBackground = (background: NonFunctionProperties<Background>): Background => {
  const { color, led } = background
  return new Background(color, led)
}

const createPlayer = (
  player: NonFunctionProperties<
    Omit<Player, 'life' | 'alive' | 'exploding' | 'exploded' | 'angle' | 'projectiles'>
  >
): Player => {
  const { id, x, y, width, height, color, maxSpeed, rotateSpeed, friction, acceleration } = player
  return new Player(id, x, y, width, height, color, maxSpeed, rotateSpeed, friction, acceleration)
}

const createProjectile = (projectile: NonFunctionProperties<Projectile>): Projectile => {
  const { id, x, y, radius, speed, color, directionAngle, damage } = projectile
  return new Projectile(id, x, y, radius, speed, color, directionAngle, damage)
}

const createParticle = (particle: NonFunctionProperties<Omit<Particle, 'stopped'>>): Particle => {
  const { id, x, y, radius, speed, color, directionAngle, friction } = particle
  return new Particle(id, x, y, radius, speed, color, directionAngle, friction)
}

const createEnemy = (
  enemy: NonFunctionProperties<
    Omit<Enemy, 'initialRadius' | 'life' | 'alive' | 'exploding' | 'exploded'>
  > &
    Pick<Enemy, 'directionAngle'>
): Enemy => {
  const { id, x, y, radius, minRadius, color, speed, directionAngle, damage } = enemy
  return new Enemy(id, x, y, radius, minRadius, speed, color, directionAngle, damage)
}

export const factory = {
  uid: 0,
  newBackground: (): Background => {
    const rgb = 0
    return createBackground({
      color: {
        r: rgb,
        g: rgb,
        b: rgb,
        a: 0.2,
      },
      led: {
        color: {
          h: Math.random() * 360,
          s: Math.random() * (80 - 30) + 30,
          l: 10,
        },
        size: 2.5,
        spaceBetween: 30,
      },
    })
  },
  newPlayer: (): Player => {
    return createPlayer({
      id: factory.uid++,
      x: innerWidth / 2,
      y: innerHeight / 2,
      width: 30,
      height: 30,
      color: {
        h: Math.random() * 360,
        s: 50,
        l: 50,
      },
      maxSpeed: 7,
      rotateSpeed: 4,
      friction: 0.05,
      acceleration: 0.3,
    })
  },
  newProjectile: (player: Player): Projectile => {
    return createProjectile({
      id: factory.uid++,
      x: player.x,
      y: player.y,
      directionAngle: player.angle,
      radius: 5,
      speed: player.maxSpeed * 1.2,
      color: player.color,
      damage: 1,
    })
  },
  newParticle: (x: number, y: number, color: HSL): Particle => {
    return createParticle({
      id: factory.uid++,
      x,
      y,
      directionAngle: Math.random() * 5,
      radius: Math.random() * 5,
      color,
      speed: Math.random() * 360,
      friction: 0.99,
    })
  },
  newEnemy: (player?: Player): Enemy => {
    const maxEnemyRadius = 40
    const minEnemyRadius = 20
    const radius = Math.random() * (maxEnemyRadius - minEnemyRadius) + minEnemyRadius

    const minorRandom = Math.random() < 0.5

    const x = minorRandom
      ? Math.random() < 0.5
        ? 0 + radius
        : innerWidth - radius
      : Math.random() * innerWidth

    const y = minorRandom
      ? Math.random() * innerHeight
      : Math.random() < 0.5
      ? 0 + radius
      : innerHeight - radius

    return createEnemy({
      id: factory.uid++,
      x,
      y,
      color: {
        h: Math.random() * 360,
        s: 50,
        l: 50,
      },
      radius,
      minRadius: minEnemyRadius,
      speed: Math.random() * (5 - 1) + 1,
      directionAngle: (): number => (player ? Math.atan2(player.y - y, player.x - x) : 0),
      damage: 1,
    })
  },
}

export const outOfBounds = (
  x: number,
  y: number,
  width: number,
  height: number,
  boardWidth: number,
  boardHeight: number
): boolean => x + width < 0 || x - width > boardWidth || y + height < 0 || y - height > boardHeight
