# Polski Box 🇵🇱

App para aprender polaco cada día. Tiene una caja de aprendizaje (sistema Leitner), 17 unidades del curso, 12 situaciones con la familia de la novia, diálogos con juego de roles y 6 juegos. Funciona sin internet. La sincronización entre dispositivos es opcional.

Una sola base de código (`web/`) sirve para todo:

| Dispositivo | Cómo se usa |
|---|---|
| Android (teléfono, tablet, **Samsung DeX**) | APK nativo: `web/download/PolskiBox.apk` (también en la web: `/download/PolskiBox.apk`) |
| iPad / iPhone | Web instalable: Safari → Compartir → **Añadir a pantalla de inicio** |
| Windows / Mac | Web instalable: Edge o Chrome → menú ⋯ → **Aplicaciones → Instalar Polski Box** |
| Profesora | `teacher.html`: agrega palabras y la app las revisa |

Web: **https://marvincg.github.io/polski-box/**, disponible después de la configuración de abajo.

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
| `progress.json` | Cajas, racha por dispositivo, récords y ajustes |
| `words.json` | Palabras de la profesora (solo se agregan; las borradas se marcan) |
| `config.json` | Clave opcional de Gemini |

> ⚠️ El código y el enlace llevan el token. Compártelos solo con tus dispositivos y con tu profesora. Si se filtra, revócalo en GitHub y crea otro.

### 3. Revisión con IA para la profesora (opcional, gratis)

En `teacher.html`, abajo en **Ajustes**, se puede pegar una clave de **Google Gemini** ([crear clave](https://ai.google.dev/gemini-api/docs/api-key)). Con ella, cada palabra recibe:
- corrección
- traducción ES/EN
- registro formal/informal
- emoji
- nota de uso

Sin clave, igual se revisan ortografía y gramática con [LanguageTool](https://dev.languagetool.org/public-http-api), además de duplicados, IPA y emoji sugerido.

En el nivel gratuito de Gemini, Google puede usar los textos para mejorar sus modelos. Son solo palabras de vocabulario.

---

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
  test_v2.mjs   prueba de punta a punta con Playwright (GitHub, LanguageTool y Gemini simulados)
android/        envoltorio WebView: voz nativa, almacenamiento, compartir y HTTP para sincronizar
```

```bash
cd tools && npm i @twemoji/svg && python3 prep.py   # regenerar datos (añade --no-audio para saltar el audio)
cd web && python3 -m http.server 8765               # probar en http://localhost:8765
tools/build_apk.sh ruta/al/polskibox.keystore       # APK firmado → web/download/PolskiBox.apk
```

**El keystore no está en el repositorio.** Guárdalo en un lugar seguro. Las actualizaciones del APK deben firmarse con la misma clave para instalarse encima de la versión anterior sin perder el progreso.
