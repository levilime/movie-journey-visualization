// put here the logic that should happen when the scene changes
window.globalBucket.activeSceneChange = (scene) => {

};

// put here the logic when new script data is loaded in
window.globalBucket.newData = (data) => {
    window.globalBucket.overview(data);
};