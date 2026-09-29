const arena = document.querySelector("#game")
const dino = document.querySelector("#dinosaur")
const obstacle = document.querySelector("#obstacle")
const shadow = document.querySelector("#shadow")
const farHills = document.querySelector("#farHills")
const nearHills = document.querySelector("#nearHills")
const clouds = document.querySelector("#clouds")
const pebbles = document.querySelector("#pebbles")
const track = document.querySelector("#track")
const paceBar = document.querySelector("#paceBar")
const myPoint = document.querySelector("#myPoint")
const bestPoint = document.querySelector("#bestPoint")
const startScreen = document.querySelector("#startScreen")
const startBtn = document.querySelector("#start")
const gameover = document.querySelector("#gameover")
const overCard = document.querySelector("#overCard")
const againBtn = document.querySelector("#again")
const finalScore = document.querySelector("#finalScore")
const finalBest = document.querySelector("#finalBest")
const newBest = document.querySelector("#newBest")
const recordLine = document.querySelector("#recordLine")
const recordValue = document.querySelector("#recordValue")

const BEST_KEY = "dino-rush-best"
const GRAVITY = 2400
const JUMP_V = 1040
const MIN_SPEED = 380
const MAX_SPEED = 880

let best = loadBest()
let running = false
let score = 0
let shownScore = 0
let y = 0
let vy = 0
let speed = MIN_SPEED
let cactusX = 0
let farX = 0
let nearX = 0
let cloudX = 0
let groundX = 0
let spawns = 0
let last = 0
let raf = 0
let idleRaf = 0
let landTimer = 0

bestPoint.textContent = String(best)
if (best > 0) {
    recordLine.hidden = false
    recordValue.textContent = String(best)
}

startBtn.addEventListener("click", startGame)
againBtn.addEventListener("click", startGame)

document.addEventListener("keydown", (event) => {
    if (event.code !== "Space" && event.code !== "ArrowUp") return
    event.preventDefault()
    if (event.repeat) return
    if (!running) startGame()
    else jump()
})

arena.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return
    if (!running) return
    jump()
})

requestAnimationFrame(() => {
    cactusX = arena.clientWidth + 120
    render()
    idleRaf = requestAnimationFrame(idle)
})

function loadBest() {
    try {
        return Number(localStorage.getItem(BEST_KEY)) || 0
    } catch {
        return 0
    }
}

function saveBest(value) {
    try {
        localStorage.setItem(BEST_KEY, String(value))
    } catch {
        /* private mode */
    }
}

function startGame() {
    if (running) return
    cancelAnimationFrame(idleRaf)
    cancelAnimationFrame(raf)

    running = true
    score = 0
    shownScore = 0
    y = 0
    vy = 0
    speed = MIN_SPEED
    spawns = 0
    last = 0
    cactusX = arena.clientWidth + speed * 1.15
    pickKind(true)

    myPoint.textContent = "0"
    paceBar.style.transform = "scaleX(0.08)"
    startScreen.hidden = true
    gameover.hidden = true
    newBest.hidden = true
    arena.classList.remove("shake")
    arena.classList.add("is-live")
    dino.classList.remove("is-down", "is-air", "is-land")
    dino.classList.add("is-running")
    render()
    raf = requestAnimationFrame(loop)
}

function jump() {
    if (!running || y > 1) return
    vy = JUMP_V
    y = 1
    dino.classList.add("is-air")
    dino.classList.remove("is-land")
}

function land() {
    dino.classList.remove("is-air")
    dino.classList.remove("is-land")
    void dino.offsetWidth
    dino.classList.add("is-land")
    clearTimeout(landTimer)
    landTimer = setTimeout(() => dino.classList.remove("is-land"), 150)
}

function pickKind(first) {
    spawns += 1
    const roll = Math.random()
    let kind = "cactus"
    if (first || score < 140) kind = roll < 0.6 ? "cactus" : "rock"
    else if (roll < 0.38) kind = "cactus"
    else if (roll < 0.68) kind = "rock"
    else kind = "tall"
    obstacle.dataset.kind = kind
}

