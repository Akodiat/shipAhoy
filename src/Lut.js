class Color {
    constructor(hex) {
        return this.setHex(hex);
    }

    setHex(hex) {
        hex = Math.floor(hex);
        this.r = (hex >> 16 & 255) / 255;
        this.g = (hex >> 8 & 255) / 255;
        this.b = (hex & 255) / 255;
        return this;
    }
    lerpColors(color1, color2, alpha) {
        this.r = color1.r + (color2.r - color1.r) * alpha;
        this.g = color1.g + (color2.g - color1.g) * alpha;
        this.b = color1.b + (color2.b - color1.b) * alpha;

        return this;
    }
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

class Lut {
    constructor(colormap, count = 32) {
        this.isLut = true;

        this.lut = [];
        this.map = [];
        this.n = 0;
        this.minV = 0;
        this.maxV = 1;

        this.setColorMap(colormap, count);
    }

    set(value) {
        if (value.isLut === true) {
            this.copy(value);
        }
        return this;
    }

    setMin(min) {
        this.minV = min;
        return this;
    }

    setMax(max) {
        this.maxV = max;
        return this;
    }

    setColorMap(colormap, count = 32) {
        this.map = ColorMapKeywords[colormap] || ColorMapKeywords.rainbow;
        this.n = count;

        const step = 1.0 / this.n;
        const minColor = new Color();
        const maxColor = new Color();

        this.lut.length = 0;

        // sample at 0

        this.lut.push(new Color(this.map[0][1]));

        // sample at 1/n, ..., (n-1)/n

        for (let i = 1; i < count; i++) {
            const alpha = i * step;
            for (let j = 0; j < this.map.length - 1; j++) {
                if (alpha > this.map[j][0] && alpha <= this.map[j + 1][0]) {

                    const min = this.map[j][0];
                    const max = this.map[j + 1][0];

                    minColor.setHex(this.map[j][1]);
                    maxColor.setHex(this.map[j + 1][1]);

                    const color = new Color().lerpColors(minColor, maxColor, (alpha - min) / (max - min));

                    this.lut.push(color);
                }
            }
        }

        // sample at 1

        this.lut.push(new Color(this.map[this.map.length - 1][1]));

        return this;
    }

    copy(lut) {
        this.lut = lut.lut;
        this.map = lut.map;
        this.n = lut.n;
        this.minV = lut.minV;
        this.maxV = lut.maxV;

        return this;
    }

    getColor(alpha) {
        alpha = clamp(alpha, this.minV, this.maxV);

        alpha = (alpha - this.minV) / (this.maxV - this.minV);

        const colorPosition = Math.round(alpha * this.n);

        return this.lut[colorPosition];
    }

    addColorMap(name, arrayOfColors) {
        ColorMapKeywords[name] = arrayOfColors;

        return this;
    }
}

const ColorMapKeywords = {
    "OrRd": [[0.0, 0xfef0d9], [0.33, 0xfdcc8a], [0.5, 0xfc8d59], [0.75, 0xe34a33], [1.0, 0xb30000]],
    "rainbow": [[0.0, 0x0000FF], [0.2, 0x00FFFF], [0.5, 0x00FF00], [0.8, 0x0C0C0B], [1.0, 0xFF0000]],
    "cooltowarm": [[0.0, 0x3C4EC2], [0.2, 0x9BBCFF], [0.5, 0xDCDCDC], [0.8, 0xF6A385], [1.0, 0xB40426]],
    "blackbody": [[0.0, 0x000000], [0.2, 0x780000], [0.5, 0xE63200], [0.8, 0xFFFF00], [1.0, 0xFFFFFF]],
    "grayscale": [[0.0, 0x000000], [0.2, 0x404040], [0.5, 0x7F7F80], [0.8, 0xBFBFBF], [1.0, 0xFFFFFF]]
};

export {Lut, ColorMapKeywords};