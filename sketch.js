const scaleMax = 120;

// data
let data = [];

let tubeSize = null;
let plotSize = null;

let i = 0;
let count = 1;

let startTime;
let newTime = 0;
let elapsed = 0;

// logic
let startAnimation = false;
// let finished = false;

let showCharts = false;
let showChart1 = false;
let showChart2 = false;

let showTable = false;

let activeColumns = new Array(6).fill(false);

const plotGap = 30;
let windowWidth = document.documentElement.clientWidth;
let windowHeight = document.documentElement.clientHeight;

// ---------- DOM ELEMENTS ------------
const startBtn = document.querySelector('#startBtn');
startBtn.addEventListener('click', () => {
    startAnimation = true;
    // startTime = millis();
});

const resetBtn = document.querySelector('#resetBtn');
resetBtn.addEventListener('click', () => {
    startAnimation = false;
    startTime = null;
    data.length = 0;
    i = 0;
    elapsed = 0;
    count = 1;
    tableContainer.innerHTML = '';
    activeColumns.fill(false);
    tableHeaders.forEach((val) => {
        if (val.classList.contains('col-highlight', 'col-highlight-2', 'col-highlight-3')) {
            val.classList.remove('col-highlight', 'col-highlight-2', 'col-highlight-3');
        }
    });
    showChart1 = false;
    showChart2 = false;
});

const tableContainer = document.querySelector('#table tbody');
const tableHeaders = document.querySelectorAll('#table thead tr th');
tableHeaders.forEach((th, colInd) => {
    th.addEventListener('click', () => {
        if (activeColumns[colInd] === false) {
            activeColumns[colInd] = true;
        } else {
            activeColumns[colInd] = false;
        }
    });
});

const chartBtn = document.querySelector('#chartBtn');
chartBtn.addEventListener('click', () => {
    showCharts = showCharts ? false : true;
    if (!showCharts) {
        chartBtn.classList.add('button-clicked');
        activeColumns[3] = false;
        // highlightColumn(3);
    } else {
        chartBtn.classList.remove('button-clicked');
        activeColumns[3] = true;
    }
});

const tableBtn = document.querySelector('#tableBtn');
tableBtn.addEventListener('click', () => {
    showTable = showTable ? false : true;
    if (!showTable) {
        tableBtn.classList.add('button-clicked');
        tableContainer.innerHTML = '';
    } else {
        tableBtn.classList.remove('button-clicked');
    }
});

window.addEventListener('resize', () => {
    windowWidth = document.documentElement.clientWidth;
    windowHeight = document.documentElement.clientHeight;
    plotSize = _plot();
    tubeSize = _tube();
    resizeCanvas(windowWidth, windowHeight);
    data.length = 0;
    resetBtn.click();
});

// ---------------- LOGIC ------------------
const _tube = () => {
    return {
        top: 50,
        bottom: 900, //windowHeight - 2 * 50,
        left: 70,
        right: 80,
        height: 900, //windowHeight - 2 * 50,
        middleH: 35 + (80 + 70) / 2,
    };
};

const _plot = () => {
    return {
        plotPositionX: windowWidth * 0.6 + plotGap,
        plot1Y: plotGap,
        plot2Y: windowHeight / 2 + plotGap,
        plotWidth: windowWidth * 0.4 - plotGap * 2,
        plotHeight: windowHeight / 2 - plotGap * 2,
    };
};

function dataMotion(screenPos = 0, s = 0, x = 0, t = 0, deltaT = 0, V = 0) {
    return {
        screenPos,
        s,
        x,
        t,
        deltaT,
        V,
    };
}

function createPlots() {
    plot1 = new Plot(
        plotSize.plotPositionX,
        plotSize.plot1Y,
        plotSize.plotWidth,
        plotSize.plotHeight,
        { plotColor: color(174, 63, 247, 255) },
    );
    plot2 = new Plot(
        plotSize.plotPositionX,
        plotSize.plot2Y,
        plotSize.plotWidth,
        plotSize.plotHeight,
        { plotColor: color(176, 203, 58, 255) },
    );

    if (activeColumns[1]) {
        plot1.begin();
        plot1.drawAxisX('t[s]', 12, 0, 30, 1);
        plot1.drawAxisY('S[cm]', 12, 0, 120, 1);
        const plot1Points = data.filter((d) => d.t !== 0).map((d) => ({ x: d.t, y: d.s }));
        plot1Points.unshift({ x: 0, y: 0 });
        plot1.drawPlot(plot1Points, 0, 30, 0, 120);
    }

    if (activeColumns[5]) {
        plot2.begin();
        plot2.drawAxisX('t[s]', 12, 0, 30, 1);
        plot2.drawAxisY('V[cm/s]', 5, 0, 10, 1);
        const plot2Points = data.filter((d) => d.t !== 0).map((d) => ({ x: d.t, y: d.s / d.t }));
        plot2Points.unshift({ x: 0, y: data[2].s / data[2].t });
        plot2.drawPlot(plot2Points, 0, 30, 0, 10);
    }
}

