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
El archivo que contiene todas las configuraciones que se pueden realizar sobre las visualizaciones se llama `config.json` y se encuentra en el directorio `data/` ([ver](./data/config.json)).

El primer nivel se compone por tres llaves que agrupan de manera semántica las configuraciones de cada parte de esta visualización:
- `map` - contiene las configuraciones relacionadas al mapa, para visualizar tanto polígonos como puntos,
o incluso ambos de forma simultánea.
  - `config` - aquí se define el identificador de la etiqueta html que contendrá el mapa (`htmlElId`),
  los límites y zoom iniciales (`initial_boundaries` y `initial_zoom`, respectivamente),
  las credenciales y ruta al estilo de mapbox (`mapbox`) que usa la visualización.
  - `layers` - se definen las configuraciones para las capas a mostrarse en el mapa.
  Una capa puede ser un geojson de polígonos o un geojson de puntos ([ver más](#datos)).
  Esta visualización permite mostrar hasta dos capas en el mapa: una de puntos sobre una de polígonos.
    - `polygons_map` - configuración para la capa de polígonos.
    Aquí se definen los intervalos y su color asociado para los quintiles (`cohorts`),
    el color de los bordes de los polígonos (`shapes`).
    Cabe señalar que todos los intervalos definidos para los quintiles son cerrados por la izquierda y abiertos por la derecha (excepto el último que es cerrado por ambos lados. [Ver más](https://es.wikipedia.org/wiki/Intervalo_(matemática)#Notaci.C3.B3n)).
    - `points_map` - configuración para la capa de puntos.

      Ambas capas comparten algunos parámetros como el identificador de la capa (`id`),
      la ruta y nombre del archivo que contiene el geojson (`data_url`),
      los campos de datos que se desea mostrar en el _pop up_ (`pop_up`) al hacer click sobre un polígono o punto.

- `timeseries` - contiene las configuraciones relacionadas a la serie de tiempo,
como el identificador de la visualización (`id`),
la ruta y nombre del archivo que contiene los datos (`data_url`),
y asociaciones entre los datos y la gráfica (`config`),
tales como: ejes (`axis`), título y encabezado de la gráfica en el panel lateral (`panel`).

- `mappings` - aquí se define la configuración de las relaciones entre los polígonos del mapa y la serie de tiempo.
En `map_layer.id` se define el identificador de la capa de polígonos que se relaciona con la serie de tiempo especificada como `ts.id`,
a través del campo `key` especificado para cada conjunto de datos.
Esto permite mostrar en el panel la serie de tiempo correcta cuando se hace _hover_ sobre el polígono correspondiente.

Puesto que toda la configuración se realiza en este archivo, no es necesario modificar ninguno de los archivos de código ([ver otro ejemplo](./data/config-municipios.json)).

#### Datos

Los datos que se muestran en la visualización se almacenan en archivos json.

**Mapa.**
Los archivos que contienen las definiciones de los polígonos y puntos **necesariamente** deben cumplir con [el estándar del formato geojson](http://geojson.org/) para `MultiPolygon` y `Point`, respectivamente.
- [Ejemplo geojson polígonos](./data/entidades-poligonos.json).
- [Ejemplo geojson puntos](./data/entidades-puntos.json).

:warning: - Importante: De no cumplir con el formato estándar, el mapa no se visualizará en el navegador.

**Serie de tiempo.**
El archivo de datos para esta visualización consiste en un arreglo de objetos donde cada objeto contiene un identificador que se usa para asociar una serie de tiempo con su polígono correspondiente.
También incluye el conjunto de datos a usarse para crear la serie de tiempo, que consiste en un arreglo bajo la llave `dataset` ([ver ejemplo](./data/datos-entidades.json)).
