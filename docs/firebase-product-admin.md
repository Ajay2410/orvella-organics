# Firebase Product Admin Setup

This branch adds a Firebase-backed admin area for managing products without redeploying the website.

## Project

- Project ID: `orvella-organics-80780`
- Console: https://console.firebase.google.com/project/orvella-organics-80780/overview
- Admin email allowed by rules: `gondaliyakishan1386@gmail.com`

## Routes

- `/admin/login`
- `/admin/products`

## Firebase Services

Enable these in your Firebase project:

- Authentication: Email/Password provider
- Firestore Database: created in `asia-south1`
- Storage

## Environment

Copy `.env.example` to `.env.local` and fill the values from Firebase project settings.

```bash
cp .env.example .env.local
```

`.env.local` is already configured locally on this machine and ignored by git.

## Remaining Console Steps

Firebase CLI created the project, created the web app, created Firestore, and deployed Firestore rules.

Complete these in Firebase console:

1. Open Authentication providers:
   https://console.firebase.google.com/project/orvella-organics-80780/authentication/providers
2. Enable `Email/Password`.
3. Open Authentication users:
   https://console.firebase.google.com/project/orvella-organics-80780/authentication/users
4. Add an admin user with email `gondaliyakishan1386@gmail.com`.
5. Open Storage:
   https://console.firebase.google.com/project/orvella-organics-80780/storage
6. Click `Get Started` to create the default Storage bucket.
7. After Storage is created, run:

```bash
firebase deploy --only storage --project orvella-organics-80780
```

## Firestore

Products are stored in the `products` collection. Each document ID should match the product URL ID, such as:

```txt
dried-mango-slices
beetroot-powder
```

## Storage

Uploaded product images are stored under:

```txt
products/{productId}/{timestamp}-{filename}
```

## Suggested Rules

Public visitors can read products. Only the configured admin email can write products and upload images.

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.email == "gondaliyakishan1386@gmail.com";
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

```txt
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null && request.auth.token.email == "gondaliyakishan1386@gmail.com";
    }

    match /products/{productId}/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```
