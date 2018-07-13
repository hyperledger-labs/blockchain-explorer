# ESLint Documentation

## Install ESLint Extension in VS Code
- `shift + ctrl + x ` | `shift + cmd + x ` to open extensions within VS Code

- Search eslint

- Install ESLint by Dirk Baeumer

- Reload VS Code

## blockchain-explorer VS Code Workspace Settings
-   Open Workspace Settings for Visual Studio Code while working within ../blockchain-explorer

-   `ctrl + , ` | `cmd + , ` is shortcut to Workspace Settings

-   Add the following code to your Workspace Settings
    ```json
    {
        "editor.formatOnSave": true,
        "[javascript]": {
            "editor.formatOnSave": false
        },
        "eslint.autoFixOnSave": true,
        "eslint.alwaysShowStatus": true
    }
    ```

-   `"editor.formatOnSave"` allows code to be formatted on save

-   `"eslint.autoFixOnSave"` allows eslint to run one passthough and fix any eslint errors it can on save. (Saving again runs another passthough)

-   `"eslint.alwaysShowStatus"` allows vscode to always show eslint's status at the bottom-right of vscode

-   `"[javascript]": {
        "editor.formatOnSave": false
    }`
    allows javascript to not be formatted on save by editor as javascript formatting is covered by eslint

-   You may scroll though the "Default Workspace settings" on the left window to see descriptions of included scripts and other scripts that can be added.

## blockchain-explorer/.eslintrc.json
-   Standard airbnb setup for eslint within blockchain-explorer

## blockchain-explorer/client/.eslintrc.json
-   tailored airbnb setup for React.js usage within this folder

-   ["react/jsx-filename-extension": 0] allows jsx code to be implemented into a .js file

## ESLint documentation and configuations
-   [Configuring ESLint](https://eslint.org/docs/user-guide/configuring)

-   [ESLint rules](https://eslint.org/docs/rules)

-   [eslint-config-airbnb documentation](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb)

-   [eslint-plugin-react documentation](https://github.com/yannickcr/eslint-plugin-react/tree/master/docs)
