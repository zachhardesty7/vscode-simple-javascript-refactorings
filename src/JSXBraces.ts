import * as vscode from "vscode"

/** @see https://regex101.com/r/jQ8V8m/0 */
const REGEX =
  /(?<fullMatch>(?<prop>\w+\s*=\s*)({)(?<value>(["'`])\w*(["'`]))(}))/

/** code that is used to associate diagnostic entries with code actions. */
export const UNNECESSARY_BRACES_MENTION = "unnecessary_braces_mention"

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
    const matchRegex = lineOfText.text.match(REGEX)

    if (matchRegex && matchRegex.index && matchRegex.groups) {
      // create range that represents, where in the document the word is
      const start = lineOfText.range.start.with({
        character: matchRegex.index + matchRegex.groups.prop.length,
      })

      const BRACES_LENGTH = 2
      const range = new vscode.Range(
        start,
        start.translate(0, matchRegex.groups.value.length + BRACES_LENGTH)
      )

      const diagnostic = new vscode.Diagnostic(
        range,
        "curly braces are unnecessary here",
        vscode.DiagnosticSeverity.Warning
      )

      diagnostic.code = UNNECESSARY_BRACES_MENTION
      diagnostics.push(diagnostic)
    }
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
    vscode.workspace.onDidChangeTextDocument((e) =>
      refreshDiagnostics(e.document, diagnosticCollection)
    ),
    vscode.workspace.onDidCloseTextDocument((doc) =>
      diagnosticCollection.delete(doc.uri)
    )
  )
}

/**
 * Provides code actions corresponding to diagnostic problems.
 */
export class JSXBraces implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ]

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const createCommandCodeAction = (
      diagnostic: vscode.Diagnostic
    ): vscode.CodeAction => {
      /** TODO: don't repeat work, use contents of diagnostic */
      const line = document.lineAt(range.start.line)
      const matchRegex = line.text.match(REGEX)

      const action = new vscode.CodeAction(
        "remove braces",
        vscode.CodeActionKind.QuickFix
      )
      action.edit = new vscode.WorkspaceEdit()

      if (matchRegex && matchRegex.groups) {
        const startPos = line.range.start.with({ character: matchRegex.index })
        action.edit.replace(
          document.uri,
          new vscode.Range(
            startPos,
            startPos.translate(0, matchRegex.groups.fullMatch.length)
          ),
          `${matchRegex.groups.prop}${matchRegex.groups.value}`
        )
      }

      action.diagnostics = [diagnostic]
      action.isPreferred = true

      return action
    }

    // for each diagnostic entry that has the matching `code`, create a code action command
    return context.diagnostics
      .filter((diagnostic) => diagnostic.code === UNNECESSARY_BRACES_MENTION)
      .map((diagnostic) => createCommandCodeAction(diagnostic))
  }
}
