import { Color } from "vscode"
import { getColorFromName } from "../utils/getColorFromName"
import { strToNum } from "../utils/strToNum"
import { getColorFromHex } from "../utils/getColorFromHex"
function getColor(values: string[]): Color | undefined {
    if (values.length === 1) {
        // Color()
        if (values[0] === "") {
            return new Color(0, 0, 0, 0)
        }
        // Color(274)
        let num = strToNum(values[0])
        if (num !== undefined) {
            if (
                Number.isInteger(num) &&
                num >= -0x80000000 &&
                num <= 0x7fffffff
            ) {
                let r = ((num >> 24) & 0xff) / 255
                let g = ((num >> 16) & 0xff) / 255
                let b = ((num >> 8) & 0xff) / 255
                let a = (num & 0xff) / 255
                return new Color(r, g, b, a)
            }
        }
        // Color("yellow")
        // Color("YELLOW")
        let color = getColorFromName(values[0])
        if (color !== undefined) {
            return color
        }
        // Color("#ffb2d90a")
        // Color("ffb2d90a")
        // Color("#b2d90a")
        // Color("b2d90a")
        return getColorFromHex(values[0])
    } else if (values.length === 2) {
        // Color("yellow", 0.5)
        // Color("YELLOW", 0.5)
        // Color(Color.red, 0.2)
        // Color(Color.RED, 0.2)
        let color = getColorFromName(values[0])
        if (color === undefined) {
            return undefined
        }
        let alpha = strToNum(values[1])
        if (alpha === undefined || alpha < 0 || alpha > 1) {
            return undefined
        }
        return new Color(color.red, color.green, color.blue, alpha)
    } else if (values.length === 3) {
        // Color(0.761, 0.6, 0.6)
        let r = strToNum(values[0])
        let g = strToNum(values[1])
        let b = strToNum(values[2])
        if (
            r === undefined ||
            g === undefined ||
            b === undefined ||
            r < 0 ||
            r > 1 ||
            g < 0 ||
            g > 1 ||
            b < 0 ||
            b > 1
        ) {
            return undefined
        }
        return new Color(r, g, b, 1)
    } else if (values.length === 4) {
        // Color(0.761, 0.6, 0.6, 1.0)
        let r = strToNum(values[0])
        let g = strToNum(values[1])
        let b = strToNum(values[2])
        let a = strToNum(values[3])
        if (
            r === undefined ||
            g === undefined ||
            b === undefined ||
            a === undefined ||
            r < 0 ||
            r > 1 ||
            g < 0 ||
            g > 1 ||
            b < 0 ||
            b > 1 ||
            a < 0 ||
            a > 1
        ) {
            return undefined
        }
        return new Color(r, g, b, a)
    }
    return undefined
}

function getColorLabel(values: string[], color: Color): string | undefined {
    let label: string | undefined = undefined
    if (/^["']#?[0-9a-fA-F]{6,8}["']$/.test(values[0])) {
        const r = Math.round(color.red * 255)
        const g = Math.round(color.green * 255)
        const b = Math.round(color.blue * 255)
        const a = Math.round(color.alpha * 255)
        let quote = values[0][0]
        let sharp = values[0][1] === "#" ? "#" : ""
        if (values[0].length > 9 || color.alpha !== 1) {
            label = `Color(${quote}${sharp}${a.toString(16).padStart(2, "0")}${r
                .toString(16)
                .padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
                .toString(16)
                .padStart(2, "0")}${quote})`
        } else {
            label = `Color(${quote}${sharp}${r.toString(16).padStart(2, "0")}${g
                .toString(16)
                .padStart(2, "0")}${b.toString(16).padStart(2, "0")}${quote})`
        }
    } else if (
        values[0][0] === "'" ||
        values[0][0] === '"' ||
        values[0][0] === "C"
    ) {
        const originColor = getColor(values)
        const isSame =
            originColor &&
            Math.abs(originColor.red - color.red) < 0.001 &&
            Math.abs(originColor.green - color.green) < 0.001 &&
            Math.abs(originColor.blue - color.blue) < 0.001
        if (isSame) {
            if (values.length === 2 || color.alpha !== 1) {
                label = `Color(${values[0]}, ${Number(color.alpha.toFixed(3))})`
            } else {
                label = `Color(${values[0]})`
            }
        }
    } else if (
        values[0][0] !== "C" &&
        values[0] !== "" &&
        values.length === 1
    ) {
        const num =
            (Math.round(color.red * 255) << 24) |
            (Math.round(color.green * 255) << 16) |
            (Math.round(color.blue * 255) << 8) |
            Math.round(color.alpha * 255)
        label = `Color(${num})`
    } else {
        const isDiv255 =
            values.length >= 3 &&
            values.slice(0, 3).some((v) => /\/\s*255\s*$/.test(v))
        if (isDiv255) {
            const r = Math.round(color.red * 255)
            const g = Math.round(color.green * 255)
            const b = Math.round(color.blue * 255)
            const a = Number(color.alpha.toFixed(3))
            if (values.length === 4 || color.alpha !== 1) {
                label = `Color(${r}.0 / 255, ${g}.0 / 255, ${b}.0 / 255, ${a})`
            } else {
                label = `Color(${r}.0 / 255, ${g}.0 / 255, ${b}.0 / 255)`
            }
            return label
        }
        const r = Number(color.red.toFixed(3))
        const g = Number(color.green.toFixed(3))
        const b = Number(color.blue.toFixed(3))
        const a = Number(color.alpha.toFixed(3))
        if (values.length === 4 || color.alpha !== 1) {
            label = `Color(${r}, ${g}, ${b}, ${a})`
        } else {
            label = `Color(${r}, ${g}, ${b})`
        }
    }
    return label
}

export { getColor, getColorLabel }
