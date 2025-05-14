import { Color } from "vscode"
import { hexToNum } from "./strToNum"

export function getColorFromHex(hex: string): Color | undefined {
    const match = hex.match(/['"]([^'"]+)['"]/)
    if (match) {
        hex = match[1]
    }
    // Color("#ffb2d90a")  Color("ffb2d90a")  ARGB format
    if (hex.startsWith("#")) {
        hex = hex.substring(1)
    }
    if (hex.length === 8) {
        let num = hexToNum(hex)
        if (
            num !== undefined &&
            Number.isInteger(num) &&
            num >= 0 &&
            num <= 0xffffffff
        ) {
            let a = ((num >> 24) & 0xff) / 255
            let r = ((num >> 16) & 0xff) / 255
            let g = ((num >> 8) & 0xff) / 255
            let b = (num & 0xff) / 255
            return new Color(r, g, b, a)
        }
    }

    // Color("#b2d90a") Color("b2d90a")  RGB format
    if (hex.length === 6) {
        let num = hexToNum(hex)
        if (
            num !== undefined &&
            Number.isInteger(num) &&
            num >= 0 &&
            num <= 0xffffff
        ) {
            let r = ((num >> 16) & 0xff) / 255
            let g = ((num >> 8) & 0xff) / 255
            let b = (num & 0xff) / 255
            return new Color(r, g, b, 1)
        }
    }
    return undefined
}
