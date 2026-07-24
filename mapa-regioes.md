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

---

## SEÇÃO 10 — GERAÇÃO CONDICIONADA POR REFERÊNCIA

> **Conjunto de dados distinto.** Tudo acima nesta página descreve geração **texto→imagem** (578 células, teste de 2026-07-16). Esta seção descreve **geração condicionada por imagem de referência** (10 células, teste de 2026-07-23). São **capacidades diferentes**, medidas por experimentos diferentes, e os dois números **não devem ser somados**. Dados estruturados sob a chave `reference_conditioned_generation` em `mapa-regioes-data.json`.

### 10.1 Objetivo e pergunta de pesquisa

O servidor MCP tem tools (`imagen_edit`, com 4 modos, e `remove_background`) que geram imagens a partir de uma ou duas imagens de referência + prompt de texto, pela rota `models.generateContent` do SDK, enviando as imagens como `inlineData`. Todas essas chamadas estão fixas em `gemini-2.5-flash-image` e na região fixa do ambiente, **sem qualquer cadeia de fallback**.

O mapa de regiões acima testou exclusivamente geração **texto→imagem** (prompt puro, sem imagem de entrada). Geração condicionada por referência é tecnicamente distinta: o modelo precisa aceitar `inlineData` de imagem na entrada multimodal **e ainda assim** devolver uma imagem na saída. Um modelo pode gerar imagens a partir de texto e mesmo assim rejeitar (HTTP 400) a presença de uma imagem de entrada, ou aceitá-la e devolver apenas texto descritivo. **Uma capacidade não pode ser inferida da outra.**

Pergunta: quais modelos, além do `gemini-2.5-flash-image` em uso, (a) aceitam imagem de referência via `inlineData` na rota `generateContent` sem rejeitar o formato, (b) efetivamente devolvem uma imagem na resposta, e (c) aceitam também **duas** imagens de referência simultâneas? Isso é pré-requisito factual para desenhar uma cadeia de fallback (modelo × região) para essas tools.

Fora do escopo, por fato já verificado: a família **Imagen 4** usa a rota `models.generateImages`, cujo `GenerateImagesConfig` não possui campo de imagem de referência no SDK 1.52.0. Imagen 4 foi excluído por essa razão.

### 10.2 Metodologia

**Rota e assinatura exata.** Todas as células usaram exclusivamente `models.generateContent`:

```js
const response = await client.models.generateContent({
  model,                                              // ex.: "gemini-3-pro-image"
  config: { responseModalities: ["TEXT", "IMAGE"] },
  contents,                                           // array de parts, ver abaixo
});
```

A extração da imagem seguiu o mesmo padrão do `server.js` (linhas 193-195, 2913-2915, 2955-2957): varre `response.candidates[0].content.parts` e pega o primeiro `part.inlineData.data`. Também foram capturados `finishReason` e `promptFeedback.blockReason` em todas as células, para distinguir "resposta vazia" de "bloqueio de conteúdo".

**Ordem das parts — texto primeiro, imagens depois.** É a ordem que o `server.js` já usa em `generateImageWithFallback` (linhas 183-187) e em `imagen_edit` modo `generate_with_reference` (linhas 2940-2948).

```js
// Experimento 1 (uma referência)
contents = [
  { text: PROMPT_EXP1 },
  { inlineData: { mimeType: "image/jpeg", data: <base64 da foto do produto> } },
]

// Experimento 2 (duas referências)
contents = [
  { text: PROMPT_EXP2 },
  { inlineData: { mimeType: "image/jpeg", data: <base64 da foto original> } },
  { inlineData: { mimeType: <mime da saída do Exp.1>, data: <base64 da saída do Exp.1 do MESMO modelo> } },
]
```

A segunda referência do Exp.2 foi a **saída bem-sucedida do Exp.1 do próprio modelo/região**, não uma imagem fixa. Isso simula o fluxo real da pipeline (ref1 gera imagem 2; ref1 + ref2 geram imagem 3) e mantém cada célula do Exp.2 autoconsistente com a do Exp.1.

