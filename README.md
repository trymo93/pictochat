# ✏️ PictoChat

Chat con disegni a mano libera stile PictoChat del Nintendo DS, pensata per
funzionare **completamente offline** — perfetta per chattare con la band in aereo.

Due versioni:

| | Serve | Come si collega |
|---|---|---|
| **`index.html`** (consigliata) | Solo i telefoni e il browser | I telefoni si parlano direttamente (WebRTC), accoppiamento via QR |
| **`server.js`** | Un dispositivo con Node.js | Tutti aprono l'indirizzo del server nel browser |

## Perché non Bluetooth?

I browser non possono chattare tra loro via Bluetooth (Web Bluetooth permette solo
di collegarsi a periferiche tipo sensori, non ad altri telefoni). La soluzione che
funziona davvero è una **rete Wi-Fi locale senza internet**: l'hotspot del telefono
si può accendere anche in modalità aereo, e non serve che dia accesso a internet —
fa solo da "ponte radio" tra i telefoni.

## Accesso rapido con QR

L'app è pubblicata come sito, senza login e senza download:

> **https://trymo93.github.io/pictochat/**

Il QR qui sotto (`qr-accesso.gif`) apre direttamente quell'indirizzo: mandalo nel
gruppo della band o fallo inquadrare dal tuo schermo.

![QR di accesso a PictoChat](qr-accesso.gif)

⚠️ Il QR va inquadrato **prima del volo**, quando c'è ancora internet: una volta
caricata la pagina, si lascia la scheda aperta e in aereo funziona offline.


## Versione solo telefoni: `index.html`

Un unico file HTML, **niente da installare da nessuna parte**.

**Prima del volo (con internet):**
1. Mandate `index.html` nel gruppo WhatsApp/Telegram della band
   (da GitHub: aprite il file → ⋯ → *Download raw file*).
2. Ognuno lo salva sul telefono.
   - **Android**: si apre dai file con Chrome, quando volete.
   - **iPhone**: Safari non apre bene i file locali, quindi **apritelo prima
     del volo e lasciate la scheda aperta** — la pagina non ha bisogno di rete
     dopo il caricamento, sopravvive tranquillamente alla modalità aereo.

**In volo:**
1. Tutti in modalità aereo ✈️ — uno accende l'**hotspot personale**, gli altri
   si collegano a quel Wi-Fi (ignorate l'avviso "nessuna connessione internet").
2. Ognuno apre `index.html` nel browser e mette il proprio nome.
3. Uno tocca **🎸 Crea il gruppo**, gli altri **🤝 Unisciti**.
4. Accoppiamento in 10 secondi a coppie: chi entra inquadra il QR di chi ha
   creato il gruppo, poi mostra il proprio QR di risposta e viene inquadrato
   a sua volta. Fatto: si disegna! Per aggiungere un altro membro, chi ha
   creato il gruppo tocca **➕ invita**.

> Niente fotocamera o QR che non si legge? C'è il fallback **copia/incolla**:
> i codici si possono passare con AirDrop o Quick Share, che funzionano offline.

**Nota:** chi ha creato il gruppo fa da ripetitore — se chiude la pagina, il
gruppo si scioglie. Conviene che sia il telefono con più batteria.

### Se non si collegano

- Verificate che tutti siano sull'hotspot giusto (non sul Wi-Fi di bordo).
- Usate l'accoppiamento **con QR e fotocamera**: oltre a essere più comodo,
  dà al browser il permesso di usare gli indirizzi di rete reali.
- Provate a fare l'hotspot con un altro telefono: alcuni isolano i dispositivi
  collegati tra loro.

## Versione con server: `server.js`

Se uno di voi ha un laptop (o Termux su Android) con Node.js:

```
node server.js
```

Il server stampa l'indirizzo (tipo `http://192.168.43.15:3000`) e ognuno lo apre
nel browser. Zero dipendenze, niente `npm install`. Stanze A–D, storico degli
ultimi 40 messaggi per chi entra dopo, riconnessione automatica.
Porta configurabile: `PORT=8080 node server.js`.

## Funzioni

- Disegno a mano libera (touch e mouse), penna fine/grossa, 6 colori
- Gomma, annulla (↩️), pulisci tutto
- Timbro di testo sul disegno (come la tastiera del DS)
- Contatore di chi è in banda, bip stile DS all'arrivo dei messaggi
- Chi entra dopo riceve gli ultimi messaggi

## Note tecniche

- `index.html`: WebRTC DataChannel senza STUN/TURN (tanto siete sulla stessa
  rete), topologia a stella con l'host che inoltra. Lo scambio offerta/risposta
  SDP avviene via QR (librerie MIT incorporate: qrcode-generator e jsQR) o
  copia/incolla. Nessuna richiesta di rete esterna: il file è autosufficiente.
- `server.js`: HTTP puro Node, messaggi via Server-Sent Events.
- In entrambe le versioni i messaggi vivono solo in RAM.

## Struttura del repo

Questo è il repo ufficiale dell'app. `index.html` è l'app, pubblicata su GitHub Pages dal branch
`gh-pages`. `server.js` e `public/index.html` sono la versione alternativa
con server.