function loop(now) {
    if (!running) return
    if (!last) {
        last = now
        raf = requestAnimationFrame(loop)
        return
    }

    const dt = Math.min(0.032, (now - last) / 1000)
    last = now
    speed = Math.min(MAX_SPEED, MIN_SPEED + score * 0.4)

    vy -= GRAVITY * dt
    y += vy * dt
    if (y <= 0) {
        if (dino.classList.contains("is-air")) land()
        y = 0
        vy = 0
    }

    cactusX -= speed * dt
    if (cactusX < -160) {
        cactusX = arena.clientWidth + speed * (0.82 + Math.random() * 0.42)
        pickKind(false)
    }

    score += dt * (26 + speed * 0.012)
    advanceLayers(dt, speed)
    render()
    paintScore()

    if (cactusX < arena.clientWidth - 8 && collides()) {
        endGame()
        return
    }

    raf = requestAnimationFrame(loop)
}

function idle(now) {
    if (running) return
    if (!last) last = now
    const dt = Math.min(0.032, (now - last) / 1000)
    last = now
    advanceLayers(dt, 70)
    render()
    idleRaf = requestAnimationFrame(idle)
}

function advanceLayers(dt, velocity) {
    const width = arena.clientWidth || 1
    groundX -= velocity * dt
    nearX = shift(nearX, velocity * 0.55 * dt, width)
    farX = shift(farX, velocity * 0.28 * dt, width)
    cloudX = shift(cloudX, velocity * 0.12 * dt, width)
}

function shift(value, amount, width) {
    value -= amount
    if (value <= -width) value += width
    return value
}

function render() {
    const stride = Math.max(0.12, 0.28 - speed / 5000)
    dino.style.setProperty("--stride", `${stride}s`)
    dino.style.transform = `translate3d(0, ${-y}px, 0)`
    obstacle.style.transform = `translate3d(${cactusX}px, 0, 0)`
    farHills.style.transform = `translate3d(${farX}px, 0, 0)`
    nearHills.style.transform = `translate3d(${nearX}px, 0, 0)`
    clouds.style.transform = `translate3d(${cloudX}px, 0, 0)`
    pebbles.style.backgroundPositionX = `${groundX}px`
    track.style.backgroundPositionX = `${groundX}px`

    const lift = Math.min(1, y / 150)
    shadow.style.transform = `scale(${1 - lift * 0.62})`
    shadow.style.opacity = String(0.38 * (1 - lift * 0.7))

    const pace = (speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)
    if (running) paceBar.style.transform = `scaleX(${0.08 + pace * 0.92})`
}

function paintScore() {
    const next = Math.floor(score)
    if (next === shownScore) return
    shownScore = next
    myPoint.textContent = String(next)
    myPoint.classList.remove("pop")
    void myPoint.offsetWidth
    myPoint.classList.add("pop")
    if (next > best) bestPoint.textContent = String(next)
}

function collides() {
    const player = dino.getBoundingClientRect()
    const block = obstacle.getBoundingClientRect()
    const padY = 16
    return player.left + 58 < block.right - 8 &&
        player.right - 12 > block.left + 8 &&
        player.top + padY < block.bottom - 6 &&
        player.bottom - 8 > block.top + padY
}

function endGame() {
    running = false
    cancelAnimationFrame(raf)
    arena.classList.remove("is-live")
    arena.classList.add("shake")
    dino.classList.remove("is-running", "is-air", "is-land")
    dino.classList.add("is-down")

    const final = Math.floor(score)
    const beaten = final > best
    if (beaten) {
        best = final
        saveBest(best)
        recordLine.hidden = false
        recordValue.textContent = String(best)
    }

    finalScore.textContent = String(final)
    finalBest.textContent = String(Math.max(best, final))
    bestPoint.textContent = String(best)
    newBest.hidden = !beaten
    gameover.hidden = false
    overCard.classList.remove("rise")
    void overCard.offsetWidth
    overCard.classList.add("rise")
}
