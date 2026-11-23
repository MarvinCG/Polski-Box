"""Build data.js, copy emoji pictures and generate audio for Polski Box."""
import json, os, re, shutil, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = ROOT + '/tools/src/'
OUT = ROOT + '/web'
TW = ROOT + '/tools/node_modules/@twemoji/svg/'
shutil.rmtree(OUT + '/e', ignore_errors=True)
os.makedirs(OUT + '/e', exist_ok=True)
os.makedirs(OUT + '/a', exist_ok=True)

units = []
for f in ('data1.json', 'data2.json', 'data3.json', 'data4.json'):
    units += json.load(open(SRC + f, encoding='utf-8'))

# ---------------------------------------------------------------- English
EN_UNIT = ["Greetings & courtesy", "Introducing yourself", "Understanding & being understood", "Numbers",
           "Questions", "Pronouns & key words", "Essential verbs", "Days, months & dates", "Time & frequency",
           "Food & drink", "At the café or restaurant", "Shopping & money", "Getting around town",
           "Home & daily things", "People & family", "Adjectives & colours", "Health & emergencies"]
ICON = "👋 🙋 🗣️ 🔢 ❓ 👤 🏃 📅 ⏰ 🍎 ☕ 🛍️ 🚌 🏠 👪 🎨 🏥".split()