**Imagem de referência.** `<APP_DIR>/downloads/images/<DRIVE_FILE_ID>.jpg` — cache local de um fileId do Drive, produzido por `resolveImagePath` (`server.js` linha 410), portanto byte-a-byte o mesmo arquivo que a pipeline de produção usaria. JPEG baseline, 532 × 443 px, 15.206 bytes, `image/jpeg`. Conferida visualmente: aspirador de pó portátil, corpo verde-escuro fosco, reservatório transparente esfumaçado, empunhadura tipo pistola com estrias pretas, bico prateado, sobre fundo branco. Nenhuma chamada à API do Drive foi feita.

**Prompts literais.** Descrição canônica do produto, interpolada em ambos:

> `compact handheld vacuum cleaner, dark green body with matte finish, transparent smoke-colored reservoir, pistol-grip ergonomic handle with black rubber grooves, silver chrome nozzle tip, approximately 25cm long`

Prompt do **Experimento 1**, idêntico nas 5 células:

> `A person's hand holding this exact product while vacuuming crumbs from a light grey fabric sofa, bright natural daylight, modern living room, realistic UGC photo style, vertical composition. Product: compact handheld vacuum cleaner, dark green body with matte finish, transparent smoke-colored reservoir, pistol-grip ergonomic handle with black rubber grooves, silver chrome nozzle tip, approximately 25cm long. Preserve the exact shape, color and proportions of the product in the reference image.`

Prompt do **Experimento 2**, idêntico nas 5 células:

> `A person's hand holding this exact product while vacuuming crumbs from a kitchen floor, bright natural daylight, modern kitchen, realistic UGC photo style, vertical composition. Product: compact handheld vacuum cleaner, dark green body with matte finish, transparent smoke-colored reservoir, pistol-grip ergonomic handle with black rubber grooves, silver chrome nozzle tip, approximately 25cm long. Preserve the exact shape, color and proportions of the product in the reference image.`

A única diferença entre os dois são duas substituições de cenário, para forçar uma cena nova no Exp.2: `a light grey fabric sofa` → `a kitchen floor`, e `modern living room` → `modern kitchen`. Todo o restante é byte-a-byte idêntico.

**Client por região.** Um client por região, com cache em `Map`, seguindo `getVertexClient(location)` do `server.js` (linhas 108-122): `new GoogleGenAI({ vertexai: true, project, location })`. A região default do ambiente foi **deliberadamente ignorada**, porque a região é parte do que está sendo testado — usar o default invalidaria o resultado. O client free-tier não foi utilizado em nenhum momento; o SDK confirmou isso emitindo, exatamente 2 vezes (uma por região distinta), o aviso de que os parâmetros explícitos de projeto/região têm precedência.

**Execução serial, e por quê.** As 10 chamadas rodaram estritamente uma de cada vez, em um único `for...of` com `await`, sem `Promise.all`, sem `Promise.allSettled`, sem concorrência de qualquer tipo. Razão: execuções paralelas já corromperam resultados de testes anteriores neste projeto, produzindo **429 falsos** (o paralelismo satura a cota instantânea e faz o modelo parecer indisponível quando está apenas congestionado) e **latências inúteis** (chamadas concorrentes disputam banda e CPU, então o tempo medido não reflete o tempo real de uma chamada isolada). A latência de cada célula foi medida com `Date.now()` imediatamente antes e depois do `await`.

**Modelos e regiões, e por que essas escolhas.**

