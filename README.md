<div align="center">

# 📱 SmartPharma — Mobile App

![Ionic](https://img.shields.io/badge/Ionic-8.0-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-20.3-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-8.5-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-RTL_%7C_LTR-8b5cf6?style=for-the-badge)

</div>

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running on a Physical Device](#-running-on-a-physical-device)
- [Building the Android App](#-building-the-android-app)
- [Environment Configuration](#-environment-configuration)
- [Folder Structure](#-folder-structure)
- [Related Repositories](#-related-repositories)

---

## 📖 Project Overview

**SmartPharma Mobile** ("صيدليتي الذكية") is the companion mobile app to the SmartPharma pharmacy management system, built with **Ionic + Angular** and packaged as a native Android app via **Capacitor**. It talks to the same [backend API](https://github.com/amer-rouby/smartpharma-backend) as the [web frontend](https://github.com/amer-rouby/smartpharma-frontend), giving pharmacy staff point-of-sale, inventory, and reporting access from a phone.

---

## ✨ Key Features

- **POS** — cart-based checkout with barcode scanning, discounts, and multiple payment methods
- **Products** — paginated/searchable catalog, barcode lookup, full add/edit/delete
- **Stock** — active low-stock/expiry alerts, batch and movement history, manual adjustments, unread-alert badge
- **Purchasing** — purchase order list and detail views
- **Sales history** — searchable past-sale list with per-sale detail
- **Demand prediction** — forecast list synced with the same engine as the web app
- **Categories, suppliers, expenses, refunds, payments** — full management screens
- **User management & system settings** — admin-only screens for staff and pharmacy configuration
- **Notifications** — in-app alerts with per-user channel/quiet-hours preferences
- **Profile** — photo upload, full profile edit, password change
- **Prescription capture** — photo upload for prescription-required sales
- **Barcode scanning** — via `@capacitor-mlkit/barcode-scanning` for products and POS
- **Arabic/English i18n** — full RTL/LTR layout switching, persisted per device
- **Light/dark theme** — manual toggle, persisted per device

---

## 🛠 Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Framework** | Ionic 8 + Angular 20 (standalone components) |
| **Native runtime** | Capacitor 8 |
| **Language** | TypeScript 5.9 |
| **Barcode scanning** | `@capacitor-mlkit/barcode-scanning` |
| **Device APIs** | `@capacitor/camera`, `@capacitor/preferences`, `@capacitor/status-bar`, `@capacitor/haptics`, `@capacitor/keyboard` |
| **i18n** | `@ngx-translate/core` |
| **Reactive state** | RxJS + Angular Signals |

---

## 📋 Prerequisites

| Requirement | Version |
|:------------|:--------|
| **Node.js** | 18.x or later |
| **npm** | 10.x or later |
| **Ionic CLI** | `npm install -g @ionic/cli` |
| **Android Studio** + **JDK 21** | Required only for building/running the native Android app |
| A running instance of the [backend API](https://github.com/amer-rouby/smartpharma-backend) | |

---

## 🚀 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/amer-rouby/smartpharma-mobile.git
cd smartpharma-mobile
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Start the dev server
```bash
ionic serve
# or
npm start
```
Requests to `/api` are proxied to `http://localhost:8081` (see `proxy.conf.json`), so the backend must be running locally on port 8081.

Navigate to `http://localhost:8100/`.

---

## 📲 Running on a Physical Device

A phone on the same network can't reach the dev machine via `localhost` — update `src/environments/environment.ts`'s `apiUrl` to the dev machine's LAN IP (e.g. `http://192.168.1.x:8081/api`) instead of the relative `/api` proxy path used for browser/emulator testing.

---

## 🤖 Building the Android App

```bash
ionic build
npx cap sync android
npx cap open android
```

Then build/run from Android Studio. Requires **JDK 21** specifically for the Capacitor 8.x Android Gradle build (separate from whatever JDK runs the backend).

**Note:** a running dev server does **not** update an already-installed APK — any source change requires a rebuild (`ionic build` → `npx cap sync android`) and reinstall to take effect on a device.

---

## ⚙️ Environment Configuration

`src/environments/environment.ts` (development):
```typescript
export const environment = {
  production: false,
  apiUrl: '/api',            // proxied to localhost:8081 in dev
  appName: 'صيدليتي الذكية',
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  userKey: 'currentUser'
};
```

`src/environments/environment.prod.ts` should point `apiUrl` at the real deployed backend URL.

`capacitor.config.ts` sets `androidScheme: 'http'` — Capacitor 3+ defaults to `https` for the WebView, which blocks requests to a plain-HTTP backend as mixed content.

---

## 📁 Folder Structure

```
smartpharma-mobile/
├── src/
│   ├── app/
│   │   ├── core/                 # Services, guards, interceptors
│   │   ├── features/             # Feature screens (POS, products, stock, sales, purchases,
│   │   │                         #   categories, suppliers, expenses, payments, reports,
│   │   │                         #   demand-predictions, users, system-settings, profile, ...)
│   │   ├── tabs/                 # Tab bar shell and routing
│   │   └── shared/                # Shared components (ToastService, PagedList utility, etc.)
│   ├── assets/
│   │   └── i18n/                 # ar.json / en.json translation files
│   ├── theme/
│   │   └── variables.scss        # Light/dark color tokens
│   └── environments/
├── android/                       # Native Android platform project (excluded from git; regenerate via `npx cap add android`)
├── capacitor.config.ts
├── proxy.conf.json                # Dev-server API proxy to the backend
├── angular.json
└── package.json
```

---

## 🔗 Related Repositories

- **Backend API**: [smartpharma-backend](https://github.com/amer-rouby/smartpharma-backend) — Spring Boot
- **Web frontend**: [smartpharma-frontend](https://github.com/amer-rouby/smartpharma-frontend) — Angular

---

## 📄 License

This project is proprietary and protected by intellectual property rights.
