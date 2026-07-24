# Achados de pipeline — bugs e dívida técnica

Documento separado, e deliberadamente. Estes achados **não** são sobre modelo × região: eles saíram como subproduto do [teste de geração condicionada por referência](mapa-regioes.md#seção-10--geração-condicionada-por-referência), mas dizem respeito à pipeline de produção de criativos. Enterrá-los dentro do mapa de regiões faria com que ninguém os encontrasse.

**Nada aqui foi corrigido.** Os achados são de medição e relato. Cada seção termina com um STATUS explícito.

Sanitizado para repositório público: `<APP_DIR>` é o diretório da aplicação, `<PM2_LOGS>` o diretório de logs do PM2 e `<TMP>` o diretório temporário. Números de linha do `server.js` são citados como estavam no commit `d3b7a8a` (2026-07-21).

---

## Truncamento de narração no merge de áudio/vídeo (CONFIRMADO)

### O sintoma

No log de erro aparece, repetidamente:

```
[merge] ffprobe failed, using -shortest fallback: Command failed: ffprobe -v error
-show_entries format=duration -of default=noprint_wrappers=1:nokey=1
"<APP_DIR>/downloads/audio_<timestamp>.wav"
```

Parece um aviso cosmético. Não é. Ele marca exatamente os merges em que a narração **pode ter sido cortada** — e isso é reprodutível.

### A causa-raiz, encadeada

O aviso não é intermitente nem ambiental: é **determinístico e sistêmico**. Cinco elos:

1. **Os arquivos `.wav` de narração não são WAV.** São **PCM cru** — `s16le`, 24000 Hz, mono — **sem header RIFF/WAVE**. Os primeiros 16 bytes são zeros; `file(1)` não reconhece nenhum formato de áudio e reporta `data`. É exatamente o formato que a API de TTS do Gemini devolve, escrito em disco sem conversão (`server.js` linha 481).
2. **`getMediaDuration` (`server.js:579-584`) chama o `ffprobe` SEM os flags de formato.** O ffprobe não tem como adivinhar o formato de um arquivo sem header, então falha **sempre**, com `Invalid data found when processing input`.
3. **O `catch` em `mergeVideoAudio` (`server.js:588-594`) engole a exceção** e deixa `videoDuration` e `audioDuration` como `null`.
4. **Durações nulas forçam o ramo `else` (`server.js:615-617`)**, que aplica `-shortest` **sem qualquer compensação**.
5. **O ramo que desaceleraria o vídeo com `setpts` quando a narração é mais longa que o clipe (`server.js:606-610`) NUNCA é executado.** A proteção existe no código, está corretamente escrita, e está **permanentemente inalcançável**.

O detalhe decisivo: **o ffmpeg RECEBE os flags corretos.** A linha 600 passa `.inputOptions(['-f','s16le','-ar','24000','-ac','1'])`, e é por isso que o merge funciona e o áudio sai audível. Só o **ffprobe** não recebe. O código sabe o formato na hora de misturar, e não sabe na hora de medir.

### A evidência

- **9 avisos** `ffprobe failed` em `<PM2_LOGS>/google-mcp-error.log`. Zero nos demais arquivos de log.
- **8 de 8** arquivos `criativo_final_*.mp4` existentes em disco têm um aviso correspondente. Ou seja: **nenhum merge de criativo jamais executou o caminho normal — 100% deles caíram no fallback `-shortest`.** (O nono aviso não tem criativo correspondente em disco.)
- Corroboração nas durações: em todos os `criativo_final_*.mp4`, a duração do áudio é praticamente idêntica à do vídeo (7,979 s contra 8,000 s; 6,800 s contra 6,792 s). Essa coincidência exata é a **assinatura característica do `-shortest`** — o stream mais longo é cortado onde o mais curto termina. Não é o padrão que se esperaria de narrações de durações naturais e variadas.

### A reprodução direta

Executando em `<TMP>` — fora do projeto, sem tocar em nada — exatamente o mesmo comando que o código monta, com ativos reais do servidor:

```sh
ffmpeg -i downloads/videos/veo-12804db4-sample_0.mp4 \
       -f s16le -ar 24000 -ac 1 -i downloads/audio/audio_1782250677330.wav \
       -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest <TMP>/merge_demo.mp4
```

| Entrada / saída | Duração |
|---|---:|
| Narração original | 8,320 s |
| Clipe de vídeo | 6,000 s |
| Saída com `-shortest` — container | 6,000 s |
| Saída com `-shortest` — stream de áudio | 5,973 s |
| **Narração perdida** | **2,347 s** |

**2,347 segundos de narração descartados — sem erro, sem aviso, com código de retorno zero.**

### As durações medidas

Decodificando os `.wav` com os parâmetros corretos (`-f s16le -ar 24000 -ac 1`):

| Arquivo de narração | Bytes | Duração real |
|---|---:|---:|
| `audio/audio_1782250677330.wav` | 399.360 | 8,320 s |
| `audio/audio_1782250774754.wav` | 311.040 | 6,480 s |
| `audio_1780447194989.wav` | 439.680 | 9,160 s |
| `audio_1780447290996.wav` | 458.880 | 9,560 s |
| `audio_1780448517567.wav` | 480.000 | 10,000 s |
| `audio_1780527751830.wav` | 451.200 | 9,400 s |

Os clipes do Veo disponíveis para merge têm **6,000 s ou 8,000 s** de vídeo. Todas as narrações medidas (6,48 s a 10,00 s) são **iguais ou mais longas** que o clipe de 6 s, e **quatro das seis** são mais longas que o clipe de 8 s. Ou seja: a condição que dispara a perda é a regra, não a exceção.

### Ressalva de rigor

Os `.wav` correspondentes aos **8 criativos já entregues foram removidos do disco** (os que sobraram são de outras execuções). Portanto:

- **Provado:** todos os 8 passaram pelo caminho vulnerável, e esse caminho corta narração de forma reprodutível.
- **INCONCLUSIVO:** quantos segundos exatamente cada criativo individual perdeu. O mecanismo está provado; o dano por arquivo, não.

Nota relacionada, também inconclusiva: nenhum criativo em disco chega perto de 18 s (a faixa é 6,8 s a 8,0 s, todos compatíveis com clipe único). Isso é digno de registro, mas **não** é evidência de truncamento — o `-shortest` corta na duração do stream mais curto dentro de um merge, e não removeria clipes de uma concatenação prévia. A explicação mais econômica é que criativos de 3 clipes nunca foram produzidos, não que foram truncados.

### STATUS: **NÃO CORRIGIDO**

---

## Ponto em aberto: qual deve ser o comportamento correto

Consertar o ffprobe **não é o fim do problema — é o começo dele.**

Passar os flags `-f s16le -ar 24000 -ac 1` ao `ffprobe` faria as durações serem medidas corretamente. Mas isso **desbloqueia o ramo `setpts`** (`server.js:606-610`), que estava inalcançável — e esse ramo **desacelera o vídeo** para caber a narração.

Com os números reais do caso reproduzido acima, o fator seria de 6,000 s ÷ 8,320 s ≈ **0,72×**. Isso é câmera lenta **visível**, num criativo publicitário de 6 segundos.

Portanto o conserto exige uma **decisão de política**, não só uma correção técnica. As opções sobre a mesa:

1. **Desacelerar o vídeo** para caber a narração — o que o código já faria hoje, se o ramo fosse alcançável. Produz câmera lenta.
2. **Congelar o último frame** pelo tempo restante da narração.
3. **Limitar o roteiro da narração** à duração do clipe, na geração do texto.

Nenhuma foi escolhida. **PENDENTE** — e é decisão de produto, não de implementação.

---

## Achado: proporção da imagem não é respeitada

O prompt pediu explicitamente `vertical composition` em todas as chamadas do teste de referência. O modelo **em produção** (`gemini-2.5-flash-image`) devolveu **1120×928 — paisagem — em 4 de 4 chamadas**. Outros modelos respeitaram: `gemini-3-pro-image` devolveu retrato nos dois experimentos, e `gemini-3.1-flash-lite-image` também. O `gemini-3.1-flash-image` foi inconsistente — retrato num experimento, paisagem no outro, com o mesmo pedido textual.

Isso é contra-indicado para criativos UGC, que são verticais.

A causa provável está em **como** a proporção é pedida: o `server.js` codifica a razão de aspecto **no TEXTO do prompt** (linhas 177-180 de `generateImageWithFallback`), e **não** por parâmetro de configuração. O SDK expõe `imageConfig.aspectRatio`, que **não está em uso**. O achado indica que a estratégia via texto não é confiável de forma uniforme entre modelos.

### STATUS: **NÃO CORRIGIDO**

---

## Dívida técnica conhecida (não corrigida)

Bugs já mapeados em revisões anteriores do `server.js`, listados aqui para não se perderem:

- **Variável `editMode` inexistente na tool `remove_background` standalone** — a tool **nunca retorna sucesso** quando chamada isoladamente.
- **`catch {}` silencioso na resolução da segunda imagem de referência** — degrada de 2 referências para 1 **sem avisar**. O chamador acredita que passou duas.
- **Import morto `SubjectReferenceImage`** — importado do SDK e nunca usado.
- **Objeto `mainRawRef` construído e nunca consumido** — montado com `referenceId` e `referenceImage`, e descartado.
- **Divergência de código de erro** — a mesma condição retorna ora `IMAGEN_ERROR`, ora `IMAGEN_NO_OUTPUT`.

### STATUS: **NÃO CORRIGIDO**

---

**Proveniência.** Achados levantados em 2026-07-23 como subproduto do teste de geração condicionada por referência (`server.js` no commit `d3b7a8a`, de 2026-07-21). O único arquivo escrito durante a checagem foi `<TMP>/merge_demo.mp4`, fora do projeto: nenhum arquivo de código, configuração ou mídia do projeto foi alterado, o PM2 não foi reiniciado e nenhum commit foi feito. Dados estruturados sob `reference_conditioned_generation.checagem_ffprobe_truncamento` em [`mapa-regioes-data.json`](mapa-regioes-data.json).
