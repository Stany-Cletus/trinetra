# LEVEL 2: UPI PIN SECURITY - Implementation Documentation

## Overview
Level 2 is a psychological thriller designed to teach UPI PIN security awareness through realistic social engineering simulations. The player must resist manipulative scammers attempting to extract their UPI PIN through three progressively aggressive tactics.

## Game Architecture

### Files Created
1. **Level2.jsx** - Main level orchestrator with substages
2. **Level2Game.jsx** - Core game mechanics and interaction logic
3. **Level2.css** - Complete styling system matching Level 1 theme

### Game Flow

```
Level1 Complete
    ↓
Level2 Landing (Logo animation)
    ↓
Briefing Screen (Educational context)
    ↓
Game Start → 3 Manipulation Phases
    ↓
Phase 1: VISHING (Voice Phishing Call)
    ↓
Player Chooses:
├── SHARE PIN → FAIL (Immediate compromise)
├── HANG UP & VERIFY → Phase 2
└── REPORT AS SCAM → SUCCESS (end early)
    ↓
Phase 2: PHISHING (Email Scam)
    ↓
Player Chooses:
├── CLICK LINK → FAIL (Compromise)
├── DELETE EMAIL → Phase 3
└── REPORT → SUCCESS (end early)
    ↓
Phase 3: SCAREWARE (Malware Alert Popup)
    ↓
Player Chooses:
├── VERIFY CREDENTIALS → FAIL (Compromise)
├── CLOSE POPUP → Report triggers automatically
└── REPORT MALWARE → SUCCESS (manually report)
    ↓
Success: Security Awareness Achieved
Failure: Account Compromised with Real Consequences
```

## Game Mechanics

### 1. Three Manipulation Phases

#### **Phase 1: VISHING (Voice Phishing)**
- **Threat Vector**: Phone call from fake "Bank Security Team"
- **Social Engineering Tactic**: False authority + artificial urgency
- **Pressure Method**: 
  - Mentions suspicious transactions
  - Asks for UPI PIN to "verify identity"
  - Banks NEVER ask for PIN
- **Interface**: iPhone-style phone frame with call transcript
- **Bypass by**: Hanging up and verifying, OR reporting as scam
- **Time Limit**: 90 seconds per phase

#### **Phase 2: PHISHING (Email Scam)**
- **Threat Vector**: Email from "support@secure-bank-verify.com" (suspicious domain)
- **Social Engineering Tactic**: Urgency + authority + fear ("unusual activity")
- **Pressure Method**:
  - Claims account will be locked in 2 hours
  - Links to fake verification page (looks legitimate)
  - Asks for OTP and PIN
- **Interface**: Email interface with clearly suspicious sender address
- **Bypass by**: Deleting email or reporting as phishing
- **Red Flags**: 
  - Domain is NOT official bank domain
  - Banks use app, not external links
  - 2-hour deadline creates artificial urgency

#### **Phase 3: SCAREWARE (Tech Support Scam)**
- **Threat Vector**: Popup claiming malware detected
- **Social Engineering Tactic**: Fear + urgency + legitimacy illusion
- **Pressure Method**:
  - Shows fake malware scan results
  - Claims account will be locked in 5 minutes
  - Large red button saying "VERIFY CREDENTIALS NOW"
  - Lists fake threats (BankSteal.exe, CredentialHarvester, etc.)
- **Interface**: Browser-style popup with animated scan lines
- **Bypass by**: Closing popup or reporting malware
- **Reality**: Real antivirus NEVER asks for credentials in popups

### 2. Stress Level Mechanic
- **Starts at**: 0%
- **Increases as**: Time remaining decreases (0-100%)
- **Visual Indicators**:
  - Stress bar changes color: Green (0-33%) → Orange (33-66%) → Red (66-100%)
  - Stress indicator pulses when high
  - Timer pulses when urgent (<20 seconds)
- **Player Experience**: Mimics real psychological pressure victims feel

