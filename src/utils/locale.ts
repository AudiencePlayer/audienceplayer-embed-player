// https://raw.githubusercontent.com/vtex/country-iso-3-to-2/master/index.js
export function getLocaleFromLanguage(countryCode: string) {
    const countryISOMapping: any = {
        AFG: 'AF',
        ALA: 'AX',
        ALB: 'AL',
        DZA: 'DZ',
        ASM: 'AS',
        AND: 'AD',
        AGO: 'AO',
        AIA: 'AI',
        ATA: 'AQ',
        ATG: 'AG',
        ARG: 'AR',
        ARM: 'AM',
        ABW: 'AW',
        AUS: 'AU',
        AUT: 'AT',
        AZE: 'AZ',
        BHS: 'BS',
        BHR: 'BH',
        BGD: 'BD',
        BRB: 'BB',
        BLR: 'BY',
        BEL: 'BE',
        BLZ: 'BZ',
        BEN: 'BJ',
        BMU: 'BM',
        BTN: 'BT',
        BOL: 'BO',
        BES: 'BQ',
        BIH: 'BA',
        BWA: 'BW',
        BVT: 'BV',
        BRA: 'BR',
        VGB: 'VG',
        IOT: 'IO',
        BRN: 'BN',
        BGR: 'BG',
        BFA: 'BF',
        BDI: 'BI',
        KHM: 'KH',
        CMR: 'CM',
        CAN: 'CA',
        CPV: 'CV',
        CYM: 'KY',
        CAF: 'CF',
        TCD: 'TD',
        CHL: 'CL',
        CHN: 'CN',
        HKG: 'HK',
        MAC: 'MO',
        CXR: 'CX',
        CCK: 'CC',
        COL: 'CO',
        COM: 'KM',
        COG: 'CG',
        COD: 'CD',
        COK: 'CK',
        CRI: 'CR',
        CIV: 'CI',
        HRV: 'HR',
        CUB: 'CU',
        CUW: 'CW',
        CYP: 'CY',
        CZE: 'CZ',
        DNK: 'DK',
        DJI: 'DJ',
        DMA: 'DM',
        DOM: 'DO',
        ECU: 'EC',
        EGY: 'EG',
        SLV: 'SV',
        GNQ: 'GQ',
        ERI: 'ER',
        EST: 'EE',
        ETH: 'ET',
        FLK: 'FK',
        FRO: 'FO',
        FJI: 'FJ',
        FIN: 'FI',
        FRA: 'FR',
        GUF: 'GF',
        PYF: 'PF',
        ATF: 'TF',
        GAB: 'GA',
        GMB: 'GM',
        GEO: 'GE',
        DEU: 'DE',
        GHA: 'GH',
        GIB: 'GI',
        GRC: 'GR',
        GRL: 'GL',
        GRD: 'GD',
        GLP: 'GP',
        GUM: 'GU',
        GTM: 'GT',
        GGY: 'GG',
        GIN: 'GN',
        GNB: 'GW',
        GUY: 'GY',
        HTI: 'HT',
        HMD: 'HM',
        VAT: 'VA',
        HND: 'HN',
        HUN: 'HU',
        ISL: 'IS',
        IND: 'IN',
        IDN: 'ID',
        IRN: 'IR',
        IRQ: 'IQ',
        IRL: 'IE',
        IMN: 'IM',
        ISR: 'IL',
        ITA: 'IT',
        JAM: 'JM',
        JPN: 'JP',
        JEY: 'JE',
        JOR: 'JO',
        KAZ: 'KZ',
        KEN: 'KE',
        KIR: 'KI',
        PRK: 'KP',
        KOR: 'KR',
        KWT: 'KW',
        KGZ: 'KG',
        LAO: 'LA',
        LVA: 'LV',
        LBN: 'LB',
        LSO: 'LS',
        LBR: 'LR',
        LBY: 'LY',
        LIE: 'LI',
        LTU: 'LT',
        LUX: 'LU',
        MKD: 'MK',
        MDG: 'MG',
        MWI: 'MW',
        MYS: 'MY',
        MDV: 'MV',
        MLI: 'ML',
        MLT: 'MT',
        MHL: 'MH',
        MTQ: 'MQ',
        MRT: 'MR',
        MUS: 'MU',
        MYT: 'YT',
        MEX: 'MX',
        FSM: 'FM',
        MDA: 'MD',
        MCO: 'MC',
        MNG: 'MN',
        MNE: 'ME',
        MSR: 'MS',
        MAR: 'MA',
        MOZ: 'MZ',
        MMR: 'MM',
        NAM: 'NA',
        NRU: 'NR',
        NPL: 'NP',
        NLD: 'NL',
        ANT: 'AN',
        NCL: 'NC',
        NZL: 'NZ',
        NIC: 'NI',
        NER: 'NE',
        NGA: 'NG',
        NIU: 'NU',
        NFK: 'NF',
        MNP: 'MP',
        NOR: 'NO',
        OMN: 'OM',
        PAK: 'PK',
        PLW: 'PW',
        PSE: 'PS',
        PAN: 'PA',
        PNG: 'PG',
        PRY: 'PY',
        PER: 'PE',
        PHL: 'PH',
        PCN: 'PN',
        POL: 'PL',
        PRT: 'PT',
        PRI: 'PR',
        QAT: 'QA',
        REU: 'RE',
        ROU: 'RO',
        RUS: 'RU',
        RWA: 'RW',
        BLM: 'BL',
        SHN: 'SH',
        KNA: 'KN',
        LCA: 'LC',
        MAF: 'MF',
        SPM: 'PM',
        VCT: 'VC',
        WSM: 'WS',
        SMR: 'SM',
        STP: 'ST',
        SAU: 'SA',
        SEN: 'SN',
        SRB: 'RS',
        SYC: 'SC',
        SLE: 'SL',
        SGP: 'SG',
        SXM: 'SX',
        SVK: 'SK',
        SVN: 'SI',
        SLB: 'SB',
        SOM: 'SO',
        ZAF: 'ZA',
        SGS: 'GS',
        SSD: 'SS',
        ESP: 'ES',
        LKA: 'LK',
        SDN: 'SD',
        SUR: 'SR',
        SJM: 'SJ',
        SWZ: 'SZ',
        SWE: 'SE',
        CHE: 'CH',
        SYR: 'SY',
        TWN: 'TW',
        TJK: 'TJ',
        TZA: 'TZ',
        THA: 'TH',
        TLS: 'TL',
        TGO: 'TG',
        TKL: 'TK',
        TON: 'TO',
        TTO: 'TT',
        TUN: 'TN',
        TUR: 'TR',
        TKM: 'TM',
        TCA: 'TC',
        TUV: 'TV',
        UGA: 'UG',
        UKR: 'UA',
        ARE: 'AE',
        GBR: 'GB',
        USA: 'US',
        UMI: 'UM',
        URY: 'UY',
        UZB: 'UZ',
        VUT: 'VU',
        VEN: 'VE',
        VNM: 'VN',
        VIR: 'VI',
        WLF: 'WF',
        ESH: 'EH',
        YEM: 'YE',
        ZMB: 'ZM',
        ZWE: 'ZW',
        XKX: 'XK',
    };

    if (countryCode && countryCode.length === 3) {
        countryCode = countryCode.toUpperCase();

        if (countryISOMapping[countryCode]) {
            return countryISOMapping[countryCode].toLowerCase();
        }
        return countryCode.substr(0, 2).toLowerCase();
    }
    return ('' + countryCode).toLowerCase();
}

