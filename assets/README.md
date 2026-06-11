# assets/ — art i so del joc

El joc carrega aquests fitxers automàticament. Si en falta cap, fa servir la
figura dibuixada per codi (mai es queda en blanc).

## Àudio ✅ (ja integrat)

| Fitxer | Ús |
|--------|-----|
| `audio_pujant.mp3` | sona en bucle mentre es construeix el castell |
| `audio_carregada.mp3` | sona quan l'enxaneta comença a pujar (uns segons abans de l'aleta) |

## Imatges de castellers

Cada peça és una **postura** diferent (no totes són la mateixa figura!). Per a un
pis de tronc vist des del joc es veuen alhora: un **d'esquena** (davant nostre),
dos de **perfil** (que s'agafen) i el de **cara** (mig tapat pel d'esquena).

| Fitxer | Postura | Estat |
|--------|---------|-------|
| `casteller_tronc.png` | de cara, braços oberts | ✅ pujada |
| `casteller_esquena.png` | **d'esquena** (clatell/mocador, sense cara) | ⬆️ cal pujar |
| `casteller_perfil.png` | **de perfil mirant a la dreta**, braç endavant amb el puny (agafant el company). El joc el reflecteix per fer l'altre costat | ⬆️ cal pujar |
| `casteller_pilar.png` | de cara, **mans al clatell** com agafant les cames del de dalt (per als PILARS) | ⬆️ cal pujar |
| `casteller_acotxador.png` | nen **acotxat**, casc negre | ⬆️ cal pujar |
| `casteller_enxaneta.png` | nen, **una mà amunt** (aleta), casc negre | ⬆️ cal pujar |
| `casteller_pinya.png` | mig cos, de dalt/darrere, mirant avall | ⬆️ cal pujar |

### Regla de color
Totes amb la **camisa i el mocador VERMELLS** (el joc recolora el vermell al
color de la colla). Pell, **pantalons blancs**, **faixa negra**, espardenyes i
**casc negre** es mantenen.

### Format
PNG **transparent**, figura **centrada**, **peus a baix de tot**, ~512×1024 px,
**mateixa escala** entre totes (per poder apilar-les).

## Com pujar-les
GitHub → carpeta `assets` → **Add file → Upload files** → arrossega el PNG amb el
nom exacte de la taula → **Commit**. Després avisa'm i les integro.
