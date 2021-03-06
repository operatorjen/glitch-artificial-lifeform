let pressure = document.querySelector('#pressure input')
let cells = document.querySelector('#cells input')
let bacteria = document.querySelector('#bacteria input')
let virus = document.querySelector('#virus input')
const health = document.querySelector('#health span')
const ttl = document.querySelector('#time span')
let canvasPressure = document.querySelector('#pressure-cv')
let ctxPressure = canvasPressure.getContext('2d')
let final = document.querySelector('#final')
let btn = document.querySelector('#rebirth')
let btnReset = document.querySelector('#reset')
const rebirths = document.querySelector('#rebirths span')
let deathBy = document.querySelector('#death-by')
let sideEffectBy = document.querySelector('#side-effect-by')

let pressureVal = 0.6
let cellsVal = 0.9
let bacteriaVal = 0.0001
let virusVal = 0.0001
let healthVal = 100
let ttlVal = 0

pressure.value = pressureVal
cells.value = cellsVal
bacteria.value = bacteriaVal
virus.value = virusVal

const PRESSURE_MIN = 0.3
const PRESSURE_MAX = 0.99
const CELL_MIN = 0.2
const CELL_MAX = 0.999
const BACTERIA_LOW = 0.02
const BACTERIA_HIGH = 0.6
const VIRUS_LOW = 0.002
const VIRUS_HIGH = 0.5

const GRAVITY_X = 0.0
const GRAVITY_Y = 0.0
const GROUPS = [50, 50, 50]
let metaCtx
let interactorHealth = 1.0
let interactorInput = 0.0
let interactorOutput = 0.0
let pressureSpeed = 0.5
let pressureViscosity = 0.5
const MAX_INTERACTOR_INPUT = 0.09
const MAX_INTERACTOR_OUTPUT = 1.05
let canvas = canvasPressure
let alive = true
let complete = false

const SKILLS = {
  0: [1, 5, 8, 12], // speaking
  1: [0, 2, 6, 7, 9, 10], // moving
  2: [1, 4, 5, 11], // thinking
  3: [3, 4] // resting
}

const OPPORTUNITIES = {
  0: 'running',
  1: 'teaching',
  2: 'swimming',
  3: 'sleeping',
  4: 'meditating',
  5: 'writing',
  6: 'hiking',
  7: 'stretching',
  8: 'interpreting',
  9: 'climbing',
  10: 'fighting',
  11: 'reading',
  12: 'screaming'
}

const SIDE_EFFECTS = {
  0: 'injured',
  1: 'ill',
  2: 'tired',
  3: 'moody',
  4: 'relieved',
  5: 'relaxed',
  6: 'neutral',
  7: 'energetic'
}

let experiences = []

function setStatus () {
  const sideEffect = Math.floor(Math.random() * Object.keys(SIDE_EFFECTS).length)
  const skill = Math.floor(Math.random() * Object.keys(SKILLS).length)
  const status = OPPORTUNITIES[SKILLS[skill][Math.floor(Math.random() * SKILLS[skill].length)]]
  experiences.push([status, SIDE_EFFECTS[sideEffect]])

  if (sideEffect < 3) {
    cellsVal -= 0.000002
  } else if (sideEffect > 3) {
    cellsVal += 0.0000025
  }
  
  if (sideEffect === 1) {
    virusVal += 0.0001
    bacteriaVal += 0.0001
  }
}

let textures = {}
let started = false

