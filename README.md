# 0xPay

```dotenv
API_SECRET="<secret>" # API protection and webhook message signing, secret must be in hex format.
WEBHOOK_URL="http://localhost/api/webhook" # Webhook notifications will be sent to this server 

TON_ADDRESS_FOR_ACCEPT_PAYMENTS="<address>"
TON_API_ENDPOINT="https://toncenter.com/api/v2/jsonRPC"
TON_API_KEY="<api-key>"

POSTGRES_USER="user"
POSTGRES_PASSWORD="password"
POSTGRES_DB="db"
POSTGRES_HOST="postgres" # localhost
POSTGRES_PORT="5432"
```

Provide X-Access-Token for every API request.

```shell
docker-compose pull # Pull images, call once 
docker-compose build # Build gateway, rebuild after makes changes in src folder
docker-compose up # Start project, add -d option to start in daemon mode

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
