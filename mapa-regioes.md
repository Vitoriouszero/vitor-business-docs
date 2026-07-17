# Re-teste de Regiões Vertex AI — v2 (100% serial)

**Data:** 2026-07-16 · **SDK** @google/genai 1.52.0 · **Node** v20.20.2 · **Client** vertexai:true
**Execução:** 100% serial, ~1s entre chamadas, ~36,5 min · **578 células** (32 endpoints × modelos, texto/imagem/vídeo)
**Artifact (visual, com heatmaps + tabela filtrável):** https://claude.ai/code/artifact/46318ca1-2df4-4c7d-953c-ac351263760f

> Versão estática e legível por IA deste relatório (sem JavaScript). Reproduz as 9 seções do original; a Seção 5 aparece **completa, sem abreviação**. Dados sanitizados. Gerado em 2026-07-17.

---

## SEÇÃO 1 — SETUP

- PM2 `google-mcp`: watch mode **disabled** (✘) — confirmado antes de criar qualquer arquivo.
- `.env` carregado como o server.js (dotenv). Chaves presentes: `GOOGLE_APPLICATION_CREDENTIALS` (arquivo existe), `GOOGLE_CLOUD_PROJECT`, `GCS_VEO_BUCKET` — todas OK (valores não impressos).
- Serialidade confirmada: uma chamada por vez, sem paralelismo, delay ~1s.
- Preflight de sanidade (gemini-2.5-flash @ global) passou (916ms) antes do run pago.

## SEÇÃO 2 — MULTI-REGIÃO (prioritária)

**Os endpoints multi-região FUNCIONAM — para texto Gemini 3.x flash.**

- `us` e `eu` são **alcançáveis**: ambos retornaram HTTP 404 **real** (não DNS/host).
- Testados nos DOIS modos: instanciação **normal** (`location:"us"`) e **baseUrl explícita** (`httpOptions.baseUrl = https://aiplatform.{us,eu}.rep.googleapis.com`). Ambos alcançam e servem os mesmos modelos.
- A sonda inicial (gemini-2.5-flash) deu 404 nos dois modos — sozinha enganaria para "não funciona". A matriz completa mostrou que servem:
- — `gemini-3.5-flash`: us(normal) 841ms · us(baseUrl) 2517ms · eu(normal) 1115ms · eu(baseUrl) 1251ms
- — `gemini-3.1-flash-lite`: us(normal) 623ms · eu(baseUrl) 1056ms · eu(normal) 1479ms · us(baseUrl) 4078ms
- **Não** servem gemini-2.5-*, imagem nem vídeo (404 em todos, nos dois modos).
- A instanciação **normal foi mais rápida** que a baseUrl `rep.googleapis.com` nesta amostra → preferir a normal.
- **Uso:** `us` é candidato válido a 2º elo de fallback para **texto 3.x flash** (failover automático entre regiões US). NÃO serve para imagem/vídeo.

## SEÇÃO 3 — LISTA NEGRA

**Vazia.** Nenhuma falha estrutural (DNS/rede/auth/location). Os 32 endpoints são válidos e alcançáveis. Toda falha foi `model-404` (modelo ausente na região), que não elimina endpoint. Zero 429.

## SEÇÃO 4 — TABELA MESTRE

578 células (uma por modalidade×modelo×endpoint). Totais: **154 OK · 424 ERRO** (423 `model-404` + 1 `rai-filtered`). Abaixo, a **matriz completa** — equivalente estático da tabela filtrável do artifact. Número = latência (ms) de sucesso · `404` = modelo indisponível no endpoint · `RAI` = bloqueado pelo filtro. Dados brutos também em `results.jsonl` / `report_data.json`.

### TEXTO

