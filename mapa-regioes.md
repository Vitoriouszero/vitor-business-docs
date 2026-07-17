# Mapa Vertex AI — Regioes x Modelos x Latencia

> Diagnostico serial de disponibilidade e latencia da Vertex AI. **578** combinacoes testadas (32 endpoints x modelos de texto/imagem/video), execucao serial. Publicado em 2026-07-17.

Documento estatico gerado a partir do `report_data.json` original. Sem JavaScript, legivel integralmente por qualquer cliente HTTP. Dados sanitizados (project id, bucket e IP redigidos).

---

## 1. Resumo executivo

| Metrica | Valor |
|---|---|
| Total de celulas testadas | 578 |
| Sucessos (HTTP 200 utilizavel) | 154 |
| Falhas | 424 |
| — modelo indisponivel no endpoint (404) | 423 |
| — filtrado por RAI (Responsible AI) | 1 |
| Endpoints distintos | 32 |
| Modelos de texto | 7 |
| Modelos de imagem | 7 |
| Modelos de video | 3 |

**Leitura rapida:** a grande maioria das falhas (423 de 424) e simplesmente o modelo nao existir naquele endpoint (404). Modelos da familia 2.5 (texto/imagem) e Imagen 4.0 tem ampla cobertura regional; os modelos "3.x" de texto so respondem em `global` (e nos multi-regionais us/eu para alguns). Video (Veo 3.1) so funciona em `global` e `us-central1`.

## 2. Como ler este relatorio

- **endpoint**: regiao da Vertex AI (ex.: `us-central1`) ou o roteamento `global`. `us`/`eu` sao os multi-regionais; `(normal)` e `(baseUrl)` sao dois metodos de chamada testados para eles.
- **latencia (ms)**: para texto = tempo ate a resposta; para imagem = tempo ate os bytes da imagem; para video = tempo de **inicializacao** do job (`init`), com `total` do render quando concluido no poll.
- **404**: o modelo nao esta publicado naquele endpoint. **RAI**: a chamada funcionou (200) mas o conteudo foi bloqueado pelo filtro Responsible AI.
- As listas por modelo estao **ordenadas da menor para a maior latencia** e sao **completas** (todos os endpoints em que o modelo respondeu, sem abreviacao).

## 3. Modelos de TEXTO — ranking completo por modelo

### `gemini-2.5-pro`

Responde em **17** endpoint(s). Melhor: `us-central1` (1.78 s) · Pior: `asia-northeast1` (3.45 s).

| # | Endpoint | Latencia (ms) |
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

### `gemini-2.5-flash`

Responde em **24** endpoint(s). Melhor: `europe-west3` (406 ms) · Pior: `global` (1.76 s).

| # | Endpoint | Latencia (ms) |
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

### `gemini-2.5-flash-lite`

Responde em **15** endpoint(s). Melhor: `europe-west1` (283 ms) · Pior: `us-central1` (499 ms).

| # | Endpoint | Latencia (ms) |
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

### `gemini-3.5-flash`

Responde em **9** endpoint(s). Melhor: `europe-west2` (426 ms) · Pior: `us(baseUrl)` (2.52 s).

| # | Endpoint | Latencia (ms) |
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

### `gemini-3.1-pro-preview`

Responde em **1** endpoint(s). Melhor: `global` (2.63 s) · Pior: `global` (2.63 s).

| # | Endpoint | Latencia (ms) |
|---:|---|---:|
| 1 | `global` | 2630 |

### `gemini-3.1-flash-lite`

Responde em **5** endpoint(s). Melhor: `us(normal)` (623 ms) · Pior: `us(baseUrl)` (4.08 s).

| # | Endpoint | Latencia (ms) |
|---:|---|---:|
| 1 | `us(normal)` | 623 |
| 2 | `global` | 706 |
| 3 | `eu(baseUrl)` | 1056 |
| 4 | `eu(normal)` | 1479 |
| 5 | `us(baseUrl)` | 4078 |

### `gemini-3-flash-preview`

Responde em **1** endpoint(s). Melhor: `global` (913 ms) · Pior: `global` (913 ms).

| # | Endpoint | Latencia (ms) |
|---:|---|---:|
| 1 | `global` | 913 |

## 4. Modelos de IMAGEM — ranking completo por modelo

