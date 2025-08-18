import { FontAwesome, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AdSenseInterstitialModal from './Adsense.js';

// // Fallback languages array in case the import fails
// const defaultLanguages = [
//   "English (eng)",
//   "Spanish (spa)",
//   "French (fra)",
//   "German (deu)",
//   "Italian (ita)",
//   "Portuguese (por)",
//   "Russian (rus)",
//   "Chinese (cmn)",
//   "Japanese (jpn)",
//   "Korean (kor)"
// ];

// Try to import languages, fallback to default if it fails
// let languages;
// try {
//   languages = require('./languages').default || defaultLanguages;
// } catch (error) {
//   console.warn('Could not import languages file, using default languages');
//   languages = defaultLanguages;
// }

 const languages = [
    'Burmese (mya)', 'Mon (mnw)', 'Shan (shn)', 'English (eng)', 'Vietnamese (vie)', 'Thai (tha)', 'Thai, Northern (nod)', 'Indonesian (ind)', 'Khmer (khm)', 'Khmer, Northern (kxm)', 'Abidji (abi)', 'Aceh (ace)', 'Achagua (aca)', 'Achang (acn)', 'Achi (acr)', 'Acholi (ach)', 'Achuar-Shiwiar (acu)', 'Aché (guq)', 'Adele (ade)', 'Adioukrou (adj)', 'Agarabi (agd)', 'Aghul (agx)', 'Agutaynen (agn)', 'Ahanta (aha)', 'Akan (aka)', 'Akateko (knj)', 'Akawaio (ake)', 'Akeu (aeu)', 'Akha (ahk)', 'Akoose (bss)', 'Alangan (alj)', 'Albanian (sqi)', 'Altai, Southern (alt)', 'Alune (alp)', 'Alur (alz)', 'Amazigh (kab)', 'Ambai (amk)', 'Ambrym, North (mmg)', 'Amharic (amh)', 'Amis (ami)', 'Amuzgo, San Pedro Amuzgos (azg)', 'Angor (agg)', 'Anjam (boj)', 'Anufo (cko)', 'Anyin (any)', 'Arabela (arl)', 'Arabic (ara)', 'Aralle-Tabulahan (atq)', 'Aringa (luc)', 'Armenian, Western (hyw)', 'Arop-Lokep (apr)', 'Arosi (aia)', 'Aruamu (msy)', 'Asháninka (cni)', 'Ashéninka, Pajonal (cjo)', 'Ashéninka, Pichis (cpu)', 'Ashéninka, Ucayali-Yurúa (cpb)', 'Assamese (asm)', 'Asu (asa)', 'Ateso (teo)', 'Attié (ati)', 'Aukan (djk)', 'Avar (ava)', 'Avatime (avn)', 'Avokaya (avu)', 'Awa (awb)', 'Awa-Cuaiquer (kwi)', 'Awadhi (awa)', 'Awajún (agr)', 'Awakateko (agu)', 'Aymara, Central (ayr)', 'Ayoreo (ayo)', 'Ayta, Abellen (abp)', 'Ayta, Mag-Indi (blx)', 'Ayta, Mag-antsi (sgb)', 'Azerbaijani, North (azj-script_cyrillic)', 'Azerbaijani, North (azj-script_latin)', 'Azerbaijani, South (azb)', 'Baatonum (bba)', 'Bada (bhz)', 'Baelelea (bvc)', 'Bagheli (bfy)', 'Bagri (bgq)', 'Bahnar (bdq)', 'Baka (bdh)', 'Bakhtiâri (bqi)', 'Bakwé (bjw)', 'Balantak (blz)', 'Bali (ban)', 'Balochi, Southern (bcc-script_latin)', 'Balochi, Southern (bcc-script_arabic)', 'Bamanankan (bam)', 'Bambam (ptu)', 'Bana (bcw)', 'Bandial (bqj)', 'Bantoanon (bno)', 'Barai (bbb)', 'Bari (bfa)', 'Baruga (bjz)', 'Bashkort (bak)', 'Basque (eus)', 'Bassa (bsq)', 'Batak Angkola (akb)', 'Batak Dairi (btd)', 'Batak Karo (btx)', 'Batak Simalungun (bts)', 'Batak Toba (bbc)', 'Bauzi (bvz)', 'Bedjond (bjv)', 'Behoa (bep)', 'Bekwarra (bkv)', 'Belize English Creole (bzj)', 'Bemba (bem)', 'Benga (bng)', 'Bengali (ben)', 'Berom (bom)', 'Bete-Bendi (btt)', 'Bharia (bha)', 'Bhatri (bgw)', 'Bhattiyali (bht)', 'Biali (beh)', 'Bidayuh, Bau (sne)', 'Bikol, Buhi’non (ubl)', 'Bikol, Central (bcl)', 'Bimoba (bim)', 'Binukid (bkd)', 'Binumarien (bjr)', 'Birifor, Malba (bfo)', 'Birifor, Southern (biv)', 'Bisa (bib)', 'Bislama (bis)', 'Bisu (bzi)', 'Bisã (bqp)', 'Blaan, Koronadal (bpr)', 'Blaan, Sarangani (bps)', 'Bobo Madaré, Southern (bwq)', 'Bodo Parja (bdv)', 'Boko (bqc)', 'Bokobaru (bus)', 'Bola (bnp)', 'Bomu (bmq)', 'Bonggi (bdg)', 'Bora (boa)', 'Borong (ksr)', 'Borôro (bor)', 'Bru, Eastern (bru)', 'Buamu (box)', 'Buang, Mapos (bzh)', 'Bughotu (bgt)', 'Buglere (sab)', 'Bulgarian (bul)', 'Buli (bwu)', 'Bum (bmv)', 'Bwanabwana (tte)', 'Cabécar (cjp)', 'Cacua (cbv)', 'Capanahua (kaq)', 'Caquinte (cot)', 'Carapana (cbc)', 'Carib (car)', 'Catalan (cat)', 'Cebuano (ceb)', 'Cerma (cme)', 'Chachi (cbi)', 'Chamacoco (ceg)', 'Chatino, Eastern Highland (cly)', 'Chatino, Nopala (cya)', 'Chechen (che)', 'Chhattisgarhi (hne)', 'Chichewa (nya)', 'Chidigo (dig)', 'Chiduruma (dug)', 'Chin, Bawm (bgr)', 'Chin, Eastern Khumi (cek)', 'Chin, Falam (cfm)', 'Chin, Hakha (cnh)', 'Chin, Matu (hlt)', 'Chin, Müün (mwq)', 'Chin, Tedim (ctd)', 'Chin, Thado (tcz)', 'Chin, Zyphe (zyp)', 'Chinantec, Comaltepec (cco)', 'Chinantec, Lalana (cnl)', 'Chinantec, Lealao (cle)', 'Chinantec, Ozumacín (chz)', 'Chinantec, Palantla (cpa)', 'Chinantec, Sochiapam (cso)', 'Chinantec, Tepetotutla (cnt)', 'Chinantec, Usila (cuc)', 'Chinese, Hakka (hak)', 'Chinese, Min Nan (nan)', 'Chingoni (xnj)', 'Chipaya (cap)', 'Chiquitano (cax)', 'Chittagonian (ctg)', 'Chol (ctu)', 'Chontal, Tabasco (chf)', 'Chopi (cce)', 'Chorote, Iyojwa’ja (crt)', 'Chorote, Iyo’wujwa (crq)', 'Chuj (cac-dialect_sansebastiáncoatán)', 'Chuj (cac-dialect_sanmateoixtatán)', 'Chukchi (ckt)', 'Chumburung (ncu)', 'Churahi (cdj)', 'Chuvash (chv)', 'Ch’orti’ (caa)', 'Cishingini (asg)', 'Cofán (con)', 'Cora, El Nayar (crn)', 'Cora, Santa Teresa (cok)', 'Cree, Plains (crk-script_latin)', 'Cree, Plains (crk-script_syllabics)', 'Crimean Tatar (crh)', 'Cuiba (cui)', 'Daasanach (dsh)', 'Daba (dbq)', 'Dagaare, Southern (dga)', 'Dagara, Northern (dgi)', 'Dagba (dgk)', 'Dan (dnj-dialect_gweetaawueast)', 'Dan (dnj-dialect_blowowest)', 'Dangaléat (daa)', 'Dani, Mid Grand Valley (dnt)', 'Dani, Western (dnw)', 'Dargwa (dar)', 'Datooga (tcc)', 'Dawro (dwr)', 'Dedua (ded)', 'Deg (mzw)', 'Delo (ntr)', 'Dendi (ddn)', 'Desano (des)', 'Desiya (dso)', 'Dhao (nfa)', 'Dhimal (dhi)', 'Dida, Yocoboué (gud)', 'Didinga (did)', 'Digaro-Mishmi (mhu)', 'Dinka, Northeastern (dip)', 'Dinka, Southwestern (dik)', 'Ditammari (tbz)', 'Dogon, Toro So (dts)', 'Dogosé (dos)', 'Dogri (dgo)', 'Duri (mvp)', 'Dutch (nld)', 'Dza (jen)', 'Dzongkha (dzo)', 'Ede Idaca (idd)', 'Ekajuk (eka)', 'Embera Catío (cto)', 'Emberá, Northern (emp)', 'Enxet (enx)', 'Epena (sja)', 'Erzya (myv)', 'Ese (mcq)', 'Ese Ejja (ese)', 'Evenki (evn)', 'Ezaa (eza)', 'Fali, South (fal)', 'Faroese (fao)', 'Fataleka (far)', 'Fijian (fij)', 'Finnish (fin)', 'Fon (fon)', 'Fordata (frd)', 'French (fra)', 'Fulah (ful)', 'Fuliiru (flr)', 'Gadaba, Mudhili (gau)', 'Gaddi (gbk)', 'Gagauz (gag-script_cyrillic)', 'Gagauz (gag-script_latin)', 'Galela (gbi)', 'Gamo (gmv)', 'Ganda (lug)', 'Gapapaiwa (pwg)', 'Garhwali (gbm)', 'Garifuna (cab)', 'Garo (grt)', 'Gbaya (krs)', 'Gbaya, Southwest (gso)', 'Gela (nlg)', 'Gen (gej)', 'German, Standard (deu)', 'Ghari (gri)', 'Gikuyu (kik)', 'Gikyode (acd)', 'Gilaki (glk)', 'Gofa (gof-script_latin)', 'Gogo (gog)', 'Gokana (gkn)', 'Gondi, Adilabad (wsg)', 'Gonja (gjn)', 'Gor (gqr)', 'Gorontalo (gor)', 'Gourmanchéma (gux)', 'Grebo, Northern (gbo)', 'Greek (ell)', 'Greek, Ancient (grc)', 'Guahibo (guh)', 'Guajajára (gub)', 'Guarani (grn)', 'Guarayu (gyr)', 'Guayabero (guo)', 'Gude (gde)', 'Gujarati (guj)', 'Gulay (gvl)', 'Gumuz (guk)', 'Gungu (rub)', 'Gwahatike (dah)', 'Gwere (gwr)', 'Gwich’in (gwi)', 'Haitian Creole (hat)', 'Halbi (hlb)', 'Hamer-Banna (amf)', 'Hanga (hag)', 'Hanunoo (hnn)', 'Haryanvi (bgc)', 'Hatam (had)', 'Hausa (hau)', 'Hawaii Pidgin (hwc)', 'Hawu (hvn)', 'Haya (hay)', 'Hdi (xed)', 'Hebrew (heb)', 'Hehe (heh)', 'Hiligaynon (hil)', 'Hindi (hin)', 'Hindi, Fiji (hif)', 'Hindustani, Sarnami (hns)', 'Ho (hoc)', 'Holiya (hoy)', 'Huastec (hus-dialect_westernpotosino)', 'Huastec (hus-dialect_centralveracruz)', 'Huave, San Mateo del Mar (huv)', 'Huli (hui)', 'Hungarian (hun)', 'Hupla (hap)', 'Iban (iba)', 'Icelandic (isl)', 'Ida’an (dbj)', 'Ifugao, Amganad (ifa)', 'Ifugao, Batad (ifb)', 'Ifugao, Mayoyao (ifu)', 'Ifugao, Tuwali (ifk)', 'Ifè (ife)', 'Ignaciano (ign)', 'Ika (ikk)', 'Ikwo (iqw)', 'Ila (ilb)', 'Ilocano (ilo)', 'Imbongu (imo)', 'Inga (inb)', 'Ipili (ipi)', 'Iraqw (irk)', 'Islander English Creole (icr)', 'Itawit (itv)', 'Itelmen (itl)', 'Ivbie North-Okpela-Arhe (atg)', 'Ixil (ixl-dialect_sanjuancotzal)', 'Ixil (ixl-dialect_sangasparchajul)', 'Ixil (ixl-dialect_santamarianebaj)', 'Iyo (nca)', 'Izere (izr)', 'Izii (izz)', 'Jakalteko (jac)', 'Jamaican English Creole (jam)', 'Javanese (jav)', 'Javanese, Suriname (jvn)', 'Jingpho (kac)', 'Jola-Fonyi (dyo)', 'Jola-Kasa (csk)', 'Jopadhola (adh)', 'Juang (jun)', 'Jukun Takum (jbu)', 'Jula (dyu)', 'Jur Modo (bex)', 'Juray (juy)', 'Kaansa (gna)', 'Kaapor (urb)', 'Kabiyè (kbp)', 'Kabwa (cwa)', 'Kadazan Dusun (dtp)', 'Kafa (kbr)', 'Kagayanen (cgc)', 'Kagulu (kki)', 'Kaili, Da’a (kzf)', 'Kaili, Ledo (lew)', 'Kakataibo-Kashibo (cbr)', 'Kako (kkj)', 'Kakwa (keo)', 'Kalagan (kqe)', 'Kalanguya (kak)', 'Kalinga, Butbut (kyb)', 'Kalinga, Lubuagan (knb)', 'Kalinga, Majukayang (kmd)', 'Kalinga, Tanudan (kml)', 'Kallahan, Keley-i (ify)', 'Kalmyk-Oirat (xal)', 'Kamano (kbq)', 'Kamayurá (kay)', 'Kambaata (ktb)', 'Kamwe (hig)', 'Kandawo (gam)', 'Kandozi-Chapra (cbu)', 'Kangri (xnr)', 'Kanite (kmu)', 'Kankanaey (kne)', 'Kannada (kan)', 'Kanuri, Manga (kby)', 'Kapampangan (pam)', 'Kaqchikel (cak-dialect_santamaríadejesús)', 'Kaqchikel (cak-dialect_southcentral)', 'Kaqchikel (cak-dialect_yepocapa)', 'Kaqchikel (cak-dialect_western)', 'Kaqchikel (cak-dialect_santodomingoxenacoj)', 'Kaqchikel (cak-dialect_central)', 'Karaboro, Eastern (xrb)', 'Karachay-Balkar (krc)', 'Karakalpak (kaa)', 'Karelian (krl)', 'Karen, Pwo Northern (pww)', 'Kasem (xsm)', 'Kashinawa (cbs)', 'Kaulong (pss)', 'Kawyaw (kxf)', 'Kayabí (kyz)', 'Kayah, Western (kyu)', 'Kayapó (txu)', 'Kazakh (kaz)', 'Kebu (ndp)', 'Keliko (kbo)', 'Kenga (kyq)', 'Kenyang (ken)', 'Kera (ker)', 'Ketengban (xte)', 'Keyagana (kyg)', 'Khakas (kjh)', 'Khanty (kca)', 'Khmu (kjg)', 'Kigiryama (nyf)', 'Kilivila (kij)', 'Kim (kia)', 'Kimaragang (kqr)', 'Kimré (kqp)', 'Kinaray-a (krj)', 'Kinga (zga)', 'Kinyarwanda (kin)', 'Kipfokomo (pkb)', 'Kire (geb)', 'Kiribati (gil)', 'Kisar (kje)', 'Kisi, Southern (kss)', 'Kitharaka (thk)', 'Klao (klu)', 'Klon (kyo)', 'Kogi (kog)', 'Kolami, Northwestern (kfb)', 'Komi-Zyrian (kpv)', 'Konabéré (bbo)', 'Konkomba (xon)', 'Konni (kma)', 'Kono (kno)', 'Konso (kxc)', 'Koonzime (ozm)', 'Koorete (kqy)', 'Korean (kor)', 'Koreguaje (coe)', 'Korupun-Sela (kpq)', 'Koryak (kpy)', 'Kouya (kyf)', 'Koya (kff-script_telugu)', 'Krio (kri)', 'Kriol (rop)', 'Krumen, Plapo (ktj)', 'Krumen, Tepo (ted)', 'Krung (krr)', 'Kuay (kdt)', 'Kukele (kez)', 'Kulina (cul)', 'Kulung (kle)', 'Kumam (kdi)', 'Kuman (kue)', 'Kumyk (kum)', 'Kuna, Border (kvn)', 'Kuna, San Blas (cuk)', 'Kunda (kdn)', 'Kuo (xuo)', 'Kupia (key)', 'Kupsapiiny (kpz)', 'Kuranko (knk)', 'Kurdish, Northern (kmr-script_latin)', 'Kurdish, Northern (kmr-script_arabic)', 'Kurdish, Northern (kmr-script_cyrillic)', 'Kurumba, Alu (xua)', 'Kurux (kru)', 'Kusaal (kus)', 'Kutep (kub)', 'Kutu (kdc)', 'Kuvi (kxv)', 'Kuwaa (blh)', 'Kuwaataay (cwt)', 'Kwaio (kwd)', 'Kwamera (tnk)', 'Kwara’ae (kwf)', 'Kwere (cwe)', 'Kyaka (kyc)', 'Kyanga (tye)', 'Kyrgyz (kir)', 'K’iche’ (quc-dialect_north)', 'K’iche’ (quc-dialect_east)', 'K’iche’ (quc-dialect_central)', 'Lacandon (lac)', 'Lacid (lsi)', 'Ladakhi (lbj)', 'Lahu (lhu)', 'Lama (las)', 'Lamba (lam)', 'Lamnso’ (lns)', 'Lampung Api (ljp)', 'Lango (laj)', 'Lao (lao)', 'Latin (lat)', 'Latvian (lav)', 'Lauje (law)', 'Lawa, Western (lcp)', 'Laz (lzz)', 'Lele (lln)', 'Lelemi (lef)', 'Lesser Antillean French Creole (acf)', 'Lewo (lww)', 'Lhao Vo (mhx)', 'Lik (eip)', 'Limba, West-Central (lia)', 'Limbu (lif)', 'Lingao (onb)', 'Lisu (lis)', 'Lobala (loq)', 'Lobi (lob)', 'Lokaa (yaz)', 'Loko (lok)', 'Lole (llg)', 'Lolopo (ycl)', 'Loma (lom)', 'Lomwe (ngl)', 'Lomwe, Malawi (lon)', 'Luang (lex)', 'Lugbara (lgg)', 'Luguru (ruf)', 'Lukpa (dop)', 'Lundayeh (lnd)', 'Lutos (ndy)', 'Luwo (lwo)', 'Lyélé (lee)', 'Maan (mev)', 'Mabaan (mfz)', 'Machame (jmc)', 'Macuna (myy)', 'Macushi (mbc)', 'Mada (mda)', 'Madura (mad)', 'Magahi (mag)', 'Mai Brat (ayz)', 'Maithili (mai)', 'Maka (mca)', 'Makaa (mcp)', 'Makasar (mak)', 'Makhuwa (vmw)', 'Makhuwa-Meetto (mgh)', 'Makonde (kde)', 'Malagasy (mlg)', 'Malay (zlm)', 'Malay, Central (pse)', 'Malay, Kupang (mkn)', 'Malay, Manado (xmm)', 'Malayalam (mal)', 'Malayic Dayak (xdy)', 'Maldivian (div)', 'Male (mdy)', 'Malvi (mup)', 'Mam (mam-dialect_central)', 'Mam (mam-dialect_northern)', 'Mam (mam-dialect_southern)', 'Mam (mam-dialect_western)', 'Mamasa (mqj)', 'Mambila, Cameroon (mcu)', 'Mambila, Nigeria (mzk)', 'Mampruli (maw)', 'Mandeali (mjl)', 'Mandinka (mnk)', 'Mango (mge)', 'Mangseng (mbh)', 'Mankanya (knf)', 'Mannan (mjv)', 'Manobo, Matigsalug (mbt)', 'Manobo, Obo (obo)', 'Manobo, Western Bukidnon (mbb)', 'Manya (mzj)', 'Mapun (sjm)', 'Maranao (mrw)', 'Marathi (mar)', 'Marba (mpg)', 'Mari, Meadow (mhr)', 'Markweeta (enb)', 'Marshallese (mah)', 'Masaaba (myx)', 'Maskelynes (klv)', 'Matal (mfh)', 'Mato (met)', 'Matsigenka (mcb)', 'Maya, Mopán (mop)', 'Maya, Yucatec (yua)', 'Mayo (mfy)', 'Mazahua, Central (maz)', 'Mazatec, Ayautla (vmy)', 'Mazatec, Chiquihuitlán (maq)', 'Mazatec, Ixcatlán (mzi)', 'Mazatec, Jalapa de Díaz (maj)', 'Mazatec, San Jerónimo Tecóatl (maa-dialect_sanantonio)', 'Mazatec, San Jerónimo Tecóatl (maa-dialect_sanjerónimo)', 'Ma’anyan (mhy)', 'Ma’di (mhi)', 'Mbandja (zmz)', 'Mbay (myb)', 'Mbore (gai)', 'Mbuko (mqb)', 'Mbula-Bwazza (mbu)', 'Melpa (med)', 'Mende (men)', 'Mengen (mee)', 'Mentawai (mwv)', 'Merey (meq)', 'Mesme (zim)', 'Meta’ (mgo)', 'Meyah (mej)', 'Migabac (mpp)', 'Minangkabau (min)', 'Misak (gum)', 'Misima-Panaeati (mpx)', 'Mixe, Coatlán (mco)', 'Mixe, Juquila (mxq)', 'Mixe, Quetzaltepec (pxm)', 'Mixe, Totontepec (mto)', 'Mixtec, Alacatlatzala (mim)', 'Mixtec, Alcozauca (xta)', 'Mixtec, Amoltepec (mbz)', 'Mixtec, Apasco-Apoala (mip)', 'Mixtec, Atatlahuca (mib)', 'Mixtec, Ayutla (miy)', 'Mixtec, Chayuco (mih)', 'Mixtec, Coatzospan (miz)', 'Mixtec, Diuxi-Tilantongo (xtd)', 'Mixtec, Jamiltepec (mxt)', 'Mixtec, Magdalena Peñasco (xtm)', 'Mixtec, Metlatónoc (mxv)', 'Mixtec, Northern Tlaxiaco (xtn)', 'Mixtec, Ocotepec (mie)', 'Mixtec, Peñoles (mil)', 'Mixtec, Pinotepa Nacional (mio)', 'Mixtec, Santa Lucía Monteverde (mdv)', 'Mixtec, Santa María Zacatepec (mza)', 'Mixtec, Southern Puebla (mit)', 'Mixtec, Tezoatlán (mxb)', 'Mixtec, Yosondúa (mpm)', 'Miyobe (soy)', 'Mnong, Central (cmo-script_latin)', 'Mnong, Central (cmo-script_khmer)', 'Moba (mfq)', 'Mochi (old)', 'Mofu, North (mfk)', 'Mofu-Gudur (mif)', 'Mokole (mkl)', 'Molima (mox)', 'Moma (myl)', 'Momuna (mqf)', 'Mongolian (mon)', 'Mongondow (mog)', 'Morisyen (mfe)', 'Moro (mor)', 'Moronene (mqn)', 'Moru (mgd)', 'Moskona (mtj)', 'Mro-Khimi (cmr)', 'Mualang (mtd)', 'Muinane (bmr)', 'Mukulu (moz)', 'Mumuye (mzm)', 'Muna (mnb)', 'Mundani (mnf)', 'Mundari (unr)', 'Muria, Far Western (fmu)', 'Murle (mur)', 'Murut, Timugon (tih)', 'Muthuvan (muv)', 'Muyang (muy)', 'Mwaghavul (sur)', 'Mwan (moa)', 'Mwani (wmw)', 'Ménik (tnr)', 'Mískito (miq)', 'Mòoré (mos)', 'Mündü (muh)', 'Naasioi (nas)', 'Nadëb (mbj)', 'Nafaanra (nfr)', 'Naga, Kharam (kfw)', 'Naga, Tangshang (nst)', 'Nagamese (nag)', 'Nahuatl, Central Huasteca (nch)', 'Nahuatl, Eastern Huasteca (nhe)', 'Nahuatl, Guerrero (ngu)', 'Nahuatl, Highland Puebla (azz)', 'Nahuatl, Isthmus-Mecayapan (nhx)', 'Nahuatl, Michoacán (ncl)', 'Nahuatl, Northern Oaxaca (nhy)', 'Nahuatl, Northern Puebla (ncj)', 'Nahuatl, Sierra Negra (nsu)', 'Nahuatl, Southeastern Puebla (npl)', 'Nahuatl, Tlamacazapa (nuz)', 'Nahuatl, Western Huasteca (nhw)', 'Nahuatl, Zacatlán-Ahuacatlán-Tepetzintla (nhi)', 'Nalca (nlc)', 'Nambikuára, Southern (nab)', 'Nanai (gld)', 'Nande (nnb)', 'Napu (npy)', 'Nasa (pbb)', 'Nateni (ntm)', 'Nawdm (nmz)', 'Nawuri (naw)', 'Naxi (nxq)', 'Ndamba (ndj)', 'Ndogo (ndz)', 'Ndut (ndv)', 'Newar (new)', 'Ngaju (nij)', 'Ngambay (sba)', 'Ngangam (gng)', 'Ngbaka (nga)', 'Ngindo (nnq)', 'Ngulu (ngp)', 'Ngäbere (gym)', 'Ng’akarimojong (kdj)', 'Nias (nia)', 'Nilamba (nim)', 'Ninzo (nin)', 'Nkonya (nko)', 'Nogai (nog)', 'Nomaande (lem)', 'Nomatsigenga (not)', 'Noone (nhu)', 'Ntcham (bud)', 'Nuer (nus)', 'Nugunu (yas)', 'Nuni, Southern (nnw)', 'Nyabwa (nwb)', 'Nyakyusa-Ngonde (nyy)', 'Nyankore (nyn)', 'Nyaturu (rim)', 'Nyindrou (lid)', 'Nyole (nuj)', 'Nyoro (nyo)', 'Nzema (nzi)', 'Obolo (ann)', 'Odia (ory)', 'Ojibwa, Northwestern (ojb-script_latin)', 'Ojibwa, Northwestern (ojb-script_syllabics)', 'Oku (oku)', 'Oniyan (bsc)', 'Oroko (bdu)', 'Oromo (orm)', 'Orya (ury)', 'Ossetic (oss)', 'Otomi, Mezquital (ote)', 'Otomi, Querétaro (otq)', 'Owa (stn)', 'Paasaal (sig)', 'Pahari, Kullu (kfx)', 'Pahari, Mahasu (bfz)', 'Paicoca (sey)', 'Paiute, Northern (pao)', 'Palauan (pau)', 'Palaung, Ruching (pce)', 'Palawano, Brooke’s Point (plw)', 'Pamona (pmf)', 'Pangasinan (pag)', 'Papiamentu (pap)', 'Paranan (prf)', 'Parecís (pab)', 'Parkwa (pbi)', 'Patamona (pbc)', 'Paumarí (pad)', 'Pele-Ata (ata)', 'Penan, Eastern (pez)', 'Pengo (peg)', 'Persian (fas)', 'Pidgin, Nigerian (pcm)', 'Pijin (pis)', 'Pinyin (pny)', 'Piratapuyo (pir)', 'Pitjantjatjara (pjt)', 'Pogolo (poy)', 'Polish (pol)', 'Popoloca, San Luís Temalacayuca (pps)', 'Popoloca, San Marcos Tlacoyalco (pls)', 'Popoluca, Highland (poi)', 'Poqomchi’ (poh-dialect_eastern)', 'Poqomchi’ (poh-dialect_western)', 'Portuguese (por)', 'Prai (prt)', 'Puinave (pui)', 'Punjabi, Eastern (pan)', 'Purepecha (tsz)', 'Puroik (suv)', 'Pévé (lme)', 'Quechua, Ayacucho (quy)', 'Quechua, Cajamarca (qvc)', 'Quechua, Cusco (quz)', 'Quechua, Eastern Apurímac (qve)', 'Quechua, Huallaga (qub)', 'Quechua, Huamalíes-Dos de Mayo Huánuco (qvh)', 'Quechua, Huaylas Ancash (qwh)', 'Quechua, Huaylla Wanca (qvw)', 'Quechua, Lambayeque (quf)', 'Quechua, Margos-Yarowilca-Lauricocha (qvm)', 'Quechua, North Bolivian (qul)', 'Quechua, North Junín (qvn)', 'Quechua, Northern Conchucos Ancash (qxn)', 'Quechua, Panao (qxh)', 'Quechua, San Martín (qvs)', 'Quechua, South Bolivian (quh)', 'Quechua, Southern Conchucos (qxo)', 'Quichua, Cañar Highland (qxr)', 'Quichua, Napo (qvo)', 'Quichua, Northern Pastaza (qvz)', 'Quichua, Salasaca Highland (qxl)', 'Quichua, Tena Lowland (quw)', 'Q’anjob’al (kjb)', 'Q’eqchi’ (kek)', 'Rabha (rah)', 'Rajbanshi (rjs)', 'Ramoaaina (rai)', 'Rampi (lje)', 'Ranglong (rnl)', 'Rangpuri (rkt)', 'Rapa Nui (rap)', 'Ravula (yea)', 'Rawang (raw)', 'Rejang (rej)', 'Rendille (rel)', 'Riang Lang (ril)', 'Rigwe (iri)', 'Rikou (rgu)', 'Rohingya (rhg)', 'Romani, Carpathian (rmc-script_latin)', 'Romani, Carpathian (rmc-script_cyrillic)', 'Romani, Sinte (rmo)', 'Romani, Vlax (rmy-script_latin)', 'Romani, Vlax (rmy-script_cyrillic)', 'Romanian (ron)', 'Romblomanon (rol)', 'Ron (cla)', 'Ronga (rng)', 'Roviana (rug)', 'Rundi (run)', 'Russian (rus)', 'Saamya-Gwe (lsm)', 'Sabaot (spy)', 'Sadri (sck)', 'Sahu (saj)', 'Sakachep (sch)', 'Sama, Central (sml)', 'Sambal (xsb)', 'Sambal, Botolan (sbl)', 'Samburu (saq)', 'Samo, Southern (sbd)', 'Samoan (smo)', 'Sampang (rav)', 'Sangir (sxn)', 'Sango (sag)', 'Sangu (sbp)', 'Sanumá (xsu)', 'Saramaccan (srm)', 'Sasak (sas)', 'Sa’a (apb)', 'Sebat Bet Gurage (sgw)', 'Sedoa (tvw)', 'Sekpele (lip)', 'Selaru (slu)', 'Selee (snw)', 'Semai (sea)', 'Semelai (sza)', 'Sena (seh)', 'Seychelles French Creole (crs)', 'Shambala (ksb)', 'Shanga (sho)', 'Sharanahua (mcd)', 'Shawi (cbt)', 'Sherpa (xsr)', 'Shilluk (shk)', 'Shipibo-Conibo (shp)', 'Shona (sna)', 'Shor (cjs)', 'Shuar (jiv)', 'Siane (snp)', 'Siang (sya)', 'Sidamo (sid)', 'Siona (snn)', 'Siriano (sri)', 'Sirmauri (srx)', 'Sisaala, Tumulung (sil)', 'Sissala (sld)', 'Siwu (akp)', 'Soga (xog)', 'Somali (som)', 'Somba-Siawari (bmu)', 'Songhay, Koyra Chiini (khq)', 'Songhay, Koyraboro Senni (ses)', 'Sougb (mnx)', 'Spanish (spa)', 'Sranan Tongo (srn)', 'Suba (sxb)', 'Subanon, Western (suc)', 'Sudest (tgo)', 'Sukuma (suk)', 'Sunda (sun)', 'Sunwar (suz)', 'Surgujia (sgj)', 'Susu (sus)', 'Swahili (swh)', 'Swedish (swe)', 'Sylheti (syl)', 'Sénoufo, Djimini (dyi)', 'Sénoufo, Mamara (myk)', 'Sénoufo, Supyire (spp)', 'Taabwa (tap)', 'Tabaru (tby)', 'Tacana (tna)', 'Tachelhit (shi)', 'Tado (klw)', 'Tagalog (tgl)', 'Tagbanwa, Calamian (tbk)', 'Tagin (tgj)', 'Tai Dam (blt)', 'Tairora, North (tbg)', 'Tairora, South (omw)', 'Tajik (tgk)', 'Tajio (tdj)', 'Takia (tbc)', 'Talinga-Bwisi (tlj)', 'Talysh (tly)', 'Tamajaq, Tawallammat (ttq-script_tifinagh)', 'Tamang, Eastern (taj)', 'Tamasheq (taq)', 'Tamil (tam)', 'Tampulma (tpm)', 'Tangoa (tgp)', 'Tanna, North (tnn)', 'Tarahumara, Western (tac)', 'Tarifit (rif-script_latin)', 'Tarifit (rif-script_arabic)', 'Tatar (tat)', 'Tatuyo (tav)', 'Tawbuid (twb)', 'Tboli (tbl)', 'Tehit (kps)', 'Teiwa (twe)', 'Tektiteko (ttc)', 'Telugu (tel)', 'Tem (kdh)', 'Tengger (tes)', 'Tennet (tex)', 'Tepehua, Huehuetla (tee)', 'Tepehua, Pisaflores (tpp)', 'Tepehua, Tlachichilco (tpt)', 'Tepehuan, Southeastern (stp)', 'Teribe (tfr)', 'Termanu (twu)', 'Terêna (ter)', 'Tewa (tew)', 'Tharu, Dangaura (thl)', 'Themne (tem)', 'Tibetan, Amdo (adx)', 'Tibetan, Central (bod)', 'Tibetan, Khams (khg)', 'Ticuna (tca)', 'Tigrigna (tir)', 'Tii (txq)', 'Tikar (tik)', 'Tlicho (dgr)', 'Toba (tob)', 'Toba-Maskoy (tmf)', 'Tobanga (tng)', 'Tobelo (tlb)', 'Tohono O’odham (ood)', 'Tok Pisin (tpi)', 'Tol (jic)', 'Tolaki (lbw)', 'Tombonuo (txa)', 'Tombulu (tom)', 'Tonga (toh)', 'Tontemboan (tnt)', 'Toraja-Sa’dan (sda)', 'Torres Strait Creole (tcs)', 'Totonac, Coyutla (toc)', 'Totonac, Highland (tos)', 'Toura (neb)', 'Trinitario (trn)', 'Triqui, Chicahuaxtla (trs)', 'Triqui, Copala (trc)', 'Trió (tri)', 'Tsafiki (cof)', 'Tsakhur (tkr)', 'Tsikimba (kdl)', 'Tsimané (cas)', 'Tsonga (tso)', 'Tucano (tuo)', 'Tuma-Irumu (iou)', 'Tumak (tmc)', 'Tunebo, Central (tuf)', 'Turkish (tur)', 'Turkmen (tuk-script_latin)', 'Turkmen (tuk-script_arabic)', 'Tuwuli (bov)', 'Tuyuca (tue)', 'Tyap (kcg)', 'Tzeltal (tzh-dialect_bachajón)', 'Tzeltal (tzh-dialect_tenejapa)', 'Tzotzil (tzo-dialect_chenalhó)', 'Tzotzil (tzo-dialect_chamula)', 'Tz’utujil (tzj-dialect_western)', 'Tz’utujil (tzj-dialect_eastern)', 'Uab Meto (aoz)', 'Udmurt (udm)', 'Uduk (udu)', 'Ukrainian (ukr)', 'Uma (ppk)', 'Umbu-Ungu (ubu)', 'Urak Lawoi’ (urk)', 'Urarina (ura)', 'Urat (urt)', 'Urdu (urd-script_devanagari)', 'Urdu (urd-script_arabic)', 'Urdu (urd-script_latin)', 'Uripiv-Wala-Rano-Atchin (upv)', 'Uspanteko (usp)', 'Uyghur (uig-script_arabic)', 'Uyghur (uig-script_cyrillic)', 'Uzbek (uzb-script_cyrillic)', 'Vagla (vag)', 'Vengo (bav)', 'Vidunda (vid)', 'Vili (vif)', 'Vunjo (vun)', 'Vute (vut)', 'Wa, Parauk (prk)', 'Waama (wwa)', 'Waima (rro)', 'Waimaha (bao)', 'Waiwai (waw)', 'Wala (lgl)', 'Wali (wlx)', 'Wamey (cou)', 'Wampís (hub)', 'Wanano (gvc)', 'Wandala (mfi)', 'Wapishana (wap)', 'Warao (wba)', 'Waray-Waray (war)', 'Wayana (way)', 'Wayuu (guc)', 'Welsh (cym)', 'Wersing (kvw)', 'Whitesands (tnp)', 'Witoto, Minika (hto)', 'Witoto, Murui (huu)', 'Wolaytta (wal-script_latin)', 'Wolaytta (wal-script_ethiopic)', 'Wolio (wlo)', 'Woun Meu (noa)', 'Wè Northern (wob)', 'Xaasongaxango (kao)', 'Xerénte (xer)', 'Yagua (yad)', 'Yakan (yka)', 'Yakut (sah)', 'Yala (yba)', 'Yali, Angguruk (yli)', 'Yali, Ninia (nlk)', 'Yalunka (yal)', 'Yamba (yam)', 'Yambeta (yat)', 'Yamdena (jmd)', 'Yami (tao)', 'Yaminahua (yaa)', 'Yanesha’ (ame)', 'Yanomamö (guu)', 'Yao (yao)', 'Yaouré (yre)', 'Yawa (yva)', 'Yemba (ybb)', 'Yine (pib)', 'Yipma (byr)', 'Yom (pil)', 'Yoruba (yor)', 'Yucuna (ycn)', 'Yupik, Saint Lawrence Island (ess)', 'Yuracare (yuz)', 'Zaiwa (atb)', 'Zande (zne)', 'Zapotec, Aloápam (zaq)', 'Zapotec, Amatlán (zpo)', 'Zapotec, Cajonos (zad)', 'Zapotec, Choapan (zpc)', 'Zapotec, Coatecas Altas (zca)', 'Zapotec, Guevea de Humboldt (zpg)', 'Zapotec, Isthmus (zai)', 'Zapotec, Lachixío (zpl)', 'Zapotec, Miahuatlán (zam)', 'Zapotec, Mitla (zaw)', 'Zapotec, Mixtepec (zpm)', 'Zapotec, Ocotlán (zac)', 'Zapotec, Ozolotepec (zao)', 'Zapotec, Quioquitani-Quierí (ztq)', 'Zapotec, Rincón (zar)', 'Zapotec, San Vicente Coatlán (zpt)', 'Zapotec, Santa María Quiegolani (zpi)', 'Zapotec, Santo Domingo Albarradas (zas)', 'Zapotec, Sierra de Juárez (zaa)', 'Zapotec, Texmelucan (zpz)', 'Zapotec, Western Tlacolula Valley (zab)', 'Zapotec, Yalálag (zpu)', 'Zapotec, Yareni (zae)', 'Zapotec, Yatee (zty)', 'Zapotec, Yatzachi (zav)', 'Zaza (zza)', 'Zhuang, Yongbei (zyb)', 'Zigula (ziw)', 'Zoque, Francisco León (zos)', 'Zulgo-Gemzek (gnd)', 'Éwé (ewe)'
  ];
  
const CHUNK_SIZE = 200; // characters per chunk

const createChunks = (text) => {
  const words = text.split(' ');
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + word).length < CHUNK_SIZE) {
      currentChunk += `${word} `;
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = `${word} `;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

// Database helper class
class AudioCacheDB {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initDatabase();
    return this.initPromise;
  }

  async _initDatabase() {
    try {
      // Use the new async API
      this.db = await SQLite.openDatabaseAsync('audio_cache.db');

      if (!this.db) {
        throw new Error('Failed to open database');
      }

      // Create tables with proper error handling
      await this.db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS audio_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text_hash TEXT NOT NULL,
          language TEXT NOT NULL,
          chunk_index INTEGER NOT NULL,
          audio_uri TEXT NOT NULL,
          file_path TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          is_cached INTEGER DEFAULT 0,
          UNIQUE(text_hash, language, chunk_index)
        );
      `);

      // Create indexes separately to avoid issues
      try {
        await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_text_hash_lang ON audio_cache(text_hash, language);');
        await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_created_at ON audio_cache(created_at);');
        await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_is_cached ON audio_cache(is_cached);');
      } catch (indexError) {
        console.warn('Index creation warning:', indexError);
        // Continue even if indexes fail
      }

      this.initialized = true;
      console.log('Database initialized successfully');

      // Clean old cache entries (older than 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      await this.cleanOldEntries(weekAgo);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      this.initialized = false;
      this.db = null;
      throw error;
    }
  }

  async generateTextHash(text, language) {
    try {
      const combined = `${text}_${language}`;
      return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5, combined);
    } catch (error) {
      console.error('Error generating hash:', error);
      // Fallback to simple hash
      return `${text.length}_${language}_${Date.now()}`;
    }
  }

  async getCachedAudio(textHash, language, chunkIndex) {
    try {
      await this.init();
      if (!this.db) return null;

      const result = await this.db.getFirstAsync(
        'SELECT audio_uri, file_path, is_cached FROM audio_cache WHERE text_hash = ? AND language = ? AND chunk_index = ? AND is_cached = 1',
        [textHash, language, chunkIndex]
      );

      if (result) {
        // Check if file still exists
        try {
          const fileInfo = await FileSystem.getInfoAsync(result.file_path);
          if (fileInfo.exists) {
            return result.file_path;
          } else {
            // File deleted, remove from cache
            await this.removeCachedAudio(textHash, language, chunkIndex);
          }
        } catch (fileError) {
          console.warn('File check error:', fileError);
          await this.removeCachedAudio(textHash, language, chunkIndex);
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting cached audio:', error);
      return null;
    }
  }

  async cacheAudio(textHash, language, chunkIndex, audioUri) {
    try {
      await this.init();
      if (!this.db) return null;

      // Download and save audio file
      const fileName = `audio_${textHash}_${language}_${chunkIndex}.wav`;
      const filePath = `${FileSystem.documentDirectory}audio_cache/${fileName}`;

      // Ensure directory exists
      const dirPath = `${FileSystem.documentDirectory}audio_cache/`;
      try {
        const dirInfo = await FileSystem.getInfoAsync(dirPath);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        }
      } catch (dirError) {
        console.error('Directory creation error:', dirError);
        return null;
      }

      // Download audio file
      const downloadResult = await FileSystem.downloadAsync(audioUri, filePath);

      if (downloadResult.status === 200) {
        // Save to database with is_cached = 1
        await this.db.runAsync(
          'INSERT OR REPLACE INTO audio_cache (text_hash, language, chunk_index, audio_uri, file_path, created_at, is_cached) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [textHash, language, chunkIndex, audioUri, filePath, Date.now(), 1]
        );

        console.log(`Audio cached successfully: chunk ${chunkIndex}`);
        return filePath;
      }

      return null;
    } catch (error) {
      console.error('Error caching audio:', error);
      return null;
    }
  }

  async markAsUncached(textHash, language, chunkIndex) {
    try {
      await this.init();
      if (!this.db) return;

      await this.db.runAsync(
        'UPDATE audio_cache SET is_cached = 0 WHERE text_hash = ? AND language = ? AND chunk_index = ?',
        [textHash, language, chunkIndex]
      );
    } catch (error) {
      console.error('Error marking as uncached:', error);
    }
  }

  async removeCachedAudio(textHash, language, chunkIndex) {
    try {
      await this.init();
      if (!this.db) return;

      // Get file path before deleting
      const result = await this.db.getFirstAsync(
        'SELECT file_path FROM audio_cache WHERE text_hash = ? AND language = ? AND chunk_index = ?',
        [textHash, language, chunkIndex]
      );

      if (result && result.file_path) {
        // Delete file if exists
        try {
          const fileInfo = await FileSystem.getInfoAsync(result.file_path);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(result.file_path);
          }
        } catch (fileError) {
          console.warn('File deletion error:', fileError);
        }
      }

      // Remove from database
      await this.db.runAsync(
        'DELETE FROM audio_cache WHERE text_hash = ? AND language = ? AND chunk_index = ?',
        [textHash, language, chunkIndex]
      );
    } catch (error) {
      console.error('Error removing cached audio:', error);
    }
  }

  async cleanOldEntries(beforeTimestamp) {
    try {
      await this.init();
      if (!this.db) return;

      // Get old entries to delete their files
      const oldEntries = await this.db.getAllAsync(
        'SELECT file_path FROM audio_cache WHERE created_at < ?',
        [beforeTimestamp]
      );

      // Delete files
      for (const entry of oldEntries) {
        if (entry.file_path) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(entry.file_path);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(entry.file_path);
            }
          } catch (error) {
            console.warn('Error deleting old cache file:', error);
          }
        }
      }

      // Remove from database
      await this.db.runAsync('DELETE FROM audio_cache WHERE created_at < ?', [beforeTimestamp]);
    } catch (error) {
      console.error('Error cleaning old cache entries:', error);
    }
  }

  async getAllCachedChunks(textHash, language) {
    try {
      await this.init();
      if (!this.db) return {};

      const results = await this.db.getAllAsync(
        'SELECT chunk_index, file_path FROM audio_cache WHERE text_hash = ? AND language = ? AND is_cached = 1 ORDER BY chunk_index',
        [textHash, language]
      );

      const cachedChunks = {};
      for (const result of results) {
        if (result.file_path) {
          // Verify file exists
          try {
            const fileInfo = await FileSystem.getInfoAsync(result.file_path);
            if (fileInfo.exists) {
              cachedChunks[result.chunk_index] = result.file_path;
            } else {
              // Mark as uncached if file doesn't exist
              await this.markAsUncached(textHash, language, result.chunk_index);
            }
          } catch (fileError) {
            console.warn('File verification error:', fileError);
            await this.markAsUncached(textHash, language, result.chunk_index);
          }
        }
      }

      return cachedChunks;
    } catch (error) {
      console.error('Error getting all cached chunks:', error);
      return {};
    }
  }

  async getCacheStats(textHash, language) {
    try {
      await this.init();
      if (!this.db) return { total: 0, cached: 0 };

      const result = await this.db.getFirstAsync(
        'SELECT COUNT(*) as total, SUM(is_cached) as cached FROM audio_cache WHERE text_hash = ? AND language = ?',
        [textHash, language]
      );

      return {
        total: result?.total || 0,
        cached: result?.cached || 0
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { total: 0, cached: 0 };
    }
  }
}

const TTSFunction = ({ text, onChunkChange }) => {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState("English (eng)");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showAd, setShowAd] = useState(false);

  // Refs for audio management
  const chunks = useRef([]);
  const chunkAudios = useRef({});
  const currentIndex = useRef(0);
  const currentSound = useRef(null);
  const isPlayingChunk = useRef(false);
  const shouldStop = useRef(false);
  const progressInterval = useRef(null);
  const chunkStartTime = useRef(0);
  const totalElapsedTime = useRef(0);
  const preloadQueue = useRef(new Set());
  const audioCacheDB = useRef(new AudioCacheDB());
  const textHash = useRef('');
  const pausedPosition = useRef(0);
  const isMounted = useRef(true);
  const isScreenFocused = useRef(true);

  // Use ref to store the pending function to execute after ad closes
  const pendingActionRef = useRef(null);

  // Handler for when ad is closed
  const handleAdClosed = () => {
    console.log('Ad closed by user');
    setShowAd(false);

    // Execute the pending action if it exists
    if (pendingActionRef.current) {
      console.log('Executing pending action after ad closed');
      const pendingAction = pendingActionRef.current;
      pendingActionRef.current = null; // Clear the pending action

      // Execute the pending function
      pendingAction();
    }
  };

  // Handler for manual close
  const handleCloseAd = () => {
    console.log('Ad modal closed');
    setShowAd(false);

  };

  // Track focus state to stop audio when navigating away
  useFocusEffect(
    React.useCallback(() => {
      isScreenFocused.current = true;
      return () => {
        isScreenFocused.current = false;
        // Stop audio when losing focus (navigating away)
        if (playing) {
          stopAudio();
        }
      };
    }, [playing])
  );

  useEffect(() => {
    isMounted.current = true;
    // Initialize audio and database
    initializeAudio();

    // Initialize database with error handling
    audioCacheDB.current.init().catch(error => {
      console.error('Database initialization failed:', error);
    });

    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Generate text hash when text or language changes
    if (text && isMounted.current) {
      generateTextHashAsync();
    }
  }, [text, selectedLanguage]);

  const initializeAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false, // Changed to false to prevent background playback
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  };

  const generateTextHashAsync = async () => {
    if (text && isMounted.current) {
      try {
        const hash = await audioCacheDB.current.generateTextHash(text, selectedLanguage);
        textHash.current = hash;
        updateCacheStatus();
      } catch (error) {
        console.error('Error generating text hash:', error);
        textHash.current = `${text.length}_${selectedLanguage}_${Date.now()}`;
      }
    }
  };

  const updateCacheStatus = async () => {
    if (!textHash.current || !text || !isMounted.current) return;

    try {
      const textChunks = createChunks(text);
      const stats = await audioCacheDB.current.getCacheStats(textHash.current, selectedLanguage);

      if (stats.cached === textChunks.length && textChunks.length > 0) {
        setCacheStatus('Fully cached');
      } else if (stats.cached > 0) {
        setCacheStatus(`${stats.cached}/${textChunks.length} cached`);
      } else {
        setCacheStatus('Not cached');
      }
    } catch (error) {
      console.error('Error updating cache status:', error);
      setCacheStatus('Cache unavailable');
    }
  };

  const cleanup = async () => {
    stopProgressTracking();
    if (currentSound.current) {
      try {
        await currentSound.current.unloadAsync();
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
      currentSound.current = null;
    }
  };

  const startProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (playing && !paused && chunks.current.length > 0 && isMounted.current && isScreenFocused.current) {
        const estimatedDuration = estimateDuration(text);
        const chunkDuration = estimatedDuration / chunks.current.length;
        const currentChunkElapsed = (Date.now() - chunkStartTime.current) / 1000;
        const currentTotalElapsed = totalElapsedTime.current + currentChunkElapsed;

        setElapsedTime(currentTotalElapsed * 1000);
        setProgress((currentTotalElapsed / estimatedDuration) * 100);

        onChunkChange?.(currentIndex.current);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const reset = () => {
    currentIndex.current = 0;
    chunks.current = [];
    chunkAudios.current = {};
    isPlayingChunk.current = false;
    shouldStop.current = false;
    totalElapsedTime.current = 0;
    chunkStartTime.current = 0;
    pausedPosition.current = 0;
    preloadQueue.current.clear();

    stopProgressTracking();
    cleanup();

    if (isMounted.current) {
      setElapsedTime(0);
      setProgress(0);
      setPaused(false);
      setIsPreparingAudio(false);
      setLoadingMessage('');
    }
  };

  const stopPlayback = async () => {
    try {
      shouldStop.current = true;
      stopProgressTracking();

      if (currentSound.current) {
        await currentSound.current.pauseAsync();
        await currentSound.current.unloadAsync();
        currentSound.current = null;
      }

      isPlayingChunk.current = false;
      if (isMounted.current) {
        setPlaying(false);
        setPaused(false);
      }
    } catch (error) {
      console.error("Stop playback error:", error);
      if (isMounted.current) {
        setPlaying(false);
        setPaused(false);
      }
    }
  };

  const pausePlayback = async () => {
    try {
      if (currentSound.current && playing && !paused) {
        await currentSound.current.pauseAsync();
        if (isMounted.current) {
          setPaused(true);
        }
        stopProgressTracking();

        // Save current position
        const chunkDuration = estimateDuration(text) / chunks.current.length;
        const currentChunkElapsed = (Date.now() - chunkStartTime.current) / 1000;
        pausedPosition.current = currentChunkElapsed;
      }
    } catch (error) {
      console.error("Pause playback error:", error);
    }
  };

  const resumePlayback = async () => {
    try {
      if (currentSound.current && playing && paused && isScreenFocused.current) {
        // Update start time to account for paused duration
        chunkStartTime.current = Date.now() - (pausedPosition.current * 1000);

        await currentSound.current.playAsync();
        if (isMounted.current) {
          setPaused(false);
        }
        startProgressTracking();
      }
    } catch (error) {
      console.error("Resume playback error:", error);
    }
  };

  const generateAudioFromText = async (text) => {
    try {
      const response = await fetch("https://dpc-mmstts.hf.space/run/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          data: [
            text.slice(0, 900),
            selectedLanguage
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (!result?.data?.[0]?.name) {
        throw new Error("Unexpected API response format");
      }

      return `https://dpc-mmstts.hf.space/file=${result.data[0].name}`;
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw error;
    }
  };

  const getOrGenerateAudio = async (chunkText, chunkIndex) => {
    if (!isMounted.current || !isScreenFocused.current) return null;

    setLoadingMessage(`Loading audio chunk ${chunkIndex + 1}/${chunks.current.length}...`);

    // Check cache first
    try {
      const cachedPath = await audioCacheDB.current.getCachedAudio(
        textHash.current,
        selectedLanguage,
        chunkIndex
      );

      if (cachedPath && isMounted.current) {
        return `file://${cachedPath}`;
      }
    } catch (error) {
      console.warn('Cache check failed:', error);
    }

    // Generate new audio only if still mounted and focused
    if (!isMounted.current || !isScreenFocused.current) return null;

    const audioUrl = await generateAudioFromText(chunkText);

    // Cache the audio in background (don't wait for it)
    if (isMounted.current && isScreenFocused.current) {
      audioCacheDB.current.cacheAudio(
        textHash.current,
        selectedLanguage,
        chunkIndex,
        audioUrl
      ).then(() => {
        // Update cache status after caching
        if (isMounted.current) {
          updateCacheStatus();
        }
      }).catch(error => {
        console.warn('Background caching failed:', error);
      });
    }

    return audioUrl;
  };

  const preloadNextChunks = async (startIndex, count = 2) => { // Reduced from 3 to 2
    if (!isMounted.current || !isScreenFocused.current) return;

    const loadPromises = [];

    for (let i = startIndex; i < Math.min(startIndex + count, chunks.current.length); i++) {
      if (!chunkAudios.current[i] && !preloadQueue.current.has(i)) {
        preloadQueue.current.add(i);
        loadPromises.push((async () => {
          try {
            if (!isMounted.current || !isScreenFocused.current) {
              preloadQueue.current.delete(i);
              return;
            }
            const audioUri = await getOrGenerateAudio(chunks.current[i], i);
            if (audioUri && isMounted.current && isScreenFocused.current) {
              chunkAudios.current[i] = audioUri;
            }
            preloadQueue.current.delete(i);
          } catch (error) {
            console.error(`Error preloading chunk ${i}:`, error);
            preloadQueue.current.delete(i);
          }
        })());
      }
    }

    if (loadPromises.length > 0) {
      await Promise.all(loadPromises);
    }
  };

  const playNextChunk = async () => {
    if (shouldStop.current || currentIndex.current >= chunks.current.length || !isMounted.current || !isScreenFocused.current) {
      if (isMounted.current) {
        setPlaying(false);
        setIsPreparingAudio(false);
        setLoadingMessage('');
      }
      isPlayingChunk.current = false;
      stopProgressTracking();
      return;
    }

    if (isPlayingChunk.current) {
      return;
    }

    isPlayingChunk.current = true;
    const chunkIndex = currentIndex.current;

    try {
      // Wait for current chunk audio if not ready
      let attempts = 0;
      while (!chunkAudios.current[chunkIndex] && attempts < 30 && isMounted.current && isScreenFocused.current) { // Reduced from 50 to 30
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!isMounted.current || !isScreenFocused.current) {
        isPlayingChunk.current = false;
        return;
      }

      if (!chunkAudios.current[chunkIndex]) {
        const audioUri = await getOrGenerateAudio(chunks.current[chunkIndex], chunkIndex);
        if (audioUri && isMounted.current && isScreenFocused.current) {
          chunkAudios.current[chunkIndex] = audioUri;
        } else {
          isPlayingChunk.current = false;
          return;
        }
      }

      // Clean up previous sound
      if (currentSound.current) {
        try {
          await currentSound.current.unloadAsync();
        } catch (error) {
          console.error("Error unloading previous sound:", error);
        }
      }

      // Create new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: chunkAudios.current[chunkIndex] },
        {
          shouldPlay: false,
          rate: speed,
          isLooping: false,
        }
      );

      if (!isMounted.current || !isScreenFocused.current) {
        await sound.unloadAsync();
        isPlayingChunk.current = false;
        return;
      }

      currentSound.current = sound;
      chunkStartTime.current = Date.now();

      const onPlaybackStatusUpdate = (status) => {
        if (status.didJustFinish && !shouldStop.current && !paused && isMounted.current && isScreenFocused.current) {
          const chunkDuration = estimateDuration(chunks.current[chunkIndex]) / chunks.current.length;
          totalElapsedTime.current += chunkDuration;

          isPlayingChunk.current = false;
          currentIndex.current++;

          if (currentIndex.current < chunks.current.length) {
            preloadNextChunks(currentIndex.current + 1, 3); // Reduced from 4 to 3
            setTimeout(() => playNextChunk(), 100);
          } else {
            if (isMounted.current) {
              setPlaying(false);
              setIsPreparingAudio(false);
              setLoadingMessage('');
            }
            stopProgressTracking();
          }
        }
      };

      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await sound.playAsync();

      if (!playing && isMounted.current) {
        setPlaying(true);
      }

      if (isMounted.current) {
        setIsPreparingAudio(false);
        setLoadingMessage('');
      }

      if (!progressInterval.current) {
        startProgressTracking();
      }

      if (chunkIndex + 1 < chunks.current.length) {
        preloadNextChunks(chunkIndex + 1, 3); // Reduced from 4 to 3
      }

    } catch (error) {
      console.error("Playback error:", error);
      isPlayingChunk.current = false;
      if (isMounted.current) {
        setPlaying(false);
        setIsPreparingAudio(false);
        setLoadingMessage('');
      }
      stopProgressTracking();
      if (isMounted.current) {
        Alert.alert("Playback Error", "Failed to play audio chunk");
      }
    }
  };

  const speak = async () => {
    if (!text || !isMounted.current || !isScreenFocused.current) return;

    // Prevent multiple simultaneous operations
    if (isLoading || isPreparingAudio) {
      if (isMounted.current) {
        Alert.alert("Loading", "Audio is currently loading. Please wait...");
      }
      return;
    }

    if (playing && !paused) {
      await pausePlayback();
      return;
    }

    if (playing && paused) {
      await resumePlayback();
      return;
    }

    try {
      reset();
      if (!isMounted.current || !isScreenFocused.current) return;

      setPlaying(true);
      setIsLoading(true);
      setIsPreparingAudio(true);
      setLoadingMessage('Preparing audio...');
      shouldStop.current = false;

      chunks.current = createChunks(text);
      const estimatedDuration = estimateDuration(text);
      setTotalDuration(estimatedDuration * 1000);

      // Check cache status
      try {
        const cachedChunks = await audioCacheDB.current.getAllCachedChunks(
          textHash.current,
          selectedLanguage
        );

        // Load cached chunks
        for (const [index, filePath] of Object.entries(cachedChunks)) {
          chunkAudios.current[parseInt(index)] = `file://${filePath}`;
        }
      } catch (error) {
        console.warn('Cache loading failed:', error);
      }

      if (!isMounted.current || !isScreenFocused.current) return;

      // Preload first 3 chunks (reduced from 5)
      await preloadNextChunks(0, 3);

      if (!isMounted.current || !isScreenFocused.current) return;

      setIsLoading(false);
      currentIndex.current = 0;

      startProgressTracking();
      playNextChunk();

    } catch (error) {
      console.error("Speech generation error:", error);
      if (isMounted.current) {
        Alert.alert("Error", "Failed to generate speech");
        setIsLoading(false);
        setIsPreparingAudio(false);
        setLoadingMessage('');
        setPlaying(false);
      }
      stopProgressTracking();
    }
  };

  const stopAudio = async () => {
    await stopPlayback();
    reset();

  };

  const downloadAudio = async (text, filename = 'audio.wav') => {
    if (isDownloading) {
      Alert.alert('Download in Progress', 'Please wait for the current download to complete');
      return;
    }

    try {
      setIsDownloading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Media library permission is required');
        setIsDownloading(false);
        return;
      }

      const audioUrl = await generateAudioFromText(text);
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const downloadResult = await FileSystem.downloadAsync(audioUrl, fileUri);

      if (downloadResult.status === 200) {
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync('TTS Audio', asset, false);
        Alert.alert('Success', 'Audio saved to your device');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert("Error", "Failed to download audio");
    } finally {
      setIsDownloading(false);
    }
  };

  const executeDownload = async () => {
    if (!text) return;
    if (isDownloading) {
      Alert.alert('Download in Progress', 'Please wait for the current download to complete');
      return;
    }
    await downloadAudio(text, `speech_${Date.now()}.wav`);
  };

  const handleDownload = async () => {
    // Store the actual upload function as pending action
    pendingActionRef.current = executeDownload;

    // Show the ad
    setShowAd(true);
  };



  const restart = async () => {
    if (isLoading || isPreparingAudio) {
      Alert.alert("Loading", "Please wait for the current operation to complete");
      return;
    }

    await stopPlayback();
    reset();
    setTimeout(() => {
      if (isMounted.current && isScreenFocused.current) {
        speak();
      }
    }, 100);
  };

  const increaseSpeed = async () => {
    if (isLoading || isPreparingAudio) {
      Alert.alert("Loading", "Please wait for the current operation to complete");
      return;
    }

    const newSpeed = speed < 2.0 ? speed + 0.25 : 1.0;
    setSpeed(newSpeed);

    if (playing && currentSound.current && !paused) {
      try {
        await currentSound.current.setRateAsync(newSpeed, false);
      } catch (error) {
        console.warn("Could not update playback speed:", error.message);
        // Restart current chunk with new speed
        const currentChunk = currentIndex.current;
        await currentSound.current.pauseAsync();
        await currentSound.current.unloadAsync();
        currentSound.current = null;
        isPlayingChunk.current = false;

        setTimeout(() => {
          if (isMounted.current && isScreenFocused.current) {
            playNextChunk();
          }
        }, 100);
      }
    }
  };

  const estimateDuration = (text) => {
    const words = text.split(/\s+/).length;
    return ((words / 150) * 60) / speed;
  };

  const formatDuration = (seconds) => {
    if (seconds >= 60) {
      const minutes = (seconds / 60).toFixed(1);
      return `${minutes}m`;
    } else {
      return `${seconds.toFixed(1)}s`;
    }
  };

  const getPlayButtonContent = () => {
    if (isLoading || isPreparingAudio) {
      return <ActivityIndicator color="white" />;
    } else if (playing && !paused) {
      return <FontAwesome name="pause" size={28} color="white" />;
    } else {
      return <FontAwesome name="play" size={22} color="white" />;
    }
  };

  const isButtonDisabled = () => {
    return isLoading || isPreparingAudio || !text;
  };

  return (
    <View style={styles.container}>
      <View style={styles.languageContainer}>
        <Text style={styles.label}>Language:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedLanguage}
            style={styles.picker}
            dropdownIconColor="#3273F6"
            onValueChange={setSelectedLanguage}
            enabled={!playing && !isLoading && !isPreparingAudio}
          >
            {languages.map((lang) => (
              <Picker.Item key={lang} label={lang.split(' (')[0]} value={lang} />
            ))}
          </Picker>
        </View>
      </View>

      {cacheStatus && (
        <View style={styles.cacheStatusContainer}>
          <Text style={styles.cacheStatusText}>Cache: {cacheStatus}</Text>
        </View>
      )}

      {(isLoading || isPreparingAudio) && loadingMessage && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3273F6" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      )}

      <Slider
        style={{ width: '100%', height: 35 }}
        minimumValue={0}
        maximumValue={totalDuration}
        value={elapsedTime}
        minimumTrackTintColor="#3273F6"
        maximumTrackTintColor="#d3d3d3"
        disabled={!playing || isLoading || isPreparingAudio}
        onSlidingComplete={async (value) => {
          if (playing && chunks.current.length > 0 && !isLoading && !isPreparingAudio && isMounted.current && isScreenFocused.current) {
            const estimatedDuration = estimateDuration(text);
            const chunkDuration = estimatedDuration / chunks.current.length;
            const newChunkIndex = Math.floor((value / 1000) / chunkDuration);
            const targetIndex = Math.min(Math.max(0, newChunkIndex), chunks.current.length - 1);

            if (targetIndex !== currentIndex.current) {
              currentIndex.current = targetIndex;
              totalElapsedTime.current = targetIndex * chunkDuration;

              if (currentSound.current) {
                await currentSound.current.pauseAsync();
                await currentSound.current.unloadAsync();
                currentSound.current = null;
              }
              isPlayingChunk.current = false;
              setIsPreparingAudio(true);
              playNextChunk();
            }
          }
        }}
      />

      <View style={styles.Time}>
        <Text style={styles.TimeTxt}>
          {progress.toFixed(0)}%
        </Text>
        <Text style={styles.TimeTxt}>
          {formatDuration(estimateDuration(text))}
        </Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.controlButton, { opacity: isButtonDisabled() ? 0.5 : 1 }]}
          onPress={restart}
          disabled={isButtonDisabled()}
        >
          <FontAwesome6 name="rotate-left" size={22} color="#9E9898" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, { opacity: isButtonDisabled() ? 0.7 : 1 }]}
          onPress={speak}
          disabled={isButtonDisabled()}
        >
          {getPlayButtonContent()}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { opacity: !playing ? 0.5 : 1 }]}
          onPress={stopAudio}
          disabled={!playing}
        >
          <FontAwesome name="stop" size={22} color="#9E9898" />
          <Text style={styles.controlText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { opacity: isButtonDisabled() ? 0.5 : 1 }]}
          onPress={increaseSpeed}
          disabled={isButtonDisabled()}
        >
          <View style={styles.speedContainer}>
            <Text style={styles.speedText}>{speed.toFixed(2)}x</Text>
          </View>
          <Text style={styles.controlText}>Speed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownload}
          disabled={isDownloading || !text || isLoading || isPreparingAudio}
          style={[
            styles.controlButton,
            { opacity: (isDownloading || !text || isLoading || isPreparingAudio) ? 0.5 : 1 }
          ]}
        >
          {isDownloading ? (
            <MaterialCommunityIcons name="progress-download" size={24} color="black" />
          ) : (
            <MaterialIcons name="download" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>

      {/* Loading overlay */}
      {(isLoading || isPreparingAudio) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#3273F6" />
            <Text style={styles.loadingOverlayText}>
              {isLoading ? 'Initializing...' : loadingMessage || 'Preparing audio...'}
            </Text>
          </View>
        </View>
      )}

      {/* Ad Interstitial Modal */}

      <AdSenseInterstitialModal
        visible={showAd}
        onClose={handleCloseAd}
        onAdClosed={handleAdClosed}
        autoShow={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    padding: 16,
    position: 'relative',
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginRight: 8,
    fontSize: 14,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3273F6',
    borderRadius: 8,
  },
  picker: {
    width: '100%',
  },
  cacheStatusContainer: {
    paddingVertical: 5,
    alignItems: 'center',
  },
  cacheStatusText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3273F6',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#3273F6',
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
  },
  speedContainer: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  speedText: {
    fontSize: 11,
  },
  controlText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold'
  },
  Time: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: -20,
    width: '100%',
    paddingHorizontal: 13
  },
  TimeTxt: {
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: "500",
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingOverlayText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3273F6',
    textAlign: 'center',
  },
});

export default TTSFunction;