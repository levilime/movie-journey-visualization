// TODO just for testing, this currently uses the rainbowmap
const utils = {randomColor: () => {
    const randomNumber = () => Math.floor(Math.random() * 255);
    return "rgb(" + [randomNumber(), randomNumber(), randomNumber()].join(',') + ")";
}, areaColor: ['#fff7bc','#fee391','#fec44f','#fe9929','#ec7014','#cc4c02','#993404','#662506']
    //http://colorbrewer2.org/#type=sequential&scheme=PuBu&n=9
}