
# Tech Tunes

![Penelope](frontend/src/assets/penelope.png)


# Running

## Frontend
```
cd frontend
// only for initial setup
npm install
npm run dev
```

## Backend
```
cd backend
python -m venv venv
source venv/bin/activate
// only for initial setup
pip install -r requirements.txt
fastapi run
```

Stripe webhook
```
stripe login
stripe listen --forward-to localhost:8000/webhook/stripe
```