const fluid = function () {
  let width, height, numX, numY, particles,
      grid, numParticles

  let threshold = 10
  const spacing = canvas.width / canvas.height * 10
  const radius = canvas.width / canvas.height * 20
  const limit = radius
  
  const setHealth = function (cellsVal) {
    for (let i = 0; i < GROUPS.length; i++) {
      let color = `hsla(${Math.round(virusVal / bacteriaVal * 35) + 40}, 13%, 35%`;
      let color2 = `hsla(${Math.round(cellsVal * 10) + 11}, 83%, 20%`;

      if (ttlVal > 500 && ttlVal <= 1000) {
        color2 = `hsla(${Math.round(virusVal / bacteriaVal / ttlVal * 45) + 160}, 73%, 45%`;
      } else if (ttlVal > 1000 && ttlVal <= 1500) {
        color2 = `hsla(${Math.round(cellsVal * 15) + 30}, 63%, 45%`;
      } else if (ttlVal > 1500 && ttlVal <= 2000) {
        color = `hsla(${Math.round(virusVal / bacteriaVal * 205) + 70}, 63%, 45%`;
        color2 = `hsla(${Math.round(cellsVal * 20) + 240}, 60%, 85%`;
      } else if (ttlVal > 2000 && ttlVal <= 2500) {
        color = `hsla(${Math.round(virusVal / bacteriaVal * 115)}, 33%, 45%`;
        color2 = `hsla(${Math.round(cellsVal * 210) + 51}, 83%, 35%`;
      } else if (ttlVal > 2500 && ttlVal <= 3000) {
        color = `hsla(${Math.round(virusVal / bacteriaVal * 185) + 10}, 53%, 65%`;
        color2 = `hsla(${Math.round(cellsVal * 215) + 110}, 63%, 45%`;
      } else if (ttlVal > 3000 && ttlVal <= 3500) {
        color = `hsla(${Math.round(virusVal / bacteriaVal * 115) + 10}, 93%, 45%`;
        color2 = `hsla(${Math.round(cellsVal * 210) + 51}, 83%, 70%`;
      } else if (ttlVal > 3500 && ttlVal <= 4000) {
        color = `hsla(${Math.round(virusVal / bacteriaVal * 315) + 10}, 83%, 55%`;
        color2 = `hsla(${Math.round(cellsVal * 221) + 211}, 93%, 20%`;
      } else if (ttlVal > 4000 && ttlVal <= 4500) {
        color = `hsla(${Math.round(virusVal / bacteriaVal * 35) + 110}, 13%, 5%`;
        color2 = `hsla(${Math.round(cellsVal * 130) + 70}, 73%, 50%`;
      } else if (ttlVal > 4500) {
        color = `hsla(${Math.round(virusVal / bacteriaVal * 15) + 110}, 33%, 45%`;
        color2 = `hsla(${Math.round(cellsVal * 100) + 110}, 73%, 80%`;
      }

      if (!started || !textures[i]) {
        textures[i] = document.createElement('canvas')
        textures[i].width = textures[i].height = cellsVal * Math.random() * 500 + 200
        started = true
      }
      
      if (textures[i]) {
        const nctx = textures[i].getContext('2d')
        nctx.clearRect(0, 0, width, height)
        const grad = nctx.createRadialGradient(
          radius, radius, 0.8,
          radius, radius, radius)
        grad.addColorStop(0, color2 + ', 1)')
        grad.addColorStop(0.9, color + ', 0.05)')
        nctx.fillStyle = grad
        nctx.beginPath()
        nctx.arc(radius, radius, radius, 0, Math.PI * 2, true)
        nctx.closePath()
        nctx.fill()
      }
    }
  }

  const run = function () {
    pressureVal = Math.sin(pressureVal * (cellsVal / pressureVal))
    let cellsRandom = Math.random() * cellsVal
    cellsVal = Math.cos((pressureVal - (bacteriaVal * virusVal)) * cellsVal)

    const bacteriaRandom = Math.random()

    if (bacteriaRandom > BACTERIA_LOW && bacteriaRandom < BACTERIA_HIGH) {
      bacteriaVal = Math.sin(bacteriaVal + (cellsVal / (bacteriaRandom * 2500)))
      cellsVal -= bacteriaVal * cellsVal
    } else if (bacteriaRandom >= BACTERIA_HIGH)  {
      bacteriaVal = Math.sin(bacteriaVal + (cellsVal / (bacteriaRandom * 1000)))
      cellsVal -= bacteriaVal * cellsVal

      if (virusVal >= VIRUS_HIGH) {
        cellsVal -= virusVal * cellsVal
      }
    }

    const virusRandom = Math.random()
    if (bacteriaRandom >= BACTERIA_HIGH) {
      virusVal = Math.sin(virusVal + (bacteriaVal * (virusRandom * 1000)))
      healthVal --
    } else if (bacteriaRandom > BACTERIA_LOW) {
      virusVal = Math.sin(virusVal - (bacteriaVal * (virusRandom * 1000)))
    } else {
      virusVal = Math.sin(virusVal + (bacteriaVal * (virusRandom * 1000)))
    }

    if (pressureVal < 0.0 || isNaN(pressureVal)) {
      pressure.classList.add('critical')
      pressureVal = 0.0
      alive = false
    }

    if (cellsVal < 0.000001 || isNaN(cellsVal)) {
      cells.classList.add('critical')
      cellsVal = 0.0
      alive = false
    }

    if (bacteriaVal < 0.000001 || isNaN(bacteriaVal)) {
      bacteriaVal = 0.000001
    }

    if (virusVal < 0.000001 || isNaN(virusVal)) {
      virusVal = 0.000001
    }

    pressure.value = pressureVal.toFixed(7)
    cells.value = cellsVal.toFixed(7)
    bacteria.value = bacteriaVal.toFixed(7)
    virus.value = virusVal.toFixed(7)

    if ((pressureVal < PRESSURE_MIN || pressureVal >= PRESSURE_MAX) &&
        (bacteriaVal >= BACTERIA_HIGH || virusVal >= VIRUS_LOW)) {
      if (cellsVal < CELL_MIN) {
        cells.classList.add('critical')
        healthVal = healthVal - (pressureVal / 100 / cellsVal)
      } else {
        cells.classList.remove('critical')
      }

      if (pressureVal >= PRESSURE_MAX) {
        pressure.classList.add('critical')
        healthVal = healthVal - (pressureVal / 500 / cellsVal)
      }

      if (virusVal >= VIRUS_HIGH) {
        virus.classList.add('critical')
        healthVal = healthVal - (pressureVal / 100 / virusVal)
      }

      if (pressureVal < 0.0001) {
        pressure.classList.add('critical')
        healthVal = 0
        alive = false
      }
    }

    if (virusVal < VIRUS_HIGH) {
      virus.classList.remove('critical')
    } else {
      virus.classList.add('critical')
    }

    if (bacteriaVal < BACTERIA_HIGH) {
      bacteria.classList.remove('critical')
    } else {
      bacteria.classList.add('critical')
    }

    if ((pressureVal >= PRESSURE_MIN && pressureVal < PRESSURE_MAX) &&
        (cellsVal > CELL_MIN && cellsVal < CELL_MAX)) {
      pressure.classList.remove('critical')
      cells.classList.remove('critical')
      healthVal = healthVal + ((pressureVal * cellsVal) / (bacteriaVal / virusVal))
    }

    if (cellsVal < CELL_MIN) {
      cells.classList.add('critical')
      healthVal = 0.0
    }

    if (healthVal >= 1 && alive) {
      if (ttlVal % 10 === 0) {
        setStatus()
      }
    }

    // particle animation start

    //metaCtx.clearRect(0, 0, width, height)
 
    for (let i = 0, l = numX * numY; i < l; i++) {
      grid[i].length = 0
    }

    let i = numParticles

    while (i--) {
      particles[i].first_process()
    }

    i = numParticles

    while (i--) {
      particles[i].second_process()
    }

    i = numParticles

    while (i--) {
      particles[i].first_process()
    }
    
    //threshold = pressureVal * 100 * virusVal / bacteriaVal * 100

    const imageData = metaCtx.getImageData(0, 0, width, height)

    for (let i = 0, n = imageData.data.length; i < n; i += 2) {
      (imageData.data[i + 2] < threshold) && (imageData.data[i + 1] /= 2)
    }

    ctxPressure.putImageData(imageData, 0, 0)
    
    setHealth(cellsVal, bacteriaVal, virusVal)

    if (!alive && !complete) {
      health.textContent = 'no'
      ttl.textContent = ttlVal
      btn.disabled = ''

      let avgs = JSON.parse(localStorage.getItem('levvvels-avg-arr')) || []
      avgs.push(ttlVal)
      const total = avgs.reduce((a, b) => a + b, 0)
      localStorage.setItem('levvvels-avg-curr', total / avgs.length)
      localStorage.setItem('levvvels-avg-arr', JSON.stringify(avgs))
      localStorage.setItem('levvvels-experiences', JSON.stringify(experiences))
      final.querySelector('.ttl span').textContent = ttlVal
      final.querySelector('.lifespan span').textContent = (total / avgs.length).toFixed(2)
      final.querySelector('.rebirths span').textContent = avgs.length
      final.querySelector('#experiences').innerHTML = experiences.map(e => `<p>${e[0]} <em>${e[1]}</em></p>`)
      final.classList.remove('hidden')
      deathBy.textContent = experiences[experiences.length - 1][0]
      sideEffectBy.textContent = experiences[experiences.length - 1][1]
      complete = true
     // metaCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)
     // btn.click()
    } else {
      ttl.textContent = ttlVal
      ttlVal++
      requestAnimationFrame(run)
    }
  };

  const Particle = function (type, x, y) {
    this.type = type
    this.x = x
    this.y = y
    this.px = x
    this.py = y
    this.vx = 0
    this.vy = 0
  };

  Particle.prototype.first_process = function () {
    const g = grid[Math.round(this.y / spacing) * numX + Math.round(this.x / spacing)]
    if (g) {
      g.close[g.length++] = this
    }

    this.vx = this.x - this.px
    this.vy = this.y - this.py

    const distX = this.x - Math.random() * width
    const distY = this.y - Math.random() * height
    const dist = Math.sqrt(distX * distX + distY * distY)

    if (dist < radius) {
        const cos = distX / dist
        const sin = distY / dist

        this.vx += -cos
        this.vy += -sin
    }

    this.vx += GRAVITY_X
    this.vy += GRAVITY_Y
    this.px = this.x
    this.py = this.y
    this.x += this.vx
    this.y += this.vy
  };

  Particle.prototype.second_process = function () {
    let forceA = 0
    let forceB = 0
    let cellX = Math.round(this.x / spacing)
    let cellY = Math.round(this.y / spacing)
    let close = []

    for (let xOff = -1; xOff < 2; xOff++) {
      for (let yOff = -1; yOff < 2; yOff++) {
        const cell = grid[(cellY + yOff) * numX + (cellX + xOff)]

        if (cell && cell.length) {
          for (let a = 0; a < cell.length; a++) {
            let particle = cell.close[a]

            if (particle !== this) {
              const dfx = particle.x - this.x
              const dfy = particle.y - this.y
              const distance = Math.sqrt(dfx * dfx + dfy * dfy)

              if (distance < spacing) {
                const m = 1 - (distance / spacing)
                forceA += Math.pow(m, 2)
                forceB += Math.pow(m, 3) / 2
                particle.m = m
                particle.dfx = (dfx / distance) * m
                particle.dfy = (dfy / distance) * m
                close.push(particle)
              }
            }
          }
        }
      }
    }

    forceA = (forceA - 2) * 0.99

    for (let i = 0; i < close.length; i++) {
      const neighbor = close[i]
      let press = forceA + forceB * neighbor.m

      if (this.type !== neighbor.type) {
        press *= 0.96 * pressureVal
      }

      const dx = neighbor.dfx * press
      const dy = neighbor.dfy * press

      neighbor.x += dx
      neighbor.y += dy
      this.x -= dx
      this.y -= dy
    }

    if (this.x < limit) {
      this.x = limit
    } else if (this.x > width - limit) {
      this.x = width - limit
    }

    if (this.y < limit) {
      this.y = limit
    } else if (this.y > height - limit) {
      this.y = height - limit
    }

    this.draw()
  };

  Particle.prototype.draw = function () {
    const size = radius * 10

    metaCtx.drawImage(
      textures[this.type],
      this.x - radius,
      this.y - radius,
      size, size)
  }

  return {
    init: function () {
      particles = []
      grid = []
      close = []

      canvas.height = height = window.innerHeight / 2;
      canvas.width = width = window.innerWidth / 2;

      const metaCanvas = document.createElement('canvas')
      metaCanvas.width = width
      metaCanvas.height = height
      metaCtx = metaCanvas.getContext('2d')
      setHealth(cellsVal, bacteriaVal, virusVal)

      numX = Math.round(width / spacing)
      numY = Math.round(height / spacing)

      for (let i = 0; i < numX * numY; i++) {
        grid[i] = {
          length: 0,
          close: []
        }
      }

      for (let i = 0; i < GROUPS.length; i++) {
        for (let k = 0; k < GROUPS[i]; k++) {
          particles.push(
            new Particle(
              i,
              Math.random() * window.innerWidth,
              Math.random() * window.innerHeight))
        }
      }

      numParticles = particles.length
      run()
    }
  }
}()

fluid.init()

btn.onclick = function () {
  document.location.reload()
}

btnReset.onclick = function () {
  localStorage.clear()
  btn.click()
}

window.onresize = function () {
  metaCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  ctxPressure = canvas.getContext('2d')
}