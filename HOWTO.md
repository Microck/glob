# HOWTO: Setting up glob infrastructure

This guide covers the necessary steps to set up the authentication, database, and payment systems for the **glob** application.

---

## 1. Authentication: Clerk

1.  **Create an Account**: Sign up at [Clerk.com](https://clerk.com/).
2.  **Create an Application**: Set up a new application named "glob".
3.  **Configure Social Connections**: Enable Google, GitHub, or just Email/Password.
4.  **Get Keys**:
    *   Copy the **Publishable Key** (starts with `pk_test_`).
    *   Copy the **Secret Key** (starts with `sk_test_`).
5.  **Environment Variables**:
    *   Frontend: Add `VITE_CLERK_PUBLISHABLE_KEY` to your `.env` file.
    *   Backend: Add `CLERK_SECRET_KEY` to your API `.env` file.

---

## 2. Database: Supabase

1.  **Create a Project**: Sign up at [Supabase.com](https://supabase.com/) and create a new project.
2.  **Run Schema SQL**:
    *   Open the **SQL Editor** in the Supabase dashboard.
    *   Paste the contents of `supabase_setup.sql` (found in the project root) and run it. This creates the `profiles` and `optimizations` tables with the correct RLS policies.
    *   *Note*: Ensure your user ID in Supabase matches the Clerk User ID.
3.  **Get Credentials**:
    *   Go to **Project Settings > API**.
    *   Copy the **Project URL**.
    *   Copy the **service_role** secret key (needed for backend writes).
4.  **Environment Variables**:
    *   Both: Add `NEXT_PUBLIC_SUPABASE_URL`.
    *   Backend: Add `SUPABASE_SERVICE_ROLE_KEY`.

---

## 3. Payments: Polar.sh

1.  **Create an Account**: Sign up at [Polar.sh](https://polar.sh/).
2.  **Create a Product**:
    *   Create a product named "globber".
    *   Set the price (e.g., $9/mo).
3.  **Configure Webhooks**:
    *   Go to **Developer Settings > Webhooks**.
    *   Add a new endpoint pointing to: `https://your-api-domain.com/api/webhooks/polar`.
    *   For local testing, use a tool like [ngrok](https://ngrok.com/) to tunnel your local port (default 3001) and use that URL.
    *   Select events: `subscription.created`, `subscription.updated`.
4.  **Get Webhook Secret**: Copy the **Webhook Secret** (starts with `whsec_`).
5.  **Environment Variables**:
    *   Backend: Add `POLAR_WEBHOOK_SECRET`.

---

## 4. Environment Variables Checklist

Ensure these are present in your deployment or local `.env` files:

### Frontend (`.env`)
```ini
VITE_CLERK_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_SUPABASE_URL=https://...
```

### Backend API (`api/.env`)
```ini
PORT=3001
CORS_ORIGINS=http://localhost:5173
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLERK_SECRET_KEY=sk_...
POLAR_WEBHOOK_SECRET=whsec_...
```

---

## 5. Running Locally

1.  **Install Dependencies**: `npm install` in the root and `npm install` in the `api` folder.
2.  **Start API**: `npm run api:dev`
3.  **Start Frontend**: `npm run dev`

