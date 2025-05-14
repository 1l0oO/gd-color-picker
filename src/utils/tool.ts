import { readFileSync, writeFileSync } from "fs"
import { basename, dirname, extname, join } from "path"

enum workType {
    "namedColor",
    "versionMap"
}

function formatNumber(value: number): string {
    const str = value.toFixed(6)
    const num = Number(str)
    return num.toString()
}

function convertColorFormat(input: string): string {
    const regex = /\{\s*"([^"]+)"\s*,\s*Color::hex\(0x([0-9A-Fa-f]+)\)\s*\}/g
    const matches = []
    let match: RegExpExecArray | null
    while ((match = regex.exec(input)) !== null) {
        const colorName = match[1]
        const hexValue = match[2]

        const r = formatNumber(parseInt(hexValue.substring(0, 2), 16) / 255)
        const g = formatNumber(parseInt(hexValue.substring(2, 4), 16) / 255)
        const b = formatNumber(parseInt(hexValue.substring(4, 6), 16) / 255)
        const a = formatNumber(parseInt(hexValue.substring(6, 8), 16) / 255)

        matches.push(
            `["${colorName}", new vscode.Color(${r}, ${g}, ${b}, ${a})]`
        )
    }

    return `[${matches.join(",\n")}]`
}

function getRenameMap(input: string): string {
    const dataRegex =
        /const char \*RenamesMap3To4::color_renames\[\]\[2\] = \{([\s\S]*?)\{ nullptr, nullptr \},\s*\};/
    const data = input.match(dataRegex)
    if (!data) {
        console.log("color_renames array not found!")
        process.exit(1)
    }
    const array = data[1]
    const colorPairs: [string, string][] = []
    const lineRegex = /\{\s*"([^"]+)",\s*"([^"]+)"\s*\}/g
    let lineMatch: RegExpExecArray | null
    while ((lineMatch = lineRegex.exec(array))) {
        colorPairs.push([lineMatch[1], lineMatch[2]])
    }
    return JSON.stringify(colorPairs, null, 1)
}

function processFile(filePath: string, arg:workType): void {
    const fileContent = readFileSync(filePath, "utf-8")
    let output
    if (arg === workType.namedColor) {
        output = convertColorFormat(fileContent)
    } else {
        output = getRenameMap(fileContent)
    }

    const dir = dirname(filePath)
    const ext = extname(filePath)
    const outputFileName = basename(filePath, ext)
    const outputFilePath = join(dir, outputFileName + ".output")
    writeFileSync(outputFilePath, output, "utf-8")
}

// const filePath = "./src/tool/color_names.inc"
const filePath = "./src/tool/renames_map_3_to_4.cpp"
processFile(filePath, workType.versionMap)