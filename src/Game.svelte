<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Background, Enemy, Player } from './models'
  import { factory } from './helpers'

  let canvas: HTMLCanvasElement | undefined
  let animateId: number | undefined
  let background: Background | undefined
  let player: Player | undefined
  let enemies: Enemy[] | undefined
  let score: number | undefined
  let gameOver: boolean
  let enemyDelay = 100
  let shotDelay = 5
  let timer = 0

  const fps = {
    value: 1,
    times: Array<number>(),
    update: (): void => {
      const now = performance.now()
      while (fps.times.length > 0 && fps.times[0] <= now - 1000) {
        fps.times.shift()
      }
      fps.times.push(now)
      fps.value = fps.times.length
    },
  }

  const everyinterval = (n: number): boolean => (timer / n) % 1 === 0

  const animate = (): void => {
    animateId = requestAnimationFrame(animate)

    fps.update()

    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    if (background) {
      if (gameOver) {
        background.led.color.h + 1 >= 360
          ? (background.led.color.h = 0)
          : (background.led.color.h += 1)
      }
      background.update(context, player)
    }

    // Enemies and Projectiles collision
    if (enemies && player && player.alive) {
      for (const projectile of player.projectiles) {
        for (const enemy of enemies) {
          if (!projectile.shotted(enemy)) continue
          enemy.hurt(projectile.damage)
          score ||= 0
          score += enemy.life
        }
      }
    }

    if (enemies) {
      everyinterval(enemyDelay) && enemies.push(factory.newEnemy(player))

      enemies = enemies.filter((e) => !e.exploded && !e.outOfBoard(innerWidth, innerHeight))
      for (const enemy of enemies) {
        if (background && enemy.exploding) background.led.color.h = enemy.color.h
        enemy.update(context)

        if (!enemy.alive || !player?.alive) continue

        const playerAndEnemyDist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        const playerAndEnemyCollided = playerAndEnemyDist - player.width - enemy.radius <= 0

        playerAndEnemyCollided && player.hurt(enemy.damage)
      }
    }

    if (player) {
      const { ArrowUp, ArrowLeft, ArrowRight, ' ': Spacebar } = keysPressed
      ArrowUp ? player.accelerate() : player.stop()
      ArrowLeft && player.rotateLeft()
      ArrowRight && player.rotateRight()
      Spacebar && everyinterval(shotDelay) && player.shot(factory.newProjectile(player))
      player.update(context)

      // Life text
      context.fillStyle = 'white'
      context.font = '20px arial'
      context.fillText(`Life: ${player.life}`, 10, 25)
    }

    // Score text
    const scoreText = `Score: ${score?.toFixed(0) ?? 0}`
    context.fillStyle = 'white'
    context.font = '20px arial'
    context.fillText(scoreText, innerWidth - context.measureText(scoreText).width - 10, 25)

    // FPS text
    context.fillStyle = 'green'
    context.font = '14px arial'
    context.fillText(`FPS: ${fps.value}`, 10, 50)

    // Game over
    if (player?.exploded) showGameOver()

    timer++
  }

  const init = (): void => {
    animateId && cancelAnimationFrame(animateId)
    updateCanvasSize()
    background = factory.newBackground()
    player = factory.newPlayer()
    enemies = []
    score = 0
    gameOver = false
    animate()
    addListeners()
  }

  const showGameOver = (): void => {
    removeListeners()
    gameOver = true
  }

  onMount(() => init())

  onDestroy(() => removeListeners())

  const addListeners = (): void => {
    addEventListener('keydown', keyboardEvent)
    addEventListener('keyup', keyboardEvent)
    addEventListener('resize', onWindowResize)
  }

  const removeListeners = (): void => {
    removeEventListener('keydown', keyboardEvent)
    removeEventListener('keyup', keyboardEvent)
    removeEventListener('resize', onWindowResize)
  }

  let keysPressed = {
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false,
  }

  const isMovementKey = (obj: unknown): obj is keyof typeof keysPressed =>
    typeof obj === 'string' && obj in keysPressed

  const keyboardEvent = (e: KeyboardEvent): void => {
    const key = e.key
    if (isMovementKey(key)) {
      e.preventDefault()
      keysPressed[key] = e.type === 'keydown'
    }
  }

  const onWindowResize = (): void => {
    updateCanvasSize()
    animate()
  }

  const updateCanvasSize = (): void => {
    if (!canvas) return

    canvas.width = innerWidth
    canvas.height = innerHeight
  }
</script>

<canvas class:running="{!gameOver}" bind:this="{canvas}"
  >Your browser does not support the HTML5 canvas tag.</canvas
>
{#if gameOver}
  <div class="game-over">
    <div class="game-over__score">
      <div class="game-over__score--value">{score?.toFixed(0) ?? 0}</div>
      <div class="game-over__score--label">points</div>
    </div>
    <button autofocus class="game-over__button" on:click="{init}">Restart</button>
  </div>
{/if}

<style lang="scss">
  .running {
    cursor: none;
  }

  .game-over {
    position: fixed;
    top: 50%;
    left: 50%;
    background-color: white;
    border-radius: 1rem;
    padding: 1rem;
    transform: translate(-50%, -50%);
    text-align: center;

    &__score {
      &--value {
        font-size: 2rem;
        font-weight: bold;
      }
    }

    & button {
      margin: 0;
      margin-top: 1rem;
      padding: 0.5rem 8rem;
      border-radius: 0.5rem;
      background-color: dodgerblue;
      color: white;

      &:hover {
        cursor: pointer;
      }
    }
  }
</style>
