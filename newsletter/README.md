# Ediciones de la newsletter

## La forma fácil: la carpeta de Google Drive

Cada edición es **un archivo** (el que exportás desde Canva) que se suelta en la
carpeta **Newsletter** de Google Drive. Un proceso automático la revisa cada 15
minutos y la publica en
https://palomaseda.github.io/Portfolio-Maseda/newsletter.html

1. Exportá la edición desde Canva como **PDF** (o PNG / JPG).
2. Guardala en la carpeta **Newsletter** de Drive.
   - **iPad:** app *Archivos* → *Google Drive* → *Newsletter* (con la app de
     Google Drive instalada).
   - **Windows:** arrastrala a la carpeta desde drive.google.com.
3. Esperá unos minutos y refrescá la web.

**El nombre del archivo es el título** que se ve en la web (por ejemplo
`Muestras.pdf` aparece como "Muestras"). La fecha es el día en que lo subís.

Todo lo que pasa en la carpeta se refleja en la web:

- **Corregir una edición:** reemplazá el archivo en Drive (clic derecho →
  *Administrar versiones* → *Subir nueva versión*) y se actualiza sola. La fecha
  no cambia.
- **Cambiar el título:** renombrá el archivo en Drive.
- **Sacar una edición:** borrá el archivo de la carpeta.

Si el PDF tiene varias páginas, se publican todas, una debajo de la otra. No
entran archivos de más de 95 MB; si uno pesa más, el aviso queda en la pestaña
*Actions* de GitHub (workflow *Sync Newsletter from Google Drive*).

### Fijar la fecha o dejar solo la fecha

Si querés elegir la fecha, empezá el nombre con `AAAA-MM-DD__`:

```
2026-09-15__Tintes naturales.pdf     → fecha 15/09/2026, título "Tintes naturales"
2026-09-15.pdf                       → solo la fecha, sin título
```

El mes y el día pueden ir con o sin cero (`2026-9-5` equivale a `2026-09-05`).

## Cómo está conectado (para quien mantiene el repo)

No hay claves: el workflow *Sync Newsletter from Google Drive* lee la vista
pública de la carpeta, así que la carpeta tiene que seguir compartida como
*Cualquier persona con el enlace → Lector*. Su ID está en
`.github/workflows/sync-drive-newsletter.yml` (`GDRIVE_FOLDER_ID`); para usar
otra carpeta, se cambia ahí.

Si Google cambia esa vista o bloquea a los servidores de GitHub, no se borra
nada y las ediciones ya publicadas siguen en la web; lo nuevo simplemente no
aparece. El motivo queda en la pestaña *Actions*: como error si no se pudo
leer la carpeta, o como aviso si falló la descarga de un archivo.

## Alternativa: subir directo a GitHub

También se puede subir el archivo a esta carpeta desde GitHub (*Add file →
Upload files*; la web de GitHub no acepta archivos de más de 25 MB, por git sí).
Ahí el nombre tiene que seguir el formato `AAAA-MM-DD__Titulo.pdf`; si no, se
ignora. Las ediciones subidas así no las toca la sincronización con Drive.

## Recomendación de formato

Diseñá en Canva en **formato vertical** (A4 o 1080 px de ancho y el alto que
necesites). Así se ve bien tanto en computadora como en celular.

La subcarpeta `rendered/` la genera el sistema con las conversiones de los PDF.
No hace falta tocarla.
