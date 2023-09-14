var e,t,a,s,r,i={d:(e,t)=>{for(var a in t)i.o(t,a)&&!i.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},n={};function o(){return videojs.browser.IS_ANY_SAFARI&&videojs.browser.IS_IOS}i.d(n,{Af:()=>I,Cz:()=>P,Yn:()=>E,Y7:()=>T}),function(e){e[e.loading=0]="loading",e[e.playing=1]="playing",e[e.paused=2]="paused",e[e.idle=3]="idle",e[e.buffering=4]="buffering",e[e.error=5]="error"}(e||(e={})),function(e){e.playStart="playStart",e.playing="playing",e.pause="pause",e.error="error",e.stopped="stopped",e.timeupdate="timeupdate",e.textTrackChanged="textTrackChanged",e.audioTrackChanged="audioTrackChanged"}(t||(t={})),function(e){e.chromecast="chromecast",e.default=""}(a||(a={})),function(e){e.play="play",e.playing="playing",e.paused="paused",e.stop="stop",e.error="error",e.configure="configure"}(s||(s={})),function(e){e.live="live",e.archive="archive",e.offline="offline"}(r||(r={}));class l{constructor(e,t){this.playLogs=[],this.apiCallInProgress=!1,this.intervalHandle=null,this.apiUrl=`${e}/service/${t}/analytics/stream/pulse/log`.replace(/\/*$/,"")}init(){null===this.intervalHandle&&(this.intervalHandle=setInterval((()=>{this.processFirstPlayLog()}),3e3))}destroy(){this.intervalHandle&&clearInterval(this.intervalHandle)}processPlaySession(e,t){if(!e)return;const a=e.eventStack;if(0===a.length)return;const i=[];let n=0,o=0,l=!1;for(;n<a.length;){const e=a[n];if(this.isEventTypeWithoutTimeDelta(e.eventType))i.push(this.convertEventToEventPayload(e)),l=!0;else if(l=!1,n-1>=0){const t=a[n-1];o+=e.timeStamp-t.timeStamp,e.state!==t.state&&(i.push(this.createDeltaEventPayload(t,t.timeStamp,o)),o=0)}n++}const c=a[a.length-1];if((o>0||!l)&&i.push(this.createDeltaEventPayload(c,t,o)),i.length>0){if(i.length>30){const e=i[i.length-1];i.splice(29),e.event_type=s.error,e.event_payload='{code: 429, message: "Too many events"}',i.push(e)}let t=this.getPlayerLogPayloadWithPulseToken(e.pulseToken);t||(t={event_stack:[],pulse_token:e.pulseToken,pulse_mode:e.isLive?r.live:r.offline,device_type:e.deviceType},this.playLogs.push(t)),i.forEach((e=>t.event_stack.push(e))),this.processPlayLog(t,e)}}processFirstPlayLog(){this.playLogs.length>0&&this.processPlayLog(this.playLogs[0],null)}processPlayLog(e,t){if(!e||this.apiCallInProgress)return;if(0===e.event_stack.length)return void this.removePlayLog(e);const a={...e,event_stack:[]};let i=0,n=!1;for(;i<e.event_stack.length&&a.event_stack.length<30&&!n;){const t=e.event_stack[i];i++,a.event_stack.push(t),t.event_type===s.stop&&(n=!0)}return a.pulse_mode===r.offline&&a.event_stack.length<30&&!n?void 0:(this.apiCallInProgress=!0,fetch(this.apiUrl,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(a)}).then((()=>!0)).catch((e=>0!==e.status)).then((t=>{t?(e.event_stack.splice(0,i),0===e.event_stack.length&&this.removePlayLog(e)):e.pulse_mode=r.archive,this.apiCallInProgress=!1})))}getPlayerLogPayloadWithPulseToken(e){return this.playLogs.find((t=>t.pulse_token===e))}removePlayLog(e){const t=this.playLogs.findIndex((t=>t.pulse_token===e.pulse_token));t>=0&&this.playLogs.splice(t,1)}isEventTypeWithoutTimeDelta(e){return[t.textTrackChanged,t.audioTrackChanged,t.playStart].indexOf(e)>=0}createBaseEventPayload(e,t){return{timestamp:e.timeStamp,event_type:t,appa:e.playPosition,appr:Math.min(e.playPosition/e.mediaDuration,1)}}convertEventToEventPayload(e){if(e.eventType===t.playStart)return{timestamp:e.timeStamp,event_type:s.play};const a=this.convertEventTypeToEventTypePayload(e),r=this.createBaseEventPayload(e,a);switch(e.eventType){case t.audioTrackChanged:return{...r,audio_locale:e.audioTrack};case t.textTrackChanged:return{...r,subtitle_locale:e.textTrack};default:return r}}createDeltaEventPayload(t,a,s){const r=this.getEventTypePayloadFromEventState(t);return{...this.createBaseEventPayload(t,r),...t.state===e.error?{event_payload:t.error}:{},timestamp:a,time_delta:s/1e3}}getEventTypePayloadFromEventState(t){switch(t.state){case e.playing:return s.playing;case e.paused:return s.paused;case e.error:return s.error;case e.buffering:case e.loading:return s.paused;case e.idle:return s.stop}}convertEventTypeToEventTypePayload(e){switch(e.eventType){case t.playStart:return s.play;case t.audioTrackChanged:case t.textTrackChanged:return s.configure;default:this.getEventTypePayloadFromEventState(e)}}}class c{constructor(e,t){this.intervalHandle=0,this.playerLogProcessor=new l(e,t),this.reset()}init(){this.playerLogProcessor.init()}destroy(){this.playerLogProcessor.destroy()}onStart(e,t,a,s,r){this.reset(),this.playSession={pulseToken:e,deviceType:t,eventStack:[],localTimeDelta:a,isLive:s,onStopCallback:r}}onCurrentTimeUpdated(a){this.playerProperties.playPosition=a,this.playerProperties.mediaDuration>0&&this.playerProperties.state!==e.idle&&this.logEvent(t.timeupdate)}onDurationUpdated(e){this.playerProperties.mediaDuration=e}onPlaying(){this.playerProperties.state!==e.playing&&(this.playerProperties.state===e.idle?(this.playerProperties.state=e.playing,this.logEvent(t.playStart),this.processPlaySession(),this.startInterval()):(this.playerProperties.state=e.playing,this.logEvent(t.playing)))}onPause(){this.playerProperties.state!==e.paused&&(this.playerProperties.state=e.paused,this.logEvent(t.pause))}onError(a){this.playerProperties.state!==e.error&&(this.playerProperties.state=e.error,this.playerProperties.error=a,this.logEvent(t.error))}onStop(){this.playerProperties.state!==e.idle&&(this.playerProperties.state=e.idle,this.logEvent(t.stopped),this.stopInterval(),this.processPlaySession())}onTextTrackChanged(a){this.playerProperties.state!==e.idle&&(this.playerProperties.textTrack=a,this.logEvent(t.textTrackChanged))}onAudioTrackChanged(a){this.playerProperties.state!==e.idle&&(this.playerProperties.audioTrack=a,this.logEvent(t.audioTrackChanged))}updateProperties(e){this.playerProperties={...this.playerProperties,...e}}startInterval(){this.stopInterval(),this.intervalHandle=setInterval((()=>{this.processPlaySession()}),3e4)}stopInterval(){this.intervalHandle&&clearInterval(this.intervalHandle)}processPlaySession(){this.playerLogProcessor.processPlaySession({...this.playSession},this.getTimeStamp()),this.playSession.eventStack=[]}logEvent(e){this.playSession&&this.playSession.eventStack.push({...this.playerProperties,eventType:e,timeStamp:this.getTimeStamp()})}reset(){this.playSession=null,this.playerProperties={state:e.idle,error:null,mediaDuration:0,playPosition:0,audioTrack:null,textTrack:null}}getTimeStamp(){return Date.now()-(this.playSession?this.playSession.localTimeDelta:0)}}const p=videojs.getComponent("playbackRateMenuButton");class h extends p{constructor(e,t){super(e)}createEl(){const e=super.createEl();return e.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="vjs-playback-rate-svg">\n            <path d="M0 0h24v24H0z" fill="none"/>\n            <path class="vjs-custom-svg-color" d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>',e}}const u=videojs.getComponent("audioTrackButton"),d=videojs.getComponent("menuItem");class y extends d{constructor(e,t){const a=t.track,s=e.audioTracks();t.label=function(e){const t=e&&3===e.length?function(e){const t={AFG:"AF",ALA:"AX",ALB:"AL",DZA:"DZ",ASM:"AS",AND:"AD",AGO:"AO",AIA:"AI",ATA:"AQ",ATG:"AG",ARG:"AR",ARM:"AM",ABW:"AW",AUS:"AU",AUT:"AT",AZE:"AZ",BHS:"BS",BHR:"BH",BGD:"BD",BRB:"BB",BLR:"BY",BEL:"BE",BLZ:"BZ",BEN:"BJ",BMU:"BM",BTN:"BT",BOL:"BO",BES:"BQ",BIH:"BA",BWA:"BW",BVT:"BV",BRA:"BR",VGB:"VG",IOT:"IO",BRN:"BN",BGR:"BG",BFA:"BF",BDI:"BI",KHM:"KH",CMR:"CM",CAN:"CA",CPV:"CV",CYM:"KY",CAF:"CF",TCD:"TD",CHL:"CL",CHN:"CN",HKG:"HK",MAC:"MO",CXR:"CX",CCK:"CC",COL:"CO",COM:"KM",COG:"CG",COD:"CD",COK:"CK",CRI:"CR",CIV:"CI",HRV:"HR",CUB:"CU",CUW:"CW",CYP:"CY",CZE:"CZ",DNK:"DK",DJI:"DJ",DMA:"DM",DOM:"DO",ECU:"EC",EGY:"EG",SLV:"SV",GNQ:"GQ",ERI:"ER",EST:"EE",ETH:"ET",FLK:"FK",FRO:"FO",FJI:"FJ",FIN:"FI",FRA:"FR",GUF:"GF",PYF:"PF",ATF:"TF",GAB:"GA",GMB:"GM",GEO:"GE",DEU:"DE",GHA:"GH",GIB:"GI",GRC:"GR",GRL:"GL",GRD:"GD",GLP:"GP",GUM:"GU",GTM:"GT",GGY:"GG",GIN:"GN",GNB:"GW",GUY:"GY",HTI:"HT",HMD:"HM",VAT:"VA",HND:"HN",HUN:"HU",ISL:"IS",IND:"IN",IDN:"ID",IRN:"IR",IRQ:"IQ",IRL:"IE",IMN:"IM",ISR:"IL",ITA:"IT",JAM:"JM",JPN:"JP",JEY:"JE",JOR:"JO",KAZ:"KZ",KEN:"KE",KIR:"KI",PRK:"KP",KOR:"KR",KWT:"KW",KGZ:"KG",LAO:"LA",LVA:"LV",LBN:"LB",LSO:"LS",LBR:"LR",LBY:"LY",LIE:"LI",LTU:"LT",LUX:"LU",MKD:"MK",MDG:"MG",MWI:"MW",MYS:"MY",MDV:"MV",MLI:"ML",MLT:"MT",MHL:"MH",MTQ:"MQ",MRT:"MR",MUS:"MU",MYT:"YT",MEX:"MX",FSM:"FM",MDA:"MD",MCO:"MC",MNG:"MN",MNE:"ME",MSR:"MS",MAR:"MA",MOZ:"MZ",MMR:"MM",NAM:"NA",NRU:"NR",NPL:"NP",NLD:"NL",ANT:"AN",NCL:"NC",NZL:"NZ",NIC:"NI",NER:"NE",NGA:"NG",NIU:"NU",NFK:"NF",MNP:"MP",NOR:"NO",OMN:"OM",PAK:"PK",PLW:"PW",PSE:"PS",PAN:"PA",PNG:"PG",PRY:"PY",PER:"PE",PHL:"PH",PCN:"PN",POL:"PL",PRT:"PT",PRI:"PR",QAT:"QA",REU:"RE",ROU:"RO",RUS:"RU",RWA:"RW",BLM:"BL",SHN:"SH",KNA:"KN",LCA:"LC",MAF:"MF",SPM:"PM",VCT:"VC",WSM:"WS",SMR:"SM",STP:"ST",SAU:"SA",SEN:"SN",SRB:"RS",SYC:"SC",SLE:"SL",SGP:"SG",SXM:"SX",SVK:"SK",SVN:"SI",SLB:"SB",SOM:"SO",ZAF:"ZA",SGS:"GS",SSD:"SS",ESP:"ES",LKA:"LK",SDN:"SD",SUR:"SR",SJM:"SJ",SWZ:"SZ",SWE:"SE",CHE:"CH",SYR:"SY",TWN:"TW",TJK:"TJ",TZA:"TZ",THA:"TH",TLS:"TL",TGO:"TG",TKL:"TK",TON:"TO",TTO:"TT",TUN:"TN",TUR:"TR",TKM:"TM",TCA:"TC",TUV:"TV",UGA:"UG",UKR:"UA",ARE:"AE",GBR:"GB",USA:"US",UMI:"UM",URY:"UY",UZB:"UZ",VUT:"VU",VEN:"VE",VNM:"VN",VIR:"VI",WLF:"WF",ESH:"EH",YEM:"YE",ZMB:"ZM",ZWE:"ZW",XKX:"XK"};return e&&3===e.length?t[e=e.toUpperCase()]?t[e].toLowerCase():e.substr(0,2).toLowerCase():(""+e).toLowerCase()}(e):e,a={ab:"аҧсуа",aa:"Afaraf",af:"Afrikaans",ak:"Akan",sq:"Shqip",am:"አማርኛ",ar:"العربية",an:"Aragonés",hy:"Հայերեն",as:"অসমীয়া",av:"авар мацӀ, магӀарул мацӀ",ae:"avesta",ay:"aymar aru",az:"azərbaycan dili",bm:"bamanankan",ba:"башҡорт теле",eu:"euskara, euskera",be:"Беларуская",bn:"বাংলা",bh:"भोजपुरी",bi:"Bislama",bs:"bosanski jezik",br:"brezhoneg",bg:"български език",my:"ဗမာစာ",ca:"Català",ch:"Chamoru",ce:"нохчийн мотт",ny:"chiCheŵa, chinyanja",zh:"中文 (Zhōngwén), 汉语, 漢語",cv:"чӑваш чӗлхи",kw:"Kernewek",co:"corsu, lingua corsa",cr:"ᓀᐦᐃᔭᐍᐏᐣ",hr:"hrvatski",cs:"čeština",da:"dansk",dv:"ދިވެހި",nl:"Nederlands",en:"English",eo:"Esperanto",et:"eesti",ee:"Eʋegbe",fo:"føroyskt",fj:"vosa Vakaviti",fi:"suomi",fr:"français",ff:"Fulfulde, Pulaar, Pular",gl:"Galego",ka:"ქართული",de:"Deutsch",el:"Ελληνικά",gn:"Avañeẽ",gu:"ગુજરાતી",ht:"Kreyòl ayisyen",ha:"Hausa, هَوُسَ",he:"עברית",hz:"Otjiherero",hi:"हिन्दी, हिंदी",ho:"Hiri Motu",hu:"Magyar",ia:"Interlingua",id:"Bahasa Indonesia",ie:"Interlingue",ga:"Gaeilge",ig:"Asụsụ Igbo",ik:"Iñupiaq",io:"Ido",is:"Íslenska",it:"Italiano",iu:"ᐃᓄᒃᑎᑐᑦ",ja:"日本語",jv:"basa Jawa",kl:"kalaallisut, kalaallit oqaasii",kn:"ಕನ್ನಡ",kr:"Kanuri",ks:"कश्मीरी, كشميري‎",kk:"Қазақ тілі",km:"ភាសាខ្មែរ",ki:"Gĩkũyũ",rw:"Ikinyarwanda",ky:"кыргыз тили",kv:"коми кыв",kg:"KiKongo",ko:"한국어 (韓國語), 조선말 (朝鮮語)",ku:"كوردی‎",kj:"Kuanyama",la:"latine",lb:"Lëtzebuergesch",lg:"Luganda",li:"Limburgs",ln:"Lingála",lo:"ພາສາລາວ",lt:"lietuvių kalba",lu:"Luba-Katanga",lv:"latviešu valoda",gv:"Gaelg, Gailck",mk:"македонски јазик",mg:"Malagasy fiteny",ms:"bahasa Melayu, بهاس ملايو‎",ml:"മലയാളം",mt:"Malti",mi:"te reo Māori",mr:"मराठी",mh:"Kajin M̧ajeļ",mn:"монгол",na:"Ekakairũ Naoero",nv:"Diné bizaad, Dinékʼehǰí",nb:"Norsk bokmål",nd:"isiNdebele",ne:"नेपाली",ng:"Owambo",nn:"Norsk nynorsk",no:"Norsk",ii:"ꆈꌠ꒿ Nuosuhxop",nr:"isiNdebele",oc:"Occitan",oj:"ᐊᓂᔑᓈᐯᒧᐎᓐ",cu:"ѩзыкъ словѣньскъ",om:"Afaan Oromoo",or:"ଓଡ଼ିଆ",os:"ирон æвзаг",pa:"ਪੰਜਾਬੀ, پنجابی‎",pi:"पाऴि",fa:"فارسی",pl:"polski",ps:"پښتو",pt:"Português",qu:"Runa Simi, Kichwa",rm:"rumantsch grischun",rn:"kiRundi",ro:"română",ru:"русский",sa:"संस्कृतम्",sc:"sardu",sd:"सिन्धी, سنڌي، سندھی‎",se:"Davvisámegiella",sm:"gagana faa Samoa",sg:"yângâ tî sängö",sr:"српски језик",gd:"Gàidhlig",sn:"chiShona",si:"සිංහල",sk:"slovenčina",sl:"slovenščina",so:"Soomaaliga, af Soomaali",st:"Sesotho",es:"español",su:"Basa Sunda",sw:"Kiswahili",ss:"SiSwati",sv:"svenska",ta:"தமிழ்",te:"తెలుగు",tg:"تاجیکی‎",th:"ไทย",ti:"ትግርኛ",bo:"བོད་ཡིག",tk:"Türkmen",tl:"Wikang Tagalog",tn:"Setswana",to:"faka Tonga",tr:"Türkçe",ts:"Xitsonga",tt:"تاتارچا‎",tw:"Twi",ty:"Reo Tahiti",ug:"ئۇيغۇرچە‎",uk:"українська",ur:"اردو",uz:"zbek, Ўзбек, أۇزبېك‎",ve:"Tshivenḓa",vi:"Tiếng Việt",vo:"Volapük",wa:"Walon",cy:"Cymraeg",wo:"Wollof",fy:"Frysk",xh:"isiXhosa",yi:"ייִדיש",yo:"Yorùbá",za:"Saɯ cueŋƅ, Saw cuengh",mis:"uncoded languages",mul:"multiple languages",und:"undetermined",zxx:"no linguistic content/not applicable"};return t&&a[t]?a[t]:t}(a.language||a.label)||"Unknown",t.selected=a.enabled,super(e,t),this.track=a,this.addClass(`vjs-${a.kind}-menu-item`);const r=(...e)=>{this.handleTracksChange.apply(this,e)};s.addEventListener("change",r),this.on("dispose",(()=>{s.removeEventListener("change",r)}))}createEl(e,t,a){const s=super.createEl(e,t,a),r=s.querySelector(".vjs-menu-item-text");return"main-desc"===this.options_.track.kind&&(r.appendChild(super.createEl("span",{className:"vjs-icon-placeholder"},{"aria-hidden":!0})),r.appendChild(super.createEl("span",{className:"vjs-control-text",textContent:" "+this.localize("Descriptions")}))),s}handleClick(e){if(super.handleClick(e),this.track.enabled=!0,this.player_.tech_.featuresNativeAudioTracks){const e=this.player_.audioTracks();for(let t=0;t<e.length;t++){const a=e[t];a!==this.track&&(a.enabled=a===this.track)}}}handleTracksChange(e){this.selected(this.track.enabled)}}class m extends u{constructor(e,t){super(e)}createItems(e=[]){this.hideThreshold_=1;const t=this.player_.audioTracks();for(let a=0;a<t.length;a++){const s=t[a];e.push(new y(this.player_,{track:s,selectable:!0,multiSelectable:!1}))}return e}}const g=videojs.getComponent("PlayToggle");function k(e,t){const a=e.currentTime(),s=e.liveTracker,r=s&&s.isLive()?s.seekableEnd():e.duration();let i=a+t;i>r?i=r:i<0&&(i=0),e.currentTime(i)}class T{constructor(e,t){this.player=null,this.playerLoggerService=new c(e,t),videojs.registerComponent("customAudioTrackButton",m),videojs.registerComponent("customPlaybackRateMenuButton",h)}init(e){this.destroy();const t=e.selector instanceof Element?e.selector:document.querySelector(e.selector);if(!t)throw Error("Invalid selector or element for player");this.playerLoggerService.init();const a=document.createElement("video");a.setAttribute("class",["video-js","vjs-default-skin"].join(" ")),a.setAttribute("tabIndex","0"),a.setAttribute("width","100%"),a.setAttribute("height","100%"),t.appendChild(a);const s={fluid:!0,responsive:!0,controls:!0,controlBar:{pictureInPictureToggle:!1,currentTimeDisplay:!0,durationDisplay:!0,timeDivider:!1,volumePanel:{inline:!1},children:["playToggle","currentTimeDisplay","progressControl","durationDisplay","customPlaybackRateMenuButton","subtitlesButton","customAudioTrackButton","volumePanel","fullscreenToggle"]},userActions:{hotkeys:(r={backward:-30,forward:30},function(e){switch(console.log("hot",e),e.key){case" ":g.prototype.handleClick.call(this,e);break;case"ArrowLeft":k(this,r.backward);break;case"ArrowRight":k(this,r.forward)}})},aspectRatio:"16:9",html5:{vhs:{overrideNative:!o()}},...e.options};var r;this.player=videojs(a,s),this.player.eme(),this.bindEvents()}play(e,t){this.firstPlayingEvent=!0,(!this.player||this.player&&this.player.currentSrc())&&(this.destroy(),this.init(t)),this.articlePlayConfig=e,this.playerLoggerService.onStart(e.pulseToken,a.default,e.localTimeDelta,!0);const s=e.entitlements.filter((e=>"application/vnd.apple.mpegurl"===e.type)),r=o()&&s.length>0,i=e.entitlements.map((e=>{const t=function(e){let t=null,a={};if(e.protectionInfo)switch(e.type){case"application/dash+xml":t=e.protectionInfo.find((e=>"Widevine"===e.type)),t&&(a={keySystems:{"com.widevine.alpha":t.keyDeliveryUrl},emeHeaders:{Authorization:t.authenticationToken}});break;case"application/vnd.ms-sstr+xml":t=e.protectionInfo.find((e=>"PlayReady"===e.type)),t&&(a={keySystems:{"com.microsoft.playready":t.keyDeliveryUrl},emeHeaders:{Authorization:t.authenticationToken}});break;case"application/vnd.apple.mpegurl":t=e.protectionInfo.find((e=>"FairPlay"===e.type)),t&&(a={keySystems:{"com.apple.fps.1_0":{certificateUri:t.certificateUrl,getContentId:function(){return function(e){let t=document.createElement("a");return t.href=e,t.hostname}(t.keyDeliveryUrl)},getLicense:function(e,a,s,r){const i="spc="+function(e){let t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",a=[];for(let s=0;s<e.byteLength;){let r=e[s++];a.push(t.charAt(r>>2)),r=(3&r)<<4,s<e.byteLength?(a.push(t.charAt(r|e[s]>>4)),r=(15&e[s++])<<2,s<e.byteLength?(a.push(t.charAt(r|e[s]>>6)),a.push(t.charAt(63&e[s++]))):(a.push(t.charAt(r)),a.push("="))):(a.push(t.charAt(r)),a.push("=="))}return a.join("")}(s)+"&assetId="+encodeURIComponent(a);videojs.xhr({uri:t.keyDeliveryUrl,method:"post",headers:{"Content-type":"application/x-www-form-urlencoded",Authorization:t.authenticationToken},body:i,responseType:"arraybuffer"},videojs.xhr.httpHandler((function(e,t){r(null,function(e){let t=String.fromCharCode.apply(null,new Uint8Array(e)).trim(),a=t.indexOf("<ckc>"),s=t.indexOf("</ckc>");if(-1===a||-1===s)throw Error("License data format not as expected, missing or misplaced <ckc> tag");return a+=5,t=t.substr(a,s-a),function(e){let t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",a=new Uint8Array(new ArrayBuffer(3*e.length/4+4)),s=0;for(let r=0;r<e.length;){let i=t.indexOf(e.charAt(r)),n=t.indexOf(e.charAt(r+1));if(a[s++]=i<<2|n>>4,"="!==e.charAt(r+2)){let i=t.indexOf(e.charAt(r+2));if(a[s++]=n<<4|i>>2,"="!==e.charAt(r+3)){let n=t.indexOf(e.charAt(r+3));a[s++]=i<<6|n}}r+=4}return new Uint8Array(a.buffer,0,s)}(t)}(t))}),!0))}}}})}return a}(e);return{src:e.src,type:e.type,...t}})).filter((e=>"application/vnd.apple.mpegurl"===e.type&&r||"application/vnd.apple.mpegurl"!==e.type&&!r));this.player.aspectRatio(e.aspectRatio),this.player.src(i),t.fullscreen&&this.player.requestFullscreen(),r||e.subtitles.forEach((t=>{this.player.addRemoteTextTrack({kind:t.kind,src:t.src,srclang:t.srclang,label:t.label,enabled:t.srclang===e.subtitleLocale})}))}setPoster(e){this.player.poster(e)}destroy(){this.player&&(!1===this.player.ended()&&(this.player.pause(),this.playerLoggerService.onStop()),this.player.dispose()),this.playerLoggerService.destroy(),this.player=null}getPlayer(){return this.player}bindEvents(){this.player.on("error",(()=>{this.playerLoggerService.onError(JSON.stringify(this.player.error()))})),this.player.on("playing",(()=>{this.firstPlayingEvent&&(this.firstPlayingEvent=!1,this.articlePlayConfig.currentTime>0&&this.player.currentTime(this.articlePlayConfig.currentTime)),this.checkSelectedTracks(),this.playerLoggerService.onPlaying()})),this.player.on("pause",(()=>{this.checkSelectedTracks(),this.player.paused()&&!this.player.ended()&&this.playerLoggerService.onPause()})),this.player.on("ended",(()=>{this.checkSelectedTracks(),this.playerLoggerService.onStop()})),this.player.on("timeupdate",(()=>{this.checkSelectedTracks(),this.playerLoggerService.onCurrentTimeUpdated(this.player.currentTime()||0)})),this.player.on("durationchange",(()=>{this.checkSelectedTracks(),this.playerLoggerService.onDurationUpdated(this.player.duration())})),this.player.on("loadedmetadata",(()=>{const e=this.player.audioTracks();e&&e.length>0?(this.setDefaultAudioTrack(),this.setDefaultTextTrack(),this.metadataLoaded=!0):setTimeout((()=>{this.setDefaultAudioTrack(),this.setDefaultTextTrack(),this.metadataLoaded=!0}),1e3)}))}checkSelectedTracks(){if(!this.metadataLoaded)return!1;let e="",t="";const a=this.player.textTracks();for(let e=0;e<a.length;e++)"showing"===a[e].mode&&"subtitles"===a[e].kind&&(t=a[e].language);const s=this.player.audioTracks();for(let t=0;t<s.length;t++)if(s[t].enabled){e=s[t].language;break}this.playerLoggerService.updateProperties({textTrack:t,audioTrack:e}),null!==this.currentTextTrack&&this.currentTextTrack!==t&&this.playerLoggerService.onTextTrackChanged(t),this.currentTextTrack=t,null!==this.currentAudioTrack&&this.currentAudioTrack!==e&&this.playerLoggerService.onAudioTrackChanged(e),this.currentAudioTrack=e}setDefaultTextTrack(){if(this.articlePlayConfig.subtitleLocale){const e=this.player.textTracks();for(let t=0;t<e.length;t++)"disabled"!==e[t].mode&&(e[t].mode="disabled");for(let t=0;t<e.length;t++)if(e[t].language===this.articlePlayConfig.subtitleLocale.toLowerCase()&&"subtitles"===e[t].kind){e[t].mode="showing";break}}}setDefaultAudioTrack(){if(this.articlePlayConfig.audioLocale){const e=this.player.audioTracks();for(let t=0;t<e.length;t++)if(this.articlePlayConfig.audioLocale&&e[t].language===this.articlePlayConfig.audioLocale.toLowerCase()||""===this.articlePlayConfig.audioLocale&&0===t){e[t].enabled=!0;break}}}}var v;function f(e){return{type:e.type,url:e.url,baseUrl:e.base_url,fileName:e.file_name}}function C(e){switch(e){case 0:return v.offlineError;case 401:case 403:return v.notAuthenticated;case 402:return v.needEntitlement;case 404:return v.noPlayableAsset;case 429:return v.maxConcurrentStreamNumberError;default:return v.serverError}}!function(e){e.noPlayableAsset="noPlayableAsset",e.notAuthenticated="notAuthenticated",e.needEntitlement="needEntitlement",e.serverError="serverError",e.offlineError="offlineError",e.maxConcurrentStreamNumberError="maxConcurrentStreamNumberError"}(v||(v={}));class P{constructor(){this.castContext=null,this.castPlayer=null,this.castPlayerController=null}init(e){return new Promise(((t,a)=>{if(e){window.__onGCastApiAvailable=a=>{a&&cast&&cast.framework&&(this.initializeCastApi(e),setTimeout((()=>{t()}),1e3))};const a=document.createElement("script");a.src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1",document.head.appendChild(a)}else a("Chromecast Receiver Application Id is missing")}))}initializeCastApi(e){cast.framework.CastContext.getInstance().setOptions({receiverApplicationId:e,autoJoinPolicy:chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED}),this.castContext=cast.framework.CastContext.getInstance(),this.castPlayer=new cast.framework.RemotePlayer,this.castPlayerController=new cast.framework.RemotePlayerController(this.castPlayer)}getCastMediaInfo(e,t){if(e&&e.entitlements&&e.entitlements.length>0){const a=e.subtitles.map(((e,t)=>{const a=t+1,s=new chrome.cast.media.Track(a,chrome.cast.media.TrackType.TEXT);return s.trackContentId=e.src,s.trackContentType="text/vtt",s.subtype=chrome.cast.media.TextTrackType.SUBTITLES,s.name=e.label,s.language=e.srclang,s.customData=null,s}));let s=null;const r=["application/vnd.ms-sstr+xml","video/mp4"],i=e.entitlements.find((e=>!!r.includes(e.type)&&(s=e.type,!0)));let n=null;if(i){i.protectionInfo&&(n=i.protectionInfo.find((e=>"PlayReady"===e.type)));const r=n?n.authenticationToken:null,o=new chrome.cast.media.MediaInfo(i.src,s);o.streamType=chrome.cast.media.StreamType.BUFFERED,o.metadata=new chrome.cast.media.GenericMediaMetadata,o.metadata.metadataType=chrome.cast.media.MetadataType.GENERIC,o.metadata.title=function(e){return function(e,t){const a=e.find((e=>"title"===e.key));return a?a.value:""}(e.metas)||e.name}(t),o.tracks=a;const l=r?{...this.getLicenseUrlFromSrc(n.keyDeliveryUrl,r)}:{},c=e.audioLocale?{preferredAudioLocale:e.audioLocale}:{};return o.customData={...l,...c,pulseToken:e.pulseToken},o}}return null}getLicenseUrlFromSrc(e,t){return t?{licenseUrl:(e.includes("?")?`${e}&token=`:`${e}?token=`)+encodeURIComponent(t),token:t}:{}}castVideo(e,t,a){if(this.isConnected()){const s=this.castContext.getCurrentSession(),r=this.getCastMediaInfo(e,t);if(r){const t=new chrome.cast.media.LoadRequest(r);if(t.currentTime=a?e.currentTime:0,e.subtitleLocale){const a=r.tracks.find((t=>t.language===e.subtitleLocale));a&&(t.activeTrackIds=[a.trackId])}return s.loadMedia(t)}throw{message:"Unexpected manifest format in articlePlayConfig"}}}isConnected(){return this.castPlayer&&this.castPlayer.isConnected}stopCasting(){const e=cast.framework.CastContext.getInstance().getCurrentSession();e&&e.endSession(!0)}getCastPlayer(){return this.castPlayer}getCastPlayerController(){return this.castPlayerController}}function S(e,t,a,s){return fetch(e,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",...s?{Authorization:"Bearer "+s}:{}},body:JSON.stringify({query:t,variables:a})}).then((e=>e.json()))}class A{constructor(e,t){this.apiFetchUrl=`${e}/graphql/${t}`,this.token=null}setToken(e){this.token=e}getArticleAssetPlayConfig(e,t,a){return S(this.apiFetchUrl,"\n    mutation ArticleAssetPlay($articleId: Int, $assetId: Int, $protocols: [ArticlePlayProtocolEnum]) {\n        ArticleAssetPlay(article_id: $articleId, asset_id: $assetId, protocols: $protocols) {\n            article_id\n            asset_id\n            entitlements {\n                mime_type\n                protocol\n                manifest\n                token\n                encryption_type\n                key_delivery_url\n            }\n            subtitles {\n                url\n                locale\n                locale_label\n            }\n            pulse_token\n            appa\n            appr\n            fairplay_certificate_url\n            user_subtitle_locale\n            user_audio_locale\n            aspect_ratio\n            issued_at\n        }\n    }\n",{articleId:e,assetId:t,protocols:["dash","mss","hls"]},this.token).then((e=>{if(!e||!e.data||e.errors){const{message:t,code:a}=e.errors[0];throw{message:t,code:a}}return function(e,t){const a=Date.parse(e.issued_at),s=[],r=e.entitlements.find((e=>"fps"===e.encryption_type))?e.entitlements.filter((e=>"aes"!==e.encryption_type)):e.entitlements,i=r.find((e=>!!e.token&&"cenc"===e.encryption_type&&0===e.protocol.indexOf("dash"))),n=r.find((e=>!!e.token&&"cenc"===e.encryption_type&&0===e.protocol.indexOf("mss")));r.forEach((t=>{const a={src:t.manifest,type:t.mime_type,protectionInfo:null};t.token&&(a.protectionInfo=[],"cenc"===t.encryption_type?(i&&a.protectionInfo.push({type:"Widevine",authenticationToken:"Bearer "+i.token,keyDeliveryUrl:i.key_delivery_url}),n&&a.protectionInfo.push({type:"PlayReady",authenticationToken:"Bearer="+n.token,keyDeliveryUrl:n.key_delivery_url})):"fps"===t.encryption_type&&(a.protectionInfo=[{type:"FairPlay",authenticationToken:"Bearer "+t.token,certificateUrl:e.fairplay_certificate_url,keyDeliveryUrl:t.key_delivery_url}])),s.push(a)}));const o=e.subtitles.map((e=>({src:e.url,srclang:e.locale,kind:"subtitles",label:e.locale_label})));return{entitlements:s,subtitles:o,pulseToken:e.pulse_token,currentTime:t?e.appa:0,subtitleLocale:e.user_subtitle_locale,audioLocale:e.user_audio_locale,localTimeDelta:isNaN(a)?0:Date.now()-a,aspectRatio:e.aspect_ratio.replace("x",":")}}(e.data.ArticleAssetPlay,a)}))}getArticle(e){return S(this.apiFetchUrl,"\n    query Article($articleId: Int!) {\n        Article(id: $articleId) {\n            id\n            name\n            metas {\n                key\n                value\n            }\n            assets {\n                id\n                duration\n                linked_type\n                accessibility\n            }\n            posters {\n                type\n                url\n                title\n                base_url\n                file_name\n            }\n            images {\n                type\n                url\n                title\n                base_url\n                file_name\n            }\n        }\n    }\n",{articleId:e},this.token).then((e=>{if(!e||!e.data||e.errors){const{message:t,code:a}=e.errors[0];throw{message:t,code:a}}return{name:(t=e.data.Article).name,metas:t.metas,posters:t.posters.map(f),images:t.images.map(f)};var t}))}}class E{constructor(e){this.projectId=e.projectId,this.apiBaseUrl=e.apiBaseUrl.replace(/\/*$/,""),this.chromecastReceiverAppId=e.chromecastReceiverAppId?e.chromecastReceiverAppId:null,this.apiService=new A(this.apiBaseUrl,this.projectId),this.videoPlayer=new T(this.apiBaseUrl,this.projectId),this.castSender=new P}initVideoPlayer(e){this.videoPlayer.init(e)}setVideoPlayerPoster(e){this.videoPlayer.setPoster(e)}setVideoPlayerPosterFromArticle(e,t){return this.apiService.getArticle(e).then((e=>{this.videoPlayer.setPoster(function(e,t){if(e){const{width:a,height:s}=t;return`${e.baseUrl}/${a}x${s}/${e.fileName}`}return""}(function(e){return e.posters.length>0?e.posters[0]:this.article.length>0?e.images[0]:null}(e),t))}))}play(e){return e.articleId?e.assetId?(this.apiService.setToken(e.token?e.token:null),this.apiService.getArticleAssetPlayConfig(e.articleId,e.assetId,e.continueFromPreviousPosition).then((t=>(this.playVideo(t,e),t))).catch((e=>{throw console.log(C(e.code)),e}))):Promise.reject("assetId property is missing"):Promise.reject("articleId property is missing")}destroy(){this.videoPlayer.destroy()}playVideo(e,t){this.videoPlayer.play(e,t)}getVideoPlayer(){this.videoPlayer.getPlayer()}initChromecast(){return this.chromecastReceiverAppId?this.castSender.init(this.chromecastReceiverAppId):Promise.reject("No Chromecast receiver app id")}appendChromecastButton(e){const t=e instanceof Element?e:document.querySelector(e),a=document.createElement("google-cast-launcher");t.appendChild(a)}castVideo({articleId:e,assetId:t,token:a,continueFromPreviousPosition:s}){return e?t?(this.apiService.setToken(a),Promise.all([this.apiService.getArticleAssetPlayConfig(e,t,s),this.apiService.getArticle(e)]).then((([e,t])=>(this.castSender.castVideo(e,t,s),e))).catch((e=>{throw console.log(C(e.code)),e}))):Promise.reject("assetId property is missing"):Promise.reject("articleId property is missing")}getCastPlayer(){return this.castSender.getCastPlayer()}getCastPlayerController(){return this.castSender.getCastPlayerController()}isConnected(){return this.castSender.isConnected()}stopCasting(){this.castSender.stopCasting()}}class I{constructor(e,t,a){this.player=e,this.playerController=t,this.controlInitialized=!1,this.totalDuration=e.duration||0,this.currentTime=e.currentTime||0,this.currentStatus=e.playerState,this.createChromecastControlsTemplate(a),this.bindEvents(),this.setPlayButtonClass(),this.bindEventsToControls(),this.setProgressBarValues(),this.setTitle()}bindEvents(){this.playerController.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED,(()=>{this.rootElement&&this.player.mediaInfo&&(this.renderTracks(),this.renderTracksButton(),this.setTitle())})),this.playerController.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,(e=>{this.rootElement&&(this.currentTime=e.value,this.totalDuration=this.player.duration,this.setProgressBarValues())})),this.playerController.addEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,(e=>{this.rootElement&&(this.currentStatus=e.value,this.checkChromecastContainerVisibility(),this.setPlayButtonClass(),this.setProgressBarValues())})),this.checkChromecastContainerVisibility()}createChromecastControlsTemplate(e){const t=e?document.querySelector(e):document.body;t.insertAdjacentHTML("beforeend",'\n            <div class="chromecast-controls">\n               <div class="chromecast-controls__title"></div>\n               <div class="chromecast-controls__progress-bar">\n                 <div class="chromecast-controls__progress-bar__current"></div>\n                 <input type="range"\n                        value="0"\n                        class="chromecast-controls__progress-bar__slider" \n                        min="0"\n                        max="100"/>\n                 <div class="chromecast-controls__progress-bar__total"></div>\n               </div>\n              <div class="chromecast-controls__buttons">\n                <button class="control-button button__play play-pause-button" type="button"></button>\n                <button class="control-button button__stop" type="button"></button>\n                <div class="buttons-container tracks-button-container" style="display: none">\n                  <button class="control-button button__audio-tracks" type="button"></button>\n                  <div class="chromecast-controls__subtitles" style="display: none">\n                      <div class="chromecast-controls__subtitles__close-icon">&#215;</div>\n                      <div class="container-wrapper container-wrapper_audio-tracks">\n                        <div class="list-title">Audio tracks</div>\n                      </div>\n                      <div class="container-wrapper container-wrapper_text-tracks">\n                        <div class="list-title">Text tracks</div>\n                      </div>\n                  </div>\n                </div>\n               </div>\n            </div>\n        '),this.rootElement=t.querySelector(".chromecast-controls"),this.rootElement.querySelector(".button__audio-tracks").addEventListener("click",(()=>this.toggleTracksDialogue())),this.rootElement.querySelector(".chromecast-controls__subtitles__close-icon").addEventListener("click",(()=>this.toggleTracksDialogue())),this.rootElement.querySelector(".chromecast-controls__progress-bar__slider").addEventListener("input",(e=>{this.seek(e.target.value)}))}setPlayButtonClass(){const e=this.getElement(".play-pause-button");this.currentStatus===chrome.cast.media.PlayerState.PAUSED?e.classList.replace("button__pause","button__play"):e.classList.replace("button__play","button__pause")}bindEventsToControls(){const e=this.getElement(".play-pause-button"),t=this.getElement(".button__stop");this.controlInitialized||(e.addEventListener("click",(()=>this.playPause())),t.addEventListener("click",(()=>this.stop())),this.controlInitialized=!0)}renderTracksButton(){const e=this.getElement(".tracks-button-container"),t=cast.framework.CastContext.getInstance().getCurrentSession().getMediaSession();let a=[],s=[];this.player.mediaInfo&&this.player.mediaInfo.tracks&&t&&(a=this.getTracksByType("AUDIO"),s=this.getTracksByType("TEXT")),a.length||s.length?e.style.display="unset":e.style.display="none"}renderTracks(){this.removeTracks();const e=this.getElement(".container-wrapper_audio-tracks"),t=this.getElement(".container-wrapper_text-tracks"),a=cast.framework.CastContext.getInstance().getCurrentSession().getMediaSession();let s=[],r=[];this.player.mediaInfo&&this.player.mediaInfo.tracks&&a&&(s=this.getTracksByType("AUDIO"),r=this.getTracksByType("TEXT")),s.length&&e.appendChild(this.getTracksList(s,"AUDIO")),r.length&&t.appendChild(this.getTracksList(r,"TEXT"))}removeTracks(){const e=this.rootElement.getElementsByClassName("list-container");e.length&&Array.from(e).forEach((e=>{e.remove()}))}toggleTracksDialogue(){const e=this.getElement(".chromecast-controls__subtitles");"none"===e.style.display?(this.renderTracks(),e.style.display="unset"):(e.style.display="none",this.removeTracks())}getTracksList(e,t){const a=document.createElement("ul");return a.classList.add("list-container"),a.addEventListener("click",(e=>this.setActiveTrack(e,"AUDIO"===t?"AUDIO":"TEXT"))),e.forEach((e=>{const t=document.createElement("li");t.classList.add("list-item"),e.active?t.classList.add("active"):t.classList.remove("active"),t.innerText=e.locale,t.value=e.id,a.appendChild(t)})),a}getActiveTracksByType(e){return this.getTracksByType(e).filter((e=>e.active)).map((e=>e.id))}getTracksByType(e){const t=cast.framework.CastContext.getInstance().getCurrentSession().getMediaSession();return this.player.mediaInfo.tracks.filter((t=>t.type===e)).map((e=>({id:e.trackId,locale:e.language,active:t.activeTrackIds&&-1!==t.activeTrackIds.indexOf(e.trackId)})))}setTitle(){this.player.mediaInfo&&(this.getElement(".chromecast-controls__title").innerText=this.player.mediaInfo.metadata.title)}getTransformedDurationValue(e){const t=Math.floor(e/3600),a=Math.floor((e-3600*t)/60),s=Math.round(e-3600*t-60*a);let r="";return e||0!==e?(t>0&&(r=t+":",a<10&&(r+="0")),r+=a+":",s<10&&(r+="0"),r+s):"-"}setProgressBarValues(){if(this.rootElement){const e=this.getElement(".chromecast-controls__progress-bar__current"),t=this.getElement(".chromecast-controls__progress-bar__total"),a=this.getElement(".chromecast-controls__progress-bar__slider");e.innerText=this.getTransformedDurationValue(this.currentTime),t.innerText=this.getTransformedDurationValue(this.totalDuration),a.max=this.totalDuration,a.value=this.currentTime}}checkChromecastContainerVisibility(){this.currentStatus===chrome.cast.media.PlayerState.IDLE?this.rootElement.style.display="none":this.rootElement.style.display="block"}playPause(){this.player&&this.player.isConnected&&this.playerController.playOrPause()}seek(e){this.player&&this.player.isConnected&&(this.player.currentTime=e,this.playerController.seek())}stop(){this.player&&this.player.isConnected&&this.playerController.stop()}setActiveTrack(e,t){if(e.target instanceof HTMLLIElement&&"LI"===e.target.nodeName){e.stopPropagation();const a=e.target.value,s=this.getActiveTracksByType("AUDIO"===t?"TEXT":"AUDIO");a>0&&-1===s.indexOf(a)&&s.push(a),this.setActiveTracks(s)}}setActiveTracks(e){if(this.player&&this.player.isConnected){const t=cast.framework.CastContext.getInstance().getCurrentSession().getMediaSession(),a=new chrome.cast.media.EditTracksInfoRequest(e);t.editTracksInfo(a,(()=>{this.toggleTracksDialogue()}),(e=>console.error("ChromeCast",e)))}}getElement(e){return this.rootElement.querySelector(e)}}var b=n.Af,_=n.Cz,L=n.Yn,M=n.Y7;export{b as ChromecastControls,_ as ChromecastSender,L as EmbedPlayer,M as VideoPlayer};
//# sourceMappingURL=bundle.js.map