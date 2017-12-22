// add click event to the playbutton
const buttonId = "play";
const playIcon = "fa-play";
const pauseIcon = "fa-pause";

const play = {
    playStatus: false,
    transitionStatus: false,
        //Initialize the play button
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
//Change the icon of the button
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
//Switch the play status
    switchPlayStatus: (status) => {
        play.playstatus = status;
        play.changeIcon();
    }
};