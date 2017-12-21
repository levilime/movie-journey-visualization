// TODO just for testing, this currently uses the rainbowmap
const utils = {randomColor: () => {
    const randomNumber = () => Math.floor(Math.random() * 255);
    return "rgb(" + [randomNumber(), randomNumber(), randomNumber()].join(',') + ")";
}, areaColor: ['#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d','#023858']
    //http://colorbrewer2.org/#type=sequential&scheme=PuBu&n=9
}