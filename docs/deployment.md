# Free deployment plan: Railway API + Neon Postgres + Vercel frontend

This deployment is intended for a small, infrequently used personal app. Free-tier limits can change. Do not upgrade to a paid plan or add a payment method unless you explicitly choose to accept charges.

## Architecture

- **Vercel:** Next.js frontend. Hobby is only for personal, non-commercial use; confirm this fits your use.
- **Railway:** FastAPI/OCR API, using the Dockerfile in `backend/`. A small volume mounted at `/data` can cache EasyOCR models and workbook files.
- **Neon:** managed PostgreSQL. Contacts and compressed original card images are stored in PostgreSQL, not on Railway's filesystem.

Railway's Free plan currently provides a limited monthly usage credit and limited per-service resources. If the credit runs out, workloads can stop. Keep the service within the Free plan and monitor usage. OCR may exceed the available memory; test a real scan before relying on this deployment.

Railway documents that volumes created during its trial can be deleted after trial credits expire. Therefore, the Railway volume is only a cache: the database remains the durable source for contact and image data. If the OCR cache volume is removed, the OCR models must be downloaded again. The generated Excel file can be recreated from PostgreSQL.

## 1. Create the Neon database

1. Create a Neon account and a PostgreSQL project in a region near the users.
2. Create a database/user if the project wizard does not create them automatically.
3. Copy the PostgreSQL connection string. Keep it private; it contains a password. Use the pooled connection string if offered and retain `sslmode=require`.

## 2. Create the Railway API service

1. Create a Railway project from the GitHub repository `Mummayiz/cardwise` and select branch `main`.
2. Set the service **Root Directory** to `/backend` so Railway builds `backend/Dockerfile`.
3. Add a Railway volume mounted at `/data` only if you want to cache OCR models and workbook files. This is disposable cache, not the sole copy of user data. The Free plan's volume limit is small, so watch usage.
4. Add these service variables in Railway (values are private; never paste them in chat):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon connection string |
   | `SECRET_KEY` | A newly generated, long random secret |
   | `UPLOAD_DIR` | `/data/uploads` |
   | `EXPORT_DIR` | `/data/private_exports` |
   | `EASYOCR_MODULE_PATH` | `/data/easyocr` |
   | `MAX_FILE_SIZE_MB` | `10` |
   | `CORS_ORIGINS` | The final Vercel origin, e.g. `https://your-app.vercel.app` |

5. Generate a Railway public domain for the API. Railway supplies the `PORT` variable used by the Docker image.
6. Set Railway's health check path to `/health` and wait for the service to report healthy.

## 3. Deploy the frontend to Vercel

1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Add the build environment variable `NEXT_PUBLIC_API_URL` with the Railway API URL plus `/api/v1`, for example `https://your-api.up.railway.app/api/v1`.
4. Deploy and note the final Vercel origin.
5. Add that exact origin to Railway's `CORS_ORIGINS` variable, then redeploy the API.

## 4. Verify before using real contact data

1. Register and sign in.
2. Scan one test card and confirm the contact is saved.
3. Download Excel and VCF.
4. Restart/redeploy the API and confirm contacts and card images remain in Neon. Download Excel and confirm it regenerates from the database.
5. Test another scan after the API has gone idle. Record cold-start delay and check Railway memory/usage. If the OCR process runs out of memory or the Free credit is insufficient, stop before uploading real contacts.

## Local Docker Compose

For a local full-stack run, copy `.env.example` to `.env`, replace both example secrets with long random hex values, then run `docker compose up --build`. The frontend is available at `http://localhost:3000`. The database and app files use named Docker volumes. Do not run `docker compose down -v` unless you intend to delete those local volumes and their data.
