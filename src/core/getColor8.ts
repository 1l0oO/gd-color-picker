import { Color } from "vscode"
import { strToNum } from "../utils/strToNum"

function getColor8(values: string[]): Color | undefined {
    // Color8(255, 0, 0)
    if (values.length === 3) {
        let r = strToNum(values[0])
        let g = strToNum(values[1])
        let b = strToNum(values[2])
        if (
            r === undefined ||
            g === undefined ||
            b === undefined ||
            r < 0 ||
            r > 255 ||
            g < 0 ||
            g > 255 ||
            b < 0 ||
            b > 255
        ) {
            return undefined
        }
        return new Color(r / 255, g / 255, b / 255, 1)
    }
    if (values.length === 4) {
        // Color8(255, 0, 0, 125)
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
            r > 255 ||
            g < 0 ||
            g > 255 ||
            b < 0 ||
            b > 255 ||
            a < 0 ||
            a > 255
        ) {
            return undefined
        }
        return new Color(r / 255, g / 255, b / 255, a / 255)
    }
    return undefined
}

function getColor8Label(values: string[], color: Color): string | undefined {
    let label: string | undefined = undefined

    const r = Math.round(color.red * 255)
    const g = Math.round(color.green * 255)
    const b = Math.round(color.blue * 255)
    const a = Math.round(color.alpha * 255)
    if (values.length === 4 || a !== 255) {
        label = `Color8(${r}, ${g}, ${b}, ${a})`
    } else {
        label = `Color8(${r}, ${g}, ${b})`
    }
    return label
}

export { getColor8, getColor8Label }
