#!/bin/bash
# Build the Android app from web/ without the Android SDK (Ubuntu packages: aapt, apksigner, zipalign, dalvik-exchange, libandroid-23-java).
# Usage: tools/build_apk.sh [keystore]   (the keystore is NOT in the repository; keep it safe — updates must be signed with the same key)
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
AJ=/usr/lib/android-sdk/platforms/android-23/android.jar
KS=${1:-$ROOT/polskibox.keystore}
VC=$(grep -o 'versionCode="[0-9]*"' android/AndroidManifest.xml | grep -o '[0-9]*'); VN=$(grep -o 'versionName="[^"]*"' android/AndroidManifest.xml | cut -d'"' -f2)
OUT=out; rm -rf $OUT; mkdir -p $OUT/classes $OUT/dex $OUT/assets
cp -r web/. $OUT/assets/ && rm -rf $OUT/assets/download $OUT/assets/sw.js $OUT/assets/audio.json
javac -nowarn --release 8 -cp $AJ -d $OUT/classes android/java/com/aaron/polskibox/MainActivity.java 2>&1 | grep -v "^Note\|warning" || true
java -cp /usr/share/java/com.android.dx.jar com.android.dx.command.Main --dex --min-sdk-version=21 --output=$OUT/dex/classes.dex $OUT/classes
aapt package -f -M android/AndroidManifest.xml -S android/res -A $OUT/assets -I $AJ -F $OUT/base.apk --min-sdk-version 21 --target-sdk-version 33 --version-code $VC --version-name $VN --auto-add-overlay -0 mp3
(cd $OUT/dex && aapt add -f ../base.apk classes.dex >/dev/null)
python3 - <<'P'
import zipfile
src=zipfile.ZipFile('out/base.apk'); dst=zipfile.ZipFile('out/unaligned.apk','w')
for i in src.infolist():
    data=src.read(i.filename)
    comp=zipfile.ZIP_STORED if (i.filename=='resources.arsc' or i.filename.endswith(('.mp3','.png'))) else zipfile.ZIP_DEFLATED
    z=zipfile.ZipInfo(i.filename,(2026,1,1,0,0,0)); z.compress_type=comp; z.external_attr=0o644<<16
    dst.writestr(z,data)
dst.close()
P
zipalign -f -p 4 $OUT/unaligned.apk $OUT/aligned.apk
if [ ! -f "$KS" ]; then echo "keystore $KS not found"; exit 1; fi
apksigner sign --ks "$KS" --ks-pass pass:${KS_PASS:-polskibox} --key-pass pass:${KS_PASS:-polskibox} --out $OUT/PolskiBox.apk $OUT/aligned.apk
apksigner verify $OUT/PolskiBox.apk && zipalign -c -p 4 $OUT/PolskiBox.apk && echo "OK $VN ($VC)"
echo "APK: $OUT/PolskiBox.apk"

