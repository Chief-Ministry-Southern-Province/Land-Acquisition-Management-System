export interface AttachedFile {
  id: string;
  docId?: string;
  name: string;
  size: number | string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface ChecklistItem {
  id: string;
  stageId: number;
  stageName: string;
  title: string;
  description: string;
  sectionRef: string;
  isMandatory: boolean;
  isCompleted: boolean;
  completedAt?: string | null;
  completedBy?: string | null;
  remarks?: string;
}

export interface ChecklistStage {
  id: number;
  name: string;
  description: string;
  actSection: string;
  items: ChecklistItem[];
  attachedFiles?: AttachedFile[];
}

export const DEFAULT_STAGES_EN: ChecklistStage[] = [
  {
    id: 1,
    name: 'Section 2 Order & Preliminary Survey',
    description:
      'Submission of requisition application, Section 2 order issuance, and preliminary tracing plan.',
    actSection: 'Section 2 Preliminary Phase',
    items: [
      {
        id: 'chk-1-1',
        stageId: 1,
        stageName: 'Section 2 Order & Preliminary Survey',
        title: 'Requisition Application Submission',
        description:
          'Requesting Ministry submits land acquisition requisition application form to the Ministry of Lands.',
        sectionRef: 'LAA Requisition',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-1-2',
        stageId: 1,
        stageName: 'Section 2 Order & Preliminary Survey',
        title: 'Section 2 Order Issuance & Notice Display',
        description:
          'Divisional Secretary displays statutory Section 2 notices in Sinhala, Tamil, and English at site & public locations.',
        sectionRef: 'LAA Sec. 2(1)',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-1-3',
        stageId: 1,
        stageName: 'Section 2 Order & Preliminary Survey',
        title: 'Preparation of Preliminary Tracing Schedule',
        description:
          'Survey Department prepares preliminary survey schedule, boundary tracing, and preliminary plan schedule.',
        sectionRef: 'LAA Sec. 3',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 2,
    name: 'Section 4 Notice & Objections Inquiry',
    description:
      'Publishing Section 4 notice, receiving owner objections, and holding objection inquiries.',
    actSection: 'Section 4 Objections Phase',
    items: [
      {
        id: 'chk-2-1',
        stageId: 2,
        stageName: 'Section 4 Notice & Objections Inquiry',
        title: 'Displaying Section 4 Statutory Notices',
        description:
          'Divisional Secretary displays statutory Section 4 notices for public inspection and owner notifications.',
        sectionRef: 'LAA Sec. 4(1)',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-2-2',
        stageId: 2,
        stageName: 'Section 4 Notice & Objections Inquiry',
        title: 'Submission of Objections by Property Owners',
        description:
          'Receive written objections and title claims from affected land owners and interested parties.',
        sectionRef: 'LAA Sec. 4(2)',
        isMandatory: false,
        isCompleted: false,
      },
      {
        id: 'chk-2-3',
        stageId: 2,
        stageName: 'Section 4 Notice & Objections Inquiry',
        title: 'Conducting Objections Inquiries',
        description:
          'Requesting Ministry and Acquiring Officer hold formal inquiries into submitted land owner objections.',
        sectionRef: 'LAA Sec. 4(3)',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 3,
    name: 'Section 5 Declaration & Preliminary Plan (PP)',
    description:
      'Issuing Section 5 declaration of public purpose and preparing official Preliminary Plan (PP).',
    actSection: 'Section 5 Declaration Phase',
    items: [
      {
        id: 'chk-3-1',
        stageId: 3,
        stageName: 'Section 5 Declaration & Preliminary Plan (PP)',
        title: 'Issuance of Section 5 Public Purpose Declaration',
        description:
          'Ministry issues Section 5 declaration published in the Government Gazette and newspapers.',
        sectionRef: 'LAA Sec. 5(1)',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-3-2',
        stageId: 3,
        stageName: 'Section 5 Declaration & Preliminary Plan (PP)',
        title: 'Preparation of Official Preliminary Plan (PP)',
        description:
          'Survey Department completes field boundary surveys and issues certified Preliminary Plan (PP).',
        sectionRef: 'LAA Sec. 6',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 4,
    name: 'Section 7 Gazette & Compensation Inquiries',
    description:
      'Gazetting Section 7 notice, valuation assessment, Section 9 inquiries, and Section 10 award.',
    actSection: 'Section 7, 9 & 10 Phase',
    items: [
      {
        id: 'chk-4-1',
        stageId: 4,
        stageName: 'Section 7 Gazette & Compensation Inquiries',
        title: 'Section 7 Gazette & Newspaper Notice Publication',
        description:
          'Publish Section 7 notices in Gazette and national Sinhala, Tamil, and English newspapers (Circular 01/2017).',
        sectionRef: 'LAA Sec. 7(1)',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-4-2',
        stageId: 4,
        stageName: 'Section 7 Gazette & Compensation Inquiries',
        title: 'Conducting Section 9 Compensation & Title Inquiries',
        description:
          'Divisional Secretary holds formal inquiry into ownership claims, title deeds, and compensation rights.',
        sectionRef: 'LAA Sec. 9',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-4-3',
        stageId: 4,
        stageName: 'Section 7 Gazette & Compensation Inquiries',
        title: 'Obtaining Valuation Report from Chief Valuer',
        description:
          'Valuation Department inspects land, crops, and buildings to issue official valuation assessment report.',
        sectionRef: 'LAA Sec. 7(3)',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-4-4',
        stageId: 4,
        stageName: 'Section 7 Gazette & Compensation Inquiries',
        title: 'Section 10 Entitlement Determination & Award',
        description:
          'Divisional Secretary determines persons entitled to compensation and issues statutory award notice.',
        sectionRef: 'LAA Sec. 10',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 5,
    name: 'Release of Compensation & Interest Funds',
    description:
      'Financial clearance, fund allocation, and disbursement of compensation payments and interest.',
    actSection: 'Compensation & Interest Phase',
    items: [
      {
        id: 'chk-5-1',
        stageId: 5,
        stageName: 'Release of Compensation & Interest Funds',
        title: 'Allocation & Financial Release of Compensation Funds',
        description:
          'Requesting Ministry allocates and releases statutory compensation and interest funds on Ministry provision.',
        sectionRef: 'LAA Sec. 17',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-5-2',
        stageId: 5,
        stageName: 'Release of Compensation & Interest Funds',
        title: 'Disbursement of Compensation & Accrued Interest',
        description:
          'Divisional Secretary pays statutory compensation vouchers and interest to verified land owners.',
        sectionRef: 'LAA Sec. 18 & 29',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 6,
    name: 'Section 38 Order & Land Possession Handover',
    description:
      'Publishing Section 38 vesting order, taking physical possession, registering State land, and issuing handover certificate.',
    actSection: 'Section 38 Possession & Handover',
    items: [
      {
        id: 'chk-6-1',
        stageId: 6,
        stageName: 'Section 38 Order & Land Possession Handover',
        title: 'Issuance of Section 38 (or 38A Executive) Order',
        description:
          'Publish Section 38 Gazette Order vesting land title absolute in the State (or 38A Urgent Executive Order).',
        sectionRef: 'LAA Sec. 38 / 38A',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-6-2',
        stageId: 6,
        stageName: 'Section 38 Order & Land Possession Handover',
        title: 'Surrender & Taking Over Physical Possession of Land',
        description:
          'Land owner surrenders physical possession; Divisional Secretary & Requesting Ministry take over land.',
        sectionRef: 'LAA Sec. 38(1)',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-6-3',
        stageId: 6,
        stageName: 'Section 38 Order & Land Possession Handover',
        title: 'Registering Land Title as State Land',
        description:
          'Divisional Secretary registers property title as State Land in local Land Registry office.',
        sectionRef: 'LAA Sec. 38(2)',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-6-4',
        stageId: 6,
        stageName: 'Section 38 Order & Land Possession Handover',
        title: 'Issuance of Legal Handover Documents to Acquiring Institution',
        description:
          'Divisional Secretary issues legal handover documents and Certificate of Handover to acquiring institution.',
        sectionRef: 'LAA Final Handover',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
];

export const DEFAULT_STAGES_SI: ChecklistStage[] = [
  {
    id: 1,
    name: '2 වන වගන්තිය නියමය නිකුත් කිරීම හා මූලික මිනුම් කටයුතු',
    description:
      'ඉල්ලුම් පත්‍රය ඉදිරිපත් කිරීම, 2 වන වගන්තිය නියමය හා මූලික පිඹුරු කටයුතු.',
    actSection: '2 වන වගන්තිය මූලික අදියර',
    items: [
      {
        id: 'chk-1-1',
        stageId: 1,
        stageName: '2 වන වගන්තිය නියමය නිකුත් කිරීම හා මූලික මිනුම් කටයුතු',
        title: 'අත්කර ගැනීමේ ඉල්ලුම් පත්‍රය ඉදිරිපත් කිරීම',
        description:
          'ඉල්ලුම්කාර අමාත්‍යාංශය මගින් ඉඩම් අමාත්‍යාංශය වෙත අත්කර ගැනීමේ ඉල්ලුම් පත්‍රය ඉදිරිපත් කිරීම.',
        sectionRef: 'අත්කර ගැනීමේ ඉල්ලුම් පත්‍රය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-1-2',
        stageId: 1,
        stageName: '2 වන වගන්තිය නියමය නිකුත් කිරීම හා මූලික මිනුම් කටයුතු',
        title: '2 වන වගන්තිය නියමය නිකුත් කිරීම හා දැන්වීම් ප්‍රදර්ශනය',
        description:
          'ප්‍රාදේශීය ලේකම් විසින් අදාළ ස්ථානවල සහ රාජ්‍ය කාර්යාලවල 2 වන වගන්තිය දැන්වීම් ප්‍රදර්ශනය කිරීම.',
        sectionRef: 'ඉ.අ.පනත 2(1) වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-1-3',
        stageId: 1,
        stageName: '2 වන වගන්තිය නියමය නිකුත් කිරීම හා මූලික මිනුම් කටයුතු',
        title: 'ප්‍රගමන අනුප්‍රමාණය පිළියෙල කිරීම',
        description:
          'මිනින්දෝරු දෙපාර්තමේන්තුව මගින් ප්‍රගමන අනුප්‍රමාණය හා මූලික මිනුම් කාලසටහන පිළියෙල කිරීම.',
        sectionRef: 'ඉ.අ.පනත 3 වන වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 2,
    name: '4 වන වගන්තිය නියමය නිකුත් කිරීම හා විරෝධතා පරීක්ෂණ',
    description:
      '4 වන වගන්තිය දැන්වීම් පළ කිරීම, ඉඩම් හිමියන්ගේ විරෝධතා ලබා ගැනීම හා විරෝධතා පරීක්ෂණ පැවැත්වීම.',
    actSection: '4 වන වගන්තිය විරෝධතා අදියර',
    items: [
      {
        id: 'chk-2-1',
        stageId: 2,
        stageName: '4 වන වගන්තිය නියමය නිකුත් කිරීම හා විරෝධතා පරීක්ෂණ',
        title: '4 වන වගන්තිය ව්‍යවස්ථාපිත දැන්වීම් ප්‍රදර්ශනය කිරීම',
        description:
          'ප්‍රාදේශීය ලේකම් විසින් 4 වන වගන්තිය යටතේ වන දැන්වීම් මහජන ප්‍රදර්ශනය සඳහා පළ කිරීම.',
        sectionRef: 'ඉ.අ.පනත 4(1) වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-2-2',
        stageId: 2,
        stageName: '4 වන වගන්තිය නියමය නිකුත් කිරීම හා විරෝධතා පරීක්ෂණ',
        title: 'ඉඩම් අයිතිවාසිකම් කියන්නන්ගේ විරෝධතා ඉදිරිපත් කිරීම',
        description:
          'බලපෑමට ලක්වන ඉඩම් හිමියන් සහ අයිතිවාසිකම් කියන්නන් විසින් ලිඛිත විරෝධතා ඉදිරිපත් කිරීම.',
        sectionRef: 'ඉ.අ.පනත 4(2) වගන්තිය',
        isMandatory: false,
        isCompleted: false,
      },
      {
        id: 'chk-2-3',
        stageId: 2,
        stageName: '4 වන වගන්තිය නියමය නිකුත් කිරීම හා විරෝධතා පරීක්ෂණ',
        title: 'විරෝධතා පරීක්ෂණ පැවැත්වීම',
        description:
          'ඉල්ලුම්කාර අමාත්‍යාංශය හා නිලධාරීන් විසින් ඉදිරිපත් වූ විරෝධතා පිළිබඳ විරෝධතා පරීක්ෂණ පැවැත්වීම.',
        sectionRef: 'ඉ.අ.පනත 4(3) වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 3,
    name: '5 වන වගන්තිය ප්‍රකාශනය නිකුත් කිරීම හා මූලික පිඹුර (PP) පිළියෙල කිරීම',
    description:
      'මහජන කාර්යය සඳහා 5 වන වගන්තිය ප්‍රකාශනය නිකුත් කිරීම හා මූලික පිඹුර (PP) සකස් කිරීම.',
    actSection: '5 වන වගන්තිය ප්‍රකාශන අදියර',
    items: [
      {
        id: 'chk-3-1',
        stageId: 3,
        stageName:
          '5 වන වගන්තිය ප්‍රකාශනය නිකුත් කිරීම හා මූලික පිඹුර (PP) පිළියෙල කිරීම',
        title: '5 වන වගන්තිය ප්‍රකාශනය නිකුත් කිරීම',
        description:
          'අමාත්‍යාංශය විසින් 5 වන වගන්තිය ප්‍රකාශනය ගැසට් පත්‍රයේ හා පුවත්පත්වල පළ කිරීම.',
        sectionRef: 'ඉ.අ.පනත 5(1) වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-3-2',
        stageId: 3,
        stageName:
          '5 වන වගන්තිය ප්‍රකාශනය නිකුත් කිරීම හා මූලික පිඹුර (PP) පිළියෙල කිරීම',
        title: 'මූලික පිඹුර (PP) පිළියෙල කිරීම',
        description:
          'මිනින්දෝරු දෙපාර්තමේන්තුව මගින් ඉඩම් කැබලි මිනුම් කටයුතු නිමවා සහතික කළ මූලික පිඹුර (PP) ලබා දීම.',
        sectionRef: 'ඉ.අ.පනත 6 වන වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 4,
    name: '7 වන වගන්තිය ගැසට් නිවේදන, පුවත්පත් දැන්වීම් හා වන්දි පරීක්ෂණ',
    description:
      '7 වන වගන්තිය ගැසට් හා පුවත්පත් දැන්වීම් පළ කිරීම, තක්සේරු වාර්තා ලබා ගැනීම හා 9 වන වගන්තිය වන්දි පරීක්ෂණ.',
    actSection: '7, 9 සහ 10 වන වගන්ති අදියර',
    items: [
      {
        id: 'chk-4-1',
        stageId: 4,
        stageName:
          '7 වන වගන්තිය ගැසට් නිවේදන, පුවත්පත් දැන්වීම් හා වන්දි පරීක්ෂණ',
        title: '7 වන වගන්තිය ගැසට් නිවේදන හා පුවත්පත් දැන්වීම් පළ කිරීම',
        description:
          'සිංහල, දෙමළ සහ ඉංග්‍රීසි මාධ්‍යවලින් ගැසට් පත්‍රයේ සහ ජාතික පුවත්පත්වල 7 වන වගන්තිය දැන්වීම් පළ කිරීම (අමාත්‍යාංශ වක්‍රලේඛ 01/2017).',
        sectionRef: 'ඉ.අ.පනත 7(1) වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-4-2',
        stageId: 4,
        stageName:
          '7 වන වගන්තිය ගැසට් නිවේදන, පුවත්පත් දැන්වීම් හා වන්දි පරීක්ෂණ',
        title: '9 වන වගන්තිය වන්දි හා අයිතිවාසිකම් පරීක්ෂණ පැවැත්වීම',
        description:
          'ප්‍රාදේශීය ලේකම් විසින් ඉඩම් හිමිකම් හා වන්දි ඉල්ලීම් පිළිබඳ 9 වන වගන්තිය යටතේ නිල පරීක්ෂණය පැවැත්වීම.',
        sectionRef: 'ඉ.අ.පනත 9 වන වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-4-3',
        stageId: 4,
        stageName:
          '7 වන වගන්තිය ගැසට් නිවේදන, පුවත්පත් දැන්වීම් හා වන්දි පරීක්ෂණ',
        title: 'රජයේ ප්‍රධාන තක්සේරුකරුගෙන් තක්සේරු වාර්තාව ලබා ගැනීම',
        description:
          'තක්සේරු දෙපාර්තමේන්තුව මගින් ඉඩම, වගාවන් සහ ගොඩනැගිලි පරීක්ෂා කර නිල තක්සේරු වාර්තාව ලබා දීම.',
        sectionRef: 'ඉ.අ.පනත 7(3) වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-4-4',
        stageId: 4,
        stageName:
          '7 වන වගන්තිය ගැසට් නිවේදන, පුවත්පත් දැන්වීම් හා වන්දි පරීක්ෂණ',
        title:
          'වන්දි ගෙවිය යුතු පුද්ගලයින් නිරවුල් කිරීම හා 10 වන වගන්තිය තීරණය',
        description:
          'ප්‍රාදේශීය ලේකම් විසින් වන්දි හිමිකරුවන් නිරවුල් කර 10 වන වගන්තිය යටතේ වන්දි තීරණය නිකුත් කිරීම.',
        sectionRef: 'ඉ.අ.පනත 10 වන වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 5,
    name: 'වන්දි හා පොලී ප්‍රතිපාදන මුදා හැරීම හා ගෙවීම',
    description:
      'වන්දි සහ පොලී මුදල් සඳහා ප්‍රතිපාදන මුදා හැරීම සහ හිමිකරුවන්ට වන්දි ගෙවීම.',
    actSection: 'වන්දි හා පොලී ගෙවීමේ අදියර',
    items: [
      {
        id: 'chk-5-1',
        stageId: 5,
        stageName: 'වන්දි හා පොලී ප්‍රතිපාදන මුදා හැරීම හා ගෙවීම',
        title: 'වන්දි හා පොලී සඳහා මූල්‍ය ප්‍රතිපාදන මුදා හැරීම',
        description:
          'ඉල්ලුම්කාර අමාත්‍යාංශය මගින් අදාළ වන්දි හා පොලී ගෙවීම් සඳහා ප්‍රතිපාදන මුදා හැරීම.',
        sectionRef: 'ඉ.අ.පනත 17 වන වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-5-2',
        stageId: 5,
        stageName: 'වන්දි හා පොලී ප්‍රතිපාදන මුදා හැරීම හා ගෙවීම',
        title: 'වන්දි හා පොලී මුදල් හිමිකරුවන්ට ගෙවීම',
        description:
          'ප්‍රාදේශීය ලේකම් විසින් තහවුරු කරන ලද ඉඩම් හිමියන් වෙත වන්දි සහ එකතු වූ පොලී මුදල් ගෙවීම.',
        sectionRef: 'ඉ.අ.පනත 18 සහ 29 වගන්ති',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
  {
    id: 6,
    name: '38 වන වගන්තිය ආඥාව නිකුත් කිරීම හා භුක්තිය භාරදීම',
    description:
      '38 වන වගන්තිය ආඥාව පළ කිරීම, භුක්තිය භාර ගැනීම, රජයේ ඉඩමක් ලෙස ලියාපදිංචි කිරීම සහ අත්කරගත් ආයතනයට භාරදීම.',
    actSection: '38 වන වගන්තිය භුක්තිය හා භාරදීම',
    items: [
      {
        id: 'chk-6-1',
        stageId: 6,
        stageName: '38 වන වගන්තිය ආඥාව නිකුත් කිරීම හා භුක්තිය භාරදීම',
        title: '38 වන වගන්තිය ආඥාව (හෝ 38 "අ" විධායක ආඥාව) නිකුත් කිරීම',
        description:
          'ඉඩමේ සම්පූර්ණ අයිතිය රජයට පවරා ගැනීමේ 38 වන වගන්තිය ගැසට් ආඥාව (හෝ 38 "අ" හදිසි විධායක ආඥාව) පළ කිරීම.',
        sectionRef: 'ඉ.අ.පනත 38 / 38"අ" වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-6-2',
        stageId: 6,
        stageName: '38 වන වගන්තිය ආඥාව නිකුත් කිරීම හා භුක්තිය භාරදීම',
        title: 'ඉඩමේ භුක්තිය භාරදීම සහ ප්‍රාදේශීය ලේකම් භුක්තිය භාර ගැනීම',
        description:
          'ඉඩම් හිමියා විසින් භුක්තිය අත්හැරීම; ප්‍රදේශීය ලේකම් සහ ඉල්ලුම්කාර අමාත්‍යාංශය මගින් භුක්තිය භාර ගැනීම.',
        sectionRef: 'ඉ.අ.පනත 38(1) වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-6-3',
        stageId: 6,
        stageName: '38 වන වගන්තිය ආඥාව නිකුත් කිරීම හා භුක්තිය භාරදීම',
        title: 'රජයේ ඉඩමක් ලෙස ඉඩමේ අයිතිය ලියාපදිංචි කිරීම',
        description:
          'ප්‍රාදේශීය ලේකම් විසින් අත්කරගත් ඉඩම රජයේ ඉඩමක් ලෙස ඉඩම් ලියාපදිංචි කිරීමේ කාර්යාලයේ ලියාපදිංචි කිරීම.',
        sectionRef: 'ඉ.අ.පනත 38(2) වගන්තිය',
        isMandatory: true,
        isCompleted: false,
      },
      {
        id: 'chk-6-4',
        stageId: 6,
        stageName: '38 වන වගන්තිය ආඥාව නිකුත් කිරීම හා භුක්තිය භාරදීම',
        title:
          'අත්කරගත් ආයතනය වෙත නීත්‍යානුකූල ලේඛන හා භාරදීමේ සහතිකය නිකුත් කිරීම',
        description:
          'ප්‍රාදේශීය ලේකම් විසින් ඉඩම අත්කරගත් ආයතනය වෙත නීත්‍යානුකූල ලේඛන සහ භාරදීමේ සහතිකය ලබා දීම.',
        sectionRef: 'ඉඩම් අවසාන භාරදීම',
        isMandatory: true,
        isCompleted: false,
      },
    ],
  },
];

export const isImageFile = (fileName: string): boolean => {
  if (!fileName) {
    return false;
  }

  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
};

export const formatBytes = (bytes: number | string): string => {
  if (typeof bytes === 'string' && bytes.trim().length > 0) {
    return bytes;
  }

  if (!bytes || bytes === 0) {
    return '0 B';
  }

  const num = typeof bytes === 'number' ? bytes : Number(bytes);

  if (isNaN(num) || num <= 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(k));

  return `${parseFloat((num / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const syncStageDocuments = (
  currentStages: ChecklistStage[],
  projectDocs: any[] = [],
): ChecklistStage[] => {
  if (!Array.isArray(currentStages)) {
    return [];
  }

  return currentStages.map((stage) => {
    if (!stage) {
      return stage;
    }

    const stageId = stage.id;
    const categoryKey = `stage_${stageId}`;
    const matchedDocs = projectDocs.filter((doc) => {
      if (!doc || !doc.document_category) {
        return false;
      }

      const cat = String(doc.document_category).toLowerCase().trim();

      return (
        cat === categoryKey.toLowerCase() ||
        cat === `stage ${stageId}` ||
        cat === `stage_${stageId}`
      );
    });

    const docAttachedFiles: AttachedFile[] = matchedDocs.map((doc) => ({
      id: String(doc.id),
      docId: String(doc.id),
      name:
        doc.original_filename || doc.stored_filename || `Document #${doc.id}`,
      size: doc.file_size || 0,
      uploadedAt: doc.upload_date || doc.created_at || new Date().toISOString(),
      uploadedBy: doc.user?.name || 'Development Officer',
    }));

    const existingFiles = stage.attachedFiles || [];
    const combinedFiles = [...existingFiles];

    for (const newDoc of docAttachedFiles) {
      const exists = combinedFiles.some(
        (f) =>
          (f.docId && String(f.docId) === String(newDoc.docId)) ||
          String(f.id) === String(newDoc.id),
      );

      if (!exists) {
        combinedFiles.push(newDoc);
      }
    }

    return {
      ...stage,
      actSection: stage.actSection || `Stage ${stageId}`,
      attachedFiles: combinedFiles,
    };
  });
};

export const normalizeAndSyncStages = (
  loadedStages: any[],
  defaultStages: ChecklistStage[],
  projectDocs: any[] = [],
): ChecklistStage[] => {
  const baseStages =
    Array.isArray(loadedStages) && loadedStages.length > 0
      ? loadedStages
      : defaultStages;

  const mergedStages: ChecklistStage[] = defaultStages.map((defStage) => {
    const loadedStage = baseStages.find(
      (s: any) => s && Number(s.id) === Number(defStage.id),
    );

    if (!loadedStage) {
      return defStage;
    }

    const loadedItems: any[] = Array.isArray(loadedStage.items)
      ? loadedStage.items
      : [];

    const mergedItems = defStage.items.map((defItem) => {
      const loadedItem = loadedItems.find(
        (i: any) => i && String(i.id) === String(defItem.id),
      );

      if (!loadedItem) {
        return defItem;
      }

      return {
        ...loadedItem,
        id: defItem.id,
        stageId: defItem.stageId,
        stageName: defStage.name,
        title: defItem.title,
        description: defItem.description,
        sectionRef: defItem.sectionRef,
        isMandatory:
          defItem.isMandatory !== undefined
            ? Boolean(defItem.isMandatory)
            : Boolean(loadedItem.isMandatory),
        isCompleted: Boolean(loadedItem.isCompleted),
        completedAt: loadedItem.completedAt || null,
        completedBy: loadedItem.completedBy || null,
        remarks: loadedItem.remarks || '',
      };
    });

    return {
      ...loadedStage,
      id: defStage.id,
      name: defStage.name,
      actSection: defStage.actSection,
      description: defStage.description,
      items: mergedItems,
      attachedFiles: Array.isArray(loadedStage.attachedFiles)
        ? loadedStage.attachedFiles
        : [],
    };
  });

  return syncStageDocuments(mergedStages, projectDocs);
};
