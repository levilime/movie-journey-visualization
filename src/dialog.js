const dialog = (() => {
let dialogActive = true;

const loadDialogs = (currentScene) =>  {
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
    console.log
    dBubble2.append('p').classed("name", true).style('color',currentScript=>{
        //color of the character circle
        return document.getElementById(currentScript.character).getAttribute("fill");
        }).classed('alt',currentScript=>{
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

};

const dialogLayout = () => {
    var b = document.getElementById("bDialog");
    var s =  window.globalBucket.mainSVG;
    var d = document.getElementById("dialogPannel");

    dialogActive = !dialogActive;

    if(dialogActive){
        b.value = "Hide dialogs";
        // s.style.width="75%";
        s.style('width', "75%");
        d.style.width="25%";
        d.className = "shown";
    }else{
        b.value = "Show dialogs";
        s.style('width', "100%");
        d.style.width="0%";
        d.className = "hidden";
        document.getElementById("dialog").innerHTML='';
    }
    return dialogActive;
};
return {loadDialogs, dialogLayout, dialogActive};
})();