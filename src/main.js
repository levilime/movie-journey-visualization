window.globalBucket.script = {}; // bucket for the scripts

// put here the logic that should happen when the scene changes
window.globalBucket.activeSceneChange = (scene) => {
    characters.updateCharacters(window.globalBucket.data);
    overview.updateColors(window.globalBucket.data);
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

window.globalBucket.transitionDuration = 2000;

window.globalBucket.newDataFromkey = (key) => {
    window.globalBucket.newData(window.globalBucket.script[key])
};

// put here the logic when new script data is loaded in
window.globalBucket.newData = (data) => {
    window.globalBucket.data = data;
    window.globalBucket.amountofPages = data.scenes[data.scenes.length - 1].endTime - data.scenes[0].startTime;
    window.globalBucket.startTime = data.scenes[0].startTime;
    overview.updateOverview(data);
    overview.updateColors(data);
    timeline.updateTimeline(window.globalBucket.data);
    window.globalBucket.currentSceneIndex = 0;
    window.globalBucket.time = 0;
    timeline.updateTimelineProgress(window.globalBucket.time / window.globalBucket.amountofPages);
    changeMovieHeader(data.name);
    characters.initCharacters(data);
    prepareCharacterList();
    //load the first scene dialog
    if(dialog.dialogActive){dialog.loadDialogs(window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex]);}
    timeline.updateTimelineProgress(window.globalBucket.time / window.globalBucket.amountofPages);
};

window.onload = () => {init();};

const changeMovieHeader = (name) => {
    const header = document.getElementById('movieheader');
    header.innerText = name;
}

const prepareMovieDropdown = () => {
    const dropdown = document.getElementById('moviedropdown');
    Object.keys(window.globalBucket.script).map(k => {
        const name = window.globalBucket.script[k].name;
        dropdown.insertAdjacentHTML('beforeend', '<a class="dropdown-item" onclick="window.globalBucket.newDataFromkey('+"'"+k+"'"+')">' + name + '</a>');
})
};

const prepareGraphOptionsDropdown = () => {
    const dropdown = document.getElementById('graphoptionsdropdown');
    Object.keys(overview.forceGraphRepresentations).map(k => {
        dropdown.insertAdjacentHTML('beforeend', '<a class="dropdown-item" onclick="graphReordering('+"'"+k+"'"+')">' + k + '</a>');
    })
};

const graphReordering = (key) => {
    overview.updateOverview(window.globalBucket.data, key);
    characters.initCharacters(window.globalBucket.data);
};

const prepareCharacterList = () => {
  const list = document.querySelector('#characters ul');
  while(list.lastChild) {
      list.removeChild(list.lastChild);
  }
  let chars = window.globalBucket.data.scenes.map((scene) => scene.characters);
    chars = [].concat.apply([], chars);
    chars = chars.filter((char, index, inputArray) => {
        return inputArray.indexOf(char) == index;
    });
    chars.forEach((char) => {
        //added color of the circle to the list of character -> doesn't work because not every character's circle is loaded at the beginning -> solution: fix color for character at the beginning
        //color=document.getElementById(char).getAttribute("fill");
        list.insertAdjacentHTML('beforeend', '<li>' + char + '</li>')
    });
};

// initialization of all main draw elements
const init = () => {
    prepareMovieDropdown();
    prepareGraphOptionsDropdown();
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
            characters.zooming(zoomFactor);

        }));
    setInterval(() => {characters.updateClusters();}, 25);
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
    prepareCharacterList();
    timeline.updateTimelineProgress(0);
    timeline.clickTimeline();
    play.init();
    dialog.dialogLayout();
};

const recursivePlay = () => {
    setTimeout(() => {
        window.globalBucket.time += incrementalStep;
        const currentScene = window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex];
        if(dialog.dialogActive){dialog.loadDialogs(currentScene);}
        if (window.globalBucket.time >= currentScene.endTime || window.globalBucket.time < currentScene.startTime) {
            window.globalBucket.currentSceneIndex = window.globalBucket.data.scenes.findIndex((scene) => scene.startTime <= window.globalBucket.time &&
                scene.endTime > window.globalBucket.time);
            window.globalBucket.activeSceneChange(window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex]);
        }
        timeline.updateTimelineProgress(window.globalBucket.time / window.globalBucket.amountofPages);
        if (window.globalBucket.time / window.globalBucket.amountofPages >= 1 || window.globalBucket.time === window.globalBucket.amountofPages) {
            window.globalBucket.time = 0;
            recursivePlay();
        } else if (window.globalBucket.time + incrementalStep >= window.globalBucket.amountofPages ) {
            window.globalBucket.time = window.globalBucket.amountofPages;
            play.switchPlayStatus(false);
        } else if (play.playStatus && !play.transitionStatus) {
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
    timeline.metaData(true);
});

window.globalBucket.main = {recursivePlay};
