// Copyright (c) 2023 YA-androidapp(https://github.com/yzkn) All rights reserved.


const Preference = {
    center: {
        fillColor: "silver",
        lineColor: "black",
        radius: 10,
        width: 4,
    },

    face: {
        border: {
            color: "#000",
            width: 3,
        },
        lineThick: {
            height: 10,
            width: 5,
        },
        lineThin: {
            height: 5,
            width: 3,
        },
        text: {
            color: "#000",
            font: "bold 1.5em sans-serif",
            offset: 30,
        }
    },

    hour: {
        color: "#000",
        divNum: 12 * 60,
        length: 55,
        runover: 10,
        width: 10,
    },

    minute: {
        color: "#000",
        divNum: 60,
        length: 80,
        runover: 10,
        width: 10,
    },

    second: {
        color: "#f00",
        divNum: 60,
        length: 85,
        runover: 20,
        width: 5,
    },
};

const initialCanvas = id => {
    const viewElm = document.getElementById(id);
    const size = Math.min(viewElm.clientWidth, viewElm.clientHeight);
    const radius = size / 2;
    const cvs = document.createElement("canvas");
    const context = cvs.getContext('2d');
    cvs.setAttribute("width", size);
    cvs.setAttribute("height", size);
    const style = cvs.style;
    style.border = "0";
    style.boxSizing = "border-box";
    style.height = size + "px";
    style.left = (viewElm.clientWidth - size) / 2 + "px";
    style.margin = "0 0 0 0";
    style.padding = "0 0 0 0";
    style.position = "absolute";
    style.top = (viewElm.clientHeight - size) / 2 + "px";
    style.width = size + "px";
    context.translate(radius, radius);
    viewElm.appendChild(cvs);

    return { radius: radius, context: context };
};

const centerCircle = (context) => {
    const ctx = context;
    return () => {
        ctx.lineWidth = 0;
        ctx.beginPath();
        ctx.fillStyle = Preference.center.lineColor;
        ctx.arc(0, 0, Preference.center.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = Preference.center.fillColor;
        ctx.arc(0, 0, Preference.center.radius - Preference.center.width, 0, Math.PI * 2);
        ctx.fill();
    };
};

const face = (context, radius) => {
    const ctx = context;
    const stepPath = (radius, type) => {
        const linePath = new Path2D();
        linePath.lineWidth = type.width;
        linePath.moveTo(0, radius);
        linePath.lineTo(0, radius - type.height);
        return linePath;
    };

    return () => {
        ctx.beginPath();
        ctx.strokeStyle = Preference.face.border.color;
        ctx.fillStyle = Preference.face.text.color;
        ctx.lineWidth = Preference.face.border.width;
        ctx.arc(0, 0, radius - Preference.face.border.width / 2, 0, Math.PI * 2, true);
        ctx.stroke();

        const topPos = radius - Preference.face.border.width;
        const rotateAngle = Math.PI * (360 / 60) / 180;
        const lineThick = stepPath(topPos, Preference.face.lineThick);
        const lineThin = stepPath(topPos, Preference.face.lineThin);
        ctx.save();

        for (let i = 0; i < 60; i++) {
            const line = i % 5 === 0 ? lineThick : lineThin;
            ctx.beginPath();
            ctx.stroke(line);
            ctx.rotate(rotateAngle);
        }
        ctx.restore();

        const stepRad = 360 / 12;
        const letterPos = topPos - Preference.face.text.offset;
        const MathPi = Math.PI / 180;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = Preference.face.text.font;

        for (let i = 0; i < 12; i++) {
            const deg = i * stepRad * MathPi;
            const letterX = letterPos * Math.sin(deg);
            const letterY = -letterPos * Math.cos(deg);
            ctx.fillText(i === 0 ? "12" : i.toString(), letterX, letterY);
        }
    };
};

const handObj = function (handData, context, radius) {
    this.handData = handData;
    this.rotateAngle = Math.PI * (360 / handData.divNum) / 180;
    this.ctx = context;
    const topPos = radius - Preference.face.border.width;
    const pathCtx = new Path2D();
    pathCtx.lineWidth = handData.width;
    pathCtx.strokeStyle = handData.color;
    pathCtx.moveTo(0, - (topPos * handData.length / 100));
    pathCtx.lineTo(0, topPos * handData.runover / 100);
    this.pathCtx = pathCtx;
};

handObj.prototype = {
    rewrite: function (val) {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = this.handData.width;
        ctx.strokeStyle = this.handData.color;
        ctx.rotate(this.rotateAngle * val);
        ctx.stroke(this.pathCtx);
        ctx.restore();
    }
};


window.addEventListener("DOMContentLoaded", () => {
    const { context, radius } = initialCanvas("clock");
    const cCircle = centerCircle(context);
    const mBan = face(context, radius);
    const hourHand = new handObj(Preference.hour, context, radius);
    const minuteHand = new handObj(Preference.minute, context, radius);
    const secondHand = new handObj(Preference.second, context, radius);

    const sideLength = radius * 2;

    setInterval(() => {
        const date = new Date();
        context.clearRect(-radius, -radius, sideLength, sideLength);
        mBan();
        hourHand.rewrite((date.getHours() % 12) * 60 + date.getMinutes());
        minuteHand.rewrite(date.getMinutes());
        secondHand.rewrite(date.getSeconds());
        cCircle();
    }, 1000);
});