### 3. Timer System
- **Duration**: 90 seconds per phase
- **Auto-Progression**: If timer expires, player automatically moves to next phase
- **Color Coding**:
  - Green when healthy (>20s)
  - Red with pulsing animation when urgent (<20s)
- **Educational Purpose**: Teaches that attackers use time pressure, not logic

### 4. UI/UX Design

#### Design Philosophy
- **Dark Cybersecurity Theme**: Matches Level 1 aesthetic
- **Red Accents**: #cc0000, #ff3333 (danger/blood theme)
- **Terminal Aesthetic**: Share Tech Mono font for authenticity
- **Glassmorphism**: Blurred backgrounds for depth

#### Components
- **Phone Frame**: Realistic iPhone mockup for Phase 1
- **Email Interface**: Authentic Gmail-style layout for Phase 2
- **Popup**: Browser-style modal for Phase 3
- **Phase Context**: Educational sidebar explaining the threat
- **Status Bar**: Real-time phase, threat level, timer, stress indicator

### 5. Button System

#### Button Types
- **SHARE PIN** (Red/Danger) - DO NOT CLICK
  - Triggers immediate failure
  - Shows account compromise screen
  - 2-second delay before failure animation

- **HANG UP & VERIFY** / **DELETE EMAIL** / **CLOSE POPUP** (Orange/Warning)
  - Safe options to escape threat
  - Progress to next phase
  - Increases player confidence

- **REPORT** (Cyan/Safe) - RECOMMENDED
  - Reports scam to authorities
  - Triggers success ending immediately
  - Available in all phases
  - Encourages proper security response

### 6. Win/Loss Conditions

#### **FAILURE**
- **Trigger**: Player clicks "SHARE PIN" in any phase
- **Screen**: "ACCOUNT COMPROMISED"
- **Display**:
  - Fraudulent transaction: ₹47,500 transferred
  - Account Status: LOCKED
  - Identity Theft Risk: HIGH
- **Message**: Explains how victims face immediate consequences
- **Educational Value**: Shows real-world impact

#### **SUCCESS**
- **Trigger**: Player resists all 3 phases and reports
- **Screen**: "SCAM REPORTED & BLOCKED"
- **Display**:
  - Fraudulent transactions: 0
  - Account Status: SECURE
  - Funds Protected: 100% Safe
- **Message**: Celebrates player's security awareness
- **Educational Value**: Reinforces correct behavior

## Educational Content

### Key Messages
1. **Never Share PIN**: Your PIN is like your house key - never give it to anyone
2. **Banks Never Ask**: Legitimate banks NEVER ask for PIN, OTP, or CVV via phone/email
3. **Verify Before Acting**: Always verify caller/sender identity through official channels
4. **Report Scams**: Report suspicious activity to your bank immediately
5. **Stay Calm**: Attackers use urgency and fear to override logic

### Real-World Context
- **94% of victims** in India fall for UPI scams
- **Average loss**: ₹40,000 - ₹2,00,000
- **Time taken**: Criminals drain accounts within seconds of getting PIN
- **Identity theft**: Beyond money loss, victims face credit score damage
- **Prevention**: Education + critical thinking

### Briefing Screen
Educates players BEFORE the game about:
- The nature of the threat simulation
- Real-world consequences of UPI fraud
- Winning conditions
- The seriousness of the topic

### Phase Context Panels
Each phase includes explanation of:
- The social engineering tactic being used
- Why it's effective
- Real-world indicators
- How to identify similar attacks

### Ending Screens
Educational outcomes that explain:
- How the manipulation worked
- Real victim experiences
- Prevention strategies going forward

## Technical Implementation

### React Hooks Used
- `useState`: Phase management, timer, stress level, UI state
- `useEffect`: Timer interval, animations, auto-progression

### CSS Features
- **Animations**: Smooth transitions, pulsing effects, slide-ins, shake animations
- **Gradients**: Linear and radial gradients for depth
- **Glassmorphism**: Blur effects and transparency
- **Keyframes**: Timer pulse, stress pulse, button glow, logo animations
- **Responsive Design**: Grid layout for buttons, font scaling

