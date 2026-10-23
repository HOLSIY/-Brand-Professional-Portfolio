# Firestore Security Specification & Threat Model

This specification outlines the data invariants, threat vectors, and test payloads designed to harden the Firestore database for this application.

## 1. Data Invariants

1. **Submissions Collection (`/submissions/{submissionId}`)**
   - Must contain exact fields: `name`, `email`, `message`, `createdAt`.
   - Optional fields allowed: `replyText`, `replyImage`, `repliedAt`, `replied`.
   - String sizes must be strictly bounded to prevent storage abuse.

2. **Visits Collection (`/visits/{visitId}`)**
   - Must contain exact fields: `visitorId`, `path`, `timestamp`.
   - Optional fields allowed: `userAgent`, `language`.
   - Bounded sizes on all fields to prevent Denial of Wallet.

3. **Settings Collection (`/settings/admin_config`)**
   - Stores the admin credentials / configurations.
   - Must contain `password`.
   - `password` must be at least 6 characters and less than 200 characters.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads represent attempt types designed to exploit potential vulnerabilities (e.g., shadow fields, buffer overflows, parameter pollution). Our security rules must reject them.

### Submissions Exploits
1. **Payload 1 (Shadow Field Injection):**
   ```json
   {
     "name": "Attacker",
     "email": "attacker@spam.com",
     "message": "Spam message",
     "createdAt": "2026-07-04T12:00:00Z",
     "isAdmin": true
   }
   ```
2. **Payload 2 (Overflow - Name):**
   ```json
   {
     "name": "A".repeat(10000),
     "email": "attacker@spam.com",
     "message": "Overflow",
     "createdAt": "2026-07-04T12:00:00Z"
   }
   ```
3. **Payload 3 (Overflow - Message):**
   ```json
   {
     "name": "Attacker",
     "email": "attacker@spam.com",
     "message": "A".repeat(100000),
     "createdAt": "2026-07-04T12:00:00Z"
   }
   ```
4. **Payload 4 (Missing Required Field):**
   ```json
   {
     "name": "Attacker",
     "message": "Missing email field",
     "createdAt": "2026-07-04T12:00:00Z"
   }
   ```

### Visits Exploits
5. **Payload 5 (Overly Large Path):**
   ```json
   {
     "visitorId": "vid-123",
     "path": "/".repeat(2000),
     "timestamp": "2026-07-04T12:00:00Z"
   }
   ```
6. **Payload 6 (Invalid Data Types):**
   ```json
   {
     "visitorId": 12345,
     "path": "/home",
     "timestamp": "2026-07-04T12:00:00Z"
   }
   ```
7. **Payload 7 (Shadow Fields):**
   ```json
   {
     "visitorId": "vid-123",
     "path": "/home",
     "timestamp": "2026-07-04T12:00:00Z",
     "custom_tracking_flag": "malicious"
   }
   ```
8. **Payload 8 (Empty Strings):**
   ```json
   {
     "visitorId": "",
     "path": "/home",
     "timestamp": "2026-07-04T12:00:00Z"
   }
   ```

### Settings Exploits
9. **Payload 9 (Too Short Password):**
   ```json
   {
     "password": "123"
   }
   ```
10. **Payload 10 (Too Large Password):**
    ```json
    {
      "password": "A".repeat(1000)
    }
    ```
11. **Payload 11 (Invalid Schema Setting):**
    ```json
    {
      "password": "secure_password",
      "extra_config": "malicious_injection"
    }
    ```
12. **Payload 12 (Empty Setting):**
    ```json
    {
      "password": ""
    }
    ```

---

## 3. Test Validation Plan

We will enforce these payloads mathematically inside the security rules by:
1. Requiring presence of all fields using `keys().hasAll(...)`.
2. Restricting size of the keys to prevent extra "shadow fields".
3. Validating the types and sizes of every single property in the request object.
