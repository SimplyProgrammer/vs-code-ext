import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getNonce } from "../app@utils/crypto";
import { getUri } from "../app@utils/urls";

export class ComponentStatePanel {
	public static readonly WEBVIEW_DIR = "webview-ui";

	public static currentPanel: ComponentStatePanel | undefined;

	private readonly panel: WebviewPanel;
	private disposables: Disposable[] = [];

	/**
	 * The ComponentStatePanel class private constructor (called only from the render method).
	 *
	 * @param panel A reference to the webview panel
	 * @param extensionUri The URI of the directory containing the extension
	 */
	private constructor(panel: WebviewPanel, extensionUri: Uri) {
		this.panel = panel;

		// Set an event listener to listen for when the panel is disposed (i.e. when the user closes
		// the panel or when the panel is closed programmatically)
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

		// Set the HTML content for the webview panel
		this.panel.webview.html = this.getWebviewContent(this.panel.webview, extensionUri);

		// Set an event listener to listen for messages passed from the webview context
		this.setWebviewMessageListener(this.panel.webview);
	}

	/**
	 * Renders the current webview panel if it exists otherwise a new webview panel
	 * will be created and displayed.
	 *
	 * @param extensionUri The URI of the directory containing the extension.
	 */
	public static render(extensionUri: Uri) {
		if (ComponentStatePanel.currentPanel) {
			// If the webview panel already exists reveal it
			ComponentStatePanel.currentPanel.panel.reveal(ViewColumn.One);
			return;
		}

		// If a webview panel does not already exist create and show a new one
		const panel = window.createWebviewPanel(
			// Panel view type
			"componentState",
			// Panel title
			"React Component State",
			// The editor column the panel should be displayed in
			ViewColumn.One,
			// Extra panel configurations
			{
				// Enable JavaScript in the webview
				enableScripts: true,
				// Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
				localResourceRoots: [Uri.joinPath(extensionUri, "out"), Uri.joinPath(extensionUri, "webview-ui/build")],
			}
		);

		ComponentStatePanel.currentPanel = new ComponentStatePanel(panel, extensionUri);
	}

	/**
	 * Cleans up and disposes of webview resources when the webview panel is closed.
	 */
	public dispose() {
		ComponentStatePanel.currentPanel = undefined;

		// Dispose of the current webview panel
		this.panel.dispose();

		// Dispose of all disposables (i.e. commands) for the current webview panel
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}

	/**
	 * Defines and returns the HTML that should be rendered within the webview panel.
	 *
	 * @remarks This is also the place where references to the React webview build files
	 * are created and inserted into the webview HTML.
	 *
	 * @param webview A reference to the extension webview
	 * @param extensionUri The URI of the directory containing the extension
	 * @returns A template string literal containing the HTML that should be
	 * rendered within the webview panel
	 */
	private getWebviewContent(webview: Webview, extensionUri: Uri) {
		// The CSS file from the React build output
		const stylesUri = getUri(webview, extensionUri, [ComponentStatePanel.WEBVIEW_DIR, "build", "assets", "index.css"]);
		// The JS file from the React build output
		const scriptUri = getUri(webview, extensionUri, [ComponentStatePanel.WEBVIEW_DIR, "build", "assets", "index.js"]);

		const nonce = getNonce();

		return /*html*/ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<link rel="stylesheet" type="text/css" href="${stylesUri}">
				<title>React Component State</title>
			</head>
			<body>
				<div id="root"></div>
				<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
				<!-- <p>${scriptUri}</p>
				<p>${nonce}</p> -->
			</body>
			</html>
		`;
	}

	/**
	 * Sets up an event listener to listen for messages passed from the webview context and
	 * executes code based on the message that is recieved.
	 *
	 * @param webview A reference to the extension webview
	 * @param context A reference to the extension context
	 */
	private setWebviewMessageListener(webview: Webview) {
		webview.onDidReceiveMessage(
			(message) => {
				const command = message.command;
				const text = message.text;

				switch (command) {
					case "hello":
						window.showInformationMessage(text);
						return;

				}
			},
			undefined,
			this.disposables
		);
	}
}