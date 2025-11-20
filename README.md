# 0xPay

_0xPay_ is crypto payment gateway than supports TON and Jetton (USDT, NOT and other) payments based on _memo_.
Memo is used to identify payments and to minimize commission costs.

## API

Provide X-Access-Token for every API request. \
Swagger available on http://locahost/api/swagger. Do not remember set SWAGGER_ENABLED="true" in .env.

## Webhook

The payment gateway will make a POST request to the WEBHOOK_URL for each payment sequentially, from oldest to newest,
and proceed to the next only after receiving a 2XX response.

_X-Webhook-Signature_ header contain signature. You need to calculate the _HMAC-SHA256_ signature from the raw request
data using API_SECRET.
If the header signature is equal to the calculated signature, then the webhook message is legit.

```json5
{
  "id": "1", // webhook id, should be used for idempotency. If the webhook is sent more than once, the server must return a 2XX response.
  "event": "payment:new",
  "data": {// payment data
	"id": "1", // payment id 
	"txid": "1f0ad53d845255...", // transaction hash
	"amount": "1000000000", // amount in minimal units
	"token": "USDT", // TON, USDT
	"memo": "111", // Memo (unique)
	"payload": "123" // Your payload (can be null)
  },
  "timestamp": 1762340097
}
```

## Frontend integration

https://docs.ton.org/v3/guidelines/ton-connect/cookbook/ton-transfer#transfer-with-a-comment
https://docs.ton.org/v3/guidelines/ton-connect/cookbook/jetton-transfer#jetton-transfer-with-comment

Sender address you can retrieve via tonconnect, recipient address you can retrieve via call GET /api/payment/get-receiving-address

- _Jetton Master_ - you can find out by call GET /api/jetton/get-master-wallet with provided _token_.
- _Jetton Wallet_ - you can find out by call GET /api/jetton/get-jetton-wallet with provided _holder_ and _token_.

## Deployment

```dotenv
API_SECRET="<secret>" # API protection and webhook message signing, secret must be hex string.
WEBHOOK_URL="<your-server-webhook-url>" # Webhook notifications will be sent to this server 

TON_ADDRESS_FOR_ACCEPT_PAYMENTS="<address>"
TON_API_ENDPOINT="https://toncenter.com/api/v2/jsonRPC"
TON_API_KEY="<api-key>"

SWAGGER_ENABLED="true"
```

```shell
docker-compose pull # Pull images, call once 
docker-compose build # Build gateway, rebuild after make changes in src folder
docker-compose up # Start project, add -d option to start in daemon mode

# You can build gateway locally, push image to registry and pull image on the server
docker image build -t shuriken0x/0x-pay-ton:latest  -f Dockerfile ./ # replace "shuriken0x/0x-pay-ton" to your image name
docker image push shuriken0x/0x-pay-ton:latest
# Remove "build" and add "image" for backend service in docker-compose.yaml.
```


If you need TLS you must uncomment the traefik command options than concern TLS configuration in docker-compose.yaml.
Do not forget replace "example.com" with your domain. A record of YOUR domain must contain YOUR server ip.

```yaml
- "--entrypoints.websecure.http.tls.domains[0].main=example.com"
```
