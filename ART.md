# Encàrrec d'art — castellers il·lustrats (sprites)

Com generar l'art il·lustrat dels castellers perquè el joc faci el salt de "vector
net" a "espectacular". El motor ja està preparat per fer-los servir; mentre no hi
siguin, dibuixa la figura per codi (l'actual) com a alternativa.

> **Pas pràctic (important):** genera NOMÉS **una figura de prova** (la del tronc)
> amb el prompt d'aquí sota i passa-me-la. La integro, ajusto mida/posició i
> validem l'estil ABANS de generar tota la col·lecció. Així no fas feina de més.

---

## 1. Format de cada peça

- **PNG amb fons transparent.**
- Figura **centrada**, **cos sencer**, **peus tocant la vora de baix** del llenç.
- Mida: **512 × 1024 px** (figures dretes) · **512 × 640 px** (pinya/acotxat).
- **Mateixa escala i enquadrament** dins de cada grup (per poder apilar-les).

## 2. Requisit clau: poder recolorar la camisa

Cada jugador tria el **color de camisa** de la colla. Per això, de cada postura
necessito **dues capes** (dos PNG alineats, mateixa mida):

| Capa | Inclou | Color |
|------|--------|-------|
| `*_cos.png` | cap, cara, cabell, **pantalons blancs**, **faixa negra**, espardenyes, braços i mans (pell), i el **casc negre** si en porta | a tot color |
| `*_camisa.png` | només la **camisa + mànigues + mocador** | **gris mitjà** amb ombres suaus (perquè el joc el tenyeixi) |

*(Si només pots fer una imatge sencera per peça, també m'val per començar; el
recolorat quedarà més limitat però ja ho munto.)*

## 3. Postures que necessito (peces)

| Peça | Com ha d'anar |
|------|----------------|
| **tronc (de cara)** | dret, cames una mica obertes; **els dos braços estesos cap als costats, en horitzontal, amb les mans a l'altura de les espatlles** (s'agafa pels companys del costat). Mocador al cap. |
| **tronc (d'esquena)** | igual, però **vist de darrere**: només es veu el clatell/cabell o mocador (sense cara). |
| **pinya** | de mig cos, **vist des de dalt i de darrere, mirant avall**; només clatell/mocador, braços estesos endavant. |
| **acotxador** (nen) | **acotxat/enxarrancat** (de genolls, cames obertes), **casc negre**. ~80% de la mida d'un adult. |
| **enxaneta** (nen) | dret, **una mà ben amunt** (l'aleta), l'altra al pit, **casc negre**. ~65% de la mida. |
| **(opcional) pujant** | enfilant-se, els dos braços amunt agafat. |

Detalls constants: **faixa negra ampla** a la cintura, **pantalons blancs**,
espardenyes amb vetes, i **mocador** al cap (excepte enxaneta i acotxador, que
porten **casc negre**).

## 4. Estil (tria'n un)

- **A — cartoon premium / vectorial ric:** colors plans, ombres suaus, contorn net.
  *(Recomanat: coherent i lleuger.)*
- **B — semi-realista il·lustrat:** pintat amb textura de roba i ombres.
- **C — pixel-art HD.**

## 5. Prompt a punt (comença per AQUESTA, la del tronc)

**CAT (per a ChatGPT amb imatges / Bing Image Creator):**
> Il·lustració estil cartoon premium, **vista de cara, cos sencer**, d'un casteller
> (participant de torres humanes catalanes) **dret amb les cames lleugerament
> obertes** i **els dos braços estesos cap als costats en horitzontal, amb les mans
> a l'altura de les espatlles** com si s'agafés als companys. Porta **camisa de
> màniga curta**, **faixa negra ampla a la cintura**, **pantalons blancs**,
> **mocador al cap** i espardenyes. Colors plans amb ombres suaus, contorn net,
> **fons transparent**, figura centrada, **sense text**.

**ENG (per a Midjourney):**
> flat premium cartoon illustration, front view, full body, a Catalan "casteller"
> (human-tower performer) standing with legs slightly apart and **both arms
> stretched out sideways, horizontal, hands at shoulder height** as if gripping
> teammates, short-sleeve shirt, **wide black waist sash**, white trousers, head
> bandana, espadrilles, soft cel shading, clean outline, **transparent background**,
> centered, no text --style raw --ar 1:2

> Per a la **capa camisa**: el mateix prompt afegint *"només la camisa, mànigues i
> mocador en gris neutre uniforme; la resta (cara, pell, pantalons, faixa)
> transparent."*

### Variants (per a la resta de peces, després de validar l'estil)
- **D'esquena:** *"...vist de darrere, no es veu la cara, només el clatell/mocador."*
- **Enxaneta:** *"...nen amb casc negre, una sola mà ben amunt fent l'aleta."*
- **Acotxador:** *"...nen amb casc negre, acotxat de genolls amb les cames obertes."*
- **Pinya:** *"...de mig cos, vist des de dalt i de darrere, mirant avall, braços endavant."*

## 6. Integració (me'n encarrego jo)

1. Em passes el/s PNG (o els poses a una carpeta `assets/`).
2. El joc els carrega, **tenyeix la camisa** amb el color de la colla, els **apila**
   amb l'alçada correcta i hi aplica l'animació de pujar/baixar i la caiguda.
3. Si en falta cap, es dibuixa la figura per codi (mai es queda en blanc).

**Comença per la figura del tronc (de cara). Passa-me-la i validem l'estil.**
