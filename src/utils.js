// TODO just for testing, this currently uses the rainbowmap
const randomColor = () => {
    const randomNumber = () => Math.floor(Math.random() * 255);
    return "rgb(" + [randomNumber(), randomNumber(), randomNumber()].join(',') + ")";
};

window.globalBucket.utils = {randomColor};