window.globalBucket.script = {}; // bucket for the scripts

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

window.globalBucket.newDataFromkey = (key) => {
    window.globalBucket.newData(window.globalBucket.script[key]);
     
};

// put here the logic when new script data is loaded in
window.globalBucket.newData = (data) => {
    window.globalBucket.data = data;
    overview.updateOverview(data);
    timeline.updateTimeline(window.globalBucket.data);
    window.globalBucket.time = 0;
    window.globalBucket.currentSceneIndex = 0;
    //load the first scene dialog
    if(dialogActive){loadDialogs2(window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex]);}
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
    //loadDialogs(window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex]);
    // overview SVG
    window.globalBucket.mainSVG = d3.select('#container')
        .append('svg')
        .classed('overviewSVG', true)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr("id", "overviewSVG"); //added an id to manipulate the width
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

        if(dialogActive){loadDialogs2(currentScene);}
        if (window.globalBucket.time >= currentScene.endTime && window.globalBucket.currentSceneIndex < window.globalBucket.data.scenes.length - 1) {
            //alert("changement de Scene:"+currentScene.name);
            window.globalBucket.currentSceneIndex++;
            //console.log("current scen index:" +window.globalBucket.currentSceneIndex);
            window.globalBucket.activeSceneChange(window.globalBucket.data.scenes[window.globalBucket.currentSceneIndex]);
            // load dialog in each new scene
            //if(dialogActive){loadDialogs2(currentScene);}
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

//function which add the discussion bubble to the dialog pannel div
// const loadDialogs = (currentScene) => {
//     var lastCh="";
//     var altBool=0;
//
//     document.getElementById("dialog").innerHTML='<div class="space"><div>'
//
//     currentScene.script.forEach((currentScript, i) => {
//
//             if(lastCh!=JSON.stringify(currentScript.character)){
//                 altBool++;
//             }
//             //console.log(altBool);
//
//             if(altBool%2 == 0){
//                 document.getElementById("dialog").innerHTML+= '<div class="bubble"><div class="txt"><p class="name">'+currentScript.character+'</p><p class="message">'+currentScript.dialog+'</p><span class="timestamp">'+currentScript.startTime+'</span></div><div class="bubble-arrow"></div>' ;
//             }else{
//                 document.getElementById("dialog").innerHTML+= '<div class="bubble alt"><div class="txt"><p class="name alt">'+currentScript.character+'</p><p class="message">'+currentScript.dialog+'</p><span class="timestamp">'+currentScript.startTime+'</span></div><div class="bubble-arrow alt"></div>' ;
//             }
//             lastCh=JSON.stringify(currentScript.character);
//
//         });
//
//     document.getElementById("dialog").innerHTML+='<div class="space"><div>'
// };

const loadDialogs2 = (currentScene) =>  {
    var lastCh="";
    var altBool=0;
    var result=false;
    var listResult=[];
    var index;

    const dialogContainer = d3.select("#dialog");

    dialogContainer.selectAll('*').remove();
    dialogContainer.append('div').classed('space', true);
    
    const callDialogs=dialogContainer.selectAll(".bubble").data(currentScene.script);

    // if (window.globalBucket.time >= callDialogs.startTime && window.globalBucket.currentSceneIndex < window.globalBucket.data.scenes.length - 1) {
    index=0;
    const dBubble=callDialogs.enter().append('div').classed('bubble',currentScript=>{if(window.globalBucket.time>currentScript.startTime){return true;}else{return false;}}).classed('alt',currentScript=>{
        //console.log(currentScript.character+' -> '+lastCh);
            if(lastCh!=JSON.stringify(currentScript.character)){
                altBool++;
            }
            if(altBool%2 == 0){
                result = false;
            }else{
                result = true;
            }
            lastCh=JSON.stringify(currentScript.character);
            listResult[index]=result;
            index++;
            return result;
    });

    const dBubble2=dBubble.append('div').classed("txt",currentScript=>{if(window.globalBucket.time>currentScript.startTime){return true;}else{return false;}});

    index=0;
    dBubble2.append('p').classed("name", true).classed('alt',currentScript=>{
        result=listResult[index];
        index++;
        return result;
        }).text(currentScript => {if(window.globalBucket.time>currentScript.startTime){return currentScript.character;}});

    dBubble2.append('p').classed('message',true).text(currentScript => {if(window.globalBucket.time>currentScript.startTime){return currentScript.dialog;}});
    //dBubble2.append('span').classed('timestamp').text(currentScript => currentScript.dialogstartTime);

    index=0;
    dBubble.append('div').classed('bubble-arrow',true).classed('alt',currentScript=>{
        result=listResult[index];
        index++;
        return result;
        });

    
   dialogContainer.append('div').classed('space', true); 
   dialogContainer.append('div').classed('space', true);
   document.getElementById("dialog").lastChild.scrollIntoView(); 

}


    // TODO fix this by putting into bootstrap container
    //dialogContainer.append('div').classed('space', true);


// Show/Hide dialog pannel
var dialogActive = true;

const dialogLayout = () => {
    var b = document.getElementById("bDialog");
    var s =  document.getElementById("overviewSVG");
    var d = document.getElementById("dialogPannel");

    if(b.value == "Show dialogs"){
        b.value = "Hide dialogs";
        s.style.width="75%";
        d.style.width="25%";
        dialogActive=true;

    }else{
        b.value = "Show dialogs";
        s.style.width="98%";
        d.style.width="2%";
        document.getElementById("dialog").innerHTML='';
        dialogActive=false;
    }
};