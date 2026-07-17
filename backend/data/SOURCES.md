# Fuentes clínicas del dataset sintético

## Resultado honesto tras la reconstrucción

Con este dataset (45 muestras/clase, generadas por `generate_dataset.py`),
la precisión validada por cross-validation (5×10 folds) es:

- **Perros: 79.84%**
- **Gatos: 73.63%**

Esto es *más bajo* que el dataset anterior (96-98%), y es la versión
correcta: el dataset anterior tenía 10 filas por clase armadas a mano con
patrones fáciles de separar (y, en varios casos, con errores clínicos
reales — ver "Errores corregidos" abajo), lo que inflaba artificialmente el
número. Este 73-80% refleja la dificultad real de diagnosticar solo por
síntomas reportados por el dueño, sin exámenes de laboratorio ni imágenes,
que es exactamente la limitación que tiene cualquier sistema de este tipo
(y que tiene también un veterinario en un triage inicial sin pruebas).
Ver `backend/tests/test_dataset_integrity.py` para las validaciones
automáticas que corren en CI cada vez que se regenera el dataset.

El dataset (`dataset.csv`) es **sintético**: no contiene historias clínicas
reales de pacientes (esos registros son privados y no están disponibles
públicamente). Lo que sí es real son las **asociaciones síntoma-enfermedad**
usadas para generarlo, tomadas de literatura veterinaria publicada. El
generador está en `generate_dataset.py`, con un perfil de probabilidad de
síntomas por enfermedad (`SYMPTOM_PROFILES`) construido a partir de estas
fuentes.

Esto es honesto de comunicar así en la tesis: **"distribución de síntomas
informada por literatura veterinaria citada, no por registros clínicos
reales"**. Es metodológicamente válido y muy superior a los datos anteriores,
que eran combinaciones armadas a mano sin respaldo documentado (y que en
varios casos —confirmado al auditar el dataset previo— tenían perfiles de
síntomas clínicamente incorrectos, ver sección "Errores corregidos" abajo).

## Fuentes internacionales de referencia (estándar en medicina veterinaria)

Usadas para la mayoría de las enfermedades, por ser la referencia más citada
en la práctica clínica de pequeños animales en español:

- Manual Merck/MSD de Veterinaria (versión en español): parvovirus canino,
  moquillo canino, leptospirosis canina, panleucopenia felina, leucemia
  felina (FeLV), tos de las perreras/traqueobronquitis infecciosa,
  dermatitis atópica canina, otitis externa, osteoartritis en perros y
  gatos, enfermedad del tracto urinario inferior en gatos (cistitis
  idiopática felina).
  - https://www.merckvetmanual.com/es-us/
  - https://www.msdvetmanual.com/es/

## Fuentes peruanas (epidemiología local)

- Zúñiga Mendizábal, E. "Frecuencia de enfermedades infecciosas en caninos
  en la Clínica Veterinaria Docente Cayetano Heredia, periodo 2014-2017."
  Revista Salud y Tecnología Veterinaria, UPCH. 307 historias clínicas
  reales con diagnóstico confirmado por laboratorio. Frecuencias
  encontradas: ehrlichiosis 45.7%, leptospirosis 11.5%, anaplasmosis 10.6%,
  giardiasis 8.7%, coccidiosis 7.8%, moquillo 7.8%, parvovirus.
  - https://revistas.upch.edu.pe/index.php/STV/article/view/4009
  - PDF: https://repositorio.upch.edu.pe/bitstream/handle/20.500.12866/4559/Frecuencia_Zu%C3%B1igaMendizabal_Erika.pdf

- Seroprevalencia de la Dirofilariosis y Ehrlichiosis canina en tres
  distritos de Lima. SciELO Perú.
  - http://www.scielo.org.pe/scielo.php?script=sci_arttext&pid=S1609-91172003000100008

- Frecuencia serológica de Ehrlichia canis en caninos sospechosos de
  ehrlichiosis en Lima Norte, Perú. SciELO Perú.
  - http://www.scielo.org.pe/scielo.php?script=sci_arttext&pid=S1609-91172020000300020

- Frecuencia de Dirofilaria immitis en caninos del distrito de San Juan de
  Lurigancho. SciELO Perú.
  - http://www.scielo.org.pe/scielo.php?script=sci_arttext&pid=S1609-91172004000200008

Estas fuentes confirman que **ehrlichiosis, leptospirosis, moquillo y
parvovirus están entre las enfermedades infecciosas caninas más frecuentes
en clínicas peruanas**, lo cual respalda que estén representadas en el
dataset con buen número de casos.

## Enfermedades sin fuente peruana específica encontrada

Para el resto (endocrinas: Cushing, hipotiroidismo, diabetes; ortopédicas:
displasia de cadera, osteoartritis; dermatológicas: dermatitis alérgica,
sarna, pulgas; felinas: hipertiroidismo, ERC, miocardiopatía hipertrófica,
FIV, toxoplasmosis, gastritis, periodontal, conjuntivitis) se usó la
presentación clínica estándar descrita en Manual Merck/MSD y fuentes
veterinarias generales — la fisiología de estas enfermedades no varía por
país, a diferencia de la frecuencia/prevalencia (que sí es geográfica y
depende de clima, vectores, etc.). No se afirma prevalencia peruana
específica para estas.

## Errores corregidos respecto al dataset anterior

Al auditar el dataset original (10 filas por enfermedad, hecho a mano) contra
esta literatura, se encontraron perfiles de síntomas clínicamente
incorrectos en varias clases — probablemente ruido introducido al armarlas
manualmente sin verificación:

- **`displasia_cadera`** (perro y gato): el dataset anterior tenía como
  síntomas dominantes `confusion`, `fiebre`, `pupilas_dilatadas`,
  `ansiedad` — síntomas neurológicos/sistémicos que no tienen relación con
  una enfermedad articular. Corregido a `cojera`, `rigidez_articular`,
  `dolor_al_moverse`, `intolerancia_ejercicio` (igual que `osteoartritis_canina`,
  con la que comparte fisiopatología — la displasia de cadera es la causa
  más común de osteoartritis de cadera en perros jóvenes).
- **`otitis_canina`**: no incluía `sacudida_cabeza` (sacudir la cabeza) entre
  sus síntomas — es el signo más característico de otitis y ya existía como
  columna en el dataset, simplemente no se había usado. Corregido.
- **`rinotraqueitis_viral_felina`**: el dataset anterior no incluía ningún
  síntoma ocular/respiratorio (`secrecion_ocular`, `ojos_rojos`,
  `ojos_llorosos`), pese a que es una enfermedad respiratoria/ocular por
  definición (herpesvirus felino). Corregido con los signos oculares como
  síntomas dominantes.

## Ambigüedad clínica real (no es un error, es honesto mantenerla)

- **Leucemia felina (FeLV) vs. Inmunodeficiencia felina (FIV)**: en la
  práctica real ambas cursan con síntomas muy similares (letargo, pérdida de
  peso, anorexia, infecciones secundarias) y se distinguen por análisis de
  sangre (ELISA/PCR), no por síntomas. El dataset las mantiene
  deliberadamente parecidas — es lo clínicamente honesto — y el sistema ya
  señala esto mostrando un diagnóstico diferencial cuando las probabilidades
  están cerca (ver `backend/ml/predict.py`, lógica de
  `diagnostico_alternativo`).
- **Displasia de cadera vs. osteoartritis canina**: comparten fisiopatología
  y no son distinguibles solo por los síntomas de este dataset (se necesita
  radiografía). Se mantienen con perfiles de síntomas casi idénticos por la
  misma razón.
