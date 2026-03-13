# Demo Reset Instructions

## To Reset the Demo Timer

If you need to reset the demo timer (for testing or giving multiple demos), follow these steps:

### Method 1: Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Type: `localStorage.removeItem('demoStartTime')`
4. Press Enter
5. Refresh the page

### Method 2: Browser Storage
1. Open browser developer tools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Find "Local Storage" in the left sidebar
4. Click on your domain
5. Find the `demoStartTime` key and delete it
6. Refresh the page

### Method 3: Incognito/Private Mode
- Simply open the app in an incognito/private browser window
- Each incognito session starts fresh

## Current Settings
- **Demo Duration**: 3 hours
- **Timer Persists**: Across page refreshes and browser restarts
- **Contact Number**: 0746 836 004
- **Warning Levels**: 
  - Last hour: Amber
  - Last 30 minutes: Red with pulsing

## For Production
- Remove the demo timer components
- Restore authentication (see RESTORE_AUTH_INSTRUCTIONS.md)