EN = {}
EN['u01'] = """Good morning / Good afternoon|Good evening|Hi / Bye|Hi (very informal)|Goodbye|See you soon|Bye!|See you (later)|See you tomorrow!|Good night (going to bed)|Please / Here you are / Go ahead|Could I have…, please|Thank you|Thanks (informal)|Thank you very much|You're welcome|Sorry / Excuse me|Yes|No|Good / OK|How are you?|What's up? / How are things?|Enjoy your meal!|Cheers! (to your health)|Have a nice day!|Best wishes! / Happy birthday!"""
EN['u02'] = """What's your name?|My name is…|I am…|What is your name? (to a woman, formal)|My name is… (full name)|Nice to meet you.|Very nice to meet you.|Likewise. / Me too.|Where are you from?|I'm from Costa Rica.|I live in Costa Rica.|Where do you live?|I speak Spanish.|I speak a little Polish.|I'm learning Polish.|How old are you?|I'm thirty years old.|What do you do (for work)?|I'm an IT specialist.|I work in an office."""
EN['u03'] = """I don't understand.|I understand.|I don't know.|Pardon? / Hello? (on the phone)|Can you repeat that?|Speak more slowly, please.|What does that mean?|How do you say… in Polish?|How do you spell that?|Do you speak English?|I have a question.|Can you help me?|Just a moment.|Sure!|Of course.|Really?|Yes! / Right!|You're right.|I agree.|No worries. / It doesn't matter.|No problem."""
EN['u04'] = """0 · zero|1 · one|2 · two|3 · three|4 · four|5 · five|6 · six|7 · seven|8 · eight|9 · nine|10 · ten|11 · eleven|12 · twelve|13 · thirteen|14 · fourteen|15 · fifteen|16 · sixteen|17 · seventeen|18 · eighteen|19 · nineteen|20 · twenty|30 · thirty|40 · forty|50 · fifty|60 · sixty|70 · seventy|80 · eighty|90 · ninety|100 · one hundred|200 · two hundred|500 · five hundred|1000 · one thousand|half|first"""
EN['u05'] = """What?|Who?|Where?|When?|How?|Why?|How much? / How many?|Which? (m. / f. / n.)|Where to?|Where from?|(opens a yes/no question)|What is this?|Who is it?|Where is…?|How long?|What are you doing?|What's the matter? / What's it about?|Why not?"""
EN['u06'] = """I|you|he / she / it|we|you (plural, informal)|they|you (formal: man / woman)|you (formal plural) / ladies and gentlemen|my (m. / f. / n.)|your (m. / f. / n.)|this / that|and|and (in contrast) / and…?|but|or|because|so / then|also / too|very / a lot|a little|a lot / much|little / few|everything|nothing|something|someone|maybe / perhaps|I think / apparently|for sure / certainly|with|without|for|in (inside)|on / at / to|to / toward / until"""
EN['u07'] = """to be|to have|to want|to be able to / can|to have to / must|to like|to know (a fact)|to know (a person or place)|to understand|to speak / to say|to go (on foot)|to go (by vehicle)|to eat|to drink|to do / to make|to work|to live (reside)|to buy|to pay|to look for|to need|to wait|to see|to listen|to sleep|to learn / to study|to call (by phone)|to love"""
EN['u08'] = """Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|weekend|today|tomorrow|yesterday|day|week|month|year|birthday|January|February|March|April|May|June|July|August|September|October|November|December"""
EN['u09'] = """hour|minute|What time is it?|It's eight o'clock.|At what time?|At eight o'clock.|now|in the morning (early)|in the afternoon|in the evening|at night|early|late|later / afterwards|already|still / yet / more|always|often|sometimes|never|every day|late (running late)"""
EN['u10'] = """water|sparkling / still water|coffee|tea|milk|juice|beer|wine|bread|bread roll|butter|cheese|egg|meat|chicken|pork|beef|fish|rice|pasta|potatoes|soup|salad|vegetables|fruit|apple|tomato|sugar|salt|pepper|breakfast|lunch (main meal)|dinner / supper|pierogi (Polish dumplings)|I'm hungry. (m. / f.)|I'm thirsty.|I don't eat meat."""
EN['u11'] = """restaurant|café|waiter / waitress|A table for two, please.|The menu, please.|What do you recommend? (to a woman)|For me…|A coffee, please.|A beer, please.|with milk|without sugar|Eat in or take away?|Take away, please.|Is this spicy?|delicious|It was delicious!|The bill, please.|tip|Where is the restroom?"""
EN['u12'] = """shop|grocery store|bakery|pharmacy|checkout|money|zloty (Polish currency)|grosz (cent)|How much does it cost?|How much do I owe?|This one, please. / I'll take this.|I'm just looking.|Is there…? / Do you have…?|There isn't any.|Anything else?|That's all.|Can I pay by card?|in cash|receipt|bag|open / closed|sale / special offer|too expensive"""
EN['u13'] = """How do I get to…? (on foot)|How do I get to…? (by car or bus)|straight|to the left|to the right|here|there|near|far|next to|opposite|on the corner|street|centre|stop (bus or tram)|station (train or bus)|airport|bus|tram|train|taxi|car|ticket|A ticket to…, please.|Where do I get off?|I'm lost. (m. / f.)"""
EN['u14'] = """house / home|apartment / flat|room|kitchen|bathroom|bedroom|bed|table|chair|door|window|key|phone|computer|charger|What's the Wi-Fi password?|fridge|light|towel|soap|clothes|rubbish / trash|work / job|neighbour (m. / f.)"""
EN['u15'] = """family|mum|dad|parents|brother|sister|son|daughter|child / children|husband|wife|boyfriend / guy|girlfriend / girl|friend (close, m. / f.)|colleague / acquaintance (m. / f.)|grandfather / grandmother|man|woman|people|This is my brother.|This is my sister.|Do you have children?|I love you."""
EN['u16'] = """good|bad / angry|big|small|new|old|pretty|beautiful|expensive (also "dear")|cheap|hot|cold|warm|easy|difficult|fast|slow / free|tired|happy|white|black|red|blue|green|yellow|grey|pink|brown|orange"""
EN['u17'] = """Help!|Watch out! / Attention!|112 · emergency number (all of the EU)|Please call an ambulance!|I need a doctor.|doctor|hospital|police|I don't feel well.|My head hurts.|My stomach hurts.|I have a fever.|I'm allergic to…|I lost my phone. (m. / f.)|I'm fine (nothing happened to me)."""