function createTable() {
    // here create table from data array
    tableContainer.innerHTML = '';
    data.forEach((val, ind) => {
        if (startAnimation && (ind > 1) & (val.t !== 0)) {
            const tableRow = document.createElement('tr');
            tableRow.innerHTML = `
            <td>${ind - 1}</td>
            <td>${val.s}</td>
            <td>${val.x}</td>
            <td>${val.t}</td>
            <td>${val.deltaT}</td>
            <td>${val.V}</td>
        `;
            tableContainer.appendChild(tableRow);
        }
    });
}

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    tubeSize = _tube();
    plotSize = _plot();
}

function drawTube() {
    push();
    // tube
    noStroke();
    fill(255);
    rect(tubeSize.left, tubeSize.top, tubeSize.right, tubeSize.bottom);

    // scale
    noFill();
    const scaleValue = tubeSize.height / scaleMax;
    for (let i = 0; i <= scaleMax; i++) {
        stroke(0);
        i % 10 != 0 ? strokeWeight(1) : strokeWeight(2);
        let offset = 20;
        if (i % 10 === 0) {
            offset = 30;
            if (data.length <= scaleMax / 10) {
                data.push(dataMotion(tubeSize.top + tubeSize.bottom - i * scaleValue));
            }
        }
        line(
            tubeSize.left + tubeSize.right - offset,
            tubeSize.top + tubeSize.bottom - i * scaleValue,
            tubeSize.left + tubeSize.right,
            tubeSize.top + tubeSize.bottom - i * scaleValue,
        );

        const scaleValueLabel = i % 10 != 0 ? '' : i - 10;
        textSize(15);
        stroke(255);
        text(
            scaleValueLabel,
            tubeSize.left + tubeSize.right + 25,
            tubeSize.top + tubeSize.bottom - i * scaleValue + 3,
        );
    }
    pop();
}

function drawBubble() {
    push();
    noStroke();
    fill(55, 164, 241, 160);
    ellipse(tubeSize.middleH, tubeSize.top + tubeSize.bottom - 25 + i, tubeSize.right, 50);
    pop();
}

function draw() {
    if (startAnimation) {
        if (data[1].screenPos === tubeSize.top + tubeSize.bottom - 50 + i) {
            startTime = millis();
        }
        if (tubeSize.bottom - 25 + i > 25) {
            i = i - 0.5;
            if (startTime) {
                elapsed = millis() - startTime;
                if (elapsed - newTime > 100) {
                    newTime = elapsed;
                }
            }

            data.forEach((val) => {
                if (val.screenPos === tubeSize.top + tubeSize.bottom - 50 + i) {
                    if (elapsed) {
                        val.t = (elapsed / 1000).toFixed(1);
                        val.s = 10 * count;
                        count++;
                        val.x = 10;
                        val.deltaT = data[2].t;
                        val.V = (val.s / val.t).toFixed(0);
                    }
                }
            });
        }
    }
    background(0);

    drawTube();
    drawBubble();
    fill(255);
    textSize(25);
    text(elapsed ? `${(elapsed / 1000).toFixed(1)} s` : '0.0 s', 230, 50);
    if (showCharts) {
        createPlots();
    }

    if (showTable) {
        createTable();
        activeColumns.forEach((val, ind) => {
            if (val) {
                highlightColumn(ind);
            } else {
                clearHighlight(ind);
            }
        });
    }
}

function highlightColumn(index) {
    let colorClass = 'col-highlight';
    if (index === 1) {
        colorClass += '-2';
    } else if (index === 5) {
        colorClass += '-3';
    }
    tableHeaders[index].classList.add(colorClass);

    const rows = document.querySelectorAll('#table tbody tr');
    rows.forEach((row) => {
        cells = row.querySelectorAll('td');
        cells[index].classList.add(colorClass);
    });
}

function clearHighlight(index) {
    let colorClass = 'col-highlight';
    if (index === 1) {
        colorClass += '-2';
    } else if (index === 5) {
        colorClass += '-3';
    }
    if (tableHeaders[index].classList.contains(colorClass)) {
        tableHeaders[index].classList.remove(colorClass);
    }
}

// function clearHighlights() {
//     const cells = document.querySelectorAll('.col-highlight, .col-highlight2, .col-highlight3');
//     cells.forEach((element) => {
//         element.classList.remove('col-highlight', 'col-highlight2', 'col-highlight3');
//     });
// }