### `gemini-2.5-flash-image`

Responde em **14** endpoint(s). Melhor: `europe-southwest1` (4.84 s) · Pior: `global` (13.5 s).

| # | Endpoint | Latencia (ms) | Tamanho b64 |
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

### `gemini-3-pro-image`

Responde em **1** endpoint(s). Melhor: `global` (15.9 s) · Pior: `global` (15.9 s).

| # | Endpoint | Latencia (ms) | Tamanho b64 |
|---:|---|---:|---:|
| 1 | `global` | 15901 | 128,240 |

### `gemini-3.1-flash-image`

Responde em **1** endpoint(s). Melhor: `global` (9.74 s) · Pior: `global` (9.74 s).

| # | Endpoint | Latencia (ms) | Tamanho b64 |
|---:|---|---:|---:|
| 1 | `global` | 9737 | 1,442,544 |

### `gemini-3.1-flash-lite-image`

Responde em **1** endpoint(s). Melhor: `global` (2.74 s) · Pior: `global` (2.74 s).

| # | Endpoint | Latencia (ms) | Tamanho b64 |
|---:|---|---:|---:|
| 1 | `global` | 2737 | 27,408 |

### `imagen-4.0-generate-001`

Responde em **19** endpoint(s). Melhor: `us-central1` (3.96 s) · Pior: `global` (15.8 s).

| # | Endpoint | Latencia (ms) | Tamanho b64 |
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

### `imagen-4.0-ultra-generate-001`

Responde em **20** endpoint(s). Melhor: `us-east5` (6.84 s) · Pior: `us-east1` (27.7 s).

| # | Endpoint | Latencia (ms) | Tamanho b64 |
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

### `imagen-4.0-fast-generate-001`

Responde em **20** endpoint(s). Melhor: `us-central1` (3.40 s) · Pior: `global` (13.2 s).

| # | Endpoint | Latencia (ms) | Tamanho b64 |
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

## 5. Modelos de VIDEO — ranking completo por modelo

### `veo-3.1-fast-generate-001`

Responde em **2** endpoint(s). Melhor: `us-central1` (362 ms) · Pior: `global` (10.4 s).

| # | Endpoint | Init (ms) | Detalhe |
|---:|---|---:|---|
| 1 | `us-central1` | 362 | iniciou OK, timeout no poll (init=362ms) |
| 2 | `global` | 10356 | DONE init=10356ms total=132151ms uri=gs://<redacted> |

### `veo-3.1-generate-001`

Responde em **2** endpoint(s). Melhor: `global` (165 ms) · Pior: `us-central1` (192 ms).

| # | Endpoint | Init (ms) | Detalhe |
|---:|---|---:|---|
| 1 | `global` | 165 | iniciou OK, timeout no poll (init=165ms) |
| 2 | `us-central1` | 192 | DONE init=192ms total=61870ms uri=gs://<redacted> |

### `veo-3.1-lite-generate-001`

Responde em **2** endpoint(s). Melhor: `global` (158 ms) · Pior: `us-central1` (184 ms).

| # | Endpoint | Init (ms) | Detalhe |
|---:|---|---:|---|
| 1 | `global` | 158 | DONE init=158ms total=122071ms uri=gs://<redacted> |
| 2 | `us-central1` | 184 | DONE init=184ms total=82701ms uri=gs://<redacted> |

## 6. Matriz completa: regiao x modelo (latencia em ms)

Todas as celulas testadas. Numero = latencia (ms) de sucesso; `404` = modelo indisponivel no endpoint; `RAI` = bloqueado pelo filtro. Endpoints sem nenhum sucesso na modalidade sao listados abaixo de cada grade.

### Texto

