class Plot {
    constructor(x, y, w, h, opts = {}) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.bgColor = opts.bgColor ?? 0;
        this.axisColor = opts.axisColor ?? 255;
        this.plotColor = opts.plotColor ?? 'red';
        this.offset = opts.offset ?? 50;
        this.arrowLen = opts.arrowLen ?? 20;
    }

    _bounds() {
        return {
            left: this.x + this.offset,
            right: this.x + this.w - this.offset,
            top: this.y + this.offset,
            bottom: this.y + this.h - this.offset,
        };
    }

    _tickValue(from, step, i, decimals) {
        const f = 10 ** decimals;
        const fromInt = Math.round((from + Number.EPSILON) * f);
        const stepInt = Math.round((step + Number.EPSILON) * f);
        return (fromInt + i * stepInt) / f;
    }

    _drawArrow(x, y, alpha1, alpha2) {
        const a1 = radians(alpha1);
        const a2 = radians(alpha2);
        line(x, y, x + cos(a1) * this.arrowLen, y + sin(a1) * this.arrowLen);
        line(x, y, x + cos(a2) * this.arrowLen, y + sin(a2) * this.arrowLen);
    }

    begin() {
        // angleMode(DEGREES);
        push();
        noStroke();
        fill(this.bgColor);
        rect(this.x, this.y, this.w, this.h);
        pop();
    }

    drawAxisX(label, amount, from, to, accuracy = 1) {
        push();
        stroke(this.axisColor);
        strokeWeight(3);

        const b = this._bounds();
        const x0 = b.left;
        const y0 = b.bottom;
        const x1 = b.right;
        // axis
        line(x0, y0, x1, y0);

        // arrow at the end of axis
        this._drawArrow(x1, y0, 150, -150);

        // scale and value on at the scale
        const scale = (x1 - x0) / amount;
        const step = (to - from) / amount;
        textAlign(CENTER, CENTER);
        textSize(12);
        for (let i = 1; i < amount; i++) {
            stroke(150, 80);
            line(x0 + i * scale, y0, x0 + i * scale, b.top);
            stroke(this.axisColor);
            line(x0 + i * scale, y0 - 7, x0 + i * scale, y0 + 7);
            noStroke();
            fill(this.axisColor);
            const val = this._tickValue(from, step, i, accuracy);
            text(val.toFixed(accuracy), x0 + i * scale, y0 + 25);
        }

        // description of the axis
        noStroke();
        fill(this.axisColor);
        textSize(15);
        text(label, x1, y0 + this.offset / 2);
        pop();
    }

    drawAxisY(label, amount, from, to, accuracy = 1) {
        push();
        stroke(this.axisColor);
        strokeWeight(3);

        const b = this._bounds();
        const x0 = b.left;
        const y0 = b.top;
        const y1 = b.bottom;

        // axis
        line(x0, y0, x0, y1);

        // arrow at the end of the axis
        this._drawArrow(x0, y0, 120, 60);

        // scale and value at the scale
        const scale = (y1 - y0) / amount;
        const step = (to - from) / amount;
        textAlign(CENTER, CENTER);
        textSize(12);
        for (let i = 1; i < amount; i++) {
            stroke(150, 80);
            line(x0, y1 - i * scale, b.right, y1 - i * scale);
            stroke(this.axisColor);
            line(x0 - 7, y1 - i * scale, x0 + 7, y1 - i * scale);
            noStroke();
            // const val = from + i * scaleValue;
            fill(this.axisColor);
            const val = this._tickValue(from, step, i, accuracy);
            text(val.toFixed(accuracy), x0 - 30, y1 - i * scale);
        }

        // description of the axis
        noStroke();
        fill(this.axisColor);
        textSize(15);
        text(label, this.x + 15, y0);
        pop();
    }

    drawPlot(points, fromX, toX, fromY, toY) {
        const b = this._bounds();
        push();
        noFill();
        stroke(this.plotColor);
        strokeWeight(3);
        beginShape();
        points.forEach((p) => {
            const x = map(p.x, fromX, toX, b.left, b.right);
            const y = map(p.y, fromY, toY, b.bottom, b.top);

            vertex(x, y);
            circle(x, y, 7);
        });
        endShape();
        pop();
    }
}
