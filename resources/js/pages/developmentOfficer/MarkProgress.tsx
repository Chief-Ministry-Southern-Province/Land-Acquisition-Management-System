import { usePage, router } from '@inertiajs/react';
import {
  CheckSquare,
  Square,
  CheckCircle2,
  Clock,
  FolderKanban,
  Save,
  Lock,
  Search,
  Info,
  ShieldCheck,
  Check,
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  Paperclip,
  FileText,
  Trash2,
  Download,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { confirmAction, toastError, toastSuccess } from '@/lib/alerts';
import {
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from '@/services/documentManagementService';
import {
  getProjectProgress,
  saveProjectProgress,
} from '@/services/projectProgressService';
import { getProjects, getProject } from '@/services/projectsManagementService';
import type { Project } from '@/services/projectsManagementService';

interface AttachedFile {
  id: string;
  docId?: string;
  name: string;
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
}

interface ChecklistItem {
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

interface ChecklistStage {
  id: number;
  name: string;
  description: string;
  actSection: string;
  items: ChecklistItem[];
  attachedFiles?: AttachedFile[];
}

const DEFAULT_STAGES_EN: ChecklistStage[] = [
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

const DEFAULT_STAGES_SI: ChecklistStage[] = [
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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function MarkProgress() {
  const { t, locale } = useTranslation();
  const defaultStagesForLocale = useMemo(
    () => (locale === 'si' ? DEFAULT_STAGES_SI : DEFAULT_STAGES_EN),
    [locale],
  );
  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userRole = user?.role?.role_name || user?.role || 'User';
  const isDO = userRole === 'DO';

  // State management
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [stages, setStages] = useState<ChecklistStage[]>(
    defaultStagesForLocale,
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<
    'all' | 'completed' | 'pending' | 'mandatory'
  >('all');
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [uploadingStageId, setUploadingStageId] = useState<number | null>(null);

  // Load projects list on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const data = await getProjects();

        if (Array.isArray(data)) {
          setProjectsList(data);

          if (data.length > 0) {
            setSelectedProjectId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        toastError(
          t('error_loading_projects', 'Failed to load projects list.'),
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [t]);

  // Load project details & checklist state from localStorage when project changes
  useEffect(() => {
    let isMounted = true;

    if (!selectedProjectId) {
      return;
    }

    const loadProjectData = async () => {
      try {
        const projData = await getProject(selectedProjectId);

        if (!isMounted) {
          return;
        }

        setSelectedProject(projData);

        // Fetch progress from backend 1-to-1 ProjectProgressService
        try {
          const res = await getProjectProgress(selectedProjectId);

          if (
            isMounted &&
            res.progress?.stages &&
            Array.isArray(res.progress.stages) &&
            res.progress.stages.length > 0
          ) {
            setStages(res.progress.stages);

            if (res.progress.last_saved_at) {
              setLastSavedTime(
                new Date(res.progress.last_saved_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
              );
            }

            return;
          }
        } catch (apiErr) {
          console.warn('Backend progress service fetch notice:', apiErr);
        }

        // Load persisted checklist state from localStorage if backend has no record yet
        const storageKey = `lams_do_checklist_${selectedProjectId}`;
        const savedChecklist = localStorage.getItem(storageKey);

        if (savedChecklist) {
          try {
            const parsedStages: ChecklistStage[] = JSON.parse(savedChecklist);

            setStages(parsedStages);
          } catch {
            setStages(defaultStagesForLocale);
          }
        } else {
          // Initialize completion status based on project status if available
          const isSubmitted = projData.doStatus === 'submitted';
          const isCompleted =
            projData.caseStatus === 'completed' ||
            projData.status === 'completed';

          const initStages = defaultStagesForLocale.map((stg) => ({
            ...stg,
            items: stg.items.map((item) => {
              if (isCompleted) {
                return {
                  ...item,
                  isCompleted: true,
                  completedBy: 'System Auto',
                  completedAt: new Date().toISOString(),
                };
              }

              if (isSubmitted && stg.id <= 2) {
                return {
                  ...item,
                  isCompleted: true,
                  completedBy: user?.name || 'DO Officer',
                  completedAt: new Date().toISOString(),
                };
              }

              return item;
            }),
          }));

          setStages(initStages);
        }
      } catch (err) {
        console.error('Failed to load selected project details:', err);
      }
    };

    loadProjectData();

    return () => {
      isMounted = false;
    };
  }, [selectedProjectId, user?.name, defaultStagesForLocale]);

  // Toggle single checklist item
  const handleToggleItem = (itemId: string) => {
    if (!isDO) {
      toastError(
        t(
          'only_do_can_mark_progress',
          'Only Development Officers (DO) can update progress checklist items.',
        ),
      );

      return;
    }

    setStages((prevStages) =>
      prevStages.map((stage) => ({
        ...stage,
        items: stage.items.map((item) => {
          if (item.id === itemId) {
            const newCompleted = !item.isCompleted;

            return {
              ...item,
              isCompleted: newCompleted,
              completedAt: newCompleted ? new Date().toISOString() : null,
              completedBy: newCompleted
                ? user?.name || 'Development Officer'
                : null,
            };
          }

          return item;
        }),
      })),
    );
  };

  // Update item remarks
  const handleRemarkChange = (itemId: string, remark: string) => {
    if (!isDO) {
      return;
    }

    setStages((prevStages) =>
      prevStages.map((stage) => ({
        ...stage,
        items: stage.items.map((item) =>
          item.id === itemId ? { ...item, remarks: remark } : item,
        ),
      })),
    );
  };

  // Optional File Upload Handler per Stage (supports multiple files per stage)
  const handleStageFileUpload = async (stageId: number, file: File) => {
    if (!isDO) {
      toastError(
        t(
          'only_do_can_upload',
          'Only Development Officers (DO) can attach files.',
        ),
      );

      return;
    }

    if (!file) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toastError(t('file_too_large', 'File size exceeds 10MB limit.'));

      return;
    }

    try {
      setUploadingStageId(stageId);

      let uploadedDoc: any = null;

      if (selectedProjectId && user?.id) {
        try {
          uploadedDoc = await uploadDocument(
            file,
            String(user.id),
            selectedProjectId,
            `stage_${stageId}`,
          );
        } catch (uploadErr) {
          console.warn('Backend document upload notice:', uploadErr);
        }
      }

      const newFile: AttachedFile = {
        id: uploadedDoc?.id
          ? String(uploadedDoc.id)
          : `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        docId: uploadedDoc?.id ? String(uploadedDoc.id) : undefined,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.name || 'Development Officer',
      };

      setStages((prevStages) =>
        prevStages.map((stage) => {
          if (stage.id === stageId) {
            const existingFiles = stage.attachedFiles || [];

            return {
              ...stage,
              attachedFiles: [...existingFiles, newFile],
            };
          }

          return stage;
        }),
      );

      toastSuccess(
        t(
          'file_attached_success',
          'File ":filename" attached successfully to stage.',
        ).replace(':filename', file.name),
      );
    } catch (error) {
      console.error('Failed to attach file:', error);
      toastError(
        t('failed_to_attach_file', 'Failed to attach file. Please try again.'),
      );
    } finally {
      setUploadingStageId(null);
    }
  };

  // Optional File Download Handler
  const handleFileDownload = async (fileObj: AttachedFile) => {
    if (fileObj.docId) {
      try {
        await downloadDocument(fileObj.docId, fileObj.name);

        return;
      } catch (err) {
        console.warn('Failed to download document via server API:', err);
      }
    }

    toastSuccess(
      t('downloading_file', 'Downloading file: :name').replace(
        ':name',
        fileObj.name,
      ),
    );
  };

  // Optional File Delete Handler per Stage
  const handleStageFileDelete = async (stageId: number, fileId: string) => {
    if (!isDO) {
      return;
    }

    const confirmed = await confirmAction({
      title: t('delete_attachment_title', 'Delete Attached File?'),
      text: t(
        'delete_attachment_text',
        'Are you sure you want to remove this attached file from this stage?',
      ),
      confirmButtonText: t('delete', 'Delete'),
    });

    if (!confirmed) {
      return;
    }

    const targetStage = stages.find((s) => s.id === stageId);
    const targetFile = targetStage?.attachedFiles?.find((f) => f.id === fileId);

    if (targetFile?.docId) {
      try {
        await deleteDocument(targetFile.docId);
      } catch (err) {
        console.warn('Backend document delete notice:', err);
      }
    }

    setStages((prevStages) =>
      prevStages.map((stage) => {
        if (stage.id === stageId) {
          return {
            ...stage,
            attachedFiles: (stage.attachedFiles || []).filter(
              (f) => f.id !== fileId,
            ),
          };
        }

        return stage;
      }),
    );

    toastSuccess(t('attachment_removed', 'Attachment removed successfully.'));
  };

  // Mark all items in active stage as completed
  const handleMarkStageComplete = async (stageId: number) => {
    if (!isDO) {
      toastError(
        t(
          'only_do_can_mark_progress',
          'Only Development Officers (DO) can update progress checklist items.',
        ),
      );

      return;
    }

    const targetStage = stages.find((s) => s.id === stageId);

    if (!targetStage) {
      return;
    }

    const confirmed = await confirmAction({
      title: t('mark_stage_complete_title', 'Mark Entire Stage Complete?'),
      text: t(
        'mark_stage_complete_text',
        'Are you sure you want to mark all checklist items in ":stage" as completed?',
      ).replace(':stage', targetStage.name),
      confirmButtonText: t('mark_complete', 'Mark Complete'),
    });

    if (confirmed) {
      setStages((prevStages) =>
        prevStages.map((stage) =>
          stage.id === stageId
            ? {
                ...stage,
                items: stage.items.map((item) => ({
                  ...item,
                  isCompleted: true,
                  completedAt: item.completedAt || new Date().toISOString(),
                  completedBy:
                    item.completedBy || user?.name || 'Development Officer',
                })),
              }
            : stage,
        ),
      );
      toastSuccess(
        t('stage_marked_complete', 'Stage marked as completed successfully.'),
      );
    }
  };

  // Save current progress
  const handleSaveProgress = async () => {
    if (!isDO) {
      toastError(
        t(
          'only_do_can_mark_progress',
          'Only Development Officers (DO) can update progress checklist items.',
        ),
      );

      return;
    }

    if (!selectedProjectId) {
      toastError(
        t(
          'select_project_first',
          'Please select an acquisition project first.',
        ),
      );

      return;
    }

    try {
      setSaving(true);
      const storageKey = `lams_do_checklist_${selectedProjectId}`;

      localStorage.setItem(storageKey, JSON.stringify(stages));

      // Save to backend service via API (DO Authorized Only)
      try {
        const res = await saveProjectProgress(selectedProjectId, stages);

        if (res.progress?.stages) {
          setStages(res.progress.stages);
        }
      } catch (backendErr) {
        console.warn('Saved locally, backend sync notice:', backendErr);
      }

      const nowStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setLastSavedTime(nowStr);
      toastSuccess(
        t('progress_saved_success', 'Progress checklist saved successfully!'),
      );
    } catch (err) {
      console.error('Failed to save progress checklist:', err);
      toastError(
        t(
          'failed_to_save_progress',
          'Failed to save progress. Please try again.',
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  // Computed Statistics
  const allItems = useMemo(() => stages.flatMap((s) => s.items), [stages]);
  const totalCount = allItems.length;
  const completedCount = useMemo(
    () => allItems.filter((i) => i.isCompleted).length,
    [allItems],
  );
  const pendingCount = totalCount - completedCount;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const mandatoryCount = useMemo(
    () => allItems.filter((i) => i.isMandatory).length,
    [allItems],
  );
  const mandatoryCompleted = useMemo(
    () => allItems.filter((i) => i.isMandatory && i.isCompleted).length,
    [allItems],
  );

  // Filtered items per active view
  const currentStage = useMemo(
    () => stages.find((s) => s.id === activeStageId) || stages[0],
    [stages, activeStageId],
  );

  const filteredItems = useMemo(() => {
    if (!currentStage) {
      return [];
    }

    return currentStage.items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sectionRef.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

      if (filterType === 'completed') {
        return item.isCompleted;
      }

      if (filterType === 'pending') {
        return !item.isCompleted;
      }

      if (filterType === 'mandatory') {
        return item.isMandatory;
      }

      return true;
    });
  }, [currentStage, searchQuery, filterType]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-card border-border shadow-xs flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                {t(
                  'mark_progress_title',
                  'Development Officer Progress Checklist',
                )}
              </h1>
              {isDO ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t('do_authorized', 'DO Authorized')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Lock className="h-3.5 w-3.5" />
                  {t('read_only_mode', 'Read Only Mode ({role})').replace(
                    '{role}',
                    userRole,
                  )}
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {t(
                'mark_progress_subtitle',
                'Track statutory Land Acquisition Act milestones, mark task completion, and update stage readiness.',
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.visit('/projects')}
            className="border-border hover:bg-muted text-foreground flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back_to_projects', 'Projects')}
          </button>
          <button
            onClick={handleSaveProgress}
            disabled={!isDO || saving || !selectedProjectId}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving
              ? t('saving', 'Saving...')
              : t('save_progress', 'Save Progress')}
          </button>
        </div>
      </div>

      {/* Non-DO Notice Banner */}
      {!isDO && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
          <Info className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-semibold">{t('notice', 'Notice')}: </span>
            {t(
              'non_do_checklist_info',
              'You are viewing the Development Officer progress checklist in read-only mode. Only assigned Development Officers (DO) can toggle checklist items, upload files, or update remarks.',
            )}
          </div>
        </div>
      )}

      {/* Project Selector Card */}
      <div className="bg-card border-border shadow-xs rounded-xl border p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            <label className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <FolderKanban className="text-primary h-4 w-4" />
              {t('select_acquisition_project', 'Select Acquisition Project')}
            </label>
            {loadingProjects ? (
              <div className="border-border bg-input-background text-muted-foreground flex h-10 items-center justify-center rounded-lg border text-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('loading_projects', 'Loading projects...')}
              </div>
            ) : (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="border-border bg-input-background text-foreground focus:ring-primary/40 focus:border-primary w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2"
              >
                {projectsList.length === 0 ? (
                  <option value="">
                    {t('no_projects_found', 'No projects found')}
                  </option>
                ) : (
                  projectsList.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.projectId ? `${proj.projectId} - ` : ''}
                      {proj.title || proj.name}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {selectedProject && (
            <div className="border-border grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3 lg:col-span-2 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t('project_name', 'Project Name')}
                </span>
                <span
                  className="text-foreground mt-0.5 block truncate text-sm font-semibold"
                  title={selectedProject.title || selectedProject.name}
                >
                  {selectedProject.title || selectedProject.name}
                </span>
                <span className="text-muted-foreground mt-1 block text-xs">
                  ID: {selectedProject.projectId || selectedProject.id}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  {t('requesting_institution', 'Institution')}
                </span>
                <span className="text-foreground mt-0.5 block truncate text-sm font-semibold">
                  {selectedProject.institution || 'N/A'}
                </span>
                <span className="text-muted-foreground mt-1 block text-xs">
                  Area:{' '}
                  {selectedProject.fullLandArea ||
                    (selectedProject.landAreaAcers
                      ? `${selectedProject.landAreaAcers} Acers`
                      : 'N/A')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block text-xs">
                  {t('workflow_status', 'Status')}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge
                    status={
                      selectedProject.caseStatus ||
                      selectedProject.status ||
                      'draft'
                    }
                  />
                  {selectedProject.doStatus && (
                    <span className="bg-muted text-foreground rounded px-2 py-0.5 text-xs font-medium">
                      DO: {selectedProject.doStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overview Stat Cards & Overall Progress Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: Progress Percent */}
        <div className="bg-card border-border shadow-xs flex flex-col justify-between rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              {t('overall_completion', 'Overall Completion')}
            </span>
            <span className="bg-primary/10 text-primary rounded-lg p-2">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-foreground text-2xl font-bold">
                {progressPercent}%
              </span>
              <span className="text-muted-foreground text-xs">
                {completedCount} / {totalCount} {t('tasks', 'tasks')}
              </span>
            </div>
            <div className="bg-muted mt-2 h-2.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stat 2: Completed Milestones */}
        <div className="bg-card border-border shadow-xs flex flex-col justify-between rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              {t('completed_tasks', 'Completed Tasks')}
            </span>
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <CheckSquare className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-foreground text-2xl font-bold">
              {completedCount}
            </span>
            <span className="text-muted-foreground mt-1 block text-xs">
              {t(
                'out_of_total_milestones',
                'out of {total} total checklist items',
              ).replace('{total}', String(totalCount))}
            </span>
          </div>
        </div>

        {/* Stat 3: Pending Tasks */}
        <div className="bg-card border-border shadow-xs flex flex-col justify-between rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              {t('pending_tasks', 'Pending Tasks')}
            </span>
            <span className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-foreground text-2xl font-bold">
              {pendingCount}
            </span>
            <span className="text-muted-foreground mt-1 block text-xs">
              {t('remaining_for_officer', 'remaining for DO verification')}
            </span>
          </div>
        </div>

        {/* Stat 4: Mandatory Compliance */}
        <div className="bg-card border-border shadow-xs flex flex-col justify-between rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              {t('mandatory_statutory', 'Statutory Mandatory')}
            </span>
            <span className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-foreground text-2xl font-bold">
                {mandatoryCompleted} / {mandatoryCount}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {mandatoryCount > 0
                  ? Math.round((mandatoryCompleted / mandatoryCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <span className="text-muted-foreground mt-1 block text-xs">
              {t(
                'mandatory_act_requirements',
                'mandatory LAA clauses fulfilled',
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Checklist Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar: Workflow Stages Navigation */}
        <div className="space-y-2 lg:col-span-1">
          <h3 className="text-muted-foreground mb-3 px-2 text-xs font-semibold uppercase tracking-wider">
            {t('acquisition_stages', 'Acquisition Workflow Stages')}
          </h3>
          <div className="space-y-1.5">
            {stages.map((stage) => {
              const stageCompletedCount = stage.items.filter(
                (i) => i.isCompleted,
              ).length;
              const stageTotalCount = stage.items.length;
              const isStageFinished =
                stageTotalCount > 0 && stageCompletedCount === stageTotalCount;
              const isActive = stage.id === activeStageId;

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`border-border flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    isActive
                      ? 'bg-primary/10 border-primary text-primary shadow-xs font-semibold'
                      : 'bg-card text-foreground hover:bg-muted/60'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isStageFinished
                          ? 'bg-emerald-500 text-white'
                          : isActive
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isStageFinished ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        stage.id
                      )}
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-semibold">
                        {stage.name}
                      </span>
                      <span className="text-muted-foreground block truncate text-[11px]">
                        {stage.actSection}
                      </span>
                    </div>
                  </div>
                  <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                    {stageCompletedCount}/{stageTotalCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: Items Checklist for Active Stage */}
        <div className="space-y-4 lg:col-span-3">
          {/* Stage Header Card */}
          <div className="bg-card border-border shadow-xs space-y-4 rounded-xl border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="bg-primary/10 text-primary rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                  Stage {currentStage.id}: {currentStage.actSection}
                </span>
                <h2 className="text-foreground mt-2 text-lg font-bold">
                  {currentStage.name}
                </h2>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {currentStage.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkStageComplete(currentStage.id)}
                  disabled={!isDO}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400"
                  title={t(
                    'mark_all_stage_complete',
                    'Mark All Items Complete',
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t('mark_stage_complete', 'Complete All')}
                </button>
              </div>
            </div>

            {/* Controls Bar: Search & Filter Tabs */}
            <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="relative min-w-[200px] flex-1">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t(
                    'search_checklist',
                    'Search checklist items or section...',
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-border bg-input-background text-foreground focus:ring-primary/40 focus:border-primary w-full rounded-lg border py-1.5 pl-9 pr-3 text-xs transition-colors focus:outline-none focus:ring-2"
                />
              </div>

              <div className="bg-muted/60 flex items-center gap-1 rounded-lg p-1">
                {(['all', 'completed', 'pending', 'mandatory'] as const).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`shadow-xs rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        filterType === type
                          ? 'bg-card text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t(`filter_${type}`, type)}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Stage Documents Card / Section (Optional, supports multiple documents) */}
            <div className="border-border/60 bg-muted/20 border-t pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Paperclip className="text-primary h-4 w-4" />
                  <h3 className="text-foreground text-xs font-semibold uppercase tracking-wider">
                    {t('stage_documents', 'Stage Documents (Optional)')}
                  </h3>
                  {currentStage.attachedFiles &&
                    currentStage.attachedFiles.length > 0 && (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                        {currentStage.attachedFiles.length}
                      </span>
                    )}
                </div>

                {isDO && (
                  <label className="border-border bg-card hover:bg-muted text-foreground shadow-2xs inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors">
                    {uploadingStageId === currentStage.id ? (
                      <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="text-primary h-4 w-4" />
                    )}
                    <span>
                      {uploadingStageId === currentStage.id
                        ? t('uploading', 'Uploading...')
                        : t('attach_stage_document', 'Upload Stage Document')}
                    </span>
                    <input
                      type="file"
                      disabled={uploadingStageId === currentStage.id}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleStageFileUpload(
                            currentStage.id,
                            e.target.files[0],
                          );
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Stage Attached Files List */}
              {currentStage.attachedFiles &&
              currentStage.attachedFiles.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {currentStage.attachedFiles.map((fileObj) => (
                    <div
                      key={fileObj.id}
                      className="border-border bg-card shadow-2xs flex items-center justify-between gap-3 rounded-lg border p-2.5 text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span
                            className="text-foreground block truncate text-xs font-semibold"
                            title={fileObj.name}
                          >
                            {fileObj.name}
                          </span>
                          <span className="text-muted-foreground block text-[10px]">
                            {formatBytes(fileObj.size)} •{' '}
                            {fileObj.uploadedAt
                              ? new Date(
                                  fileObj.uploadedAt,
                                ).toLocaleDateString()
                              : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleFileDownload(fileObj)}
                          className="border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-md border p-1.5 transition-colors"
                          title={t('download_file', 'Download File')}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        {isDO && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStageFileDelete(currentStage.id, fileObj.id)
                            }
                            className="border-border text-muted-foreground rounded-md border p-1.5 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                            title={t('delete_file', 'Delete File')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground/70 mt-2 text-xs italic">
                  {t(
                    'no_stage_documents',
                    'No stage documents uploaded yet. You can attach multiple files relevant to this stage.',
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Checklist Items Card List */}
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="bg-card border-border flex h-48 flex-col items-center justify-center rounded-xl border p-6 text-center">
                <CheckSquare className="text-muted-foreground/40 mb-2 h-10 w-10" />
                <p className="text-muted-foreground text-sm font-medium">
                  {t(
                    'no_checklist_items_match',
                    'No checklist items match the criteria.',
                  )}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="text-primary mt-2 text-xs font-semibold hover:underline"
                >
                  {t('clear_filters', 'Clear filters')}
                </button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-card shadow-xs rounded-xl border p-4 transition-all ${
                    item.isCompleted
                      ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Interactive Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.id)}
                      disabled={!isDO}
                      className={`focus:ring-primary/40 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all focus:outline-none focus:ring-2 ${
                        item.isCompleted
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'border-muted-foreground/50 hover:border-primary border-2 text-transparent'
                      } ${!isDO ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      title={
                        isDO
                          ? t('click_to_toggle', 'Click to toggle completion')
                          : t(
                              'only_do_can_edit',
                              'Only DO can toggle completion',
                            )
                      }
                    >
                      {item.isCompleted ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <Square className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <h4 className="text-foreground truncate text-sm font-semibold">
                            {item.title}
                          </h4>
                          {item.isMandatory && (
                            <span className="shrink-0 rounded border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                              {t('mandatory', 'Mandatory')}
                            </span>
                          )}
                        </div>

                        <span className="border-border bg-muted text-muted-foreground shrink-0 rounded px-2 py-0.5 font-mono text-[11px]">
                          {item.sectionRef}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {item.description}
                      </p>

                      {/* Completion Info */}
                      {item.isCompleted && (
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <span className="flex items-center gap-1 font-medium">
                            <User className="h-3 w-3" />
                            {item.completedBy}
                          </span>
                          {item.completedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.completedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Remarks Input */}
                      <div>
                        <input
                          type="text"
                          placeholder={t(
                            'add_remarks_optional',
                            'Add DO officer remarks / notes...',
                          )}
                          value={item.remarks || ''}
                          onChange={(e) =>
                            handleRemarkChange(item.id, e.target.value)
                          }
                          disabled={!isDO}
                          className="border-border bg-input-background text-foreground focus:ring-primary/40 focus:border-primary w-full rounded-lg border px-3 py-1 text-xs transition-colors focus:outline-none focus:ring-1 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Save Bar */}
          <div className="bg-card border-border shadow-xs flex items-center justify-between rounded-xl border p-4">
            <div className="text-muted-foreground text-xs">
              {lastSavedTime ? (
                <span>
                  {t('last_saved_at', 'Last saved at')}{' '}
                  <strong className="text-foreground">{lastSavedTime}</strong>
                </span>
              ) : (
                <span>
                  {t(
                    'unsaved_changes_note',
                    'Save checklist after updating items.',
                  )}
                </span>
              )}
            </div>

            <button
              onClick={handleSaveProgress}
              disabled={!isDO || saving || !selectedProjectId}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving
                ? t('saving', 'Saving...')
                : t('save_progress', 'Save Progress')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

MarkProgress.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