| Modelo | Região | Papel | Justificativa da região |
|---|---|---|---|
| `gemini-2.5-flash-image` | `europe-southwest1` | **Controle** (modelo em produção) | Menor latência medida para este modelo no mapa de regiões acima; é a primeira da lista dele em `IMAGE_MODEL_FALLBACK_CHAIN` |
| `gemini-2.5-flash-image` | `global` | Controle, 2ª região | Verifica se a capacidade é estável entre regiões do mesmo modelo |
| `gemini-3-pro-image` | `global` | Candidato | Modelo 3.x é global-only (404 em regiões específicas, confirmado em teste anterior) |
| `gemini-3.1-flash-image` | `global` | Candidato | Idem — global-only |
| `gemini-3.1-flash-lite-image` | `global` | Candidato | Idem — global-only |

O `gemini-2.5-flash-image` roda em 14 regiões; foram usadas as duas acima. O **controle** existe para dar linha de base: se ele falhasse, o teste inteiro seria suspeito de erro de montagem, e não de incapacidade dos modelos.

O script do teste ficou em `<TMP>/reftest.mjs`, fora do repositório, e os resultados estruturados em `<TMP>/reftest_results.json`. O SDK foi importado por caminho absoluto a partir do `node_modules` já instalado do projeto — nenhum pacote foi instalado ou atualizado.

### 10.3 Resultados — Experimento 1 (1 imagem de referência)

5 células, executadas serialmente. **Nenhum erro: 5 de 5 sucessos.**

| Modelo | Região | Resultado | Veio imagem | Bytes b64 | Latência | Dimensões |
|---|---|---|---|---:|---:|---|
| `gemini-2.5-flash-image` | `europe-southwest1` | sucesso | sim · `image/png` | 1.842.344 | 8.702 ms | 1120×928 (paisagem) |
| `gemini-2.5-flash-image` | `global` | sucesso | sim · `image/png` | 1.810.368 | 8.238 ms | 1120×928 (paisagem) |
| `gemini-3-pro-image` | `global` | sucesso | sim · `image/png` | 2.099.692 | 17.832 ms | 848×1264 (retrato) |
| `gemini-3.1-flash-image` | `global` | sucesso | sim · `image/png` | 2.548.864 | 10.784 ms | 768×1376 (retrato) |
| `gemini-3.1-flash-lite-image` | `global` | sucesso | sim · `image/jpeg` | 242.296 | 4.391 ms | 768×1376 (retrato) |

Em todas as 5: `finishReason = "STOP"`, `promptFeedback.blockReason = null`. Nenhum HTTP 400, 404 ou 429, nenhum bloqueio de conteúdo, nenhuma resposta vazia. As dimensões e o codec foram verificados com `ffprobe` sobre os arquivos gravados, não pelo `mimeType` declarado.

### 10.4 Resultados — Experimento 2 (2 imagens de referência)

Como as 5 células do Exp.1 tiveram sucesso, todos os 5 pares modelo×região foram submetidos ao Exp.2. **Nenhum erro: 5 de 5 sucessos.**

| Modelo | Região | Resultado | Veio imagem | Bytes b64 | Latência | Dimensões |
|---|---|---|---|---:|---:|---|
| `gemini-2.5-flash-image` | `europe-southwest1` | sucesso | sim · `image/png` | 1.536.036 | 10.977 ms | 1120×928 (paisagem) |
| `gemini-2.5-flash-image` | `global` | sucesso | sim · `image/png` | 1.483.944 | 9.543 ms | 1120×928 (paisagem) |
| `gemini-3-pro-image` | `global` | sucesso | sim · `image/png` | 1.883.452 | 48.141 ms | 848×1264 (retrato) |
| `gemini-3.1-flash-image` | `global` | sucesso | sim · `image/png` | 2.178.756 | 12.149 ms | 1134×944 (paisagem) |
| `gemini-3.1-flash-lite-image` | `global` | sucesso | sim · `image/jpeg` | 134.900 | 4.866 ms | 768×1376 (retrato) |

Em todas as 5: `finishReason = "STOP"`, `promptFeedback.blockReason = null`.