NOTE_EN = {
0: "Formal. Works from morning until dusk.", 1: "Formal evening greeting.",
2: "Informal: friends, family, young people. Used for both hello and goodbye.",
4: "Formal: shops, offices, strangers.", 5: "Informal.", 6: "Very informal; often “Pa pa!”.",
10: "A catch-all word: also “you're welcome” and, as a question (“Proszę?”), “pardon?”.",
11: "The normal way to ask for something: “Poproszę kawę” (a coffee, please).",
16: "To apologise and to get someone's attention.", 20: "Informal.", 23: "When toasting and when someone sneezes.",
26: "Informal.", 28: "Also used to introduce yourself: “Jestem Diego”.", 29: "To a man: “Jak się pan nazywa?”.",
42: "With 2, 3 and 4 (and 22, 23, 24…) you say “lata”: “Mam dwadzieścia dwa lata”.",
44: "Professions take the instrumental: informatyk → informatykiem.",
49: "Literally “I'm listening”. Use it if you didn't hear well, or to answer the phone.",
50: "Formal: “Czy może pan/pani powtórzyć?”.", 51: "Formal: “Proszę mówić wolniej”.",
62: "Careful! In colloquial Polish “no” means “yes”. “Nie” is “no”.", 65: "Typical reply to “Przepraszam”.",
68: "Changes with gender: jeden (m.), jedna (f.), jedno (n.).", 69: "dwa (m./n.), dwie (f.): “dwie kawy”.",
82: "Here the “ę” is hardly nasal.", 87: "21 = dwadzieścia jeden, 22 = dwadzieścia dwa… just like in English.",
99: "“pół kilo” = half a kilo.", 100: "“pierwszy raz” = the first time.",
111: "“Czy masz czas?” = Do you have time? You can also leave it out and just raise your intonation.",
124: "“oni” if there is at least one man in the group; “one” if there are none.",
125: "Also “sir / madam”. The verb goes in the 3rd person: “Czy pani mówi po angielsku?”.",
129: "“To jest…” = This is…", 131: "To contrast or to return the question: “A ty?” = And you?",
134: "Colloquial. More formal: “ponieważ”.", 142: "Double negative: “Nic nie wiem” = I know nothing.",
148: "+ instrumental: “z mlekiem” (with milk).", 149: "+ genitive: “bez cukru” (without sugar).",
150: "“dla mnie” = for me.", 151: "“w domu” = at home.", 152: "“na stole” = on the table; “na kawę” = for a coffee.",
153: "“do domu” = (going) home.", 159: "Works as a normal verb: “Lubię kawę” = I like coffee.",
164: "Polish distinguishes going on foot (iść) from going by vehicle (jechać).",
182: "Days and months are written in lower case.", 190: "Also “dziś”.",
213: "Time uses feminine ordinals: pierwsza (1), druga (2), trzecia (3)… ósma (8).",
225: "“jeszcze raz” = once more; “jeszcze nie” = not yet.",
229: "With a double negative: “Nigdy nie piję kawy” = I never drink coffee.",
257: "The “ł” almost disappears: it sounds like “japko”.",
263: "The main meal of the day; in Poland usually mid-afternoon.",
268: "After “nie” the object goes into the genitive: mięso → mięsa.", 274: "To a man: “Co pan poleca?”.",
276: "kawa → kawę (accusative).", 277: "Neuter words don't change in the accusative.",
294: "With 5 or more: “złotych” (dziesięć złotych).", 295: "1 złoty = 100 groszy.",
300: "“Czy jest chleb?” = Is there bread?", 306: "At the till they ask “Paragon?”.", 316: "Also “tu”.",
337: "“w domu” = at home; “do domu” = (going) home.", 346: "Always plural.", 359: "“w pracy” = at work.",
363: "Masculine even though it ends in -a.", 377: "Masculine even though it ends in -a.",
384: "They agree with the noun: dobry dzień (m.), dobra kawa (f.), dobre piwo (n.).",
400: "“Czy to miejsce jest wolne?” = Is this seat free?",
}

