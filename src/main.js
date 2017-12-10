// put here the logic that should happen when the scene changes
window.globalBucket.activeSceneChange = (scene) => {

};
// whether the scene is currently playing
window.globalBucket.playStatus = false;

window.globalBucket.changePlay = () => {
    
};

// time in the amount of pages
window.globalBucket.time = 0 ;
const timeStep = 10;
const pagesPerSecond = 1;
const incrementalStep = pagesPerSecond * (timeStep/1000);

// put here the logic when new script data is loaded in
window.globalBucket.newData = (data) => {
    window.globalBucket.overview(data);
};

window.onload = () => {init();};

// initialization of all main draw elements
const init = () => {
    // overview SVG
    window.globalBucket.mainSVG = d3.select('#container')
        .append('svg')
        .classed('overviewSVG', true)
        .attr('preserveAspectRatio', 'xMinYMin meet');
    window.globalBucket.mainSVGG = window.globalBucket.mainSVG.append('g');
    window.globalBucket.mainSVG
        .call(d3.zoom().on("zoom", function () {
            window.globalBucket.mainSVGG.attr("transform", d3.event.transform)
        }));

    // draw the overview
    overview.updateOverview(window.globalBucket.data);

    // timeline
    window.globalBucket.timelineSVG = d3.select('#timeline')
        .append('svg')
        .classed('timelineSVG', true);
    window.globalBucket.timelineSVGG = window.globalBucket.timelineSVG.append('g');


    const data = window.globalBucket.data;
    window.globalBucket.amountofPages = data.scenes[data.scenes.length - 1].endPage - data.scenes[0].startPage;
    window.globalBucket.startPage = data.scenes[0].startPage;

    // draw the timeline
    timeline.updateTimeline(window.globalBucket.data);

    timeline.updateTimelineProgress(0);
    timeline.clickTimeline();
    play.init();
};

const recursivePlay = () => {
    setTimeout(() => {
        window.globalBucket.time += incrementalStep;
        // subscribe here all the stuff that should change according to the time
        timeline.updateTimelineProgress(window.globalBucket.time / window.globalBucket.amountofPages);
        if (window.globalBucket.time / window.globalBucket.amountofPages >= 1 || window.globalBucket.time === window.globalBucket.amountofPages) {
            window.globalBucket.time = 0;
            recursivePlay();
        } else if (window.globalBucket.time + incrementalStep >= window.globalBucket.amountofPages ) {
            window.globalBucket.time = window.globalBucket.amountofPages;
            play.switchPlayStatus(false);
        } else if (play.playStatus) {
            recursivePlay();
        }
    } , timeStep)
};

window.addEventListener("resize", (e) => {
    timeline.updateTimeline(window.globalBucket.data);
    // timeline progress pointer also has to be updated because it has to draw over the scene elements
    timeline.updateTimelineProgress(window.globalBucket.time / window.globalBucket.amountofPages);
    overview.changeSimulationCenter();
});


window.globalBucket.main = {recursivePlay};