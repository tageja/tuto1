# Errors and Fixes Log

## Error & Fix #1: SplashScreen Video Component Issues (December 30, 2024)

### Errors Encountered:
1. **Video Component Undefined Error**:
   ```
   TypeError: videoRef.current.playAsync is not a function (it is undefined)
   ```

2. **SplashScreen Component Undefined**:
   ```
   Element type is invalid: expected a string (for built-in components) or a class/function 
   (for composite components) but got: undefined. You likely forgot to export your component 
   from the file it's defined in, or you might have mixed up default and named imports.
   ```

### Root Causes:
1. SplashScreen component was defined in App.tsx without proper export
2. Attempted to use new `expo-video` package which wasn't fully compatible
3. Video component implementation was mixed between old and new APIs
4. Component structure was too tightly coupled in a single file

### Solution Applied:
1. **Component Separation**:
   - Moved SplashScreen to its own file: `src/screens/SplashScreen.tsx`
   - Properly exported as named export
   - Improved component isolation and maintainability

2. **Video Implementation**:
   - Reverted back to `expo-av` package (more stable)
   - Correctly implemented video playback status handling
   - Used proper event handlers for video completion

3. **Code Structure Changes**:
   ```typescript
   // src/screens/SplashScreen.tsx
   export const SplashScreen: React.FC<SplashScreenProps> = ({ onVideoEnd }) => {
     return (
       <View style={styles.container}>
         <Video
           source={require('../../assets/videos/tuto-intro.mp4')}
           style={styles.video}
           resizeMode="contain"
           shouldPlay
           isLooping={false}
           onPlaybackStatusUpdate={(status) => {
             if (status.isLoaded && status.didJustFinish) {
               onVideoEnd();
             }
           }}
         />
       </View>
     );
   };
   ```

   ```typescript
   // App.tsx
   export default function App() {
     const [showSplash, setShowSplash] = useState(true);
     return (
       <LanguageProvider>
         {showSplash ? (
           <SplashScreen onVideoEnd={() => setShowSplash(false)} />
         ) : (
           <AppNavigator />
         )}
       </LanguageProvider>
     );
   }
   ```

### Known Limitations:
1. Still using deprecated `expo-av` package
   - Will need to migrate to `expo-video` in future
   - Current warning: "expo-av has been deprecated and will be removed in SDK 54"

### Future Considerations:
1. Plan migration to `expo-video` when it becomes more stable
2. Consider adding loading states and error boundaries
3. Implement proper video playback error handling

### Related Files Modified:
1. `App.tsx`
2. `src/screens/SplashScreen.tsx` (newly created)
3. `package.json` (dependencies updated)

### Dependencies Changes:
```diff
- "expo-video": "~2.2.2"
+ "expo-av": "^15.1.7"
```