CTX_EN = {
'u01': "Hi! How are you?|Fine, thanks. And you?|Also fine.|Sorry, I have to go. See you soon!|Bye! Have a nice day!",
'u02': "Hi! I'm Ola. And you? What's your name?|My name is Diego. Nice to meet you.|Likewise. Where are you from?|I'm from Costa Rica. I'm learning Polish.|Great! You speak very well.|Thanks, but I only speak a little Polish.",
'u03': "Do you have time tomorrow?|Sorry, I don't understand. Speak more slowly, please.|Do… you… have… time… tomorrow?|Ahh, I understand! Yes, I have time. What does “kawiarnia” mean?|It's a place where we drink coffee.|Sure! Then let's go to the café!",
'u04': "Two beers and one coffee, please.|That costs twenty-five zlotys.|I'm thirty-one years old.|Room number one hundred twelve.",
'u05': "Excuse me, where is the station?|Over there, next to the bank.|When is the train to Kraków?|At ten o'clock.|Why so late?|I don't know!",
'u06': "This is my phone, and that one is yours.|I like coffee, and you?|She is from Poland too.|I'm going to the shop because I have no bread.|Is everything OK?",
'u07': "What are you doing?|I'm studying Polish. And you?|Nothing. Do you want to go for a coffee?|I want to, but I can't. I have to work.|Too bad! Maybe tomorrow, then?|OK, tomorrow!",
'u08': "Today is Monday.|on Monday, on Tuesday, on Wednesday|I have time on Saturday.|My birthday is in May.|See you on Friday!",
'u09': "What time is it?|It's eight.|Already? What time is the meeting?|At nine.|Phew! I'm not late.",
'u10': "For breakfast I eat bread with butter and an egg.|Do you like pierogi?|I'm hungry. Let's go for lunch!|I'm thirsty. Do you have water?",
'u11': "Good morning. What can I get you?|A coffee with milk and a cheesecake (sernik), please.|Eat in or take away?|Eat in.|It was delicious! The bill, please.|Here you are.",
'u12': "Good morning, may I help you?|Good morning. A loaf of bread and two rolls, please.|Anything else?|No, thank you. That's all. How much do I owe?|Twelve zlotys. Receipt?|No, thank you. Goodbye!",
'u13': "Excuse me, how do I get to the station?|Straight ahead, then left.|Is it far?|No, it's close. Five minutes.|Thank you very much!",
'u14': "Where is the bathroom?|What's the Wi-Fi password?|I live in a small apartment in the centre.|The key is on the table.|Close the door, please.",
'u15': "This is my family.|I have a brother and a sister.|My brother lives in Warsaw.|No, I don't have children.",
'u16': "This coffee is very good!|Polish is difficult, but beautiful.|I'm tired.|My car is red.|This is too expensive.",
'u17': "I feel unwell. My head hurts.|Where is the pharmacy?|Please call an ambulance!|I'm fine, thank you.",
}
SPK = {'Tú': ('Tú', 'You'), 'Señor': ('Señor', 'Man'), 'Señora': ('Señora', 'Woman'),
       'Mesero': ('Mesero', 'Waiter'), 'Vendedora': ('Vendedora', 'Shop assistant'), 'Ola': ('Ola', 'Ola')}

