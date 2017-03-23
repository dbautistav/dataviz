# dataviz

# Visualización tipo gráfica de barras

Descripción de archivos principales:

- `barchart.html` <br>- Archivo html en el que se importan principalmente:
  * Librería de la visualización
  * Archivo `js` con diversas funcionalidades (`js/barchart.js`)
  * **Contendor para la gráfica**, que en este caso se debe definir en el html como:<br>
  `<div id="bar-chart"></div>`
  * **Contenedor para leyendas**, que debe tener la siguiente estrucutra html:<br>
  ```
  <div class="svgLegend4">
      <div class="legend4"></div>
  </div>
  ```
  
- `partials/barchart_example.json`<br>- **Json base** para definir los valores que mostrará la visualización.<br><br>

- `js/barchart.js`<br>- Javascript que contiene las funcionalidades **necesarias** para dibujar la visualización.

##Json base para gráfica de barras

El Json que consumirá la visualización debe estar en todo momento dentro del folder `partials` y tener asignado el nombre `barchart_example.json`<br>

La **estructura** debe ser igual a la del archivo `barchart_example.json`, si exisite alguna diferencia, por mínima que sea, la gráfica no se visualizará en el navegador.

Además los **nombres** o `keys` de los valores deben ser iguales a los dej Json de ejemplo para que estos se puedan mostrar en la visualización.

**Estructura**

```
{
  "ejex": "Transporte",
  "ejey": "Personas",
  "valores": [
    {"label":"Coche", "Chihuahua":20325, "Coahuila":10834, "Sonora": 50926, "Nuevo León":20778},
    {"label":"Coche compartido", "Chihuahua":15643, "Coahuila":30726, "Sonora":40878, "Nuevo León":15352},
    {"label":"Autobus", "Chihuahua":20778, "Coahuila":15352, "Sonora":40878, "Nuevo León":20325},
    {"label":"Metro", "Chihuahua":50926, "Coahuila":20778, "Sonora":40522, "Nuevo León":10834},
    {"label":"Bicicleta", "Chihuahua":20325, "Coahuila":10834, "Sonora":25899, "Nuevo León":23987},
    {"label":"A pie", "Chihuahua":15352, "Coahuila":20325, "Sonora":30726, "Nuevo León":16335},
    {"label":"Motocicleta", "Chihuahua":40878, "Coahuila":15352, "Sonora":67854, "Nuevo León":20778},
    {"label":"Taxi", "Chihuahua":50926, "Coahuila":10834, "Sonora":20325, "Nuevo León":20778}
  ]
}
```

**Valores editables para la gráfica de barras**

- "ejex" //Legenda del Eje X en la gráfica
- "ejey" //Legenda del Eje Y en la gráfica
- "valores" //Son los valores que se muestran en las columnas de la gráfica
- "label" //Es el valor por el cual se agrupan las columnas

# Visualización tipo gráfica de pie

Descripción de archivos principales:

- `piechart.html` <br>- Archivo html en el que se importan principalmente:
  * Librería de la visualización
  * Archivo `js` con diversas funcionalidades (`js/piechart.js`)
  * **Contendor para la gráfica**, que en este caso se debe definir en el html como:<br>
  `<div id="pie-chart"></div>`
  * **Contenedor para leyendas**, que debe tener la siguiente estrucutra html:<br>
  ```
  <div class="svgLegend4">
      <div class="legend4"></div>
  </div>
  ```
  
- `partials/piechart_example.json`<br>- **Json base** para definir los valores que mostrará la visualización.<br><br>

- `js/piechart.js`<br>- Javascript que contiene las funcionalidades **necesarias** para dibujar la visualización.

##Json base para gráfica de pie

El Json que consumirá la visualización debe estar en todo momento dentro del folder `partials` y debe tener asignado el nombre `piechart_example.json`<br>

La **estructura** debe ser igual a la del archivo `piechart_example.json`, si exisite alguna diferencia, por mínima que sea, la gráfica no se visualizará en el navegador.

Además los **nombres** o `keys` de los valores deben ser iguales a los dej Json de ejemplo para que estos se puedan mostrar en la visualización.

**Estructura**

```
[
  {"label": "Alpha", "value": 20},
  {"label": "Beta", "value": 15},
  {"label": "Gamma", "value": 70},
  {"label": "Delta", "value": 40},
  {"label": "Epsilon", "value": 50}
]
```
//Cada objeto del Json es un área del Pie chart

**Valores editables para gráfica de pie**

- "label" //Es la etiqueta que se muestra en el tooltip y en las leyendas por cada color
- "value" //Es el valor con que se dibuja cada área del Pie, en el tooltip se muestra como porcentaje

# Visualización tipo Treemap

Descripción de archivos principales:

