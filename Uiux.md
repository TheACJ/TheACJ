
# Flash Merchant App - UI/UX Product Requirement Document

## 1. EXECUTIVE SUMMARY

This UI/UX PRD defines the complete user interface and experience design for the Flash Merchant App, a non-custodial crypto-to-fiat POS system. The app enables merchants to process physical transactions directly and respond to remote transaction requests initiated by users through their Flash User App.

## 2. DESIGN PRINCIPLES

### 2.1 Core Principles
- **Speed First**: Optimize for quick transaction processing (< 3 taps for common actions)
- **Clarity**: Large, readable text and clear visual hierarchy for busy merchant environments
- **Security**: Visual confirmation at every critical step
- **Reliability**: Offline-capable design with clear connection status indicators
- **Accessibility**: High contrast, large touch targets (minimum 44x44pt)
- **Non-Custodial Focus**: Merchants never hold user funds, only facilitate exchanges

### 2.2 Visual Design System
- **Primary Colors**: (As defined in User Figma)
  - Flash Blue  - Primary actions
  - Success Green - Confirmations
  - Alert Red  - Warnings/Errors
  - Neutral Grey (#F5F5F5) - Backgrounds
- **Typography**: 
  - Headers: SF Pro Display Bold 24-32pt
  - Body: SF Pro Text Regular 16-18pt
  - Numbers: SF Mono Medium 20-36pt
- **Grid System**: 8pt baseline grid with 16pt margins

## 3. SCREEN INVENTORY

### 3.1 Authentication & Onboarding
1. Splash Screen
2. Sign Up / Login Screen
3. Merchant PIN Setup Screen
4. Merchant Verification Screen
5. Bank Account Setup Screen
6. Tutorial Screens (4 screens)

### 3.2 Main Navigation Screens
7. Dashboard Home
8. Notifications Center
9. Transaction History
10. Wallet Management
11. Settings

### 3.3 Physical Transaction Screens
12. Physical Transaction Selection
13. Physical Withdrawal Flow (3 screens)
14. Physical Deposit Flow (3 screens)
15. Transaction Status Screen
16. Transaction Receipt Screen

### 3.4 Remote Transaction Screens (Incoming Only)
17. Incoming Requests Dashboard
18. Remote Withdrawal Request Details
19. Remote Deposit Request Details
20. Fiat Transfer Confirmation Screen
21. Transaction Completion Screen

### 3.5 Management Screens
22. Staking Management
23. Merchant Tier Status
24. Exchange Rate Management
25. Reports & Analytics
26. Support & Help

## 4. DETAILED SCREEN SPECIFICATIONS

### 4.1 Authentication Flow

#### 4.1.1 Splash Screen
- **Purpose**: Brand introduction and loading
- **Elements**:
  - Flash logo (animated)
  - "Merchant" subtitle
  - Loading indicator
  - Version number (bottom)
- **Duration**: 2-3 seconds max

#### 4.1.2 Login Screen
- **Layout**: Center-aligned vertical
- **Components**:
  - Flash Merchant logo
  - Phone number input field
  - "Continue" button (disabled until valid number)
  - "New merchant? Register" link
  - Biometric login option (if enabled)
- **Interactions**:
  - Auto-advance to next field
  - Numeric keyboard only
  - SMS OTP verification

### 4.2 Dashboard Home

#### 4.2.1 Layout Structure
```
┌─────────────────────────────────────┐
│ Status Bar | Merchant Name | (3)🔔  │
├─────────────────────────────────────┤
│         Today's Summary Card        │
│  ┌──────────┬──────────┬─────────┐  │
│  │Deposits  │Withdrawals│ Balance│  │
│  │ $2,450   │  $1,200   │ $8,750 │  │
│  └──────────┴──────────┴─────────┘  │
├─────────────────────────────────────┤
│     🔴 Active Requests (3)          │
│  ┌─────────────────────────────────┐│
│  │ Remote Withdrawal - @alice99    ││
│  │ $500 • Awaiting Your Action     ││
│  │ [View Details →]                ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│        Flash Local Transactions     │
│  ┌─────────────┬─────────────┐      │
│  │  Withdraw   │   Deposit   │      │
│  │     💵      │     💰      │      │
│  └─────────────┴─────────────┘      │
├─────────────────────────────────────┤
│      Recent Transactions            │
│  ✅ John Doe - Withdrawal -  $50    │  
│  ✅ Jane Smith - Deposit -  $100    │  
│  ⏳ Mike Brown - Pending - $75      │
└─────────────────────────────────────┘
```

#### 4.2.2 Components
- **Status Bar**: 
  - Connection indicator (green/yellow/red)
  - Notification bell with badge count
  - Current time
- **Active Requests Alert**:
  - Red indicator for pending actions
  - Quick access to incoming requests
  - Auto-refresh every 10 seconds
- **Physical Transaction Buttons**:
  - Large 150x120pt buttons
  - Clear icons with labels
  - Direct access to POS functions

### 4.3 Notifications Center

```
┌─────────────────────────────────────┐
│    📬 Notifications Center          │
├─────────────────────────────────────┤
│ [All] [Withdrawals] [Deposits]      │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🔴 NEW • 2 min ago              │ │
│ │ Remote Withdrawal Request       │ │
│ │ @alice99 requesting $500        │ │
│ │ Tap to review →                 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🔴 NEW • 5 min ago              │ │
│ │ Remote Deposit Alert            │ │
│ │ @bob_trader sending $250        │ │
│ │ Awaiting fiat confirmation      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ✅ COMPLETED • 1 hour ago       │ │
│ │ Physical Withdrawal             │ │
│ │ @charlie7 - $1,000 - Success    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 4.4 Physical Transaction Flows

#### 4.4.1 Physical Withdrawal - Screen 1: User Identification
```
┌─────────────────────────────────────┐
│        Physical Withdrawal          │
│         (In-Person Only)            │
├─────────────────────────────────────┤
│                                     │
│   Enter Customer's Flash Tag        │
│   ┌─────────────────────────┐       │
│   │ @_________________      │       │
│   └─────────────────────────┘       │
│                                     │
│   Frequent Customers:               │
│   • @johndoe123                     │
│   • @janesmith                      │
│   • @mikebrown456                   │
│                                     │
│ [Cancel]              [Continue →]  │
└─────────────────────────────────────┘
```

#### 4.4.2 Physical Withdrawal - Screen 2: Amount & Asset Selection
```
┌─────────────────────────────────────┐
│     Withdrawal for @johndoe123      │
├─────────────────────────────────────┤
│                                     │
│   Select Asset:                     │
│   ┌─────┬─────┬─────┬─────┐         │
│   │ BTC │ ETH │SOL  │USDT │         │
│   └─────┴─────┴─────┴─────┘         │
│                                     │
│   Enter Fiat Amount:                │
│   ┌─────────────────────────┐       │
│   │ $________________       │       │
│   └─────────────────────────┘       │
│                                     │
│   Customer Receives:                │
│   0.0025 BTC                        │
│                                     │
│   Exchange Rate:                    │
│   1 BTC = $40,000                   │
│                                     │
│   Your Available: $8,750            │
│   Network Fee: $2.50                │
│                                     │
│ [← Back]         [Continue -> ]     │
└─────────────────────────────────────┘
```

#### 4.4.3 Physical Withdrawal - Screen 3: Customer PIN Entry
```
┌─────────────────────────────────────┐
│    🔒 Secure PIN Entry Required     │
├─────────────────────────────────────┤
│                                     │
│   ⚠️ Hand device to customer now    │
│                                     │
│   ┌─────────────────────────┐       │
│   │    👤 Customer View     │       │
│   │   [Device Handover Icon]│       │
│   └─────────────────────────┘       │
│                                     │
│   Enter your 8-digit FlashPIN:      │
│                                     │
│   ● ● ● ○ ○ ○ ○ ○                   │
│                                     │
│   ┌───┬───┬───┐                     │
│   │ 1 │ 2 │ 3 │                     │
│   ├───┼───┼───┤                     │
│   │ 4 │ 5 │ 6 │                     │
│   ├───┼───┼───┤                     │
│   │ 7 │ 8 │ 9 │                     │
│   ├───┼───┼───┤                     │
│   │ C │ 0 │ ⌫ │                     │
│   └───┴───┴───┘                     │ 
│                                     │
│        [Cancel Transaction]         │
└─────────────────────────────────────┘
```

### 4.5 Remote Transaction Screens (Incoming Only)

#### 4.5.1 Incoming Requests Dashboard
```
┌─────────────────────────────────────┐
│    📥 Incoming Requests (3)         │
├─────────────────────────────────────┤
│ [All] [Withdrawals] [Deposits]      │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 💸 WITHDRAWAL REQUEST           │ │
│ │ @alice99 • ⭐4.8 • 2 min ago    │ │
│ │ Amount: $500                    │ │
│ │ You Send: Fiat (Bank Transfer)  │ │
│ │ You Receive: 0.0125 BTC         │ │
│ │ Status: 🔒 Crypto Locked        │ │
│ │ Time Left: 28:45                │ │
│ │ [View Details]                  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 💰 DEPOSIT REQUEST              │ │
│ │ @bob_trader • ⭐4.2 • 5 min ago │ │
│ │ Amount: $250                    │ │
│ │ You Receive: Fiat               │ │
│ │ You Send: 125 USDT              │ │
│ │ Status: ⏳ Awaiting Fiat        │ │
│ │ [View Details]                  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 4.5.2 Remote Withdrawal Request Details
```
┌─────────────────────────────────────┐
│  💸 Withdrawal Request Details      │
├─────────────────────────────────────┤
│                                     │
│ Customer Information:               │
│ ┌─────────────────────────────────┐ │
│ │ Tag: @alice99                   │ │
│ │ Rating: ⭐⭐⭐⭐⭐ (4.8/5)      
│ │ Completed Trades: 127           │ │
│ │ Member Since: Jan 2024          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Transaction Details:                │
│ ┌─────────────────────────────────┐ │
│ │ Customer Sends: 0.0125 BTC      │ │
│ │ Status: 🔒 Locked in Escrow     │ │
│ │ You Send: $500 (Fiat)           │ │
│ │ Your Rate: 1 BTC = $40,000      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Send Fiat To:                       │
│ ┌─────────────────────────────────┐ │
│ │ Name: Alice Johnson             │ │
│ │ Bank: UBA ****1234              │ │
│ │ Reference: FLH-7829-ALICE       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⏰ Time Remaining: 27:30            │
│                                     │
│ [Decline]    [I've Sent the Fiat]   │
└─────────────────────────────────────┘
```

#### 4.5.3 Remote Deposit Request Details
```
┌─────────────────────────────────────┐
│   💰 Deposit Request Details        │
├─────────────────────────────────────┤
│                                     │
│ Customer Information:               │
│ ┌─────────────────────────────────┐ │
│ │ Tag: @bob_trader                │ │
│ │ Rating: ⭐⭐⭐⭐☆ (4.2/5)     
│ │ Completed Trades: 89            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Transaction Details:                │
│ ┌─────────────────────────────────┐ │
│ │ Customer Sends: $250 (Fiat)     │ │
│ │ You Send: 125 USDT              │ │
│ │ Exchange Rate: 1 USDT = $2.00   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Customer Should Send To:            │
│ ┌─────────────────────────────────┐ │
│ │ Your Bank: First Bank           │ │
│ │ Account: ****5678               │ │
│ │ Name: Your Business Name        │ │
│ │ Reference: FLD-3847-BOB         │ │
│ │                                 │ │
│ │ ⚠️ Customer MUST include the    │ │
│ │ reference number above          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Status: ⏳ Awaiting Fiat Receipt    │
│                                     │
│ [Cancel]  [Confirm Fiat Received]   │
└─────────────────────────────────────┘
```

#### 4.5.4 Fiat Transfer Confirmation Screen (for Withdrawals)
```
┌─────────────────────────────────────┐
│   ✅ Confirm Fiat Transfer          │
├─────────────────────────────────────┤
│                                     │
│ Before proceeding, confirm:         │
│                                     │
│ ☑️ I have sent $500 to:             │
│   Alice Johnson                     │
│   UBA ****1234                      │
│                                     │
│ ☑️ I included reference:            │
│   FLH-7829-ALICE                    │
│                                     │
│ ☑️ Transfer proof/screenshot saved  │
│                                     │
│ ⚠️ Warning: False confirmations     │
│ will result in account suspension   │
│                                     │
│ Upload Proof (Optional):            │
│ ┌─────────────────────────────────┐ │
│ │    📷 Add Screenshot            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Go Back]    [Confirm Transfer ✓]   │
└─────────────────────────────────────┘
```

### 4.6 Transaction Status Screen
```
┌─────────────────────────────────────┐
│      Transaction Processing         │
├─────────────────────────────────────┤
│                                     │
│        [Animated Spinner]           │
│                                     │
│   Status: Processing...             │
│                                     │
│   Physical Withdrawal:              │
│   ┌─────────────────────────────┐   │
│   │ ✓ PIN Verified              │   │
│   │ ✓ MPC Signature Complete    │   │
│   │ ⟳ Broadcasting to Network   │   │
│   │ ○ Awaiting Confirmation     │   │
│   │ ○ Transaction Complete      │   │
│   └─────────────────────────────┘   │
│                                     │
│   Transaction ID:                   │
│   0x7f9a...3e2d                     │
│   [Copy] [View on Explorer]         │
│                                     │
│   💵 Release cash to customer       │
│   once confirmed                    │
│                                     │
│         [Done]                      │
└─────────────────────────────────────┘
```

### 4.7 Wallet Management Screen
```
┌─────────────────────────────────────┐
│      💼 Wallet Management           │
├─────────────────────────────────────┤
│                                     │
│ Available Balance:                  │
│ ┌─────────────────────────────────┐ │
│ │ Total Fiat: $8,750              │ │
│ │ In Orders: $1,200               │ │
│ │ Available: $7,550               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Staking Status:                     │
│ ┌─────────────────────────────────┐ │
│ │ Staked: 1,000 FLA$H             │ │
│ │ Tier: Gold ⭐                   │ │   
│ │ Daily Limit: $10,000            │ │
│ │ Next Tier: 2,500 FLA$H          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Quick Actions:                      │
│ [Add Funds] [Withdraw] [Stake]      │
│                                     │
│ Transaction Limits:                 │
│ • Per Transaction: $5,000           │
│ • Daily Volume: $10,000             │
│ • Monthly Volume: $200,000          │
└─────────────────────────────────────┘
```

## 5. NAVIGATION STRUCTURE

### 5.1 Bottom Tab Navigation
```
┌────┬────┬────┬────┬────┐
│Home│Reqs│Hist│Wall│Set │
└────┴────┴────┴────┴────┘
```
- **Home**: Dashboard with physical transaction buttons
- **Reqs**: Incoming remote requests
- **Hist**: Transaction history
- **Wall**: Wallet & staking management
- **Set**: Settings & profile

### 5.2 Navigation Hierarchy
```
Root
├── Dashboard
│   ├── Physical Withdrawal
│   ├── Physical Deposit
│   └── Quick Stats
├── Requests (Remote)
│   ├── Incoming Withdrawals
│   ├── Incoming Deposits
│   └── Request Details
├── History
│   ├── All Transactions
│   ├── Filter by Type
│   └── Transaction Details
├── Wallet
│   ├── Balance Overview
│   ├── Staking Management
│   └── Tier Benefits
└── Settings
    ├── Profile
    ├── Bank Accounts
    ├── Security
    ├── Exchange Rates
    └── Support
```

## 6. NOTIFICATION SYSTEM

### 6.1 Push Notifications
```
┌─────────────────────────────────────┐
│ Flash Merchant                  Now │
│ 💸 New Withdrawal Request           │
│ @alice99 is requesting $500         │
│ Tap to review                       │
└─────────────────────────────────────┘
```

### 6.2 In-App Notifications
- **Banner Alerts**: Slide down from top
- **Badge Counts**: On tabs and buttons
- **Sound Alerts**: For new requests
- **Vibration**: For urgent actions

### 6.3 Notification Types
- **Critical**: New incoming requests
- **Important**: Transaction confirmations
- **Informational**: Daily summaries
- **System**: Maintenance alerts

## 7. ERROR HANDLING

### 7.1 Connection Errors
```
┌─────────────────────────────────────┐
│         ⚠️ Connection Lost          │
│                                     │
│   Unable to receive new requests    │
│                                     │
│   Active transactions will resume   │
│   when connection is restored       │
│                                     │
│   [Retry]     [Work Offline]       │
└─────────────────────────────────────┘
```

### 7.2 Transaction Errors
```
┌─────────────────────────────────────┐
│         ❌ Transaction Failed        │
│                                     │
│   Insufficient balance to complete  │
│   this withdrawal                   │
│                                     │
│   Required: $500                    │
│   Available: $450                   │
│                                     │
│   [Add Funds]    [Cancel]          │
└─────────────────────────────────────┘
```

## 8. SECURITY FEATURES

### 8.1 Visual Security Indicators
- **Green Lock**: Secure transactions
- **Red Alert**: Security warnings
- **Yellow Caution**: Verification needed
- **Shield Icon**: Protected actions

### 8.2 Security Screens

#### PIN Re-entry for High Value
```
┌─────────────────────────────────────┐
│    🔒 Security Verification         │
├─────────────────────────────────────┤
│                                     │
│   High value transaction            │
│   Please enter your Merchant PIN    │
│                                     │
│   ● ● ● ● ○ ○                       │
│                                     │
│   [Numeric Keypad]                  │
│                                     │
└─────────────────────────────────────┘
```

## 9. PERFORMANCE INDICATORS

### 9.1 Loading States
- **Skeleton Screens**: For lists
- **Progress Bars**: For long operations
- **Spinners**: For quick loads
- **Percentage Indicators**: For uploads

### 9.2 Real-time Updates
- **Live Badges**: Update without refresh
- **WebSocket Indicators**: Connection status
- **Auto-refresh**: Every 10 seconds for requests
- **Pull-to-refresh**: Manual update option



## 10. MERCHANT-SPECIFIC FEATURES

### 10.1 Business Hours Setting
```
┌─────────────────────────────────────┐
│      ⏰ Business Hours              │
├─────────────────────────────────────┤
│                                     │
│ Accept Remote Requests:             │
│ ┌─────────────────────────────────┐│
│ │ Mon-Fri: 9:00 AM - 6:00 PM     ││
│ │ Saturday: 10:00 AM - 4:00 PM   ││
│ │ Sunday: Closed                  ││
│ └─────────────────────────────────┘│
│                                     │
│ Auto-Response Message:              │
│ "Currently offline. Will respond    │
│  during business hours."            │
│                                     │
│ [Edit Hours]    [Save]             │
└─────────────────────────────────────┘
```

### 10.2 Quick Stats Dashboard
```
┌─────────────────────────────────────┐
│      📊 Today's Performance         │
├─────────────────────────────────────┤
│ Transactions: 24                    │
│ Volume: $12,450                     │
│ Avg Transaction: $518               │
│ Success Rate: 96%                   │
│ Customer Rating: ⭐4.7              │
└─────────────────────────────────────┘
```

# 11. MERCHANT-SPECIFIC FEATURES
## 11.1 Business Hours Setting
```
┌─────────────────────────────────────┐
│      ⏰ Business Hours              │
├─────────────────────────────────────┤
│                                     │
│ Accept Remote Requests:             │
│ ┌─────────────────────────────────┐ │
│ │ Mon-Fri: 9:00 AM - 6:00 PM      │ │
│ │ Saturday: 10:00 AM - 4:00 PM    │ │
│ │ Sunday: Closed                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Auto-Response Message:              │
│ "Currently offline. Will respond    │
│  during business hours."            │
│                                     │
│ [Edit Hours]    [Save]              │
└─────────────────────────────────────┘
```

## 11.2 Quick Stats Dashboard
```

┌─────────────────────────────────────┐
│      📊 Today's Performance         │
├─────────────────────────────────────┤
│ Transactions: 24                    │
│ Volume: $12,450                     │
│ Avg Transaction: $518               │
│ Success Rate: 96%                   │
│ Customer Rating: ⭐4.7              │
└─────────────────────────────────────┘
```