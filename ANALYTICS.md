# Analytics Integration

## Overview
The 15 Puzzle game now includes comprehensive analytics tracking using the `js-analytics-bridge` library.

## What's Being Tracked

### Session Tracking
- **Game ID**: `15_puzzle_game`
- **Session ID**: Unique identifier generated when game starts
- **Timestamp**: When analytics events occur

### Game Events

#### 1. Game Start
- Tracked when player clicks "Play" and countdown completes
- Creates a new level entry with unique ID

#### 2. Player Moves
- Every tile move is tracked with timestamp
- Allows analysis of player solving patterns
- Tracks total move count

#### 3. Game Completion
- Success status (always true when puzzle solved)
- Total time taken (milliseconds)
- Total moves
- XP earned (calculated as: `1000 - (moves * 10)`)

#### 4. Score Submission
- Player nickname
- Final analytics report submitted when "Save" is clicked

## Analytics Data Structure

```javascript
{
  "gameId": "15_puzzle_game",
  "name": "session_123456789",
  "sessionId": "auto-generated",
  "timestamp": "2026-03-16T...",
  "xpEarnedTotal": 850,
  "rawData": [
    { "key": "move_1", "value": "1234567890" },
    { "key": "move_2", "value": "1234567891" },
    { "key": "total_moves", "value": "42" },
    { "key": "completion_time", "value": "02:15" }
  ],
  "diagnostics": {
    "levels": [
      {
        "levelId": "puzzle_game_1234567890",
        "successful": true,
        "timeTaken": 135000,
        "xpEarned": 850,
        "tasks": []
      }
    ]
  }
}
```

## Where Analytics Are Sent

The analytics manager attempts to send data to multiple destinations:

1. **React Native WebView** (`window.ReactNativeWebView.postMessage`)
2. **Custom Bridge** (`window.myJsAnalytics.trackGameSession`)
3. **Parent Window** (`window.parent.postMessage`)
4. **Console Fallback** (for development/debugging)

If delivery fails, data is queued in `localStorage` and will be sent when connection is restored.

## Viewing Analytics

### In Browser Console
Open Developer Tools and check the console for:
- `[Game] Analytics initialized`
- `[Game] Analytics report submitted`
- Full payload logged if no bridge is available

### In React Native App
Analytics will be automatically received via `ReactNativeWebView.postMessage()`

### Testing Locally
You can access the current analytics data:
```javascript
console.log(window.analytics.getReportData());
```

## Privacy & Data
- No personal information is collected
- Only game performance metrics are tracked
- All data is anonymous (unless player provides nickname)
- Data can be queued locally until network is available

## Building Analytics Bridge

To rebuild the analytics library:
```bash
cd js-analytics-bridge
npm install
npm run build
```

This creates:
- `dist/analytics-bridge.js` - Standard build
- `dist/analytics-bridge.min.js` - Minified build
- `dist/analytics-bridge.esm.js` - ES Module build
