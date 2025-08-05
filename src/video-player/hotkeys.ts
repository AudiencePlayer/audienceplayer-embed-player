export function createHotKeysFunction(videojesInstance: any, options: {backward: number; forward: number}) {
    const PlayToggle = videojesInstance.getComponent('PlayToggle');

    function skip(component: any, skipTime: number) {
        const currentVideoTime = component.currentTime();
        const liveTracker = component.liveTracker;
        const duration = liveTracker && liveTracker.isLive() ? liveTracker.seekableEnd() : component.duration();
        let newTime = currentVideoTime + skipTime;
        if (newTime > duration) {
            newTime = duration;
        } else if (newTime < 0) {
            newTime = 0;
        }
        component.currentTime(newTime);
    }

    return function (event: KeyboardEvent) {
        switch (event.key) {
            case ' ':
                PlayToggle.prototype.handleClick.call(this, event);
                break;
            case 'ArrowLeft':
                skip(this, options.backward);
                break;
            case 'ArrowRight':
                skip(this, options.forward);
                break;
        }
    };
}
