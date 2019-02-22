
let timeStarted = {};
let count = {};
let total = {};
let previousLap = {};

const timeLap = (timerName, expectedCount, isEnd) => {
    if (expectedCount && !total[timerName]) total[timerName] = expectedCount;
    if(!timeStarted[timerName]) {
        timeStarted[timerName] = Date.now();
        previousLap[timerName] = timeStarted[timerName];
        count[timerName] = 1;

        let output = {};
        output.currentCount = count[timerName];
        if (total[timerName]) output.expectedCount = total[timerName];
        return output;
    } else {
        let currentTime = Date.now();
        let timeElapsed = currentTime - timeStarted[timerName];
        if (isEnd) return `Completed. Total time elapsaed: ${convertToDMS(timeElapsed)}`;
        let lapTime = currentTime - previousLap[timerName];
        let averageTime = timeElapsed/count[timerName];
        let expectedTime = total[timerName] ? convertToDMS(averageTime * (total[timerName] - count[timerName])) : undefined;
        previousLap[timerName] = currentTime;
        count[timerName]++;
        
        let output = {};
        output.lapTime = convertToDMS(lapTime);
        if (expectedTime) output.expectedTime = expectedTime;
        output.currentCount = count[timerName];
        if (total[timerName]) output.expectedCount = total[timerName];
        
        return output
    }
}

const convertToDMS = (milli) => {
    let sec = Math.ceil(milli/1000);
    let min = Math.floor(sec/60);
    sec -= min * 60;
    let hrs = Math.floor(min/60);
    min -= hrs * 60;
    return `${hrs} h : ${min} m : ${sec} s`
}


module.exports = timeLap;