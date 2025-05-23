const game = document.querySelector('#game')
const dinosaur = document.querySelector('#dinosaur')
const cactus = document.querySelector('#cactus')
const myTry = document.querySelector('#try')
const btn = document.querySelector('#try>#btn')
const _point = document.querySelector('#point')
const myPoint = document.querySelector('#myPoint')
const start = document.getElementById('start')


let point = 0
let flag = false
let check_game

// عملکرد دکمه استارت
start.addEventListener('click', () => {
    start.style.display = 'none'
    _point.style.marginTop = '150px'
    startGame()
})

function jumpD() {
    if (!dinosaur.classList.contains('jump')) {
        dinosaur.classList.add('jump')
        flag = true

        setTimeout(() => {
            dinosaur.classList.remove('jump')
        }, 600);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.keyCode === 32) {
        jumpD()
    }
})

function startGame() {
    // انیمیشن را شروع می‌کنیم (در CSS باید به صورت paused شروع شود اگر خواستی)
    dinosaur.style.animationPlayState = 'running'
    cactus.style.animationPlayState = 'running'
    game.style.animationPlayState = 'running'

    check_game = setInterval(() => {
        let dinosaur_top = parseInt(window.getComputedStyle(dinosaur).getPropertyValue('top'))
        let cactus_left = parseInt(window.getComputedStyle(cactus).getPropertyValue('left'))

        if (cactus_left > 50 && cactus_left < 100 && dinosaur_top > 180) {
            dinosaur.style.animationPlayState = 'paused'
            cactus.style.animationPlayState = 'paused'
            game.style.animationPlayState = 'paused'
            clearInterval(check_game)
            myTry.style.display = 'block'
            btn.addEventListener('click', () => {
                myTry.style.display = 'none'
                window.location.reload()

            })
        }

        if (cactus_left < 10 && flag) {
            point += 10
            flag = false
            myPoint.innerHTML = point
        }
    }, 10)
}