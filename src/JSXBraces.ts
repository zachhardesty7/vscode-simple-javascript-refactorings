import * as vscode from "vscode"

/** @see https://regex101.com/r/VKl0Bl/latest */
const REGEX =
  /(?<fullMatch>(?<prop>\w+\s*=\s*)({)(?<quote1>["'`])(?<string>[^"$'`{}]*)(?<quote2>["'`])(}))/

/** code that is used to associate diagnostic entries with code actions. */
export const UNNECESSARY_BRACES_MENTION = "unnecessary_braces_mention"

/**
 * @param diagnostics - collection to add created diagnostic to
 * @param lineOfText - current line in the document to check
 */
export function addJSXBracesDiagnostic(
  diagnostics: vscode.Diagnostic[],
  lineOfText: vscode.TextLine
): void {
  const matchRegex = lineOfText.text.match(REGEX)

  if (matchRegex && matchRegex.index && matchRegex.groups) {
    // create range that represents, where in the document the word is
    const start = lineOfText.range.start.with({
      character: matchRegex.index + matchRegex.groups.prop.length,
    })

    const BRACES_LENGTH = 2
    const range = new vscode.Range(
      start,
      start.translate(
        0,
        matchRegex.groups.quote1.length +
          matchRegex.groups.string.length +
          matchRegex.groups.quote2.length +
          BRACES_LENGTH
      )
    )

    const diagnostic = new vscode.Diagnostic(
      range,
      "curly braces are unnecessary here",
      vscode.DiagnosticSeverity.Hint
    )

    diagnostic.code = UNNECESSARY_BRACES_MENTION
    diagnostics.push(diagnostic)
  }
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
        "remove curly braces",
        vscode.CodeActionKind.QuickFix
      )
      action.edit = new vscode.WorkspaceEdit()

      if (matchRegex && matchRegex.groups) {
        const startPos = line.range.start.with({ character: matchRegex.index })
        /** convert ` to " to prevent invalid JSX */
        const quoteChar =
          matchRegex.groups.quote1 === "`" ? '"' : matchRegex.groups.quote1
        action.edit.replace(
          document.uri,
          new vscode.Range(
            startPos,
            startPos.translate(0, matchRegex.groups.fullMatch.length)
          ),
          `${matchRegex.groups.prop}${quoteChar}${matchRegex.groups.string}${quoteChar}`
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
