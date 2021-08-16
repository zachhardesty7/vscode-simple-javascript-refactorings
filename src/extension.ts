import * as vscode from "vscode"
import { JSXBraces, subscribeToDocumentChanges } from "./JSXBraces"

/**
 * @param context - collection of utilities private to an extension.
 */
export function activate(context: vscode.ExtensionContext): void {
  const jsxBraces = vscode.languages.createDiagnosticCollection("jsxBraces")
  context.subscriptions.push(jsxBraces)

  subscribeToDocumentChanges(context, jsxBraces)

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ["javascriptreact", "typescriptreact"],
      new JSXBraces(),
      {
        providedCodeActionKinds: JSXBraces.providedCodeActionKinds,
      }
    )
  )
}