| Endpoint | g-2.5-flash | g-2.5-pro | g-2.5-flash-lite | g-3.5-flash | g-3.1-flash-lite | g-3.1-pro-preview | g-3-flash-preview |
|---|---:|---:|---:|---:|---:|---:|---:|
| `global` | 1759 | 2513 | 301 | 921 | 706 | 2630 | 913 |
| `us-west1` | 1024 | 2590 | 470 | 404 | 404 | 404 | 404 |
| `us-west4` | 669 | 2565 | 454 | 404 | 404 | 404 | 404 |
| `us-central1` | 615 | 1785 | 499 | 404 | 404 | 404 | 404 |
| `us-east1` | 699 | 2549 | 367 | 404 | 404 | 404 | 404 |
| `us-east4` | 579 | 2300 | 345 | 404 | 404 | 404 | 404 |
| `us-east5` | 507 | 2171 | 392 | 404 | 404 | 404 | 404 |
| `us-south1` | 566 | 2122 | 369 | 404 | 404 | 404 | 404 |
| `northamerica-northeast1` | 539 | 1826 | 404 | 404 | 404 | 404 | 404 |
| `southamerica-east1` | 695 | 404 | 404 | 404 | 404 | 404 | 404 |
| `europe-west1` | 572 | 2582 | 283 | 404 | 404 | 404 | 404 |
| `europe-west2` | 509 | 404 | 404 | 426 | 404 | 404 | 404 |
| `europe-west3` | 406 | 404 | 404 | 404 | 404 | 404 | 404 |
| `europe-west4` | 823 | 2570 | 361 | 404 | 404 | 404 | 404 |
| `europe-west8` | 927 | 3133 | 359 | 404 | 404 | 404 | 404 |
| `europe-west9` | 1217 | 2664 | 341 | 404 | 404 | 404 | 404 |
| `europe-north1` | 1101 | 3167 | 475 | 404 | 404 | 404 | 404 |
| `europe-central2` | 970 | 2520 | 382 | 404 | 404 | 404 | 404 |
| `europe-southwest1` | 927 | 2978 | 381 | 404 | 404 | 404 | 404 |
| `asia-south1` | 1006 | 404 | 404 | 824 | 404 | 404 | 404 |
| `asia-southeast1` | 533 | 404 | 404 | 973 | 404 | 404 | 404 |
| `asia-northeast1` | 629 | 3454 | 404 | 713 | 404 | 404 | 404 |
| `asia-northeast3` | 1071 | 404 | 404 | 404 | 404 | 404 | 404 |
| `australia-southeast1` | 828 | 404 | 404 | 404 | 404 | 404 | 404 |

_Endpoints testados sem nenhum modelo de texto (todos 404):_ `us(normal)`, `us(baseUrl)`, `eu(normal)`, `eu(baseUrl)`, `europe-west6`, `asia-east1`, `asia-east2`, `me-west1`, `me-central1`, `me-central2`.

_Colunas:_ `g-2.5-flash` = gemini-2.5-flash · `g-2.5-pro` = gemini-2.5-pro · `g-2.5-flash-lite` = gemini-2.5-flash-lite · `g-3.5-flash` = gemini-3.5-flash · `g-3.1-flash-lite` = gemini-3.1-flash-lite · `g-3.1-pro-preview` = gemini-3.1-pro-preview · `g-3-flash-preview` = gemini-3-flash-preview.

### IMAGEM