### Performance
- Efficient component re-renders
- Timer cleanup on unmount
- No infinite loops or memory leaks
- Smooth animations at 60fps

## Customization Options

### Easy Modifications
1. **Change Attacker Profile**: Modify the fake caller name, email address
2. **Adjust Time Limits**: Change 90 seconds to different duration
3. **Alter Stress Representation**: Customize stress bar colors/thresholds
4. **Modify Amount**: Change ₹47,500 to different rupee amount
5. **Localize:** Change attacker names, banks, domains to local scams

### Adding More Phases
The architecture supports adding Phase 4, 5, etc. by:
1. Adding new PHASE constant
2. Creating new phase component
3. Adding phase advancement logic
4. Setting phase advancement condition

## Security Message Flow

The entire level is designed to teach one core principle:

> **Your UPI PIN is YOUR SECRET. Never share it with anyone, EVER.**
>
> Even if they claim to be:
> - Bank officials
> - Technical support
> - Police
> - Government agencies
>
> Even if they say:
> - Your account will be locked
> - Your funds are at risk
> - You'll be fined
> - Your identity will be stolen
>
> **Your PIN should stay with you.**

## Integration with Game Story

**The Human Patch** concept continues:
- Phase 1 (Vishing): Social engineering via voice (classic attack method)
- Phase 2 (Phishing): Social engineering via email (mass attack method)
- Phase 3 (Scareware): Tech manipulation (fear-based attack method)

All three represent different aspects of social engineering that victims face in real-world scams.

## Analytics Points (for future expansion)

1. Which phase players fail on most (indicates attack effectiveness)
2. Time taken to report vs. share PIN
3. Stress level at failure point
4. Player demographics and threat susceptibility
5. Overall security awareness score

## Accessibility Notes

- Clear color contrast (dark backgrounds, bright text)
- Large buttons with descriptive labels
- Non-reliance on color alone (icons + text)
- Readable Font sizes
- Clear instructions in briefing

## Future Enhancements

1. **Add sound effects**: 
   - Phone ringing for Vishing
   - Email notification for Phishing
   - Alarm beep for Scareware

2. **Add real-time events**:
   - Fake bank notifications
   - Pop-up ads
   - Distraction events

3. **Add difficulty levels**:
   - Easy: Obvious scams
   - Hard: Sophisticated social engineering
   - Extreme: Multiple simultaneous threats

4. **Add leaderboard**:
   - Track fastest success times
   - Track stress levels
   - Track reporter count vs. PIN sharers

5. **Add dialogue options**:
   - Rather than simple buttons, add conversational choices
   - More realistic interaction patterns

## Testing Checklist

- [x] All three phases execute correctly
- [x] Timer decrements properly
- [x] Stress level increases with time
- [x] Buttons trigger correct outcomes
- [x] Success path rewards player
- [x] Failure path shows consequences
- [x] Animations play smoothly
- [x] CSS styling loads correctly
- [x] Navigation between Level1 and Level2 works
- [x] Mobile responsive layout (if applicable)

## Files Reference

### Main Components
- [Level2.jsx](../Level2.jsx) - 280 lines - Landing, Briefing, Game, Ending orchestration
- [Level2Game.jsx](../Level2Game.jsx) - 430 lines - 3 manipulation phases, outcome screens
- [Level2.css](../Level2.css) - 800+ lines - Complete styling system

### Modified Files
- [App.jsx](../../App.jsx) - Added Level2 import and stage
- [Level1.jsx](../Level1.jsx) - Added EndingScreen with Level2 navigation
- [Level1.css](../Level1.css) - Added EndingScreen styles

## Version History
- Version 1.0 - Initial release with 3 manipulation phases
- Design Pattern: Substages architecture (matching Level1)
- Educational Focus: UPI PIN security and social engineering awareness
