function strToNum(str: string): number | undefined {
    let num: number | undefined = Number(str)
    if (isNaN(num)) {
        num = undefined
    }
    return num
}

function hexToNum(hex: string): number | undefined {
    let num: number | undefined = parseInt(hex, 16)
    if (isNaN(num)) {
        num = undefined
    }
    return num
}

export { strToNum, hexToNum }
