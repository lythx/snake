const GBSIZE = 20

class gameboard {
    constructor() {
        let gb = document.getElementById('gameboard')
        gb.style.gridTemplateColumns = `repeat(${GBSIZE} , 1fr)`
        gb.style.gridTemplateRows = `repeat(${GBSIZE} , 1fr)`
        for (let i = 0; i < GBSIZE; i++)
            for (let j = 0; j < GBSIZE; j++) {
                let el = document.createElement('div')
                el.style.background = (i + j) % 2 == 0 ? 'var(--lighttile)' : 'var(--darktile)'
                el.classList.add(`row${i}`)
                el.classList.add(`col${j}`)
                gb.appendChild(el)
            }
    }
}

class game {
    dir = 'N'
    lastdir
    gamespeed = 10
    render
    snake = [
        { x: 10, y: 9 },
        { x: 10, y: 10 },
        { x: 10, y: 11 }
    ]
    gaming = true
    constructor() {
        this.createFood()
        this.draw()
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    if (this.lastdir != 'S')
                        this.dir = 'N'
                    break
                case 'ArrowRight':
                    if (this.lastdir != 'W')
                        this.dir = 'E'
                    break
                case 'ArrowDown':
                    if (this.lastdir != 'N')
                        this.dir = 'S'
                    break
                case 'ArrowLeft':
                    if (this.lastdir != 'E')
                        this.dir = 'W'
                    break
                default: return
            }
            this.render = Date.now()
            window.requestAnimationFrame(() => this.loop())
        })

    }
    loop() {
        if (!this.gaming)
            return
        window.requestAnimationFrame(() => this.loop())
        let newRender = Date.now()
        const interval = (newRender - this.render) / 1000
        if (interval < 1 / this.gamespeed) return
        this.render = newRender
        this.lastdir = this.dir
        this.update()
        if (!this.gaming)
            return
        this.draw()
    }
    update() {
        let ate = false
        let prev = { x: this.snake[0].x, y: this.snake[0].y }
        //snake head move
        switch (this.dir) {
            case 'N':
                this.snake[0].y--
                break
            case 'E':
                this.snake[0].x++
                break
            case 'S':
                this.snake[0].y++
                break
            case 'W':
                this.snake[0].x--
        }
        const entrytile = this.getEl(this.snake[0].x, this.snake[0].y)
        //check if hit border
        if (this.snake[0].x < 0 || this.snake[0].y < 0 || this.snake[0].x >= GBSIZE || this.snake[0].y >= GBSIZE)
            this.lose()
        else if (entrytile.children.length != 0) {
            //check if ate food
            if (entrytile.children[0].classList.contains('food')) {
                document.querySelector('.food').remove()
                this.createFood()
                ate = true
            }
            //check if hit itself
            else if (entrytile.children[0].classList.contains('snake'))
                this.lose()
        }
        //snake body move excluding head
        for (let i = 1; i < this.snake.length; i++) {
            let temp = { x: this.snake[i].x, y: this.snake[i].y }
            this.snake[i] = { x: prev.x, y: prev.y }
            prev = { x: temp.x, y: temp.y }
        }
        //make snake larger if ate
        if (ate)
            this.snake.push({ x: prev.x, y: prev.y })
    }
    draw() {
        let els = document.querySelectorAll('.snake')
        for (const e of els)
            e.remove()
        for (const [i, e] of this.snake.entries()) {
            let el = document.createElement('div')
            if (i == 0)
                el.id = 'snakehead'
            el.classList.add('snake')
            this.getEl(e.x, e.y).appendChild(el)
        }
    }
    getEl(x, y) {
        let els = document.querySelectorAll(`.col${x}`)
        for (const e of els)
            if (e.classList.contains(`row${y}`))
                return e
    }
    createFood() {
        const x = Math.floor(Math.random() * GBSIZE)
        const y = Math.floor(Math.random() * GBSIZE)
        let tile = this.getEl(x, y)
        if (tile.children.length == 0) {
            let el = document.createElement('div')
            el.classList.add('food')
            tile.appendChild(el)
        }
        else
            this.createFood()
    }
    lose() {
        this.gaming = false
        alert(`Game over!\nSnake length: ${this.snake.length}`)
        for (const e of document.getElementById('gameboard').children)
            e.innerHTML = ''
        new game()
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new gameboard()
    new game()
})