| Endpoint | g-2.5-pro | g-2.5-flash | g-2.5-flash-lite | g-3.5-flash | g-3.1-pro-preview | g-3.1-flash-lite | g-3-flash-preview |
|---|---:|---:|---:|---:|---:|---:|---:|
| `global` | 2513 | 1759 | 301 | 921 | 2630 | 706 | 913 |
| `us-west1` | 2590 | 1024 | 470 | 404 | 404 | 404 | 404 |
| `us-west4` | 2565 | 669 | 454 | 404 | 404 | 404 | 404 |
| `us-central1` | 1785 | 615 | 499 | 404 | 404 | 404 | 404 |
| `us-east1` | 2549 | 699 | 367 | 404 | 404 | 404 | 404 |
| `us-east4` | 2300 | 579 | 345 | 404 | 404 | 404 | 404 |
| `us-east5` | 2171 | 507 | 392 | 404 | 404 | 404 | 404 |
| `us-south1` | 2122 | 566 | 369 | 404 | 404 | 404 | 404 |
| `northamerica-northeast1` | 1826 | 539 | 404 | 404 | 404 | 404 | 404 |
| `southamerica-east1` | 404 | 695 | 404 | 404 | 404 | 404 | 404 |
| `europe-west1` | 2582 | 572 | 283 | 404 | 404 | 404 | 404 |
| `europe-west2` | 404 | 509 | 404 | 426 | 404 | 404 | 404 |
| `europe-west3` | 404 | 406 | 404 | 404 | 404 | 404 | 404 |
| `europe-west4` | 2570 | 823 | 361 | 404 | 404 | 404 | 404 |
| `europe-west8` | 3133 | 927 | 359 | 404 | 404 | 404 | 404 |
| `europe-west9` | 2664 | 1217 | 341 | 404 | 404 | 404 | 404 |
| `europe-north1` | 3167 | 1101 | 475 | 404 | 404 | 404 | 404 |
| `europe-central2` | 2520 | 970 | 382 | 404 | 404 | 404 | 404 |
| `europe-southwest1` | 2978 | 927 | 381 | 404 | 404 | 404 | 404 |
| `asia-south1` | 404 | 1006 | 404 | 824 | 404 | 404 | 404 |
| `asia-southeast1` | 404 | 533 | 404 | 973 | 404 | 404 | 404 |
| `asia-northeast1` | 3454 | 629 | 404 | 713 | 404 | 404 | 404 |
| `asia-northeast3` | 404 | 1071 | 404 | 404 | 404 | 404 | 404 |
| `australia-southeast1` | 404 | 828 | 404 | 404 | 404 | 404 | 404 |

_Endpoints testados sem nenhum modelo de texto disponivel (todos 404):_ `us(normal)`, `us(baseUrl)`, `eu(normal)`, `eu(baseUrl)`, `europe-west6`, `asia-east1`, `asia-east2`, `me-west1`, `me-central1`, `me-central2`.

_Legenda das colunas:_ `g-2.5-pro` = gemini-2.5-pro · `g-2.5-flash` = gemini-2.5-flash · `g-2.5-flash-lite` = gemini-2.5-flash-lite · `g-3.5-flash` = gemini-3.5-flash · `g-3.1-pro-preview` = gemini-3.1-pro-preview · `g-3.1-flash-lite` = gemini-3.1-flash-lite · `g-3-flash-preview` = gemini-3-flash-preview.

### Imagem

| Endpoint | g-2.5-flash-image | g-3-pro-image | g-3.1-flash-image | g-3.1-flash-lite-image | imagen-4.0-generate-001 | imagen-4.0-ultra-generate-001 | imagen-4.0-fast-generate-001 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `global` | 13457 | 15901 | 9737 | 2737 | 15824 | 7188 | 13181 |
| `us-west1` | 5190 | 404 | 404 | 404 | 6322 | 9256 | 4273 |
| `us-west4` | 4965 | 404 | 404 | 404 | 7219 | 9055 | 3881 |
| `us-central1` | 5033 | 404 | 404 | 404 | 3955 | 8708 | 3399 |
| `us-east1` | 5029 | 404 | 404 | 404 | 6074 | 27725 | 4413 |
| `us-east4` | 5497 | 404 | 404 | 404 | 6819 | 8221 | 4172 |
| `us-east5` | 5227 | 404 | 404 | 404 | RAI | 6844 | 5291 |
| `us-south1` | 5081 | 404 | 404 | 404 | 5268 | 8845 | 3906 |
| `northamerica-northeast1` | 404 | 404 | 404 | 404 | 6254 | 9994 | 4948 |
| `southamerica-east1` | 404 | 404 | 404 | 404 | 11801 | 12464 | 7469 |
| `europe-west1` | 5344 | 404 | 404 | 404 | 5678 | 11513 | 3449 |
| `europe-west2` | 404 | 404 | 404 | 404 | 8903 | 9465 | 4395 |
| `europe-west3` | 404 | 404 | 404 | 404 | 5834 | 11695 | 4281 |
| `europe-west4` | 5779 | 404 | 404 | 404 | 8159 | 12253 | 4008 |
| `europe-west8` | 4936 | 404 | 404 | 404 | 404 | 404 | 404 |
| `europe-west9` | 404 | 404 | 404 | 404 | 9425 | 15363 | 4069 |
| `europe-north1` | 5144 | 404 | 404 | 404 | 404 | 404 | 404 |
| `europe-central2` | 5902 | 404 | 404 | 404 | 404 | 404 | 404 |
| `europe-southwest1` | 4836 | 404 | 404 | 404 | 404 | 404 | 404 |
| `asia-south1` | 404 | 404 | 404 | 404 | 9791 | 11871 | 5488 |
| `asia-southeast1` | 404 | 404 | 404 | 404 | 8931 | 10555 | 6680 |
| `asia-northeast1` | 404 | 404 | 404 | 404 | 8369 | 9790 | 6510 |
| `asia-northeast3` | 404 | 404 | 404 | 404 | 9332 | 9515 | 6313 |
| `australia-southeast1` | 404 | 404 | 404 | 404 | 8111 | 8536 | 5393 |