| Endpoint | imagen-4.0-fast-generate-001 | imagen-4.0-ultra-generate-001 | imagen-4.0-generate-001 | g-2.5-flash-image | g-3-pro-image | g-3.1-flash-image | g-3.1-flash-lite-image |
|---|---:|---:|---:|---:|---:|---:|---:|
| `global` | 13181 | 7188 | 15824 | 13457 | 15901 | 9737 | 2737 |
| `us-west1` | 4273 | 9256 | 6322 | 5190 | 404 | 404 | 404 |
| `us-west4` | 3881 | 9055 | 7219 | 4965 | 404 | 404 | 404 |
| `us-central1` | 3399 | 8708 | 3955 | 5033 | 404 | 404 | 404 |
| `us-east1` | 4413 | 27725 | 6074 | 5029 | 404 | 404 | 404 |
| `us-east4` | 4172 | 8221 | 6819 | 5497 | 404 | 404 | 404 |
| `us-east5` | 5291 | 6844 | RAI | 5227 | 404 | 404 | 404 |
| `us-south1` | 3906 | 8845 | 5268 | 5081 | 404 | 404 | 404 |
| `northamerica-northeast1` | 4948 | 9994 | 6254 | 404 | 404 | 404 | 404 |
| `southamerica-east1` | 7469 | 12464 | 11801 | 404 | 404 | 404 | 404 |
| `europe-west1` | 3449 | 11513 | 5678 | 5344 | 404 | 404 | 404 |
| `europe-west2` | 4395 | 9465 | 8903 | 404 | 404 | 404 | 404 |
| `europe-west3` | 4281 | 11695 | 5834 | 404 | 404 | 404 | 404 |
| `europe-west4` | 4008 | 12253 | 8159 | 5779 | 404 | 404 | 404 |
| `europe-west8` | 404 | 404 | 404 | 4936 | 404 | 404 | 404 |
| `europe-west9` | 4069 | 15363 | 9425 | 404 | 404 | 404 | 404 |
| `europe-north1` | 404 | 404 | 404 | 5144 | 404 | 404 | 404 |
| `europe-central2` | 404 | 404 | 404 | 5902 | 404 | 404 | 404 |
| `europe-southwest1` | 404 | 404 | 404 | 4836 | 404 | 404 | 404 |
| `asia-south1` | 5488 | 11871 | 9791 | 404 | 404 | 404 | 404 |
| `asia-southeast1` | 6680 | 10555 | 8931 | 404 | 404 | 404 | 404 |
| `asia-northeast1` | 6510 | 9790 | 8369 | 404 | 404 | 404 | 404 |
| `asia-northeast3` | 6313 | 9515 | 9332 | 404 | 404 | 404 | 404 |
| `australia-southeast1` | 5393 | 8536 | 8111 | 404 | 404 | 404 | 404 |

_Endpoints testados sem nenhum modelo de imagem (todos 404):_ `us(normal)`, `us(baseUrl)`, `eu(normal)`, `eu(baseUrl)`, `europe-west6`, `asia-east1`, `asia-east2`, `me-west1`, `me-central1`, `me-central2`.

_Colunas:_ `imagen-4.0-fast-generate-001` = imagen-4.0-fast-generate-001 · `imagen-4.0-ultra-generate-001` = imagen-4.0-ultra-generate-001 · `imagen-4.0-generate-001` = imagen-4.0-generate-001 · `g-2.5-flash-image` = gemini-2.5-flash-image · `g-3-pro-image` = gemini-3-pro-image · `g-3.1-flash-image` = gemini-3.1-flash-image · `g-3.1-flash-lite-image` = gemini-3.1-flash-lite-image.

### VÍDEO

| Endpoint | veo-3.1-fast-generate-001 | veo-3.1-generate-001 | veo-3.1-lite-generate-001 |
|---|---:|---:|---:|
| `global` | 10356 | 165 | 158 |
| `us-central1` | 362 | 192 | 184 |

_Endpoints testados sem nenhum modelo de vídeo (todos 404):_ `us(normal)`, `us(baseUrl)`, `eu(normal)`, `eu(baseUrl)`, `us-west1`, `us-west4`, `us-east1`, `us-east4`, `us-east5`, `us-south1`, `northamerica-northeast1`, `southamerica-east1`, `europe-west1`, `europe-west2`, `europe-west3`, `europe-west4`, `europe-west6`, `europe-west8`, `europe-west9`, `europe-north1`, `europe-central2`, `europe-southwest1`, `asia-east1`, `asia-east2`, `asia-south1`, `asia-southeast1`, `asia-northeast1`, `asia-northeast3`, `australia-southeast1`, `me-west1`, `me-central1`, `me-central2`.

_Colunas:_ `veo-3.1-fast-generate-001` = veo-3.1-fast-generate-001 · `veo-3.1-generate-001` = veo-3.1-generate-001 · `veo-3.1-lite-generate-001` = veo-3.1-lite-generate-001.

## SEÇÃO 5 — MAPA POR MODELO (ordenado por latência — confiável, pois serial)

