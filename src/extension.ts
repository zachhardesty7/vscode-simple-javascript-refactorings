import * as vscode from "vscode"
import { JSXBraces, addJSXBracesDiagnostic } from "./JSXBraces"
import { TemplateString, addTemplateStringDiagnostic } from "./templateString"

/**
 * analyzes the text document for problems
 *
 * @param doc - text document to analyze
 * @param diagnosticCollection - container that manages a set of diagnostics
 */
export function refreshDiagnostics(
  doc: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection
): void {
  const diagnostics: vscode.Diagnostic[] = []

  for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex += 1) {
    const lineOfText = doc.lineAt(lineIndex)
    addJSXBracesDiagnostic(diagnostics, lineOfText)
    addTemplateStringDiagnostic(diagnostics, lineOfText)
  }

  diagnosticCollection.set(doc.uri, diagnostics)
}

/**
 * @param context - collection of utilities private to an extension
 * @param diagnosticCollection - container that manages a set of diagnostics
 */
export function subscribeToDocumentChanges(
  context: vscode.ExtensionContext,
  diagnosticCollection: vscode.DiagnosticCollection
): void {
  if (vscode.window.activeTextEditor) {
    refreshDiagnostics(
      vscode.window.activeTextEditor.document,
      diagnosticCollection
    )
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        refreshDiagnostics(editor.document, diagnosticCollection)
      }
    }),
    vscode.workspace.onDidChangeTextDocument(({ document }) =>
      refreshDiagnostics(document, diagnosticCollection)
    ),
    vscode.workspace.onDidCloseTextDocument(({ uri }) =>
      diagnosticCollection.delete(uri)
    )
  )
}

/**
 * @param context - collection of utilities private to an extension.
 */
export function activate(context: vscode.ExtensionContext): void {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection(
    "zhDiagnosticCollection"
  )
  context.subscriptions.push(diagnosticCollection)

  subscribeToDocumentChanges(context, diagnosticCollection)

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ["javascriptreact", "typescriptreact"],
      new JSXBraces(),
      {
        providedCodeActionKinds: JSXBraces.providedCodeActionKinds,
      }
    ),
    vscode.languages.registerCodeActionsProvider(
      ["javascript", "typescript", "javascriptreact", "typescriptreact"],
      new TemplateString(),
      {
        providedCodeActionKinds: TemplateString.providedCodeActionKinds,
      }
    )
  )
}