# ---------------------------------------------------------------- pictures
# one token per entry: emoji | '-' (no picture, word tile) | '#' numeral tile | dN weekday tile | mN month tile
PIC = {}
PIC['u01'] = "🌞 🌆 😀 🙋 🚪 🤙 👋 👀 🌅 🌙 🎁 🙋 🙏 👍 💐 😉 😔 ✅ ❌ 👌 💬 📰 🍽️ 🥂 🌻 🎉"
PIC['u02'] = "📛 🏷️ 🧍 👩 🪪 🤝 😊 🤗 🌍 🇨🇷 🌴 🏘️ 🇪🇸 🇵🇱 📚 🎈 #30 💼 👨‍💻 🗄️"
PIC['u03'] = "🤷 💡 🤔 👂 🔁 🐢 ❓ 💬 ✏️ 🇬🇧 ✋ 🤲 ⏳ 😎 ✔️ 😮 🙌 💯 🙆 😌 🆗"
PIC['u04'] = "# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 🌗 🥇"
PIC['u05'] = "❓ 🧑 📍 🕒 🛠️ 🤨 🔢 👆 🧭 🗺️ ❔ 📦 👤 🔍 ⏲️ 🏃 ⁉️ 🙅"
PIC['u06'] = "🙋 👉 👫 👥 👬 👯 🤵 🎩 - - 👉 🔗 - - 🔀 - - - 💪 🤏 📈 📉 🌐 🕳️ 🧩 🕵️ 🌦️ 💭 🔒 - 🚫 🎀 📥 🔼 🎯"
PIC['u07'] = "🌱 🎒 🤩 💪 ⚠️ 😍 🧠 📇 🎓 🗣️ 🚶 🚙 🥄 🥤 🔨 💼 🏡 🛍️ 💸 🔎 🥺 ⌛ 👁️ 🎧 😴 📖 📞 ❤️"
PIC['u08'] = "d1 d2 d3 d4 d5 d6 d7 🏖️ 🔆 🌄 ⏪ ☀️ 🗓️ 🌕 🎆 🎂 m1 m2 m3 m4 m5 m6 m7 m8 m9 m10 m11 m12"
PIC['u09'] = "🕐 ⏱️ 🕰️ ⌚ ⏰ 🕗 🔴 🌅 🌤️ 🌇 🌃 🐓 🦉 ⏭️ ☑️ 🔃 ♾️ 📊 🎲 ⛔ 📅 🕒"
PIC['u10'] = "💧 🍾 ☕ 🍵 🥛 🧃 🍺 🍷 🍞 🥯 🧈 🧀 🥚 🥩 🍗 🐖 🐄 🐟 🍚 🍝 🥔 🍲 🥗 🥦 🍓 🍎 🍅 🍬 🧂 🌶️ 🥞 🍛 🥘 🥟 🤤 🚰 🥬"
PIC['u11'] = "🍴 🥐 🛎️ 🕯️ 📋 💁 👈 ☕ 🍻 🥛 - 🥡 🥡 🔥 😋 👏 📝 💝 🚻"
PIC['u12'] = "🏪 🛒 🥖 💊 🏧 💰 💴 🪙 💲 🧮 👇 👓 🧐 🫙 ➕ 🏁 💳 💵 🧾 👜 🔓 🔖 😱"
PIC['u13'] = "🥾 🛣️ ⬆️ ⬅️ ➡️ 📌 🔭 🧲 🌌 ↔️ 🪞 ⤵️ 🛤️ 🏙️ 🚏 🚉 ✈️ 🚌 🚋 🚆 🚕 🚗 🎫 🎟️ 🔽 😵"
PIC['u14'] = "🏠 🏢 🛋️ 🍳 🛁 🛌 🛏️ - 🪑 🚪 🪟 🔑 📱 💻 🔌 📶 🧊 💡 🧖 🧼 👕 🗑️ 💼 🏘️"
PIC['u15'] = "👨‍👩‍👧‍👦 👩 👨 👫 👦 👧 🧒 👧 👶 🤵 👰 💑 👱‍♀️ 🤗 🙋 👴 🧔 👩 👥 👦 👧 👶 💕"
PIC['u16'] = "👍 👎 🐘 🐭 ✨ 🕰️ 🌷 🌈 💎 🏷️ 🔥 🥶 ☀️ 🍰 🧗 🐇 🐌 🥱 😄 ⚪ ⚫ 🔴 🔵 🟢 🟡 🌫️ 🎀 🟤 🟠"
PIC['u17'] = "🆘 ⚠️ 🚨 🚑 🩺 👨‍⚕️ 🏥 👮 🤒 🤕 🤢 🌡️ 🤧 📵 🙂"

def tw_file(ch):
    cps = [f'{ord(c):x}' for c in ch]
    for cand in ('-'.join(cps), '-'.join(c for c in cps if c != 'fe0f')):
        if os.path.exists(TW + cand + '.svg'):
            return cand
    return None

def speak_text(pl):
    t = re.sub(r'\([^)]*\)', ' ', pl)
    t = t.replace('…', '...').replace(' / ', ', ').replace('/', ', ')
    t = t.replace('Wi-Fi', 'wifi')
    return re.sub(r'\s+', ' ', t).strip()