As 10 imagens foram gravadas em `<APP_DIR>/downloads/images/`, com nomes `reftest_exp{1,2}_<modelo>_<regiao>.png`. **Atenção:** as duas saídas do `gemini-3.1-flash-lite-image` têm extensão `.png` mas conteúdo **JPEG** — a convenção de nomes foi imposta pela especificação do teste, e o modelo devolveu `image/jpeg`. Isso não afeta viewers que detectam pelo conteúdo, mas afeta ferramentas que confiem na extensão.

### 10.5 Veredito por modelo

> ### ⚠️ AVISO CRÍTICO, VÁLIDO PARA TODOS OS VEREDITOS ABAIXO
>
> **ACEITA REFERÊNCIA não é o mesmo que PRESERVA A GEOMETRIA DO PRODUTO. A preservação geométrica NÃO foi avaliada neste teste e depende de revisão visual humana, ainda PENDENTE.**
>
> O teste mediu exclusivamente se o modelo aceita `inlineData` de imagem na entrada sem rejeitar o formato e devolve uma imagem na saída. Se essa imagem contém o produto correto — mesma forma, mesmas cores, mesmas proporções — não foi verificado e não pode ser verificado por esta via. As imagens geradas foram deliberadamente não abertas nem julgadas por quem executou o teste, para não contaminar o resultado com um juízo que não é mensurável assim. Um modelo pode aceitar a referência perfeitamente e ainda assim desenhar um produto completamente diferente. **Nenhuma frase deste documento deve ser lida como afirmando que qualquer modelo preserva a geometria do produto.**

| Modelo | Veredito | 1 ref | 2 refs | Regiões confirmadas | Latência 1 ref | Latência 2 refs | MIME |
|---|---|:-:|:-:|---|---:|---:|---|
| `gemini-2.5-flash-image` | ACEITA REFERÊNCIA | sim | sim | `europe-southwest1`, `global` | 8,2–8,7 s | 9,5–11,0 s | `image/png` |
| `gemini-3-pro-image` | ACEITA REFERÊNCIA | sim | sim | `global` | 17,8 s | 48,1 s | `image/png` |
| `gemini-3.1-flash-image` | ACEITA REFERÊNCIA | sim | sim | `global` | 10,8 s | 12,1 s | `image/png` |
| `gemini-3.1-flash-lite-image` | ACEITA REFERÊNCIA | sim | sim | `global` | 4,4 s | 4,9 s | `image/jpeg` |
| Imagen 4 (família) | **NÃO TESTADO** — excluído a priori | — | — | — | — | — | — |

Notas por modelo, todas com **preservação geométrica NÃO AVALIADA — pendente de revisão visual humana**:

- **`gemini-2.5-flash-image`** — 4 chamadas (2 regiões × 2 experimentos), 0 falhas, payloads de 1.483.944 a 1.842.344 caracteres base64. Modelo em produção; serviu de **controle**, e seu sucesso valida que a montagem das parts do teste está correta. Comportamento idêntico nas duas regiões — a capacidade é estável entre regiões. É o de latência mais previsível. **Não respeitou o pedido de composição vertical em nenhuma das 4 chamadas** (devolveu 1120×928, paisagem).
- **`gemini-3-pro-image`** — 2 chamadas, 0 falhas. Global-only; apenas `global` foi testada, e este teste **não** re-verificou o 404 em regiões específicas (premissa herdada de teste anterior). É de longe o mais lento, e o único cuja latência mais que dobrou com a segunda referência (fator 2,7×) — ver 10.6. Respeitou a composição vertical nos dois experimentos.
- **`gemini-3.1-flash-image`** — 2 chamadas, 0 falhas; os **maiores payloads** do teste. Global-only. Custo marginal baixo pela segunda referência (+12,7%). Único modelo que **mudou de orientação entre os dois experimentos** — 768×1376 (retrato) no Exp.1 e 1134×944 (paisagem) no Exp.2, com o mesmo pedido textual de composição vertical.
- **`gemini-3.1-flash-lite-image`** — 2 chamadas, 0 falhas. Global-only. **O mais rápido por larga margem**: ~2× mais rápido que o controle e até 11× mais rápido que o `gemini-3-pro-image` com 2 referências. **Único que devolve `image/jpeg`**, com payloads uma ordem de grandeza menores (135–242 KB contra 1,4–2,5 MB) **nas mesmas dimensões de pixel** (768×1376) — ou seja, compressão com perdas, não menor resolução. Isso é diretamente relevante para pipelines que encadeiam gerações (a saída de um passo vira referência do próximo, como no Exp.2): a perda por compressão pode acumular a cada iteração.

