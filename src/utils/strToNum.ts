function strToNum(str: string): number | undefined {
    if (!/^[\d\s\.\+\-\*\/\(\)]+$/.test(str)) {
        return undefined
    }
    const num = eval(str)
    if (typeof num === "number" && !isNaN(num)) {
        return num
    }
    return undefined
}

function hexToNum(hex: string): number | undefined {
    let num: number | undefined = parseInt(hex, 16)
    if (isNaN(num)) {
        num = undefined
    }
    return num
}

export { strToNum, hexToNum }