Listas **completas** — todos os endpoints de cada modelo, sem abreviação (esta é a diferença face ao RELATORIO.md original, que truncava com "…").

### TEXTO

**`gemini-2.5-flash`** (24 endpoints) — melhor `europe-west3` 406 ms · pior `global` 1.76 s

| # | Endpoint | ms |
|---:|---|---:|
| 1 | `europe-west3` | 406 |
| 2 | `us-east5` | 507 |
| 3 | `europe-west2` | 509 |
| 4 | `asia-southeast1` | 533 |
| 5 | `northamerica-northeast1` | 539 |
| 6 | `us-south1` | 566 |
| 7 | `europe-west1` | 572 |
| 8 | `us-east4` | 579 |
| 9 | `us-central1` | 615 |
| 10 | `asia-northeast1` | 629 |
| 11 | `us-west4` | 669 |
| 12 | `southamerica-east1` | 695 |
| 13 | `us-east1` | 699 |
| 14 | `europe-west4` | 823 |
| 15 | `australia-southeast1` | 828 |
| 16 | `europe-west8` | 927 |
| 17 | `europe-southwest1` | 927 |
| 18 | `europe-central2` | 970 |
| 19 | `asia-south1` | 1006 |
| 20 | `us-west1` | 1024 |
| 21 | `asia-northeast3` | 1071 |
| 22 | `europe-north1` | 1101 |
| 23 | `europe-west9` | 1217 |
| 24 | `global` | 1759 |

**`gemini-2.5-pro`** (17 endpoints) — melhor `us-central1` 1.78 s · pior `asia-northeast1` 3.45 s

| # | Endpoint | ms |
|---:|---|---:|
| 1 | `us-central1` | 1785 |
| 2 | `northamerica-northeast1` | 1826 |
| 3 | `us-south1` | 2122 |
| 4 | `us-east5` | 2171 |
| 5 | `us-east4` | 2300 |
| 6 | `global` | 2513 |
| 7 | `europe-central2` | 2520 |
| 8 | `us-east1` | 2549 |
| 9 | `us-west4` | 2565 |
| 10 | `europe-west4` | 2570 |
| 11 | `europe-west1` | 2582 |
| 12 | `us-west1` | 2590 |
| 13 | `europe-west9` | 2664 |
| 14 | `europe-southwest1` | 2978 |
| 15 | `europe-west8` | 3133 |
| 16 | `europe-north1` | 3167 |
| 17 | `asia-northeast1` | 3454 |

**`gemini-2.5-flash-lite`** (15 endpoints) — melhor `europe-west1` 283 ms · pior `us-central1` 499 ms

| # | Endpoint | ms |
|---:|---|---:|
| 1 | `europe-west1` | 283 |
| 2 | `global` | 301 |
| 3 | `europe-west9` | 341 |
| 4 | `us-east4` | 345 |
| 5 | `europe-west8` | 359 |
| 6 | `europe-west4` | 361 |
| 7 | `us-east1` | 367 |
| 8 | `us-south1` | 369 |
| 9 | `europe-southwest1` | 381 |
| 10 | `europe-central2` | 382 |
| 11 | `us-east5` | 392 |
| 12 | `us-west4` | 454 |
| 13 | `us-west1` | 470 |
| 14 | `europe-north1` | 475 |
| 15 | `us-central1` | 499 |

**`gemini-3.5-flash`** (9 endpoints) — melhor `europe-west2` 426 ms · pior `us(baseUrl)` 2.52 s

| # | Endpoint | ms |
|---:|---|---:|
| 1 | `europe-west2` | 426 |
| 2 | `asia-northeast1` | 713 |
| 3 | `asia-south1` | 824 |
| 4 | `us(normal)` | 841 |
| 5 | `global` | 921 |
| 6 | `asia-southeast1` | 973 |
| 7 | `eu(normal)` | 1115 |
| 8 | `eu(baseUrl)` | 1251 |
| 9 | `us(baseUrl)` | 2517 |

