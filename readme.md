# Start up codes

## Pod configurations
* **Graphic card:** `ANY of Nvidia`
* **Template:** `Community -> Ubuntu:latest`
* **Container disk:** `40Gb`
* **Volume disk:** `0Gb`
* **Check SSH Terminal Access:** `True`
* **Setup time:** *~6min*

## Graphic results - FluxDev
| Name | Time to generate (Cold) | Time to generate (Hot) | *comunity* $/h |  *secure* $/h |
|-|:-:|:-:|-|-|
| RTX A4000 | *~172 S/img* | *~54 S/img* | 0,17 $/h | 0,29 $/h |
| RTX 3090 | *~50 S/img* | *~38 S/img* | 0,22 $/h | 0,43 $/h |
| RTX 5090 | NO WORKS | NO WORKS | 0,69 $/h | 0,89 $/h |
| RTX A5000 | *~90 S/img* | *~37.5 S/img* | 0,16 $/h | 0,26 $/h |
| A40 | *~56 S/img* | *~28 S/img* | N/A | 0,4 $/h |
| RTX A6000 | *~46 S/img* | *~26 S/img* | 0,33 $/h | 0,49 $/h |
| RTX A6000 Ada | *~33 S/img* | *~24 S/img* | 0,74 $/h | 0,77 $/h |
| RTX 4090 | *~28 S/img* | *~19 S/img* | 0,34 $/h | 0,69 $/h |
| L40S | *~25 S/img* | *~17 S/img* | 0,79 $/h | 0,86 $/h |
| H100 SXM | *~32 S/img* | *~9.5 S/img* | 2,69 $/h | 2,99 $/h |
| H200 SXM | *~19 S/img* | *~9 S/img* | 3,59 $/h | 3/99 $/h |

## Serverles - Schnell

| Name | Time to generate | $/s | Test 100 |
|-|:-:|-|-|
| RTX 4090 (24gb *pro*) | *~3.551 S/img* | 0,00031 $/s * worker | 21,27$ ->  21,26$|

* Cost per image: `$0.00110`

## Serverles - Dev

| Name | Time to generate | $/s | Test 100 |
|-|:-:|-|-|
| RTX 4090 (24gb *pro*) | *~18.36 S/img* | 0,00031 $/s * worker | 20,44$ ->  19,88$|

* Cost per image: `$0.0057`

## How to set up a pod

### 1. Connect by ssh or web console
Conect to de pot for web console or SSH *(You need generate and add your public key in Runpod to conect by SSH)*
``` bash
ssh root@123.456.7.89 -p 40121 -i ~/.ssh/id_ed25519
```

### 2. Download server
``` bash
# CHANGE THIS URL
wget https://raw.githubusercontent.com/Alberto-Arias-x64/comfy-serever/main/utils/setup.sh -O setup.sh
source setup.sh
```

### 3. Config cloudflare
``` bash
cat <<EOF > /home/flux/server/config/cloudflare-service.json
{
  "region": "auto",
  "endpoint": "firebase endpont",
  "credentials": {
    "accessKeyId": "firebase access key",
    "secretAccessKey": "firebase secret key"
  }
}
EOF
```

### 4. Config firebase
``` bash
cat <<EOF > /home/flux/server/config/firebase-service.json
{
  "type": "service_account",
  "project_id": "dev-tattoo-ai",
  "private_key_id": "firabese key id",
  "private_key": "-----BEGIN PRIVATE KEY-----\firebase key\n-----END PRIVATE KEY-----\n",
  "client_email": "client email",
  "client_id": "cliend id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40dev-tattoo-ai.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
EOF
```
### 5.1. Dowload Flux Dev model of hugging face
``` bash
cd /home/flux/ComfyUI/models/checkpoints
curl -L -O \
  -H "Authorization: Bearer <Your huggin face apy key>" \
  https://huggingface.co/Comfy-Org/flux1-dev/resolve/main/flux1-dev-fp8.safetensors

```

### 5.2. Dowload Flux Snell model of hugging face
``` bash
cd /home/flux/ComfyUI/models/checkpoints
curl -L -O \
  -H "Authorization: Bearer <Your huggin face apy key>" \
  https://huggingface.co/Comfy-Org/flux1-schnell/resolve/main/flux1-schnell-fp8.safetensors

```

### 6. Start server
``` bash
pm2 start /home/flux/server/utils/ecosystem.config.json
pm2 logs
```