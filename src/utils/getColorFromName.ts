import { renamesMap } from "./renamesMap"
import { NamedColor } from "./namedColor"
import { Color } from "vscode"

function isLowerCase(char: string): boolean {
    const code = char.charCodeAt(0)
    return code >= 97 && code <= 122
}

export function getColorFromName(name: string): Color | undefined {
    const match =
        name.match(/\s*Color\.([a-zA-Z0-9_]+)\s*/) ||
        name.match(/['"]([a-zA-Z0-9_]+)['"]/)
    if (match) {
        name = match[1]
    }
    if (isLowerCase(name)) {
        let rename = renamesMap.get(name)
        if (rename === undefined) {
            return undefined
        } else {
            name = rename
        }
    }
    return NamedColor.get(name)
}