_Endpoints testados sem nenhum modelo de imagem disponivel (todos 404):_ `us(normal)`, `us(baseUrl)`, `eu(normal)`, `eu(baseUrl)`, `europe-west6`, `asia-east1`, `asia-east2`, `me-west1`, `me-central1`, `me-central2`.

_Legenda das colunas:_ `g-2.5-flash-image` = gemini-2.5-flash-image · `g-3-pro-image` = gemini-3-pro-image · `g-3.1-flash-image` = gemini-3.1-flash-image · `g-3.1-flash-lite-image` = gemini-3.1-flash-lite-image · `imagen-4.0-generate-001` = imagen-4.0-generate-001 · `imagen-4.0-ultra-generate-001` = imagen-4.0-ultra-generate-001 · `imagen-4.0-fast-generate-001` = imagen-4.0-fast-generate-001.

### Video

| Endpoint | veo-3.1-fast-generate-001 | veo-3.1-generate-001 | veo-3.1-lite-generate-001 |
|---|---:|---:|---:|
| `global` | 10356 | 165 | 158 |
| `us-central1` | 362 | 192 | 184 |

_Endpoints testados sem nenhum modelo de video disponivel (todos 404):_ `us(normal)`, `us(baseUrl)`, `eu(normal)`, `eu(baseUrl)`, `us-west1`, `us-west4`, `us-east1`, `us-east4`, `us-east5`, `us-south1`, `northamerica-northeast1`, `southamerica-east1`, `europe-west1`, `europe-west2`, `europe-west3`, `europe-west4`, `europe-west6`, `europe-west8`, `europe-west9`, `europe-north1`, `europe-central2`, `europe-southwest1`, `asia-east1`, `asia-east2`, `asia-south1`, `asia-southeast1`, `asia-northeast1`, `asia-northeast3`, `australia-southeast1`, `me-west1`, `me-central1`, `me-central2`.

_Legenda das colunas:_ `veo-3.1-fast-generate-001` = veo-3.1-fast-generate-001 · `veo-3.1-generate-001` = veo-3.1-generate-001 · `veo-3.1-lite-generate-001` = veo-3.1-lite-generate-001.

## 7. Cobertura por regiao (quais modelos cada regiao atende)

### Texto

| Endpoint | Nº modelos | Modelos disponiveis |
|---|---:|---|
| `global` | 7 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`, `gemini-3-flash-preview` |
| `us-west1` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `us-west4` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `us-central1` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `us-east1` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `us-east4` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `us-east5` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `us-south1` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `northamerica-northeast1` | 2 | `gemini-2.5-pro`, `gemini-2.5-flash` |
| `southamerica-east1` | 1 | `gemini-2.5-flash` |
| `europe-west1` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `europe-west2` | 2 | `gemini-2.5-flash`, `gemini-3.5-flash` |
| `europe-west3` | 1 | `gemini-2.5-flash` |
| `europe-west4` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `europe-west8` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `europe-west9` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `europe-north1` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `europe-central2` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `europe-southwest1` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| `asia-south1` | 2 | `gemini-2.5-flash`, `gemini-3.5-flash` |
| `asia-southeast1` | 2 | `gemini-2.5-flash`, `gemini-3.5-flash` |
| `asia-northeast1` | 3 | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-3.5-flash` |
| `asia-northeast3` | 1 | `gemini-2.5-flash` |
| `australia-southeast1` | 1 | `gemini-2.5-flash` |

