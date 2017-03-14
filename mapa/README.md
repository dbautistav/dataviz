# Visualización tipo mapa

Esta visualización permite mostrar datos sobre un mapa.
Los datos pueden:
- determinar el color de un polígono del mapa de acuerdo al intervalo en el que se encuentra su valor asociado (coropleta),
- proveer información relacionada a una ubicación dada (puntos).

Esta visualización está diseñada para mostrar cualquiera de estos tipos de características.

## Archivos y directorios

En esta sección se listan y describen los archivos más importantes para esta visualización.

El directorio mapa, se ve así:
```
  mapa/
  |--- css/
  |--- data/
  |    |--- config.json
  |    |--- ...
  |--- js/
  |    |--- lib/
  |    |    |--- ...
  |    |--- data-utils.js
  |    |--- leaflet-utils.js
  |    |--- main.js
  |    |--- utils.js
  |--- index.html
```

- `index.html` - importa las dependencias, y define la etiqueta que contiene las visualizaciones (mapa y serie de tiempo).

- `data/config.json` - centraliza la configuración sobre orígenes de datos, formato y estilo, entre otros ([ver más](#configuración)).

- `data/` - contiene los archivos json con los datos a mostrarse en las visualizaciones ([ver más](#datos)).

- `js/main.js` - dirige el flujo principal de la aplicación. No es necesario modificarlo por cada implementación.

Para probar las visualizaciones en local, es necesario montar el proyecto en un servidor web local como Apache.

### Descripción de archivos

#### Configuración
_WIP_

#### Datos

Los datos que se muestran en la visualización se almacenan en archivos json.

Los archivos que contienen las definiciones de los polígonos y puntos **necesariamente** deben cumplir con [el estándar del formato geojson](http://geojson.org/) para `MultiPolygon` y `Point`, respectivamente.

**Importante: De no cumplir con el estándar, el mapa no se visualizará en el navegador.**
