import * as vscode from "vscode"
import {
    clearCache,
    documentLineCache,
    provideColorPresentations,
    provideDocumentColors,
    updateLineCache,
} from "./core/colorProvider"

export function activate(context: vscode.ExtensionContext) {
    let useCache: boolean = vscode.workspace
        .getConfiguration("gdColorPicker")
        .get("useCache", false)

    const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("gdColorPicker.useCache")) {
            useCache = vscode.workspace
                .getConfiguration("gdColorPicker")
                .get("useCache", false)
            if (!useCache) {
                clearCache()
            }
        }
    })

    const openListener = vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === "gdscript") {
            if (useCache) {
                documentLineCache.delete(document)
            }
        }
    })
    const editListener = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === "gdscript") {
            if (useCache) {
                updateLineCache(event.document, event.contentChanges)
            }
        }
    })
    const closeListener = vscode.workspace.onDidCloseTextDocument(
        (document) => {
            if (document.languageId === "gdscript") {
                if (useCache) {
                    documentLineCache.delete(document)
                }
            }
        }
    )
    const colorProvider = vscode.languages.registerColorProvider("gdscript", {
        provideDocumentColors(document, token) {
            return provideDocumentColors(document, token, useCache)
        },
        provideColorPresentations(color, context, token) {
            return provideColorPresentations(color, context, token)
        },
    })

    context.subscriptions.push(
        editListener,
        openListener,
        closeListener,
        configListener,
        colorProvider
    )
}

export function deactivate() {}