- `treemap.html` <br>- Archivo html en el que se importan principalmente:
  * Librería de la visualización
  * Archivo `js` con diversas funcionalidades (`js/treemap.js`)
  * **Contendor para la gráfica**, que en este caso se debe definir en el html como:<br>
  `<div id="treemapd3"></div>`<br><br>
  
  
- `partials/treemap_example.json`<br>- **Json base** para definir los valores que mostrará la visualización.<br><br>

- `js/treemap.js`<br>- Javascript que contiene las funcionalidades **necesarias** para dibujar la visualización.

##Json base

El Json que consumirá la visualización debe estar en todo momento dentro del folder `partials` y debe tener asignado el nombre `treemap_example.json`<br>

La **estructura** debe ser igual a la del archivo `treemap_example.json`, si exisite alguna diferencia, por mínima que sea, la gráfica no se visualizará en el navegador.

Además los **nombres** o `keys` de los valores deben ser iguales a los dej Json de ejemplo para que estos se puedan mostrar en la visualización.

**Estructura para Treemap**

```
{
	"unidad": "Personas",
	"valores": [
		{
			"nivel1": "Manufactura y construcción",
			"nivel2": "Apoyo a la juventud",
			"nivel3": "Servicios personales",
			"nivel4": "Prima quinquenal por años de servicios efectivos presta dos.",
			"valor": 55000
		}
	]
}
```
**Valores editables para Treemap**

- "unidad" //Se muestra como texto dentro del popup de cada área del treemap
- "valores" //Son los valores en que se agrupa el Treemap, si se quieren tener más o menos niveles de profundidad, estos se deben especificar en el archivo `js/treemap.js` en la variable `idVal`
- "valor" //Asigna valor y porcentaje a cada elemento del Treemap

# Visualización tipo scatter plot

Descripción de archivos principales:

- `scatter.html` <br>- Archivo html en el que se importan principalmente:
  * Librería de la visualización
  * Archivo `js` con diversas funcionalidades (`js/scatter.js`)
  * **Contendor para la gráfica**, que en este caso se debe definir en el html como:<br>
  `<div id="scatterplot"></div>`
  * **Contenedor para escalas**, es en donde se mostrará la descripción de los tamaños de las burbujas en el scatter plot y debe tener la siguiente estrucutra html:<br>
  ```
  <div class="col-sm-10 escala">

    <div class="col-sm-1 textLegendHard">Escala:</div>
    
    <div class="col-sm-2" id="circle-big"></div>
    <div class="col-sm-2 textLegend"><span id="legendBig"></span></div>

    <div class="col-sm-2" id="circle-medium"></div>
    <div class="col-sm-2 textLegend"><span id="legendMd"></span></div>

    <div class="col-sm-2" id="circle-small"></div>
    <div class="col-sm-2 textLegend"><span id="legendSm"></span></div>

  </div>
  ```
  
- `partials/scatter_example.json`<br>- **Json base** para definir los valores que mostrará la visualización.<br>

- `js/scatter.js`<br>- Javascript que contiene las funcionalidades **necesarias** para dibujar la visualización.
<br><br>

Para probar las visualizaciones en local, es necesario montar el proyecto en un servidor web local como Apache.

##Json base

El Json que consumirá la visualización debe estar en todo momento dentro del folder `partials` y debe tener asignado el nombre `scatter_example.json`<br>

La **estructura** debe ser igual a la del archivo `scatter_example.json`, si exisite alguna diferencia, por mínima que sea, la gráfica no se visualizará en el navegador.

Además los **nombres** o `keys` de los valores deben ser iguales a los dej Json de ejemplo para que estos se puedan mostrar en la visualización.

**Estructura para scatter plot**

```
{
  "titulo": "Tipos de contratación",
  "ejex": "Fecha de firma",
  "ejey": "Vigencia en meses",
  "unidad": "Pesos",
  "valores": [
    {
      "tipo": "Licitación",
      "monto": 12855,
      "vigencia": 50,
      "fecha": "12 Ene 2015",
      "contrato": "SO-005542-N23-2015"
    }
   ]
}
```

**Valores editables para scatter plot**

- "titulo" //Es la leyenda que se muestra en la parte superior de la gráfica
- "ejex" //Legenda del Eje X en la gráfica
- "ejey" //Legenda del Eje Y en la gráfica
- "unidad" //Se muestra como texto en la leyenda de la Escala en la parte inferior de la gráfica
- "valores" //Cada objeto dentro de este array dibuja una "burbuja" o "circulo" en el Scatter
- "tipo" //Valor por el cual se agrupan las "burbujas
- "monto" //Asigna el tamaño de la "burbuja"
- "vigencia" //Posición de la "burbuja" respecto al Eje Y
- "fecha" //Posición de la "burbuja" respecto al Eje X
- "contrato" //Valor que se muestra como texto dentro del Tooltip de cada burbuja

# Visualización de mapa geográfico de México interactivo

[Ver especificaciones de la visualización tipo mapa](./mapa/README.md).
