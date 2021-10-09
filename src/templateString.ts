import * as vscode from "vscode"

/** @see https://regex101.com/r/wBiwPn/latest */
const REGEX = /(?<fullMatch>(`\${)(?<var>\S*)(}`))/

/** code that is used to associate diagnostic entries with code actions. */
export const UNNECESSARY_TEMPLATE_MENTION = "unnecessary_template_mention"

/**
 * @param diagnostics - collection to add created diagnostic to
 * @param lineOfText - current line in the document to check
 */
export function addTemplateStringDiagnostic(
  diagnostics: vscode.Diagnostic[],
  lineOfText: vscode.TextLine
): void {
  const matchRegex = lineOfText.text.match(REGEX)

  if (matchRegex && matchRegex.index && matchRegex.groups) {
    /** represents location of the matched pattern in the document */
    const range = new vscode.Range(
      lineOfText.lineNumber,
      matchRegex.index,
      lineOfText.lineNumber,
      matchRegex.index + matchRegex.groups.fullMatch.length
    )

    const diagnostic = new vscode.Diagnostic(
      range,
      "template string is probably unnecessary here",
      vscode.DiagnosticSeverity.Hint
    )

    diagnostic.code = UNNECESSARY_TEMPLATE_MENTION
    diagnostics.push(diagnostic)
  }
}

/**
 * Provides code actions corresponding to diagnostic problems.
 */
export class TemplateString implements vscode.CodeActionProvider {
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
        'remove template quotes, braces, and "$"',
        vscode.CodeActionKind.QuickFix
      )
      action.edit = new vscode.WorkspaceEdit()

      if (matchRegex && matchRegex.index && matchRegex.groups) {
        const startPos = new vscode.Position(line.lineNumber, matchRegex.index)
        action.edit.replace(
          document.uri,
          new vscode.Range(
            startPos,
            startPos.translate(0, matchRegex.groups.fullMatch.length)
          ),
          `${matchRegex.groups.var}`
        )
      }

      action.diagnostics = [diagnostic]
      action.isPreferred = true

      return action
    }

    // for each diagnostic entry that has the matching `code`, create a code action command
    return context.diagnostics
      .filter((diagnostic) => diagnostic.code === UNNECESSARY_TEMPLATE_MENTION)
      .map((diagnostic) => createCommandCodeAction(diagnostic))
  }
}
