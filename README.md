# 0xPay

```dotenv
API_SECRET="a09aeabe7b92d56434c6fef20e7c8f4bb589ecf1fac20dbda7b180495a1774dc" # API protection and webhook message signing, secret must be in hex format.
WEBHOOK_URL="http://localhost/api/webhook" # Webhook notifications will be sent to this server 

TON_ADDRESS_FOR_ACCEPT_PAYMENTS="UQDjL08aXGQIjXWyJmI6XW_Ce2gEDuKbbUDh0VcCos4N-cY7"
TON_API_ENDPOINT="https://toncenter.com/api/v2/jsonRPC"
TON_API_KEY="cc187e363ec5dd1467ab563c4f4ce0fa55b35b95a7ed30b3b0d14ad510e1d58f"

POSTGRES_USER="user"
POSTGRES_PASSWORD="password"
POSTGRES_DB="db"
POSTGRES_HOST="postgres" # localhost
POSTGRES_PORT="5432"
```

Provide X-Access-Token for every API request.

```shell
docker-compose pull 
docker-compose build 
docker-compose up 
```

## Webhook

The payment gateway will make a POST request to the WEBHOOK_URL for each payment sequentially, from oldest to newest,
and proceed to the next only after receiving a 2XX response.

```json5
{
  "id": "1",
  // webhook id, should be used for idempotency. If the webhook is sent more than once, the server must return a 2XX response.
  "event": "payment:new",
  "data": {
	// payment data
	"id": "1",
	// payment id 
	"txid": "1f0ad53d845255...",
	// transaction hash
	"amount": "1000000000",
	// amount in minimal units
	"token": "USDT",
	// TON, USDT
	"memo": "111",
	// Memo (unique)
	"payload": "123",
	// Your payload (can be null)
  },
  "timestamp": 1762340097
}
```
