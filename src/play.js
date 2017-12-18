// add click event to the playbutton
const buttonId = "play";
const playIcon = "fa-play";
const pauseIcon = "fa-pause";

const play = {
    playStatus: false,
    transitionStatus: false,
    init : ()=>{
        document.getElementById(buttonId).addEventListener("click", () => {
            if (play.playStatus) {
                play.playStatus = false;
            } else {
                play.playStatus = true;
                window.globalBucket.main.recursivePlay();
            }
            play.changeIcon();
        });
    },
    changeIcon: () =>{
    const elem = document.getElementById(buttonId);
    if(play.playStatus) {
        elem.classList.remove(playIcon);
        elem.classList.add(pauseIcon);
    } else {
        elem.classList.remove(pauseIcon);
        elem.classList.add(playIcon);
    }
    },
    switchPlayStatus: (status) => {
        play.playstatus = status;
        play.changeIcon();
    }
};