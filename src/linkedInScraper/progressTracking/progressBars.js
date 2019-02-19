var ProgressBar = require('progress');
const cluster = require('cluster');


progress = {
    bar: null,
    fmt: `Progress: :bar Profile: :current/:total | Time elapsed: :elapseds | ETA: :etas`
}

progress.buildProgressBar = (totalPages, totalProfiles) => {
    totalProfiles = totalProfiles || Infinity;
    progress.bar = new ProgressBar(progress.fmt, { total: totalProfiles, complete: '█', incomplete: '░', width: 30 });
    progress.bar.chars.head = ` ${Math.floor((progress.bar.curr)*100/totalProfiles)}%`
    progress.bar.update();
    progress.bar.curr = 0;

}

progress.tick = () => {
    let bar = progress.bar;
    bar.chars.head = ` ${Math.floor((bar.curr+1)*100/bar.total)}%`;
    bar.tick();
}

progress.log = function () {
    let msg = ''.concat(...arguments)
    if (cluster.isMaster) {
        progress.bar.interrupt(msg);
    } else {
        process.send({log: true, msg})
    }
}

progress.updateTotal = (total) => {
    let bar = progress.bar;
    bar.total = total;
}

module.exports = progress;
































// var ProgressBar = require('progress');


// progress = {
//     bar: null,
//     fmtTemplate: {
//         start : `Progress: :bar Profile: :current/:total | Page: `,
//         middle: `/`,
//         totalPages: null,
//         end : ` | Time elapsed: :elapseds | ETA: :etas`
//     }
// }

// progress.buildFmt = (page) => {
//     let {start, middle, totalPages, end} = progress.fmtTemplate;
//     page = page || 1;
//     return start + page + middle + totalPages + end;
// }

// progress.buildProgressBar = (totalPages, totalProfiles) => {
//     totalPages = totalPages || null;
//     progress.fmtTemplate.totalPages = totalPages;
//     let fmt = progress.buildFmt();
//     totalProfiles = totalProfiles || Infinity;
//     progress.bar = new ProgressBar(fmt, { total: totalProfiles, complete: '█', incomplete: '░', width: 30 });
//     progress.bar.chars.head = ` ${Math.floor((progress.bar.curr)*100/totalProfiles)}%`
//     progress.bar.update(0);
// }

// progress.tick = (page) => {
//     let bar = progress.bar;
//     bar.chars.head = ` ${Math.floor((bar.curr+1)*100/bar.total)}%`;
//     bar.fmt = progress.buildFmt(page);
//     bar.tick();
// }

// progress.log = (msg) => {
//     if (progress.bar) progress.bar.interrupt(msg);
//     else console.log(msg);
// }

// progress.updateTotal = (total) => {
//     let bar = progress.bar;
//     bar.total = total;
// }

// module.exports = progress;