words, jobs, uout = [], [], []
n = 0; missing = []
for ui, u in enumerate(units):
    uid = u['id']
    en = EN[uid].split('|'); pics = PIC[uid].split()
    assert len(en) == len(u['items']), (uid, len(en), len(u['items']))
    assert len(pics) == len(u['items']), (uid, 'pics', len(pics), len(u['items']))
    ctxen = CTX_EN[uid].split('|')
    assert len(ctxen) == len(u.get('ctx', [])), (uid, 'ctx')
    for k, it in enumerate(u['items']):
        p = pics[k]; pic = None
        if p == '-': pic = None
        elif p.startswith('#') and len(p) > 1: pic = p
        elif p == '#':
            pic = '#' + re.match(r'\s*([\d]+)', it['es']).group(1) if re.match(r'\s*\d', it['es']) else None
        elif re.fullmatch(r'[dm]\d+', p): pic = p
        else:
            f = tw_file(p)
            if f: pic = f; shutil.copy(TW + f + '.svg', f'{OUT}/e/{f}.svg')
            else: missing.append((n, p))
        w = {'i': n, 'u': ui, 'pl': it['pl'], 'ipa': it['ipa'], 'es': it['es'], 'en': en[k], 'p': pic, 'a': f'w{n:03d}'}
        if it.get('n'):
            w['ne'] = it['n']; w['nn'] = NOTE_EN[n]
        words.append(w)
        jobs.append((f'w{n:03d}', speak_text(it['pl'])))
        n += 1
    ctx = []
    for j, c in enumerate(u.get('ctx', [])):
        s = SPK.get(c.get('w', ''), ('', ''))
        ctx.append({'w': s[0], 'we': s[1], 'pl': c['pl'], 'es': c['es'], 'en': ctxen[j], 'a': f'c{ui:02d}{j}'})
        jobs.append((f'c{ui:02d}{j}', speak_text(c['pl'])))
    uout.append({'id': uid, 'es': u['es'], 'pl': u['pl'], 'en': EN_UNIT[ui], 'ic': tw_file(ICON[ui]) or '', 'wk': u.get('wk', 1), 'ctx': ctx})
    if tw_file(ICON[ui]): shutil.copy(TW + tw_file(ICON[ui]) + '.svg', f'{OUT}/e/{tw_file(ICON[ui])}.svg')
assert n == 428, n

# ---------------------------------------------------------------- situations
import importlib.util
_sp = importlib.util.spec_from_file_location('g2p', SRC + 'g2p_check.py')
g2p = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(g2p)
OVR = {'aaron': 'ˈaarɔn'}
LIQ = ('r', 'l', 'j', 'w')
def ipa_word(wd, idx, ws):
    lw = wd.lower()
    if lw in OVR: return OVR[lw]
    ph = g2p.nasal(g2p.parse(wd))
    if lw in ('w', 'z') and idx + 1 < len(ws):
        nxt = g2p.nasal(g2p.parse(ws[idx + 1])); first = nxt[0]['s'] if nxt else None
        ph = g2p.voicing(ph, next_voice=(False if first in g2p.VOICE else True))
    else:
        ph = g2p.voicing(ph)
    nu = g2p.nuclei(ph); mark = None
    if len(nu) >= 2:
        st = len(nu) - 2
        if re.search(r'(liśmy|łyśmy|liście|łyście)$', lw) and len(nu) >= 3: st = len(nu) - 3
        k = nu[st]; j = k; V_ = g2p.VOWELS; FR = ('s', 'z', 'ʂ', 'ʐ', 'ɕ', 'ʑ', 'f', 'v', 'x')
        if j - 1 >= 0 and ph[j - 1]['s'] not in V_:
            j -= 1
            if j - 1 >= 0 and ph[j - 1]['s'] not in V_ and ph[j]['s'] in LIQ and ph[j - 1]['s'] in g2p.OBS: j -= 1
            elif j - 1 >= 0 and ph[j - 1]['s'] in FR and ph[j]['s'] not in FR: j -= 1
        if all(ph[q]['s'] not in V_ for q in range(j)): j = 0
        mark = j
    out = ''
    for q, p in enumerate(ph):
        if q == mark: out += 'ˈ'
        out += p['s'] + ('ʲ' if p['pal'] else '')
    return out
def ipa_phrase(pl):
    text = re.sub(r'\([^)]*\)', ' ', pl); text = re.sub(r'[?!.,…„”"«»:;]', ' ', text)
    ws = [t for t in re.split(r'\s+|/', text) if t.strip()]
    return ' '.join(ipa_word(wd, i, ws) for i, wd in enumerate(ws))

sit_src = open(ROOT + '/tools/sit.txt', encoding='utf-8').read().splitlines()
cur = None; sit_units = []
for ln in sit_src:
    if not ln.strip() or ln.startswith('#') and not ln.startswith('##'): continue
    if ln.startswith('##'):
        f = [x.strip() for x in ln[2:].split('|')]
        cur = {'key': f[0], 'es': f[1], 'en': f[2], 'pl': f[3], 'icon': f[4], 'ds': f[5], 'dn': f[6], 'items': [], 'ctx': []}
        sit_units.append(cur); continue
    if ln.startswith('>'):
        f = [x.strip() for x in ln[1:].split('|')]
        sp = f[0].split(':'); cur['ctx'].append({'w': sp[0], 'we': sp[1], 'pl': f[1], 'es': f[2], 'en': f[3]}); continue
    f = [x.strip() for x in ln.split('|')]
    f += [''] * (7 - len(f)); cur['items'].append(f[:7])
