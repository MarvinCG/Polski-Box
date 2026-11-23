# Polski Box 🇵🇱

App para aprender polaco cada día. La app está en español (con polaco como opción en Ajustes) y la página de la profesora en polaco (con español como opción). Tiene una caja de aprendizaje (sistema Leitner), 17 unidades del curso, 12 situaciones con la familia de la novia, diálogos con juego de roles y 6 juegos. Funciona sin internet. La sincronización entre dispositivos es opcional.

Es una **web app** y se actualiza sola: cada push a `main` se publica en GitHub Pages, y todos los dispositivos reciben la versión nueva la próxima vez que la abren.

| Dispositivo | Cómo se instala |
|---|---|
| Android (teléfono, tablet, **Samsung DeX**) | Chrome → menú ⋮ → **Instalar app**, o el botón *Instalar* en Progreso |
| iPad / iPhone | Safari → Compartir → **Añadir a pantalla de inicio** |
| Windows / Mac | Edge o Chrome → **Instalar Polski Box** (icono en la barra de direcciones) |
| Profesora | `teacher.html`: agrega palabras, graba su voz, pone fotos y quita frases |

Web: **https://marvincg.github.io/Polski-Box/**, disponible después de la configuración de abajo.

---

## Configuración (una sola vez, ~10 min)

### 1. Publicar la web (GitHub Pages, gratis)

GitHub Pages gratis solo funciona con repositorios **públicos**.

1. **Settings → General → Danger Zone → Change visibility → Public** ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)).
   - Queda público: el código y el vocabulario.
   - Sigue privado: tu progreso, las palabras de tu profesora y las claves, porque viven en el repositorio privado del paso 2.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions** ([docs](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)).
3. **Actions → "Publicar web (GitHub Pages)" → Run workflow**. Después se publica sola en cada push a `main`.

Cada publicación genera también el **audio HD** con la voz neuronal Piper (`pl_PL-gosia-medium`) y reemplaza las grabaciones de eSpeak. Si ese paso falla, la web se publica igual con las grabaciones normales.

### 2. Sincronización (repositorio privado de datos)

1. Crea un repositorio nuevo, **privado** y vacío: `polski-box-data`.
2. Crea un token *fine-grained* ([docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token)):
   - **Repository access:** *Only select repositories* → `polski-box-data`
   - **Permissions → Repository → Contents:** *Read and write*
   - **Expiration:** la más larga que te permita
3. En la app: **Progreso → Sincronizar dispositivos → Conectar**, con `MarvinCG/polski-box-data` y el token.
4. Para cada dispositivo nuevo: **Copiar código para otro dispositivo** y pégalo en el otro dispositivo, en la misma pantalla.
5. Para tu profesora: **Copiar enlace para tu profesora** y mándaselo. Ella lo abre una vez y queda conectada.

La app sincroniza al abrir, al terminar una sesión o juego, al cambiar de app y cada 4 minutos. También con el botón ⟳ de arriba.

Los datos que guarda en el repositorio privado:

| Archivo | Contenido |
|---|---|
| `progress.json` | Cajas, racha por dispositivo, récords, ajustes y palabras quitadas |
| `words.json` | Palabras de la profesora (solo se agregan; las borradas se marcan) |
| `voice.json`, `voice/*.mp3` | Grabaciones de la profesora |
| `img.json`, `img/*.jpg` | Fotos de la profesora |

> ⚠️ El código y el enlace llevan el token. Compártelos solo con tus dispositivos y con tu profesora. Si se filtra, revócalo en GitHub y crea otro.

---

## Página de la profesora

Tiene dos pestañas:

