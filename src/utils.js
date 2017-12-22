// Utils for rainbow color map and area color scheme from colorbrewer
const utils = {randomColor: () => {
    const randomNumber = () => Math.floor(Math.random() * 255);
    return "rgb(" + [randomNumber(), randomNumber(), randomNumber()].join(',') + ")";
}, areaColor: ['#fff7bc','#fee391','#fec44f','#fe9929','#cc4c02']
    //http://colorbrewer2.org/#type=sequential&scheme=PuBu&n=9
}