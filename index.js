
let GBSIZE = 20
let SPEED = 12
let GAMING = false

class gameboard {
    constructor() {
        document.getElementById('main').innerHTML = `
        <div id='content'>
            <div id='top'>
                <div id="count">
                    <div id="countimg"></div>
                    <span>0</span>
                </div>
                <div id="settingsbt">
                    <img src="https://img.icons8.com/ios/50/ffffff/settings--v1.png" />
                </div>
            </div>
            <div id="gameboardwrap">
                <div id="gameboard"></div>
            </div>
        </div>`
        let gb = document.getElementById('gameboard')
        gb.style.gridTemplateColumns = `repeat(${GBSIZE} , 1fr)`
        gb.style.gridTemplateRows = `repeat(${GBSIZE} , 1fr)`
        for (let i = 0; i < GBSIZE; i++) {
            for (let j = 0; j < GBSIZE; j++) {
                let el = document.createElement('div')
                el.style.background = (i + j) % 2 == 0 ? 'var(--lighttile)' : 'var(--darktile)'
                el.classList.add(`row${i}`)
                el.classList.add(`col${j}`)
                gb.appendChild(el)
            }
        }
        document.getElementById('settingsbt').addEventListener('click', () => {
            new settings()
        })
    }
}

class game {
    dir = 'N'
    lastdir
    render
    snake
    constructor() {
        this.snake = [
            { x: Math.floor(GBSIZE / 2), y: Math.floor(GBSIZE / 2) - 1 },
            { x: Math.floor(GBSIZE / 2), y: Math.floor(GBSIZE / 2) },
            { x: Math.floor(GBSIZE / 2), y: Math.floor(GBSIZE / 2) + 1 }
        ]
        this.draw()
        this.createFood()
        window.onkeydown = (e) => {
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
                    return
                case 'ArrowLeft':
                    if (this.lastdir != 'E')
                        this.dir = 'W'
                    break
                default: return
            }
            GAMING = true
            this.render = Date.now()
            window.requestAnimationFrame(() => this.loop())
        }

    }
    loop() {
        if (!GAMING)
            return
        window.requestAnimationFrame(() => this.loop())
        let newRender = Date.now()
        const interval = (newRender - this.render) / 1000
        if (interval < 1 / SPEED) return
        this.render = newRender
        this.lastdir = this.dir
        this.update()
        if (!GAMING)
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
        //rotate head
        switch (this.lastdir) {
            case 'N':
                document.getElementById('snakehead').style.transform = 'rotate(0deg)'
                break
            case 'E':
                document.getElementById('snakehead').style.transform = 'rotate(90deg)'
                break
            case 'S':
                document.getElementById('snakehead').style.transform = 'rotate(180deg)'
                break
            case 'W':
                document.getElementById('snakehead').style.transform = 'rotate(270deg)'
        }
        //count
        document.getElementById('count').children[1].innerHTML = this.snake.length - 3
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
        GAMING = false
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

class settings {
    active
    waiting = false
    inputs = [
        { id: 'speed', name: 'Speed', value: SPEED.toString(), max: 60, min: 1 },
        { id: 'size', name: 'Size', value: GBSIZE.toString(), max: 100, min: 10 }
    ]
    constructor() {
        this.active = true
        GAMING = false
        let bg = document.createElement('div')
        bg.id = 'settingsbg'
        document.body.appendChild(bg)
        let settings = document.createElement('div')
        settings.id = 'settings'
        document.getElementById('settingsbg').appendChild(settings)
        for (let i = 0; i < this.inputs.length; i++) {
            let wrap = document.createElement('div')
            wrap.classList.add('settingswrap')
            settings.appendChild(wrap)
            let txt = document.createElement('div')
            txt.classList.add('settingstext')
            txt.innerHTML = this.inputs[i].name
            wrap.appendChild(txt)
            let inp = document.createElement('input')
            inp.type = 'number'
            inp.id = this.inputs[i].id
            inp.max = this.inputs[i].max
            inp.min = this.inputs[i].min
            inp.value = this.inputs[i].value
            inp.classList.add('settingsinput')
            wrap.appendChild(inp)
        }
        let confirm = document.createElement('div')
        confirm.id = 'confirm'
        confirm.innerHTML = 'Confirm'
        settings.appendChild(confirm)
        confirm.addEventListener('click', () => {
            this.handleConfirm()
        })
        window.addEventListener('keydown', (e) => {
            if (!this.active) return
            console.log(e.key)
            if (e.key == 'Enter') {
                this.handleConfirm()
            }
        })
        window.addEventListener('keyup', async (e) => {
            if (!this.active) return
            this.waiting = true
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.waiting = false
            for (const e of this.inputs) {
                if (!document.getElementById(e.id)) return
                let val = document.getElementById(e.id).value
                if (val > e.max)
                    document.getElementById(e.id).value = e.max
                else if (val < e.min)
                    document.getElementById(e.id).value = e.min
            }
        })
    }
    handleConfirm() {
        this.active = false
        SPEED = document.getElementById('speed').value
        GBSIZE = document.getElementById('size').value
        // console.log(Number(GBSIZE))
        // if (Number(SPEED) < this.inputs[0].min) SPEED = this.inputs.min
        // else if (Number(SPEED) > this.inputs[0].max) SPEED = this.inputs.max
        // if (Number(GBSIZE) < this.inputs[1].min) GBSIZE = this.inputs.min
        // else if (Number(GBSIZE) > this.inputs[1].max) GBSIZE = this.inputs.max
        document.getElementById('settings').remove()
        document.getElementById('settingsbg').remove()
        document.getElementById('main').innerHTML = ''
        new gameboard()
        new game()
    }
}