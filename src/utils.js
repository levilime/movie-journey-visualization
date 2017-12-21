// TODO just for testing, this currently uses the rainbowmap
const utils = {randomColor: () => {
    const randomNumber = () => Math.floor(Math.random() * 255);
    return "rgb(" + [randomNumber(), randomNumber(), randomNumber()].join(',') + ")";
}, areaColor: (i) => {
    //http://colorbrewer2.org/#type=sequential&scheme=PuBu&n=3
    const colormap = ['#ece7f2', '#a6bddb', '#2b8cbe'];
    return colormap[i];
}}