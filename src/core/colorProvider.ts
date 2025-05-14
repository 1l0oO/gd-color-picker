import {
    Range,
    Color,
    TextDocument,
    Position,
    TextDocumentContentChangeEvent,
    CancellationToken,
    ColorInformation,
    ColorPresentation,
} from "vscode"
import { getColor, getColorLabel } from "./getColor"
import { getColor8, getColor8Label } from "./getColor8"
import { getColorN, getColorNLabel } from "./getColorN"

type LineColorCache = {
    [lineNumber: number]: {
        range: Range
        color: Color
    }[]
}

enum ColorType {
    Color = "Color",
    Color8 = "Color8",
    ColorN = "ColorN",
}

let documentLineCache = new WeakMap<TextDocument, LineColorCache>()

function clearCache() {
    documentLineCache = new WeakMap<TextDocument, LineColorCache>()
}

function parseColorValue(type: string, args: string): Color | undefined {
    const values = args.split(",")
    if (type === ColorType.Color) {
        return getColor(values)
    } else if (type === ColorType.Color8) {
        return getColor8(values)
    } else if (type === ColorType.ColorN) {
        return getColorN(values)
    }
    return undefined
}

function parseLine(
    document: TextDocument,
    lineNumbers: number[]
): {
    lineNumber: number
    colors: { range: Range; color: Color }[]
}[] {
    const results: {
        lineNumber: number
        colors: { range: Range; color: Color }[]
    }[] = []
    const colorRegex = /\b(Color|Color8|ColorN)\s*\(([^)]*)\)/g
    const currentLineNum = document.lineCount
    for (const lineNumber of lineNumbers) {
        if (lineNumber < currentLineNum) {
            const line = document.lineAt(lineNumber)
            const matches = [...line.text.matchAll(colorRegex)]
            const colorsInLine: { range: Range; color: Color }[] = []

            for (const match of matches) {
                const [fullMatch, type, args] = match
                const startIdx = match.index!
                const endIdx = startIdx + fullMatch.length

                const start = new Position(lineNumber, startIdx)
                const end = new Position(lineNumber, endIdx)
                const range = new Range(start, end)

                const color = parseColorValue(type, args)
                if (color) {
                    colorsInLine.push({ range, color })
                }
            }
            results.push({ lineNumber, colors: colorsInLine })
        } else {
            results.push({ lineNumber, colors: [] })
        }
    }

    return results
}

function updateLineCache(
    document: TextDocument,
    changes: readonly TextDocumentContentChangeEvent[]
) {
    const cache = documentLineCache.get(document) || {}
    const lineCount = document.lineCount

    const affectedLines = new Set<number>()

    for (const change of changes) {
        const { range } = change
        const startLine = range.start.line
        const endLine = range.end.line

        if (change.text.includes("\n")) {
            const insertedLines = change.text.split("\n").length - 1
            for (let i = lineCount - 1; i > endLine; i--) {
                let previousLine = i - insertedLines
                if (cache[previousLine]) {
                    cache[i] = cache[previousLine].map((item) => ({
                        range: new Range(
                            new Position(i, item.range.start.character),
                            new Position(i, item.range.end.character)
                        ),
                        color: item.color,
                    }))
                }
            }
        } else if (startLine < endLine) {
            const deletedLines = endLine - startLine
            for (let i = endLine; i < lineCount; i++) {
                let previousLine = i + deletedLines
                if (cache[previousLine]) {
                    cache[i] = cache[previousLine].map((item) => ({
                        range: new Range(
                            new Position(i, item.range.start.character),
                            new Position(i, item.range.end.character)
                        ),
                        color: item.color,
                    }))
                }
            }
        }

        const modifiedRangeEnd = change.text.includes("\n")
            ? startLine + change.text.split("\n").length - 1
            : endLine

        for (let i = startLine; i <= modifiedRangeEnd; i++) {
            affectedLines.add(i)
        }
    }

    const linesToParse = Array.from(affectedLines)
    if (linesToParse.length > 0) {
        const parsedResults = parseLine(document, linesToParse)
        for (const result of parsedResults) {
            cache[result.lineNumber] = result.colors
        }
    }

    documentLineCache.set(document, cache)
}

function provideDocumentColors(
    document: TextDocument,
    token: CancellationToken,
    useCache: boolean
): ColorInformation[] {
    const result: ColorInformation[] = []
    const callId = Math.random().toString(36).slice(2, 8)
    if (useCache) {
        let cache = documentLineCache.get(document)
        if (!cache) {
            const allLines = Array.from(
                { length: document.lineCount },
                (_, i) => i
            )
            const parsedResults = parseLine(document, allLines)
            cache = {}
            parsedResults.forEach(({ lineNumber, colors }) => {
                cache![lineNumber] = colors
            })
            documentLineCache.set(document, cache!)
        }

        Object.entries(cache).forEach(([lineNumber, items]) => {
            items.forEach((item) => {
                result.push(new ColorInformation(item.range, item.color))
            })
        })
    } else {
        const allLines = Array.from({ length: document.lineCount }, (_, i) => i)
        const parsedResults = parseLine(document, allLines)
        parsedResults.forEach(({ colors }) => {
            colors.forEach((colorInfo) => {
                result.push(
                    new ColorInformation(colorInfo.range, colorInfo.color)
                )
            })
        })
    }

    return result
}

function provideColorPresentations(
    color: Color,
    context: { document: TextDocument; range: Range },
    token: CancellationToken
): ColorPresentation[] {
    let label: string | undefined
    const originalText = context.document.getText(context.range)
    const colorRegex = /(Color|Color8|ColorN)\s*\(([^)]*)\)/
    const match = originalText.match(colorRegex)
    if (match === null) {
        return []
    }
    const [_, type, args] = match
    const values = args.split(",").map((s) => s.trim())
    if (type === ColorType.Color) {
        label = getColorLabel(values, color)
    } else if (type === ColorType.Color8) {
        label = getColor8Label(values, color)
    } else if (type === ColorType.ColorN) {
        label = getColorNLabel(values, color)
    }
    if (label === undefined) {
        const r = Number(color.red.toFixed(3))
        const g = Number(color.green.toFixed(3))
        const b = Number(color.blue.toFixed(3))
        const a = Number(color.alpha.toFixed(3))
        if (a !== 1) {
            label = `Color(${r}, ${g}, ${b}, ${a})`
        } else {
            label = `Color(${r}, ${g}, ${b})`
        }
    }
    return [new ColorPresentation(label)]
}

export {
    updateLineCache,
    provideDocumentColors,
    provideColorPresentations,
    documentLineCache,
    clearCache,
}
