window.globalBucket.script = {}; // bucket for the scripts

// put here the logic that should happen when the scene changes
window.globalBucket.activeSceneChange = (scene) => {
    characters.updateCharacters(window.globalBucket.data);
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

window.globalBucket.newDataFromkey = (key) => {
    window.globalBucket.newData(window.globalBucket.script[key])
};

// put here the logic when new script data is loaded in
window.globalBucket.newData = (data) => {
    window.globalBucket.data = data;
    overview.updateOverview(data);
    timeline.updateTimeline(window.globalBucket.data);
    window.globalBucket.time = 0;
    timeline.updateTimelineProgress(window.globalBucket.time / window.globalBucket.amountofPages);
};

window.onload = () => {init();};

const prepareMovieDropdown = () => {
    const dropdown = document.getElementById('moviedropdown');
    window.globalBucket.currentSceneIndex = 0;
    Object.keys(window.globalBucket.script).map(k => {
        const name = window.globalBucket.script[k].name;
        dropdown.insertAdjacentHTML('beforeend', '<a class="dropdown-item" onclick="window.globalBucket.newDataFromkey('+"'"+k+"'"+')">' + name + '</a>');
})
};

// initialization of all main draw elements
const init = () => {
    prepareMovieDropdown();
    window.globalBucket.currentSceneIndex = 0;

    // overview SVG
    window.globalBucket.mainSVG = d3.select('#container')
        .append('svg')
        .classed('overviewSVG', true)
        .attr('preserveAspectRatio', 'xMinYMin meet');
    window.globalBucket.mainSVGG = window.globalBucket.mainSVG.append('g');
    window.globalBucket.mainSVG
        .call(d3.zoom().on("zoom", function () {
            // events for zooming
            window.globalBucket.mainSVGG.attr("transform", d3.event.transform);
            if (!window.globalBucket.mainSVGG._groups[0][0].getAttribute("transform")) return;
            const zoomFactor = Number(window.globalBucket.mainSVGG._groups[0][0].getAttribute("transform").split(' ')
                .filter(x => x.startsWith('scale'))[0].substr(6).slice(0, -1));
            overview.zooming(zoomFactor);

        }));
    // draw the overview
    // overview.updateOverview(window.globalBucket.data);

    // timeline
    window.globalBucket.timelineSVG = d3.select('#timeline')
        .append('svg')
        .classed('timelineSVG', true);
    window.globalBucket.timelineSVGG = window.globalBucket.timelineSVG.append('g');

    window.globalBucket.data = window.globalBucket.script[Object.keys(window.globalBucket.script)[0]];

    const data = window.globalBucket.data;
    window.globalBucket.amountofPages = data.scenes[data.scenes.length - 1].endTime - data.scenes[0].startTime;
    window.globalBucket.startTime = data.scenes[0].startTime;

    // draw the timeline
    // timeline.updateTimeline(window.globalBucket.data);

    window.globalBucket.newData(data);

    timeline.updateTimelineProgress(0);
    timeline.clickTimeline();
    play.init();
};

const recursivePlay = () => {
    setTimeout(() => {
        window.globalBucket.time += incrementalStep;

        const currentScene = window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex];
        if (window.globalBucket.time >= currentScene.endTime && window.globalBucket.currentSceneIndex < window.globalBucket.data.scenes.length - 1) {
            window.globalBucket.currentSceneIndex++;
            window.globalBucket.activeSceneChange(window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex]);
        }
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
        // subscribe here all the stuff that should change according to the time

    } , timeStep)
};

window.addEventListener("resize", (e) => {
    timeline.updateTimeline(window.globalBucket.data);
    // timeline progress pointer also has to be updated because it has to draw over the scene elements
    timeline.updateTimelineProgress(window.globalBucket.time / window.globalBucket.amountofPages);
    overview.changeSimulationCenter();
});


window.globalBucket.main = {recursivePlay};