sit_missing = []
for su in sit_units:
    ui = len(uout); ic = tw_file(su['icon'])
    if ic: shutil.copy(TW + ic + '.svg', f'{OUT}/e/{ic}.svg')
    else: sit_missing.append(('unit', su['icon']))
    for it in su['items']:
        pl, es_, en_, em, reg, ne, nn = it
        f = tw_file(em) if em else None
        if em and not f: sit_missing.append((pl, em))
        if f: shutil.copy(TW + f + '.svg', f'{OUT}/e/{f}.svg')
        w = {'i': n, 'u': ui, 'pl': pl, 'ipa': ipa_phrase(pl), 'es': es_, 'en': en_, 'p': f, 'a': f'w{n:03d}'}
        if reg: w['r'] = reg
        if ne: w['ne'] = ne; w['nn'] = nn or ne
        words.append(w); jobs.append((f'w{n:03d}', speak_text(pl))); n += 1
    ctx = []
    for j, c in enumerate(su['ctx']):
        ctx.append({'w': c['w'], 'we': c['we'], 'pl': c['pl'], 'es': c['es'], 'en': c['en'], 'a': f'c{ui:02d}{j}'})
        jobs.append((f'c{ui:02d}{j}', speak_text(c['pl'])))
    uout.append({'id': su['key'], 'es': su['es'], 'pl': su['pl'], 'en': su['en'], 'ic': ic or '', 'wk': 0, 'sit': 1, 'ds': su['ds'], 'dn': su['dn'], 'ctx': ctx})
print('situations', len(sit_units), 'entries', n - 428, 'missing emoji', sit_missing)

shutil.copy(TW + '1f469-200d-1f3eb.svg', OUT + '/e/1f469-200d-1f3eb.svg')  # teacher unit icon
print('words', n, 'jobs', len(jobs), 'missing emoji', missing)
# the "Pa pa" rule etc. need no extra data
# the app is Spanish (student) + Polish (teacher): English glosses, notes and names stay in this script only
DROP = ('en', 'nn', 'we', 'dn')
def strip(o):
    if isinstance(o, list): return [strip(x) for x in o]
    if isinstance(o, dict): return {k: strip(v) for k, v in o.items() if k not in DROP}
    return o
uout, words = strip(uout), strip(words)
open(OUT + '/data.js', 'w', encoding='utf-8').write(
    'window.UNITS=' + json.dumps(uout, ensure_ascii=False, separators=(',', ':')) +
    ';\nwindow.WORDS=' + json.dumps(words, ensure_ascii=False, separators=(',', ':')) + ';\n')

# re-record any line whose text changed since the last run (make() skips files that already exist)
try: _old = json.load(open(OUT + '/audio.json', encoding='utf-8'))
except Exception: _old = {}
for _n, _t in jobs:
    if _old.get(_n) not in (None, _t) and os.path.exists(f'{OUT}/a/{_n}.mp3'): os.remove(f'{OUT}/a/{_n}.mp3')
json.dump(dict(jobs), open(OUT + '/audio.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)

def make(job):
    name, text = job
    mp3 = f'{OUT}/a/{name}.mp3'
    if os.path.exists(mp3): return
    wav = f'/tmp/pb_{name}.wav'
    subprocess.run(['espeak-ng', '-v', 'pl+f3', '-s', '138', '-p', '55', '-a', '170', '-g', '3', '-w', wav, text], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '22050', '-af',
                    'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-18:TP=-2,adelay=60',
                    '-c:a', 'libmp3lame', '-b:a', '32k', mp3], check=True)
    os.remove(wav)

if '--no-audio' not in sys.argv:
    with ThreadPoolExecutor(8) as ex: list(ex.map(make, jobs))
    print('audio files', len(os.listdir(OUT + '/a')))