export function getNativeLanguage(lang: string) {
    const locale = lang && lang.length === 3 ? getLocaleFromLanguage(lang) : lang;

    const isoLocales: any = {
        ab: {
            name: 'Abkhaz',
            nativeName: 'аҧсуа',
        },
        aa: {
            name: 'Afar',
            nativeName: 'Afaraf',
        },
        af: {
            name: 'Afrikaans',
            nativeName: 'Afrikaans',
        },
        ak: {
            name: 'Akan',
            nativeName: 'Akan',
        },
        sq: {
            name: 'Albanian',
            nativeName: 'Shqip',
        },
        am: {
            name: 'Amharic',
            nativeName: 'አማርኛ',
        },
        ar: {
            name: 'Arabic',
            nativeName: 'العربية',
        },
        an: {
            name: 'Aragonese',
            nativeName: 'Aragonés',
        },
        hy: {
            name: 'Armenian',
            nativeName: 'Հայերեն',
        },
        as: {
            name: 'Assamese',
            nativeName: 'অসমীয়া',
        },
        av: {
            name: 'Avaric',
            nativeName: 'авар мацӀ, магӀарул мацӀ',
        },
        ae: {
            name: 'Avestan',
            nativeName: 'avesta',
        },
        ay: {
            name: 'Aymara',
            nativeName: 'aymar aru',
        },
        az: {
            name: 'Azerbaijani',
            nativeName: 'azərbaycan dili',
        },
        bm: {
            name: 'Bambara',
            nativeName: 'bamanankan',
        },
        ba: {
            name: 'Bashkir',
            nativeName: 'башҡорт теле',
        },
        eu: {
            name: 'Basque',
            nativeName: 'euskara, euskera',
        },
        be: {
            name: 'Belarusian',
            nativeName: 'Беларуская',
        },
        bn: {
            name: 'Bangla',
            nativeName: 'বাংলা',
        },
        bh: {
            name: 'Bihari',
            nativeName: 'भोजपुरी',
        },
        bi: {
            name: 'Bislama',
            nativeName: 'Bislama',
        },
        bs: {
            name: 'Bosnian',
            nativeName: 'bosanski jezik',
        },
        br: {
            name: 'Breton',
            nativeName: 'brezhoneg',
        },
        bg: {
            name: 'Bulgarian',
            nativeName: 'български език',
        },
        my: {
            name: 'Burmese',
            nativeName: 'ဗမာစာ',
        },
        ca: {
            name: 'Catalan; Valencian',
            nativeName: 'Català',
        },
        ch: {
            name: 'Chamorro',
            nativeName: 'Chamoru',
        },
        ce: {
            name: 'Chechen',
            nativeName: 'нохчийн мотт',
        },
        ny: {
            name: 'Chichewa; Chewa; Nyanja',
            nativeName: 'chiCheŵa, chinyanja',
        },
        zh: {
            name: 'Chinese',
            nativeName: '中文 (Zhōngwén), 汉语, 漢語',
        },
        cv: {
            name: 'Chuvash',
            nativeName: 'чӑваш чӗлхи',
        },
        kw: {
            name: 'Cornish',
            nativeName: 'Kernewek',
        },
        co: {
            name: 'Corsican',
            nativeName: 'corsu, lingua corsa',
        },
        cr: {
            name: 'Cree',
            nativeName: 'ᓀᐦᐃᔭᐍᐏᐣ',
        },
        hr: {
            name: 'Croatian',
            nativeName: 'hrvatski',
        },
        cs: {
            name: 'Czech',
            nativeName: 'čeština',
        },
        da: {
            name: 'Danish',
            nativeName: 'dansk',
        },
        dv: {
            name: 'Divehi; Dhivehi; Maldivian;',
            nativeName: 'ދިވެހި',
        },
        nl: {
            name: 'Dutch',
            nativeName: 'Nederlands',
        },
        en: {
            name: 'English',
            nativeName: 'English',
        },
        eo: {
            name: 'Esperanto',
            nativeName: 'Esperanto',
        },
        et: {
            name: 'Estonian',
            nativeName: 'eesti',
        },
        ee: {
            name: 'Ewe',
            nativeName: 'Eʋegbe',
        },
        fo: {
            name: 'Faroese',
            nativeName: 'føroyskt',
        },
        fj: {
            name: 'Fijian',
            nativeName: 'vosa Vakaviti',
        },
        fi: {
            name: 'Finnish',
            nativeName: 'suomi',
        },
        fr: {
            name: 'French',
            nativeName: 'français',
        },
        ff: {
            name: 'Fula; Fulah; Pulaar; Pular',
            nativeName: 'Fulfulde, Pulaar, Pular',
        },
        gl: {
            name: 'Galician',
            nativeName: 'Galego',
        },
        ka: {
            name: 'Georgian',
            nativeName: 'ქართული',
        },
        de: {
            name: 'German',
            nativeName: 'Deutsch',
        },
        el: {
            name: 'Greek, Modern',
            nativeName: 'Ελληνικά',
        },
        gn: {
            name: 'Guaraní',
            nativeName: 'Avañeẽ',
        },
        gu: {
            name: 'Gujarati',
            nativeName: 'ગુજરાતી',
        },
        ht: {
            name: 'Haitian; Haitian Creole',
            nativeName: 'Kreyòl ayisyen',
        },
        ha: {
            name: 'Hausa',
            nativeName: 'Hausa, هَوُسَ',
        },
        he: {
            name: 'Hebrew (modern)',
            nativeName: 'עברית',
        },
        hz: {
            name: 'Herero',
            nativeName: 'Otjiherero',
        },
        hi: {
            name: 'Hindi',
            nativeName: 'हिन्दी, हिंदी',
        },
        ho: {
            name: 'Hiri Motu',
            nativeName: 'Hiri Motu',
        },
        hu: {
            name: 'Hungarian',
            nativeName: 'Magyar',
        },
        ia: {
            name: 'Interlingua',
            nativeName: 'Interlingua',
        },
        id: {
            name: 'Indonesian',
            nativeName: 'Bahasa Indonesia',
        },
        ie: {
            name: 'Interlingue',
            nativeName: 'Interlingue',
        },
        ga: {
            name: 'Irish',
            nativeName: 'Gaeilge',
        },
        ig: {
            name: 'Igbo',
            nativeName: 'Asụsụ Igbo',
        },
        ik: {
            name: 'Inupiaq',
            nativeName: 'Iñupiaq',
        },
        io: {
            name: 'Ido',
            nativeName: 'Ido',
        },
        is: {
            name: 'Icelandic',
            nativeName: 'Íslenska',
        },
        it: {
            name: 'Italian',
            nativeName: 'Italiano',
        },
        iu: {
            name: 'Inuktitut',
            nativeName: 'ᐃᓄᒃᑎᑐᑦ',
        },
        ja: {
            name: 'Japanese',
            nativeName: '日本語',
        },
        jv: {
            name: 'Javanese',
            nativeName: 'basa Jawa',
        },
        kl: {
            name: 'Kalaallisut, Greenlandic',
            nativeName: 'kalaallisut, kalaallit oqaasii',
        },
        kn: {
            name: 'Kannada',
            nativeName: 'ಕನ್ನಡ',
        },
        kr: {
            name: 'Kanuri',
            nativeName: 'Kanuri',
        },
        ks: {
            name: 'Kashmiri',
            nativeName: 'कश्मीरी, كشميري‎',
        },
        kk: {
            name: 'Kazakh',
            nativeName: 'Қазақ тілі',
        },
        km: {
            name: 'Khmer',
            nativeName: 'ភាសាខ្មែរ',
        },
        ki: {
            name: 'Kikuyu, Gikuyu',
            nativeName: 'Gĩkũyũ',
        },
        rw: {
            name: 'Kinyarwanda',
            nativeName: 'Ikinyarwanda',
        },
        ky: {
            name: 'Kirghiz, Kyrgyz',
            nativeName: 'кыргыз тили',
        },
        kv: {
            name: 'Komi',
            nativeName: 'коми кыв',
        },
        kg: {
            name: 'Kongo',
            nativeName: 'KiKongo',
        },
        ko: {
            name: 'Korean',
            nativeName: '한국어 (韓國語), 조선말 (朝鮮語)',
        },
        ku: {
            name: 'Kurdish',
            nativeName: 'كوردی‎',
        },
        kj: {
            name: 'Kwanyama, Kuanyama',
            nativeName: 'Kuanyama',
        },
        la: {
            name: 'Latin',
            nativeName: 'latine',
        },
        lb: {
            name: 'Luxembourgish, Letzeburgesch',
            nativeName: 'Lëtzebuergesch',
        },
        lg: {
            name: 'Luganda',
            nativeName: 'Luganda',
        },
        li: {
            name: 'Limburgish, Limburgan, Limburger',
            nativeName: 'Limburgs',
        },
        ln: {
            name: 'Lingala',
            nativeName: 'Lingála',
        },
        lo: {
            name: 'Lao',
            nativeName: 'ພາສາລາວ',
        },
        lt: {
            name: 'Lithuanian',
            nativeName: 'lietuvių kalba',
        },
        lu: {
            name: 'Luba-Katanga',
            nativeName: 'Luba-Katanga',
        },
        lv: {
            name: 'Latvian',
            nativeName: 'latviešu valoda',
        },
        gv: {
            name: 'Manx',
            nativeName: 'Gaelg, Gailck',
        },
        mk: {
            name: 'Macedonian',
            nativeName: 'македонски јазик',
        },
        mg: {
            name: 'Malagasy',
            nativeName: 'Malagasy fiteny',
        },
        ms: {
            name: 'Malay',
            nativeName: 'bahasa Melayu, بهاس ملايو‎',
        },
        ml: {
            name: 'Malayalam',
            nativeName: 'മലയാളം',
        },
        mt: {
            name: 'Maltese',
            nativeName: 'Malti',
        },
        mi: {
            name: 'Māori',
            nativeName: 'te reo Māori',
        },
        mr: {
            name: 'Marathi (Marāṭhī)',
            nativeName: 'मराठी',
        },
        mh: {
            name: 'Marshallese',
            nativeName: 'Kajin M̧ajeļ',
        },
        mn: {
            name: 'Mongolian',
            nativeName: 'монгол',
        },
        na: {
            name: 'Nauru',
            nativeName: 'Ekakairũ Naoero',
        },
        nv: {
            name: 'Navajo, Navaho',
            nativeName: 'Diné bizaad, Dinékʼehǰí',
        },
        nb: {
            name: 'Norwegian Bokmål',
            nativeName: 'Norsk bokmål',
        },
        nd: {
            name: 'North Ndebele',
            nativeName: 'isiNdebele',
        },
        ne: {
            name: 'Nepali',
            nativeName: 'नेपाली',
        },
        ng: {
            name: 'Ndonga',
            nativeName: 'Owambo',
        },
        nn: {
            name: 'Norwegian Nynorsk',
            nativeName: 'Norsk nynorsk',
        },
        no: {
            name: 'Norwegian',
            nativeName: 'Norsk',
        },
        ii: {
            name: 'Nuosu',
            nativeName: 'ꆈꌠ꒿ Nuosuhxop',
        },
        nr: {
            name: 'South Ndebele',
            nativeName: 'isiNdebele',
        },
        oc: {
            name: 'Occitan',
            nativeName: 'Occitan',
        },
        oj: {
            name: 'Ojibwe, Ojibwa',
            nativeName: 'ᐊᓂᔑᓈᐯᒧᐎᓐ',
        },
        cu: {
            name: 'Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic',
            nativeName: 'ѩзыкъ словѣньскъ',
        },
        om: {
            name: 'Oromo',
            nativeName: 'Afaan Oromoo',
        },
        or: {
            name: 'Odia',
            nativeName: 'ଓଡ଼ିଆ',
        },
        os: {
            name: 'Ossetian, Ossetic',
            nativeName: 'ирон æвзаг',
        },
        pa: {
            name: 'Panjabi, Punjabi',
            nativeName: 'ਪੰਜਾਬੀ, پنجابی‎',
        },
        pi: {
            name: 'Pāli',
            nativeName: 'पाऴि',
        },
        fa: {
            name: 'Persian',
            nativeName: 'فارسی',
        },
        pl: {
            name: 'Polish',
            nativeName: 'polski',
        },
        ps: {
            name: 'Pashto, Pushto',
            nativeName: 'پښتو',
        },
        pt: {
            name: 'Portuguese',
            nativeName: 'Português',
        },
        qu: {
            name: 'Quechua',
            nativeName: 'Runa Simi, Kichwa',
        },
        rm: {
            name: 'Romansh',
            nativeName: 'rumantsch grischun',
        },
        rn: {
            name: 'Kirundi',
            nativeName: 'kiRundi',
        },
        ro: {
            name: 'Romanian, Moldovans, Moldovan',
            nativeName: 'română',
        },
        ru: {
            name: 'Russian',
            nativeName: 'русский',
        },
        sa: {
            name: 'Sanskrit (Saṁskṛta)',
            nativeName: 'संस्कृतम्',
        },
        sc: {
            name: 'Sardinian',
            nativeName: 'sardu',
        },
        sd: {
            name: 'Sindhi',
            nativeName: 'सिन्धी, سنڌي، سندھی‎',
        },
        se: {
            name: 'Northern Sami',
            nativeName: 'Davvisámegiella',
        },
        sm: {
            name: 'Samoan',
            nativeName: 'gagana faa Samoa',
        },
        sg: {
            name: 'Sango',
            nativeName: 'yângâ tî sängö',
        },
        sr: {
            name: 'Serbian',
            nativeName: 'српски језик',
        },
        gd: {
            name: 'Scottish Gaelic; Gaelic',
            nativeName: 'Gàidhlig',
        },
        sn: {
            name: 'Shona',
            nativeName: 'chiShona',
        },
        si: {
            name: 'Sinhala, Sinhalese',
            nativeName: 'සිංහල',
        },
        sk: {
            name: 'Slovak',
            nativeName: 'slovenčina',
        },
        sl: {
            name: 'Slovene',
            nativeName: 'slovenščina',
        },
        so: {
            name: 'Somali',
            nativeName: 'Soomaaliga, af Soomaali',
        },
        st: {
            name: 'Southern Sotho',
            nativeName: 'Sesotho',
        },
        es: {
            name: 'Spanish',
            nativeName: 'español',
        },
        su: {
            name: 'Sundanese',
            nativeName: 'Basa Sunda',
        },
        sw: {
            name: 'Swahili',
            nativeName: 'Kiswahili',
        },
        ss: {
            name: 'Swati',
            nativeName: 'SiSwati',
        },
        sv: {
            name: 'Swedish',
            nativeName: 'svenska',
        },
        ta: {
            name: 'Tamil',
            nativeName: 'தமிழ்',
        },
        te: {
            name: 'Telugu',
            nativeName: 'తెలుగు',
        },
        tg: {
            name: 'Tajik',
            nativeName: 'تاجیکی‎',
        },
        th: {
            name: 'Thai',
            nativeName: 'ไทย',
        },
        ti: {
            name: 'Tigrinya',
            nativeName: 'ትግርኛ',
        },
        bo: {
            name: 'Tibetan Standard, Tibetan, Central',
            nativeName: 'བོད་ཡིག',
        },
        tk: {
            name: 'Turkmen',
            nativeName: 'Türkmen',
        },
        tl: {
            name: 'Tagalog',
            nativeName: 'Wikang Tagalog',
        },
        tn: {
            name: 'Tswana',
            nativeName: 'Setswana',
        },
        to: {
            name: 'Tonga (Tonga Islands)',
            nativeName: 'faka Tonga',
        },
        tr: {
            name: 'Turkish',
            nativeName: 'Türkçe',
        },
        ts: {
            name: 'Tsonga',
            nativeName: 'Xitsonga',
        },
        tt: {
            name: 'Tatar',
            nativeName: 'تاتارچا‎',
        },
        tw: {
            name: 'Twi',
            nativeName: 'Twi',
        },
        ty: {
            name: 'Tahitian',
            nativeName: 'Reo Tahiti',
        },
        ug: {
            name: 'Uighur, Uyghur',
            nativeName: 'ئۇيغۇرچە‎',
        },
        uk: {
            name: 'Ukrainian',
            nativeName: 'українська',
        },
        ur: {
            name: 'Urdu',
            nativeName: 'اردو',
        },
        uz: {
            name: 'Uzbek',
            nativeName: 'zbek, Ўзбек, أۇزبېك‎',
        },
        ve: {
            name: 'Venda',
            nativeName: 'Tshivenḓa',
        },
        vi: {
            name: 'Vietnamese',
            nativeName: 'Tiếng Việt',
        },
        vo: {
            name: 'Volapük',
            nativeName: 'Volapük',
        },
        wa: {
            name: 'Walloon',
            nativeName: 'Walon',
        },
        cy: {
            name: 'Welsh',
            nativeName: 'Cymraeg',
        },
        wo: {
            name: 'Wolof',
            nativeName: 'Wollof',
        },
        fy: {
            name: 'Western Frisian',
            nativeName: 'Frysk',
        },
        xh: {
            name: 'Xhosa',
            nativeName: 'isiXhosa',
        },
        yi: {
            name: 'Yiddish',
            nativeName: 'ייִדיש',
        },
        yo: {
            name: 'Yoruba',
            nativeName: 'Yorùbá',
        },
        za: {
            name: 'Zhuang, Chuang',
            nativeName: 'Saɯ cueŋƅ, Saw cuengh',
        },
        mis: {
            name: 'uncoded languages',
            nativeName: 'uncoded languages',
        },
        mul: {
            name: 'multiple languages',
            nativeName: 'multiple languages',
        },
        und: {
            name: 'undetermined',
            nativeName: 'undetermined',
        },
        zxx: {
            name: 'no linguistic content/not applicable',
            nativeName: 'no linguistic content/not applicable',
        },
    };

    if (locale && isoLocales[locale]) {
        return isoLocales[locale].nativeName;
    }
    return locale;
}
