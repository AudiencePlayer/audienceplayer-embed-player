declare const videojs: any;

const PlayToggle = videojs.getComponent('PlayToggle');

export function hotkeys(options: {backward: number; forward: number}) {
    return function(event: KeyboardEvent) {
        console.log('hot', event);
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
