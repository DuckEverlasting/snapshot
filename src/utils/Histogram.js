import { getAllHistogram } from "../utils/helpers";

export default class Histogram {
  constructor(sourceCtx) {
    this.data = getAllHistogram(sourceCtx);
    this.colorRef = {
      red: {index: 0, hex: "#FF0000"},
      green: {index: 1, hex: "#00FF00"},
      blue: {index: 2, hex: "#0000FF"},
      average: {index: 3, hex: "#FFFFFF"}
    }
  }

  clear(ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  getMax(color) {
    if (!color) {
      return Math.max(Math.max(...this.data[0]), Math.max(...this.data[1]), Math.max(...this.data[0]));
    } else {
      Math.max(...this.data[this.colorRef[color].index]);
    }
  }

  fill(ctx, color, max=null) {
    if (!this.colorRef[color]) {
      throw new Error("Error: invalid histogram color " + color);
    }
    const increment = Math.max(Math.floor(ctx.canvas.width / 256), 1);
    const height = ctx.canvas.height; 
    if (max === null) max = this.getMax(color);

    ctx.strokeStyle = this.colorRef[color].hex;
    ctx.beginPath();
    for (let i = 0; i < 256; i++) {
      ctx.moveTo(increment * i, height);
      ctx.lineTo(increment * i, height - this.data[this.colorRef[color].index][i] * (height / max));
    }
    ctx.stroke();
  }

  draw(ctx, color, max=null) {
    if (!this.colorRef[color]) {
      throw new Error("Error: invalid histogram color " + color);
    }
    const increment = Math.max(Math.floor(ctx.canvas.width / 256), 1);
    const height = ctx.canvas.height; 
    if (max === null) max = this.getMax(color);

    ctx.strokeStyle = this.colorRef[color].hex;
    ctx.lineWidth = Math.ceil(ctx.canvas.width / 256);
    ctx.beginPath();
    ctx.moveTo(0, height - this.data[this.colorRef[color].index][0] * (height / max));
    for (let i = 1; i < 256; i++) {
      ctx.lineTo(increment * i, height - this.data[this.colorRef[color].index][i] * (height / max));
    }
    ctx.stroke();
  }

  drawRGB(ctx, max=null) {
    if (max === null) max = this.getMax();
    this.draw(ctx, "red", max);
    this.draw(ctx, "green", max);
    this.draw(ctx, "blue", max);
  }

  
  drawAll(ctx, max=null) {
    if (max === null) max = this.getMax();
    this.drawRGB(ctx, max);
    this.draw(ctx, "average", max);
  }
}