### Imagem

| Endpoint | Nº modelos | Modelos disponiveis |
|---|---:|---|
| `global` | 7 | `gemini-2.5-flash-image`, `gemini-3-pro-image`, `gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`, `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `us-west1` | 4 | `gemini-2.5-flash-image`, `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `us-west4` | 4 | `gemini-2.5-flash-image`, `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `us-central1` | 4 | `gemini-2.5-flash-image`, `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `us-east1` | 4 | `gemini-2.5-flash-image`, `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `us-east4` | 4 | `gemini-2.5-flash-image`, `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `us-east5` | 3 | `gemini-2.5-flash-image`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `us-south1` | 4 | `gemini-2.5-flash-image`, `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `northamerica-northeast1` | 3 | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `southamerica-east1` | 3 | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `europe-west1` | 4 | `gemini-2.5-flash-image`, `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `europe-west2` | 3 | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `europe-west3` | 3 | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `europe-west4` | 4 | `gemini-2.5-flash-image`, `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `europe-west8` | 1 | `gemini-2.5-flash-image` |
| `europe-west9` | 3 | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `europe-north1` | 1 | `gemini-2.5-flash-image` |
| `europe-central2` | 1 | `gemini-2.5-flash-image` |
| `europe-southwest1` | 1 | `gemini-2.5-flash-image` |
| `asia-south1` | 3 | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `asia-southeast1` | 3 | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `asia-northeast1` | 3 | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `asia-northeast3` | 3 | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| `australia-southeast1` | 3 | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |

### Video

| Endpoint | Nº modelos | Modelos disponiveis |
|---|---:|---|
| `global` | 3 | `veo-3.1-fast-generate-001`, `veo-3.1-generate-001`, `veo-3.1-lite-generate-001` |
| `us-central1` | 3 | `veo-3.1-fast-generate-001`, `veo-3.1-generate-001`, `veo-3.1-lite-generate-001` |

## 8. Endpoints multi-regionais us/eu (REP) e observacoes

Os multi-regionais `us` e `eu` foram testados por dois metodos de chamada (`normal` e `baseUrl` via `*.rep.googleapis.com`).

| Multi-regiao | Metodo normal | Metodo baseUrl | baseUrl |
|---|---|---|---|
| `us` | model-404 | model-404 | `https://aiplatform.us.rep.googleapis.com` |
| `eu` | model-404 | model-404 | `https://aiplatform.eu.rep.googleapis.com` |

Observacao: no agregado, os unicos modelos que respondem via `us`/`eu` sao os "3.x" de texto (`gemini-3.5-flash` e `gemini-3.1-flash-lite`) — ver secao 3. Para 2.5 e Imagen/Veo os multi-regionais retornam 404.

## 9. Metodologia, proveniencia e sanitizacao

- **Execucao:** varredura serial (uma chamada por vez) de cada modelo contra cada endpoint, medindo latencia e status HTTP. Fonte: diagnostico rodado no VPS do usuario (serial re-test v2).
- **Reconstrucao:** este documento e gerado a partir do `report_data.json` original. A grade completa de 578 celulas foi reconstruida de forma deterministica a partir do mapa de sucessos (`perModel`) + cobertura (`cov`); as latencias de **sucesso** sao os valores medidos originais. As latencias das celulas 404 foram omitidas (nao sao sinal util).
- **Sanitizacao (repo publico):** removidos/redigidos o project id do GCP (`projects/<PROJECT>/...`), o nome do bucket GCS (`gs://<redacted>/...`) e o IP do VPS. Nenhum token, API key ou service-account presente.
- **Formato:** HTML/Markdown 100% estatico, sem JavaScript — todo o conteudo esta no proprio arquivo e e legivel por qualquer IA ou cliente HTTP.
- **Dados brutos:** `mapa-regioes-data.json` (mesmo diretorio) contem meta + perModel + cobertura + a matriz completa reconstruida.

_Gerado em 2026-07-17._
