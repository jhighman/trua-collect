# Browser Tools MCP Setup Guide

## Prerequisites
- NodeJS installed on your machine
- Google Chrome or a Chromium-based Browser
- Cursor IDE installed
- Claude 3.5 Sonnet (or later) selected as your model in Cursor

## Installation Steps

### 1. Install Chrome Extension
1. Download and install the BrowserTools Chrome extension:
   - Option A: Install from Chrome Web Store (if available)
   - Option B: Download latest .zip from [releases](https://github.com/AgentDeskAI/browser-tools-mcp/releases)
   - Option C: Clone and load unpacked:
     ```bash
     git clone https://github.com/AgentDeskAI/browser-tools-mcp.git
     ```
2. Open Chrome's Extension Manager (`chrome://extensions/`)
3. Enable "Developer Mode"
4. Click "Load unpacked"
5. Navigate to and select the downloaded extension folder

### 2. Configure MCP in Cursor
1. Create global MCP configuration:
   - Path: `~/.cursor/mcp.json`
   - Navigate to: Cursor > Settings > Cursor > (full settings here) > MCP
   - Click "+ Add new global MCP server"
2. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "browser-tools": {
         "command": "npx",
         "args": ["@agentdeskai/browser-tools-mcp@1.2.0"]
       }
     }
   }
   ```
3. Restart Cursor to apply changes

## Starting the Server

### Important Note
You need to start the browser-tools-server manually each time you want to use the browser tools. This server acts as middleware between Chrome and the MCP server.

### Steps to Start
1. Open a new terminal
2. Run the browser-tools-server:
   ```bash
   npx @agentdeskai/browser-tools-server@latest
   ```
3. The server will start on port 3025 (default)
4. You should see "Browser Tools Server Started" in the terminal

## Verifying Setup
1. Open Chrome DevTools (F12 or right-click -> Inspect)
2. Look for "BrowserToolsMCP" panel in DevTools
3. You should see "Connected to server" in the panel
4. In Cursor, the browser-tools MCP should be listed as active

## Troubleshooting
If you encounter connection issues:
1. Make sure only ONE instance of Chrome DevTools panel is open
2. Quit Chrome completely (not just the window)
3. Restart the browser-tools-server
4. Restart Cursor if needed

## Available Tools
Once connected, you can use the following browser tools in Cursor:
- Monitor browser console output
- Capture network traffic
- Take screenshots
- Analyze selected elements
- Run accessibility audits
- Run performance audits
- Run SEO audits
- Run best practices audits
- Run NextJS-specific audits

## Usage
To use the tools in Cursor:
1. Open any file
2. Use Command Palette (Cmd/Ctrl + Shift + P)
3. Type "browser" to see available commands
4. Select the desired tool

## Note
Remember: The browser-tools-server needs to be manually started each time you want to use these tools. The MCP server will be started automatically by Cursor based on your configuration. 