**Conclusão geral.** Todos os 4 modelos testados aceitam imagem de referência via `inlineData` na rota `generateContent`, com 1 e com 2 referências. Nenhum rejeitou o formato. Do ponto de vista estrito de aceitação de referência, os 4 são candidatos válidos para uma cadeia de fallback. A **ordem** da cadeia depende de dois fatores que este teste não resolveu: a preservação geométrica (revisão visual humana pendente) e o custo por imagem.

### 10.6 Anomalias e achados inesperados

- **Nenhuma falha em nenhuma célula.** O resultado mais inesperado é a ausência total de resultados negativos: 10 de 10 sucessos. A hipótese que motivou o teste — de que algum modelo pudesse rejeitar `inlineData` com HTTP 400 — não se materializou. Isso é informativo, mas também significa que o teste **não exercitou nenhum dos caminhos de erro** que se propunha a classificar (400, 404, bloqueio, resposta vazia). A ausência de erros é um dado, não uma validação dos classificadores de erro do script.
- **Orientação da imagem varia por modelo e nem sempre respeita o pedido.** O prompt pediu `vertical composition` em todas as células. O modelo **em produção** é justamente o que ignora o pedido, devolvendo paisagem nas 4 chamadas — contra-indicado para criativos UGC verticais. E o `gemini-3.1-flash-image` mudou de orientação entre Exp.1 e Exp.2 com o mesmo pedido textual, sugerindo que a presença de uma segunda referência influencia a razão de aspecto da saída. O `server.js` codifica a razão de aspecto **no texto do prompt** (linhas 177-180 de `generateImageWithFallback`), não por parâmetro de configuração — este achado indica que essa estratégia não é confiável de forma uniforme entre modelos. Registrado também em `achados-pipeline.md`.
- **`gemini-3-pro-image` degrada muito com a segunda referência** — 17.832 ms → 48.141 ms, fator 2,7×. Nenhum outro modelo teve degradação comparável (`gemini-2.5-flash-image` +16–26%, `gemini-3.1-flash-image` +12,7%, `gemini-3.1-flash-lite-image` +10,8%). Como o modo `generate_with_reference` do `imagen_edit` aceita uma segunda imagem, esse é o cenário real de uso, e 48 s pode estourar timeouts de cliente. **Ressalva: amostra única** — pode ser variância de carga do endpoint `global` naquele instante, e não característica do modelo. Não foi repetido.
- **Achado colateral: as narrações TTS não são WAV válidos**, o que faz o merge de áudio/vídeo truncar narração silenciosamente. Não era objeto deste teste, mas é o achado de maior impacto operacional. Documentado por completo em **[`achados-pipeline.md`](achados-pipeline.md)**.

### 10.7 Custo

| Modelo | Chamadas Exp.1 | Chamadas Exp.2 | Total | Imagens produzidas |
|---|---:|---:|---:|---:|
| `gemini-2.5-flash-image` | 2 | 2 | 4 | 4 |
| `gemini-3-pro-image` | 1 | 1 | 2 | 2 |
| `gemini-3.1-flash-image` | 1 | 1 | 2 | 2 |
| `gemini-3.1-flash-lite-image` | 1 | 1 | 2 | 2 |
| **TOTAL** | **5** | **5** | **10** | **10** |