- **➕ Añadir palabra.** Escribe la palabra o frase en polaco y toca *Revisar*. La revisión de ortografía y gramática la hace [LanguageTool](https://dev.languagetool.org/public-http-api), y además avisa de duplicados y muestra la IPA. Puede elegir un emoji o una **foto de su galería**.
- **📚 Palabras.** Para cualquier palabra, frase o línea de diálogo puede:
  - grabar su voz;
  - ponerle una **foto**, que se reduce a JPEG de ~720 px en su navegador y se ve en la app en lugar del dibujo;
  - **quitarla de la app** o volver a mostrarla.
  Hay filtros: *sin tu voz*, *sin foto* y *quitadas*.

**Modificar y eliminar.** Cualquier palabra, frase o línea de diálogo se puede modificar desde la pestaña Palabras de la página de la profesora (✏️ Modificar), y cualquier palabra desde la app (abre la palabra → ✏️ Modificar): el polaco, la traducción, la nota y el registro, con revisión de ortografía. Siempre se puede **volver al original**. Si cambia el polaco, suena la voz generada hasta que la profesora vuelva a grabarla. Cada grabación guarda el texto que se leyó, así no suena una grabación que ya no coincide.

**Eliminar definitivamente** (🗑, con doble confirmación) borra la palabra para los dos y no se puede recuperar. Junto con ella se borran su voz y su foto. *Quitar* (🚫) solo la esconde y se puede recuperar.

Tú también puedes quitar palabras desde la app: abre una palabra → **Quitar de mi estudio**, o toca *No la necesito* cuando te aparece una nueva. Las quitadas no salen en sesiones ni juegos y se recuperan en **Palabras → Quitadas**. Lo que quita uno lo ve el otro al sincronizar.

## Voz de la profesora

En `teacher.html` → **🎙️ Mi voz**, la profesora graba cada palabra, frase o línea de diálogo:

1. Toca 🎙️ **Grabar** y lee la palabra.
2. Toca **Detener**. Puede comparar su grabación con la voz generada.
3. Toca **Guardar y siguiente**.

Con teclado: Espacio graba o detiene, Enter guarda y pasa a la siguiente, → salta.

El audio se recorta, se normaliza y se convierte a MP3 (~10 KB por palabra) en su propio navegador, con [lamejs](https://github.com/zhuker/lamejs) (LGPL). Se guarda en `voice/` del repositorio privado de datos.

La app descarga las grabaciones al sincronizar y las guarda en el dispositivo, así que funcionan sin internet. Donde hay grabación suena su voz, marcada con 👩‍🏫 en el botón; el botón 🤖 reproduce la voz generada. Se puede apagar en **Progreso → Ajustes → Usar la voz de mi profesora**.

## Voz

La opción **Auto** elige la voz polaca más natural disponible en el dispositivo:

| Dispositivo | Voz |
|---|---|
| Android | Voz polaca de Google (Ajustes → Idioma → Texto a voz) |
| iPad | Instalar **Zosia (mejorada/premium)**: Ajustes → Accesibilidad → Contenido leído → Voces → Polaco |
| Windows | En **Edge**: Microsoft *Zofia* y *Marek Online (Natural)*, voces neuronales |
| Web publicada | Grabaciones HD de Piper (sin internet, igual en todos lados) |

En **Progreso → Ajustes → Voz en este dispositivo** se puede elegir una voz concreta.

## Samsung DeX, tablets y PC

Con pantalla ancha o en horizontal, la navegación pasa a un riel lateral, el contenido se reparte en columnas y los ejercicios se muestran a dos columnas: imagen a la izquierda, respuestas a la derecha. En DeX las ventanas se pueden cambiar de tamaño libremente.

Teclado:

| Tecla | Acción |
|---|---|
| 1–4 | Responder |
| Enter | Siguiente / comprobar |
| Espacio | Escuchar |
| Esc | Volver |
| 1–6 (fuera de un ejercicio) | Cambiar de pestaña |
| Letras (en *Deletrea*) | Escribir |

## Juegos

Parejas · Contrarreloj · Escucha y toca · Deletrea · Ordena la frase · ¿Formal o informal?

Cada partida mezcla palabras que ya empezaste con **hasta dos nuevas**. Las nuevas se presentan primero y después entran a la caja 1. Los juegos dan XP y niveles, y guardan récords; todo se sincroniza.

---

## Desarrollo

```
web/            la app (HTML/CSS/JS sin dependencias): app.js, games.js, sync.js, ipa.js, teacher.html/js, sw.js
  data.js       vocabulario generado · a/ audio · e/ imágenes (Twemoji, CC-BY 4.0)
tools/
  prep.py       genera web/data.js, web/e, web/a y web/audio.json desde tools/src/*.json y tools/sit.txt
  sit.txt       las 12 situaciones (frases, registro, notas, diálogos)
  piper_audio.py  audio HD con Piper (lo usa el workflow)
  build_apk.sh  arma el APK sin Android Studio (paquetes de Ubuntu: aapt, apksigner, zipalign, dalvik-exchange, libandroid-23-java)
  test_edit.mjs  scroll, modificar y eliminar · test_monkey.mjs miles de toques al azar buscando errores
  test_v2.mjs   prueba de punta a punta con Playwright (GitHub y LanguageTool simulados); test_voice.mjs: voz, fotos y palabras quitadas
android/        (opcional, ya no se distribuye) envoltorio WebView del APK
```

```bash
cd tools && npm i @twemoji/svg && python3 prep.py   # regenerar datos (añade --no-audio para saltar el audio)
cd web && python3 -m http.server 8765               # probar en http://localhost:8765
tools/build_apk.sh ruta/al/polskibox.keystore       # opcional: APK firmado → out/PolskiBox.apk
```

El keystore del APK no está en el repositorio.
