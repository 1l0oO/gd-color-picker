import { Color } from "vscode"
import { getColorFromName } from "../utils/getColorFromName"
import { strToNum } from "../utils/strToNum"

function getColorN(values: string[]): Color | undefined {
    // ColorN("red")
    // ColorN(Color.red)
    // ColorN(Color.RED)
    if (values.length === 1) {
        return getColorFromName(values[0])
    } else if (values.length === 2) {
        // ColorN("red", 0.8)
        // ColorN(Color.red, 0.8)
        // ColorN(Color.RED, 0.8)
        let color = getColorFromName(values[0])
        if (color === undefined) {
            return undefined
        }
        let alpha = strToNum(values[1])
        if (alpha === undefined || alpha < 0 || alpha > 1) {
            return undefined
        }
        return new Color(color.red, color.green, color.blue, alpha)
    }
    return undefined
}

function getColorNLabel(values: string[], color: Color): string | undefined {
    let label: string | undefined = undefined

    const originColorName = values[0]
    const originColor = getColorN(values)
    const r = Number(color.red.toFixed(3))
    const g = Number(color.green.toFixed(3))
    const b = Number(color.blue.toFixed(3))
    let isSame: boolean = false
    if (originColor !== undefined) {
        isSame =
            originColor &&
            Math.abs(originColor.red - color.red) < 0.001 &&
            Math.abs(originColor.green - color.green) < 0.001 &&
            Math.abs(originColor.blue - color.blue) < 0.001
    }

    if (isSame) {
        if (values.length === 2 || color.alpha !== 1) {
            label = `ColorN(${originColorName}, ${Number(
                color.alpha.toFixed(3)
            )})`
        } else {
            label = `ColorN(${originColorName})`
        }
    }

    return label
}

export { getColorN, getColorNLabel }