Limite autorizado: 15 chamadas. Utilizadas: 10. Nenhuma desperdiçada em retentativa, porque não houve falhas.

**Estimativa de custo — ordem de grandeza, NÃO verificada no billing:** usando faixas públicas de preço por imagem de saída no Vertex AI (~US$ 0,04/imagem para a classe flash, ~US$ 0,13/imagem para a classe pro), o total fica em torno de **US$ 0,50 a US$ 0,60**, mais uma parcela desprezível de tokens de entrada. O custo real **não** foi consultado no console nem na API de billing do GCP.

### 10.8 Limitações — o que este teste NÃO provou

Esta lista é deliberadamente rigorosa. Superestimar o que foi provado é pior do que não ter testado.

1. **A preservação da geometria do produto NÃO foi avaliada, em nenhum modelo.** É o limite mais importante — exige revisão visual humana das 10 imagens, e essa revisão está **PENDENTE**.
2. **Amostra de tamanho 1 por célula** — sem repetições, sem medida de variância, sem intervalo de confiança. As latências são observações únicas, não médias. O outlier de 48 s pode ser característica do modelo ou ruído de carga; com n=1 é impossível distinguir.
3. **Um único prompt e um único produto de referência** (532×443, fundo branco). A aceitação de referência pode variar com o conteúdo da imagem, sua resolução, sua razão de aspecto ou o tema do prompt.
4. **Cobertura de regiões não é exaustiva** — `gemini-2.5-flash-image` roda em 14 regiões, apenas 2 testadas; para os modelos 3.x apenas `global` foi testada, e o 404 em regiões específicas **não** foi re-verificado (premissa herdada).
5. **Apenas 1 e 2 referências foram testadas** — o limite superior é desconhecido.
6. **A ordem das parts não foi variada** — apenas `[texto, imagens]`. A ordem foi fixada para replicar o padrão de produção, não para otimizá-lo.
7. **Nenhum parâmetro de config além de `responseModalities` foi exercitado** — nada de `temperature`, `seed`, `aspectRatio` ou `imageConfig`. Os achados sobre orientação referem-se apenas à estratégia atual de codificar a razão de aspecto no texto do prompt.
8. **Custo não verificado no billing do GCP.**
9. **Nenhuma falha ocorreu**, então os caminhos de erro (400 / 404 / bloqueio / vazio) não foram exercitados.
10. **Este teste valida os insumos da cadeia de fallback, não a cadeia em si.** Saber que os 4 modelos aceitam referência é condição necessária, não suficiente. A ordem depende de qualidade (não medida), custo (não verificado) e comportamento sob falha real (não observado, porque não houve falhas).

---

**Proveniência & sanitização da Seção 10:** teste executado em 2026-07-23, 23:48:01 → 23:50:08 UTC, servidor em `Etc/UTC`. Node v20.20.2, SDK `@google/genai` 1.52.0, `server.js` no commit `d3b7a8a` (2026-07-21). 10 chamadas de API, execução serial, 0 falhas. Nada foi corrigido no servidor — o teste foi somente de medição e relato; nenhum arquivo rastreado pelo git do projeto foi editado, criado ou apagado, nenhum `git pull/reset/checkout/commit/push` foi executado, PM2 não foi reiniciado nem recarregado, variáveis de ambiente não foram alteradas, nenhum pacote foi instalado. Sanitizado para repositório público: `<PROJECT>`, `<HOST>`, `<APP_DIR>`, `<PM2_LOGS>`, `<TMP>` e `<DRIVE_FILE_ID>` substituem, respectivamente, o project id do GCP, o hostname do servidor, o diretório da aplicação, o diretório de logs do PM2, o diretório temporário e o fileId do Drive. Dados estruturados completos sob `reference_conditioned_generation` em `mapa-regioes-data.json`.
