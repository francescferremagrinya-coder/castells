# Encàrrec d'art — castellers il·lustrats (sprites)

Aquest document explica **com generar l'art il·lustrat** dels castellers perquè el
joc faci el salt de "vector net" a "espectacular". El motor del joc ja està
preparat per fer servir aquestes imatges; mentre no hi siguin, dibuixa la figura
per codi (l'actual) com a alternativa.

> **Pas pràctic:** genera **una sola figura de prova** amb un dels prompts d'aquí
> sota i passa-me-la. Jo la integro, ajusto mides/posició i validem com queda
> abans de generar tota la col·lecció. Així no perds temps fent-ne moltes si cal
> afinar l'estil.

---

## 1. Requisit clau: la camisa s'ha de poder recolorar

Cada jugador tria el **color de camisa** de la seva colla. Per això l'art ha
d'estar pensat per recolorar. La manera més fàcil i robusta són **dues capes**
(dos PNG) per cada postura, perfectament alineats i de la mateixa mida:

| Capa | Què inclou | Color |
|------|------------|-------|
| `*_cos.png` | Cap, cara, cabell, **pantalons blancs**, **faixa negra**, espardenyes, braços/mans (pell) | A tot color |
| `*_camisa.png` | Només la **camisa + mànigues + mocador** | Gris mig amb ombres suaus (per tenyir) |

Al joc, la capa `camisa` es tenyeix amb el color de la colla i es posa sobre el
`cos`. Resultat: la mateixa figura amb qualsevol color de camisa.

*(Si només pots generar una imatge sencera, també serveix per començar: me la
passes i ja ho munto, però el recolorat quedarà més limitat.)*

---

## 2. Llista d'imatges (postures)

Totes amb **fons transparent (PNG)**, figura centrada, mirant de cara, mateixes
dimensions dins de cada grup:

| Fitxer | Postura | Ús |
|--------|---------|-----|
| `tronc_cos.png` + `tronc_camisa.png` | Dret, **braços amunt agafant els bessons** del de sobre | Castellers del tronc |
| `enxaneta_cos.png` + `enxaneta_camisa.png` | Dret, **una mà aixecada** (l'aleta) | Enxaneta a dalt |
| `puja_cos.png` + `puja_camisa.png` | **Enfilant-se**, braços amunt agafant-se | Animació de pujar/baixar |
| `pinya_cos.png` + `pinya_camisa.png` | De mig cos, vist de darrere/dalt, **braç sobre l'espatlla** del costat | Gent de la pinya |

**Mida recomanada:** 512×1024 px (tronc/enxaneta/puja), 512×512 px (pinya).
Marge transparent uniforme; peus a baix de tot del llenç.

---

## 3. Estils possibles (tria'n un)

- **A — Cartoon premium / vectorial ric:** net, colors plans amb ombres suaus,
  contorn marcat. Estil "app mòbil moderna". *(Recomanat per coherència i pes.)*
- **B — Semi-realista il·lustrat:** pintat amb textura de roba, ombres realistes.
  Més espectacular, més pes per imatge.
- **C — Pixel-art HD:** retro però cuidat, si volem un to més "joc indie".

---

## 4. Prompts a punt (per a IA d'imatge: DALL·E, Midjourney, etc.)

### Estil A — cartoon premium (castell humà casteller)
**CAT:**
> Il·lustració estil cartoon premium, vista de cara, d'un casteller (participant
> de torres humanes catalanes) dret, amb camisa de màniga curta, **faixa negra
> ampla a la cintura**, pantalons blancs, mocador al cap, espardenyes, **els dos
> braços aixecats agafant-se per damunt del cap**. Colors plans amb ombres suaus,
> contorn net, **fons transparent**, cos centrat, cos sencer. Sense text.

**ENG (per Midjourney):**
> flat premium cartoon illustration, front view, a "casteller" (Catalan human-tower
> performer) standing, short-sleeve shirt, **wide black sash at the waist**, white
> trousers, head bandana, espadrilles, **both arms raised gripping overhead**,
> soft cel shading, clean outline, **transparent background**, full body, centered,
> no text --style raw

> Per a la versió `_camisa`: repeteix el prompt afegint *"només la camisa,
> mànigues i mocador en gris neutre, la resta transparent"*.

### Variants per postura
- **Enxaneta:** *"...amb una sola mà ben amunt fent l'aleta, l'altra al pit"*.
- **Pujant:** *"...enfilant-se, agafat amb les dues mans, una cama flexionada"*.
- **Pinya:** *"...de mig cos, vist lleugerament des de dalt i del darrere, passant
  el braç per damunt de l'espatlla del company del costat"*.

---

## 5. Integració (me'n encarrego jo)

1. Poses els PNG a la carpeta `assets/`.
2. El joc els carrega, tenyeix la capa `camisa` amb el color de la colla i els
   apila amb l'alçada i l'animació correctes (ja resolt al motor).
3. Si falta algun fitxer, es dibuixa la figura per codi (l'actual) per a aquella
   peça — així el joc mai es queda en blanc.

**Quan tinguis una imatge de prova, passa-me-la i l'integro per validar l'estil.**