**`gemini-3.1-flash-lite`** (5 endpoints) — melhor `us(normal)` 623 ms · pior `us(baseUrl)` 4.08 s

| # | Endpoint | ms |
|---:|---|---:|
| 1 | `us(normal)` | 623 |
| 2 | `global` | 706 |
| 3 | `eu(baseUrl)` | 1056 |
| 4 | `eu(normal)` | 1479 |
| 5 | `us(baseUrl)` | 4078 |

**`gemini-3.1-pro-preview`** (1 endpoint) — melhor `global` 2.63 s · pior `global` 2.63 s

| # | Endpoint | ms |
|---:|---|---:|
| 1 | `global` | 2630 |

**`gemini-3-flash-preview`** (1 endpoint) — melhor `global` 913 ms · pior `global` 913 ms

| # | Endpoint | ms |
|---:|---|---:|
| 1 | `global` | 913 |

### IMAGEM

**`imagen-4.0-fast-generate-001`** (20 endpoints) — melhor `us-central1` 3.40 s · pior `global` 13.2 s

| # | Endpoint | ms | Tam. b64 |
|---:|---|---:|---:|
| 1 | `us-central1` | 3399 | 1,021,772 |
| 2 | `europe-west1` | 3449 | 772,252 |
| 3 | `us-west4` | 3881 | 521,036 |
| 4 | `us-south1` | 3906 | 748,636 |
| 5 | `europe-west4` | 4008 | 760,028 |
| 6 | `europe-west9` | 4069 | 853,920 |
| 7 | `us-east4` | 4172 | 1,208,532 |
| 8 | `us-west1` | 4273 | 1,174,900 |
| 9 | `europe-west3` | 4281 | 895,040 |
| 10 | `europe-west2` | 4395 | 1,297,360 |
| 11 | `us-east1` | 4413 | 823,076 |
| 12 | `northamerica-northeast1` | 4948 | 1,125,576 |
| 13 | `us-east5` | 5291 | 816,660 |
| 14 | `australia-southeast1` | 5393 | 826,008 |
| 15 | `asia-south1` | 5488 | 916,676 |
| 16 | `asia-northeast3` | 6313 | 1,106,212 |
| 17 | `asia-northeast1` | 6510 | 1,079,980 |
| 18 | `asia-southeast1` | 6680 | 498,736 |
| 19 | `southamerica-east1` | 7469 | 1,066,256 |
| 20 | `global` | 13181 | 809,248 |

**`imagen-4.0-ultra-generate-001`** (20 endpoints) — melhor `us-east5` 6.84 s · pior `us-east1` 27.7 s

| # | Endpoint | ms | Tam. b64 |
|---:|---|---:|---:|
| 1 | `us-east5` | 6844 | 1,016,368 |
| 2 | `global` | 7188 | 682,260 |
| 3 | `us-east4` | 8221 | 1,094,404 |
| 4 | `australia-southeast1` | 8536 | 345,332 |
| 5 | `us-central1` | 8708 | 714,888 |
| 6 | `us-south1` | 8845 | 675,368 |
| 7 | `us-west4` | 9055 | 1,100,412 |
| 8 | `us-west1` | 9256 | 786,092 |
| 9 | `europe-west2` | 9465 | 1,008,724 |
| 10 | `asia-northeast3` | 9515 | 1,174,600 |
| 11 | `asia-northeast1` | 9790 | 398,148 |
| 12 | `northamerica-northeast1` | 9994 | 336,960 |
| 13 | `asia-southeast1` | 10555 | 1,186,300 |
| 14 | `europe-west1` | 11513 | 380,016 |
| 15 | `europe-west3` | 11695 | 376,080 |
| 16 | `asia-south1` | 11871 | 1,176,516 |
| 17 | `europe-west4` | 12253 | 960,296 |
| 18 | `southamerica-east1` | 12464 | 382,768 |
| 19 | `europe-west9` | 15363 | 410,984 |
| 20 | `us-east1` | 27725 | 480,748 |

**`imagen-4.0-generate-001`** (19 endpoints) — melhor `us-central1` 3.96 s · pior `global` 15.8 s

