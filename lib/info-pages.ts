export type InfoBlock = {
  title?: string;
  eyebrow?: string;
  body?: string[];
  bullets?: string[];
  variant?: "callout" | "note";
  actions?: { label: string; href: string; tone?: "primary" | "secondary" }[];
};

export type InfoPageContent = {
  slug: string;
  title: string;
  intro?: string;
  form?: "withdrawal" | "contact";
  blocks: InfoBlock[];
};

export const infoPages: InfoPageContent[] = [
  {
    slug: "doprava",
    title: "Doprava a platba",
    blocks: [
      {
        title: "Dostupné možnosti",
        body: [
          "Aktuálně dostupné způsoby doručení, země a ceny se zobrazují přímo v pokladně před odesláním objednávky. Zákazník tak vždy vidí celkovou cenu objednávky včetně dopravy ještě před potvrzením nákupu."
        ],
        bullets: [
          "Packeta / Zásilkovna - výdejní místo, pokud je dostupné pro vybranou zemi.",
          "Packeta - doručení na adresu, pokud je dostupné pro vybranou zemi.",
          "Digitální dárkové poukazy se doručují e-mailem a nemají dopravní náklady."
        ]
      },
      {
        title: "Doprava zdarma",
        body: [
          "Pokud je pro objednávku dostupná doprava zdarma, pokladna ji zobrazí automaticky podle aktuální hodnoty objednávky a nastavené dopravní zóny."
        ]
      },
      {
        title: "Čekací doba",
        bullets: [
          "Produkty skladem: odesíláme zpravidla do 5 pracovních dnů.",
          "Produkty na objednávku: doba výroby je uvedena u konkrétního produktu, obvykle 1-4 týdny podle typu produktu."
        ],
        body: ["Pokud potřebujete produkt na konkrétní termín, kontaktujte nás před vytvořením objednávky přes kontaktní stránku."]
      },
      {
        title: "Poškození nebo nedoručení",
        body: [
          "Prodávající odpovídá za zboží během přepravy až do jeho převzetí zákazníkem. Pokud zásilka dorazí poškozená nebo se nedoručí v dohodnutém čase, napište nám na narastore.help@gmail.com."
        ]
      },
      {
        title: "Způsoby platby",
        body: ["Objednávku můžete zaplatit těmito způsoby:"],
        bullets: [
          "Bankovním převodem přes QR kód - po odeslání objednávky obdržíte QR kód i údaje k převodu. Objednávku připravujeme po připsání platby.",
          "Platebním tlačítkem banky - převod potvrdíte přímo ve svém internetovém bankovnictví, bez přepisování údajů.",
          "Platební kartou - Visa, Visa Electron, Mastercard a Maestro, včetně Apple Pay a Google Pay."
        ]
      },
      {
        body: [
          "Online platby pro nás zajišťuje platební brána Comgate. Poskytovatel služby, společnost Comgate, a.s., je licencovaná platební instituce působící pod dohledem České národní banky. Platby probíhající přes platební bránu jsou plně zabezpečené a všechny informace jsou šifrované - údaje o vaší kartě se k nám nikdy nedostanou."
        ]
      },
      {
        title: "Jak probíhá platba kartou",
        body: [
          "Po odeslání objednávky vás přesměrujeme na platební bránu Comgate, kde zadáte údaje karty a potvrdíte platbu v aplikaci své banky (3D Secure). O výsledku se dozvíte okamžitě a hned po schválení začínáme objednávku připravovat.",
          "Pokud je vaše karta vedena v jiné měně, než ve které platíte, přepočet zajistí vaše banka podle svého kurzu."
        ]
      },
      {
        title: "Jak probíhá platba bankovním tlačítkem",
        body: [
          "Na platební bráně si vyberete svou banku a přesměrujeme vás do internetového bankovnictví, kde už máte platební příkaz předvyplněný - částku ani variabilní symbol nemusíte přepisovat a nelze je omylem změnit. Platbu potvrdíte obvyklým způsobem, nejčastěji v mobilní aplikaci.",
          "U okamžitých plateb a plateb přes mobilní aplikaci máme potvrzení hned; u běžného online převodu zpravidla do jednoho pracovního dne."
        ]
      },
      {
        title: "Reklamace a otázky k platbám",
        body: [
          "S otázkami k objednávce se obraťte na nás. Pokud potřebujete řešit samotnou platbu nebo její reklamaci, kontaktujte provozovatele platební brány:",
          "Comgate, a.s.",
          "Gočárova třída 1754/48b, Hradec Králové",
          "E-mail: podpora@comgate.cz",
          "Telefon: +420 228 224 267"
        ]
      }
    ]
  },
  {
    slug: "vraceni",
    title: "Vrácení zboží",
    blocks: [
      {
        variant: "callout",
        eyebrow: "S účtem",
        title: "Vrácení bez tisku štítku",
        body: [
          "Přihlášeným zákazníkům to ulehčíme. V účtu u objednávky vyplníte krátký formulář odstoupení od smlouvy a hned potom si vyžádáte kód - přijdete s balíčkem na kterékoli podací místo Packety a štítek vytisknou za vás. Nic netisknete, nic nelepíte a zpětné poštovné platíme my.",
          "Bez účtu je vrácení na vás: zásilku posíláte sami a na vlastní náklady."
        ],
        actions: [
          { label: "Založit účet", href: "/register", tone: "primary" },
          { label: "Mám účet, přihlásit se", href: "/account", tone: "secondary" }
        ]
      },
      {
        title: "Odstoupení do 14 dnů",
        body: [
          "Při nákupu online má spotřebitel právo odstoupit od smlouvy bez uvedení důvodu do 14 dnů od převzetí zboží. Zboží prosím vraťte nepoužité, nepoškozené a přiměřeně zabalené.",
          "Podrobné poučení a vzorový formulář najdete na stránce Odstoupení od smlouvy."
        ]
      },
      {
        title: "Náklady při vrácení",
        body: [
          "Přihlášeným zákazníkům hradíme zpětné zaslání my - kód na vrácení najdete v účtu u objednávky.",
          "Bez účtu hradí zpětné zaslání při běžném odstoupení do 14 dnů zákazník.",
          "Vrátíme cenu zboží a nejlevnější standardní původní doručení, pokud bylo účtováno.",
          "Příplatek za dražší způsob původního doručení se nevrací.",
          "Při oprávněné reklamaci nebo chybném zboží hradíme zpětné zaslání my."
        ]
      },
      {
        title: "Výjimky",
        body: [
          "Zboží zhotovené podle osobních požadavků zákazníka, vyrobené na míru nebo jasně personalizované zboží nemusí být možné vrátit odstoupením od smlouvy. Pokud je však zboží chybné, řeší se reklamací."
        ]
      },
      {
        title: "Reklamace",
        body: [
          "Pokud jste dostali poškozený nebo chybný produkt, napište nám co nejdříve na narastore.help@gmail.com. Do zprávy prosím uveďte číslo objednávky, popis problému a přiložte fotografie."
        ]
      }
    ]
  },
  {
    slug: "odstoupeni",
    title: "Odstoupení od smlouvy",
    form: "withdrawal",
    blocks: [
      {
        title: "Poučení",
        body: [
          "Při nákupu na dálku máte jako spotřebitel právo odstoupit od smlouvy bez uvedení důvodu do 14 dnů od převzetí zboží. Pokud byla objednávka dodána po částech, lhůta běží od převzetí poslední části. Pokud jsme vás o právu na odstoupení nepoučili, lhůta se prodlužuje až o 12 měsíců.",
          "Nejjednodušeji odstoupíte vyplněním formuláře níže - po odeslání vám bez zbytečného odkladu potvrdíme přijetí e-mailem s datem a časem. Odstoupit můžete také e-mailem na narastore.help@gmail.com nebo poštou na adresu provozovatele. Stačí jakékoli jednoznačné prohlášení, ze kterého je zřejmé, že odstupujete od smlouvy."
        ]
      },
      {
        title: "Náklady a vrácení peněz",
        body: [
          "Cenu zboží vám vrátíme nejpozději do 14 dnů od doručení odstoupení, stejným způsobem platby.",
          "Vrátíme také náklady na doručení ve výši nejlevnějšího standardního způsobu, který nabízíme.",
          "Pokud jste si zvolili dražší způsob doručení, rozdíl oproti nejlevnější standardní dopravě se nevrací.",
          "Zpětné zaslání zboží při běžném odstoupení do 14 dnů hradí zákazník.",
          "Vrácení platby můžeme zadržet, dokud nedostaneme zboží zpět, nebo dokud neprokážete jeho odeslání.",
          "Při oprávněné reklamaci hradíme zpětné zaslání my - ve výši nejlevnějšího běžného způsobu doručení."
        ]
      },
      {
        title: "Stav zboží",
        body: [
          "Zboží můžete vyzkoušet tak, jako byste to udělali v kamenné prodejně. Pokud však bude zboží opotřebované nad rámec běžného vyzkoušení, můžeme vrácenou částku snížit o odpovídající snížení jeho hodnoty."
        ]
      },
      {
        title: "Výjimky",
        body: [
          "Právo na odstoupení se nevztahuje zejména na zboží zhotovené podle osobních požadavků zákazníka, vyrobené na míru nebo jasně personalizované zboží. Pokud si nejste jistí, napište nám před odesláním objednávky."
        ]
      },
      {
        title: "Formulář na odstoupení od smlouvy",
        body: [
          "Vyplňte formulář a odešlete ho - je to stejné jako vzorový tiskopis, jen rovnou online."
        ]
      }
    ]
  },
  {
    slug: "starostlivost",
    title: "Péče",
    intro:
      "Při výrobě většiny našich produktů používáme kůži. Kůže je přírodní materiál a každý kus může mít na sobě malé odlišnosti, například jinou velikost struktury, proto nemůžeme zaručit 100% shodu s přiloženými fotografiemi. V případě, že by při výrobě vaší kabelky, batohu nebo jiného doplňku měla vzniknout větší odlišnost, nejdříve ji s vámi probereme a následně si změnu odsouhlasíme. Kůže je přírodní materiál a časem se bude měnit, stárnout do krásy. Věříme, že budete postupné změny na kůži vnímat jako její přidanou hodnotu.",
    blocks: [
      {
        title: "1. Péče o kůži",
        body: [
          "Při výběru toho správného produktu je důležité, abyste mysleli na to, kde a jak plánujete produkt využívat. Některé materiály jsou náchylnější k zašpinění, proto je vhodné, abyste s takovými produkty zacházeli šetrněji. O každý kožený produkt byste se měli pravidelně starat. Použitím správných ošetřujících přípravků a pomůcek prodloužíte životnost produktu."
        ]
      },
      {
        title: "Hladká kůže",
        bullets: [
          "Při znečištění používejte hadřík navlhčený ve vodě nebo v mýdlovém roztoku, nesmí být úplně mokrý.",
          "Pravidelně kůži ošetřujte šetrným voskem, například včelím voskem.",
          "U světlých odstínů kůže se vyžaduje častější ošetřování a šetrnější zacházení."
        ]
      },
      {
        title: "Jemná broušená / voskovaná kůže",
        bullets: [
          "Vyžaduje častější ošetřování a šetrnější zacházení.",
          "Je náchylnější ke změnám odstínu, časem chytá přirozenou patinu a mohou vznikat skvrny po tekutinách, proto nedoporučujeme produkt vystavovat dešti.",
          "Čistí se pomocí gumy na kůži nebo jemným voskem - naneste malé množství vosku, nechte dostatečně dlouho vyschnout a následně kůži vyleštěte bavlněným hadříkem.",
          "Upozornění: kůže po tomto procesu může změnit svůj odstín."
        ]
      },
      {
        title: "Broušená kůže",
        bullets: [
          "Vyžaduje častější ošetřování a šetrnější zacházení.",
          "Kůže je náchylnější ke změnám odstínu, časem chytá přirozenou patinu a mohou vznikat skvrny po tekutinách, proto nedoporučujeme produkt vystavovat dešti.",
          "Při znečištění používejte měkký kartáček, kterým produkt vyčistíte, a následně na velmi znečištěná místa použijte gumu na kůži."
        ]
      },
      {
        body: [
          "Pokud si nejste jistí, jaký produkt na ošetření kůže máte použít, kontaktujte nás a budeme se vám snažit poradit."
        ]
      },
      {
        variant: "note",
        body: [
          "Naše doporučení: Pravidelně se o produkt starejte · nepřetěžujte kabelku nebo batoh · pokud produkt déle nenosíte, vyplňte ho měkkým materiálem, aby držel tvar, a vložte do ochranného obalu."
        ]
      },
      {
        title: "2. Péče o oblečení"
      },
      {
        title: "Mušelínová bavlněná látka",
        bullets: [
          "Perte na 30 stupňů Celsia.",
          "Používejte šetrné prací prostředky.",
          "Stačí zavěsit na věšák a nechat usušit.",
          "Produkty z mušelínu nedoporučujeme žehlit - pokud jsou příliš pomačkané, ideální je využít pouze páru ze žehličky nebo nízkou teplotu."
        ]
      },
      {
        title: "Organická bavlna",
        bullets: [
          "Perte na 30 stupňů Celsia.",
          "Používejte šetrné prací prostředky.",
          "Může se žehlit."
        ]
      },
      {
        title: "Len",
        bullets: [
          "Perte na 30-40 stupňů Celsia.",
          "Nastavte otáčky na 600, aby se nepolámala vlákna látky.",
          "Používejte šetrné prací prostředky.",
          "Může se žehlit."
        ]
      },
      {
        title: "Ecovero",
        bullets: [
          "Perte na 30-40 stupňů Celsia.",
          "Nesušte v sušičce.",
          "Maximální teplota žehličky je 100 stupňů Celsia."
        ]
      }
    ]
  },
  {
    slug: "obchodni-podminky",
    title: "Obchodní podmínky",
    blocks: [
      {
        title: "Prodávající",
        body: [
          "LSHK lab s. r. o.",
          "Ratibořská 751/32, Bohnice, Praha 8, Česká republika",
          "IČO: 55602088",
          "DIČ: 2122056816",
          "Telefon: +420 736 924 533",
          "Prodávající provozuje internetový obchod pod značkou NaRa. Prodávající není plátcem DPH.",
          "Dozorovým orgánem je Slovenská obchodní inspekce, Inspektorát SOI pro Žilinský kraj, Predmestská 71, P. O. Box B-89, 011 79 Žilina 1 (soi.sk)."
        ]
      },
      {
        title: "Základní pravidla nákupu",
        bullets: [
          "Objednávka se vytváří odesláním platebního formuláře na webové stránce.",
          "Odesláním objednávky zákazníkovi vzniká povinnost zaplatit cenu objednávky.",
          "Ceny v e-shopu jsou pro spotřebitele konečné a cena dopravy se zobrazí před odesláním objednávky.",
          "Platba probíhá platební kartou přes platební bránu Comgate nebo bankovním převodem podle pokynů v potvrzení objednávky.",
          "Potvrzení objednávky obdrží zákazník e-mailem na adresu uvedenou v objednávce."
        ]
      },
      {
        title: "1. Úvodní ustanovení",
        body: [
          "Tyto obchodní podmínky upravují práva a povinnosti prodávajícího a kupujícího při nákupu zboží prostřednictvím internetového obchodu NaRa.",
          "Kupujícím je fyzická nebo právnická osoba, která vytvoří objednávku prostřednictvím internetového obchodu. Spotřebitelem je fyzická osoba, která při uzavírání smlouvy nejedná v rámci své podnikatelské činnosti nebo povolání.",
          "Právní vztahy se spotřebiteli se řídí zejména občanským zákoníkem, zákonem o ochraně spotřebitele a příslušnými předpisy Evropské unie. Při nákupu podnikatelem se použijí příslušná pravidla obchodního práva."
        ]
      },
      {
        title: "2. Zboží a dostupnost",
        body: [
          "Produkty NaRa jsou ručně vyráběné kožené kabelky, doplňky a související módní zboží. U každého produktu je uvedena cena, dostupnost a jeho hlavní vlastnosti.",
          "Vzhledem k ruční výrobě a používání přírodních materiálů se mohou barva, struktura a rozměry mírně lišit. Tyto odlišnosti se nepovažují za vadu, pokud nemění podstatné vlastnosti produktu.",
          "Pokud je produkt vyráběn na objednávku, obvyklá doba výroby je uvedena u produktu nebo v informacích o dopravě. Pokud by se výroba měla výrazně prodloužit, prodávající o tom zákazníka informuje."
        ]
      },
      {
        title: "3. Cena, objednávka a platba",
        body: [
          "Zákazník vytvoří objednávku tak, že vloží zboží do košíku, vyplní kontaktní a doručovací údaje, zvolí dopravu a odešle objednávku tlačítkem s označením povinnosti platby.",
          "Před odesláním objednávky zákazník vidí celkovou cenu včetně dopravy, případných slev nebo dárkových poukazů.",
          "Platbu je možné provést platební kartou nebo bankovním tlačítkem přes platební bránu Comgate, případně bankovním převodem. Platební údaje a QR kód se zobrazí po odeslání objednávky a budou zaslány také v potvrzení objednávky. Pokud platba neproběhne do 3 dnů od odeslání objednávky, může prodávající objednávku zrušit a rezervované zboží uvolnit.",
          "Prodávající zpravidla zahájí výrobu nebo expedici po přijetí platby, pokud se se zákazníkem nedohodne jinak.",
          "Zákazník souhlasí s vystavením a doručením faktury nebo daňového dokladu v elektronické podobě."
        ]
      },
      {
        title: "4. Doručení",
        body: [
          "Dostupné způsoby doručení, cena doručení a země doručení jsou uvedeny v pokladně před odesláním objednávky. Přehled informací je dostupný také na stránce Doprava a platba.",
          "Zboží skladem prodávající obvykle odesílá do 5 pracovních dnů. U produktů vyráběných na objednávku se doba dodání prodlužuje o dobu výroby uvedenou u konkrétního produktu.",
          "Pokud se strany nedohodnou jinak, prodávající dodá zboží nejpozději do 30 dnů od uzavření smlouvy nebo od přijetí platby, podle povahy objednávky a dohodnutých podmínek.",
          "Při prodeji zboží spotřebiteli nese prodávající riziko poškození zboží až do jeho převzetí spotřebitelem nebo jím určenou osobou. Při prodeji podnikateli přechází riziko poškození předáním zboží prvnímu dopravci."
        ]
      },
      {
        title: "5. Odstoupení od smlouvy do 14 dnů",
        body: [
          "Při nákupu na dálku má spotřebitel právo odstoupit od smlouvy bez uvedení důvodu do 14 dnů od převzetí zboží. Pokud bylo několik kusů zboží dodáno samostatně, lhůta běží od převzetí posledního kusu. Pokud prodávající spotřebitele o právu na odstoupení nepoučil, lhůta se prodlužuje až o 12 měsíců.",
          "Odstoupení je možné zaslat e-mailem na narastore.help@gmail.com nebo poštou na adresu prodávajícího. Zákazník může použít vzorový formulář, není to však povinné.",
          "Zboží musí být zasláno zpět do 14 dnů od oznámení odstoupení, vhodně zabalené tak, aby se při přepravě nepoškodilo. Spotřebitel smí se zbožím zacházet pouze v rozsahu potřebném ke zjištění jeho povahy, vlastností a funkčnosti, tedy podobně jako v kamenné prodejně. Pokud je zboží opotřebené nad tento rozsah, odpovídá spotřebitel prodávajícímu za snížení hodnoty zboží a prodávající může vrácenou platbu odpovídajícím způsobem snížit.",
          "Při odstoupení od smlouvy hradí zákazník náklady na vrácení zboží. Prodávající vrátí cenu zboží a nejlevnější standardní původní doručení, pokud bylo účtováno. Pokud zákazník zvolil dražší způsob doručení, rozdíl oproti nejlevnějšímu standardnímu doručení se nevrací. Prodávající může dobrovolně převzít náklady na zpětné zaslání, zejména v rámci věrnostního programu; nejde však o nárok zákazníka, ale o obchodní vstřícnost.",
          "Platba bude vrácena nejpozději do 14 dnů od doručení oznámení o odstoupení. Prodávající může vrácení platby odložit, dokud neobdrží zboží zpět nebo dokud kupující neprokáže jeho odeslání.",
          "Právo na odstoupení se nevztahuje zejména na zboží vyrobené podle konkrétních požadavků spotřebitele, zboží vyrobené na míru nebo jasně personalizované zboží, například monogram, iniciály, nenabízený rozměr nebo individuálně dohodnutá barva kůže či kovových prvků. Výroba po objednávce sama o sobě neznamená personalizaci, pokud spotřebitel nepožadoval konkrétní úpravu."
        ]
      },
      {
        title: "6. Reklamace a odpovědnost za vady",
        body: [
          "Prodávající odpovídá za vady, které měla věc při převzetí a které se projeví do dvou let od převzetí. Pokud se vada projeví do jednoho roku od převzetí, má se za to, že věc byla vadná již při převzetí, pokud to povaha věci nebo vady nevylučuje. Spotřebitel může požadovat zejména opravu nebo výměnu; pokud oprava nebo výměna není možná nebo přiměřená, prodávající vadu neodstranil v přiměřené době nebo jde o podstatnou vadu, může spotřebitel požadovat přiměřenou slevu nebo odstoupit od smlouvy. Pokud by zvolený způsob byl nepřiměřeně nákladný, může prodávající zvolit opravu místo výměny nebo naopak.",
          "Reklamaci je možné zaslat e-mailem na narastore.help@gmail.com. Doporučujeme přiložit číslo objednávky, popis vady a fotografie.",
          "V případě oprávněné reklamace prodávající uhradí účelně vynaložené náklady na zaslání zboží zpět, a to ve výši nejlevnějšího běžného způsobu doručení. V případě neoprávněné reklamace hradí tyto náklady zákazník.",
          "Za vadu se nepovažuje běžné opotřebení, mechanické poškození způsobené zákazníkem, nevhodné používání, nedostatečná péče ani přirozené změny kůže a jiných přírodních materiálů.",
          "Reklamace bude vyřízena nejpozději do 30 dnů, pokud se se zákazníkem nedohodneme jinak."
        ]
      },
      {
        title: "7. Dárkové poukazy",
        body: [
          "Dárkový poukaz je digitální produkt v hodnotě uvedené při nákupu. Po zaplacení obdrží zákazník nebo obdarovaná osoba kód poukazu e-mailem.",
          "Poukaz je možné použít v internetovém obchodě NaRa na nákup zboží až do výše jeho zůstatku. Nevyčerpaný zůstatek zůstává platný do skončení platnosti poukazu."
        ]
      },
      {
        title: "8. Ochrana osobních údajů",
        body: [
          "Zpracování osobních údajů je popsáno v samostatném dokumentu Ochrana osobních údajů."
        ]
      },
      {
        title: "9. Alternativní řešení sporů",
        body: [
          "Pokud spotřebitel není spokojen s vyřízením reklamace nebo se domnívá, že prodávající porušil jeho práva, může se obrátit na prodávajícího se žádostí o nápravu.",
          "Pokud prodávající žádosti nevyhoví nebo na ni neodpoví do 30 dnů od jejího odeslání, má spotřebitel právo podat návrh na zahájení alternativního řešení sporu podle příslušných právních předpisů. Příslušným subjektem je Slovenská obchodní inspekce, Ústřední inspektorát, odbor mezinárodních vztahů a alternativního řešení sporů, Bajkalská 21/A, P. O. Box 29, 827 99 Bratislava 27 (soi.sk, ars@soi.sk). Seznam subjektů alternativního řešení sporů v EU vede Evropská komise na consumer-redress.ec.europa.eu.",
          "Spotřebitel z jiného členského státu Evropské unie se může v případě přeshraničního sporu bezplatně obrátit na síť Evropských spotřebitelských center (ECC-Net)."
        ]
      },
      {
        title: "10. Závěrečná ustanovení",
        body: [
          "Právní vztahy se řídí slovenským právem, tím však nejsou dotčena práva spotřebitele vyplývající z kogentních ustanovení práva státu, ve kterém má spotřebitel obvyklý pobyt.",
          "Prodávající může obchodní podmínky měnit. Pro konkrétní objednávku platí obchodní podmínky účinné v době jejího odeslání.",
          "Tyto obchodní podmínky jsou účinné od 22. září 2026."
        ]
      }
    ]
  },
  {
    slug: "ochrana-osobnich-udaju",
    title: "Ochrana osobních údajů",
    blocks: [
      {
        title: "Provozovatel",
        body: [
          "LSHK lab s. r. o.",
          "Ratibořská 751/32, Bohnice, Praha 8, Česká republika",
          "IČO: 55602088",
          "DIČ: 2122056816",
          "E-mail: narastore.help@gmail.com",
          "Provozovatel zpracovává osobní údaje zákazníků internetového obchodu NaRa v souladu s GDPR, zákonem o ochraně osobních údajů a souvisejícími právními předpisy."
        ]
      },
      {
        title: "Jaké údaje zpracováváme",
        body: [
          "Identifikační údaje: jméno a příjmení, případně název firmy.",
          "Kontaktní údaje: e-mail, telefon, doručovací a fakturační adresa.",
          "Údaje o objednávce: produkty, cena, doprava, platba, stav objednávky.",
          "Údaje zákaznického účtu: přihlašovací e-mail, profilové údaje a uložená adresa.",
          "Komunikace: zprávy z kontaktního formuláře, reklamace a servisní požadavky.",
          "Technické údaje potřebné pro bezpečný provoz webu a ochranu před zneužitím."
        ]
      },
      {
        title: "Na jaké účely a podle jakého právního základu"
      },
      {
        title: "Vyřízení objednávky",
        eyebrow: "Právní základ: plnění smlouvy",
        body: [
          "Údaje používáme k přijetí objednávky, platbě, výrobě, doručení, komunikaci o objednávce a zákaznické podpoře."
        ]
      },
      {
        title: "Účetnictví a daňové povinnosti",
        eyebrow: "Právní základ: zákonná povinnost",
        body: [
          "Fakturační a účetní doklady uchováváme v rozsahu a po dobu vyžadovanou právními předpisy."
        ]
      },
      {
        title: "Zákaznický účet",
        eyebrow: "Právní základ: plnění smlouvy a oprávněný zájem",
        body: [
          "Účet slouží k přihlášení, přehledu objednávek, uložené adrese a jednodušším budoucím nákupům."
        ]
      },
      {
        title: "Reklamace, vrácení a ochrana práv",
        eyebrow: "Právní základ: zákonná povinnost a oprávněný zájem",
        body: [
          "Údaje používáme k vyřízení reklamací, odstoupení od smlouvy, řešení sporů a prokazování právních nároků."
        ]
      },
      {
        title: "Kontaktní formulář",
        eyebrow: "Právní základ: oprávněný zájem nebo příprava smlouvy",
        body: [
          "Údaje používáme k odpovědi na otázku, požadavek na produkt nebo individuální komunikaci."
        ]
      },
      {
        title: "Připomínka nedokončené objednávky",
        eyebrow: "Právní základ: oprávněný zájem",
        body: [
          "Pokud během pokladny zadáte e-mail, ale objednávku nedokončíte, můžeme vám poslat jednu připomínku s obsahem rozpracovaného košíku. Jde o jednorázovou provozní zprávu, nikoli marketing - každý e-mail obsahuje jednoduché odhlášení."
        ]
      },
      {
        title: "Marketing",
        eyebrow: "Právní základ: souhlas",
        body: [
          "Newsletter nebo marketingové zprávy posíláme jen tehdy, pokud se k nim zákazník samostatně přihlásí. Souhlas je možné kdykoli odvolat."
        ]
      },
      {
        title: "Komu údaje zpřístupňujeme",
        body: [
          "Osobní údaje neprodáváme ani nezveřejňujeme. Používáme však služby partnerů, kteří nám pomáhají provozovat e-shop a vyřídit objednávku:",
          "Dopravci a výdejní místa, zejména Packeta / Zásilkovna.",
          "Poskytovatel hostingu, databáze a technické infrastruktury.",
          "Cloudflare R2 pro ukládání souborů a obrázků.",
          "Poskytovatel e-mailových služeb pro odesílání transakčních e-mailů.",
          "Systém pro přihlašování zákazníků.",
          "Banka, účetnictví, daňový poradce nebo právní poradce, pokud je to potřebné.",
          "Orgány veřejné moci, pokud nám to ukládá zákon."
        ]
      },
      {
        title: "Jak dlouho údaje uchováváme",
        body: [
          "Objednávkové a fakturační údaje uchováváme po dobu vyžadovanou účetními a daňovými předpisy.",
          "Údaje zákaznického účtu uchováváme po dobu trvání účtu.",
          "Komunikaci a reklamace uchováváme po dobu vyřízení věci a přiměřenou dobu na ochranu práv.",
          "Marketingový souhlas uchováváme do jeho odvolání nebo do ukončení marketingové komunikace.",
          "E-mail a obsah rozpracovaného košíku z nedokončené pokladny uchováváme nejvýše 30 dnů, poté se automaticky vymažou."
        ]
      },
      {
        title: "Cookies a lokální úložiště",
        body: [
          "Na stránce nepoužíváme marketingové ani analytické sledování bez souhlasu. Používáme pouze technické cookies a lokální úložiště potřebné pro fungování služby, zejména přihlášení, bezpečnost, košík a pokladnu.",
          "Košík nepřihlášeného zákazníka se může ukládat v prohlížeči pomocí lokálního úložiště. Widget Packety se načítá v pokladně pouze pro výběr výdejního místa nebo doručení.",
          "Stránka pokladny nastaví anonymní technické cookie, které spáruje rozpracovanou objednávku s připomínkovým e-mailem. Neslouží ke sledování napříč webem ani k marketingu.",
          "Pokud v budoucnu přidáme analytiku nebo marketingové nástroje, zobrazíme samostatnou cookie lištu se souhlasem před jejich použitím."
        ]
      },
      {
        title: "Vaše práva",
        body: [
          "Jako subjekt údajů máte právo na přístup k údajům, opravu, výmaz, omezení zpracování, přenositelnost údajů a právo vznést námitku proti zpracování, pokud jsou splněny podmínky podle GDPR.",
          "Pokud je zpracování založeno na souhlasu, máte právo souhlas kdykoli odvolat. Odvolání souhlasu nemá vliv na zákonnost zpracování před jeho odvoláním.",
          "Svá práva můžete uplatnit e-mailem na narastore.help@gmail.com. Máte také právo podat stížnost u Úřadu pro ochranu osobních údajů."
        ]
      },
      {
        variant: "note",
        body: [
          "Tento dokument je účinný od 19. 6. 2026. Otázky k ochraně údajů posílejte na narastore.help@gmail.com."
        ]
      }
    ]
  },
  {
    slug: "kontakt",
    title: "Kontakt",
    intro: "Máte otázku k objednávce, produktu nebo chcete něco na míru? Napište nám.",
    form: "contact",
    blocks: [
      {
        title: "Napište nám"
      }
    ]
  }
];

export function getInfoPage(slug: string) {
  return infoPages.find((page) => page.slug === slug);
}
