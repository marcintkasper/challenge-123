

const initialize = () => {

    const ball = document.getElementById("ball")

    ball.addEventListener("click", () => {
        ball.className = "ball ball-flying"
    }, false)

    ball.addEventListener("animationend", () => {
        const congrats = document.getElementById("congrats");
        congrats.className = "congrats congrats-in";
    })
}

window.addEventListener("load", initialize, false)