| # | Endpoint | ms | Tam. b64 |
|---:|---|---:|---:|
| 1 | `us-central1` | 3955 | 1,045,288 |
| 2 | `us-south1` | 5268 | 489,292 |
| 3 | `europe-west1` | 5678 | 731,912 |
| 4 | `europe-west3` | 5834 | 483,272 |
| 5 | `us-east1` | 6074 | 503,224 |
| 6 | `northamerica-northeast1` | 6254 | 1,377,384 |
| 7 | `us-west1` | 6322 | 1,164,288 |
| 8 | `us-east4` | 6819 | 850,900 |
| 9 | `us-west4` | 7219 | 1,073,180 |
| 10 | `australia-southeast1` | 8111 | 725,700 |
| 11 | `europe-west4` | 8159 | 645,284 |
| 12 | `asia-northeast1` | 8369 | 720,576 |
| 13 | `europe-west2` | 8903 | 431,476 |
| 14 | `asia-southeast1` | 8931 | 610,528 |
| 15 | `asia-northeast3` | 9332 | 637,084 |
| 16 | `europe-west9` | 9425 | 381,248 |
| 17 | `asia-south1` | 9791 | 1,010,016 |
| 18 | `southamerica-east1` | 11801 | 416,684 |
| 19 | `global` | 15824 | 415,432 |

**`gemini-2.5-flash-image`** (14 endpoints) — melhor `europe-southwest1` 4.84 s · pior `global` 13.5 s

| # | Endpoint | ms | Tam. b64 |
|---:|---|---:|---:|
| 1 | `europe-southwest1` | 4836 | 251,908 |
| 2 | `europe-west8` | 4936 | 241,956 |
| 3 | `us-west4` | 4965 | 200,928 |
| 4 | `us-east1` | 5029 | 951,432 |
| 5 | `us-central1` | 5033 | 994,836 |
| 6 | `us-south1` | 5081 | 926,300 |
| 7 | `europe-north1` | 5144 | 412,216 |
| 8 | `us-west1` | 5190 | 357,724 |
| 9 | `us-east5` | 5227 | 1,013,392 |
| 10 | `europe-west1` | 5344 | 955,760 |
| 11 | `us-east4` | 5497 | 1,327,832 |
| 12 | `europe-west4` | 5779 | 1,224,828 |
| 13 | `europe-central2` | 5902 | 967,472 |
| 14 | `global` | 13457 | 807,720 |

**`gemini-3-pro-image`** (1 endpoint) — melhor `global` 15.9 s · pior `global` 15.9 s

| # | Endpoint | ms | Tam. b64 |
|---:|---|---:|---:|
| 1 | `global` | 15901 | 128,240 |

**`gemini-3.1-flash-image`** (1 endpoint) — melhor `global` 9.74 s · pior `global` 9.74 s

| # | Endpoint | ms | Tam. b64 |
|---:|---|---:|---:|
| 1 | `global` | 9737 | 1,442,544 |

**`gemini-3.1-flash-lite-image`** (1 endpoint) — melhor `global` 2.74 s · pior `global` 2.74 s

| # | Endpoint | ms | Tam. b64 |
|---:|---|---:|---:|
| 1 | `global` | 2737 | 27,408 |

### VÍDEO (latência = iniciação; geração roda no servidor)

**`veo-3.1-fast-generate-001`** (2 endpoints) — melhor `us-central1` 362 ms · pior `global` 10.4 s

| # | Endpoint | ms | Detalhe |
|---:|---|---:|---|
| 1 | `us-central1` | 362 | iniciou OK, timeout no poll (init=362ms) |
| 2 | `global` | 10356 | DONE init=10356ms total=132151ms uri=gs://<redacted> |

**`veo-3.1-generate-001`** (2 endpoints) — melhor `global` 165 ms · pior `us-central1` 192 ms

| # | Endpoint | ms | Detalhe |
|---:|---|---:|---|
| 1 | `global` | 165 | iniciou OK, timeout no poll (init=165ms) |
| 2 | `us-central1` | 192 | DONE init=192ms total=61870ms uri=gs://<redacted> |

