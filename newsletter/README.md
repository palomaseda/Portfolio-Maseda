# Ediciones de la newsletter

Cada edición es **un archivo** (el que exportás desde Canva) subido a esta carpeta.
El sitio la publica sola: no hay que tocar código.

Sirve tanto **PDF** como **PNG / JPG**. Si subís un PDF se convierte a imagen
automáticamente, así que descargá de Canva lo que te resulte más cómodo.

> Si el PDF tiene varias páginas, se publica la primera.

## Cómo nombrar el archivo

```
AAAA-MM-DD__Titulo-de-la-edicion.png
```

La fecha va adelante, después dos guiones bajos `__`, y después el título.

Ejemplos:

```
2026-08-01__Primera-edicion.png
2026-09-15__Tintes naturales.jpg
```

De ahí salen la fecha y el título que se muestran en la web. Los guiones del
título se convierten en espacios.

> Si el archivo no sigue ese formato, se ignora y no aparece en la web.

## Cómo subir una edición

1. Entrá a esta carpeta en GitHub.
2. **Add file → Upload files**.
3. Arrastrá la imagen y confirmá con **Commit changes**.

En un par de minutos aparece en https://palomaseda.github.io/Portfolio-Maseda/newsletter.html

## Recomendación de formato

Diseñá en Canva en **formato vertical** (A4 o 1080 px de ancho y el alto que
necesites). Así se ve bien tanto en computadora como en celular.

## Si te equivocaste

Subí el archivo corregido **con el mismo nombre**: reemplaza al anterior y la web
se actualiza sola. Para borrar una edición, borrá el archivo de esta carpeta.

La subcarpeta `rendered/` la genera el sistema con las conversiones de los PDF.
No hace falta tocarla.
