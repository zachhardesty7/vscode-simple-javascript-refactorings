[![version](https://img.shields.io/vscode-marketplace/v/zachhardesty.vscode-simple-javascript-refactorings.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=zachhardesty.vscode-simple-javascript-refactorings)
[![last updated](https://img.shields.io/visual-studio-marketplace/last-updated/zachhardesty.jsdoc-comment-toggler?color=0fCC10&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=zachhardesty.vscode-simple-javascript-refactorings)
[![downloads](https://img.shields.io/vscode-marketplace/d/zachhardesty.vscode-simple-javascript-refactorings.svg?color=0fCC10&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=zachhardesty.vscode-simple-javascript-refactorings)
[![license](https://img.shields.io/github/license/zachhardesty7/vscode-simple-javascript-refactorings.svg?color=0fCC10&style=flat-square)](https://github.com/zachhardesty7/vscode-simple-javascript-refactorings/blob/master/LICENSE)

# simple javascript refactorings

extension that provides lightweight, useful code actions to improve your code

## Features

- JS(X)/TS(X)
  - remove curly braces, quotes, & `$` from simple unnecessary template strings (e.g. `` prop={`${STR_CONST}`} `` -> `prop={STR_CONST}`)
- JSX/TSX
  - remove unnecessary braces from simple string props (e.g. `` prop={`string`} `` -> `prop="string"`)

## Usage

- code action (diagnostics)

## Extension Settings

N/A for now, but open to tweaking based on most common usages

## TODO

- [ ] write tests
- [ ] evaluate making this a TypeScript Language Service Plugin ([see example plugin](https://github.com/tusaeff/vscode-typescript-destructure-plugin)) to leverage ASTs
- [ ] try making an "auto" refactor mode for some code actions
- [ ] add more refactorings

## Reporting issues

report any issues on the github
[issues page](https://github.com/zachhardesty7/vscode-simple-javascript-refactorings/issues), and please
provide as much detail as possible!

## License

This project is licensed under the MIT License - see the [LICENSE file](LICENSE) for details
