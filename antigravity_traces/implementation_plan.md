# Implementation Plan - Auto-Send Flow from Home Screen to AI Match Tab

This plan outlines the design and implementation details for navigating from the Home screen's service cards directly to the "AI Match" chat tab and automatically triggering the matchmaking pipeline with an initial message.

## Proposed Changes

### App Navigation Configuration

#### [MODIFY] [App.tsx](file:///c:/Users/Dell/freelance_projects/Ai-Seekho/gigconnect-pk/mobile/App.tsx)
1. **Rename Routing Reference**: Change `'Search'` to `'AI Match'` in the `RootStackParamList` and register the screens/tabs as `'AI Match'` instead of `'Search'`.
2. **Update Screen Parameter Typing**: Define the route parameters for `'AI Match'` to accept an optional `initialMessage` property:
   ```typescript
   'AI Match': { category?: string; initialMessage?: string } | undefined;
   ```
3. **Tab & Stack Screen Registrations**:
   - Change the tab screen name from `"Search"` to `"AI Match"`.
   - Change the stack screen name from `"Search"` to `"AI Match"`.
   - Update tab icon check: `route.name === 'AI Match'`.

---

### Home Screen Navigation Dispatch

#### [MODIFY] [HomeScreen.tsx](file:///c:/Users/Dell/freelance_projects/Ai-Seekho/gigconnect-pk/mobile/screens/HomeScreen.tsx)
1. **Implement Conditional Navigation with Custom Initial Message**:
   Update `handleCategoryPress` to accept a custom `initialMessage` payload or check category ID to map to the correct message:
   ```typescript
   const handleCategoryPress = (category: string) => {
     let initialMessage: string | undefined = undefined;
     if (category === 'Plumber') {
       initialMessage = "Mujhe plumber chahye urgent";
     } else if (category === 'Electrician') {
       initialMessage = "Electrician ki zaroorat ha";
     } else if (category === 'AC Technician') {
       initialMessage = "AC service karwani ha";
     }

     if (initialMessage) {
       navigation.navigate('AI Match', { initialMessage });
     } else {
       navigation.navigate('AI Match', { category });
     }
   };
   ```
2. **Update Search Bar Trigger**:
   Update the search bar touchable trigger to navigate to `'AI Match'` instead of `'Search'`.

---

### AI Match / Chat Screen Detection & Auto-Send

#### [MODIFY] [SearchScreen.tsx](file:///c:/Users/Dell/freelance_projects/Ai-Seekho/gigconnect-pk/mobile/screens/SearchScreen.tsx)
1. **Declare Component Props**: Update the functional component to accept `{ route, navigation }: any`.
2. **Implement Auto-Send React Effect**:
   Add a `useEffect` listening directly to changes in `route?.params?.initialMessage`:
   ```typescript
   useEffect(() => {
     const initialMessage = route?.params?.initialMessage;
     if (initialMessage) {
       // 1. Immediately clear the param to prevent loop on refocus/re-render
       navigation.setParams({ initialMessage: undefined });
       
       // 2. Fire existing message submission handler
       handleSend(initialMessage);
     }
   }, [route?.params?.initialMessage]);
   ```

---

## Verification Plan

### Automated Type Safety Check
- Run `npx tsc --noEmit` inside `mobile/` directory to ensure perfect compilation and type safety with React Navigation.

### Manual Verification Flow
1. Open Home Screen.
2. Tap the "Plumber" service card.
3. Verify that the app transitions to the "AI Match" screen.
4. Verify that a user chat bubble with `"Mujhe plumber chahye urgent"` is appended to the chat.
5. Verify that the matching pipeline (spinner/loading steps) is immediately triggered.
6. Verify that navigating back to Home and pressing "Electrician" triggers `"Electrician ki zaroorat ha"` auto-send correctly.
7. Verify that clicking the search bar directly opens the screen empty (without trigger loop).