**`veo-3.1-lite-generate-001`** (2 endpoints) — melhor `global` 158 ms · pior `us-central1` 184 ms

| # | Endpoint | ms | Detalhe |
|---:|---|---:|---|
| 1 | `global` | 158 | DONE init=158ms total=122071ms uri=gs://<redacted> |
| 2 | `us-central1` | 184 | DONE init=184ms total=82701ms uri=gs://<redacted> |

## SEÇÃO 6 — CADEIA DE FALLBACK RECOMENDADA

- **Texto:** `global → us-central1 → us-east5 → us(multi)`. global serve os 7 (único com 3.1-pro-preview e 3-flash-preview). Família 2.5: us-central1/us-east5 rápidos. 3.x flash: us multi-região (failover US). 3.5-flash puro mais rápido em europe-west2 (426ms).
- **Imagem:** `global → us-central1 → us-east1/us-west4 → europe-west1`. global **obrigatório** p/ Nano Banana 3.x. Imagen 4 tem ~20 regiões de fallback; us-central1 lidera. us/eu NÃO servem imagem.
- **Vídeo:** `global → us-central1` (**não há 3º elo** — só esses 2 endpoints hospedam Veo). Alertar: redundância de vídeo = 2 endpoints apenas.

## SEÇÃO 7 — COMPARAÇÃO COM O TESTE ANTERIOR

- **Imagen 4 & Veo = "só global+us-central1"** → **DIVERGE (parcial):** Imagen 4 funciona em ~19–20 regiões cada variante; Veo confirma só global+us-central1.
- **gemini-3.5-flash em 5 regiões** → **DIVERGE:** 9 endpoint-modos (europe-west2, asia-northeast1, asia-south1, asia-southeast1, global, + us/eu ×2 modos).
- **Nano Banana 3.x = global-only** → **CONFIRMA.**
- **22 endpoints, 4× 429 falsos** → agora **32 endpoints, 0× 429**; multi-região us/eu (faltavam) investigados a fundo nos 2 modos.

## SEÇÃO 8 — LIMPEZA

- GCS: 7 objetos gravados sob `region-test-v2/` — **7/7 deletados** (1ª passada); 2ª e 3ª passadas encontraram **0 órfãos**. Guarda de prefixo: nada fora de `region-test-v2/` tocado.
- server.js **não editado** · PM2 **não reiniciado** · .env **intacto** · **nenhum commit/push**.
- Script temporário `_region_test_v2_tmp.mjs` **deletado**; `git status` = ` M package-lock.json` (pré-existente, não tocado).

## SEÇÃO 9 — OBSERVAÇÕES / ANOMALIAS

- **6 endpoints válidos servem ZERO modelos** (texto+imagem+vídeo): `europe-west6`, `asia-east1`, `asia-east2`, `me-west1`, `me-central1`, `me-central2`. Não usar em fallback.
- **1 filtro RAI** (não é falha de endpoint): imagen-4.0-generate-001 @ us-east5 barrou o prompt do círculo cinza ("you will not be charged"); mesmo modelo funcionou em ~18 outras regiões.
- **Zero 429** em toda a execução — objetivo central do re-teste serial atingido.
- **Doc oficial contrariada:** gemini-3.5-flash (ausente na doc) funciona; IDs de imagem 3.x GA (sem `-preview`) são os válidos.
- **Variância de geração de vídeo:** 61s a >180s no mesmo modelo; latência de **iniciação** (usada no mapa) é estável (~160–360ms).

---

**Proveniência & sanitização:** documento estático (sem JavaScript) gerado a partir do `report_data.json` original (sha256 `d9ee0762…`). Reproduz fielmente as 9 seções do `RELATORIO.md` do VPS, com a Seção 5 completa (todos os endpoints). Sanitizado para repositório público: nenhum project id, bucket GCS, IP, token, API key ou service-account presente. Dados estruturados completos em `mapa-regioes-data.json` (mesma pasta).
